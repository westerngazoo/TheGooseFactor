import {useState, useEffect, useMemo, useCallback, type ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './progress-tracker.module.css';
import {
  getSupabase,
  type SessionType,
  type WorkoutSession,
  type WorkoutEntry,
  type DietEntry,
  type BodyMetric,
} from '../../lib/supabase';

const SESSION_TYPES: SessionType[] = ['strength', 'hypertrophy', 'metabolic', 'pump', 'mixed', 'deload'];
const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  strength: 'Strength (5×5)',
  hypertrophy: 'Hypertrophy',
  metabolic: 'Metabolic',
  pump: 'Pump / LOW',
  mixed: 'Mixed (DUP)',
  deload: 'Deload',
};

const INTENSITIES = ['high', 'medium', 'low'] as const;
type IntensityTag = typeof INTENSITIES[number];
import {
  type MuscleGroup,
  type ExerciseCategory,
  MUSCLE_GROUPS,
  GROUP_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  exercisesFor,
  ALL_EXERCISES,
} from '../../data/routineData';
import MuscleMap, {
  activationFor,
  mergeActivations,
} from '../../components/MuscleMap';

/* ══════════════════════════════════════════
   PROGRESS TRACKER
   Google-auth'd daily log for
   workouts + diet + body metrics.
   Backed by Supabase + Postgres RLS.
   ══════════════════════════════════════════ */

