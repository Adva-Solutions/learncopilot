'use strict';

// --- Pure helpers ---

function buildNav(lessons, completedSet, currentIndex) {
  return lessons.map((l, i) => ({
    index: i,
    title: l.title,
    points: l.points,
    completed: completedSet.has(i),
    active: i === currentIndex,
  }));
}

function sumPoints(lessons, completedIndices) {
  let total = 0;
  for (const i of completedIndices) {
    if (lessons[i]) total += lessons[i].points;
  }
  return total;
}

function diffCompleted(localArr, serverArr) {
  const server = new Set(serverArr);
  return localArr.filter(i => !server.has(i));
}

function computeLocalStorageMigration({ localCompleted, serverCompleted, lessons }) {
  if (!localCompleted || localCompleted.length === 0) {
    return { shouldWrite: false, shouldClearLocal: false };
  }
  const missing = diffCompleted(localCompleted, serverCompleted);
  if (missing.length === 0) {
    return { shouldWrite: false, shouldClearLocal: true };
  }
  const merged = Array.from(new Set([...serverCompleted, ...localCompleted])).sort((a,b)=>a-b);
  return {
    shouldWrite: true,
    shouldClearLocal: true,
    mergedCompleted: merged,
    mergedPoints: sumPoints(lessons, merged),
  };
}

// --- Durable retry queue helpers ---
// Pure-functional so they can be unit-tested without a DOM. The DOM layer
// reads/writes the queue from localStorage; these helpers only transform it.
//
// Queue item shape: { payload, ts, retries }
//   - payload: the body sent to POST /api/progress
//   - ts:      Date.now() when the attempt was first enqueued
//   - retries: incremented every time a retry fails

const FLUSH_QUEUE_MAX = 50;
const FLUSH_QUEUE_MAX_RETRIES = 5;
// HTTP statuses where retrying will never succeed -- drop the item, don't
// keep banging on the server. 401 = stale session (cookie cleared); 403 =
// origin / CSRF rejection; 400/404 = client bug.
const FLUSH_TERMINAL_STATUSES = new Set([400, 401, 403, 404]);

function enqueueFlush(queue, payload, now) {
  const next = Array.isArray(queue) ? queue.slice() : [];
  next.push({ payload, ts: now ?? Date.now(), retries: 0 });
  if (next.length > FLUSH_QUEUE_MAX) {
    // Drop oldest first -- newer state is more likely to be wanted.
    return next.slice(next.length - FLUSH_QUEUE_MAX);
  }
  return next;
}

function dequeueFront(queue) {
  if (!Array.isArray(queue) || queue.length === 0) return [];
  return queue.slice(1);
}

function markAttempt(queue) {
  if (!Array.isArray(queue) || queue.length === 0) return queue || [];
  const next = queue.slice();
  next[0] = { ...next[0], retries: (next[0].retries || 0) + 1 };
  return next;
}

function isTerminalStatus(status) {
  return FLUSH_TERMINAL_STATUSES.has(status);
}

function shouldDropAfterRetry(item) {
  return !!item && (item.retries || 0) >= FLUSH_QUEUE_MAX_RETRIES;
}

// Dual export: <script> loads attach to window; node:test requires via CommonJS.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildNav, sumPoints, diffCompleted, computeLocalStorageMigration,
    enqueueFlush, dequeueFront, markAttempt, isTerminalStatus, shouldDropAfterRetry,
    FLUSH_QUEUE_MAX, FLUSH_QUEUE_MAX_RETRIES,
  };
}
if (typeof window !== 'undefined') {
  window.LessonRuntime = Object.assign(window.LessonRuntime || {}, {
    buildNav, sumPoints, diffCompleted, computeLocalStorageMigration,
    enqueueFlush, dequeueFront, markAttempt, isTerminalStatus, shouldDropAfterRetry,
  });
}

