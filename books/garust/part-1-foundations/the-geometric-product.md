---
sidebar_position: 3
title: "The Geometric Product"
---

# The Geometric Product

> The one multiplication that generates everything. The **geometric
> product** turns the vector space of multivectors into an *algebra*. Its
> defining property — $a^2 = |a|^2$ for a vector — fixes it completely,
> and on basis blades it's almost pure bit manipulation: **XOR the
> bitmasks, track a reordering sign, fold in the metric**. Every other
> product, rotor, and physical law in this book is built from it.

[Chapter 2](/garust/part-1-foundations/the-multivector) gave us the
multivector and its *linear* structure (add, scale). This chapter gives it
the *multiplicative* structure that makes GA an **algebra** — and the
remarkable thing is that it's *one* product, defined by *one* property,
computable by *bit tricks*. Master this and the rest of the subject
unfolds from it.

## 1. The defining property

The geometric product (written by juxtaposition, $ab$) is the *unique*
associative, bilinear product on multivectors satisfying one rule: **a
vector times itself is its squared magnitude**, a scalar:

$$
a\,a = a^2 = |a|^2 \in \mathbb{R}.
$$

That's it. From "a vector squares to its length-squared," associativity,
and distributivity, the *entire* algebra is determined. It looks almost
too simple to matter — but watch what it forces.

Take two *orthonormal* basis vectors $e_1, e_2$. Consider $(e_1 + e_2)^2$.
By the defining rule it must be $|e_1+e_2|^2 = 2$. Expand it with
distributivity:

$$
(e_1+e_2)^2 = e_1^2 + e_1 e_2 + e_2 e_1 + e_2^2 = 1 + e_1e_2 + e_2e_1 + 1.
$$

For this to equal $2$, we need $e_1e_2 + e_2e_1 = 0$, i.e.

$$
e_1 e_2 = -\,e_2 e_1.
$$

**Orthogonal vectors anticommute.** We didn't assume that — the single
defining property *forced* it. And $e_1 e_2$ is a *new* object: not a
scalar (it doesn't square to $+1$; in fact $(e_1e_2)^2 = -1$), not a vector
— it's the **bivector** of [Chapter 2](/garust/part-1-foundations/the-multivector),
the oriented plane spanned by $e_1$ and $e_2$, born directly from the
product.

> :surprisedgoose: Pause on $(e_1 e_2)^2 = -1$. The bivector $e_{12}$ — an
> oriented unit area — *squares to minus one*. That is the same property
> that makes $i$ "imaginary." In 2D Euclidean GA, the even-grade elements
> $\{a + b\,e_{12}\}$ are **exactly the complex numbers**, with $e_{12}$
> playing the role of $i$ — and multiplying by it *rotates by 90°*, which
> is *why* complex multiplication rotates. The "imaginary unit" was never
> mysterious; it's an oriented plane that squares to $-1$ because
> orthogonal vectors anticommute. GA hands you $i$ as geometry, for free,
> the moment you write down the geometric product.

## 2. The product of two basis blades

To compute with arbitrary multivectors, we only need to know how two
*basis blades* multiply — then extend bilinearly (multiply out the sums).
Multiplying basis blades has three ingredients, and `garust` computes all
three from the bitmask indices $a$ and $b$:

1. **Which blade results** — concatenate the generators and cancel the
   shared ones. Cancellation means a generator squared away; survivors are
   exactly those in *one* of $a, b$ but not both. So the result index is
   $a \oplus b$ (**XOR**).
2. **The reordering sign** — the generators must be sorted into canonical
   order, and each swap of adjacent generators flips the sign (they
   anticommute). The sign is $(-1)^{\#\text{inversions}}$.
3. **The metric factor** — each *shared* generator squares to $+1$, $-1$,
   or $0$ depending on its group ($P$/$Q$/$R$). A $0$ (null generator)
   makes the whole product vanish.

## 3. The reordering sign

When you concatenate $a$'s generators then $b$'s and sort them, the number
of adjacent swaps needed is the number of **inversions** — pairs
$(i \in a,\ j \in b)$ with $i > j$. `garust` counts them with a bit trick
(shift $a$ down, AND with $b$, popcount, repeat):

```rust
// from garust::signature — sign of sorting the concatenation a·b
pub const fn swap_sign(a: usize, b: usize) -> i32 {
    let mut a = a >> 1;
    let mut inversions: u32 = 0;
    while a != 0 {
        inversions += (a & b).count_ones();   // pairs at this shift distance
        a >>= 1;
    }
    if inversions & 1 == 0 { 1 } else { -1 }   // even ⇒ +1, odd ⇒ -1
}
```

This is the source of *all* the minus signs in GA — the anticommutation
$e_i e_j = -e_j e_i$ is just "one inversion, one sign flip," scaled up to
arbitrary blades.

## 4. The metric factor and the full blade product

Now the shared generators. Each one squares away, contributing its
metric value by which group it's in (the signature,
[Chapter 2](/garust/part-1-foundations/the-multivector)): $+1$ for $P$,
$-1$ for $Q$, $0$ for $R$. `garust`'s `blade_product` puts it all together:

```rust
// from garust::signature — geometric product of two basis blades
pub const fn blade_product(a: usize, b: usize, p: usize, q: usize) -> (usize, i32) {
    let result = a ^ b;                  // (1) XOR: shared generators cancel
    let mut sign = swap_sign(a, b);      // (2) reordering sign
    let mut shared = a & b;              // generators that square away
    while shared != 0 {
        let k = shared.trailing_zeros() as usize;
        if k < p {
            // squares to +1 — no change
        } else if k < p + q {
            sign = -sign;                // (3) squares to -1
        } else {
            return (result, 0);          // squares to 0 (null) — whole product vanishes
        }
        shared &= shared - 1;            // clear lowest set bit
    }
    (result, sign)
}
```

It returns `(result_index, sign)` with `sign ∈ {-1, 0, +1}`. **The metric —
all the geometry — enters here**, through which group each shared generator
falls into. Change $P, Q, R$ and you change the algebra, *only* through
this one function. (Notice it's a `const fn` — `garust` can compute blade
products at *compile time*.)

## 5. Worked examples

Let's verify the rules in $Cl(2,0,0)$ and friends (these are `garust`'s
actual tests):

