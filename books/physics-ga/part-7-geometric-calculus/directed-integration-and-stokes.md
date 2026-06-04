---
sidebar_position: 3
title: "Directed Integration and Generalized Stokes"
---

# Directed Integration and Generalized Stokes

> *Doran-Lasenby §6.5–6.6.* The fundamental theorem of calculus
> generalized to manifolds. Stokes, Gauss, and Green's theorems all
> emerge as instances of one GA identity.

In vector calculus, three theorems relate differentiation and
integration: Gauss's divergence theorem, Stokes's curl theorem,
and Green's planar version. In GA, all three are the same
**directed integral** theorem, applied at different grades.

## 1. Directed measure

For a $k$-dimensional submanifold $S$ of $\mathbb{R}^n$, the
**directed measure** $d^k S$ is a $k$-blade-valued differential
form:

$$d^k S = \tfrac{1}{k!} dx_1 \wedge dx_2 \wedge \cdots \wedge dx_k$$

— the wedge of $k$ infinitesimal tangent vectors at the integration
point, oriented along the manifold.

In 3D, the directed measures are:

- $d^1 S = d\mathbf{r}$ — a vector along a curve.
- $d^2 S$ — a bivector tangent to a surface, dual to the normal
  vector.
- $d^3 S$ — a trivector = pseudoscalar times the volume element.

Integration of a multivector field $M$ against $d^k S$ produces a
multivector-valued integral:

$$\int_S M \, d^k S \quad\text{or}\quad \int_S d^k S\, M$$

— the GA-native integral, with the directed measure carrying the
orientation information.

## 2. The fundamental theorem of geometric calculus

The headline result of geometric calculus:

$$\boxed{\; \int_V dV\,\nabla M = \oint_{\partial V} dS\,M \;}$$

where $V$ is an oriented $k$-volume, $\partial V$ is its
$(k-1)$-dimensional boundary, $dV$ is the directed $k$-blade, $dS$
the directed $(k-1)$-blade, and $M$ is any multivector field.

The left side is a **bulk integral** with the vector derivative
acting on $M$. The right side is a **boundary integral** of $M$
itself.

This is **one theorem** that contains all of:

- The 1D fundamental theorem of calculus: $\int_a^b f'(x)\,dx = f(b) - f(a)$.
- Gauss's divergence theorem in $\mathbb{R}^3$.
- Stokes's curl theorem on surfaces.
- Green's theorem in the plane.
- Cauchy's theorem and residue theorem in complex analysis.
- All higher-dimensional and curved-manifold generalizations.

Each is the GA theorem at a specific grade combination.

> :happygoose: "All integration theorems are one theorem"
> generalizes Stokes (differential geometry version) by allowing
> the integrand to be a multivector of mixed grade. The grade of
> the integrand matches the dimension of $V$; the same identity
> holds. This is the cleanest form of the fundamental theorem.

## 3. Recovering the divergence theorem

In 3D, take $V$ a region with boundary surface $\partial V$, $M = A$
a vector field. The volume integral becomes

$$\int_V dV\,\nabla A = \int_V I\,\nabla A\,d^3x$$

— with $dV = I\,d^3x$ the directed volume (pseudoscalar times scalar
volume). $\nabla A$ has scalar + bivector parts; multiplying by $I$
shifts grade by 3 (modulo) — scalar → trivector, bivector → vector.

Selecting the **vector part** of $I\nabla A$: this is the
**divergence theorem**:

$$\int_V (\nabla\cdot A)\,d^3x = \oint_{\partial V} A\cdot d^2 S$$

where $d^2S$ on the right is the conventional vector surface
element. The bivector part of $I\nabla A$ gives an integrated curl
boundary contribution; restricting to scalar functions recovers
**Gauss's theorem** for $\nabla\cdot A$.

## 4. Stokes's theorem (curl)

For a surface $S$ with boundary $\partial S$ a closed curve, $M = A$
a vector field. The surface integral is

$$\int_S d^2 S\,\nabla A$$

Project onto the bivector (curl) part:

$$\int_S (\nabla\wedge A)\cdot d^2 S = \oint_{\partial S} A\cdot d\mathbf{r}$$

— **Stokes's theorem**. In conventional 3D vector calculus, this
is

$$\int_S (\nabla\times A)\cdot d\mathbf{S} = \oint_{\partial S} A\cdot d\mathbf{r}$$

(using $\nabla\wedge A = I(\nabla\times A)$ to translate to the
cross product). Same content; the GA wedge form generalizes to
any dimension.

## 5. The Cauchy integral theorem

