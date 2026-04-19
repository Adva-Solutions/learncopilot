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
const PREVIEW_HOST_REGEX = /^https:\/\/[a-z0-9-]+-matan-5706s-projects\.vercel\.app$/;

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
  if (PREVIEW_HOST_REGEX.test(origin)) return true;
  return false;
}
