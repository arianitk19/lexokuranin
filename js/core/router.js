/* ==========================================================================
   Hash router with SEO-shaped paths.

   Routes are written the way real URLs will be when the app moves to a
   server that can rewrite them:
       #/surah/el-bekare        →  /surah/el-bekare
       #/surah/el-bekare/255    →  /surah/el-bekare/255
   Numeric ids keep working (#/surah/2) and redirect to the slug, so no old
   link ever breaks.
   ========================================================================== */

const routes = [];
let notFound = null;
let current = null;
let beforeEach = null;
const scrollMemory = new Map();

/** register('/surah/:slug/:ayah?', handler) */
export function register(pattern, handler) {
  const keys = [];
  const rx = new RegExp('^' + pattern
    .split('/')
    .map((seg) => {
      if (!seg.startsWith(':')) return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const optional = seg.endsWith('?');
      keys.push(seg.slice(1, optional ? -1 : undefined));
      return optional ? '(?:([^/]+))?' : '([^/]+)';
    })
    .join('/')
    .replace(/\/\(\?:/g, '(?:/') + '/?$');
  routes.push({ rx, keys, handler, pattern });
}

export function setNotFound(handler) { notFound = handler; }
export function onBefore(fn) { beforeEach = fn; }

export function parse(hash = location.hash) {
  const raw = hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart] = raw.split('?');
  const path = decodeURI(pathPart) || '/';
  const query = Object.fromEntries(new URLSearchParams(queryPart || ''));
  return { path, query, raw };
}

export function currentRoute() { return current; }

export function navigate(to, { replace = false } = {}) {
  const target = to.startsWith('#') ? to : '#' + (to.startsWith('/') ? to : '/' + to);
  if (location.hash === target) { resolve(); return; }
  // Tag every history entry with how many *real* (non-replace) in-app
  // navigations sit behind it. A replace (redirect/canonicalisation) carries
  // the depth of the entry it replaces forward unchanged — it never adds a
  // step. This is what tells back() apart a deep link (a PWA shortcut, a
  // notification tap, a shared ayah link, a widget — landing directly on a
  // non-home route with nothing behind it) from real in-app history, so the
  // visible back button never falls through to the browser and out of the app.
  const depth = (history.state?.lk || 0) + (replace ? 0 : 1);
  if (replace) location.replace(target);
  else location.hash = target;
  try { history.replaceState({ lk: depth }, '', location.href); } catch { /* state is a nicety */ }
}

/** True when there is a real in-app history entry behind the current one. */
export function hasHistory() { return Boolean(history.state?.lk); }

export function back(fallback = '/') {
  if (hasHistory()) history.back();
  else navigate(fallback, { replace: true });
}

function rememberScroll() {
  if (current) scrollMemory.set(current.raw, window.scrollY);
}

export async function resolve() {
  const loc = parse();
  for (const r of routes) {
    const m = loc.path.match(r.rx);
    if (!m) continue;
    const params = {};
    r.keys.forEach((k, i) => { params[k] = m[i + 1] != null ? decodeURIComponent(m[i + 1]) : undefined; });
    const ctx = { ...loc, params, pattern: r.pattern };
    if (beforeEach && (await beforeEach(ctx, current)) === false) return;
    current = ctx;
    await r.handler(ctx);
    restoreScroll(ctx);
    return;
  }
  current = { ...loc, params: {}, pattern: null };
  await notFound?.(current);
}

function restoreScroll(ctx) {
  const y = scrollMemory.get(ctx.raw);
  if (ctx.query.ayah || location.hash.includes('#a')) return; // the view handles it
  window.scrollTo({ top: y ?? 0, behavior: 'auto' });
}

export function start() {
  window.addEventListener('hashchange', () => { resolve(); });
  window.addEventListener('beforeunload', rememberScroll);
  document.addEventListener('click', (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href^="#/"]') : null;
    if (a) rememberScroll();
  }, true);
  resolve();
}

/* ------------------------------------------------------------------ helpers */

export const linkSurah = (slugOrN, ayah) =>
  `#/surah/${slugOrN}${ayah ? '/' + ayah : ''}`;

export const linkJuz = (n) => `#/juz/${n}`;
export const linkSearch = (q) => `#/search${q ? '?q=' + encodeURIComponent(q) : ''}`;
