-- ============================================================
-- FAMILIA SAUDE — Full Database Schema
-- Run this in your Supabase SQL Editor (project > SQL Editor)
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Users (extends auth.users)
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  avatar_url  text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Daily check-ins (one per user per day)
create table if not exists public.daily_checkins (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.users(id) on delete cascade,
  date           date not null,
  sugar_free     boolean not null default false,
  low_carb       boolean not null default false,
  exercised      boolean not null default false,
  drank_water    boolean not null default false,
  points_earned  int not null default 0,
  created_at     timestamptz not null default now(),
  unique(user_id, date)
);

-- Weight logs
create table if not exists public.weight_logs (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  weight_kg  decimal(5,2) not null,
  logged_at  timestamptz not null default now()
);

-- Body measurements
create table if not exists public.measurements (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  waist_cm   decimal(5,1),
  hip_cm     decimal(5,1),
  logged_at  timestamptz not null default now()
);

-- Medical checkups
create table if not exists public.checkups (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  checkup_type  text not null, -- blood_work, medical_visit, dental, eye_exam, etc.
  completed_at  date not null,
  notes         text,
  created_at    timestamptz not null default now()
);

-- Streak tracking
create table if not exists public.streaks (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null unique references public.users(id) on delete cascade,
  current_streak    int not null default 0,
  longest_streak    int not null default 0,
  last_checkin_date date
);

-- Points ledger
create table if not exists public.points (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null unique references public.users(id) on delete cascade,
  total_points    int not null default 0,
  monthly_points  int not null default 0,
  last_reset_at   timestamptz not null default now()
);

-- Badges
create table if not exists public.badges (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  badge_type  text not null,
  earned_at   timestamptz not null default now(),
  unique(user_id, badge_type)
);

-- Weekly challenges
create table if not exists public.weekly_challenges (
  id             uuid primary key default uuid_generate_v4(),
  title          text not null,
  description    text not null,
  start_date     date not null,
  end_date       date not null,
  reward_points  int not null default 50,
  created_at     timestamptz not null default now()
);

-- Challenge completions
create table if not exists public.challenge_completions (
  id           uuid primary key default uuid_generate_v4(),
  challenge_id uuid not null references public.weekly_challenges(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(challenge_id, user_id)
);

-- Push notification subscriptions
create table if not exists public.push_subscriptions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  subscription  jsonb not null,
  created_at    timestamptz not null default now(),
  unique(user_id)
);

-- Activity feed (denormalized for speed)
create table if not exists public.activity_feed (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  event_type   text not null, -- checkin, badge, challenge, weight_loss
  message      text not null,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_daily_checkins_user_date
  on public.daily_checkins(user_id, date desc);

create index if not exists idx_weight_logs_user_date
  on public.weight_logs(user_id, logged_at desc);

create index if not exists idx_measurements_user_date
  on public.measurements(user_id, logged_at desc);

create index if not exists idx_badges_user
  on public.badges(user_id);

create index if not exists idx_activity_feed_created
  on public.activity_feed(created_at desc);

create index if not exists idx_challenge_completions_challenge
  on public.challenge_completions(challenge_id);

-- ============================================================
-- AUTO-PROVISION STREAK + POINTS ON USER INSERT
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.streaks(user_id) values (new.id)
    on conflict (user_id) do nothing;
  insert into public.points(user_id) values (new.id)
    on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_user_created on public.users;
create trigger on_user_created
  after insert on public.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- FUNCTION: calculate check-in points
-- ============================================================

create or replace function public.calculate_checkin_points(
  p_sugar_free   boolean,
  p_low_carb     boolean,
  p_exercised    boolean,
  p_drank_water  boolean
)
returns int
language plpgsql
as $$
declare
  v_points int := 0;
  v_count  int := 0;
begin
  if p_sugar_free  then v_points := v_points + 10; v_count := v_count + 1; end if;
  if p_low_carb    then v_points := v_points + 8;  v_count := v_count + 1; end if;
  if p_exercised   then v_points := v_points + 10; v_count := v_count + 1; end if;
  if p_drank_water then v_points := v_points + 5;  v_count := v_count + 1; end if;
  -- All 4 bonus
  if v_count = 4   then v_points := v_points + 15; end if;
  return v_points;
end;
$$;

-- ============================================================
-- FUNCTION: apply daily penalty (called by cron)
-- ============================================================

create or replace function public.apply_daily_penalty(p_date date default current_date - 1)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user record;
begin
  for v_user in
    select u.id
    from public.users u
    where not exists (
      select 1 from public.daily_checkins dc
      where dc.user_id = u.id and dc.date = p_date
    )
  loop
    update public.points
    set total_points   = greatest(0, total_points - 5),
        monthly_points = greatest(0, monthly_points - 5)
    where user_id = v_user.id;

    update public.streaks
    set current_streak = 0
    where user_id = v_user.id
      and (last_checkin_date is null or last_checkin_date < p_date);
  end loop;
end;
$$;

-- ============================================================
-- REALTIME — enable for leaderboard tables
-- ============================================================

alter publication supabase_realtime add table public.points;
alter publication supabase_realtime add table public.streaks;
alter publication supabase_realtime add table public.daily_checkins;
alter publication supabase_realtime add table public.activity_feed;
