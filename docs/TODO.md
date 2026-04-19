# TODO — Outstanding work on learncopilot

Snapshot as of 2026-04-19. Everything below was scoped during the parity-with-`adva-learn` effort (see specs under `docs/superpowers/specs/`) and either deferred or skipped. Order roughly reflects recommended sequencing; anything is safe to pick up on its own.

---

## Security / auth hardening (sub-project B remainder)

### B-3 — bcrypt workshop passwords with plaintext fallback

**Why:** Workshop passwords are currently stored as plaintext in Redis (`client:<slug>.password`). A Redis dump → plaintext exposure. `adva-learn` hashes these.

**Scope:**
- Add `bcryptjs` dep.
- Wrap `api/admin/clients.js` POST so new workshops are created with `bcrypt.hash(password)`.
- Update `api/login.js` to `bcrypt.compare` first, then fall back to timing-safe plaintext compare for existing workshops minted before this change.
- Migrate-on-login: after a successful plaintext compare, re-hash and write back so the record upgrades transparently.
- Admin UI "change password" flow needs the same treatment.

**Risk:** Medium — login is critical path. Mistakes lock everyone out. Stage behind a feature flag or ship on a Friday night and monitor.

**Effort:** ~2 hours for the core change + test + rollout.

---

### B-4 — Progress `resetAt` gate + 90-day TTL

**Why:** Admin can reset a workshop's progress, but in-flight POSTs from learners can race the reset and resurrect deleted rows. Also, progress records never expire — old workshops accumulate Redis data indefinitely.

**Scope:**
- When admin resets progress for a workshop, write `client:<slug>.resetAt = Date.now()`.
- Learner-side: progress-write includes a `_syncedAfter: <timestamp>` value taken from the last successful read.
- Server: if `_syncedAfter < client.resetAt`, reject the write with `{ reset: true, resetAt }` and the client wipes its state + reloads.
- Add `EX 7776000` (90-day TTL) on all `workshop:progress:*` keys and on `client:*` records.

**Risk:** Medium — touches progress write path used by every course. Easy to accidentally blackhole writes.

**Effort:** ~2–3 hours with tests.

---

## Admin completeness (sub-project D remainder)

### D2 — Native-connectors registry + validator integration

**Why:** When admins generate personalization or opportunity maps (AI-backed), the validators check tool references against a curated list. The reference app (`adva-learn`) uses `known-mcps.js` + `native-connectors.js` for Claude; our repo has a thinner `m365-apps.js` for Copilot. Upgrading this improves content quality coming out of admin tooling.

**Scope:**
- Expand `api/lib/m365-apps.js` into a richer registry covering Microsoft 365 Copilot connectors (Outlook, Word, Excel, PowerPoint, Teams, Loop, SharePoint, OneDrive, Viva, Planner, Lists, Forms, Stream, Yammer, Bookings).
- Plug the registry into `api/admin/personalize.js` and `api/admin/opportunity-map.js` validators: flag tool references outside the list as generic filler.
- Unit tests for the registry + validator integration.

**Risk:** Low — affects admin-side AI tooling only; no learner exposure.

**Effort:** ~2 hours.

---

### D3 — bcrypt client passwords

Duplicate of B-3; scope was split for organizational reasons. Pick either framing. Handling them together (one PR, two call sites: `/api/login` for workshop passwords AND `/api/admin/auth` for the admin password) makes sense.

---

### D5 — Stronger admin-content validators

**Why:** Admin-submitted personalization and opportunity maps pass through AI generation. Without strong validators, generic filler ("use AI to improve your workflow") slips through.

