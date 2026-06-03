---
sidebar_position: 1
title: "Generic over Scalar and Signature"
---

# Generic over Scalar and Signature

> How do you write *one* Rust type that becomes complex numbers, 3D
> rotations, projective geometry, *and* spacetime — over `f64`, `f32`, or a
> number type you invent? This chapter is the architecture deep-dive:
> `garust`'s single `Multivector<T, P, Q, R, DIM>`, the `const`-generic
> trick that encodes the algebra in the type, the zero-dependency
> `Scalar`/`Real` trait split, and the coherence dance behind
> `2.0 * v`. It's a case study in generic Rust design you can steal.

Welcome to Part IV. [Parts I–II](/garust/part-1-foundations/why-garust)
taught the GA the engine implements; this part is about the *engine
itself* — the Rust design decisions that make `garust` small, fast, and
infinitely reconfigurable. If you're building any kind of numeric or
mathematical library, the patterns here transfer directly. We start with
the central type.

## 1. The whole library is one type

`garust`'s entire surface is a single struct, parameterized five ways:

```rust
pub struct Multivector<T, const P: usize, const Q: usize, const R: usize, const DIM: usize> {
    pub coeffs: [T; DIM],
}
```

- **`T`** — the scalar (coefficient) type: `f64`, `f32`, or your own.
- **`P, Q, R`** — the signature $Cl(P,Q,R)$
  ([Chapter 2](/garust/part-1-foundations/the-multivector)): generators
  squaring to $+1$, $-1$, $0$.
- **`DIM`** — $2^{P+Q+R}$, the number of blades, and the length of the
  coefficient array.

Everything — every product, rotor, PGA constructor, motor — is a method or
trait impl on *this one type*. There is no `Vector`, no `Bivector`, no
`Rotor` class; a rotor is just a `Multivector` with the right coefficients
([Chapter 5](/garust/part-1-foundations/reflections-rotors-and-exp)). This
radical economy — one type, configured by generics — is the architecture,
and the rest of the chapter is how each parameter earns its place.

## 2. Dense storage, and why

The representation is a **dense array** `[T; DIM]`: *every* blade gets a
slot, even the zero ones. A pure vector in `Vga3` still allocates all 8
coefficients (5 of them zero). Why not a sparse map (only nonzero blades)?

- **Small $N$**: the algebras a human uses top out at $\text{DIM} = 32$
  (Conformal GA). A 32-element array is nothing; a `HashMap` would be
  *slower* (hashing, pointer-chasing, allocation) for that size.
- **Cache and branch behavior**: a contiguous `[T; DIM]` is a single cache
  line or two, iterated with a tight, predictable loop — no indirection,
  no allocation, stack-friendly.
- **Simplicity**: the product is a clean double loop
  ([Chapter 13](/garust/part-4-engine/products-as-bit-tricks)); blade
  index *is* array index.

The trade-off is honest and documented: dense is wrong for *large*-$N$
work (a $Cl(10)$ has 1024 blades, mostly zero — there sparse wins). But
`garust` is built for the algebras you compute with by hand, and for those,
**dense is faster and simpler**. The design lesson: *fit the data structure
to the actual size regime*, don't reach for the asymptotically-clever one
your inputs never hit.

## 3. The DIM redundancy and the const-assert trick

You may have noticed `DIM` is *redundant* — it's always $2^{P+Q+R}$, so why
make the caller pass it? Because **stable Rust can't yet evaluate
`1 << (P+Q+R)` in array-length position**: const-generic *expressions* like
`[T; 1 << (P + Q + R)]` aren't stable. So `DIM` is a separate parameter the
caller supplies — and `garust` guards it with a **compile-time assertion**:

```rust
const _DIM_CHECK: () = assert!(
    DIM == 1 << (P + Q + R),
    "garust: Multivector<T,P,Q,R,DIM> requires DIM == 2^(P+Q+R)",
);

pub fn zero() -> Self {
    let () = Self::_DIM_CHECK;     // force the assert to evaluate here
    Self { coeffs: [T::ZERO; DIM] }
}
```

