---
sidebar_position: 3
title: "Basic Syntax: Variables, Types, Control Flow"
---

# Basic Syntax

> The fundamentals — variables, types, functions, control flow —
> before we dive into ownership. Rust's syntax is familiar but has
> distinctive choices (immutability by default, expressions over
> statements) worth noting.

This chapter covers Rust's everyday syntax. Much will look familiar
(it's a C-family language), but the defaults and a few ideas
(immutability, everything-is-an-expression) shape how you write Rust.

## 1. Variables: immutable by default

`let` binds a variable. **By default, variables are immutable** — you
can't reassign them:

```rust
let x = 5;
x = 6;          // ERROR: cannot assign twice to immutable variable
let mut y = 5;  // `mut` makes it mutable
y = 6;          // OK
```

Immutability by default is a deliberate Rust choice: most variables
*shouldn't* change, and making mutability explicit (`mut`) flags the
ones that do — aiding both the reader and the compiler (which can
optimize and reason better about immutable data). You opt *into*
mutation, not out of it.

**Shadowing** lets you re-`let` a name, creating a new variable
(possibly a different type):

```rust
let x = 5;
let x = x + 1;        // shadows: new x is 6
let x = "now a string";  // shadowing can even change the type
```

Shadowing differs from mutation — it's a new binding, common for
transforming a value through stages.

## 2. Types

Rust is **statically typed** with **type inference** — you often omit
types and the compiler deduces them:

```rust
let x = 5;          // inferred i32
let y: f64 = 3.14;  // explicit annotation
let z = 5u8;        // suffix specifies type: u8
```

Primitive types:

- **Integers**: `i8 i16 i32 i64 i128 isize` (signed),
  `u8 u16 u32 u64 u128 usize` (unsigned). Default `i32`.
- **Floats**: `f32`, `f64` (default `f64`).
- **Boolean**: `bool` (`true`/`false`).
- **Character**: `char` (a Unicode scalar, 4 bytes — `'a'`, `'😀'`).
- **Unit**: `()` — the empty tuple, "no value" (like `void`).

Compound types:

- **Tuples**: `(i32, f64, char)` — fixed-size, mixed types. Access via
  `.0`, `.1`, or destructure: `let (a, b, c) = tuple;`.
- **Arrays**: `[i32; 5]` — fixed-size, same type. `[1, 2, 3, 4, 5]`.
  (Growable lists are `Vec`, [Chapter 13](/rust/part-4-data/collections).)

> :nerdygoose: Rust's integer types are explicit about size and
> signedness (`u8`, `i64`) — no vague `int` whose size varies by
> platform (a C footgun). `usize`/`isize` match the platform's pointer
> size (used for indexing). This explicitness prevents whole classes of
> overflow and portability bugs. And Rust checks for overflow in debug
> builds (panics) — no silent wraparound surprising you.

## 3. Functions

Functions use `fn`, with typed parameters and an explicit return type
after `->`:

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b           // no semicolon: this is the return value (expression)
}

fn greet(name: &str) {   // no -> means returns unit ()
    println!("Hello, {name}");
}
```

Note: the last **expression** in a function body (no semicolon) is the
return value — no `return` keyword needed (though `return` exists for
early returns). This is because Rust is **expression-oriented**.

## 4. Everything is an expression

In Rust, most constructs are **expressions** that produce a value — not
just statements. `if`, `match`, blocks, and loops can all yield values:

```rust
let x = if condition { 5 } else { 6 };   // if is an expression

let y = {
    let a = 1;
    let b = 2;
    a + b               // the block evaluates to 3 (last expression)
};

