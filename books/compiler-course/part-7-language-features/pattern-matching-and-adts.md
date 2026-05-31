---
sidebar_position: 2
title: "Algebraic Data Types and Pattern Matching"
---

# Algebraic Data Types and Pattern Matching

> Sum types and `match` are the backbone of modern language design — and
> compiling them well is a small art. The compiler must represent a
> **tagged union** efficiently and turn a pattern match into a **decision
> tree** that tests each value as few times as possible, while checking
> that you've handled every case. This chapter builds that machinery.

[Chapter 23](/compiler/part-7-language-features/closures) handled functions
as data; this chapter handles *data as alternatives*. **Algebraic data
types** (ADTs) — sum types, tagged unions, "an X is one of these variants"
— and the **pattern matching** that takes them apart are central to ML,
Haskell, Rust, Swift, and Scala. Compiling them touches representation,
code generation, and static checking all at once.

## 1. Algebraic data types

An **algebraic data type** combines two constructions:

- **Product types** (records/structs): "an X has an A *and* a B."
- **Sum types** (tagged unions): "an X is an A *or* a B" — exactly one
  variant, each possibly carrying data.

```
type Shape =
  | Circle(radius: f64)
  | Rect(w: f64, h: f64)
  | Point
```

A `Shape` value is *one* of three variants, each with its own payload.
This "sum of products" is what "algebraic" means. Sum types are the
powerful, less-common half (most languages have structs; fewer have real
sum types) and the reason ADT languages can make illegal states
unrepresentable.

## 2. Representing a tagged union

At runtime, an ADT value needs to record *which variant* it is plus *that
variant's data*. The standard representation is a **tag** (a small integer
discriminant) followed by the payload:

```
┌─────┬──────────────────────────┐
│ tag │ payload (variant's data) │
└─────┴──────────────────────────┘
  Circle → tag 0, payload {radius}
  Rect   → tag 1, payload {w, h}
  Point  → tag 2, no payload
```

The payload area is sized for the *largest* variant (so any variant fits),
or the value is **boxed** (a pointer to a heap object) when variants vary
wildly in size. Refinements abound: **niche optimization** packs the tag
into unused bit-patterns of the payload (e.g. Rust's `Option<&T>` uses the
null pointer as the `None` tag — zero space overhead); **C-style enums**
with no payload are just the integer tag. But the mental model is always
**tag + payload**.

## 3. Pattern matching: the eliminator

If constructors *build* an ADT value, **pattern matching** *takes it
apart* — it's the eliminator. A `match` inspects the tag, binds the
payload, and branches:

```
match shape {
    Circle(r)   => 3.14159 * r * r,
    Rect(w, h)  => w * h,
    Point       => 0.0,
}
```

Naively, this compiles to "check the tag; if Circle, bind `r`, run arm 1;
else if Rect, bind `w`, `h`, run arm 2; ...". For a single level that's
fine — just a `switch` on the tag
([Chapter 16](/compiler/part-5-back-end/instruction-selection)). The
interesting compilation problem appears with **nested** and **multiple**
patterns, where naive sequential testing is wasteful.

## 4. The compilation problem: nested patterns

Real patterns nest and multiply, and a naive translation re-tests the same
value many times:

```
match (xs, ys) {
    ([], _)          => 1,
    (_, [])          => 2,
    (x::xs', y::ys') => 3,
}
```

Compiled naively (try each row top to bottom, testing every sub-pattern),
this inspects `xs` and `ys` repeatedly across rows. The goal of
**match compilation** is to produce a **decision tree** that examines each
sub-value *at most once* on any path, branching efficiently — turning a
2-D table of patterns into an optimal sequence of tag tests.

## 5. The decision-tree algorithm

The classic approach treats the match as a **matrix** — rows are the
patterns of each arm, columns are the sub-values being matched — and builds
a decision tree by repeatedly:

1. **Pick a column** to test (a sub-value whose tag to inspect).
2. **Switch** on that column's possible constructors.
3. For each constructor, **specialize** the matrix (keep only rows whose
   pattern in that column matches the constructor, expand its sub-patterns
   into new columns).
4. **Recurse** on each specialized sub-matrix until rows are exhausted or a
   row fully matches (a leaf → run that arm).

```
test column "xs":
  ├─ []      → (rows with []  in col 0) → ...
  └─ x::xs'  → (rows with ::  in col 0) → test column "ys": ...
```

The result is a decision tree where each internal node is one tag test and
each leaf is an arm. **Column-selection heuristics** (which column to test
first) determine the tree's quality — a good heuristic minimizes total
tests and code size. This is the heart of every fast pattern-match
compiler.

