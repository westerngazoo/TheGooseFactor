---
sidebar_position: 1
title: "Modules, Crates, and Cargo"
---

# Modules, Crates, and Cargo

> How Rust code is organized and shared. **Modules** group code and
> control visibility *within* a crate; a **crate** is the unit of
> compilation and a **package** is what you publish; **Cargo** ties it all
> together — building, resolving dependencies, and connecting you to
> **crates.io**, the ecosystem of reusable libraries.

Welcome to Part VI — the ecosystem. You know the language; now learn to
*organize* and *share* it. Rust's module system controls what's visible
where, crates are the publishable units, and Cargo
([Chapter 2](/rust/part-1-getting-started/hello-cargo)) orchestrates
everything. Good structure scales a project from one file to a workspace
of libraries.

## 1. The module system

A **module** (`mod`) groups related items and forms a namespace. Modules
nest, creating a tree rooted at the crate:

```rust
mod network {
    pub mod client {              // pub: visible outside `network`
        pub fn connect() { /* ... */ }
    }
    fn private_helper() { /* ... */ }   // private to `network` by default
}

network::client::connect();       // reach an item by its path
```

Modules can be inline (`mod name { ... }`) or in separate files (`mod
network;` loads `network.rs` or `network/mod.rs`). They organize code and,
crucially, define **privacy boundaries**.

## 2. Privacy: private by default

Everything in Rust is **private to its module by default**; you opt into
visibility with `pub`:

```rust
mod store {
    pub struct Item {             // the struct is public...
        pub name: String,         // ...and this field is public
        price: u32,               // ...but this field stays private
    }
    pub fn make(name: String) -> Item { /* ... */ }
}
```

A child module can see its ancestors' private items, but a parent can't
see into a child's privates — encapsulation flows downward. `pub` has
finer grades too: `pub(crate)` (visible anywhere in this crate),
`pub(super)` (visible to the parent). Privacy lets a module expose a
clean API while hiding its internals, the same encapsulation goal as
`private` elsewhere — enforced at compile time.

## 3. Paths and use

You refer to items by **paths** — absolute (`crate::network::client`) or
relative (`self`, `super`). Typing full paths everywhere is tedious, so
**`use`** brings a name into scope:

```rust
use crate::network::client;
use std::collections::HashMap;          // bring HashMap into scope
use std::io::{self, Write};             // multiple items at once
use std::fmt::Result as FmtResult;      // rename to avoid a clash

client::connect();
let map: HashMap<String, i32> = HashMap::new();
```

