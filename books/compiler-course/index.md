---
sidebar_position: 1
sidebar_label: Introduction
title: "Build Your Own Compiler"
slug: /
---

# Build Your Own Compiler

> A compiler is just a program that translates programs. Strip away
> the intimidation and it's a pipeline of well-understood stages —
> each one a tree or graph transformation you can build by hand. This
> course builds the whole pipeline, stage by stage.

Compilers have a reputation for being deep magic — the province of a
few wizards. That reputation is wrong. A compiler is a *program like
any other*: it reads input (source code), transforms it through a
series of representations, and produces output (machine code or
bytecode). Each transformation is comprehensible on its own. This
course builds them all.

## Why build a compiler?

You may never write a production compiler. So why learn this?

- **It demystifies everything below your code.** After this, "how does
  my source become something the machine runs?" stops being a mystery.
  You'll understand what your compiler is doing and why your code is
  slow or fast.
- **The techniques are everywhere.** Lexing, parsing, tree-walking,
  graph analysis — you'll use them in interpreters, linters,
  formatters, query engines, config parsers, build tools, and DSLs.
  Compiler skills are general programming superpowers.
- **It's the capstone of CS fundamentals.** Compilers tie together
  data structures (trees, graphs, hash tables), algorithms (graph
  traversal, fixpoint iteration), and theory (grammars, automata) into
  one working artifact.
- **It's deeply satisfying.** Watching source code you wrote get
  tokenized, parsed, type-checked, optimized, and turned into running
  machine code by *your* compiler is one of programming's great
  pleasures.

## What we'll build

A complete compiler pipeline for a small but real language — call it
**Goolang** (a C-like language with functions, integers, conditionals,
loops, and recursion). We'll take it from source text all the way to
executable code, covering:

- **Lexing**: text → tokens.
- **Parsing**: tokens → abstract syntax tree (AST).
- **Semantic analysis**: scope resolution, type checking.
- **IR generation**: AST → intermediate representation.
- **Optimization**: making the IR faster and smaller.
- **Code generation**: IR → bytecode and real machine code.
- **Register allocation**: mapping unlimited values to limited
  registers.
- **Runtime**: memory management, garbage collection, JIT.

By the end you'll understand every stage and have built a working
compiler.

> :nerdygoose: The classic compiler diagram — the "Dragon Book" cover
> features a knight slaying a dragon labeled "complexity of compiler
> design." We're going to slay that dragon with a clear pipeline and a
> lot of small, understandable steps. No single stage is hard; the
> intimidation comes from seeing them all at once. We'll take them one
> at a time.

## The shape of the course

Six parts, following the compiler pipeline front to back:

- **Part I — Foundations.** What a compiler is, the source and target
  languages, the pipeline overview.
- **Part II — The Front End.** Lexing, parsing, the AST, semantic
  analysis. Turning text into a meaningful tree.
- **Part III — Types & IR.** Type checking, intermediate
  representation, lowering, control-flow graphs and SSA.
- **Part IV — Optimization.** The optimization pipeline, local
  optimizations, data-flow analysis, SSA-based optimizations.
- **Part V — The Back End.** Instruction selection, register
  allocation, bytecode VMs, targeting real machines.
- **Part VI — Runtime & Beyond.** Garbage collection, JIT compilation,
  bootstrapping and self-hosting.

See the [Roadmap](/compiler/table-of-contents) for the full chapter
list.

## What this course assumes

- You can program comfortably in some language (we use pseudocode and
  reference real implementations).
- You know basic data structures: trees, graphs, hash tables, stacks.
- You're willing to think about programs *as data* — because a
  compiler treats programs as the data it transforms.

No prior compiler, automata-theory, or assembly experience required.
We build the theory we need as we go.

## Interpreters vs compilers

A quick orientation. An **interpreter** reads a program and *executes
it directly*. A **compiler** reads a program and *translates it to
another form* (machine code, bytecode) that's executed later. They
share a front end (lexing, parsing, analysis) — the difference is the
back end: an interpreter walks the tree and acts; a compiler emits
code.

If you've built a tree-walking interpreter (evaluating an AST node by
node), you've built a compiler's front end plus a trivial back end.
This course keeps the front end and replaces the "walk and execute"
back end with "walk and emit code" — plus all the optimization and
code-generation machinery that makes the output fast.

> :weightliftinggoose: This is a build-it course. Each part adds a
> stage to a working compiler. Don't just read — implement. Pick a
> language you like (Python and Rust are both great for writing
> compilers), and build each stage as we cover it. By Part V you'll
> have a compiler that takes real source and produces real running
> code. That artifact is worth more than any amount of reading.

## How to read it

Front to back — the pipeline stages build on each other. Implement as
you go: a lexer in Part II, a parser next, and so on, assembling a
complete compiler by the end. The optimization (Part IV) and back-end
(Part V) chapters can be skimmed first and deepened on a second pass.

Ready? [Part I, Chapter 1](/compiler/part-1-foundations/what-is-a-compiler)
starts by mapping the whole pipeline — so you always know where you
are.
