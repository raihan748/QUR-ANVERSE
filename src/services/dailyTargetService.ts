// ==============================================================================
// 1-YEAR (365 DAYS) QURAN KHATAM & TAHFIDZ ROADMAP ENGINE
// Kurikulum Target Harian Acak Terstruktur 1 Tahun Penuh (365 Hari)
// ==============================================================================

import { SURAH_LIST } from '../data/quranData';
import { addXpAndCheckStreak } from './offlineStorage';
import { UserProfile } from '../types';

export interface RoadmapDayItem {
  dayNumber: number; // 1 to 365
  date: string;      // YYYY-MM-DD
  surahNumber: number;
  surahName: string;
  surahArabic: string;
  ayahStart: number;
  ayahEnd: number;
  ayahCount: number;
  juz: number;
  isReviewDay: boolean;
  isCompleted: boolean;
}

export interface DailyQuranTarget extends RoadmapDayItem {
  completedAyahNumbers: number[];
  xpReward: number;
  rewardClaimed: boolean;
}

export interface AnnualProgress {
  totalDays: number;
  completedDaysCount: number;
  currentDayNumber: number;
  completionPercentage: number;
  startDate: string;
  endDate: string;
}

const STORAGE_KEYS = {
  DAILY_TARGET: 'quranverse_daily_target_365_v2',
  COMPLETED_DAYS: 'quranverse_completed_days_365_v2',
  START_DATE: 'quranverse_roadmap_start_date_v2'
};

export function getStartDate(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.START_DATE);
    if (saved) return saved;
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEYS.START_DATE, today);
    return today;
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Deterministic Pseudo-Random Generator with Seed
 */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generates the complete 365-Day curriculum spanning 1 full year
 */
export function generate365DayCurriculum(startDateStr?: string): RoadmapDayItem[] {
  const effectiveStart = startDateStr || getStartDate();
  const startDate = new Date(effectiveStart);
  const rng = seededRandom(20260823); // Consistent reproducible seed

  // 1. Build discrete study blocks covering all 114 Surahs
  const rawUnits: {
    surahNumber: number;
    surahName: string;
    surahArabic: string;
    ayahStart: number;
    ayahEnd: number;
    ayahCount: number;
    juz: number;
    isReviewDay: boolean;
  }[] = [];

  SURAH_LIST.forEach((s) => {
    const totalAyahs = s.ayahCount;
    // Chunk long surahs into ~15-25 ayah blocks
    if (totalAyahs <= 20) {
      rawUnits.push({
        surahNumber: s.number,
        surahName: s.latinName,
        surahArabic: s.name,
        ayahStart: 1,
        ayahEnd: totalAyahs,
        ayahCount: totalAyahs,
        juz: s.juzStart,
        isReviewDay: false
      });
    } else {
      const chunkSize = totalAyahs > 100 ? 25 : 18;
      for (let start = 1; start <= totalAyahs; start += chunkSize) {
        const end = Math.min(totalAyahs, start + chunkSize - 1);
        rawUnits.push({
          surahNumber: s.number,
          surahName: s.latinName,
          surahArabic: s.name,
          ayahStart: start,
          ayahEnd: end,
          ayahCount: end - start + 1,
          juz: s.juzStart,
          isReviewDay: false
        });
      }
    }
  });

  // 2. Add Spaced Repetition Review Units (Tikrar Akbar)
  const reviewSurahs = [67, 78, 36, 55, 56, 18, 71, 73, 75, 112];
  while (rawUnits.length < 365) {
    const revSurahNo = reviewSurahs[Math.floor(rng() * reviewSurahs.length)];
    const meta = SURAH_LIST.find((s) => s.number === revSurahNo) || SURAH_LIST[66];
    rawUnits.push({
      surahNumber: meta.number,
      surahName: `${meta.latinName} (Tikrar Muroja'ah)`,
      surahArabic: meta.name,
      ayahStart: 1,
      ayahEnd: meta.ayahCount,
      ayahCount: meta.ayahCount,
      juz: meta.juzStart,
      isReviewDay: true
    });
  }

  // 3. Deterministically Shuffle with Seed (Randomized 1-Year Curriculum)
  const shuffled = [...rawUnits].slice(0, 365);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Ensure Day 1 starts with a prominent Surah (Al-Mulk)
  const alMulkIdx = shuffled.findIndex((u) => u.surahNumber === 67);
  if (alMulkIdx > 0) {
    [shuffled[0], shuffled[alMulkIdx]] = [shuffled[alMulkIdx], shuffled[0]];
  }

  // 4. Map to Calendar Dates & Check Stored Progress
  const completedDaysMap = getCompletedDaysMap();

  return shuffled.map((unit, idx) => {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + idx);
    const dateStr = dayDate.toISOString().split('T')[0];

    return {
      dayNumber: idx + 1,
      date: dateStr,
      surahNumber: unit.surahNumber,
      surahName: unit.surahName,
      surahArabic: unit.surahArabic,
      ayahStart: unit.ayahStart,
      ayahEnd: unit.ayahEnd,
      ayahCount: unit.ayahCount,
      juz: unit.juz,
      isReviewDay: unit.isReviewDay,
      isCompleted: !!completedDaysMap[dateStr]
    };
  });
}

