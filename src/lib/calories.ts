import type {Exercise, ExerciseCategory} from '../data/routineData';

/**
 * Estimate calories burned per exercise using METs (Metabolic Equivalents).
 *
 *   kcal = METs × body_weight_kg × duration_hours
 *
 * MET values follow Ainsworth et al., Compendium of Physical Activities,
 * 2011 update (https://sites.google.com/site/compendiumofphysicalactivities/).
 *
 * The formula captures total metabolic load — work + rest + breathing +
 * heart-rate elevation + the afterburn (EPOC) for many activities. This
 * is meaningfully more accurate than computing "joules of mechanical
 * work / 4184", which misses ~80% of the actual energy expenditure.
 */

/** Default MET values per category, used when an exercise has no explicit override. */
export const DEFAULT_METS_BY_CATEGORY: Record<ExerciseCategory, number> = {
  strength: 6.0,      // vigorous resistance training (Compendium 02050)
  metabolic: 8.0,     // circuits / conditioning (Compendium 02065)
  hypertrophy: 5.0,   // moderate resistance training (Compendium 02054)
  isolation: 3.5,     // light single-joint work (Compendium 02080)
};

/**
 * Per-exercise MET overrides for activities that differ meaningfully from the
 * category default. Coverage is intentionally selective — only entries where
 * the difference matters.
 */
