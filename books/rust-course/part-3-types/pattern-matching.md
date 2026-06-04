---
sidebar_position: 2
title: "Pattern Matching"
---

# Pattern Matching

> Take data apart by its shape. **`match`** compares a value against
> patterns, runs the first arm that fits, and — crucially — forces you to
> handle **every** case. Combined with enums
> ([Chapter 8](/rust/part-3-types/structs-and-enums)), it's how Rust
> turns "did you handle that?" from a runtime hope into a compile-time
> guarantee.

[Chapter 3](/rust/part-1-getting-started/basic-syntax) previewed `match`;
now we go deep. Pattern matching is the counterpart to structs and enums:
you *build* data with them and *destructure* it with patterns. It's one
of Rust's most loved features, and once it clicks you'll miss it in every
other language.

## 1. match: the exhaustive conditional

`match` takes a value and a series of `pattern => expression` arms. It
runs the first matching arm and evaluates to that arm's value (it's an
expression, [Chapter 3](/rust/part-1-getting-started/basic-syntax)):

```rust
let n = 3;
let name = match n {
    1 => "one",
    2 => "two",
    3 => "three",
    _ => "many",        // _ is the catch-all
};
```

The defining feature: **`match` is exhaustive**. You *must* cover every
possible value, or the code won't compile. The `_` wildcard catches
"everything else." Forgetting a case isn't a silent bug — it's a compile
error.

## 2. Patterns on enums: the core use

`match` shines on enums, because it both **dispatches** on the variant
and **extracts** its data in one step:

```rust
enum Shape {
    Circle { radius: f64 },
    Rectangle { width: f64, height: f64 },
    Triangle(f64, f64),
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle { radius } => 3.14159 * radius * radius,
        Shape::Rectangle { width, height } => width * height,
        Shape::Triangle(base, h) => 0.5 * base * h,
    }
}
```

Each arm names a variant *and* binds its fields (`radius`, `width`,
`base`, ...) as local variables. No casting, no field-by-field checks —
the pattern does both. And because `Shape` has three variants, omitting
one is a compile error: add a variant later and the compiler points you
at every `match` that needs updating.

> :surprisedgoose: This exhaustiveness check is a quiet superpower for
> *maintenance*. Add a `Pentagon` variant to `Shape` a year from now, and
> the compiler immediately flags every `match` that doesn't handle it —
> turning "find all the places that need updating" from an error-prone
> manual grep into a list the compiler hands you. In languages with
> `switch` and a `default:`, that new case silently falls through to the
> default and ships as a bug. Rust makes the change *safe by
> construction*.

## 3. The pattern vocabulary

Patterns are a small language. The common forms:

```rust
match x {
    0 => "zero",                 // literal
    1 | 2 | 3 => "small",        // multiple patterns with |
    4..=9 => "medium",           // inclusive range
    n if n < 0 => "negative",    // match guard (a condition)
    n => return n.to_string(),   // bind to a name (catch-all that captures)
}
```

- **Literals**: match an exact value.
- **`|`** (or): match any of several patterns.
- **`..=`** ranges: match within a range.
- **Match guards** (`if condition`): an extra boolean test on an arm.
- **Bindings**: a bare name matches anything and *captures* it (unlike
  `_`, which matches and discards).

## 4. Destructuring structs and tuples

Patterns destructure any composite, not just enums:

```rust
struct Point { x: i32, y: i32 }
let p = Point { x: 0, y: 7 };

match p {
    Point { x: 0, y: 0 } => println!("origin"),
    Point { x: 0, y } => println!("on the y-axis at {y}"),  // x must be 0, bind y
    Point { x, y } => println!("at ({x}, {y})"),
}

let triple = (1, -2, 3);
let (a, b, c) = triple;          // destructure a tuple in a let
```

You can match literals *inside* a pattern (`x: 0`) while binding the
rest, nest patterns arbitrarily deep, and destructure in a plain `let`
when there's only one possible shape (irrefutable patterns).

## 5. Matching Option and Result

This is the everyday payoff. `Option` and `Result`
([Chapter 8](/rust/part-3-types/structs-and-enums)) are enums, so you
handle them with `match` — and exhaustiveness *forces* you to deal with
`None`/`Err`:

```rust
fn describe(maybe: Option<i32>) -> String {
    match maybe {
        Some(n) if n > 0 => format!("positive: {n}"),
        Some(n) => format!("non-positive: {n}"),
        None => String::from("nothing"),     // can't forget this case
    }
}
```

You cannot accidentally use the value without checking for `None` — the
compiler won't let you skip the arm. This is *why* Rust has no
null-pointer dereferences: absence is a case you're required to handle.

## 6. if let, while let, let else

Full `match` is overkill when you care about *one* pattern. The
shorthands:

```rust
// if let: run code only when one pattern matches
if let Some(n) = maybe {
    println!("got {n}");
} else {
    println!("nothing");
}

// while let: loop as long as a pattern matches
let mut stack = vec![1, 2, 3];
while let Some(top) = stack.pop() {     // stops when pop() returns None
    println!("{top}");
}

// let else: bind, or diverge (return/break/panic) if it doesn't match
let Some(n) = maybe else {
    return;                              // no match → leave the function
};
// n is in scope here, unwrapped
```

`if let` is "match one pattern, else do something." `while let` loops
until the pattern fails (great for draining). `let else` binds on success
or bails on failure, avoiding a rightward-drifting pyramid of nesting.
All three are `match` ergonomics for the one-pattern case.

## 7. Bindings with @ and nested patterns

Two more tools you'll reach for occasionally. The `@` operator binds a
value *while also* testing it against a pattern:

```rust
match id {
    n @ 1..=5 => println!("small id {n}"),   // matches 1..=5 AND binds it to n
    n => println!("other id {n}"),
}
```

And patterns nest, so you can reach deep into structure in a single arm:

```rust
match point_option {
    Some(Point { x: 0, y }) => println!("y-axis at {y}"),  // Option + struct + literal
    Some(_) => println!("somewhere"),
    None => println!("no point"),
}
```

`@` captures-and-tests in one move; nesting lets one pattern express a
condition that would be several `if`s otherwise. Both keep matching
declarative and flat.

## 8. Why pattern matching matters

Pattern matching is the natural complement to algebraic data types
([Chapter 8](/rust/part-3-types/structs-and-enums)):

- **Exhaustiveness** turns "handle every case" into a compile-time
  guarantee — the maintenance superpower of §2.
- **Destructuring** extracts data by shape, no boilerplate accessors or
  casts.
- **Expression-orientation** means `match` *returns a value*, so you
  write `let x = match ...` instead of mutating in branches.

Combined with enums, it's how Rust encodes "this is one of these
possibilities, and you will handle all of them." That single discipline —
model with sum types, destructure with exhaustive `match` — eliminates a
huge swath of the bugs that plague languages with null, `switch`
fall-through, and untyped tag fields.

> :weightliftinggoose: `match` is the tool you'll reach for constantly.
> Drill the reflexes: exhaustiveness is a *feature* (let the compiler
> find unhandled cases — don't reach for `_` to silence it unless you
> truly mean "all others"); destructure enums to dispatch-and-extract in
> one arm; use `if let`/`while let`/`let else` for the single-pattern
> cases. Pair this chapter with enums and you have Rust's correctness
> engine: make states a sum type, then `match` them all.

## What we covered

- **`match`** runs the first matching arm and is **exhaustive** —
  forgetting a case is a compile error; `_` is the catch-all.
- On **enums**, a `match` arm both dispatches on the variant *and* binds
  its data — adding a variant flags every `match` that must update.
- Pattern vocabulary: literals, **`|`** (or), **`..=`** ranges, **match
  guards** (`if`), and name **bindings** (vs `_` which discards).
- Patterns **destructure** structs and tuples too, nesting and matching
  inner literals.
- Matching **`Option`/`Result`** forces handling `None`/`Err` — the
  reason Rust has no null dereferences.
- **`if let`** / **`while let`** / **`let else`** are ergonomic shorthands
  for the single-pattern case.
- **`@`** binds-and-tests; patterns **nest** to express deep conditions
  declaratively.

## What's next

[Chapter 10](/rust/part-3-types/traits) — traits. Structs and enums model
*data*; traits model **shared behavior** — Rust's answer to interfaces
and the foundation of generics, operator overloading, and the standard
library's design.
