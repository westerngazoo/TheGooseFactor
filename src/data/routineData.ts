/* ══════════════════════════════════════════
   GOOSE METHOD — SHARED ROUTINE DATA
   Used by both routine-generator (weekly plan)
   and session-builder (single-day picker).
   ══════════════════════════════════════════ */

export type Intensity = 'high' | 'medium' | 'low';
export type MuscleGroup =
  | 'quad'
  | 'posterior'
  | 'chest'
  | 'back'
  | 'shoulder'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'calves'
  | 'forearms'
  | 'traps';

export type Exercise = {
  name: string;
  biseriePair?: string;
  sets: string;
  reps: string;
  notes?: string;
  /** Muscle groups primarily loaded. Default: inferred from legacy group bucket if absent. */
  primary?: MuscleGroup[];
  /** Muscle groups activated as synergists / stabilizers. */
  secondary?: MuscleGroup[];
  /** Marks multi-joint / multi-group compounds. */
  compound?: boolean;
  /** Optional sub-muscle tagging for anatomy chart precision. */
  primarySub?: SubMuscle[];
  secondarySub?: SubMuscle[];
};

/* ══════════════════════════════════════════
   SUB-MUSCLE TAXONOMY
   ══════════════════════════════════════════ */

export type SubMuscle =
  // Chest
  | 'chest_upper' | 'chest_mid' | 'chest_lower'
  // Back
  | 'lats' | 'rhomboids' | 'teres' | 'erectors'
  // Traps
  | 'traps_upper' | 'traps_mid'
  // Shoulders
  | 'delt_front' | 'delt_side' | 'delt_rear'
  // Biceps
  | 'biceps_long' | 'biceps_short' | 'brachialis' | 'brachioradialis'
  // Triceps
  | 'triceps_long' | 'triceps_lateral' | 'triceps_medial'
  // Forearms
  | 'forearm_flexors' | 'forearm_extensors' | 'forearm_grip'
  // Core
  | 'abs_upper' | 'abs_lower' | 'obliques'
  // Quads
  | 'rectus_femoris' | 'vastus_lateralis' | 'vastus_medialis'
  // Posterior
  | 'glute_max' | 'glute_med' | 'hams_bf' | 'hams_semi'
  // Calves
  | 'gastrocnemius' | 'soleus';

export const SUB_TO_GROUP: Record<SubMuscle, MuscleGroup> = {
  chest_upper: 'chest', chest_mid: 'chest', chest_lower: 'chest',
  lats: 'back', rhomboids: 'back', teres: 'back', erectors: 'back',
  traps_upper: 'traps', traps_mid: 'traps',
  delt_front: 'shoulder', delt_side: 'shoulder', delt_rear: 'shoulder',
  biceps_long: 'biceps', biceps_short: 'biceps',
  brachialis: 'biceps', brachioradialis: 'biceps',
  triceps_long: 'triceps', triceps_lateral: 'triceps', triceps_medial: 'triceps',
  forearm_flexors: 'forearms', forearm_extensors: 'forearms', forearm_grip: 'forearms',
  abs_upper: 'core', abs_lower: 'core', obliques: 'core',
  rectus_femoris: 'quad', vastus_lateralis: 'quad', vastus_medialis: 'quad',
  glute_max: 'posterior', glute_med: 'posterior',
  hams_bf: 'posterior', hams_semi: 'posterior',
  gastrocnemius: 'calves', soleus: 'calves',
};

export const SUB_LABELS: Record<SubMuscle, string> = {
  chest_upper: 'Upper pec', chest_mid: 'Mid pec', chest_lower: 'Lower pec',
  lats: 'Lats', rhomboids: 'Rhomboids', teres: 'Teres', erectors: 'Spinal erectors',
  traps_upper: 'Upper traps', traps_mid: 'Mid/lower traps',
  delt_front: 'Front delt', delt_side: 'Side delt', delt_rear: 'Rear delt',
  biceps_long: 'Biceps long head', biceps_short: 'Biceps short head',
  brachialis: 'Brachialis', brachioradialis: 'Brachioradialis',
  triceps_long: 'Triceps long', triceps_lateral: 'Triceps lateral', triceps_medial: 'Triceps medial',
  forearm_flexors: 'Forearm flexors', forearm_extensors: 'Forearm extensors', forearm_grip: 'Grip',
  abs_upper: 'Upper abs', abs_lower: 'Lower abs', obliques: 'Obliques',
  rectus_femoris: 'Rectus femoris', vastus_lateralis: 'Vastus lateralis', vastus_medialis: 'VMO',
  glute_max: 'Glute max', glute_med: 'Glute med',
  hams_bf: 'Hams (BF)', hams_semi: 'Hams (semi)',
  gastrocnemius: 'Gastrocnemius', soleus: 'Soleus',
};

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'quad', 'posterior', 'chest', 'back', 'shoulder',
  'biceps', 'triceps', 'core', 'calves', 'forearms', 'traps',
];

export const GROUP_LABELS: Record<MuscleGroup, string> = {
  quad: 'Quads',
  posterior: 'Glutes/Hams',
  chest: 'Chest',
  back: 'Back / Lats',
  shoulder: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  core: 'Core',
  calves: 'Calves',
  forearms: 'Forearms',
  traps: 'Traps',
};

export const INTENSITY_COLORS: Record<Intensity, string> = {
  high: '#e74c3c',
  medium: '#f39c12',
  low: '#2ecc71',
};

export const INTENSITY_LABELS: Record<Intensity, string> = {
  high: 'HIGH',
  medium: 'MED',
  low: 'LOW',
};

export const INTENSITY_PURPOSE: Record<Intensity, string> = {
  high: 'Compound / Strength — explosive, heavy, low rep. Max CNS load.',
  medium: 'Hypertrophy — moderate load, full ROM, 8-12 rep range.',
  low: 'Pump — light load, 15-20 reps, no failure. Blood flow.',
};

/* ══════════════════════════════════════════
   EXERCISE LIBRARY (categorized)
   Used by Session Builder. Richer than the
   intensity buckets used by the weekly
   Routine Generator.
   ══════════════════════════════════════════ */

export type ExerciseCategory = 'strength' | 'metabolic' | 'hypertrophy' | 'isolation';

export const CATEGORIES: ExerciseCategory[] = ['strength', 'metabolic', 'hypertrophy', 'isolation'];

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  strength: 'STRENGTH',
  metabolic: 'METABOLIC',
  hypertrophy: 'HYPERTROPHY',
  isolation: 'ISOLATION',
};

export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  strength: '#e74c3c',      // red - heavy compound
  metabolic: '#9b59b6',     // purple - conditioning
  hypertrophy: '#f39c12',   // orange - bodybuilding
  isolation: '#2ecc71',     // green - pump/isolation
};

export const CATEGORY_PURPOSE: Record<ExerciseCategory, string> = {
  strength: 'Heavy compounds, 3-5 reps. Explosive force, max CNS recruitment.',
  metabolic: 'Conditioning. High rep compounds, short rest, complexes.',
  hypertrophy: 'Muscle growth. Moderate load, 8-12 reps, full ROM.',
  isolation: 'Single-joint targeting. 12-15 reps, strict form, pump.',
};

