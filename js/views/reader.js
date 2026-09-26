/* ==========================================================================
   The reader — the most important surface in the product.
   Content is the protagonist; chrome retreats.
   ========================================================================== */

import { html, render, $, $$, on, scrollToEl, throttle } from '../core/dom.js';
import { icon, pattern } from '../core/icons.js';
import { t, num } from '../core/i18n.js';
import {
  loadSurah, surahInfo, resolveSurah, BASMALA, showsBasmala, DataError, globalNo,
} from '../core/quran.js';
import { bookmarks, notes, hifz, lastRead, stats } from '../core/store.js';
import { settings, set as setSetting, startReadingTimer, stopReadingTimer, setReadingFlush } from '../core/app.js';
import { skeletonReader, errorState, toast, sheet, tapFeedback } from '../core/ui.js';
import { ayahArticle } from './partials.js';
import { openAyahSheet } from '../core/ayah-sheet.js';
import * as player from '../core/audio.js';
import { navigate, linkSurah } from '../core/router.js';

let active = null;      // { info, data }
let cleanup = [];
let readAyahs = new Set();

setReadingFlush((sec) => stats.addSeconds(sec, 'read'));

/** Drop every listener this view attached, without touching reading stats. */
function detach() {
  cleanup.forEach((fn) => { try { fn(); } catch { /* noop */ } });
  cleanup = [];
}

function teardown() {
  detach();
  const sec = stopReadingTimer();
  if (sec > 3) stats.addSeconds(sec, 'read');
  if (readAyahs.size) { stats.addAyahs(readAyahs.size); readAyahs = new Set(); }
  document.body.classList.remove('is-reading');
  document.body.classList.remove('chrome-hidden');
  active = null;
}

export async function render_(mount, ctx) {
  teardown();

  const info = resolveSurah(ctx.params.slug);
  if (!info) {
    render(mount, errorState({ title: t('not_found'), text: t('not_found_text') }));
    return;
  }

  // Canonicalise numeric URLs to the slug form, keeping the ayah.
  if (String(ctx.params.slug) !== info.slug) {
    navigate(linkSurah(info.slug, ctx.params.ayah), { replace: true });
    return;
  }

  const targetAyah = ctx.params.ayah ? Math.min(info.count, Math.max(1, Number(ctx.params.ayah) || 1)) : null;

  render(mount, html`<div class="view reader">${skeletonReader()}</div>`);
  document.dispatchEvent(new CustomEvent('lk:title', { detail: info.sq }));

  let data;
  try {
    data = await loadSurah(info.n);
  } catch (err) {
    const offline = err instanceof DataError && err.kind === 'offline';
    render(mount, html`<div class="view">${errorState({
      title: offline ? t('err_offline_data') : t('err_load'),
      text: offline ? t('err_offline_data_text') : t('err_load_text'),
      onRetry: () => render_(mount, ctx),
    })}</div>`);
    return;
  }

  active = { info, data };
  paint(mount, info, data, targetAyah);
}

/* ------------------------------------------------------------------- paint */