```rust
// Cl(2,0,0): e1 * e1 = 1     (P-group generator squares to +1)
blade_product(0b01, 0b01, 2, 0) == (0, 1);
// e1 * e2 = +e12             (disjoint, no inversions)
blade_product(0b01, 0b10, 2, 0) == (0b11, 1);
// e2 * e1 = -e12             (one inversion ⇒ anticommute)
blade_product(0b10, 0b01, 2, 0) == (0b11, -1);
// e12 * e12 = -1             (the bivector squares to minus one)
blade_product(0b11, 0b11, 2, 0) == (0, -1);

// Cl(0,1,0): the lone vector squares to -1  (Q-group)
blade_product(0b01, 0b01, 0, 1) == (0, -1);
// Cl(3,0,1): a null (R-group) generator squares to 0
blade_product(0b1000, 0b1000, 3, 0) == (0, 0);
```

Read them off the three rules: result $= a \oplus b$, sign from inversions,
metric from the shared bits. The bivector squaring to $-1$, the null
generator killing the product — these aren't special cases bolted on;
they're what the *one* function computes for those signatures.

## 6. Lifting to full multivectors

The blade product is the kernel; the geometric product of two *general*
multivectors is the **bilinear lift** — multiply every blade of one by
every blade of the other, scale by the coefficients, and accumulate:

$$
MN = \sum_{a}\sum_{b} M_a\, N_b\, (e_a e_b).
$$

In `garust` that's a double loop over the $2^N$ coefficients, routing each
term through `blade_product`:

```rust
// the geometric product, conceptually (garust implements `Mul`)
for a in 0..DIM {
    for b in 0..DIM {
        let (idx, sign) = blade_product(a, b, P, Q);
        out.coeffs[idx] += (sign as T) * self.coeffs[a] * rhs.coeffs[b];
    }
}
```

So `a * b` "just works" on multivectors in `garust`:

```rust
use garust::Vga3;
let a = Vga3::basis(1) + Vga3::basis(2);   // e1 + e2
let b = Vga3::basis(2);                     // e2
let c = a * b;                              // = e1 e2 + e2 e2 = e12 + 1
```

It's $O(\text{DIM}^2)$ — fine for the hand-sized algebras physics uses
(at most $32 \times 32$ for conformal GA), and not the bottleneck.

## 7. The properties that matter

The geometric product is:

- **Associative**: $(ab)c = a(bc)$ — so products of many factors are
  unambiguous, and *versors* (products of vectors) compose cleanly
  ([Chapter 5](/garust/part-1-foundations/reflections-rotors-and-exp)).
