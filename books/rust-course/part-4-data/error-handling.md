---
sidebar_position: 1
title: "Error Handling: Result, Option, and ?"
---

# Error Handling

> Errors as values, not exceptions. Rust splits failures into
> **unrecoverable** (`panic!`) and **recoverable** (`Result<T, E>`), makes
> you handle the recoverable ones (no forgotten error checks), and gives
> you the **`?`** operator to propagate them with almost no ceremony.

Welcome to Part IV — putting types to work. We start with error
handling, because it's where `Option` and `Result`
([Chapter 8](/rust/part-3-types/structs-and-enums)) earn their keep. Rust
has no exceptions. Instead, fallibility is encoded in the *type* of a
function's return value, so the compiler ensures you reckon with it.

## 1. Two kinds of error

Rust distinguishes two failure modes, and treats them differently:

- **Unrecoverable**: a bug or impossible state — index out of bounds, a
  failed invariant. These **`panic!`**: unwind the stack and abort the
  thread. There's no point limping on.
- **Recoverable**: an expected, handleable failure — file not found,
  invalid input, network timeout. These return **`Result<T, E>`**: the
  caller decides what to do.

The split matters: panics are for "this should never happen" (you fix the
code); `Result` is for "this can happen, deal with it" (you write
handling). Most of your error handling is `Result`.

## 2. Result: success or failure

`Result<T, E>` is an enum: `Ok(T)` on success, `Err(E)` on failure. A
fallible function returns one, and the caller must inspect it — there's
no way to use the value without confronting the error case:

```rust
use std::fs::File;

fn open_config() -> Result<File, std::io::Error> {
    File::open("config.toml")        // returns Ok(file) or Err(io_error)
}

match open_config() {
    Ok(file) => println!("opened {:?}", file),
    Err(e)   => println!("failed: {e}"),
}
```

Because `Result` is a normal enum, you handle it with `match`
([Chapter 9](/rust/part-3-types/pattern-matching)) — and exhaustiveness
means you can't skip the `Err` arm. The error is data, flowing through
your program like any other value.

## 3. Option: when there's no error, just absence

When a value may simply be *absent* (no error involved), use
`Option<T>` — `Some(value)` or `None`:

```rust
fn first_char(s: &str) -> Option<char> {
    s.chars().next()        // Some(c), or None if the string is empty
}
```

`Option` is "maybe a value"; `Result` is "a value or an explanation of
why not." A missing hash-map key is `Option`; a failed file read is
`Result`. Both force handling, and both have rich combinator methods
(§6) so you rarely *need* a full `match`.

## 4. unwrap and expect: extracting (carefully)

Sometimes you want the value and will accept a panic if it's not there.
`unwrap` and `expect` do that:

```rust
let n: i32 = "42".parse().unwrap();              // panics if parse fails
let f = File::open("must_exist").expect("config must be present");  // with a message
```

`unwrap` panics on `Err`/`None`; `expect` is the same with a custom
message. They're fine for prototypes, tests, and genuinely-impossible
cases — but in real code, prefer to handle the error or propagate it with
`?` (§5). A codebase full of `unwrap()` is a codebase full of latent
panics. `expect` with a clear message is better than bare `unwrap` when
you do use one, because the message documents *why* you believe it can't
fail.

## 5. The ? operator: propagation made painless

Manually matching every `Result` to pass the error upward is tedious. The
**`?` operator** does it in one character: on `Ok`/`Some` it unwraps the
value; on `Err`/`None` it **returns early** from the function with that
error.

```rust
use std::fs;
use std::io;

fn read_username() -> Result<String, io::Error> {
    let mut s = fs::read_to_string("user.txt")?;   // ? : unwrap, or return Err
    s = s.trim().to_string();
    Ok(s)
}
```

Compare the same logic without `?` — a nest of `match`es. With `?`, the
happy path reads top-to-bottom like normal code, and errors short-circuit
out automatically. `?` works in any function returning `Result` (or
`Option`), which is most of them.

> :surprisedgoose: `?` gives you the *ergonomics* of exceptions —
> errors bubble up without cluttering every line — while keeping errors
> as ordinary values you can't accidentally ignore. The crucial
> difference from exceptions: `?` is **visible**. Every place an error can
> propagate has a `?` right there in the source, so you can *see* the
> error paths. Exceptions are invisible (any call might throw); `?` makes
> the same control flow explicit and local. Ergonomics of exceptions,
> honesty of return values.

## 6. Combinators: handling without match

`Option` and `Result` carry a toolbox of methods so you can transform and
default without writing `match`:

