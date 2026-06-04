---
sidebar_position: 2
title: "Message Passing and Shared State"
---

# Message Passing and Shared State

> Two ways for threads to cooperate. **Message passing** sends data
> through **channels** — "do not communicate by sharing memory; share
> memory by communicating." **Shared state** lets threads access the same
> data through a **`Mutex`**, with **`Arc`** providing the multi-thread
> ownership. Rust supports both, safely.

[Chapter 16](/rust/part-5-concurrency/threads-send-sync) showed that the
borrow checker forbids unsynchronized sharing. So how *do* threads share
data? Two paradigms, both safe in Rust: passing messages, or sharing
state behind a lock. This chapter covers both and when to use each.

## 1. Two paradigms

The concurrency world has long had two answers to "how do threads
cooperate?":

- **Message passing**: threads don't share memory; they send **messages**
  to each other through channels. Each piece of data has one owner at a
  time; ownership *moves* with the message. (The model of Erlang, Go's
  goroutines, the actor model.)
- **Shared state**: threads share access to the same memory, coordinating
  with locks so only one touches it at a time. (The classic threads +
  mutexes model.)

Rust supports both — and ownership makes both safer than usual. Message
passing fits Rust especially naturally, because *moving* data through a
channel is just ownership transfer across threads.

## 2. Channels: sending data

A **channel** has a transmitter and a receiver. `std::sync::mpsc`
(multiple producer, single consumer) is the standard one:

```rust
use std::sync::mpsc;
use std::thread;

let (tx, rx) = mpsc::channel();          // transmitter, receiver

thread::spawn(move || {
    let msg = String::from("hello");
    tx.send(msg).unwrap();               // send MOVES msg into the channel
    // msg is no longer usable here — ownership left with the message
});

let received = rx.recv().unwrap();       // block until a message arrives
println!("got: {received}");
```

`send` **moves** the value into the channel; the receiving thread becomes
its owner. `recv` blocks until a message arrives (or returns `Err` if all
transmitters are dropped). The receiver is also an iterator — `for msg in
rx` loops over messages until the channel closes.

> :nerdygoose: "Share memory by communicating" works beautifully in Rust
> because `send` literally transfers **ownership**
> ([Chapter 4](/rust/part-2-ownership/ownership-and-moves)). Once you
> `send` a value, you can't use it anymore — the compiler enforces that
> the data now belongs to the receiving thread. There's no shared
> mutable access to race on, because there's no sharing at all: the data
> *moved*. Go's channels can still race (you can hold a pointer to sent
> data); Rust's can't, because the type system revokes your access the
> instant you send. Message passing and the ownership model are a perfect
> fit.

## 3. Multiple producers

"Multiple producer" means you can **clone the transmitter** and hand a
copy to each of several threads, all funneling into one receiver:

```rust
let (tx, rx) = mpsc::channel();
for id in 0..3 {
    let tx = tx.clone();                 // each thread gets its own transmitter
    thread::spawn(move || { tx.send(id).unwrap(); });
}
drop(tx);                                // drop the original so rx knows when done
for received in rx {                     // iterate until all transmitters drop
    println!("got {received}");
}
```

Each spawned thread sends into the shared receiver; the `for` loop ends
when the last transmitter is dropped. This is a clean work-distribution
pattern — workers produce, one consumer collects — with no locks at all.

## 4. Shared state: the Mutex

Sometimes message passing doesn't fit and threads genuinely need to share
one mutable thing (a counter, a cache). A **`Mutex<T>`** (mutual
exclusion) guards the data: a thread must **lock** it to access the
inside, and only one lock can be held at a time:

```rust
use std::sync::Mutex;

let m = Mutex::new(5);
{
    let mut guard = m.lock().unwrap();   // acquire the lock (blocks if held)
    *guard += 10;                        // access the data through the guard
}                                        // lock released when guard drops (RAII)
println!("{:?}", m);
```

`lock()` returns a **`MutexGuard`** — a smart pointer
([Chapter 15](/rust/part-4-data/smart-pointers)) that derefs to the inner
data and **releases the lock when dropped** (RAII,
[Chapter 4](/rust/part-2-ownership/ownership-and-moves)). You can't forget
to unlock; the guard going out of scope does it. And you can't access the
data *without* locking — the `T` is reachable only through the guard.

## 5. Arc: sharing the Mutex across threads

A `Mutex<T>` is `Sync` ([Chapter 16](/rust/part-5-concurrency/threads-send-sync)),
but to share it among threads you need *multiple ownership* that's also
thread-safe. `Rc` isn't `Send`, so it won't do; its atomic sibling
**`Arc<T>`** (Atomically Reference Counted) is. The idiom is
**`Arc<Mutex<T>>`**:

```rust
use std::sync::{Arc, Mutex};
use std::thread;

let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let counter = Arc::clone(&counter);          // each thread gets a shared owner
    handles.push(thread::spawn(move || {
        let mut n = counter.lock().unwrap();     // lock, then mutate
        *n += 1;
    }));
}
for h in handles { h.join().unwrap(); }
println!("total: {}", *counter.lock().unwrap()); // 10
```

