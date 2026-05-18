import crypto from 'crypto';
import { getRedis } from './lib/redis.js';
import { createToken } from './me.js';
import { checkRateLimit, getClientIp } from './lib/rate-limit.js';
import { checkOrigin } from './lib/csrf.js';
import { log, newRequestId } from './lib/logger.js';
import { audit } from './lib/audit.js';

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
  const requestId = newRequestId();
  res.setHeader('x-request-id', requestId);
  if (req.method !== 'POST') {
    log.warn('login_method_not_allowed', { requestId, method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!checkOrigin(req)) {
    log.warn('login_origin_rejected', { requestId, origin: req.headers.origin || null });
    return res.status(403).json({ error: 'Invalid origin' });
  }

  const ip = getClientIp(req);
  const rl = await checkRateLimit(`ratelimit:login:${ip}`, 10, 60);
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfter));
    log.warn('login_rate_limited', { requestId, ip, retryAfter: rl.retryAfter });
    await audit('login:default', { event: 'rate_limited', requestId, ip });
    return res.status(429).json({ error: 'Too many login attempts. Try again shortly.' });
  }

  const { name, password, slug } = req.body || {};
  if (!name || !password) {
    log.info('login_bad_request', { requestId, hasName: !!name, hasPassword: !!password });
    return res.status(400).json({ error: 'Name and password required' });
  }

  const r = getRedis();
  const trimmed = name.trim();
  const auditStream = `login:${slug || 'default'}`;

  if (slug) {
    const raw = await r.get(`client:${slug}`);
    if (!raw) {
      log.info('login_workshop_not_found', { requestId, slug });
      await audit(auditStream, { event: 'workshop_not_found', requestId, name: trimmed, slug, ip });
      return res.status(404).json({ error: 'Workshop not found' });
    }
    let client;
    try { client = JSON.parse(raw); } catch {
      log.error('login_workshop_corrupted', { requestId, slug });
      return res.status(500).json({ error: 'Workshop data corrupted', requestId });
    }
    const status = client.status || 'active';
    if (status !== 'active') {
      log.info('login_workshop_closed', { requestId, slug, status });
      await audit(auditStream, { event: 'workshop_closed', requestId, name: trimmed, slug, status, ip });
      return res.status(403).json({ error: 'Workshop is not accepting logins' });
    }
    if (password !== client.password) {
      log.info('login_wrong_password', { requestId, slug, name: trimmed });
      await audit(auditStream, { event: 'wrong_password', requestId, name: trimmed, slug, ip });
      return res.status(401).json({ error: 'Wrong password' });
    }

    const uid = await findOrCreateUid(r, trimmed, slug);
    await registerParticipant(r, trimmed, slug, uid);
    const token = createToken(trimmed, slug, uid);
    const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `workshop_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
    log.info('login_ok', { requestId, slug, name: trimmed, uid });
    await audit(auditStream, { event: 'login_ok', requestId, name: trimmed, slug, uid, ip });
    return res.status(200).json({ ok: true, name: trimmed, slug });
  }

  // Legacy/default login
  const LEGACY_PASSWORD = process.env.WORKSHOP_PASSWORD;
  if (!LEGACY_PASSWORD) {
    log.error('login_workshop_password_unset', { requestId });
    return res.status(500).json({ error: 'WORKSHOP_PASSWORD not configured', requestId });
  }
  if (password !== LEGACY_PASSWORD) {
    log.info('login_wrong_password', { requestId, name: trimmed, mode: 'legacy' });
    await audit(auditStream, { event: 'wrong_password', requestId, name: trimmed, mode: 'legacy', ip });
    return res.status(401).json({ error: 'Wrong password' });
  }

  const uid = await findOrCreateUid(r, trimmed, '');
  await registerParticipant(r, trimmed, '', uid);
  const token = createToken(trimmed, '', uid);
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `workshop_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
  log.info('login_ok', { requestId, name: trimmed, uid, mode: 'legacy' });
  await audit(auditStream, { event: 'login_ok', requestId, name: trimmed, uid, mode: 'legacy', ip });
  return res.status(200).json({ ok: true, name: trimmed });
}