export function getCompletedDaysMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_DAYS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCompletedDaysMap(map: Record<string, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_DAYS, JSON.stringify(map));
  } catch (e) {
    console.warn('Error saving completed days:', e);
  }
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculates current Day index (1 to 365) based on start date
 */
export function getCurrentDayNumber(startDateStr?: string): number {
  const effectiveStart = startDateStr || getStartDate();
  const start = new Date(effectiveStart).getTime();
  const now = new Date(getTodayDateString()).getTime();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(365, diffDays + 1));
}

/**
 * Retrieves the specific daily target for today within the 365-day plan
 */
export function getDailyTarget(): DailyQuranTarget {
  const todayStr = getTodayDateString();
  const curriculum = generate365DayCurriculum();
  const currentDayNum = getCurrentDayNumber();

  // Find target for today's date or by day number
  const todayUnit = curriculum.find((c) => c.date === todayStr) || curriculum[currentDayNum - 1] || curriculum[0];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_TARGET);
    if (raw) {
      const parsed: DailyQuranTarget = JSON.parse(raw);
      if (parsed.date === todayStr) {
        return parsed;
      }
    }
  } catch {}

  const newTarget: DailyQuranTarget = {
    ...todayUnit,
    completedAyahNumbers: [],
    isCompleted: todayUnit.isCompleted,
    xpReward: todayUnit.isReviewDay ? 200 : 150,
    rewardClaimed: false
  };

  saveDailyTarget(newTarget);
  return newTarget;
}

export function saveDailyTarget(target: DailyQuranTarget): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_TARGET, JSON.stringify(target));
  } catch (e) {
    console.warn('Error saving daily target:', e);
  }
}

export function setCustomDailyTarget(surahNumber: number): DailyQuranTarget {
  const meta = SURAH_LIST.find((s) => s.number === surahNumber) || SURAH_LIST[0];
  const todayStr = getTodayDateString();
  const currentDayNum = getCurrentDayNumber();

  const newTarget: DailyQuranTarget = {
    dayNumber: currentDayNum,
    date: todayStr,
    surahNumber: meta.number,
    surahName: meta.latinName,
    surahArabic: meta.name,
    ayahStart: 1,
    ayahEnd: meta.ayahCount,
    ayahCount: meta.ayahCount,
    juz: meta.juzStart,
    isReviewDay: false,
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

    const requiredAyahs = Math.min(target.ayahCount, 5);
    if (target.completedAyahNumbers.length >= requiredAyahs && !target.isCompleted) {
      target.isCompleted = true;

      // Mark in 365-day map
      const map = getCompletedDaysMap();
      map[target.date] = true;
      saveCompletedDaysMap(map);

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

export function getAnnualProgress(): AnnualProgress {
  const map = getCompletedDaysMap();
  const completedCount = Object.keys(map).length;
  const currentDay = getCurrentDayNumber();
  const curriculum = generate365DayCurriculum();
  const start = getStartDate();
  const end = curriculum[curriculum.length - 1]?.date || '2027-08-23';

  return {
    totalDays: 365,
    completedDaysCount: completedCount,
    currentDayNumber: currentDay,
    completionPercentage: Math.round((completedCount / 365) * 100),
    startDate: start,
    endDate: end
  };
}

export function resetDailyTargetProgress(): DailyQuranTarget {
  const target = getDailyTarget();
  target.completedAyahNumbers = [];
  target.isCompleted = false;
  target.rewardClaimed = false;
  saveDailyTarget(target);
  return target;
}
