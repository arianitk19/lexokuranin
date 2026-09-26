/* ==========================================================================
   App shell — app bar, navigation, the audio player UI, network status.
   ========================================================================== */

import { html, render, $, $$, el } from './core/dom.js';
import { icon, brandMark } from './core/icons.js';
import { t, clock, num } from './core/i18n.js';
import { settings, set as setSetting, effectiveTheme, net, onNetwork } from './core/app.js';
import { sheet, toast, closeSheet } from './core/ui.js';
import * as player from './core/audio.js';
import { surahInfo, reciterShort, RECITERS } from './core/quran.js';
import { navigate, linkSurah, currentRoute, resolve as resolveRoute, back as goBack } from './core/router.js';
import { openReciterSheet } from './views/audio.js';

/* Bottom navigation: five destinations, no more. */
const NAV = [
  { to: '#/', key: 'nav_home', ic: 'home', match: (p) => p === '/' },
  { to: '#/surahs', key: 'nav_quran', ic: 'bookOpen', match: (p) => p.startsWith('/surah') || p.startsWith('/juz') },
  { to: '#/audio', key: 'nav_audio', ic: 'headphones', match: (p) => p.startsWith('/audio') },
  { to: '#/memorize', key: 'nav_memorize', ic: 'brain', match: (p) => p.startsWith('/memorize') },
  { to: 'more', key: 'nav_more', ic: 'grid', match: (p) => ['/search', '/bookmarks', '/stats', '/settings', '/about', '/help', '/tafsir'].some((x) => p.startsWith(x)) },
];

const SIDE = [
  { to: '#/', key: 'nav_home', ic: 'home' },
  { to: '#/surahs', key: 'nav_quran', ic: 'bookOpen' },
  { to: '#/search', key: 'nav_search', ic: 'search' },
  { to: '#/audio', key: 'nav_audio', ic: 'headphones' },
  { to: '#/memorize', key: 'nav_memorize', ic: 'brain' },
  { to: '#/bookmarks', key: 'nav_saved', ic: 'bookmark' },
  { to: '#/tafsir', key: 'tafsir', ic: 'scroll' },
  { to: '#/stats', key: 'stats', ic: 'chart' },
];

const SIDE_FOOT = [
  { to: '#/settings', key: 'nav_settings', ic: 'settings' },
  { to: '#/help', key: 'help', ic: 'help' },
];

const MORE = [
  { to: '#/search', key: 'nav_search', ic: 'search' },
  { to: '#/bookmarks', key: 'nav_saved', ic: 'bookmark' },
  { to: '#/tafsir', key: 'tafsir', ic: 'scroll' },
  { to: '#/stats', key: 'stats', ic: 'chart' },
  { to: '#/settings', key: 'nav_settings', ic: 'settings' },
  { to: '#/help', key: 'help', ic: 'help' },
  { to: '#/about', key: 'about', ic: 'info' },
];

let pageTitle = '';
let globalsWired = false;   // document/window listeners attach once per page load
let playerSubs = [];        // audio-engine subscriptions, replaced on every build
let netWired = false;

/* ------------------------------------------------------------------- build */

