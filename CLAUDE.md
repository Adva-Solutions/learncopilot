# LearnCopilot

AI-powered, multi-tenant Microsoft Copilot training platform. Delivers personalized workshops using AI-generated lesson overrides based on interview data.

## Superpowers

This project uses [superpowers](https://github.com/obra/superpowers) (submodule at `.superpowers/`) for structured development workflows. Skills are loaded automatically via the SessionStart hook.

**Available skills** (invoke via the `Skill` tool):
- `superpowers:brainstorming` - Before any creative work, feature design, or behavior changes
- `superpowers:writing-plans` - Break specs into bite-sized implementation tasks
- `superpowers:executing-plans` - Batch execution with human checkpoints
- `superpowers:test-driven-development` - RED-GREEN-REFACTOR for all features and fixes
- `superpowers:systematic-debugging` - Four-phase root-cause analysis
- `superpowers:verification-before-completion` - Evidence before claims, always
- `superpowers:subagent-driven-development` - Dispatch subagents per task with two-stage review
- `superpowers:dispatching-parallel-agents` - Concurrent subagent coordination
- `superpowers:requesting-code-review` - Pre-review validation checklist
- `superpowers:receiving-code-review` - Process and respond to feedback
- `superpowers:using-git-worktrees` - Isolated parallel development branches
- `superpowers:finishing-a-development-branch` - Merge/PR decisions
- `superpowers:writing-skills` - Create new skills using TDD principles

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (no frameworks). Courses are single-page HTML apps.
- **Backend**: Node.js serverless functions on Vercel
- **Database**: Redis (ioredis) for sessions, progress, personalization
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`) for personalization pipeline
- **Deployment**: Vercel

## Architecture

```
api/                  # Vercel serverless endpoints
  admin/              # Admin-only endpoints (auth required)
    personalize.js    # AI personalization engine (Claude Haiku + Sonnet)
    clients.js        # Multi-tenant workshop CRUD
    listen-labs.js    # Interview data import
  lib/redis.js        # Redis client pool
  login.js            # Participant auth
  progress.js         # Progress tracking & leaderboard
  workshop-config.js  # Merged personalization delivery

courses/              # Three course modules
  copilot-chat/       # Chat module (10 lessons, 140 pts)
  copilot-apps/       # Apps module (8 lessons, 200 pts)
  building-agents/    # Agents module (6 lessons, 200 pts)

index.html            # Dashboard
admin.html            # Admin panel
progress.html         # Leaderboard
login.html            # Login form
tenant-config.js      # Branding, colors, course toggles, Redis prefix
```

## Key Conventions

- **No frontend frameworks.** All UI is vanilla HTML/CSS/JS with `tenant-config.js` for branding.
- **Multi-tenant isolation** via Redis key prefixes (`client:{slug}:*`).
- **Personalization pipeline**: Interview data -> Claude Haiku compression -> Claude Sonnet generation -> JSON with `replacements` and `lessonOverrides`.
- **Auth**: Cookie-based sessions with HMAC-SHA256 signatures. Participant and admin are separate auth flows.
- **Course content** lives in monolithic HTML files per module. Each lesson has Learn/Implement/Review tabs.

## Environment Variables

Required in `.env` (never commit):
- `SESSION_SECRET` - Cookie signing key
- `WORKSHOP_PASSWORD` - Default participant password
- `ADMIN_PASSWORD` - Admin panel password
- `REDIS_URL` - Redis connection string
- `ANTHROPIC_API_KEY` - Claude API key
- `LISTEN_LABS_API_KEY` - ListenLabs interview API
- `LISTEN_LABS_STUDY_ID` - Study ID for interviews

## Development

```bash
npm install              # Install dependencies
vercel dev               # Start local dev server
```

No test framework is currently set up. When adding tests, follow TDD per the superpowers skill.
