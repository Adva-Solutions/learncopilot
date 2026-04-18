// Post-generation JSON validator for Copilot Opportunity Map. Never throws.

const HORIZON = new Set(['now', 'next', 'later']);
const TOOL_STATUS = new Set(['now', 'next', 'later', 'unverified']);
const CONFIDENCE = new Set(['high', 'medium', 'low']);

const KNOWN_COPILOT_FEATURES = new Set([
  // Chat module
  'Chat', 'Custom Instructions', 'Notebooks', 'Pages', 'Researcher', 'Analyst',
  // Apps module
  'Outlook', 'Word', 'Excel', 'PowerPoint', 'Teams', 'SharePoint', 'OneDrive',
  // Agents module
  'Agent Builder', 'Copilot Studio', 'Workflow Agents',
  // Cross-cutting
  'Web Search', 'File Upload', 'Voice',
]);

const REQUIRED_MATURITY_DIM_NAMES = new Set([
  'Tooling & Integration Readiness',
  'Workflow Clarity',
  'AI Skill & Adoption',
  'Change Appetite',
]);

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function isObj(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }

export function validate(doc) {
  const drops = [];

  if (!isObj(doc)) return { ok: false, cleaned: null, drops: [{ path: '$', reason: 'doc is not an object' }] };

  // Top-level required fields.
  const required = ['clientId', 'clientName', 'generatedAt', 'opportunities', 'maturity', 'toolStatus', 'sources'];
  for (const k of required) {
    if (!(k in doc)) return { ok: false, cleaned: null, drops: [{ path: `$.${k}`, reason: 'missing required field' }] };
  }
  if (!Array.isArray(doc.opportunities)) return { ok: false, cleaned: null, drops: [{ path: '$.opportunities', reason: 'not an array' }] };
  if (!Array.isArray(doc.sources))       return { ok: false, cleaned: null, drops: [{ path: '$.sources', reason: 'not an array' }] };
  if (!Array.isArray(doc.toolStatus))    return { ok: false, cleaned: null, drops: [{ path: '$.toolStatus', reason: 'not an array' }] };
  if (!isObj(doc.maturity))              return { ok: false, cleaned: null, drops: [{ path: '$.maturity', reason: 'not an object' }] };

  const sourceIds = new Set(doc.sources.map((s) => s?.id).filter(Boolean));

  // Clean opportunities.
  const cleanedOpps = [];
  for (const opp of doc.opportunities) {
    const path = `$.opportunities[${opp?.id ?? '?'}]`;
    if (!isObj(opp)) { drops.push({ path, reason: 'not an object' }); continue; }
    if (!opp.id || !opp.title) { drops.push({ path, reason: 'missing id/title' }); continue; }
    if (!isObj(opp.evidence) || !opp.evidence.quote) { drops.push({ path, reason: 'missing evidence.quote' }); continue; }
    if (!HORIZON.has(opp.horizon)) { drops.push({ path, reason: `invalid horizon: ${opp.horizon}` }); continue; }
    if (!CONFIDENCE.has(opp.confidence)) { drops.push({ path, reason: `invalid confidence: ${opp.confidence}` }); continue; }

    const impact = Number.isFinite(opp.impact) ? clamp(Math.round(opp.impact), 1, 5) : null;
    const difficulty = Number.isFinite(opp.difficulty) ? clamp(Math.round(opp.difficulty), 1, 5) : null;
    if (impact === null || difficulty === null) { drops.push({ path, reason: 'impact/difficulty not numeric' }); continue; }

    // Filter unknown features — known ones survive, unknown ones drop with reason logged.
    const inputFeatures = Array.isArray(opp.copilotFeatures) ? opp.copilotFeatures : [];
    const features = [];
    for (const f of inputFeatures) {
      if (KNOWN_COPILOT_FEATURES.has(f)) features.push(f);
      else drops.push({ path: `${path}.copilotFeatures`, reason: `unknown feature dropped: ${f}` });
    }

    cleanedOpps.push({
      id: String(opp.id),
      title: String(opp.title),
      department: String(opp.department ?? ''),
      evidence: {
        quote: String(opp.evidence.quote),
        participantRole: String(opp.evidence.participantRole ?? ''),
        source: opp.evidence.source === 'granola' ? 'granola' : 'listen-labs',
      },
      copilotApproach: String(opp.copilotApproach ?? ''),
      copilotFeatures: features,
      requiredTools: Array.isArray(opp.requiredTools) ? opp.requiredTools.map(String) : [],
      impact,
      difficulty,
      horizon: opp.horizon,
      horizonReason: String(opp.horizonReason ?? ''),
      confidence: opp.confidence,
      workshopLesson: String(opp.workshopLesson ?? ''),
    });
  }

  // Clean maturity.
  const cleanedMaturity = { dimensions: [], peerBenchmark: null };
  const dims = Array.isArray(doc.maturity?.dimensions) ? doc.maturity.dimensions : [];
  for (const d of dims) {
    if (!isObj(d) || !REQUIRED_MATURITY_DIM_NAMES.has(d.name)) {
      drops.push({ path: `$.maturity.dimensions[${d?.name ?? '?'}]`, reason: 'missing or unexpected name' });
      continue;
    }
    const score = Number.isFinite(d.score) ? clamp(d.score, 0, 5) : null;
    if (score === null) {
      drops.push({ path: `$.maturity.dimensions[${d.name}]`, reason: 'score not numeric' });
      continue;
    }
    cleanedMaturity.dimensions.push({
      name: d.name,
      score,
      onTrack: 3.0, // System constant — ignore model-supplied value
      rationale: String(d.rationale ?? ''),
      signalQuotes: Array.isArray(d.signalQuotes) ? d.signalQuotes.map(String) : [],
    });
  }
  if (isObj(doc.maturity?.peerBenchmark)) {
    cleanedMaturity.peerBenchmark = {
      industry: String(doc.maturity.peerBenchmark.industry ?? ''),
      sizeCohort: String(doc.maturity.peerBenchmark.sizeCohort ?? ''),
      summary: String(doc.maturity.peerBenchmark.summary ?? ''),
      sourceIds: (Array.isArray(doc.maturity.peerBenchmark.sourceIds) ? doc.maturity.peerBenchmark.sourceIds : [])
        .filter((sid) => sourceIds.has(sid)),
    };
  }

  // Clean toolStatus.
  const cleanedToolStatus = [];
  for (const t of Array.isArray(doc.toolStatus) ? doc.toolStatus : []) {
    const path = `$.toolStatus[${t?.tool ?? '?'}]`;
    if (!isObj(t) || !t.tool) { drops.push({ path, reason: 'missing tool' }); continue; }
    if (!TOOL_STATUS.has(t.status)) { drops.push({ path, reason: `invalid status: ${t.status}` }); continue; }
    // Unverified rows don't require a sourceId.
    if (t.status !== 'unverified' && t.sourceId && !sourceIds.has(t.sourceId)) {
      drops.push({ path, reason: `sourceId not in sources[]: ${t.sourceId}` });
      continue;
    }
    cleanedToolStatus.push({
      tool: String(t.tool),
      status: t.status,
      detail: String(t.detail ?? ''),
      sourceId: t.sourceId ? String(t.sourceId) : null,
    });
  }

  const cleaned = {
    clientId: String(doc.clientId),
    clientName: String(doc.clientName),
    generatedAt: String(doc.generatedAt),
    sourceStudyIds: Array.isArray(doc.sourceStudyIds) ? doc.sourceStudyIds.map(String) : [],
    hasGranolaTranscript: Boolean(doc.hasGranolaTranscript),
    opportunities: cleanedOpps,
    maturity: cleanedMaturity,
    toolStatus: cleanedToolStatus,
    sources: doc.sources.filter(isObj),
  };

  return { ok: true, cleaned, drops };
}
