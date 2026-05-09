---
sidebar_position: 3
title: "Episode 1 — Vector Division"
---

# Episode 1 — Vector Division

> Watch on [YouTube](https://www.youtube.com/watch?v=YVtPin_Re6Y).

<iframe width="560" height="315" src="https://www.youtube.com/embed/YVtPin_Re6Y" title="Vector division" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## What it covers

Mathoma argues that any operation worth calling "multiplication"
should admit an inverse. The dot product fails this — there is no
$\mathbf{x}$ such that $\mathbf{a}\cdot\mathbf{x} = 1$ in the
vector space (the dot product produces a scalar, not a vector).
The cross product also fails — $\mathbf{a}\times\mathbf{x}$ is
always orthogonal to $\mathbf{a}$, so the equation
$\mathbf{a}\times\mathbf{x} = \mathbf{a}$ has no solution.

The geometric product *does* admit an inverse.

### Definition

For a nonzero vector $\mathbf{a}$, define

$$\boxed{\;\mathbf{a}^{-1} := \frac{\mathbf{a}}{|\mathbf{a}|^2}\;}$$

By the contraction rule $\mathbf{a}^2 = |\mathbf{a}|^2$, we have

$$\mathbf{a}\,\mathbf{a}^{-1} = \mathbf{a}\,\frac{\mathbf{a}}{|\mathbf{a}|^2} = \frac{\mathbf{a}^2}{|\mathbf{a}|^2} = \frac{|\mathbf{a}|^2}{|\mathbf{a}|^2} = 1$$

and similarly $\mathbf{a}^{-1}\mathbf{a} = 1$. So every nonzero
vector has a two-sided multiplicative inverse.

### Consequences

Vector equations now solve algebraically. From
$\mathbf{a}\mathbf{x} = \mathbf{b}$ we get
$\mathbf{x} = \mathbf{a}^{-1}\mathbf{b}$. The same applies for
right-multiplication: $\mathbf{x}\mathbf{a} = \mathbf{b} \Rightarrow
\mathbf{x} = \mathbf{b}\mathbf{a}^{-1}$. Note that
$\mathbf{a}^{-1}\mathbf{b} \ne \mathbf{b}\mathbf{a}^{-1}$ in
general — the geometric product is **not** commutative.

### Why this matters geometrically

Multiplying by $\mathbf{a}^{-1}$ is the algebraic step that lets
you *project* onto $\mathbf{a}$:

$$\text{proj}_{\mathbf{a}}(\mathbf{b}) = (\mathbf{b}\cdot\mathbf{a})\,\mathbf{a}^{-1} = \frac{\mathbf{b}\cdot\mathbf{a}}{|\mathbf{a}|^2}\,\mathbf{a}$$

The standard projection formula falls out as a one-liner once
$\mathbf{a}^{-1}$ exists. The same trick handles **rejection**:

$$\text{rej}_{\mathbf{a}}(\mathbf{b}) = (\mathbf{b}\wedge\mathbf{a})\,\mathbf{a}^{-1}$$

Together they sum to $\mathbf{b}$ via the fundamental identity
$\mathbf{b}\mathbf{a} = \mathbf{b}\cdot\mathbf{a} + \mathbf{b}\wedge\mathbf{a}$.

## In this book

- [Vectors and the Geometric Product](/geometric-algebra/foundations/vectors-and-the-geometric-product)
  — the contraction rule axiom from which $\mathbf{a}^{-1}$ derives.
- [Projections & Rejections](/geometric-algebra/geometry/projections-and-rejections)
  — the inverse used in working formulas.

> :surprisedgoose: The standard projection formula isn't ad hoc.
> It's just $(\mathbf{b}\cdot\mathbf{a})\mathbf{a}^{-1}$ with the
> inverse made explicit. Linear algebra hides the inverse because
> "vectors don't have inverses." GA has them, and the formulas
> simplify accordingly.
