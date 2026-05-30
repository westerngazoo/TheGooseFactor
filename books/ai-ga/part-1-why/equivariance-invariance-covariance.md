---
sidebar_position: 2
title: "Equivariance vs Invariance vs Covariance — The Vocabulary"
---

# Equivariance vs Invariance vs Covariance

> The three words that get used interchangeably in casual conversation
> and mean precisely different things. Getting them straight is the
> price of admission to the geometric-deep-learning literature.

[Chapter 1](/ai-ga/part-1-why/the-case-for-ga) argued that symmetry
is the organizing principle of modern deep learning. This chapter
nails down the vocabulary. The distinction between **invariance**,
**equivariance**, and **covariance** is not pedantry — it determines
what your network can and can't represent, and choosing the wrong
one silently caps your model's expressiveness.

## 1. The setup: a group acting on inputs

Let $G$ be a group of transformations — rotations $SO(3)$, rigid
motions $SE(3)$, permutations $S_n$, translations $\mathbb{R}^n$.
Let $g \in G$ act on an input $x$ via a representation $\rho_{\rm in}(g)$:

$$x \mapsto \rho_{\rm in}(g)\,x$$

A network is a function $f : X \to Y$. The question is: **how does
$f(x)$ change when we transform $x$?**

There are three canonical answers.

## 2. Invariance

A function $f$ is **invariant** under $G$ if transforming the input
leaves the output unchanged:

$$\boxed{\; f(\rho_{\rm in}(g)\,x) = f(x) \quad\forall g \in G \;}$$

**Example**: the energy of a molecule. Rotate the molecule, the
energy is the same. A network predicting energy from atomic
coordinates should be rotation-invariant.

**Example**: image classification. A cat in any position/orientation
is still a cat (approximately — CNNs are translation-equivariant in
their conv layers and made invariant by pooling).

Invariance is the right target when the output is a **scalar
property** with no orientation: energy, mass, charge, a class label.

> :nerdygoose: Invariance is a special case of equivariance — the
> case where the output representation $\rho_{\rm out}$ is **trivial**
> (every group element acts as the identity on the output). Keep
> this in your back pocket; it unifies the two concepts.

## 3. Equivariance

A function $f$ is **equivariant** if transforming the input
produces a correspondingly-transformed output:

$$\boxed{\; f(\rho_{\rm in}(g)\,x) = \rho_{\rm out}(g)\,f(x) \quad\forall g \in G \;}$$

The input transforms by $\rho_{\rm in}$; the output transforms by
$\rho_{\rm out}$. They need not be the same representation, but they
must be **coordinated**.

**Example**: predicting the force on each atom in a molecule. Rotate
the molecule, the forces rotate with it. Here $\rho_{\rm in} = \rho_{\rm out} = $
the rotation acting on 3-vectors. The network must be
rotation-equivariant.

**Example**: segmentation. Translate the image, the segmentation map
translates with it. Translation-equivariant.

Equivariance is the right target when the output is a **geometric
quantity** that has orientation: a force vector, a velocity field, a
displacement, a pose.

> :surprisedgoose: The single most common architecture bug in
> geometric ML is using an invariant network to predict an
> equivariant quantity. If your network is rotation-invariant but
> you're predicting a force vector, the network can only ever output
> $\mathbf{0}$ for a rotationally-symmetric input — because any
> non-zero vector would have to equal its own rotation. The
> symmetry **forces** the wrong answer.

## 4. Covariance

**Covariance** is the physicist's word, and it means essentially the
same thing as equivariance — but with emphasis on the
**representation-theoretic** structure. A tensor $T$ is covariant if
its components transform according to a specific representation of
the group under coordinate changes.

In physics: a covariant 4-vector $v_\mu$ transforms by $\Lambda_\mu{}^\nu$
(the Lorentz matrix), a contravariant $v^\mu$ by the inverse. Both
are "equivariant" in the ML sense; the physicist tracks which
representation via index placement.

The vocabulary maps:

| ML term | Physics term | Meaning |
|---|---|---|
| Invariant | Scalar / invariant | Output unchanged by $G$ |
| Equivariant | Covariant / tensorial | Output transforms by $\rho_{\rm out}$ |
| Feature representation | Tensor rank / irrep | Which $\rho$ a quantity transforms by |

GA's contribution, foreshadowed in [Chapter 1](/ai-ga/part-1-why/the-case-for-ga):
**multivector grades are the natural carriers of these
representations.** A scalar (grade 0) is invariant; a vector (grade
1) is equivariant under the vector representation; a bivector (grade
2) under the bivector representation; and so on.

## 5. Why equivariance beats data augmentation

The non-equivariant alternative is **data augmentation**: show the
network many rotated copies of each example and hope it learns the
symmetry. This works, but it's wasteful — the network spends capacity
memorizing "this is the same as that under rotation" instead of
learning the actual task.

An equivariant network has the symmetry **built in by construction**.
It cannot violate it, so it never wastes capacity learning it. The
empirical payoff (cited in [Chapter 1](/ai-ga/part-1-why/the-case-for-ga)):
10–100× less data for the same accuracy on symmetric tasks.

There's also a generalization guarantee: an equivariant network is
**correct on transformed inputs it has never seen**, because the
symmetry is exact, not approximate. Data augmentation gives you
approximate symmetry that degrades away from the training
distribution.

> :weightliftinggoose: Data augmentation is the "just lift heavier"
> of ML — brute force that works but doesn't scale elegantly.
> Equivariance is the "fix your technique" — build the symmetry into
> the movement pattern and you get the result for free, forever.

