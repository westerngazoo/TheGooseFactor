---
sidebar_position: 3
title: "Async/await"
---

# Async/await

> Concurrency without a thread per task. **`async`/`.await`** let you
> write thousands of concurrent I/O operations as straightforward,
> sequential-looking code, scheduled cooperatively onto a few threads.
> The building block is the **future** — a lazy computation that makes
> progress when polled.

Threads ([Chapter 16](/rust/part-5-concurrency/threads-send-sync)) give
real parallelism, but each OS thread costs memory and context-switching,
so a thread-per-connection model collapses at tens of thousands of
connections. For **I/O-bound** workloads — web servers, network clients —
Rust offers **async**: lightweight tasks that yield the thread while
waiting, so a handful of threads juggle huge numbers of operations.

## 1. Concurrency vs parallelism

A distinction worth nailing down:

- **Parallelism**: doing many things *at the same time* on multiple
  cores. Threads ([Chapter 16](/rust/part-5-concurrency/threads-send-sync))
  are the tool — great for CPU-bound work.
- **Concurrency**: *managing* many things at once, making progress on
  each, not necessarily simultaneously. Async is the tool — great for
  I/O-bound work, where tasks spend most of their time *waiting*.

When a task is waiting on the network or disk, the CPU is idle. Async
lets *another* task use that idle time on the same thread. You get
massive concurrency (many in-flight operations) without massive
parallelism (many threads).

## 2. The problem with blocking

A normal (blocking) read parks the entire thread until data arrives:

```rust
let data = socket.read();   // BLOCKS this thread until bytes arrive
```

Handle 10,000 connections this way and you need ~10,000 threads, most
just *sitting* blocked — wasteful in memory and scheduler overhead. The
fix is to **not block**: when a task would wait, it should *yield* the
thread so other tasks run, and resume when its data is ready. That
yielding-and-resuming is exactly what `async`/`.await` automate.

## 3. Futures: lazy computations

An `async` block or function produces a **`Future`** — a value
representing a computation that *isn't done yet*. The core trait
(simplified):

```rust
trait Future {
    type Output;
    fn poll(&mut self, cx: &mut Context) -> Poll<Self::Output>;
    // Poll is either Pending (not ready) or Ready(value)
}
```

A future is **lazy**: creating it does nothing. A **runtime** (§5)
*polls* it; each `poll` makes as much progress as it can, then returns
`Pending` (and arranges to be polled again when ready) or `Ready(value)`.

> :surprisedgoose: A Rust future does **nothing until awaited** — calling
> an `async fn` just *builds* the future; no work happens until a runtime
> polls it. This trips up newcomers from JavaScript, where a `Promise`
> starts running the moment it's created. Rust's laziness is deliberate:
> the compiler turns your `async` code into a state machine that the
> runtime drives, with zero heap allocation per `.await` and no hidden
> threads. "Zero-cost" ([Chapter 1](/rust/part-1-getting-started/why-rust))
> applies here too — the abstraction compiles down to an efficient state
> machine, not a pile of callbacks.

## 4. async and .await

The syntax keeps async code looking *sequential*, even though it yields
under the hood. Mark a function `async` (it now returns a future), and
**`.await`** a future to suspend until it's ready:

```rust
async fn fetch_user(id: u32) -> User {
    let row = db.query(id).await;        // suspend here until the query returns
    let user = parse(row);
    user                                  // the future resolves to this
}

async fn run() {
    let user = fetch_user(1).await;       // await the whole thing
    println!("{}", user.name);
}
```

At each `.await`, if the awaited future isn't ready, the task **yields**
the thread (letting other tasks run) and resumes right here when the data
arrives. The code reads top-to-bottom like blocking code, but it never
blocks the thread — the compiler rewrites it into a state machine that
saves and restores local state across each suspension point.

## 5. Runtimes: not in the standard library

Here's a Rust-specific wrinkle: the standard library defines the
`Future` trait and `async`/`.await` syntax, but **does not include an
async runtime** — the executor that polls futures, the I/O reactor, the
task scheduler. You pick one as a dependency:

- **`tokio`** — the dominant runtime; full-featured (networking, timers,
  task spawning). The default for most async Rust.
- **`async-std`**, **`smol`** — alternatives with different trade-offs.

```rust
#[tokio::main]                  // sets up the tokio runtime around main
async fn main() {
    let user = fetch_user(1).await;
    println!("{}", user.name);
}
```

