const test = require('node:test');
const assert = require('node:assert');
const {
  enqueueFlush,
  dequeueFront,
  markAttempt,
  isTerminalStatus,
  shouldDropAfterRetry,
  FLUSH_QUEUE_MAX,
  FLUSH_QUEUE_MAX_RETRIES,
} = require('../courses/lesson-runtime.js');

const PAYLOAD = { chat: { completed: [0, 1], points: 15 } };

test('enqueueFlush appends a new item with retries=0', () => {
  const q = enqueueFlush([], PAYLOAD, 1000);
  assert.strictEqual(q.length, 1);
  assert.deepStrictEqual(q[0].payload, PAYLOAD);
  assert.strictEqual(q[0].retries, 0);
  assert.strictEqual(q[0].ts, 1000);
});

test('enqueueFlush does not mutate the input queue', () => {
  const original = [];
  const next = enqueueFlush(original, PAYLOAD, 1);
  assert.strictEqual(original.length, 0);
  assert.strictEqual(next.length, 1);
  assert.notStrictEqual(original, next);
});

test('enqueueFlush trims the oldest entries when exceeding FLUSH_QUEUE_MAX', () => {
  let q = [];
  for (let i = 0; i < FLUSH_QUEUE_MAX + 5; i++) {
    q = enqueueFlush(q, { i }, i);
  }
  assert.strictEqual(q.length, FLUSH_QUEUE_MAX);
  // First survivor should be index 5 (we dropped 0..4).
  assert.strictEqual(q[0].payload.i, 5);
  assert.strictEqual(q[q.length - 1].payload.i, FLUSH_QUEUE_MAX + 4);
});

test('enqueueFlush tolerates a non-array input', () => {
  assert.deepStrictEqual(enqueueFlush(undefined, PAYLOAD, 1).length, 1);
  assert.deepStrictEqual(enqueueFlush(null, PAYLOAD, 1).length, 1);
});

test('dequeueFront drops the front item', () => {
  const q = [{ payload: 'a' }, { payload: 'b' }];
  const next = dequeueFront(q);
  assert.deepStrictEqual(next, [{ payload: 'b' }]);
});

test('dequeueFront on empty / missing returns empty array', () => {
  assert.deepStrictEqual(dequeueFront([]), []);
  assert.deepStrictEqual(dequeueFront(undefined), []);
});

test('markAttempt increments retries on the front item only', () => {
  const q = [{ payload: 'a', retries: 0 }, { payload: 'b', retries: 0 }];
  const next = markAttempt(q);
  assert.strictEqual(next[0].retries, 1);
  assert.strictEqual(next[1].retries, 0);
  // Original untouched.
  assert.strictEqual(q[0].retries, 0);
});

test('markAttempt handles items without a retries field', () => {
  const q = [{ payload: 'a' }];
  const next = markAttempt(q);
  assert.strictEqual(next[0].retries, 1);
});

test('markAttempt on empty queue is a no-op', () => {
  assert.deepStrictEqual(markAttempt([]), []);
  assert.deepStrictEqual(markAttempt(undefined), []);
});

test('isTerminalStatus matches 400/401/403/404 only', () => {
  assert.strictEqual(isTerminalStatus(400), true);
  assert.strictEqual(isTerminalStatus(401), true);
  assert.strictEqual(isTerminalStatus(403), true);
  assert.strictEqual(isTerminalStatus(404), true);
  assert.strictEqual(isTerminalStatus(429), false);
  assert.strictEqual(isTerminalStatus(500), false);
  assert.strictEqual(isTerminalStatus(503), false);
  assert.strictEqual(isTerminalStatus(0),   false); // network failure
});

test('shouldDropAfterRetry triggers at exactly FLUSH_QUEUE_MAX_RETRIES', () => {
  assert.strictEqual(shouldDropAfterRetry({ retries: FLUSH_QUEUE_MAX_RETRIES - 1 }), false);
  assert.strictEqual(shouldDropAfterRetry({ retries: FLUSH_QUEUE_MAX_RETRIES }),     true);
  assert.strictEqual(shouldDropAfterRetry({ retries: FLUSH_QUEUE_MAX_RETRIES + 5 }), true);
});

test('shouldDropAfterRetry handles missing item', () => {
  assert.strictEqual(shouldDropAfterRetry(undefined), false);
  assert.strictEqual(shouldDropAfterRetry(null),      false);
});

test('end-to-end: retry, retry, retry → drop on max', () => {
  let q = enqueueFlush([], PAYLOAD, 1);
  for (let i = 0; i < FLUSH_QUEUE_MAX_RETRIES; i++) {
    assert.strictEqual(shouldDropAfterRetry(q[0]), false, `not dropped yet at attempt ${i}`);
    q = markAttempt(q);
  }
  assert.strictEqual(shouldDropAfterRetry(q[0]), true);
  q = dequeueFront(q);
  assert.strictEqual(q.length, 0);
});
