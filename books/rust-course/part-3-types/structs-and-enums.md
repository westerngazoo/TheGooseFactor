---
sidebar_position: 1
title: "Structs and Enums"
---

# Structs and Enums

> The two ways to model your own data. **Structs** group related fields
> ("has-a": a point *has* an x and a y). **Enums** express alternatives
> ("is-one-of": a shape *is* a circle or a rectangle). Together with
> their methods, they're how you build domain types in Rust.

Welcome to Part III. Part II gave you ownership; now we use it to build
abstractions. Rust has no classes and no inheritance. Instead you model
data with **structs** (product types — combine fields) and **enums** (sum
types — choose among variants), and attach behavior with `impl` blocks.
This pair is more expressive than it first appears.

## 1. Structs: grouping fields

A **struct** bundles named fields into one type:

```rust
struct User {
    name: String,
    age: u32,
    active: bool,
}

let u = User {
    name: String::from("Ada"),
    age: 36,
    active: true,
};
println!("{} is {}", u.name, u.age);
```

Each `User` *has* a name, an age, and an active flag. Fields are accessed
with `.`, and (like all bindings) the struct is immutable unless declared
`mut`. This is the "has-a" relationship: a struct is a record of data
that belongs together.

## 2. Tuple structs and unit structs

Two leaner variants:

```rust
struct Point(i32, i32);        // tuple struct: fields by position, no names
struct Meters(f64);            // newtype: a single-field wrapper
struct Marker;                 // unit struct: no fields at all

let p = Point(3, 4);
println!("{} {}", p.0, p.1);   // access by index
```

**Tuple structs** name the *type* but not the fields (access by `.0`,
`.1`). The single-field form is the **newtype** pattern — wrap an
existing type to give it a distinct identity (a `Meters(f64)` won't mix
with a `Seconds(f64)`, catching unit-confusion bugs at compile time).
**Unit structs** carry no data and are useful as markers or for
implementing traits.

## 3. Methods and associated functions

You add behavior in an **`impl` block**. Methods take `self` (usually
borrowed); **associated functions** don't take `self` and are called on
the type (constructors, by convention `new`):

```rust
impl User {
    fn new(name: String, age: u32) -> User {   // associated function
        User { name, age, active: true }       // field init shorthand
    }
    fn greet(&self) -> String {                 // method: borrows self
        format!("Hi, I'm {}", self.name)
    }
    fn have_birthday(&mut self) {               // method: mutably borrows self
        self.age += 1;
    }
}

let mut u = User::new(String::from("Ada"), 36);   // :: for associated fns
println!("{}", u.greet());                         // . for methods
u.have_birthday();
```

`&self` is shorthand for `self: &Self` — a method borrows the receiver
just like any other reference ([Chapter 5](/rust/part-2-ownership/borrowing-and-references)),
so `greet` uses `&self` (read) and `have_birthday` uses `&mut self`
(write). A method can also take `self` *by value* to consume the
receiver. There's no privileged "class" — just data plus `impl` blocks.

## 4. Enums: choosing among alternatives

An **enum** defines a type that is *one of* several named variants:

```rust
enum Direction {
    North,
    South,
    East,
    West,
}

let heading = Direction::South;
```

A `Direction` value is exactly one variant. So far this is like a C
enum — but Rust enums are far more powerful, because variants can *carry
data*.

## 5. Enums with data: sum types

Each variant can hold its own data, of different shapes. This makes
enums **sum types** — "one of these, with these contents":

```rust
enum Shape {
    Circle { radius: f64 },             // struct-like variant
    Rectangle { width: f64, height: f64 },
    Triangle(f64, f64),                 // tuple-like variant (base, height)
    Point,                              // no data
}

let s = Shape::Circle { radius: 2.0 };
```

One `Shape` value is a circle *or* a rectangle *or* a triangle *or* a
point — and each carries exactly the data that variant needs. You can't
have a circle with a width, or forget the radius: the type makes illegal
combinations **unrepresentable**. This is the single most useful modeling
tool in Rust.

