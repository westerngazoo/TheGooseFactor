---
sidebar_position: 1
title: "Elementary Principles — Lagrangian and Hamiltonian in GA"
---

# Elementary Principles

> *Doran-Lasenby §3.1–3.2.* The Lagrangian and Hamiltonian formulations
> re-cast in geometric algebra. The payoff is that constraints, rotations,
> and rigid-body motion all live in the same algebraic language.

Classical mechanics in vector-and-coordinate form drowns in
bookkeeping: generalized coordinates $q^i$, Christoffel symbols on
non-Cartesian manifolds, Euler-angle conventions, gimbal-lock
patches. GA replaces all of this with multivector-valued
trajectories and bivector-valued velocities. This chapter sets up
the framework; the rest of Part II applies it.

## 1. Position, velocity, and the geometric product

A particle's trajectory is a vector-valued function of time:

$$x(t) \in \mathbb{R}^n, \qquad \dot{x}(t) = \frac{dx}{dt}, \qquad \ddot{x}(t) = \frac{d^2 x}{dt^2}$$

Kinetic energy in GA looks identical to the vector form because the
inner product is built into the geometric product:

$$T = \tfrac{1}{2}m\, \langle \dot{x}^2 \rangle_0 = \tfrac{1}{2}m\,\dot{x}\cdot\dot{x}$$

But $\dot{x}^2$ as a full geometric product is just the scalar
$\dot{x}\cdot\dot{x}$ — the wedge part vanishes because a vector
wedged with itself is zero. So we can drop the grade projection and
write

$$\boxed{\; T = \tfrac{1}{2}m\,\dot{x}^2 \;}$$

with the understanding that $\dot{x}^2$ is the scalar
$|\dot{x}|^2$.

> :nerdygoose: This trick — "the square of a vector is a scalar, so
> $\dot{x}^2$ is unambiguously kinetic-energy material" — is what
> makes the GA formalism behave like undergrad mechanics with no
> grade-juggling overhead at the lowest level.

## 2. The Lagrangian

For a particle in a potential $V(x)$:

$$L(x, \dot{x}) = \tfrac{1}{2}m\dot{x}^2 - V(x)$$

The Euler-Lagrange equations are derived the same way as in vector
calculus:

$$\frac{d}{dt}\left(\frac{\partial L}{\partial \dot{x}}\right) = \frac{\partial L}{\partial x}$$

where $\partial/\partial x$ and $\partial/\partial \dot{x}$ are
**vector derivatives**, not Greek-index gradients. The vector
derivative is itself a vector — multiplying by a basis $e_i$
selects each component:

$$\frac{\partial L}{\partial x} = e_i \frac{\partial L}{\partial x^i}$$

For the kinetic term, $\partial T/\partial \dot{x} = m\dot{x}$ (a
vector — the momentum $p$). For the potential, $\partial V/\partial x = \nabla V$
(the gradient as a vector). Newton's second law reappears:

$$\boxed{\; m\ddot{x} = -\nabla V \;}$$

— but now $\nabla V$ is a vector in any signature, and there's no
implicit metric-raising / metric-lowering in the derivation. GA
gave back the textbook formula with cleaner provenance.

## 3. Momentum and the Hamiltonian

Conjugate momentum is

$$p := \frac{\partial L}{\partial \dot{x}} = m\dot{x}$$

— a vector. The Hamiltonian is the Legendre transform

$$H(x, p) = p\cdot\dot{x} - L = \frac{p^2}{2m} + V(x)$$

with $p^2 = p\cdot p$ as before (scalar via vector-squared).
Hamilton's equations:

$$\dot{x} = \frac{\partial H}{\partial p}, \qquad \dot{p} = -\frac{\partial H}{\partial x}$$

For the simple Hamiltonian above:

$$\dot{x} = p/m, \qquad \dot{p} = -\nabla V$$

Same equations as the vector-calculus textbook — but the
construction extended without coordinates. We never picked a frame.

