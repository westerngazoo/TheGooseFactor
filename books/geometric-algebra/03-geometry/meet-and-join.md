---
sidebar_position: 4
title: "Meet & Join — Intersections and Spans"
---

# Meet & Join — Intersections and Spans

Two operations to round out the geometry section: how to **span**
two subspaces (their join, written $\vee$ in some texts but
typically just the wedge $\wedge$) and how to **intersect** two
subspaces (the meet, $\vee$ here, sometimes written $\cap$).

## Join: $\mathbf{A} \wedge \mathbf{B}$

The join of two blades is their wedge product — the smallest blade
containing both.

- $\mathbf{a} \wedge \mathbf{b}$ — the plane through two
  (independent) lines.
- $\mathbf{a} \wedge \mathbf{B}$ — the volume through a line
  $\mathbf{a}$ and a plane $\mathbf{B}$, when they're independent.

If the two blades aren't independent — they share a common
direction — the wedge collapses to zero, and the join is whichever
of the two "swallows" the other.

> :nerdygoose: In LA we'd write "the span of the union of bases."
> Here it's just $\mathbf{A} \wedge \mathbf{B}$. The notation
> doesn't lie about what it's doing.

## Meet: Intersection via Duality

The meet of two blades $\mathbf{A}$ and $\mathbf{B}$ is the largest
common sub-blade — the intersection of the subspaces they
represent. The formula uses the dual:

$$\mathbf{A} \vee \mathbf{B} = (\mathbf{A}^* \wedge \mathbf{B}^*)^{-*}$$

where $\mathbf{X}^* = \mathbf{X} I^{-1}$ is the dual.

Read it as: "dualize, span, undualize." The dual swaps $k$-blades
for $(n-k)$-blades — wedging in the dual space corresponds to
intersecting in the original space.

### Why this works (intuition)

Wedge spans. Dual flips perpendicular ↔ parallel. So wedging
*duals* corresponds to intersecting parallel-direction subspaces —
which is the orthogonal complement of intersecting the originals,
hence the final undualize.

> :surprisedgoose: Intersection becomes "wedge in the dual space,
> then come back." That's De Morgan's law for subspaces. Algebra
> handed us the geometric law for free.

## Worked Example: Two Planes in 3D

In $\mathbb{R}^3$, take two planes:

$$\mathbf{A} = \mathbf{e}_{12} \quad (xy\text{-plane}), \qquad \mathbf{B} = \mathbf{e}_{13} \quad (xz\text{-plane})$$

We expect their intersection to be the $x$-axis.

Compute the duals (in 3D, $I = \mathbf{e}_{123}$, $I^{-1} = -I$):

$$\mathbf{A}^* = \mathbf{e}_{12} \cdot (-\mathbf{e}_{123}) = -\mathbf{e}_3, \qquad \mathbf{B}^* = \mathbf{e}_{13} \cdot (-\mathbf{e}_{123}) = \mathbf{e}_2$$

Wait, let me redo using $\mathbf{X}^* = \mathbf{X}I^{-1}$:

$$\mathbf{e}_{12}\,(-\mathbf{e}_{123}) = -\mathbf{e}_{12}\mathbf{e}_{123} = -\mathbf{e}_3$$

$$\mathbf{e}_{13}\,(-\mathbf{e}_{123}) = -\mathbf{e}_{13}\mathbf{e}_{123} = \mathbf{e}_2$$

(Using $\mathbf{e}_{12}\mathbf{e}_{123} = \mathbf{e}_3$ and
$\mathbf{e}_{13}\mathbf{e}_{123} = -\mathbf{e}_2$.)

Wedge the duals:

$$\mathbf{A}^* \wedge \mathbf{B}^* = (-\mathbf{e}_3) \wedge \mathbf{e}_2 = -\mathbf{e}_3 \wedge \mathbf{e}_2 = \mathbf{e}_2 \wedge \mathbf{e}_3 = \mathbf{e}_{23}$$

Undualize (multiply by $I$):

$$(\mathbf{e}_{23})^{-*} = \mathbf{e}_{23} \cdot I = \mathbf{e}_{23}\mathbf{e}_{123} = \mathbf{e}_1$$

The intersection of the $xy$- and $xz$-planes is the $x$-axis,
represented by $\mathbf{e}_1$. ✓

> :weightliftinggoose: Trace this calculation by hand. The
> mechanical part of GA is keeping the basis-blade arithmetic clean
> — once you can compute $\mathbf{e}_{12}\mathbf{e}_{123}$ without
> looking it up, the rest reads like English.

## Three Planes — and the General Pattern

The meet generalizes to multiple objects. To intersect three planes
in 3D:

$$\mathbf{A} \vee \mathbf{B} \vee \mathbf{C} = (\mathbf{A}^* \wedge \mathbf{B}^* \wedge \mathbf{C}^*)^{-*}$$

If the three planes are in general position, their duals are three
linearly-independent vectors, their wedge is the pseudoscalar (up
to sign), and the result is a scalar — meaning the intersection is
a point at the origin (in standard GA — the origin specifically,
since standard GA can't talk about non-origin points; CGA fixes
this).

If the planes are degenerate (two share a line), the wedge of the
duals is zero, and the meet collapses.

## Meet of a Line and a Plane

In 3D, line $\mathbf{a}$ (a vector) and plane $\mathbf{B}$ (a
bivector):

$$\mathbf{a} \vee \mathbf{B} = (\mathbf{a}^* \wedge \mathbf{B}^*)^{-*}$$

Generically gives a scalar — a 0-blade — meaning the line passes
through the origin. (Again, in CGA the result is a *point* with
location, not just an origin-tied scalar.)

If the line is parallel to the plane and offset, the wedge of duals
is zero, signaling no intersection.

## When Meet Misses — Parallelism Detected Algebraically

If $\mathbf{A}$ and $\mathbf{B}$ are parallel (their duals are
linearly dependent), then $\mathbf{A}^* \wedge \mathbf{B}^* = 0$,
and the meet is zero. So:

$$\mathbf{A} \vee \mathbf{B} = 0 \iff \mathbf{A}, \mathbf{B} \text{ share no common subspace direction}$$

This is the algebraic detector for "parallel lines" or "parallel
planes" — no special-case branch in the code. The meet returns
zero and you know.

> :sarcasticgoose: Linear algebra: write a function that handles
> "parallel" as a special case, run an epsilon-comparison on the
> determinant, hope your tolerance is right. GA: the meet returns
> zero. The algebra is the special-case detector.

## Closing the Section

Three sections in, you have:

- Reflections as sandwich products.
- Projections and rejections via inner/outer.
- Lines, planes, volumes as blades.
- Span (join) and intersect (meet) as wedge and dualized wedge.

That's the geometry. Section 4 is **rotations** — built from two
reflections, written as a rotor sandwich. The sandwich pattern
keeps paying.

> :happygoose: We've assembled the toolbox. Geometric primitives
> are blades. Geometric tests are wedge-equals-zero or dot-equals-zero.
> Geometric transformations are sandwiches. Section 4 puts it all
> together for rotations — the operation that motivates the whole
> framework historically.
