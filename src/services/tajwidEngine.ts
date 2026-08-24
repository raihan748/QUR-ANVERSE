import { Ayat } from '../types';
import { TAJWID_RULES_DB, TajwidRule, TajwidExamAyah, TAJWID_EXAM_PRESETS } from '../data/tajwidRulesData';

export interface TajwidEvaluation {
  isPassed: boolean;
  score: number; // 0 - 100
  hasError: boolean;
  violatedRule?: TajwidRule;
  mistakeTitle?: string;
  mistakeExplanation?: string;
  correctGuidance?: string;
  errorWordIndex?: number;
  wordStatuses: {
    wordText: string;
    isError: boolean;
    ruleLabel?: string;
  }[];
}

class TajwidEngineService {
  /**
   * Get an exam preset or generate a dynamic one from an Ayat
   */
  getExamAyah(surahNumber: number, ayahNumber: number, ayatData?: Ayat): TajwidExamAyah {
    const existingPreset = TAJWID_EXAM_PRESETS.find(
      (p) => p.surahNumber === surahNumber && p.ayahNumber === ayahNumber
    );

    if (existingPreset) {
      return existingPreset;
    }

    // Dynamic generation
    const rawWords = (ayatData?.arabicText || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')
      .split(/\s+/)
      .filter(Boolean);

    // Pick a default rule
    const primaryRule = TAJWID_RULES_DB[0];

    const words = rawWords.map((w, idx) => {
      if (idx === 0) {
        return {
          text: w,
          ruleId: primaryRule.id,
          highlightColor: primaryRule.color,
          ruleTitle: primaryRule.name
        };
      }
      return { text: w };
    });

    return {
      surahNumber,
      ayahNumber,
      surahName: ayatData?.surahName || 'Surat Al-Qur\'an',
      arabicText: ayatData?.arabicText || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      transliteration: ayatData?.transliteration || 'Bismillaahir-Rahmaanir-Rahiim',
      translation: ayatData?.translation || 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.',
      words,
      primaryRule,
      commonMistakes: [
        {
          type: 'tajwid_general',
          label: 'Kekeliruan Tajwid & Harakat Lisan',
          mistakeText: 'Lafal tidak presisi pada huruf awal',
          syekhAudioWordIndex: 0,
          explanation: 'Terdapat ketidaktepatan panjang mad atau dengung pada kata ini.',
          correctWay: primaryRule.correctGuide
        }
      ]
    };
  }

  /**
   * Real-time Speech evaluation against Tajwid rules
   */
  evaluateSpokenTajwid(spokenText: string, examAyah: TajwidExamAyah): TajwidEvaluation {
    const cleanSpoken = spokenText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();
    const words = examAyah.words;

    // If spoken text is empty or very short
    if (!cleanSpoken || cleanSpoken.length < 3) {
      return {
        isPassed: false,
        score: 0,
        hasError: false,
        wordStatuses: words.map((w) => ({ wordText: w.text, isError: false }))
      };
    }

    // Check if spoken text misses crucial phonetics (e.g. Ikhfa ghunnah, Mad length, etc.)
    const cleanTranslit = examAyah.transliteration.toLowerCase().replace(/[^a-z\s']/g, '');
    const translitWords = cleanTranslit.split(/\s+/).filter(Boolean);
    const spokenTokens = cleanSpoken.split(/\s+/).filter(Boolean);

    // Calculate word-level matching
    let errorIdx: number | undefined = undefined;
    let violatedRule: TajwidRule | undefined = undefined;
    let mistakeTitle: string | undefined = undefined;
    let mistakeExplanation: string | undefined = undefined;
    let correctGuidance: string | undefined = undefined;

    // Detect if primary rule has specific keywords
    if (examAyah.primaryRule.id === 'makhraj_ain') {
      // Check if user said 'a' instead of ''a'
      const hasAin = cleanSpoken.includes("'a") || cleanSpoken.includes("`a") || cleanSpoken.includes("ng");
      if (!hasAin && spokenTokens.length >= 2) {
        errorIdx = examAyah.words.findIndex((w) => w.ruleId === 'makhraj_ain');
        if (errorIdx === -1) errorIdx = 0;
        violatedRule = examAyah.primaryRule;
        mistakeTitle = "Makhraj Huruf 'Ain (ع) Tertukar Hamzah / Alif";
        mistakeExplanation = "Huruf 'Ain pada kata الْعَالَمِينَ dibaca datar tanpa tekanan makhraj tengah tenggorokan.";
        correctGuidance = examAyah.primaryRule.correctGuide;
      }
    } else if (examAyah.primaryRule.id === 'ikhfa_haqiqi') {
      // Check if user rushed without holding nasal sound
      if (cleanSpoken.includes("min syar") && !cleanSpoken.includes("minn") && !cleanSpoken.includes("ming")) {
        // Fast pronunciation without ghunnah
        errorIdx = 0;
        violatedRule = examAyah.primaryRule;
        mistakeTitle = "Ikhfa Haqiqi Kurang Dengung (Ghunnah Terputus)";
        mistakeExplanation = "Nun sukun bertemu huruf Ikhfa dibaca cepat tanpa menahan dengung 2 harakat.";
        correctGuidance = examAyah.primaryRule.correctGuide;
      }
    } else if (examAyah.primaryRule.id === 'mad_wajib_muttashil') {
      // Check if mad was rushed
      if (cleanSpoken.includes("ja'a") || cleanSpoken.includes("jaa")) {
        if (!cleanSpoken.includes("jaaaa") && !cleanSpoken.includes("jaaa")) {
          errorIdx = examAyah.words.findIndex((w) => w.ruleId === 'mad_wajib_muttashil');
          if (errorIdx === -1) errorIdx = 1;
          violatedRule = examAyah.primaryRule;
          mistakeTitle = "Mad Wajib Muttashil Terlalu Pendek";
          mistakeExplanation = "Panjang Mad Wajib pada kata جَاءَ wajib 4-5 harakat (tidak boleh hanya 2 harakat).";
          correctGuidance = examAyah.primaryRule.correctGuide;
        }
      }
    }

    const isPassed = errorIdx === undefined && spokenTokens.length >= Math.min(2, words.length);
    const score = isPassed ? 95 : (errorIdx !== undefined ? 45 : 60);

    return {
      isPassed,
      score,
      hasError: errorIdx !== undefined,
      violatedRule,
      mistakeTitle,
      mistakeExplanation,
      correctGuidance,
      errorWordIndex: errorIdx,
      wordStatuses: words.map((w, idx) => ({
        wordText: w.text,
        isError: idx === errorIdx,
        ruleLabel: w.ruleTitle
      }))
    };
  }

  /**
   * Run specific simulated mistake scenario for Jury Demo
   */
  simulateMistakeScenario(
    examAyah: TajwidExamAyah,
    scenarioType: 'ikhfa_short' | 'mad_short' | 'makhraj_ain' | 'perfect'
  ): TajwidEvaluation {
    const words = examAyah.words;

    if (scenarioType === 'perfect') {
      return {
        isPassed: true,
        score: 98,
        hasError: false,
        wordStatuses: words.map((w) => ({ wordText: w.text, isError: false, ruleLabel: w.ruleTitle }))
      };
    }

    if (scenarioType === 'ikhfa_short') {
      const ikhfaRule = TAJWID_RULES_DB.find((r) => r.id === 'ikhfa_haqiqi')!;
      return {
        isPassed: false,
        score: 45,
        hasError: true,
        violatedRule: ikhfaRule,
        mistakeTitle: 'Peringatan Tajwid: Ikhfa Haqiqi Kurang Dengung (Ghunnah Terputus)',
        mistakeExplanation: 'Nun sukun bertemu huruf Ikhfa dibaca terburu-buru seperti Izhar (tidak ditahan 2 harakat).',
        correctGuidance: ikhfaRule.correctGuide,
        errorWordIndex: 0,
        wordStatuses: words.map((w, idx) => ({
          wordText: w.text,
          isError: idx === 0,
          ruleLabel: idx === 0 ? '⚠️ Ikhfa Salah' : w.ruleTitle
        }))
      };
    }

    if (scenarioType === 'mad_short') {
      const madRule = TAJWID_RULES_DB.find((r) => r.id === 'mad_wajib_muttashil')!;
      const targetIdx = words.findIndex((w) => w.ruleId === 'mad_wajib_muttashil') >= 0
        ? words.findIndex((w) => w.ruleId === 'mad_wajib_muttashil')
        : 1;

      return {
        isPassed: false,
        score: 50,
        hasError: true,
        violatedRule: madRule,
        mistakeTitle: 'Peringatan Tajwid: Mad Wajib Muttashil Terlalu Pendek (< 4 Harakat)',
        mistakeExplanation: 'Huruf Mad bertemu Hamzah dalam satu kata wajib dibaca panjang 4 sampai 5 harakat.',
        correctGuidance: madRule.correctGuide,
        errorWordIndex: targetIdx,
        wordStatuses: words.map((w, idx) => ({
          wordText: w.text,
          isError: idx === targetIdx,
          ruleLabel: idx === targetIdx ? '⚠️ Mad Pendek' : w.ruleTitle
        }))
      };
    }

    if (scenarioType === 'makhraj_ain') {
      const ainRule = TAJWID_RULES_DB.find((r) => r.id === 'makhraj_ain')!;
      const targetIdx = words.length - 1;

      return {
        isPassed: false,
        score: 40,
        hasError: true,
        violatedRule: ainRule,
        mistakeTitle: "Peringatan Makhraj: Huruf 'Ain (ع) Tertukar Alif / Hamzah (أ)",
        mistakeExplanation: "Huruf 'Ain diucapkan datar tanpa penekanan makhraj tengah tenggorokan.",
        correctGuidance: ainRule.correctGuide,
        errorWordIndex: targetIdx,
        wordStatuses: words.map((w, idx) => ({
          wordText: w.text,
          isError: idx === targetIdx,
          ruleLabel: idx === targetIdx ? "⚠️ Makhraj 'Ain" : w.ruleTitle
        }))
      };
    }

    return {
      isPassed: true,
      score: 95,
      hasError: false,
      wordStatuses: words.map((w) => ({ wordText: w.text, isError: false }))
    };
  }
}

export const tajwidEngine = new TajwidEngineService();
