---
sidebar_position: 1
title: "Async Internals"
---

# Async Internals

> What actually happens under `.await`? An `async` function compiles to a
> **state machine** that implements the **`Future`** trait; an
> **executor** drives it by calling **`poll`**, and a **`Waker`** tells the
> executor when to poll again. **`Pin`** exists because these state
> machines are self-referential. Understanding this turns async from magic
> into mechanism.

[Chapter 18](/rust/part-5-concurrency/async-await) taught async/await as a
user: `async fn`, `.await`, a runtime like Tokio. This chapter opens the
hood. You don't need this to *use* async, but understanding the machine
explains the confusing parts — `Pin`, the `Send` bounds, "why did my task
deadlock when I held a lock across `.await`?" — and demystifies one of
Rust's most opaque features.

## 1. The Future trait

An `async` block doesn't run anything — it builds a **`Future`**, a value
representing a computation that may not be finished. The trait, simplified:

```rust
trait Future {
    type Output;
    fn poll(self: Pin<&mut Self>, cx: &mut Context) -> Poll<Self::Output>;
}

enum Poll<T> {
    Ready(T),     // done, here's the result
    Pending,      // not done yet — I'll wake you when there's progress
}
```

A future is **lazy** and **poll-driven**: someone calls `poll`; the future
makes as much progress as it can, then returns `Ready(value)` (finished) or
`Pending` (blocked, e.g. waiting on I/O). Nothing happens until something
*polls* it — which is why creating a future does no work
([Chapter 18](/rust/part-5-concurrency/async-await)). The whole async
system is built on this one method.

## 2. async/await compiles to a state machine

The compiler transforms an `async fn` into a **state machine** — a struct
holding the function's live locals, plus an enum of *states* corresponding
to the `.await` points. Each `poll` resumes at the saved state, runs until
the next `.await` that returns `Pending`, saves state, and returns:

```rust
async fn example() {
    let a = step_one().await;     // suspension point 1
    let b = step_two(a).await;    // suspension point 2
    finish(b);
}
// roughly compiles to:
enum ExampleState { Start, AwaitingOne, AwaitingTwo(/* locals */), Done }
// poll(): match state → resume → run to next await → save state → Pending/Ready
```

Each `.await` is a place the function can **suspend**: `poll` drives it to
the next suspension, and if the awaited future is `Pending`, this future
returns `Pending` too (propagating up). The locals that must survive across
a suspension become fields of the state-machine struct. The compiler writes
this transformation for you — your sequential-looking async code *is* a
hand-rolled poll loop, generated.

## 3. The executor and the Waker

A future does nothing on its own — an **executor** (the heart of a runtime
like Tokio, [Chapter 18](/rust/part-5-concurrency/async-await)) drives it:
it polls the top-level future, and when a future returns `Pending`, the
executor *sets it aside* — but how does it know when to poll again?

The **`Waker`** (carried in the `Context` passed to `poll`). When a future
returns `Pending`, it first registers the `Waker` with whatever it's
waiting on (the I/O reactor, a timer). When the awaited event fires, that
source calls `waker.wake()`, which tells the executor "this task can make
progress now — re-poll it." So the loop is:

```
executor: poll(task) → Pending → park the task
   ... I/O completes ... source calls waker.wake() ...
executor: this task is ready → poll(task) again → maybe Ready
```

This is why async is efficient: a `Pending` task consumes **no thread** —
it's parked until its waker fires, so a few threads juggle thousands of
tasks ([Chapter 18](/rust/part-5-concurrency/async-await)). The waker is the
callback that reconnects "the event happened" to "re-poll this future."

> :nerdygoose: The waker is the piece that makes async *not* a busy-poll.
> A naive poll-based system would re-poll every pending future constantly,
> burning CPU. Instead, a `Pending` future *registers its waker* with the
> exact thing it's blocked on, and the executor doesn't touch it again
> until that waker fires. So "poll-driven" doesn't mean "polling in a hot
> loop" — it means "polled exactly once per readiness event." It's the
> same idea as `epoll`/`kqueue` at the OS level (don't spin, get notified),
> lifted into the type system as the `Waker`. That single indirection is
> what lets one thread idle efficiently over ten thousand sleeping tasks.

## 4. Pin: why it exists

Here's the payoff to [Chapter 25](/rust/part-7-advanced-types/advanced-lifetimes-and-variance)'s
cliffhanger about self-referential structs. An async state machine often
holds a reference *into its own locals* across an `.await`:

```rust
async fn f() {
    let buf = [0u8; 1024];
    let slice = &buf[..];        // a reference into `buf`...
    read_into(slice).await;      // ...held across this suspension point
}
// the state machine holds BOTH `buf` and a reference into `buf` — self-referential!
```

If the executor **moved** this future in memory while it was suspended, the
internal reference would dangle (it points at the old location). So
self-referential futures must **not move** once polled. **`Pin<&mut T>`** is
the type-level guarantee "this value will not move again" — `poll` takes
`Pin<&mut Self>` precisely so a future, once it starts being polled, is
*pinned* in place. `Pin` is the whole reason async can build
self-referential state machines safely. (You rarely touch `Pin` directly —
`async`/`.await` and runtimes handle it — but its appearance in `poll` is
exactly this self-reference guarantee.)

## 5. Streams: async iterators

A `Future` produces *one* value, eventually. A **`Stream`** produces a
*sequence* of values, each available eventually — the async analogue of
`Iterator` ([Chapter 14](/rust/part-4-data/iterators-and-closures)):

```rust
trait Stream {
    type Item;
    fn poll_next(self: Pin<&mut Self>, cx: &mut Context) -> Poll<Option<Self::Item>>;
    // Poll::Ready(Some(x)) = next item; Poll::Ready(None) = done; Pending = wait
}
```

Streams model async sequences — incoming network connections, lines from a
socket, events from a channel. You consume them with `while let Some(x) =
stream.next().await` or stream-combinator methods (`map`, `filter`, ... like
iterators but async). `Stream` isn't in `std` yet (it lives in `futures`/
`tokio`), but it's how you handle "many things arriving over time"
asynchronously — and it's the same `poll` machinery, returning a sequence.