// --- DOM layer (browser only) ---
if (typeof window !== 'undefined') {

let state = null; // { courseId, progressCategory, lessons, coreCount, currentLesson, currentTab, completed: Set, pendingWrite: Promise|null, flushTimer: number|null, customRenderLesson: Function|null, customRenderNav: Function|null }

function getState() {
  if (!state) return null;
  return {
    courseId: state.courseId,
    progressCategory: state.progressCategory,
    lessons: state.lessons,
    currentLesson: state.currentLesson,
    currentTab: state.currentTab,
    completed: Array.from(state.completed).sort((a,b)=>a-b),
    coreCount: state.coreCount,
  };
}

function qs(id) { return document.getElementById(id); }

const LOCAL_STORAGE_KEYS = {
  'copilot-apps':    'apps-completed',
  'copilot-chat':    'chat-completed-v2',
  'building-agents': 'agents-completed',
};

function dispatchChange() {
  if (!state) return;
  const completedArr = Array.from(state.completed).sort((a,b)=>a-b);
  const detail = {
    courseId: state.courseId,
    progressCategory: state.progressCategory,
    currentLesson: state.currentLesson,
    currentTab: state.currentTab,
    lessons: state.lessons,
    completed: completedArr,
    completedCount: completedArr.length,
    totalCount: state.lessons.length,
    points: window.LessonRuntime.sumPoints(state.lessons, completedArr),
  };
  window.dispatchEvent(new CustomEvent('lessonruntime:change', { detail }));
}

function renderLesson(index) {
  if (!state) return;
  if (index < 0 || index >= state.lessons.length) return;
  state.currentLesson = index;
  repaintNav();

  if (state.customRenderLesson) {
    state.customRenderLesson();  // course owns the innerHTML of #lesson-content
  } else {
    const L = state.lessons[index];
    if (!L) return;
    const main = qs('lesson-content');
    if (!main) return;

    const tab = state.currentTab;
    const coreCount = state.coreCount;
    const done = state.completed.has(index);

    // Header label: "Lesson N — " for core lessons, "Bonus — " for bonus lessons.
    const headerLabel = index < coreCount ? 'Lesson ' + (index + 1) + ' \u2014 ' : 'Bonus \u2014 ';

    // Bonus badge (shown when lesson has bonus === true).
    const bonusBadge = L.bonus
      ? ' <span style="background:#fff3e0;color:#e65100;font-size:0.75rem;padding:2px 8px;border-radius:10px;margin-left:6px;vertical-align:middle;">BONUS</span>'
      : '';

    // Tab button at the bottom of .content.
    let tabButton = '';
    if (tab === 'learn') {
      tabButton = '<button class="continue-btn" onclick="switchTab(\'implement\')">Continue to Exercises &rarr;</button>';
    } else if (tab === 'implement') {
      tabButton = '<button class="mark-complete-btn' + (done ? ' completed' : '') + '" onclick="markComplete(' + index + ')">' + (done ? '&#10003; Completed' : 'Mark Complete') + '</button>';
    }

    // Tab body (raw HTML from lesson content).
    const tabBody = L[tab] || '';

    main.innerHTML =
      '<div class="step-header">' +
        '<h2>' + headerLabel + escapeHtml(L.title) + ' <span class="pts">' + L.points + ' pts</span>' + bonusBadge + '</h2>' +
      '</div>' +
      '<div class="tabs">' +
        '<div class="tab' + (tab === 'learn'     ? ' active' : '') + '" onclick="switchTab(\'learn\')">Learn</div>' +
        '<div class="tab' + (tab === 'implement' ? ' active' : '') + '" onclick="switchTab(\'implement\')">Exercises</div>' +
        '<div class="tab' + (tab === 'advanced'  ? ' active' : '') + '" onclick="switchTab(\'advanced\')">Advanced</div>' +
      '</div>' +
      '<div class="content">' +
        tabBody +
        tabButton +
      '</div>';

    repaintNav();
  }

  if (location.hash !== '#lesson-' + index) {
    history.replaceState(null, '', '#lesson-' + index);
  }
  decorateSteps();
  dispatchChange();
}

// Add a clickable progress checkbox to each narrative step inside the current tab's
// content. Targets <h4> elements whose text begins with "Step N" (e.g. copilot-chat
// and building-agents formats). Does NOT target <ol><li> steps -- each course already
// has its own exercise-check transformer (transformExerciseLists) that converts
// <ol> -> <ul.exercise-check> with native checkboxes and localStorage persistence.
// Decorating <li> here would produce a double checkbox once that transformer runs.
// State is keyed by course + lesson + tab + step index, persisted in localStorage.
function decorateSteps() {
  if (!state) return;
  const container = document.getElementById('lesson-content');
  if (!container) return;
  const scope = container.querySelector('.content') || container;
  const courseId = state.courseId || 'unknown';
  const lessonIdx = state.currentLesson ?? 0;
  const tab = state.currentTab || 'learn';
  const keyRoot = 'stepcheck:' + courseId + ':L' + lessonIdx + ':' + tab;

  const allSteps = Array.from(scope.querySelectorAll('h4'))
    .filter(h => /^\s*Step\s+\d+/i.test(h.textContent));

  allSteps.forEach((el, i) => {
    if (el.querySelector(':scope > .step-check')) return; // already decorated
    const key = keyRoot + ':s' + i;
    const initiallyChecked = safeReadLS(key) === '1';
    el.classList.add('has-step-check');
    const check = document.createElement('span');
    check.className = 'step-check';
    check.setAttribute('role', 'checkbox');
    check.setAttribute('tabindex', '0');
    check.setAttribute('aria-checked', initiallyChecked ? 'true' : 'false');
    check.setAttribute('aria-label', 'Mark this step done');
    check.onclick = function (e) {
      e.stopPropagation();
      const nowChecked = check.getAttribute('aria-checked') !== 'true';
      check.setAttribute('aria-checked', nowChecked ? 'true' : 'false');
      safeWriteLS(key, nowChecked ? '1' : '0');
    };
    check.onkeydown = function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        check.click();
      }
    };
    el.insertBefore(check, el.firstChild);
  });
}

