/* ==========================================================================
   Quran data layer.
   The complete text ships with the app under /data — nothing here depends on
   a third-party API being up. Only tafsir and recitation audio are remote,
   and both degrade gracefully.
   ========================================================================== */

import { fold, foldAr, hasArabic } from './dom.js';

const BASE = new URL('../../', import.meta.url).href; // app root, deploy-path agnostic

const memSurah = new Map();
let metaPromise = null;
let meta = null;
let searchIndex = null;
let searchPromise = null;
let dailyPool = null;

/* ------------------------------------------------------------------ errors */

export class DataError extends Error {
  constructor(kind, cause) {
    super(kind);
    this.kind = kind;      // 'offline' | 'network' | 'bad'
    this.cause = cause;
  }
}

async function getJSON(path, { timeout = 15000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(BASE + path, { signal: ctrl.signal });
    if (!res.ok) throw new DataError(res.status === 404 ? 'bad' : 'network');
    return await res.json();
  } catch (err) {
    if (err instanceof DataError) throw err;
    throw new DataError(navigator.onLine ? 'network' : 'offline', err);
  } finally {
    clearTimeout(timer);
  }
}

/* -------------------------------------------------------------------- meta */

export function loadMeta() {
  if (meta) return Promise.resolve(meta);
  if (!metaPromise) {
    metaPromise = getJSON('data/meta.json').then((m) => {
      meta = m;
      m.bySlug = new Map(m.surahs.map((s) => [s.slug, s]));
      return m;
    }).catch((e) => { metaPromise = null; throw e; });
  }
  return metaPromise;
}

export const getMeta = () => meta;
export const surahs = () => meta?.surahs || [];
export const surahInfo = (n) => meta?.surahs?.[Number(n) - 1] || null;
export const bySlug = (slug) => meta?.bySlug?.get(String(slug).toLowerCase()) || null;
export const juzList = () => meta?.juz || [];
export const TOTAL_AYAHS = 6236;

/** Resolve a surah from a slug or a number. */
export function resolveSurah(token) {
  if (token == null) return null;
  const asNum = Number(token);
  if (Number.isInteger(asNum) && asNum >= 1 && asNum <= 114) return surahInfo(asNum);
  return bySlug(token);
}

/** Global ayah number (1…6236) for surah:ayah. */
export function globalNo(s, a) {
  const info = surahInfo(s);
  return info ? info.start + a - 1 : 0;
}

/** Convert a global ayah number back to { s, a }. */
export function fromGlobal(g) {
  const list = surahs();
  for (let i = list.length - 1; i >= 0; i--) {
    if (g >= list[i].start) return { s: list[i].n, a: g - list[i].start + 1 };
  }
  return { s: 1, a: 1 };
}

/** Which juz contains this global ayah number. */
export function juzOf(g) {
  const list = juzList();
  for (let i = list.length - 1; i >= 0; i--) if (g >= list[i].g) return list[i].n;
  return 1;
}

/* ------------------------------------------------------------------- surah */

/**
 * Surahs are stored in a handful of chunk files rather than 114 separate ones,
 * so the repository stays under GitHub's 100-file web-upload limit. Each surah
 * sits wholly inside one chunk, so opening a surah is still a single request.
 */
export function partCount() { return window.__meta?.parts?.count || 1; }

function partFor(n) {
  const map = window.__meta?.parts?.map;
  const p = map?.[Number(n) - 1];
  return p || 1;
}

export function partPath(i) { return `data/quran/${i}.json`; }

const memPart = new Map();

async function loadPart(i) {
  if (memPart.has(i)) return memPart.get(i);
  const promise = getJSON(partPath(i)).catch((err) => { memPart.delete(i); throw err; });
  memPart.set(i, promise);
  // Two chunks in memory is plenty; a third eviction keeps the footprint small.
  if (memPart.size > 2) memPart.delete(memPart.keys().next().value);
  return promise;
}

/** Load one surah with every edition. Cached in memory + by the service worker. */
export async function loadSurah(n) {
  const key = Number(n);
  if (memSurah.has(key)) return memSurah.get(key);
  const part = await loadPart(partFor(key));
  const data = part[String(key)];
  if (!data) throw new DataError('bad');
  if (memSurah.size > 12) memSurah.delete(memSurah.keys().next().value);
  memSurah.set(key, data);
  return data;
}

export const isSurahCached = (n) => memSurah.has(Number(n));

