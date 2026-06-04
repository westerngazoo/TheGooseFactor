---
sidebar_position: 3
title: "The Phases, End to End"
---

# The Phases, End to End

> Watch the whole machine work. We trace one tiny Goolang fragment
> through every stage of the pipeline — text to machine code — so you
> see the complete picture before building each stage in depth.

Theory lands better after you've seen the whole thing run once. This
chapter takes a single expression and walks it through lexing,
parsing, analysis, IR generation, optimization, and codegen — a
miniature of the entire course, in one pass.

## 1. The input

Our specimen, a single Goolang statement:

```c
let x = (2 + 3) * y;
```

We'll follow it through every stage. (Assume `y` is an `int` declared
earlier.) By the end you'll have seen the program's representation
transform six times.

## 2. Stage 1 — Lexing: text to tokens

The **lexer** ([Chapter 4](/compiler/part-2-front-end/lexing)) scans
the characters and groups them into **tokens** — the meaningful units:

```
let x = (2 + 3) * y;
```

becomes the token stream:

```
KEYWORD(let)  IDENT(x)  EQUALS  LPAREN  INT(2)  PLUS  INT(3)
RPAREN  STAR  IDENT(y)  SEMICOLON
```

Whitespace is discarded; each "word" or symbol becomes a token with a
type (`KEYWORD`, `IDENT`, `INT`, `PLUS`, ...) and, for some, a value
(`2`, `x`). The lexer also records each token's source location for
error messages. Output: a flat list of tokens.

## 3. Stage 2 — Parsing: tokens to AST

The **parser** ([Chapters 5–6](/compiler/part-2-front-end/parsing-and-grammars))
arranges the tokens into an **abstract syntax tree** reflecting the
grammar — crucially, getting *precedence* right (`*` binds tighter
than `+`, but the parentheses override that for `2 + 3`):

```
        Let(x)
          │
        Mul (*)
        /      \
     Add (+)   Var(y)
     /    \
  Int(2)  Int(3)
```

The tree captures structure the flat token list didn't: the
multiplication's operands are `(2 + 3)` and `y`; the addition's are `2`
and `3`. The parentheses, having done their grouping job, vanish — the
tree's *shape* encodes the grouping. Output: an AST.

> :surprisedgoose: Notice the parentheses are gone from the AST. They
> existed only to tell the parser how to *shape* the tree. Once the
> tree is built — `Mul(Add(2,3), y)` — the grouping is structural, not
> syntactic. This is why the AST is "abstract": it abstracts away the
> surface syntax (parens, whitespace, even some keywords) and keeps
> only the essential structure. Different syntaxes can parse to the
> same AST.

## 4. Stage 3 — Semantic analysis: meaning and types

The **analyzer** ([Chapters 7–8](/compiler/part-2-front-end/ast-and-semantic-analysis))
walks the AST and annotates it with meaning:

- **Name resolution**: `Var(y)` is linked to `y`'s declaration. `Let(x)`
  introduces `x` into the current scope.
- **Type checking**: `Int(2)` and `Int(3)` are `int`; `Add` of two
  `int`s is `int`; `y` is `int`; `Mul` of two `int`s is `int`; so `x`
  is `int`. All consistent — no type error.

The annotated tree now carries types on every node:

```
Let(x : int)
  └ Mul : int
      ├ Add : int
      │   ├ Int(2) : int
      │   └ Int(3) : int
      └ Var(y) : int
```

If `y` had been a `bool`, the analyzer would report a type error here
("cannot multiply int by bool"). Output: a checked, type-annotated AST.

## 5. Stage 4 — IR generation: lowering to a linear form

The **IR generator** ([Chapters 9–10](/compiler/part-3-types-and-ir/intermediate-representation))
flattens the tree into a simple, linear **intermediate representation**
— a sequence of basic operations, each producing a temporary value:

```
t1 = 2 + 3
t2 = t1 * y
x  = t2
```

This **three-address code** (each instruction has at most three
operands: a result and two sources) is much closer to machine code —
flat, explicit, one operation per line — but still
target-independent (the `t1`, `t2` are unlimited "virtual registers").
The tree structure became a linear sequence. Output: IR.

