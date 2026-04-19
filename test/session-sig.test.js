'use strict';

// Unit test for the signature widening in api/me.js and api/admin/auth.js.
// We don't import the server modules (they read SESSION_SECRET from env); we
// replicate the sign/verifySig algorithm here with a known key and assert the
// two widths both validate against the same payload. The production verifySig
// uses the exact same hex prefix comparison.

const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');

function fullSig(secret, data) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function verifySig(secret, data, sig) {
  if (typeof sig !== 'string') return false;
  const full = fullSig(secret, data);
  if (sig.length === 32) return sig === full.slice(0, 32);
  if (sig.length === 16) return sig === full.slice(0, 16);
  return false;
}

const SECRET = 'test-secret-abc123';
const PAYLOAD = JSON.stringify({ n: 'Alice', s: 'default', u: 'ab12cd34' });

test('verifySig accepts 32-hex signature (current width)', () => {
  const sig32 = fullSig(SECRET, PAYLOAD).slice(0, 32);
  assert.strictEqual(sig32.length, 32);
  assert.strictEqual(verifySig(SECRET, PAYLOAD, sig32), true);
});

test('verifySig accepts 16-hex signature (legacy width) — backward compat', () => {
  const sig16 = fullSig(SECRET, PAYLOAD).slice(0, 16);
  assert.strictEqual(sig16.length, 16);
  assert.strictEqual(verifySig(SECRET, PAYLOAD, sig16), true);
});

test('verifySig rejects signature with wrong length', () => {
  const bogus20 = fullSig(SECRET, PAYLOAD).slice(0, 20);
  assert.strictEqual(verifySig(SECRET, PAYLOAD, bogus20), false);
});

test('verifySig rejects mismatched signature at both widths', () => {
  assert.strictEqual(verifySig(SECRET, PAYLOAD, '0'.repeat(32)), false);
  assert.strictEqual(verifySig(SECRET, PAYLOAD, '0'.repeat(16)), false);
});

test('verifySig rejects non-string sig', () => {
  assert.strictEqual(verifySig(SECRET, PAYLOAD, null), false);
  assert.strictEqual(verifySig(SECRET, PAYLOAD, undefined), false);
  assert.strictEqual(verifySig(SECRET, PAYLOAD, 12345), false);
});
