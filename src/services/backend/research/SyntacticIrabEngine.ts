// ==============================================================================
// SYNTACTIC I'RAB & NAHWU-SHARAF DEPENDENCY TREEBANK ENGINE
// Word-Level Grammatical Parser, Case Status & Syntactic Relations
// ==============================================================================

export type IrabCase = 'MARFU' | 'MANSHUB' | 'MAJRUR' | 'MAJZUM' | 'MABNI';

export type GrammarRole = 
  | 'MUBTADA'        // Subjek kalimat isim (المبتدأ)
  | 'KHABAR'          // Predikat kalimat isim (الخبر)
  | 'FAIL'            // Pelaku perbuatan (الفاعل)
  | 'MAFUL_BIH'       // Objek langsung penderita (المفعول به)
  | 'MUDHAF'          // Kata yang disandarkan (المضاف)
  | 'MUDHAF_ILAIH'    // Kata penyandar majrur (المضاف إليه)
  | 'HARF_JARR'       // Huruf preposisi penjarr (حرف جر)
  | 'SHIFAT_NAAT'     // Kata sifat penerang (الصفة / النعت)
  | 'HAL'             // Keterangan kondisi (الحال)
  | 'TAMYIZ'          // Keterangan penjelas (التمييز)
  | 'FIIL_MADHI'      // Kata kerja lampau (فعل ماض)
  | 'FIIL_MUDHARI'    // Kata kerja sekarang/akan datang (فعل مضارع)
  | 'FIIL_AMR'        // Kata kerja perintah (فعل أمر)
  | 'HARF_ATHAF'      // Kata hubung konjungsi (حرف عطف)
  | 'ISIM_INNA'       // Isim inna manshub (اسم إنّ)
  | 'KHABAR_INNA'     // Khabar inna marfu' (خبر إنّ)
  | 'HARF_NIDA'       // Huruf panggilan yaa (حرف نداء)
  | 'MUNADA'          // Yang dipanggil (المنادى)
  | 'UNKNOWN';        // Belum terklasifikasi otomatis

export interface WordIrabAnalysis {
  wordIndex: number;
  arabicWord: string;
  partOfSpeech: 'ISIM' | 'FIIL' | 'HARF';
  irabCase: IrabCase;
  grammarRole: GrammarRole;
  caseMarker: string; // e.g., 'Dhammah Zhahirah', 'Kasrah Zhahirah', 'Mabni atas Sukun'
  grammaticalExplanation: string; // Bahasa Indonesia
  derivedRoot?: string;
  parentHeadIndex?: number; // Syntactic dependency tree link
}

export interface AyahTreebank {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  words: WordIrabAnalysis[];
}

