---
sidebar_position: 4
title: "Smart Pointers: Box, Rc, RefCell"
---

# Smart Pointers

> When single ownership isn't enough. **`Box<T>`** puts data on the heap;
> **`Rc<T>`** allows *multiple* owners; **`RefCell<T>`** moves borrow
> checking to *runtime* for interior mutability. These types let you build
> the recursive structures, shared graphs, and mutable-shared-state
> patterns that strict single ownership can't express alone.

[Part II](/rust/part-2-ownership/ownership-and-moves) gave you one owner
per value and compile-time borrow checking. That's the right default —
but some data structures genuinely need more: a value with no fixed size,
a node owned by several parents, a shared thing that must be mutated.
**Smart pointers** provide these, each relaxing exactly one rule while
keeping the safety guarantees.

## 1. What is a smart pointer?

A **smart pointer** is a type that acts like a pointer but adds
behavior — owning its data, counting references, or enforcing rules. They
implement two key traits ([Chapter 10](/rust/part-3-types/traits)):

- **`Deref`** — lets you use the smart pointer like a reference (`*p`,
  and method calls auto-deref through it).
- **`Drop`** — runs cleanup code when the pointer goes out of scope (this
  is RAII, [Chapter 4](/rust/part-2-ownership/ownership-and-moves) — how
  `Box` frees its heap memory, how a lock releases).

You've already used smart pointers: `Vec<T>` and `String` are smart
pointers that own a heap buffer. Now meet the three that enable new
ownership patterns.

## 2. Box: heap allocation

`Box<T>` is the simplest: it puts a single value on the **heap** and owns
it. The `Box` itself (a pointer) lives on the stack; the data lives on the
heap; dropping the `Box` frees the data:

```rust
let b = Box::new(5);        // 5 lives on the heap; b owns it
println!("{}", *b);         // deref to get the value
```

Why box a value? Three main reasons: a **large** value you want to move
cheaply (move the pointer, not the data); a **trait object**
(`Box<dyn Trait>`, [Chapter 10](/rust/part-3-types/traits)); and —
classically — a **recursive type**.

## 3. Box enables recursive types

A type that contains itself has no computable size — "a `List` contains a
`List` contains a `List`..." is infinite. A `Box` breaks the cycle,
because a `Box` is just a pointer (a known, fixed size) regardless of how
big the thing it points to is:

```rust
enum List {
    Cons(i32, Box<List>),   // Box: a pointer, so List has a finite size
    Nil,
}
use List::{Cons, Nil};

let list = Cons(1, Box::new(Cons(2, Box::new(Nil))));
```

Without the `Box`, the compiler errors: "recursive type has infinite
size." With it, each node holds a pointer to the next, so the size is
fixed (an `i32` plus a pointer). This is how you build linked lists,
trees, and other recursive structures in Rust.

## 4. Rc: multiple ownership

The single-owner rule blocks structures where one value has *several*
owners — a graph node pointed at by many edges, shared config used in many
places. **`Rc<T>`** (Reference Counted) allows it: it keeps a count of
owners and frees the data only when the **last** one is dropped:

```rust
use std::rc::Rc;

let a = Rc::new(String::from("shared"));
let b = Rc::clone(&a);        // NOT a deep copy — just bumps the count to 2
let c = Rc::clone(&a);        // count is 3

println!("count = {}", Rc::strong_count(&a));   // 3
// data freed only when a, b, c are ALL dropped
```

`Rc::clone` is cheap — it copies a pointer and increments the count, not
the data (contrast with `.clone()` on the inner value). When each `Rc`
drops, the count drops; at zero, the data is freed. **`Rc<T>` is for
single-threaded** sharing; its thread-safe sibling is `Arc<T>`
([Chapter 17](/rust/part-5-concurrency/message-passing-shared-state)).

## 5. RefCell: interior mutability

`Rc<T>` gives shared ownership but only **immutable** access (many owners,
so no one may mutate — the borrowing rules). When you need to mutate
shared data, you need **interior mutability**: `RefCell<T>` lets you
mutate through a shared reference, by enforcing the borrow rules at
**runtime** instead of compile time:

```rust
use std::cell::RefCell;

let cell = RefCell::new(5);
*cell.borrow_mut() += 10;            // mutate through a shared ref
println!("{}", cell.borrow());       // 15
```

`borrow()` gives a shared borrow, `borrow_mut()` a mutable one — and
`RefCell` *checks the rules dynamically*: too many borrows, or a borrow
plus a mutable borrow, and it **panics at runtime** rather than failing to
compile. You trade compile-time guarantees for flexibility, with the
safety check moved (not removed) to runtime.

> :nerdygoose: `RefCell` doesn't *break* the borrowing rules — it
> *relocates* the check. The "one `&mut` xor many `&`" invariant
> ([Chapter 5](/rust/part-2-ownership/borrowing-and-references)) still
> holds; it's just verified at runtime (with a panic on violation)
> instead of by the compiler. This is the escape hatch for the rare cases
> where you *know* your access pattern is safe but can't convince the
> static checker. The cost is a tiny runtime check and the risk of a
> panic — so reach for it only when the borrow checker genuinely can't
> express what you need, not to dodge learning the rules.

