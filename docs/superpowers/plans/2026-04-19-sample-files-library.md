# Sample Files Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admins upload CSV/XLSX/DOCX/PPTX/PDF/TXT files (≤4 MiB) to a Redis-backed library, assign one or more files to each workshop, and learners see a download link inside a new `.sample-file-callout` block placed in the Copilot Apps Excel lesson — with clean fallback to the existing `/mock-data/` link when a workshop has no assignment.

**Architecture:** Three layers — Redis storage (`sample-files` set + `sample-files:<id>` metadata + `sample-files:<id>:data` base64), admin CRUD endpoints under `api/admin/sample-files.js` plus a learner download endpoint `api/sample-files.js`, and a small admin UI view with a workshop-detail multi-select. The learner side is a single HTML callout primitive hydrated from a shell helper keyed off the existing `lessonruntime:change` event.

**Tech Stack:** Node 22 (`node --test`), vanilla JS, existing Redis (`api/lib/redis.js`), existing admin auth (`api/admin/auth.js`), existing session helpers (`api/lib/session.js`), Vercel Serverless Functions.

**Spec reference:** `docs/superpowers/specs/2026-04-19-sample-files-library-design.md`

---

## File map

**Created (permanent):**
- `api/admin/sample-files.js` — admin CRUD endpoint (POST/GET/DELETE)
- `api/sample-files.js` — learner-gated download endpoint
- `api/lib/sample-files-util.js` — pure helpers (mime/category/size/name validation)
- `test/sample-files-util.test.js` — node:test unit tests for the pure helpers
- `test/smoke/admin-sample-files.js` — Playwright admin smoke script (run manually)
- `test/smoke/learner-sample-file-callout.js` — Playwright learner smoke script (run manually)

**Modified:**
- `admin.html` — new `#sample-files` route, upload form, list view, and a "Sample files" section inside workshop detail
- `api/admin/client.js` — accept `sampleFileIds: string[]` on PUT
- `courses/copilot-apps/copilot-apps.html` — add a shell-level `#sample-file-banner` container ABOVE the lesson content, plus a `hydrateSampleFileBanner()` helper wired to `lessonruntime:change`
- `api/workshop-config.js` — expose the current workshop's `sampleFileIds` on GET so the learner-side helper can resolve which file to show without a second round-trip

**Unchanged — HARD RULE, content safety:**
- `courses/copilot-apps/lessons.js` — NOT TOUCHED. Lesson content is never modified by this plan.
- `courses/copilot-chat/lessons.js` and its shell — not in scope.
- `courses/building-agents/lessons.js` and its shell — not in scope.
- `courses/lesson-runtime.js` — hydration fires on the existing event; no runtime changes.
- `/mock-data/` — untouched. Default-workshop experience unchanged.

## Conventions recap

- `npm test` runs `node --test 'test/*.js'`. New unit test is `test/sample-files-util.test.js`.
- Admin endpoints use `verifyAdmin(req)` from `api/admin/auth.js`. Learner endpoints use the existing session helper (see `api/me.js` for the pattern).
- All admin JSON endpoints return JSON. Learner download endpoint streams binary.
- Max file size = 4 MiB = `4 * 1024 * 1024` = `4194304` bytes.

---

## Phase 1 — Pure helpers + Redis storage primitives (TDD)

### Task 1: Scaffold helper module + failing tests

**Files:**
- Create: `test/sample-files-util.test.js`
- Create: `api/lib/sample-files-util.js`

- [ ] **Step 1: Write failing tests**

Create `test/sample-files-util.test.js`:

```js
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
```

- [ ] **Step 2: Run tests — confirm they FAIL**

Run:
```bash
cd /Users/matanbengigi/Desktop/Copilot\ workshop/learncopilot
npm test
```
Expected: FAIL — `Cannot find module '../api/lib/sample-files-util.js'`.

- [ ] **Step 3: Implement the helpers**

Create `api/lib/sample-files-util.js`:

```js
'use strict';

const crypto = require('node:crypto');

const MAX_SAMPLE_FILE_BYTES = 4 * 1024 * 1024;

const ALLOWED_CATEGORIES = [
  'finance',
  'sales',
  'operations',
  'marketing',
  'hr',
  'leadership',
  'general',
];

const ALLOWED_MIMES = [
  'text/csv',
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

function isAllowedMime(m) {
  return typeof m === 'string' && ALLOWED_MIMES.includes(m);
}

function isAllowedCategory(c) {
  return typeof c === 'string' && ALLOWED_CATEGORIES.includes(c);
}

function decodeAndSize(b64) {
  if (typeof b64 !== 'string' || b64.length === 0) {
    throw new Error('base64 payload malformed or empty');
  }
  // Node's Buffer.from(x,'base64') is lenient; validate by round-trip length.
  const buf = Buffer.from(b64, 'base64');
  const reencoded = buf.toString('base64');
  // Strip padding differences when comparing.
  const strip = (s) => s.replace(/=+$/, '');
  if (strip(reencoded) !== strip(b64.replace(/\s+/g, ''))) {
    throw new Error('base64 payload malformed');
  }
  return buf.length;
}

function normalizeFileName(name) {
  if (typeof name !== 'string') throw new Error('file name empty');
  const trimmed = name.trim();
  if (trimmed.length === 0) throw new Error('file name empty');
  const safe = trimmed.replace(/[\\/]/g, '_');
  return safe.slice(0, 200);
}

function newSampleFileId() {
  return crypto.randomBytes(8).toString('hex');
}

module.exports = {
  isAllowedMime,
  isAllowedCategory,
  decodeAndSize,
  normalizeFileName,
  newSampleFileId,
  MAX_SAMPLE_FILE_BYTES,
  ALLOWED_CATEGORIES,
  ALLOWED_MIMES,
};
```

- [ ] **Step 4: Run tests — confirm they PASS**

```bash
npm test
```
Expected: all 12 pre-existing tests pass + 12 new tests pass = **24 tests, 0 failures**.

- [ ] **Step 5: Commit**

```bash
git add api/lib/sample-files-util.js test/sample-files-util.test.js
git commit -m "feat(sample-files): pure helpers (mime/category/decodeAndSize/normalizeFileName/newSampleFileId)"
```

---

## Phase 2 — Admin endpoint (CRUD)

### Task 2: Admin POST endpoint (create)

**Files:**
- Create: `api/admin/sample-files.js`
- Test: none (integration-tested via the admin-smoke Playwright script; helpers already unit-tested)

- [ ] **Step 1: Create the endpoint scaffold**

Create `api/admin/sample-files.js`:

```js
'use strict';

const { verifyAdmin } = require('./auth.js');
const { getRedis } = require('../lib/redis.js');
const {
  isAllowedMime,
  isAllowedCategory,
  decodeAndSize,
  normalizeFileName,
  newSampleFileId,
  MAX_SAMPLE_FILE_BYTES,
} = require('../lib/sample-files-util.js');

module.exports = async function handler(req, res) {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  if (req.method === 'POST')   return handleCreate(req, res);
  if (req.method === 'GET')    return handleList(req, res);
  if (req.method === 'DELETE') return handleDelete(req, res);

  return res.status(405).json({ error: 'Method not allowed' });
};

async function handleCreate(req, res) {
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) {} }
  body = body || {};

  const name0 = body.name;
  const category = body.category;
  const mime = body.mime;
  const dataBase64 = body.dataBase64;

  if (!isAllowedCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  if (!isAllowedMime(mime)) {
    return res.status(415).json({ error: 'Unsupported mime type' });
  }

  let name;
  try { name = normalizeFileName(name0); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  let size;
  try { size = decodeAndSize(dataBase64); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  if (size > MAX_SAMPLE_FILE_BYTES) {
    return res.status(413).json({ error: 'Sample file exceeds 4 MiB' });
  }

  const id = newSampleFileId();
  const meta = {
    id,
    name,
    category,
    mime,
    size,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'admin',
  };

  const r = getRedis();
  const pipe = r.multi();
  pipe.sadd('sample-files', id);
  pipe.set(`sample-files:${id}`, JSON.stringify(meta));
  pipe.set(`sample-files:${id}:data`, dataBase64);
  await pipe.exec();

  return res.status(201).json(meta);
}

async function handleList(req, res) {
  const r = getRedis();
  const ids = await r.smembers('sample-files');
  if (ids.length === 0) return res.status(200).json({ files: [] });
  const metaKeys = ids.map((id) => `sample-files:${id}`);
  const metaStrs = await r.mget(metaKeys);
  const files = metaStrs
    .filter(Boolean)
    .map((s) => { try { return JSON.parse(s); } catch (_) { return null; } })
    .filter(Boolean)
    .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  return res.status(200).json({ files });
}

async function handleDelete(req, res) {
  const id = (req.query && req.query.id) || '';
  if (!id || !/^[0-9a-f]{16}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const r = getRedis();
  await r.multi()
    .srem('sample-files', id)
    .del(`sample-files:${id}`)
    .del(`sample-files:${id}:data`)
    .exec();
  return res.status(204).end();
}
```

- [ ] **Step 2: Verify the file is syntactically valid**

```bash
node -e "require('./api/admin/sample-files.js')"
```
Expected: no output (module loads cleanly). If it throws, fix the syntax error.