> :mathgoose: The Legendre transform $L \to H$ is a
> change-of-variable from $\dot{x}$ to $p$. In GA both are vectors,
> and the transformation is purely algebraic. In tensor language
> you'd have to track index positions ($\dot{q}^i \to p_i$); in
> GA you just write $p = \partial L / \partial \dot{x}$ and the
> components sort themselves.

## 4. Generalized coordinates without indices

Real mechanics rarely runs in Cartesian coordinates. A pendulum
has angular position. A particle on a sphere has two coordinates
embedded in a constraint surface. The Lagrangian formalism extends
to **generalized coordinates** $q^i$, and the Euler-Lagrange
equations become

$$\frac{d}{dt}\frac{\partial L}{\partial \dot{q}^i} = \frac{\partial L}{\partial q^i}$$

In GA we can do better: write the trajectory as a multivector
valued function $X(t)$ where $X$ might be a position, a rotor, or
some combination, and differentiate with respect to multivector
parameters.

For a **constrained** trajectory on a surface defined by
$f(x) = 0$, the GA approach is to parameterize $x$ directly as a
function of a smaller number of coordinates, or to introduce a
Lagrange multiplier. The latter:

$$L_{\text{eff}} = \tfrac{1}{2}m\dot{x}^2 - V(x) - \lambda(t) f(x)$$

The equation of motion becomes $m\ddot{x} = -\nabla V - \lambda \nabla f$.
The Lagrange multiplier $\lambda$ is the normal force, and
$\nabla f$ is the surface normal. No tangent-bundle, no
co-distribution, no fiber-bundle vocabulary needed.

> :surprisedgoose: D'Alembert's principle — "virtual displacements
> compatible with constraints" — is just "vectors tangent to the
> constraint surface" in GA. The wedge product $\nabla f \wedge \delta x = 0$
> *is* the constraint that $\delta x$ is tangent to the surface.
> Same content as the variational-calculus formulation, but
> algebraic.

## 5. Rotors as generalized coordinates

For a rigid body, the configuration is captured by a rotor $R(t) \in \mathrm{Spin}(3)$.
We can write the Lagrangian in terms of $R$ and $\dot{R}$ instead of
Euler angles:

$$T = \tfrac{1}{2}\langle \dot{R} I \tilde{R} \dot{R} I \tilde{R} \rangle_0 \cdot \text{(moments-of-inertia weighted)}$$

(The expansion is in [Ch 7](/physics-ga/part-2-classical-mechanics/rigid-body-dynamics-with-rotors)
— spelled out properly there.) The key point: $R$ is itself a
generalized coordinate in the even subalgebra, and $\dot{R}$ is its
"velocity." From the constraint $R\tilde{R} = 1$, $\dot{R}$ must
satisfy $\dot{R}\tilde{R} + R\dot{\tilde{R}} = 0$, which forces

$$\dot{R}\tilde{R} = \tfrac{1}{2}\Omega$$

with $\Omega$ a bivector — the **angular velocity bivector** from
[Ch 2 §6](/physics-ga/part-1-foundations/reflections-rotations-and-the-sandwich).

This is why rigid-body mechanics in GA collapses so cleanly: the
configuration manifold (the rotor group) carries its own natural
"velocity" object (the bivector), and the Lagrangian becomes a
function of $(R, \Omega)$ instead of $(R, \dot{R})$.

## 6. Conserved quantities and Noether's theorem

For a Lagrangian invariant under a continuous symmetry parameterized
by $\alpha$, Noether's theorem gives a conserved quantity

$$Q = \frac{\partial L}{\partial \dot{x}} \cdot \frac{\partial x}{\partial \alpha}$$

For **translation symmetry** ($x \to x + \alpha a$ for a constant
vector $a$), the conserved quantity is $p\cdot a$ — momentum
component along $a$. Total momentum $p$ conserved.

