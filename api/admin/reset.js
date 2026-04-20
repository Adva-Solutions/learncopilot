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

    // Stamp a reset timestamp. Clients compare this against their last-synced
    // timestamp; when the server's resetAt is newer they clear their local
    // cache instead of re-uploading it (otherwise an active student would
    // silently re-populate the leaderboard seconds after reset).
    const resetAt = Date.now();
    await r.set(`${prefix}resetAt`, String(resetAt));

    // Rewrite each participant's progress record to zero instead of deleting.
    // Keeping the user in the set means active students stay visible on the
    // leaderboard with 0 points -- they don't silently disappear mid-session.
    const users = await r.smembers(`${prefix}users`);
    const emptyCategory = { completed: [], points: 0 };
    for (const userKey of users) {
      // Reconstruct a display name from the user key (name::uid or name).
      const sep = userKey.indexOf('::');
      const name = sep >= 0 ? userKey.substring(0, sep) : userKey;
      const zeroed = {
        name,
        slug: isDefault ? '' : rawSlug,
        updatedAt: resetAt,
        chat:   emptyCategory,
        apps:   emptyCategory,
        agents: emptyCategory,
        totalPoints: 0,
      };
      await r.set(`${prefix}progress:${userKey}`, JSON.stringify(zeroed));
    }

    return res.status(200).json({
      ok: true,
      cleared: users.length,
      slug: isDefault ? null : rawSlug,
      resetAt,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Redis error', detail: e.message });
  }
}
