---
sidebar_position: 2
title: "Integral and Conservation Theorems"
---

# Integral and Conservation Theorems

> *Doran-Lasenby §7.2.* Energy, momentum, and angular momentum
> conservation for the electromagnetic field, derived from the single
> equation $\nabla F = J/\epsilon_0$.

[Chapter 13](/physics-ga/part-4-electromagnetism/maxwell-equations)
collapsed Maxwell's four equations into one: $\nabla F = J/\epsilon_0$.
This chapter shows that the **conservation laws** of electromagnetism —
Poynting's theorem, momentum balance, angular-momentum balance — fall
out just as cleanly. The pattern is: take $\nabla F = J/\epsilon_0$,
contract or sandwich with something, and read off the conservation law.

## 1. Charge conservation

The simplest conservation law: take the divergence of Maxwell's
equation. Since $\nabla F$ is a vector ($\nabla \cdot F$) plus a
trivector ($\nabla \wedge F$), and $J$ is a vector:

$$\nabla(\nabla F) = \nabla(J/\epsilon_0)$$

The left-hand side is $\nabla^2 F$ (acting as a scalar Laplacian on
$F$). The right-hand side is $\nabla J/\epsilon_0 = (\nabla\cdot J + \nabla\wedge J)/\epsilon_0$.

