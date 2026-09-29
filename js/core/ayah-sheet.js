/* ==========================================================================
   The ayah action sheet — one elegant surface shared by every view.
   ========================================================================== */

import { html, render, $, $$, el } from './dom.js';
import { icon } from './icons.js';
import { t } from './i18n.js';
import { sheet, toast, copyText, tapFeedback, spinner, errorState } from './ui.js';
import { bookmarks, notes, hifz } from './store.js';
import { loadAyah, loadTafsir, reference, surahInfo, TAFSIR_EDITION } from './quran.js';
import * as player from './audio.js';
import * as share from './share.js';
import { settings, net } from './app.js';
import { navigate, linkSurah } from './router.js';

/**
 * Open the action sheet for one ayah.
 * @param {{s:number,a:number,ar?:string,sq?:string,en?:string,tl?:string}} ayah
 * @param {{onChange?:Function, from?:string}} opts
 */
export async function openAyahSheet(ayah, opts = {}) {
  const full = ayah.ar ? ayah : await loadAyah(ayah.s, ayah.a);
  const { onChange } = opts;

  const ui = sheet({ title: reference(full.s, full.a) });
  paint();

  function paint() {
    const saved = bookmarks.has(full.s, full.a);
    const memorised = hifz.isStrong(full.s, full.a);
    const note = notes.get(full.s, full.a);

    render(ui.body, html`
      <div class="stack stack-5">
        <div>
          <p class="ar" style="font-size:calc(var(--ar-size) * .92)">${full.ar}</p>
          ${settings.showSq !== false ? html`<p class="muted" style="margin-top:var(--s4);line-height:var(--lh-body)">${full.sq}</p>` : ''}
        </div>

        ${note ? html`<p class="ayah__note">${note.text}</p>` : ''}

        <div class="actions">
          <button type="button" class="action" data-act="listen">
            <span class="action__icon">${icon('play', 20)}</span>${t('listen')}
          </button>
          <button type="button" class="action ${saved ? 'is-on' : ''}" data-act="save">
            <span class="action__icon">${icon('bookmark', 20)}</span>${saved ? t('unsave') : t('save')}
          </button>
          <button type="button" class="action" data-act="copy">
            <span class="action__icon">${icon('copy', 20)}</span>${t('copy')}
          </button>
          <button type="button" class="action" data-act="share">
            <span class="action__icon">${icon('share', 20)}</span>${t('share')}
          </button>
          <button type="button" class="action" data-act="tafsir">
            <span class="action__icon">${icon('scroll', 20)}</span>${t('tafsir')}
          </button>
          <button type="button" class="action ${memorised ? 'is-on' : ''}" data-act="memorize">
            <span class="action__icon">${icon('brain', 20)}</span>${t('memorize_v')}
          </button>
          <button type="button" class="action ${note ? 'is-on' : ''}" data-act="note">
            <span class="action__icon">${icon('note', 20)}</span>${t('note')}
          </button>
          <button type="button" class="action" data-act="open">
            <span class="action__icon">${icon('bookOpen', 20)}</span>${t('open_in_quran')}
          </button>
        </div>
      </div>
    `);

    $$('[data-act]', ui.body).forEach((btn) => {
      btn.addEventListener('click', () => handle(btn.dataset.act));
    });
  }

  function handle(act) {
    tapFeedback();
    switch (act) {
      case 'listen':
        player.playAyah(full.s, full.a);
        ui.close();
        break;
      case 'save': {
        const on = bookmarks.toggle(full.s, full.a);
        toast(on ? t('saved_ok') : t('removed_ok'), { icon: on ? 'bookmark' : 'check' });
        onChange?.();
        paint();
        break;
      }
      case 'copy':
        copyText(share.ayahText(full)).then((ok) => toast(ok ? t('copied_ok') : t('err_load'), { icon: 'copy' }));
        break;
      case 'share':
        ui.close();
        setTimeout(() => openShareSheet(full), 260);
        break;
      case 'tafsir':
        ui.close();
        setTimeout(() => openTafsirSheet(full), 260);
        break;
      case 'memorize': {
        const on = hifz.toggleStrong(full.s, full.a);
        toast(on ? t('marked_memorized') : t('unmarked_memorized'), { icon: 'brain' });
        onChange?.();
        paint();
        break;
      }
      case 'note':
        ui.close();
        setTimeout(() => openNoteSheet(full, onChange), 260);
        break;
      case 'open': {
        const info = surahInfo(full.s);
        ui.close();
        navigate(linkSurah(info?.slug || full.s, full.a));
        break;
      }
    }
  }

  return ui;
}

