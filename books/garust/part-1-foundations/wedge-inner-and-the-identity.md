---
sidebar_position: 4
title: "Wedge, Inner, and the Identity"
---

# Wedge, Inner, and the Identity

> Split the geometric product in two and the whole of vector algebra falls
> out. The symmetric half is the **inner product** $a \cdot b$ (the dot
> product, generalized); the antisymmetric half is the **wedge**
> $a \wedge b$ (oriented area, the cross product done right). Their sum is
> the geometric product — $ab = a\cdot b + a\wedge b$ — the identity that
> opened the book.

[Chapter 3](/garust/part-1-foundations/the-geometric-product) built the one
product. Its non-commutativity, we said, is *where the geometry lives* —
so let's separate the part that commutes from the part that doesn't. Out
come the two products you already half-know (dot and cross), corrected and
generalized, plus norms — and the cross product unmasked.

## 1. Symmetric and antisymmetric parts

Any product splits into a symmetric and an antisymmetric piece. For two
**vectors** $a, b$:

$$
ab = \underbrace{\tfrac{1}{2}(ab + ba)}_{\text{symmetric}}
   + \underbrace{\tfrac{1}{2}(ab - ba)}_{\text{antisymmetric}}.
$$

We name them:

$$
a \cdot b \;=\; \tfrac{1}{2}(ab + ba), \qquad
a \wedge b \;=\; \tfrac{1}{2}(ab - ba),
$$

so that, **for vectors**,

$$
\boxed{\,ab = a\cdot b + a\wedge b\,}
$$

the identity from [Chapter 1](/garust/part-1-foundations/why-garust). The
symmetric part is a **scalar** (grade 0); the antisymmetric part is a
**bivector** (grade 2). The geometric product of two vectors carries *both*
— a number *and* an oriented plane — which is exactly why it holds more
information than either the dot or cross product alone.

## 2. The inner product: the dot, generalized

The symmetric part $a \cdot b$ is the **inner product** — for vectors it's
exactly the familiar dot product:

$$
a \cdot b = |a|\,|b|\cos\theta,
$$

a scalar measuring alignment. Orthogonal vectors give $0$ (they
anticommute, so the symmetric part vanishes); parallel vectors give
$\pm|a||b|$. It carries the **metric** — it's where lengths and angles come
from — so it *depends on the signature* (in spacetime, $a \cdot b$ can be
negative for timelike/spacelike reasons).

`garust` implements the inner product for *all* grades (the Hestenes /
Doran–Lasenby convention: $\langle M \rangle_i \cdot \langle N \rangle_j$
lands in grade $|i-j|$, so it's **grade-lowering**), with scalar parts
contributing nothing — the convention that keeps the identity clean:

```rust
use garust::Vga3;
let e1 = Vga3::basis(1);
let e2 = Vga3::basis(2);

assert_eq!(e1.inner(&e1), Vga3::scalar(1.0));  // e1 · e1 = 1
assert_eq!(e1.inner(&e2), Vga3::zero());       // e1 · e2 = 0 (orthogonal)
```

## 3. The wedge: oriented area

The antisymmetric part $a \wedge b$ is the **wedge** (outer) product, and
it's the star of the show — the **bivector** spanning $a$ and $b$:

- It's **antisymmetric**: $a \wedge b = -\,b \wedge a$ (swap the orientation
  of the plane).
- So $a \wedge a = 0$ (a vector spans no area with itself).
- Its magnitude is $|a||b|\sin\theta$ — the **area** of the parallelogram
  $a, b$ — and it carries that area's **orientation** (which way the plane
  is "wound").
- It's **grade-raising**: two vectors (grade 1) wedge to a bivector (grade
  2); wedge a third and you get a trivector (volume).

Crucially, the wedge is **signature-independent** — it never squares a
generator, so it's pure combinatorics (disjoint blades combine, overlapping
ones vanish):

```rust
// from garust::products — the wedge needs no metric
pub fn wedge(&self, rhs: &Self) -> Self {
    let mut out = Self::zero();
    for a in 0..DIM {
        // ... for each pair of blades with a & b == 0 (disjoint):
        //     out[a | b] += sign * coeff_a * coeff_b
    }
    out
}
```

```rust
let e1 = Vga3::basis(1);
let e2 = Vga3::basis(2);
assert_eq!(e1.wedge(&e2), Vga3::basis(0b11));    // e1 ∧ e2 = e12
assert_eq!(e1.wedge(&e1), Vga3::zero());         // e1 ∧ e1 = 0
```

> :mathgoose: The wedge is the cross product *done right*. In 3D, the cross
> product $a \times b$ tries to represent the *plane* of $a$ and $b$ by a
> vector perpendicular to it — which only works in 3D (in 2D there's no
> "perpendicular direction"; in 4D there are infinitely many), and the
> result is a fake "axial vector" that flips wrong under reflection. The
> wedge $a \wedge b$ represents the plane *as a plane* (a bivector), in
> **any** dimension, with no perpendicular and no handedness convention.
> The cross product is the wedge composted into a vector via 3D-only
> duality: $a \times b = -\,I\,(a \wedge b)$
> ([Chapter 6](/garust/table-of-contents)). Once you have the wedge, you
> can throw the right-hand rule away.

## 4. The identity, verified

The boxed identity isn't a definition we imposed — it's a *theorem*, and
`garust`'s test suite checks it numerically on arbitrary vectors:

