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

// Build a single regex that matches any personalization key, longest-first so
// "Finance and Accounting" wins over "Finance". Returns a function that
// replaces each match with the admin-supplied value, HTML-escaped so a stray
// `<script>` in a replacement value doesn't execute when re-inserted into a
// lesson's HTML. Defined at module scope so it's reachable from both the
// browser path and node:test imports.
function buildReplacer(replacements) {
  if (!replacements || typeof replacements !== 'object') return null;
  const keys = Object.keys(replacements).filter(k => typeof k === 'string' && k.length > 0);
  if (keys.length === 0) return null;
  keys.sort((a, b) => b.length - a.length);
  const pattern = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(pattern, 'g');
  const escapeHtml = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return (s) => s.replace(re, (match) => {
    const val = replacements[match];
    return typeof val === 'string' ? escapeHtml(val) : match;
  });
}

// Apply admin-generated personalization to a lessons array. Pure (no DOM).
// Returns a new array with replacements and per-lesson overrides applied,
// or `null` when nothing to do.
function applyPersonalization(lessons, progressCategory, cfg) {
  if (!cfg || !cfg.personalization) return null;
  const { replacements, lessonOverrides } = cfg.personalization;
  const courseOverrides = (lessonOverrides && lessonOverrides[progressCategory]) || {};
  const replacer = buildReplacer(replacements);
  const hasOverrides = courseOverrides && typeof courseOverrides === 'object' && Object.keys(courseOverrides).length > 0;
  if (!replacer && !hasOverrides) return null;

  return lessons.map((lesson, i) => {
    let merged = { ...lesson };
    const override = courseOverrides[String(i)];
    if (override && typeof override === 'object') {
      merged = { ...merged, ...override };
    } else if (typeof override === 'string') {
      merged.implement = override;
    }
    if (replacer) {
      for (const key of Object.keys(merged)) {
        if (typeof merged[key] === 'string') {
          merged[key] = replacer(merged[key]);
        }
      }
    }
    return merged;
  });
}

// Dual export: <script> loads attach to window; node:test requires via CommonJS.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildNav, sumPoints, diffCompleted, computeLocalStorageMigration,
    buildReplacer, applyPersonalization,
  };
}
if (typeof window !== 'undefined') {
  window.LessonRuntime = Object.assign(window.LessonRuntime || {}, {
    buildNav, sumPoints, diffCompleted, computeLocalStorageMigration,
    buildReplacer, applyPersonalization,
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

async function flush() {
  if (!state) return;
  const completed = Array.from(state.completed).sort((a,b)=>a-b);
  const points = window.LessonRuntime.sumPoints(state.lessons, completed);
  const body = { [state.progressCategory]: { completed, points } };
  try {
    const r = await fetch('/api/progress', {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
  } catch (_) {
    // keep retrying on nav / beforeunload
    setTimeout(scheduleFlush, 3000);
  }
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
  window.addEventListener('beforeunload', () => { if (state && state.flushTimer) flush(); });
}

async function loadWorkshopConfig() {
  try {
    const r = await fetch('/api/workshop-config', { credentials: 'include' });
    if (!r.ok) return null;
    return await r.json();
  } catch (_) { return null; }
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
  renderLesson(state.currentLesson);
  dispatchChange();

  // Slow path — reconcile with server progress, and apply admin-generated
  // personalization (replacements + lesson overrides) once /api/workshop-config
  // returns. Running these in parallel keeps the first-paint time unchanged;
  // a personalization repaint (if any) lands within one extra RTT.
  const [wsConfig, server] = await Promise.all([loadWorkshopConfig(), loadServerProgress()]);

  const personalizedLessons = applyPersonalization(state.lessons, state.progressCategory, wsConfig);
  if (personalizedLessons) {
    state.lessons = personalizedLessons;
    renderLesson(state.currentLesson);
  }

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
