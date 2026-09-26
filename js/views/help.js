/* ==========================================================================
   Help — how the product works, in plain Albanian.
   ========================================================================== */

import { html, raw, render } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { t } from '../core/i18n.js';
import { openInstallHelp } from './partials.js';

function topics() {
  return [
    { ic: 'bookOpen', title: t('help_topic_read'), body: t('help_topic_read_b') },
    { ic: 'type', title: t('help_topic_view'), body: t('help_topic_view_b') },
    { ic: 'headphones', title: t('help_topic_listen'), body: t('help_topic_listen_b') },
    { ic: 'brain', title: t('help_topic_memorize'), body: t('help_topic_memorize_b') },
    { ic: 'search', title: t('help_topic_search'), body: t('help_topic_search_b') },
    { ic: 'download', title: t('help_topic_offline'), body: t('help_topic_offline_b') },
    { ic: 'lock', title: t('help_topic_data'), body: t('help_topic_data_b') },
  ];
}

export async function render_(mount) {
  const TOPICS = topics();
  render(mount, html`
    <div class="view stack stack-6">
      <header class="stack stack-2">
        <h1>${t('help')}</h1>
        <p class="muted t-sm">${t('tagline')}</p>
      </header>

      <div class="stack stack-3">
        ${TOPICS.map((topic, i) => html`
          <details class="card" ${i === 0 ? 'open' : ''}>
            <summary style="display:flex;align-items:center;gap:var(--s3);padding:var(--s4);cursor:pointer;list-style:none">
              <span class="quickbtn__icon" style="width:38px;height:38px;border-radius:10px">${icon(topic.ic, 18)}</span>
              <span class="fw-600 flex-1">${topic.title}</span>
              ${icon('chevronDown', 17)}
            </summary>
            <div class="prose" style="padding:0 var(--s4) var(--s4)">
              <p style="margin:0">${raw(topic.body)}</p>
            </div>
          </details>`)}
      </div>

      <button type="button" class="btn btn--outline btn--block" id="installHelp">
        ${icon('download', 18)} ${t('install_how')}
      </button>

      <div class="list">
        <a class="rowitem" href="#/about"><span class="rowitem__label">${t('about')}</span>${icon('chevronRight', 17)}</a>
        <a class="rowitem" href="#/about"><span class="rowitem__label">${t('sources')}</span>${icon('chevronRight', 17)}</a>
        <a class="rowitem" href="#/about"><span class="rowitem__label">${t('privacy')}</span>${icon('chevronRight', 17)}</a>
      </div>
    </div>
  `);

  document.getElementById('installHelp')?.addEventListener('click', () => openInstallHelp());

}

export default { render: render_ };
