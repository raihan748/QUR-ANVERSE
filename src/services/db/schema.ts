// ==============================================================================
// TYPE-SAFE DATABASE SCHEMA & ENTITY DEFINITIONS
// Enterprise ORM / Repository Models for QURANVERSE
// ==============================================================================

export interface DBProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  hafidz_level: string;
  total_xp: number;
  streak_count: number;
  last_murojaah_date?: string;
  preferences?: {
    theme?: string;
    reciter?: string;
    mushaf_mode?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface DBMurojaahLog {
  id?: string;
  user_id: string;
  surah_number: number;
  ayah_number: number;
  surah_name: string;
  mode: 'realtime' | 'simai' | 'challenge' | 'mushaf';
  accuracy_score: number;
  passed: boolean;
  duration_seconds?: number;
  feedback_notes?: string;
  spectral_dtw_score?: number;
  created_at?: string;
}

export interface DBSpacedRepetitionHifz {
  id?: string;
  user_id: string;
  surah_number: number;
  ayah_number: number;
  repetition_number: number;
  easiness_factor: number;
  interval_days: number;
  retention_probability: number;
  last_review_date: string;
  next_review_date: string;
  mastery_status: 'new' | 'learning' | 'reviewing' | 'mastered';
}

export interface DBBookmark {
  id?: string;
  user_id: string;
  page_number: number;
  surah_number: number;
  ayah_number: number;
  label?: string;
  color_tag?: string;
  notes?: string;
  created_at?: string;
}

export interface DBDailyTarget {
  id?: string;
  user_id: string;
  target_date: string;
  pages_target: number;
  pages_read: number;
  is_completed: boolean;
  xp_reward: number;
  created_at?: string;
}