function safeReadLS(key) {
  try { return localStorage.getItem(key); } catch (_) { return null; }
}
function safeWriteLS(key, value) {
  try { localStorage.setItem(key, value); } catch (_) {}
}

function switchTab(index, tabName) {
  if (!state) return;
  // Support switchTab(tabName) — single-arg form used in legacy content onclick handlers.
  if (typeof index === 'string' && tabName === undefined) {
    tabName = index;
    index = state.currentLesson;
  }
  if (!['learn','implement','advanced'].includes(tabName)) return;
  state.currentTab = tabName;
  try { sessionStorage.setItem('tab:' + state.courseId, tabName); } catch (_) {}
  renderLesson(index);
}

function markComplete(index) {
  if (!state) return;
  if (state.completed.has(index)) return;
  state.completed.add(index);
  repaintNav();
  const btn = document.querySelector('.mark-complete-btn');
  if (btn) { btn.innerHTML = '&#10003; Completed'; btn.classList.add('completed'); }
  scheduleFlush();
  dispatchChange();
  // Auto-advance to the next lesson after a brief pause so the "completed"
  // state is visible. No-op on the last lesson. Reset to the Learn tab so the
  // next lesson opens on the teaching content rather than inheriting the
  // Exercises tab the user was on when clicking Mark Complete.
  if (index + 1 < state.lessons.length && index === state.currentLesson) {
    setTimeout(() => {
      if (state && state.currentLesson === index) {
        state.currentTab = 'learn';
        try { sessionStorage.setItem('tab:' + state.courseId, 'learn'); } catch (_) {}
        gotoLesson(index + 1);
      }
    }, 700);
  }
}

function repaintNav() {
  if (!state) return;
  if (state.customRenderNav) {
    state.customRenderNav();  // course owns the innerHTML of #lesson-nav
    return;
  }
  const nav = qs('lesson-nav');
  if (!nav) return;

  const coreCount = state.coreCount;
  const useSections = (coreCount < state.lessons.length);

  let html = '';

  // If we have a mix of core and bonus lessons, open with a section label.
  if (useSections) {
    html += '<div class="nav-section-label">Core Lessons</div>';
  }

  state.lessons.forEach((l, i) => {
    // Insert bonus section label at the boundary.
    if (useSections && i === coreCount) {
      html += '<div class="nav-section-label">Bonus Challenges</div>';
    }

    const done   = state.completed.has(i);
    const active = i === state.currentLesson;
    const numLabel = i < coreCount ? 'L' + (i + 1) : 'Bonus';

    html +=
      '<div class="nav-item' + (active ? ' active' : '') + '" onclick="loadLesson(' + i + ')">' +
        '<span class="check' + (done ? ' done' : '') + '">' + (done ? '&#10003;' : '') + '</span>' +
        '<span class="label"><strong style="color:#217346;margin-right:6px;font-weight:700;">' + numLabel + '</strong>' + escapeHtml(l.title) + '</span>' +
        '<span class="points">' + l.points + ' pts</span>' +
      '</div>';
  });

  nav.innerHTML = html;
}

function gotoLesson(index) {
  if (!state) return;
  if (index < 0 || index >= state.lessons.length) return;
  renderLesson(index);
}

