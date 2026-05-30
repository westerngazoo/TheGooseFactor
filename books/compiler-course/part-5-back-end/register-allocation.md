---
sidebar_position: 2
title: "Register Allocation"
---

# Register Allocation

> Mapping unlimited values onto limited registers. The program has
> arbitrarily many temporaries; the CPU has ~16 registers. Register
> allocation decides who gets a register and who spills to memory —
> via the elegant graph-coloring algorithm.

Instruction selection ([Chapter 16](/compiler/part-5-back-end/instruction-selection))
produced code using **virtual registers** — unlimited temporaries.
But the target has a fixed, small set of **physical registers** (x86-64
has 16 general-purpose; many are special). **Register allocation** maps
virtual to physical, keeping the hottest values in registers and
**spilling** the rest to memory. This is one of the back end's most
important algorithms.

## 1. Why it matters

Registers are *fast* — accessing a register is essentially free, while
accessing memory (even cache) is much slower. The difference between
good and bad register allocation can be 2–10× in performance. The goal:
keep as many live values in registers as possible, minimizing memory
traffic (loads/stores).

But there are far more values than registers. The program has hundreds
of temporaries; the CPU has ~16 registers. Register allocation is the
art of fitting the program's values into that scarce resource.

## 2. The key insight: interference

The enabling observation: **two values can share a register if they're
never "live" at the same time.** If `a` is done being used before `b`
is created, they can occupy the same register — no conflict.

Two values **interfere** if they're both **live** at the same point —
then they need *different* registers (one would clobber the other).
Liveness analysis ([Chapter 14](/compiler/part-4-optimization/data-flow-analysis))
tells us exactly when each value is live, so we can compute which values
interfere.

```
a = ...        a live
b = ...        a, b live    ← a and b interfere (both live)
use a          a live, b live
c = ...        b, c live    ← b, c interfere; a is dead now, so
use b                          c can reuse a's register!
use c
```

Interference is the constraint; register allocation respects it.

## 3. The interference graph

Build a graph: **nodes** are values (virtual registers), **edges**
connect values that **interfere** (are simultaneously live). Two
connected nodes must get *different* physical registers.

```
a — b        (a interferes with b)
b — c        (b interferes with c)
             (a and c do NOT interfere → can share a register)
```

Now register allocation becomes a famous graph problem: **assign a
color (physical register) to each node such that no two adjacent nodes
share a color**, using at most K colors (K = number of physical
registers). This is **graph coloring**.

> :surprisedgoose: Register allocation is *literally* graph coloring —
> the same problem as coloring a map so no adjacent countries share a
> color. This connection (Chaitin, 1981) is one of the most celebrated
> "applied theory" results in compilers: a gnarly practical problem
> (fit values into registers) turns out to be a clean classic problem
> (color a graph with K colors). And graph coloring is NP-complete in
> general — so register allocation is too, which is why we use
> heuristics, not exact solutions.

## 4. Graph coloring by simplification

Since optimal K-coloring is NP-complete, we use **Chaitin's heuristic**
(simplify-then-color):

1. **Simplify**: repeatedly remove any node with **fewer than K
   neighbors** (degree < K). Such a node is "trivially colorable" —
   whatever its neighbors get, there's a free color left for it. Push
   it on a stack.
2. **Spill (if stuck)**: if every remaining node has degree ≥ K, pick
   one to potentially **spill** to memory (remove it optimistically and
   continue, marking it).
3. **Select**: pop nodes off the stack one by one, assigning each a
   color different from its already-colored neighbors. A trivially-
   colorable node always has a free color.

The trick in step 1: a node with < K neighbors *can always be colored*
(its neighbors use at most K−1 colors, leaving one free), so removing it
can't hurt. Iteratively removing such nodes shrinks the graph; popping
them back colors them. This heuristic colors most graphs well.

## 5. Spilling

When the graph can't be K-colored (more simultaneously-live values than
registers), some value must **spill** — live in memory instead of a
register, loaded just before each use and stored after each
definition:

```
// x is spilled to stack slot [x_slot]
load  r1, [x_slot]     ; before using x
... use r1 ...
... 
store [x_slot], r1     ; after defining x
```

