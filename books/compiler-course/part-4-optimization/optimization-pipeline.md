---
sidebar_position: 1
title: "The Optimization Pipeline"
---

# The Optimization Pipeline

> Why and how compilers make code faster. Optimization is a sequence
> of meaning-preserving IR transformations, each a "pass" — and the
> art is in which passes, in what order, with what trade-offs.

The IR is built and in CFG+SSA form
([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)). Now the
**optimizer** transforms it to be faster and smaller — *without
changing what the program does*. This chapter frames optimization: the
goals, the pass structure, and the trade-offs, before the specific
techniques in [Chapters 13–15](/compiler/part-4-optimization/local-and-peephole).

## 1. The one rule: preserve meaning

Optimization's iron law: **a transformation must not change the
program's observable behavior**. Faster, smaller, fewer instructions —
yes. Different output — never. An optimization that makes code 10×
faster but occasionally wrong is worse than useless; it's dangerous.

This is why optimizations rest on **analysis**: before transforming,
the compiler must *prove* the transformation is safe. "I can delete
this code" requires proving it's dead (unused). "I can move this out of
the loop" requires proving it's loop-invariant. Analysis
([Chapter 14](/compiler/part-4-optimization/data-flow-analysis))
establishes the facts; transformation uses them. Optimization is
applied theorem-proving.

## 2. What we optimize for

"Better" isn't one-dimensional. Compilers optimize for:

- **Speed**: fewer/cheaper instructions, better memory access, fewer
  branches. The usual default (`-O2`).
- **Size**: smaller code (`-Os`) — matters for embedded, cache,
  download size.
- **Sometimes they conflict**: inlining and loop unrolling speed code
  up but grow it; the compiler balances per the optimization level.

Optimization **levels** (`-O0`, `-O1`, `-O2`, `-O3`, `-Os`) are presets
choosing which passes run and how aggressively. `-O0` (none) compiles
fast and debugs easily; `-O2` is the production default; `-O3` adds
aggressive (sometimes size-growing) passes. The level selects the
pass pipeline.

## 3. Passes

An optimization is implemented as a **pass**: a function that takes IR
and returns transformed IR (or mutates it). The optimizer runs a
**pipeline** of passes in sequence:

```
IR → [pass1] → IR → [pass2] → IR → ... → [passN] → optimized IR
```

Two kinds:

- **Analysis passes** compute information (which values are constant,
  which code is dead, what dominates what) without changing the IR.
- **Transformation passes** rewrite the IR, using analysis results to
  stay correct.

Passes are modular — each does one thing — which makes them testable
and composable. LLVM has hundreds of passes; you assemble pipelines
from them. Modularity is why a compiler can offer different `-O`
levels: just different pass selections.

> :nerdygoose: The "pass" architecture is why LLVM is a *platform*, not
> just a compiler. Each optimization is an independent pass over the
> IR; you can add, remove, reorder, or write new passes without
> touching the rest. Researchers prototype a new optimization as one
> pass and drop it into the pipeline. The IR-plus-passes design
> ([Chapter 9](/compiler/part-3-types-and-ir/intermediate-representation))
> is the single most important architectural idea in modern compilers.

## 4. Pass ordering and the phase-ordering problem

Passes interact. One pass often *enables* another: constant folding
might create dead code that DCE then removes; inlining exposes
optimizations inside the inlined function. So **order matters** — a lot.

But there's no perfect order. Pass A might enable B, and B might
re-enable A. This is the **phase-ordering problem**: finding the best
sequence (and repetitions) of passes is, in general, intractable.
Compilers use carefully-tuned, partly-heuristic pipelines, often
**running some passes multiple times** (e.g., a cleanup pass after each
major transformation) and iterating cleanup passes until no more
changes ("fixpoint").

There's no closed-form answer; the standard `-O2` pipeline is the
result of decades of empirical tuning. Knowing the phase-ordering
problem exists explains why compiler pipelines look like long,
repetitive, hand-tuned lists.

## 5. Local, global, and interprocedural scope

Optimizations differ by *how much program* they consider:

- **Local** (peephole, [Chapter 13](/compiler/part-4-optimization/local-and-peephole)):
  within a single basic block — small window, cheap, no control-flow
  analysis needed.