## 6. Stage 5 — Optimization: making it better

The **optimizer** ([Part IV](/compiler/part-4-optimization/optimization-pipeline))
improves the IR. Here, **constant folding** spots that `2 + 3` is a
compile-time constant and computes it:

```
t1 = 5          ; folded 2 + 3 at compile time
t2 = t1 * y
x  = t2
```

And **copy propagation** + **dead-code elimination** might simplify
further:

```
x = 5 * y       ; t1, t2 eliminated
```

The optimizer preserved the *meaning* (`x` still gets `(2+3)*y` =
`5*y`) while reducing the work (no runtime addition; fewer temps).
Real optimizers run dozens of such passes. Output: optimized IR.

> :nerdygoose: Constant folding `2 + 3 → 5` looks trivial, but it's the
> simplest member of a huge family. Constant *propagation* tracks
> known values across the program; *partial evaluation* specializes
> code for known inputs; whole classes of optimizations are "compute
> at compile time what you'd otherwise compute at runtime." The
> compiler does work *now* so the program does less work *later* — for
> every execution, forever. That leverage is why optimization matters.

## 7. Stage 6 — Code generation: emitting target code

The **code generator** ([Part V](/compiler/part-5-back-end/instruction-selection))
turns the optimized IR into target instructions. For a register
machine (real CPU), assuming `y` is in register `r1`:

```asm
    mov  r2, 5        ; the constant 5
    imul r2, r1       ; r2 = 5 * y
    mov  [x], r2      ; store result to x's memory slot
```

**Register allocation** ([Chapter 17](/compiler/part-5-back-end/register-allocation))
decided the virtual temps live in real register `r2`. For a stack VM
([Chapter 18](/compiler/part-5-back-end/bytecode-and-vms)) it'd instead
be:

```
    PUSH 5
    LOAD y
    MUL
    STORE x
```

Either way, the high-level `let x = (2 + 3) * y` is now concrete
instructions a machine (or VM) can execute. Output: target code. The
pipeline is complete.

## 8. The whole journey

One statement, six representations:

```
text:        let x = (2 + 3) * y;
tokens:      let x = ( 2 + 3 ) * y ;
AST:         Let(x, Mul(Add(2,3), y))
typed AST:   Let(x:int, Mul:int(Add:int(2,3), y:int))
IR:          t1=2+3; t2=t1*y; x=t2
optimized:   x = 5 * y
target:      mov r2,5; imul r2,r1; mov [x],r2
```

Each step lowered the program a little — from human syntax toward
machine reality — while preserving meaning. *That's the whole
compiler.* Every chapter from here builds one of these arrows in
depth: how the lexer scans, how the parser handles precedence, how the
type checker infers, how the optimizer analyzes, how codegen allocates
registers.

> :weightliftinggoose: This is your reference run. Whenever a later
> chapter feels abstract, come back here and place it: "we're turning
> the AST into IR — that's stage 4, tree to three-address code." The
> end-to-end trace is the trellis the whole course grows on. Now that
> you've seen the machine work start to finish, we build each stage
> for real — starting with the lexer.

## What we covered

- Traced `let x = (2 + 3) * y;` through every stage.
- **Lexing**: text → tokens (`let`, `x`, `=`, `(`, `2`, ...).
- **Parsing**: tokens → AST (`Mul(Add(2,3), y)`) — parens vanish into
  tree shape; precedence captured structurally.
- **Semantic analysis**: name resolution + type checking → typed AST.
- **IR generation**: AST → linear three-address code (`t1=2+3; ...`).
- **Optimization**: constant folding + propagation + DCE → `x = 5*y`.
- **Code generation**: IR → target instructions (register machine or
  stack VM), with register allocation.
- The whole compiler is a chain of meaning-preserving lowerings from
  syntax to machine code.

## What's next

That closes Part I. [Part II](/compiler/part-2-front-end/lexing)
builds the front end for real — starting with **lexing**: the
algorithms and data structures that turn a stream of characters into a
clean stream of tokens, with source locations for great error
messages.
