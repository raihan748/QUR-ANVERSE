// Ultra-Sensitive & Intelligent AI Speech Recognition Engine
// Dual-Mode Arabic (ar-SA) & Indonesian (id-ID) with Phonetic Matcher

import { Ayat, EvaluationResult } from '../types';
import { formatAlafasyAudioUrl } from './audioPlayerService';

// 1. Thorough Arabic Diacritics & Normalizer
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
  language?: 'ar-SA' | 'id-ID';
}

// Resilient Speech Recognition Engine
export class SpeechEngine {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage: 'ar-SA' | 'id-ID' = 'ar-SA';
  private accumulatedTranscript = '';

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
        this.recognition.maxAlternatives = 3;
        this.recognition.lang = this.currentLanguage;
      } catch (e) {
        console.warn('SpeechRecognition init error:', e);
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition || (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public setLanguage(lang: 'ar-SA' | 'id-ID'): void {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public getLanguage(): 'ar-SA' | 'id-ID' {
    return this.currentLanguage;
  }

  public startListening(options: SpeechListenerOptions): boolean {
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechClass) {
      options.onError?.('Speech recognition is not supported in this browser.');
      return false;
    }

    try {
      // Abort any lingering recognition session safely
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
      }

      this.recognition = new SpeechClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;
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

        const fullResult = (finalText + ' ' + interimText).trim();
        this.accumulatedTranscript = fullResult;

        if (interimText && options.onInterimResult) {
          options.onInterimResult(fullResult);
        }
        if (options.onFinalResult) {
          options.onFinalResult(fullResult);
        }
      };

      this.recognition.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e.error);
        if (e.error !== 'no-speech') {
          options.onError?.(e);
        }
      };

      this.recognition.onend = () => {
        // If still listening and ended unexpectedly, deliver last accumulated transcript
        if (this.isListening) {
          if (options.onFinalResult && this.accumulatedTranscript) {
            options.onFinalResult(this.accumulatedTranscript);
          }
          this.isListening = false;
        }
        if (options.onEnd) options.onEnd();
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
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
    return this.accumulatedTranscript;
  }

  // Intelligent Multi-Target Recitation Evaluator
  public evaluateRecitation(spokenText: string, ayat: Ayat): EvaluationResult {
    const rawExpectedArabic = ayat.arabicText || '';
    const cleanExpectedArabic = normalizeArabic(rawExpectedArabic);
    const expectedWords = rawExpectedArabic.split(/\s+/).filter(Boolean);

    // 1. Strict Silence Check
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
        aiCorrectionNote: 'Klik tombol mikrofon, izinkan akses mic, lalu lafalkan ayat dengan suara jelas dan dekat ke mikrofon.',
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
      const spkWord = spokenWords[idx] || '';

      if (!spkWord) {
        wordEvaluations.push({
          expectedWord: origWord,
          spokenWord: '',
          status: 'error'
        });
        return;
      }

      const wArabSim = calculateSimilarity(normalizeArabic(origWord), normalizeArabic(spkWord));
      const wLatinSim = calculateSimilarity(arabicToPhoneticLatin(origWord), normalizeLatinPhonetics(spkWord));
      const wBest = Math.max(wArabSim, wLatinSim);

      if (wBest >= 0.55 || bestGlobalSim >= 0.70) {
        matchedWordCount += 1.0;
        wordEvaluations.push({
          expectedWord: origWord,
          spokenWord: spkWord,
          status: 'correct'
        });
      } else if (wBest >= 0.35) {
        matchedWordCount += 0.6;
        wordEvaluations.push({
          expectedWord: origWord,
          spokenWord: spkWord,
          status: 'warning'
        });
      } else {
        wordEvaluations.push({
          expectedWord: origWord,
          spokenWord: spkWord,
          status: 'error'
        });
      }
    });

    const wordRatio = expectedWords.length > 0 ? (matchedWordCount / expectedWords.length) : 0;
    
    // Balanced Score (50% Word Matrix + 50% Best Global Phonetic Flow)
    const finalScore = Math.min(100, Math.max(0, Math.round((wordRatio * 50) + (bestGlobalSim * 50))));

    // Sensitive & Fair Pass Threshold (>= 65% is considered passed for web microphone variability)
    const isPassed = finalScore >= 65;

    // Islamic Adab Praise & Encouragement
    let aiAdabPraise = '';
    let aiCorrectionNote = '';

    if (finalScore >= 85) {
      aiAdabPraise = 'Maa Syaa Allah Tabarakallah! Suara terdeteksi sangat jelas, makhraj fasih, dan tajwid sangat indah!';
      aiCorrectionNote = 'Pertahankan kelancaran hafalan mutqin ini untuk ayat-ayat berikutnya!';
    } else if (finalScore >= 65) {
      aiAdabPraise = 'Alhamdulillah, hafalan antum lulus standar kelancaran dengan baik.';
      aiCorrectionNote = 'Bagus! Tingkatkan kejelasan artikulasi makhraj huruf agar semakin fasih.';
    } else if (finalScore >= 35) {
      aiAdabPraise = 'Alhamdulillah, suara antum tertangkap. Semangat mengulang kembali!';
      aiCorrectionNote = 'Lafal masih perlu disesuaikan dengan ayat yang tepat. Dengarkan contoh bacaan Syekh Misyari di bawah, lalu coba rekam lagi ya!';
    } else {
      aiAdabPraise = 'Bismillah, jangan putus asa! Terus latih lisan antum melafalkan ayat suci Al-Qur\'an.';
      aiCorrectionNote = 'Lafal belum cocok dengan ayat yang diuji. Simak dan tirukan lantunan tartil Syekh Misyari di bawah!';
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
}

export const speechEngine = new SpeechEngine();
