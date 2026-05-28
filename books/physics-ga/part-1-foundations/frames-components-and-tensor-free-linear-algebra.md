---
sidebar_position: 3
title: "Frames, Components, and Tensor-Free Linear Algebra"
---

# Frames, Components, and Tensor-Free Linear Algebra

> *Doran-Lasenby §4.1–4.4.* The bridge from tensor-index notation
> to D-L's coordinate-free style. After this chapter you can read
> the rest of the book without ever writing $T^{\mu\nu}{}_{\rho}$.

Standard physics-grad notation drowns in indices. Geometric algebra
replaces them with grade-aware objects whose transformation rules
are built into the algebra. This chapter is the dictionary.

## 1. Frames and reciprocal frames

Let $\{e_1, e_2, \ldots, e_n\}$ be any **frame** — a linearly
independent set of vectors. We don't require orthogonality.

The **reciprocal frame** $\{e^1, e^2, \ldots, e^n\}$ is the unique
set of vectors satisfying

$$\boxed{\; e^i \cdot e_j = \delta^i_j \;}$$

For an orthonormal frame in $\mathbb{R}^n$, $e^i = e_i$ — the
reciprocal frame coincides with the original. In any other case
the reciprocals are different vectors.

In tensor notation, $e^i$ is the "raised-index" basis, related to
$e_i$ by the metric: $e^i = g^{ij} e_j$. In GA you don't need the
metric explicitly — you can construct the reciprocal frame
algebraically.

### Computing the reciprocal frame

For a 3D frame $\{e_1, e_2, e_3\}$:

$$e^1 = \frac{e_2 \wedge e_3}{e_1 \wedge e_2 \wedge e_3}, \quad e^2 = \frac{e_3 \wedge e_1}{e_1 \wedge e_2 \wedge e_3}, \quad e^3 = \frac{e_1 \wedge e_2}{e_1 \wedge e_2 \wedge e_3}$$

The denominators are scalar multiples of the pseudoscalar
$I$ — they vanish iff the frame is degenerate. In coordinate
language this is the determinant of the metric tensor.

> :nerdygoose: The formula for $e^1$ is the GA version of
> $(a\times b)/V$ from vector calculus — the "third vector" of an
> oblique basis as the cross product of the other two, divided by
> the volume. In GA, $\wedge$ replaces $\times$ and the result
> generalizes to any dimension.

## 2. Components vs. coordinates

A vector $v$ has **components in the original frame**

$$v = v^i e_i$$

and **components in the reciprocal frame**

$$v = v_i e^i$$

The two are related by $v_i = v\cdot e_i$ and $v^i = v\cdot e^i$.

This is **exactly** the contravariant/covariant index split of
tensor calculus, but with no machinery: the geometric product's
inner product picks out components automatically.

A scalar product becomes a one-line manipulation:

$$a\cdot b = a^i e_i \cdot b^j e_j = a^i b^j (e_i \cdot e_j) = a^i b_i = a^i b^j g_{ij}$$

where $g_{ij} := e_i \cdot e_j$ is the metric. You can compute with
or without the metric depending on which frame you use.

> :mathgoose: The metric tensor $g_{ij}$ is the gram matrix of the
> frame. It's a derived quantity in GA — the geometric product
> knows the inner product as $\langle e_i e_j \rangle_0$, and
> $g_{ij}$ is just shorthand for the table of values. You never
> have to *postulate* a metric; pick a frame and the metric
> appears.

## 3. Linear functions of multivectors

A linear function $f : V \to V$ on vectors extends in two
non-equivalent ways to a function on multivectors. The two extensions
are called the **outermorphism** and the **adjoint**.

### The outermorphism $\underline{f}$

Extend $f$ to blades by

$$\underline{f}(a \wedge b) = f(a) \wedge f(b)$$

and more generally,

$$\underline{f}(a_1 \wedge \cdots \wedge a_k) = f(a_1) \wedge \cdots \wedge f(a_k)$$

This is the **wedge-preserving extension**. It's unique, and it
recovers the determinant naturally: applied to the pseudoscalar,

$$\underline{f}(I) = \det(f) \cdot I$$

The determinant of $f$ is **the eigenvalue of $\underline{f}$ on
the volume element**. No expansion-by-minors, no Leibniz formula —
the determinant is whatever scalar $\underline{f}$ multiplies $I$ by.

### The adjoint $\overline{f}$