let z = loop {
    break 42;           // loop can return a value via break
};
```

This expression-orientation (shared with Lisp, ML, Rust's heritage)
means you write `let x = if ... { } else { }` instead of declaring `x`
then assigning in branches. It's cleaner and avoids uninitialized
variables. (The distinction: a **statement** does something and returns
`()`; an **expression** evaluates to a value. A semicolon turns an
expression into a statement by discarding its value.)

## 5. Control flow

**`if`/`else`** — note: the condition needs no parentheses, and it's an
expression (§4):

```rust
if x > 5 {
    println!("big");
} else if x > 0 {
    println!("small");
} else {
    println!("non-positive");
}
```

**Loops** — three kinds:

```rust
loop { ... break; }                 // infinite loop (until break)
while condition { ... }             // while loop
for item in collection { ... }      // for-each over an iterator
for i in 0..10 { ... }              // range 0..9 (exclusive end)
for i in 0..=10 { ... }             // range 0..10 (inclusive end)
```

Rust's `for` is always a **for-each** over an iterator
([Chapter 14](/rust/part-4-data/iterators-and-closures)) — there's no
C-style three-part `for(;;)`. Ranges (`0..10`) are iterators. This
makes loops safe (no off-by-one index errors) and idiomatic.

## 6. match: the powerful conditional

`match` ([Chapter 9](/rust/part-3-types/pattern-matching)) is Rust's
most distinctive control structure — a pattern-matching switch that's
*exhaustive* (you must handle every case) and an expression:

```rust
let description = match number {
    0 => "zero",
    1 | 2 => "one or two",        // multiple patterns
    3..=9 => "small",             // range pattern
    _ => "large",                 // _ is the catch-all (required if not exhaustive)
};
```

`match` is far more powerful than a C `switch` — it matches structure,
destructures values, binds variables, and the compiler *enforces
exhaustiveness* (forgetting a case is a compile error). It's covered in
depth in [Chapter 9](/rust/part-3-types/pattern-matching); for now, know
it's central to idiomatic Rust.

## 7. Comments and basic conventions

```rust
// line comment
/* block comment */
/// doc comment (for the item below; generates documentation)
//! inner doc comment (for the enclosing module)
```

Conventions (enforced by `rustfmt` and `clippy`):

- `snake_case` for variables and functions.
- `CamelCase` for types (structs, enums, traits).
- `SCREAMING_SNAKE_CASE` for constants.
- 4-space indentation.

`cargo fmt` formats automatically; `cargo clippy` flags non-idiomatic
code. Lean on them — they teach Rust style.

## 8. Constants and statics

```rust
const MAX_POINTS: u32 = 100_000;   // compile-time constant (always immutable)
static GREETING: &str = "hello";   // static: a fixed memory location
```

`const` is a compile-time constant, inlined at use sites; `static` is a
single fixed-address value (rarely needed). Note the `_` in `100_000` —
a digit separator for readability, ignored by the compiler.

> :weightliftinggoose: Rust's basic syntax is C-family-familiar with
> three things to internalize: variables are **immutable by default**
> (`mut` to opt in), almost everything is an **expression** (`let x =
> if ...`), and `for` is always **for-each** over an iterator. Get
> comfortable with these, lean on `cargo fmt`/`clippy` for style, and
> you're ready for the part that makes Rust *Rust*: ownership.

## What we covered

- **`let`** binds variables, **immutable by default**; `mut` opts into
  mutation; **shadowing** re-binds a name (even changing type).
- **Static typing with inference**; explicit sized integer types
  (`i32`, `u8`, `usize`), floats, `bool`, `char`, unit `()`, tuples,
  arrays.
- **Functions** with `fn`, typed params, `->` return type; the last
  expression (no semicolon) is the return value.
- Rust is **expression-oriented**: `if`, `match`, blocks, loops yield
  values.
- **Control flow**: `if`/`else` (no parens, an expression), `loop`/
  `while`/`for`; `for` is always for-each over an iterator; ranges
  `0..10` / `0..=10`.
- **`match`**: exhaustive pattern-matching conditional (depth in
  [Ch 9](/rust/part-3-types/pattern-matching)).
- Conventions: `snake_case`/`CamelCase`/`SCREAMING_SNAKE_CASE`; `cargo
  fmt`/`clippy`. `const` and `static`.

## What's next

That closes Part I. [Part II](/rust/part-2-ownership/ownership-and-moves)
is the heart of Rust: **ownership**. We start with ownership and moves —
the rules that let Rust manage memory safely without a garbage
collector.
