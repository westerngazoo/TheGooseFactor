---
sidebar_position: 2
title: "The Multivector"
---

# The Multivector

> The one object everything is built from. An algebra is fixed by three
> integers — the signature $Cl(P,Q,R)$ — and from $N = P+Q+R$ generators
> you build $2^N$ basis **blades**. A **multivector** is a linear
> combination of all of them: a single type that holds scalars, vectors,
> planes, and volumes at once. This is `garust`'s core, and we'll meet it
> as both math and Rust.

[Chapter 1](/garust/part-1-foundations/why-garust) promised one algebra for
all of physics. This chapter introduces the object that carries it: the
**multivector**. Get this representation clear — what a blade is, how
`garust` indexes it, what the signature means — and every later operation
(products, rotors, the EM field) is just arithmetic on this one structure.

## 1. The signature: three integers

A Geometric Algebra is built from a set of **basis vectors** (generators)
$e_1, e_2, \dots, e_N$. The *only* thing that distinguishes one algebra
from another is how each generator **squares** — and there are exactly
three possibilities. The **signature** $Cl(P,Q,R)$ counts them:

- **$P$** generators square to $+1$,
- **$Q$** generators square to $-1$,
- **$R$** generators square to $0$ (the *null* or degenerate ones).

with $N = P + Q + R$. That's the whole specification of the algebra:

$$
e_i^2 = +1 \ (i \le P), \qquad e_i^2 = -1 \ (P < i \le P+Q), \qquad
e_i^2 = 0 \ (\text{otherwise}).
$$

Euclidean space is all $+1$ ($Cl(3,0,0)$). Spacetime needs a $-1$ for time
(or space, by convention) — $Cl(1,3,0)$. Projective GA needs one *null*
generator — $Cl(3,0,1)$. The metric *is* the signature, and it's where all
the geometry enters.

`garust` documents exactly this partition in its `signature` module — bit
position $k$ tells you which group a generator is in:

```rust
// from garust::signature — the metric, by generator index k:
// - k < P          ⇒ e_{k+1} squares to +1
// - P ≤ k < P+Q    ⇒ e_{k+1} squares to -1
// - P+Q ≤ k < N    ⇒ e_{k+1} squares to 0 (null / degenerate)
```

## 2. Blades: the basis of everything

From $N$ generators you build basis **blades** by **wedging together
subsets** of them (the wedge $\wedge$ is the antisymmetric product —
[Chapter 4](/garust/part-1-foundations/wedge-inner-and-the-identity); for
now read it as "combine distinct generators"). There are $2^N$ subsets, so
$2^N$ blades. For $N = 3$:

$$
\underbrace{1}_{\text{grade } 0},\quad
\underbrace{e_1,\ e_2,\ e_3}_{\text{grade } 1},\quad
\underbrace{e_{12},\ e_{13},\ e_{23}}_{\text{grade } 2},\quad
\underbrace{e_{123}}_{\text{grade } 3}.
$$

The **grade** of a blade is the number of generators in it:

- **Grade 0** — the **scalar** $1$.
- **Grade 1** — the **vectors** $e_i$ (directed lengths).
- **Grade 2** — the **bivectors** $e_{ij}$ (oriented *areas* / planes).
- **Grade 3** — the **trivectors** $e_{ijk}$ (oriented *volumes*).
- **Grade $N$** — the **pseudoscalar** (the top blade,
  [Chapter 6](/garust/table-of-contents)).

This is the first big idea: GA gives you *higher-dimensional* directed
quantities — not just vectors, but oriented planes and volumes — as
first-class objects with the same standing as vectors.

