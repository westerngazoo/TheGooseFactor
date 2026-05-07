---
sidebar_position: 2
title: "The Sandwich Product — Two Reflections Make a Rotation"
---

# The Sandwich Product — Two Reflections Make a Rotation

We've already seen reflections as $\mathbf{a} \mapsto -\mathbf{n}\mathbf{a}\mathbf{n}$.
What happens when we compose two reflections, across two different
hyperplanes? **A rotation.** The angle of the rotation is twice the
angle between the planes, and the plane of the rotation is the
plane spanned by the two reflection normals.

That's the geometric content. The algebra makes it crisp.

## Composing Two Reflections

Reflect $\mathbf{a}$ first across the plane perpendicular to
$\mathbf{n}$, then across the plane perpendicular to $\mathbf{m}$
(both unit vectors):

$$\mathbf{a}' = -\mathbf{m}\,(-\mathbf{n}\,\mathbf{a}\,\mathbf{n})\,\mathbf{m} = \mathbf{m}\,\mathbf{n}\,\mathbf{a}\,\mathbf{n}\,\mathbf{m}$$

Group the multiplications:

$$\mathbf{a}' = (\mathbf{m}\mathbf{n})\,\mathbf{a}\,(\mathbf{n}\mathbf{m})$$

Define $R = \mathbf{m}\mathbf{n}$. Then $\mathbf{n}\mathbf{m} = \tilde{R}$
(the reverse — flipping the order of the factors). So:

$$\mathbf{a}' = R\,\mathbf{a}\,\tilde{R}$$

That object $R = \mathbf{mn}$ — the geometric product of two unit
vectors — is a **rotor**.

> :happygoose: A rotation is two reflections. Not "is implemented
> as." Not "can be simulated by." A rotation **is** two reflections
> composed. That's not a metaphor, that's the algebra.

## What Is a Rotor?

The geometric product of two unit vectors expands as

$$\mathbf{m}\mathbf{n} = \mathbf{m}\cdot\mathbf{n} + \mathbf{m}\wedge\mathbf{n}$$

a scalar plus a bivector. Both unit vectors give magnitude 1, so:

$$\mathbf{m}\cdot\mathbf{n} = \cos\theta, \qquad \mathbf{m}\wedge\mathbf{n} = \sin\theta\,\hat{\mathbf{B}}$$

where $\theta$ is the angle between $\mathbf{m}$ and $\mathbf{n}$,
and $\hat{\mathbf{B}}$ is the **unit bivector** of the plane they
span. So:

$$R = \cos\theta + \sin\theta\,\hat{\mathbf{B}}$$

That's the rotor. Scalar + bivector, exactly like complex
$\cos + i \sin$ — only with a real geometric bivector instead of a
mystical $i$.

## The Rotation Angle Is Doubled

A subtle but crucial point. The rotor $R = \mathbf{mn}$ formed from
two unit vectors at angle $\theta$ produces a rotation by angle
$2\theta$.

Why? Because two reflections across planes meeting at angle $\theta$
rotate by $2\theta$. (Hold up your two hands like wedge planes; trace
a vector; it ends up rotated by twice the angle between your hands.)

So if you want a rotation by angle $\phi$ in the plane $\hat{\mathbf{B}}$:

$$R = \cos\frac{\phi}{2} + \sin\frac{\phi}{2}\,\hat{\mathbf{B}}$$

The half-angles are not a quirk of quaternions. They come from the
two-reflections-make-a-rotation theorem.

> :surprisedgoose: The half-angle in quaternions has been mystery
> for engineers for 200 years. Once you see it as "two reflections,
> each contributing half the rotation," it's obvious. Half the
> framework's apparent magic is just GA hiding in plain sight.

## The Exponential Form

For a unit bivector $\hat{\mathbf{B}}$ with $\hat{\mathbf{B}}^2 = -1$:

$$\exp(\theta\,\hat{\mathbf{B}}) = \cos\theta + \sin\theta\,\hat{\mathbf{B}}$$

Same formula as $\exp(i\theta) = \cos\theta + i\sin\theta$ in complex
analysis, only with a real bivector. The Taylor series works
identically because $\hat{\mathbf{B}}^2 = -1$.

So the rotor for an angle-$\phi$ rotation in plane $\hat{\mathbf{B}}$:

$$R = \exp\!\left(\frac{\phi}{2}\,\hat{\mathbf{B}}\right) = \cos\frac{\phi}{2} + \sin\frac{\phi}{2}\,\hat{\mathbf{B}}$$

