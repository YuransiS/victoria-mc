-- ==============================================================================
-- SQL Schema Setup for Victoria Mini-Course Platform / LMS
-- Run this script in your Supabase SQL Editor for the Victoria Project
-- ==============================================================================

-- 1. Create minicourse_users Table
CREATE TABLE IF NOT EXISTS public.minicourse_users (
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

CREATE INDEX IF NOT EXISTS idx_minicourse_users_telegram ON public.minicourse_users(telegram);
CREATE INDEX IF NOT EXISTS idx_minicourse_users_phone ON public.minicourse_users(phone);
CREATE INDEX IF NOT EXISTS idx_minicourse_users_chat_id ON public.minicourse_users(telegram_chat_id);

-- 2. Create minicourse_progress Table
CREATE TABLE IF NOT EXISTS public.minicourse_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.minicourse_users(id) ON DELETE CASCADE UNIQUE,
    progress_percent INTEGER NOT NULL DEFAULT 0,
    lessons JSONB NOT NULL DEFAULT '{"1":{"unlocked":true,"hwSubmitted":false,"hwStatus":"not_started"},"2":{"unlocked":false,"hwSubmitted":false,"hwStatus":"not_started"},"3":{"unlocked":false,"hwSubmitted":false,"hwStatus":"not_started"}}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_minicourse_progress_user_id ON public.minicourse_progress(user_id);

-- 3. Create minicourse_lessons_config Table
CREATE TABLE IF NOT EXISTS public.minicourse_lessons_config (
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
INSERT INTO public.minicourse_lessons_config (lesson_id, title, description, youtube_id, mindmap_url, hw_spreadsheet_url, notion_url, hw_instructions, bonus_video_title, bonus_video_youtube_id)
VALUES
(1, 'Перший ефір', 'Створення першого інвестиційного плану', 'SnyxALmvvnE', 'https://mm.tt/map/3978357799?t=cIsPiI7Jsq', 'https://docs.google.com/spreadsheets/d/1xptWzJrSQ8aW2pOyuWpSH7P-4_tOJ6i04iB2-roF9kw/edit?usp=sharing', NULL, 'ВАЖЛИВО! Починаємо роботу лише в скопійованій таблиці! Зробіть копію таблиці за посиланням нижче.', 'Покрокова інструкція заповнення таблиці', '8UeeYVfXJ40'),
(2, 'Другий ефір', 'Робота з ризиками та активами', 'l4p1F9oy3ko', 'https://mm.tt/map/3981881774?t=b3e7gO091Q', 'https://docs.google.com/spreadsheets/d/1xptWzJrSQ8aW2pOyuWpSH7P-4_tOJ6i04iB2-roF9kw/edit?usp=sharing', NULL, 'Заповніть вкладку другого уроку в створеній раніше таблиці та надішліть посилання.', 'Покрокова інструкція роботи з таблицею', 'Z-b3O13xL6E'),
(3, 'Третій ефір', 'Формування портфеля та перші угоди', '-p6u77YkyCw', 'https://mm.tt/map/3663819169?t=B79jLpx0HT', NULL, 'https://soapy-floss-c69.notion.site/33f9215c3f2180cf93e7e4f3bc7527d4', 'Виконайте фінальні кроки для завершення курсу. Відкрийте брокерський рахунок та надішліть звіт.', 'Покрокова інструкція, як придбати першу акцію', 'BB0EeSsSM4s')
ON CONFLICT (lesson_id) DO NOTHING;

-- 4. Create minicourse_gift_tokens Table
CREATE TABLE IF NOT EXISTS public.minicourse_gift_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_by_chat_id BIGINT,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_minicourse_gift_tokens_token ON public.minicourse_gift_tokens(token);

-- 5. Create minicourse_prize_codes Table
CREATE TABLE IF NOT EXISTS public.minicourse_prize_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    created_by TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    used_by_id UUID REFERENCES public.minicourse_users(id),
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_minicourse_prize_codes_code ON public.minicourse_prize_codes(code);

-- 6. Create minicourse_autologin_tokens Table
CREATE TABLE IF NOT EXISTS public.minicourse_autologin_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.minicourse_users(id) ON DELETE CASCADE,
    is_used BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_minicourse_autologin_tokens_token ON public.minicourse_autologin_tokens(token);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.minicourse_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minicourse_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minicourse_lessons_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minicourse_gift_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minicourse_prize_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minicourse_autologin_tokens ENABLE ROW LEVEL SECURITY;

-- 8. Policies for Anon / Client Access
CREATE POLICY allow_anon_select_minicourse_users ON public.minicourse_users FOR SELECT USING (true);
CREATE POLICY allow_anon_update_minicourse_users ON public.minicourse_users FOR UPDATE USING (true);
CREATE POLICY allow_anon_insert_minicourse_users ON public.minicourse_users FOR INSERT WITH CHECK (true);

CREATE POLICY allow_anon_select_minicourse_progress ON public.minicourse_progress FOR SELECT USING (true);
CREATE POLICY allow_anon_update_minicourse_progress ON public.minicourse_progress FOR UPDATE USING (true);
CREATE POLICY allow_anon_insert_minicourse_progress ON public.minicourse_progress FOR INSERT WITH CHECK (true);

CREATE POLICY allow_anon_select_minicourse_lessons_config ON public.minicourse_lessons_config FOR SELECT USING (true);
CREATE POLICY allow_anon_update_minicourse_lessons_config ON public.minicourse_lessons_config FOR UPDATE USING (true);

CREATE POLICY allow_anon_select_minicourse_gift_tokens ON public.minicourse_gift_tokens FOR SELECT USING (true);
CREATE POLICY allow_anon_update_minicourse_gift_tokens ON public.minicourse_gift_tokens FOR UPDATE USING (true);
CREATE POLICY allow_anon_insert_minicourse_gift_tokens ON public.minicourse_gift_tokens FOR INSERT WITH CHECK (true);

CREATE POLICY allow_anon_select_minicourse_prize_codes ON public.minicourse_prize_codes FOR SELECT USING (true);
CREATE POLICY allow_anon_update_minicourse_prize_codes ON public.minicourse_prize_codes FOR UPDATE USING (true);
CREATE POLICY allow_anon_insert_minicourse_prize_codes ON public.minicourse_prize_codes FOR INSERT WITH CHECK (true);

CREATE POLICY allow_anon_select_minicourse_autologin_tokens ON public.minicourse_autologin_tokens FOR SELECT USING (true);
CREATE POLICY allow_anon_update_minicourse_autologin_tokens ON public.minicourse_autologin_tokens FOR UPDATE USING (true);
CREATE POLICY allow_anon_insert_minicourse_autologin_tokens ON public.minicourse_autologin_tokens FOR INSERT WITH CHECK (true);

-- 9. Storage bucket for homework submissions
-- Note: In Supabase Dashboard, create a public bucket named 'homeworks' or execute:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('homeworks', 'homeworks', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read on homeworks"
ON storage.objects FOR SELECT
USING (bucket_id = 'homeworks');

CREATE POLICY "Allow authenticated/anon upload to homeworks"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'homeworks');

-- 10. Default Admin users
INSERT INTO public.minicourse_users (id, name, email, telegram, role, is_paid, payment_status, status)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Адміністратор Victoria', 'victoria@victoria.com', 'victoria_admin', 'admin', true, 'paid', 'active'),
    ('00000000-0000-0000-0000-000000000002', 'Адміністратор YuransiS', 'yuransis@victoria.com', 'yuransis', 'admin', true, 'paid', 'active')
ON CONFLICT (telegram) DO UPDATE 
SET role = 'admin', is_paid = true, payment_status = 'paid', status = 'active';
