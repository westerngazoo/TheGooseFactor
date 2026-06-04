---
sidebar_position: 2
title: "Intermediate Representation"
---

# Intermediate Representation

> The compiler's lingua franca. The IR is a representation between
> source and target — simpler than the AST, more abstract than machine
> code — designed for analysis and optimization. The narrow waist of
> the pipeline.

The **intermediate representation** (IR) sits at the heart of the
compiler, between the front end (which produces it) and the back end
(which consumes it). This chapter explains why IRs exist, what they
look like, and the key forms (three-address code, SSA).

## 1. Why an IR at all?

We have a typed AST ([Chapter 8](/compiler/part-3-types-and-ir/type-checking)).
Why not generate machine code directly from it? Because:

- **The AST is tree-shaped; machines are linear.** Lowering the tree
  to a linear sequence is a real transformation worth isolating.
- **Optimization needs a clean substrate.** Analyzing and rewriting an
  AST (with its language-specific richness) or raw machine code (with
  its target-specific mess) is painful. A purpose-built IR is *designed*
  to be analyzed.
- **Decoupling** ([Chapter 1](/compiler/part-1-foundations/what-is-a-compiler)):
  the IR is the "narrow waist" — N front ends and M back ends share one
  IR, so you write N+M components instead of N×M.

The IR is the representation where the compiler does its heaviest
thinking (optimization, [Part IV](/compiler/part-4-optimization/optimization-pipeline)).
It's worth a chapter to get right.

## 2. Three-address code

The classic IR form is **three-address code** (TAC): a flat sequence of
instructions, each with at most three operands — a result and (up to)
two sources:

```
t1 = a + b
t2 = t1 * c
t3 = t2 - d
x  = t3
```

Each instruction does *one* operation. Complex expressions are broken
into steps with **temporaries** (`t1`, `t2`, ...). The tree
`x = (a + b) * c - d` becomes the linear sequence above. "Three-address"
because the canonical instruction `result = op1 OP op2` mentions three
"addresses" (result, op1, op2).

TAC is close to machine code (flat, simple ops) but **target-neutral**:
the temporaries are unlimited "virtual registers," not real machine
registers (register allocation, [Chapter 17](/compiler/part-5-back-end/register-allocation),
maps them to real ones later). This keeps optimization independent of
the target.

## 3. The instruction set of an IR

A typical IR has a small instruction set:

- **Arithmetic/logic**: `t = a + b`, `t = a * b`, `t = a < b`, ...
- **Copy/move**: `t = a`.
- **Load/store** (memory): `t = load addr`, `store addr, t`.
- **Constants**: `t = 5`.
- **Control flow**: `jump L`, `branch cond, L1, L2`, `label L:`.
- **Function calls**: `t = call f(a1, a2)`, `return t`.

That's roughly it. The IR is deliberately *minimal* — a handful of
operation kinds — which makes analyses and optimizations simpler to
write (fewer cases). Source-level richness (for-loops, complex
expressions, syntactic sugar) is **lowered away**
([Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir)) into these
primitives.

## 4. Control flow in the IR: jumps and labels

The AST had structured control flow (`if`, `while` as nested nodes).
The IR flattens this into **labels and jumps** — closer to how a
machine works:

```
            // if cond { A } else { B }
    branch cond, L_then, L_else
L_then:
    ... A ...
    jump L_end
L_else:
    ... B ...
L_end:
    ...
```

```
            // while cond { body }
L_loop:
    branch cond, L_body, L_end
L_body:
    ... body ...
    jump L_loop
L_end:
    ...
```

Structured control flow becomes conditional/unconditional jumps to
labels — the substrate for **control-flow graphs**
([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)). This
lowering is mechanical (each `if`/`while`/`for` has a standard jump
pattern) and is part of IR generation.

> :nerdygoose: Flattening structured control flow to jumps feels like
> *losing* information (the nice nested structure). And early
> optimizers did struggle to recover loop structure from a sea of
> jumps. The modern answer: the **control-flow graph**
> ([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)) recovers
> the structure as a graph of basic blocks, and analyses work on that.
> So we flatten to jumps (machine-like) but immediately rebuild a graph
> view (analysis-friendly). Lower for the machine, graph for the
> analysis.

## 5. SSA: Static Single Assignment

The most important modern IR refinement is **SSA form**: every variable
is **assigned exactly once**. If a source variable is assigned multiple
times, SSA gives each assignment a fresh version:

