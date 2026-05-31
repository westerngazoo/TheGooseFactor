---
sidebar_position: 2
title: "Generics and Polymorphism"
---

# Generics and Polymorphism

> One piece of source, many types — how does the compiler *implement* it?
> Two great strategies divide the language world: **monomorphization**
> (stamp out a specialized copy per concrete type — fast, fat) and
> **boxing / dictionary passing** (one shared version that works on any
> type via indirection — small, slower). The choice shapes a language's
> performance, code size, and compilation model.

[Chapter 27](/compiler/part-8-types-and-analysis/type-inference) figured
out the types; now the back-end question: when you write a generic
function `fn max<T>(a: T, b: T) -> T`, what *machine code* does the
compiler produce? There's no single `T` at runtime. This chapter covers
the two answers — and they explain why C++/Rust generics feel different
from Java/Haskell ones.

## 1. Two kinds of polymorphism

First, distinguish the two things "polymorphism" means:

- **Parametric polymorphism**: code that works **uniformly** for *any*
  type — `max<T>`, `Vec<T>`, `id<T>`. The behavior doesn't depend on which
  type; it just shuffles values around. (Generics, in most usage.)
- **Ad-hoc polymorphism**: code that works for several types but does
  **different things** per type — `+` on ints vs strings, a `Show`/`Display`
  that formats each type differently. (Overloading, type classes, traits,
  interfaces.)

The implementation strategies below apply mainly to parametric
polymorphism; ad-hoc polymorphism adds the twist of *dispatching to the
right per-type behavior* (§5). Keep the two separate — they have different
costs.

## 2. The core problem

A generic function has no concrete type at compile time, yet machine code
needs concrete types — to know how big a value is, which registers hold
it, how to copy or compare it:

```
fn max<T: Ord>(a: T, b: T) -> T {
    if a > b { a } else { b }
}
```

To compile `max`, the back end must know: how big is a `T` (to allocate,
copy, pass it)? how do you compare two `T`s (`>`)? Those depend on the
concrete type — `i32` is 4 bytes compared with one instruction; a `String`
is a pointer compared with a function call. The two strategies are two
answers to "how do we get concrete-type information into generic code."

## 3. Monomorphization

**Monomorphization** ("make single-form") resolves the problem at **compile
time**: for *each concrete type* the generic is used with, generate a
**specialized copy** with the type filled in:

```
max::<i32>(...)      → compiler emits a dedicated max_i32 (compare with cmp instr)
max::<String>(...)   → compiler emits a dedicated max_String (compare via String::cmp)
```

Each specialization is ordinary, concrete, fully-optimizable code — the
generic vanishes; there's no runtime indirection, no boxing, and the
optimizer can inline and specialize freely. This is **C++ templates** and
**Rust generics**.

- **Pro**: **zero runtime cost** — generic code runs as fast as
  hand-written concrete code; values stay unboxed; everything inlines.
