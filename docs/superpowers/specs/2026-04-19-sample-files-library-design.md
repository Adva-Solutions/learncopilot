# Sample Files Library — Design

**Status:** Proposed
**Date:** 2026-04-19
**Parent effort:** Sub-project D (admin-panel completeness) of the learncopilot↔adva-learn parity program. D1 of five.
**Follows:** sub-project A (lesson framework migration, shipped). D1 is the first admin-side parity piece.

---

## 1. Problem

Workshop hosts run Copilot Apps workshops for different clients. Today the `copilot-apps` course exercises reference a fixed dataset (ODA files under `/mock-data/`) that cannot be swapped without editing code. Hosts regularly ask to hand learners a client-specific spreadsheet or PDF so the exercise feels real for that workshop. The reference app (`adva-learn`) already has this capability via a sample-files library; port a subset of it to `learncopilot`.

End state: admins can upload CSV/XLSX/DOCX/PPTX/PDF/TXT files (up to 4 MB) to a shared library, assign one or more to a workshop, and learners in that workshop see a download link inside designated lesson spots. Unassigned workshops still fall back to `/mock-data/` — nothing breaks for existing workshops.

## 2. Non-goals

- **Zero lesson-content changes.** `courses/*/lessons.js` are not touched. The library is an additive shell-level surface; no existing exercise instructions, download links, or mock-data references are altered.
- Migrating the existing `/mock-data/` directory into the library — it stays as-is for default-workshop behavior.
- Per-lesson file mapping or category-matched picks; admins simply assign files to a workshop and the shell surfaces them in one banner location in Copilot Apps.
- Direct file streaming from storage providers; files live in Redis as base64, matching the reference app. Migrating to Vercel Blob is a later concern.
- Versioning, access logs, or admin-side preview of file contents.

## 3. Architecture

Three thin layers, minimal surface area.

### 3.1 Storage (Redis)

Three key shapes, mirroring the reference:

- Set `sample-files` — string set of `<id>` entries. Source-of-truth for enumeration.
- String `sample-files:<id>` — JSON `{ id, name, category, size, mime, uploadedAt, uploadedBy }`.
- String `sample-files:<id>:data` — base64 of file bytes. Read only by the download endpoint.

`<id>` is a 16-hex `crypto.randomUUID().slice(...)` string; collisions are ignored (set insertion is idempotent).

Workshop client record (`client:<slug>`, existing key) gets one new optional field: `sampleFileIds: string[]`. Absent field = no files assigned = fall-back behavior.

### 3.2 API endpoints

**`POST /api/admin/sample-files`** (admin-gated via existing `verifyAdmin`)
- Request body: `{ name: string, category: string, mime: string, dataBase64: string }` — JSON. The client reads the file, base64-encodes it, and POSTs. Simpler than multipart and keeps us consistent with how `upload-logo.js` already works in this repo.
- Validates: `name` non-empty ≤ 200 chars; `category` in enum (see §4); `mime` in allowlist (§4); `dataBase64` decodes to ≤ 4 MiB (4 × 1024 × 1024 bytes).
- Writes the three Redis keys atomically via pipeline.
- Returns `201 { id, name, category, size, mime, uploadedAt }`.

**`GET /api/admin/sample-files`** (admin-gated)
- Returns `{ files: [{id, name, category, size, mime, uploadedAt}, ...] }` — metadata only, never base64.

**`DELETE /api/admin/sample-files?id=<id>`** (admin-gated)
- Deletes all three keys + removes ID from the set. Does NOT unassign from workshops automatically — orphan IDs in `sampleFileIds` become no-ops; see §5 error handling.
- Returns `204`.

**`GET /api/sample-files?id=<id>`** (learner-gated via existing `getUser`)
- Reads the learner's workshop from the session (`client:<slug>` or default workshop).
- Asserts `id` is in the workshop's `sampleFileIds`. If not, returns `403`.
- Streams the file as `Content-Type: <mime>; Content-Disposition: attachment; filename="<name>"`. Base64 is decoded server-side; binary sent.

All endpoints go through the existing `api/admin/auth.js` session + origin helpers where applicable. No new CSRF work here — that's D4/B.

### 3.3 Admin UI (admin.html)

Two additions to `admin.html`:

- **New route `#sample-files`** reachable from the existing `admin-subnav`. Route handler renders an upload form + a list table + a delete action.
  - Upload form fields: `name` (text), `category` (select), file input. On submit, read the file via `FileReader.readAsDataURL`, strip the data-URL prefix, POST to `/api/admin/sample-files`. Show inline progress; on success, refresh the list; on failure, show error.
  - List table columns: name, category, size (KB), mime, uploaded-at, "Copy ID" button, "Delete" button.
- **In the existing Workshop Detail view** (`#workshop/:slug`) add a "Sample files" section: multi-select listbox populated from `GET /api/admin/sample-files`, selected values saved to `client.sampleFileIds` via the existing `PUT /api/admin/client?slug=<slug>`.

UI follows existing admin styles (`.card`, `.btn`, `.form-group`). No new CSS variables.

### 3.4 Learner UI (shell-only, zero lesson-content changes)

**Hard constraint:** no modification to `courses/copilot-apps/lessons.js` or any other lesson content file. Learners whose workshops have no assigned files see exactly what they see today.

Add a single empty container to the Copilot Apps shell `courses/copilot-apps/copilot-apps.html`, placed ABOVE the existing `<div id="lesson-content"></div>`:

```html
<div id="sample-file-banner" aria-live="polite"></div>
```

A small helper in the same shell hydrates the banner once per page load by calling `GET /api/workshop-config` and reading `sampleFileIds`. Behavior:

- **No files assigned** → banner stays empty, no visible change, lesson content unmodified.
- **One or more files assigned** → banner renders a `.tip-box` above the lesson area with download buttons for each assigned file, labeled generically ("Download sample file"). No lesson content changes.

The hydrator is idempotent (guarded by a `data-hydrated` attribute) and fires on `lessonruntime:change` so it's ready even if the learner navigates between lessons before the initial fetch resolves.

Adding lesson-specific callouts (e.g., category-matched file picks for Excel vs. Word exercises) is future content work that would require updating `lessons.js` and citing Microsoft Learn URLs per the content-fidelity rule from sub-project A. Out of scope for D1.

## 4. Enums

### Allowed mime types

```
text/csv
text/plain
application/pdf
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.openxmlformats-officedocument.presentationml.presentation
```

(XLSX, DOCX, PPTX, CSV, PDF, plaintext.)

### Category enum

```
finance | sales | operations | marketing | hr | leadership | general
```

Matches the reference app's categories for interop if we later cross-migrate content.

## 5. Error handling

- **Oversized upload (>4 MiB decoded):** `413 { error: "Sample file exceeds 4 MiB" }`. Admin UI shows the message inline.
- **Bad mime:** `415 { error: "Unsupported mime type" }`.
- **Bad category:** `400 { error: "Invalid category" }`.
- **Unknown id on learner download:** `404`. Orphan IDs in `sampleFileIds` (due to later deletion) route here; the callout JS falls back to its `data-fallback-file` on 404.
- **Learner id not in their workshop's assignment list:** `403 { error: "File not assigned to your workshop" }`. Same fallback behavior.
- **Admin deletion of a file still assigned to workshops:** proceeds; assignment records become no-ops. Admin UI surfaces "this file is assigned to N workshop(s); delete anyway?" confirmation before DELETE.

No cleanup sweep for orphan IDs — acceptable because workshops are time-bounded and IDs are short strings.

## 6. Auth and data isolation

- Admin endpoints: existing `verifyAdmin` (no change).
- Learner download endpoint: existing `getUser` for the session + **explicit membership check** against `client:<slug>.sampleFileIds`. Never trust the client-provided ID alone.
- Cross-workshop leakage is the primary risk vector. The membership check is the guard. Covered by a dedicated test (§8).

## 7. Testing gate

Three layers.

### 7.1 Unit tests (`test/sample-files.test.js`, node:test)

Pure helpers only:
- `isAllowedMime(mime)` — covers happy path + rejection for `image/png` and empty string.
- `isAllowedCategory(cat)` — enum round-trip.
- `decodeAndSize(dataBase64)` — returns byte size; throws on malformed base64.
- `normalizeFileName(name)` — strips path separators, trims, asserts ≤ 200 chars.

Runs as part of `npm test` alongside existing 12 tests; expected total after merge: 16–18.

### 7.2 Admin-side integration smoke (headless Playwright, production)

Script lives at `test/smoke/admin-sample-files.js`. Not part of `npm test` (requires admin creds). Run manually or from a post-deploy GitHub Action. Steps:

1. Log in as admin with `ADMIN_PASSWORD`.
2. Navigate to `#sample-files`.
3. Upload a 5-byte CSV via the file picker; assert the list gets a new row.
4. Open a test workshop; assign the file via the multi-select; save.
5. Verify the `client:<slug>` record via `GET /api/admin/client?slug=<slug>` contains the file ID.
6. Delete the file from the library; assert the library is empty.

Pass criteria: every step 200/201/204 as expected; no uncaught JS errors.

### 7.3 Learner-side integration smoke (headless Playwright, production)

Script at `test/smoke/learner-sample-file-callout.js`. Steps:

1. Admin precondition: one sample file assigned to a test workshop (re-use the admin smoke).
2. Log in as a learner of that workshop.
3. Navigate to the Copilot Apps Excel lesson; switch to the Exercises tab.
4. Assert `.sample-file-callout` hydrated: `<a>` has `href` pointing at `/api/sample-files?id=<id>`.
5. Click the link; assert a 200 response with the expected mime header.
6. Log out; log in as a learner of a DIFFERENT workshop with no assigned files; assert the callout shows the fallback `/mock-data/...` link instead.

Pass criteria: both positive and negative branches behave correctly; no 403/404 leaks.

## 8. Rollout

Single PR. No feature flag needed — the callout is additive and falls back gracefully when no files are assigned. Zero migration: existing workshops simply have no `sampleFileIds` field.

Rollback is git revert of the PR. Redis state left by the feature (uploaded files, assignments) is harmless post-revert because the new endpoints no longer exist and the lesson-side callout goes away with the HTML change.

## 9. Success criteria

- Admin can upload, list, assign, and delete a sample file end-to-end via the UI on production.
- A workshop with an assigned sample file shows the admin-provided file in the Copilot Apps Excel lesson download button.
- A workshop with NO assigned sample file shows the legacy `/mock-data/` download button unchanged.
- No cross-workshop leakage: a learner of workshop A cannot download workshop B's files by guessing IDs.
- All three testing layers pass.
- No uncaught JS errors in the admin or learner flows for 24 h post-deploy.

## 10. Open items carried to follow-on specs

- D2 (native-connectors registry) will not touch sample files.
- D3 (bcrypt client passwords) is independent; `api/admin/sample-files.js` uses only admin auth, not client passwords.
- D4 (admin CSRF + rate-limit) — this spec's endpoints will be protected once D4/B lands. D1 does not introduce CSRF/rate-limit to avoid scope creep; the only state-changing admin endpoints already sit behind HttpOnly admin_session cookies.
- A later spec may map sample files to specific lesson categories automatically (e.g., "if the lesson wants a sales dataset, use the first assigned file with `category: 'sales'`"). Out of scope here.
