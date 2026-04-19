import { verifyAdmin } from './auth.js';
import { getRedis } from '../lib/redis.js';
import {
  isAllowedMime,
  isAllowedCategory,
  decodeAndSize,
  normalizeFileName,
  newSampleFileId,
  MAX_SAMPLE_FILE_BYTES,
} from '../lib/sample-files-util.js';

export default async function handler(req, res) {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  if (req.method === 'POST')   return handleCreate(req, res);
  if (req.method === 'GET')    return handleList(req, res);
  if (req.method === 'DELETE') return handleDelete(req, res);

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleCreate(req, res) {
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) {} }
  body = body || {};

  const name0 = body.name;
  const category = body.category;
  const mime = body.mime;
  const dataBase64 = body.dataBase64;

  if (!isAllowedCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  if (!isAllowedMime(mime)) {
    return res.status(415).json({ error: 'Unsupported mime type' });
  }

  let name;
  try { name = normalizeFileName(name0); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  let size;
  try { size = decodeAndSize(dataBase64); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  if (size > MAX_SAMPLE_FILE_BYTES) {
    return res.status(413).json({ error: 'Sample file exceeds 3 MiB' });
  }

  const id = newSampleFileId();
  const meta = {
    id,
    name,
    category,
    mime,
    size,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'admin',
  };

  const r = getRedis();
  const pipe = r.multi();
  pipe.sadd('sample-files', id);
  pipe.set(`sample-files:${id}`, JSON.stringify(meta));
  pipe.set(`sample-files:${id}:data`, dataBase64);
  await pipe.exec();

  return res.status(201).json(meta);
}

async function handleList(req, res) {
  const r = getRedis();
  const ids = await r.smembers('sample-files');
  if (ids.length === 0) return res.status(200).json({ files: [] });
  const metaKeys = ids.map((id) => `sample-files:${id}`);
  const metaStrs = await r.mget(metaKeys);
  const files = metaStrs
    .filter(Boolean)
    .map((s) => { try { return JSON.parse(s); } catch (_) { return null; } })
    .filter(Boolean)
    .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  return res.status(200).json({ files });
}

async function handleDelete(req, res) {
  const id = (req.query && req.query.id) || '';
  if (!id || !/^[0-9a-f]{16}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const r = getRedis();
  await r.multi()
    .srem('sample-files', id)
    .del(`sample-files:${id}`)
    .del(`sample-files:${id}:data`)
    .exec();
  return res.status(204).end();
}
