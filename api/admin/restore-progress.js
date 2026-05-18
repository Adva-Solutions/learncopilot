'use strict';

import { getRedis } from '../lib/redis.js';
import { verifyAdmin } from './auth.js';
import { checkOrigin } from '../lib/csrf.js';
import { getClientIp } from '../lib/rate-limit.js';
import { log, newRequestId } from '../lib/logger.js';
import { audit } from '../lib/audit.js';

// POST /api/admin/restore-progress
// Body: { slug, userKey, snapshot }
//   slug:     '' or '__default__' for the default workshop, otherwise a client slug
//   userKey:  the canonical "<name>::<uid>" or just "<name>" identifier
//   snapshot: a progress record object (the value of one entry from an
//             audit:admin reset/clear_users snapshot, or any saved blob)
//
// Writes the snapshot directly to `{prefix}progress:<userKey>` and re-adds
// the user to `{prefix}users` if they were removed. Captured in audit:admin
// under event='restore' so a restore is itself auditable.
//
// Admin-only. Used by the audit dashboard's "Restore from this entry" button.

export default async function handler(req, res) {
  const requestId = newRequestId();
  res.setHeader('x-request-id', requestId);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!checkOrigin(req)) {
    log.warn('admin_restore_origin_rejected', { requestId, origin: req.headers.origin || null });
    return res.status(403).json({ error: 'Invalid origin' });
  }
  if (!verifyAdmin(req)) {
    log.warn('admin_restore_unauthenticated', { requestId, ip: getClientIp(req) });
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  const body = req.body || {};
  const rawSlug = body.slug;
  const userKey = body.userKey;
  const snapshot = body.snapshot;
  if (!userKey || typeof userKey !== 'string') {
    return res.status(400).json({ error: 'userKey required' });
  }
  if (!snapshot || typeof snapshot !== 'object') {
    return res.status(400).json({ error: 'snapshot object required' });
  }

  const isDefault = rawSlug === '' || rawSlug == null || rawSlug === '__default__' || rawSlug === 'default';
  const prefix = isDefault ? 'workshop:' : `client:${rawSlug}:`;
  const slugLabel = isDefault ? 'default' : rawSlug;

  const r = getRedis();
  try {
    // Capture the current state so the restore itself is undo-able from audit.
    const priorRaw = await r.get(`${prefix}progress:${userKey}`);
    let prior = null;
    if (priorRaw) { try { prior = JSON.parse(priorRaw); } catch { prior = { _raw: priorRaw }; } }

    // Stamp updatedAt so the leaderboard renders this as fresh.
    const restored = { ...snapshot, updatedAt: Date.now() };
    if (restored.chat || restored.apps || restored.agents) {
      const c = restored.chat   || { points: 0 };
      const a = restored.apps   || { points: 0 };
      const g = restored.agents || { points: 0 };
      restored.totalPoints = (c.points || 0) + (a.points || 0) + (g.points || 0);
    }

    await r.sadd(`${prefix}users`, userKey);
    await r.set(`${prefix}progress:${userKey}`, JSON.stringify(restored));

    log.info('admin_restore_ok', { requestId, slug: slugLabel, userKey, totalPoints: restored.totalPoints });
    await audit('admin', {
      event: 'restore',
      requestId,
      slug: slugLabel,
      userKey,
      prior,
      next: restored,
      ip: getClientIp(req),
    });

    return res.status(200).json({ ok: true, requestId, restored });
  } catch (e) {
    log.error('admin_restore_failed', { requestId, slug: slugLabel, userKey, err: e });
    return res.status(500).json({ error: 'Redis error', detail: e.message, requestId });
  }
}