## 6. Rc plus RefCell: shared mutable data

The classic combination: `Rc<RefCell<T>>` gives **multiple owners** (`Rc`)
of **mutable** data (`RefCell`) — the building block for graphs, shared
state, and observer patterns in single-threaded code:

```rust
use std::rc::Rc;
use std::cell::RefCell;

let shared = Rc::new(RefCell::new(vec![1, 2, 3]));
let other = Rc::clone(&shared);       // two owners of the same vec

shared.borrow_mut().push(4);          // mutate through one handle
println!("{:?}", other.borrow());     // [1, 2, 3, 4] — seen through the other

```

Both `shared` and `other` own the same `Vec` and either can mutate it.
This pattern reconstructs the "shared mutable object" that GC languages
give by default — but explicitly, with the costs (reference counting +
runtime borrow checks) visible in the types.

## 7. Reference cycles and Weak

`Rc` has one failure mode: **reference cycles**. If two `Rc`s point at
each other, their counts never reach zero, so the data is never freed — a
**memory leak** (the rare leak Rust permits,
[Chapter 4](/rust/part-2-ownership/ownership-and-moves)):

```rust
// parent -> child via Rc, and child -> parent ALSO via Rc  ⇒  cycle ⇒ leak
```

The fix is **`Weak<T>`**: a non-owning reference that *doesn't* affect the
count. Use `Rc` for the "owning" direction (parent→child) and `Weak` for
the "back" direction (child→parent). A `Weak` doesn't keep data alive; you
call `.upgrade()` to get an `Option<Rc<T>>` (it's `None` if the data was
already freed). Cycles broken, leak avoided:

```rust
use std::rc::{Rc, Weak};
// child holds parent: Weak<Node>  (doesn't keep parent alive)
// parent holds children: Vec<Rc<Node>>  (owns them)
```

## 8. Choosing a smart pointer

A decision guide for the four most common needs:

- **Heap allocation / known single owner / recursive type / trait
  object** → **`Box<T>`**.
- **Multiple owners, single-threaded, read-only** → **`Rc<T>`**.
- **Multiple owners across threads** → **`Arc<T>`**
  ([Chapter 17](/rust/part-5-concurrency/message-passing-shared-state)).
- **Mutate through a shared reference (interior mutability)** →
  **`RefCell<T>`** (single-threaded; `Mutex<T>` for threads).
- **Shared + mutable** → **`Rc<RefCell<T>>`** (or `Arc<Mutex<T>>` across
  threads); use **`Weak<T>`** to break cycles.

Default to plain ownership and references — they cover most code with
zero overhead and full compile-time checking. Reach for a smart pointer
only when a specific need (heap sizing, sharing, interior mutability)
demands it, and you'll keep most of the guarantees while buying exactly
the flexibility you need.

> :weightliftinggoose: Smart pointers are the relief valves on strict
> ownership — each loosens *one* rule: **`Box`** (heap, fixed-size
> recursive types), **`Rc`** (many owners), **`RefCell`** (mutate through
> a shared ref, checked at runtime), and the combo **`Rc<RefCell<T>>`**
> for shared-mutable. Their thread-safe twins are **`Arc`** and
> **`Mutex`**. Use them deliberately, not reflexively: plain references
> are zero-cost and fully checked, so prefer them, and remember `Rc`
> cycles leak unless you reach for **`Weak`**. With these you can build
> any structure GC languages give freely — just with the costs honest and
> visible.

## What we covered

- A **smart pointer** acts like a pointer but adds behavior via
  **`Deref`** (use like a reference) and **`Drop`** (RAII cleanup);
  `Vec`/`String` are smart pointers.
- **`Box<T>`**: heap-allocate a single owned value — for large values,
  trait objects, and **recursive types** (a `Box` has fixed size).
- **`Rc<T>`**: reference-counted **multiple ownership** (single-threaded,
  read-only); `Rc::clone` bumps a count cheaply; freed at count zero.
- **`RefCell<T>`**: **interior mutability** — mutate through a shared ref,
  with the borrow rules checked at **runtime** (panics on violation), not
  compile time.
- **`Rc<RefCell<T>>`**: shared *and* mutable data — graphs, shared state
  (the single-threaded equivalent of a GC object).
- **`Rc` cycles leak**; use **`Weak<T>`** (non-owning, `.upgrade()`s to
  `Option<Rc<T>>`) for back-references.
- Choose by need: `Box`/`Rc`/`Arc`/`RefCell`/`Mutex`; prefer plain
  ownership and references first.

## What's next

That's Part IV. [Part V](/rust/part-5-concurrency/threads-send-sync)
tackles **concurrency** — and here ownership pays its biggest dividend:
the same rules that prevent memory bugs prevent **data races**, giving
"fearless concurrency." We start with threads, `Send`, and `Sync`.
