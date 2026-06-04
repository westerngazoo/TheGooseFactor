---
sidebar_position: 4
title: "SSA-Based Optimizations"
---

# SSA-Based Optimizations

> How SSA form makes the powerful global optimizations clean and fast.
> Because every value has one definition, analyses that needed full
> data-flow iteration become sparse and direct.

SSA form ([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)) —
every variable assigned once — was built for optimization. This chapter
shows the payoff: optimizations that, on a non-SSA IR, required the full
data-flow machinery ([Chapter 14](/compiler/part-4-optimization/data-flow-analysis))
become simpler and faster on SSA. This is why modern compilers (LLVM,
GCC) optimize in SSA.

## 1. Why SSA helps: def-use edges are explicit

The core SSA advantage: **every use has exactly one definition, and you
can follow the edge directly.** No "which definitions reach here?"
analysis — the IR encodes it. SSA effectively comes with **def-use
chains** built in:

- From a definition, you can find all its uses.
- From a use, you can find its (single) definition.

These explicit edges let optimizations work **sparsely** — follow the
def-use graph directly to where information is relevant — instead of
**densely** iterating over every program point (as classic data-flow
does). Sparse = faster and often simpler.

## 2. SSA-based dead-code elimination

DCE in SSA is almost trivial. A definition is **dead** iff its version
has **zero uses**:

```
function ssa_dce():
    worklist = all definitions
    while worklist not empty:
        def = worklist.pop()
        if def.version has no uses and def has no side effects:
            for each value def uses:
                that value loses a use → add it to worklist
            delete def
```

Delete a dead definition, and its operands lose a use — possibly
becoming dead too, so you re-check them (worklist). This cascades:
deleting one dead instruction can make its inputs dead. On a non-SSA
IR, "is this dead?" needs liveness analysis
([Chapter 14](/compiler/part-4-optimization/data-flow-analysis)); on
SSA, it's "does this version have uses?" — a direct check on the def-use
edges.

## 3. Sparse conditional constant propagation (SCCP)

**SCCP** is one of SSA's signature optimizations — it does constant
propagation *and* dead-branch elimination *together*, more powerfully
than either alone. It tracks, for each SSA value, a lattice state:
**unknown**, a **specific constant**, or **not-constant** ("bottom").

The clever part: it also tracks which CFG edges are **executable**. If
a branch condition is a known constant (say `true`), only the
taken edge is executable — the other branch is dead, and values defined
there don't pollute the analysis. This "conditional" awareness lets
SCCP discover constants that survive only because dead branches are
ignored:

```
x = 1
if x > 0 {        // x>0 is true (x=1 is constant) → else branch is dead
    y = 10
} else {
    y = 20        // dead — never executed
}
z = y + 5         // y is 10 (only the live branch); z = 15
```

SCCP propagates `x = 1`, evaluates `x > 0` to `true`, marks the `else`
dead, so `y` is unambiguously `10`, so `z` folds to `15`. A plain
constant propagation that didn't know the `else` was dead would see `y`
as "10 or 20" = not-constant and miss it. SCCP's combination of constant
tracking + reachability — efficient on SSA because of φ-functions and
def-use edges — is strictly more powerful.

> :surprisedgoose: SCCP finds constants that *neither* constant
> propagation *nor* dead-code elimination finds alone — only their
> *combination* does. CP alone can't tell the `else` is dead (so `y` is
> "maybe 20"); DCE alone can't fold `x > 0` (it doesn't track that
> `x=1`). Run separately and iterated, they'd eventually get there;
> SCCP gets there in *one* analysis by tracking constants and edge
> reachability simultaneously. It's a classic example of two
> optimizations being more powerful fused than sequenced.

## 4. Global value numbering (GVN)

**Global value numbering** is SSA-friendly common-subexpression
elimination. It assigns each computed value a "number" such that
expressions guaranteed to compute the same value get the same number —
then redundant computations are replaced by the first one:

```
a = x + y       a = x + y       (value number #1)
b = x + y   →   b = a           (same value number → reuse a)
c = a * 2       c = a * 2
d = b * 2       d = c           (b≡a, so b*2 ≡ a*2 → reuse c)
```

Because SSA values are immutable (one definition, never changed), if two
expressions have identical operands and operator, they *must* produce
the same value — so GVN can confidently share them. On a non-SSA IR,
you'd need available-expressions analysis
([Chapter 14](/compiler/part-4-optimization/data-flow-analysis)) to
ensure the operands hadn't changed between the two computations; SSA's
immutability makes that guarantee free. GVN catches redundancies across
the *whole function*, not just within a block (unlike local CSE).

