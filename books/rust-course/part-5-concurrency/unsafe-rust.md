---
sidebar_position: 4
title: "Unsafe Rust"
---

# Unsafe Rust

> The escape hatch. A few operations — dereferencing raw pointers,
> calling foreign code, certain low-level tricks — can't be verified by
> the compiler. **`unsafe`** lets you do them, by *promising* you'll
> uphold the invariants the borrow checker normally enforces. It's how
> Rust talks to hardware and C, and how the standard library is built —
> used rarely, deliberately, and wrapped in safe APIs.

We close Part V — and the language core — with the part of Rust that
*isn't* checked. Everything so far has been **safe Rust**, where the
compiler proves your memory and thread safety. But some valid, necessary
operations are beyond what static analysis can verify. `unsafe` is the
controlled door to them.

## 1. Why unsafe exists

Two unavoidable reasons:

- **Some safe operations can't be *proven* safe.** The borrow checker is
  conservative — it rejects some programs that are actually fine because
  it can't verify them. A few data structures (certain doubly-linked
  lists, custom allocators) need pointer manipulation the checker can't
  follow.
- **The world outside Rust isn't checked.** Talking to the operating
  system, hardware, or C libraries means stepping outside Rust's
  guarantees. The compiler can't reason about a C function's memory
  behavior.

So Rust provides `unsafe`: a way to say "I am doing something the compiler
can't verify; trust me, I've checked it by hand." It doesn't turn off the
borrow checker wholesale — it unlocks exactly five extra abilities.

## 2. The five unsafe superpowers

Inside an `unsafe` block (or `unsafe fn`), you gain exactly these five
abilities — and *nothing else*:

1. **Dereference a raw pointer** (`*const T`, `*mut T`).
2. **Call an `unsafe` function** (including foreign/FFI functions).
3. **Access or modify a mutable `static`** variable.
4. **Implement an `unsafe` trait** (like manually marking `Send`/`Sync`,
   [Chapter 16](/rust/part-5-concurrency/threads-send-sync)).
5. **Access fields of a `union`**.

Crucially, that's the *whole* list. The borrow checker, type checker, and
all other safety checks **still run** inside `unsafe`. Ownership still
applies; references still follow the rules. `unsafe` is a small,
well-defined widening of what's allowed — not a free-for-all.

## 3. Raw pointers

The most common unsafe ingredient. **Raw pointers** — `*const T`
(immutable) and `*mut T` (mutable) — are like C pointers: they can be
null, dangling, or aliased, and ignore the borrowing rules. You can
*create* them in safe code, but you can only **dereference** them inside
`unsafe`:

```rust
let mut x = 5;
let r1 = &x as *const i32;        // create raw pointers (safe)
let r2 = &mut x as *mut i32;

unsafe {
    println!("{}", *r1);          // dereference REQUIRES unsafe
    *r2 = 10;
}
```

Raw pointers come with *no guarantees* — that's the point and the danger.
You'd use them to interface with C, build a data structure the borrow
checker can't model, or do certain performance-critical tricks. When you
dereference one, *you* are vouching that it's valid.

## 4. unsafe functions and blocks

A function whose correctness depends on caller-upheld invariants is marked
`unsafe fn`, and calling it requires an `unsafe` block:

```rust
unsafe fn dangerous() {
    // ...does something whose safety the caller must guarantee...
}

unsafe {
    dangerous();        // calling an unsafe fn requires unsafe
}
```

The `unsafe` block is a **visible marker**: it localizes the
"trust me" to a small, auditable region. When something goes wrong with
memory safety in a Rust program, the bug is *necessarily* inside (or
caused by) an `unsafe` block — so you have a finite, searchable set of
places to inspect. That auditability is the whole value of the keyword.

## 5. Safe abstractions over unsafe

The central pattern of well-written unsafe Rust: **wrap a small `unsafe`
core in a safe API** that upholds the invariants, so callers never touch
`unsafe` themselves. The standard library does this everywhere — `Vec`,
`Rc`, `Mutex` all have `unsafe` internals behind safe interfaces:

```rust
// split_at_mut: hands out TWO mutable slices of one slice.
// The borrow checker can't see they don't overlap — but we can prove it,
// so an unsafe block does the split behind a safe signature.
fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();
    let ptr = slice.as_mut_ptr();
    assert!(mid <= len);
    unsafe {
        (std::slice::from_raw_parts_mut(ptr, mid),
         std::slice::from_raw_parts_mut(ptr.add(mid), len - mid))
    }
}
```

The function's *signature* is completely safe; callers use it with no
`unsafe`. The `unsafe` is confined inside, where the author has *proven*
the two slices don't overlap. This is how you get both: the flexibility of
unsafe where needed, and a safe surface everywhere else.

