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
  | 'traps'
  | 'neck';

export type Phase = 'warmup' | 'multijoint' | 'heavy' | 'medium' | 'pump';

export const PHASE_LABELS: Record<Phase, string> = {
  warmup: 'Warm-up Circuit',
  multijoint: 'Multi-joint Complete',
  heavy: 'Heavy Strength',
  medium: 'Medium / Hypertrophy',
  pump: 'Finisher / Pump',
};

export const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  warmup: 'HIIT-style full-body activation. Bodyweight, dynamic, fast.',
  multijoint: 'One total-body compound flow. Light-moderate, technique focus.',
  heavy: 'Heavy compound based on the multi-joint pattern. 3-5 reps.',
  medium: 'Hypertrophy accessories. 8-12 reps, target the gaps.',
  pump: 'Optional isolation finisher. 15-20 reps, blood flow.',
};

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
  /** Phases this exercise fits into in the phased-builder wizard. */
  phases?: Phase[];
  /** Equipment required, for filtering. */
  equipment?: ('barbell' | 'dumbbell' | 'kettlebell' | 'cable' | 'machine' | 'bodyweight' | 'band' | 'box')[];
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
  'biceps', 'triceps', 'core', 'calves', 'forearms', 'traps', 'neck',
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
  neck: 'Neck',
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

export type LibraryExercise = Exercise & {
  category: ExerciseCategory;
  primary: MuscleGroup[];
};

type FlatExercise = LibraryExercise;

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