- **Con**: **code bloat** (a copy per type — binary size and instruction-
  cache pressure) and **slower compiles** (more code to generate and
  optimize); generics can't cross a dynamic-linking boundary easily
  (the caller's types must be known at compile time).

## 4. Boxing and type erasure

The opposite strategy: compile **one** version that works for *all* types
by making every value a **uniform, boxed representation** — typically a
pointer to a heap object — so the generic code manipulates pointers without
knowing what they point to:

```
// one shared version; T is always "a pointer to something"
fn max(a: ptr, b: ptr) -> ptr { ... compare via an indirect operation ... }
```

Because every `T` is represented identically (a pointer), one compiled
function serves all types — the type is **erased**. This is **Java
generics** (erased to `Object` + casts) and the boxed style of many managed
languages.

- **Pro**: **no code bloat** (one version), fast compiles, works across
  dynamic boundaries (the generic code is type-agnostic).
- **Con**: **runtime cost** — values are **boxed** (heap-allocated,
  pointer-chased, GC pressure), and operations go through **indirection**;
  no specialization or inlining across the generic.

## 5. Ad-hoc polymorphism: dictionary passing

Ad-hoc polymorphism (`max` needs to *compare* `T`; `print` needs to
*format* `T`) requires getting the *per-type behavior* into the generic
code. With monomorphization, the behavior is just baked into each
specialization. With erasure, the standard technique is **dictionary
passing**:

```
// a "dictionary" of the operations T supports, passed as a hidden argument
fn max(ops: OrdDict, a: ptr, b: ptr) -> ptr {
    if ops.greater(a, b) { a } else { b }   // call through the dictionary
}
```

The compiler passes a **dictionary** — a record of function pointers, one
per required operation (a vtable, essentially) — alongside the value. This
is how **Haskell type classes** and (in part) **Rust trait objects** work:
the constraint `T: Ord` becomes "also receive an `Ord` dictionary for `T`."
Dictionary passing is the erasure-world answer to "which `>` do I call?" —
and it's exactly the **trait object / `dyn`** indirection
([the closure/object duality](/compiler/part-7-language-features/closures)
again: a dictionary is a vtable is an environment of behaviors).

> :surprisedgoose: The same language can use *both* strategies, and the
> choice is a knob, not a fixed property. Rust monomorphizes `fn f<T:
> Trait>` (static dispatch, fast, fat) but *erases* `dyn Trait` (dynamic
> dispatch via a vtable/dictionary, small, indirect) — and the programmer
> picks per use site! C++ templates monomorphize, but `virtual` functions
> erase to vtables. Even Haskell, normally dictionary-passing, can
> **specialize** (monomorphize) hot generics for speed. So "monomorphize
> vs erase" isn't a tribe you belong to — it's a per-function trade
> between *code size + compile time* and *runtime speed*, and good
> compilers (and programmers) make it deliberately, function by function.

## 6. The trade-off, sharpened

The two strategies sit at opposite ends of one spectrum:

| | **Monomorphization** | **Erasure / boxing** |
|---|---|---|
| Runtime speed | fast (specialized, inlinable) | slower (boxed, indirect) |
| Code size | large (copy per type) | small (one version) |
| Compile time | slower | faster |
| Dynamic linking | hard (needs caller types) | easy (type-agnostic) |
| Examples | C++ templates, Rust generics | Java generics, Haskell classes |

There's genuinely **no free lunch** — it's the same kind of trade as
inlining ([Chapter 12](/compiler/part-4-optimization/optimization-pipeline)):
duplicate code for speed, or share code for size. The "right" answer
depends on whether the generic is hot (favor monomorphization) or
cold/large (favor erasure), which is why mature systems offer both and
even mix them (**partial specialization**: monomorphize the hot
instantiations, box the rest).

## 7. Where the strategy is decided

Implementing polymorphism touches the middle and back of the pipeline:

- **Front end / type checking** ([Chapter 8](/compiler/part-3-types-and-ir/type-checking),
  [Chapter 27](/compiler/part-8-types-and-analysis/type-inference)):
  resolve the generic, record the concrete type arguments and the required
  constraints (which operations `T` must support).
- **IR / lowering** ([Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir)):
  *this is where the choice is made.* Monomorphization **clones** the
  generic's IR per concrete type (substituting types); erasure **lowers to
  boxed values + dictionary arguments** once.
- **Optimization** ([Part IV](/compiler/part-4-optimization/optimization-pipeline)):
  monomorphized copies inline and specialize; for boxed code, the
  optimizer tries to **devirtualize** dictionary calls when it can prove
  the type — recovering some monomorphization-like speed.
- **Back end / linking** ([Chapter 26](/compiler/part-7-language-features/modules-and-linking)):
  monomorphization can generate the *same* specialization in multiple units
  (the linker must de-duplicate — "weak" symbols / COMDAT folding); erased
  code links uniformly.

So "generics" is not one feature but a *strategy decision* spread across
type checking, lowering, optimization, and linking — and it's one of the
defining choices in a language's implementation, visible in its binary
size, its runtime speed, and even its compile times.

> :weightliftinggoose: Two strategies for "one source, many types":
> **monomorphization** (specialize per concrete type → fast, inlinable,
> but code bloat + slow compiles; C++/Rust generics) vs **erasure /
> boxing** (one shared version on uniform pointers → small + fast compiles,
> but boxed + indirect; Java/Haskell). For *ad-hoc* polymorphism (per-type
> behavior), the erasure side uses **dictionary passing** (a vtable of
> operations as a hidden argument) — which is just trait objects / `dyn`.
> The deepest point: it's a **per-function knob** (Rust: `<T>` vs `dyn`),
> the same speed-vs-size trade as inlining. Choose by whether the generic
> is hot.

## What we covered

- **Parametric** polymorphism (uniform for any type) vs **ad-hoc**
  polymorphism (different behavior per type — overloading, classes,
  traits).
- The core problem: generic code has **no concrete type** at compile time,
  but machine code needs sizes, registers, and operations.
- **Monomorphization**: emit a **specialized copy per concrete type** —
  zero runtime cost, inlinable, but **code bloat** + slow compiles (C++
  templates, Rust generics).
- **Erasure / boxing**: one shared version on **uniform boxed** values —
  small + fast compiles, but **boxed + indirect** (Java generics, Haskell).
- **Dictionary passing** implements ad-hoc polymorphism under erasure: a
  record of per-type operations (a vtable) passed as a hidden argument —
  i.e. trait objects / `dyn`.
- It's a **spectrum and a per-function knob** (Rust `<T>` vs `dyn`), the
  same speed-vs-size trade as inlining; systems mix both (partial
  specialization, devirtualization).
- The strategy is decided mainly at **lowering**, with consequences in
  optimization and linking.

## What's next

[Chapter 29](/compiler/part-8-types-and-analysis/ownership-and-borrow-checking)
— ownership and borrow checking. Memory safety *without* a garbage
collector, enforced at compile time: ownership and moves, the
aliasing-xor-mutation rule, **lifetimes**, and the **borrow checker** as a
static data-flow analysis.
