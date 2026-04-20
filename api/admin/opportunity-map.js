import Anthropic from '@anthropic-ai/sdk';
import { getRedis } from '../lib/redis.js';
import { verifyAdmin } from './auth.js';
import { M365_NATIVE_APPS, COPILOT_CONNECTORS, classifyTool } from '../lib/m365-apps.js';
import { isAllowed, filterSources } from '../lib/source-allowlist.js';
import { searchTavily, batchSearchTavily } from '../lib/tavily.js';
import { validate } from '../lib/validate-opp-map.js';
import { checkOrigin } from '../lib/csrf.js';

export const config = { maxDuration: 300 };

const OPUS_MODEL = 'claude-opus-4-5-20250929';

const LISTEN_LABS_BASE = 'https://listenlabs.ai/api/public';

// Regex for extracting tool mentions from interview/transcript text.
// Covers common enterprise tools, AI assistants, M365 apps, and popular SaaS.
const TOOL_PATTERN = /\b(ChatGPT|Claude|Copilot|Co-?pilot|Excel|Google\s+Sheets|Slack|Notion|Salesforce|HubSpot|Jira|Confluence|Teams|Zoom|Word|PowerPoint|Outlook|Gmail|SAP|Oracle|Sage(?:\s+Intacct)?|Tipalti|Navan|QuickBooks|Xero|Tableau|Power\s*BI|Figma|Canva|Midjourney|DALL-?E|Gemini|Perplexity|GPT-?4|Cursor|GitHub\s+Copilot|Grammarly|Vendr|Asana|Monday(?:\.com)?|Linear|Airtable|SharePoint|OneDrive|OneNote|Planner|Loop|Stream|ServiceNow|Power\s+Automate|Dynamics\s+365|Adobe\s+Acrobat|Trello|Miro)\b/gi;

/* ---------- helpers ---------- */

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`${name} environment variable is not configured`);
  return val;
}

async function llFetch(path) {
  const key = requireEnv('LISTEN_LABS_API_KEY');
  const res = await fetch(`${LISTEN_LABS_BASE}${path}`, {
    headers: { 'x-api-key': key },
  });
  if (!res.ok) throw new Error(`Listen Labs API error: ${res.status} on ${path}`);
  return res.json();
}

function slugToClientId(slug) {
  return `client-${slug}`;
}

/* ---------- Stage 1: Fetch Listen Labs studies ---------- */

async function fetchStudies(studyIds) {
  if (process.env.OPPORTUNITY_MAP_MOCK === '1') {
    return { questions: [], responses: [] };
  }

  const fetches = studyIds.map(async (id) => {
    const [questionsData, responsesData] = await Promise.all([
      llFetch(`/studies/${id}/questions`),
      llFetch(`/responses/${id}?per_page=500`),
    ]);
    const questions = questionsData.questions || questionsData || [];
    const responses = Array.isArray(responsesData) ? responsesData : [];
    return { questions: Array.isArray(questions) ? questions : [], responses };
  });

  const results = await Promise.all(fetches);

  // Merge: deduplicate questions by id, concatenate responses
  const questionMap = new Map();
  const allResponses = [];
  for (const { questions, responses } of results) {
    for (const q of questions) {
      if (q.id && !questionMap.has(q.id)) questionMap.set(q.id, q);
    }
    allResponses.push(...responses);
  }

  return { questions: [...questionMap.values()], responses: allResponses };
}

/* ---------- Stage 2: Extract & classify tools ---------- */

function extractAndClassifyTools(responses, granolaTranscript) {
  // Gather all text to scan
  const textBlocks = [];
  for (const r of responses) {
    const answers = r.answers_array || [];
    for (const a of answers) {
      if (a.answer) textBlocks.push(a.answer);
    }
    if (r.other_remarks) textBlocks.push(r.other_remarks);
    if (r.tagline) textBlocks.push(r.tagline);
    if (r.bullet_summary) {
      const bs = Array.isArray(r.bullet_summary)
        ? r.bullet_summary.join(' ')
        : String(r.bullet_summary);
      textBlocks.push(bs);
    }
  }
  if (granolaTranscript) textBlocks.push(granolaTranscript);

  const fullText = textBlocks.join('\n');

  // Extract unique tool names
  const mentionedSet = new Set();
  const matches = fullText.match(TOOL_PATTERN) || [];
  for (const m of matches) {
    // Normalize to a single canonical form
    mentionedSet.add(m.replace(/\s+/g, ' ').trim());
  }

  const classified = [];   // { tool, status, detail, sourceId }
  const unknowns = [];     // tool names needing Tavily search

  for (const raw of mentionedSet) {
    const result = classifyTool(raw);
    if (result) {
      classified.push(result);
    } else {
      unknowns.push(raw);
    }
  }

  return { classified, unknowns, fullText };
}

