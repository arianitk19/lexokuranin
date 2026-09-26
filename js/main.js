/* ==========================================================================
   LEXO KURAN — entry point.
   ========================================================================== */

import { $, render, html } from './core/dom.js';
import { migrate } from './core/store.js';
import { settings, apply, onSettings } from './core/app.js';
import { setLang, t } from './core/i18n.js';
import { loadMeta, surahInfo, resolveSurah } from './core/quran.js';
import * as router from './core/router.js';
import * as player from './core/audio.js';
import * as notifications from './core/notifications.js';
import { errorState, toast } from './core/ui.js';
import { build as buildShell, onRouteChange, setTitle } from './shell.js';

/* ----------------------------------------------------------------- boot */

const views = {
  home: () => import('./views/home.js'),
  surahs: () => import('./views/surahs.js'),
  reader: () => import('./views/reader.js'),
  search: () => import('./views/search.js'),
  audio: () => import('./views/audio.js'),
  memorize: () => import('./views/memorize.js'),
  bookmarks: () => import('./views/bookmarks.js'),
  stats: () => import('./views/stats.js'),
  settings: () => import('./views/settings.js'),
  tafsir: () => import('./views/tafsir.js'),
  about: () => import('./views/about.js'),
  help: () => import('./views/help.js'),
};

const loaded = new Map();
async function view(name) {
  if (!loaded.has(name)) loaded.set(name, (await views[name]()).default);
  return loaded.get(name);
}

let readerModule = null;

async function mountView(name, ctx, { title = '' } = {}) {
  const previous = $('#view');
  if (!previous) return;

  // Let the reader release its document-level listeners before anything paints.
  if (readerModule && name !== 'reader') { readerModule.teardown?.(); readerModule = null; }
  previous.dispatchEvent(new CustomEvent('lk:teardown'));

  // Swapping in a fresh node drops every delegated listener the last view
  // attached — no view can leak handlers into the next one.
  const host = previous.cloneNode(false);
  previous.replaceWith(host);

  setTitle(title);
  try {
    const mod = await view(name);
    if (name === 'reader') readerModule = mod;
    await mod.render(host, ctx);
  } catch (err) {
    console.error(err);
    render(host, html`<div class="view">${errorState({
      title: t('err_load'), text: t('err_load_text'), onRetry: () => mountView(name, ctx, { title }),
    })}</div>`);
  }
  onRouteChange();
  updateHead(name, ctx);
}

/* ------------------------------------------------------------------ routes */

function routes() {
  router.register('/', (ctx) => mountView('home', ctx));

  router.register('/surahs', (ctx) => mountView('surahs', ctx, { title: t('quran') }));
  router.register('/juz', (ctx) => mountView('surahs', { ...ctx, query: { ...ctx.query, tab: 'juz' } }, { title: t('juz') }));

  router.register('/juz/:n', (ctx) => {
    const juz = (window.__meta?.juz || []).find((j) => j.n === Number(ctx.params.n));
    if (!juz) { router.navigate('/juz', { replace: true }); return; }
    const info = surahInfo(juz.s);
    router.navigate(router.linkSurah(info.slug, juz.a), { replace: true });
  });

  router.register('/surah/:slug/:ayah?', (ctx) => {
    const info = resolveSurah(ctx.params.slug);
    return mountView('reader', ctx, { title: info?.sq || t('quran') });
  });

  router.register('/search', (ctx) => mountView('search', ctx, { title: t('search') }));
  router.register('/audio', (ctx) => mountView('audio', ctx, { title: t('audio') }));
  router.register('/memorize', (ctx) => mountView('memorize', ctx, { title: t('memorize') }));
  router.register('/bookmarks', (ctx) => mountView('bookmarks', ctx, { title: t('saved_title') }));
  router.register('/notes', (ctx) => mountView('bookmarks', { ...ctx, query: { ...ctx.query, tab: 'notes' } }, { title: t('notes') }));
  router.register('/stats', (ctx) => mountView('stats', ctx, { title: t('stats_title') }));
  router.register('/settings', (ctx) => mountView('settings', ctx, { title: t('settings') }));
  router.register('/tafsir/:slug?/:ayah?', (ctx) => mountView('tafsir', ctx, { title: t('tafsir_title') }));
  router.register('/about', (ctx) => mountView('about', ctx, { title: t('about') }));
  router.register('/help', (ctx) => mountView('help', ctx, { title: t('help') }));

  // Legacy links from the previous version keep working.
  router.register('/continue', () => {
    const last = JSON.parse(localStorage.getItem('kurani.lastRead') || 'null');
    const info = last ? surahInfo(last.s) : null;
    router.navigate(info ? router.linkSurah(info.slug, last.a) : '/surahs', { replace: true });
  });
  router.register('/learn', () => router.navigate('/help', { replace: true }));
  router.register('/article', () => router.navigate('/help', { replace: true }));

  router.setNotFound((ctx) => {
    const host = $('#view');
    setTitle(t('not_found'));
    render(host, html`<div class="view">${errorState({
      title: t('not_found'),
      text: t('not_found_text'),
      retryLabel: t('go_home'),
      onRetry: () => router.navigate('/'),
    })}</div>`);
    onRouteChange();
  });
}

