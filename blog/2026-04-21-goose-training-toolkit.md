---
title: "The Goose Training Program, Now With Apps"
description: "The full Goose Method — undulating periodization, strength/hypertrophy/metabolic/isolation classification, PAP pairing, 72-hr spacing — plus four apps that turn it into a daily toolkit: calorie calculator, routine generator, session builder, progress tracker with Google login."
authors: [geese]
tags: [training, goose-method]
---

# The Goose Training Program, Now With Apps

The Goose Method is a periodized training framework built around one honest observation: **the nervous system adapts faster than the muscle, but fatigues slower.** If you don't account for both clocks — CNS recovery and muscular recovery — you either stall on strength, plateau on size, or overtrain into a hole. The program handles both, and I've now built four interactive tools on top of it so you can use it every day without a spreadsheet.

<!-- truncate -->

> :weightliftinggoose: If you only take one thing away: stop training every muscle the same way every time. Your body isn't a single variable. Load it on multiple axes.

## The Core Framework

Four pillars, in priority order.

### 1. Undulating Periodization (DUP)

Every session belongs to one of four intensity categories:

| Category | Reps | Purpose | CNS cost |
|---|---|---|---|
| **Strength** | 3–5 | Heavy compounds. Max force production. | HIGH |
| **Metabolic** | 10–15 w/ short rest | Conditioning. Complexes, high-rep compounds. | MEDIUM-HIGH |
| **Hypertrophy** | 8–12 | Moderate load, full ROM, muscle growth. | MEDIUM |
| **Isolation** | 12–20 | Single-joint, strict form, pump. | LOW |

The rule: **the same muscle group rotates through categories across the week.** Squat heavy Monday, split squats at 8–10 reps Wednesday, leg extension pump Friday. Each hit drives different adaptations (neural, sarcoplasmic, sarcomeric, vascular) without stacking fatigue in the same system.

This is classical DUP, but with a fourth category — Metabolic — that most programs lump into hypertrophy. Metabolic is its own thing: work capacity, tendon resilience, muscle density. You need it.

### 2. PAP Pairing (Post-Activation Potentiation)

Heavy compound immediately followed by an antagonist or same-pattern isolation, while the CNS is primed:

- Squat 5×5 → Leg Extension 3×15
- Bench 5×5 → Cable Crossover 3×15
- Deadlift 5×5 → Cable Row 3×15

The heavy set recruits high-threshold motor units. The pump set — done within 90 seconds — inherits the activation, producing better hypertrophy signaling than either exercise alone. This is the **bisérie** cue in the routine generator.

### 3. The Constraint Set

These are the hard rules. Violate them and the rest of the program unwinds:

- **Max 1 HIGH (strength) block per session.** The nervous system has one heavy output per day. Stack two and the second is a shadow of what it should be.
- **72 hrs minimum between HIGH days of the same muscle group.** Neural recovery is slower than muscular recovery — the muscle is fine in 48 hrs, the nerves aren't.
- **Chest HIGH = SACRED.** No other strength work that day. The pec/shoulder/triceps chain is too interconnected; pairing it with another heavy compound drops both.
- **Deadlift before Squat** if both are HIGH on the same day. Pulling drains the erectors; squatting on drained erectors is a back injury waiting to happen.
- **HIGH first in the session order.** Strength quality craters under fatigue. Never put heavy compounds after pump work.

### 4. Diagnostics

If something isn't working, the Goose Method has a diagnostic table for it. Load stalling for 3+ weeks → CNS fatigue. DOMS lasting 72+ hrs → excessive damage, drop sets. No DOMS at all → stimulus adaptation, rotate exercise A. **Don't guess. Diagnose.**

## The Apps

Four tools, all at [`/apps`](/apps), all implementing the framework.

### 🔥 [Calorie Calculator](/apps/calorie-calculator)

**What it does:** TDEE + macro splits by time window. Enter age, weight, height, activity, goal, diet mode (mixed or keto), and fasting window. Get your maintenance, target, and a per-window breakdown of protein / carbs / fat — pre-workout, post-workout, main meal, night. Includes suggested meals pulled from a 78-food database with per-100g macros.

**Use it to:** Set your daily intake baseline. Without this, the rest is noise.

**Tip:** Keto mode reshuffles the macros (high fat, moderate protein, carbs below 20g/day) and also filters the food database to keto-friendly picks. Mixed mode is the default for strength + hypertrophy phases.

### 💪 [Routine Generator](/apps/routine-generator)

**What it does:** Generates a full week of training under the constraint set. Pick a preset (3/4/5/6 days) or go custom. For each day you enable, the generator:

- Places the correct HIGH / MEDIUM / LOW blocks
- Fills in PAP-paired exercise lists
- Validates against the full Goose ruleset (72-hr rule, chest-sacred, deadlift-before-squat, HIGH-first, etc.)
- Flags violations in red with an explanation

**Use it to:** Plan your mesocycle. Commit to a split. Not a daily tool — a weekly one.