/** A single ayah across editions. */
export async function loadAyah(s, a) {
  const d = await loadSurah(s);
  const i = a - 1;
  if (i < 0 || i >= d.count) throw new DataError('bad');
  return { s: Number(s), a: Number(a), ar: d.ar[i], sq: d.sq[i], en: d.en[i], tl: d.tl[i] };
}

/* ---------------------------------------------------------------- daily ayah */

async function loadDailyPool() {
  if (dailyPool) return dailyPool;
  const d = await getJSON('data/daily.json');
  dailyPool = d.pool;
  return dailyPool;
}

/** Deterministic verse of the day: the same for everyone, all day, no RNG. */
export async function dailyAyah(date = new Date()) {
  const pool = await loadDailyPool();
  const dayIndex = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 864e5);
  const [s, a] = pool[dayIndex % pool.length];
  return loadAyah(s, a);
}

/* -------------------------------------------------------------------- search */

export function searchIndexReady() { return Boolean(searchIndex); }

export function loadSearchIndex() {
  if (searchIndex) return Promise.resolve(searchIndex);
  if (!searchPromise) {
    searchPromise = getJSON('data/search-index.json', { timeout: 60000 })
      .then((d) => { searchIndex = d.rows; return searchIndex; })
      .catch((e) => { searchPromise = null; throw e; });
  }
  return searchPromise;
}

const REF_RE = /^\s*(\d{1,3})\s*[:.\-\/\s]\s*(\d{1,3})\s*$/;

/**
 * Search the Quran.
 * Returns { kind: 'ref'|'surah'|'text', items: [...] }
 */
export async function search(query, { limit = 60 } = {}) {
  const q = String(query || '').trim();
  if (q.length < 1) return { kind: 'empty', items: [] };

  // 1. Direct reference — "2:255", "2 255", "18/10"
  const ref = q.match(REF_RE);
  if (ref) {
    const s = Number(ref[1]);
    const a = Number(ref[2]);
    const info = surahInfo(s);
    if (info && a >= 1 && a <= info.count) {
      return { kind: 'ref', items: [{ s, a }] };
    }
  }

  // 2. Surah number on its own
  if (/^\d{1,3}$/.test(q)) {
    const s = Number(q);
    if (s >= 1 && s <= 114) return { kind: 'surah', items: [surahInfo(s)] };
  }

  // 3. Surah name
  const folded = fold(q);
  const nameHits = surahs().filter((s) =>
    fold(s.sq).includes(folded) || fold(s.en).includes(folded) ||
    fold(s.meaning).includes(folded) || s.ar.includes(q)
  );

  // 4. Full text
  const rows = await loadSearchIndex();
  const arabic = hasArabic(q);
  const needle = arabic ? foldAr(q) : folded;
  const items = [];
  if (needle.length >= (arabic ? 2 : 2)) {
    for (let i = 0; i < rows.length && items.length < limit; i++) {
      const r = rows[i];
      const field = arabic ? r[4] : (r[2].includes(needle) ? r[2] : r[3]);
      if (field && field.includes(needle)) {
        items.push({ s: r[0], a: r[1], lang: arabic ? 'ar' : (r[2].includes(needle) ? 'sq' : 'en') });
      }
    }
  }
  return { kind: 'text', items, surahs: nameHits.slice(0, 6), query: q, arabic };
}

/** Hydrate search hits with their actual text (only the ones on screen). */
export async function hydrate(hits) {
  const bySurah = new Map();
  for (const h of hits) {
    if (!bySurah.has(h.s)) bySurah.set(h.s, []);
    bySurah.get(h.s).push(h);
  }
  const out = [];
  for (const [s, list] of bySurah) {
    let d;
    try { d = await loadSurah(s); } catch { continue; }
    for (const h of list) {
      const i = h.a - 1;
      out.push({ ...h, ar: d.ar[i], sq: d.sq[i], en: d.en[i], tl: d.tl[i] });
    }
  }
  const order = new Map(hits.map((h, i) => [`${h.s}:${h.a}`, i]));
  return out.sort((x, y) => order.get(`${x.s}:${x.a}`) - order.get(`${y.s}:${y.a}`));
}

/* -------------------------------------------------------------------- audio */

const AUDIO_CDN = 'https://cdn.islamic.network/quran';

