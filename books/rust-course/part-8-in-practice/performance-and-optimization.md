---
sidebar_position: 2
title: "Performance and Optimization"
---

# Performance and Optimization

> Rust is fast by default — but "fast" demands *measure first*. This
> chapter is the performance mindset: **profile** before you optimize,
> understand **allocation** costs, know what `clone`/`Rc`/`Box` really
> cost, respect **data layout and cache**, reach for **SIMD** when it pays,
> and flip the **build settings** (LTO, `target-cpu`) that squeeze out the
> last of the speed.

Rust's zero-cost abstractions ([Chapter 1](/rust/part-1-getting-started/why-rust))
mean idiomatic code is usually already fast — iterators compile to tight
loops ([Chapter 14](/rust/part-4-data/iterators-and-closures)), generics
monomorphize ([Chapter 11](/rust/part-3-types/generics)), there's no GC. So
performance work in Rust is less about fighting the language and more about
*finding the real bottleneck* and *not doing unnecessary work*. The first
rule is the oldest one.

## 1. Measure first

The cardinal rule: **profile before you optimize.** Intuition about what's
slow is wrong more often than right, and optimizing the wrong thing wastes
effort and adds complexity for nothing. Rust's tooling:

- **Profilers**: `perf` (Linux), **`cargo flamegraph`** (visualize where
  time goes), Instruments (macOS), VTune. A flamegraph shows the hot path
  at a glance.
- **Benchmarks**: **Criterion** (`criterion` crate) — statistically
  rigorous micro-benchmarks with regression detection. Use
  **`std::hint::black_box`** to stop the optimizer from deleting the very
  work you're measuring.

```rust
// criterion sketch:
c.bench_function("parse", |b| b.iter(|| parse(black_box(input))));
```

Find the hot path *first*; optimize *only* it. A 2× speedup on code that's
1% of runtime is a 0.5% win and probably not worth the complexity.
"Premature optimization is the root of all evil" applies in Rust like
anywhere — measure, then act.

## 2. Allocation awareness

The biggest, most common Rust performance lever is **avoiding unnecessary
heap allocations**. Stack data is nearly free; heap allocation
([Chapter 15](/rust/part-4-data/smart-pointers)) costs an allocator call
(and later a free), and excessive allocation thrashes caches. Habits:

- **Avoid needless `clone()`**: each `clone` of a `String`/`Vec` is a heap
  allocation + copy. Borrow (`&`) instead when you only need to read
  ([Chapter 5](/rust/part-2-ownership/borrowing-and-references)). A `clone`
  in a hot loop is a classic culprit.
- **Take `&str`/`&[T]`, not `String`/`Vec`** for parameters
  ([Chapter 7](/rust/part-2-ownership/slices-and-strings)) — no allocation,
  more general.
- **Reserve capacity**: `Vec::with_capacity(n)` / `reserve` avoids repeated
  reallocations as a collection grows.
- **Reuse buffers**: clear and refill a `Vec` rather than allocating a new
  one each iteration.

Allocation is where "it compiles and it's correct" code most often leaves
performance on the table — and `clone`-to-please-the-borrow-checker is the
#1 beginner habit to outgrow ([Part II](/rust/part-2-ownership/ownership-and-moves)
exists so you don't have to clone).

## 3. The cost of clone, Rc, and Box

Know what the common tools actually cost:

- **`clone`**: a *deep* copy for `String`/`Vec` (allocate + copy all
  bytes); cheap for `Copy` types (just bytes). Visible in the source —
  every `.clone()` is a flag to ask "do I need this?"
- **`Box<T>`**: one heap allocation; a pointer indirection to access. Cheap,
  but not free — don't box small values needlessly.
