---
sidebar_position: 3
title: "Robotics and Conformal GA"
---

# Robotics and Conformal GA

Robotics needs a unified framework for **rigid motions** — rotation
plus translation — and for representing geometric primitives like
points, lines, planes, and spheres. Standard 3D GA covers
rotations natively, but translations are awkward and points have
no first-class blade representation.

**Conformal Geometric Algebra (CGA)** fixes this. It's a 5D
algebra over a 3D Euclidean space, with two extra basis vectors
that encode **infinity** and **origin**. In CGA:

- A **point** in space is a vector (a 1-blade) in the 5D algebra.
- A **line** is a 3-blade.
- A **plane** is a 4-blade.
- A **sphere** is a 4-blade.
- **Translations** become rotors.
- **Rotations** become rotors.
- **Rigid motions** (translation + rotation) are products of these
  rotors.

Everything is a sandwich. Same machinery; richer object zoo.

## The 5D Setup

Take 3D Euclidean space with basis $\mathbf{e}_1, \mathbf{e}_2, \mathbf{e}_3$.
Add two extra basis vectors:

- $\mathbf{e}_+$ with $\mathbf{e}_+^2 = +1$
- $\mathbf{e}_-$ with $\mathbf{e}_-^2 = -1$

Define **null vectors** that mix the extras:

- $\mathbf{n}_\infty = \mathbf{e}_- + \mathbf{e}_+$ (squares to zero, represents "infinity")
- $\mathbf{n}_o = \tfrac{1}{2}(\mathbf{e}_- - \mathbf{e}_+)$ (squares to zero, represents "origin")

with the inner-product property $\mathbf{n}_\infty \cdot \mathbf{n}_o = -1$.

A point $\mathbf{p}$ in 3D Euclidean space is encoded as a 5D
vector:

$$P = \mathbf{n}_o + \mathbf{p} + \tfrac{1}{2}\mathbf{p}^2\,\mathbf{n}_\infty$$

This is a **null** vector ($P^2 = 0$). Every point in Euclidean
space is one of these null vectors.

> :surprisedgoose: Points become null vectors in a 5D algebra. The
> distance between two points $P, Q$ is $-2 P \cdot Q$. Concentric
> spheres are points with different "weights." There's a real
> geometric story here, and it's much more than a notational
> trick.

## Translations as Rotors

The translator that moves the world by vector $\mathbf{t}$:

$$T_\mathbf{t} = 1 - \tfrac{1}{2}\mathbf{t}\,\mathbf{n}_\infty$$

Sandwich a point with this rotor:

$$P' = T_\mathbf{t}\,P\,\tilde T_\mathbf{t}$$

and you get the point at $\mathbf{p} + \mathbf{t}$. Translation
becomes a sandwich, just like rotation.

> :happygoose: Translations are rotors. **Translations are
> rotors.** In standard 3D GA you can't do this — you need affine
> coordinates or homogeneous coordinates or quaternion+vector
> pairs. CGA gives you one rotor type for both rotation and
> translation, composing freely.

## Rigid Motions

A rigid motion (rotation $R$ followed by translation $\mathbf{t}$)
is the composed rotor:

$$M = T_\mathbf{t}\,R$$

To apply: $P' = M\,P\,\tilde M$. To compose two rigid motions:
multiply their rotors. To invert: reverse.

This is the **screw motion** or **motor** in older robotics
literature. CGA realizes screws as rotors, with composition and
interpolation built in.

## Spheres and Planes as Blades

The sphere of radius $r$ centered at $\mathbf{p}$:

$$S = P - \tfrac{1}{2}r^2\,\mathbf{n}_\infty$$

A 1-blade. Spheres are points-with-radius. (And points are spheres
of radius zero.)

A plane with normal $\mathbf{n}$ at offset $d$:

$$\Pi = \mathbf{n} + d\,\mathbf{n}_\infty$$

