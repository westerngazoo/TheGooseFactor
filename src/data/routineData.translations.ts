/* ══════════════════════════════════════════
   ROUTINE DATA — TRANSLATIONS (es, zh-Hans)
   Stage 1: label constants + ~180 most-common
   exercise names. Names not in these maps fall
   back to English. Notes always fall back to
   English (translated in a later stage).
   Consumers call useT() and use tName/tCategory
   /tGroup/tPhase/etc. — see the hook at the end.
   ══════════════════════════════════════════ */
import {useMemo} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  CATEGORY_LABELS,
  GROUP_LABELS,
  PHASE_LABELS,
  PHASE_DESCRIPTIONS,
  INTENSITY_LABELS,
  INTENSITY_PURPOSE,
  CATEGORY_PURPOSE,
  SUB_LABELS,
  type ExerciseCategory,
  type MuscleGroup,
  type Phase,
  type Intensity,
  type SubMuscle,
} from './routineData';

export type Locale = 'en' | 'es' | 'zh-Hans';

/* ─── Equipment ─── */
type EquipmentKey = 'barbell' | 'dumbbell' | 'kettlebell' | 'cable' | 'machine' | 'bodyweight' | 'band' | 'box';

const EQUIPMENT_ES: Record<EquipmentKey, string> = {
  barbell: 'barra', dumbbell: 'mancuerna', kettlebell: 'pesa rusa',
  cable: 'cable', machine: 'máquina', bodyweight: 'peso corporal',
  band: 'banda', box: 'cajón',
};
const EQUIPMENT_ZH: Record<EquipmentKey, string> = {
  barbell: '杠铃', dumbbell: '哑铃', kettlebell: '壶铃',
  cable: '绳索', machine: '器械', bodyweight: '徒手',
  band: '弹力带', box: '跳箱',
};

/* ─── Categories ─── */
const CATEGORY_ES: Record<ExerciseCategory, string> = {
  strength: 'FUERZA', metabolic: 'METABÓLICO',
  hypertrophy: 'HIPERTROFIA', isolation: 'AISLAMIENTO',
};
const CATEGORY_ZH: Record<ExerciseCategory, string> = {
  strength: '力量', metabolic: '代谢',
  hypertrophy: '增肌', isolation: '孤立',
};

const CATEGORY_PURPOSE_ES: Record<ExerciseCategory, string> = {
  strength: 'Compuestos pesados, 3-5 reps. Fuerza explosiva, reclutamiento máximo del SNC.',
  metabolic: 'Acondicionamiento. Compuestos de alta repetición, descanso corto, complejos.',
  hypertrophy: 'Crecimiento muscular. Carga moderada, 8-12 reps, ROM completo.',
  isolation: 'Objetivo monoarticular. 12-15 reps, forma estricta, bombeo.',
};
const CATEGORY_PURPOSE_ZH: Record<ExerciseCategory, string> = {
  strength: '大重量复合动作，3-5 次。爆发力，最大化神经募集。',
  metabolic: '体能训练。高次复合动作，短间歇，复合训练。',
  hypertrophy: '肌肉增长。中等负荷，8-12 次，全幅度。',
  isolation: '单关节针对性训练。12-15 次，严格姿势，泵感。',
};

/* ─── Muscle groups ─── */
const GROUP_ES: Record<MuscleGroup, string> = {
  quad: 'Cuádriceps', posterior: 'Glúteos/Femorales',
  chest: 'Pecho', back: 'Espalda / Dorsales', shoulder: 'Hombros',
  biceps: 'Bíceps', triceps: 'Tríceps', core: 'Core',
  calves: 'Pantorrillas', forearms: 'Antebrazos', traps: 'Trapecios',
  neck: 'Cuello',
};
const GROUP_ZH: Record<MuscleGroup, string> = {
  quad: '股四头肌', posterior: '臀部/腘绳肌',
  chest: '胸部', back: '背部 / 背阔肌', shoulder: '肩部',
  biceps: '肱二头肌', triceps: '肱三头肌', core: '核心',
  calves: '小腿', forearms: '前臂', traps: '斜方肌',
  neck: '颈部',
};

/* ─── Phases ─── */
const PHASE_ES: Record<Phase, string> = {
  warmup: 'Circuito de calentamiento',
  multijoint: 'Multiarticular completo',
  heavy: 'Fuerza pesada',
  medium: 'Medio / Hipertrofia',
  pump: 'Finalizador / Bombeo',
};
const PHASE_ZH: Record<Phase, string> = {
  warmup: '热身循环',
  multijoint: '多关节完整',
  heavy: '大重量力量',
  medium: '中等 / 增肌',
  pump: '收尾 / 泵感',
};

