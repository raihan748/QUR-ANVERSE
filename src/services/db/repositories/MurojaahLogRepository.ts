// ==============================================================================
// MUROJAAH LOG REPOSITORY
// Data Access Object for AI Recitation Sessions & Accuracy History
// ==============================================================================

import { DBMurojaahLog } from '../schema';
import { supabase } from '../../supabaseClient';
import { saveMurojaahHistory, getMurojaahHistory } from '../../offlineStorage';
import { MurojaahSessionLog } from '../../../types';

export class MurojaahLogRepository {
  public async logSession(log: DBMurojaahLog): Promise<boolean> {
    // 1. Save locally for instant availability
    const sessionLog: MurojaahSessionLog = {
      id: log.id || `local_${Date.now()}`,
      surahNumber: log.surah_number,
      ayahNumber: log.ayah_number,
      surahName: log.surah_name,
      mode: log.mode,
      accuracyScore: log.accuracy_score,
      passed: log.passed,
      timestamp: log.created_at || new Date().toISOString(),
      feedbackNotes: log.feedback_notes
    };
    saveMurojaahHistory(sessionLog);

    // 2. Persist to Cloud Supabase
    if (supabase && log.user_id) {
      try {
        const { error } = await supabase.from('murojaah_logs').insert({
          user_id: log.user_id,
          surah_number: log.surah_number,
          ayah_number: log.ayah_number,
          surah_name: log.surah_name,
          mode: log.mode,
          accuracy_score: log.accuracy_score,
          passed: log.passed,
          duration_seconds: log.duration_seconds || 0,
          feedback_notes: log.feedback_notes,
          spectral_dtw_score: log.spectral_dtw_score
        });
        return !error;
      } catch (err) {
        console.warn('MurojaahLogRepository: Failed to save to cloud', err);
        return false;
      }
    }

    return true;
  }

  public async getRecentLogs(userId: string, limit = 50): Promise<MurojaahSessionLog[]> {
    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('murojaah_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            surahNumber: d.surah_number,
            ayahNumber: d.ayah_number,
            surahName: d.surah_name,
            mode: d.mode,
            accuracyScore: Number(d.accuracy_score),
            passed: d.passed,
            timestamp: d.created_at,
            feedbackNotes: d.feedback_notes
          }));
        }
      } catch (err) {
        console.warn('MurojaahLogRepository: Failed fetching cloud logs', err);
      }
    }

    return getMurojaahHistory();
  }
}

export const murojaahLogRepo = new MurojaahLogRepository();