The adjoint is the unique linear function satisfying

$$a \cdot f(b) = \overline{f}(a) \cdot b$$

for all vectors $a, b$. In matrix language, $\overline{f}$ is the
transpose of $f$. In GA, it has its own geometric meaning: $\overline{f}$
is **dual** to $\underline{f}$ via the inner product.

### Key identities

A small zoo of identities, none of which involve indices:

| Identity | What it says |
|---|---|
| $\underline{f}(I) = \det(f) I$ | Determinant is the volume-scaling |
| $\underline{fg} = \underline{f}\underline{g}$ | Outermorphism of composition |
| $f^{-1}(a) = \frac{1}{\det f}\underline{f}^{-1}(aI)I^{-1}$ | Inverse via the adjoint trick |
| $\overline{f}\,\underline{f} = \det(f)\,\mathbf{1}$ | Adjoint times outermorphism is determinant times identity |

The last identity is the GA form of the Cayley-Hamilton-adjugate
result. It's how you invert a matrix in GA without Gaussian
elimination.

## 4. Eigenvalues and eigenblades

Eigenvalue problems in tensor calculus are coordinate computations.
In GA they're algebraic:

A vector $v$ is an **eigenvector** of $f$ if $f(v) = \lambda v$
for some scalar $\lambda$.

A **bivector** $B = a \wedge b$ is an **eigenbivector** of the
outermorphism $\underline{f}$ if $\underline{f}(B) = \mu B$ for
some scalar $\mu$.

The eigenvalues are related: if $f(a) = \alpha a$ and $f(b) = \beta b$,
then

$$\underline{f}(a\wedge b) = f(a)\wedge f(b) = \alpha a \wedge \beta b = (\alpha\beta)\, a\wedge b$$

so the eigenvalue of $\underline{f}$ on $a\wedge b$ is the product
$\alpha\beta$. The determinant is the product of all eigenvalues —
this falls out of $\underline{f}(I) = (\prod_i \alpha_i) I$.

For a symmetric $f$, real-spectrum theorems carry over: there's a
basis of orthogonal eigenvectors. For an antisymmetric $f$, the
**eigenbivectors** are the natural objects — antisymmetric maps in
$\mathbb{R}^n$ have $\lfloor n/2 \rfloor$ invariant 2-planes, which
are the bivector eigen-objects.

> :surprisedgoose: The skew-symmetric eigenvalue problem is the
> bivector eigenvalue problem in disguise. In 3D, an antisymmetric
> matrix has no real eigenvalues — but in GA, it has *one*
> eigenbivector with a real eigenvalue. That bivector is the plane
> of rotation. The "$i\omega$" eigenvalue of complex matrix
> language is the magnitude of that bivector's eigenvalue. Same
> object, two notations.

## 5. The Cayley-Hamilton theorem in GA

A linear function $f$ on $\mathbb{R}^n$ satisfies a polynomial
identity of degree $n$ — its characteristic polynomial. In GA, the
characteristic polynomial is

$$p(\lambda) = \det(\lambda - f) = \sum_{k=0}^n (-\lambda)^{n-k}\, \mathrm{tr}_k(f)$$

where $\mathrm{tr}_k(f)$ is the **grade-$k$ trace** — the eigenvalue
of $\underline{f}$ on the grade-$k$ subspace, summed. These are
the elementary symmetric polynomials of the eigenvalues.

In particular:

- $\mathrm{tr}_1(f) = \mathrm{tr}(f)$ (ordinary trace)
- $\mathrm{tr}_n(f) = \det(f)$

Cayley-Hamilton says $p(f) = 0$ as an operator. This is true in any
algebra, and in GA the proof is two lines once you have the
outermorphism.

## 6. Rotors revisited as linear maps

A rotor $R \in \mathcal{Cl}(p,q)$ acts on vectors via the sandwich:

$$R(v) := R v \tilde{R}$$

This **is** a linear function on vectors. Its outermorphism is

$$\underline{R}(M) = R M \tilde{R}$$

— the same sandwich, extended to any-grade multivectors. The
identity $R\tilde{R} = 1$ ensures $\det(R) = +1$ (orientation
preserved), making it an element of $SO(p,q)$.

