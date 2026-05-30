-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- Run AFTER schema.sql
-- ============================================================

-- Enable RLS on every table
alter table public.users              enable row level security;
alter table public.daily_checkins     enable row level security;
alter table public.weight_logs        enable row level security;
alter table public.measurements       enable row level security;
alter table public.checkups           enable row level security;
alter table public.streaks            enable row level security;
alter table public.points             enable row level security;
alter table public.badges             enable row level security;
alter table public.weekly_challenges  enable row level security;
alter table public.challenge_completions enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.activity_feed      enable row level security;

-- ============================================================
-- USERS
-- Everyone in the group can read all profiles
-- Users can only update their own profile
-- ============================================================
create policy "users: read all"
  on public.users for select
  using (auth.uid() is not null);

create policy "users: update own"
  on public.users for update
  using (auth.uid() = id);

-- ============================================================
-- DAILY CHECK-INS
-- Read all, write only own
-- ============================================================
create policy "checkins: read all"
  on public.daily_checkins for select
  using (auth.uid() is not null);

create policy "checkins: insert own"
  on public.daily_checkins for insert
  with check (auth.uid() = user_id);

create policy "checkins: update own"
  on public.daily_checkins for update
  using (auth.uid() = user_id);

-- ============================================================
-- WEIGHT LOGS
-- ============================================================
create policy "weight: read all"
  on public.weight_logs for select
  using (auth.uid() is not null);

create policy "weight: insert own"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);

create policy "weight: update own"
  on public.weight_logs for update
  using (auth.uid() = user_id);

create policy "weight: delete own"
  on public.weight_logs for delete
  using (auth.uid() = user_id);

-- ============================================================
-- MEASUREMENTS
-- ============================================================
create policy "measurements: read all"
  on public.measurements for select
  using (auth.uid() is not null);

create policy "measurements: insert own"
  on public.measurements for insert
  with check (auth.uid() = user_id);

create policy "measurements: update own"
  on public.measurements for update
  using (auth.uid() = user_id);

-- ============================================================
-- CHECKUPS
-- ============================================================
create policy "checkups: read all"
  on public.checkups for select
  using (auth.uid() is not null);

create policy "checkups: insert own"
  on public.checkups for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- STREAKS
-- ============================================================
create policy "streaks: read all"
  on public.streaks for select
  using (auth.uid() is not null);

create policy "streaks: update own"
  on public.streaks for update
  using (auth.uid() = user_id);

-- ============================================================
-- POINTS
-- ============================================================
create policy "points: read all"
  on public.points for select
  using (auth.uid() is not null);

create policy "points: update own"
  on public.points for update
  using (auth.uid() = user_id);

-- ============================================================
-- BADGES
-- ============================================================
create policy "badges: read all"
  on public.badges for select
  using (auth.uid() is not null);

create policy "badges: insert own"
  on public.badges for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- WEEKLY CHALLENGES (read all; admin writes via service role)
-- ============================================================
create policy "challenges: read all"
  on public.weekly_challenges for select
  using (auth.uid() is not null);

-- Admin-only insert/update enforced by checking is_admin in users table
create policy "challenges: admin insert"
  on public.weekly_challenges for insert
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "challenges: admin update"
  on public.weekly_challenges for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "challenges: admin delete"
  on public.weekly_challenges for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- ============================================================
-- CHALLENGE COMPLETIONS
-- ============================================================
create policy "completions: read all"
  on public.challenge_completions for select
  using (auth.uid() is not null);

create policy "completions: insert own"
  on public.challenge_completions for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- PUSH SUBSCRIPTIONS (private — own only)
-- ============================================================
create policy "push: own only"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- ACTIVITY FEED
-- ============================================================
create policy "feed: read all"
  on public.activity_feed for select
  using (auth.uid() is not null);

create policy "feed: insert own"
  on public.activity_feed for insert
  with check (auth.uid() = user_id);
