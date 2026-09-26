/* ==========================================================================
   Icons — Lucide (ISC licence), inlined as path data. No emoji anywhere.
   ========================================================================== */

import { raw } from './dom.js';

const P = {
  home: '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  bookOpen: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  play: '<path d="M6 3.5v17a1 1 0 0 0 1.5.86l13-8.5a1 1 0 0 0 0-1.72l-13-8.5A1 1 0 0 0 6 3.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="4" width="4.2" height="16" rx="1.2" fill="currentColor" stroke="none"/><rect x="13.8" y="4" width="4.2" height="16" rx="1.2" fill="currentColor" stroke="none"/>',
  skipBack: '<path d="M19 20 9 12l10-8z" fill="currentColor" stroke="none"/><rect x="4" y="4" width="2.6" height="16" rx="1" fill="currentColor" stroke="none"/>',
  skipForward: '<path d="M5 4l10 8-10 8z" fill="currentColor" stroke="none"/><rect x="17.4" y="4" width="2.6" height="16" rx="1" fill="currentColor" stroke="none"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  repeatOne: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><path d="M11 10h1v4"/>',
  volume: '<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.2 8H3.5a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h2.7l3.6 3.8a.7.7 0 0 0 1.2-.5z"/><path d="M16 8.5a5 5 0 0 1 0 7"/><path d="M19.4 5a9 9 0 0 1 0 14"/>',
  volumeOff: '<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.2 8H3.5a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h2.7l3.6 3.8a.7.7 0 0 0 1.2-.5z"/><path d="m16 9 5 6"/><path d="m21 9-5 6"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronUp: '<path d="m18 15-6-6-6 6"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  arrowUpRight: '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4"/><path d="m15.4 6.5-6.8 4"/>',
  brain: '<path d="M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18z"/><path d="M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18z"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><rect x="7" y="12" width="3" height="5" rx="1"/><rect x="12.5" y="8" width="3" height="9" rx="1"/><rect x="18" y="4.5" width="3" height="12.5" rx="1"/>',
  headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M18 14h3v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z"/><path d="M3 14v-2a9 9 0 0 1 18 0v2"/>',
  sparkle: '<path d="M12 3l1.9 5.4L19.3 10l-5.4 1.9L12 17.3l-1.9-5.4L4.7 10l5.4-1.6z"/><path d="M19 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  bell: '<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 17h16l-1.5-2.3A2 2 0 0 1 18 13.5V10a6 6 0 0 0-12 0v3.5a2 2 0 0 1-.5 1.2z"/>',
  wifiOff: '<path d="M12 20h.01"/><path d="M8.5 16.4a5 5 0 0 1 7 0"/><path d="M5 12.9a10 10 0 0 1 5.2-2.7"/><path d="M13.8 10.2A10 10 0 0 1 19 12.9"/><path d="M2 8.8a16 16 0 0 1 5-3"/><path d="M17 5.8a16 16 0 0 1 5 3"/><path d="m2 2 20 20"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-4.8"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-.8 13a2 2 0 0 1-2 1.9H7.8a2 2 0 0 1-2-1.9L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  pencil: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  note: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9l7-7V5a2 2 0 0 0-2-2z"/><path d="M14 21v-5a2 2 0 0 1 2-2h5"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3.5 6h.01"/><path d="M3.5 12h.01"/><path d="M3.5 18h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5"/><path d="M12 8h.01"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.4 9.3a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.2-2.6 3.8"/><path d="M12 17.5h.01"/>',
  heart: '<path d="M19 14.3c1.4-1.4 2-2.9 2-4.6a4.8 4.8 0 0 0-9-2.4A4.8 4.8 0 0 0 3 9.7c0 1.7.6 3.2 2 4.6l7 7z"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/>',
  layers: '<path d="m12 2 9.5 5-9.5 5L2.5 7z"/><path d="m2.5 12 9.5 5 9.5-5"/><path d="m2.5 17 9.5 5 9.5-5"/>',
  type: '<path d="M4 7V5h16v2"/><path d="M12 5v14"/><path d="M9 19h6"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M10.7 6.2A9 9 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.6 3.4"/><path d="M6.6 7.9A17 17 0 0 0 2.5 12S6 18 12 18a9 9 0 0 0 3.9-.9"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="m2 2 20 20"/>',
  maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/>',
  minimize: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M16 3v3a2 2 0 0 0 2 2h3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/><path d="M8 21v-3a2 2 0 0 0-2-2H3"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15.3-6.4L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16"/><path d="M3 21v-5h5"/>',
  rotate: '<path d="M3 11a9 9 0 1 1 2.6 6.4"/><path d="M3 5v6h6"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  more: '<circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/><circle cx="5" cy="12" r="1.4" fill="currentColor"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  flame: '<path d="M12 22c4 0 7-2.8 7-6.7 0-1.8-.7-3.4-2-5-1 1.3-2 1.8-2.6 1.5.9-3-.4-6.1-3.4-8.3-.3 3-1.7 4.6-3.5 6.4A8.4 8.4 0 0 0 5 15.3C5 19.2 8 22 12 22z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 1.9"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8.2 14.3-1.4 7.2 5.2-2.6 5.2 2.6-1.4-7.2"/>',
  shield: '<path d="M12 22s8-3.4 8-9.4V5.6L12 2.5 4 5.6v7c0 6 8 9.4 8 9.4z"/>',
  lock: '<rect x="3.5" y="10.5" width="17" height="11" rx="2"/><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M20 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.8"/><path d="m3.5 18 5-5 4.5 4.5L16.5 14l4 4"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  filter: '<path d="M3.5 5h17l-6.5 8v6l-4 2v-8z"/>',
  sort: '<path d="M7 4v16"/><path d="m3.5 16.5 3.5 3.5 3.5-3.5"/><path d="M17 20V4"/><path d="m13.5 7.5 3.5-3.5 3.5 3.5"/>',
  enter: '<path d="M9 10 4 15l5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>',
  loader: '<path d="M12 2v5"/><path d="M12 17v5"/><path d="m4.9 4.9 3.6 3.6"/><path d="m15.5 15.5 3.6 3.6"/><path d="M2 12h5"/><path d="M17 12h5"/><path d="m4.9 19.1 3.6-3.6"/><path d="m15.5 8.5 3.6-3.6"/>',
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5.2-5.2 2 2-5.2z"/>',
  feather: '<path d="M20.2 3.8a5.5 5.5 0 0 0-7.8 0L4 12.2V20h7.8l8.4-8.4a5.5 5.5 0 0 0 0-7.8z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
  scroll: '<path d="M19 17V5a2 2 0 0 0-2-2H4.5"/><path d="M8 21h11a2 2 0 0 0 2-2v-2H8"/><path d="M4.5 3A2.5 2.5 0 0 0 2 5.5V19a2 2 0 0 0 2 2h4V5.5A2.5 2.5 0 0 0 5.5 3z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4"/><path d="M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
  mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6 9-6"/>',
  trendingUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  slash: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
};

