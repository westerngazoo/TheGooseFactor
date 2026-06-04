---
sidebar_position: 4
title: "Rigid-Body Dynamics With Rotors"
---

# Rigid-Body Dynamics With Rotors

> *Doran-Lasenby §3.5–3.7.* The clearest win for GA in classical
> mechanics. Euler angles, gimbal lock, and the inertia tensor's
> index gymnastics all collapse into rotor evolution plus a
> bivector-valued inertia map.

A rigid body has 6 degrees of freedom — 3 for the center-of-mass
position and 3 for orientation. The translational part is the
particle mechanics of [Ch 4](/physics-ga/part-2-classical-mechanics/elementary-principles).
This chapter is about the rotational part. In GA, orientation is a
rotor $R(t)$ and angular velocity is a bivector $\Omega(t)$ — and
the dynamics is one equation in those objects.

## 1. The rigid-body configuration

A point at body-fixed position $x_0$ has lab-frame position

$$x(t) = R(t)\, x_0\, \tilde{R}(t)$$

The rotor $R(t) \in \mathrm{Spin}(3)$ encodes the body's
orientation; $x_0$ is constant in the body frame.

Differentiate:

$$\dot{x} = \dot{R}\, x_0\, \tilde{R} + R\, x_0\, \dot{\tilde{R}}$$

Using $\dot{R}\tilde{R} = \tfrac{1}{2}\Omega$ from [Ch 2 §6](/physics-ga/part-1-foundations/reflections-rotations-and-the-sandwich)
(equivalently $R\dot{\tilde{R}} = -\tfrac{1}{2}\Omega$), and
$x = R x_0 \tilde{R}$:

$$\dot{x} = \tfrac{1}{2}\Omega x - \tfrac{1}{2} x \Omega = \tfrac{1}{2}[\Omega, x] = \Omega \cdot x$$

— where $\Omega \cdot x$ is the inner product of bivector with
vector, which lowers grade by 1 to give a vector. In 3D this is
exactly the cross product $\boldsymbol{\omega}\times\mathbf{x}$
once you identify $\Omega = I\boldsymbol{\omega}$. But the GA form
generalizes — $\Omega \cdot x$ works in any dimension and any
signature.

$$\boxed{\; \dot{x} = \Omega \cdot x \;}$$

## 2. Angular momentum and the inertia tensor

Each mass element $dm$ at position $x$ contributes angular momentum
$x \wedge p = x \wedge (dm\,\dot{x}) = (x\wedge(\Omega\cdot x))\,dm$.
Integrate over the body:

$$L = \int x \wedge (\Omega \cdot x)\, dm$$

For fixed body geometry but variable $\Omega$, this is a
**linear function** $\mathcal{I}$ from bivectors to bivectors:

$$\boxed{\; L = \mathcal{I}(\Omega) \;}$$

The function $\mathcal{I}$ is the **inertia tensor**. In a body
frame with principal axes $e_1, e_2, e_3$ and moments
$I_1, I_2, I_3$:

$$\mathcal{I}(B) = I_1 \langle B \cdot e_1 \rangle e_2 e_3 + I_2 \langle B \cdot e_2 \rangle e_3 e_1 + I_3 \langle B \cdot e_3 \rangle e_1 e_2$$

(loose notation — the precise version sandwiches the inertia
operator between projections onto each principal bivector). The
inertia tensor is a **symmetric linear function on bivectors** —
in tensor language, a rank-2 symmetric tensor; in GA, a
bivector-valued function of bivectors.

> :nerdygoose: The "inertia tensor as a 3×3 matrix" of undergrad
> physics is the matrix of $\mathcal{I}$ in the principal-bivector
> basis $\{e_{23}, e_{31}, e_{12}\}$. The eigenbivectors of
> $\mathcal{I}$ — the principal axes — fall out of GA's eigenproblem
> machinery from [Ch 3](/physics-ga/part-1-foundations/frames-components-and-tensor-free-linear-algebra)
> with no extra effort.

## 3. The kinetic energy

Kinetic energy is

$$T = \tfrac{1}{2}\int \dot{x}^2\, dm = \tfrac{1}{2}\int (\Omega\cdot x)^2\, dm$$

A short computation in the principal-axis frame gives

$$T = \tfrac{1}{2}\langle \Omega \cdot L \rangle_0 = -\tfrac{1}{2}\Omega \cdot \mathcal{I}(\Omega)$$

