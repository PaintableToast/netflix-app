/* Adapt existing Jellyfin Enhanced inputs to Jellyfin's registered checkbox
 * component. No replacement inputs: the extension retains its references,
 * checked/disabled states and change listeners. Requires Jellyfin Web's
 * legacy emby-checkbox component to have been loaded. */
(() => {
  'use strict';
  if (window.jellyfinNativeSeasonCheckboxes) return;
  let component;
  try { component = document.createElement('input', 'emby-checkbox'); }
  catch (_) { component = document.createElement('input', { is: 'emby-checkbox' }); }
  const attach = component.attachedCallback;
  const detach = component.detachedCallback;
  if (typeof attach !== 'function') {
    console.warn('Native season checkboxes: emby-checkbox is unavailable; no inputs changed.');
    return;
  }
  // Avoid toggling twice if the earlier experimental key handler is active.
  window.jellyfinRequestTvControls?.remove();
  const adapted = new Map();
  const style = document.createElement('style');
  style.textContent = `
    html.layout-tv body .jellyseerr-native-checkbox-label {
      display: inline-flex !important; position: relative !important;
      align-items: center !important; margin: 0 !important; padding: 0 !important;
      width: 1.35em !important; height: 1.35em !important;
    }
    html.layout-tv body .jellyseerr-native-checkbox-label > .checkboxOutline,
    html.layout-tv body .jellyseerr-native-checkbox-label > .checkboxLabel {
      display: none !important;
    }
    html.layout-tv body .jellyseerr-native-checkbox-label > input.jellyseerr-season-checkbox {
      position: relative !important; opacity: 1 !important; z-index: auto !important;
      margin: 0 !important; clip: auto !important; clip-path: none !important;
    }`;
  document.head.append(style);
  function upgrade() {
    if (!document.documentElement.classList.contains('layout-tv')) return;
    document.querySelectorAll('.jellyseerr-season-modal input.jellyseerr-season-checkbox').forEach(input => {
      if (adapted.has(input) || input.dataset.embycheckbox === 'true') return;
      const label = document.createElement('label');
      label.className = 'jellyseerr-native-checkbox-label';
      const text = document.createElement('span');
      text.setAttribute('aria-hidden', 'true');
      const oldClass = input.className;
      input.before(label);
      label.append(input, text);
      try {
        attach.call(input);
        adapted.set(input, { label, oldClass });
      } catch (error) {
        detach?.call(input);
        input.removeAttribute('data-embycheckbox');
        input.className = oldClass;
        label.replaceWith(input);
        console.warn('Native season checkbox could not be attached', error);
      }
    });
    // Release references to dialogs that have been closed.
    for (const [input] of adapted) {
      if (!input.isConnected) { detach?.call(input); adapted.delete(input); }
    }
  }
  const observer = new MutationObserver(upgrade);
  observer.observe(document.body, { childList: true, subtree: true });
  upgrade();
  window.jellyfinNativeSeasonCheckboxes = {
    get count() { return adapted.size; },
    remove() {
      observer.disconnect();
      for (const [input, { label, oldClass }] of adapted) {
        detach?.call(input);
        input.removeAttribute('data-embycheckbox');
        input.className = oldClass;
        if (label.isConnected) label.replaceWith(input);
      }
      adapted.clear(); style.remove();
      delete window.jellyfinNativeSeasonCheckboxes;
    }
  };
  console.info('Native Jellyfin season checkbox adapter active');
})();
