---
sidebar_position: 3
title: "Ownership and Borrow Checking"
---

# Ownership and Borrow Checking

> Memory safety with no garbage collector and no runtime cost — proven at
> compile time. **Ownership** tracks who is responsible for freeing each
> value; **borrowing** lets code use a value without owning it, under the
> rule "one mutable borrow *xor* many shared borrows"; and the **borrow
> checker** is a static data-flow analysis that proves no reference
> outlives its data. This is Rust's central idea, viewed as a compiler
> problem.

[Chapter 20](/compiler/part-6-runtime/garbage-collection) freed memory at
*runtime* with a GC. This chapter does it at *compile time* with a type-
system discipline — the approach that gives memory safety *and* C-level
performance with no collector. It's a beautiful application of the
data-flow analysis you built in
[Chapter 14](/compiler/part-4-optimization/data-flow-analysis), turned into
a correctness check.

## 1. The problem: safety without a GC

Manual memory management (C) is fast but unsafe: use-after-free,
double-free, dangling pointers, data races — the bugs behind most
memory-safety vulnerabilities. Garbage collection
([Chapter 20](/compiler/part-6-runtime/garbage-collection)) is safe but
costs runtime work (pauses, throughput, memory overhead). Is there a third
way — **safe *and* free**?

The ownership approach says yes, by moving the reasoning to **compile
time**: instead of *checking at runtime* whether a free is safe (or
deferring to a collector), the compiler **proves at compile time** that
every value is freed exactly once, at the right time, with no live
references remaining. If the proof fails, the program doesn't compile. No
runtime checks, no collector — the safety is a static guarantee with zero
runtime cost.

## 2. Ownership and moves

The foundation is **ownership**: every value has exactly **one owner** (a
variable), and when the owner goes out of scope, the value is **freed**
(its destructor runs — RAII,
[Chapter 20](/compiler/part-6-runtime/garbage-collection)). Assigning or
passing a value **moves** ownership; the source is then **invalidated**:

```
let a = String::new();
let b = a;        // ownership MOVES from a to b
use(a);           // ERROR: a was moved; it no longer owns anything
```

Because ownership is unique and moves invalidate the source, the compiler
*always knows* who is responsible for freeing each value, and that no two
owners will free it (no double-free). The owner's scope exit is exactly
when the free happens (no use-after-free of an owned value, no leak). This
single rule — one owner, freed at scope exit, moved on assignment — gives
the compiler a precise model of every value's lifetime, statically.

## 3. Borrowing and the core rule

Moving ownership everywhere would be unbearable, so values can be
**borrowed** — used through a **reference** without transferring ownership.
Two kinds, governed by *the* rule:

- **Shared borrow** (`&T`): read-only; you may have **many** at once.
- **Mutable borrow** (`&mut T`): read-write; you may have **exactly one**,
  and no shared borrows may coexist with it.

> At any moment, a value may have **either one mutable borrow XOR any
> number of shared borrows** — never both.

This **aliasing-xor-mutability** rule is the heart of the system. It
forbids the dangerous combination — a value being *mutated* through one
path while *aliased* through another — which is the root of data races,
iterator invalidation, and a family of memory bugs. Read-only sharing is
safe (many readers, no writer); exclusive mutation is safe (one writer, no
other observers); *mixing* them is the danger, and the rule bans exactly
the mix.

> :nerdygoose: The aliasing-xor-mutability rule is a stunning two-for-one:
> the *same* compile-time check that prevents **use-after-free** also
> prevents **data races**. A data race needs aliasing (two threads
> reaching the same data) *plus* mutation (one writing) — and the rule
> forbids precisely "aliasing plus mutation." So a language that enforces
> it gets memory safety and thread safety from one mechanism. This is why
> "if it compiles, it's data-race-free" holds in Rust: the borrow checker,
> built to stop dangling pointers, stops data races as a side effect.
> One rule, two whole bug-classes eliminated — the most elegant result in
> practical type systems.

## 4. Lifetimes: how long a borrow is valid

A borrow must never outlive the value it points to — the compiler must
*prove* this. The tool is **lifetimes**: each reference has a **lifetime**,
the span of code over which it's valid, and the checker verifies that a
reference's lifetime is contained within its referent's:

```
let r;
{
    let x = 5;
    r = &x;        // r borrows x, lifetime tied to x
}                  // x dropped here — x's lifetime ends
use(r);            // ERROR: r outlives x (dangling reference)
```

Lifetimes are mostly **inferred** (the programmer rarely writes them); the
compiler computes, for each reference, the region of code where it's live,
and checks containment. Lifetimes are *descriptive, not operational* —
they don't change what the code does or cost anything at runtime; they're
purely a static label the checker reasons about. Where the relationship
between input and output references is ambiguous (a function returning a
reference derived from two arguments), the programmer annotates — exactly
the boundary case, like local type inference
([Chapter 27](/compiler/part-8-types-and-analysis/type-inference)).

## 5. The borrow checker as data-flow analysis

Here's the compiler-course payoff: **the borrow checker is a static
analysis** — specifically, it's data-flow analysis
([Chapter 14](/compiler/part-4-optimization/data-flow-analysis)) over the
control-flow graph ([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)),
tracking **loans** (active borrows):

```
for each program point, compute the set of "live loans" (borrows in effect)
  - a &mut borrow that conflicts with another live loan of the same place
    → ERROR
  - using a place while a conflicting loan is live → ERROR
  - the value's owner going out of scope while a loan is live → ERROR
```

