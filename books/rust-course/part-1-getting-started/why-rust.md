---
sidebar_position: 1
title: "Why Rust"
---

# Why Rust

> The case for Rust, and why it's built the way it is. Memory safety
> without a garbage collector is the headline; understanding *how* Rust
> delivers it frames everything that follows.

Before the syntax, the motivation. Rust makes an unusual promise:
**the safety of a high-level language with the performance of a
low-level one**. This chapter explains the problem Rust solves and the
idea that lets it.

## 1. The two-world problem

Programming languages have traditionally forced a choice:

- **Low-level languages** (C, C++): fast, close to the metal, full
  control over memory — but *unsafe*. You manage memory manually, and
  mistakes (use-after-free, buffer overflows, data races, null-pointer
  dereferences) cause crashes, corruption, and security
  vulnerabilities. The majority of serious security bugs in C/C++
  software are memory-safety bugs.
- **High-level languages** (Java, Python, Go, JavaScript): safe — a
  garbage collector manages memory, so no use-after-free — but you pay
  with runtime overhead (the GC), less control, and (often) slower
  execution.

For decades, "fast" meant "unsafe" and "safe" meant "has a GC." Rust
refuses the choice: **fast *and* safe, with no garbage collector.**

## 2. How: compile-time ownership

Rust's trick is to move memory management from *runtime* (GC) to
*compile time* (the type system). The **ownership** system tracks, at
compile time, who owns each value and when it's freed — so the compiler
inserts frees automatically and *proves* there are no use-after-free or
double-free bugs, all before the program runs.

The result:

- **No GC**: memory is freed deterministically when its owner goes out
  of scope — no runtime collector, no pauses, predictable performance.
- **No memory bugs**: use-after-free, double-free, and data races are
  *compile errors*, not runtime crashes.
- **No overhead**: the safety is enforced at compile time, so it costs
  nothing at runtime.

This is the central bargain ([Part II](/rust/part-2-ownership/ownership-and-moves)):
accept a stricter compiler (the "borrow checker") in exchange for
safety + speed + no GC. The strictness is real, but it's encoding
correctness rules you'd otherwise have to get right by hand (in C) or
pay for at runtime (with a GC).

> :nerdygoose: The deep insight: most memory-safety rules are
> *statically checkable* — you don't need to wait until runtime to know
> that a pointer is being used after the thing it points to was freed.
> The information is there at compile time; you just need a type system
> expressive enough to track it. Rust built that type system. The GC's
> runtime work becomes the compiler's compile-time proof. Pay once (at
> compile time) instead of forever (at runtime).

## 3. Zero-cost abstractions

Rust's second promise: **abstractions that cost nothing at runtime.**
You can write high-level code — iterators, generics, traits, closures —
and it compiles to machine code as efficient as if you'd hand-written
the low-level version. The abstraction exists at compile time and
evaporates in the generated code.

```rust
// High-level: iterator chain
let sum: i32 = numbers.iter().filter(|&&x| x > 0).map(|&x| x * x).sum();
```

This compiles to a tight loop with no allocations, no function-call
overhead, no iterator objects at runtime — as fast as a hand-written C
`for` loop. "Zero-cost" means you don't choose between expressive and
fast; you get both. (The term comes from C++'s philosophy; Rust
delivers it more thoroughly because of its ownership model.)

## 4. Fearless concurrency

Concurrency is hard because of **data races** — two threads accessing
the same memory, at least one writing, without synchronization. Data
races cause the worst bugs: nondeterministic, hard to reproduce,
catastrophic.

Rust's ownership rules — specifically, "either one mutable reference or
many shared references, never both"
([Chapter 5](/rust/part-2-ownership/borrowing-and-references)) — happen
to *also* prevent data races. Two threads can't both have mutable access
to the same data, because the borrow checker forbids two mutable
references. So **data races are compile errors**. Concurrent Rust that
compiles is data-race-free, by construction. This is called "fearless
concurrency" ([Part V](/rust/part-5-concurrency/threads-send-sync)) —
you can write concurrent code without the usual dread, because the
compiler catches the races.

