import { getRedis } from '../lib/redis.js';
import { verifyAdmin } from './auth.js';
import { checkOrigin } from '../lib/csrf.js';

export default async function handler(req, res) {
  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const r = getRedis();

  // GET: return current template overrides
  if (req.method === 'GET') {
    try {
      const raw = await r.get('template:personalization');
      const overrides = raw ? JSON.parse(raw) : { replacements: {}, lessonOverrides: {} };
      return res.status(200).json(overrides);
    } catch (e) {
      return res.status(500).json({ error: 'Redis error', detail: e.message });
    }
  }

  // PUT: save template overrides
  if (req.method === 'PUT') {
    try {
      const { replacements, lessonOverrides } = req.body || {};
      const data = {
        replacements: replacements || {},
        lessonOverrides: lessonOverrides || {},
        updatedAt: Date.now(),
      };
      await r.set('template:personalization', JSON.stringify(data));
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Redis error', detail: e.message });
    }
  }

  // POST: reset legacy (template) workshop progress
  if (req.method === 'POST') {
    const { action } = req.body || {};
    if (action === 'reset') {
      try {
        const users = await r.smembers('workshop:users');
        for (const user of users) {
          await r.del(`workshop:progress:${user}`);
        }
        await r.del('workshop:users');
        return res.status(200).json({ ok: true, cleared: users.length });
      } catch (e) {
        return res.status(500).json({ error: 'Redis error', detail: e.message });
      }
    }
    return res.status(400).json({ error: 'Invalid action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
