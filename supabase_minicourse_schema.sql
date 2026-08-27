-- ==============================================================================
-- SQL Schema Setup for Victoria Mini-Course Platform / LMS
-- Run this script in your Supabase SQL Editor for the Victoria Project
-- ==============================================================================

-- 1. Create victoria_mc_minicourse_users Table
CREATE TABLE IF NOT EXISTS public.victoria_mc_minicourse_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    telegram TEXT UNIQUE,
    telegram_chat_id BIGINT UNIQUE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    is_paid BOOLEAN NOT NULL DEFAULT false,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    device_uuids TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active',
    access_opened_at TIMESTAMPTZ,
    homework_access_opened_at TIMESTAMPTZ,
    terms_accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_victoria_mc_minicourse_users_telegram ON public.victoria_mc_minicourse_users(telegram);
CREATE INDEX IF NOT EXISTS idx_victoria_mc_minicourse_users_phone ON public.victoria_mc_minicourse_users(phone);
CREATE INDEX IF NOT EXISTS idx_victoria_mc_minicourse_users_chat_id ON public.victoria_mc_minicourse_users(telegram_chat_id);

-- 2. Create victoria_mc_minicourse_progress Table
CREATE TABLE IF NOT EXISTS public.victoria_mc_minicourse_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.victoria_mc_minicourse_users(id) ON DELETE CASCADE UNIQUE,
    progress_percent INTEGER NOT NULL DEFAULT 0,
    lessons JSONB NOT NULL DEFAULT '{"1":{"unlocked":true,"hwSubmitted":false,"hwStatus":"not_started"},"2":{"unlocked":false,"hwSubmitted":false,"hwStatus":"not_started"},"3":{"unlocked":false,"hwSubmitted":false,"hwStatus":"not_started"}}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_victoria_mc_minicourse_progress_user_id ON public.victoria_mc_minicourse_progress(user_id);

