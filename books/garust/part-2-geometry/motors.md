---
sidebar_position: 3
title: "Motors: Rigid-Body Motion"
---

# Motors

> Every rigid motion of 3D space — any rotation about any axis, any
> translation, and their combination — is a single object you build, apply
> by **sandwiching**, and compose by **multiplying**: a **motor**. It's an
> even-grade versor of Projective GA, it generalizes the rotor of
> [Part I](/garust/part-1-foundations/reflections-rotors-and-exp) to
> include translation, and it's the foundation a physics engine puts bodies
> onto. `garust`'s `Motor` is the capstone of the geometry layer.

[Chapter 7](/garust/part-2-geometry/projective-ga) gave us points, lines,
and planes in $Cl(3,0,1)$. This chapter adds the verb: **motion**. In
Euclidean GA, rotors rotated but couldn't translate
([Chapter 7, §1](/garust/part-2-geometry/projective-ga)). PGA's null
generator removes that limit — translation becomes a sandwich too — and the
unified rigid-motion object is the motor. This is where `garust` becomes a
kinematics engine.

## 1. Every rigid motion is a screw

A deep fact (Chasles' theorem): **every** rigid-body motion of 3D space —
no matter how complicated — is a **screw motion**: a rotation about some
line combined with a translation *along* that same line. Pure rotations
(no translation) and pure translations (no rotation) are the two special
cases. So if we can represent screws, we can represent *all* rigid motion
with one object.

That object is the **motor** (from "**mo**tion vec**tor**"), and in PGA it's
an **even-grade versor** — a product of an even number of reflections,
living in grades $0, 2, 4$. `garust` wraps it in a tidy newtype over a
PGA multivector:

```rust
// from garust::motor — a rigid motion is an even-grade versor of Cl(3,0,1)
pub struct Motor<T> { versor: Multivector<T, 3, 0, 1, 16> }
```

## 2. Rotors: rotation, in PGA

The rotor is exactly the exponential-of-a-bivector from
[Chapter 5](/garust/part-1-foundations/reflections-rotors-and-exp), now in
PGA. `Motor::rotor(radians, plane)` rotates by an angle in the plane of a
unit Euclidean bivector (about the origin axis perpendicular to it):

$$
R = e^{-\frac{\theta}{2} B}, \qquad B = e_{23}\ (\text{about } x),\
e_{13}\ (y),\ e_{12}\ (z).
$$

```rust
// from garust::motor
pub fn rotor(radians: T, plane: Pga<T>) -> Self {
    Self { versor: (plane * (radians * T::from_f64(-0.5))).exp() }
}

// 90° about the x-axis sends (0,1,0) → (0,0,1):
let r = Motor::rotor(FRAC_PI_2, Pga3::basis(0b0110));   // e23 plane
let moved = r.apply(&Pga3::point(0.0, 1.0, 0.0));        // → point(0,0,1)
```

Same construction as Part I — a plane and an angle, exponentiated, applied
by sandwich. Nothing new yet; the new power is the *other* generator.

## 3. Translators — and a lovely surprise

Now the gap PGA closes: **translation as a versor**.
`Motor::translator(dx, dy, dz)` is also an exponential — of a bivector
built from the **null generator** $e_0$:

$$
T = \exp\!\Big(-\tfrac{1}{2}\big(dx\,e_{0}e_{1} + dy\,e_{0}e_{2} +
dz\,e_{0}e_{3}\big)\Big).
$$

```rust
// from garust::motor
pub fn translator(dx: T, dy: T, dz: T) -> Self {
    let e0 = Pga::<T>::basis(8);
    let b = (e0*Pga::<T>::basis(1))*dx + (e0*Pga::<T>::basis(2))*dy + (e0*Pga::<T>::basis(4))*dz;
    Self { versor: (b * T::from_f64(-0.5)).exp() }
}
```

The surprise: the generating bivector $e_0 e_i$ is **null** — it squares to
zero (because $e_0^2 = 0$). So in the exponential series $e^B = 1 + B +
\frac{B^2}{2} + \dots$, *every term past the first power vanishes*:

$$
e^{B} = 1 + B \qquad (B^2 = 0).
$$

The exponential **truncates after one term**. A translator is just
$1 - \frac{1}{2}(\dots)$ — exactly linear in the displacement.

> :surprisedgoose: This is the quiet magic of the *degenerate* metric.
> Rotations curve — their generator $B$ has $B^2 = -1$, so the exponential
> spins out the full $\cos + \sin$ series (a circle). Translations are
> flat — their generator is **null**, $B^2 = 0$, so the exponential
> *stops* at $1 + B$ (a straight line). The geometry is written into the
> *square of the generator*: $-1$ gives you a curve, $0$ gives you a line.
> The same `exp` that builds rotors builds translators, and it "knows"
> which is which purely from whether the bivector squares to $-1$ or $0$.
> One operation, and the metric decides whether motion curves or runs
> straight. PGA's null dimension isn't a hack — it's exactly the "flatness"
> of translation, encoded algebraically.

## 4. Applying and composing motors

A motor acts on **any** PGA object — point, line, or plane — by the
**sandwich** $M x \tilde{M}$ (the same universal action as every versor,
[Chapter 5](/garust/part-1-foundations/reflections-rotors-and-exp)):

```rust
// from garust::motor — apply by sandwich; compose by multiply; invert
pub fn apply(&self, x: &Pga<T>) -> Pga<T> { self.versor.sandwich(x) }
pub fn compose(&self, rhs: &Self) -> Self { Self { versor: self.versor * rhs.versor } }
pub fn inverse(&self) -> Self { Self { versor: self.versor.versor_inverse() } }
```

Composition is **multiplication of versors**, and `a * b` applies `b`
first, then `a` — like function composition. Motors form a group: the
identity is `Motor::identity()` (the scalar $1$), every motor has an
`inverse()` (so `m.compose(&m.inverse())` is the identity), and they're
**unit norm** ($\langle M\tilde M\rangle_0 = 1$). One object, closed under
composition and inversion — exactly a transform/pose type.

## 5. Screw motions: rotation and translation together

Compose a rotor and a translator and you get a general screw — `garust`'s
own test:

```rust
// Rotate (0,1,0) 90° about x → (0,0,1), then translate +3 in x ⇒ (3,0,1).
// M = T * R applies R first.
let r = Motor::rotor(FRAC_PI_2, Pga3::basis(0b0110));
let t = Motor::translator(3.0, 0.0, 0.0);
let m = t * r;
let moved = m.apply(&Pga3::point(0.0, 1.0, 0.0));   // → point(3, 0, 1)
```

And because composition is non-commutative, **order matters** — rotate-then-
translate $\ne$ translate-then-rotate (unless the translation is along the
axis). That's not a bug; it's the geometry: $T R$ and $R T$ are genuinely
different motions, and the algebra tracks it automatically (where matrix
code is forever fighting multiplication order).

## 6. Rotation about *any* line — the real power

`Motor::rotor` spins about an *origin* axis. The general tool is
`Motor::rotation_about(line, radians)`, which rotates about **any line in
space** — a PGA line bivector ([Chapter 7](/garust/part-2-geometry/projective-ga)),
often from `line_through`:

```rust
// from garust::motor — rotate about an arbitrary line (normalized internally)
pub fn rotation_about(line: Pga<T>, radians: T) -> Self {
    let unit = line.normalized();
    Self { versor: (unit * (radians * T::from_f64(-0.5))).exp() }
}
```

This is what Euclidean rotors *couldn't* do: an **off-origin** axis. A
$180°$ turn about the vertical line through $(1,0,0)$ carries the origin to
$(2,0,0)$ — a real screw axis, not an origin rotation — and points *on* the
axis stay fixed:

```rust
let axis = Pga3::point(1.0,0.0,0.0).line_through(&Pga3::point(1.0,0.0,1.0));
let half_turn = Motor::rotation_about(axis, PI);
half_turn.apply(&Pga3::point(0.0,0.0,0.0));        // → point(2, 0, 0)
half_turn.apply(&Pga3::point(1.0,0.0,0.5));        // → unchanged (on the axis)
```

Build the axis as a *line through two points*, rotate about it — exactly
how you'd describe a door swinging on its hinge or a limb about a joint.
That's robotics and physics, expressed directly.

## 7. Why the motor is the engine's transform

Step back at what a motor *is* for a simulation or robotics engine: the
ideal **pose / transform** primitive.

- **One type for all rigid motion** — rotation, translation, and screws,
  no separate "rotation quaternion + translation vector" bookkeeping.
- **Composes by multiplication** ($M_2 M_1$), associatively — chain joints,
  stack transforms, with the algebra handling order.
- **Applies to everything by one operation** — the sandwich moves points,
  lines, *and* planes identically (move a rigid body and its faces and
  edges transform consistently).
- **Inverts and renormalizes cleanly** — `inverse()` undoes a motion;
  unit-norm drift is fixed by rescaling, never by re-orthonormalizing a
  matrix.
- **Interpolates** — `exp`/`log` on the screw bivector give smooth
  rigid-motion blends (the rigid-body "slerp"), for animation and motion
  planning.

A $4{\times}4$ matrix does rigid motion too, but motors compose more
cheaply, never drift off the manifold of rigid motions, interpolate
correctly, and unify rotation with translation — which is why GA-based
engines use them as the pose type.

## 8. The geometry layer, complete

That closes Part II — `garust` is now a complete **kinematics engine**:

- **Duality** ([Ch 6](/garust/part-2-geometry/duality-and-the-meet)) — the
  meet, the pseudoscalar, metric-independent complements.
- **Projective GA** ([Ch 7](/garust/part-2-geometry/projective-ga)) —
  points, lines, planes, and incidence as products, in $Cl(3,0,1)$.
- **Motors** — *every* rigid motion as one even-grade versor: rotors,
  translators (with their truncating null exponential), screws, and
  rotation about any line, composed by `*` and applied by `sandwich`.

You can now represent geometric objects *and* move them rigidly — which is
exactly the state and update a physics engine needs for a rigid body. The
algebra (Part I) and the geometry (Part II) together are the `garust`
foundation. From here the book widens to other algebras
([Part III](/garust/table-of-contents): conformal, spacetime) and the
engine's design ([Part IV](/garust/table-of-contents)). And the **physics**
— putting mass, velocity, and force onto these motors, with angular
velocity as the bivector it always was — is the companion
**[Physics through GA](/physics-ga/)**, which builds directly on the motor
you just met.

> :weightliftinggoose: The **motor** is the payoff of the whole geometry
> layer: *one* even-grade PGA versor for **every** rigid motion (Chasles'
> screw theorem). Hold the pieces: **rotor** $= e^{-\frac{\theta}{2}B}$
> (origin axis), **translator** $= e^{-\frac{1}{2}(\dots e_0 e_i)}$ whose
> **null generator makes `exp` truncate to $1+B$** (translation is flat),
> **`rotation_about`** any line (off-origin screw axes), all **composed by
> `*`** (order matters) and **applied by `sandwich`** to points, lines, and
> planes alike. It's the engine's pose type — composes, inverts,
> interpolates, never drifts. Build a door swinging on its hinge with
> `line_through` + `rotation_about` and you've done robotics in three
> lines. Part II done; the physics book takes it from here.

## What we covered

- **Chasles' theorem**: every rigid motion is a **screw** (rotation about a
  line + translation along it); the unifying object is the **motor**, an
  **even-grade PGA versor** (`Motor<T>` over $Cl(3,0,1)$).
