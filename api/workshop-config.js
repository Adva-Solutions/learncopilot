import { getRedis } from './lib/redis.js';
import { getUser } from './me.js';

function mergeOverrides(template, client) {
  const merged = {
    replacements: { ...(template.replacements || {}), ...(client.replacements || {}) },
    lessonOverrides: {},
  };

  // Merge lesson overrides: template first, client wins
  const allCourses = new Set([
    ...Object.keys(template.lessonOverrides || {}),
    ...Object.keys(client.lessonOverrides || {}),
  ]);
  for (const course of allCourses) {
    const tLessons = (template.lessonOverrides || {})[course] || {};
    const cLessons = (client.lessonOverrides || {})[course] || {};
    const allLessonKeys = new Set([...Object.keys(tLessons), ...Object.keys(cLessons)]);
    merged.lessonOverrides[course] = {};
    for (const key of allLessonKeys) {
      const tVal = tLessons[key];
      const cVal = cLessons[key];
      if (tVal && cVal && typeof tVal === 'object' && typeof cVal === 'object') {
        merged.lessonOverrides[course][key] = { ...tVal, ...cVal };
      } else {
        merged.lessonOverrides[course][key] = cVal || tVal;
      }
    }
  }

  return merged;
}

export default async function handler(req, res) {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: 'Not logged in' });

  const r = getRedis();

  // Always load template overrides
  let templateOverrides = { replacements: {}, lessonOverrides: {} };
  try {
    const tRaw = await r.get('template:personalization');
    if (tRaw) templateOverrides = JSON.parse(tRaw);
  } catch (e) { /* template overrides optional */ }

  // If no client slug, return template overrides only
  if (!user.slug) {
    const hasContent = Object.keys(templateOverrides.replacements || {}).length > 0 ||
                       Object.keys(templateOverrides.lessonOverrides || {}).length > 0;
    return res.status(200).json({
      personalization: hasContent ? templateOverrides : null,
      clientName: null,
      logoUrl: null,
    });
  }

  // Load client-specific personalization
  let clientOverrides = null;
  try {
    const status = await r.get(`client:${user.slug}:personalization:status`);
    if (status === 'approved') {
      const raw = await r.get(`client:${user.slug}:personalization`);
      if (raw) clientOverrides = JSON.parse(raw);
    }
  } catch (e) { /* personalization data corrupted — skip */ }

  // Merge: template base + client on top
  const personalization = clientOverrides
    ? mergeOverrides(templateOverrides, clientOverrides)
    : (Object.keys(templateOverrides.replacements || {}).length > 0 || Object.keys(templateOverrides.lessonOverrides || {}).length > 0)
      ? templateOverrides
      : null;

  // Get client info for logo
  let client = {};
  try {
    const clientRaw = await r.get(`client:${user.slug}`);
    if (clientRaw) client = JSON.parse(clientRaw);
  } catch (e) { /* client data corrupted — use empty */ }

  return res.status(200).json({
    personalization,
    clientName: client.name || null,
    logoUrl: client.logoUrl || null,
  });
}
