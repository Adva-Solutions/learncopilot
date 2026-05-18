import { getRedis } from '../lib/redis.js';
import { verifyAdmin } from './auth.js';
import { checkOrigin } from '../lib/csrf.js';
import { getClientIp } from '../lib/rate-limit.js';
import { log, newRequestId } from '../lib/logger.js';
import { audit } from '../lib/audit.js';

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
  const requestId = newRequestId();
  res.setHeader('x-request-id', requestId);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!checkOrigin(req)) {
    log.warn('admin_clear_users_origin_rejected', { requestId, origin: req.headers.origin || null });
    return res.status(403).json({ error: 'Invalid origin' });
  }
  if (!verifyAdmin(req)) {
    log.warn('admin_clear_users_unauthenticated', { requestId, ip: getClientIp(req) });
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  const body = req.body || {};
  const rawSlug = body.slug;
  const isDefault = rawSlug === '' || rawSlug === null || rawSlug === undefined || rawSlug === '__default__';
  const prefix = isDefault ? 'workshop:' : `client:${rawSlug}:`;
  const slugLabel = isDefault ? 'default' : rawSlug;

  const r = getRedis();
  try {
    if (!isDefault) {
      const raw = await r.get(`client:${rawSlug}`);
      if (!raw) {
        log.info('admin_clear_users_workshop_not_found', { requestId, slug: rawSlug });
        return res.status(404).json({ error: 'Workshop not found' });
      }
    }

    // Snapshot every participant before wiping enrollment so a mistaken
    // clear can be reconstructed from audit:admin.
    const usersBefore = await r.smembers(`${prefix}users`);
    const snapshot = [];
    for (const userKey of usersBefore) {
      const raw = await r.get(`${prefix}progress:${userKey}`);
      let parsed = null;
      if (raw) { try { parsed = JSON.parse(raw); } catch { parsed = { _raw: raw }; } }
      snapshot.push({ userKey, prior: parsed });
    }

    const resetAt = Date.now();
    await r.set(`${prefix}resetAt`, String(resetAt));

    for (const userKey of usersBefore) {
      await r.del(`${prefix}progress:${userKey}`);
    }
    await r.del(`${prefix}users`);

    log.info('admin_clear_users_ok', { requestId, slug: slugLabel, removed: usersBefore.length, resetAt });
    await audit('admin', {
      event: 'clear_users',
      requestId,
      slug: slugLabel,
      removed: usersBefore.length,
      resetAt,
      ip: getClientIp(req),
      snapshot,
    });

    return res.status(200).json({
      ok: true,
      removed: usersBefore.length,
      slug: isDefault ? null : rawSlug,
      resetAt,
      requestId,
    });
  } catch (e) {
    log.error('admin_clear_users_failed', { requestId, slug: slugLabel, err: e });
    return res.status(500).json({ error: 'Redis error', detail: e.message, requestId });
  }
}
