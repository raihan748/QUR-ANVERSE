import { UserProfile, Bookmark, WeakVerse } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'quranverse_profile_v2',
  BOOKMARKS: 'quranverse_bookmarks_v2',
  WEAK_VERSES: 'quranverse_weak_verses_v2',
  STREAK_CALENDAR: 'quranverse_streak_calendar_v2',
  LAST_READ: 'quranverse_last_read_v2',
};

// Input Sanitizer to prevent XSS / malicious injection
export function sanitizeInput(input: string, maxLength: number = 200): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // strip dangerous html bracket characters
    .substring(0, maxLength);
}

// Default Initial Profile (Strictly 0 for fresh user progression)
export const defaultProfile: UserProfile = {
  id: 'guest_hafidz_' + Math.random().toString(36).substring(2, 9),
  fullName: 'Hafidz QURANVERSE',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  hafidzLevel: 'Santri Pemula',
  totalXp: 0,
  streakCount: 0,
  lastMurojaahDate: new Date().toISOString().split('T')[0]
};

// Profile Storage with Safe Parsing & Type Validation
export function getLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      saveLocalProfile(defaultProfile);
      return defaultProfile;
    }
    const parsed = JSON.parse(raw);

    // Auto-migrate if user had old mock 1250 XP
    let xp = Math.max(0, Number(parsed.totalXp) || 0);
    let streak = Math.max(0, Number(parsed.streakCount) || 0);
    if (xp === 1250 && streak === 7) {
      xp = 0;
      streak = 0;
    }

    return {
      id: sanitizeInput(parsed.id || defaultProfile.id, 50),
      fullName: sanitizeInput(parsed.fullName || defaultProfile.fullName, 100),
      avatarUrl: sanitizeInput(parsed.avatarUrl || defaultProfile.avatarUrl, 300),
      hafidzLevel: sanitizeInput(parsed.hafidzLevel || defaultProfile.hafidzLevel, 50),
      totalXp: xp,
      streakCount: streak,
      lastMurojaahDate: sanitizeInput(parsed.lastMurojaahDate || defaultProfile.lastMurojaahDate, 20)
    };
  } catch {
    return defaultProfile;
  }
}

export function saveLocalProfile(profile: UserProfile): void {
  try {
    const sanitized: UserProfile = {
      id: sanitizeInput(profile.id, 50),
      fullName: sanitizeInput(profile.fullName, 100),
      avatarUrl: sanitizeInput(profile.avatarUrl, 300),
      hafidzLevel: sanitizeInput(profile.hafidzLevel, 50),
      totalXp: Math.max(0, Number(profile.totalXp) || 0),
      streakCount: Math.max(0, Number(profile.streakCount) || 1),
      lastMurojaahDate: sanitizeInput(profile.lastMurojaahDate, 20)
    };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('Storage quota or error saving profile:', e);
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
  const newXp = profile.totalXp + Math.max(0, Math.min(1000, xpGain)); // capped gain per session
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

// Streak Calendar
export function getStreakCalendar(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK_CALENDAR);
    if (!raw) {
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
  try {
    const cal = getStreakCalendar();
    const cleanDate = sanitizeInput(dateStr, 20);
    cal[cleanDate] = true;
    localStorage.setItem(STORAGE_KEYS.STREAK_CALENDAR, JSON.stringify(cal));
  } catch (e) {
    console.warn(e);
  }
}

// Bookmarks (Max 200 bookmarks quota)
export function getBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark[] {
  try {
    const bookmarks = getBookmarks();
    const cleanSurahNo = Math.max(1, Math.min(114, Number(bookmark.surahNumber) || 1));
    const cleanAyahNo = Math.max(1, Number(bookmark.ayahNumber) || 1);

    const existingIdx = bookmarks.findIndex(
      b => b.surahNumber === cleanSurahNo && b.ayahNumber === cleanAyahNo
    );

    if (existingIdx >= 0) {
      bookmarks.splice(existingIdx, 1);
    } else {
      if (bookmarks.length >= 200) {
        bookmarks.pop(); // Remove oldest to preserve memory
      }
      bookmarks.unshift({
        id: 'bm_' + Date.now(),
        surahNumber: cleanSurahNo,
        ayahNumber: cleanAyahNo,
        surahName: sanitizeInput(bookmark.surahName, 100),
        arabicText: bookmark.arabicText || '',
        translation: bookmark.translation || '',
        note: bookmark.note ? sanitizeInput(bookmark.note, 500) : undefined,
        createdAt: new Date().toISOString()
      });
    }

    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return bookmarks;
  } catch (e) {
    console.warn('Error saving bookmark:', e);
    return [];
  }
}

// Weak Verses (Max 150 items)
export function getWeakVerses(): WeakVerse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEAK_VERSES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordWeakVerse(verse: Omit<WeakVerse, 'id' | 'lastTestedDate'>): void {
  try {
    const list = getWeakVerses();
    const cleanSurahNo = Math.max(1, Math.min(114, Number(verse.surahNumber) || 1));
    const cleanAyahNo = Math.max(1, Number(verse.ayahNumber) || 1);

    const existing = list.find(v => v.surahNumber === cleanSurahNo && v.ayahNumber === cleanAyahNo);
    
    if (existing) {
      existing.errorCount = Math.min(99, existing.errorCount + 1);
      existing.resolved = false;
      existing.lastTestedDate = new Date().toISOString().split('T')[0];
    } else {
      if (list.length >= 150) {
        list.pop();
      }
      list.unshift({
        id: 'wv_' + Date.now(),
        surahNumber: cleanSurahNo,
        ayahNumber: cleanAyahNo,
        surahName: sanitizeInput(verse.surahName, 100),
        arabicText: verse.arabicText || '',
        translation: verse.translation || '',
        errorCount: 1,
        resolved: false,
        lastTestedDate: new Date().toISOString().split('T')[0]
      });
    }

    localStorage.setItem(STORAGE_KEYS.WEAK_VERSES, JSON.stringify(list));
  } catch (e) {
    console.warn('Error recording weak verse:', e);
  }
}

export function resolveWeakVerse(surahNumber: number, ayahNumber: number): void {
  try {
    const list = getWeakVerses();
    const target = list.find(v => v.surahNumber === surahNumber && v.ayahNumber === ayahNumber);
    if (target) {
      target.resolved = true;
      localStorage.setItem(STORAGE_KEYS.WEAK_VERSES, JSON.stringify(list));
    }
  } catch (e) {
    console.warn(e);
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
  try {
    localStorage.setItem(
      STORAGE_KEYS.LAST_READ, 
      JSON.stringify({ 
        surahNumber: Math.max(1, Math.min(114, surahNumber)), 
        ayahNumber: Math.max(1, ayahNumber), 
        surahName: sanitizeInput(surahName, 100) 
      })
    );
  } catch (e) {
    console.warn(e);
  }
}
