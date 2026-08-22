-- ==============================================================================
-- QURANVERSE - DATABASE SCHEMA & SECURITY HARDENING FOR SUPABASE
-- The Ultimate AI Qur'an & Murojaah Platform
-- ==============================================================================

-- 1. Table Profiles (Profil Pengguna & Statistik Hafalan)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'Hafidz Al-Qur''an' CHECK (char_length(full_name) <= 100),
    avatar_url TEXT DEFAULT '' CHECK (char_length(avatar_url) <= 500),
    hafidz_level TEXT DEFAULT 'Santri Pemula' CHECK (char_length(hafidz_level) <= 50),
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    streak_count INTEGER DEFAULT 1 CHECK (streak_count >= 0),
    last_murojaah_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table Murojaah Logs (Riwayat Setoran & Uji AI)
CREATE TABLE IF NOT EXISTS public.murojaah_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INTEGER NOT NULL CHECK (ayah_number >= 1),
    surah_name TEXT NOT NULL CHECK (char_length(surah_name) <= 100),
    mode TEXT NOT NULL CHECK (mode IN ('realtime', 'simai', 'challenge', 'mushaf')),
    accuracy_score INTEGER NOT NULL DEFAULT 0 CHECK (accuracy_score BETWEEN 0 AND 100),
    passed BOOLEAN NOT NULL DEFAULT false,
    feedback_notes TEXT CHECK (char_length(feedback_notes) <= 1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table Bookmarks & Tadabbur Notes
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INTEGER NOT NULL CHECK (ayah_number >= 1),
    surah_name TEXT NOT NULL CHECK (char_length(surah_name) <= 100),
    ayah_text TEXT NOT NULL,
    translation TEXT,
    note TEXT CHECK (char_length(note) <= 2000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table Weak Verses (Pelacak Ayat Lemah untuk Metode Tikrar 1-5-10)
CREATE TABLE IF NOT EXISTS public.weak_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INTEGER NOT NULL CHECK (ayah_number >= 1),
    surah_name TEXT NOT NULL CHECK (char_length(surah_name) <= 100),
    error_count INTEGER DEFAULT 1 CHECK (error_count >= 1),
    last_error_date DATE DEFAULT CURRENT_DATE,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, surah_number, ayah_number)
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.murojaah_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weak_verses ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (Least Privilege Principle)
-- Profiles: Public can read for Leaderboard, owner can update
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Murojaah Logs: Owner only
DROP POLICY IF EXISTS "Users can view own murojaah logs" ON public.murojaah_logs;
CREATE POLICY "Users can view own murojaah logs" ON public.murojaah_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own murojaah logs" ON public.murojaah_logs;
CREATE POLICY "Users can insert own murojaah logs" ON public.murojaah_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookmarks: Owner only
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Weak Verses: Owner only
DROP POLICY IF EXISTS "Users can manage own weak verses" ON public.weak_verses;
CREATE POLICY "Users can manage own weak verses" ON public.weak_verses
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Trigger to automatically create profile on Auth Signup (Hardened Security Definer with search_path)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id, 
    SUBSTRING(COALESCE(new.raw_user_meta_data->>'full_name', 'Hafidz Baru'), 1, 100), 
    SUBSTRING(COALESCE(new.raw_user_meta_data->>'avatar_url', ''), 1, 500)
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
