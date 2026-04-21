import {useState, useCallback, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './routine-generator.module.css';
import {
  type Intensity,
  type MuscleGroup,
  type Exercise,
  MUSCLE_GROUPS,
  GROUP_LABELS,
  INTENSITY_COLORS,
  INTENSITY_LABELS,
  EXERCISES,
} from '../../data/routineData';

type DayBlock = {
  group: MuscleGroup;
  intensity: Intensity;
  exercises: Exercise[];
};

type DayPlan = {
  day: string;
  blocks: DayBlock[];
  warnings: string[];
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


/* ── Presets ── */
type PresetKey = '3day' | '4day' | '5day' | '6day' | 'custom';

type DayConfig = {
  enabled: boolean;
  blocks: {group: MuscleGroup; intensity: Intensity}[];
};

type WeekConfig = Record<string, DayConfig>;

function makePreset(key: PresetKey): WeekConfig {
  const week: WeekConfig = {};
  DAYS.forEach((d) => (week[d] = {enabled: false, blocks: []}));

  if (key === '3day') {
    week['Monday'] = {enabled: true, blocks: [{group: 'quad', intensity: 'high'}, {group: 'posterior', intensity: 'medium'}]};
    week['Wednesday'] = {enabled: true, blocks: [{group: 'chest', intensity: 'high'}]};
    week['Friday'] = {enabled: true, blocks: [{group: 'back', intensity: 'high'}, {group: 'shoulder', intensity: 'medium'}, {group: 'biceps', intensity: 'medium'}, {group: 'triceps', intensity: 'medium'}]};
  } else if (key === '4day') {
    week['Monday'] = {enabled: true, blocks: [{group: 'quad', intensity: 'high'}, {group: 'chest', intensity: 'medium'}]};
    week['Tuesday'] = {enabled: true, blocks: [{group: 'back', intensity: 'medium'}, {group: 'biceps', intensity: 'high'}, {group: 'triceps', intensity: 'high'}]};
    week['Thursday'] = {enabled: true, blocks: [{group: 'chest', intensity: 'high'}]};
    week['Friday'] = {enabled: true, blocks: [{group: 'back', intensity: 'high'}, {group: 'shoulder', intensity: 'high'}, {group: 'posterior', intensity: 'medium'}]};
  } else if (key === '5day') {
    week['Monday'] = {enabled: true, blocks: [{group: 'quad', intensity: 'high'}, {group: 'chest', intensity: 'medium'}, {group: 'back', intensity: 'low'}]};
    week['Tuesday'] = {enabled: true, blocks: [{group: 'back', intensity: 'medium'}, {group: 'biceps', intensity: 'high'}, {group: 'triceps', intensity: 'high'}]};
    week['Wednesday'] = {enabled: true, blocks: [{group: 'chest', intensity: 'high'}]};
    week['Thursday'] = {enabled: true, blocks: [{group: 'shoulder', intensity: 'high'}, {group: 'posterior', intensity: 'medium'}]};
    week['Friday'] = {enabled: true, blocks: [{group: 'back', intensity: 'high'}, {group: 'shoulder', intensity: 'medium'}, {group: 'biceps', intensity: 'medium'}, {group: 'triceps', intensity: 'medium'}]};
  } else if (key === '6day') {
    week['Monday'] = {enabled: true, blocks: [{group: 'quad', intensity: 'high'}, {group: 'chest', intensity: 'medium'}]};
    week['Tuesday'] = {enabled: true, blocks: [{group: 'back', intensity: 'medium'}, {group: 'biceps', intensity: 'high'}, {group: 'triceps', intensity: 'high'}]};
    week['Wednesday'] = {enabled: true, blocks: [{group: 'chest', intensity: 'high'}]};
    week['Thursday'] = {enabled: true, blocks: [{group: 'shoulder', intensity: 'high'}, {group: 'posterior', intensity: 'high'}]};
    week['Friday'] = {enabled: true, blocks: [{group: 'back', intensity: 'high'}, {group: 'shoulder', intensity: 'medium'}]};
    week['Saturday'] = {enabled: true, blocks: [{group: 'quad', intensity: 'low'}, {group: 'posterior', intensity: 'low'}, {group: 'chest', intensity: 'low'}, {group: 'back', intensity: 'low'}, {group: 'biceps', intensity: 'low'}, {group: 'triceps', intensity: 'low'}]};
  }

  return week;
}

/* ── Constraint validation ── */
function validateWeek(week: WeekConfig): DayPlan[] {
  const enabledDays = DAYS.filter((d) => week[d].enabled);
  const plans: DayPlan[] = [];

  // Track last HIGH day index per group for 72hr rule
  const lastHighDay: Partial<Record<MuscleGroup, number>> = {};

  enabledDays.forEach((day, dayIdx) => {
    const cfg = week[day];
    const warnings: string[] = [];

    // Count HIGH blocks in this session
    const highBlocks = cfg.blocks.filter((b) => b.intensity === 'high');
    if (highBlocks.length > 1) {
      warnings.push(`Multiple HIGH blocks (${highBlocks.map(b => GROUP_LABELS[b.group]).join(', ')}). Max 1 HIGH per session recommended.`);
    }

    // Chest HIGH with other groups
    const hasChestHigh = cfg.blocks.some((b) => b.group === 'chest' && b.intensity === 'high');
    if (hasChestHigh && cfg.blocks.length > 1) {
      const otherHighs = cfg.blocks.filter((b) => !(b.group === 'chest') || b.intensity !== 'high');
      if (otherHighs.some(b => b.intensity === 'high')) {
        warnings.push('Chest HIGH is a SACRED session — no other HIGH blocks recommended.');
      }
    }

    // Check deadlift before squat order
    const hasDeadlift = cfg.blocks.some((b) => b.group === 'back' && b.intensity === 'high');
    const hasSquat = cfg.blocks.some((b) => b.group === 'quad' && b.intensity === 'high');
    if (hasDeadlift && hasSquat) {
      const dlIdx = cfg.blocks.findIndex((b) => b.group === 'back' && b.intensity === 'high');
      const sqIdx = cfg.blocks.findIndex((b) => b.group === 'quad' && b.intensity === 'high');
      if (sqIdx < dlIdx) {
        warnings.push('Deadlift should come before squat when both are HIGH on the same day.');
      }
    }

    // HIGH should precede MEDIUM/LOW in session
    let foundNonHigh = false;
    for (const b of cfg.blocks) {
      if (b.intensity !== 'high') foundNonHigh = true;
      if (b.intensity === 'high' && foundNonHigh) {
        warnings.push('HIGH blocks should come first in the session, before MEDIUM/LOW.');
        break;
      }
    }

    // 72hr rule between HIGH of same group
    cfg.blocks.forEach((b) => {
      if (b.intensity === 'high' && lastHighDay[b.group] !== undefined) {
        // Estimate days between based on day-of-week index
        const prevDayName = enabledDays[lastHighDay[b.group]!];
        const prevIdx = DAYS.indexOf(prevDayName);
        const curIdx = DAYS.indexOf(day);
        const daysBetween = (curIdx - prevIdx + 7) % 7;
        if (daysBetween < 3) {
          warnings.push(
            `${GROUP_LABELS[b.group]} HIGH — only ${daysBetween} day(s) since last HIGH. Need 72hrs (3 days) minimum.`
          );
        }
      }
      if (b.intensity === 'high') {
        lastHighDay[b.group] = dayIdx;
      }
    });

    const blocks: DayBlock[] = cfg.blocks.map((b) => ({
      group: b.group,
      intensity: b.intensity,
      exercises: EXERCISES[b.group][b.intensity],
    }));

    plans.push({day, blocks, warnings});
  });

  return plans;
}

/* ── Diagnostic Table (Section VII) ── */
type DiagnosticRow = {signal: string; diagnosis: string; fix: string};

const DIAGNOSTICS: DiagnosticRow[] = [
  {signal: 'Load stalling for 3+ weeks on HIGH days', diagnosis: 'Accumulated CNS fatigue', fix: 'Reduce HIGH days from 3 to 2/week. Add a full rest day. Evaluate sleep.'},
  {signal: 'Pre-workout fatigue, no motivation, low strength from warm-up', diagnosis: 'CNS overtraining', fix: '3-5 days complete rest or LOW sessions only. Evaluate calories.'},
  {signal: 'Strength gains but no visual body composition changes', diagnosis: 'Neurological adaptation dominating', fix: 'Increase protein and total calories. Surplus +200-300 kcal. Check sleep.'},
  {signal: 'Visual changes but no load progression', diagnosis: 'Sarcoplasmic hypertrophy dominating', fix: 'Increase load on HIGH days. Prioritize strength progression.'},
  {signal: 'DOMS persisting more than 72 hrs post-HIGH', diagnosis: 'Excessive muscle damage', fix: 'Reduce sets on HIGH days. Protein >= 2g/kg. Omega-3 and sleep.'},
  {signal: 'No DOMS, no effort sensation, flat load', diagnosis: 'Stimulus adaptation', fix: 'Change exercise A. Increase load significantly. Add intensity techniques to B.'},
];

/* ══════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════ */

export default function RoutineGenerator(): ReactNode {
  const [preset, setPreset] = useState<PresetKey>('5day');
  const [week, setWeek] = useState<WeekConfig>(() => makePreset('5day'));
  const [showDiag, setShowDiag] = useState(false);

  const handlePreset = useCallback((key: PresetKey) => {
    setPreset(key);
    if (key !== 'custom') {
      setWeek(makePreset(key));
    }
  }, []);

  const toggleDay = useCallback((day: string) => {
    setPreset('custom');
    setWeek((prev) => ({
      ...prev,
      [day]: {...prev[day], enabled: !prev[day].enabled},
    }));
  }, []);

  const addBlock = useCallback((day: string) => {
    setPreset('custom');
    setWeek((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        blocks: [...prev[day].blocks, {group: 'chest' as MuscleGroup, intensity: 'medium' as Intensity}],
      },
    }));
  }, []);

  const removeBlock = useCallback((day: string, idx: number) => {
    setPreset('custom');
    setWeek((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        blocks: prev[day].blocks.filter((_, i) => i !== idx),
      },
    }));
  }, []);

  const updateBlock = useCallback((day: string, idx: number, field: 'group' | 'intensity', value: string) => {
    setPreset('custom');
    setWeek((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        blocks: prev[day].blocks.map((b, i) =>
          i === idx ? {...b, [field]: value} : b
        ),
      },
    }));
  }, []);

  const plans = validateWeek(week);

  return (
    <Layout title="Routine Generator" description="Goose Method - Custom routine generator by neurological demand">
      <div className={styles.page}>
        <header className={styles.header}>
          <Heading as="h1" className={styles.title}>Routine Generator</Heading>
          <p className={styles.subtitle}>
            Undulating Periodization by Neurological Demand &mdash; Goose Method
          </p>
        </header>

        {/* Preset selector */}
        <div className={styles.selectorRow}>
          <span className={styles.selectorLabel}>Presets:</span>
          {(['3day', '4day', '5day', '6day', 'custom'] as PresetKey[]).map((k) => (
            <button
              key={k}
              className={`${styles.dayBtn} ${preset === k ? styles.dayBtnActive : ''}`}
              onClick={() => handlePreset(k)}
            >
              {k === 'custom' ? 'Custom' : `${k[0]} Days`}
            </button>
          ))}
        </div>

        {/* Constraints reminder */}
        <div className={styles.constraintBox}>
          <strong>Active constraints (auto-validated):</strong>
          <ul className={styles.constraintList}>
            <li>Max 1 HIGH block per session</li>
            <li>72 hrs minimum between HIGH of same group</li>
            <li>Chest HIGH = single session (SACRED)</li>
            <li>Deadlift always before squat if same day</li>
            <li>HIGH blocks first in session order</li>
          </ul>
        </div>

        {/* ── DAY CONFIGURATOR ── */}
        <div className={styles.configurator}>
          {DAYS.map((day) => (
            <div key={day} className={`${styles.dayConfig} ${week[day].enabled ? styles.dayEnabled : ''}`}>
              <div className={styles.dayConfigHeader}>
                <label className={styles.dayToggle}>
                  <input
                    type="checkbox"
                    checked={week[day].enabled}
                    onChange={() => toggleDay(day)}
                  />
                  <strong>{day}</strong>
                </label>
                {week[day].enabled && (
                  <button className={styles.addBtn} onClick={() => addBlock(day)}>
                    + Add Block
                  </button>
                )}
              </div>

              {week[day].enabled && (
                <div className={styles.blockConfigs}>
                  {week[day].blocks.map((b, idx) => (
                    <div key={idx} className={styles.blockRow}>
                      <select
                        value={b.group}
                        onChange={(e) => updateBlock(day, idx, 'group', e.target.value)}
                        className={styles.blockSelect}
                      >
                        {MUSCLE_GROUPS.map((g) => (
                          <option key={g} value={g}>{GROUP_LABELS[g]}</option>
                        ))}
                      </select>
                      <div className={styles.intensityPicker}>
                        {(['high', 'medium', 'low'] as Intensity[]).map((int) => (
                          <button
                            key={int}
                            className={`${styles.intBtn} ${b.intensity === int ? styles.intBtnActive : ''}`}
                            style={b.intensity === int ? {background: INTENSITY_COLORS[int], borderColor: INTENSITY_COLORS[int]} : {}}
                            onClick={() => updateBlock(day, idx, 'intensity', int)}
                          >
                            {INTENSITY_LABELS[int]}
                          </button>
                        ))}
                      </div>
                      <button className={styles.removeBtn} onClick={() => removeBlock(day, idx)}>
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── GENERATED PLAN ── */}
        {plans.length > 0 && (
          <>
            <Heading as="h2" className={styles.planTitle}>Your Week</Heading>
            <div className={styles.weekGrid}>
              {plans.map((day) => (
                <div key={day.day} className={styles.dayCard}>
                  <div className={styles.dayHeader}>
                    <strong className={styles.dayName}>{day.day}</strong>
                    <div className={styles.intensityBadges}>
                      {day.blocks.map((b, i) => (
                        <span key={i} className={styles.badge} style={{background: INTENSITY_COLORS[b.intensity]}}>
                          {INTENSITY_LABELS[b.intensity]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Warnings */}
                  {day.warnings.length > 0 && (
                    <div className={styles.warningBox}>
                      {day.warnings.map((w, i) => (
                        <div key={i} className={styles.warningItem}>{w}</div>
                      ))}
                    </div>
                  )}

                  {day.blocks.map((b, i) => (
                    <div key={i} className={styles.blockSection}>
                      <div className={styles.blockTitle}>
                        <span className={styles.blockDot} style={{background: INTENSITY_COLORS[b.intensity]}} />
                        {GROUP_LABELS[b.group]} — {INTENSITY_LABELS[b.intensity]}
                      </div>
                      <div className={styles.exerciseList}>
                        {b.exercises.map((ex) => (
                          <div key={ex.name} className={styles.exerciseRow}>
                            <div className={styles.exName}>
                              {ex.name}
                              {ex.biseriePair && <span className={styles.biserie}> + {ex.biseriePair}</span>}
                            </div>
                            <div className={styles.exDetail}>{ex.sets}x{ex.reps}</div>
                            {ex.notes && <div className={styles.exNote}>{ex.notes}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {/* PAP Protocol */}
        <div className={styles.papBox}>
          <Heading as="h3">PAP Superset Protocol</Heading>
          <ol className={styles.papList}>
            <li><strong>Exercise A:</strong> Compound, max load. 5x5 HIGH / 4x8 MEDIUM.</li>
            <li><strong>Transition A→B:</strong> ZERO seconds. PAP window is narrow.</li>
            <li><strong>Exercise B:</strong> 8-15 reps to perceptual failure. The muscle decides.</li>
            <li><strong>Rest post-superset:</strong> 3-5 min HIGH / 60-90 sec MEDIUM.</li>
          </ol>
        </div>

        {/* Diagnostic */}
        <button className={styles.diagToggle} onClick={() => setShowDiag(!showDiag)}>
          {showDiag ? 'Hide' : 'Show'} Diagnostic Table
        </button>

        {showDiag && (
          <div className={styles.diagTable}>
            <table>
              <thead><tr><th>Signal</th><th>Diagnosis</th><th>Correction</th></tr></thead>
              <tbody>
                {DIAGNOSTICS.map((d, i) => (
                  <tr key={i}><td>{d.signal}</td><td>{d.diagnosis}</td><td>{d.fix}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