## 6. The composition rule

Equivariance **composes**: if $f$ and $h$ are both equivariant, so is
$h \circ f$. The proof is one line:

$$h(f(\rho_{\rm in}(g)\,x)) = h(\rho_{\rm mid}(g)\,f(x)) = \rho_{\rm out}(g)\,h(f(x))$$

This is **why** equivariant networks are buildable: stack equivariant
layers, and the whole network is equivariant. Each layer must respect
the symmetry; the composition then does too.

This is exactly analogous to how rotor composition works in GA
(Chapter 1's [physics book Ch 2](/geometric-algebra)): compose two
rotors and you get a rotor. The structure-preservation is the same
idea at the layer level.

## 7. Partial and approximate equivariance

Real-world symmetries are sometimes only approximate:

- **Gravity breaks rotational symmetry**: a protein in solution has
  full $SO(3)$ symmetry, but a protein on a membrane has only the
  axial symmetry around the membrane normal. The "correct" group is
  smaller.
- **Discretization breaks continuous symmetry**: a CNN on a pixel
  grid is only equivariant to the discrete translations of the grid,
  not continuous translations.
- **Soft equivariance**: sometimes you want a network that's *mostly*
  equivariant but can break the symmetry slightly when the data
  demands it. Recent work explores "relaxed" or "approximate"
  equivariant layers.

Choosing the **right group** is a modeling decision. Over-constraining
(imposing a symmetry the data doesn't have) hurts as much as
under-constraining.

## 8. The representation zoo

For a given group $G$, the possible "transformation types" are its
**irreducible representations** (irreps). For $SO(3)$:

- **Type-0** (scalar): invariant. 1-dimensional.
- **Type-1** (vector): the familiar 3-vector. 3-dimensional.
- **Type-2** (rank-2 symmetric traceless tensor): 5-dimensional.
- Higher types: $2\ell + 1$ dimensional for "angular momentum $\ell$".

Spherical-harmonics-based networks (Tensor Field Networks,
SE(3)-Transformers — [Chapter 5](/ai-ga/part-2-equivariance/se3-transformers))
work directly with these irreps.

GA's alternative: **multivector grades**. A 3D multivector has
grades 0 (scalar), 1 (vector), 2 (bivector), 3 (pseudoscalar) —
dimensions 1, 3, 3, 1. The bivector (grade 2) is the dual of the
vector, carrying the same $SO(3)$ irrep as type-1 (in 3D). The
grades give you a **basis-free** way to organize the representations.

> :nerdygoose: The relationship between "multivector grades" and
> "$SO(3)$ irreps" is subtle: grades are reducible representations in
> general. A 3D bivector is type-1 (it's dual to a vector); a 3D
> vector is type-1. To get type-2 (the 5-dim irrep) you need
> symmetric products of vectors, which live in a different part of
> the algebra. GA and irrep-based methods are complementary, not
> identical — [Chapter 11](/ai-ga/part-3-clifford-networks/equivariance-proofs-for-ga-layers)
> works out the precise correspondence.

## 9. A worked example: the EGNN update

To make this concrete, here's the core update of an
E(n)-equivariant graph network (EGNN, Satorras et al. 2021), which
[Chapter 4](/ai-ga/part-2-equivariance/egnn) covers in depth.

For nodes with **invariant** features $h_i$ and **equivariant**
positions $x_i$:

$$m_{ij} = \phi_e(h_i, h_j, \|x_i - x_j\|^2)$$
$$x_i \leftarrow x_i + \sum_{j} (x_i - x_j)\,\phi_x(m_{ij})$$
$$h_i \leftarrow \phi_h\Big(h_i, \sum_j m_{ij}\Big)$$

Notice the structure:

- The message $m_{ij}$ depends only on the **invariant** distance
  $\|x_i - x_j\|^2$ — so messages are invariant.
- The position update adds **equivariant** vectors $(x_i - x_j)$
  weighted by **invariant** scalars $\phi_x(m_{ij})$ — so the update
  is equivariant.

An invariant scalar times an equivariant vector is equivariant. This
is the trick that makes EGNN work, and it's exactly the
grade-multiplication structure of GA: scalar (grade 0) times vector
(grade 1) is a vector (grade 1).

> :happygoose: Once you see "invariant scalar × equivariant vector =
> equivariant vector," you've understood the core of half the
> geometric-ML literature. EGNN, SchNet, DimeNet — they're all
> variations on routing invariant scalars to weight equivariant
> vectors. GA makes this a single algebraic operation.

## What we covered

- **Invariant**: $f(gx) = f(x)$ — output unchanged. For scalars
  (energy, class label).
- **Equivariant**: $f(gx) = \rho_{\rm out}(g)f(x)$ — output transforms
  coordinately. For geometric quantities (forces, poses).
- **Covariance** is the physics word for equivariance, with
  representation bookkeeping via indices.
- Invariance is equivariance with a trivial output representation.
- Equivariance composes, so equivariant networks are buildable by
  stacking.
- Multivector grades are GA's natural carriers of group
  representations.
- The "invariant scalar × equivariant vector" trick powers EGNN and
  much of geometric ML.

## What's next

[Chapter 3](/ai-ga/part-1-why/group-theory-in-30-minutes) — group
theory in 30 minutes. Just enough Lie groups, Lie algebras, and
representations to read the rest of the book without a separate
math course.
