import { getRedis } from '../lib/redis.js';
import { verifyAdmin } from './auth.js';
import { checkOrigin } from '../lib/csrf.js';

export default async function handler(req, res) {
  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  const r = getRedis();

  if (req.method === 'GET') {
    try {
      const slugs = await r.smembers('clients');
      const clients = [];
      for (const slug of slugs) {
        const raw = await r.get(`client:${slug}`);
        if (raw) {
          try {
            const client = JSON.parse(raw);
            const userCount = await r.scard(`client:${slug}:users`);
            clients.push({ ...client, slug, participantCount: userCount });
          } catch { /* skip corrupted client entry */ }
        }
      }
      clients.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return res.status(200).json({ clients });
    } catch (e) {
      return res.status(500).json({ error: 'Redis error', detail: e.message });
    }
  }

  if (req.method === 'POST') {
    const { name, slug, password, industry, description, departments, logoUrl, personalization, listenLabsStudyId } = req.body || {};

    if (!name || !slug || !password) {
      return res.status(400).json({ error: 'Name, slug, and password are required' });
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return res.status(400).json({ error: 'Slug must be lowercase alphanumeric with hyphens only' });
    }

    const reserved = ['template', 'admin', 'api', 'login', 'new'];
    if (reserved.includes(slug)) {
      return res.status(400).json({ error: `"${slug}" is a reserved name. Choose a different slug.` });
    }

    try {
      const client = {
        name,
        slug,
        password,
        industry: industry || '',
        description: description || '',
        departments: departments || [],
        logoUrl: logoUrl || null,
        listenLabsStudyId: listenLabsStudyId || null,
        status: 'active',
        createdAt: Date.now(),
      };

      // Atomic set-if-not-exists to prevent race conditions
      const created = await r.set(`client:${slug}`, JSON.stringify(client), 'NX');
      if (!created) {
        return res.status(409).json({ error: 'A workshop with this slug already exists' });
      }
      await r.sadd('clients', slug);

      // Store personalization if provided
      if (personalization) {
        await r.set(`client:${slug}:personalization`, JSON.stringify(personalization));
        await r.set(`client:${slug}:personalization:status`, 'approved');
      }

      return res.status(201).json({ ok: true, client });
    } catch (e) {
      return res.status(500).json({ error: 'Redis error', detail: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
