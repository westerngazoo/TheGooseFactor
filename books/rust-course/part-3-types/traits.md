---
sidebar_position: 3
title: "Traits"
---

# Traits

> Shared behavior, without inheritance. A **trait** is a set of methods a
> type can implement — Rust's version of an interface. Traits power
> generics, operator overloading, `derive`, and most of the standard
> library. They're how Rust does polymorphism, and they replace
> class-based inheritance entirely.

Structs and enums ([Chapter 8](/rust/part-3-types/structs-and-enums))
model data. **Traits** model *behavior*: "any type that can do X." If
you've used interfaces (Java, Go) or typeclasses (Haskell), traits will
feel familiar — but they go further, and Rust has no inheritance at all,
so traits carry the full weight of abstraction.

## 1. Defining and implementing a trait

A trait declares method signatures; a type provides them in an `impl
Trait for Type` block:

```rust
trait Summary {
    fn summarize(&self) -> String;      // a required method (signature only)
}

struct Article { title: String, body: String }

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}: {}...", self.title, &self.body[0..20])
    }
}

let a = Article { /* ... */ };
println!("{}", a.summarize());          // call the trait method
```

`Summary` says "a summarizable thing has a `summarize` method." `Article`
*implements* it. Any number of types can implement the same trait, and
one type can implement many traits — behavior is mixed in, not inherited.

## 2. Default methods

A trait can provide **default** implementations, which implementors get
for free (and may override):

```rust
trait Summary {
    fn summarize(&self) -> String;
    fn preview(&self) -> String {                 // default method
        format!("Read more: {}", self.summarize())
    }
}
```

Implement only `summarize`, and `preview` comes along automatically.
Defaults can call other (even un-implemented) trait methods, letting a
trait define rich behavior on top of a small required core — the pattern
behind much of the standard library (e.g. `Iterator`'s dozens of methods
built on one required `next`, [Chapter 14](/rust/part-4-data/iterators-and-closures)).

## 3. Traits as parameters: bounds

To accept "any type that implements `Summary`," use a **trait bound**.
Three equivalent spellings, increasingly explicit:

```rust
fn notify(item: &impl Summary) { /* ... */ }          // impl Trait (concise)

fn notify<T: Summary>(item: &T) { /* ... */ }          // generic with bound

fn notify<T>(item: &T) where T: Summary { /* ... */ }  // where-clause
```

All three mean "`item` can be any type that implements `Summary`, and
inside the function you may call its `Summary` methods." Bounds combine
with `+` (`T: Summary + Clone`) and move to a `where` clause when they
pile up. This is the bridge to generics
([Chapter 11](/rust/part-3-types/generics)): a trait bound is how a
generic function says *what it needs* from its type parameter.

## 4. Returning impl Trait

You can also return "some type implementing a trait" without naming it —
handy for closures and iterators, whose concrete types are unwieldy or
unnameable:

```rust
fn make_adder(n: i32) -> impl Fn(i32) -> i32 {
    move |x| x + n            // returns a closure; its exact type is hidden
}
```

`impl Trait` in return position says "I return *a* type that implements
`Fn(i32) -> i32`; you don't need to know which." It's static (one
concrete type per call site) and zero-cost — the opposite trade-off from
trait objects (§6).

## 5. Generic methods and blanket impls

Trait bounds let you implement behavior for *whole categories* of types
at once. A **blanket implementation** implements a trait for every type
satisfying some bound:

```rust
trait Loud {
    fn shout(&self) -> String;
}

// Implement Loud for EVERY type that is Display:
impl<T: std::fmt::Display> Loud for T {
    fn shout(&self) -> String {
        format!("{}!!!", self).to_uppercase()
    }
}

println!("{}", 42.shout());        // works: i32 is Display
println!("{}", "hi".shout());      // works: &str is Display
```

The standard library uses this heavily (e.g. anything `Display` is
automatically `ToString`). Blanket impls give you sweeping, type-safe
extension with no per-type boilerplate.

## 6. Trait objects: dynamic dispatch

Sometimes you want a *collection of different types* that share a trait —
a `Vec` of mixed shapes that can all `area()`. For that you need a
**trait object**, written `dyn Trait`, usually behind a pointer
(`&dyn`, `Box<dyn>`):

```rust
trait Draw { fn draw(&self); }

let shapes: Vec<Box<dyn Draw>> = vec![
    Box::new(Circle { /* ... */ }),
    Box::new(Square { /* ... */ }),
];
for s in &shapes {
    s.draw();        // dynamic dispatch: the right draw() chosen at runtime
}
```

