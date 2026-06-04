---
sidebar_position: 1
title: "The Vector Derivative — Calculus Joins the Algebra"
---

# The Vector Derivative — Calculus Joins the Algebra

Everything so far has been *algebra* — the geometric product, blades,
rotors, duality. Static. But the whole point of vectors in physics and
engineering is that they *vary over space*: fields. To do anything with
fields you need calculus, and GA has its own — **geometric calculus** —
built on one beautiful object: the **vector derivative** $\nabla$, which is
itself *a vector*.

> :angrygoose: They taught us $\nabla$ as a "mnemonic vector" with a wink —
> "it's not *really* a vector, just pretend, and don't ask what
> $\nabla \mathbf{F}$ means without a dot or a cross." That hand-wave is
> why grad, div, and curl feel like three unrelated tricks. In geometric
> calculus $\nabla$ **is** an honest vector, you multiply by it with the
> geometric product, and grad/div/curl stop being separate spells. The
> wink was hiding the real thing.

## Fields: multivector-valued functions

A **field** is a function $F(\mathbf{x})$ assigning a multivector to each
point $\mathbf{x}$ in space. Special cases you know:

- a **scalar field** $\phi(\mathbf{x})$ (temperature, potential),
- a **vector field** $\mathbf{F}(\mathbf{x})$ (velocity, force),

but GA lets the value be *any* grade — a bivector field (think the
electromagnetic field, coming in the physics notes), a full multivector
field. The calculus we build treats them all uniformly, because the vector
derivative doesn't care what grade it's acting on.

## The vector derivative $\nabla$

Pick an orthonormal frame $\{\mathbf{e}_i\}$ with reciprocal frame
$\{\mathbf{e}^i\}$ (in an orthonormal Euclidean frame, $\mathbf{e}^i =
\mathbf{e}_i$ — the distinction only bites in non-orthonormal or mixed
signatures). The **vector derivative** is

$$
\nabla \;=\; \sum_i \mathbf{e}^i\, \partial_i, \qquad
\partial_i = \frac{\partial}{\partial x^i}.
$$

Read it carefully: $\nabla$ is a sum of **basis vectors** $\mathbf{e}^i$
each scaled by a *partial-derivative operator*. So $\nabla$ is a
**vector-valued operator** — it has the algebraic character of a grade-1
element. That single fact is the whole trick: you can multiply $\nabla$
into a field with the **geometric product**, and the geometric product's
grade structure does the rest.

> :nerdygoose: This is why the "mnemonic vector" works and why it isn't a
> mnemonic at all. In ordinary vector calculus $\nabla = (\partial_x,
> \partial_y, \partial_z)$ is *defined* to look like a vector so the
> notation $\nabla\phi$, $\nabla\cdot\mathbf{F}$, $\nabla\times\mathbf{F}$
> comes out right — but you're forbidden from writing the bare product
> $\nabla\mathbf{F}$. GA removes the prohibition: $\nabla$ is a genuine
> vector in the algebra, $\nabla\mathbf{F}$ is a genuine geometric product,
> and the "dot" and "cross" versions are just its grade parts. The thing
> they told you to pretend was a vector simply *is* one.

## The directional derivative

Before the full $\nabla$, the simplest derivative: how fast does $F$ change
as you step in direction $\mathbf{a}$? That's the **directional
derivative**

$$
(\mathbf{a}\cdot\nabla)\,F(\mathbf{x})
\;=\; \lim_{\tau\to 0} \frac{F(\mathbf{x} + \tau\mathbf{a}) - F(\mathbf{x})}{\tau}.
$$

$\mathbf{a}\cdot\nabla$ is a *scalar* operator (the inner product of the
direction $\mathbf{a}$ with the vector operator $\nabla$), so it maps a
field to a field of the same grade — it just measures rate of change along
$\mathbf{a}$. The full $\nabla$ is what you get by "summing the directional
derivatives over a complete frame," and it can *change* the grade, which is
where grad/div/curl come from (next chapter).

## Worked example: the gradient of a scalar field

Let $\phi(\mathbf{x}) = x^2 + y^2$ in 2D. Apply $\nabla = \mathbf{e}_1
\partial_x + \mathbf{e}_2 \partial_y$:

$$
\nabla\phi = \mathbf{e}_1\,(2x) + \mathbf{e}_2\,(2y) = 2x\,\mathbf{e}_1 +
2y\,\mathbf{e}_2.
$$

That's the familiar **gradient** — a vector field pointing "uphill,"
magnitude the steepness. Nothing new *yet* for a scalar field: $\nabla$
acting on grade 0 raises it to grade 1, exactly the gradient. The surprise
is what happens when $\nabla$ hits a *vector* field, where the geometric
product splits into two grades at once — that's the next chapter, and it's
where divergence and curl turn out to be one equation.

## $\nabla$ acts from the left (and the right)

One subtlety the geometric product forces on us: $\nabla$ **doesn't
commute** with fields, because vectors don't commute. $\nabla F$ (the
derivative acting to the right, the usual case) and $F\nabla$ (acting to
the left) are genuinely different. Most of the time we mean left action,
$\nabla F$, and there's a tidy notation (overdots, $\dot\nabla \dot F$) for
saying *which* factor the derivative hits when there are several. For our
purposes: $\nabla$ sits on the left and differentiates everything to its
right, and the *order matters* — a feature, not a nuisance, since it's what
encodes orientation in the integral theorems later.

> :weightliftinggoose: Lock in the one idea this whole section rests on:
> **$\nabla$ is a vector** — $\sum_i \mathbf{e}^i \partial_i$ — and you
> **multiply** it into fields with the geometric product. Everything else
> in geometric calculus (grad, div, curl, the fundamental theorem,
> monogenic functions) is "apply the vector $\nabla$ and read off the
> grades." If undergrad calculus felt like three disconnected operators
> bolted onto a fake vector, this is the fix: one honest vector operator,
> one product. Get comfortable computing $\nabla\phi$ by hand before the
> next chapter unifies the rest.

## Closing the section

We've crossed from algebra into calculus with a single object. To recap:

- A **field** $F(\mathbf{x})$ is a multivector-valued function of position.
- The **vector derivative** $\nabla = \sum_i \mathbf{e}^i \partial_i$ is a
  genuine *vector* operator — you multiply by it geometrically.
- The **directional derivative** $\mathbf{a}\cdot\nabla$ measures change
  along $\mathbf{a}$; the full $\nabla$ sums over a frame and can shift
  grade.
- $\nabla$ **doesn't commute** with fields (order matters), which will
  matter for the integral theorems.

Next: apply $\nabla$ to a vector field and watch the geometric product
hand back divergence *and* curl in one stroke — $\nabla\mathbf{F} =
\nabla\cdot\mathbf{F} + \nabla\wedge\mathbf{F}$ — the calculus echo of
$\mathbf{ab} = \mathbf{a}\cdot\mathbf{b} + \mathbf{a}\wedge\mathbf{b}$.
