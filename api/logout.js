export default async function handler(req, res) {
  res.setHeader('Set-Cookie', 'workshop_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return res.status(200).json({ ok: true });
}
