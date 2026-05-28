---
sidebar_position: 4
title: "Cosmology"
---

# Cosmology

> *Doran-Lasenby §14.6.* The Friedmann-Robertson-Walker spacetimes
> in GTG, the expanding universe, dark energy, and inflation.

The largest-scale application of GR is cosmology — the dynamics
of the universe as a whole. The FRW solutions describe a
homogeneous, isotropic universe; the GTG formulation gives the
same answers as conventional cosmology, with the gauge fields
showing the expansion as a time-dependent rescaling.

## 1. The cosmological principle

**Cosmological principle**: on large enough scales, the universe
is **homogeneous** (translation-invariant) and **isotropic**
(rotation-invariant). Empirically confirmed by:

- The cosmic microwave background (CMB) — nearly perfectly
  uniform over the sky (deviations $\sim 10^{-5}$).
- Galaxy counts — random distribution above scales $\sim 100$ Mpc.
- Hubble's law — recession velocity proportional to distance,
  no preferred direction.

These observations constrain the spacetime geometry: the only
homogeneous, isotropic spacetimes are the **Friedmann-Robertson-
Walker (FRW)** spacetimes.

## 2. The FRW metric

The FRW metric is

$$ds^2 = c^2 dt^2 - a(t)^2\left[\frac{dr^2}{1 - kr^2} + r^2 d\Omega^2\right]$$

with $a(t)$ the **scale factor** (encoding the expansion) and
$k \in \{-1, 0, +1\}$ the **spatial curvature**:

- $k = -1$: open (hyperbolic) universe.
- $k = 0$: flat universe.
- $k = +1$: closed (spherical) universe.

In GTG, this is encoded by

$$\bar{h}(a) = (a\cdot\gamma_0)\gamma_0 + a^i\gamma_i/a(t)$$

for $k = 0$ (flat case; the curved cases need a more elaborate
$\bar{h}$). The time-dependent rescaling of spatial vectors **is**
the cosmic expansion.

## 3. The Friedmann equations

For a matter-filled FRW universe, the Einstein equations reduce
to the **Friedmann equations**:

$$\left(\frac{\dot{a}}{a}\right)^2 = \frac{8\pi G}{3}\rho - \frac{k c^2}{a^2} + \frac{\Lambda c^2}{3}$$

$$\frac{\ddot{a}}{a} = -\frac{4\pi G}{3}(\rho + 3p/c^2) + \frac{\Lambda c^2}{3}$$

with $\rho$ matter density, $p$ pressure, $\Lambda$ cosmological
constant. The first equation is the **constraint** (Hubble's law
in differential form); the second is the **dynamics** (acceleration
equation).

The **Hubble parameter** is $H = \dot{a}/a$; current value
$H_0 \approx 70$ km/s/Mpc.

## 4. The matter content

Different matter types have different equations of state $p = w\rho c^2$:

- **Matter** (dust, galaxies): $w = 0$, $p = 0$. Density scales
  as $\rho_m \propto 1/a^3$.
- **Radiation** (photons, neutrinos): $w = 1/3$. Density scales as
  $\rho_r \propto 1/a^4$.
- **Cosmological constant** ($\Lambda$): $w = -1$. Density
  constant.
- **Curvature** ($k$): $w = -1/3$ (effective). Density scales as
  $\rho_k \propto 1/a^2$.

The current universe is dominated by $\Lambda$ ($\Omega_\Lambda \approx 0.7$)
and **dark matter** ($\Omega_m \approx 0.3$ split into baryonic
$\sim 0.05$ and dark $\sim 0.25$). Radiation is negligible now
($\Omega_r \sim 10^{-4}$) but dominated for the first $\sim 10^4$
years.

## 5. The hot big bang

Running the Friedmann equations backwards: as $a \to 0$, density
diverges, temperature increases, and the universe was hot, dense,
and radiation-dominated. The standard timeline:

| Time after Big Bang | Temperature | Physics |
|---|---|---|
| $10^{-43}$ s | $10^{32}$ K | Planck era (quantum gravity?) |
| $10^{-35}$ s | $10^{27}$ K | Inflation? |
| $10^{-12}$ s | $10^{15}$ K | Electroweak symmetry breaking |
| $10^{-6}$ s | $10^{13}$ K | Quarks to hadrons |
| 1 s | $10^{10}$ K | Neutrino decoupling |
| 3 min | $10^9$ K | Nucleosynthesis (BBN) |
| 380,000 yr | $3000$ K | CMB last scattering |
| $\sim 100$ Myr | | First stars (reionization) |
| 13.8 Gyr | 2.7 K | Today (CMB temperature) |

GR provides the framework; specific physics (particle physics,
nucleosynthesis, structure formation) fills in the details.

## 6. The cosmic microwave background

