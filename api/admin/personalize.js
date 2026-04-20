import Anthropic from '@anthropic-ai/sdk';
import { verifyAdmin } from './auth.js';
import { checkOrigin } from '../lib/csrf.js';

const LESSON_META = {
  chat: [
    { id: 0, title: "Know Your Way Around" },
    { id: 1, title: "Custom Instructions & Memory" },
    { id: 2, title: "Build Your Knowledge Notebook" },
    { id: 3, title: "Copilot Pages" },
    { id: 4, title: "Copilot Search" },
    { id: 5, title: "Copilot Create" },
    { id: 6, title: "Bonus: Voice, Scheduling & Web Search" },
  ],
  apps: [
    { id: 0, title: "Outlook Copilot" },
    { id: 1, title: "Word Copilot" },
    { id: 2, title: "Excel Copilot" },
    { id: 3, title: "PowerPoint Copilot (Bonus)" },
    { id: 4, title: "Teams Copilot (Bonus)" },
  ],
  agents: [
    { id: 0, title: "What's an Agent?" },
    { id: 1, title: "Pre-Built Agents" },
    { id: 2, title: "Build Your Own Agent" },
    { id: 3, title: "Agent Best Practices" },
  ],
};

// ── Tool-reference scanning ──
const TOOL_NAMES = [
  'Outlook', 'Word', 'Excel', 'PowerPoint', 'Teams',
  'SharePoint', 'OneDrive', 'OneNote', 'Copilot Studio',
  'Power Automate', 'Power BI', 'Planner', 'Loop',
  'Dynamics 365', 'Viva', 'Yammer', 'Stream',
  'Salesforce', 'HubSpot', 'SAP', 'Oracle',
  'Workday', 'ServiceNow', 'NetSuite', 'Yardi', 'Epic',
  'Clio', 'QuickBooks', 'Xero', 'Sage', 'Tipalti',
  'Slack', 'Asana', 'Jira', 'Notion', 'Confluence',
  'Trello', 'Monday.com', 'Basecamp', 'Smartsheet',
  'Figma', 'Miro', 'Airtable', 'Zoom',
  'Gmail', 'Google Drive', 'Google Calendar', 'Google Sheets',
  'Dropbox', 'Box', 'DocuSign', 'Adobe Acrobat',
  'Tableau', 'Canva', 'Midjourney', 'ChatGPT', 'Claude',
];