- **`Rc<T>`/`Arc<T>`**: cloning bumps a reference count.
  **`Arc`** uses an **atomic** increment (cross-thread-safe but slower than
  `Rc`'s plain increment) — so don't reach for `Arc` when single-threaded
  `Rc` (or plain borrowing) suffices.
- **`Cow<'a, T>`** (clone-on-write): hold *either* a borrow *or* an owned
  value, allocating *only if* you actually mutate. Perfect for "usually
  borrow, occasionally need to own" — e.g. a function that usually returns
  its input unchanged but sometimes modifies it.

The theme: Rust makes costs *visible* (`.clone()`, `Arc::clone`, `Box::new`
are all explicit), so performance work is largely *reading your own code*
for costs you can remove — the opposite of a GC language where allocation
is invisible.

## 4. Iterators are already fast

A reassurance and a guideline: iterator chains
([Chapter 14](/rust/part-4-data/iterators-and-closures)) are **zero-cost** —
`.iter().filter(...).map(...).sum()` compiles to a single tight loop with no
intermediate collections and no closure overhead. So:

- **Don't** rewrite iterator chains as manual index loops "for speed" —
  they're already as fast, often faster (and index loops risk bounds-check
  costs and off-by-one bugs).
- **Do** avoid forcing intermediate allocations: chain adapters and consume
  once (`.filter().map().sum()`), rather than `.collect()`-ing into a `Vec`
  between steps. Each needless `collect()` is an allocation.
- **Do** use iterator methods that short-circuit (`find`, `any`, `take`)
  rather than processing the whole sequence.

The functional style is the *fast* style in Rust — lean into it, and just
avoid the one anti-pattern of materializing intermediates you don't need.

## 5. Data layout and cache

On modern hardware, **memory access patterns** often matter more than
instruction count — a cache miss costs hundreds of cycles. Rust gives you
control:

- **Cache locality**: iterating a `Vec<T>` (contiguous) is far faster than
  chasing pointers through a linked structure (`Vec<Box<T>>`, a tree). Keep
  hot data contiguous.
- **`#[repr(C)]` / field order**: Rust reorders struct fields by default;
  `#[repr(C)]` fixes layout (needed for FFI,
  [Chapter 27](/rust/part-7-advanced-types/advanced-unsafe-and-ffi)), and
  ordering fields large-to-small reduces padding.
- **Struct-of-Arrays (SoA) vs Array-of-Structs (AoS)**: if you process one
  field across many items, storing each field in its own array (SoA) packs
  the accessed data and is cache-friendlier than an array of full structs
  (AoS). Common in data-heavy and game code.
- **Avoid false sharing**: in concurrent code, two threads writing
  different fields that share a cache line contend; pad to separate lines.

These are the same considerations a C performance engineer has — Rust just
lets you express them safely. When a hot loop is memory-bound (most are),
layout beats micro-optimizing arithmetic.

## 6. SIMD and parallelism

For data-parallel hot loops, two levers:

- **Auto-vectorization**: the optimizer (via LLVM) automatically turns some
  loops into **SIMD** (process multiple elements per instruction). Write
  simple, branch-light loops over slices and check whether they vectorized
  (inspect the assembly, or use `cargo asm`).
- **Explicit SIMD**: `std::simd` (portable, nightly) or
  architecture-specific intrinsics for guaranteed vectorization when
  auto-vectorization won't bite.
- **Data parallelism**: **`rayon`** turns `.iter()` into `.par_iter()` — a
  one-line change to run an iterator chain across all cores, with the
  borrow checker still guaranteeing data-race freedom
  ([Chapter 16](/rust/part-5-concurrency/threads-send-sync)).

`rayon` is the highest-leverage parallelism in Rust: fearless concurrency
([Chapter 16](/rust/part-5-concurrency/threads-send-sync)) means you can
parallelize a loop by changing `iter` to `par_iter` and trust it's correct.
For embarrassingly-parallel work, that's often the biggest single win
available.

## 7. Build settings

A surprising amount of speed is just **build configuration** — make sure
you're measuring and shipping an optimized build:

- **`--release`**: the most common mistake is benchmarking a *debug* build
  (often 10–100× slower, with overflow checks and no inlining). Always
  `cargo build --release` for performance.
