---
sidebar_position: 3
title: "EM Field of a Point Charge (Liénard-Wiechert)"
---

# EM Field of a Point Charge

> *Doran-Lasenby §7.3.* From Coulomb's static law to the
> Liénard-Wiechert solution for arbitrary worldlines, derived from
> $\nabla F = J/\epsilon_0$ by retarded Green's functions in STA.

The full electromagnetic field of a moving point charge is the
keystone calculation of classical electrodynamics. In tensor
notation it occupies a chapter of careful retarded-time
manipulations. In STA it's a single Green's-function inversion
followed by a clean projection. Same physics; less bookkeeping.

## 1. The static field — Coulomb's law

A charge $q$ at rest at the origin has 4-current

$$J = q\delta^3(\mathbf{x})\,\gamma_0$$

Static, so $\partial_t F = 0$, and Maxwell's equation reduces to

$$\nabla F = J/\epsilon_0 \quad\Rightarrow\quad \nabla\cdot F = \frac{q}{\epsilon_0}\delta^3(\mathbf{x})\gamma_0$$

with $\nabla\wedge F = 0$ (no magnetic part for a static charge).
The bivector solution:

$$F = \frac{q}{4\pi\epsilon_0}\,\frac{\hat{\mathbf{r}}}{r^2}\gamma_0 = \mathbf{E}/c$$

— exactly Coulomb's law in the bivector form. The "electric"
relative vector $\mathbf{E} = q\hat{\mathbf{r}}/(4\pi\epsilon_0 r^2)$
is the spatial-radial component of the EM field bivector.

## 2. The retarded Green's function

For a moving charge, we need the retarded Green's function for
the operator $\nabla$ acting on bivectors. In STA:

$$\nabla\, G(x) = \delta^4(x)$$

The solution is

$$G(x) = \frac{1}{2\pi}\,\frac{1}{x}\,\delta(x^2)\theta(x^0)$$

— **on the light cone**, with the $\theta(x^0)$ enforcing
retarded (not advanced) boundary conditions. The factor $1/x$ is
the GA inverse of the vector $x$, equal to $x/x^2$ for any
non-null vector.

This concentrated form is what makes the GA derivation cleaner:
the Green's function is just "$1/x$ on the light cone, retarded."
In tensor notation it would be written as the more familiar

$$G^{\mu\nu}(x) = \frac{1}{2\pi}\eta^{\mu\nu}\delta(x^2)\theta(x^0)$$

— same content, less compact.

## 3. The Liénard-Wiechert potential

For a charge with worldline $z(\tau)$ and 4-velocity
$v(\tau) = dz/d\tau$, the retarded 4-potential at observation
point $x$ is the **Liénard-Wiechert potential**:

$$A(x) = \frac{q}{4\pi\epsilon_0 c}\,\frac{v(\tau_r)}{|(x-z(\tau_r))\cdot v(\tau_r)|}$$

where the **retarded time** $\tau_r$ is determined by the
light-cone condition

$$(x - z(\tau_r))^2 = 0, \quad x^0 > z^0(\tau_r)$$

In words: $\tau_r$ is the proper time at which the charge was when
its light cone reaches the observation point $x$.

The compact GA form, valid in any signature:

$$\boxed{\; A(x) = \frac{q}{4\pi\epsilon_0 c}\,\frac{v(\tau_r)}{r\cdot v(\tau_r)} \;}$$

where $r := x - z(\tau_r)$ is the null vector from the source event
to the observation event. The denominator $r\cdot v$ is a scalar —
the Doppler factor.

> :nerdygoose: The denominator $r\cdot v$ is the same Doppler
> factor that appears in relativistic Doppler shift and stellar
> aberration. It's the **retarded distance** $|x - z(\tau_r)| (1 - \hat{\mathbf{r}}\cdot\mathbf{v}/c)$
> in the observer's frame — the "shortened" distance because the
> source moved toward you while emitting. GA exposes it as a
> single algebraic invariant.

## 4. The field bivector from the LW potential

From $F = \nabla\wedge A$, differentiating the LW potential gives
the **Liénard-Wiechert field bivector**. The result splits into
two parts:

$$F(x) = F_{\rm vel}(x) + F_{\rm acc}(x)$$

The **velocity part** (Coulomb-like, falls as $1/r^2$):

$$F_{\rm vel}(x) = \frac{q}{4\pi\epsilon_0}\,\frac{(r\wedge v)(1 - v^2)}{(r\cdot v)^3}$$

The **acceleration part** (radiation, falls as $1/r$):

$$F_{\rm acc}(x) = \frac{q}{4\pi\epsilon_0 c}\,\frac{r\wedge\{(r\cdot v) a - (r\cdot a)v\}}{(r\cdot v)^3}$$

The decomposition is **clean** in GA:

- $F_{\rm vel}$ has $\mathbf{E}, \mathbf{B}$ falling as $1/r^2$ — the
  "bound" field that travels with the charge.
- $F_{\rm acc}$ has $\mathbf{E}, \mathbf{B}$ falling as $1/r$ — the
  **radiation** field, perpendicular to $r$, carrying energy to
  infinity.

