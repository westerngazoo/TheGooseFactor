---
sidebar_position: 2
title: "Two-Body Central Force Interactions"
---

# Two-Body Central Force Interactions

> *Doran-Lasenby §3.3.* The Kepler problem in GA. Angular momentum
> is a bivector, the orbit lies in its plane automatically, and the
> Laplace-Runge-Lenz vector falls out of the algebra without case
> analysis.

The two-body problem under a central force is the most-studied
system in classical mechanics. GA's contribution is to make every
conservation law immediately visible — angular momentum as a
bivector, the LRL vector as a vector — and to make the planar
character of the orbit a *theorem* instead of an assumption.

## 1. Reduction to one body

Two particles with masses $m_1, m_2$ at positions $x_1, x_2$
interact through a potential $V(|x_1 - x_2|)$ that depends only on
the separation. Define the center-of-mass and relative positions:

$$X = \frac{m_1 x_1 + m_2 x_2}{m_1 + m_2}, \qquad r = x_2 - x_1$$

The Lagrangian splits:

$$L = \tfrac{1}{2}(m_1+m_2)\dot{X}^2 + \tfrac{1}{2}\mu \dot{r}^2 - V(|r|)$$

where $\mu = m_1 m_2 / (m_1 + m_2)$ is the **reduced mass**. The
center of mass moves freely; the interesting dynamics is the
relative motion in the equivalent one-body problem:

