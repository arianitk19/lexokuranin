/* ==========================================================================
   Saved — bookmarks by category, plus every personal note.
   ========================================================================== */

import { html, render, $, $$, on, fold, debounce } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { t, num } from '../core/i18n.js';
import { bookmarks, notes, hifz, CATEGORIES } from '../core/store.js';
import { loadSurah, surahInfo, reference } from '../core/quran.js';
import { emptyState, toast, confirmDialog, skeletonList } from '../core/ui.js';
import { openAyahSheet, openNoteSheet } from '../core/ayah-sheet.js';
import { navigate, linkSurah } from '../core/router.js';

let tab = 'saved';
let query = '';

const TABS = [
  ['saved', 'cat_saved', 'bookmark'],
  ['memorize', 'cat_memorize', 'brain'],
  ['favorite', 'cat_favorite', 'heart'],
  ['notes', 'cat_notes', 'note'],
];

export async function render_(mount, ctx) {
  tab = TABS.some(([k]) => k === ctx?.query?.tab) ? ctx.query.tab : 'saved';

  render(mount, html`
    <div class="view stack stack-5">
      <header><h1>${t('saved_title')}</h1></header>

      <div class="row" style="gap:var(--s2);overflow-x:auto;scrollbar-width:none" role="tablist">
        ${TABS.map(([key, label, ic]) => html`
          <button type="button" class="chip ${key === tab ? 'is-active' : ''}" role="tab"
                  aria-selected="${key === tab}" data-tab="${key}">
            ${icon(ic, 14)} ${t(label)}
          </button>`)}
      </div>

      <label class="field">
        <span class="sr-only">${t('search_saved')}</span>
        ${icon('search', 18)}
        <input type="search" id="savedQ" placeholder="${t('search_saved')}" autocomplete="off" value="${query}">
      </label>

      <div id="savedBody">${skeletonList(4)}</div>
    </div>
  `);

  $$('[data-tab]', mount).forEach((b) => b.addEventListener('click', () => {
    tab = b.dataset.tab;
    $$('[data-tab]', mount).forEach((x) => {
      x.classList.toggle('is-active', x === b);
      x.setAttribute('aria-selected', String(x === b));
    });
    paint();
  }));

  const input = $('#savedQ', mount);
  input.addEventListener('input', debounce(() => { query = input.value; paint(); }, 160));

  on(mount, 'click', '[data-open-ayah]', (e, node) => {
    if (e.target.closest('[data-row-act]')) return;
    const [s, a] = node.dataset.openAyah.split(':').map(Number);
    openAyahSheet({ s, a }, { onChange: paint });
  });

  on(mount, 'click', '[data-row-act]', (e, node) => {
    e.stopPropagation();
    const [s, a] = node.dataset.ref.split(':').map(Number);
    const act = node.dataset.rowAct;
    if (act === 'go') { navigate(linkSurah(surahInfo(s).slug, a)); return; }
    if (act === 'note') { openNoteSheet({ s, a }, paint); return; }
    if (act === 'remove') {
      if (tab === 'notes') { notes.remove(s, a); toast(t('note_removed'), { icon: 'trash' }); }
      else { bookmarks.remove(s, a); toast(t('removed_ok'), { icon: 'trash' }); }
      paint();
    }
  });

  paint();
}

async function paint() {
  const box = $('#savedBody');
  if (!box) return;

  const rows = tab === 'notes'
    ? Object.entries(notes.all()).map(([k, v]) => {
        const [s, a] = k.split(':').map(Number);
        return { s, a, ts: v.ts, note: v.text };
      }).sort((x, y) => y.ts - x.ts)
    : bookmarks.all().filter((b) => (b.cat || 'saved') === tab);

  if (!rows.length) {
    render(box, emptyState({
      icon: tab === 'notes' ? 'note' : 'bookmark',
      title: tab === 'notes' ? t('notes_empty') : t('bookmarks_empty'),
      text: tab === 'notes' ? t('notes_empty_text') : t('bookmarks_empty_text'),
      action: html`<a class="btn btn--primary btn--sm" href="#/surahs">${icon('bookOpen', 16)} ${t('start_reading')}</a>`,
    }));
    return;
  }

  // Load the text for whatever is on screen.
  const enriched = [];
  const cache = new Map();
  for (const r of rows.slice(0, 200)) {
    let d = cache.get(r.s);
    if (!d) {
      try { d = await loadSurah(r.s); cache.set(r.s, d); } catch { continue; }
    }
    enriched.push({ ...r, ar: d.ar[r.a - 1], sq: d.sq[r.a - 1] });
  }

  const q = fold(query.trim());
  const list = !q ? enriched : enriched.filter((r) => {
    const info = surahInfo(r.s);
    return fold(r.sq).includes(q) || fold(info?.sq || '').includes(q)
      || fold(r.note || '').includes(q) || `${r.s}:${r.a}`.includes(q);
  });

  if (!list.length) {
    render(box, emptyState({ icon: 'search', title: t('no_results'), text: t('no_results_text') }));
    return;
  }

  render(box, html`
    <p class="t-sm dim" style="margin-bottom:var(--s3)">${num(list.length)} ${list.length === 1 ? t('result') : t('results')}</p>
    <div class="list">
      ${list.map((r) => html`
        <article class="hit" data-open-ayah="${r.s}:${r.a}" tabindex="0" role="button">
          <div class="row-between">
            <span class="hit__ref">${reference(r.s, r.a)}</span>
            <span class="row" style="gap:0">
              <button type="button" class="iconbtn iconbtn--sm" data-row-act="note" data-ref="${r.s}:${r.a}"
                      aria-label="${t('note')}">${icon('note', 16)}</button>
              <button type="button" class="iconbtn iconbtn--sm" data-row-act="go" data-ref="${r.s}:${r.a}"
                      aria-label="${t('open_in_quran')}">${icon('arrowUpRight', 16)}</button>
              <button type="button" class="iconbtn iconbtn--sm" data-row-act="remove" data-ref="${r.s}:${r.a}"
                      aria-label="${t('remove')}">${icon('trash', 16)}</button>
            </span>
          </div>
          <p class="hit__ar">${r.ar}</p>
          <p class="hit__tr">${r.sq}</p>
          ${r.note ? html`<p class="ayah__note" style="margin-top:var(--s3)">${r.note}</p>` : ''}
        </article>`)}
    </div>
  `);
}

export default { render: render_ };
