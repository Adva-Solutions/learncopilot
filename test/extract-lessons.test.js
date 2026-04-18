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

// Regression test for BLOCKING 1: escape-sequence handling
// A string ending in a literal backslash (e.g. "C:\\") must not trick the parser
// into thinking the next character is escaped.
test('extractLessons handles strings ending in a backslash', () => {
  const html = `<script>
let completed = [];
const LESSONS = [
  { id: 0, title: "Path C:\\\\", points: 5, learn: \`a\`, implement: \`b\`, advanced: \`c\` }
];
</script>`;
  const out = extractLessons(html);
  assert.ok(out.includes('C:\\\\'));
  assert.ok(out.trim().endsWith('];'));
});

// Regression test for BLOCKING 2: nested template literals with brackets inside ${}
// The parser must not treat a ']' inside ${...} as the end of the LESSONS array.
test('extractLessons handles nested template literals with brackets inside ${}', () => {
  const html = `<script>
const LESSONS = [
  { id: 0, title: "Nested", points: 5,
    learn: \`outer \${[1,2].map(x => \`\${x}]\`).join("")} end\`,
    implement: \`b\`, advanced: \`c\` }
];
</script>`;
  const out = extractLessons(html);
  assert.ok(out.includes('"Nested"'));
  assert.ok(out.trim().endsWith('];'));
});
