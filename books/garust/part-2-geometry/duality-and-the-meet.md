---
sidebar_position: 1
title: "Duality, the Pseudoscalar, and the Meet"
---

# Duality, the Pseudoscalar, and the Meet

> Every blade has a dual — the blade spanning the generators it *leaves
> out* — and that duality turns the wedge's *join* into its mirror image,
> the **meet**. Where $a \wedge b$ builds the line *through* two points,
> the regressive product $a \vee b$ finds the point *where* two lines
> cross. `garust` builds this duality **combinatorially**, not from the
> metric — which is the one design choice that lets it work in the
> degenerate algebras (PGA) where the textbook dual breaks.

Welcome to Part II. [Part I](/garust/part-1-foundations/why-garust) built
`garust`'s algebraic core — the multivector, the geometric product, the
wedge, rotors. Now we turn that algebra into **geometry**. The hinge is
**duality**: a way to flip between a subspace and its complement, which
gives us the *meet* (intersection) to pair with the wedge's *join*. Get
duality right and incidence geometry — points on lines, planes meeting in
lines — becomes pure algebra.

## 1. Join builds up; we want something that cuts down

The wedge $\wedge$ ([Chapter 4](/garust/part-1-foundations/wedge-inner-and-the-identity))
is a **join**: it *builds larger subspaces*. Two vectors wedge to the plane
spanning them; three to the volume they span. It climbs grades.

But geometry constantly asks the *opposite* question: not "what do these
span?" but "where do they **intersect**?" Two planes share a line; two
lines (in a plane) share a point; a line pierces a plane at a point. That
operation — **meet** — *cuts grades down*. We need the wedge's dual, and
duality is how we get it: flip each object to its complement, join *there*,
and flip back.

## 2. The pseudoscalar

The largest blade in any algebra is the **pseudoscalar** $I$ — the wedge of
*all* $N$ generators, the single top-grade blade. It's the bitmask with
**every bit set**, so it lives at index $\text{DIM}-1$:

$$
I = e_1 \wedge e_2 \wedge \dots \wedge e_N.
$$

```rust
// from garust::dual — the top blade, all bits set
pub fn pseudoscalar() -> Self {
    Self::basis(DIM - 1)
}
```

$I$ represents the *whole space* as an oriented volume element. It's the
"unit" of duality (every complement is measured against it) and, as we'll
see, the **identity of the meet** — exactly as the scalar $1$ is the
identity of the geometric product. In $\text{Vga3}$, $I = e_{123}$ (index
7); in $\text{Vga2}$, $I = e_{12}$ (index 3).

## 3. The complement: a blade for the leftovers

The **complement** of a blade $e_S$ (built from a subset $S$ of generators)
is the blade $e_{\bar S}$ built from the *leftover* generators $\bar S$ —
with the unique sign that makes them wedge back to the pseudoscalar:

$$
e_S \wedge \mathrm{rc}(e_S) = I \qquad(\text{right complement}).
$$

So a grade-$k$ blade maps to a grade-$(N-k)$ blade — duality **swaps grade
$k \leftrightarrow N-k$**. A vector in 3D maps to a bivector, a plane to a
line, a point to... its dual object. `garust` defines a **right** and a
**left** complement (they differ by a grade-dependent sign and are mutual
inverses, $\mathrm{lc}(\mathrm{rc}(M)) = M$):

```rust
// from garust::dual — right complement: relabel each blade to its leftover
pub fn right_complement(&self) -> Self {
    let mut out = Self::zero();
    let top = DIM - 1;
    for i in 0..DIM {
        let comp = top ^ i;                 // the complementary bitmask
        if swap_sign(i, comp) > 0 { out.coeffs[comp] += self.coeffs[i]; }
        else                      { out.coeffs[comp] -= self.coeffs[i]; }
    }
    out
}
```

Note `comp = top ^ i` — the complement of a bitmask is just its XOR with
"all bits set." Duality, like everything in
[Chapter 3](/garust/part-1-foundations/the-geometric-product), is a bit
trick.

