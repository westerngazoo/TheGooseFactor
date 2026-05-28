---
sidebar_position: 2
title: "Reflections, Rotations, and the Sandwich"
---

# Reflections, Rotations, and the Sandwich

> *Doran-Lasenby §1.6, §2.2.* Why $v \mapsto RvR^{-1}$ is not an
> arbitrary convention but the *forced* form for any orthogonal
> transformation in any signature.

The sandwich product looks like a notational trick on first
encounter — why two factors? The reason runs deep: every orthogonal
transformation is a product of reflections, every reflection is a
sandwich by a vector, and so every orthogonal transformation is a
sandwich. Once you see this, rotors aren't a special construction —
they're the unique algebraic object the geometry hands you.

## 1. One reflection as a sandwich

Take a unit vector $\hat{n}$ and ask: how does a vector $v$ reflect
through the hyperplane perpendicular to $\hat{n}$?

Decompose $v$ into a part parallel to $\hat{n}$ and a part
perpendicular:

$$v = v_\parallel + v_\perp = (v\cdot\hat{n})\hat{n} + v_\perp$$

Reflection flips the parallel part and leaves the perpendicular
part:

$$v' = -v_\parallel + v_\perp$$

Now compute the sandwich $-\hat{n} v \hat{n}$ using the geometric
product. First, the parallel part: $\hat{n}$ and $v_\parallel$ are
proportional, so they commute, and $\hat{n}\hat{n} = 1$:

$$-\hat{n} v_\parallel \hat{n} = -v_\parallel \hat{n}\hat{n} = -v_\parallel$$

For the perpendicular part, $\hat{n}$ and $v_\perp$ anticommute
($\hat{n} v_\perp = -v_\perp \hat{n}$, because their dot product is
zero so only the wedge survives), and again $\hat{n}\hat{n} = 1$:

$$-\hat{n} v_\perp \hat{n} = v_\perp \hat{n}\hat{n} = v_\perp$$

Adding:

$$\boxed{\; -\hat{n} v \hat{n} = -v_\parallel + v_\perp \;}$$

— exactly the reflection through the hyperplane perpendicular to
$\hat{n}$.

> :happygoose: One unit vector, one sandwich, one reflection. No
> matrix, no basis choice, no cross product. The same formula
> works in 3D, 4D, spacetime — anywhere with a quadratic form.

### Why the minus sign?

Some references write $v \mapsto \hat{n} v \hat{n}$ (without the
sign) and call it a reflection. The convention difference is whether
you reflect through the hyperplane (which fixes the perpendicular
plane and flips $\hat{n}$) or through the line $\hat{n}$ (which
fixes $\hat{n}$ and flips the perpendicular plane). Both are
"reflections" — they're each other composed with the antipodal
map $v \mapsto -v$, which is itself a reflection-of-reflections in
even dimensions.

D-L uses the form $\hat{n} v \hat{n}$ as "reflection across $\hat{n}$"
(fixing $\hat{n}$). We'll follow that:

$$\text{Refl}_{\hat{n}}(v) := \hat{n} v \hat{n}$$

The sign convention rarely matters in practice as long as you stay
consistent.

## 2. Two reflections compose to a rotation

Cartan-Dieudonné theorem says every orthogonal transformation in
$\mathbb{R}^n$ is a product of at most $n$ reflections. In
particular, **two reflections always compose to a rotation**.

Reflect first through $\hat{m}$, then through $\hat{n}$:

$$v \;\to\; \hat{m} v \hat{m} \;\to\; \hat{n}(\hat{m} v \hat{m})\hat{n} = (\hat{n}\hat{m})\, v\, (\hat{m}\hat{n})$$

The composed operation is a sandwich by the product $\hat{n}\hat{m}$.
Call this product

$$R := \hat{n}\hat{m}$$

It's a multivector — specifically, a scalar plus a bivector:

$$R = \hat{n}\cdot\hat{m} + \hat{n}\wedge\hat{m} = \cos\theta + \hat{B}\sin\theta$$

where $\theta$ is the angle between $\hat{n}$ and $\hat{m}$, and
$\hat{B}$ is the unit bivector in the plane spanned by them. We've
recovered Euler's formula in disguise:

$$R = \cos\theta + \hat{B}\sin\theta = \exp(\hat{B}\theta)$$

