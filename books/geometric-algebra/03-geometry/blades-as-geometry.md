---
sidebar_position: 3
title: "Blades as Geometric Objects"
---

# Blades as Geometric Objects

A $k$-blade isn't just an algebraic gadget. It's a directed
$k$-dimensional subspace, with magnitude (volume) and orientation
baked in. This chapter is about reading geometry off algebra.

## A Vector is a Directed Line

The vector $\mathbf{a}$ represents the 1-dimensional subspace
spanned by $\mathbf{a}$, with magnitude $|\mathbf{a}|$ and
orientation given by the sign of $\mathbf{a}$.

Two vectors $\mathbf{a}$ and $2\mathbf{a}$ represent the *same line*
(same subspace) but different "decorations" (magnitude). The vector
$-\mathbf{a}$ represents the line with opposite orientation.

## A Bivector is a Directed Plane

The bivector $\mathbf{a} \wedge \mathbf{b}$ represents the
2-dimensional subspace spanned by $\mathbf{a}$ and $\mathbf{b}$,
with magnitude equal to the parallelogram area, and orientation
"$\mathbf{a}$ then $\mathbf{b}$" (a circulation direction).

The same plane can be represented by infinitely many wedge products:
$\mathbf{a} \wedge \mathbf{b}$, $\mathbf{a} \wedge (\mathbf{a} +
\mathbf{b})$, $\mathbf{c} \wedge \mathbf{d}$ for any
$\mathbf{c}, \mathbf{d}$ spanning the same plane. They all give the
same bivector up to scalar (the orientation/area scaling).

> :happygoose: This is the right level of abstraction. The plane is
> the bivector — it's not "represented by" some normal vector or
> some pair of basis vectors. It just *is*. Rotations, reflections,
> projections all act on the plane directly.

## A Trivector is a Directed Volume

In 3D, the trivector $\mathbf{a} \wedge \mathbf{b} \wedge \mathbf{c}$
represents an oriented 3-volume — the parallelepiped spanned by the
three vectors, with sign given by right- or left-handed orientation.

In $\mathbb{R}^3$, every trivector is a scalar multiple of the
**pseudoscalar** $I = \mathbf{e}_{123}$.

The volume of the parallelepiped is $|\mathbf{a} \wedge \mathbf{b} \wedge \mathbf{c}|$,
which equals the absolute value of the determinant in linear
algebra — but here we got it from one wedge product, with the sign
preserved as orientation.

## Lines, Planes, and Volumes — Algebraically

In an $n$-dimensional GA, the geometric primitives:

| Primitive | Represented by | Dimension |
|---|---|---|
| Point (origin-relative) | scalar | 0 |
| Line through origin | nonzero vector | 1 |
| Plane through origin | nonzero bivector (a 2-blade) | 2 |
| Volume through origin | nonzero trivector (a 3-blade) | 3 |
| ... | ... | ... |
| Hyperplane through origin | $(n-1)$-blade | $n-1$ |
| Whole space | pseudoscalar (n-blade) | $n$ |

A blade $\mathbf{B}$ can be checked to *contain* a vector $\mathbf{a}$
by an algebraic test:

$$\mathbf{a} \in \mathbf{B} \iff \mathbf{a} \wedge \mathbf{B} = 0$$

Because if $\mathbf{a}$ is already in the span of $\mathbf{B}$, the
wedge of a linearly-dependent set is zero.

> :sarcasticgoose: "Is this vector in the column space of this
> matrix?" In LA, you reduce, you check ranks, you fight numerical
> stability. In GA, you wedge and check zero. (Or near-zero in
> floating point, sure — but the *concept* is the wedge.)

## Affine Lines and Planes (with Origin)

Lines and planes through the origin are blades. Lines and planes
*not* through the origin need an extra trick: encode the offset.

The cheapest version uses the **point-and-direction** form:

$$\text{Line through } \mathbf{p} \text{ in direction } \mathbf{d} = \{ \mathbf{p} + t\mathbf{d} : t \in \mathbb{R} \}$$

In standard 3D GA we keep this formula as-is. To do affine geometry
*algebraically* — to represent off-origin objects as single algebraic
elements — we lift to **Conformal Geometric Algebra (CGA)**, which
uses an extra two basis vectors to encode "infinity" and "origin."
We'll preview CGA in section 5; for now, just know that the
restriction of standard GA to origin-passing primitives is real but
fixable.

> :surprisedgoose: There's a version of GA — *conformal* — where
> spheres, points, lines, and planes (whether through the origin or
> not) are all represented as blades. Translations and rotations
> become rotors. The whole machinery scales up. We get there in §5.

## The Algebraic Tests

A short bestiary of "is this geometric thing true?" tests:

| Test | Algebraic form |
|---|---|
| $\mathbf{a}$ on the line through $\mathbf{b}$? | $\mathbf{a} \wedge \mathbf{b} = 0$ |
| $\mathbf{a}$ in the plane $\mathbf{B}$ (a bivector)? | $\mathbf{a} \wedge \mathbf{B} = 0$ |
| $\mathbf{a}$ orthogonal to the plane $\mathbf{B}$? | $\mathbf{a} \cdot \mathbf{B} = 0$ |
| Lines $\mathbf{a}$ and $\mathbf{b}$ parallel? | $\mathbf{a} \wedge \mathbf{b} = 0$ |
| Planes $\mathbf{A}$ and $\mathbf{B}$ parallel? | $\mathbf{A} \wedge \mathbf{B} = 0$ |
| Lines $\mathbf{a}$ and $\mathbf{b}$ perpendicular? | $\mathbf{a} \cdot \mathbf{b} = 0$ |

> :weightliftinggoose: One operator does all this. The wedge tells
> you "linear dependent" / "in the same flat thing." The dot tells
> you "orthogonal." Same two operators, scaled to any dimension.

## Dimension as Algebra

The key takeaway: in GA, a $k$-dimensional subspace **is** a
$k$-blade. The algebra knows the dimension. You don't carry it as
metadata — you carry it as the grade of the multivector.

This is why every GA operation we've seen so far transfers
unchanged from 2D to 3D to $n$D: the algebra is dimension-aware
intrinsically. The cross product was the warning sign that linear
algebra wasn't dimension-aware. GA fixes the foundation.

> :happygoose: From here on, "the plane spanned by $\mathbf{a}$ and
> $\mathbf{b}$" is a *thing*. We can multiply by it, reflect with
> it, take its dual, intersect it with another plane. No more
> "extract the normal vector, build a matrix." The plane is an
> object. Hold it in your hand.