- **Rotors** (`Motor::rotor`) are the Part I exponential-of-a-bivector,
  $e^{-\frac{\theta}{2}B}$, about an origin axis.
- **Translators** (`Motor::translator`) exponentiate a **null** bivector
  ($e_0 e_i$, squares to $0$), so `exp` **truncates to $1 + B$** —
  translation is linear, the metric's $0$ vs $-1$ deciding straight vs
  curved.
- Motors **apply by sandwich** ($M x \tilde M$, to points/lines/planes
  alike), **compose by `*`** (`a*b` does `b` first; order matters), and
  **invert** (`versor_inverse`); they form a unit-norm group.
- **`rotation_about`** rotates about **any line** (off-origin screw axes) —
  what Euclidean rotors couldn't do; points on the axis stay fixed.
- The motor is the ideal **pose/transform**: one type for all rigid motion,
  composes/inverts/interpolates, never drifts — why GA engines use it over
  matrices.
- Part II completes `garust`'s **kinematics engine** (duality + PGA +
  motors); the **physics** built on it is the companion *Physics through
  GA*.

## What's next

That's Part II. [Part III](/garust/table-of-contents) widens the engine to
the **other algebras** `garust`'s generality unlocks — **Conformal GA**
(circles and spheres as first-class objects) and **Spacetime Algebra** (the
algebra of relativity) — plus a **signature cookbook** for choosing
$Cl(P,Q,R)$. Then [Part IV](/garust/table-of-contents) digs into the
engine's design: generic over scalar and signature, the products as bit
tricks, and extending `garust`. The **physics** built on all of it lives in
**[Physics through GA](/physics-ga/)**.
