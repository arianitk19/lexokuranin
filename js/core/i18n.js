/* ==========================================================================
   i18n — Shqip (default), English, العربية
   ========================================================================== */

export const LANGS = {
  sq: { name: 'Shqip', label: 'SQ', dir: 'ltr' },
  en: { name: 'English', label: 'EN', dir: 'ltr' },
  ar: { name: 'العربية', label: 'AR', dir: 'rtl' },
};

const sq = {
  brand: 'LEXO KURAN',
  tagline: 'Lexo. Dëgjo. Mëso.',
  tagline_alt: 'Kurani, gjithmonë me ty.',

  nav_home: 'Ballina', nav_quran: 'Kuran', nav_audio: 'Audio', nav_memorize: 'Memorizo',
  nav_more: 'Më shumë', nav_search: 'Kërko', nav_saved: 'Të ruajtura', nav_settings: 'Cilësimet',

  greeting: 'Es-selamu alejkum', welcome_back: 'Mirë se u ktheve.', welcome_first: 'Mirë se erdhe.',
  continue_reading: 'Vazhdo leximin', start_reading: 'Fillo leximin', resume: 'Vazhdo',
  ayah_of_day: 'Ajeti i ditës', your_journey: 'Rrugëtimi yt', quick_actions: 'Veprime të shpejta',
  recent_activity: 'Aktiviteti i fundit',

  quran: 'Kurani', surahs: 'Suret', juz: 'Xhuzët', juz_one: 'Xhuzi', search: 'Kërko',
  saved: 'Të ruajtura', memorize: 'Memorizo', audio: 'Audio', tafsir: 'Tefsir',
  stats: 'Statistika', notes: 'Shënime', settings: 'Cilësimet', about: 'Rreth nesh', help: 'Ndihmë',

  all_surahs: 'Të gjitha suret', search_surah: 'Kërko sure ose numër…',
  verses: 'ajete', verse: 'ajet', meccan: 'Mekase', medinan: 'Medinase',
  page: 'Faqe', of_quran: 'i Kuranit',

  search_placeholder: 'Kërko në Kuran…',
  search_hint: 'Kërko me fjalë shqip, anglisht, arabisht, ose shkruaj një referencë si 2:255.',
  search_preparing: 'Po përgatitet kërkimi…',
  search_preparing_note: 'Herën e parë shkarkohet indeksi i kërkimit. Pastaj punon edhe pa internet.',
  recent_searches: 'Kërkimet e fundit', clear: 'Pastro',
  no_results: 'Nuk u gjet asnjë rezultat', no_results_text: 'Provo fjalë të tjera ose një referencë si 18:10.',
  results: 'rezultate', result: 'rezultat', searching: 'Po kërkohet…',

  saved_title: 'Të ruajtura', cat_saved: 'Të ruajtura', cat_memorize: 'Për memorizim',
  cat_favorite: 'Të preferuara', cat_notes: 'Me shënime',
  bookmarks_empty: 'Ende s’ke ruajtur asnjë ajet',
  bookmarks_empty_text: 'Trokit mbi një ajet gjatë leximit dhe zgjidh “Ruaj”.',
  notes_empty: 'Asnjë shënim ende',
  notes_empty_text: 'Shkruaj mendimin tënd për një ajet dhe do ta gjesh këtu.',
  search_saved: 'Kërko te të ruajturat…',

  listen: 'Dëgjo', save: 'Ruaj', unsave: 'Hiqe', copy: 'Kopjo', share: 'Ndaj',
  memorize_v: 'Memorizo', note: 'Shënim', open_in_quran: 'Hape në Kuran', remove: 'Hiq',
  play: 'Luaj', pause: 'Ndalo', play_surah: 'Dëgjo suren', next: 'Tjetër', prev: 'I mëparshmi',
  next_surah: 'Surja tjetër', prev_surah: 'Surja e mëparshme',
  close: 'Mbyll', back: 'Mbrapa', cancel: 'Anulo', done: 'U krye', confirm: 'Konfirmo',
  save_btn: 'Ruaj', delete: 'Fshi', edit: 'Ndrysho', retry: 'Provo sërish', more: 'Më shumë',

  saved_ok: 'U ruajt', removed_ok: 'U hoq', copied_ok: 'U kopjua',
  note_saved: 'Shënimi u ruajt', note_removed: 'Shënimi u fshi',
  marked_memorized: 'U shënua si i memorizuar', unmarked_memorized: 'U hoq nga të memorizuarit',
  link_copied: 'Lidhja u kopjua',

  reader: 'Leximi', reader_settings: 'Cilësimet e leximit', font_size: 'Madhësia e fontit arab',
  line_height: 'Hapësira mes rreshtave', ayah_spacing: 'Hapësira mes ajeteve',
  arabic_font: 'Fonti arab', translations: 'Përkthimet',
  show_sq: 'Shqip', show_en: 'Anglisht', show_translit: 'Transliterim',
  focus_mode: 'Modaliteti i fokusit', focus_on: 'Fokusi u aktivizua', focus_off: 'Fokusi u çaktivizua',
  focus_hint: 'Trokit në mes të ekranit për të fshehur ose shfaqur kontrollet.',
  font_amiri: 'Amiri Quran', font_scheherazade: 'Scheherazade', font_naskh: 'Noto Naskh',

  player: 'Luajtësi', reciter: 'Recituesi', speed: 'Shpejtësia', volume: 'Volumi',
  repeat: 'Përsërit', repeat_off: 'Pa përsëritje', repeat_ayah: 'Përsërit ajetin',
  repeat_range: 'Përsërit pjesën', repeat_surah: 'Përsërit suren',
  autoplay_next: 'Vazhdo automatikisht', now_playing: 'Po luan tani',
  continuous_play: 'Kalo te surja tjetër',
  audio_unavailable: 'Audioja nuk u ngarkua',
  audio_unavailable_text: 'Kontrollo lidhjen me internetin ose provo një recitues tjetër.',
  audio_offline_text: 'Recitimet kërkojnë internet. Teksti i Kuranit dhe përkthimi punojnë gjithmonë offline.',
  choose_reciter: 'Zgjidh recituesin', audio_title: 'Dëgjo Kuranin',
  audio_sub: 'Recitime të plota, sure pas sureje.',
  continue_listening: 'Vazhdo dëgjimin',

  memorize_title: 'Memorizimi (Hifz)',
  memorize_sub: 'Një sistem i vërtetë mësimi — jo lojë.',
  mem_new: 'I ri', mem_learning: 'Në mësim', mem_review: 'Për përsëritje', mem_strong: 'I memorizuar',
  mem_due: 'Për sot', mem_progress: 'Progresi', mem_start: 'Fillo seancën',
  mem_choose: 'Zgjidh çfarë do të mësosh', mem_range: 'Nga ajeti – deri te ajeti',
  mem_mode: 'Mënyra', mode_read: 'Lexo', mode_listen: 'Dëgjo', mode_hide_ar: 'Fsheh arabishten',
  mode_hide_tr: 'Fsheh përkthimin', mode_recall: 'Kujto', mode_quiz: 'Kuiz', mode_repeat: 'Përsërit',
  mem_reveal: 'Trokit për ta zbuluar', mem_knew: 'E dija', mem_didnt: 'S’e dija',
  mem_session_done: 'Seanca përfundoi', mem_session_done_text: 'Të lumtë. Kthehu nesër për përsëritje.',
  mem_empty: 'Asnjë ajet në program', mem_empty_text: 'Zgjidh një sure dhe fillo — ose shëno ajete gjatë leximit.',
  mem_queue: 'Radha e përsëritjes', mem_daily_goal: 'Objektivi ditor',
  mem_quiz_q: 'Cili përkthim i takon këtij ajeti?',
  mem_correct: 'Saktë', mem_wrong: 'Gabim',
  ayahs_count: 'ajete', session: 'Seancë',

  stats_title: 'Statistikat', st_time: 'Koha e leximit', st_listen: 'Koha e dëgjimit',
  st_ayahs: 'Ajete të lexuara', st_surahs: 'Sure të hapura', st_days: 'Ditë aktive',
  st_streak: 'Seri ditore', st_memorized: 'Ajete të memorizuara', st_progress: 'Progresi i Kuranit',
  st_week: 'Kjo javë', st_year: 'Aktiviteti vjetor', st_today: 'Sot',
  st_empty: 'Ende pa të dhëna', st_empty_text: 'Statistikat fillojnë sapo të lexosh ajetin e parë.',
  minutes: 'min', hours: 'orë', days: 'ditë', day: 'ditë',
  goal_reached: 'Objektivi u arrit', goal_of: 'nga',

  settings_reading: 'Leximi', settings_audio: 'Audio', settings_language: 'Gjuha',
  settings_theme: 'Pamja', settings_notifications: 'Njoftimet', settings_offline: 'Offline',
  settings_a11y: 'Qasshmëria', settings_data: 'Të dhënat', settings_about: 'Rreth',
  theme: 'Tema', theme_auto: 'Sipas sistemit', theme_light: 'E çelët', theme_dark: 'E errët',
  theme_sepia: 'Sepia', theme_night: 'Nata', app_language: 'Gjuha e aplikacionit',
  reduce_motion: 'Ul animacionet', daily_reminder: 'Kujtesa ditore', reminder_time: 'Ora',
  daily_goal: 'Objektivi ditor i leximit',
  download_offline: 'Shkarko për offline', download_offline_text: 'Kurani i plotë ruhet në pajisje.',
  downloaded: 'E shkarkuar', downloading: 'Po shkarkohet…', download_done: 'Gati për offline',
  clear_cache: 'Pastro memorien', cache_cleared: 'Memoria u pastrua',
  export_data: 'Eksporto të dhënat', import_data: 'Importo të dhënat',
  delete_data: 'Fshi të gjitha të dhënat',
  delete_data_q: 'Të fshihen të gjitha të dhënat?',
  delete_data_text: 'Favoritet, shënimet, memorizimi dhe statistikat fshihen përgjithmonë nga kjo pajisje.',
  data_deleted: 'Të dhënat u fshinë', data_exported: 'Të dhënat u eksportuan',
  data_imported: 'Të dhënat u importuan', import_failed: 'Skedari nuk u njoh',
  storage_used: 'Hapësira e përdorur',

  install_title: 'Mbaje Kuranin gjithmonë me vete',
  install_text: 'Instalo LEXO KURAN dhe hape si aplikacion, edhe pa internet.',
  install_btn: 'Instalo', install_how: 'Si ta instaloj?',
  install_ios: 'Në iPhone / iPad: prek butonin Share, pastaj “Add to Home Screen”.',
  install_android: 'Në Android: hap menynë ⋮ të shfletuesit dhe zgjidh “Install app”.',
  install_desktop: 'Në kompjuter: kliko ikonën e instalimit në shiritin e adresës.',
  installed_ok: 'Aplikacioni u instalua',
  update_available: 'Ka një version të ri', update_now: 'Rifresko',

  notif_enable: 'Aktivizo njoftimet', notif_on: 'Njoftimet u aktivizuan',
  notif_denied: 'Njoftimet u refuzuan nga shfletuesi',
  notif_unsupported: 'Shfletuesi yt nuk i mbështet njoftimet',
  notif_explain: 'Një kujtesë e qetë çdo ditë me ajetin e ditës. Kërkohet leje vetëm kur e aktivizon.',

  offline: 'Je offline', offline_text: 'Përmbajtja e ruajtur është ende e disponueshme.',
  online_back: 'Lidhja u rikthye',
  err_load: 'Diçka nuk shkoi', err_load_text: 'Nuk u ngarkua përmbajtja. Provo sërish.',
  err_offline_data: 'Kjo sure s’është shkarkuar ende',
  err_offline_data_text: 'Lidhu me internetin një herë, ose shkarko Kuranin e plotë te Cilësimet.',
  loading: 'Po ngarkohet…',
  not_found: 'Faqja nuk u gjet', not_found_text: 'Lidhja mund të jetë e vjetruar.',
  go_home: 'Kthehu te ballina',

  tafsir_title: 'Tefsir', tafsir_source: 'El-Muyessar (arabisht)',
  tafsir_online: 'Tefsiri kërkon lidhje me internetin.',
  tafsir_none: 'Tefsiri nuk u gjet për këtë ajet.',
  tafsir_pick: 'Zgjidh një ajet për ta parë tefsirin.',

  share_title: 'Ndaj ajetin', share_card: 'Kartela', share_text: 'Teksti',
  share_download: 'Shkarko figurën', share_copy: 'Kopjo tekstin', share_native: 'Ndaj…',
  share_whatsapp: 'WhatsApp', share_facebook: 'Facebook', share_x: 'X',
  share_image_saved: 'Figura u shkarkua',
  share_instagram_hint: 'Shkarko figurën dhe ngarkoje si Story në Instagram.',

  sources: 'Burimet', privacy: 'Privatësia', contact: 'Kontakt',
  about_lead: 'LEXO KURAN është një platformë e lirë shqiptare për leximin, dëgjimin dhe memorizimin e Kuranit.',

  today: 'Sot', yesterday: 'Dje',
  mon: 'Hën', tue: 'Mar', wed: 'Mër', thu: 'Enj', fri: 'Pre', sat: 'Sht', sun: 'Die',
};