**Scope:**
- `api/admin/validate-opp-map.js` (exists already) — add rules:
  - Reject skill blocks with fewer than N concrete verbs.
  - Require each opportunity to name at least one M365 connector (leveraging D2's registry).
  - Reject "generic filler" phrases via a phrase allowlist/denylist.
- Same treatment for `api/admin/personalize.js`.
- Unit tests per rule.

**Risk:** Low — admin-facing only; errors surface as "try again" not "broken workshop".

**Effort:** ~3 hours depending on how far you take the rule set.

---

## UI polish (sub-project C remainder)

### C4 — Course-color accents unified

**Why:** Each course has its own accent color (chat blue, apps green, agents purple) but they're applied inconsistently across the three shells. A pass to surface them in the same places — sidebar nav badge, lesson pts badge, active tab underline, Mark Complete button when completed — would look more polished.

**Scope:**
- Audit each shell for accent-color usage.
- Make sidebar `.nav-item.active` border + active tab underline use the same accent.
- Make the completed Mark Complete button use the course's accent as a success color.
- Keep existing CSS vars where they exist; introduce missing ones.

**Risk:** Very low (CSS only).

**Effort:** ~1 hour.

---

### C5 — Map page editorial richness

**Why:** `map.html` was simplified during the migration; adva-learn has a richer "dossier" layout with interview-quote cases and a value×effort heatmap matrix.

**Scope:**
- Reintroduce the filter-chip horizons (now/next/later).
- Render opportunity cases with interview-quote blocks.
- Add the matrix heatmap view as an alternative display mode.
- Preserve the existing data-fetch + PDF export logic.

**Risk:** Low — standalone page; nothing depends on it.

**Effort:** ~4–6 hours (more a design / front-end task than an engineering one).

---

## Known issues

### `tenant-config.js` point-total inconsistency

Three courses declare different totals with no consistent semantic:

| Course | `totalSteps` | `totalPoints` | `CORE_COUNT` | `CORE_POINTS` | `lessons.js` sum | Bonus flag |
|---|---|---|---|---|---|---|
| chat | 6 | 80 | 6 | 90 | 100 (7 lessons) | none |
| apps | 5 | 105 | 5 | 105 | 130 (6 lessons) | 1 bonus |
| agents | 10 | 200 | 8 | 155 | 200 (10 lessons) | 2 bonus |

- Apps matches CORE (bonus excluded from tenant).
- Agents matches full total (bonus included).
- Chat matches nothing — numbers appear stale from before a content rev.

**Decision needed:** should `totalPoints` represent the goal-for-100% (core only) or the max-achievable (with bonus)? Either way, chat needs an update, and lessons that should be bonus need `bonus: true` flagged.

**Effort:** 15 minutes once the decision is made.

---

### Vercel preview Deployment Protection (SSO)

Automated functional-smoke agents can't hit preview URLs because every route returns 401 with a `_vercel_sso_nonce` challenge. Production smokes via `curl` stood in during the session.

**Options if automation is desired later:**
- Generate a Protection Bypass for Automation token in Vercel → Project Settings → Deployment Protection.
- Authenticate a Vercel session cookie and pass it to the smoke agent.
- Temporarily disable Deployment Protection for a specific preview during test runs.

---

## Follow-on content (opt-in — each requires Microsoft Learn citations)

### Expand sample-file insertions

D1 shipped with ONE `.sample-file-callout` equivalent (the banner in Copilot Apps). To surface assigned sample files inside specific lessons (Word, PowerPoint, Outlook, Excel exercises individually), each insertion is a content edit in that course's `lessons.js` and must carry a `// cleanup: <microsoft-learn-url>` citation per the content-fidelity rule from sub-project A.

**Suggested first expansions (Copilot Apps):**
- Word lesson → `data-category="general"` callout backed by the workshop's uploaded DOCX.
- Excel lesson → `data-category="finance"` callout backed by the workshop's uploaded XLSX.
- PowerPoint lesson → `data-category="marketing"` callout.

---

## Housekeeping / maintenance

- **CI**: there is no GitHub Actions workflow running `npm test` on push. Adding one would catch test regressions before merge. ~30 min.
- **Test coverage**: current tests cover pure helpers (37/37). Runtime DOM behavior and admin endpoints rely on manual Playwright smoke scripts under `test/smoke/` that require env credentials to run. A mocked integration harness would make these reproducible in CI.
- **`.vercel/` + stray untracked files**: `git status` historically shows a stray 0-byte `learncopilot` file in the repo root. Cleanup: `rm learncopilot`. Trivial.

---

## What was shipped 2026-04-18/19 (for reference)

14 PRs (#12 – #25): lesson-runtime foundation + three course migrations, visual parity, per-course renderers, admin login error display, housekeeping with auto-advance on Mark Complete, D1 sample-files library, C1-C3 UI polish (tabs + progress bar + leaderboard), B-1 defensive layer (rate-limits + CSRF + progress auth gate), B-2 32-hex session signatures with backward-compat.

Full details under `docs/superpowers/specs/` and `docs/superpowers/plans/`.
