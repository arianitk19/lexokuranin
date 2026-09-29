/* ==========================================================================
   Search — references, surah names and full text across three languages.
   ========================================================================== */

import { html, raw, render, $, $$, on, debounce, highlight, esc, foldAr } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { t, num } from '../core/i18n.js';
import {
  search, hydrate, surahInfo, reference, searchIndexReady, loadSearchIndex, DataError,
} from '../core/quran.js';
import { recentSearch } from '../core/store.js';
import { emptyState, errorState, spinner, toast } from '../core/ui.js';
import { surahRow } from './partials.js';
import { openAyahSheet } from '../core/ayah-sheet.js';
import { navigate, linkSurah } from '../core/router.js';

let query = '';
let cursor = -1;
let currentHits = [];
let token = 0;

export async function render_(mount, ctx) {
  query = ctx?.query?.q || '';
  cursor = -1;

  render(mount, html`
    <div class="view stack stack-5">
      <header><h1>${t('search')}</h1></header>

      <form id="searchForm" role="search" autocomplete="off">
        <label class="field">
          <span class="sr-only">${t('search_placeholder')}</span>
          ${icon('search', 19)}
          <input type="search" id="q" name="q" value="${query}"
                 placeholder="${t('search_placeholder')}"
                 enterkeyhint="search" autocomplete="off" spellcheck="false"
                 aria-describedby="searchHint" aria-controls="searchResults">
          <button type="button" class="iconbtn iconbtn--sm" id="qClear" ${query ? '' : 'hidden'} aria-label="${t('clear')}">
            ${icon('x', 16)}
          </button>
        </label>
        <p class="t-xs dim" id="searchHint" style="margin-top:var(--s2);padding-inline:var(--s4)">${t('search_hint')}</p>
      </form>

      <div id="searchResults" aria-live="polite"></div>
    </div>
  `);

  const input = $('#q', mount);
  const clear = $('#qClear', mount);

  $('#searchForm', mount).addEventListener('submit', (e) => { e.preventDefault(); run(input.value, true); });

  const onInput = debounce(() => {
    clear.hidden = !input.value;
    run(input.value, false);
  }, 260);
  input.addEventListener('input', onInput);

  clear.addEventListener('click', () => {
    input.value = ''; query = ''; clear.hidden = true;
    run('', false);
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    if (!currentHits.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      cursor = Math.max(0, Math.min(currentHits.length - 1, cursor + (e.key === 'ArrowDown' ? 1 : -1)));
      paintCursor();
    } else if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault();
      const h = currentHits[cursor];
      const info = surahInfo(h.s);
      navigate(linkSurah(info.slug, h.a));
    }
  });

  on(mount, 'click', '.hit', (e, node) => {
    const s = Number(node.dataset.s);
    const a = Number(node.dataset.a);
    if (e.target.closest('[data-open]')) {
      const info = surahInfo(s);
      navigate(linkSurah(info.slug, a));
      return;
    }
    openAyahSheet({ s, a });
  });

  on(mount, 'click', '[data-recent]', (_e, node) => {
    input.value = node.dataset.recent;
    clear.hidden = false;
    run(node.dataset.recent, true);
  });

  $('#searchResults', mount).addEventListener('click', (e) => {
    if (e.target.closest('#clearRecent')) {
      recentSearch.clear();
      run(input.value, false);
    }
  });

  if (query) run(query, true);
  else { paintIdle(); if (!('ontouchstart' in window)) input.focus(); }

  // Warm the index quietly once the view is idle, so the first search is instant.
  if (!searchIndexReady()) {
    const warm = () => loadSearchIndex().catch(() => {});
    'requestIdleCallback' in window ? requestIdleCallback(warm, { timeout: 4000 }) : setTimeout(warm, 1500);
  }
}

/* --------------------------------------------------------------------- run */

