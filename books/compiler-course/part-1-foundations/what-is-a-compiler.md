---
sidebar_position: 1
title: "What a Compiler Is — The Pipeline"
---

# What a Compiler Is

> The whole compiler, mapped. Before building any stage, see the
> pipeline end to end so you always know where you are and why each
> stage exists.

A compiler translates a program from one language to another — usually
from a high-level source language to machine code. It does this not in
one leap but through a **pipeline** of stages, each transforming one
representation into the next. This chapter is the map.

## 1. The fundamental job

A compiler is a function:

```
compile : SourceCode → TargetCode
```

Source code is text in a high-level language (C, Rust, our Goolang).
Target code is something executable — real machine instructions, or
bytecode for a virtual machine. The compiler bridges the gap between
"what humans write" and "what machines run."

But that gap is *huge*. Source code has names, types, nested
expressions, control structures. Machine code has registers, memory
addresses, and a flat sequence of simple instructions. You can't jump
from one to the other directly. So the compiler works in **stages**,
each making a small, well-defined step.

## 2. The pipeline

The canonical compiler pipeline:

```
source text
    │  ── Lexer ──▶        tokens
    │  ── Parser ──▶       abstract syntax tree (AST)
    │  ── Analyzer ──▶     annotated AST (scopes, types)
    │  ── IR gen ──▶       intermediate representation (IR)
    │  ── Optimizer ──▶    optimized IR
    │  ── Codegen ──▶      target code (assembly / bytecode)
    ▼
executable
```

Each arrow is a stage — a transformation from one representation to
the next. The representations get progressively *lower-level*: text →
tree → annotated tree → linear IR → machine code. The compiler
gradually "lowers" the program from human-friendly to machine-friendly.

Two big halves:

- **The front end** (lexer, parser, analyzer): understands the source
  language. Produces a clean, checked, language-independent
  representation. Covered in [Part II](/compiler/part-2-front-end/lexing).
- **The back end** (IR, optimizer, codegen): produces efficient target
  code. Covered in [Parts III–V](/compiler/part-3-types-and-ir/intermediate-representation).

The boundary between them is the **IR** — a representation that's
neither source nor target, the compiler's internal lingua franca.

> :nerdygoose: The front end / back end split is why you can build,
> say, a compiler that targets both x86 and ARM: one front end (parse
> the language) feeds one IR, and *two* back ends (x86 codegen, ARM
> codegen) consume it. Or the reverse: many front ends (C, C++, Rust,
> Swift) producing one IR (LLVM IR) consumed by one optimizing back
> end. The IR-in-the-middle architecture — "the narrow waist" — is why
> LLVM powers compilers for dozens of languages and targets. We'll
> build toward understanding exactly that.

## 3. The stages, one sentence each

A preview of what each does (each gets full chapters later):

- **Lexer** ([Ch 4](/compiler/part-2-front-end/lexing)): groups
  characters into **tokens** (`if`, `+`, `42`, `foo`) — the words of
  the language.
- **Parser** ([Ch 5–6](/compiler/part-2-front-end/parsing-and-grammars)):
  arranges tokens into an **abstract syntax tree** reflecting the
  grammar — the sentence structure.
- **Semantic analyzer** ([Ch 7](/compiler/part-2-front-end/ast-and-semantic-analysis)):
  resolves names to declarations (scope) and checks **types** — the
  meaning.
- **IR generator** ([Ch 9–10](/compiler/part-3-types-and-ir/intermediate-representation)):
  lowers the AST to a simpler, linear **intermediate representation**.
- **Optimizer** ([Part IV](/compiler/part-4-optimization/optimization-pipeline)):
  transforms the IR to be faster/smaller while preserving meaning.
- **Code generator** ([Part V](/compiler/part-5-back-end/instruction-selection)):
  emits target code (machine instructions or bytecode), including
  **register allocation**.

Each stage has a clear input and output. That clarity is what makes a
compiler buildable: you implement and test one stage at a time.

## 4. Compiler vs interpreter

A close cousin. An **interpreter** shares the front end (lex, parse,
analyze) but instead of generating code, it *executes* the AST or IR
directly — walking the tree, performing each operation as it goes.

```
Compiler:    source → ... → IR → machine code → (run later)
Interpreter: source → ... → IR → execute now
```

The front end is identical; the difference is the back end:

- A compiler *emits* code to run later (faster, since translation
  happens once).
- An interpreter *runs* the program now (more flexible, easier to
  build, slower).