function paint(mount, info, data, targetAyah) {
  const prev = info.n > 1 ? surahInfo(info.n - 1) : null;
  const next = info.n < 114 ? surahInfo(info.n + 1) : null;

  const ayahs = [];
  for (let i = 0; i < data.count; i++) {
    const a = i + 1;
    ayahs.push(ayahArticle(
      { s: info.n, a, ar: data.ar[i], sq: data.sq[i], en: data.en[i], tl: data.tl[i] },
      {
        showSq: settings.showSq,
        showEn: settings.showEn,
        showTranslit: settings.showTranslit,
        saved: bookmarks.has(info.n, a),
        memorised: hifz.isStrong(info.n, a),
        note: notes.get(info.n, a),
        playing: player.isCurrentAyah(info.n, a),
      }
    ));
  }

  render(mount, html`
    <div class="view reader">
      <header class="surahhead">
        <span class="surahhead__pattern">${pattern('readPat')}</span>
        <div style="position:relative">
          <p class="surahhead__ar">${info.ar}</p>
          <h1 class="surahhead__name">${info.sq}</h1>
          <p class="surahhead__meta">
            ${info.meaning} · ${num(info.count)} ${t('verses')} ·
            ${info.type === 'mekase' ? t('meccan') : t('medinan')}
          </p>
          <div class="surahhead__tools">
            <button type="button" class="btn btn--primary btn--sm" data-r="playSurah">
              ${icon('play', 16)} ${t('play_surah')}
            </button>
            <button type="button" class="btn btn--outline btn--sm" data-r="settings">
              ${icon('type', 16)} ${t('reader_settings')}
            </button>
            <button type="button" class="btn btn--outline btn--sm" data-r="focus" aria-pressed="${Boolean(settings.focusMode)}">
              ${icon(settings.focusMode ? 'minimize' : 'maximize', 16)} ${t('focus_mode')}
            </button>
          </div>
        </div>
      </header>

      ${showsBasmala(info.n) ? html`<p class="basmala">${BASMALA}</p>` : ''}

      <div id="ayahList">${ayahs}</div>

      <nav class="readernav" aria-label="${t('quran')}">
        ${prev ? html`<a class="btn btn--ghost" href="${linkSurah(prev.slug)}">
          ${icon('chevronLeft', 17)} <span class="truncate">${prev.sq}</span></a>` : html`<span class="flex-1"></span>`}
        ${next ? html`<a class="btn btn--ghost" href="${linkSurah(next.slug)}">
          <span class="truncate">${next.sq}</span> ${icon('chevronRight', 17)}</a>` : html`<span class="flex-1"></span>`}
      </nav>
    </div>
  `);

  wire(mount, info, data);

  // Position: explicit ayah > saved progress > top.
  const saved = lastRead.get();
  const jumpTo = targetAyah || (saved && saved.s === info.n ? saved.a : null);
  if (jumpTo) {
    requestAnimationFrame(() => {
      const el = document.getElementById('a' + jumpTo);
      if (el) {
        scrollToEl(el, 96);
        if (targetAyah) { el.classList.add('is-target'); setTimeout(() => el.classList.remove('is-target'), 2000); }
      }
    });
  }

  stats.readSurah(info.n);
  lastRead.set({ s: info.n, a: jumpTo || 1, ts: Date.now() });
  document.body.classList.add('is-reading');
  startReadingTimer();
}

/* -------------------------------------------------------------------- wire */

