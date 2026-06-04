---
sidebar_position: 1
title: "Threads, Send, and Sync"
---

# Threads, Send, and Sync

> Fearless concurrency. The same ownership rules that prevent memory bugs
> prevent **data races** — so concurrent Rust that *compiles* is
> race-free by construction. Threads run code in parallel; the **`Send`**
> and **`Sync`** marker traits encode, in the type system, what may
> safely cross thread boundaries.

Welcome to Part V, where ownership pays its biggest dividend. In most
languages concurrency is terrifying because of data races —
nondeterministic, near-impossible to reproduce. In Rust, the borrow
checker turns data races into *compile errors*. This is the promise from
[Chapter 1](/rust/part-1-getting-started/why-rust), now delivered.

## 1. Spawning threads

`std::thread::spawn` runs a closure on a new OS thread. It returns a
**`JoinHandle`** you can `.join()` to wait for the thread to finish:

```rust
use std::thread;

let handle = thread::spawn(|| {
    for i in 1..5 { println!("thread: {i}"); }
});

for i in 1..3 { println!("main: {i}"); }
handle.join().unwrap();      // wait for the spawned thread to finish
```

Without `join`, the main thread might exit (ending the program) before
the spawned thread runs. `join` blocks until the thread completes and
returns its result. Threads run truly in parallel on multiple cores.

## 2. Moving data into threads

A thread may outlive the scope that spawned it, so a closure passed to
`spawn` must **own** the data it uses — hence the **`move`** keyword
([Chapter 14](/rust/part-4-data/iterators-and-closures)):

```rust
let data = vec![1, 2, 3];
let handle = thread::spawn(move || {     // `move`: thread takes ownership of data
    println!("{:?}", data);
});
handle.join().unwrap();
// data is no longer usable here — it was moved into the thread
```

Without `move`, the closure would *borrow* `data`, but the compiler can't
prove `data` outlives the thread — so it rejects it. `move` transfers
ownership into the thread, and the borrow checker is satisfied: the thread
owns its data, no dangling reference possible.

## 3. The data race, and why Rust can't express one

A **data race** is: two threads access the same memory, at least one
writing, with no synchronization. Try to share mutable data naively and
the borrow checker stops you:

```rust
let mut counter = 0;
let h = thread::spawn(move || { counter += 1; });   // moves a COPY (i32 is Copy)
// the original `counter` is untouched — no sharing happened
```

To *actually* share mutable state, you'd need two references to it across
threads — but that violates "one `&mut` xor many `&`"
([Chapter 5](/rust/part-2-ownership/borrowing-and-references)). The
aliasing-plus-mutation that *is* a data race is exactly what the borrow
checker forbids. So you literally cannot write a data race that compiles;
you must reach for a safe sharing tool
([Chapter 17](/rust/part-5-concurrency/message-passing-shared-state)).

> :surprisedgoose: This is the unification promised in
> [Chapter 1](/rust/part-1-getting-started/why-rust): the rule that
> prevents use-after-free (no aliasing + mutation) is the *same* rule
> that prevents data races (no shared mutable access without
> synchronization). A data race needs two things — sharing and mutation —
> and "one `&mut` xor many `&`" forbids exactly that pair. One mechanism,
> two whole bug classes gone, both at compile time. Memory safety and
> thread safety fall out of the same principle.

## 4. Send: types that can move between threads

How does the compiler know what's *safe* to send to a thread? Two marker
traits ([Chapter 10](/rust/part-3-types/traits)) encode it. The first is
**`Send`**: a type is `Send` if it's safe to **transfer ownership** of it
to another thread.

- Most types are `Send` (integers, `String`, `Vec<T>` of `Send`...).
- **`Rc<T>`** is **not** `Send` — its reference count isn't atomic, so
  sharing it across threads would race on the count. (Its atomic sibling
  **`Arc<T>`** *is* `Send`.)
- Raw pointers are not `Send`.

`thread::spawn` requires the closure (and everything it captures) to be
`Send` — that's how moving a non-`Send` type into a thread becomes a
compile error.

## 5. Sync: types that can be shared by reference

The second marker is **`Sync`**: a type `T` is `Sync` if `&T` is `Send` —
i.e., it's safe for multiple threads to hold *shared references* to the
same value at once.

- A type is `Sync` if sharing `&T` across threads can't cause a race.
- **`Mutex<T>`** is `Sync` (it synchronizes access internally) — which is
  why it's *the* tool for shared mutable state across threads.
