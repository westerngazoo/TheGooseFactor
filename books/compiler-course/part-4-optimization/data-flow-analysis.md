---
sidebar_position: 3
title: "Data-Flow Analysis"
---

# Data-Flow Analysis

> The framework for global optimization. Data-flow analysis computes
> facts about a program across its whole control-flow graph — liveness,
> reaching definitions, available expressions — by iterating to a
> fixpoint.

Local optimizations ([Chapter 13](/compiler/part-4-optimization/local-and-peephole))
worked within one block. **Global** optimizations work across the whole
CFG of a function — and they need to know facts that depend on *all
paths* through the program. **Data-flow analysis** is the unifying
framework that computes those facts. This chapter is the engine room of
the optimizer.

## 1. The question data-flow analysis answers

Global optimizations need program-wide facts:

- "Is variable `x` **live** here (will its value be used later)?" — for
  register allocation and DCE.
- "Which **definitions** of `x` **reach** this use?" — for constant
  propagation (without SSA).
- "Is expression `a + b` already **available** (computed earlier and
  still valid)?" — for common-subexpression elimination.

Each is a property that depends on the paths through the CFG. Data-flow
analysis computes such properties systematically, for every program
point, by propagating facts along the CFG edges.

## 2. The general shape

Every data-flow analysis has the same structure:

1. **A fact** at each program point (a set: of live variables, of
   reaching definitions, of available expressions).
2. **Transfer functions**: how each instruction transforms the fact
   (an assignment to `x` kills facts about `x` and generates new ones).
3. **A direction**: **forward** (facts flow from entry toward exit,
   following control flow) or **backward** (facts flow from exit toward
   entry).
4. **A merge/join**: how to combine facts from multiple incoming edges
   (union or intersection).
5. **Iteration to a fixpoint**: repeatedly apply transfer functions and
   merges until the facts stop changing.

This common framework means once you understand one analysis, you
understand them all — they differ only in the fact, direction, transfer
functions, and merge.

> :nerdygoose: Data-flow analysis is built on **lattice theory**. The
> facts form a lattice (a partial order with meets/joins), the transfer
> functions are monotone, and the analysis computes the **least
> fixpoint** by iteration. Because the lattice has finite height and
> the functions are monotone, iteration is *guaranteed to terminate*.
> This isn't just elegant math — it's the *proof* that your analysis
> halts and gives a sound answer. The theory turns "iterate until
> nothing changes" from a hopeful loop into a guaranteed-correct
> algorithm.

## 3. Liveness analysis (backward)

A variable is **live** at a point if its current value will be **used**
before being overwritten. Liveness is computed **backward** (a variable
is live if a *future* use exists):

- **Transfer**: at instruction `x = y + z`, `x` becomes dead (it's
  redefined) above this point, while `y` and `z` become live (they're
  used here).
- **Merge**: a variable is live coming into a block if it's live at the
  start of *any* successor (union).
- **Direction**: backward — process from uses toward definitions.

```
live-out[B] = union of live-in[S] for all successors S of B
live-in[B]  = (live-out[B] − defined[B]) ∪ used[B]
```

Iterate over all blocks until `live-in`/`live-out` stop changing.
Liveness drives **register allocation** ([Chapter 17](/compiler/part-5-back-end/register-allocation))
— two variables can share a register if they're never live at the same
time — and **dead-code elimination** (a definition of a variable that's
not live afterward is dead).

## 4. Reaching definitions (forward)

A definition of `x` **reaches** a point if there's a path from the
definition to that point with no intervening redefinition of `x`.
Computed **forward**:

- **Transfer**: `x = ...` generates a new reaching definition of `x`
  and kills all prior definitions of `x`.
- **Merge**: definitions reaching a block's entry = union of those
  reaching the ends of its predecessors.
- **Direction**: forward.

