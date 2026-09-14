/* ==========================================================================
   Home — the product's front door.
   Everything above the fold answers: where was I, what's today, how am I doing.
   ========================================================================== */

import { html, render, $, $$ } from '../core/dom.js';
import { icon, pattern } from '../core/icons.js';
import { t, longDate, num, duration } from '../core/i18n.js';
import { lastRead, stats, hifz, bookmarks } from '../core/store.js';
import { dailyAyah, surahInfo, reference, TOTAL_AYAHS, globalNo } from '../core/quran.js';
import { toast, copyText, skeletonList } from '../core/ui.js';
import { openAyahSheet, openShareSheet } from '../core/ayah-sheet.js';
import * as playerEngine from '../core/audio.js';
import { linkSurah } from '../core/router.js';
import { settings, install, isStandalone, promptInstall, set as setSetting } from '../core/app.js';
import { installCard } from './partials.js';

const QUICK = [
  { href: '#/surahs', key: 'quran', ic: 'bookOpen' },
  { href: '#/audio', key: 'audio', ic: 'headphones' },
  { href: '#/memorize', key: 'memorize', ic: 'brain', accent: true },
  { href: '#/search', key: 'search', ic: 'search' },
];

function greetingLine() {
  const st = stats.data();
  const first = !st.lastDay && !lastRead.get();
  return first ? t('welcome_first') : t('welcome_back');
}

export async function render_(mount) {
  const resume = lastRead.get();
  const st = stats.data();
  const counts = hifz.counts();

  const goalSec = settings.dailyGoalMinutes * 60;
  const todaySec = stats.todaySeconds();
  const goalPct = Math.min(100, Math.round((todaySec / goalSec) * 100));
  const quranPct = st.ayahs ? Math.min(100, (st.ayahs / TOTAL_AYAHS) * 100) : 0;

  render(mount, html`
    <div class="view stack stack-7">
      <header class="greet">
        <p class="greet__salam">${t('greeting')}</p>
        <h1 class="greet__line">${greetingLine()}</h1>
        <p class="greet__date">${longDate()}</p>
      </header>

      <div id="homeResume"></div>

      <section aria-labelledby="dailyHead">
        <div class="sec">
          <h2 class="sec__title" id="dailyHead">${t('ayah_of_day')}</h2>
        </div>
        <div id="dailyBox">
          <div class="daily" aria-busy="true">
            <div class="skel skel--line" style="height:28px"></div>
            <div class="skel skel--line" style="height:28px;width:76%;margin-top:12px"></div>
            <div class="skel skel--line" style="width:90%;margin-top:22px"></div>
          </div>
        </div>
      </section>

      <section aria-labelledby="journeyHead">
        <div class="sec">
          <h2 class="sec__title" id="journeyHead">${t('your_journey')}</h2>
          <a class="sec__action" href="#/stats">${t('more')} ${icon('chevronRight', 14)}</a>
        </div>
        <div class="journey">
          <div class="jstat">
            <p class="jstat__val">${quranPct >= 0.1 ? quranPct.toFixed(1) : '0'}%</p>
            <p class="jstat__label">${t('of_quran')}</p>
          </div>
          <div class="jstat">
            <p class="jstat__val">${num(st.streak || 0)}</p>
            <p class="jstat__label">${t('st_streak')}</p>
          </div>
          <div class="jstat jstat--goal">
            <p class="jstat__val">${goalPct}%</p>
            <p class="jstat__label">${t('mem_daily_goal')}</p>
          </div>
        </div>
        <div class="card card--pad" style="margin-top:var(--s3)">
          <div class="row-between" style="margin-bottom:var(--s3)">
            <span class="t-sm fw-600">${t('st_today')}</span>
            <span class="t-sm dim nums">${duration(todaySec)} / ${settings.dailyGoalMinutes} ${t('minutes')}</span>
          </div>
          <div class="bar" role="progressbar" aria-valuenow="${goalPct}" aria-valuemin="0" aria-valuemax="100"
               aria-label="${t('mem_daily_goal')}">
            <div class="bar__fill" style="width:${goalPct}%"></div>
          </div>
          ${goalPct >= 100 ? html`<p class="t-sm" style="color:var(--brand);margin-top:var(--s3);font-weight:600">
            ${icon('checkCircle', 15)} ${t('goal_reached')}</p>` : ''}
        </div>
      </section>

      <section aria-labelledby="quickHead">
        <div class="sec"><h2 class="sec__title" id="quickHead">${t('quick_actions')}</h2></div>
        <nav class="quick">
          ${QUICK.map((q) => html`
            <a class="quickbtn ${q.accent ? 'quickbtn--accent' : ''}" href="${q.href}">
              <span class="quickbtn__icon">${icon(q.ic, 21)}</span>
              <span>${t(q.key)}</span>
            </a>`)}
        </nav>
      </section>

      ${counts.due > 0 ? html`
        <a class="card card--pad row" href="#/memorize" style="gap:var(--s4);text-decoration:none;color:inherit">
          <span class="quickbtn__icon" style="background:var(--accent-soft);color:var(--accent)">${icon('target', 21)}</span>
          <span class="flex-1">
            <span class="fw-600" style="display:block">${t('mem_due')}</span>
            <span class="t-sm dim">${num(counts.due)} ${t('ayahs_count')} · ${t('mem_queue')}</span>
          </span>
          ${icon('chevronRight', 18)}
        </a>` : ''}

      <div id="homeInstall"></div>

      <section id="homeRecent" aria-labelledby="recentHead" hidden>
        <div class="sec">
          <h2 class="sec__title" id="recentHead">${t('recent_activity')}</h2>
          <a class="sec__action" href="#/bookmarks">${t('more')} ${icon('chevronRight', 14)}</a>
        </div>
        <div class="list" id="recentList"></div>
      </section>
    </div>
  `);

  paintResume(resume);
  paintRecent();
  paintInstall();
  loadDaily();
}

