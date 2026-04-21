-- ══════════════════════════════════════════════════════════════════
-- GOOSE FACTOR — Progress Tracker Schema
-- Run once in the Supabase SQL editor.
--
-- Tables:
--   workout_sessions  — one row per training day
--   workout_entries   — exercises logged for a session
--   diet_entries      — food/macros logged per day (optional meal tag)
--   body_metrics      — weight / bodyfat over time
--
-- Every table has a user_id column linked to auth.users + RLS that
-- guarantees each user can only see/write their own rows.
-- ══════════════════════════════════════════════════════════════════

-- ── Sessions ─────────────────────────────────────────────────────
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null default current_date,
  name text,
  notes text,
  session_type text,         -- strength | hypertrophy | metabolic | pump | mixed | deload
  created_at timestamptz not null default now()
);
create index if not exists workout_sessions_user_date_idx
  on public.workout_sessions (user_id, session_date desc);

-- ── Entries (exercises within a session) ─────────────────────────
create table if not exists public.workout_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  muscle_group text not null,
  category text not null,    -- strength | metabolic | hypertrophy | isolation
  exercise_name text not null,
  sets integer,
  reps text,                 -- string because "3-5" / "AMRAP" are valid
  weight_kg numeric,
  rpe numeric,
  intensity text,            -- Goose: high | medium | low (DUP slot)
  pap_pair text,             -- bisérie partner exercise name, if any
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists workout_entries_session_idx on public.workout_entries(session_id);
create index if not exists workout_entries_user_idx on public.workout_entries(user_id);
create index if not exists workout_entries_exercise_idx
  on public.workout_entries (user_id, exercise_name, created_at desc);

-- ── Diet ─────────────────────────────────────────────────────────
create table if not exists public.diet_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  meal text,                 -- pre | post | main | night | null
  food_name text not null,
  grams numeric,
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  created_at timestamptz not null default now()
);
create index if not exists diet_entries_user_date_idx
  on public.diet_entries (user_id, entry_date desc);

-- ── Body metrics ─────────────────────────────────────────────────
create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric,
  bodyfat_pct numeric,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists body_metrics_user_date_idx
  on public.body_metrics (user_id, measured_on desc);

-- ══════════════════════════════════════════════════════════════════
-- Row-Level Security: each user can only touch their own data
-- ══════════════════════════════════════════════════════════════════

alter table public.workout_sessions enable row level security;
alter table public.workout_entries  enable row level security;
alter table public.diet_entries     enable row level security;
alter table public.body_metrics     enable row level security;

drop policy if exists "workout_sessions_owner" on public.workout_sessions;
create policy "workout_sessions_owner" on public.workout_sessions
  for all using (auth.uid() = user_id)
        with check (auth.uid() = user_id);

drop policy if exists "workout_entries_owner" on public.workout_entries;
create policy "workout_entries_owner" on public.workout_entries
  for all using (auth.uid() = user_id)
        with check (auth.uid() = user_id);

drop policy if exists "diet_entries_owner" on public.diet_entries;
create policy "diet_entries_owner" on public.diet_entries
  for all using (auth.uid() = user_id)
        with check (auth.uid() = user_id);

drop policy if exists "body_metrics_owner" on public.body_metrics;
create policy "body_metrics_owner" on public.body_metrics
  for all using (auth.uid() = user_id)
        with check (auth.uid() = user_id);
