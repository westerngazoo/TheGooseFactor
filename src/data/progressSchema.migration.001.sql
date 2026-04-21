-- ══════════════════════════════════════════════════════════════════
-- Migration 001: Goose Method metadata on workout tables.
--
-- Run once in the Supabase SQL editor.
-- Safe to re-run (uses IF NOT EXISTS guards).
-- ══════════════════════════════════════════════════════════════════

-- Session-level type tag: the DUP slot for the day.
-- Values: 'strength' | 'hypertrophy' | 'metabolic' | 'pump' | 'mixed' | 'deload'
alter table public.workout_sessions
  add column if not exists session_type text;

-- Per-exercise PAP / bisérie pair (string name of partner exercise).
alter table public.workout_entries
  add column if not exists pap_pair text;

-- Per-exercise training "block" tag — HIGH / MEDIUM / LOW in Goose terms.
-- Orthogonal to `category` (strength/metabolic/hypertrophy/isolation):
-- e.g. a deload strength day is still category=strength but intensity=low.
alter table public.workout_entries
  add column if not exists intensity text;
