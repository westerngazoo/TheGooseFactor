---
sidebar_position: 1
title: "Advanced Traits"
---

# Advanced Traits

> Traits go far deeper than "Rust's interfaces." **Associated types**,
> **supertraits**, **operator overloading**, **marker traits**, the
> coherence rules, and the `dyn`-vs-`impl` choice are the machinery behind
> the standard library and every serious crate. This chapter takes the
> traits of [Chapter 10](/rust/part-3-types/traits) to their working depth.

Welcome to Part VII. The [first six parts](/rust/table-of-contents) built
a complete picture of Rust — ownership, types, concurrency, the ecosystem.
This part goes *deep* on the features that separate "I can write Rust"
from "I can design Rust libraries." We begin with traits, because nearly
every advanced Rust technique is, underneath, a trait technique.

## 1. Associated types vs generic parameters

[Chapter 11](/rust/part-3-types/generics) introduced associated types via
`Iterator`. The design question they answer: should a trait take a type as
a **generic parameter** (`Trait<T>`) or an **associated type**
(`type Item`)? The rule:

- **Generic parameter** (`trait Convert<T>`): a type can implement the
  trait **many times**, once per `T`. (`From<T>` — a type converts from
  many sources.)
- **Associated type** (`trait Iterator { type Item; }`): a type implements
  the trait **once**, choosing `Item` itself. (A `Vec<i32>` iterator yields
  `i32` — there's one right answer.)

```rust
trait Iterator {
    type Item;                          // associated: one Item per impl
    fn next(&mut self) -> Option<Self::Item>;
}
trait From<T> {                          // generic: many impls per type
    fn from(value: T) -> Self;
}
```

Associated types make signatures cleaner (no `T` to thread everywhere) and
enforce "one implementation." Reach for them when the type is *determined
by* the implementor; use a generic parameter when you genuinely want
multiple implementations.

## 2. Supertraits

A trait can **require** another trait — a **supertrait** — so implementors
must also implement the prerequisite, and the trait's methods can rely on
it:

```rust
use std::fmt::Display;

trait Summary: Display {                 // Summary requires Display
    fn summarize(&self) -> String {
        format!("Summary of: {}", self)  // can use Display's `{}` on self
    }
}
```

`Summary: Display` reads "to implement `Summary`, you must also implement
`Display`." Now `Summary`'s default methods can call `Display` machinery.
This is Rust's version of interface inheritance — but it's *composition of
requirements*, not class inheritance. The standard library uses it
heavily: `Ord: PartialOrd`, `Eq: PartialEq`, `Copy: Clone`.

## 3. Operator overloading

Operators are just traits. `a + b` is `a.add(b)` via the `Add` trait;
indexing `a[i]` is `Index`; `*p` is `Deref`. Implement the trait, get the
operator:

```rust
use std::ops::Add;

#[derive(Clone, Copy)]
struct Point { x: i32, y: i32 }

impl Add for Point {
    type Output = Point;                 // associated type: result of +
    fn add(self, other: Point) -> Point {
        Point { x: self.x + other.x, y: self.y + other.y }
    }
}

let p = Point { x: 1, y: 2 } + Point { x: 3, y: 4 };   // uses Add::add
```

The operator traits (`Add`, `Sub`, `Mul`, `Index`, `Neg`, `PartialEq`,
...) live in `std::ops` and `std::cmp`. This is how `String + &str`,
`Vec` indexing, and smart-pointer dereferencing
([Chapter 15](/rust/part-4-data/smart-pointers)) all work — they're trait
impls. Operator overloading in Rust is principled (you can't invent new
operators, only implement the standard ones for your types).

## 4. Marker traits

Some traits have **no methods** — they're **markers** that tell the
compiler a *property* of a type:

- **`Copy`** ([Chapter 4](/rust/part-2-ownership/ownership-and-moves)):
  "this type is bitwise-copyable" — changes move semantics to copy.
- **`Send`/`Sync`** ([Chapter 16](/rust/part-5-concurrency/threads-send-sync)):
  "safe to move/share across threads" — auto-derived from fields.
- **`Sized`**: "this type has a known size at compile time" — implicit on
  almost everything; `?Sized` opts out (for `str`, `[T]`, `dyn Trait`).

Marker traits carry *no behavior*, only *meaning* the compiler enforces.
They're how the type system encodes facts (copyability, thread-safety,
sizedness) that change what's allowed — a pure-type-level signal with no
runtime representation.

> :nerdygoose: Marker traits reveal that a "trait" in Rust is more general
> than an "interface" — it's any *predicate on types* the compiler can
> reason about. `Send` has no methods; it's a *proof* that a type is
> thread-safe, checked structurally. This lets the type system express
> properties ("this is `Copy`," "this is thread-safe," "this has a known
> size") and *enforce* them in bounds (`T: Send`, `T: Sized`). The same
> mechanism that says "this type can be summarized" also says "this type
> can cross a thread boundary." Traits are the language's vocabulary for
> talking about types themselves.

## 5. The orphan rule and coherence, deeper

[Chapter 10](/rust/part-3-types/traits) gave the orphan rule: you may
`impl Trait for Type` only if you own the trait **or** the type. The
reason is **coherence** — Rust guarantees *at most one* impl of a trait for
a type, globally, so trait resolution is never ambiguous. Without the
orphan rule, two crates could define conflicting `impl Display for Vec<T>`
and linking them would be undefined.

When you *need* a foreign trait on a foreign type (e.g. `Display` for
`Vec<T>`), the workaround is the **newtype pattern**
([Chapter 26](/rust/part-7-advanced-types/typestate-and-zero-cost-design)):
wrap it in your own type, which you *do* own:

```rust
struct Wrapper(Vec<String>);             // your type → you can impl foreign traits

impl std::fmt::Display for Wrapper {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}
```

Coherence is occasionally annoying but it's load-bearing: it's why adding
a dependency can never silently change which trait impl your code uses.

## 6. Object safety and dyn vs impl

[Chapter 10](/rust/part-3-types/traits) introduced trait objects
(`dyn Trait`). Not every trait can be a trait object — only **object-safe**
ones. A trait is object-safe roughly when its methods don't return `Self`
and aren't generic (because a `dyn Trait` has erased its concrete type, so
`Self` and per-call type parameters are unknowable):

