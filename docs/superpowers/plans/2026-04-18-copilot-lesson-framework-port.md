# Copilot Lesson Framework Port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate three Copilot courses from monolithic HTML with inline LESSONS arrays and localStorage progress to a data-driven layout with shared runtime and Redis-backed progress, without changing content.

**Architecture:** One shared `courses/lesson-runtime.js` exposes `initCourse({...})` plus pure helpers; three sibling `lessons.js` files hold the verbatim-extracted LESSONS arrays; three slimmed course shells boot the runtime. Progress flows through the existing `/api/progress` endpoint. A Node-based extraction script drives the data migration. Node's built-in `node:test` runs unit tests on pure logic; two dispatched agents gate DOM/integration behavior on the Vercel preview URL.

**Tech Stack:** Vanilla HTML/JS, Node 22, `node:test`, existing `/api/progress` endpoint, Vercel preview URLs for staging, `Agent` tool for the two testing gates.

**Spec reference:** `docs/superpowers/specs/2026-04-18-copilot-lesson-framework-port-design.md`

---

## File map

**Created (permanent):**
- `courses/lesson-runtime.js` — shared runtime, ~300 LOC
- `courses/copilot-apps/lessons.js` — extracted data
- `courses/copilot-chat/lessons.js` — extracted data
- `courses/building-agents/lessons.js` — extracted data
- `scripts/extract-lessons.js` — extraction tool, ~80 LOC
- `test/lesson-runtime.test.js` — unit tests for pure logic
- `test/extract-lessons.test.js` — unit tests for extractor

**Modified:**
- `package.json` — add `"test": "node --test test/"` script
- `courses/copilot-apps/copilot-apps.html` — slimmed shell
- `courses/copilot-chat/copilot-chat.html` — slimmed shell
- `courses/building-agents/building-agents.html` — slimmed shell

**Created (temporary, deleted after 1-week stability window):**
- `courses/copilot-apps/copilot-apps.legacy.html`
- `courses/copilot-chat/copilot-chat.legacy.html`
- `courses/building-agents/building-agents.legacy.html`

**Unchanged:**
- `api/progress.js`, `api/login.js`, `api/me.js`, `tenant-config.js`, `admin.html`, `index.html`, global nav, all of `api/admin/`.

**Known extraction landmarks (verified):**

| Course | HTML lines for `LESSONS` block | localStorage key |
|---|---|---|
| copilot-apps | 168–819 | `apps-completed` |
| copilot-chat | 553–1659 | `chat-completed-v2` |
| building-agents | 637–2031 | `agents-completed` |

All three store the logged-in user at `localStorage.workshop_user`.

---

## Phase 1 — Foundation (runtime + extractor, one PR)

### Task 1: Project setup — test script and directories

**Files:**
- Modify: `package.json`
- Create: `test/` (directory)
- Create: `scripts/` (directory)

- [ ] **Step 1: Add test script to package.json**

Read `package.json`, then overwrite with:

```json
{
  "name": "learncopilot",
  "private": true,
  "scripts": {
    "test": "node --test test/"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.88.0",
    "ioredis": "^5.10.1"
  }
}
```

- [ ] **Step 2: Create directories**

```bash
mkdir -p test scripts
```

- [ ] **Step 3: Confirm test runner works with an empty suite**

```bash
echo "// placeholder" > test/.keep
npm test
```

Expected: exits 0 with `# tests 0`.

- [ ] **Step 4: Commit**

```bash
git add package.json test scripts
git commit -m "chore: add node:test harness and scripts dir"
```

---

### Task 2: Write extraction script — failing test first

**Files:**
- Create: `test/extract-lessons.test.js`
- Create: `scripts/extract-lessons.js`

- [ ] **Step 1: Write the failing test**

Create `test/extract-lessons.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
const { extractLessons } = require('../scripts/extract-lessons.js');

const SAMPLE_HTML = `<!DOCTYPE html>
<html><body>
<script>
let completed = [];
const LESSONS = [
  { id: 0, title: "Hello", points: 5, learn: \`<p>one</p>\`, implement: \`<p>two</p>\`, advanced: \`<p>three</p>\` },
  { id: 1, title: "World", points: 10, learn: \`<p>four</p>\`, implement: \`<p>five</p>\`, advanced: \`<p>six</p>\` }
];
let currentLesson = 0;
</script>
</body></html>`;

test('extractLessons returns the LESSONS block verbatim', () => {
  const out = extractLessons(SAMPLE_HTML);
  assert.ok(out.startsWith('const LESSONS = ['));
  assert.ok(out.includes('"Hello"'));
  assert.ok(out.includes('"World"'));
  assert.ok(out.trim().endsWith('];'));
});

test('extractLessons throws when no LESSONS block present', () => {
  assert.throws(
    () => extractLessons('<html><body>no script</body></html>'),
    /LESSONS block not found/
  );
});

test('extractLessons throws when multiple LESSONS blocks present', () => {
  const doubled = SAMPLE_HTML + SAMPLE_HTML;
  assert.throws(
    () => extractLessons(doubled),
    /multiple LESSONS blocks/
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL with `Cannot find module '../scripts/extract-lessons.js'`.

- [ ] **Step 3: Write the minimal implementation**

Create `scripts/extract-lessons.js`:

```js
'use strict';

function extractLessons(html) {
  const startRe = /\nconst LESSONS = \[/g;
  const matches = [...html.matchAll(startRe)];
  if (matches.length === 0) throw new Error('LESSONS block not found');
  if (matches.length > 1) throw new Error('multiple LESSONS blocks found');

  const startIdx = matches[0].index + 1;
  let depth = 0;
  let inStr = null;
  let inBacktick = false;
  let i = startIdx + 'const LESSONS = '.length;

  for (; i < html.length; i++) {
    const c = html[i];
    const prev = html[i - 1];

    if (inStr) {
      if (c === inStr && prev !== '\\') inStr = null;
      continue;
    }
    if (inBacktick) {
      if (c === '`' && prev !== '\\') inBacktick = false;
      continue;
    }

    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === '`') { inBacktick = true; continue; }
    if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      if (depth === 0) {
        // include the closing ']' and optional trailing ';'
        let end = i + 1;
        if (html[end] === ';') end++;
        return html.slice(startIdx, end);
      }
    }
  }
  throw new Error('LESSONS block unterminated');
}

module.exports = { extractLessons };

