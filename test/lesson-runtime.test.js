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
