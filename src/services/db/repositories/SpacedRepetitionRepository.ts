// ==============================================================================
// SPACED REPETITION HIFZ REPOSITORY
// Data Access Object for SuperMemo SM-2 Cognitive Retention Schedule
// ==============================================================================

import { DBSpacedRepetitionHifz } from '../schema';
import { supabase } from '../../supabaseClient';

export class SpacedRepetitionRepository {
  private localHifzStore: Map<string, DBSpacedRepetitionHifz> = new Map();

  public async getDueItems(userId: string): Promise<DBSpacedRepetitionHifz[]> {
    const nowIso = new Date().toISOString();

    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('spaced_repetition_hifz')
          .select('*')
          .eq('user_id', userId)
          .lte('next_review_date', nowIso)
          .order('next_review_date', { ascending: true });

        if (!error && data) {
          return data as DBSpacedRepetitionHifz[];
        }
      } catch (err) {
        console.warn('SpacedRepetitionRepository: Falling back to local store', err);
      }
    }

    // Fallback to local memory store
    const due: DBSpacedRepetitionHifz[] = [];
    const now = Date.now();
    this.localHifzStore.forEach((item) => {
      if (new Date(item.next_review_date).getTime() <= now) {
        due.push(item);
      }
    });

    return due;
  }

  public async upsertHifzItem(item: DBSpacedRepetitionHifz): Promise<boolean> {
    const key = `${item.user_id}_${item.surah_number}_${item.ayah_number}`;
    this.localHifzStore.set(key, item);

    if (supabase && item.user_id) {
      try {
        const { error } = await supabase
          .from('spaced_repetition_hifz')
          .upsert(item, { onConflict: 'user_id,surah_number,ayah_number' });
        return !error;
      } catch (err) {
        console.warn('SpacedRepetitionRepository: Cloud upsert failed', err);
        return false;
      }
    }

    return true;
  }
}

export const spacedRepetitionRepo = new SpacedRepetitionRepository();
