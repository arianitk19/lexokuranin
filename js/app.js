/* ===== Kurani · Application (vanilla ES6+) ===== */
'use strict';

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const el = (tag, cls, html) => { const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; };
const toArabicNum = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

/* ---------- Premium duotone icon system ---------- */
const ICONS = {
  surahs:`<path d="M12 6.4C10.4 4.9 7.9 4.4 5 5v12.4c2.9-.6 5.4-.1 7 1.4 1.6-1.5 4.1-2 7-1.4V5c-2.9-.6-5.4-.1-7 1.4z" fill="rgba(255,255,255,.25)"/><path d="M12 6.4v12.8M5 5c2.9-.6 5.4-.1 7 1.4 1.6-1.5 4.1-2 7-1.4v12.4c-2.9-.6-5.4-.1-7 1.4-1.6-1.5-4.1-2-7-1.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`,
  juz:`<path d="M12 3l8.2 4.1L12 11.2 3.8 7.1 12 3z" fill="rgba(255,255,255,.28)"/><path d="M12 3l8.2 4.1L12 11.2 3.8 7.1 12 3zM3.8 11.6 12 15.7l8.2-4.1M3.8 16.1 12 20.2l8.2-4.1" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/>`,
  search:`<circle cx="11" cy="11" r="6.6" fill="rgba(255,255,255,.22)"/><circle cx="11" cy="11" r="6.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m20.4 20.4-3.7-3.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8.6 9.6a3.4 3.4 0 0 1 2.4-2.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`,
  saved:`<path d="M7 3.2h10c.6 0 1 .5 1 1V20l-6-4-6 4V4.2c0-.5.4-1 1-1z" fill="rgba(255,255,255,.26)"/><path d="M7 3.2h10c.6 0 1 .5 1 1V20l-6-4-6 4V4.2c0-.5.4-1 1-1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`,
  memorize:`<path d="M7 9.2a5 5 0 0 1 10 0c0 2.8-1.1 4.6-1.4 6.8H8.4C8.1 13.8 7 12 7 9.2z" fill="rgba(255,255,255,.24)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9.5 3.4h5M10 3.4c.2.9.7 1.4 2 1.4s1.8-.5 2-1.4M9 19h6M10.2 21.2h3.6" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/>`,
  audio:`<path d="M4 13a8 8 0 0 1 16 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><rect x="3" y="12.6" width="4.4" height="7.4" rx="2.2" fill="rgba(255,255,255,.26)" stroke="currentColor" stroke-width="1.5"/><rect x="16.6" y="12.6" width="4.4" height="7.4" rx="2.2" fill="rgba(255,255,255,.26)" stroke="currentColor" stroke-width="1.5"/>`,
  tafsir:`<path d="M4.5 5.2A2.2 2.2 0 0 1 6.7 3H18v13.4H6.7a2.2 2.2 0 0 0-2.2 2.2z" fill="rgba(255,255,255,.24)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M4.5 18.6A2.2 2.2 0 0 1 6.7 16.4H18V21H6.7a2.2 2.2 0 0 1-2.2-2.4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 7.4h6M8 10.2h4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
  stats:`<path d="M4 20V4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><rect x="7" y="12.5" width="3.2" height="5.5" rx="1.1" fill="rgba(255,255,255,.24)" stroke="currentColor" stroke-width="1.4"/><rect x="12" y="8.5" width="3.2" height="9.5" rx="1.1" fill="rgba(255,255,255,.24)" stroke="currentColor" stroke-width="1.4"/><rect x="17" y="5.5" width="3.2" height="12.5" rx="1.1" fill="rgba(255,255,255,.3)" stroke="currentColor" stroke-width="1.4"/>`,
  learn:`<path d="M12 4.2 21 8.6l-9 4.4-9-4.4 9-4.4z" fill="rgba(255,255,255,.26)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6.5 10.6V15c0 1.1 2.6 2.4 5.5 2.4s5.5-1.3 5.5-2.4v-4.4M21 8.6v4.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  help:`<circle cx="12" cy="12" r="9" fill="rgba(255,255,255,.22)" stroke="currentColor" stroke-width="1.5"/><path d="M9.3 9.3a2.8 2.8 0 0 1 5.4 1c0 1.9-2.6 2.2-2.6 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/>`,
  info:`<circle cx="12" cy="12" r="9" fill="rgba(255,255,255,.22)" stroke="currentColor" stroke-width="1.5"/><path d="M12 11v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="7.6" r="1.1" fill="currentColor"/>`,
  share:`<circle cx="6" cy="12" r="2.4" fill="rgba(255,255,255,.26)" stroke="currentColor" stroke-width="1.5"/><circle cx="17.5" cy="6.5" r="2.4" fill="rgba(255,255,255,.26)" stroke="currentColor" stroke-width="1.5"/><circle cx="17.5" cy="17.5" r="2.4" fill="rgba(255,255,255,.26)" stroke="currentColor" stroke-width="1.5"/><path d="m8.1 10.9 7.3-3.6M8.1 13.1l7.3 3.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  moon:`<path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z" fill="rgba(255,255,255,.26)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M17 4.5l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4L15.1 6l1.4-.5z" fill="currentColor"/>`,
};
function svgIcon(name, size=22){ return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${ICONS[name]||''}</svg>`; }
// Decorative 8-point Islamic star pattern (inline SVG overlay)
const STAR_PATTERN = `<svg class="absolute inset-0 w-full h-full" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="opacity:.10"><defs><pattern id="kp" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(0)"><path d="M20 4l4.2 7.6L32 8l-3.6 7.8L36 20l-7.6 4.2L32 32l-7.8-3.6L20 36l-4.2-7.6L8 32l3.6-7.8L4 20l7.6-4.2L8 8l7.8 3.6z" fill="none" stroke="#fff" stroke-width="1.1"/></pattern></defs><rect width="120" height="120" fill="url(#kp)"/></svg>`;

/* ---------- Localized surah name / meaning ----------
   API gives only the transliterated name + English meaning. In Albanian mode we
   use the bundled SURAH_SQ list; in Arabic mode we show the Arabic script. */
function surahName(s){
  const n = s.number;
  if (STATE.uiLang === 'ar') return s.name;
  if (STATE.uiLang === 'sq' && typeof SURAH_SQ !== 'undefined' && SURAH_SQ[n-1]) return SURAH_SQ[n-1][0];
  return s.englishName;
}
function surahMeaning(s){
  const n = s.number;
  if (STATE.uiLang === 'sq' && typeof SURAH_SQ !== 'undefined' && SURAH_SQ[n-1]) return SURAH_SQ[n-1][1];
  if (STATE.uiLang === 'ar') return s.englishName;
  return s.englishNameTranslation;
}

/* ---------- Persistent state ---------- */
const DEFAULTS = {
  uiLang:'sq', theme:'light', fontSize:30, showSq:true, showEn:false, showTranslit:false,
  reciter:'ar.alafasy', dailyReminder:false,
};
function loadSettings(){ try{ return {...DEFAULTS, ...JSON.parse(localStorage.getItem('kurani.settings')||'{}')}; }catch(e){ return {...DEFAULTS}; } }
function saveSettings(){ localStorage.setItem('kurani.settings', JSON.stringify({
  uiLang:STATE.uiLang, theme:STATE.theme, fontSize:STATE.fontSize, showSq:STATE.showSq,
  showEn:STATE.showEn, showTranslit:STATE.showTranslit, reciter:STATE.reciter, dailyReminder:STATE.dailyReminder })); }

const STATE = loadSettings();
window.STATE = STATE;

const Store = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem('kurani.'+k)) ?? d; }catch(e){ return d; } },
  set(k, v){ localStorage.setItem('kurani.'+k, JSON.stringify(v)); },
};

