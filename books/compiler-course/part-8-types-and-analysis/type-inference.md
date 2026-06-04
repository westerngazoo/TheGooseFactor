---
sidebar_position: 1
title: "Type Inference"
---

# Type Inference

> How a compiler figures out the types you didn't write. **Type
> inference** deduces a type for every expression from how it's used — no
> annotations required — by generating **constraints** and solving them
> with **unification**. The classic algorithm, **Hindley-Milner**, infers
> *principal* (most general) types and underlies ML, Haskell, Rust, and
> Swift's local inference.

Welcome to Part VIII. Part VII compiled hard *features*; this part goes
deep on the static-analysis *frontier* — the type-system and program-
analysis machinery behind modern languages. We begin where the
type-checker of [Chapter 8](/compiler/part-3-types-and-ir/type-checking)
left off: that chapter *checked* types you wrote. This one *infers* the
types you didn't.

## 1. The goal: types without annotations

In many modern languages you write almost no type annotations, yet the
program is fully statically typed:

```
let id = fn(x) { return x; };       // what's the type of id?
let n  = id(5);                      // used with an int here...
let s  = id("hi");                   // ...and a string here
```

The compiler must *deduce* that `id` has type `forall a. a -> a` (for any
type `a`, takes an `a` and returns an `a`), that `n` is an `int`, that `s`
is a `string` — all without you saying so. **Type inference** is the
algorithm that does this: it reads the *structure of how values are used*
and works backward to the only types that make the program consistent.
Done well, it gives you the safety of static typing with the brevity of a
dynamic language.

## 2. Type variables and the idea of constraints

Inference starts by giving every expression an **unknown type** — a fresh
**type variable** (`t0`, `t1`, ...) — then *collecting constraints* from
how expressions are used:

```
let f = fn(x) { return x + 1; };
// x : t0 (unknown)
// x + 1 uses x with +, and 1 : int, and + : (int, int) -> int
//   ⇒ constraint: t0 = int
// f returns x + 1 : int
//   ⇒ f : int -> int
```

Every use of a value *constrains* its type. Calling `x + 1` forces `x` to
be `int`; returning the result types the function. Inference is, at heart,
**generate equations between types from usage, then solve them**. The
solving step has a name and an algorithm: **unification**.

## 3. Unification

**Unification** is the engine: given two types (possibly containing
variables), find a **substitution** of variables-to-types that makes them
**equal**, or fail if none exists.

```
unify( t0 -> t0 ,  int -> t1 )
   ⇒ t0 = int   (from the argument positions)
   ⇒ t1 = t0 = int   (from the result positions)
   ⇒ substitution { t0 := int, t1 := int }
```

Unification recurses structurally: to unify `a -> b` with `c -> d`, unify
`a` with `c` and `b` with `d`; to unify a variable `t` with a type `T`,
record `t := T`; to unify two incompatible constructors (`int` with
`string -> string`) — **fail** (a type error). It's the same unification
used in logic programming (Prolog), repurposed to solve type equations.
Unification is where type *errors* are detected: a clash means the
program's usages are contradictory.

> :nerdygoose: The deep elegance of Hindley-Milner is that **type checking
> becomes equation solving**. You don't write a bespoke rule for every
> construct; you mechanically (1) assign each expression a type variable,
> (2) emit equality constraints from the typing rules of each construct,
> and (3) solve them all by unification. The "type" of the program is just
> the *solution to a system of equations*, and a type error is just an
> *inconsistent system*. It's the same move as the rest of compilers:
> turn an ad-hoc problem into a general, solvable one. Robin Milner's
> insight — that this finds the *most general* type automatically — is one
> of the prettiest results in programming-language theory.

## 4. The occurs check

Unification has one subtle guard. When binding a variable `t := T`, you
must check that `t` does **not occur inside** `T` — the **occurs check**.
Without it, you'd create an infinite type:

```
unify( t ,  t -> int )    // t = (t -> int) = ((t -> int) -> int) = ...
```

Binding `t := t -> int` would loop forever (an infinitely nested type).
The occurs check catches this and reports an error — which is exactly what
happens when you write something genuinely ill-typed like applying a
function to itself (`fn(x){ x(x) }`). The occurs-check failure is the
compiler saying "no finite type makes this work." It's a small rule with a
deep meaning: it's the boundary where the simply-typed world stays
consistent.

## 5. Algorithm W

The classic formulation that ties it together is **Algorithm W** (Damas-
Milner). It walks the syntax tree and, for each node, produces *(a type,
a substitution)*:

- **Variable**: look up its type in the environment (instantiating, §6).
- **Application** `f e`: infer `f`'s type and `e`'s type, then **unify**
  `f`'s type with `(type of e) -> t_fresh`; the result is `t_fresh`.
- **Lambda** `fn(x) e`: give `x` a fresh variable, infer `e`'s type in the
  extended environment; the result is `(x's type) -> (e's type)`.
- **Let** `let x = e1 in e2`: infer `e1`, **generalize** it (§6), bind `x`,
  infer `e2`.

