/* ==========================================================================
   Statistics — only numbers the app can honestly measure.
   ========================================================================== */

import { html, render, $ } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { t, num, duration, weekday } from '../core/i18n.js';
import { stats, hifz, bookmarks, notes } from '../core/store.js';
import { TOTAL_AYAHS } from '../core/quran.js';
import { emptyState } from '../core/ui.js';
import { ring } from './partials.js';
import { settings } from '../core/app.js';

export async function render_(mount) {
  const d = stats.data();
  const c = hifz.counts();
  const week = stats.lastDays(7);
  const hasData = (d.seconds || 0) > 0 || (d.ayahs || 0) > 0 || c.total > 0;

  if (!hasData) {
    render(mount, html`
      <div class="view stack stack-5">
        <header><h1>${t('stats_title')}</h1></header>
        ${emptyState({
          icon: 'chart', title: t('st_empty'), text: t('st_empty_text'),
          action: html`<a class="btn btn--primary btn--sm" href="#/surahs">${icon('bookOpen', 16)} ${t('start_reading')}</a>`,
        })}
      </div>
    `);
    return;
  }

  const quranPct = Math.min(100, (d.ayahs / TOTAL_AYAHS) * 100);
  const peak = Math.max(60, ...week.map((w) => w.sec));
  const goalSec = settings.dailyGoalMinutes * 60;

  render(mount, html`
    <div class="view stack stack-6">
      <header><h1>${t('stats_title')}</h1></header>

      <section class="card card--pad">
        <div class="row" style="gap:var(--s5)">
          <div style="position:relative;display:grid;place-items:center">
            ${ring(quranPct, { size: 92, stroke: 8, label: t('st_progress') })}
            <span style="position:absolute;font-weight:700" class="nums">${quranPct >= 1 ? Math.round(quranPct) : quranPct.toFixed(1)}%</span>
          </div>
          <div class="flex-1 stack stack-2">
            <p class="fw-600">${t('st_progress')}</p>
            <p class="t-sm dim">${num(d.ayahs || 0)} ${t('goal_of')} ${num(TOTAL_AYAHS)} ${t('verses')}</p>
            <p class="t-sm dim">${num((d.surahs || []).length)} ${t('st_surahs').toLowerCase()}</p>
          </div>
        </div>
      </section>

      <section class="grid grid--2">
        ${stat(t('st_time'), duration(d.seconds || 0), 'clock')}
        ${stat(t('st_streak'), `${num(d.streak || 0)} ${t('days')}`, 'flame')}
        ${stat(t('st_ayahs'), num(d.ayahs || 0), 'bookOpen')}
        ${stat(t('st_memorized'), num(c.strong), 'brain')}
        ${stat(t('st_listen'), duration(d.listenSeconds || 0), 'headphones')}
        ${stat(t('st_days'), num((d.days || []).length), 'calendar')}
      </section>

      <section>
        <div class="sec"><h2 class="sec__title">${t('st_week')}</h2></div>
        <div class="card card--pad">
          <div class="week" role="img" aria-label="${t('st_week')}">
            ${week.map((w) => {
              const h = Math.round((w.sec / peak) * 100);
              const date = new Date(w.date + 'T00:00:00');
              return html`
                <div class="week__col">
                  <div class="week__bar ${w.sec ? '' : 'is-empty'}" style="height:${Math.max(4, h)}%"
                       title="${duration(w.sec)}"></div>
                  <div class="week__day">${weekday(date.getDay())}</div>
                </div>`;
            })}
          </div>
          <div class="row-between" style="margin-top:var(--s4);padding-top:var(--s3);border-top:1px solid var(--line)">
            <span class="t-sm dim">${t('mem_daily_goal')}</span>
            <span class="t-sm fw-600 nums">${settings.dailyGoalMinutes} ${t('minutes')}</span>
          </div>
        </div>
      </section>

      <section>
        <div class="sec"><h2 class="sec__title">${t('st_year')}</h2></div>
        <div class="card card--pad">
          ${heatmap(d)}
          <p class="t-xs dim" style="margin-top:var(--s3)">${num((d.days || []).length)} ${t('st_days').toLowerCase()}</p>
        </div>
      </section>

      <section class="grid grid--2">
        ${stat(t('saved_title'), num(bookmarks.all().length), 'bookmark')}
        ${stat(t('notes'), num(notes.count()), 'note')}
      </section>
    </div>
  `);
}

function stat(label, value, ic) {
  return html`
    <div class="statbig">
      <span style="color:var(--brand);display:block;margin-bottom:var(--s2)">${icon(ic, 20)}</span>
      <p class="statbig__val">${value}</p>
      <p class="statbig__label">${label}</p>
    </div>`;
}

function heatmap(d) {
  const cells = [];
  const today = new Date();
  const DAYS = 182; // half a year reads well on a phone
  for (let i = DAYS - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 864e5).toISOString().slice(0, 10);
    const sec = d.daily?.[date]?.sec || 0;
    const lvl = sec === 0 ? 0 : sec < 300 ? 1 : sec < 900 ? 2 : 3;
    cells.push(html`<span class="heat__cell" data-lvl="${lvl}" title="${date}"></span>`);
  }
  return html`<div class="heat" role="img" aria-label="${t('st_year')}">${cells}</div>`;
}

export default { render: render_ };
