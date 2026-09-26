/* ==========================================================================
   DOM helpers + an XSS-safe tagged-template renderer.
   Interpolated values are escaped unless wrapped in raw()/html``.
   ========================================================================== */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
}

class Raw {
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}

/** Mark a string as pre-escaped HTML. */
export const raw = (s) => new Raw(String(s ?? ''));

function flatten(v) {
  if (v == null || v === false) return '';
  if (v instanceof Raw) return v.value;
  if (Array.isArray(v)) return v.map(flatten).join('');
  return esc(v);
}

/** Tagged template that escapes interpolations. */
export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += flatten(values[i]) + strings[i + 1];
  return new Raw(out);
}

/** Render html`` (or a string) into an element. */
export function render(el, content) {
  if (!el) return el;
  el.innerHTML = content instanceof Raw ? content.value : esc(content);
  return el;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v instanceof Raw ? v.value : esc(v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/**
 * Delegated listener: on(root, 'click', '.sel', handler).
 * Returns an unsubscribe function so views can clean up after themselves.
 */
export function on(root, type, selector, handler, opts) {
  const wrapped = (e) => {
    const t = e.target instanceof Element ? e.target.closest(selector) : null;
    if (t && root.contains(t)) handler(e, t);
  };
  root.addEventListener(type, wrapped, opts);
  return () => root.removeEventListener(type, wrapped, opts);
}

export function debounce(fn, ms = 200) {
  let t;
  const wrapped = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  wrapped.cancel = () => clearTimeout(t);
  return wrapped;
}

export function throttle(fn, ms = 100) {
  let last = 0, timer;
  return (...a) => {
    const now = Date.now();
    const wait = ms - (now - last);
    if (wait <= 0) { last = now; fn(...a); }
    else { clearTimeout(timer); timer = setTimeout(() => { last = Date.now(); fn(...a); }, wait); }
  };
}

/** Highlight every occurrence of `needle` inside `text`, returning safe HTML. */
export function highlight(text, needle) {
  if (!needle) return esc(text);
  const src = String(text);
  const hay = fold(src);
  const pin = fold(needle);
  if (!pin) return esc(src);
  let out = '', from = 0, idx;
  while ((idx = hay.indexOf(pin, from)) !== -1) {
    out += esc(src.slice(from, idx)) + '<mark>' + esc(src.slice(idx, idx + pin.length)) + '</mark>';
    from = idx + pin.length;
    if (pin.length === 0) break;
  }
  return out + esc(src.slice(from));
}

/** Diacritic-insensitive, case-insensitive folding (Albanian ë/ç included). */
export function fold(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '');
}

const AR_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣣ࣡-ࣿـ]/g;
/** Normalise Arabic for search: drop harakat, unify alif/ya/ta-marbuta. */
export function foldAr(s) {
  return String(s ?? '')
    .replace(AR_MARKS, '')
    .replace(/[ٱآأإ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

export const hasArabic = (s) => /[؀-ۿ]/.test(s);

export function scrollToEl(target, offset = 90) {
  if (!target) return;
  const y = target.getBoundingClientRect().top + window.scrollY - offset;
  const reduce = document.documentElement.dataset.motion === 'reduced'
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
}

/** Trap Tab focus inside a container; returns a cleanup function. */
export function trapFocus(container) {
  const SEL = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  const handler = (e) => {
    if (e.key !== 'Tab') return;
    const items = $$(SEL, container).filter((n) => n.offsetParent !== null || n === document.activeElement);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', handler);
  return () => container.removeEventListener('keydown', handler);
}
