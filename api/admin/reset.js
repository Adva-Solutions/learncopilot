import { getRedis } from '../lib/redis.js';
import { verifyAdmin } from './auth.js';
import { checkOrigin } from '../lib/csrf.js';
import { getClientIp } from '../lib/rate-limit.js';
import { log, newRequestId } from '../lib/logger.js';
import { audit } from '../lib/audit.js';

export default async function handler(req, res) {
  const requestId = newRequestId();
  res.setHeader('x-request-id', requestId);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!checkOrigin(req)) {
    log.warn('admin_reset_origin_rejected', { requestId, origin: req.headers.origin || null });
    return res.status(403).json({ error: 'Invalid origin' });
  }

  if (!verifyAdmin(req)) {
    log.warn('admin_reset_unauthenticated', { requestId, ip: getClientIp(req) });
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
        log.info('admin_reset_workshop_not_found', { requestId, slug: rawSlug });
        return res.status(404).json({ error: 'Workshop not found' });
      }
    }

    // Snapshot every participant's pre-reset progress so we can restore from
    // the audit log if this reset was a mistake. The snapshot is the whole
    // point of audit:admin for destructive operations.
    const users = await r.smembers(`${prefix}users`);
    const snapshot = [];
    for (const userKey of users) {
      const raw = await r.get(`${prefix}progress:${userKey}`);
      let parsed = null;
      if (raw) { try { parsed = JSON.parse(raw); } catch { parsed = { _raw: raw }; } }
      snapshot.push({ userKey, prior: parsed });
    }

    const resetAt = Date.now();
    await r.set(`${prefix}resetAt`, String(resetAt));

    const emptyCategory = { completed: [], points: 0 };
    for (const userKey of users) {
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

    log.info('admin_reset_ok', { requestId, slug: slugLabel, cleared: users.length, resetAt });
    await audit('admin', {
      event: 'reset',
      requestId,
      slug: slugLabel,
      cleared: users.length,
      resetAt,
      ip: getClientIp(req),
      snapshot, // full pre-reset state for recovery
    });

    return res.status(200).json({
      ok: true,
      cleared: users.length,
      slug: isDefault ? null : rawSlug,
      resetAt,
      requestId,
    });
  } catch (e) {
    log.error('admin_reset_failed', { requestId, slug: slugLabel, err: e });
    return res.status(500).json({ error: 'Redis error', detail: e.message, requestId });
  }
}
