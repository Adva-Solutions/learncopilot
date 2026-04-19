'use strict';

const crypto = require('node:crypto');

const MAX_SAMPLE_FILE_BYTES = 4 * 1024 * 1024;

const ALLOWED_CATEGORIES = [
  'finance',
  'sales',
  'operations',
  'marketing',
  'hr',
  'leadership',
  'general',
];

const ALLOWED_MIMES = [
  'text/csv',
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

function isAllowedMime(m) {
  return typeof m === 'string' && ALLOWED_MIMES.includes(m);
}

function isAllowedCategory(c) {
  return typeof c === 'string' && ALLOWED_CATEGORIES.includes(c);
}

function decodeAndSize(b64) {
  if (typeof b64 !== 'string' || b64.length === 0) {
    throw new Error('base64 payload malformed or empty');
  }
  const buf = Buffer.from(b64, 'base64');
  const reencoded = buf.toString('base64');
  const strip = (s) => s.replace(/=+$/, '');
  if (strip(reencoded) !== strip(b64.replace(/\s+/g, ''))) {
    throw new Error('base64 payload malformed');
  }
  return buf.length;
}

function normalizeFileName(name) {
  if (typeof name !== 'string') throw new Error('file name empty');
  const trimmed = name.trim();
  if (trimmed.length === 0) throw new Error('file name empty');
  const safe = trimmed.replace(/[\\/]/g, '_');
  return safe.slice(0, 200);
}

function newSampleFileId() {
  return crypto.randomBytes(8).toString('hex');
}

module.exports = {
  isAllowedMime,
  isAllowedCategory,
  decodeAndSize,
  normalizeFileName,
  newSampleFileId,
  MAX_SAMPLE_FILE_BYTES,
  ALLOWED_CATEGORIES,
  ALLOWED_MIMES,
};