The infinitesimal version, from [Ch 2 §6](/physics-ga/part-1-foundations/reflections-rotations-and-the-sandwich#6-differentiating-a-rotor):

$$\delta v = \tfrac{1}{2}[\Omega, v]$$

where $[A, B] = AB - BA$. The commutator with a bivector is the
infinitesimal generator of rotations — exactly the Lie-algebra
content $\mathfrak{so}(p,q)$, with no abstract construction needed.

> :nerdygoose: This is the GA realization of the Lie group / Lie
> algebra correspondence: bivectors *are* the Lie algebra
> $\mathfrak{so}(p,q)$, rotors *are* the Lie group
> $\mathrm{Spin}(p,q)$, and $R = \exp(B/2)$ is the exponential
> map. No abstract definitions — the algebra hands you everything.

## 7. Tensors are multivector-valued linear functions

A rank-$(r,s)$ tensor takes $r$ vectors in and $s$ vectors out.
In GA, replace "vectors in" and "vectors out" with "multivectors of
chosen grade."

A symmetric $(0,2)$-tensor (e.g., the metric) is captured by the
inner product itself — it's just $\langle ab \rangle_0$.

An antisymmetric $(0,2)$-tensor (e.g., the EM field) is captured
by a bivector — the same antisymmetric content, but as a single
algebraic object instead of a 2-index array.

A symmetric $(1,1)$-tensor is a self-adjoint linear function $f$.

The **Riemann curvature tensor** — the heaviest tensor in physics —
becomes a bivector-valued linear function of bivectors in GA. We'll
hit that in [Part VI](/physics-ga/part-6-gauge-gravity/coming-soon).

> :angrygoose: Tensors-as-arrays is a 1900s notation. Tensors are
> multilinear maps; their array form was a 20th-century compromise
> for printing equations on paper. GA gives you the maps directly
> and skips the arrays entirely. The cost of saying "rank-$(2,2)$
> tensor" is one bivector-valued linear function — vastly simpler
> object once you stop converting it to indices in your head.

## 8. The components-to-objects dictionary

For quick translation between physics-grad notation and GA:

| Tensor notation | GA equivalent |
|---|---|
| $v^\mu$, contravariant vector | vector $v = v^\mu e_\mu$ |
| $v_\mu$, covariant vector | $v = v_\mu e^\mu$, reciprocal-frame components |
| $g_{\mu\nu}$, metric | $g_{\mu\nu} = e_\mu \cdot e_\nu$ |
| $T^{\mu\nu}$, antisymmetric | bivector $T = T^{\mu\nu} e_\mu \wedge e_\nu / 2$ |
| $T^{\mu\nu}$, symmetric | $f$ symmetric linear; $T(a,b) = a \cdot f(b)$ |
| $\partial_\mu$ | $\nabla = e^\mu \partial_\mu$ |
| $\epsilon^{\mu\nu\rho\sigma}$ | pseudoscalar $I$ |
| $\det$ | eigenvalue of $\underline{f}$ on $I$ |
| Trace | $\sum_\mu e^\mu \cdot f(e_\mu)$ |
| Commutator $[\,,]$ | $\tfrac{1}{2}(AB - BA)$ in GA |
| Lie derivative | derivation of multivectors, see Ch 28 |

## What we covered

- A reciprocal frame is the dual basis defined by
  $e^i \cdot e_j = \delta^i_j$, computable algebraically via wedges.
- Tensor index notation (contravariant $v^i$, covariant $v_i$)
  maps to GA components in the frame and reciprocal frame.
- Linear functions extend to multivectors as **outermorphisms**;
  the determinant is the eigenvalue of $\underline{f}$ on the
  pseudoscalar.
- The adjoint $\overline{f}$ is the GA transpose; key identity
  $\overline{f}\,\underline{f} = \det(f)\,\mathbf{1}$.
- Eigenbivectors handle antisymmetric eigenvalue problems
  cleanly.
- Rotors are linear functions; bivectors are their Lie algebra.
- Antisymmetric tensors $T^{\mu\nu}$ become bivectors; symmetric
  ones become self-adjoint linear functions; both lose the
  index-juggling.

## What's next

This closes Part I. [Part II](/physics-ga/part-2-classical-mechanics/coming-soon)
applies the framework to classical mechanics — Lagrangians, central
forces, rigid bodies — all done with rotors and bivectors instead
of Euler angles and matrices.

If you skipped here from elsewhere in physics-ga and now want the
deeper algebraic story (proofs, derivations, full identities),
the parent reference is the [Geometric Algebra study journal](/geometric-algebra),
specifically sections 1–4. This book uses results from there as
black boxes.
