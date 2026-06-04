---
sidebar_position: 3
title: "Typestate and Zero-Cost Design"
---

# Typestate and Zero-Cost Design

> The type system isn't just a checker — it's a **design tool**. With the
> **newtype** pattern, **zero-sized types**, **const generics**, **phantom
> types**, and the **typestate** pattern, you can encode invariants so
> that illegal states won't even *compile* — turning runtime bugs into
> compile errors, at zero runtime cost. This is Rust's design philosophy in
> its purest form.

The recurring theme of [Part III](/rust/part-3-types/structs-and-enums) was
"make illegal states unrepresentable." This chapter is that idea taken to
its limit: using types not merely to *catch* bugs but to *forbid* whole
categories of them structurally. These techniques cost nothing at runtime
(types are erased) and move correctness from "we tested for it" to "it
can't be written."

## 1. The newtype pattern

The simplest and most-used tool: wrap an existing type in a one-field tuple
struct to give it a **distinct identity**:

```rust
struct Meters(f64);
struct Seconds(f64);

fn speed(d: Meters, t: Seconds) -> f64 { d.0 / t.0 }
// speed(Seconds(5.0), Meters(10.0))  // COMPILE ERROR: types don't match
```

A `Meters` is not a `Seconds`, even though both wrap `f64` — so you *cannot*
pass them in the wrong order or add them by accident. The newtype:

- **Prevents unit/identity confusion** (the Mars Climate Orbiter bug, in
  the type system).
- **Enables foreign trait impls** ([Chapter 24](/rust/part-7-advanced-types/advanced-traits))
  — wrap a foreign type to implement a foreign trait.
- **Hides representation** — expose only the methods you choose.
- **Costs nothing** — the wrapper compiles away; `Meters(5.0)` is just an
  `f64` at runtime.

Newtypes are the cheapest correctness win in Rust: a few keystrokes to make
a class of mistakes unrepresentable.

## 2. Zero-sized types

A type with **no fields** occupies **zero bytes** — a **zero-sized type
(ZST)**. Unit structs (`struct Marker;`), `PhantomData`
([Chapter 25](/rust/part-7-advanced-types/advanced-lifetimes-and-variance)),
and `()` are ZSTs:

```rust
struct Meters;          // zero-sized — a pure type-level tag
```

ZSTs exist *only at compile time* — they carry information for the type
system with **no runtime footprint**. A `Vec<()>` tracks a count with no
element storage; a `HashSet<T>` is a `HashMap<T, ()>` where the `()` values
cost nothing. ZSTs are the foundation of the phantom-type and typestate
techniques below: they let you attach a *type-level state* to a value
without adding a single byte. Information that exists for the compiler and
vanishes for the machine — the essence of zero-cost.

## 3. Phantom types

Combine a ZST marker (via `PhantomData`) with a type parameter to tag a
value with a **compile-time-only state or category**:

```rust
use std::marker::PhantomData;

struct Verified;        // ZST tags
struct Unverified;

struct Email<State> {
    address: String,
    _state: PhantomData<State>,    // the State exists only in the type
}

impl Email<Unverified> {
    fn verify(self) -> Email<Verified> { /* ... */ }   // consumes, returns Verified
}
impl Email<Verified> {
    fn send(&self) { /* only a Verified email can be sent */ }
}
```