## 6. Structured concurrency: join, select, cancellation

Real async code runs *multiple* futures together. The combinators:

- **`join!`** — run several futures concurrently, wait for **all** to
  finish (their results come back together). Overlapping I/O on one thread.
- **`select!`** — run several, take whichever finishes **first**, drop the
  rest. Timeouts, racing, "first response wins."
- **`spawn`** — hand a future to the executor as an independent **task**.

**Cancellation** in Rust async is *dropping the future*: if you stop polling
a future (drop it, or `select!` discards the losers), it simply never makes
more progress — its destructors run, releasing resources. This is elegant
(cancellation = drop, leveraging ownership) but has a sharp edge:
**cancellation can happen at any `.await`**, so a future must leave things
consistent if dropped mid-flight (don't leave a half-written buffer or a
held resource in a bad state). "Cancel = drop" is powerful and demands you
think about being interrupted at every suspension point.

## 7. The pitfalls

Most async bugs come from forgetting it's a *cooperative, poll-driven*
system on shared threads:

- **Blocking the executor**: calling a *synchronous*, blocking operation
  (a slow `std::fs` read, `thread::sleep`, heavy CPU) inside an async task
  **parks the whole executor thread** — no other task on it can run. Use
  async I/O, or offload blocking/CPU work with `spawn_blocking`.
- **Holding a lock across `.await`**: keeping a `Mutex` guard
  ([Chapter 17](/rust/part-5-concurrency/message-passing-shared-state)) held
  across an `.await` can deadlock (the task suspends *holding* the lock; a
  task that needs it can't proceed; if they're on the same thread, stuck).
  Use async-aware locks, or drop the guard before awaiting.
- **`Send` bounds**: a future spawned onto a multi-threaded executor must
  be `Send`, so everything held across an `.await` must be `Send` — holding
  a non-`Send` type (`Rc`, a raw pointer) across a suspension point is a
  confusing compile error that's really about thread-safety.

Each pitfall is a direct consequence of the mechanism: tasks share threads
(don't block), suspend mid-function (don't hold locks/non-`Send` across
await), and can be moved between threads (must be `Send`). Knowing the
machine makes these errors obvious instead of mysterious.

## 8. The machine, assembled

Put it together — the whole async system in one picture:

- An `async fn` compiles to a **`Future`** = a **state machine** of its
  locals and `.await` points.
- An **executor** drives top-level futures by calling **`poll`**.
- `poll` runs to the next `.await`; if blocked, it registers a **`Waker`**
  and returns **`Pending`**, consuming no thread.
- When the event fires, **`wake()`** tells the executor to **re-poll**.
- **`Pin`** keeps self-referential futures from moving.
- **`Stream`** does the same for sequences; **`join!`/`select!`/`spawn`**
  compose tasks; **dropping** a future **cancels** it.

That's it — async is a lazy, poll-driven state-machine system with a
notification mechanism (the waker) so parked tasks cost nothing. The "magic"
of writing sequential code that scales to thousands of concurrent
operations is exactly this transformation plus an executor. Once you see
the machine, the rules ([§7](#7-the-pitfalls)) stop being arbitrary — they're
just the machine's nature.

> :weightliftinggoose: Async demystified: `async fn` → a **`Future`** =
> **state machine** of locals + `.await` points; an **executor** calls
> **`poll`**; blocked futures register a **`Waker`** and return
> **`Pending`** (using **no thread**); **`wake()`** triggers a re-poll.
> **`Pin`** stops self-referential futures from moving (the
> [Chapter 25](/rust/part-7-advanced-types/advanced-lifetimes-and-variance)
> payoff). Compose with **`join!`/`select!`/`spawn`**; **cancel by
> dropping**. The three rules follow from the machine: **don't block the
> executor**, **don't hold a lock/non-`Send` across `.await`**, and
> **spawned futures must be `Send`**. Know the machine; the rules become
> obvious.

## What we covered

- A **`Future`** (`poll` → `Poll::Ready`/`Pending`) is lazy and
  **poll-driven**; nothing runs until polled.
- `async`/`.await` compiles to a **state machine** holding live locals,
  with `.await` points as suspension states.
- An **executor** drives futures; a **`Waker`** (in `Context`) lets a
  parked future signal readiness so the executor **re-polls** — parked
  tasks cost **no thread**.
- **`Pin`** guarantees a future won't move, which **self-referential**
  async state machines require (why `poll` takes `Pin<&mut Self>`).
- **`Stream`** is the async iterator (`poll_next`), for sequences arriving
  over time.
- **`join!`** (all), **`select!`** (first), **`spawn`** (independent task);
  **cancellation = dropping** the future (so be drop-safe at every
  `.await`).
- Pitfalls follow from the machine: **don't block the executor**, **don't
  hold a lock/non-`Send` across `.await`**, spawned futures must be
  **`Send`**.

## What's next

[Chapter 29](/rust/part-8-in-practice/performance-and-optimization) —
performance and optimization. Rust is fast by default, but *fast* means
*measure first*: profiling and benchmarking, allocation awareness, the real
costs of `clone`/`Rc`/`Box`, data layout and cache, SIMD, and the build
settings (LTO, `target-cpu`) that squeeze out the last of the speed.
