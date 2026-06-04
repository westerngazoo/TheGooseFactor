---
sidebar_position: 3
title: "Further Reading & Setup"
---

# Further Reading & Setup

> Where to go after the course — the canonical books and resources, the
> key crates, and a quick setup refresher to get you building.

## Setup refresher

Get the toolchain installed and a project running
([Chapter 2](/rust/part-1-getting-started/hello-cargo)):

```bash
# Install Rust (rustc, cargo, rustup)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Start and run a project
cargo new hello && cd hello
cargo run

# Everyday commands
cargo check        # fast type-check (no binary)
cargo test         # run tests
cargo fmt          # format
cargo clippy       # lint
cargo add <crate>  # add a dependency
cargo build --release   # optimized build
```

Install **rust-analyzer** in your editor (VS Code, Neovim, etc.) for
inline errors, autocomplete, and type hints — it makes learning Rust
dramatically smoother. Keep `rustup update` handy to stay current.

## The essential books

- **"The Rust Programming Language"** (Klabnik & Nichols) — *the Book*.
  Free online, the definitive introduction. The best companion to revisit
  any topic in this course at more length. Start here.
- **Rust by Example** — runnable, example-first; great for "how do I do
  X?" Free online.
- **Rustlings** — small interactive exercises that drill syntax,
  ownership, and error-fixing in your fingers. Do these *alongside*
  reading; they cement the rules fast.
- **"Programming Rust"** (Blandy, Orendorff & Tindall) — a thorough,
  deeply-explained book. Excellent for going beyond the basics.
- **"Rust for Rustaceans"** (Jon Gjengset) — intermediate/advanced, for
  *after* you're comfortable. His YouTube videos are an exceptional deep
  resource too.

## Reference and docs

- **The standard library docs** (`std`) — superb, searchable, with
  examples that are tested ([Chapter 22](/rust/part-6-ecosystem/testing-and-tooling)),
  so they're reliably accurate.
- **docs.rs** — auto-generated, consistent documentation for *every*
  crate published to crates.io.
- **The Rust Reference** — the precise language specification, for when
  you need the exact rule.
- **The Rustonomicon** — the dark-arts guide to **unsafe** Rust
  ([Chapter 19](/rust/part-5-concurrency/unsafe-rust)); read it before
  writing nontrivial `unsafe`.
- **The Cargo Book** and **The rustc Book** — the build tool and compiler
  in depth.

## Key crates to learn

A handful of crates appear across most real projects
([Chapter 23](/rust/part-6-ecosystem/where-to-go-next)):

- **`serde`** — serialization/deserialization (JSON & more).
- **`tokio`** — the async runtime
  ([Chapter 18](/rust/part-5-concurrency/async-await)).
- **`clap`** — command-line argument parsing.
- **`anyhow`** (apps) / **`thiserror`** (libraries) — error handling
  ([Chapter 12](/rust/part-4-data/error-handling)).
- **`reqwest`** — HTTP client; **`axum`** / **`actix-web`** — web servers.
- **`sqlx`** / **`diesel`** — databases; **`rayon`** — easy data
  parallelism.

Learning `serde`, `tokio`, `clap`, and `anyhow` covers most of "knowing
the ecosystem."

## By domain

- **CLI tools** — `clap`, `anyhow`; the best first-project domain.
- **Web backends** — `axum`/`actix` + `tokio` + `sqlx`.
- **WebAssembly** — `wasm-bindgen`, `wasm-pack`; Rust is a top WASM
  language.
- **Embedded / `no_std`** — the embedded WG resources, `embassy` (async
  embedded).
- **Game dev** — `bevy`.
- **Data / performance** — `polars`, `rayon`, `ndarray`.

## Community

- **The Rust Users Forum** (users.rust-lang.org) — friendly, high-quality
  help.
- **r/rust** — news, articles, discussion.
- **The Rust Discord / Zulip** — real-time help and working groups.
- **This Week in Rust** — a weekly newsletter to keep current.

The Rust community is known for being welcoming and patient with
beginners — don't hesitate to ask questions.

> :weightliftinggoose: The highest-leverage next move isn't more reading —
> it's **building**. Install the toolchain (above), start a CLI tool, do
> **Rustlings** on the side, and keep the **Book** open for depth. Lean
> on **`clippy`** to learn idioms and the **community** when stuck. You
> already climbed the hard part of the curve in
> [Part II](/rust/part-2-ownership/ownership-and-moves); everything from
> here is applying it. Go ship something.

---

Back to the [course introduction](/rust/) · the
[roadmap](/rust/table-of-contents) · the
[cheat sheet](/rust/appendix/cheat-sheet) · the
[glossary](/rust/appendix/glossary).
