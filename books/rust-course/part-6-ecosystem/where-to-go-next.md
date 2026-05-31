---
sidebar_position: 4
title: "Where to Go Next"
---

# Where to Go Next

> The send-off. A look back at the arc — from ownership to fearless
> concurrency — then the crates, domains, and resources that take you from
> "finished the course" to "shipping real Rust."

You've reached the end of the *core* course. You started with *why* Rust
exists and you've arrived at its ecosystem, having passed through the
hardest and most rewarding ideas in modern systems programming. This
chapter points you onward: what you now know, where Rust is used, the
crates and books that go deeper, and how to keep the momentum. (And if you
want to go deeper *within* this course first, two advanced parts await —
[Part VII — Advanced Types & Traits](/rust/part-7-advanced-types/advanced-traits)
and [Part VIII — Rust in Practice](/rust/part-8-in-practice/async-internals)
— covering the type-system frontier, async internals, embedded, and the
idioms that turn "writing Rust" into "thinking in Rust.")

## 1. What you now know

Look back at the climb:

- **[Part I](/rust/part-1-getting-started/why-rust)**: why Rust (safe +
  fast, no GC), the toolchain, and the syntax fundamentals.
- **[Part II](/rust/part-2-ownership/ownership-and-moves)**: **ownership**,
  borrowing, lifetimes, slices — the heart of Rust, and the source of its
  guarantees.
- **[Part III](/rust/part-3-types/structs-and-enums)**: structs, enums,
  pattern matching, traits, generics — modeling data and abstracting
  behavior, at zero cost.
- **[Part IV](/rust/part-4-data/error-handling)**: error handling
  (`Result`/`?`), collections, iterators and closures, smart pointers.
- **[Part V](/rust/part-5-concurrency/threads-send-sync)**: **fearless
  concurrency** — threads, message passing, shared state, async, and the
  unsafe escape hatch.
- **[Part VI](/rust/part-6-ecosystem/modules-crates-cargo)**: organizing,
  testing, and sharing code in the ecosystem.

The keystone is ownership ([Part II](/rust/part-2-ownership/ownership-and-moves)).
Everything else — no data races, no null, no GC, zero-cost abstractions —
follows from those rules. If ownership now feels like intuition rather
than a fight, you've gotten the hard part. That's the foundation
everything else stands on.

## 2. The borrow checker is now your ally

A word on the journey itself. Early on, the borrow checker felt like an
adversary ([Chapter 1](/rust/part-1-getting-started/why-rust) warned you).
By now, ideally, it feels like a meticulous colleague catching real
mistakes before they ship. That shift — from "fighting the borrow
checker" to "the compiler has my back" — is the milestone that marks a
Rust programmer.

If you're not all the way there, that's normal; it comes with mileage.
Keep reading the error messages (they teach), keep writing code, and the
rules keep clicking. The reward is real: once ownership is second nature,
you write memory-safe, data-race-free, C-fast code as a matter of course —
a confidence few languages can offer.

## 3. Key crates to know

Rust's standard library is deliberately small; the ecosystem fills in the
rest. The crates you'll meet again and again:

- **`serde`** — serialization/deserialization (JSON, etc.); the
  near-universal data crate.
- **`tokio`** — the async runtime ([Chapter 18](/rust/part-5-concurrency/async-await))
  for networking and concurrency.
- **`clap`** — ergonomic command-line argument parsing for CLI tools.
- **`anyhow`** / **`thiserror`** — application and library error handling
  ([Chapter 12](/rust/part-4-data/error-handling)).
- **`reqwest`** (HTTP client), **`axum`** / **`actix-web`** (web servers),
  **`sqlx`** / **`diesel`** (databases).
- **`rayon`** — trivially parallel iterators (data parallelism with a
  one-line change).

A handful — `serde`, `tokio`, `clap`, `anyhow` — show up in a huge share
of real projects. Learning them is most of "learning the ecosystem."

## 4. Where Rust shines: pick a domain

Rust has matured into several thriving niches
([Chapter 1](/rust/part-1-getting-started/why-rust)). Pick one that
excites you and build something real:

- **Command-line tools** — the easiest on-ramp; fast, single-binary, great
  libraries (`clap`). Reimplement a familiar tool.
- **Web backends** — `axum`/`actix` + `sqlx` + `tokio`; high-performance
  services with compile-time safety.
- **WebAssembly** — Rust is a top WASM language (small, fast, no GC); run
  Rust in the browser via `wasm-bindgen`.
- **Embedded / systems** — microcontrollers, drivers, OS work; the
  `no_std` ecosystem and `embassy` for async embedded.
- **Game dev** — `bevy`, an ambitious data-driven engine.
- **Data / performance** — `polars` (dataframes), `rayon`, number
  crunching where you need speed without C's risks.

The fastest way to consolidate everything in this course is a **project**
in a domain you care about. Reading taught you the rules; building makes
them yours.

## 5. The canonical resources

To go deeper:

- **"The Rust Programming Language"** (the official "Book") — free online,
  the definitive introduction. A perfect complement to revisit topics in
  more depth.
