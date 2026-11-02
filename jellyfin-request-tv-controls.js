/* Client-side fix for Jellyfin Enhanced request dialogs.
 * Load through the web client's script integration. Never submits a request
 * automatically: OK on a checkbox only toggles that checkbox. */
(() => {
  'use strict';
  if (window.jellyfinRequestTvControls) return;
  const visible = el => !el.disabled && el.getAttribute('tabindex') !== '-1'
    && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  const controls = root => Array.from(root.querySelectorAll(
    'button,input,select,textarea,a[href],[tabindex]'
  )).filter(visible);
  function handle(event) {
    if (!document.documentElement.classList.contains('layout-tv')) return;
    const modal = Array.from(document.querySelectorAll('.jellyseerr-season-modal')).reverse().find(visible);
    if (!modal) return;
    const list = controls(modal);
    if (!list.length) return;
    const active = document.activeElement;
    const ok = event.key === 'Enter' || event.key === 'Accept' || event.keyCode === 13;
    if (ok && modal.contains(active) && active.matches('input[type="checkbox"]:not(:disabled)')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!event.repeat) active.click();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      const index = list.indexOf(active);
      list[(index + (event.shiftKey ? -1 : 1) + list.length) % list.length].focus();
      return;
    }
    const direction = { ArrowUp:-1, ArrowDown:1 }[event.key];
    if (!direction) return;
    // Let the extension's TV profile picker and native selects handle their
    // own up/down navigation; only season checkboxes use this ordered list.
    if (modal.querySelector('.jellyseerr-tv-picker') || active?.matches('select,textarea')) return;
    const checkboxes = list.filter(el => el.matches('.jellyseerr-season-checkbox'));
    if (!checkboxes.length) return;
    const index = checkboxes.indexOf(active);
    let next;
    if (index >= 0) {
      next = checkboxes[index + direction];
      if (!next && direction > 0) next = list.find(el => el.matches('.jellyseerr-modal-footer button'));
      // At the top edge, keep focus inside the request dialog.
      if (!next) next = active;
    } else if (!modal.contains(active) || direction < 0 && active.closest('.jellyseerr-modal-footer')) {
      next = direction < 0 ? checkboxes[checkboxes.length - 1] : checkboxes[0];
    }
    if (!next) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    next.focus();
    next.scrollIntoView({ block:'nearest', inline:'nearest' });
  }
  document.addEventListener('keydown', handle, true);
  window.jellyfinRequestTvControls = {
    remove() {
      document.removeEventListener('keydown', handle, true);
      delete window.jellyfinRequestTvControls;
    }
  };
})();
