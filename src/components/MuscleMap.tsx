import type {ReactNode} from 'react';
import {
  type MuscleGroup,
  type SubMuscle,
  GROUP_LABELS,
  SUB_LABELS,
  SUB_TO_GROUP,
} from '../data/routineData';

export type Activation = 'primary' | 'secondary' | 'none';
export type ActivationMap = Partial<Record<MuscleGroup, Activation>>;
export type SubActivationMap = Partial<Record<SubMuscle, Activation>>;

const COLORS: Record<Activation, string> = {
  primary: '#e74c3c',
  secondary: '#f1c40f',
  none: 'rgba(150,150,150,0.18)',
};

const STROKE = 'rgba(90,98,107,0.55)';

/** Merge multiple (group, sub) activation pairs; 'primary' always wins. */
export function mergeActivations(
  entries: {group: ActivationMap; sub: SubActivationMap}[],
): {group: ActivationMap; sub: SubActivationMap} {
  const g: ActivationMap = {};
  const s: SubActivationMap = {};
  for (const {group, sub} of entries) {
    for (const [k, v] of Object.entries(group) as [MuscleGroup, Activation][]) {
      if (!g[k] || v === 'primary') g[k] = v;
    }
    for (const [k, v] of Object.entries(sub) as [SubMuscle, Activation][]) {
      if (!s[k] || v === 'primary') s[k] = v;
    }
  }
  return {group: g, sub: s};
}

/** Build activation maps from a single exercise. */
export function activationFor(
  primary: MuscleGroup[] | undefined,
  secondary: MuscleGroup[] | undefined,
  primarySub?: SubMuscle[],
  secondarySub?: SubMuscle[],
): {group: ActivationMap; sub: SubActivationMap} {
  const group: ActivationMap = {};
  const sub: SubActivationMap = {};
  for (const gg of primary ?? []) group[gg] = 'primary';
  for (const gg of secondary ?? []) if (group[gg] !== 'primary') group[gg] = 'secondary';
  for (const ss of primarySub ?? []) {
    sub[ss] = 'primary';
    const parent = SUB_TO_GROUP[ss];
    if (group[parent] !== 'primary') group[parent] = 'primary';
  }
  for (const ss of secondarySub ?? []) {
    if (sub[ss] !== 'primary') sub[ss] = 'secondary';
    const parent = SUB_TO_GROUP[ss];
    if (!group[parent]) group[parent] = 'secondary';
  }
  return {group, sub};
}

/** Pick a fill color for a sub-muscle; falls back to parent-group tint if sub isn't tagged. */
function subFill(
  g: MuscleGroup,
  sub: SubMuscle,
  groupAct: ActivationMap,
  subAct: SubActivationMap,
): string {
  if (subAct[sub]) return COLORS[subAct[sub]!];
  // If no sub-tag but parent group is active, show dimmer parent tint
  const pa = groupAct[g];
  if (pa === 'primary') return COLORS.primary;
  if (pa === 'secondary') return COLORS.secondary;
  return COLORS.none;
}