## 5. Copy and constant propagation via def-use

Plain copy and constant propagation
([Chapter 13](/compiler/part-4-optimization/local-and-peephole)) are
trivial on SSA. If `x2 = x1` (a copy), replace every use of `x2` with
`x1` — you have the def-use edges, so you know exactly which uses to
update, and `x1` definitely still holds the value (SSA immutability).
Same for constants: if `x = 5`, replace all uses of `x` with `5`. No
data-flow iteration — just walk the def-use edges from each definition
to its uses. Direct, sparse, fast.

## 6. φ-function optimizations

SSA's φ-functions ([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa))
get their own simplifications:

- **Trivial φ**: `x = φ(y, y)` — both arguments the same → `x = y`.
- **φ of a single predecessor**: collapses to a copy.
- **Dead φ**: a φ whose result is unused → removed by DCE.

These keep SSA clean as other optimizations reshape the CFG. φ-removal
also matters at **SSA destruction** — when leaving SSA for codegen
([Part V](/compiler/part-5-back-end/instruction-selection)), φ-functions
become copies in the predecessor blocks, and simplifying them first
reduces those copies.

## 7. Loop optimizations on SSA

Loops ([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)) are
where programs spend most time, so loop optimizations pay off most:

- **Loop-invariant code motion (LICM)**: hoist a computation out of a
  loop if its operands don't change across iterations. SSA makes
  "doesn't change" easy to check — an operand is invariant if its
  single definition is outside the loop.
- **Induction-variable optimizations**: recognize variables that step
  by a constant each iteration (`i = i + 1`); strength-reduce
  derived expressions (`i * 4` → an accumulator); eliminate redundant
  induction variables.
- **Loop unrolling**: replicate the body to reduce loop overhead and
  expose more instruction-level parallelism.

LICM especially relies on SSA: the single-definition property makes
"is this loop-invariant?" a simple check (where is the operand defined —
inside or outside the loop?). These loop optimizations are among the
most impactful in real compilers.

## 8. The SSA optimization suite

Putting it together, a modern SSA optimizer runs (and re-runs) a suite:
SCCP, GVN, SSA-DCE, copy/constant propagation, LICM, induction-variable
optimizations, plus the local optimizations
([Chapter 13](/compiler/part-4-optimization/local-and-peephole)) — in a
tuned, repeated pipeline ([Chapter 12](/compiler/part-4-optimization/optimization-pipeline)).
SSA makes each one cleaner and faster than its non-SSA equivalent, which
is the entire reason SSA became the dominant IR form.

After optimization, the IR is transformed for codegen: SSA is destructed
(φ-functions → copies), and the back end
([Part V](/compiler/part-5-back-end/instruction-selection)) turns the
optimized IR into machine code. Part IV made the program *fast*; Part V
makes it *real*.

> :weightliftinggoose: SSA's gift is explicit def-use edges and
> immutable values, which turn dense data-flow analyses into sparse,
> direct walks. DCE becomes "zero uses?"; CSE becomes value numbering;
> constant propagation follows edges; SCCP fuses constants with
> reachability for extra power; LICM checks "defined outside the loop?".
> This is why every serious compiler optimizes in SSA. Build your
> optimizer on SSA and the powerful global optimizations come within
> reach without the full data-flow machinery.

## What we covered

- SSA's core advantage: **explicit def-use edges** + **immutable
  values** → optimizations work **sparsely** (follow edges) not densely
  (iterate all points).
- **SSA-DCE**: a definition is dead iff its version has zero uses; delete
  and cascade via a worklist.
- **SCCP** (sparse conditional constant propagation): tracks constants
  *and* edge reachability together — finds constants neither plain CP
  nor DCE finds alone.
- **GVN** (global value numbering): SSA-friendly CSE — identical
  operations on immutable values share a result, function-wide.
- **Copy/constant propagation**: trivial on SSA — walk def-use edges.
- **φ-function** simplifications (trivial φ, single-pred, dead φ); matter
  for SSA destruction.
- **Loop optimizations** (LICM, induction variables, unrolling) — SSA
  makes invariance checks easy; highest-impact optimizations.
- The SSA suite is why SSA is the dominant IR; after it, SSA is
  destructed for codegen.

## What's next

That closes Part IV — the IR is now optimized. [Part V](/compiler/part-5-back-end/instruction-selection)
turns it into real machine code: instruction selection, register
allocation, bytecode VMs, and targeting actual hardware.