```rust
use garust::Vga3;
let a = Vga3::basis(1) + Vga3::basis(2);   // e1 + e2
let b = Vga3::basis(2) + Vga3::basis(3);   // e2 + e3

// ab = a·b + a∧b — the symmetric (scalar) plus antisymmetric (bivector) parts
assert_eq!(a * b, a.inner(&b) + a.wedge(&b));
```

Read it as: the geometric product of two vectors *is* their dot product
(how aligned they are) **plus** their wedge (the oriented plane they span).
One product, both pieces of information, losslessly — which is why it's
invertible where the dot and cross are not
([Chapter 3](/garust/part-1-foundations/the-geometric-product)). Dot and
cross were always two shadows of this one thing.

## 5. Grades and projection, in action

[Chapter 2](/garust/part-1-foundations/the-multivector) gave us grade
projection $\langle M \rangle_k$; now it earns its keep. The two products
are exactly grade selections of the geometric product:

- $a \cdot b = \langle ab \rangle_{|i-j|}$ — the **lowest** grade
  (grade-lowering).
- $a \wedge b = \langle ab \rangle_{i+j}$ — the **highest** grade
  (grade-raising).

So "inner vs outer" is literally "keep the low grade vs keep the high
grade" of the same product. This is the recurring move of the whole
subject: *compute the geometric product, then project the grade you want*.
We'll use it constantly — the EM field's force law, the rotor's action, the
meet of two planes are all "multiply, then select a grade."

## 6. The scalar product and norms

The grade-0 part has its own name, the **scalar product** $\langle ab
\rangle_0$, and it's how lengths enter. With the **reverse** $\tilde a$
(blade order reversed — [Chapter 5](/garust/part-1-foundations/reflections-rotors-and-exp)),
the **squared norm** of *any* multivector is

$$
|M|^2 = \langle M \tilde{M} \rangle_0 .
$$

For a vector this is just $|a|^2 = a \cdot a$. `garust` exposes both the
scalar product and `norm_squared`:

```rust
use garust::Vga3;
let a = Vga3::basis(1) + Vga3::basis(2);   // e1 + e2

assert_eq!(a.scalar_product(&a), 2.0);     // ⟨a a⟩_0 = 1 + 1
assert_eq!(a.norm_squared(), 2.0);         // |a|² = 2
```

`scalar_product` collapses to a single diagonal loop (two blades multiply
to a scalar only when their indices match), and `norm_squared` builds on
it. Norms are what we need to *normalize* — to make the **unit** vectors
and **unit** rotors that perform reflections and rotations next chapter.

## 7. Why this reorganizes everything you knew

Step back at what just happened to "vector algebra":

- The **dot product** is the symmetric, grade-lowering, metric-carrying
  part — `inner`.
- The **cross product** was a 3D-only, reflection-broken stand-in for the
  **wedge** — the antisymmetric, grade-raising, signature-free part that
  works in any dimension and represents planes *as planes*.
- The geometric product **= their sum** (for vectors), losslessly, and is
  **invertible** because of it.
- **Norms** come from the scalar product, $|M|^2 = \langle M\tilde M
  \rangle_0$.

Two separate, partly-broken products from undergraduate physics turn out
to be the two halves of one invertible product — and the "extra" object,
the bivector, is the oriented plane that physics kept mislabeling as an
axial vector. That reorganization is most of what GA *is*. The remaining
foundational piece is what these tools were *for*: motion. Reflections and
rotations, next.

> :weightliftinggoose: The chapter to carry forward in one line:
> **$ab = a\cdot b + a\wedge b$** — geometric product = (symmetric, scalar,
> metric) **inner** + (antisymmetric, bivector, signature-free) **wedge**.
> Bind the intuition: inner = *alignment* (a number, grade-lowering), wedge
> = *oriented area* (a plane, grade-raising), and the cross product is just
> the wedge squeezed into a vector by 3D-only duality — so drop it. Norms
> come from **$|M|^2 = \langle M\tilde M\rangle_0$** (`norm_squared`). In
> `garust`: `a * b == a.inner(&b) + a.wedge(&b)`. Run it. Then we use these
> to build rotations.

## What we covered

- The geometric product of two vectors splits into a **symmetric** part
  (scalar) and an **antisymmetric** part (bivector):
  **$ab = a\cdot b + a\wedge b$** (the boxed identity).
- The **inner product** $a\cdot b$ is the dot product generalized —
  metric-carrying, **grade-lowering** ($|i-j|$, Hestenes convention),
  signature-dependent (`inner`).
- The **wedge** $a\wedge b$ is the **oriented area** (bivector):
  antisymmetric, $a\wedge a = 0$, **grade-raising**, and
  **signature-independent** (`wedge`).
- The **cross product** is a 3D-only, reflection-broken shadow of the wedge
  ($a\times b = -I(a\wedge b)$) — GA replaces it in any dimension.
- Inner and wedge are **grade projections** of the geometric product
  (lowest vs highest grade) — "multiply, then select a grade."
- **Norms**: the **scalar product** $\langle ab\rangle_0$ and
  $|M|^2 = \langle M\tilde M\rangle_0$ (`scalar_product`, `norm_squared`).

## What's next

[Chapter 5](/garust/part-1-foundations/reflections-rotors-and-exp) —
reflections, rotors, and `exp`. What the algebra was *for*: motion. A
reflection is a sandwich $-n\,x\,n^{-1}$; two reflections make a
**rotation**; the rotor $R = e^{B}$ exponentiates a bivector into a
rotation in *any* dimension — generalizing complex numbers and quaternions
— and `garust` does it in closed form.