/* -------------------------------------------------------------- <head> SEO */

const BASE_TITLE = 'LEXO KURAN';

function updateHead(name, ctx) {
  let title = BASE_TITLE;
  let desc = 'Kurani i plotë me përkthim shqip, recitime profesionale, memorizim dhe lexim offline. Lexo. Dëgjo. Mëso.';
  let canonical = location.origin + location.pathname;

  if (name === 'reader') {
    const info = resolveSurah(ctx.params.slug);
    if (info) {
      title = `Surja ${info.sq} (${info.meaning}) — ${BASE_TITLE}`;
      desc = `Surja ${info.sq} · ${info.n}. ${info.count} ajete, ${info.type === 'mekase' ? 'Mekase' : 'Medinase'}. `
        + 'Teksti arab me përkthim shqip, recitim dhe tefsir.';
      canonical += `#/surah/${info.slug}`;
    }
  } else if (name !== 'home') {
    const label = { surahs: t('quran'), search: t('search'), audio: t('audio_title'), memorize: t('memorize_title'),
      bookmarks: t('saved_title'), stats: t('stats_title'), settings: t('settings'), tafsir: t('tafsir_title'),
      about: t('about'), help: t('help') }[name];
    if (label) title = `${label} — ${BASE_TITLE}`;
  }

  document.title = title;
  setMeta('name', 'description', desc);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', desc);
  setMeta('property', 'og:url', canonical);
  const link = document.querySelector('link[rel="canonical"]');
  if (link) link.href = canonical;
}

function setMeta(attr, key, value) {
  let node = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute(attr, key);
    document.head.append(node);
  }
  node.setAttribute('content', value);
}

/* ------------------------------------------------------------ service worker */

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;

  // start() awaits the metadata fetch, so by the time we get here `load` has
  // usually already fired — waiting for it again would never register anything.
  const whenIdle = (fn) => {
    if (document.readyState === 'complete') setTimeout(fn, 0);
    else window.addEventListener('load', fn, { once: true });
  };

  whenIdle(async () => {
    try {
      const reg = await navigator.serviceWorker.register('sw.js', { scope: './' });

      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        sw?.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) showUpdateToast(reg);
        });
      });

      // Periodic sync keeps the daily-ayah widget fresh where it is supported.
      if ('periodicSync' in reg) {
        try {
          const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
          if (status.state === 'granted') {
            await reg.periodicSync.register('ayah-widget-sync', { minInterval: 24 * 60 * 60 * 1000 });
          }
        } catch { /* optional capability */ }
      }
    } catch (err) {
      console.warn('Service worker registration failed:', err);
    }
  });

  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data?.type === 'navigate' && e.data.url) location.hash = e.data.url;
  });
}

function showUpdateToast(reg) {
  const host = document.getElementById('toasts');
  if (!host) return;
  const node = document.createElement('div');
  node.className = 'toast';
  node.setAttribute('role', 'status');
  render(node, html`
    <span>${t('update_available')}</span>
    <button type="button" class="btn btn--sm" id="swUpdate"
            style="background:var(--bg);color:var(--ink);min-height:30px">${t('update_now')}</button>
  `);
  host.append(node);
  node.querySelector('#swUpdate')?.addEventListener('click', () => {
    reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
    setTimeout(() => location.reload(), 240);
  });
}

/* -------------------------------------------------------------------- start */

async function start() {
  migrate();
  setLang(settings.uiLang);
  apply(null);

  const boot = document.getElementById('boot');

  try {
    const meta = await loadMeta();
    window.__meta = meta;
  } catch {
    render(document.getElementById('app'), html`
      <div class="main"><div class="view">${errorState({
        title: t('err_load'),
        text: t('err_load_text'),
        onRetry: () => location.reload(),
      })}</div></div>`);
    boot?.remove();
    return;
  }

  player.init(settings);
  player.restoreSession();

  buildShell();
  routes();
  router.start();

  notifications.restore(settings);

  onSettings((s, keys) => {
    if (keys.includes('reciter')) player.setReciter(s.reciter);
    if (keys.includes('playbackRate')) player.setRate(s.playbackRate);
    if (keys.includes('repeatCount')) player.setRepeatCount(s.repeatCount);
    if (keys.includes('autoplayNext')) player.setAutoplayNext(s.autoplayNext);
    if (keys.includes('continuousPlay')) player.setContinuous(s.continuousPlay);
  });

  boot?.classList.add('is-out');
  setTimeout(() => boot?.remove(), 420);

  registerSW();
}

start();