/* ── PHASE 1 / 2 ADDITIONS — warmup circuit + multi-joint complete flows ── */
const PHASED_ADDITIONS: FlatExercise[] = [
  // ─── Warm-up circuit (Phase 1) ───
  // Cardio / aerobic prep
  {name: 'Jumping Jacks', category: 'metabolic', primary: ['shoulder', 'calves'], secondary: ['core'], compound: true, sets: '3', reps: '30s', notes: 'Aerobic + arm/leg coordination.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Jump Rope', category: 'metabolic', primary: ['calves'], secondary: ['shoulder', 'core'], sets: '3', reps: '60s', notes: 'Best calf prep. Skip light.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'High Knees', category: 'metabolic', primary: ['quad'], secondary: ['core', 'calves'], sets: '3', reps: '30s', notes: 'Hip flexor activation.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Butt Kicks', category: 'metabolic', primary: ['posterior'], secondary: ['calves'], sets: '3', reps: '30s', notes: 'Hamstring activation.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Mountain Climbers', category: 'metabolic', primary: ['core', 'shoulder'], secondary: ['quad'], compound: true, sets: '3', reps: '30s', notes: 'Plank + alternating knee drive.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Bear Crawl', category: 'metabolic', primary: ['core', 'shoulder'], secondary: ['quad', 'triceps'], compound: true, sets: '3', reps: '15-20m', notes: 'Slow, controlled. Core stability.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Crab Walk', category: 'metabolic', primary: ['posterior', 'triceps'], secondary: ['core', 'shoulder'], compound: true, sets: '3', reps: '15-20m', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Inchworm Walkout', category: 'metabolic', primary: ['core'], secondary: ['shoulder', 'posterior'], compound: true, sets: '3', reps: '8-10', notes: 'Hip + hamstring + shoulder mobility.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'World’s Greatest Stretch', category: 'metabolic', primary: ['core'], secondary: ['posterior', 'shoulder'], sets: '2', reps: '5/side', notes: 'Lunge + thoracic rotation. Best general warmup.', phases: ['warmup'], equipment: ['bodyweight']},

  // Push-up family
  {name: 'Standard Push-Up', category: 'metabolic', primary: ['chest'], secondary: ['triceps', 'shoulder', 'core'], compound: true, sets: '3', reps: '15-20', primarySub: ['chest_mid'], secondarySub: ['triceps_lateral', 'delt_front'], phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Incline Push-Up', category: 'metabolic', primary: ['chest'], secondary: ['triceps', 'shoulder'], compound: true, sets: '3', reps: '15-20', notes: 'Hands elevated. Lower-pec bias.', primarySub: ['chest_lower'], phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Decline Push-Up', category: 'metabolic', primary: ['chest', 'shoulder'], secondary: ['triceps', 'core'], compound: true, sets: '3', reps: '12-15', notes: 'Feet elevated. Upper-chest + delts.', primarySub: ['chest_upper', 'delt_front'], phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Diamond Push-Up', category: 'metabolic', primary: ['triceps', 'chest'], secondary: ['shoulder'], compound: true, sets: '3', reps: '10-15', primarySub: ['triceps_lateral', 'triceps_medial'], phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Plyo Push-Up', category: 'metabolic', primary: ['chest'], secondary: ['triceps', 'shoulder'], compound: true, sets: '4', reps: '6-10', notes: 'Explosive. Hands leave floor.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Hindu Push-Up', category: 'metabolic', primary: ['chest', 'shoulder'], secondary: ['core', 'triceps'], compound: true, sets: '3', reps: '10-12', notes: 'Down-dog to up-dog flow.', phases: ['warmup'], equipment: ['bodyweight']},

  // Squat / lunge family (light)
  {name: 'Bodyweight Squat', category: 'metabolic', primary: ['quad'], secondary: ['posterior', 'core'], compound: true, sets: '3', reps: '20', notes: 'Fast, full ROM. No weight.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Air Squat (fast)', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['core', 'calves'], compound: true, sets: '3', reps: '30s', notes: 'AMRAP per round.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Front Squat (light)', category: 'metabolic', primary: ['quad'], secondary: ['core', 'shoulder'], compound: true, sets: '3', reps: '12-15', notes: 'Empty bar / very light. Pattern primer.', primarySub: ['rectus_femoris', 'vastus_medialis'], phases: ['warmup'], equipment: ['barbell']},
  {name: 'Cossack Squat', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['core'], compound: true, sets: '2', reps: '6/side', notes: 'Lateral squat. Hip mobility.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Reverse Lunge (BW)', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['core'], compound: true, sets: '3', reps: '10/leg', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Walking Lunge (BW)', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['core', 'calves'], compound: true, sets: '3', reps: '20', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Lateral Lunge', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['core'], compound: true, sets: '3', reps: '8/side', phases: ['warmup'], equipment: ['bodyweight']},

  // Plyometric / jump
  {name: 'Jump Squat (low load)', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '3', reps: '10', notes: 'Soft landing. Reset between reps.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Jump Lunge (alternating)', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '3', reps: '20', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Tuck Jump', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '3', reps: '10', notes: 'Knees high. Explosive.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Skater Jump', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '3', reps: '20', notes: 'Lateral hop. Ankle stability.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Pogo Jumps', category: 'metabolic', primary: ['calves'], secondary: ['core'], sets: '3', reps: '20', notes: 'Stiff legs. Pop off ground.', primarySub: ['gastrocnemius'], phases: ['warmup'], equipment: ['bodyweight']},

  // Core / plank flows
  {name: 'Plank Up-Down', category: 'metabolic', primary: ['core', 'triceps'], secondary: ['shoulder'], compound: true, sets: '3', reps: '30s', notes: 'Plank ↔ push-up transition.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Bird Dog', category: 'isolation', primary: ['core', 'posterior'], sets: '2', reps: '8/side', notes: 'Anti-rotation core.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Glute Bridge (BW)', category: 'metabolic', primary: ['posterior'], secondary: ['core'], sets: '3', reps: '15', notes: 'Glute activation.', primarySub: ['glute_max'], phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Hollow Hold', category: 'isolation', primary: ['core'], sets: '3', reps: '20-30s', notes: 'Anti-extension.', primarySub: ['abs_lower', 'abs_upper'], phases: ['warmup'], equipment: ['bodyweight']},

  // Band / mobility
  {name: 'Band Pull-Apart', category: 'isolation', primary: ['shoulder'], secondary: ['back'], sets: '3', reps: '15', notes: 'Rear delt + scap warmup.', primarySub: ['delt_rear', 'rhomboids'], phases: ['warmup'], equipment: ['band']},
  {name: 'Band Face Pull', category: 'isolation', primary: ['shoulder', 'back'], sets: '3', reps: '15', notes: 'Rear delt + upper back warmup.', primarySub: ['delt_rear', 'traps_mid'], phases: ['warmup'], equipment: ['band']},
  {name: 'Band Dislocates', category: 'isolation', primary: ['shoulder'], sets: '2', reps: '10', notes: 'Shoulder mobility before pressing.', phases: ['warmup'], equipment: ['band']},
  {name: 'Cat-Cow', category: 'isolation', primary: ['core'], secondary: ['back'], sets: '2', reps: '8', notes: 'Spinal mobility.', phases: ['warmup'], equipment: ['bodyweight']},

  // ─── Strength circuits (Phase 1, heavier) ───
  {name: 'Barbell Complex (5/5/5/5/5)', category: 'metabolic', primary: ['quad', 'shoulder', 'back'], secondary: ['posterior', 'core', 'biceps'], compound: true, sets: '5', reps: '5 each', notes: 'Deadlift / row / clean / front squat / push press, 5 reps each unbroken. 90s rest between rounds.', phases: ['warmup'], equipment: ['barbell']},
  {name: 'DB Strength Circuit', category: 'metabolic', primary: ['shoulder', 'quad', 'back'], secondary: ['posterior', 'core', 'biceps'], compound: true, sets: '4', reps: '8 each', notes: 'Squat / row / push press / RDL / curl. 60s rest between rounds.', phases: ['warmup'], equipment: ['dumbbell']},
  {name: 'KB Strength Circuit', category: 'metabolic', primary: ['posterior', 'shoulder'], secondary: ['back', 'core', 'quad'], compound: true, sets: '4', reps: '10 each', notes: 'Swing / goblet squat / press / row / clean. 60s rest.', phases: ['warmup'], equipment: ['kettlebell']},
  {name: 'Push-Pull AMRAP', category: 'metabolic', primary: ['chest', 'back'], secondary: ['triceps', 'biceps', 'shoulder', 'core'], compound: true, sets: '1', reps: '12 min AMRAP', notes: '5 pull-ups + 10 push-ups + 15 squats. As many rounds as possible.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Cindy (CrossFit)', category: 'metabolic', primary: ['chest', 'back', 'quad'], secondary: ['triceps', 'biceps', 'core', 'posterior'], compound: true, sets: '1', reps: '20 min AMRAP', notes: '5 pull-ups + 10 push-ups + 15 air squats per round. Classic benchmark.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Chelsea (EMOM)', category: 'metabolic', primary: ['chest', 'back', 'quad'], secondary: ['triceps', 'core'], compound: true, sets: '30', reps: 'EMOM 30 min', notes: '5 pull-ups + 10 push-ups + 15 air squats every minute on the minute.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Fran (21-15-9)', category: 'metabolic', primary: ['quad', 'shoulder', 'back'], secondary: ['posterior', 'core', 'triceps'], compound: true, sets: '1', reps: '21-15-9', notes: 'Thrusters + pull-ups, 21 of each, then 15, then 9. For time.', phases: ['warmup'], equipment: ['barbell']},
  {name: 'Death by Burpees', category: 'metabolic', primary: ['chest', 'quad'], secondary: ['core', 'shoulder', 'triceps'], compound: true, sets: '1', reps: 'EMOM ladder', notes: '1 burpee min 1, 2 min 2, 3 min 3… until you fail. Brutal.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Squat EMOM', category: 'metabolic', primary: ['quad'], secondary: ['posterior', 'core'], compound: true, sets: '10', reps: 'EMOM 5 reps', notes: '5 reps every minute on the minute, 10 min. 60-70% 1RM.', primarySub: ['vastus_lateralis', 'rectus_femoris'], phases: ['warmup'], equipment: ['barbell']},
  {name: 'Deadlift EMOM', category: 'metabolic', primary: ['posterior', 'back'], secondary: ['traps', 'forearms', 'core'], compound: true, sets: '10', reps: 'EMOM 3 reps', notes: '3 reps every minute, 10 min. 65-75% 1RM. Technique focus.', primarySub: ['glute_max', 'hams_bf', 'erectors'], phases: ['warmup'], equipment: ['barbell']},
  {name: 'Bench Press EMOM', category: 'metabolic', primary: ['chest'], secondary: ['triceps', 'shoulder'], compound: true, sets: '10', reps: 'EMOM 5 reps', notes: '5 reps every minute, 10 min. 60% 1RM.', primarySub: ['chest_mid'], phases: ['warmup'], equipment: ['barbell']},
  {name: 'OHP EMOM', category: 'metabolic', primary: ['shoulder'], secondary: ['triceps', 'core'], compound: true, sets: '10', reps: 'EMOM 5 reps', notes: '5 reps every minute, 10 min. 60% 1RM. Strict press.', primarySub: ['delt_front'], phases: ['warmup'], equipment: ['barbell']},
  {name: 'Pull-Up Ladder', category: 'metabolic', primary: ['back'], secondary: ['biceps', 'forearms', 'core'], compound: true, sets: '1', reps: '1→2→3…', notes: 'Climb the ladder. 1 rep, rest, 2 reps, rest, etc. until failure.', primarySub: ['lats'], phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Tabata Squats', category: 'metabolic', primary: ['quad'], secondary: ['posterior', 'core', 'calves'], compound: true, sets: '8', reps: '20s on / 10s off', notes: '8 rounds × 4 min total. Body-weight or light DB.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Tabata KB Swings', category: 'metabolic', primary: ['posterior'], secondary: ['core', 'shoulder', 'forearms'], compound: true, sets: '8', reps: '20s on / 10s off', notes: '8 rounds × 4 min. Conditioning.', phases: ['warmup'], equipment: ['kettlebell']},
  {name: '5-Station Strength Circuit', category: 'metabolic', primary: ['chest', 'back', 'quad'], secondary: ['shoulder', 'core', 'posterior'], compound: true, sets: '3', reps: '60s each', notes: 'Bench / Row / Squat / OHP / Deadlift. 60s work, 30s transition. 3 rounds.', phases: ['warmup'], equipment: ['barbell']},
  {name: 'Renegade Row Circuit', category: 'metabolic', primary: ['back', 'core'], secondary: ['chest', 'shoulder', 'biceps'], compound: true, sets: '4', reps: '8 each', notes: 'Push-up + row L + row R + plank → 8 rounds.', primarySub: ['lats', 'rhomboids', 'abs_upper'], phases: ['warmup'], equipment: ['dumbbell']},
  {name: 'Sled Push + Pull-Up', category: 'metabolic', primary: ['quad', 'back'], secondary: ['posterior', 'core', 'biceps'], compound: true, sets: '5', reps: '20m + 5', notes: 'Sled push 20m, then 5 pull-ups, repeat 5 rounds.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Farmer Carry + Jump Squat', category: 'metabolic', primary: ['forearms', 'quad'], secondary: ['traps', 'core', 'posterior'], compound: true, sets: '4', reps: '30m + 10', notes: '30m heavy farmer carry, 10 jump squats, 60s rest.', phases: ['warmup'], equipment: ['dumbbell']},
  {name: 'Thruster Ladder', category: 'metabolic', primary: ['quad', 'shoulder'], secondary: ['posterior', 'core', 'triceps'], compound: true, sets: '1', reps: '10→8→6→4→2', notes: 'Descending rep ladder. 60s rest between sets. Light-moderate DBs.', phases: ['warmup'], equipment: ['dumbbell']},
  {name: 'Bear Complex (heavy)', category: 'metabolic', primary: ['quad', 'shoulder', 'back'], secondary: ['posterior', 'core'], compound: true, sets: '5', reps: '7 rounds', notes: 'Power clean → front squat → push press → back squat → push press behind neck. 5 sets × 7 unbroken rounds.', phases: ['warmup'], equipment: ['barbell']},
  {name: '100 Rep Challenge', category: 'metabolic', primary: ['chest'], secondary: ['triceps', 'shoulder'], compound: true, sets: '1', reps: '100 reps', notes: 'Pick a lift (push-ups, bench at light load, squats, etc.). 100 total reps as fast as possible.', phases: ['warmup'], equipment: ['bodyweight']},

  // ─── Multi-joint complete flows (Phase 2) ───
  {name: 'DB Clean & Press', category: 'metabolic', primary: ['shoulder', 'posterior'], secondary: ['back', 'quad', 'core'], compound: true, sets: '4', reps: '8-10', notes: 'Per side. Full body. Pattern: pull from floor, press overhead.', primarySub: ['delt_front', 'glute_max'], phases: ['multijoint'], equipment: ['dumbbell']},
  {name: 'DB Snatch', category: 'metabolic', primary: ['shoulder', 'posterior'], secondary: ['back', 'core', 'traps'], compound: true, sets: '4', reps: '6-8', notes: 'Single DB ground-to-overhead in one move.', primarySub: ['delt_front', 'glute_max', 'hams_bf'], phases: ['multijoint'], equipment: ['dumbbell']},
  {name: 'DB Thruster', category: 'metabolic', primary: ['quad', 'shoulder'], secondary: ['posterior', 'core', 'triceps'], compound: true, sets: '4', reps: '10-12', notes: 'Front squat → press without pause.', primarySub: ['rectus_femoris', 'delt_front'], phases: ['multijoint'], equipment: ['dumbbell']},
  {name: 'KB Clean & Press', category: 'metabolic', primary: ['shoulder', 'posterior'], secondary: ['back', 'core', 'forearms'], compound: true, sets: '4', reps: '8-10', notes: 'Per side.', phases: ['multijoint'], equipment: ['kettlebell']},
  {name: 'KB Swing (heavy)', category: 'metabolic', primary: ['posterior'], secondary: ['core', 'shoulder', 'forearms'], compound: true, sets: '5', reps: '15-20', notes: 'Hip hinge. Power from glutes, not arms.', primarySub: ['glute_max', 'hams_bf'], phases: ['multijoint'], equipment: ['kettlebell']},
  {name: 'KB Snatch', category: 'metabolic', primary: ['posterior', 'shoulder'], secondary: ['back', 'core', 'traps', 'forearms'], compound: true, sets: '4', reps: '8-10', notes: 'Per side. Most complete KB lift.', phases: ['multijoint'], equipment: ['kettlebell']},
  {name: 'KB Goblet Squat', category: 'metabolic', primary: ['quad'], secondary: ['posterior', 'core', 'shoulder'], compound: true, sets: '4', reps: '10-12', phases: ['multijoint'], equipment: ['kettlebell']},
  {name: 'DB Renegade Row', category: 'metabolic', primary: ['back', 'core'], secondary: ['biceps', 'shoulder'], compound: true, sets: '4', reps: '8/side', notes: 'Plank + row. Anti-rotation.', primarySub: ['lats', 'rhomboids', 'abs_upper'], phases: ['multijoint'], equipment: ['dumbbell']},
  {name: 'Devil’s Press', category: 'metabolic', primary: ['shoulder', 'chest'], secondary: ['posterior', 'core', 'quad'], compound: true, sets: '4', reps: '8-10', notes: 'Burpee + DB snatch. Brutal.', phases: ['multijoint'], equipment: ['dumbbell']},
  {name: 'DB Man-Maker', category: 'metabolic', primary: ['shoulder', 'back', 'quad'], secondary: ['chest', 'core', 'triceps'], compound: true, sets: '4', reps: '6-8', notes: 'Push-up → row each arm → clean → thruster.', phases: ['multijoint'], equipment: ['dumbbell']},
  {name: 'DB Step-Up & Press', category: 'metabolic', primary: ['quad', 'shoulder'], secondary: ['posterior', 'core'], compound: true, sets: '4', reps: '8/side', phases: ['multijoint'], equipment: ['dumbbell', 'box']},
  {name: 'Arnold Press (light)', category: 'metabolic', primary: ['shoulder'], secondary: ['triceps'], compound: true, sets: '4', reps: '10-12', notes: 'Light DB. Full rotation primer.', primarySub: ['delt_front', 'delt_side'], phases: ['multijoint'], equipment: ['dumbbell']},
  {name: 'Front Squat (medium)', category: 'metabolic', primary: ['quad'], secondary: ['core', 'posterior', 'shoulder'], compound: true, sets: '4', reps: '8-10', notes: 'Moderate barbell. Pattern + warmup for heavy.', primarySub: ['rectus_femoris', 'vastus_medialis'], phases: ['multijoint'], equipment: ['barbell']},
  {name: 'Power Clean (light)', category: 'metabolic', primary: ['posterior', 'back'], secondary: ['quad', 'shoulder', 'traps'], compound: true, sets: '4', reps: '5', notes: 'Technique work. 50-60% 1RM.', phases: ['multijoint'], equipment: ['barbell']},
  {name: 'Hang Clean (light)', category: 'metabolic', primary: ['posterior', 'back'], secondary: ['quad', 'shoulder', 'traps'], compound: true, sets: '4', reps: '5', phases: ['multijoint'], equipment: ['barbell']},
  {name: 'Push Press (light)', category: 'metabolic', primary: ['shoulder'], secondary: ['triceps', 'quad', 'core'], compound: true, sets: '4', reps: '6-8', notes: 'Pattern primer for heavy OHP.', phases: ['multijoint'], equipment: ['barbell']},
  {name: 'Barbell Complex (Bear)', category: 'metabolic', primary: ['quad', 'shoulder', 'back'], secondary: ['posterior', 'core', 'biceps'], compound: true, sets: '4', reps: '6 rounds', notes: 'Power clean → front squat → push press → back squat → push press behind neck. 1 round = all 5 unbroken.', phases: ['multijoint'], equipment: ['barbell']},
  {name: 'DB Complex', category: 'metabolic', primary: ['shoulder', 'back', 'quad'], secondary: ['core', 'biceps', 'posterior'], compound: true, sets: '4', reps: '6 rounds', notes: 'Curl → press → squat → row → RDL. Light DBs, no rest within round.', phases: ['multijoint'], equipment: ['dumbbell']},
  {name: 'KB Complex', category: 'metabolic', primary: ['posterior', 'shoulder'], secondary: ['back', 'core', 'quad'], compound: true, sets: '4', reps: '6 rounds', notes: 'Swing → clean → press → squat → row.', phases: ['multijoint'], equipment: ['kettlebell']},
  {name: 'Sandbag Get-Up', category: 'metabolic', primary: ['core', 'posterior'], secondary: ['shoulder', 'quad'], compound: true, sets: '3', reps: '8-10', notes: 'Floor to standing with sandbag bear hug.', phases: ['multijoint']},
];

/* Phase tags for existing strong lifts (Phase 3 / 4 / 5) */
const PHASE_TAGS: Record<string, Phase[]> = {
  // Phase 3 — heavy strength
  'Bench Press': ['heavy'], 'Paused Bench': ['heavy'], 'Close-Grip Bench': ['heavy'], 'Close-Grip Bench Press': ['heavy'],
  'Incline Barbell': ['heavy'], 'Weighted Dips': ['heavy'], 'Weighted Dips (upright)': ['heavy'],
  'Barbell Back Squat': ['heavy'], 'Front Squat': ['heavy'], 'Pause Back Squat': ['heavy'],
  'Box Squat': ['heavy'], 'Safety Bar Squat': ['heavy'],
  'Deadlift': ['heavy'], 'Conventional Deadlift': ['heavy'], 'Sumo Deadlift': ['heavy'],
  'Romanian Deadlift (heavy)': ['heavy'], 'Deficit Deadlift': ['heavy'], 'Good Morning': ['heavy'],
  'Rack Pulls': ['heavy'],
  'Overhead Press (Barbell)': ['heavy'], 'Push Press': ['heavy'],
  'Clean and Press': ['heavy'], 'Power Clean': ['heavy'], 'Hang Clean': ['heavy'],
  'Clean & Jerk': ['heavy'], 'Snatch': ['heavy'], 'Snatch Pull': ['heavy'],
  'Push Jerk': ['heavy'], 'Split Jerk': ['heavy'],
  'Barbell Row': ['heavy'], 'Pendlay Row': ['heavy'], 'T-Bar Row': ['heavy'],
  'Weighted Pull-Up': ['heavy'], 'Weighted Pull-ups': ['heavy'], 'Weighted Chin-Up': ['heavy'],

  // Phase 4 — medium / hypertrophy
  'Incline DB Press': ['medium'], 'Flat DB Press': ['medium'], 'Dumbbell Press': ['medium'],
  'Machine Chest Press': ['medium'], 'DB Fly': ['medium'], 'Smith Incline Press': ['medium'], 'Hammer Strength Incline': ['medium'],
  'Leg Press': ['medium'], 'Hack Squat': ['medium'], 'Bulgarian Split Squat': ['medium'],
  'Walking Lunges (DB)': ['medium'], 'Heavy Lunges': ['medium'], 'Heavy Walking Lunges': ['medium'],
  'Smith Machine Squat': ['medium'], 'Goblet Squat': ['medium'],
  'Hip Thrust': ['medium'], 'Glute Ham Raise': ['medium'], 'Stiff-Leg DB Deadlift': ['medium'], 'Single-Leg RDL': ['medium'],
  'Lat Pulldown (wide)': ['medium'], 'Single-Arm DB Row': ['medium'], 'Chest-Supported Row': ['medium'], 'Seated Cable Row': ['medium'],
  'Seated DB Shoulder Press': ['medium'], 'DB Shoulder Press': ['medium'], 'Arnold Press': ['medium'], 'Machine Shoulder Press': ['medium'], 'Z Press': ['medium'],
  'Preacher Curl': ['medium'], 'Preacher Curl (EZ bar)': ['medium'],
  'Incline DB Curl': ['medium'], 'Hammer Curl': ['medium'], 'Cable Curl': ['medium'], 'Cable Curl (bar)': ['medium'], 'DB Curl': ['medium'], 'Rope Hammer Curl': ['medium'],
  'EZ Skull Crusher': ['medium'], 'DB Skull Crusher': ['medium'], 'Overhead DB Extension': ['medium'], 'Rope Pushdown': ['medium'], 'V-Bar Pushdown': ['medium'], 'Cable Pushdown': ['medium'],
  'Heavy Barbell Shrug': ['medium'], 'DB Shrug (heavy)': ['medium'],
  'Standing Calf Raise': ['medium'], 'Donkey Calf Raise': ['medium'], 'Calf Press (leg press)': ['medium'],
  'Hanging Leg Raise': ['medium'], 'Cable Woodchopper': ['medium'],

  // Phase 5 — pump
  'Pec Deck Fly': ['pump'], 'Cable Crossover': ['pump'], 'Low-to-High Cable Fly': ['pump'],
  'Leg Extension': ['pump'], 'Sissy Squat': ['pump'], 'Cyclist Squat': ['pump'], 'Single-Leg Extension': ['pump'], 'Walking Lunges (light)': ['pump'],
  'Lying Leg Curl': ['pump'], 'Seated Leg Curl': ['pump'], 'Cable Glute Kickback': ['pump'], 'Cable Pull-Through': ['pump'], 'Back Hyperextension': ['pump'],
  'Straight-Arm Pulldown': ['pump'], 'Face Pull': ['pump'], 'Cable Row': ['pump'],
  'Reverse Pec Deck': ['pump'], 'Reverse Pec Deck (rear)': ['pump'], 'Lateral Raises': ['pump'], 'DB Lateral Raise': ['pump'], 'Cable Lateral Raise': ['pump'], 'Front Raise (DB/Plate)': ['pump'], 'Upright Row (EZ bar)': ['pump'],
  'Concentration Curl': ['pump'], 'Spider Curl': ['pump'], 'Single-Arm Cable Curl': ['pump'], 'Reverse Curl (EZ bar)': ['pump'],
  'DB Kickback': ['pump'], 'Cable Kickback': ['pump'], 'Light Cable Pushdown': ['pump'], 'Single-Arm Rope Extension': ['pump'], 'Bench Dip (bodyweight)': ['pump'],
  'Seated Calf Raise': ['pump'], 'Single-Leg Calf Raise': ['pump'],
  'Wrist Curl': ['pump'], 'Reverse Wrist Curl': ['pump'],
};

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

/* ── PROVEN STRENGTH CANON (Phase 3 / heavy) ──
   Powerlifting accessories, Olympic-lift completions, strongman events,
   elite calisthenics, and research-backed strength-circuit movements
   (McGill loaded carries, Tsatsouline/RKC kettlebell, Westside
   reverse-hyper/pin-work).
   ───────────────────────────────────────── */
/* ── KOT (Knees Over Toes / Ben Patrick) tendon & joint protocol + Soviet
   conjugate / Westside / Verkhoshansky lifts. Two distinct methodologies
   bundled here because both are "training-tradition" rather than category. ── */
const TRADITION_ADDITIONS: FlatExercise[] = [
  // ─── KOT / Tendon — Ben Patrick's knee + ankle resilience canon ───
  {name: 'ATG Split Squat', category: 'strength', primary: ['quad'], secondary: ['posterior', 'core'], compound: true, sets: '3', reps: '5-10/leg', notes: 'Knees Over Toes signature. Front foot elevated, deep knee-forward descent. Builds patellar-tendon resilience through full ROM.', primarySub: ['rectus_femoris', 'vastus_medialis'], secondarySub: ['glute_max'], phases: ['heavy', 'medium'], equipment: ['bodyweight', 'dumbbell']},
  {name: 'Patrick Step', category: 'strength', primary: ['quad'], secondary: ['core', 'calves'], sets: '3', reps: '8-12/leg', notes: 'KOT classic. Slow eccentric step-down from a 6-12" deficit; tap heel, drive up. Patellar-tendon rehab/prehab.', primarySub: ['rectus_femoris', 'vastus_medialis'], phases: ['medium'], equipment: ['bodyweight', 'box']},
  {name: 'Slant Board Squat', category: 'hypertrophy', primary: ['quad'], secondary: ['core'], sets: '3', reps: '10-15', notes: 'Heels on a 25° slant; deep squat. KOT staple for VMO development and knee tracking.', primarySub: ['vastus_medialis', 'rectus_femoris'], phases: ['medium'], equipment: ['bodyweight', 'dumbbell']},
  {name: 'Spanish Squat', category: 'isolation', primary: ['quad'], secondary: ['core'], sets: '3', reps: '12-15', notes: 'Band around knees, sit back into the band. Isometric-flavored knee load — patellar-tendinopathy rehab classic.', primarySub: ['vastus_medialis', 'rectus_femoris'], phases: ['pump', 'warmup'], equipment: ['band']},
  {name: 'Tibialis Raise (wall)', category: 'isolation', primary: ['calves'], sets: '3', reps: '15-25', notes: 'Stand against wall, lift toes. The KOT shin-splint preventer. Anterior tibialis is wildly under-trained.', phases: ['warmup', 'pump'], equipment: ['bodyweight']},
  {name: 'Weighted Tibialis Raise', category: 'isolation', primary: ['calves'], sets: '3', reps: '12-15', notes: 'Plate or KB resting on toes; raise toes against load. Progression from bodyweight version.', phases: ['medium', 'pump'], equipment: ['dumbbell', 'kettlebell']},
  {name: 'Reverse Sled Drag', category: 'metabolic', primary: ['quad', 'calves'], secondary: ['core'], compound: true, sets: '4', reps: '20-30m', notes: 'Walk backward pulling sled. The KOT secret-sauce for VMO + tibialis + knee resilience. Zero eccentric loading.', primarySub: ['vastus_medialis', 'rectus_femoris'], phases: ['warmup', 'multijoint']},
  {name: 'Copenhagen Plank', category: 'isolation', primary: ['core'], secondary: ['posterior'], sets: '3', reps: '20-40s/side', notes: 'Side plank with top leg on a bench — loads adductors. Groin-strain prehab classic.', primarySub: ['obliques'], phases: ['warmup', 'medium'], equipment: ['bodyweight']},
  {name: 'Single-Leg Calf Raise (Alfredson)', category: 'hypertrophy', primary: ['calves'], sets: '3', reps: '15 eccentric', notes: 'Slow 3-5s eccentric on one leg, both legs help up. The Alfredson protocol for Achilles tendinopathy — gold-standard tendon rehab.', primarySub: ['gastrocnemius', 'soleus'], phases: ['medium'], equipment: ['bodyweight']},
  {name: 'Reverse Nordic Curl', category: 'isolation', primary: ['quad'], secondary: ['core'], sets: '3', reps: '8-12', notes: 'Kneel, lean back, control descent. Targets rectus femoris through extreme stretch — KOT favorite for hip-flexor / quad-tendon resilience.', primarySub: ['rectus_femoris'], phases: ['warmup', 'medium'], equipment: ['bodyweight']},
  {name: 'Heavy Slow Resistance Calf', category: 'strength', primary: ['calves'], sets: '4', reps: '6-15 (3s up / 3s down)', notes: 'HSR protocol — Kongsgaard/Magnusson research. Three-second concentric, three-second eccentric, heavy load. Best-evidence tendon-remodeling stimulus.', primarySub: ['gastrocnemius', 'soleus'], phases: ['heavy', 'medium'], equipment: ['machine', 'barbell']},
  {name: 'KOT Hip Airplane', category: 'isolation', primary: ['posterior'], secondary: ['core'], sets: '3', reps: '8/side', notes: 'Single-leg balance with hip rotation. Hip-stabilizer prehab.', primarySub: ['glute_med', 'glute_max'], phases: ['warmup'], equipment: ['bodyweight']},

  // ─── Soviet conjugate / Westside / Verkhoshansky ───
  {name: 'Speed Bench (DE)', category: 'strength', primary: ['chest'], secondary: ['triceps', 'shoulder'], compound: true, sets: '8', reps: '3 @ 50-60% 1RM', notes: 'Dynamic Effort bench. Compensatory acceleration: every rep maximal speed, full-body tension. Westside Wednesday classic.', primarySub: ['chest_mid', 'triceps_lateral'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Speed Squat (DE)', category: 'strength', primary: ['quad', 'posterior'], secondary: ['core'], compound: true, sets: '10', reps: '2 @ 50-60% 1RM', notes: 'Dynamic Effort squat. Box squat with bands or chains, speed focus. Westside Friday staple.', primarySub: ['glute_max', 'vastus_lateralis'], phases: ['heavy'], equipment: ['barbell', 'band']},
  {name: 'Speed Deadlift (DE)', category: 'strength', primary: ['posterior', 'back'], secondary: ['traps'], compound: true, sets: '6-8', reps: '1-2 @ 60-70%', notes: 'Pull from floor as fast as possible. Verkhoshansky/Westside dynamic-effort method for rate of force development.', primarySub: ['glute_max', 'erectors'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Banded Box Squat', category: 'strength', primary: ['quad', 'posterior'], secondary: ['core'], compound: true, sets: '8-10', reps: '2-3 speed', notes: 'Box squat with bands attached to floor — accommodating resistance. Heavier at lockout. Louie Simmons signature.', primarySub: ['glute_max', 'vastus_lateralis'], phases: ['heavy'], equipment: ['barbell', 'band']},
  {name: 'Banded Bench Press', category: 'strength', primary: ['chest'], secondary: ['triceps', 'shoulder'], compound: true, sets: '5-8', reps: '3-5', notes: 'Bands from floor — heavier at lockout. Accommodating resistance teaches you to accelerate through the entire range.', primarySub: ['chest_mid', 'triceps_lateral'], phases: ['heavy'], equipment: ['barbell', 'band']},
  {name: 'Banded Good Morning', category: 'strength', primary: ['posterior'], secondary: ['back', 'core'], compound: true, sets: '4', reps: '6-10', notes: 'Westside lower-body ME / accessory. Posterior chain under accommodating resistance.', primarySub: ['hams_bf', 'erectors', 'glute_max'], phases: ['heavy', 'medium'], equipment: ['barbell', 'band']},
  {name: 'Altitude Drop', category: 'strength', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '5', reps: '5', notes: 'Drop from 30-60cm and stick the landing — no rebound. Verkhoshansky shock-method preparation for depth jumps.', primarySub: ['glute_max', 'rectus_femoris'], phases: ['multijoint'], equipment: ['box']},
  {name: 'Cluster Set Squat', category: 'strength', primary: ['quad'], secondary: ['posterior'], compound: true, sets: '5', reps: '5×(1 rest 15s) @ 85-90%', notes: 'Five singles with 15-20s intra-set rest per cluster. Soviet way to accumulate volume at >85% intensity without form breakdown.', primarySub: ['glute_max', 'vastus_lateralis'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Wave Loading Set (3-2-1)', category: 'strength', primary: ['quad'], secondary: ['posterior'], compound: true, sets: '2 waves', reps: '3@80 / 2@85 / 1@90 → 3@82.5 / 2@87.5 / 1@92.5', notes: 'Soviet wave loading. Two ascending waves, second heavier. CNS potentiation + heavy work in one session.', phases: ['heavy'], equipment: ['barbell']},
  {name: 'Long-Cycle Clean & Jerk (KB)', category: 'metabolic', primary: ['posterior', 'shoulder'], secondary: ['back', 'quad', 'core'], compound: true, sets: '5', reps: '60s on / 30s off', notes: 'RKC / Kettlebell Sport classic. Continuous clean + jerk for time. Brutal aerobic + strength combo.', primarySub: ['glute_max', 'delt_front'], phases: ['multijoint'], equipment: ['kettlebell']},
  {name: 'RKC Plank', category: 'isolation', primary: ['core'], secondary: ['shoulder'], sets: '3', reps: '20-30s', notes: 'Hardstyle plank — full-body tension, glutes/quads squeezed, fists clenched. Pavel Tsatsouline / RKC. Higher quality than long-duration planks.', primarySub: ['abs_upper', 'abs_lower'], phases: ['warmup', 'medium'], equipment: ['bodyweight']},
  {name: 'Pendulum Snatch (Bondarchuk)', category: 'strength', primary: ['posterior', 'back'], secondary: ['shoulder', 'core'], compound: true, sets: '5', reps: '3', notes: 'From overhead position, descend & immediately re-snatch. Verkhoshansky/Bondarchuk pendulum-training principle: reactive strength on the same movement.', phases: ['heavy'], equipment: ['barbell']},
];

const STRENGTH_ADDITIONS: FlatExercise[] = [
  // ── Bench / Press accessories ──
  {name: 'Floor Press', category: 'strength', primary: ['chest', 'triceps'], secondary: ['shoulder'], compound: true, sets: '5', reps: '3-5', notes: 'Bench from floor. No leg drive, partial ROM. Lockout strength + triceps overload.', primarySub: ['chest_mid', 'triceps_lateral'], secondarySub: ['delt_front'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Pin Press (Bench)', category: 'strength', primary: ['chest', 'triceps'], secondary: ['shoulder'], compound: true, sets: '5', reps: '3', notes: 'Press from pins set 1-2 inches above chest. Dead-stop. Westside staple.', primarySub: ['triceps_lateral', 'chest_mid'], secondarySub: ['delt_front'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Reverse-Band Bench Press', category: 'strength', primary: ['chest'], secondary: ['triceps', 'shoulder'], compound: true, sets: '5', reps: '3', notes: 'Bands attached top of rack. Accommodating resistance — heavier at lockout.', primarySub: ['chest_mid'], secondarySub: ['triceps_lateral'], phases: ['heavy'], equipment: ['barbell', 'band']},
  {name: 'Wide-Grip Bench Press', category: 'strength', primary: ['chest'], secondary: ['triceps', 'shoulder'], compound: true, sets: '4', reps: '5-6', notes: 'Hands at the rings. Sternal-head pec emphasis.', primarySub: ['chest_mid'], secondarySub: ['delt_front'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Log Press', category: 'strength', primary: ['shoulder'], secondary: ['triceps', 'chest', 'core'], compound: true, sets: '5', reps: '3-5', notes: 'Strongman classic. Thick neutral-grip log. Shoulder-friendly.', primarySub: ['delt_front'], secondarySub: ['triceps_lateral', 'chest_upper'], phases: ['heavy']},
  {name: 'Axle Strict Press', category: 'strength', primary: ['shoulder'], secondary: ['triceps', 'forearms'], compound: true, sets: '5', reps: '3-5', notes: 'Thick (2"+) axle bar. Brutal on forearms, no thumb wrap.', primarySub: ['delt_front'], secondarySub: ['forearm_grip'], phases: ['heavy']},
  {name: 'Bottoms-Up KB Press', category: 'strength', primary: ['shoulder'], secondary: ['core', 'forearms', 'triceps'], compound: true, sets: '4', reps: '5/side', notes: 'KB inverted — bell up, handle in fist. Tsatsouline classic. Shoulder-stability research gold.', primarySub: ['delt_front'], secondarySub: ['forearm_grip', 'abs_upper'], phases: ['heavy'], equipment: ['kettlebell']},
  {name: 'Single-Arm DB Floor Press', category: 'strength', primary: ['chest', 'triceps'], secondary: ['shoulder', 'core'], compound: true, sets: '4', reps: '5/side', notes: 'Anti-rotation core challenge during press.', primarySub: ['chest_mid', 'triceps_lateral'], secondarySub: ['obliques'], phases: ['heavy'], equipment: ['dumbbell']},

  // ── Squat accessories ──
  {name: 'Pin Squat (Anderson)', category: 'strength', primary: ['quad'], secondary: ['posterior', 'core'], compound: true, sets: '5', reps: '3-5', notes: 'Squat from pins below parallel. No eccentric. Concentric-only force.', primarySub: ['vastus_lateralis', 'rectus_femoris'], secondarySub: ['glute_max'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Belt Squat', category: 'strength', primary: ['quad'], secondary: ['posterior'], compound: true, sets: '5', reps: '5-8', notes: 'Heavy quad load with zero spinal compression. Westside / Sorinex classic.', primarySub: ['vastus_lateralis', 'rectus_femoris', 'vastus_medialis'], secondarySub: ['glute_max'], phases: ['heavy'], equipment: ['machine']},
  {name: 'Heel-Elevated Front Squat', category: 'strength', primary: ['quad'], secondary: ['core'], compound: true, sets: '4', reps: '5-6', notes: 'Plates under heels. Maximizes quad ROM and rectus-femoris recruitment.', primarySub: ['rectus_femoris', 'vastus_medialis'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Pause Front Squat', category: 'strength', primary: ['quad'], secondary: ['core', 'posterior'], compound: true, sets: '4', reps: '3', notes: '3s pause in the hole. Builds tension out of the bottom.', primarySub: ['rectus_femoris', 'vastus_medialis'], phases: ['heavy'], equipment: ['barbell']},

  // ── Deadlift / pull strength ──
  {name: 'Trap Bar Deadlift (heavy)', category: 'strength', primary: ['posterior', 'quad'], secondary: ['back', 'traps', 'forearms'], compound: true, sets: '5', reps: '3-5', notes: 'Hex bar — easier on the spine, great quad-glute hybrid.', primarySub: ['glute_max', 'vastus_lateralis', 'erectors'], secondarySub: ['traps_upper', 'forearm_grip'], phases: ['heavy']},
  {name: 'Block Pulls', category: 'strength', primary: ['posterior', 'back'], secondary: ['traps', 'forearms'], compound: true, sets: '5', reps: '3-5', notes: 'Deadlift from 4-6" blocks. Lockout strength + supramax loads.', primarySub: ['glute_max', 'erectors', 'lats'], secondarySub: ['traps_upper'], phases: ['heavy'], equipment: ['barbell', 'box']},
  {name: 'Snatch-Grip Deadlift', category: 'strength', primary: ['posterior', 'back'], secondary: ['traps', 'forearms', 'core'], compound: true, sets: '5', reps: '3-5', notes: 'Wider hand spacing. Massive upper-back and trap demand. Olympic carryover.', primarySub: ['lats', 'traps_mid', 'erectors'], secondarySub: ['forearm_grip'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Deficit Deadlift (3-4")', category: 'strength', primary: ['posterior', 'back', 'quad'], secondary: ['traps', 'forearms'], compound: true, sets: '5', reps: '3-5', notes: 'Stand on plate or block. Extra ROM. Bottom-position strength.', primarySub: ['glute_max', 'hams_bf', 'erectors'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Suitcase Deadlift', category: 'strength', primary: ['core', 'posterior'], secondary: ['forearms', 'traps'], compound: true, sets: '4', reps: '5/side', notes: 'Single-side DL. Anti-lateral flexion — Stuart McGill core research.', primarySub: ['obliques', 'glute_max', 'forearm_grip'], secondarySub: ['erectors'], phases: ['heavy'], equipment: ['barbell', 'dumbbell']},
  {name: 'Pause Deadlift', category: 'strength', primary: ['posterior', 'back'], secondary: ['traps', 'core'], compound: true, sets: '4', reps: '3-5', notes: 'Pause 2s below the knee. Removes momentum. Builds bottom-position strength.', primarySub: ['glute_max', 'hams_bf', 'erectors'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Reverse Hyper', category: 'strength', primary: ['posterior', 'back'], secondary: ['core'], compound: true, sets: '4', reps: '8-12', notes: 'Westside Barbell signature. Spinal traction + posterior chain. Louie Simmons classic.', primarySub: ['glute_max', 'hams_bf', 'erectors'], phases: ['heavy'], equipment: ['machine']},
  {name: 'Seal Row', category: 'strength', primary: ['back'], secondary: ['biceps', 'forearms'], compound: true, sets: '5', reps: '5-6', notes: 'Lay face-down on a high bench. Eliminates body english. Pure lat pull.', primarySub: ['lats', 'rhomboids'], secondarySub: ['biceps_long'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Meadows Row', category: 'strength', primary: ['back'], secondary: ['biceps', 'forearms'], compound: true, sets: '4', reps: '6-8', notes: 'Single-arm landmine row. John Meadows classic. Killer for lat development.', primarySub: ['lats', 'rhomboids'], secondarySub: ['biceps_long'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Yates Row', category: 'strength', primary: ['back'], secondary: ['biceps', 'traps'], compound: true, sets: '5', reps: '5', notes: 'Underhand grip, ~70° torso. Dorian Yates signature. Hits lats + lower traps.', primarySub: ['lats', 'traps_mid'], secondarySub: ['biceps_short'], phases: ['heavy'], equipment: ['barbell']},

  // ── Olympic completions ──
  {name: 'Power Snatch', category: 'strength', primary: ['posterior', 'back', 'shoulder'], secondary: ['quad', 'core', 'traps'], compound: true, sets: '5', reps: '2-3', notes: 'Catch above parallel — no full squat. Power expression of the snatch.', primarySub: ['glute_max', 'lats', 'delt_front'], secondarySub: ['traps_upper'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Hang Power Snatch', category: 'strength', primary: ['posterior', 'shoulder'], secondary: ['back', 'quad', 'traps'], compound: true, sets: '5', reps: '3', notes: 'Start from hang (mid-thigh). Builds second-pull explosiveness.', primarySub: ['glute_max', 'delt_front'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Squat Snatch', category: 'strength', primary: ['posterior', 'back', 'shoulder', 'quad'], secondary: ['core', 'traps'], compound: true, sets: '5', reps: '2-3', notes: 'Full snatch with overhead squat catch. Most technical lift in weightlifting.', primarySub: ['glute_max', 'lats', 'rectus_femoris'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Squat Clean', category: 'strength', primary: ['posterior', 'quad', 'back'], secondary: ['shoulder', 'core', 'traps'], compound: true, sets: '5', reps: '2-3', notes: 'Full clean with front-squat catch.', primarySub: ['glute_max', 'rectus_femoris', 'erectors'], secondarySub: ['traps_upper'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Clean Pull', category: 'strength', primary: ['posterior', 'back'], secondary: ['traps', 'forearms'], compound: true, sets: '5', reps: '3', notes: 'Pull only, no catch. 100-110% clean 1RM. Builds extension strength.', primarySub: ['glute_max', 'erectors'], secondarySub: ['traps_upper', 'forearm_grip'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Snatch Balance', category: 'strength', primary: ['shoulder', 'quad'], secondary: ['core', 'back'], compound: true, sets: '4', reps: '3-5', notes: 'From rack: dip-drive-drop into overhead squat. Builds catch confidence.', primarySub: ['delt_side', 'rectus_femoris'], secondarySub: ['abs_upper'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Overhead Squat', category: 'strength', primary: ['quad', 'shoulder'], secondary: ['core', 'back'], compound: true, sets: '4', reps: '3-5', notes: 'Barbell overhead, full-depth squat. Extreme mobility test.', primarySub: ['rectus_femoris', 'delt_side'], secondarySub: ['abs_upper', 'erectors'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'High Pull (Snatch grip)', category: 'strength', primary: ['posterior', 'back', 'traps'], secondary: ['shoulder'], compound: true, sets: '4', reps: '3-5', notes: 'Pull bar to chin height. Explosive triple extension.', primarySub: ['traps_upper', 'lats', 'glute_max'], phases: ['heavy'], equipment: ['barbell']},

  // ── Strongman ──
  {name: 'Atlas Stone Lift', category: 'strength', primary: ['posterior', 'back', 'core'], secondary: ['biceps', 'quad', 'forearms'], compound: true, sets: '5', reps: '3-5', notes: 'Stone from floor to platform. Strongman Triple-Crown event.', primarySub: ['glute_max', 'erectors', 'lats'], secondarySub: ['biceps_long'], phases: ['heavy']},
  {name: 'Log Clean & Press', category: 'strength', primary: ['posterior', 'shoulder'], secondary: ['back', 'core', 'triceps'], compound: true, sets: '5', reps: '3-5', notes: 'Clean log to chest, then press overhead. Strongman classic.', primarySub: ['glute_max', 'delt_front'], secondarySub: ['traps_upper', 'triceps_lateral'], phases: ['heavy']},
  {name: 'Tire Flip', category: 'strength', primary: ['posterior', 'quad', 'back'], secondary: ['chest', 'core', 'biceps'], compound: true, sets: '5', reps: '5-10', notes: 'Heavy tire (300lb+). Hip drive into push.', primarySub: ['glute_max', 'rectus_femoris'], secondarySub: ['chest_mid'], phases: ['heavy']},
  {name: 'Husafell Stone Carry', category: 'strength', primary: ['core', 'back', 'forearms'], secondary: ['posterior', 'biceps'], compound: true, sets: '4', reps: '20-40m', notes: 'Awkward bear-hugged stone. Iceland-strongman classic.', primarySub: ['abs_upper', 'lats', 'forearm_grip'], secondarySub: ['biceps_long'], phases: ['heavy']},
  {name: 'Sandbag Clean to Shoulder', category: 'strength', primary: ['posterior', 'back', 'shoulder'], secondary: ['core', 'biceps', 'forearms'], compound: true, sets: '5', reps: '5-8', notes: 'Heavy sandbag (80-150lb). Alternating shoulder. Odd-object strength.', primarySub: ['glute_max', 'lats', 'delt_front'], phases: ['heavy']},
  {name: 'Axle Deadlift', category: 'strength', primary: ['posterior', 'back', 'forearms'], secondary: ['traps'], compound: true, sets: '5', reps: '3-5', notes: 'Thick-bar deadlift. No straps allowed. Brutal grip test.', primarySub: ['glute_max', 'erectors', 'forearm_grip'], secondarySub: ['traps_upper'], phases: ['heavy']},

  // ── Elite calisthenics strength ──
  {name: 'Bar Muscle-Up', category: 'strength', primary: ['back', 'chest', 'triceps'], secondary: ['biceps', 'core', 'shoulder'], compound: true, sets: '5', reps: '3-5', notes: 'Pull-up to dip transition. Explosive upper-body strength.', primarySub: ['lats', 'chest_lower', 'triceps_lateral'], secondarySub: ['biceps_long', 'abs_upper'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'Ring Muscle-Up', category: 'strength', primary: ['back', 'chest', 'triceps'], secondary: ['biceps', 'core', 'shoulder'], compound: true, sets: '5', reps: '3-5', notes: 'Rings make stabilization much harder. Gymnastic strength.', primarySub: ['lats', 'chest_lower', 'triceps_lateral'], secondarySub: ['biceps_long', 'abs_upper'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'Handstand Push-Up', category: 'strength', primary: ['shoulder', 'triceps'], secondary: ['core', 'chest'], compound: true, sets: '5', reps: '3-6', notes: 'Wall- or freestanding. Inverted pressing strength.', primarySub: ['delt_front', 'delt_side', 'triceps_lateral'], secondarySub: ['abs_upper'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'One-Arm Push-Up', category: 'strength', primary: ['chest', 'triceps'], secondary: ['core', 'shoulder'], compound: true, sets: '4', reps: '3-5/side', notes: 'Anti-rotation core + unilateral pushing strength.', primarySub: ['chest_mid', 'triceps_lateral'], secondarySub: ['obliques'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'One-Arm Pull-Up', category: 'strength', primary: ['back', 'biceps'], secondary: ['core', 'forearms'], compound: true, sets: '4', reps: '1-3/side', notes: 'Elite-level pulling strength. Years of progression.', primarySub: ['lats', 'biceps_short'], secondarySub: ['forearm_grip', 'obliques'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'Archer Pull-Up', category: 'strength', primary: ['back', 'biceps'], secondary: ['core'], compound: true, sets: '4', reps: '4-6/side', notes: 'One-arm pull-up progression. Side-to-side pull.', primarySub: ['lats', 'biceps_short'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'Front Lever Raise', category: 'strength', primary: ['core', 'back'], secondary: ['shoulder'], compound: true, sets: '5', reps: '3-5', notes: 'Hold horizontal under bar. Gymnastics strength benchmark.', primarySub: ['lats', 'abs_upper'], secondarySub: ['delt_front'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'L-Sit Pull-Up', category: 'strength', primary: ['back', 'core'], secondary: ['biceps'], compound: true, sets: '4', reps: '5-8', notes: 'Pull-up with legs extended horizontal. Adds 30-40% difficulty.', primarySub: ['lats', 'abs_upper', 'abs_lower'], secondarySub: ['biceps_long'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'Pistol Squat (weighted)', category: 'strength', primary: ['quad'], secondary: ['posterior', 'core', 'calves'], compound: true, sets: '4', reps: '5/leg', notes: 'Single-leg squat with weight. Unilateral lower-body strength.', primarySub: ['rectus_femoris', 'vastus_medialis'], secondarySub: ['glute_max'], phases: ['heavy'], equipment: ['bodyweight', 'dumbbell']},
  {name: 'Shrimp Squat', category: 'strength', primary: ['quad'], secondary: ['posterior', 'core'], compound: true, sets: '4', reps: '5/leg', notes: 'Single-leg squat holding back foot. Calisthenics quad strength.', primarySub: ['rectus_femoris', 'vastus_lateralis'], phases: ['heavy'], equipment: ['bodyweight']},

  // ── Strength-circuit research additions (Phase 1 + 2) ──
  {name: 'Suitcase Carry', category: 'metabolic', primary: ['core', 'forearms', 'traps'], secondary: ['posterior'], compound: true, sets: '4', reps: '20-40m/side', notes: 'Single-side heavy KB or DB. Anti-lateral-flexion core (McGill research).', primarySub: ['obliques', 'forearm_grip', 'traps_upper'], phases: ['warmup', 'multijoint'], equipment: ['kettlebell', 'dumbbell']},
  {name: 'Front-Rack Carry', category: 'metabolic', primary: ['core', 'shoulder'], secondary: ['traps', 'forearms'], compound: true, sets: '4', reps: '20-40m', notes: 'Two DBs or KBs at shoulders. Anterior-core demand. Eric Cressey staple.', primarySub: ['abs_upper', 'delt_front'], secondarySub: ['forearm_grip'], phases: ['warmup', 'multijoint'], equipment: ['dumbbell', 'kettlebell']},
  {name: 'Bottoms-Up KB Carry', category: 'metabolic', primary: ['shoulder', 'forearms', 'core'], compound: true, sets: '3', reps: '15-25m/side', notes: 'KB inverted, bell up. Tsatsouline. Reflex-driven shoulder stability.', primarySub: ['delt_front', 'forearm_grip'], secondarySub: ['obliques'], phases: ['warmup'], equipment: ['kettlebell']},
  {name: 'Goblet Carry', category: 'metabolic', primary: ['core', 'quad'], secondary: ['biceps', 'forearms'], compound: true, sets: '4', reps: '20-40m', notes: 'Heavy KB bear-hugged at chest. Posture + quad endurance.', primarySub: ['abs_upper', 'rectus_femoris'], phases: ['warmup', 'multijoint'], equipment: ['kettlebell']},
  {name: 'KB Halo', category: 'metabolic', primary: ['shoulder', 'core'], secondary: ['traps'], sets: '3', reps: '8/direction', notes: 'Kettlebell circles around head. Shoulder mobility + thoracic warmup.', primarySub: ['delt_side', 'delt_rear'], phases: ['warmup'], equipment: ['kettlebell']},
  {name: 'KB Windmill', category: 'metabolic', primary: ['core', 'shoulder'], secondary: ['posterior'], compound: true, sets: '3', reps: '5/side', notes: 'KB overhead, hinge sideways and touch toe. Hip mobility + obliques + shoulder stability.', primarySub: ['obliques', 'delt_front'], secondarySub: ['hams_bf'], phases: ['warmup'], equipment: ['kettlebell']},
  {name: 'Single-Arm KB Swing', category: 'metabolic', primary: ['posterior', 'core'], secondary: ['shoulder', 'forearms'], compound: true, sets: '4', reps: '10-15/side', notes: 'Asymmetric load. Anti-rotation challenge during swing.', primarySub: ['glute_max', 'hams_bf', 'obliques'], secondarySub: ['forearm_grip'], phases: ['warmup', 'multijoint'], equipment: ['kettlebell']},
  {name: 'Trap-Bar Farmer Carry', category: 'metabolic', primary: ['forearms', 'traps', 'core'], secondary: ['posterior'], compound: true, sets: '4', reps: '30-40m', notes: 'Heavy hex bar held at sides. Full-body stability + grip.', primarySub: ['forearm_grip', 'traps_upper'], secondarySub: ['glute_max'], phases: ['warmup', 'multijoint']},
  {name: 'Sandbag Bear-Hug Squat', category: 'metabolic', primary: ['quad', 'core'], secondary: ['posterior', 'biceps'], compound: true, sets: '4', reps: '8-12', notes: 'Bear-hug a heavy sandbag, squat. Anterior-core demand.', primarySub: ['rectus_femoris', 'abs_upper'], secondarySub: ['biceps_long'], phases: ['multijoint']},
  {name: 'Sandbag Shouldering', category: 'metabolic', primary: ['posterior', 'back', 'shoulder'], secondary: ['core', 'biceps'], compound: true, sets: '5', reps: '5/side', notes: 'Heavy sandbag, ground to shoulder, alternating sides.', primarySub: ['glute_max', 'lats', 'delt_front'], phases: ['multijoint']},
];

/* ── SCIENCE-BACKED ADDITIONS — research-validated exercises across
   joint health, injury prevention, hypertrophy, mobility, plyometrics ── */
const SCIENTIFIC_ADDITIONS: FlatExercise[] = [
  // ── Knees Over Toes (Ben Patrick / ATG) — knee health + lower-body strength ──
  {name: 'Tibialis Raise (ATG)', category: 'isolation', primary: ['calves'], sets: '3', reps: '20-25', notes: 'Heels to wall, lift toes against weight. Anterior-shin strength. KOT staple.', phases: ['warmup', 'pump'], equipment: ['bodyweight']},
  {name: 'ATG Split Squat', category: 'strength', primary: ['quad'], secondary: ['posterior', 'core'], compound: true, sets: '4', reps: '5-8/leg', notes: 'Deep-ROM split squat, knee tracks past toe. Knee-health + quad strength (Ben Patrick / KOT).', primarySub: ['rectus_femoris', 'vastus_medialis'], secondarySub: ['glute_max'], phases: ['heavy'], equipment: ['bodyweight', 'dumbbell']},
  {name: 'Backward Sled Drag', category: 'metabolic', primary: ['quad'], secondary: ['calves', 'core'], compound: true, sets: '5', reps: '20-30m', notes: 'Walk backward dragging sled. Quad-builder, knee rehab favorite (KOT).', primarySub: ['vastus_lateralis', 'rectus_femoris'], phases: ['warmup', 'medium']},
  {name: 'Patrick Step', category: 'strength', primary: ['quad'], secondary: ['core'], compound: true, sets: '4', reps: '8-10/leg', notes: 'Single-leg eccentric step-down. VMO + knee control. KOT.', primarySub: ['vastus_medialis', 'rectus_femoris'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'Reverse Nordic Curl', category: 'strength', primary: ['quad'], secondary: ['core'], compound: true, sets: '4', reps: '5-8', notes: 'Kneeling, lean back slowly. Quad eccentric strength + knee health.', primarySub: ['rectus_femoris', 'vastus_medialis'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'KOT Calf Raise (slant)', category: 'hypertrophy', primary: ['calves'], sets: '4', reps: '15-20', notes: 'Standing on slant board / weight plate, full ROM. Stretches gastroc fully.', primarySub: ['gastrocnemius'], phases: ['medium', 'pump'], equipment: ['bodyweight']},

  // ── Hamstring / adductor injury prevention ──
  {name: 'Nordic Hamstring Curl', category: 'strength', primary: ['posterior'], secondary: ['core'], compound: true, sets: '4', reps: '5-8', notes: 'Eccentric hamstring strength. ~70% reduction in hamstring injuries (Petersen 2011 meta-analysis).', primarySub: ['hams_bf', 'hams_semi'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'Copenhagen Plank', category: 'strength', primary: ['core'], secondary: ['posterior'], compound: true, sets: '3', reps: '15-30s/side', notes: 'Side plank with top-leg foot on bench. Adductor strength. Cuts groin injuries ~41% (Harøy 2019).', primarySub: ['obliques'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'Long-Lever Adductor Squeeze', category: 'isolation', primary: ['core'], sets: '3', reps: '10×5s holds', notes: 'Lying flat, ball between ankles. Squeeze 5s, relax. Adductor activation.', primarySub: ['obliques'], phases: ['warmup', 'pump'], equipment: ['bodyweight']},

  // ── Glute medius EMG-validated activation ──
  {name: 'Clamshell', category: 'isolation', primary: ['posterior'], sets: '3', reps: '15-20/side', notes: 'Side-lying knee abduction. Top EMG-validated glute med move (Selkowitz et al. 2013).', primarySub: ['glute_med'], phases: ['warmup', 'pump'], equipment: ['bodyweight', 'band']},
  {name: 'Banded Lateral Walk', category: 'metabolic', primary: ['posterior'], secondary: ['core'], compound: true, sets: '3', reps: '15-20m/side', notes: 'Mini-band above knees, side-step. Glute medius activation.', primarySub: ['glute_med'], phases: ['warmup'], equipment: ['band']},
  {name: 'Single-Leg Glute Bridge', category: 'isolation', primary: ['posterior'], secondary: ['core'], sets: '3', reps: '12-15/side', notes: 'Per leg. Anti-rotation glute work.', primarySub: ['glute_max'], secondarySub: ['obliques'], phases: ['warmup', 'pump'], equipment: ['bodyweight']},
  {name: 'Side Plank w/ Hip Abduction', category: 'isolation', primary: ['core', 'posterior'], compound: true, sets: '3', reps: '8-12/side', notes: 'Side plank, lift top leg up. EMG: highest glute med activation (Boren et al. 2011).', primarySub: ['obliques', 'glute_med'], phases: ['heavy', 'pump'], equipment: ['bodyweight']},
  {name: 'Frog Pump', category: 'isolation', primary: ['posterior'], sets: '3', reps: '20-30', notes: 'Soles-together hip thrust. Maximum glute peak activation.', primarySub: ['glute_max'], phases: ['pump'], equipment: ['bodyweight']},

  // ── McGill core science ──
  {name: 'Dead Bug', category: 'isolation', primary: ['core'], sets: '3', reps: '10/side', notes: 'Anti-extension core. Stuart McGill staple. Contralateral arm/leg extension.', primarySub: ['abs_lower', 'abs_upper'], phases: ['warmup', 'medium'], equipment: ['bodyweight']},
  {name: 'McGill Curl-Up', category: 'isolation', primary: ['core'], sets: '3', reps: '8 (5s holds)', notes: 'Modified crunch with hands under low back. Spine-safe. McGill big-3.', primarySub: ['abs_upper'], phases: ['warmup', 'medium'], equipment: ['bodyweight']},
  {name: 'Side Plank', category: 'isolation', primary: ['core'], sets: '3', reps: '20-45s/side', notes: 'Anti-lateral flexion. Lateral chain endurance. McGill big-3.', primarySub: ['obliques'], phases: ['warmup', 'medium'], equipment: ['bodyweight']},

  // ── Stretch-mediated hypertrophy (Schoenfeld / Wolf 2023) ──
  {name: 'DB Pullover', category: 'hypertrophy', primary: ['chest', 'back'], secondary: ['triceps', 'core'], compound: true, sets: '4', reps: '10-12', notes: 'Lying on bench, DB overhead → chest. Stretches lats AND chest.', primarySub: ['chest_upper', 'lats'], secondarySub: ['triceps_long', 'abs_upper'], phases: ['medium'], equipment: ['dumbbell']},
  {name: 'Bayesian Cable Curl', category: 'hypertrophy', primary: ['biceps'], sets: '4', reps: '10-12/side', notes: 'Cable behind body, curl forward. Biceps long-head fully stretched.', primarySub: ['biceps_long'], phases: ['medium'], equipment: ['cable']},
  {name: 'Decline DB Curl', category: 'hypertrophy', primary: ['biceps'], sets: '3', reps: '10-12', notes: 'Lying face-down on incline bench. Maximum biceps stretch.', primarySub: ['biceps_long'], phases: ['medium'], equipment: ['dumbbell']},
  {name: 'Heel-Elevated DB Squat', category: 'hypertrophy', primary: ['quad'], secondary: ['posterior', 'core'], compound: true, sets: '4', reps: '10-12', notes: 'Plates under heels for max ROM. Quad stretch hypertrophy.', primarySub: ['rectus_femoris', 'vastus_medialis'], phases: ['medium'], equipment: ['dumbbell']},

  // ── Scapular strength foundation ──
  {name: 'Scapular Pull-Up', category: 'isolation', primary: ['back'], secondary: ['traps'], sets: '3', reps: '10', notes: 'Hang, retract scaps without bending elbows. Lat + lower-trap activation.', primarySub: ['lats', 'traps_mid'], phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Scapular Push-Up', category: 'isolation', primary: ['back'], secondary: ['core'], sets: '3', reps: '10', notes: 'Plank, protract/retract scaps. Serratus anterior activation.', primarySub: ['rhomboids'], phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Wall Slide (Y-T-W)', category: 'isolation', primary: ['shoulder', 'back'], sets: '3', reps: '8 each shape', notes: 'Back to wall, slide arms in Y, T, W shapes. Shoulder mobility + scap control.', primarySub: ['delt_rear', 'rhomboids', 'traps_mid'], phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Lying Y-T-W Raises', category: 'isolation', primary: ['shoulder', 'back'], sets: '3', reps: '10 each shape', notes: 'Face-down on bench with light DBs. Hits all rear-delt + scap retractor patterns.', primarySub: ['delt_rear', 'rhomboids', 'traps_mid'], phases: ['warmup', 'pump'], equipment: ['dumbbell']},

  // ── FRC / mobility (Andreo Spina, Eric Cressey) ──
  {name: '90/90 Hip Switch', category: 'metabolic', primary: ['core'], secondary: ['posterior'], sets: '2', reps: '10 switches', notes: 'Seated 90/90, switch sides without hands. FRC hip mobility staple.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Hip Airplane', category: 'isolation', primary: ['posterior', 'core'], compound: true, sets: '2', reps: '6/side', notes: 'Single-leg RDL with rotation. Glute control + balance (Cressey).', primarySub: ['glute_med', 'glute_max'], secondarySub: ['obliques'], phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Couch Stretch', category: 'isolation', primary: ['quad'], sets: '2', reps: '60-90s/side', notes: 'Knee against wall, foot up couch/wall. Hip flexor mobility (Kelly Starrett).', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Thread the Needle', category: 'isolation', primary: ['back'], sets: '2', reps: '8/side', notes: 'Quadruped thoracic rotation. Upper-back mobility.', phases: ['warmup'], equipment: ['bodyweight']},

  // ── Plyometric / power (Verkhoshansky depth-jump research) ──
  {name: 'Depth Jump', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '5', reps: '5', notes: 'Step off 18-30" box, immediate vertical jump. Reactive strength (Verkhoshansky).', primarySub: ['glute_max', 'rectus_femoris', 'gastrocnemius'], phases: ['multijoint'], equipment: ['box']},
  {name: 'Lateral Bound', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['core', 'calves'], compound: true, sets: '4', reps: '5/side', notes: 'Side-to-side single-leg jump. Frontal-plane power.', primarySub: ['glute_med', 'glute_max'], phases: ['warmup', 'multijoint'], equipment: ['bodyweight']},
  {name: 'Medicine Ball Slam', category: 'metabolic', primary: ['core', 'back'], secondary: ['shoulder', 'quad'], compound: true, sets: '4', reps: '8-10', notes: 'Ball overhead → slam to floor. Anterior-core power.', primarySub: ['abs_upper', 'lats'], phases: ['warmup', 'multijoint']},
  {name: 'Medicine Ball Rotational Throw', category: 'metabolic', primary: ['core'], secondary: ['shoulder', 'posterior'], compound: true, sets: '4', reps: '8/side', notes: 'Ball rotated and thrown into wall. Anti-rotation/rotational power.', primarySub: ['obliques'], phases: ['warmup', 'multijoint']},
  {name: 'Medicine Ball Chest Pass', category: 'metabolic', primary: ['chest', 'shoulder'], secondary: ['triceps', 'core'], compound: true, sets: '4', reps: '8-10', notes: 'Explosive bench-pass to wall/partner. Upper-body power.', primarySub: ['chest_mid', 'delt_front'], phases: ['warmup', 'multijoint']},

  // ── TRX / suspension ──
  {name: 'TRX Row', category: 'hypertrophy', primary: ['back'], secondary: ['biceps', 'core'], compound: true, sets: '3', reps: '10-15', notes: 'Body row from straps. Adjustable difficulty by foot angle.', primarySub: ['lats', 'rhomboids'], secondarySub: ['biceps_long'], phases: ['warmup', 'medium'], equipment: ['bodyweight']},
  {name: 'TRX Push-Up', category: 'hypertrophy', primary: ['chest'], secondary: ['triceps', 'shoulder', 'core'], compound: true, sets: '3', reps: '10-15', notes: 'Hands in straps. Stability challenge + chest.', primarySub: ['chest_mid'], phases: ['warmup', 'medium'], equipment: ['bodyweight']},
  {name: 'TRX Pistol Squat', category: 'strength', primary: ['quad'], secondary: ['posterior', 'core'], compound: true, sets: '4', reps: '5-8/leg', notes: 'Single-leg squat with TRX assist for balance.', primarySub: ['rectus_femoris', 'vastus_medialis'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'TRX Y-T-W', category: 'isolation', primary: ['shoulder', 'back'], sets: '3', reps: '10 each shape', notes: 'Standing pull from straps in Y/T/W. Scap retraction + rear delts.', primarySub: ['delt_rear', 'rhomboids'], phases: ['warmup', 'pump'], equipment: ['bodyweight']},
  {name: 'TRX Hamstring Curl', category: 'hypertrophy', primary: ['posterior'], secondary: ['core'], compound: true, sets: '3', reps: '10-12', notes: 'Heels in straps, curl in. Hamstring strength + glute activation.', primarySub: ['hams_bf', 'glute_max'], phases: ['medium'], equipment: ['bodyweight']},
];

/* ── NERVOUS-SYSTEM ADDITIONS — CNS-focused work: overcoming isometrics,
   post-activation-potentiation (PAP) contrast complexes, reactive
   plyometrics, and acceleration. Trains rate of force development and
   high-threshold motor-unit recruitment rather than muscle size. ── */
const NERVOUS_SYSTEM_ADDITIONS: FlatExercise[] = [
  // ─── Overcoming isometrics — max recruitment, no eccentric fatigue ───
  {name: 'Overcoming Isometric Mid-Thigh Pull', category: 'strength', primary: ['posterior', 'back'], secondary: ['traps', 'quad'], compound: true, sets: '5', reps: '5 × 3-6s max', notes: 'Pull a bar pinned immovable at mid-thigh with maximal intent. Recruits high-threshold motor units with no eccentric fatigue — Verkhoshansky / Hatfield CNS work.', primarySub: ['glute_max', 'erectors'], secondarySub: ['traps_upper'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Overcoming Isometric Bench (Pin)', category: 'strength', primary: ['chest', 'triceps'], secondary: ['shoulder'], compound: true, sets: '5', reps: '5 × 3-6s max', notes: 'Press the bar into immovable pins set at a chosen sticking point. Max intent for 3-6s. Trains rate of force development at the weakest joint angle.', primarySub: ['chest_mid', 'triceps_lateral'], secondarySub: ['delt_front'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Overcoming Isometric Squat (Pin)', category: 'strength', primary: ['quad'], secondary: ['posterior', 'core'], compound: true, sets: '5', reps: '5 × 5s max', notes: 'Drive a pinned bar from a dead squat position with maximal effort. Joint-angle-specific CNS overload.', primarySub: ['vastus_lateralis', 'rectus_femoris'], secondarySub: ['glute_max'], phases: ['heavy'], equipment: ['barbell']},

  // ─── Contrast / post-activation potentiation (PAP) complexes ───
  {name: 'Contrast Squat Complex', category: 'strength', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '4', reps: '3 @ 85% + 5 jumps', notes: 'Heavy squat triple, rest 30-60s, then explosive jump squats. The heavy set potentiates the CNS so the jumps fire harder.', primarySub: ['glute_max', 'vastus_lateralis'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'Contrast Bench Complex', category: 'strength', primary: ['chest', 'triceps'], secondary: ['shoulder', 'core'], compound: true, sets: '4', reps: '3 @ 85% + 5 throws', notes: 'Heavy bench triple, rest 30-60s, then explosive plyo push-ups or med-ball chest passes. Upper-body PAP for pressing power.', primarySub: ['chest_mid', 'triceps_lateral'], phases: ['heavy'], equipment: ['barbell']},
  {name: 'French Contrast (Lower)', category: 'strength', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '3', reps: '4-station cluster', notes: 'Cometti method: heavy squat → loaded jump → bodyweight jump → band-assisted jump, back to back. Hits the whole force-velocity curve in one set.', primarySub: ['glute_max', 'rectus_femoris'], phases: ['heavy', 'multijoint'], equipment: ['barbell', 'band']},
  {name: 'Heavy Squat Walkout', category: 'strength', primary: ['quad', 'core'], secondary: ['posterior', 'back'], compound: true, sets: '4', reps: '3 × 5-10s', notes: 'Unrack 110-130% of squat 1RM, walk it out, hold braced — no descent. Supramaximal CNS priming and bracing overload.', primarySub: ['erectors', 'vastus_lateralis'], secondarySub: ['abs_upper'], phases: ['heavy'], equipment: ['barbell']},

  // ─── Reactive plyometrics — stretch-shortening cycle & starting strength ───
  {name: 'Seated Box Jump', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '5', reps: '5', notes: 'Jump to a box from a dead-seated start. Removes the stretch-shortening cycle — isolates pure concentric starting strength.', primarySub: ['glute_max', 'rectus_femoris'], phases: ['multijoint'], equipment: ['box']},
  {name: 'Single-Leg Box Jump', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '4', reps: '4-6/leg', notes: 'Unilateral reactive jump. Exposes left-right power asymmetries.', primarySub: ['glute_max', 'vastus_lateralis'], phases: ['multijoint'], equipment: ['box']},
  {name: 'Hurdle Hops', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '4', reps: '5-8 hurdles', notes: 'Continuous two-foot hops over low hurdles. Minimal ground-contact time — trains reactive strength and the stretch-shortening cycle.', primarySub: ['gastrocnemius', 'glute_max'], phases: ['warmup', 'multijoint'], equipment: ['bodyweight']},
  {name: 'Depth Drop Push-Up', category: 'metabolic', primary: ['chest', 'triceps'], secondary: ['shoulder', 'core'], compound: true, sets: '4', reps: '5-6', notes: 'Hands drop off low boxes, catch and explode straight back up. Upper-body shock method — reactive pressing power.', primarySub: ['chest_mid', 'triceps_lateral'], phases: ['multijoint'], equipment: ['box', 'bodyweight']},

  // ─── Loaded jumps & Olympic-derived speed-strength ───
  {name: 'Trap-Bar Jump', category: 'metabolic', primary: ['posterior', 'quad'], secondary: ['traps', 'calves'], compound: true, sets: '5', reps: '3-5 @ 20-30% 1RM', notes: 'Jump holding a lightly loaded trap bar. Loaded jumps sit mid-curve on force-velocity — peak mechanical power output.', primarySub: ['glute_max', 'vastus_lateralis'], phases: ['multijoint']},
  {name: 'Jump Shrug', category: 'metabolic', primary: ['posterior', 'traps'], secondary: ['back', 'calves'], compound: true, sets: '5', reps: '3-5', notes: 'Explosive triple extension from the hang — violent shrug, no pull under. Teaches rate of force development for the Olympic lifts.', primarySub: ['traps_upper', 'glute_max'], phases: ['multijoint'], equipment: ['barbell']},
  {name: 'Overhead Backward Med-Ball Throw', category: 'metabolic', primary: ['posterior', 'core'], secondary: ['shoulder', 'back'], compound: true, sets: '4', reps: '6-8', notes: 'Full-body extension, hurl the ball back over the head for max distance. Total-body ballistic power.', primarySub: ['glute_max', 'erectors'], phases: ['warmup', 'multijoint']},

  // ─── Acceleration — rate of force development, joint-friendly ───
  {name: 'Hill Sprint', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '8', reps: '10-20m', notes: 'Max-intent uphill acceleration. High force at reduced impact — RFD without the eccentric pounding of flat sprints.', primarySub: ['glute_max', 'hams_bf'], phases: ['multijoint']},
  {name: 'Resisted Sprint (Sled)', category: 'metabolic', primary: ['quad', 'posterior'], secondary: ['calves', 'core'], compound: true, sets: '6', reps: '15-25m', notes: 'Sprint towing a sled at ~10-20% bodyweight. Overloads the acceleration phase — horizontal force production.', primarySub: ['glute_max', 'hams_bf'], phases: ['multijoint']},
];

/* ── NECK & CORE ADDITIONS — direct neck training (an under-served group)
   plus trunk work across flexion, rotation, and anti-extension. ── */
const NECK_AND_CORE_ADDITIONS: FlatExercise[] = [
  // ─── Neck — flexion, extension, lateral, isometric ───
  {name: 'Neck Flexion (Plate)', category: 'isolation', primary: ['neck'], sets: '3', reps: '15-20', notes: 'Lie face-up on a bench, plate on the forehead over a towel. Curl the chin toward the chest through full ROM. Add load slowly.', phases: ['medium', 'pump'], equipment: ['dumbbell']},
  {name: 'Neck Extension (Plate)', category: 'isolation', primary: ['neck'], secondary: ['traps'], sets: '3', reps: '15-20', notes: 'Lie face-down, plate held behind the head. Extend the neck up through full ROM. Trains the posterior neck and upper traps.', phases: ['medium', 'pump'], equipment: ['dumbbell']},
  {name: 'Neck Lateral Flexion (Plate)', category: 'isolation', primary: ['neck'], sets: '3', reps: '12-15/side', notes: 'Lie on your side, plate on the side of the head. Raise the head toward the ceiling. Trains the sternocleidomastoid and scalenes.', phases: ['medium', 'pump'], equipment: ['dumbbell']},
  {name: 'Neck Harness Extension', category: 'strength', primary: ['neck'], secondary: ['traps'], sets: '4', reps: '10-15', notes: 'Head harness loaded with a plate on a chain. Nod through full ROM. The classic loaded neck builder — combat-sport staple.', phases: ['medium']},
  {name: 'Banded Neck Isometric (4-Way)', category: 'isolation', primary: ['neck'], sets: '4', reps: '20-30s/direction', notes: 'Loop a band around the head, anchor it, and resist into flexion, extension, and each side. Joint-friendly entry to direct neck work.', phases: ['warmup', 'pump'], equipment: ['band']},
  {name: '4-Way Neck Machine', category: 'isolation', primary: ['neck'], secondary: ['traps'], sets: '3', reps: '12-15/direction', notes: 'Padded neck machine — flexion, extension, and lateral flexion each side. Consistent, controlled loading.', phases: ['medium', 'pump'], equipment: ['machine']},
  {name: 'Chin Tuck', category: 'isolation', primary: ['neck'], sets: '3', reps: '10 × 5s holds', notes: 'Draw the chin straight back, lengthening the back of the neck. Deep-neck-flexor activation — posture and forward-head prehab.', phases: ['warmup'], equipment: ['bodyweight']},
  {name: 'Wrestler’s Bridge', category: 'strength', primary: ['neck'], secondary: ['posterior', 'core'], compound: true, sets: '3', reps: '20-40s', notes: 'Bodyweight neck bridge — advanced. Build up gradually from partial range; not advisable with any history of neck injury.', phases: ['medium'], equipment: ['bodyweight']},

  // ─── Core — flexion, rotation, anti-extension ───
  {name: 'Cable Crunch', category: 'hypertrophy', primary: ['core'], sets: '4', reps: '12-15', notes: 'Kneel at a high cable, rope behind the head, crunch the rib cage toward the pelvis. Loadable spinal flexion for the rectus abdominis.', primarySub: ['abs_upper', 'abs_lower'], phases: ['medium', 'pump'], equipment: ['cable']},
  {name: 'Hanging Knee Raise', category: 'isolation', primary: ['core'], secondary: ['forearms'], sets: '3', reps: '12-15', notes: 'Hang from a bar, raise the knees to the chest with control — no swing. The accessible entry to hanging flexion work.', primarySub: ['abs_lower'], phases: ['medium', 'pump'], equipment: ['bodyweight']},
  {name: 'Toes-to-Bar', category: 'strength', primary: ['core'], secondary: ['back', 'forearms'], compound: true, sets: '4', reps: '8-12', notes: 'Hang and bring straight legs all the way to the bar. Full-ROM hanging flexion plus heavy lat and grip demand.', primarySub: ['abs_lower', 'abs_upper'], secondarySub: ['lats'], phases: ['heavy', 'medium'], equipment: ['bodyweight']},
  {name: 'Reverse Crunch', category: 'isolation', primary: ['core'], sets: '3', reps: '15-20', notes: 'Lie supine, curl the pelvis up off the floor toward the rib cage. Lower-ab bias with no hip-flexor dominance.', primarySub: ['abs_lower'], phases: ['medium', 'pump'], equipment: ['bodyweight']},
  {name: 'Russian Twist', category: 'isolation', primary: ['core'], sets: '3', reps: '15-20/side', notes: 'Seated, torso leaned back, rotate a weight from side to side. Rotational and oblique work.', primarySub: ['obliques'], phases: ['medium', 'pump'], equipment: ['dumbbell', 'bodyweight']},
  {name: 'Landmine Twist', category: 'isolation', primary: ['core'], secondary: ['shoulder'], compound: true, sets: '3', reps: '10-12/side', notes: 'Hold the end of a landmine bar overhead, arc it side to side. Standing rotational power for the obliques.', primarySub: ['obliques'], phases: ['medium'], equipment: ['barbell']},
  {name: 'Hanging Windshield Wiper', category: 'strength', primary: ['core'], secondary: ['back', 'forearms'], compound: true, sets: '3', reps: '6-10/side', notes: 'Hang with legs raised, sweep them in an arc from side to side. Advanced anti-rotation and oblique strength.', primarySub: ['obliques', 'abs_lower'], phases: ['heavy'], equipment: ['bodyweight']},
  {name: 'Stir the Pot', category: 'isolation', primary: ['core'], secondary: ['shoulder'], sets: '3', reps: '8-10/direction', notes: 'Forearms on a stability ball in a plank, draw small circles. Dynamic anti-extension — a Stuart McGill favorite.', primarySub: ['abs_upper', 'obliques'], phases: ['medium'], equipment: ['bodyweight']},
  {name: 'Hollow Body Rock', category: 'isolation', primary: ['core'], sets: '3', reps: '15-20', notes: 'Hold a hollow position and rock head-to-toe as one rigid unit. Gymnastics-staple anti-extension under dynamic load.', primarySub: ['abs_lower', 'abs_upper'], phases: ['warmup', 'medium'], equipment: ['bodyweight']},
  {name: 'Weighted Decline Sit-Up', category: 'hypertrophy', primary: ['core'], sets: '4', reps: '10-15', notes: 'Sit-up on a decline bench holding a plate at the chest. Full-ROM loaded spinal flexion.', primarySub: ['abs_upper', 'abs_lower'], phases: ['medium'], equipment: ['dumbbell']},
];

/** Infer equipment from an exercise name. Used as a fallback for legacy
 *  entries that didn't declare equipment explicitly. Uses simple
 *  substring matching for robustness (no regex slash issues). */
type Equipment = NonNullable<Exercise['equipment']>[number];
function inferEquipment(name: string): Equipment[] | undefined {
  const n = name.toLowerCase();
  const has = (s: string) => n.includes(s);
  const hasAny = (...ss: string[]) => ss.some(has);
  const out = new Set<Equipment>();

  // ─── Bodyweight / calisthenics / mobility / mat work ───
  // Check FIRST so explicit-bodyweight names don't get swept into 'barbell'.
  if (
    hasAny(
      'push-up', 'push up', 'pushup',
      'pull-up', 'pull up', 'pullup',
      'chin-up', 'chin up', 'chinup',
      'muscle-up', 'muscle up',
      'plank', 'bird dog', 'cat-cow', 'cat cow',
      'burpee', 'inchworm', 'bear crawl', 'crab walk',
      'bodyweight', '(bw)', '(light)',
      'sit-up', 'sit up', 'situp',
      'hollow', 'hanging', 'dragon flag',
      'pistol', 'shrimp', 'cossack',
      'jumping jack', 'high knee', 'butt kick',
      'mountain climber', 'skater', 'tuck jump',
      'broad jump', 'jump squat', 'jump lunge',
      'airplane', "world's greatest", 'world s greatest',
      'cindy', 'chelsea', 'fran',
      'nordic', 'copenhagen', 'clamshell', 'frog',
      'dead bug', 'curl-up', 'curl up', 'side plank',
      'scapular pull', 'scapular push', 'wall slide',
      'y-t-w', '90/90', 'couch stretch', 'thread the needle',
      'tibialis', 'atg split squat', 'patrick step',
      'reverse nordic', 'kot', 'death by',
      '100 rep', 'pull-up ladder', 'tabata squats',
      'air squat', 'bodyweight squat',
      'bench dip', 'dead hang',
      'walking lunge (bw)', 'reverse lunge (bw)',
      'walking lunge (light)', 'walking lunges (light)',
      'lateral lunge', 'lateral bound', 'pogo',
    )
  ) out.add('bodyweight');

  // ─── TRX ───
  if (has('trx')) out.add('bodyweight');

  // ─── Bands / monster walks / pull-aparts / dislocates ───
  if (hasAny('band ', '(band)', 'monster walk', 'pull-apart', 'pull apart', 'dislocate')) out.add('band');

  // ─── Box / step ups ───
  if (hasAny('box jump', 'depth jump', 'step-up', 'step up')) out.add('box');

  // ─── Cable ───
  if (has('cable')) out.add('cable');

  // ─── Machine ───
  if (
    hasAny(
      'machine', 'hack squat', 'leg press', 'pec deck',
      'lat pulldown', 'pulldown', 'seated cable',
      'leg curl', 'leg extension', 'hyperextension',
      'reverse hyper', 'hip thrust', 'preacher curl',
      'chest-supported', 'chest supported',
      'hammer strength', 'pendulum', 'belt squat',
      'reverse pec deck', 'smith ', 'smith machine',
    )
  ) out.add('machine');

  // ─── Kettlebell ───
  if (
    hasAny(
      'kettlebell', 'kb ', ' kb ', '(kb)',
      'goblet', 'turkish get-up', 'farmer',
      'halo', 'windmill', 'kb swing',
    )
  ) out.add('kettlebell');

  // ─── Dumbbell ───
  if (hasAny('dumbbell', 'db ', '(db)', ' db-')) out.add('dumbbell');

  // ─── Barbell (last so it doesn't sweep DB/KB/etc.) ───
  if (
    hasAny(
      'barbell', 'bb ', 'ez bar', 'ez curl', 'ez skull',
      't-bar', 'trap bar', 'trap-bar', 'landmine',
      'log press', 'log clean', 'axle',
      'good morning', 'deadlift', 'squat',
      'bench press', 'incline barbell', 'pendlay',
      'yates', 'meadows', 'seal row',
      'overhead press', 'push press', 'push jerk', 'split jerk',
      'clean and press', 'clean & jerk', 'snatch',
      'power clean', 'hang clean', 'squat clean',
      'snatch pull', 'clean pull', 'snatch balance',
      'overhead squat', 'rack pull', 'block pull',
      'thrusters', 'thruster', 'plate pinch',
      'high pull', 'shrug', 'pin press', 'pin squat',
      'reverse-band', 'wide-grip bench', 'paused bench',
      'floor press', 'spoto press', 'close-grip bench',
      'weighted dip', 'weighted pull', 'weighted chin',
      'front squat', 'back squat', 'box squat', 'safety bar',
      'zercher', 'sumo deadlift', 'romanian deadlift',
      'deficit deadlift', 'pause deadlift',
      'bear complex', 'barbell complex',
    )
  ) {
    // Only tag barbell if no more-specific equipment already claimed it.
    if (!out.has('dumbbell') && !out.has('kettlebell') && !out.has('cable') && !out.has('machine') && !out.has('bodyweight')) {
      out.add('barbell');
    }
  }

  // ─── Sled / tire / atlas stone / sandbag = no tag (specialty implements) ───
  // Intentionally not tagged so user can leave equipment filter open
  // and these still appear, OR filter to a specific tag and they're hidden.

  return out.size ? Array.from(out) : undefined;
}

export const ALL_EXERCISES: FlatExercise[] = (() => {
  const legacy = flattenLegacy();
  const withOverrides = legacy.map((ex) => {
    const o = PRIMARY_OVERRIDES[ex.name];
    return o ? {...ex, ...o} : ex;
  });
  const all = [
    ...withOverrides,
    ...COMPOUND_ADDITIONS,
    ...PHASED_ADDITIONS,
    ...STRENGTH_ADDITIONS,
    ...SCIENTIFIC_ADDITIONS,
    ...TRADITION_ADDITIONS,
    ...NERVOUS_SYSTEM_ADDITIONS,
    ...NECK_AND_CORE_ADDITIONS,
  ];
  // Apply PHASE_TAGS for any entry missing explicit phases
  const tagged = all.map((ex) => {
    const t = PHASE_TAGS[ex.name];
    let next: FlatExercise = (t && !ex.phases) ? {...ex, phases: t} : ex;
    // Fill in equipment by name inference if missing
    if (!next.equipment) {
      const inferred = inferEquipment(next.name);
      if (inferred) next = {...next, equipment: inferred};
    }
    return next;
  });
  // De-duplicate by name — last entry wins (so the richest-tagged copy survives)
  const byName = new Map<string, FlatExercise>();
  for (const ex of tagged) byName.set(ex.name, ex);
  return Array.from(byName.values());
})();

/** All exercises that fit a given phase. */
export function exercisesForPhase(phase: Phase): FlatExercise[] {
  return ALL_EXERCISES.filter((e) => e.phases?.includes(phase));
}

/** YouTube search URL for an exercise demo. Top result is almost always a
 *  reputable form/tutorial video. Reliable across all 150+ exercises without
 *  hand-curating links that can go 404. */
export function exerciseVideoUrl(name: string): string {
  const q = encodeURIComponent(`${name} exercise form tutorial`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

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
