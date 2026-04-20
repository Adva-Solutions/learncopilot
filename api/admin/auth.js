import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '../lib/rate-limit.js';
import { checkOrigin } from '../lib/csrf.js';

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET environment variable is not configured');
  return s;
}

function fullSig(data) {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('hex');
}

function sign(data) {
  return fullSig(data).slice(0, 32);
}

function verifySig(data, sig) {
  if (typeof sig !== 'string') return false;
  const full = fullSig(data);
  if (sig.length === 32) return sig === full.slice(0, 32);
  if (sig.length === 16) return sig === full.slice(0, 16);  // legacy cookies minted pre-2026-04
  return false;
}

// Admin sessions are valid for 7 days, matching the cookie's Max-Age. The
// timestamp is embedded in the signed payload so a stolen token can't outlive
// its cookie attribute — verifyAdmin rejects anything older than this window
// even if the browser still holds the cookie.
const ADMIN_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function createAdminToken() {
  const payload = `admin|${Date.now()}`;
  return `${Buffer.from(payload).toString('base64')}.${sign(payload)}`;
}

export function verifyAdmin(req) {
  const cookies = req.headers.cookie || '';
  const match = cookies.match(/admin_session=([^;]+)/);
  if (!match) return false;
  const token = decodeURIComponent(match[1]);
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return false;
  const payload = Buffer.from(b64, 'base64').toString('utf-8');
  if (!payload.startsWith('admin|')) return false;
  if (!verifySig(payload, sig)) return false;
  const issuedAt = Number(payload.slice('admin|'.length));
  if (!Number.isFinite(issuedAt) || issuedAt <= 0) return false;
  if (Date.now() - issuedAt > ADMIN_SESSION_MAX_AGE_MS) return false;
  return true;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Check if admin is authenticated
    return res.status(200).json({ authenticated: verifyAdmin(req) });
  }

  if (req.method === 'POST') {
    if (!checkOrigin(req)) {
      return res.status(403).json({ error: 'Invalid origin' });
    }

    const ip = getClientIp(req);
    const rl = await checkRateLimit(`ratelimit:admin-auth:${ip}`, 5, 60);
    if (!rl.allowed) {
      res.setHeader('Retry-After', String(rl.retryAfter));
      return res.status(429).json({ error: 'Too many login attempts. Try again shortly.' });
    }

    const { password } = req.body || {};
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return res.status(500).json({ error: 'ADMIN_PASSWORD environment variable is not configured' });
    }
    if (password !== expected) {
      return res.status(401).json({ error: 'Wrong admin password' });
    }
    const token = createAdminToken();
    const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    if (!checkOrigin(req)) {
      return res.status(403).json({ error: 'Invalid origin' });
    }
    // Logout
    res.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