```rust
trait Draw { fn draw(&self); }           // object-safe → Box<dyn Draw> works
trait Clone2 { fn clone2(&self) -> Self; }  // NOT object-safe (returns Self)
```

This forces the `dyn` vs `impl` choice ([Chapter 11](/rust/part-3-types/generics)):

- **`impl Trait` / generics** — static dispatch, monomorphized, zero-cost,
  works with any trait, but no heterogeneous collections.
- **`dyn Trait`** — dynamic dispatch via vtable, heterogeneous collections,
  but only for object-safe traits and with an indirection cost.

Knowing *why* a trait isn't object-safe (it mentions `Self` or is generic)
turns a confusing error into an obvious one — and points you to the fix
(split the trait, or use generics instead).

## 7. impl Trait everywhere, and GATs

Two modern conveniences worth knowing:

- **`impl Trait` positions**: in argument position (`fn f(x: impl Trait)`,
  sugar for a generic), return position (`fn f() -> impl Trait`, return an
  unnamed type like a closure or iterator), and increasingly in traits
  (`-> impl Trait` in trait methods, e.g. async traits).
- **Generic associated types (GATs)**: associated types that themselves
  take generic/lifetime parameters — `type Item<'a>;` — enabling things
  like a `LendingIterator` that yields items borrowing from itself. They're
  advanced and were a long-awaited feature; you'll meet them in libraries
  before you write them.

These round out the trait system into something genuinely expressive — you
can return closures, write async trait methods, and express lending APIs,
all through traits.

## 8. Traits as the design foundation

Step back: in Rust, **traits are how you design**. Almost every API
decision is a trait decision:

- Abstraction → a trait with the behavior you need.
- Generic code → trait *bounds* stating requirements.
- Extensibility → others `impl YourTrait for TheirType`.
- Operators, conversions, formatting, iteration, async → standard traits.
- Type-level properties → marker traits and bounds.

The rest of Part VII builds on this: lifetimes interact with trait bounds
([Chapter 25](/rust/part-7-advanced-types/advanced-lifetimes-and-variance)),
zero-cost design encodes invariants via traits and types
([Chapter 26](/rust/part-7-advanced-types/typestate-and-zero-cost-design)),
and even unsafe abstractions are bounded by traits like `Send`
([Chapter 27](/rust/part-7-advanced-types/advanced-unsafe-and-ffi)).
Master traits and you've mastered the joints of the language.

> :weightliftinggoose: Traits are the design language of Rust — go past
> "interfaces." Lock in: **associated types** (one impl, type determined by
> implementor) vs **generic params** (many impls); **supertraits**
> (`Trait: Bound`, required prerequisites); **operator overloading** (just
> `std::ops` impls); **marker traits** (`Copy`/`Send`/`Sized` — properties,
> no methods); the **orphan rule** (coherence; newtype to work around it);
> and **object safety** (why some traits can't be `dyn`). When you design
> an API in Rust, you're choosing traits — so know them cold.

## What we covered

- **Associated types** (one impl, implementor chooses the type) vs
  **generic parameters** (many impls); use associated types when the type
  is determined by the implementor.
- **Supertraits** (`Trait: Bound`) require and build on another trait —
  composition of requirements, not inheritance.
- **Operator overloading** is trait impls (`Add`, `Index`, `Deref`, ... in
  `std::ops`/`std::cmp`).
- **Marker traits** (`Copy`, `Send`/`Sync`, `Sized`) carry *properties*,
  not methods — type-level facts the compiler enforces.
- The **orphan rule** guarantees **coherence** (one impl per type/trait
  globally); the **newtype pattern** works around it for foreign
  trait/type pairs.
- **Object safety** (no `Self` return, no generic methods) decides whether
  a trait can be `dyn` — guiding the `dyn` vs `impl`/generics choice.
- **`impl Trait`** in argument/return/trait positions and **GATs** make
  traits more expressive (closures, async traits, lending APIs).
- Traits are the **design foundation** — nearly every Rust API decision is
  a trait decision.

## What's next

[Chapter 25](/rust/part-7-advanced-types/advanced-lifetimes-and-variance)
— advanced lifetimes and variance. The lifetimes of
[Chapter 6](/rust/part-2-ownership/lifetimes) had more to them: **lifetime
subtyping**, **variance** (why `&T` and `&mut T` behave differently under
substitution), **higher-ranked trait bounds** (`for<'a>`), and
`PhantomData` — the machinery behind the trickiest borrow-checker errors.