const PHASE_DESC_ES: Record<Phase, string> = {
  warmup: 'Activación de cuerpo completo estilo HIIT. Peso corporal, dinámico, rápido.',
  multijoint: 'Un flujo compuesto de cuerpo completo. Carga ligera-moderada, foco técnico.',
  heavy: 'Compuesto pesado basado en el patrón multiarticular. 3-5 reps.',
  medium: 'Accesorios de hipertrofia. 8-12 reps, ataca las brechas.',
  pump: 'Finalizador de aislamiento opcional. 15-20 reps, flujo sanguíneo.',
};
const PHASE_DESC_ZH: Record<Phase, string> = {
  warmup: 'HIIT 式全身激活。徒手，动态，快速。',
  multijoint: '一组全身复合动作流。轻-中等负荷，注重技术。',
  heavy: '基于多关节模式的大重量复合动作。3-5 次。',
  medium: '增肌辅助动作。8-12 次，针对弱点。',
  pump: '可选的孤立收尾。15-20 次，促进血流。',
};

/* ─── Intensities ─── */
const INTENSITY_ES: Record<Intensity, string> = {
  high: 'ALTA', medium: 'MED', low: 'BAJA',
};
const INTENSITY_ZH: Record<Intensity, string> = {
  high: '高强度', medium: '中等', low: '低强度',
};

const INTENSITY_PURPOSE_ES: Record<Intensity, string> = {
  high: 'Compuesto / Fuerza — explosivo, pesado, pocas reps. Máxima carga del SNC.',
  medium: 'Hipertrofia — carga moderada, ROM completo, rango de 8-12 reps.',
  low: 'Bombeo — carga ligera, 15-20 reps, sin fallo. Flujo sanguíneo.',
};
const INTENSITY_PURPOSE_ZH: Record<Intensity, string> = {
  high: '复合 / 力量 — 爆发，大重量，低次数。最大化神经负荷。',
  medium: '增肌 — 中等负荷，全幅度，8-12 次区间。',
  low: '泵感 — 轻负荷，15-20 次，不力竭。促进血流。',
};

/* ─── Sub-muscles ─── */
const SUB_ES: Record<SubMuscle, string> = {
  chest_upper: 'Pectoral superior', chest_mid: 'Pectoral medio', chest_lower: 'Pectoral inferior',
  lats: 'Dorsales', rhomboids: 'Romboides', teres: 'Redondos', erectors: 'Erectores espinales',
  traps_upper: 'Trapecio superior', traps_mid: 'Trapecio medio/inferior',
  delt_front: 'Deltoides anterior', delt_side: 'Deltoides medio', delt_rear: 'Deltoides posterior',
  biceps_long: 'Bíceps cabeza larga', biceps_short: 'Bíceps cabeza corta',
  brachialis: 'Braquial', brachioradialis: 'Braquiorradial',
  triceps_long: 'Tríceps cabeza larga', triceps_lateral: 'Tríceps cabeza lateral', triceps_medial: 'Tríceps cabeza medial',
  forearm_flexors: 'Flexores del antebrazo', forearm_extensors: 'Extensores del antebrazo', forearm_grip: 'Agarre',
  abs_upper: 'Abdomen superior', abs_lower: 'Abdomen inferior', obliques: 'Oblicuos',
  rectus_femoris: 'Recto femoral', vastus_lateralis: 'Vasto lateral', vastus_medialis: 'VMO',
  glute_max: 'Glúteo mayor', glute_med: 'Glúteo medio',
  hams_bf: 'Femorales (BF)', hams_semi: 'Femorales (semi)',
  gastrocnemius: 'Gastrocnemio', soleus: 'Sóleo',
};
const SUB_ZH: Record<SubMuscle, string> = {
  chest_upper: '上胸', chest_mid: '中胸', chest_lower: '下胸',
  lats: '背阔肌', rhomboids: '菱形肌', teres: '大圆肌', erectors: '竖脊肌',
  traps_upper: '上斜方', traps_mid: '中/下斜方',
  delt_front: '前束', delt_side: '中束', delt_rear: '后束',
  biceps_long: '肱二长头', biceps_short: '肱二短头',
  brachialis: '肱肌', brachioradialis: '肱桡肌',
  triceps_long: '三头长头', triceps_lateral: '三头外侧头', triceps_medial: '三头内侧头',
  forearm_flexors: '前臂屈肌', forearm_extensors: '前臂伸肌', forearm_grip: '握力',
  abs_upper: '上腹', abs_lower: '下腹', obliques: '腹斜肌',
  rectus_femoris: '股直肌', vastus_lateralis: '股外侧肌', vastus_medialis: '股内侧肌',
  glute_max: '臀大肌', glute_med: '臀中肌',
  hams_bf: '腘绳肌（股二头）', hams_semi: '腘绳肌（半腱半膜）',
  gastrocnemius: '腓肠肌', soleus: '比目鱼肌',
};

/* ─── Exercise names (Stage 1: ~180 most common). Anything missing
 *    here renders the English name. ─── */