$$\boxed{\; \mu\ddot{r} = -\nabla V(|r|) = -V'(r)\,\hat{r} \;}$$

with $r = |r|$ and $\hat{r} = r/r$. This is the standard reduction
— identical to vector calculus. GA earns its keep starting now.

## 2. Angular momentum as a bivector

The angular momentum from [Ch 4 §6](/physics-ga/part-2-classical-mechanics/elementary-principles)
is

$$\boxed{\; L = r \wedge p = \mu\, r \wedge \dot{r} \;}$$

— a bivector. Compute its time derivative:

$$\dot{L} = \dot{r}\wedge p + r\wedge\dot{p} = \dot{r}\wedge(\mu\dot{r}) + r\wedge(-V'(r)\hat{r}) = 0 + 0 = 0$$

The first term vanishes because $\dot{r}\wedge\dot{r} = 0$; the
second because $r$ and $\hat{r}$ are parallel.

**Conclusion**: $L$ is constant. A *constant bivector*. And since
$L$ is the wedge of $r$ and $\dot{r}$, both $r$ and $\dot{r}$
lie in the plane defined by $L$ — at all times.

> :happygoose: This is the punchline. The orbit is planar because
> $L = r\wedge\dot{r}$ is conserved, which makes the plane of $r$
> and $\dot{r}$ constant. In vector calculus you'd argue "$L = r\times p$
> is conserved $\Rightarrow$ $r$ is perpendicular to a fixed
> direction $\Rightarrow$ motion in a plane." Three steps. In GA
> it's one fact: the bivector $r\wedge\dot{r}$ doesn't change.

The magnitude $|L|^2 = \mu^2 |r\wedge\dot{r}|^2$ (with a sign
depending on signature; in Euclidean GA, $L^2 \le 0$) is the
classical magnitude of angular momentum squared.

## 3. Energy conservation

The total energy is

$$E = \tfrac{1}{2}\mu\dot{r}^2 + V(r)$$

and it's conserved because the Lagrangian has no explicit time
dependence. Standard.

Decompose $\dot{r}$ into radial and tangential parts:

$$\dot{r} = \dot{r}_{\text{rad}} + \dot{r}_{\text{tan}}, \qquad \dot{r}_{\text{rad}} = (\dot{r}\cdot\hat{r})\hat{r}, \qquad \dot{r}_{\text{tan}} \perp \hat{r}$$

Note $|\dot{r}_{\text{rad}}| = \dot{r}$ (the time derivative of $r$,
not to be confused with the vector $\dot{r}$). And
$|L| = \mu r|\dot{r}_{\text{tan}}|$, so $|\dot{r}_{\text{tan}}|^2 = |L|^2/(\mu r)^2$.

Plugging in:

$$E = \tfrac{1}{2}\mu \dot{r}^2 + \frac{|L|^2}{2\mu r^2} + V(r)$$

— the classical **effective one-dimensional problem**. The
"angular momentum barrier" $|L|^2/(2\mu r^2)$ is the centrifugal
potential. Same content as the textbook; we just got here without
spherical coordinates.

## 4. The Laplace-Runge-Lenz vector

For the inverse-square law $V(r) = -k/r$, define the vector

$$A := \dot{r} \cdot L - k\hat{r}/\mu$$

(with $\dot{r}\cdot L$ being a vector — bivector inner-producted
with the vector $\dot{r}$ — giving a vector in the orbital plane).

Compute $\dot{A}$:

$$\dot{A} = \ddot{r}\cdot L + \dot{r}\cdot\dot{L} - \frac{k}{\mu}\frac{d\hat{r}}{dt}$$

The middle term is zero ($\dot{L} = 0$). For the first, $\ddot{r} = -(k/\mu r^2)\hat{r}$,
so $\ddot{r}\cdot L = -(k/\mu r^2)\,\hat{r}\cdot L$. For the third, expand $d\hat{r}/dt$:

$$\frac{d\hat{r}}{dt} = \frac{\dot{r} r - r\dot{r}}{r^2}\cdot\frac{1}{r}, \quad \text{which simplifies to } \frac{1}{r}\dot{r}_{\text{tan}}$$

with $\dot{r}_{\text{tan}}$ the tangential velocity. After algebra
(spelled out in D-L §3.3 and reproduced as an exercise), the two
remaining terms cancel:

$$\dot{A} = 0$$

So $A$ is **conserved**: the Laplace-Runge-Lenz vector. It points
from the focus of the orbit toward periapsis (the point of closest
approach), and its magnitude is $|A| = ek/\mu$ with $e$ the orbit
eccentricity.

> :surprisedgoose: The LRL vector is the "extra" conserved quantity
> for the inverse-square law — the reason orbits close on themselves
> in Newton's gravity and only in Newton's gravity. Add a $1/r^3$
> correction (general relativity, or a quadrupole) and the LRL
> vector starts precessing. The famous "$43''$ per century"
> precession of Mercury's perihelion is the rate at which $A$
> rotates in the orbital plane.

## 5. The orbit equation

Take the inner product of $A$ with $r$:

$$A\cdot r = (\dot{r}\cdot L)\cdot r - k$$

Now $(\dot{r}\cdot L)\cdot r$ is a triple product — a scalar built
from the vectors $\dot{r}, r$ and the bivector $L$. The standard
identity gives:

$$(\dot{r}\cdot L)\cdot r = L\cdot(r\wedge\dot{r}) = L\cdot L/\mu = -|L|^2/\mu$$

(the sign from $L^2 = -|L|^2$ in Euclidean GA). So

$$A\cdot r = -|L|^2/\mu - k$$

Writing $A\cdot r = |A| r \cos\theta$ where $\theta$ is the angle
between $r$ and $A$ (i.e., from periapsis), and solving for $r$:

$$\boxed{\; r(\theta) = \frac{|L|^2/(\mu k)}{1 + e\cos\theta} \;}$$

The **conic-section equation** — Kepler's orbits — with
$e = |A|\mu/k$ the eccentricity. Different signs of $E$ give
ellipses ($E < 0$, $e < 1$), parabolas ($E = 0$, $e = 1$), and
hyperbolas ($E > 0$, $e > 1$). Kepler's first law.

## 6. Kepler's laws

**First law** (orbits are conic sections): just derived in §5.

**Second law** (equal areas in equal times): the rate at which $r$
sweeps area is

$$\frac{dA}{dt} = \tfrac{1}{2}|r\wedge\dot{r}| = \frac{|L|}{2\mu}$$

— constant. The bivector $r\wedge\dot{r}$ literally *is* (twice the
oriented area swept per unit time), and its conservation is
Kepler's second law in algebraic form.

> :mathgoose: The area of the parallelogram spanned by $r$ and
> $d r$ is exactly $|r \wedge d r|$. This was Kepler's
> observational insight — equal area swept per unit time — and
> in GA it's the literal magnitude of the bivector $L/\mu$. The
> "area swept" interpretation falls out of the bivector being a
> directed-area object.

**Third law** ($T^2 \propto a^3$): for an ellipse of semi-major
axis $a$, the period is $T = 2\pi a^{3/2}/\sqrt{k/\mu}$. The
derivation uses the average orbit-energy relation $E = -k/(2a)$
plus the area swept $\pi ab = (|L|/2\mu) T$. Standard, no GA
specialty.

## 7. Bertrand's theorem in passing

Bertrand: the only central potentials for which **all** bound orbits
close on themselves are $V(r) = -k/r$ (inverse square) and
$V(r) = \tfrac{1}{2}kr^2$ (harmonic). Both have an extra conserved
vector (LRL for Kepler, the symmetric stress tensor for the
harmonic oscillator), which causes the orbit's apsidal line to
stay fixed.

In GA, the symmetric extra constant for the harmonic oscillator is
a (symmetric, traceless) bivector — the **Fradkin tensor**. The
algebra exposes it as an object on the same footing as the LRL
vector for $1/r$ — both are "extra" conserved quantities that
force orbit closure.

## 8. Scattering and the impact parameter

For unbound orbits ($E > 0$), the relevant geometric quantity is
the **scattering angle** $\chi$ as a function of impact parameter
$b$ and energy. For a $1/r$ potential, the deflection is

$$\tan(\chi/2) = \frac{k}{2Eb}$$

(Rutherford scattering, classical version). The GA derivation
mirrors the orbit-equation derivation in §5 with hyperbolic
asymptotes. Useful in [Ch 17 — scattering and diffraction](/physics-ga/part-4-electromagnetism/maxwell-equations)
for the EM version.

> :angrygoose: All of orbital mechanics — Kepler, perihelion
> precession, Rutherford scattering — falls out of two algebraic
> facts: $L = r\wedge\dot{r}$ is a conserved bivector, and (for
> $1/r$) $A = \dot{r}\cdot L - k\hat{r}/\mu$ is a conserved vector.
> The classical formulation needs spherical coordinates, Jacobi
> identities, and dozen-line manipulations. GA needs the two boxed
> equations.

## What we covered

- Reduction of two-body to equivalent one-body: $\mu\ddot{r} = -V'(r)\hat{r}$.
- Angular momentum is a conserved **bivector** $L = r\wedge p$;
  the orbit's planar character is a theorem, not an assumption.
- Energy conservation gives the effective 1D problem with
  centrifugal barrier $|L|^2/(2\mu r^2)$.
- For $V = -k/r$, the Laplace-Runge-Lenz **vector**
  $A = \dot{r}\cdot L - k\hat{r}/\mu$ is conserved; it points to
  periapsis.
- The orbit equation $r(\theta) = (|L|^2/\mu k)/(1 + e\cos\theta)$
  follows from one inner product.
- Kepler's three laws are immediate.

## What's next

[Chapter 6](/physics-ga/part-2-classical-mechanics/celestial-mechanics-and-perturbations) —
celestial mechanics & perturbations. What happens when the $1/r$
potential gets a small correction (J2 oblateness, general
relativistic $1/r^3$ term, third-body perturbations) — and how the
LRL vector starts to precess.