To rotate a vector $\mathbf{a}$ by $\phi$ in plane $\hat{\mathbf{B}}$:

$$\mathbf{a}' = R\,\mathbf{a}\,\tilde{R} = e^{\phi\hat{\mathbf{B}}/2}\,\mathbf{a}\,e^{-\phi\hat{\mathbf{B}}/2}$$

> :happygoose: Look at this. The notation tells the truth.
> $e^{\phi\mathbf{B}/2}$ is the exponential of a bivector — the
> bivector *generates* the rotation, like in Lie algebra. The
> bivector $\hat{\mathbf{B}}$ is the *plane* — directly meaningful.
> Compare to the Euler-angle approach where the angles have no
> standalone meaning.

## The Reverse — and Why $R\tilde{R} = 1$

$\tilde{R}$ flips the order of the basis-blade factors:

$$R = \cos\theta + \sin\theta\,\hat{\mathbf{B}} \implies \tilde{R} = \cos\theta - \sin\theta\,\hat{\mathbf{B}}$$

(For a bivector, reversing flips the sign because $\hat{\mathbf{B}} = \mathbf{e}_i\mathbf{e}_j$
becomes $\mathbf{e}_j\mathbf{e}_i = -\mathbf{e}_i\mathbf{e}_j = -\hat{\mathbf{B}}$.)

Compute $R\tilde{R}$:

$$R\tilde{R} = (\cos\theta + \sin\theta\,\hat{\mathbf{B}})(\cos\theta - \sin\theta\,\hat{\mathbf{B}}) = \cos^2\theta - \sin^2\theta\,\hat{\mathbf{B}}^2$$

Since $\hat{\mathbf{B}}^2 = -1$ for a unit bivector in a positive-definite
space:

$$R\tilde{R} = \cos^2\theta + \sin^2\theta = 1 ✓$$

So unit rotors satisfy $R\tilde R = 1$. This makes inverting trivial:
$R^{-1} = \tilde R$. To rotate the other direction, just reverse.

> :weightliftinggoose: $R^{-1} = \tilde{R}$ is the cleanest fact in
> rotational algebra. No matrix transpose, no quaternion
> conjugation gymnastics. Reverse the order of the basis blades.
> Done.

## Putting the Sandwich Together — the Recipe

To rotate a vector $\mathbf{a}$ by angle $\phi$ in the plane spanned
by unit bivector $\hat{\mathbf{B}}$:

1. Build the rotor: $R = \cos(\phi/2) + \sin(\phi/2)\,\hat{\mathbf{B}}$.
2. Compute the sandwich: $\mathbf{a}' = R\,\mathbf{a}\,\tilde{R}$.

Three multiplications. No matrices, no quaternions, no special
cases for parallel vectors. Works in 2D, 3D, $n$D.

> :sarcasticgoose: That's the whole rotation API. 200 years of
> rotation tooling reduced to two lines. The implementation is a
> few dozen lines of basis-blade arithmetic, depending on
> dimension. We've been doing extra work since 1843.

## Composing Rotations

Two rotations $R_1$ then $R_2$:

$$\mathbf{a}'' = R_2(R_1\,\mathbf{a}\,\tilde{R}_1)\tilde{R}_2 = (R_2 R_1)\,\mathbf{a}\,(\tilde{R}_1 \tilde{R}_2) = (R_2 R_1)\,\mathbf{a}\,\widetilde{R_2 R_1}$$

So composition is rotor multiplication. Just like matrix or
quaternion composition — only cheaper, since rotors have fewer
components.

## The Sandwich Pattern Generalizes

The sandwich $X \mapsto R X \tilde R$ rotates **any** multivector,
not just vectors:

- Sandwich a bivector with a rotor → bivector rotates.
- Sandwich a trivector → trivector rotates.
- Sandwich a mixed multivector → each grade rotates as expected.

This is what "rotor acts on the whole algebra" means. There's no
"how do I rotate a plane?" question — sandwich it.

> :happygoose: One operation, $R X \tilde R$, rotates everything.
> Vectors, planes, volumes, mixed multivectors — all rotate by the
> same formula. Compare to LA where rotating a "plane" requires
> first picking a representation (basis vectors, normal vector,
> homogeneous coords) and then choosing how to rotate it. We just
> sandwich.

Next chapter looks at rotors in 2D and 3D specifically — and shows
exactly how complex numbers and quaternions slot into the rotor
framework as special cases of one general object.