> :nerdygoose: This inversion is the genius of Rust's design. Safety isn't
> all-or-nothing — `unsafe` lets you build a *trusted core* whose author
> manually proves the invariants, then expose a *safe API* the compiler
> re-verifies for every caller. Most of the standard library is a thin
> safe skin over unsafe guts. The result: the *amount* of code you must
> audit by hand for memory bugs shrinks to the few `unsafe` blocks, while
> the millions of lines using those abstractions stay machine-checked.
> You concentrate the danger so you can scrutinize it.

## 6. FFI: talking to C

A primary use of `unsafe` is the **Foreign Function Interface** — calling
C (or being called by it). Foreign functions are inherently `unsafe`
because the compiler can't verify anything about them:

```rust
extern "C" {
    fn abs(input: i32) -> i32;     // a C standard library function
}

fn main() {
    unsafe {
        println!("{}", abs(-3));   // calling C requires unsafe
    }
}
```

`extern "C"` declares the C calling convention; the call sits in `unsafe`
because Rust trusts your declaration matches the real C signature. FFI is
how Rust integrates with existing C/C++ ecosystems, system libraries, and
OS APIs — a major reason it's viable for systems programming. (You can
also expose Rust functions *to* C with `#[no_mangle] extern "C"`.)

## 7. The contract you take on

`unsafe` is a *promise*, not permission to be careless. When you write it,
you take responsibility for the invariants the compiler can no longer
check — for example: a raw pointer you dereference is valid and properly
aligned; you don't create two `&mut` to the same data; data you manually
mark `Send` really is thread-safe.

Break the contract and you get **undefined behavior** — the same
nightmare as C: crashes, corruption, security holes, "impossible" bugs.
The compiler won't warn you, because you told it not to. So the discipline
is: keep `unsafe` blocks **tiny**, document the invariant each one relies
on, prove it holds, and test hard (tools like **Miri** can detect some
undefined behavior at runtime). `unsafe` doesn't make Rust *as* dangerous
as C — it confines the danger to marked regions — but inside those
regions, the danger is exactly C's.

## 8. When to use unsafe (rarely)

For the vast majority of Rust code, the answer is: **don't**. You can
write applications, web services, CLI tools, and most libraries with zero
`unsafe`. Reach for it only when:

- **FFI** — you must call C or expose Rust to C.
- **Low-level data structures** the borrow checker genuinely can't
  express (and even then, check if a crate already provides a safe one).
- **Verified performance** wins, after profiling proves a safe version is
  too slow (rare).
- **Hardware / OS** interaction — embedded registers, syscalls.

And when you do: minimize it, wrap it in a safe API (§5), and document the
invariants. `unsafe` is a precision tool for the boundary between Rust's
guarantees and the unverifiable world — not a shortcut for fighting the
borrow checker. If you're using it to dodge a lifetime error, stop and fix
the ownership instead.

> :weightliftinggoose: `unsafe` is the smallest, sharpest tool in the box,
> and most Rust programmers rarely touch it. Know what it *is*: five extra
> abilities (raw-pointer deref, `unsafe`/FFI calls, mutable statics,
> `unsafe` traits, unions) — with every other safety check still on. Know
> the pattern: a **tiny `unsafe` core wrapped in a safe API**, the way the
> std library is built. And know the deal: inside `unsafe`, *you* uphold
> the invariants, and breaking them is undefined behavior. Use it for FFI
> and genuine low-level needs, never to escape the borrow checker. Keep it
> small, wrap it, document it — and prefer to never need it.

## What we covered

- **`unsafe`** unlocks operations the compiler can't verify; it's the
  bridge to hardware, C, and a few data structures the borrow checker
  can't model.
- It grants exactly **five superpowers** (deref raw pointers, call
  `unsafe`/FFI fns, access mutable statics, impl `unsafe` traits, access
  union fields) — **all other checks still run**.
- **Raw pointers** (`*const T`/`*mut T`) ignore the borrowing rules and
  can be dereferenced only in `unsafe`.
- `unsafe` blocks are **visible markers** that localize "trust me" to
  small, auditable regions — memory bugs must originate there.
- The key pattern: **wrap a small `unsafe` core in a safe API** (as
  `Vec`/`Rc`/`Mutex`/`split_at_mut` do), concentrating danger so most code
  stays machine-checked.
- **FFI** (`extern "C"`) uses `unsafe` to call C — how Rust integrates
  with existing ecosystems and the OS.
- `unsafe` is a **contract**: you uphold the invariants, and violating
  them is **undefined behavior**. Use it rarely, keep it tiny, wrap and
  document it — never to dodge the borrow checker.

## What's next

That's Part V and the language core. [Part VI](/rust/part-6-ecosystem/modules-crates-cargo)
turns to **the ecosystem**: how to organize, share, and ship Rust —
modules and crates, macros, testing and tooling, and where to go next.
