---
sidebar_position: 1
title: "Reflections — The First Sandwich"
---

# Reflections — The First Sandwich

Geometric algebra's first concrete payoff: reflections become a single
formula that works in any dimension.

## The Reflection Formula

To reflect a vector $\mathbf{a}$ across the line through a unit
vector $\mathbf{n}$:

$$\mathbf{a}' = \mathbf{n}\,\mathbf{a}\,\mathbf{n}$$

To reflect $\mathbf{a}$ across the **hyperplane perpendicular** to a
unit vector $\mathbf{n}$:

$$\mathbf{a}' = -\mathbf{n}\,\mathbf{a}\,\mathbf{n}$$

That's it. No projection-then-subtract. No matrix construction. One
sandwich.

> :surprisedgoose: A reflection in $n$ dimensions is one geometric
> product, then another. Both reflections — through the line, through
> the hyperplane — differ by a single minus sign. In linear algebra
> we'd build a matrix $\mathbf{I} - 2\mathbf{n}\mathbf{n}^T$ for each
> case. GA collapses it.

## Why It Works

Decompose $\mathbf{a}$ into the part parallel to $\mathbf{n}$ and the
part perpendicular:

$$\mathbf{a} = \mathbf{a}_\parallel + \mathbf{a}_\perp$$

A reflection across the hyperplane perpendicular to $\mathbf{n}$
flips $\mathbf{a}_\parallel$ and leaves $\mathbf{a}_\perp$ alone:

$$\mathbf{a}' = -\mathbf{a}_\parallel + \mathbf{a}_\perp$$

Now use the geometric product. Recall that for a unit vector
$\mathbf{n}$, parallel components commute with $\mathbf{n}$ and
perpendicular components anti-commute:

$$\mathbf{n}\,\mathbf{a}_\parallel = \mathbf{a}_\parallel\,\mathbf{n}, \qquad \mathbf{n}\,\mathbf{a}_\perp = -\mathbf{a}_\perp\,\mathbf{n}$$

(Why? Because the geometric product of two parallel vectors is a
scalar — symmetric. The geometric product of two perpendicular
vectors is a bivector — antisymmetric.)

So:

$$-\mathbf{n}\,\mathbf{a}\,\mathbf{n} = -\mathbf{n}(\mathbf{a}_\parallel + \mathbf{a}_\perp)\mathbf{n} = -\mathbf{a}_\parallel\,\mathbf{n}\,\mathbf{n} + \mathbf{a}_\perp\,\mathbf{n}\,\mathbf{n}$$

Since $\mathbf{n}\mathbf{n} = |\mathbf{n}|^2 = 1$:

$$-\mathbf{n}\,\mathbf{a}\,\mathbf{n} = -\mathbf{a}_\parallel + \mathbf{a}_\perp = \mathbf{a}'$$

The sandwich form *enforces* the right behavior on each component
without us having to extract them.

> :happygoose: This is the first hint of why GA is so clean. We never
> projected, never decomposed, never built a matrix. The algebraic
> identity does the geometric work for us.

## Sandwich Form Generalizes

The pattern $\mathbf{n} \mathbf{a} \mathbf{n}$ — multiply on the
left, multiply on the right — is called a **sandwich product**.
Reflections are the simplest case. **Rotations are two reflections
composed**, which means two sandwiches in a row, which simplifies
to one sandwich with a different filling.

That's the next chapter, but it's worth seeing the seed here:

$$\mathbf{a}' = \mathbf{m}(\mathbf{n}\mathbf{a}\mathbf{n})\mathbf{m} = (\mathbf{m}\mathbf{n})\mathbf{a}(\mathbf{n}\mathbf{m}) = R\,\mathbf{a}\,\tilde{R}$$

where $R = \mathbf{mn}$ is a **rotor**, and $\tilde{R} = \mathbf{nm}$
is its reverse. We'll meet rotors properly in section 4.

> :weightliftinggoose: The sandwich is everything. Reflections,
> rotations, projections, conformal transformations — all sandwiches.
> Get comfortable with the pattern $X \mapsto R X \tilde R$ now;
> you'll use it for the rest of the book.

## Reflection Across an Arbitrary Plane

Want to reflect across the plane spanned by $\mathbf{u}$ and
$\mathbf{v}$ (a bivector $\mathbf{B} = \mathbf{u} \wedge \mathbf{v}$,
unit-normalized)? The formula is the same idea, only with the dual:

$$\mathbf{a}' = -\mathbf{n}\,\mathbf{a}\,\mathbf{n} \qquad \text{where } \mathbf{n} = \mathbf{B}I^{-1}$$

The dual maps the plane to its perpendicular vector, and we reflect
across that vector. The duality machinery from section 2 means we
never need to "find a normal" — the algebra finds it.

> :sarcasticgoose: Linear algebra: "construct the normal vector to
> the plane, build the Householder reflector, multiply." GA: $-\mathbf{n}\mathbf{a}\mathbf{n}$,
> done, where $\mathbf{n}$ is whatever you have at hand — vector,
> bivector, even higher grades. Pick your battles, but pick them
> here.
