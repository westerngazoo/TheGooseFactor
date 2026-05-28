---
sidebar_position: 2
title: "The Gravitational Field Equations"
---

# The Gravitational Field Equations

> *Doran-Lasenby §13.4–13.6.* Einstein's equations derived in GTG.
> The vacuum case, the matter case, and the structure that makes
> $\mathcal{G}(a) = 8\pi G\,\mathcal{T}(a)/c^4$ the natural endpoint.

The Einstein field equations are the heart of general relativity.
This chapter spells out their GTG derivation and the
structure-preserving manipulations that take "couple gauge fields
to matter" to "$\mathcal{G} = 8\pi G\mathcal{T}/c^4$."

## 1. The Einstein-Hilbert action

In conventional GR, the action is

$$S_{\rm EH} = \frac{c^4}{16\pi G}\int R\,\sqrt{-g}\,d^4x$$

with $R$ the Ricci scalar and $\sqrt{-g}$ the volume element. In
GTG, this becomes

$$S_{\rm GTG} = \frac{c^4}{16\pi G}\int \mathcal{R}\,|h|\,d^4x$$

with $\mathcal{R}$ the GA Ricci scalar from [Ch 23 §5](/physics-ga/part-6-gauge-gravity/gauge-principles-for-gravitation)
and $|h| = \det\bar{h}$ the volume scaling from the position gauge
field.

Varying with respect to $\bar{h}$ and $\Omega$ — treating them as
independent fields — gives two equations. The $\Omega$ variation
gives a **torsion-free** condition (the connection is symmetric
in lower indices); the $\bar{h}$ variation gives the field
equations.

## 2. Varying $\bar{h}$: the Einstein equation

After the $\Omega$ variation imposes torsion-freedom, the
$\bar{h}$ variation produces

$$\boxed{\; \mathcal{G}(a) = \frac{8\pi G}{c^4}\,\mathcal{T}(a) \;}$$

with $\mathcal{G}(a)$ the **Einstein tensor** in GA form:

$$\mathcal{G}(a) = \mathcal{R}(a) - \tfrac{1}{2}\mathcal{R}\,a$$

where $\mathcal{R}(a)$ is the Ricci tensor (vector-valued function
of a vector) and $\mathcal{R}$ is the Ricci scalar.

The Einstein tensor satisfies $\nabla\cdot\mathcal{G} = 0$
automatically — the **Bianchi identity**. This is the GA
realization of the second Bianchi identity from tensor calculus.

## 3. Conservation of stress-energy

The Bianchi identity, combined with Einstein's equations, forces

$$\nabla\cdot\mathcal{T} = 0$$

— **stress-energy conservation** — as a consequence of the field
equations. The matter doesn't have to be told to conserve
4-momentum; the gravity equations force it.

This is one of the great structural results of GR: gravity itself
enforces conservation of energy-momentum. In GA, it's a one-line
consequence of $\nabla\cdot\mathcal{G} = 0$.

## 4. The vacuum case

For $\mathcal{T} = 0$ (vacuum), Einstein's equation reduces to

$$\mathcal{R}(a) = \tfrac{1}{2}\mathcal{R}\,a$$

Contracting with $\gamma^\mu$ and tracing:

$$\mathcal{R} = \tfrac{1}{2}\mathcal{R}\cdot 4 = 2\mathcal{R} \quad\Rightarrow\quad \mathcal{R} = 0$$

So vacuum has zero Ricci scalar, and consequently $\mathcal{R}(a) = 0$
for all $a$.

**Vacuum**: $\mathcal{R}(a) = 0$ — Ricci-flat. The Riemann tensor
$\mathcal{R}(B)$ can still be non-zero (just not its contraction);
these correspond to **gravitational waves** and other vacuum
solutions like Schwarzschild.

## 5. Linearized gravity

For weak gravitational fields, write $\bar{h}(a) = a + h(a)$ with
$h(a)$ a small perturbation. Linearize:

$$\nabla^2 h_{\mu\nu} - \nabla_\mu\nabla^\nu h_{\nu\rho} - \nabla_\rho\nabla^\nu h_{\nu\mu} + ... = -16\pi G T_{\mu\nu}/c^4$$

After gauge-fixing (Lorenz gauge for gravity), the linearized
equation becomes

$$\nabla^2 \bar{h}_{\mu\nu} = -16\pi G T_{\mu\nu}/c^4$$

— a **wave equation** with the matter as source. Solutions are
**gravitational waves** propagating at $c$.

For the matter-less case, gravitational waves have two transverse
polarizations (the "plus" $h_+$ and "cross" $h_\times$ modes) —
corresponding to two bivector polarization states in the GA
formulation.

> :surprisedgoose: Gravitational waves were predicted by Einstein
> in 1915 from the linearized field equations, but they weren't
> directly detected until LIGO 2015 — exactly a century later.
> The amplitude is fantastically small (strain $h \sim 10^{-21}$
> on Earth from black-hole mergers across the universe), which
> is why detection took a century.

