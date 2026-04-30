import {useState, useMemo, useCallback, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './session-builder.module.css';
import {
  type MuscleGroup,
  type ExerciseCategory,
  type Exercise,
  MUSCLE_GROUPS,
  GROUP_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_PURPOSE,
  exercisesFor,
  exerciseVideoUrl,
} from '../../data/routineData';
import MuscleMap, {
  activationFor,
  mergeActivations,
} from '../../components/MuscleMap';

/* ══════════════════════════════════════════
   SESSION BUILDER
   Cherry-pick today's workout.
   For each muscle group, choose a category
   (Strength / Metabolic / Hypertrophy /
   Isolation) and pick specific exercises
   from the best-known list for that combo.
   ══════════════════════════════════════════ */

type PickedExercise = {
  id: number;
  group: MuscleGroup;
  category: ExerciseCategory;
  exercise: Exercise;
};

function validateSession(picks: PickedExercise[]): string[] {
  const warnings: string[] = [];

  // Multiple strength blocks — CNS load
  const strengthCount = picks.filter((p) => p.category === 'strength').length;
  if (strengthCount > 3) {
    warnings.push(`${strengthCount} strength lifts selected. Max 1 strength focus per group per session.`);
  }

  // Chest strength + other strength
  const groupsWithStrength = new Set(picks.filter((p) => p.category === 'strength').map((p) => p.group));
  if (groupsWithStrength.has('chest') && groupsWithStrength.size > 1) {
    warnings.push('Chest STRENGTH is a SACRED session — other strength work not recommended.');
  }

  // Deadlift (back strength) before squat (quad strength)
  const dlIdx = picks.findIndex((p) => p.group === 'back' && p.category === 'strength');
  const sqIdx = picks.findIndex((p) => p.group === 'quad' && p.category === 'strength');
  if (dlIdx >= 0 && sqIdx >= 0 && sqIdx < dlIdx) {
    warnings.push('Back STRENGTH (deadlift) should come before Quad STRENGTH (squat) on the same day.');
  }

  // Strength should precede other categories
  let sawNonStrength = false;
  for (const p of picks) {
    if (p.category !== 'strength') sawNonStrength = true;
    else if (sawNonStrength) {
      warnings.push('Strength lifts should come first in the session, before Metabolic / Hypertrophy / Isolation.');
      break;
    }
  }

  return warnings;
}

export default function SessionBuilder(): ReactNode {
  const [picks, setPicks] = useState<PickedExercise[]>([]);
  const [nextId, setNextId] = useState(1);
  const [selGroup, setSelGroup] = useState<MuscleGroup>('chest');
  const [selCategory, setSelCategory] = useState<ExerciseCategory>('strength');

  const addExercise = useCallback((exercise: Exercise) => {
    setPicks((prev) => [
      ...prev,
      {id: nextId, group: selGroup, category: selCategory, exercise},
    ]);
    setNextId((n) => n + 1);
  }, [nextId, selGroup, selCategory]);

  const removePick = useCallback((id: number) => {
    setPicks((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const movePick = useCallback((id: number, dir: -1 | 1) => {
    setPicks((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  }, []);

  const clearAll = useCallback(() => {
    setPicks([]);
    setNextId(1);
  }, []);

  const warnings = useMemo(() => validateSession(picks), [picks]);
  const availableExercises = useMemo(() => exercisesFor(selGroup, selCategory), [selGroup, selCategory]);
  const pickedNames = new Set(
    picks.filter((p) => p.group === selGroup && p.category === selCategory).map((p) => p.exercise.name)
  );

  return (
    <Layout title="Session Builder" description="Cherry-pick today's workout by muscle group, training category, and specific exercises.">
      <div className={styles.page}>
        <header className={styles.header}>
          <Heading as="h1" className={styles.title}>Session Builder</Heading>
          <p className={styles.subtitle}>
            Cherry-pick today's workout &mdash; pick a group, a category, and the exact exercises you want.
          </p>
        </header>

        {/* ─── Category legend ─── */}
        <div className={styles.legend}>
          {CATEGORIES.map((c) => (
            <div key={c} className={styles.legendItem}>
              <span className={styles.legendBadge} style={{background: CATEGORY_COLORS[c]}}>
                {CATEGORY_LABELS[c]}
              </span>
              <span className={styles.legendText}>{CATEGORY_PURPOSE[c]}</span>
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          {/* ─── PICKER PANEL ─── */}
          <div className={styles.pickerPanel}>
            <Heading as="h3" className={styles.sectionTitle}>Pick exercises</Heading>

            <div className={styles.pickerField}>
              <label className={styles.fieldLabel}>Muscle group</label>
              <div className={styles.chipRow}>
                {MUSCLE_GROUPS.map((g) => (
                  <button
                    key={g}
                    className={`${styles.chip} ${selGroup === g ? styles.chipActive : ''}`}
                    onClick={() => setSelGroup(g)}
                  >
                    {GROUP_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.pickerField}>
              <label className={styles.fieldLabel}>Category</label>
              <div className={styles.chipRow}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    className={`${styles.chip} ${selCategory === c ? styles.chipActive : ''}`}
                    style={selCategory === c ? {background: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c], color: '#fff'} : {borderColor: CATEGORY_COLORS[c], color: CATEGORY_COLORS[c]}}
                    onClick={() => setSelCategory(c)}
                    title={CATEGORY_PURPOSE[c]}
                  >
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.pickerField}>
              <div className={styles.availableHeader}>
                <label className={styles.fieldLabel}>
                  {GROUP_LABELS[selGroup]} · {CATEGORY_LABELS[selCategory]}
                </label>
                <span className={styles.availableCount}>{availableExercises.length} exercises</span>
              </div>
              <div className={styles.exerciseList}>
                {availableExercises.map((ex) => {
                  const already = pickedNames.has(ex.name);
                  return (
                    <div
                      key={ex.name}
                      className={`${styles.exerciseBtn} ${already ? styles.exerciseBtnPicked : ''}`}
                    >
                      <span className={styles.exName}>
                        {ex.compound ? '◆ ' : ''}{ex.name}
                      </span>
                      <span className={styles.exMeta}>{ex.sets} &times; {ex.reps}</span>
                      {(ex.primary || ex.secondary) && (
                        <span className={styles.exActivation}>
                          {(ex.primary ?? []).map((g) => (
                            <span key={`p-${g}`} className={styles.pillPrimary}>{GROUP_LABELS[g]}</span>
                          ))}
                          {(ex.secondary ?? []).map((g) => (
                            <span key={`s-${g}`} className={styles.pillSecondary}>{GROUP_LABELS[g]}</span>
                          ))}
                        </span>
                      )}
                      {ex.notes && <span className={styles.exNotes}>{ex.notes}</span>}
                      <span className={styles.exActionRow}>
                        <a
                          href={exerciseVideoUrl(ex.name)}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.exVideoLink}
                          title="Open YouTube tutorial"
                        >▶ video</a>
                        <button
                          type="button"
                          className={styles.exAddBtn}
                          onClick={() => addExercise(ex)}
                          disabled={already}
                        >{already ? '✓ added' : '+ add'}</button>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── SESSION PANEL ─── */}
          <div className={styles.sessionPanel}>
            <div className={styles.sessionHeader}>
              <Heading as="h3" className={styles.sectionTitle}>Today's Session</Heading>
              {picks.length > 0 && (
                <button className={styles.clearBtn} onClick={clearAll}>Clear</button>
              )}
            </div>

            {picks.length === 0 && (
              <p className={styles.emptyState}>
                No exercises yet. Pick a group, a category, and tap exercises to add them.
              </p>
            )}

            {warnings.length > 0 && (
              <div className={styles.warningBox}>
                <strong>Heads up:</strong>
                <ul>
                  {warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            {picks.length > 0 && (
              <div className={styles.summary}>
                <strong>{picks.length}</strong> exercise{picks.length !== 1 ? 's' : ''} · estimated{' '}
                <strong>{picks.reduce((s, p) => s + (parseInt(p.exercise.sets) || 0), 0)}</strong> working sets
              </div>
            )}

            {picks.length > 0 && (
              <div className={styles.mapWrap}>
                <MuscleMap
                  activation={mergeActivations(
                    picks.map((p) =>
                      activationFor(
                        p.exercise.primary,
                        p.exercise.secondary,
                        p.exercise.primarySub,
                        p.exercise.secondarySub,
                      )
                    )
                  )}
                />
              </div>
            )}

            {picks.map((p, idx) => (
              <div key={p.id} className={styles.pickCard}>
                <div className={styles.pickHeader}>
                  <span
                    className={styles.pickBadge}
                    style={{background: CATEGORY_COLORS[p.category]}}
                  >
                    {CATEGORY_LABELS[p.category]}
                  </span>
                  <span className={styles.pickGroup}>{GROUP_LABELS[p.group]}</span>
                  <div className={styles.pickControls}>
                    <button
                      className={styles.moveBtn}
                      onClick={() => movePick(p.id, -1)}
                      disabled={idx === 0}
                      title="Move up"
                    >▲</button>
                    <button
                      className={styles.moveBtn}
                      onClick={() => movePick(p.id, 1)}
                      disabled={idx === picks.length - 1}
                      title="Move down"
                    >▼</button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removePick(p.id)}
                      title="Remove"
                    >×</button>
                  </div>
                </div>
                <div className={styles.pickBody}>
                  <div className={styles.pickName}>{p.exercise.name}</div>
                  <div className={styles.pickMeta}>
                    <span className={styles.pickSetsReps}>{p.exercise.sets} &times; {p.exercise.reps}</span>
                    {p.exercise.biseriePair && (
                      <span className={styles.pickBiserie}>+ {p.exercise.biseriePair} (biserie)</span>
                    )}
                  </div>
                  {p.exercise.notes && <div className={styles.pickNotes}>{p.exercise.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
