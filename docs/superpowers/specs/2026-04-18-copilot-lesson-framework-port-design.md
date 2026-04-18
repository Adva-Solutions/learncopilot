# Copilot Lesson Framework Port — Design

**Status:** Proposed
**Date:** 2026-04-18
**Owner:** Matan
**Parent effort:** Bring `learncopilot` to parity with `adva-learn` (reference repo: `github.com/Adva-Solutions/learn`) except for content.
**This spec covers:** Sub-project A of four. Sub-projects D (admin completeness), C (UI/shell polish), and B (security/auth hardening) follow, in that order.

---

## 1. Problem

`learncopilot` has three courses (Copilot Chat, Copilot Apps, Building Agents) authored as three monolithic HTML files with inline lesson data, inline render/nav/complete functions, and localStorage-only progress. The reference app `adva-learn` uses a data-driven `lessons.js` schema, a shared runtime, and server-backed progress. The two apps already share the same lesson object shape (`{id, title, points, learn, implement, advanced}`) and `switchTab` mechanic, so the migration is mostly mechanical: centralize the data, factor the runtime, switch progress to Redis.

End state: three thin course shells, three sibling `lessons.js` files, one shared `lesson-runtime.js`, server-sourced progress, algorithmic sidebar nav with checkmarks that persist across devices.

## 2. Non-goals

- No new content. No quizzes, reflections, or rewrites unless backed by an official Microsoft Learn citation (see §5).
- No visual/design changes. That is sub-project C.
- No auth, session, or rate-limit hardening. That is sub-project B.
- No admin-panel changes. That is sub-project D.
- No change to global nav, login, `tenant-config.js`, or `/api/progress` schema.

## 3. Constraints from product

- **Content fidelity level B**: verbatim text is the default. Structural cleanups (consolidating duplicate headings, collapsing redundant tip boxes, normalizing list markup) are allowed **only** when an official Microsoft Learn or Microsoft Copilot doc page supports the simplification. Every cleanup is cited inline as a JS comment (`// cleanup: learn.microsoft.com/en-us/copilot/...`) and in the commit trailer.
- Testing agents gate the merge. Nothing ships on a course until both gates pass on a Vercel preview URL.
- No major primitives added in this sub-project; framework capabilities do not motivate content changes.

## 4. Scope and file layout

Sub-project A touches these files only:

```
courses/
  lesson-runtime.js                    (NEW)  shared render/nav/complete/progress
  copilot-chat/
    copilot-chat.html                  (slimmed to shell)
    copilot-chat.legacy.html           (NEW, temporary) pre-migration copy
    lessons.js                         (NEW)
  copilot-apps/
    copilot-apps.html                  (slimmed)
    copilot-apps.legacy.html           (NEW, temporary)
    lessons.js                         (NEW)
  building-agents/
    building-agents.html               (slimmed)
    building-agents.legacy.html        (NEW, temporary)
    lessons.js                         (NEW)
```

Shell HTML loads its sibling `lessons.js` first, then `../lesson-runtime.js`, then calls `initCourse({...})` with its course identity.

Legacy HTML copies are kept for one week post-merge as a fast-revert path (see §10).

## 5. Content-fidelity rules (B-level)

Default: byte-for-byte verbatim move of every `learn:` / `implement:` / `advanced:` string from the source HTML into the sibling `lessons.js`. Only mechanical edits allowed: escape backticks for template-literal safety, fix relative asset paths if the HTML moves.

B-level cleanups allowed under these rules:

- The cleanup must be motivated by an official Microsoft source (URL starts with `learn.microsoft.com`, `support.microsoft.com`, or `microsoft.com/en-us/microsoft-copilot/`).
- The URL is included inline as `// cleanup: <url>` on the line above the edit.
- The URL is also included in the commit message trailer: `Cleanup-Source: <url>`.
- The testing-agent content diff (§9) HEAD-checks each cited URL; non-200 URLs fail the gate.
- No cleanup may remove a concrete example, shortcut, screenshot reference, or exercise step.
- Cleanups are separate commits from the extraction commit, one per cleanup.

## 6. Runtime contract

`courses/lesson-runtime.js` exposes:

```js
initCourse({ courseId, courseLabel, courseColor, lessons, progressCategory })
  // boots the page: GET /api/progress?me=true, builds nav, renders lesson 0 (or deep-linked lesson).
renderLesson(index)
  // renders lesson body + tab buttons into #lesson-content.
switchTab(index, tabName)
  // updates currentTab, re-renders body, persists tab choice to sessionStorage only.
markComplete(index)
  // fires confetti, POSTs progress, repaints nav checkmark.
buildNav()
  // algorithmic sidebar from lessons array: each item shows ✓ when server-side completed[] includes its index.
```

Globals read by the runtime:
- `window.LESSONS` — set by the course's `lessons.js`.
- The `initCourse({...})` call supplies course identity; no other globals are relied on.

DOM contract: the shell HTML must provide `#lesson-nav` (sidebar) and `#lesson-content` (main panel). The runtime owns everything inside those two nodes.

Keybinds: `←` / `→` navigate lessons, `1`/`2`/`3` switch tabs, matching the reference app's existing behavior.

Deep-linking: the runtime honors `#lesson-<n>` in the URL hash on load and updates the hash as the learner navigates, preserving whatever hash-based deep-link behavior exists in the current HTML. If the current HTML does not use hashes, the runtime adopts this convention and nothing is lost.

## 7. Progress wiring

The `/api/progress` endpoint already exists and already accepts `{chat, apps, agents}` keyed payloads. No server change.

**Read (on `initCourse`):**
```
GET /api/progress?me=true
→ { myProgress: { chat:{completed:[...], points:N}, apps:{...}, agents:{...} } }
```
Runtime paints checkmarks from `myProgress[progressCategory].completed`.