/* ---------- Bookmarks ---------- */
const Bookmarks = {
  all(){ return Store.get('bookmarks', []); },
  key(s,a){ return s+':'+a; },
  has(s,a){ return this.all().some(b => b.s===s && b.a===a); },
  toggle(item){
    let list = this.all();
    const i = list.findIndex(b => b.s===item.s && b.a===item.a);
    if (i>=0){ list.splice(i,1); Store.set('bookmarks', list); return false; }
    list.unshift({...item, ts: Date.now()}); Store.set('bookmarks', list); return true;
  }
};

/* ---------- Memorization ---------- */
const Hifz = {
  all(){ return Store.get('hifz', {}); },
  has(s,a){ return !!this.all()[s+':'+a]; },
  toggle(s,a){ const m=this.all(); const k=s+':'+a; if(m[k]) delete m[k]; else m[k]=Date.now(); Store.set('hifz', m); return !!m[k]; },
  count(){ return Object.keys(this.all()).length; }
};

/* ---------- Stats ---------- */
const Stats = {
  data(){ return Store.get('stats', { minutes:0, ayahs:0, surahs:[], days:[], streak:0, lastDay:null }); },
  save(d){ Store.set('stats', d); },
  today(){ return new Date().toISOString().slice(0,10); },
  touchDay(){
    const d = this.data(); const t = this.today();
    if (d.lastDay === t) return;
    const yest = new Date(Date.now()-864e5).toISOString().slice(0,10);
    d.streak = (d.lastDay === yest) ? (d.streak||0)+1 : 1;
    d.lastDay = t;
    if (!d.days.includes(t)) d.days.push(t);
    this.save(d);
  },
  addMinutes(m){ const d=this.data(); d.minutes=(d.minutes||0)+m; this.save(d); },
  readSurah(n){ const d=this.data(); if(!d.surahs.includes(n)){ d.surahs.push(n); this.save(d); } },
  addAyahs(n){ const d=this.data(); d.ayahs=(d.ayahs||0)+n; this.save(d); },
};

/* ---------- Last read ---------- */
const LastRead = {
  get(){ return Store.get('lastRead', null); },
  set(o){ Store.set('lastRead', o); },
};

/* ---------- UI helpers ---------- */
let toastTimer;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=> t.hidden = true, 1900);
}
function openSheet(html){
  $('#sheetBody').innerHTML = html; $('#sheet').hidden = false;
}
function closeSheet(){ $('#sheet').hidden = true; }
$('#sheetBg').onclick = closeSheet;

/* ---------- Theme & language ---------- */
function applyTheme(){
  document.documentElement.setAttribute('data-theme', STATE.theme);
  const dark = STATE.theme==='dark' || STATE.theme==='night';
  $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a4b38' : '#107A5B');
}
function applyLang(){
  document.documentElement.lang = STATE.uiLang;
  document.documentElement.dir = I18N[STATE.uiLang]._dir;
  $('#langLabel').textContent = I18N[STATE.uiLang]._label;
  $$('[data-i18n]').forEach(n => n.textContent = t(n.dataset.i18n));
}

/* ---------- Router ---------- */
const routes = {};
function route(path, fn){ routes[path] = fn; }
async function render(){
  const hash = location.hash || '#/';
  const [path, ...rest] = hash.slice(2).split('/');
  const view = $('#view'); view.classList.remove('fade-in'); void view.offsetWidth; view.classList.add('fade-in');
  $('#backBtn').hidden = (hash === '#/' || hash === '');
  // active nav
  $$('.navbtn').forEach(b => {
    const active = b.dataset.nav === ('#/' + (path||''));
    b.classList.toggle('accent', active); b.classList.toggle('txt-muted', !active);
  });
  if (hash === '#/continue'){ const lr = LastRead.get(); location.hash = lr ? `#/surah/${lr.s}` : '#/surahs'; return; }
  const fn = routes['#/' + (path||'')] || routes['#/'];
  try { await fn(view, rest); } catch(e){ console.error(e); view.innerHTML = errorBox(); }
  window.scrollTo({top:0, behavior:'instant'});
}
window.addEventListener('hashchange', render);

function errorBox(){
  return `<div class="text-center py-20 fade-in">
    <p class="txt-muted mb-4">${t('err_load')}</p>
    <button onclick="render()" class="bg-accent text-white font-semibold px-5 py-2.5 rounded-full tap">${t('retry')}</button></div>`;
}
function skeleton(rows=6){
  return `<div class="space-y-3 mt-2">${Array.from({length:rows}).map(()=>`<div class="h-16 rounded-2xl skeleton"></div>`).join('')}</div>`;
}
function offlineBanner(){
  return Quran.isOnline() ? '' :
    `<div class="mb-3 text-xs font-semibold txt-muted accent-soft rounded-xl px-3 py-2 flex items-center gap-2">
       <span class="w-2 h-2 rounded-full bg-gold-400" style="background:var(--gold)"></span>${t('offline_note')}</div>`;
}

/* ================= VIEWS ================= */

