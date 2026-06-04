---
sidebar_position: 2
title: "Local and Peephole Optimizations"
---

# Local and Peephole Optimizations

> The simplest, most reliable wins. Within a single basic block (or a
> small instruction window), constant folding, strength reduction, and
> peephole patterns clean up the IR with minimal analysis.

**Local optimizations** work within a single basic block
([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)) — no
control-flow analysis needed, since a block is straight-line. They're
the cheapest, most reliable optimizations, and a great place to start.
This chapter covers the local classics plus **peephole** optimization.

## 1. Constant folding

**Constant folding** computes constant expressions at compile time:

```
t1 = 2 + 3     →    t1 = 5
t2 = 10 * 4    →    t2 = 40
t3 = 5 < 3     →    t3 = false
```

If an operation's operands are all compile-time constants, the compiler
evaluates it *now* and replaces the operation with its result. The
runtime never does the arithmetic. This is the simplest optimization
and surprisingly impactful — constant subexpressions are everywhere
(array index math, struct offsets, configuration). It's purely local:
look at one instruction, check if its operands are constants, fold.

> :nerdygoose: Constant folding must respect the *target's* semantics,
> not the compiler's host language. If the target does 32-bit
> wraparound integer arithmetic, folding `2000000000 + 2000000000` must
> wrap exactly as the target would (to a negative number), not produce
> a big integer. Folding floating-point is even trickier — you must
> match the target's rounding and not fold in ways that change results
> (e.g., `x + 0.0` isn't always `x` for floats, due to negative zero
> and NaN). Correct folding mirrors the target's arithmetic precisely.

## 2. Constant propagation

**Constant propagation** spreads known constant values forward. If a
variable is assigned a constant, replace its later uses with that
constant:

```
x = 5          x = 5
y = x + 1   →  y = 5 + 1   →  (then fold) y = 6
z = y * 2      z = 6 * 2   →  z = 12
```

Propagation feeds folding: once `x` is replaced by `5`, `5 + 1` folds
to `6`, which propagates to make `6 * 2` fold to `12`. The two together
("constant propagation and folding") collapse chains of constant
computation. In SSA form ([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)),
propagation is trivial — `x` has one definition, so if it's `5`, every
use is `5`. (The global, control-flow-aware version is **sparse
conditional constant propagation**,
[Chapter 15](/compiler/part-4-optimization/ssa-optimizations).)

## 3. Copy propagation

**Copy propagation** eliminates redundant copies. After `y = x`, uses
of `y` can use `x` directly:

```
y = x          y = x
z = y + 1   →  z = x + 1     (then y may be dead → removed by DCE)
```

This removes the indirection through `y`, often making `y` itself dead
(unused), so dead-code elimination then removes the copy entirely. Copy
propagation + DCE together clean up the temporaries that lowering
([Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir)) generated
freely.

## 4. Dead-code elimination (DCE)

**Dead-code elimination** removes instructions whose results are never
used:

```
t1 = a + b     ← if t1 is never used anywhere, delete this
t2 = c * d
return t2       ← only t2 is used
```

