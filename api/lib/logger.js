'use strict';

import crypto from 'crypto';

// Structured JSON logger. Each call emits one JSON object per line so
// `vercel logs --query "event:progress_write_failed"` and similar filters
// work. Vercel's runtime log UI parses JSON automatically.
//
// Conventions:
//   - `event` is a short snake_case identifier (e.g. `progress_write_ok`)
//   - Pass any extra context as a plain object: { user, slug, status, durMs, err }
//   - Errors include the `err` field with message (and optional stack)
//
// We intentionally do NOT log every successful GET — Vercel's access log
// already records request lines. Use the structured logger for state changes,
// errors, auth failures, and admin actions.

export function newRequestId() {
  return crypto.randomBytes(6).toString('hex');
}

function emit(level, event, data) {
  const payload = { ts: new Date().toISOString(), level, event, ...data };
  // err can be an Error; serialize message + stack so it survives JSON.stringify.
  if (payload.err instanceof Error) {
    payload.err = { message: payload.err.message, stack: payload.err.stack };
  }
  let line;
  try {
    line = JSON.stringify(payload);
  } catch (_) {
    // Defensive: if data contains a circular ref, drop everything but message.
    line = JSON.stringify({ ts: payload.ts, level, event, _stringify: 'failed' });
  }
  if (level === 'error' || level === 'fatal') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const log = {
  info:  (event, data = {}) => emit('info',  event, data),
  warn:  (event, data = {}) => emit('warn',  event, data),
  error: (event, data = {}) => emit('error', event, data),
  fatal: (event, data = {}) => emit('fatal', event, data),
};

// Convenience: wrap a handler in a try/catch that logs unhandled exceptions
// before re-throwing (Vercel turns the throw into a 500). Use this around any
// handler body that might raise outside our explicit catch blocks.
export function withErrorLog(route, handler) {
  return async function wrapped(req, res) {
    const requestId = newRequestId();
    req._requestId = requestId;
    res.setHeader('x-request-id', requestId);
    try {
      return await handler(req, res);
    } catch (err) {
      log.error('handler_unhandled', { route, requestId, method: req.method, err });
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal error', requestId });
      }
    }
  };
}
