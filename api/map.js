import { getRedis } from './lib/redis.js';
import { getUser } from './me.js';
import { verifyAdmin } from './admin/auth.js';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * GET /api/map?slug=<slug>
 * Reader endpoint — returns the opportunity map for a given client slug.
 * Accepts either a workshop_session (learner) or an admin_session (admin preview).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  /* Auth: workshop session OR admin session */
  const user = getUser(req);
  const isAdmin = verifyAdmin(req);
  if (!user && !isAdmin) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  /* Validate slug */
  const slug = req.query.slug;
  if (!slug || !SLUG_RE.test(slug)) {
    return res.status(400).json({ error: 'Invalid or missing slug parameter' });
  }

  const r = getRedis();

  try {
    const raw = await r.get(`opportunityMap:${slug}`);
    if (!raw) {
      return res.status(404).json({ error: 'Map not found' });
    }

    const map = JSON.parse(raw);

    res.setHeader('Cache-Control', 'private, max-age=60');
    return res.status(200).json({ map });
  } catch (e) {
    return res.status(500).json({ error: 'Redis error', detail: e.message });
  }
}
