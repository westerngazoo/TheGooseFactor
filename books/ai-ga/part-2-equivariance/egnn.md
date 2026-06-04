---
sidebar_position: 1
title: "E(n)-Equivariant Graph Networks (Satorras et al., 2021)"
---

# E(n)-Equivariant Graph Networks

> *Satorras, Hoogeboom & Welling, "E(n) Equivariant Graph Neural
> Networks," ICML 2021.* The simplest equivariant architecture that
> works — and the one to understand first.

EGNN is the entry point to equivariant deep learning. It's a 4-page
paper, the architecture is a handful of equations, and it achieves
$E(n)$-equivariance without any spherical harmonics, Clebsch-Gordan
coefficients, or representation-theory machinery. If you understand
EGNN, you understand the core idea; everything else is elaboration.

## 1. The problem EGNN solves

Given a graph where each node $i$ has:

- An **invariant feature** $h_i \in \mathbb{R}^d$ (atom type, charge,
  embedding).
- An **equivariant coordinate** $x_i \in \mathbb{R}^n$ (position in
  space).

We want a network that:

- Updates $h_i$ in an $E(n)$-**invariant** way (atom features don't
  rotate).
- Updates $x_i$ in an $E(n)$-**equivariant** way (positions rotate
  with the input).

$E(n)$ = rotations + reflections + translations in $\mathbb{R}^n$.

## 2. The EGNN layer

The full update, per layer:

$$m_{ij} = \phi_e\big(h_i, h_j, \|x_i - x_j\|^2, a_{ij}\big)$$

$$x_i \leftarrow x_i + \frac{1}{|\mathcal{N}(i)|}\sum_{j \ne i} (x_i - x_j)\,\phi_x(m_{ij})$$

$$m_i = \sum_{j \in \mathcal{N}(i)} m_{ij}, \qquad h_i \leftarrow \phi_h(h_i, m_i)$$

where $\phi_e, \phi_x, \phi_h$ are MLPs and $a_{ij}$ are optional
edge attributes. Three steps: compute messages, update positions,
update features.

## 3. Why it's equivariant

The magic is in two structural choices:

**1. Messages depend only on invariant quantities.** $m_{ij}$ is a
function of $h_i, h_j$ (invariant) and $\|x_i - x_j\|^2$ (the squared
distance — invariant under rotation, reflection, AND translation).
So $m_{ij}$ is fully $E(n)$-invariant. Rotate the whole graph: every
message is unchanged.

**2. Position updates are invariant-weighted equivariant vectors.**
The update adds $(x_i - x_j)$ — a **relative position**, which is
translation-invariant and rotation-**equivariant** — weighted by the
invariant scalar $\phi_x(m_{ij})$. An invariant scalar times an
equivariant vector is equivariant.

Putting it together: $x_i$ transforms correctly under any rotation,
reflection, or translation, because it's built from relative-position
vectors weighted by invariant scalars. The feature $h_i$ stays
invariant because it's built from invariant messages.

> :happygoose: This is the "invariant scalar × equivariant vector"
> trick from [Chapter 2](/ai-ga/part-1-why/equivariance-invariance-covariance)
> in its purest form. No representation theory, no irreps — just the
> observation that distances are invariant and relative positions are
> equivariant, and the right combination of the two stays
> equivariant. EGNN is that observation, packaged as a layer.

## 4. The GA reading of EGNN

In geometric-algebra terms, EGNN's position update is

$$\Delta x_i = \sum_j (x_i - x_j)\,w_{ij}$$

with $w_{ij}$ a scalar. This is a **grade-1 (vector) update weighted
by grade-0 (scalar) coefficients** — the simplest possible
GA-equivariant operation. Scalar × vector = vector.

EGNN uses only grades 0 and 1. It never forms bivectors, so it can't
represent **orientation-dependent** interactions (like torques or
chirality). This is EGNN's main limitation: it's equivariant but not
maximally expressive. Architectures that use higher grades
([Clifford layers, Chapter 8](/ai-ga/part-3-clifford-networks/clifford-layers))
can represent richer geometric interactions.

> :nerdygoose: EGNN's restriction to scalars and vectors is exactly
> why it can't distinguish a molecule from its mirror image
> (chirality). Distinguishing chirality requires the pseudoscalar
> (grade 3 in 3D) — the signed volume. EGNN throws that information
> away. For chiral molecules, you need a higher-grade architecture.

## 5. What EGNN gets right

Despite its simplicity, EGNN is remarkably effective:

- **N-body simulation**: predicting particle trajectories under
  gravity/electrostatics. EGNN beats non-equivariant baselines by
  large margins.
- **Molecular property prediction** (QM9): competitive with
  far more complex architectures.
- **Generative modeling**: EGNN backbones power equivariant
  diffusion models for molecule generation (Hoogeboom et al. 2022).

The lesson: **most of the benefit of equivariance comes from getting
the basic structure right**, not from sophisticated representation
theory. EGNN captures the 80% with 20% of the complexity.

## 6. The radial-function bottleneck

EGNN's expressiveness limit comes from routing all geometric
information through the scalar distance $\|x_i - x_j\|^2$. Two
different geometric configurations with the same set of pairwise
distances are indistinguishable to EGNN.

This is the "**radial bottleneck**." For most molecular tasks it's
fine (distances carry most of the signal), but for tasks where
angles and orientations matter (e.g., predicting dihedral-dependent
energies), you need directional information that EGNN discards.

The fixes:

- **DimeNet / GemNet**: add angular features (triplet angles).
- **Tensor Field Networks / SE(3)-Transformers**: full irrep
  features ([Chapter 5](/ai-ga/part-2-equivariance/se3-transformers)).
- **Clifford networks**: multivector features that preserve
  directional info via bivectors ([Chapter 8](/ai-ga/part-3-clifford-networks/clifford-layers)).

## 7. Implementation notes

EGNN is genuinely easy to implement — a few dozen lines in PyTorch.
Key practical points:

- **Coordinate centering**: subtract the centroid before processing
  for numerical stability (the network is translation-equivariant,
  so this doesn't change anything mathematically, but helps
  optimization).
- **Velocity channels**: for dynamics, add a velocity vector $v_i$
  updated alongside $x_i$ — also equivariant.
- **Normalization**: the $1/|\mathcal{N}(i)|$ averaging keeps
  position updates from blowing up on dense graphs.
- **No batch norm on coordinates**: batch-norming equivariant
  features breaks equivariance. Only normalize invariant features.

> :weightliftinggoose: EGNN is the "bodyweight squat" of equivariant
> ML — master it before touching the loaded variations. The
> reference implementation is short enough to read in one sitting.
> Build it, train it on N-body, watch it generalize to rotations it
> never saw. Then you'll understand why equivariance is worth the
> trouble.

## What we covered

- EGNN: nodes with invariant features $h_i$ and equivariant
  coordinates $x_i$.
- Three-step layer: invariant messages, equivariant position update,
  invariant feature update.
- Equivariance from "messages use invariant distances" + "position
  updates are invariant-weighted relative-position vectors."
- GA reading: grade-0 × grade-1 = grade-1; EGNN uses only scalars
  and vectors.
- Limitation: the radial bottleneck — no angular/chirality info.
- Highly effective despite simplicity; the entry point to the field.

## What's next

[Chapter 5](/ai-ga/part-2-equivariance/se3-transformers) —
SE(3)-Transformers. Full irrep features, attention with
equivariant queries/keys/values, and where the spherical-harmonic
machinery becomes necessary.
