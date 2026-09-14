// Database Lengkap Al-Ma'tsurat (Dzikir Pagi & Petang Hasan Al-Banna)
// Disusun berdasar wazhifah otentik Imam Syahid Hasan Al-Banna
// Dilengkapi teks Arab Utsmani, Transliterasi, Terjemah, Sanad Hadits, dan Audio URL

export type MatsuratTime = 'morning' | 'evening';
export type MatsuratVariant = 'sughra' | 'kubra';

export interface MatsuratItem {
  id: string;
  order: number;
  title: string;
  arabicTitle: string;
  variant: 'sughra' | 'kubra';
  targetCount: number;
  
  // Teks Arab
  arabic: string;
  arabicEvening?: string;

  // Transliterasi Latin
  transliteration: string;
  transliterationEvening?: string;

  // Terjemahan Bahasa Indonesia
  translation: string;
  translationEvening?: string;

  // Keutamaan & Sanad
  fadhilah: string;
  source: string;

  // Audio URL (Per-doa)
  audioUrl?: string;
  audioUrlEvening?: string;
}

export interface MatsuratMeta {
  fullAudioMorning: {
    url: string;
    fallbackUrl?: string;
    reciter: string;
    title: string;
  };
  fullAudioEvening: {
    url: string;
    fallbackUrl?: string;
    reciter: string;
    title: string;
  };
}

export const MATSURAT_META: MatsuratMeta = {
  fullAudioMorning: {
    url: '/audio/almatsurat/Al-Matsurat-Pagi.mp3',
    fallbackUrl: 'https://archive.org/download/al-matsurat-kubro-shugro-pagi-dan-petang/Al%20Matsurat%20Sughra%20Pagi%20.mp3',
    reciter: 'Syekh Mishary Rashid Al-Afasy',
    title: 'Al-Ma\'tsurat Wazhifah Pagi (Ash-Shabah)'
  },
  fullAudioEvening: {
    url: '/audio/almatsurat/Al-Matsurat-Petang.mp3',
    fallbackUrl: 'https://archive.org/download/al-matsurat-kubro-shugro-pagi-dan-petang/Al%20Matsurat%20Sughro%20Sore%20Petang.mp3',
    reciter: 'Syekh Mishary Rashid Al-Afasy',
    title: 'Al-Ma\'tsurat Wazhifah Petang (Al-Masaa\')'
  }
};