function scheduleFlush() {
  if (!state) return;
  if (state.flushTimer) clearTimeout(state.flushTimer);
  state.flushTimer = setTimeout(flush, 250); // debounce bursts of completes
}

// localStorage-backed queue so failed writes survive tab close / reload.
// Keyed per courseId so each course tracks its own pending payloads.
function flushQueueKey(courseId) { return 'pending-flush:' + courseId; }

function readFlushQueue(courseId) {
  try { return JSON.parse(localStorage.getItem(flushQueueKey(courseId)) || '[]'); }
  catch (_) { return []; }
}

function writeFlushQueue(courseId, queue) {
  try {
    if (!queue || queue.length === 0) localStorage.removeItem(flushQueueKey(courseId));
    else localStorage.setItem(flushQueueKey(courseId), JSON.stringify(queue));
  } catch (_) { /* quota etc. -- nothing useful to do */ }
}

// Backoff schedule for transient failures. Index = retries so far.
// Capped to avoid runaway loops while still recovering quickly from a brief
// blip (3s) and tolerating a long outage (final 2m attempt).
const FLUSH_BACKOFF_MS = [3_000, 10_000, 30_000, 60_000, 120_000];

async function flush() {
  if (!state) return;
  const completed = Array.from(state.completed).sort((a,b)=>a-b);
  const points = window.LessonRuntime.sumPoints(state.lessons, completed);
  const body = { [state.progressCategory]: { completed, points } };
  let r;
  try {
    r = await fetch('/api/progress', {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    // Success -- if anything is queued, drain it now (the in-flight write is
    // already up-to-date, so old queued payloads are obsolete: drop them).
    const queue = readFlushQueue(state.courseId);
    if (queue.length) writeFlushQueue(state.courseId, []);
    return;
  } catch (err) {
    const status = r ? r.status : 0;
    if (window.LessonRuntime.isTerminalStatus(status)) {
      // 401/403/etc. -- retrying won't help. Report and drop the in-memory
      // intent; the next user action will re-fire after they re-auth.
      reportClientError('flush_drop_terminal', err, {
        lessonIdx: state.currentLesson, status, bodyLen: JSON.stringify(body).length,
      });
      return;
    }
    // Persist for next session and schedule a retry now.
    const queue = window.LessonRuntime.enqueueFlush(readFlushQueue(state.courseId), body, Date.now());
    writeFlushQueue(state.courseId, queue);
    reportClientError('flush_failed', err, {
      lessonIdx: state.currentLesson, status, queueLen: queue.length,
    });
    setTimeout(drainFlushQueue, FLUSH_BACKOFF_MS[0]);
  }
}

// Drains the persisted queue oldest-first. Stops on first transient failure
// and re-arms a timer; drops items on terminal status or retry exhaustion.
async function drainFlushQueue() {
  if (!state) return;
  const courseId = state.courseId;
  let queue = readFlushQueue(courseId);
  while (queue.length) {
    const item = queue[0];
    let r;
    try {
      r = await fetch('/api/progress', {
        method: 'POST',
        credentials: 'include',
        keepalive: true,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(item.payload),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      queue = window.LessonRuntime.dequeueFront(queue);
      writeFlushQueue(courseId, queue);
    } catch (err) {
      const status = r ? r.status : 0;
      if (window.LessonRuntime.isTerminalStatus(status)) {
        reportClientError('flush_drop_terminal', err, { status, queuedAt: item.ts });
        queue = window.LessonRuntime.dequeueFront(queue);
        writeFlushQueue(courseId, queue);
        continue;
      }
      queue = window.LessonRuntime.markAttempt(queue);
      writeFlushQueue(courseId, queue);
      if (window.LessonRuntime.shouldDropAfterRetry(queue[0])) {
        reportClientError('flush_drop_max_retries', err, { status, queuedAt: item.ts });
        queue = window.LessonRuntime.dequeueFront(queue);
        writeFlushQueue(courseId, queue);
        continue;
      }
      const delay = FLUSH_BACKOFF_MS[Math.min(queue[0].retries, FLUSH_BACKOFF_MS.length - 1)];
      setTimeout(drainFlushQueue, delay);
      return;
    }
  }
}

function installQueueDrainTriggers() {
  if (window.__lessonRuntimeDrainInstalled) return;
  window.__lessonRuntimeDrainInstalled = true;
  // Network came back -- try the queue immediately.
  window.addEventListener('online', () => { drainFlushQueue().catch(() => {}); });
  // Tab regained focus -- a stalled flush may have been queued in the
  // background; try to clear it now that we're foreground.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') drainFlushQueue().catch(() => {});
  });
}

// Best-effort POST to /api/client-log. Uses sendBeacon when available so the
// report survives a navigation; falls back to fetch+keepalive. Silent: a
// failure here cannot recover by reporting itself.
function reportClientError(kind, err, extra) {
  try {
    const payload = {
      kind,
      message: err && err.message ? String(err.message) : String(err),
      stack: err && err.stack ? String(err.stack) : null,
      url: location.href,
      userAgent: navigator.userAgent,
      course: state ? state.courseId : null,
      lessonIdx: extra && typeof extra.lessonIdx === 'number' ? extra.lessonIdx : null,
      extra: extra || null,
    };
    const data = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      // sendBeacon defaults to text/plain. /api/client-log parses both.
      const ok = navigator.sendBeacon('/api/client-log', new Blob([data], { type: 'application/json' }));
      if (ok) return;
    }
    fetch('/api/client-log', {
      method: 'POST', credentials: 'include', keepalive: true,
      headers: { 'content-type': 'application/json' }, body: data,
    }).catch(() => {});
  } catch (_) { /* never throw out of error reporter */ }
}

function installGlobalErrorHandlers() {
  if (window.__lessonRuntimeErrHandlersInstalled) return;
  window.__lessonRuntimeErrHandlersInstalled = true;
  window.addEventListener('error', (e) => {
    reportClientError('onerror', e.error || new Error(e.message || 'unknown'), {
      filename: e.filename, lineno: e.lineno, colno: e.colno,
    });
  });
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    const err = reason instanceof Error ? reason : new Error(reason ? String(reason) : 'unhandled rejection');
    reportClientError('unhandledrejection', err, {});
  });
}

