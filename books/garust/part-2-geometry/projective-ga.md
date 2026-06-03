---
sidebar_position: 2
title: "Projective GA: Points, Lines, and Planes"
---

# Projective GA

> Add **one null generator** to 3D space and something remarkable happens:
> points, lines, and planes all become multivectors in a single algebra,
> and the **meet** and **join** of [Chapter 6](/garust/part-2-geometry/duality-and-the-meet)
> turn into real incidence geometry — the plane through three points, the
> point where three planes cross, the test for whether points are
> collinear. This is **Projective GA** (PGA), $Cl(3,0,1)$, and it's where
> `garust` stops being abstract algebra and starts being *geometry you can
> compute*.

[Chapter 6](/garust/part-2-geometry/duality-and-the-meet) gave us meet and
join in the abstract. This chapter pours concrete Euclidean geometry into
them by choosing the right signature. The trick — due to a line of work by
Gunn, Dorst, and others — is to add a *degenerate* dimension, and it pays
off spectacularly: one uniform algebra for all of flat geometry, with no
special cases.

## 1. Why Euclidean GA isn't enough

3D Euclidean GA ($Cl(3,0,0)$, [Part I](/garust/part-1-foundations/why-garust))
rotates beautifully — but it has two gaps for *doing geometry*:

- **No translations as versors.** Rotors handle rotation about the origin,
  but a *translation* isn't a sandwich in $Cl(3,0,0)$. Rigid motion is
  half-missing.
- **No clean points vs directions.** A vector $e_1$ is just a direction;
  there's no first-class notion of "the point at $(1,2,3)$" distinct from
  "the direction $(1,2,3)$," and no way to represent a plane *not through
  the origin*.

Both gaps come from the same source: Euclidean GA has no way to encode
*position* (offset from the origin), only *direction*. PGA fixes it by
adding one more generator — a **degenerate** one — to carry position.

## 2. The null generator

**Projective GA** is $Cl(3,0,1)$: the three Euclidean generators
$e_1, e_2, e_3$ (squaring to $+1$) plus **one null generator** $e_0$ that
squares to **zero**. That's $N = 4$ generators, $2^4 = 16$ blades. In
`garust`, $e_0$ sits at **bit 3** (`basis(8)`):

```rust
// garust's Pga3 = Cl(3,0,1): e1,e2,e3 square to +1; e0 squares to 0
// e0 = basis(8)   (the null / projective generator)
```

The null generator is the **ideal** or **projective** direction — it
encodes the difference between a point *at a location* and a mere
direction, the same job homogeneous coordinates do in projective geometry
(the extra "$w$" coordinate). One degenerate dimension, and *position*
enters the algebra. Everything else in this chapter follows from $e_0^2 =
0$.

## 3. Planes are vectors

Here's the first surprise of PGA, and it's a deliberate inversion: the
**grade-1 vectors are planes**, not points. A plane $ax + by + cz + d = 0$
is the vector

$$
\pi = a\,e_1 + b\,e_2 + c\,e_3 + d\,e_0,
$$

with $(a,b,c)$ the normal direction and $d$ the offset carried on the null
generator $e_0$. `garust`:

```rust
// from garust::pga — the plane ax + by + cz + d = 0 (a grade-1 vector)
pub fn plane(a: T, b: T, c: T, d: T) -> Self {
    Self::basis(1) * a + Self::basis(2) * b + Self::basis(4) * c + Self::basis(8) * d
}
```

PGA is **plane-based**: the plane is the atom, and everything else (points,
lines) is built by intersecting planes. This dual-to-intuition convention
— planes as vectors — is precisely what makes meet, join, and (next
chapter) rigid motions work out cleanly. The $d\,e_0$ term is why a plane
can sit *anywhere*, not just through the origin: position rides on the null
generator.

## 4. Points are trivectors

Dually, a **point** is a **grade-3 trivector** (grade $N - 1 = 3$ — the
dual of a plane). The point $(x,y,z)$ is:

$$
P = e_{123} - x\,e_{023} + y\,e_{013} - z\,e_{012},
$$