- **Bilinear / distributive**: it spreads over $+$, which is why the
  blade-by-blade lift is valid.
- **Not commutative**: $ab \ne ba$ in general (orthogonal vectors
  *anti*commute; parallel ones commute). The non-commutativity is not a
  defect — it's *where the geometry lives*. The symmetric part will be the
  inner product, the antisymmetric part the wedge
  ([Chapter 4](/garust/part-1-foundations/wedge-inner-and-the-identity)).
- **Invertible** for nonzero vectors: $a^{-1} = a / |a|^2$, since
  $a\,a = |a|^2$. You can **divide by vectors** — something the dot and
  cross products never gave you, and the root of rotors.

> :mathgoose: "You can divide by a vector" is quietly revolutionary. The
> dot product eats two vectors and returns a *scalar* (information lost,
> not invertible); the cross product is 3D-only and also not invertible.
> The geometric product of $a$ with itself is the invertible scalar
> $|a|^2$, so $a^{-1} = a/|a|^2$ exists. Division by vectors is exactly
> what lets us *solve* geometric equations and build the sandwich
> $R\,x\,R^{-1}$ that performs rotations
> ([Chapter 5](/garust/part-1-foundations/reflections-rotors-and-exp)).
> A product you can invert is a product you can do algebra with — which is
> why this one, and not the dot or cross, generates a whole calculus of
> geometry.

## 8. The engine of the algebra

You now have the operation everything is built from:

- The geometric product is fixed by **one rule**, $a^2 = |a|^2$, which
  *forces* orthogonal vectors to anticommute and *creates* the bivector
  (and, in 2D, the complex unit $i = e_{12}$).
- On basis blades it's three ingredients from the bitmasks: **result
  $= a \oplus b$**, a **reordering sign** (inversions), and the **metric
  factor** ($+1$/$-1$/$0$ per the signature) — all in `blade_product`.
- General products are the **bilinear lift** — a double loop over blades,
  $O(\text{DIM}^2)$.
- It's **associative, distributive, non-commutative, and invertible on
  vectors** — you can *divide by vectors*, which makes rotations possible.

Everything else in `garust` and in this book is a *named piece* of this
product. The very next chapter splits it into its symmetric and
antisymmetric halves — and out fall the inner product, the wedge, and the
identity that started Chapter 1.

> :weightliftinggoose: This is the chapter to *own*. The geometric product
> is **one rule** ($a^2 = |a|^2$) that cascades into the entire algebra,
> and `garust` computes it on blades as **XOR + reordering sign + metric**
> — three bit operations in `blade_product`. Drill the worked examples by
> hand: $e_1 e_2 = e_{12}$, $e_2 e_1 = -e_{12}$, $e_{12}^2 = -1$. Notice
> that the *only* place the algebra's geometry enters is the metric step
> (the $P$/$Q$/$R$ check) — change it and you change the universe you're
> computing in. And remember the superpower: this product is
> **invertible** on vectors. That single fact is the seed of every rotor
> to come.

## What we covered

- The **geometric product** is the unique associative, bilinear product
  with $a^2 = |a|^2$ for a vector — and that one rule **forces**
  $e_i e_j = -e_j e_i$ and creates the **bivector** ($e_{12}^2 = -1$, the
  complex $i$).
- On basis blades it's three ingredients from the bitmasks: result
  **$a \oplus b$** (XOR, shared generators cancel), a **reordering sign**
  (`swap_sign`, inversions), and the **metric factor** ($+1$/$-1$/$0$ by
  signature group) — combined in **`blade_product`**.
- The **metric (geometry) enters only** through the shared-bit step; a
  **null** generator zeroes the product.
- General products are the **bilinear lift** (double loop over $2^N$
  blades, $O(\text{DIM}^2)$), exposed as Rust's `*`.
- The product is **associative, distributive, non-commutative**, and
  crucially **invertible on vectors** ($a^{-1} = a/|a|^2$) — you can divide
  by vectors.

## What's next

[Chapter 4](/garust/part-1-foundations/wedge-inner-and-the-identity) —
wedge, inner, and the identity. Split the geometric product into its
symmetric part (the **inner product** $a \cdot b$) and antisymmetric part
(the **wedge** $a \wedge b$), recover the famous identity
$ab = a\cdot b + a\wedge b$, define **norms**, and see the cross product
exposed as a disguised, dimension-locked wedge.
