---
sidebar_position: 2
title: "Collections"
---

# Collections

> The standard library's growable, owned data structures. **`Vec<T>`** (a
> dynamic array), **`String`** (growable UTF-8 text), and
> **`HashMap<K, V>`** (key–value store) cover most needs; a handful of
> specialized collections fill the rest. They all *own* their contents,
> so ownership ([Part II](/rust/part-2-ownership/ownership-and-moves))
> flows through them.

Arrays and tuples ([Chapter 3](/rust/part-1-getting-started/basic-syntax))
are fixed-size and stack-allocated. Real programs need *growable*
structures on the heap. Rust's standard collections provide them, and
because they own their elements, they drop them automatically — no manual
cleanup, no leaks.

## 1. Vec: the growable array

`Vec<T>` is the workhorse: a contiguous, growable, heap-allocated array of
`T`. You'll use it more than any other collection:

```rust
let mut v: Vec<i32> = Vec::new();
v.push(1);
v.push(2);
v.push(3);

let v2 = vec![10, 20, 30];        // the vec! macro for literals

println!("{}", v2[0]);            // index (panics if out of bounds)
if let Some(x) = v2.get(1) {      // .get returns Option — safe access
    println!("{x}");
}
v.pop();                          // removes and returns the last: Some(3)
```

Indexing with `[]` panics on out-of-bounds; `.get()` returns
`Option<&T>` for safe access ([Chapter 12](/rust/part-4-data/error-handling)).
A `Vec` owns its elements: when the `Vec` is dropped, every element is
dropped too. Pushing may reallocate (it grows capacity geometrically),
which is why a held reference into a `Vec` blocks pushing
([Chapter 5](/rust/part-2-ownership/borrowing-and-references)) — the
reallocation would invalidate it.

## 2. Iterating a Vec

Three ways to iterate, matching the three ways to access ownership:

```rust
let v = vec![1, 2, 3];

for x in &v { println!("{x}"); }        // &v: borrow each element (&T)
for x in &mut v_mut { *x += 1; }        // &mut v: mutably borrow (&mut T)
for x in v { println!("{x}"); }         // v: take ownership, consume the Vec
```

`&v` borrows (the `Vec` stays usable), `&mut v` lets you modify in place,
and bare `v` *moves* the `Vec` into the loop and consumes it. This trio —
`iter`, `iter_mut`, `into_iter` — recurs across all collections and is
the bridge to iterators ([Chapter 14](/rust/part-4-data/iterators-and-closures)).

## 3. String, briefly

`String` ([Chapter 7](/rust/part-2-ownership/slices-and-strings)) is
essentially a `Vec<u8>` guaranteed to be valid UTF-8 — a growable, owned
collection of text:

```rust
let mut s = String::new();
s.push_str("hello");
s.push(' ');
s += "world";                      // append
let joined = format!("{s}!");      // build without consuming
```

Everything from the slices chapter applies: take `&str` parameters, no
integer indexing, iterate with `.chars()` or `.bytes()`. It's listed here
because it *is* a collection — the string-shaped one.

## 4. HashMap: key–value storage

`HashMap<K, V>` stores key→value pairs with average O(1) lookup:

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("blue"), 10);
scores.insert(String::from("red"), 50);

if let Some(&s) = scores.get("blue") {     // get returns Option<&V>
    println!("blue: {s}");
}

for (team, score) in &scores {             // iterate pairs (unordered!)
    println!("{team}: {score}");
}
```

`get` returns `Option<&V>` — there might be no such key, and you must
handle that. Iteration order is **unspecified** (it's a hash map). Keys
must be hashable and comparable (`Hash + Eq`,
[Chapter 10](/rust/part-3-types/traits)).

## 5. The entry API

A frequent need: "update if present, insert a default if not." Doing it
with `get` then `insert` borrows the map twice awkwardly. The **`entry`**
API does it in one borrow:

```rust
let mut counts: HashMap<char, i32> = HashMap::new();
for c in "hello".chars() {
    *counts.entry(c).or_insert(0) += 1;     // get-or-insert-0, then increment
}
// counts: {'h':1, 'e':1, 'l':2, 'o':1}
```

`entry(c).or_insert(0)` returns a mutable reference to the value for `c`,
inserting `0` first if absent. The word-count / frequency-count idiom is
a one-liner. There's also `or_insert_with(|| expensive())` to compute the
default lazily.

## 6. Ownership in collections

Collections **own** what you put in them, so the usual ownership rules
apply ([Chapter 4](/rust/part-2-ownership/ownership-and-moves)):

```rust
let s = String::from("hi");
let mut v = Vec::new();
v.push(s);                  // s is MOVED into the Vec
// println!("{}", s);       // ERROR: s was moved

