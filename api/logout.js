export default async function handler(req, res) {
  const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `workshop_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
  return res.status(200).json({ ok: true });
}