> :surprisedgoose: The bivector is the unsung hero of the whole subject.
> Physics is *full* of quantities that aren't really vectors — angular
> velocity, angular momentum, torque, the magnetic field, the
> electromagnetic field. They're forced into vectors by the cross product,
> which is why they behave strangely (they're "axial vectors" / "pseudo
> vectors" that flip under reflection). They were **bivectors** —
> oriented *planes* — all along. The plane of rotation, not an axis. GA
> stops pretending they're arrows and lets them be what they are: oriented
> areas. Half the weirdness in undergraduate physics is bivectors wearing
> vector costumes.

## 3. The indexing convention: blades as bitmasks

To store and multiply blades, `garust` needs a concrete index for each. The
convention is elegant: **a blade's index is the bitmask of its
generators**. Bit $k$ set means generator $e_{k+1}$ is present. For $N=3$:

| index | bits  | blade        | grade |
|-------|-------|--------------|-------|
|   0   | `000` | $1$          | 0 |
|   1   | `001` | $e_1$        | 1 |
|   2   | `010` | $e_2$        | 1 |
|   3   | `011` | $e_{12}$     | 2 |
|   4   | `100` | $e_3$        | 1 |
|   5   | `101` | $e_{13}$     | 2 |
|   6   | `110` | $e_{23}$     | 2 |
|   7   | `111` | $e_{123}$    | 3 |

So `coeffs[0]` is always the scalar part, and the **grade is just the
popcount** (number of set bits) of the index:

```rust
// from garust::signature
pub const fn grade_of(blade_index: usize) -> usize {
    blade_index.count_ones() as usize
}
```

This bitmask scheme isn't just tidy — it makes the geometric product a
*bit-manipulation* ([Chapter 3](/garust/part-1-foundations/the-geometric-product)):
combining two blades is essentially XOR-ing their masks. The whole algebra
runs on bit tricks.

## 4. The multivector: a linear combination of blades

A **multivector** is a weighted sum of *all* $2^N$ blades — one
coefficient each:

$$
M = c_0\,1 + c_1 e_1 + c_2 e_2 + c_3 e_{12} + \dots
$$

That single object can hold a scalar *and* a vector *and* a bivector *and*
a volume simultaneously. (Usually only some grades are nonzero — a "pure
vector" has only grade-1 coefficients — but the type holds them all, which
is what lets the geometric product mix grades freely.)

In `garust`, that's a **dense array of $2^N$ coefficients**, generic over
the scalar type `T` and the signature:

```rust
// the heart of garust (simplified)
pub struct Multivector<T, const P: usize, const Q: usize, const R: usize, const DIM: usize> {
    pub coeffs: [T; DIM],   // DIM = 2^N; coeffs[i] multiplies the blade with index i
}
```

`coeffs[i]` is the coefficient of the blade whose bitmask is `i`. `DIM`
$= 2^N$ is passed explicitly (Rust can't yet compute it from `P+Q+R` in the
type), and the ready-made aliases pin it down so you never count blades by
hand.

## 5. The signature lives in the type

This is where Rust earns its place. The signature isn't a runtime value —
it's **`const` generic parameters**, so each algebra is a distinct
*type* the compiler tracks. `garust` ships aliases:

```rust
pub type Vga2 = Multivector<f64, 2, 0, 0, 4>;   // 2D Euclidean, 4 blades
pub type Vga3 = Multivector<f64, 3, 0, 0, 8>;   // 3D Euclidean, 8 blades
pub type Pga3 = Multivector<f64, 3, 0, 1, 16>;  // 3D Projective, 16 blades
pub type Cga3 = Multivector<f64, 4, 1, 0, 32>;  // 3D Conformal, 32 blades
pub type Sta  = Multivector<f64, 1, 3, 0, 16>;  // Spacetime, 16 blades
```

Because `Vga3` and `Sta` are *different types*, the compiler won't let you
add a Euclidean vector to a spacetime vector — a whole class of errors
gone at compile time (the Rust mantra
"make illegal states unrepresentable," applied to physics). Each algebra
also ships an `f32` twin (`Vga3f`, `Pga3f`, …) for graphics/GPU work — same
code, different precision, because `Multivector` is **generic over `T`**.

> :nerdygoose: Encoding the signature as `const` generics, not runtime
> fields, is the design choice that makes `garust` both *safe* and *fast*.
> Safe: the type system enforces that you never mix $Cl(3,0,0)$ with
> $Cl(1,3,0)$. Fast: `DIM` is known at compile time, so `[T; DIM]` is a
> fixed-size, stack-allocatable array and every loop over blades has a
> constant bound the optimizer can unroll — no heap, no dynamic dispatch.
> The same `Multivector` source monomorphizes
> (in Rust's usual way) into a specialized,
> inlined struct for each algebra. One implementation, many zero-cost
> concrete types — exactly the GA-meets-Rust fit from Chapter 1.

## 6. Building multivectors in garust

The everyday constructors:

```rust
use garust::Vga3;

let s  = Vga3::scalar(2.0);   // 2 (grade 0)
let e1 = Vga3::basis(1);      // e1  — basis blade with index 1
let e2 = Vga3::basis(2);      // e2  — index 2
let e23 = Vga3::basis(0b110); // e23 — index 6 (bits for e2 and e3)
let zero = Vga3::zero();      // additive identity

// Multivectors are a vector space: add and scale freely.
let v = e1 + e2;              // the vector e1 + e2
let w = 3.0 * v;              // scalar multiplication
```

`basis(i)` gives the blade with bitmask `i` (so `basis(1)` = $e_1$,
`basis(0b110)` = $e_{23}$); `scalar` and `zero` are the obvious grade-0
elements. Addition, subtraction, negation, and scalar multiplication make
multivectors an ordinary **vector space** over `T` — the *linear*
structure. The *multiplicative* structure (the geometric product) is what
makes it an *algebra*, and that's the next chapter.

## 7. Pulling out grades

Because a multivector superposes all grades, you often want just one. The
**grade projection** $\langle M \rangle_k$ keeps only the
coefficients of grade-$k$ blades:

```rust
let m: Vga3 = /* some mixed multivector */;
let scalar_part = m.grade(0);   // ⟨M⟩_0
let vector_part = m.grade(1);   // ⟨M⟩_1
let bivec_part  = m.grade(2);   // ⟨M⟩_2
```

Implemented exactly as you'd expect — a linear filter on the popcount of
each index:

```rust
// from garust::products
pub fn grade(&self, k: usize) -> Self {
    let mut out = Self::zero();
    for i in 0..DIM {
        if grade_of(i) == k {
            out.coeffs[i] = self.coeffs[i];
        }
    }
    out
}
```

Grade projection is how we'll *extract physics* from a product later: the
inner product is "keep the lower grade," the wedge is "keep the higher,"
and the scalar product is "keep grade 0." All of it is filtering the
multivector by grade — which is just filtering by popcount.

## 8. The object, in hand

You now have the one representation the whole book rests on:

- An algebra is a **signature** $Cl(P,Q,R)$: how many generators square to
  $+1$, $-1$, $0$. The metric *is* the signature.
- $N = P+Q+R$ generators build $2^N$ **blades**, indexed by the **bitmask**
  of their generators; **grade = popcount**.
- A **multivector** superposes all blades — `garust`'s
  `Multivector<T, P, Q, R, DIM>`, a dense `[T; 2^N]`, generic over scalar
  and signature, with the signature as **`const` generics** so each algebra
  is its own compile-time-checked type.
- Multivectors form a **vector space** (add, scale); **grade projection**
  pulls out a chosen grade.

Everything from here — the geometric product, rotors, the EM field — is an
operation *on this object*. Next we give it its defining multiplication.

> :weightliftinggoose: Lock in the mental model: a multivector is **one bag
> holding every grade at once** — scalar, vector, bivector (oriented
> plane!), volume — stored as a flat array of $2^N$ coefficients indexed by
> the **bitmask** of each blade's generators. The signature $Cl(P,Q,R)$
> (the metric) and the scalar type are baked into the *type* via `const`
> generics, so `Vga3`, `Pga3`, and `Sta` are distinct and the compiler
> keeps your algebras straight. Internalize "**grade = popcount**, scalar =
> `coeffs[0]`" — the next chapter's geometric product is built on exactly
> that bit-level view.

## What we covered

- The **signature** $Cl(P,Q,R)$ specifies an algebra by how generators
  square ($+1$/$-1$/$0$); $N=P+Q+R$, and the **metric is the signature**.
- $N$ generators build $2^N$ **basis blades**; the **grade** is the number
  of generators (scalar, vector, **bivector** = oriented plane, trivector,
  pseudoscalar).
- Bivectors are why "axial vectors" (angular velocity, magnetic field) are
  weird — they were oriented **planes**, not arrows.
- `garust` indexes a blade by the **bitmask** of its generators (`coeffs[0]`
  = scalar; **grade = popcount**, `grade_of`).
- A **multivector** superposes all blades — `Multivector<T, P, Q, R, DIM>`,
  a dense `[T; 2^N]`, **generic over scalar and signature**, with the
  signature as **`const` generics** (distinct, fast, safe types).
- Multivectors are a **vector space** (`+`, scalar `*`, `basis`, `scalar`,
  `zero`); **grade projection** `grade(k)` extracts one grade by popcount.

## What's next

[Chapter 3](/garust/part-1-foundations/the-geometric-product) — the
geometric product. The single multiplication that turns this vector space
into an *algebra*: how two blades multiply (XOR of bitmasks, a reordering
sign, and the metric), why $a^2 = |a|^2$ for a vector, and how `garust`
computes it with bit tricks.
