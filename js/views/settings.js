/* ==========================================================================
   Settings — reading, audio, language, theme, notifications, offline,
   accessibility, data, about. No account required for any of it.
   ========================================================================== */

import { html, render, $, $$, on } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { t, num, LANGS } from '../core/i18n.js';
import { settings, set as setSetting, isStandalone, install, promptInstall } from '../core/app.js';
import { THEMES, wipeAll, exportAll, importAll, storage } from '../core/store.js';
import { RECITERS, reciterName, downloadAll, isFullyCached } from '../core/quran.js';
import { sheet, toast, confirmDialog, spinner } from '../core/ui.js';
import { openReciterSheet } from './audio.js';
import { openReaderSettings } from './reader.js';
import { openInstallHelp } from './partials.js';
import * as player from '../core/audio.js';
import * as notifications from '../core/notifications.js';

let downloading = false;
let cachedOffline = false;

export async function render_(mount) {
  isFullyCached().then((v) => { cachedOffline = v; paintOffline(); });

  render(mount, html`
    <div class="view stack stack-6">
      <header><h1>${t('settings')}</h1></header>

      ${group(t('settings_reading'), html`
        <button type="button" class="rowitem" data-open="reader">
          <span class="rowitem__label">${t('reader_settings')}</span>
          <span class="rowitem__value">${settings.fontSize}px · ${t('font_' + settings.arFont)}</span>
          ${icon('chevronRight', 17)}
        </button>
        <div class="rowitem">
          <span class="rowitem__label">
            <label for="goalRange">${t('daily_goal')}</label>
            <span class="t-sm dim" style="display:block" id="goalOut">${settings.dailyGoalMinutes} ${t('minutes')}</span>
          </span>
          <input type="range" id="goalRange" min="1" max="120" step="1" value="${settings.dailyGoalMinutes}"
                 style="max-width:11rem">
        </div>
        ${toggleRow('focusMode', t('focus_mode'))}
      `)}

      ${group(t('settings_audio'), html`
        <button type="button" class="rowitem" data-open="reciter">
          <span class="rowitem__label">${t('reciter')}</span>
          <span class="rowitem__value truncate" style="max-width:11rem">${reciterName(settings.reciter)}</span>
          ${icon('chevronRight', 17)}
        </button>
        ${toggleRow('autoplayNext', t('autoplay_next'))}
        ${toggleRow('continuousPlay', t('continuous_play'))}
        <div class="rowitem">
          <span class="rowitem__label">
            <label for="rateRange">${t('speed')}</label>
            <span class="t-sm dim nums" style="display:block" id="rateOut">${settings.playbackRate}×</span>
          </span>
          <input type="range" id="rateRange" min="0.5" max="2" step="0.05" value="${settings.playbackRate}"
                 style="max-width:11rem">
        </div>
        <div class="rowitem">
          <span class="rowitem__label">
            <label for="repeatRange">${t('repeat_ayah')}</label>
            <span class="t-sm dim nums" style="display:block" id="repeatOut">×${settings.repeatCount}</span>
          </span>
          <input type="range" id="repeatRange" min="1" max="20" step="1" value="${settings.repeatCount}"
                 style="max-width:11rem">
        </div>
      `)}

      ${group(t('settings_theme'), html`
        <div style="padding:var(--s4)">
          <div class="row wrap" style="gap:var(--s2)">
            ${THEMES.map((th) => html`
              <button type="button" class="chip ${settings.theme === th ? 'is-active' : ''}" data-theme="${th}">
                ${icon(th === 'auto' ? 'compass' : th === 'light' ? 'sun' : th === 'sepia' ? 'feather' : 'moon', 14)}
                ${t('theme_' + th)}
              </button>`)}
          </div>
        </div>
      `)}

      ${group(t('settings_language'), html`
        <div style="padding:var(--s4)">
          <div class="row wrap" style="gap:var(--s2)">
            ${Object.entries(LANGS).map(([code, meta]) => html`
              <button type="button" class="chip ${settings.uiLang === code ? 'is-active' : ''}" data-lang="${code}"
                      lang="${code}">${meta.name}</button>`)}
          </div>
        </div>
      `)}

      ${group(t('settings_notifications'), html`
        <div id="notifRow"></div>
        <div class="rowitem">
          <span class="rowitem__label">
            <label for="reminderTime">${t('reminder_time')}</label>
          </span>
          <input type="time" id="reminderTime" value="${settings.reminderTime}"
                 class="field" style="width:auto;padding-inline:var(--s3);height:40px">
        </div>
        <p style="padding:var(--s3) var(--s4);color:var(--ink-3)" class="t-xs">${t('notif_explain')}</p>
      `)}

      ${group(t('settings_offline'), html`<div id="offlineBox"></div>`)}

      ${group(t('settings_a11y'), html`
        ${toggleRow('reduceMotion', t('reduce_motion'))}
        <p style="padding:var(--s3) var(--s4);color:var(--ink-3)" class="t-xs">
          ${t('font_size')}: ${t('reader_settings')}
        </p>
      `)}

      ${group(t('settings_data'), html`
        <button type="button" class="rowitem" data-open="export">
          <span class="rowitem__label">${t('export_data')}</span>
          ${icon('download', 17)}
        </button>
        <button type="button" class="rowitem" data-open="import">
          <span class="rowitem__label">${t('import_data')}</span>
          ${icon('plus', 17)}
        </button>
        <button type="button" class="rowitem" data-open="clearCache">
          <span class="rowitem__label">${t('clear_cache')}</span>
          ${icon('refresh', 17)}
        </button>
        <button type="button" class="rowitem" data-open="wipe">
          <span class="rowitem__label" style="color:var(--danger)">${t('delete_data')}</span>
          ${icon('trash', 17)}
        </button>
        <div class="rowitem">
          <span class="rowitem__label t-sm dim">${t('storage_used')}</span>
          <span class="rowitem__value nums">${formatBytes(storage.usage())}</span>
        </div>
      `)}

      ${group(t('settings_about'), html`
        <a class="rowitem" href="#/about">
          <span class="rowitem__label">${t('about')}</span>${icon('chevronRight', 17)}
        </a>
        <a class="rowitem" href="#/help">
          <span class="rowitem__label">${t('help')}</span>${icon('chevronRight', 17)}
        </a>
        ${!isStandalone() ? html`
          <button type="button" class="rowitem" data-open="install">
            <span class="rowitem__label">${t('install_btn')}</span>${icon('download', 17)}
          </button>` : ''}
      `)}

      <p class="t-xs dim center" style="padding-bottom:var(--s5)">
        LEXO KURAN · ${t('tagline')}
      </p>

      <input type="file" id="importFile" accept="application/json,.json" hidden>
    </div>
  `);

  wire(mount);
  paintNotif();
  paintOffline();
}