At $T \approx 3000$ K, the universe became transparent — photons
stopped scattering off ionized matter when nuclei + electrons
combined into neutral hydrogen. The radiation released then is
the CMB, now redshifted to **2.7 K** (peak wavelength $\sim 1$ mm).

CMB anisotropies ($\Delta T/T \sim 10^{-5}$) encode the
**density perturbations** at recombination — the seeds of all
later structure formation (galaxies, galaxy clusters). Measurements
by COBE (1992), WMAP (2003), and Planck (2013) have constrained
the cosmological parameters to ~1% precision.

## 7. Dark energy

The 1998 supernova observations (Perlmutter, Riess, Schmidt) found
that the universe's expansion is **accelerating**. The Friedmann
acceleration equation requires the right-hand side to be positive:

$$-\frac{4\pi G}{3}(\rho + 3p/c^2) + \frac{\Lambda c^2}{3} > 0$$

For matter ($w = 0$) or radiation ($w = 1/3$), the first term is
negative. Acceleration requires either a positive $\Lambda$ or
matter with $w < -1/3$ — a **dark energy** component.

The simplest fit: $\Lambda$, with $\Omega_\Lambda \approx 0.69$.
The theoretical expectation from QFT vacuum energy is $\Lambda_{\rm QFT} \sim 10^{120}\,\Lambda_{\rm obs}$
— **the cosmological constant problem**. We don't know why
$\Lambda$ is so much smaller than its naïve quantum-field-theory
estimate.

> :angrygoose: The cosmological constant problem is the worst
> theoretical prediction in physics — off by 120 orders of
> magnitude. Either our QFT calculation is missing something
> (the answer should involve $\hbar G/c^4 \sim$ Planck-scale
> physics), or there's a profound mechanism that cancels the
> vacuum energy nearly perfectly. Nobody knows. This is the
> single biggest open problem in fundamental physics.

## 8. Inflation

In the early universe ($t \sim 10^{-35}$ s), the universe likely
underwent an exponential expansion phase — **inflation** — driven
by a hypothetical scalar field ("inflaton"). This solves three
problems:

1. **Horizon problem**: The CMB is uniform across regions that
   were never in causal contact in standard Big Bang. Inflation
   stretches them out from a small initial patch.
2. **Flatness problem**: The universe is observed to be spatially
   flat to extreme precision. Without inflation, this would require
   fantastic fine-tuning.
3. **Magnetic monopoles**: Grand unified theories predict
   monopoles; none are observed. Inflation dilutes them away.

Inflation also seeds the **primordial perturbations** (quantum
fluctuations of the inflaton, stretched to cosmological scales)
that became the CMB anisotropies and galaxies.

In GTG, inflation is described by the same field-equations
machinery with a scalar field as the matter content. The
inflaton's potential $V(\phi)$ determines the expansion history.

## 9. The fate of the universe

For $\Omega_\Lambda > 0$ and current observations, the universe
**expands forever** at an accelerating rate. The far future:

- $t \sim 10^{14}$ yr: last stars die.
- $t \sim 10^{40}$ yr: protons decay (if they decay; lifetime
  uncertain).
- $t \sim 10^{67}$ yr: stellar-mass BHs evaporate via Hawking.
- $t \sim 10^{100}$ yr: largest known BHs evaporate.
- $t \to \infty$: heat death; the universe approaches a cold,
  near-empty de Sitter space.

This is the "**heat death**" or "**Big Rip**" scenario, depending
on whether $\Lambda$ is exactly constant or has a slight
time-dependence. Currently the data is consistent with constant
$\Lambda$ and a heat death.

> :weightliftinggoose: Cosmology in 100 years has gone from "we
> don't know if the universe is finite or infinite, dynamic or
> static" (early 1900s) to "the universe is 13.8 Gyr old, 70%
> dark energy, 25% dark matter, 5% normal stuff, flat to within
> a percent, accelerating." Theory, observation, and (in GA's
> case) algebraic elegance, all converging.

## What we covered

- Cosmological principle constrains spacetime to FRW.
- FRW metric in GTG: time-dependent spatial rescaling.
- Friedmann equations from Einstein's equation under FRW symmetry.
- Matter / radiation / Λ / curvature scaling laws.
- Hot big bang timeline; CMB at $T = 2.7$ K.
- Dark energy from 1998 supernovae; $\Omega_\Lambda \approx 0.69$.
- Cosmological constant problem ($10^{120}$ orders of magnitude).
- Inflation solves horizon, flatness, monopole problems.
- Far-future fate: heat death.

## What's next

[Chapter 27](/physics-ga/part-6-gauge-gravity/cylindrical-and-axially-symmetric) —
cylindrical and axially symmetric systems. Cosmic strings, the
Kerr solution in detail, frame dragging, and the Penrose
process for extracting energy from a rotating black hole.