/* ------------------------------------------------------------------- notes */

export function openNoteSheet(ayah, onChange) {
  const existing = notes.get(ayah.s, ayah.a);
  const ui = sheet({ title: t('note') });

  render(ui.body, html`
    <p class="t-sm dim" style="margin-bottom:var(--s3)">${reference(ayah.s, ayah.a)}</p>
    <textarea class="input" id="noteText" rows="5"
      placeholder="${t('notes_empty_text')}" autofocus>${existing?.text || ''}</textarea>
    <p class="t-xs dim" style="margin-top:var(--s2)">${icon('lock', 13)} ${t('privacy')} — ${t('download_offline_text')}</p>
    <div class="stack stack-2" style="margin-top:var(--s5)">
      <button type="button" class="btn btn--primary btn--block" data-act="save">${t('save_btn')}</button>
      ${existing ? html`<button type="button" class="btn btn--danger btn--block" data-act="del">${t('delete')}</button>` : ''}
    </div>
  `);

  const ta = $('#noteText', ui.body);
  ta?.focus();
  ta?.setSelectionRange(ta.value.length, ta.value.length);

  $('[data-act="save"]', ui.body)?.addEventListener('click', () => {
    const kept = notes.set(ayah.s, ayah.a, ta.value);
    toast(kept ? t('note_saved') : t('note_removed'), { icon: 'note' });
    onChange?.();
    ui.close();
  });
  $('[data-act="del"]', ui.body)?.addEventListener('click', () => {
    notes.remove(ayah.s, ayah.a);
    toast(t('note_removed'), { icon: 'trash' });
    onChange?.();
    ui.close();
  });
  return ui;
}

/* ------------------------------------------------------------------ tafsir */

export function openTafsirSheet(ayah) {
  const ui = sheet({ title: t('tafsir_title') });

  render(ui.body, html`
    <p class="t-sm dim" style="margin-bottom:var(--s4)">${reference(ayah.s, ayah.a)}</p>
    <div id="tafsirBody"><div class="row" style="justify-content:center;padding:var(--s8) 0;color:var(--ink-3)">
      ${spinner()} <span class="t-sm">${t('loading')}</span></div></div>
  `);

  const body = $('#tafsirBody', ui.body);

  const fetchIt = () => {
    render(body, html`<div class="row" style="justify-content:center;padding:var(--s8) 0;color:var(--ink-3)">
      ${spinner()} <span class="t-sm">${t('loading')}</span></div>`);
    loadTafsir(ayah.s, ayah.a)
      .then(({ text, edition }) => {
        render(body, html`
          <p class="ar" style="font-size:calc(var(--ar-size) * .72);line-height:2">${text}</p>
          <p class="t-xs dim" style="margin-top:var(--s5);padding-top:var(--s3);border-top:1px solid var(--line)">
            ${t('sources')}: ${edition.name} — alquran.cloud
          </p>
        `);
      })
      .catch((err) => {
        render(body, errorState({
          title: err.kind === 'offline' ? t('offline') : t('err_load'),
          text: err.kind === 'offline' ? t('tafsir_online') : t('tafsir_none'),
          onRetry: net.online ? fetchIt : null,
        }));
      });
  };

  fetchIt();
  return ui;
}

