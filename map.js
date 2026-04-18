/* ------------------------------------------------------------------ *
 *  Copilot Opportunity Map — client-side rendering
 * ------------------------------------------------------------------ */

// --------------- constants ---------------

const HORIZON_ORDER = { now: 0, next: 1, later: 2 };

const LESSON_LABELS = {
  'chat:0': 'Chat: Know Your Way Around',
  'chat:1': 'Chat: Custom Instructions',
  'chat:2': 'Chat: Knowledge Notebooks',
  'chat:3': 'Chat: Pages',
  'chat:4': 'Chat: Search',
  'chat:5': 'Chat: Create',
  'apps:0': 'Apps: Outlook',
  'apps:1': 'Apps: Word',
  'apps:2': 'Apps: Excel',
  'apps:3': 'Apps: PowerPoint',
  'apps:4': 'Apps: Teams',
  'agents:0': 'Agents: What\'s an Agent?',
  'agents:1': 'Agents: Browse & Add',
  'agents:2': 'Agents: Researcher',
  'agents:3': 'Agents: Analyst',
  'agents:4': 'Agents: Write Like Me',
  'agents:5': 'Agents: Report Writer',
  'agents:6': 'Agents: Workflow Agents',
  'agents:7': 'Agents: Best Practices',
  'agents:8': 'Agents: Custom Challenge',
  'agents:9': 'Agents: Ecosystem Design',
};

// --------------- boot ---------------

const app = document.getElementById('app');
const params = new URLSearchParams(window.location.search);
const isEmbed = params.get('embed') === '1';
const isPrint = params.get('print') === '1';

if (isEmbed) document.body.classList.add('embed-mode');
if (isPrint) document.body.classList.add('print-mode');

boot();

async function boot() {
  const slug = extractSlug();
  if (!slug) {
    app.innerHTML = '<p class="error-msg">No map slug found in the URL.</p>';
    return;
  }

  try {
    const res = await fetch(`/api/map?slug=${encodeURIComponent(slug)}`, {
      credentials: 'include',
    });

    if (res.status === 401) {
      window.location.href = '/login.html';
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      app.innerHTML = `<p class="error-msg">${err.error || 'Failed to load map.'}</p>`;
      return;
    }

    const { map } = await res.json();
    render(map);
  } catch (e) {
    app.innerHTML = '<p class="error-msg">Network error. Please try again.</p>';
  }
}

function extractSlug() {
  // Expect URL path like /map/<slug> or /map.html with ?slug=...
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'map' && pathParts[1]) {
    return pathParts[1];
  }
  return params.get('slug') || '';
}

// --------------- render ---------------

function render(map) {
  const opportunities = sortOpportunities(map.opportunities || []);
  const total = opportunities.length;

  // Counts by horizon
  const counts = { all: total, now: 0, next: 0, later: 0 };
  opportunities.forEach(o => { if (counts[o.horizon] !== undefined) counts[o.horizon]++; });

  app.innerHTML = '';
  app.appendChild(buildHeader(map, total));
  app.appendChild(buildViewToggle());
  app.appendChild(buildFilters(counts));

  const mainArea = el('div', 'main-area');

  // Index rail (desktop sidebar)
  mainArea.appendChild(buildIndexRail(opportunities));

  // Cases view
  mainArea.appendChild(buildCasesView(opportunities, total));

  // Priority matrix view
  mainArea.appendChild(buildMatrixView(opportunities));

  app.appendChild(mainArea);

  // Default: show cases, hide matrix
  setActiveView('cases');
  setActiveFilter('all');

  // Set up IntersectionObserver for rail highlighting
  observeCases();
}

// --------------- header ---------------

