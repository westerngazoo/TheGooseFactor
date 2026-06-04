---
sidebar_position: 1
title: "The Vector Derivative"
---

# The Vector Derivative

> *Doran-Lasenby §6.* The GA-native differential operator $\nabla$.
> Gradient, divergence, curl, and Laplacian unified as projections of
> a single vector-valued operator.

The vector derivative $\nabla$ has appeared throughout this book —
in Maxwell's equation $\nabla F = J/\epsilon_0$, in the Dirac equation
$\nabla\psi I\gamma_0 = m\psi$, in field-theory action integrals.
This chapter spells out its structure: $\nabla$ is a **vector**, and
its geometric product with a multivector field decomposes into
familiar differential operations.

## 1. The vector derivative

For a multivector field $F(x)$ over $\mathcal{Cl}(p,q)$, the vector
derivative is

$$\nabla = e^\mu \partial_\mu$$

where $\{e_\mu\}$ is a frame, $\{e^\mu\}$ its reciprocal, and
$\partial_\mu = \partial/\partial x^\mu$. The operator $\nabla$ is
**vector-valued**: it transforms as a vector under coordinate
changes.

Acting on a scalar field $\phi(x)$:

$$\nabla\phi = e^\mu \partial_\mu \phi = e^\mu (\partial_\mu \phi)$$

— the **gradient**, a vector pointing in the direction of steepest
increase of $\phi$. Identical to the vector-calculus gradient.

## 2. The geometric product with a vector field

For a vector field $A(x)$, the geometric product $\nabla A$
decomposes into scalar (divergence) and bivector (curl) parts:

$$\nabla A = \underbrace{\nabla \cdot A}_{\text{divergence}} + \underbrace{\nabla \wedge A}_{\text{curl, as a bivector}}$$

The scalar part is the divergence:

$$\nabla\cdot A = e^\mu \cdot \partial_\mu A = \sum_\mu \partial_\mu A^\mu$$

— familiar from vector calculus.

The bivector part is the **curl** in its GA-native form:

$$\nabla\wedge A = e^\mu \wedge \partial_\mu A = \tfrac{1}{2}(\partial_\mu A_\nu - \partial_\nu A_\mu)\,e^\mu \wedge e^\nu$$

In 3D, $\nabla\wedge A$ is dual to the conventional $\nabla\times A$:
$\nabla\wedge A = I(\nabla\times A)$. In any other dimension, the
wedge is the right object — the cross product is the 3D-only
illusion.

> :happygoose: $\nabla A = \nabla\cdot A + \nabla\wedge A$. Divergence
> and curl, one equation. The factor of $e^\mu \wedge e^\nu$ in the
> wedge is the bivector basis of antisymmetric "rotation" planes.
> In 3D, dualizing with $I$ gives the cross product — a coincidence
> of dimension, not a deep truth.

## 3. The Laplacian

The **vector Laplacian** is

$$\nabla^2 = \nabla \cdot \nabla = e^\mu \partial_\mu \cdot e^\nu \partial_\nu = \eta^{\mu\nu}\partial_\mu\partial_\nu$$

— the scalar Laplacian (or d'Alembertian in pseudo-Riemannian
signatures). Acting on any multivector $M$:

$$\nabla^2 M = e^\mu(e^\nu \partial_\mu\partial_\nu M) = (\partial_\mu\partial^\mu)M$$

— second-order partial derivative summed with metric weights. In
3D Euclidean: $\nabla^2 = \partial_x^2 + \partial_y^2 + \partial_z^2$.
In Minkowski $(+,-,-,-)$: $\nabla^2 = \partial_t^2/c^2 - \nabla^2_{\rm spatial}$,
i.e., the **d'Alembertian** $\Box$.

The wave equation: $\nabla^2\phi = 0$. The Klein-Gordon equation:
$\nabla^2\phi = -m^2\phi$. The Poisson equation:
$\nabla^2\phi = -\rho/\epsilon_0$.

All "second-derivative" equations of physics arise from $\nabla^2$
in various combinations.

## 4. The directional derivative

For a vector field $A(x)$ and a vector $a$, the **directional
derivative** of $F$ along $a$ is

$$a\cdot\nabla F = a^\mu \partial_\mu F$$

— scalar coefficient times the derivative. This is a multivector-
valued function with the same grade structure as $F$.

For a unit vector $\hat{n}$, $\hat{n}\cdot\nabla F$ is the rate of
change of $F$ in the $\hat{n}$ direction. This is the GA realization
of the **directional derivative** from calculus.

