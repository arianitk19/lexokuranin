/* ==========================================================================
   Storage — versioned, migration-safe, namespaced under `kurani.`
   The legacy namespace is preserved on purpose: existing users keep every
   bookmark, memorised ayah, setting and statistic.
   ========================================================================== */

const NS = 'kurani.';
const SCHEMA_KEY = 'schema';
const SCHEMA = 3;

let memoryFallback = null; // used when localStorage throws (private mode, etc.)

function readRaw(key) {
  try {
    const v = localStorage.getItem(NS + key);
    if (v !== null) return v;
  } catch { /* fall through */ }
  return memoryFallback ? memoryFallback.get(key) ?? null : null;
}

function writeRaw(key, value) {
  try {
    localStorage.setItem(NS + key, value);
    return true;
  } catch {
    if (!memoryFallback) memoryFallback = new Map();
    memoryFallback.set(key, value);
    return false;
  }
}

function removeRaw(key) {
  try { localStorage.removeItem(NS + key); } catch { /* ignore */ }
  memoryFallback?.delete(key);
}

export const storage = {
  get(key, fallback) {
    const raw = readRaw(key);
    if (raw === null) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  },
  set(key, value) { return writeRaw(key, JSON.stringify(value)); },
  remove(key) { removeRaw(key); },
  keys() {
    try {
      return Object.keys(localStorage).filter((k) => k.startsWith(NS)).map((k) => k.slice(NS.length));
    } catch { return []; }
  },
  /** Bytes used by this app's keys (approximate). */
  usage() {
    let n = 0;
    for (const k of this.keys()) n += (readRaw(k) || '').length + k.length;
    return n * 2;
  },
};

/* ---------------------------------------------------------------- settings */

export const DEFAULT_SETTINGS = {
  uiLang: 'sq',            // sq | en | ar
  theme: 'light',          // auto | light | dark | sepia | night
  fontSize: 30,            // Arabic px
  lineHeight: 2.1,
  arFont: 'amiri',         // amiri | scheherazade | naskh
  ayahSpacing: 26,
  showSq: true,
  showEn: false,
  showTranslit: false,
  reciter: 'ar.alafasy',
  autoplayNext: true,
  continuousPlay: true,
  playbackRate: 1,
  repeatMode: 'off',       // off | ayah | range | surah
  repeatCount: 3,
  dailyReminder: false,
  reminderTime: '07:30',
  reduceMotion: false,
  focusMode: false,
  dailyGoalMinutes: 10,
  seenIntro: false,
  installDismissed: 0,
  qiblaLat: null,          // number | null — set by geolocation or a manual pick
  qiblaLng: null,
  qiblaSource: null,       // null | 'geo' | 'city'
  qiblaLabel: '',          // display name, e.g. a city — '' when source is 'geo'
  // The live-compass toggle is deliberately NOT persisted: device-orientation
  // permission (especially on iOS) does not reliably survive a reload, so
  // remembering "on" here could show a toggle that silently fails to re-arm.
};

export const THEMES = ['auto', 'light', 'dark', 'sepia', 'night'];
export const UI_LANGS = ['sq', 'en', 'ar'];

export function loadSettings() {
  const saved = storage.get('settings', {});
  const s = { ...DEFAULT_SETTINGS, ...(saved && typeof saved === 'object' ? saved : {}) };
  if (!THEMES.includes(s.theme)) s.theme = 'light';
  if (!UI_LANGS.includes(s.uiLang)) s.uiLang = 'sq';
  s.fontSize = clamp(Number(s.fontSize) || 30, 20, 56);
  s.lineHeight = clamp(Number(s.lineHeight) || 2.1, 1.6, 3.2);
  s.ayahSpacing = clamp(Number(s.ayahSpacing) || 26, 12, 56);
  s.dailyGoalMinutes = clamp(Number(s.dailyGoalMinutes) || 10, 1, 240);
  s.playbackRate = clamp(Number(s.playbackRate) || 1, 0.5, 2);
  const latOk = Number.isFinite(s.qiblaLat) && s.qiblaLat >= -90 && s.qiblaLat <= 90;
  const lngOk = Number.isFinite(s.qiblaLng) && s.qiblaLng >= -180 && s.qiblaLng <= 180;
  if (!latOk || !lngOk) { s.qiblaLat = null; s.qiblaLng = null; s.qiblaSource = null; s.qiblaLabel = ''; }
  return s;
}

export function saveSettings(s) { storage.set('settings', s); }

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/* --------------------------------------------------------------- bookmarks */
/* Shape: { s, a, ts, cat, } — cat: saved | memorize | favorite            */

export const CATEGORIES = ['saved', 'memorize', 'favorite'];

