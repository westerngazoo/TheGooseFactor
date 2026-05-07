---
sidebar_position: 1
title: "Why Rotors Beat Matrices and Quaternions"
---

# Why Rotors Beat Matrices and Quaternions

Rotations are GA's headline application. The same operation —
"rotate this vector by some angle in some plane" — has been
implemented as rotation matrices, Euler angles, axis-angle pairs,
and quaternions. GA replaces all of them with **rotors**, which
are simpler, more general, and avoid the failure modes of every
prior approach.

## A Tour of the Failure Modes

### Rotation matrices

A 3D rotation matrix is a 3×3 real-valued thing with the property
$R^T R = I$ and $\det R = 1$. To compose two rotations: multiply
matrices. To rotate a vector: matrix-vector product.

**Problems:**
- 9 numbers to represent 3 degrees of freedom. Redundant.
- Numerical drift — composed matrices stop being exactly orthogonal,
  must be re-orthogonalized periodically.
- Doesn't generalize cleanly to higher dimensions (you keep storing
  bigger matrices).
- Doesn't tell you anything about the *plane* of rotation
  algebraically.

> :angrygoose: 9 numbers for 3 DOF. We accepted this for decades.

### Euler angles

Three angles: yaw, pitch, roll. Compose by multiplying matrices in
some convention.

**Problems:**
- Gimbal lock. At $\pm 90°$ pitch, two of the three axes align and
  one DOF disappears. Famous from Apollo's IMU.
- Convention chaos. ZYX intrinsic? XYZ extrinsic? Roll-pitch-yaw or
  yaw-pitch-roll? Every game engine and aerospace shop chose
  differently.
- Interpolation is non-uniform.

### Quaternions

A quaternion is $q = a + b\,i + c\,j + d\,k$ with $i^2 = j^2 = k^2 = ijk = -1$.
Rotations are unit quaternions. Compose by multiplication; rotate
a vector by sandwich $\mathbf{v}' = q \mathbf{v} q^{-1}$.

**Strengths:**
- 4 numbers for 3 DOF (less redundancy).
- No gimbal lock.
- Smooth interpolation via SLERP.
- Composes cleanly.

**Problems:**
- Where do $i, j, k$ come from? Hamilton's discovery is a hack —
  three "imaginary units" that anti-commute. Why three? Why
  anti-commute? Mystery.
- Only works in 3D. There are no "5-dimensional quaternions."
- The sandwich form $q \mathbf{v} q^{-1}$ requires special pleading
  about how to multiply a quaternion by a 3-vector.

## Rotors — The Successor

A **rotor** is an even-grade multivector $R$ in any GA, with the
property $R \tilde R = 1$ (where $\tilde R$ is the reverse).
Rotors form a multiplicative group. They rotate any multivector by
the sandwich:

$$X' = R\,X\,\tilde R$$

That's it. One sandwich. Works on vectors, bivectors, blades — any
grade. Works in any dimension.

In 2D, rotors are scalar + bivector elements, $R = \alpha + \beta \mathbf{e}_{12}$.
The condition $R\tilde R = 1$ gives $\alpha^2 + \beta^2 = 1$ — the
unit circle. Rotors in 2D are *exactly* the unit complex numbers,
written in the GA basis.

In 3D, rotors are scalar + bivector elements,
$R = \alpha + \beta_{12} \mathbf{e}_{12} + \beta_{13} \mathbf{e}_{13} + \beta_{23} \mathbf{e}_{23}$.
The unit-magnitude condition gives a 3-sphere in 4D — the same
shape as the unit quaternions. **Rotors in 3D are quaternions** —
literally, with the bivector basis taking the place of $i, j, k$.

> :surprisedgoose: Quaternions weren't a strange algebraic
> coincidence. They were geometric algebra's even subalgebra in 3D,
> rediscovered by Hamilton 50 years before Clifford pulled the
> general framework out. Hamilton was looking at one corner of the
> right object.

## Why Rotors Win

Compared to matrices:
- **Compact.** $1 + \binom{n}{2}$ numbers (scalar + bivector
  components), versus $n^2$ for a matrix.
- **No drift.** $R\tilde R = 1$ is one constraint to enforce, not
  $n(n+1)/2$.
- **Composes by multiplication.** Same as matrices, but cheaper.

Compared to quaternions:
- **Same in 3D**, but rotors *generalize*. There are 4D rotors,
  5D rotors, 26D rotors. The framework doesn't care.
- **The bivector $\mathbf{B}$ is the plane of rotation**, with
  algebraic meaning — not a magic $i, j, k$ basis.
- **Rotates anything** — vectors, bivectors, full multivectors —
  with the same sandwich. Quaternions only rotate 3-vectors.

Compared to Euler angles:
- **No gimbal lock.** The bivector basis is full-rank, even when
  Euler-angle basis "collapses."
- **Continuous parameterization.** SLERP works directly on rotors.

> :weightliftinggoose: Rotors subsume all the old tools. Once you
> use rotors, you stop reaching for matrices, quaternions, and
> Euler angles. They're not wrong — just unnecessary.

## What's Next

The next chapter shows the **sandwich product** mechanics — why
two reflections compose to a rotation, and why that gives you the
rotor formula directly. Then we look at rotors in 2D (the complex
numbers in disguise) and 3D (the quaternions in disguise) and
verify the equivalences.
