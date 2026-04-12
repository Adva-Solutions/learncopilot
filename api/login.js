import crypto from 'crypto';

const PASSWORD = process.env.WORKSHOP_PASSWORD || 'hartman_copilot_2026';
const SECRET = process.env.SESSION_SECRET || 'learncopilot-2026-secret';

function sign(name) {
  return crypto.createHmac('sha256', SECRET).update(name).digest('hex').slice(0, 16);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, password } = req.body || {};
  if (!name || !password) return res.status(400).json({ error: 'Name and password required' });
  if (password !== PASSWORD) return res.status(401).json({ error: 'Wrong password' });

  const trimmed = name.trim();
  const token = `${Buffer.from(trimmed).toString('base64')}.${sign(trimmed)}`;

  res.setHeader('Set-Cookie', `workshop_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
  return res.status(200).json({ ok: true, name: trimmed });
}