But $\nabla^2 F$ has no scalar part (it's bivector-valued), so the
scalar part of $\nabla J$ must vanish:

$$\boxed{\; \nabla \cdot J = 0 \;}$$

— **charge conservation** (continuity equation
$\partial\rho/\partial t + \nabla\cdot\mathbf{J} = 0$). One line.

The fact that Maxwell's equation **requires** charge conservation —
not just permits it — is one of the structural insights of the GA
formulation. If you tried to write Maxwell with $\nabla\cdot J \ne 0$,
the equation would be inconsistent.

## 2. The energy-momentum bivector

The energy-momentum carried by the EM field is encoded in the
**stress-energy** function:

$$T(n) = -\tfrac{1}{2}\epsilon_0 F n F$$

— from [Ch 12 §7](/physics-ga/part-3-spacetime-algebra/spacetime-dynamics). This is a
**vector-valued linear function of a vector** $n$, capturing how
energy-momentum flows across surfaces perpendicular to $n$.

For $n = \gamma_0$, $T(\gamma_0)$ gives:

- **Energy density** $u = T(\gamma_0)\cdot\gamma_0 = \tfrac{1}{2}\epsilon_0(\mathbf{E}^2 + c^2\mathbf{B}^2)$
- **Poynting flux** $\mathbf{S} = T(\gamma_0) - u\gamma_0 = c\epsilon_0\,\mathbf{E}\times\mathbf{B}$ (in spatial decomposition)

For $n = \gamma_i$, $T(\gamma_i)$ gives the **Maxwell stress tensor** —
the $i$-th column of the spatial momentum-flux tensor in physics-grad
notation.

## 3. Poynting's theorem (energy conservation)

Take $\nabla \cdot T$ and use Maxwell's equation. The full derivation:

$$\nabla\cdot T(n) = -\tfrac{1}{2}\epsilon_0\,\nabla\cdot(FnF)$$

Apply the product rule and $\nabla F = J/\epsilon_0$. After algebra
(spelled out in D-L §7.2):

$$\boxed{\; \nabla \cdot T(n) = -F\cdot J \cdot n / c \;}$$

— for any vector $n$. The scalar $F \cdot J = \mathbf{E} \cdot \mathbf{J}$
(Joule heating, in the observer's frame), so this is

$$\nabla \cdot T = -F\cdot J / c$$

The spatial part of this, contracted with $\gamma_0$, recovers
**Poynting's theorem**:

$$\frac{\partial u}{\partial t} + \nabla\cdot\mathbf{S} = -\mathbf{E}\cdot\mathbf{J}$$

The change in field energy density plus the energy flux out equals
the work done on the charges. The 4-momentum components do the same
algebra for momentum balance.

> :happygoose: One sandwich identity ($\nabla\cdot T = -F\cdot J/c$)
> encodes Poynting's theorem AND the Maxwell-stress momentum balance
> — both in any frame. The standard derivation is a chapter; the GA
> version is two lines once you have $T(n) = -\tfrac{1}{2}\epsilon_0 F n F$.

## 4. The Maxwell stress tensor

In a frame where $n = \gamma_i$:

$$T(\gamma_i)_j = -\epsilon_0\,E_i E_j - \frac{1}{\mu_0}\,B_i B_j + \tfrac{1}{2}\delta_{ij}\left(\epsilon_0 \mathbf{E}^2 + \frac{1}{\mu_0}\mathbf{B}^2\right)$$

— the classical Maxwell stress tensor. The diagonal pieces are
pressures (or tensions, depending on sign); the off-diagonals are
shear stresses.

From the GA expression: $T(\gamma_i) = -\tfrac{1}{2}\epsilon_0 F\gamma_i F$.
Expanding $F = \mathbf{E}/c + I\mathbf{B}$ and the sandwich
$F\gamma_i F$ algebraically, the $E_i E_j$ and $B_i B_j$ pieces
appear naturally. The trace-subtraction (the $\tfrac{1}{2}\delta_{ij}$
term) comes from the symmetry of the inner product.

The **traceless** part of the stress tensor is the radiative momentum
flux — what carries momentum away in radiation. The trace part
contributes to the field's pressure on charges.

## 5. Angular momentum conservation

For rotational symmetry, the conserved quantity is the angular
momentum *trivector* (or, projected, a bivector):

$$M(n) = T(n) \wedge x$$

— a bivector built from the stress and position vectors. Conservation:

$$\nabla \cdot M = -F\cdot J\wedge x/c$$

— a bivector statement. The right-hand side is the torque from the
field on the current.

In the spatial decomposition, $M$'s components are:

- **Orbital angular momentum** $\mathbf{L} = \mathbf{r}\times(\mathbf{E}\times\mathbf{B})/(c^2 \mu_0)$
- **Spin angular momentum** of the EM field (the piece carried by
  circular polarization).

The latter is the famous result that **circularly polarized light
carries angular momentum** $\hbar$ per photon — measurable in
Beth's 1936 experiment.

> :surprisedgoose: Beth measured the torque exerted by circularly
> polarized light on a half-wave plate in 1936 and confirmed that
> light carries angular momentum. The GA stress-trivector calculation
> shows this is the spin-1 character of the photon at the classical
> level — long before quantum field theory needed to explain it.

## 6. Boundary integrals and flux theorems

For a region $V$ in spacetime with boundary $\partial V$, the
integrated energy-momentum conservation is

$$\int_{\partial V} T(dS) = -\int_V F\cdot J\, dV / c$$

— flux of stress-energy through the boundary equals the
volume-integrated work done on charges inside.

This is the **integral form** of Poynting's theorem, generalizing
Gauss's law / Stokes's law to STA. The full machinery of integral
theorems in GA is the topic of [Ch 30](/physics-ga/part-7-geometric-calculus/the-vector-derivative).
For now: the principle is that conservation laws hold globally,
not just locally — energy that enters a region either stays as
field energy or transfers to charges.

## 7. Gauge invariance and the 4-potential

Maxwell's equation $\nabla F = J/\epsilon_0$ has $F$ as the
fundamental field, but we can introduce a **4-potential** $A$ such
that

$$F = \nabla \wedge A$$

In an observer's frame, $A = (\phi/c)\gamma_0 + \mathbf{A}$ — scalar
potential $\phi$ plus 3-vector potential $\mathbf{A}$. The
constraint $\nabla\wedge F = 0$ (the trivector half of Maxwell)
is automatic when $F = \nabla\wedge A$ — because $\nabla\wedge(\nabla\wedge A) = 0$
by associativity of the wedge product.

**Gauge freedom**: $A \to A + \nabla\chi$ for any scalar function
$\chi$ leaves $F$ unchanged (since $\nabla\wedge\nabla\chi = 0$).
The **Lorenz gauge** fixes $\nabla\cdot A = 0$, which reduces
Maxwell to the wave equation:

$$\nabla^2 A = J/\epsilon_0 \quad\text{(in Lorenz gauge)}$$

— one equation, four unknowns ($A^\mu$), no remaining gauge freedom
(modulo solutions of the homogeneous wave equation).

## 8. The action principle

The EM Lagrangian density is

$$\mathcal{L} = -\tfrac{1}{2}\langle F^2 \rangle_0 - A\cdot J / c$$

Varying with respect to $A$ (treating $F = \nabla\wedge A$):

$$\frac{\partial\mathcal{L}}{\partial A} = -J/c, \qquad \nabla\cdot\frac{\partial\mathcal{L}}{\partial(\nabla A)} = \nabla\cdot F$$

Setting $\nabla\cdot F = J/\epsilon_0$ — Maxwell's equation as the
Euler-Lagrange condition.

The trivector half is automatic from $F = \nabla\wedge A$. So
**one** Lagrangian, **one** variational principle, gives **one**
equation — $\nabla F = J/\epsilon_0$ — which is **all** of
electromagnetism.

> :weightliftinggoose: Memorize: Lagrangian $\mathcal{L} = -\tfrac{1}{2}\langle F^2\rangle_0 - A\cdot J/c$.
> Single field $A$. Single equation $\nabla F = J/\epsilon_0$.
> Everything else follows. This is the canonical form of classical
> electromagnetism, and it's also the starting point for the path
> integral in quantum electrodynamics.

## 9. Energy in radiation

For a radiating system (oscillating charges, accelerated point
charges), the energy carried to infinity per unit time is the
**radiated power**:

$$P_{\rm rad} = \oint_{S^2_\infty} T(n)\cdot n\, dA$$

— the Poynting flux integrated over a large sphere. For an
accelerating point charge with 4-acceleration $a$, this gives the
**Larmor formula**:

$$P_{\rm rad} = \frac{q^2 |a|^2}{6\pi\epsilon_0 c^3}$$

(in non-relativistic limit; the relativistic generalization is
Liénard's formula, derived in [Ch 15](/physics-ga/part-4-electromagnetism/em-field-of-point-charge)).

> :nerdygoose: The Larmor formula is what tells you classical orbits
> are radiatively unstable — an electron orbiting a nucleus would
> radiate and spiral in within picoseconds. The fact that real atoms
> don't do this was one of the historical signals that classical
> EM is incomplete and needs quantum mechanics. The Larmor formula
> itself, though, is exact at the classical level.

## What we covered

- Charge conservation $\nabla\cdot J = 0$ falls out of
  $\nabla(\nabla F) = \nabla J$ as a consistency requirement.
- Stress-energy $T(n) = -\tfrac{1}{2}\epsilon_0 F n F$ encodes
  energy density, Poynting flux, and Maxwell stress.
- Conservation: $\nabla\cdot T = -F\cdot J/c$ — one line for
  Poynting's theorem and momentum balance.
- Angular momentum trivector $M(n) = T(n)\wedge x$ captures both
  orbital and spin parts of EM angular momentum.
- 4-potential $A$ with $F = \nabla\wedge A$; gauge freedom; Lorenz
  gauge reduces to wave equation $\nabla^2 A = J/\epsilon_0$.
- EM Lagrangian $\mathcal{L} = -\tfrac{1}{2}\langle F^2\rangle_0 - A\cdot J/c$
  gives Maxwell's equation as the Euler-Lagrange condition.
- Larmor formula for radiated power from accelerating charges.

## What's next

[Chapter 15](/physics-ga/part-4-electromagnetism/em-field-of-point-charge) —
the EM field of a point charge. Coulomb's law for a static
charge, then Liénard-Wiechert for arbitrary motion, with the GA
formulation making the retarded-time bookkeeping much cleaner
than the standard derivation.