- **`RefCell<T>`** is **not** `Sync` — its borrow check isn't
  thread-safe; `Mutex<T>` is its threaded counterpart
  ([Chapter 15](/rust/part-4-data/smart-pointers)).

`Send` is about *moving* a value to another thread; `Sync` is about
*sharing* it between threads. They're related: `T` is `Sync` exactly when
`&T` is `Send`.

## 6. Auto traits: derived, not declared

You almost never implement `Send`/`Sync` yourself. They're **auto
traits**: the compiler implements them **automatically** for any type
whose parts are all `Send`/`Sync`. A struct of `Send` fields is `Send`; a
struct containing an `Rc` is automatically *not* `Send`.

```rust
struct Wrapper { data: Vec<i32> }   // automatically Send + Sync (Vec<i32> is both)
struct Shared { rc: std::rc::Rc<i32> }   // automatically NOT Send (Rc isn't)
```

This is elegant: thread-safety propagates through composition with zero
annotation. You build types from safe parts and they're safe; include one
non-`Send` part and the whole type loses `Send`, and the compiler will
stop you at the thread boundary. (You can manually `unsafe impl` them in
rare low-level cases — [Chapter 19](/rust/part-5-concurrency/unsafe-rust) —
but that's the exception.)

## 7. Why "fearless"

Put it together. When you spawn a thread, the compiler checks that
everything crossing the boundary is `Send` (to move) or `Sync` (to
share). If it isn't — if you tried to send an `Rc` or share a `RefCell` —
it's a **compile error**, with a clear explanation. So:

> If your concurrent Rust compiles, it is free of data races.

That's "fearless concurrency": you don't need to *reason* about whether
your sharing is safe and hope you got it right (the C/C++/Java reality) —
the compiler proves it. Bugs that would be heisenbugs elsewhere never make
it past `cargo build`. You can refactor concurrent code aggressively,
because the type system has your back.

## 8. The threading model

A few practical notes on Rust's threads:

- They're **native OS threads** (1:1), so they're real parallelism but
  relatively heavyweight — fine for CPU-bound work across cores, less so
  for tens of thousands of concurrent I/O tasks (that's async,
  [Chapter 18](/rust/part-5-concurrency/async-await)).
- **`scoped threads`** (`thread::scope`) let threads safely *borrow*
  local data (not just `move` owned data), because the scope guarantees
  they finish before the borrowed data is dropped.
- Sharing data between them is done with the tools of the next chapter:
  **channels** (message passing) or **`Arc<Mutex<T>>`** (shared state).

The big idea to carry forward: Rust makes the *unsafe* concurrency
impossible to compile, then gives you *safe* primitives to do the sharing
you actually need.

> :weightliftinggoose: Concurrency is where ownership stops being a tax
> and starts being a gift. Lock in the model: **`spawn` a closure**
> (usually **`move`** so the thread owns its data), **`join`** to wait.
> The borrow checker makes data races *uncompilable* — you can't alias +
> mutate across threads. **`Send`** = safe to move to another thread,
> **`Sync`** = safe to share by reference; both are **auto traits** the
> compiler derives from your fields (which is why `Rc`/`RefCell` are
> single-thread-only and `Arc`/`Mutex` are their threaded twins). Trust
> it: if it compiles, it's race-free.

## What we covered

- **`thread::spawn`** runs a closure on a new OS thread; **`JoinHandle::
  join`** waits for it.
- Closures passed to threads usually need **`move`** to own their
  captures, since a thread can outlive the spawning scope.
- A **data race** (sharing + mutation without sync) violates "one `&mut`
  xor many `&`", so the borrow checker makes it **uncompilable** — the
  same rule that prevents use-after-free.
- **`Send`**: safe to *transfer ownership* across threads (most types;
  not `Rc`, not raw pointers).
- **`Sync`**: safe to *share `&T`* across threads (`T` is `Sync` iff `&T`
  is `Send`); `Mutex` is `Sync`, `RefCell` is not.
- `Send`/`Sync` are **auto traits** — derived automatically from a type's
  parts; thread-safety propagates through composition.
- **Fearless concurrency**: if concurrent Rust compiles, it's
  data-race-free; threads are native (1:1), shared via channels or
  `Arc<Mutex<T>>`.

## What's next

[Chapter 17](/rust/part-5-concurrency/message-passing-shared-state) —
message passing and shared state. The two ways threads cooperate:
**channels** ("share memory by communicating") and **`Arc<Mutex<T>>`**
(synchronized shared state), plus `Arc`, deadlocks, and which approach to
choose.
