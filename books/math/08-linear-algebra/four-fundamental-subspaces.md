---
sidebar_position: 3
sidebar_label: "Four Fundamental Subspaces"
title: "The Four Fundamental Subspaces"
---

# The Four Fundamental Subspaces

Every $m \times n$ matrix $A$ defines four subspaces whose dimensions and orthogonality relationships capture *everything* about the linear map. Gilbert Strang calls this the heart of linear algebra — and he's right.

## The Four Subspaces

For an $m \times n$ matrix $A$ of rank $r$:

| Subspace | Definition | Lives in | Dimension |
|---|---|---|---|
| **Column space** $C(A)$ | span of columns; all $A\mathbf{x}$ | $\mathbb{R}^m$ | $r$ |
| **Null space** $N(A)$ | solutions of $A\mathbf{x} = \mathbf{0}$ | $\mathbb{R}^n$ | $n - r$ |
| **Row space** $C(A^\top)$ | span of rows | $\mathbb{R}^n$ | $r$ |
| **Left null space** $N(A^\top)$ | solutions of $A^\top \mathbf{y} = \mathbf{0}$ | $\mathbb{R}^m$ | $m - r$ |

The column and row spaces both have dimension $r$ — that's row rank = column rank restated. The two null spaces account for the leftover dimensions via rank-nullity.

> :mathgoose: Two spaces live in the **input** space $\mathbb{R}^n$ (row space and null space) and two live in the **output** space $\mathbb{R}^m$ (column space and left null space). The matrix maps inputs to outputs, and these four spaces describe exactly what gets sent where — what's hit (column space), what's missed, and what's annihilated (null space).

## The Orthogonality Relationships

The four subspaces pair up into orthogonal complements:

```math
N(A) \perp C(A^\top) \quad \text{in } \mathbb{R}^n, \qquad
N(A^\top) \perp C(A) \quad \text{in } \mathbb{R}^m.
```

That is: **the null space is the orthogonal complement of the row space**, and **the left null space is the orthogonal complement of the column space.**

> :surprisedgoose: Why is $N(A) \perp C(A^\top)$? Because $A\mathbf{x} = \mathbf{0}$ means *every row of $A$ dotted with $\mathbf{x}$ is zero* — that's literally the statement that $\mathbf{x}$ is orthogonal to every row. The null space and row space don't just have complementary dimensions ($r$ and $n - r$); they sit at a perfect right angle and **together fill all of $\mathbb{R}^n$**. The same logic, applied to $A^\top$, handles the output side.

## The Big Picture

Putting dimensions and orthogonality together: $\mathbb{R}^n$ splits as

```math
\mathbb{R}^n = C(A^\top) \oplus N(A), \qquad \dim = r + (n - r) = n,
```

and $\mathbb{R}^m$ splits as

```math
\mathbb{R}^m = C(A) \oplus N(A^\top), \qquad \dim = r + (m - r) = m.
```

The map $A$ takes the row space *bijectively* onto the column space (both dimension $r$), and sends the null space to zero.

> :happygoose: Here's the punchline that powers least squares (next chapter): $A$ is invertible **when restricted to the row space**. Any input $\mathbf{x}$ splits into a row-space part (which $A$ maps faithfully) and a null-space part (which $A$ erases). So the "useful" content of $\mathbf{x}$ lives entirely in the row space — and that's the part least squares recovers.

## Worked Example

Take

```math
A = \begin{pmatrix} 1 & 2 & 3 \\ 2 & 4 & 6 \end{pmatrix}.
```

Row 2 is $2\times$ row 1, so rank $r = 1$.

- **Column space** $C(A)$: spanned by $(1,2)^\top$ — a line in $\mathbb{R}^2$, dimension $1$.
- **Left null space** $N(A^\top)$: vectors $\mathbf{y}$ with $y_1 + 2y_2 = 0$, e.g. $(2,-1)^\top$ — dimension $m - r = 1$, and orthogonal to $(1,2)$. ✓
- **Row space** $C(A^\top)$: spanned by $(1,2,3)$ — a line in $\mathbb{R}^3$, dimension $1$.
- **Null space** $N(A)$: solutions of $x_1 + 2x_2 + 3x_3 = 0$ — a plane in $\mathbb{R}^3$, dimension $n - r = 2$, orthogonal to $(1,2,3)$. ✓

Dimensions check: input side $1 + 2 = 3 = n$; output side $1 + 1 = 2 = m$.

> :angrygoose: The four subspaces live in **two different ambient spaces** — don't try to compare a row-space vector ($\mathbb{R}^n$) with a column-space vector ($\mathbb{R}^m$) when $m \neq n$; they can't even be added. Orthogonality only holds *within* the same ambient space: row space ⟂ null space in $\mathbb{R}^n$, column space ⟂ left null space in $\mathbb{R}^m$. Mixing them is a category error.

## Algorithmic Touchpoints

- **Least squares** projects $\mathbf{b}$ onto the column space; the residual lands in the left null space (next chapter).
- **Solvability**: $A\mathbf{x} = \mathbf{b}$ is consistent iff $\mathbf{b} \in C(A)$, equivalently iff $\mathbf{b} \perp N(A^\top)$.
- **SVD** gives orthonormal bases for all four subspaces at once — the cleanest computational handle.
- **PCA / data analysis**: the column space is the span of your features; the null space encodes exact linear dependencies among them.

## Quick Sanity Checks

- Dimensions: $C(A)$ and $C(A^\top)$ are both $r$; $N(A)$ is $n-r$; $N(A^\top)$ is $m-r$.
- Input side sums to $n$, output side sums to $m$ — a fast consistency check.
- A null-space vector dotted with any row gives $0$; a left-null vector dotted with any column gives $0$.
- $\mathbf{b}$ is reachable ($A\mathbf{x}=\mathbf{b}$ solvable) exactly when $\mathbf{b}$ is orthogonal to the left null space.