const NAMES_ES: Record<string, string> = {
  // ── Quads ──
  'Barbell Back Squat': 'Sentadilla con barra',
  'Front Squat': 'Sentadilla frontal',
  'Pause Back Squat': 'Sentadilla con pausa',
  'Box Squat': 'Sentadilla al cajón',
  'Safety Bar Squat': 'Sentadilla con barra de seguridad',
  '20-Rep Squat': 'Sentadilla de 20 reps',
  'Barbell Thrusters': 'Thrusters con barra',
  'Zercher Squat': 'Sentadilla Zercher',
  'Goblet Squat Ladder': 'Escalera de sentadilla goblet',
  'Goblet Squat': 'Sentadilla goblet',
  'Leg Press': 'Prensa de piernas',
  'Hack Squat': 'Hack squat',
  'Bulgarian Split Squat': 'Sentadilla búlgara',
  'Walking Lunges (DB)': 'Zancadas caminando (mancuernas)',
  'Smith Machine Squat': 'Sentadilla en Smith',
  'Leg Extension': 'Extensión de cuádriceps',
  'Sissy Squat': 'Sentadilla sissy',
  'Single-Leg Extension': 'Extensión a una pierna',
  'Cyclist Squat': 'Sentadilla del ciclista',
  'Barbell Squat': 'Sentadilla con barra',

  // ── Posterior chain ──
  'Conventional Deadlift': 'Peso muerto convencional',
  'Sumo Deadlift': 'Peso muerto sumo',
  'Romanian Deadlift': 'Peso muerto rumano',
  'Romanian Deadlift (heavy)': 'Peso muerto rumano (pesado)',
  'Good Morning': 'Buenos días',
  'Deficit Deadlift': 'Peso muerto en déficit',
  'Deficit Deadlift (3-4")': 'Peso muerto en déficit (7-10 cm)',
  'Kettlebell Swing': 'Swing con pesa rusa',
  'Barbell Hip Thrust (high rep)': 'Hip thrust con barra (alta rep)',
  'Snatch-Grip RDL': 'RDL agarre arrancada',
  'Trap Bar Deadlift (high rep)': 'Peso muerto barra trap (alta rep)',
  'Trap Bar Deadlift (heavy)': 'Peso muerto barra trap (pesado)',
  'Hip Thrust': 'Hip thrust',
  'Stiff-Leg DB Deadlift': 'Peso muerto piernas rígidas con mancuernas',
  'Heavy Walking Lunges': 'Zancadas caminando pesadas',
  'Glute Ham Raise': 'GHR',
  'Single-Leg RDL': 'RDL a una pierna',
  'Lying Leg Curl': 'Curl femoral tumbado',
  'Seated Leg Curl': 'Curl femoral sentado',
  'Cable Pull-Through': 'Pull-through en polea',
  'Cable Glute Kickback': 'Patada de glúteo en polea',
  'Back Hyperextension': 'Hiperextensión lumbar',

  // ── Chest ──
  'Bench Press': 'Press de banca',
  'Paused Bench': 'Press de banca con pausa',
  'Close-Grip Bench': 'Press de banca agarre cerrado',
  'Close-Grip Bench Press': 'Press de banca agarre cerrado',
  'Incline Barbell': 'Press inclinado con barra',
  'Weighted Dips': 'Fondos con peso',
  'Weighted Dips (upright)': 'Fondos con peso (vertical)',
  'Push-Up Pyramid': 'Pirámide de flexiones',
  'Spoto Press': 'Spoto press',
  'Clap Push-Ups': 'Flexiones con palmada',
  'Bench Press (high-rep)': 'Press de banca (alta rep)',
  'Incline DB Press': 'Press inclinado con mancuernas',
  'Flat DB Press': 'Press plano con mancuernas',
  'Machine Chest Press': 'Press de pecho en máquina',
  'Hammer Strength Incline': 'Inclinado Hammer Strength',
  'Smith Incline Press': 'Press inclinado en Smith',
  'Cable Crossover': 'Cruce en polea',
  'Pec Deck Fly': 'Apertura en peck-deck',
  'Flat DB Fly': 'Apertura plana con mancuernas',
  'Incline DB Fly': 'Apertura inclinada con mancuernas',
  'Low-to-High Cable Fly': 'Apertura en polea de bajo a alto',
  'Dumbbell Press': 'Press con mancuernas',
  'DB Fly': 'Apertura con mancuernas',

  // ── Back ──
  'Deadlift': 'Peso muerto',
  'Weighted Pull-Up': 'Dominada con peso',
  'Weighted Pull-ups': 'Dominadas con peso',
  'Pendlay Row': 'Remo Pendlay',
  'Yates Row': 'Remo Yates',
  'Rack Pulls': 'Rack pulls',
  'Kroc Rows': 'Remos Kroc',
  'Barbell Row (high-rep)': 'Remo con barra (alta rep)',
  'Renegade Row': 'Remo renegado',
  'Deadlift Complex': 'Complejo de peso muerto',
  'Barbell Row': 'Remo con barra',
  'T-Bar Row': 'Remo en T',
  'Chest-Supported Row': 'Remo con apoyo de pecho',
  'Single-Arm DB Row': 'Remo a una mano con mancuerna',
  'Lat Pulldown (wide)': 'Jalón al pecho (ancho)',
  'Seated Cable Row': 'Remo en polea sentado',
  'Cable Row': 'Remo en polea',
  'Straight-Arm Pulldown': 'Jalón con brazos rectos',
  'Face Pull': 'Face pull',
  'Reverse Pec Deck': 'Peck-deck inverso',
  'Reverse Pec Deck (rear)': 'Peck-deck inverso (posterior)',
  'DB Shrug': 'Encogimientos con mancuernas',
  'DB Shrug (heavy)': 'Encogimientos con mancuernas (pesados)',
  'Barbell Shrug': 'Encogimientos con barra',
  'Heavy Barbell Shrug': 'Encogimientos con barra (pesados)',
  'Rack Pull Shrug': 'Encogimiento desde rack',

  // ── Shoulders ──
  'Overhead Press (Barbell)': 'Press militar (barra)',
  'Push Press': 'Push press',
  'Push Press (light)': 'Push press (ligero)',
  'Clean and Press': 'Clean & press',
  'Clean & Jerk': 'Clean & jerk',
  'Behind-the-Neck Press': 'Press tras nuca',
  'Seated Barbell Press': 'Press militar sentado',
  'Cuban Press': 'Press cubano',
  'Landmine Press': 'Press landmine',
  'DB Clean and Press': 'Clean & press con mancuernas',
  'DB Clean & Press': 'Clean & press con mancuernas',
  'Bradford Press': 'Press Bradford',
  'Seated DB Shoulder Press': 'Press de hombros sentado con mancuernas',
  'DB Shoulder Press': 'Press de hombros con mancuernas',
  'Arnold Press': 'Press Arnold',
  'Arnold Press (light)': 'Press Arnold (ligero)',
  'Machine Shoulder Press': 'Press de hombros en máquina',
  'Z Press': 'Z press',
  'DB Lateral Raise': 'Elevaciones laterales con mancuernas',
  'Cable Lateral Raise': 'Elevaciones laterales en polea',
  'Lateral Raises': 'Elevaciones laterales',
  'Front Raise (DB/Plate)': 'Elevación frontal (mancuerna/disco)',
  'Upright Row (EZ bar)': 'Remo al mentón (barra Z)',
  'Lateral + Front Raises': 'Elevaciones laterales + frontales',

  // ── Biceps ──
  'Weighted Chin-Up': 'Dominada supina con peso',
  'Barbell Curl (heavy)': 'Curl con barra (pesado)',
  'Cheated EZ Curl': 'Curl con trampa (barra Z)',
  'Reverse-Grip Bent Row': 'Remo inclinado agarre supino',
  '21s Curls': 'Curls 21s',
  'Drop-Set DB Curls': 'Curls con mancuerna en drop-set',
  'Cable Curl Burnout': 'Curl en polea hasta el fallo',
  'Cable Curl': 'Curl en polea',
  'Cable Curl (bar)': 'Curl en polea (barra)',
  'Curl & Press (DB)': 'Curl & press (mancuernas)',
  'Preacher Curl': 'Curl predicador',
  'Preacher Curl (EZ bar)': 'Curl predicador (barra Z)',
  'Incline DB Curl': 'Curl inclinado con mancuernas',
  'Hammer Curl': 'Curl martillo',
  'Hammer Curls': 'Curl martillo',
  'Rope Hammer Curl': 'Curl martillo con cuerda',
  'DB Curl': 'Curl con mancuernas',
  'Concentration Curl': 'Curl concentrado',
  'Spider Curl': 'Curl spider',
  'Single-Arm Cable Curl': 'Curl en polea a una mano',
  'Reverse Curl (EZ bar)': 'Curl inverso (barra Z)',

  // ── Triceps ──
  'Board Press': 'Press con tabla',
  'JM Press': 'JM press',
  'Dip Pyramid': 'Pirámide de fondos',
  'Tate Press': 'Tate press',
  'Pushdown Burnout': 'Pushdown hasta el fallo',
  'Close-Grip Push-Ups (high rep)': 'Flexiones cerradas (alta rep)',
  'EZ Skull Crusher': 'Skull crusher (barra Z)',
  'DB Skull Crusher': 'Skull crusher con mancuernas',
  'Overhead DB Extension': 'Extensión sobre la cabeza con mancuerna',
  'Rope Pushdown': 'Pushdown con cuerda',
  'V-Bar Pushdown': 'Pushdown con barra en V',
  'Cable Pushdown': 'Pushdown en polea',
  'Light Cable Pushdown': 'Pushdown en polea (ligero)',
  'Cable Kickback': 'Patada de tríceps en polea',
  'Single-Arm Rope Extension': 'Extensión con cuerda a una mano',
  'Bench Dip (bodyweight)': 'Fondo en banco (peso corporal)',
  'DB Kickback': 'Patada de tríceps con mancuerna',

  // ── Core ──
  'Hanging Leg Raise': 'Elevación de piernas colgado',
  'Hanging Knee Raise': 'Elevación de rodillas colgado',
  'Cable Crunch': 'Crunch en polea',
  'Ab Wheel Rollout': 'Rueda abdominal',
  'Cable Woodchopper': 'Leñador en polea',
  'Pallof Press': 'Press Pallof',
  'Dragon Flag': 'Bandera del dragón',
  'Toes-to-Bar': 'Pies a la barra',
  'Reverse Crunch': 'Crunch inverso',
  'Russian Twist': 'Giro ruso',
  'Landmine Twist': 'Giro landmine',
  'Hanging Windshield Wiper': 'Limpiaparabrisas colgado',
  'Stir the Pot': 'Remover la olla',
  'Hollow Body Rock': 'Mecida en hollow',
  'Hollow Hold': 'Hollow hold',
  'Weighted Decline Sit-Up': 'Abdominal declinado con peso',
  'Weighted Plank': 'Plancha con peso',
  'Side Plank': 'Plancha lateral',
  'Dead Bug': 'Bicho muerto',
  'McGill Curl-Up': 'Curl-up de McGill',

  // ── Calves ──
  'Standing Calf Raise': 'Elevación de pantorrillas de pie',
  'Seated Calf Raise': 'Elevación de pantorrillas sentado',
  'Donkey Calf Raise': 'Elevación de pantorrillas burro',
  'Single-Leg Calf Raise': 'Elevación de pantorrilla a una pierna',
  'Calf Press (leg press)': 'Press de pantorrilla (prensa)',

  // ── Forearms / grip ──
  'Wrist Curl': 'Curl de muñeca',
  'Reverse Wrist Curl': 'Curl de muñeca inverso',
  'Dead Hang': 'Suspensión muerta',
  'Plate Pinch': 'Pinza con discos',

  // ── Olympic / power ──
  'Power Clean': 'Power clean',
  'Power Clean (light)': 'Power clean (ligero)',
  'Hang Clean': 'Hang clean',
  'Hang Clean (light)': 'Hang clean (ligero)',
  'Hang Power Snatch': 'Hang power snatch',
  'Power Snatch': 'Power snatch',
  'Squat Snatch': 'Snatch en sentadilla',
  'Squat Clean': 'Clean en sentadilla',
  'Snatch': 'Snatch',
  'Snatch Pull': 'Snatch pull',
  'Clean Pull': 'Clean pull',
  'Push Jerk': 'Push jerk',
  'Split Jerk': 'Split jerk',
  'Snatch Balance': 'Snatch balance',
  'Overhead Squat': 'Sentadilla sobre la cabeza',
  'High Pull (Snatch grip)': 'High pull (agarre snatch)',

  // ── Carries / strongman ──
  "Farmer's Walk": 'Paseo del granjero',
  'Zercher Carry': 'Paseo Zercher',
  'Overhead Carry': 'Paseo sobre la cabeza',
  'Yoke Walk': 'Paseo del yoke',
  'Sled Push': 'Empuje de trineo',
  'Sled Drag (reverse)': 'Arrastre de trineo (inverso)',
  'Suitcase Carry': 'Paseo de maleta',
  'Front-Rack Carry': 'Paseo en front-rack',
  'Goblet Carry': 'Paseo goblet',

  // ── Bodyweight / conditioning ──
  'Wall Ball': 'Wall ball',
  'Burpee': 'Burpee',
  'Burpee Pull-Up': 'Burpee con dominada',
  'Box Jump': 'Salto al cajón',
  'Jump Squat': 'Sentadilla con salto',
  'Broad Jump': 'Salto horizontal',
  'Turkish Get-Up': 'Turkish get-up',
  'Pistol Squat': 'Sentadilla pistol',
  'Single-Leg Deadlift': 'Peso muerto a una pierna',
  'Pull-Up Ladder': 'Escalera de dominadas',
  'Standard Push-Up': 'Flexión estándar',
  'Incline Push-Up': 'Flexión inclinada',
  'Decline Push-Up': 'Flexión declinada',
  'Diamond Push-Up': 'Flexión en diamante',
  'Plyo Push-Up': 'Flexión pliométrica',
  'Hindu Push-Up': 'Flexión hindú',
  'Bodyweight Squat': 'Sentadilla con peso corporal',
};

