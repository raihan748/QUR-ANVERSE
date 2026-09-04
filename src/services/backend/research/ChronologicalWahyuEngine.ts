// ==============================================================================
// CHRONOLOGICAL WAHYU STRATIGRAPHY & ASBABUN NUZUL TIMELINE ENGINE
// Historical Timeline, Makkiyyah/Madaniyyah Eras & Contextual Revelation Index
// ==============================================================================

export type RevelationEra = 
  | 'EARLY_MAKKAH'   // Tahun 1-3 Bi'tsah (Fase Sirriyah / Rahasia)
  | 'MID_MAKKAH'     // Tahun 4-10 Bi'tsah (Dakwah Terbuka & Boikot Quraisy)
  | 'LATE_MAKKAH'    // Tahun 10-13 Bi'tsah (Isra' Mi'raj & Pra-Hijrah)
  | 'EARLY_MADINAH'  // Tahun 1-3 H (Piagam Madinah & Perang Badar)
  | 'MID_MADINAH'    // Tahun 4-8 H (Uhud, Khandaq, Hudaibiyyah)
  | 'LATE_MADINAH';  // Tahun 8-10 H (Fathu Makkah & Haji Wada')

export interface ChronologicalSurahRecord {
  chronologicalOrder: number; // 1 to 114
  surahNumber: number;        // Mushaf standard number (1 to 114)
  surahName: string;
  latinName: string;
  totalAyahs: number;
  revelationPlace: 'Makkiyyah' | 'Madaniyyah';
  era: RevelationEra;
  historicalContext: string;
  coreThemes: string[];
}

export interface AsbabunNuzulRecord {
  surahNumber: number;
  ayahStart: number;
  ayahEnd: number;
  title: string;
  sababSummary: string;
  sanadNarrator: string;
  historicalEra: RevelationEra;
}

export class ChronologicalWahyuEngine {
  // Chronological order according to authoritative classical tradition (Imam Jalaluddin As-Suyuthi, Al-Itqan)
  private static readonly CHRONOLOGICAL_ORDER: number[] = [
    96, 68, 73, 74, 1, 111, 81, 87, 92, 89, 
    93, 94, 103, 100, 108, 102, 107, 109, 105, 113, 
    114, 112, 53, 80, 97, 91, 85, 95, 106, 101, 
    75, 104, 77, 50, 90, 86, 54, 38, 7, 72, 
    36, 25, 35, 19, 20, 56, 26, 27, 28, 17, 
    10, 11, 12, 15, 6, 37, 31, 34, 39, 40, 
    41, 42, 43, 44, 45, 46, 51, 88, 18, 16, 
    71, 14, 21, 23, 32, 52, 67, 69, 70, 78, 
    79, 82, 84, 30, 29, 83, 2, 98, 64, 62, 
    8, 47, 3, 61, 57, 4, 65, 59, 33, 63, 
    24, 58, 22, 48, 66, 60, 110, 49, 9, 5,
    99, 13, 55, 76
  ];

  private static readonly ASBAB_STORE: AsbabunNuzulRecord[] = [
    {
      surahNumber: 96,
      ayahStart: 1,
      ayahEnd: 5,
      title: 'Awal Permulaan Turunnya Al-Qur\'an di Gua Hira',
      sababSummary: 'Malaikat Jibril mendatangi Rasulullah ﷺ di Gua Hira dan memerintahkan "Iqra\'" (Bacalah) tiga kali hingga turun 5 ayat pertama.',
      sanadNarrator: 'Shahih al-Bukhari no. 3 (dari Ummul Mu\'minin Aisyah r.a.)',
      historicalEra: 'EARLY_MAKKAH'
    },
    {
      surahNumber: 93,
      ayahStart: 1,
      ayahEnd: 3,
      title: 'Terputusnya Wahyu Sementara (Fatratul Wahyi)',
      sababSummary: 'Wahyu sempat terhenti beberapa hari sehingga kaum musyrikin mengejek "Tuhannya telah meninggalkannya". Turunlah Surah Adh-Dhuha menegaskan Allah tidak pernah meninggalkannya.',
      sanadNarrator: 'Shahih Muslim no. 1797 (dari Jundub bin Abdillah r.a.)',
      historicalEra: 'EARLY_MAKKAH'
    },
    {
      surahNumber: 111,
      ayahStart: 1,
      ayahEnd: 5,
      title: 'Dakwah Terbuka di Bukit Shafa & Hinaan Abu Lahab',
      sababSummary: 'Ketika Rasulullah ﷺ mengumpulkan kaum Quraisy di Bukit Shafa untuk menyeru Tauhid, Abu Lahab berteriak "Tabban laka sairal yaum!" (Celakalah engkau sepanjang hari!). Turunlah surah ini.',
      sanadNarrator: 'Shahih al-Bukhari no. 4770 (dari Ibnu Abbas r.a.)',
      historicalEra: 'MID_MAKKAH'
    },
    {
      surahNumber: 2,
      ayahStart: 144,
      ayahEnd: 144,
      title: 'Pengalihan Arah Kiblat dari Baitul Maqdis ke Ka\'bah',
      sababSummary: 'Rasulullah ﷺ sering menengadahkan wajah ke langit merindukan Ka\'bah menjadi kiblat. Ketika sedang shalat di Masjid Qiblatain, turunlah perintah menghadap Masjidil Haram.',
      sanadNarrator: 'Shahih al-Bukhari no. 40 (dari Al-Bara\' bin \'Azib r.a.)',
      historicalEra: 'EARLY_MADINAH'
    },
    {
      surahNumber: 110,
      ayahStart: 1,
      ayahEnd: 3,
      title: 'Isyarat Dekatnya Wafat Rasulullah ﷺ setelah Fathu Makkah',
      sababSummary: 'Turun setelah kemenangan pembebasan kota Makkah (Fathu Makkah). Ibnu Abbas menafsirkan surah ini sebagai isyarat telah tuntasnya tugas risalah dan dekatnya ajal Rasulullah ﷺ.',
      sanadNarrator: 'Shahih al-Bukhari no. 4970 (dari Ibnu Abbas r.a.)',
      historicalEra: 'LATE_MADINAH'
    }
  ];

  public static getChronologicalOrderOfSurah(surahNumber: number): number {
    const idx = this.CHRONOLOGICAL_ORDER.indexOf(surahNumber);
    return idx >= 0 ? idx + 1 : surahNumber;
  }

  public static getChronologicalSequence(): { order: number; surahNumber: number }[] {
    return this.CHRONOLOGICAL_ORDER.map((sNum, idx) => ({
      order: idx + 1,
      surahNumber: sNum
    }));
  }

  public static getEraForChronologicalOrder(order: number): RevelationEra {
    if (order <= 25) return 'EARLY_MAKKAH';
    if (order <= 55) return 'MID_MAKKAH';
    if (order <= 86) return 'LATE_MAKKAH';
    if (order <= 95) return 'EARLY_MADINAH';
    if (order <= 105) return 'MID_MADINAH';
    return 'LATE_MADINAH';
  }

  public static getAsbabunNuzul(surahNumber: number, ayahNumber?: number): AsbabunNuzulRecord[] {
    return this.ASBAB_STORE.filter((item) => {
      if (item.surahNumber !== surahNumber) return false;
      if (ayahNumber !== undefined) {
        return ayahNumber >= item.ayahStart && ayahNumber <= item.ayahEnd;
      }
      return true;
    });
  }

  public static getAllAsbabRecords(): AsbabunNuzulRecord[] {
    return [...this.ASBAB_STORE];
  }
}
