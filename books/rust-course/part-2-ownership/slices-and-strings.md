---
sidebar_position: 4
title: "Slices and Strings"
---

# Slices and Strings

> A **slice** is a borrowed view into a contiguous sequence — part of an
> array, a `Vec`, or a `String` — without owning or copying it. Slices
> explain Rust's two string types (`String` vs `&str`) and its careful,
> UTF-8-safe approach to text. They're references and lifetimes
> ([Chapters 5–6](/rust/part-2-ownership/borrowing-and-references)) put
> to work.

We close Part II with the most-used borrowed type in Rust: the **slice**.
Understanding slices clears up the perennial beginner confusion —
"why are there two string types?" — and shows ownership and borrowing
solving a concrete, everyday problem.

## 1. The slice: a borrowed view

A slice is a reference to a *contiguous run* of elements, not the whole
collection. It's written `&[T]` (a slice of `T`) and stores two things: a
pointer to the start, and a length. It borrows — it doesn't own or copy
the elements:

```rust
let arr = [1, 2, 3, 4, 5];
let middle: &[i32] = &arr[1..4];   // a view of elements 1,2,3 (indices 1..4)
println!("{:?}", middle);          // [2, 3, 4]
```

`&arr[1..4]` borrows three elements of `arr` using a range
([Chapter 3](/rust/part-1-getting-started/basic-syntax)). No data is
copied; `middle` is a window onto `arr`'s memory, valid only as long as
`arr` is (a lifetime, [Chapter 6](/rust/part-2-ownership/lifetimes)).

## 2. String vs &str: the two string types

Rust's two string types confuse everyone at first. The distinction is
exactly ownership:

- **`String`** — an **owned**, growable, heap-allocated string. It owns
  its bytes and frees them when dropped (like `Vec<u8>` of UTF-8). Use it
  when you need to *own* or *modify* text.
- **`&str`** — a **string slice**: a *borrowed* view into string data
  (UTF-8 bytes) you don't own. It's a pointer + length, like any slice.
  Use it to *read* text you were lent.

```rust
let owned: String = String::from("hello");   // owns its bytes on the heap
let borrowed: &str = &owned;                  // borrows a view of them
let literal: &str = "world";                  // a slice into the binary
```

`String` is to `&str` as `Vec<T>` is to `&[T]`: one owns, the other
borrows. A string literal like `"world"` is a `&'static str` — a slice
pointing into read-only program memory
([Chapter 6](/rust/part-2-ownership/lifetimes)).

## 3. String slices

A `&str` can view *part* of a `String`, just like an array slice:

```rust
let s = String::from("hello world");
let hello: &str = &s[0..5];     // "hello"
let world: &str = &s[6..11];    // "world"
```

These slices borrow `s`'s bytes — no copying — and the borrow checker
keeps them valid. A classic use is a `first_word` function that returns a
slice *into* its input rather than a new allocation:

```rust
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &b) in bytes.iter().enumerate() {
        if b == b' ' { return &s[0..i]; }   // slice up to the first space
    }
    s
}
```

The returned `&str` points into the caller's string. Cheap, and the
lifetime rules guarantee it can't outlive the data.

## 4. Why functions take &str

Idiomatic Rust functions take `&str`, not `&String`, for parameters —
because `&str` is **more general**. Thanks to *deref coercion*, a
`&String` automatically becomes a `&str` when needed, so a `&str`
parameter accepts both owned strings and literals:

```rust
fn greet(name: &str) { println!("Hello, {name}"); }

let owned = String::from("Ada");
greet(&owned);          // &String coerces to &str
greet("Grace");         // &str literal works directly
greet(&owned[0..2]);    // a sub-slice works too
```

One signature, every kind of string input. The rule of thumb: **take
`&str` for read-only string parameters; return/store `String` when you
need ownership.** This maximizes what callers can pass you.

## 5. Strings are UTF-8 — and you can't index them

Rust strings are guaranteed **valid UTF-8**, and this has a surprising
consequence: you **cannot index a string by integer**:

```rust
let s = String::from("héllo");
// let c = s[0];        // ERROR: `String` cannot be indexed by integer
```

Why forbid it? In UTF-8, a "character" may be 1–4 bytes, so `s[0]` is
ambiguous — do you want the first *byte* or the first *character*? They
differ for `é`. Indexing also couldn't be O(1) and correct at once. Rust
makes you say what you mean:

