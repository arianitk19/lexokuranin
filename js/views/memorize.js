/* ==========================================================================
   Memorisation (Hifz) — a spaced-repetition learning system, not a game.
   ========================================================================== */

import { html, render, $, $$, on } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { t, num } from '../core/i18n.js';
import { hifz, STAGE, bookmarks, stats } from '../core/store.js';
import { surahs, surahInfo, loadSurah, loadAyah, reference } from '../core/quran.js';
import { sheet, toast, emptyState, errorState, confirmDialog, tapFeedback } from '../core/ui.js';
import { ring } from './partials.js';
import * as player from '../core/audio.js';
import { settings } from '../core/app.js';
import { navigate, linkSurah } from '../core/router.js';

const MODES = [
  { id: 'read', label: 'mode_read', ic: 'bookOpen' },
  { id: 'listen', label: 'mode_listen', ic: 'headphones' },
  { id: 'hideAr', label: 'mode_hide_ar', ic: 'eyeOff' },
  { id: 'hideTr', label: 'mode_hide_tr', ic: 'eye' },
  { id: 'recall', label: 'mode_recall', ic: 'brain' },
  { id: 'quiz', label: 'mode_quiz', ic: 'target' },
  { id: 'repeat', label: 'mode_repeat', ic: 'repeat' },
];

let session = null; // { items, index, mode, revealed, correct, wrong, surah }

export async function render_(mount) {
  if (session) { paintSession(mount); return; }
  paintOverview(mount);
}

/* ---------------------------------------------------------------- overview */

function paintOverview(mount) {
  const c = hifz.counts();
  const queue = hifz.queue(50);
  const pct = c.total ? Math.round((c.strong / c.total) * 100) : 0;

  const byStage = [
    ['strong', 'mem_strong', c.strong, 'dot-strong'],
    ['review', 'mem_review', c.review, 'dot-review'],
    ['learning', 'mem_learning', c.learning, 'dot-learning'],
    ['new', 'mem_new', c.new, 'dot-new'],
  ];

  render(mount, html`
    <div class="view stack stack-6">
      <header class="stack stack-2">
        <h1>${t('memorize_title')}</h1>
        <p class="muted t-sm">${t('memorize_sub')}</p>
      </header>

      ${c.total === 0 ? emptyState({
        icon: 'brain',
        title: t('mem_empty'),
        text: t('mem_empty_text'),
      }) : html`
        <section class="card card--pad">
          <div class="row" style="gap:var(--s5)">
            <div style="position:relative;display:grid;place-items:center">
              ${ring(pct, { size: 84, stroke: 7, label: t('mem_progress') })}
              <span style="position:absolute;font-weight:700;font-size:var(--t-md)" class="nums">${pct}%</span>
            </div>
            <div class="flex-1 stack stack-2">
              <p class="fw-600">${t('mem_progress')}</p>
              <p class="t-sm dim">${num(c.strong)} ${t('goal_of')} ${num(c.total)} ${t('ayahs_count')}</p>
              ${c.due > 0 ? html`<p class="t-sm" style="color:var(--accent);font-weight:600">
                ${icon('target', 14)} ${num(c.due)} ${t('mem_due').toLowerCase()}</p>` : ''}
            </div>
          </div>
        </section>

        <section class="grid grid--2">
          ${byStage.map(([key, label, n, dot]) => html`
            <div class="memstat">
              <span class="memstat__dot ${dot}"></span>
              <span class="flex-1 t-sm">${t(label)}</span>
              <span class="fw-700 nums">${num(n)}</span>
            </div>`)}
        </section>
      `}

      <div class="stack stack-3">
        ${queue.length ? html`
          <button type="button" class="btn btn--primary btn--lg btn--block" data-m="review">
            ${icon('target', 19)} ${t('mem_start')} · ${num(queue.length)} ${t('ayahs_count')}
          </button>` : ''}
        <button type="button" class="btn ${queue.length ? 'btn--outline' : 'btn--primary btn--lg'} btn--block" data-m="choose">
          ${icon('plus', 19)} ${t('mem_choose')}
        </button>
      </div>

      ${c.total > 0 ? html`
        <section>
          <div class="sec"><h2 class="sec__title">${t('mem_queue')}</h2></div>
          <div class="list">
            ${(queue.length ? queue : Object.entries(hifz.all()).slice(0, 12).map(([k, v]) => {
              const [s, a] = k.split(':').map(Number); return { s, a, ...v };
            })).slice(0, 12).map((e) => {
              const info = surahInfo(e.s);
              if (!info) return '';
              const dot = e.stage >= STAGE.STRONG ? 'dot-strong' : e.stage === STAGE.REVIEW ? 'dot-review'
                : e.stage === STAGE.LEARNING ? 'dot-learning' : 'dot-new';
              return html`
                <a class="rowitem" href="${linkSurah(info.slug, e.a)}">
                  <span class="memstat__dot ${dot}"></span>
                  <span class="rowitem__label">
                    <span class="fw-600" style="display:block">${info.sq} ${e.s}:${e.a}</span>
                    <span class="t-sm dim">${t(['mem_new', 'mem_learning', 'mem_review', 'mem_strong'][e.stage || 0])}</span>
                  </span>
                  ${icon('chevronRight', 17)}
                </a>`;
            })}
          </div>
        </section>` : ''}
    </div>
  `);

  $$('[data-m]', mount).forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.m === 'review') startReviewSession(mount);
    else openPicker(mount);
  }));
}

