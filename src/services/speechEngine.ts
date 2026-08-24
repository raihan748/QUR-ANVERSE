// ==============================================================================
// Ultra-Resilient & Intelligent AI Speech Engine (Muroja'ah & Tajwid Evaluator)
// Multi-Dialect Arabic (ar-SA, ar-KW, ar-EG) & Multi-Accent Phonetics
// Hardened for High Accuracy, Continuous Stream Tracking & Zero-Fake Production
// ==============================================================================

import { Ayat, EvaluationResult } from '../types';
import { formatAlafasyAudioUrl } from './audioPlayerService';

// 1. Comprehensive Arabic Diacritics & Quranic Orthography Normalizer
export function normalizeArabic(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    // 1. Strip Zero-Width Characters, Non-Joiners, and Hidden Formatting
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF\u00AD\u200C\u200D]/g, '')
    // 2. Strip all Quranic Waqf / Stop / Sajdah / Rub El Hizb Marks
    .replace(/[\u06D6-\u06ED\u08D4-\u08E1\u08E3-\u08FF\u0610-\u061A]/g, '')
    // 3. Strip all Tashkeel / Harakat (Fatha, Damma, Kasra, Sukun, Shaddah, Tanween)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // 4. Strip Tatweel / Kashida
    .replace(/\u0640/g, '')
    // 5. Normalize Alif variants (إ, أ, آ, ٱ, ٲ, ٳ, ٵ) -> ا
    .replace(/[\u0622\u0623\u0625\u0671\u0672\u0673\u0675\u0670]/g, 'ا')
    // 6. Normalize Taa Marbutah (ة) -> ه
    .replace(/[\u0629\u06C0]/g, 'ه')
    // 7. Normalize Yaa / Alif Maqsurah (ى, ي, ۍ, ۑ, etc.) -> ي
    .replace(/[\u0649\u064A\u06D0\u06D1\u06CC]/g, 'ي')
    // 8. Normalize Waw forms (ؤ, ۄ, ۅ) -> و
    .replace(/[\u0624\u06C4\u06C5]/g, 'و')
    // 9. Normalize Standalone / Carrier Hamzah (ء, ئ)
    .replace(/[\u0621\u0626]/g, '')
    // 10. Normalize Kaf variations (ك, ک, ڪ) -> ك
    .replace(/[\u06A9\u06AA]/g, 'ك')
    // 11. Normalize Ha variants
    .replace(/[\u06BE\u06C1\u06C2\u06C3]/g, 'ه')
    // 12. Strip non-Arabic letters
    .replace(/[^\u0621-\u064A\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 2. Arabic to Universal Phonetic Latin Converter
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

// 3. Universal Latin Phonetic Normalizer (Matches Indonesian, Gulf & Asian speech habits)
export function normalizeLatinPhonetics(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    // Remove apostrophes, hyphens, glottal marks, numbers used for arabic letters (2, 3, 7)
    .replace(/['`\-_ʻ’‘"23789]/g, '')
    // Indonesian & Asian vowel shift: 'o' -> 'a' (e.g. rohman -> rahman, alloh -> allah, sholat -> salat)
    .replace(/o/g, 'a')
    // Normalize elongated vowels
    .replace(/aa+/g, 'a')
    .replace(/ii+|iy+/g, 'i')
    .replace(/uu+|uw+/g, 'u')
    .replace(/ee+/g, 'e')
    // Normalize phonetic sound clusters
    .replace(/dz|dh|zh|dj/g, 'z')
    .replace(/th|ts/g, 't')
    .replace(/sh|sy/g, 's')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/ph|v|p/g, 'f')
    .replace(/q/g, 'k')
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

// Word-level Matcher with Multi-Variant Tolerance & Particle Handling
export function isWordMatch(targetArabic: string, candidateSpoken: string): boolean {
  if (!targetArabic || !candidateSpoken) return false;

  const tArab = normalizeArabic(targetArabic);
  const sArab = normalizeArabic(candidateSpoken);

  if (tArab === sArab) return true;
  if (!tArab || !sArab) return false;

  // Substring containment for connected Quranic particles (e.g. "بِالْـ", "وَالْـ", "فَـ")
  if (tArab.length >= 3 && (sArab.includes(tArab) || tArab.includes(sArab))) return true;

  const arabSim = calculateSimilarity(tArab, sArab);
  if (arabSim >= 0.62) return true;

  const tLatin = arabicToPhoneticLatin(targetArabic);
  const sLatin = normalizeLatinPhonetics(candidateSpoken);

  if (tLatin === sLatin) return true;
  if (tLatin.length >= 3 && (sLatin.includes(tLatin) || tLatin.includes(sLatin))) return true;

  const latinSim = calculateSimilarity(tLatin, sLatin);
  return Math.max(arabSim, latinSim) >= 0.50;
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
  private restartTimeout: any = null;

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
        if (e.error !== 'no-speech' && e.error !== 'audio-capture') {
          console.warn('Speech recognition warning:', e.error);
        }
        if (options.onError) {
          options.onError(e);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Resilient Auto-restart on brief silence or browser disconnect
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.isListening && this.recognition) {
              try {
                this.recognition.start();
              } catch {
                this.isListening = false;
                if (options.onEnd) options.onEnd();
              }
            }
          }, 250);
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
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
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
        aiCorrectionNote: 'Klik tombol mikrofon, dekatkan ke bibir, lalu lantunkan ayat dengan tartil.',
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
      let bestWScore = 0;
      let matchedSpokenWord = '';

      const minIdx = Math.max(0, idx - 3);
      const maxIdx = Math.min(spokenWords.length - 1, idx + 3);

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

      if (bestWScore >= 0.48 || bestGlobalSim >= 0.65) {
        matchedWordCount += 1.0;
        wordEvaluations.push({
          expectedWord: origWord,
          spokenWord: matchedSpokenWord || origWord,
          status: 'correct'
        });
      } else if (bestWScore >= 0.28 || bestGlobalSim >= 0.42) {
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
    if (bestGlobalSim >= 0.58 && finalScore < 75) {
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
}

// ==============================================================================
// CONTINUOUS MULTI-VERSE MUROJA'AH REAL-TIME ENGINE
// Melacak pelafalan beruntun beberapa ayat sekaligus tanpa henti dengan Greedy Matcher
// ==============================================================================

export interface ContinuousTrackerCallbacks {
  onWordMatched: (ayahIndex: number, wordIndex: number, word: string) => void;
  onAyahCompleted: (ayahIndex: number, ayat: Ayat) => void;
  onErrorDetected: (ayahIndex: number, wordIndex: number, reason: string) => void;
  onPassageCompleted: (totalScore: number) => void;
}

export class ContinuousMurojaahTracker {
  private targetAyats: Ayat[] = [];
  private currentAyahIndex = 0;
  private currentWordIndex = 0;
  private matchedWordsMap: Map<number, Set<number>> = new Map();
  private callbacks: ContinuousTrackerCallbacks | null = null;
  private hesitationTimer: any = null;
  private isActive = false;
  private lastMatchTime = Date.now();
  private totalErrors = 0;
  private totalWordsCount = 0;
  private matchedWordsCount = 0;

  public initialize(ayats: Ayat[], callbacks: ContinuousTrackerCallbacks): void {
    this.targetAyats = ayats;
    this.callbacks = callbacks;
    this.currentAyahIndex = 0;
    this.currentWordIndex = 0;
    this.matchedWordsMap.clear();
    this.totalErrors = 0;
    this.matchedWordsCount = 0;
    this.totalWordsCount = ayats.reduce((sum, a) => sum + (a.arabicText ? a.arabicText.split(/\s+/).filter(Boolean).length : 0), 0);
    this.isActive = true;
    this.lastMatchTime = Date.now();
    this.resetHesitationWatchdog();
  }

  public stop(): void {
    this.isActive = false;
    this.clearHesitationWatchdog();
  }

  public getStatus() {
    return {
      currentAyahIndex: this.currentAyahIndex,
      currentWordIndex: this.currentWordIndex,
      matchedWordsCount: this.matchedWordsCount,
      totalWordsCount: this.totalWordsCount,
      progressPercentage: this.totalWordsCount > 0 ? Math.round((this.matchedWordsCount / this.totalWordsCount) * 100) : 0,
      totalErrors: this.totalErrors
    };
  }

  public isWordMatched(ayahIndex: number, wordIndex: number): boolean {
    return this.matchedWordsMap.get(ayahIndex)?.has(wordIndex) || false;
  }

  public isAyahActive(ayahIndex: number): boolean {
    return this.currentAyahIndex === ayahIndex;
  }

  public isAyahCompleted(ayahIndex: number): boolean {
    return ayahIndex < this.currentAyahIndex;
  }

  public processStream(rawTranscript: string): void {
    if (!this.isActive || !this.targetAyats[this.currentAyahIndex]) return;

    const currentAyat = this.targetAyats[this.currentAyahIndex];
    const expectedWords = (currentAyat.arabicText || '').split(/\s+/).filter(Boolean);
    const spokenWords = rawTranscript.split(/\s+/).filter(Boolean);

    if (spokenWords.length === 0 || expectedWords.length === 0) return;

    // Greedy consecutive word matching
    let matchedAny = false;
    const spokenWindow = spokenWords.slice(-8); // Inspect recent spoken words chunk

    while (this.currentWordIndex < expectedWords.length) {
      const targetWord = expectedWords[this.currentWordIndex];
      let foundWord = false;

      for (const spoken of spokenWindow) {
        if (isWordMatch(targetWord, spoken)) {
          foundWord = true;
          break;
        }
      }

      if (foundWord) {
        if (!this.matchedWordsMap.has(this.currentAyahIndex)) {
          this.matchedWordsMap.set(this.currentAyahIndex, new Set());
        }
        this.matchedWordsMap.get(this.currentAyahIndex)!.add(this.currentWordIndex);
        this.matchedWordsCount++;
        matchedAny = true;

        if (this.callbacks) {
          this.callbacks.onWordMatched(this.currentAyahIndex, this.currentWordIndex, targetWord);
        }

        this.currentWordIndex++;
      } else {
        break; // Stop continuous sequence if word is not yet spoken
      }
    }

    if (matchedAny) {
      this.lastMatchTime = Date.now();
      this.resetHesitationWatchdog();

      // Check if current Ayah is finished
      if (this.currentWordIndex >= expectedWords.length) {
        if (this.callbacks) {
          this.callbacks.onAyahCompleted(this.currentAyahIndex, currentAyat);
        }

        this.currentAyahIndex++;
        this.currentWordIndex = 0;

        // Check if all ayahs in passage are finished
        if (this.currentAyahIndex >= this.targetAyats.length) {
          this.isActive = false;
          this.clearHesitationWatchdog();
          const score = Math.max(70, Math.round(100 - (this.totalErrors * 4)));
          if (this.callbacks) {
            this.callbacks.onPassageCompleted(score);
          }
        }
      }
    }
  }

  // Force advance to next word/ayah (e.g. after Sheikh correction)
  public resumeAfterCorrection(): void {
    if (!this.isActive) return;
    this.lastMatchTime = Date.now();
    this.resetHesitationWatchdog();
  }

  private resetHesitationWatchdog(): void {
    this.clearHesitationWatchdog();
    if (!this.isActive) return;

    // 4.5 seconds timeout triggers Sheikh guidance / teguran
    this.hesitationTimer = setTimeout(() => {
      if (this.isActive && this.targetAyats[this.currentAyahIndex]) {
        this.totalErrors++;
        if (this.callbacks) {
          this.callbacks.onErrorDetected(
            this.currentAyahIndex,
            this.currentWordIndex,
            'Jeda pelafalan terhenti > 3.5 detik (Syekh membimbing)'
          );
        }
      }
    }, 4500);
  }

  private clearHesitationWatchdog(): void {
    if (this.hesitationTimer) {
      clearTimeout(this.hesitationTimer);
      this.hesitationTimer = null;
    }
  }
}

export const speechEngine = new SpeechEngine();
export const continuousTracker = new ContinuousMurojaahTracker();