export default function MuscleMap({
  activation,
}: {
  activation: {group: ActivationMap; sub: SubActivationMap};
}): ReactNode {
  const g = activation.group;
  const s = activation.sub;
  const f = (grp: MuscleGroup, sub: SubMuscle) => subFill(grp, sub, g, s);

  // Which sub-muscles are lit, for the legend tag list
  const lit = (Object.keys(s) as SubMuscle[]).filter((k) => s[k]);
  const litGroupOnly = (Object.keys(g) as MuscleGroup[]).filter(
    (k) => g[k] && !lit.some((ss) => SUB_TO_GROUP[ss] === k),
  );

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem'}}>
      <svg viewBox="0 0 360 420" width="100%" style={{maxWidth: '360px', display: 'block', margin: '0 auto'}}>
        {/* ─── FRONT BODY ─── */}
        <g>
          <text x="90" y="14" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Front</text>
          {/* Head */}
          <circle cx="90" cy="34" r="16" fill="rgba(150,150,150,0.12)" stroke={STROKE} strokeWidth="1"/>
          <rect x="84" y="48" width="12" height="8" fill="rgba(150,150,150,0.12)" stroke={STROKE} strokeWidth="1"/>

          {/* Front traps (upper) */}
          <path d="M67 58 Q90 48 113 58 L107 64 Q90 56 73 64 Z"
                fill={f('traps', 'traps_upper')} stroke={STROKE} strokeWidth="1"/>

          {/* Shoulders: front delt + side delt */}
          <path d="M54 64 Q62 57 70 64 L68 78 Q58 78 52 74 Z"
                fill={f('shoulder', 'delt_front')} stroke={STROKE} strokeWidth="1"/>
          <path d="M110 64 Q118 57 126 64 L128 74 Q122 78 112 78 Z"
                fill={f('shoulder', 'delt_front')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="46" cy="72" rx="6" ry="8" fill={f('shoulder', 'delt_side')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="134" cy="72" rx="6" ry="8" fill={f('shoulder', 'delt_side')} stroke={STROKE} strokeWidth="1"/>

          {/* Chest: upper / mid / lower each side */}
          <path d="M72 70 Q90 66 108 70 L106 78 Q90 74 74 78 Z"
                fill={f('chest', 'chest_upper')} stroke={STROKE} strokeWidth="1"/>
          <path d="M74 80 Q90 78 106 80 L108 90 Q90 88 72 90 Z"
                fill={f('chest', 'chest_mid')} stroke={STROKE} strokeWidth="1"/>
          <path d="M73 92 Q90 92 107 92 L105 102 Q90 106 75 102 Z"
                fill={f('chest', 'chest_lower')} stroke={STROKE} strokeWidth="1"/>

          {/* Biceps: long (outer) + short (inner) each arm */}
          <ellipse cx="38" cy="100" rx="5" ry="18" fill={f('biceps', 'biceps_long')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="47" cy="100" rx="5" ry="18" fill={f('biceps', 'biceps_short')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="133" cy="100" rx="5" ry="18" fill={f('biceps', 'biceps_short')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="142" cy="100" rx="5" ry="18" fill={f('biceps', 'biceps_long')} stroke={STROKE} strokeWidth="1"/>
          {/* Brachialis sliver at elbow */}
          <ellipse cx="42" cy="122" rx="5" ry="5" fill={f('biceps', 'brachialis')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="138" cy="122" rx="5" ry="5" fill={f('biceps', 'brachialis')} stroke={STROKE} strokeWidth="1"/>

          {/* Forearms (front = flexors) */}
          <ellipse cx="42" cy="152" rx="8" ry="22" fill={f('forearms', 'forearm_flexors')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="138" cy="152" rx="8" ry="22" fill={f('forearms', 'forearm_flexors')} stroke={STROKE} strokeWidth="1"/>

          {/* Core: upper abs / lower abs + obliques */}
          <rect x="76" y="108" width="28" height="22" rx="3" fill={f('core', 'abs_upper')} stroke={STROKE} strokeWidth="1"/>
          <rect x="76" y="132" width="28" height="22" rx="3" fill={f('core', 'abs_lower')} stroke={STROKE} strokeWidth="1"/>
          <path d="M64 112 L76 114 L76 152 L66 148 Z" fill={f('core', 'obliques')} stroke={STROKE} strokeWidth="1"/>
          <path d="M116 112 L104 114 L104 152 L114 148 Z" fill={f('core', 'obliques')} stroke={STROKE} strokeWidth="1"/>

          {/* Hip belt */}
          <rect x="70" y="156" width="40" height="10" rx="3" fill="rgba(150,150,150,0.18)" stroke={STROKE} strokeWidth="1"/>

          {/* Quads: vastus lateralis (outer), rectus femoris (center), vastus medialis (inner/teardrop lower) */}
          {/* Left leg */}
          <path d="M62 172 Q66 168 72 172 L70 230 Q66 232 60 228 Z"
                fill={f('quad', 'vastus_lateralis')} stroke={STROKE} strokeWidth="1"/>
          <path d="M72 172 Q78 168 84 172 L82 234 Q76 234 72 232 Z"
                fill={f('quad', 'rectus_femoris')} stroke={STROKE} strokeWidth="1"/>
          <path d="M73 215 Q80 218 87 215 L86 240 Q79 246 73 240 Z"
                fill={f('quad', 'vastus_medialis')} stroke={STROKE} strokeWidth="1"/>
          {/* Right leg */}
          <path d="M118 172 Q114 168 108 172 L110 230 Q114 232 120 228 Z"
                fill={f('quad', 'vastus_lateralis')} stroke={STROKE} strokeWidth="1"/>
          <path d="M108 172 Q102 168 96 172 L98 234 Q104 234 108 232 Z"
                fill={f('quad', 'rectus_femoris')} stroke={STROKE} strokeWidth="1"/>
          <path d="M107 215 Q100 218 93 215 L94 240 Q101 246 107 240 Z"
                fill={f('quad', 'vastus_medialis')} stroke={STROKE} strokeWidth="1"/>

          {/* Shins (neutral) */}
          <ellipse cx="73" cy="285" rx="10" ry="28" fill="rgba(150,150,150,0.12)" stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="107" cy="285" rx="10" ry="28" fill="rgba(150,150,150,0.12)" stroke={STROKE} strokeWidth="1"/>
          {/* Feet */}
          <ellipse cx="73" cy="324" rx="11" ry="5" fill="rgba(150,150,150,0.12)" stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="107" cy="324" rx="11" ry="5" fill="rgba(150,150,150,0.12)" stroke={STROKE} strokeWidth="1"/>
        </g>

        {/* ─── BACK BODY ─── */}
        <g>
          <text x="270" y="14" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">Back</text>
          {/* Head */}
          <circle cx="270" cy="34" r="16" fill="rgba(150,150,150,0.12)" stroke={STROKE} strokeWidth="1"/>
          <rect x="264" y="48" width="12" height="8" fill="rgba(150,150,150,0.12)" stroke={STROKE} strokeWidth="1"/>

          {/* Upper traps (prominent) */}
          <path d="M238 50 Q270 40 302 50 L294 70 Q270 60 246 70 Z"
                fill={f('traps', 'traps_upper')} stroke={STROKE} strokeWidth="1"/>
          {/* Mid/lower traps */}
          <path d="M254 76 L286 76 L278 108 L262 108 Z"
                fill={f('traps', 'traps_mid')} stroke={STROKE} strokeWidth="1"/>

          {/* Rear delts */}
          <ellipse cx="232" cy="72" rx="9" ry="8" fill={f('shoulder', 'delt_rear')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="308" cy="72" rx="9" ry="8" fill={f('shoulder', 'delt_rear')} stroke={STROKE} strokeWidth="1"/>

          {/* Teres major (below rear delt) */}
          <path d="M238 84 Q248 80 254 86 L252 96 Q242 96 238 94 Z"
                fill={f('back', 'teres')} stroke={STROKE} strokeWidth="1"/>
          <path d="M302 84 Q292 80 286 86 L288 96 Q298 96 302 94 Z"
                fill={f('back', 'teres')} stroke={STROKE} strokeWidth="1"/>

          {/* Rhomboids (between scapulae) */}
          <rect x="260" y="78" width="20" height="18" rx="2"
                fill={f('back', 'rhomboids')} stroke={STROKE} strokeWidth="1"/>

          {/* Lats (V shape) */}
          <path d="M244 98 Q270 92 296 98 L292 145 Q270 156 248 145 Z"
                fill={f('back', 'lats')} stroke={STROKE} strokeWidth="1"/>

          {/* Spinal erectors */}
          <rect x="263" y="112" width="14" height="38" rx="2"
                fill={f('back', 'erectors')} stroke={STROKE} strokeWidth="1"/>

          {/* Triceps: long (inner), lateral (outer), medial (lower) */}
          <ellipse cx="213" cy="98"  rx="5" ry="18" fill={f('triceps', 'triceps_lateral')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="222" cy="98"  rx="5" ry="18" fill={f('triceps', 'triceps_long')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="217" cy="122" rx="5" ry="6"  fill={f('triceps', 'triceps_medial')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="318" cy="98"  rx="5" ry="18" fill={f('triceps', 'triceps_long')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="327" cy="98"  rx="5" ry="18" fill={f('triceps', 'triceps_lateral')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="323" cy="122" rx="5" ry="6"  fill={f('triceps', 'triceps_medial')} stroke={STROKE} strokeWidth="1"/>

          {/* Forearm extensors (back view) */}
          <ellipse cx="216" cy="152" rx="8" ry="22" fill={f('forearms', 'forearm_extensors')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="324" cy="152" rx="8" ry="22" fill={f('forearms', 'forearm_extensors')} stroke={STROKE} strokeWidth="1"/>

          {/* Obliques (back view side strips) */}
          <path d="M244 120 L254 124 L254 150 L246 148 Z"
                fill={f('core', 'obliques')} stroke={STROKE} strokeWidth="1"/>
          <path d="M296 120 L286 124 L286 150 L294 148 Z"
                fill={f('core', 'obliques')} stroke={STROKE} strokeWidth="1"/>

          {/* Glute med (upper outer hip) */}
          <ellipse cx="246" cy="164" rx="8" ry="8" fill={f('posterior', 'glute_med')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="294" cy="164" rx="8" ry="8" fill={f('posterior', 'glute_med')} stroke={STROKE} strokeWidth="1"/>
          {/* Glute max (main buttock) */}
          <ellipse cx="258" cy="186" rx="14" ry="16" fill={f('posterior', 'glute_max')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="282" cy="186" rx="14" ry="16" fill={f('posterior', 'glute_max')} stroke={STROKE} strokeWidth="1"/>

          {/* Hamstrings: biceps femoris (outer), semi- (inner) each leg */}
          <ellipse cx="250" cy="232" rx="8"  ry="30" fill={f('posterior', 'hams_bf')}  stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="266" cy="232" rx="8"  ry="30" fill={f('posterior', 'hams_semi')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="274" cy="232" rx="8"  ry="30" fill={f('posterior', 'hams_semi')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="290" cy="232" rx="8"  ry="30" fill={f('posterior', 'hams_bf')}  stroke={STROKE} strokeWidth="1"/>

          {/* Calves: gastroc (upper bulging) + soleus (lower narrower) */}
          <ellipse cx="258" cy="285" rx="10" ry="18" fill={f('calves', 'gastrocnemius')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="282" cy="285" rx="10" ry="18" fill={f('calves', 'gastrocnemius')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="258" cy="310" rx="8"  ry="10" fill={f('calves', 'soleus')} stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="282" cy="310" rx="8"  ry="10" fill={f('calves', 'soleus')} stroke={STROKE} strokeWidth="1"/>

          {/* Feet */}
          <ellipse cx="258" cy="332" rx="11" ry="5" fill="rgba(150,150,150,0.12)" stroke={STROKE} strokeWidth="1"/>
          <ellipse cx="282" cy="332" rx="11" ry="5" fill="rgba(150,150,150,0.12)" stroke={STROKE} strokeWidth="1"/>
        </g>

        {/* Legend */}
        <g fontSize="10" fontFamily="monospace" fill="currentColor">
          <rect x="6" y="395" width="10" height="10" fill={COLORS.primary} stroke={STROKE}/>
          <text x="20" y="404">primary</text>
          <rect x="78" y="395" width="10" height="10" fill={COLORS.secondary} stroke={STROKE}/>
          <text x="92" y="404">secondary</text>
        </g>
      </svg>

      {/* Activated sub-muscles list */}
      {(lit.length > 0 || litGroupOnly.length > 0) && (
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'center'}}>
          {lit.map((k) => (
            <span
              key={k}
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--ifm-font-family-monospace)',
                fontWeight: 700,
                padding: '0.12rem 0.5rem',
                borderRadius: '10px',
                color: s[k] === 'primary' ? '#fff' : '#111',
                background: COLORS[s[k]!],
              }}
              title={SUB_LABELS[k]}
            >
              {SUB_LABELS[k]}
            </span>
          ))}
          {litGroupOnly.map((k) => (
            <span
              key={`g-${k}`}
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--ifm-font-family-monospace)',
                fontWeight: 700,
                padding: '0.12rem 0.5rem',
                borderRadius: '10px',
                color: g[k] === 'primary' ? '#fff' : '#111',
                background: COLORS[g[k]!],
                opacity: 0.85,
              }}
            >
              {GROUP_LABELS[k]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
