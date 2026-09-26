/* ==========================================================================
   Audio engine.
   One <audio> element, a queue of ayahs, repeat/range/autoplay logic,
   MediaSession integration, resumable state and honest offline errors.
   ========================================================================== */

import { storage } from './store.js';
import { ayahAudioUrl, surahInfo, reciterName, reference } from './quran.js';

const listeners = new Map();
const RESUME_KEY = 'audioResume';
const RESUME_TTL = 6 * 60 * 60 * 1000;

let audio = null;

export const state = {
  queue: [],          // [{ s, a }]
  index: -1,
  playing: false,
  loading: false,
  error: null,        // null | 'network' | 'offline' | 'decode'
  reciter: 'ar.alafasy',
  rate: 1,
  volume: 1,
  muted: false,
  repeat: 'off',      // off | ayah | range | surah
  repeatCount: 3,
  repeatLeft: 0,
  autoplayNext: true,
  continuous: true,   // roll on to the next surah when one finishes
  duration: 0,
  time: 0,
  context: null,      // { kind: 'surah' | 'range' | 'single' | 'memorize', s, from, to }
};

/* ------------------------------------------------------------------- events */

export function on(evt, fn) {
  if (!listeners.has(evt)) listeners.set(evt, new Set());
  listeners.get(evt).add(fn);
  return () => listeners.get(evt)?.delete(fn);
}

function emit(evt, payload) {
  listeners.get(evt)?.forEach((fn) => { try { fn(payload); } catch (e) { console.error(e); } });
}

/* --------------------------------------------------------------------- init */

export function init(settings = {}) {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = 'metadata';
  // No crossOrigin: the recitation CDN does not send CORS headers, and asking for
  // them makes the browser reject every file. We never read the samples, so a
  // plain no-cors (opaque) load is exactly right — the SW caches it either way.

  state.reciter = settings.reciter || state.reciter;
  state.rate = settings.playbackRate || 1;
  state.repeat = settings.repeatMode || 'off';
  state.repeatCount = settings.repeatCount || 3;
  state.autoplayNext = settings.autoplayNext !== false;
  state.continuous = settings.continuousPlay !== false;

  audio.addEventListener('loadstart', () => { state.loading = true; emit('state'); });
  audio.addEventListener('canplay', () => {
    state.loading = false;
    state.error = null;
    fallbackStep = 0;          // this source works; start fresh on the next ayah
    emit('state');
  });
  // A stalled network should look like loading, not like silence.
  audio.addEventListener('waiting', () => { state.loading = true; emit('state'); });
  audio.addEventListener('stalled', () => { state.loading = true; emit('state'); });
  audio.addEventListener('playing', () => { state.loading = false; emit('state'); });
  audio.addEventListener('loadedmetadata', () => {
    state.duration = audio.duration || 0;
    emit('time');
  });
  audio.addEventListener('timeupdate', () => {
    state.time = audio.currentTime || 0;
    emit('time');
  });
  audio.addEventListener('play', () => { state.playing = true; emit('state'); setSessionState('playing'); });
  audio.addEventListener('pause', () => { state.playing = false; emit('state'); setSessionState('paused'); saveResume(); });
  audio.addEventListener('ended', onEnded);
  audio.addEventListener('error', onSourceError);

  setupMediaSession();
  return audio;
}

/* --------------------------------------------------------------------- play */

/**
 * Play a queue.
 * @param {Array<{s:number,a:number}>} queue
 * @param {number} index starting position
 * @param {object} context { kind, s, from, to }
 */
export function playQueue(queue, index = 0, context = null) {
  if (!audio) init();
  if (!queue?.length) return;
  state.queue = queue;
  state.index = Math.min(Math.max(0, index), queue.length - 1);
  state.context = context;
  state.repeatLeft = state.repeat === 'ayah' ? state.repeatCount - 1 : 0;
  load(true);
}

/** Play a whole surah, ayah by ayah. */
export function playSurah(s, fromAyah = 1) {
  const info = surahInfo(s);
  if (!info) return;
  const queue = [];
  for (let a = 1; a <= info.count; a++) queue.push({ s: Number(s), a });
  playQueue(queue, fromAyah - 1, { kind: 'surah', s: Number(s), from: 1, to: info.count });
}

/** Play a range within a surah (used by memorisation). */
export function playRange(s, from, to, { kind = 'range' } = {}) {
  const info = surahInfo(s);
  if (!info) return;
  const lo = Math.max(1, Math.min(from, to));
  const hi = Math.min(info.count, Math.max(from, to));
  const queue = [];
  for (let a = lo; a <= hi; a++) queue.push({ s: Number(s), a });
  playQueue(queue, 0, { kind, s: Number(s), from: lo, to: hi });
}

/** Play exactly one ayah. */
export function playAyah(s, a) {
  playQueue([{ s: Number(s), a: Number(a) }], 0, { kind: 'single', s: Number(s), from: a, to: a });
}

/*
 * Not every reciter is published at every bitrate on the CDN, and a missing
 * folder looks exactly like a dead player. So a failed source steps down this
 * ladder before we ever tell the user something is wrong; the last rung swaps
 * in the one reciter that is always present.
 */