export function build() {
  const app = $('#app');

  render(app, html`
    <div class="shell">
      <nav class="sidebar" aria-label="${t('brand')}">
        <a class="sidebar__brand" href="#/">
          ${brandMark(36)}
          <span>
            <span class="sidebar__name" style="display:block">Lexo Kuran</span>
            <span class="sidebar__tag">${t('tagline')}</span>
          </span>
        </a>
        <div id="sideMain"></div>
        <div class="sidebar__foot" id="sideFoot"></div>
      </nav>

      <div class="flex-1" style="min-width:0;display:flex;flex-direction:column">
        <header class="appbar" id="appbar">
          <div class="appbar__inner">
            <button type="button" class="iconbtn" id="backBtn" hidden aria-label="${t('back')}">
              ${icon('chevronLeft', 20)}
            </button>
            <a class="appbar__brand" href="#/" id="brandLink" aria-label="${t('brand')}">
              <span class="appbar__mark">${brandMark(26)}</span>
              <span class="appbar__wordmark" id="barTitle">Lexo Kuran</span>
            </a>
            <div class="appbar__tools">
              <button type="button" class="iconbtn" id="searchBtn" aria-label="${t('search')}">${icon('search', 19)}</button>
              <button type="button" class="iconbtn" id="themeBtn" aria-label="${t('theme')}">
                ${icon(effectiveTheme() === 'light' || effectiveTheme() === 'sepia' ? 'moon' : 'sun', 19)}
              </button>
            </div>
          </div>
        </header>

        <div id="netStrip"></div>

        <main id="view" class="main" role="main" tabindex="-1"></main>
      </div>
    </div>

    <div class="player" id="playerBar" hidden></div>

    <nav class="bottomnav" aria-label="${t('brand')}">
      <div class="bottomnav__inner" id="bottomNav"></div>
    </nav>

    <div id="toasts"></div>
  `);

  paintNav();
  wireShell();
  buildPlayer();
  if (!netWired) { netWired = true; onNetwork(paintNet); }
  paintNet(net.online);
}

/* --------------------------------------------------------------------- nav */

function paintNav() {
  const path = currentRoute()?.path || '/';

  render($('#bottomNav'), html`
    ${NAV.map((n) => html`
      <button type="button" class="navbtn" data-nav="${n.to}"
              ${n.match(path) ? 'aria-current="page"' : ''}>
        ${icon(n.ic, 22)}
        <span>${t(n.key)}</span>
      </button>`)}
  `);

  render($('#sideMain'), html`
    ${SIDE.map((n) => html`
      <a class="sidelink" href="${n.to}" ${n.to.slice(1) === path || (n.to === '#/surahs' && path.startsWith('/surah')) ? 'aria-current="page"' : ''}>
        ${icon(n.ic, 19)} <span>${t(n.key)}</span>
      </a>`)}
  `);

  render($('#sideFoot'), html`
    ${SIDE_FOOT.map((n) => html`
      <a class="sidelink" href="${n.to}" ${n.to.slice(1) === path ? 'aria-current="page"' : ''}>
        ${icon(n.ic, 19)} <span>${t(n.key)}</span>
      </a>`)}
  `);

  $$('[data-nav]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.nav === 'more') openMore();
    else navigate(b.dataset.nav);
  }));
}

function openMore() {
  const path = currentRoute()?.path || '/';
  const ui = sheet({ title: t('nav_more') });
  render(ui.body, html`
    <div class="list">
      ${MORE.map((m) => html`
        <a class="rowitem" href="${m.to}" ${m.to.slice(1) === path ? 'aria-current="page"' : ''}>
          <span style="color:var(--ink-2)">${icon(m.ic, 19)}</span>
          <span class="rowitem__label fw-600">${t(m.key)}</span>
          ${icon('chevronRight', 17)}
        </a>`)}
    </div>
  `);
  $$('a', ui.body).forEach((a) => a.addEventListener('click', () => ui.close()));
}

/* ------------------------------------------------------------------- chrome */

