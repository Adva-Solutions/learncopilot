// Regression for the admin participants table.
//
// admin.html renders one row per participant in renderWorkshopDetail. Before
// this fix the progress lookup was:
//   const progress = p.progress || p.completedLessons || 0;
// but api/admin/client.js returns each participant as the raw record from
// `client:${slug}:progress:${userKey}`, which uses the api/progress.js write
// schema: { chat:{completed,points}, apps:{completed,points}, agents:{...} }.
// Neither `p.progress` nor `p.completedLessons` exists on that shape, so
// every participant showed 0/12 in the admin view, regardless of what they
// had completed. Screenshot from the May-18 audit shows the symptom: 15
// participants, every row "0/12", several with recent Last Active dates.
//
// This test pulls the participants-render snippet out of admin.html, evals
// it against synthetic participant records, and asserts the right counts.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ADMIN_HTML = fs.readFileSync(path.join(__dirname, '..', 'admin.html'), 'utf8');

// Pull out the four lines that own the calculation. They live as a block
// inside renderWorkshopDetail right before `participants.forEach(p => {`.
function extractCalcSnippet() {
  const m = ADMIN_HTML.match(
    /const CORE = \{ chat: \d+, apps: \d+, agents: \d+ \};[\s\S]*?const coreDone = [^\n]+/
  );
  if (!m) throw new Error('CORE / coreDone snippet not found in admin.html');
  return m[0];
}

// Pull out the progress / total / pct expressions. We re-stitch them into a
// function that returns { progress, total, pct } for a given p.
function extractRowExpressions() {
  const m = ADMIN_HTML.match(
    /const progress = \(p\.chat \|\| p\.apps \|\| p\.agents\)[\s\S]*?const pct = [^\n]+/
  );
  if (!m) throw new Error('progress / total / pct expressions not found in admin.html');
  return m[0];
}

function computeForParticipant(p) {
  const code = `
    ${extractCalcSnippet()}
    function run(p) {
      ${extractRowExpressions()}
      return { progress, total, pct, TOTAL_CORE };
    }
    result = run(p);
  `;
  const sandbox = { p, result: null };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.result;
}

test('admin progress: Thalia-shaped record (full core) renders 13/13 = 100%', () => {
  const p = {
    name: 'Thalia Scagliola',
    chat:   { completed: [0, 1, 2, 3, 4, 5, 6], points: 110 },
    apps:   { completed: [0, 1, 2, 3, 4],       points: 95 },
    agents: { completed: [0, 1, 2, 3],          points: 100 },
    totalPoints: 305,
  };
  const { progress, total, pct } = computeForParticipant(p);
  assert.strictEqual(progress, 13, 'core lessons: 6 chat + 3 apps + 4 agents');
  assert.strictEqual(total, 13);
  assert.strictEqual(pct, 100);
});

test('admin progress: partial record counts only completed core lessons', () => {
  const p = {
    chat:   { completed: [0, 1, 2], points: 30 },     // 3 of 6 core
    apps:   { completed: [],        points: 0 },      // 0 of 3 core
    agents: { completed: [0],       points: 25 },     // 1 of 4 core
  };
  const { progress, total, pct } = computeForParticipant(p);
  assert.strictEqual(progress, 4);
  assert.strictEqual(total, 13);
  assert.strictEqual(pct, Math.round((4 / 13) * 100)); // 31
});

test('admin progress: bonus lessons (indexes >= CORE) do not inflate progress', () => {
  // CORE.chat = 6, so chat indexes 6, 7, 8 are bonus lessons and must not
  // count. This guards against a future regression where the filter drops.
  const p = {
    chat:   { completed: [0, 1, 6, 7], points: 60 },  // 2 core + 2 bonus
    apps:   { completed: [],           points: 0 },
    agents: { completed: [],           points: 0 },
  };
  const { progress, pct } = computeForParticipant(p);
  assert.strictEqual(progress, 2, 'only indexes < CORE.chat count');
  assert.ok(pct <= 100);
});

test('admin progress: missing chat/apps/agents falls back to legacy fields', () => {
  // Pre-migration records (or non-progress placeholders surfaced by
  // api/admin/client.js when a user is in the set without a progress key)
  // should still render via the old fields if they happen to be present.
  const p = { progress: 5, totalLessons: 10 };
  const { progress, total, pct } = computeForParticipant(p);
  assert.strictEqual(progress, 5);
  assert.strictEqual(total, 10);
  assert.strictEqual(pct, 50);
});

test('admin progress: empty placeholder participant renders 0 / TOTAL_CORE', () => {
  // api/admin/client.js seeds { name, totalPoints: 0 } when a userKey has
  // no progress record yet -- this must render as 0 / 13, not crash.
  const p = { name: 'David', totalPoints: 0 };
  const { progress, total, pct } = computeForParticipant(p);
  assert.strictEqual(progress, 0);
  assert.strictEqual(total, 13);
  assert.strictEqual(pct, 0);
});

test('admin progress: pct is capped at 100 even if data exceeds core', () => {
  // Defense-in-depth: if a participant somehow has more completed entries
  // than the core count (data corruption, schema drift), the % must not
  // exceed 100 -- the row's progress bar uses width:${pct}%.
  const p = {
    chat:   { completed: [0, 1, 2, 3, 4, 5], points: 999 }, // exactly 6 core
    apps:   { completed: [0, 1, 2],          points: 999 }, // exactly 3 core
    agents: { completed: [0, 1, 2, 3, 4, 5], points: 999 }, // 4 core + 2 bonus
  };
  const { progress, pct } = computeForParticipant(p);
  assert.strictEqual(progress, 13, 'bonus filtered out');
  assert.strictEqual(pct, 100);
});