The `#[tokio::main]` macro wraps `main` in a runtime that drives your
top-level future. This "bring your own runtime" design keeps the language
unopinionated and lets the ecosystem evolve runtimes independently — but
it does mean you choose and add one.

## 6. Spawning concurrent tasks

Inside a runtime you **spawn** tasks (the async analogue of threads) and
run futures **concurrently**. Combinators like `join!` await several at
once:

```rust
// Run two fetches concurrently and wait for both:
let (a, b) = tokio::join!(fetch_user(1), fetch_user(2));

// Spawn an independent task onto the runtime:
let handle = tokio::spawn(async { do_work().await });
let result = handle.await.unwrap();
```

`tokio::join!` polls both futures on the same thread, interleaving their
progress — two network requests overlap in wall-clock time without two
threads. `tokio::spawn` hands a task to the scheduler to run alongside
others. Thousands of these tasks ride on a small thread pool, because
each yields whenever it waits.

## 7. Async vs threads: which to use

They solve different problems; the choice is about the workload:

- **CPU-bound** (parsing, computation, image processing): use **threads**
  — you want real parallelism across cores, and there's no waiting to
  overlap.
- **I/O-bound, high concurrency** (web servers, proxies, scrapers, many
  network calls): use **async** — tasks spend their time waiting, so
  cooperative yielding lets a few threads serve enormous concurrency.
- **Mixed**: run CPU-heavy work on threads (`tokio::spawn_blocking` or a
  thread pool) and I/O on async tasks. Don't run blocking code directly
  on an async task — it stalls the whole scheduler.

The classic mistake is calling a *blocking* function inside an async task:
it parks the runtime's thread, defeating the point. Use async-aware
libraries (`tokio`'s I/O, async database drivers) throughout an async
program.

## 8. The cost: complexity and "function color"

Async isn't free in *developer* terms. The trade-offs:

- **"Colored functions"**: `async` functions can only be `.await`ed from
  other `async` contexts, so async tends to spread through a codebase
  (the "what color is your function" problem). Mixing sync and async takes
  care.
- **Trickier types and errors**: futures, `Pin`, lifetimes across
  `.await` points, and `Send` bounds on spawned tasks make async error
  messages harder than synchronous Rust.
- **Ecosystem buy-in**: you commit to a runtime and its async libraries.

So async is the right tool specifically when you need **high-concurrency
I/O**; for simpler programs or CPU work, plain threads (or just
synchronous code) are easier and perfectly fast. Use async where its
scaling actually pays for its complexity.

> :weightliftinggoose: Async is for **I/O-bound concurrency at scale** —
> not a general replacement for threads. The model: `async fn` returns a
> lazy **future** that does nothing until **`.await`**ed; a **runtime**
> (almost always **`tokio`**) polls it, and at each `.await` the task
> yields the thread instead of blocking, so a few threads serve thousands
> of tasks. Write it like sequential code; the compiler builds the state
> machine. Don't block inside async tasks, and reach for threads when the
> work is CPU-bound. When you need to serve ten thousand connections,
> async is how Rust does it without ten thousand threads.

## What we covered

- **Concurrency** (managing many waiting tasks) vs **parallelism** (many
  cores at once): async is for I/O-bound concurrency; threads for
  CPU-bound parallelism.
- Blocking I/O parks a whole thread — async lets a waiting task **yield**
  the thread so others run.
- An `async` block/fn produces a **`Future`** — *lazy*, does nothing until
  **polled** by a runtime (`Pending`/`Ready`).
- **`.await`** suspends a task until a future is ready and resumes in
  place; the compiler rewrites async code into a state machine.
- The std library has the trait/syntax but **no runtime** — add one
  (**`tokio`** dominant); `#[tokio::main]` drives the top-level future.
- **Spawn** tasks and use `join!` to run futures concurrently on a small
  thread pool.
- Use **threads for CPU-bound**, **async for high-concurrency I/O**; don't
  block inside async tasks. Async adds complexity ("colored functions",
  harder types) — use it where its scaling pays.

## What's next

[Chapter 19](/rust/part-5-concurrency/unsafe-rust) — unsafe Rust. The
escape hatch: a small set of operations the compiler can't verify (raw
pointers, FFI, manual invariants). We'll see what `unsafe` actually
permits, why safe abstractions are built on it, and the contract you take
on when you use it.