Note: $a\cdot\nabla F$ is **different** from $\nabla F\cdot a$ in
general (the latter doesn't make sense as a product). $\nabla$ is
an operator that acts to its right; $a\cdot\nabla$ as a whole is
the scalar operator of differentiating along $a$.

## 5. Algebraic identities

The vector derivative satisfies all the identities of vector
calculus, plus more general ones:

**Product rules**:
- $\nabla(\phi A) = (\nabla\phi)A + \phi(\nabla A)$
- $\nabla(AB) = (\nabla A)B + (\nabla' A)B'$ (where $B'$ is held
  fixed under the derivative on the right — a Leibniz-style rule)

**Identities** that drop out from $\nabla$'s vector nature:
- $\nabla\cdot(\nabla\wedge A) = 0$ if $A$ is sufficiently smooth
  (in 3D: $\nabla\cdot(\nabla\times A) = 0$).
- $\nabla\wedge(\nabla\phi) = 0$ for scalar $\phi$ (in 3D:
  $\nabla\times(\nabla\phi) = 0$).

Both these are consequences of $\nabla\wedge\nabla = 0$ — the
vector derivative wedged with itself vanishes (just like $a\wedge a = 0$).

In tensor language these are the "Bianchi identities" $\partial_\mu\partial^\mu - \partial^\mu\partial_\mu = 0$
plus index-antisymmetry. In GA they're algebraic facts about $\nabla$.

## 6. Coordinate-free representation

The vector derivative is **coordinate-independent**. The formula
$\nabla = e^\mu\partial_\mu$ uses a coordinate basis, but $\nabla$
itself is defined intrinsically by:

$$a\cdot\nabla F := \frac{d}{d\epsilon}F(x + \epsilon a)\bigg|_{\epsilon=0}$$

for any direction $a$. The vector derivative is the unique
vector-valued operator that gives this directional derivative
when contracted with $a$.

This intrinsic definition is what makes $\nabla$ work on curved
manifolds and in arbitrary signatures.

## 7. The vector derivative in curved spacetime

On a manifold with non-trivial geometry, $\nabla$ becomes the
**covariant derivative**:

$$\nabla F = \mathring{\nabla} F + (\text{gauge-field correction})$$

where $\mathring{\nabla}$ is the flat-spacetime derivative and the
correction comes from the rotation gauge field
$\Omega(a)$ from [Ch 23](/physics-ga/part-6-gauge-gravity/gauge-principles-for-gravitation).

In conventional tensor language, the covariant derivative is
$\nabla_\mu = \partial_\mu + \Gamma^\mu_{\nu\rho}\cdot$ with the
Christoffel symbols. In GA, the bivector correction
$\tfrac{1}{2}[\Omega(a),\cdot]$ does the same job.

The transition from flat to curved spacetime is **algebraic**, not
geometric — you add the rotation gauge field to $\nabla$ and
everything else follows.

## 8. Green's functions and inverse $\nabla$

For source problems $\nabla F = J$, the inverse operator $\nabla^{-1}$
acts via convolution with a **Green's function**:

$$F(x) = \int G(x - y)\,J(y)\,d^n y$$

For the d'Alembertian in 3+1 D, $G(x) = \delta(x^2)/(2\pi)$ — the
retarded Green's function we used in [Ch 15](/physics-ga/part-4-electromagnetism/em-field-of-point-charge).

GA's contribution: $G$ is the multivector-valued Green's function
that incorporates the grade structure correctly. For a vector
source $J$, the Green's function gives back a bivector field $F$
satisfying $\nabla F = J$ — exactly the EM case.

## 9. The differential and multivector calculus

A more abstract view: $\nabla$ is the **exterior derivative**
generalized to multivectors. For a $k$-form (= $k$-blade-valued
function) $\omega$:

$$d\omega = e^\mu \wedge \partial_\mu \omega$$

— the standard exterior derivative. In GA notation, this is just
$\nabla\wedge\omega$ for a multivector field $\omega$.

Combined with the inner product $\nabla\cdot$, GA's $\nabla$
contains both:
- $d$ (exterior derivative / curl)
- $\delta = \star d \star$ (codifferential / divergence)

For differential-forms enthusiasts: GA unifies $d$ and $\delta$ into
a single operator $\nabla$ that combines them via the geometric
product.

> :mathgoose: "All the differential operators are one vector
> derivative" is a deep claim. Mathematicians invented the
> exterior derivative, codifferential, Laplacian, Lie derivative,
> covariant derivative as separate things over the 20th century.
> GA reveals them as different products of one underlying $\nabla$.
> Whether this is the "right" formulation or just an elegant
> shorthand depends on your taste.

## What we covered

- Vector derivative $\nabla = e^\mu \partial_\mu$ is a vector
  operator.
- Acting on a scalar: gradient.
- Acting on a vector: divergence (scalar part) + curl-bivector
  (bivector part).
- Vector Laplacian $\nabla^2$ — d'Alembertian in pseudo-Riemannian
  signature.
- Directional derivative $a\cdot\nabla F$.
- Algebraic identities: $\nabla\wedge\nabla = 0$, hence
  $\nabla\cdot(\nabla\wedge A) = 0$ and $\nabla\wedge\nabla\phi = 0$.
- Coordinate-free definition via directional-derivative property.
- Covariant derivative on curved spacetime via gauge-field
  correction.
- $\nabla^{-1}$ via Green's functions.

## What's next

[Chapter 29](/physics-ga/part-7-geometric-calculus/curvilinear-coordinates) —
curvilinear coordinates and the vector derivative on
non-Cartesian frames. Tools to compute $\nabla$ in spherical,
cylindrical, etc., without the conventional matrix-of-Christoffel-
symbols machinery.
