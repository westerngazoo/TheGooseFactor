---
sidebar_position: 1
title: "Ownership and Moves"
---

# Ownership and Moves

> The heart of Rust. Every value has one owner; when the owner goes out
> of scope, the value is freed. Assignment *moves* ownership. These
> rules — checked at compile time — are how Rust manages memory safely
> without a garbage collector.

This is the chapter that makes Rust *Rust*. **Ownership** is the idea
that replaces both manual `malloc`/`free` (C) and the garbage collector
(Java/Go). Master it and the rest of Rust follows; struggle with it and
nothing makes sense. Take your time here.

## 1. The three rules of ownership

Rust's ownership system is three rules, enforced by the compiler:

> 1. **Each value has a single owner** (a variable).
> 2. **There can only be one owner at a time.**
> 3. **When the owner goes out of scope, the value is dropped** (freed).

That's it. From these three rules, Rust derives memory safety with no
garbage collector. Let's see them in action.

## 2. Scope and drop

When a variable goes out of scope, its value is **dropped** — its memory
freed, automatically and deterministically:

```rust
{
    let s = String::from("hello");   // s owns a heap-allocated string
    // ... use s ...
}   // s goes out of scope here → the string's memory is freed (dropped)
```

No `free()` call, no garbage collector — the compiler inserts the
cleanup (`drop`) at the closing brace, where `s`'s scope ends. This is
deterministic: you know *exactly* when memory is freed (scope exit),
unlike a GC (whenever it decides). It's also automatic: you don't write
the free, so you can't forget it or do it twice.

> :nerdygoose: This is **RAII** (Resource Acquisition Is
> Initialization), borrowed from C++: a value's lifetime is tied to a
> scope, and cleanup happens at scope exit via a destructor (`drop` in
> Rust). But Rust enforces it *universally* and *safely* — the
> ownership rules guarantee `drop` runs exactly once, at the right
> time, on a value no one else is using. C++ has RAII but not the
> safety guarantees; Rust has both.

## 3. Move semantics

Here's where Rust diverges from most languages. Assigning a value
**moves** ownership — the original variable is no longer valid:

```rust
let s1 = String::from("hello");
let s2 = s1;          // ownership MOVES from s1 to s2
println!("{}", s2);   // OK
println!("{}", s1);   // ERROR: s1 was moved; it's no longer valid
```

After `let s2 = s1`, `s1` is "moved-from" — using it is a compile error.
Why? Rule 2: only one owner at a time. If both `s1` and `s2` owned the
string, when both went out of scope, the string would be freed *twice*
(a double-free bug). By **moving** ownership to `s2` and invalidating
`s1`, Rust ensures exactly one owner, so exactly one free.

This is different from:
- **C++ copy**: would copy the whole string (two independent copies) —
  expensive and you might not want it.
- **Java/Python reference**: both variables point to the same object,
  GC frees it eventually — but allows aliasing + mutation bugs.

Rust **moves** by default: cheap (just transfers ownership, no deep
copy), safe (one owner), explicit (you opt into copying).

> :surprisedgoose: "Move" means the *ownership* transfers, not that data
> is copied around in memory — `let s2 = s1` just makes `s2` the owner
> and marks `s1` invalid; the heap data doesn't move. It's a
> compile-time bookkeeping change, free at runtime. The surprise for
> newcomers: after a move, the original is *unusable*. This feels
> strange coming from GC languages (where `s1` would still work) but
> it's exactly what prevents double-frees. The compiler tracks "who
> owns this now."

## 4. Copy types: the exception

Simple, fixed-size types stored entirely on the stack (integers,
floats, `bool`, `char`, and tuples of them) implement the **`Copy`**
trait — they're *copied*, not moved, because copying them is trivial
(just duplicate the bytes):

```rust
let x = 5;
let y = x;            // x is COPIED (it's Copy)
println!("{} {}", x, y);   // OK — both valid; 5 is cheap to copy
```

For `Copy` types, assignment duplicates the value and both variables
stay valid — there's no heap data to double-free, so there's no need to
move. The rule of thumb: **stack-only data is `Copy`** (copied);
**data with a heap allocation** (like `String`, `Vec`) is **moved** (to
avoid double-free). This is why `let y = x` works for an `i32` but
invalidates a `String`.

## 5. Clone: explicit deep copy