function buildHeader(map, total) {
  const header = el('header', 'map-header');

  const clientName = el('div', 'header-client');
  clientName.textContent = map.clientName || '';

  const title = el('h1', 'header-title');
  title.textContent = 'M365 Copilot Opportunity Map';

  const meta = el('div', 'header-meta');

  const date = el('span', 'header-date');
  date.textContent = `Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;

  const count = el('span', 'header-count');
  count.textContent = `${total} opportunit${total === 1 ? 'y' : 'ies'}`;

  const exportBtn = el('button', 'btn-export');
  exportBtn.textContent = 'Export PDF';
  exportBtn.addEventListener('click', handleExportPdf);

  meta.appendChild(date);
  meta.appendChild(count);
  meta.appendChild(exportBtn);

  header.appendChild(clientName);
  header.appendChild(title);
  header.appendChild(meta);

  return header;
}

function handleExportPdf() {
  document.body.classList.add('print-mode');
  window.print();
  // Remove print-mode after printing unless ?print=1 was set
  if (!isPrint) {
    window.addEventListener('afterprint', function onAfter() {
      document.body.classList.remove('print-mode');
      window.removeEventListener('afterprint', onAfter);
    });
  }
}

// --------------- view toggle ---------------

function buildViewToggle() {
  const nav = el('nav', 'view-toggle');

  const casesBtn = el('button', 'view-btn active');
  casesBtn.dataset.view = 'cases';
  casesBtn.textContent = 'Cases';
  casesBtn.addEventListener('click', () => setActiveView('cases'));

  const matrixBtn = el('button', 'view-btn');
  matrixBtn.dataset.view = 'matrix';
  matrixBtn.textContent = 'Priority Matrix';
  matrixBtn.addEventListener('click', () => setActiveView('matrix'));

  nav.appendChild(casesBtn);
  nav.appendChild(matrixBtn);
  return nav;
}

function setActiveView(view) {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  const casesView = document.querySelector('.cases-view');
  const matrixView = document.querySelector('.matrix-view');
  const indexRail = document.querySelector('.index-rail');

  if (casesView) casesView.classList.toggle('hidden', view !== 'cases');
  if (matrixView) matrixView.classList.toggle('hidden', view !== 'matrix');
  if (indexRail) indexRail.classList.toggle('hidden', view !== 'cases');
}

// --------------- filter chips ---------------

function buildFilters(counts) {
  const bar = el('div', 'filter-bar');

  ['all', 'now', 'next', 'later'].forEach(key => {
    const chip = el('button', `filter-chip${key === 'all' ? ' active' : ''}`);
    chip.dataset.filter = key;
    chip.textContent = `${capitalize(key)} (${counts[key]})`;
    chip.addEventListener('click', () => setActiveFilter(key));
    bar.appendChild(chip);
  });

  return bar;
}

function setActiveFilter(filter) {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.filter === filter);
  });

  document.querySelectorAll('.case').forEach(card => {
    if (filter === 'all') {
      card.classList.remove('filtered-out');
    } else {
      card.classList.toggle('filtered-out', card.dataset.horizon !== filter);
    }
  });
}

// --------------- cases view ---------------

function buildCasesView(opportunities, total) {
  const container = el('div', 'cases-view');

  opportunities.forEach((opp, idx) => {
    container.appendChild(buildCaseCard(opp, idx, total));
  });

  return container;
}

function buildCaseCard(opp, idx, total) {
  const article = document.createElement('article');
  article.className = 'case';
  article.id = `case-${opp.id}`;
  article.dataset.horizon = opp.horizon;

  const num = String(idx + 1).padStart(2, '0');
  const ev = opp.evidence || {};
  const lessonLabel = opp.workshopLesson ? (LESSON_LABELS[opp.workshopLesson] || opp.workshopLesson) : '';

  article.innerHTML = `
    <div class="case-meta">
      <span class="case-num">${num} of ${String(total).padStart(2, '0')}</span>
      <span class="horizon-tag horizon-${opp.horizon}">${capitalize(opp.horizon)}</span>
      <span class="dept-tag">${escHtml(opp.department || '')}</span>
    </div>
    <h2 class="case-title">${escHtml(opp.title)}</h2>
    ${ev.quote ? `
    <blockquote class="case-quote">
      "${escHtml(ev.quote)}"
      <cite>— ${escHtml(ev.participantRole || '')} <span class="source-tag">${escHtml(ev.source || '')}</span></cite>
    </blockquote>` : ''}
    <div class="case-approach">
      <h3>What Copilot Can Do Here</h3>
      <p>${escHtml(opp.copilotApproach || '')}</p>
    </div>
    <div class="case-details">
      <div class="case-horizon-reason"><strong>Timeline:</strong> ${escHtml(opp.horizonReason || '')}</div>
      <div class="case-scores">
        <span class="score">Impact: <strong>${opp.impact}/5</strong></span>
        <span class="score">Difficulty: <strong>${opp.difficulty}/5</strong></span>
      </div>
      <div class="case-features">
        ${(opp.copilotFeatures || []).map(f => `<span class="feature-tag">${escHtml(f)}</span>`).join('')}
      </div>
      <div class="case-tools">
        ${(opp.requiredTools || []).map(t => `<span class="tool-tag">${escHtml(t)}</span>`).join('')}
      </div>
      ${opp.workshopLesson ? `<div class="case-lesson"><a href="#">Workshop: ${escHtml(lessonLabel)}</a></div>` : ''}
    </div>
  `;

  return article;
}

// --------------- priority matrix ---------------

function buildMatrixView(opportunities) {
  const container = el('div', 'matrix-view hidden');

  const grid = el('div', 'matrix-grid');

  const quadrants = [
    { key: 'quick-wins',     label: 'Quick Wins',     desc: 'High impact, low effort',  test: o => o.impact >= 4 && o.difficulty <= 2 },
    { key: 'strategic-bets', label: 'Strategic Bets',  desc: 'High impact, high effort',  test: o => o.impact >= 4 && o.difficulty >= 4 },
    { key: 'easy-fillers',   label: 'Easy Fillers',    desc: 'Lower impact, low effort',  test: o => o.impact <= 3 && o.difficulty <= 3 },
    { key: 'park',           label: 'Park',            desc: 'Lower impact, high effort', test: o => o.impact <= 3 && o.difficulty >= 4 },
  ];

  quadrants.forEach(q => {
    const cell = el('div', `matrix-cell matrix-${q.key}`);

    const header = el('div', 'matrix-cell-header');
    header.innerHTML = `<h3>${q.label}</h3><span class="matrix-cell-desc">${q.desc}</span>`;
    cell.appendChild(header);

    const items = el('div', 'matrix-cell-items');
    const matches = opportunities.filter(q.test);

    matches.forEach(opp => {
      const mini = el('button', 'matrix-mini-card');
      mini.dataset.target = `case-${opp.id}`;
      mini.innerHTML = `
        <span class="horizon-tag horizon-${opp.horizon}">${capitalize(opp.horizon)}</span>
        <span class="mini-title">${escHtml(opp.title)}</span>
      `;
      mini.addEventListener('click', () => scrollToCase(opp.id));
      items.appendChild(mini);
    });

    if (matches.length === 0) {
      const empty = el('div', 'matrix-empty');
      empty.textContent = 'None';
      items.appendChild(empty);
    }

    cell.appendChild(items);
    grid.appendChild(cell);
  });

  // Axis labels
  const wrapper = el('div', 'matrix-wrapper');

  const yLabel = el('div', 'matrix-y-label');
  yLabel.textContent = 'Value (Impact)';

  const xLabel = el('div', 'matrix-x-label');
  xLabel.textContent = 'Effort (Difficulty)';

  wrapper.appendChild(yLabel);
  wrapper.appendChild(grid);
  wrapper.appendChild(xLabel);
  container.appendChild(wrapper);

  return container;
}

function scrollToCase(id) {
  setActiveView('cases');
  setActiveFilter('all');
  const target = document.getElementById(`case-${id}`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('case-highlight');
    setTimeout(() => target.classList.remove('case-highlight'), 1500);
  }
}

// --------------- index rail ---------------

function buildIndexRail(opportunities) {
  const rail = el('aside', 'index-rail');

  const heading = el('div', 'rail-heading');
  heading.textContent = 'Opportunities';
  rail.appendChild(heading);

  const list = el('ol', 'rail-list');

  opportunities.forEach((opp, idx) => {
    const li = el('li', 'rail-item');
    li.dataset.target = `case-${opp.id}`;

    const num = el('span', 'rail-num');
    num.textContent = String(idx + 1).padStart(2, '0');

    const title = el('span', 'rail-title');
    title.textContent = opp.title;

    li.appendChild(num);
    li.appendChild(title);

    li.addEventListener('click', () => {
      const target = document.getElementById(`case-${opp.id}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    list.appendChild(li);
  });

  rail.appendChild(list);
  return rail;
}

function observeCases() {
  const railItems = document.querySelectorAll('.rail-item');
  if (!railItems.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          railItems.forEach(item => {
            item.classList.toggle('active', item.dataset.target === id);
          });
        }
      });
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
  );

  document.querySelectorAll('.case').forEach(card => observer.observe(card));
}

// --------------- helpers ---------------

function sortOpportunities(opps) {
  return [...opps].sort((a, b) => {
    const hDiff = (HORIZON_ORDER[a.horizon] || 0) - (HORIZON_ORDER[b.horizon] || 0);
    if (hDiff !== 0) return hDiff;
    return (b.impact || 0) - (a.impact || 0);
  });
}

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