export const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', short: 'Alafasy' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', short: 'Al-Husary' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)', short: 'Abdul Basit' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdurrahmaan As-Sudais', short: 'As-Sudais' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly', short: 'Al Muaiqly' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi', short: 'El-Minshawi' },
  { id: 'ar.saoodshuraim', name: 'Saood Ash-Shuraym', short: 'Ash-Shuraym' },
  { id: 'ar.shaatree', name: 'Abu Bakr Ash-Shaatree', short: 'Ash-Shaatree' },
  { id: 'ar.hudhaify', name: 'Ali Al-Hudhaify', short: 'Al-Hudhaify' },
];

export const reciterName = (id) => RECITERS.find((r) => r.id === id)?.name || RECITERS[0].name;
export const reciterShort = (id) => RECITERS.find((r) => r.id === id)?.short || RECITERS[0].short;

/** Per-ayah recitation URL (built locally — no API round-trip). */
export function ayahAudioUrl(s, a, reciter = 'ar.alafasy', bitrate = 128) {
  const g = globalNo(s, a);
  return `${AUDIO_CDN}/audio/${bitrate}/${reciter}/${g}.mp3`;
}

/** Whole-surah recitation URL. */
export function surahAudioUrl(s, reciter = 'ar.alafasy', bitrate = 128) {
  return `${AUDIO_CDN}/audio-surah/${bitrate}/${reciter}/${Number(s)}.mp3`;
}

/* ------------------------------------------------------------------- tafsir */

const TAFSIR_API = 'https://api.alquran.cloud/v1/ayah';
const tafsirCache = new Map();

export const TAFSIR_EDITION = { id: 'ar.muyassar', name: 'Tafsir al-Muyassar', lang: 'ar' };

/**
 * Tafsir is fetched on demand and is the one feature that needs the network.
 * Everything else in the app works offline.
 */
export async function loadTafsir(s, a) {
  const key = `${s}:${a}`;
  if (tafsirCache.has(key)) return tafsirCache.get(key);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(`${TAFSIR_API}/${s}:${a}/${TAFSIR_EDITION.id}`, { signal: ctrl.signal });
    if (!res.ok) throw new DataError('network');
    const json = await res.json();
    const text = json?.data?.text;
    if (!text) throw new DataError('bad');
    const value = { text, edition: TAFSIR_EDITION };
    tafsirCache.set(key, value);
    return value;
  } catch (err) {
    throw new DataError(navigator.onLine ? 'network' : 'offline', err);
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------------------------------------------------- offline download */

/**
 * Warm the cache with every surah file plus the search index, reporting
 * progress. Only claims "offline ready" once it has actually succeeded.
 */
export async function downloadAll(onProgress, signal) {
  const files = ['data/search-index.json', 'data/daily.json', 'data/meta.json'];
  for (let i = 1; i <= partCount(); i++) files.push(partPath(i));
  let done = 0;
  let failed = 0;
  const CONCURRENCY = 6;
  const queue = files.slice();

  async function worker() {
    while (queue.length) {
      if (signal?.aborted) return;
      const path = queue.shift();
      try {
        const res = await fetch(BASE + path, { cache: 'reload' });
        if (!res.ok) failed++;
        else await res.arrayBuffer();
      } catch { failed++; }
      done++;
      onProgress?.(done / files.length, done, files.length);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (signal?.aborted) throw new DataError('aborted');
  if (failed > 0) throw new DataError(navigator.onLine ? 'network' : 'offline');
  return true;
}

/** True when every surah file is present in the cache storage. */
export async function isFullyCached() {
  if (!('caches' in window)) return false;
  try {
    const names = await caches.keys();
    const dataCaches = names.filter((n) => n.includes('data'));
    if (!dataCaches.length) return false;
    for (const name of dataCaches) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      const parts = keys.filter((r) => /\/data\/quran\/\d+\.json/.test(r.url));
      if (parts.length >= partCount()) return true;
    }
    return false;
  } catch { return false; }
}

/* ---------------------------------------------------------------- formatting */

const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
/** Arabic-Indic digits, used for the end-of-ayah ornament. */
export const arabicNumber = (n) => String(n).split('').map((d) => AR_DIGITS[Number(d)] ?? d).join('');

/** "El-Bekare · 2:255" */
export function reference(s, a, { withName = true } = {}) {
  const info = surahInfo(s);
  const ref = `${s}:${a}`;
  return withName && info ? `${info.sq} · ${ref}` : ref;
}

export const BASMALA = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';

/** Surahs 1 and 9 do not get a separate basmala line. */
export const showsBasmala = (n) => Number(n) !== 1 && Number(n) !== 9;