Many systems blend them: a **bytecode compiler** front-ends + emits
bytecode, and a **bytecode interpreter** (VM) runs it (Python, Java,
C#). A **JIT** ([Ch 21](/compiler/part-6-runtime/jit-compilation))
interprets at first, then compiles hot code to machine code at
runtime. The compiler/interpreter line is a spectrum, not a wall.

> :surprisedgoose: If you've ever written a tree-walking interpreter —
> an `eval` function that recurses over an AST and computes results —
> you've built a compiler's entire front end plus the simplest
> possible back end (execute instead of emit). The leap from
> interpreter to compiler is "stop executing the tree; start emitting
> code that, when run, does what executing the tree would have done."
> That's the whole back-end story.

## 5. Why so many stages?

Couldn't we just translate source straight to machine code? In
principle yes (some tiny compilers do), but staging buys you:

- **Separation of concerns**: each stage solves one problem. The lexer
  doesn't care about types; the optimizer doesn't care about syntax.
- **Testability**: you can test the lexer's tokens, the parser's tree,
  the type checker's errors — each in isolation.
- **Reusability**: the IR-in-the-middle lets you swap front ends and
  back ends independently (§2).
- **Optimization opportunity**: a clean IR is far easier to optimize
  than raw source or raw machine code. The middle representation is
  *designed* for analysis.

The cost is more code and more representations to maintain. For
production compilers, the trade is overwhelmingly worth it.

## 6. Errors: a cross-cutting concern

Real compilers spend enormous effort on **error reporting**. A
compiler that says "syntax error" is useless; one that says "expected
`)` at line 12, column 8, to close the `(` opened at line 12, column
3" is a joy. Each stage can produce errors:

- **Lexer**: invalid characters, unterminated strings.
- **Parser**: syntax errors (unexpected tokens).
- **Analyzer**: undefined variables, type mismatches.
- **Later stages**: usually internal errors (bugs in the compiler).

Good compilers track **source locations** (line/column) through every
stage so they can point at the exact problem. We'll thread location
information through our pipeline from the start
([Ch 4](/compiler/part-2-front-end/lexing)). Error quality is a
feature, not an afterthought.

## 7. The plan

This course builds the pipeline left to right:

- **[Part I](/compiler/part-1-foundations/source-and-target)**
  (here): the map, the source language, and a tiny end-to-end run.
- **[Part II](/compiler/part-2-front-end/lexing)**: the front end —
  text becomes a checked tree.
- **[Part III](/compiler/part-3-types-and-ir/type-checking)**: types
  and IR — the tree becomes a clean middle representation.
- **[Part IV](/compiler/part-4-optimization/optimization-pipeline)**:
  optimization — the IR gets faster.
- **[Part V](/compiler/part-5-back-end/instruction-selection)**: the
  back end — IR becomes machine code.
- **[Part VI](/compiler/part-6-runtime/garbage-collection)**: the
  runtime that the compiled code needs.

Always know where you are in the pipeline. When we're deep in register
allocation ([Ch 17](/compiler/part-5-back-end/register-allocation)),
remember: that's the back end, turning IR into machine code. The map
keeps you oriented.

> :weightliftinggoose: Keep this pipeline diagram in your head: text →
> tokens → AST → IR → optimized IR → machine code. Every stage is one
> transformation. Every chapter of this course builds or refines one
> arrow. When something feels complex, locate it on the map and ask:
> what's the input, what's the output, what transformation is this? The
> pipeline is the skeleton; everything hangs on it.

## What we covered

- A compiler is `source → target`, done through a **pipeline** of
  stages, each lowering the program toward the machine.
- The pipeline: text → (lexer) tokens → (parser) AST → (analyzer)
  annotated AST → (IR gen) IR → (optimizer) IR → (codegen) machine
  code.
- **Front end** (lex/parse/analyze) understands the source; **back
  end** (IR/optimize/codegen) produces target code; the **IR** is the
  boundary.
- IR-in-the-middle ("narrow waist") lets front ends and back ends swap
  independently — the LLVM architecture.
- **Interpreters** share the front end but execute instead of emit;
  the line is a spectrum (bytecode VMs, JITs).
- Staging buys separation, testability, reusability, and optimization
  opportunity.
- **Error reporting** with source locations is a cross-cutting feature
  threaded through every stage.

## What's next

[Chapter 2](/compiler/part-1-foundations/source-and-target) — the
source and the target. We define Goolang (the language we'll compile)
and survey what we can target (machine code, bytecode, another
language), so the pipeline has concrete endpoints.