/* ------------------------------------------------------------------ picker */

function openPicker(mount) {
  const ui = sheet({ title: t('mem_choose') });
  let surahN = 114;
  let from = 1;
  let to = surahInfo(114)?.count || 6;
  let mode = 'recall';

  const paint = () => {
    const info = surahInfo(surahN);
    render(ui.body, html`
      <div class="stack stack-6">
        <div class="stack stack-2">
          <label class="t-sm fw-600" for="memSurah">${t('surahs')}</label>
          <select class="field" id="memSurah" style="display:block;width:100%;padding-inline:var(--s4)">
            ${surahs().map((s) => html`
              <option value="${s.n}" ${s.n === surahN ? 'selected' : ''}>${s.n}. ${s.sq} (${s.count})</option>`)}
          </select>
        </div>

        <div class="stack stack-3">
          <div class="row-between">
            <label class="t-sm fw-600" for="memFrom">${t('mem_range')}</label>
            <span class="t-sm dim nums">${from} – ${to}</span>
          </div>
          <div class="row" style="gap:var(--s3)">
            <input class="field" type="number" id="memFrom" min="1" max="${info.count}" value="${from}"
                   style="width:100%;padding-inline:var(--s4)" aria-label="${t('mem_range')}">
            <input class="field" type="number" id="memTo" min="1" max="${info.count}" value="${to}"
                   style="width:100%;padding-inline:var(--s4)" aria-label="${t('mem_range')}">
          </div>
        </div>

        <div class="stack stack-3">
          <p class="t-sm fw-600">${t('mem_mode')}</p>
          <div class="row wrap" style="gap:var(--s2)">
            ${MODES.map((m) => html`
              <button type="button" class="chip ${m.id === mode ? 'is-active' : ''}" data-mode="${m.id}">
                ${icon(m.ic, 14)} ${t(m.label)}
              </button>`)}
          </div>
        </div>

        <button type="button" class="btn btn--primary btn--lg btn--block" id="memGo">
          ${icon('play', 18)} ${t('mem_start')}
        </button>
      </div>
    `);

    $('#memSurah', ui.body).addEventListener('change', (e) => {
      surahN = Number(e.target.value);
      const c = surahInfo(surahN).count;
      from = 1; to = Math.min(c, 10);
      paint();
    });
    $('#memFrom', ui.body).addEventListener('change', (e) => {
      from = clampAyah(Number(e.target.value), surahN); paint();
    });
    $('#memTo', ui.body).addEventListener('change', (e) => {
      to = clampAyah(Number(e.target.value), surahN); paint();
    });
    $$('[data-mode]', ui.body).forEach((b) => b.addEventListener('click', () => { mode = b.dataset.mode; paint(); }));
    $('#memGo', ui.body).addEventListener('click', () => {
      ui.close();
      startRangeSession(mount, surahN, Math.min(from, to), Math.max(from, to), mode);
    });
  };

  paint();
}

const clampAyah = (v, s) => Math.max(1, Math.min(surahInfo(s)?.count || 1, Number(v) || 1));

/* ---------------------------------------------------------------- sessions */

async function startRangeSession(mount, s, from, to, mode) {
  try {
    const data = await loadSurah(s);
    const items = [];
    for (let a = from; a <= to; a++) {
      items.push({ s, a, ar: data.ar[a - 1], sq: data.sq[a - 1], en: data.en[a - 1], tl: data.tl[a - 1] });
    }
    session = { items, index: 0, mode, revealed: false, correct: 0, wrong: 0, startedAt: Date.now() };
    paintSession(mount);
  } catch {
    toast(t('err_load'), { icon: 'slash' });
  }
}