/* ------------------------------------------------------------------ pieces */

function group(title, inner) {
  return html`
    <section>
      <div class="sec"><h2 class="sec__title">${title}</h2></div>
      <div class="list">${inner}</div>
    </section>`;
}

function toggleRow(key, label, sub) {
  return html`
    <button type="button" class="rowitem" data-toggle="${key}" role="switch" aria-checked="${Boolean(settings[key])}">
      <span class="rowitem__label">
        ${label}
        ${sub ? html`<span class="t-sm dim" style="display:block">${sub}</span>` : ''}
      </span>
      <span class="switch" aria-hidden="true" aria-checked="${Boolean(settings[key])}"></span>
    </button>`;
}

function formatBytes(n) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(1) + ' MB';
}

/* -------------------------------------------------------------------- wire */

function wire(mount) {
  $$('[data-toggle]', mount).forEach((b) => b.addEventListener('click', () => {
    const key = b.dataset.toggle;
    const next = !settings[key];
    setSetting({ [key]: next });
    b.setAttribute('aria-checked', String(next));
    b.querySelector('.switch')?.setAttribute('aria-checked', String(next));
    if (key === 'autoplayNext') player.setAutoplayNext(next);
    if (key === 'continuousPlay') player.setContinuous(next);
  }));

  $$('[data-theme]', mount).forEach((b) => b.addEventListener('click', () => {
    setSetting({ theme: b.dataset.theme });
    $$('[data-theme]', mount).forEach((x) => x.classList.toggle('is-active', x === b));
  }));

  $$('[data-lang]', mount).forEach((b) => b.addEventListener('click', () => {
    setSetting({ uiLang: b.dataset.lang });
    // The shell rebuilds and the router re-mounts this view in the new language.
    document.dispatchEvent(new CustomEvent('lk:langchange'));
  }));

  bindRange(mount, 'goalRange', 'dailyGoalMinutes', '#goalOut', (v) => `${v} ${t('minutes')}`);
  bindRange(mount, 'rateRange', 'playbackRate', '#rateOut', (v) => `${Number(v).toFixed(2).replace(/0$/, '')}×`,
    (v) => player.setRate(Number(v)));
  bindRange(mount, 'repeatRange', 'repeatCount', '#repeatOut', (v) => `×${v}`,
    (v) => player.setRepeatCount(Number(v)));

  $('#reminderTime', mount)?.addEventListener('change', (e) => {
    setSetting({ reminderTime: e.target.value });
    if (settings.dailyReminder) notifications.schedule(settings.reminderTime);
  });

  on(mount, 'click', '[data-open]', (_e, node) => {
    switch (node.dataset.open) {
      case 'reader': openReaderSettings(() => render_(mount)); break;
      case 'reciter': openReciterSheet(() => render_(mount)); break;
      case 'install':
        if (install.available) promptInstall().then((o) => { if (o === 'accepted') toast(t('installed_ok'), { icon: 'checkCircle' }); });
        else openInstallHelp();
        break;
      case 'export': doExport(); break;
      case 'import': $('#importFile', mount)?.click(); break;
      case 'clearCache': doClearCache(); break;
      case 'wipe': doWipe(mount); break;
    }
  });

  $('#importFile', mount)?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importAll(JSON.parse(String(reader.result)));
        toast(t('data_imported'), { icon: 'checkCircle' });
        setTimeout(() => location.reload(), 700);
      } catch {
        toast(t('import_failed'), { icon: 'slash' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
}

function bindRange(mount, id, key, outSel, format, onChange) {
  const input = $('#' + id, mount);
  const out = $(outSel, mount);
  if (!input) return;
  input.addEventListener('input', () => {
    if (out) out.textContent = format(input.value);
  });
  input.addEventListener('change', () => {
    const v = key === 'playbackRate' ? Number(input.value) : Math.round(Number(input.value));
    setSetting({ [key]: v });
    onChange?.(v);
  });
}

/* ----------------------------------------------------------- notifications */

function paintNotif() {
  const box = $('#notifRow');
  if (!box) return;
  const supported = notifications.isSupported();
  const perm = supported ? Notification.permission : 'unsupported';

  if (!supported) {
    render(box, html`
      <div class="rowitem">
        <span class="rowitem__label t-sm dim">${t('notif_unsupported')}</span>
      </div>`);
    return;
  }

  render(box, html`
    <button type="button" class="rowitem" id="notifToggle" role="switch"
            aria-checked="${Boolean(settings.dailyReminder && perm === 'granted')}">
      <span class="rowitem__label">
        ${t('daily_reminder')}
        ${perm === 'denied' ? html`<span class="t-sm" style="display:block;color:var(--danger)">${t('notif_denied')}</span>` : ''}
      </span>
      <span class="switch" aria-hidden="true" aria-checked="${Boolean(settings.dailyReminder && perm === 'granted')}"></span>
    </button>`);

  $('#notifToggle')?.addEventListener('click', async () => {
    if (settings.dailyReminder) {
      setSetting({ dailyReminder: false });
      notifications.cancel();
      paintNotif();
      return;
    }
    // Permission is requested only here — never on first load.
    const granted = await notifications.request();
    if (granted) {
      setSetting({ dailyReminder: true });
      notifications.schedule(settings.reminderTime);
      toast(t('notif_on'), { icon: 'bell' });
    } else {
      toast(t('notif_denied'), { icon: 'slash' });
    }
    paintNotif();
  });
}

/* ----------------------------------------------------------------- offline */

function paintOffline() {
  const box = $('#offlineBox');
  if (!box) return;

  render(box, html`
    <div class="rowitem" style="align-items:flex-start;flex-direction:column;gap:var(--s3)">
      <div class="row-between" style="width:100%">
        <span class="rowitem__label">
          ${t('download_offline')}
          <span class="t-sm dim" style="display:block">${t('download_offline_text')}</span>
        </span>
        ${cachedOffline
          ? html`<span class="tag" style="color:var(--brand);background:var(--brand-soft)">${icon('check', 13)} ${t('download_done')}</span>`
          : ''}
      </div>
      <div class="dlrow" style="width:100%">
        <div class="bar dlrow__bar" id="dlBar" hidden role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="bar__fill" style="width:0%"></div>
        </div>
        <button type="button" class="btn ${cachedOffline ? 'btn--outline' : 'btn--primary'} btn--sm" id="dlBtn">
          ${icon('download', 16)} ${cachedOffline ? t('update_now') : t('download_offline')}
        </button>
      </div>
      <p class="t-xs dim" id="dlNote">${t('audio_offline_text')}</p>
    </div>
  `);

  $('#dlBtn')?.addEventListener('click', startDownload);
}

async function startDownload() {
  if (downloading) return;
  downloading = true;
  const bar = $('#dlBar');
  const fill = bar?.querySelector('.bar__fill');
  const btn = $('#dlBtn');
  const note = $('#dlNote');
  if (bar) bar.hidden = false;
  if (btn) { btn.disabled = true; render(btn, html`${spinner(15)} ${t('downloading')}`); }

  try {
    await downloadAll((p) => {
      const pct = Math.round(p * 100);
      if (fill) fill.style.width = pct + '%';
      bar?.setAttribute('aria-valuenow', String(pct));
      if (note) note.textContent = `${pct}%`;
    });
    cachedOffline = true;
    toast(t('download_done'), { icon: 'checkCircle' });
  } catch {
    toast(t('err_load_text'), { icon: 'slash' });
  } finally {
    downloading = false;
    paintOffline();
  }
}

/* -------------------------------------------------------------------- data */

function doExport() {
  const payload = exportAll();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lexo-kuran-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast(t('data_exported'), { icon: 'download' });
}

async function doClearCache() {
  try {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
    cachedOffline = false;
    paintOffline();
    toast(t('cache_cleared'), { icon: 'refresh' });
  } catch {
    toast(t('err_load'), { icon: 'slash' });
  }
}

async function doWipe(mount) {
  const ok = await confirmDialog({
    title: t('delete_data_q'),
    text: t('delete_data_text'),
    confirmLabel: t('delete'),
    danger: true,
  });
  if (!ok) return;
  wipeAll();
  toast(t('data_deleted'), { icon: 'trash' });
  setTimeout(() => location.reload(), 600);
}

export default { render: render_ };
