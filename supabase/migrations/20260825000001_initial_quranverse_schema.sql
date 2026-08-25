-- ==============================================================================
-- QURANVERSE ENTERPRISE DATABASE SCHEMA (PostgreSQL / Supabase)
-- Standard Production DDL with Row Level Security (RLS) & Performance Indexes
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PROFILES & GAMIFICATION
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL DEFAULT 'Hafidz Quran',
    avatar_url TEXT,
    hafidz_level VARCHAR(50) NOT NULL DEFAULT 'Pemula (Juz 30)',
    total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
    streak_count INTEGER NOT NULL DEFAULT 0 CHECK (streak_count >= 0),
    last_murojaah_date DATE,
    preferences JSONB DEFAULT '{"theme": "system", "reciter": "misyari_rasyid", "mushaf_mode": "15_lines"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2. SURAHS & AYAT CANONICAL METADATA
-- ==========================================
CREATE TABLE IF NOT EXISTS public.surahs (
    number INTEGER PRIMARY KEY CHECK (number BETWEEN 1 AND 114),
    name_arabic VARCHAR(100) NOT NULL,
    name_latin VARCHAR(100) NOT NULL,
    name_translation VARCHAR(150) NOT NULL,
    ayah_count INTEGER NOT NULL CHECK (ayah_count > 0),
    revelation_place VARCHAR(20) NOT NULL CHECK (revelation_place IN ('Makkah', 'Madinah')),
    juz_start INTEGER NOT NULL CHECK (juz_start BETWEEN 1 AND 30),
    page_start INTEGER NOT NULL CHECK (page_start BETWEEN 1 AND 604)
);

CREATE TABLE IF NOT EXISTS public.ayat (
    id BIGSERIAL PRIMARY KEY,
    surah_number INTEGER NOT NULL REFERENCES public.surahs(number) ON DELETE CASCADE,
    ayah_number INTEGER NOT NULL CHECK (ayah_number > 0),
    page_number INTEGER NOT NULL CHECK (page_number BETWEEN 1 AND 604),
    juz_number INTEGER NOT NULL CHECK (juz_number BETWEEN 1 AND 30),
    text_uthmani TEXT NOT NULL,
    text_clean TEXT NOT NULL,
    translation_id TEXT NOT NULL,
    is_sajdah BOOLEAN NOT NULL DEFAULT FALSE,
    sajdah_number INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_surah_ayah UNIQUE (surah_number, ayah_number)
);

-- ==========================================
-- 3. GHARIB SPECIAL RECITATIONS (30 JUZ)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.gharib_readings (
    id VARCHAR(50) PRIMARY KEY,
    surah_number INTEGER NOT NULL REFERENCES public.surahs(number) ON DELETE CASCADE,
    ayah_number INTEGER NOT NULL,
    page_number INTEGER NOT NULL CHECK (page_number BETWEEN 1 AND 604),
    word_text VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('imalah', 'isymam', 'tashil', 'naql', 'saktah', 'ibdal', 'sajdah', 'sufr', 'izhar_muthlaq', 'idgham_khusus', 'nun_wiqayah')),
    title VARCHAR(150) NOT NULL,
    pengertian_bahasa TEXT NOT NULL,
    pengertian_istilah TEXT NOT NULL,
    description TEXT NOT NULL,
    cara_baca TEXT NOT NULL,
    tips TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 4. MUROJAAH & AI RECITATION LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.murojaah_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INTEGER NOT NULL CHECK (ayah_number > 0),
    surah_name VARCHAR(100) NOT NULL,
    mode VARCHAR(30) NOT NULL CHECK (mode IN ('realtime', 'simai', 'challenge', 'mushaf')),
    accuracy_score NUMERIC(5, 2) NOT NULL CHECK (accuracy_score BETWEEN 0.00 AND 100.00),
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    duration_seconds INTEGER DEFAULT 0,
    feedback_notes TEXT,
    spectral_dtw_score NUMERIC(4, 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 5. SPACED REPETITION & COGNITIVE HIFZ (SuperMemo SM-2)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.spaced_repetition_hifz (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INTEGER NOT NULL CHECK (ayah_number > 0),
    repetition_number INTEGER NOT NULL DEFAULT 0 CHECK (repetition_number >= 0),
    easiness_factor NUMERIC(4, 2) NOT NULL DEFAULT 2.50 CHECK (easiness_factor >= 1.30),
    interval_days INTEGER NOT NULL DEFAULT 0 CHECK (interval_days >= 0),
    retention_probability NUMERIC(4, 3) NOT NULL DEFAULT 1.000,
    last_review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mastery_status VARCHAR(30) NOT NULL DEFAULT 'learning' CHECK (mastery_status IN ('new', 'learning', 'reviewing', 'mastered')),
    CONSTRAINT uq_user_surah_ayah_hifz UNIQUE (user_id, surah_number, ayah_number)
);

-- ==========================================
-- 6. BOOKMARKS & LAST READ MUSHAF
-- ==========================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL CHECK (page_number BETWEEN 1 AND 604),
    surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INTEGER NOT NULL CHECK (ayah_number > 0),
    label VARCHAR(100),
    color_tag VARCHAR(20) DEFAULT '#0B4627',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reading_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL CHECK (page_number BETWEEN 1 AND 604),
    surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INTEGER NOT NULL CHECK (ayah_number > 0),
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 7. DAILY TARGETS & KHATAM PLANS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.daily_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_date DATE NOT NULL DEFAULT CURRENT_DATE,
    pages_target INTEGER NOT NULL DEFAULT 2 CHECK (pages_target > 0),
    pages_read INTEGER NOT NULL DEFAULT 0 CHECK (pages_read >= 0),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_daily_target UNIQUE (user_id, target_date)
);

