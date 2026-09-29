/* ==========================================================================
   UI primitives: toasts, bottom sheets, confirm dialogs, skeletons, states.
   ========================================================================== */

import { html, render, $, el, trapFocus } from './dom.js';
import { icon } from './icons.js';
import { t } from './i18n.js';

/* -------------------------------------------------------------------- toast */

let toastHost = null;

function host() {
  if (!toastHost) {
    toastHost = $('#toasts') || el('div', { id: 'toasts' });
    if (!toastHost.isConnected) document.body.append(toastHost);
  }
  return toastHost;
}

export function toast(message, { icon: ic = 'check', duration = 2600 } = {}) {
  const node = el('div', { class: 'toast', role: 'status' });
  render(node, html`${icon(ic, 17)}<span>${message}</span>`);
  host().append(node);
  const close = () => {
    node.classList.add('toast--out');
    node.addEventListener('animationend', () => node.remove(), { once: true });
    setTimeout(() => node.remove(), 400);
  };
  setTimeout(close, duration);
  return close;
}

/* -------------------------------------------------------------------- sheet */

let openSheet = null;

/**
 * Open a bottom sheet (dialog on desktop).
 * @returns {{ close: Function, body: HTMLElement, root: HTMLElement }}
 */
export function sheet({ title, body, foot, labelledBy, onClose, wide = false } = {}) {
  closeSheet();

  const scrim = el('div', { class: 'sheet-scrim' });
  const panel = el('div', {
    class: 'sheet',
    role: 'dialog',
    'aria-modal': 'true',
    ...(title ? { 'aria-label': title } : labelledBy ? { 'aria-labelledby': labelledBy } : {}),
  });
  if (wide) panel.style.maxWidth = '44rem';

  const grip = el('div', { class: 'sheet__grip' });
  const head = el('div', { class: 'sheet__head' });
  const bodyEl = el('div', { class: 'sheet__body' });

  const closeBtn = el('button', { class: 'iconbtn', type: 'button', 'aria-label': t('close') });
  render(closeBtn, icon('x', 20));
  closeBtn.addEventListener('click', () => close());

  if (title) {
    head.append(el('h2', { class: 'sheet__title' }, title), closeBtn);
    panel.append(grip, head);
  } else {
    head.style.paddingBottom = '0';
    head.append(el('span'), closeBtn);
    panel.append(grip, head);
  }

  if (body != null) render(bodyEl, body);
  panel.append(bodyEl);

  if (foot != null) {
    const footEl = el('div', { class: 'sheet__foot' });
    render(footEl, foot);
    panel.append(footEl);
  }

  scrim.append(panel);
  document.body.append(scrim);
  document.body.style.overflow = 'hidden';

  const untrap = trapFocus(panel);
  const previous = document.activeElement;
  requestAnimationFrame(() => {
    const target = panel.querySelector('[autofocus], input, button:not(.iconbtn)') || closeBtn;
    target?.focus({ preventScroll: true });
  });

  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
  document.addEventListener('keydown', onKey, true);

  scrim.addEventListener('pointerdown', (e) => { if (e.target === scrim) close(); });

  // Drag-to-dismiss on touch devices.
  let startY = 0, dragging = false;
  panel.addEventListener('touchstart', (e) => {
    if (bodyEl.scrollTop > 0) return;
    startY = e.touches[0].clientY;
    dragging = true;
  }, { passive: true });
  panel.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) panel.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  panel.addEventListener('touchend', (e) => {
    if (!dragging) return;
    dragging = false;
    const dy = (e.changedTouches[0]?.clientY || startY) - startY;
    panel.style.transform = '';
    if (dy > 110) close();
  });

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    openSheet = null;
    untrap();
    document.removeEventListener('keydown', onKey, true);
    document.body.style.overflow = '';
    panel.classList.add('sheet--out');
    scrim.style.animation = 'fade var(--d-base) var(--e-out) reverse both';
    const done = () => { scrim.remove(); onClose?.(); };
    panel.addEventListener('animationend', done, { once: true });
    setTimeout(done, 420);
    if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
  }

  openSheet = { close };
  return { close, body: bodyEl, root: panel };
}