Spilling is *correct* but *slow* (memory traffic), so the allocator
spills the **least costly** value — typically one that's used
infrequently or not inside a hot loop. Choosing *what* to spill (spill
heuristics: prefer values with low use-count, high degree, not in loops)
is where allocators differ in quality. After spilling, the graph is
re-built and re-colored (spilling reduces interference, so it often
succeeds the second time).

## 6. Register pressure

**Register pressure** is the number of values live at a point — how many
registers are "demanded" there. High pressure (more live values than
registers) forces spilling. Optimizations affect pressure:

- Aggressive optimizations (keeping more values in flight, unrolling
  loops) can *raise* pressure → more spilling → sometimes *slower*.
- The compiler balances: optimizations that reduce computation vs ones
  that raise register pressure.

This is a real tension — sometimes a "better" IR-level optimization
hurts because it increases register pressure past the spill threshold.
Good back ends are pressure-aware. It's a reason `-O3` occasionally
produces slower code than `-O2`.

## 7. Coalescing and other refinements

Real allocators add refinements:

- **Coalescing**: if `a = b` (a copy) and `a`, `b` don't interfere,
  merge them into one node (one register) — eliminating the copy.
  (Must avoid making the graph un-colorable — "conservative
  coalescing.") This removes the copies that SSA destruction
  ([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)) and lowering
  introduce.
- **Live-range splitting**: split a value's live range so part of it can
  be in a register and part spilled — finer-grained than all-or-nothing
  spilling.
- **Pre-colored nodes**: some values *must* be in specific registers
  (calling-convention argument registers, the return register) — these
  are pre-colored, constraining the coloring.

These make the difference between a textbook allocator and a production
one. The core, though, is graph coloring + spilling.

## 8. Linear-scan: the fast alternative

Graph coloring is high-quality but relatively slow (building and
coloring the interference graph). For JITs
([Chapter 21](/compiler/part-6-runtime/jit-compilation)) and fast
compiles, **linear-scan** register allocation is popular: it treats
live ranges as intervals on a line and allocates in one pass, assigning
registers greedily and spilling the interval that extends furthest when
it runs out. Much faster, slightly lower quality — a good trade when
compile time matters (JIT, `-O0`/`-O1`).

So the choice: **graph coloring** for quality (AOT, `-O2`+),
**linear-scan** for speed (JIT, debug builds). Both solve the same
problem — fit values into registers, spill the overflow — with
different time/quality trade-offs.

> :weightliftinggoose: Register allocation = fit the program's many
> values into the CPU's few registers. The elegant core: build an
> **interference graph** (values that are simultaneously live can't
> share a register), then **color** it with K colors (Chaitin's
> simplify-then-select heuristic), **spilling** to memory when you run
> out. It's literally graph coloring, NP-complete, solved by heuristics.
> Choose graph coloring for quality or linear-scan for speed. This is
> where "unlimited temporaries" meets "16 registers."

## What we covered

- **Register allocation** maps unlimited **virtual registers** to the
  target's few **physical registers**, spilling the rest to memory.
- Registers are far faster than memory; good allocation is a 2–10×
  performance factor.
- **Interference**: two values that are simultaneously **live** can't
  share a register; **liveness analysis** computes this.
- The **interference graph** (values = nodes, interference = edges)
  turns allocation into **graph coloring** with K = #registers colors
  (NP-complete).
- **Chaitin's heuristic**: simplify (remove degree-&lt;K nodes to a
  stack), spill if stuck, select (pop and color).
- **Spilling**: keep a value in memory (load/store around uses); spill
  the least costly (not in hot loops).
- **Register pressure** (live values at a point) drives spilling;
  optimizations can raise it.
- Refinements: **coalescing** (merge copies), live-range splitting,
  pre-colored nodes.
- **Linear-scan** is the fast (JIT/debug) alternative to graph coloring.

## What's next

[Chapter 18](/compiler/part-5-back-end/bytecode-and-vms) — bytecode and
virtual machines. The simpler back-end target: a stack-based VM where
codegen needs no register allocation. We design a bytecode and the VM
that interprets it.