async function startReviewSession(mount) {
  const queue = hifz.queue(20);
  if (!queue.length) return;
  try {
    const items = [];
    for (const e of queue) items.push(await loadAyah(e.s, e.a));
    session = { items, index: 0, mode: 'recall', revealed: false, correct: 0, wrong: 0, review: true, startedAt: Date.now() };
    paintSession(mount);
  } catch {
    toast(t('err_load'), { icon: 'slash' });
  }
}

function endSession(mount) {
  if (session) {
    const sec = Math.round((Date.now() - session.startedAt) / 1000);
    if (sec > 5) stats.addSeconds(Math.min(sec, 3600), 'read');
  }
  session = null;
  player.pause();
  paintOverview(mount);
}

/* -------------------------------------------------------------- session UI */

function paintSession(mount) {
  const { items, index, mode } = session;

  if (index >= items.length) {
    render(mount, html`
      <div class="view stack stack-6">
        <div class="state">
          <div class="state__icon" style="background:var(--brand-soft);color:var(--brand)">${icon('award', 30)}</div>
          <p class="state__title">${t('mem_session_done')}</p>
          <p class="state__text">${t('mem_session_done_text')}</p>
          ${session.mode === 'quiz' ? html`
            <p class="t-sm nums" style="margin-top:var(--s3)">
              ${icon('check', 15)} ${num(session.correct)} · ${icon('x', 15)} ${num(session.wrong)}
            </p>` : ''}
        </div>
        <div class="stack stack-2" style="max-width:22rem;margin-inline:auto;width:100%">
          <button type="button" class="btn btn--primary btn--block" id="memAgain">${icon('rotate', 18)} ${t('mem_start')}</button>
          <button type="button" class="btn btn--ghost btn--block" id="memDone">${t('done')}</button>
        </div>
      </div>
    `);
    $('#memAgain').addEventListener('click', () => { session.index = 0; session.revealed = false; session.correct = 0; session.wrong = 0; paintSession(mount); });
    $('#memDone').addEventListener('click', () => endSession(mount));
    return;
  }

  const item = items[index];
  const pct = Math.round((index / items.length) * 100);
  const hideAr = (mode === 'hideAr') || (mode === 'recall' && !session.revealed);
  const hideTr = (mode === 'hideTr') || (mode === 'recall' && !session.revealed);
  const entry = hifz.get(item.s, item.a);

  render(mount, html`
    <div class="view stack stack-5">
      <header class="row-between">
        <button type="button" class="iconbtn" id="memExit" aria-label="${t('close')}">${icon('x', 20)}</button>
        <div class="flex-1 stack stack-1">
          <p class="t-sm fw-600 center">${reference(item.s, item.a)}</p>
          <div class="bar bar--thin" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
            <div class="bar__fill" style="width:${pct}%"></div>
          </div>
        </div>
        <span class="t-sm dim nums" style="min-width:52px;text-align:end">${index + 1}/${items.length}</span>
      </header>

      <div class="row" style="gap:var(--s2);overflow-x:auto;scrollbar-width:none">
        ${MODES.map((m) => html`
          <button type="button" class="chip ${m.id === mode ? 'is-active' : ''}" data-setmode="${m.id}">
            ${icon(m.ic, 14)} ${t(m.label)}
          </button>`)}
      </div>

      ${mode === 'quiz' ? quizCard(item) : html`
        <div class="memcard">
          ${hideAr
            ? html`<div class="memcard__hidden" data-reveal="ar" role="button" tabindex="0">${icon('eye', 18)} ${t('mem_reveal')}</div>`
            : html`<p class="memcard__ar">${item.ar}</p>`}
          ${hideTr
            ? html`<div class="memcard__hidden" data-reveal="tr" role="button" tabindex="0" style="margin-top:var(--s5)">${icon('eye', 18)} ${t('mem_reveal')}</div>`
            : html`<p class="memcard__tr">${item.sq}</p>`}
        </div>

        <div class="row" style="justify-content:center;gap:var(--s3)">
          <button type="button" class="iconbtn iconbtn--lg" data-act="listen" aria-label="${t('listen')}"
                  style="background:var(--surface-2)">${icon('play', 22)}</button>
          <button type="button" class="iconbtn iconbtn--lg" data-act="repeat" aria-label="${t('repeat')}"
                  style="background:var(--surface-2)">${icon('repeat', 20)}</button>
          <button type="button" class="iconbtn iconbtn--lg" data-act="open" aria-label="${t('open_in_quran')}"
                  style="background:var(--surface-2)">${icon('bookOpen', 20)}</button>
        </div>

        <div class="grid grid--2">
          <button type="button" class="btn btn--outline btn--lg" data-grade="0">${icon('rotate', 18)} ${t('mem_didnt')}</button>
          <button type="button" class="btn btn--primary btn--lg" data-grade="1">${icon('check', 18)} ${t('mem_knew')}</button>
        </div>
      `}

      ${entry ? html`<p class="t-xs dim center">${t(['mem_new', 'mem_learning', 'mem_review', 'mem_strong'][entry.stage || 0])}
        ${entry.reviews ? ' · ' + num(entry.reviews) : ''}</p>` : ''}
    </div>
  `);

  wireSession(mount, item);
}