export function closeSheet() {
  openSheet?.close();
  openSheet = null;
}

export const isSheetOpen = () => Boolean(openSheet);

/* ------------------------------------------------------------------ confirm */

export function confirmDialog({ title, text, confirmLabel, danger = false }) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v); } };

    const { close, body } = sheet({
      title,
      onClose: () => done(false),
    });

    render(body, html`
      <p class="muted" style="margin-bottom:var(--s5)">${text}</p>
      <div class="stack stack-2">
        <button type="button" class="btn ${danger ? 'btn--danger' : 'btn--primary'} btn--block" data-act="ok">
          ${confirmLabel || t('confirm')}
        </button>
        <button type="button" class="btn btn--ghost btn--block" data-act="cancel">${t('cancel')}</button>
      </div>
    `);

    body.querySelector('[data-act="ok"]').addEventListener('click', () => { done(true); close(); });
    body.querySelector('[data-act="cancel"]').addEventListener('click', () => { done(false); close(); });
  });
}

/* ------------------------------------------------------------------- states */

export function emptyState({ icon: ic = 'search', title, text, action }) {
  return html`
    <div class="state fade-in">
      <div class="state__icon">${icon(ic, 28)}</div>
      <p class="state__title">${title}</p>
      ${text ? html`<p class="state__text">${text}</p>` : ''}
      ${action ? html`<div class="state__action">${action}</div>` : ''}
    </div>
  `;
}

export function errorState({ title, text, retryLabel, onRetry }) {
  const id = 'retry-' + Math.random().toString(36).slice(2, 8);
  queueMicrotask(() => {
    document.getElementById(id)?.addEventListener('click', () => onRetry?.());
  });
  return html`
    <div class="state fade-in">
      <div class="state__icon">${icon('slash', 28)}</div>
      <p class="state__title">${title || t('err_load')}</p>
      <p class="state__text">${text || t('err_load_text')}</p>
      ${onRetry ? html`
        <div class="state__action">
          <button type="button" id="${id}" class="btn btn--outline">
            ${icon('refresh', 17)} ${retryLabel || t('retry')}
          </button>
        </div>` : ''}
    </div>
  `;
}

export function skeletonList(rows = 6) {
  const items = Array.from({ length: rows }, () => html`
    <div class="row" style="padding:var(--s3) var(--s4);gap:var(--s4)">
      <div class="skel" style="width:40px;height:40px;border-radius:12px"></div>
      <div class="flex-1 stack stack-2">
        <div class="skel skel--line" style="width:52%"></div>
        <div class="skel skel--line" style="width:32%;height:11px"></div>
      </div>
    </div>
  `);
  return html`<div class="list" aria-hidden="true">${items}</div>`;
}

export function skeletonReader() {
  const blocks = Array.from({ length: 4 }, () => html`
    <div class="stack stack-3" style="padding:var(--s6) var(--s3)">
      <div class="skel skel--line" style="width:100%;height:26px"></div>
      <div class="skel skel--line" style="width:82%;height:26px"></div>
      <div class="skel skel--line" style="width:64%;margin-top:var(--s3)"></div>
    </div>
  `);
  return html`<div aria-hidden="true" aria-busy="true">
    <div class="skel" style="height:150px;border-radius:var(--r-xl);margin-bottom:var(--s5)"></div>
    ${blocks}
  </div>`;
}

/** Small inline spinner. */
export function spinner(size = 18) {
  return html`<span class="spin" style="display:inline-flex;animation:spinRot 1s linear infinite">${icon('loader', size)}</span>`;
}

const style = document.createElement('style');
style.textContent = '@keyframes spinRot{to{transform:rotate(360deg)}}';
document.head.append(style);

/* ---------------------------------------------------------------- clipboard */

export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through to the legacy path */ }
  try {
    const ta = el('textarea', { style: 'position:fixed;opacity:0;pointer-events:none' });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch { return false; }
}

/* -------------------------------------------------------------------- haptic */

export function tapFeedback() {
  try { navigator.vibrate?.(8); } catch { /* not supported */ }
}