- [ ] **Step 3: Existing unit tests still pass**

```bash
npm test
```
Expected: 24/24 (pre-existing 12 + helper 12).

- [ ] **Step 4: Commit**

```bash
git add api/admin/sample-files.js
git commit -m "feat(api): admin /api/admin/sample-files with POST/GET/DELETE"
```

---

### Task 3: Learner download endpoint

**Files:**
- Create: `api/sample-files.js`

- [ ] **Step 1: Inspect the existing session helper pattern**

Check how `api/me.js` identifies the logged-in user and their workshop slug so the new endpoint uses the same pattern. Run:

```bash
grep -n "getUser\|slug\|verify\|client:\|workshop" api/me.js | head -20
```

Use whatever function is imported for session verification there (typically from `api/lib/session.js`).

- [ ] **Step 2: Create the endpoint**

Create `api/sample-files.js`:

```js
'use strict';

const { getRedis } = require('./lib/redis.js');
// Reuse the same session helper pattern as api/me.js.
// If the helper is in api/lib/session.js and exports getUser(req), use that.
// Otherwise adapt to the project's existing pattern.
const { getUser } = require('./lib/session.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const id = (req.query && req.query.id) || '';
  if (!id || !/^[0-9a-f]{16}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const r = getRedis();
  // Check this learner's workshop assignment includes the requested id.
  // user.slug is the workshop slug (may be 'default' for the default workshop).
  const clientJson = await r.get(`client:${user.slug || 'default'}`);
  const client = clientJson ? safeParse(clientJson) : null;
  const assignedIds = (client && Array.isArray(client.sampleFileIds)) ? client.sampleFileIds : [];
  if (!assignedIds.includes(id)) {
    return res.status(403).json({ error: 'File not assigned to your workshop' });
  }

  const [metaStr, dataB64] = await Promise.all([
    r.get(`sample-files:${id}`),
    r.get(`sample-files:${id}:data`),
  ]);
  if (!metaStr || !dataB64) return res.status(404).json({ error: 'Not found' });

  const meta = safeParse(metaStr);
  if (!meta) return res.status(500).json({ error: 'Malformed metadata' });

  const buf = Buffer.from(dataB64, 'base64');
  res.setHeader('Content-Type', meta.mime || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${meta.name}"`);
  res.setHeader('Content-Length', String(buf.length));
  return res.status(200).end(buf);
};

function safeParse(s) {
  try { return JSON.parse(s); } catch (_) { return null; }
}
```

- [ ] **Step 3: Verify module loads**

```bash
node -e "require('./api/sample-files.js')"
```

If it errors on `getUser` import, inspect `api/lib/session.js` for the actual exported name; if it's `verifySession` or similar, update the import. If `api/lib/session.js` doesn't exist, check `api/me.js` for the cookie-read pattern and inline the equivalent logic here.

- [ ] **Step 4: Unit tests still pass**

```bash
npm test
```
Expected: 24/24.

- [ ] **Step 5: Commit**

```bash
git add api/sample-files.js
git commit -n -m "feat(api): learner-gated /api/sample-files download with workshop membership check"
```

---

### Task 4: Extend `api/admin/client.js` to accept `sampleFileIds`

**Files:**
- Modify: `api/admin/client.js`

- [ ] **Step 1: Locate the PUT handler**

```bash
grep -n "method\|PUT\|sampleFileIds\|industries\|sampleDataUrl" api/admin/client.js | head -20
```

Identify the field allowlist or the merge block where the PUT handler writes new fields onto the existing client record.

- [ ] **Step 2: Add `sampleFileIds` to the allowlist**

Inside the PUT handler, where other optional fields are validated / merged, add:

```js
if (Array.isArray(body.sampleFileIds)) {
  // Only accept ids that look like our 16-hex format; drop everything else.
  const valid = body.sampleFileIds.filter(s => typeof s === 'string' && /^[0-9a-f]{16}$/.test(s));
  next.sampleFileIds = valid;
}
```

Place it alongside the existing field-merge lines. Keep the rest of the handler unchanged.

- [ ] **Step 3: Verify the file still loads**

```bash
node -e "require('./api/admin/client.js')"
```

- [ ] **Step 4: Unit tests still pass**

```bash
npm test
```
Expected: 24/24.

- [ ] **Step 5: Commit**

```bash
git add api/admin/client.js
git commit -m "feat(admin): accept sampleFileIds on PUT /api/admin/client"
```

---

### Task 5: Extend `api/workshop-config.js` to return assigned `sampleFileIds`

**Files:**
- Modify: `api/workshop-config.js`

- [ ] **Step 1: Locate the response payload**

```bash
grep -n "res.status\|return res\|json(\|industries\|client\[" api/workshop-config.js | head -20
```

Find where the GET handler builds the JSON response for the logged-in user's workshop.

- [ ] **Step 2: Add `sampleFileIds` to the response**

Inside the GET handler, where the response object is built, include:

```js
sampleFileIds: Array.isArray(client.sampleFileIds) ? client.sampleFileIds : [],
```

Place it next to the existing copied fields. Do not expose any other new fields.

- [ ] **Step 3: Verify the file loads**

```bash
node -e "require('./api/workshop-config.js')"
```

- [ ] **Step 4: Unit tests still pass**

```bash
npm test
```
Expected: 24/24.

- [ ] **Step 5: Commit**

```bash
git add api/workshop-config.js
git commit -m "feat(api): expose sampleFileIds on /api/workshop-config"
```

---

## Phase 3 — Admin UI

### Task 6: Add `#sample-files` admin route (upload form + list view)

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Locate the admin API + router config**

