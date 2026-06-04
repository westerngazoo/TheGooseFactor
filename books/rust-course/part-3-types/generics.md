---
sidebar_position: 4
title: "Generics"
---

# Generics

> Write code once, for many types. **Generics** let a function, struct,
> or enum work over *any* type — with **trait bounds**
> ([Chapter 10](/rust/part-3-types/traits)) specifying what those types
> must be able to do. And it's **zero-cost**: the compiler generates
> specialized concrete code, so generic Rust runs as fast as
> hand-written.

Generics are the second half of Rust's abstraction toolkit. Traits say
*what behavior* a type has; generics let you write code parameterized
over *which* type. You've already used generics constantly —
`Vec<T>`, `Option<T>`, `Result<T, E>` are all generic — and now you'll
write your own.

## 1. Generic functions

A generic function takes a **type parameter** (conventionally `T`) in
angle brackets. This `largest` works for any type you can compare:

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut biggest = &list[0];
    for item in list {
        if item > biggest { biggest = item; }   // needs `>`, hence PartialOrd
    }
    biggest
}

largest(&[3, 7, 2, 9, 4]);                       // works on i32
largest(&["pear", "apple", "fig"]);              // works on &str
```

`<T: PartialOrd>` reads "for any type `T` that can be ordered." The bound
isn't decoration — it's what lets the body use `>`. A generic function
may only do to `T` what its bounds permit; that's what keeps generics
type-safe.

## 2. Bounds: what generics rely on

Without a bound, `T` is *completely opaque* — you can move it and drop
it, but not compare, print, add, or clone it, because not every type
supports those. **Trait bounds unlock capabilities**:

```rust
use std::fmt::Display;

fn announce<T: Display + Clone>(item: T) {
    let copy = item.clone();          // allowed: T: Clone
    println!("Announcing: {item}");   // allowed: T: Display
}
```

Each bound you add lets the body use that trait's methods. This is the
deep symmetry with traits ([Chapter 10](/rust/part-3-types/traits)):
generics provide the *type variable*, bounds provide the *contract* of
what it can do. Pile up bounds with `+`, or move them to a `where` clause
for readability.

## 3. Generic structs and enums

Types can be generic too — a struct or enum parameterized over the types
it holds:

```rust
struct Pair<T> {
    first: T,
    second: T,
}

struct Wrapper<T, U> {     // multiple type parameters
    a: T,
    b: U,
}

let p = Pair { first: 1, second: 2 };          // Pair<i32>
let w = Wrapper { a: "x", b: 3.0 };            // Wrapper<&str, f64>
```

This is exactly how the standard library defines `Vec<T>` (a vector of
*any* `T`), `Option<T>`, and `HashMap<K, V>`. You write the data
structure once and it works for every element type — no copy-paste per
type, no loss of type safety.

## 4. Generic methods, with extra bounds

`impl` blocks can be generic, and you can add methods that exist *only*
for certain type arguments:

```rust
impl<T> Pair<T> {
    fn first(&self) -> &T { &self.first }       // for ALL Pair<T>
}

