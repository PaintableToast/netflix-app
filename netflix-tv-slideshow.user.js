// ==UserScript==
// @name         Jellyfin TV slideshow focus
// @namespace    PaintableToast/netflix-app
// @version      1.0.0
// @description  Start the home preview focused and reuse MediaBar's previous/next actions.
// @match        https://media.hunold24.de/web/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(() => {
  'use strict';
  window.netflixTvSlideshow?.remove();
  let initialFocusDone = false;
  let userInteracted = false;
  const previousAttributes = new Map();
  const tv = () => document.documentElement.classList.contains('layout-tv');
  const home = () => /^#\/home(?:[/?]|$)/.test(location.hash);
  const visible = e => e && e.getClientRects().length && getComputedStyle(e).display !== 'none';
  function remember(element) {
    if (!previousAttributes.has(element)) previousAttributes.set(element, {
      tabindex: element.getAttribute('tabindex'),
      label: element.getAttribute('aria-label'),
      focusable: element.classList.contains('focusable')
    });
  }
  function refresh() {
    if (!tv() || !home()) return;
    const root = document.getElementById('slides-container');
    if (!visible(root) || !visible(root.querySelector('.slide.active'))) return;
    remember(root);
    root.tabIndex = 0;
    if (!root.classList.contains('focusable')) root.classList.add('focusable');
    root.setAttribute('aria-label', 'Filmvorschau. Links und rechts wechseln, OK spielt ab.');
    // Leave the actual native click handlers intact. Their hidden controls
    // must not become extra stops for the remote or keyboard.
    root.querySelectorAll('.ss-chrome,.arrow,.dots-container [tabindex]').forEach(e => {
      remember(e); e.tabIndex = -1;
    });
    if (!initialFocusDone && !userInteracted && !document.querySelector('[role="dialog"],.jellyseerr-season-modal')) {
      initialFocusDone = true;
      root.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }
  function onInput(event) {
    if (event.isTrusted) userInteracted = true;
  }
  function onKey(event) {
    onInput(event);
    if (!tv() || !home() || event.altKey || event.ctrlKey || event.metaKey) return;
    const root = document.getElementById('slides-container');
    if (!root || !root.contains(document.activeElement)) return;
    if (document.activeElement.matches('input,textarea,select,[contenteditable="true"]')) return;
    const selector = { ArrowLeft: '.left-arrow', ArrowRight: '.right-arrow' }[event.key];
    if (!selector) return;
    const nativeArrow = root.querySelector(selector);
    if (!nativeArrow) return;
    event.preventDefault(); event.stopImmediatePropagation();
    root.focus({ preventScroll: true });
    nativeArrow.click();
    // Enter is deliberately left to MediaBar's own container key handler.
  }
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; refresh(); });
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('pointerdown', onInput, true);
  window.addEventListener('hashchange', refresh);
  refresh();
  window.netflixTvSlideshow = {
    remove() {
      observer.disconnect();
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onInput, true);
      window.removeEventListener('hashchange', refresh);
      for (const [e, old] of previousAttributes) {
        if (old.tabindex === null) e.removeAttribute('tabindex'); else e.setAttribute('tabindex', old.tabindex);
        if (old.label === null) e.removeAttribute('aria-label'); else e.setAttribute('aria-label', old.label);
        if (!old.focusable) e.classList.remove('focusable');
      }
      delete window.netflixTvSlideshow;
    }
  };
})();
