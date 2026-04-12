import { Redis } from '@upstash/redis';
import { getUser } from './me.js';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const PREFIX = process.env.REDIS_PREFIX || 'hartman';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const keys = await redis.smembers(`${PREFIX}:users`) || [];
    const participants = [];
    for (const key of keys) {
      const data = await redis.get(`${PREFIX}:progress:${key}`);
      if (data) participants.push(data);
    }
    participants.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    return res.status(200).json({ participants });
  }

  if (req.method === 'POST') {
    const name = getUser(req);
    if (!name) return res.status(401).json({ error: 'Not logged in' });

    const { chat, apps, agents } = req.body || {};
    const data = {
      name,
      updatedAt: Date.now(),
      chat: chat || { completed: [], points: 0 },
      apps: apps || { completed: [], points: 0 },
      agents: agents || { completed: [], points: 0 },
      totalPoints: (chat?.points || 0) + (apps?.points || 0) + (agents?.points || 0)
    };

    await redis.sadd(`${PREFIX}:users`, name);
    await redis.set(`${PREFIX}:progress:${name}`, JSON.stringify(data));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