It's the same machinery as liveness or reaching-definitions: a transfer
function per instruction (this statement creates a loan, that one uses a
place, scope-exit kills the value), propagated to a **fixpoint** over the
CFG, with conflicts reported as errors. The borrow checker isn't exotic
type-theory magic — it's a dataflow analysis whose lattice is "sets of
active loans" and whose error condition is "two conflicting loans live at
once." If you built the dataflow framework in Part IV, you have the bones
of a borrow checker.

## 6. Non-lexical lifetimes

Early borrow checkers tied a borrow's lifetime to its **lexical scope**
(the enclosing `{ }`), which rejected obviously-fine programs:

```
let mut v = ...;
let r = &v;          // shared borrow
print(r);            // last use of r
let m = &mut v;      // wanted: should be fine — r is done. Old checker: ERROR
```

**Non-lexical lifetimes (NLL)** fixed this by making a borrow last only
until its **last actual use**, not the end of the scope — which is exactly
a **liveness analysis** ([Chapter 14](/compiler/part-4-optimization/data-flow-analysis))
on references: a loan is live from its creation to its last use, computed
over the CFG. Under NLL, `r`'s borrow ends after `print(r)`, so the `&mut`
is allowed. NLL made the borrow checker far more permissive *and* recast it
explicitly as a flow-sensitive dataflow problem — the precise, modern
formulation. The lesson: better static analysis (flow-sensitive vs
scope-based) directly means a more usable language.

## 7. Connections: escape analysis and regions

Ownership/borrowing connects to analyses you've already met:

- **Escape analysis** ([Chapter 23](/compiler/part-7-language-features/closures)):
  proving a value doesn't escape a scope is the dual of proving a borrow
  doesn't outlive it — both are "does this reference leave this region?"
- **Region-based memory management**: an older idea where allocations
  belong to lexical **regions** freed all at once; lifetimes are a
  refinement (per-reference regions, inferred). Ownership is region
  inference made precise and per-value.
- **Affine/linear types**: ownership is a practical form of **affine
  typing** (a value can be used *at most once* — moved, not copied) from
  type theory; the type-system lineage behind "move invalidates the
  source."

So the borrow checker sits at the confluence of type theory (affine types),
program analysis (dataflow/liveness), and memory management (regions) — a
synthesis that took decades of research to make practical, and that Rust
brought to the mainstream.

## 8. The trade-off

Ownership and borrowing aren't free in *developer* terms — they move the
cost from runtime to **your head and the compiler's**:

- **The win**: memory safety + data-race freedom at **zero runtime cost**,
  no GC, deterministic destruction. The bugs become **compile errors**.
- **The cost**: a **learning curve** ("fighting the borrow checker") and
  real expressiveness limits — some safe programs the checker can't *prove*
  safe are rejected (it's conservative — sound but incomplete, the theme of
  [Chapter 30](/compiler/part-8-types-and-analysis/static-analysis-and-limits)).
  Escape hatches (`unsafe`, reference counting) exist for the cases the
  static discipline can't express.

It's the same bargain as static typing in general — accept a stricter
compiler now to eliminate a class of failures forever — pushed to memory
management. Whether it's worth it depends on the domain (systems code:
absolutely; a quick script: probably not), but as a *compiler technique*
it's a landmark: proving, statically and at no runtime cost, a safety
property that the whole industry previously paid for at runtime or got
wrong by hand.

> :weightliftinggoose: Ownership/borrowing is **memory safety proven at
> compile time, zero runtime cost**. The pillars: **ownership** (one owner,
> freed at scope exit, **moved** on assignment → no double-free/leak);
> **borrowing** under **aliasing-xor-mutability** (one `&mut` xor many
> `&T` → no dangling *and* no data races, one rule for both); and
> **lifetimes** (inferred regions proving no reference outlives its data).
> The key compiler insight: the **borrow checker is a data-flow analysis**
> tracking live **loans** over the CFG, and **NLL** is just liveness on
> references. It's conservative (sound, not complete) — the bridge to the
> final chapter on static analysis and its limits.

## What we covered

- Ownership/borrowing gives memory safety **without a GC** by *proving*
  safety at **compile time** (zero runtime cost) instead of checking at
  runtime.
- **Ownership**: one owner per value, freed at scope exit, **moved** on
  assignment (source invalidated) — no double-free, no leak,
  deterministic.
- **Borrowing**: **shared** (`&T`, many) xor **mutable** (`&mut T`, one)
  references — the **aliasing-xor-mutability** rule forbids the
  mutation+aliasing that causes dangling pointers *and* data races (one
  rule, two bug-classes).
- **Lifetimes** are inferred regions; the checker proves no reference
  outlives its referent (annotations only at ambiguous boundaries).
- The **borrow checker is a data-flow analysis** tracking live **loans**
  over the CFG; conflicts = errors.
- **Non-lexical lifetimes** = **liveness** on references (borrow lasts to
  last use), making the checker permissive and explicitly flow-sensitive.
- It connects **affine types**, **regions**, and **escape analysis**; the
  trade is a learning curve + conservative rejections for zero-cost safety.

## What's next

[Chapter 30](/compiler/part-8-types-and-analysis/static-analysis-and-limits)
— static analysis and its limits. The general framework behind the borrow
checker, the optimizer's analyses, and every linter: **abstract
interpretation**, the **soundness/precision** trade-off, and the hard wall
of **undecidability** (Rice's theorem) that forces every analysis to
approximate — closing the expanded course.
