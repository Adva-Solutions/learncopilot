'use strict';

// Allowlist for production + local dev. Update if deployment origins change.
const ALLOWED_ORIGINS = new Set([
  'https://learncopilot.adva-solutions.com',
  'http://localhost:3000',
  'http://localhost:3847',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3847',
]);

// Vercel preview deployments use a predictable host pattern; allow them too.
// The project lived under the `matan-5706s-projects` team originally and was
// transferred to `advasolutions`; both patterns are accepted so historical
// preview URLs (e.g. cached PR links) still work while current deployments do.
const PREVIEW_HOST_REGEXES = [
  /^https:\/\/[a-z0-9-]+-matan-5706s-projects\.vercel\.app$/,
  /^https:\/\/[a-z0-9-]+-advasolutions\.vercel\.app$/,
];

/**
 * checkOrigin(req) → boolean
 *
 * Returns true if the request's Origin header is in the allowlist OR matches
 * a Vercel preview URL for this project. For safe methods (GET/HEAD/OPTIONS),
 * always returns true (origin checks protect state-changing requests only).
 */
export function checkOrigin(req) {
  const safe = ['GET', 'HEAD', 'OPTIONS'];
  if (safe.includes((req.method || '').toUpperCase())) return true;
  const origin = req.headers.origin;
  if (!origin) return false;                          // explicit origin required for non-safe methods
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (PREVIEW_HOST_REGEXES.some(rx => rx.test(origin))) return true;
  return false;
}
