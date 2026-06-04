---
sidebar_position: 2
title: "Advanced Lifetimes and Variance"
---

# Advanced Lifetimes and Variance

> The lifetimes of [Chapter 6](/rust/part-2-ownership/lifetimes) had hidden
> depths. **Lifetime subtyping** ("this lifetime outlives that one"),
> **variance** (why `&T` and `&mut T` behave differently when you
> substitute lifetimes), **higher-ranked trait bounds** (`for<'a>`), and
> **`PhantomData`** are the machinery behind the trickiest borrow-checker
> errors — and the reason self-referential structs are hard.

[Chapter 6](/rust/part-2-ownership/lifetimes) taught lifetimes as
relationships the borrow checker verifies. That's 95% of what you need.
This chapter is the other 5% — the concepts that explain the *baffling*
lifetime errors, the ones where the fix isn't obvious. You won't write
these daily, but understanding them turns "the compiler is being insane"
into "oh, *that's* why."

## 1. Lifetime subtyping: outlives

Lifetimes form a **subtyping** relationship based on "outlives." If
lifetime `'a` lasts *at least as long as* `'b`, we write `'a: 'b` ("`'a`
outlives `'b`"), and a reference valid for `'a` can be used where one valid
for `'b` is expected:

```rust
fn longest<'a, 'b>(x: &'a str, y: &'b str) -> &'a str
where
    'b: 'a,                  // 'b must outlive 'a, so y is valid long enough
{
    if x.len() > y.len() { x } else { y }
}
```

A longer lifetime is a **subtype** of a shorter one (it can stand in
wherever the shorter is needed — more is always okay). The `'a: 'b` bound
appears when you need to *relate* two lifetimes the compiler can't infer —
"this reference lives at least as long as that one." It's the lifetime
analogue of a type bound.

## 2. Variance: the subtle one

**Variance** governs how subtyping of a type relates to subtyping of its
*parameters*. If `'long: 'short`, when is `Container<'long>` usable as
`Container<'short>`? Three answers:

- **Covariant**: `&'long T` *is* usable as `&'short T` (a longer-lived
  shared reference works where a shorter one is wanted). Most types are
  covariant in their lifetime/type params.
- **Invariant**: `&'long mut T` is **not** interchangeable with `&'short
  mut T` — mutable references are **invariant**. You can't substitute the
  lifetime in either direction.
- **Contravariant**: rare — function *arguments* (`fn(T)`) are
  contravariant in `T`.

The crucial case: **`&T` is covariant, `&mut T` is invariant.** Why? A
`&mut T` lets you *write* — and allowing lifetime substitution on a writable
reference would let you store a short-lived value where a long-lived one is
expected, creating a dangling reference. Invariance forbids exactly that
hole.

> :surprisedgoose: Variance is the source of the most "but that should
> obviously work!" borrow-checker errors. Here's the intuition for why
> `&mut T` *must* be invariant: a `&mut Vec<&'long str>` lets you `push` a
> reference into the `Vec`. If you could treat it as `&mut Vec<&'short
> str>`, you could push a *short*-lived reference into a `Vec` that
> outlives it — leaving a dangling pointer the moment the short value dies.
> So Rust forbids the substitution entirely. You almost never *think*
> about variance, but when a mutable reference "inexplicably" won't coerce,
> invariance is why — the compiler is plugging a soundness hole you can't
> see.

## 3. Higher-ranked trait bounds (HRTB)

Sometimes a bound must hold for **all** lifetimes, not one specific lifetime
— especially with closures and function pointers. That's a **higher-ranked
trait bound**, written `for<'a>`:

```rust
// f must work for ANY lifetime 'a, not one fixed lifetime:
fn apply<F>(f: F)
where
    F: for<'a> Fn(&'a str) -> &'a str,   // "for all 'a"
{
    // ...
}
```

`for<'a> Fn(&'a str) -> &'a str` reads "a function that, *for any* lifetime
`'a`, takes a `&'a str` and returns a `&'a str`." Without HRTB you'd have
to pin a single lifetime, which wouldn't work for a closure called with
references of different lifetimes. HRTB usually appears via **lifetime
elision** (you rarely type `for<'a>`), but it shows up in error messages
about closures and trait bounds, and now you know what it means: *for all
lifetimes*.

## 4. The 'static bound vs the 'static reference

`'static` ([Chapter 6](/rust/part-2-ownership/lifetimes)) has two distinct
uses people conflate:

- **`&'static T`** — a *reference* valid for the whole program (a string
  literal, a leaked allocation).
- **`T: 'static`** — a *bound* meaning "`T` contains **no** non-`'static`
  references" — i.e. `T` is *fully owned* or only holds `'static` refs. An
  `i32`, a `String`, a `Vec<i32>` are all `T: 'static` — they borrow
  nothing.

The bound `T: 'static` is what `thread::spawn`
([Chapter 16](/rust/part-5-concurrency/threads-send-sync)) and many async
APIs require — *not* "lives forever," but "doesn't borrow anything that
could go away." This distinction defuses a classic confusion: seeing
`T: 'static` in a bound doesn't mean "make it live forever," it means "this
value must not hold short-lived borrows" — usually fixed by *owning* the
data (clone, or move it in), not by leaking.

## 5. PhantomData

Sometimes a type needs to *act as if* it holds a type or lifetime it
doesn't physically store — for variance, drop-checking, or marker purposes.
**`PhantomData<T>`** is a zero-sized type that tells the compiler "pretend
I contain a `T`":

```rust
use std::marker::PhantomData;

struct Parser<'a, T> {
    data: &'a [u8],
    _marker: PhantomData<T>,     // "this Parser logically produces T"
}
```

`PhantomData<T>` occupies **no space** at runtime but makes the type
*behave* as if it owns/borrows a `T` for the purposes of variance, the
`Send`/`Sync` auto-traits, and the drop checker. It's essential for `unsafe`
abstractions ([Chapter 27](/rust/part-7-advanced-types/advanced-unsafe-and-ffi))
that manage memory the compiler can't see (a raw-pointer-backed collection
uses `PhantomData<T>` so the compiler knows it "owns" `T`s), and for
phantom-type tricks ([Chapter 26](/rust/part-7-advanced-types/typestate-and-zero-cost-design)).
A marker that costs nothing but teaches the compiler what your type means.