/**
 * Render an icon.
 * @param {string} name key of the icon set
 * @param {number} size px
 */
export function icon(name, size = 22, cls = '') {
  const d = P[name];
  if (!d) return raw('');
  return raw(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ` +
    `fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" ` +
    `${cls ? `class="${cls}" ` : ''}aria-hidden="true" focusable="false">${d}</svg>`
  );
}

export const hasIcon = (name) => Boolean(P[name]);

/** Decorative geometric pattern used behind hero surfaces. */
export function pattern(id = 'kp') {
  return raw(
    `<svg viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" class="pat">
      <defs><pattern id="${id}" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M15 2.5l3.2 5.7 5.7 3.3-5.7 3.2-3.2 5.8-3.2-5.8L6 11.5l5.8-3.3z" fill="none" stroke="currentColor" stroke-width="1"/>
      </pattern></defs>
      <rect width="120" height="120" fill="url(#${id})"/>
    </svg>`
  );
}

/** The app mark, as inline SVG (used where an <img> would flash). */
export function brandMark(size = 28) {
  return raw(
    `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lkArch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#44C093"/><stop offset="1" stop-color="#18795A"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="#131819"/>
      <path d="M25 80V47.5C25 32.8 39.2 22.4 50 10.5c10.8 11.9 25 22.3 25 37v32.5z" fill="url(#lkArch)"/>
      <path d="M50 26.5c1 4.6 1.7 5.3 6.3 6.3-4.6 1-5.3 1.7-6.3 6.3-1-4.6-1.7-5.3-6.3-6.3 4.6-1 5.3-1.7 6.3-6.3z" fill="#E0B87E"/>
      <path d="M48.7 56.6v17.9c-4.7-3.7-10.6-4.2-16.3-1.7a1.4 1.4 0 0 1-2-1.3V55.6c0-.6.3-1.1.9-1.3 5.9-2.3 12.2-1.6 16.9 1.4.3.2.5.5.5.9z" fill="#F7F4ED"/>
      <path d="M51.3 56.6v17.9c4.7-3.7 10.6-4.2 16.3-1.7a1.4 1.4 0 0 0 2-1.3V55.6c0-.6-.3-1.1-.9-1.3-5.9-2.3-12.2-1.6-16.9 1.4-.3.2-.5.5-.5.9z" fill="#F7F4ED"/>
      <rect x="49.1" y="54.2" width="1.8" height="21.4" rx=".9" fill="#E0B87E"/>
    </svg>`
  );
}

/** Octagonal frame behind surah numbers. */
export function octagon(size = 40) {
  return raw(
    `<svg width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M13.2 2h13.6L38 13.2v13.6L26.8 38H13.2L2 26.8V13.2z" fill="none" stroke="currentColor" stroke-width="1.4"/>
    </svg>`
  );
}
