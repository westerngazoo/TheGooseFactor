---
sidebar_position: 3
title: "Testing and Tooling"
---

# Testing and Tooling

> Testing is built in, and the tooling is a joy. Rust ships a test
> framework in the language — **unit**, **integration**, and even
> **documentation** tests — run by `cargo test`. Around it sits a polished
> toolchain: `clippy` (lints), `rustfmt` (formatting), `rustdoc` (docs),
> and rust-analyzer (editor smarts). This is part of why Rust is pleasant
> to work in.

A language's *experience* is its tooling as much as its syntax, and
here Rust shines ([Chapter 2](/rust/part-1-getting-started/hello-cargo)).
Testing needs no third-party framework — it's in the language and Cargo.
This chapter covers writing tests and the everyday tools that keep code
correct and idiomatic.

## 1. Unit tests

A **unit test** lives in the same file as the code it tests, in a module
marked `#[cfg(test)]` (so it's compiled only during testing, never into
the release binary). Functions tagged `#[test]` are the tests:

```rust
fn add(a: i32, b: i32) -> i32 { a + b }

#[cfg(test)]
mod tests {
    use super::*;            // bring the parent module's items into scope

    #[test]
    fn adds_two_numbers() {
        assert_eq!(add(2, 3), 5);
    }
}
```

`cargo test` builds and runs every `#[test]` function, reporting passes
and failures. Because tests sit beside the code (and can be a child
module), they can test **private** functions too — a notable advantage
over external-only test setups.

## 2. The assertion macros

Tests check conditions with macros ([Chapter 21](/rust/part-6-ecosystem/macros)):

```rust
assert!(condition);                       // panics if false
assert_eq!(actual, expected);             // panics if !=, prints both values
assert_ne!(a, b);                         // panics if equal
assert_eq!(x, 5, "x was wrong: {}", x);   // optional custom message
```

A test **passes** if it returns without panicking and **fails** if it
panics (which is what a failed `assert` does). `assert_eq!` prints both
values on failure, so you see *what* differed, not just *that* it did. A
test can also return `Result`, letting you use `?` inside it and fail on
`Err`.

## 3. Testing for panics and using Result

Two more idioms. To assert that code *should* panic, use
`#[should_panic]`; to write tests that use `?`, return a `Result`:

```rust
#[test]
#[should_panic(expected = "divide by zero")]   // passes only if it panics with this msg
fn rejects_zero() {
    divide(1, 0);
}

#[test]
fn parses_config() -> Result<(), Box<dyn std::error::Error>> {
    let n: i32 = "42".parse()?;     // ? works because the test returns Result
    assert_eq!(n, 42);
    Ok(())                          // Ok = pass; an Err would fail the test
}
```

`#[should_panic]` verifies error *paths* (that bad input is rejected); the
`Result`-returning form lets a test use `?` for setup that might fail.
Together they cover the "this should blow up" and "this involves fallible
steps" cases cleanly.

## 4. Integration tests

**Integration tests** live in a top-level **`tests/`** directory, each
file its own crate that uses your library *as an external user would* —
through its public API only:

```
my_crate/
├── src/
│   └── lib.rs
└── tests/
    └── api.rs        # an integration test crate
```

```rust
// tests/api.rs
use my_crate::public_function;     // only public items are visible here

#[test]
fn end_to_end() {
    assert_eq!(public_function(), 42);
}
```

Unit tests check internals; integration tests check that the *public
interface* works as a whole, from the outside. The split is deliberate:
`tests/` can only reach `pub` items, so it verifies the API your users
actually see. `cargo test` runs both kinds.

## 5. Documentation tests

Rust's standout feature: **code examples in doc comments are compiled and
run as tests**. The examples in your `///` documentation
([Chapter 20](/rust/part-6-ecosystem/modules-crates-cargo)) can't go
stale, because `cargo test` executes them:

