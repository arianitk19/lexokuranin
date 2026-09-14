/* ==========================================================================
   LEXO KURAN · Service worker

   Offline strategy, stated honestly:
   · app shell      — precached on install, so the app always opens
   · Quran data     — cache-first, permanently; the full download warms all 114
   · fonts          — stale-while-revalidate
   · recitation     — streamed; ranged media bypasses this worker entirely, so
                      recitations need a connection (the text never does)
   · tafsir API     — network-first with a cached fallback
   ========================================================================== */

const VERSION = 'lk-v3.4.0';
const SHELL = `shell-${VERSION}`;
const DATA = `data-${VERSION}`;
const FONTS = `fonts-${VERSION}`;
const AUDIO = `audio-${VERSION}`;
const API = `api-${VERSION}`;

const AUDIO_MAX_ENTRIES = 400;

const SHELL_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './favicon.ico',
  './css/tokens.css',
  './css/base.css',
  './css/components.css',
  './css/layout.css',
  './css/views.css',
  './js/main.js',
  './js/shell.js',
  './js/core/dom.js',
  './js/core/icons.js',
  './js/core/i18n.js',
  './js/core/store.js',
  './js/core/app.js',
  './js/core/router.js',
  './js/core/quran.js',
  './js/core/ui.js',
  './js/core/audio.js',
  './js/core/share.js',
  './js/core/ayah-sheet.js',
  './js/core/notifications.js',
  './js/views/home.js',
  './js/views/surahs.js',
  './js/views/reader.js',
  './js/views/search.js',
  './js/views/audio.js',
  './js/views/memorize.js',
  './js/views/bookmarks.js',
  './js/views/stats.js',
  './js/views/settings.js',
  './js/views/tafsir.js',
  './js/views/about.js',
  './js/views/help.js',
  './js/views/partials.js',
  './data/meta.json',
  './data/daily.json',
  // Surahs ship as chunks, not 114 files. Part 1 (El-Fatiha + El-Bekare) and the
  // last part (the short surahs people open most) are worth having up front.
  './data/quran/1.json',
  './data/quran/11.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-16.png',
  './icons/favicon-32.png',
  './icons/now-playing-256.png',
  './icons/now-playing-512.png',
  './icons/widget-preview.png',
  './widget-ayah.json',
  './widget-data.json',
];

/* ------------------------------------------------------------- lifecycle */

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    // allSettled: one missing optional asset must never fail the install.
    await Promise.allSettled(SHELL_ASSETS.map((u) => cache.add(new Request(u, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)));
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch { /* optional */ }
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

/* ----------------------------------------------------------------- fetch */

const isFont = (u) => u.host === 'fonts.googleapis.com' || u.host === 'fonts.gstatic.com';
const isAudio = (u) => u.host === 'cdn.islamic.network';
const isAPI = (u) => u.host === 'api.alquran.cloud';
const isData = (u) => u.origin === self.location.origin && u.pathname.includes('/data/');

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (req.mode === 'navigate') { e.respondWith(handleNavigate(e)); return; }
  if (isFont(url)) { e.respondWith(staleWhileRevalidate(req, FONTS)); return; }

  if (isAudio(url)) {
    // Phones stream recitations with Range requests and expect a real 206 back.
    // We cannot build one from an opaque cross-origin body, and answering a
    // range request with a whole file is what silences audio on iOS and Android.
    // So ranged media goes straight to the network, untouched by this worker,
    // while the plain request that follows is what we keep for offline use.
    if (req.headers.get('range')) return;
    e.respondWith(audioRoute(req));
    return;
  }
  if (isAPI(url)) { e.respondWith(networkFirst(req, API)); return; }
  if (isData(url)) { e.respondWith(cacheFirst(req, DATA)); return; }

  if (url.origin === self.location.origin) { e.respondWith(cacheFirst(req, SHELL)); return; }
});

async function handleNavigate(event) {
  try {
    const preload = await event.preloadResponse;
    if (preload) return preload;
    return await fetch(event.request);
  } catch {
    const shell = await caches.match('./index.html', { ignoreSearch: true });
    if (shell) return shell;
    const fallback = await caches.match('./offline.html');
    return fallback || new Response('', { status: 504, statusText: 'Offline' });
  }
}

