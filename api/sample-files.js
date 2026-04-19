import { getRedis } from './lib/redis.js';
import { getUser } from './me.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const id = (req.query && req.query.id) || '';
  if (!id || !/^[0-9a-f]{16}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const r = getRedis();
  const slug = user.slug || 'default';
  const clientJson = await r.get(`client:${slug}`);
  const client = clientJson ? safeParse(clientJson) : null;
  const assignedIds = (client && Array.isArray(client.sampleFileIds)) ? client.sampleFileIds : [];
  if (!assignedIds.includes(id)) {
    return res.status(403).json({ error: 'File not assigned to your workshop' });
  }

  const [metaStr, dataB64] = await Promise.all([
    r.get(`sample-files:${id}`),
    r.get(`sample-files:${id}:data`),
  ]);
  if (!metaStr || !dataB64) return res.status(404).json({ error: 'Not found' });

  const meta = safeParse(metaStr);
  if (!meta) return res.status(500).json({ error: 'Malformed metadata' });

  const buf = Buffer.from(dataB64, 'base64');
  res.setHeader('Content-Type', meta.mime || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${meta.name}"`);
  res.setHeader('Content-Length', String(buf.length));
  return res.status(200).end(buf);
}

function safeParse(s) {
  try { return JSON.parse(s); } catch (_) { return null; }
}
