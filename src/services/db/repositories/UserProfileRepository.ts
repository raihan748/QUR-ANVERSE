// ==============================================================================
// USER PROFILE REPOSITORY
// Data Access Object for Gamification & User Identity
// ==============================================================================

import { DBProfile } from '../schema';
import { supabase } from '../../supabaseClient';
import { getLocalProfile, saveLocalProfile } from '../../offlineStorage';
import { UserProfile } from '../../../types';

export class UserProfileRepository {
  public async getProfile(userId: string): Promise<UserProfile | null> {
    // 1. Try Cloud Database
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            fullName: data.full_name,
            avatarUrl: data.avatar_url || '',
            hafidzLevel: data.hafidz_level,
            totalXp: data.total_xp,
            streakCount: data.streak_count,
            lastMurojaahDate: data.last_murojaah_date || ''
          };
        }
      } catch (err) {
        console.warn('UserProfileRepository: Falling back to offline store', err);
      }
    }

    // 2. Fallback to Local Offline Storage
    return getLocalProfile();
  }

  public async saveProfile(profile: UserProfile): Promise<boolean> {
    // Save to local offline store first (Optimistic UI)
    saveLocalProfile(profile);

    // Sync to Cloud Supabase
    if (supabase) {
      try {
        const payload: DBProfile = {
          id: profile.id,
          full_name: profile.fullName,
          avatar_url: profile.avatarUrl,
          hafidz_level: profile.hafidzLevel,
          total_xp: profile.totalXp,
          streak_count: profile.streakCount,
          last_murojaah_date: profile.lastMurojaahDate,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('profiles').upsert(payload);
        return !error;
      } catch (err) {
        console.warn('UserProfileRepository: Cloud sync failed', err);
        return false;
      }
    }

    return true;
  }

  public async getLeaderboard(limit = 25): Promise<UserProfile[]> {
    if (!supabase) {
      const local = getLocalProfile();
      return local ? [local] : [];
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return data.map((d) => ({
        id: d.id,
        fullName: d.full_name,
        avatarUrl: d.avatar_url || '',
        hafidzLevel: d.hafidz_level,
        totalXp: d.total_xp,
        streakCount: d.streak_count,
        lastMurojaahDate: d.last_murojaah_date || ''
      }));
    } catch (err) {
      console.warn('UserProfileRepository: Failed fetching leaderboard', err);
      return [];
    }
  }
}

export const userProfileRepo = new UserProfileRepository();
