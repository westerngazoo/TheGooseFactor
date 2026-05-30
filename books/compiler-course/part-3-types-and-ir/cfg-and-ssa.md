---
sidebar_position: 4
title: "Control-Flow Graphs and SSA"
---

# Control-Flow Graphs and SSA

> Organizing the flat IR for analysis. We group instructions into
> basic blocks connected by edges (the CFG), then build full SSA form
> with φ-functions — the representation the optimizer thrives on.

The lowered IR ([Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir))
is a flat list of instructions with branches and labels. To *analyze*
and *optimize* it ([Part IV](/compiler/part-4-optimization/optimization-pipeline)),
we impose structure: the **control-flow graph** (CFG) and **SSA form**.
These two representations are what make modern optimization tractable.

## 1. Basic blocks

A **basic block** is a maximal straight-line sequence of instructions:
control enters at the top and exits at the bottom, with **no branches
in or out of the middle**. Once you enter a basic block, you execute
all its instructions in order, then leave.

A block ends at: a branch/jump, a return, or just before a label
(something else can jump *to* the label). Splitting the flat IR into
basic blocks:

```
factorial:                    ── Block B0
    t1 = n == 0
    branch t1, L_then, L_else
L_then:                       ── Block B1
    return 1
L_else:                       ── Block B2
    t2 = n - 1
    t3 = call factorial(t2)
    t4 = n * t3
    return t4
```

Three basic blocks. Within each, execution is straight-line. Basic
blocks are the **nodes** of the control-flow graph.

## 2. The control-flow graph

The **CFG** is a directed graph: **nodes** are basic blocks, **edges**
are possible control transfers (branches/jumps/fall-through). For the
factorial:

```
        B0 (test n==0)
       /            \
   B1 (return 1)   B2 (recurse, return n*...)
```

`B0` ends in `branch t1, L_then, L_else`, so it has edges to `B1` (then)
and `B2` (else). `B1` and `B2` end in `return`, so they have edges to
the function exit. The CFG makes control flow **explicit as a graph
structure**, recovering the shape that flattening to jumps
([Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir)) had
scattered.

The CFG is *the* data structure for control-flow analysis: loops are
cycles in the graph, reachability is graph connectivity, dominance
(below) is a graph property. Nearly every optimization
([Part IV](/compiler/part-4-optimization/data-flow-analysis)) operates
on the CFG.

> :nerdygoose: Building the CFG re-discovers structure we deliberately
> flattened. We lowered `if`/`while` to jumps (machine-like,
> [Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir)), then
> immediately rebuild a graph (analysis-friendly). Why not keep the
> tree? Because *arbitrary* jumps (gotos, breaks, early returns)
> produce control flow that isn't a clean tree — but it *is* always a
> graph. The CFG handles any control flow uniformly, where a structured
> tree can't. The CFG is the universal control-flow representation.

## 3. Loops and dominance

Two CFG concepts the optimizer needs:

**Loops** are cycles in the CFG — a back edge from a block to one that
can reach it. Identifying loops (and their headers, bodies, exits)
enables loop optimizations (hoisting invariant code out of loops,
unrolling). A `while` produces a back edge from the body to the
condition block.

