---
sidebar_position: 1
title: "Maxwell's Equations in Spacetime Algebra"
---

# Maxwell's Equations in Spacetime Algebra

> *Doran-Lasenby §7.1 — the headline result of GA in physics.*

The four equations of classical electromagnetism, in vacuum, are:

$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \rho/\epsilon_0 & \nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} & \nabla \times \mathbf{B} &= \mu_0\mathbf{J} + \mu_0\epsilon_0\frac{\partial \mathbf{E}}{\partial t}
\end{aligned}
$$

Four equations. Two vector fields. Two operators ($\nabla\cdot$
and $\nabla\times$). This chapter shows that with the right
algebraic framework — spacetime algebra (STA) — these four
equations collapse into **one**:

$$\boxed{\;\nabla F = J/\epsilon_0\;}$$

The collapse isn't a notational trick. It's evidence that the
classical decomposition into "electric" and "magnetic" fields
was an artifact of the framework, not a feature of the physics.

## 1. The spacetime algebra setup

Choose basis vectors $\{\gamma_0, \gamma_1, \gamma_2, \gamma_3\}$
satisfying

$$\gamma_0^2 = +1, \qquad \gamma_i^2 = -1 \;\;(i = 1,2,3), \qquad \gamma_\mu\gamma_\nu = -\gamma_\nu\gamma_\mu \;\;(\mu \ne \nu)$$

This is the metric signature $(+,-,-,-)$ — the "Cambridge"
convention used by D-L. (The other common choice is $(-,+,+,+)$;
the algebra is essentially the same modulo signs.)

The full STA has $2^4 = 16$ basis blades:

- 1 scalar
- 4 vectors: $\gamma_0, \gamma_1, \gamma_2, \gamma_3$
- 6 bivectors: $\gamma_{0i}, \gamma_{ij}$
- 4 trivectors: $\gamma_{0ij}, \gamma_{123}$
- 1 pseudoscalar: $I = \gamma_0\gamma_1\gamma_2\gamma_3$, with $I^2 = -1$

> :nerdygoose: The signature affects which bivectors square to
> $+1$ vs $-1$. The "spatial" bivectors $\gamma_{ij}$ ($i,j\in\{1,2,3\}$)
> square to $-1$ (rotations). The "boost" bivectors $\gamma_{0i}$
> square to $+1$ (hyperbolic rotations / Lorentz boosts). All
> 6 bivectors together generate the Lorentz group.

## 2. The electromagnetic field bivector

Define the relative-vector bases for an observer with 4-velocity
$\gamma_0$:

$$\boldsymbol{\sigma}_i := \gamma_i \gamma_0$$

These are spatial bivectors. They square to $+1$ (do the
calculation: $\boldsymbol{\sigma}_i^2 = \gamma_i\gamma_0\gamma_i\gamma_0 = -\gamma_i^2\gamma_0^2 = -(-1)(+1) = +1$),
and they anti-commute among themselves like Pauli matrices:

$$\boldsymbol{\sigma}_i\boldsymbol{\sigma}_j = -\boldsymbol{\sigma}_j\boldsymbol{\sigma}_i \;\;(i \ne j), \qquad \boldsymbol{\sigma}_1\boldsymbol{\sigma}_2\boldsymbol{\sigma}_3 = I$$

The classical electric field $\mathbf{E}$ and magnetic field
$\mathbf{B}$ are 3-vectors in the observer's rest frame. Lift them
into STA bivectors:

$$\mathbf{E} = E^i \boldsymbol{\sigma}_i, \qquad I\mathbf{B} = B^i I\boldsymbol{\sigma}_i$$

Then define the **electromagnetic field bivector**:

$$\boxed{\;F := \mathbf{E} + I\mathbf{B}\;}$$

This is a pure bivector in STA — six independent components, three
"electric" and three "magnetic." There is no separate electric
or magnetic field at the algebraic level; there is one bivector
$F$, and the split into $\mathbf{E}$ and $\mathbf{B}$ is
observer-dependent.

> :surprisedgoose: The split between electric and magnetic field
> is not Lorentz-invariant. Two observers in relative motion
> measure different $\mathbf{E}$ and $\mathbf{B}$ — but they agree
> on $F$. The bivector is the geometric invariant; the
> $(\mathbf{E},\mathbf{B})$ split is the projection.

## 3. The 4-current

The classical charge density $\rho$ and current density $\mathbf{J}$
combine into a 4-vector:

$$J = c\rho\,\gamma_0 + J^i\gamma_i$$

(In Gaussian / natural units the $c$ drops out; we use SI here.)

Conservation of charge — the continuity equation
$\partial\rho/\partial t + \nabla\cdot\mathbf{J} = 0$ — becomes

$$\nabla \cdot J = 0$$

a single algebraic constraint on the 4-current.

## 4. The vector derivative

The spacetime gradient is

$$\nabla = \gamma^\mu \partial_\mu = \gamma^0 \partial_t/c + \gamma^i \partial_i$$

where $\gamma^\mu$ are the reciprocal basis (with the metric):
$\gamma^0 = \gamma_0$, $\gamma^i = -\gamma_i$.

The key fact: $\nabla$ acts like a vector under the geometric
product. So $\nabla F$ is a *geometric product* of a vector and a
bivector, which decomposes into a vector part (grade-1) and a
trivector part (grade-3):

$$\nabla F = \underbrace{\nabla \cdot F}_{\text{grade 1 (vector)}} + \underbrace{\nabla \wedge F}_{\text{grade 3 (trivector)}}$$

