-- ==============================================================================
-- QURANVERSE - ENTERPRISE BACKEND SCHEMA & HIGH-PERFORMANCE PL/pgSQL ENGINES
-- Mission-Critical Architecture for APSI (Analisis & Perancangan Sistem Informasi)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & COMPOSITE DOMAIN TYPES
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE hafidz_role_enum AS ENUM ('santri_pemula', 'santri_madya', 'hafidz_mutqin', 'ustadz_penguji', 'auditor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE murojaah_mode_enum AS ENUM ('realtime_ai', 'simai_lisan', 'sambung_ayat_arena', 'mushaf_tilawah');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE tikrar_phase_enum AS ENUM ('Bi_An_Nazhar', 'Bi_Al_Ghaib', 'Sabqi', 'Manzil');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE bkt_status_enum AS ENUM ('belum_hafal', 'tahap_latihan', 'hampir_mutqin', 'mutqin_sempurna');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------------------------
-- 2. TABLE: PROFILES (Enterprise Hafidz Identity & Gamification Core)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'Hafidz Al-Qur''an' CHECK (char_length(full_name) BETWEEN 2 AND 100),
    avatar_url TEXT DEFAULT '' CHECK (char_length(avatar_url) <= 500),
    role hafidz_role_enum DEFAULT 'santri_pemula' NOT NULL,
    total_xp BIGINT DEFAULT 0 CHECK (total_xp >= 0),
    hafidz_level INTEGER DEFAULT 1 CHECK (hafidz_level BETWEEN 1 AND 100),
    streak_count INTEGER DEFAULT 1 CHECK (streak_count >= 0),
    max_streak_record INTEGER DEFAULT 1 CHECK (max_streak_record >= 0),
    last_murojaah_date DATE DEFAULT CURRENT_DATE,
    preferred_reciter TEXT DEFAULT 'Mishary_Rashid_Alafasy' CHECK (char_length(preferred_reciter) <= 100),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. TABLE: SPACED_REPETITION_ITEMS (Modified SuperMemo SM-2 & Tikrar 1-5-10)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.spaced_repetition_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number SMALLINT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number SMALLINT NOT NULL CHECK (ayah_number >= 1),
    repetition_count INTEGER DEFAULT 0 CHECK (repetition_count >= 0),
    easiness_factor NUMERIC(4, 3) DEFAULT 2.500 CHECK (easiness_factor >= 1.300),
    interval_days INTEGER DEFAULT 1 CHECK (interval_days >= 1),
    next_review_date DATE DEFAULT CURRENT_DATE NOT NULL,
    last_reviewed_date DATE DEFAULT CURRENT_DATE NOT NULL,
    retention_probability NUMERIC(4, 3) DEFAULT 1.000 CHECK (retention_probability BETWEEN 0 AND 1),
    tikrar_phase tikrar_phase_enum DEFAULT 'Bi_An_Nazhar' NOT NULL,
    consecutive_successes INTEGER DEFAULT 0 CHECK (consecutive_successes >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_sm2_user_ayah UNIQUE (user_id, surah_number, ayah_number)
);

-- ------------------------------------------------------------------------------
-- 4. TABLE: BAYESIAN_KNOWLEDGE_STATES (BKT Student Mastery Estimator)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bayesian_knowledge_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number SMALLINT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number SMALLINT NOT NULL CHECK (ayah_number >= 1),
    mastery_probability NUMERIC(5, 4) DEFAULT 0.1200 CHECK (mastery_probability BETWEEN 0.0000 AND 1.0000),
    practice_count INTEGER DEFAULT 0 CHECK (practice_count >= 0),
    status bkt_status_enum DEFAULT 'belum_hafal' NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_bkt_user_ayah UNIQUE (user_id, surah_number, ayah_number)
);

