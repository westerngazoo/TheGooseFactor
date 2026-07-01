---
sidebar_position: 1
sidebar_label: "Vectors & Matrices"
title: "Vectors, Matrices, and Linear Maps"
---

# Vectors, Matrices, and Linear Maps

Linear algebra is the mathematics of *linear* structure — and almost everything is locally linear. Vectors are the objects, matrices are the transformations, and the central insight is that **a matrix is a linear map** written in coordinates.

## Vectors

A **vector** in $\mathbb{R}^n$ is an ordered list of $n$ real numbers. Two operations define the structure:

```math
\mathbf{u} + \mathbf{v} = (u_1 + v_1, \dots, u_n + v_n), \qquad
c\,\mathbf{v} = (c v_1, \dots, c v_n).
```

A **linear combination** of vectors $\mathbf{v}_1, \dots, \mathbf{v}_k$ is any $c_1 \mathbf{v}_1 + \cdots + c_k \mathbf{v}_k$. The set of *all* linear combinations is their **span**.

> :mathgoose: A **vector space** is any set closed under these two operations (with the usual axioms). The payoff is abstraction: $\mathbb{R}^n$, polynomials, matrices, and even functions are all vector spaces, so one theory covers them all. "Linear combination" and "span" are the two words you'll use most — everything else builds on them.

## Inner Product, Norm, Orthogonality

The **dot (inner) product** measures alignment:

```math
\mathbf{u} \cdot \mathbf{v} = \sum_{i=1}^n u_i v_i = \|\mathbf{u}\|\,\|\mathbf{v}\|\cos\theta.
```

The **norm** (length) is $\|\mathbf{v}\| = \sqrt{\mathbf{v}\cdot\mathbf{v}}$. Two vectors are **orthogonal** when $\mathbf{u}\cdot\mathbf{v} = 0$ (perpendicular, $\cos\theta = 0$).

> :nerdygoose: The dot product is the bridge between *algebra* (a sum of products) and *geometry* (lengths and angles). Orthogonality — dot product zero — is the single most useful relationship in applied linear algebra: it makes projections clean, decorrelates data (PCA), and turns messy systems into independent pieces.

## Matrices as Linear Maps

An $m \times n$ matrix $A$ multiplies an $n$-vector to produce an $m$-vector:

```math
(A\mathbf{x})_i = \sum_{j=1}^{n} A_{ij} x_j.
```

The crucial reinterpretation:

```math
A\mathbf{x} = x_1 \mathbf{a}_1 + x_2 \mathbf{a}_2 + \cdots + x_n \mathbf{a}_n,
```

where $\mathbf{a}_j$ is the $j$-th **column** of $A$. So $A\mathbf{x}$ is a **linear combination of the columns of $A$**, weighted by the entries of $\mathbf{x}$.

> :happygoose: This "columns" view is the single most clarifying idea in the subject. Solving $A\mathbf{x} = \mathbf{b}$ asks: *which combination of the columns produces $\mathbf{b}$?* The system is solvable exactly when $\mathbf{b}$ lies in the span of the columns (the **column space**). Memorize this and half of linear algebra becomes obvious.

A matrix represents a **linear transformation** $T : \mathbb{R}^n \to \mathbb{R}^m$, meaning

```math
T(\mathbf{u} + \mathbf{v}) = T(\mathbf{u}) + T(\mathbf{v}), \qquad T(c\mathbf{v}) = c\,T(\mathbf{v}).
```

Every linear map between finite-dimensional spaces *is* a matrix once you fix bases.

## Matrix Multiplication = Composition

The product $AB$ corresponds to applying $B$ then $A$:

```math
(AB)\mathbf{x} = A(B\mathbf{x}), \qquad (AB)_{ij} = \sum_k A_{ik} B_{kj}.
```

This is why matrix multiplication is **associative** ($(AB)C = A(BC)$, composition of functions) but **not commutative** ($AB \neq BA$ in general — the order of transformations matters).

> :angrygoose: $AB \neq BA$. Rotating then scaling is not the same as scaling then rotating in general. Treating matrices like numbers — reordering factors, "cancelling" — is a top source of bugs and false proofs. Also, $AB = 0$ does **not** imply $A = 0$ or $B = 0$; matrices have zero divisors.

## Special Matrices

| Matrix | Definition | Role |
|---|---|---|
| Identity $I$ | $1$s on diagonal | $I\mathbf{x} = \mathbf{x}$ |
| Diagonal | nonzero only on diagonal | scales each axis |
| Transpose $A^\top$ | $(A^\top)_{ij} = A_{ji}$ | swaps rows/cols |
| Symmetric | $A = A^\top$ | real eigenvalues, orthogonal eigenvectors |
| Orthogonal | $Q^\top Q = I$ | preserves lengths & angles |
| Inverse $A^{-1}$ | $A A^{-1} = I$ | undoes $A$ (square, full rank only) |

> :surprisedgoose: An **orthogonal** matrix ($Q^\top Q = I$) is a rigid motion — rotation or reflection — that preserves every length and angle, and its inverse is just its transpose. That $Q^{-1} = Q^\top$ identity is computational gold: no inversion needed, perfect numerical stability. It's why orthogonal transforms (QR, FFT, rotations in graphics) are everywhere.

## Solving Linear Systems

$A\mathbf{x} = \mathbf{b}$ is solved by **Gaussian elimination**: row-reduce $[A \mid \mathbf{b}]$ to row-echelon form, then back-substitute. The system has:

- **No solution** if $\mathbf{b}$ is outside the column space (an inconsistent row $0 = c$, $c\neq 0$).
- **A unique solution** if $A$ has full column rank.
- **Infinitely many** if there are free variables (rank $<$ number of unknowns).

(Rank, the precise tool for classifying these cases, is the next chapter.)

## Algorithmic Touchpoints

- **Gaussian elimination** ($O(n^3)$) solves systems, inverts matrices, and computes determinants and rank.
- **Graphics**: every rotate/scale/translate is a matrix; composing transforms is matrix multiplication.
- **PageRank, Markov chains**: a step is multiplication by a transition matrix; the stationary state is a fixed point.
- **Neural network layers** are affine maps $\mathbf{x} \mapsto W\mathbf{x} + \mathbf{b}$ followed by nonlinearity.
- **Dot products** drive similarity search, attention scores, and projections.

## Quick Sanity Checks

- $A\mathbf{x}$ requires `cols(A) == len(x)`; the result has length `rows(A)`. Dimension mismatches are the #1 bug.
- $A\mathbf{x}$ is always a combination of $A$'s columns — if $\mathbf{b}$ isn't in their span, no solution exists.
- Check $AB \neq BA$ on a $2\times 2$ example to keep non-commutativity reflexive.
- For an orthogonal $Q$, verify $Q^\top Q = I$ and that $\|Q\mathbf{x}\| = \|\mathbf{x}\|$.
