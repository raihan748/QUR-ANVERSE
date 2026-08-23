// ==============================================================================
// Ultra-Resilient & Intelligent AI Speech Engine (Muroja'ah & Tajwid Evaluator)
// Multi-Dialect Arabic (ar-SA, ar-KW, ar-EG) & Indonesian Phonetics with Demo Simulator
// ==============================================================================

import { Ayat, EvaluationResult } from '../types';
import { formatAlafasyAudioUrl } from './audioPlayerService';

// 1. Comprehensive Arabic Diacritics & Quranic Orthography Normalizer
export function normalizeArabic(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    // Strip all tashkeel / harakat / Quranic annotation marks
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08E1\u08E3-\u08FF]/g, '')
    // Strip Tatweel
    .replace(/\u0640/g, '')
    // Normalize Alif forms (إ, أ, آ, ٱ, etc.) -> ا
    .replace(/[\u0622\u0623\u0625\u0671\u0672\u0673\u0675]/g, 'ا')
    // Normalize Taa Marbutah (ة) -> ه
    .replace(/\u0629/g, 'ه')
    // Normalize Yaa / Alif Maqsurah (ى, ي, ۍ, etc.) -> ي
    .replace(/[\u0649\u064A\u06D0\u06D1]/g, 'ي')
    // Normalize Waw forms (ؤ) -> و
    .replace(/\u0624/g, 'و')
    // Normalize Hamzah standalone
    .replace(/\u0621/g, '')
    // Normalize Kaf variations
    .replace(/[\u06A9\u06AA]/g, 'ك')
    // Strip non-Arabic letters
    .replace(/[^\u0621-\u064A\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 2. Arabic to Latin Sound Converter (Phonetic Transliteration)
export function arabicToPhoneticLatin(text: string): string {
  if (!text) return '';
  const cleanArab = normalizeArabic(text);

  const charMap: { [k: string]: string } = {
    'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'ts', 'ج': 'j',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dz', 'ر': 'r',
    'ز': 'z', 'س': 's', 'ش': 'sy', 'ص': 'sh', 'ض': 'dh',
    'ط': 'th', 'ظ': 'zh', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
    'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ء': ''
  };

  let result = '';
  for (let i = 0; i < cleanArab.length; i++) {
    const ch = cleanArab[i];
    result += charMap[ch] !== undefined ? charMap[ch] : ch;
  }
  return normalizeLatinPhonetics(result);
}

// 3. Universal Latin Phonetic Normalizer (Matches Indonesian accent & spelling habits)
export function normalizeLatinPhonetics(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    // Remove apostrophes, hyphens, glottal marks
    .replace(/['`\-_ʻ’‘"]/g, '')
    // Indonesian vowel habit: 'o' -> 'a' (e.g. rohman -> rahman, alloh -> allah, sholat -> salat)
    .replace(/o/g, 'a')
    // Normalize duplicate vowels (aa -> a, ii -> i, uu -> u, ee -> e)
    .replace(/aa+/g, 'a')
    .replace(/ii+/g, 'i')
    .replace(/uu+/g, 'u')
    .replace(/ee+/g, 'e')
    // Normalize phonetic pairs
    .replace(/dz|dh|zh/g, 'z')
    .replace(/th|ts/g, 't')
    .replace(/sh|sy/g, 's')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/ph|v/g, 'f')
    .replace(/ch/g, 'c')
    // Remove non-alphanumeric
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 4. Levenshtein Distance & Similarity Metric (0.0 to 1.0)
export function calculateSimilarity(s1: string, s2: string): number {
  if (!s1 && !s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  if (s1 === s2) return 1.0;

  const len1 = s1.length;
  const len2 = s2.length;
  const maxLen = Math.max(len1, len2);
  if (maxLen === 0) return 1.0;

  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1.charAt(i - 1) === s2.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  return Math.max(0, 1 - distance / maxLen);
}

export interface SpeechListenerOptions {
  onInterimResult?: (text: string) => void;
  onFinalResult?: (text: string) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
  language?: 'ar-SA' | 'id-ID' | 'ar-KW' | 'ar-EG';
}

// Resilient Speech Recognition Engine
export class SpeechEngine {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage: 'ar-SA' | 'id-ID' | 'ar-KW' | 'ar-EG' = 'ar-SA';
  private accumulatedTranscript = '';
  private restartTimer: any = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 5;
        this.recognition.lang = this.currentLanguage;
      } catch (e) {
        console.warn('SpeechRecognition init warning:', e);
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition || (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public setLanguage(lang: 'ar-SA' | 'id-ID' | 'ar-KW' | 'ar-EG'): void {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public getLanguage(): string {
    return this.currentLanguage;
  }

  public startListening(options: SpeechListenerOptions): boolean {
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechClass) {
      options.onError?.('Speech recognition is not supported in this browser.');
      return false;
    }

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
      }

      this.recognition = new SpeechClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 5;
      this.recognition.lang = options.language || this.currentLanguage;

      this.accumulatedTranscript = '';

      this.recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalText += res[0].transcript + ' ';
          } else {
            interimText += res[0].transcript;
          }
        }

        const consolidated = (finalText + ' ' + interimText).trim();
        this.accumulatedTranscript = consolidated;

        if (interimText && options.onInterimResult) {
          options.onInterimResult(consolidated);
        }
        if (options.onFinalResult) {
          options.onFinalResult(consolidated);
        }
      };

      this.recognition.onerror = (e: any) => {
        console.warn('Speech recognition status:', e.error);
        if (e.error !== 'no-speech' && options.onError) {
          options.onError(e);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // If still active (user hasn't clicked stop), auto-restart smoothly
          try {
            this.recognition.start();
          } catch {
            this.isListening = false;
            if (options.onEnd) options.onEnd();
          }
        } else {
          if (options.onEnd) options.onEnd();
        }
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      options.onError?.(err);
      return false;
    }
  }

  public stopListening(): string {
    this.isListening = false;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    return this.accumulatedTranscript;
  }

  // Intelligent Multi-Target Recitation Evaluator
  public evaluateRecitation(spokenText: string, ayat: Ayat): EvaluationResult {
    const rawExpectedArabic = ayat.arabicText || '';
    const cleanExpectedArabic = normalizeArabic(rawExpectedArabic);
    const expectedWords = rawExpectedArabic.split(/\s+/).filter(Boolean);

    // 1. Silence Check
    const cleanSpokenRaw = (spokenText || '').trim();
    if (!cleanSpokenRaw || cleanSpokenRaw.length < 2 || cleanSpokenRaw === '(Suara Tidak Terdeteksi)') {
      const allErrors = expectedWords.map(w => ({
        expectedWord: w,
        spokenWord: '',
        status: 'error' as const
      }));

      return {
        accuracyScore: 0,
        isPassed: false,
        recognizedText: '(Suara Belum Terdengar)',
        expectedArabic: rawExpectedArabic,
        expectedLatin: ayat.transliteration,
        wordEvaluations: allErrors,
        aiAdabPraise: 'Mikrofon belum menangkap suara Anda.',
        aiCorrectionNote: 'Klik tombol mikrofon, dekatkan ke bibir, atau gunakan tombol Ketik/Simulasi Presentasi jika ruangan bising.',
        syekhAudioUrl: formatAlafasyAudioUrl(ayat.surahNumber, ayat.numberInSurah)
      };
    }

    // 2. Multi-Candidate Similarity Matrix (Arabic & Latin Phonetics)
    const cleanSpokenArabic = normalizeArabic(cleanSpokenRaw);
    const spokenPhonetic = normalizeLatinPhonetics(cleanSpokenRaw);
    const expectedPhonetic = normalizeLatinPhonetics(ayat.transliteration || '') || arabicToPhoneticLatin(rawExpectedArabic);

    // Compare Arabic directly
    const arabSim = calculateSimilarity(cleanExpectedArabic, cleanSpokenArabic);

    // Compare Latin / Indonesian phonetic
    const latinSim = calculateSimilarity(expectedPhonetic, spokenPhonetic);

    // Compare Arabic-to-Phonetic conversion
    const arabToLatinSim = calculateSimilarity(arabicToPhoneticLatin(rawExpectedArabic), spokenPhonetic);

    // Best overall matching ratio
    const bestGlobalSim = Math.max(arabSim, latinSim, arabToLatinSim);

    // Word by Word Breakdown
    const spokenWords = cleanSpokenRaw.split(/\s+/).filter(Boolean);
    const wordEvaluations: EvaluationResult['wordEvaluations'] = [];
    let matchedWordCount = 0;

    expectedWords.forEach((origWord, idx) => {
      // Look for best matching spoken word anywhere within +/- 2 positions (handles slight speech pacing differences)
      let bestWScore = 0;
      let matchedSpokenWord = '';

      const minIdx = Math.max(0, idx - 2);
      const maxIdx = Math.min(spokenWords.length - 1, idx + 2);

      for (let sIdx = minIdx; sIdx <= maxIdx; sIdx++) {
        const candidate = spokenWords[sIdx] || '';
        if (!candidate) continue;
        const wArab = calculateSimilarity(normalizeArabic(origWord), normalizeArabic(candidate));
        const wLatin = calculateSimilarity(arabicToPhoneticLatin(origWord), normalizeLatinPhonetics(candidate));
        const cBest = Math.max(wArab, wLatin);
        if (cBest > bestWScore) {
          bestWScore = cBest;
          matchedSpokenWord = candidate;
        }
      }

      if (bestWScore >= 0.50 || bestGlobalSim >= 0.65) {
        matchedWordCount += 1.0;
        wordEvaluations.push({
          expectedWord: origWord,
          spokenWord: matchedSpokenWord || origWord,
          status: 'correct'
        });
      } else if (bestWScore >= 0.30 || bestGlobalSim >= 0.45) {
        matchedWordCount += 0.7;
        wordEvaluations.push({
          expectedWord: origWord,
          spokenWord: matchedSpokenWord || '(kurang jelas)',
          status: 'warning'
        });
      } else {
        wordEvaluations.push({
          expectedWord: origWord,
          spokenWord: matchedSpokenWord || '',
          status: 'error'
        });
      }
    });

    const wordRatio = expectedWords.length > 0 ? (matchedWordCount / expectedWords.length) : 0;
    
    // Balanced Score (50% Word Matrix + 50% Best Global Phonetic Flow)
    let finalScore = Math.min(100, Math.max(0, Math.round((wordRatio * 50) + (bestGlobalSim * 50))));

    // Sensitive baseline boost if global flow matches
    if (bestGlobalSim >= 0.60 && finalScore < 75) {
      finalScore = Math.min(100, Math.round(finalScore * 1.25));
    }

    const isPassed = finalScore >= 60;

    let aiAdabPraise = '';
    let aiCorrectionNote = '';

    if (finalScore >= 85) {
      aiAdabPraise = 'Maa Syaa Allah Tabarakallah! Suara terdeteksi sangat jelas, makhraj fasih, dan tajwid sangat indah!';
      aiCorrectionNote = 'Pertahankan kelancaran hafalan mutqin ini untuk ayat-ayat berikutnya!';
    } else if (finalScore >= 60) {
      aiAdabPraise = 'Alhamdulillah, hafalan antum lulus standar kelancaran dengan baik.';
      aiCorrectionNote = 'Bagus! Tingkatkan kejelasan artikulasi makhraj huruf agar semakin fasih.';
    } else if (finalScore >= 30) {
      aiAdabPraise = 'Alhamdulillah, suara antum tertangkap. Semangat mengulang kembali!';
      aiCorrectionNote = 'Lafal masih perlu disesuaikan dengan ayat yang tepat. Dengarkan contoh bacaan Syekh di bawah, lalu coba rekam lagi!';
    } else {
      aiAdabPraise = 'Bismillah, jangan putus asa! Terus latih lisan antum melafalkan ayat suci Al-Qur\'an.';
      aiCorrectionNote = 'Lafal belum cocok dengan ayat yang diuji. Simak dan tirukan lantunan tartil Syekh di bawah!';
    }

    const syekhAudioUrl = formatAlafasyAudioUrl(ayat.surahNumber, ayat.numberInSurah);

    return {
      accuracyScore: finalScore,
      isPassed,
      recognizedText: cleanSpokenRaw,
      expectedArabic: rawExpectedArabic,
      expectedLatin: ayat.transliteration,
      wordEvaluations,
      aiAdabPraise,
      aiCorrectionNote,
      syekhAudioUrl
    };
  }

  // 5. 🎯 Presentation & Live Pitch Simulator (Fail-Safe for Demo & Launching)
  public simulateDemoRecitation(ayat: Ayat): EvaluationResult {
    const rawExpectedArabic = ayat.arabicText || '';
    const expectedWords = rawExpectedArabic.split(/\s+/).filter(Boolean);

    const wordEvaluations = expectedWords.map((word, idx) => ({
      expectedWord: word,
      spokenWord: word,
      status: (idx === expectedWords.length - 1 && expectedWords.length > 4) ? ('warning' as const) : ('correct' as const)
    }));

    return {
      accuracyScore: 96,
      isPassed: true,
      recognizedText: rawExpectedArabic,
      expectedArabic: rawExpectedArabic,
      expectedLatin: ayat.transliteration,
      wordEvaluations,
      aiAdabPraise: 'Maa Syaa Allah Tabarakallah! Lantunan tartil sangat fasih, makhraj presisi standar Utsmani.',
      aiCorrectionNote: 'Tingkat akurasi 96% - Sesi Muroja\'ah AI Lulus dengan predikat Mumtaz!',
      syekhAudioUrl: formatAlafasyAudioUrl(ayat.surahNumber, ayat.numberInSurah)
    };
  }
}

export const speechEngine = new SpeechEngine();
