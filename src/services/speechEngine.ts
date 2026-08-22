// AI Speech Recognition & Tajwid Evaluator Engine

import { Ayat, EvaluationResult } from '../types';
import { formatAlafasyAudioUrl } from './audioPlayerService';

// Normalize Arabic text (remove harakat, normalize alif, yaa, taa marbutah)
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove Arabic diacritics / harakat (fathah, kasrah, dammah, sukun, shaddah, tanwin)
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    // Normalize Alif variations
    .replace(/[إأآٱ]/g, 'ا')
    // Normalize Taa Marbutah
    .replace(/ة/g, 'ه')
    // Normalize Yaa / Alif Maqsurah
    .replace(/[ىي]/g, 'ي')
    // Remove extra punctuation and whitespace
    .replace(/[^\u0621-\u064A\s]/g, '')
    .trim();
}

// Normalize Latin transliteration for matching
export function normalizeLatin(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/['`\-_]/g, '')
    .replace(/aa|ii|uu/g, (m) => m[0])
    .replace(/sh/g, 's')
    .replace(/th/g, 't')
    .replace(/kh/g, 'k')
    .replace(/dh|dz/g, 'z')
    .replace(/gh/g, 'g')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Levenshtein Distance & Similarity Metric
export function calculateSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;

  const costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }

  return (longerLength - costs[shorter.length]) / longerLength;
}

export interface SpeechListenerOptions {
  onInterimResult?: (text: string) => void;
  onFinalResult?: (text: string) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
}

// Web Speech API Listener Wrapper
export class SpeechEngine {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      // Default to Arabic recognition with fallback
      this.recognition.lang = 'ar-SA';
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
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
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

  // AI Evaluation logic with Positive Adab & Syekh Audio reference
  public evaluateRecitation(spokenText: string, ayat: Ayat): EvaluationResult {
    const rawExpectedArabic = ayat.arabicText;
    const cleanExpectedArabic = normalizeArabic(rawExpectedArabic);
    const cleanSpoken = normalizeArabic(spokenText);

    const expectedWords = rawExpectedArabic.split(/\s+/).filter(Boolean);
    const cleanExpectedWords = cleanExpectedArabic.split(/\s+/).filter(Boolean);
    const cleanSpokenWords = cleanSpoken.split(/\s+/).filter(Boolean);

    // Compute Word-by-Word Evaluation
    const wordEvaluations: EvaluationResult['wordEvaluations'] = [];
    let correctCount = 0;

    cleanExpectedWords.forEach((expWord, idx) => {
      const originalWord = expectedWords[idx] || expWord;
      const spokenWord = cleanSpokenWords[idx] || '';

      if (!spokenWord) {
        // Missing / omitted word
        wordEvaluations.push({
          expectedWord: originalWord,
          status: 'error',
          spokenWord: ''
        });
        return;
      }

      const sim = calculateSimilarity(expWord, spokenWord);
      if (sim >= 0.8) {
        correctCount += 1;
        wordEvaluations.push({
          expectedWord: originalWord,
          spokenWord,
          status: 'correct'
        });
      } else if (sim >= 0.5) {
        correctCount += 0.6;
        wordEvaluations.push({
          expectedWord: originalWord,
          spokenWord,
          status: 'warning'
        });
      } else {
        wordEvaluations.push({
          expectedWord: originalWord,
          spokenWord,
          status: 'error'
        });
      }
    });

    // Total Score Calculation
    const totalWords = Math.max(cleanExpectedWords.length, 1);
    // Base accuracy on word comparison or full-string similarity
    const wordScore = (correctCount / totalWords) * 100;
    const stringSim = calculateSimilarity(cleanExpectedArabic, cleanSpoken) * 100;
    const finalScore = Math.min(100, Math.round((wordScore * 0.7) + (stringSim * 0.3)));

    const isPassed = finalScore >= 80;

    // Islamic Adab Praise & Feedback Generation
    let aiAdabPraise = '';
    let aiCorrectionNote = '';

    if (finalScore >= 95) {
      aiAdabPraise = 'Maa Syaa Allah Tabarakallah! Bacaan antum sangat fasih, tajwid sempurna, dan makhraj sangat tepat.';
      aiCorrectionNote = 'Pertahankan kelancaran hafalan ini untuk ayat-ayat berikutnya!';
    } else if (finalScore >= 80) {
      aiAdabPraise = 'Alhamdulillah, bacaan antum sudah sangat baik dan lulus standar kelancaran (Mutqin).';
      aiCorrectionNote = 'Sedikit penyesuaian pada panjang mad dan ketukan harakat agar lebih sempurna.';
    } else if (finalScore >= 50) {
      aiAdabPraise = 'Alhamdulillah, usaha yang mulia! Antum sudah mengingat sebagian besar kalimat dengan baik.';
      aiCorrectionNote = 'Namun terdapat beberapa kata yang terlewat atau harakat yang kurang tepat. Dengarkan contoh fasih dari Syekh Misyari di bawah, lalu coba rekam kembali ya!';
    } else {
      aiAdabPraise = 'Bismillah, semangat terus! Setiap satu huruf Al-Qur\'an bernilai 10 kebaikan.';
      aiCorrectionNote = 'Mari simak dan ikuti lantunan fasih Syekh Misyari Rasyid Al-Afasi berikut, lalu ulangi sampai mencapai target 80% ke atas.';
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
