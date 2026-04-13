import { getRedis } from './lib/redis.js';

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'slug required' });

  const r = getRedis();
  try {
    const raw = await r.get(`client:${slug}`);
    if (!raw) return res.status(404).json({ error: 'Workshop not found' });

    const client = JSON.parse(raw);
    return res.status(200).json({
      name: client.name,
      logoUrl: client.logoUrl || null,
      industry: client.industry || null,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load workshop info', detail: e.message });
  }
}
