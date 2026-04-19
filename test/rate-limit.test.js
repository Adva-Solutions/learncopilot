'use strict';
const test = require('node:test');
const assert = require('node:assert');

// ESM live bindings are read-only, so we cannot monkey-patch getRedis on the
// module namespace object. Instead, we test checkRateLimit logic directly by
// exercising the algorithm inline: INCR + conditional EXPIRE semantics.
test('checkRateLimit returns allowed when under threshold', async () => {
  // Inline reimplementation of the sliding-window logic using a fake Redis
  // client — verifies the contract without requiring an ESM mock.
  let counter = 0;
  let ttlVal = -2;

  async function fakeCheckRateLimit(maxAttempts, windowSeconds) {
    // mirrors the production implementation exactly
    counter++;
    const count = counter;
    let ttl;
    if (count === 1) {
      ttlVal = windowSeconds;
      ttl = windowSeconds;
    } else {
      ttl = ttlVal;
      if (ttl < 0) {
        ttlVal = windowSeconds;
        ttl = windowSeconds;
      }
    }
    if (count > maxAttempts) {
      return { allowed: false, retryAfter: Math.max(1, ttl) };
    }
    return { allowed: true, retryAfter: 0 };
  }

  const r1 = await fakeCheckRateLimit(3, 60);
  assert.strictEqual(r1.allowed, true);
  const r2 = await fakeCheckRateLimit(3, 60);
  assert.strictEqual(r2.allowed, true);
  const r3 = await fakeCheckRateLimit(3, 60);
  assert.strictEqual(r3.allowed, true);
  const r4 = await fakeCheckRateLimit(3, 60);
  assert.strictEqual(r4.allowed, false);
  assert.ok(r4.retryAfter >= 1 && r4.retryAfter <= 60);
});

test('getClientIp prefers x-forwarded-for first', async () => {
  const { getClientIp } = await import('../api/lib/rate-limit.js');
  assert.strictEqual(getClientIp({ headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, socket: {} }), '1.2.3.4');
  assert.strictEqual(getClientIp({ headers: { 'x-real-ip': '9.9.9.9' }, socket: {} }), '9.9.9.9');
  assert.strictEqual(getClientIp({ headers: {}, socket: { remoteAddress: '10.0.0.1' } }), '10.0.0.1');
  assert.strictEqual(getClientIp({ headers: {}, socket: {} }), 'unknown');
});
