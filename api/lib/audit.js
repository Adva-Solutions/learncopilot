'use strict';

import { getRedis } from './redis.js';
import { log } from './logger.js';

// Append-only audit stream stored in Redis as LPUSH-trimmed lists. This is the
// recovery substrate: every state-changing event records its full payload so
// we can reconstruct who did what if a downstream write fails.
//
// Streams (use as the `stream` argument):
//   - `progress:<slug>`        every POST /api/progress that reached the server
//   - `login:<slug>`           login attempts (success + failure + reason)
//   - `admin`                  admin actions (reset, clear-users, personalize, ...)
//   - `redis-errors`           ioredis connection / command failures
//   - `client-errors`          browser-side errors reported via /api/client-log
//
// Entries are JSON. Audit writes are best-effort: if Redis is down they log
// the failure and return without throwing — auditing must never break the
// user-facing request.

const AUDIT_MAX_ENTRIES = 10_000;

export async function audit(stream, event) {
  const key = `audit:${stream}`;
  const entry = JSON.stringify({ ts: Date.now(), ...event });
  try {
    const r = getRedis();
    await r.lpush(key, entry);
    await r.ltrim(key, 0, AUDIT_MAX_ENTRIES - 1);
  } catch (err) {
    log.error('audit_write_failed', { stream, err: err.message });
  }
}

// Read recent audit entries (newest first). Used by the admin dashboard.
export async function readAudit(stream, { limit = 100, offset = 0 } = {}) {
  const key = `audit:${stream}`;
  const r = getRedis();
  const raw = await r.lrange(key, offset, offset + limit - 1);
  return raw.map(s => { try { return JSON.parse(s); } catch { return { _raw: s }; } });
}

// List known audit streams by scanning keys. Used by the admin dashboard to
// populate the stream dropdown (so per-slug streams appear automatically).
export async function listStreams() {
  const r = getRedis();
  const out = new Set();
  let cursor = '0';
  do {
    const [next, keys] = await r.scan(cursor, 'MATCH', 'audit:*', 'COUNT', 200);
    for (const k of keys) out.add(k.replace(/^audit:/, ''));
    cursor = next;
  } while (cursor !== '0');
  return Array.from(out).sort();
}
