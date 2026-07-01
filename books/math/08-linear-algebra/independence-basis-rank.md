---
sidebar_position: 2
sidebar_label: "Independence, Basis & Rank"
title: "Linear Independence, Basis, and Rank"
---

# Linear Independence, Basis, and Rank

These three ideas pin down "how many independent directions" a set of vectors or a matrix really has. Dimension, rank, and the solvability of linear systems all flow from here.

## Linear Independence

Vectors $\mathbf{v}_1, \dots, \mathbf{v}_k$ are **linearly independent** if the only way to combine them to zero is the trivial way:

```math
c_1 \mathbf{v}_1 + \cdots + c_k \mathbf{v}_k = \mathbf{0} \implies c_1 = \cdots = c_k = 0.
```

If some nontrivial combination gives $\mathbf{0}$, they are **linearly dependent** — at least one vector is a combination of the others, i.e. redundant.

> :mathgoose: Independence means *no redundancy*: no vector lives in the span of the rest. Dependence means at least one is "free information" — you could delete it without shrinking the span. This is the precise version of "how many vectors actually pull in different directions."

**Example.** $(1,0), (0,1), (1,1)$ in $\mathbb{R}^2$ are dependent: $(1,1) = (1,0) + (0,1)$. Any 3 vectors in $\mathbb{R}^2$ must be dependent.

## Basis and Dimension

A **basis** of a vector space $V$ is a set of vectors that is:

1. **Linearly independent** (no redundancy), and
2. **Spanning** ($\operatorname{span} = V$, enough to build everything).

Every vector in $V$ has a **unique** representation as a combination of basis vectors — that uniqueness is exactly what independence buys you.

The **dimension** $\dim V$ is the number of vectors in any basis (all bases have the same size).

> :nerdygoose: A basis is the *minimal complete coordinate system*: just enough vectors to address every point, with none to spare. Choosing a good basis is the whole game in applications — the Fourier basis diagonalizes convolution, the eigenbasis diagonalizes a matrix, the PCA basis aligns with the directions of greatest variance. Same space, smarter coordinates.

The **standard basis** of $\mathbb{R}^n$ is $\mathbf{e}_1, \dots, \mathbf{e}_n$ (the columns of $I$).

## Rank

The **rank** of a matrix $A$ is the dimension of its **column space** — the number of linearly independent columns. Equivalently (a small miracle):

> :surprisedgoose: **Row rank equals column rank.** The number of independent rows always equals the number of independent columns, even for a non-square matrix. There is no obvious reason rows and columns should agree — they live in different spaces ($\mathbb{R}^m$ vs $\mathbb{R}^n$) — yet they do. This is why we say "the rank" without specifying which.

Computationally, rank = number of **pivots** after Gaussian elimination to row-echelon form.

- $A$ has **full column rank** if $\operatorname{rank} = n$ (columns independent ⇒ at most one solution to $A\mathbf{x}=\mathbf{b}$).
- $A$ has **full row rank** if $\operatorname{rank} = m$ (rows independent ⇒ at least one solution always).
- A square matrix is **invertible iff** it has full rank $n$.

## The Rank-Nullity Theorem

The **null space** (kernel) of $A$ is the set of solutions to $A\mathbf{x} = \mathbf{0}$; its dimension is the **nullity**. The fundamental conservation law:

```math
\operatorname{rank}(A) + \operatorname{nullity}(A) = n \quad (\text{number of columns}).
```

> :happygoose: Read it as a budget. Each of the $n$ input dimensions either survives the transformation (contributing to rank, the image) or gets **crushed to zero** (contributing to nullity, the kernel). Nothing is lost or created — the input dimensions are exactly partitioned. This one equation explains why "more unknowns than independent equations" forces infinitely many solutions: the leftover dimensions live in the null space.

**Example.** A $3\times 5$ matrix with rank $3$ has nullity $5 - 3 = 2$: the solution set of $A\mathbf{x}=\mathbf{0}$ is a 2-dimensional subspace of $\mathbb{R}^5$.

## Connection to Solving Systems

For $A\mathbf{x} = \mathbf{b}$:

| Condition | Solutions |
|---|---|
| $\mathbf{b} \notin$ column space | none (inconsistent) |
| $\mathbf{b} \in$ column space, nullity $= 0$ | exactly one |
| $\mathbf{b} \in$ column space, nullity $> 0$ | infinitely many |

If $\mathbf{x}_p$ is any particular solution, the **complete** solution set is $\mathbf{x}_p + \text{null space}$ — a particular solution plus everything that maps to zero.

> :angrygoose: A matrix can be "wide" ($n > m$, more columns than rows) and still fail to be solvable for some $\mathbf{b}$ if it's rank-deficient — and a "tall" matrix can have a unique solution. **Shape does not determine rank.** Always reason from rank and the rank-nullity budget, not from the dimensions of the matrix.

## Algorithmic Touchpoints

- **Gaussian elimination** computes rank, detects dependence, and reveals the null space basis (free variables).
- **Low-rank approximation** (SVD) compresses data by keeping only the dominant independent directions — image compression, recommender systems.
- **Dimensionality reduction** (PCA) finds the best $k$-dimensional basis capturing the variance.
- **Solvability checks**: comparing $\operatorname{rank}(A)$ to $\operatorname{rank}([A\mid \mathbf{b}])$ decides consistency.

## Quick Sanity Checks

- More than $n$ vectors in $\mathbb{R}^n$ are *always* dependent.
- $\operatorname{rank}(A) \le \min(m, n)$ always; equality means full rank.
- Rank-nullity must balance: $\operatorname{rank} + \operatorname{nullity} = $ number of columns.
- A square matrix is invertible $\iff$ rank $= n$ $\iff$ nullity $= 0$ $\iff$ determinant $\neq 0$.