/* ---------------------------------------------------------------- resume */

function paintResume(resume) {
  const box = $('#homeResume');
  if (!box) return;

  if (!resume) {
    render(box, html`
      <a class="resume" href="${linkSurah('el-fatiha')}">
        <span class="resume__pattern">${pattern('homePat')}</span>
        <span style="position:relative;display:block">
          <span class="resume__label">${t('start_reading')}</span>
          <span class="resume__surah" style="display:block">El-Fatiha</span>
          <span class="resume__ref" style="display:block">${t('tagline')}</span>
          <span class="resume__cta">${icon('bookOpen', 17)} ${t('start_reading')}</span>
        </span>
      </a>
    `);
    return;
  }

  const info = surahInfo(resume.s);
  if (!info) { render(box, ''); return; }
  const pct = Math.round((resume.a / info.count) * 100);

  render(box, html`
    <a class="resume" href="${linkSurah(info.slug, resume.a)}">
      <span class="resume__pattern">${pattern('homePat')}</span>
      <span style="position:relative;display:block">
        <span class="resume__label">${t('continue_reading')}</span>
        <span class="resume__surah" style="display:block">${info.sq}</span>
        <span class="resume__ref" style="display:block">${info.meaning} · ${resume.s}:${resume.a}</span>
        <span class="bar resume__bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <span class="bar__fill" style="width:${pct}%;display:block"></span>
        </span>
        <span class="resume__cta">${icon('play', 16)} ${t('resume')} · ${pct}%</span>
      </span>
    </a>
  `);
}

/* ----------------------------------------------------------------- daily */