/* ---- Home ---- */
route('#/', async (view) => {
  $('#barTitle').textContent = 'Kurani';
  const lr = LastRead.get();
  // [href, i18nKey, iconName, gradientFrom, gradientTo]
  const tiles = [
    ['#/surahs','quick_surahs','surahs','#13a06f','#0c6b4a'],
    ['#/juz','quick_juz','juz','#1f9e8f','#0f6e63'],
    ['#/search','quick_search','search','#3b82f6','#2256c4'],
    ['#/bookmarks','quick_saved','saved','#e0a93b','#c07d18'],
    ['#/memorize','quick_memorize','memorize','#8b5cf6','#6033c4'],
    ['#/audio','quick_audio','audio','#f43f7a','#c41d56'],
    ['#/tafsir','quick_tafsir','tafsir','#6366f1','#3f3fc4'],
    ['#/stats','quick_stats','stats','#16a34a','#0d7a35'],
  ];
  const now = new Date();
  const dateStr = now.toLocaleDateString(STATE.uiLang==='ar'?'ar':(STATE.uiLang==='en'?'en-GB':'sq-AL'), {weekday:'long', day:'numeric', month:'long'});
  view.innerHTML = `
    ${offlineBanner()}
    <section class="mt-1 mb-4 flex items-center justify-between">
      <div>
        <p class="accent text-sm font-bold">${t('greeting')}</p>
        <h2 class="text-2xl font-extrabold tracking-tight">${t('subtitle')}</h2>
        <p class="txt-muted text-xs font-medium mt-0.5 capitalize">${dateStr}</p>
      </div>
      <div class="w-12 h-12 rounded-2xl grid place-items-center shrink-0 ring-gold shadow-card" style="background:linear-gradient(135deg,#107A5B,#0a4b38)">
        <svg width="26" height="26" viewBox="0 0 100 100"><path d="M62 20a32 32 0 1 0 0 60 26 26 0 1 1 0-60Z" fill="#f0d696"/><circle cx="70" cy="34" r="3.5" fill="#fff"/></svg>
      </div>
    </section>

    <section class="hero-card rounded-3xl p-5 text-white relative overflow-hidden mb-5 ring-gold"
      style="background:linear-gradient(135deg,#13a06f 0%,#0a4b38 70%)">
      ${STAR_PATTERN}
      <div class="absolute -right-10 -top-10 w-44 h-44 rounded-full" style="background:radial-gradient(circle,rgba(212,175,89,.35),transparent 70%)"></div>
      <div class="relative">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-7 h-7 rounded-lg grid place-items-center" style="background:rgba(255,255,255,.16)">
            <svg width="15" height="15" fill="none" stroke="#f0d696" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
          <p class="text-[11px] font-bold uppercase tracking-[.12em]" style="color:#f0d696">${lr ? t('continue_reading') : t('start_reading')}</p>
        </div>
        <h3 class="text-2xl font-extrabold leading-tight">${lr ? lr.name : 'Al-Fatiha'}</h3>
        <p class="text-white/75 text-sm mt-1">${lr ? `${t('verse')} ${lr.a}` : t('subtitle')}</p>
        <button onclick="location.hash='#/surah/${lr?lr.s:1}'" class="mt-4 bg-white text-brand-700 font-extrabold text-sm px-5 py-3 rounded-2xl tap inline-flex items-center gap-2 shadow-lg">
          ${lr ? t('continue_reading') : t('start_reading')}
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </div>
    </section>

    <section class="surface rounded-3xl border brd shadow-card p-5 mb-5" id="dailyAyah">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs font-bold uppercase tracking-wider accent">${t('ayah_of_day')}</p>
        <svg width="18" height="18" fill="none" stroke="var(--gold)" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6z"/></svg>
      </div>
      ${skeleton(2)}
    </section>

    <button onclick="location.hash='#/learn'" class="tap w-full text-left rounded-3xl p-4 mb-5 flex items-center gap-3 ring-gold relative overflow-hidden shadow-card"
      style="background:linear-gradient(120deg,#1b2b24,#0a4b38)">
      <span class="icon-chip shrink-0" style="--c1:#d4af59;--c2:#bd982f">${svgIcon('learn',24)}</span>
      <span class="flex-1 min-w-0">
        <span class="text-white font-extrabold block">${t('learn_title')}</span>
        <span class="text-white/70 text-xs">${t('learn_sub')}</span>
      </span>
      <svg width="18" height="18" fill="none" stroke="#f0d696" stroke-width="2.4" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
    </button>

    <p class="text-xs font-bold uppercase tracking-wider txt-muted mb-2.5 px-1">${t('quick_surahs')} · ${t('quick_audio')} · ${t('quick_stats')}</p>
    <section class="grid grid-cols-4 gap-3">
      ${tiles.map(([href,key,ic,c1,c2])=>`
        <button onclick="location.hash='${href}'" class="tile tap surface rounded-2xl border brd shadow-card py-3.5 flex flex-col items-center gap-2">
          <span class="icon-chip" style="--c1:${c1};--c2:${c2}">${svgIcon(ic,22)}</span>
          <span class="text-[11px] font-semibold text-center leading-tight">${t(key)}</span>
        </button>`).join('')}
    </section>`;
  loadDailyAyah();
});

async function loadDailyAyah(){
  const box = $('#dailyAyah'); if(!box) return;
  try {
    const list = await Quran.surahList();
    const seed = Math.floor(Date.now()/864e5);
    const sNo = (seed % 114) + 1;
    const s = await Quran.surah(sNo);
    const a = s.ayahs[seed % s.ayahs.length];
    box.querySelector('.skeleton')?.parentElement?.remove();
    const tr = STATE.uiLang==='en' ? a.en : (STATE.uiLang==='ar' ? '' : a.sq);
    box.insertAdjacentHTML('beforeend', `
      <p class="arabic text-2xl mt-1" style="line-height:2.1">${a.ar}</p>
      ${tr?`<p class="mt-3 leading-relaxed">${tr}</p>`:''}
      <p class="txt-muted text-xs mt-3 font-semibold">${surahName(s)} · ${s.name} — ${t('verse')} ${a.n}</p>
      <button onclick="location.hash='#/surah/${sNo}'" class="mt-3 text-sm font-bold accent tap">${t('continue_reading')} →</button>`);
  } catch(e){ box.querySelector('.skeleton')?.parentElement?.replaceWith(el('p','txt-muted text-sm', t('err_load'))); }
}

/* ---- Surah list ---- */
route('#/surahs', async (view) => {
  $('#barTitle').textContent = t('all_surahs');
  view.innerHTML = `${offlineBanner()}
    <div class="sticky top-14 z-30 -mx-4 px-4 py-2 mb-2" style="background:var(--bg)">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 txt-muted" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input id="surahFilter" inputmode="search" placeholder="${t('search_surah')}"
          class="w-full surface border brd rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 ring-brand-400/40" />
      </div>
    </div>
    <div id="surahListBox">${skeleton(8)}</div>`;
  let list;
  try { list = await Quran.surahList(); } catch(e){ $('#surahListBox').innerHTML = errorBox(); return; }
  const box = $('#surahListBox');
  function row(s){
    const rev = s.revelationType==='Meccan' ? t('meccan') : t('medinan');
    return `<button onclick="location.hash='#/surah/${s.number}'" class="tap w-full surface rounded-2xl border brd shadow-card p-3 flex items-center gap-3 text-left">
      <span class="medallion relative w-12 h-12 grid place-items-center shrink-0">
        <svg viewBox="0 0 44 44" class="absolute inset-0" width="48" height="48"><path d="M22 2l4.6 3.1 5.5-.5 1.8 5.2 4.9 2.6-1.4 5.4 3 4.6-3 4.6 1.4 5.4-4.9 2.6-1.8 5.2-5.5-.5L22 42l-4.6-3.1-5.5.5-1.8-5.2-4.9-2.6 1.4-5.4-3-4.6 3-4.6-1.4-5.4 4.9-2.6 1.8-5.2 5.5.5z" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.1" opacity=".9"/></svg>
        <span class="relative text-sm font-extrabold accent">${s.number}</span></span>
      <span class="min-w-0 flex-1">
        <span class="flex items-center gap-2"><span class="font-bold truncate">${surahName(s)}</span>
          <span class="text-[10px] font-semibold accent px-1.5 py-0.5 rounded-md accent-soft">${rev}</span></span>
        <span class="txt-muted text-xs">${surahMeaning(s)} · ${s.numberOfAyahs} ${t('verses')}</span></span>
      <span class="arabic text-2xl accent shrink-0 ml-1">${s.name}</span>
    </button>`;
  }
  const draw = (arr)=> box.innerHTML = `<div class="space-y-2.5">${arr.map(row).join('')}</div>`;
  draw(list);
  $('#surahFilter').addEventListener('input', e=>{
    const q = e.target.value.trim().toLowerCase();
    if(!q){ draw(list); return; }
    draw(list.filter(s => s.englishName.toLowerCase().includes(q) || s.name.includes(q)
      || s.englishNameTranslation.toLowerCase().includes(q) || String(s.number)===q
      || (typeof SURAH_SQ!=='undefined' && SURAH_SQ[s.number-1] && (SURAH_SQ[s.number-1][0].toLowerCase().includes(q) || SURAH_SQ[s.number-1][1].toLowerCase().includes(q)))));
  });
});

