---
sidebar_position: 2
title: "Observers, Trajectories, Frames"
---

# Observers, Trajectories, Frames

> *Doran-Lasenby §5.2.* A worldline through spacetime, an observer's
> rest frame, and the proper-time parameterization. The machinery that
> turns STA into special relativity.

In Euclidean GA, "frame" was just a basis. In STA, frame carries
physical content: it's the perspective of an observer, the
direction "their clock points," and the splitting of spacetime
into space and time *for them*. Different observers have different
frames; the geometry doesn't.

## 1. Worldlines and 4-velocity

A point particle traces a **worldline** — a curve in spacetime
parameterized by **proper time** $\tau$:

$$x(\tau) \in \mathcal{Cl}(1,3)\text{ (vector-valued)}$$

The **4-velocity** is the tangent vector:

$$\boxed{\; v := \frac{dx}{d\tau} \;}$$

Proper time is chosen so that $v^2 = +1$ for timelike worldlines:
clocks carried along the worldline tick at the proper rate. In our
$(+,-,-,-)$ signature, this means $v\cdot v = +1$, so the
4-velocity is a unit timelike vector.

For a massive particle at rest, $v = \gamma_0$. For a particle
moving with 3-velocity $\mathbf{u}$ in some observer's frame:

$$v = \gamma(1 + \mathbf{u}/c)\gamma_0, \qquad \gamma = \frac{1}{\sqrt{1-u^2/c^2}}$$

where $\mathbf{u}$ is a relative vector ($\mathbf{u} = u^i \boldsymbol{\sigma}_i$).
The factor $\gamma$ is the Lorentz factor. Different observers see
different decompositions but the same $v$.

> :nerdygoose: $v \cdot v = +1$ is the **mass-shell condition**.
> Every massive on-shell particle has a 4-velocity satisfying this
> identity. Off-shell or massless particles need different
> normalizations.

## 2. 4-momentum

The 4-momentum is

$$p := m v$$

for a particle of rest mass $m$. It satisfies $p^2 = m^2$, the
**mass-energy relation**. For massless particles ($m = 0$),
$p^2 = 0$ — null vector — and $p$ traces along the light cone.

In an observer's frame:

$$p = \gamma m(1 + \mathbf{u}/c)\gamma_0 = (E/c)\gamma_0 + p^i\gamma_i$$

with $E = \gamma m c^2$ the energy and $p^i = \gamma m u^i$ the
3-momentum components. The familiar $E^2 = p^2 c^2 + m^2 c^4$ is
just $p \cdot p = m^2$ expanded in the frame.

## 3. Observers and rest frames

An **observer** is a worldline together with a rotor field giving
the orientation of their spatial frame at each $\tau$. For
inertial observers, the orientation is constant: pick three
orthonormal vectors perpendicular to $v$ as the spatial axes, and
the observer's frame is

$$\{v, e_1, e_2, e_3\} \text{ with } v\cdot e_i = 0, \;\; e_i \cdot e_j = -\delta_{ij}$$

For a non-rotating observer at rest in our chosen $\gamma_0$
direction, $v = \gamma_0$ and $e_i = \gamma_i$ — the lab frame.

For a moving observer ($v \ne \gamma_0$), we need a Lorentz rotor
$L$ such that $L\gamma_0\tilde{L} = v$. Then their spatial frame is
$L\gamma_i\tilde{L}$. The "$L$" is the boost rotor that takes the
lab frame to the observer's rest frame.

## 4. Projection onto an observer's frame

Any spacetime vector $a$ can be decomposed in an observer's frame
with 4-velocity $v$:

$$a = a_\parallel v + a_\perp$$

