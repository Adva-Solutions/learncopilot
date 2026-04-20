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

  const { slug } = req.query;
  if (!slug) {
    return res.status(400).json({ error: 'slug query parameter required' });
  }

  const r = getRedis();

  if (req.method === 'GET') {
    try {
      const raw = await r.get(`client:${slug}`);
      if (!raw) return res.status(404).json({ error: 'Workshop not found' });
      const client = JSON.parse(raw);
      const userKeys = await r.smembers(`client:${slug}:users`);
      const participants = [];
      for (const key of userKeys) {
        const praw = await r.get(`client:${slug}:progress:${key}`);
        if (praw) {
          try { participants.push(JSON.parse(praw)); } catch { /* skip corrupted */ }
        } else {
          // User in set but no progress record yet — surface them anyway
          // so a freshly-enrolled or post-delete-record participant still shows.
          const sep = key.indexOf('::');
          const name = sep >= 0 ? key.substring(0, sep) : key;
          participants.push({ name, totalPoints: 0 });
        }
      }
      const persRaw = await r.get(`client:${slug}:personalization`);
      const personalization = persRaw ? JSON.parse(persRaw) : null;
      return res.status(200).json({ ...client, slug, participantCount: userKeys.length, participants, personalization });
    } catch (e) {
      return res.status(500).json({ error: 'Redis error', detail: e.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const raw = await r.get(`client:${slug}`);
      if (!raw) return res.status(404).json({ error: 'Workshop not found' });
      const existing = JSON.parse(raw);

      const updates = req.body || {};

      // Validate password if being changed
      if (updates.password !== undefined && (!updates.password || typeof updates.password !== 'string' || updates.password.trim().length < 1)) {
        return res.status(400).json({ error: 'Password cannot be empty' });
      }

      // Only allow updating specific fields
      const allowed = ['name', 'password', 'industry', 'description', 'departments', 'logoUrl', 'status', 'listenLabsStudyId'];
      for (const key of allowed) {
        if (updates[key] !== undefined) {
          existing[key] = updates[key];
        }
      }

      if (Array.isArray(updates.sampleFileIds)) {
        const valid = updates.sampleFileIds.filter(s => typeof s === 'string' && /^[0-9a-f]{16}$/.test(s));
        existing.sampleFileIds = valid;
      }

      existing.updatedAt = Date.now();

      await r.set(`client:${slug}`, JSON.stringify(existing));
      return res.status(200).json({ ok: true, client: { ...existing, slug } });
    } catch (e) {
      return res.status(500).json({ error: 'Redis error', detail: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const raw = await r.get(`client:${slug}`);
      if (!raw) return res.status(404).json({ error: 'Workshop not found' });

      // Remove all client data
      const users = await r.smembers(`client:${slug}:users`);
      for (const user of users) {
        await r.del(`client:${slug}:progress:${user}`);
      }
      await r.del(`client:${slug}:users`);
      await r.del(`client:${slug}:personalization`);
      await r.del(`client:${slug}:personalization:status`);
      await r.del(`client:${slug}`);
      await r.srem('clients', slug);

      return res.status(200).json({ ok: true, deleted: slug });
    } catch (e) {
      return res.status(500).json({ error: 'Redis error', detail: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
