---
sidebar_position: 4
title: "Reflections, Rotors, and exp"
---

# Reflections, Rotors, and exp

> What the algebra was *for*: motion. A **reflection** is a sandwich
> $-n\,x\,n^{-1}$; compose two reflections and you get a **rotation**; the
> **rotor** $R = e^{-\frac{\theta}{2}B}$ exponentiates a bivector into a
> rotation in **any** dimension — generalizing complex numbers and
> quaternions — and applies via the sandwich $R\,x\,\tilde{R}$. `garust`
> computes the exponential in closed form. This is where GA stops being
> elegant notation and becomes a *better way to rotate*.

[Chapter 4](/garust/part-1-foundations/wedge-inner-and-the-identity) split
the geometric product into alignment and oriented area. Now we use the
product's *invertibility* ([Chapter 3](/garust/part-1-foundations/the-geometric-product))
to **move** things. Reflections and rotations — the operations physics and
graphics live on — become *multiplication by versors*, with none of the
matrix bookkeeping or quaternion mysticism. This chapter is the climax of
Part I.

## 1. First, three involutions

To build motions we need a few sign-flipping operations on multivectors —
the **involutions**. The one that matters most is the **reverse**
$\tilde{M}$: reverse the order of generators in every blade. Since
reordering costs signs ([Chapter 3](/garust/part-1-foundations/the-geometric-product)),
the reverse multiplies each grade-$k$ blade by $(-1)^{k(k-1)/2}$:

$$
\widetilde{e_i} = e_i,\quad \widetilde{e_{ij}} = e_{ji} = -e_{ij},\quad
\widetilde{e_{ijk}} = -e_{ijk}, \dots
$$

`garust` provides the reverse, the **grade involution** (flip sign by
grade parity, $(-1)^k$), and **Clifford conjugation** (their composition).
The reverse is the one we need constantly: it appears in norms ($|M|^2 =
\langle M\tilde M\rangle_0$, [Chapter 4](/garust/part-1-foundations/wedge-inner-and-the-identity))
and — about to matter — in the sandwich that applies a rotor.

## 2. Reflection is a sandwich

Here is the first piece of magic. To **reflect** a vector $x$ in the
hyperplane through the origin with unit normal $n$ (so $n^2 = 1$), the
formula is:

$$
x' = -\,n\,x\,n.
$$

That's it — multiply $x$ on both sides by the unit normal and negate. No
projection formula, no matrix. Why it works: decompose $x = x_\parallel +
x_\perp$ into parts parallel and perpendicular to $n$. The parallel part
*commutes* with $n$ (parallel vectors commute); the perpendicular part
*anticommutes* (orthogonal vectors anticommute,
[Chapter 3](/garust/part-1-foundations/the-geometric-product)). So:

$$
-n x n = -n(x_\parallel + x_\perp)n = -x_\parallel\,n^2 + x_\perp\,n^2
       = -x_\parallel + x_\perp.
$$

The component *along* the normal flips; the component *in* the mirror is
unchanged — exactly a reflection. For a non-unit normal, divide by its
square: $x' = -n\,x\,n^{-1}$, using the vector inverse $n^{-1} = n/|n|^2$
that the geometric product gave us. **Sandwiching with a vector reflects.**

## 3. Two reflections make a rotation

Now compose. Reflect in the plane with normal $a$, then in the plane with
normal $b$ (both unit):

$$
x \;\mapsto\; -a x a \;\mapsto\; -b(-a x a)b = (ba)\,x\,(ab) = R\,x\,\tilde{R},
\qquad R = ba.
$$

(Here $\tilde R = \widetilde{ba} = ab$ is the reverse of $R$.) Two
reflections compose into a **rotation** — this is the **Cartan–Dieudonné
theorem**, and it's purely mechanical here. The rotation is **by twice the
angle between the mirrors**, in the plane the two normals span. The object
$R = ba$ — a product of two unit vectors — is a **rotor**, and it acts by
the **sandwich** $R\,x\,\tilde{R}$.

