---
sidebar_position: 3
title: "Rounds and Flats — Spheres and Lines as Blades"
---

# Rounds and Flats — Spheres and Lines as Blades

Standard GA had no name for a sphere. CGA names *all* of them — spheres,
circles, point-pairs, planes, lines — and they're just **blades**, built by
wedging points together. Wedge two points and you get the point-pair
through them; three points, the **circle** through them; four, the
**sphere**. Throw infinity into the wedge and the round flattens into a
**line** or **plane**. The whole zoo of geometric primitives becomes
"$\wedge$ some points."

## The pattern: wedge points to span objects

The wedge product *joins* — it spans the smallest object containing its
factors ([meet and join](/geometric-algebra/geometry/meet-and-join)). In
CGA, where points are null vectors, that join is *geometric*. Wedging $k$
points spans the round object through them:

| wedge | grade | object (in 3D CGA) |
|-------|-------|--------------------|
| $A \wedge B$ | 2 | **point-pair** (the two points) |
| $A \wedge B \wedge C$ | 3 | **circle** through the three |
| $A \wedge B \wedge C \wedge D$ | 4 | **sphere** through the four |

Three points determine a circle; four points determine a sphere — exactly
the classical facts, now *literal algebra*. The blade
$A\wedge B\wedge C$ **is** the circle: it carries its center, radius, and
orientation, and you never solved a system of equations to get it. You
wedged.

> :surprisedgoose: "Three points determine a circle" stops being a
> theorem you prove with simultaneous equations and becomes a *typing
> rule*: wedge three conformal points, get a grade-3 blade, that blade *is*
> the circle. The geometry is in the grades. A point-pair is grade 2, a
> circle grade 3, a sphere grade 4 — you can read an object's *kind* off
> its grade like reading a part of speech. And it composes: the wedge that
> built lines and planes from directions in standard GA is the *same*
> wedge building circles and spheres from points here. One operation, the
> entire catalog of round objects.

## Flats are rounds through infinity

Now the unification that makes CGA sing. A **line** is just a circle of
infinite radius; a **plane** is a sphere of infinite radius. In CGA that's
*not a metaphor* — it's $n_\infty$ in the wedge. Include the point at
infinity ([the null cone](/geometric-algebra/conformal-model/the-null-cone-and-points))
and the round straightens into a flat:

| wedge | object |
|-------|--------|
| $A \wedge B \wedge n_\infty$ | **line** through $A$, $B$ |
| $A \wedge B \wedge C \wedge n_\infty$ | **plane** through $A$, $B$, $C$ |

A line is "the circle through $A$, $B$, and infinity." A plane is "the
sphere through three points and infinity." So **rounds and flats are the
same kind of object** — blades — and the *only* difference is whether
$n_\infty$ is a factor. The artificial wall between "curved things" and
"straight things" that every geometry library fights with simply isn't
there: a flat is a round that passes through infinity, said algebraically.

## Spheres also have a dual form (as vectors)

There's a second, slicker representation worth knowing. A sphere can be
written as a single **vector** (grade 1) — its *dual* form:

$$
\sigma = P_c - \tfrac12 r^2\, n_\infty,
$$

where $P_c$ is the (embedded) center and $r$ the radius. A point $P$ lies
**on** this sphere exactly when

$$
P \cdot \sigma = 0.
$$

So "is this point on that sphere?" is, once again, a single inner product —
the distance machinery of the last chapter, reused. (A plane is the special
case $r \to \infty$: a vector with an $n_\infty$ but no $n_o$ part — a
"sphere centered at infinity.") Objects thus come in two dual flavors: the
**direct** form ($A\wedge B\wedge C\wedge D$, "spanned by these points") and
the **dual** form ($\sigma$, "the set of points $P$ with $P\cdot\sigma =
0$"), bridged by the pseudoscalar exactly like duals everywhere in GA.

## Intersections: the meet, reused

How do two of these objects intersect? The **meet** — the same dualized
wedge from the geometry section ([meet and join](/geometric-algebra/geometry/meet-and-join))
— now does *full* conformal incidence:

- sphere $\vee$ sphere $=$ the **circle** where they intersect,
- sphere $\vee$ plane $=$ the **circle** of intersection,
- plane $\vee$ plane $=$ their **line**,
- line $\vee$ sphere $=$ the **point-pair** where the line pierces it.

And — the recurring gift — when objects *don't* meet, the meet returns a
degenerate (imaginary-radius or zero) result, so **"do these intersect?"
and "where?" are one computation**, no special-case branching. Tangency,
containment, and intersection all read off the meet. The geometry toolkit
you built for origin-bound subspaces now works for *located, sized, curved*
objects, unchanged.

> :weightliftinggoose: The catalog to memorize: **wedge points → rounds**
> (2 points = point-pair, 3 = circle, 4 = sphere — *grade tells you which*),
> and **wedge in $n_\infty$ → flats** (a **line** is a circle through
> infinity, a **plane** a sphere through infinity). Spheres also have a
> **dual vector form** $\sigma = P_c - \tfrac12 r^2 n_\infty$ with
> membership test $P\cdot\sigma = 0$. **Intersections are the meet** $\vee$,
> with non-intersection signalled algebraically — no branches. Every
> geometric primitive a CAD or robotics system needs — points, lines,
> planes, circles, spheres, and their intersections — is *one algebra*.
> That's why CGA is the applied-GA workhorse.

## Closing the section

The full zoo of geometric objects, as blades:

- **Wedging points** spans **rounds**: point-pair (2), circle (3), sphere
  (4) — the object's **grade** is its kind.
- **Flats are rounds through infinity**: $A\wedge B\wedge n_\infty$ is a
  line, $A\wedge B\wedge C\wedge n_\infty$ a plane — curved and straight
  unified.
- Spheres also have a **dual vector form** $\sigma = P_c - \tfrac12 r^2
  n_\infty$, with membership $P\cdot\sigma = 0$ (distance, reused).
- **Intersections are the meet** $\vee$; non-intersection is detected
  algebraically — one operation, no special cases.

We can now *name* every located, sized, curved object. The last piece is
**motion**: how to translate, rotate, scale, and invert them. And — the
promise that opened this part — in CGA *all* of those become versors,
sandwiches, at last. That's the next and final CGA chapter.
