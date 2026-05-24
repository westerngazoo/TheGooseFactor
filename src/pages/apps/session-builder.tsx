import {useState, useMemo, useCallback, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Translate, {translate} from '@docusaurus/Translate';
import styles from './session-builder.module.css';
import {
  type MuscleGroup,
  type ExerciseCategory,
  type Exercise,
  MUSCLE_GROUPS,
  CATEGORIES,
  CATEGORY_COLORS,
  exercisesFor,
  exerciseVideoUrl,
  ALL_EXERCISES,
} from '../../data/routineData';
import {useT} from '../../data/routineData.translations';
import MuscleMap, {
  activationFor,
  mergeActivations,
} from '../../components/MuscleMap';
import BrowserOnly from '@docusaurus/BrowserOnly';
import BodyWeightInput, {KcalBadge} from '../../components/BodyWeightInput';
import {estimateCalories} from '../../lib/calories';

/* ══════════════════════════════════════════
   SESSION BUILDER (i18n)
   ══════════════════════════════════════════ */

type PickedExercise = {
  id: number;
  group: MuscleGroup;
  category: ExerciseCategory;
  exercise: Exercise;
};

type WarningKey =
  | {kind: 'tooManyStrength'; count: number}
  | {kind: 'sacredChest'}
  | {kind: 'dlBeforeSquat'}
  | {kind: 'strengthFirst'};

function validateSession(picks: PickedExercise[]): WarningKey[] {
  const warnings: WarningKey[] = [];
  const strengthCount = picks.filter((p) => p.category === 'strength').length;
  if (strengthCount > 3) warnings.push({kind: 'tooManyStrength', count: strengthCount});

  const groupsWithStrength = new Set(picks.filter((p) => p.category === 'strength').map((p) => p.group));
  if (groupsWithStrength.has('chest') && groupsWithStrength.size > 1) warnings.push({kind: 'sacredChest'});

  const dlIdx = picks.findIndex((p) => p.group === 'back' && p.category === 'strength');
  const sqIdx = picks.findIndex((p) => p.group === 'quad' && p.category === 'strength');
  if (dlIdx >= 0 && sqIdx >= 0 && sqIdx < dlIdx) warnings.push({kind: 'dlBeforeSquat'});

  let sawNonStrength = false;
  for (const p of picks) {
    if (p.category !== 'strength') sawNonStrength = true;
    else if (sawNonStrength) { warnings.push({kind: 'strengthFirst'}); break; }
  }
  return warnings;
}

function renderWarning(w: WarningKey): string {
  switch (w.kind) {
    case 'tooManyStrength':
      return translate(
        {
          id: 'apps.sessionBuilder.warn.tooManyStrength',
          message: '{count} strength lifts selected. Max 1 strength focus per group per session.',
        },
        {count: w.count}
      );
    case 'sacredChest':
      return translate({
        id: 'apps.sessionBuilder.warn.sacredChest',
        message: 'Chest STRENGTH is a SACRED session — other strength work not recommended.',
      });
    case 'dlBeforeSquat':
      return translate({
        id: 'apps.sessionBuilder.warn.dlBeforeSquat',
        message: 'Back STRENGTH (deadlift) should come before Quad STRENGTH (squat) on the same day.',
      });
    case 'strengthFirst':
      return translate({
        id: 'apps.sessionBuilder.warn.strengthFirst',
        message: 'Strength lifts should come first in the session, before Metabolic / Hypertrophy / Isolation.',
      });
  }
}

export default function SessionBuilder(): ReactNode {
  const t = useT();
  const [picks, setPicks] = useState<PickedExercise[]>([]);
  const [nextId, setNextId] = useState(1);
  const [selGroup, setSelGroup] = useState<MuscleGroup>('chest');
  const [selCategory, setSelCategory] = useState<ExerciseCategory>('strength');
  const [exSearch, setExSearch] = useState('');
  const [bodyKg, setBodyKg] = useState<number>(0);
  const totalKcal = bodyKg > 0
    ? picks.reduce((sum, p) => sum + estimateCalories(p.exercise, bodyKg), 0)
    : 0;

  const addExercise = useCallback((exercise: Exercise) => {
    setPicks((prev) => [...prev, {id: nextId, group: selGroup, category: selCategory, exercise}]);
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
  const availableExercises = useMemo(() => {
    const q = exSearch.trim().toLowerCase();
    if (q) return ALL_EXERCISES.filter((e) =>
      e.name.toLowerCase().includes(q) || t.tName(e.name).toLowerCase().includes(q)
    );
    return exercisesFor(selGroup, selCategory);
  }, [selGroup, selCategory, exSearch, t]);
  const pickedNames = new Set(
    picks.filter((p) => p.group === selGroup && p.category === selCategory).map((p) => p.exercise.name)
  );

  return (
    <Layout
      title={translate({id: 'apps.sessionBuilder.title', message: 'Session Builder'})}
      description={translate({id: 'apps.sessionBuilder.description', message: "Cherry-pick today's workout by muscle group, training category, and specific exercises."})}
    >
      <div className={styles.page}>
        <header className={styles.header}>
          <Heading as="h1" className={styles.title}>
            <Translate id="apps.sessionBuilder.title">Session Builder</Translate>
          </Heading>
          <p className={styles.subtitle}>
            <Translate id="apps.sessionBuilder.subtitle">
              Cherry-pick today's workout — pick a group, a category, and the exact exercises you want.
            </Translate>
          </p>
          <div style={{marginTop: '0.5rem', display: 'flex', justifyContent: 'center'}}>
            <BrowserOnly>{() => <BodyWeightInput onChange={setBodyKg} />}</BrowserOnly>
          </div>
        </header>

        {/* ─── Category legend ─── */}
        <div className={styles.legend}>
          {CATEGORIES.map((c) => (
            <div key={c} className={styles.legendItem}>
              <span className={styles.legendBadge} style={{background: CATEGORY_COLORS[c]}}>
                {t.tCategory(c)}
              </span>
              <span className={styles.legendText}>{t.tCategoryPurpose(c)}</span>
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          {/* ─── PICKER PANEL ─── */}
          <div className={styles.pickerPanel}>
            <Heading as="h3" className={styles.sectionTitle}>
              <Translate id="apps.sessionBuilder.picker.title">Pick exercises</Translate>
            </Heading>

            <div className={styles.pickerField}>
              <label className={styles.fieldLabel}>
                <Translate id="apps.sessionBuilder.picker.muscleGroup">Muscle group</Translate>
              </label>
              <div className={styles.chipRow}>
                {MUSCLE_GROUPS.map((g) => (
                  <button
                    key={g}
                    className={`${styles.chip} ${selGroup === g ? styles.chipActive : ''}`}
                    onClick={() => setSelGroup(g)}
                  >
                    {t.tGroup(g)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.pickerField}>
              <label className={styles.fieldLabel}>
                <Translate id="apps.sessionBuilder.picker.category">Category</Translate>
              </label>
              <div className={styles.chipRow}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    className={`${styles.chip} ${selCategory === c ? styles.chipActive : ''}`}
                    style={selCategory === c ? {background: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c], color: '#fff'} : {borderColor: CATEGORY_COLORS[c], color: CATEGORY_COLORS[c]}}
                    onClick={() => setSelCategory(c)}
                    title={t.tCategoryPurpose(c)}
                  >
                    {t.tCategory(c)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.pickerField}>
              <label className={styles.fieldLabel}>
                <Translate id="apps.sessionBuilder.picker.search">Search any exercise</Translate>
              </label>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={translate({id: 'apps.sessionBuilder.picker.searchPlaceholder', message: 'Type to search the full library — clear to filter by group/category'})}
                value={exSearch}
                onChange={(e) => setExSearch(e.target.value)}
              />
            </div>

            <div className={styles.pickerField}>
              <div className={styles.availableHeader}>
                <label className={styles.fieldLabel}>
                  {exSearch.trim() ? (
                    <Translate
                      id="apps.sessionBuilder.picker.searchLabel"
                      values={{query: exSearch.trim()}}
                    >{'Search: "{query}"'}</Translate>
                  ) : (
                    `${t.tGroup(selGroup)} · ${t.tCategory(selCategory)}`
                  )}
                </label>
                <span className={styles.availableCount}>
                  <Translate
                    id="apps.sessionBuilder.picker.count"
                    values={{count: availableExercises.length}}
                  >{'{count} exercises'}</Translate>
                </span>
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
                        {ex.compound ? '◆ ' : ''}{t.tName(ex.name)}
                      </span>
                      <span className={styles.exMeta}>{ex.sets} × {ex.reps}</span>
                      {(ex.primary || ex.secondary) && (
                        <span className={styles.exActivation}>
                          {(ex.primary ?? []).map((g) => (
                            <span key={`p-${g}`} className={styles.pillPrimary}>{t.tGroup(g)}</span>
                          ))}
                          {(ex.secondary ?? []).map((g) => (
                            <span key={`s-${g}`} className={styles.pillSecondary}>{t.tGroup(g)}</span>
                          ))}
                        </span>
                      )}
                      {ex.notes && <span className={styles.exNotes}>{t.tNotes(ex.name, ex.notes)}</span>}
                      <span className={styles.exActionRow}>
                        <a
                          href={exerciseVideoUrl(ex.name)}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.exVideoLink}
                          title={translate({id: 'apps.sessionBuilder.exercise.videoTitle', message: 'Open YouTube tutorial'})}
                        >
                          <Translate id="apps.sessionBuilder.exercise.video">▶ video</Translate>
                        </a>
                        <button
                          type="button"
                          className={styles.exAddBtn}
                          onClick={() => addExercise(ex)}
                          disabled={already}
                        >
                          {already
                            ? <Translate id="apps.sessionBuilder.exercise.added">✓ added</Translate>
                            : <Translate id="apps.sessionBuilder.exercise.add">+ add</Translate>}
                        </button>
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
              <Heading as="h3" className={styles.sectionTitle}>
                <Translate id="apps.sessionBuilder.session.title">Today's Session</Translate>
              </Heading>
              {picks.length > 0 && (
                <button className={styles.clearBtn} onClick={clearAll}>
                  <Translate id="apps.sessionBuilder.session.clear">Clear</Translate>
                </button>
              )}
            </div>

            {picks.length === 0 && (
              <p className={styles.emptyState}>
                <Translate id="apps.sessionBuilder.session.empty">
                  No exercises yet. Pick a group, a category, and tap exercises to add them.
                </Translate>
              </p>
            )}

            {warnings.length > 0 && (
              <div className={styles.warningBox}>
                <strong>
                  <Translate id="apps.sessionBuilder.session.headsUp">Heads up:</Translate>
                </strong>
                <ul>
                  {warnings.map((w, i) => <li key={i}>{renderWarning(w)}</li>)}
                </ul>
              </div>
            )}

            {picks.length > 0 && (
              <div className={styles.summary}>
                <Translate
                  id="apps.sessionBuilder.session.summary"
                  values={{
                    n: <strong key="n">{picks.length}</strong>,
                    sets: <strong key="s">{picks.reduce((s, p) => s + (parseInt(p.exercise.sets) || 0), 0)}</strong>,
                  }}
                >{'{n} exercises · estimated {sets} working sets'}</Translate>
                {totalKcal > 0 && (
                  <> · <strong>≈ {Math.round(totalKcal)} kcal</strong></>
                )}
              </div>
            )}

            {picks.length > 0 && (
              <div className={styles.mapWrap}>
                <MuscleMap
                  activation={mergeActivations(
                    picks.map((p) =>
                      activationFor(p.exercise.primary, p.exercise.secondary, p.exercise.primarySub, p.exercise.secondarySub)
                    )
                  )}
                />
              </div>
            )}

            {picks.map((p, idx) => (
              <div key={p.id} className={styles.pickCard}>
                <div className={styles.pickHeader}>
                  <span className={styles.pickBadge} style={{background: CATEGORY_COLORS[p.category]}}>
                    {t.tCategory(p.category)}
                  </span>
                  <span className={styles.pickGroup}>{t.tGroup(p.group)}</span>
                  <div className={styles.pickControls}>
                    <button
                      className={styles.moveBtn}
                      onClick={() => movePick(p.id, -1)}
                      disabled={idx === 0}
                      title={translate({id: 'apps.sessionBuilder.pick.moveUp', message: 'Move up'})}
                    >▲</button>
                    <button
                      className={styles.moveBtn}
                      onClick={() => movePick(p.id, 1)}
                      disabled={idx === picks.length - 1}
                      title={translate({id: 'apps.sessionBuilder.pick.moveDown', message: 'Move down'})}
                    >▼</button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removePick(p.id)}
                      title={translate({id: 'apps.sessionBuilder.pick.remove', message: 'Remove'})}
                    >×</button>
                  </div>
                </div>
                <div className={styles.pickBody}>
                  <div className={styles.pickName}>{t.tName(p.exercise.name)}</div>
                  <div className={styles.pickMeta}>
                    <span className={styles.pickSetsReps}>{p.exercise.sets} × {p.exercise.reps}</span>
                    {p.exercise.biseriePair && (
                      <span className={styles.pickBiserie}>
                        <Translate
                          id="apps.sessionBuilder.pick.biserie"
                          values={{partner: t.tName(p.exercise.biseriePair)}}
                        >{'+ {partner} (biserie)'}</Translate>
                      </span>
                    )}
                    {bodyKg > 0 && <KcalBadge kcal={estimateCalories(p.exercise, bodyKg)} />}
                  </div>
                  {p.exercise.notes && <div className={styles.pickNotes}>{t.tNotes(p.exercise.name, p.exercise.notes)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
