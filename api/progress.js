import { getRedis } from './lib/redis.js';
import { getUser, getStaleReset } from './me.js';
import { verifyAdmin } from './admin/auth.js';
import { checkOrigin } from './lib/csrf.js';
import { log, newRequestId } from './lib/logger.js';
import { audit } from './lib/audit.js';

export default async function handler(req, res) {
  const r = getRedis();
  const requestId = newRequestId();
  res.setHeader('x-request-id', requestId);

  if (req.method === 'GET') {
    const user = getUser(req);
    const isAdmin = verifyAdmin(req);
    if (!user && !isAdmin) return res.status(401).json({ error: 'Authentication required' });

    // Learner sessions issued before an admin reset should not keep reading
    // their own or the leaderboard's progress after being kicked off /api/me.
    // Admin sessions bypass this check (admins still need to see state after
    // triggering a reset).
    if (user && !isAdmin) {
      const staleReset = await getStaleReset(user);
      if (staleReset) {
        const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
        res.setHeader('Set-Cookie', `workshop_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
        log.info('progress_read_stale_reset', { requestId, user: user.name, slug: user.slug || '', resetAt: staleReset });
        return res.status(401).json({ error: 'Session invalidated by workshop reset', reset: true, resetAt: staleReset });
      }
    }

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
        log.error('progress_read_me_failed', { requestId, user: user.name, slug, err: e });
        return res.status(500).json({ error: 'Redis error', detail: e.message, requestId });
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
      log.error('progress_read_failed', { requestId, mode: wantAll ? 'all' : 'slug', err: e });
      return res.status(500).json({ error: 'Redis error', detail: e.message, requestId });
    }
  }

  if (req.method === 'POST') {
    if (!checkOrigin(req)) {
      log.warn('progress_write_origin_rejected', { requestId, origin: req.headers.origin || null });
      return res.status(403).json({ error: 'Invalid origin' });
    }
    const user = getUser(req);
    if (!user) {
      log.warn('progress_write_unauthenticated', { requestId });
      return res.status(401).json({ error: 'Not logged in' });
    }

    // Reject writes from sessions that predate an admin reset so an active
    // student can't silently repopulate the zeroed leaderboard from a stale tab.
    const staleReset = await getStaleReset(user);
    if (staleReset) {
      const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
      res.setHeader('Set-Cookie', `workshop_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
      log.info('progress_write_stale_reset', { requestId, user: user.name, slug: user.slug || '', resetAt: staleReset });
      return res.status(401).json({ error: 'Session invalidated by workshop reset', reset: true, resetAt: staleReset });
    }

    const slug = user.slug || '';
    const prefix = slug ? `client:${slug}:` : 'workshop:';

    const { chat, apps, agents } = req.body || {};
    const userKey = user.uid ? `${user.name}::${user.uid}` : user.name;
    const defaults = { completed: [], points: 0 };
    const t0 = Date.now();

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

      const durMs = Date.now() - t0;
      log.info('progress_write_ok', { requestId, user: user.name, slug, userKey, totalPoints: data.totalPoints, durMs });
      // Audit the write with full payload so we can recover from data if Redis
      // is wiped or restored from a stale snapshot. Includes prior + new state.
      await audit(`progress:${slug || 'default'}`, {
        event: 'write',
        requestId,
        user: user.name,
        userKey,
        slug,
        prior: existing,
        next: data,
      });
      return res.status(200).json({ ok: true, requestId });
    } catch (e) {
      const durMs = Date.now() - t0;
      log.error('progress_write_failed', { requestId, user: user.name, slug, userKey, durMs, err: e });
      return res.status(500).json({ error: 'Redis error', detail: e.message, requestId });
    }
  }

  log.warn('progress_method_not_allowed', { requestId, method: req.method });
  return res.status(405).json({ error: 'Method not allowed' });
}
