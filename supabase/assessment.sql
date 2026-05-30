-- ============================================================
-- INITIAL ASSESSMENT
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assessments (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null unique references public.users(id) on delete cascade,
  current_weight_kg    decimal(5,2) not null,
  desired_weight_kg    decimal(5,2) not null,
  height_cm            decimal(5,1) not null,
  age                  int not null,
  daily_water_l        decimal(3,1) not null,  -- e.g. 1.5 litres
  activity_level       int not null check (activity_level between 1 and 5),
  completed_at         timestamptz not null default now()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessments: read all"    ON public.assessments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "assessments: insert own"  ON public.assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "assessments: update own"  ON public.assessments FOR UPDATE USING (auth.uid() = user_id);

-- Add onboarding_completed flag to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