let n = 5;
let mut nums = Vec::new();
nums.push(n);               // i32 is Copy — n is copied, still usable
println!("{n}");            // OK
```

Pushing a non-`Copy` value moves it into the collection (the collection
now owns it); `Copy` types are copied. Removing a value (`pop`, `remove`)
moves ownership back out. The collection drops all owned elements when it
itself is dropped — automatic, deterministic cleanup of the whole
structure.

## 7. The other collections

Beyond the big three, `std::collections` offers specialized structures —
reach for them when their guarantees fit:

- **`HashSet<T>`** — a set of unique values (a `HashMap` with no values);
  membership tests and dedup.
- **`BTreeMap<K, V>` / `BTreeSet<T>`** — like the hash versions but
  **sorted** by key, with O(log n) ops and ordered iteration. Use when
  you need range queries or sorted order.
- **`VecDeque<T>`** — a double-ended queue: efficient push/pop at *both*
  ends (a ring buffer). Use for queues and stacks-from-the-front.
- **`BinaryHeap<T>`** — a priority queue; always pops the max.

Default to `Vec` and `HashMap`; switch to these when you specifically
need ordering (`BTree*`), front-insertion (`VecDeque`), uniqueness
(`HashSet`), or priority (`BinaryHeap`).

> :nerdygoose: Notice the naming honesty: `HashMap` vs `BTreeMap` tells
> you the *implementation*, because the implementation determines the
> guarantees you care about — `HashMap` is O(1) but unordered;
> `BTreeMap` is O(log n) but sorted with range queries. Other languages
> often hide this behind one "Map" / "dict" type and pick for you. Rust
> surfaces the trade-off in the type name so you choose deliberately —
> the same "make the cost visible" philosophy as `.clone()`
> ([Chapter 4](/rust/part-2-ownership/ownership-and-moves)) and static vs
> dynamic dispatch ([Chapter 10](/rust/part-3-types/traits)).

## 8. Choosing a collection

A quick decision guide:

- A list of things, grow at the end, index by position → **`Vec<T>`**.
- Text → **`String`**.
- Look up values by key, don't care about order → **`HashMap<K, V>`**.
- Same, but need sorted iteration or range queries → **`BTreeMap<K, V>`**.
- Just membership / uniqueness → **`HashSet<T>`** (or `BTreeSet`).
- Queue / push-pop at both ends → **`VecDeque<T>`**.
- Always need the largest item → **`BinaryHeap<T>`**.

In practice `Vec` and `HashMap` cover the large majority of code. Pick
the simplest collection that meets your access pattern, and remember the
real power comes when you process them with **iterators** — the next
chapter.

> :weightliftinggoose: `Vec` and `HashMap` are your bread and butter —
> get fluent with `push`/`pop`/`get`, the `entry` API for
> count-and-update, and the **`iter` / `iter_mut` / `into_iter`** trio
> (borrow / mutably borrow / consume). Remember collections **own** their
> elements: pushing moves non-`Copy` values in, and dropping the
> collection drops everything inside. Know that `BTreeMap`, `VecDeque`,
> `HashSet`, and `BinaryHeap` exist for when ordering, both-ends access,
> uniqueness, or priority matters. Then learn to *process* them with
> iterators next.

## What we covered

- **`Vec<T>`**: growable heap array; `push`/`pop`, `[]` (panics) vs
  `.get()` (`Option`); iterate with `&v` / `&mut v` / `v`.
- **`String`** is the text collection (a UTF-8 `Vec<u8>`) — slices-chapter
  rules apply.
- **`HashMap<K, V>`**: O(1) key→value, `get` returns `Option<&V>`,
  unordered; the **`entry` API** does get-or-insert-and-update in one
  step.
- Collections **own** their elements: non-`Copy` values are **moved** in,
  everything is dropped with the collection.
- Specialized collections: **`HashSet`** (uniqueness), **`BTreeMap`/
  `BTreeSet`** (sorted), **`VecDeque`** (both-ends), **`BinaryHeap`**
  (priority).
- Choose the simplest collection fitting your access pattern; `Vec` and
  `HashMap` cover most cases.

## What's next

[Chapter 14](/rust/part-4-data/iterators-and-closures) — iterators and
closures. How to *process* collections functionally:
`map`/`filter`/`fold` chains that are lazy and **zero-cost**, plus
closures — the anonymous functions that make iterator chains expressive.
