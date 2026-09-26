/* ==========================================================================
   Tafsir browser.
   This is the one part of the app that needs the network; it says so plainly
   instead of pretending otherwise.
   ========================================================================== */

import { html, render, $, $$ } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { t, num } from '../core/i18n.js';
import { surahs, surahInfo, loadSurah, loadTafsir, reference, TAFSIR_EDITION, resolveSurah } from '../core/quran.js';
import { errorState, spinner, emptyState } from '../core/ui.js';
import { net } from '../core/app.js';
import { navigate } from '../core/router.js';

let surahN = 1;
let ayahN = 1;

export async function render_(mount, ctx) {
  const fromSlug = ctx?.params?.slug ? resolveSurah(ctx.params.slug) : null;
  if (fromSlug) surahN = fromSlug.n;
  if (ctx?.params?.ayah) ayahN = Number(ctx.params.ayah) || 1;
  ayahN = Math.min(surahInfo(surahN)?.count || 1, Math.max(1, ayahN));

  render(mount, html`
    <div class="view stack stack-5">
      <header class="stack stack-2">
        <h1>${t('tafsir_title')}</h1>
        <p class="muted t-sm">${TAFSIR_EDITION.name} · ${t('tafsir_source')}</p>
      </header>

      <div class="row" style="gap:var(--s3)">
        <select class="field" id="tfSurah" style="flex:2;padding-inline:var(--s4)" aria-label="${t('surahs')}">
          ${surahs().map((s) => html`<option value="${s.n}" ${s.n === surahN ? 'selected' : ''}>${s.n}. ${s.sq}</option>`)}
        </select>
        <select class="field" id="tfAyah" style="flex:1;padding-inline:var(--s4)" aria-label="${t('verse')}"></select>
      </div>

      <div id="tfBody"></div>
    </div>
  `);

  const selSurah = $('#tfSurah', mount);
  const selAyah = $('#tfAyah', mount);

  const fillAyahs = () => {
    const count = surahInfo(surahN)?.count || 1;
    if (ayahN > count) ayahN = 1;
    render(selAyah, html`${Array.from({ length: count }, (_, i) => html`
      <option value="${i + 1}" ${i + 1 === ayahN ? 'selected' : ''}>${i + 1}</option>`)}`);
  };
  fillAyahs();

  selSurah.addEventListener('change', () => {
    surahN = Number(selSurah.value);
    ayahN = 1;
    fillAyahs();
    load();
  });
  selAyah.addEventListener('change', () => { ayahN = Number(selAyah.value); load(); });

  load();
}

async function load() {
  const box = $('#tfBody');
  if (!box) return;

  render(box, html`
    <div class="card card--pad">
      <div class="row" style="justify-content:center;color:var(--ink-3);padding:var(--s6) 0">
        ${spinner()} <span class="t-sm">${t('loading')}</span>
      </div>
    </div>`);

  let ayah;
  try {
    const d = await loadSurah(surahN);
    ayah = { s: surahN, a: ayahN, ar: d.ar[ayahN - 1], sq: d.sq[ayahN - 1] };
  } catch {
    render(box, errorState({ title: t('err_load'), text: t('err_load_text'), onRetry: load }));
    return;
  }

  const info = surahInfo(surahN);
  const head = html`
    <article class="card card--pad">
      <p class="hit__ref">${reference(surahN, ayahN)}</p>
      <p class="ar" style="margin-top:var(--s3)">${ayah.ar}</p>
      <p class="muted" style="margin-top:var(--s4)">${ayah.sq}</p>
      <div class="row" style="gap:var(--s2);margin-top:var(--s4);padding-top:var(--s3);border-top:1px solid var(--line)">
        <a class="btn btn--quiet btn--sm" href="#/surah/${info.slug}/${ayahN}">
          ${icon('bookOpen', 15)} ${t('open_in_quran')}
        </a>
      </div>
    </article>`;

  render(box, html`
    <div class="stack stack-4">
      ${head}
      <div id="tfText"></div>
    </div>`);

  const textBox = $('#tfText');
  render(textBox, html`
    <div class="card card--pad">
      <div class="row" style="justify-content:center;color:var(--ink-3);padding:var(--s5) 0">
        ${spinner()} <span class="t-sm">${t('loading')}</span>
      </div>
    </div>`);

  try {
    const { text, edition } = await loadTafsir(surahN, ayahN);
    render(textBox, html`
      <article class="card card--pad">
        <div class="sec"><h2 class="sec__title">${t('tafsir_title')}</h2></div>
        <p class="ar" style="font-size:calc(var(--ar-size) * .68);line-height:2.05">${text}</p>
        <p class="t-xs dim" style="margin-top:var(--s5);padding-top:var(--s3);border-top:1px solid var(--line)">
          ${t('sources')}: ${edition.name} — alquran.cloud
        </p>
      </article>`);
  } catch (err) {
    render(textBox, errorState({
      title: err.kind === 'offline' ? t('offline') : t('err_load'),
      text: err.kind === 'offline' ? t('tafsir_online') : t('tafsir_none'),
      onRetry: net.online ? load : null,
    }));
  }
}

export default { render: render_ };