export const EXERCISE_LIBRARY: Record<MuscleGroup, Record<ExerciseCategory, Exercise[]>> = {
  quad: {
    strength: [
      {name: 'Barbell Back Squat', sets: '5', reps: '3-5', notes: 'High bar, deep. Bread and butter.'},
      {name: 'Front Squat', sets: '4', reps: '3-5', notes: 'Upright torso. Quad bias.'},
      {name: 'Pause Back Squat', sets: '4', reps: '5', notes: '2s pause in hole. Kills stretch reflex.'},
      {name: 'Box Squat', sets: '5', reps: '3-5', notes: 'Sit-back cue. Posterior chain carryover.'},
      {name: 'Safety Bar Squat', sets: '4', reps: '5', notes: 'Easier on shoulders. Upper-back demand.'},
    ],
    metabolic: [
      {name: '20-Rep Squat', sets: '1', reps: '20', notes: 'Classic mass builder. Breathe between reps.'},
      {name: 'Barbell Thrusters', sets: '4', reps: '10-12', notes: 'Front squat + OHP. Full body.'},
      {name: 'Zercher Squat', sets: '4', reps: '8-10', notes: 'Core + upper back conditioning.'},
      {name: 'Goblet Squat Ladder', sets: '3', reps: '15-20', notes: 'Heavy DB. 30s rest.'},
    ],
    hypertrophy: [
      {name: 'Leg Press', sets: '4', reps: '10-12', notes: 'Feet low = quad. Full ROM.'},
      {name: 'Hack Squat', sets: '4', reps: '10-12', notes: 'Isolated quad drive.'},
      {name: 'Bulgarian Split Squat', sets: '3', reps: '10', notes: 'Per leg. Long stride = glutes; short = quads.'},
      {name: 'Walking Lunges (DB)', sets: '3', reps: '12', notes: 'Per leg.'},
      {name: 'Smith Machine Squat', sets: '4', reps: '10', notes: 'Foot-forward = quad bias.'},
    ],
    isolation: [
      {name: 'Leg Extension', sets: '3', reps: '12-15', notes: 'Squeeze at top. Pause 1s.'},
      {name: 'Sissy Squat', sets: '3', reps: '12-15', notes: 'Bodyweight or weighted.'},
      {name: 'Single-Leg Extension', sets: '3', reps: '15', notes: 'Per leg. Burnout.'},
      {name: 'Cyclist Squat', sets: '3', reps: '15', notes: 'Heels elevated, narrow stance.'},
    ],
  },
  posterior: {
    strength: [
      {name: 'Conventional Deadlift', sets: '5', reps: '3-5', notes: 'Full posterior chain. King lift.'},
      {name: 'Sumo Deadlift', sets: '5', reps: '3-5', notes: 'Wide stance. Quads + glutes bias.'},
      {name: 'Romanian Deadlift (heavy)', sets: '4', reps: '5', notes: 'Hinge only. Hamstrings stretch.'},
      {name: 'Good Morning', sets: '4', reps: '5', notes: 'Spinal erectors + hamstrings.'},
      {name: 'Deficit Deadlift', sets: '4', reps: '3-5', notes: 'Stand on plate. Extra ROM.'},
    ],
    metabolic: [
      {name: 'Kettlebell Swing', sets: '5', reps: '20-30', notes: 'Hip hinge. Explosive.'},
      {name: 'Barbell Hip Thrust (high rep)', sets: '3', reps: '15-20', notes: 'Pause at top.'},
      {name: 'Snatch-Grip RDL', sets: '4', reps: '10-12', notes: 'Wider grip = upper back bonus.'},
      {name: 'Trap Bar Deadlift (high rep)', sets: '3', reps: '12-15', notes: 'Safer spine loading.'},
    ],
    hypertrophy: [
      {name: 'Hip Thrust', sets: '4', reps: '10-12', notes: 'Glute bias. Squeeze hard at top.'},
      {name: 'Stiff-Leg DB Deadlift', sets: '4', reps: '10-12', notes: 'Light vs barbell. Max hamstring stretch.'},
      {name: 'Heavy Walking Lunges', sets: '3', reps: '10', notes: 'Per leg. Glute bias with long stride.'},
      {name: 'Glute Ham Raise', sets: '3', reps: '8-10', notes: 'Add weight on chest.'},
      {name: 'Single-Leg RDL', sets: '3', reps: '10', notes: 'Per leg. Balance + hamstring.'},
    ],
    isolation: [
      {name: 'Lying Leg Curl', sets: '3', reps: '12-15', notes: 'Squeeze hard. No spinal load.'},
      {name: 'Seated Leg Curl', sets: '3', reps: '12-15', notes: 'Better hamstring stretch than lying.'},
      {name: 'Cable Pull-Through', sets: '3', reps: '12-15', notes: 'Hip hinge pattern. Glute/ham.'},
      {name: 'Cable Glute Kickback', sets: '3', reps: '15', notes: 'Per leg.'},
      {name: 'Back Hyperextension', sets: '3', reps: '12-15', notes: 'Glute focus: round back slightly.'},
    ],
  },
  chest: {
    strength: [
      {name: 'Bench Press', sets: '5', reps: '3-5', notes: 'SACRED. Pause on chest optional.'},
      {name: 'Paused Bench', sets: '5', reps: '3', notes: '2s pause. Kills bounce.'},
      {name: 'Close-Grip Bench', sets: '4', reps: '5', notes: 'Triceps + chest overload.'},
      {name: 'Incline Barbell', sets: '4', reps: '5', notes: 'Upper chest strength.'},
      {name: 'Weighted Dips', sets: '4', reps: '5', notes: 'Lean forward = chest bias.'},
    ],
    metabolic: [
      {name: 'Push-Up Pyramid', sets: '5-10', reps: '5→1→5', notes: 'EMOM style.'},
      {name: 'Spoto Press', sets: '4', reps: '8-10', notes: 'Hover bar 1in above chest.'},
      {name: 'Clap Push-Ups', sets: '4', reps: '8-10', notes: 'Explosive power.'},
      {name: 'Bench Press (high-rep)', sets: '3', reps: '15-20', notes: 'Light weight. Conditioning.'},
    ],
    hypertrophy: [
      {name: 'Incline DB Press', sets: '4', reps: '10-12', notes: 'Full stretch bottom.'},
      {name: 'Flat DB Press', sets: '4', reps: '10-12', notes: 'Deeper ROM than barbell.'},
      {name: 'Machine Chest Press', sets: '3', reps: '10-12', notes: 'Safe to failure.'},
      {name: 'Hammer Strength Incline', sets: '4', reps: '10', notes: 'Fixed path. Heavy load safely.'},
      {name: 'Smith Incline Press', sets: '3', reps: '10-12'},
    ],
    isolation: [
      {name: 'Cable Crossover', sets: '3', reps: '12-15', notes: 'Squeeze, cross over.'},
      {name: 'Pec Deck Fly', sets: '3', reps: '12-15', notes: 'Squeeze 1s at peak.'},
      {name: 'Flat DB Fly', sets: '3', reps: '12', notes: 'Slight elbow bend. Don\'t press.'},
      {name: 'Incline DB Fly', sets: '3', reps: '12', notes: 'Upper chest isolation.'},
      {name: 'Low-to-High Cable Fly', sets: '3', reps: '15', notes: 'Upper chest pump.'},
    ],
  },
  back: {
    strength: [
      {name: 'Deadlift', sets: '5', reps: '3-5', notes: 'Before squats if same day.'},
      {name: 'Weighted Pull-Up', sets: '5', reps: '3-5', notes: 'Lat width.'},
      {name: 'Pendlay Row', sets: '5', reps: '5', notes: 'Dead-stop. Explosive pull.'},
      {name: 'Yates Row', sets: '5', reps: '5', notes: 'Underhand, upright-ish torso.'},
      {name: 'Rack Pulls', sets: '4', reps: '3-5', notes: 'Knee-height. Heavy upper back.'},
    ],
    metabolic: [
      {name: 'Kroc Rows', sets: '3', reps: '20-30', notes: 'Single arm, heavy. Cheat if needed.'},
      {name: 'Barbell Row (high-rep)', sets: '4', reps: '12-15', notes: 'Light, conditioning.'},
      {name: 'Renegade Row', sets: '3', reps: '10-12', notes: 'Per arm. Plank + row.'},
      {name: 'Deadlift Complex', sets: '4', reps: '8+8+8', notes: 'DL → row → RDL unbroken.'},
    ],
    hypertrophy: [
      {name: 'Barbell Row', sets: '4', reps: '8-10', notes: 'Controlled ROM.'},
      {name: 'T-Bar Row', sets: '4', reps: '8-10', notes: 'Thick handle. Mid-back.'},
      {name: 'Chest-Supported Row', sets: '4', reps: '10-12', notes: 'Removes lower-back fatigue.'},
      {name: 'Single-Arm DB Row', sets: '3', reps: '10', notes: 'Per side. Stretch at bottom.'},
      {name: 'Lat Pulldown (wide)', sets: '4', reps: '10-12', notes: 'Lat width focus.'},
      {name: 'Seated Cable Row', sets: '3', reps: '10-12', notes: 'Mid-trap squeeze.'},
    ],
    isolation: [
      {name: 'Straight-Arm Pulldown', sets: '3', reps: '12-15', notes: 'Lat stretch. No elbow bend.'},
      {name: 'Face Pull', sets: '3', reps: '15-20', notes: 'Rear delt + upper back.'},
      {name: 'Reverse Pec Deck', sets: '3', reps: '12-15', notes: 'Rear delt isolation.'},
      {name: 'DB Shrug', sets: '3', reps: '12-15', notes: 'Pause 1s at top.'},
      {name: 'Barbell Shrug', sets: '3', reps: '12-15', notes: 'Straight up. No rolling.'},
    ],
  },
  shoulder: {
    strength: [
      {name: 'Overhead Press (Barbell)', sets: '5', reps: '3-5', notes: 'Strict. No leg drive.'},
      {name: 'Push Press', sets: '4', reps: '3-5', notes: 'Leg drive overload.'},
      {name: 'Clean and Press', sets: '5', reps: '3-5', notes: 'PAP classic.'},
      {name: 'Behind-the-Neck Press', sets: '4', reps: '5', notes: 'Only with good mobility.'},
      {name: 'Seated Barbell Press', sets: '4', reps: '5', notes: 'No leg drive possible.'},
    ],
    metabolic: [
      {name: 'Cuban Press', sets: '3', reps: '10-12', notes: 'Upright row → rotate → press.'},
      {name: 'Landmine Press', sets: '4', reps: '10-12', notes: 'Single-arm. Shoulder-friendly.'},
      {name: 'DB Clean and Press', sets: '4', reps: '10', notes: 'Per side. Conditioning.'},
      {name: 'Bradford Press', sets: '3', reps: '12-15', notes: 'Alternating front-to-back.'},
    ],
    hypertrophy: [
      {name: 'Seated DB Shoulder Press', sets: '4', reps: '10-12'},
      {name: 'Arnold Press', sets: '3', reps: '10-12', notes: 'Full rotation ROM.'},
      {name: 'Machine Shoulder Press', sets: '4', reps: '10', notes: 'Safe to failure.'},
      {name: 'Z Press', sets: '3', reps: '8-10', notes: 'Seated on floor. No cheating.'},
    ],
    isolation: [
      {name: 'DB Lateral Raise', sets: '4', reps: '12-15', notes: 'Slight forward lean.'},
      {name: 'Cable Lateral Raise', sets: '3', reps: '15', notes: 'Constant tension.'},
      {name: 'Front Raise (DB/Plate)', sets: '3', reps: '12-15'},
      {name: 'Reverse Pec Deck (rear)', sets: '3', reps: '15', notes: 'Rear delt pump.'},
      {name: 'Face Pull', sets: '3', reps: '15-20', notes: 'Rear delt + upper back.'},
      {name: 'Upright Row (EZ bar)', sets: '3', reps: '12', notes: 'Narrow = traps; wide = delts.'},
    ],
  },
  biceps: {
    strength: [
      {name: 'Weighted Chin-Up', sets: '5', reps: '3-5', notes: 'Underhand, close grip.'},
      {name: 'Barbell Curl (heavy)', sets: '5', reps: '5', notes: 'Strict form. Full ROM.'},
      {name: 'Cheated EZ Curl', sets: '4', reps: '5-6', notes: 'Heavy eccentric allowed.'},
      {name: 'Reverse-Grip Bent Row', sets: '4', reps: '5-6', notes: 'Biceps + back hybrid.'},
    ],
    metabolic: [
      {name: '21s Curls', sets: '3', reps: '21 (7+7+7)', notes: 'Bottom half, top half, full.'},
      {name: 'Drop-Set DB Curls', sets: '3', reps: '10→10→10', notes: 'Reduce weight each drop.'},
      {name: 'Cable Curl Burnout', sets: '3', reps: '20-25', notes: 'Light, burning tension.'},
      {name: 'Curl & Press (DB)', sets: '3', reps: '10-12', notes: 'Biceps + shoulders combo.'},
    ],
    hypertrophy: [
      {name: 'Preacher Curl (EZ bar)', sets: '4', reps: '10-12', notes: 'Isolation.'},
      {name: 'Incline DB Curl', sets: '4', reps: '10-12', notes: 'Long head stretch.'},
      {name: 'Hammer Curl', sets: '3', reps: '10-12', notes: 'Brachialis + brachioradialis.'},
      {name: 'Cable Curl (bar)', sets: '3', reps: '10-12', notes: 'Constant tension.'},
      {name: 'Rope Hammer Curl', sets: '3', reps: '12', notes: 'Neutral grip. Peak squeeze.'},
    ],
    isolation: [
      {name: 'Concentration Curl', sets: '3', reps: '12-15', notes: 'Per arm. Peak.'},
      {name: 'Spider Curl', sets: '3', reps: '12-15', notes: 'Constant tension.'},
      {name: 'Single-Arm Cable Curl', sets: '3', reps: '12-15', notes: 'Per arm.'},
      {name: 'Reverse Curl (EZ bar)', sets: '3', reps: '12', notes: 'Brachioradialis emphasis.'},
    ],
  },
  triceps: {
    strength: [
      {name: 'Close-Grip Bench Press', sets: '5', reps: '3-5', notes: 'Compound triceps overload.'},
      {name: 'Weighted Dips (upright)', sets: '5', reps: '3-5', notes: 'Vertical torso = tri bias.'},
      {name: 'Board Press', sets: '4', reps: '5', notes: '2-3 board. Lockout strength.'},
      {name: 'JM Press', sets: '4', reps: '5-6', notes: 'Hybrid bench/skull crusher.'},
    ],
    metabolic: [
      {name: 'Dip Pyramid', sets: '5-10', reps: '10→1→10', notes: 'EMOM style.'},
      {name: 'Tate Press', sets: '4', reps: '10-12', notes: 'Elbows out. Unique angle.'},
      {name: 'Pushdown Burnout', sets: '3', reps: '20-25', notes: 'Light.'},
      {name: 'Close-Grip Push-Ups (high rep)', sets: '3', reps: '15-25'},
    ],
    hypertrophy: [
      {name: 'EZ Skull Crusher', sets: '4', reps: '10-12', notes: 'Long head stretch.'},
      {name: 'DB Skull Crusher', sets: '3', reps: '10-12'},
      {name: 'Overhead DB Extension', sets: '3', reps: '10-12', notes: 'Max long-head stretch.'},
      {name: 'Rope Pushdown', sets: '3', reps: '10-12', notes: 'Spread ends at bottom.'},
      {name: 'V-Bar Pushdown', sets: '3', reps: '10-12'},
    ],
    isolation: [
      {name: 'Cable Kickback', sets: '3', reps: '12-15', notes: 'Per arm.'},
      {name: 'Single-Arm Rope Extension', sets: '3', reps: '12-15', notes: 'Overhead.'},
      {name: 'Bench Dip (bodyweight)', sets: '3', reps: '15-20'},
      {name: 'DB Kickback', sets: '3', reps: '15', notes: 'Per arm. Slow eccentric.'},
    ],
  },
};

