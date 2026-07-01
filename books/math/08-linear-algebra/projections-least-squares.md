---
sidebar_position: 4
sidebar_label: "Projections & Least Squares"
title: "Projections and Least Squares"
---

# Projections and Least Squares

When a system $A\mathbf{x} = \mathbf{b}$ has no solution — too many equations, noisy data — you settle for the *best* approximation. The tool is **orthogonal projection**, and the result is **least squares**, the workhorse of regression and data fitting.

## Projection Onto a Line

The projection of $\mathbf{b}$ onto the line through $\mathbf{a}$ is the closest point on that line:

```math
\operatorname{proj}_{\mathbf{a}} \mathbf{b} = \frac{\mathbf{a}\cdot\mathbf{b}}{\mathbf{a}\cdot\mathbf{a}}\,\mathbf{a}.
```

The scalar $\frac{\mathbf{a}\cdot\mathbf{b}}{\mathbf{a}\cdot\mathbf{a}}$ is how far along $\mathbf{a}$ to go. The leftover $\mathbf{e} = \mathbf{b} - \operatorname{proj}_{\mathbf{a}}\mathbf{b}$ is **orthogonal** to $\mathbf{a}$.

> :mathgoose: Projection answers "what part of $\mathbf{b}$ points along $\mathbf{a}$?" The error $\mathbf{e}$ is *perpendicular* to $\mathbf{a}$ — and that perpendicularity is not a coincidence, it's the definition of "closest." The shortest path from a point to a line is the perpendicular. Every least-squares formula below is this one fact in higher dimensions.

## Projection Onto a Subspace

To project $\mathbf{b}$ onto the column space of $A$ (columns assumed independent), find $\hat{\mathbf{x}}$ so that the error $\mathbf{b} - A\hat{\mathbf{x}}$ is orthogonal to every column of $A$:

```math
A^\top(\mathbf{b} - A\hat{\mathbf{x}}) = \mathbf{0}.
```

Rearranging gives the **normal equations**:

```math
A^\top A\, \hat{\mathbf{x}} = A^\top \mathbf{b}.
```

When $A$ has full column rank, $A^\top A$ is invertible and

```math
\hat{\mathbf{x}} = (A^\top A)^{-1} A^\top \mathbf{b}, \qquad
\mathbf{p} = A\hat{\mathbf{x}} = \underbrace{A(A^\top A)^{-1}A^\top}_{P}\,\mathbf{b}.
```

The matrix $P = A(A^\top A)^{-1}A^\top$ is the **projection matrix** onto $C(A)$.

> :nerdygoose: A projection matrix is **idempotent and symmetric**: $P^2 = P$ (projecting twice changes nothing — you're already there) and $P^\top = P$. These two properties *characterize* orthogonal projections. The complementary matrix $I - P$ projects onto the orthogonal complement (the left null space), sending $\mathbf{b}$ to the residual.

## Least Squares

The system $A\mathbf{x} = \mathbf{b}$ may have no exact solution (when $\mathbf{b} \notin C(A)$). **Least squares** finds the $\hat{\mathbf{x}}$ minimizing the squared error:

```math
\hat{\mathbf{x}} = \arg\min_{\mathbf{x}} \|A\mathbf{x} - \mathbf{b}\|^2.
```

The minimizer is exactly the solution of the normal equations — because the closest reachable point $A\hat{\mathbf{x}}$ is the projection of $\mathbf{b}$ onto $C(A)$.

> :happygoose: This is the whole idea of regression in one breath: **you can't hit $\mathbf{b}$, so hit the closest point you can reach** — its projection onto the column space. "Best fit" = "smallest perpendicular error" = "projection." Linear regression, polynomial fitting, and the general linear model are all this single picture with different choices of columns.

## Worked Example — fitting a line

Fit $y = c_0 + c_1 t$ to data points $(t_i, y_i)$. Stack them:

```math
A = \begin{pmatrix} 1 & t_1 \\ 1 & t_2 \\ \vdots & \vdots \\ 1 & t_n \end{pmatrix},
\quad
\mathbf{x} = \begin{pmatrix} c_0 \\ c_1 \end{pmatrix},
\quad
\mathbf{b} = \begin{pmatrix} y_1 \\ \vdots \\ y_n \end{pmatrix}.
```

Solve $A^\top A \hat{\mathbf{x}} = A^\top \mathbf{b}$. Here $A^\top A$ is the $2\times2$ matrix of $\sum 1, \sum t_i, \sum t_i^2$, and the solution gives the familiar slope/intercept formulas of ordinary least squares.

> :angrygoose: The normal equations are mathematically clean but **numerically dangerous**: forming $A^\top A$ squares the condition number, amplifying round-off. For real computation, use a **QR factorization** ($A = QR \Rightarrow R\hat{\mathbf{x}} = Q^\top\mathbf{b}$) or the **SVD** instead of literally inverting $A^\top A$. Libraries (`numpy.linalg.lstsq`, LAPACK) do this for you — don't hand-roll $(A^\top A)^{-1}$.

## Orthonormal Bases and Gram–Schmidt

Projections become trivial when the basis is **orthonormal** (mutually orthogonal unit vectors $\mathbf{q}_i$): the projection coefficients are just dot products, and $A^\top A = I$.

```math
\operatorname{proj}_{C(Q)}\mathbf{b} = \sum_i (\mathbf{q}_i \cdot \mathbf{b})\,\mathbf{q}_i = QQ^\top \mathbf{b}.
```

The **Gram–Schmidt** process turns any independent set into an orthonormal one, producing the **QR factorization** $A = QR$ with $Q$ orthonormal and $R$ upper-triangular.

> :surprisedgoose: Once your basis is orthonormal, the dreaded matrix inverse vanishes — projection is *just dot products*. This is the entire reason Fourier series, wavelets, and PCA prefer orthonormal bases: every coefficient is an independent inner product, computable without solving a system. Orthogonality decouples.

## Algorithmic Touchpoints

- **Linear / polynomial regression** is least squares; ridge regression adds $\lambda I$ to $A^\top A$ for stability.
- **QR and SVD** are the numerically sound ways to solve least squares and compute projections.
- **Gram–Schmidt** orthonormalizes bases; the QR factorization it yields also drives eigenvalue algorithms.
- **Signal processing**: projecting onto an orthonormal (Fourier/wavelet) basis is computing coefficients — the FFT does it fast.
- **Recommender systems / PCA**: low-rank projections capture dominant structure in data.

## Quick Sanity Checks

- The residual $\mathbf{b} - A\hat{\mathbf{x}}$ must be orthogonal to every column of $A$: $A^\top(\mathbf{b}-A\hat{\mathbf{x}}) = \mathbf{0}$.
- A projection matrix satisfies $P^2 = P$ and $P^\top = P$; test on a small example.
- If $\mathbf{b}$ already lies in $C(A)$, least squares returns the exact solution with zero residual.
- For orthonormal $Q$, $Q^\top Q = I$ — if not, your Gram–Schmidt has a bug.
