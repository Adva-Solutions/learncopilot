// Reproduction for Thalia's bug (Quick check in thread, 2026-05-18):
//   "On my end it still looks like it's not noting my progress although
//    I have marked things complete."
//
// Audit data shows her server record is fully populated:
//   chat   [0,1,2,3,4,5,6]  110 pts
//   apps   [0,1,2,3,4]       95 pts
//   agents [0,1,2,3]        100 pts
//   total                    305 pts
// (every core lesson + every bonus -- maximum possible)
//
// But the homepage at index.html reads progress from localStorage only
// (updateDashboardProgress, lines 472-494). courses/lesson-runtime.js no
// longer writes to those localStorage keys -- it reads them once for
// legacy migration and clears them. So the homepage shows 0% to every
// current user regardless of server state.
//
// This test loads index.html's inline script in a sandbox and asserts
// the observable output of the three progress elements: #pct-chat,
// #pct-apps, #pct-agents.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const INDEX_HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Pull the single inline <script>...</script> block from index.html.
function extractDashboardScript() {
  const m = INDEX_HTML.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('inline <script> not found in index.html');
  return m[1];
}

// Thalia's server record, as observed in audit:progress:odaai.
const THALIA_SERVER = {
  myProgress: {
    chat:   { completed: [0, 1, 2, 3, 4, 5, 6], points: 110 },
    apps:   { completed: [0, 1, 2, 3, 4],       points: 95 },
    agents: { completed: [0, 1, 2, 3],          points: 100 },
    totalPoints: 305,
  },
  resetAt: null,
};

// Build a fresh sandbox + stub DOM for each test. Returns the sandbox and
// a `elements` map so the test can read what the dashboard rendered.
function buildSandbox({ localCompleted = {} } = {}) {
  const storage = new Map(Object.entries(localCompleted).map(([k, v]) => [k, JSON.stringify(v)]));

  const elements = {
    'prog-chat':   { style: { width: '0%' }, textContent: '' },
    'pct-chat':    { style: {}, textContent: '0%' },
    'prog-apps':   { style: { width: '0%' }, textContent: '' },
    'pct-apps':    { style: {}, textContent: '0%' },
    'prog-agents': { style: { width: '0%' }, textContent: '' },
    'pct-agents':  { style: {}, textContent: '0%' },
    'reset-wrap':  { style: { display: 'none' }, textContent: '' },
    'nav-map-link': null,
    'client-logo-hero': null,
    'client-logo-img': null,
    'branding-link': null,
    'hero-title': null,
    'hero-desc': null,
  };

  const sandbox = {
    console,
    setTimeout, clearTimeout, setInterval: () => 0, clearInterval: () => {},
    localStorage: {
      getItem: (k) => storage.has(k) ? storage.get(k) : null,
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
    },
    document: {
      getElementById: (id) => elements[id] || null,
      querySelectorAll: () => [],
      addEventListener: () => {},
    },
    window: {},
    location: { search: '?slug=odaai', href: 'http://test/', hash: '' },
    URLSearchParams,
    // Stub fetch: /api/me returns Thalia, /api/progress?me=true returns server data.
    fetch: async (url) => {
      if (url === '/api/me') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ name: 'Thalia Scagliola', slug: 'odaai', uid: 'a7f0c536' }),
        };
      }
      if (url === '/api/progress?me=true') {
        return { ok: true, status: 200, json: async () => THALIA_SERVER };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  return { sandbox, elements };
}

function runDashboardScript(sandbox) {
  const ctx = vm.createContext(sandbox);
  vm.runInContext(extractDashboardScript(), ctx, { filename: 'index.html#inline-script' });
}

// Wait two macrotask ticks so the script's await fetch(...) calls settle.
const settle = () => new Promise(r => setTimeout(r, 30));

// Regression guard for Thalia's bug. Before the fix the same test failed
// (homepage rendered 0% because updateDashboardProgress read localStorage
// only and lesson-runtime never writes the legacy keys).
test('homepage hydrates progress from /api/progress?me=true', async () => {
  const { sandbox, elements } = buildSandbox({ localCompleted: {} });
  runDashboardScript(sandbox);
  await settle();

  assert.strictEqual(elements['pct-chat'].textContent,   '100%', 'chat % from server');
  assert.strictEqual(elements['pct-apps'].textContent,   '100%', 'apps % from server');
  assert.strictEqual(elements['pct-agents'].textContent, '100%', 'agents % from server');
  assert.strictEqual(elements['prog-chat'].style.width,   '100%');
  assert.strictEqual(elements['prog-apps'].style.width,   '100%');
  assert.strictEqual(elements['prog-agents'].style.width, '100%');
});

// Sanity: calculation logic itself works correctly when given data.
// This was already true before the fix; included so a regression in the
// percentage math is caught alongside any regression in the server-hydrate.
test('homepage renders correctly when localStorage already has the data', async () => {
  const { sandbox, elements } = buildSandbox({
    localCompleted: {
      'chat-completed-v2': [0, 1, 2, 3, 4, 5, 6],
      'apps-completed':    [0, 1, 2, 3, 4],
      'agents-completed':  [0, 1, 2, 3],
    },
  });
  runDashboardScript(sandbox);
  await settle();

  assert.strictEqual(elements['pct-chat'].textContent,   '100%');
  assert.strictEqual(elements['pct-apps'].textContent,   '100%');
  assert.strictEqual(elements['pct-agents'].textContent, '100%');
});

// A partial record (e.g. only some lessons done) should render the right %.
test('homepage renders partial progress from server', async () => {
  const { sandbox, elements } = buildSandbox({ localCompleted: {} });
  // Override fetch for this test to return a partial record (3/6 chat).
  sandbox.fetch = async (url) => {
    if (url === '/api/me') {
      return { ok: true, status: 200, json: async () => ({ name: 'Test', slug: 'odaai' }) };
    }
    if (url === '/api/progress?me=true') {
      return {
        ok: true, status: 200,
        json: async () => ({
          myProgress: {
            chat:   { completed: [0, 1, 2], points: 30 },
            apps:   { completed: [],        points: 0 },
            agents: { completed: [0],       points: 25 },
          },
          resetAt: null,
        }),
      };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };
  runDashboardScript(sandbox);
  await settle();

  assert.strictEqual(elements['pct-chat'].textContent,   '50%',  '3/6 chat core');
  assert.strictEqual(elements['pct-apps'].textContent,   '0%',   'no apps done');
  assert.strictEqual(elements['pct-agents'].textContent, '25%',  '1/4 agents core');
});