function wireShell() {
  $('#searchBtn')?.addEventListener('click', () => navigate('#/search'));

  $('#themeBtn')?.addEventListener('click', () => {
    const order = ['light', 'sepia', 'dark', 'night'];
    const cur = settings.theme === 'auto' ? effectiveTheme() : settings.theme;
    const nextTheme = order[(order.indexOf(cur) + 1) % order.length];
    setSetting({ theme: nextTheme });
    refreshThemeIcon();
    toast(t('theme_' + nextTheme), { icon: nextTheme === 'light' || nextTheme === 'sepia' ? 'sun' : 'moon' });
  });

  // Deep links (a PWA shortcut, a notification tap, a shared ayah link, a
  // widget) land directly on a non-home route with nothing behind them in
  // history — a raw history.back() there falls through the app entirely.
  // goBack() only uses the browser history stack when we actually pushed
  // to it this session; otherwise it goes home, in-app.
  $('#backBtn')?.addEventListener('click', () => goBack('/'));

  // The shell can be rebuilt (language change); global listeners attach once.
  if (globalsWired) { updateStuck(); return; }
  globalsWired = true;

  window.addEventListener('scroll', updateStuck, { passive: true });
  updateStuck();

  // Global keyboard shortcuts.
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); navigate('#/search'); }
    else if (e.key === 'Escape') closeSheet();
    else if (e.key === ' ' && player.isActive()) { e.preventDefault(); player.toggle(); }
  });

  document.addEventListener('lk:title', (e) => setTitle(e.detail));
  document.addEventListener('lk:langchange', () => { build(); resolveRoute(); });
}

function updateStuck() {
  $('#appbar')?.classList.toggle('is-stuck', window.scrollY > 4);
}

export function refreshThemeIcon() {
  const btn = $('#themeBtn');
  if (!btn) return;
  const th = effectiveTheme();
  render(btn, icon(th === 'light' || th === 'sepia' ? 'moon' : 'sun', 19));
}

export function setTitle(title) {
  pageTitle = title || '';
  const node = $('#barTitle');
  const brandLink = $('#brandLink');
  const bar = $('#appbar');
  if (!node) return;
  if (pageTitle) {
    node.textContent = pageTitle;
    node.className = 'appbar__title truncate';
    bar?.classList.add('appbar--has-title');
  } else {
    node.textContent = 'Lexo Kuran';
    node.className = 'appbar__wordmark';
    bar?.classList.remove('appbar--has-title');
  }
  if (brandLink) brandLink.setAttribute('aria-label', pageTitle || t('brand'));
}

export function onRouteChange() {
  paintNav();
  const path = currentRoute()?.path || '/';
  const back = $('#backBtn');
  if (back) back.hidden = path === '/';
  refreshThemeIcon();
}

/* ------------------------------------------------------------------ network */

function paintNet(online) {
  const strip = $('#netStrip');
  if (!strip) return;
  if (online) { render(strip, ''); return; }
  render(strip, html`
    <div style="padding:0 var(--s4)">
      <div class="netbar" role="status" style="margin-bottom:var(--s3)">
        ${icon('wifiOff', 15)} <span>${t('offline')} — ${t('offline_text')}</span>
      </div>
    </div>`);
}

/* ------------------------------------------------------------------- player */

