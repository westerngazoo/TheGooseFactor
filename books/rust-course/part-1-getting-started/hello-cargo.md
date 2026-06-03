---
sidebar_position: 2
title: "Hello, Cargo: the Toolchain"
---

# Hello, Cargo

> Installing Rust and meeting Cargo, the build tool and package manager
> you'll use constantly. Your first program, and the workflow.

Rust's tooling is one of its best features — modern, integrated, and
pleasant. This chapter gets you set up with `rustup` and `cargo` and
runs your first program, so the rest of the course is hands-on.

## 1. Installing Rust with rustup

Rust is installed via **`rustup`**, the toolchain installer:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

(Or download from rustup.rs.) This installs:

- **`rustc`**: the Rust compiler.
- **`cargo`**: the build tool and package manager (your main interface).
- **`rustup`**: manages Rust versions and toolchains (stable, beta,
  nightly).

`rustup` lets you update Rust (`rustup update`), switch toolchains, and
add targets (for cross-compilation). You'll rarely call `rustc`
directly — **cargo** is the interface you use day to day.

## 2. Cargo: the heart of the workflow

**Cargo** is Rust's build tool, package manager, test runner, and
project manager rolled into one. Create a new project:

```bash
cargo new hello
cd hello
```

This scaffolds:

```
hello/
├── Cargo.toml      # project manifest: name, version, dependencies
└── src/
    └── main.rs     # the entry point
```

`Cargo.toml` is the manifest (like `package.json` or `pom.xml`):

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"

[dependencies]
```

And `src/main.rs` is your first program:

```rust
fn main() {
    println!("Hello, world!");
}
```

## 3. Building and running

Cargo commands you'll use constantly:

```bash
cargo build        # compile (debug build, in target/debug/)
cargo run          # compile and run
cargo build --release   # optimized build (slower compile, fast binary)
cargo check        # type-check without producing a binary (fast!)
cargo test         # run tests
cargo fmt          # format code (rustfmt)
cargo clippy       # lint (catch common mistakes and non-idiomatic code)
```

`cargo run` is your inner-loop command: compile and execute in one
step. `cargo check` is faster than `cargo build` (it skips codegen) —
use it for quick "does this type-check?" feedback while iterating.

```bash
$ cargo run
   Compiling hello v0.1.0
    Finished dev [unoptimized + debuginfo] target(s) in 0.5s
     Running `target/debug/hello`
Hello, world!
```

> :nerdygoose: Cargo's integration is a major reason Rust is pleasant
> to use. In C/C++, you wrestle with Make, CMake, package managers,
> linkers, and incompatible build systems. In Rust, `cargo new`,
> `cargo build`, `cargo test`, `cargo add some-crate` — one tool does
> it all, consistently, across every Rust project. The tooling quality
> is part of why people *enjoy* Rust, and it set a standard newer
> languages now copy.

## 4. Dependencies and crates

A **crate** is Rust's unit of a library or package. Add a dependency
with `cargo add` (or by editing `Cargo.toml`):

```bash
cargo add rand     # add the `rand` crate
```

```toml
[dependencies]
rand = "0.8"
```

Then use it:

```rust
use rand::Rng;

fn main() {
    let n = rand::thread_rng().gen_range(1..=100);
    println!("random number: {}", n);
}
```

Cargo fetches dependencies from **crates.io** (the package registry,
like npm or PyPI), resolves versions, and builds everything. The
`Cargo.lock` file pins exact versions for reproducible builds. The crate
ecosystem ([Chapter 20](/rust/part-6-ecosystem/modules-crates-cargo)) is
large and high-quality.

## 5. The println! macro and basic output

You've seen `println!` — note the `!`, which marks it as a **macro**
([Chapter 21](/rust/part-6-ecosystem/macros)), not a function. It does
formatted printing:

```rust
fn main() {
    let name = "Rust";
    let version = 2021;
    println!("Hello, {}!", name);              // {} is a placeholder
    println!("{name} edition {version}");      // inline variables (newer)
    println!("{:?}", vec![1, 2, 3]);           // {:?} for debug format
    println!("{0} {1} {0}", "a", "b");         // positional: a b a
}
```

`{}` is a placeholder filled by the arguments; `{:?}` uses the "debug"
format (for types that derive `Debug`); inline `{name}` interpolates a
variable directly. `println!` is a macro because it checks the format
string against the arguments *at compile time* — a function couldn't.

## 6. Reading the compiler's errors

Rust's compiler errors are famously helpful — they're a teaching tool.
When you make a mistake:

```rust
fn main() {
    let x = 5;
    x = 6;   // error: x is immutable
}
```

```
error[E0384]: cannot assign twice to immutable variable `x`
 --> src/main.rs:3:5
  |
2 |     let x = 5;
  |         - first assignment to `x`
3 |     x = 6;
  |     ^^^^^ cannot assign twice to immutable variable
help: consider making this binding mutable: `let mut x = 5;`
```

The error names the problem, points at the exact location, *and
suggests the fix* (`let mut x`). Rust errors routinely tell you what to
do, not just what's wrong. **Read them carefully** — especially the
borrow-checker errors in [Part II](/rust/part-2-ownership/ownership-and-moves),
which are the main way you'll learn ownership.

## 7. The development loop

Your Rust workflow:

1. Write/edit code in `src/`.
2. `cargo check` for fast type-checking feedback (or `cargo run` to
   run).
3. Read any errors — fix what the compiler points out.
4. `cargo test` to run tests, `cargo clippy` to catch non-idiomatic
   code, `cargo fmt` to format.
5. `cargo build --release` for the optimized production binary.

Editor integration via **rust-analyzer** (the language server) gives
inline errors, autocomplete, type hints, and refactoring in VS Code,
Neovim, etc. — install it; it makes Rust development dramatically
smoother (you see errors as you type, not just at `cargo build`).

> :weightliftinggoose: Get the toolchain set up before reading further:
> `rustup` to install, `cargo new` to start a project, `cargo run` to
> execute, and **rust-analyzer** in your editor for inline feedback.
> The cargo + rust-analyzer combination is genuinely excellent — you'll
> have errors, autocomplete, and one-command build/test/run from day
> one. Code along with every chapter; Rust is learned by compiling.

## What we covered

- Install Rust via **`rustup`** (gives `rustc`, `cargo`, `rustup`).
- **Cargo** is the all-in-one build tool / package manager:
  `cargo new`, `build`, `run`, `check`, `test`, `fmt`, `clippy`.
- `Cargo.toml` is the manifest; **crates** are packages from
  **crates.io**; `cargo add` adds dependencies; `Cargo.lock` pins
  versions.
- **`println!`** (a macro) does formatted output with `{}` placeholders,
  inline `{var}`, and `{:?}` debug format.
- Rust's **compiler errors** are a teaching tool — they locate the
  problem and *suggest the fix*; read them carefully.
- The dev loop: edit → `cargo check`/`run` → fix errors → test/lint/fmt
  → `--release`. Use **rust-analyzer** for inline feedback.

## What's next

[Chapter 3](/rust/part-1-getting-started/basic-syntax) — basic syntax:
variables, types, functions, and control flow. The fundamentals you
need before diving into ownership.
