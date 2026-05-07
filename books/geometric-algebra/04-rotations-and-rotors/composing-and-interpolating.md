---
sidebar_position: 4
title: "Composing & Interpolating Rotors"
---

# Composing & Interpolating Rotors

Two more rotor essentials: how to chain multiple rotations, and how
to interpolate between two rotor poses smoothly. Both come almost
for free from the algebra.

## Composition: Just Multiply

To rotate by $R_1$ first and then $R_2$:

$$\mathbf{a}'' = R_2(R_1\,\mathbf{a}\,\tilde R_1)\tilde R_2$$

Group the rotors:

$$\mathbf{a}'' = (R_2 R_1)\,\mathbf{a}\,(\tilde R_1 \tilde R_2) = (R_2 R_1)\,\mathbf{a}\,\widetilde{R_2 R_1}$$

So composing two rotations is just multiplying their rotors:
$R_\text{combined} = R_2 R_1$. The reverse of the product is the
product of reverses in reverse order.

> :nerdygoose: $\widetilde{AB} = \tilde B \tilde A$ — the reversal
> identity. Same as transpose for matrices, conjugation for
> quaternions, and the dagger for unitary operators in QM. Different
> name, same algebraic structure.

### Non-commutativity

In general $R_2 R_1 \ne R_1 R_2$. Rotor multiplication is **not
commutative**, just like matrix and quaternion multiplication
aren't. This corresponds to the geometric fact that rotation order
matters: yaw-then-pitch is not the same as pitch-then-yaw.

The exception is when the two rotations share a plane of rotation.
Then they commute, and the composition is just the angle sum.

## Inverse: Just Reverse

We saw that $R\tilde R = 1$ for unit rotors, so $R^{-1} = \tilde R$.
To undo a rotation, sandwich with $\tilde R$ on the left and $R$ on
the right.

$$\mathbf{a} = \tilde R\,\mathbf{a}'\,R$$

That's the inverse rotation. Cheap as composition.

## Logarithm: Rotor → Bivector

Every rotor can be written as the exponential of a bivector:

$$R = \exp(\mathbf{B}/2)$$

For a unit rotor $R = \cos(\phi/2) + \sin(\phi/2)\hat{\mathbf{B}}$,
the logarithm is

$$\log R = \frac{\phi}{2}\,\hat{\mathbf{B}} = \frac{\mathbf{B}}{2}$$

The half-bivector that, exponentiated, recovers the rotor.

In 3D, the logarithm of a quaternion $q = a + b i + c j + d k$ is
similarly a 3-vector imaginary part. Both are special cases of the
GA logarithm.

> :happygoose: Bivectors are the **Lie algebra** of the rotor group.
> The exponential map sends bivectors (an additive group under
> wedge sum, kind of) to rotors (a multiplicative group). This is
> exactly the relationship between $\mathfrak{so}(n)$ and $SO(n)$
> in differential geometry. GA makes this concrete instead of
> abstract.

## SLERP — Spherical Linear Interpolation

To interpolate between rotors $R_0$ and $R_1$ smoothly along the
shortest path on the rotor manifold:

1. Compute the **relative rotor**: $R_\Delta = R_1 \tilde R_0$.
2. Take the logarithm: $\mathbf{B}_\Delta = \log R_\Delta$.
3. Build the interpolated rotor: $R(t) = \exp(t\,\mathbf{B}_\Delta)\,R_0$ for $t \in [0, 1]$.

This is **SLERP**. Quaternion SLERP is exactly this formula
restricted to 3D rotors.

In 3D, the standard quaternion SLERP formula is

$$\text{slerp}(q_0, q_1, t) = \frac{\sin((1-t)\Omega)}{\sin\Omega}\,q_0 + \frac{\sin(t\Omega)}{\sin\Omega}\,q_1$$

where $\Omega$ is the angle between $q_0$ and $q_1$ on the unit
3-sphere. The exponential form above gives the same result, but
generalizes to any dimension's rotor manifold without rewriting the
formula.

> :surprisedgoose: SLERP is "interpolate the bivector linearly,
> then exponentiate." Linear-in-the-Lie-algebra, exponentiate-to-the-group.
> That's the universal pattern for smooth motion on Lie groups.
> Quaternion SLERP is one shadow of that pattern.

## Composing Rotations from a Sequence

Common scenario: a robot arm has joints $J_1, J_2, \ldots, J_n$,
each with its own bivector axis $\mathbf{B}_i$ and angle $\phi_i$.
The end-effector orientation:

$$R_\text{end} = \exp(\phi_n \mathbf{B}_n / 2) \cdots \exp(\phi_2 \mathbf{B}_2 / 2)\exp(\phi_1 \mathbf{B}_1 / 2)$$

Multiply rotors in order. To rotate a tool-frame vector to world
frame: sandwich with $R_\text{end}$. To go the other way: sandwich
with $\tilde R_\text{end}$.

In quaternion-based robotics, this works the same way but is
restricted to 3D. In rotor-based robotics, it works in any
dimensional configuration space — useful for higher-dimensional
parameter spaces in optimization.

## Computational Notes

A 3D rotor has 4 floats (one scalar + three bivector components).
Multiplying two rotors costs about as much as multiplying two
quaternions — ~16 multiplies and ~12 adds. Cheaper than 3×3 matrix
multiplication (27 mul, 18 add).

Sandwiching a vector with a rotor — $R \mathbf{a} \tilde R$ — costs
about 18 mul + 12 add. About the same as quaternion sandwich,
slightly less than matrix-vector multiply (9 mul + 6 add for a 3×3
matrix), but no orthogonalization step needed.

> :sharpgoose: For a single rotation of one vector, a precomputed
> rotation matrix is the fastest. The rotor wins when you compose
> many rotations (no drift), interpolate (clean SLERP), or work in
> dimensions where matrices balloon.

## What Section 4 Gave You

Four chapters:

1. Why rotors beat matrices, Euler angles, and quaternions.
2. The sandwich product and how two reflections compose to a
   rotation.
3. Rotors as the even subalgebra — complex numbers in 2D,
   quaternions in 3D, generalizing to any dimension.
4. Composition and SLERP-style interpolation.

You can now rotate, compose, invert, and interpolate. That's the
working orientation algebra. The next section turns to **applications**
— graphics, physics, and a peek at conformal GA where points and
spheres become first-class blades.

> :weightliftinggoose: From here on, when you read research papers
> in graphics, robotics, or theoretical physics that use
> "spinors," "Clifford algebras," "Pauli matrices," or "Lie
> algebras of rotation," you'll recognize the same machinery in
> different costumes. Section 4 is the unifier.
