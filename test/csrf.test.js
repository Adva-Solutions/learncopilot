'use strict';
const test = require('node:test');
const assert = require('node:assert');

test('checkOrigin allows safe methods regardless of origin', async () => {
  const { checkOrigin } = await import('../api/lib/csrf.js');
  assert.strictEqual(checkOrigin({ method: 'GET',     headers: {} }), true);
  assert.strictEqual(checkOrigin({ method: 'HEAD',    headers: {} }), true);
  assert.strictEqual(checkOrigin({ method: 'OPTIONS', headers: {} }), true);
});

test('checkOrigin rejects non-safe methods without origin', async () => {
  const { checkOrigin } = await import('../api/lib/csrf.js');
  assert.strictEqual(checkOrigin({ method: 'POST', headers: {} }), false);
});

test('checkOrigin accepts allowlisted production origin', async () => {
  const { checkOrigin } = await import('../api/lib/csrf.js');
  assert.strictEqual(checkOrigin({ method: 'POST', headers: { origin: 'https://learncopilot.adva-solutions.com' } }), true);
});

test('checkOrigin accepts localhost dev origin', async () => {
  const { checkOrigin } = await import('../api/lib/csrf.js');
  assert.strictEqual(checkOrigin({ method: 'POST', headers: { origin: 'http://localhost:3000' } }), true);
});

test('checkOrigin accepts Vercel preview URLs for this project', async () => {
  const { checkOrigin } = await import('../api/lib/csrf.js');
  // Legacy team (project history) — kept allowlisted so old PR links work.
  assert.strictEqual(checkOrigin({ method: 'POST', headers: { origin: 'https://learncopilot-git-x-matan-5706s-projects.vercel.app' } }), true);
  // Current team (advasolutions) — every active preview deployment uses this.
  assert.strictEqual(checkOrigin({ method: 'POST', headers: { origin: 'https://learncopilot-git-claude-review-thalia-bug-hjmn0-advasolutions.vercel.app' } }), true);
});

test('checkOrigin rejects unknown origins', async () => {
  const { checkOrigin } = await import('../api/lib/csrf.js');
  assert.strictEqual(checkOrigin({ method: 'POST', headers: { origin: 'https://evil.example.com' } }), false);
});
