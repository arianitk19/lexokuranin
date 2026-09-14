/* ==========================================================================
   Help — how the product works, in plain Albanian.
   ========================================================================== */

import { html, raw, render } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { t } from '../core/i18n.js';
import { openInstallHelp } from './partials.js';

const TOPICS = [
  {
    ic: 'bookOpen',
    title: 'Si të lexoj',
    body: `Hap <strong>Kuran</strong>, zgjidh një sure dhe fillo. Aplikacioni e mban mend ku ke mbetur —
           herën tjetër, kartela «Vazhdo leximin» te ballina të kthen pikërisht aty.
           Trokit mbi çdo ajet për ta dëgjuar, ruajtur, kopjuar, ndarë ose shënuar.`,
  },
  {
    ic: 'type',
    title: 'Ta përshtat pamjen',
    body: `Te lexuesi, butoni <strong>Cilësimet e leximit</strong> ndryshon madhësinë e fontit arab,
           hapësirën mes rreshtave, fontin arab dhe cilat përkthime shfaqen.
           Modaliteti i fokusit i fsheh kontrollet — trokit në mes të ekranit për t’i rikthyer.`,
  },
  {
    ic: 'headphones',
    title: 'Dëgjimi',
    body: `Zgjidh recituesin te <strong>Audio</strong>. Luajtësi i vogël të shoqëron gjatë leximit pa e mbuluar tekstin.
           Mund të përsëritësh një ajet disa herë, një pjesë ose të gjithë suren — të dobishme për memorizim.
           Recitimet e dëgjuara ruhen dhe punojnë edhe offline.`,
  },
  {
    ic: 'brain',
    title: 'Memorizimi',
    body: `Te <strong>Memorizo</strong> zgjedh suren, pjesën dhe mënyrën: lexo, dëgjo, fsheh arabishten,
           fsheh përkthimin, kujto ose kuiz. Pas çdo ajeti shënon nëse e dije apo jo — aplikacioni
           e llogarit vetë kur duhet ta përsëritësh. Ajetet për sot shfaqen te «Radha e përsëritjes».`,
  },
  {
    ic: 'search',
    title: 'Kërkimi',
    body: `Kërko me fjalë shqip, anglisht ose arabisht. Mund të shkruash edhe një referencë si
           <strong>2:255</strong> ose vetëm numrin e sures. Herën e parë shkarkohet indeksi i kërkimit;
           pas kësaj kërkimi punon edhe pa internet.`,
  },
  {
    ic: 'download',
    title: 'Offline',
    body: `Te <strong>Cilësimet → Offline</strong> shkarko Kuranin e plotë në pajisje.
           Pas kësaj, leximi, kërkimi dhe memorizimi punojnë plotësisht pa internet.
           Vetëm recitimet e reja dhe tefsiri kërkojnë lidhje.`,
  },
  {
    ic: 'lock',
    title: 'Të dhënat e mia',
    body: `Gjithçka ruhet vetëm në pajisjen tënde. Mund t’i eksportosh si skedar, t’i importosh
           në një pajisje tjetër, ose t’i fshish plotësisht — te <strong>Cilësimet → Të dhënat</strong>.`,
  },
];

export async function render_(mount) {
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