(the sign convention follows from $B^2 \le 0$ for a bivector in
Euclidean GA). In the principal-axis frame:

$$T = \tfrac{1}{2}(I_1 \omega_1^2 + I_2 \omega_2^2 + I_3 \omega_3^2)$$

— the standard textbook expression, with $\omega_i$ the components
of $\Omega$ in the principal-bivector basis.

## 4. Euler's equations from $\dot{L} = \tau$

Newton's second law for rotations: $\dot{L} = \tau$ with $\tau$ the
external torque (a bivector). Take $L$ in the body frame:

$$L_{\text{lab}} = R\, L_{\text{body}}\, \tilde{R}$$

Differentiate:

$$\dot{L}_{\text{lab}} = \dot{R} L_{\text{body}} \tilde{R} + R \dot{L}_{\text{body}} \tilde{R} + R L_{\text{body}} \dot{\tilde{R}} = R(\dot{L}_{\text{body}} + \tfrac{1}{2}[\Omega_{\text{body}}, L_{\text{body}}])\tilde{R}$$

In the body frame, the torque is $\tau_{\text{body}} = \tilde{R}\tau_{\text{lab}}R$,
so

$$\boxed{\; \dot{L}_{\text{body}} + \Omega_{\text{body}} \cdot L_{\text{body}} = \tau_{\text{body}} \;}$$

— **Euler's equation** in GA form. Compare to the index-notation
version:

$$I_1\dot\omega_1 + (I_3 - I_2)\omega_2\omega_3 = \tau_1, \quad\text{plus two cyclic permutations}$$

Same content, but in GA there's **one** equation in bivector form
instead of three component equations. The cyclic-permutation
structure that you have to manually track in coordinates becomes
the algebraic structure of $\Omega \cdot L$.

> :happygoose: Two papers' worth of textbook calculation collapses
> to a single bivector equation. This is the bivector-vs-tensor
> story in concentrated form: when the natural objects are
> antisymmetric (angular velocity, angular momentum, torque), GA's
> bivectors are the right type, and the equations of motion become
> what they want to be.

## 5. The free symmetric top

For a symmetric body ($I_1 = I_2 \ne I_3$) with no external torque,
Euler's equation has a beautiful closed form. The angular velocity
bivector $\Omega_{\text{body}}$ precesses around the body's
symmetry axis at a rate proportional to the spin about that axis.

Set $\Omega = \Omega_\parallel + \Omega_\perp$ with $\Omega_\parallel$
along the symmetry axis ($e_{12}$ bivector if the symmetry is about
$e_3$) and $\Omega_\perp$ the rest. Euler's equation gives

$$\dot{\Omega}_\perp = \frac{I_3 - I_1}{I_1}\,\Omega_\parallel \cdot \Omega_\perp$$

This is rotation of $\Omega_\perp$ in the bivector plane around
$e_{12}$, at angular rate

$$\omega_{\text{body precession}} = \frac{I_3 - I_1}{I_1}\,\omega_3$$

For Earth (oblate, $I_3 > I_1$), the predicted free-precession rate
gives the **Chandler wobble** — a 433-day precession of Earth's
rotation pole, observed and fit using exactly this formula.

> :surprisedgoose: The Chandler wobble is Euler's free-symmetric-top
> precession applied to a not-quite-rigid Earth. The actual
> period (433 days) differs from the rigid prediction (305 days)
> because Earth is *almost* rigid — the elastic response stretches
> the period by ~40%. Same equation; messy correction factor.

## 6. Lab-frame motion of the inertia ellipsoid

The kinetic energy and angular momentum together define two
quadrics in $\Omega$-space:

$$T = -\tfrac{1}{2}\Omega \cdot \mathcal{I}(\Omega), \qquad |L|^2 = -\Omega\cdot\mathcal{I}^2(\Omega)$$

For free rotation, both are conserved. $\Omega(t)$ traces a curve
on the intersection of these two ellipsoids — Poinsot's
construction.

The lab-frame inertia ellipsoid rolls without slipping on the
**invariable plane** perpendicular to $L$. This is **Poinsot's
theorem**, and in GA the proof is short:

- The instantaneous axis of rotation lies along $\Omega$.
- The point of the inertia ellipsoid touched by the invariable
  plane is along $\Omega$ at radius $1/\sqrt{2T}$.
- The plane is perpendicular to $L$, distance $\sqrt{2T}/|L|$ from
  the center.
- The motion is rolling because the velocity of the contact point
  is along $\Omega$, perpendicular to the ellipsoid's tangent
  plane at the contact point.

