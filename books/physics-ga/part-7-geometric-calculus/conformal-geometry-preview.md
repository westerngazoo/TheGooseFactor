---
sidebar_position: 5
title: "Conformal Geometry Preview (Link to CGA)"
---

# Conformal Geometry Preview

> *Doran-Lasenby §10.* The conformal model of geometric algebra:
> $\mathcal{Cl}(p+1, q+1)$ as the home of conformal transformations
> on $\mathbb{R}^{p,q}$. Translations and dilations become rotors.

The "trick" of conformal geometric algebra (CGA): embed
$\mathbb{R}^n$ as a null cone in $\mathbb{R}^{n+1,1}$, and the
**conformal group** of $\mathbb{R}^n$ — translations, rotations,
dilations, and inversions — becomes the **rotor group** of the
ambient algebra. This makes Euclidean and conformal geometry as
clean as 3D rotations.

This is the closing chapter of the physics book; CGA itself is
mostly an application area (robotics, CAGD, computer vision)
rather than fundamental physics. We sketch the construction.

## 1. The conformal embedding

Embed $\mathbb{R}^n$ into $\mathbb{R}^{n+1,1}$ — Minkowski-style
with one extra timelike and one extra spacelike direction. Pick
two basis vectors $e_+, e_-$ with $e_+^2 = +1, e_-^2 = -1, e_+\cdot e_- = 0$.
Combine into **null** vectors:

$$n_o = (e_- - e_+)/\sqrt 2 \quad\text{(origin)}, \qquad n_\infty = (e_- + e_+)/\sqrt 2 \quad\text{(infinity)}$$

These satisfy $n_o^2 = n_\infty^2 = 0$ and $n_o\cdot n_\infty = -1$.

A point $\mathbf{x} \in \mathbb{R}^n$ maps to a null vector in
$\mathbb{R}^{n+1,1}$:

$$X = n_o + \mathbf{x} + \tfrac{1}{2}\mathbf{x}^2 n_\infty$$

**Check**: $X^2 = 0 + 0 + 0 + 2 \mathbf{x}\cdot(\tfrac{1}{2}\mathbf{x}^2 n_\infty)\cdot 0 + ...$
The arithmetic with the null vectors works out to $X^2 = 0$ for
any $\mathbf{x}$.

So Euclidean points sit on the **null cone** of the conformal
algebra. The "embedded" point $X$ has 1 extra constraint ($X^2 = 0$)
plus a normalization, leaving $n$ free parameters — same as $\mathbf{x}$.

## 2. Rotors in CGA

The conformal group of $\mathbb{R}^n$ is the group of angle-
preserving transformations. It contains:

- **Translations** $\mathbf{x} \to \mathbf{x} + \mathbf{a}$
- **Rotations** $\mathbf{x} \to R\mathbf{x}R^{-1}$
- **Dilations** $\mathbf{x} \to \lambda\mathbf{x}$
- **Inversions** $\mathbf{x} \to \mathbf{x}/|\mathbf{x}|^2$

Each of these can be implemented as a **rotor** in the conformal
algebra:

| Transformation | CGA rotor |
|---|---|
| Rotation around the origin | $R$ (the standard 3D rotor) |
| Translation by $\mathbf{a}$ | $T_\mathbf{a} = \exp(-\mathbf{a}\,n_\infty/2)$ |
| Dilation by $\lambda$ | $D_\lambda = \exp((\log\lambda)\,n_o\wedge n_\infty/2)$ |
| Inversion | $\mathbf{e}_+$ (a unit reflector) |

All four are rotors. The conformal group is the **rotor group** of
the conformal algebra.

The big result: **every conformal map is a rotor in CGA**. Just
like every rotation is a rotor in 3D GA, every conformal
transformation is a rotor in the higher-dimensional algebra.

> :surprisedgoose: This is the major payoff of CGA: the entire
> conformal group becomes the rotor group of a slightly bigger
> algebra. Translations — which are **not** rotations in
> conventional language — become rotors in CGA. The
> conventional "semidirect product" structure of the Poincaré
> group is gone; CGA's group law is just rotor multiplication.

## 3. Geometric primitives as blades

The conformal embedding makes **geometric primitives** (points,
lines, planes, spheres, circles) into algebraic objects:

| Object | Blade representation |
|---|---|
| Point $\mathbf{x}$ | $X = n_o + \mathbf{x} + \tfrac{1}{2}\mathbf{x}^2 n_\infty$ (vector) |
| Line through $\mathbf{x}_1, \mathbf{x}_2$ | $X_1 \wedge X_2 \wedge n_\infty$ (trivector) |
| Plane through $\mathbf{x}_1, \mathbf{x}_2, \mathbf{x}_3$ | $X_1 \wedge X_2 \wedge X_3 \wedge n_\infty$ (4-blade) |
| Sphere through 4 points | $X_1 \wedge X_2 \wedge X_3 \wedge X_4$ (4-blade) |
| Point pair | $X_1 \wedge X_2$ (bivector) |
| Circle (intersection of plane and sphere) | trivector |

Each blade IS the geometric object. Operations:

- **Intersection**: $A \wedge B$ — the intersection of two planes
  is a line; line and sphere is a point-pair.
