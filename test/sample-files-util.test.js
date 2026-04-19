'use strict';
const test = require('node:test');
const assert = require('node:assert');
const {
  isAllowedMime,
  isAllowedCategory,
  decodeAndSize,
  normalizeFileName,
  newSampleFileId,
  MAX_SAMPLE_FILE_BYTES,
  ALLOWED_CATEGORIES,
  ALLOWED_MIMES,
} = require('../api/lib/sample-files-util.js');

test('MAX_SAMPLE_FILE_BYTES is exactly 4 MiB', () => {
  assert.strictEqual(MAX_SAMPLE_FILE_BYTES, 4 * 1024 * 1024);
});

test('ALLOWED_CATEGORIES matches spec', () => {
  assert.deepStrictEqual(ALLOWED_CATEGORIES, [
    'finance', 'sales', 'operations', 'marketing', 'hr', 'leadership', 'general',
  ]);
});

test('ALLOWED_MIMES contains the office + text + pdf set', () => {
  const expected = [
    'text/csv',
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  for (const m of expected) assert.ok(ALLOWED_MIMES.includes(m), 'missing: ' + m);
  assert.strictEqual(ALLOWED_MIMES.length, expected.length);
});

test('isAllowedMime(true/false)', () => {
  assert.strictEqual(isAllowedMime('text/csv'), true);
  assert.strictEqual(isAllowedMime('image/png'), false);
  assert.strictEqual(isAllowedMime(''), false);
  assert.strictEqual(isAllowedMime(undefined), false);
});

test('isAllowedCategory(true/false)', () => {
  assert.strictEqual(isAllowedCategory('finance'), true);
  assert.strictEqual(isAllowedCategory('Finance'), false);
  assert.strictEqual(isAllowedCategory('other'), false);
  assert.strictEqual(isAllowedCategory(''), false);
});

test('decodeAndSize returns byte length of decoded payload', () => {
  const b64 = Buffer.from('hello').toString('base64'); // 5 bytes
  assert.strictEqual(decodeAndSize(b64), 5);
});

test('decodeAndSize throws on malformed base64', () => {
  assert.throws(() => decodeAndSize('!!!not-base64!!!'), /malformed/i);
});

test('normalizeFileName strips path separators and trims', () => {
  assert.strictEqual(normalizeFileName('  foo/bar\\baz.csv  '), 'foo_bar_baz.csv');
  assert.strictEqual(normalizeFileName('simple.csv'), 'simple.csv');
});

test('normalizeFileName throws on empty', () => {
  assert.throws(() => normalizeFileName(''), /empty/i);
  assert.throws(() => normalizeFileName('   '), /empty/i);
});

test('normalizeFileName truncates at 200 chars', () => {
  const long = 'a'.repeat(250);
  const out = normalizeFileName(long);
  assert.strictEqual(out.length, 200);
});

test('newSampleFileId returns a 16-hex string', () => {
  const id = newSampleFileId();
  assert.match(id, /^[0-9a-f]{16}$/);
});

test('newSampleFileId returns different ids on successive calls', () => {
  const a = newSampleFileId();
  const b = newSampleFileId();
  assert.notStrictEqual(a, b);
});