async function loadDaily() {
  const box = $('#dailyBox');
  if (!box) return;
  try {
    const ayah = await dailyAyah();
    render(box, html`
      <article class="daily">
        <p class="ar daily__ar">${ayah.ar}</p>
        <p class="daily__tr">${ayah.sq}</p>
        <p class="daily__ref">${reference(ayah.s, ayah.a)}</p>
        <div class="daily__tools">
          <button type="button" class="iconbtn" data-d="listen" aria-label="${t('listen')}">${icon('play', 19)}</button>
          <button type="button" class="iconbtn" data-d="save" aria-label="${t('save')}">${icon('bookmark', 19)}</button>
          <button type="button" class="iconbtn" data-d="share" aria-label="${t('share')}">${icon('share', 19)}</button>
          <button type="button" class="iconbtn" data-d="copy" aria-label="${t('copy')}">${icon('copy', 19)}</button>
          <a class="btn btn--quiet btn--sm" style="margin-inline-start:auto"
             href="${linkSurah(surahInfo(ayah.s).slug, ayah.a)}">${t('open_in_quran')} ${icon('chevronRight', 15)}</a>
        </div>
      </article>
    `);

    const act = (name) => {
      switch (name) {
        case 'listen': playerEngine.playAyah(ayah.s, ayah.a); break;
        case 'save': {
          const on = bookmarks.toggle(ayah.s, ayah.a);
          toast(on ? t('saved_ok') : t('removed_ok'), { icon: 'bookmark' });
          break;
        }
        case 'share': openShareSheet(ayah); break;
        case 'copy': copyText(
          `${ayah.ar}\n\n${ayah.sq}\n\n— ${reference(ayah.s, ayah.a)}`
        ).then((ok) => toast(ok ? t('copied_ok') : t('err_load'), { icon: 'copy' })); break;
      }
    };
    $$('[data-d]', box).forEach((b) => b.addEventListener('click', () => act(b.dataset.d)));

    box.querySelector('.daily__ar')?.addEventListener('click', () => openAyahSheet(ayah));
  } catch {
    render(box, html`
      <div class="daily">
        <p class="muted">${t('err_load_text')}</p>
        <button type="button" class="btn btn--outline btn--sm" style="margin-top:var(--s4)" id="dailyRetry">
          ${icon('refresh', 15)} ${t('retry')}
        </button>
      </div>
    `);
    $('#dailyRetry')?.addEventListener('click', loadDaily);
  }
}

/* ---------------------------------------------------------------- recent */

function paintRecent() {
  const section = $('#homeRecent');
  const list = $('#recentList');
  if (!section || !list) return;
  const items = bookmarks.all().slice(0, 3);
  if (!items.length) { section.hidden = true; return; }
  section.hidden = false;

  render(list, html`${items.map((b) => {
    const info = surahInfo(b.s);
    if (!info) return '';
    return html`
      <a class="rowitem" href="${linkSurah(info.slug, b.a)}">
        <span class="quickbtn__icon" style="width:36px;height:36px;border-radius:10px">${icon('bookmark', 17)}</span>
        <span class="rowitem__label">
          <span class="fw-600" style="display:block">${info.sq}</span>
          <span class="t-sm dim">${b.s}:${b.a}</span>
        </span>
        ${icon('chevronRight', 17)}
      </a>`;
  })}`);
}

/* --------------------------------------------------------------- install */

function paintInstall() {
  const box = $('#homeInstall');
  if (!box) return;
  const dismissedAt = settings.installDismissed || 0;
  const recentlyDismissed = Date.now() - dismissedAt < 14 * 864e5;
  if (isStandalone() || install.installed || recentlyDismissed) { render(box, ''); return; }

  render(box, installCard({
    onInstall: async () => {
      if (install.available) {
        const outcome = await promptInstall();
        if (outcome === 'accepted') { toast(t('installed_ok'), { icon: 'checkCircle' }); render(box, ''); }
      }
    },
    onDismiss: () => { setSetting({ installDismissed: Date.now() }); render(box, ''); },
  }));
}

export default { render: render_ };