Reaching definitions answers "which assignments could be the source of
this value?" — needed for constant propagation and building **use-def
chains** in a non-SSA IR. (In SSA, this is *free* — each use has exactly
one reaching definition by construction,
[Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa). SSA
pre-computes reaching definitions structurally, which is a big reason
it's preferred.)

## 5. Available expressions (forward)

An expression `a + b` is **available** at a point if it has been
computed on *every* path to that point and neither `a` nor `b` has been
redefined since. Computed **forward** with **intersection** merge (it
must be available on *all* paths):

- **Transfer**: computing `a + b` makes it available; redefining `a` or
  `b` kills all expressions using them.
- **Merge**: an expression is available at a block's entry iff
  available at the end of *all* predecessors (intersection).

Available expressions drive **common-subexpression elimination** (CSE):
if `a + b` is already available, don't recompute it — reuse the prior
result.

> :surprisedgoose: Notice the merge direction flips with the analysis:
> liveness and reaching-definitions use **union** ("true on *some*
> path"), available-expressions uses **intersection** ("true on *all*
> paths"). This union-vs-intersection choice corresponds to "may" vs
> "must" analyses: *may* a variable be live (some path)? *must* an
> expression be available (all paths)? Getting the merge operator right
> is the crux — union is optimistic about reachability, intersection is
> conservative about guarantees. The same framework, two merge
> operators, two families of analyses.

## 6. The worklist algorithm

Naively, you re-process *all* blocks each iteration until nothing
changes — correct but slow. The **worklist algorithm** is the efficient
version: maintain a queue of blocks whose facts might have changed; when
a block's fact changes, add its neighbors (successors for forward,
predecessors for backward) to the worklist; process until the worklist
is empty.

```
worklist = all blocks
while worklist not empty:
    B = worklist.pop()
    new_fact = transfer(merge(predecessors/successors of B))
    if new_fact != old_fact[B]:
        old_fact[B] = new_fact
        add affected neighbors to worklist
```

This only reprocesses blocks that *could* have changed, converging much
faster. It's the standard implementation of data-flow analysis. Order
of processing (e.g., reverse postorder for forward analyses) affects how
fast it converges.

## 7. Using the analysis results

Analysis is half the story; **transformation** is the other
([Chapter 12](/compiler/part-4-optimization/optimization-pipeline)).
The results feed optimizations:

- **Liveness** → register allocation
  ([Chapter 17](/compiler/part-5-back-end/register-allocation)) and DCE.
- **Reaching definitions** → constant propagation, use-def chains.
- **Available expressions** → common-subexpression elimination.
- **Very busy expressions**, **constant propagation lattice**, etc. →
  more optimizations.

Each transformation: run the analysis to get the facts, then rewrite
the IR where the facts permit (delete this dead instruction, reuse this
available expression, propagate this constant). Analysis proves it's
safe ([Chapter 12](/compiler/part-4-optimization/optimization-pipeline)'s
iron rule); transformation does the work.

## 8. Data-flow analysis is the optimizer's brain

Data-flow analysis is the general machinery behind essentially all
global optimization. Its power is the **uniform framework**: define the
fact, transfer functions, direction, and merge, and the
iterate-to-fixpoint engine computes the answer correctly (guaranteed by
lattice theory, §2). Dozens of analyses — liveness, reaching defs,
available expressions, constant propagation, alias analysis — are
instances of one pattern.

SSA form ([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa))
changes the picture: many analyses that needed full data-flow iteration
on a non-SSA IR become trivial or "sparse" on SSA (you follow def-use
edges directly instead of iterating over all blocks). That's the
subject of [Chapter 15](/compiler/part-4-optimization/ssa-optimizations).
But the data-flow framework remains the foundation — and for analyses
SSA doesn't trivialize (like liveness for register allocation), it's
still the tool.

> :weightliftinggoose: Data-flow analysis is one framework with four
> knobs: the **fact** (a set), the **transfer functions** (per
> instruction), the **direction** (forward/backward), and the **merge**
> (union for "may", intersection for "must"). Set the knobs, iterate to
> a fixpoint (worklist algorithm), and you've computed liveness, or
> reaching definitions, or available expressions. Master this one
> pattern and you've understood the engine behind all global
> optimization. It's the optimizer's brain.

## What we covered

- **Global optimizations** need program-wide facts (liveness, reaching
  definitions, available expressions) that depend on all CFG paths.
- **Data-flow analysis** computes them with a uniform framework: a
  **fact** per point, **transfer functions**, a **direction**
  (forward/backward), a **merge** (union/intersection), iterated to a
  **fixpoint** (guaranteed to terminate by lattice theory).
- **Liveness** (backward, union): will a value be used later? → register
  allocation, DCE.
- **Reaching definitions** (forward, union): which assignments could be
  this value's source? → constant propagation (free in SSA).
- **Available expressions** (forward, intersection): already computed on
  all paths? → CSE.
- Merge is **union for "may"**, **intersection for "must"** analyses.
- The **worklist algorithm** efficiently reprocesses only possibly-
  changed blocks.
- Analysis proves safety; transformation uses the results. SSA
  trivializes many analyses ([Ch 15](/compiler/part-4-optimization/ssa-optimizations)).

## What's next

[Chapter 15](/compiler/part-4-optimization/ssa-optimizations) — SSA-based
optimizations. How SSA form makes the powerful global optimizations
clean and fast: sparse conditional constant propagation, global value
numbering, and SSA-based dead-code elimination.