async function loadServerProgress() {
  try {
    const r = await fetch('/api/progress?me=true', { credentials: 'include' });
    if (!r.ok) return { completed: [], resetAt: null, hasRecord: false };
    const data = await r.json();
    const hasRecord = !!(data && data.myProgress);
    const mine = (hasRecord && data.myProgress[state.progressCategory]) || {};
    const resetAt = (data && typeof data.resetAt === 'number') ? data.resetAt : null;
    return {
      completed: Array.isArray(mine.completed) ? mine.completed : [],
      resetAt,
      hasRecord,
    };
  } catch (_) {
    return { completed: [], resetAt: null, hasRecord: false };
  }
}

function readLocalResetAt(courseId) {
  try { return Number(localStorage.getItem('resetAt:' + courseId)) || 0; }
  catch (_) { return 0; }
}
function writeLocalResetAt(courseId, value) {
  try { localStorage.setItem('resetAt:' + courseId, String(value)); } catch (_) {}
}

function readLocalCompleted(courseId) {
  const key = LOCAL_STORAGE_KEYS[courseId];
  if (!key) return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; }
}

function clearLocalCompleted(courseId) {
  const key = LOCAL_STORAGE_KEYS[courseId];
  if (key) try { localStorage.removeItem(key); } catch (_) {}
}

function installKeybinds() {
  document.addEventListener('keydown', (e) => {
    if (!state) return;
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') gotoLesson(state.currentLesson + 1);
    else if (e.key === 'ArrowLeft') gotoLesson(state.currentLesson - 1);
    else if (e.key === '1') switchTab(state.currentLesson, 'learn');
    else if (e.key === '2') switchTab(state.currentLesson, 'implement');
    else if (e.key === '3') switchTab(state.currentLesson, 'advanced');
  });
  // On nav/close, fire-and-forget a sendBeacon write of the current state. The
  // previous code called flush() which would race the unload and frequently
  // get killed mid-fetch -- sendBeacon is the right primitive here. The
  // payload is also enqueued so a hard failure is recoverable next session.
  window.addEventListener('beforeunload', () => {
    if (!state) return;
    const completed = Array.from(state.completed).sort((a,b)=>a-b);
    const points = window.LessonRuntime.sumPoints(state.lessons, completed);
    const body = { [state.progressCategory]: { completed, points } };
    // Enqueue first so a sendBeacon that quietly fails still has a recovery path.
    const queue = window.LessonRuntime.enqueueFlush(readFlushQueue(state.courseId), body, Date.now());
    writeFlushQueue(state.courseId, queue);
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/progress', new Blob([JSON.stringify(body)], { type: 'application/json' }));
      }
    } catch (_) { /* unload context -- nothing to do */ }
  });
}