## 4. Why combinatorial, not metric — and why it matters enormously

The *textbook* dual is $M \mapsto M\,I^{-1}$ — multiply by the inverse
pseudoscalar. That works in a non-degenerate algebra. But it **breaks
exactly where GA earns its keep**: in Projective GA $Cl(3,0,1)$
([Chapter 7](/garust/part-2-geometry/projective-ga)) the pseudoscalar is
**null** — $I^2 = 0$ — so $I^{-1}$ *doesn't exist* and the metric dual is
undefined.

`garust`'s complements sidestep the metric entirely: they're defined by
*relabeling blades and tracking a reordering sign* (the
`e_S \wedge \mathrm{rc}(e_S) = I` rule), and **no generator is ever
squared**. So $(P,Q,R)$ never enters, and duality works *identically* in
Euclidean, projective, conformal, and spacetime algebras.

> :surprisedgoose: This is the kind of design decision that separates a GA
> library that *works* from one that quietly falls apart. The "obvious"
> dual, $M I^{-1}$, is what most textbooks teach — and it's a trap, because
> the most *useful* algebra for 3D geometry, PGA, has a **null
> pseudoscalar** ($I^2 = 0$, so $I^{-1}$ is nonsense). A library built on
> the metric dual simply can't do projective geometry. `garust`'s
> combinatorial complement — pure blade relabeling, no squaring — is
> *defined* in every signature, degenerate or not. The lesson generalizes:
> when a formula divides by something that might be zero, find the
> combinatorial definition that doesn't. Duality is geometry's, and it must
> survive null spaces.

## 5. In Euclidean space, the complement is the Hodge dual

In ordinary 3D ($\text{Vga3}$), the complement *is* the familiar **Hodge
dual** — and this is where the cross product finally gets explained. The
complement of a vector is the perpendicular plane:

$$
\mathrm{rc}(e_1) = e_{23},\quad \mathrm{rc}(e_2) = e_{31},\quad
\mathrm{rc}(e_3) = e_{12}.
$$

```rust
assert_eq!(Vga3::basis(1).right_complement(), Vga3::basis(6)); // rc(e1) = e23
```

Recall [Chapter 4](/garust/part-1-foundations/wedge-inner-and-the-identity)'s
promise: the cross product is a disguised wedge. Now we can say it exactly.
$a \wedge b$ is the *bivector* (plane) of $a$ and $b$; its **complement**
is the perpendicular *vector* — and that vector is the cross product:

$$
a \times b = \mathrm{rc}(a \wedge b).
$$

So $a \times b$ is "the plane $a \wedge b$, re-expressed as the
perpendicular direction via duality." It only works in 3D because *only in
3D* is the complement of a bivector a vector (grade $N-k = 3-2 = 1$). In 2D
the complement of a bivector is a scalar; in 4D it's another bivector — so
the cross product has no analogue, while the wedge works everywhere. The
right-hand rule was duality in 3D the whole time.

## 6. The regressive product: the meet

Now we assemble the **meet**. By **De Morgan duality** — dualize, join in
the dual world, dualize back — the regressive product $\vee$ is:

$$
a \vee b = \mathrm{lc}\big(\mathrm{rc}(a) \wedge \mathrm{rc}(b)\big).
$$

```rust
// from garust::dual — the meet, three lines of De Morgan
pub fn regressive(&self, rhs: &Self) -> Self {
    self.right_complement()
        .wedge(&rhs.right_complement())
        .left_complement()
}
```

Where the wedge *joins* (grade-raising), the regressive product *meets*
(grade-lowering): it finds the **common subspace**. And like the
complements it's metric-independent — the same meet in every signature. The
pseudoscalar $I$ is its **identity** ($I \vee M = M$), mirroring how $1$ is
the identity of the geometric product — wedge and regressive are perfect
duals, with $1$ and $I$ as their respective units.

## 7. The meet in action

In 3D, planes are bivectors; their meet is the line they share:

$$
e_{12} \vee e_{13} = e_1.
$$

