---
sidebar_position: 5
title: "Cylindrical and Axially-Symmetric Systems"
---

# Cylindrical and Axially-Symmetric Systems

> *Doran-Lasenby §14.5, 14.7.* Spacetimes with rotational symmetry
> around an axis. The Kerr black hole, frame dragging, cosmic
> strings.

The Schwarzschild solution is spherically symmetric. The next
class of physically relevant geometries adds rotation around an
axis — **axially symmetric** spacetimes. The Kerr metric for
rotating black holes is the headliner.

## 1. Axial symmetry

A spacetime has **axial symmetry** if it's invariant under
rotations around a fixed axis. This is weaker than spherical
symmetry (which requires invariance under all rotations).

GTG description: $\bar{h}$ and $\Omega$ commute with the
azimuthal rotor $R_\phi = \exp(\boldsymbol{\sigma}_z \phi/2)$ for
any $\phi$.

Examples:

- **Kerr black hole**: rotating mass.
- **Cosmic string**: thin, infinite line of mass-energy.
- **Schwarzschild as limit**: zero angular momentum.

## 2. The Kerr metric

For a rotating black hole of mass $M$ and angular momentum $J = Mac$
(with $a$ the spin parameter), the Kerr metric in
Boyer-Lindquist coordinates is

$$ds^2 = \left(1 - \frac{2Mr}{\Sigma}\right)c^2dt^2 + \frac{4Mar\sin^2\theta}{\Sigma}c\,dt\,d\phi - \frac{\Sigma}{\Delta}dr^2 - \Sigma\,d\theta^2 - \frac{(r^2+a^2)^2 - a^2\Delta\sin^2\theta}{\Sigma}\sin^2\theta\,d\phi^2$$

with $\Sigma = r^2 + a^2\cos^2\theta$ and $\Delta = r^2 - 2Mr + a^2$.

Setting $a = 0$ recovers Schwarzschild.

In GTG, the Kerr gauge configuration involves both timelike and
spacelike-rotational components of $\Omega$ — the spinning mass
**drags spacetime around with it**.

## 3. Horizons of Kerr

The Kerr metric has **two** horizons (where $\Delta = 0$):

$$r_\pm = M \pm \sqrt{M^2 - a^2}$$

- **Outer horizon** $r_+$: the event horizon.
- **Inner horizon** $r_-$: the Cauchy horizon (a coordinate
  singularity where determinism breaks down).

For $a > M$: no horizons exist — a **naked singularity**, which
the **cosmic censorship conjecture** (Penrose, 1969) forbids in
realistic gravitational collapse. So real BHs have $a \le M$.

The **extremal Kerr** limit $a = M$ is the boundary; the two
horizons coincide at $r = M$.

## 4. The ergosphere

Outside the outer horizon, there's another surface where the time
Killing vector becomes null:

$$r_{\rm erg}(\theta) = M + \sqrt{M^2 - a^2\cos^2\theta}$$

Between $r_+ < r < r_{\rm erg}$ is the **ergosphere** — a region
where:

- Light cones tilt to such an angle that no observer can remain
  stationary with respect to infinity.
- All observers are "**dragged**" in the direction of the black
  hole's rotation.
- Negative-energy orbits exist.

The ergosphere extends outside the event horizon — observers in
the ergosphere can still escape to infinity, but they cannot
stay still relative to the BH.

> :surprisedgoose: The ergosphere is one of the most counterintuitive
> phenomena in GR: spacetime is **dragged** so strongly by the
> rotating mass that resisting rotation requires faster-than-light
> motion. The black hole's spin literally rotates the surrounding
> spacetime — frame dragging — and within the ergosphere this
> rotation is total.

## 5. Frame dragging — the Lense-Thirring effect

For weak fields and slow rotation, the leading-order effect is
**Lense-Thirring frame dragging**: a small gyroscope near a
rotating mass precesses with rate

$$\Omega_{\rm LT} = \frac{2G\,\mathbf{J}}{c^2 r^3}$$

with $\mathbf{J}$ the angular momentum vector of the central
mass.

This was measured by **Gravity Probe B** (2011) using gyroscopes
in polar orbit around Earth: the predicted precession rate is
$\sim 0.04$"/yr (Earth's angular momentum is small in geometric
units), and GPB confirmed it to within errors.

## 6. The Penrose process

Penrose (1969) showed that the ergosphere allows **energy
extraction** from a rotating black hole. Drop a particle into the
ergosphere, have it split such that one piece falls into the BH
on a negative-energy orbit, and the escaping piece carries more
energy than the original.

