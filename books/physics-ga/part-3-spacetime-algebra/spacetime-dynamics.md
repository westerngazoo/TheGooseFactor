---
sidebar_position: 5
title: "Spacetime Dynamics"
---

# Spacetime Dynamics

> *Doran-Lasenby §5.5.* Equations of motion in STA. The relativistic
> Lagrangian, energy-momentum conservation, and the geodesic equation
> in flat spacetime as a warm-up for the curved-spacetime story
> in [Part VI](/physics-ga/part-6-gauge-gravity/coming-soon).

Closing Part III: how do particles and fields evolve in spacetime?
The answer in STA is what you'd expect — the same Lagrangian and
Hamiltonian machinery as classical mechanics, but with vectors in
$\mathcal{Cl}(1,3)$ instead of $\mathcal{Cl}(3,0)$.

## 1. The relativistic free-particle Lagrangian

For a free particle of rest mass $m$, the action is the
proper-time interval along the worldline:

$$S = -mc^2 \int d\tau = -mc^2 \int \sqrt{v\cdot v}\, d\lambda$$

(The sign convention follows from picking $(+,-,-,-)$ — proper time
maximizes for inertial motion.) Varying this with respect to the
worldline $x(\lambda)$ gives the Euler-Lagrange equation:

$$\frac{d}{d\tau}(mv) = 0 \quad\Leftrightarrow\quad \dot{p} = 0$$

The free particle's 4-momentum is conserved. Same as classical
mechanics, with 4-vectors instead of 3-vectors.

## 2. Coupling to a 4-potential

Add an interaction with a 4-potential $A$:

$$L_{\rm int} = -q A \cdot v / c$$

This couples the particle to electromagnetism. The total Lagrangian
is

$$L = -mc^2 + L_{\rm int} - V_{\rm ext}/c \cdot v$$

(with appropriate signs and factors I'm not tracking carefully —
D-L §5.5 has the precise form). The Euler-Lagrange equation, after
variation, gives the **Lorentz force law** in STA:

$$\boxed{\; \dot{p} = q F \cdot v \;}$$

— exactly the result from [Ch 13 §6](/physics-ga/part-4-electromagnetism/maxwell-equations).
GA recovers it from the variational principle in two lines.

## 3. Energy-momentum and conservation laws

For an isolated system, the conserved 4-momentum is

$$P = \sum_i p_i = \sum_i m_i v_i$$