Now `send` exists *only* on `Email<Verified>`. You **cannot call `send` on
an unverified email** — it's a compile error, not a runtime check. The
`State` parameter carries no data (it's `PhantomData`), costs nothing, and
yet enforces "verify before send" in the type system. This is **phantom
typing**: encoding a value's *status* in its *type*.

> :surprisedgoose: This is the move that makes people fall in love with
> Rust's type system: you can make "you forgot to verify the email before
> sending" a **compile error**, with **zero runtime cost** and **zero
> runtime data**. The `Verified`/`Unverified` distinction exists only at
> compile time — it's erased entirely in the binary — yet it forbids an
> entire class of bug *structurally*. You're not testing for the mistake or
> documenting "please verify first"; you're making the mistake
> *unrepresentable*. The compiler becomes a proof checker for your domain's
> rules, for free.

## 4. The typestate pattern

Generalize phantom types to a **state machine encoded in types** — the
**typestate** pattern. Each state is a type; each transition is a method
that **consumes** the value in one state and **returns** it in another:

```rust
struct Connection<State> { /* ... */ _state: PhantomData<State> }
struct Closed;  struct Open;  struct Authenticated;

impl Connection<Closed> {
    fn open(self) -> Connection<Open> { /* ... */ }
}
impl Connection<Open> {
    fn authenticate(self, creds: Creds) -> Connection<Authenticated> { /* ... */ }
}
impl Connection<Authenticated> {
    fn query(&self, q: &str) -> Result<Rows, Error> { /* ... */ }
}
```

You can only `query` an `Authenticated` connection; you can only
`authenticate` an `Open` one; you can only `open` a `Closed` one. Calling
them out of order is a **compile error**. The protocol's state machine —
"open, then auth, then query" — is enforced by the types, not by runtime
checks or documentation. Because each transition *consumes* `self`
([ownership](/rust/part-2-ownership/ownership-and-moves)), you also can't
use a connection in a stale state. The valid sequences of operations are
exactly the programs that compile.

## 5. The builder pattern (and typed builders)

A practical application: the **builder** pattern constructs a complex object
step by step, and typestate can make it *impossible to build an invalid
one*:

```rust
let server = ServerBuilder::new()
    .host("localhost")       // each setter returns the builder
    .port(8080)
    .build();                // produces the configured Server
```

A plain builder is ergonomic; a **typed builder** uses phantom types
(§3) so that `build()` only exists once all *required* fields are set —
forgetting `.host(...)` becomes a compile error rather than a runtime panic
or a bad default. This combines the newtype, phantom-type, and
ownership-consuming techniques into the standard way to construct
configurable objects safely in Rust. Many crates generate typed builders
with a `derive` macro ([Chapter 21](/rust/part-6-ecosystem/macros)).

## 6. Const generics

Types can be parameterized by **constant values**, not just types —
**const generics**, written `<const N: usize>`. The headline use is arrays
of a length known at compile time:

```rust
fn sum<const N: usize>(arr: [i32; N]) -> i32 {   // works for any fixed length
    arr.iter().sum()
}

struct Matrix<const R: usize, const C: usize> {  // dimensions in the type
    data: [[f64; C]; R],
}
// Matrix<2, 3> and Matrix<3, 2> are DIFFERENT types — can't be confused
```

Now array length and matrix dimensions are part of the *type*, so the
compiler checks them: you can't add a `Matrix<2, 3>` to a `Matrix<3, 2>`,
and `[T; N]` operations are length-checked. Const generics push more facts
("this array has exactly N elements," "these dimensions match") into
compile-time checking — dimensional correctness with zero runtime cost.

## 7. Sealed traits and other guards

A few more type-level guard techniques:

- **Sealed traits**: a trait you let others *use* as a bound but not
  *implement* (by requiring a private supertrait) — so you can add methods
  without breaking downstream code. The standard pattern for "this trait is
  closed."
- **`#[non_exhaustive]`**: mark a struct/enum so downstream code can't
  exhaustively match or construct it without a wildcard — lets you add
  variants/fields later without a breaking change.
- **Making constructors private** + factory functions: control exactly how
  a type can be created (enforce invariants at construction).

These are API-design tools: they encode *who can do what* with your types
into the type system, so misuse is a compile error and your library can
evolve without breaking users.

## 8. The philosophy: types as proofs

Step back to the unifying idea: in Rust, a well-designed type is a
**proof**. A value of type `Email<Verified>` is *proof* the email was
verified. A `Connection<Authenticated>` is *proof* the connection is
authenticated. A `Meters` is *proof* the number is a length. The compiler
checks these proofs, so code that *has* the value can *rely* on the
property — no defensive runtime checks, no "what if it wasn't validated."

This is the design mindset that distinguishes expert Rust: don't *check*
that something is valid and hope every code path remembers — make the valid
state a *type*, so only valid states exist. "Parse, don't validate";
"make illegal states unrepresentable"; "the type is the proof." It's the
same bargain as the whole language ([Part II](/rust/part-2-ownership/ownership-and-moves))
— do the work at compile time, get correctness for free at runtime — applied
to *your* domain logic, not just memory. And it all costs **zero** at
runtime, because types are erased.

> :weightliftinggoose: This chapter is Rust's design soul: **encode
> invariants in types so illegal states won't compile** — at zero runtime
> cost. The toolkit: **newtypes** (distinct identity — units, validation,
> foreign impls); **zero-sized types** (compile-time tags, no bytes);
> **phantom types** (`Email<Verified>` — status in the type); the
> **typestate** pattern (a state machine where transitions consume `self`
> — query only when `Authenticated`); **typed builders** (`build()` only
> when valid); and **const generics** (`Matrix<2,3>` — dimensions checked).
> The mantra: **a type is a proof**. Don't validate-and-hope; make the bad
> state unrepresentable.

## What we covered

- **Newtype** pattern: wrap a type for distinct identity — prevents
  unit/identity confusion, enables foreign trait impls, hides
  representation, **zero cost**.
- **Zero-sized types** (unit structs, `PhantomData`, `()`) carry
  compile-time information with **no runtime footprint**.
- **Phantom types** (`Email<Verified>` via `PhantomData`) encode a value's
  *status* in its *type* — `send` exists only on `Verified`, enforced at
  compile time.
- The **typestate** pattern encodes a **state machine in types**:
  transitions consume `self` and return a new state; out-of-order calls
  don't compile.
- **Typed builders** make `build()` available only when all required
  fields are set — invalid construction won't compile.
- **Const generics** (`<const N: usize>`) put values (array lengths, matrix
  dims) into types for compile-time checking.
- **Sealed traits**, **`#[non_exhaustive]`**, and private constructors
  control how types are used/created for safe API evolution.
- The philosophy: **a type is a proof** — make illegal states
  unrepresentable, do it at compile time, pay nothing at runtime.

## What's next

[Chapter 27](/rust/part-7-advanced-types/advanced-unsafe-and-ffi) —
advanced unsafe and FFI. The `unsafe` of
[Chapter 19](/rust/part-5-concurrency/unsafe-rust), gone deep: the **safety
contract** and how to write *sound* abstractions over unsafe code, raw
pointers, `unsafe impl Send`/`Sync`, and the **foreign function interface**
for calling C and being called by it.