/* ---------- Stage 3: Tavily pre-search ---------- */

async function runPreSearch(unknowns, industry) {
  const queries = [];

  // Tool searches — cap at 12
  const toolSlice = unknowns.slice(0, 12);
  for (const tool of toolSlice) {
    queries.push({
      label: `tool:${tool}`,
      query: `"Microsoft Copilot connector ${tool} site:learn.microsoft.com OR site:microsoft.com"`,
    });
  }

  // Industry benchmark searches — cap at 3
  if (industry) {
    const benchmarkQueries = [
      `"AI adoption ${industry} 2026 benchmark report"`,
      `"Microsoft 365 Copilot ${industry} ROI case study"`,
      `"digital transformation ${industry} 2026 statistics"`,
    ];
    for (const q of benchmarkQueries) {
      queries.push({ label: 'benchmark', query: q });
    }
  }

  if (queries.length === 0) return { searchResults: [], sources: [] };

  const raw = await batchSearchTavily(queries, { timeout: 5000 });

  // Filter through allowlist
  const sources = [];
  const sourceIdMap = new Map();
  const searchResults = [];

  for (const entry of raw) {
    const cls = entry.label === 'benchmark' ? 'benchmark' : 'microsoft';
    const allowed = (entry.results || []).filter((r) => isAllowed(r.url, cls));

    for (const r of allowed) {
      const sid = `src-search-${sources.length + 1}`;
      if (!sourceIdMap.has(r.url)) {
        sourceIdMap.set(r.url, sid);
        sources.push({ id: sid, title: r.title, url: r.url });
      }
    }

    searchResults.push({
      label: entry.label,
      query: entry.query,
      results: allowed.map((r) => ({
        ...r,
        sourceId: sourceIdMap.get(r.url),
      })),
      error: entry.error || null,
    });
  }

  return { searchResults, sources };
}

/* ---------- Stage 4: Claude Opus call ---------- */

const SYSTEM_PROMPT = `You produce a single JSON document describing a Microsoft 365 Copilot Opportunity Map for one workshop client.

INPUT: (a) interview transcripts from one or more Listen Labs studies; (b) optionally, a Granola meeting transcript from a discovery session; (c) the list of M365 native apps with built-in Copilot; (d) a curated list of known Copilot connectors with availability status; (e) pre-fetched web search results from approved sources.

OUTPUT: valid JSON matching the schema below. No prose, no markdown, no code fences, no text outside the JSON.

RULES:
1. Every opportunity must be grounded in a verbatim quote from the interviews or meeting transcript (evidence.quote). Set evidence.source to "listen-labs" or "granola" accordingly.
2. Every web-research claim must reference a sourceId from the provided search-context block. Do NOT invent URLs or sourceIds.
3. copilotFeatures must only contain values from this set: Chat, Custom Instructions, Notebooks, Pages, Researcher, Analyst, Outlook, Word, Excel, PowerPoint, Teams, SharePoint, OneDrive, Agent Builder, Copilot Studio, Workflow Agents, Web Search, File Upload, Voice.
4. For each opportunity, include a workshopLesson field mapping to the most relevant lesson (format: "module:lessonIndex"). Available modules and lessons:
   - chat:0 Know Your Way Around, chat:1 Custom Instructions, chat:2 Knowledge Notebooks, chat:3 Pages, chat:4 Search, chat:5 Create/Bonus
   - apps:0 Outlook, apps:1 Word, apps:2 Excel, apps:3 PowerPoint, apps:4 Teams
   - agents:0 What's an Agent, agents:1 Browse Agents, agents:2 Researcher, agents:3 Analyst, agents:4 Write Like Me, agents:5 Report Writer, agents:6 Workflow Agents, agents:7 Best Practices, agents:8 Custom Agent Challenge
5. Tool status: emit a toolStatus entry for each distinct tool mentioned. M365 native apps are always "now". Use the pre-classified connector list verbatim where applicable.
6. Maturity dimensions must be exactly: "Tooling & Integration Readiness", "Workflow Clarity", "AI Skill & Adoption", "Change Appetite". Score 0.0-5.0; onTrack = 3.0.
7. Produce 8-15 opportunities. Prioritize ones grounded in specific, concrete pain points with clear Copilot features.
8. Horizon meanings: "now" = achievable with current M365 Copilot license; "next" = requires connector, migration, or preview feature; "later" = requires custom development or unreleased features.
9. impact \u2208 1..5, difficulty \u2208 1..5, horizon \u2208 {"now","next","later"}, confidence \u2208 {"high","medium","low"}.

SCHEMA:
{
  "opportunities": [ { id, title, department, evidence:{quote,participantRole,source}, copilotApproach, copilotFeatures[], requiredTools[], impact, difficulty, horizon, horizonReason, confidence, workshopLesson } ],
  "maturity": { "dimensions": [ {name,score,onTrack,rationale,signalQuotes[]} ], "peerBenchmark": null | {industry,sizeCohort,summary,sourceIds[]} },
  "toolStatus": [ {tool,status,detail,sourceId} ],
  "sources": []
}`;