> :surprisedgoose: Sum types are what most languages *lack*, and you feel
> the absence constantly. Without them you fake "one of these" with a
> tag field plus a pile of maybe-null fields ("if `kind == CIRCLE`, then
> `radius` is set, ignore `width`...") — a convention the compiler can't
> enforce, so the invalid states are all writable and someone eventually
> writes one. A Rust enum makes the alternatives a *type*: each variant
> carries precisely its own data, nothing more, nothing less. Combined
> with `match` ([Chapter 9](/rust/part-3-types/pattern-matching)), which
> forces you to handle every variant, whole categories of "I forgot that
> case" bugs vanish.

## 6. The two enums you already use: Option and Result

Rust's two most important types are *just enums* from the standard
library:

```rust
enum Option<T> {      // a value that might be absent (instead of null)
    Some(T),
    None,
}

enum Result<T, E> {   // success or failure (instead of exceptions)
    Ok(T),
    Err(E),
}
```

`Option<T>` replaces null ([Chapter 1](/rust/part-1-getting-started/why-rust)):
absence is a variant you *must* handle, so there are no null-pointer
dereferences. `Result<T, E>` represents fallibility: you can't ignore the
error case. Both are covered in depth in
[Chapter 12](/rust/part-4-data/error-handling) — the point here is that
they're not magic, just enums with data, like the ones you can define.

## 7. Deriving common behavior

Implementing routine traits by hand is tedious, so `#[derive(...)]`
generates them. The usual suspects: `Debug` (printable with `{:?}`),
`Clone`/`Copy`, `PartialEq` (compare with `==`), `Default`:

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point { x: i32, y: i32 }

let a = Point { x: 1, y: 2 };
let b = a.clone();
println!("{:?}  equal? {}", a, a == b);   // Point { x: 1, y: 2 }  equal? true
```

`derive` is your first taste of traits ([Chapter 10](/rust/part-3-types/traits))
and macros ([Chapter 21](/rust/part-6-ecosystem/macros)): the compiler
writes correct implementations from the field structure. Derive what you
can; hand-implement only when you need custom behavior.

## 8. Struct or enum? The modeling question

A quick rule for choosing:

- Use a **struct** when a thing **has** several pieces of data *at once*
  — a user has a name *and* an age *and* a flag (AND).
- Use an **enum** when a thing **is** exactly one of several
  alternatives — a shape is a circle *or* a rectangle *or* a triangle
  (OR).

Real models combine them: an enum whose variants contain structs, a
struct with enum-typed fields. The discipline of asking "is this an AND
(struct) or an OR (enum)?" — and pushing invalid states out of the type —
is the core of good Rust data design. Make illegal states
unrepresentable, and the compiler becomes your domain-rules checker.

> :weightliftinggoose: Structs and enums are your modeling vocabulary,
> and the instinct to build is **"make illegal states
> unrepresentable."** Ask of every model: is it AND (struct) or OR
> (enum)? Put behavior in `impl` blocks (`&self` to read, `&mut self` to
> write, `Self::new` to construct), and `#[derive(Debug, Clone,
> PartialEq)]` the boilerplate. Enums with data plus `match` are Rust's
> superpower for correctness — lean on them. Next chapter shows how
> `match` makes enums sing.

## What we covered

- **Structs** group named fields ("has-a", AND); also **tuple structs**
  (positional), the **newtype** wrapper, and **unit structs**.
- Behavior lives in **`impl` blocks**: **methods** take `self`/`&self`/
  `&mut self`; **associated functions** (e.g. `new`) don't take `self`
  and are called with `::`.
- **Enums** are types that are *one of* several **variants**.
- Variants can **carry data** (struct-like or tuple-like), making enums
  **sum types** that render illegal states unrepresentable.
- **`Option<T>`** (no null) and **`Result<T, E>`** (no exceptions) are
  just standard-library enums with data.
- **`#[derive(...)]`** auto-generates common traits (`Debug`, `Clone`,
  `PartialEq`, ...).
- Modeling rule: **struct for AND, enum for OR** — and push invalid
  states out of the types.

## What's next

[Chapter 9](/rust/part-3-types/pattern-matching) — pattern matching. The
`match` expression and patterns are how you *take apart* the structs and
enums you just learned to build — exhaustively, so the compiler ensures
you handle every case.
