import crypto from 'crypto';
import { getRedis } from './lib/redis.js';
import { createToken } from './me.js';
import { checkRateLimit, getClientIp } from './lib/rate-limit.js';
import { checkOrigin } from './lib/csrf.js';

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

// Register the user as a workshop participant at login time so they appear on
// the leaderboard and admin dashboard immediately (not only after completing
// their first lesson). Idempotent: if the user + progress record already exist,
// nothing changes.
async function registerParticipant(r, name, slug, uid) {
  const prefix = slug ? `client:${slug}:` : 'workshop:';
  const userKey = uid ? `${name}::${uid}` : name;
  await r.sadd(`${prefix}users`, userKey);
  const existing = await r.get(`${prefix}progress:${userKey}`);
  if (existing) return; // don't overwrite real progress
  const empty = { completed: [], points: 0 };
  const initial = {
    name,
    slug: slug || '',
    updatedAt: Date.now(),
    chat:   empty,
    apps:   empty,
    agents: empty,
    totalPoints: 0,
  };
  await r.set(`${prefix}progress:${userKey}`, JSON.stringify(initial));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  const ip = getClientIp(req);
  const rl = await checkRateLimit(`ratelimit:login:${ip}`, 10, 60);
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfter));
    return res.status(429).json({ error: 'Too many login attempts. Try again shortly.' });
  }

  const { name, password, slug } = req.body || {};
  if (!name || !password) return res.status(400).json({ error: 'Name and password required' });

  const r = getRedis();
  const trimmed = name.trim();

  if (slug) {
    const raw = await r.get(`client:${slug}`);
    if (!raw) return res.status(404).json({ error: 'Workshop not found' });
    let client;
    try { client = JSON.parse(raw); } catch { return res.status(500).json({ error: 'Workshop data corrupted' }); }
    // Gate on admin-controlled status. A workshop in 'draft' or 'inactive' is
    // closed to participants — the Status dropdown in the admin panel was
    // purely cosmetic before this. Records without a status field default to
    // 'active' to avoid locking out workshops created before the field existed.
    const status = client.status || 'active';
    if (status !== 'active') {
      return res.status(403).json({ error: 'Workshop is not accepting logins' });
    }
    if (password !== client.password) return res.status(401).json({ error: 'Wrong password' });

    const uid = await findOrCreateUid(r, trimmed, slug);
    await registerParticipant(r, trimmed, slug, uid);
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
  await registerParticipant(r, trimmed, '', uid);
  const token = createToken(trimmed, '', uid);
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `workshop_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
  return res.status(200).json({ ok: true, name: trimmed });
}
