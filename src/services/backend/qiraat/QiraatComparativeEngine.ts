// ==============================================================================
// COMPARATIVE QIRA'AT 'ASYRAH (10 MUTAWATIR READINGS) ENGINE
// Phonetic, Orthographic & Semantic Variance Matrix Across 10 Imams & 20 Rawis
// ==============================================================================

export type QiraatImamId = 
  | 'Nafi_al_Madani'        // Imam ke-1 (Madinah)
  | 'Ibn_Kathir_al_Makki'    // Imam ke-2 (Makkah)
  | 'Abu_Amr_al_Bashri'      // Imam ke-3 (Bashrah)
  | 'Ibn_Amir_asy_Syami'     // Imam ke-4 (Syam)
  | 'Ashim_al_Kufi'          // Imam ke-5 (Kufah - Hafs & Syu'bah)
  | 'Hamzah_al_Kufi'         // Imam ke-6 (Kufah)
  | 'Al_Kisai_al_Kufi'       // Imam ke-7 (Kufah)
  | 'Abu_Jafar_al_Madani'    // Imam ke-8 (Madinah)
  | 'Yaqub_al_Hadhrami'      // Imam ke-9 (Bashrah)
  | 'Khalaf_al_Ashir';       // Imam ke-10 (Kufah)

export interface RawiInfo {
  id: string;
  name: string;
  arabicName: string;
  deathYearH: number;
}

export interface ImamQiraatInfo {
  id: QiraatImamId;
  name: string;
  arabicName: string;
  region: string;
  deathYearH: number;
  rawis: [RawiInfo, RawiInfo];
}

export interface QiraatVariantEntry {
  surah: number;
  ayah: number;
  wordLocation: string;
  imamId: QiraatImamId;
  rawiId?: string;
  imamDisplayName: string;
  arabicLafadz: string;
  latinTransliteration: string;
  phoneticRule: string;
  grammaticalNotes: string;
  tafsirNuance: string;
}