```rust
// the xy-plane meets the xz-plane in the x-axis
let e12 = Vga3::basis(3);
let e13 = Vga3::basis(5);
assert_eq!(e12.regressive(&e13), Vga3::basis(1));   // = e1
```

Two planes, *met*, give their common axis — pure algebra, no solving
simultaneous equations. This is the engine of incidence geometry: in the
next chapter, with the right signature (PGA), $\vee$ and $\wedge$ become
"the line through two points," "the point where three planes meet," "do
these points lie on a line?" — all as one-liners. Duality is what makes
geometry computational.

## 8. The pairing, complete

You now have the second great structure of GA, dual to the first:

- The **pseudoscalar** $I$ is the top blade (all generators); it's the unit
  of duality and the identity of the meet.
- The **complement** sends a blade to the blade on its *leftover*
  generators ($\mathrm{rc}$, $\mathrm{lc}$, mutual inverses), swapping grade
  $k \leftrightarrow N-k$ — a bitmask XOR with a sign.
- `garust` uses **combinatorial** complements (no metric), so duality works
  in **degenerate** algebras like PGA where $I^{-1}$ doesn't exist — the
  decisive design choice.
- In 3D Euclidean the complement is the **Hodge dual**, and the **cross
  product is the complement of the wedge** ($a \times b =
  \mathrm{rc}(a \wedge b)$) — 3D-only because of the grade arithmetic.
- The **regressive product** (meet) $a \vee b = \mathrm{lc}(\mathrm{rc}(a)
  \wedge \mathrm{rc}(b))$ is the dual of the wedge: where join builds up,
  meet cuts down.

Wedge and regressive, join and meet, $1$ and $I$ — a complete duality. The
next chapter pours real Euclidean geometry into it.

> :weightliftinggoose: Duality is the wedge in a mirror. Lock in: the
> **pseudoscalar** $I$ (top blade) and the **complement** (a blade ↔ the
> blade on its leftover generators, grade $k \leftrightarrow N-k$, a bitmask
> XOR). The wedge **joins** (builds up); the **regressive product**
> $\vee = \mathrm{lc}(\mathrm{rc}\,\wedge\,\mathrm{rc})$ **meets** (cuts
> down). Burn in the two payoffs: the **cross product is just
> $\mathrm{rc}(a \wedge b)$** (3D-only), and `garust`'s complements are
> **combinatorial** so they survive PGA's **null pseudoscalar** — the
> reason it can do projective geometry at all. Next, we use meet and join
> to *compute* geometry.

## What we covered

- The wedge **joins** (grade-raising); geometry also needs **meet**
  (intersection, grade-lowering), obtained by **duality**.
- The **pseudoscalar** $I$ is the single top-grade blade (all generators,
  index $\text{DIM}-1$) — unit of duality, identity of the meet
  (`pseudoscalar`).
- The **complement** maps a blade to the blade on its leftover generators
  (grade $k \leftrightarrow N-k$, `comp = top ^ i` with a sign); `rc` and
  `lc` are mutual inverses.
- `garust` uses **combinatorial** complements (no generator squared), so
  duality is defined in **every signature** — crucially in PGA, where the
  **null pseudoscalar** ($I^2=0$) makes the metric dual $M I^{-1}$
  undefined.
- In 3D Euclidean the complement is the **Hodge dual**, and the **cross
  product** $= \mathrm{rc}(a \wedge b)$ — explained, and explained as
  3D-only.
- The **regressive product** (meet) $a \vee b = \mathrm{lc}(\mathrm{rc}(a)
  \wedge \mathrm{rc}(b))$ is the wedge's dual; $e_{12} \vee e_{13} = e_1$.

## What's next

[Chapter 7](/garust/part-2-geometry/projective-ga) — Projective GA. Add a
*single null generator* to get $Cl(3,0,1)$, and points, lines, and planes
all become multivectors, with **meet** and **join** doing real incidence
geometry — the plane through three points, the point where three planes
cross, the test for collinearity — exactly as `garust` implements it.
