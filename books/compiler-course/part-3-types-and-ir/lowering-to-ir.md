---
sidebar_position: 3
title: "Lowering to IR"
---

# Lowering to IR

> The actual translation. We walk the typed AST and emit three-address
> code: flattening expressions into temporaries, turning control flow
> into jumps, and handling function calls.

We have a typed AST ([Chapter 8](/compiler/part-3-types-and-ir/type-checking))
and an IR design ([Chapter 9](/compiler/part-3-types-and-ir/intermediate-representation)).
**Lowering** is the pass that translates one to the other — the bridge
from the front end to the back end. It's another tree walk, but instead
of *checking* the tree, it *emits* IR.

## 1. The lowering pass shape

Lowering walks the AST and **emits** IR instructions into a growing
list. Expression nodes return the temporary holding their result;
statement nodes emit instructions for their effect:

```
emitted: a global list of IR instructions
fresh_temp(): returns a new unique temporary (t1, t2, ...)
fresh_label(): returns a new unique label (L1, L2, ...)
emit(instr): appends an instruction to `emitted`
```

The walk is recursive, mirroring the AST — like the type checker, but
producing IR as a side effect. Each kind of node has a lowering rule.

## 2. Lowering expressions

An expression lowers to IR that *computes its value into a temporary*,
and the lowering function *returns* that temporary:

```
function lower_expr(node) -> Temp:
    match node:
        IntLit(v):
            t = fresh_temp()
            emit(t = v)              // t = 5
            return t
        Var(name):
            return temp_for(name)    // the temp holding this variable
        Binary(op, l, r):
            tl = lower_expr(l)       // recursively lower left
            tr = lower_expr(r)       // recursively lower right
            t = fresh_temp()
            emit(t = tl op tr)       // t = tl + tr
            return t
        Call(f, args):
            arg_temps = [lower_expr(a) for a in args]
            t = fresh_temp()
            emit(t = call f(arg_temps))
            return t
```

This is the AST-to-TAC flattening from
[Chapter 3](/compiler/part-1-foundations/phases-end-to-end). A nested
expression like `(a + b) * c` lowers depth-first: lower `a + b` (emits
`t1 = a + b`, returns `t1`), lower `c` (returns its temp), then emit
`t2 = t1 * c`, return `t2`. The tree's nesting becomes a linear sequence
of temporaries. **The recursion structure of the walk produces the
correct evaluation order** — exactly why we lower depth-first.

## 3. Lowering control flow

Structured statements lower to the **jump patterns** from
[Chapter 9 §4](/compiler/part-3-types-and-ir/intermediate-representation).
For `if`:

```
function lower_if(cond, then_block, else_block):
    c = lower_expr(cond)             // compute the condition into a temp
    L_then = fresh_label()
    L_else = fresh_label()
    L_end  = fresh_label()
    emit(branch c, L_then, L_else)
    emit(label L_then)
    lower_block(then_block)
    emit(jump L_end)
    emit(label L_else)
    lower_block(else_block)
    emit(label L_end)
```

For `while`:

```
function lower_while(cond, body):
    L_loop = fresh_label()
    L_body = fresh_label()
    L_end  = fresh_label()
    emit(label L_loop)
    c = lower_expr(cond)
    emit(branch c, L_body, L_end)
    emit(label L_body)
    lower_block(body)
    emit(jump L_loop)               // loop back
    emit(label L_end)
```

The fresh labels keep nested control flow unambiguous (each `if`/`while`
gets unique labels, so nesting works). After lowering, the structured
tree is a flat instruction list with branches and labels — ready for
the CFG ([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)).

## 4. Lowering variables: the assignment question

Source variables (`x`) need to map to IR storage. Two approaches:

- **Temporaries directly**: if a variable is assigned once and lives in
  a register, map it to a temp. (Works cleanly toward SSA.)
- **Memory slots**: allocate a stack slot per variable; `let x = e`
  emits `store x_slot, (lower_expr e)`; `x` reads `load x_slot`. Simple
  and always correct, but adds load/store traffic that later
  optimization removes.

A common pattern: lower naively to memory slots (simple, correct), then
let an optimization pass (**mem2reg**, promoting memory to registers)
convert them to SSA temporaries. This is exactly what LLVM front ends
do — emit `alloca`/`load`/`store`, then `mem2reg` cleans up. It
separates "correct lowering" from "efficient form," which is good
engineering.

## 5. Lowering functions

A function lowers to a labeled block of IR with a prologue/epilogue
sketch:

```
function lower_function(fn):
    emit(label fn.name)             // entry point
    // bind parameters to temps/slots
    for p in fn.params:
        bind p to a parameter temp
    lower_block(fn.body)            // the body
    // (returns are emitted by lower_return within the body)
```

