-- ==============================================================================
-- FLUID PLANNER SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase project's SQL Editor (SQL Editor -> New Query)
-- ==============================================================================

-- 1. Create Blocks Table
CREATE TABLE IF NOT EXISTS public.blocks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  tag_color TEXT NOT NULL DEFAULT 'sage',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create Calendar Entries Table
CREATE TABLE IF NOT EXISTS public.calendar_entries (
  id TEXT PRIMARY KEY,
  block_id TEXT,
  title TEXT NOT NULL,
  bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  tag_color TEXT NOT NULL DEFAULT 'sage',
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes for fast calendar querying by date
CREATE INDEX IF NOT EXISTS idx_calendar_entries_date ON public.calendar_entries (date);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_date_hour ON public.calendar_entries (date, hour);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;

-- 5. Open access policies for development / personal use with Anon key
DROP POLICY IF EXISTS "Allow public access to blocks" ON public.blocks;
CREATE POLICY "Allow public access to blocks"
  ON public.blocks FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to calendar_entries" ON public.calendar_entries;
CREATE POLICY "Allow public access to calendar_entries"
  ON public.calendar_entries FOR ALL
  USING (true)
  WITH CHECK (true);