For **rotation symmetry** ($x \to R x \tilde{R}$ with
$R = \exp(\alpha B/2)$), the conserved quantity is

$$L = x \wedge p$$

— a **bivector**. This is the angular momentum, lifted from the
3D cross-product form $\mathbf{r}\times\mathbf{p}$ to its
GA-native form $x \wedge p$. The bivector $L$ is the plane of
motion and the magnitude of angular momentum, all in one object.

> :happygoose: Angular momentum is a bivector, full stop. In 3D it
> happens to be dual to a vector, which is why the cross-product
> form works. In any other dimension — 4D classical mechanics, 4D
> spacetime, hyperdimensional phase space — angular momentum stays
> a bivector. The cross product was always GA's wedge with the
> $\star$ glued on.

### Energy conservation

For a Lagrangian explicitly time-independent ($\partial L/\partial t = 0$),
energy is conserved:

$$E = p\cdot\dot{x} - L = H$$

In GA this is one line: the Hamiltonian *is* the conserved energy,
and the Legendre transform construction makes it visible.

## 7. Constraints, gauge, and the price of "elegant" formulations

GA doesn't dodge the structural problems of classical mechanics — it
just exposes them more cleanly.

**Holonomic constraints** ($f(x, t) = 0$) reduce the configuration
space. Solve them by parameterizing the constraint surface, or by
Lagrange multipliers as in §4.

**Non-holonomic constraints** ($f(x, \dot{x}, t) = 0$ that can't be
integrated) — like a rolling wheel — break the variational
formulation. The GA version is no better here; same physics, same
limitations. (The skating-coin problem is hard in *any* notation.)

**Gauge freedom** in the Lagrangian — $L \to L + df/dt$ for any
$f$ — leaves the equations of motion unchanged. This is a
1-parameter family of equivalent Lagrangians, and it's the
classical-mechanics seed of all the gauge theory in [Part VI](/physics-ga/part-6-gauge-gravity/gauge-principles-for-gravitation).

## 8. The phase-space picture

Hamiltonian mechanics lives on **phase space** — pairs $(x, p)$
of position vector and momentum vector. In GA, $(x, p)$ is just
a pair of vectors; phase space is the direct sum
$\mathbb{R}^n \oplus \mathbb{R}^n$, and the symplectic structure
is encoded in the **bivector**

$$\omega = dp \wedge dx$$

(read in the sense of differential forms; in GA the same content
lives as a bivector-valued 2-form).

Poisson brackets become

$$\{f, g\} = (\nabla_x f)\cdot(\nabla_p g) - (\nabla_p f)\cdot(\nabla_x g)$$

— a scalar built from vector derivatives, with the antisymmetry
making it a Lie-algebra bracket. The GA reformulation reveals the
bivector $\omega$ as the natural symplectic structure; we'll use it
implicitly throughout Part II without belaboring the differential
geometry.

> :weightliftinggoose: The full symplectic-geometry story belongs to
> a different book. For our purposes: $(x, p)$ are vectors,
> $L = x \wedge p$ is angular momentum, $\{f, g\}$ is the Poisson
> bracket. That's enough to do orbits and rigid bodies.

## What we covered

- Kinetic energy is just $\tfrac{1}{2}m\dot{x}^2$ — vector squared
  is scalar.
- Euler-Lagrange equations carry over unchanged with vector
  derivatives replacing Greek-index gradients.
- Generalized coordinates work the same; rotor coordinates for
  rigid bodies give a cleaner formulation than Euler angles.
- Noether's theorem gives momentum (vector) for translations and
  angular momentum (**bivector**) for rotations.
- The energy / Legendre / Poisson-bracket machinery survives with
  vector derivatives.

## What's next

[Chapter 5](/physics-ga/part-2-classical-mechanics/two-body-central-force) —
the two-body central-force problem in GA. Conservation laws give
constants of motion as bivectors; the Laplace-Runge-Lenz vector
falls out naturally; Kepler's laws follow.