-- ------------------------------------------------------------------------------
-- 5. PARTITIONED TABLE: MUROJAAH_TELEMETRY_LOGS (Range Partitioning by Date)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.murojaah_telemetry_logs (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number SMALLINT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number SMALLINT NOT NULL CHECK (ayah_number >= 1),
    surah_name TEXT NOT NULL CHECK (char_length(surah_name) <= 100),
    mode murojaah_mode_enum NOT NULL,
    accuracy_score SMALLINT NOT NULL CHECK (accuracy_score BETWEEN 0 AND 100),
    passed BOOLEAN NOT NULL DEFAULT false,
    duration_ms INTEGER DEFAULT 0 CHECK (duration_ms >= 0),
    acoustic_dtw_distance NUMERIC(5, 4),
    recognized_text TEXT,
    feedback_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Partitions for 2025, 2026, 2027, and Future
CREATE TABLE IF NOT EXISTS public.murojaah_telemetry_logs_2025 PARTITION OF public.murojaah_telemetry_logs
    FOR VALUES FROM ('2025-01-01 00:00:00+00') TO ('2026-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS public.murojaah_telemetry_logs_2026 PARTITION OF public.murojaah_telemetry_logs
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS public.murojaah_telemetry_logs_2027 PARTITION OF public.murojaah_telemetry_logs
    FOR VALUES FROM ('2027-01-01 00:00:00+00') TO ('2028-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS public.murojaah_telemetry_logs_default PARTITION OF public.murojaah_telemetry_logs DEFAULT;

-- ------------------------------------------------------------------------------
-- 6. TABLE: CRYPTOGRAPHIC_AUDIT_LEDGER (HMAC Merkle-Chained Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cryptographic_audit_ledger (
    block_index BIGINT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (char_length(event_type) <= 50),
    payload_json JSONB NOT NULL,
    previous_block_hash CHAR(64) NOT NULL,
    nonce CHAR(8) NOT NULL,
    current_block_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. PL/pgSQL STORED PROCEDURE: RECALCULATE SM-2 REPETITION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_calculate_sm2_repetition(
    p_user_id UUID,
    p_surah SMALLINT,
    p_ayah SMALLINT,
    p_score SMALLINT
)
RETURNS TABLE (
    new_interval INTEGER,
    new_ef NUMERIC(4,3),
    new_next_date DATE,
    new_phase tikrar_phase_enum
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_q SMALLINT;
    v_delta_ef NUMERIC(4,3);
    v_current_ef NUMERIC(4,3) := 2.500;
    v_rep_count INTEGER := 0;
    v_interval INTEGER := 1;
    v_consecutive INTEGER := 0;
    v_phase tikrar_phase_enum := 'Bi_An_Nazhar';
BEGIN
    -- Derive quality grade (0 to 5)
    IF p_score >= 95 THEN v_q := 5;
    ELSIF p_score >= 85 THEN v_q := 4;
    ELSIF p_score >= 75 THEN v_q := 3;
    ELSIF p_score >= 60 THEN v_q := 2;
    ELSIF p_score >= 40 THEN v_q := 1;
    ELSE v_q := 0;
    END IF;

    -- Fetch existing state if exists
    SELECT easiness_factor, repetition_count, interval_days, consecutive_successes, tikrar_phase
    INTO v_current_ef, v_rep_count, v_interval, v_consecutive, v_phase
    FROM public.spaced_repetition_items
    WHERE user_id = p_user_id AND surah_number = p_surah AND ayah_number = p_ayah;

    -- Compute delta EF: 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
    v_delta_ef := (0.1 - (5 - v_q) * (0.08 + (5 - v_q) * 0.02))::NUMERIC(4,3);
    v_current_ef := GREATEST(1.300, v_current_ef + v_delta_ef);

    IF v_q < 3 THEN
        v_rep_count := 0;
        v_interval := 1;
        v_consecutive := 0;
        v_phase := 'Bi_An_Nazhar';
    ELSE
        v_rep_count := v_rep_count + 1;
        v_consecutive := v_consecutive + 1;

        IF v_rep_count = 1 THEN
            v_interval := 1;
            v_phase := 'Bi_Al_Ghaib';
        ELSIF v_rep_count = 2 THEN
            v_interval := 6;
            v_phase := 'Sabqi';
        ELSE
            v_interval := ROUND(v_interval * v_current_ef);
            IF v_consecutive >= 5 THEN
                v_phase := 'Manzil';
            END IF;
        END IF;
    END IF;

    -- Upsert Spaced Repetition Item
    INSERT INTO public.spaced_repetition_items (
        user_id, surah_number, ayah_number, repetition_count, easiness_factor,
        interval_days, next_review_date, last_reviewed_date, tikrar_phase, consecutive_successes, updated_at
    )
    VALUES (
        p_user_id, p_surah, p_ayah, v_rep_count, v_current_ef,
        v_interval, CURRENT_DATE + v_interval, CURRENT_DATE, v_phase, v_consecutive, now()
    )
    ON CONFLICT (user_id, surah_number, ayah_number)
    DO UPDATE SET
        repetition_count = v_rep_count,
        easiness_factor = v_current_ef,
        interval_days = v_interval,
        next_review_date = CURRENT_DATE + v_interval,
        last_reviewed_date = CURRENT_DATE,
        tikrar_phase = v_phase,
        consecutive_successes = v_consecutive,
        updated_at = now();

    RETURN QUERY SELECT v_interval, v_current_ef, (CURRENT_DATE + v_interval)::DATE, v_phase;
END;
$$;

-- ------------------------------------------------------------------------------
-- 8. PL/pgSQL FUNCTION: RECURSIVE CTE HAFIDZ COMPETENCY MATRIX GENERATOR
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_generate_hafidz_competency_matrix(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_result JSONB;
BEGIN
    WITH user_bkt AS (
        SELECT 
            surah_number,
            ayah_number,
            mastery_probability,
            status
        FROM public.bayesian_knowledge_states
        WHERE user_id = p_user_id
    ),
    stats AS (
        SELECT
            COUNT(*) AS total_practiced,
            COUNT(*) FILTER (WHERE mastery_probability >= 0.80) AS total_mutqin,
            ROUND(AVG(mastery_probability), 4) AS avg_mastery
        FROM user_bkt
    )
    SELECT jsonb_build_object(
        'userId', p_user_id,
        'totalPracticedAyahs', COALESCE(s.total_practiced, 0),
        'totalMutqinAyahs', COALESCE(s.total_mutqin, 0),
        'averageMasteryProbability', COALESCE(s.avg_mastery, 0.0),
        'generatedAt', now()
    ) INTO v_result
    FROM stats s;

    RETURN v_result;
END;
$$;

-- ------------------------------------------------------------------------------
-- 9. MATERIALIZED VIEW & INDEXES FOR HIGH-THROUGHPUT LEADERBOARDS
-- ------------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_hafidz_leaderboard AS
SELECT 
    p.id AS user_id,
    p.full_name,
    p.avatar_url,
    p.hafidz_level,
    p.total_xp,
    p.streak_count,
    DENSE_RANK() OVER (ORDER BY p.total_xp DESC, p.streak_count DESC) AS rank_position,
    COUNT(DISTINCT l.surah_number) AS surahs_practiced_count,
    COUNT(l.id) FILTER (WHERE l.passed = true) AS successful_murojaah_count
FROM public.profiles p
LEFT JOIN public.murojaah_telemetry_logs l ON l.user_id = p.id
GROUP BY p.id, p.full_name, p.avatar_url, p.hafidz_level, p.total_xp, p.streak_count;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_leaderboard_user ON public.mv_hafidz_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_mv_leaderboard_rank ON public.mv_hafidz_leaderboard(rank_position);

-- High-Performance Search Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm ON public.profiles USING GIN (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON public.murojaah_telemetry_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_user_ayah ON public.murojaah_telemetry_logs(user_id, surah_number, ayah_number);

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaced_repetition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bayesian_knowledge_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.murojaah_telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cryptographic_audit_ledger ENABLE ROW LEVEL SECURITY;

-- Profiles: Public viewable, owner can update
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles modifiable by owner" ON public.profiles;
CREATE POLICY "Profiles modifiable by owner" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Spaced Repetition: Owner only
DROP POLICY IF EXISTS "SM2 items owner only" ON public.spaced_repetition_items;
CREATE POLICY "SM2 items owner only" ON public.spaced_repetition_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- BKT States: Owner only
DROP POLICY IF EXISTS "BKT states owner only" ON public.bayesian_knowledge_states;
CREATE POLICY "BKT states owner only" ON public.bayesian_knowledge_states FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Telemetry Logs: Owner viewable & insertable
DROP POLICY IF EXISTS "Telemetry logs owner only" ON public.murojaah_telemetry_logs;
CREATE POLICY "Telemetry logs owner only" ON public.murojaah_telemetry_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cryptographic Audit Ledger: Owner and Public Verifiable
DROP POLICY IF EXISTS "Audit ledger public verifiable" ON public.cryptographic_audit_ledger;
CREATE POLICY "Audit ledger public verifiable" ON public.cryptographic_audit_ledger FOR SELECT USING (true);