A trait object erases the concrete type and dispatches through a vtable
at runtime — like virtual methods in other languages. Contrast with
generics/`impl Trait`, which pick the concrete type at *compile* time:

- **Generics (`<T: Trait>`, `impl Trait`)**: **static dispatch**,
  monomorphized, zero runtime cost, but each type is separate — can't mix
  types in one collection.
- **Trait objects (`dyn Trait`)**: **dynamic dispatch**, one vtable
  lookup per call, but heterogeneous collections and smaller code.

Reach for generics by default; use `dyn` when you genuinely need a
mixed-type collection or to keep code size down.

> :nerdygoose: "Static vs dynamic dispatch" is the same trade other
> languages make, but Rust makes the choice *explicit and visible in the
> type*. `<T: Draw>` compiles a specialized copy per type (fast, bigger
> binary); `dyn Draw` compiles one copy that dispatches through a vtable
> (smaller, one indirection per call). C++ templates vs virtual, Java
> generics vs interfaces — same dichotomy, but in Rust you *see* which
> you're getting from the syntax, and the zero-cost one is the default.

## 7. Deriving and standard traits

Many standard traits can be `#[derive]`d
([Chapter 8](/rust/part-3-types/structs-and-enums)), and implementing the
standard ones plugs your type into the language:

- **`Debug`** — `{:?}` formatting (derive almost always).
- **`Clone`/`Copy`** — explicit deep copy / implicit bitwise copy.
- **`PartialEq`/`Eq`** — `==`. **`PartialOrd`/`Ord`** — `<`, sorting.
- **`Default`** — a `default()` value.
- **`Display`** — user-facing `{}` (hand-written, not derived).
- **`Iterator`** ([Chapter 14](/rust/part-4-data/iterators-and-closures)),
  **`From`/`Into`** (conversions), **`Add`** etc. (operator overloading).

Implementing `Iterator` makes your type work in `for` loops;
implementing `Add` makes `+` work; implementing `From` enables `.into()`
conversions and the `?` operator ([Chapter 12](/rust/part-4-data/error-handling)).
Traits *are* the language's extension points.

## 8. The orphan rule and why no inheritance

One coherence rule to know: you can implement a trait for a type only if
**you own the trait or the type** (the **orphan rule**). This prevents
two crates from defining conflicting impls for the same pair, keeping
trait resolution unambiguous. (When you need to implement a foreign trait
for a foreign type, wrap it in a **newtype**,
[Chapter 8](/rust/part-3-types/structs-and-enums).)

And the bigger picture: Rust deliberately has **no inheritance**. Instead
of an "is-a" class hierarchy, you compose behavior from traits ("can-do")
and share code via default methods and generics. This sidesteps the
fragile-base-class and diamond problems of inheritance, and it's usually
more flexible: a type opts into exactly the behaviors it needs, from
anywhere, without being locked into a single parent.

> :weightliftinggoose: Traits are how you abstract in Rust — lock in the
> core moves: define behavior with `trait`, supply it with `impl Trait
> for Type`, share defaults, and constrain generics with **trait
> bounds** (`<T: Trait>`). Default to **static dispatch** (generics /
> `impl Trait`, zero-cost) and reach for **`dyn Trait`** only when you
> need a mixed-type collection. Implement the standard traits (`Debug`,
> `Clone`, `Display`, `From`, `Iterator`) to plug into the language.
> "Compose behavior with traits" replaces "inherit from a base class" —
> and it's the cleaner tool.

## What we covered

- A **trait** declares shared behavior (method signatures); types provide
  it via **`impl Trait for Type`**. A type can implement many traits.
- **Default methods** give implementors free behavior built on a small
  required core (e.g. `Iterator`).
- **Trait bounds** (`impl Trait`, `<T: Trait>`, `where`) accept "any type
  that does X" — the bridge to generics.
- **`impl Trait` in return position** returns an unnamed type (closures,
  iterators), zero-cost.
- **Blanket impls** implement a trait for every type meeting a bound.
- **Trait objects (`dyn Trait`)** give runtime **dynamic dispatch** and
  heterogeneous collections; generics give compile-time **static
  dispatch** (zero-cost). Prefer generics; use `dyn` for mixed types.
- **Standard traits** (`Debug`, `Clone`, `Display`, `From`, `Iterator`,
  `Add`...) are the language's extension points.
- The **orphan rule** keeps impls coherent; Rust has **no inheritance** —
  compose behavior from traits instead.

## What's next

[Chapter 11](/rust/part-3-types/generics) — generics. Trait bounds were
half the story; generics are the other half: writing code that works for
*many* types, with the bounds specifying what those types must be able to
do — all monomorphized to zero-cost concrete code.