The subtlety — a real Rust lesson — is that an associated `const` is only
checked when it's *used*. Referencing `Self::_DIM_CHECK` inside `zero()`
(which every constructor calls) forces the check to fire at
**monomorphization**, so a bogus `Multivector<f64, 3, 0, 0, 7>` fails to
compile the moment you try to build one, with a clear message. And the type
aliases ([§5](#5-concrete-aliases)) mean end users never type `DIM` anyway.
A redundant parameter, made safe by a const assertion and hidden by
aliases: the pragmatic workaround for a language limitation.

> :nerdygoose: This `_DIM_CHECK` pattern is worth keeping in your toolkit
> for *any* const-generic type with an internal invariant the type system
> can't quite express. Rust evaluates an associated `const` lazily — only
> if something references it — so declaring the `assert!` isn't enough;
> you must *touch* it on a path that's always taken (here, `zero()`, which
> every other constructor funnels through). The result is a **compile-time**
> guarantee with a **custom error message**, costing zero runtime. It's the
> same spirit as the typestate patterns from the Rust book — push the
> invariant into compilation — but reaching past where const generics
> currently stop. When the language can't check it for you, a forced
> const-assert often can.

## 4. Zero dependencies: defining your own numeric traits

`garust` pulls in **nothing** — not even `num-traits`. To be generic over
the scalar, it *defines* the minimal numeric interface it needs, split into
two traits ([Chapter 2](/garust/part-1-foundations/the-multivector)):

```rust
pub trait Scalar: Copy + /* ops */ + PartialOrd {
    const ZERO: Self;
    const ONE: Self;
    fn from_f64(x: f64) -> Self;   // for tolerances and literals
    fn abs(self) -> Self;
}

pub trait Real: Scalar {           // only what exp() needs
    fn sqrt(self) -> Self;
    fn sin(self) -> Self;  fn cos(self) -> Self;
    fn sinh(self) -> Self; fn cosh(self) -> Self;
}
```

The **split is deliberate and instructive**: `Scalar` is the *ring/field*
interface (arithmetic, identities, ordering, `abs`) — everything the
products, involutions, and inverse need. `Real` adds only the
*transcendental* functions, used by exactly one method, `exp`
([Chapter 13](/garust/part-4-engine/products-as-bit-tricks)). Why separate
them? So a coefficient type that *can't* define `sin` — a rational, an
exact symbolic number — can still drive the entire product algebra; it just
can't build rotors. Splitting the trait by *which methods need which
capabilities* lets the most-restricted scalar do the most it can. That's a
generic-design principle far beyond GA: **require the least, in the
narrowest trait, at each use site.**

## 5. Concrete aliases

Generics are powerful but verbose; nobody wants to write
`Multivector::<f64, 3, 0, 0, 8>::basis(1)`. So `garust` ships **concrete
type aliases** — an `f64` family and an `f32` twin:

```rust
pub type Vga3 = Multivector<f64, 3, 0, 0, 8>;    // 3D Euclidean
pub type Pga3 = Multivector<f64, 3, 0, 1, 16>;   // 3D Projective
pub type Sta  = Multivector<f64, 1, 3, 0, 16>;   // Spacetime
pub type Vga3f = Multivector<f32, 3, 0, 0, 8>;   // …and f32 twins
```

These pin down `DIM` (so the const-assert is satisfied and invisible) and
eliminate turbofish at call sites — `Vga3::basis(1)` just works. And
because the signature lives in the *type*, `Vga3` and `Sta` are **distinct
types**: the compiler refuses to add a Euclidean vector to a spacetime one.
The aliases give the ergonomics of concrete types while the one generic
definition does all the work — *define once, alias for every use*.

## 6. Generic impls vs pinned impls

Here's a lovely use of `const` generics most Rust devs haven't seen:
**method availability that depends on the signature**. Most of `garust`'s
methods are implemented for *all* signatures:

```rust
impl<T: Scalar, const P: usize, const Q: usize, const R: usize, const DIM: usize>
    Multivector<T, P, Q, R, DIM> { /* products, grades, involutions … */ }
```

But the **PGA constructors** only make sense in $Cl(3,0,1)$, so they're
implemented on a block *pinned to those exact const values*:

```rust
// point/plane/line_through exist ONLY for Cl(3,0,1), 16 blades:
impl<T: Scalar> Multivector<T, 3, 0, 1, 16> {
    pub fn point(x: T, y: T, z: T) -> Self { /* … */ }
    pub fn plane(a: T, b: T, c: T, d: T) -> Self { /* … */ }
}
```

So `Pga3::point(1.0, 2.0, 3.0)` compiles, but `Vga3::point(...)` is a
*type error* — `point` doesn't exist on $Cl(3,0,0)$. The const parameters
act like a poor man's specialization: behavior gated by the exact algebra,
checked at compile time. (The `Real` bound does the same trick for `exp` —
available only when the scalar has transcendental functions.) Pinning impls
to specific const values is how you say "this operation only exists for
*this* configuration."

## 7. Operator overloading and the coherence dance

`garust` overloads `+`, `-`, unary `-`, and `*` so multivectors feel like
numbers. The linear ops are componentwise and unremarkable. But **scalar
multiplication exposes a classic Rust coherence problem** worth studying.

The *right* side is easy — implement `Mul<T>` for the multivector,
generically:

```rust
impl<T: Scalar, /* consts */> Mul<T> for Multivector<T, P, Q, R, DIM> {
    fn mul(mut self, rhs: T) -> Self { /* scale each coeff */ }
}                                    // v * 2.0  ✓
```

But the *left* side — `2.0 * v` — you *cannot* write generically. The
obvious `impl<T: Scalar> Mul<Multivector<T, …>> for T` is **forbidden by
the orphan rule**
([the Rust book's coherence](/garust/table-of-contents)): `T` is a type
parameter, not a type you own, so a blanket impl on it would let downstream
crates collide. The fix is a **macro that implements it per concrete
scalar**:

```rust
macro_rules! impl_left_scalar_mul {
    ($t:ty) => {
        impl<const P: usize, /* … */> Mul<Multivector<$t, P, Q, R, DIM>> for $t {
            fn mul(self, rhs: Multivector<$t, …>) -> _ { rhs * self }
        }
    };
}
impl_left_scalar_mul!(f32);
impl_left_scalar_mul!(f64);
```

Because `f64` is a concrete type, `impl Mul<…> for f64` *is* allowed (you
own the impl for a known type). So `2.0 * v` works for `f64` and `f32`, but
a *custom* scalar would need to add its own one-line impl. This is the
real-world tax of Rust's coherence rules, and the standard escape hatch
(macro over concrete types) — a pattern you'll meet whenever you want
`scalar * yourtype`.

> :surprisedgoose: The `2.0 * v` problem catches every Rust numeric-library
> author eventually, and it's *not* a flaw you can engineer around — it's
> coherence working as designed. `v * 2.0` (your type on the left) is
> yours to implement generically; `2.0 * v` (a foreign type, `f64`, on the
> left) is not, because `impl<T> Mul<MyType<T>> for T` would let two crates
> define conflicting impls for the same `T`. The blanket impl is *unsound*
> at the ecosystem level, so the compiler forbids it — and the only legal
> route is to enumerate the concrete left-hand types you support
> (`f32`, `f64`) via a macro. It feels like a wart, but it's the price of
> "adding a dependency can never silently change which impl you get." Every
> Rust math lib has this macro.

## 8. The architecture, distilled

`garust`'s design is a tight set of decisions that compound:

- **One generic type**, `Multivector<T, P, Q, R, DIM>` — the whole library
  is methods on it.
- **Dense `[T; DIM]`** storage — right for the small-$N$ algebras GA uses;
  fast, stack-friendly, simple.
- **Signature in the type** via `const` generics, with the **`_DIM_CHECK`
  const-assert** working around the const-expression limit, and **aliases**
  hiding the redundant `DIM`.
- **Zero dependencies** via a hand-rolled **`Scalar`/`Real` trait split** —
  require the least capability in the narrowest trait.
- **Pinned impls** (`Multivector<T, 3, 0, 1, 16>`, the `Real` bound) give
  **signature-gated** methods — compile-time "specialization."
- **Operator overloading** with the **coherence-driven macro** for
  `scalar * multivector`.

Each is a transferable Rust-design lesson, not a GA-specific hack. The next
chapter zooms into the hottest code — the products — and the bit tricks
that make them fast and (mostly) compile-time.

> :weightliftinggoose: This chapter is a generic-Rust masterclass disguised
> as GA. Take away: **one type configured by generics** beats a zoo of
> classes; **`const` generics put config in the type** (with the
> `_DIM_CHECK` forced-assert trick when const *expressions* won't compile);
> **define your own narrow numeric traits** for zero-dep genericity, split
> by capability (`Scalar` vs `Real`); **pin impls to const values** for
> signature-gated methods; and know the **`scalar * type` coherence macro**
> — you *will* need it. None of this is exotic; it's the toolkit for any
> serious generic library. Read `multivector.rs` alongside this and it'll
> click.

## What we covered

- The whole library is **one generic type**, `Multivector<T, P, Q, R, DIM>`
  — every operation is a method/impl on it (a rotor is just a multivector).
- **Dense `[T; DIM]`** storage is chosen for **small-$N$** algebras (≤32
  blades): faster and simpler than sparse; the trade-off (bad for large
  $N$) is explicit.
- **`DIM` is redundant** ($2^{P+Q+R}$) because stable Rust can't evaluate
  the shift in array-length position; a **forced `const` assertion**
  (`_DIM_CHECK`, referenced in `zero()`) catches mismatches at compile
  time, and **aliases** hide it.
- **Zero dependencies**: hand-rolled **`Scalar`** (ring/field) and
  **`Real`** (transcendentals, only for `exp`) traits — require the least
  in the narrowest trait.
- **Concrete aliases** (`Vga3`, `Pga3`, `Sta`, …) give ergonomic, distinct
  types over the one definition.
- **Pinned impls** (e.g. `Multivector<T, 3, 0, 1, 16>` for PGA
  constructors, the `Real` bound for `exp`) gate methods by signature —
  compile-time specialization.
- **Operator overloading**: `Mul<T>` (right scalar) is generic; **left
  scalar `2.0 * v` needs a per-concrete-type macro** because the orphan
  rule forbids the blanket impl.

## What's next

[Chapter 13](/garust/part-4-engine/products-as-bit-tricks) — the products
as bit tricks. Inside the hot path: the geometric product as a
compile-time-computable `blade_product` (XOR + reordering parity + metric),
the $O(\text{DIM}^2)$ `Mul` loop, the involutions as grade-pattern sign
flips, and the closed-form `exp` whose three branches *are* rotation,
boost, and translation.
