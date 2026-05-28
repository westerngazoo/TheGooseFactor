---
sidebar_position: 3
title: "Schwarzschild Black Holes in GTG"
---

# Schwarzschild Black Holes in GTG

> *Doran-Lasenby §14.1–14.3.* The Schwarzschild solution as a
> gauge-field configuration. Event horizons, orbits, and the GTG
> picture of black-hole spacetimes.

The Schwarzschild solution (1916) is the spherically-symmetric
vacuum solution to Einstein's equations — the gravitational field
outside any spherical mass distribution. In GTG, it's a specific
choice of $\bar{h}$ and $\Omega$ that satisfies the vacuum field
equations.

## 1. The Schwarzschild gauge

For a static, spherically symmetric configuration of mass $M$
centered at the origin, the GTG gauge fields are

$$\bar{h}(a) = a + \frac{M}{r}\,(a + \gamma_0 a \gamma_0)$$

(up to factors and signs). In conventional GR, this corresponds to
the **Painlevé-Gullstrand coordinates** — a particular choice
that's regular at the event horizon (unlike standard Schwarzschild
coordinates).

The rotation gauge field is

$$\Omega(a) = \frac{M}{r^2}\hat{r}\,a\,\gamma_0 + ...$$

— the rotational gauge encodes the gravitational redshift and
the curvature.

## 2. The metric

Computing $g(a, b) = \bar{h}(a)\cdot\bar{h}(b)$ from the GTG
gauge fields gives the **Schwarzschild metric** in the form

$$ds^2 = (1 - 2M/r)\,c^2 dt^2 - (1 - 2M/r)^{-1}\,dr^2 - r^2 d\Omega^2$$

— the classic Schwarzschild form. At $r = 2M$ (in geometric units;
$r_s = 2GM/c^2$ in SI), the metric is singular — the **event
horizon**.

The geometry has two specials:

1. The **event horizon** at $r = r_s$ — the boundary beyond which
   light cannot escape.
2. The **singularity** at $r = 0$ — where curvature diverges.

Only the horizon depends on the coordinate choice; in
Painlevé-Gullstrand coordinates (the GTG-natural ones), the
horizon is a regular point of the gauge field.

## 3. Geodesics in Schwarzschild

A particle's worldline satisfies $D_v v = 0$. For Schwarzschild,
this gives the **geodesic equation** with effective potential

$$V_{\rm eff}(r) = -\frac{M}{r} + \frac{|L|^2}{2\mu r^2} - \frac{M|L|^2}{\mu r^3}$$

— exactly the equation we analyzed in [Ch 6](/physics-ga/part-2-classical-mechanics/celestial-mechanics-and-perturbations).
The third term is the GR correction that gave the 43''/century
Mercury precession.

**Bound orbits**: stable circular orbits exist for $r > 6M$. Below
$r = 6M$ (the **ISCO** — Innermost Stable Circular Orbit), orbits
spiral in.

**Photon sphere**: at $r = 3M$, photons can orbit (unstable). This
sets the boundary of the "shadow" seen by the Event Horizon
Telescope around M87* and Sgr A*.

> :surprisedgoose: The Event Horizon Telescope image of M87* (2019)
> and Sgr A* (2022) directly show the **photon sphere** silhouette
> — light orbiting the black hole at $r = 3M$. The bright ring in
> those iconic images is the photon sphere; the dark center is
> the event horizon shadow. GR's predictions, made in 1916,
> directly observed in 2019.

## 4. The Kruskal-Szekeres extension

Schwarzschild coordinates have a coordinate singularity at $r = r_s$.
The **Kruskal-Szekeres** extension (1960) gives global coordinates
that cover the entire maximally-extended spacetime:

- Region I: exterior, $r > r_s$ (our universe).
- Region II: interior, $0 < r < r_s$ (black hole).
- Region III: another exterior, $r > r_s$ (a "parallel universe").
- Region IV: another interior, the white hole.

This is the **maximally extended** Schwarzschild geometry. The
physical universe corresponds to Region I; the other regions are
mathematical artifacts of analytically continuing the solution.

In GTG, these regions correspond to different gauge choices on
the same gauge field configuration. The gauge fields are
globally well-defined; the metric is what acquires coordinate
singularities.

## 5. Falling into a black hole

For an observer falling radially inward, proper time to the
singularity is **finite**:

$$\Delta\tau = \frac{\pi}{c}\sqrt{\frac{r_0^3}{2GM}}$$

For a stellar-mass black hole ($M \sim 1 M_\odot$, $r_s \sim 3$ km),
this is on the order of microseconds. For a supermassive black
hole ($M \sim 4\times 10^6 M_\odot$ for Sgr A*), the timescale is
seconds.