function wire(mount, info, data) {
  detach(); // paint() can run more than once per visit — never stack listeners

  // Ayah interactions
  cleanup.push(on(mount, 'click', '.ayah', (e, node) => {
    if (e.target.closest('a')) return;
    tapFeedback();
    const a = Number(node.dataset.ayah);
    openAyahSheet(
      { s: info.n, a, ar: data.ar[a - 1], sq: data.sq[a - 1], en: data.en[a - 1], tl: data.tl[a - 1] },
      { onChange: () => refreshAyah(a, info, data) }
    );
  }));

  cleanup.push(on(mount, 'keydown', '.ayah', (e, node) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); node.click(); }
  }));

  // Header tools
  $$('[data-r]', mount).forEach((b) => b.addEventListener('click', () => {
    switch (b.dataset.r) {
      case 'playSurah': player.playSurah(info.n, 1); break;
      case 'settings': openReaderSettings(() => rerender(mount, info, data)); break;
      case 'focus': {
        const on_ = !settings.focusMode;
        setSetting({ focusMode: on_ });
        toast(on_ ? t('focus_on') : t('focus_off'), { icon: on_ ? 'maximize' : 'minimize' });
        if (on_) toast(t('focus_hint'), { icon: 'info', duration: 4200 });
        rerender(mount, info, data);
        break;
      }
    }
  }));

  // Reading progress + which ayah we're on
  const bar = $('#readProgress');
  const list = $('#ayahList', mount);

  const onScroll = throttle(() => {
    if (!list) return;
    const top = list.offsetTop;
    const height = list.offsetHeight - window.innerHeight * 0.6;
    const p = Math.min(1, Math.max(0, (window.scrollY - top + window.innerHeight * 0.35) / Math.max(1, height)));
    if (bar) bar.style.transform = `scaleX(${p})`;

    const mid = window.scrollY + window.innerHeight * 0.4;
    const nodes = list.children;
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].offsetTop <= mid) {
        const a = Number(nodes[i].dataset.ayah);
        if (a) {
          readAyahs.add(a);
          const cur = lastRead.get();
          if (!cur || cur.s !== info.n || cur.a !== a) lastRead.set({ s: info.n, a, ts: Date.now() });
        }
        break;
      }
    }
  }, 220);

  window.addEventListener('scroll', onScroll, { passive: true });
  cleanup.push(() => window.removeEventListener('scroll', onScroll));
  onScroll();

  // Focus mode: tap the middle band to toggle the chrome.
  const tapToggle = (e) => {
    if (!settings.focusMode) return;
    if (e.target.closest('.ayah, button, a, input, .sheet-scrim, .player')) return;
    document.body.classList.toggle('chrome-hidden');
  };
  mount.addEventListener('click', tapToggle);
  cleanup.push(() => mount.removeEventListener('click', tapToggle));

  // Keyboard: j/k step between ayahs, space plays.
  const onKey = (e) => {
    if (e.target.matches('input, textarea') || e.metaKey || e.ctrlKey) return;
    if (e.key === 'j' || e.key === 'k') {
      const nodes = $$('.ayah', mount);
      const mid = window.scrollY + window.innerHeight * 0.4;
      let idx = nodes.findIndex((n) => n.offsetTop > mid);
      if (idx === -1) idx = nodes.length - 1;
      const target = e.key === 'j' ? nodes[Math.min(nodes.length - 1, idx)] : nodes[Math.max(0, idx - 2)];
      if (target) scrollToEl(target, 96);
    }
  };
  document.addEventListener('keydown', onKey);
  cleanup.push(() => document.removeEventListener('keydown', onKey));

  // Highlight whatever the player is on.
  const offChange = player.on('change', () => syncPlaying(mount, info));
  const offState = player.on('state', () => syncPlaying(mount, info));
  cleanup.push(offChange, offState);
  syncPlaying(mount, info);

  cleanup.push(() => { if (bar) bar.style.transform = 'scaleX(0)'; });
}

function syncPlaying(mount, info) {
  const cur = player.currentItem();
  $$('.ayah', mount).forEach((node) => {
    const isNow = Boolean(cur && cur.s === info.n && Number(node.dataset.ayah) === cur.a);
    node.classList.toggle('is-playing', isNow);
  });
  if (cur && cur.s === info.n && player.state.playing) {
    const node = document.getElementById('a' + cur.a);
    if (node) {
      const rect = node.getBoundingClientRect();
      if (rect.top < 60 || rect.bottom > window.innerHeight - 120) scrollToEl(node, 120);
    }
  }
}

function refreshAyah(a, info, data) {
  const node = document.getElementById('a' + a);
  if (!node) return;
  const wrapper = document.createElement('div');
  render(wrapper, ayahArticle(
    { s: info.n, a, ar: data.ar[a - 1], sq: data.sq[a - 1], en: data.en[a - 1], tl: data.tl[a - 1] },
    {
      showSq: settings.showSq,
      showEn: settings.showEn,
      showTranslit: settings.showTranslit,
      saved: bookmarks.has(info.n, a),
      memorised: hifz.isStrong(info.n, a),
      note: notes.get(info.n, a),
      playing: player.isCurrentAyah(info.n, a),
    }
  ));
  node.replaceWith(wrapper.firstElementChild);
}

