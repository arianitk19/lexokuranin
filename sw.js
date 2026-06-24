/* ===== Kurani · Service Worker (offline-first PWA) ===== */
const VERSION = 'kurani-v1.0.6';
const APP_SHELL = `app-${VERSION}`;
const FONTS = `fonts-${VERSION}`;
const API = `api-${VERSION}`;
const AUDIO = `audio-${VERSION}`;

const SHELL_ASSETS = [
  './', './index.html', './offline.html', './manifest.webmanifest',
  './js/i18n.js', './js/api.js', './js/app.js', './js/enhance.js', './js/content.js', './widget-ayah.json', './widget-data.json', './icons/widget-preview.png',
  './icons/now-playing-512.png', './icons/now-playing-256.png',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png', './icons/favicon-16.png',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(APP_SHELL);
    await Promise.allSettled(SHELL_ASSETS.map((u) => c.add(u)));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function isFont(u) { return u.host.indexOf('fonts.googleapis.com') >= 0 || u.host.indexOf('fonts.gstatic.com') >= 0; }
function isAPI(u) { return u.host.indexOf('api.alquran.cloud') >= 0; }
function isAudio(u) { return u.host.indexOf('cdn.islamic.network') >= 0 && u.pathname.indexOf('/audio') >= 0; }

self.addEventListener('fetch', (e) => {
  const request = e.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (isFont(url)) { e.respondWith(staleWhileRevalidate(request, FONTS)); return; }
  if (isAPI(url)) { e.respondWith(networkFirst(request, API)); return; }
  if (isAudio(url)) { e.respondWith(cacheFirst(request, AUDIO)); return; }
  if (url.host.indexOf('cdn.tailwindcss.com') >= 0) { e.respondWith(staleWhileRevalidate(request, APP_SHELL)); return; }

  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      e.respondWith((async () => {
        try { return await fetch(request); }
        catch (err) { return (await caches.match('./index.html')) || (await caches.match('./offline.html')); }
      })());
      return;
    }
    e.respondWith(cacheFirst(request, APP_SHELL));
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) { return hit || new Response('', { status: 504 }); }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req);
    if (hit) return hit;
    return new Response(JSON.stringify({ code: 504, status: 'OFFLINE' }), { headers: { 'Content-Type': 'application/json' }, status: 504 });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const net = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
  return hit || (await net) || new Response('', { status: 504 });
}

/* Optional web-push hooks (require server + VAPID keys in production) */
self.addEventListener('push', (e) => {
  let data = { title: 'Kurani', body: 'Ajeti i dites' };
  try { data = e.data.json(); } catch (err) {}
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png'
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('./'));
});

/* ===== PWA Widgets (Windows 11 widgets board) · Ajeti i ditës ===== */
const WIDGET_AYAHS = [
  { ar:"وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ", tr:"Ne shpallim nga Kurani atë që është shërim dhe mëshirë për besimtarët.", ref:"El-Isra 17:82" },
  { ar:"إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا", tr:"Vërtet, pas vështirësisë vjen lehtësimi.", ref:"Esh-Sherh 94:6" },
  { ar:"فَٱذْكُرُونِىٓ أَذْكُرْكُمْ", tr:"Më kujtoni Mua, që t'ju kujtoj Unë juve.", ref:"El-Bekare 2:152" },
  { ar:"وَقُل رَّبِّ زِدْنِى عِلْمًا", tr:"Thuaj: Zoti im, shtoma dijen!", ref:"Ta-Ha 20:114" },
  { ar:"أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ", tr:"Vërtet, vetëm me përkujtimin e Allahut qetësohen zemrat.", ref:"Er-Ra'd 13:28" },
  { ar:"وَٱللَّهُ خَيْرٌ حَٰفِظًا ۖ وَهُوَ أَرْحَمُ ٱلرَّٰحِمِينَ", tr:"Allahu është Mbrojtësi më i mirë dhe Ai është më Mëshiruesi i mëshiruesve.", ref:"Jusuf 12:64" },
  { ar:"رَبَّنَآ ءَاتِنَا فِى ٱلدُّنْيَا حَسَنَةً وَفِى ٱلْءَاخِرَةِ حَسَنَةً", tr:"Zoti ynë, na jep të mira në këtë botë dhe të mira në botën tjetër.", ref:"El-Bekare 2:201" },
  { ar:"وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", tr:"Ai është me ju kudo që të jeni.", ref:"El-Hadid 57:4" },
  { ar:"فَٱصْبِرْ صَبْرًا جَمِيلًا", tr:"Andaj, duro me një durim të bukur.", ref:"El-Mearixh 70:5" },
  { ar:"وَبَشِّرِ ٱلصَّٰبِرِينَ", tr:"Dhe përgëzoji të durueshmit!", ref:"El-Bekare 2:155" }
];
async function updateAllWidgets(){
  if(!('widgets' in self)) return;
  try{
    const tag='ayah-daily';
    const widget = await self.widgets.getByTag(tag);
    if(!widget) return;
    const day = Math.floor(Date.now()/864e5);
    const v = WIDGET_AYAHS[day % WIDGET_AYAHS.length];
    let tmpl='{}';
    try{ tmpl = await (await fetch('widget-ayah.json')).text(); }catch(e){}
    await self.widgets.updateByTag(tag, { template: tmpl, data: JSON.stringify({ ayah_ar:v.ar, ayah_tr:v.tr, ref:v.ref }) });
  }catch(e){}
}
self.addEventListener('widgetinstall', e=> e.waitUntil(updateAllWidgets()));
self.addEventListener('widgetresume', e=> e.waitUntil(updateAllWidgets()));
self.addEventListener('periodicsync', e=>{ if(e.tag==='ayah-widget-sync') e.waitUntil(updateAllWidgets()); });