## 6. Why self-referential structs are hard

These concepts converge on a famous Rust pain point: a struct that holds a
reference *into its own data*:

```rust
struct SelfRef {
    data: String,
    slice: &/* ??? */ str,       // wants to borrow `data` — but what lifetime?
}
```

There is no lifetime you can write: `slice` borrows `data`, but they're in
the *same* struct, so `slice`'s lifetime would have to be the struct's own
lifetime — which doesn't exist as a nameable thing, and which *moving* the
struct would invalidate (the `String`'s heap buffer moves... actually its
pointer doesn't, but the borrow checker can't know that). Self-reference
breaks the lifetime model.

This is *why* `Pin` exists ([Chapter 28](/rust/part-8-in-practice/async-internals)):
async state machines are self-referential (a future holds references into
its own captured locals across `.await` points), so they need a guarantee
they won't be moved. Self-referential structs are the wall ordinary
lifetimes hit — solved by `Pin`, by indexes-instead-of-references, or by
crates like `ouroboros`, never by a lifetime annotation.

## 7. When you actually hit these

Reassurance: you can write a *lot* of Rust without consciously touching
this chapter. These concepts surface in specific situations:

- **Variance**: when a `&mut` won't coerce where you expected, or building
  a generic container with `unsafe`.
- **HRTB (`for<'a>`)**: in closure-heavy generic code, usually in error
  messages, rarely typed by hand.
- **`T: 'static`**: spawning threads/tasks, storing trait objects, caching
  — "doesn't borrow anything transient."
- **`PhantomData`**: writing `unsafe` abstractions or phantom-typed APIs.
- **Self-reference**: async internals, or trying to "just hold a reference
  to my own field."

So treat this as a *reference for the hard days*, not daily reading. When a
lifetime error resists the usual fixes (clone, restructure, shorten the
borrow), one of these is usually the real cause — and now you can name it.

## 8. The deeper picture

What unifies this chapter: lifetimes aren't just "how long" — they're a
**full subtyping system** the borrow checker reasons about, with variance
rules that exist *purely to plug soundness holes*. Every rule here —
invariance of `&mut`, the `'static` bound, why self-reference fails — is
the compiler refusing to let a dangling reference exist, even in cases too
subtle for intuition.

That's the through-line of all of Rust ([Part II](/rust/part-2-ownership/ownership-and-moves)):
the borrow checker is a soundness *prover*, and these advanced features are
the corners of the proof. You don't need them to *use* Rust, but
understanding them is the difference between fearing the borrow checker and
*trusting* it — knowing that when it rejects something, there's a real hole
it's protecting you from, even when you can't immediately see it.

> :weightliftinggoose: This is the "hard days" reference. The essentials:
> **`'a: 'b`** ("`'a` outlives `'b`"); **variance** — `&T` is **covariant**
> (longer works for shorter), `&mut T` is **invariant** (no substitution,
> to plug a dangling-pointer hole); **`for<'a>`** (HRTB — "for all
> lifetimes," mostly in closure errors); **`T: 'static`** (the *bound* =
> "holds no transient borrows," not "lives forever"); and **`PhantomData`**
> (zero-cost marker that teaches the compiler what your type owns). And
> know that **self-referential structs** are why `Pin` exists. You rarely
> reach for these — but when a lifetime error won't yield, the answer is in
> here.

## What we covered

- **Lifetime subtyping**: `'a: 'b` means `'a` **outlives** `'b`; a longer
  lifetime is a subtype (usable where a shorter is needed).
- **Variance**: `&T` is **covariant** in its parameters; **`&mut T` is
  invariant** (substitution forbidden — it would allow dangling
  references); function args are contravariant.
- **Higher-ranked trait bounds** (`for<'a>`) require a bound for **all**
  lifetimes — common with closures, usually via elision.
- **`&'static T`** (a reference living forever) vs **`T: 'static`** (a
  bound: "contains no transient borrows") — the latter is what
  thread/task APIs want.
- **`PhantomData<T>`** is a zero-sized marker that makes a type *act as if*
  it owns/borrows `T` (variance, `Send`/`Sync`, drop check) — vital for
  `unsafe` abstractions.
- **Self-referential structs** can't be expressed with lifetimes — the
  wall that motivates **`Pin`** and async internals.
- These surface only in specific hard cases; they're a reference for when
  ordinary lifetime fixes fail — and they're all the borrow checker
  plugging soundness holes.

## What's next

[Chapter 26](/rust/part-7-advanced-types/typestate-and-zero-cost-design) —
typestate and zero-cost design. Turning the type system into a *design
tool*: the **newtype** pattern, **zero-sized types**, **const generics**,
**phantom types**, and the **typestate** pattern — encoding invariants so
that illegal states won't even compile.
