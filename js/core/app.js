/* ==========================================================================
   Application state: settings, theme, fonts, network, install prompt.
   ========================================================================== */

import { loadSettings, saveSettings } from './store.js';
import { setLang } from './i18n.js';

export const settings = loadSettings();

const subs = new Set();
export function onSettings(fn) { subs.add(fn); return () => subs.delete(fn); }
function notify(keys) { subs.forEach((fn) => { try { fn(settings, keys); } catch (e) { console.error(e); } }); }

/** Update one or more settings, persist, and re-apply side effects. */
export function set(patch) {
  const keys = Object.keys(patch);
  Object.assign(settings, patch);
  saveSettings(settings);
  apply(keys);
  notify(keys);
}

/* -------------------------------------------------------------------- theme */

const media = window.matchMedia('(prefers-color-scheme: dark)');

export function effectiveTheme() {
  if (settings.theme === 'auto') return media.matches ? 'dark' : 'light';
  return settings.theme;
}

const THEME_COLOR = { light: '#fbfaf7', dark: '#0e1113', sepia: '#f3ead9', night: '#08090a' };

function applyTheme() {
  const theme = effectiveTheme();
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.getElementById('themeColor');
  if (meta) meta.setAttribute('content', THEME_COLOR[theme] || THEME_COLOR.light);
}

media.addEventListener?.('change', () => { if (settings.theme === 'auto') applyTheme(); });

/* -------------------------------------------------------------- Arabic fonts */

const AR_FONTS = {
  amiri: { stack: "'Amiri Quran', 'Scheherazade New', 'Noto Naskh Arabic', serif", google: 'Amiri+Quran' },
  scheherazade: { stack: "'Scheherazade New', 'Amiri Quran', 'Noto Naskh Arabic', serif", google: 'Scheherazade+New:wght@400;600' },
  naskh: { stack: "'Noto Naskh Arabic', 'Scheherazade New', 'Amiri Quran', serif", google: 'Noto+Naskh+Arabic:wght@400;600' },
};

export const ARABIC_FONTS = Object.keys(AR_FONTS);

const loadedFonts = new Set(['amiri']); // Amiri ships in the initial stylesheet

/** Fetch an Arabic face only when the reader actually asks for it. */
function ensureFont(key) {
  const def = AR_FONTS[key];
  if (!def || loadedFonts.has(key)) return;
  loadedFonts.add(key);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${def.google}&display=swap`;
  link.crossOrigin = 'anonymous';
  document.head.append(link);
}

/* -------------------------------------------------------------------- apply */

export function apply(keys = null) {
  const all = keys === null;
  const has = (k) => all || keys.includes(k);
  const root = document.documentElement;

  if (has('theme')) applyTheme();

  if (has('uiLang')) setLang(settings.uiLang);

  if (has('fontSize')) root.style.setProperty('--ar-size', settings.fontSize + 'px');
  if (has('lineHeight')) root.style.setProperty('--ar-lh', String(settings.lineHeight));
  if (has('ayahSpacing')) root.style.setProperty('--ayah-gap', settings.ayahSpacing + 'px');

  if (has('arFont')) {
    const key = AR_FONTS[settings.arFont] ? settings.arFont : 'amiri';
    ensureFont(key);
    root.style.setProperty('--font-ar', AR_FONTS[key].stack);
  }

  if (has('reduceMotion')) {
    root.dataset.motion = settings.reduceMotion ? 'reduced' : 'full';
  }

  if (has('focusMode')) {
    document.body.classList.toggle('focus-mode', Boolean(settings.focusMode));
    if (!settings.focusMode) document.body.classList.remove('chrome-hidden');
  }
}

/* ------------------------------------------------------------------ network */

export const net = { online: navigator.onLine };
const netSubs = new Set();
export function onNetwork(fn) { netSubs.add(fn); return () => netSubs.delete(fn); }

window.addEventListener('online', () => { net.online = true; netSubs.forEach((f) => f(true)); });
window.addEventListener('offline', () => { net.online = false; netSubs.forEach((f) => f(false)); });

/* ------------------------------------------------------------ install prompt */

export const install = { event: null, available: false, installed: false };
const installSubs = new Set();
export function onInstall(fn) { installSubs.add(fn); return () => installSubs.delete(fn); }
function notifyInstall() { installSubs.forEach((f) => f(install)); }

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  install.event = e;
  install.available = true;
  notifyInstall();
});

window.addEventListener('appinstalled', () => {
  install.installed = true;
  install.available = false;
  install.event = null;
  notifyInstall();
});

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: minimal-ui)').matches
    || window.navigator.standalone === true;
}

export async function promptInstall() {
  if (!install.event) return 'unavailable';
  install.event.prompt();
  const { outcome } = await install.event.userChoice;
  install.event = null;
  install.available = false;
  notifyInstall();
  return outcome; // 'accepted' | 'dismissed'
}

/** Which manual install instructions to show when there is no prompt event. */
export function platformHint() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

/* ------------------------------------------------------------- reading timer */

let readingStart = 0;
let readingAccum = 0;

export function startReadingTimer() {
  if (!readingStart) readingStart = Date.now();
}

export function stopReadingTimer() {
  if (!readingStart) return 0;
  const sec = Math.round((Date.now() - readingStart) / 1000);
  readingStart = 0;
  readingAccum += sec;
  return sec;
}

export function peekReadingSeconds() {
  return readingAccum + (readingStart ? Math.round((Date.now() - readingStart) / 1000) : 0);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { const s = stopReadingTimer(); if (s > 3) flushReading(s); }
  else if (document.body.classList.contains('is-reading')) startReadingTimer();
});

let flushFn = null;
export function setReadingFlush(fn) { flushFn = fn; }
function flushReading(sec) { flushFn?.(sec); }
