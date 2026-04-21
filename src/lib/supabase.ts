import {createClient, type SupabaseClient} from '@supabase/supabase-js';

/**
 * Lazily create a Supabase client using credentials injected at build time
 * via docusaurus.config.ts `customFields`. If creds are missing (e.g., in
 * dev without a .env file), returns null so the page can render a setup
 * banner instead of crashing.
 */
let cached: SupabaseClient | null = null;

export function getSupabase(
  url: string | undefined,
  anonKey: string | undefined,
): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (cached) return cached;
  cached = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return cached;
}

/* ─── Schema types (mirror src/data/progressSchema.sql) ─── */

export type SessionType =
  | 'strength'
  | 'hypertrophy'
  | 'metabolic'
  | 'pump'
  | 'mixed'
  | 'deload';

export type WorkoutSession = {
  id: string;
  user_id: string;
  session_date: string;   // ISO date
  name: string | null;
  notes: string | null;
  session_type: SessionType | null;
  created_at: string;
};

export type WorkoutEntry = {
  id: string;
  user_id: string;
  session_id: string;
  muscle_group: string;
  category: string;
  exercise_name: string;
  sets: number | null;
  reps: string | null;
  weight_kg: number | null;
  rpe: number | null;
  intensity: string | null;    // high | medium | low
  pap_pair: string | null;
  notes: string | null;
  created_at: string;
};

export type DietEntry = {
  id: string;
  user_id: string;
  entry_date: string;   // ISO date
  meal: string | null;  // e.g. 'pre', 'post', 'main', 'night'
  food_name: string;
  grams: number | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  created_at: string;
};

export type BodyMetric = {
  id: string;
  user_id: string;
  measured_on: string;  // ISO date
  weight_kg: number | null;
  bodyfat_pct: number | null;
  notes: string | null;
  created_at: string;
};
