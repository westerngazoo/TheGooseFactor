---
sidebar_position: 3
title: "Appendix C — Selected Exercise Solutions"
---

# Appendix C — Selected Exercise Solutions

Worked solutions for representative exercises from each Part of the
book. These aren't exhaustive — pick the ones that match what
you're stuck on, or use them as templates for analogous problems.

## Part I — Foundations

### Ex 1.1: Verify $ab = a\cdot b + a\wedge b$ in coordinates

Take $a = a^i e_i$ and $b = b^j e_j$. The geometric product:

$$ab = \sum_{i,j} a^i b^j e_i e_j = \sum_i a^i b^i e_i^2 + \sum_{i\ne j}a^i b^j e_i e_j$$

Using $e_i^2 = +1$ and pairing the $i \ne j$ terms by switching:

$$ab = \sum_i a^i b^i + \sum_{i<j}(a^i b^j - a^j b^i)\,e_i e_j$$

The first sum is $a\cdot b$. The second is $a\wedge b$ by definition.
$\square$

### Ex 2.1: Show $R\tilde{R} = 1$ for a rotor $R = \exp(B/2)$

Reverse: $\tilde{R} = \widetilde{\exp(B/2)} = \exp(\tilde{B}/2)$. For
a pure bivector $B$, $\tilde{B} = -B$. So $\tilde{R} = \exp(-B/2)$.

Product: $R\tilde{R} = \exp(B/2)\exp(-B/2) = \exp(B/2 - B/2) = \exp(0) = 1$.

(The BCH formula doesn't introduce extra terms because $B/2$ and
$-B/2$ commute trivially.)

### Ex 3.1: Compute the reciprocal frame for a non-orthonormal basis

Take $e_1 = \hat{x}, e_2 = \hat{x} + \hat{y}, e_3 = \hat{z}$.
Compute pseudoscalar: $I_e = e_1\wedge e_2\wedge e_3 = \hat{x}\wedge(\hat{x}+\hat{y})\wedge\hat{z} = \hat{x}\wedge\hat{y}\wedge\hat{z} = I$
(using $\hat{x}\wedge\hat{x} = 0$).

Reciprocals: $e^i = (e_j\wedge e_k)/I_e$.

- $e^1 = (e_2\wedge e_3)/I = ((\hat{x}+\hat{y})\wedge\hat{z})/I = (\hat{x}\wedge\hat{z} + \hat{y}\wedge\hat{z})/I = -\hat{y} - (-\hat{x}) = \hat{x} - \hat{y}$.
  Check: $e^1 \cdot e_1 = (\hat{x} - \hat{y})\cdot\hat{x} = 1$. ✓
  And $e^1 \cdot e_2 = (\hat{x} - \hat{y})\cdot(\hat{x} + \hat{y}) = 1 - 1 = 0$. ✓

(Similar computations for $e^2$ and $e^3$ — left as exercise.)

## Part II — Classical mechanics

### Ex 5.1: Derive the conic-section orbit equation

From [Ch 5 §5](/physics-ga/part-2-classical-mechanics/two-body-central-force):
the conserved LRL vector $A$ satisfies $A\cdot r = |L|^2/\mu - k$
(with the sign convention noted there).

Writing $A\cdot r = |A| r\cos\theta$ where $\theta$ is measured
from periapsis (direction of $A$):

$$|A| r \cos\theta = |L|^2/\mu - k$$

Solving for $r$:

$$r = \frac{|L|^2/\mu - k\,\text{(sign)}}{|A|\cos\theta\,\text{(sign)}}$$

After proper sign-tracking (D-L §3.3 gives the canonical form):

$$r(\theta) = \frac{p}{1 + e\cos\theta}, \quad p = \frac{|L|^2}{\mu k}, \quad e = \frac{|A|\mu}{k}$$

— the conic-section equation with semi-latus rectum $p$ and
eccentricity $e$.

### Ex 7.1: Verify $\dot{R} = \tfrac{1}{2}\Omega R$ for a unit rotor

Start with $R\tilde{R} = 1$. Differentiate:

$$\dot{R}\tilde{R} + R\dot{\tilde{R}} = 0$$

Note $\dot{\tilde{R}} = \widetilde{\dot{R}}$ (the time derivative
commutes with the reverse for scalar-coefficient differentiation),
so $R\dot{\tilde{R}} = R\widetilde{\dot{R}} = \widetilde{\dot{R}\tilde{R}}$
(using the reverse-of-product rule).

Setting $X = \dot{R}\tilde{R}$, we have $X + \tilde{X} = 0$, i.e.,
$X$ is "anti-symmetric" under reverse. The reverse on grades:
$\langle X\rangle_0$ is fixed, $\langle X\rangle_1$ is fixed,
$\langle X\rangle_2$ is **negated**, $\langle X\rangle_3$ is fixed,
$\langle X\rangle_4$ is negated.

$X + \tilde{X} = 0$ forces the fixed-sign parts (scalar, vector,
trivector) to vanish, leaving only the negated parts (bivector
and quadvector). For our 3D case, only the bivector grade exists,
so $X$ is a pure bivector.

Write $X = \Omega/2$ (factor of 2 by convention). Then
$\dot{R} = \tfrac{1}{2}\Omega R$. $\square$

## Part III — Spacetime algebra

### Ex 10.1: Boost composition gives Thomas precession

