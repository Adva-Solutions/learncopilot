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

// Dual export: <script> loads attach to window; node:test requires via CommonJS.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildNav, sumPoints, diffCompleted, computeLocalStorageMigration };
}
if (typeof window !== 'undefined') {
  window.LessonRuntime = Object.assign(window.LessonRuntime || {}, {
    buildNav, sumPoints, diffCompleted, computeLocalStorageMigration,
  });
}

// --- DOM layer (browser only) ---
if (typeof window !== 'undefined') {

let state = null; // { courseId, progressCategory, lessons, currentLesson, currentTab, completed: Set, pendingWrite: Promise|null, flushTimer: number|null }

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
  const L = state.lessons[index];
  if (!L) return;
  state.currentLesson = index;
  const main = qs('lesson-content');
  if (!main) return;
  const tab = state.currentTab;
  main.innerHTML = `
    <div class="lesson-header">
      <h1>${escapeHtml(L.title)} <span class="pts-badge">${L.points} pts</span></h1>
    </div>
    <div class="tabs">
      <button class="tab-btn${tab==='learn'?' active':''}"     onclick="LessonRuntime.switchTab(${index},'learn')">Learn</button>
      <button class="tab-btn${tab==='implement'?' active':''}" onclick="LessonRuntime.switchTab(${index},'implement')">Exercises</button>
      <button class="tab-btn${tab==='advanced'?' active':''}"  onclick="LessonRuntime.switchTab(${index},'advanced')">Advanced</button>
    </div>
    <div class="tab-content content-animate">${L[tab] || ''}</div>
    <div class="lesson-footer">
      <button class="mark-complete-btn${state.completed.has(index)?' completed':''}"
              onclick="LessonRuntime.markComplete(${index})">
        ${state.completed.has(index) ? '✓ Completed' : 'Mark Complete'}
      </button>
    </div>`;
  repaintNav();
  if (location.hash !== '#lesson-' + index) {
    history.replaceState(null, '', '#lesson-' + index);
  }
  dispatchChange();
}

function switchTab(index, tabName) {
  if (!state) return;
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
  if (btn) { btn.textContent = '✓ Completed'; btn.classList.add('completed'); }
  scheduleFlush();
  dispatchChange();
}

function repaintNav() {
  if (!state) return;
  const nav = qs('lesson-nav');
  if (!nav) return;
  const items = window.LessonRuntime.buildNav(state.lessons, state.completed, state.currentLesson);
  nav.innerHTML = items.map(it => `
    <a class="lesson-nav-item${it.active?' active':''}${it.completed?' completed':''}"
       href="#lesson-${it.index}"
       onclick="event.preventDefault(); LessonRuntime.gotoLesson(${it.index})">
      <span class="check">${it.completed ? '✓' : ''}</span>
      <span class="title">${escapeHtml(it.title)}</span>
      <span class="pts">${it.points} pts</span>
    </a>`).join('');
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
    if (!r.ok) return { completed: [] };
    const data = await r.json();
    const mine = (data && data.myProgress && data.myProgress[state.progressCategory]) || {};
    return { completed: Array.isArray(mine.completed) ? mine.completed : [] };
  } catch (_) {
    return { completed: [] };
  }
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

async function initCourse({ courseId, progressCategory, lessons }) {
  // IMPORTANT 6: guard against empty lessons array
  if (!lessons || lessons.length === 0) return;

  state = {
    courseId, progressCategory, lessons,
    currentLesson: 0,
    currentTab: (function(){
      try { return sessionStorage.getItem('tab:' + courseId) || 'learn'; } catch(_) { return 'learn'; }
    })(),
    completed: new Set(),
    flushTimer: null,
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

  // Slow path — reconcile with server progress and repaint nav if needed.
  const server = await loadServerProgress();
  const mig = window.LessonRuntime.computeLocalStorageMigration({
    localCompleted: local, serverCompleted: server.completed, lessons,
  });
  for (const i of server.completed) state.completed.add(i);
  if (mig.shouldWrite) {
    for (const i of mig.mergedCompleted) state.completed.add(i);
    scheduleFlush();
  }
  if (mig.shouldClearLocal) clearLocalCompleted(courseId);
  repaintNav();
  dispatchChange();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

window.LessonRuntime = Object.assign(window.LessonRuntime || {}, {
  initCourse, renderLesson, switchTab, markComplete, gotoLesson,
});

} // end if (typeof window !== 'undefined')