**Write (on `markComplete`):**
```
POST /api/progress
body: { [progressCategory]: { completed:[...,index], points: <sum> } }
```
Server's existing per-course merge logic handles concurrent writes.

**One-time migration from localStorage on first load:**
If `localStorage[copilot_<course>_progress]` has lessons completed that the server does not, POST them in a single batch write, then clear the localStorage key. Best-effort: if the POST fails, localStorage stays, retry next load. No user-visible dialog.

**Write failure handling:**
`markComplete` optimistically paints the checkmark and queues the POST. On failure, the runtime retries on next navigation and on `beforeunload`. No error dialog shown.

## 8. Extraction procedure

Per course, mechanical and agent-reviewed. Commits land in this exact order; the numbering matches §10's PR commit pattern.

1. **Copy legacy**: the pre-migration HTML is copied verbatim to `<course>.legacy.html` and committed. Establishes the fast-revert baseline before any edits.
2. **Write `lessons.js`**: a Node script locates the inline `const LESSONS = [ ... ]` block in the course HTML, copies it verbatim, wraps it as `window.LESSONS = [ ... ];`, and writes it to the sibling `lessons.js`. Mechanical edits only (backtick escapes for template-literal safety, relative asset paths if the file moves). No content edits.
3. **Slim shell**: the inline `LESSONS` array and the inline `switchTab`/`markComplete`/`buildNav`/`renderLesson` function bodies are removed from the course HTML. The sidebar `<div id="lesson-nav">` and main `<div id="lesson-content">` remain. The two `<script>` tags and the `initCourse({...})` bootstrap are appended.
4. **B-level cleanups** (optional, zero or more per course): each is a distinct commit with the `// cleanup: <url>` comment and `Cleanup-Source:` trailer.
5. **Testing gate runs** on the Vercel preview URL (§9). Both agents must pass before the PR can merge.

No reshuffling of lesson order. No renaming of lesson IDs. No points changes. No new tabs or primitives.

## 9. Testing gate

Two agents run per course PR, on the Vercel preview URL. Both must pass.

### Agent 1 — Content-parity diff

Compares the pre-migration course HTML to the post-migration rendered DOM.

- Load the preview URL in headless Playwright; for each lesson and each tab, collect the ordered text-content list after whitespace normalization and attribute stripping.
- Load the legacy HTML file similarly and collect the same structure.
- Diff the two.
- **Fails if**: any textual diff exists without a matching `// cleanup: <url>` comment in `lessons.js`, OR any cited URL HEADs non-200.
- **Passes if**: zero uncited diffs AND all citations resolve.
- Report: `N lessons, M tabs, K cited cleanups, 0 uncited diffs`.

### Agent 2 — Functional smoke

Walks the preview URL logged in as a throwaway workshop user.

- For each course, for each lesson, for each tab: click the tab button, click any Continue button, click Mark Complete.
- Assert `/api/progress` POST fires with `{[progressCategory]: {completed, points}}`; intercept via `page.on('request')`.
- Reload mid-course with localStorage cleared; assert checkmarks still paint from `GET /api/progress?me=true`.
- Assert `nav.length === lessons.length` and sum-of-points matches the course total declared in `tenant-config.js`.
- Assert no uncaught JS errors fire during the walk.
- **Fails if**: any assertion fails, any POST is 4xx/5xx, any JS error, any point-total mismatch.
- Report: `N lessons walked, M progress POSTs verified, K checkmarks persisted across reload`.

Both agents are dispatched via the `Agent` tool with explicit pass/fail criteria in their prompts; their reports are linked in the PR description.

## 10. Ordering, rollback, and feature flagging

**Migration order**: `copilot-apps` → `copilot-chat` → `building-agents`. Smallest first to de-risk the tooling; larger courses reuse the validated extraction script and runtime.

**Per-course PR pattern**:
1. Branch `feat/framework-port-<course>`.
2. Commit 1: copy HTML to `<course>.legacy.html`.
3. Commit 2: write `lessons.js` (verbatim extraction).
4. Commit 3: slim shell HTML, add runtime script tags and bootstrap.
5. Commits 4..N: B-level cleanups, one per cleanup, each with citation and trailer.
6. Testing gate on Vercel preview; both agents must pass.
7. Merge; Vercel auto-deploys to production.

**Rollback path**: if a field issue surfaces post-deploy, flip the course's pill in `tenant-config.js` to point at `/courses/<name>/legacy.html`. One-line change, no schema change. Vercel auto-deploys. Legacy file is deleted one week after the migration lands, once confidence is high.

## 11. Success criteria

- All three courses load, render, and complete via the new runtime on production.
- `/api/progress` receives a POST per Mark Complete for every course.
- Checkmarks persist across reloads and across devices (Redis-sourced).
- No uncaught JS errors in production-mode logs for 48h post-deploy per course.
- The combined `lesson-runtime.js` + three `lessons.js` files weigh no more than the three pre-migration HTML files did.
- Both testing agents pass on each course's final PR.

## 12. Open items carried to follow-on specs

- Sub-project B may change cookie signature width (16→32 hex) in a backward-compatible way. The runtime's `GET /api/progress?me=true` calls are unaffected, but the spec for B must not break existing sessions mid-workshop.
- Sub-project C (UI polish) will add the animated progress ring, course-color sidebar badges, and the Learn/Implement/Advanced tab underline animation. That work will mount on top of the `lesson-runtime.js` DOM contract established here; the contract is deliberately unopinionated about styling beyond the two container IDs.
- Sub-project D (admin) may add new fields to the `client:<slug>` Redis record (e.g., `sampleDataUrl`). Those additions do not affect the progress schema this sub-project touches.
