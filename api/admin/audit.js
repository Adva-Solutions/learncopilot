'use strict';

import { verifyAdmin } from './auth.js';
import { checkOrigin } from '../lib/csrf.js';
import { readAudit, listStreams } from '../lib/audit.js';
import { log, newRequestId } from '../lib/logger.js';

// GET /api/admin/audit?streams=1                  → list known audit streams
// GET /api/admin/audit?stream=progress:acme       → entries (newest first)
//   ?limit=N    (default 100, max 500)
//   ?offset=N   (default 0)
//   ?since=ms   filter to entries with ts >= since
//   ?until=ms   filter to entries with ts <  until
//   ?event=str  filter to entries matching event/kind (substring, case-insensitive)
//
// Admin-only; safe origin check (GET is exempt but kept for symmetry).

const MAX_LIMIT = 500;

export default async function handler(req, res) {
  const requestId = newRequestId();
  res.setHeader('x-request-id', requestId);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  if (!verifyAdmin(req)) {
    log.warn('admin_audit_unauthenticated', { requestId });
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    if (req.query.streams === '1' || req.query.streams === 'true') {
      const streams = await listStreams();
      return res.status(200).json({ streams });
    }

    const stream = String(req.query.stream || '').trim();
    if (!stream) return res.status(400).json({ error: 'stream query parameter required' });

    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || 100));
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
    const since = req.query.since ? Number(req.query.since) : null;
    const until = req.query.until ? Number(req.query.until) : null;
    const eventFilter = req.query.event ? String(req.query.event).toLowerCase() : null;

    let entries = await readAudit(stream, { limit, offset });

    if (since || until || eventFilter) {
      entries = entries.filter((e) => {
        if (since && !(e.ts >= since)) return false;
        if (until && !(e.ts < until)) return false;
        if (eventFilter) {
          const haystack = (e.event || e.kind || '').toString().toLowerCase();
          if (!haystack.includes(eventFilter)) return false;
        }
        return true;
      });
    }

    return res.status(200).json({ stream, limit, offset, count: entries.length, entries });
  } catch (e) {
    log.error('admin_audit_failed', { requestId, err: e });
    return res.status(500).json({ error: 'Audit read failed', detail: e.message, requestId });
  }
}