**Dominance**: block A **dominates** block B if *every* path from the
entry to B passes through A. Dominance captures "what definitely
happened before this point." It's central to SSA construction (§5) and
many optimizations (you can safely move code to a dominating block).
The **dominator tree** (each block's immediate dominator) is computed
once and reused across passes.

These graph properties — loops, dominance — are why we want a graph,
not a list. They're computed by standard graph algorithms over the CFG.

## 4. Why SSA again

Recall SSA ([Chapter 9 §5](/compiler/part-3-types-and-ir/intermediate-representation)):
each variable assigned **exactly once**. Within a single basic block,
achieving SSA is easy — just version each assignment:

```
x = 1       →   x1 = 1
x = x + 1   →   x2 = x1 + 1
```

The hard part is *across* blocks: when control flow merges, a variable
might have different versions from different paths. Which version does
the merge point use?

## 5. φ-functions: handling merges

The answer is the **φ (phi) function** — a pseudo-instruction at a
merge point that "selects" the right version based on which predecessor
block control came from:

```
        // if cond { x = 1 } else { x = 2 }   then use x
B0: branch cond, B1, B2
B1: x1 = 1
    jump B3
B2: x2 = 2
    jump B3
B3: x3 = φ(x1 from B1, x2 from B2)   ← phi selects based on the path
    ... use x3 ...
```

`x3 = φ(x1, x2)` means "x3 is x1 if we arrived from B1, x2 if from B2."
The φ-function reconciles the multiple definitions reaching the merge
into a single new version, preserving the "one definition per variable"
invariant. φ-functions are placed at exactly the merge points where a
variable has multiple reaching definitions — and dominance frontiers
(§3) tell you precisely where that is.

> :surprisedgoose: φ-functions look like cheating — "a function that
> magically knows which path you came from." But they're not executed
> as real instructions; they're a *notational device* that makes the
> single-assignment property hold even across branches. At the very end
> (leaving SSA for codegen, [Part V](/compiler/part-5-back-end/instruction-selection)),
> φ-functions are eliminated by inserting copies in the predecessor
> blocks ("SSA destruction"). They exist purely to make optimization
> reasoning clean in the middle of the pipeline. Brilliant hack.

## 6. Building SSA

The standard SSA construction algorithm (Cytron et al., 1991):

1. **Build the CFG** and compute the **dominator tree** (§3).
2. **Compute dominance frontiers** — for each block, the blocks where
   its definitions might need φ-functions (merge points just beyond its
   dominance).
3. **Insert φ-functions** for each variable at the dominance frontiers
   of its definitions.
4. **Rename** variables — walk the dominator tree, giving each
   definition a fresh version and each use the version that reaches it.

The result: fully SSA IR where every value has exactly one definition,
φ-functions handle all merges, and any use's definition is instantly
known. This is the form LLVM, GCC's GIMPLE, and most modern optimizers
use. (You don't need to memorize the algorithm to use SSA — but knowing
it exists and is efficient demystifies how compilers get there.)

## 7. Why SSA makes optimization easy

SSA's payoff, concretely: because every variable has *one* definition,
many analyses become trivial:

- **Use-def chains** are free: a use's definition is just *the* (only)
  definition of that version — no search.
- **Constant propagation** ([Chapter 13](/compiler/part-4-optimization/local-and-peephole)):
  if `x1 = 5`, every use of `x1` is 5, period — no "is x still 5 here?"
  reasoning.
- **Dead-code elimination**: a definition with no uses is dead — just
  check if the version is used anywhere.
- **Value numbering, GVN, and more**: all simpler with one definition
  per value.

Without SSA, these need expensive **reaching-definitions** analysis
([Chapter 14](/compiler/part-4-optimization/data-flow-analysis)) to
answer "which definitions reach this use?" SSA *encodes the answer in
the IR itself*. That's why it's the dominant modern IR form — it does
the hard analysis work up front, once, structurally.

## 8. The optimizer's playground is ready

With the CFG (control structure as a graph) and SSA (one definition per
value), the IR is in optimal shape for analysis. We now have:

- **Basic blocks**: straight-line units.
- **The CFG**: control flow as a graph (loops, dominance).
- **SSA form**: every value defined once, φ-functions at merges.

This is the representation [Part IV](/compiler/part-4-optimization/optimization-pipeline)
optimizes. Every optimization — constant folding, dead-code
elimination, common-subexpression elimination, loop-invariant code
motion — operates on this CFG+SSA IR. Part III built the *substrate*;
Part IV does the *transformation*.

> :weightliftinggoose: The CFG + SSA combination is the modern
> compiler's analysis foundation. Group the flat IR into basic blocks
> (straight-line, single entry/exit), connect them into the
> control-flow graph (loops = cycles, dominance = "definitely happened
> before"), then build SSA (one definition per value, φ-functions at
> merges) so every use's definition is instantly known. This is the
> representation the optimizer wants — and building it is the bridge
> from "we have IR" to "we can optimize IR."

## What we covered

- A **basic block** is a maximal straight-line instruction sequence
  (single entry at top, single exit at bottom).
- The **control-flow graph** (CFG): basic blocks as nodes, control
  transfers as edges — control flow made explicit as a graph.
- **Loops** are cycles; **dominance** ("every path passes through")
  captures "definitely happened before"; both are key analysis
  properties.
- **SSA form**: each variable assigned exactly once; easy within a
  block, but merges need **φ-functions** that select the version by
  predecessor path.
- **SSA construction**: CFG → dominator tree → dominance frontiers →
  insert φ → rename (Cytron et al.).
- φ-functions are notational (eliminated via copies at codegen),
  making single-assignment hold across branches.
- SSA makes optimization easy: use-def chains free, constant
  propagation/DCE/GVN trivial — it encodes reaching-definitions
  structurally.

## What's next

That closes Part III — the IR is built and in optimal (CFG+SSA) form.
[Part IV](/compiler/part-4-optimization/optimization-pipeline) puts it
to work: the optimization pipeline, local and peephole optimizations,
data-flow analysis, and the SSA-based optimizations that make compiled
code fast.
