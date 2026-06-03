---
sidebar_position: 2
title: "Macros"
---

# Macros

> Code that writes code. Rust macros run at **compile time**, generating
> code before type-checking. **Declarative** macros (`macro_rules!`) match
> on syntax patterns; **procedural** macros (including every `#[derive]`
> you've used) transform token streams with arbitrary Rust. Macros do what
> functions can't: variadic arguments, new syntax, and code generation.

You've used macros since chapter one — `println!`, `vec!`, `#[derive]` —
spotting them by the `!` or the `#[...]`. This chapter explains what
they *are*. Macros are Rust's metaprogramming: they expand into ordinary
code at compile time, letting you abstract over things functions can't
touch.

## 1. Why macros, not functions

Functions are the right tool almost always — prefer them. But functions
have hard limits a macro can cross:

- **Variadic arguments**: `println!` takes any number of arguments of any
  types; a function's signature is fixed.
- **Compile-time code generation**: `#[derive(Debug)]` *writes an impl
  block* from your struct's fields — no function can emit code.
- **New syntax / DSLs**: macros can accept token patterns that aren't
  valid expressions on their own.
- **Operating before types exist**: macros expand *before* type-checking,
  so they can do things that don't yet type-check as written.

The `!` on `println!` signals "this is a macro, expanded at compile
time," not a function call. When you hit a wall a function can't climb —
variable arguments, generating impls, custom syntax — that's the macro
signal.

## 2. Declarative macros: macro_rules!

The common kind. A **declarative macro** matches the *syntax* you pass
against patterns and expands to the corresponding template — like a
`match` ([Chapter 9](/rust/part-3-types/pattern-matching)) over code. A
simplified `vec!`:

```rust
macro_rules! my_vec {
    ( $( $x:expr ),* ) => {        // match: comma-separated expressions
        {
            let mut v = Vec::new();
            $( v.push($x); )*       // repeat the push for each matched $x
            v
        }
    };
}

let v = my_vec![1, 2, 3];          // expands to push 1, push 2, push 3
```

`$x:expr` captures an expression; `$( ... ),*` matches a comma-separated
*repetition*; `$( ... )*` in the body **repeats** the template once per
captured item. So `my_vec![1, 2, 3]` generates three `push` calls. This
pattern-and-repeat mechanism handles the variadic, code-generating cases
declaratively.

## 3. Fragment specifiers

The `:expr` in `$x:expr` is a **fragment specifier** — it tells the macro
what *kind* of syntax to match. The common ones:

- **`expr`** — an expression (`2 + 2`, `foo()`).
- **`ident`** — an identifier (a name).
- **`ty`** — a type.
- **`pat`** — a pattern.
- **`tt`** — a single "token tree" (the most flexible; matches almost
  anything).
- **`stmt`**, **`block`**, **`path`**, **`literal`** — as named.

These let a macro accept structured fragments and recombine them safely.
Matching `ident` vs `expr` vs `ty` means the macro knows what it's
splicing where — generating correct code rather than blind text
substitution (which is all C's preprocessor `#define` does).

## 4. Procedural macros

The more powerful kind. A **procedural macro** is a function that takes a
**`TokenStream`** (the parsed tokens of your code) and returns a new
`TokenStream` — arbitrary Rust code generating Rust code. They live in
their own crate and come in three flavors:

- **Derive macros**: `#[derive(Debug)]` — generate an `impl` from a type
  definition. The most common; you've used them constantly.
- **Attribute macros**: `#[route("/")]`, `#[tokio::main]` — a custom
  attribute that transforms the item it's attached to.
- **Function-like macros**: `sql!(...)` — look like `macro_rules!` calls
  but run arbitrary code (e.g. parse and validate an embedded SQL string
  at compile time).

```rust
#[derive(Debug, Clone, Serialize)]   // each derive macro emits an impl block
struct Config { port: u16 }
```

Procedural macros power much of the ecosystem — `serde`'s
serialization, `tokio`'s `#[tokio::main]`, web frameworks' routing — by
generating boilerplate you'd otherwise hand-write.

## 5. How derive saves you

`#[derive]` is worth dwelling on because it's everywhere. Writing `Debug`,
`Clone`, `PartialEq`, `Serialize` by hand is mechanical, repetitive, and
error-prone. A derive macro reads your type's fields and **generates a
correct implementation**:

```rust
#[derive(Debug, PartialEq)]
struct Point { x: i32, y: i32 }
// the macro generates:
//   impl Debug for Point { ... prints "Point { x: .., y: .. }" ... }
//   impl PartialEq for Point { ... compares x and y ... }
```

If you add a field `z`, re-deriving regenerates both impls to include it —
no chance of forgetting to update a hand-written `==`. This is the everyday
payoff of macros: the compiler writes the tedious, structure-following
code, correctly, every time the structure changes.

## 6. Hygiene

Rust macros are **hygienic**: identifiers a macro introduces don't
accidentally collide with names at the call site, and vice versa. The
`let mut v` inside `my_vec!` (§2) won't clash with a `v` in your code:

```rust
let v = 99;
let nums = my_vec![1, 2];   // the macro's internal `v` does NOT clobber this `v`
println!("{v}");            // still 99 — hygiene kept the names separate
```

Hygiene is a major advance over C's textual `#define`, where a macro's
temporary variable can silently shadow or capture the caller's variables —
a classic source of baffling bugs. Rust macros operate on *parsed,
scoped* syntax, not raw text, so they're far safer to write and use.

> :nerdygoose: The leap from C's preprocessor to Rust's macros is the leap
> from *text substitution* to *syntax transformation*. `#define` blindly
> pastes tokens — no awareness of expressions, types, or scope — which is
> why C macros are infamous for needing defensive parentheses and still
> capturing variables. Rust macros match *structured* syntax with typed
> fragments (`:expr`, `:ty`) and respect *hygiene* (scoped names). They're
> closer to Lisp's macros (code as data, transformed safely) than to C's
> blunt token-pasting.

## 7. When to write a macro

The discipline mirrors the whole language's "explicit over magic" ethos:
**prefer functions; reach for macros only when functions can't do the
job.** Good reasons to write one:

- You need **variadic** arguments or heterogeneous argument types.
- You're generating **repetitive boilerplate** from a concise spec
  (especially trait impls — a derive macro).
- You want an **embedded DSL** or custom syntax.
- You need to operate at **compile time** on the structure of code.

Bad reasons: a macro where a generic function
([Chapter 11](/rust/part-3-types/generics)) would do. Macros are harder to
read, harder to debug (the error points at generated code), and don't
compose like functions. They're a powerful, sharp tool — used heavily by
*libraries* (to offer clean APIs) and sparingly in *application* code.

## 8. Macros in the ecosystem

You'll *use* macros constantly even if you rarely *write* them. The ones
you'll meet daily:

- **`println!` / `format!` / `write!`** — formatted output, checked at
  compile time.
- **`vec!`** — vector literals.
- **`#[derive(...)]`** — `Debug`, `Clone`, `serde`'s `Serialize`, and
  more.
- **`#[tokio::main]`**, web framework route attributes — attribute macros
  that wire up infrastructure.
- **`assert!` / `assert_eq!`** — test assertions
  ([Chapter 22](/rust/part-6-ecosystem/testing-and-tooling)).

That's the right relationship with macros for most programmers: a heavy
*consumer* of the ecosystem's well-tested macros, an occasional *author*
of a small `macro_rules!` to kill local boilerplate, and a rare writer of
procedural macros (usually when building a library others will use).

> :weightliftinggoose: Macros are metaprogramming — **code that writes
> code at compile time** — and the rule is the same as everywhere in
> Rust: **use a function unless you can't**. Recognize the two kinds:
> **`macro_rules!`** (pattern-match syntax, repeat templates) for variadic
> and boilerplate cases, and **procedural** (including every `#[derive]`)
> for generating impls and DSLs. Trust Rust's macros — they're
> **hygienic** and syntax-aware, not C-style text pasting. Mostly you'll
> *use* macros (`println!`, `derive`, `tokio::main`); write your own only
> when functions and generics genuinely fall short.

## What we covered

- **Macros** run at **compile time**, expanding into ordinary code; the
  `!`/`#[...]` marks them. They do what functions can't: variadics, code
  generation, new syntax.
- **Declarative macros** (`macro_rules!`) match **syntax patterns** and
  expand templates, with **repetition** (`$(...)*`) — like a `match` over
  code.
- **Fragment specifiers** (`:expr`, `:ident`, `:ty`, `:tt`, ...) say what
  kind of syntax to match, enabling correct (not textual) generation.
- **Procedural macros** transform a `TokenStream` with arbitrary Rust:
  **derive** (`#[derive]` → impls), **attribute** (`#[tokio::main]`), and
  **function-like**. They power `serde`, `tokio`, web frameworks.
- `#[derive]` generates correct trait impls from a type's fields and
  updates them as the type changes.
- Rust macros are **hygienic** — introduced names don't collide with the
  call site — a major safety gain over C's `#define`.
- **Prefer functions/generics**; write macros only for variadics,
  boilerplate, DSLs, or compile-time structure work. You mostly *use*
  macros, rarely write procedural ones.

## What's next

[Chapter 22](/rust/part-6-ecosystem/testing-and-tooling) — testing and
tooling. Rust's built-in test framework (unit, integration, and *doc*
tests) and the tooling that makes Rust pleasant: `cargo test`, `clippy`,
`rustfmt`, `rustdoc`, and rust-analyzer.
