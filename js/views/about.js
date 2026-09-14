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
        <h2>Çfarë është</h2>
        <p>
          LEXO KURAN është një aplikacion i lirë për lexim, dëgjim, kuptim dhe memorizim të Kuranit,
          i ndërtuar posaçërisht për lexuesin shqiptar. Punon në shfletues, instalohet si aplikacion
          dhe funksionon edhe pa internet.
        </p>
        <ul>
          <li><strong>Teksti i plotë arab</strong> me përkthim shqip dhe anglisht.</li>
          <li><strong>Recitime</strong> nga nëntë recitues të njohur.</li>
          <li><strong>Memorizim (hifz)</strong> me përsëritje të planifikuar.</li>
          <li><strong>Favorite, shënime personale dhe statistika</strong> — të gjitha ruhen vetëm në pajisjen tënde.</li>
          <li><strong>Pa llogari, pa reklama, pa gjurmim.</strong></li>
        </ul>

        <h2 id="sources">${t('sources')}</h2>
        <p>Përmbajtja fetare nuk është shkruar nga ne. Këto janë burimet e sakta:</p>
        <ul>
          <li>
            <strong>Teksti arab</strong> — ${ed.ar?.name || 'Uthmani (Hafs)'}.
            Burimi: <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer">Tanzil.net</a> /
            <a href="https://qurancomplex.gov.sa" target="_blank" rel="noopener noreferrer">King Fahd Glorious Quran Printing Complex</a>.
          </li>
          <li>
            <strong>Përkthimi shqip</strong> — ${ed.sq?.name || 'Sherif Ahmeti'}.
            Burimi: <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer">Tanzil.net</a>.
          </li>
          <li>
            <strong>Përkthimi anglisht</strong> — ${ed.en?.name || 'Saheeh International'}.
            Burimi: <a href="https://tanzil.net" target="_blank" rel="noopener noreferrer">Tanzil.net</a>.
          </li>
          <li>
            <strong>Transliterimi</strong> — ${ed.tl?.name || 'Transliterim fonetik'} (ndihmë leximi, jo zëvendësim i arabishtes).
          </li>
          <li>
            <strong>Recitimet</strong> — <a href="https://islamic.network" target="_blank" rel="noopener noreferrer">islamic.network</a>.
          </li>
          <li>
            <strong>Tefsiri</strong> — ${TAFSIR_EDITION.name} (arabisht), nëpërmjet
            <a href="https://alquran.cloud" target="_blank" rel="noopener noreferrer">alquran.cloud</a>.
            Tefsiri kërkon lidhje me internetin.
          </li>
        </ul>
        <p>
          Aplikacioni nuk gjeneron, nuk përmbledh dhe nuk interpreton përmbajtje fetare me mjete automatike.
          Nëse vëren një gabim në tekst ose përkthim, na njofto dhe e korrigjojmë te burimi.
        </p>

        <h2 id="privacy">${t('privacy')}</h2>
        <p>
          Nuk kërkohet llogari, email, fjalëkalim apo vendndodhje. Nuk ka reklama dhe nuk ka gjurmues.
        </p>
        <ul>
          <li>Favoritet, shënimet, progresi i memorizimit dhe statistikat ruhen <strong>vetëm lokalisht</strong>, në shfletuesin tënd.</li>
          <li>Asnjë prej tyre nuk dërgohet askund. Mund t’i eksportosh ose fshish në çdo moment te Cilësimet.</li>
          <li>Njoftimet kërkohen vetëm kur i aktivizon vetë, dhe funksionojnë lokalisht.</li>
          <li>Recitimet dhe tefsiri merren nga serverët e përmendur më sipër kur je online.</li>
        </ul>

        <h2 id="contact">${t('contact')}</h2>
        <p>
          Për gabime, sugjerime ose bashkëpunim me xhami dhe institucione edukative, na shkruaj.
          Projekti është i hapur për përmirësime.
        </p>
      </div>

      <div class="card card--pad">
        <p class="t-sm fw-600">${t('tagline_alt')}</p>
        <p class="t-xs dim" style="margin-top:var(--s2)">LEXO KURAN</p>
      </div>
    </div>
  `);
}

export default { render: render_ };
