import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';
import { sanitizeInput } from './offlineStorage';

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
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.warn('Supabase initialization failed, falling back to local mode:', error);
  }
}

// Check if string is valid UUID
function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

// Sync Profiles to Cloud (with UUID check and sanitization)
export async function syncProfileToSupabase(profile: UserProfile): Promise<boolean> {
  if (!supabase || !isValidUUID(profile.id)) return false;
  try {
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      full_name: sanitizeInput(profile.fullName, 100),
      avatar_url: sanitizeInput(profile.avatarUrl, 500),
      hafidz_level: sanitizeInput(profile.hafidzLevel, 50),
      total_xp: Math.max(0, profile.totalXp),
      streak_count: Math.max(0, profile.streakCount),
      last_murojaah_date: sanitizeInput(profile.lastMurojaahDate, 20),
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Error syncing profile to Supabase:', err);
    return false;
  }
}

// Save Murojaah Log to Cloud (with UUID check)
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
  if (!supabase || !isValidUUID(userId)) return false;
  try {
    const { error } = await supabase.from('murojaah_logs').insert({
      user_id: userId,
      surah_number: Math.max(1, Math.min(114, surahNumber)),
      ayah_number: Math.max(1, ayahNumber),
      surah_name: sanitizeInput(surahName, 100),
      mode,
      accuracy_score: Math.max(0, Math.min(100, Math.round(accuracyScore))),
      passed: Boolean(passed),
      feedback_notes: feedbackNotes ? sanitizeInput(feedbackNotes, 500) : undefined
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('Error recording murojaah log:', err);
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
      id: sanitizeInput(row.id, 50),
      fullName: sanitizeInput(row.full_name, 100),
      avatarUrl: sanitizeInput(row.avatar_url || '', 300),
      hafidzLevel: sanitizeInput(row.hafidz_level || 'Santri Pemula', 50),
      totalXp: Math.max(0, Number(row.total_xp) || 0),
      streakCount: Math.max(0, Number(row.streak_count) || 1),
      lastMurojaahDate: sanitizeInput(row.last_murojaah_date || '', 20)
    }));
  } catch (err) {
    console.warn('Error fetching leaderboard:', err);
    return [];
  }
}
