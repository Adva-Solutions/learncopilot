import { verifyAdmin } from './auth.js';
import { checkOrigin } from '../lib/csrf.js';

const API_BASE = 'https://listenlabs.ai/api/public';
const API_KEY = process.env.LISTEN_LABS_API_KEY;

async function llFetch(path) {
  if (!API_KEY) throw new Error('LISTEN_LABS_API_KEY environment variable is not configured');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'x-api-key': API_KEY },
  });
  if (!res.ok) throw new Error(`Listen Labs API error: ${res.status}`);
  return res.json();
}

function parseTags(tags) {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string' && tags.trim()) return tags.split(',').map(t => t.trim()).filter(Boolean);
  return [];
}

function parseBullets(bullets) {
  if (Array.isArray(bullets)) return bullets;
  if (typeof bullets === 'string' && bullets.trim()) {
    return bullets.split('\n').map(b => b.replace(/^[-\u2022]\s*/, '').trim()).filter(Boolean);
  }
  return [];
}

function normalizeDepartment(raw) {
  if (!raw) return null;
  const d = raw.toLowerCase().trim()
    .replace(/\s+department$/i, '')
    .replace(/\s+team$/i, '')
    .replace(/\s+group$/i, '')
    .replace(/\s+div(ision)?$/i, '')
    .trim();

  // Map common variations to canonical names
  const mappings = [
    { canonical: 'Finance', patterns: ['finance', 'accounting', 'finance and accounting', 'finance & accounting', 'financial', 'treasury', 'controller'] },
    { canonical: 'Engineering', patterns: ['engineering', 'software', 'development', 'r&d', 'research and development', 'tech', 'technology'] },
    { canonical: 'Sales', patterns: ['sales', 'business development', 'revenue', 'commercial'] },
    { canonical: 'Marketing', patterns: ['marketing', 'brand', 'communications', 'comms', 'creative'] },
    { canonical: 'Operations', patterns: ['operations', 'ops', 'supply chain', 'logistics', 'procurement'] },
    { canonical: 'Human Resources', patterns: ['human resources', 'hr', 'people', 'talent', 'people ops', 'people operations'] },
    { canonical: 'Legal', patterns: ['legal', 'compliance', 'regulatory', 'legal and compliance'] },
    { canonical: 'Product', patterns: ['product', 'product management', 'pm'] },
    { canonical: 'Customer Success', patterns: ['customer success', 'customer service', 'support', 'client services', 'cs'] },
    { canonical: 'IT', patterns: ['it', 'information technology', 'infrastructure', 'helpdesk', 'it support'] },
    { canonical: 'Executive', patterns: ['executive', 'leadership', 'c-suite', 'management', 'elt'] },
    { canonical: 'Data', patterns: ['data', 'analytics', 'data science', 'business intelligence', 'bi'] },
    { canonical: 'Design', patterns: ['design', 'ux', 'ui', 'user experience'] },
  ];

  for (const { canonical, patterns } of mappings) {
    if (patterns.some(p => d === p || new RegExp('\\b' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(d))) return canonical;
  }

  // If no match, title-case the original
  return raw.trim().replace(/\b\w/g, c => c.toUpperCase());
}

function extractParticipants(responses) {
  const participants = [];
  for (const r of responses) {
    const tags = parseTags(r.tags);
    const participant = {
      tags,
      tagline: r.tagline || '',
      bulletSummary: parseBullets(r.bullet_summary),
      otherRemarks: r.other_remarks || '',
      qualityScore: r.quality_score || null,
      name: null,
      role: null,
      department: null,
      aiExperience: null,
      tools: [],
      painPoints: [],
      wishlist: [],
      dailyWork: [],
    };

    // Extract role/department from tags (format: "Role, Department, Location")
    if (tags.length >= 1) participant.role = tags[0];
    if (tags.length >= 2) participant.department = normalizeDepartment(tags[1]);

    const answers = r.answers_array || [];
    for (const a of answers) {
      const q = (a.question || '').toLowerCase();
      const ans = a.answer || '';

      // Name, role, department
      if (q.includes('name') && (q.includes('role') || q.includes('department') || q.includes('team'))) {
        participant.name = ans.split(',')[0].trim();
      }

      // AI experience
      if (q.includes('experience') && q.includes('ai')) {
        participant.aiExperience = ans;
      }

      // Tools used
      if (q.includes('tools') || q.includes('software') || q.includes('which ai')) {
        participant.tools.push(ans);
      }

      // Daily work / what they did yesterday
      if (q.includes('yesterday') || q.includes('walk me through') || q.includes('day-to-day')) {
        participant.dailyWork.push(ans);
      }

      // Pain points
      if (q.includes('tedious') || q.includes('inefficient') || q.includes('holding you back') || q.includes('better way')) {
        participant.painPoints.push(ans);
      }

      // Wishlist
      if (q.includes('hand off') || q.includes('want addressed') || q.includes('specific')) {
        participant.wishlist.push(ans);
      }
    }

    participants.push(participant);
  }
  return participants;
}

export default async function handler(req, res) {
  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { action, id } = req.query;

  if (action === 'list') {
    try {
      const studies = await llFetch('/list_surveys');
      return res.status(200).json({ studies });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch studies', detail: e.message });
    }
  }

  if (action === 'study' && id) {
    try {
      const [questionsData, responses] = await Promise.all([
        llFetch(`/studies/${id}/questions`),
        llFetch(`/responses/${id}?per_page=100`),
      ]);

      const questions = questionsData.questions || questionsData;
      const responseList = Array.isArray(responses) ? responses : [];

      const participants = extractParticipants(responseList);

      // Roles from tags (tag[0] is typically the role)
      const roleCounts = {};
      participants.forEach(p => {
        if (p.role) roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
      });
      const roles = Object.entries(roleCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

      // AI experience
      const experienceLevels = {};
      participants.forEach(p => {
        if (p.aiExperience) {
          const level = p.aiExperience.split(/[\u2014\u2013]/)[0].trim();
          experienceLevels[level] = (experienceLevels[level] || 0) + 1;
        }
      });

      // Tools mentioned
      const allTools = new Set();
      const toolPattern = /\b(ChatGPT|Claude|Copilot|Co-?pilot|Excel|Google\s+Sheets|Slack|Notion|Salesforce|HubSpot|Jira|Confluence|Teams|Zoom|Word|PowerPoint|Outlook|Gmail|SAP|Oracle|Sage(?:\s+Intacct)?|Tipalti|Navan|QuickBooks|Xero|Tableau|Power\s*BI|Figma|Canva|Midjourney|DALL-?E|Gemini|Perplexity|GPT-?4|Cursor|GitHub\s+Copilot|Grammarly|Vendr|Asana|Monday|Linear|Airtable)\b/gi;
      participants.forEach(p => {
        [...p.tools, ...p.dailyWork].forEach(t => {
          const matches = t.match(toolPattern);
          if (matches) matches.forEach(m => allTools.add(m));
        });
      });

      // Top tags across all
      const tagCounts = {};
      participants.forEach(p => {
        p.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
      });
      const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);

      // Build rich raw data for AI personalization — include EVERYTHING
      const rawResponses = responseList.map(r => ({
        tags: parseTags(r.tags),
        tagline: r.tagline || '',
        bullet_summary: parseBullets(r.bullet_summary),
        other_remarks: r.other_remarks || '',
        answers_array: (r.answers_array || []).map(a => ({
          question: a.question,
          answer: a.answer,
        })),
      }));

      return res.status(200).json({
        questions: (Array.isArray(questions) ? questions : []).map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
        })),
        responseCount: responseList.length,
        participants,
        roles,
        experienceLevels,
        toolsUsed: [...allTools],
        topTags,
        rawResponses,
      });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch study data', detail: e.message });
    }
  }

  return res.status(400).json({ error: 'Invalid action. Use ?action=list or ?action=study&id=X' });
}
