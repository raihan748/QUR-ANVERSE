// ==============================================================================
// COMPARATIVE QIRA'AT SAB'AH & 'ASYRAH ENGINE
// Phonetic & Linguistic Matrix Across Mutawatir Quranic Readings
// ==============================================================================

export type QiraatImam = 
  | 'Hafs_an_Ashim'      // Kufah (Standard Indonesia & Dunia Islam)
  | 'Warsh_an_Nafi'      // Madinah -> Maghrib (Maroko, Aljazair)
  | 'Qalun_an_Nafi'      // Madinah -> Libya, Tunisia
  | 'Ad_Duri_an_Abi_Amr' // Bashrah -> Sudan, Somalia
  | 'As_Susi_an_Abi_Amr' // Bashrah
  | 'Hamzah_az_Zayyat'   // Kufah
  | 'Al_Kisai';          // Kufah

export interface QiraatVariantEntry {
  surah: number;
  ayah: number;
  wordLocation: string;
  imam: QiraatImam;
  arabicLafadz: string;
  latinTransliteration: string;
  phoneticRule: string;
  grammaticalNotes: string;
}

export class QiraatComparativeEngine {
  private static readonly VARIANTS_STORE: QiraatVariantEntry[] = [
    {
      surah: 1,
      ayah: 4,
      wordLocation: 'Ayat 4 (Kata 1)',
      imam: 'Hafs_an_Ashim',
      arabicLafadz: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ',
      latinTransliteration: 'Maaliki Yaumid-Diin',
      phoneticRule: 'Mad Thabi\'i (2 Harakat) dengan Alif',
      grammaticalNotes: 'Isim Fa\'il (Pemilik / Yang Menguasai).'
    },
    {
      surah: 1,
      ayah: 4,
      wordLocation: 'Ayat 4 (Kata 1)',
      imam: 'Warsh_an_Nafi',
      arabicLafadz: 'مَلِكِ يَوْمِ ٱلدِّينِ',
      latinTransliteration: 'Maliki Yaumid-Diin',
      phoneticRule: 'Qashr (Tanpa Alif Mad, 1 Harakat)',
      grammaticalNotes: 'Shifah Musyabbahah / Raja Diraja Semesta Alam.'
    },
    {
      surah: 93,
      ayah: 1,
      wordLocation: 'Ayat 1-2',
      imam: 'Hafs_an_Ashim',
      arabicLafadz: 'وَٱلضُّحَىٰ ۝ وَٱلَّيْلِ إِذَا سَجَىٰ ۝',
      latinTransliteration: 'Wadh-dhuhaa, Wal-laili idzaa sajaa',
      phoneticRule: 'Fathah murni (Tanpa Imalah / Taqleel)',
      grammaticalNotes: 'Vokal "aa" terbuka.'
    },
    {
      surah: 93,
      ayah: 1,
      wordLocation: 'Ayat 1-2',
      imam: 'Warsh_an_Nafi',
      arabicLafadz: 'وَٱلضُّحٰ۪ى ۝ وَٱلَّيْلِ إِذَا سَجٰ۪ى ۝',
      latinTransliteration: 'Wadh-dhuhé, Wal-laili idzaa sajé',
      phoneticRule: 'Taqleel / Imalah Sughra (Antara Fathah dan Kasrah)',
      grammaticalNotes: 'Mencondongkan bunyi harakat pada Ra\'sul Ayah.'
    }
  ];

  public static getVariantsForAyat(surah: number, ayah: number): QiraatVariantEntry[] {
    return QiraatComparativeEngine.VARIANTS_STORE.filter(
      (v) => v.surah === surah && v.ayah === ayah
    );
  }

  public static getAllRegisteredImams(): { id: QiraatImam; name: string; region: string }[] {
    return [
      { id: 'Hafs_an_Ashim', name: 'Hafs \'an \'Ashim (حفص عن عاصم)', region: 'Kufah (Standar Internasional)' },
      { id: 'Warsh_an_Nafi', name: 'Warsh \'an Nafi\' (ورش عن نافع)', region: 'Madinah / Afrika Utara' },
      { id: 'Qalun_an_Nafi', name: 'Qalun \'an Nafi\' (قالون عن نافع)', region: 'Madinah / Libya & Tunisia' },
      { id: 'Ad_Duri_an_Abi_Amr', name: 'Ad-Duri \'an Abi \'Amr (الدوري عن أبي عمرو)', region: 'Bashrah / Sudan' },
      { id: 'As_Susi_an_Abi_Amr', name: 'As-Susi \'an Abi \'Amr (السوسي عن أبي عمرو)', region: 'Bashrah' },
      { id: 'Hamzah_az_Zayyat', name: 'Hamzah az-Zayyat (حمزة الزيات)', region: 'Kufah' },
      { id: 'Al_Kisai', name: 'Al-Kisa\'i (الكسائي)', region: 'Kufah' }
    ];
  }
}