const SOURCE_LADDER = [
  { bitrate: 128 },
  { bitrate: 64 },
  { bitrate: 192 },
  { bitrate: 128, reciter: 'ar.alafasy' },
  { bitrate: 64, reciter: 'ar.alafasy' },
];
let fallbackStep = 0;
let retryTimer = null;

function currentSource(cur) {
  const rung = SOURCE_LADDER[Math.min(fallbackStep, SOURCE_LADDER.length - 1)];
  return ayahAudioUrl(cur.s, cur.a, rung.reciter || state.reciter, rung.bitrate);
}

function onSourceError() {
  // A src we cleared (stop/teardown) fires an error we should ignore.
  if (!audio?.getAttribute('src')) return;
  const cur = currentItem();

  if (cur && fallbackStep < SOURCE_LADDER.length - 1) {
    fallbackStep++;
    const wasPlaying = state.playing || state.loading;
    audio.src = currentSource(cur);
    if (wasPlaying) audio.play().catch(() => {});
    return;
  }

  state.loading = false;
  state.playing = false;
  state.error = navigator.onLine ? 'network' : 'offline';
  emit('state');
  emit('error', state.error);
}

function load(autoplay) {
  const cur = currentItem();
  if (!cur) return;
  clearTimeout(retryTimer);
  state.error = null;
  state.time = 0;
  state.duration = 0;
  fallbackStep = 0;
  audio.src = currentSource(cur);
  audio.playbackRate = state.rate;
  audio.volume = state.muted ? 0 : state.volume;
  // Setting .src already restarts resource selection. An explicit load() here
  // races it on iOS and makes the play() below reject with AbortError.
  emit('change', cur);
  updateMetadata();
  if (autoplay) {
    const p = audio.play();
    if (p?.catch) p.catch((err) => {
      // AbortError just means a newer load superseded this one — not a failure.
      if (err?.name === 'AbortError') return;
      if (err?.name === 'NotAllowedError') { state.playing = false; emit('state'); }
      else { state.error = navigator.onLine ? 'network' : 'offline'; emit('error', state.error); }
    });
  }
  saveResume();
}

function onEnded() {
  // Repeat the same ayah N times first.
  if (state.repeat === 'ayah' && state.repeatLeft > 0) {
    state.repeatLeft--;
    audio.currentTime = 0;
    audio.play().catch(() => {});
    return;
  }
  state.repeatLeft = state.repeat === 'ayah' ? state.repeatCount - 1 : 0;

  const atEnd = state.index >= state.queue.length - 1;

  // "Vazhdo automatikisht" off means one ayah at a time, wherever we are.
  if (!state.autoplayNext) {
    state.playing = false;
    emit('state');
    emit('finished');
    saveResume();
    return;
  }

  if (!atEnd) { next(); return; }

  if (state.repeat === 'range' || state.repeat === 'surah') {
    state.index = 0;
    load(true);
    return;
  }

  // A finished surah rolls into the next one, the way a mushaf recitation does.
  if (state.context?.kind === 'surah' && state.continuous) {
    const nextSurah = Number(state.context.s) + 1;
    const info = surahInfo(nextSurah);
    if (info) { playSurah(nextSurah, 1); return; }
  }

  state.playing = false;
  emit('state');
  emit('finished');
  saveResume();
}

/* ---------------------------------------------------------------- transport */

export function toggle() {
  if (!audio || state.index < 0) return;
  if (audio.paused) {
    audio.play().catch(() => { state.error = navigator.onLine ? 'network' : 'offline'; emit('error', state.error); });
  } else {
    audio.pause();
  }
}

export function pause() { audio?.pause(); }

export function next() {
  if (state.index < state.queue.length - 1) { state.index++; load(true); }
}

export function prev() {
  // Restart the ayah if we're more than 2s in, otherwise step back.
  if (audio && audio.currentTime > 2.2) { audio.currentTime = 0; return; }
  if (state.index > 0) { state.index--; load(true); }
  else if (audio) audio.currentTime = 0;
}

export function seek(seconds) {
  if (!audio || !Number.isFinite(seconds)) return;
  audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 0));
}

export function seekFraction(f) {
  if (!audio || !audio.duration) return;
  seek(f * audio.duration);
}

export function setRate(rate) {
  state.rate = Math.min(2, Math.max(0.5, rate));
  if (audio) audio.playbackRate = state.rate;
  emit('state');
}

export function setVolume(v) {
  state.volume = Math.min(1, Math.max(0, v));
  state.muted = state.volume === 0;
  if (audio) audio.volume = state.volume;
  emit('state');
}

export function toggleMute() {
  state.muted = !state.muted;
  if (audio) audio.volume = state.muted ? 0 : state.volume;
  emit('state');
}

export function setRepeat(mode) {
  state.repeat = ['off', 'ayah', 'range', 'surah'].includes(mode) ? mode : 'off';
  state.repeatLeft = state.repeat === 'ayah' ? state.repeatCount - 1 : 0;
  emit('state');
}

export function cycleRepeat() {
  const order = ['off', 'ayah', 'surah'];
  setRepeat(order[(order.indexOf(state.repeat) + 1) % order.length]);
  return state.repeat;
}

