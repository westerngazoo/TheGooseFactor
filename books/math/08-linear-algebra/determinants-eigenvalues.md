---
sidebar_position: 5
sidebar_label: "Determinants & Eigenvalues"
title: "Determinants, Eigenvalues, and the Spectral Glimpse"
---

# Determinants, Eigenvalues, and the Spectral Glimpse

Eigenvalues are where linear algebra pays off: they reveal the "natural axes" of a transformation, diagonalize matrices, and govern everything from stability of dynamical systems to PageRank. Determinants are the scalar that signals invertibility and measures volume scaling.

## Determinants

The **determinant** $\det(A)$ of a square matrix is a single number with a geometric meaning: the **signed volume scaling factor** of the linear map.

- $2\times 2$: $\det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc$ (signed area of the image of the unit square).
- A negative determinant means orientation is flipped (a reflection).

Key properties:

```math
\det(AB) = \det(A)\det(B), \quad \det(A^\top) = \det(A), \quad \det(A^{-1}) = \frac{1}{\det(A)}.
```

> :mathgoose: The single most important fact about the determinant: **$A$ is invertible $\iff \det(A) \neq 0$.** Geometrically, $\det(A) = 0$ means the map squashes space into a lower dimension (volume → 0), collapsing the column space and creating a nonzero null space. Determinant zero = information lost = not invertible.

> :angrygoose: Do **not** compute large determinants by cofactor expansion — it's $O(n!)$, catastrophic beyond tiny matrices. Use the determinant as a *byproduct of Gaussian elimination*: the product of the pivots (times $(-1)^{\#\text{row swaps}}$), which is $O(n^3)$. And avoid using $\det$ as an invertibility test in floating point — it scales badly; check rank or condition number instead.

## Eigenvalues and Eigenvectors

A nonzero vector $\mathbf{v}$ is an **eigenvector** of $A$ with **eigenvalue** $\lambda$ if $A$ merely *stretches* it:

```math
A\mathbf{v} = \lambda \mathbf{v}, \qquad \mathbf{v} \neq \mathbf{0}.
```

The transformation doesn't rotate $\mathbf{v}$ — it only scales it by $\lambda$. These are the "natural axes" of $A$.

> :happygoose: Eigenvectors are the directions the matrix leaves *pointing the same way*. Along an eigenvector, a messy matrix acts like simple scalar multiplication. Find all of them and you've found a coordinate system where $A$ is **diagonal** — and a diagonal matrix is trivial to raise to powers, exponentiate, or analyze. That decoupling is the entire point.

### Finding eigenvalues

$A\mathbf{v} = \lambda\mathbf{v}$ rearranges to $(A - \lambda I)\mathbf{v} = \mathbf{0}$, which has a nonzero solution iff $A - \lambda I$ is singular:

```math
\det(A - \lambda I) = 0 \quad \text{(the characteristic equation).}
```

This is a degree-$n$ polynomial in $\lambda$; its roots are the eigenvalues. Two identities make great sanity checks:

```math
\sum_i \lambda_i = \operatorname{trace}(A), \qquad \prod_i \lambda_i = \det(A).
```

**Example.** $A = \begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}$: $\det(A - \lambda I) = (2-\lambda)^2 - 1 = 0 \Rightarrow \lambda = 1, 3$. Trace $= 4 = 1+3$ ✓, det $= 3 = 1\cdot 3$ ✓. Eigenvectors $(1,-1)$ and $(1,1)$.

## Diagonalization

If $A$ ($n\times n$) has $n$ linearly independent eigenvectors, form $P$ from them and $D = \operatorname{diag}(\lambda_1,\dots,\lambda_n)$:

```math
A = PDP^{-1}.
```

Then powers are easy:

```math
A^k = P D^k P^{-1},
```

since $D^k$ just raises each $\lambda_i$ to the $k$. This is *exactly* the trick behind fast linear-recurrence evaluation and the long-run behavior of Markov chains.

> :surprisedgoose: $A^k = PD^kP^{-1}$ turns "multiply a matrix by itself $k$ times" into "raise scalars to the $k$." For a Markov chain, the eigenvalue $\lambda = 1$ gives the stationary distribution, and the *second-largest* $|\lambda|$ controls how fast you converge to it (the spectral gap / mixing time). The whole long-term story is in the eigenvalues.

## The Spectral Theorem (the glimpse)

> :nerdygoose: **Spectral theorem**: every real **symmetric** matrix ($A = A^\top$) has *real* eigenvalues and an *orthonormal* basis of eigenvectors. So $A = Q\Lambda Q^\top$ with $Q$ orthogonal. Symmetric matrices — covariance matrices, graph Laplacians, Hessians — are the best-behaved objects in linear algebra: no complex eigenvalues, perpendicular eigen-axes, and a clean decomposition. This is the theoretical bedrock under PCA and the SVD.

The **singular value decomposition** $A = U\Sigma V^\top$ extends this to *any* matrix (even non-square) and is the most important factorization in applied linear algebra.

## Applications

- **PageRank**: the ranking vector is the dominant eigenvector of the web's transition matrix.
- **PCA**: principal components are eigenvectors of the covariance matrix; eigenvalues are the variances captured.
- **Markov chains**: stationary distribution = eigenvector for $\lambda = 1$; mixing rate = spectral gap.
- **Dynamical systems / ODEs**: stability is decided by the signs (or moduli) of eigenvalues.
- **Vibration & graph theory**: eigenvalues of the Laplacian reveal connectivity, clusters, and resonant modes.

## Algorithmic Touchpoints

- **Power iteration** finds the dominant eigenvector by repeated multiplication — the literal idea behind PageRank's computation.
- **QR algorithm** computes the full spectrum and is what `numpy.linalg.eig` runs under the hood.
- **Matrix exponentiation via diagonalization** evaluates linear recurrences and continuous-time systems.
- **SVD** powers low-rank approximation, pseudo-inverses, recommender systems, and noise filtering.

## Quick Sanity Checks

- Eigenvalues sum to the trace and multiply to the determinant — check both after solving.
- $\det(A) = 0 \iff$ $0$ is an eigenvalue $\iff$ $A$ is singular (nontrivial null space).
- A symmetric matrix must have *real* eigenvalues; a complex result there signals an arithmetic error.
- An eigenvector is only defined up to scaling — normalize before comparing, and never accept $\mathbf{v} = \mathbf{0}$.