async function callClaude(classified, searchResults, searchSources, llPayload, slug, clientName, granolaTranscript) {
  const apiKey = requireEnv('ANTHROPIC_API_KEY');
  const anthropic = new Anthropic({ apiKey });

  // Build content block 1: reference data (non-ephemeral)
  const nativeAppsText = `M365 Native Apps (all status "now"):\n${M365_NATIVE_APPS.map((a) => `- ${a}`).join('\n')}`;
  const connectorsText = `Known Copilot Connectors:\n${COPILOT_CONNECTORS.map((c) => `- ${c.name}: status="${c.status}", detail="${c.detail}", sourceId=${c.sourceId || 'null'}`).join('\n')}`;
  const preclassifiedText = `Pre-classified tools from interviews:\n${classified.map((t) => `- ${t.tool}: status="${t.status}", detail="${t.detail}", sourceId=${t.sourceId || 'null'}`).join('\n')}`;

  const refBlock = [nativeAppsText, connectorsText, preclassifiedText].join('\n\n');

  // Build content block 2: ephemeral data (interview + search + Granola)
  const searchCtx = searchResults.length > 0
    ? `SEARCH CONTEXT:\n${searchResults.map((sr) => {
        const items = sr.results.map((r) => `  [${r.sourceId}] ${r.title}\n  ${r.url}\n  ${r.content}`).join('\n');
        return `Query (${sr.label}): ${sr.query}\n${items || '  (no results)'}`;
      }).join('\n\n')}`
    : 'SEARCH CONTEXT: (none)';

  const sourcesList = searchSources.length > 0
    ? `SOURCES:\n${searchSources.map((s) => `- ${s.id}: ${s.title} (${s.url})`).join('\n')}`
    : 'SOURCES: (none)';

  const llText = JSON.stringify(llPayload);

  let ephemeralParts = [
    `Workshop: ${clientName} (slug: ${slug})`,
    searchCtx,
    sourcesList,
    `<untrusted_interview_data>\n${llText}\n</untrusted_interview_data>`,
  ];

  if (granolaTranscript) {
    ephemeralParts.push(`<untrusted_meeting_transcript>\n${granolaTranscript}\n</untrusted_meeting_transcript>`);
  }

  const ephemeralBlock = ephemeralParts.join('\n\n');

  const response = await anthropic.messages.create({
    model: OPUS_MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: refBlock },
          { type: 'text', text: ephemeralBlock, cache_control: { type: 'ephemeral' } },
        ],
      },
    ],
  });

  // Extract text from response
  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  return text;
}

/* ---------- Stage 5: Parse response ---------- */

function parseResponse(raw) {
  // Try direct parse first
  try {
    return JSON.parse(raw);
  } catch { /* fall through */ }

  // Fallback: extract JSON object via regex
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch { /* fall through */ }
  }

  throw new Error('Failed to parse Claude response as JSON');
}

/* ---------- Stage 6: Stamp metadata ---------- */