## 5. Maxwell as one equation

The four Maxwell equations split cleanly along this grade
decomposition.

**Vector part** of $\nabla F$:

$$\nabla \cdot F = J/\epsilon_0$$

Expanded in the rest frame, the time-component reproduces
$\nabla\cdot\mathbf{E} = \rho/\epsilon_0$ (Gauss's law) and the
spatial components reproduce $\nabla\times\mathbf{B} - \partial_t\mathbf{E}/c^2 = \mu_0\mathbf{J}$
(Ampère-Maxwell).

**Trivector part** of $\nabla F$:

$$\nabla \wedge F = 0$$

Expanded, this gives $\nabla\cdot\mathbf{B} = 0$ (no magnetic
monopoles) and $\nabla\times\mathbf{E} + \partial_t\mathbf{B} = 0$
(Faraday's law).

Combining:

$$\boxed{\;\nabla F = J/\epsilon_0\;}$$

— with the implicit understanding that the vector part equals
$J/\epsilon_0$ and the trivector part vanishes (because $J$ is
purely a vector, no trivector source).

> :happygoose: Look what just happened. The four classical
> equations are exactly the grade-1 and grade-3 parts of one
> algebraic statement. The "magnetic monopoles" question becomes
> "is there a trivector source?" — much more natural in the GA
> framing than in the four-equation framing.

## 6. The Lorentz force, also one equation

The Lorentz force on a charge $q$ moving with 4-velocity $v$:

$$\boxed{\;\dot{p} = q\,F \cdot v\;}$$

That's it. The classical decomposition $\mathbf{F} = q(\mathbf{E} + \mathbf{v}\times\mathbf{B})$
is the spatial projection of $F \cdot v$ in the rest frame. The
$\mathbf{v}\times\mathbf{B}$ structure dissolves; the cross
product was always a 3D-only stand-in for the bivector inner
product with a vector.

## 7. Why this matters

Three reasons the GA reformulation is a real improvement, not
just notational compression.

**1. Lorentz covariance is automatic.** The classical four
equations require manual checks that they transform correctly
under boosts. $\nabla F = J/\epsilon_0$ is manifestly covariant —
$\nabla$, $F$, and $J$ are STA objects, and Lorentz transformations
are rotors that act uniformly via the sandwich.

**2. The vector potential is one object.** Define $A$ such that
$F = \nabla \wedge A$. Then $A$ is the spacetime version of the
4-potential $A^\mu = (\phi/c, \mathbf{A})$. The gauge condition
$\nabla \cdot A = 0$ (Lorenz gauge) reduces $\nabla F = J/\epsilon_0$
to the wave equation $\nabla^2 A = J/\epsilon_0$. One step instead
of three.

**3. EM waves are bivector-valued plane waves.** The
electromagnetic plane wave is

$$F = F_0 \exp(I k\cdot x)$$

where $F_0$ is a constant null bivector and $k$ is the wave
4-vector. Polarization (linear, circular, elliptical) is encoded
in the structure of $F_0$. The classical "E parallel to B"
condition for free waves is just the constraint that $F_0$ is null
($F_0^2 = 0$).

> :angrygoose: Heaviside split Maxwell's original (semi-quaternionic)
> formulation into four equations because it was easier to teach in
> the 1880s. By the 1960s, every physicist learned EM as a
> four-equation curriculum and the unification was lost. STA
> recovers it cleanly. We've been teaching the wrong notation for
> 140 years.

## Worked example — point-charge field

For a stationary point charge $q$ at the origin, the 4-current is

$$J = c\rho\,\gamma_0 = c q \delta^3(\mathbf{x})\gamma_0$$

The static EM field bivector is purely electric:

$$F = \mathbf{E} = \frac{q}{4\pi\epsilon_0}\frac{\hat{\mathbf{r}}}{r^2} \boldsymbol{\sigma}_r = \frac{q}{4\pi\epsilon_0}\frac{\mathbf{r}}{r^3}\gamma_0$$

(here $\mathbf{r}$ is a spatial vector and the second-rest-frame
multiplication by $\gamma_0$ converts it to a relative-vector
bivector).

Acting with $\nabla = \gamma^0 \partial_t + \gamma^i \partial_i$
(with $\partial_t = 0$ for the stationary case):

$$\nabla \cdot F = \nabla \cdot \mathbf{E} = \frac{q}{\epsilon_0}\delta^3(\mathbf{r})$$

which matches $J/\epsilon_0$. The trivector part $\nabla \wedge F$
vanishes because $F$ is curl-free in the static case. ✓

For a moving charge — uniform velocity, accelerating, or radiating
— the full Liénard-Wiechert solution falls out by solving
$\nabla F = J/\epsilon_0$ with retarded boundary conditions.
That derivation is a chapter on its own (Ch 15, forthcoming).

## What we proved

- One STA bivector $F = \mathbf{E} + I\mathbf{B}$ contains the
  full electromagnetic field.
- $\nabla F = J/\epsilon_0$ is equivalent to the four Maxwell
  equations.
- The Lorentz force is $\dot{p} = qF\cdot v$.
- The framework is manifestly Lorentz-covariant.

The next chapters of Part IV use these to derive conservation
theorems, the EM field of a moving point charge (Liénard-Wiechert),
electromagnetic waves, and scattering — all with $\nabla F = J/\epsilon_0$
as the starting point instead of four separate equations.

> :weightliftinggoose: $\nabla F = J/\epsilon_0$. Memorize the
> shape. Every electromagnetic calculation in this book starts here.
