import { verifyAdmin } from './auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Admin authentication required' });

  const { logoBase64, contentType } = req.body || {};
  if (!logoBase64 || !contentType) {
    return res.status(400).json({ error: 'logoBase64 and contentType are required' });
  }

  // Store as data URL (logos are small, <200KB). The URL is passed to
  // the client creation endpoint in step 4.
  const dataUrl = `data:${contentType};base64,${logoBase64}`;
  return res.status(200).json({ url: dataUrl });
}
