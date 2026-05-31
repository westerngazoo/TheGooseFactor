---
sidebar_position: 3
title: "Iterators and Closures"
---

# Iterators and Closures

> Process data functionally, at zero cost. **Closures** are anonymous
> functions that capture their environment; **iterators** are lazy
> sequences you transform with `map`/`filter`/`fold` chains. Together
> they let you write expressive, high-level data pipelines that compile to
> loops as tight as hand-written ones.

This is where Rust feels high-level. After modeling data
([Part III](/rust/part-3-types/structs-and-enums)) and storing it
([Chapter 13](/rust/part-4-data/collections)), you *process* it — and
Rust's iterators give you the functional style (the same ideas as Lisp's
higher-order functions and JavaScript's array methods) with none of the
runtime overhead. First we need closures, the glue that makes iterator
chains work.

## 1. Closures: anonymous functions

A **closure** is an inline, unnamed function. The syntax is parameters in
`|bars|`, then an expression or block:

```rust
let add = |a, b| a + b;            // a closure bound to `add`
println!("{}", add(2, 3));         // 5

let nums = vec![1, 2, 3];
nums.iter().map(|x| x * 2);        // closures are usually passed inline
```

Types are usually inferred from how the closure is used, so closures are
terse. They're "functions you write where you use them" — ideal as
arguments to iterator methods.

## 2. Capturing the environment

The "closure" name comes from this: a closure can **capture** variables
from its surrounding scope, which a plain `fn` cannot:

```rust
let factor = 10;
let scale = |x| x * factor;        // captures `factor` from outside
println!("{}", scale(5));          // 50
```

By default a closure borrows what it captures (the least it needs). The
**`move`** keyword forces it to take ownership of captures instead —
essential when the closure outlives the current scope, like data handed
to a thread ([Chapter 16](/rust/part-5-concurrency/threads-send-sync)):

```rust
let data = vec![1, 2, 3];
let owns = move || println!("{:?}", data);   // `move`: closure now OWNS data
owns();
```

Borrowing by default keeps closures cheap; `move` is how you transfer
ownership in when needed.

## 3. The three closure traits: Fn, FnMut, FnOnce

How a closure uses its captures determines which trait(s) it implements —
and that's how functions specify what kind of closure they accept:

- **`FnOnce`** — consumes its captures; callable **once** (e.g. it moves
  a captured value out). Every closure is at least `FnOnce`.
- **`FnMut`** — mutably borrows captures; callable many times, can
  mutate captured state.
- **`Fn`** — borrows captures immutably; callable many times, no
  mutation.

```rust
fn apply<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 { f(x) }   // accepts an Fn
fn repeat<F: FnMut()>(mut f: F, n: u32) {                    // accepts an FnMut
    for _ in 0..n { f(); }
}
```

You rarely name these explicitly — but knowing them explains error
messages like "expected `Fn`, found `FnMut`": the closure mutates or
consumes more than the function allows. The hierarchy is `Fn` ⊂ `FnMut` ⊂
`FnOnce` (an `Fn` works anywhere an `FnMut` is wanted, etc.).

## 4. Iterators: the Iterator trait

An **iterator** produces a sequence of values, one at a time. The whole
abstraction is one trait with one required method
([Chapter 10](/rust/part-3-types/traits)):

```rust
trait Iterator {
    type Item;                              // what it yields
    fn next(&mut self) -> Option<Self::Item>;   // Some(next) or None when done
}
```

`next` hands back `Some(item)` until exhausted, then `None`. That's it —
everything else is built on `next`. A `for` loop is just sugar for calling
`next` until `None`:

```rust
let v = vec![1, 2, 3];
for x in v.iter() { /* ... */ }   // desugars to repeated v.iter().next()
```

Recall the trio from [Chapter 13](/rust/part-4-data/collections):
`.iter()` yields `&T`, `.iter_mut()` yields `&mut T`, `.into_iter()`
yields `T` (consuming the collection).

## 5. Adapters: lazy transformation

**Iterator adapters** transform one iterator into another. They take a
closure and are **lazy** — they do nothing until consumed:

```rust
let v = vec![1, 2, 3, 4, 5, 6];
let evens_squared: Vec<i32> = v.iter()
    .filter(|&&x| x % 2 == 0)     // keep evens
    .map(|&x| x * x)              // square them
    .collect();                   // CONSUME into a Vec → [4, 16, 36]
```

`filter` and `map` just *describe* a transformation; nothing runs until a
**consumer** (`collect`) drives the chain. Common adapters: `map`,
`filter`, `take`, `skip`, `enumerate` (pairs each item with its index),
`zip` (pairs two iterators), `rev`, `chain`, `flat_map`, `filter_map`.
They compose into readable pipelines that read like the transformation
you mean.

