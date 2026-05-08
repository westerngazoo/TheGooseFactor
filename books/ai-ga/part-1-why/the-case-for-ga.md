---
sidebar_position: 1
title: "The Case for Geometric Algebra in Deep Learning"
---

# The Case for Geometric Algebra in Deep Learning

> The opening argument. Why a 19th-century algebraic framework is
> showing up at NeurIPS workshops in 2024. Three concrete failure
> modes of standard deep-learning architectures, and how GA
> addresses each.

## The frame: geometric deep learning

Bronstein et al.'s *Geometric Deep Learning* (2021) made the case
that **symmetry is the unifying principle** behind successful
deep-learning architectures:

- CNNs respect translation symmetry (a cat in the corner is still
  a cat).
- GNNs respect permutation symmetry (the order of nodes shouldn't
  matter).
- Transformers respect set permutation (the order of tokens is
  encoded explicitly, but the operation is permutation-equivariant).

Each architecture is the "right" architecture for its symmetry
group. The question that opens up: **what about rotational and
rigid-body symmetries?**

Molecules don't have a canonical orientation. Point clouds from
LIDAR can be rotated. A robot's arm is moved by SE(3) — the rigid
motion group of 3D space. For these problems, the symmetry group
is more than a permutation; it's a continuous geometric group.

That's where geometric algebra arrives.

## Failure mode 1 — non-equivariant networks waste data

Suppose you train an MLP to predict the energy of a small
molecule given the 3D coordinates of its atoms. The energy is
**rotation-invariant**: rotating the molecule doesn't change its
energy.

A naive MLP doesn't know this. To learn rotation invariance, it
has to see the same molecule at many orientations during training
— a form of data augmentation that wastes capacity on memorizing
"oh, this is rotationally equivalent to that."

A well-known empirical result: **equivariant networks need
10–100× less training data** for the same accuracy on tasks with
rotational symmetry (Geiger et al., 2022; many others since).

> :surprisedgoose: That's not a constant-factor improvement. On
> molecular datasets where you have, say, 50K labeled examples,
> dropping that to 500–5000 changes which questions you can ask.

The 19th-century math fixes a 21st-century data problem.

## Failure mode 2 — rotations as 3×3 matrices are wasteful

Standard deep learning represents rotations either as 3×3
matrices (SO(3) ↪ $\mathbb{R}^9$) or as quaternions
($\mathbb{R}^4$ with a unit constraint). The matrix
representation has 6 redundant parameters, and the network's
optimizer is free to drift away from the orthogonal manifold.

The quaternion representation is tighter (4 parameters, 1
constraint, 3 effective DOF) but has the **double-cover problem**:
$q$ and $-q$ represent the same rotation, so the parameterization
is two-to-one. Networks predicting quaternions can flip mid-training,
and the loss landscape has discontinuities.

GA's rotors are **the same as quaternions in 3D**, but they
generalize to any dimension and admit a clean **Lie-algebra
parameterization** via bivectors:

$$R = \exp(B/2), \qquad B \in \text{bivector space}$$

Network predicts $B$ (a bivector — three real parameters, no
constraint), the layer applies $\exp$. The output rotor is
exactly orthogonal, no double-cover, no drift.

> :nerdygoose: The bivector parameterization is what physicists
> call the **exponential map** from the Lie algebra
> $\mathfrak{so}(3)$ to the Lie group $SO(3)$. GA makes this map
> a one-line algebraic operation instead of an abstract concept.

## Failure mode 3 — type fragmentation

A typical robotic-control pipeline:

1. Receive **point cloud** from LIDAR.
2. Compute **rigid transformation** to align with a model.
3. Predict **gripper pose** (translation + rotation).
4. Plan a **trajectory** as a sequence of rigid motions.
5. Output **joint angles** (a vector).

Each step uses a different data type: point cloud (vectors),
rigid transformation (matrix or quaternion+vector), pose
(SE(3)), trajectory (sequence of SE(3)), joint angles (a vector
in $\mathbb{R}^n$). Conversions between types lose information,
introduce numerical noise, and clog the architecture.

In **conformal geometric algebra (CGA)**, all of these live as
multivectors in *one* algebra:

- Points, planes, spheres, lines: 1-blades or higher-grade blades.
- Rigid motions: rotors.
- Joint angles: parameters of bivector exponentials.
- Trajectories: paths in rotor space.

A single network type — multivector → multivector — handles the
whole pipeline. The conversions vanish.

> :angrygoose: We've been training networks that learn to undo
> the type conversions we built into the pipeline. The network
> isn't learning physics; it's learning to compensate for our
> bad data layout. CGA fixes the layout, and the network can
> spend its capacity on the actual problem.

## Three categories of GA-aware architectures

The literature has converged on roughly three families.

### A. Equivariant networks via geometric tensors

Most prominent: **E(n)-Equivariant Graph Neural Networks** (EGNN,
Satorras et al., 2021) and **SE(3)-Transformers** (Fuchs et al.,
2020). These networks process equivariant features at multiple
"order" levels (scalars, vectors, tensors), using
representation-theoretic constraints to ensure outputs transform
correctly under group actions.

GA's role here is **representational**: multivector grades
(scalar, vector, bivector, …) map directly to the irreducible
representations needed. You can build these networks without
explicit GA, but the algebra makes the constraints natural.

### B. Clifford / GA neural networks

Most prominent: **Clifford Layers** (Brandstetter et al., 2022)
and **Geometric Clifford Algebra Networks** (GCAN, Ruhe et al.,
2023). These networks operate on multivectors *directly* — the
features are multivector-valued, and the layers are GA
operations (geometric product, sandwich product, exponential).

GA's role here is **architectural**: the network is built out of
GA operations from the ground up. Equivariance follows
algebraically from the sandwich structure.

### C. Domain-specific (CGA for robotics, STA for relativistic ML)

Most prominent: **gafro** library (Löw et al., 2023+) for robotic
manipulation. The CGA's screw motor representation handles
rigid-body kinematics, and policy networks output rotors directly.

For physics-informed ML at relativistic scales, STA is the natural
substrate — early work in 2024 explores this.

## Why now?

GA isn't new. Hestenes was arguing for it in physics in the 1960s.
What changed?

**1. Hardware.** Multivector operations vectorize cleanly on GPUs.
Until ~2018, the implementation cost was higher than the
algorithmic benefit. Today, libraries like `clifford` (Python),
`tfga` (TensorFlow), and the Brandstetter group's CUDA kernels
have closed the gap.

**2. The equivariance push.** When AlphaFold-2 dropped (2021),
the community got serious about geometry-aware ML. Equivariance
became a measurable axis of progress.

**3. Cross-pollination.** Papers from physics-flavored ML
(spinors, gauge invariance, Clifford bundles in differential
geometry) started landing in ML venues. The vocabulary aligned.

> :weightliftinggoose: This is a research field, not a settled
> framework. Expect rough edges — open-source libraries are
> alpha-quality, papers contradict each other on parameterization
> choices, and "the right" GA architecture for a given task is
> often unknown. That's also where the publication opportunities
> are.

## What you'll get from this book

- **Part II** covers the equivariant-tensor family (EGNN,
  SE(3)-Transformer) at depth.
- **Part III** covers Clifford/GA-native networks (Brandstetter,
  GCAN).
- **Part IV** focuses on representational choices — molecules,
  point clouds, conformal embeddings.
- **Part V** is robotics-applied.
- **Part VI** is the frontier — what's open, what's contested,
  what's worth your attention if you're choosing a research
  direction.

## What you should read first (besides this book)

- **Bronstein et al., *Geometric Deep Learning: Grids, Groups,
  Graphs, Geodesics, and Gauges* (2021)** — the unifying
  manifesto. Free PDF online.
- **Satorras et al., *E(n)-Equivariant Graph Neural Networks*
  (2021)** — the simplest equivariant architecture that works.
  4-page paper, very readable.
- **Brandstetter et al., *Clifford Neural Layers for PDE
  Modeling* (2022)** — first major GA-native architecture paper.

These three set up the rest of the field. We'll cite them
constantly.

> :happygoose: GA-for-AI is one of those rare "the framework
> finally caught up to the application" moments. The math has
> been ready since the 1960s. The hardware caught up around 2020.
> We're early.