/* ---- Juz list ---- */
route('#/juz', async (view) => {
  $('#barTitle').textContent = t('quick_juz');
  // Juz -> starting surah:ayah map (standard 30 juz)
  const starts = [[1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,82],[6,111],[7,88],[8,41],[9,93],[11,6],[12,53],[15,1],[17,1],[18,75],[21,1],[23,1],[25,21],[27,56],[29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1],[78,1]];
  view.innerHTML = `${offlineBanner()}<div class="grid grid-cols-2 gap-2.5">${starts.map((st,i)=>`
    <button onclick="location.hash='#/surah/${st[0]}'" class="tap surface rounded-2xl border brd shadow-card p-4 text-left">
      <p class="text-xs font-bold accent">${t('juz')} ${i+1}</p>
      <p class="txt-muted text-xs mt-1">${t('surah')} ${st[0]} · ${t('verse')} ${st[1]}</p>
    </button>`).join('')}</div>`;
});

/* ---- Reader ---- */
route('#/surah', async (view, rest) => {
  const n = parseInt(rest[0]||'1',10);
  view.innerHTML = `${offlineBanner()}<div class="h-24 rounded-3xl skeleton mb-4"></div>${skeleton(8)}`;
  let s;
  try { s = await Quran.surah(n); } catch(e){ view.innerHTML = errorBox(); return; }
  $('#barTitle').textContent = surahName(s);
  Stats.touchDay(); Stats.readSurah(n); Stats.addAyahs(s.numberOfAyahs);
  LastRead.set({ s:n, a:1, name:surahName(s) });

  const rev = s.revelationType==='Meccan'? t('meccan'):t('medinan');
  const fs = STATE.fontSize;
  const basmala = (n!==1 && n!==9);

  view.innerHTML = `${offlineBanner()}
    <section class="rounded-3xl p-6 text-white text-center shadow-glow relative overflow-hidden mb-5"
      style="background:linear-gradient(135deg,#107A5B,#0a4b38)">
      <div class="absolute inset-0 opacity-10 grid place-items-center"><svg width="200" height="200" viewBox="0 0 40 40"><path fill="#fff" d="M20 2l5 3 6-1 1 6 5 4-3 5 1 6-6 1-4 5-5-3-5 3-4-5-6-1 1-6-3-5 5-4 1-6 6 1z" opacity=".3"/></svg></div>
      <p class="arabic text-3xl relative">${s.name}</p>
      <h2 class="text-xl font-extrabold mt-1 relative">${surahName(s)}</h2>
      <p class="text-white/80 text-sm mt-1 relative">${surahMeaning(s)} · ${rev} · ${s.numberOfAyahs} ${t('verses')}</p>
      <button id="playSurahBtn" class="mt-4 bg-white text-brand-700 font-bold text-sm px-5 py-2.5 rounded-full tap inline-flex items-center gap-2 relative">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>${t('play_surah')}</button>
    </section>
    ${basmala?`<p class="arabic text-2xl text-center mb-5 accent" style="font-size:${fs}px">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>`:''}
    <div id="ayahList" class="space-y-3"></div>`;

  const listBox = $('#ayahList');
  s.ayahs.forEach(a => {
    const saved = Bookmarks.has(n, a.n);
    const mem = Hifz.has(n, a.n);
    const card = el('article', 'surface rounded-2xl border brd shadow-card p-4', '');
    card.id = `ayah-${a.n}`;
    card.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <span class="w-8 h-8 grid place-items-center text-xs font-extrabold accent accent-soft rounded-full">${a.n}</span>
        <div class="flex items-center gap-1">
          <button class="actBtn tap w-8 h-8 grid place-items-center rounded-full surface-2 ${mem?'accent':'txt-muted'}" data-act="mem" title="${t('mark_memorized')}">
            <svg width="16" height="16" fill="${mem?'currentColor':'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m12 2 9 5-9 5-9-5 9-5zM3 12l9 5 9-5"/></svg></button>
          <button class="actBtn tap w-8 h-8 grid place-items-center rounded-full surface-2 txt-muted" data-act="tafsir" title="${t('tafsir')}">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5z"/></svg></button>
          <button class="actBtn tap w-8 h-8 grid place-items-center rounded-full surface-2 txt-muted" data-act="play" title="Play">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
          <button class="actBtn tap w-8 h-8 grid place-items-center rounded-full surface-2 txt-muted" data-act="copy" title="${t('copy')}">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>
          <button class="actBtn tap w-8 h-8 grid place-items-center rounded-full surface-2 ${saved?'accent':'txt-muted'}" data-act="save" title="${t('bookmark')}">
            <svg width="16" height="16" fill="${saved?'currentColor':'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg></button>
        </div>
      </div>
      <p class="arabic mb-3" style="font-size:${fs}px">${a.ar} <span class="accent text-base">۝${toArabicNum(a.n)}</span></p>
      ${STATE.showTranslit?`<p class="txt-muted text-sm italic mb-2"></p>`:''}
      ${STATE.showSq?`<p class="leading-relaxed mb-1"><span class="text-[10px] font-bold txt-muted">SQ</span> ${a.sq}</p>`:''}
      ${STATE.showEn?`<p class="leading-relaxed txt-muted"><span class="text-[10px] font-bold">EN</span> ${a.en}</p>`:''}
      <div class="tafsirBox" hidden></div>`;
    card.querySelectorAll('.actBtn').forEach(b => b.addEventListener('click', () => ayahAction(b.dataset.act, n, a, card, s)));
    listBox.appendChild(card);
  });

  $('#playSurahBtn').onclick = () => Player.playSurah(s, 0);
  // jump to last read ayah if returning
  const lr = LastRead.get();
  if (lr && lr.s===n && lr.a>1){ const tgt = $(`#ayah-${lr.a}`); if(tgt) tgt.scrollIntoView({block:'center'}); }
});

async function ayahAction(act, sNo, a, card, s){
  if (act==='save'){
    const on = Bookmarks.toggle({ s:sNo, a:a.n, name:surahName(s), ar:a.ar, sq:a.sq, en:a.en });
    toast(on? t('saved_ok'): t('removed_ok'));
    const btn = card.querySelector('[data-act="save"]'); btn.classList.toggle('accent', on); btn.classList.toggle('txt-muted', !on);
    btn.querySelector('svg').setAttribute('fill', on?'currentColor':'none');
  } else if (act==='mem'){
    const on = Hifz.toggle(sNo, a.n); toast(on? t('memorized'): t('removed_ok'));
    const btn = card.querySelector('[data-act="mem"]'); btn.classList.toggle('accent', on); btn.classList.toggle('txt-muted', !on);
    btn.querySelector('svg').setAttribute('fill', on?'currentColor':'none');
  } else if (act==='copy'){
    const txt = `${a.ar}\n\n${a.sq}\n\n— ${s.englishName} ${sNo}:${a.n}`;
    try{ await navigator.clipboard.writeText(txt); toast(t('copied_ok')); }catch(e){ toast(t('copied_ok')); }
  } else if (act==='play'){
    const idx = s.ayahs.findIndex(x=>x.n===a.n); Player.playSurah(s, idx);
  } else if (act==='tafsir'){
    const box = card.querySelector('.tafsirBox');
    if(!box.hidden){ box.hidden = true; return; }
    box.hidden = false; box.innerHTML = `<div class="h-10 rounded-xl skeleton mt-2"></div>`;
    try{
      const map = await Quran.tafsir(sNo); const txt = map[a.n];
      box.innerHTML = `<div class="mt-3 pt-3 border-t brd"><p class="text-xs font-bold accent mb-1">${t('tafsir')} — al-Muyassar</p>
        <p class="arabic text-lg" style="line-height:2">${txt||''}</p>${txt?'':`<p class="txt-muted text-sm">${t('tafsir_none')}</p>`}</div>`;
    }catch(e){ box.innerHTML = `<p class="txt-muted text-sm mt-2">${t('tafsir_none')}</p>`; }
  }
}

/* ---- Search ---- */
route('#/search', async (view) => {
  $('#barTitle').textContent = t('quick_search');
  view.innerHTML = `${offlineBanner()}
    <div class="relative mb-4">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 txt-muted" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <input id="q" inputmode="search" placeholder="${t('search_placeholder')}" class="w-full surface border brd rounded-2xl pl-10 pr-4 py-3.5 outline-none focus:ring-2 ring-brand-400/40"/>
    </div>
    <div id="searchRes"><p class="txt-muted text-sm text-center py-10">${t('search_hint')}</p></div>`;
  const input = $('#q'); input.focus();
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer); const q = input.value.trim();
    if(q.length<2){ $('#searchRes').innerHTML = `<p class="txt-muted text-sm text-center py-10">${t('search_hint')}</p>`; return; }
    timer = setTimeout(()=>doSearch(q), 350);
  });
});

