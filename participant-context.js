/**
 * Participant Context — fetches interview data from Listen Labs via /api/interviews
 * and personalizes course prompts with the participant's real use cases.
 *
 * Usage: Include this script in any course HTML page.
 * It replaces placeholder tokens in code blocks with real participant data.
 *
 * Placeholder tokens in prompts:
 *   {{ROLE}}        → "I am a Development Director at Shalom Hartman Institute"
 *   {{ORG}}         → "Shalom Hartman Institute"
 *   {{TOPICS}}      → "fundraising, donor engagement, board reporting"
 *   {{CONTEXT}}     → "My key focus areas are: fundraising, donor engagement, board reporting."
 *   {{AUDIENCE}}    → "donors, board, staff"
 *   {{NAME}}        → participant's name
 *
 * If no interview data is found, placeholders are replaced with sensible defaults.
 */

(function() {
  'use strict';

  let participantCtx = null;
  let contextLoaded = false;

  // Default fallbacks when no interview data available
  const DEFAULTS = {
    ROLE: 'I work at my organization',
    ORG: 'my organization',
    TOPICS: 'productivity, communication, reporting',
    CONTEXT: 'I want to use AI to improve my daily workflows.',
    AUDIENCE: 'my team',
    NAME: localStorage.getItem('workshop_user') || 'participant',
  };

  /**
   * Fetch participant context from the API.
   */
  async function loadContext() {
    if (contextLoaded) return participantCtx;

    try {
      const studyId = (typeof TENANT !== 'undefined' && TENANT.listenLabsStudyId) || '';
      const qs = studyId ? '?study=' + encodeURIComponent(studyId) : '';
      const res = await fetch('/api/interviews' + qs);
      if (!res.ok) {
        contextLoaded = true;
        return null;
      }
      const data = await res.json();
      if (data.found && data.context) {
        participantCtx = data.context;
      }
    } catch (e) {
      // API not available (local dev) — use defaults
    }

    contextLoaded = true;
    return participantCtx;
  }

  /**
   * Get a context value by key, with fallback to defaults.
   */
  function getVal(key) {
    if (participantCtx) {
      switch (key) {
        case 'ROLE': return participantCtx.prompts?.role || DEFAULTS.ROLE;
        case 'ORG': return participantCtx.org || DEFAULTS.ORG;
        case 'TOPICS': return (participantCtx.topics || []).join(', ') || DEFAULTS.TOPICS;
        case 'CONTEXT': return participantCtx.prompts?.context || DEFAULTS.CONTEXT;
        case 'AUDIENCE': return participantCtx.prompts?.audience || DEFAULTS.AUDIENCE;
        case 'NAME': return participantCtx.name || DEFAULTS.NAME;
      }
    }
    return DEFAULTS[key] || key;
  }

  /**
   * Replace all {{PLACEHOLDER}} tokens in code blocks with participant data.
   * Called after each lesson render.
   */
  function personalizePrompts() {
    const blocks = document.querySelectorAll('.code-block code, .code-block pre, .code-block');
    blocks.forEach(block => {
      // Skip if block only contains a button (copy btn)
      if (block.children.length === 1 && block.children[0].classList?.contains('copy-btn')) return;

      const text = block.textContent || '';
      if (text.includes('{{')) {
        // Walk text nodes to preserve HTML structure
        const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent.includes('{{')) {
            node.textContent = node.textContent
              .replace(/\{\{ROLE\}\}/g, getVal('ROLE'))
              .replace(/\{\{ORG\}\}/g, getVal('ORG'))
              .replace(/\{\{TOPICS\}\}/g, getVal('TOPICS'))
              .replace(/\{\{CONTEXT\}\}/g, getVal('CONTEXT'))
              .replace(/\{\{AUDIENCE\}\}/g, getVal('AUDIENCE'))
              .replace(/\{\{NAME\}\}/g, getVal('NAME'));
          }
        }
      }
    });

    // Also show a personalization indicator if context was loaded
    if (participantCtx && !document.getElementById('personalized-badge')) {
      const badge = document.createElement('div');
      badge.id = 'personalized-badge';
      badge.style.cssText = 'position:fixed;bottom:16px;right:16px;background:#0c1f3f;color:#c5973e;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;z-index:999;opacity:0.9;';
      badge.textContent = 'Personalized for ' + participantCtx.name;
      document.body.appendChild(badge);
      setTimeout(() => { badge.style.opacity = '0.5'; }, 3000);
    }
  }

  /**
   * Hook into the lesson render cycle.
   * After each renderLesson() call, re-personalize the new content.
   */
  function hookRenderCycle() {
    // Observe changes to #app-content (where lessons render)
    const target = document.getElementById('app-content');
    if (!target) return;

    const observer = new MutationObserver(() => {
      personalizePrompts();
    });

    observer.observe(target, { childList: true, subtree: true });
  }

  // Initialize on page load
  async function init() {
    await loadContext();
    hookRenderCycle();
    // Personalize the initially rendered lesson + retry to catch late renders
    personalizePrompts();
    setTimeout(personalizePrompts, 300);
    setTimeout(personalizePrompts, 1000);
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual use
  window.participantContext = {
    load: loadContext,
    personalize: personalizePrompts,
    getVal,
  };
})();
