---
sidebar_position: 4
title: "Electromagnetic Waves"
---

# Electromagnetic Waves

> *Doran-Lasenby §7.4.* Plane EM waves as null bivectors in STA.
> Polarization (linear, circular, elliptical) emerges from the
> structure of the bivector amplitude.

In a source-free region ($J = 0$), Maxwell's equation reduces to

$$\nabla F = 0$$

This is the **wave equation** for the EM field bivector. Its
solutions are propagating waves, and the GA formulation exposes
their bivector structure directly — polarization becomes algebraic.

## 1. The plane-wave ansatz

Try

$$F(x) = F_0\,\exp(I k\cdot x)$$

where $F_0$ is a constant bivector, $k$ is a constant 4-vector
(the wave 4-vector), and $I$ is the STA pseudoscalar. Plug into
$\nabla F = 0$:

$$\nabla F = \nabla(F_0 e^{Ik\cdot x}) = F_0\,(\nabla(I k\cdot x))\,e^{...} = F_0\, I\, k\, e^{Ik\cdot x}$$

(using that the gradient of $k\cdot x$ is $k$, and $I$ anti-commutes
with vectors — so $\nabla$ acting from the left brings down an $Ik$).
For this to vanish:

$$F_0\, I\, k = 0$$

Multiply by $\tilde{I}$ on the right: $F_0 \, I \, k\,\tilde{I} = -F_0 k I \tilde{I}$ (using anti-commutation rules). After simplification:

$$\boxed{\; k\cdot F_0 = 0, \qquad k^2 = 0 \;}$$

Two conditions:
1. $k$ is a **null** vector — $k^2 = 0$, i.e., $\omega = c|\mathbf{k}|$. EM waves travel at the speed of light.
2. $F_0$ is **transverse** to $k$ — $k\cdot F_0 = 0$. The field bivector is in the plane perpendicular to the wave direction.

This is the GA-native form of the **dispersion relation** plus the
**transversality** of electromagnetic waves.

## 2. The bivector amplitude

A bivector $F_0$ that satisfies $k\cdot F_0 = 0$ can be written as

$$F_0 = \mathbf{e}_1 \wedge \mathbf{e}_2$$

for two real vectors $\mathbf{e}_1, \mathbf{e}_2$ both perpendicular
to $\mathbf{k}$ in the spatial sense. The wave's "amplitude" is this
2D-tangent bivector in the plane perpendicular to propagation.

For a wave propagating in the $\gamma_3$ direction with
$k = \omega(\gamma_0 + \gamma_3)/c$ (null vector in $(+,-,-,-)$):

$$F_0 = \mathbf{E}_0 + I\mathbf{B}_0, \quad \mathbf{E}_0 \perp \hat{\mathbf{k}}, \quad \mathbf{B}_0 \perp \hat{\mathbf{k}}$$

And the **null condition** $F_0^2 = 0$ for a free wave requires
$|\mathbf{E}_0| = c|\mathbf{B}_0|$ with $\mathbf{E}_0 \perp \mathbf{B}_0$ —
the classical free-wave constraint that $E$ and $B$ are perpendicular
and in ratio $c$.

> :nerdygoose: $F_0^2 = 0$ for a plane wave is the **null bivector
> condition** — bivectors whose geometric square is zero. In STA,
> the null bivectors form a 4-dimensional submanifold of the
> 6-dimensional bivector space, and they parameterize free-EM-wave
> amplitudes. Each null bivector is a wedge of two orthogonal
> real vectors with $|\mathbf{E}| = c|\mathbf{B}|$.

## 3. Linear polarization

For real $F_0$ — i.e., $F_0$ is a *real* bivector with no
pseudoscalar admixture — the wave is **linearly polarized**.
$\mathbf{E}$ oscillates along a fixed line; $\mathbf{B}$ is
perpendicular and oscillates in phase.

In the GA expression $F = F_0\,e^{Ik\cdot x}$, the $e^{Ik\cdot x}$
factor is a "phase" that, when multiplied with the real bivector
$F_0$, oscillates between $+F_0$ and $-F_0$ along with intermediate
values (and an imaginary-looking dual component that's actually
just the oscillation phase).

Most natural light sources produce linear polarization at the
individual photon level (each photon has a definite polarization
direction); thermal sources average over directions and produce
unpolarized light.

## 4. Circular polarization

For $F_0 = (\hat{\mathbf{e}}_1 + I\hat{\mathbf{e}}_2)\,|\mathbf{E}_0|/c$
(a specific combination), the resulting wave has $\mathbf{E}$ tracing
a **circle** as time progresses at a fixed point — **circularly
polarized**.

In GA, this corresponds to $F_0$ being **self-dual** under the
operation $\hat{\mathbf{k}}\,F_0$: the bivector rotates as a function
of phase rather than just oscillating between $\pm F_0$.

Right vs left circular: the choice of $+I$ vs $-I$ in the
combination. Right-circular ($+I$): the $\mathbf{E}$ vector rotates
clockwise when viewed from the observer (looking toward the source).
Left-circular: counter-clockwise.

> :surprisedgoose: Circularly polarized photons carry $\hbar$ of
> spin angular momentum along their direction of motion. The
> bivector formulation makes the spin-1 character of the photon
> visible at the *classical* level — the polarization is a
> rotation in the bivector plane $F_0$, and that rotation has
> $\pm 1$ units of angular momentum per quantum.

