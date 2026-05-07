---
sidebar_position: 3
title: "Rotors in 2D and 3D"
---

# Rotors in 2D and 3D

We claimed that rotors in 2D *are* unit complex numbers and rotors
in 3D *are* unit quaternions. This chapter cashes the claim.

## Rotors in 2D

The 2D GA basis: $\{1, \mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_{12}\}$.
The pseudoscalar is $I = \mathbf{e}_{12}$, with $I^2 = -1$.

The **even subalgebra** — scalars and bivectors — has just two basis
elements: $\{1, \mathbf{e}_{12}\}$. Both real-valued coefficients.
Two basis elements, one squaring to $+1$ and one to $-1$.

That's the complex numbers. With $I = \mathbf{e}_{12}$ in the role
of $i$.

A 2D rotor is

$$R = \cos\frac{\phi}{2} + \sin\frac{\phi}{2}\,\mathbf{e}_{12}$$

which under the identification $\mathbf{e}_{12} \leftrightarrow i$ is

$$R = \cos\frac{\phi}{2} + i\sin\frac{\phi}{2} = e^{i\phi/2}$$

A unit complex number. To rotate $\mathbf{a} = a_1 \mathbf{e}_1 + a_2 \mathbf{e}_2$:

$$\mathbf{a}' = R\,\mathbf{a}\,\tilde R = e^{i\phi/2}\,\mathbf{a}\,e^{-i\phi/2}$$

In the complex-number world, rotation is *one-sided* multiplication
$\mathbf{a}' = e^{i\phi}\mathbf{a}$. In GA, it's a *two-sided*
sandwich with half-angle exponentials. The formulas are equivalent
because in 2D, $\mathbf{e}_{12}$ anti-commutes with vectors —
moving the right factor past $\mathbf{a}$ flips its sign and
combines the two half-angles into one full angle.

> :happygoose: Complex numbers are 2D rotors. The "imaginary" $i$
> is the unit bivector $\mathbf{e}_{12}$ — a real geometric thing.
> Once you see it, you can never unsee it.

## Rotors in 3D

The 3D GA basis:
$\{1, \mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3, \mathbf{e}_{23}, \mathbf{e}_{13}, \mathbf{e}_{12}, \mathbf{e}_{123}\}$.
Eight elements.

The even subalgebra — scalars and bivectors — has four basis
elements: $\{1, \mathbf{e}_{23}, \mathbf{e}_{13}, \mathbf{e}_{12}\}$.

That's quaternions. With:

| GA basis | Quaternion |
|---|---|
| $1$ | $1$ |
| $-\mathbf{e}_{23}$ | $i$ |
| $-\mathbf{e}_{13}$ | $j$ ... wait |
| $-\mathbf{e}_{12}$ | $k$ |

The correspondence (with sign conventions) is

$$i \leftrightarrow -\mathbf{e}_{23}, \qquad j \leftrightarrow \mathbf{e}_{13}, \qquad k \leftrightarrow -\mathbf{e}_{12}$$

The exact signs depend on the source's conventions; the *isomorphism*
of even subalgebras is the structural point. Verify that the
multiplication rules match:

$$i^2 = (-\mathbf{e}_{23})^2 = \mathbf{e}_{23}\mathbf{e}_{23} = -\mathbf{e}_2\mathbf{e}_3\mathbf{e}_2\mathbf{e}_3 = \mathbf{e}_2\mathbf{e}_2\mathbf{e}_3\mathbf{e}_3 \cdot (-1) = -1 ✓$$

(I used $\mathbf{e}_3\mathbf{e}_2 = -\mathbf{e}_2\mathbf{e}_3$.)

Similarly for $j^2$ and $k^2$. And the cross relation:

$$ij = (-\mathbf{e}_{23})(\mathbf{e}_{13}) = -\mathbf{e}_{23}\mathbf{e}_{13} = -\mathbf{e}_{12} = k ✓$$

So Hamilton's $i, j, k$ basis is, modulo signs, just the bivector
basis of 3D GA.

