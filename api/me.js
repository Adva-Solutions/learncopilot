import crypto from 'crypto';

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET environment variable is not configured');
  return s;
}

// Full HMAC-SHA256 as hex (64 chars). Signing uses the first 32 hex chars.
// Verification accepts 16 hex (legacy) or 32 hex (current) for backward
// compatibility with any sessions minted before the 2026-04 widening.
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
  if (sig.length === 16) return sig === full.slice(0, 16);
  return false;
}

export function createToken(name, slug, uid) {
  const id = uid || crypto.randomBytes(4).toString('hex');
  const payload = JSON.stringify({ n: name, s: slug || '', u: id });
  return `${Buffer.from(payload).toString('base64')}.${sign(payload)}`;
}

function verify(token) {
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return null;
  const payload = Buffer.from(b64, 'base64').toString('utf-8');
  if (!verifySig(payload, sig)) return null;
  try {
    const data = JSON.parse(payload);
    return { name: data.n, slug: data.s || null, uid: data.u || null };
  } catch {
    const [name, slug] = payload.split('|');
    return { name, slug: slug || null };
  }
}

export function getUser(req) {
  const cookies = req.headers.cookie || '';
  const match = cookies.match(/workshop_session=([^;]+)/);
  if (!match) return null;
  return verify(decodeURIComponent(match[1]));
}

export default async function handler(req, res) {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Not logged in' });
  return res.status(200).json(user);
}
