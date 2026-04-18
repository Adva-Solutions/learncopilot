'use strict';

function extractLessons(html) {
  const startRe = /\nconst LESSONS = \[/g;
  const matches = [...html.matchAll(startRe)];
  if (matches.length === 0) throw new Error('LESSONS block not found');
  if (matches.length > 1) throw new Error('multiple LESSONS blocks found');

  const startIdx = matches[0].index + 1;

  // Stack-based parser: handles escaped chars, nested template literals,
  // and ${...} interpolation correctly.
  // Stack entries: 'array' | 'obj' | 'interp' | 'str:<quote>' | 'backtick'
  const stack = ['array'];
  let depth = 0;      // bracket depth within 'array' mode
  let escape = false;

  const loopStart = startIdx + 'const LESSONS = '.length;
  for (let i = loopStart; i < html.length; i++) {
    const c = html[i];
    const top = stack[stack.length - 1];

    if (top.startsWith('str:')) {
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === top.slice(4)) stack.pop();
      continue;
    }

    if (top === 'backtick') {
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === '$' && html[i + 1] === '{') { stack.push('interp'); i++; continue; }
      if (c === '`') { stack.pop(); continue; }
      continue;
    }

    // 'array', 'obj', or 'interp' — normal JS expression context
    if (c === '"' || c === "'") { stack.push('str:' + c); continue; }
    if (c === '`') { stack.push('backtick'); continue; }

    if (c === '{') {
      // opening brace: in interp or obj context, push a new obj scope
      stack.push('obj');
      continue;
    }
    if (c === '}') {
      if (top === 'interp' || top === 'obj') { stack.pop(); continue; }
      continue;
    }

    if (c === '[') {
      if (top === 'array') { depth++; continue; }
      // inside obj/interp, treat inner brackets as obj-level (not depth-counted)
      stack.push('obj');
      continue;
    }
    if (c === ']') {
      if (top === 'array') {
        depth--;
        if (depth === 0) {
          let end = i + 1;
          if (html[end] === ';') end++;
          return html.slice(startIdx, end);
        }
        continue;
      }
      // closing bracket for an inner array pushed as 'obj'
      if (top === 'obj') { stack.pop(); continue; }
      continue;
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