export const bookmarks = {
  all() {
    const list = storage.get('bookmarks', []);
    return Array.isArray(list) ? list : [];
  },
  has(s, a) { return this.all().some((b) => b.s === s && b.a === a); },
  find(s, a) { return this.all().find((b) => b.s === s && b.a === a) || null; },
  toggle(s, a, cat = 'saved') {
    const list = this.all();
    const i = list.findIndex((b) => b.s === s && b.a === a);
    if (i >= 0) { list.splice(i, 1); storage.set('bookmarks', list); return false; }
    list.unshift({ s, a, ts: Date.now(), cat });
    storage.set('bookmarks', list);
    return true;
  },
  setCategory(s, a, cat) {
    const list = this.all();
    const b = list.find((x) => x.s === s && x.a === a);
    if (b) { b.cat = cat; storage.set('bookmarks', list); }
  },
  remove(s, a) {
    storage.set('bookmarks', this.all().filter((b) => !(b.s === s && b.a === a)));
  },
  clear() { storage.set('bookmarks', []); },
};

/* ------------------------------------------------------------------- notes */
/* Shape: { "s:a": { text, ts } }                                            */

export const notes = {
  all() { const v = storage.get('notes', {}); return v && typeof v === 'object' ? v : {}; },
  get(s, a) { return this.all()[`${s}:${a}`] || null; },
  set(s, a, text) {
    const all = this.all();
    const key = `${s}:${a}`;
    const clean = String(text || '').trim();
    if (!clean) delete all[key];
    else all[key] = { text: clean, ts: Date.now() };
    storage.set('notes', all);
    return Boolean(clean);
  },
  remove(s, a) { this.set(s, a, ''); },
  count() { return Object.keys(this.all()).length; },
};

/* ----------------------------------------------------------------- memorize */
/* Shape: { "s:a": { stage, ts, due, streak, reviews } }
   stage: 0 new · 1 learning · 2 review · 3 memorised                        */

export const STAGE = { NEW: 0, LEARNING: 1, REVIEW: 2, STRONG: 3 };
const INTERVAL_DAYS = [0, 1, 3, 9];

export const hifz = {
  all() { const v = storage.get('hifz', {}); return v && typeof v === 'object' ? v : {}; },
  get(s, a) { return this.all()[`${s}:${a}`] || null; },
  has(s, a) { return Boolean(this.get(s, a)); },
  isStrong(s, a) { const e = this.get(s, a); return Boolean(e && e.stage >= STAGE.STRONG); },
  /** Record a review outcome; `ok` promotes, otherwise demotes one step. */
  review(s, a, ok) {
    const all = this.all();
    const key = `${s}:${a}`;
    const cur = all[key] || { stage: STAGE.NEW, ts: Date.now(), streak: 0, reviews: 0 };
    cur.stage = clamp(ok ? cur.stage + 1 : cur.stage - 1, STAGE.NEW, STAGE.STRONG);
    cur.streak = ok ? (cur.streak || 0) + 1 : 0;
    cur.reviews = (cur.reviews || 0) + 1;
    cur.ts = Date.now();
    cur.due = Date.now() + INTERVAL_DAYS[cur.stage] * 864e5;
    all[key] = cur;
    storage.set('hifz', all);
    return cur;
  },
  setStage(s, a, stage) {
    const all = this.all();
    const key = `${s}:${a}`;
    if (stage == null) { delete all[key]; }
    else {
      const cur = all[key] || { ts: Date.now(), streak: 0, reviews: 0 };
      cur.stage = clamp(stage, STAGE.NEW, STAGE.STRONG);
      cur.ts = Date.now();
      cur.due = Date.now() + INTERVAL_DAYS[cur.stage] * 864e5;
      all[key] = cur;
    }
    storage.set('hifz', all);
  },
  toggleStrong(s, a) {
    const on = !this.isStrong(s, a);
    this.setStage(s, a, on ? STAGE.STRONG : null);
    return on;
  },
  remove(s, a) { this.setStage(s, a, null); },
  counts() {
    const c = { total: 0, new: 0, learning: 0, review: 0, strong: 0, due: 0 };
    const now = Date.now();
    for (const e of Object.values(this.all())) {
      c.total++;
      if (e.stage >= STAGE.STRONG) c.strong++;
      else if (e.stage === STAGE.REVIEW) c.review++;
      else if (e.stage === STAGE.LEARNING) c.learning++;
      else c.new++;
      if ((e.due || 0) <= now) c.due++;
    }
    return c;
  },
  /** Ayahs whose review is due, soonest first. */
  queue(limit = 20) {
    const now = Date.now();
    return Object.entries(this.all())
      .map(([k, v]) => { const [s, a] = k.split(':').map(Number); return { s, a, ...v }; })
      .filter((e) => (e.due || 0) <= now && e.stage < STAGE.STRONG)
      .sort((x, y) => (x.due || 0) - (y.due || 0))
      .slice(0, limit);
  },
  clear() { storage.set('hifz', {}); },
};

/* ------------------------------------------------------------------- stats */

const today = () => new Date().toISOString().slice(0, 10);
const dayBefore = (iso, n = 1) => new Date(new Date(iso + 'T00:00:00Z').getTime() - n * 864e5).toISOString().slice(0, 10);

