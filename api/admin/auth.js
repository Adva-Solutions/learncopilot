import crypto from 'crypto';

function getSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET environment variable is not configured');
  return s;
}

function sign(data) {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('hex').slice(0, 16);
}

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
  const expected = sign(payload);
  return sig === expected;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Check if admin is authenticated
    return res.status(200).json({ authenticated: verifyAdmin(req) });
  }

  if (req.method === 'POST') {
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
    // Logout
    res.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