function buildPlayer() {
  const bar = $('#playerBar');
  playerSubs.forEach((off) => off());
  playerSubs = [];

  const paint = () => {
    const cur = player.currentItem();
    if (!cur) {
      bar.hidden = true;
      document.body.classList.remove('has-player');
      return;
    }
    bar.hidden = false;
    document.body.classList.add('has-player');

    const info = surahInfo(cur.s);
    const pct = Math.round(player.progress() * 100);

    render(bar, html`
      <div class="player__card">
        <button type="button" class="iconbtn iconbtn--sm" data-p="prev" aria-label="${t('prev')}">${icon('skipBack', 18)}</button>
        <button type="button" class="iconbtn player__play" data-p="toggle"
                aria-label="${player.state.playing ? t('pause') : t('play')}">
          ${player.state.loading ? icon('loader', 19) : icon(player.state.playing ? 'pause' : 'play', 19)}
        </button>
        <button type="button" class="iconbtn iconbtn--sm" data-p="next" aria-label="${t('next')}">${icon('skipForward', 18)}</button>

        <div class="player__info" data-p="expand" role="button" tabindex="0">
          <p class="player__title truncate">${info?.sq || ''} · ${cur.s}:${cur.a}</p>
          <div class="player__track" data-p="seek" role="slider" tabindex="0"
               aria-label="${t('player')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
            <div class="bar bar--thin"><div class="bar__fill" id="pFill" style="width:${pct}%"></div></div>
          </div>
          <div class="player__times">
            <span id="pCur">${clock(player.state.time)}</span>
            <span id="pDur">${clock(player.state.duration)}</span>
          </div>
        </div>

        <button type="button" class="iconbtn iconbtn--sm ${player.state.repeat !== 'off' ? 'is-active' : ''}"
                data-p="repeat" aria-label="${t('repeat')}" aria-pressed="${player.state.repeat !== 'off'}">
          ${icon(player.state.repeat === 'ayah' ? 'repeatOne' : 'repeat', 17)}
        </button>
        <button type="button" class="iconbtn iconbtn--sm" data-p="close" aria-label="${t('close')}">${icon('x', 17)}</button>
      </div>
    `);

    $$('[data-p]', bar).forEach((b) => {
      const act = b.dataset.p;
      if (act === 'seek') {
        const onSeek = (e) => {
          const rect = b.getBoundingClientRect();
          const x = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - rect.left;
          player.seekFraction(Math.min(1, Math.max(0, x / rect.width)));
        };
        b.addEventListener('click', onSeek);
        b.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); player.seek(player.state.time + 5); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); player.seek(player.state.time - 5); }
        });
        return;
      }
      b.addEventListener('click', (e) => {
        if (act === 'expand' && e.target.closest('[data-p="seek"]')) return;
        switch (act) {
          case 'toggle': player.toggle(); break;
          case 'next': player.next(); break;
          case 'prev': player.prev(); break;
          case 'repeat': {
            const mode = player.cycleRepeat();
            setSetting({ repeatMode: mode });
            toast(t('repeat_' + (mode === 'off' ? 'off' : mode)), { icon: 'repeat' });
            break;
          }
          case 'close': player.stop(); break;
          case 'expand': openFullPlayer(); break;
        }
      });
    });
  };

  playerSubs.push(player.on('change', paint));
  playerSubs.push(player.on('state', paint));
  playerSubs.push(player.on('error', (kind) => {
    toast(kind === 'offline' ? t('audio_unavailable_text') : t('audio_unavailable'), { icon: 'wifiOff', duration: 4000 });
  }));

  playerSubs.push(player.on('time', () => {
    const fill = $('#pFill');
    if (fill) fill.style.width = Math.round(player.progress() * 100) + '%';
    const cur = $('#pCur');
    if (cur) cur.textContent = clock(player.state.time);
    const dur = $('#pDur');
    if (dur) dur.textContent = clock(player.state.duration);
  }));

  paint();
}

/* -------------------------------------------------------- full-screen player */