## 6. The cosmological constant

The most general second-order field equation consistent with
diffeomorphism invariance is

$$\mathcal{G}(a) + \Lambda\,a = \frac{8\pi G}{c^4}\mathcal{T}(a)$$

with $\Lambda$ the **cosmological constant** — Einstein's original
addition (1917) to make the universe static. He later called it
"my greatest blunder" when Hubble's expansion was discovered.

But $\Lambda$ turned out to be needed after all: observation of
the **accelerating expansion** of the universe (1998 supernova
results) requires $\Lambda > 0$. The current "$\Lambda$-CDM" model
of cosmology takes $\Lambda$ as fundamental.

The natural-units value: $\Lambda \sim 10^{-52}\,{\rm m}^{-2}$ —
fantastically small in natural Planck units, but non-zero.

## 7. The Lovelock theorem

**Lovelock's theorem** (1971): in 4D, the unique second-order
divergence-free tensor built from the metric and its derivatives
is the Einstein tensor plus the cosmological constant times the
metric. So Einstein's equation **is uniquely determined** by:

1. Spacetime dimension 4.
2. Second-order in derivatives (no $\nabla^3 g$ etc.).
3. Divergence-free (conservation).

In GA, Lovelock's theorem says: $\mathcal{G}(a) + \Lambda a$ is
the unique linear, divergence-free, vector-valued function of a
vector built from $\bar{h}$ and $\Omega$ at second order. The
constraint is structural.

This is **why** GR is what it is — not because Einstein got lucky,
but because the constraints leave no alternatives in 4D at second
order.

## 8. Higher-dimensional generalizations

In $D > 4$ dimensions, Lovelock's theorem allows **higher-order
curvature corrections** — Gauss-Bonnet terms in 5D, Lovelock
gravity in general. These appear in string theory and other
high-dimension contexts.

In GA, these higher-order terms are higher-grade contractions of
$\mathcal{R}(B)$. The structure stays algebraic and computable;
the physics is more elaborate.

## 9. The Palatini formulation

A "first-order" formulation: treat $\bar{h}$ and $\Omega$ as
**fully independent** in the action (without imposing
torsion-freedom by hand). The $\Omega$-variation then **derives**
the torsion-free condition.

In GA, this is straightforward — both $\bar{h}$ and $\Omega$ are
just multivector-valued functions, and varying with respect to
either gives an Euler-Lagrange equation. The Palatini approach
is conceptually cleaner: you don't have to know to impose
torsion-freedom; the variational principle gives it to you.

## 10. The Schrödinger limit

For non-relativistic, weak-field gravity:

$$\bar{h}(a) \approx a + 2\Phi\,(a\cdot\gamma_0)\gamma_0$$

with $\Phi$ the Newtonian gravitational potential. The field
equation $\mathcal{G}(a) = 8\pi G\mathcal{T}/c^4$ reduces to
**Poisson's equation**:

$$\nabla^2 \Phi = 4\pi G\rho$$

with $\rho$ the matter density. Newton's law of gravity emerges as
the weak-field limit of GTG, just as it does for GR.

> :weightliftinggoose: GR / GTG predictions in the weak-field
> limit: Newton's gravity, the Mercury perihelion precession (43''
> /century from [Ch 6](/physics-ga/part-2-classical-mechanics/celestial-mechanics-and-perturbations)),
> light bending (1.75'' at the Sun), GPS clock corrections (38
> μs/day), Shapiro time delay. All verified to many significant
> figures. The full GR predictions (black-hole mergers, neutron-
> star inspirals, gravitational waves) take us into LIGO and
> Event Horizon Telescope territory.

## What we covered

- Einstein-Hilbert action in GTG form $S = \frac{c^4}{16\pi G}\int\mathcal{R}\,|h|\,d^4x$.
- Varying $\bar{h}$ gives Einstein's equation
  $\mathcal{G}(a) = 8\pi G\mathcal{T}(a)/c^4$.
- Bianchi identity $\nabla\cdot\mathcal{G} = 0$ forces
  stress-energy conservation.
- Vacuum: $\mathcal{R}(a) = 0$; gravitational waves are
  Ricci-flat oscillations.
- Linearized gravity: wave equation with two polarizations.
- Cosmological constant $\Lambda$ — needed by observation.
- Lovelock theorem makes Einstein's equation unique in 4D at
  second order.
- Newtonian limit recovers $\nabla^2\Phi = 4\pi G\rho$.

## What's next

[Chapter 25](/physics-ga/part-6-gauge-gravity/schwarzschild-black-holes) —
the exact Schwarzschild solution for a spherically-symmetric mass.
Event horizons, ISCO orbits, and Hawking radiation in the GTG
framework.
