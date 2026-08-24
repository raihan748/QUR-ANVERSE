// Database Hukum Tajwid & Panduan Makhraj Huruf Al-Qur'an
// Standar Riwayat Hafsh 'an 'Ashim (Thariq Asy-Syathibiyyah)

export interface TajwidRule {
  id: string;
  name: string;
  arabicName: string;
  category: 'nun_sukun' | 'mim_sukun' | 'mad' | 'qalqalah' | 'makhraj' | 'harakat';
  color: string;
  description: string;
  correctGuide: string;
  letters: string[];
  durationHaraka?: number;
  sampleArabic: string;
  sampleMeaning: string;
}

export const TAJWID_RULES_DB: TajwidRule[] = [
  {
    id: 'ikhfa_haqiqi',
    name: 'Ikhfa Haqiqi',
    arabicName: 'إخفاء حقيقي',
    category: 'nun_sukun',
    color: '#D97706', // Amber / Orange
    description: 'Nun sukun (نْ) atau Tanwin (ـًـٍـٌ) bertemu dengan salah satu dari 15 huruf Ikhfa.',
    correctGuide: 'Samarkan suara Nun mendekati makhraj huruf berikutnya disertai dengung (Ghunnah) sempurna selama 2 harakat.',
    letters: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'],
    durationHaraka: 2,
    sampleArabic: 'مِن قَبْلِكُمْ',
    sampleMeaning: 'Min qablikum (Dengung samar ke huruf Qaf)'
  },
  {
    id: 'idgham_bighunnah',
    name: 'Idgham Bighunnah',
    arabicName: 'إدغام بغنة',
    category: 'nun_sukun',
    color: '#059669', // Emerald
    description: 'Nun sukun (نْ) atau Tanwin bertemu salah satu huruf Yanmu (ي ن م و).',
    correctGuide: 'Leburkan suara Nun sukun ke dalam huruf berikutnya secara penuh disertai dengung kuat (Ghunnah) 2 harakat.',
    letters: ['ي', 'ن', 'م', 'و'],
    durationHaraka: 2,
    sampleArabic: 'مَن يَقُولُ',
    sampleMeaning: 'May-yaquulu (Lebur dengan dengung 2 harakat)'
  },
  {
    id: 'idgham_bilaghunnah',
    name: 'Idgham Bilaghunnah',
    arabicName: 'إدغام بغير غنة',
    category: 'nun_sukun',
    color: '#0284C7', // Sky Blue
    description: 'Nun sukun (نْ) atau Tanwin bertemu huruf Lam (ل) atau Ra (ر).',
    correctGuide: 'Leburkan suara Nun sukun ke huruf Lam/Ra secara total TANPA dengung sama sekali.',
    letters: ['ل', 'ر'],
    durationHaraka: 0,
    sampleArabic: 'مِّن رَّبِّهِمْ',
    sampleMeaning: 'Mir-rabbihim (Masuk total tanpa dengung)'
  },
  {
    id: 'iqlab',
    name: 'Iqlab',
    arabicName: 'إقلاب',
    category: 'nun_sukun',
    color: '#7C3AED', // Purple
    description: 'Nun sukun (نْ) atau Tanwin bertemu dengan huruf Ba (ب).',
    correctGuide: 'Ubahlah bunyi Nun/Tanwin menjadi suara Mim (م) ringan dengan kedua bibir merapat lembut disertai dengung 2 harakat.',
    letters: ['ب'],
    durationHaraka: 2,
    sampleArabic: 'مِن بَعْدِ',
    sampleMeaning: 'Mim-ba\'di (Suara Mim renggang & dengung 2 harakat)'
  },
  {
    id: 'izhar_halqi',
    name: 'Izhar Halqi',
    arabicName: 'إظهار حلقي',
    category: 'nun_sukun',
    color: '#4B5563', // Slate / Neutral
    description: 'Nun sukun (نْ) atau Tanwin bertemu huruf halq (ء هـ ع ح غ خ).',
    correctGuide: 'Lafalkan suara Nun sukun dengan sangat jelas, tegas, dan TANPA dengung (tidak boleh ditahan).',
    letters: ['ء', 'هـ', 'ع', 'ح', 'غ', 'خ'],
    durationHaraka: 0,
    sampleArabic: 'مَنْ آمَنَ',
    sampleMeaning: 'Man aamana (Jelas dan tegas tanpa ditahan)'
  },
  {
    id: 'mad_wajib_muttashil',
    name: 'Mad Wajib Muttashil',
    arabicName: 'مد واجب متصل',
    category: 'mad',
    color: '#DC2626', // Red
    description: 'Huruf Mad bertemu dengan Hamzah (ء) dalam SATU KATA yang sama.',
    correctGuide: 'Wajib dipanjangkan sepanjang 4 atau 5 harakat (2 s/d 2.5 alif). Tidak boleh dibaca pendek 2 harakat!',
    letters: ['ء'],
    durationHaraka: 5,
    sampleArabic: 'السَّمَاءِ - جَاءَ',
    sampleMeaning: 'Assamaaa\' - Jaaaa\'a (Panjang wajib 4-5 harakat)'
  },
  {
    id: 'mad_jaiz_munfashil',
    name: 'Mad Jaiz Munfashil',
    arabicName: 'مد جائز منفصل',
    category: 'mad',
    color: '#E11D48', // Rose Red
    description: 'Huruf Mad berada di akhir kata dan bertemu Hamzah (ء) di AWAL KATA berikutnya.',
    correctGuide: 'Boleh dipanjangkan 4 atau 5 harakat (Thariq Syathibiyyah) atau 2 harakat (Thayyibah). Konsisten 4-5 harakat diutamakan.',
    letters: ['ء'],
    durationHaraka: 4,
    sampleArabic: 'إِنَّا أَنزَلْنَاهُ',
    sampleMeaning: 'Innaaaa anzalnaahu (Panjang 4-5 harakat)'
  },
  {
    id: 'mad_lazim_kilmi',
    name: 'Mad Lazim Kilmi Mutsaqqal',
    arabicName: 'مد لازم كلمي مثقل',
    category: 'mad',
    color: '#991B1B', // Dark Red
    description: 'Huruf Mad bertemu huruf bertasydid dalam satu kata (seperti Dhaallin).',
    correctGuide: 'Wajib dipanjangkan sempurna sepanjang 6 HARAKAT (3 alif) lalu ditekan (nabr) ke huruf bertasydid.',
    letters: ['ّ'],
    durationHaraka: 6,
    sampleArabic: 'وَلَا الضَّالِّينَ',
    sampleMeaning: 'Wa lad-Dhaaaalliiin (6 harakat penuh + tekan tasydid)'
  },
  {
    id: 'qalqalah',
    name: 'Qalqalah (Sugra / Kubra)',
    arabicName: 'قلقلة',
    category: 'qalqalah',
    color: '#2563EB', // Blue
    description: 'Huruf Qalqalah (ق ط ب ج د - Baju Di Toko) dalam keadaan sukun asli atau waqaf.',
    correctGuide: 'Pantulkan suara huruf secara kuat dan bersih tanpa menambah suara vokal e/a baru.',
    letters: ['ق', 'ط', 'ب', 'ج', 'د'],
    sampleArabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ',
    sampleMeaning: 'Ahad(q) - As-Samad(q) (Pantulan jelas dan berbobot)'
  },
  {
    id: 'makhraj_ain',
    name: 'Makhraj Huruf \'Ain (ع)',
    arabicName: 'مخرج العين',
    category: 'makhraj',
    color: '#B45309', // Amber-800
    description: 'Huruf \'Ain keluar dari tengah tenggorokan (Wasathul Halq).',
    correctGuide: 'Keluarkan suara dari tengah tenggorokan dengan menekan pita suara lembut. JANGAN dibaca seperti Hamzah/Alif (أ) atau \'Nga\'!',
    letters: ['ع'],
    sampleArabic: 'الْعَالَمِينَ - نَعْبُدُ',
    sampleMeaning: 'Al-\'Aalamiin - Na\'budu (Tengah tenggorokan bersih)'
  },
  {
    id: 'makhraj_ha_besar',
    name: 'Makhraj Huruf Ha\' Halus (ح)',
    arabicName: 'مخرج الحاء',
    category: 'makhraj',
    color: '#065F46', // Dark Emerald
    description: 'Huruf Ha (ح) keluar dari tengah tenggorokan dengan aliran nafas bersih (Hams).',
    correctGuide: 'Keluarkan desis nafas lembut dan kering dari tengah tenggorokan. JANGAN dibaca Ha besar (هـ) dada atau Kha (خ) ngorok!',
    letters: ['ح'],
    sampleArabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
    sampleMeaning: 'Ar-Rahmaanir-Rahiim (Desis nafas bersih tengah tenggorokan)'
  },
  {
    id: 'makhraj_dhad',
    name: 'Makhraj Huruf Dhad (ض)',
    arabicName: 'مخرج الضاد',
    category: 'makhraj',
    color: '#1E3A8A', // Deep Navy
    description: 'Huruf Dhad keluar dari tepi lidah (Hafatul Lisan) menempel pada gigi geraham atas.',
    correctGuide: 'Gunakan tepi lidah dengan sifat Istithalah (memanjang) dan Ithbaq (menutup). JANGAN dibaca seperti Dal (د) atau Zho (ظ)!',
    letters: ['ض'],
    sampleArabic: 'غَيْرِ الْمَغْضُوبِ',
    sampleMeaning: 'Ghayril Maghdhuubi (Tepi lidah + geraham atas)'
  }
];

