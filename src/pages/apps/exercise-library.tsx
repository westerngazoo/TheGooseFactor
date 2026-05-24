import {useState, useMemo, type ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Translate, {translate} from '@docusaurus/Translate';
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
  CATEGORIES,
  CATEGORY_COLORS,
  ALL_EXERCISES,
  exerciseVideoUrl,
} from '../../data/routineData';
import {useT} from '../../data/routineData.translations';
import MuscleMap, {activationFor} from '../../components/MuscleMap';

/* ══════════════════════════════════════════
   EXERCISE LIBRARY
   Browseable, filterable catalog of every
   exercise in the database. Multi-axis
   filters + live anatomy preview. i18n via
   <Translate> + useT() for data labels.
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
  const t = useT();
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
    // Search matches the English source name AND the translated display name.
    return ALL_EXERCISES.filter((ex) => {
      if (q) {
        const enMatch = ex.name.toLowerCase().includes(q);
        const localizedMatch = t.tName(ex.name).toLowerCase().includes(q);
        if (!enMatch && !localizedMatch) return false;
      }
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
  }, [search, groups, cats, phases, equip, compoundOnly, t]);

  const clearAll = () => {
    setSearch(''); setGroups(new Set()); setCats(new Set());
    setPhases(new Set()); setEquip(new Set()); setCompoundOnly(false);
  };

  type ActiveFilter = {key: string; label: string; remove: () => void};
  const activeFilters: ActiveFilter[] = [
    ...(search.trim()
      ? [{key: 'search', label: `“${search.trim()}”`, remove: () => setSearch('')}]
      : []),
    ...[...groups].map((g) => ({
      key: `g-${g}`, label: t.tGroup(g),
      remove: () => setGroups((s) => toggleSet(s, g)),
    })),
    ...[...cats].map((c) => ({
      key: `c-${c}`, label: t.tCategory(c),
      remove: () => setCats((s) => toggleSet(s, c)),
    })),
    ...[...phases].map((p) => ({
      key: `p-${p}`, label: t.tPhase(p),
      remove: () => setPhases((s) => toggleSet(s, p)),
    })),
    ...[...equip].map((e) => ({
      key: `e-${e}`, label: t.tEquipment(e),
      remove: () => setEquip((s) => toggleSet(s, e)),
    })),
    ...(compoundOnly
      ? [{key: 'compound',
          label: translate({id: 'apps.exerciseLibrary.compoundOnlyPill', message: 'Compound only ◆'}),
          remove: () => setCompoundOnly(false)}]
      : []),
  ];

  return (
    <Layout
      title={translate({id: 'apps.exerciseLibrary.title', message: 'Exercise Library'})}
      description={translate({
        id: 'apps.exerciseLibrary.description',
        message: 'Every exercise in the Goose Factor database — search, filter, preview anatomy, link to YouTube tutorial.',
      })}
    >
      <div className={styles.page}>
        <header className={styles.header}>
          <Heading as="h1" className={styles.title}>
            <Translate id="apps.exerciseLibrary.title">Exercise Library</Translate>
          </Heading>
          <p className={styles.subtitle}>
            <Translate
              id="apps.exerciseLibrary.subtitle"
              values={{count: ALL_EXERCISES.length}}
            >
              {'{count} exercises — powerlifting, Olympic, strongman, calisthenics, mobility, plyometrics, KOT, McGill core, and more.'}
            </Translate>
          </p>
          <div style={{
            marginTop: '0.8rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(243, 156, 18, 0.08)',
            border: '1px solid rgba(243, 156, 18, 0.3)',
            maxWidth: '600px',
            margin: '0.8rem auto 0',
          }}>
            <BrowserOnly>
              {() => <BodyWeightInput onChange={setBodyKg} />}
            </BrowserOnly>
            <div style={{fontSize: '0.8rem', opacity: 0.75, textAlign: 'center'}}>
              {bodyKg > 0
                ? <Translate
                    id="apps.exerciseLibrary.calories.showing"
                    values={{kg: bodyKg}}
                  >{'🔥 Showing estimated calories burned per exercise based on your weight ({kg}kg).'}</Translate>
                : <Translate id="apps.exerciseLibrary.calories.enterWeight">
                    🔥 Enter your body weight above to see estimated calories burned per exercise.
                  </Translate>}
            </div>
          </div>
        </header>

        <div className={styles.layout}>
          {/* ─── FILTER PANEL ─── */}
          <aside className={styles.filterPanel}>
            <div className={styles.filterHead}>
              <strong><Translate id="apps.exerciseLibrary.filters.title">Filters</Translate></strong>
              <button className={styles.clearBtn} onClick={clearAll}>
                <Translate id="apps.exerciseLibrary.filters.clear">Clear</Translate>
              </button>
            </div>

            <input
              type="text"
              className={styles.searchInput}
              placeholder={translate({id: 'apps.exerciseLibrary.filters.searchPlaceholder', message: 'Search by name…'})}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <Translate id="apps.exerciseLibrary.filters.muscleGroup">Muscle group</Translate>
              </label>
              <div className={styles.chipRow}>
                {MUSCLE_GROUPS.map((g) => (
                  <button
                    key={g}
                    className={`${styles.chip} ${groups.has(g) ? styles.chipActive : ''}`}
                    onClick={() => setGroups((s) => toggleSet(s, g))}
                  >
                    {t.tGroup(g)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <Translate id="apps.exerciseLibrary.filters.category">Category</Translate>
              </label>
              <div className={styles.chipRow}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    className={`${styles.chip} ${cats.has(c) ? styles.chipActive : ''}`}
                    style={cats.has(c) ? {background: CATEGORY_COLORS[c], borderColor: CATEGORY_COLORS[c], color: '#fff'} : {}}
                    onClick={() => setCats((s) => toggleSet(s, c))}
                  >
                    {t.tCategory(c)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <Translate id="apps.exerciseLibrary.filters.phase">Phase</Translate>
              </label>
              <div className={styles.chipRow}>
                {PHASES.map((p) => (
                  <button
                    key={p}
                    className={`${styles.chip} ${phases.has(p) ? styles.chipActive : ''}`}
                    onClick={() => setPhases((s) => toggleSet(s, p))}
                  >
                    {t.tPhase(p)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <Translate id="apps.exerciseLibrary.filters.equipment">Equipment</Translate>
              </label>
              <div className={styles.chipRow}>
                {EQUIPMENT.map((e) => (
                  <button
                    key={e}
                    className={`${styles.chip} ${equip.has(e) ? styles.chipActive : ''}`}
                    onClick={() => setEquip((s) => toggleSet(s, e))}
                  >
                    {t.tEquipment(e)}
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
              <span>
                <Translate id="apps.exerciseLibrary.filters.compoundOnly">Compound lifts only (◆)</Translate>
              </span>
            </label>

            {selected && (
              <div className={styles.previewWrap}>
                <div className={styles.previewTitle}>
                  <span>{selected.compound ? '◆ ' : ''}{t.tName(selected.name)}</span>
                  <button className={styles.previewClose} onClick={() => setSelected(null)}>×</button>
                </div>
                <MuscleMap activation={activationFor(selected.primary, selected.secondary, selected.primarySub, selected.secondarySub)} />
                <a
                  className={styles.previewLink}
                  href={exerciseVideoUrl(selected.name)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Translate id="apps.exerciseLibrary.preview.watchTutorial">▶ Watch tutorial on YouTube</Translate>
                </a>
              </div>
            )}
          </aside>

          {/* ─── RESULTS ─── */}
          <section className={styles.resultsCol}>
            <div className={styles.resultsHead}>
              <span>
                <Translate
                  id="apps.exerciseLibrary.results.count"
                  values={{
                    filtered: <strong key="f">{filtered.length}</strong>,
                    total: ALL_EXERCISES.length,
                  }}
                >
                  {'{filtered} of {total} exercises'}
                </Translate>
              </span>
            </div>

            {activeFilters.length > 0 && (
              <div className={styles.activeFilters}>
                <span className={styles.activeFiltersLabel}>
                  <Translate id="apps.exerciseLibrary.results.filteringBy">Filtering by</Translate>
                </span>
                {activeFilters.map((f) => (
                  <button
                    key={f.key}
                    className={styles.activeFilter}
                    onClick={f.remove}
                    title={translate({id: 'apps.exerciseLibrary.results.removeFilter', message: 'Remove this filter'})}
                  >
                    {f.label}
                    <span className={styles.activeFilterX}>×</span>
                  </button>
                ))}
                <button className={styles.activeClearAll} onClick={clearAll}>
                  <Translate id="apps.exerciseLibrary.results.clearAll">Clear all</Translate>
                </button>
              </div>
            )}

            {filtered.length === 0 && (
              <div className={styles.empty}>
                <Translate id="apps.exerciseLibrary.results.empty">
                  No exercises match these filters. Try removing some.
                </Translate>
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
                      {t.tName(ex.name)}
                    </h3>
                    <span className={styles.cardMeta}>{ex.sets} × {ex.reps}</span>
                  </header>

                  <div className={styles.cardTagRow}>
                    <span
                      className={styles.cardCat}
                      style={{background: CATEGORY_COLORS[ex.category], color: '#fff'}}
                    >
                      {t.tCategory(ex.category)}
                    </span>
                    {ex.phases?.map((p) => (
                      <span key={p} className={styles.cardPhase}>{t.tPhase(p)}</span>
                    ))}
                    {ex.equipment?.map((eq) => (
                      <span key={eq} className={styles.cardEquip}>{t.tEquipment(eq)}</span>
                    ))}
                    {bodyKg > 0 && (
                      <KcalBadge kcal={estimateCalories(ex, bodyKg)} />
                    )}
                  </div>

                  <div className={styles.cardMuscles}>
                    {ex.primary.map((g) => (
                      <span key={`p-${g}`} className={styles.musclePrimary}>{t.tGroup(g)}</span>
                    ))}
                    {(ex.secondary ?? []).map((g) => (
                      <span key={`s-${g}`} className={styles.muscleSecondary}>{t.tGroup(g)}</span>
                    ))}
                  </div>

                  {ex.notes && <div className={styles.cardNotes}>{t.tNotes(ex.name, ex.notes)}</div>}

                  <footer className={styles.cardFoot}>
                    <a
                      href={exerciseVideoUrl(ex.name)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={styles.videoLink}
                    >
                      <Translate id="apps.exerciseLibrary.card.youtube">▶ YouTube</Translate>
                    </a>
                    <button
                      className={styles.previewBtn}
                      onClick={(e) => { e.stopPropagation(); setSelected(ex); }}
                    >
                      <Translate id="apps.exerciseLibrary.card.showAnatomy">Show anatomy</Translate>
                    </button>
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
