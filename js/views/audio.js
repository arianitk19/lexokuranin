/* ==========================================================================
   Audio view — browse recitations, pick a reciter, resume where you stopped.
   ========================================================================== */

import { html, render, $, $$, on, fold, debounce } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { t, num, clock } from '../core/i18n.js';
import { surahs, surahInfo, RECITERS, reciterName, reciterShort } from '../core/quran.js';
import { settings, set as setSetting, net } from '../core/app.js';
import * as player from '../core/audio.js';
import { sheet, toast, emptyState } from '../core/ui.js';
import { netBanner } from './partials.js';

let query = '';

export async function render_(mount) {
  const resume = player.getResume();

  render(mount, html`
    <div class="view stack stack-5">
      <header class="stack stack-2">
        <h1>${t('audio_title')}</h1>
        <p class="muted t-sm">${t('audio_sub')}</p>
      </header>

      ${net.online ? '' : netBanner(false)}

      <button type="button" class="card card--pad row" id="reciterBtn" style="gap:var(--s4);text-align:start">
        <span class="quickbtn__icon">${icon('headphones', 21)}</span>
        <span class="flex-1">
          <span class="t-xs dim" style="display:block">${t('reciter')}</span>
          <span class="fw-600">${reciterName(settings.reciter)}</span>
        </span>
        ${icon('chevronRight', 18)}
      </button>

      <div id="audioResume"></div>

      <div>
        <label class="field">
          <span class="sr-only">${t('search_surah')}</span>
          ${icon('search', 18)}
          <input type="search" id="audioQ" placeholder="${t('search_surah')}" autocomplete="off">
        </label>
      </div>

      <div id="audioList"></div>
    </div>
  `);

  $('#reciterBtn', mount).addEventListener('click', () => openReciterSheet(() => render_(mount)));

  const input = $('#audioQ', mount);
  input.addEventListener('input', debounce(() => { query = input.value; paintList(); }, 120));

  on(mount, 'click', '[data-play-surah]', (_e, node) => {
    const n = Number(node.dataset.playSurah);
    const cur = player.currentItem();
    // The row shows a pause icon while this surah plays, so it has to pause —
    // tapping it used to restart the surah from ayah 1.
    if (cur && cur.s === n && player.state.context?.kind === 'surah') {
      player.toggle();
      return;
    }
    player.playSurah(n, 1);
  });

  paintResume(resume);
  paintList();

  const off = player.on('change', () => paintList());
  mount.addEventListener('lk:teardown', () => off(), { once: true });
}

function paintResume(resume) {
  const box = $('#audioResume');
  if (!box) return;
  if (!resume) { render(box, ''); return; }
  const info = surahInfo(resume.s);
  if (!info) { render(box, ''); return; }

  render(box, html`
    <button type="button" class="card card--pad row" id="resumeAudio" style="gap:var(--s4);text-align:start">
      <span class="quickbtn__icon" style="background:var(--brand);color:var(--brand-on)">${icon('play', 21)}</span>
      <span class="flex-1">
        <span class="t-xs dim" style="display:block">${t('continue_listening')}</span>
        <span class="fw-600">${info.sq} · ${resume.s}:${resume.a}</span>
      </span>
      ${icon('chevronRight', 18)}
    </button>
  `);

  $('#resumeAudio')?.addEventListener('click', () => {
    player.playSurah(resume.s, resume.a);
  });
}

function paintList() {
  const box = $('#audioList');
  if (!box) return;
  const q = fold(query.trim());
  const list = !q ? surahs() : surahs().filter((s) =>
    fold(s.sq).includes(q) || fold(s.en).includes(q) || String(s.n) === q
  );

  if (!list.length) {
    render(box, emptyState({ icon: 'search', title: t('no_results'), text: t('no_results_text') }));
    return;
  }

  const cur = player.currentItem();

  render(box, html`
    <div class="list">
      ${list.map((s) => {
        const isNow = cur && cur.s === s.n;
        return html`
          <button type="button" class="rowitem" data-play-surah="${s.n}">
            <span class="surahrow__num" style="width:36px;height:36px">
              ${isNow && player.state.playing ? icon('pause', 17) : icon('play', 17)}
            </span>
            <span class="rowitem__label">
              <span class="fw-600" style="display:block">${s.sq}</span>
              <span class="t-sm dim">${num(s.count)} ${t('verses')}${isNow ? ' · ' + t('now_playing') : ''}</span>
            </span>
            <span class="surahrow__ar" style="font-size:18px">${s.ar}</span>
          </button>`;
      })}
    </div>
  `);
}

/* ---------------------------------------------------------------- reciters */

export function openReciterSheet(onChange) {
  const ui = sheet({ title: t('choose_reciter') });
  render(ui.body, html`
    <div class="list">
      ${RECITERS.map((r) => html`
        <button type="button" class="rowitem" data-reciter="${r.id}">
          <span class="rowitem__label">
            <span class="fw-600" style="display:block">${r.name}</span>
          </span>
          ${settings.reciter === r.id ? html`<span style="color:var(--brand)">${icon('check', 19)}</span>` : ''}
        </button>`)}
    </div>
    <p class="t-xs dim" style="margin-top:var(--s4)">${t('audio_offline_text')}</p>
  `);

  $$('[data-reciter]', ui.body).forEach((b) => b.addEventListener('click', () => {
    setSetting({ reciter: b.dataset.reciter });
    player.setReciter(b.dataset.reciter);
    toast(reciterShort(b.dataset.reciter), { icon: 'headphones' });
    ui.close();
    onChange?.();
  }));

  return ui;
}

export default { render: render_ };