-- 3. Create victoria_mc_minicourse_lessons_config Table
CREATE TABLE IF NOT EXISTS public.victoria_mc_minicourse_lessons_config (
    lesson_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    youtube_id_new TEXT,
    links JSONB NOT NULL DEFAULT '[]'::jsonb,
    description_under_video TEXT,
    sort_order INTEGER DEFAULT 1,
    mindmap_url TEXT,
    hw_spreadsheet_url TEXT,
    notion_url TEXT,
    hw_instructions TEXT,
    bonus_video_title TEXT,
    bonus_video_youtube_id TEXT,
    bonus_video_youtube_id_new TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default lessons config if not present
INSERT INTO public.victoria_mc_minicourse_lessons_config (lesson_id, title, description, youtube_id, mindmap_url, hw_spreadsheet_url, notion_url, hw_instructions, bonus_video_title, bonus_video_youtube_id)
VALUES
(1, 'Урок 1: Вступний модуль', 'Перший практичний крок та план дій', 'SnyxALmvvnE', 'https://mm.tt/map/3978357799?t=cIsPiI7Jsq', 'https://docs.google.com/spreadsheets/d/1xptWzJrSQ8aW2pOyuWpSH7P-4_tOJ6i04iB2-roF9kw/edit?usp=sharing', NULL, 'ВАЖЛИВО! Починаємо роботу лише в скопійованій таблиці! Зробіть копію таблиці за посиланням нижче.', 'Покрокова інструкція заповнення таблиці', '8UeeYVfXJ40')
ON CONFLICT (lesson_id) DO NOTHING;

-- 4. Create victoria_mc_minicourse_gift_tokens Table
CREATE TABLE IF NOT EXISTS public.victoria_mc_minicourse_gift_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_by_chat_id BIGINT,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_victoria_mc_minicourse_gift_tokens_token ON public.victoria_mc_minicourse_gift_tokens(token);

-- 5. Create victoria_mc_minicourse_prize_codes Table
CREATE TABLE IF NOT EXISTS public.victoria_mc_minicourse_prize_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    created_by TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    used_by_id UUID REFERENCES public.victoria_mc_minicourse_users(id),
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_victoria_mc_minicourse_prize_codes_code ON public.victoria_mc_minicourse_prize_codes(code);

-- 6. Create victoria_mc_minicourse_autologin_tokens Table
CREATE TABLE IF NOT EXISTS public.victoria_mc_minicourse_autologin_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.victoria_mc_minicourse_users(id) ON DELETE CASCADE,
    is_used BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_victoria_mc_minicourse_autologin_tokens_token ON public.victoria_mc_minicourse_autologin_tokens(token);

-- 7. Create victoria_mc_minicourse_bot_templates Table
CREATE TABLE IF NOT EXISTS public.victoria_mc_minicourse_bot_templates (
    id TEXT PRIMARY KEY,
    event_key TEXT NOT NULL,
    lesson_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    message_text TEXT NOT NULL,
    buttons JSONB DEFAULT '[]'::jsonb,
    is_enabled BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Create victoria_mc_minicourse_bot_config Table
CREATE TABLE IF NOT EXISTS public.victoria_mc_minicourse_bot_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    bot_token TEXT,
    bot_username TEXT,
    bot_name TEXT,
    bot_photo_url TEXT,
    webhook_url TEXT,
    is_connected BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Create victoria_mc_minicourse_broadcasts Table
CREATE TABLE IF NOT EXISTS public.victoria_mc_minicourse_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_text TEXT NOT NULL,
    button_text TEXT,
    button_url TEXT,
    target_audience TEXT NOT NULL DEFAULT 'all',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.victoria_mc_minicourse_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victoria_mc_minicourse_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victoria_mc_minicourse_lessons_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victoria_mc_minicourse_gift_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victoria_mc_minicourse_prize_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victoria_mc_minicourse_autologin_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victoria_mc_minicourse_bot_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victoria_mc_minicourse_bot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victoria_mc_minicourse_broadcasts ENABLE ROW LEVEL SECURITY;

-- 11. Policies for Anon / Client Access
CREATE POLICY allow_anon_select_victoria_mc_minicourse_users ON public.victoria_mc_minicourse_users FOR SELECT USING (true);
CREATE POLICY allow_anon_update_victoria_mc_minicourse_users ON public.victoria_mc_minicourse_users FOR UPDATE USING (true);
CREATE POLICY allow_anon_insert_victoria_mc_minicourse_users ON public.victoria_mc_minicourse_users FOR INSERT WITH CHECK (true);

CREATE POLICY allow_anon_select_victoria_mc_minicourse_progress ON public.victoria_mc_minicourse_progress FOR SELECT USING (true);
CREATE POLICY allow_anon_update_victoria_mc_minicourse_progress ON public.victoria_mc_minicourse_progress FOR UPDATE USING (true);
CREATE POLICY allow_anon_insert_victoria_mc_minicourse_progress ON public.victoria_mc_minicourse_progress FOR INSERT WITH CHECK (true);

CREATE POLICY allow_anon_select_victoria_mc_minicourse_lessons_config ON public.victoria_mc_minicourse_lessons_config FOR SELECT USING (true);
CREATE POLICY allow_anon_update_victoria_mc_minicourse_lessons_config ON public.victoria_mc_minicourse_lessons_config FOR UPDATE USING (true);

CREATE POLICY allow_anon_select_victoria_mc_minicourse_gift_tokens ON public.victoria_mc_minicourse_gift_tokens FOR SELECT USING (true);
CREATE POLICY allow_anon_update_victoria_mc_minicourse_gift_tokens ON public.victoria_mc_minicourse_gift_tokens FOR UPDATE USING (true);
CREATE POLICY allow_anon_insert_victoria_mc_minicourse_gift_tokens ON public.victoria_mc_minicourse_gift_tokens FOR INSERT WITH CHECK (true);

CREATE POLICY allow_anon_select_victoria_mc_minicourse_prize_codes ON public.victoria_mc_minicourse_prize_codes FOR SELECT USING (true);
CREATE POLICY allow_anon_update_victoria_mc_minicourse_prize_codes ON public.victoria_mc_minicourse_prize_codes FOR UPDATE USING (true);
CREATE POLICY allow_anon_insert_victoria_mc_minicourse_prize_codes ON public.victoria_mc_minicourse_prize_codes FOR INSERT WITH CHECK (true);

CREATE POLICY allow_anon_select_victoria_mc_minicourse_autologin_tokens ON public.victoria_mc_minicourse_autologin_tokens FOR SELECT USING (true);
CREATE POLICY allow_anon_update_victoria_mc_minicourse_autologin_tokens ON public.victoria_mc_minicourse_autologin_tokens FOR UPDATE USING (true);
CREATE POLICY allow_anon_insert_victoria_mc_minicourse_autologin_tokens ON public.victoria_mc_minicourse_autologin_tokens FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow full access to victoria_mc_minicourse_bot_templates" ON public.victoria_mc_minicourse_bot_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to victoria_mc_minicourse_bot_config" ON public.victoria_mc_minicourse_bot_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to victoria_mc_minicourse_broadcasts" ON public.victoria_mc_minicourse_broadcasts FOR ALL USING (true) WITH CHECK (true);

-- 12. Storage bucket for homework submissions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('homeworks', 'homeworks', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read on homeworks"
ON storage.objects FOR SELECT
USING (bucket_id = 'homeworks');

CREATE POLICY "Allow authenticated/anon upload to homeworks"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'homeworks');