async function doSearch(q){
  const box = $('#searchRes'); box.innerHTML = skeleton(5);
  // numeric -> surah jump
  if (/^\d{1,3}$/.test(q)){
    const num = parseInt(q,10);
    if (num>=1 && num<=114){
      try{ const list = await Quran.surahList(); const s = list.find(x=>x.number===num);
        box.innerHTML = surahResultCard(s); return; }catch(e){}
    }
  }
  const edition = STATE.uiLang==='en' ? ED_EN : (STATE.uiLang==='ar' ? ED_AR : ED_SQ);
  let matches = await Quran.search(q, edition);
  if (!matches.length && edition!==ED_EN) matches = await Quran.search(q, ED_EN);
  if (!matches.length){ box.innerHTML = `<p class="txt-muted text-sm text-center py-10">${t('no_results')}</p>`; return; }
  box.innerHTML = `<p class="txt-muted text-xs font-semibold mb-3">${matches.length} ${t('results')}</p>
    <div class="space-y-2.5">${matches.slice(0,60).map(m=>{
      const sNo = m.surah.number, aNo = m.numberInSurah;
      const hi = m.text.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark class="bg-gold-300/60 rounded px-0.5" style="background:rgba(212,175,89,.35)">$1</mark>');
      return `<button onclick="location.hash='#/surah/${sNo}'" class="tap w-full surface rounded-2xl border brd shadow-card p-3.5 text-left">
        <p class="text-xs font-bold accent mb-1">${surahName(m.surah)} · ${sNo}:${aNo}</p>
        <p class="text-sm leading-relaxed">${hi}</p></button>`;
    }).join('')}</div>`;
}
function surahResultCard(s){
  if(!s) return `<p class="txt-muted text-sm text-center py-10">${t('no_results')}</p>`;
  return `<button onclick="location.hash='#/surah/${s.number}'" class="tap w-full surface rounded-2xl border brd shadow-card p-4 flex items-center gap-3 text-left">
    <span class="w-11 h-11 grid place-items-center font-extrabold accent accent-soft rounded-xl">${s.number}</span>
    <span class="flex-1"><span class="font-bold block">${surahName(s)}</span>
      <span class="txt-muted text-xs">${surahMeaning(s)} · ${s.numberOfAyahs} ${t('verses')}</span></span>
    <span class="arabic text-xl accent">${s.name}</span></button>`;
}

/* ---- Bookmarks ---- */
route('#/bookmarks', async (view) => {
  $('#barTitle').textContent = t('bookmarks_title');
  const list = Bookmarks.all();
  if(!list.length){ view.innerHTML = emptyState('M6 3h12v18l-6-4-6 4z', t('bookmarks_empty')); return; }
  view.innerHTML = `<div class="space-y-3">${list.map((b,i)=>`
    <article class="surface rounded-2xl border brd shadow-card p-4">
      <div class="flex items-center justify-between mb-2">
        <button onclick="location.hash='#/surah/${b.s}'" class="text-xs font-bold accent tap">${b.name} · ${b.s}:${b.a}</button>
        <button data-rm="${i}" class="rmBtn tap txt-muted w-8 h-8 grid place-items-center rounded-full surface-2">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>
      </div>
      <p class="arabic text-xl mb-2">${b.ar}</p>
      <p class="text-sm leading-relaxed txt-muted">${STATE.uiLang==='en'?b.en:b.sq}</p>
    </article>`).join('')}</div>`;
  $$('.rmBtn').forEach(btn=>btn.onclick=()=>{ const l=Bookmarks.all(); l.splice(+btn.dataset.rm,1); Store.set('bookmarks',l); toast(t('removed_ok')); render(); });
});