For non-relativistic motion ($v \approx \gamma_0$), the
acceleration field simplifies to the familiar **electric dipole
radiation** pattern.

## 5. The Coulomb field as the $a = 0$ limit

For a charge at rest ($v = \gamma_0$, $a = 0$), $F_{\rm acc} = 0$
and $F_{\rm vel}$ reduces to the static Coulomb field. The point
charge "drags" a Lorentz-contracted Coulomb field around with it
in the velocity part; the acceleration part is the new piece
that emerges only when the charge accelerates.

## 6. Radiation reaction (Abraham-Lorentz)

A radiating charge experiences **radiation reaction**: the field
it creates pushes back on it. The classical equation of motion
becomes

$$m\dot{v} = qF_{\rm ext}\cdot v + \frac{q^2}{6\pi\epsilon_0 c^3}(\ddot{v} + ...)$$

— the Abraham-Lorentz force. The full relativistic form (Dirac
1938) is

$$m\dot{v} = qF_{\rm ext}\cdot v + \frac{q^2}{6\pi\epsilon_0 c^3}\left[\dddot{z} + v(v\cdot\dddot{z})\right]$$

This is famously **problematic**: a third derivative of position
appears, allowing "runaway solutions" and pre-acceleration. The
issue isn't a flaw in GA — it's a flaw in the classical
point-charge concept. Resolution comes from quantum
electrodynamics (where the electron is renormalized).

> :surprisedgoose: Classical EM predicts that point charges should
> spontaneously accelerate from rest. The Abraham-Lorentz equation
> has solutions where $\dot{v}$ grows exponentially — pure
> mathematical pathology of the classical theory. QED resolves it
> by giving the electron a finite "size" through vacuum
> polarization. This is one of the historical hints that classical
> EM had to fail at small scales.

## 7. The dipole approximation

For radiation by **slowly accelerating** charges, the leading-order
radiation is dipole. Expanding the acceleration-part field at large
$r$:

$$F_{\rm acc}(x) \approx \frac{q}{4\pi\epsilon_0 c}\,\frac{r\wedge a_{\perp r}}{r^2}$$

— the radiation bivector is the wedge of the radial direction
with the transverse component of $a$. The radiation pattern is the
classic $\sin^2\theta$ dipole pattern, with $\theta$ measured from
$a$.

For an oscillating dipole $\mathbf{p}(t) = \mathbf{p}_0\cos(\omega t)$,
the radiated power is

$$P = \frac{\omega^4 |\mathbf{p}_0|^2}{12\pi\epsilon_0 c^3}$$

— the **Larmor / dipole radiation formula**. This is what makes
antennas work, what gives blue sky (Rayleigh scattering), and what
drives most of optical absorption.

## 8. Higher multipoles

For sources where the dipole vanishes (or is small), higher
multipoles contribute:

- **Magnetic dipole** radiation — $r\wedge m$ where $m$ is the
  magnetic dipole moment bivector.
- **Electric quadrupole** — second-derivative term, $\sim Q_{ij}$
  in tensor language; a trivector in GA.

The full multipole expansion of the radiated field is exactly the
GA expansion of the LW field in powers of the source's $v$ and $a$.

GA's multivector representation is natural here: dipoles are
vectors, magnetic dipoles are bivectors, quadrupoles are trivectors.
Each multipole order corresponds to a specific GA grade, and the
expansion is grade-by-grade.

## 9. Aberration and Doppler

The retarded-time geometry of the LW solution explains:

- **Stellar aberration**: a moving observer sees stars displaced
  from their true position because the light "lags" by $v/c$ of
  travel time.
- **Relativistic Doppler shift**: the frequency observed is
  $\omega' = \omega/(r\cdot v / r)$ for the appropriate definitions.
- **Beaming**: a moving charge's radiation is concentrated forward
  along its direction of motion (the headlight effect).

All three are properties of the **same** geometric factor $r\cdot v$
that appears in the LW potential. GA makes this unification visible.

> :angrygoose: Aberration, Doppler, and beaming used to be taught
> as three separate effects with three separate derivations. In
> STA they're all properties of $r\cdot v$. The light cone is one
> geometric object; the observer's worldline is another; their
> relationship at the retarded event determines all three effects
> simultaneously.

## What we covered

- Static charge: $F = q\hat{\mathbf{r}}\gamma_0/(4\pi\epsilon_0 r^2)$.
- Retarded Green's function: "$1/x$ on the light cone, retarded".
- Liénard-Wiechert 4-potential: $A = qv/(4\pi\epsilon_0 c\,r\cdot v)$
  at retarded time.
- Field decomposes into velocity part ($1/r^2$, bound) and
  acceleration part ($1/r$, radiation).
- Larmor / dipole radiation formula from the acceleration part.
- Abraham-Lorentz radiation reaction (classically problematic;
  QED resolves).
- Higher multipoles correspond to higher GA grades.
- Aberration, Doppler, beaming all from the $r\cdot v$ factor.

## What's next

[Chapter 16](/physics-ga/part-4-electromagnetism/electromagnetic-waves) —
electromagnetic waves in vacuum. The wave equation, polarization,
energy flux, and the GA view of plane waves as null bivectors.
