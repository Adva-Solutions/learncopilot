import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'learncopilot-2026-secret';

function verify(token) {
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return null;
  const name = Buffer.from(b64, 'base64').toString('utf-8');
  const expected = crypto.createHmac('sha256', SECRET).update(name).digest('hex').slice(0, 16);
  return sig === expected ? name : null;
}

export function getUser(req) {
  const cookies = req.headers.cookie || '';
  const match = cookies.match(/workshop_session=([^;]+)/);
  if (!match) return null;
  return verify(decodeURIComponent(match[1]));
}

export default async function handler(req, res) {
  const name = getUser(req);
  if (!name) return res.status(401).json({ error: 'Not logged in' });
  return res.status(200).json({ name });
}
