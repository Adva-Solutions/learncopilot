import { getRedis } from './lib/redis.js';
import { getUser } from './me.js';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * GET /api/map?slug=<slug>
 * Public reader endpoint — returns the opportunity map for a given client slug.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  /* Auth: require a valid session cookie */
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  /* Validate slug */
  const slug = req.query.slug;
  if (!slug || !SLUG_RE.test(slug)) {
    return res.status(400).json({ error: 'Invalid or missing slug parameter' });
  }

  /* Strip trailing -<hash> segment to get the base slug for the Redis key.
     e.g. "acme-corp-a1b2c3" -> "acme-corp" */
  const baseSlug = slug.replace(/-[a-z0-9]+$/, '');

  const r = getRedis();

  try {
    const raw = await r.get(`opportunityMap:${baseSlug}`);
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