export const AL_MATSURAT_ITEMS: MatsuratItem[] = [
  {
    id: 'fatihah',
    order: 1,
    title: 'Ta\'awwudz & Surah Al-Fatihah',
    arabicTitle: 'الاستعاذة وسورة الفاتحة',
    variant: 'sughra',
    targetCount: 1,
    arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ۝',
    transliteration: 'A\'uudzu billaahi minasy-syaythaanir-rajiim. Bismillaahir-rahmaanir-rahiim. Al-hamdu lillaahi rabbil \'aalamiin. Ar-rahmaanir-rahiim. Maaliki yawmid-diin. Iyyaaka na\'budu wa iyyaaka nasta\'iin. Ihdinash-shiraathal mustaqiim. Shiraathalladziina an\'amta \'alayhim ghayril maghdhuubi \'alayhim waladh-dhaalliin.',
    translation: 'Aku berlindung kepada Allah dari godaan setan yang terkutuk. Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan semesta alam. Maha Pemurah lagi Maha Penyayang. Pemilik hari pembalasan. Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan. Tunjukilah kami jalan yang lurus, (yaitu) jalan orang-orang yang telah Engkau beri nikmat kepada mereka; bukan (jalan) mereka yang dimurkai dan bukan (pula jalan) mereka yang sesat.',
    fadhilah: 'Surah pembuka Al-Qur\'an (Ummul Kitab) dan penawar (asy-Syifa) atas segala penyakit dan kegelisahan hati.',
    source: 'QS. Al-Fatihah: 1-7',
    audioUrl: 'https://server8.mp3quran.net/afs/001.mp3'
  },
  {
    id: 'baqarah_awal',
    order: 2,
    title: 'Awal Surah Al-Baqarah (1-5)',
    arabicTitle: 'أوائل سورة البقرة (١-٥)',
    variant: 'kubra',
    targetCount: 1,
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nالم ۝ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ۝ الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ ۝ وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ ۝ أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ ۝',
    transliteration: 'Bismillaahir-rahmaanir-rahiim. Alif-Laaam-Miiim. Dzaalikal kitaabu laa rayba fiihi hudal lil-muttaqiin. Alladziina yu\'minuuna bil-ghaybi wa yuqiimuunash-shalaata wa mimmaa razaqnaahum yunfiquun. Walladziina yu\'minuuna bimaa unzila ilayka wa maa unzila min qablika wa bil-aakhirati hum yuuqinuun. Ulaaa-ika \'alaa hudam mir rabbihim wa ulaaa-ika humul muflihuun.',
    translation: 'Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Alif Lam Mim. Kitab (Al-Qur\'an) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa, (yaitu) mereka yang beriman kepada yang gaib, melaksanakan salat, dan menginfakkan sebagian rezeki yang Kami berikan kepada mereka, dan mereka yang beriman kepada (Al-Qur\'an) yang diturunkan kepadamu (Muhammad) dan (kitab-kitab) yang telah diturunkan sebelum engkau, serta mereka yakin akan adanya akhirat. Merekalah yang mendapat petunjuk dari Tuhannya, dan mereka itulah orang-orang yang beruntung.',
    fadhilah: 'Membaca 5 ayat pertama surah Al-Baqarah di pagi dan sore hari menjauhkan rumah dan jiwa dari gangguan setan.',
    source: 'QS. Al-Baqarah: 1-5 (HR. Ad-Darimi & Thabrani)',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002001.mp3'
  },
  {
    id: 'ayat_kursi',
    order: 3,
    title: 'Ayat Kursi (Puncak Ayat Al-Qur\'an)',
    arabicTitle: 'آية الكرسي',
    variant: 'sughra',
    targetCount: 1,
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ ۝',
    transliteration: 'Allaahu laaa ilaaha illaa huwal hayyul qayyuum, laa ta\'khudzuhuu sinatuw wa laa nawm, lahuu maa fis-samaawaati wa maa fil ardh, man dzalladzii yasyfa\'u \'indahuuu illaa bi-idznih, ya\'lamu maa bayna aydiihim wa maa khalfahum, wa laa yuhiithuuna bisyay-im min \'ilmihiii illaa bimaa syaaa\', wasi\'a kursiyyuhus-samaawaati wal ardh, wa laa ya-uuduhuu hifzhuhumaa, wa huwal \'aliyyul \'azhiim.',
    translation: 'Allah, tidak ada Tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus-menerus mengurus (makhluk-Nya); tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Allah mengetahui apa-apa yang di hadapan mereka dan di belakang mereka, dan mereka tidak mengetahui apa-apa dari ilmu Allah melainkan apa yang dikehendaki-Nya. Kursi Allah meliputi langit dan bumi. Dan Allah tidak merasa berat memelihara keduanya, dan Allah Maha Tinggi lagi Maha Besar.',
    fadhilah: 'Siapa yang membacanya di pagi hari akan dilindungi dari godaan setan hingga petang, dan yang membacanya di petang hari dilindungi hingga pagi.',
    source: 'QS. Al-Baqarah: 255 (HR. Al-Hakim, dishahihkan Al-Albani)',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002255.mp3'
  },
  {
    id: 'baqarah_tengah',
    order: 4,
    title: 'Surah Al-Baqarah (256-257)',
    arabicTitle: 'سورة البقرة (٢٥٦-٢٥٧)',
    variant: 'kubra',
    targetCount: 1,
    arabic: 'لَا إِكْرَاهَ فِي الدِّينِ ۖ قَد تَّبَيَّنَ الرُّشْدُ مِنَ الْغَيِّ ۚ فَمَن يَكْفُرْ بِالطَّاغُوتِ وَيُؤْمِن بِاللَّهِ فَقَدِ اسْتَمْسَكَ بِالْعُرْوَةِ الْوُثْقَىٰ لَا انفِصَامَ لَهَا ۗ وَاللَّهُ سَمِيعٌ عَلِيمٌ ۝ اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا يُخْرِجُهُم مِّنَ الظُّلُمَاتِ إِلَى النُّورِ ۖ وَالَّذِينَ كَفَرُوا أَوْلِيَاؤُهُمُ الطَّاغُوتُ يُخْرِجُونَهُم مِّنَ النُّورِ إِلَى الظُّلُمَاتِ ۗ أُولَٰئِكَ أَصْحَابُ النَّارِ ۖ هُمْ فِيهَا خَالِدُونَ ۝',
    transliteration: 'Laaa ikraaha fid-diin, qat-tabayyanar-rusydu minal ghayy, famay yakfur bith-thaaghuuti wa yu\'mim billaahi faqadistamsaka bil \'urwatil wutsqaa lanfishaama lahaa, wallaahu samii\'un \'aliim. Allaahu waliyyulladziina aamanuu yukhrijuhum minazh-zhulumaati ilan-nuur, walladziina kafaruuu awliyaaa-uhumuth-thaaghuutu yukhrijuunahum minan-nuuri ilazh-zhulumaat, ulaaa-ika ash-haabun-naari hum fiihaa khaaliduun.',
    translation: 'Tidak ada paksaan dalam (menganut) agama (Islam); sesungguhnya telah jelas jalan yang benar daripada jalan yang sesat. Karena itu barangsiapa yang ingkar kepada Thaghut dan beriman kepada Allah, maka sesungguhnya ia telah berpegang kepada buhul tali yang amat kuat yang tidak akan putus. Dan Allah Maha Mendengar lagi Maha Mengetahui. Allah Pelindung orang-orang yang beriman; Dia mengeluarkan mereka dari kegelapan (kekafiran) kepada cahaya (iman). Dan orang-orang yang kafir, pelindung-pelindungnya ialah setan, yang mengeluarkan mereka dari cahaya kepada kegelapan. Mereka itulah penghuni neraka; mereka kekal di dalamnya.',
    fadhilah: 'Mempertegas keimanan yang kokoh (al-urwatul wutsqa) dan jaminan bimbingan Allah dari kegelapan menuju cahaya petunjuk.',
    source: 'QS. Al-Baqarah: 256-257',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002256.mp3'
  },
  {
    id: 'baqarah_akhir',
    order: 5,
    title: 'Akhir Surah Al-Baqarah (284-286)',
    arabicTitle: 'خواتيم سورة البقرة (٢٨٤-٢٨٦)',
    variant: 'kubra',
    targetCount: 1,
    arabic: 'لِّلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ وَإِن تُبْدُوا مَا فِي أَنفُسِكُمْ أَوْ تُخْفُوهُ يُحَاسِبْكُم بِهِ اللَّهُ ۖ فَيَغْفِرُ لِمَن يَشَاءُ وَيُعَذِّبُ مَن يَشَاءُ ۗ وَاللَّهُ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ۝ آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ ۝',
    transliteration: 'Lillaahi maa fis-samaawaati wa maa fil ardh, wa in tubduu maa fiii anfusikum aw tukhfuuhu yuhaasibkum bihir-laah, fa-yaghfiru limay yasyaaa-u wa yu\'adz-dzibu may yasyaaa\', wallaahu \'alaa kulli syay-in qadiir. Aamanar-rasuulu bimaaa unzila ilayhi mir rabbihii wal-mu\'minuun, kullun aamana billaahi wa malaaa-ikatihii wa kutubihii wa rusulih, laa nufarriqu bayna ahadim mir rusulih, wa qaaluu sami\'naa wa atha\'naa ghufraanaka rabbanaa wa ilaykal mashiir. Laa yukallifullaahu nafsan illaa wus\'ahaa, lahaa maa kasabat wa \'alayhaa maktasabat, rabbanaa laa tu-aakhidznaaa in nasiinaaa aw akhtha\'naa, rabbanaa wa laa tahmil \'alaynaaa ishran kamaa hamaltahuu \'alalladziina min qablinaa, rabbanaa wa laa tuhammilnaa maa laa thaaqata lanaa bih, wa\'fu \'annaa waghfir lanaa warhamnaa, anta mawlaanaa fanshurnaa \'alal qawmil kaafiriin.',
    translation: 'Milik Allah apa yang ada di langit dan apa yang ada di bumi. Jika kamu nyatakan apa yang ada di dalam hatimu atau kamu sembunyikan, niscaya Allah membuat perhitungan dengan kamu tentang perbuatanmu itu. Lalu Dia mengampuni siapa yang Dia kehendaki dan mengazab siapa yang Dia kehendaki. Dan Allah Maha Kuasa atas segala sesuatu. Rasul (Muhammad) telah beriman kepada apa yang diturunkan kepadanya dari Tuhannya, demikian pula orang-orang yang beriman. Semuanya beriman kepada Allah, malaikat-malaikat-Nya, kitab-kitab-Nya dan rasul-rasul-Nya. (Mereka berkata): "Kami tidak membeda-bedakan seorang pun dari rasul-rasul-Nya." Dan mereka berkata: "Kami dengar dan kami taat." (Mereka berdoa): "Ampunilah kami ya Tuhan kami dan kepada Engkaulah tempat kembali." Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya. Ia mendapat pahala (dari kebajikan) yang diusahakannya dan ia mendapat siksa (dari kejahatan) yang dikerjakannya. (Mereka berdoa): "Ya Tuhan kami, janganlah Engkau hukum kami jika kami lupa atau kami tersalah. Ya Tuhan kami, janganlah Engkau bebankan kepada kami beban yang berat sebagaimana Engkau bebankan kepada orang-orang sebelum kami. Ya Tuhan kami, janganlah Engkau pikulkan kepada kami apa yang tak sanggup kami memikulnya. Maafkanlah kami; ampunilah kami; dan rahmatilah kami. Engkaulah Penolong kami, maka tolonglah kami terhadap kaum yang kafir."',
    fadhilah: 'Barangsiapa membaca dua ayat terakhir dari surah Al-Baqarah pada suatu malam, niscaya kedua ayat itu mencukupinya (dari segala kejahatan).',
    source: 'QS. Al-Baqarah: 284-286 (HR. Bukhari & Muslim)',
    audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/002284.mp3'
  },
  {
    id: 'al_ikhlas',
    order: 6,
    title: 'Surah Al-Ikhlas (Dibaca 3x)',
    arabicTitle: 'سورة الإخلاص (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nقُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ۝',
    transliteration: 'Bismillaahir-rahmaanir-rahiim. Qul huwallaahu ahad. Allaahush-shamad. Lam yalid wa lam yuulad. Wa lam yakul lahuu kufuwan ahad.',
    translation: 'Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah: Dialah Allah, Yang Maha Esa. Allah adalah Tuhan yang bergantung kepada-Nya segala sesuatu. Dia tiada beranak dan tidak pula diperanakkan, dan tidak ada seorang pun yang setara dengan Dia.',
    fadhilah: 'Membaca Al-Ikhlas dan Mu\'awwidzatain (Al-Falaq & An-Nas) sebanyak 3x di pagi dan sore hari akan mencukupkanmu dari segala sesuatu.',
    source: 'QS. Al-Ikhlas: 1-4 (HR. Abu Dawud, At-Tirmidzi)',
    audioUrl: 'https://server8.mp3quran.net/afs/112.mp3'
  },
  {
    id: 'al_falaq',
    order: 7,
    title: 'Surah Al-Falaq (Dibaca 3x)',
    arabicTitle: 'سورة الفلق (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ۝',
    transliteration: 'Bismillaahir-rahmaanir-rahiim. Qul a\'uudzu birabbil falaq. Min syarri maa khalaq. Wa min syarri ghaasiqin idzaa waqab. Wa min syarrin-naffaatsaati fil \'uqad. Wa min syarri haasidin idzaa hasad.',
    translation: 'Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah: "Aku berlindung kepada Tuhan Yang Menguasai subuh, dari kejahatan makhluk-Nya, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan wanita-wanita tukang sihir yang menghembus pada buhul-buhul, dan dari kejahatan pendengki bila ia dengki."',
    fadhilah: 'Perlindungan mutlak dari sihir, hasad, dan marabahaya malam hari.',
    source: 'QS. Al-Falaq: 1-5 (HR. Abu Dawud, At-Tirmidzi)',
    audioUrl: 'https://server8.mp3quran.net/afs/113.mp3'
  },
  {
    id: 'an_nas',
    order: 8,
    title: 'Surah An-Nas (Dibaca 3x)',
    arabicTitle: 'سورة الناس (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ ۝',
    transliteration: 'Bismillaahir-rahmaanir-rahiim. Qul a\'uudzu birabbin-naas. Malikin-naas. Ilaahin-naas. Min syarril waswaasil khannaas. Alladzii yuwaswisu fii shuduurin-naas. Minal jinnati wan-naas.',
    translation: 'Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah: "Aku berlindung kepada Tuhan (yang memelihara dan menguasai) manusia. Raja manusia. Sembahan manusia. Dari kejahatan (bisikan) setan yang biasa bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia."',
    fadhilah: 'Benteng pertahanan diri dari bisikan was-was iblis dan jin.',
    source: 'QS. An-Nas: 1-6 (HR. Abu Dawud, At-Tirmidzi)',
    audioUrl: 'https://server8.mp3quran.net/afs/114.mp3'
  },
  {
    id: 'mulku_lillah',
    order: 9,
    title: 'Dzikir Kekuasaan dan Pujian Milik Allah (Dibaca 3x)',
    arabicTitle: 'أذكار الملك والحمد لله (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.',
    arabicEvening: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.',
    transliteration: 'Ashbahnaa wa ashbahal mulku lillaahi wal-hamdu lillaahi laaa ilaaha illallaahu wahdahu laa syariika lahu, lahul mulku wa lahul hamdu wa huwa \'alaa kulli syay-in qadiir. Rabbi as-aluka khayra maa fii haadzal yawmi wa khayra maa ba\'dahu, wa a\'uudzu bika min syarri maa fii haadzal yawmi wa syarri maa ba\'dahu, rabbi a\'uudzu bika minal kasali wa suuu-il kibar, rabbi a\'uudzu bika min \'adzaabin fin-naari wa \'adzaabin fil qabr.',
    transliterationEvening: 'Amsaynaa wa amsal mulku lillaahi wal-hamdu lillaahi laaa ilaaha illallaahu wahdahu laa syariika lahu, lahul mulku wa lahul hamdu wa huwa \'alaa kulli syay-in qadiir. Rabbi as-aluka khayra maa fii haadzihil laylati wa khayra maa ba\'dahaa, wa a\'uudzu bika min syarri maa fii haadzihil laylati wa syarri maa ba\'dahaa, rabbi a\'uudzu bika minal kasali wa suuu-il kibar, rabbi a\'uudzu bika min \'adzaabin fin-naari wa \'adzaabin fil qabr.',
    translation: 'Kami telah memasuki waktu pagi dan kerajaan milik Allah, segala puji bagi Allah. Tidak ada Tuhan selain Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala pujian, dan Dia Maha Kuasa atas segala sesuatu. Wahai Tuhanku, aku memohon kepada-Mu kebaikan hari ini dan kebaikan setelahnya. Dan aku berlindung kepada-Mu dari keburukan hari ini dan keburukan setelahnya. Wahai Tuhanku, aku berlindung kepada-Mu dari kemalasan dan keburukan di masa tua. Wahai Tuhanku, aku berlindung kepada-Mu dari siksa neraka dan siksa kubur.',
    translationEvening: 'Kami telah memasuki waktu petang dan kerajaan milik Allah, segala puji bagi Allah. Tidak ada Tuhan selain Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala pujian, dan Dia Maha Kuasa atas segala sesuatu. Wahai Tuhanku, aku memohon kepada-Mu kebaikan malam ini dan kebaikan setelahnya. Dan aku berlindung kepada-Mu dari keburukan malam ini dan keburukan setelahnya. Wahai Tuhanku, aku berlindung kepada-Mu dari kemalasan dan keburukan di masa tua. Wahai Tuhanku, aku berlindung kepada-Mu dari siksa neraka dan siksa kubur.',
    fadhilah: 'Pengakuan tauhid dan permohonan tulus agar dihindarkan dari godaan malas, siksa kubur, dan siksa neraka.',
    source: 'HR. Muslim no. 2723',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3',
    audioUrlEvening: '/audio/almatsurat/Al-Matsurat-Petang.mp3'
  },
  {
    id: 'khair_yaum',
    order: 10,
    title: 'Doa Memohon Kebaikan dan Berkah Hari Ini / Malam Ini',
    arabicTitle: 'دعاء طلب الخير والبركة',
    variant: 'sughra',
    targetCount: 1,
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَٰذَا الْيَوْمِ فَتْحَهُ، وَنَصْرَهُ، وَنُورَهُ، وَبَرَكَتَهُ، وَهُدَاهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ.',
    arabicEvening: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَٰذِهِ اللَّيْلَةِ فَتْحَهَا، وَنَصْرَهَا، وَنُورَهَا، وَبَرَكَتَهَا، وَهُدَاهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهَا وَشَرِّ مَا بَعْدَهَا.',
    transliteration: 'Allaahumma innii as-aluka khayra haadzal yawmi fathahu, wa nashrahu, wa nuurahu, wa barakatahu, wa hudaahu, wa a\'uudzu bika min syarri maa fiihi wa syarri maa ba\'dahu.',
    transliterationEvening: 'Allaahumma innii as-aluka khayra haadzihil laylati fathahaa, wa nashrahaa, wa nuurahaa, wa barakatahaa, wa hudaahaa, wa a\'uudzu bika min syarri maa fiihaa wa syarri maa ba\'dahaa.',
    translation: 'Ya Allah, sesungguhnya aku memohon kepada-Mu kebaikan hari ini: kemenangannya, pertolongannya, cahayanya, keberkahannya, dan petunjuknya. Dan aku berlindung kepada-Mu dari keburukan yang ada di dalamnya dan keburukan sesudahnya.',
    translationEvening: 'Ya Allah, sesungguhnya aku memohon kepada-Mu kebaikan malam ini: kemenangannya, pertolongannya, cahayanya, keberkahannya, dan petunjuknya. Dan aku berlindung kepada-Mu dari keburukan yang ada di dalamnya dan keburukan sesudahnya.',
    fadhilah: 'Meraih keberkahan penuh, kemenangan hidup, cahaya hidayah dan perlindungan dari keburukan sepanjang hari/malam.',
    source: 'HR. Abu Dawud no. 5084',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3',
    audioUrlEvening: '/audio/almatsurat/Al-Matsurat-Petang.mp3'
  },
  {
    id: 'bika_ashbahna',
    order: 11,
    title: 'Dzikir Kehidupan & Kematian Bersama Allah',
    arabicTitle: 'اللهم بك أصبحنا / أمسينا',
    variant: 'sughra',
    targetCount: 1,
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.',
    arabicEvening: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.',
    transliteration: 'Allaahumma bika ashbahnaa, wa bika amsaynaa, wa bika nahyaa, wa bika namuutu, wa ilaykan-nusyuur.',
    transliterationEvening: 'Allaahumma bika amsaynaa, wa bika ashbahnaa, wa bika nahyaa, wa bika namuutu, wa ilaykal mashiir.',
    translation: 'Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu petang. Dengan rahmat dan kehendak-Mu kami hidup dan dengan rahmat dan kehendak-Mu kami mati. Dan kepada-Mulah tempat dibangkitkan.',
    translationEvening: 'Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu petang, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi. Dengan rahmat dan kehendak-Mu kami hidup dan dengan rahmat dan kehendak-Mu kami mati. Dan kepada-Mulah tempat kembali.',
    fadhilah: 'Kepasrahan total atas hidup, mati, dan kebangkitan semata-mata karena kekuasaan Allah Rabbul Izzati.',
    source: 'HR. Tirmidzi no. 3391 (Hasan Shahih)',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3',
    audioUrlEvening: '/audio/almatsurat/Al-Matsurat-Petang.mp3'
  },
  {
    id: 'sayyidul_istighfar',
    order: 12,
    title: 'Sayyidul Istighfar (Raja Segala Istighfar - Dibaca 3x)',
    arabicTitle: 'سيد الاستغفار (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
    transliteration: 'Allaahumma anta rabbii laaa ilaaha illaa anta, khalaqtanii wa ana \'abduka, wa ana \'alaa \'ahdika wa wa\'dika mastatha\'tu, a\'uudzu bika min syarri maa shana\'tu, abuu-u laka bini\'matika \'alayya, wa abuu-u bidzambii faghfir lii fa-innahuu laa yaghfirudz-dzunuuba illaa anta.',
    translation: 'Ya Allah, Engkaulah Tuhanku, tiada Tuhan yang berhak disembah selain Engkau. Engkaulah yang menciptakan aku dan aku adalah hamba-Mu. Aku akan setia pada perjanjianku dengan-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang telah kuperbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku kepada-Mu, maka ampunilah aku. Karena sesungguhnya tidak ada yang dapat mengampuni dosa-dosa selain Engkau.',
    fadhilah: 'Barangsiapa membacanya di petang hari lalu meninggal di malamnya, ia masuk surga. Begitu pula bila membacanya di pagi hari lalu meninggal di siangnya.',
    source: 'HR. Bukhari no. 6306',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'afiyah',
    order: 13,
    title: 'Doa Keselamatan Jasmani & Ruhani (Dibaca 3x)',
    arabicTitle: 'دعاء العافية والاستعاذة من الكفر والفقر (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَٰهَ إِلَّا أَنْتَ.',
    transliteration: 'Allaahumma \'aafinii fii badanii, Allaahumma \'aafinii fii sam\'ii, Allaahumma \'aafinii fii basharii, laaa ilaaha illaa anta. Allaahumma innii a\'uudzu bika minal kufri wal faqr, Allaahumma innii a\'uudzu bika min \'adzaabil qabr, laaa ilaaha illaa anta.',
    translation: 'Ya Allah, berilah kesehatan pada badanku. Ya Allah, berilah kesehatan pada pendengaranku. Ya Allah, berilah kesehatan pada penglihatanku. Tiada Tuhan selain Engkau. Ya Allah, sesungguhnya aku berlindung kepada-Mu dari kekafiran dan kemiskinan. Ya Allah, sesungguhnya aku berlindung kepada-Mu dari siksa kubur. Tiada Tuhan selain Engkau.',
    fadhilah: 'Memelihara nikmat kesehatan fisik panca indera dan melindungi iman dari kemiskinan serta azab kubur.',
    source: 'HR. Abu Dawud no. 5090 (Hasan)',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'afwa_wal_afiyah',
    order: 14,
    title: 'Doa Perlindungan Menyeluruh Dunia & Akhirat',
    arabicTitle: 'دعاء العفو والعافية والحفظ من كل جانب',
    variant: 'sughra',
    targetCount: 1,
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.',
    transliteration: 'Allaahumma innii as-alukal \'afwa wal \'aafiyata fid-dunyaa wal aakhirah. Allaahumma innii as-alukal \'afwa wal \'aafiyata fii diinii wa dunyaaya wa ahlii wa maalii. Allaahummastur \'awraatii wa aamin raw\'aatii. Allaahummahfazhnii mim bayni yadayya, wa min khalfii, wa \'an yamiinii, wa \'an syimaalii, wa min fawqii, wa a\'uudzu bi\'azhamatika an ughtaala min tahtii.',
    translation: 'Ya Allah, sesungguhnya aku memohon ampunan dan keselamatan di dunia dan akhirat. Ya Allah, sesungguhnya aku memohon ampunan dan keselamatan dalam agamaku, duniaku, keluargaku, dan hartaku. Ya Allah, tutupilah aib-aibku dan tenteramkanlah kekhawatiranku. Ya Allah, jagalah aku dari depan, dari belakang, dari kanan, dari kiri, dan dari atasku. Dan aku berlindung dengan keagungan-Mu agar tidak disergap (dibinasakan) dari bawahku.',
    fadhilah: 'Rasulullah SAW tidak pernah meninggalkan doa penjagaan dari enam arah penjuru ini di setiap pagi dan petang.',
    source: 'HR. Abu Dawud no. 5074 & Ibnu Majah (Shahih)',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'hammi_wal_hazan',
    order: 15,
    title: 'Doa Perlindungan dari 6 Penyakit Jiwa & Lilitan Utang (Dibaca 3x)',
    arabicTitle: 'الاستعاذة من الهم والحزن والعجز والكسل والدين (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ.',
    transliteration: 'Allaahumma innii a\'uudzu bika minal hammi wal hazan, wa a\'uudzu bika minal \'ajzi wal kasal, wa a\'uudzu bika minal jubni wal bukhl, wa a\'uudzu bika min ghalabatid-dayni wa qahrir-rijaal.',
    translation: 'Ya Allah, sesungguhnya aku berlindung kepada-Mu dari rasa sedih dan gelisah, aku berlindung kepada-Mu dari kelemahan dan kemalasan, aku berlindung kepada-Mu dari sifat pengecut dan kikir, dan aku berlindung kepada-Mu dari lilitan utang serta kesewenang-wenangan manusia.',
    fadhilah: 'Doa agung penawar depresi mental, pelepas kesedihan, dan pembuka pintu kemandirian rezeki.',
    source: 'HR. Abu Dawud no. 1555 (Shahih)',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'bismillahilladzi',
    order: 16,
    title: 'Doa Perlindungan dari Segala Bahaya Bumi & Langit (Dibaca 3x)',
    arabicTitle: 'بسم الله الذي لا يضر مع اسمه شيء (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
    transliteration: 'Bismillaahilladzii laa yadhurru ma\'asmihii syay-un fil ardhi wa laa fis-samaaa-i wa huwas-samii\'ul \'aliim.',
    translation: 'Dengan nama Allah yang bersama nama-Nya tidak ada sesuatu pun di bumi maupun di langit yang dapat membahayakan, dan Dia Maha Mendengar lagi Maha Mengetahui.',
    fadhilah: 'Tidak ada marabahaya atau racun yang dapat mencelakai orang yang membacanya 3x setiap pagi dan petang.',
    source: 'HR. Abu Dawud & Tirmidzi no. 3388 (Hasan Shahih)',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'radhitu_billah',
    order: 17,
    title: 'Keridhaan kepada Allah, Islam, dan Rasulullah (Dibaca 3x)',
    arabicTitle: 'رضيت بالله ربا وبالإسلام دينا (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا وَرَسُولًا.',
    transliteration: 'Radhiitu billaahi rabbaa, wa bil-Islaami diinaa, wa bi Muhammadin shallallaahu \'alayhi wa sallama nabiyyaw wa rasuulaa.',
    translation: 'Aku rela Allah sebagai Tuhanku, Islam sebagai agamaku, dan Nabi Muhammad shallallahu \'alaihi wa sallam sebagai nabi dan rasul.',
    fadhilah: 'Merupakan hak atas Allah untuk meridhai siapa saja yang mengucapkannya 3x di setiap pagi dan petang.',
    source: 'HR. Abu Dawud no. 5072 & Tirmidzi (Hasan)',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'fitrah_islam',
    order: 18,
    title: 'Dzikir di Atas Fitrah Islam & Agama Nabi Ibrahim (Dibaca 3x)',
    arabicTitle: 'أصبحنا / أمسينا على فطرة الإسلام (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'أَصْبَحْنَا عَلَىٰ فِطْرَةِ الْإِسْلَامِ، وَعَلَىٰ كَلِمَةِ الْإِخْلَاصِ، وَعَلَىٰ دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَىٰ مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.',
    arabicEvening: 'أَمْسَيْنَا عَلَىٰ فِطْرَةِ الْإِسْلَامِ، وَعَلَىٰ كَلِمَةِ الْإِخْلَاصِ، وَعَلَىٰ دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَىٰ مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.',
    transliteration: 'Ashbahnaa \'alaa fithratil Islaam, wa \'alaa kalimatil ikhlaash, wa \'alaa diini nabiyyinaa Muhammadin shallallaahu \'alayhi wa sallam, wa \'alaa millati abiinaaa Ibraahiima haniifam muslimaw wa maa kaana minal musyrikiin.',
    transliterationEvening: 'Amsaynaa \'alaa fithratil Islaam, wa \'alaa kalimatil ikhlaash, wa \'alaa diini nabiyyinaa Muhammadin shallallaahu \'alayhi wa sallam, wa \'alaa millati abiinaaa Ibraahiima haniifam muslimaw wa maa kaana minal musyrikiin.',
    translation: 'Kami berpagi hari di atas fitrah Islam, di atas kalimat ikhlas (tauhid), di atas agama nabi kami Muhammad shallallahu \'alaihi wa sallam, dan di atas millah bapak kami Ibrahim yang lurus lagi berserah diri, dan dia bukanlah termasuk orang-orang musyrik.',
    translationEvening: 'Kami berpetang hari di atas fitrah Islam, di atas kalimat ikhlas (tauhid), di atas agama nabi kami Muhammad shallallahu \'alaihi wa sallam, dan di atas millah bapak kami Ibrahim yang lurus lagi berserah diri, dan dia bukanlah termasuk orang-orang musyrik.',
    fadhilah: 'Menjaga identitas akidah lurus di atas fitrah para nabi dan memurnikan tauhid setiap hari.',
    source: 'HR. Ahmad no. 15360 (Shahih)',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3',
    audioUrlEvening: '/audio/almatsurat/Al-Matsurat-Petang.mp3'
  },
  {
    id: 'subhanallah_adada',
    order: 19,
    title: 'Tasbih Seberat Arsy & Sebanyak Tinta Kalimat-Nya (Dibaca 3x)',
    arabicTitle: 'سبحان الله وبحمده عدد خلقه (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.',
    transliteration: 'Subhaanallaahi wa bihamdihii, \'adada khalqihii, wa ridhaa nafsihii, wa zinata \'arsyihii, wa midaada kalimaatih.',
    translation: 'Maha Suci Allah dan segala puji bagi-Nya, sebanyak bilangan makhluk-Nya, sebesar keridhaan diri-Nya, seberat timbangan \'Arsy-Nya, dan sebanyak tinta kalimat-kalimat-Nya.',
    fadhilah: 'Pahalanya melipatgandakan seluruh dzikir sepanjang hari di sisi Allah SWT.',
    source: 'HR. Muslim no. 2726',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'syirik_protection',
    order: 20,
    title: 'Doa Perlindungan dari Syirik Tersembunyi (Dibaca 3x)',
    arabicTitle: 'دعاء الاستعاذة من الشرك الخفي (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'اللَّهُمَّ إِنَّا نَعُوذُ بِكَ مِنْ أَنْ نُشْرِكَ بِكَ شَيْئًا نَعْلَمُهُ، وَنَسْتَغْفِرُكَ لِمَا لَا نَعْلَمُهُ.',
    transliteration: 'Allaahumma innaa na\'uudzu bika min an nusyrika bika syay-an na\'lamuhu, wa nastaghfiruka limaa laa na\'lamuh.',
    translation: 'Ya Allah, sesungguhnya kami berlindung kepada-Mu dari menyekutukan-Mu dengan sesuatu yang kami ketahui, dan kami memohon ampunan kepada-Mu terhadap apa yang tidak kami ketahui.',
    fadhilah: 'Menghilangkan bahaya syirik kecil (riya\') yang lebih samar daripada rayapan semut hitam di atas batu hitam.',
    source: 'HR. Ahmad no. 19606 (Shahih Lighairihi)',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'audzu_bikalimatillah',
    order: 21,
    title: 'Perlindungan dengan Kalimat Allah yang Sempurna (Dibaca 3x)',
    arabicTitle: 'أعوذ بكلمات الله التامات من شر ما خلق (٣ مرات)',
    variant: 'sughra',
    targetCount: 3,
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
    transliteration: 'A\'uudzu bikalimaatillaahit-taammaati min syarri maa khalaq.',
    translation: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan apa yang telah Dia ciptakan.',
    fadhilah: 'Terhindar dari sengatan berbisa, racun, dan kejahatan makhluk di muka bumi.',
    source: 'HR. Muslim no. 2709',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'hasbiyallah',
    order: 22,
    title: 'Hasbiyallah (Cukuplah Allah Bagiku - Dibaca 7x)',
    arabicTitle: 'حسبي الله لا إله إلا هو (٧ مرات)',
    variant: 'sughra',
    targetCount: 7,
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.',
    transliteration: 'Hasbiyallaahu laaa ilaaha illaa huwa, \'alayhi tawakkaltu wa huwa rabbul \'arsyil \'azhiim.',
    translation: 'Cukuplah Allah bagiku; tidak ada Tuhan selain Dia. Hanya kepada-Nya aku bertawakkal, dan Dia adalah Tuhan yang memiliki \'Arsy yang agung.',
    fadhilah: 'Barangsiapa membacanya 7x di pagi dan petang, Allah akan mencukupkan baginya urusan dunia dan akhirat yang membuatnya gundah.',
    source: 'HR. Abu Dawud no. 5081 (Mauquf Hasan)',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'shalawat',
    order: 23,
    title: 'Shalawat Ibrahimiyah atas Nabi Muhammad SAW (Dibaca 10x)',
    arabicTitle: 'الصلاة على النبي ﷺ (١٠ مرات)',
    variant: 'sughra',
    targetCount: 10,
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ وَعَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ، وَبَارِكْ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَىٰ سَيِّدِنَا إِبْرَاهِيمَ وَعَلَىٰ آلِ سَيِّدِنَا إِبْرَاهِيمَ، فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ.',
    transliteration: 'Allaahumma shalli \'alaa sayyidinaa Muhammadin wa \'alaa aali sayyidinaa Muhammad, kamaa shallayta \'alaa sayyidinaa Ibraahiima wa \'alaa aali sayyidinaa Ibraahiim, wa baarik \'alaa sayyidinaa Muhammadin wa \'alaa aali sayyidinaa Muhammad, kamaa baarakta \'alaa sayyidinaa Ibraahiima wa \'alaa aali sayyidinaa Ibraahiim, fil \'aalamiina innaka hamiidum majiid.',
    translation: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad dan kepada keluarga Nabi Muhammad, sebagaimana Engkau telah melimpahkan rahmat kepada Nabi Ibrahim dan kepada keluarga Nabi Ibrahim. Dan berkahilah Nabi Muhammad dan keluarga Nabi Muhammad, sebagaimana Engkau telah memberkahi Nabi Ibrahim dan keluarga Nabi Ibrahim. Di seantero alam semesta sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.',
    fadhilah: 'Barangsiapa bershalawat kepadaku 10x di pagi hari dan 10x di petang hari, ia akan meraih syafaatku pada hari kiamat.',
    source: 'HR. At-Thabrani (Sanad Jayyid)',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'tasbih_tahmid_tahlil',
    order: 24,
    title: 'Tasbih, Tahmid, Tahlil, & Takbir (Dibaca 100x)',
    arabicTitle: 'الباقيات الصالحات (١٠٠ مرة)',
    variant: 'sughra',
    targetCount: 100,
    arabic: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ.',
    transliteration: 'Subhaanallaahi, wal-hamdu lillaahi, wa laaa ilaaha illallaahu, wallaahu akbar.',
    translation: 'Maha Suci Allah, segala puji bagi Allah, tiada Tuhan selain Allah, dan Allah Maha Besar.',
    fadhilah: 'Kalimat yang paling dicintai Allah, menggugurkan dosa laksana dedaunan gugur dari pohonnya.',
    source: 'HR. Muslim no. 2137',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'tahlil_wahdahu',
    order: 25,
    title: 'Tahlil Tauhid Sempurna (Dibaca 10x)',
    arabicTitle: 'التهليل التام للتوحيد (١٠ مرات)',
    variant: 'sughra',
    targetCount: 10,
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ.',
    transliteration: 'Laaa ilaaha illallaahu wahdahu laa syariika lahu, lahul mulku wa lahul hamdu wa huwa \'alaa kulli syay-in qadiir.',
    translation: 'Tidak ada Tuhan selain Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya segenap kerajaan dan milik-Nya segala pujian, dan Dia Maha Kuasa atas segala sesuatu.',
    fadhilah: 'Pahalanya seperti memerdekakan empat hamba sahaya dari keturunan Nabi Ismail.',
    source: 'HR. Bukhari no. 6404 & Muslim no. 2693',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'istighfar_100',
    order: 26,
    title: 'Istighfar & Taubat Harian (Dibaca 100x)',
    arabicTitle: 'الاستغفار والتوبة (١٠٠ مرة)',
    variant: 'sughra',
    targetCount: 100,
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ.',
    transliteration: 'Astaghfirullaahal \'azhiimalladzii laaa ilaaha illaa huwal hayyul qayyuuma wa atuubu ilayh.',
    translation: 'Aku memohon ampun kepada Allah Yang Maha Agung, tiada Tuhan selain Dia Yang Maha Hidup lagi Maha Berdiri Sendiri, dan aku bertaubat kepada-Nya.',
    fadhilah: 'Diampuni dosanya walaupun ia pernah lari dari medan perang, serta membukakan pintu rezeki dari arah yang tidak disangka-sangka.',
    source: 'HR. Abu Dawud no. 1517 & Tirmidzi (Shahih)',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  },
  {
    id: 'doa_rabithah',
    order: 27,
    title: 'Doa Rabithah (Ikatan Persaudaraan Islam)',
    arabicTitle: 'دعاء الرابطة',
    variant: 'kubra',
    targetCount: 1,
    arabic: 'اللَّهُمَّ إِنَّكَ تَعْلَمُ أَنَّ هَٰذِهِ الْقُلُوبَ قَدِ اجْتَمَعَتْ عَلَىٰ مَحَبَّتِكَ، وَالْتَقَتْ عَلَىٰ طَاعَتِكَ، وَتَوَحَّدَتْ عَلَىٰ دَعْوَتِكَ، وَتَعَاهَدَتْ عَلَىٰ نُصْرَةِ شَرِيعَتِكَ، فَوَثِّقِ اللَّهُمَّ رَابِطَتَهَا، وَأَدِمْ وُدَّهَا، وَاهْدِهَا سُبُلَهَا، وَامْلَأْهَا بِنُورِكَ الَّذِي لَا يَخْبُو، وَاشْرَحْ صُدُورَهَا بِفَيْضَانِ الْإِيمَانِ بِكَ، وَجَمِيلِ التَّوَكُّلِ عَلَيْكَ، وَأَحْيِهَا بِمَعْرِفَتِكَ، وَأَمِتْهَا عَلَىٰ الشَّهَادَةِ فِي سَبِيلِكَ، إِنَّكَ نِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ. اللَّهُمَّ آمِينَ، وَصَلِّ اللَّهُمَّ عَلَىٰ سَيِّدِنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَصَحْبِهِ وَسَلِّمْ.',
    transliteration: 'Allaahumma innaka ta\'lamu anna haadzihil quluuba qadijtama\'at \'alaa mahabbatik, wal-taqat \'alaa thaa\'atik, wa tawahhadat \'alaa da\'watik, wa ta\'aahadat \'alaa nushrati syarii\'atik. Fa watstsiqillaahumma raabithatahaa, wa adim wuddahaa, wahdihaa subulahaa, wamla\'haa binuurikalladzii laa yakhbuu, wasyrah shuduurahaa bifaydhanil iimaani bika, wa jamiilit-tawakkuli \'alayk, wa ahyihaa bima\'rifatik, wa amith-haa \'alasy-syahaadati fii sabiilik, innaka ni\'mal mawlaa wa ni\'man-nashiir. Allaahumma aamiin, wa shallillaahumma \'alaa sayyidinaa Muhammadin wa \'alaa aalihii wa shahbihii wa sallam.',
    translation: 'Ya Allah, sesungguhnya Engkau mengetahui bahwa hati-hati ini telah berkumpul di atas cinta kepada-Mu, telah bertemu di atas ketaatan kepada-Mu, telah bersatu di atas dakwah-Mu, dan telah berjanji setia untuk membela syariat-Mu. Maka kukuhkanlah ya Allah ikatannya, abadikanlah kasih sayangnya, tunjukilah jalan-jalannya, penuhilah ia dengan cahaya-Mu yang tidak pernah padam, lapangkanlah dadanya dengan limpahan iman kepada-Mu dan indahnya tawakkal kepada-Mu, hidupkanlah ia dengan ma\'rifah kepada-Mu, dan matikanlah ia di atas syahid di jalan-Mu. Sesungguhnya Engkaulah sebaik-baik Pelindung dan sebaik-baik Penolong. Ya Allah kabulkanlah, dan limpahkanlah shalawat serta salam kepada junjungan kami Nabi Muhammad, beserta keluarga dan para sahabatnya.',
    fadhilah: 'Doa penutup wazhifah Al-Ma\'tsurat yang menyatukan jiwa-jiwa beriman dalam ukhuwah islamiyah dan komitmen dakwah yang kokoh.',
    source: 'Doa Ma\'tsur Khusus Hasan Al-Banna (Wazhifah Kubra)',
    audioUrl: '/audio/almatsurat/Al-Matsurat-Pagi.mp3'
  }
];
