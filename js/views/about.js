/* ==========================================================================
   About, sources, privacy — the trust surface.
   Every claim here must be true, and every source real.
   ========================================================================== */

import { html, render } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { t } from '../core/i18n.js';
import { getMeta, TAFSIR_EDITION } from '../core/quran.js';

export async function render_(mount) {
  const meta = getMeta();
  const ed = meta?.editions || {};

  render(mount, html`
    <div class="view stack stack-6">
      <header class="stack stack-3">
        <img src="icons/icon-192.png" alt="" width="64" height="64" style="border-radius:16px" decoding="async">
        <h1>${t('about')} LEXO KURAN</h1>
        <p class="muted">${t('about_lead')}</p>
      </header>

      <div class="prose">
        <h2>${t('about_what')}</h2>
        <p>${t('about_what_p')}</p>
        <ul>
          <li><strong>${t('about_li_text')}</strong> ${t('about_li_text_v')}</li>
          <li><strong>${t('about_li_recite')}</strong> ${t('about_li_recite_v')}</li>
          <li><strong>${t('about_li_hifz')}</strong> ${t('about_li_hifz_v')}</li>
          <li><strong>${t('about_li_local')}</strong> ${t('about_li_local_v')}</li>
          <li><strong>${t('about_li_free')}</strong></li>
        </ul>

        <h2 id="sources">${t('sources')}</h2>
        <p>${t('about_sources_p')}</p>
        <ul>
          <li>
            <strong>${t('about_src_ar')}</strong> — ${ed.ar?.name || 'Uthmani (Hafs)'}.
            ${t('about_source_label')} <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer">Tanzil.net</a> /
            <a href="https://qurancomplex.gov.sa" target="_blank" rel="noopener noreferrer">King Fahd Glorious Quran Printing Complex</a>.
          </li>
          <li>
            <strong>${t('about_src_sq')}</strong> — ${ed.sq?.name || 'Sherif Ahmeti'}.
            ${t('about_source_label')} <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer">Tanzil.net</a>.
          </li>
          <li>
            <strong>${t('about_src_en')}</strong> — ${ed.en?.name || 'Saheeh International'}.
            ${t('about_source_label')} <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer">Tanzil.net</a>.
          </li>
          <li>
            <strong>${t('about_src_tl')}</strong> — ${ed.tl?.name || 'Transliterim fonetik'} ${t('about_src_tl_v')}
          </li>
          <li>
            <strong>${t('about_src_recite')}</strong> — <a href="https://islamic.network" target="_blank" rel="noopener noreferrer">islamic.network</a>.
          </li>
          <li>
            <strong>${t('about_src_tafsir')}</strong> — ${TAFSIR_EDITION.name} ${t('about_src_tafsir_v')}
            <a href="https://alquran.cloud" target="_blank" rel="noopener noreferrer">alquran.cloud</a>.
            ${t('about_src_note')}
          </li>
        </ul>
        <p>${t('about_disclaimer')}</p>

        <h2 id="privacy">${t('privacy')}</h2>
        <p>${t('about_privacy_p')}</p>
        <ul>
          <li>${t('about_priv_local')} <strong>${t('about_priv_local_v')}</strong></li>
          <li>${t('about_priv_send')}</li>
          <li>${t('about_priv_notif')}</li>
          <li>${t('about_priv_remote')}</li>
        </ul>

        <h2 id="contact">${t('contact')}</h2>
        <p>${t('about_contact_p')}</p>
      </div>

      <div class="card card--pad">
        <p class="t-sm fw-600">${t('tagline_alt')}</p>
        <p class="t-xs dim" style="margin-top:var(--s2)">LEXO KURAN</p>
      </div>
    </div>
  `);
}

export default { render: render_ };