Also a vector — a 1-blade, just one not-at-origin.

A line is a 2-blade, a circle is a 2-blade, etc. All Euclidean
primitives become blades in the right grade.

## Geometric Tests Become Inner Products

The inner product $A \cdot B$ in CGA encodes a lot:

| Test | Algebraic form |
|---|---|
| Point on sphere? | $P \cdot S = 0$ |
| Point on plane? | $P \cdot \Pi = 0$ |
| Point on line? | $P \cdot L = 0$ |
| Point on circle? | $P \cdot C = 0$ |
| Distance from point to sphere center? | $P \cdot S = -\tfrac{1}{2}(d^2 - r^2)$ |

The same dot product handles "is this point on this sphere" and
"is this point in this plane" — algebraic uniformity across
geometric primitives.

> :weightliftinggoose: Computational geometry — convex hulls, mesh
> intersections, ray tracing — has been a forest of special cases
> for decades. CGA gives one product, applied across all the
> primitive types. The tests collapse to "is this dot zero?" and
> the algebra handles the rest.

## Robotics: Forward and Inverse Kinematics

For a robotic arm with $n$ joints, each joint has a screw motor
$M_i$ — a rotor encoding the joint axis (a bivector) and angle.
The end-effector pose is:

$$M_\text{end} = M_n M_{n-1} \cdots M_1$$

Forward kinematics: given joint angles, compute $M_\text{end}$.
Multiplication.

Inverse kinematics: given a desired pose, find joint angles. With
CGA, this becomes optimization on the rotor manifold — a Lie-group
optimization with bivectors as the tangent space. Smooth, robust,
no gimbal lock, no quaternion-to-matrix conversion overhead.

> :angrygoose: Standard robotics uses 4×4 homogeneous matrices and
> Denavit-Hartenberg conventions. The DH parameters are widely
> taught and widely complained about. CGA's screw-motor formulation
> is the same content with cleaner algebra. It hasn't displaced DH
> because of curricular inertia — every textbook teaches DH, every
> course exam expects it, every commercial robot arm ships with DH
> tables.

## Path Interpolation in CGA

Smooth motion in robotics often means interpolating both rotation
and translation simultaneously (e.g., a tool-tip following a
desired trajectory while orienting itself for the cut). With
matrices or quaternions, you interpolate rotation and translation
separately and hope they look smooth together.

In CGA, you interpolate the **motor** as a single rotor:

$$M(t) = \exp(t \cdot \log M)$$

— with $\log M$ a bivector-plus-translator combination.
Single-step Lie-algebra interpolation. The tool tip's path is
geodesic on the rigid-motion group.

## When You Use CGA — and When You Don't

CGA is overkill for pure rotation. Standard 3D GA (rotors only) is
faster and simpler if all you do is rotate.

CGA shines when:
- You compose rotations with translations frequently (robotics,
  rigid-body simulation, animation).
- You work with spheres and circles (collision detection, geometry
  processing).
- You want a uniform framework that includes points, planes, lines,
  spheres, and rigid motions.

Performance-wise, CGA computations have higher constant factors
than 3D GA (you're working in 5D so blades are larger), but the
asymptotic complexity is comparable.

> :weightliftinggoose: Pick your tools by what they do, not by
> what they could do. 3D GA for orientation. CGA for full rigid
> motion + spheres + lines. Standard tensors when the team
> already speaks tensors. Don't religious-war the choice.

## Closing

The applications section showed:

- **Graphics:** rotors replace quaternions and matrices for
  orientation; meet/join replaces special-cased intersections.
- **Physics:** Maxwell's four equations collapse to one;
  spinors and Pauli matrices are GA's even subalgebra in disguise;
  Lorentz transforms are rotors in spacetime GA.
- **Robotics:** CGA unifies translation and rotation; rigid motions
  are rotors; geometric primitives are blades.

The next page is **further reading** — books, papers, and
implementations that take you further than this study journal can.