```rust
for c in s.chars() { /* iterate Unicode scalar values */ }
for b in s.bytes() { /* iterate raw bytes */ }
let slice = &s[0..1];   // byte-range slice — PANICS if it splits a char
```

> :nerdygoose: Most languages let you index a string and quietly hand you
> a byte (C), a UTF-16 code unit (Java/JavaScript — which mis-splits
> emoji), or a code point (Python 3). All paper over the fact that "the
> *n*th character" is genuinely ambiguous in a variable-width encoding.
> Rust refuses to pretend: it makes you choose `.chars()`, `.bytes()`, or
> a byte slice, so text bugs (mangled accents, split emoji) become
> impossible to write by accident. Annoying on day one, correct forever
> after.

## 6. Slices of arrays and vectors

Slices aren't string-specific — `&[T]` works for any contiguous
sequence. A function that takes `&[T]` accepts an array *or* a `Vec`
([Chapter 13](/rust/part-4-data/collections)), the same way `&str`
accepts any string:

```rust
fn sum(nums: &[i32]) -> i32 {
    nums.iter().sum()
}

let arr = [1, 2, 3];
let vec = vec![4, 5, 6];
sum(&arr);          // array coerces to &[i32]
sum(&vec);          // Vec coerces to &[i32]
sum(&vec[1..]);     // a sub-slice works too
```

Taking `&[T]` instead of `&Vec<T>` is the same generality move as `&str`
over `&String`: write functions against the borrowed *view*, and they
accept the widest range of inputs.

## 7. Slices and the borrow checker

Because a slice borrows its source, the borrowing rules
([Chapter 5](/rust/part-2-ownership/borrowing-and-references)) apply — and
they catch real bugs. A slice is a shared borrow, so you can't mutate the
collection while a slice of it is alive:

```rust
let mut s = String::from("hello world");
let word = first_word(&s);   // shared borrow of s, held in `word`
// s.clear();                // ERROR: can't mutate s while `word` borrows it
println!("first word: {}", word);
```

`s.clear()` would free the bytes `word` points into — a use-after-free in
any other language. Here the shared borrow held by `word` blocks the
mutation until `word`'s borrow ends. The slice's lifetime *is* the
protection: it can't outlive, and can't be invalidated by mutation of,
the data it views.

## 8. Why slices matter

Slices are where ownership pays off in daily code. They let you:

- **Pass parts of data cheaply** — a view is a pointer + length, no copy,
  no allocation.
- **Write general APIs** — `&str`/`&[T]` parameters accept owned,
  borrowed, literal, and sub-range inputs alike.
- **Stay safe automatically** — the borrow checker guarantees a slice
  never outlives or is invalidated by its source.

They're the concrete embodiment of Part II: a slice is a *borrowed*,
*lifetime-bounded* view, and everything about it follows from ownership
and the borrowing rules. Master slices and you've made ownership
practical.

> :weightliftinggoose: Two takeaways to lock in. First, the type pair:
> **`String`/`Vec<T>` own; `&str`/`&[T]` borrow** — own to keep or
> mutate, borrow to read. Second, the API habit: **accept `&str` and
> `&[T]` parameters** so callers can pass anything. And remember Rust
> won't let you index a string by integer — reach for `.chars()`,
> `.bytes()`, or a byte slice on purpose. Slices are ownership made
> useful; get comfortable here and Part II is yours.

## What we covered

- A **slice** (`&[T]`) is a borrowed view (pointer + length) into a
  contiguous sequence — no ownership, no copy.
- **`String`** owns growable heap text; **`&str`** is a borrowed string
  slice. Same owns/borrows split as `Vec<T>` vs `&[T]`.
- **String slices** (`&s[a..b]`) view part of a string; functions like
  `first_word` can return slices into their input.
- Take **`&str`** parameters (not `&String`) — deref coercion makes them
  accept owned strings, literals, and sub-slices.
- Strings are **UTF-8**; you **can't index by integer** — use `.chars()`,
  `.bytes()`, or byte-range slices, so text bugs can't happen silently.
- `&[T]` slices work for arrays and `Vec`s alike — write APIs against the
  borrowed view for maximum generality.
- Slices obey the **borrow checker**: a live slice blocks mutation of its
  source, preventing use-after-free.

## What's next

That's Part II — ownership, borrowing, lifetimes, and slices: the heart
of Rust. [Part III](/rust/part-3-types/structs-and-enums) turns to
**types and abstraction**, starting with structs and enums — how you
model your own data — then pattern matching, traits, and generics.
