import {useState, useMemo, type ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import BodyWeightInput, {KcalBadge} from '../../components/BodyWeightInput';
import {estimateCalories} from '../../lib/calories';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './exercise-library.module.css';
import {
  type LibraryExercise,
  type MuscleGroup,
  type ExerciseCategory,
  type Phase,
  MUSCLE_GROUPS,
  GROUP_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  PHASE_LABELS,
  ALL_EXERCISES,
  exerciseVideoUrl,
} from '../../data/routineData';
import MuscleMap, {activationFor} from '../../components/MuscleMap';

/* ══════════════════════════════════════════
   EXERCISE LIBRARY
   Browseable, filterable catalog of every
   exercise in the database. Multi-axis
   filters + live anatomy preview.
   ══════════════════════════════════════════ */

const EQUIPMENT: ('barbell' | 'dumbbell' | 'kettlebell' | 'cable' | 'machine' | 'bodyweight' | 'band' | 'box')[] = [
  'barbell', 'dumbbell', 'kettlebell', 'cable', 'machine', 'bodyweight', 'band', 'box',
];

const PHASES: Phase[] = ['warmup', 'multijoint', 'heavy', 'medium', 'pump'];

function toggleSet<T>(set: Set<T>, val: T): Set<T> {
  const next = new Set(set);
  if (next.has(val)) next.delete(val); else next.add(val);
  return next;
}

export default function ExerciseLibrary(): ReactNode {
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState<Set<MuscleGroup>>(new Set());
  const [cats, setCats] = useState<Set<ExerciseCategory>>(new Set());
  const [phases, setPhases] = useState<Set<Phase>>(new Set());
  const [equip, setEquip] = useState<Set<string>>(new Set());
  const [compoundOnly, setCompoundOnly] = useState(false);
  const [selected, setSelected] = useState<LibraryExercise | null>(null);
  const [bodyKg, setBodyKg] = useState<number>(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_EXERCISES.filter((ex) => {
      if (q && !ex.name.toLowerCase().includes(q)) return false;
      if (compoundOnly && !ex.compound) return false;
      if (cats.size > 0 && !cats.has(ex.category)) return false;
      if (groups.size > 0) {
        const hasGroup =
          ex.primary.some((g) => groups.has(g)) ||
          (ex.secondary?.some((g) => groups.has(g)) ?? false);
        if (!hasGroup) return false;
      }
      if (phases.size > 0) {
        if (!ex.phases?.some((p) => phases.has(p))) return false;
      }
      if (equip.size > 0) {
        if (!ex.equipment?.some((e) => equip.has(e))) return false;
      }
      return true;
    });
  }, [search, groups, cats, phases, equip, compoundOnly]);

  const clearAll = () => {
    setSearch(''); setGroups(new Set()); setCats(new Set());
    setPhases(new Set()); setEquip(new Set()); setCompoundOnly(false);
  };

  return (
    <Layout title="Exercise Library" description="Every exercise in the Goose Factor database — search, filter, preview anatomy, link to YouTube tutorial.">
      <div className={styles.page}>
        <header className={styles.header}>
          <Heading as="h1" className={styles.title}>Exercise Library</Heading>
          <p className={styles.subtitle}>
            {ALL_EXERCISES.length} exercises — powerlifting, Olympic, strongman, calisthenics, mobility, plyometrics, KOT, McGill core, and more.
          </p>
          <div style={{marginTop: '0.6rem', display: 'flex', justifyContent: 'center'}}>
            <BrowserOnly>
              {() => <BodyWeightInput onChange={setBodyKg} />}
            </BrowserOnly>
          </div>
        </header>

        <div className={styles.layout}>
          {/* ─── FILTER PANEL ─── */}
          <aside className={styles.filterPanel}>
            <div className={styles.filterHead}>
              <strong>Filters</strong>
              <button className={styles.clearBtn} onClick={clearAll}>Clear</button>
            </div>

            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Muscle group</label>
              <div className={styles.chipRow}>
                {MUSCLE_GROUPS.map((g) => (
                  <button
                    key={g}
                    className={`${styles.chip} ${groups.has(g) ? styles.chipActive : ''}`}
                    onClick={() => setGroups((s) => toggleSet(s, g))}
                  >
                    {GROUP_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Category</label>
              <div className={styles.chipRow}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    className={`${styles.chip} ${cats.has(c) ? styles.chipActive : ''}`}
                    style={cats.has(c) ? {background: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c], color: '#fff'} : {}}
                    onClick={() => setCats((s) => toggleSet(s, c))}
                  >
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Phase</label>
              <div className={styles.chipRow}>
                {PHASES.map((p) => (
                  <button
                    key={p}
                    className={`${styles.chip} ${phases.has(p) ? styles.chipActive : ''}`}
                    onClick={() => setPhases((s) => toggleSet(s, p))}
                  >
                    {PHASE_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Equipment</label>
              <div className={styles.chipRow}>
                {EQUIPMENT.map((e) => (
                  <button
                    key={e}
                    className={`${styles.chip} ${equip.has(e) ? styles.chipActive : ''}`}
                    onClick={() => setEquip((s) => toggleSet(s, e))}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={compoundOnly}
                onChange={(e) => setCompoundOnly(e.target.checked)}
              />
              <span>Compound lifts only (◆)</span>
            </label>

            {selected && (
              <div className={styles.previewWrap}>
                <div className={styles.previewTitle}>
                  <span>{selected.compound ? '◆ ' : ''}{selected.name}</span>
                  <button className={styles.previewClose} onClick={() => setSelected(null)}>×</button>
                </div>
                <MuscleMap activation={activationFor(selected.primary, selected.secondary, selected.primarySub, selected.secondarySub)} />
                <a
                  className={styles.previewLink}
                  href={exerciseVideoUrl(selected.name)}
                  target="_blank"
                  rel="noreferrer"
                >▶ Watch tutorial on YouTube</a>
              </div>
            )}
          </aside>

          {/* ─── RESULTS ─── */}
          <section className={styles.resultsCol}>
            <div className={styles.resultsHead}>
              <span><strong>{filtered.length}</strong> of {ALL_EXERCISES.length} exercises</span>
              {(search.trim() || groups.size + cats.size + phases.size + equip.size > 0 || compoundOnly) && (
                <span className={styles.resultsHint}>Showing filtered results — click "Clear" to reset.</span>
              )}
            </div>

            {filtered.length === 0 && (
              <div className={styles.empty}>
                No exercises match these filters. Try removing some.
              </div>
            )}

            <div className={styles.cardGrid}>
              {filtered.map((ex) => (
                <article
                  key={ex.name}
                  className={`${styles.card} ${selected?.name === ex.name ? styles.cardSelected : ''}`}
                  onClick={() => setSelected(ex)}
                >
                  <header className={styles.cardHead}>
                    <h3 className={styles.cardName}>
                      {ex.compound && <span className={styles.compoundDot}>◆</span>}
                      {ex.name}
                    </h3>
                    <span className={styles.cardMeta}>{ex.sets} × {ex.reps}</span>
                  </header>

                  <div className={styles.cardTagRow}>
                    <span
                      className={styles.cardCat}
                      style={{background: CATEGORY_COLORS[ex.category], color: '#fff'}}
                    >
                      {CATEGORY_LABELS[ex.category]}
                    </span>
                    {ex.phases?.map((p) => (
                      <span key={p} className={styles.cardPhase}>{PHASE_LABELS[p]}</span>
                    ))}
                    {ex.equipment?.map((eq) => (
                      <span key={eq} className={styles.cardEquip}>{eq}</span>
                    ))}
                    {bodyKg > 0 && (
                      <KcalBadge kcal={estimateCalories(ex, bodyKg)} />
                    )}
                  </div>

                  <div className={styles.cardMuscles}>
                    {ex.primary.map((g) => (
                      <span key={`p-${g}`} className={styles.musclePrimary}>{GROUP_LABELS[g]}</span>
                    ))}
                    {(ex.secondary ?? []).map((g) => (
                      <span key={`s-${g}`} className={styles.muscleSecondary}>{GROUP_LABELS[g]}</span>
                    ))}
                  </div>

                  {ex.notes && <div className={styles.cardNotes}>{ex.notes}</div>}

                  <footer className={styles.cardFoot}>
                    <a
                      href={exerciseVideoUrl(ex.name)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={styles.videoLink}
                    >▶ YouTube</a>
                    <button
                      className={styles.previewBtn}
                      onClick={(e) => { e.stopPropagation(); setSelected(ex); }}
                    >Show anatomy</button>
                  </footer>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