This gives a beautiful geometric picture of free rotation that's
essentially impossible to draw without the right algebraic
language. With rotors and bivectors, it falls out.

## 7. Heavy symmetric top — the gyroscope

A symmetric top under gravity ($\tau \ne 0$) does three things:
**spin**, **precess**, and **nutate**. With rotor $R$ encoding the
orientation and decomposing into Euler-like sub-rotors

$$R = R_{\text{prec}}\, R_{\text{nut}}\, R_{\text{spin}}$$

the equations of motion (under suitable energy/momentum
substitutions) reduce to an effective 1D problem in the tilt angle
$\theta$. Detailed in D-L §3.7; the key point is that **rotor
decomposition replaces Euler angles** while still capturing the
same three angular degrees of freedom.

> :mathgoose: The standard Euler-angle decomposition writes the
> rotation as $R_z(\phi) R_x(\theta) R_z(\psi)$. The GA version
> writes it as three rotors multiplied. Both have the same
> 3-parameter structure — but the rotor form has **no gimbal
> singularity** in the sense that no parameter range becomes
> ill-defined. (The Euler-angle representation has $\theta = 0$
> as a singular configuration where $\phi$ and $\psi$ are
> degenerate. The rotor product doesn't suffer from this.)

## 8. Generalized rigid-body Lagrangian

For a body with body-frame inertia $\mathcal{I}$ and orientation
rotor $R(t)$, the Lagrangian is

$$L = T - V = -\tfrac{1}{2}\Omega \cdot \mathcal{I}(\Omega) - V(R)$$

where $\Omega = 2\dot{R}\tilde{R}$ and $V$ depends on orientation
(e.g., gravitational pull on an asymmetric body). The Euler-Lagrange
equation for $R$, after applying $R\tilde{R} = 1$ as constraint, is

$$\mathcal{I}(\dot{\Omega}) + \Omega \cdot \mathcal{I}(\Omega) = \tau$$

with $\tau$ the GA-form torque computed from $\partial V/\partial R$.
Same Euler equation, derived from the variational principle.

## 9. Practical computation

For numerical simulation, integrate the coupled equations:

$$\dot{R} = \tfrac{1}{2}\Omega R$$
$$\dot{\Omega} = \mathcal{I}^{-1}(\tau - \Omega \cdot \mathcal{I}(\Omega))$$

After each integration step, **renormalize $R$** to keep
$R\tilde{R} = 1$. Standard symplectic integrators (e.g.,
Runge-Kutta-Munthe-Kaas on Lie groups) preserve this constraint
automatically.

Compare to quaternion integrators: same idea, same constraint
re-normalization, same accuracy. The rotor form is strictly more
general — it lifts to higher dimensions and works in spacetime —
but in 3D it's interchangeable with quaternions, by [Ch 1 §7](/physics-ga/part-1-foundations/ga-in-60-seconds).

> :weightliftinggoose: This is the chapter to refer back to whenever
> you need to integrate rigid-body motion in code. $\dot{R} = \tfrac{1}{2}\Omega R$
> for orientation; Euler's bivector equation for $\Omega$; the
> $RvR^{-1}$ sandwich to push body-frame vectors to lab frame.
> Three primitives. Memorize them.

## What we covered

- Rigid-body orientation is a rotor $R(t)$; angular velocity is
  a bivector $\Omega(t)$.
- The inertia tensor is a symmetric linear function on bivectors,
  $L = \mathcal{I}(\Omega)$.
- Kinetic energy is $-\tfrac{1}{2}\Omega\cdot\mathcal{I}(\Omega)$.
- Euler's equation in GA form:
  $\dot{L}_{\text{body}} + \Omega \cdot L_{\text{body}} = \tau_{\text{body}}$.
- Free symmetric tops precess (Chandler wobble = applied case).
- Heavy symmetric tops nutate and precess; rotor decomposition
  avoids Euler-angle singularities.
- For numerical work: integrate $(R, \Omega)$ jointly; renormalize
  $R\tilde{R}$ each step.

## What's next

That closes Part II. [Part III](/physics-ga/part-3-spacetime-algebra/sta-basis-and-signature)
introduces **spacetime algebra** (STA) — the same rotor/bivector
machinery in signature $(+,-,-,-)$, where rotors become Lorentz
transformations and bivectors become the electromagnetic field.
The transition is seamless: every theorem we proved in Part II
extends to spacetime with at most a sign change.