Threading the substitution through and unifying at each application, the
algorithm computes a type for the whole program — or fails with a type
error. Algorithm W is compact (a page of code) and complete for the
Hindley-Milner system; it's the reference implementation every inference
engine descends from.

## 6. Let-polymorphism: generalization and instantiation

The feature that makes HM *useful* is **let-polymorphism** — the ability to
use `id` at *many* types in one program. It comes from two operations:

- **Generalization** (at a `let`): after inferring `id : t0 -> t0`, notice
  `t0` is unconstrained, and **generalize** it to `forall a. a -> a` — a
  *type scheme*, polymorphic in `a`.
- **Instantiation** (at each use): each time `id` is used, **instantiate**
  the scheme with *fresh* variables, so `id(5)` instantiates `a := int` and
  `id("hi")` independently instantiates `a := string`.

```
let id = fn(x){ x };        // generalize: id : forall a. a -> a
id(5);                      // instantiate a := int   ⇒ int -> int
id("hi");                   // instantiate a := string ⇒ string -> string
```

Generalize at definitions, instantiate at uses — that's how one definition
serves many types. (The rule that you generalize only at `let`, and only
variables not constrained elsewhere, is what keeps HM **decidable** —
generalizing too eagerly, e.g. for function parameters, breaks inference,
the "let should not be generalized for lambda-bound variables" subtlety.)

## 7. Principal types

The reason HM is celebrated: it infers the **principal type** — the *most
general* type — automatically, with no annotations. `id`'s principal type
is `forall a. a -> a`; every valid use is an instance of it. Principality
means inference doesn't just find *a* type, it finds *the best* one, and
it's *complete* (if the program is typeable, HM finds the type) and
*decidable* (it always terminates with an answer).

This is a rare and beautiful sweet spot in type-system design — full
inference, most-general types, decidable, no annotations — and it's why HM
defined a whole family of languages. The catch is that the sweet spot is
*narrow*: adding common features breaks one of those guarantees (§8).

## 8. The limits of inference

HM's guarantees are fragile. Several widely-wanted features make full
inference **undecidable** or lose principal types, which is why real
languages compromise:

- **Subtyping** (objects, `int <: float`): inference with subtyping is much
  harder; constraints become inequalities, not equations. Most OO
  languages with subtyping require more annotations.
- **Higher-rank polymorphism** (`forall` inside argument types): full
  inference is undecidable; languages require annotations for rank-2+ types.
- **Overloading / type classes**: ad-hoc polymorphism
  ([Chapter 28](/compiler/part-8-types-and-analysis/generics-and-polymorphism))
  needs constraint solving beyond pure unification (Haskell's class
  constraints).
- **Dependent types**: types that depend on values — inference is
  generally undecidable; heavy annotation/proof required.

So real languages do **local inference** (infer within a function,
annotate at boundaries — Rust, Swift, modern C++ `auto`) rather than
whole-program HM: a pragmatic blend that keeps the ergonomics where they're
cheap and asks for annotations where inference can't cope. Knowing *why*
your language wants a type annotation in a particular spot — usually
because it left HM's decidable island — is real compiler literacy.

> :weightliftinggoose: Type inference = **assign type variables, generate
> constraints from usage, solve by unification**. Hold the pieces:
> **unification** (make two types equal via a substitution; clash = type
> error) with the **occurs check** (no infinite types); **Algorithm W**
> walking the tree; and **let-polymorphism** (**generalize** at
> definitions to `forall`, **instantiate** with fresh variables at uses)
> giving **principal** (most-general) types. Then know the **boundary**:
> subtyping, higher-rank, overloading, and dependent types break full
> inference, which is why real languages do *local* inference with
> annotations at the edges. The annotation your compiler demands marks
> where you left the decidable island.

## What we covered

- **Type inference** deduces types from *usage* with no annotations,
  picking up where explicit type *checking*
  ([Chapter 8](/compiler/part-3-types-and-ir/type-checking)) leaves off.
- Give each expression a **type variable**, then **generate constraints**
  (equations between types) from how it's used.
- **Unification** solves the constraints — find a **substitution** making
  types equal, or fail (a type error); the **occurs check** forbids
  infinite types.
- **Algorithm W** (Hindley-Milner) walks the tree producing (type,
  substitution), unifying at applications — compact and complete for HM.
- **Let-polymorphism**: **generalize** unconstrained variables to `forall`
  at definitions, **instantiate** with fresh variables at each use — one
  definition, many types.
- HM infers **principal** (most-general) types, and is **complete** and
  **decidable** — a rare sweet spot.
- **Subtyping, higher-rank, overloading, dependent types** break full
  inference, so real languages use **local inference** + annotations.

## What's next

[Chapter 28](/compiler/part-8-types-and-analysis/generics-and-polymorphism)
— generics and polymorphism. Once the types are known (or inferred), how
does the compiler *implement* polymorphic code? The two great strategies —
**monomorphization** (specialize per type) vs **boxing/dictionary passing**
(one shared version) — and their deep trade-offs.