```rust
let len: usize = maybe_name.map(|n| n.len()).unwrap_or(0);   // transform, default
let n = "x".parse::<i32>().unwrap_or(-1);                    // default on error
let v = config.get("port").ok_or("missing port")?;          // Option -> Result, then ?

opt.and_then(|x| further_fallible(x));   // chain fallible steps
res.map_err(|e| MyError::from(e));        // transform the error type
```

`map`, `and_then`, `unwrap_or`, `unwrap_or_else`, `ok_or`, `map_err`, and
friends let you build pipelines of fallible steps cleanly. Reach for these
for simple transforms; drop to `match` when the logic is genuinely
branchy.

## 7. The ? operator and error conversion

`?` has a hidden talent: it **converts** the error type via the `From`
trait ([Chapter 10](/rust/part-3-types/traits)). If your function returns
`Result<_, MyError>` and a call yields `io::Error`, `?` will
automatically convert *if* `MyError: From<io::Error>`:

```rust
enum MyError { Io(std::io::Error), Parse(std::num::ParseIntError) }

impl From<std::io::Error> for MyError {
    fn from(e: std::io::Error) -> Self { MyError::Io(e) }
}
impl From<std::num::ParseIntError> for MyError {
    fn from(e: std::num::ParseIntError) -> Self { MyError::Parse(e) }
}

fn load() -> Result<i32, MyError> {
    let text = std::fs::read_to_string("n.txt")?;   // io::Error -> MyError
    let n: i32 = text.trim().parse()?;               // ParseIntError -> MyError
    Ok(n)
}
```

Both `?`s convert their different error types into the single `MyError`.
This is how one function cleanly propagates several kinds of failure. For
applications, the `anyhow` crate's `Box<dyn Error>`-style type spares you
the boilerplate; for libraries, a custom enum (often via the `thiserror`
crate) gives callers precise, matchable errors.

## 8. Boxing errors and when to panic

When you don't want to enumerate every error type, return a **trait
object**: `Box<dyn std::error::Error>` accepts *any* error, and `?`
converts into it automatically:

```rust
fn run() -> Result<(), Box<dyn std::error::Error>> {
    let text = std::fs::read_to_string("data.txt")?;   // any error -> Box<dyn Error>
    let n: i32 = text.trim().parse()?;
    println!("{n}");
    Ok(())
}
```

This is great for `main` and quick programs (note `main` can return
`Result`). And finally — when *is* `panic!` right? When continuing makes
no sense: a violated invariant, an impossible state, a bug. Use `Result`
for anything a caller could reasonably want to handle; reserve `panic!`
(and `unwrap`) for "this cannot happen, and if it does the program is
broken." The guideline: **`Result` for expected failures, `panic!` for
bugs.**

> :weightliftinggoose: Rust's error story is three moves: **return
> `Result`** for anything that can fail, **`?`** to propagate it up
> cleanly (it even converts error types via `From`), and **`match`/
> combinators** to handle it where it matters. Avoid reflexive
> `.unwrap()` in real code — it's a hidden panic; propagate with `?` or
> handle explicitly. Use `Box<dyn Error>`/`anyhow` for apps, a custom
> enum/`thiserror` for libraries. The payoff: no forgotten error checks,
> no invisible exception paths, and a compiler that won't let you ignore
> what can go wrong.

## What we covered

- Rust splits errors into **unrecoverable** (`panic!`, for bugs) and
  **recoverable** (`Result<T, E>`, for expected failures).
- **`Result<T, E>`** (`Ok`/`Err`) encodes fallibility in the type; you
  must handle the `Err` case (no forgotten checks).
- **`Option<T>`** encodes mere absence (`Some`/`None`); `Result` adds a
  reason for failure.
- **`unwrap`/`expect`** extract the value but panic on failure — fine for
  tests/prototypes, risky in real code.
- **`?`** unwraps on success and returns the error early on failure —
  exception ergonomics, but visible and value-based.
- **Combinators** (`map`, `and_then`, `unwrap_or`, `ok_or`, `map_err`)
  handle `Option`/`Result` without `match`.
- `?` **converts errors via `From`**, so one function can propagate many
  error types into one; **`Box<dyn Error>`** accepts any error.
- Guideline: **`Result` for expected failures, `panic!` for bugs.**

## What's next

[Chapter 13](/rust/part-4-data/collections) — collections. The standard
library's growable, owned data structures: `Vec`, `String`, `HashMap`,
and friends — how they store data, how ownership flows through them, and
the operations you'll use daily.