> :surprisedgoose: The same rule that prevents memory bugs prevents
> data races. "One mutable borrow XOR many shared borrows" rules out
> the aliasing-plus-mutation that causes use-after-free *and* the
> shared-mutable-state that causes data races. One mechanism, two whole
> classes of bugs eliminated. This unification — memory safety and
> thread safety from the same principle — is Rust's most elegant
> result.

## 5. The type system that helps

Rust's types do more than catch type errors — they *encode invariants*:

- **`Option<T>`** instead of null: a value that might be absent is an
  `Option`, and you *must* handle the `None` case — no null-pointer
  dereferences ([Chapter 12](/rust/part-4-data/error-handling)).
- **`Result<T, E>`** instead of exceptions: a fallible operation returns
  a `Result`, and you *must* handle the error — no forgotten error
  checks.
- **Enums with data** (sum types): model "one of these alternatives"
  precisely; `match` forces you to handle every case
  ([Chapter 9](/rust/part-3-types/pattern-matching)).
- **Traits**: shared behavior without inheritance's pitfalls
  ([Chapter 10](/rust/part-3-types/traits)).

The type system makes illegal states *unrepresentable* and forces you
to handle the cases you'd otherwise forget. "If it compiles, it works"
is an exaggeration — but Rust gets closer than most languages.

## 6. Where Rust is used

Rust isn't academic — it ships real systems:

- **Systems software**: operating systems (Redox, parts of Linux/Windows
  kernels now), embedded, drivers.
- **Web infrastructure**: Cloudflare, Discord, Dropbox, AWS use Rust for
  performance-critical services.
- **WebAssembly**: Rust is a top choice for WASM (small, fast, no GC
  runtime to ship).
- **CLI tools**: ripgrep, fd, bat — fast, reliable command-line tools.
- **Blockchain, game engines, databases, browsers** (Firefox's Servo/
  Stylo): performance + safety domains.

It's increasingly the default for "I need C-level performance but can't
afford C's bugs."

## 7. The cost: the learning curve

Honesty: Rust is *harder to learn* than most languages, and the
difficulty is concentrated in **ownership and borrowing**
([Part II](/rust/part-2-ownership/ownership-and-moves)). Newcomers
universally hit the "fighting the borrow checker" phase — writing code
that seems obviously fine, which the compiler rejects, with rules that
feel arbitrary until they click.

They're *not* arbitrary — they're the rules that make the safety
guarantees hold. But internalizing them takes a few days to a few
weeks. The payoff: once ownership is second nature, you write correct,
fast systems code with a confidence other languages can't give. The
curve is real; so is the reward. This course is structured to get you
through the curve as smoothly as possible.

> :weightliftinggoose: Rust's learning curve is front-loaded and worth
> it. The borrow checker will reject your code, repeatedly, in week one
> — that's the workout. Read the (excellent) error messages, learn the
> rule each rejection teaches, and within a few weeks ownership becomes
> intuition. After that you're writing memory-safe, data-race-free,
> C-fast code as a matter of course. Few skills in programming pay
> dividends like internalizing Rust's ownership model.

## What we covered

- Languages traditionally force **fast-but-unsafe** (C/C++) vs
  **safe-but-GC** (Java/Go/Python); Rust refuses the choice.
- Rust moves memory management to **compile time** via **ownership** —
  no GC, no memory bugs, no runtime overhead.
- **Zero-cost abstractions**: high-level code compiles as fast as
  hand-written low-level code.
- **Fearless concurrency**: the same ownership rule that prevents memory
  bugs prevents **data races** — compile errors, not runtime disasters.
- The **type system helps**: `Option` (no null), `Result` (no forgotten
  errors), enums + `match` (handle every case), traits.
- Used in systems software, web infra, WASM, CLI tools, and more.
- The **cost** is a real learning curve concentrated in ownership —
  front-loaded, and worth it.

## What's next

[Chapter 2](/rust/part-1-getting-started/hello-cargo) — Hello, Cargo.
Installing Rust with rustup, the cargo build tool, and your first
program — getting hands on the toolchain you'll use throughout.
