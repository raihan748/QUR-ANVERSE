import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, Bookmark, WeakVerse } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your_key')
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Supabase initialization failed, falling back to local mode:', error);
  }
}

// Sync Profiles to Cloud
export async function syncProfileToSupabase(profile: UserProfile): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      full_name: profile.fullName,
      avatar_url: profile.avatarUrl,
      hafidz_level: profile.hafidzLevel,
      total_xp: profile.totalXp,
      streak_count: profile.streakCount,
      last_murojaah_date: profile.lastMurojaahDate,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error syncing profile to Supabase:', err);
    return false;
  }
}

// Save Murojaah Log to Cloud
export async function recordMurojaahLogToSupabase(
  userId: string,
  surahNumber: number,
  ayahNumber: number,
  surahName: string,
  mode: 'realtime' | 'simai' | 'challenge' | 'mushaf',
  accuracyScore: number,
  passed: boolean,
  feedbackNotes?: string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('murojaah_logs').insert({
      user_id: userId,
      surah_number: surahNumber,
      ayah_number: ayahNumber,
      surah_name: surahName,
      mode,
      accuracy_score: accuracyScore,
      passed,
      feedback_notes: feedbackNotes
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error recording murojaah log:', err);
    return false;
  }
}

// Fetch Global Leaderboard
export async function fetchLeaderboardFromSupabase(): Promise<UserProfile[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, hafidz_level, total_xp, streak_count, last_murojaah_date')
      .order('total_xp', { ascending: false })
      .limit(20);

    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      hafidzLevel: row.hafidz_level,
      totalXp: row.total_xp,
      streakCount: row.streak_count,
      lastMurojaahDate: row.last_murojaah_date
    }));
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
}