impl<T: PartialOrd + Display> Pair<T> {
    fn show_larger(&self) {                     // ONLY when T is comparable+printable
        if self.first >= self.second {
            println!("larger is {}", self.first);
        } else {
            println!("larger is {}", self.second);
        }
    }
}
```

`first()` exists for every `Pair<T>`; `show_larger()` exists only when
`T` can be compared and printed. This **conditional implementation** lets
a type expose more capability as its parameters gain capability — a
precise, compiler-checked form of "this method is available when it makes
sense."

## 5. Monomorphization: zero-cost

Here's the magic that makes generics free. At compile time, Rust
**monomorphizes**: for each concrete type a generic is used with, it
generates a specialized copy with the type filled in:

```rust
let a = largest(&[1, 2, 3]);          // compiler generates largest_i32
let b = largest(&[1.0, 2.0, 3.0]);    // and largest_f64
```

The running program has no "generic" code, no type tags, no runtime
dispatch — just ordinary `largest_i32` and `largest_f64`, each as fast as
if you'd written it by hand. This is **static dispatch**: the type is
resolved at compile time. Generics cost *nothing* at runtime.

> :nerdygoose: Monomorphization is why Rust generics are *zero-cost*,
> unlike approaches that pay at runtime. Java erases generics to `Object`
> and inserts casts and boxing; Go's earlier interface-based generics
> dispatched dynamically. Rust stamps out a specialized, fully-optimized
> version per concrete type — the abstraction evaporates in codegen,
> exactly the "zero-cost abstraction" promise from
> [Chapter 1](/rust/part-1-getting-started/why-rust). The trade-off is
> compile time and binary size (more code generated), which is the price
> for that runtime speed.

## 6. Generics vs trait objects, again

Because generics monomorphize, they're the *static dispatch* side of the
choice from [Chapter 10](/rust/part-3-types/traits):

- **Generics** (`fn f<T: Trait>`): a specialized copy per type, resolved
  at compile time, zero-cost, fully inlinable — but each `T` is its own
  type (no mixing in one collection), and more code is generated.
- **Trait objects** (`dyn Trait`): one copy, runtime vtable dispatch,
  heterogeneous collections, smaller code — but a pointer indirection per
  call and no inlining across it.

The everyday guidance holds: **default to generics** for performance and
flexibility; switch to `dyn Trait` when you need a collection of mixed
concrete types or want to curb code bloat. Same behavior, different
cost/capability trade — and Rust makes you pick deliberately.

## 7. Associated types and where generics meet traits

A glimpse of how deep this goes: traits can have **associated types** —
a type the implementor chooses — which often reads more cleanly than an
extra generic parameter. The canonical example is `Iterator`
([Chapter 14](/rust/part-4-data/iterators-and-closures)):

```rust
trait Iterator {
    type Item;                          // associated type: what it yields
    fn next(&mut self) -> Option<Self::Item>;
}
```

Each iterator picks its `Item` once (a `Vec<i32>` iterator yields `i32`).
Associated types vs generic parameters is "one implementation per type"
vs "many" — a design choice you'll grow into. The point for now: traits
and generics are deeply intertwined. Bounds connect them, associated
types let traits carry types, and together they're Rust's whole story for
abstraction without runtime cost.

## 8. The whole picture

Step back and see Part III as one system:

- **Structs/enums** ([Ch 8](/rust/part-3-types/structs-and-enums)) model
  data (AND / OR).
- **Pattern matching** ([Ch 9](/rust/part-3-types/pattern-matching)) takes
  it apart, exhaustively.
- **Traits** ([Ch 10](/rust/part-3-types/traits)) abstract behavior.
- **Generics** abstract over types, with **trait bounds** stating
  requirements, all **monomorphized** to zero-cost concrete code.

That combination — algebraic data types, exhaustive matching, traits for
behavior, generics for type-abstraction — is how Rust gives you
high-level expressiveness *and* C-level performance at the same time. No
GC, no runtime dispatch you didn't ask for, no loss of type safety.

> :weightliftinggoose: Generics + trait bounds are the everyday shape of
> reusable Rust: `fn f<T: Bound>(...)` and `struct S<T>`. The mantra:
> **a generic can only do to `T` what its bounds allow**, so add the
> bound for each capability the body needs. Trust **monomorphization** —
> generic code is *free* at runtime, so reach for it by default and drop
> to `dyn Trait` only for mixed-type collections. With Parts II and III
> in hand — ownership plus structs/enums/traits/generics — you can model
> and abstract almost anything in Rust safely and fast.

## What we covered

- **Generics** parameterize functions, structs, and enums over types
  (`<T>`); `Vec<T>`, `Option<T>`, `HashMap<K, V>` are generic.
- **Trait bounds** (`<T: Trait>`) unlock capabilities: a generic may only
  use what its bounds permit — the symmetry with traits.
- **Generic structs/enums** define a data structure once for every
  element type; **generic `impl`s** can add methods only for certain `T`
  (conditional implementation).
- **Monomorphization** generates a specialized copy per concrete type —
  **static dispatch**, **zero runtime cost**, at the price of compile
  time / binary size.
- Generics (static dispatch) vs **trait objects** (`dyn`, dynamic
  dispatch) is the same trade as Ch 10: prefer generics; use `dyn` for
  mixed-type collections.
- **Associated types** let traits carry a chosen type (`Iterator::Item`);
  traits and generics are deeply intertwined.
- Part III as a whole: model (structs/enums) → destructure (match) →
  abstract behavior (traits) → abstract types (generics) = expressive *and*
  fast.

## What's next

That's Part III. [Part IV](/rust/part-4-data/error-handling) covers
**error handling and collections** — putting types to work: `Result`,
`Option`, and the `?` operator for robust errors, then the standard
collections, iterators and closures, and smart pointers.
