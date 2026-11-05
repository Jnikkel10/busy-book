/* Grown-up "back to home" button: press and hold for 1 second.
   A quick toddler tap does nothing; the ring fills while held. */
(() => {
  const css = `
  #bbHome{position:fixed;z-index:9999;right:calc(10px + env(safe-area-inset-right,0px));top:calc(10px + env(safe-area-inset-top,0px));
    width:52px;height:52px;border-radius:50%;border:0;padding:0;background:rgba(255,248,231,.55);
    display:grid;place-items:center;-webkit-tap-highlight-color:transparent;touch-action:none;
    -webkit-user-select:none;user-select:none;-webkit-touch-callout:none;opacity:.7}
  #bbHome svg{width:52px;height:52px;display:block;pointer-events:none}
  #bbHome .ring{fill:none;stroke:#4A2E3A;stroke-width:5;stroke-dasharray:145;stroke-dashoffset:145;
    transform:rotate(-90deg);transform-origin:50% 50%}
  #bbHome.hold{opacity:1}
  #bbHome.hold .ring{stroke-dashoffset:0;transition:stroke-dashoffset 1s linear}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const b = document.createElement('button');
  b.id = 'bbHome'; b.setAttribute('aria-label', 'Home (press and hold)');
  b.innerHTML = '<svg viewBox="0 0 52 52"><circle class="ring" cx="26" cy="26" r="23"/>' +
    '<path d="M15 26 L26 16 L37 26 M19 23 V36 H33 V23" fill="none" stroke="#4A2E3A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(b);
  let t;
  const start = e => { e.preventDefault(); e.stopPropagation(); b.classList.add('hold'); t = setTimeout(() => { location.href = '../index.html'; }, 1000); };
  const stop = () => { clearTimeout(t); b.classList.remove('hold'); };
  b.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, stop));
  b.addEventListener('contextmenu', e => e.preventDefault());
})();
