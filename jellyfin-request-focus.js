/* Keep remote navigation inside Jellyfin Enhanced request dialogs. */
(() => {
  window.jellyfinRequestFocus?.remove();
  const visible = e => !e.disabled && e.getAttribute('tabindex') !== '-1' && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
  const modal = () => [...document.querySelectorAll('.jellyseerr-season-modal')].filter(visible).pop();
  const controls = m => [...m.querySelectorAll('button,input,select,a[href],[tabindex]')].filter(visible);
  let previous, current;
  function focus(e) { e?.focus({preventScroll:true}); e?.scrollIntoView({block:'nearest'}); }
  function sync() {
    const m=modal();
    if(m===current) return;
    if(m) { previous=document.activeElement; current=m; focus(controls(m)[0]); }
    else { current=null; if(previous?.isConnected) focus(previous); previous=null; }
  }
  function keep(event) {
    const m=modal();
    if(m && !m.contains(event.target)) focus(controls(m)[0]);
  }
  function key(e) {
    if(!document.documentElement.classList.contains('layout-tv')) return;
    const m=modal(); if(!m) return;
    const list=controls(m); if(!list.length) return;
    const active=document.activeElement;
    if(m.querySelector('.jellyseerr-tv-picker')) return;
    if(!m.contains(active)) {
      if(/^Arrow/.test(e.key)||e.key==='Enter'||e.key==='Tab') {e.preventDefault();e.stopImmediatePropagation();focus(list[0]);} return;
    }
    if(e.key==='Enter' && active.matches('input[type="checkbox"]') && active.dataset.embycheckbox!=='true') {
      e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)active.click();return;
    }
    // Native selects retain their own option navigation once opened.
    if(active.matches('select') && e.key!=='Tab') {
      if(e.key==='ArrowDown' || e.key==='ArrowUp') {
        e.preventDefault(); e.stopImmediatePropagation();
        const index=list.indexOf(active);focus(list[Math.max(0,Math.min(list.length-1,index+(e.key==='ArrowDown'?1:-1)))]);
      } return;
    }
    const delta={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key];
    if(delta || e.key==='Tab') {
      e.preventDefault();e.stopImmediatePropagation();
      const step=delta||(e.shiftKey?-1:1), index=list.indexOf(active);
      focus(list[(index+step+list.length)%list.length]);
    }
  }
  const observer=new MutationObserver(sync);
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('keydown',key,true);
  document.addEventListener('focusin',keep,true);
  sync();
  window.jellyfinRequestFocus={remove(){observer.disconnect();window.removeEventListener('keydown',key,true);document.removeEventListener('focusin',keep,true);delete window.jellyfinRequestFocus;}};
})();