export function openFullPlayer() {
  const subs = [];
  const ui = sheet({
    title: t('now_playing'),
    onClose: () => { subs.forEach((fn) => fn()); subs.length = 0; },
  });

  const paint = () => {
    const cur = player.currentItem();
    if (!cur) { ui.close(); return; }
    const info = surahInfo(cur.s);
    const pct = Math.round(player.progress() * 100);

    render(ui.body, html`
      <div class="fplayer">
        <div class="fplayer__art">${brandMark(92)}</div>

        <p class="fw-700" style="font-size:var(--t-lg)">${info?.sq || ''}</p>
        <p class="t-sm dim">${cur.s}:${cur.a} · ${reciterShort(player.state.reciter)}</p>

        <div style="margin-top:var(--s6)">
          <div class="player__track" data-f="seek" role="slider" tabindex="0"
               aria-label="${t('player')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
            <div class="bar"><div class="bar__fill" id="fFill" style="width:${pct}%"></div></div>
          </div>
          <div class="player__times" style="font-size:var(--t-xs)">
            <span id="fCur">${clock(player.state.time)}</span>
            <span id="fDur">${clock(player.state.duration)}</span>
          </div>
        </div>

        <div class="fplayer__controls">
          <button type="button" class="iconbtn iconbtn--lg" data-f="prev" aria-label="${t('prev')}">${icon('skipBack', 26)}</button>
          <button type="button" class="iconbtn fplayer__main" data-f="toggle"
                  aria-label="${player.state.playing ? t('pause') : t('play')}">
            ${icon(player.state.playing ? 'pause' : 'play', 26)}
          </button>
          <button type="button" class="iconbtn iconbtn--lg" data-f="next" aria-label="${t('next')}">${icon('skipForward', 26)}</button>
        </div>

        <div class="fplayer__opts">
          <button type="button" class="chip ${player.state.repeat !== 'off' ? 'is-active' : ''}" data-f="repeat">
            ${icon(player.state.repeat === 'ayah' ? 'repeatOne' : 'repeat', 14)}
            ${t('repeat_' + (player.state.repeat === 'off' ? 'off' : player.state.repeat))}
          </button>
          <button type="button" class="chip" data-f="rate">${icon('gauge', 14)} ${player.state.rate}×</button>
          <button type="button" class="chip" data-f="reciter">${icon('headphones', 14)} ${reciterShort(player.state.reciter)}</button>
          <button type="button" class="chip ${player.state.muted ? 'is-active' : ''}" data-f="mute" aria-label="${t('volume')}">
            ${icon(player.state.muted ? 'volumeOff' : 'volume', 14)}
          </button>
        </div>

        <div style="margin-top:var(--s5)">
          <a class="btn btn--outline btn--block" href="${linkSurah(info?.slug || cur.s, cur.a)}" data-f="goto">
            ${icon('bookOpen', 17)} ${t('open_in_quran')}
          </a>
        </div>

        ${player.state.error ? html`
          <p class="t-sm" style="color:var(--danger);margin-top:var(--s4)">
            ${player.state.error === 'offline' ? t('audio_unavailable_text') : t('audio_unavailable')}
          </p>
          <button type="button" class="btn btn--outline btn--sm" style="margin-top:var(--s3)" data-f="retry">
            ${icon('refresh', 15)} ${t('retry')}
          </button>` : ''}
      </div>
    `);

    $$('[data-f]', ui.body).forEach((b) => {
      const act = b.dataset.f;
      if (act === 'seek') {
        b.addEventListener('click', (e) => {
          const rect = b.getBoundingClientRect();
          player.seekFraction(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
        });
        return;
      }
      if (act === 'goto') { b.addEventListener('click', () => ui.close()); return; }
      b.addEventListener('click', () => {
        switch (act) {
          case 'toggle': player.toggle(); break;
          case 'next': player.next(); break;
          case 'prev': player.prev(); break;
          case 'retry': player.retry(); break;
          case 'mute': player.toggleMute(); paint(); break;
          case 'repeat': {
            const mode = player.cycleRepeat();
            setSetting({ repeatMode: mode });
            paint();
            break;
          }
          case 'rate': {
            const rates = [0.75, 1, 1.25, 1.5, 1.75, 2, 0.5];
            const idx = rates.indexOf(player.state.rate);
            const nextRate = rates[(idx + 1) % rates.length];
            player.setRate(nextRate);
            setSetting({ playbackRate: nextRate });
            paint();
            break;
          }
          case 'reciter':
            ui.close();
            setTimeout(() => openReciterSheet(), 240);
            break;
        }
      });
    });
  };

  paint();
  subs.push(player.on('change', paint), player.on('state', paint));
  subs.push(player.on('time', () => {
    const fill = $('#fFill', ui.body);
    if (fill) fill.style.width = Math.round(player.progress() * 100) + '%';
    const c = $('#fCur', ui.body); if (c) c.textContent = clock(player.state.time);
    const d = $('#fDur', ui.body); if (d) d.textContent = clock(player.state.duration);
  }));

  return ui;
}
