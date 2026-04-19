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

  console.log('5. delete via data-delete-id (confirms via window.confirm)');
  const id = await page.$eval('#sf-list [data-delete-id]', el => el.getAttribute('data-delete-id'));
  page.on('dialog', d => d.accept());
  const del = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/admin/sample-files?id=' + id) && r.request().method() === 'DELETE'),
    page.click('[data-delete-id="' + id + '"]'),
  ]);
  if (del[0].status() !== 204) { console.log('FAIL delete status=' + del[0].status()); process.exit(1); }

  console.log('errors:', errors.length);
  errors.forEach(e => console.log(' ', e));
  if (errors.length) process.exit(1);
  console.log('ADMIN SMOKE: PASS');
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
