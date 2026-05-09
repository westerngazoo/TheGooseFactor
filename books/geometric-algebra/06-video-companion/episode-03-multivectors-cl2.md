---
sidebar_position: 5
title: "Episode 3 — Multivectors in Cl(2)"
---

# Episode 3 — Multivectors in Cl(2)

> Watch on [YouTube](https://www.youtube.com/watch?v=oHqkMPuBwh0).

<iframe width="560" height="315" src="https://www.youtube.com/embed/oHqkMPuBwh0" title="Multivectors in Cl(2)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## What it covers

Specializes the general theory to the geometric algebra of the
2D Euclidean plane, denoted $\text{Cl}(2)$ or $G(\mathbb{R}^2)$.

### The basis

Pick orthonormal basis vectors $\mathbf{e}_1, \mathbf{e}_2$
satisfying

$$\mathbf{e}_1^2 = \mathbf{e}_2^2 = 1, \qquad \mathbf{e}_1\mathbf{e}_2 = -\mathbf{e}_2\mathbf{e}_1$$

The full algebra has **four** basis blades, one per grade:

| Grade | Basis | Dim |
|---|---|---|
| 0 (scalar) | $1$ | 1 |
| 1 (vector) | $\mathbf{e}_1, \mathbf{e}_2$ | 2 |
| 2 (bivector) | $\mathbf{e}_{12} = \mathbf{e}_1\mathbf{e}_2$ | 1 |

Total dimension: $2^2 = 4$. The general multivector is

$$M = \alpha + \beta_1\mathbf{e}_1 + \beta_2\mathbf{e}_2 + \gamma\,\mathbf{e}_{12}$$

four real coefficients.

### The pseudoscalar squares to $-1$

Compute $\mathbf{e}_{12}^2$:

$$\mathbf{e}_{12}^2 = (\mathbf{e}_1\mathbf{e}_2)(\mathbf{e}_1\mathbf{e}_2) = \mathbf{e}_1\mathbf{e}_2\mathbf{e}_1\mathbf{e}_2 = -\mathbf{e}_1\mathbf{e}_1\mathbf{e}_2\mathbf{e}_2 = -|\mathbf{e}_1|^2 |\mathbf{e}_2|^2 = -1$$

(used anti-commutativity to swap the middle pair, picking up a minus sign.)

The pseudoscalar $I = \mathbf{e}_{12}$ satisfies $I^2 = -1$ —
algebraically identical to the imaginary unit. This is the seed
fact behind episode 4.

### Multiplication table

| × | 1 | $\mathbf{e}_1$ | $\mathbf{e}_2$ | $\mathbf{e}_{12}$ |
|---|---|---|---|---|
| **1** | 1 | $\mathbf{e}_1$ | $\mathbf{e}_2$ | $\mathbf{e}_{12}$ |
| **$\mathbf{e}_1$** | $\mathbf{e}_1$ | 1 | $\mathbf{e}_{12}$ | $\mathbf{e}_2$ |
| **$\mathbf{e}_2$** | $\mathbf{e}_2$ | $-\mathbf{e}_{12}$ | 1 | $-\mathbf{e}_1$ |
| **$\mathbf{e}_{12}$** | $\mathbf{e}_{12}$ | $-\mathbf{e}_2$ | $\mathbf{e}_1$ | $-1$ |

Use this to multiply any two general multivectors by distributing
over the basis.

### Worked example

Multiply $M_1 = 2 + 3\mathbf{e}_1$ and $M_2 = \mathbf{e}_2 + \mathbf{e}_{12}$:

$$\begin{aligned}
M_1 M_2 &= 2(\mathbf{e}_2 + \mathbf{e}_{12}) + 3\mathbf{e}_1(\mathbf{e}_2 + \mathbf{e}_{12}) \\
        &= 2\mathbf{e}_2 + 2\mathbf{e}_{12} + 3\mathbf{e}_1\mathbf{e}_2 + 3\mathbf{e}_1\mathbf{e}_{12} \\
        &= 2\mathbf{e}_2 + 2\mathbf{e}_{12} + 3\mathbf{e}_{12} + 3\mathbf{e}_2 \\
        &= 5\mathbf{e}_2 + 5\mathbf{e}_{12}
\end{aligned}$$

(used $\mathbf{e}_1\mathbf{e}_{12} = \mathbf{e}_2$ from the table.)

The result has only grade-1 and grade-2 components — the scalar
component happens to be zero.

### Why $\text{Cl}(2)$ first

Two reasons:

1. **Small enough to compute by hand.** Four basis elements,
   $4\times 4$ multiplication table.
2. **Contains complex numbers as a subalgebra.** The even-grade
   elements $\{1, \mathbf{e}_{12}\}$ form a closed sub-ring
   isomorphic to $\mathbb{C}$. Episode 4 makes that precise.

## In this book

- [Multivectors and Grades](/geometric-algebra/foundations/multivectors-and-grades)
- [Blades as Geometric Objects](/geometric-algebra/geometry/blades-as-geometry)

> :weightliftinggoose: The multiplication table is the muscle
> memory of GA. Drill it. By the time you reach
> $\text{Cl}(3)$ in the next videos, the table is $8\times 8$
> — but built from the same basis-blade rules as $\text{Cl}(2)$.
