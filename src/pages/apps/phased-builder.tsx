import {useState, useMemo, useCallback, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './phased-builder.module.css';
import {
  type Exercise,
  type MuscleGroup,
  type Phase,
  PHASE_LABELS,
  PHASE_DESCRIPTIONS,
  GROUP_LABELS,
  ALL_EXERCISES,
  exercisesForPhase,
} from '../../data/routineData';
import MuscleMap, {
  activationFor,
  mergeActivations,
} from '../../components/MuscleMap';

/* ══════════════════════════════════════════
   PHASED SESSION BUILDER
   Funnel: warmup → multijoint → heavy → medium → pump.
   Each phase narrows what's offered next based on the
   muscle pattern of the previous pick.
   ══════════════════════════════════════════ */

type Pick = {id: number; phase: Phase; ex: Exercise};

const PHASES: Phase[] = ['warmup', 'multijoint', 'heavy', 'medium', 'pump'];

/** Filter Phase 3+ exercises so they overlap with the multijoint pick's primary muscles. */
function filterByPattern(exs: Exercise[], pattern: MuscleGroup[]): Exercise[] {
  if (pattern.length === 0) return exs;
  return exs.filter((e) =>
    (e.primary ?? []).some((g) => pattern.includes(g)) ||
    (e.secondary ?? []).some((g) => pattern.includes(g))
  );
}

function ExerciseCard({ex, onAdd, added}: {ex: Exercise; onAdd: () => void; added: boolean}): ReactNode {
  return (
    <button className={`${styles.card} ${added ? styles.cardPicked : ''}`} onClick={onAdd} disabled={added}>
      <div className={styles.cardTop}>
        <strong>{ex.compound ? '◆ ' : ''}{ex.name}</strong>
        <span className={styles.cardMeta}>{ex.sets} × {ex.reps}</span>
      </div>
      {(ex.primary || ex.secondary) && (
        <div className={styles.cardMuscles}>
          {(ex.primary ?? []).map((g) => (
            <span key={`p-${g}`} className={styles.musclePrimary}>{GROUP_LABELS[g]}</span>
          ))}
          {(ex.secondary ?? []).map((g) => (
            <span key={`s-${g}`} className={styles.muscleSecondary}>{GROUP_LABELS[g]}</span>
          ))}
        </div>
      )}
      {ex.notes && <div className={styles.cardNotes}>{ex.notes}</div>}
      <span className={styles.cardAction}>{added ? '✓ added' : '+ add'}</span>
    </button>
  );
}

export default function PhasedBuilder(): ReactNode {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [nextId, setNextId] = useState(1);
  const [equipFilter, setEquipFilter] = useState<string>('all');
  const [textFilter, setTextFilter] = useState<string>('');

  const addPick = useCallback((phase: Phase, ex: Exercise) => {
    setPicks((prev) => [...prev, {id: nextId, phase, ex}]);
    setNextId((n) => n + 1);
  }, [nextId]);

  const removePick = useCallback((id: number) => {
    setPicks((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearAll = useCallback(() => { setPicks([]); setNextId(1); }, []);

  // Multijoint pick determines the muscle "pattern" that filters Phase 3 onwards
  const mjPick = picks.find((p) => p.phase === 'multijoint');
  const pattern = mjPick?.ex.primary ?? [];

  // Per-phase filtering
  const exercisesByPhase: Record<Phase, Exercise[]> = useMemo(() => {
    const out = {} as Record<Phase, Exercise[]>;
    for (const ph of PHASES) {
      let list = exercisesForPhase(ph);
      if (ph !== 'warmup' && ph !== 'multijoint' && pattern.length > 0) {
        list = filterByPattern(list, pattern);
      }
      if (textFilter.trim()) {
        const q = textFilter.trim().toLowerCase();
        list = list.filter((e) => e.name.toLowerCase().includes(q));
      }
      if (equipFilter !== 'all') {
        list = list.filter((e) => e.equipment?.includes(equipFilter as any) || ph === 'medium' || ph === 'pump');
      }
      out[ph] = list;
    }
    return out;
  }, [pattern, equipFilter, textFilter]);

  const pickedNamesByPhase = useMemo(() => {
    const out = {} as Record<Phase, Set<string>>;
    for (const ph of PHASES) out[ph] = new Set();
    picks.forEach((p) => out[p.phase].add(p.ex.name));
    return out;
  }, [picks]);

  // Phase 2 is single-pick; once picked, lock alternatives
  const mjLocked = !!mjPick;

  // Aggregate activation map across all picks
  const aggActivation = useMemo(() => {
    return mergeActivations(
      picks.map((p) =>
        activationFor(p.ex.primary, p.ex.secondary, p.ex.primarySub, p.ex.secondarySub)
      )
    );
  }, [picks]);

  return (
    <Layout title="Phased Builder" description="Build your session phase by phase: warmup, multi-joint compound, heavy, medium, pump.">
      <div className={styles.page}>
        <header className={styles.header}>
          <Heading as="h1" className={styles.title}>Phased Builder</Heading>
          <p className={styles.subtitle}>
            Build today on the fly. Each phase narrows the next based on the movement pattern you pick.
          </p>
        </header>

        {/* Filters */}
        <div className={styles.filterBar}>
          <input
            type="text"
            placeholder="Search exercises…"
            value={textFilter}
            onChange={(e) => setTextFilter(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={equipFilter}
            onChange={(e) => setEquipFilter(e.target.value)}
            className={styles.equipSelect}
          >
            <option value="all">All equipment</option>
            <option value="bodyweight">Bodyweight only</option>
            <option value="dumbbell">Dumbbell</option>
            <option value="kettlebell">Kettlebell</option>
            <option value="barbell">Barbell</option>
            <option value="cable">Cable</option>
            <option value="machine">Machine</option>
            <option value="band">Band</option>
          </select>
        </div>

        <div className={styles.layout}>
          {/* ─── PHASE COLUMNS ─── */}
          <div className={styles.phasesCol}>
            {PHASES.map((ph, i) => {
              const list = exercisesByPhase[ph];
              const lockedSection = ph !== 'warmup' && ph !== 'multijoint' && !mjLocked && pattern.length === 0;
              return (
                <section key={ph} className={`${styles.phaseSection} ${styles[`phase_${ph}`]}`}>
                  <div className={styles.phaseHeader}>
                    <span className={styles.phaseNum}>{i + 1}</span>
                    <div>
                      <h2 className={styles.phaseTitle}>{PHASE_LABELS[ph]}</h2>
                      <p className={styles.phaseDesc}>{PHASE_DESCRIPTIONS[ph]}</p>
                    </div>
                    {ph !== 'warmup' && ph !== 'multijoint' && pattern.length > 0 && (
                      <span className={styles.filterTag}>
                        filtered to: {pattern.map((g) => GROUP_LABELS[g]).join(' / ')}
                      </span>
                    )}
                  </div>

                  {lockedSection && (
                    <p className={styles.lockedHint}>
                      Pick a <strong>multi-joint complete</strong> exercise above to unlock.
                    </p>
                  )}

                  {!lockedSection && list.length === 0 && (
                    <p className={styles.emptyPhase}>No exercises match the current filters.</p>
                  )}

                  {!lockedSection && (
                    <div className={styles.cardGrid}>
                      {list.map((ex) => (
                        <ExerciseCard
                          key={`${ph}-${ex.name}`}
                          ex={ex}
                          added={pickedNamesByPhase[ph].has(ex.name)}
                          onAdd={() => addPick(ph, ex)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* ─── SESSION SIDEBAR ─── */}
          <aside className={styles.sessionPanel}>
            <div className={styles.sessionHead}>
              <Heading as="h3" className={styles.sessionTitle}>Today's Session</Heading>
              {picks.length > 0 && <button className={styles.clearBtn} onClick={clearAll}>Clear</button>}
            </div>

            {picks.length === 0 && (
              <p className={styles.emptySession}>Empty — start with the warm-up.</p>
            )}

            {picks.length > 0 && (
              <>
                <div className={styles.totals}>
                  <strong>{picks.length}</strong> exercises ·{' '}
                  <strong>{picks.reduce((s, p) => s + (parseInt(p.ex.sets) || 0), 0)}</strong> total sets
                </div>

                <MuscleMap activation={aggActivation} />

                {PHASES.filter((ph) => picks.some((p) => p.phase === ph)).map((ph) => (
                  <div key={ph} className={styles.sessionPhase}>
                    <div className={styles.sessionPhaseTitle}>{PHASE_LABELS[ph]}</div>
                    {picks.filter((p) => p.phase === ph).map((p) => (
                      <div key={p.id} className={styles.sessionItem}>
                        <span className={styles.itemName}>{p.ex.name}</span>
                        <span className={styles.itemMeta}>{p.ex.sets} × {p.ex.reps}</span>
                        <button className={styles.removeBtn} onClick={() => removePick(p.id)}>×</button>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </aside>
        </div>
      </div>
    </Layout>
  );
}
