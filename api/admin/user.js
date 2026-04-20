import { getRedis } from '../lib/redis.js';
import { verifyAdmin } from './auth.js';
import { checkOrigin } from '../lib/csrf.js';

// Remove a single enrolled participant from a workshop. Deletes the progress
// record and removes them from {prefix}users. Does NOT bump {prefix}resetAt —
// intended for pruning inactive test accounts. If the removed user still has
// an active session and completes a lesson, the POST /api/progress handler
// re-adds them to the roster; use /api/admin/clear-users for a definitive
// wipe.
export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  const rawSlug = req.query.slug;
  const key = req.query.key;
  if (!key) return res.status(400).json({ error: 'key query parameter required' });

  const isDefault = !rawSlug || rawSlug === '__default__';
  const prefix = isDefault ? 'workshop:' : `client:${rawSlug}:`;

  const r = getRedis();
  try {
    if (!isDefault) {
      const raw = await r.get(`client:${rawSlug}`);
      if (!raw) return res.status(404).json({ error: 'Workshop not found' });
    }

    await r.srem(`${prefix}users`, key);
    await r.del(`${prefix}progress:${key}`);

    return res.status(200).json({ ok: true, removed: key });
  } catch (e) {
    return res.status(500).json({ error: 'Redis error', detail: e.message });
  }
}
