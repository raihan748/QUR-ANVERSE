// ==============================================================================
// DAILY QURAN TARGET & KHATAM ROUTINE SERVICE
// Target Tilawah & Muroja'ah Harian dengan Gamifikasi, Streak & XP Bonus
// ==============================================================================

import { SURAH_LIST, CORE_AYATS_DB } from '../data/quranData';
import { addXpAndCheckStreak, getLocalProfile } from './offlineStorage';
import { UserProfile } from '../types';

export interface DailyQuranTarget {
  date: string; // YYYY-MM-DD
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  ayahCount: number;
  juz: number;
  completedAyahNumbers: number[];
  isCompleted: boolean;
  xpReward: number;
  rewardClaimed: boolean;
}

const STORAGE_KEY = 'quranverse_daily_target_v1';

// Recommended Daily Target Rotation (Juz 29 & 30 + Surat Pilihan)
const RECOMMENDED_DAILY_SURAHS = [
  67, // Al-Mulk (Day 1)
  78, // An-Naba' (Day 2)
  56, // Al-Waqi'ah (Day 3)
  36, // Ya-Sin (Day 4)
  55, // Ar-Rahman (Day 5)
  18, // Al-Kahf (Day 6)
  71, // Nuh (Day 7)
  73, // Al-Muzzammil (Day 8)
  75, // Al-Qiyamah (Day 9)
  79, // An-Nazi'at (Day 10)
  87, // Al-A'la (Day 11)
  93, // Ad-Duha (Day 12)
  94, // Asy-Syarh (Day 13)
  97, // Al-Qadr (Day 14)
  112 // Al-Ikhlas & Mu'awwidzatain (Day 15)
];

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDefaultTargetForToday(): DailyQuranTarget {
  const today = getTodayDateString();
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const surahNo = RECOMMENDED_DAILY_SURAHS[dayOfYear % RECOMMENDED_DAILY_SURAHS.length] || 67;
  const meta = SURAH_LIST.find((s) => s.number === surahNo) || SURAH_LIST[66];

  return {
    date: today,
    surahNumber: meta.number,
    surahName: meta.latinName,
    surahArabic: meta.name,
    ayahCount: meta.ayahCount,
    juz: meta.juzStart,
    completedAyahNumbers: [],
    isCompleted: false,
    xpReward: 150,
    rewardClaimed: false
  };
}

export function getDailyTarget(): DailyQuranTarget {
  const today = getTodayDateString();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DailyQuranTarget = JSON.parse(raw);
      if (parsed.date === today) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading daily target:', e);
  }

  // Generate fresh target for today
  const fresh = getDefaultTargetForToday();
  saveDailyTarget(fresh);
  return fresh;
}

export function saveDailyTarget(target: DailyQuranTarget): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
  } catch (e) {
    console.warn('Error saving daily target:', e);
  }
}

export function setCustomDailyTarget(surahNumber: number): DailyQuranTarget {
  const meta = SURAH_LIST.find((s) => s.number === surahNumber) || SURAH_LIST[0];
  const today = getTodayDateString();

  const newTarget: DailyQuranTarget = {
    date: today,
    surahNumber: meta.number,
    surahName: meta.latinName,
    surahArabic: meta.name,
    ayahCount: meta.ayahCount,
    juz: meta.juzStart,
    completedAyahNumbers: [],
    isCompleted: false,
    xpReward: 150,
    rewardClaimed: false
  };

  saveDailyTarget(newTarget);
  return newTarget;
}

export function markAyahCompletedInTarget(
  surahNumber: number,
  ayahNumber: number,
  onTargetAchieved?: (updatedProfile: UserProfile, target: DailyQuranTarget) => void
): DailyQuranTarget {
  const target = getDailyTarget();

  if (target.surahNumber === surahNumber) {
    if (!target.completedAyahNumbers.includes(ayahNumber)) {
      target.completedAyahNumbers.push(ayahNumber);
    }

    // Check if user completed all ayahs of today's target (or at least 5 ayahs for long surahs)
    const requiredAyahs = Math.min(target.ayahCount, 10);
    if (target.completedAyahNumbers.length >= requiredAyahs && !target.isCompleted) {
      target.isCompleted = true;
      if (!target.rewardClaimed) {
        target.rewardClaimed = true;
        const updatedProfile = addXpAndCheckStreak(target.xpReward);
        if (onTargetAchieved) {
          onTargetAchieved(updatedProfile, target);
        }
      }
    }

    saveDailyTarget(target);
  }

  return target;
}

export function resetDailyTargetProgress(): DailyQuranTarget {
  const target = getDailyTarget();
  target.completedAyahNumbers = [];
  target.isCompleted = false;
  target.rewardClaimed = false;
  saveDailyTarget(target);
  return target;
}