/* ------------------------------------------------------------------- share */

export function openShareSheet(ayah) {
  const ui = sheet({ title: t('share_title'), wide: true });
  let style = 'night';
  let busy = false;

  render(ui.body, html`
    <div class="stack stack-5">
      <div style="max-width:19rem;margin-inline:auto;width:100%">
        <canvas id="shareCanvas" style="width:100%;border-radius:var(--r-lg);box-shadow:var(--shadow-md);display:block;aspect-ratio:4/5;background:var(--surface-2)"></canvas>
      </div>

      <div class="row" style="justify-content:center;gap:var(--s2)" role="group" aria-label="${t('share_card')}">
        ${share.CARD_STYLES.map((s) => html`
          <button type="button" class="chip ${s === 'night' ? 'is-active' : ''}" data-style="${s}">
            ${s === 'night' ? 'Nata' : s === 'ivory' ? 'Ivory' : 'Gjelbër'}
          </button>`)}
      </div>

      <div class="grid grid--2">
        <button type="button" class="btn btn--primary" data-act="download">
          ${icon('download', 18)} ${t('share_download')}
        </button>
        <button type="button" class="btn btn--ghost" data-act="copy">
          ${icon('copy', 18)} ${t('share_copy')}
        </button>
      </div>

      <div>
        <p class="sec__title" style="margin-bottom:var(--s3)">${t('share')}</p>
        <div class="row wrap" style="gap:var(--s2)">
          ${share.canNativeShare() ? html`
            <button type="button" class="chip" data-act="native">${icon('share', 15)} ${t('share_native')}</button>` : ''}
          <a class="chip" data-target="whatsapp" href="#" target="_blank" rel="noopener">${t('share_whatsapp')}</a>
          <a class="chip" data-target="facebook" href="#" target="_blank" rel="noopener">${t('share_facebook')}</a>
          <a class="chip" data-target="x" href="#" target="_blank" rel="noopener">${t('share_x')}</a>
          <a class="chip" data-target="telegram" href="#" target="_blank" rel="noopener">Telegram</a>
        </div>
        <p class="t-xs dim" style="margin-top:var(--s3)">${t('share_instagram_hint')}</p>
      </div>
    </div>
  `);

  const canvas = $('#shareCanvas', ui.body);
  const links = share.shareTargets(ayah);
  $$('[data-target]', ui.body).forEach((a) => { a.href = links[a.dataset.target]; });

  async function draw() {
    if (busy) return;
    busy = true;
    try {
      const rendered = await share.renderCard(ayah, { style });
      canvas.width = rendered.width;
      canvas.height = rendered.height;
      canvas.getContext('2d').drawImage(rendered, 0, 0);
    } finally { busy = false; }
  }
  draw();

  $$('[data-style]', ui.body).forEach((b) => b.addEventListener('click', () => {
    style = b.dataset.style;
    $$('[data-style]', ui.body).forEach((x) => x.classList.toggle('is-active', x === b));
    draw();
  }));

  $('[data-act="download"]', ui.body)?.addEventListener('click', async () => {
    const rendered = await share.renderCard(ayah, { style });
    const blob = await share.canvasToBlob(rendered);
    if (!blob) { toast(t('err_load'), { icon: 'slash' }); return; }
    const shared = await share.nativeShareImage(blob, ayah);
    if (!shared) {
      share.downloadBlob(blob, `lexo-kuran-${ayah.s}-${ayah.a}.png`);
      toast(t('share_image_saved'), { icon: 'image' });
    }
  });

  $('[data-act="copy"]', ui.body)?.addEventListener('click', async () => {
    const ok = await copyText(share.ayahText(ayah));
    toast(ok ? t('copied_ok') : t('err_load'), { icon: 'copy' });
  });

  $('[data-act="native"]', ui.body)?.addEventListener('click', () => share.nativeShare(ayah));

  return ui;
}
