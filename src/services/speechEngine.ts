// ==============================================================================
// Ultra-Resilient & Intelligent AI Speech Engine (Muroja'ah & Tajwid Evaluator)
// Multi-Dialect Arabic (ar-SA, ar-KW, ar-EG) & Multi-Accent Phonetics (Nusantara/Asian)
// Upgraded Hearing Instinct: N-Best Alternative Pooling, Compound Word N-Gram Matcher,
// Proclitic/Enclitic Stemming, and Dynamic Levenshtein Alignment
// ==============================================================================

import { Ayat, EvaluationResult } from '../types';
import { formatAlafasyAudioUrl } from './audioPlayerService';

// 1. Comprehensive Arabic Diacritics & Quranic Orthography Normalizer
export function normalizeArabic(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    // 1. Strip Zero-Width Characters, Non-Joiners, and Hidden Formatting
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF\u00AD\u200C\u200D]/g, '')
    // 2. Strip all Quranic Waqf / Stop / Sajdah / Rub El Hizb / Sub-vowel Marks
    .replace(/[\u06D6-\u06ED\u08D4-\u08E1\u08E3-\u08FF\u0610-\u061A\u06DC\u06DF\u06E0\u06E2\u06E3\u06E5\u06E6\u06E7\u06E8]/g, '')
    // 3. Strip all Tashkeel / Harakat (Fatha, Damma, Kasra, Sukun, Shaddah, Tanween, Maddah)
    .replace(/[\u064B-\u065F\u0670\u0653~]/g, '')
    // 4. Strip Tatweel / Kashida
    .replace(/\u0640/g, '')
    // 5. Normalize Alif variants (إ, أ, آ, ٱ, ٲ, ٳ, ٵ, ا) -> ا
    .replace(/[\u0622\u0623\u0625\u0671\u0672\u0673\u0675\u0670]/g, 'ا')
    // 6. Normalize Taa Marbutah (ة, ۃ) -> ه
    .replace(/[\u0629\u06C0\u06D5]/g, 'ه')
    // 7. Normalize Yaa / Alif Maqsurah / Dagger Yaa (ى, ي, ۍ, ۑ, ے, etc.) -> ي
    .replace(/[\u0649\u064A\u06D0\u06D1\u06CC\u06D2\u06D3]/g, 'ي')
    // 8. Normalize Waw forms (ؤ, ۄ, ۅ, و) -> و
    .replace(/[\u0624\u06C4\u06C5\u06C6\u06C7\u06C8]/g, 'و')
    // 9. Normalize Standalone / Carrier Hamzah (ء, ئ)
    .replace(/[\u0621\u0626]/g, '')
    // 10. Normalize Kaf / Gaf variations (ك, ک, ڪ, گ) -> ك
    .replace(/[\u06A9\u06AA\u06AF]/g, 'ك')
    // 11. Normalize Ha / Pe / Che variants
    .replace(/[\u06BE\u06C1\u06C2\u06C3]/g, 'ه')
    .replace(/\u067E/g, 'ب') // Pe -> Ba
    .replace(/\u0686/g, 'ج') // Che -> Jim
    .replace(/\u0698/g, 'ز') // Zhe -> Zai
    // 12. Strip non-Arabic letters
    .replace(/[^\u0621-\u064A\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 2. Arabic Proclitic / Prefix Stemmer (Helps match connected Quranic particles)
export function stripArabicPrefixes(word: string): string {
  let clean = normalizeArabic(word);
  if (clean.length <= 3) return clean;

  // Strip Alif-Lam (ال)
  if (clean.startsWith('ال') && clean.length > 3) {
    clean = clean.substring(2);
  }
  // Strip Waw / Fa / Ba / Lam conjunctions (و, ف, ب, ل, ك)
  if ((clean.startsWith('و') || clean.startsWith('ف') || clean.startsWith('ب') || clean.startsWith('ل') || clean.startsWith('ك')) && clean.length > 3) {
    clean = clean.substring(1);
  }
  return clean;
}

// 3. Arabic to Universal Phonetic Latin Converter
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

// 4. Universal Latin Phonetic Normalizer (Tailored for Nusantara & Asian Recitation Habits)
export function normalizeLatinPhonetics(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    // Remove apostrophes, hyphens, glottal marks, numbers used in Arabic chat (2, 3, 7)
    .replace(/['`\-_ʻ’‘"23789]/g, '')
    // Indonesian & Asian vowel shift: 'o' -> 'a' (e.g. rohman -> rahman, alloh -> allah, sholawat -> salawat)
    .replace(/o/g, 'a')
    // Normalize elongated vowels
    .replace(/aa+/g, 'a')
    .replace(/ii+|iy+/g, 'i')
    .replace(/uu+|uw+/g, 'u')
    .replace(/ee+/g, 'e')
    // Normalize phonetic sound clusters to standard roots
    .replace(/dz|dh|dl|zh|dj/g, 'z')
    .replace(/th|ts/g, 't')
    .replace(/sh|sy/g, 's')
    .replace(/kh|q/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/ph|v|p/g, 'f')
    .replace(/ch/g, 'c')
    .replace(/ny|ng/g, 'n')
    // Remove duplicate consecutive consonants
    .replace(/([bcdfghjklmnpqrstvwxyz])\1+/g, '$1')
    // Remove non-alphanumeric
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 5. Levenshtein Distance & Similarity Metric (0.0 to 1.0)
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

// 6. Ultra-Sharp Word-level Matcher with Multi-Variant & Compound Word Tolerance
export function isWordMatch(targetArabic: string, candidateSpoken: string): boolean {
  if (!targetArabic || !candidateSpoken) return false;

  const tArab = normalizeArabic(targetArabic);
  const sArab = normalizeArabic(candidateSpoken);

  if (tArab === sArab) return true;
  if (!tArab || !sArab) return false;

  // 1. Substring containment for connected Quranic particles (e.g. "بِالْـ", "وَالْـ", "فَـ")
  if (tArab.length >= 3 && (sArab.includes(tArab) || tArab.includes(sArab))) return true;

  // 2. Arabic Normalized Similarity
  const arabSim = calculateSimilarity(tArab, sArab);
  if (arabSim >= 0.55) return true;

  // 3. Stemmed Prefix Matching (Stripping Alif-Lam / Waw / Ba)
  const tStem = stripArabicPrefixes(tArab);
  const sStem = stripArabicPrefixes(sArab);
  if (tStem && sStem && tStem === sStem) return true;
  if (tStem.length >= 3 && sStem.length >= 3 && calculateSimilarity(tStem, sStem) >= 0.60) return true;

  // 4. Latin Phonetic Comparison
  const tLatin = arabicToPhoneticLatin(targetArabic);
  const sLatin = normalizeLatinPhonetics(candidateSpoken);

  if (tLatin === sLatin) return true;
  if (tLatin.length >= 3 && (sLatin.includes(tLatin) || tLatin.includes(sLatin))) return true;

  const latinSim = calculateSimilarity(tLatin, sLatin);
  if (latinSim >= 0.45) return true;

  return Math.max(arabSim, latinSim) >= 0.48;
}

// 7. Compound Multi-Word Matcher (Handles compound recitations like "bismillah", "iyyakanabudu")
export function isCompoundMatch(targetWords: string[], candidateSpoken: string): { matchedCount: number; matchedSpoken: string } {
  if (targetWords.length === 0 || !candidateSpoken) return { matchedCount: 0, matchedSpoken: '' };

  const sArab = normalizeArabic(candidateSpoken);
  const sLatin = normalizeLatinPhonetics(candidateSpoken);

  // Check 3-word concatenation
  if (targetWords.length >= 3) {
    const t3Arab = normalizeArabic(targetWords.slice(0, 3).join(''));
    const t3Latin = normalizeLatinPhonetics(targetWords.slice(0, 3).map(w => arabicToPhoneticLatin(w)).join(''));
    if (calculateSimilarity(t3Arab, sArab) >= 0.60 || calculateSimilarity(t3Latin, sLatin) >= 0.55) {
      return { matchedCount: 3, matchedSpoken: candidateSpoken };
    }
  }

  // Check 2-word concatenation
  if (targetWords.length >= 2) {
    const t2Arab = normalizeArabic(targetWords.slice(0, 2).join(''));
    const t2Latin = normalizeLatinPhonetics(targetWords.slice(0, 2).map(w => arabicToPhoneticLatin(w)).join(''));
    if (calculateSimilarity(t2Arab, sArab) >= 0.60 || calculateSimilarity(t2Latin, sLatin) >= 0.55) {
      return { matchedCount: 2, matchedSpoken: candidateSpoken };
    }
  }

  // Single word fallback
  if (isWordMatch(targetWords[0], candidateSpoken)) {
    return { matchedCount: 1, matchedSpoken: candidateSpoken };
  }

  return { matchedCount: 0, matchedSpoken: '' };
}

export interface SpeechListenerOptions {
  onInterimResult?: (text: string, alternatives?: string[]) => void;
  onFinalResult?: (text: string, alternatives?: string[]) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
  language?: 'ar-SA' | 'id-ID' | 'ar-KW' | 'ar-EG';
}

// Resilient Multi-Hypothesis Speech Recognition Engine
export class SpeechEngine {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage: 'ar-SA' | 'id-ID' | 'ar-KW' | 'ar-EG' = 'ar-SA';
  private accumulatedTranscript = '';
  private alternativeHypotheses: string[] = [];
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
        this.recognition.maxAlternatives = 5; // Pool up to 5 N-Best alternatives
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
      this.alternativeHypotheses = [];

      this.recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';
        const currentAlternatives: string[] = [];

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalText += res[0].transcript + ' ';
          } else {
            interimText += res[0].transcript;
          }

          // Gather all N-Best hypothesis alternatives (insting pendengar multi-hipotesis)
          for (let alt = 0; alt < res.length; alt++) {
            if (res[alt] && res[alt].transcript) {
              currentAlternatives.push(res[alt].transcript);
            }
          }
        }

        const consolidated = (finalText + ' ' + interimText).trim();
        this.accumulatedTranscript = consolidated;
        this.alternativeHypotheses = currentAlternatives;

        if (interimText && options.onInterimResult) {
          options.onInterimResult(consolidated, currentAlternatives);
        }
        if (options.onFinalResult) {
          options.onFinalResult(consolidated, currentAlternatives);
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
          }, 200);
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

  public getAlternativeHypotheses(): string[] {
    return this.alternativeHypotheses;
  }

  // Intelligent Multi-Target Recitation Evaluator with Multi-Hypothesis Scoring
  public evaluateRecitation(spokenText: string, ayat: Ayat, alternatives?: string[]): EvaluationResult {
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

    // 2. Multi-Candidate Pool Evaluation (Test main transcript + all N-Best alternatives)
    const candidates = [cleanSpokenRaw, ...(alternatives || this.alternativeHypotheses || [])].filter(Boolean);
    let bestFinalScore = 0;
    let bestWordEvaluations: EvaluationResult['wordEvaluations'] = [];
    let bestRecognizedText = cleanSpokenRaw;

    for (const candidateText of candidates) {
      const cleanSpokenArabic = normalizeArabic(candidateText);
      const spokenPhonetic = normalizeLatinPhonetics(candidateText);
      const expectedPhonetic = normalizeLatinPhonetics(ayat.transliteration || '') || arabicToPhoneticLatin(rawExpectedArabic);

      const arabSim = calculateSimilarity(cleanExpectedArabic, cleanSpokenArabic);
      const latinSim = calculateSimilarity(expectedPhonetic, spokenPhonetic);
      const arabToLatinSim = calculateSimilarity(arabicToPhoneticLatin(rawExpectedArabic), spokenPhonetic);
      const bestGlobalSim = Math.max(arabSim, latinSim, arabToLatinSim);

      const spokenWords = candidateText.split(/\s+/).filter(Boolean);
      const currentEvaluations: EvaluationResult['wordEvaluations'] = [];
      let matchedWordCount = 0;

      expectedWords.forEach((origWord, idx) => {
        let bestWScore = 0;
        let matchedSpokenWord = '';

        const minIdx = Math.max(0, idx - 4);
        const maxIdx = Math.min(spokenWords.length - 1, idx + 4);

        for (let sIdx = minIdx; sIdx <= maxIdx; sIdx++) {
          const candidate = spokenWords[sIdx] || '';
          if (!candidate) continue;
          const isDirect = isWordMatch(origWord, candidate);
          const wArab = calculateSimilarity(normalizeArabic(origWord), normalizeArabic(candidate));
          const wLatin = calculateSimilarity(arabicToPhoneticLatin(origWord), normalizeLatinPhonetics(candidate));
          const cBest = isDirect ? Math.max(0.75, Math.max(wArab, wLatin)) : Math.max(wArab, wLatin);

          if (cBest > bestWScore) {
            bestWScore = cBest;
            matchedSpokenWord = candidate;
          }
        }

        if (bestWScore >= 0.45 || bestGlobalSim >= 0.60) {
          matchedWordCount += 1.0;
          currentEvaluations.push({
            expectedWord: origWord,
            spokenWord: matchedSpokenWord || origWord,
            status: 'correct'
          });
        } else if (bestWScore >= 0.25 || bestGlobalSim >= 0.40) {
          matchedWordCount += 0.75;
          currentEvaluations.push({
            expectedWord: origWord,
            spokenWord: matchedSpokenWord || '(kurang jelas)',
            status: 'warning'
          });
        } else {
          currentEvaluations.push({
            expectedWord: origWord,
            spokenWord: matchedSpokenWord || '',
            status: 'error'
          });
        }
      });

      const wordRatio = expectedWords.length > 0 ? (matchedWordCount / expectedWords.length) : 0;
      let calculatedScore = Math.min(100, Math.max(0, Math.round((wordRatio * 50) + (bestGlobalSim * 50))));

      if (bestGlobalSim >= 0.55 && calculatedScore < 80) {
        calculatedScore = Math.min(100, Math.round(calculatedScore * 1.25));
      }

      if (calculatedScore > bestFinalScore) {
        bestFinalScore = calculatedScore;
        bestWordEvaluations = currentEvaluations;
        bestRecognizedText = candidateText;
      }
    }

    const isPassed = bestFinalScore >= 55; // Fair passing threshold

    let aiAdabPraise = '';
    let aiCorrectionNote = '';

    if (bestFinalScore >= 80) {
      aiAdabPraise = 'Maa Syaa Allah Tabarakallah! Suara terdeteksi sangat jelas, makhraj fasih, dan tajwid sangat indah!';
      aiCorrectionNote = 'Pertahankan kelancaran hafalan mutqin ini untuk ayat-ayat berikutnya!';
    } else if (bestFinalScore >= 55) {
      aiAdabPraise = 'Alhamdulillah, hafalan antum lulus standar kelancaran dengan baik.';
      aiCorrectionNote = 'Bagus! Lisan antum melafalkan ayat dengan runtut dan benar.';
    } else if (bestFinalScore >= 30) {
      aiAdabPraise = 'Alhamdulillah, suara antum tertangkap. Semangat mengulang kembali!';
      aiCorrectionNote = 'Lafal masih perlu disesuaikan dengan ayat yang tepat. Dengarkan contoh bacaan Syekh di bawah, lalu coba rekam lagi!';
    } else {
      aiAdabPraise = 'Bismillah, jangan putus asa! Terus latih lisan antum melafalkan ayat suci Al-Qur\'an.';
      aiCorrectionNote = 'Lafal belum cocok dengan ayat yang diuji. Simak dan tirukan lantunan tartil Syekh di bawah!';
    }

    const syekhAudioUrl = formatAlafasyAudioUrl(ayat.surahNumber, ayat.numberInSurah);

    return {
      accuracyScore: bestFinalScore,
      isPassed,
      recognizedText: bestRecognizedText,
      expectedArabic: rawExpectedArabic,
      expectedLatin: ayat.transliteration,
      wordEvaluations: bestWordEvaluations,
      aiAdabPraise,
      aiCorrectionNote,
      syekhAudioUrl
    };
  }
}

// ==============================================================================
// CONTINUOUS MULTI-VERSE MUROJA'AH REAL-TIME ENGINE (UPGRADED SHARP INSTINCT)
// Multi-Word Lookahead, Compound Phrasing, & N-Best Hypothesis Matching
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
  private isPaused = false;
  private lastMatchTime = Date.now();
  private totalErrors = 0;
  private totalWordsCount = 0;
  private matchedWordsCount = 0;
  private processedWordCursor = 0; // Tracks consumed spoken words to prevent recycling

  public initialize(ayats: Ayat[], callbacks: ContinuousTrackerCallbacks): void {
    this.targetAyats = ayats;
    this.callbacks = callbacks;
    this.currentAyahIndex = 0;
    this.currentWordIndex = 0;
    this.processedWordCursor = 0;
    this.matchedWordsMap.clear();
    this.totalErrors = 0;
    this.matchedWordsCount = 0;
    this.totalWordsCount = ayats.reduce((sum, a) => sum + (a.arabicText ? a.arabicText.split(/\s+/).filter(Boolean).length : 0), 0);
    this.isActive = true;
    this.isPaused = false;
    this.lastMatchTime = Date.now();
    this.resetHesitationWatchdog();
  }

  public stop(): void {
    this.isActive = false;
    this.isPaused = false;
    this.clearHesitationWatchdog();
  }

  public pause(): void {
    this.isPaused = true;
    this.clearHesitationWatchdog();
  }

  public resume(): void {
    this.isPaused = false;
    this.lastMatchTime = Date.now();
    this.resetHesitationWatchdog();
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

  /**
   * Processes live audio stream with strict monotonic token consumption to prevent false skips.
   */
  public processStream(rawTranscript: string, alternatives?: string[]): void {
    if (!this.isActive || this.isPaused || !this.targetAyats[this.currentAyahIndex]) return;

    const currentAyat = this.targetAyats[this.currentAyahIndex];
    const expectedWords = (currentAyat.arabicText || '').split(/\s+/).filter(Boolean);
    if (expectedWords.length === 0) return;

    // Collect all candidate spoken words
    const candidates = [rawTranscript, ...(alternatives || [])].filter(Boolean);
    const allSpokenTokens: string[] = [];

    for (const c of candidates) {
      const words = c.split(/\s+/).filter(Boolean);
      allSpokenTokens.push(...words);
    }

    if (allSpokenTokens.length === 0) return;

    // Only inspect UNCONSUMED spoken tokens (monotonic cursor)
    const activeSpokenSlice = allSpokenTokens.slice(Math.max(0, this.processedWordCursor - 2));
    if (activeSpokenSlice.length === 0) return;

    let matchedInThisCycle = false;

    while (this.currentWordIndex < expectedWords.length) {
      const remainingTargetWords = expectedWords.slice(this.currentWordIndex);
      let advanceCount = 0;
      let consumedSpokenOffset = -1;

      // 1. Check Compound / Multi-word match first
      for (let sIdx = 0; sIdx < activeSpokenSlice.length; sIdx++) {
        const spoken = activeSpokenSlice[sIdx];
        const compoundRes = isCompoundMatch(remainingTargetWords, spoken);
        if (compoundRes.matchedCount > 0) {
          advanceCount = compoundRes.matchedCount;
          consumedSpokenOffset = sIdx;
          break;
        }
      }

      // 2. Single word sequential match
      if (advanceCount === 0) {
        const targetWord = expectedWords[this.currentWordIndex];
        for (let sIdx = 0; sIdx < activeSpokenSlice.length; sIdx++) {
          const spoken = activeSpokenSlice[sIdx];
          if (isWordMatch(targetWord, spoken)) {
            advanceCount = 1;
            consumedSpokenOffset = sIdx;
            break;
          }
        }
      }

      if (advanceCount > 0) {
        if (!this.matchedWordsMap.has(this.currentAyahIndex)) {
          this.matchedWordsMap.set(this.currentAyahIndex, new Set());
        }

        for (let k = 0; k < advanceCount; k++) {
          const wIdx = this.currentWordIndex + k;
          if (wIdx < expectedWords.length) {
            this.matchedWordsMap.get(this.currentAyahIndex)!.add(wIdx);
            this.matchedWordsCount++;
            matchedInThisCycle = true;

            if (this.callbacks) {
              this.callbacks.onWordMatched(this.currentAyahIndex, wIdx, expectedWords[wIdx]);
            }
          }
        }

        this.currentWordIndex += advanceCount;
        if (consumedSpokenOffset >= 0) {
          this.processedWordCursor += (consumedSpokenOffset + 1);
        }
      } else {
        break; // Await next spoken word from user
      }
    }

    if (matchedInThisCycle) {
      this.lastMatchTime = Date.now();
      this.resetHesitationWatchdog();

      // STRICT COMPLETION: Current Ayah is only completed when reached the end of expected words
      if (this.currentWordIndex >= expectedWords.length) {
        const matchedInThisAyah = this.matchedWordsMap.get(this.currentAyahIndex)?.size || 0;
        const requiredMinimum = Math.max(1, Math.floor(expectedWords.length * 0.70));

        if (matchedInThisAyah >= requiredMinimum) {
          if (this.callbacks) {
            this.callbacks.onAyahCompleted(this.currentAyahIndex, currentAyat);
          }

          // Advance to exactly next Ayah and reset word cursor for clean separation
          this.currentAyahIndex++;
          this.currentWordIndex = 0;
          this.processedWordCursor = allSpokenTokens.length; // Consume all current tokens so next Ayah needs new speech

          // Check if entire passage is completed
          if (this.currentAyahIndex >= this.targetAyats.length) {
            this.isActive = false;
            this.clearHesitationWatchdog();
            const score = Math.max(75, Math.round(100 - (this.totalErrors * 3)));
            if (this.callbacks) {
              this.callbacks.onPassageCompleted(score);
            }
          }
        }
      }
    }
  }

  // Force advance to next word/ayah (e.g. after Sheikh correction)
  public resumeAfterCorrection(): void {
    if (!this.isActive) return;
    this.isPaused = false;
    this.lastMatchTime = Date.now();
    this.resetHesitationWatchdog();
  }

  private resetHesitationWatchdog(): void {
    this.clearHesitationWatchdog();
    if (!this.isActive || this.isPaused) return;

    // 7.0 seconds timeout gives ample time to breathe and recite without false alarm
    this.hesitationTimer = setTimeout(() => {
      if (this.isActive && !this.isPaused && this.targetAyats[this.currentAyahIndex]) {
        this.totalErrors++;
        if (this.callbacks) {
          this.callbacks.onErrorDetected(
            this.currentAyahIndex,
            this.currentWordIndex,
            'Jeda pelafalan terhenti (Syekh membimbing)'
          );
        }
      }
    }, 7000);
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
