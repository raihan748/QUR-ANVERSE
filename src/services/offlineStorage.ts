import { UserProfile, Bookmark, WeakVerse, AchievementBadge } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'alfityan_profile_v1',
  BOOKMARKS: 'alfityan_bookmarks_v1',
  WEAK_VERSES: 'alfityan_weak_verses_v1',
  MUROJAAH_HISTORY: 'alfityan_murojaah_history_v1',
  STREAK_CALENDAR: 'alfityan_streak_calendar_v1',
  ACHIEVEMENTS: 'alfityan_achievements_v1',
  OFFLINE_DOWNLOADS: 'alfityan_offline_downloads_v1',
  LAST_READ: 'alfityan_last_read_v1',
  FONT_SIZE: 'alfityan_font_size_v1',
  THEME_MODE: 'alfityan_theme_mode_v1',
};

// Default Initial Profile
export const defaultProfile: UserProfile = {
  id: 'guest_hafidz_' + Math.random().toString(36).substring(2, 9),
  fullName: 'Hafidz Al-Fityan',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  hafidzLevel: 'Santri Pemula',
  totalXp: 1250,
  streakCount: 7,
  lastMurojaahDate: new Date().toISOString().split('T')[0]
};

// Profile Storage
export function getLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      saveLocalProfile(defaultProfile);
      return defaultProfile;
    }
    return JSON.parse(raw);
  } catch {
    return defaultProfile;
  }
}

export function saveLocalProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

export function addXpAndCheckStreak(xpGain: number): UserProfile {
  const profile = getLocalProfile();
  const today = new Date().toISOString().split('T')[0];
  
  let newStreak = profile.streakCount;
  if (profile.lastMurojaahDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (profile.lastMurojaahDate === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }

  let newLevel = profile.hafidzLevel;
  const newXp = profile.totalXp + xpGain;
  if (newXp >= 10000) newLevel = 'Hafidz 30 Juz (Master)';
  else if (newXp >= 5000) newLevel = 'Hafidzah Mutqin';
  else if (newXp >= 2500) newLevel = 'Pejuang Tahfidz';
  else if (newXp >= 1000) newLevel = 'Santri Murojaah';

  const updatedProfile: UserProfile = {
    ...profile,
    totalXp: newXp,
    streakCount: newStreak,
    hafidzLevel: newLevel,
    lastMurojaahDate: today
  };

  saveLocalProfile(updatedProfile);
  recordStreakDay(today);
  return updatedProfile;
}

// Streak Calendar (Past 30 Days)
export function getStreakCalendar(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK_CALENDAR);
    if (!raw) {
      // Prepopulate past 7 days for realistic premium onboarding experience
      const initial: Record<string, boolean> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        initial[d] = true;
      }
      localStorage.setItem(STORAGE_KEYS.STREAK_CALENDAR, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function recordStreakDay(dateStr: string): void {
  const cal = getStreakCalendar();
  cal[dateStr] = true;
  localStorage.setItem(STORAGE_KEYS.STREAK_CALENDAR, JSON.stringify(cal));
}

// Bookmarks
export function getBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark[] {
  const bookmarks = getBookmarks();
  const existingIdx = bookmarks.findIndex(
    b => b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber
  );

  if (existingIdx >= 0) {
    bookmarks.splice(existingIdx, 1);
  } else {
    bookmarks.unshift({
      ...bookmark,
      id: 'bm_' + Date.now(),
      createdAt: new Date().toISOString()
    });
  }

  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  return bookmarks;
}

// Weak Verses (Ayat Lemah)
export function getWeakVerses(): WeakVerse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEAK_VERSES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordWeakVerse(verse: Omit<WeakVerse, 'id' | 'lastTestedDate'>): void {
  const list = getWeakVerses();
  const existing = list.find(v => v.surahNumber === verse.surahNumber && v.ayahNumber === verse.ayahNumber);
  
  if (existing) {
    existing.errorCount += 1;
    existing.resolved = false;
    existing.lastTestedDate = new Date().toISOString().split('T')[0];
  } else {
    list.unshift({
      ...verse,
      id: 'wv_' + Date.now(),
      lastTestedDate: new Date().toISOString().split('T')[0]
    });
  }

  localStorage.setItem(STORAGE_KEYS.WEAK_VERSES, JSON.stringify(list));
}

export function resolveWeakVerse(surahNumber: number, ayahNumber: number): void {
  const list = getWeakVerses();
  const target = list.find(v => v.surahNumber === surahNumber && v.ayahNumber === ayahNumber);
  if (target) {
    target.resolved = true;
    localStorage.setItem(STORAGE_KEYS.WEAK_VERSES, JSON.stringify(list));
  }
}

// Last Read Marker
export function getLastRead(): { surahNumber: number; ayahNumber: number; surahName: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_READ);
    return raw ? JSON.parse(raw) : { surahNumber: 1, ayahNumber: 1, surahName: 'Al-Fatihah' };
  } catch {
    return null;
  }
}

export function setLastRead(surahNumber: number, ayahNumber: number, surahName: string): void {
  localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify({ surahNumber, ayahNumber, surahName }));
}