const NAMES_ZH: Record<string, string> = {
  // ── Quads ──
  'Barbell Back Squat': '杠铃深蹲',
  'Front Squat': '前蹲',
  'Pause Back Squat': '暂停深蹲',
  'Box Squat': '箱式深蹲',
  'Safety Bar Squat': '安全杠深蹲',
  '20-Rep Squat': '20 次深蹲',
  'Barbell Thrusters': '杠铃推举蹲',
  'Zercher Squat': '泽彻深蹲',
  'Goblet Squat Ladder': '高脚杯深蹲阶梯',
  'Goblet Squat': '高脚杯深蹲',
  'Leg Press': '腿举',
  'Hack Squat': '哈克深蹲',
  'Bulgarian Split Squat': '保加利亚分腿蹲',
  'Walking Lunges (DB)': '行走箭步蹲（哑铃）',
  'Smith Machine Squat': '史密斯机深蹲',
  'Leg Extension': '腿屈伸',
  'Sissy Squat': '希西深蹲',
  'Single-Leg Extension': '单腿伸展',
  'Cyclist Squat': '骑行者深蹲',
  'Barbell Squat': '杠铃深蹲',

  // ── Posterior chain ──
  'Conventional Deadlift': '传统硬拉',
  'Sumo Deadlift': '相扑硬拉',
  'Romanian Deadlift': '罗马尼亚硬拉',
  'Romanian Deadlift (heavy)': '罗马尼亚硬拉（大重量）',
  'Good Morning': '早安',
  'Deficit Deadlift': '垫高硬拉',
  'Deficit Deadlift (3-4")': '垫高硬拉（7-10cm）',
  'Kettlebell Swing': '壶铃摆荡',
  'Barbell Hip Thrust (high rep)': '杠铃臀推（高次数）',
  'Snatch-Grip RDL': '抓举握距 RDL',
  'Trap Bar Deadlift (high rep)': '六角杠硬拉（高次数）',
  'Trap Bar Deadlift (heavy)': '六角杠硬拉（大重量）',
  'Hip Thrust': '臀推',
  'Stiff-Leg DB Deadlift': '哑铃直腿硬拉',
  'Heavy Walking Lunges': '大重量行走箭步蹲',
  'Glute Ham Raise': '臀腿挺身',
  'Single-Leg RDL': '单腿罗马尼亚硬拉',
  'Lying Leg Curl': '俯卧腿弯举',
  'Seated Leg Curl': '坐姿腿弯举',
  'Cable Pull-Through': '绳索髋拉',
  'Cable Glute Kickback': '绳索臀部后踢',
  'Back Hyperextension': '背部超伸',

  // ── Chest ──
  'Bench Press': '卧推',
  'Paused Bench': '暂停卧推',
  'Close-Grip Bench': '窄距卧推',
  'Close-Grip Bench Press': '窄距卧推',
  'Incline Barbell': '上斜杠铃卧推',
  'Weighted Dips': '负重双杠臂屈伸',
  'Weighted Dips (upright)': '负重双杠臂屈伸（直立）',
  'Push-Up Pyramid': '俯卧撑金字塔',
  'Spoto Press': 'Spoto 卧推',
  'Clap Push-Ups': '击掌俯卧撑',
  'Bench Press (high-rep)': '卧推（高次数）',
  'Incline DB Press': '上斜哑铃卧推',
  'Flat DB Press': '平板哑铃卧推',
  'Machine Chest Press': '器械胸推',
  'Hammer Strength Incline': 'Hammer 上斜推',
  'Smith Incline Press': '史密斯上斜推',
  'Cable Crossover': '绳索交叉夹胸',
  'Pec Deck Fly': '蝴蝶机夹胸',
  'Flat DB Fly': '平板哑铃飞鸟',
  'Incline DB Fly': '上斜哑铃飞鸟',
  'Low-to-High Cable Fly': '绳索低到高飞鸟',
  'Dumbbell Press': '哑铃推举',
  'DB Fly': '哑铃飞鸟',

  // ── Back ──
  'Deadlift': '硬拉',
  'Weighted Pull-Up': '负重引体向上',
  'Weighted Pull-ups': '负重引体向上',
  'Pendlay Row': '彭德雷划船',
  'Yates Row': '耶茨划船',
  'Rack Pulls': '架上拉',
  'Kroc Rows': '克罗克划船',
  'Barbell Row (high-rep)': '杠铃划船（高次数）',
  'Renegade Row': '叛徒划船',
  'Deadlift Complex': '硬拉复合',
  'Barbell Row': '杠铃划船',
  'T-Bar Row': 'T 杠划船',
  'Chest-Supported Row': '俯卧支撑划船',
  'Single-Arm DB Row': '单臂哑铃划船',
  'Lat Pulldown (wide)': '高位下拉（宽距）',
  'Seated Cable Row': '坐姿绳索划船',
  'Cable Row': '绳索划船',
  'Straight-Arm Pulldown': '直臂下拉',
  'Face Pull': '面拉',
  'Reverse Pec Deck': '反向蝴蝶机',
  'Reverse Pec Deck (rear)': '反向蝴蝶机（后束）',
  'DB Shrug': '哑铃耸肩',
  'DB Shrug (heavy)': '哑铃耸肩（大重量）',
  'Barbell Shrug': '杠铃耸肩',
  'Heavy Barbell Shrug': '大重量杠铃耸肩',
  'Rack Pull Shrug': '架上拉耸肩',

  // ── Shoulders ──
  'Overhead Press (Barbell)': '杠铃过头推举',
  'Push Press': '借力推举',
  'Push Press (light)': '借力推举（轻）',
  'Clean and Press': '翻举',
  'Clean & Jerk': '挺举',
  'Behind-the-Neck Press': '颈后推举',
  'Seated Barbell Press': '坐姿杠铃推举',
  'Cuban Press': '古巴推举',
  'Landmine Press': '地雷管推举',
  'DB Clean and Press': '哑铃翻举',
  'DB Clean & Press': '哑铃翻举',
  'Bradford Press': '布拉德福德推举',
  'Seated DB Shoulder Press': '坐姿哑铃肩推',
  'DB Shoulder Press': '哑铃肩推',
  'Arnold Press': '阿诺德推举',
  'Arnold Press (light)': '阿诺德推举（轻）',
  'Machine Shoulder Press': '器械肩推',
  'Z Press': 'Z 推举',
  'DB Lateral Raise': '哑铃侧平举',
  'Cable Lateral Raise': '绳索侧平举',
  'Lateral Raises': '侧平举',
  'Front Raise (DB/Plate)': '前平举（哑铃/杠铃片）',
  'Upright Row (EZ bar)': '直立划船（EZ 杠）',
  'Lateral + Front Raises': '侧平举 + 前平举',

  // ── Biceps ──
  'Weighted Chin-Up': '负重反握引体向上',
  'Barbell Curl (heavy)': '杠铃弯举（大重量）',
  'Cheated EZ Curl': '借力 EZ 杠弯举',
  'Reverse-Grip Bent Row': '反握俯身划船',
  '21s Curls': '21 次弯举',
  'Drop-Set DB Curls': '哑铃弯举递减组',
  'Cable Curl Burnout': '绳索弯举力竭',
  'Cable Curl': '绳索弯举',
  'Cable Curl (bar)': '绳索弯举（直杆）',
  'Curl & Press (DB)': '弯举 + 推举（哑铃）',
  'Preacher Curl': '牧师弯举',
  'Preacher Curl (EZ bar)': '牧师弯举（EZ 杠）',
  'Incline DB Curl': '上斜哑铃弯举',
  'Hammer Curl': '锤式弯举',
  'Hammer Curls': '锤式弯举',
  'Rope Hammer Curl': '绳索锤式弯举',
  'DB Curl': '哑铃弯举',
  'Concentration Curl': '集中弯举',
  'Spider Curl': '蜘蛛弯举',
  'Single-Arm Cable Curl': '单臂绳索弯举',
  'Reverse Curl (EZ bar)': '反握弯举（EZ 杠）',

  // ── Triceps ──
  'Board Press': '木板卧推',
  'JM Press': 'JM 推举',
  'Dip Pyramid': '臂屈伸金字塔',
  'Tate Press': 'Tate 推举',
  'Pushdown Burnout': '下压力竭',
  'Close-Grip Push-Ups (high rep)': '窄距俯卧撑（高次数）',
  'EZ Skull Crusher': 'EZ 杠仰卧臂屈伸',
  'DB Skull Crusher': '哑铃仰卧臂屈伸',
  'Overhead DB Extension': '哑铃过头臂屈伸',
  'Rope Pushdown': '绳索下压',
  'V-Bar Pushdown': 'V 杆下压',
  'Cable Pushdown': '绳索下压',
  'Light Cable Pushdown': '绳索下压（轻）',
  'Cable Kickback': '绳索后踢',
  'Single-Arm Rope Extension': '单臂绳索臂屈伸',
  'Bench Dip (bodyweight)': '长凳臂屈伸（徒手）',
  'DB Kickback': '哑铃后踢',

  // ── Core ──
  'Hanging Leg Raise': '悬挂举腿',
  'Hanging Knee Raise': '悬挂屈膝',
  'Cable Crunch': '绳索卷腹',
  'Ab Wheel Rollout': '健腹轮',
  'Cable Woodchopper': '绳索砍柴',
  'Pallof Press': 'Pallof 推举',
  'Dragon Flag': '龙旗',
  'Toes-to-Bar': '脚尖触杠',
  'Reverse Crunch': '反向卷腹',
  'Russian Twist': '俄罗斯转体',
  'Landmine Twist': '地雷管转体',
  'Hanging Windshield Wiper': '悬挂雨刷',
  'Stir the Pot': '搅锅',
  'Hollow Body Rock': '空心摇摆',
  'Hollow Hold': '空心保持',
  'Weighted Decline Sit-Up': '负重下斜仰卧起坐',
  'Weighted Plank': '负重平板支撑',
  'Side Plank': '侧平板',
  'Dead Bug': '死虫',
  'McGill Curl-Up': 'McGill 卷腹',

  // ── Calves ──
  'Standing Calf Raise': '站姿提踵',
  'Seated Calf Raise': '坐姿提踵',
  'Donkey Calf Raise': '驴式提踵',
  'Single-Leg Calf Raise': '单腿提踵',
  'Calf Press (leg press)': '腿举提踵',

  // ── Forearms / grip ──
  'Wrist Curl': '腕屈伸',
  'Reverse Wrist Curl': '反向腕屈伸',
  'Dead Hang': '死挂',
  'Plate Pinch': '杠铃片捏握',

  // ── Olympic / power ──
  'Power Clean': '高翻',
  'Power Clean (light)': '高翻（轻）',
  'Hang Clean': '悬垂翻',
  'Hang Clean (light)': '悬垂翻（轻）',
  'Hang Power Snatch': '悬垂高抓',
  'Power Snatch': '高抓',
  'Squat Snatch': '深蹲抓举',
  'Squat Clean': '深蹲翻',
  'Snatch': '抓举',
  'Snatch Pull': '抓举提铃',
  'Clean Pull': '翻举提铃',
  'Push Jerk': '借力挺',
  'Split Jerk': '分腿挺',
  'Snatch Balance': '抓举平衡',
  'Overhead Squat': '过头深蹲',
  'High Pull (Snatch grip)': '高拉（抓举握距）',

  // ── Carries / strongman ──
  "Farmer's Walk": '农夫行走',
  'Zercher Carry': '泽彻负重行走',
  'Overhead Carry': '过头负重行走',
  'Yoke Walk': '轭式行走',
  'Sled Push': '雪橇推',
  'Sled Drag (reverse)': '雪橇拖（反向）',
  'Suitcase Carry': '手提箱行走',
  'Front-Rack Carry': '前架行走',
  'Goblet Carry': '高脚杯行走',

  // ── Bodyweight / conditioning ──
  'Wall Ball': '靠墙药球抛接',
  'Burpee': '波比跳',
  'Burpee Pull-Up': '波比跳引体',
  'Box Jump': '跳箱',
  'Jump Squat': '跳跃深蹲',
  'Broad Jump': '立定跳远',
  'Turkish Get-Up': '土耳其起立',
  'Pistol Squat': '手枪深蹲',
  'Single-Leg Deadlift': '单腿硬拉',
  'Pull-Up Ladder': '引体阶梯',
  'Standard Push-Up': '标准俯卧撑',
  'Incline Push-Up': '上斜俯卧撑',
  'Decline Push-Up': '下斜俯卧撑',
  'Diamond Push-Up': '钻石俯卧撑',
  'Plyo Push-Up': '爆发俯卧撑',
  'Hindu Push-Up': '印度式俯卧撑',
  'Bodyweight Squat': '徒手深蹲',
};

