import { getUser } from './me.js';

const API_KEY = process.env.LISTEN_LABS_API_KEY;
const BASE_URL = 'https://listenlabs.ai/api/public';

/**
 * GET /api/interviews?study=<link_id>
 *
 * Fetches the logged-in participant's interview responses from Listen Labs
 * and returns structured context for prompt personalization.
 *
 * Listen Labs API:
 *   GET /api/public/responses/{link_id}  — list all responses for a study
 *   Auth: x-api-key header
 *   Match participant by name from Q1 answer (first question is typically name/role)
 *
 * Response: { found, context: { name, role, tags, tagline, topics, answers, prompts } }
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const name = getUser(req);
  if (!name) return res.status(401).json({ error: 'Not logged in' });

  if (!API_KEY) {
    return res.status(200).json({ found: false, context: null, reason: 'no_api_key' });
  }

  // Study link_id from query param or env var (tenant-configured default study)
  const studyId = req.query.study || process.env.LISTEN_LABS_STUDY_ID || '';
  if (!studyId) {
    return res.status(200).json({ found: false, context: null, reason: 'no_study_id' });
  }

  try {
    // Fetch all responses for this study
    const apiRes = await fetch(`${BASE_URL}/responses/${studyId}?per_page=1000`, {
      headers: { 'x-api-key': API_KEY },
    });

    if (!apiRes.ok) {
      console.error(`Listen Labs API error: ${apiRes.status}`);
      return res.status(200).json({ found: false, context: null, reason: 'api_error' });
    }

    const responses = await apiRes.json();
    if (!Array.isArray(responses) || !responses.length) {
      return res.status(200).json({ found: false, context: null, reason: 'no_responses' });
    }

    // Match participant by name — check the first Q&A answer (usually name/role)
    // and also check the tagline which often contains the name
    const nameLower = name.toLowerCase();
    const matched = responses.find(r => {
      // Check answers_array for name mention in first answer
      const firstAnswer = (r.answers_array || [])[0]?.answer || '';
      if (firstAnswer.toLowerCase().includes(nameLower)) return true;
      // Check tagline
      if ((r.tagline || '').toLowerCase().includes(nameLower)) return true;
      // Check all answers for name
      const allAnswers = (r.answers_array || []).map(a => a.answer || '').join(' ').toLowerCase();
      if (allAnswers.includes(nameLower)) return true;
      return false;
    });

    if (!matched) {
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
      return res.status(200).json({ found: false, context: null, reason: 'no_match' });
    }

    // Build participant context from matched response
    const context = extractContext(matched, name);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ found: true, context });

  } catch (err) {
    console.error('Listen Labs fetch error:', err.message);
    return res.status(200).json({ found: false, context: null, reason: 'fetch_error' });
  }
}

/**
 * Extract structured context from a Listen Labs response for prompt personalization.
 */
function extractContext(response, userName) {
  const answers = response.answers_array || [];
  const tags = response.tags || [];
  const tagline = response.tagline || '';
  const bulletSummary = response.bullet_summary || [];
  const qualityScore = response.quality_score;

  // Extract role from first answer (typically "Name, Role at Department")
  const firstAnswer = answers[0]?.answer || '';
  const role = extractRole(firstAnswer);

  // Build a map of question -> answer for easy access
  const qaMap = {};
  answers.forEach(a => {
    qaMap[a.question || ''] = a.answer || '';
  });

  // Extract key themes from tags and bullet summary
  const topics = tags.slice(0, 5);
  const challenges = extractByKeyword(answers, ['challenge', 'struggle', 'difficult', 'pain', 'frustration', 'problem']);
  const tools = extractByKeyword(answers, ['tool', 'software', 'app', 'system', 'platform', 'use']);
  const goals = extractByKeyword(answers, ['goal', 'hope', 'want', 'like to', 'would love', 'improve', 'wish']);

  // Build prompt-ready fragments
  const prompts = {
    role: role ? `I am ${role}` : `I work at my organization`,
    context: tagline || (bulletSummary.length ? bulletSummary.slice(0, 2).join('. ') : ''),
    topics: topics.join(', ') || 'productivity and AI adoption',
    challenges: challenges || 'improving efficiency in daily workflows',
    goals: goals || 'using AI to save time on repetitive tasks',
  };

  return {
    name: userName,
    role,
    tags,
    tagline,
    topics,
    bulletSummary: bulletSummary.slice(0, 5),
    challenges,
    tools,
    goals,
    answers: qaMap,
    prompts,
    qualityScore,
    responseDate: response.created_at,
  };
}

/**
 * Extract role from the first answer (e.g., "John Smith, Team leader in Architecture")
 */
function extractRole(text) {
  if (!text) return '';
  // Common patterns: "Name, Role" or "Name. Role at Dept" or "I'm a Role"
  const parts = text.split(/[,.]\s*/);
  if (parts.length >= 2) {
    // Second part is usually the role
    return parts.slice(1).join(', ').trim().slice(0, 100);
  }
  return '';
}

/**
 * Search all answers for content matching keywords, return first relevant snippet.
 */
function extractByKeyword(answers, keywords) {
  for (const a of answers) {
    const text = (a.answer || '').toLowerCase();
    if (keywords.some(kw => text.includes(kw))) {
      // Return this answer, capped
      return (a.answer || '').slice(0, 200);
    }
  }
  return '';
}