## 5. Elliptical polarization

The most general case: $F_0 = a\hat{\mathbf{e}}_1 + b\,I\hat{\mathbf{e}}_2$
with $a \ne b$. The tip of $\mathbf{E}$ traces an **ellipse** with
semi-axes $a$ and $b$. Linear ($b = 0$) and circular ($a = b$) are
special cases.

The full state of polarization is specified by the **Stokes
parameters**:

- $S_0 = a^2 + b^2$ — total intensity
- $S_1 = a^2 - b^2$ — linear horizontal/vertical
- $S_2 = $ linear ±45° intensity
- $S_3 = 2ab$ — circularity

Stokes parameters form a 4-vector $S^\mu$ that transforms as a
relative-vector. The **Poincaré sphere** — the unit sphere in
$(S_1, S_2, S_3)$ space — geometrically represents polarization
states. Equator: linear; poles: circular; in between: elliptical.

> :mathgoose: The Poincaré sphere is geometric algebra in
> disguise: polarization states are unit vectors on a 2-sphere,
> and Stokes-parameter rotation by a half-wave plate is a $\pi$
> rotation about an axis on the sphere. Wave plate $\to$ rotor
> action; Poincaré sphere $\to$ unit-vector space. Exactly the
> spin-1/2 rotation picture, applied to polarization.

## 6. Energy and momentum carried by waves

From [Ch 14](/physics-ga/part-4-electromagnetism/integral-conservation-theorems),
the stress-energy is $T(n) = -\tfrac{1}{2}\epsilon_0 F n F$. For a
plane wave $F = F_0 e^{Ik\cdot x}$:

$$T(\gamma_0) = -\tfrac{1}{2}\epsilon_0 |F_0|^2 \,\hat{k} = \tfrac{1}{2}\epsilon_0 |\mathbf{E}_0|^2 \,\hat{k}$$

— energy density times $\hat{k}$ (the spatial wave direction). The
wave carries energy in the direction it propagates, at speed $c$.

**Time-averaged** quantities (averaging over a wave period):

- Energy density $\langle u\rangle = \tfrac{1}{2}\epsilon_0|\mathbf{E}_0|^2$
- Energy flux $\langle\mathbf{S}\rangle = c\langle u\rangle\,\hat{\mathbf{k}}$
- Radiation pressure $p_{\rm rad} = \langle u\rangle$ (on a perfect
  absorber, normal incidence)

Radiation pressure is what lets solar sails work (and what eventually
balances gravitational pressure in stars).

## 7. Standing waves and cavities

A superposition of two counter-propagating waves makes a **standing
wave**:

$$F(x) = F_0\sin(\omega t)\cos(\mathbf{k}\cdot\mathbf{x})$$

This is the field configuration of a **resonant cavity** — a
waveguide or laser cavity. The standing-wave structure produces
**nodes** (where $F = 0$) and **anti-nodes** (where $|F|$ is
maximal).

Boundary conditions on cavity walls quantize the allowed $k$
values, giving discrete cavity modes. This is the precursor to
the **Casimir effect**: vacuum fluctuations in the modes contribute
to a measurable pressure between parallel plates.

## 8. Wave packets and group velocity

Real-world EM signals are **wave packets** — superpositions of
plane waves with different $k$ — that propagate together. The
**group velocity** $v_g = d\omega/dk$ governs the packet's motion.

For EM waves in vacuum, $\omega = ck$ exactly (the dispersion
relation is linear), so $v_g = c$ — no dispersion. In a medium
(plasma, fiber optic, dielectric), $\omega(k)$ acquires
corrections, $v_g \ne c$, and pulses spread.

In GA terms, the wave packet is $F(x) = \int F_0(k)\,e^{Ik\cdot x}\,d^4k$
with the integral over a small region of $k$-space. The packet's
center moves at the group velocity, while the **phase velocity**
$\omega/k$ is what the carrier wave moves at — generally different
from $v_g$ in dispersive media.

## What we covered

- $\nabla F = 0$ in vacuum gives plane-wave solutions
  $F = F_0 e^{Ik\cdot x}$ with $k^2 = 0$ (null) and $k\cdot F_0 = 0$
  (transverse).
- $F_0^2 = 0$ for free waves: $\mathbf{E}$ and $\mathbf{B}$
  perpendicular, equal magnitude in natural units.
- Linear polarization: real $F_0$; circular: $F_0 \pm I F_0^\perp$;
  elliptical: general $F_0$.
- Stokes parameters / Poincaré sphere give a geometric description
  of polarization.
- Stress-energy on a wave: $T(\gamma_0) = \tfrac{1}{2}\epsilon_0|\mathbf{E}_0|^2\hat{k}$.
- Radiation pressure equals (time-averaged) energy density.
- Standing waves and cavity modes; wave packets and group velocity.

## What's next

[Chapter 17](/physics-ga/part-4-electromagnetism/scattering-and-diffraction) —
scattering and diffraction. Rayleigh and Thomson scattering, the
Kirchhoff diffraction integral, and the GA treatment of
Fraunhofer / Fresnel patterns.