/* ─── Hook ─── */
export type T = ReturnType<typeof useT>;

export function useT() {
  const {i18n} = useDocusaurusContext();
  const locale = i18n.currentLocale as Locale;
  return useMemo(() => {
    const isEs = locale === 'es';
    const isZh = locale === 'zh-Hans';
    return {
      locale,
      tName: (n: string): string =>
        isEs ? (NAMES_ES[n] ?? n) : isZh ? (NAMES_ZH[n] ?? n) : n,
      // Notes pass through English in stage 1.
      tNotes: (_englishName: string, englishNotes?: string): string | undefined =>
        englishNotes,
      tCategory: (c: ExerciseCategory): string =>
        isEs ? CATEGORY_ES[c] : isZh ? CATEGORY_ZH[c] : CATEGORY_LABELS[c],
      tCategoryPurpose: (c: ExerciseCategory): string =>
        isEs ? CATEGORY_PURPOSE_ES[c] : isZh ? CATEGORY_PURPOSE_ZH[c] : CATEGORY_PURPOSE[c],
      tGroup: (g: MuscleGroup): string =>
        isEs ? GROUP_ES[g] : isZh ? GROUP_ZH[g] : GROUP_LABELS[g],
      tPhase: (p: Phase): string =>
        isEs ? PHASE_ES[p] : isZh ? PHASE_ZH[p] : PHASE_LABELS[p],
      tPhaseDescription: (p: Phase): string =>
        isEs ? PHASE_DESC_ES[p] : isZh ? PHASE_DESC_ZH[p] : PHASE_DESCRIPTIONS[p],
      tIntensity: (i: Intensity): string =>
        isEs ? INTENSITY_ES[i] : isZh ? INTENSITY_ZH[i] : INTENSITY_LABELS[i],
      tIntensityPurpose: (i: Intensity): string =>
        isEs ? INTENSITY_PURPOSE_ES[i] : isZh ? INTENSITY_PURPOSE_ZH[i] : INTENSITY_PURPOSE[i],
      tSub: (s: SubMuscle): string =>
        isEs ? SUB_ES[s] : isZh ? SUB_ZH[s] : SUB_LABELS[s],
      tEquipment: (e: string): string => {
        const k = e as EquipmentKey;
        return isEs ? (EQUIPMENT_ES[k] ?? e) : isZh ? (EQUIPMENT_ZH[k] ?? e) : e;
      },
    };
  }, [locale]);
}