function scanToolReferences(personalization, compressedBrief) {
  // Build set of tools confirmed in the interview brief
  const confirmedTools = new Set();
  if (compressedBrief) {
    for (const tool of TOOL_NAMES) {
      const regex = new RegExp('\\b' + tool.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      if (regex.test(compressedBrief)) confirmedTools.add(tool);
    }
  }

  const flags = [];
  const overrides = personalization.lessonOverrides || {};

  for (const course of Object.keys(overrides)) {
    const lessons = overrides[course] || {};
    for (const lessonId of Object.keys(lessons)) {
      const override = lessons[lessonId];
      const html = typeof override === 'string' ? override : (override?.implement || '');
      if (!html) continue;

      for (const tool of TOOL_NAMES) {
        const regex = new RegExp('\\b' + tool.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        if (regex.test(html)) {
          flags.push({
            course,
            lessonId,
            tool,
            confirmed: confirmedTools.has(tool),
          });
        }
      }
    }
  }

  return flags;
}

export default async function handler(req, res) {
  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clientName, departments, studyQuestions, responses } = req.body || {};
  if (!clientName) return res.status(400).json({ error: 'clientName required' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY environment variable is not configured' });

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // ── Step 1: Use Haiku to compress interview data into a compact brief ──
    let compressedBrief = '';
    if (responses && responses.length > 0) {
      let rawContext = '';
      responses.forEach((r, i) => {
        rawContext += `\nParticipant ${i + 1}:`;
        if (r.tagline) rawContext += ` "${r.tagline}"`;
        const tags = Array.isArray(r.tags) ? r.tags : (typeof r.tags === 'string' ? r.tags.split(',').map(t => t.trim()) : []);
        if (tags.length) rawContext += `\nRole/Dept: ${tags.join(', ')}`;
        const bullets = Array.isArray(r.bullet_summary) ? r.bullet_summary : (typeof r.bullet_summary === 'string' ? r.bullet_summary.split('\n').map(b => b.replace(/^[-\u2022]\s*/, '').trim()).filter(Boolean) : []);
        if (bullets.length) rawContext += '\n' + bullets.map(b => `- ${b}`).join('\n');
        if (r.other_remarks) rawContext += `\nNotes: ${r.other_remarks}`;
        (r.answers_array || []).forEach(a => {
          rawContext += `\n  Q: ${a.question}\n  A: ${a.answer}`;
        });
      });

      const compressMsg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Analyze these Microsoft Copilot workshop interview responses for ${clientName} and create a compact company brief. Extract:

1. Company description (what they do, their industry)
2. Consolidated department list — IMPORTANT: normalize department names (e.g., "Finance", "Finance and Accounting", "Finance Department", "Accounting" should all become "Finance"). List only unique, canonical department names.
3. Each participant's name, role, normalized department, and key responsibilities
4. CONFIRMED tools — software explicitly named by participants in their answers. Separate into two sub-lists:
   a) Microsoft 365 tools they actively use (Outlook, Word, Excel, PowerPoint, Teams, SharePoint, OneDrive, OneNote, Power BI, Power Automate, Copilot Studio, Loop, Planner)
   b) Other tools mentioned that are NOT part of Microsoft 365 (these may need data exported and brought into Copilot)
5. Main pain points and tedious tasks mentioned
6. Tasks they'd most want to hand off to AI
7. Current AI experience levels (aggregate: how many novice vs intermediate vs advanced)
8. Specific workflows and processes mentioned (e.g., month-end close, invoice approvals, data exports)

IMPORTANT: For item 4, only list tools that participants explicitly named. Do NOT infer or assume tools they might use. If a participant says "our CRM" without naming it, list it under "unknown CRM" not "Salesforce."

Be thorough but concise. Use bullet points. This brief will be used to personalize a Microsoft Copilot training workshop.

Interview data:
${rawContext}`
        }],
      });

      compressedBrief = compressMsg.content?.[0]?.text || '';
    }

    // ── Step 2: Use Sonnet to generate personalization from the compact brief ──
    const questionContext = studyQuestions && studyQuestions.length > 0
      ? '\nInterview questions: ' + studyQuestions.map(q => q.text || q).join('; ')
      : '';

    const userPrompt = `Personalize a Microsoft Copilot workshop for: ${clientName}
${departments && departments.length ? `Departments: ${departments.join(', ')}` : ''}
${questionContext}

## Company Brief from Interviews
${compressedBrief || 'No interview data available.'}

Generate a JSON object:
{
  "suggestedPassword": "${clientName.replace(/[^a-zA-Z]/g, '').toUpperCase()}AI!",
  "replacements": {
    "Apex Consulting": "${clientName}",
    // 5-10 more generic->specific replacements using their real terms and processes
  },
  "lessonOverrides": {
    "chat": {
      "<index>": { "implement": "<HTML>" }
    },
    "apps": {
      "<index>": { "implement": "<HTML>" }
    },
    "agents": {
      "<index>": { "implement": "<HTML>" }
    }
  }
}

RULES:
- Override "implement" tab for Chat lessons 1-5, Apps lessons 0-4, and Agents lessons 1-5 (0-indexed).
- HTML format: <h3> headings, <p> paragraphs, <div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>prompt here</code></div> for prompts. ALWAYS wrap the prompt text in an inner <code> tag so it inherits the monospace-light code styling across every course page.
- Tips: <div class="tip-box"><div class="tip-title">Pro Tip</div><p>text</p></div>
- Notes: <div class="note-box"><div class="note-title">Note</div><p>text</p></div>
- End each override with: <button class="mark-complete-btn" id="complete-btn-{index}" onclick="markComplete({index})">Mark Complete</button>
- Each override should have 2-3 exercises with realistic, specific prompts that reference actual participant workflows.

CRITICAL CONSTRAINTS — what's actually possible in this workshop:
- This workshop teaches Microsoft Copilot — the AI assistant built into Microsoft 365 apps (Outlook, Word, Excel, PowerPoint, Teams) and available as a standalone chat at copilot.microsoft.com.
- Copilot works natively with Microsoft 365 apps: Outlook, Word, Excel, PowerPoint, Teams, SharePoint, OneDrive, OneNote, Loop, Planner, and Power BI.
- Copilot Studio allows building custom agents/copilots that can connect to additional data sources.
- DO NOT assume or reference live integration with non-Microsoft industry-specific software (e.g., Yardi, SAP, Epic, Clio, QuickBooks, Workday, ServiceNow, NetSuite) unless it's through a Copilot Studio connector or Power Automate flow.
- When participants use industry-specific tools, frame them as the SOURCE of data that gets exported and brought into Microsoft 365 apps — not as a live integration. Example: "Export your monthly report from [their tool], then open it in Excel and ask Copilot to..."
- Exercises must be achievable using ONLY: Microsoft 365 Copilot features, Copilot chat (Work/Web mode), Copilot Pages, Copilot Studio, and standard M365 file operations.
- DO NOT generate exercises that say "connect Copilot to [industry tool]" unless it's a confirmed M365 integration.
- Workshop datasets are pre-loaded and available as download links. Reference them using their /mock-data/ paths as shown below.

## Available Workshop Datasets
When exercises reference sample data, use these specific files as download links (e.g., <a href="/mock-data/financials/oda-monthly-financials.csv" download>Monthly Financials</a>):
- /mock-data/financials/oda-monthly-financials.csv — 15 months of revenue, expenses, active projects, utilization
- /mock-data/financials/oda-project-tracking.csv — 10 active projects with phases, fees, hours, budget
- /mock-data/financials/oda-construction-costs.csv — cost breakdowns by trade across completed buildings
- /mock-data/staffing/oda-resource-allocation.csv — team assignments, utilization, skills
- /mock-data/emails/ — 6 email threads (consultant-coordination, client-scheduling, contract-redlines, pr-award-submission, permit-timeline, executive-travel)
- /mock-data/meeting-transcripts/ — 5 transcripts (Design-Review-March, Marketing-Strategy-Q2, Consultant-Coordination-CD, HR-Onboarding-Checkin, Client-Budget-Meeting)
- /mock-data/building-codes/ — NYC residential code reference + NYC vs Florida comparison
- /mock-data/proposals/ — RFP template, fee proposal template, case studies (Harbor View, Wynwood), AIA award narrative
- /mock-data/marketing/ — awards tracker, social media metrics, newsletter sample
- /mock-data/hr/ — employee handbook excerpt, onboarding checklist, recruiting pipeline
- /mock-data/executive/ — Q1 QBR document, travel itinerary template + raw input, property summaries
- /mock-data/contracts/ — sample contracts (residential, hospitality), ODA standard terms
- /mock-data/specifications/ — project spec excerpt, submittal log

TOOL REFERENCE RULES (STRICTLY ENFORCED):
- For M365 tools (Outlook, Word, Excel, PowerPoint, Teams, SharePoint), you MAY reference them directly since Copilot is built into these apps.
- NEVER reference a non-Microsoft tool UNLESS the Company Brief above EXPLICITLY lists it as a CONFIRMED tool used by participants.
- When the brief mentions a tool category without a specific product name, use the generic category: "your CRM," "your project management tool," "your accounting system," "your HR platform."
- If the brief lists a non-Microsoft tool, frame it as an export source: "Export your data from [tool], then open in Excel/Word and use Copilot to..."
- Keep personalization subtle and accurate. Focus on: company name, industry terminology, role-appropriate scenarios, and CONFIRMED workflows. Do NOT invent tool usage or system details.
- ZERO tolerance for hallucinated tool integrations. When in doubt, be generic.

Chat lessons: ${LESSON_META.chat.map(l => `${l.id}. ${l.title}`).join(', ')}
Apps lessons: ${LESSON_META.apps.map(l => `${l.id}. ${l.title}`).join(', ')}
Agents lessons: ${LESSON_META.agents.map(l => `${l.id}. ${l.title}`).join(', ')}

Return ONLY JSON. No markdown fences.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: 'You generate JSON personalization configs for Microsoft Copilot workshops. Keep personalization subtle and grounded — only reference tools, systems, and workflows that are EXPLICITLY confirmed in the interview data. For Microsoft 365 tools (Outlook, Word, Excel, PowerPoint, Teams, SharePoint), you may reference them directly since Copilot is built in. NEVER reference non-Microsoft tools unless the brief explicitly confirms the client uses them. When uncertain, use generic language: "your CRM" not "Salesforce", "your project tool" not "Asana." Focus on industry terminology, role-appropriate scenarios, and confirmed workflows. Frame non-M365 tools as export-then-import sources. Output only valid JSON.',
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = message.content?.[0]?.text;
    if (!text) return res.status(500).json({ error: 'AI returned empty response' });
    let personalization;
    try {
      personalization = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) personalization = JSON.parse(match[0]);
      else return res.status(500).json({ error: 'Failed to parse AI response', raw: text.slice(0, 500) });
    }

    // ── Post-generation validation: scan for tool references ──
    const toolFlags = scanToolReferences(personalization, compressedBrief);

    return res.status(200).json({ personalization, toolFlags });
  } catch (e) {
    return res.status(500).json({ error: 'AI generation failed', detail: e.message });
  }
}

export const config = {
  maxDuration: 300,
};