/* ---- Memorize ---- */
route('#/memorize', async (view) => {
  $('#barTitle').textContent = t('memorize_title');
  const m = Hifz.all(); const keys = Object.keys(m);
  const count = keys.length;
  view.innerHTML = `${offlineBanner()}
    <section class="rounded-3xl p-5 text-white shadow-glow mb-5" style="background:linear-gradient(135deg,#107A5B,#0a4b38)">
      <p class="text-xs font-bold uppercase tracking-wider text-gold-300" style="color:#f0d696">${t('mem_progress')}</p>
      <p class="text-4xl font-extrabold mt-1">${count}</p>
      <p class="text-white/80 text-sm">${t('st_memorized')}</p>
      <div class="h-2 rounded-full bg-white/20 mt-3 overflow-hidden"><div class="h-full" style="width:${Math.min(100,(count/6236*100)).toFixed(1)}%;background:#f0d696"></div></div>
      <p class="text-white/70 text-xs mt-2">${count} / 6236</p>
    </section>
    ${count? `<div class="space-y-2.5">${keys.map(k=>{const[s,a]=k.split(':');
      return `<button onclick="location.hash='#/surah/${s}'" class="tap w-full surface rounded-2xl border brd shadow-card p-3.5 flex items-center justify-between text-left">
        <span class="font-semibold text-sm">${t('surah')} ${s} · ${t('verse')} ${a}</span>
        <span class="accent"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="m9 16.2-3.5-3.5L4 14.2 9 19 20 8l-1.4-1.4z"/></svg></span></button>`;
      }).join('')}</div>` : emptyState('M12 2 3 7l9 5 9-5-9-5zM3 12l9 5 9-5', t('mem_empty'))}`;
});

/* ---- Audio (reciter picker + quick play) ---- */
route('#/audio', async (view) => {
  $('#barTitle').textContent = t('quick_audio');
  let list; try{ list = await Quran.surahList(); }catch(e){ view.innerHTML=errorBox(); return; }
  const rec = Quran.reciters.find(r=>r.id===STATE.reciter)||Quran.reciters[0];
  view.innerHTML = `${offlineBanner()}
    <button id="pickReciter" class="tap w-full surface rounded-2xl border brd shadow-card p-4 flex items-center gap-3 mb-4 text-left">
      <span class="w-11 h-11 rounded-xl accent-soft grid place-items-center accent"><svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1v-7h3M3 19a2 2 0 0 0 2 2h1v-7H3z"/></svg></span>
      <span class="flex-1"><span class="text-xs txt-muted font-semibold block">${t('s_reciter')}</span><span class="font-bold">${rec.name}</span></span>
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
    </button>
    <div class="space-y-2.5">${list.map(s=>`
      <div class="surface rounded-2xl border brd shadow-card p-3.5 flex items-center gap-3">
        <button class="aPlay tap w-10 h-10 rounded-full bg-accent text-white grid place-items-center shrink-0" data-s="${s.number}">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
        <button onclick="location.hash='#/surah/${s.number}'" class="flex-1 text-left min-w-0">
          <span class="font-bold block truncate">${s.number}. ${surahName(s)}</span>
          <span class="txt-muted text-xs">${s.numberOfAyahs} ${t('verses')}</span></button>
        <span class="arabic text-lg accent">${s.name}</span>
      </div>`).join('')}</div>`;
  $('#pickReciter').onclick = openReciterSheet;
  $$('.aPlay').forEach(b=>b.onclick=async()=>{ const sNo=+b.dataset.s; const s=await Quran.surah(sNo); Player.playSurah(s,0); });
});

function openReciterSheet(){
  openSheet(`<div class="w-10 h-1 rounded-full mx-auto mb-4" style="background:var(--border)"></div>
    <h3 class="font-extrabold text-lg mb-3">${t('s_reciter')}</h3>
    <div class="space-y-1.5 max-h-[60vh] overflow-auto">${Quran.reciters.map(r=>`
      <button data-r="${r.id}" class="recOpt tap w-full flex items-center justify-between p-3 rounded-xl ${r.id===STATE.reciter?'accent-soft accent font-bold':'surface-2'}">
        <span>${r.name}</span>${r.id===STATE.reciter?'<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="m9 16.2-3.5-3.5L4 14.2 9 19 20 8l-1.4-1.4z"/></svg>':''}
      </button>`).join('')}</div>`);
  $$('.recOpt').forEach(b=>b.onclick=()=>{ STATE.reciter=b.dataset.r; saveSettings(); closeSheet(); toast(b.textContent.trim()); if(location.hash.startsWith('#/audio'))render(); });
}

/* ---- Tafsir landing ---- */
route('#/tafsir', async (view) => {
  $('#barTitle').textContent = t('quick_tafsir');
  let list; try{ list = await Quran.surahList(); }catch(e){ view.innerHTML=errorBox(); return; }
  view.innerHTML = `<p class="txt-muted text-sm mb-4">${t('tafsir')} — al-Muyassar. ${t('search_surah')}</p>
    <div class="space-y-2.5">${list.map(s=>`
      <button onclick="location.hash='#/surah/${s.number}'" class="tap w-full surface rounded-2xl border brd shadow-card p-3.5 flex items-center gap-3 text-left">
        <span class="w-9 h-9 grid place-items-center text-xs font-extrabold accent accent-soft rounded-lg">${s.number}</span>
        <span class="flex-1 font-semibold">${surahName(s)}</span>
        <span class="arabic text-lg accent">${s.name}</span></button>`).join('')}</div>`;
});

/* ---- Stats ---- */
route('#/stats', async (view) => {
  $('#barTitle').textContent = t('stats_title');
  const d = Stats.data();
  const cards = [
    [t('st_time'), `${d.minutes||0}`, t('minutes'),'M12 6v6l4 2','#107A5B'],
    [t('st_streak'), `${d.streak||0}`, t('days'),'M12 2c2 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4','#bd982f'],
    [t('st_surahs'), `${(d.surahs||[]).length}`, '/ 114','M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z','#107A5B'],
    [t('st_ayahs'), `${d.ayahs||0}`, t('verses'),'M5 12h14M12 5v14','#107A5B'],
    [t('st_days'), `${(d.days||[]).length}`, t('days'),'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z','#107A5B'],
    [t('st_memorized'), `${Hifz.count()}`, t('verses'),'m12 2 9 5-9 5-9-5 9-5z','#bd982f'],
  ];
  view.innerHTML = `${offlineBanner()}<div class="grid grid-cols-2 gap-3">${cards.map(([label,val,unit,icon,col])=>`
    <div class="surface rounded-2xl border brd shadow-card p-4">
      <span class="w-9 h-9 rounded-xl grid place-items-center mb-2" style="background:color-mix(in srgb, ${col} 14%, transparent);color:${col}">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="${icon}"/></svg></span>
      <p class="text-2xl font-extrabold">${val} <span class="text-sm txt-muted font-semibold">${unit}</span></p>
      <p class="txt-muted text-xs font-semibold mt-0.5">${label}</p>
    </div>`).join('')}</div>`;
});

