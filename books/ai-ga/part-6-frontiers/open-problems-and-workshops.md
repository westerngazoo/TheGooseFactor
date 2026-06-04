---
sidebar_position: 3
title: "Open Problems & Workshops to Watch"
---

# Open Problems & Workshops to Watch

> The unsolved questions and the venues where the field's progress is
> reported. How to stay current in a fast-moving area.

Geometric-algebra ML is young and moving fast. This chapter is the
field guide to its open problems and its community — where the
research happens, what questions are live, and how to follow along.

## 1. The big open problems

**1. Does equivariance survive scale?** The [Chapter 20](/ai-ga/part-6-frontiers/scaling-ga-networks)
question. The single biggest unresolved issue: at extreme scale, does
the geometric inductive bias keep paying, or does flexibility win?

**2. Grade vs irrep expressiveness.** GA's native grades cover low
types; full irrep coverage needs extensions
([Chapter 11 §6](/ai-ga/part-3-clifford-networks/equivariance-proofs-for-ga-layers)).
Is there a clean GA construction for high-type features, or is the
grade-vs-irrep trade-off fundamental?

**3. Efficient high-dimensional GA.** The geometric product is
$O(2^n)$ in algebra dimension. Conformal GA, spacetime applications,
and high-dimensional embeddings hit this wall. Are there efficient
approximations or structured products?

**4. The right nonlinearity.** Equivariant nonlinearities (gating,
geometric products) work but feel ad hoc. Is there a principled,
maximally-expressive equivariant nonlinearity?

**5. Interpretability.** Does the geometric structure deliver on the
interpretability promise ([Chapter 21](/ai-ga/part-6-frontiers/interpretability-of-multivector-activations))?
Mostly unexplored.

**6. Standard tooling.** GA-ML lacks a mature, standard library (the
way e3nn serves irrep methods). Will one emerge?

## 2. Where the research appears

**Top ML venues** (the main stage):

- **NeurIPS, ICML, ICLR**: the major conferences. The foundational
  GA-ML papers (Clifford layers, GCAN, equivariant networks) appeared
  here. Watch the equivariance / geometric-deep-learning tracks.

**Workshops** (the cutting edge, often before the main-conference
papers):

- **Geometric Deep Learning workshops** at NeurIPS/ICML/ICLR.
- **Machine Learning for Molecules / Materials** workshops.
- **Symmetry and Geometry in Neural Representations (NeurReps)** — the
  workshop most focused on the GA/equivariance theory.
- **AI for Science** workshops.

**Domain venues** (applications):

- Molecular ML: appears in chemistry/physics journals (Nature Comp
  Sci, JCP) as well as ML venues.
- Robotics: RSS, CoRL, ICRA for the GA-robotics work.

## 3. Key research groups

The labs driving GA/equivariant ML:

- **Welling group** (Amsterdam): Clifford layers, GCAN, EGNN,
  E(n)-equivariant work. Arguably the center of gravity.
- **Smidt group** (MIT): e3nn, Tensor Field Networks, Equiformer
  collaborations — the irrep side.
- **Cohen, Geiger, and the e3nn community**: the steerable/irrep
  infrastructure.
- **Brandstetter** (now Linz/NXAI): Clifford neural layers, PDE
  modeling.
- **Robotics GA**: the gafro group (Idiap, EPFL-adjacent) and various
  manipulation-learning labs.

Following these groups' publications is the best way to track the
frontier.

## 4. The benchmark datasets to know

Progress is measured on shared benchmarks:

- **QM9**: 134k small molecules, 12 properties. The molecular-ML
  starting line.
- **MD17 / rMD17**: molecular dynamics trajectories. Force-field
  benchmark.
- **OC20 / OC22**: Open Catalyst — large-scale catalysis. The current
  frontier for scale.
- **N-body**: synthetic dynamics. Clean equivariance testbed.
- **ModelNet / ShapeNet**: 3D shapes for point-cloud methods.

Knowing where each method stands on these tells you the practical
state of the art.

## 5. The contested questions

Beyond open problems, there are **debates** — questions where
reasonable researchers disagree:

- **Equivariance vs augmentation at scale** (the AlphaFold-3 debate).
- **GA vs irreps**: which is the better substrate? (Likely
  task-dependent, but partisans exist.)
- **How much geometry is enough?** Full equivariance, soft
  equivariance, or just good augmentation?
- **Is GA-ML a distinct field or a notation for equivariant ML?**
  Some see GA as fundamental; others as a convenient repackaging of
  representation theory.

These debates are productive — they're how the field figures out what
matters.

## 6. How to start contributing

For someone wanting to enter the field:

- **Reproduce a baseline**: implement EGNN
  ([Chapter 4](/ai-ga/part-2-equivariance/egnn)) from scratch. It's
  short and teaches the core ideas.
- **Pick an open problem**: the high-type-feature question, or
  efficient high-dim GA, or GA interpretability — all are accessible
  to a focused effort.
- **Apply to a new domain**: GA-ML has been applied to molecules,
  point clouds, robotics. Climate, fluid dynamics, cosmology,
  protein design — many domains are underexplored.
- **Build tooling**: the field needs a mature GA-ML library. This is
  high-impact infrastructure work.

> :weightliftinggoose: The field is young enough that a focused
> newcomer can contribute meaningfully — the open problems are real
> and accessible, the tooling is immature (so building it matters),
> and many application domains are untouched. This is the opposite of
> a saturated field. If the book's ideas excite you, there's room to
> push them forward.

## 7. Staying current

Practical tips for following a fast field:

- **arXiv**: cs.LG, stat.ML, and physics.comp-ph. Set up alerts for
  "equivariant," "geometric algebra," "Clifford," "E(3)."
- **The groups' pages**: Welling, Smidt, Brandstetter publication
  lists.
- **NeurReps workshop**: the most concentrated source of GA/geometry
  ML.
- **bivector.net and the GA community**: for the algebra side.
- **Papers-with-code leaderboards**: QM9, OC20 — track the practical
  state of the art.

## 8. A realistic outlook

Where the field is heading, best guess:

- **Molecular ML and robotics** will remain GA/equivariance
  strongholds — exact symmetry, expensive data, the bias pays.
- **Large-scale models** will likely use softer/hybrid equivariance,
  trading strictness for flexibility.
- **Tooling** will mature, lowering the entry barrier.
- **The grade-vs-irrep question** will probably resolve to "use both,
  depending on the task" rather than one winning.

GA-ML won't replace mainstream deep learning, but in its strongholds
(geometric/physical data, exact symmetry, scarce data) it's becoming
the standard approach. That's a meaningful, durable niche.

## What we covered

- Big open problems: scaling, grade-vs-irrep, high-dim efficiency,
  nonlinearity, interpretability, tooling.
- Venues: NeurIPS/ICML/ICLR, NeurReps workshop, domain conferences.
- Key groups: Welling, Smidt, Brandstetter, gafro/robotics.
- Benchmarks: QM9, MD17, OC20, N-body, ModelNet.
- Contested debates: equivariance-vs-augmentation, GA-vs-irreps.
- How to contribute: reproduce baselines, tackle open problems, new
  domains, tooling.
- Staying current: arXiv alerts, group pages, NeurReps, leaderboards.
- Outlook: strongholds in molecules/robotics, softer equivariance at
  scale.

## What's next

[Chapter 23](/ai-ga/part-6-frontiers/conformal-ga-for-transformer-geometry) —
the speculative finale. Conformal GA for transformer geometry: could
the attention mechanism itself be reformulated geometrically? A
deliberately speculative look at the edge.
