---
sidebar_position: 2
title: "Grad, Div, and Curl Were One Equation"
---

# Grad, Div, and Curl Were One Equation

Vector calculus hands you three operators — gradient, divergence, curl —
and swears they're different. They're not. Apply the vector derivative
$\nabla$ to a field with the **geometric product** and it splits, exactly
like $\mathbf{ab} = \mathbf{a}\cdot\mathbf{b} + \mathbf{a}\wedge\mathbf{b}$,
into a grade-lowering piece (divergence) and a grade-raising piece (curl):

$$
\boxed{\;\nabla F = \nabla\cdot F + \nabla\wedge F\;}
$$

One equation. The three operators of undergrad vector calculus are grade
parts of it.

## The split, from the product you already know

Back in the products section, the geometric product of two vectors split
into symmetric (inner, scalar) and antisymmetric (outer, bivector) parts.
$\nabla$ is a vector ([the vector derivative](/geometric-algebra/geometric-calculus/the-vector-derivative)),
so multiplying it into a field does the **same** split:

- $\nabla\cdot F$ — the **inner** part, **grade-lowering**.
- $\nabla\wedge F$ — the **outer** part, **grade-raising**.

What those parts *mean* depends on the grade of $F$. Let's walk the cases.

## Acting on a scalar field: gradient