async function initCourse({ courseId, progressCategory, lessons, coreCount, renderLesson: customRenderLesson, renderNav: customRenderNav }) {
  // IMPORTANT 6: guard against empty lessons array
  if (!lessons || lessons.length === 0) return;

  state = {
    courseId, progressCategory, lessons,
    // If coreCount not supplied, treat all lessons as core (no bonus section).
    coreCount: (typeof coreCount === 'number' && coreCount >= 0) ? coreCount : lessons.length,
    currentLesson: 0,
    currentTab: (function(){
      try { return sessionStorage.getItem('tab:' + courseId) || 'learn'; } catch(_) { return 'learn'; }
    })(),
    completed: new Set(),
    flushTimer: null,
    customRenderLesson: (typeof customRenderLesson === 'function') ? customRenderLesson : null,
    customRenderNav: (typeof customRenderNav === 'function') ? customRenderNav : null,
  };

  // IMPORTANT 5: fast path — paint immediately with local data so users
  // see content right away, even on slow networks.
  const local = readLocalCompleted(courseId);
  for (const i of local) state.completed.add(i);

  const m = /^#lesson-(\d+)$/.exec(location.hash);
  const startIdx = m ? Math.min(Math.max(parseInt(m[1],10),0), lessons.length-1) : 0;
  state.currentLesson = startIdx;

  installKeybinds();
  installGlobalErrorHandlers();
  installQueueDrainTriggers();
  // Drain anything left over from a previous session before the user does
  // anything new. Fire-and-forget; new completes will append to the queue
  // and the drain loop will pick them up.
  drainFlushQueue().catch(() => {});
  renderLesson(state.currentLesson);
  dispatchChange();

  // Slow path — reconcile with server progress and repaint nav if needed.
  const server = await loadServerProgress();

  // Reset-epoch check. If the workshop has been reset since the last time
  // we synced (or we have no record of syncing), treat local as stale:
  // wipe the in-memory state, clear localStorage, and use only server data.
  // This is what makes admin "Reset" actually stick — otherwise an active
  // student would re-upload their cached completions seconds later.
  const localResetAt = readLocalResetAt(courseId);
  const serverResetAt = server.resetAt || 0;
  const resetHappenedAfterLastSync = serverResetAt > 0 && serverResetAt > localResetAt;

  if (resetHappenedAfterLastSync) {
    state.completed.clear();
    clearLocalCompleted(courseId);
    for (const i of server.completed) state.completed.add(i);
    writeLocalResetAt(courseId, serverResetAt);
    scheduleFlush();
  } else {
    const mig = window.LessonRuntime.computeLocalStorageMigration({
      localCompleted: local, serverCompleted: server.completed, lessons,
    });
    for (const i of server.completed) state.completed.add(i);
    if (mig.shouldWrite) {
      for (const i of mig.mergedCompleted) state.completed.add(i);
      scheduleFlush();
    }
    if (mig.shouldClearLocal) clearLocalCompleted(courseId);
    if (serverResetAt > 0) writeLocalResetAt(courseId, serverResetAt);
  }

  repaintNav();
  dispatchChange();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

window.LessonRuntime = Object.assign(window.LessonRuntime || {}, {
  initCourse, renderLesson, switchTab, markComplete, gotoLesson, getState,
});

// Global aliases for lesson content onclick handlers (legacy compat).
// Lesson HTML strings call `switchTab('implement')` or `switchTab(N, 'implement')`
// and `markComplete(N)` and `loadLesson(N)` / `goToLesson(N)` directly (no namespace).
if (!window.switchTab) {
  window.switchTab = function (a, b) {
    if (!state) return;
    if (typeof b === 'string') {
      // switchTab(index, tabName)
      return LessonRuntime.switchTab(a, b);
    }
    // switchTab(tabName) — use current lesson
    return LessonRuntime.switchTab(state.currentLesson, a);
  };
}
if (!window.markComplete) {
  window.markComplete = function (index) { return LessonRuntime.markComplete(index); };
}
if (!window.loadLesson) {
  window.loadLesson = function (index) { return LessonRuntime.gotoLesson(index); };
}
if (!window.goToLesson) {
  window.goToLesson = function (index) { return LessonRuntime.gotoLesson(index); };
}

} // end if (typeof window !== 'undefined')
