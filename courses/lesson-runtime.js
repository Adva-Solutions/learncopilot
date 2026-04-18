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