If $\phi$ is a scalar (grade 0), the inner product $\nabla\cdot\phi$ has
nothing to lower into (you can't go below grade 0), so it vanishes, and

$$
\nabla\phi = \nabla\wedge\phi = \nabla\phi
$$

is the **gradient** — a vector (grade 1) pointing uphill. We saw this last
chapter. The full product on a scalar is just the gradient; no surprises.

## Acting on a vector field: divergence *and* curl at once

Here's the payoff. Let $\mathbf{F}$ be a vector field (grade 1). The
geometric product $\nabla\mathbf{F}$ produces **two grades simultaneously**:

$$
\nabla\mathbf{F} = \underbrace{\nabla\cdot\mathbf{F}}_{\text{grade } 0,\ \text{scalar}}
\;+\; \underbrace{\nabla\wedge\mathbf{F}}_{\text{grade } 2,\ \text{bivector}}.
$$

- $\nabla\cdot\mathbf{F}$ is the **divergence** — a scalar, the familiar
  $\partial_x F_x + \partial_y F_y + \partial_z F_z$: how much the field
  spreads out of a point.
- $\nabla\wedge\mathbf{F}$ is the **curl** — but as a **bivector**, not a
  vector: the oriented *plane* of circulation, with components
  $(\partial_x F_y - \partial_y F_x)\,\mathbf{e}_{12} + \dots$

So $\nabla\mathbf{F}$ carries divergence *and* curl together, in one
multivector, just as $\mathbf{ab}$ carried alignment and area together.
They were never separate operations — they're the two grade parts of one
derivative.

> :surprisedgoose: The curl is a **bivector**, and that quietly fixes a lie
> you were told. The "curl vector" $\nabla\times\mathbf{F}$ of undergrad is
> an **axial vector** — it flips sign under reflection differently from a
> real vector, and it only exists in 3D, for the same reason the cross
> product only exists in 3D: it's the **dual** of the real object. The
> real object is the circulation *plane*, the bivector $\nabla\wedge\mathbf{F}$,
> and it works in *every* dimension. In 3D you can dualize it back to the
> familiar curl vector — $\nabla\times\mathbf{F} = -I\,(\nabla\wedge\mathbf{F})$
> — but that's a 3D convenience, not the truth. The truth is a plane.

## The 3D curl is the dual of the wedge

To connect to what you know: in 3D, with pseudoscalar $I = \mathbf{e}_{123}$,
the textbook curl vector is the **dual** of the bivector curl:

$$
\nabla\times\mathbf{F} \;=\; -\,I\,(\nabla\wedge\mathbf{F}).
$$

Same data, re-dressed as a perpendicular vector via 3D duality (exactly
like the cross product is the dual of the wedge, back in the geometry
section). Outside 3D the dual of a bivector isn't a vector, so
$\nabla\times$ has no meaning — but $\nabla\wedge\mathbf{F}$ sails on. GA
keeps the dimension-independent object and lets you collapse to the
3D-vector form *only when you want the old notation*.

## The Laplacian falls out too

Apply $\nabla$ twice. On a scalar field, $\nabla^2\phi = \nabla\cdot
(\nabla\phi)$ is the **Laplacian** — and in GA $\nabla^2$ is just the
geometric square of the vector operator,

$$
\nabla^2 = \nabla\cdot\nabla = \sum_i \partial_i^2,
$$

a *scalar* operator (the wedge part $\nabla\wedge\nabla = 0$ vanishes,
because partial derivatives commute — the GA statement of "curl of grad is
zero" and "div of curl is zero," both just $\nabla\wedge\nabla = 0$). So
the vector-calculus identities $\nabla\times(\nabla\phi) = 0$ and
$\nabla\cdot(\nabla\times\mathbf{F}) = 0$ are *one* fact in GA:
$\nabla\wedge\nabla = 0$.

> :nerdygoose: Two "identities" you memorized for exams — curl-of-grad is
> zero, div-of-curl is zero — collapse into the single algebraic statement
> $\nabla\wedge\nabla = 0$ (the wedge of the vector operator with itself,
> zero because $\mathbf{a}\wedge\mathbf{a}=0$ and mixed partials commute).
> This is the recurring dividend of GA: *the identities you rote-learned
> as separate facts turn out to be one structural truth.* You stop
> memorizing the curl-of-grad rule the same way you stopped memorizing the
> quaternion multiplication table — because now you can see *why*.

## A glimpse ahead: Maxwell

The reason this matters for physics: with $F$ the electromagnetic
**bivector** field and $\nabla$ the *spacetime* vector derivative, the four
Maxwell equations — two with divergence, two with curl — become the
*single* equation $\nabla F = J$, precisely because $\nabla F$ packs the
"div-like" and "curl-like" parts into one multivector. That derivation
belongs to the [physics notes](/geometric-algebra/applications/physics),
but the *mechanism* is exactly this chapter: $\nabla$ times a field splits
by grade, and the grades are the classical operators.

> :weightliftinggoose: The takeaway is one boxed equation: **$\nabla F =
> \nabla\cdot F + \nabla\wedge F$**, the calculus twin of $\mathbf{ab} =
> \mathbf{a}\cdot\mathbf{b} + \mathbf{a}\wedge\mathbf{b}$. Drill the
> readings: on a **scalar** → gradient; on a **vector** → divergence
> (scalar) **plus** curl (bivector) at once; the **3D curl vector** is just
> the dual of that bivector; $\nabla^2 = \nabla\cdot\nabla$ is the
> Laplacian; and $\nabla\wedge\nabla = 0$ *is* both vanishing-identities.
> Three operators, one product. Compute $\nabla\mathbf{F}$ for a simple
> field by hand and watch div and curl come out together.

## Closing the section

Grad, div, and curl were never three things:

- $\nabla F = \nabla\cdot F + \nabla\wedge F$ — the geometric product of
  the vector operator with a field, split by grade.
- On scalars: **gradient**. On vectors: **divergence** (grade down) +
  **curl as a bivector** (grade up), together.
- The 3D **curl vector** is the dual of the bivector curl
  ($-I(\nabla\wedge\mathbf{F})$) — a 3D-only convenience.
- $\nabla^2 = \nabla\cdot\nabla$ is the **Laplacian**; $\nabla\wedge\nabla
  = 0$ unifies curl-of-grad and div-of-curl.

But differential operators are only half of calculus. The other half is
*integration* — and GA unifies the integral theorems even more
spectacularly than the differential ones. Next: the fundamental theorem of
geometric calculus, the *one* theorem that contains Green, Gauss, Stokes,
and Cauchy.