const en = {
  brand: 'LEXO KURAN',
  tagline: 'Read. Listen. Learn.',
  tagline_alt: 'The Quran, always with you.',

  nav_home: 'Home', nav_quran: 'Quran', nav_audio: 'Audio', nav_memorize: 'Memorize',
  nav_more: 'More', nav_search: 'Search', nav_saved: 'Saved', nav_settings: 'Settings',

  greeting: 'Assalamu alaikum', welcome_back: 'Welcome back.', welcome_first: 'Welcome.',
  continue_reading: 'Continue reading', start_reading: 'Start reading', resume: 'Resume',
  ayah_of_day: 'Verse of the day', your_journey: 'Your journey', quick_actions: 'Quick actions',
  recent_activity: 'Recent activity',

  quran: 'Quran', surahs: 'Surahs', juz: 'Juz', juz_one: 'Juz', search: 'Search',
  saved: 'Saved', memorize: 'Memorize', audio: 'Audio', tafsir: 'Tafsir',
  stats: 'Statistics', notes: 'Notes', settings: 'Settings', about: 'About', help: 'Help',

  all_surahs: 'All surahs', search_surah: 'Search surah or number…',
  verses: 'verses', verse: 'verse', meccan: 'Meccan', medinan: 'Medinan',
  page: 'Page', of_quran: 'of the Quran',

  search_placeholder: 'Search the Quran…',
  search_hint: 'Search in English, Albanian or Arabic — or type a reference like 2:255.',
  search_preparing: 'Preparing search…',
  search_preparing_note: 'The search index downloads once. After that it works offline too.',
  recent_searches: 'Recent searches', clear: 'Clear',
  no_results: 'No results found', no_results_text: 'Try other words or a reference like 18:10.',
  results: 'results', result: 'result', searching: 'Searching…',

  saved_title: 'Saved', cat_saved: 'Saved', cat_memorize: 'To memorize',
  cat_favorite: 'Favorites', cat_notes: 'With notes',
  bookmarks_empty: 'No saved verses yet',
  bookmarks_empty_text: 'Tap a verse while reading and choose “Save”.',
  notes_empty: 'No notes yet',
  notes_empty_text: 'Write a thought about a verse and it will appear here.',
  search_saved: 'Search saved…',

  listen: 'Listen', save: 'Save', unsave: 'Remove', copy: 'Copy', share: 'Share',
  memorize_v: 'Memorize', note: 'Note', open_in_quran: 'Open in Quran', remove: 'Remove',
  play: 'Play', pause: 'Pause', play_surah: 'Play surah', next: 'Next', prev: 'Previous',
  next_surah: 'Next surah', prev_surah: 'Previous surah',
  close: 'Close', back: 'Back', cancel: 'Cancel', done: 'Done', confirm: 'Confirm',
  save_btn: 'Save', delete: 'Delete', edit: 'Edit', retry: 'Try again', more: 'More',

  saved_ok: 'Saved', removed_ok: 'Removed', copied_ok: 'Copied',
  note_saved: 'Note saved', note_removed: 'Note deleted',
  marked_memorized: 'Marked as memorized', unmarked_memorized: 'Unmarked',
  link_copied: 'Link copied',

  reader: 'Reading', reader_settings: 'Reading settings', font_size: 'Arabic font size',
  line_height: 'Line spacing', ayah_spacing: 'Space between verses',
  arabic_font: 'Arabic font', translations: 'Translations',
  show_sq: 'Albanian', show_en: 'English', show_translit: 'Transliteration',
  focus_mode: 'Focus mode', focus_on: 'Focus mode on', focus_off: 'Focus mode off',
  focus_hint: 'Tap the middle of the screen to hide or show the controls.',
  font_amiri: 'Amiri Quran', font_scheherazade: 'Scheherazade', font_naskh: 'Noto Naskh',

  player: 'Player', reciter: 'Reciter', speed: 'Speed', volume: 'Volume',
  repeat: 'Repeat', repeat_off: 'No repeat', repeat_ayah: 'Repeat verse',
  repeat_range: 'Repeat range', repeat_surah: 'Repeat surah',
  autoplay_next: 'Autoplay next', now_playing: 'Now playing',
  continuous_play: 'Continue to next surah',
  audio_unavailable: 'Audio failed to load',
  audio_unavailable_text: 'Check your connection or try another reciter.',
  audio_offline_text: 'Recitations need an internet connection. The Quran text and translation always work offline.',
  choose_reciter: 'Choose a reciter', audio_title: 'Listen to the Quran',
  audio_sub: 'Complete recitations, surah by surah.',
  continue_listening: 'Continue listening',

  memorize_title: 'Memorization (Hifz)',
  memorize_sub: 'A real learning system — not a game.',
  mem_new: 'New', mem_learning: 'Learning', mem_review: 'Review', mem_strong: 'Memorized',
  mem_due: 'Due today', mem_progress: 'Progress', mem_start: 'Start session',
  mem_choose: 'Choose what to learn', mem_range: 'From verse – to verse',
  mem_mode: 'Mode', mode_read: 'Read', mode_listen: 'Listen', mode_hide_ar: 'Hide Arabic',
  mode_hide_tr: 'Hide translation', mode_recall: 'Recall', mode_quiz: 'Quiz', mode_repeat: 'Repeat',
  mem_reveal: 'Tap to reveal', mem_knew: 'I knew it', mem_didnt: 'I didn’t',
  mem_session_done: 'Session complete', mem_session_done_text: 'Well done. Come back tomorrow to review.',
  mem_empty: 'Nothing in your programme', mem_empty_text: 'Pick a surah to begin — or mark verses while reading.',
  mem_queue: 'Review queue', mem_daily_goal: 'Daily goal',
  mem_quiz_q: 'Which translation belongs to this verse?',
  mem_correct: 'Correct', mem_wrong: 'Wrong',
  ayahs_count: 'verses', session: 'Session',

  stats_title: 'Statistics', st_time: 'Reading time', st_listen: 'Listening time',
  st_ayahs: 'Verses read', st_surahs: 'Surahs opened', st_days: 'Active days',
  st_streak: 'Day streak', st_memorized: 'Verses memorized', st_progress: 'Quran progress',
  st_week: 'This week', st_year: 'Yearly activity', st_today: 'Today',
  st_empty: 'No data yet', st_empty_text: 'Statistics begin the moment you read your first verse.',
  minutes: 'min', hours: 'h', days: 'days', day: 'day',
  goal_reached: 'Goal reached', goal_of: 'of',

  settings_reading: 'Reading', settings_audio: 'Audio', settings_language: 'Language',
  settings_theme: 'Appearance', settings_notifications: 'Notifications', settings_offline: 'Offline',
  settings_a11y: 'Accessibility', settings_data: 'Data', settings_about: 'About',
  theme: 'Theme', theme_auto: 'Match system', theme_light: 'Light', theme_dark: 'Dark',
  theme_sepia: 'Sepia', theme_night: 'Night', app_language: 'App language',
  reduce_motion: 'Reduce motion', daily_reminder: 'Daily reminder', reminder_time: 'Time',
  daily_goal: 'Daily reading goal',
  download_offline: 'Download for offline', download_offline_text: 'The full Quran is stored on this device.',
  downloaded: 'Downloaded', downloading: 'Downloading…', download_done: 'Ready offline',
  clear_cache: 'Clear cache', cache_cleared: 'Cache cleared',
  export_data: 'Export my data', import_data: 'Import data',
  delete_data: 'Delete all my data',
  delete_data_q: 'Delete all data?',
  delete_data_text: 'Bookmarks, notes, memorization and statistics are permanently removed from this device.',
  data_deleted: 'Data deleted', data_exported: 'Data exported',
  data_imported: 'Data imported', import_failed: 'File not recognised',
  storage_used: 'Storage used',

  install_title: 'Keep the Quran with you',
  install_text: 'Install LEXO KURAN and open it like an app, even offline.',
  install_btn: 'Install', install_how: 'How do I install it?',
  install_ios: 'On iPhone / iPad: tap Share, then “Add to Home Screen”.',
  install_android: 'On Android: open the browser ⋮ menu and choose “Install app”.',
  install_desktop: 'On desktop: click the install icon in the address bar.',
  installed_ok: 'App installed',
  update_available: 'A new version is available', update_now: 'Reload',

  notif_enable: 'Enable notifications', notif_on: 'Notifications enabled',
  notif_denied: 'Notifications were blocked by the browser',
  notif_unsupported: 'Your browser does not support notifications',
  notif_explain: 'One quiet reminder a day with the verse of the day. Permission is asked only when you turn it on.',

  offline: 'You are offline', offline_text: 'Saved content is still available.',
  online_back: 'Back online',
  err_load: 'Something went wrong', err_load_text: 'The content did not load. Please try again.',
  err_offline_data: 'This surah is not downloaded yet',
  err_offline_data_text: 'Go online once, or download the full Quran in Settings.',
  loading: 'Loading…',
  not_found: 'Page not found', not_found_text: 'This link may be out of date.',
  go_home: 'Back to home',

  tafsir_title: 'Tafsir', tafsir_source: 'Al-Muyassar (Arabic)',
  tafsir_online: 'Tafsir requires an internet connection.',
  tafsir_none: 'No tafsir found for this verse.',
  tafsir_pick: 'Pick a verse to read its tafsir.',

  share_title: 'Share verse', share_card: 'Card', share_text: 'Text',
  share_download: 'Download image', share_copy: 'Copy text', share_native: 'Share…',
  share_whatsapp: 'WhatsApp', share_facebook: 'Facebook', share_x: 'X',
  share_image_saved: 'Image downloaded',
  share_instagram_hint: 'Download the image and upload it as an Instagram Story.',

  sources: 'Sources', privacy: 'Privacy', contact: 'Contact',
  about_lead: 'LEXO KURAN is a free Albanian platform for reading, listening to and memorizing the Quran.',

  today: 'Today', yesterday: 'Yesterday',
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

const ar = {
  brand: 'LEXO KURAN',
  tagline: 'اقرأ. استمع. تعلّم.',
  tagline_alt: 'القرآن معك دائمًا.',

  nav_home: 'الرئيسية', nav_quran: 'القرآن', nav_audio: 'الصوت', nav_memorize: 'الحفظ',
  nav_more: 'المزيد', nav_search: 'بحث', nav_saved: 'المحفوظة', nav_settings: 'الإعدادات',

  greeting: 'السلام عليكم', welcome_back: 'أهلًا بعودتك.', welcome_first: 'مرحبًا بك.',
  continue_reading: 'متابعة القراءة', start_reading: 'ابدأ القراءة', resume: 'متابعة',
  ayah_of_day: 'آية اليوم', your_journey: 'رحلتك', quick_actions: 'إجراءات سريعة',
  recent_activity: 'النشاط الأخير',

  quran: 'القرآن', surahs: 'السور', juz: 'الأجزاء', juz_one: 'جزء', search: 'بحث',
  saved: 'المحفوظة', memorize: 'الحفظ', audio: 'الصوت', tafsir: 'التفسير',
  stats: 'الإحصائيات', notes: 'الملاحظات', settings: 'الإعدادات', about: 'عن التطبيق', help: 'مساعدة',

  all_surahs: 'جميع السور', search_surah: 'ابحث عن سورة أو رقم…',
  verses: 'آيات', verse: 'آية', meccan: 'مكية', medinan: 'مدنية',
  page: 'صفحة', of_quran: 'من القرآن',

  search_placeholder: 'ابحث في القرآن…',
  search_hint: 'ابحث بالعربية أو الألبانية أو الإنجليزية، أو اكتب مرجعًا مثل ٢:٢٥٥.',
  search_preparing: 'جارٍ تجهيز البحث…',
  search_preparing_note: 'يُنزَّل فهرس البحث مرة واحدة، ثم يعمل دون اتصال.',
  recent_searches: 'عمليات البحث الأخيرة', clear: 'مسح',
  no_results: 'لا توجد نتائج', no_results_text: 'جرّب كلمات أخرى أو مرجعًا مثل ١٨:١٠.',
  results: 'نتائج', result: 'نتيجة', searching: 'جارٍ البحث…',

  saved_title: 'المحفوظة', cat_saved: 'المحفوظة', cat_memorize: 'للحفظ',
  cat_favorite: 'المفضلة', cat_notes: 'مع ملاحظات',
  bookmarks_empty: 'لم تحفظ أي آية بعد',
  bookmarks_empty_text: 'المس آية أثناء القراءة واختر «حفظ».',
  notes_empty: 'لا توجد ملاحظات',
  notes_empty_text: 'اكتب خاطرة حول آية وستظهر هنا.',
  search_saved: 'ابحث في المحفوظة…',

  listen: 'استمع', save: 'حفظ', unsave: 'إزالة', copy: 'نسخ', share: 'مشاركة',
  memorize_v: 'حفظ', note: 'ملاحظة', open_in_quran: 'افتح في القرآن', remove: 'إزالة',
  play: 'تشغيل', pause: 'إيقاف', play_surah: 'استمع للسورة', next: 'التالي', prev: 'السابق',
  next_surah: 'السورة التالية', prev_surah: 'السورة السابقة',
  close: 'إغلاق', back: 'رجوع', cancel: 'إلغاء', done: 'تم', confirm: 'تأكيد',
  save_btn: 'حفظ', delete: 'حذف', edit: 'تعديل', retry: 'حاول مجددًا', more: 'المزيد',

  saved_ok: 'تم الحفظ', removed_ok: 'تمت الإزالة', copied_ok: 'تم النسخ',
  note_saved: 'تم حفظ الملاحظة', note_removed: 'تم حذف الملاحظة',
  marked_memorized: 'تم وضع علامة محفوظة', unmarked_memorized: 'تمت إزالة العلامة',
  link_copied: 'تم نسخ الرابط',

  reader: 'القراءة', reader_settings: 'إعدادات القراءة', font_size: 'حجم الخط العربي',
  line_height: 'تباعد الأسطر', ayah_spacing: 'التباعد بين الآيات',
  arabic_font: 'الخط العربي', translations: 'الترجمات',
  show_sq: 'الألبانية', show_en: 'الإنجليزية', show_translit: 'النقحرة',
  focus_mode: 'وضع التركيز', focus_on: 'تم تفعيل وضع التركيز', focus_off: 'تم إيقاف وضع التركيز',
  focus_hint: 'المس منتصف الشاشة لإخفاء أو إظهار الأدوات.',
  font_amiri: 'أميري', font_scheherazade: 'شهرزاد', font_naskh: 'نوتو نسخ',

  player: 'المشغّل', reciter: 'القارئ', speed: 'السرعة', volume: 'الصوت',
  repeat: 'تكرار', repeat_off: 'بدون تكرار', repeat_ayah: 'تكرار الآية',
  repeat_range: 'تكرار المقطع', repeat_surah: 'تكرار السورة',
  autoplay_next: 'تشغيل تلقائي', now_playing: 'يُشغّل الآن',
  continuous_play: 'المتابعة إلى السورة التالية',
  audio_unavailable: 'تعذّر تحميل الصوت',
  audio_unavailable_text: 'تحقق من الاتصال أو جرّب قارئًا آخر.',
  audio_offline_text: 'تحتاج التلاوات إلى اتصال بالإنترنت. أما نص القرآن والترجمة فيعملان دائمًا دون اتصال.',
  choose_reciter: 'اختر القارئ', audio_title: 'استمع للقرآن',
  audio_sub: 'تلاوات كاملة، سورة بسورة.',
  continue_listening: 'متابعة الاستماع',

  memorize_title: 'الحفظ',
  memorize_sub: 'نظام تعلّم حقيقي — وليس لعبة.',
  mem_new: 'جديد', mem_learning: 'قيد التعلّم', mem_review: 'للمراجعة', mem_strong: 'محفوظة',
  mem_due: 'مستحق اليوم', mem_progress: 'التقدم', mem_start: 'ابدأ الجلسة',
  mem_choose: 'اختر ما تريد حفظه', mem_range: 'من آية – إلى آية',
  mem_mode: 'الوضع', mode_read: 'قراءة', mode_listen: 'استماع', mode_hide_ar: 'إخفاء العربية',
  mode_hide_tr: 'إخفاء الترجمة', mode_recall: 'استرجاع', mode_quiz: 'اختبار', mode_repeat: 'تكرار',
  mem_reveal: 'المس للكشف', mem_knew: 'أعرفها', mem_didnt: 'لا أعرفها',
  mem_session_done: 'انتهت الجلسة', mem_session_done_text: 'أحسنت. عد غدًا للمراجعة.',
  mem_empty: 'لا شيء في برنامجك', mem_empty_text: 'اختر سورة للبدء — أو ضع علامة على الآيات أثناء القراءة.',
  mem_queue: 'قائمة المراجعة', mem_daily_goal: 'الهدف اليومي',
  mem_quiz_q: 'أي ترجمة تخص هذه الآية؟',
  mem_correct: 'صحيح', mem_wrong: 'خطأ',
  ayahs_count: 'آيات', session: 'جلسة',

  stats_title: 'الإحصائيات', st_time: 'وقت القراءة', st_listen: 'وقت الاستماع',
  st_ayahs: 'الآيات المقروءة', st_surahs: 'السور المفتوحة', st_days: 'أيام النشاط',
  st_streak: 'التتابع اليومي', st_memorized: 'آيات محفوظة', st_progress: 'تقدّم القرآن',
  st_week: 'هذا الأسبوع', st_year: 'النشاط السنوي', st_today: 'اليوم',
  st_empty: 'لا توجد بيانات بعد', st_empty_text: 'تبدأ الإحصائيات بمجرد قراءة أول آية.',
  minutes: 'د', hours: 'س', days: 'يوم', day: 'يوم',
  goal_reached: 'تحقق الهدف', goal_of: 'من',

  settings_reading: 'القراءة', settings_audio: 'الصوت', settings_language: 'اللغة',
  settings_theme: 'المظهر', settings_notifications: 'الإشعارات', settings_offline: 'دون اتصال',
  settings_a11y: 'إمكانية الوصول', settings_data: 'البيانات', settings_about: 'عن التطبيق',
  theme: 'السمة', theme_auto: 'حسب النظام', theme_light: 'فاتح', theme_dark: 'داكن',
  theme_sepia: 'سيبيا', theme_night: 'ليلي', app_language: 'لغة التطبيق',
  reduce_motion: 'تقليل الحركة', daily_reminder: 'تذكير يومي', reminder_time: 'الوقت',
  daily_goal: 'هدف القراءة اليومي',
  download_offline: 'تنزيل للعمل دون اتصال', download_offline_text: 'يُحفظ القرآن كاملًا على الجهاز.',
  downloaded: 'تم التنزيل', downloading: 'جارٍ التنزيل…', download_done: 'جاهز دون اتصال',
  clear_cache: 'مسح الذاكرة المؤقتة', cache_cleared: 'تم مسح الذاكرة',
  export_data: 'تصدير بياناتي', import_data: 'استيراد البيانات',
  delete_data: 'حذف كل بياناتي',
  delete_data_q: 'حذف كل البيانات؟',
  delete_data_text: 'ستُحذف المحفوظات والملاحظات والحفظ والإحصائيات نهائيًا من هذا الجهاز.',
  data_deleted: 'تم حذف البيانات', data_exported: 'تم تصدير البيانات',
  data_imported: 'تم استيراد البيانات', import_failed: 'الملف غير معروف',
  storage_used: 'المساحة المستخدمة',

  install_title: 'احتفظ بالقرآن معك',
  install_text: 'ثبّت LEXO KURAN وافتحه كتطبيق، حتى دون اتصال.',
  install_btn: 'تثبيت', install_how: 'كيف أثبّته؟',
  install_ios: 'على iPhone / iPad: اضغط مشاركة ثم «إضافة إلى الشاشة الرئيسية».',
  install_android: 'على Android: افتح قائمة ⋮ في المتصفح واختر «تثبيت التطبيق».',
  install_desktop: 'على الكمبيوتر: اضغط أيقونة التثبيت في شريط العنوان.',
  installed_ok: 'تم تثبيت التطبيق',
  update_available: 'يتوفر إصدار جديد', update_now: 'تحديث',

  notif_enable: 'تفعيل الإشعارات', notif_on: 'تم تفعيل الإشعارات',
  notif_denied: 'تم حظر الإشعارات من المتصفح',
  notif_unsupported: 'متصفحك لا يدعم الإشعارات',
  notif_explain: 'تذكير هادئ يوميًا بآية اليوم. يُطلب الإذن عند التفعيل فقط.',

  offline: 'أنت دون اتصال', offline_text: 'المحتوى المحفوظ لا يزال متاحًا.',
  online_back: 'عاد الاتصال',
  err_load: 'حدث خطأ ما', err_load_text: 'لم يتم تحميل المحتوى. حاول مجددًا.',
  err_offline_data: 'لم تُنزَّل هذه السورة بعد',
  err_offline_data_text: 'اتصل بالإنترنت مرة واحدة، أو نزّل القرآن كاملًا من الإعدادات.',
  loading: 'جارٍ التحميل…',
  not_found: 'الصفحة غير موجودة', not_found_text: 'قد يكون هذا الرابط قديمًا.',
  go_home: 'العودة للرئيسية',

  tafsir_title: 'التفسير', tafsir_source: 'الميسّر',
  tafsir_online: 'يتطلب التفسير اتصالًا بالإنترنت.',
  tafsir_none: 'لا يوجد تفسير لهذه الآية.',
  tafsir_pick: 'اختر آية لعرض تفسيرها.',

  share_title: 'مشاركة الآية', share_card: 'بطاقة', share_text: 'نص',
  share_download: 'تنزيل الصورة', share_copy: 'نسخ النص', share_native: 'مشاركة…',
  share_whatsapp: 'واتساب', share_facebook: 'فيسبوك', share_x: 'إكس',
  share_image_saved: 'تم تنزيل الصورة',
  share_instagram_hint: 'نزّل الصورة وانشرها كقصة على إنستغرام.',

  sources: 'المصادر', privacy: 'الخصوصية', contact: 'اتصل بنا',
  about_lead: 'LEXO KURAN منصة ألبانية مجانية لقراءة القرآن والاستماع إليه وحفظه.',

  today: 'اليوم', yesterday: 'أمس',
  mon: 'إث', tue: 'ثل', wed: 'أر', thu: 'خم', fri: 'جم', sat: 'سب', sun: 'أح',
};

const DICT = { sq, en, ar };

let current = 'sq';

export function setLang(code) {
  current = DICT[code] ? code : 'sq';
  const meta = LANGS[current];
  document.documentElement.lang = current;
  document.documentElement.dir = meta.dir;
  return current;
}

export const getLang = () => current;
export const dir = () => LANGS[current].dir;

/** Translate a key; falls back to Albanian, then to the key itself. */
export function t(key) {
  return DICT[current]?.[key] ?? DICT.sq[key] ?? key;
}

/** Pluralise: n, singular key, plural key. */
export function tn(n, one, many) {
  return `${n} ${n === 1 ? t(one) : t(many)}`;
}

/** Weekday short label for a JS day index (0 = Sunday). */
export function weekday(i) {
  return t(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][i]);
}

/** Format a duration in seconds as a human string. */
export function duration(sec) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h > 0) return `${h}${t('hours')} ${m}${t('minutes')}`;
  return `${m} ${t('minutes')}`;
}

/** mm:ss for the player. */
export function clock(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Localised long date. */
export function longDate(d = new Date()) {
  const locale = current === 'sq' ? 'sq-AL' : current === 'ar' ? 'ar' : 'en-GB';
  try {
    return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  } catch {
    return d.toDateString();
  }
}

/** Localised number. */
export function num(n) {
  const locale = current === 'sq' ? 'sq-AL' : current === 'ar' ? 'ar-EG' : 'en-GB';
  try { return new Intl.NumberFormat(locale).format(n); } catch { return String(n); }
}