export const stats = {
  data() {
    const d = storage.get('stats', null);
    const base = { minutes: 0, seconds: 0, ayahs: 0, surahs: [], days: [], daily: {}, streak: 0, lastDay: null, listenSeconds: 0 };
    if (!d || typeof d !== 'object') return base;
    return { ...base, ...d, surahs: Array.isArray(d.surahs) ? d.surahs : [], days: Array.isArray(d.days) ? d.days : [], daily: d.daily || {} };
  },
  save(d) { storage.set('stats', d); },
  today,
  touchDay() {
    const d = this.data();
    const t = today();
    if (d.lastDay === t) return d;
    d.streak = d.lastDay === dayBefore(t) ? (d.streak || 0) + 1 : 1;
    d.lastDay = t;
    if (!d.days.includes(t)) d.days.push(t);
    if (d.days.length > 400) d.days = d.days.slice(-400);
    this.save(d);
    return d;
  },
  addSeconds(sec, kind = 'read') {
    if (!sec || sec < 1) return;
    const d = this.touchDay();
    const t = today();
    d.seconds = (d.seconds || 0) + sec;
    d.minutes = Math.round((d.seconds || 0) / 60);
    if (kind === 'listen') d.listenSeconds = (d.listenSeconds || 0) + sec;
    const day = d.daily[t] || { sec: 0, ayahs: 0 };
    day.sec += sec;
    d.daily[t] = day;
    this.save(d);
  },
  addAyahs(n) {
    if (!n) return;
    const d = this.touchDay();
    const t = today();
    d.ayahs = (d.ayahs || 0) + n;
    const day = d.daily[t] || { sec: 0, ayahs: 0 };
    day.ayahs += n;
    d.daily[t] = day;
    this.save(d);
  },
  readSurah(n) {
    const d = this.data();
    if (!d.surahs.includes(n)) { d.surahs.push(n); this.save(d); }
  },
  todaySeconds() { return this.data().daily[today()]?.sec || 0; },
  lastDays(n = 7) {
    const d = this.data();
    const out = [];
    let cur = today();
    for (let i = 0; i < n; i++) { out.unshift({ date: cur, ...(d.daily[cur] || { sec: 0, ayahs: 0 }) }); cur = dayBefore(cur); }
    return out;
  },
  reset() { storage.set('stats', null); storage.remove('stats'); },
};

/* -------------------------------------------------------------- last read */

export const lastRead = {
  get() { return storage.get('lastRead', null); },
  set(v) { storage.set('lastRead', v); },
  clear() { storage.remove('lastRead'); },
};

/* ------------------------------------------------------------ recent search */

export const recentSearch = {
  all() { const v = storage.get('recentSearch', []); return Array.isArray(v) ? v : []; },
  add(q) {
    const t = String(q || '').trim();
    if (t.length < 2) return;
    const list = this.all().filter((x) => x.toLowerCase() !== t.toLowerCase());
    list.unshift(t);
    storage.set('recentSearch', list.slice(0, 12));
  },
  clear() { storage.set('recentSearch', []); },
};

/* ---------------------------------------------------------------- migration */

export function migrate() {
  const from = storage.get(SCHEMA_KEY, 0);
  if (from >= SCHEMA) return;

  // v0 → v1: settings gained new keys (handled by merge), bookmarks gain a category.
  const bm = storage.get('bookmarks', []);
  if (Array.isArray(bm) && bm.some((b) => b && !b.cat)) {
    storage.set('bookmarks', bm.filter(Boolean).map((b) => ({ cat: 'saved', ts: b.ts || Date.now(), ...b })));
  }

  // v0 → v1: hifz entries were `{ "s:a": timestamp }` — promote to memorised.
  const hz = storage.get('hifz', {});
  if (hz && typeof hz === 'object') {
    let changed = false;
    for (const [k, v] of Object.entries(hz)) {
      if (typeof v === 'number') {
        hz[k] = { stage: STAGE.STRONG, ts: v, due: v, streak: 1, reviews: 1 };
        changed = true;
      }
    }
    if (changed) storage.set('hifz', hz);
  }

  // v1 → v2: stats gained per-day detail and a seconds counter.
  const st = storage.get('stats', null);
  if (st && typeof st === 'object') {
    if (st.seconds == null) st.seconds = Math.round((st.minutes || 0) * 60);
    if (!st.daily) {
      st.daily = {};
      for (const d of st.days || []) st.daily[d] = { sec: 0, ayahs: 0 };
    }
    storage.set('stats', st);
  }

  // v2 → v3: the legacy splash flag is no longer used.
  storage.remove('seenSplash');

  storage.set(SCHEMA_KEY, SCHEMA);
}

/** Remove every app key (used by Settings → delete my data). */
export function wipeAll() {
  for (const k of storage.keys()) storage.remove(k);
  memoryFallback?.clear();
}

/** A JSON export of everything the app stores locally. */
export function exportAll() {
  const out = { app: 'lexo-kuran', schema: SCHEMA, exportedAt: new Date().toISOString(), data: {} };
  for (const k of storage.keys()) out.data[k] = storage.get(k, null);
  return out;
}

export function importAll(payload) {
  if (!payload || payload.app !== 'lexo-kuran' || typeof payload.data !== 'object') {
    throw new Error('invalid');
  }
  for (const [k, v] of Object.entries(payload.data)) storage.set(k, v);
  migrate();
}