function rerender(mount, info, data) {
  const y = window.scrollY;
  paint(mount, info, data, null);
  window.scrollTo({ top: y, behavior: 'auto' });
}

/* --------------------------------------------------------- reader settings */

export function openReaderSettings(onApply) {
  const ui = sheet({ title: t('reader_settings') });

  const FONTS = [
    ['amiri', 'font_amiri'],
    ['scheherazade', 'font_scheherazade'],
    ['naskh', 'font_naskh'],
  ];

  const paintSheet = () => {
    render(ui.body, html`
      <div class="stack stack-6">
        <div>
          <p class="ar center" style="font-size:var(--ar-size);line-height:var(--ar-lh);padding:var(--s4);
             background:var(--surface-2);border-radius:var(--r-md);direction:rtl">${BASMALA}</p>
        </div>

        <div class="stack stack-3">
          <div class="row-between">
            <label class="t-sm fw-600" for="fsRange">${t('font_size')}</label>
            <span class="t-sm dim nums">${settings.fontSize}px</span>
          </div>
          <input type="range" id="fsRange" min="20" max="56" step="1" value="${settings.fontSize}">
        </div>

        <div class="stack stack-3">
          <div class="row-between">
            <label class="t-sm fw-600" for="lhRange">${t('line_height')}</label>
            <span class="t-sm dim nums">${settings.lineHeight.toFixed(1)}</span>
          </div>
          <input type="range" id="lhRange" min="1.6" max="3.2" step="0.1" value="${settings.lineHeight}">
        </div>

        <div class="stack stack-3">
          <div class="row-between">
            <label class="t-sm fw-600" for="spRange">${t('ayah_spacing')}</label>
            <span class="t-sm dim nums">${settings.ayahSpacing}px</span>
          </div>
          <input type="range" id="spRange" min="12" max="56" step="2" value="${settings.ayahSpacing}">
        </div>

        <div class="stack stack-3">
          <p class="t-sm fw-600">${t('arabic_font')}</p>
          <div class="row wrap" style="gap:var(--s2)">
            ${FONTS.map(([key, label]) => html`
              <button type="button" class="chip ${settings.arFont === key ? 'is-active' : ''}" data-font="${key}">
                ${t(label)}
              </button>`)}
          </div>
        </div>

        <div class="stack stack-1">
          <p class="t-sm fw-600" style="margin-bottom:var(--s2)">${t('translations')}</p>
          <div class="list">
            ${[['showSq', 'show_sq'], ['showEn', 'show_en'], ['showTranslit', 'show_translit']].map(([key, label]) => html`
              <button type="button" class="rowitem" data-toggle="${key}" role="switch" aria-checked="${Boolean(settings[key])}">
                <span class="rowitem__label">${t(label)}</span>
                <span class="switch" aria-hidden="true" aria-checked="${Boolean(settings[key])}"></span>
              </button>`)}
          </div>
        </div>
      </div>
    `);

    const bind = (id, key, parse) => {
      const input = $('#' + id, ui.body);
      input?.addEventListener('input', () => {
        setSetting({ [key]: parse(input.value) });
        const out = input.closest('.stack').querySelector('.dim');
        if (out) out.textContent = key === 'lineHeight' ? Number(input.value).toFixed(1) : input.value + 'px';
      });
      input?.addEventListener('change', () => onApply?.());
    };
    bind('fsRange', 'fontSize', Number);
    bind('lhRange', 'lineHeight', Number);
    bind('spRange', 'ayahSpacing', Number);

    $$('[data-font]', ui.body).forEach((b) => b.addEventListener('click', () => {
      setSetting({ arFont: b.dataset.font });
      paintSheet();
      onApply?.();
    }));

    $$('[data-toggle]', ui.body).forEach((b) => b.addEventListener('click', () => {
      const key = b.dataset.toggle;
      setSetting({ [key]: !settings[key] });
      paintSheet();
      onApply?.();
    }));
  };

  paintSheet();
  return ui;
}

export default { render: render_, teardown };