The maximum extractable energy is about **29%** of the Kerr BH's
mass — the rest is "irreducible" mass.

In astrophysics, this is the mechanism that powers **relativistic
jets** from AGN and quasars: rotating supermassive black holes
extract their rotational energy via the **Blandford-Znajek
process** (the EM-field-mediated version of the Penrose process).

## 7. Geodesics in Kerr

The Kerr geodesic equation has FOUR independent conserved quantities:

- **Energy** $E$ — conservation under time translation.
- **Axial angular momentum** $L_z$ — conservation under axial
  rotation.
- **Rest mass** $m^2$ — magnitude of 4-momentum.
- **Carter constant** $Q$ — Carter's 1968 discovery.

The Carter constant is a **fourth integral of motion** that's not
obviously connected to a symmetry — it comes from a "hidden"
Killing tensor of the Kerr geometry. With it, Kerr geodesics are
**completely integrable** — can be solved by separation of
variables.

This is remarkable: Kerr is one of the very few non-trivial
metrics where geodesics are exactly solvable. It makes Kerr the
favorite test bed for black-hole physics.

> :nerdygoose: Carter's constant feels mysterious because there's
> no obvious symmetry generating it. The deeper reason is that
> Kerr admits a **Killing-Yano tensor** — a higher-grade
> generalization of a Killing vector. In GA, this is naturally a
> bivector-valued symmetry. The Killing-Yano structure of Kerr is
> what gives both the Carter constant AND the separability of the
> Dirac and Klein-Gordon equations on the Kerr background. Deep.

## 8. Cosmic strings

A **cosmic string** is a hypothetical thin, infinite line of
mass-energy that may have formed in the early universe via
spontaneous symmetry breaking. The exterior metric is

$$ds^2 = c^2 dt^2 - dr^2 - r^2(d\phi^2)(1 - 4G\mu/c^2)^{-2} - dz^2$$

with $\mu$ the string's linear mass density. The spacetime is
**locally flat** but globally has a **conical defect** — the
angular range is reduced from $2\pi$ to $2\pi(1 - 4G\mu/c^2)$,
i.e., a "**missing wedge**" of size $8\pi G\mu/c^2$.

Cosmic strings are predicted by some Grand Unified Theories but
have never been observed. Current observational limits put
$G\mu/c^2 < 10^{-7}$ — strings, if they exist, must be very
light.

The flat-but-non-trivial topology is captured in GA by the
**holonomy** of the gauge field around the string — a discrete
deficit in the rotation angle when you parallel-transport a
vector around the string.

## 9. Numerical relativity preview

For systems without exact solutions — binary black-hole mergers,
asymmetric collapses, gravitational wave sources — **numerical
relativity** is required. The GTG formulation is well-suited
for this because:

- The gauge fields $\bar{h}$ and $\Omega$ are bivector / linear-
  function-valued, fitting cleanly into computational frameworks.
- The flat-spacetime background avoids coordinate-singularity
  issues that plague metric-based codes.
- The Einstein equation in GTG form is hyperbolic and well-posed
  for initial-value problems.

In practice, numerical relativity uses the "BSSN" or
"generalized harmonic" formulations of GR — not directly GTG. But
GTG-style approaches have been explored.

The LIGO detections of binary black-hole mergers (2015+) used
numerical relativity to compute the template waveforms; the data
analysis confirms GR (and by extension GTG) to %-level precision
in the strong-field regime.

## What we covered

- Axial symmetry: invariance under rotations around an axis.
- Kerr metric for rotating BHs; horizons $r_\pm = M \pm \sqrt{M^2 - a^2}$.
- Cosmic censorship: $a \le M$ for realistic BHs.
- Ergosphere: region where spacetime dragging dominates.
- Lense-Thirring frame dragging; Gravity Probe B confirmation.
- Penrose process: extract up to 29% of Kerr BH energy.
- Kerr geodesics integrable thanks to Carter's constant.
- Cosmic strings: conical-defect spacetimes from symmetry breaking.
- Numerical relativity for non-symmetric configurations (LIGO).

## What's next

That closes Part VI — gauge theory gravity. [Part VII](/physics-ga/part-7-geometric-calculus/coming-soon)
returns to the algebraic foundations: **geometric calculus**.
The vector derivative, integration on manifolds, generalized
Stokes's theorem, and the embedding of differential geometry into
the GA framework.