function quizCard(item) {
  if (!session.options) session.options = buildOptions(item);
  return html`
    <div class="stack stack-4">
      <div class="memcard" style="min-height:auto">
        <p class="memcard__ar">${item.ar}</p>
      </div>
      <p class="t-sm dim center">${t('mem_quiz_q')}</p>
      <div class="stack stack-2">
        ${session.options.map((o, i) => html`
          <button type="button" class="quizopt" data-quiz="${i}">${o.text}</button>`)}
      </div>
    </div>`;
}

function buildOptions(item) {
  const pool = session.items.filter((x) => x.a !== item.a).map((x) => x.sq);
  const distractors = [];
  const seen = new Set([item.sq]);
  while (distractors.length < 3 && pool.length) {
    const pick = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    if (pick && !seen.has(pick)) { seen.add(pick); distractors.push(pick); }
  }
  // Not enough verses in range? Borrow from the same surah.
  const opts = [{ text: item.sq, ok: true }, ...distractors.map((d) => ({ text: d, ok: false }))];
  return opts.sort(() => Math.random() - 0.5);
}

function wireSession(mount, item) {
  $('#memExit', mount)?.addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: t('mem_session_done'), text: t('mem_session_done_text'), confirmLabel: t('done'),
    });
    if (ok) endSession(mount);
  });

  $$('[data-setmode]', mount).forEach((b) => b.addEventListener('click', () => {
    session.mode = b.dataset.setmode;
    session.revealed = false;
    session.options = null;
    if (session.mode === 'listen') player.playAyah(item.s, item.a);
    if (session.mode === 'repeat') { player.setRepeat('ayah'); player.playAyah(item.s, item.a); }
    paintSession(mount);
  }));

  $$('[data-reveal]', mount).forEach((b) => {
    const reveal = () => { session.revealed = true; paintSession(mount); };
    b.addEventListener('click', reveal);
    b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); } });
  });

  $$('[data-act]', mount).forEach((b) => b.addEventListener('click', () => {
    switch (b.dataset.act) {
      case 'listen': player.playAyah(item.s, item.a); break;
      case 'repeat':
        player.setRepeat('ayah');
        player.setRepeatCount(settings.repeatCount || 3);
        player.playAyah(item.s, item.a);
        toast(`${t('repeat_ayah')} ×${settings.repeatCount || 3}`, { icon: 'repeat' });
        break;
      case 'open': {
        const info = surahInfo(item.s);
        navigate(linkSurah(info.slug, item.a));
        break;
      }
    }
  }));

  $$('[data-grade]', mount).forEach((b) => b.addEventListener('click', () => {
    tapFeedback();
    const ok = b.dataset.grade === '1';
    hifz.review(item.s, item.a, ok);
    advance(mount);
  }));

  $$('[data-quiz]', mount).forEach((b, i) => b.addEventListener('click', () => {
    if (session.answered) return;
    session.answered = true;
    const opt = session.options[i];
    b.classList.add(opt.ok ? 'is-right' : 'is-wrong');
    if (!opt.ok) {
      const right = $$('[data-quiz]', mount)[session.options.findIndex((o) => o.ok)];
      right?.classList.add('is-right');
      session.wrong++;
    } else {
      session.correct++;
    }
    hifz.review(item.s, item.a, opt.ok);
    setTimeout(() => advance(mount), opt.ok ? 650 : 1500);
  }));
}

function advance(mount) {
  session.index++;
  session.revealed = false;
  session.options = null;
  session.answered = false;
  if (session.mode === 'listen' || session.mode === 'repeat') {
    const nextItem = session.items[session.index];
    if (nextItem) setTimeout(() => player.playAyah(nextItem.s, nextItem.a), 120);
  }
  paintSession(mount);
}

export function reset() { session = null; }

export default { render: render_, reset };