// Model Soal Ujian Tajwid Khusus untuk Demo & Ujian Otomatis
export interface TajwidExamAyah {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  words: {
    text: string;
    ruleId?: string;
    highlightColor?: string;
    ruleTitle?: string;
    mistakeType?: 'ikhfa_short' | 'mad_short' | 'makhraj_ain' | 'makhraj_ha' | 'harakat_error';
  }[];
  primaryRule: TajwidRule;
  commonMistakes: {
    type: string;
    label: string;
    mistakeText: string;
    syekhAudioWordIndex: number;
    explanation: string;
    correctWay: string;
  }[];
}

export const TAJWID_EXAM_PRESETS: TajwidExamAyah[] = [
  {
    surahNumber: 1,
    ayahNumber: 2,
    surahName: 'Al-Fatihah',
    arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: 'Alhamdu lillaahi Rabbil \'aalamiin',
    translation: 'Segala puji bagi Allah, Tuhan seluruh alam.',
    words: [
      { text: 'الْحَمْدُ', ruleId: 'makhraj_ha_besar', highlightColor: '#065F46', ruleTitle: 'Ha\' Halus (ح)' },
      { text: 'لِلَّهِ' },
      { text: 'رَبِّ' },
      { text: 'الْعَالَمِينَ', ruleId: 'makhraj_ain', highlightColor: '#B45309', ruleTitle: 'Makhraj \'Ain (ع)' }
    ],
    primaryRule: TAJWID_RULES_DB.find((r) => r.id === 'makhraj_ain')!,
    commonMistakes: [
      {
        type: 'makhraj_ain',
        label: 'Makhraj \'Ain (ع) Tertukar Hamzah (أ)',
        mistakeText: 'Alhamdu lillahi Rabbil Aalamiin (dibaca Al-Aalamin)',
        syekhAudioWordIndex: 3,
        explanation: 'Huruf \'Ain (ع) pada kata الْعَالَمِينَ dibaca datar seperti Alif/Hamzah (أ).',
        correctWay: 'Tekan pita suara di tengah tenggorokan (Wasathul Halq) agar terdengar bunyi \'Ain yang murni dan bersih.'
      },
      {
        type: 'makhraj_ha',
        label: 'Makhraj Ha\' Halus (ح) Tertukar Ha Besar (هـ)',
        mistakeText: 'Al-hamdu (dibaca Ha dada besar)',
        syekhAudioWordIndex: 0,
        explanation: 'Huruf Ha (ح) pada الْحَمْدُ dibaca berat dari dada (seperti هـ).',
        correctWay: 'Keluarkan desis nafas lembut dari tengah tenggorokan (Hams) tanpa getaran dada.'
      }
    ]
  },
  {
    surahNumber: 113,
    ayahNumber: 2,
    surahName: 'Al-Falaq',
    arabicText: 'مِن شَرِّ مَا خَلَقَ',
    transliteration: 'Min syarri maa khalaq',
    translation: 'Dari kejahatan (makhluk) yang Dia ciptakan.',
    words: [
      { text: 'مِن', ruleId: 'ikhfa_haqiqi', highlightColor: '#D97706', ruleTitle: 'Ikhfa Haqiqi' },
      { text: 'شَرِّ' },
      { text: 'مَا' },
      { text: 'خَلَقَ', ruleId: 'qalqalah', highlightColor: '#2563EB', ruleTitle: 'Qalqalah Kubra' }
    ],
    primaryRule: TAJWID_RULES_DB.find((r) => r.id === 'ikhfa_haqiqi')!,
    commonMistakes: [
      {
        type: 'ikhfa_short',
        label: 'Ikhfa Haqiqi Kurang Dengung (Ghunnah Terputus)',
        mistakeText: 'Min syarri (dibaca jelas seperti Izhar tanpa dengung)',
        syekhAudioWordIndex: 0,
        explanation: 'Nun sukun bertemu Syin (ش) dibaca terburu-buru tanpa dengung 2 harakat.',
        correctWay: 'Samarkan suara Nun ke arah huruf Syin dan tahan dengung (ghunnah) sempurna selama 2 ketukan.'
      },
      {
        type: 'qalqalah_missing',
        label: 'Qalqalah Qaf (ق) Tidak Memantul',
        mistakeText: 'Khalaq (mati tertahan tanpa pantulan)',
        syekhAudioWordIndex: 3,
        explanation: 'Huruf Qaf waqaf di akhir ayat tidak dipantulkan secara mantap.',
        correctWay: 'Pantulkan huruf Qaf sukun di akhir ayat dengan suara tebal dan jelas (Qalqalah Kubra).'
      }
    ]
  },
  {
    surahNumber: 110,
    ayahNumber: 1,
    surahName: 'An-Nashr',
    arabicText: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ',
    transliteration: 'Izaa jaaa\'a nashrullaahi wal fath',
    translation: 'Apabila telah datang pertolongan Allah dan kemenangan,',
    words: [
      { text: 'إِذَا' },
      { text: 'جَاءَ', ruleId: 'mad_wajib_muttashil', highlightColor: '#DC2626', ruleTitle: 'Mad Wajib Muttashil' },
      { text: 'نَصْرُ' },
      { text: 'اللَّهِ' },
      { text: 'وَالْفَتْحُ' }
    ],
    primaryRule: TAJWID_RULES_DB.find((r) => r.id === 'mad_wajib_muttashil')!,
    commonMistakes: [
      {
        type: 'mad_short',
        label: 'Mad Wajib Muttashil Dibaca Terlalu Pendek',
        mistakeText: 'Iza ja\'a (hanya dibaca 2 harakat)',
        syekhAudioWordIndex: 1,
        explanation: 'Huruf Mad bertemu Hamzah dalam kata جَاءَ hanya dibaca 2 harakat.',
        correctWay: 'Wajib dipanjangkan sepanjang 4 sampai 5 harakat penuh (2–2.5 Alif). Tidak sah jika dibaca pendek.'
      }
    ]
  },
  {
    surahNumber: 114,
    ayahNumber: 4,
    surahName: 'An-Nas',
    arabicText: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
    transliteration: 'Min syarril waswaasil khannaas',
    translation: 'Dari kejahatan (bisikan) setan yang bersembunyi,',
    words: [
      { text: 'مِن', ruleId: 'ikhfa_haqiqi', highlightColor: '#D97706', ruleTitle: 'Ikhfa Haqiqi' },
      { text: 'شَرِّ' },
      { text: 'الْوَسْوَاسِ' },
      { text: 'الْخَنَّاسِ', ruleId: 'idgham_bighunnah', highlightColor: '#059669', ruleTitle: 'Ghunnah Musyaddadah' }
    ],
    primaryRule: TAJWID_RULES_DB.find((r) => r.id === 'ikhfa_haqiqi')!,
    commonMistakes: [
      {
        type: 'ikhfa_short',
        label: 'Ikhfa Haqiqi Terlewat Dengung',
        mistakeText: 'Min syarri (tidak ditahan)',
        syekhAudioWordIndex: 0,
        explanation: 'Nun sukun bertemu Syin tidak disamarkan.',
        correctWay: 'Tahan dengung selama 2 harakat penuh sebelum membunyikan huruf Syin.'
      }
    ]
  }
];
