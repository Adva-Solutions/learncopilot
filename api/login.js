import crypto from 'crypto';
import { getRedis } from './lib/redis.js';
import { createToken } from './me.js';

async function findOrCreateUid(r, name, slug) {
  const prefix = slug ? `client:${slug}:` : 'workshop:';
  const members = await r.smembers(`${prefix}users`);
  for (const key of members) {
    const sep = key.indexOf('::');
    const memberName = sep >= 0 ? key.substring(0, sep) : key;
    if (memberName === name) {
      return sep >= 0 ? key.substring(sep + 2) : null;
    }
  }
  return crypto.randomBytes(4).toString('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, password, slug } = req.body || {};
  if (!name || !password) return res.status(400).json({ error: 'Name and password required' });

  const r = getRedis();
  const trimmed = name.trim();

  if (slug) {
    const raw = await r.get(`client:${slug}`);
    if (!raw) return res.status(404).json({ error: 'Workshop not found' });
    let client;
    try { client = JSON.parse(raw); } catch { return res.status(500).json({ error: 'Workshop data corrupted' }); }
    if (password !== client.password) return res.status(401).json({ error: 'Wrong password' });

    const uid = await findOrCreateUid(r, trimmed, slug);
    const token = createToken(trimmed, slug, uid);
    const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `workshop_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
    return res.status(200).json({ ok: true, name: trimmed, slug });
  }

  // Legacy/default login
  const LEGACY_PASSWORD = process.env.WORKSHOP_PASSWORD;
  if (!LEGACY_PASSWORD) return res.status(500).json({ error: 'WORKSHOP_PASSWORD not configured' });
  if (password !== LEGACY_PASSWORD) return res.status(401).json({ error: 'Wrong password' });

  const uid = await findOrCreateUid(r, trimmed, '');
  const token = createToken(trimmed, '', uid);
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `workshop_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
  return res.status(200).json({ ok: true, name: trimmed });
}