Convention: `use` *functions'* parent module (call `client::connect()`,
so it's clear `connect` isn't local) but bring *types* in directly
(`HashMap`). `as` renames to resolve conflicts. `pub use` **re-exports** —
exposing an inner item at a more convenient public path (the basis of a
crate's curated "prelude").

## 4. Crates: the compilation unit

A **crate** is the unit the compiler builds at once. Two kinds:

- A **binary crate** has a `main` and compiles to an executable
  (`src/main.rs`).
- A **library crate** has no `main` and compiles to a reusable library
  others depend on (`src/lib.rs`).

The file at the crate root (`main.rs` or `lib.rs`) is the top of the
module tree. Many packages have *both*: a library crate with the logic
and a thin binary crate that calls it — a clean structure that makes the
core logic reusable and testable independently of the CLI wrapper.

## 5. Packages and workspaces

A **package** is what Cargo manages — one `Cargo.toml`, containing one or
more crates (at most one library, any number of binaries). For larger
projects, a **workspace** groups multiple related packages so they share
one `Cargo.lock` and `target/` and build together:

```toml
# top-level Cargo.toml
[workspace]
members = ["core", "cli", "web"]
```

```
myproject/
├── Cargo.toml          # workspace manifest
├── core/   (library crate)
├── cli/    (binary crate, depends on core)
└── web/    (binary crate, depends on core)
```

Workspaces are how big Rust projects (and the compiler itself) are
organized: shared dependencies, coordinated builds, crates that depend on
each other locally. Start with one package; graduate to a workspace when a
project grows several cooperating components.

## 6. Dependencies and crates.io

External libraries (**crates**) come from **crates.io**, the central
registry ([Chapter 2](/rust/part-1-getting-started/hello-cargo)). Add one
with `cargo add` or by editing `Cargo.toml`:

```toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }   # with an optional feature
rand = "0.8"
tokio = { version = "1", features = ["full"] }
```

```rust
use serde::Serialize;       // use a dependency like any module
```

Cargo resolves the dependency graph, downloads from crates.io, respects
**semantic versioning** (`"1.0"` means `>=1.0.0, <2.0.0`), and records
exact versions in **`Cargo.lock`** for reproducible builds. **Features**
are optional capabilities a crate exposes (e.g. `serde`'s `derive`), so
you compile only what you use.

> :nerdygoose: The crates.io + Cargo + semver combination is why Rust's
> ecosystem feels so frictionless compared to C/C++'s patchwork of
> system package managers, vendored sources, and hand-rolled Makefiles.
> `cargo add tokio` and you're using an industrial async runtime in one
> line, with versions resolved and pinned reproducibly. This integrated
> dependency story — a single registry, a single build tool, a lockfile
> by default — is a big part of why people are *productive* in Rust
> quickly, despite the language's learning curve.

## 7. The module/crate mental model

The pieces nest into a clear hierarchy:

- **Item** (function, struct, ...) lives in a **module**.
- **Modules** form a tree within a **crate**.
- A **crate** (binary or library) is the compilation unit, with a root
  file.
- A **package** (one `Cargo.toml`) bundles crates and is the unit of
  publishing.
- A **workspace** groups packages.
- **crates.io** hosts published packages for everyone.

`pub` controls visibility at each module boundary; `use` brings paths
into scope; Cargo builds it and wires in dependencies. Internalize this
and a sprawling codebase becomes navigable: you always know *where* an
item lives and *who* can see it.

## 8. Documentation and publishing

Two ecosystem niceties worth knowing. **Doc comments** (`///` for an
item, `//!` for a module, [Chapter 3](/rust/part-1-getting-started/basic-syntax))
generate HTML docs with `cargo doc`, and their code examples are run as
tests ([Chapter 22](/rust/part-6-ecosystem/testing-and-tooling)). And
publishing a crate is one command — `cargo publish` — which uploads to
crates.io for anyone to use.

This low-friction loop (write code, document it, test the docs, publish)
is why crates.io has grown so large and the docs (on **docs.rs**,
auto-generated for every published crate) are so consistently good. The
tooling makes sharing the *default*, not a chore — and you benefit as both
a consumer and, eventually, a publisher.

> :weightliftinggoose: Organization is a skill worth building early.
> Master the core moves: **`mod`** to group, **`pub`** to expose (private
> by default — opt in), **`use`** to bring paths into scope, and a
> **library + thin binary** split so your logic is reusable and testable.
> Know the ladder — item → module → crate → package → workspace → crates.io
> — and lean on **Cargo** for everything (`cargo add`, `cargo build`,
> `Cargo.lock` for reproducibility). Clean module boundaries and good
> `pub` discipline keep a growing project sane.

## What we covered

- **Modules** (`mod`) group code into a tree and define **privacy
  boundaries**; everything is **private by default**, `pub` (and
  `pub(crate)`/`pub(super)`) opts into visibility.
- **Paths** (absolute/relative) name items; **`use`** brings them into
  scope (`as` to rename, `pub use` to re-export).
- A **crate** is the compilation unit — **binary** (`main.rs`) or
  **library** (`lib.rs`); a common pattern is a library plus a thin
  binary.
- A **package** (one `Cargo.toml`) bundles crates; a **workspace** groups
  packages for big projects.
- **Dependencies** come from **crates.io** via `cargo add`; Cargo resolves
  **semver**, pins versions in **`Cargo.lock`**, and gates optional
  **features**.
- **Doc comments** generate docs (`cargo doc`, docs.rs) and run as tests;
  **`cargo publish`** shares a crate — low-friction sharing by default.

## What's next

[Chapter 21](/rust/part-6-ecosystem/macros) — macros. Rust's
metaprogramming: **declarative** macros (`macro_rules!`) and
**procedural** macros (including the `#[derive]` you've used all along) —
code that writes code, checked at compile time.