> :surprisedgoose: $i^2 = j^2 = k^2 = ijk = -1$. Hamilton wrote that
> on a bridge in 1843. He didn't know about Clifford's framework
> (it didn't exist yet — Clifford published in 1878). He
> rediscovered the even subalgebra of 3D GA from scratch by sheer
> mathematical instinct.

A 3D rotor:

$$R = \cos\frac{\phi}{2} + \sin\frac{\phi}{2}\,\hat{\mathbf{B}}$$

where $\hat{\mathbf{B}}$ is the unit bivector of the rotation
plane. Expanding $\hat{\mathbf{B}} = b_{12}\mathbf{e}_{12} + b_{13}\mathbf{e}_{13} + b_{23}\mathbf{e}_{23}$
(unit-normalized) gives a four-component object — exactly a unit
quaternion.

To rotate $\mathbf{a}$:

$$\mathbf{a}' = R\,\mathbf{a}\,\tilde R$$

— exactly the quaternion sandwich rotation, with the sign-corrected
basis identification.

## The "Plane of Rotation" — What Quaternions Hide

In 3D, rotations are commonly described by an **axis-angle**
representation: rotate by $\phi$ around axis $\hat{\mathbf{n}}$.
Quaternions encode this as $q = \cos(\phi/2) + \sin(\phi/2)(\hat{n}_x i + \hat{n}_y j + \hat{n}_z k)$.

But the axis $\hat{\mathbf{n}}$ is a 3D-only convenience. What's
actually happening is that the rotation has a **plane**, and the
axis is the normal to that plane (the dual). The axis representation
fails in 4D because there's no unique perpendicular direction to a
plane.

In GA, you specify the **plane** $\hat{\mathbf{B}}$ directly — and
this works in any dimension. The 3D axis is only a shadow of the
underlying bivector.

> :angrygoose: "Rotate around the X axis" was always a half-truth.
> You're not rotating around a line — you're rotating *in* a plane.
> The line is only there because 3D has a unique perpendicular to
> every plane. Move to 4D and the line trick stops working. The
> plane was always the real object.

## Beyond 3D: Rotor Generalization

In 4D, there are six independent bivector basis elements
($\binom{4}{2}$). A 4D rotor has $1 + 6 = 7$ components, with the
unit constraint shaving one off — six free parameters, matching
$\dim SO(4) = 6$.

In 4D, two-plane rotations exist (rotations that fix no axis at
all — a rotation in the $\mathbf{e}_{12}$ plane and the $\mathbf{e}_{34}$
plane simultaneously). Quaternions can't express these. Rotors can:
$R = \exp(\theta_1 \mathbf{e}_{12}/2 + \theta_2 \mathbf{e}_{34}/2)$.

5D, 6D, $n$D: rotors keep working. $\binom{n}{2}$ bivector basis,
unit-magnitude constraint, sandwich product. Done.

> :weightliftinggoose: Read this back to yourself: the *same*
> framework works in every dimension. The same sandwich. The same
> exponential of a bivector. Drop into any dimension you need.

## A Concrete 3D Example

Rotate $\mathbf{a} = \mathbf{e}_1$ by $90°$ in the $\mathbf{e}_{12}$
plane (so $\hat{\mathbf{B}} = \mathbf{e}_{12}$, $\phi = \pi/2$).

Build the rotor:

$$R = \cos\frac{\pi}{4} + \sin\frac{\pi}{4}\,\mathbf{e}_{12} = \frac{1}{\sqrt 2}(1 + \mathbf{e}_{12})$$

Reverse:

$$\tilde R = \frac{1}{\sqrt 2}(1 - \mathbf{e}_{12})$$

Compute $R\,\mathbf{e}_1$:

$$R\,\mathbf{e}_1 = \frac{1}{\sqrt 2}(\mathbf{e}_1 + \mathbf{e}_{12}\mathbf{e}_1) = \frac{1}{\sqrt 2}(\mathbf{e}_1 - \mathbf{e}_2)$$

(using $\mathbf{e}_{12}\mathbf{e}_1 = -\mathbf{e}_2$.)

Now sandwich:

$$\mathbf{a}' = \frac{1}{\sqrt 2}(\mathbf{e}_1 - \mathbf{e}_2) \cdot \frac{1}{\sqrt 2}(1 - \mathbf{e}_{12})$$

$$= \frac{1}{2}\big(\mathbf{e}_1 - \mathbf{e}_1 \mathbf{e}_{12} - \mathbf{e}_2 + \mathbf{e}_2 \mathbf{e}_{12}\big)$$

$$= \frac{1}{2}\big(\mathbf{e}_1 - \mathbf{e}_2 - \mathbf{e}_2 - \mathbf{e}_1\big) = -\mathbf{e}_2 ?$$

Let me recompute carefully. $\mathbf{e}_1\mathbf{e}_{12} = \mathbf{e}_1\mathbf{e}_1\mathbf{e}_2 = \mathbf{e}_2$
and $\mathbf{e}_2\mathbf{e}_{12} = \mathbf{e}_2\mathbf{e}_1\mathbf{e}_2 = -\mathbf{e}_1$.

$$\mathbf{a}' = \tfrac{1}{2}\big(\mathbf{e}_1 - \mathbf{e}_2 - \mathbf{e}_2 - \mathbf{e}_1\big) = -\mathbf{e}_2$$

Hmm — that's a $-90°$ rotation. Sign convention: rotating
$\mathbf{e}_1$ by the $\mathbf{e}_{12}$ rotor gives $-\mathbf{e}_2$
because the rotor rotates *with* the bivector orientation, and our
choice of $\mathbf{e}_{12}$ vs $\mathbf{e}_{21}$ is what fixes the
sense.

> :sharpgoose: Sign conventions in GA: $\mathbf{e}_{12}$ vs
> $\mathbf{e}_{21}$ flips the orientation of the plane, and that
> flips the rotation direction. If you want $\mathbf{e}_1 \to
> \mathbf{e}_2$ (counter-clockwise), use $-\mathbf{e}_{12}$ in the
> exponent or take $\phi$ negative. **Convention discipline is the
> tax for using the framework.**

## What's Next

The next chapter covers **composing and interpolating** rotors —
how to chain rotations, how to do SLERP without quaternion-specific
formulas, and how Lie-algebra-style $\log$ and $\exp$ on the rotor
manifold give you smooth interpolation in any dimension.
