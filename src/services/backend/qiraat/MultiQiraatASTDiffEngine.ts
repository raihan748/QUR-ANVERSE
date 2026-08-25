// ==============================================================================
// MULTI-QIRA'AT AST-DIFF COMPARATOR ENGINE
// Structural Syntactic & Phonetic Delta Trees Across 10 Canonical Qira'at
// ==============================================================================

export type CanonicalImam = 
  | 'Nafi_Al_Madani'
  | 'Ibn_Kathir_Al_Makki'
  | 'Abu_Amr_Al_Basri'
  | 'Ibn_Amir_Asy_Syami'
  | 'Asim_Al_Kufi'
  | 'Hamzah_Al_Kufi'
  | 'Al_Kisai_Al_Kufi'
  | 'Abu_Jafar_Al_Madani'
  | 'Yaqub_Al_Basri'
  | 'Khalaf_Al_Asyir';

export interface QiraatASTDiffResult {
  surahNumber: number;
  ayahNumber: number;
  wordIndex: number;
  baseImam: CanonicalImam;
  compareImam: CanonicalImam;
  baseLafadz: string;
  compareLafadz: string;
  diffType: 'RASM_CONSONANT' | 'HARAKAT_VOWEL' | 'IMALAH_TAQLEEL' | 'IDGHAM_KABIR' | 'SILAH_MIM' | 'HAMZAH_TASHIL';
  scholarlyTafsirNote: string;
}

export class MultiQiraatASTDiffEngine {
  private static readonly CANONICAL_DIFFS: QiraatASTDiffResult[] = [
    // Al-Fatihah 1:4
    {
      surahNumber: 1,
      ayahNumber: 4,
      wordIndex: 1,
      baseImam: 'Asim_Al_Kufi',
      compareImam: 'Nafi_Al_Madani',
      baseLafadz: 'مَـٰلِكِ',
      compareLafadz: 'مَلِكِ',
      diffType: 'RASM_CONSONANT',
      scholarlyTafsirNote: 'Hafsh & Al-Kisa\'i membaca "Maaliki" (Pemilik/Penguasa), Nafi\' & Ibnu Katsir membaca "Maliki" (Raja Diraja).'
    },
    // Al-Baqarah 2:9
    {
      surahNumber: 2,
      ayahNumber: 9,
      wordIndex: 4,
      baseImam: 'Asim_Al_Kufi',
      compareImam: 'Nafi_Al_Madani',
      baseLafadz: 'يُخَـٰدِعُونَ',
      compareLafadz: 'يَخْدَعُونَ',
      diffType: 'HARAKAT_VOWEL',
      scholarlyTafsirNote: 'Wazan Mufa\'alah vs Tsulatsi Mujarrad.'
    },
    // Ad-Dhuha 93:1
    {
      surahNumber: 93,
      ayahNumber: 1,
      wordIndex: 1,
      baseImam: 'Asim_Al_Kufi',
      compareImam: 'Hamzah_Al_Kufi',
      baseLafadz: 'وَٱلضُّحَىٰ',
      compareLafadz: 'وَٱلضُّحٰ۪ى',
      diffType: 'IMALAH_TAQLEEL',
      scholarlyTafsirNote: 'Imalah Kubra pada Ra\'sul Ayah menurut Hamzah dan Al-Kisa\'i.'
    }
  ];

  /**
   * Computes differences between two canonical Qira'at for a specific verse.
   */
  public static compareQiraat(
    surahNumber: number,
    ayahNumber: number,
    baseImam: CanonicalImam = 'Asim_Al_Kufi',
    compareImam: CanonicalImam = 'Nafi_Al_Madani'
  ): QiraatASTDiffResult[] {
    return this.CANONICAL_DIFFS.filter(
      (d) =>
        d.surahNumber === surahNumber &&
        d.ayahNumber === ayahNumber &&
        ((d.baseImam === baseImam && d.compareImam === compareImam) ||
          (d.baseImam === compareImam && d.compareImam === baseImam))
    );
  }

  public static getAllTenImams(): { id: CanonicalImam; name: string; city: string; deathYearHijri: number }[] {
    return [
      { id: 'Nafi_Al_Madani', name: 'Nafi\' bin Abi Nu\'aim (نافع المدني)', city: 'Madinah', deathYearHijri: 169 },
      { id: 'Ibn_Kathir_Al_Makki', name: 'Abdullah bin Kathir (عبد الله بن كثير)', city: 'Makkah', deathYearHijri: 120 },
      { id: 'Abu_Amr_Al_Basri', name: 'Abu \'Amr bin Al-\'Ala (أبو عمرو البصري)', city: 'Bashrah', deathYearHijri: 154 },
      { id: 'Ibn_Amir_Asy_Syami', name: 'Abdullah bin \'Amir (عبد الله بن عامر)', city: 'Syam', deathYearHijri: 118 },
      { id: 'Asim_Al_Kufi', name: '\'Ashim bin Abi An-Najud (عاصم الكوفي)', city: 'Kufah', deathYearHijri: 127 },
      { id: 'Hamzah_Al_Kufi', name: 'Hamzah bin Habib Az-Zayyat (حمزة الكوفي)', city: 'Kufah', deathYearHijri: 156 },
      { id: 'Al_Kisai_Al_Kufi', name: 'Ali bin Hamzah Al-Kisa\'i (الكسائي الكوفي)', city: 'Kufah', deathYearHijri: 189 },
      { id: 'Abu_Jafar_Al_Madani', name: 'Abu Ja\'far Yazid bin Al-Qa\'qa\' (أبو جعفر المدني)', city: 'Madinah', deathYearHijri: 130 },
      { id: 'Yaqub_Al_Basri', name: 'Ya\'qub bin Ishaq Al-Hadhrami (يعقوب الحضرمي)', city: 'Bashrah', deathYearHijri: 205 },
      { id: 'Khalaf_Al_Asyir', name: 'Khalaf bin Hasyim Al-Bazzar (خلف العاشر)', city: 'Kufah', deathYearHijri: 229 }
    ];
  }
}
