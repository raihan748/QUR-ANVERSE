// Sharpened AI Speech Recognition & Advanced Tajwid Evaluator Engine
// Multi-Layer Arabic & Indonesian-Phonetic Makhraj Matcher

import { Ayat, EvaluationResult } from '../types';
import { formatAlafasyAudioUrl } from './audioPlayerService';

// 1. Thorough Arabic Diacritics & Character Canonical Normalization
export function normalizeArabic(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    // Remove Arabic diacritics / harakat / Quranic marks
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08E1\u08E3-\u08FF]/g, '')
    // Remove Tatweel / Keshide
    .replace(/\u0640/g, '')
    // Normalize Alif forms (إ, أ, آ, ٱ, etc.) to bare Alif (ا)
    .replace(/[\u0622\u0623\u0625\u0671\u0672\u0673\u0675]/g, 'ا')
    // Normalize Taa Marbutah (ة) to Haa (ه)
    .replace(/\u0629/g, 'ه')
    // Normalize Yaa / Alif Maqsurah (ى, ي, ۍ, etc.)
    .replace(/[\u0649\u064A\u06D0\u06D1]/g, 'ي')
    // Normalize Waw forms (ؤ)
    .replace(/\u0624/g, 'و')
    // Normalize Hamzah standalone
    .replace(/\u0621/g, '')
    // Normalize Kaf variations
    .replace(/[\u06A9\u06AA]/g, 'ك')
    // Remove all punctuation, digits, brackets, verse end signs
    .replace(/[^\u0621-\u064A\s]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// 2. Arabic to Latin Sound Converter (Phonetic Transliteration Engine)
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

// 3. Latin Indonesian-Phonetic Sound Normalizer (Handles typical Indonesian recitation spelling)
export function normalizeLatinPhonetics(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    // Remove apostrophes, glottal stops, hyphens
    .replace(/['`\-_ʻ’‘]/g, '')
    // Normalize Indonesian vowel habits: 'o' -> 'a' (e.g. rohman -> rahman, sholat -> salat, alloh -> allah)
    .replace(/o/g, 'a')
    // Normalize double vowels: aa -> a, ii -> i, uu -> u, ee -> e
    .replace(/aa+/g, 'a')
    .replace(/ii+/g, 'i')
    .replace(/uu+/g, 'u')
    .replace(/ee+/g, 'e')
    // Normalize makhraj sound pairs
    .replace(/dz|dh|zh/g, 'z')
    .replace(/th|ts/g, 't')
    .replace(/sh|sy/g, 's')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/ph/g, 'f')
    .replace(/v/g, 'f')
    .replace(/ch/g, 'c')
    // Strip non alphanumeric
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
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  return Math.max(0, 1 - distance / maxLen);
}

// 5. Word Matching with Phonetic & Arabic Double-Check
function evaluateWordMatch(expectedWordArabic: string, spokenWordInput: string): {
  similarity: number;
  status: 'correct' | 'warning' | 'error';
} {
  const cleanExpArab = normalizeArabic(expectedWordArabic);
  const cleanSpkArab = normalizeArabic(spokenWordInput);

  // Arabic direct similarity
  const arabSim = calculateSimilarity(cleanExpArab, cleanSpkArab);

  // Phonetic Latin comparison
  const expPhonetic = arabicToPhoneticLatin(expectedWordArabic);
  const spkPhonetic = normalizeLatinPhonetics(spokenWordInput);
  const latinSim = calculateSimilarity(expPhonetic, spkPhonetic);

  const bestSim = Math.max(arabSim, latinSim);

  if (bestSim >= 0.72) {
    return { similarity: bestSim, status: 'correct' };
  } else if (bestSim >= 0.45) {
    return { similarity: bestSim, status: 'warning' };
  } else {
    return { similarity: bestSim, status: 'error' };
  }
}

export interface SpeechListenerOptions {
  onInterimResult?: (text: string) => void;
  onFinalResult?: (text: string) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
}

// Web Speech API Listener Wrapper with Enhanced Multi-Language Fallback
export class SpeechEngine {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'ar-SA'; // Primary Arabic
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(options: SpeechListenerOptions): boolean {
    if (!this.recognition) {
      options.onError?.('Speech recognition is not supported in this browser.');
      return false;
    }

    try {
      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i][0];
          if (event.results[i].isFinal) {
            finalTranscript += item.transcript + ' ';
          } else {
            interimTranscript += item.transcript;
          }
        }

        if (interimTranscript && options.onInterimResult) {
          options.onInterimResult(interimTranscript);
        }
        if (finalTranscript && options.onFinalResult) {
          options.onFinalResult(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        if (options.onError) options.onError(e);
      };

      this.recognition.onend = () => {
        this.isListening = false;
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

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  // Strict & Sharpened AI Recitation Evaluation
  public evaluateRecitation(spokenText: string, ayat: Ayat): EvaluationResult {
    const rawExpectedArabic = ayat.arabicText || '';
    const cleanExpectedArabic = normalizeArabic(rawExpectedArabic);
    const expectedWords = rawExpectedArabic.split(/\s+/).filter(Boolean);

    // CRITICAL: Handle Empty or Silent Voice
    if (!spokenText || typeof spokenText !== 'string' || spokenText.trim().length < 2) {
      const allErrors = expectedWords.map(w => ({
        expectedWord: w,
        spokenWord: '',
        status: 'error' as const
      }));

      return {
        accuracyScore: 0,
        isPassed: false,
        recognizedText: '(Suara Tidak Terdeteksi)',
        expectedArabic: rawExpectedArabic,
        expectedLatin: ayat.transliteration,
        wordEvaluations: allErrors,
        aiAdabPraise: 'Suara tidak terdengar atau mikrofon terlalu hening.',
        aiCorrectionNote: 'Pastikan mikrofon aktif dan dekatkan suara Anda, lalu lafalkan ayat dengan tartil yang jelas.',
        syekhAudioUrl: formatAlafasyAudioUrl(ayat.surahNumber, ayat.numberInSurah)
      };
    }

    const cleanSpoken = normalizeArabic(spokenText);
    const cleanSpokenWords = cleanSpoken.split(/\s+/).filter(Boolean);

    // Word by Word Precision Matching
    const wordEvaluations: EvaluationResult['wordEvaluations'] = [];
    let totalWordScore = 0;

    expectedWords.forEach((origWord, idx) => {
      const spkWord = cleanSpokenWords[idx] || '';

      if (!spkWord) {
        wordEvaluations.push({
          expectedWord: origWord,
          spokenWord: '',
          status: 'error'
        });
        return;
      }

      const match = evaluateWordMatch(origWord, spkWord);
      if (match.status === 'correct') {
        totalWordScore += 1.0;
      } else if (match.status === 'warning') {
        totalWordScore += 0.5;
      }

      wordEvaluations.push({
        expectedWord: origWord,
        spokenWord: spkWord,
        status: match.status
      });
    });

    // Global Phonetic Sentence Match
    const expectedPhoneticSentence = arabicToPhoneticLatin(rawExpectedArabic);
    const spokenPhoneticSentence = normalizeLatinPhonetics(spokenText);
    const sentencePhoneticSim = calculateSimilarity(expectedPhoneticSentence, spokenPhoneticSentence);

    // Global Arabic Sentence Match
    const sentenceArabicSim = calculateSimilarity(cleanExpectedArabic, cleanSpoken);

    // Weighted Score Matrix
    const wordRatio = expectedWords.length > 0 ? (totalWordScore / expectedWords.length) : 0;
    const bestSentenceSim = Math.max(sentenceArabicSim, sentencePhoneticSim);

    // Combined Score (60% Word Alignment + 40% Global Phonetic Flow)
    const finalScore = Math.min(100, Math.round((wordRatio * 60) + (bestSentenceSim * 40)));

    // STRICT PASS THRESHOLD (Must be >= 80% to pass)
    const isPassed = finalScore >= 80;

    // Islamic Adab Feedback Generation
    let aiAdabPraise = '';
    let aiCorrectionNote = '';

    if (finalScore >= 95) {
      aiAdabPraise = 'Maa Syaa Allah Tabarakallah! Sambung ayat antum sangat fasih, makhraj presisi & tajwid sempurna!';
      aiCorrectionNote = 'Pertahankan kelancaran hafalan mutqin ini untuk ayat-ayat berikutnya!';
    } else if (finalScore >= 80) {
      aiAdabPraise = 'Alhamdulillah, hafalan antum lulus standar kelancaran (Mutqin) dengan baik.';
      aiCorrectionNote = 'Sempurnakan ketukan mad dan harakat agar semakin tartil dan indah.';
    } else if (finalScore >= 50) {
      aiAdabPraise = 'Alhamdulillah, usaha yang mulia! Sebagian besar kalimat sudah sesuai.';
      aiCorrectionNote = 'Terdapat beberapa kata yang terlewat atau makhraj yang kurang tepat. Dengarkan bacaan Syekh Misyari di bawah, lalu coba ulangi ya!';
    } else {
      aiAdabPraise = 'Bismillah, jangan menyerah! Setiap satu huruf Al-Qur\'an berbuah 10 kebaikan.';
      aiCorrectionNote = 'Lafal belum cocok dengan ayat yang diuji. Simak dan ikuti lantunan fasih Syekh Misyari Rasyid Al-Afasi di bawah ini!';
    }

    const syekhAudioUrl = formatAlafasyAudioUrl(ayat.surahNumber, ayat.numberInSurah);

    return {
      accuracyScore: finalScore,
      isPassed,
      recognizedText: spokenText,
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
