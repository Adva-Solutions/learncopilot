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
