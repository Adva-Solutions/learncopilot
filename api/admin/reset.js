import { getRedis } from '../lib/redis.js';
import { verifyAdmin } from './auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  const { slug } = req.body || {};
  if (!slug) {
    return res.status(400).json({ error: 'slug is required' });
  }

  const r = getRedis();

  try {
    // Verify client exists
    const raw = await r.get(`client:${slug}`);
    if (!raw) return res.status(404).json({ error: 'Workshop not found' });

    const users = await r.smembers(`client:${slug}:users`);
    for (const user of users) {
      await r.del(`client:${slug}:progress:${user}`);
    }
    await r.del(`client:${slug}:users`);

    return res.status(200).json({ ok: true, cleared: users.length, slug });
  } catch (e) {
    return res.status(500).json({ error: 'Redis error', detail: e.message });
  }
}