/* ══════════════════════════════════════════
   FLAT EXERCISE DATABASE (exercise-first).
   Each entry tags primary and secondary
   muscle groups so compounds like Deadlift
   light up multiple regions. Includes the
   legacy library + a large block of
   compound / full-body lifts.
   ══════════════════════════════════════════ */

type FlatExercise = Exercise & {
  category: ExerciseCategory;
  primary: MuscleGroup[];
};

/* Auto-derive a flat list from the existing nested EXERCISE_LIBRARY.
   Each exercise gets primary = [the-nested-group] (if not already set). */
function flattenLegacy(): FlatExercise[] {
  const out: FlatExercise[] = [];
  const seen = new Set<string>();
  for (const g of MUSCLE_GROUPS) {
    const byCat = EXERCISE_LIBRARY[g];
    if (!byCat) continue;
    for (const c of CATEGORIES) {
      for (const ex of byCat[c] ?? []) {
        const key = `${ex.name}|${c}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          ...ex,
          category: c,
          primary: ex.primary ?? [g],
          secondary: ex.secondary,
        });
      }
    }
  }
  return out;
}

/* Compound / full-body / specialty lifts not in the nested library. */
const COMPOUND_ADDITIONS: FlatExercise[] = [
  // ── Olympic / power lifts ──
  {name: 'Power Clean', category: 'strength', primary: ['posterior', 'back'], secondary: ['quad', 'shoulder', 'traps'], compound: true, sets: '5', reps: '3', notes: 'Explosive triple extension. Catch at shoulder height.'},
  {name: 'Hang Clean', category: 'strength', primary: ['posterior', 'back'], secondary: ['quad', 'shoulder', 'traps'], compound: true, sets: '5', reps: '3'},
  {name: 'Clean & Jerk', category: 'strength', primary: ['posterior', 'shoulder', 'quad'], secondary: ['back', 'core', 'traps'], compound: true, sets: '5', reps: '2-3', notes: 'Full-body strength + power.'},
  {name: 'Snatch', category: 'strength', primary: ['posterior', 'back', 'shoulder'], secondary: ['quad', 'core', 'traps'], compound: true, sets: '5', reps: '2-3', notes: 'Wide grip. Overhead in one pull.'},
  {name: 'Snatch Pull', category: 'strength', primary: ['posterior', 'back'], secondary: ['traps', 'forearms'], compound: true, sets: '4', reps: '3-5', notes: 'Pull only. Heavy.'},
  {name: 'Push Jerk', category: 'strength', primary: ['shoulder'], secondary: ['triceps', 'quad', 'core'], compound: true, sets: '4', reps: '3-5'},
  {name: 'Split Jerk', category: 'strength', primary: ['shoulder'], secondary: ['triceps', 'quad', 'core'], compound: true, sets: '4', reps: '2-3'},

  // ── Strongman / carries ──
  {name: "Farmer's Walk", category: 'metabolic', primary: ['forearms', 'traps', 'core'], secondary: ['posterior', 'back'], compound: true, sets: '4', reps: '30-40m', notes: 'Grip + core + work capacity.'},
  {name: 'Zercher Carry', category: 'metabolic', primary: ['core', 'quad'], secondary: ['biceps', 'back'], compound: true, sets: '3', reps: '20-30m'},
  {name: 'Overhead Carry', category: 'metabolic', primary: ['shoulder', 'core'], secondary: ['triceps', 'traps'], compound: true, sets: '3', reps: '20-30m'},
  {name: 'Yoke Walk', category: 'metabolic', primary: ['posterior', 'quad', 'core'], secondary: ['traps', 'back'], compound: true, sets: '3', reps: '15-20m'},
  {name: 'Sled Push', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '5', reps: '15-20m', notes: 'Low handles = quad; high = posterior.'},
  {name: 'Sled Drag (reverse)', category: 'metabolic', primary: ['quad'], secondary: ['calves', 'core'], compound: true, sets: '4', reps: '15-20m', notes: 'Quad recovery / hypertrophy.'},

  // ── Conditioning / CrossFit-style ──
  {name: 'Barbell Thrusters', category: 'metabolic', primary: ['quad', 'shoulder'], secondary: ['posterior', 'core', 'triceps'], compound: true, sets: '4', reps: '10-12', notes: 'Front squat → press. Full body.'},
  {name: 'Wall Ball', category: 'metabolic', primary: ['quad', 'shoulder'], secondary: ['posterior', 'core'], compound: true, sets: '4', reps: '15-20'},
  {name: 'Burpee', category: 'metabolic', primary: ['chest', 'quad'], secondary: ['core', 'shoulder', 'triceps'], compound: true, sets: '5', reps: '10-15'},
  {name: 'Burpee Pull-Up', category: 'metabolic', primary: ['back', 'chest'], secondary: ['biceps', 'core', 'shoulder'], compound: true, sets: '4', reps: '8-12'},
  {name: 'Man-Maker (DB complex)', category: 'metabolic', primary: ['shoulder', 'back', 'quad'], secondary: ['chest', 'core', 'triceps'], compound: true, sets: '4', reps: '8-10', notes: 'Row → push-up → clean → thruster.'},
  {name: 'Box Jump', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '5', reps: '5-8', notes: 'Explosive. Step down.'},
  {name: 'Jump Squat', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '4', reps: '6-8'},
  {name: 'Broad Jump', category: 'metabolic', primary: ['posterior', 'quad'], secondary: ['calves', 'core'], compound: true, sets: '5', reps: '3-5'},

  // ── Unilateral / stability ──
  {name: 'Turkish Get-Up', category: 'metabolic', primary: ['shoulder', 'core'], secondary: ['quad', 'posterior', 'triceps'], compound: true, sets: '3', reps: '3-5', notes: 'Per side. Full-body control.'},
  {name: 'Pistol Squat', category: 'strength', primary: ['quad'], secondary: ['posterior', 'core', 'calves'], compound: true, sets: '4', reps: '5', notes: 'Per leg.'},
  {name: 'Single-Leg Deadlift', category: 'hypertrophy', primary: ['posterior'], secondary: ['core', 'calves'], compound: true, sets: '3', reps: '8-10', notes: 'Per leg. Balance + hinge.'},

  // ── Core ──
  {name: 'Weighted Plank', category: 'isolation', primary: ['core'], sets: '3', reps: '30-60s', notes: 'Plate on back.'},
  {name: 'Hanging Leg Raise', category: 'hypertrophy', primary: ['core'], secondary: ['forearms'], sets: '3', reps: '10-15'},
  {name: 'Ab Wheel Rollout', category: 'strength', primary: ['core'], secondary: ['shoulder', 'back'], sets: '4', reps: '6-10', notes: 'Anti-extension.'},
  {name: 'Cable Woodchopper', category: 'hypertrophy', primary: ['core'], secondary: ['shoulder'], sets: '3', reps: '10-12', notes: 'Per side.'},
  {name: 'Pallof Press', category: 'isolation', primary: ['core'], sets: '3', reps: '10-12', notes: 'Anti-rotation.'},
  {name: 'Dragon Flag', category: 'strength', primary: ['core'], sets: '4', reps: '5-8', notes: 'Full-body tension.'},

  // ── Calves ──
  {name: 'Standing Calf Raise', category: 'hypertrophy', primary: ['calves'], sets: '4', reps: '10-15', notes: 'Full stretch + squeeze.'},
  {name: 'Seated Calf Raise', category: 'isolation', primary: ['calves'], sets: '4', reps: '15-20', notes: 'Soleus bias.'},
  {name: 'Donkey Calf Raise', category: 'hypertrophy', primary: ['calves'], sets: '4', reps: '12-15'},
  {name: 'Single-Leg Calf Raise', category: 'isolation', primary: ['calves'], sets: '3', reps: '15-20', notes: 'Per leg.'},
  {name: 'Calf Press (leg press)', category: 'hypertrophy', primary: ['calves'], sets: '4', reps: '12-15'},

  // ── Forearms / grip ──
  {name: 'Wrist Curl', category: 'isolation', primary: ['forearms'], sets: '3', reps: '15-20'},
  {name: 'Reverse Wrist Curl', category: 'isolation', primary: ['forearms'], sets: '3', reps: '15-20', notes: 'Extensors.'},
  {name: 'Dead Hang', category: 'metabolic', primary: ['forearms'], secondary: ['back'], sets: '3', reps: '30-60s'},
  {name: 'Plate Pinch', category: 'isolation', primary: ['forearms'], sets: '3', reps: '30-45s', notes: 'Per hand.'},

  // ── Traps (dedicated) ──
  {name: 'Heavy Barbell Shrug', category: 'hypertrophy', primary: ['traps'], sets: '4', reps: '8-12'},
  {name: 'DB Shrug (heavy)', category: 'hypertrophy', primary: ['traps'], sets: '4', reps: '10-12'},
  {name: 'Rack Pull Shrug', category: 'strength', primary: ['traps'], secondary: ['back', 'forearms'], compound: true, sets: '4', reps: '5', notes: 'From pins above knee.'},
];

/* Augment Deadlift / Squat / Bench / OHP / rows with richer tagging (group-level + sub-muscle). */
const PRIMARY_OVERRIDES: Record<string, Partial<FlatExercise>> = {
  'Deadlift':                  {primary: ['posterior', 'back'], secondary: ['traps', 'forearms', 'core', 'quad'], compound: true, primarySub: ['glute_max','hams_bf','erectors','lats'], secondarySub: ['traps_upper','forearm_grip']},
  'Conventional Deadlift':     {primary: ['posterior', 'back'], secondary: ['traps', 'forearms', 'core', 'quad'], compound: true, primarySub: ['glute_max','hams_bf','erectors','lats'], secondarySub: ['traps_upper','forearm_grip']},
  'Sumo Deadlift':             {primary: ['posterior', 'back', 'quad'], secondary: ['traps', 'forearms', 'core'], compound: true, primarySub: ['glute_max','glute_med','vastus_medialis','erectors'], secondarySub: ['lats','forearm_grip']},
  'Romanian Deadlift':         {primary: ['posterior'], secondary: ['back', 'core', 'forearms'], compound: true, primarySub: ['hams_bf','hams_semi','glute_max','erectors'], secondarySub: ['forearm_grip']},
  'Romanian Deadlift (heavy)': {primary: ['posterior'], secondary: ['back', 'core', 'forearms'], compound: true, primarySub: ['hams_bf','hams_semi','glute_max','erectors'], secondarySub: ['forearm_grip']},
  'Deficit Deadlift':          {primary: ['posterior', 'back'], secondary: ['traps', 'forearms', 'core', 'quad'], compound: true, primarySub: ['glute_max','hams_bf','erectors','lats'], secondarySub: ['traps_upper','forearm_grip']},
  'Good Morning':              {primary: ['posterior'], secondary: ['back', 'core'], compound: true, primarySub: ['erectors','hams_bf','glute_max']},
  'Rack Pulls':                {primary: ['back', 'traps'], secondary: ['forearms', 'posterior'], compound: true, primarySub: ['traps_upper','traps_mid','erectors'], secondarySub: ['forearm_grip']},
  'Barbell Back Squat':        {primary: ['quad'], secondary: ['posterior', 'core'], compound: true, primarySub: ['vastus_lateralis','rectus_femoris','vastus_medialis'], secondarySub: ['glute_max']},
  'Front Squat':               {primary: ['quad'], secondary: ['core', 'posterior', 'shoulder'], compound: true, primarySub: ['rectus_femoris','vastus_medialis'], secondarySub: ['glute_max','abs_upper']},
  'Pause Back Squat':          {primary: ['quad'], secondary: ['posterior', 'core'], compound: true, primarySub: ['vastus_lateralis','rectus_femoris','vastus_medialis']},
  'Box Squat':                 {primary: ['quad', 'posterior'], secondary: ['core'], compound: true, primarySub: ['glute_max','vastus_lateralis']},
  'Safety Bar Squat':          {primary: ['quad'], secondary: ['posterior', 'back', 'core'], compound: true, primarySub: ['rectus_femoris','vastus_lateralis']},
  '20-Rep Squat':              {primary: ['quad'], secondary: ['posterior', 'core'], compound: true, primarySub: ['rectus_femoris','vastus_lateralis','vastus_medialis']},
  'Zercher Squat':             {primary: ['quad', 'core'], secondary: ['back', 'biceps'], compound: true, primarySub: ['rectus_femoris','abs_upper']},
  'Bench Press':               {primary: ['chest'], secondary: ['triceps', 'shoulder'], compound: true, primarySub: ['chest_mid'], secondarySub: ['triceps_lateral','delt_front']},
  'Paused Bench':              {primary: ['chest'], secondary: ['triceps', 'shoulder'], compound: true, primarySub: ['chest_mid'], secondarySub: ['triceps_lateral','delt_front']},
  'Close-Grip Bench':          {primary: ['triceps', 'chest'], secondary: ['shoulder'], compound: true, primarySub: ['triceps_medial','triceps_lateral'], secondarySub: ['chest_mid','delt_front']},
  'Close-Grip Bench Press':    {primary: ['triceps', 'chest'], secondary: ['shoulder'], compound: true, primarySub: ['triceps_medial','triceps_lateral'], secondarySub: ['chest_mid','delt_front']},
  'Incline Barbell':           {primary: ['chest', 'shoulder'], secondary: ['triceps'], compound: true, primarySub: ['chest_upper','delt_front'], secondarySub: ['triceps_lateral']},
  'Incline DB Press':          {primary: ['chest'], secondary: ['shoulder','triceps'], primarySub: ['chest_upper'], secondarySub: ['delt_front','triceps_lateral']},
  'Flat DB Press':             {primary: ['chest'], secondary: ['triceps','shoulder'], primarySub: ['chest_mid'], secondarySub: ['triceps_lateral','delt_front']},
  'Weighted Dips':             {primary: ['chest', 'triceps'], secondary: ['shoulder'], compound: true, primarySub: ['chest_lower','triceps_lateral'], secondarySub: ['delt_front']},
  'Weighted Dips (upright)':   {primary: ['triceps', 'chest'], secondary: ['shoulder'], compound: true, primarySub: ['triceps_lateral','triceps_medial'], secondarySub: ['chest_lower','delt_front']},
  'Overhead Press (Barbell)':  {primary: ['shoulder'], secondary: ['triceps', 'core'], compound: true, primarySub: ['delt_front'], secondarySub: ['triceps_lateral','abs_upper']},
  'Push Press':                {primary: ['shoulder'], secondary: ['triceps', 'quad', 'core'], compound: true, primarySub: ['delt_front','delt_side'], secondarySub: ['triceps_lateral']},
  'Clean and Press':           {primary: ['shoulder', 'posterior'], secondary: ['back', 'quad', 'traps', 'core'], compound: true, primarySub: ['delt_front','glute_max','traps_upper']},
  'Barbell Row':               {primary: ['back'], secondary: ['biceps', 'forearms', 'posterior'], compound: true, primarySub: ['lats','rhomboids'], secondarySub: ['biceps_long']},
  'Pendlay Row':               {primary: ['back'], secondary: ['biceps', 'forearms', 'posterior'], compound: true, primarySub: ['lats','rhomboids','traps_mid'], secondarySub: ['biceps_long']},
  'T-Bar Row':                 {primary: ['back'], secondary: ['biceps', 'traps', 'forearms'], compound: true, primarySub: ['rhomboids','lats','traps_mid'], secondarySub: ['biceps_long']},
  'Lat Pulldown (wide)':       {primary: ['back'], secondary: ['biceps','forearms'], primarySub: ['lats','teres'], secondarySub: ['biceps_long']},
  'Weighted Pull-Up':          {primary: ['back'], secondary: ['biceps', 'forearms', 'core'], compound: true, primarySub: ['lats','teres'], secondarySub: ['biceps_long','forearm_grip']},
  'Weighted Pull-ups':         {primary: ['back'], secondary: ['biceps', 'forearms', 'core'], compound: true, primarySub: ['lats','teres'], secondarySub: ['biceps_long','forearm_grip']},
  'Weighted Chin-Up':          {primary: ['back', 'biceps'], secondary: ['forearms', 'core'], compound: true, primarySub: ['lats','biceps_short'], secondarySub: ['forearm_grip']},
  'Straight-Arm Pulldown':     {primary: ['back'], primarySub: ['lats','teres']},
  'Face Pull':                 {primary: ['shoulder','back'], primarySub: ['delt_rear','rhomboids','traps_mid']},
  'Reverse Pec Deck':          {primary: ['shoulder'], primarySub: ['delt_rear'], secondarySub: ['rhomboids']},
  'Reverse Pec Deck (rear)':   {primary: ['shoulder'], primarySub: ['delt_rear'], secondarySub: ['rhomboids']},
  'DB Lateral Raise':          {primary: ['shoulder'], primarySub: ['delt_side']},
  'Lateral Raises':            {primary: ['shoulder'], primarySub: ['delt_side']},
  'Cable Lateral Raise':       {primary: ['shoulder'], primarySub: ['delt_side']},
  'Front Raise (DB/Plate)':    {primary: ['shoulder'], primarySub: ['delt_front']},
  'Arnold Press':              {primary: ['shoulder'], secondary: ['triceps'], primarySub: ['delt_front','delt_side'], secondarySub: ['triceps_lateral']},
  'Seated DB Shoulder Press':  {primary: ['shoulder'], secondary: ['triceps'], primarySub: ['delt_front','delt_side'], secondarySub: ['triceps_lateral']},
  'DB Shoulder Press':         {primary: ['shoulder'], secondary: ['triceps'], primarySub: ['delt_front','delt_side'], secondarySub: ['triceps_lateral']},
  'Hip Thrust':                {primary: ['posterior'], secondary: ['core'], primarySub: ['glute_max']},
  'Barbell Hip Thrust (high rep)': {primary: ['posterior'], secondary: ['core'], primarySub: ['glute_max']},
  'Kettlebell Swing':          {primary: ['posterior'], secondary: ['core', 'shoulder'], compound: true, primarySub: ['glute_max','hams_bf'], secondarySub: ['erectors']},
  'Bulgarian Split Squat':     {primary: ['quad'], secondary: ['posterior', 'core'], compound: true, primarySub: ['rectus_femoris','vastus_lateralis'], secondarySub: ['glute_max']},
  'Walking Lunges (DB)':       {primary: ['quad', 'posterior'], secondary: ['core'], compound: true, primarySub: ['rectus_femoris','glute_max']},
  'Walking Lunges (light)':    {primary: ['quad', 'posterior'], secondary: ['core'], primarySub: ['rectus_femoris','glute_max']},
  'Heavy Walking Lunges':      {primary: ['quad', 'posterior'], secondary: ['core'], primarySub: ['rectus_femoris','glute_max']},
  'Hack Squat':                {primary: ['quad'], secondary: ['posterior'], primarySub: ['vastus_lateralis','vastus_medialis']},
  'Leg Press':                 {primary: ['quad'], secondary: ['posterior'], primarySub: ['vastus_lateralis','vastus_medialis','rectus_femoris']},
  'Leg Extension':             {primary: ['quad'], primarySub: ['rectus_femoris','vastus_medialis','vastus_lateralis']},
  'Sissy Squat':               {primary: ['quad'], primarySub: ['rectus_femoris']},
  'Cyclist Squat':             {primary: ['quad'], primarySub: ['vastus_medialis','rectus_femoris']},
  'Lying Leg Curl':            {primary: ['posterior'], primarySub: ['hams_bf','hams_semi']},
  'Seated Leg Curl':           {primary: ['posterior'], primarySub: ['hams_bf','hams_semi']},
  'Glute Ham Raise':           {primary: ['posterior'], primarySub: ['hams_bf','hams_semi','glute_max']},
  'Cable Glute Kickback':      {primary: ['posterior'], primarySub: ['glute_max']},
  'Cable Pull-Through':        {primary: ['posterior'], primarySub: ['glute_max','hams_bf']},
  'Back Hyperextension':       {primary: ['posterior','back'], primarySub: ['glute_max','hams_bf','erectors']},
  'Preacher Curl':             {primary: ['biceps'], primarySub: ['biceps_short']},
  'Preacher Curl (EZ bar)':    {primary: ['biceps'], primarySub: ['biceps_short']},
  'Spider Curl':               {primary: ['biceps'], primarySub: ['biceps_short']},
  'Concentration Curl':        {primary: ['biceps'], primarySub: ['biceps_short']},
  'Incline DB Curl':           {primary: ['biceps'], primarySub: ['biceps_long']},
  'Barbell Curl (heavy)':      {primary: ['biceps'], primarySub: ['biceps_long','biceps_short']},
  'Cheated EZ Curl':           {primary: ['biceps'], primarySub: ['biceps_long','biceps_short']},
  'Hammer Curl':               {primary: ['biceps'], primarySub: ['brachialis','brachioradialis']},
  'Rope Hammer Curl':          {primary: ['biceps'], primarySub: ['brachialis','brachioradialis']},
  'Reverse Curl (EZ bar)':     {primary: ['biceps'], primarySub: ['brachioradialis']},
  'Cable Curl':                {primary: ['biceps'], primarySub: ['biceps_short','biceps_long']},
  'Cable Curl (bar)':          {primary: ['biceps'], primarySub: ['biceps_short','biceps_long']},
  'DB Curl':                   {primary: ['biceps'], primarySub: ['biceps_long','biceps_short']},
  'Overhead DB Extension':     {primary: ['triceps'], primarySub: ['triceps_long']},
  'Single-Arm Rope Extension': {primary: ['triceps'], primarySub: ['triceps_long']},
  'EZ Skull Crusher':          {primary: ['triceps'], primarySub: ['triceps_long','triceps_lateral']},
  'DB Skull Crusher':          {primary: ['triceps'], primarySub: ['triceps_long','triceps_lateral']},
  'Rope Pushdown':             {primary: ['triceps'], primarySub: ['triceps_lateral','triceps_medial']},
  'Cable Pushdown':            {primary: ['triceps'], primarySub: ['triceps_lateral','triceps_medial']},
  'V-Bar Pushdown':            {primary: ['triceps'], primarySub: ['triceps_lateral','triceps_medial']},
  'DB Kickback':               {primary: ['triceps'], primarySub: ['triceps_lateral']},
  'Cable Kickback':            {primary: ['triceps'], primarySub: ['triceps_lateral']},
  'Heavy Barbell Shrug':       {primary: ['traps'], primarySub: ['traps_upper']},
  'DB Shrug (heavy)':          {primary: ['traps'], primarySub: ['traps_upper']},
  'DB Shrug':                  {primary: ['traps'], primarySub: ['traps_upper']},
  'Barbell Shrug':             {primary: ['traps'], primarySub: ['traps_upper']},
  'Rack Pull Shrug':           {primary: ['traps'], secondary: ['back','forearms'], primarySub: ['traps_upper','traps_mid'], secondarySub: ['erectors']},
  'Standing Calf Raise':       {primary: ['calves'], primarySub: ['gastrocnemius']},
  'Donkey Calf Raise':         {primary: ['calves'], primarySub: ['gastrocnemius']},
  'Seated Calf Raise':         {primary: ['calves'], primarySub: ['soleus']},
  'Single-Leg Calf Raise':     {primary: ['calves'], primarySub: ['gastrocnemius']},
  'Calf Press (leg press)':    {primary: ['calves'], primarySub: ['gastrocnemius']},
  'Wrist Curl':                {primary: ['forearms'], primarySub: ['forearm_flexors']},
  'Reverse Wrist Curl':        {primary: ['forearms'], primarySub: ['forearm_extensors']},
  'Dead Hang':                 {primary: ['forearms'], secondary: ['back'], primarySub: ['forearm_grip']},
  'Plate Pinch':               {primary: ['forearms'], primarySub: ['forearm_grip']},
  'Hanging Leg Raise':         {primary: ['core'], secondary: ['forearms'], primarySub: ['abs_lower','abs_upper'], secondarySub: ['forearm_grip']},
  'Weighted Plank':            {primary: ['core'], primarySub: ['abs_upper','abs_lower']},
  'Ab Wheel Rollout':          {primary: ['core'], secondary: ['shoulder','back'], primarySub: ['abs_upper','abs_lower']},
  'Cable Woodchopper':         {primary: ['core'], secondary: ['shoulder'], primarySub: ['obliques']},
  'Pallof Press':              {primary: ['core'], primarySub: ['obliques','abs_upper']},
  'Dragon Flag':               {primary: ['core'], primarySub: ['abs_upper','abs_lower']},
};

export const ALL_EXERCISES: FlatExercise[] = (() => {
  const legacy = flattenLegacy();
  const withOverrides = legacy.map((ex) => {
    const o = PRIMARY_OVERRIDES[ex.name];
    return o ? {...ex, ...o} : ex;
  });
  return [...withOverrides, ...COMPOUND_ADDITIONS];
})();

/** All exercises for a given (group, category) — includes compounds where the group
 *  appears in primary OR secondary. */
export function exercisesFor(group: MuscleGroup, category: ExerciseCategory): FlatExercise[] {
  return ALL_EXERCISES.filter((e) =>
    e.category === category &&
    (e.primary.includes(group) || (e.secondary?.includes(group) ?? false))
  );
}

/** Text search across all exercises. */
export function searchExercises(query: string): FlatExercise[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_EXERCISES.filter((e) => e.name.toLowerCase().includes(q));
}

/* ── Exercise DB ── */
export const EXERCISES: Record<MuscleGroup, Record<Intensity, Exercise[]>> = {
  quad: {
    high: [
      {name: 'Barbell Squat', biseriePair: 'Leg Extension', sets: '5', reps: '5', notes: 'Deep. High bar.'},
      {name: 'Front Squat', sets: '4', reps: '5', notes: 'Upright torso. Quad bias.'},
      {name: 'Pause Back Squat', sets: '4', reps: '5', notes: '2s pause in hole. Kills momentum.'},
    ],
    medium: [
      {name: 'Leg Press', sets: '4', reps: '10'},
      {name: 'Hack Squat', sets: '3', reps: '12'},
      {name: 'Bulgarian Split Squat', sets: '3', reps: '10', notes: 'Each leg.'},
      {name: 'Goblet Squat', sets: '3', reps: '12'},
    ],
    low: [
      {name: 'Leg Extension', sets: '3', reps: '15-20', notes: 'Pump. No failure.'},
      {name: 'Sissy Squat', sets: '3', reps: '15'},
      {name: 'Walking Lunges (light)', sets: '3', reps: '20', notes: 'Per leg. Pump focus.'},
    ],
  },
  posterior: {
    high: [
      {name: 'Romanian Deadlift', biseriePair: 'Leg Curl', sets: '5', reps: '5', notes: 'Full posterior chain.'},
      {name: 'Conventional Deadlift', sets: '5', reps: '5', notes: 'Full body. Do before squat.'},
      {name: 'Good Morning', sets: '4', reps: '6', notes: 'Hamstrings + spinal erectors.'},
    ],
    medium: [
      {name: 'Heavy Lunges', biseriePair: 'Leg Curl', sets: '4', reps: '8'},
      {name: 'Hip Thrust', sets: '4', reps: '10', notes: 'Glute bias. Pause at top.'},
      {name: 'Glute Ham Raise', sets: '3', reps: '10'},
      {name: 'Stiff-Leg DB Deadlift', sets: '3', reps: '12'},
    ],
    low: [
      {name: 'Leg Curl Machine', sets: '3', reps: '15-20', notes: 'No spinal load.'},
      {name: 'Cable Glute Kickback', sets: '3', reps: '15', notes: 'Per leg.'},
      {name: 'Back Hyperextension', sets: '3', reps: '15-20'},
    ],
  },
  chest: {
    high: [
      {name: 'Bench Press', biseriePair: 'Cable Crossover', sets: '5', reps: '5', notes: 'SACRED — no secondary groups recommended.'},
      {name: 'Incline Barbell', biseriePair: 'Cable Crossover', sets: '4', reps: '6'},
      {name: 'Weighted Dips', sets: '4', reps: '6', notes: 'Lean forward for chest bias.'},
      {name: 'Close-Grip Bench Press', sets: '4', reps: '6', notes: 'Chest + triceps overload.'},
    ],
    medium: [
      {name: 'Dumbbell Press', sets: '4', reps: '10', notes: 'Full ROM.'},
      {name: 'Incline DB Press', sets: '4', reps: '10'},
      {name: 'Machine Chest Press', sets: '3', reps: '10-12'},
      {name: 'DB Fly', sets: '3', reps: '12', notes: 'Stretch deep.'},
    ],
    low: [
      {name: 'Push-ups / Cable Fly', sets: '3', reps: '15-20', notes: 'Blood flow.'},
      {name: 'Pec Deck Fly', sets: '3', reps: '15-20'},
      {name: 'Low-to-High Cable Fly', sets: '3', reps: '15', notes: 'Upper chest pump.'},
    ],
  },
  back: {
    high: [
      {name: 'Deadlift', biseriePair: 'Cable Row', sets: '5', reps: '5', notes: 'Always before squat if same day.'},
      {name: 'Weighted Pull-ups', sets: '5', reps: '5', notes: 'Lat focus.'},
      {name: 'Pendlay Row', sets: '5', reps: '5', notes: 'Dead-stop every rep.'},
    ],
    medium: [
      {name: 'Barbell Row', biseriePair: 'Cable Pullover', sets: '5', reps: '5', notes: 'PAP + muscle length.'},
      {name: 'T-Bar Row', sets: '4', reps: '8-10'},
      {name: 'Lat Pulldown (wide)', sets: '4', reps: '10'},
      {name: 'Single-Arm DB Row', sets: '3', reps: '10', notes: 'Per side.'},
    ],
    low: [
      {name: 'Cable Row', sets: '3', reps: '15', notes: 'Activation only.'},
      {name: 'Straight-Arm Pulldown', sets: '3', reps: '15', notes: 'Lat pump.'},
      {name: 'Face Pull', sets: '3', reps: '15-20', notes: 'Rear delt + upper back.'},
    ],
  },
  shoulder: {
    high: [
      {name: 'Clean and Press', biseriePair: 'Lateral Raises', sets: '5', reps: '5', notes: 'PAP + selective isolation.'},
      {name: 'Overhead Press (Barbell)', sets: '5', reps: '5', notes: 'Strict. No leg drive.'},
      {name: 'Push Press', sets: '4', reps: '5', notes: 'Leg drive allowed for overload.'},
    ],
    medium: [
      {name: 'DB Shoulder Press', sets: '4', reps: '10'},
      {name: 'Lateral + Front Raises', sets: '3', reps: '12-15'},
      {name: 'Arnold Press', sets: '3', reps: '10', notes: 'Full ROM rotation.'},
      {name: 'Upright Row (EZ bar)', sets: '3', reps: '10'},
    ],
    low: [
      {name: 'Lateral Raises', sets: '3', reps: '15-20', notes: 'Pump.'},
      {name: 'Cable Lateral Raise', sets: '3', reps: '15-20', notes: 'Constant tension.'},
      {name: 'Reverse Pec Deck', sets: '3', reps: '15-20', notes: 'Rear delt pump.'},
    ],
  },
  biceps: {
    high: [
      {name: 'Cheated EZ Curl', biseriePair: 'Dragon Curl', sets: '4', reps: '6-8', notes: 'Heavy eccentric. Dragon Curl: lower half (0-90).'},
      {name: 'Weighted Chin-Up', sets: '4', reps: '6', notes: 'Underhand, close grip.'},
      {name: 'Barbell Curl (heavy)', sets: '4', reps: '6', notes: 'Strict. Full ROM.'},
    ],
    medium: [
      {name: 'DB Curl', sets: '3', reps: '10-12'},
      {name: 'Hammer Curls', sets: '3', reps: '10-12'},
      {name: 'Incline DB Curl', sets: '3', reps: '10', notes: 'Long head stretch.'},
      {name: 'Preacher Curl', sets: '3', reps: '10'},
    ],
    low: [
      {name: 'Cable Curl', sets: '3', reps: '15-20'},
      {name: 'Concentration Curl', sets: '3', reps: '15', notes: 'Per arm. Squeeze peak.'},
      {name: 'Spider Curl', sets: '3', reps: '15-20', notes: 'Constant tension pump.'},
    ],
  },
  triceps: {
    high: [
      {name: 'EZ Skull Crusher', biseriePair: 'Cable Pushdown', sets: '4', reps: '6-8', notes: 'Long head max stretch.'},
      {name: 'Close-Grip Bench Press', sets: '4', reps: '5', notes: 'Compound triceps overload.'},
      {name: 'Weighted Dips (upright)', sets: '4', reps: '6', notes: 'Vertical torso = triceps bias.'},
    ],
    medium: [
      {name: 'DB Skull Crusher', sets: '3', reps: '10-12'},
      {name: 'Cable Pushdown', sets: '3', reps: '12'},
      {name: 'Overhead DB Extension', sets: '3', reps: '10', notes: 'Long head stretch.'},
      {name: 'Rope Pushdown', sets: '3', reps: '10-12'},
    ],
    low: [
      {name: 'Light Cable Pushdown', sets: '3', reps: '15-20'},
      {name: 'DB Kickback', sets: '3', reps: '15', notes: 'Per arm.'},
      {name: 'Bench Dip (bodyweight)', sets: '3', reps: '15-20'},
    ],
  },
};
