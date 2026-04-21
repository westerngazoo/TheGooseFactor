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
  | 'triceps';

export type Exercise = {
  name: string;
  biseriePair?: string;
  sets: string;
  reps: string;
  notes?: string;
};

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'quad', 'posterior', 'chest', 'back', 'shoulder', 'biceps', 'triceps',
];

export const GROUP_LABELS: Record<MuscleGroup, string> = {
  quad: 'Quads (Anterior)',
  posterior: 'Glutes/Hams (Posterior)',
  chest: 'Chest',
  back: 'Back',
  shoulder: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
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