For a holomorphic function $f(z) = \phi + I\psi$ (with $I = e_1 e_2$
the 2D pseudoscalar), $\nabla f = 0$ encodes the **Cauchy-Riemann
equations**. The fundamental theorem then gives

$$\oint_C f(z)\,dz = 0 \quad\text{(closed contour)}$$

— **Cauchy's theorem**.

For a contour enclosing a single pole of $f(z) = g(z)/(z - z_0)$:

$$\oint_C \frac{g(z)}{z - z_0}\,dz = 2\pi I\,g(z_0)$$

— **Cauchy's integral formula**, the residue theorem in GA. The
factor $2\pi I$ is the directed circumference of the unit circle
in the 2D plane.

In STA ([Ch 14](/physics-ga/part-4-electromagnetism/integral-conservation-theorems)),
the same machinery handles complex analysis as a special case of
2D geometric calculus.

## 6. The Green's function picture

For an inverse problem $\nabla F = J$, the Green's function $G$
satisfies $\nabla G = \delta$. The solution

$$F(x) = \int G(x - y)\,J(y)\,dy$$

uses the directed-integration version of the convolution.

In 3D Euclidean: $G(x) = 1/(4\pi|x|)$ is the Coulomb Green's
function. In STA: the retarded Green's function from [Ch 15](/physics-ga/part-4-electromagnetism/em-field-of-point-charge).

The GA form unifies these — the inverse vector derivative $\nabla^{-1}$
acts by Green's-function convolution in any signature.

## 7. The Hodge decomposition

For a closed manifold, any multivector field $M$ decomposes as

$$M = \nabla\wedge\alpha + \nabla\cdot\beta + h$$

— **exact** part (a wedge of a lower-grade field), **co-exact**
part (a divergence of a higher-grade field), and **harmonic**
part ($h$ satisfying $\nabla h = 0$).

This is the **Hodge decomposition theorem**, fundamental to
algebraic topology and differential geometry. In GA, it
generalizes naturally to any-grade multivector fields, not just
differential forms.

For Maxwell's equations in vacuum: $F = \nabla\wedge A$ — the EM
field is "exact" with $A$ as the potential. For sources: $F$
acquires a co-exact part driven by $J$. For vacuum, only harmonic
solutions exist (free EM waves).

> :nerdygoose: Hodge decomposition is the bridge between
> differential geometry and topology. The dimension of the
> harmonic space equals the **Betti numbers** of the manifold —
> topological invariants. GA gives a clean derivation of this in
> terms of multivectors instead of differential forms.

## 8. The Atiyah-Singer index theorem (preview)

The crown jewel of differential geometry: the **Atiyah-Singer
index theorem** relates the analytic index of an elliptic
operator (like $\nabla$) to topological invariants of the
manifold.

In its simplest form for the Dirac operator on a closed manifold:

$$\text{ind}(\not\!\nabla) = \text{(topological invariant)}$$

GA's version: the Dirac operator $\nabla$ in geometric algebra has
an index given by a specific combination of curvature integrals
(the $\hat{A}$ genus). This connects single-particle quantum
mechanics to manifold topology.

This is research-level mathematics, not pedagogical, but the GA
formulation makes the operator side natural.

## 9. Numerical integration in GA

For computational physics, the directed-integration framework
gives a clean way to set up **finite-element** and
**boundary-element** methods. The directed measure $dV$ or $dS$
naturally encodes orientation; the GA product handles the
bookkeeping that index notation does manually.

Maxwell's equation $\nabla F = J/\epsilon_0$ in integral form:

$$\oint_{\partial V} F\,dS = \int_V J\,dV/\epsilon_0$$

— a **single** integral equation that contains all four classical
Maxwell equations as grade projections. Useful for FE codes.

## What we covered

- Directed measure $d^k S$ as $k$-blade-valued differential.
- Fundamental theorem of geometric calculus:
  $\int_V dV\,\nabla M = \oint_{\partial V} dS\,M$.
- Recovers divergence theorem, Stokes, Green's, Cauchy as grade
  projections.
- Cauchy's integral theorem and residue theorem from 2D GA.
- Green's-function inversion of $\nabla$.
- Hodge decomposition: exact + co-exact + harmonic parts.
- Atiyah-Singer index theorem preview (research-level).
- Numerical FE / BE applications.

## What's next

[Chapter 31](/physics-ga/part-7-geometric-calculus/embedded-surfaces-and-vector-manifolds) —
embedded surfaces and vector manifolds. How GA handles intrinsic
vs extrinsic geometry, and the GA-native formulation of
differential geometry's standard objects (metric, second
fundamental form, mean curvature).
