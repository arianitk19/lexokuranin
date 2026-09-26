/* ==========================================================================
   Local daily reminder.

   Deliberately modest: no server, no push subscription, no tracking. The
   browser is asked for permission only when the user turns the reminder on,
   and the notification fires from a local timer while the app is open or
   from the service worker's periodic sync where the platform supports it.
   ========================================================================== */

import { storage } from './store.js';
import { dailyAyah, reference } from './quran.js';
import { t } from './i18n.js';

let timer = null;

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
}

async function fire() {
  const todayKey = new Date().toISOString().slice(0, 10);
  if (storage.get('reminderLast', null) === todayKey) return;
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
    storage.set('reminderLast', todayKey);
  } catch { /* a missed reminder is never worth an error */ }
}

/** Re-arm on start-up if the user has the reminder switched on. */
export function restore(settings) {
  if (settings?.dailyReminder && isSupported() && Notification.permission === 'granted') {
    schedule(settings.reminderTime);
  }
}