> :surprisedgoose: The "twice the angle" is the famous **double cover**,
> and it's not a quirk — it's *why* rotations need half-angles everywhere
> (quaternions, spinors, the $720°$ of a spin-½ particle). Two mirrors at
> angle $\phi$ rotate by $2\phi$, so to rotate by $\theta$ your rotor uses
> $\theta/2$. That half-angle is the same $\theta/2$ in $e^{i\theta/2}$ for
> complex rotation and in unit quaternions — because those *are* rotors
> ([§7](#7-rotors-generalize-complex-numbers-and-quaternions)). The
> spinor's "rotate $360°$ and you're not back yet, you need $720°$" mystery
> is just: the rotor $R$ and $-R$ give the *same* rotation (sandwiches are
> quadratic in $R$), so the rotor lives in a double cover of the rotations.
> GA makes the half-angle *obvious* instead of magical: it's two
> reflections.

## 4. The sandwich product in garust

`garust` packages the sandwich $V x \tilde V$ as `.sandwich()` — the
universal way a versor (reflection, rotor, motor) acts on an object:

```rust
use garust::Vga3;
// A rotor R applied to a vector x is R x ~R, i.e. R.sandwich(&x):
let rotated = r.sandwich(&x);
```

It works for reflections (sandwich with a vector), rotations (sandwich
with a rotor), and — in later algebras — rigid motions (sandwich with a
**motor**, [Chapter 8](/garust/table-of-contents)). One operation,
`sandwich`, performs *every* orthogonal transformation in *every* algebra.
That uniformity — transformations are conjugation by versors — is one of
GA's great simplifications over the zoo of transformation matrices.

## 5. The rotor as an exponential

Products of vectors are awkward to build a rotation *to order* ("rotate
$30°$ about this axis"). The clean construction is the **exponential of a
bivector**. A unit bivector $B$ (a unit oriented plane, with $B^2 = -1$ in
Euclidean space) generates the rotor that rotates *in that plane* by angle
$\theta$:

$$
\boxed{\,R = e^{-\frac{\theta}{2} B}\,} \qquad (B^2 = -1).
$$

And because $B^2 = -1$, the exponential has a **closed form** — the same
Euler-style expansion that gives $e^{i\theta}=\cos\theta + i\sin\theta$:

$$
e^{\alpha B} = \cos\alpha + B\,\sin\alpha \quad (B^2=-1), \qquad
e^{\alpha B} = \cosh\alpha + B\,\sinh\alpha \quad (B^2=+1).
$$

The two cases (a $-1$ plane gives circular $\cos/\sin$ **rotations**; a
$+1$ plane gives hyperbolic $\cosh/\sinh$ **boosts** — which is *exactly*
how Lorentz boosts appear in the companion [Physics through GA](/physics-ga/)).
`garust`'s `exp` implements this closed form, which is why its `Scalar`
type splits off a `Real` trait supplying `sin`, `cos`, `sinh`, `cosh`,
`sqrt` ([Chapter 2](/garust/part-1-foundations/the-multivector)) — those
are the functions the bivector exponential needs.

## 6. A rotor, end to end, in garust

Here is the README's example — a real, tested rotation — read with
everything we now know:

```rust
use garust::Vga3;
use std::f64::consts::FRAC_PI_2;

// e23 is the unit bivector of the plane ⟂ the x-axis.
// Multiply by -θ/2 (θ = 90°) and exponentiate → the rotor for a 90° turn:
let r = (Vga3::basis(0b110) * (-FRAC_PI_2 / 2.0)).exp();   // R = exp(-(π/4) e23)

// Apply it with the sandwich R x ~R: it sends e2 → e3.
let rotated = r.sandwich(&Vga3::basis(2)).cleaned(1e-10);
assert!((rotated.coeffs[4] - 1.0).abs() < 1e-10);          // the e3 coefficient ≈ 1
```

Trace it: `basis(0b110)` is $e_{23}$ (index 6 — generators $e_2, e_3$), the
oriented plane perpendicular to the x-axis. Scaling by $-\theta/2 = -\pi/4$
and calling `exp` builds $R = e^{-\frac{\pi}{4}e_{23}} = \cos\frac{\pi}{4} -
e_{23}\sin\frac{\pi}{4}$, the rotor for a $90°$ turn in that plane.
`r.sandwich(&e2)` computes $R\,e_2\,\tilde R$ and out comes $e_3$
(`coeffs[4]` is the $e_3$ component). A rotation, built from a *plane* and
an *angle*, applied by a *sandwich* — no matrix, no axis-angle gymnastics.
(`cleaned` just zeroes floating-point dust.)

## 7. Rotors generalize complex numbers and quaternions

This is the unification [Chapter 1](/garust/part-1-foundations/why-garust)
promised, now concrete. The **even-grade** part of a GA (scalars +
bivectors + …) is closed under the geometric product and *is* where rotors
live:

- In **2D** ($Cl(2,0,0)$): even part = $\{a + b\,e_{12}\}$ with $e_{12}^2 =
  -1$ — the **complex numbers**. A 2D rotor is $e^{-\frac{\theta}{2}e_{12}}$
  — complex rotation, recovered.
- In **3D** ($Cl(3,0,0)$): even part = scalars + the three bivectors
  $\{e_{23}, e_{31}, e_{12}\}$, all squaring to $-1$ and multiplying like
  $i, j, k$ — the **quaternions**. A 3D rotor *is* a unit quaternion.

So complex numbers and quaternions aren't separate inventions for rotating
in 2D and 3D — they're the *even subalgebras* of GA, and the rotor
$e^{-\frac{\theta}{2}B}$ is the single construction behind both, valid in
**any** dimension (in 4D, 5D, spacetime — wherever you have a plane $B$).
You built the thing they're special cases of.

> :mathgoose: This is the moment GA pays for itself. Generations of
> students learned quaternions as a magic recipe — "$i, j, k$,
> $ijk = -1$, use them for 3D rotation, don't ask why." GA answers *why*:
> they're the even subalgebra of 3D space, $i,j,k$ are the three basis
> *bivectors* (oriented planes!), and the unit-quaternion rotation formula
> $q v q^{-1}$ is the rotor sandwich $R x \tilde R$. The half-angle is the
> double cover. And the *same* construction, with a different bivector,
> rotates in 2D (complex numbers), in 7D, or boosts in spacetime. One idea
> — exponentiate a bivector, sandwich with it — subsumes complex numbers,
> quaternions, rotation matrices, and Lorentz transformations.

## 8. Why rotors beat the alternatives

Concretely, for an engine, rotors dominate matrices and even quaternions:

- **Compose by multiplication**: to do $R_1$ then $R_2$, use the rotor
  $R_2 R_1$ — the geometric product, associative
  ([Chapter 3](/garust/part-1-foundations/the-geometric-product)). No
  matrix multiply, no order confusion.
- **No gimbal lock**: rotors never hit the singularities of Euler angles.
- **Cheap to renormalize**: numerical drift is fixed by rescaling to
  $|R| = 1$, not by re-orthonormalizing a matrix.
- **Interpolate smoothly**: $R(t) = e^{t\log R}$ gives constant-speed
  rotation (the "slerp" of graphics) — and `log`/`exp` are just the
  bivector $\leftrightarrow$ rotor bridge.
- **Any dimension, one code path**: the same `exp` + `sandwich` rotates in
  2D, 3D, or spacetime. `garust` has *one* implementation; the signature
  picks the geometry.

This is why GA is winning in graphics, robotics, and physics engines: the
rotor is simply a better rotation primitive, and it's the *same* primitive
everywhere.

## 9. Part I, complete

You've built the algebraic core of `garust` and, with it, the heart of
Geometric Algebra:

- **Multivectors** ([Ch 2](/garust/part-1-foundations/the-multivector)) —
  the one object, blades indexed by bitmask, signature in the type.
- The **geometric product** ([Ch 3](/garust/part-1-foundations/the-geometric-product))
  — one rule, invertible, computed by XOR + sign + metric.
- **Wedge and inner** ([Ch 4](/garust/part-1-foundations/wedge-inner-and-the-identity))
  — $ab = a\cdot b + a\wedge b$, oriented area, norms.
- **Reflections and rotors** — motion as sandwiching by versors; the rotor
  $e^{-\frac{\theta}{2}B}$ generalizing complex numbers and quaternions to
  any dimension.

That's a complete, working GA engine for Euclidean space — enough to
rotate anything, in any dimension, with no matrices. From here the book
*expands the algebra*: Part II adds a null generator for Projective GA,
where **translations** also become sandwiches and rigid motions become
**motors**; Part III opens the wider algebras (conformal, spacetime); Part
IV digs into the engine's design. The **physics** built on all this —
angular velocity as a bivector, the EM field, spacetime dynamics — is the
companion **[Physics through GA](/physics-ga/)**. But the engine you now
understand — multivector, geometric product, rotor — is the foundation all
of it stands on.

> :weightliftinggoose: Part I lands here: **motion = sandwiching by
> versors.** Reflect with a vector ($-n x n^{-1}$); compose two reflections
> into a **rotation**; build rotations to order with the **rotor**
> $R = e^{-\frac{\theta}{2}B}$ — a plane $B$ and an angle — applied by
> $R x \tilde R$ (`r.sandwich(&x)`). Burn in that rotors **generalize
> complex numbers (2D) and quaternions (3D)** as even subalgebras, compose
> by multiplication, dodge gimbal lock, and work in any dimension from one
> `exp`. Run the README rotor example and watch $e_2 \to e_3$. You now have
> a real GA engine — and Part II turns it into geometry and motion you can
> simulate.

## What we covered

- The **involutions** — **reverse** $\tilde M$ ($(-1)^{k(k-1)/2}$ per
  grade), grade involution, Clifford conjugation — with the reverse driving
  norms and the sandwich.
- A **reflection** in the hyperplane with unit normal $n$ is the sandwich
  $x' = -n x n$ (general: $-n x n^{-1}$), using the vector inverse.
- **Two reflections compose into a rotation** (Cartan–Dieudonné); the
  product of two unit vectors is a **rotor** $R$ acting by the **sandwich**
  $R x \tilde R$ — and "twice the mirror angle" is the **double cover**
  (the half-angle everywhere).
- `garust`'s **`.sandwich()`** applies any versor — one operation for every
  orthogonal transformation in every algebra.
- The **rotor** is the **exponential of a bivector**,
  $R = e^{-\frac{\theta}{2}B}$, with the closed form $e^{\alpha B} =
  \cos\alpha + B\sin\alpha$ ($B^2=-1$) / $\cosh+\sinh$ ($B^2=+1$, boosts) —
  `garust`'s **`exp`** (hence the `Real` trait's `sin`/`cos`/`sinh`/`cosh`).
- Rotors are the **even subalgebra**: **complex numbers** (2D) and
  **quaternions** (3D) are special cases; rotors **compose by
  multiplication**, avoid **gimbal lock**, interpolate, and work in **any
  dimension**.

## What's next

That's Part I — `garust`'s Euclidean core. [Part II](/garust/table-of-contents)
expands the engine into **geometry and motion**: duality and the **meet**,
**Projective GA** ($Cl(3,0,1)$, where points, lines, and planes are all
multivectors and *translations* join rotations), and **motors** — rigid-body
motions as screws. Then [Part III](/garust/table-of-contents) widens the
algebra to **conformal** and **spacetime** GA, and
[Part IV](/garust/table-of-contents) opens the engine's design. The
**physics** — rotational dynamics, with angular velocity finally allowed to
be the **bivector** it always was — is the companion
**[Physics through GA](/physics-ga/)**.