export class SyntacticIrabEngine {
  // Authoritative verified treebank for essential research ayat (Al-Fatihah, Al-Ikhlas, etc.)
  private static readonly VERIFIED_TREEBANK: Record<string, WordIrabAnalysis[]> = {
    // QS. Al-Fatihah: 1
    '1:1': [
      {
        wordIndex: 0,
        arabicWord: 'بِسْمِ',
        partOfSpeech: 'ISIM',
        irabCase: 'MAJRUR',
        grammarRole: 'HARF_JARR',
        caseMarker: 'Kasrah Zhahirah',
        grammaticalExplanation: 'Jar-Majrur (Ba Harf Jarr + Ism majrur, sekaligus Mudhaf).',
        derivedRoot: 'س-م-و',
        parentHeadIndex: 1
      },
      {
        wordIndex: 1,
        arabicWord: 'ٱللَّهِ',
        partOfSpeech: 'ISIM',
        irabCase: 'MAJRUR',
        grammarRole: 'MUDHAF_ILAIH',
        caseMarker: 'Kasrah Zhahirah',
        grammaticalExplanation: 'Lafzhul Jalalah majrur karena berkedudukan sebagai Mudhaf Ilaih.',
        derivedRoot: 'أ-ل-ه',
        parentHeadIndex: 0
      },
      {
        wordIndex: 2,
        arabicWord: 'ٱلرَّحْمَـٰنِ',
        partOfSpeech: 'ISIM',
        irabCase: 'MAJRUR',
        grammarRole: 'SHIFAT_NAAT',
        caseMarker: 'Kasrah Zhahirah',
        grammaticalExplanation: 'Na\'at pertama bagi Lafzhul Jalalah, mengikuti status majrur.',
        derivedRoot: 'ر-ح-م',
        parentHeadIndex: 1
      },
      {
        wordIndex: 3,
        arabicWord: 'ٱلرَّحِيمِ',
        partOfSpeech: 'ISIM',
        irabCase: 'MAJRUR',
        grammarRole: 'SHIFAT_NAAT',
        caseMarker: 'Kasrah Zhahirah',
        grammaticalExplanation: 'Na\'at kedua bagi Lafzhul Jalalah, mengikuti status majrur.',
        derivedRoot: 'ر-ح-م',
        parentHeadIndex: 1
      }
    ],
    // QS. Al-Fatihah: 2
    '1:2': [
      {
        wordIndex: 0,
        arabicWord: 'ٱلْحَمْدُ',
        partOfSpeech: 'ISIM',
        irabCase: 'MARFU',
        grammarRole: 'MUBTADA',
        caseMarker: 'Dhammah Zhahirah',
        grammaticalExplanation: 'Mubtada\' marfu\' sebagai permulaan jumlah ismiyyah.',
        derivedRoot: 'ح-م-د',
        parentHeadIndex: 1
      },
      {
        wordIndex: 1,
        arabicWord: 'لِلَّهِ',
        partOfSpeech: 'ISIM',
        irabCase: 'MAJRUR',
        grammarRole: 'KHABAR',
        caseMarker: 'Kasrah Zhahirah',
        grammaticalExplanation: 'Sibh-ul Jumlah (Jar-Majrur) menempati posisi rafa\' sebagai Khabar.',
        derivedRoot: 'أ-ل-ه',
        parentHeadIndex: 0
      },
      {
        wordIndex: 2,
        arabicWord: 'رَبِّ',
        partOfSpeech: 'ISIM',
        irabCase: 'MAJRUR',
        grammarRole: 'SHIFAT_NAAT',
        caseMarker: 'Kasrah Zhahirah',
        grammaticalExplanation: 'Na\'at / Badhal majrur bagi Lafzhul Jalalah, sekaligus Mudhaf.',
        derivedRoot: 'ر-ب-ب',
        parentHeadIndex: 1
      },
      {
        wordIndex: 3,
        arabicWord: 'ٱلْعَـٰلَمِينَ',
        partOfSpeech: 'ISIM',
        irabCase: 'MAJRUR',
        grammarRole: 'MUDHAF_ILAIH',
        caseMarker: 'Huruf Ya (Mulhaq Jama\' Mudzakkar Salim)',
        grammaticalExplanation: 'Mudhaf Ilaih majrur dengan tanda Ya karena mulhaq jama\' mudzakkar.',
        derivedRoot: 'ع-ل-م',
        parentHeadIndex: 2
      }
    ],
    // QS. Al-Ikhlas: 1
    '112:1': [
      {
        wordIndex: 0,
        arabicWord: 'قُلْ',
        partOfSpeech: 'FIIL',
        irabCase: 'MAJZUM',
        grammarRole: 'FIIL_AMR',
        caseMarker: 'Mabni atas Sukun',
        grammaticalExplanation: 'Fi\'il Amr mabni atas sukun, fa\'il mustatir wujuban takdirnya "Anta".',
        derivedRoot: 'ق-و-ل'
      },
      {
        wordIndex: 1,
        arabicWord: 'هُوَ',
        partOfSpeech: 'ISIM',
        irabCase: 'MABNI',
        grammarRole: 'MUBTADA',
        caseMarker: 'Dhamir Syakhn mabni atas Fathah',
        grammaticalExplanation: 'Dhamir munfashil menempati posisi rafa\' sebagai Mubtada\'.',
        derivedRoot: 'ه-و'
      },
      {
        wordIndex: 2,
        arabicWord: 'ٱللَّهُ',
        partOfSpeech: 'ISIM',
        irabCase: 'MARFU',
        grammarRole: 'MUBTADA',
        caseMarker: 'Dhammah Zhahirah',
        grammaticalExplanation: 'Mubtada\' tsani / Badhal marfu\'.',
        derivedRoot: 'أ-ل-ه'
      },
      {
        wordIndex: 3,
        arabicWord: 'أَحَدٌ',
        partOfSpeech: 'ISIM',
        irabCase: 'MARFU',
        grammarRole: 'KHABAR',
        caseMarker: 'Dhammah Tanwin',
        grammaticalExplanation: 'Khabar marfu\' menerangkan keesaan mutlak Allah.',
        derivedRoot: 'و-ح-د'
      }
    ]
  };

