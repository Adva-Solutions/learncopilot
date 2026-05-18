'use strict';

import { checkOrigin } from './lib/csrf.js';
import { checkRateLimit, getClientIp } from './lib/rate-limit.js';
import { getUser } from './me.js';
import { log, newRequestId } from './lib/logger.js';
import { audit } from './lib/audit.js';

// Receives browser-side error reports (window.onerror, unhandledrejection,
// progress-flush failures, etc.) and pushes them to audit:client-errors so
// the next class of silent client bugs can be triaged from the admin
// dashboard instead of waiting for a user to email us.
//
// Auth: not required (errors can happen before login). Origin-checked.
// Rate-limited per IP because a buggy client could otherwise spam this.
//
// Body shape (all fields optional, but at least one of {message, kind} required):
//   {
//     kind: 'onerror' | 'unhandledrejection' | 'flush_failed' | 'fetch_failed' | string,
//     message: string,
//     stack: string,
//     url: string,             // window.location.href
//     userAgent: string,
//     course: string,          // courseId from the lesson runtime, if known
//     lessonIdx: number,
//     extra: object,           // anything else worth keeping
//   }

const MAX_FIELD_LEN = 4_000;     // truncate per-field; some stacks are huge
const MAX_TOTAL_LEN = 16_000;

function clip(value) {
  if (value == null) return value;
  const s = typeof value === 'string' ? value : JSON.stringify(value);
  return s.length > MAX_FIELD_LEN ? s.slice(0, MAX_FIELD_LEN) + '…[truncated]' : s;
}

export default async function handler(req, res) {
  const requestId = newRequestId();
  res.setHeader('x-request-id', requestId);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  const ip = getClientIp(req);
  // 60 reports / minute / IP. Higher than login (10/min) because a single
  // crashy tab can legitimately fire several. Still bounded so a runaway loop
  // can't flood Redis.
  const rl = await checkRateLimit(`ratelimit:client-log:${ip}`, 60, 60);
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfter));
    return res.status(429).json({ error: 'Too many client log entries' });
  }

  const body = req.body || {};
  // Reject obvious garbage so the audit stream stays useful.
  if (!body.message && !body.kind) {
    return res.status(400).json({ error: 'kind or message required' });
  }

  // sendBeacon delivers as text/plain — Vercel may pass it through unparsed.
  let parsed = body;
  if (typeof body === 'string') {
    try { parsed = JSON.parse(body); } catch { parsed = { message: body }; }
  }

  const user = getUser(req); // best-effort identity; null if not logged in
  const entry = {
    requestId,
    ip,
    user: user ? user.name : null,
    slug: user ? (user.slug || null) : null,
    kind: clip(parsed.kind || 'unknown'),
    message: clip(parsed.message),
    stack: clip(parsed.stack),
    url: clip(parsed.url),
    userAgent: clip(parsed.userAgent || req.headers['user-agent'] || ''),
    course: clip(parsed.course),
    lessonIdx: typeof parsed.lessonIdx === 'number' ? parsed.lessonIdx : null,
    extra: parsed.extra ? clip(parsed.extra) : null,
  };

  // Belt-and-suspenders size cap across all fields combined.
  let serialized = JSON.stringify(entry);
  if (serialized.length > MAX_TOTAL_LEN) {
    entry.stack = '[dropped: oversize]';
    entry.extra = '[dropped: oversize]';
    serialized = JSON.stringify(entry);
  }

  log.info('client_log_received', { requestId, kind: entry.kind, user: entry.user });
  await audit('client-errors', entry);

  return res.status(204).end();
}
