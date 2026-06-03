---
sidebar_position: 2
title: "The Null Cone — Points That Know Their Distance"
---

# The Null Cone — Points That Know Their Distance

Here's the keystone of the conformal model: a Euclidean point doesn't
become a *vector*, it becomes a **null vector** — a vector that squares to
zero — sitting on a cone in the lifted space $\mathbb{R}^{n+1,1}$. And the
single most beautiful fact in all of CGA is that the **inner product of two
of these null vectors gives the Euclidean distance** between the points
they represent. Distance, the thing geometry is *about*, becomes a dot
product.

## The two extra basis vectors

We lift $\mathbb{R}^n$ (with basis $\mathbf{e}_1,\dots,\mathbf{e}_n$) into
$\mathbb{R}^{n+1,1}$ by adding two vectors. The cleanest basis to think in
is a **null basis**:

- $n_o$ — represents the **origin**,
- $n_\infty$ — represents the **point at infinity**,

both **null** ($n_o^2 = 0$, $n_\infty^2 = 0$) and satisfying the one
crucial relation

$$
n_o \cdot n_\infty = -1.
$$

(These are built from two ordinary basis vectors $e_+, e_-$ with $e_+^2 =
+1$, $e_-^2 = -1$ — that's where the "$+1$ and $-1$" of the signature live —
via $n_o = \tfrac12(e_- - e_+)$ and $n_\infty = e_- + e_+$. You rarely need
them in that raw form; $n_o$ and $n_\infty$ are the working basis.)

## Embedding a point

A Euclidean point $\mathbf{x} \in \mathbb{R}^n$ embeds as the conformal
vector

$$
\boxed{\,P = n_o + \mathbf{x} + \tfrac12\,\mathbf{x}^2\, n_\infty\,}
$$

— the origin term, the Euclidean position, and a "$\tfrac12 |\mathbf{x}|^2$"
term riding on infinity. The magic: **$P$ is null**. Compute $P^2$ using
$n_o^2 = n_\infty^2 = 0$, $\mathbf{x}\cdot n_o = \mathbf{x}\cdot n_\infty =
0$, and $n_o\cdot n_\infty = -1$:

$$
P^2 = \mathbf{x}^2 + 2\big(\tfrac12\mathbf{x}^2\big)(n_o\cdot n_\infty)
= \mathbf{x}^2 - \mathbf{x}^2 = 0.
$$

Every Euclidean point lands on the **null cone** — the set of vectors
squaring to zero. The origin embeds as $n_o$ (set $\mathbf{x}=0$); the
"point at infinity" is $n_\infty$. A located point is no longer a direction;
it's a specific spot on a cone, and the curvature of that cone is what
secretly stores its distance to everything else.

> :surprisedgoose: A *point* is a *null vector* — a thing that squares to
> zero. That should feel strange: in standard GA the only vector squaring
> to zero is the zero vector. Here, the entire continuum of Euclidean
> points maps to a whole *cone* of nonzero null vectors. The point's
> location $\mathbf{x}$ got "bent up onto the cone" by the
> $\tfrac12\mathbf{x}^2 n_\infty$ term — and that bending is *exactly* what
> makes the next fact work. The price of "a point that knows where it is"
> is "a point that squares to nothing." Geometry hides its distances in
> the shape of a cone.

## The keystone: inner product = distance

Now the fact the whole model is built to deliver. Take two points
$\mathbf{x}, \mathbf{y}$, embed them as $P, Q$, and dot them:

$$
P \cdot Q = -\tfrac12\,\lvert \mathbf{x} - \mathbf{y}\rvert^2.
$$

The **inner product of the two null vectors is (minus half) the squared
Euclidean distance** between the points. Let that land: in CGA, "how far
apart are these two points?" is answered by a single dot product. The
metric — the entire notion of distance that defines Euclidean geometry — is
encoded in the conformal inner product. (And $P \cdot Q = 0$ iff
$\mathbf{x} = \mathbf{y}$, recovering "a point is at zero distance from
itself.")

This is *why* we chose that exact embedding and that exact $n_o\cdot
n_\infty = -1$ normalization: they're tuned so the lifted inner product
reproduces Euclidean distance. Everything else in CGA — spheres, the
incidence tests, the transformations — flows from this one identity.

## The role of infinity

The $n_\infty$ vector is more than bookkeeping; it's how CGA distinguishes
*finite* points from *directions* and *flats*. A few consequences worth
filing away:

- $P \cdot n_\infty = -1$ for every (normalized) finite point — so dotting
  with $n_\infty$ is a "is this a finite point?" probe, and dividing by it
  re-normalizes.
- A vector with **no $n_o$ component** but an $n_\infty$ part is a *flat*
  direction or lies "at infinity" — which is how planes and lines
  (flats) get distinguished from spheres and circles (rounds) next chapter.
- Translations and the other conformal maps act by *moving points around on
  the cone*, and $n_\infty$ is the fixed landmark they pivot against.

Infinity being a first-class point — a genuine vector $n_\infty$ in the
algebra — is what lets CGA treat "parallel lines meet at infinity" and
"a plane is a sphere through infinity" as literal algebraic statements, not
hand-waving.

> :nerdygoose: The conformal inner product $P\cdot Q = -\tfrac12|\mathbf{x}
> -\mathbf{y}|^2$ is one of those identities that reorganizes how you
> think. In ordinary geometry, *distance* is a derived thing — you
> subtract coordinates and take a square root. In CGA distance is
> *primitive*: it's the bilinear form of the space, sitting right there in
> the algebra, the same inner product that does everything else. So
> distance queries, sphere membership ("is this point on that sphere?"),
> and "are these points equal?" all become the *same operation* — dot two
> vectors, look at the number. The metric stopped being something you
> compute and became something the algebra simply *is*.

## Closing the section

Points became null vectors, and distance became a dot product:

- The lift adds two **null** basis vectors, $n_o$ (origin) and $n_\infty$
  (infinity), with $n_o \cdot n_\infty = -1$.
- A point embeds as $P = n_o + \mathbf{x} + \tfrac12\mathbf{x}^2 n_\infty$,
  which is **null** ($P^2 = 0$): every point lives on the **null cone**.
- The keystone: $P \cdot Q = -\tfrac12\lvert\mathbf{x}-\mathbf{y}\rvert^2$ —
  the conformal **inner product encodes Euclidean distance**.
- $n_\infty$ is a real point (infinity), distinguishing finite points,
  directions, and flats.

With points as null vectors and distance as a dot product, the rest builds
itself. Next: wedge a few points together and watch *spheres, circles,
lines, and planes* drop out as blades — the round and flat objects of
geometry, all first-class at last.