  /**
   * Retrieves verified treebank analysis or applies algorithmic morphological inference.
   */
  public static analyzeAyah(surahNumber: number, ayahNumber: number, arabicText?: string): AyahTreebank {
    const key = `${surahNumber}:${ayahNumber}`;
    if (this.VERIFIED_TREEBANK[key]) {
      return {
        surahNumber,
        ayahNumber,
        arabicText: arabicText || '',
        words: this.VERIFIED_TREEBANK[key]
      };
    }

    // Algorithmic heuristic parser for un-cataloged ayahs
    const wordsRaw = (arabicText || '').split(/\s+/).filter(Boolean);
    const inferredWords: WordIrabAnalysis[] = wordsRaw.map((w, idx) => {
      return this.heuristicParseWord(w, idx);
    });

    return {
      surahNumber,
      ayahNumber,
      arabicText: arabicText || '',
      words: inferredWords
    };
  }

  private static heuristicParseWord(word: string, index: number): WordIrabAnalysis {
    const cleanWord = word.trim();
    let partOfSpeech: 'ISIM' | 'FIIL' | 'HARF' = 'ISIM';
    let irabCase: IrabCase = 'MARFU';
    let grammarRole: GrammarRole = 'UNKNOWN';
    let caseMarker = 'Dhammah Zhahirah';
    let explanation = 'Analisis morfologi sintaksis otomatis.';

    if (cleanWord.startsWith('بِ') || cleanWord.startsWith('فِي') || cleanWord.startsWith('مِنْ') || cleanWord.startsWith('عَلَىٰ')) {
      partOfSpeech = 'HARF';
      irabCase = 'MABNI';
      grammarRole = 'HARF_JARR';
      caseMarker = 'Mabni';
      explanation = 'Huruf Jar pembawa status kasrah pada kata setelahnya.';
    } else if (cleanWord.includes('\u064D') || cleanWord.endsWith('\u0650')) { // Kasratain or Kasrah
      irabCase = 'MAJRUR';
      grammarRole = 'MUDHAF_ILAIH';
      caseMarker = 'Kasrah Zhahirah';
      explanation = 'Isim Majrur karena faktor mudhaf ilaih atau didahului huruf jar.';
    } else if (cleanWord.includes('\u064B') || cleanWord.endsWith('\u064E')) { // Fathatain or Fathah
      irabCase = 'MANSHUB';
      grammarRole = 'MAFUL_BIH';
      caseMarker = 'Fathah Zhahirah';
      explanation = 'Isim Manshub berkedudukan sebagai maf\'ul bih atau zharaf.';
    } else if (cleanWord.endsWith('\u0652')) { // Sukun
      partOfSpeech = 'FIIL';
      irabCase = 'MAJZUM';
      grammarRole = 'FIIL_AMR';
      caseMarker = 'Sukun';
      explanation = 'Fi\'il yang bersukun (mabni atau majzum).';
    } else {
      irabCase = 'MARFU';
      grammarRole = index === 0 ? 'MUBTADA' : 'KHABAR';
      caseMarker = 'Dhammah Zhahirah';
      explanation = 'Status marfu\' pada posisi pokok kalimat.';
    }

    return {
      wordIndex: index,
      arabicWord: cleanWord,
      partOfSpeech,
      irabCase,
      grammarRole,
      caseMarker,
      grammaticalExplanation: explanation
    };
  }
}