Approaching the singularity, **tidal forces** stretch the
infalling observer along the radial direction and compress
transversally — **spaghettification**. For a stellar-mass BH,
spaghettification occurs **outside** the horizon; for a
supermassive BH, it occurs **inside**.

## 6. Gravitational redshift

A light signal emitted from radius $r_{\rm em}$ and received at
$r_{\rm rec}$ has frequency shift

$$\frac{f_{\rm rec}}{f_{\rm em}} = \sqrt{\frac{1 - 2M/r_{\rm em}}{1 - 2M/r_{\rm rec}}}$$

For $r_{\rm em} < r_{\rm rec}$, $f_{\rm rec} < f_{\rm em}$ —
**redshift**. As $r_{\rm em} \to r_s$, the redshift becomes
infinite — light from the horizon is infinitely redshifted.

For the Sun: gravitational redshift $\sim 10^{-6}$, measurable
in the Pound-Rebka experiment (1959) and GPS clock corrections.
For a neutron star: redshift $\sim 0.2$ — easily measurable in
X-ray spectroscopy.

## 7. Hawking radiation

In 1974, Hawking showed that black holes radiate **thermally** at
temperature

$$T_H = \frac{\hbar c^3}{8\pi G M k_B}$$

For a solar-mass black hole: $T_H \approx 6\times 10^{-8}$ K —
fantastically cold, lost in the cosmic microwave background.
For a primordial black hole of mass $\sim 10^{12}$ kg, $T_H$ would
be in the MeV range and the black hole would be evaporating
*now*.

The black hole's mass decreases:

$$\frac{dM}{dt} \sim -\frac{1}{M^2}$$

with lifetime $\tau \sim M^3$. A solar-mass BH lasts $\sim 10^{67}$
years; a $10^{12}$-kg primordial BH lasts $\sim 10^{17}$ s — about
the age of the universe.

Hawking's derivation uses quantum field theory in curved
spacetime. In GA, this means: solve a wave equation on the
Schwarzschild geometry, identify the in- and out-going modes,
and compute the Bogoliubov coefficients. The thermal spectrum
emerges.

> :angrygoose: Hawking radiation is the unification (so far) of
> general relativity, quantum field theory, and thermodynamics.
> Hawking's $T = \hbar c^3/(8\pi G M k_B)$ contains all three
> constants — $\hbar$, $c$, $G$ — plus $k_B$. It's the only
> known formula where all four show up cleanly, and it points
> at the deep structure of quantum gravity (whatever that turns
> out to be).

## 8. Black hole entropy

Bekenstein (1972) and Hawking (1974) gave the black hole **entropy**:

$$\boxed{\; S_{\rm BH} = \frac{k_B c^3 A}{4 G \hbar} = \frac{k_B A}{4 \ell_P^2} \;}$$

with $A$ the horizon area and $\ell_P = \sqrt{\hbar G/c^3}$ the
Planck length. The factor of $1/4$ is exact and falls out of
the careful derivation.

This entropy scales with **area**, not volume — the holographic
principle's first hint. A solar-mass BH has $\sim 10^{77}$ bits
of entropy.

## 9. Spinning black holes (Kerr)

The Kerr solution (1963) generalizes Schwarzschild to **rotating**
black holes. The GA / GTG version uses a different choice of
$\bar{h}$ and $\Omega$ — encoding both mass and angular momentum.

Key features:

- **Ergosphere**: a region outside the event horizon where space
  is dragged so strongly that no observer can remain stationary.
- **Inner horizon**: a second horizon inside the outer one.
- **Singularity ring**: not a point, but a ring in the equatorial
  plane.

The Kerr solution's full GA treatment is in D-L §14.5. It's
phenomenologically important: real astrophysical black holes
(from stellar collapse, AGN, etc.) are Kerr, not Schwarzschild,
because they have angular momentum.

## What we covered

- Schwarzschild solution as a GTG gauge configuration; the
  metric in standard and Painlevé-Gullstrand coordinates.
- Event horizon at $r = 2M$ (Schwarzschild radius).
- Geodesics: ISCO at $r = 6M$, photon sphere at $r = 3M$.
- Kruskal-Szekeres extension: 4 regions of maximally extended
  spacetime.
- Falling in: finite proper time, spaghettification.
- Gravitational redshift, Pound-Rebka, GPS corrections.
- Hawking radiation $T_H = \hbar c^3/(8\pi G M k_B)$.
- Bekenstein-Hawking entropy $S = k_B A/(4\ell_P^2)$.
- Kerr: rotating black holes, ergosphere, ring singularity.

## What's next

[Chapter 26](/physics-ga/part-6-gauge-gravity/cosmology) —
cosmological solutions. The expanding universe, FRW spacetimes,
the cosmological constant problem, and inflation in the GTG
framework.