```
// source            // SSA
x = 1                x1 = 1
x = x + 1            x2 = x1 + 1
y = x * 2            y1 = x2 * 2
```

Each `x1`, `x2` is assigned once. The benefit: **every use has exactly
one definition**, trivially findable. This makes dozens of
optimizations dramatically simpler (you instantly know where a value
came from — no "which assignment reached here?" analysis needed).
SSA is covered fully in
[Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa), including the
clever **φ (phi) functions** that handle values merging from different
control-flow paths. For now: SSA = "assign each variable once," and
it's the form LLVM and most modern compilers use.

## 6. Levels of IR

Real compilers often use **multiple IRs** at different levels:

- **High-level IR (HIR)**: close to the AST, still has some
  source structure — good for high-level optimizations (inlining,
  language-specific rewrites).
- **Mid-level IR (MIR)**: three-address / SSA, target-neutral — where
  most classic optimizations happen.
- **Low-level IR (LIR)**: close to the target, with machine-ish
  operations — for register allocation and final codegen.

LLVM IR is essentially a mid-level SSA IR; Rust has HIR and MIR;
many compilers lower through several IRs, each suited to its stage.
**Lowering** is the act of translating from a higher IR to a lower one
([Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir)). The
progressive lowering — AST → HIR → MIR → LIR → machine code — is the
pipeline's spine, each step shedding abstraction.

## 7. What a good IR has

Design qualities of a useful IR:

- **Simple, orthogonal instruction set**: few operations, composable —
  fewer cases for analyses.
- **Explicit everything**: no implicit conversions, no hidden control
  flow — analyses can trust what they see.
- **Target-neutral** (at the mid level): unlimited virtual registers,
  abstract operations — optimization works for any target.
- **Easy to analyze**: SSA, explicit CFG — supports the data-flow
  analyses of [Part IV](/compiler/part-4-optimization/data-flow-analysis).
- **Typed**: IR instructions often carry types (from the front end),
  needed for correct lowering.

The AST is designed for *the source language*; the IR is designed for
*the compiler's own analyses*. That different design goal is why we
translate from one to the other rather than analyzing the AST directly.

## 8. The IR is where compilers spend their effort

A perspective: in a serious optimizing compiler, the front end
(lex/parse/check) is a small fraction of the code, and the *IR plus its
optimizations and lowerings* is the bulk. LLVM is millions of lines,
mostly IR passes and back-end codegen. The IR is where the compiler's
value — fast, correct output — is created. Getting the IR design right
(simple, analyzable, SSA) pays off across every optimization and target.

For Goolang we'll use a straightforward three-address / SSA IR — enough
to demonstrate real optimizations
([Part IV](/compiler/part-4-optimization/optimization-pipeline)) and
codegen ([Part V](/compiler/part-5-back-end/instruction-selection))
without LLVM's full complexity.

> :weightliftinggoose: The IR is the compiler's workshop floor — where
> the program is laid out flat (three-address code), control flow
> becomes jumps and a CFG, and every variable is assigned once (SSA)
> so optimizations can reason cleanly. Design it minimal, explicit,
> target-neutral, and SSA. The front end feeds it; the optimizer
> transforms it; the back end consumes it. Master the IR and you
> understand where compilers actually do their work.

## What we covered

- The **IR** sits between front end and back end — simpler than the
  AST, more abstract than machine code — designed for analysis and
  decoupling (the narrow waist).
- **Three-address code**: flat instructions with a result and ≤2
  sources, using unlimited **virtual-register temporaries**;
  target-neutral.
- A minimal **IR instruction set**: arithmetic, copy, load/store,
  constants, jumps/branches/labels, calls.
- Structured control flow is **lowered to labels and jumps**
  (substrate for the CFG).
- **SSA form**: each variable assigned exactly once (versioned) — every
  use has one definition; the basis of modern optimization.
- **Levels of IR** (HIR/MIR/LIR); **lowering** translates between them
  — the pipeline's progressive shedding of abstraction.
- A good IR is simple, explicit, target-neutral, analyzable, typed.
- The IR + its passes is where optimizing compilers spend most of
  their effort.

## What's next

[Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir) — lowering to
IR. The actual translation from typed AST to three-address code:
flattening expressions into temporaries, lowering control flow to
jumps, and handling function calls.