where $a_\parallel = a \cdot v$ (a scalar — the "time-like
component") and $a_\perp = a - (a\cdot v) v$ (a vector
perpendicular to $v$, i.e., living in the observer's "spatial
slice"). The decomposition is unique once $v$ is chosen.

This is the **observer split**: any GA object decomposes into a
timelike scalar (or higher-grade) part and a spacelike part
relative to the observer's $v$.

For a 4-momentum $p$:

$$p \cdot v = E/c, \qquad p - (p\cdot v) v = \mathbf{p}/c$$

— the relative-vector 3-momentum.

For a bivector $F$ (like the EM field):

$$F = \mathbf{E}/c + I\mathbf{B} \quad \text{(in the } v=\gamma_0 \text{ frame)}$$

where $\mathbf{E}/c = (F\cdot v) v$-part and $I\mathbf{B}$ is the
spacelike-bivector part. This is exactly the construction in [Ch 13](/physics-ga/part-4-electromagnetism/maxwell-equations).

> :surprisedgoose: The observer split is what makes the same
> bivector $F$ look like "electric field" to one observer and
> "rotating magnetic field" to another. The bivector is
> observer-independent; the labels are not.

## 5. Acceleration and curved worldlines

For non-inertial motion, $v(\tau)$ is not constant. Its derivative
is the **4-acceleration**:

$$a := \frac{dv}{d\tau}$$

Differentiating $v^2 = 1$ gives $v \cdot a = 0$ — the 4-acceleration
is **always spacelike-perpendicular to the 4-velocity**. In the
instantaneous rest frame ($v = \gamma_0$), $a$ has only spatial
components — exactly the classical 3-acceleration in the
instantaneous comoving inertial frame.

In an observer's lab frame:

$$a = (\text{something complicated involving } \dot{\mathbf{u}} \text{ and } \mathbf{u})$$

The acceleration measured by the observer's accelerometer is
$|a|$ — the proper acceleration. For uniform proper acceleration
in one direction, the worldline is a **hyperbola in spacetime** —
the Rindler observer trajectory, exact via $v(\tau) = \cosh(g\tau/c)\gamma_0 + \sinh(g\tau/c)\gamma_1$.

## 6. Tetrads and rotating observers

For a **rotating** observer (e.g., on Earth's surface), the spatial
frame rotates as $\tau$ advances. The standard parameterization is
a time-dependent rotor:

$$\{v(\tau), \{e_i(\tau)\}\} = \{R(\tau)\gamma_0\tilde{R}(\tau), \{R(\tau)\gamma_i\tilde{R}(\tau)\}\}$$

where $R(\tau)$ is the observer's frame rotor. Just like rigid
bodies in [Ch 7](/physics-ga/part-2-classical-mechanics/rigid-body-dynamics-with-rotors),
the rotor satisfies $\dot{R} = \tfrac{1}{2}\Omega R$ with $\Omega$
a bivector — but now in STA, so $\Omega$ has both spatial-rotation
(spacelike bivector) parts and boost (timelike bivector) parts.

The Fermi-Walker transport equation — the relativistic generalization
of "no rotation along the worldline" — is

$$\Omega_{\text{Fermi-Walker}} = v \wedge a$$

For pure inertial motion ($a = 0$), $\Omega = 0$ and the spatial
frame doesn't rotate. For non-inertial motion, the frame "rotates"
according to the worldline's acceleration history — this is
**Thomas precession**, accessible algebraically from one bivector
formula instead of three pages of tensor calculus.

> :mathgoose: Thomas precession was discovered by Thomas in 1926
> as a "missing" factor of 1/2 in spin-orbit coupling. In tensor
> language, it requires careful bookkeeping of successive boosts.
> In STA, it's the bivector $v\wedge a/2$ — visible immediately
> from the Fermi-Walker formula.

## 7. Proper time, coordinate time, and time dilation

For an observer at rest in coordinates ($v = \gamma_0$), proper
time = coordinate time. For a moving observer, $d\tau$ relates to
the coordinate-time differential $dt$ by

$$d\tau = \frac{dt}{\gamma}$$

— **time dilation**. The moving clock ticks slower by the factor
$\gamma$ as seen by the rest observer. This falls out of $v\cdot v = 1$
once we identify the time component.

The proper time elapsed along a curved worldline from event $A$ to
event $B$ is

$$\Delta\tau_{AB} = \int_A^B \sqrt{dx \cdot dx} = \int_A^B |v|\,d\lambda$$

for any parameterization $\lambda$. Longer paths in spacetime have
**less** proper time (negative-signature metric); the straight
worldline maximizes proper time. This is the **twin paradox** in
its clean form.

## 8. The clock postulate and ideal clocks

Special relativity assumes the **clock postulate**: an ideal clock
measures proper time along its worldline, regardless of
acceleration. Empirically, this holds for atomic clocks up to
accelerations exceeding $10^{18}\,g$ before the clock's structure
breaks down.

In GA terms: the integral $\int |v|\,d\lambda$ depends only on the
worldline's geometric length in the Minkowski metric, not on its
parameterization. The clock that *physically* measures this integral
is the ideal clock.

> :angrygoose: The clock postulate isn't a derived result — it's
> a postulate. Twin-paradox arguments that try to "explain" time
> dilation via acceleration are confused on this point. The
> traveling twin ages less because their worldline has less
> proper time, not because of anything that happens during the
> turnaround. The acceleration matters only insofar as it bends
> the worldline.

## What we covered

- A worldline is a curve $x(\tau)$ parameterized by proper time;
  4-velocity $v = dx/d\tau$ has $v^2 = +1$ for massive particles.
- 4-momentum $p = mv$ with $p^2 = m^2$ — the mass-shell.
- An observer is a worldline + a frame. Lab frame: $v = \gamma_0$,
  $e_i = \gamma_i$.
- Observer split: any GA object decomposes into time-like
  ($\cdot v$) and space-like ($\perp v$) parts relative to $v$.
- 4-acceleration $a = dv/d\tau$ is always $v$-perpendicular.
- Rotating observers carry frame rotors $R(\tau)$; the
  Fermi-Walker bivector $\Omega = v\wedge a$ governs their
  rotation.
- Proper time integrates as $\int |v|\,d\lambda$; longer worldlines
  have less proper time (twin paradox).

## What's next

[Chapter 10](/physics-ga/part-3-spacetime-algebra/lorentz-transformations-as-rotors) —
the Lorentz transformations themselves, expressed as rotors in
$\mathrm{Spin}(1,3)$. The same sandwich form that gave us 3D
rotations now produces boosts.
