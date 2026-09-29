/* ==========================================================================
   Surah index + Juz index.
   ========================================================================== */

import { html, render, $, $$, fold, debounce } from '../core/dom.js';
import { icon, octagon } from '../core/icons.js';
import { t, num } from '../core/i18n.js';
import { surahs, juzList, surahInfo, fromGlobal } from '../core/quran.js';
import { emptyState } from '../core/ui.js';
import { surahRow } from './partials.js';
import { linkSurah } from '../core/router.js';

let tab = 'surahs';
let query = '';

export async function render_(mount, ctx) {
  tab = ctx?.query?.tab === 'juz' ? 'juz' : 'surahs';

  render(mount, html`
    <div class="view stack stack-5">
      <header class="stack stack-2">
        <h1>${t('quran')}</h1>
        <p class="muted t-sm">${num(114)} ${t('surahs').toLowerCase()} · ${num(6236)} ${t('verses')}</p>
      </header>

      <div class="row-between wrap" style="gap:var(--s3)">
        <div class="seg" role="tablist" aria-label="${t('quran')}">
          <button type="button" class="seg__btn" role="tab" data-tab="surahs"
                  aria-selected="${tab === 'surahs'}">${t('surahs')}</button>
          <button type="button" class="seg__btn" role="tab" data-tab="juz"
                  aria-selected="${tab === 'juz'}">${t('juz')}</button>
        </div>
      </div>

      <div id="surahSearch" ${tab === 'juz' ? 'hidden' : ''}>
        <label class="field">
          <span class="sr-only">${t('search_surah')}</span>
          ${icon('search', 18)}
          <input type="search" id="surahQ" placeholder="${t('search_surah')}"
                 autocomplete="off" enterkeyhint="search" value="${query}">
          <button type="button" class="iconbtn iconbtn--sm" id="surahClear" hidden aria-label="${t('clear')}">
            ${icon('x', 16)}
          </button>
        </label>
      </div>

      <div id="surahBody"></div>
    </div>
  `);

  $$('[data-tab]', mount).forEach((b) => b.addEventListener('click', () => {
    tab = b.dataset.tab;
    $$('[data-tab]', mount).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    $('#surahSearch').hidden = tab === 'juz';
    paint();
  }));

  const input = $('#surahQ', mount);
  const clear = $('#surahClear', mount);
  const onInput = debounce(() => { query = input.value; clear.hidden = !query; paint(); }, 120);
  input?.addEventListener('input', onInput);
  clear?.addEventListener('click', () => { input.value = ''; query = ''; clear.hidden = true; paint(); input.focus(); });
  if (query) clear.hidden = false;

  paint();
}

function paint() {
  const body = $('#surahBody');
  if (!body) return;

  if (tab === 'juz') { render(body, juzView()); return; }

  const q = fold(query.trim());
  const list = !q ? surahs() : surahs().filter((s) =>
    fold(s.sq).includes(q) || fold(s.en).includes(q) || fold(s.meaning).includes(q)
    || String(s.n) === q || s.ar.includes(query.trim())
  );

  if (!list.length) {
    render(body, emptyState({ icon: 'search', title: t('no_results'), text: t('no_results_text') }));
    return;
  }

  render(body, html`<div class="list">${list.map((s) => surahRow(s))}</div>`);
}

function juzView() {
  return html`
    <div class="list">
      ${juzList().map((j) => {
        const info = surahInfo(j.s);
        const end = fromGlobal(j.end);
        const endInfo = surahInfo(end.s);
        return html`
          <a class="surahrow" href="${linkSurah(info.slug, j.a)}">
            <span class="surahrow__num">${octagon(40)}<span>${j.n}</span></span>
            <span class="flex-1">
              <span class="surahrow__name" style="display:block">${t('juz_one')} ${j.n}</span>
              <span class="surahrow__meta">${info.sq} ${j.s}:${j.a} — ${endInfo.sq} ${end.s}:${end.a}</span>
            </span>
            ${icon('chevronRight', 18)}
          </a>`;
      })}
    </div>`;
}

export default { render: render_ };
