// ==============================================================================
// ONTOLOGICAL ASMAUL HUSNA & SIFAT ILAHIYYAH SYMPHONY ENGINE
// Thematic Mapping, Fawashil Al-Ayat Paired Attributes & Theological Teleology
// ==============================================================================

export interface DivineAttributePair {
  pairKey: string;
  arabicText: string;
  transliteration: string;
  primaryName: string;
  secondaryName: string;
  quranicFrequency: number;
  theologicalContext: string;
  representativeAyat: {
    surahNumber: number;
    ayahNumber: number;
    arabicSnippet: string;
    contextSummary: string;
  }[];
}

export interface AsmaulHusnaRecord {
  number: number;
  arabic: string;
  transliteration: string;
  meaningIndo: string;
  meaningEnglish: string;
  category: 'DZAT' | 'SIFAT' | 'AF\'AL';
  occurrencesInQuran: number;
}

export class AsmaulHusnaOntologyEngine {
  // Frequently occurring paired names in Quranic verse endings (Fawashil)
  private static readonly PAIRED_ATTRIBUTES: DivineAttributePair[] = [
    {
      pairKey: 'aziz_hakim',
      arabicText: 'العَزِيزُ الحَكِيمُ',
      transliteration: 'Al-\'Aziz Al-Hakim',
      primaryName: 'Al-\'Aziz (Yang Maha Perkasa)',
      secondaryName: 'Al-Hakim (Yang Maha Bijaksana)',
      quranicFrequency: 47,
      theologicalContext: 'Dipasangkan pada ayat-ayat penciptaan alam semesta, mukjizat rasul, dan ketetapan syariat. Menegaskan bahwa keperkasaan Allah tidak pernah melahirkan kesewenang-wenangan, melainkan selalu dibimbing oleh kebijaksanaan sempurna.',
      representativeAyat: [
        {
          surahNumber: 2,
          ayahNumber: 228,
          arabicSnippet: 'وَٱللَّهُ عَزِيزٌ حَكِيمٌ',
          contextSummary: 'Penetapan hukum keluarga dan keadilan nafkah/perceraian.'
        },
        {
          surahNumber: 59,
          ayahNumber: 24,
          arabicSnippet: 'وَهُوَ ٱلْعَزِيزُ ٱلْحَكِيمُ',
          contextSummary: 'Puncak pujian Asmaul Husna pada penutup Surah Al-Hasyr.'
        }
      ]
    },
    {
      pairKey: 'ghafur_rahim',
      arabicText: 'الغَفُورُ الرَّحِيمُ',
      transliteration: 'Al-Ghafur Ar-Rahim',
      primaryName: 'Al-Ghafur (Yang Maha Pengampun)',
      secondaryName: 'Ar-Rahim (Yang Maha Penyayang)',
      quranicFrequency: 72,
      theologicalContext: 'Dipasangkan pada ayat-ayat tobat, rukhshah (keringanan) ibadah, dan ampunan dosa. Menegaskan bahwa ampunan Allah lahir dari kasih sayang yang tak bertepi kepada hamba-Nya yang bersujud.',
      representativeAyat: [
        {
          surahNumber: 2,
          ayahNumber: 173,
          arabicSnippet: 'فَمَنِ ٱضْطُرَّ غَيْرَ بَاغٍ وَلَا عَادٍ فَلَآ إِثْمَ عَلَيْهِ ۚ إِنَّ ٱللَّهَ غَفُورٌ رَّحِيمٌ',
          contextSummary: 'Keringanan memakan makanan darurat bagi yang terpaksa tanpa sengaja.'
        },
        {
          surahNumber: 39,
          ayahNumber: 53,
          arabicSnippet: 'إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ',
          contextSummary: 'Larangan berputus asa dari rahmat Allah bagi yang melampaui batas.'
        }
      ]
    },
    {
      pairKey: 'sami_alim',
      arabicText: 'السَّمِيعُ العَلِيمُ',
      transliteration: 'As-Sami\' Al-\'Alim',
      primaryName: 'As-Sami\' (Yang Maha Mendengar)',
      secondaryName: 'Al-\'Alim (Yang Maha Mengetahui)',
      quranicFrequency: 32,
      theologicalContext: 'Dipasangkan pada ayat-ayat doa permohonan hamba, perlindungan dari bisikan setan, dan rahasia isi hati yang tersembunyi.',
      representativeAyat: [
        {
          surahNumber: 2,
          ayahNumber: 127,
          arabicSnippet: 'رَبَّنَا تَقَبَّلْ مِنَّآ ۖ إِنَّكَ أَنتَ ٱلسَّمِيعُ ٱلْعَلِيمُ',
          contextSummary: 'Doa Nabi Ibrahim dan Nabi Ismail saat meninggikan pondasi Baitullah.'
        },
        {
          surahNumber: 41,
          ayahNumber: 36,
          arabicSnippet: 'فَٱسْتَعِذْ بِٱللَّهِ ۖ إِنَّهُۥ هُوَ ٱلسَّمِيعُ ٱلْعَلِيمُ',
          contextSummary: 'Perintah memohon perlindungan kepada Allah dari godaan setan.'
        }
      ]
    },
    {
      pairKey: 'ghaniyy_hamid',
      arabicText: 'الغَنِيُّ الحَمِيدُ',
      transliteration: 'Al-Ghaniyy Al-Hamid',
      primaryName: 'Al-Ghaniyy (Yang Maha Kaya & Mandiri)',
      secondaryName: 'Al-Hamid (Yang Maha Terpuji)',
      quranicFrequency: 10,
      theologicalContext: 'Dipasangkan pada ayat perintah infaq dan ketaatan. Menegaskan Allah tidak butuh amal manusia, namun Dzat-Nya tetap Maha Terpuji dalam segala anugerah-Nya.',
      representativeAyat: [
        {
          surahNumber: 2,
          ayahNumber: 267,
          arabicSnippet: 'وَٱعْلَمُوٓا۟ أَنَّ ٱللَّهَ غَنِىٌّ حَمِيدٌ',
          contextSummary: 'Perintah menginfakkan harta yang baik, bukan barang yang buruk.'
        }
      ]
    }
  ];

  public static getPairedAttributes(): DivineAttributePair[] {
    return [...this.PAIRED_ATTRIBUTES];
  }

  public static getPairByKey(key: string): DivineAttributePair | undefined {
    return this.PAIRED_ATTRIBUTES.find((p) => p.pairKey === key);
  }

  public static analyzeThematicCorrelation(topic: string): DivineAttributePair[] {
    const lower = topic.toLowerCase();
    if (lower.includes('hukum') || lower.includes('kuasa') || lower.includes('cipta')) {
      return this.PAIRED_ATTRIBUTES.filter(p => p.pairKey === 'aziz_hakim');
    }
    if (lower.includes('ampun') || lower.includes('taubat') || lower.includes('dosa') || lower.includes('rahmat')) {
      return this.PAIRED_ATTRIBUTES.filter(p => p.pairKey === 'ghafur_rahim');
    }
    if (lower.includes('doa') || lower.includes('bisik') || lower.includes('dengar') || lower.includes('hati')) {
      return this.PAIRED_ATTRIBUTES.filter(p => p.pairKey === 'sami_alim');
    }
    if (lower.includes('infaq') || lower.includes('sedekah') || lower.includes('kaya')) {
      return this.PAIRED_ATTRIBUTES.filter(p => p.pairKey === 'ghaniyy_hamid');
    }
    return this.PAIRED_ATTRIBUTES;
  }
}