`return e` lowers to `t = lower_expr(e); emit(return t)`. Function
*calls* were handled in §2 (`t = call f(args)`). The details of *how*
arguments are passed and results returned at the machine level
(calling conventions) are the back end's job
([Chapter 19](/compiler/part-5-back-end/targeting-real-machines)); the
IR just says `call f(args)` and `return t` abstractly.

## 6. Desugaring during lowering

**Desugaring** — translating convenient surface constructs into
simpler core ones — happens during (or before) lowering. Examples:

- A `for` loop desugars to a `while` loop (`init; while cond { body; step }`).
- Compound assignment `x += 1` desugars to `x = x + 1`.
- `&&` / `||` desugar to short-circuiting branches (like nested `if`s).
- `unless cond` (if any) desugars to `if !cond`.

Desugaring shrinks the number of constructs the back end must handle:
lower `for` to `while`, and codegen never needs to know about `for`.
The IR's minimal instruction set
([Chapter 9](/compiler/part-3-types-and-ir/intermediate-representation))
is achievable precisely because rich surface syntax is desugared into a
few core forms. (This is the same idea as a Lisp macro expanding sugar
to core forms — translate the convenient into the fundamental.)

> :surprisedgoose: Desugaring is a huge lever for keeping a compiler
> small. A language might have `for`, `while`, `do-while`,
> `foreach`, compound assignment, ternary, `&&`/`||` — but if they all
> desugar to `while` + `if` + basic assignment, the back end handles
> only those few. Every construct you can desugar is one fewer case in
> every subsequent pass (optimization, codegen). Compilers aggressively
> desugar to concentrate complexity in one place (the desugarer) and
> keep everything downstream simple.

## 7. The lowering output

After lowering, the whole program is a list of IR instructions
organized into labeled regions (functions). The factorial example:

```c
fn factorial(n) { if n == 0 { return 1 } else { return n * factorial(n-1) } }
```

lowers to roughly:

```
factorial:
    t1 = n == 0
    branch t1, L_then, L_else
L_then:
    return 1
L_else:
    t2 = n - 1
    t3 = call factorial(t2)
    t4 = n * t3
    return t4
L_end:
```

This linear, explicit IR — temporaries, branches, labels, calls — is
exactly what the optimizer
([Part IV](/compiler/part-4-optimization/optimization-pipeline)) and
code generator ([Part V](/compiler/part-5-back-end/instruction-selection))
want. The tree is gone; the flat sequence remains.

## 8. Lowering is where source meaning meets machine reality

Step back: lowering is the pivot of the whole compiler. *Above* it, the
representation is shaped by the *source language* (the AST: functions,
expressions, types). *Below* it, the representation is shaped by *the
machine* (flat instructions, jumps, registers). Lowering translates
between these worlds — it's where "what the programmer meant" becomes
"steps the machine can do."

Get lowering right (correct evaluation order, correct control-flow
patterns, faithful desugaring) and the back end has a clean, simple
input. Lowering is mechanical but must be *exactly* correct — a subtle
bug here (wrong evaluation order, mismatched labels) produces a compiler
that generates wrong code, the worst kind of bug.

> :weightliftinggoose: Lowering is a tree walk that *emits* IR instead
> of checking it: expressions return their result temp (emitting the
> ops to compute it), control flow emits branch/jump/label patterns,
> and rich constructs desugar to core ones. Lower depth-first so
> evaluation order is correct; use fresh temps and labels so nesting
> works. The output — flat three-address code with branches — is the
> back end's clean input. This is where the source language ends and
> the machine begins.

## What we covered

- **Lowering** walks the typed AST and **emits** IR (vs the type
  checker, which checks).
- **Expressions** lower depth-first to temporaries; each `lower_expr`
  emits the ops and returns the result temp — the recursion gives
  correct evaluation order.
- **Control flow** lowers to branch/jump/label patterns (fresh labels
  keep nesting unambiguous).
- **Variables**: map to temps (toward SSA) or memory slots (simple,
  then promote via mem2reg).
- **Functions** lower to labeled IR regions; `call`/`return` are
  abstract IR ops (machine details deferred to codegen).
- **Desugaring** translates rich constructs (`for`, `+=`, `&&`) to core
  ones during lowering — concentrating complexity, keeping the back end
  small.
- Lowering is the **pivot**: above it the source language, below it the
  machine. It must be exactly correct.

## What's next

[Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa) — control-flow
graphs and SSA. We organize the flat IR into a graph of basic blocks
(the CFG), then construct full SSA form with φ-functions — the
representation the optimizer thrives on.
