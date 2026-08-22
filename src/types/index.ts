export type NavigationTab = 
  | 'mushaf' 
  | 'tilawah'
  | 'murojaah_ai' 
  | 'simai' 
  | 'challenge' 
  | 'prayer' 
  | 'dashboard' 
  | 'download';

export interface SurahMeta {
  number: number;
  name: string; // e.g. "الفاتحة"
  latinName: string; // e.g. "Al-Fatihah"
  meaning: string; // e.g. "Pembukaan"
  ayahCount: number;
  revelationPlace: 'Makkah' | 'Madinah';
  juzStart: number;
}

export interface WordData {
  id: number;
  arabic: string;
  transliteration: string;
  meaningId: string;
}

export interface Ayat {
  numberInSurah: number;
  numberInQuran: number;
  surahNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  transliteration: string;
  juz: number;
  page?: number;
  audioUrl: string; // Mishary Rashid Alafasy URL
  words?: WordData[];
  tafsirShort?: string;
  asbabunNuzul?: string;
}

export interface EvaluationResult {
  accuracyScore: number;
  isPassed: boolean; // accuracyScore >= 80
  recognizedText: string;
  expectedArabic: string;
  expectedLatin: string;
  wordEvaluations: {
    expectedWord: string;
    spokenWord?: string;
    status: 'correct' | 'warning' | 'error';
    meaning?: string;
  }[];
  aiAdabPraise: string;
  aiCorrectionNote: string;
  syekhAudioUrl: string;
}

export type SimaiLevel = 'pemula' | 'hafidz' | 'hafidzah';
export type ChallengeMode = 'ai' | 'timer' | 'mandiri';

export interface PrayerTime {
  id: 'subuh' | 'terbit' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';
  name: string;
  arabicName: string;
  timeStr: string; // e.g. "04:48"
  timeDate: Date;
  isPassed: boolean;
  isNext: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl: string;
  hafidzLevel: string;
  totalXp: number;
  streakCount: number;
  lastMurojaahDate: string;
}

export interface WeakVerse {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  errorCount: number;
  lastTestedDate: string;
  resolved: boolean;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  note?: string;
  createdAt: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'murojaah' | 'streak' | 'mushaf' | 'challenge';
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}
