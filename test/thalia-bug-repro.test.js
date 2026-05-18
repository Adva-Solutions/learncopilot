// Reproduction for Thalia's bug (email thread "Quick check in", 2026-05-18):
//   "On my end it still looks like it's not nothing my progress although I
//    have marked things complete."
//
// Hypothesis: when the server responds 401 to POST /api/progress (e.g.
// because getStaleReset(user) is truthy after an admin reset, or the
// session cookie was cleared), the client's flush() in lesson-runtime.js
// treats 401 as a terminal status, REPORTS the error, and returns without
// enqueuing the payload for retry. Combined with the absence of any local
// persistence of the completed[] list, the user's "Mark Complete" click is
// silently lost.
//
// This file drives the real lesson-runtime DOM layer against minimal
// browser stubs and asserts the observable behavior. It does NOT mock
// flush() itself -- it mocks fetch and inspects what flush() puts (or
// fails to put) into localStorage.

const test = require('node:test');
const assert = require('node:assert');

// ---------- minimal browser stubs ----------

const storage = new Map();
function makeStorage() {
  return {
    getItem: (k) => storage.has(k) ? storage.get(k) : null,
    setItem: (k, v) => { storage.set(k, String(v)); },
    removeItem: (k) => { storage.delete(k); },
  };
}

class FakeEl {
  constructor() {
    this.innerHTML = '';
    this.classList = { add: () => {}, remove: () => {}, contains: () => false };
    this.style = {};
    this.firstChild = null;
    this.children = [];
  }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  setAttribute() {}
  getAttribute() { return null; }
  addEventListener() {}
  insertBefore() {}
}

const elements = {
  'lesson-content': new FakeEl(),
  'lesson-nav': new FakeEl(),
};

globalThis.localStorage = makeStorage();
globalThis.sessionStorage = { getItem: () => null, setItem: () => {} };
globalThis.document = {
  getElementById: (id) => elements[id] || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: () => new FakeEl(),
};
globalThis.location = { hash: '', href: 'http://test/', search: '' };
globalThis.history = { replaceState: () => {} };
globalThis.navigator = { sendBeacon: () => true, userAgent: 'test' };
globalThis.CustomEvent = class CustomEvent {
  constructor(name, opts) { this.type = name; this.detail = opts && opts.detail; }
};
globalThis.window = globalThis;
globalThis.window.addEventListener = () => {};
globalThis.window.dispatchEvent = () => {};

// ---------- fetch mock ----------

const fetchCalls = [];
let nextProgressPost = { ok: false, status: 401 };

globalThis.fetch = async (url, opts) => {
  fetchCalls.push({ url, opts });
  // initCourse calls /api/progress?me=true; return "no record, no reset".
  if (url === '/api/progress?me=true') {
    return { ok: true, json: async () => ({ myProgress: null, resetAt: null }) };
  }
  // Error-reporting endpoint: succeed so reportClientError stays silent.
  if (url === '/api/client-log') {
    return { ok: true };
  }
  // POST /api/progress: whatever the test set up.
  if (url === '/api/progress' && opts && opts.method === 'POST') {
    return nextProgressPost;
  }
  return { ok: true, json: async () => ({}) };
};

// Now load the module. The DOM layer attaches to window because we've set
// typeof window !== 'undefined'.
require('../courses/lesson-runtime.js');
const LR = globalThis.window.LessonRuntime;

function resetWorld() {
  storage.clear();
  fetchCalls.length = 0;
  // Re-create fake elements so prior renderLesson calls don't leak innerHTML.
  elements['lesson-content'] = new FakeEl();
  elements['lesson-nav'] = new FakeEl();
}

const LESSONS = [
  { id: 0, title: 'L1', points: 10, learn: '', implement: '', advanced: '' },
  { id: 1, title: 'L2', points: 20, learn: '', implement: '', advanced: '' },
];

// 250ms debounce in scheduleFlush + a little headroom for the fetch.
function waitForFlush() { return new Promise(r => setTimeout(r, 400)); }

// ---------- THE REPRO ----------

test('REPRO: 401 from /api/progress silently drops the completion payload', async () => {
  resetWorld();
  nextProgressPost = { ok: false, status: 401 }; // stale-reset or cleared cookie

  await LR.initCourse({
    courseId: 'copilot-chat',
    progressCategory: 'chat',
    lessons: LESSONS,
    coreCount: LESSONS.length,
  });

  // User clicks "Mark Complete" on lesson 0.
  LR.markComplete(0);
  await waitForFlush();

  // The POST was attempted.
  const post = fetchCalls.find(c => c.url === '/api/progress' && c.opts && c.opts.method === 'POST');
  assert.ok(post, 'POST /api/progress should have been attempted');
  assert.deepStrictEqual(
    JSON.parse(post.opts.body),
    { chat: { completed: [0], points: 10 } },
    'payload reflects the just-completed lesson',
  );

  // BUG: the dropped payload is NOT in the persistent retry queue.
  // Anyone who reloads the tab will see zero progress.
  const queueRaw = globalThis.localStorage.getItem('pending-flush:copilot-chat');
  const queue = queueRaw ? JSON.parse(queueRaw) : [];
  assert.strictEqual(
    queue.length, 0,
    'CURRENT (buggy) BEHAVIOR: 401 hits the isTerminalStatus branch in ' +
    'flush() at lesson-runtime.js:396-403 and returns without enqueuing. ' +
    'The completion is lost on the next page load.',
  );

  // And nothing was persisted to the legacy local-completed key either.
  assert.strictEqual(
    globalThis.localStorage.getItem('chat-completed-v2'), null,
    'CURRENT BEHAVIOR: lesson-runtime.js never writes the completed[] ' +
    'list to localStorage during normal use, so there is no client-side ' +
    'fallback when the server write fails.',
  );
});

test('CONTRAST: 500 (transient) from /api/progress correctly enqueues for retry', async () => {
  resetWorld();
  nextProgressPost = { ok: false, status: 500 };

  await LR.initCourse({
    courseId: 'copilot-chat',
    progressCategory: 'chat',
    lessons: LESSONS,
    coreCount: LESSONS.length,
  });

  LR.markComplete(0);
  await waitForFlush();

  const queueRaw = globalThis.localStorage.getItem('pending-flush:copilot-chat');
  const queue = queueRaw ? JSON.parse(queueRaw) : [];
  assert.strictEqual(queue.length, 1, 'transient error enqueues the payload');
  assert.deepStrictEqual(
    queue[0].payload,
    { chat: { completed: [0], points: 10 } },
    'queued payload is the user\'s completion',
  );
});

test('CONTRAST: 200 OK clears any prior queue (sanity)', async () => {
  resetWorld();
  // Pre-seed a stale queued payload from a previous failed session.
  globalThis.localStorage.setItem(
    'pending-flush:copilot-chat',
    JSON.stringify([{ payload: { chat: { completed: [0], points: 10 } }, ts: 1, retries: 0 }]),
  );
  nextProgressPost = { ok: true, status: 200, json: async () => ({ ok: true }) };

  await LR.initCourse({
    courseId: 'copilot-chat',
    progressCategory: 'chat',
    lessons: LESSONS,
    coreCount: LESSONS.length,
  });

  LR.markComplete(1);
  await waitForFlush();

  const queueRaw = globalThis.localStorage.getItem('pending-flush:copilot-chat');
  assert.ok(!queueRaw, 'successful flush clears the pending queue');
});
