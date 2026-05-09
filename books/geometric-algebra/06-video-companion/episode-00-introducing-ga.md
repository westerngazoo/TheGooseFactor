---
sidebar_position: 2
title: "Introducing Geometric Algebra"
---

# Introducing Geometric Algebra

> Watch on [YouTube](https://www.youtube.com/watch?v=qJHFTMF_pPk).

<iframe width="560" height="315" src="https://www.youtube.com/embed/qJHFTMF_pPk" title="Introducing geometric algebra" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## What it covers

Mathoma opens with the **fragmentation problem** in classical
linear algebra. Three operations on vectors, none of them composable
into a single algebra:

- The **dot product** $\mathbf{a}\cdot\mathbf{b} \in \mathbb{R}$:
  symmetric, scalar-valued, not invertible.
- The **cross product** $\mathbf{a}\times\mathbf{b} \in \mathbb{R}^3$:
  antisymmetric, dimension-locked to 3D, not associative
  ($\mathbf{a}\times(\mathbf{b}\times\mathbf{c}) \ne (\mathbf{a}\times\mathbf{b})\times\mathbf{c}$ in general).
- **Complex multiplication** in 2D: associative, commutative,
  invertible — but defined on complex *scalars*, not on real
  vectors. Quaternions extend this to 3D rotations but introduce
  $i, j, k$ with no geometric meaning at face value.

The promise of geometric algebra: replace all three with **one
product** — the *geometric product* — defined on real vectors and
satisfying

$$
\mathbf{a}\mathbf{b} = \underbrace{\mathbf{a}\cdot\mathbf{b}}_{\text{scalar}} + \underbrace{\mathbf{a}\wedge\mathbf{b}}_{\text{bivector}}
$$

The product is associative, defined in any dimension, contains the
inner and outer products as its symmetric and antisymmetric parts,
and admits an inverse $\mathbf{a}^{-1}$ for any nonzero vector.

## In this book

- [Why Geometric Algebra (intro)](/geometric-algebra)
- [Vectors and the Geometric Product](/geometric-algebra/foundations/vectors-and-the-geometric-product)
  — derives the inner/outer decomposition above from two axioms.

## Algebraic preview

The two foundational axioms:

1. **Associativity:** $(\mathbf{a}\mathbf{b})\mathbf{c} = \mathbf{a}(\mathbf{b}\mathbf{c})$.
2. **Contraction rule:** $\mathbf{a}^2 = |\mathbf{a}|^2 \in \mathbb{R}$.

From these alone, expanding $(\mathbf{a}+\mathbf{b})^2$ yields

$$\mathbf{a}\mathbf{b} + \mathbf{b}\mathbf{a} = 2(\mathbf{a}\cdot\mathbf{b})$$

so the symmetric part of $\mathbf{a}\mathbf{b}$ is the inner product.
The antisymmetric part — call it $\mathbf{a}\wedge\mathbf{b}$ — is
a new object: a *bivector*, an oriented plane element. The geometric
product is the sum.

> :happygoose: First exposure: video. Second exposure: the
> two-axiom derivation in
> [§1.1](/geometric-algebra/foundations/vectors-and-the-geometric-product).
> Third exposure: do an exercise. That's the loop.