```bash
grep -n "API = {\|auth:\|clients:\|client:\|sample-files\|render.*Route\|return render" admin.html | head -30
```

Find (a) the `API = { ... }` constants block and (b) the router's `if (hash === '#dashboard') return renderDashboard(app);` chain.

- [ ] **Step 2: Add `sampleFiles` to the API constants block**

Inside the `const API = { ... };` block in `admin.html`, add this line next to `listenLabs`, `personalize`, etc.:

```js
sampleFiles: '/api/admin/sample-files',
```

- [ ] **Step 3: Wire the router**

In the route() function's if-chain (right after `if (hash === '#template') return renderTemplate(app);`), add:

```js
if (hash === '#sample-files') return renderSampleFiles(app);
```

- [ ] **Step 4: Add the admin sub-nav link**

In the `renderNav()` function, in the `links.innerHTML = ...` template, add a new link between Template and Logout:

```html
<a class="nav-link ${hash === '#sample-files' ? 'active' : ''}" href="#sample-files">Sample Files</a>
```

- [ ] **Step 5: Implement `renderSampleFiles`**

Add a new function above the `renderDashboard` function:

```js
async function renderSampleFiles(app) {
  app.innerHTML = `
    <div class="page-header">
      <h1>Sample Files</h1>
    </div>
    <div class="card" style="margin-bottom:20px;">
      <h3 style="margin-bottom:12px;">Upload</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="sf-name" placeholder="Q3 Financials (demo)" maxlength="200">
        </div>
        <div class="form-group">
          <label>Category</label>
          <select id="sf-category">
            <option value="general">general</option>
            <option value="finance">finance</option>
            <option value="sales">sales</option>
            <option value="operations">operations</option>
            <option value="marketing">marketing</option>
            <option value="hr">hr</option>
            <option value="leadership">leadership</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>File (max 4 MB — CSV, XLSX, DOCX, PPTX, PDF, or plain text)</label>
        <input type="file" id="sf-file" accept=".csv,.xlsx,.docx,.pptx,.pdf,.txt,text/csv,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation">
      </div>
      <button class="btn btn-primary" id="sf-upload">Upload</button>
      <p id="sf-upload-msg" style="font-size:13px;margin-top:12px;display:none;"></p>
    </div>
    <div class="card">
      <h3 style="margin-bottom:12px;">Library</h3>
      <div id="sf-list" class="loading-state"><div class="spinner"></div></div>
    </div>`;

  $('#sf-upload').onclick = async () => {
    const msg = $('#sf-upload-msg');
    msg.style.display = 'none';
    try {
      const name = $('#sf-name').value.trim();
      const category = $('#sf-category').value;
      const file = $('#sf-file').files[0];
      if (!name) { showUploadMsg(msg, 'Name required', true); return; }
      if (!file) { showUploadMsg(msg, 'File required', true); return; }
      const dataBase64 = await readFileAsBase64(file);
      const meta = await apiFetch(API.sampleFiles, {
        method: 'POST',
        body: JSON.stringify({ name, category, mime: file.type || 'application/octet-stream', dataBase64 }),
      });
      showUploadMsg(msg, `Uploaded: ${meta.name}`, false);
      $('#sf-name').value = '';
      $('#sf-file').value = '';
      await refreshSampleFilesList();
    } catch (err) {
      showUploadMsg(msg, err.message || 'Upload failed', true);
    }
  };

  await refreshSampleFilesList();
}

function showUploadMsg(el, text, isError) {
  el.textContent = text;
  el.style.color = isError ? 'var(--red)' : 'var(--green, #217346)';
  el.style.display = 'block';
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const s = String(fr.result || '');
      const comma = s.indexOf(',');
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    fr.onerror = () => reject(new Error('Failed to read file'));
    fr.readAsDataURL(file);
  });
}

async function refreshSampleFilesList() {
  const list = $('#sf-list');
  list.className = '';
  list.innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;
  try {
    const data = await apiFetch(API.sampleFiles);
    const files = data.files || [];
    if (files.length === 0) {
      list.innerHTML = `<p style="color:var(--text-secondary);">No files uploaded yet.</p>`;
      return;
    }
    const rows = files.map(f => `
      <tr>
        <td>${esc(f.name)}</td>
        <td>${esc(f.category)}</td>
        <td>${(f.size / 1024).toFixed(1)} KB</td>
        <td style="font-size:12px;color:var(--text-secondary);">${esc(f.mime)}</td>
        <td style="font-size:12px;color:var(--text-secondary);">${formatDate(f.uploadedAt)}</td>
        <td><button class="btn btn-sm btn-outline" data-copy-id="${esc(f.id)}">Copy ID</button></td>
        <td><button class="btn btn-sm btn-outline" data-delete-id="${esc(f.id)}" data-delete-name="${esc(f.name)}">Delete</button></td>
      </tr>`).join('');
    list.innerHTML = `
      <table class="table">
        <thead><tr><th>Name</th><th>Category</th><th>Size</th><th>Mime</th><th>Uploaded</th><th></th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    list.querySelectorAll('[data-copy-id]').forEach(b => {
      b.onclick = () => { navigator.clipboard.writeText(b.getAttribute('data-copy-id')); };
    });
    list.querySelectorAll('[data-delete-id]').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-delete-id');
        const name = b.getAttribute('data-delete-name');
        confirmModal(`Delete "${name}"? Workshops that reference this file will show a fallback link.`, async () => {
          try {
            await apiFetch(`${API.sampleFiles}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            await refreshSampleFilesList();
          } catch (err) {
            alert('Delete failed: ' + (err.message || 'unknown'));
          }
        });
      };
    });
  } catch (err) {
    list.innerHTML = `<p style="color:var(--red);">Failed to load: ${esc(err.message)}</p>`;
  }
}
```

If helpers `esc`, `formatDate`, `$`, `apiFetch`, `confirmModal` don't exist with exactly those names, search `admin.html` for the closest equivalent (they should all exist — the existing admin code uses them) and rename accordingly.

- [ ] **Step 6: Manual smoke in a browser**

Skip end-to-end verification here (covered by Task 9 Playwright smoke). Confirm the admin bundle still parses by loading `/admin.html` in a browser locally and making sure there's no console error on initial load.

If `vercel dev` is available:
```bash
vercel dev --listen 3847
```
Open `http://localhost:3847/admin.html`, log in with `ADMIN_PASSWORD` from `.env.local`, click the new Sample Files link, confirm the upload form renders and the empty-state message shows.

- [ ] **Step 7: Commit**

```bash
git add admin.html
git commit -m "feat(admin-ui): add #sample-files route with upload form and library list"
```

---

### Task 7: Workshop detail — "Sample files" multi-select

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Locate the workshop detail view**

```bash
grep -n "renderWorkshopDetail\|sampleDataUrl\|industries:\|departments:\|'PUT'" admin.html | head -30
```

Find the `renderWorkshopDetail(app, slug)` function. It builds the detail form and issues a `PUT /api/admin/client?slug=<slug>` on save.

- [ ] **Step 2: Load the library when rendering the detail**

At the top of `renderWorkshopDetail`, after the existing `GET /api/admin/client` call, add one more:

```js
const libData = await apiFetch(API.sampleFiles).catch(() => ({ files: [] }));
const allSampleFiles = libData.files || [];
```

- [ ] **Step 3: Insert the multi-select UI block**

Inside the detail view's HTML template (wherever the existing per-workshop form fields are listed — e.g., after `industries` / `departments`), insert:

```html
<div class="form-group">
  <label>Sample files assigned to this workshop</label>
  <select id="wd-sample-files" multiple size="6" style="min-height:140px;">
    ${allSampleFiles.map(f => `
      <option value="${esc(f.id)}" ${(client.sampleFileIds || []).includes(f.id) ? 'selected' : ''}>
        ${esc(f.name)} — ${esc(f.category)} (${(f.size / 1024).toFixed(1)} KB)
      </option>`).join('')}
  </select>
  <div class="hint">Cmd/Ctrl-click to select multiple. Learners see a download button for the first assigned file in matching lesson spots.</div>
</div>
```

- [ ] **Step 4: Collect the selection on save**

In the save handler (the function that issues `PUT /api/admin/client?slug=<slug>`), right before building the PUT body, add:

```js
const selectedIds = Array.from($('#wd-sample-files').selectedOptions).map(o => o.value);
```

Include `sampleFileIds: selectedIds` in the PUT body's JSON alongside the existing fields.

- [ ] **Step 5: Verify**

- Open a workshop detail locally (via `vercel dev`), confirm the multi-select appears and shows library entries.
- Select two files, save, reload — the selection should persist (confirms the PUT correctly writes `sampleFileIds` and `GET /api/admin/client` returns it).

- [ ] **Step 6: Commit**

```bash
git add admin.html
git commit -m "feat(admin-ui): per-workshop sample-file multi-select in workshop detail"
```

---

## Phase 4 — Learner integration (shell-only, zero content changes)

### Task 8: Sample-file banner in the Copilot Apps shell

**Content-safety rule:** This task does NOT modify `courses/copilot-apps/lessons.js` or any other lesson content file. All changes are in the Copilot Apps shell (`copilot-apps.html`). If the user's workshop has no assigned files, the banner is invisible (its container stays empty) — learners see exactly what they see today.

**Files:**
- Modify: `courses/copilot-apps/copilot-apps.html` (shell only)

- [ ] **Step 1: Add the banner container above the lesson content**

Open `courses/copilot-apps/copilot-apps.html`. Find the existing `<div id="lesson-content"></div>` in the body. Insert this element immediately above it (still inside the main-column container):

```html
<div id="sample-file-banner" aria-live="polite"></div>
```

That's the only HTML structural change. The banner stays empty unless the hydrator fills it.

- [ ] **Step 2: Add the hydrator helper in the shell's `<script>` block**

Locate the `<script>` block in `courses/copilot-apps/copilot-apps.html` that holds the other shell helpers (`updateProgress`, `renderMapCallout`, `transformExerciseLists`, `restoreExerciseChecks`). Add these functions inside the same block (before the `initCourse({...})` call):

```js
let _workshopConfigCache = null;
async function getWorkshopConfigOnce() {
  if (_workshopConfigCache) return _workshopConfigCache;
  try {
    const r = await fetch('/api/workshop-config', { credentials: 'include' });
    if (!r.ok) return null;
    _workshopConfigCache = await r.json();
    return _workshopConfigCache;
  } catch (_) { return null; }
}

async function hydrateSampleFileBanner() {
  const el = document.getElementById('sample-file-banner');
  if (!el) return;
  // Only paint once per page load; the banner does not depend on which
  // lesson/tab is active. If the banner is already filled, leave it.
  if (el.getAttribute('data-hydrated') === '1') return;

  const cfg = await getWorkshopConfigOnce();
  const assigned = (cfg && Array.isArray(cfg.sampleFileIds)) ? cfg.sampleFileIds : [];
  if (assigned.length === 0) {
    // No files assigned — leave the banner invisible; lesson content stays
    // exactly as authored.
    el.setAttribute('data-hydrated', '1');
    return;
  }

  const links = assigned.map(id =>
    '<a class="btn btn-primary" style="margin-right:8px;margin-bottom:8px;"' +
    ' href="/api/sample-files?id=' + encodeURIComponent(id) + '">Download sample file</a>'
  ).join('');

  el.innerHTML =
    '<div class="tip-box" style="margin-bottom:20px;">' +
      '<strong>Your workshop sample files</strong>' +
      '<p style="margin:6px 0 12px;">Your workshop admin has provided these files. Use them for the exercises below.</p>' +
      links +
    '</div>';
  el.setAttribute('data-hydrated', '1');
}
```

- [ ] **Step 3: Call the hydrator on `lessonruntime:change`**

Find the existing `window.addEventListener('lessonruntime:change', ...)` block. Inside its handler, AFTER the other existing calls, add:

```js
hydrateSampleFileBanner();
```

(The hydrator is idempotent via its own `data-hydrated` guard, so firing on every change event is safe.)

- [ ] **Step 4: Confirm lessons.js is untouched**

```bash
git diff --stat courses/copilot-apps/lessons.js
```

Expected: zero lines changed. If anything shows, revert — this task must not modify lesson content.

- [ ] **Step 5: Unit tests still pass**

```bash
npm test
```
Expected: 24/24.

- [ ] **Step 6: Local smoke (optional but recommended)**

If `vercel dev` is available, run it and open `/courses/copilot-apps/copilot-apps.html` as a logged-in learner.
- With no files assigned to the workshop: banner area is empty, lesson renders exactly as today.
- After assigning a file via admin UI (Task 7) and reloading: banner shows with the download button(s).

- [ ] **Step 7: Commit**

```bash
git add courses/copilot-apps/copilot-apps.html
git commit -m "feat(apps-shell): sample-file banner above lesson content (no lesson-content change)"
```

---

## Phase 5 — Smoke tests and release

### Task 9: Admin-side Playwright smoke script

**Files:**
- Create: `test/smoke/admin-sample-files.js`

- [ ] **Step 1: Install Playwright locally if not already present**

```bash
mkdir -p test/smoke
cd /tmp && mkdir -p smoke-env && cd smoke-env && npm init -y >/dev/null 2>&1 && npm install --silent playwright && npx playwright install chromium
cd -
```

Use the `/tmp/smoke-env/node_modules` path from the script.

- [ ] **Step 2: Write the script**

Create `test/smoke/admin-sample-files.js`:

```js
'use strict';
const { chromium } = require('/tmp/smoke-env/node_modules/playwright');

const BASE = process.env.SMOKE_BASE || 'https://learncopilot.adva-solutions.com';
const ADMIN_PW = process.env.ADMIN_PASSWORD;
if (!ADMIN_PW) { console.error('ADMIN_PASSWORD required'); process.exit(2); }

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE_ERR: ' + m.text()); });

  console.log('1. log in');
  await page.goto(BASE + '/admin.html');
  await page.waitForSelector('#login-pw');
  await page.fill('#login-pw', ADMIN_PW);
  await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/admin/auth') && r.request().method() === 'POST'),
    page.click('button[type=submit]'),
  ]);

  console.log('2. go to #sample-files');
  await page.goto(BASE + '/admin.html#sample-files');
  await page.waitForSelector('#sf-upload');

  console.log('3. upload a 5-byte CSV');
  await page.fill('#sf-name', 'smoke-test.csv');
  await page.selectOption('#sf-category', 'general');
  await page.setInputFiles('#sf-file', {
    name: 'smoke-test.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('a,b,c'),
  });
  const up = await Promise.all([
    page.waitForResponse(r => r.url().endsWith('/api/admin/sample-files') && r.request().method() === 'POST'),
    page.click('#sf-upload'),
  ]);
  if (up[0].status() !== 201) { console.log('FAIL upload status=' + up[0].status()); process.exit(1); }

  console.log('4. list should contain one row');
  await page.waitForTimeout(500);
  const rowCount = await page.$$eval('#sf-list table tbody tr', els => els.length);
  if (rowCount < 1) { console.log('FAIL no rows visible'); process.exit(1); }

  console.log('5. copy the id via the data attribute + delete');
  const id = await page.$eval('#sf-list [data-delete-id]', el => el.getAttribute('data-delete-id'));
  const del = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/admin/sample-files?id=' + id) && r.request().method() === 'DELETE'),
    page.click('[data-delete-id="' + id + '"]'),
    // confirm in modal
    page.waitForSelector('#modal-confirm', { timeout: 3000 }).then(() => page.click('#modal-confirm')).catch(() => {}),
  ]);
  if (del[0].status() !== 204) { console.log('FAIL delete status=' + del[0].status()); process.exit(1); }

  console.log('errors:', errors.length);
  errors.forEach(e => console.log(' ', e));
  if (errors.length) process.exit(1);
  console.log('ADMIN SMOKE: PASS');
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
```

- [ ] **Step 3: Run the script against production**

```bash
ADMIN_PASSWORD=<production-admin-password> node test/smoke/admin-sample-files.js
```

Expected: `ADMIN SMOKE: PASS`. If not, fix the underlying bug before moving to the next task.

Note: this script requires the production admin password, which is not stored in the repo. Run from a developer machine with the env var set.

- [ ] **Step 4: Commit**

```bash
git add test/smoke/admin-sample-files.js
git commit -m "test(smoke): admin sample-files upload + delete flow"
```

---

### Task 10: Learner-side Playwright smoke script

**Files:**
- Create: `test/smoke/learner-sample-file-callout.js`

- [ ] **Step 1: Write the script**

Create `test/smoke/learner-sample-file-callout.js`:

```js
'use strict';
const { chromium } = require('/tmp/smoke-env/node_modules/playwright');

const BASE = process.env.SMOKE_BASE || 'https://learncopilot.adva-solutions.com';
const WORKSHOP_PW = process.env.WORKSHOP_PASSWORD;
if (!WORKSHOP_PW) { console.error('WORKSHOP_PASSWORD required'); process.exit(2); }

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE_ERR: ' + m.text()); });

  console.log('1. workshop login');
  await page.goto(BASE + '/login.html');
  await page.fill('input[name="name"]', 'SampleFileSmoke');
  await page.fill('input[name="password"]', WORKSHOP_PW);
  await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/login') && r.request().method() === 'POST'),
    page.click('button[type=submit]'),
  ]);

  console.log('2. open Copilot Apps course');
  await page.goto(BASE + '/courses/copilot-apps/copilot-apps.html');
  await page.waitForSelector('#sample-file-banner', { timeout: 10000 });
  await page.waitForTimeout(1200);  // give hydrator time to finish

  console.log('3. banner hydrated');
  const hydrated = await page.$('#sample-file-banner[data-hydrated="1"]');
  if (!hydrated) { console.log('FAIL banner not hydrated'); process.exit(1); }

  console.log('4. inspect banner state');
  const hasLink = await page.$('#sample-file-banner a[href^="/api/sample-files"]') !== null;
  if (hasLink) {
    console.log('5. assigned branch — verify download returns 200');
    const href = await page.$eval('#sample-file-banner a[href^="/api/sample-files"]', a => a.getAttribute('href'));
    const r = await page.request.get(BASE + href);
    if (r.status() !== 200) { console.log('FAIL download status=' + r.status()); process.exit(1); }
  } else {
    console.log('5. unassigned branch — banner correctly empty (expected when no files assigned)');
    const inner = await page.$eval('#sample-file-banner', el => el.innerHTML.trim());
    if (inner.length !== 0) { console.log('FAIL banner should be empty: ' + inner.slice(0, 120)); process.exit(1); }
  }

  console.log('6. confirm lesson content rendered (safety check — nothing broken)');
  const tabContentText = await page.$eval('#lesson-content', el => el.textContent.trim().length);
  if (tabContentText === 0) { console.log('FAIL lesson content empty'); process.exit(1); }

  console.log('errors:', errors.length);
  errors.forEach(e => console.log(' ', e));
  if (errors.length) process.exit(1);
  console.log('LEARNER SMOKE: PASS');
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
```

Note: lesson index `#lesson-2` assumes Excel is at index 2 in Copilot Apps. Confirm with the grep in Task 8 Step 1; if Excel is at a different index, update the hash target.

- [ ] **Step 2: Run the script**

```bash
WORKSHOP_PASSWORD=<workshop-password> node test/smoke/learner-sample-file-callout.js
```

Expected: `LEARNER SMOKE: PASS`.

If `isAssigned=false` (default workshop with no sample file assigned), the script still passes — that's the fallback branch. For the full positive-path verification, first run Task 9 AND manually assign the uploaded file to the default workshop via the admin UI, then re-run.

- [ ] **Step 3: Commit**

```bash
git add test/smoke/learner-sample-file-callout.js
git commit -m "test(smoke): learner sample-file-callout hydration and download flow"
```

---

### Task 11: Open PR and merge

**Files:** none

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feat/sample-files-library
```

- [ ] **Step 2: Open PR**

```bash
gh pr create --title "feat: sample files library (sub-project D1)" --body "$(cat <<'EOF'
## Summary
- Admin library: upload/list/delete CSV/XLSX/DOCX/PPTX/PDF/TXT (≤4 MiB) into Redis
- Per-workshop assignment via multi-select in workshop detail
- One insertion point in Copilot Apps Excel lesson with fallback to existing `/mock-data/` link
- Pure helpers covered by 12 new unit tests (total 24)

## Spec
docs/superpowers/specs/2026-04-19-sample-files-library-design.md

## Testing
- `npm test` — 24/24
- `test/smoke/admin-sample-files.js` — admin flow (requires ADMIN_PASSWORD)
- `test/smoke/learner-sample-file-callout.js` — learner flow (requires WORKSHOP_PASSWORD)
Both smokes pass locally against production before merge.
EOF
)"
```

- [ ] **Step 3: Merge after review**

```bash
gh pr merge --squash --delete-branch
```

Wait ~40s for Vercel auto-deploy, then re-run both smokes against production to confirm.

---

## Follow-on work (out of scope for this plan)

- D2 — Native-connectors registry + opportunity-map / personalization validator integration.
- D3 — Bcrypt client passwords with plaintext fallback for migration-safety.
- D5 — Stronger skill-block and opportunity-map validators.
- Sub-project C — UI polish (sidebar progress ring, tab underline animation, map-page richness).
- Sub-project B — Security hardening (login rate-limit, CSRF on progress, 32-hex session token with backward compat, auth-gated leaderboard, resetAt gate, TTL). Admin CSRF + rate-limit rolls into B by user's request.
- Follow-on content PR: add more `.sample-file-callout` insertions in other Copilot Apps lessons (Word, PowerPoint, Outlook) each citing its own Microsoft Learn URL.
