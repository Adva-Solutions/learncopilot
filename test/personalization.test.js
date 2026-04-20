'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  buildReplacer,
  applyPersonalization,
} = require('../courses/lesson-runtime.js');

test('buildReplacer returns null when no usable keys', () => {
  assert.equal(buildReplacer(null), null);
  assert.equal(buildReplacer({}), null);
  assert.equal(buildReplacer({ '': 'x' }), null);
  assert.equal(buildReplacer(123), null);
});

test('buildReplacer swaps each occurrence with the mapped value', () => {
  const r = buildReplacer({ 'Apex Consulting': 'Foo Co' });
  assert.equal(r('Welcome to Apex Consulting!'), 'Welcome to Foo Co!');
});

test('buildReplacer applies longest match first', () => {
  const r = buildReplacer({
    'Finance': 'Money',
    'Finance and Accounting': 'Numbers',
  });
  assert.equal(r('the Finance and Accounting team'), 'the Numbers team');
  assert.equal(r('the Finance team'), 'the Money team');
});

test('buildReplacer HTML-escapes the replacement value', () => {
  const r = buildReplacer({ 'CLIENT_NAME': '<script>alert(1)</script>' });
  const out = r('<p>Hello CLIENT_NAME</p>');
  assert.ok(!out.includes('<script>'), 'script tag must not survive');
  assert.ok(out.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});

test('buildReplacer leaves surrounding HTML markup intact', () => {
  const r = buildReplacer({ 'X': 'Y' });
  assert.equal(r('<div class="a">X</div>'), '<div class="a">Y</div>');
});

test('buildReplacer escapes regex metacharacters in keys', () => {
  const r = buildReplacer({ 'a.b+c': 'HIT' });
  // `.` and `+` should be literal, not regex wildcards
  assert.equal(r('foo a.b+c bar'), 'foo HIT bar');
  assert.equal(r('foo abc bar'), 'foo abc bar');
});

test('applyPersonalization returns null when cfg/personalization absent', () => {
  const lessons = [{ title: 'L', implement: '<p>A</p>' }];
  assert.equal(applyPersonalization(lessons, 'chat', null), null);
  assert.equal(applyPersonalization(lessons, 'chat', {}), null);
  assert.equal(applyPersonalization(lessons, 'chat', { personalization: {} }), null);
});

test('applyPersonalization applies replacements across every string field', () => {
  const lessons = [
    { title: 'Apex Consulting Intro', implement: '<p>Apex Consulting helps</p>', learn: 'About Apex Consulting', points: 10 },
  ];
  const cfg = { personalization: { replacements: { 'Apex Consulting': 'Foo Co' } } };
  const out = applyPersonalization(lessons, 'chat', cfg);
  assert.equal(out[0].title, 'Foo Co Intro');
  assert.equal(out[0].implement, '<p>Foo Co helps</p>');
  assert.equal(out[0].learn, 'About Foo Co');
  assert.equal(out[0].points, 10);
});

test('applyPersonalization does not mutate the input lessons array', () => {
  const lessons = [{ title: 'Apex', implement: 'hello Apex' }];
  const cfg = { personalization: { replacements: { 'Apex': 'Foo' } } };
  const out = applyPersonalization(lessons, 'chat', cfg);
  assert.equal(lessons[0].title, 'Apex');
  assert.equal(lessons[0].implement, 'hello Apex');
  assert.equal(out[0].title, 'Foo');
});

test('applyPersonalization applies per-lesson object overrides', () => {
  const lessons = [
    { title: 'Original 1', implement: '<p>orig1</p>' },
    { title: 'Original 2', implement: '<p>orig2</p>' },
  ];
  const cfg = {
    personalization: {
      lessonOverrides: {
        chat: { '1': { implement: '<p>CUSTOM 2</p>' } },
      },
    },
  };
  const out = applyPersonalization(lessons, 'chat', cfg);
  assert.equal(out[0].implement, '<p>orig1</p>');
  assert.equal(out[0].title, 'Original 1');
  assert.equal(out[1].implement, '<p>CUSTOM 2</p>');
  assert.equal(out[1].title, 'Original 2');
});

test('applyPersonalization applies overrides from the right course bucket only', () => {
  const lessons = [{ title: 't', implement: 'i' }];
  const cfg = {
    personalization: {
      lessonOverrides: {
        apps: { '0': { implement: 'APPS_ONE' } },
        chat: { '0': { implement: 'CHAT_ONE' } },
      },
    },
  };
  assert.equal(applyPersonalization(lessons, 'chat', cfg)[0].implement, 'CHAT_ONE');
  assert.equal(applyPersonalization(lessons, 'apps', cfg)[0].implement, 'APPS_ONE');
  assert.equal(applyPersonalization(lessons, 'agents', cfg), null);
});

test('applyPersonalization treats a bare-string override as implement content', () => {
  const lessons = [{ title: 't', implement: '<p>orig</p>', learn: '<p>learn</p>' }];
  const cfg = { personalization: { lessonOverrides: { chat: { '0': '<p>BARE</p>' } } } };
  const out = applyPersonalization(lessons, 'chat', cfg);
  assert.equal(out[0].implement, '<p>BARE</p>');
  assert.equal(out[0].learn, '<p>learn</p>');
});

test('applyPersonalization runs replacements on override content too', () => {
  const lessons = [{ title: 't', implement: 'orig' }];
  const cfg = {
    personalization: {
      replacements: { 'PLACE': 'Client' },
      lessonOverrides: { chat: { '0': { implement: '<p>Hello PLACE</p>' } } },
    },
  };
  const out = applyPersonalization(lessons, 'chat', cfg);
  assert.equal(out[0].implement, '<p>Hello Client</p>');
});
