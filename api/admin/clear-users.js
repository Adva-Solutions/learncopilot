import { getRedis } from '../lib/redis.js';
import { verifyAdmin } from './auth.js';
import { checkOrigin } from '../lib/csrf.js';

// Bulk-remove every enrolled participant and their progress record for a
// workshop. Unlike /api/admin/reset (which zeros progress but keeps the
// roster so active students stay visible at 0 pts), this wipes enrollment
// entirely so the leaderboard goes empty. Intended for cleaning out test
// accounts before a real client cohort starts.
//
// Also bumps {prefix}resetAt so any pre-clear session gets kicked by the
// iat check in /api/me on its next poll — test tabs left open don't re-add
// themselves to the roster via a POST /api/progress race.
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
    for (const userKey of users) {
      await r.del(`${prefix}progress:${userKey}`);
    }
    await r.del(`${prefix}users`);

    const resetAt = Date.now();
    await r.set(`${prefix}resetAt`, String(resetAt));

    return res.status(200).json({
      ok: true,
      removed: users.length,
      slug: isDefault ? null : rawSlug,
      resetAt,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Redis error', detail: e.message });
  }
}