(using $\hat{B}^2 = -1$ — see [Ch 1 §3](/physics-ga/part-1-foundations/ga-in-60-seconds#3-the-four-grades)).

And the sandwich form? Computing $\hat{m}\hat{n}$ uses the reverse:

$$\tilde{R} = \hat{m}\hat{n} = \cos\theta - \hat{B}\sin\theta = \exp(-\hat{B}\theta)$$

So $R\tilde{R} = (\cos^2\theta + \sin^2\theta) = 1$.

Two unit-vector reflections compose to:

$$v \mapsto R\, v\, \tilde{R}, \qquad R = \exp(\hat{B}\theta)$$

— a **rotation by angle $2\theta$ in the plane $\hat{B}$**.

> :surprisedgoose: The angle doubles. Reflecting twice across
> mirrors at angle $\theta$ rotates by $2\theta$ — the classical
> "two-mirrors" theorem from elementary geometry. The half-angle
> in $R = \exp(B/2)$ is the same fact: write the rotation angle
> $\varphi = 2\theta$ and you get $R = \exp(\hat{B}\varphi/2)$.

## 3. The half-angle, finally explained

The sandwich applies $R$ twice — once on the left, once on the right
(as $\tilde{R}$). If $R = \exp(B/2)$ encodes a half-angle, then
the geometric action sees both halves and applies a full $B$ worth
of rotation.

This is **not** an accident of dimension or signature. The doubling
appears because:

$$RvR^{-1} = \exp(B/2)\,v\,\exp(-B/2) = v + [B, v]/2 + \frac{1}{2!}[B,[B,v]]/4 + \cdots$$

Each commutator with $B$ kicks $v$ by a rotation in the $B$ plane.
The series sums to $\exp(B) v \exp(-B) = $ rotation by angle $|B|$.
The half-angle convention is what makes the sandwich notation
clean.

Equivalently: rotors live in $\mathrm{Spin}(n)$, the **double cover**
of $SO(n)$. The double cover ${\to}$ half-angles ${\to}$ sandwich
form are three faces of the same fact.

> :mathgoose: This is the same reason quaternions parameterize 3D
> rotations with $q = \cos(\theta/2) + \sin(\theta/2)\,\hat{n}$ —
> the half-angle is exposed in the parameterization. The quaternion
> $q$ in 3D *is* the rotor $R$ in $\mathcal{Cl}(3,0)$'s even
> subalgebra, with $\hat{n} I = -\hat{B}$ flipping the picture
> between "axis of rotation" and "plane of rotation." Different
> notation, same math.

## 4. The sandwich works in any signature

Nothing in §1–2 used the specific value $\hat{n}^2 = +1$. All we
needed was that $\hat{n}^2$ is a scalar — i.e., a vector squares
to a scalar under the geometric product. That's guaranteed in any
Clifford algebra $\mathcal{Cl}(p,q)$.

For a null vector ($n^2 = 0$), the construction breaks — you can't
normalize. For a vector with $\hat{n}^2 = -1$ (a "timelike" or
"negative-norm" vector), the reflection picks up an overall sign,
but the sandwich form survives:

$$\text{Refl}_{\hat{n}}(v) = -\hat{n} v \hat{n} \quad\text{when } \hat{n}^2 = -1$$

In spacetime algebra with signature $(+,-,-,-)$, this means:

- Reflecting through a timelike hyperplane (perpendicular to a
  vector with $n^2 = +1$): $v \mapsto \hat{n} v \hat{n}$.
- Reflecting through a spacelike hyperplane (perpendicular to a
  vector with $n^2 = -1$): $v \mapsto -\hat{n} v \hat{n}$.

Composing two such reflections gives a **rotor in spacetime** —
which, depending on whether the two vectors generate a timelike
or spacelike plane, is either a Lorentz **boost** or a spatial
**rotation**.

> :nerdygoose: A Lorentz boost is the same algebraic object as a
> spatial rotation. Both are rotors $R = \exp(B/2)$ for some
> bivector $B$. The boost is in a timelike bivector ($B^2 > 0$,
> giving $\sinh$ and $\cosh$ in the exponential); the rotation is
> in a spacelike bivector ($B^2 < 0$, giving $\sin$ and $\cos$).
> Spatial rotations and Lorentz boosts are members of the same
> 6-parameter family — the Lorentz group is just the rotor group
> of $\mathcal{Cl}(1,3)$.

## 5. Composing rotations the lazy way

Composing two rotations $R_1$ then $R_2$:

$$v \;\to\; R_1 v \tilde{R_1} \;\to\; R_2 R_1 v \tilde{R_1}\tilde{R_2} = (R_2 R_1)\, v\, \widetilde{(R_2 R_1)}$$

The composed rotor is **just the product**: $R = R_2 R_1$. No matrix
multiplication, no Euler-angle bookkeeping. The reverse of a product
flips order: $\widetilde{R_2 R_1} = \tilde{R_1}\tilde{R_2}$, which
balances the sandwich.

For three rotations: $R = R_3 R_2 R_1$. For $n$ rotations: just
multiply rotors in order. The geometry takes care of itself.

> :weightliftinggoose: This is the kinematics chapter in disguise.
> Composing rigid-body rotations is one of the eternally painful
> problems in classical mechanics — Euler angles have gimbal lock,
> rotation matrices have 9 parameters with 6 constraints, Tait-Bryan
> conventions disagree across textbooks. With rotors: $R = R_3 R_2 R_1$.
> No gimbal lock, no constraints, no convention wars. Welcome to
> [Ch 7 — rigid-body dynamics](/physics-ga/part-2-classical-mechanics/coming-soon).

## 6. Differentiating a rotor

For a time-dependent rotor $R(t)$ with $R\tilde{R} = 1$, differentiate:

$$\dot{R}\tilde{R} + R\dot{\tilde{R}} = 0 \quad\Rightarrow\quad \dot{R}\tilde{R} = -R\dot{\tilde{R}} = -(\dot{R}\tilde{R})^\sim$$

So $\dot{R}\tilde{R}$ is its own negative reverse — meaning it's a
pure bivector. Call it $\Omega/2$ (the factor of 2 is conventional,
matching the half-angle in $R = \exp(B/2)$):

$$\boxed{\; \dot{R} = \tfrac{1}{2}\Omega R \;}$$

The bivector $\Omega$ is the **angular velocity bivector** — the
GA-native form of the angular velocity 3-vector $\boldsymbol{\omega}$,
related by $\Omega = I\boldsymbol{\omega}$ in 3D.

This single equation drives all of rigid-body dynamics in [Part II](/physics-ga/part-2-classical-mechanics/coming-soon).
It also reappears in [Part III](/physics-ga/part-3-spacetime-algebra/coming-soon)
as the rate-of-change of an observer's frame.

## 7. Reflections, rotations, and the orthogonal group

We've now derived the structure of the orthogonal group from one
algebraic rule (the geometric product) and one geometric primitive
(reflection across a hyperplane):

| Object | What it is | What it does |
|---|---|---|
| Unit vector $\hat{n}$ | grade-1 multivector | one reflection |
| Rotor $R = \hat{n}\hat{m}$ | even-grade multivector | two reflections = one rotation |
| Rotor product $R_2 R_1$ | rotor | composed rotations |
| $\dot{R} = \Omega R / 2$ | bivector × rotor | rotor rate of change |

The orthogonal group $O(n)$ is generated by reflections; the
rotation group $SO(n)$ is generated by **pairs** of reflections —
i.e., by rotors. In GA this is built in, not bolted on.

> :angrygoose: Matrix representations of rotation groups feel
> arbitrary because *they are*. They impose a basis where none is
> needed, and they hide the underlying algebraic structure. Once
> you've seen rotations as rotors, every group-theory textbook's
> $3\times 3$ matrices look like an obfuscation. Hestenes spent
> 40 years arguing this and was ignored. He was right.

## What we covered

- One reflection through a hyperplane $\hat{n}$ is the sandwich
  $\hat{n} v \hat{n}$.
- Two reflections compose to a rotation, $v \mapsto R v \tilde{R}$
  with $R = \hat{n}\hat{m}$.
- The half-angle in $R = \exp(B/2)$ comes from the sandwich applying
  $R$ twice — this is also why $\mathrm{Spin}(n)$ is the double
  cover of $SO(n)$.
- The same construction generalizes to any signature; in
  $\mathcal{Cl}(1,3)$ it gives both rotations and Lorentz boosts.
- Composing rotors is just multiplication: $R = R_2 R_1$.
- A time-dependent rotor satisfies $\dot{R} = \tfrac{1}{2}\Omega R$
  with $\Omega$ a bivector — the angular velocity bivector.

## What's next

[Chapter 3](/physics-ga/part-1-foundations/frames-components-and-tensor-free-linear-algebra)
re-derives linear algebra in GA terms — frames, dual bases,
determinants, eigenvalue problems — without ever writing a Greek
index. This is the bridge to D-L's coordinate-free notation used
through the rest of the book.
