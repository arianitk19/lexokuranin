/* ==========================================================================
   Shared view fragments.
   ========================================================================== */

import { html, raw, $ } from '../core/dom.js';
import { icon, octagon } from '../core/icons.js';
import { t, num } from '../core/i18n.js';
import { arabicNumber, reference } from '../core/quran.js';
import { install, platformHint } from '../core/app.js';
import { sheet } from '../core/ui.js';
import { render } from '../core/dom.js';
import { linkSurah } from '../core/router.js';

let uid = 0;
const nextId = (p) => `${p}-${++uid}`;

/** Install prompt card — invitation, never a nag. */
export function installCard({ onInstall, onDismiss } = {}) {
  const idInstall = nextId('inst');
  const idHow = nextId('how');
  const idHow2 = nextId('how');
  const idClose = nextId('close');

  queueMicrotask(() => {
    $(`#${idInstall}`)?.addEventListener('click', () => onInstall?.());
    $(`#${idHow}`)?.addEventListener('click', () => openInstallHelp());
    $(`#${idHow2}`)?.addEventListener('click', () => openInstallHelp());
    $(`#${idClose}`)?.addEventListener('click', () => onDismiss?.());
  });

  return html`
    <aside class="install fade-in" aria-label="${t('install_title')}">
      <img class="install__icon" src="icons/icon-192.png" alt="" width="46" height="46" loading="lazy" decoding="async">
      <div class="flex-1">
        <p class="fw-600">${t('install_title')}</p>
        <p class="t-sm dim">${t('install_text')}</p>
        <div class="row" style="gap:var(--s2);margin-top:var(--s3)">
          ${install.available
            ? html`<button type="button" class="btn btn--primary btn--sm" id="${idInstall}">
                ${icon('download', 16)} ${t('install_btn')}</button>`
            : html`<button type="button" class="btn btn--outline btn--sm" id="${idHow}">
                ${icon('info', 16)} ${t('install_how')}</button>`}
          ${install.available ? html`<button type="button" class="btn btn--quiet btn--sm" id="${idHow2}">${t('install_how')}</button>` : ''}
        </div>
      </div>
      <button type="button" class="iconbtn iconbtn--sm" id="${idClose}" aria-label="${t('close')}">${icon('x', 17)}</button>
    </aside>
  `;
}

export function openInstallHelp() {
  const hint = platformHint();
  const rows = [
    ['ios', 'install_ios'],
    ['android', 'install_android'],
    ['desktop', 'install_desktop'],
  ];
  const ui = sheet({ title: t('install_how') });
  render(ui.body, html`
    <div class="stack stack-3">
      ${rows.map(([key, textKey]) => html`
        <div class="card card--pad ${key === hint ? '' : ''}"
             style="${key === hint ? 'border-color:var(--brand)' : ''}">
          <p class="t-xs fw-700" style="letter-spacing:.08em;text-transform:uppercase;color:${key === hint ? 'var(--brand)' : 'var(--ink-3)'}">
            ${key === 'ios' ? 'iPhone · iPad' : key === 'android' ? 'Android' : 'Desktop'}
          </p>
          <p class="muted" style="margin-top:var(--s2)">${t(textKey)}</p>
        </div>`)}
    </div>
  `);
  return ui;
}

/** Offline / back-online strip. */
export function netBanner(online) {
  if (online) return html``;
  return html`
    <div class="netbar fade-in" role="status">
      ${icon('wifiOff', 15)} <span>${t('offline')} — ${t('offline_text')}</span>
    </div>`;
}

/** A row in the surah list. */
export function surahRow(s, { showArabic = true } = {}) {
  return html`
    <a class="surahrow" href="${linkSurah(s.slug)}">
      <span class="surahrow__num">${octagon(40)}<span>${s.n}</span></span>
      <span class="flex-1">
        <span class="surahrow__name" style="display:block">${s.sq}</span>
        <span class="surahrow__meta">${s.meaning} · ${num(s.count)} ${t('verses')} · ${s.type === 'mekase' ? t('meccan') : t('medinan')}</span>
      </span>
      ${showArabic ? html`<span class="surahrow__ar">${s.ar}</span>` : ''}
    </a>`;
}

/**
 * One ayah, as rendered in the reader.
 * @param {object} a  { s, a, ar, sq, en, tl }
 * @param {object} o  { showSq, showEn, showTranslit, saved, memorised, note, playing }
 */
export function ayahArticle(a, o = {}) {
  const flags = [];
  if (o.saved) flags.push(html`<span class="on">${icon('bookmark', 14)}</span>`);
  if (o.memorised) flags.push(html`<span class="on">${icon('brain', 14)}</span>`);
  if (o.note) flags.push(html`<span class="on-accent">${icon('note', 14)}</span>`);

  return html`
    <article class="ayah ${o.playing ? 'is-playing' : ''}" id="a${a.a}" data-ayah="${a.a}"
             tabindex="0" role="button"
             aria-label="${reference(a.s, a.a)}">
      <div class="ayah__top">
        <span class="ayah__no">${a.a}</span>
        <span class="ayah__flags">${flags}</span>
      </div>
      <p class="ar ayah__ar">${a.ar} <span class="ayah__end">۝${raw(arabicNumber(a.a))}</span></p>
      ${o.showTranslit && a.tl ? html`<p class="ayah__translit">${a.tl}</p>` : ''}
      ${o.showSq ? html`<p class="ayah__tr">${a.sq}</p>` : ''}
      ${o.showEn && a.en ? html`<p class="ayah__tr ayah__tr--en">${a.en}</p>` : ''}
      ${o.note ? html`<p class="ayah__note">${o.note.text}</p>` : ''}
    </article>`;
}

/** Section heading with an optional action link. */
export function sectionHead(title, { href, label } = {}) {
  return html`
    <div class="sec">
      <h2 class="sec__title">${title}</h2>
      ${href ? html`<a class="sec__action" href="${href}">${label || t('more')} ${icon('chevronRight', 14)}</a>` : ''}
    </div>`;
}

/** Circular progress ring. */
export function ring(percent, { size = 72, stroke = 6, label } = {}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, Math.max(0, percent / 100)));
  return html`
    <svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"
         role="img" aria-label="${label || percent + '%'}">
      <circle class="ring__track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"></circle>
      <circle class="ring__fill" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"
              stroke-dasharray="${circ}" stroke-dashoffset="${offset}"></circle>
    </svg>`;
}
