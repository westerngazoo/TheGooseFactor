---
sidebar_position: 4
title: "Episode 2 — The Geometric Product"
---

# Episode 2 — The Geometric Product

> Watch on [YouTube](https://www.youtube.com/watch?v=K1JDuMObmjk).

<iframe width="560" height="315" src="https://www.youtube.com/embed/K1JDuMObmjk" title="The geometric product" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## What it covers

The fundamental identity of geometric algebra: every product of
two vectors decomposes into a symmetric scalar part (the inner
product) and an antisymmetric bivector part (the wedge product).

### The two axioms

The geometric product on real vectors is defined by:

1. **Associativity:** $(\mathbf{a}\mathbf{b})\mathbf{c} = \mathbf{a}(\mathbf{b}\mathbf{c})$.
2. **Contraction:** $\mathbf{a}^2 = |\mathbf{a}|^2 \in \mathbb{R}$.

Together with bilinearity (which is implicit when we say "a product
on a vector space"), these rules generate the entire algebra.

### Deriving the decomposition

Compute $(\mathbf{a}+\mathbf{b})^2$ using the contraction rule on
the left and bilinear expansion on the right:

$$|\mathbf{a}+\mathbf{b}|^2 = (\mathbf{a}+\mathbf{b})^2 = \mathbf{a}^2 + \mathbf{a}\mathbf{b} + \mathbf{b}\mathbf{a} + \mathbf{b}^2 = |\mathbf{a}|^2 + |\mathbf{b}|^2 + \mathbf{a}\mathbf{b} + \mathbf{b}\mathbf{a}$$

But also, by the law of cosines,

$$|\mathbf{a}+\mathbf{b}|^2 = |\mathbf{a}|^2 + |\mathbf{b}|^2 + 2(\mathbf{a}\cdot\mathbf{b})$$

Equating and rearranging:

$$\boxed{\;\mathbf{a}\cdot\mathbf{b} = \tfrac{1}{2}(\mathbf{a}\mathbf{b} + \mathbf{b}\mathbf{a})\;}$$

The **inner product** is the symmetric part of the geometric
product. Defining the antisymmetric part as

$$\boxed{\;\mathbf{a}\wedge\mathbf{b} := \tfrac{1}{2}(\mathbf{a}\mathbf{b} - \mathbf{b}\mathbf{a})\;}$$

we get the **fundamental identity**:

$$\boxed{\;\mathbf{a}\mathbf{b} = \mathbf{a}\cdot\mathbf{b} + \mathbf{a}\wedge\mathbf{b}\;}$$

### Two corollaries

**Parallel vectors anti/commute scalarly.** If $\mathbf{a}\parallel\mathbf{b}$,
then $\mathbf{a}\wedge\mathbf{b} = 0$ (no oriented area between
parallel vectors), so $\mathbf{a}\mathbf{b} = \mathbf{a}\cdot\mathbf{b}$
is a pure scalar — and $\mathbf{a}\mathbf{b} = \mathbf{b}\mathbf{a}$.

**Perpendicular vectors anti-commute.** If $\mathbf{a}\perp\mathbf{b}$,
then $\mathbf{a}\cdot\mathbf{b} = 0$, so $\mathbf{a}\mathbf{b} = \mathbf{a}\wedge\mathbf{b}$
is a pure bivector — and $\mathbf{a}\mathbf{b} = -\mathbf{b}\mathbf{a}$.

These two facts are the reason the sandwich product (next chapter)
implements reflections so cleanly.

### A 2D worked example

Take $\mathbf{a} = \mathbf{e}_1$, $\mathbf{b} = \mathbf{e}_1 + \mathbf{e}_2$.

$$\mathbf{a}\cdot\mathbf{b} = \mathbf{e}_1\cdot(\mathbf{e}_1+\mathbf{e}_2) = 1$$

$$\mathbf{a}\wedge\mathbf{b} = \mathbf{e}_1\wedge(\mathbf{e}_1+\mathbf{e}_2) = \mathbf{e}_1\wedge\mathbf{e}_2 = \mathbf{e}_{12}$$

(using $\mathbf{e}_1\wedge\mathbf{e}_1 = 0$.)

$$\mathbf{a}\mathbf{b} = 1 + \mathbf{e}_{12}$$

A scalar plus a bivector — a **mixed multivector**.

## In this book

- [Vectors and the Geometric Product](/geometric-algebra/foundations/vectors-and-the-geometric-product)
  — the same derivation with a slightly different framing.
- [Multivectors and Grades](/geometric-algebra/foundations/multivectors-and-grades)
  — extends to higher grades.

> :nerdygoose: The whole framework rests on the boxed identity
> $\mathbf{a}\mathbf{b} = \mathbf{a}\cdot\mathbf{b} + \mathbf{a}\wedge\mathbf{b}$.
> Memorize the boxed lines on this page; the rest of GA is
> consequences.