if (require.main === module) {
  const inFile = process.argv[2];
  const outFile = process.argv[3];
  if (!inFile || !outFile) {
    console.error('usage: node scripts/extract-lessons.js <course.html> <lessons.js>');
    process.exit(2);
  }
  const html = require('node:fs').readFileSync(inFile, 'utf8');
  const block = extractLessons(html);
  const js = '// AUTO-EXTRACTED by scripts/extract-lessons.js — do not hand-edit without updating the extractor.\n'
    + 'window.LESSONS = ' + block.replace(/^const LESSONS = /, '').replace(/;\s*$/, '') + ';\n';
  require('node:fs').writeFileSync(outFile, js);
  console.log('wrote', outFile, '(' + js.length + ' bytes)');
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: PASS — 3 tests, 0 failures.

- [ ] **Step 5: Commit**

```bash
git add scripts/extract-lessons.js test/extract-lessons.test.js
git commit -m "feat: add lessons extraction script with balanced-bracket parser"
```

---

### Task 3: Runtime pure logic — `buildNav`, `sumPoints`, `diffCompleted`

**Files:**
- Create: `test/lesson-runtime.test.js`
- Create: `courses/lesson-runtime.js`

- [ ] **Step 1: Write the failing tests**

Create `test/lesson-runtime.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const {
  buildNav,
  sumPoints,
  diffCompleted,
  computeLocalStorageMigration,
} = require('../courses/lesson-runtime.js');

const LESSONS = [
  { id: 0, title: 'Alpha',   points: 5,  learn: 'L', implement: 'I', advanced: 'A' },
  { id: 1, title: 'Beta',    points: 10, learn: 'L', implement: 'I', advanced: 'A' },
  { id: 2, title: 'Gamma',   points: 15, learn: 'L', implement: 'I', advanced: 'A' },
];

test('buildNav marks completed items', () => {
  const nav = buildNav(LESSONS, new Set([0, 2]), 1);
  assert.deepStrictEqual(nav, [
    { index: 0, title: 'Alpha', points: 5,  completed: true,  active: false },
    { index: 1, title: 'Beta',  points: 10, completed: false, active: true  },
    { index: 2, title: 'Gamma', points: 15, completed: true,  active: false },
  ]);
});

test('sumPoints totals only completed lessons', () => {
  assert.strictEqual(sumPoints(LESSONS, [0, 2]), 20);
  assert.strictEqual(sumPoints(LESSONS, []),      0);
  assert.strictEqual(sumPoints(LESSONS, [0,1,2]), 30);
});

test('sumPoints ignores unknown indices', () => {
  assert.strictEqual(sumPoints(LESSONS, [0, 99]), 5);
});

test('diffCompleted returns local entries missing from server', () => {
  assert.deepStrictEqual(diffCompleted([0,1,2], [1]), [0,2]);
  assert.deepStrictEqual(diffCompleted([1], [0,1,2]), []);
  assert.deepStrictEqual(diffCompleted([], []), []);
});

test('computeLocalStorageMigration: server already ahead — no write, clear local', () => {
  const r = computeLocalStorageMigration({
    localCompleted: [0],
    serverCompleted: [0, 1],
    lessons: LESSONS,
  });
  assert.strictEqual(r.shouldWrite, false);
  assert.strictEqual(r.shouldClearLocal, true);
});

test('computeLocalStorageMigration: local has newer entries — write union, clear local', () => {
  const r = computeLocalStorageMigration({
    localCompleted: [0, 2],
    serverCompleted: [0],
    lessons: LESSONS,
  });
  assert.strictEqual(r.shouldWrite, true);
  assert.deepStrictEqual(r.mergedCompleted.sort(), [0, 2]);
  assert.strictEqual(r.mergedPoints, 20);
  assert.strictEqual(r.shouldClearLocal, true);
});

test('computeLocalStorageMigration: no local data — noop', () => {
  const r = computeLocalStorageMigration({
    localCompleted: [],
    serverCompleted: [0],
    lessons: LESSONS,
  });
  assert.strictEqual(r.shouldWrite, false);
  assert.strictEqual(r.shouldClearLocal, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../courses/lesson-runtime.js'`.

- [ ] **Step 3: Write the minimal implementation**

Create `courses/lesson-runtime.js`:

```js
'use strict';

// Pure helpers — testable with node:test.

function buildNav(lessons, completedSet, currentIndex) {
  return lessons.map((l, i) => ({
    index: i,
    title: l.title,
    points: l.points,
    completed: completedSet.has(i),
    active: i === currentIndex,
  }));
}

function sumPoints(lessons, completedIndices) {
  let total = 0;
  for (const i of completedIndices) {
    if (lessons[i]) total += lessons[i].points;
  }
  return total;
}

function diffCompleted(localArr, serverArr) {
  const server = new Set(serverArr);
  return localArr.filter(i => !server.has(i));
}

function computeLocalStorageMigration({ localCompleted, serverCompleted, lessons }) {
  if (!localCompleted || localCompleted.length === 0) {
    return { shouldWrite: false, shouldClearLocal: false };
  }
  const missing = diffCompleted(localCompleted, serverCompleted);
  if (missing.length === 0) {
    return { shouldWrite: false, shouldClearLocal: true };
  }
  const merged = Array.from(new Set([...serverCompleted, ...localCompleted])).sort((a,b)=>a-b);
  return {
    shouldWrite: true,
    shouldClearLocal: true,
    mergedCompleted: merged,
    mergedPoints: sumPoints(lessons, merged),
  };
}

// Dual export: <script> loads attach to window; node:test requires via CommonJS.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildNav, sumPoints, diffCompleted, computeLocalStorageMigration };
}
if (typeof window !== 'undefined') {
  window.LessonRuntime = Object.assign(window.LessonRuntime || {}, {
    buildNav, sumPoints, diffCompleted, computeLocalStorageMigration,
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS — 10 total tests (3 from Task 2 + 7 from Task 3), 0 failures.

- [ ] **Step 5: Commit**

```bash
git add courses/lesson-runtime.js test/lesson-runtime.test.js
git commit -m "feat(runtime): pure helpers buildNav/sumPoints/diffCompleted/computeMigration with tests"
```

---

### Task 4: Runtime DOM layer — `renderLesson`, `switchTab`, `markComplete`, `installKeybinds`, `initCourse`

No unit test for DOM behavior — the two dispatched testing agents (Tasks 10 / 14 / 18, etc.) cover integration. Keep this task purely additive — do not modify the pure helpers from Task 3.

**Files:**
- Modify: `courses/lesson-runtime.js` (append below the dual-export footer)

- [ ] **Step 1: Append the DOM layer**

At the top of `courses/lesson-runtime.js`, below the `'use strict';` line, add `// --- Pure helpers ---`. Then **after** the existing dual-export block, append:

```js
// --- DOM layer (browser only) ---
if (typeof window !== 'undefined') {

let state = null; // { courseId, progressCategory, lessons, currentLesson, currentTab, completed: Set, pendingWrite: Promise|null, flushTimer: number|null }

function qs(id) { return document.getElementById(id); }

function renderLesson(index) {
  if (!state) return;
  const L = state.lessons[index];
  if (!L) return;
  state.currentLesson = index;
  const main = qs('lesson-content');
  if (!main) return;
  const tab = state.currentTab;
  main.innerHTML = `
    <div class="lesson-header">
      <h1>${escapeHtml(L.title)} <span class="pts-badge">${L.points} pts</span></h1>
    </div>
    <div class="tabs">
      <button class="tab-btn${tab==='learn'?' active':''}"     onclick="LessonRuntime.switchTab(${index},'learn')">Learn</button>
      <button class="tab-btn${tab==='implement'?' active':''}" onclick="LessonRuntime.switchTab(${index},'implement')">Exercises</button>
      <button class="tab-btn${tab==='advanced'?' active':''}"  onclick="LessonRuntime.switchTab(${index},'advanced')">Advanced</button>
    </div>
    <div class="tab-content content-animate">${L[tab] || ''}</div>
    <div class="lesson-footer">
      <button class="mark-complete-btn${state.completed.has(index)?' completed':''}"
              onclick="LessonRuntime.markComplete(${index})">
        ${state.completed.has(index) ? '✓ Completed' : 'Mark Complete'}
      </button>
    </div>`;
  repaintNav();
  if (location.hash !== '#lesson-' + index) {
    history.replaceState(null, '', '#lesson-' + index);
  }
}

function switchTab(index, tabName) {
  if (!state) return;
  if (!['learn','implement','advanced'].includes(tabName)) return;
  state.currentTab = tabName;
  try { sessionStorage.setItem('tab:' + state.courseId, tabName); } catch (_) {}
  renderLesson(index);
}

function markComplete(index) {
  if (!state) return;
  if (state.completed.has(index)) return;
  state.completed.add(index);
  repaintNav();
  const btn = document.querySelector('.mark-complete-btn');
  if (btn) { btn.textContent = '✓ Completed'; btn.classList.add('completed'); }
  scheduleFlush();
}

function repaintNav() {
  if (!state) return;
  const nav = qs('lesson-nav');
  if (!nav) return;
  const items = window.LessonRuntime.buildNav(state.lessons, state.completed, state.currentLesson);
  nav.innerHTML = items.map(it => `
    <a class="lesson-nav-item${it.active?' active':''}${it.completed?' completed':''}"
       href="#lesson-${it.index}"
       onclick="event.preventDefault(); LessonRuntime.gotoLesson(${it.index})">
      <span class="check">${it.completed ? '✓' : ''}</span>
      <span class="title">${escapeHtml(it.title)}</span>
      <span class="pts">${it.points} pts</span>
    </a>`).join('');
}

function gotoLesson(index) {
  if (!state) return;
  if (index < 0 || index >= state.lessons.length) return;
  renderLesson(index);
}

function scheduleFlush() {
  if (!state) return;
  if (state.flushTimer) clearTimeout(state.flushTimer);
  state.flushTimer = setTimeout(flush, 250); // debounce bursts of completes
}

async function flush() {
  if (!state) return;
  const completed = Array.from(state.completed).sort((a,b)=>a-b);
  const points = window.LessonRuntime.sumPoints(state.lessons, completed);
  const body = { [state.progressCategory]: { completed, points } };
  try {
    const r = await fetch('/api/progress', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
  } catch (_) {
    // keep retrying on nav / beforeunload
    setTimeout(scheduleFlush, 3000);
  }
}

async function loadServerProgress() {
  try {
    const r = await fetch('/api/progress?me=true', { credentials: 'include' });
    if (!r.ok) return { completed: [] };
    const data = await r.json();
    const mine = (data && data.myProgress && data.myProgress[state.progressCategory]) || {};
    return { completed: Array.isArray(mine.completed) ? mine.completed : [] };
  } catch (_) {
    return { completed: [] };
  }
}

function readLocalCompleted(courseId) {
  const keyByCourse = {
    'copilot-apps':    'apps-completed',
    'copilot-chat':    'chat-completed-v2',
    'building-agents': 'agents-completed',
  };
  const key = keyByCourse[courseId];
  if (!key) return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; }
}

function clearLocalCompleted(courseId) {
  const keyByCourse = {
    'copilot-apps':    'apps-completed',
    'copilot-chat':    'chat-completed-v2',
    'building-agents': 'agents-completed',
  };
  const key = keyByCourse[courseId];
  if (key) try { localStorage.removeItem(key); } catch (_) {}
}

function installKeybinds() {
  document.addEventListener('keydown', (e) => {
    if (!state) return;
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') gotoLesson(state.currentLesson + 1);
    else if (e.key === 'ArrowLeft') gotoLesson(state.currentLesson - 1);
    else if (e.key === '1') switchTab(state.currentLesson, 'learn');
    else if (e.key === '2') switchTab(state.currentLesson, 'implement');
    else if (e.key === '3') switchTab(state.currentLesson, 'advanced');
  });
  window.addEventListener('beforeunload', () => { if (state && state.flushTimer) flush(); });
}

async function initCourse({ courseId, progressCategory, lessons }) {
  state = {
    courseId, progressCategory, lessons,
    currentLesson: 0,
    currentTab: (function(){
      try { return sessionStorage.getItem('tab:' + courseId) || 'learn'; } catch(_) { return 'learn'; }
    })(),
    completed: new Set(),
    flushTimer: null,
  };

  const server = await loadServerProgress();
  const local  = readLocalCompleted(courseId);
  const mig    = window.LessonRuntime.computeLocalStorageMigration({
    localCompleted: local, serverCompleted: server.completed, lessons,
  });

  for (const i of server.completed) state.completed.add(i);
  if (mig.shouldWrite) {
    for (const i of mig.mergedCompleted) state.completed.add(i);
    scheduleFlush();
  }
  if (mig.shouldClearLocal) clearLocalCompleted(courseId);

  // Deep-link from #lesson-<n> if present.
  const m = /^#lesson-(\d+)$/.exec(location.hash);
  const startIdx = m ? Math.min(Math.max(parseInt(m[1],10),0), lessons.length-1) : 0;
  state.currentLesson = startIdx;

  installKeybinds();
  renderLesson(state.currentLesson);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

window.LessonRuntime = Object.assign(window.LessonRuntime || {}, {
  initCourse, renderLesson, switchTab, markComplete, gotoLesson,
});

} // end if (typeof window !== 'undefined')
```

- [ ] **Step 2: Run unit tests — they should still pass (pure helpers untouched)**

```bash
npm test
```

Expected: PASS — 10 tests, 0 failures. DOM code is gated behind `typeof window !== 'undefined'` so `require()` in tests doesn't execute it.

- [ ] **Step 3: Commit**

```bash
git add courses/lesson-runtime.js
git commit -m "feat(runtime): add DOM layer (initCourse, renderLesson, switchTab, markComplete, nav, keybinds)"
```

---

### Task 5: Open foundation PR

**Files:** none

- [ ] **Step 1: Push branch and open PR**

```bash
git checkout -b feat/lesson-runtime-foundation
git push -u origin feat/lesson-runtime-foundation
gh pr create --title "Lesson runtime foundation (no course migrations yet)" --body "$(cat <<'EOF'
## Summary
- Adds shared `courses/lesson-runtime.js` with pure helpers and DOM layer
- Adds `scripts/extract-lessons.js` with unit tests
- Adds `node --test` harness (no new dependency — built in to Node 22)

## Scope
Foundation only. No course HTML is modified by this PR. The three course migrations follow in separate PRs (apps → chat → agents).

## Test plan
- [x] `npm test` — 10 unit tests green (runtime pure helpers + extractor)
- [ ] Reviewer: sanity-scan the DOM layer; no behavior tests until per-course PRs land
EOF
)"
```

- [ ] **Step 2: Merge after review**

Expected: branch merges cleanly to `master`; Vercel auto-deploys. Foundation is now live but unused.

---

## Phase 2 — copilot-apps migration (smallest course, first)

### Task 6: Branch and copy legacy

**Files:**
- Create: `courses/copilot-apps/copilot-apps.legacy.html`

- [ ] **Step 1: Branch from fresh master**

```bash
git checkout master && git pull
git checkout -b feat/framework-port-copilot-apps
```

- [ ] **Step 2: Copy legacy**

```bash
cp courses/copilot-apps/copilot-apps.html courses/copilot-apps/copilot-apps.legacy.html
```

- [ ] **Step 3: Commit**

```bash
git add courses/copilot-apps/copilot-apps.legacy.html
git commit -m "chore(apps): snapshot pre-migration HTML as legacy fast-revert"
```

---

### Task 7: Run extractor for copilot-apps

**Files:**
- Create: `courses/copilot-apps/lessons.js`

- [ ] **Step 1: Run extractor**

```bash
node scripts/extract-lessons.js \
  courses/copilot-apps/copilot-apps.html \
  courses/copilot-apps/lessons.js
```

Expected stdout: `wrote courses/copilot-apps/lessons.js (NNNN bytes)` where NNNN is nonzero.

- [ ] **Step 2: Spot-check the output**

```bash
head -3 courses/copilot-apps/lessons.js
tail -3 courses/copilot-apps/lessons.js
wc -l courses/copilot-apps/lessons.js
```

Expected: first line is the AUTO-EXTRACTED comment, second line starts with `window.LESSONS = [`, last line ends with `];`. Line count should be ~650.

- [ ] **Step 3: Commit**

```bash
git add courses/copilot-apps/lessons.js
git commit -m "feat(apps): extract LESSONS array into courses/copilot-apps/lessons.js (verbatim)"
```

---

### Task 8: Slim copilot-apps shell

**Files:**
- Modify: `courses/copilot-apps/copilot-apps.html`

- [ ] **Step 1: Open the HTML and remove the inline LESSONS + inline handlers**

Edit `courses/copilot-apps/copilot-apps.html`:

1. Delete lines 168–819 (the `const LESSONS = [ ... ];` block, verified by Task 7's commit diff).
2. Delete the inline `let completed = ...`, `let currentLesson = 0`, and any inline `switchTab`, `markComplete`, `renderLesson`, `buildNav` function definitions within the same `<script>`. Grep-confirm with:

```bash
grep -nE "(function switchTab|function markComplete|function renderLesson|function buildNav|localStorage\\.(set|get)Item\\('apps-completed)" courses/copilot-apps/copilot-apps.html
```

Expected after edit: no matches.

3. Ensure the shell has (or add) these two container nodes in the `<body>`:

```html
<div id="lesson-nav"></div>
<div id="lesson-content"></div>
```

If they already exist with different IDs, rename them; if they don't exist, insert them where the inline rendering used to target.

4. Just before `</body>`, replace whatever bootstrap the legacy file had with:

```html
<script src="lessons.js"></script>
<script src="../lesson-runtime.js"></script>
<script>
  window.LessonRuntime.initCourse({
    courseId: 'copilot-apps',
    progressCategory: 'apps',
    lessons: window.LESSONS,
  });
</script>
```

- [ ] **Step 2: Local smoke — visit the page via `vercel dev`**

```bash
vercel dev --listen 3847
```

Open http://localhost:3847/courses/copilot-apps/copilot-apps.html in a browser. Verify:
- Sidebar lists all lessons with point totals.
- Clicking a lesson renders its Learn tab.
- Tab buttons switch between Learn / Exercises / Advanced.
- Clicking Mark Complete flips the button to "✓ Completed" and the sidebar item gains a checkmark.
- Reload the page — the checkmark persists (sourced from `/api/progress` since localStorage was cleared by the migration).
- Open DevTools Network tab — confirm a `POST /api/progress` fires within ~250ms of clicking Mark Complete, with body `{ apps: { completed: [...], points: N } }`.

If any step fails, fix the shell or the runtime and re-test; do **not** proceed until local smoke passes.

- [ ] **Step 3: Unit tests still pass**

```bash
npm test
```

Expected: 10/10 green.

- [ ] **Step 4: Commit**

```bash
git add courses/copilot-apps/copilot-apps.html
git commit -m "feat(apps): slim shell to load lessons.js + lesson-runtime.js"
```

---

### Task 9: Push branch and get preview URL

**Files:** none

- [ ] **Step 1: Push**

```bash
git push -u origin feat/framework-port-copilot-apps
```

- [ ] **Step 2: Open PR and capture Vercel preview URL**

```bash
gh pr create --title "Framework port: copilot-apps" --body "$(cat <<'EOF'
## Summary
- Copy legacy HTML to `copilot-apps.legacy.html` (fast-revert path)
- Extract inline LESSONS array to `courses/copilot-apps/lessons.js`
- Slim shell to boot via `lesson-runtime.js`

## Testing gate
- Content-parity agent: _pending_
- Functional-smoke agent: _pending_
- Local manual smoke: PASS

## Revert path
Flip course pill in `tenant-config.js` to `/courses/copilot-apps/copilot-apps.legacy.html`.
EOF
)"
```

Wait for the Vercel bot comment. Record the preview URL (looks like `https://learncopilot-<hash>-adva-solutions.vercel.app`). Export it:

```bash
export PREVIEW_URL="<paste-url-here>"
```

---

### Task 10: Dispatch content-parity testing agent

**Files:** none

- [ ] **Step 1: Dispatch the agent**

Use the `Agent` tool with `subagent_type: "general-purpose"` and this exact prompt (substitute `$PREVIEW_URL`):

> You are a testing agent. Compare the pre-migration legacy HTML to the post-migration rendered DOM for the `copilot-apps` course.
>
> Inputs:
> - Legacy file: `/Users/matanbengigi/Desktop/Copilot workshop/learncopilot/courses/copilot-apps/copilot-apps.legacy.html`
> - Live URL: `$PREVIEW_URL/courses/copilot-apps/copilot-apps.html`
> - Extracted data: `/Users/matanbengigi/Desktop/Copilot workshop/learncopilot/courses/copilot-apps/lessons.js`
>
> Procedure:
> 1. Parse the legacy HTML, find `const LESSONS = [...]`, and build a map of lesson index → { title, learn, implement, advanced }.
> 2. Parse `lessons.js` and build the same map from `window.LESSONS`.
> 3. For each lesson and each tab, normalize whitespace (collapse runs of whitespace to single space, trim) on the HTML string. Compute a diff.
> 4. For every diff, search `lessons.js` for a `// cleanup: <url>` comment adjacent to the changed string. If no citation, record as an uncited diff.
> 5. For every cited URL, HEAD-request it. Any non-200 is a failed citation.
> 6. Optionally: visit `$PREVIEW_URL/courses/copilot-apps/copilot-apps.html` with Playwright or curl and confirm the page renders (HTTP 200, contains `<div id="lesson-content">`).
>
> Pass criteria: zero uncited diffs AND zero failed citations.
>
> Report format:
> - Total lessons, total tabs, total diffs, uncited diffs, cited cleanups, failed citations.
> - If any uncited diff or failed citation, list the lesson index + tab + first 100 chars of the differing text.
> - Final line: `RESULT: PASS` or `RESULT: FAIL`.

- [ ] **Step 2: Read the report**

If `RESULT: PASS`, proceed to Task 11. If `RESULT: FAIL`, fix the flagged issues (add a citation for an intentional cleanup, or revert an accidental content change), re-commit, re-push, re-run the agent. Do not proceed with failures.

---

### Task 11: Dispatch functional-smoke testing agent

**Files:** none

- [ ] **Step 1: Dispatch the agent**

Use `Agent` with `subagent_type: "general-purpose"` and this prompt:

> You are a testing agent. Verify the functional behavior of the copilot-apps course on the preview URL.
>
> Inputs:
> - Preview URL: `$PREVIEW_URL/courses/copilot-apps/copilot-apps.html`
> - Workshop login password: `$WORKSHOP_PASSWORD` (ask user if missing)
> - Expected course total points: matches sum of `points` in `/Users/matanbengigi/Desktop/Copilot workshop/learncopilot/courses/copilot-apps/lessons.js`
> - progressCategory: `apps`
>
> Procedure (use headless Playwright or equivalent):
> 1. POST to `$PREVIEW_URL/api/login` with `{ name: "TestBot", password: "$WORKSHOP_PASSWORD" }`. Keep the session cookie.
> 2. GET `$PREVIEW_URL/courses/copilot-apps/copilot-apps.html`. Wait for `#lesson-nav` to be populated.
> 3. Assert `document.querySelectorAll('#lesson-nav .lesson-nav-item').length === window.LESSONS.length`.
> 4. For each lesson index i:
>    a. Navigate via `LessonRuntime.gotoLesson(i)`.
>    b. Click each tab button (Learn, Exercises, Advanced). Assert `#lesson-content .tab-content` is non-empty after each click.
>    c. Click Mark Complete. Intercept network; assert a `POST /api/progress` fires within 2s with a body containing `"apps"` and a `"completed"` array that includes `i`.
>    d. Assert the sidebar item for lesson i now has the `completed` class.
> 5. Reload the page. Before reload, execute `localStorage.clear()` in the page. After reload, assert `document.querySelectorAll('#lesson-nav .lesson-nav-item.completed').length === window.LESSONS.length` (all checkmarks sourced from server).
> 6. Assert sum of `points` in `window.LESSONS` equals the value declared for this course in `tenant-config.js`'s `TENANT.courses.apps.totalPoints`.
> 7. Collect any uncaught JS console errors during the walk.
>
> Pass criteria: all assertions pass, all POSTs 2xx, zero uncaught errors.
>
> Report format:
> - Lessons walked, POSTs verified, checkmarks persisted across reload, console errors.
> - On failure, list the lesson index + assertion that failed + error message.
> - Final line: `RESULT: PASS` or `RESULT: FAIL`.
>
> Cleanup: delete the TestBot user progress via `POST $PREVIEW_URL/api/admin/reset` or by leaving it (workshop is time-bounded).

- [ ] **Step 2: Read the report**

On `RESULT: PASS`, proceed to Task 12. On `RESULT: FAIL`, fix, commit, push, re-run.

---

### Task 12: Merge the copilot-apps PR

**Files:** none

- [ ] **Step 1: Post both agent reports as PR comments**

```bash
gh pr comment --body "Content-parity agent: RESULT: PASS — <summary>"
gh pr comment --body "Functional-smoke agent: RESULT: PASS — <summary>"
```

- [ ] **Step 2: Merge**

```bash
gh pr merge --squash --delete-branch
```

Vercel auto-deploys. Monitor production for 30 minutes before moving to the next course.

---

## Phase 3 — copilot-chat migration

The procedure is identical to Phase 2. The same tasks, run against copilot-chat. All commands here include the full code/command, not "same as before" — reading tasks out of order must still work.

### Task 13: Branch and copy legacy (chat)

- [ ] **Step 1: Branch from fresh master**

```bash
git checkout master && git pull
git checkout -b feat/framework-port-copilot-chat
```

- [ ] **Step 2: Copy legacy**

```bash
cp courses/copilot-chat/copilot-chat.html courses/copilot-chat/copilot-chat.legacy.html
```

- [ ] **Step 3: Commit**

```bash
git add courses/copilot-chat/copilot-chat.legacy.html
git commit -m "chore(chat): snapshot pre-migration HTML as legacy fast-revert"
```

### Task 14: Run extractor for copilot-chat

- [ ] **Step 1: Run extractor**

```bash
node scripts/extract-lessons.js \
  courses/copilot-chat/copilot-chat.html \
  courses/copilot-chat/lessons.js
```

Expected stdout: `wrote courses/copilot-chat/lessons.js (NNNN bytes)`.

- [ ] **Step 2: Spot-check**

```bash
head -3 courses/copilot-chat/lessons.js
tail -3 courses/copilot-chat/lessons.js
```

Expected: same header / footer shape as apps; line count ~1100.

- [ ] **Step 3: Commit**

```bash
git add courses/copilot-chat/lessons.js
git commit -m "feat(chat): extract LESSONS array into courses/copilot-chat/lessons.js (verbatim)"
```

### Task 15: Slim copilot-chat shell

- [ ] **Step 1: Remove inline blocks**

Edit `courses/copilot-chat/copilot-chat.html`:

1. Delete lines 553–1659 (the `const LESSONS = [ ... ];` block).
2. Delete the inline `let completed = JSON.parse(localStorage.getItem('chat-completed-v2') ...)`, inline render/nav/complete functions.
3. Grep-confirm:

```bash
grep -nE "(function switchTab|function markComplete|function renderLesson|function buildNav|localStorage\\.(set|get)Item\\('chat-completed)" courses/copilot-chat/copilot-chat.html
```

Expected: no matches.

4. Ensure `<div id="lesson-nav"></div>` and `<div id="lesson-content"></div>` exist in `<body>`.
5. Just before `</body>`:

```html
<script src="lessons.js"></script>
<script src="../lesson-runtime.js"></script>
<script>
  window.LessonRuntime.initCourse({
    courseId: 'copilot-chat',
    progressCategory: 'chat',
    lessons: window.LESSONS,
  });
</script>
```

- [ ] **Step 2: Local smoke**

```bash
vercel dev --listen 3847
```

Open http://localhost:3847/courses/copilot-chat/copilot-chat.html; verify sidebar, tabs, mark-complete → POST `/api/progress` with `{ chat: {...} }`, reload persistence.

- [ ] **Step 3: Unit tests**

```bash
npm test
```

Expected: 10/10 green.

- [ ] **Step 4: Commit**

```bash
git add courses/copilot-chat/copilot-chat.html
git commit -m "feat(chat): slim shell to load lessons.js + lesson-runtime.js"
```

### Task 16: Push, open PR, capture preview URL (chat)

- [ ] **Step 1: Push and open PR**

```bash
git push -u origin feat/framework-port-copilot-chat
gh pr create --title "Framework port: copilot-chat" --body "$(cat <<'EOF'
## Summary
- Copy legacy HTML to `copilot-chat.legacy.html` (fast-revert path)
- Extract inline LESSONS array to `courses/copilot-chat/lessons.js`
- Slim shell to boot via `lesson-runtime.js`

## Testing gate
- Content-parity agent: _pending_
- Functional-smoke agent: _pending_
- Local manual smoke: PASS

## Revert path
Flip course pill in `tenant-config.js` to `/courses/copilot-chat/copilot-chat.legacy.html`.
EOF
)"
```

- [ ] **Step 2: Record preview URL**

Wait for the Vercel bot comment, then:

```bash
export PREVIEW_URL="<paste-url-here>"
```

### Task 17: Dispatch content-parity agent (chat)

- [ ] **Step 1: Dispatch the agent**

Use the `Agent` tool with `subagent_type: "general-purpose"` and this exact prompt (substitute `$PREVIEW_URL`):

> You are a testing agent. Compare the pre-migration legacy HTML to the post-migration rendered DOM for the `copilot-chat` course.
>
> Inputs:
> - Legacy file: `/Users/matanbengigi/Desktop/Copilot workshop/learncopilot/courses/copilot-chat/copilot-chat.legacy.html`
> - Live URL: `$PREVIEW_URL/courses/copilot-chat/copilot-chat.html`
> - Extracted data: `/Users/matanbengigi/Desktop/Copilot workshop/learncopilot/courses/copilot-chat/lessons.js`
>
> Procedure:
> 1. Parse the legacy HTML, find `const LESSONS = [...]`, and build a map of lesson index → { title, learn, implement, advanced }.
> 2. Parse `lessons.js` and build the same map from `window.LESSONS`.
> 3. For each lesson and each tab, normalize whitespace (collapse runs of whitespace to single space, trim) on the HTML string. Compute a diff.
> 4. For every diff, search `lessons.js` for a `// cleanup: <url>` comment adjacent to the changed string. If no citation, record as an uncited diff.
> 5. For every cited URL, HEAD-request it. Any non-200 is a failed citation.
> 6. Optionally: visit `$PREVIEW_URL/courses/copilot-chat/copilot-chat.html` with Playwright or curl and confirm the page renders (HTTP 200, contains `<div id="lesson-content">`).
>
> Pass criteria: zero uncited diffs AND zero failed citations.
>
> Report format:
> - Total lessons, total tabs, total diffs, uncited diffs, cited cleanups, failed citations.
> - If any uncited diff or failed citation, list the lesson index + tab + first 100 chars of the differing text.
> - Final line: `RESULT: PASS` or `RESULT: FAIL`.

- [ ] **Step 2: Read the report**

On `RESULT: PASS`, proceed to Task 18. On `RESULT: FAIL`, fix the flagged issues (add a citation for an intentional cleanup, or revert an accidental content change), re-commit, re-push, re-run.

### Task 18: Dispatch functional-smoke agent (chat)

- [ ] **Step 1: Dispatch the agent**

Use `Agent` with `subagent_type: "general-purpose"` and this prompt:

> You are a testing agent. Verify the functional behavior of the copilot-chat course on the preview URL.
>
> Inputs:
> - Preview URL: `$PREVIEW_URL/courses/copilot-chat/copilot-chat.html`
> - Workshop login password: `$WORKSHOP_PASSWORD` (ask user if missing)
> - Expected course total points: matches sum of `points` in `/Users/matanbengigi/Desktop/Copilot workshop/learncopilot/courses/copilot-chat/lessons.js` and `TENANT.courses.chat.totalPoints` in `tenant-config.js`
> - progressCategory: `chat`
>
> Procedure (use headless Playwright or equivalent):
> 1. POST to `$PREVIEW_URL/api/login` with `{ name: "TestBot", password: "$WORKSHOP_PASSWORD" }`. Keep the session cookie.
> 2. GET `$PREVIEW_URL/courses/copilot-chat/copilot-chat.html`. Wait for `#lesson-nav` to be populated.
> 3. Assert `document.querySelectorAll('#lesson-nav .lesson-nav-item').length === window.LESSONS.length`.
> 4. For each lesson index i:
>    a. Navigate via `LessonRuntime.gotoLesson(i)`.
>    b. Click each tab button (Learn, Exercises, Advanced). Assert `#lesson-content .tab-content` is non-empty after each click.
>    c. Click Mark Complete. Intercept network; assert a `POST /api/progress` fires within 2s with a body containing `"chat"` and a `"completed"` array that includes `i`.
>    d. Assert the sidebar item for lesson i now has the `completed` class.
> 5. Reload the page. Before reload, execute `localStorage.clear()` in the page. After reload, assert `document.querySelectorAll('#lesson-nav .lesson-nav-item.completed').length === window.LESSONS.length` (all checkmarks sourced from server).
> 6. Assert sum of `points` in `window.LESSONS` equals `TENANT.courses.chat.totalPoints` in `tenant-config.js`.
> 7. Collect any uncaught JS console errors during the walk.
>
> Pass criteria: all assertions pass, all POSTs 2xx, zero uncaught errors.
>
> Report format:
> - Lessons walked, POSTs verified, checkmarks persisted across reload, console errors.
> - On failure, list the lesson index + assertion that failed + error message.
> - Final line: `RESULT: PASS` or `RESULT: FAIL`.

- [ ] **Step 2: Read the report**

On `RESULT: PASS`, proceed to Task 19. On `RESULT: FAIL`, fix, commit, push, re-run.

### Task 19: Merge chat PR

- [ ] **Step 1: Comment both reports + merge**

```bash
gh pr comment --body "Content-parity agent: RESULT: PASS"
gh pr comment --body "Functional-smoke agent: RESULT: PASS"
gh pr merge --squash --delete-branch
```

Monitor production 30 min.

---

## Phase 4 — building-agents migration

### Task 20: Branch and copy legacy (agents)

- [ ] **Step 1**

```bash
git checkout master && git pull
git checkout -b feat/framework-port-building-agents
cp courses/building-agents/building-agents.html courses/building-agents/building-agents.legacy.html
git add courses/building-agents/building-agents.legacy.html
git commit -m "chore(agents): snapshot pre-migration HTML as legacy fast-revert"
```

### Task 21: Run extractor (agents)

- [ ] **Step 1**

```bash
node scripts/extract-lessons.js \
  courses/building-agents/building-agents.html \
  courses/building-agents/lessons.js

head -3 courses/building-agents/lessons.js
tail -3 courses/building-agents/lessons.js

git add courses/building-agents/lessons.js
git commit -m "feat(agents): extract LESSONS array into courses/building-agents/lessons.js (verbatim)"
```

Expected line count: ~1400.

### Task 22: Slim building-agents shell

- [ ] **Step 1: Remove inline blocks**

Edit `courses/building-agents/building-agents.html`:

1. Delete lines 637–2031 (the `const LESSONS = [ ... ];` block).
2. Delete inline `let completed = JSON.parse(localStorage.getItem('agents-completed') ...)` and inline handlers.
3. Grep-confirm:

```bash
grep -nE "(function switchTab|function markComplete|function renderLesson|function buildNav|localStorage\\.(set|get)Item\\('agents-completed)" courses/building-agents/building-agents.html
```

Expected: no matches.

4. Ensure `<div id="lesson-nav"></div>` and `<div id="lesson-content"></div>` exist.
5. Just before `</body>`:

```html
<script src="lessons.js"></script>
<script src="../lesson-runtime.js"></script>
<script>
  window.LessonRuntime.initCourse({
    courseId: 'building-agents',
    progressCategory: 'agents',
    lessons: window.LESSONS,
  });
</script>
```

- [ ] **Step 2: Local smoke via `vercel dev --listen 3847`.**

- [ ] **Step 3: `npm test` — 10/10.**

- [ ] **Step 4: Commit**

```bash
git add courses/building-agents/building-agents.html
git commit -m "feat(agents): slim shell to load lessons.js + lesson-runtime.js"
```

### Task 23: Push, open PR, capture preview URL (agents)

- [ ] **Step 1: Push and open PR**

```bash
git push -u origin feat/framework-port-building-agents
gh pr create --title "Framework port: building-agents" --body "$(cat <<'EOF'
## Summary
- Copy legacy HTML to `building-agents.legacy.html` (fast-revert path)
- Extract inline LESSONS array to `courses/building-agents/lessons.js`
- Slim shell to boot via `lesson-runtime.js`

## Testing gate
- Content-parity agent: _pending_
- Functional-smoke agent: _pending_
- Local manual smoke: PASS

## Revert path
Flip course pill in `tenant-config.js` to `/courses/building-agents/building-agents.legacy.html`.
EOF
)"
```

- [ ] **Step 2: Record preview URL**

```bash
export PREVIEW_URL="<paste-url-here>"
```

### Task 24: Dispatch content-parity agent (agents)

- [ ] **Step 1: Dispatch the agent**

Use the `Agent` tool with `subagent_type: "general-purpose"` and this exact prompt (substitute `$PREVIEW_URL`):

> You are a testing agent. Compare the pre-migration legacy HTML to the post-migration rendered DOM for the `building-agents` course.
>
> Inputs:
> - Legacy file: `/Users/matanbengigi/Desktop/Copilot workshop/learncopilot/courses/building-agents/building-agents.legacy.html`
> - Live URL: `$PREVIEW_URL/courses/building-agents/building-agents.html`
> - Extracted data: `/Users/matanbengigi/Desktop/Copilot workshop/learncopilot/courses/building-agents/lessons.js`
>
> Procedure:
> 1. Parse the legacy HTML, find `const LESSONS = [...]`, and build a map of lesson index → { title, learn, implement, advanced }.
> 2. Parse `lessons.js` and build the same map from `window.LESSONS`.
> 3. For each lesson and each tab, normalize whitespace (collapse runs of whitespace to single space, trim) on the HTML string. Compute a diff.
> 4. For every diff, search `lessons.js` for a `// cleanup: <url>` comment adjacent to the changed string. If no citation, record as an uncited diff.
> 5. For every cited URL, HEAD-request it. Any non-200 is a failed citation.
> 6. Optionally: visit `$PREVIEW_URL/courses/building-agents/building-agents.html` with Playwright or curl and confirm the page renders (HTTP 200, contains `<div id="lesson-content">`).
>
> Pass criteria: zero uncited diffs AND zero failed citations.
>
> Report format:
> - Total lessons, total tabs, total diffs, uncited diffs, cited cleanups, failed citations.
> - If any uncited diff or failed citation, list the lesson index + tab + first 100 chars of the differing text.
> - Final line: `RESULT: PASS` or `RESULT: FAIL`.

- [ ] **Step 2: Read the report**

On `RESULT: PASS`, proceed to Task 25. On `RESULT: FAIL`, fix, re-commit, re-push, re-run.

### Task 25: Dispatch functional-smoke agent (agents)

- [ ] **Step 1: Dispatch the agent**

Use `Agent` with `subagent_type: "general-purpose"` and this prompt:

> You are a testing agent. Verify the functional behavior of the building-agents course on the preview URL.
>
> Inputs:
> - Preview URL: `$PREVIEW_URL/courses/building-agents/building-agents.html`
> - Workshop login password: `$WORKSHOP_PASSWORD` (ask user if missing)
> - Expected course total points: matches sum of `points` in `/Users/matanbengigi/Desktop/Copilot workshop/learncopilot/courses/building-agents/lessons.js` and `TENANT.courses.agents.totalPoints` in `tenant-config.js`
> - progressCategory: `agents`
>
> Procedure (use headless Playwright or equivalent):
> 1. POST to `$PREVIEW_URL/api/login` with `{ name: "TestBot", password: "$WORKSHOP_PASSWORD" }`. Keep the session cookie.
> 2. GET `$PREVIEW_URL/courses/building-agents/building-agents.html`. Wait for `#lesson-nav` to be populated.
> 3. Assert `document.querySelectorAll('#lesson-nav .lesson-nav-item').length === window.LESSONS.length`.
> 4. For each lesson index i:
>    a. Navigate via `LessonRuntime.gotoLesson(i)`.
>    b. Click each tab button (Learn, Exercises, Advanced). Assert `#lesson-content .tab-content` is non-empty after each click.
>    c. Click Mark Complete. Intercept network; assert a `POST /api/progress` fires within 2s with a body containing `"agents"` and a `"completed"` array that includes `i`.
>    d. Assert the sidebar item for lesson i now has the `completed` class.
> 5. Reload the page. Before reload, execute `localStorage.clear()` in the page. After reload, assert `document.querySelectorAll('#lesson-nav .lesson-nav-item.completed').length === window.LESSONS.length` (all checkmarks sourced from server).
> 6. Assert sum of `points` in `window.LESSONS` equals `TENANT.courses.agents.totalPoints` in `tenant-config.js`.
> 7. Collect any uncaught JS console errors during the walk.
>
> Pass criteria: all assertions pass, all POSTs 2xx, zero uncaught errors.
>
> Report format:
> - Lessons walked, POSTs verified, checkmarks persisted across reload, console errors.
> - On failure, list the lesson index + assertion that failed + error message.
> - Final line: `RESULT: PASS` or `RESULT: FAIL`.

- [ ] **Step 2: Read the report**

On `RESULT: PASS`, proceed to Task 26. On `RESULT: FAIL`, fix, commit, push, re-run.

### Task 26: Merge building-agents PR

- [ ] **Step 1**

```bash
gh pr comment --body "Content-parity agent: RESULT: PASS"
gh pr comment --body "Functional-smoke agent: RESULT: PASS"
gh pr merge --squash --delete-branch
```

Monitor production 30 min.

---

## Phase 5 — Legacy cleanup (scheduled 1 week after Task 26 merges)

### Task 27: Delete legacy HTML files after stability window

**Files:**
- Delete: `courses/copilot-apps/copilot-apps.legacy.html`
- Delete: `courses/copilot-chat/copilot-chat.legacy.html`
- Delete: `courses/building-agents/building-agents.legacy.html`

- [ ] **Step 1: Confirm 7 days stability**

```bash
git log --since="7 days ago" --oneline -- courses/lesson-runtime.js courses/*/lessons.js
```

Read production logs / Vercel analytics for the prior week. Proceed only if no revert was triggered and no course-page JS errors spike.

- [ ] **Step 2: Delete and commit**

```bash
git checkout master && git pull
git checkout -b chore/drop-legacy-course-html
git rm courses/copilot-apps/copilot-apps.legacy.html \
       courses/copilot-chat/copilot-chat.legacy.html \
       courses/building-agents/building-agents.legacy.html
git commit -m "chore: drop legacy course HTML (1-week stability window passed)"
git push -u origin chore/drop-legacy-course-html
gh pr create --title "Drop legacy course HTML after stability window" --body "All three framework-port PRs merged >7 days ago with no reverts. Legacy fast-revert path retired."
gh pr merge --squash --delete-branch
```

---

## Follow-on work (out of scope for this plan)

- Sub-project D — admin-panel completeness (sample-files library, native-connectors registry, bcrypted client passwords, skill-block validators).
- Sub-project C — UI/shell polish (animated progress ring, course-color sidebar badges, tab underline animation, progress page badges/milestones).
- Sub-project B — security hardening (bcrypt login, login rate-limit, CSRF origin check, 32-hex signature with backward compat, progress reset gate, TTL, auth-gated leaderboard).