type Tab = 'workout' | 'diet' | 'body' | 'history';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function ProgressTrackerApp(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const fields = siteConfig.customFields as Record<string, string>;
  const supabase = useMemo(
    () => getSupabase(fields.supabaseUrl, fields.supabaseAnonKey),
    [fields.supabaseUrl, fields.supabaseAnonKey],
  );

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('workout');

  // Data
  const [todaySession, setTodaySession] = useState<WorkoutSession | null>(null);
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([]);
  const [history, setHistory] = useState<WorkoutSession[]>([]);

  /* ─── Auth bootstrap ─── */
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({data}) => {
      setSession(data.session);
      setLoading(false);
    });
    const {data: sub} = supabase.auth.onAuthStateChange((_ev, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const userId = session?.user?.id as string | undefined;

  /* ─── Load today's data when signed in ─── */
  const reload = useCallback(async () => {
    if (!supabase || !userId) return;
    const today = todayIso();

    // Find or create today's workout session lazily (create only on first exercise insert)
    const {data: sessRows} = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_date', today)
      .order('created_at', {ascending: false})
      .limit(1);
    const sess = sessRows?.[0] as WorkoutSession | undefined;
    setTodaySession(sess ?? null);

    if (sess) {
      const {data: entries} = await supabase
        .from('workout_entries')
        .select('*')
        .eq('session_id', sess.id)
        .order('created_at', {ascending: true});
      setWorkoutEntries((entries as WorkoutEntry[]) ?? []);
    } else {
      setWorkoutEntries([]);
    }

    const {data: diet} = await supabase
      .from('diet_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', today)
      .order('created_at', {ascending: true});
    setDietEntries((diet as DietEntry[]) ?? []);

    const {data: body} = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('measured_on', {ascending: false})
      .limit(30);
    setBodyMetrics((body as BodyMetric[]) ?? []);

    const {data: hist} = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', {ascending: false})
      .limit(30);
    setHistory((hist as WorkoutSession[]) ?? []);
  }, [supabase, userId]);

  useEffect(() => { reload(); }, [reload]);

  /* ─── Auth handlers ─── */
  const signIn = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {redirectTo: window.location.href},
    });
  };
  const signOut = async () => { if (supabase) await supabase.auth.signOut(); };

  /* ─── Workout logging ─── */
  const ensureSession = async (): Promise<WorkoutSession | null> => {
    if (!supabase || !userId) return null;
    if (todaySession) return todaySession;
    const {data, error} = await supabase
      .from('workout_sessions')
      .insert({user_id: userId, session_date: todayIso()})
      .select()
      .single();
    if (error) { alert(error.message); return null; }
    setTodaySession(data as WorkoutSession);
    return data as WorkoutSession;
  };

  /* ── Not configured ── */
  if (!supabase) {
    return <NotConfigured />;
  }

  if (loading) return <div className={styles.centered}>Loading…</div>;

  if (!session) {
    return (
      <div className={styles.centered}>
        <Heading as="h2">Sign in to start logging</Heading>
        <p className={styles.signInSub}>
          Your data lives in your own row in the Goose Factor database and only you can see it.
        </p>
        <button className={styles.googleBtn} onClick={signIn}>
          <GoogleIcon /> Continue with Google
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerBar}>
        <div className={styles.userInfo}>
          <span className={styles.hi}>Logged in as</span>
          <strong>{session.user.email}</strong>
        </div>
        <button className={styles.signOutBtn} onClick={signOut}>Sign out</button>
      </div>

      {/* Tabs */}
      <div className={styles.tabRow}>
        {(['workout', 'diet', 'body', 'history'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'workout' ? "Today's Workout" :
             t === 'diet' ? "Today's Diet" :
             t === 'body' ? "Body Metrics" :
             "History"}
          </button>
        ))}
      </div>

      {tab === 'workout' && (
        <WorkoutTab
          supabase={supabase}
          userId={userId!}
          todaySession={todaySession}
          entries={workoutEntries}
          ensureSession={ensureSession}
          reload={reload}
        />
      )}
      {tab === 'diet' && (
        <DietTab
          supabase={supabase}
          userId={userId!}
          entries={dietEntries}
          reload={reload}
        />
      )}
      {tab === 'body' && (
        <BodyTab
          supabase={supabase}
          userId={userId!}
          metrics={bodyMetrics}
          reload={reload}
        />
      )}
      {tab === 'history' && (
        <HistoryTab history={history} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WORKOUT TAB
   ═══════════════════════════════════════════════════════════ */
function WorkoutTab({
  supabase, userId, todaySession, entries, ensureSession, reload,
}: {
  supabase: any;
  userId: string;
  todaySession: WorkoutSession | null;
  entries: WorkoutEntry[];
  ensureSession: () => Promise<WorkoutSession | null>;
  reload: () => Promise<void>;
}): ReactNode {
  const [group, setGroup] = useState<MuscleGroup>('chest');
  const [category, setCategory] = useState<ExerciseCategory>('strength');
  const [intensity, setIntensity] = useState<IntensityTag>('high');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const initialList = exercisesFor('chest', 'strength');
  const [exerciseName, setExerciseName] = useState<string>(initialList[0]?.name ?? '');
  const [sets, setSets] = useState('5');
  const [reps, setReps] = useState('5');
  const [weight, setWeight] = useState('');
  const [rpe, setRpe] = useState('');
  const [papPair, setPapPair] = useState('');
  const [notes, setNotes] = useState('');

  // "Last time" display: pull the most recent entry for this exercise (any session).
  const [lastEntry, setLastEntry] = useState<WorkoutEntry | null>(null);

  const available = useMemo(() => {
    // If search has text, search across the entire library; otherwise filter by group×category
    const q = exerciseSearch.trim().toLowerCase();
    if (q) return ALL_EXERCISES.filter((e) => e.name.toLowerCase().includes(q));
    return exercisesFor(group, category);
  }, [group, category, exerciseSearch]);
  const currentEx = available.find((e) => e.name === exerciseName) ??
                    ALL_EXERCISES.find((e) => e.name === exerciseName);
  useEffect(() => {
    const first = available[0];
    setExerciseName(first?.name ?? '');
    setSets(first?.sets ?? '');
    setReps(first?.reps ?? '');
    setPapPair(first?.biseriePair ?? '');
  }, [group, category]);

  // Default intensity from category selection
  useEffect(() => {
    if (category === 'strength') setIntensity('high');
    else if (category === 'hypertrophy' || category === 'metabolic') setIntensity('medium');
    else setIntensity('low');
  }, [category]);

  // Fetch last logged entry for the selected exercise
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!exerciseName) { setLastEntry(null); return; }
      const {data} = await supabase
        .from('workout_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .order('created_at', {ascending: false})
        .limit(1);
      if (!cancelled) setLastEntry((data?.[0] as WorkoutEntry) ?? null);
    })();
    return () => { cancelled = true; };
  }, [supabase, userId, exerciseName]);

  const addEntry = async () => {
    const sess = await ensureSession();
    if (!sess) return;
    const {error} = await supabase.from('workout_entries').insert({
      user_id: userId,
      session_id: sess.id,
      muscle_group: group,
      category,
      exercise_name: exerciseName,
      sets: parseInt(sets) || null,
      reps: reps || null,
      weight_kg: weight ? parseFloat(weight) : null,
      rpe: rpe ? parseFloat(rpe) : null,
      intensity,
      pap_pair: papPair || null,
      notes: notes || null,
    });
    if (error) { alert(error.message); return; }
    setWeight(''); setRpe(''); setNotes('');
    await reload();
  };

  // Quick-add the entire group×category bundle from the Goose library.
  // Every suggested exercise is pre-logged with its default sets/reps (no weight yet).
  const quickAddLibrary = async () => {
    const sess = await ensureSession();
    if (!sess) return;
    const rows = available.map((ex) => ({
      user_id: userId,
      session_id: sess.id,
      muscle_group: group,
      category,
      exercise_name: ex.name,
      sets: parseInt(ex.sets) || null,
      reps: ex.reps,
      intensity,
      pap_pair: ex.biseriePair ?? null,
      notes: ex.notes ?? null,
    }));
    const {error} = await supabase.from('workout_entries').insert(rows);
    if (error) { alert(error.message); return; }
    await reload();
  };

  const setSessionType = async (t: SessionType) => {
    const sess = await ensureSession();
    if (!sess) return;
    const {error} = await supabase
      .from('workout_sessions')
      .update({session_type: t})
      .eq('id', sess.id);
    if (error) { alert(error.message); return; }
    await reload();
  };

  const deleteEntry = async (id: string) => {
    await supabase.from('workout_entries').delete().eq('id', id);
    await reload();
  };

  // Goose Method live warnings for today's logged exercises
  const warnings: string[] = [];
  const groupsWithStrength = new Set(
    entries.filter((e) => e.category === 'strength' || e.intensity === 'high').map((e) => e.muscle_group)
  );
  if (groupsWithStrength.has('chest') && groupsWithStrength.size > 1) {
    warnings.push('Chest strength = SACRED. Other strength work not recommended today.');
  }
  const dlIdx = entries.findIndex((e) => e.muscle_group === 'back' && (e.category === 'strength' || e.intensity === 'high'));
  const sqIdx = entries.findIndex((e) => e.muscle_group === 'quad' && (e.category === 'strength' || e.intensity === 'high'));
  if (dlIdx >= 0 && sqIdx >= 0 && sqIdx < dlIdx) {
    warnings.push('Deadlift logged after Squat — Goose rule: heavy pull before heavy squat.');
  }
  if (groupsWithStrength.size > 1) {
    warnings.push(`${groupsWithStrength.size} strength focuses today. Goose rule: max 1 HIGH per session.`);
  }

  return (
    <div className={styles.card}>
      {/* Session type selector */}
      <div className={styles.sessionTypeRow}>
        <span className={styles.sessionTypeLabel}>Today's slot (DUP):</span>
        <div className={styles.sessionTypeChips}>
          {SESSION_TYPES.map((t) => (
            <button
              key={t}
              className={`${styles.typeChip} ${todaySession?.session_type === t ? styles.typeChipActive : ''}`}
              onClick={() => setSessionType(t)}
            >
              {SESSION_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <Heading as="h3">Log an exercise</Heading>
      <div className={styles.formGrid}>
        <label>
          <span>Muscle group</span>
          <select value={group} onChange={(e) => setGroup(e.target.value as MuscleGroup)}>
            {MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{GROUP_LABELS[g]}</option>)}
          </select>
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as ExerciseCategory)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </label>
        <label>
          <span>Intensity (Goose)</span>
          <select value={intensity} onChange={(e) => setIntensity(e.target.value as IntensityTag)}>
            {INTENSITIES.map((i) => <option key={i} value={i}>{i.toUpperCase()}</option>)}
          </select>
        </label>
        <label className={styles.colSpan2}>
          <span>Search any exercise (optional)</span>
          <input
            type="text"
            value={exerciseSearch}
            onChange={(e) => setExerciseSearch(e.target.value)}
            placeholder="Type to search the full library — clear to filter by group/category"
          />
        </label>
        <label className={styles.colSpan2}>
          <span>
            Exercise
            {exerciseSearch.trim() && ` (${available.length} matching "${exerciseSearch.trim()}")`}
          </span>
          <select value={exerciseName} onChange={(e) => setExerciseName(e.target.value)}>
            {available.length === 0 && <option value="">(no matches)</option>}
            {available.map((ex) => (
              <option key={ex.name} value={ex.name}>
                {ex.compound ? '◆ ' : ''}{ex.name}
              </option>
            ))}
          </select>
        </label>
        {currentEx && (
          <div className={`${styles.colSpan2} ${styles.activationRow}`}>
            {currentEx.primary.map((g) => (
              <span key={`p-${g}`} className={styles.musclePill}>{GROUP_LABELS[g]}</span>
            ))}
            {currentEx.secondary?.map((g) => (
              <span key={`s-${g}`} className={styles.musclePillSecondary}>{GROUP_LABELS[g]}</span>
            ))}
          </div>
        )}
        {lastEntry && (
          <div className={`${styles.colSpan2} ${styles.lastHint}`}>
            <strong>Last time</strong> ({lastEntry.created_at.slice(0, 10)}):
            {' '}{lastEntry.sets ?? '?'} × {lastEntry.reps ?? '?'}
            {lastEntry.weight_kg != null && ` @ ${lastEntry.weight_kg}kg`}
            {lastEntry.rpe != null && ` · RPE ${lastEntry.rpe}`}
            {lastEntry.notes && ` · ${lastEntry.notes}`}
          </div>
        )}
        <label>
          <span>Sets</span>
          <input type="number" min={1} max={20} value={sets} onChange={(e) => setSets(e.target.value)} />
        </label>
        <label>
          <span>Reps</span>
          <input type="text" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="e.g. 5 or 8-10" />
        </label>
        <label>
          <span>Weight (kg)</span>
          <input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="optional" />
        </label>
        <label>
          <span>RPE (1-10)</span>
          <input type="number" step="0.5" min="1" max="10" value={rpe} onChange={(e) => setRpe(e.target.value)} placeholder="optional" />
        </label>
        <label className={styles.colSpan2}>
          <span>Bisérie / PAP pair</span>
          <input type="text" value={papPair} onChange={(e) => setPapPair(e.target.value)} placeholder="optional partner exercise" />
        </label>
        <label className={styles.colSpan2}>
          <span>Notes</span>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" />
        </label>
      </div>
      <div className={styles.actionRow}>
        <button className={styles.primaryBtn} onClick={addEntry}>+ Log exercise</button>
        <button className={styles.secondaryBtn} onClick={quickAddLibrary} title="Add all suggested exercises for this group × category">
          + Quick-add full block ({available.length})
        </button>
      </div>

      {warnings.length > 0 && (
        <div className={styles.warningBox}>
          <strong>Goose Method:</strong>
          <ul>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </div>
      )}

      {/* Anatomy maps: current selected exercise + cumulative today */}
      <div className={styles.anatomyRow}>
        {currentEx && (
          <div className={styles.anatomyCard}>
            <div className={styles.anatomyTitle}>{currentEx.name}</div>
            <MuscleMap
              activation={activationFor(
                currentEx.primary,
                currentEx.secondary,
                currentEx.primarySub,
                currentEx.secondarySub,
              )}
            />
          </div>
        )}
        {entries.length > 0 && (
          <div className={styles.anatomyCard}>
            <div className={styles.anatomyTitle}>Today — cumulative ({entries.length})</div>
            <MuscleMap
              activation={mergeActivations(
                entries.map((e) => {
                  const meta = ALL_EXERCISES.find((x) => x.name === e.exercise_name);
                  if (!meta) return {group: {}, sub: {}};
                  return activationFor(meta.primary, meta.secondary, meta.primarySub, meta.secondarySub);
                })
              )}
            />
          </div>
        )}
      </div>

      <div className={styles.entryList}>
        <Heading as="h3" className={styles.listTitle}>Today — {entries.length} exercise{entries.length !== 1 ? 's' : ''}</Heading>
        {entries.length === 0 && <p className={styles.empty}>No exercises logged yet.</p>}
        {entries.map((e) => (
          <div key={e.id} className={styles.entryRow}>
            <span
              className={styles.badge}
              style={{background: CATEGORY_COLORS[e.category as ExerciseCategory] ?? '#888'}}
            >
              {(e.category || '').toUpperCase()}
            </span>
            <div className={styles.entryMain}>
              <div className={styles.entryName}>
                {e.exercise_name}
                {e.pap_pair && <span className={styles.paptag}> + {e.pap_pair}</span>}
              </div>
              <div className={styles.entryMeta}>
                {GROUP_LABELS[e.muscle_group as MuscleGroup] ?? e.muscle_group}
                {e.intensity && ` · ${e.intensity.toUpperCase()}`}
                {' · '}
                {e.sets ?? '?'} × {e.reps ?? '?'}
                {e.weight_kg != null && ` @ ${e.weight_kg}kg`}
                {e.rpe != null && ` · RPE ${e.rpe}`}
              </div>
              {e.notes && <div className={styles.entryNotes}>{e.notes}</div>}
            </div>
            <button className={styles.deleteBtn} onClick={() => deleteEntry(e.id)} title="Delete">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DIET TAB
   ═══════════════════════════════════════════════════════════ */
function DietTab({
  supabase, userId, entries, reload,
}: {
  supabase: any;
  userId: string;
  entries: DietEntry[];
  reload: () => Promise<void>;
}): ReactNode {
  const [foodName, setFoodName] = useState('');
  const [meal, setMeal] = useState('main');
  const [grams, setGrams] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const addEntry = async () => {
    if (!foodName.trim()) { alert('Food name required.'); return; }
    const {error} = await supabase.from('diet_entries').insert({
      user_id: userId,
      entry_date: todayIso(),
      meal: meal || null,
      food_name: foodName.trim(),
      grams: grams ? parseFloat(grams) : null,
      calories: calories ? parseFloat(calories) : null,
      protein_g: protein ? parseFloat(protein) : null,
      carbs_g: carbs ? parseFloat(carbs) : null,
      fat_g: fat ? parseFloat(fat) : null,
    });
    if (error) { alert(error.message); return; }
    setFoodName(''); setGrams(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
    await reload();
  };

  const deleteEntry = async (id: string) => {
    await supabase.from('diet_entries').delete().eq('id', id);
    await reload();
  };

  const totals = entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + (e.calories ?? 0),
      p: acc.p + (e.protein_g ?? 0),
      c: acc.c + (e.carbs_g ?? 0),
      f: acc.f + (e.fat_g ?? 0),
    }),
    {kcal: 0, p: 0, c: 0, f: 0},
  );

  return (
    <div className={styles.card}>
      <Heading as="h3">Log a food</Heading>
      <div className={styles.formGrid}>
        <label className={styles.colSpan2}>
          <span>Food</span>
          <input type="text" value={foodName} onChange={(e) => setFoodName(e.target.value)} placeholder="e.g. Chicken Breast" />
        </label>
        <label>
          <span>Meal</span>
          <select value={meal} onChange={(e) => setMeal(e.target.value)}>
            <option value="pre">Pre-workout</option>
            <option value="post">Post-workout</option>
            <option value="main">Main meal</option>
            <option value="night">Night</option>
            <option value="">(unspecified)</option>
          </select>
        </label>
        <label>
          <span>Grams</span>
          <input type="number" step="1" value={grams} onChange={(e) => setGrams(e.target.value)} />
        </label>
        <label>
          <span>Calories</span>
          <input type="number" step="1" value={calories} onChange={(e) => setCalories(e.target.value)} />
        </label>
        <label>
          <span>Protein (g)</span>
          <input type="number" step="0.1" value={protein} onChange={(e) => setProtein(e.target.value)} />
        </label>
        <label>
          <span>Carbs (g)</span>
          <input type="number" step="0.1" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
        </label>
        <label>
          <span>Fat (g)</span>
          <input type="number" step="0.1" value={fat} onChange={(e) => setFat(e.target.value)} />
        </label>
      </div>
      <button className={styles.primaryBtn} onClick={addEntry}>+ Log food</button>

      <div className={styles.totalsRow}>
        <span><strong>{Math.round(totals.kcal)}</strong> kcal</span>
        <span><strong>{totals.p.toFixed(1)}</strong>g P</span>
        <span><strong>{totals.c.toFixed(1)}</strong>g C</span>
        <span><strong>{totals.f.toFixed(1)}</strong>g F</span>
      </div>

      <div className={styles.entryList}>
        <Heading as="h3" className={styles.listTitle}>Today — {entries.length} item{entries.length !== 1 ? 's' : ''}</Heading>
        {entries.length === 0 && <p className={styles.empty}>Nothing logged yet.</p>}
        {entries.map((e) => (
          <div key={e.id} className={styles.entryRow}>
            <span className={styles.mealTag}>{(e.meal ?? '—').toUpperCase()}</span>
            <div className={styles.entryMain}>
              <div className={styles.entryName}>{e.food_name}</div>
              <div className={styles.entryMeta}>
                {e.grams != null && `${e.grams}g · `}
                {e.calories != null && `${e.calories} kcal · `}
                P {e.protein_g ?? 0}g / C {e.carbs_g ?? 0}g / F {e.fat_g ?? 0}g
              </div>
            </div>
            <button className={styles.deleteBtn} onClick={() => deleteEntry(e.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BODY METRICS TAB
   ═══════════════════════════════════════════════════════════ */
function BodyTab({
  supabase, userId, metrics, reload,
}: {
  supabase: any;
  userId: string;
  metrics: BodyMetric[];
  reload: () => Promise<void>;
}): ReactNode {
  const [date, setDate] = useState(todayIso());
  const [weight, setWeight] = useState('');
  const [bodyfat, setBodyfat] = useState('');
  const [notes, setNotes] = useState('');

  const addMetric = async () => {
    if (!weight && !bodyfat) { alert('Enter weight or bodyfat.'); return; }
    const {error} = await supabase.from('body_metrics').insert({
      user_id: userId,
      measured_on: date,
      weight_kg: weight ? parseFloat(weight) : null,
      bodyfat_pct: bodyfat ? parseFloat(bodyfat) : null,
      notes: notes || null,
    });
    if (error) { alert(error.message); return; }
    setWeight(''); setBodyfat(''); setNotes('');
    await reload();
  };

  const deleteMetric = async (id: string) => {
    await supabase.from('body_metrics').delete().eq('id', id);
    await reload();
  };

  return (
    <div className={styles.card}>
      <Heading as="h3">Log body metrics</Heading>
      <div className={styles.formGrid}>
        <label>
          <span>Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          <span>Weight (kg)</span>
          <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </label>
        <label>
          <span>Bodyfat %</span>
          <input type="number" step="0.1" value={bodyfat} onChange={(e) => setBodyfat(e.target.value)} />
        </label>
        <label className={styles.colSpan2}>
          <span>Notes</span>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </div>
      <button className={styles.primaryBtn} onClick={addMetric}>+ Add measurement</button>

      <div className={styles.entryList}>
        <Heading as="h3" className={styles.listTitle}>Recent (last 30)</Heading>
        {metrics.length === 0 && <p className={styles.empty}>No measurements yet.</p>}
        {metrics.map((m) => (
          <div key={m.id} className={styles.entryRow}>
            <span className={styles.dateTag}>{m.measured_on}</span>
            <div className={styles.entryMain}>
              <div className={styles.entryName}>
                {m.weight_kg != null && `${m.weight_kg} kg`}
                {m.weight_kg != null && m.bodyfat_pct != null && ' · '}
                {m.bodyfat_pct != null && `${m.bodyfat_pct}% BF`}
              </div>
              {m.notes && <div className={styles.entryNotes}>{m.notes}</div>}
            </div>
            <button className={styles.deleteBtn} onClick={() => deleteMetric(m.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HISTORY TAB
   ═══════════════════════════════════════════════════════════ */
function HistoryTab({history}: {history: WorkoutSession[]}): ReactNode {
  return (
    <div className={styles.card}>
      <Heading as="h3">Recent workouts (last 30 sessions)</Heading>
      {history.length === 0 && <p className={styles.empty}>No sessions logged yet.</p>}
      {history.map((s) => (
        <div key={s.id} className={styles.entryRow}>
          <span className={styles.dateTag}>{s.session_date}</span>
          <div className={styles.entryMain}>
            <div className={styles.entryName}>{s.name || 'Workout'}</div>
            {s.notes && <div className={styles.entryNotes}>{s.notes}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FALLBACK: Supabase not configured
   ═══════════════════════════════════════════════════════════ */
function NotConfigured(): ReactNode {
  return (
    <div className={styles.setupBox}>
      <Heading as="h2">Setup required</Heading>
      <p>This app needs Supabase credentials to work. Quick setup (~10 min, free):</p>
      <ol className={styles.setupList}>
        <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a>.</li>
        <li>In the Supabase SQL editor, run the schema from <code>src/data/progressSchema.sql</code>.</li>
        <li>In <strong>Authentication → Providers → Google</strong>, enable Google. You'll need a Google OAuth client ID/secret from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">Google Cloud Console</a>. Add Supabase's callback URL to the allowed redirect URIs.</li>
        <li>
          Set these env vars (locally in <code>.env</code> and in Netlify's <em>Build &amp; Deploy → Environment</em>):
          <pre className={styles.envBlock}>
{`SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=eyJ...`}
          </pre>
        </li>
        <li>Rebuild/redeploy. This page will light up.</li>
      </ol>
    </div>
  );
}

function GoogleIcon(): ReactNode {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 7.1 29.4 5 24 5c-7.8 0-14.5 4.5-17.7 9.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.1 35 26.7 36 24 36c-5.3 0-9.8-3.1-11.3-7.5l-6.5 5C9.4 39.5 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.6 4.9l6.3 5.2C40.2 35.2 44 30 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

export default function ProgressTrackerPage(): ReactNode {
  return (
    <Layout title="Progress Tracker" description="Daily workout + diet log. Signed in via Google, private per user.">
      <div className={styles.pageWrap}>
        <header className={styles.pageHeader}>
          <Heading as="h1" className={styles.title}>Progress Tracker</Heading>
          <p className={styles.subtitle}>
            Log daily workouts, food, and body metrics. Private. Google sign-in.
          </p>
        </header>
        <BrowserOnly fallback={<div className={styles.centered}>Loading…</div>}>
          {() => <ProgressTrackerApp />}
        </BrowserOnly>
      </div>
    </Layout>
  );
}