`Arc` provides shared ownership across threads; `Mutex` provides
synchronized mutation. Together — `Arc<Mutex<T>>` — they're the
thread-safe analogue of single-threaded `Rc<RefCell<T>>`
([Chapter 15](/rust/part-4-data/smart-pointers)). The pattern: clone the
`Arc` per thread, lock the `Mutex` to touch the data.

## 6. Arc vs Rc, Mutex vs RefCell

The single-threaded and multi-threaded toolkits mirror each other
exactly:

| Need | Single-threaded | Multi-threaded |
|------|----------------|----------------|
| Shared ownership | `Rc<T>` | `Arc<T>` |
| Interior mutability | `RefCell<T>` | `Mutex<T>` (or `RwLock<T>`) |
| Shared + mutable | `Rc<RefCell<T>>` | `Arc<Mutex<T>>` |

The thread-safe versions use **atomic** operations (for `Arc`'s count)
and **real locks** (for `Mutex`), which cost a little more — so you use
`Rc`/`RefCell` when single-threaded and pay for `Arc`/`Mutex` only when
sharing across threads. The compiler enforces the distinction: try to send
an `Rc` across threads and it won't compile, pointing you to `Arc`.
**`RwLock<T>`** is a `Mutex` variant allowing many readers *or* one
writer — use it for read-heavy data.

## 7. Deadlocks: the bug Rust does NOT prevent

Honesty time. Rust prevents *data races*, but it does **not** prevent
**deadlocks** — two threads each holding a lock the other needs, both
stuck forever:

```rust
// Thread A locks m1 then waits for m2;
// Thread B locks m2 then waits for m1  ⇒  both block forever.
```

A deadlock isn't a memory-safety violation (no data is corrupted), so the
borrow checker doesn't catch it. Avoiding deadlocks is still on you:
acquire locks in a consistent order, hold them as briefly as possible,
and prefer message passing when it fits (no locks, no deadlocks). This is
the boundary of Rust's guarantee — *data races* are impossible; *logical*
concurrency bugs like deadlocks and livelocks are not.

## 8. Choosing an approach

A practical guide:

- **Prefer message passing (channels)** when you can frame the problem as
  "hand work/data between threads." It avoids locks entirely, sidesteps
  deadlocks, and aligns with ownership (each datum has one owner). Worker
  pools, pipelines, and producer/consumer all fit.
- **Use `Arc<Mutex<T>>`** when threads genuinely share one piece of
  mutable state that doesn't decompose into messages — a shared counter,
  cache, or registry. Use **`RwLock`** if reads vastly outnumber writes.
- **Combine them**: many real systems pass messages *and* keep some shared
  state. Use each where it's clearest.

The meta-point: Rust makes both paradigms *memory-safe and race-free*, so
you're free to choose based on what models your problem best, not on which
is least likely to crash.

> :weightliftinggoose: Two tools, one safe language. **Channels**
> (`mpsc`, `send` *moves* ownership, `recv`/iterate to collect) for
> handing data between threads — prefer these; they dodge locks and
> deadlocks and fit ownership perfectly. **`Arc<Mutex<T>>`** for genuine
> shared mutable state (the threaded `Rc<RefCell<T>>`; lock to access,
> the guard auto-unlocks). Remember the one gap: Rust kills data races,
> **not deadlocks** — lock in a consistent order and hold briefly. Pick
> the paradigm that models your problem; both are race-free.

## What we covered

- Two paradigms: **message passing** (channels, no shared memory) and
  **shared state** (locks); Rust makes both safe.
- **Channels** (`mpsc::channel`): `send` **moves** data to the receiving
  thread; `recv` blocks; the receiver iterates until closed.
- **Multiple producers**: clone the transmitter; the loop ends when all
  transmitters drop.
- **`Mutex<T>`**: lock to access; `lock()` returns a **`MutexGuard`** that
  derefs to the data and **releases on drop** (RAII) — can't access
  without locking, can't forget to unlock.
- **`Arc<T>`** is the thread-safe `Rc`; **`Arc<Mutex<T>>`** is the
  threaded `Rc<RefCell<T>>` for shared mutable state (`RwLock` for
  read-heavy).
- The toolkits mirror: `Rc`/`RefCell` (single-thread) ↔ `Arc`/`Mutex`
  (multi-thread); atomics/locks cost more, so pay only when sharing.
- Rust prevents **data races** but **not deadlocks** — consistent lock
  order and brief holds are still your job; prefer channels when they fit.

## What's next

[Chapter 18](/rust/part-5-concurrency/async-await) — async/await. Threads
are great for CPU-bound parallelism but heavy for tens of thousands of
concurrent I/O operations. Async is Rust's answer: cooperative,
lightweight tasks built on **futures** — concurrency without a thread per
task.
