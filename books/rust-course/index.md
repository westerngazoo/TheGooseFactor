---
sidebar_position: 1
sidebar_label: Introduction
title: "The Rust Book"
slug: /
---

# The Rust Book

> Memory safety without a garbage collector. Fearless concurrency.
> Zero-cost abstractions. Rust's promises sound too good to be true —
> and the price is one genuinely new idea you must internalize:
> **ownership**. This course teaches Rust around that idea.

Rust occupies a unique spot: as fast as C and C++, as safe as a
garbage-collected language, with a type system that catches whole
categories of bugs at compile time. It achieves this without a garbage
collector, through a compile-time discipline called **ownership and
borrowing**. Learn that, and the rest of Rust follows.

## Why learn Rust?

- **Memory safety without GC.** No use-after-free, no double-free, no
  data races — *caught at compile time*, with no runtime garbage
  collector. You get C-level performance with safety guarantees C can't
  offer.
- **Fearless concurrency.** The same ownership rules that prevent memory
  bugs also prevent data races. Concurrent Rust that compiles is
  free of data races, by construction.
- **Zero-cost abstractions.** High-level features (iterators, generics,
  traits) compile to code as fast as hand-written low-level code. You
  don't pay for abstraction.
- **A type system that helps.** Rust's types catch bugs, document
  intent, and guide design. `Option` and `Result` make null-pointer and
  unhandled-error bugs structurally impossible.
- **It's loved.** Rust has topped "most admired language" surveys for
  years running. There's a reason.

The catch: Rust has a **learning curve**, almost entirely concentrated
in ownership ([Part II](/rust/part-2-ownership/ownership-and-moves)).
Push through that, and Rust becomes a joy.

## What this course teaches

A from-scratch path through Rust, organized around the central idea:

- **Part I — Getting Started.** Why Rust, the toolchain (cargo), and
  basic syntax.
- **Part II — Ownership.** The heart of Rust: ownership, moves,
  borrowing, references, lifetimes, and slices. The part that makes
  Rust *Rust*.
- **Part III — Types & Abstraction.** Structs, enums, pattern matching,
  traits, and generics — Rust's expressive type system.
- **Part IV — Error Handling & Collections.** `Result`/`Option`, the
  `?` operator, collections, iterators, closures, and smart pointers.
- **Part V — Concurrency.** Threads, `Send`/`Sync`, message passing,
  shared state, async/await, and `unsafe`.
- **Part VI — The Ecosystem.** Modules and crates, macros, testing, and
  where to go next.
- **Part VII — Advanced Types & Traits.** The type-system frontier:
  advanced traits, lifetimes and variance, zero-cost type-driven design
  (typestate, newtypes, const generics), and sound unsafe and FFI.
- **Part VIII — Rust in Practice.** Async internals (how `.await` really
  works), performance and optimization, embedded and `no_std` Rust, and the
  idioms and design philosophy that tie it all together.

Parts I–VI are the complete language; Parts VII–VIII are advanced deep
dives to take once the core is solid. See the
[Roadmap](/rust/table-of-contents) for the full chapter list.

## What this course assumes

- You can program in *some* language (variables, functions, loops,
  basic types).
- Some exposure to a systems language (C, C++) helps for the memory
  chapters but isn't required.
- Willingness to fight the borrow checker for a few days before it
  clicks. (Everyone does. Then it becomes second nature.)

No prior Rust needed. We start from `cargo new`.

## The one big idea: ownership

If you take one thing from this course, it's **ownership**. Every value
in Rust has a single **owner**; when the owner goes out of scope, the
value is freed. You can **borrow** references to a value (shared or
mutable), under rules the compiler enforces. These rules — one mutable
borrow *or* many shared borrows, never both; no reference outliving its
referent — are what guarantee memory safety and data-race freedom *at
compile time*, with zero runtime cost.

Ownership feels restrictive at first (the "borrow checker" rejects code
you think is fine). But it's encoding real correctness rules that other
languages leave to runtime checks (GC) or to luck (C). Once internalized,
it becomes a design tool, not an obstacle. [Part II](/rust/part-2-ownership/ownership-and-moves)
is devoted to it.

> :nerdygoose: Ownership isn't a Rust invention from nothing — it draws
> on decades of research into linear types, region-based memory
> management, and affine type systems. Rust's achievement was making
> these ideas *practical* for everyday systems programming, with
> ergonomics good enough that working programmers adopt them. It's
> theory that escaped academia and shipped.

## How to read it

Front to back, especially Parts I–II — ownership underpins everything
after it. **Install Rust and code along**: `rustup` gives you the
toolchain, `cargo` builds and runs, and the compiler's famously good
error messages teach you as you go. Fighting (and learning from) the
borrow checker is how Rust is learned.

> :weightliftinggoose: Rust is learned at the keyboard, fighting the
> compiler. Install it ([Chapter 2](/rust/part-1-getting-started/hello-cargo)),
> and when the borrow checker rejects your code, *read the error* — Rust's
> errors are tutorials, often suggesting the exact fix. The frustration
> of week one becomes the fluency of month one. Push through ownership;
> everything else is downhill.

Ready? [Part I, Chapter 1](/rust/part-1-getting-started/why-rust) makes
the case for what Rust is and why it's built the way it is.
