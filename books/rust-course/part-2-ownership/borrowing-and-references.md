---
sidebar_position: 2
title: "Borrowing and References"
---

# Borrowing and References

> Lend a value without giving up ownership. A **reference** lets you
> access data you don't own; the **borrowing rules** — one mutable
> borrow *xor* many shared borrows — are how Rust allows this while
> still guaranteeing safety at compile time.

[Chapter 4](/rust/part-2-ownership/ownership-and-moves) ended on a
problem: passing a value to a function *moves* it, so you'd have to keep
handing ownership back and forth to keep using a value. **Borrowing** is
the fix. Instead of transferring ownership, you *lend* access — and the
compiler enforces rules that make lending safe.

## 1. References: borrowing access

A **reference** is a pointer that borrows a value without owning it. You
create one with `&` and follow it (dereference) with `*`:

```rust
let s = String::from("hello");
let r = &s;              // r is a reference to s; s still owns the string
println!("{}", r);       // use the borrowed value (auto-dereferenced here)
println!("{}", s);       // s is STILL valid — we borrowed, didn't move
```

Creating `&s` is called **borrowing**. The reference `r` lets you read
`s`, but `s` keeps ownership. When `r` goes out of scope, nothing is
dropped — you don't own the data, so you don't free it.

## 2. Borrowing solves the function problem

Recall the clunk: passing `s` to a function moved it. With references, a
function can *borrow* its argument and the caller keeps ownership:

```rust
fn length(s: &String) -> usize {   // borrows s, doesn't take ownership
    s.len()
}                                   // s (the reference) goes out of scope;
                                    // nothing dropped — it didn't own anything

let s = String::from("hello");
let n = length(&s);     // lend s to the function
println!("{} is {}", s, n);   // s STILL valid afterward
```

The function works with the data through the reference and gives it
back automatically (by simply not owning it). This is the everyday Rust
pattern: **pass references, not ownership**, unless the callee genuinely
needs to *keep* the value.

## 3. Shared references: read-only

A plain `&T` is a **shared** (immutable) reference. You can have **many**
of them at once, and through them you can *read* but not *modify*:

```rust
let s = String::from("hello");
let r1 = &s;
let r2 = &s;             // fine: any number of shared references
println!("{} {}", r1, r2);
// r1.push('!');         // ERROR: can't mutate through a shared reference
```

Many readers are safe precisely because none of them can change the
data — there's no way for one reader to surprise another. Shared
references are "read-only views," and you can hand out as many as you
like.

## 4. Mutable references: exclusive write

To modify borrowed data, you need a **mutable reference**, `&mut T` —
and the value itself must be `mut`:

```rust
fn append_excl(s: &mut String) {
    s.push('!');         // mutate through the mutable reference
}

let mut s = String::from("hello");
append_excl(&mut s);     // lend a mutable reference
println!("{}", s);       // "hello!"
```

A `&mut T` grants write access — but it comes with a strict condition,
which is the heart of the whole system.

## 5. The borrowing rules

Rust enforces exactly two rules on references, at compile time:

> 1. You may have **either** one mutable reference (`&mut T`) **or** any
>    number of shared references (`&T`) — **never both at once**.
> 2. Every reference must always be **valid** (never outlive the data it
>    points to).

Rule 1 is the famous one: **mutable XOR shared**. While a `&mut` exists,
no other reference (mutable *or* shared) to that data may exist:

```rust
let mut s = String::from("hello");
let r1 = &s;
let r2 = &s;             // ok: two shared borrows
// let rm = &mut s;      // ERROR: can't borrow as mutable while shared
                         //        borrows r1/r2 are alive
println!("{} {}", r1, r2);

let rm = &mut s;         // ok now: r1/r2 no longer used (their borrow ended)
rm.push('!');
```

Either *one writer* or *many readers* — never a writer alongside anyone
else.

## 6. Why these rules

The mutable-XOR-shared rule rules out **aliasing + mutation**, the root
of an entire family of bugs:

- **Data races**: two references to the same data, one writing, with no
  synchronization. Impossible here — a writer can't coexist with another
  reference, so concurrent write-while-read can't be expressed (this is
  "fearless concurrency,"
  [Chapter 16](/rust/part-5-concurrency/threads-send-sync)).
- **Iterator invalidation**: mutating a collection while iterating it
  (e.g. a `Vec` reallocating out from under a pointer). The shared
  borrow held by the iterator forbids a simultaneous `&mut`.
- **Surprise mutation**: code that holds a reference can't have the data
  changed behind its back, because holding the reference blocks the
  mutation.

> :surprisedgoose: The same rule that prevents memory bugs prevents data
> races — and it's just "one writer xor many readers." You may have met
> this as a reader-writer lock at *runtime*; Rust enforces the identical
> discipline at *compile time*, for free, with no lock. Aliasing
> (multiple references) and mutability are each fine alone; it's their
> *combination* that's dangerous, and that combination is exactly what
> the rule forbids. One idea, a whole class of bugs gone.

## 7. No dangling references

Rule 2 — references must stay valid — means a reference can never
outlive the data it points to. This code is a compile error:

```rust
fn dangle() -> &String {        // returns a reference...
    let s = String::from("hi");
    &s                          // ...to s, which is dropped at function end
}                               // ERROR: s dropped here; reference would dangle
```

`s` is dropped when `dangle` returns, so the returned reference would
point at freed memory — a **dangling pointer**, the classic C
use-after-free. Rust rejects it at compile time. (The compiler even
suggests the fix: return the `String` itself, moving ownership out.) How
Rust *knows* how long each reference is valid is the job of **lifetimes**
([Chapter 6](/rust/part-2-ownership/lifetimes)).

## 8. The borrow checker

The part of the compiler that enforces these rules is the **borrow
checker**. It's the thing newcomers "fight" — but every rejection is it
catching a real potential bug. Modern Rust uses **non-lexical lifetimes**
(NLL): a borrow lasts only until its *last use*, not until the end of the
enclosing scope, which makes the checker far more permissive than it used
to be:

```rust
let mut s = String::from("hello");
let r = &s;
println!("{}", r);       // r's last use — its borrow ends HERE
let rm = &mut s;         // ok: no shared borrow is alive anymore
rm.push('!');
```

The shared borrow `r` is "over" after its final use, so the mutable
borrow is allowed immediately after. The borrow checker tracks where each
reference is actually used and complains only when the rules would truly
be violated.

> :weightliftinggoose: Borrowing is the ergonomic payoff of ownership:
> you lend access instead of shuffling ownership around. Drill the one
> rule — **one `&mut` xor many `&`** — because it explains the vast
> majority of borrow-checker errors. When the compiler says "cannot
> borrow as mutable because it is also borrowed as immutable," it's
> enforcing exactly that rule. Don't memorize workarounds; internalize
> the rule, and read every error as the compiler naming a real aliasing
> hazard. Pass `&T` by default, `&mut T` when you must write, and move
> only when the callee needs to own.

## What we covered

- A **reference** (`&T`) borrows access to a value without taking
  ownership; the owner stays valid and nothing is dropped when the
  reference ends.
- Borrowing solves the move-on-pass problem: **pass references, not
  ownership** by default.
- **Shared references** (`&T`): many at once, read-only. **Mutable
  references** (`&mut T`): exclusive, allow writing.
- The **borrowing rules**: (1) one `&mut` *xor* any number of `&`, never
  both; (2) references must never outlive their data.
- The mutable-xor-shared rule eliminates **data races**, **iterator
  invalidation**, and **surprise mutation** — aliasing + mutation is the
  forbidden combination.
- **Dangling references** are compile errors: a reference can't outlive
  the value it points to.
- The **borrow checker** enforces this; **non-lexical lifetimes** end a
  borrow at its last use, making it permissive in practice.

## What's next

[Chapter 6](/rust/part-2-ownership/lifetimes) — lifetimes. We've said
references must stay valid; lifetimes are *how the compiler tracks that*.
We'll meet lifetime annotations (`'a`), see why they're occasionally
needed in function signatures, and learn the elision rules that hide them
most of the time.
