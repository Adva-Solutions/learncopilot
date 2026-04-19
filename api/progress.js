import { getRedis } from './lib/redis.js';
import { getUser } from './me.js';
import { checkOrigin } from './lib/csrf.js';

export default async function handler(req, res) {
  const r = getRedis();

  if (req.method === 'GET') {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    const slug = req.query.slug || (user && user.slug) || '';
    const prefix = slug ? `client:${slug}:` : 'workshop:';

    try {
      const keys = await r.smembers(`${prefix}users`);
      const participants = [];
      for (const key of keys) {
        const raw = await r.get(`${prefix}progress:${key}`);
        if (raw) {
          try { participants.push(JSON.parse(raw)); } catch { }
        }
      }
      participants.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
      return res.status(200).json({ participants });
    } catch (e) {
      return res.status(500).json({ error: 'Redis error', detail: e.message });
    }
  }

  if (req.method === 'POST') {
    if (!checkOrigin(req)) {
      return res.status(403).json({ error: 'Invalid origin' });
    }
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'Not logged in' });

    const slug = user.slug || '';
    const prefix = slug ? `client:${slug}:` : 'workshop:';

    const { chat, apps, agents } = req.body || {};
    const userKey = user.uid ? `${user.name}::${user.uid}` : user.name;
    const defaults = { completed: [], points: 0 };

    try {
      const existingRaw = await r.get(`${prefix}progress:${userKey}`);
      let existing = null;
      try { existing = existingRaw ? JSON.parse(existingRaw) : null; } catch { existing = null; }

      const data = {
        name: user.name,
        slug,
        updatedAt: Date.now(),
        chat:   chat   !== undefined ? chat   : (existing?.chat   || defaults),
        apps:   apps   !== undefined ? apps   : (existing?.apps   || defaults),
        agents: agents !== undefined ? agents : (existing?.agents || defaults),
      };
      data.totalPoints = (data.chat.points || 0) + (data.apps.points || 0) + (data.agents.points || 0);

      await r.sadd(`${prefix}users`, userKey);
      await r.set(`${prefix}progress:${userKey}`, JSON.stringify(data));
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Redis error', detail: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