async function run(value, commit) {
  const box = $('#searchResults');
  if (!box) return;
  query = String(value || '').trim();
  cursor = -1;
  currentHits = [];
  const mine = ++token;

  if (!query) { paintIdle(); return; }

  if (!searchIndexReady()) {
    render(box, html`
      <div class="state">
        <div class="state__icon">${spinner(26)}</div>
        <p class="state__title">${t('search_preparing')}</p>
        <p class="state__text">${t('search_preparing_note')}</p>
      </div>
    `);
  }

  let res;
  try {
    res = await search(query);
  } catch (err) {
    if (mine !== token) return;
    const offline = err instanceof DataError && err.kind === 'offline';
    render(box, errorState({
      title: offline ? t('offline') : t('err_load'),
      text: offline ? t('err_offline_data_text') : t('err_load_text'),
      onRetry: () => run(query, commit),
    }));
    return;
  }
  if (mine !== token) return;

  if (res.kind === 'ref') {
    const { s, a } = res.items[0];
    const info = surahInfo(s);
    recentSearch.add(query);
    navigate(linkSurah(info.slug, a));
    return;
  }

  if (res.kind === 'surah') {
    const s = res.items[0];
    navigate(linkSurah(s.slug));
    return;
  }

  if (commit) recentSearch.add(query);

  const hits = res.items;
  currentHits = hits;

  const nameBlock = res.surahs?.length ? html`
    <section style="margin-bottom:var(--s5)">
      <div class="sec"><h2 class="sec__title">${t('surahs')}</h2></div>
      <div class="list">${res.surahs.map((s) => surahRow(s, { showArabic: false }))}</div>
    </section>` : html``;

  if (!hits.length) {
    render(box, html`
      ${nameBlock}
      ${res.surahs?.length ? '' : emptyState({
        icon: 'search', title: t('no_results'), text: t('no_results_text'),
      })}
    `);
    return;
  }

  const rows = await hydrate(hits);
  if (mine !== token) return;

  const arabic = res.arabic;
  const needle = arabic ? foldAr(query) : query;

  render(box, html`
    ${nameBlock}
    <div class="sec">
      <h2 class="sec__title">${num(hits.length)}${hits.length >= 60 ? '+' : ''} ${hits.length === 1 ? t('result') : t('results')}</h2>
    </div>
    <div class="list">
      ${rows.map((r, i) => html`
        <article class="hit" data-s="${r.s}" data-a="${r.a}" data-i="${i}" tabindex="0" role="button">
          <div class="row-between">
            <span class="hit__ref">${reference(r.s, r.a)}</span>
            <button type="button" class="iconbtn iconbtn--sm" data-open aria-label="${t('open_in_quran')}">
              ${icon('arrowUpRight', 16)}
            </button>
          </div>
          <p class="hit__ar">${arabic ? html`${markArabic(r.ar, needle)}` : r.ar}</p>
          <p class="hit__tr">${arabic ? r.sq : html`${mark(r.lang === 'en' ? r.en : r.sq, needle)}`}</p>
        </article>`)}
    </div>
  `);
}

const mark = (text, needle) => raw(highlight(text, needle));

/**
 * Arabic highlighting works word by word against the folded form, so the mark
 * lands on the real letters — diacritics and all — not on a stripped copy.
 */
function markArabic(text, needle) {
  const words = String(text).split(' ');
  const parts = words.map((w) => {
    const f = foldAr(w);
    const hit = f && (f.includes(needle) || needle.includes(f));
    return hit ? `<mark>${esc(w)}</mark>` : esc(w);
  });
  return raw(parts.join(' '));
}

function paintCursor() {
  $$('.hit').forEach((n) => n.classList.toggle('is-cursor', Number(n.dataset.i) === cursor));
  $$('.hit')[cursor]?.scrollIntoView({ block: 'nearest' });
}

/* -------------------------------------------------------------------- idle */

function paintIdle() {
  const box = $('#searchResults');
  if (!box) return;
  const recents = recentSearch.all();

  render(box, html`
    ${recents.length ? html`
      <section>
        <div class="sec">
          <h2 class="sec__title">${t('recent_searches')}</h2>
          <button type="button" class="sec__action" id="clearRecent">${t('clear')}</button>
        </div>
        <div class="row wrap" style="gap:var(--s2)">
          ${recents.map((r) => html`<button type="button" class="chip" data-recent="${r}">${icon('clock', 14)} ${r}</button>`)}
        </div>
      </section>` : emptyState({
        icon: 'search',
        title: t('search_placeholder'),
        text: t('search_hint'),
      })}
  `);
}

export default { render: render_ };