### 🎯 [Session Builder](/apps/session-builder)

**What it does:** Ad-hoc "what am I doing at the gym today" picker. Choose a muscle group, choose a category (Strength / Metabolic / Hypertrophy / Isolation), and tap exercises from the best-known list. Each pick adds to today's session with its sets/reps/notes. Reorder, remove, and see live Goose Method warnings as you build.

**New:** muscle activation map — every exercise lights up a front+back anatomy chart with sub-muscle precision (upper pec vs. lower pec, long-head biceps vs. short-head, lateral vs. long-head triceps, etc.). Compounds like Deadlift light up posterior chain, lats, erectors, traps, and forearm grip simultaneously.

**Use it to:** Plan a single session when the routine generator's weekly plan doesn't fit — traveling, short on time, a new gym, or testing a new exercise.

### 📈 [Progress Tracker](/apps/progress-tracker)

**What it does:** The daily log. Sign in with Google (RLS-protected Postgres — nobody sees your data but you), tag each session's DUP slot (Strength / Hypertrophy / Metabolic / Pump / Mixed / Deload), and log every exercise with sets / reps / weight / RPE / bisérie pair. Features:

- **"Last time" hint** — the moment you pick an exercise, it shows your most recent lift on it (date, weight × reps × RPE). Progressive overload without a notebook.
- **Quick-add full block** — one tap drops all suggested exercises for a group × category into the session.
- **Anatomy map** — same sub-muscle chart as Session Builder, plus a cumulative view of everything today has hit.
- **Diet log** — food, meal tag, macros. Running totals for kcal/P/C/F.
- **Body metrics** — weight + bodyfat% over 30 days.
- **History** — last 30 sessions, tagged by DUP slot.

**Use it to:** Everything else is pre-work. This is where training actually happens. Every rep you want to beat next week lives here.

## A Typical Week

Here's what a 5-day strength-focused block looks like end-to-end.

**Monday — Quad HIGH + Chest MED**

- Barbell Squat 5×5 → Leg Extension 3×15 (PAP)
- Incline DB Press 4×10
- Leg Press 3×12

Tag session as **Strength** in the Progress Tracker. The "Last time" hint tells you what squat weight you did 7 days ago. Add 2.5–5 kg if the reps were clean.

**Tuesday — Back MED + Biceps HIGH + Triceps HIGH**

- Barbell Row 5×5 → Cable Pullover 3×15
- Cheated EZ Curl 4×6 → Dragon Curl
- EZ Skull Crusher 4×6-8 → Cable Pushdown

Tag as **Mixed**. Biceps and triceps are small enough that two heavy blocks on them same day is tolerable — unlike chest or back, which need full session commitment.

**Wednesday — Chest HIGH (sacred)**

- Bench Press 5×5 → Cable Crossover 3×15
- Incline Barbell 4×6 → Cable Crossover

Tag as **Strength**. Nothing else. Yes, you have energy left. Use it for the eccentrics.

**Thursday — Shoulder HIGH + Posterior MED**

- Clean & Press 5×5 → Lateral Raises
- Heavy Lunges 4×8 → Leg Curl

Tag as **Strength**.

**Friday — Back HIGH + Shoulder MED + Arms MED**

- Deadlift 5×5 → Cable Row (deadlift always first)
- Lateral + Front Raises 3×12
- DB Curls 3×12 / Cable Pushdown 3×12

Tag as **Strength**.

**Saturday/Sunday — off, or LOW pump sessions if you're neurotic.** Your CNS earned the rest.

## Setup (One Time, ~10 Minutes)

The first three apps work out of the box. The Progress Tracker needs a tiny bit of wiring since it stores your data in a real database:

1. Create a free [Supabase](https://supabase.com) project.
2. Run the schema from `src/data/progressSchema.sql` in the Supabase SQL editor.
3. Enable Google OAuth in Supabase (takes ~5 min via [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — the provider setup tab gives you the callback URL).
4. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` as environment variables.

The full step-by-step is in `PROGRESS_TRACKER_SETUP.md` at the repo root.

Row-Level Security is on by default — each user only sees their own data. Invite collaborators by adding them to the OAuth test users list, or publish the consent screen to let any Google account sign in.

## What's Next

- **Coach/client mode** — let a coach view approved clients' logs via a policy table.
- **Mesocycle blocks** — explicit tagging of "strength block" / "hypertrophy block" / "peaking" across weeks for long-term planning.
- **1RM estimates + PR graph** — Epley/Brzycki formulas on history to track actual strength trajectory, not just raw weight.
- **Exercise video links** — for anything exotic in the library.
- **Export to CSV** — so a coach without app access can still audit your week.

The toolkit is live now at [`/apps`](/apps). The code is open on [GitHub](https://github.com/westerngazoo). If something's broken or missing an exercise you care about, open an issue — I'll add it.

> :weightliftinggoose: Train the nervous system and the muscle. On different axes, on different days. Log everything. Beat last week's numbers. That's the whole program.