-- ==========================================
-- 8. CRYPTOGRAPHIC AUDIT & MERKLE LEDGER
-- ==========================================
CREATE TABLE IF NOT EXISTS public.audit_security_ledger (
    id BIGSERIAL PRIMARY KEY,
    operation VARCHAR(50) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sha256_seal VARCHAR(64) NOT NULL,
    merkle_parent_hash VARCHAR(64),
    client_ip VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR HIGH-PERFORMANCE QUERIES (B-TREE & GIN)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_ayat_page ON public.ayat(page_number);
CREATE INDEX IF NOT EXISTS idx_ayat_surah_ayah ON public.ayat(surah_number, ayah_number);
CREATE INDEX IF NOT EXISTS idx_gharib_page ON public.gharib_readings(page_number);
CREATE INDEX IF NOT EXISTS idx_murojaah_user ON public.murojaah_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_murojaah_accuracy ON public.murojaah_logs(accuracy_score);
CREATE INDEX IF NOT EXISTS idx_hifz_user_next_review ON public.spaced_repetition_hifz(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id, page_number);
CREATE INDEX IF NOT EXISTS idx_daily_targets_user_date ON public.daily_targets(user_id, target_date);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(total_xp DESC);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.murojaah_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaced_repetition_hifz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ayat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gharib_readings ENABLE ROW LEVEL SECURITY;

-- Public Read for Canonical Quran Data
CREATE POLICY "Public read surahs" ON public.surahs FOR SELECT USING (true);
CREATE POLICY "Public read ayat" ON public.ayat FOR SELECT USING (true);
CREATE POLICY "Public read gharib_readings" ON public.gharib_readings FOR SELECT USING (true);

-- User Profiles: Anyone can view leaderboard, users can edit their own
CREATE POLICY "Public view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User Specific Data: Full CRUD for owner only
CREATE POLICY "Users access own murojaah_logs" ON public.murojaah_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own hifz" ON public.spaced_repetition_hifz FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own reading_history" ON public.reading_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own daily_targets" ON public.daily_targets FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- STORED PROCEDURES & TRIGGERS
-- ==========================================

-- 1. Auto Create Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, hafidz_level, total_xp, streak_count)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Hafidz Quran'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'Pemula (Juz 30)',
        0,
        0
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Auto Increment XP and Update Streak on Passing Murojaah
CREATE OR REPLACE FUNCTION public.handle_murojaah_completion()
RETURNS TRIGGER AS $$
DECLARE
    earned_xp INTEGER := 0;
BEGIN
    IF NEW.passed THEN
        earned_xp := ROUND(NEW.accuracy_score / 2); -- 100% accuracy = 50 XP
        
        UPDATE public.profiles
        SET 
            total_xp = total_xp + earned_xp,
            streak_count = CASE 
                WHEN last_murojaah_date = CURRENT_DATE - INTERVAL '1 day' THEN streak_count + 1
                WHEN last_murojaah_date = CURRENT_DATE THEN streak_count
                ELSE 1
            END,
            last_murojaah_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_murojaah_logged ON public.murojaah_logs;
CREATE TRIGGER on_murojaah_logged
    AFTER INSERT ON public.murojaah_logs
    FOR EACH ROW EXECUTE FUNCTION public.handle_murojaah_completion();