```rust
/// Adds two numbers.
///
/// ```
/// use my_crate::add;
/// assert_eq!(add(2, 3), 5);
/// ```
pub fn add(a: i32, b: i32) -> i32 { a + b }
```

That fenced block is a real test. If you change `add` so the example no
longer holds, `cargo test` fails. Your documentation and your tests are
the *same artifact*, guaranteed consistent.

> :surprisedgoose: Doc tests quietly solve the eternal problem of
> **documentation rotting out of sync with code**. Everywhere else, the
> example in the docs was written once, drifts as the code changes, and
> eventually misleads. In Rust the example *is a test that must pass*, so
> it's provably accurate as of the last `cargo test`. Browse docs.rs for
> any crate and the examples you see are guaranteed to compile against
> that version. Documentation you can *trust* — enforced by the test
> runner.

## 6. cargo test in practice

`cargo test` is the one command for all of it — unit, integration, and doc
tests — with handy controls:

```bash
cargo test                  # run everything
cargo test adds             # run only tests whose name contains "adds"
cargo test -- --nocapture   # show println! output (normally hidden on pass)
cargo test -- --test-threads=1   # run sequentially (tests run in parallel by default)
```

Tests run **in parallel** by default (so keep them independent — no shared
mutable global state, or they'll interfere). Output from passing tests is
captured (hidden) unless you pass `--nocapture`. Filtering by name speeds
the inner loop when you're iterating on one area.

## 7. The tooling around tests

Beyond testing, the toolchain that makes daily Rust smooth
([Chapter 2](/rust/part-1-getting-started/hello-cargo)):

- **`cargo fmt`** (rustfmt) — formats to the community style; ends all
  formatting debate.
- **`cargo clippy`** — a lint suite that catches non-idiomatic code and
  common mistakes, often suggesting the better form. Treat its advice as
  free mentoring.
- **`cargo doc --open`** (rustdoc) — generates and opens HTML docs from
  your doc comments.
- **rust-analyzer** — the language server: inline errors, autocomplete,
  type hints, and refactoring in your editor, as you type.
- **`cargo bench`** / Criterion — benchmarking for performance work.

Run `fmt` and `clippy` routinely (many teams gate CI on them). The
combination — one command to test, one to lint, one to format, plus
live editor feedback — is a big part of why Rust *feels* good despite its
strictness.

## 8. A culture of correctness

Step back and notice what the tooling *encourages*. Testing requires no
setup, so people write tests. Examples are tests, so docs stay accurate.
`clippy` teaches idioms continuously. `fmt` makes every codebase look
familiar. The compiler already eliminated whole bug classes
([Part II](/rust/part-2-ownership/ownership-and-moves)); the test and lint
tooling catches much of the rest.

The result is a **culture of correctness** baked into the workflow: the
easy path is the rigorous one. You don't choose between "ship fast" and
"do it right" nearly as often, because the tools make right *also* fast.
That culture, as much as the language, is what people mean when they say
Rust code tends to be reliable.

> :weightliftinggoose: Testing in Rust has no excuses — it's built in.
> Lock in the habits: **unit tests** in a `#[cfg(test)]` module beside the
> code (they can test privates), **integration tests** in `tests/` (public
> API only), and **doc tests** so your examples can't rot. Drive it all
> with **`cargo test`**, and make **`cargo fmt`** + **`cargo clippy`** +
> **rust-analyzer** part of your reflexes. The tooling makes the rigorous
> path the easy one — lean into it and your Rust will be both correct and
> idiomatic.

## What we covered

- **Unit tests**: `#[test]` functions in a `#[cfg(test)]` module beside
  the code (can test **private** items); `cargo test` runs them.
- **Assertion macros**: `assert!`, `assert_eq!`, `assert_ne!` (with
  optional messages); a test fails by panicking.
- **`#[should_panic]`** asserts error paths; tests can **return `Result`**
  to use `?`.
- **Integration tests** in **`tests/`** exercise the **public API** as an
  external user.
- **Doc tests**: examples in `///` comments are compiled and run — docs
  can't go stale.
- **`cargo test`** runs all three kinds, in parallel, with name filtering
  and `--nocapture`.
- Surrounding tools: **`cargo fmt`**, **`cargo clippy`**, **`cargo doc`**
  (rustdoc), **rust-analyzer**, **`cargo bench`** — a workflow that makes
  the rigorous path the easy one.

## What's next

[Chapter 23](/rust/part-6-ecosystem/where-to-go-next) — where to go next.
The send-off: a look back at the whole arc, the key crates and domains
(web, embedded, WASM, systems), the canonical resources, and how to keep
growing as a Rust programmer.