```rust
// from garust::pga — the point (x, y, z) (a grade-3 trivector)
pub fn point(x: T, y: T, z: T) -> Self {
    let (e0, e1, e2, e3) = (Self::basis(8), Self::basis(1), Self::basis(2), Self::basis(4));
    e1*e2*e3 - (e0*e2*e3)*x + (e0*e1*e3)*y - (e0*e1*e2)*z
}
```

The $e_{123}$ component is the **homogeneous weight** (always $1$ for a
finite point); the other three carry the coordinates. That points are
*trivectors* and planes are *vectors* is the dual grading of
[Chapter 6](/garust/part-2-geometry/duality-and-the-meet) made geometric —
a point is the dual of a plane, grade $1 \leftrightarrow N-1$. (`garust`'s
`display_pga()` prints these in the literature's $e_0$-first convention, so
`point(1,2,3)` reads `e123 - 3·e012 + 2·e013 - e023`.)

## 5. Lines, and incidence as algebra

A **line** is a grade-2 bivector — and you get it *two* dual ways, which is
the whole point of meet and join:

- **Join two points** with the regressive product (the *meet*'s sibling —
  here it joins): `point.line_through(other)` $= P \vee Q$.
- **Meet two planes** with the wedge: $\pi_1 \wedge \pi_2$.

```rust
// from garust::pga — the line through two points is their regressive product
pub fn line_through(&self, other: &Self) -> Self {
    self.regressive(other)   // P ∨ Q
}
```

Now the meet/join of [Chapter 6](/garust/part-2-geometry/duality-and-the-meet)
*is* incidence geometry, and `garust`'s tests read like a geometry
textbook:

```rust
// three planes meet at their common point (wedge = meet):
let px = Pga3::plane(1.0, 0.0, 0.0, -1.0);   // x = 1
let py = Pga3::plane(0.0, 1.0, 0.0, -2.0);   // y = 2
let pz = Pga3::plane(0.0, 0.0, 1.0, -3.0);   // z = 3
assert_eq!(px.wedge(&py).wedge(&pz), Pga3::point(1.0, 2.0, 3.0));

// two points join into the line through them (regressive = join):
let line = Pga3::point(0.0,0.0,0.0).line_through(&Pga3::point(1.0,0.0,0.0));
```

Three planes wedge to their common **point**; two planes wedge to a
**line**; two points join to a **line**. No simultaneous equations — the
intersection *is* the product.

> :mathgoose: The most beautiful thing about PGA is that **incidence
> becomes a product, and degeneracy becomes a test**. "Where do these three
> planes meet?" is just $\pi_1 \wedge \pi_2 \wedge \pi_3$ — evaluate it and
> read off the point. And "do these three points lie on a line?" has a
> gorgeous answer: **join them and check for zero**. Three collinear points
> span no triangle, so their triple join *vanishes* —
> `a.line_through(&b).regressive(&c) == 0` is the collinearity test, exact
> and coordinate-free. Geometry's predicates (meet, contain, collinear,
> coplanar) stop being case-by-case algorithms with epsilon-fudged
> determinants and become *one algebra*: multiply, then look at the grade
> or the magnitude. That unification — all of flat geometry as products in
> $Cl(3,0,1)$ — is why PGA is taking over graphics and robotics.

## 6. The collinearity test, concretely

That "join to zero" predicate is real and in `garust`'s tests:

```rust
// (0,0,0), (1,0,0), (2,0,0) are collinear ⇒ their triple join is zero
let a = Pga3::point(0.0, 0.0, 0.0);
let b = Pga3::point(1.0, 0.0, 0.0);
let c = Pga3::point(2.0, 0.0, 0.0);
assert_eq!(a.line_through(&b).regressive(&c).cleaned(1e-10), Pga3::zero());

// move c off the line and the join is non-zero (they span a plane)
```

Degeneracy *is* the geometric predicate: a vanishing join means "these
don't span what they'd generically span" — collinear points, concurrent
lines, coplanar points. The algebra answers incidence questions by *being*
zero or not, which is far more robust than threshold-testing a determinant.