If `t1`'s value is never read (no instruction uses `t1`), the
instruction computing it is **dead** — assuming it has no side effects
(a call that prints can't be deleted even if its result is unused). DCE
removes it. In SSA, a definition is dead iff its version has zero uses —
trivial to check. DCE is run repeatedly (other optimizations create
dead code), often as a cleanup pass after every transformation
([Chapter 12](/compiler/part-4-optimization/optimization-pipeline)).

## 5. Strength reduction

**Strength reduction** replaces expensive operations with cheaper
equivalents:

```
x * 2     →  x + x       or   x << 1     (shift cheaper than multiply)
x * 8     →  x << 3       (multiply by power of 2 → left shift)
x / 4     →  x >> 2       (for unsigned; signed needs care)
x % 8     →  x & 7        (mod power of 2 → bitwise and)
```

Multiplication and division are slower than addition, shifts, and
bitwise ops on most hardware. The compiler rewrites by-constant
multiplies/divides into shift/add/and sequences. (The loop version —
turning `i * stride` inside a loop into an incrementing accumulator —
is **induction-variable strength reduction**, a global loop
optimization.) Strength reduction trades an expensive instruction for
one or more cheap ones.

> :surprisedgoose: Modern CPUs have fast multipliers, so `x * 2 → x <<
> 1` matters less than it used to — but `x * 7 →  (x << 3) - x` and
> division-by-constant tricks (replacing division with a multiply by a
> magic reciprocal constant) still win big, because division is *very*
> slow (10–40 cycles). Compilers know hundreds of these algebraic
> identities. The famous one: dividing by a constant becomes a multiply
> by a precomputed "magic number" plus a shift — turning a 30-cycle
> division into a few cheap ops.

## 6. Algebraic simplification

Related to strength reduction, **algebraic simplification** applies
identities:

```
x + 0    →  x
x * 1    →  x
x * 0    →  0
x - x    →  0
x & x    →  x
x | 0    →  x
!(!x)    →  x
```

These exploit algebraic laws to eliminate or simplify operations.
They're local (one instruction or a small pattern) and cheap. Often
they expose further optimizations — `x * 1 → x` might enable copy
propagation, which enables DCE. Small simplifications cascade.

## 7. Peephole optimization

**Peephole optimization** slides a small window (a "peephole" of a few
consecutive instructions) over the code, looking for **patterns** that
can be replaced with better sequences:

```
// redundant load after store:
store [addr], r1
load  r2, [addr]      →    store [addr], r1
                            r2 = r1            (skip the load)

// jump to the next instruction:
jump L
L:                    →    (delete the jump; fall through)

// redundant move:
mov r1, r2
mov r2, r1            →    mov r1, r2          (second is redundant)
```

Peephole works on a *local window* (often on near-final or machine
code, [Part V](/compiler/part-5-back-end/instruction-selection)),
matching known wasteful patterns and rewriting them. It's a catch-all
cleanup that removes the small inefficiencies other passes (and codegen)
leave behind. A peephole optimizer is essentially a list of
pattern → replacement rules applied repeatedly until no pattern
matches.

## 8. Local optimizations in practice

These local optimizations — constant folding/propagation, copy
propagation, DCE, strength reduction, algebraic simplification,
peephole — are:

- **Cheap**: no global analysis; a single (or few) pass(es) over each
  block.
- **Reliable**: they almost always help, never hurt.
- **Synergistic**: each enables others (propagate → fold → DCE), so
  they're run together and repeated.
- **The foundation**: even `-O1` runs these; they deliver a large
  fraction of optimization's benefit for a small fraction of the
  effort.

They're also the easiest to implement and the best starting point for
*your* optimizer — implement constant folding and DCE first, see real
improvement, then add the global optimizations
([Chapters 14–15](/compiler/part-4-optimization/data-flow-analysis)).

> :weightliftinggoose: Start your optimizer with the local wins:
> constant folding (compute constants now), propagation (spread known
> values), DCE (delete unused computation), strength reduction (cheaper
> ops), and peephole (pattern cleanup). They're cheap, reliable, and
> synergistic — run them together, repeat to fixpoint. They deliver
> most of the benefit for the least effort and require no scary
> data-flow machinery. Get these working and your compiler already
> produces respectable code.

## What we covered

- **Local optimizations** work within one basic block — no
  control-flow analysis, cheap and reliable.
- **Constant folding**: evaluate constant expressions at compile time
  (respecting target arithmetic).
- **Constant propagation**: spread known constant values forward
  (trivial in SSA); feeds folding.
- **Copy propagation**: replace copies with the original; enables DCE.
- **Dead-code elimination**: remove instructions whose results are
  unused (and side-effect-free); trivial in SSA; run repeatedly.
- **Strength reduction**: expensive ops → cheap ones (`*2`→`<<1`,
  division-by-constant → multiply by magic number).
- **Algebraic simplification**: apply identities (`x+0`→`x`, `x*0`→`0`).
- **Peephole**: slide a small window, match wasteful patterns, rewrite.
- These are cheap, reliable, synergistic — the foundation, run even at
  `-O1`, the best starting point for your optimizer.

## What's next

[Chapter 14](/compiler/part-4-optimization/data-flow-analysis) —
data-flow analysis. The framework for *global* optimizations across the
whole CFG: liveness, reaching definitions, available expressions, and
the fixpoint iteration that computes them.
