/* ===== Kurani · Content & platform layer =====
   Loaded after app.js. Adds: Help/Guide, Quran articles (Learn), a desktop
   sidebar + responsive shell, a "?" app-bar button, and a professional audio
   player (seek, time, speed). Kept in a separate file for stability. */
(function(){
  'use strict';
  const lc = o => (o && (o[STATE.uiLang] || o.sq)) || '';
  const fmtTime = s => { if(!isFinite(s)) return '0:00'; const m=Math.floor(s/60), ss=Math.floor(s%60); return m+':'+String(ss).padStart(2,'0'); };

  /* ============================================================
     1. ARTICLES — about the Quran (sq / en / ar)
     ============================================================ */
  const ARTICLES = [
    {
      id:'cdo-eshte', icon:'info', c1:'#13a06f', c2:'#0c6b4a',
      title:{sq:'Çfarë është Kurani?',en:'What is the Quran?',ar:'ما هو القرآن؟'},
      sum:{sq:'Fjala e Allahut, e shpallur Profetit Muhamed a.s.',en:'The word of God revealed to Prophet Muhammad ﷺ.',ar:'كلام الله المنزل على النبي محمد ﷺ.'},
      body:{
        sq:`<p>Kurani është fjala e Allahut, e shpallur fjalë për fjalë Profetit Muhamed (paqja qoftë mbi të) përmes engjëllit Xhibril, gjatë një periudhe prej afërsisht 23 vjetësh.</p>
<p>Ai përbëhet nga <b>114 sure</b> dhe mbi <b>6.200 ajete</b>. Është teksti themelor i Islamit dhe udhërrëfyesi shpirtëror, moral e ligjor për mbi një miliard e gjysmë myslimanë në botë.</p>
<p>Teksti origjinal arab është ruajtur i pandryshuar që nga shpallja e tij, dhe miliona besimtarë e kanë mësuar përmendsh tërësisht — një traditë e quajtur <b>Hifz</b>.</p>`,
        en:`<p>The Quran is the word of God, revealed verbatim to Prophet Muhammad (peace be upon him) through the angel Gabriel over a period of about 23 years.</p>
<p>It consists of <b>114 chapters (surahs)</b> and more than <b>6,200 verses</b>. It is the central religious text of Islam and the spiritual, moral and legal guide for over 1.5 billion Muslims worldwide.</p>
<p>The original Arabic text has been preserved unchanged since its revelation, and millions of believers have memorized it in full — a tradition known as <b>Hifz</b>.</p>`,
        ar:`<p>القرآن هو كلام الله، المنزل لفظًا على النبي محمد ﷺ عبر جبريل خلال نحو ثلاث وعشرين سنة.</p>
<p>يتكوّن من <b>114 سورة</b> وأكثر من <b>6200 آية</b>، وهو المصدر الأساسي للإسلام ودليل المسلمين الروحي والأخلاقي.</p>
<p>حُفظ نصه العربي دون تغيير منذ نزوله، وحفظه ملايين المؤمنين كاملًا.</p>`
      }
    },
    {
      id:'shpallja', icon:'moon', c1:'#8b5cf6', c2:'#6033c4',
      title:{sq:'Si zbriti Kurani',en:'How the Quran was revealed',ar:'كيف نزل القرآن'},
      sum:{sq:'Nga Nata e Kadrit te shpallja gjatë 23 vjetëve.',en:'From Laylat al-Qadr to a 23-year revelation.',ar:'من ليلة القدر إلى نزول دام 23 عامًا.'},
      body:{
        sq:`<p>Shpallja filloi në <b>Natën e Kadrit</b>, në muajin Ramazan, me ajetet e para të sures El-Alak: «Lexo në emër të Zotit tënd që krijoi».</p>
<p>Kurani nuk zbriti përnjëherë, por gradualisht përgjatë afërsisht 23 vjetëve, duke iu përgjigjur ngjarjeve dhe pyetjeve të kohës. Kjo ndihmoi besimtarët ta kuptonin e ta zbatonin atë hap pas hapi.</p>
<p>Sahabët (shokët e Profetit) e shkruanin dhe e mësonin përmendsh menjëherë, duke siguruar ruajtjen e tij të përpiktë.</p>`,
        en:`<p>Revelation began on <b>Laylat al-Qadr</b> (the Night of Decree) in Ramadan, with the first verses of Surah Al-Alaq: "Read in the name of your Lord who created."</p>
<p>The Quran was not revealed all at once but gradually over about 23 years, responding to the events and questions of the time. This helped believers understand and apply it step by step.</p>
<p>The Companions wrote it down and memorized it immediately, ensuring its precise preservation.</p>`,
        ar:`<p>بدأ النزول في <b>ليلة القدر</b> في رمضان بأوائل سورة العلق: «اقرأ باسم ربك الذي خلق».</p>
<p>لم ينزل القرآن دفعة واحدة بل مُنجّمًا خلال نحو 23 عامًا، استجابةً لأحداث العصر وأسئلته.</p>
<p>كان الصحابة يكتبونه ويحفظونه فورًا، مما حفظ نصه بدقة.</p>`
      }
    },
    {
      id:'si-lexohet', icon:'tafsir', c1:'#3b82f6', c2:'#2256c4',
      title:{sq:'Si të lexosh Kuranin',en:'How to read the Quran',ar:'كيف تقرأ القرآن'},
      sum:{sq:'Etika, pastërtia dhe bazat e texhvidit.',en:'Etiquette, purity and the basics of tajwid.',ar:'الآداب والطهارة وأساسيات التجويد.'},
      body:{
        sq:`<p>Para leximit, është e pëlqyeshme të jesh me abdes dhe të fillosh me <b>«Eudhu bil-lahi minesh-shejtanir-raxhim»</b> dhe <b>«Bismil-lah»</b>.</p>
<p><b>Texhvidi</b> është shkenca e shqiptimit të saktë të shkronjave dhe rregullave të leximit. Lexo ngadalë (tertil), me përkushtim, duke reflektuar mbi kuptimin.</p>
<p>Nuk ka nevojë të nxitosh. Edhe pak ajete të lexuara me kuptim e përkushtim janë më të vlefshme se shumë të lexuara me nxitim.</p>`,
        en:`<p>Before reading, it is recommended to be in a state of purity (wudu) and to begin with <b>"A'udhu billahi min ash-shaytan ir-rajim"</b> and <b>"Bismillah"</b>.</p>
<p><b>Tajwid</b> is the science of correct pronunciation of letters and recitation rules. Read slowly (tartil), with devotion, reflecting on the meaning.</p>
<p>There is no need to rush. A few verses read with understanding and presence of heart are worth more than many read hastily.</p>`,
        ar:`<p>يُستحب قبل القراءة أن تكون على طهارة وأن تبدأ بـ<b>«أعوذ بالله من الشيطان الرجيم»</b> و<b>«بسم الله»</b>.</p>
<p><b>التجويد</b> هو علم النطق الصحيح للحروف وأحكام التلاوة. اقرأ ترتيلًا بخشوع متدبّرًا المعنى.</p>
<p>لا داعي للعجلة؛ فآياتٌ تُقرأ بفهم وحضور قلب خيرٌ من كثيرٍ بعجلة.</p>`
      }
    },
    {
      id:'vlera', icon:'memorize', c1:'#e0a93b', c2:'#c07d18',
      title:{sq:'Vlera e leximit',en:'The virtue of reciting',ar:'فضل التلاوة'},
      sum:{sq:'Çdo shkronjë sjell shpërblim e dritë.',en:'Every letter brings reward and light.',ar:'كل حرف يجلب أجرًا ونورًا.'},
      body:{
        sq:`<p>Profeti Muhamed a.s. ka thënë: «Kush lexon një shkronjë nga Libri i Allahut, ka një të mirë, dhe e mira shpërblehet dhjetëfish».</p>
<p>Leximi i rregullt i Kuranit qetëson zemrën, forcon besimin dhe është një lidhje e drejtpërdrejtë me fjalën e Allahut. Ai do të ndërmjetësojë për lexuesin e tij në Ditën e Gjykimit.</p>
<p>Bëje leximin e Kuranit pjesë të përditshmërisë — qoftë edhe pak çdo ditë, me vazhdueshmëri.</p>`,
        en:`<p>Prophet Muhammad (peace be upon him) said: "Whoever reads one letter from the Book of God earns a good deed, and a good deed is multiplied tenfold."</p>
<p>Regular recitation of the Quran calms the heart, strengthens faith and is a direct connection to the word of God. It will intercede for its reader on the Day of Judgement.</p>
<p>Make reciting the Quran part of your daily routine — even a little each day, consistently.</p>`,
        ar:`<p>قال النبي ﷺ: «من قرأ حرفًا من كتاب الله فله حسنة، والحسنة بعشر أمثالها».</p>
<p>التلاوة المنتظمة تطمئن القلب وتقوّي الإيمان، وهي صلة مباشرة بكلام الله، وتشفع لصاحبها يوم القيامة.</p>
<p>اجعل تلاوة القرآن جزءًا من يومك ولو قليلًا بثبات.</p>`
      }
    },
    {
      id:'struktura', icon:'surahs', c1:'#1f9e8f', c2:'#0f6e63',
      title:{sq:'Struktura e Kuranit',en:'Structure of the Quran',ar:'بنية القرآن'},
      sum:{sq:'Sure, ajete, xhuze dhe sure mekase/medinase.',en:'Surahs, verses, juz and Meccan/Medinan chapters.',ar:'سور وآيات وأجزاء ومكي ومدني.'},
      body:{
        sq:`<p>Kurani ndahet në <b>114 sure</b>, secila e përbërë nga <b>ajete</b> (vargje). Sureja më e gjatë është El-Bekare (286 ajete), më e shkurtra El-Kevther (3 ajete).</p>
<p>Për lehtësi leximi, Kurani ndahet gjithashtu në <b>30 xhuze</b> (pjesë të barabarta), që ndihmojnë p.sh. leximin e plotë gjatë Ramazanit.</p>
<p>Suret klasifikohen si <b>mekase</b> (të shpallura para hixhretit në Mekë) ose <b>medinase</b> (pas hixhretit në Medinë), gjë që ndihmon në kuptimin e kontekstit.</p>`,
        en:`<p>The Quran is divided into <b>114 surahs</b>, each made of <b>verses (ayahs)</b>. The longest surah is Al-Baqarah (286 verses), the shortest Al-Kawthar (3 verses).</p>
<p>For ease of reading, the Quran is also divided into <b>30 juz</b> (equal parts), useful for completing a full reading during Ramadan.</p>
<p>Surahs are classified as <b>Meccan</b> (revealed before the migration, in Mecca) or <b>Medinan</b> (after the migration, in Medina), which helps understand their context.</p>`,
        ar:`<p>ينقسم القرآن إلى <b>114 سورة</b>، كل منها من <b>آيات</b>. أطول سورة البقرة (286 آية) وأقصرها الكوثر (3 آيات).</p>
<p>وللتيسير يُقسَّم أيضًا إلى <b>30 جزءًا</b> متساوية، تفيد في ختمه خلال رمضان.</p>
<p>وتُصنَّف السور <b>مكية</b> (قبل الهجرة) أو <b>مدنية</b> (بعدها)، مما يعين على فهم سياقها.</p>`
      }
    },
    {
      id:'hifz', icon:'learn', c1:'#f43f7a', c2:'#c41d56',
      title:{sq:'Memorizimi (Hifz)',en:'Memorization (Hifz)',ar:'الحفظ'},
      sum:{sq:'Udhëzues praktik për të mësuar përmendsh.',en:'A practical guide to memorizing.',ar:'دليل عملي للحفظ.'},
      body:{
        sq:`<p>Hifz do të thotë të mësosh Kuranin përmendsh. Fillo me sure të shkurtra (Xhuzi 30), përsërit çdo ajet disa herë, dhe lidhe të renë me të vjetrën çdo ditë.</p>
<p><b>Këshilla:</b> cakto një kohë fikse çdo ditë, dëgjo recituesin tënd të preferuar, përsërit me zë, dhe mos kalo te ajeti tjetër pa e forcuar të mëparshmin.</p>
<p>Përdor modalitetin <b>Memorizim</b> në këtë aplikacion për të shënuar ajetet e mësuara dhe për të ndjekur progresin tënd.</p>`,
        en:`<p>Hifz means memorizing the Quran by heart. Start with short surahs (Juz 30), repeat each verse several times, and connect the new with the old every day.</p>
<p><b>Tips:</b> set a fixed time each day, listen to your favourite reciter, repeat aloud, and don't move to the next verse before securing the previous one.</p>
<p>Use the <b>Memorize</b> mode in this app to mark learned verses and track your progress.</p>`,
        ar:`<p>الحفظ هو حفظ القرآن عن ظهر قلب. ابدأ بالسور القصيرة (جزء عمّ)، وكرّر كل آية مرات، واربط الجديد بالقديم يوميًا.</p>
<p><b>نصائح:</b> خصّص وقتًا ثابتًا يوميًا، استمع لقارئك المفضّل، كرّر بصوتٍ مسموع، ولا تنتقل للآية التالية قبل إتقان السابقة.</p>
<p>استخدم وضع <b>الحفظ</b> في هذا التطبيق لتعليم الآيات المحفوظة ومتابعة تقدّمك.</p>`
      }
    }
  ];

  /* ============================================================
     2. HELP / GUIDE content
     ============================================================ */
  const HELP_STEPS = [
    {icon:'surahs', t:{sq:'Lexo Kuranin',en:'Read the Quran',ar:'اقرأ القرآن'},
      d:{sq:'Hap “Suret”, zgjidh një sure dhe lexo tekstin arab me përkthim shqip/anglisht. Pozicioni yt ruhet automatikisht te “Vazhdo leximin”.',
         en:'Open “Surahs”, pick a chapter and read the Arabic with Albanian/English translation. Your position is saved automatically under “Continue reading”.',
         ar:'افتح «السور»، اختر سورة واقرأ النص العربي مع الترجمة. يُحفظ موضعك تلقائيًا في «متابعة القراءة».'}},
    {icon:'audio', t:{sq:'Dëgjo recitime',en:'Listen to recitations',ar:'استمع للتلاوات'},
      d:{sq:'Shtyp ▶ te një sure ose ajet. Zgjidh recituesin te “Audio”. Përdor shiritin për të kërcyer, butonin e shpejtësisë dhe përsëritjen e ajetit/sures.',
         en:'Tap ▶ on a surah or verse. Choose a reciter under “Audio”. Use the seek bar, the speed button and verse/surah repeat.',
         ar:'اضغط ▶ على سورة أو آية. اختر القارئ من «الصوت». استخدم شريط التقديم وزر السرعة وتكرار الآية/السورة.'}},
    {icon:'search', t:{sq:'Kërko',en:'Search',ar:'ابحث'},
      d:{sq:'Shkruaj një fjalë (shqip, anglisht ose arabisht) ose numrin e sures për ta hapur menjëherë.',
         en:'Type a word (Albanian, English or Arabic) or a surah number to open it instantly.',
         ar:'اكتب كلمة أو رقم السورة لفتحها فورًا.'}},
    {icon:'saved', t:{sq:'Favoritet & Tefsir',en:'Bookmarks & Tafsir',ar:'المحفوظة والتفسير'},
      d:{sq:'Te çdo ajet: ruaj si favorit, kopjo, shëno si memorizuar, ose hap tefsirin për shpjegim.',
         en:'On each verse: bookmark, copy, mark as memorized, or open the tafsir for an explanation.',
         ar:'عند كل آية: احفظ، انسخ، علّمها محفوظة، أو افتح التفسير.'}},
    {icon:'moon', t:{sq:'Tema & Gjuha',en:'Theme & Language',ar:'السمة واللغة'},
      d:{sq:'Lart djathtas: ndërro temën (E çelët, E errët, Sepia, Nata) dhe gjuhën (SQ/EN/AR) në kohë reale.',
         en:'Top right: switch theme (Light, Dark, Sepia, Night) and language (SQ/EN/AR) in real time.',
         ar:'أعلى اليمين: بدّل السمة واللغة فورًا.'}},
    {icon:'info', t:{sq:'Offline & Instalim',en:'Offline & Install',ar:'دون اتصال والتثبيت'},
      d:{sq:'Pas hapjes së parë, përmbajtja ruhet dhe punon pa internet. Instalo aplikacionin nga Cilësimet për përvojë si app vendas.',
         en:'After the first load, content is cached and works offline. Install the app from Settings for a native-like experience.',
         ar:'بعد التحميل الأول يعمل دون اتصال. ثبّت التطبيق من الإعدادات لتجربة كالتطبيق الأصلي.'}}
  ];

  /* ============================================================
     3. ROUTES — Learn, Article, Help
     ============================================================ */
  route('#/learn', (view)=>{
    $('#barTitle').textContent = t('learn_title');
    view.innerHTML = `
      <section class="hero-card rounded-3xl p-5 text-white relative overflow-hidden mb-5 ring-gold" style="background:linear-gradient(135deg,#1b2b24,#0a4b38)">
        <div class="absolute -right-8 -top-8 w-40 h-40 rounded-full" style="background:radial-gradient(circle,rgba(212,175,89,.35),transparent 70%)"></div>
        <div class="relative">
          <p class="text-[11px] font-bold uppercase tracking-[.14em]" style="color:#f0d696">${t('about_quran')}</p>
          <h2 class="text-2xl font-extrabold mt-1">${t('learn_title')}</h2>
          <p class="text-white/70 text-sm mt-1">${t('learn_sub')}</p>
        </div>
      </section>
      <button onclick="location.hash='#/help'" class="tap w-full surface rounded-2xl border brd shadow-card p-4 flex items-center gap-3 mb-4 text-left">
        <span class="icon-chip shrink-0" style="--c1:#6366f1;--c2:#3f3fc4">${svgIcon('help',22)}</span>
        <span class="flex-1"><span class="font-bold block">${t('how_to')}</span><span class="txt-muted text-xs">${t('s_help')}</span></span>
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
      </button>
      <p class="text-xs font-bold uppercase tracking-wider txt-muted mb-2.5 px-1">${t('articles')}</p>
      <div class="space-y-2.5">${ARTICLES.map(a=>`
        <button onclick="location.hash='#/article/${a.id}'" class="tap w-full surface rounded-2xl border brd shadow-card p-3.5 flex items-center gap-3 text-left">
          <span class="icon-chip shrink-0" style="--c1:${a.c1};--c2:${a.c2}">${svgIcon(a.icon,22)}</span>
          <span class="flex-1 min-w-0"><span class="font-bold block truncate">${lc(a.title)}</span><span class="txt-muted text-xs">${lc(a.sum)}</span></span>
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
        </button>`).join('')}</div>`;
  });

  route('#/article', (view, rest)=>{
    const a = ARTICLES.find(x=>x.id===rest[0]);
    if(!a){ location.hash='#/learn'; return; }
    $('#barTitle').textContent = lc(a.title);
    const dir = STATE.uiLang==='ar' ? 'rtl' : 'ltr';
    view.innerHTML = `
      <section class="rounded-3xl p-6 text-white relative overflow-hidden mb-5 ring-gold" style="background:linear-gradient(135deg,${a.c1},${a.c2})">
        <div class="absolute -right-6 -bottom-8 opacity-25">${svgIcon(a.icon,120)}</div>
        <div class="relative">
          <span class="icon-chip mb-3" style="--c1:rgba(255,255,255,.25);--c2:rgba(255,255,255,.12)">${svgIcon(a.icon,24)}</span>
          <h1 class="text-2xl font-extrabold leading-tight">${lc(a.title)}</h1>
          <p class="text-white/75 text-sm mt-1">${lc(a.sum)}</p>
        </div>
      </section>
      <article class="surface rounded-2xl border brd shadow-card p-5 leading-relaxed article-body" dir="${dir}" style="font-size:16px">${lc(a.body)}</article>
      <button onclick="location.hash='#/learn'" class="tap mt-4 w-full surface rounded-2xl border brd shadow-card p-3.5 font-semibold accent text-center">← ${t('articles')}</button>`;
  });

  route('#/help', (view)=>{
    $('#barTitle').textContent = t('s_help');
    view.innerHTML = `
      <section class="hero-card rounded-3xl p-5 text-white relative overflow-hidden mb-5 ring-gold" style="background:linear-gradient(135deg,#13a06f,#0a4b38)">
        <div class="relative flex items-center gap-3">
          <span class="icon-chip" style="--c1:rgba(255,255,255,.25);--c2:rgba(255,255,255,.1)">${svgIcon('help',24)}</span>
          <div><h2 class="text-xl font-extrabold">${t('how_to')}</h2><p class="text-white/70 text-sm">Kurani · ${t('s_help')}</p></div>
        </div>
      </section>
      <div class="space-y-3">${HELP_STEPS.map((s,i)=>`
        <div class="surface rounded-2xl border brd shadow-card p-4 flex gap-3">
          <span class="icon-chip shrink-0" style="--c1:#13a06f;--c2:#0a4b38">${svgIcon(s.icon,22)}</span>
          <div><p class="font-bold mb-0.5">${i+1}. ${lc(s.t)}</p><p class="txt-muted text-sm leading-relaxed">${lc(s.d)}</p></div>
        </div>`).join('')}</div>
      <button onclick="location.hash='#/learn'" class="tap mt-4 w-full surface rounded-2xl border brd shadow-card p-3.5 font-semibold accent text-center">${t('learn_title')} →</button>`;
  });

  /* ============================================================
     4. "?" button in the app bar
     ============================================================ */
  (function addHelpBtn(){
    const grp = document.querySelector('#appbar .ml-auto');
    if(!grp) return;
    const btn = document.createElement('button');
    btn.className = 'tap w-9 h-9 rounded-full surface-2 grid place-items-center';
    btn.setAttribute('aria-label','Help');
    btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.4 9.4a2.7 2.7 0 0 1 5.2 1c0 1.8-2.6 2.1-2.6 3.8"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>`;
    btn.onclick = ()=> location.hash = '#/help';
    grp.insertBefore(btn, grp.firstChild);
  })();

  /* ============================================================
     5. DESKTOP SIDEBAR + responsive shell
     ============================================================ */
  const SIDE_ITEMS = [
    ['#/','home','nav_home'],['#/surahs','surahs','nav_surahs'],['#/search','search','nav_search'],
    ['#/audio','audio','quick_audio'],['#/bookmarks','saved','nav_saved'],['#/memorize','memorize','quick_memorize'],
    ['#/stats','stats','quick_stats'],['#/learn','learn','learn'],['#/help','help','help'],['#/settings','info','nav_settings']
  ];
  function sideIcon(name){
    if(name==='home') return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 10.5 12 4l7 6.5V20H5z" fill="currentColor" opacity=".18"/><path d="M3.5 11 12 3.5 20.5 11M5 10v10h14V10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return svgIcon(name,22);
  }
  const sidenav = document.createElement('nav');
  sidenav.id = 'sidenav';
  sidenav.innerHTML = `
    <div class="snav-brand">
      <div class="snav-logo"><svg width="22" height="22" viewBox="0 0 100 100"><path d="M62 20a32 32 0 1 0 0 60 26 26 0 1 1 0-60Z" fill="#d4af59"/></svg></div>
      <div><p class="snav-title">Kurani</p><p class="snav-sub">القرآن الكريم</p></div>
    </div>
    <div class="snav-list">${SIDE_ITEMS.map(([href,ic,key])=>`
      <button class="snav-item" data-nav="${href}"><span class="snav-ic">${sideIcon(ic)}</span><span class="snav-label" data-i18n="${key}">${t(key)}</span></button>`).join('')}</div>
    <p class="snav-foot">v1.0 · AlQuran.cloud</p>`;
  document.body.appendChild(sidenav);

  function syncSide(){
    const hash = location.hash || '#/';
    const base = '#/' + (hash.slice(2).split('/')[0] || '');
    sidenav.querySelectorAll('.snav-item').forEach(b=> b.classList.toggle('active', b.dataset.nav===base));
  }
  sidenav.querySelectorAll('.snav-item').forEach(b=> b.onclick = ()=>{ location.hash = b.dataset.nav; });
  window.addEventListener('hashchange', syncSide); syncSide();

  /* ============================================================
     6. Inject CSS (desktop shell, article, sidebar, audio)
     ============================================================ */
  const css = `
    .article-body p{margin:0 0 .9rem} .article-body p:last-child{margin-bottom:0} .article-body b{color:var(--accent)}
    /* Sidebar (hidden on mobile) */
    #sidenav{display:none;position:fixed;top:0;left:0;bottom:0;width:260px;flex-direction:column;z-index:50;
      background:var(--surface);border-right:1px solid var(--border);padding:18px 14px}
    .snav-brand{display:flex;align-items:center;gap:10px;padding:6px 8px 16px;border-bottom:1px solid var(--border);margin-bottom:12px}
    .snav-logo{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,#107A5B,#0a4b38)}
    .snav-title{font-weight:800;font-size:18px;line-height:1} .snav-sub{font-size:11px;color:var(--muted);font-family:'Amiri Quran',serif}
    .snav-list{display:flex;flex-direction:column;gap:4px;flex:1;overflow:auto}
    .snav-item{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:14px;color:var(--muted);
      font-weight:600;font-size:14px;text-align:left;transition:background .2s,color .2s,transform .12s}
    .snav-item:hover{background:var(--surface-2);color:var(--text)} .snav-item:active{transform:scale(.98)}
    .snav-item.active{background:var(--accent-soft);color:var(--accent)}
    .snav-ic{width:26px;display:grid;place-items:center}
    .snav-foot{font-size:11px;color:var(--muted);text-align:center;padding-top:10px}
    /* Audio pro controls */
    #pSeek{height:6px;border-radius:99px;background:var(--border);cursor:pointer;position:relative;margin-top:6px}
    #pSeek>i{position:absolute;left:0;top:0;height:100%;border-radius:99px;background:var(--accent);width:0%}
    #pSeek>b{position:absolute;top:50%;width:12px;height:12px;border-radius:50%;background:var(--accent);transform:translate(-50%,-50%);box-shadow:0 1px 4px rgba(0,0,0,.3)}
    .pTimes{display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-top:3px;font-variant-numeric:tabular-nums}
    #pSpeed{font-size:11px;font-weight:800}
    @media (min-width:1024px){
      #bottomnav{display:none}
      #sidenav{display:flex}
      body{padding-left:260px}
      #player{left:260px;bottom:1.2rem}
      #view{max-width:860px;padding-bottom:7rem;padding-top:1.2rem}
      #appbar .max-w-3xl{max-width:860px}
      #view .grid.grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
    }
    @media (min-width:1280px){ #view{max-width:920px} #appbar .max-w-3xl{max-width:920px} }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ============================================================
     7. Professional audio: seek bar, time, playback speed
     ============================================================ */
  (function audioPro(){
    const a = Player.audio;
    const titleWrap = $('#pTitle') && $('#pTitle').parentElement;
    if(!titleWrap) return;
    // replace the thin bar with a seekable track + times
    const oldBar = titleWrap.querySelector('#pBar') && titleWrap.querySelector('#pBar').parentElement;
    if(oldBar) oldBar.remove();
    titleWrap.insertAdjacentHTML('beforeend',
      `<div id="pSeek"><i id="pFill"></i><b id="pKnob" style="left:0%"></b></div>
       <div class="pTimes"><span id="pCur">0:00</span><span id="pDur">0:00</span></div>`);
    const seek=$('#pSeek'), fill=$('#pFill'), knob=$('#pKnob'), cur=$('#pCur'), dur=$('#pDur');

    a.addEventListener('timeupdate', ()=>{
      if(!a.duration) return;
      const p = a.currentTime/a.duration*100;
      fill.style.width = p+'%'; knob.style.left = p+'%';
      cur.textContent = fmtTime(a.currentTime); dur.textContent = fmtTime(a.duration);
    });
    a.addEventListener('loadedmetadata', ()=> dur.textContent = fmtTime(a.duration));
    function seekTo(clientX){ const r=seek.getBoundingClientRect(); const f=Math.min(1,Math.max(0,(clientX-r.left)/r.width)); if(a.duration) a.currentTime=f*a.duration; }
    seek.addEventListener('click', e=> seekTo(e.clientX));
    let drag=false;
    seek.addEventListener('pointerdown', e=>{ drag=true; seekTo(e.clientX); seek.setPointerCapture(e.pointerId); });
    seek.addEventListener('pointermove', e=>{ if(drag) seekTo(e.clientX); });
    seek.addEventListener('pointerup', ()=> drag=false);

    // playback speed button (cycles)
    const speeds=[1,1.25,1.5,0.75]; let si=0;
    const repeatBtn = $('#pRepeat');
    if(repeatBtn){
      const sp=document.createElement('button');
      sp.id='pSpeed'; sp.className='tap w-9 h-9 grid place-items-center rounded-full surface-2 txt-muted';
      sp.setAttribute('aria-label','Speed'); sp.textContent='1x';
      sp.onclick=()=>{ si=(si+1)%speeds.length; a.playbackRate=speeds[si]; sp.textContent=speeds[si]+'x';
        sp.classList.toggle('accent', speeds[si]!==1); sp.classList.toggle('txt-muted', speeds[si]===1); };
      repeatBtn.parentElement.insertBefore(sp, repeatBtn);
    }
  })();

})();

/* ============================================================
   UX PATCHES · splash-once, audio resume & player fixes
   ============================================================ */
(function(){
  'use strict';
  // 1) Show the intro only on the first launch; skip instantly afterwards.
  try{
    if(localStorage.getItem('kurani.seenSplash')){ const sp=document.getElementById('splash'); if(sp) sp.remove(); }
    else localStorage.setItem('kurani.seenSplash','1');
  }catch(e){}

  // 2) Keep a hidden #pBar alive so app.js's old timeupdate handler never hits null.
  if(!document.getElementById('pBar')){
    const pl=document.getElementById('player');
    if(pl){ const b=document.createElement('div'); b.id='pBar'; b.style.cssText='position:absolute;width:0;height:0;overflow:hidden'; pl.appendChild(b); }
  }

  if(typeof Player==='undefined' || !Player.audio) return;
  const RKEY='kurani.audioResume';
  const a=Player.audio;

  // 3) Persist the current playback position (throttled).
  let last=0;
  function save(){ try{ if(Player.surah && Player.urls && Player.urls.length){
    localStorage.setItem(RKEY, JSON.stringify({s:Player.surah.number, idx:Player.idx, ct:a.currentTime||0, ts:Date.now()})); } }catch(e){} }
  a.addEventListener('timeupdate', ()=>{ const n=Date.now(); if(n-last>2000){ last=n; save(); } });
  a.addEventListener('pause', save);
  a.addEventListener('play', save);

  // 4) Resume-if-same: tapping play on the surah already loaded continues instead of restarting.
  if(typeof Player.playSurah==='function'){
    const origPlay = Player.playSurah.bind(Player);
    Player.playSurah = async function(s, startIdx){
      if(Player.surah && Player.surah.number===s.number && Player.urls && Player.urls.length){
        if(typeof startIdx==='number' && startIdx>0 && startIdx!==Player.idx){ Player.idx=startIdx; Player.load(); }
        const pl=document.getElementById('player'); if(pl) pl.hidden=false;
        Player.play();
        return;
      }
      return origPlay(s, startIdx);
    };
  }

  // 5) Clear the saved session whenever playback is stopped or closed.
  if(typeof Player.stop==='function'){
    const origStop = Player.stop.bind(Player);
    Player.stop = function(){ try{ localStorage.removeItem(RKEY); }catch(e){} return origStop(); };
  }
  const closeBtn=document.getElementById('pClose');
  if(closeBtn) closeBtn.addEventListener('click', ()=>{ try{ localStorage.removeItem(RKEY); }catch(e){} });

  // 6) On reopen, bring back a recent session (within 6h) ready to resume with one tap.
  async function restore(){
    let r; try{ r=JSON.parse(localStorage.getItem(RKEY)||'null'); }catch(e){ return; }
    if(!r || !r.s) return;
    if(Date.now()-(r.ts||0) > 6*3600*1000) return;
    try{
      const s=await Quran.surah(r.s);
      const urls=await Quran.surahAudio(r.s, STATE.reciter);
      if(!urls.length) return;
      Player.surah=s; Player.urls=urls; Player.idx=Math.min(r.idx||0, urls.length-1);
      const pl=document.getElementById('player'); if(pl) pl.hidden=false;
      a.src=urls[Player.idx];
      const seekTo=()=>{ try{ a.currentTime=r.ct||0; }catch(e){} a.removeEventListener('loadedmetadata', seekTo); };
      a.addEventListener('loadedmetadata', seekTo);
      const aNo = s.ayahs[Player.idx] ? s.ayahs[Player.idx].n : 1;
      const titleEl=document.getElementById('pTitle');
      if(titleEl) titleEl.textContent = (typeof surahName==='function'?surahName(s):s.englishName)+' · '+t('verse')+' '+aNo;
    }catch(e){}
  }
  setTimeout(restore, 1200);
})();

/* ============================================================
   LOCK SCREEN · Media Session metadata, dynamic per-surah
   artwork, and hardware/lock-screen playback controls.
   ============================================================ */
(function(){
  'use strict';
  if(typeof Player==='undefined' || !Player.audio) return;
  const a = Player.audio;
  const hasMS = 'mediaSession' in navigator;

  let baseImg=null, basePromise=null;
  function ensureBase(){
    if(basePromise) return basePromise;
    basePromise=new Promise(res=>{
      const im=new Image();
      im.onload=()=>{ baseImg=im; res(im); };
      im.onerror=()=>res(null);
      im.src='icons/now-playing-512.png';
    });
    return basePromise;
  }
  async function ensureFont(){ try{ await document.fonts.load("58px 'Amiri Quran'"); await document.fonts.ready; }catch(e){} }

  let artURL=null, artSurah=null;
  async function buildArtwork(s){
    await ensureFont();
    const base=await ensureBase();
    const C=512, cv=document.createElement('canvas'); cv.width=C; cv.height=C;
    const g=cv.getContext('2d');
    if(base) g.drawImage(base,0,0,C,C); else { g.fillStyle='#0a4b38'; g.fillRect(0,0,C,C); }
    const grd=g.createLinearGradient(0,C*0.42,0,C);
    grd.addColorStop(0,'rgba(4,20,15,0)'); grd.addColorStop(1,'rgba(4,18,13,0.85)');
    g.fillStyle=grd; g.fillRect(0,C*0.42,C,C*0.58);
    g.textAlign='center'; g.textBaseline='middle';
    let fs=60; g.font=fs+"px 'Amiri Quran', serif";
    const name=s.name||'';
    while(g.measureText(name).width>C*0.80 && fs>26){ fs-=2; g.font=fs+"px 'Amiri Quran', serif"; }
    g.shadowColor='rgba(0,0,0,.45)'; g.shadowBlur=12;
    g.fillStyle='#f5f1e6'; g.fillText(name, C/2, C*0.70);
    g.shadowBlur=0;
    g.font="600 21px Inter, system-ui, sans-serif"; g.fillStyle='#f0d696';
    const tr = (typeof surahName==='function'?surahName(s):s.englishName);
    const num = (typeof toArabicNum==='function'?toArabicNum(s.number):s.number);
    g.fillText('﴿ '+num+' ﴾   '+tr, C/2, C*0.805);
    const rec=(Quran.reciters.find(r=>r.id===STATE.reciter)||{}).name||'Kurani';
    g.font="500 16px Inter, system-ui, sans-serif"; g.fillStyle='rgba(255,255,255,.82)';
    g.fillText(rec, C/2, C*0.885);
    g.font="700 13px Inter, system-ui, sans-serif"; g.fillStyle='rgba(240,214,150,.92)';
    g.fillText('K U R A N I', C/2, C*0.945);
    return await new Promise(res=>{
      cv.toBlob(b=>{ if(artURL) URL.revokeObjectURL(artURL); artURL=b?URL.createObjectURL(b):null; res(artURL); },'image/png',0.92);
    });
  }

  async function refreshMeta(){
    if(!hasMS || !Player.surah) return;
    const s=Player.surah;
    if(artSurah!==s.number){ artSurah=s.number; try{ await buildArtwork(s); }catch(e){ artURL=null; } }
    const rec=(Quran.reciters.find(r=>r.id===STATE.reciter)||{}).name||'Kurani';
    const aNo = (s.ayahs && s.ayahs[Player.idx]) ? s.ayahs[Player.idx].n : 1;
    const tr = (typeof surahName==='function'?surahName(s):s.englishName);
    const verse = (typeof t==='function'?t('verse'):'verse');
    try{
      navigator.mediaSession.metadata = new MediaMetadata({
        title: (s.name||'') + '  ·  ' + tr,
        artist: rec + '  ·  ' + verse + ' ' + aNo,
        album: 'Kurani — القرآن الكريم',
        artwork: [
          ...(artURL?[{src:artURL,sizes:'512x512',type:'image/png'}]:[]),
          {src:'icons/now-playing-512.png',sizes:'512x512',type:'image/png'},
          {src:'icons/now-playing-256.png',sizes:'256x256',type:'image/png'}
        ]
      });
    }catch(e){}
  }

  // Hook playback lifecycle
  if(typeof Player.load==='function'){
    const origLoad = Player.load.bind(Player);
    Player.load = function(){ const r=origLoad(); refreshMeta(); return r; };
  }
  a.addEventListener('play', ()=>{ if(hasMS) try{ navigator.mediaSession.playbackState='playing'; }catch(e){} refreshMeta(); });
  a.addEventListener('pause', ()=>{ if(hasMS) try{ navigator.mediaSession.playbackState='paused'; }catch(e){} });
  a.addEventListener('timeupdate', ()=>{
    if(!hasMS) return;
    try{ if(isFinite(a.duration) && a.duration>0)
      navigator.mediaSession.setPositionState({duration:a.duration, playbackRate:a.playbackRate||1, position:Math.min(a.currentTime,a.duration)});
    }catch(e){}
  });

  // Lock-screen / hardware controls
  if(hasMS){
    const set=(act,fn)=>{ try{ navigator.mediaSession.setActionHandler(act,fn); }catch(e){} };
    set('play', ()=>{ Player.play(); });
    set('pause', ()=>{ a.pause(); });
    set('previoustrack', ()=>{ Player.prev(); });
    set('nexttrack', ()=>{ Player.next(); });
    set('seekbackward', d=>{ a.currentTime=Math.max(0,a.currentTime-((d&&d.seekOffset)||10)); });
    set('seekforward', d=>{ a.currentTime=Math.min(a.duration||1e9,a.currentTime+((d&&d.seekOffset)||10)); });
    set('seekto', d=>{ if(d&&d.seekTime!=null) a.currentTime=d.seekTime; });
    set('stop', ()=>{ if(typeof Player.stop==='function') Player.stop(); });
  }
})();

/* ============================================================
   SETTINGS · "Widgets / Home screen" toggle (injected)
   ============================================================ */
(function(){
  'use strict';
  function w(sq,en,ar){ const L=(window.STATE&&STATE.uiLang)||'sq'; return L==='en'?en:(L==='ar'?ar:sq); }
  const KEY='kurani.widget';
  const isOn = ()=> localStorage.getItem(KEY)==='1';

  async function enableWidget(){
    localStorage.setItem(KEY,'1');
    try{ if(typeof enableNotifications==='function'){ await enableNotifications(); } }catch(e){}
    try{
      const reg = await navigator.serviceWorker.ready;
      if(reg && 'periodicSync' in reg){
        const st = await navigator.permissions.query({name:'periodic-background-sync'});
        if(st.state==='granted'){ await reg.periodicSync.register('ayah-widget-sync',{minInterval:24*60*60*1000}); }
      }
    }catch(e){}
  }
  function disableWidget(){ localStorage.setItem(KEY,'0'); }

  function infoSheet(){
    if(typeof openSheet!=='function') return;
    openSheet(`<div class="w-10 h-1 rounded-full mx-auto mb-4" style="background:var(--border)"></div>
      <h3 class="font-extrabold text-lg mb-1">${w('Si t\'i shtosh widget-et','How to add widgets','كيفية إضافة الودجت')}</h3>
      <p class="txt-muted text-sm mb-4">${w('Mbështetja ndryshon sipas pajisjes:','Support varies by device:','يختلف الدعم حسب الجهاز:')}</p>
      <div class="space-y-3 text-sm">
        <div class="surface-2 rounded-xl p-3"><b class="accent">Android</b><br>${w('Instalo app-in (Shto te Home Screen). Mbanesh gjatë mbi ikonën për shkurtoret (Vazhdo leximin, Suret…). Aktivizo njoftimin ditor “Ajeti i ditës” më poshtë.','Install the app (Add to Home Screen). Long-press the icon for shortcuts (Continue, Surahs…). Enable the daily “Verse of the day” notification below.','ثبّت التطبيق، واضغط مطولاً على الأيقونة للاختصارات، وفعّل إشعار «آية اليوم» أدناه.')}</div>
        <div class="surface-2 rounded-xl p-3"><b class="accent">Windows 11</b><br>${w('Instalo app-in nga Edge/Chrome → shfaqet widget-i “Ajeti i ditës” në Widgets Board (Win+W).','Install via Edge/Chrome → the “Verse of the day” widget appears in the Widgets Board (Win+W).','ثبّت عبر Edge/Chrome ليظهر ودجت «آية اليوم» في لوحة الودجت.')}</div>
        <div class="surface-2 rounded-xl p-3"><b class="accent">iOS</b><br>${w('Shto te Home Screen nga Safari. Widget-et vendase nuk mbështeten ende; përdor njoftimin ditor.','Add to Home Screen from Safari. Native widgets aren\'t supported yet; use the daily notification.','أضِف إلى الشاشة الرئيسية من Safari. الودجت الأصلية غير مدعومة بعد؛ استخدم الإشعار اليومي.')}</div>
      </div>
      <button onclick="(${closeSheetRef()})()" class="tap mt-4 w-full bg-accent text-white font-bold py-3 rounded-2xl">${w('Në rregull','Got it','حسنًا')}</button>`);
  }
  function closeSheetRef(){ return 'window.__kClose'; }
  window.__kClose = ()=>{ if(typeof closeSheet==='function') closeSheet(); };

  function buildToggle(on){
    return `<div class="p-4 flex items-center justify-between">
      <span><span class="font-semibold block">${w('Ajeti i ditës','Verse of the day','آية اليوم')}</span>
        <span class="txt-muted text-xs">${w('Njoftim/widget ditor me një ajet','Daily notification/widget with a verse','إشعار/ودجت يومي بآية')}</span></span>
      <button id="wtog" data-on="${on?1:0}" class="w-12 h-7 rounded-full relative transition ${on?'bg-accent':'surface-2'}" style="${on?'':'border:1px solid var(--border)'}">
        <span class="absolute top-1 ${on?'right-1':'left-1'} w-5 h-5 bg-white rounded-full shadow transition-all"></span></button>
    </div>`;
  }

  function inject(){
    if((location.hash||'#/')!=='#/settings') return;
    const view=document.getElementById('view'); if(!view) return;
    if(document.getElementById('widgetSection')) return;
    const wrap = view.querySelector('.space-y-5'); if(!wrap) return;
    const sec=document.createElement('section'); sec.id='widgetSection';
    sec.innerHTML = `<p class="text-xs font-bold uppercase tracking-wider txt-muted mb-2 px-1">Widgets · ${w('Ekrani kryesor','Home screen','الشاشة الرئيسية')}</p>
      <div class="surface rounded-2xl border brd shadow-card divide-y" style="border-color:var(--border)">
        ${buildToggle(isOn())}
        <button id="wInfo" class="w-full p-4 flex items-center justify-between tap text-left">
          <span><span class="font-semibold block">${w('Si t\'i shtoj në ekran','How to add to screen','كيفية الإضافة للشاشة')}</span>
            <span class="txt-muted text-xs">${w('Udhëzime për Android, Windows, iOS','Guide for Android, Windows, iOS','دليل لأندرويد وويندوز وiOS')}</span></span>
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>`;
    // insert before the footer credit <p> if present, else append
    const footer = wrap.querySelector('p.text-center');
    if(footer) wrap.insertBefore(sec, footer); else wrap.appendChild(sec);
    const tog=sec.querySelector('#wtog');
    tog.onclick = async ()=>{
      const on = tog.dataset.on==='1'; const nv=!on; tog.dataset.on=nv?1:0;
      tog.classList.toggle('bg-accent',nv); tog.classList.toggle('surface-2',!nv); tog.style.border = nv?'':'1px solid var(--border)';
      const dot=tog.querySelector('span'); dot.classList.toggle('right-1',nv); dot.classList.toggle('left-1',!nv);
      if(nv){ await enableWidget(); if(typeof toast==='function') toast(w('Widget-i u aktivizua','Widget enabled','تم تفعيل الودجت')); }
      else { disableWidget(); if(typeof toast==='function') toast(w('U çaktivizua','Disabled','تم التعطيل')); }
    };
    sec.querySelector('#wInfo').onclick = infoSheet;
  }

  const view=document.getElementById('view');
  if(view){ const mo=new MutationObserver(()=>{ if((location.hash||'')==='#/settings') setTimeout(inject,0); }); mo.observe(view,{childList:true}); }
  window.addEventListener('hashchange', ()=>{ if((location.hash||'')==='#/settings') setTimeout(inject,30); });
  setTimeout(inject, 300);
})();
