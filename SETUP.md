# Setup Guide

Short guide to get this repo running locally and deploying to Vercel. Aimed at new contributors (Matan, David, future collaborators).

## 1. Access you need

- **GitHub**: push access to [`Adva-Solutions/learncopilot`](https://github.com/Adva-Solutions/learncopilot). All five current collaborators have admin.
- **Vercel**: membership in the `adva-solutions` team. If you got an invite email, accept it. If not, ping Noam.
- **Node 20+** and **git** locally. Windows, macOS, or Linux all fine.

## 2. First-time local setup

```bash
git clone https://github.com/Adva-Solutions/learncopilot.git
cd learncopilot
npm install
npm i -g vercel            # if you don't already have it
vercel login
vercel link                # pick team "adva-solutions" → project "learncopilot"
vercel env pull .env.local # pulls the dev-environment secrets into .env.local
```

`vercel env pull` replaces any local `.env.local` with the Vercel-managed development env. After this you have everything the API routes need (session secret, workshop password, Redis URL, Listen Labs keys if you need them).

If you want to build without Vercel, see `.env.local.example` for the variable names. Only `SESSION_SECRET`, `WORKSHOP_PASSWORD`, and `REDIS_URL` are load-bearing for the core workshop flow; the rest are admin-panel and Listen Labs extras.

## 3. Running locally

The app is a vanilla HTML + serverless-functions project — no build step. Two ways to run:

**Full stack (recommended, serves the `/api` routes):**

```bash
vercel dev                 # defaults to http://localhost:3000
vercel dev --listen 3847   # pick any port
```

This runs the API routes under Fluid Compute, hot-reloading on file changes.

**Static only (no API):**

```bash
npx serve -l 3847
```

Login and progress sync won't work because there's no `/api`, but static courses render fine for quick content tweaks.

### The Claude Code preview helper

If you use Claude Code, `.claude/launch.json` is already configured to spin up `vercel dev` on port 3847 via the preview tools. Just ask for a preview and it launches.

## 4. Deploying

As of Apr 2026 Vercel is connected to this GitHub repo. You should not normally run `vercel deploy` by hand.

- **Merge a PR to `master`** → Vercel auto-deploys to production.
- **Push any branch** → Vercel creates a preview deployment. Check the PR comments for the URL.
- **Rollback**: on the Vercel dashboard, find the previous healthy deployment → *Promote to Production*. Fast path.
- **Manual deploy** (only if auto-deploy is broken): `vercel --prod`. Needs `vercel link` to have been run once.

Production URL: https://learncopilot.adva-solutions.com

## 5. Workflow conventions

- Branch from `master`: `fix/<thing>`, `feat/<thing>`, `chore/<thing>`.
- Open a PR; let CI and Vercel preview run.
- `master` is the default branch and is auto-deployed. Direct pushes to master are discouraged — use PRs.

## 6. Where the interesting code lives

| Path | What |
|---|---|
| [index.html](index.html) | Landing page (module cards, progress strip) |
| [login.html](login.html), [api/login.js](api/login.js), [api/me.js](api/me.js), [api/logout.js](api/logout.js) | Auth — HMAC-signed cookie tokens, no DB user table |
| [courses/copilot-chat/copilot-chat.html](courses/copilot-chat/copilot-chat.html) | Module 1 (7 lessons, 100 pts) |
| [courses/copilot-apps/copilot-apps.html](courses/copilot-apps/copilot-apps.html) | Module 2 (6 lessons, 130 pts) |
| [courses/building-agents/building-agents.html](courses/building-agents/building-agents.html) | Module 3 (10 lessons, 200 pts) |
| [api/progress.js](api/progress.js) | Redis-backed progress store with per-course merge |
| [admin.html](admin.html), [api/admin/](api/admin/) | Workshop-host admin panel (clients, personalization, reset) |
| [mock-data/](mock-data/) | ODA sample dataset used by exercises (csv, pdf, txt, xlsx) |
| [tenant-config.js](tenant-config.js) | Per-tenant branding overrides |

## 7. Environment variables reference

All set in Vercel → Project Settings → Environment Variables. Use `vercel env ls` from the repo root to see what's set where.

| Variable | Purpose | Required in |
|---|---|---|
| `SESSION_SECRET` | HMAC key for workshop-session cookies | Prod, Preview, Dev |
| `WORKSHOP_PASSWORD` | Default-workshop password for `/login.html` | Prod, Preview, Dev |
| `REDIS_URL` / `KV_*` | Progress store + client config store | Prod, Preview, Dev |
| `ADMIN_PASSWORD` | Admin panel password | Prod (+ Preview if you want) |
| `ANTHROPIC_API_KEY` | Admin-panel AI personalization calls | Prod (+ Preview if you want) |
| `LISTEN_LABS_API_KEY` / `LISTEN_LABS_STUDY_ID` | Listen Labs interview-data ingest | Prod (+ Preview if you want) |

Preview currently has the two load-bearing secrets but not the admin/Listen-Labs ones. If a preview branch needs the admin panel, copy them across with `vercel env add <NAME> preview --value <VAL>`.

## 8. Troubleshooting

| Symptom | Usually means |
|---|---|
| `/api/me` returns 500 on a preview URL | Missing `SESSION_SECRET` in Preview env. Add it and redeploy. |
| Login succeeds but progress resets on refresh | Redis is unreachable — check `REDIS_URL` and the Vercel Marketplace KV integration. |
| Course renders but download links 404 | A `mock-data/` path is stale. Open the course HTML, find the `href`, confirm the file exists. |
| Prod didn't update after merging a PR | The GitHub integration may have disconnected. Run `vercel git connect https://github.com/Adva-Solutions/learncopilot` and retry. |

## 9. Asking for help

- Workshop domain questions → Noam (maeirnoam@gmail.com)
- Infra / Vercel / deploy questions → Noam as well, for now
- Anything locking you out → open a GitHub issue with the `needs-access` label
