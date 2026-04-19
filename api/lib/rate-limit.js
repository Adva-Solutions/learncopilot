'use strict';

import { getRedis } from './redis.js';

/**
 * checkRateLimit(key, maxAttempts, windowSeconds) → { allowed: boolean, retryAfter: number }
 *
 * Uses INCR + EXPIRE. First hit sets TTL; subsequent hits within the window
 * increment the counter. When the counter exceeds maxAttempts, returns
 * allowed=false with retryAfter = remaining TTL in seconds.
 */
export async function checkRateLimit(key, maxAttempts, windowSeconds) {
  const r = getRedis();
  const count = await r.incr(key);
  let ttl;
  if (count === 1) {
    await r.expire(key, windowSeconds);
    ttl = windowSeconds;
  } else {
    ttl = await r.ttl(key);
    if (ttl < 0) {
      // Key exists without TTL (should be rare); re-set TTL defensively.
      await r.expire(key, windowSeconds);
      ttl = windowSeconds;
    }
  }
  if (count > maxAttempts) {
    return { allowed: false, retryAfter: Math.max(1, ttl) };
  }
  return { allowed: true, retryAfter: 0 };
}

export function getClientIp(req) {
  // Vercel populates x-forwarded-for; fall back to x-real-ip or the socket.
  const fwd = req.headers['x-forwarded-for'] || '';
  const first = String(fwd).split(',')[0].trim();
  if (first) return first;
  const real = req.headers['x-real-ip'];
  if (real) return String(real).trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}