function stampMetadata(doc, slug, clientName, studyIds, granolaTranscript, searchSources) {
  doc.clientId = slugToClientId(slug);
  doc.clientName = clientName;
  doc.generatedAt = new Date().toISOString();
  doc.sourceStudyIds = studyIds;
  doc.hasGranolaTranscript = Boolean(granolaTranscript);

  // Merge pre-fetched sources defensively
  const existingSrcIds = new Set((doc.sources || []).map((s) => s.id).filter(Boolean));
  for (const s of searchSources) {
    if (!existingSrcIds.has(s.id)) {
      doc.sources = doc.sources || [];
      doc.sources.push(s);
      existingSrcIds.add(s.id);
    }
  }

  // Add known source stubs
  const knownStubs = [
    {
      id: 'src-m365-native',
      title: 'Microsoft 365 Copilot built-in apps',
      url: 'https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview',
    },
    {
      id: 'src-copilot-connector',
      title: 'Copilot connectors and plugins',
      url: 'https://learn.microsoft.com/en-us/copilot/microsoft-365/extensibility/',
    },
  ];

  for (const stub of knownStubs) {
    if (!existingSrcIds.has(stub.id)) {
      doc.sources = doc.sources || [];
      doc.sources.push(stub);
      existingSrcIds.add(stub.id);
    }
  }

  return doc;
}

/* ---------- Handler ---------- */

export default async function handler(req, res) {
  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  const r = getRedis();

  /* ---- GET: read existing map from Redis ---- */
  if (req.method === 'GET') {
    const { slug } = req.query;
    if (!slug) {
      return res.status(400).json({ error: 'slug query parameter is required' });
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

    try {
      const raw = await r.get(`opportunityMap:${slug}`);
      if (!raw) {
        return res.status(404).json({ error: 'No opportunity map found for this slug' });
      }
      const map = JSON.parse(raw);
      return res.status(200).json({ map });
    } catch (e) {
      return res.status(500).json({ error: 'Redis error', detail: e.message });
    }
  }

  /* ---- POST: generate new map ---- */
  if (req.method === 'POST') {
    const { clientName, studyIds, granolaTranscript } = req.body || {};

    if (!clientName || typeof clientName !== 'string') {
      return res.status(400).json({ error: 'clientName is required' });
    }

    if (!Array.isArray(studyIds) || studyIds.length === 0) {
      // Allow Granola-only mode
      if (!granolaTranscript) {
        return res.status(400).json({ error: 'At least one studyId or a granolaTranscript is required' });
      }
    }

    // Derive slug from clientName
    const slug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return res.status(400).json({ error: 'Could not derive valid slug from clientName' });
    }

    try {
      // Fetch client record for industry (optional enrichment)
      let industry = null;
      try {
        const clientRaw = await r.get(`client:${slug}`);
        if (clientRaw) {
          const client = JSON.parse(clientRaw);
          industry = client.industry || null;
        }
      } catch { /* non-fatal */ }

      // Stage 1: Fetch Listen Labs studies
      const safeStudyIds = Array.isArray(studyIds) ? studyIds : [];
      const { questions, responses } = await fetchStudies(safeStudyIds);

      // Stage 2: Extract & classify tools
      const { classified, unknowns } = extractAndClassifyTools(responses, granolaTranscript);

      // Stage 3: Tavily pre-search
      const { searchResults, sources: searchSources } = await runPreSearch(unknowns, industry);

      // Stage 4: Claude Opus call
      const llPayload = { questions, responses };
      const rawResponse = await callClaude(
        classified,
        searchResults,
        searchSources,
        llPayload,
        slug,
        clientName,
        granolaTranscript,
      );

      // Stage 5: Parse response
      const parsed = parseResponse(rawResponse);

      // Stage 6: Stamp metadata
      const stamped = stampMetadata(parsed, slug, clientName, safeStudyIds, granolaTranscript, searchSources);

      // Stage 7: Validate + store
      const { ok, cleaned, drops } = validate(stamped);
      if (!ok) {
        return res.status(422).json({
          error: 'Generated map failed validation',
          drops,
        });
      }

      // Filter sources through allowlist
      cleaned.sources = cleaned.sources.filter((s) => {
        // Always keep known stubs
        if (s.id === 'src-m365-native' || s.id === 'src-copilot-connector') return true;
        // Filter the rest through allowlist (try both classes)
        return isAllowed(s.url, 'microsoft') || isAllowed(s.url, 'benchmark');
      });

      // Store in Redis
      await r.set(`opportunityMap:${slug}`, JSON.stringify(cleaned));

      return res.status(200).json({
        map: cleaned,
        drops,
        studyCount: safeStudyIds.length,
        searchOut: {
          toolSearches: searchResults.filter((sr) => sr.label.startsWith('tool:')).length,
          benchmarkSearches: searchResults.filter((sr) => sr.label === 'benchmark').length,
          totalSources: searchSources.length,
        },
      });
    } catch (e) {
      console.error('Opportunity map generation failed:', e);
      return res.status(500).json({ error: 'Generation failed', detail: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
