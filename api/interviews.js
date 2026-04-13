import { getRedis } from './lib/redis.js';
import { getUser } from './me.js';

const API_KEY = process.env.LISTEN_LABS_API_KEY;
const BASE_URL = 'https://listenlabs.ai/api/public';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Not logged in' });

  if (!API_KEY) {
    return res.status(200).json({ found: false, context: null, reason: 'no_api_key' });
  }

  const studyId = req.query.study || process.env.LISTEN_LABS_STUDY_ID || '';
  if (!studyId) {
    return res.status(200).json({ found: false, context: null, reason: 'no_study_id' });
  }

  try {
    const apiRes = await fetch(`${BASE_URL}/responses/${studyId}?per_page=1000`, {
      headers: { 'x-api-key': API_KEY },
    });

    if (!apiRes.ok) {
      return res.status(200).json({ found: false, context: null, reason: 'api_error' });
    }

    const responses = await apiRes.json();
    if (!Array.isArray(responses) || !responses.length) {
      return res.status(200).json({ found: false, context: null, reason: 'no_responses' });
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ found: true, responses });
  } catch (err) {
    return res.status(200).json({ found: false, context: null, reason: 'fetch_error' });
  }
}