/* ---- Settings ---- */
route('#/settings', async (view) => {
  $('#barTitle').textContent = t('settings_title');
  const rec = Quran.reciters.find(r=>r.id===STATE.reciter)||Quran.reciters[0];
  const themes = [['light','theme_light'],['dark','theme_dark'],['sepia','theme_sepia'],['night','theme_night']];
  view.innerHTML = `
    <div class="space-y-5">
      <section>
        <p class="text-xs font-bold uppercase tracking-wider txt-muted mb-2 px-1">${t('s_appearance')}</p>
        <div class="surface rounded-2xl border brd shadow-card divide-y" style="border-color:var(--border)">
          <div class="p-4">
            <p class="font-semibold mb-3">${t('s_theme')}</p>
            <div class="grid grid-cols-4 gap-2">${themes.map(([v,k])=>`
              <button data-theme-opt="${v}" class="seg py-2.5 rounded-xl text-xs font-bold border ${STATE.theme===v?'bg-accent text-white border-transparent':'surface-2 brd txt-muted'}">${t(k)}</button>`).join('')}</div>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between mb-2"><p class="font-semibold">${t('s_fontsize')}</p><span id="fsVal" class="text-sm font-bold accent">${STATE.fontSize}px</span></div>
            <input id="fsRange" type="range" min="22" max="48" value="${STATE.fontSize}" class="w-full accent-brand-500"/>
            <p class="arabic text-center mt-2" id="fsPreview" style="font-size:${STATE.fontSize}px">بِسْمِ اللَّهِ</p>
          </div>
        </div>
      </section>

      <section>
        <p class="text-xs font-bold uppercase tracking-wider txt-muted mb-2 px-1">${t('s_translations')}</p>
        <div class="surface rounded-2xl border brd shadow-card divide-y" style="border-color:var(--border)">
          ${toggleRow('togSq', t('s_show_sq'), STATE.showSq)}
          ${toggleRow('togEn', t('s_show_en'), STATE.showEn)}
        </div>
      </section>

      <section>
        <p class="text-xs font-bold uppercase tracking-wider txt-muted mb-2 px-1">${t('s_reciter')} · ${t('s_language')}</p>
        <div class="surface rounded-2xl border brd shadow-card divide-y" style="border-color:var(--border)">
          <button id="setReciter" class="w-full p-4 flex items-center justify-between tap text-left">
            <span><span class="font-semibold block">${t('s_reciter')}</span><span class="txt-muted text-sm">${rec.name}</span></span>
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>
          <button id="setLang" class="w-full p-4 flex items-center justify-between tap text-left">
            <span><span class="font-semibold block">${t('s_language')}</span><span class="txt-muted text-sm">${I18N[STATE.uiLang]._name}</span></span>
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>
        </div>
      </section>

      <section>
        <p class="text-xs font-bold uppercase tracking-wider txt-muted mb-2 px-1">${t('s_notifications')}</p>
        <div class="surface rounded-2xl border brd shadow-card divide-y" style="border-color:var(--border)">
          ${toggleRow('togNotif', t('s_daily_reminder'), STATE.dailyReminder)}
        </div>
      </section>

      <section>
        <p class="text-xs font-bold uppercase tracking-wider txt-muted mb-2 px-1">${t('s_data')}</p>
        <div class="surface rounded-2xl border brd shadow-card divide-y" style="border-color:var(--border)">
          <button id="installBtn" class="w-full p-4 flex items-center justify-between tap text-left" ${window.deferredPrompt?'':'hidden'}>
            <span class="font-semibold">${t('s_install')}</span>
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg></button>
          <button id="clearCache" class="w-full p-4 flex items-center justify-between tap text-left text-red-500">
            <span class="font-semibold">${t('s_clear_cache')}</span>
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>
        </div>
      </section>

      <p class="text-center txt-muted text-xs pt-2">Kurani · القرآن الكريم<br/>Content: AlQuran.cloud · Audio: islamic.network</p>
    </div>`;

  // theme
  $$('[data-theme-opt]').forEach(b=>b.onclick=()=>{ STATE.theme=b.dataset.themeOpt; saveSettings(); applyTheme(); render(); });
  // font size
  $('#fsRange').oninput = e => { STATE.fontSize=+e.target.value; $('#fsVal').textContent=STATE.fontSize+'px'; $('#fsPreview').style.fontSize=STATE.fontSize+'px'; };
  $('#fsRange').onchange = () => saveSettings();
  // toggles
  bindToggle('togSq', v=>{ STATE.showSq=v; saveSettings(); });
  bindToggle('togEn', v=>{ STATE.showEn=v; saveSettings(); });
  bindToggle('togNotif', async v=>{ if(v){ const ok=await enableNotifications(); STATE.dailyReminder=ok; if(!ok){render();} } else { STATE.dailyReminder=false; } saveSettings(); });
  // pickers
  $('#setReciter').onclick = openReciterSheet;
  $('#setLang').onclick = openLangSheet;
  // install
  const ib=$('#installBtn'); if(ib) ib.onclick = doInstall;
  $('#clearCache').onclick = async ()=>{ await DB.clear('surahs'); await DB.clear('kv'); await DB.clear('audio');
    if('caches' in window){ const ks=await caches.keys(); await Promise.all(ks.map(k=>caches.delete(k))); }
    toast(t('cache_cleared')); };
});

function toggleRow(id,label,on){
  return `<div class="p-4 flex items-center justify-between">
    <span class="font-semibold">${label}</span>
    <button id="${id}" data-on="${on?1:0}" class="tog w-12 h-7 rounded-full relative transition ${on?'bg-accent':'surface-2'}" style="${on?'':'border:1px solid var(--border)'}">
      <span class="absolute top-1 ${on?'right-1':'left-1'} w-5 h-5 bg-white rounded-full shadow transition-all"></span></button></div>`;
}
function bindToggle(id, cb){
  const b=$('#'+id); if(!b) return;
  b.onclick = ()=>{ const on = b.dataset.on==='1'; const nv=!on; b.dataset.on=nv?1:0;
    b.classList.toggle('bg-accent',nv); b.classList.toggle('surface-2',!nv); b.style.border = nv?'':'1px solid var(--border)';
    const dot=b.querySelector('span'); dot.classList.toggle('right-1',nv); dot.classList.toggle('left-1',!nv);
    cb(nv); };
}
function openLangSheet(){
  openSheet(`<div class="w-10 h-1 rounded-full mx-auto mb-4" style="background:var(--border)"></div>
    <h3 class="font-extrabold text-lg mb-3">${t('s_language')}</h3>
    <div class="space-y-1.5">${Object.keys(I18N).map(l=>`
      <button data-l="${l}" class="langOpt tap w-full flex items-center justify-between p-3 rounded-xl ${l===STATE.uiLang?'accent-soft accent font-bold':'surface-2'}">
        <span>${I18N[l]._name}</span>${l===STATE.uiLang?'<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="m9 16.2-3.5-3.5L4 14.2 9 19 20 8l-1.4-1.4z"/></svg>':''}</button>`).join('')}</div>`);
  $$('.langOpt').forEach(b=>b.onclick=()=>{ STATE.uiLang=b.dataset.l; saveSettings(); applyLang(); closeSheet(); render(); });
}