export class QiraatComparativeEngine {
  private static readonly TEN_IMAMS: ImamQiraatInfo[] = [
    {
      id: 'Nafi_al_Madani',
      name: 'Nafi\' al-Madani',
      arabicName: 'نافع بن عبد الرحمن المدني',
      region: 'Madinah Al-Munawwarah',
      deathYearH: 169,
      rawis: [
        { id: 'Qalun', name: 'Qalun (قالون)', arabicName: 'عيسى بن مينا', deathYearH: 220 },
        { id: 'Warsh', name: 'Warsh (ورش)', arabicName: 'عثمان بن سعيد المصري', deathYearH: 197 }
      ]
    },
    {
      id: 'Ibn_Kathir_al_Makki',
      name: 'Ibnu Katsir al-Makki',
      arabicName: 'عبد الله بن كثير المكي',
      region: 'Makkah Al-Mukarramah',
      deathYearH: 120,
      rawis: [
        { id: 'Al_Bazzi', name: 'Al-Bazzi (البزي)', arabicName: 'أحمد بن محمد البزي', deathYearH: 250 },
        { id: 'Qunbul', name: 'Qunbul (قنبل)', arabicName: 'محمد بن عبد الرحمن المخزومي', deathYearH: 291 }
      ]
    },
    {
      id: 'Abu_Amr_al_Bashri',
      name: 'Abu \'Amr al-Bashri',
      arabicName: 'زبان بن العلاء البصري',
      region: 'Bashrah',
      deathYearH: 154,
      rawis: [
        { id: 'Ad_Duri', name: 'Ad-Duri \'an Abi \'Amr (الدوري)', arabicName: 'حفص بن عمر الدوري', deathYearH: 246 },
        { id: 'As_Susi', name: 'As-Susi (السوسي)', arabicName: 'صالح بن زياد السوسي', deathYearH: 261 }
      ]
    },
    {
      id: 'Ibn_Amir_asy_Syami',
      name: 'Ibnu \'Amir asy-Syami',
      arabicName: 'عبد الله بن عامر اليحصبي',
      region: 'Damaskus (Syam)',
      deathYearH: 118,
      rawis: [
        { id: 'Hisham', name: 'Hisyam (هشام)', arabicName: 'هشام بن عمار الدمشقي', deathYearH: 245 },
        { id: 'Ibn_Dhakwan', name: 'Ibnu Dzakwan (ابن ذكوان)', arabicName: 'عبد الله بن أحمد بن ذكوان', deathYearH: 242 }
      ]
    },
    {
      id: 'Ashim_al_Kufi',
      name: '\'Ashim al-Kufi',
      arabicName: 'عاصم بن بهدلة الكوفي',
      region: 'Kufah (Standar Mushaf Dunia Islam)',
      deathYearH: 127,
      rawis: [
        { id: 'Shubah', name: 'Syu\'bah (شعبة)', arabicName: 'شعبة بن عياش الكوفي', deathYearH: 193 },
        { id: 'Hafs', name: 'Hafs (حفص)', arabicName: 'حفص بن سليمان الكوفي', deathYearH: 180 }
      ]
    },
    {
      id: 'Hamzah_al_Kufi',
      name: 'Hamzah al-Kufi',
      arabicName: 'حمزة بن حبيب الزيات',
      region: 'Kufah',
      deathYearH: 156,
      rawis: [
        { id: 'Khalaf', name: 'Khalaf \'an Hamzah (خلف)', arabicName: 'خلف بن هشام البزار', deathYearH: 229 },
        { id: 'Khallad', name: 'Khallad (خلاد)', arabicName: 'خلاد بن خالد الكوفي', deathYearH: 220 }
      ]
    },
    {
      id: 'Al_Kisai_al_Kufi',
      name: 'Al-Kisa\'i al-Kufi',
      arabicName: 'علي بن حمزة الكسائي',
      region: 'Kufah',
      deathYearH: 189,
      rawis: [
        { id: 'Abu_al_Harith', name: 'Abul Harits (أبو الحارث)', arabicName: 'الليث بن خالد البغدادي', deathYearH: 240 },
        { id: 'Ad_Duri_Kisai', name: 'Ad-Duri \'an Al-Kisa\'i (الدوري)', arabicName: 'حفص بن عمر الدوري', deathYearH: 246 }
      ]
    },
    {
      id: 'Abu_Jafar_al_Madani',
      name: 'Abu Ja\'far al-Madani',
      arabicName: 'يزيد بن القعقاع المخزومي',
      region: 'Madinah Al-Munawwarah',
      deathYearH: 130,
      rawis: [
        { id: 'Ibn_Wardan', name: 'Ibnu Wardan (ابن وردان)', arabicName: 'عيسى بن وردan المدني', deathYearH: 160 },
        { id: 'Ibn_Jammas', name: 'Ibnu Jammas (ابن جماز)', arabicName: 'سليمان بن مسلم بن جماز', deathYearH: 170 }
      ]
    },
    {
      id: 'Yaqub_al_Hadhrami',
      name: 'Ya\'qub al-Hadhrami',
      arabicName: 'يعقوب بن إسحاق الحضرمي',
      region: 'Bashrah',
      deathYearH: 205,
      rawis: [
        { id: 'Ruways', name: 'Ruways (رويس)', arabicName: 'محمد بن المتوكل البصري', deathYearH: 238 },
        { id: 'Rawh', name: 'Rawh (روح)', arabicName: 'روح بن عبد المؤمن البصري', deathYearH: 234 }
      ]
    },
    {
      id: 'Khalaf_al_Ashir',
      name: 'Khalaf al-\'Asyir',
      arabicName: 'خلف بن هشام البغدادي (العاشر)',
      region: 'Kufah / Baghdad',
      deathYearH: 229,
      rawis: [
        { id: 'Ishaq', name: 'Ishaq (إسحاق)', arabicName: 'إسحاق بن إبراهيم الوراق', deathYearH: 286 },
        { id: 'Idris', name: 'Idris (إدريس)', arabicName: 'إدريس بن عبد الكريم الحداد', deathYearH: 292 }
      ]
    }
  ];