When you *do* want a deep copy of heap data, call `.clone()`
explicitly:

```rust
let s1 = String::from("hello");
let s2 = s1.clone();   // deep copy: s2 is an independent string
println!("{} {}", s1, s2);   // OK — both valid, two separate strings
```

`.clone()` duplicates the heap data, producing two independent owners.
It's **explicit** because it can be expensive (copying a large `Vec` or
`String`), and Rust wants that cost visible in the code. The default is
the cheap move; you opt into the expensive clone. This visibility is
deliberate — in C++, copies happen implicitly and silently cost
performance; in Rust, you see every `.clone()`.

## 6. Ownership and functions

Passing a value to a function **moves** it (or copies, if `Copy`):

```rust
fn takes_ownership(s: String) {
    println!("{}", s);
}   // s dropped here

let s = String::from("hello");
takes_ownership(s);     // s MOVED into the function
println!("{}", s);      // ERROR: s was moved into takes_ownership
```

After `takes_ownership(s)`, the function owns the string (and drops it
when it returns); the caller's `s` is invalid. Returning a value
**moves ownership out**:

```rust
fn gives_ownership() -> String {
    String::from("hello")    // ownership moves to the caller
}
let s = gives_ownership();   // s now owns the string
```

This "passing moves in, returning moves out" can feel clunky — you'd
have to keep passing ownership back and forth to use a value after a
function call. That's exactly the problem **borrowing**
([Chapter 5](/rust/part-2-ownership/borrowing-and-references)) solves:
*lend* a value to a function without giving up ownership.

## 7. Why this prevents bugs

The ownership rules eliminate, *at compile time*, entire bug classes:

- **Double-free**: impossible — one owner, one drop.
- **Use-after-free**: impossible — you can't use a moved-from variable
  (it's a compile error), and a value isn't dropped while owned.
- **Memory leaks**: rare — values are dropped at scope exit
  automatically (leaks require deliberate effort, like reference
  cycles, [Chapter 15](/rust/part-4-data/smart-pointers)).
- **Dangling pointers**: prevented (fully, with borrowing +
  lifetimes, [Chapters 5–6](/rust/part-2-ownership/borrowing-and-references)).

These are the bugs that plague C/C++ and cause most memory-safety
security vulnerabilities. Rust makes them *compile errors* — you
literally cannot ship them. That's the ownership payoff.

## 8. The mental model

The shift to internalize: **think about who owns each value, and for
how long.** When you write `let s2 = s1`, ask "does ownership move?"
(yes, for heap types). When you call `f(x)`, ask "does `f` take
ownership, or just borrow?" When a scope ends, the values owned there
are dropped.

This feels effortful at first — you're tracking something other
languages handle invisibly (GC) or dangerously (C). But it becomes
intuition, and then it's a *design tool*: ownership clarifies who's
responsible for each resource, which is good architecture regardless of
language. The borrow checker is just enforcing the ownership discipline
you'd want anyway.

> :weightliftinggoose: Ownership is the rep you must master: one owner
> per value, ownership moves on assignment/passing (heap types) or
> copies (stack `Copy` types), and values drop at scope exit. When the
> compiler says "value moved here," it's enforcing rule 2 to prevent a
> double-free. Don't fight it — understand the rule it's teaching. Spend
> real time here; everything else in Rust assumes you've internalized
> ownership. The next chapter (borrowing) makes it ergonomic.

## What we covered

- The **three ownership rules**: one owner per value; one owner at a
  time; value **dropped** when the owner goes out of scope.
- Values are **dropped** (freed) deterministically at scope exit — RAII,
  no GC, no manual free.
- Assignment/passing **moves** ownership for heap types; the moved-from
  variable becomes invalid (prevents double-free).
- **`Copy` types** (stack-only: integers, `bool`, etc.) are *copied*,
  not moved — both stay valid.
- **`.clone()`** is an explicit deep copy (visible cost) of heap data.
- Functions take ownership (move in) and return ownership (move out) —
  clunky, which motivates **borrowing**.
- Ownership eliminates double-free, use-after-free, dangling pointers,
  and most leaks **at compile time**.

## What's next

[Chapter 5](/rust/part-2-ownership/borrowing-and-references) — borrowing
and references. How to *lend* a value (by reference) without giving up
ownership, the rules for shared vs mutable borrows, and how those rules
guarantee safety.