- **Distance** between points: $X_1 \cdot X_2 = -\tfrac{1}{2}|\mathbf{x}_1 - \mathbf{x}_2|^2$.
- **Test for incidence** (point on a line): $X \wedge L = 0$ iff
  $\mathbf{x}$ is on the line $L$.

The CGA framework makes computational geometry into an algebraic
operation.

## 4. Robotics — the killer application

Modern robotics uses CGA for **rigid-body kinematics**:

- A rigid pose (position + orientation) is a **screw motor**
  rotor in CGA.
- Composition of rigid motions: just multiply rotors.
- Inverse kinematics: solve rotor equations.
- Path planning: paths in rotor space.

The `gafro` library (introduced in [ai-ga/Part V](/ai-ga/part-5-robotics/coming-soon))
implements this in C++ for industrial robotic arms. Lots of
academic + industrial work in the last 5 years.

> :weightliftinggoose: Robotics in CGA: replace 4×4 rigid-body
> transformation matrices (with their 12-parameter, 6-constraint
> structure) with 8-component rotors that compose via multiplication
> and never have gimbal lock or orthogonality drift. Codebases get
> shorter, numerical stability improves, and the "rigid-body
> calculus" gets cleaner.

## 5. Computer graphics

Same advantages as robotics:

- Rotations + translations + scalings as rotors.
- Smooth interpolation between poses via $\exp(\log R_1 + t\log R_2)$.
- Inverse kinematics for skeletal animation.
- Geometric primitives (points, planes, spheres) as blades.

The CGA framework is the natural language for **computer-aided
geometric design** (CAGD) and **computational geometry**. Several
research libraries (Gaalop, Ganja.js) implement it.

## 6. Why hasn't CGA taken over?

CGA has been around since the 1990s. Why isn't it the standard
language for robotics and computer graphics?

Reasons:

1. **Pedagogy**: matrix-based linear algebra is taught everywhere;
   CGA is a research topic with no standard undergraduate
   curriculum.
2. **Library ecosystem**: NumPy, Eigen, OpenGL are matrix-centric.
   CGA libraries exist but aren't as mature.
3. **Industry inertia**: rewriting from matrices to CGA requires
   conviction; existing codebases work.
4. **Performance**: matrix operations are highly optimized; CGA
   operations need more careful implementation to match.

The Brandstetter/Ruhe/etc. work on **Clifford neural networks** in
[ai-ga/Part III](/ai-ga/part-3-clifford-networks/coming-soon) is
slowly pushing CGA into machine-learning consciousness.

## 7. The structure summary

The conformal model is one of several "**embedded GA**" frameworks:

- **Conformal GA** $\mathcal{Cl}(n+1, 1)$ — conformal transformations
  of $\mathbb{R}^n$ as rotors.
- **Projective GA** $\mathcal{Cl}(n+1, 0)$ — projective geometry.
- **Conformal STA** $\mathcal{Cl}(4, 2)$ — Möbius transformations of
  spacetime.
- **5D STA** $\mathcal{Cl}(2, 4)$ — twistor-related.

Each takes the same trick (embed in a higher-dimensional algebra
where translations become rotors) and applies it to a different
base space.

The unifying message: **rotors are universal**. Whatever
transformations you want to do — rotations, translations, dilations,
Möbius — embed your space in a slightly larger Clifford algebra
where those transformations become rotors. Then the GA machinery
handles everything uniformly.

## 8. Closing Part VII (and the main content)

We've now covered the full content of *Physics through GA*:

- **Part I** (Foundations): the algebra itself.
- **Part II** (Classical mechanics): GA in Newton/Lagrange.
- **Part III** (Spacetime algebra): GA in special relativity.
- **Part IV** (Electromagnetism): Maxwell as one equation.
- **Part V** (Quantum): Pauli and Dirac in STA.
- **Part VI** (Gauge gravity): GR as gauge fields.
- **Part VII** (Geometric calculus): $\nabla$, integration, manifolds.

Plus the [conformal preview](/physics-ga/part-7-geometric-calculus/conformal-geometry-preview)
just now — pointing at applications (robotics, CAGD) and
extensions (other embedded algebras).

The Appendix has reference material: notation cheat sheets,
D-L cross-references, selected exercise solutions, and further
reading.

> :weightliftinggoose: That's the book. Seven parts, ~30 chapters,
> spanning classical mechanics to quantum gravity. Geometric
> algebra ties them together — one algebraic framework, one set
> of primitives, applied across every domain of physics. Whether
> GA replaces the conventional formalism in mainstream pedagogy
> is a question of time and inertia. For working physicists who
> want to read the book in two notations at once and pick which
> they like better, this is the parallel translation.

## What we covered

- Conformal embedding: points in $\mathbb{R}^n$ → null vectors in
  $\mathcal{Cl}(n+1,1)$.
- Translations, dilations, inversions all become rotors.
- Geometric primitives (points, lines, planes, spheres) as blades.
- Intersection, distance, incidence as algebraic operations.
- Robotics and computer graphics as application domains.
- Other embedded-GA frameworks (projective, conformal-STA, etc.).

## What's next

[Appendix A](/physics-ga/appendix/notation-cheat-sheet) onward: notation
cheat sheet, D-L cross-reference, selected exercises, and further
reading.