> :nerdygoose: Match compilation is secretly the same problem as building
> a good **decision tree** in machine learning, or a good **B-tree** query
> plan in a database: you have a set of conditions to test and you want to
> order the tests to reach an answer with minimum work, sharing tests
> across cases. The column-selection heuristics ("test the column that
> discriminates the most rows," "prefer columns with no wildcards") are
> direct cousins of information-gain heuristics. A `match` expression looks
> like control flow, but compiling it well is an *optimization* problem —
> find the cheapest tree of tests that distinguishes all the arms.

## 6. Exhaustiveness and redundancy checking

A signature feature of ADT languages: the compiler **checks that you
handled every case**. While building the decision tree, it can detect:

- **Non-exhaustiveness**: some constructor (or combination) reaches no
  arm — there's an input the match doesn't handle. The compiler errors:
  *"non-exhaustive patterns: `Point` not covered."* (This is the safety
  property: add a variant later and every match missing it fails to
  compile.)
- **Redundancy**: some arm can never be reached because earlier arms
  already cover all its inputs — a dead arm, usually a bug. The compiler
  warns: *"unreachable pattern."*

Both fall out of the matrix algorithm: exhaustiveness = "does every
constructor path reach a leaf?"; redundancy = "does this row ever get
selected?". This static checking — impossible without real sum types — is
a big part of why ADT languages feel so safe. It's the same "make the
compiler find the cases you forgot" guarantee that good type systems
provide ([Chapter 8](/compiler/part-3-types-and-ir/type-checking)).

## 7. Guards, bindings, and or-patterns

Real `match` has features that complicate the tree:

- **Bindings**: `Circle(r)` binds `r` to the payload — the decision tree's
  leaves emit the binding (a load from the payload slot) before the arm.
- **Guards**: `Circle(r) if r > 0` adds a runtime boolean test *after* the
  structural match; if the guard fails, matching must **fall through** to
  later arms (which complicates the tree — a guarded row can't be fully
  eliminated).
- **Or-patterns**: `Circle(r) | Sphere(r)` matches several constructors to
  one arm (multiple tree edges to one leaf).
- **Wildcards** (`_`) match anything (a column with `_` doesn't constrain
  that row).

Each is handled by extending the matrix algorithm. Guards are the
trickiest, because they break the "test each value once" guarantee — a
failed guard means revisiting alternatives — so compilers handle them
with care (and exhaustiveness checking conservatively assumes a guard
might fail).

## 8. ADTs through the pipeline

Pattern matching and ADTs touch the stages like this:

- **Front end** ([Part II](/compiler/part-2-front-end/ast-and-semantic-analysis)):
  parse the type and patterns; resolve constructors.
- **Type checking** ([Chapter 8](/compiler/part-3-types-and-ir/type-checking)):
  check patterns against the matched type; **exhaustiveness/redundancy**
  checking lives here or just after.
- **Lowering** ([Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir)):
  match compilation — turn `match` into a **decision tree** of tag tests
  and branches in the IR.
- **Back end** ([Chapter 16](/compiler/part-5-back-end/instruction-selection)):
  the tag tests become `switch`/branch instructions; payload accesses
  become loads.

ADTs + pattern matching are the data-modeling counterpart to closures'
behavior-modeling — together they're most of what makes a "modern"
language modern, and both are compiler features as much as language
features. The compiler does real work to make `match` both *safe*
(exhaustiveness) and *fast* (decision trees).

> :weightliftinggoose: Two halves to hold: **representation** — an ADT
> value is a **tag + payload** (with niche tricks to shrink it) — and
> **compilation** — a `match` becomes a **decision tree** that tests each
> sub-value at most once, built from the pattern **matrix** by
> column-selection. The same matrix algorithm gives you **exhaustiveness**
> and **redundancy** checking for free, the safety win of ADT languages.
> Mind the complications: bindings (loads at leaves), **guards** (can fall
> through), and or-patterns. `match` is control flow that's secretly an
> optimization problem.

## What we covered

- **Algebraic data types** = **sum of products**: a value is *one of*
  several variants (sum), each carrying data (product) — making illegal
  states unrepresentable.
- Runtime representation is a **tag + payload** (sized to the largest
  variant or **boxed**), with **niche optimizations** to shrink the tag.
- **Pattern matching** is the eliminator: inspect the tag, bind the
  payload, branch.
- Naive nested matching re-tests values; **match compilation** builds a
  **decision tree** testing each sub-value at most once, via a pattern
  **matrix** and **column-selection** heuristics.
- The matrix algorithm yields **exhaustiveness** (every case handled) and
  **redundancy** (unreachable arm) checking — the ADT safety guarantee.
- **Guards** (can fall through), **bindings**, **or-patterns**, and
  **wildcards** extend the algorithm.
- ADTs/matching touch parsing, type checking (+ exhaustiveness), lowering
  (decision tree), and the back end (`switch` + loads).

## What's next

[Chapter 25](/compiler/part-7-language-features/exceptions-and-continuations)
— exceptions and continuations. Non-local control flow: how `throw`/`catch`
is implemented (stack unwinding, zero-cost exceptions, cleanup), and how
**continuations** and CPS provide a general framework that also underlies
generators and async.