- **Global** (intraprocedural): across the whole CFG of *one function*
  — needs data-flow analysis ([Chapter 14](/compiler/part-4-optimization/data-flow-analysis));
  most classic optimizations live here.
- **Interprocedural** (IPO): across function boundaries — inlining,
  whole-program analysis. Most powerful, most expensive; enabled at
  higher `-O` and with **link-time optimization** (LTO).

Wider scope = more opportunity but more cost. The compiler escalates
scope with the optimization level.

## 6. The headline optimizations

A preview of what the passes actually do (detailed in
[Chapters 13–15](/compiler/part-4-optimization/local-and-peephole)):

- **Constant folding/propagation**: compute constant expressions at
  compile time; propagate known values.
- **Dead-code elimination (DCE)**: remove code whose results are never
  used.
- **Common-subexpression elimination (CSE)**: compute a repeated
  expression once.
- **Copy propagation**: replace copies (`y = x`) with the original.
- **Loop-invariant code motion (LICM)**: hoist computations that don't
  change across loop iterations out of the loop.
- **Strength reduction**: replace expensive ops with cheaper ones
  (`x * 2` → `x + x` or `x << 1`).
- **Inlining**: replace a function call with the function's body.
- **Loop unrolling**: replicate a loop body to reduce loop overhead.

Each is a pass; together (in the right order, repeated) they transform
naive IR into fast code.

## 7. The cost-benefit of optimization

Optimization isn't free for the *compiler*:

- **Compile time**: aggressive optimization (`-O3`, LTO) can multiply
  build times. There's a trade between build speed and run speed.
- **Debuggability**: optimized code is harder to debug — variables
  optimized away, code reordered, inlined. Hence `-O0 -g` for
  debugging, `-O2` for release.
- **Diminishing returns**: the first few optimizations (DCE, constant
  folding, register allocation) give huge wins; later ones give
  smaller, situational gains.

For the *program*, though, optimization pays every time it runs — a
compile-time cost paid once for a runtime benefit reaped forever. That
asymmetry (optimize once, benefit always) is why compilers invest so
heavily in it.

## 8. Our plan for Part IV

We'll build up the optimizer:

- **[Ch 13](/compiler/part-4-optimization/local-and-peephole)**: local
  and peephole optimizations — the simplest, within-block wins
  (constant folding, strength reduction, peephole patterns).
- **[Ch 14](/compiler/part-4-optimization/data-flow-analysis)**:
  data-flow analysis — the framework for *global* optimizations
  (liveness, reaching definitions, available expressions).
- **[Ch 15](/compiler/part-4-optimization/ssa-optimizations)**: SSA-
  based optimizations — how SSA form
  ([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)) makes the
  powerful global optimizations clean (sparse conditional constant
  propagation, GVN, DCE).

By the end you'll understand how a compiler proves transformations safe
and applies them to make code fast.

> :weightliftinggoose: Optimization = meaning-preserving IR
> transformation, proven safe by analysis, applied as a pipeline of
> modular passes. The iron rule: never change behavior. The art:
> which passes, what order (the phase-ordering problem), what scope
> (local/global/interprocedural). Compile-time cost, runtime benefit —
> paid once, reaped forever. Frame optimization this way and the
> specific techniques in the next chapters slot into a clear structure.

## What we covered

- The iron rule: optimization **must preserve observable behavior** —
  it rests on **analysis** that proves transformations safe.
- We optimize for **speed** and/or **size** (sometimes conflicting),
  selected by **optimization levels** (`-O0`..`-O3`, `-Os`).
- Optimizations are **passes** (analysis or transformation) run as a
  **pipeline**; modularity makes the compiler a platform (LLVM).
- **Phase ordering**: pass order matters, passes enable each other,
  the best order is intractable — pipelines are hand-tuned and
  repeated to fixpoint.
- **Scope**: local (peephole), global (intraprocedural, needs
  data-flow), interprocedural (inlining, LTO).
- Headline optimizations: constant folding/propagation, DCE, CSE, copy
  propagation, LICM, strength reduction, inlining, unrolling.
- **Cost-benefit**: compile-time cost and reduced debuggability, but
  runtime benefit paid once and reaped forever.

## What's next

[Chapter 13](/compiler/part-4-optimization/local-and-peephole) — local
and peephole optimizations. The simplest, most reliable wins: constant
folding, strength reduction, and peephole pattern-matching within basic
blocks.
