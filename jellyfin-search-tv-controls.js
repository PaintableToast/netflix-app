(() => {
  window.jellyfinSearchTvControls?.remove();
  let lastKey;
  const visible = e => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && !e.disabled && getComputedStyle(e).visibility !== 'hidden';
  };
  const keys = () => [...document.querySelectorAll('.searchFields .alphaPickerButton')].filter(visible);
  const results = () => [...document.querySelectorAll('button.card.itemAction, .jellyseerr-poster-image.focusable')].filter(visible);
  const centerY = e => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; };
  function handle(e) {
    if (!document.documentElement.classList.contains('layout-tv') || !location.hash.startsWith('#/search') || document.querySelector('.jellyseerr-modal-is-open, .jellyseerr-season-modal')) return;
    const active = document.activeElement;
    const keyboard = keys();
    let target;
    if (e.key === 'ArrowRight' && keyboard.includes(active)) {
      const r = active.getBoundingClientRect();
      const rightNeighbor = keyboard.some(k => k !== active && k.getBoundingClientRect().left >= r.right - 2 && Math.abs(centerY(k) - centerY(active)) < r.height / 2);
      if (rightNeighbor) return;
      const cards = results();
      target = cards.sort((a,b) => Math.abs(centerY(a)-centerY(active)) - Math.abs(centerY(b)-centerY(active)))[0];
      if (target) lastKey = active;
    } else if (e.key === 'ArrowLeft') {
      const cards = results();
      const card = active?.closest('button.card.itemAction, .jellyseerr-poster-image.focusable');
      if (!card || !cards.includes(card)) return;
      const r = card.getBoundingClientRect();
      if (cards.some(k => k !== card && k.getBoundingClientRect().right <= r.left + 2 && Math.abs(centerY(k)-centerY(card)) < r.height / 2)) return;
      target = keyboard.includes(lastKey) ? lastKey : keyboard.sort((a,b) => Math.abs(centerY(a)-centerY(card))-Math.abs(centerY(b)-centerY(card)))[0];
    }
    if (!target) return;
    e.preventDefault(); e.stopImmediatePropagation();
    target.focus({preventScroll:true});
    target.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  window.addEventListener('keydown', handle, true);
  window.jellyfinSearchTvControls = { remove() { window.removeEventListener('keydown',handle,true); delete window.jellyfinSearchTvControls; } };
  console.info('Suchnavigation aktiv');
})();
