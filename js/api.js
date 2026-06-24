/* ===== Kurani · Data layer (AlQuran.cloud API + IndexedDB cache) ===== */
const API_BASE = 'https://api.alquran.cloud/v1';

// Editions used for the reader (Arabic + Albanian + English).
const ED_AR = 'quran-uthmani';
const ED_SQ = 'sq.ahmeti';   // Sherif Ahmeti
const ED_EN = 'en.sahih';    // Saheeh International
const ED_TAFSIR = 'ar.muyassar'; // Tafsir al-Muyassar (Arabic)

// Reciters available on the islamic.network CDN via AlQuran.cloud audio editions.
const RECITERS = [
  { id:'ar.alafasy',            name:'Mishary Rashid Alafasy' },
  { id:'ar.abdulbasitmurattal', name:'Abdul Basit (Murattal)' },
  { id:'ar.mahermuaiqly',       name:'Maher Al Muaiqly' },
  { id:'ar.minshawi',           name:'Mohamed Siddiq El-Minshawi' },
  { id:'ar.abdurrahmaansudais', name:'Abdurrahman As-Sudais' },
  { id:'ar.saoodshuraim',       name:'Saud Al-Shuraim' },
  { id:'ar.husary',             name:'Mahmoud Khalil Al-Husary' },
  { id:'ar.hudhaify',           name:'Ali Al-Hudhaify' },
  { id:'ar.shaatree',           name:'Abu Bakr Al-Shatri' },
];

/* ---------- IndexedDB tiny wrapper ---------- */
const DB = (() => {
  let dbp;
  function open(){
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open('kurani-db', 1);
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('surahs')) db.createObjectStore('surahs');
        if (!db.objectStoreNames.contains('audio')) db.createObjectStore('audio');
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function get(store, key){
    const db = await open();
    return new Promise((res, rej) => {
      const tx = db.transaction(store, 'readonly').objectStore(store).get(key);
      tx.onsuccess = () => res(tx.result); tx.onerror = () => rej(tx.error);
    });
  }
  async function set(store, key, val){
    const db = await open();
    return new Promise((res, rej) => {
      const tx = db.transaction(store, 'readwrite').objectStore(store).put(val, key);
      tx.onsuccess = () => res(true); tx.onerror = () => rej(tx.error);
    });
  }
  async function clear(store){
    const db = await open();
    return new Promise((res, rej) => {
      const tx = db.transaction(store, 'readwrite').objectStore(store).clear();
      tx.onsuccess = () => res(true); tx.onerror = () => rej(tx.error);
    });
  }
  return { get, set, clear, open };
})();

async function fetchJSON(url){
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  if (j.code && j.code !== 200) throw new Error('API ' + j.code);
  return j.data;
}

/* ---------- Public API ---------- */
const Quran = {
  async surahList(){
    const cached = await DB.get('kv', 'surahList');
    if (cached) { this._refreshList(); return cached; }
    const data = await fetchJSON(`${API_BASE}/surah`);
    await DB.set('kv', 'surahList', data);
    return data;
  },
  async _refreshList(){
    try { const d = await fetchJSON(`${API_BASE}/surah`); await DB.set('kv','surahList',d); } catch(e){}
  },

  // Merged surah: { number, name, englishName, arabic[], sq[], en[], ayahNumbers[] (global), juz[] }
  async surah(n){
    const key = 'surah-' + n;
    const cached = await DB.get('surahs', key);
    if (cached) return cached;
    const eds = `${ED_AR},${ED_SQ},${ED_EN}`;
    const data = await fetchJSON(`${API_BASE}/surah/${n}/editions/${eds}`);
    const [ar, sq, en] = data;
    const merged = {
      number: ar.number, name: ar.name, englishName: ar.englishName,
      englishNameTranslation: ar.englishNameTranslation,
      revelationType: ar.revelationType, numberOfAyahs: ar.numberOfAyahs,
      ayahs: ar.ayahs.map((a, i) => ({
        n: a.numberInSurah, global: a.number, juz: a.juz, page: a.page,
        ar: a.text, sq: sq.ayahs[i]?.text || '', en: en.ayahs[i]?.text || '',
        sajda: !!a.sajda
      }))
    };
    await DB.set('surahs', key, merged);
    return merged;
  },

  // Tafsir (Arabic, al-Muyassar) for a whole surah, cached.
  async tafsir(n){
    const key = 'tafsir-' + n;
    const cached = await DB.get('kv', key);
    if (cached) return cached;
    const data = await fetchJSON(`${API_BASE}/surah/${n}/${ED_TAFSIR}`);
    const map = {};
    (data.ayahs || []).forEach(a => { map[a.numberInSurah] = a.text; });
    await DB.set('kv', key, map);
    return map;
  },

  // Per-ayah audio URLs for a surah by reciter edition.
  async surahAudio(n, reciter){
    const data = await fetchJSON(`${API_BASE}/surah/${n}/${reciter}`);
    return (data.ayahs || []).map(a => a.audio || a.audioSecondary?.[0]).filter(Boolean);
  },

  // Search across the whole Quran in a given edition.
  async search(keyword, edition){
    const url = `${API_BASE}/search/${encodeURIComponent(keyword)}/all/${edition}`;
    try {
      const data = await fetchJSON(url);
      return data.matches || [];
    } catch (e) { return []; }
  },

  reciters: RECITERS,
  isOnline(){ return navigator.onLine; }
};