- **Rust by Example** — runnable, example-driven; great for "how do I do
  X?"
- **Rustlings** — small interactive exercises that fix Rust syntax and
  ownership in your fingers. Do these alongside the reading.
- **"Programming Rust"** (Blandy, Orendorff, Tindall) — a thorough,
  excellent book for going deep.
- **The standard library docs** (`std`) and **docs.rs** — superb, and
  (thanks to doc tests, [Chapter 22](/rust/part-6-ecosystem/testing-and-tooling))
  reliably accurate.
- **"Rust for Rustaceans"** (Jon Gjengset) — intermediate/advanced, for
  *after* you're comfortable; his videos are gold too.

> :nerdygoose: A recurring theme worth appreciating: the Rust community
> invests enormously in *learning materials and tooling*, not just the
> language. The Book is free and excellent; Rustlings makes practice
> interactive; docs.rs gives every crate consistent, tested docs;
> `clippy` mentors you as you code. This culture — alongside famously
> welcoming community spaces — is a large part of why people push through
> the learning curve. You're learning a language whose ecosystem
> genuinely *wants* you to succeed.

## 6. How to keep growing

Concrete next steps, in rough order:

1. **Build a project** — a CLI tool is the ideal first one. Ship it; the
   gaps in your understanding will surface and close.
2. **Do Rustlings** — fast, targeted practice that cements syntax and
   ownership.
3. **Read the official Book** — revisit the trickier chapters (lifetimes,
   traits, async) in another voice.
4. **Read real code** — study a well-regarded crate in a domain you like;
   idioms transfer by osmosis.
5. **Lean on `clippy`** — let it teach you idiomatic Rust, lint by lint.
6. **Join the community** — the users forum, r/rust, and the Discord are
   friendly and deep; ask questions, read others'.

Consistency beats intensity. A small project plus Rustlings plus reading
one crate's source will teach you more than any amount of passive
reading.

## 7. The cheat sheet and reference

Don't forget the appendix to this course — built for exactly the moments
you'll hit while building:

- The **[cheat sheet](/rust/appendix/cheat-sheet)** — the core syntax,
  ownership/borrowing rules, and common idioms on one page, for quick
  recall.
- The **[glossary](/rust/appendix/glossary)** — the vocabulary (move,
  borrow, lifetime, trait, `Send`/`Sync`, ...) defined concisely.
- **[Further reading](/rust/appendix/further-reading)** — the resources
  above with links and a setup refresher.

Keep them open in a tab while you build your first projects; they're
faster than re-reading a chapter when you just need to recall a rule or a
piece of syntax.

## 8. A final word

Rust asks more of you up front than almost any language — and gives more
back. You learned to think about *who owns what, for how long*, and in
return the compiler hands you memory safety, data-race freedom, and
C-level speed, all at once, with no garbage collector. That bargain — a
stricter compiler in exchange for guarantees you'd otherwise chase at
runtime or get wrong by hand — is Rust's whole thesis, and you've now
lived it end to end.

The learning curve was front-loaded and real. You climbed it. What's on
the other side is the ability to write fast, reliable systems with a
confidence that's genuinely rare in this field. So go build something —
a tool, a service, a toy OS, whatever pulls you — and keep a REPL of
`cargo check` running. The language rewards the climb the whole way up.

> :weightliftinggoose: That's the course — from "why Rust" to fearless
> concurrency and the ecosystem. The single best next move: **build
> something real** (start with a CLI tool), do **Rustlings** on the side,
> and keep the official **Book** open for depth. Lean on **`clippy`** to
> learn idioms and the **community** when you're stuck. You've already
> done the hard part — internalizing ownership; everything from here is
> applying it. Welcome to the Goose Zone of systems programming: strict,
> fast, safe, and deeply worth it. Go ship.

## What we covered

- A recap of the arc: why Rust → ownership → types/abstraction → error
  handling & data → concurrency → ecosystem, all resting on **ownership**.
- The journey from **fighting the borrow checker** to it being your ally —
  the milestone of a Rust programmer.
- **Key crates**: `serde`, `tokio`, `clap`, `anyhow`/`thiserror`, web/db
  crates, `rayon`.
- **Domains** to build in: CLI tools (start here), web, WASM,
  embedded/systems, games, data.
- **Resources**: the official Book, Rust by Example, **Rustlings**,
  "Programming Rust", docs.rs, "Rust for Rustaceans".
- **How to grow**: build a project, do Rustlings, read the Book and real
  crates, lean on `clippy`, join the community.
- The appendix: [cheat sheet](/rust/appendix/cheat-sheet),
  [glossary](/rust/appendix/glossary),
  [further reading](/rust/appendix/further-reading).

## Where to go next

[Back to the introduction](/rust/) · [the roadmap](/rust/table-of-contents)
· or straight to building. The appendix has a
[cheat sheet](/rust/appendix/cheat-sheet), a
[glossary](/rust/appendix/glossary), and
[further reading](/rust/appendix/further-reading). Now go write some Rust.