const MET_OVERRIDES: Record<string, number> = {
  // ── Olympic / power lifts (vigorous explosive) ──
  'Power Clean': 8.0,
  'Hang Clean': 8.0,
  'Squat Clean': 8.0,
  'Power Snatch': 8.5,
  'Hang Power Snatch': 8.5,
  'Squat Snatch': 9.0,
  'Snatch': 9.0,
  'Snatch Pull': 7.5,
  'Snatch Balance': 7.0,
  'Clean Pull': 7.5,
  'Clean & Jerk': 9.0,
  'Push Jerk': 7.5,
  'Split Jerk': 7.5,
  'High Pull (Snatch grip)': 7.0,
  'Overhead Squat': 6.5,

  // ── Strongman / specialty implements ──
  "Farmer's Walk": 7.5,
  'Trap-Bar Farmer Carry': 7.5,
  'Yoke Walk': 8.0,
  'Sled Push': 9.5,
  'Sled Drag (reverse)': 8.0,
  'Tire Flip': 8.5,
  'Atlas Stone Lift': 8.0,
  'Husafell Stone Carry': 8.5,
  'Sandbag Clean to Shoulder': 7.5,
  'Sandbag Shouldering': 7.5,
  'Sandbag Bear-Hug Squat': 7.0,
  'Log Press': 7.0,
  'Log Clean & Press': 8.0,
  'Axle Press': 7.0,
  'Axle Strict Press': 7.0,
  'Axle Deadlift': 7.5,

  // ── HIIT / circuits / Tabata (highest end) ──
  'Tabata Squats': 12.0,
  'Tabata KB Swings': 12.0,
  'Death by Burpees': 11.0,
  'Burpee': 8.0,
  'Burpee Pull-Up': 9.0,
  "Devil's Press": 11.0,
  'Devil’s Press': 11.0,
  'DB Man-Maker': 10.0,
  'Man-Maker (DB complex)': 10.0,
  'DB Thruster': 8.5,
  'Barbell Thrusters': 8.5,
  'Wall Ball': 8.0,
  'Fran (21-15-9)': 12.0,
  'Cindy (CrossFit)': 10.0,
  'Chelsea (EMOM)': 10.0,
  'Push-Pull AMRAP': 9.0,
  'Bear Complex (heavy)': 9.0,
  'Barbell Complex (Bear)': 9.0,
  'Barbell Complex (5/5/5/5/5)': 8.5,
  'DB Complex': 8.0,
  'KB Complex': 8.5,
  'KB Strength Circuit': 8.5,
  'DB Strength Circuit': 8.0,
  '5-Station Strength Circuit': 8.5,
  'Renegade Row Circuit': 8.5,
  'Sled Push + Pull-Up': 10.0,
  'Farmer Carry + Jump Squat': 9.0,
  'Thruster Ladder': 9.0,
  '100 Rep Challenge': 7.0,

  // ── Plyometric / explosive ──
  'Box Jump': 7.5,
  'Jump Squat': 7.0,
  'Jump Squat (low load)': 7.0,
  'Jump Lunge (alternating)': 7.5,
  'Tuck Jump': 8.0,
  'Skater Jump': 8.0,
  'Broad Jump': 7.5,
  'Pogo Jumps': 7.0,
  'Jumping Jacks': 7.0,
  'Jump Rope': 11.0,
  'High Knees': 8.0,
  'Butt Kicks': 7.0,
  'Mountain Climbers': 8.0,
  'Bear Crawl': 6.0,
  'Crab Walk': 5.0,

  // ── Bodyweight / mobility (lower end) ──
  'Cat-Cow': 2.5,
  'Bird Dog': 3.0,
  'Hollow Hold': 4.0,
  'Glute Bridge (BW)': 3.5,
  'Plank Up-Down': 5.0,
  'World’s Greatest Stretch': 3.5,
  'Inchworm Walkout': 4.5,
  'Cossack Squat': 5.0,
  'Reverse Lunge (BW)': 4.5,
  'Walking Lunge (BW)': 5.0,
  'Walking Lunges (light)': 4.5,
  'Lateral Lunge': 4.5,
  'Bodyweight Squat': 4.5,
  'Air Squat (fast)': 6.0,
  'Standard Push-Up': 5.5,
  'Incline Push-Up': 4.5,
  'Decline Push-Up': 6.5,
  'Diamond Push-Up': 6.0,
  'Plyo Push-Up': 7.5,
  'Hindu Push-Up': 6.0,
  'Band Pull-Apart': 3.0,
  'Band Face Pull': 3.0,
  'Band Dislocates': 2.5,

  // ── Carries (moderate-high) ──
  'Suitcase Carry': 6.5,
  'Front-Rack Carry': 7.0,
  'Bottoms-Up KB Carry': 6.0,
  'Goblet Carry': 6.5,
  'Overhead Carry': 7.0,
  'Zercher Carry': 7.0,
  'Bodyweight Squat Hold': 4.0,

  // ── KB-specific ──
  'KB Swing (heavy)': 8.0,
  'Kettlebell Swing': 7.5,
  'Single-Arm KB Swing': 7.5,
  'KB Snatch': 9.0,
  'KB Clean & Press': 7.5,
  'KB Goblet Squat': 6.5,
  'KB Halo': 4.0,
  'KB Windmill': 4.5,
  'Bottoms-Up KB Press': 5.0,
  'Turkish Get-Up': 7.0,

  // ── Calisthenics elite (work density very high) ──
  'Bar Muscle-Up': 8.0,
  'Ring Muscle-Up': 8.5,
  'Handstand Push-Up': 7.0,
  'One-Arm Push-Up': 7.0,
  'One-Arm Pull-Up': 8.0,
  'Archer Pull-Up': 7.0,
  'Front Lever Raise': 7.0,
  'L-Sit Pull-Up': 7.5,
  'Pistol Squat': 6.0,
  'Pistol Squat (weighted)': 7.0,
  'Shrimp Squat': 6.5,

  // ── Strength specialty (still vigorous) ──
  'Deadlift': 6.5,
  'Conventional Deadlift': 6.5,
  'Sumo Deadlift': 6.5,
  'Trap Bar Deadlift': 6.5,
  'Trap Bar Deadlift (heavy)': 7.0,
  'Barbell Back Squat': 6.5,
  'Front Squat': 6.5,
  'Bench Press': 6.0,
  'Overhead Press (Barbell)': 6.5,
  'Push Press': 7.0,
  'Push Press (light)': 6.5,
  'Weighted Pull-Up': 7.0,
  'Weighted Pull-ups': 7.0,
  'Weighted Chin-Up': 7.0,
  'Weighted Dips': 6.5,
  'Pendlay Row': 6.5,
  'Barbell Row': 6.0,
};

export function exerciseMets(ex: Exercise): number {
  const override = MET_OVERRIDES[ex.name];
  if (override != null) return override;
  // Try category default. ExerciseCategory may not be on plain Exercise type
  // (the flat library tags it); cast through `any` to read.
  const cat = (ex as any).category as ExerciseCategory | undefined;
  if (cat && DEFAULT_METS_BY_CATEGORY[cat]) return DEFAULT_METS_BY_CATEGORY[cat];
  return 5.0; // safe default — moderate resistance training
}

