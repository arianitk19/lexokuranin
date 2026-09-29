/* ==========================================================================
   Local daily reminder.

   Deliberately modest: no server, no push subscription, no tracking. The
   browser is asked for permission only when the user turns the reminder on.

   It fires two ways, and both are told apart honestly rather than promised
   as one reliable thing:
     - a local timer, while the app has any open context (tab, PWA window —
       even backgrounded) — this always works, on every platform;
     - the service worker's Periodic Background Sync, which CAN fire the
       reminder with the app fully closed, but only on Chromium browsers on
       Android/desktop with the PWA installed, and the browser — not us —
       decides roughly when to run it, so the time is approximate, not exact.
       iOS Safari and Firefox have no equivalent, so there the reminder only
       ever arrives while the app has been opened that day.
   A real "arrives on any platform, at the exact time, app fully closed"
   reminder needs Web Push, which needs a server to send it — that is a
   deliberate, separate step, not something addable from the frontend alone.

   The service worker cannot read localStorage, so whether the reminder is
   on (and at what time) is mirrored into the Cache Storage API — the one
   piece of storage both this page and the service worker can read.
   ========================================================================== */

import { storage } from './store.js';
import { settings } from './app.js';
import { dailyAyah, reference } from './quran.js';
import { t } from './i18n.js';

let timer = null;
const MIRROR = 'reminder-mirror-v1';

/* --------------------------------------------------------- SW-visible state */

async function mirrorSettings(enabled, time) {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(MIRROR);
    await cache.put('/settings', new Response(JSON.stringify({ enabled, time, lang: settings.uiLang })));
  } catch { /* best effort — a missed mirror just means periodic sync stays quiet */ }
}

async function alreadyFiredToday() {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(MIRROR);
    const res = await cache.match('/last');
    if (!res) return false;
    return (await res.json()).date === new Date().toISOString().slice(0, 10);
  } catch { return false; }
}

async function markFiredToday() {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(MIRROR);
    await cache.put('/last', new Response(JSON.stringify({ date: new Date().toISOString().slice(0, 10) })));
  } catch { /* best effort */ }
}

/**
 * Ask for Periodic Background Sync once notifications are actually wanted.
 * This is the browser's call, not ours: most platforms don't support it at
 * all, and where they do, the permission itself is granted or refused by an
 * internal engagement heuristic — a short minInterval only tells the browser
 * "at least this often", it does not schedule an exact time.
 */
async function registerPeriodicSync() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    if (!('periodicSync' in reg)) return;
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
    if (status.state !== 'granted') return;
    await reg.periodicSync.register('daily-reminder', { minInterval: 12 * 60 * 60 * 1000 });
  } catch { /* unsupported almost everywhere today — that's fine, the local timer still covers it */ }
}

async function unregisterPeriodicSync() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.periodicSync?.unregister('daily-reminder');
  } catch { /* ignore */ }
}

export const isSupported = () => 'Notification' in window;

export async function request() {
  if (!isSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const res = await Notification.requestPermission();
    return res === 'granted';
  } catch { return false; }
}

function msUntil(hhmm) {
  const [h, m] = String(hhmm || '07:30').split(':').map(Number);
  const now = new Date();
  const next = new Date(now);
  next.setHours(h || 7, m || 30, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next - now;
}

/** Schedule the next reminder. Re-arms itself after firing. */
export function schedule(time) {
  cancel();
  if (!isSupported() || Notification.permission !== 'granted') return;
  mirrorSettings(true, time);
  registerPeriodicSync();
  const delay = msUntil(time);
  // setTimeout caps around 24.8 days — a daily delay is always well inside it.
  timer = setTimeout(async () => {
    await fire();
    schedule(time);
  }, delay);
  storage.set('reminderNext', Date.now() + delay);
}

export function cancel() {
  if (timer) clearTimeout(timer);
  timer = null;
  storage.remove('reminderNext');
  mirrorSettings(false, null);
  unregisterPeriodicSync();
}

async function fire() {
  if (await alreadyFiredToday()) return;
  try {
    const ayah = await dailyAyah();
    const body = `${ayah.sq}\n— ${reference(ayah.s, ayah.a)}`;
    const options = {
      body,
      icon: 'icons/icon-192.png',
      badge: 'icons/favicon-32.png',
      tag: 'lexo-kuran-daily',
      lang: document.documentElement.lang || 'sq',
      data: { url: `#/surah/${ayah.s}/${ayah.a}` },
    };
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg?.showNotification) await reg.showNotification(t('ayah_of_day'), options);
    else new Notification(t('ayah_of_day'), options);
    await markFiredToday();
  } catch { /* a missed reminder is never worth an error */ }
}

/** Re-arm on start-up if the user has the reminder switched on. */
export function restore(settingsObj) {
  if (settingsObj?.dailyReminder && isSupported() && Notification.permission === 'granted') {
    schedule(settingsObj.reminderTime);
  } else {
    mirrorSettings(false, null);
  }
}