function emptyState(icon,msg){
  return `<div class="text-center py-20 fade-in">
    <div class="w-16 h-16 mx-auto rounded-2xl accent-soft grid place-items-center accent mb-4">
      <svg width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="${icon}"/></svg></div>
    <p class="txt-muted">${msg}</p></div>`;
}

/* ================= AUDIO PLAYER ================= */
const Player = {
  audio: $('#audio'), urls: [], idx: 0, surah: null, repeat: 0, // 0 none, 1 surah, 2 verse
  async playSurah(s, startIdx){
    this.surah = s;
    $('#player').hidden = false;
    $('#pTitle').textContent = `${surahName(s)} · ${t('loading')}`;
    try { this.urls = await Quran.surahAudio(s.number, STATE.reciter); }
    catch(e){ toast(t('err_load')); return; }
    if(!this.urls.length){ toast(t('err_load')); return; }
    this.idx = Math.max(0, Math.min(startIdx||0, this.urls.length-1));
    this.load(); this.play();
  },
  load(){
    this.audio.src = this.urls[this.idx];
    const aNo = this.surah.ayahs[this.idx]?.n;
    $('#pTitle').textContent = `${surahName(this.surah)} · ${t('verse')} ${aNo}`;
    if(this.surah) LastRead.set({ s:this.surah.number, a:aNo, name:surahName(this.surah) });
    this.highlight(aNo);
  },
  highlight(aNo){
    $$('.ayah-active').forEach(e=>e.classList.remove('ayah-active'));
    const c = document.getElementById('ayah-'+aNo);
    if(c){ c.classList.add('ayah-active'); c.scrollIntoView({block:'center',behavior:'smooth'}); }
  },
  play(){ this.audio.play().catch(()=>{}); },
  toggle(){ this.audio.paused ? this.play() : this.audio.pause(); },
  next(){ if(this.idx < this.urls.length-1){ this.idx++; this.load(); this.play(); } else { this.stop(); } },
  prev(){ if(this.idx>0){ this.idx--; this.load(); this.play(); } },
  stop(){ this.audio.pause(); $('#player').hidden=true; $$('.ayah-active').forEach(e=>e.classList.remove('ayah-active')); },
};
(function bindPlayer(){
  const a = Player.audio;
  $('#pPlay').onclick = ()=>Player.toggle();
  $('#pNext').onclick = ()=>Player.next();
  $('#pPrev').onclick = ()=>Player.prev();
  $('#pClose').onclick = ()=>Player.stop();
  $('#pRepeat').onclick = ()=>{ Player.repeat=(Player.repeat+1)%3; const b=$('#pRepeat');
    b.classList.toggle('accent', Player.repeat>0); b.classList.toggle('txt-muted', Player.repeat===0);
    toast(['—','Surah','Verse'][Player.repeat]); };
  a.addEventListener('play', ()=>{ $('#pIconPlay').hidden=true; $('#pIconPause').hidden=false; });
  a.addEventListener('pause', ()=>{ $('#pIconPlay').hidden=false; $('#pIconPause').hidden=true; });
  a.addEventListener('timeupdate', ()=>{ if(a.duration) $('#pBar').style.width=(a.currentTime/a.duration*100)+'%'; });
  a.addEventListener('ended', ()=>{
    if(Player.repeat===2){ Player.play(); return; }
    if(Player.idx>=Player.urls.length-1 && Player.repeat===1){ Player.idx=0; Player.load(); Player.play(); return; }
    Player.next();
  });
})();

/* ================= NOTIFICATIONS (best-effort, client-side) ================= */
async function enableNotifications(){
  if(!('Notification' in window)){ toast('—'); return false; }
  const p = await Notification.requestPermission();
  if(p!=='granted'){ toast(t('notif_denied')); return false; }
  toast(t('notif_on'));
  scheduleDailyReminder();
  return true;
}
function scheduleDailyReminder(){
  // Lightweight in-session reminder; production push requires a server + VAPID.
  if(Notification.permission!=='granted') return;
  setTimeout(async ()=>{
    try{ const seed=Math.floor(Date.now()/864e5); const s=await Quran.surah((seed%114)+1);
      const a=s.ayahs[seed%s.ayahs.length];
      new Notification('Kurani — '+t('ayah_of_day'), { body:(STATE.uiLang==='en'?a.en:a.sq).slice(0,120), icon:'icons/icon-192.png', badge:'icons/icon-192.png' });
    }catch(e){}
  }, 4000);
}

/* ================= INSTALL ================= */
window.deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); window.deferredPrompt=e;
  const ib=$('#installBtn'); if(ib) ib.hidden=false; });
async function doInstall(){ if(!window.deferredPrompt){ toast(t('install_prompt')); return; }
  window.deferredPrompt.prompt(); await window.deferredPrompt.userChoice; window.deferredPrompt=null; }

/* ================= GLOBAL UI BINDINGS ================= */
$('#backBtn').onclick = ()=>{ if(history.length>1) history.back(); else location.hash='#/'; };
$('#langBtn').onclick = openLangSheet;
$('#themeBtn').onclick = ()=>{ const order=['light','sepia','dark','night']; STATE.theme=order[(order.indexOf(STATE.theme)+1)%order.length]; saveSettings(); applyTheme(); toast(t('theme_'+(STATE.theme==='light'?'light':STATE.theme))); if(location.hash.startsWith('#/settings'))render(); };
$$('.navbtn').forEach(b=>b.onclick=()=>location.hash=b.dataset.nav);
window.addEventListener('online', ()=>{ if(location.hash.startsWith('#/')) render(); });
window.addEventListener('offline', ()=>toast(t('offline_note')));

/* ---- Reading time tracker ---- */
let minuteAcc=0;
setInterval(()=>{ if(location.hash.startsWith('#/surah/') && !document.hidden){ minuteAcc++; if(minuteAcc>=60){ Stats.addMinutes(1); minuteAcc=0; } } }, 1000);

/* ================= BOOT ================= */
function boot(){
  applyTheme(); applyLang();
  if(STATE.dailyReminder && 'Notification' in window && Notification.permission==='granted') scheduleDailyReminder();
  if(!location.hash) location.hash = '#/';
  render();
  setTimeout(()=>{ const sp=$('#splash'); if(sp){ sp.style.transition='opacity .55s ease'; sp.style.opacity='0'; setTimeout(()=>sp.remove(),560); } }, 2200);
}
boot();