- **`opt-level`**: `3` (default release) for speed, `"s"`/`"z"` for size.
- **LTO** (`lto = true` in `Cargo.toml`): **link-time optimization** —
  cross-crate inlining and optimization (cf. the compiler course's LTO),
  smaller and faster binaries, slower builds.
- **`codegen-units = 1`**: maximizes optimization (less parallel codegen,
  more cross-function optimization) at the cost of compile time.
- **`target-cpu=native`** (via `RUSTFLAGS`): use your CPU's full instruction
  set (enables more SIMD) — but the binary won't run on older CPUs.
- **PGO** (profile-guided optimization): compile, profile a real workload,
  recompile using the profile to optimize hot paths — the last few percent.

These are free speed for production builds — set LTO and `codegen-units=1`
in your release profile, build with `--release`, and you've captured most
of the compiler-side wins before touching your code.

## 8. The performance mindset

Tie it together into a discipline:

1. **Write idiomatic Rust first** — it's usually fast (zero-cost
   abstractions, no GC). Don't pre-pessimize *or* pre-optimize.
2. **Build `--release` and profile** — find the *actual* hot path; never
   guess.
3. **Attack the hot path**: cut allocations (`clone`, needless `collect`),
   fix layout/cache, parallelize with `rayon`, vectorize if it's
   data-parallel.
4. **Measure again** — confirm the change helped; keep it only if it did.
5. **Tune the build** — LTO, `codegen-units=1`, `target-cpu`, maybe PGO.
6. Reach for **`unsafe`** ([Chapter 27](/rust/part-7-advanced-types/advanced-unsafe-and-ffi))
   *only* if profiling proves a safe construct is the bottleneck — almost
   never.

The Rust-specific insight: because costs are *visible* (explicit `clone`,
explicit `Arc`, explicit allocation) and abstractions are *zero-cost*,
performance work is mostly *removing unnecessary work you can see in your
own source*, not low-level bit-twiddling. Measure, remove waste on the hot
path, and let the compiler do the rest.

> :weightliftinggoose: Performance is a discipline, not a reflex: **measure
> first** (profile with `cargo flamegraph`, benchmark with **Criterion** +
> `black_box`), then attack the **hot path** only. The biggest levers:
> **cut allocations** (needless `.clone()`, intermediate `.collect()`;
> prefer `&str`/`&[T]`, `with_capacity`, `Cow`), **respect cache/layout**
> (contiguous data, SoA for hot fields), and **parallelize with `rayon`**
> (`iter` → `par_iter`, still data-race-free). Iterators are *already*
> zero-cost — don't hand-roll loops. And never benchmark a debug build —
> **`--release`** + LTO + `codegen-units=1`. Idiomatic Rust is fast; your
> job is removing the *visible* waste.

## What we covered

- **Measure first**: profile (`cargo flamegraph`, `perf`) and benchmark
  (**Criterion**, `black_box`) to find the real hot path before optimizing.
- **Allocation awareness** is the top lever: avoid needless `clone`, take
  `&str`/`&[T]`, `with_capacity`/`reserve`, reuse buffers.
- Know costs: `clone` (deep copy), `Box` (one alloc + indirection),
  `Rc`/**`Arc`** (refcount; `Arc` is **atomic**, slower), **`Cow`** (borrow
  or own, allocate only on mutation).
- **Iterators are zero-cost** — don't hand-roll loops; just avoid
  intermediate `collect()`s.
- **Data layout/cache**: contiguous data, field ordering/`#[repr]`,
  **SoA vs AoS**, avoid false sharing — often beats micro-opts.
- **SIMD** (auto-vectorization, `std::simd`) and **`rayon`** (`par_iter`,
  one-line, fearless) for data-parallel hot loops.
- **Build settings**: always **`--release`**; `lto`, `codegen-units = 1`,
  `target-cpu=native`, PGO for the last percent.
- The mindset: idiomatic-then-profile-then-attack-the-hot-path; costs are
  visible, so optimize by removing visible waste.

## What's next

[Chapter 30](/rust/part-8-in-practice/embedded-and-no-std) — embedded and
`no_std` Rust. Running Rust with **no operating system and no allocator**:
`#![no_std]`, the `core`/`alloc`/`std` split, the embedded ecosystem
(`embedded-hal`, RTIC, Embassy), and why Rust's safety + zero-cost +
no-GC profile makes it a landmark language for bare-metal systems.
