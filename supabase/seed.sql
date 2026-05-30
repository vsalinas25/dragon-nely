-- ============================================================
-- SEED — Run AFTER creating users in Supabase Auth dashboard
-- Replace the UUIDs below with the actual auth.users IDs
-- ============================================================

-- Insert user profiles (replace UUIDs with real auth user IDs)
-- In Supabase: Authentication > Users > copy each user's ID

/*
insert into public.users (id, name, is_admin) values
  ('00000000-0000-0000-0000-000000000001', 'Victor',   true),
  ('00000000-0000-0000-0000-000000000002', 'Maria',    false),
  ('00000000-0000-0000-0000-000000000003', 'João',     false),
  ('00000000-0000-0000-0000-000000000004', 'Ana',      false),
  ('00000000-0000-0000-0000-000000000005', 'Carlos',   false),
  ('00000000-0000-0000-0000-000000000006', 'Fernanda', false),
  ('00000000-0000-0000-0000-000000000007', 'Roberto',  false),
  ('00000000-0000-0000-0000-000000000008', 'Lucia',    false);
*/

-- Sample weekly challenge
insert into public.weekly_challenges (title, description, start_date, end_date, reward_points)
values (
  'Semana Sem Açúcar',
  'Complete 7 dias consecutivos sem consumir açúcar refinado. Isso inclui refrigerantes, doces e sobremesas.',
  current_date,
  current_date + 6,
  100
);
