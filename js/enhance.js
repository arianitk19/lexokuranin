/* ===== Kurani · Premium UX enhancement layer ===== */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ripple micro-interaction on every .tap ---------- */
  document.addEventListener('pointerdown', e => {
    const target = e.target.closest('.tap, .navbtn, button');
    if (!target || reduce) return;
    const r = target.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = size + 'px';
    span.style.left = (e.clientX - r.left - size / 2) + 'px';
    span.style.top = (e.clientY - r.top - size / 2) + 'px';
    // keep button overflow clipping; ensure positioned
    const cs = getComputedStyle(target);
    if (cs.position === 'static') target.style.position = 'relative';
    target.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  }, { passive: true });

  /* ---------- Favorite / memorize pop feedback ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act="save"],[data-act="mem"]');
    if (!b || reduce) return;
    const svg = b.querySelector('svg');
    if (svg) { svg.classList.remove('pulse-fav'); void svg.offsetWidth; svg.classList.add('pulse-fav'); }
  });

  /* ---------- Scroll reveal (staggered) + page swap ---------- */
  const io = 'IntersectionObserver' in window && !reduce
    ? new IntersectionObserver((entries, obs) => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
      }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' })
    : null;

  function decorate(view) {
    // premium accents on primary CTA buttons
    view.querySelectorAll('button').forEach(b => {
      if (b.className.includes('bg-accent') || b.className.includes('bg-white')) b.classList.add('btn-glow');
    });
    // gold ring on hero/gradient sections
    view.querySelectorAll('section[style*="linear-gradient"]').forEach(s => s.classList.add('ring-gold'));

    if (!io) return;
    // collect reveal candidates: cards, list items, sections, grid tiles
    const cands = view.querySelectorAll('section, article, .shadow-card, .grid > button, .space-y-3 > *, .space-y-2\\.5 > *');
    let i = 0;
    cands.forEach(elm => {
      if (elm.dataset._rev) return;
      elm.dataset._rev = '1';
      elm.classList.add('reveal');
      elm.style.transitionDelay = Math.min(i * 45, 360) + 'ms';
      i++;
      io.observe(elm);
    });
  }

  const view = document.getElementById('view');
  if (view) {
    const mo = new MutationObserver(muts => {
      const replaced = muts.some(m => m.addedNodes.length);
      if (!replaced) return;
      if (!reduce) { view.classList.remove('swap'); void view.offsetWidth; view.classList.add('swap'); }
      decorate(view);
    });
    mo.observe(view, { childList: true });
    // first paint
    requestAnimationFrame(() => decorate(view));
  }

  /* ---------- Subtle hero parallax on scroll ---------- */
  let ticking = false;
  if (!reduce) addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      const hero = document.querySelector('#view section[style*="linear-gradient"]');
      if (hero) {
        const inner = hero.querySelector('svg');
        if (inner) inner.style.transform = `translateY(${y * 0.08}px)`;
        hero.style.backgroundPositionY = (y * 0.12) + 'px';
      }
      const amb = document.getElementById('ambient');
      if (amb) amb.style.transform = `translateY(${y * -0.03}px)`;
      ticking = false;
    });
  }, { passive: true });

  /* ---------- Active-state spring on press (touch feedback) ---------- */
  document.addEventListener('pointerdown', e => {
    const t = e.target.closest('.tap'); if (!t) return;
    t.style.transition = 'transform .12s ease'; t.style.transform = 'scale(.96)';
    const up = () => { t.style.transform = ''; removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
    addEventListener('pointerup', up, { passive: true });
    addEventListener('pointercancel', up, { passive: true });
  }, { passive: true });
})();