## 7. Why "projective" — points at infinity

The word *projective* isn't decoration. The null generator $e_0$ also lets
PGA represent **ideal elements** — points and directions "at infinity" —
uniformly with finite ones. A point with **zero homogeneous weight** (no
$e_{123}$ component, only the $e_0$-blades) is a *direction* — a "point at
infinity." So:

- Two **parallel** planes still *meet* — in a **line at infinity** (no
  special case, no division-by-zero).
- A pure **direction** and a **located point** are the same kind of object,
  distinguished only by their weight.

This is the projective completion: parallel things meet at infinity, and
the algebra never special-cases it. For a geometry engine that's gold —
parallel lines, vanishing points, and points at infinity all just *work*,
where coordinate code would branch and divide by zero. The single null
dimension buys the entire projective structure.

## 8. One algebra for flat geometry

PGA delivers what Euclidean GA couldn't: a single algebra in which *all* of
flat geometry lives.

- **Points** (trivectors), **lines** (bivectors), **planes** (vectors) —
  one type, distinguished by grade.
- **Meet** ($\wedge$) and **join** ($\vee$) compute every intersection and
  span — incidence as products.
- **Degeneracy** (a vanishing product) *is* the geometric predicate
  (collinear, coplanar, concurrent).
- **Ideal elements** (infinity) are first-class, so parallels meet and
  nothing special-cases.

And — the gap from §1 — PGA *also* makes **translations** versors, so rigid
motion finally becomes a single sandwiching object. That's the **motor**,
and it's the next chapter: with points, lines, planes, and now *motions*
all in $Cl(3,0,1)$, `garust` has a complete kinematics engine — the
foundation the physics book will put bodies and forces onto.

> :weightliftinggoose: PGA = $Cl(3,0,1)$: one **null generator** $e_0$
> ($e_0^2 = 0$, position) on top of Euclidean space. The plane-based
> convention to memorize: **planes are vectors (grade 1), points are
> trivectors (grade 3), lines are bivectors (grade 2)**. Then **incidence
> is algebra** — three planes $\wedge$ to a point, two points $\vee$ to a
> line, and **collinearity is "join to zero."** Parallels meet at infinity
> with no special case, because $e_0$ supplies the projective completion.
> Run the `garust` tests — `px.wedge(&py).wedge(&pz) == point(1,2,3)` — and
> watch geometry *compute itself*. Next: motion.

## What we covered

- Euclidean GA can't represent **translations as versors** or **position**
  (points vs directions, off-origin planes); PGA fixes both by adding one
  **null generator**.
- **Projective GA** = $Cl(3,0,1)$: $e_1,e_2,e_3$ square to $+1$, the null
  $e_0$ (`basis(8)`) squares to $0$; 16 blades. $e_0$ carries **position**
  (homogeneous coordinates).
- PGA is **plane-based**: **planes** are grade-1 **vectors**
  ($a e_1 + b e_2 + c e_3 + d e_0$ for $ax+by+cz+d=0$); **points** are
  grade-3 **trivectors** (dual to planes); **lines** are grade-2
  bivectors.
- **Meet** ($\wedge$) and **join** ($\vee$, `line_through`) do **incidence
  geometry**: three planes meet at a **point**, two points join to a
  **line** — intersection *is* the product.
- **Degeneracy is the predicate**: collinear points **join to zero** — an
  exact, coordinate-free test.
- The **null generator** gives the **projective completion**: ideal
  elements (points/lines at infinity), so **parallels meet** with no
  special case.

## What's next

[Chapter 8](/garust/part-2-geometry/motors) — motors. With points, lines,
and planes in hand, we add **motion**: the **motor**, an even-grade PGA
versor that performs *any* rigid-body movement — rotation about *any* line
plus translation along it (a screw) — as a single object you compose by
multiplication and apply by sandwiching. The translator hides a lovely
surprise: its generating bivector is **null**, so its exponential
*truncates*.
