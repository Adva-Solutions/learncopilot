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
  await page.waitForTimeout(1200);

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
