import { getRedis } from './lib/redis.js';
import { getUser, getStaleReset } from './me.js';
import { verifyAdmin } from './admin/auth.js';
import { checkOrigin } from './lib/csrf.js';

export default async function handler(req, res) {
  const r = getRedis();

  if (req.method === 'GET') {
    const user = getUser(req);
    const isAdmin = verifyAdmin(req);
    if (!user && !isAdmin) return res.status(401).json({ error: 'Authentication required' });

    // Per-user mode: `?me=true` returns the logged-in user's own progress
    // record plus the workshop's current `resetAt` timestamp (if any).
    // Clients use this to decide whether their localStorage is stale --
    // if server.resetAt is newer than the client's last-sync timestamp,
    // the client clears local cache instead of re-uploading it.
    const wantMe = req.query.me === 'true' || req.query.me === '1';
    if (wantMe) {
      if (!user) return res.status(200).json({ myProgress: null, resetAt: null });
      const slug = user.slug || '';
      const prefix = slug ? `client:${slug}:` : 'workshop:';
      const userKey = user.uid ? `${user.name}::${user.uid}` : user.name;
      try {
        const [raw, resetAtRaw] = await Promise.all([
          r.get(`${prefix}progress:${userKey}`),
          r.get(`${prefix}resetAt`),
        ]);
        let myProgress = null;
        if (raw) { try { myProgress = JSON.parse(raw); } catch { myProgress = null; } }
        const resetAt = resetAtRaw ? Number(resetAtRaw) : null;
        return res.status(200).json({ myProgress, resetAt });
      } catch (e) {
        return res.status(500).json({ error: 'Redis error', detail: e.message });
      }
    }

    // Aggregate mode: `?all=1` returns participants from the default workshop
    // AND every client workshop, merged and sorted by points. Used by the
    // public leaderboard when no specific workshop is selected.
    const wantAll = req.query.all === '1' || req.query.all === 'true';

    try {
      let participants = [];
      if (wantAll) {
        const prefixes = ['workshop:'];
        const clientSlugs = await r.smembers('clients');
        for (const s of clientSlugs) prefixes.push(`client:${s}:`);
        for (const prefix of prefixes) {
          const keys = await r.smembers(`${prefix}users`);
          for (const key of keys) {
            const raw = await r.get(`${prefix}progress:${key}`);
            if (raw) {
              try { participants.push(JSON.parse(raw)); } catch { }
            }
          }
        }
      } else {
        const slug = req.query.slug || (user && user.slug) || '';
        const prefix = slug ? `client:${slug}:` : 'workshop:';
        const keys = await r.smembers(`${prefix}users`);
        for (const key of keys) {
          const raw = await r.get(`${prefix}progress:${key}`);
          if (raw) {
            try { participants.push(JSON.parse(raw)); } catch { }
          }
        }
      }
      participants.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
      return res.status(200).json({ participants });
    } catch (e) {
      return res.status(500).json({ error: 'Redis error', detail: e.message });
    }
  }

  if (req.method === 'POST') {
    if (!checkOrigin(req)) {
      return res.status(403).json({ error: 'Invalid origin' });
    }
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'Not logged in' });

    // Reject writes from sessions that predate an admin reset so an active
    // student can't silently repopulate the zeroed leaderboard from a stale tab.
    const staleReset = await getStaleReset(user);
    if (staleReset) {
      const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
      res.setHeader('Set-Cookie', `workshop_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
      return res.status(401).json({ error: 'Session invalidated by workshop reset', reset: true, resetAt: staleReset });
    }

    const slug = user.slug || '';
    const prefix = slug ? `client:${slug}:` : 'workshop:';

    const { chat, apps, agents } = req.body || {};
    const userKey = user.uid ? `${user.name}::${user.uid}` : user.name;
    const defaults = { completed: [], points: 0 };

    try {
      const existingRaw = await r.get(`${prefix}progress:${userKey}`);
      let existing = null;
      try { existing = existingRaw ? JSON.parse(existingRaw) : null; } catch { existing = null; }

      const data = {
        name: user.name,
        slug,
        updatedAt: Date.now(),
        chat:   chat   !== undefined ? chat   : (existing?.chat   || defaults),
        apps:   apps   !== undefined ? apps   : (existing?.apps   || defaults),
        agents: agents !== undefined ? agents : (existing?.agents || defaults),
      };
      data.totalPoints = (data.chat.points || 0) + (data.apps.points || 0) + (data.agents.points || 0);

      await r.sadd(`${prefix}users`, userKey);
      await r.set(`${prefix}progress:${userKey}`, JSON.stringify(data));
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Redis error', detail: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