  private static readonly VARIANTS_STORE: QiraatVariantEntry[] = [
    // Al-Fatihah: 4 - Maaliki vs Maliki
    {
      surah: 1,
      ayah: 4,
      wordLocation: 'Ayat 4 (Kata 1)',
      imamId: 'Ashim_al_Kufi',
      rawiId: 'Hafs',
      imamDisplayName: '\'Ashim (Riwayat Hafs)',
      arabicLafadz: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ',
      latinTransliteration: 'Maaliki Yaumid-Diin',
      phoneticRule: 'Mad Thabi\'i (2 Harakat) dengan itsbat Alif',
      grammaticalNotes: 'Isim Fa\'il berakar kata M-L-K (Yang Memiliki / Berkuasa Penuh).',
      tafsirNuance: 'Menegaskan kepemilikan mutlak Allah atas segala hal pada hari pembalasan.'
    },
    {
      surah: 1,
      ayah: 4,
      wordLocation: 'Ayat 4 (Kata 1)',
      imamId: 'Nafi_al_Madani',
      rawiId: 'Warsh',
      imamDisplayName: 'Nafi\' al-Madani (Warsh & Qalun)',
      arabicLafadz: 'مَلِكِ يَوْمِ ٱلدِّينِ',
      latinTransliteration: 'Maliki Yaumid-Diin',
      phoneticRule: 'Hazf Alif (Qashr 1 Harakat)',
      grammaticalNotes: 'Shifah Musyabbahah (Raja Diraja yang Memerintah).',
      tafsirNuance: 'Menegaskan kedaulatan mutlak kerajaan Allah tanpa ada tandingan raja duniawi.'
    },
    // Al-Baqarah: 9 - Yakhda'una vs Yukhadi'una
    {
      surah: 2,
      ayah: 9,
      wordLocation: 'Ayat 9 (Kata 6)',
      imamId: 'Ashim_al_Kufi',
      rawiId: 'Hafs',
      imamDisplayName: '\'Ashim (Riwayat Hafs)',
      arabicLafadz: 'وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ',
      latinTransliteration: 'wa maa yakhda\'uuna illaa anfusahum',
      phoneticRule: 'Fi\'il Tsulatsi Mujarrad (Fathah Ya dan Sukun Kha)',
      grammaticalNotes: 'Wazan Fa\'ala (Perbuatan menipu mengenai diri sendiri).',
      tafsirNuance: 'Menegaskan dampak penipuan kaum munafik secara riil hanya menimpa diri mereka sendiri.'
    },
    {
      surah: 2,
      ayah: 9,
      wordLocation: 'Ayat 9 (Kata 6)',
      imamId: 'Nafi_al_Madani',
      rawiId: 'Warsh',
      imamDisplayName: 'Nafi\' & Ibnu Katsir & Abu \'Amr',
      arabicLafadz: 'وَمَا يُخَـٰدِعُونَ إِلَّآ أَنفُسَهُمْ',
      latinTransliteration: 'wa maa yukhaadi\'uuna illaa anfusahum',
      phoneticRule: 'Fi\'il Tsulatsi Mazid (Dhommah Ya dan Mad Alif)',
      grammaticalNotes: 'Wazan Faa\'ala (Upaya intensif saling menipu).',
      tafsirNuance: 'Menegaskan mereka berulang-ulang berupaya menipu, padahal sejatinya memperdaya diri sendiri.'
    },
    // Adh-Dhuha: 1 - Imalah / Taqleel vs Fathah
    {
      surah: 93,
      ayah: 1,
      wordLocation: 'Ayat 1-2',
      imamId: 'Ashim_al_Kufi',
      rawiId: 'Hafs',
      imamDisplayName: '\'Ashim (Riwayat Hafs)',
      arabicLafadz: 'وَٱلضُّحَىٰ ۝ وَٱلَّيْلِ إِذَا سَجَىٰ ۝',
      latinTransliteration: 'Wadh-dhuhaa, Wal-laili idzaa sajaa',
      phoneticRule: 'Fathah murni (Fath)',
      grammaticalNotes: 'Vokal "aa" terbuka lebar pada ra\'sul ayah.',
      tafsirNuance: 'Standar pelafalan dialek Quraisy Kufah.'
    },
    {
      surah: 93,
      ayah: 1,
      wordLocation: 'Ayat 1-2',
      imamId: 'Nafi_al_Madani',
      rawiId: 'Warsh',
      imamDisplayName: 'Warsh \'an Nafi\'',
      arabicLafadz: 'وَٱلضُّحٰ۪ى ۝ وَٱلَّيْلِ إِذَا سَجٰ۪ى ۝',
      latinTransliteration: 'Wadh-dhuhé, Wal-laili idzaa sajé',
      phoneticRule: 'Taqleel (Imalah Sughra)',
      grammaticalNotes: 'Mencondongkan bunyi harakat antara fathah dan kasrah.',
      tafsirNuance: 'Kelembutan intonasi ritmis mushaf Maghribi.'
    },
    {
      surah: 93,
      ayah: 1,
      wordLocation: 'Ayat 1-2',
      imamId: 'Hamzah_al_Kufi',
      rawiId: 'Khalaf',
      imamDisplayName: 'Hamzah & Al-Kisa\'i & Khalaf al-\'Asyir',
      arabicLafadz: 'وَٱلضُّحِى ۝ وَٱلَّيْلِ إِذَا سَجِى ۝',
      latinTransliteration: 'Wadh-dhuhii, Wal-laili idzaa sajii',
      phoneticRule: 'Imalah Kubra (Al-Idhja\')',
      grammaticalNotes: 'Membaca condong mendekati kasrah murni karena asal ya\'.',
      tafsirNuance: 'Tradisi fonetik Najd dan Kufah mutawatirah.'
    }
  ];

  public static getAllTenImams(): ImamQiraatInfo[] {
    return [...this.TEN_IMAMS];
  }

  public static getVariantsForAyat(surah: number, ayah: number): QiraatVariantEntry[] {
    return this.VARIANTS_STORE.filter((v) => v.surah === surah && v.ayah === ayah);
  }

  public static getAllVariants(): QiraatVariantEntry[] {
    return [...this.VARIANTS_STORE];
  }
}