/**
 * Estimate the elapsed time of an exercise (work + rest), in minutes.
 *
 * Parses the `reps` string for time-based protocols ("30s", "1 min",
 * "EMOM 10 min", "AMRAP", Tabata, etc.). Falls back to a category-aware
 * heuristic for standard "5×5" / "4×8-10" reps strings: typical work
 * time per set + typical inter-set rest.
 */
export function estimateDurationMin(ex: Exercise): number {
  const sets = Math.max(1, parseInt(ex.sets) || 1);
  const reps = (ex.reps ?? '').toLowerCase();

  // Tabata: 4 minutes regardless of sets
  if (reps.includes('tabata') || reps.includes('20s on') || reps.includes('20s on / 10s off')) {
    return 4;
  }

  // EMOM N min — every minute on the minute
  const emomM = reps.match(/emom\s*(\d+)\s*min/);
  if (emomM) return parseInt(emomM[1]);
  const emomSetsM = reps.match(/emom\s*(\d+)/);
  if (emomSetsM && reps.includes('emom')) return parseInt(emomSetsM[1]);

  // AMRAP N min
  const amrapM = reps.match(/(\d+)\s*min\s*amrap|amrap\s*(\d+)/);
  if (amrapM) return parseInt(amrapM[1] || amrapM[2]);
  if (reps.includes('amrap')) return 12;

  // "21-15-9" style (Fran-like)
  if (/\d+\-\d+\-\d+/.test(reps)) return 8;

  // Ladder ("1→2→3" or "10→8→6→4→2")
  if (/\d+(→|->|to)\s*\d+/.test(reps)) return 10;

  // Death-by ladder
  if (reps.includes('ladder')) return 12;

  // "100 reps" style
  if (/^100\s*reps?/.test(reps)) return 8;

  // Time-per-set: "30-60s", "30s", "60s"
  const secM = reps.match(/(\d+)\s*-?\s*(\d+)?\s*s\b/);
  if (secM) {
    const lo = parseInt(secM[1]);
    const hi = secM[2] ? parseInt(secM[2]) : lo;
    const workSec = (lo + hi) / 2;
    // Add typical short rest between sets
    return (sets * (workSec + 30)) / 60;
  }

  // Distance-based: "20-40m", "30m"
  if (/\d+\s*-?\s*\d*\s*m\b/.test(reps)) {
    return (sets * (45 + 60)) / 60; // ~45s walk + 60s rest
  }

  // Number of rounds: "5 rounds", "6 rounds"
  const roundsM = reps.match(/(\d+)\s*rounds?/);
  if (roundsM) {
    const rounds = parseInt(roundsM[1]);
    return (rounds * 90) / 60; // ~90s per round including rest
  }

  // Standard rep-based: scale by category
  const cat = (ex as any).category as ExerciseCategory | undefined;
  const perSetMin: Record<ExerciseCategory, number> = {
    strength: 3.0,      // ~30s work + 2.5min rest
    metabolic: 2.5,     // continuous-ish
    hypertrophy: 2.0,   // ~30s work + 1.5min rest
    isolation: 1.25,    // ~30s work + 45s rest
  };
  const perSet = (cat && perSetMin[cat]) || 2.0;
  return sets * perSet;
}

/** Calories burned for one set of an exercise, given body weight in kg. */
export function estimateCalories(ex: Exercise, bodyWeightKg: number): number {
  if (!bodyWeightKg || bodyWeightKg <= 0) return 0;
  const mets = exerciseMets(ex);
  const minutes = estimateDurationMin(ex);
  return (mets * bodyWeightKg * minutes) / 60;
}

/* ── Body weight, persisted in localStorage so the user enters it once ── */

const STORAGE_KEY = 'goose:bodyWeightKg';

export function getStoredWeight(): number {
  if (typeof window === 'undefined') return 0;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (!v) return 0;
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function setStoredWeight(kg: number): void {
  if (typeof window === 'undefined') return;
  if (!kg || kg <= 0) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, String(kg));
}