export function setRepeatCount(n) {
  state.repeatCount = Math.min(20, Math.max(1, Math.round(n)));
  if (state.repeat === 'ayah') state.repeatLeft = state.repeatCount - 1;
  emit('state');
}

export function setAutoplayNext(v) { state.autoplayNext = Boolean(v); emit('state'); }
export function setContinuous(v) { state.continuous = Boolean(v); emit('state'); }

export function setReciter(id) {
  if (state.reciter === id) return;
  state.reciter = id;
  if (state.index >= 0) {
    const wasPlaying = state.playing;
    const at = state.time;
    load(wasPlaying);
    if (at > 0) audio.addEventListener('loadedmetadata', () => seek(at), { once: true });
  }
  emit('state');
}

export function stop() {
  if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
  state.queue = [];
  state.index = -1;
  state.playing = false;
  state.context = null;
  state.time = 0;
  state.duration = 0;
  storage.remove(RESUME_KEY);
  emit('change', null);
  emit('state');
}

export function retry() {
  if (state.index >= 0) load(true);
}

/* ---------------------------------------------------------------- accessors */

export function currentItem() { return state.queue[state.index] || null; }
export const isActive = () => state.index >= 0 && state.queue.length > 0;
export const progress = () => (state.duration ? state.time / state.duration : 0);

export function isPlayingAyah(s, a) {
  const c = currentItem();
  return Boolean(state.playing && c && c.s === Number(s) && c.a === Number(a));
}

export function isCurrentAyah(s, a) {
  const c = currentItem();
  return Boolean(c && c.s === Number(s) && c.a === Number(a));
}

/* ------------------------------------------------------------------- resume */

function saveResume() {
  const cur = currentItem();
  if (!cur) return;
  storage.set(RESUME_KEY, {
    s: cur.s, a: cur.a, ts: Date.now(),
    reciter: state.reciter,
    context: state.context,
    time: Math.round(state.time),
  });
}

export function getResume() {
  const r = storage.get(RESUME_KEY, null);
  if (!r || !r.ts || Date.now() - r.ts > RESUME_TTL) return null;
  return r;
}

/** Restore the previous session's queue without starting playback. */
export function restoreSession() {
  const r = getResume();
  if (!r) return null;
  if (!audio) init();
  const ctx = r.context;
  if (ctx?.kind === 'surah') {
    const info = surahInfo(ctx.s);
    if (!info) return null;
    const queue = [];
    for (let a = 1; a <= info.count; a++) queue.push({ s: ctx.s, a });
    state.queue = queue;
    state.index = Math.max(0, r.a - 1);
  } else {
    state.queue = [{ s: r.s, a: r.a }];
    state.index = 0;
  }
  state.context = ctx;
  state.reciter = r.reciter || state.reciter;
  const cur = currentItem();
  if (cur) {
    audio.src = ayahAudioUrl(cur.s, cur.a, state.reciter);
    audio.playbackRate = state.rate;
    emit('change', cur);
    emit('state');
    updateMetadata();
  }
  return r;
}

/* ------------------------------------------------------------ MediaSession */

function setupMediaSession() {
  if (!('mediaSession' in navigator)) return;
  const ms = navigator.mediaSession;
  const safe = (fn) => { try { return fn(); } catch { /* unsupported action */ } };
  safe(() => ms.setActionHandler('play', () => toggle()));
  safe(() => ms.setActionHandler('pause', () => pause()));
  safe(() => ms.setActionHandler('previoustrack', () => prev()));
  safe(() => ms.setActionHandler('nexttrack', () => next()));
  safe(() => ms.setActionHandler('seekbackward', (d) => seek(state.time - (d?.seekOffset || 10))));
  safe(() => ms.setActionHandler('seekforward', (d) => seek(state.time + (d?.seekOffset || 10))));
  safe(() => ms.setActionHandler('seekto', (d) => { if (d?.seekTime != null) seek(d.seekTime); }));
  safe(() => ms.setActionHandler('stop', () => stop()));
}

function setSessionState(s) {
  if ('mediaSession' in navigator) {
    try { navigator.mediaSession.playbackState = s; } catch { /* ignore */ }
  }
}

function updateMetadata() {
  if (!('mediaSession' in navigator) || !window.MediaMetadata) return;
  const cur = currentItem();
  if (!cur) return;
  const info = surahInfo(cur.s);
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${info?.sq || 'Sure'} · ${cur.s}:${cur.a}`,
      artist: reciterName(state.reciter),
      album: 'LEXO KURAN',
      artwork: [
        { src: new URL('icons/now-playing-256.png', new URL('../../', import.meta.url)).href, sizes: '256x256', type: 'image/png' },
        { src: new URL('icons/now-playing-512.png', new URL('../../', import.meta.url)).href, sizes: '512x512', type: 'image/png' },
      ],
    });
  } catch { /* metadata is a nicety, never a failure */ }
}

/** Human label for whatever is playing. */
export function currentLabel() {
  const cur = currentItem();
  return cur ? reference(cur.s, cur.a) : '';
}