— the sum of particle 4-momenta. This is **one conserved vector**
in STA, automatically packaging energy conservation
($P \cdot \gamma_0$ in an observer's frame) and 3-momentum
conservation ($P - (P\cdot\gamma_0)\gamma_0$) into a single
algebraic statement.

For a field $\phi$ (scalar, vector, or higher-grade multivector),
the energy-momentum tensor becomes a **linear function from
vectors to vectors**:

$$T(n) = (\text{energy-momentum flux through } n)$$

In tensor language, this is $T^{\mu\nu}$ with $n^\mu$ contracted on
one slot. In GA, it's a function $T$ on vectors. The conservation
law $\partial_\mu T^{\mu\nu} = 0$ becomes

$$\nabla \cdot T = 0 \quad\text{(adjoint sense)}$$

A bit of care is needed: $T$ as a vector-to-vector function has
a "vector-derivative" that lives on vectors. Spelling this out in
GA terms isn't subtle but takes a paragraph — see D-L §5.5 for the
precise statement.

## 4. The geodesic equation in flat spacetime

For a free particle in flat spacetime, the worldline satisfies

$$\frac{dv}{d\tau} = 0 \quad\Leftrightarrow\quad \ddot{x} = 0$$

— straight lines through spacetime, in the affine sense. With
proper-time parameterization, $|v| = 1$, so $v$ is a constant unit
vector. This is the **geodesic equation in flat spacetime**, and
it's just "F = ma" with no force.

In curved spacetime ([Part VI](/physics-ga/part-6-gauge-gravity/coming-soon)),
the geodesic equation acquires a covariant derivative
correction — but the GA form is still $\nabla_v v = 0$ with
$\nabla_v$ the directional derivative along the worldline. Same
shape, different operator.

## 5. The Lagrangian for a continuous field

For a scalar field $\phi(x)$ (a function on spacetime), the action
is

$$S = \int \mathcal{L}(\phi, \nabla\phi)\, d^4 x$$

where $\mathcal{L}$ is the Lagrangian density and $d^4x$ is the
spacetime volume element. The Euler-Lagrange equation is

$$\frac{\partial \mathcal{L}}{\partial \phi} = \nabla \cdot \frac{\partial \mathcal{L}}{\partial(\nabla\phi)}$$

For a free scalar field, $\mathcal{L} = \tfrac{1}{2}(\nabla\phi)^2 - \tfrac{1}{2}m^2\phi^2$
gives the **Klein-Gordon equation**:

$$(\nabla^2 - m^2)\phi = 0$$

where $\nabla^2 = \nabla\cdot\nabla$ is the d'Alembertian. The
algebraic content is the same as in tensor notation, but $\nabla$
is now a GA-native vector derivative.

## 6. The electromagnetic action

For the EM field bivector $F$:

$$S_{\rm EM} = -\frac{1}{4}\int F^2\, d^4x \quad(?)$$

— here "$F^2$" needs grade-decomposition since the geometric
product of a bivector with itself has both scalar and pseudoscalar
parts. The relevant invariant for the EM Lagrangian is

$$\mathcal{L}_{\rm EM} = -\frac{1}{2}\langle F^2 \rangle_0 = -\tfrac{1}{2}(F\cdot F)$$

In terms of $\mathbf{E}$ and $\mathbf{B}$: $\mathcal{L}_{\rm EM} = \tfrac{1}{2}(\mathbf{E}^2 - \mathbf{B}^2)$
— the standard EM Lagrangian density. Varying with respect to $A$
(with $F = \nabla\wedge A$) gives Maxwell's equation
$\nabla F = J/\epsilon_0$ as the Euler-Lagrange consequence.

The **second invariant** $\langle F^2 \rangle_4$ (the pseudoscalar
part) is

$$\langle F^2 \rangle_4 = 2 I (\mathbf{E}\cdot\mathbf{B})$$

— proportional to $\mathbf{E}\cdot\mathbf{B}$. This is a
**topological** invariant of the field, related to the $\theta$-term
in gauge theory.

## 7. Stress-energy of the EM field

The energy-momentum tensor of the EM field in GA is

$$T(n) = -\frac{1}{2}\epsilon_0 F n F$$

— a remarkable formula: the EM stress-energy is **a sandwich
of $n$ between two copies of $F$**. The standard tensor expression

$$T^{\mu\nu}_{\rm EM} = \epsilon_0(F^{\mu\alpha}F^\nu{}_\alpha - \tfrac{1}{4}\eta^{\mu\nu} F_{\alpha\beta}F^{\alpha\beta})$$

reproduces from the GA form once you project onto basis vectors.

Energy density: $T(\gamma_0) \cdot \gamma_0 = \tfrac{1}{2}\epsilon_0(\mathbf{E}^2 + \mathbf{B}^2)$
— the classical EM energy density.

Poynting vector: spatial part of $T(\gamma_0)$, equal to
$\mathbf{E}\times\mathbf{B}/\mu_0$ — the energy flux. In GA this
is the bivector $\mathbf{E}\wedge\mathbf{B}\,I$ once you trace
through the sandwich.

> :happygoose: $T(n) = -\tfrac{1}{2}\epsilon_0 F n F$. One line.
> Contains energy density, momentum density, energy flux (Poynting),
> momentum flux (Maxwell stress) — all the entries of the standard
> $T^{\mu\nu}$ packaged as a single sandwich. STA at its best.

## 8. Symmetries and conservation laws (Noether redux)

A continuous symmetry of the action gives a conserved 4-current.
The GA-native forms of the conservation laws:

- **Spacetime translation invariance** $\to$ conservation of $T(n)$
  (energy-momentum).
- **Lorentz invariance** $\to$ conservation of an
  angular-momentum *trivector* $J = x \wedge T$ (the orbital part)
  plus an intrinsic spin contribution.
- **Gauge invariance** $\to$ conservation of charge, $\nabla\cdot J_q = 0$.

Each conservation law is a single GA-native statement. In tensor
notation, each requires manual index gymnastics — and the "spin
current" requires extra care because the angular-momentum tensor
is normally antisymmetric. In GA, antisymmetric tensors are
bivectors, and the angular-momentum tensor's index pair becomes
a single bivector slot.

## 9. The relativistic harmonic oscillator and the Klein-Gordon equation

A scalar field with mass $m$ satisfies

$$(\nabla^2 + m^2)\phi = 0$$

(in the $-,+,+,+$ signature it's $-\nabla^2 + m^2 = 0$; with
$+,-,-,-$ it's the form above). Solutions are plane waves
$\phi = e^{-i k\cdot x}$ with $k^2 = m^2$ — i.e., on-shell
4-momentum.

In GA, the exponential $e^{-i k\cdot x}$ requires choosing what
"$i$" means. The natural choice: $i = I_2 = \gamma_{12}$ (a
spatial-rotation bivector), or any other unit bivector squaring to
$-1$. The plane-wave solutions are then **bivector-modulated**
oscillations — a hint at the spinor structure we'll need in [Part V](/physics-ga/part-5-quantum/non-relativistic-quantum-spin).

The KG equation isn't the *quantum* equation of an electron — that's
Dirac. But it's the relativistic generalization of Schrödinger for
spin-0 particles, and it falls out of the STA variational principle
cleanly.

## 10. Closing Part III

We've now built the full machinery of special relativity in GA:

- Spacetime is $\mathcal{Cl}(1,3)$ with signature $(+,-,-,-)$.
- Vectors carry spacetime events and 4-momenta.
- Bivectors generate Lorentz transformations and carry the EM
  field.
- Rotors $R = \exp(B/2)$ implement boosts and rotations
  uniformly.
- The pseudoscalar $I$ implements duality, the $E\leftrightarrow B$
  swap, and the combined $PT$ operation.

Every concept in special-relativity textbooks has a GA
counterpart, often algebraically tighter and conceptually clearer.
The next part — electromagnetism — is where this pays off most
visibly, with $\nabla F = J/\epsilon_0$ as the single replacement
for Maxwell's four equations.

> :weightliftinggoose: From [Part I](/physics-ga/part-1-foundations/ga-in-60-seconds)
> we have the algebraic primitives. From [Part II](/physics-ga/part-2-classical-mechanics/elementary-principles)
> we have how to use them in classical mechanics. From Part III we
> have the lift to spacetime. The next four Parts apply this lift
> to electromagnetism, quantum mechanics, gauge theory of gravity,
> and geometric calculus on manifolds. None of those Parts will
> introduce *new* algebraic primitives — only new applications of
> what we already have.

## What we covered

- Free-particle action $S = -mc^2 \int d\tau$ gives $\dot{p} = 0$.
- Coupling to a 4-potential gives the Lorentz force law
  $\dot{p} = qF\cdot v$ via variation.
- Conservation laws: 4-momentum (translation symmetry),
  angular-momentum trivector (Lorentz symmetry), 4-current
  (gauge symmetry).
- Klein-Gordon equation for scalar fields, with $\nabla^2 = \nabla\cdot\nabla$
  the d'Alembertian.
- EM Lagrangian density $\mathcal{L} = -\tfrac{1}{2}\langle F^2\rangle_0$;
  topological term $\langle F^2\rangle_4 = 2I\,\mathbf{E}\cdot\mathbf{B}$.
- EM stress-energy as the sandwich $T(n) = -\tfrac{1}{2}\epsilon_0 F n F$.

## What's next

That closes Part III. Onto [Part IV](/physics-ga/part-4-electromagnetism/maxwell-equations) —
electromagnetism in STA. Chapter 13 (Maxwell's equations) is
already drafted. Chapters 14–17 cover conservation theorems,
Liénard-Wiechert, EM waves, and scattering.