> :surprisedgoose: Iterators are **lazy**, and that's a feature, not a
> detail. `(1..).map(|x| x * x).take(5)` works on an *infinite* range
> because `map` computes nothing until `take` pulls exactly five values.
> Adapters build a *description* of the computation; only a consumer
> executes it, pulling items through the whole chain one at a time. This
> is the same idea as Lisp's lazy streams — and it's what lets you write
> a six-line pipeline that still makes a single pass over the data.

## 6. Consumers: driving the chain

**Consumers** (consuming adapters) actually run the iterator. They pull
items until `None` and produce a final result:

```rust
let v = vec![1, 2, 3, 4];
let sum: i32 = v.iter().sum();                       // 10
let count = v.iter().filter(|&&x| x > 2).count();    // 2
let all_pos = v.iter().all(|&x| x > 0);              // true
let first_even = v.iter().find(|&&x| x % 2 == 0);    // Some(&2)
let product = v.iter().fold(1, |acc, &x| acc * x);   // 24 (general reduce)
let doubled: Vec<i32> = v.iter().map(|&x| x * 2).collect();  // [2,4,6,8]
```

`collect` is the most versatile — it gathers into a `Vec`, `String`,
`HashMap`, or any collection (sometimes you annotate the target type).
`fold` is the general reducer (`sum`/`product`/`count` are specializations).
The pattern is always: **a source, zero or more lazy adapters, one
consumer.**

## 7. Zero-cost: as fast as a loop

The headline claim: iterator chains compile to code **as fast as a
hand-written loop** — often faster, because the compiler can optimize the
whole pipeline. This six-line chain:

```rust
let total: u64 = (1..=1000).filter(|n| n % 3 == 0).map(|n| n as u64).sum();
```

compiles to a single tight loop with no intermediate `Vec`s, no closure
allocations, no per-item function-call overhead — the adapters and
closures inline and vanish ([Chapter 1](/rust/part-1-getting-started/why-rust)'s
zero-cost abstraction, [Chapter 11](/rust/part-3-types/generics)'s
monomorphization at work). You get the readability of a functional
pipeline and the performance of imperative code. There is no reason to
hand-write the loop "for speed."

## 8. Why this style wins

Iterator chains are idiomatic Rust for processing data, and for good
reasons:

- **Expressive**: the pipeline reads as the transformation —
  filter, map, collect — not as index bookkeeping.
- **Safe**: no manual indices means no off-by-one or out-of-bounds bugs
  ([Chapter 3](/rust/part-1-getting-started/basic-syntax) noted `for` is
  always for-each for this reason).
- **Lazy & fused**: one pass, no temporary collections, infinite sources
  welcome.
- **Zero-cost**: compiles to the same machine code as the loop you'd
  write by hand.

The combination of closures (behavior as values) and iterators (lazy,
composable sequences) gives Rust a functional-programming feel that costs
nothing — the best of both worlds the language keeps promising.

> :weightliftinggoose: Think in pipelines: **source → adapters →
> consumer.** Reach for `iter().map(...).filter(...).collect()` instead
> of index loops — it's clearer, safer, and *just as fast* thanks to
> zero-cost compilation, so never avoid it for performance. Learn the
> staples (`map`, `filter`, `enumerate`, `zip`, `fold`, `collect`,
> `sum`, `find`, `any`/`all`) and remember adapters are **lazy** — a
> chain does nothing until a consumer runs it. Closures (`|x| ...`, plus
> `move` to capture by ownership) are the glue. This is the high-level
> Rust that feels a world away from manual memory management — yet it's
> the same zero-cost language underneath.

## What we covered

- **Closures** (`|args| body`) are anonymous functions that **capture**
  their environment (borrowing by default, or by ownership with
  **`move`**).
- Closures implement **`Fn`** (borrow), **`FnMut`** (mutate), or
  **`FnOnce`** (consume) depending on how they use captures — how
  functions specify what closure they accept.
- An **iterator** is the `Iterator` trait: one method, `next() ->
  Option<Item>`; `for` loops desugar to it. `iter`/`iter_mut`/`into_iter`
  borrow/mut-borrow/consume.
- **Adapters** (`map`, `filter`, `enumerate`, `zip`, ...) are **lazy** —
  they describe a transformation and do nothing until consumed (infinite
  sources work).
- **Consumers** (`collect`, `sum`, `fold`, `find`, `any`/`all`, `count`)
  drive the chain and produce a result; `collect` builds many collection
  types.
- Iterator chains are **zero-cost** — they compile to loops as tight as
  hand-written ones (monomorphization + inlining).
- The style is expressive, index-bug-free, lazy, and fast — idiomatic
  Rust for data processing.

## What's next

[Chapter 15](/rust/part-4-data/smart-pointers) — smart pointers. `Box`,
`Rc`, and `RefCell`: heap allocation, shared ownership, and interior
mutability — the tools for the ownership patterns (recursive types, graphs,
shared state) that a single owner can't express alone.
