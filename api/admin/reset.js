import { getRedis } from '../lib/redis.js';
import { verifyAdmin } from './auth.js';
import { checkOrigin } from '../lib/csrf.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  const body = req.body || {};
  const rawSlug = body.slug;
  const isDefault = rawSlug === '' || rawSlug === null || rawSlug === undefined || rawSlug === '__default__';
  const prefix = isDefault ? 'workshop:' : `client:${rawSlug}:`;

  const r = getRedis();

  try {
    if (!isDefault) {
      const raw = await r.get(`client:${rawSlug}`);
      if (!raw) return res.status(404).json({ error: 'Workshop not found' });
    }

    const users = await r.smembers(`${prefix}users`);
    for (const user of users) {
      await r.del(`${prefix}progress:${user}`);
    }
    await r.del(`${prefix}users`);

    return res.status(200).json({ ok: true, cleared: users.length, slug: isDefault ? null : rawSlug });
  } catch (e) {
    return res.status(500).json({ error: 'Redis error', detail: e.message });
  }
}