Compose two boosts in perpendicular directions. Boost 1: rapidity
$\phi_1$ in direction $\hat{n}_1 = \gamma_1$. Boost 2: rapidity $\phi_2$ in
direction $\hat{n}_2 = \gamma_2$.

Rotors: $R_1 = \exp(\phi_1\gamma_1\gamma_0/2)$, $R_2 = \exp(\phi_2\gamma_2\gamma_0/2)$.

For small rapidities, BCH:

$$R_2 R_1 \approx \exp(\phi_1\gamma_1\gamma_0/2 + \phi_2\gamma_2\gamma_0/2 + \tfrac{1}{8}[\phi_2\gamma_2\gamma_0, \phi_1\gamma_1\gamma_0] + \cdots)$$

The commutator: $[\gamma_2\gamma_0, \gamma_1\gamma_0] = \gamma_2\gamma_0\gamma_1\gamma_0 - \gamma_1\gamma_0\gamma_2\gamma_0$.
Working through: this equals $\gamma_2\gamma_1\gamma_0^2 + \gamma_1\gamma_2\gamma_0^2 = (\gamma_2\gamma_1 + \gamma_1\gamma_2)\gamma_0^2 = 0\cdot\gamma_0^2 = 0$.
Hmm — that's wrong. Let me redo:

$\gamma_2\gamma_0\gamma_1\gamma_0 = \gamma_2(-\gamma_1)\gamma_0^2 = -\gamma_2\gamma_1 = \gamma_1\gamma_2$ (using $\gamma_0^2 = +1$ and anti-commuting through).

$\gamma_1\gamma_0\gamma_2\gamma_0 = \gamma_1(-\gamma_2)\gamma_0^2 = -\gamma_1\gamma_2$.

Commutator: $\gamma_1\gamma_2 - (-\gamma_1\gamma_2) = 2\gamma_1\gamma_2$ — a **spatial bivector**.

So the composed boost has an extra term $\tfrac{1}{8}(2\phi_1\phi_2)\gamma_1\gamma_2 = \tfrac{1}{4}\phi_1\phi_2\gamma_{12}$
— a spatial rotation in the $\gamma_{12}$ plane.

This is **Thomas precession**: composing two non-colinear boosts
gives a spatial rotation in addition to the boost. The amount of
rotation depends on the boost magnitudes and the angle between them.

### Ex 13.1: Maxwell's equation gives charge conservation

Take $\nabla F = J/\epsilon_0$ and operate with $\nabla$ on the
left:

$$\nabla\nabla F = \nabla J/\epsilon_0$$

The left side is $\nabla^2 F$ — a scalar second-derivative on the
bivector $F$. This has bivector and pseudoscalar (4-vector) parts
but no vector or scalar part.

The right side $\nabla J$ has vector and bivector parts. For the
equation to hold, the vector part of $\nabla J$ must equal the
vector part of $\nabla^2 F$ — which is zero.

So $\langle \nabla J \rangle_1 = 0$, i.e., $\nabla\cdot J = 0$.

This is charge conservation, derived as a consistency requirement
of Maxwell's equation. $\square$

## Part V — Quantum theory

### Ex 18.1: Spin-1/2 rotation produces a sign change

Take the rotor $R = \exp(-I\hat{n}\theta/2)$ for a rotation by
angle $\theta$ around axis $\hat{n}$. For $\theta = 2\pi$:

$$R = \exp(-I\hat{n}\pi) = \cos\pi - I\hat{n}\sin\pi = -1$$

A spinor transforms by left multiplication: $\psi \to R\psi = -\psi$.

The spinor has acquired a sign change under a $2\pi$ rotation —
the famous spin-1/2 phase. For $\theta = 4\pi$: $R = +1$ and
$\psi \to \psi$ — period $4\pi$, not $2\pi$.

This is **not** a quantum-mechanical mystery; it's the algebraic
structure of $\mathrm{Spin}(3) = SU(2)$, the double cover of
$SO(3)$.

## Part VII — Geometric calculus

### Ex 28.1: Verify the divergence theorem for $A = \mathbf{r}$

For the radial vector field $A(\mathbf{x}) = \mathbf{x}$:

$$\nabla\cdot A = \nabla\cdot\mathbf{x} = e^i\cdot\partial_i(x^j e_j) = e^i\cdot e_i = n$$

(in $n$ dimensions). So $\int_V \nabla\cdot A\,dV = n\,V$ — $n$
times the volume of $V$.

The boundary integral: $\oint_{\partial V} A\cdot d\mathbf{S} = \oint_{\partial V}\mathbf{x}\cdot d\mathbf{S}$.

For a sphere of radius $R$: $\mathbf{x}\cdot\hat{\mathbf{r}} = R$
on the boundary, and $\int dA = 4\pi R^2$ (3D case). So
$\oint = R \cdot 4\pi R^2 = 4\pi R^3 = 3 \cdot V_{\rm ball}(R)$.

Both sides equal $3V$ in 3D. ✓

For general $n$ dimensions: both equal $n V$. The divergence
theorem holds. $\square$

## Where to find more exercises

D-L has exercises at the end of each chapter; the worked solutions
in this Appendix are a subset of those. For deeper practice:

- Hestenes, *Spacetime Algebra* — has its own problem sets.
- Lounesto, *Clifford Algebras and Spinors* — more
  mathematically-oriented exercises.
- Online: bivector.net has tutorials and interactive exercises.