/* -------------------------------------------------------------- strategies */

/**
 * Storing a response must never be able to fail the request it came from.
 * `cache.put` throws on 206 Partial Content — which is exactly what a phone's
 * media element gets back, because it always asks with a Range header. That
 * rejection used to escape into the caller's catch and turn working audio into
 * a 504, so caching is isolated here and its failure is ignored on purpose.
 */
async function stash(cache, req, res, cacheName, limit) {
  if (!res) return;
  if (res.status === 206 || res.status === 0 && res.type !== 'opaque') return;
  if (!(res.ok || res.type === 'opaque')) return;
  if (req.headers.get('range')) return;   // never store a partial fetch
  try {
    await cache.put(req, res.clone());
    if (limit) trim(cacheName, limit);
  } catch { /* quota, opaque padding, partial response — none are fatal */ }
}

async function cacheFirst(req, cacheName, { limit } = {}) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreVary: true });
  if (hit) return hit;
  try {
    const res = await fetch(req);
    await stash(cache, req, res, cacheName, limit);
    return res;
  } catch {
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

/**
 * Recitations: serve a cached copy when we have one, otherwise stream from the
 * CDN and keep it. A failure here returns the network error as-is rather than a
 * synthetic 504, so the player's own fallback ladder can judge what happened.
 */
async function audioRoute(req) {
  const cache = await caches.open(AUDIO);
  const hit = await cache.match(req, { ignoreVary: true });
  if (hit) return hit;
  const res = await fetch(req);
  await stash(cache, req, res, AUDIO, AUDIO_MAX_ENTRIES);
  return res;
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    await stash(cache, req, res, cacheName);
    return res;
  } catch {
    const hit = await cache.match(req, { ignoreVary: true });
    if (hit) return hit;
    return new Response(JSON.stringify({ code: 504, status: 'OFFLINE' }), {
      status: 504,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreVary: true });
  const network = fetch(req)
    .then((res) => { stash(cache, req, res, cacheName); return res; })
    .catch(() => null);
  return hit || (await network) || new Response('', { status: 504 });
}

/** Keep a cache from growing without bound (oldest entries go first). */
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  for (const key of keys.slice(0, keys.length - max)) await cache.delete(key);
}

/* ---------------------------------------------------------- notifications */

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = e.notification.data?.url || '#/';
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      if (client.url.includes(self.location.origin)) {
        client.postMessage({ type: 'navigate', url: target });
        return client.focus();
      }
    }
    return self.clients.openWindow('./' + target);
  })());
});

/* ------------------------------------------------- PWA widget: Ajeti i ditës */

async function updateWidgets() {
  if (!('widgets' in self)) return;
  try {
    const widget = await self.widgets.getByTag('ayah-daily');
    if (!widget) return;

    const [daily, template] = await Promise.all([
      fetch('./data/daily.json').then((r) => r.json()),
      fetch('./widget-ayah.json').then((r) => r.text()),
    ]);
    const now = new Date();
    const dayIndex = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5);
    const [s, a] = daily.pool[dayIndex % daily.pool.length];
    const meta = await fetch('./data/meta.json').then((r) => r.json());
    const part = meta.parts?.map?.[s - 1] || 1;
    const surah = await fetch(`./data/quran/${part}.json`)
      .then((r) => r.json())
      .then((chunk) => chunk[String(s)]);
    const info = meta.surahs[s - 1];
    if (!surah) return;

    await self.widgets.updateByTag('ayah-daily', {
      template,
      data: JSON.stringify({
        ayah_ar: surah.ar[a - 1],
        ayah_tr: surah.sq[a - 1],
        ref: `${info.sq} ${s}:${a}`,
      }),
    });
  } catch { /* the widget is a nicety, never a failure path */ }
}

self.addEventListener('widgetinstall', (e) => e.waitUntil(updateWidgets()));
self.addEventListener('widgetresume', (e) => e.waitUntil(updateWidgets()));
self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'ayah-widget-sync') e.waitUntil(updateWidgets());
});
