---
sidebar_position: 2
title: "Projections & Rejections"
---

# Projections & Rejections

In linear algebra, projection of $\mathbf{a}$ onto $\mathbf{b}$ is
$\frac{\mathbf{a}\cdot\mathbf{b}}{\mathbf{b}\cdot\mathbf{b}}\mathbf{b}$.
Two dot products and a vector. In GA the same idea generalizes to
projecting onto a *plane*, a *volume*, or any blade — using the
same formula.

## Projection Onto a Vector

For vectors:

$$\mathbf{a}_\parallel = (\mathbf{a} \cdot \mathbf{b})\,\mathbf{b}^{-1}$$

where $\mathbf{b}^{-1} = \mathbf{b}/|\mathbf{b}|^2$. The inverse of a
nonzero vector exists in GA — that's already a step up from "vectors
don't have inverses" in linear algebra.

The **rejection** (the perpendicular part) is

$$\mathbf{a}_\perp = (\mathbf{a} \wedge \mathbf{b})\,\mathbf{b}^{-1}$$

Inner product extracts the parallel part. Outer product extracts the
perpendicular. They sum back to $\mathbf{a}$:

$$\mathbf{a} = \mathbf{a}_\parallel + \mathbf{a}_\perp = (\mathbf{a} \cdot \mathbf{b})\mathbf{b}^{-1} + (\mathbf{a} \wedge \mathbf{b})\mathbf{b}^{-1} = \mathbf{a}\mathbf{b}\mathbf{b}^{-1}$$

The geometric product fundamental identity makes this an algebraic
tautology.

> :happygoose: Look at that. Project = inner-times-inverse. Reject =
> outer-times-inverse. One formula for each, and they're symmetric
> under swap of $\cdot$ and $\wedge$. The split into parallel and
> perpendicular is **algebraic**, not geometric — we never had to
> reason about angles.

## Projection Onto a Blade

Now generalize. To project a vector onto a $k$-blade $\mathbf{B}$ —
that is, into the subspace $\mathbf{B}$ represents:

$$\mathbf{a}_\parallel = (\mathbf{a} \cdot \mathbf{B})\,\mathbf{B}^{-1}$$

Same formula. $\mathbf{B}$ might be a vector (project onto a line), a
bivector (project onto a plane), a trivector (project onto a 3D
subspace), and so on.

Rejection is

$$\mathbf{a}_\perp = (\mathbf{a} \wedge \mathbf{B})\,\mathbf{B}^{-1}$$

> :surprisedgoose: The exact same formula generalizes from
> projecting-onto-a-line to projecting-onto-a-hyperplane. In linear
> algebra these are entirely different computations. The wedge and
> contraction handle the dimensional bookkeeping.

### Worked example

In $\mathbb{R}^3$, project $\mathbf{a} = 3\mathbf{e}_1 + 2\mathbf{e}_2 + \mathbf{e}_3$
onto the $\mathbf{e}_{12}$ plane.

$\mathbf{B} = \mathbf{e}_1 \wedge \mathbf{e}_2 = \mathbf{e}_{12}$, with
$\mathbf{B}^{-1} = -\mathbf{e}_{12}$ (since $\mathbf{e}_{12}^2 = -1$).

$\mathbf{a} \cdot \mathbf{B} = (3\mathbf{e}_1 + 2\mathbf{e}_2 + \mathbf{e}_3) \cdot \mathbf{e}_{12}$.

Using the rule $\mathbf{e}_i \cdot \mathbf{e}_{ij} = \mathbf{e}_j$ and
$\mathbf{e}_3 \cdot \mathbf{e}_{12} = 0$:

$$\mathbf{a} \cdot \mathbf{B} = 3\mathbf{e}_2 - 2\mathbf{e}_1$$

Multiply by $\mathbf{B}^{-1} = -\mathbf{e}_{12}$:

$$\mathbf{a}_\parallel = (3\mathbf{e}_2 - 2\mathbf{e}_1)(-\mathbf{e}_{12}) = 3\mathbf{e}_1 + 2\mathbf{e}_2$$

Exactly what we expect: project onto the $xy$-plane, drop the
$z$-component.

> :weightliftinggoose: Run this calculation by hand once. Twice.
> Until "$\mathbf{e}_2 \cdot \mathbf{e}_{12} = -\mathbf{e}_1$" stops
> needing a lookup. The basis-blade arithmetic is the muscle memory
> on which all GA computation rests.

## Why This Beats Gram-Schmidt

To project onto a $k$-dimensional subspace in linear algebra, you
build an orthonormal basis (Gram-Schmidt), assemble a projection
matrix $P = \sum \mathbf{u}_i \mathbf{u}_i^T$, and apply it. $O(nk)$
work, plus the orthogonalization cost.

In GA, you store the subspace as **a single $k$-blade** $\mathbf{B}$
and apply $(\mathbf{a} \cdot \mathbf{B})\mathbf{B}^{-1}$. The blade
*is* the subspace; no basis required.

> :angrygoose: Gram-Schmidt is a numerical workaround for
> linear-algebra's inability to talk about subspaces directly. GA
> talks about subspaces directly via blades. The whole orthogonalization
> ritual becomes unnecessary — and orthogonalization was already
> numerically unstable, which is why people use QR or modified
> Gram-Schmidt in practice. GA sidesteps the whole mess.

## Rejection as "Subtract the Projection"

In LA you'd compute $\mathbf{a}_\perp = \mathbf{a} - \mathbf{a}_\parallel$
explicitly. In GA the rejection has its own clean formula
$(\mathbf{a} \wedge \mathbf{B})\mathbf{B}^{-1}$, which is faster
when you only want $\mathbf{a}_\perp$ — you skip computing
$\mathbf{a}_\parallel$ entirely.

> :sharpgoose: Numerical aside: when $\mathbf{a}$ is *almost* in the
> subspace, $\mathbf{a}_\perp$ has tiny magnitude. The "subtract the
> projection" approach catastrophically cancels. The wedge-form
> rejection avoids this — it never computes the large quantity
> $\mathbf{a}_\parallel$ in the first place.
