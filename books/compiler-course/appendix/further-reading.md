---
sidebar_position: 3
title: "Appendix C — Further Reading"
---

# Appendix C — Further Reading

Where to go deeper, organized from gentle to advanced.

## The build-it books (start here)

**Crafting Interpreters** (Robert Nystrom). The best modern hands-on
book — builds two complete interpreters for a real language (Lox): a
tree-walker in Java and a bytecode VM in C
([Chapter 18](/compiler/part-5-back-end/bytecode-and-vms)). Beautifully
written, **free online** (craftinginterpreters.com). If you read one
follow-up, this is it. Closest in spirit to this course.

**Writing An Interpreter In Go** / **Writing A Compiler In Go** (Thorsten
Ball). Hands-on, approachable, builds a lexer, parser, evaluator
(interpreter book) then a bytecode compiler + VM (compiler book) in Go.
Practical and clear.

**A Compiler from Scratch** and similar online tutorials — many exist;
build something small end to end.

## The canonical textbooks

**Compilers: Principles, Techniques, and Tools** (Aho, Lam, Sethi,
Ullman) — *the* "Dragon Book." The classic comprehensive reference:
lexing/parsing theory, optimization, code generation. Dense and
thorough; the standard university text. Strong on front-end theory and
classic optimization.

**Engineering a Compiler** (Cooper & Torczon). A more modern, more
back-end-focused alternative to the Dragon Book — excellent on IR,
optimization, register allocation, SSA. Many prefer it for the back-end
material.

**Modern Compiler Implementation in ML/Java/C** (Andrew Appel). Builds a
real compiler with strong coverage of SSA, register allocation
([Chapter 17](/compiler/part-5-back-end/register-allocation)), and
modern techniques. The "Tiger" compiler project.

## Optimization & SSA

**SSA-based Compiler Design** (Rastello & Bouchez Tichadou, eds.) — the
deep reference on SSA form
([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)) and SSA-based
optimization ([Chapter 15](/compiler/part-4-optimization/ssa-optimizations)).

**Cytron et al., "Efficiently Computing Static Single Assignment Form"**
(1991) — the original SSA-construction paper.

**Chaitin, "Register Allocation & Spilling via Graph Coloring"** (1982) —
the foundational register-allocation paper
([Chapter 17](/compiler/part-5-back-end/register-allocation)).

## Back end & runtime

**LLVM documentation and "LLVM Language Reference"** — for targeting
LLVM ([Chapter 19](/compiler/part-5-back-end/targeting-real-machines)).
The LLVM tutorial ("Kaleidoscope") builds a small language front end on
LLVM, step by step.

**The Garbage Collection Handbook** (Jones, Hosking, Moss) — the
definitive GC reference ([Chapter 20](/compiler/part-6-runtime/garbage-collection)):
every algorithm, in depth.

**Maxime Chevalier-Boisvert's work and the "Building a Baseline JIT"
material** — for JIT compilation
([Chapter 21](/compiler/part-6-runtime/jit-compilation)). V8 and
HotSpot engineering blogs are also rich.

## Theory & foundations

**Types and Programming Languages (TAPL)** (Benjamin Pierce) — the
definitive book on type systems
([Chapter 8](/compiler/part-3-types-and-ir/type-checking)), from simple
typing through type inference, polymorphism, and beyond.

**"Reflections on Trusting Trust"** (Ken Thompson, 1984) — the famous
four-page Turing-Award lecture on bootstrapping and trust
([Chapter 22](/compiler/part-6-runtime/bootstrapping)). Read it.

## Real compiler codebases

Reading real compilers teaches enormously:

- **TCC** (Tiny C Compiler) — small enough to read; a complete C
  compiler.
- **QBE** — a tiny optimizing back end; readable SSA and register
  allocation.
- **Cranelift** (Rust) — a modern, readable back end.
- **The Go compiler** — relatively approachable for a production
  compiler.
- **LLVM / Clang** — the big leagues; pick one pass and study it.
- **Lua** — a small, elegant, complete language implementation
  (register-based VM, [Chapter 18](/compiler/part-5-back-end/bytecode-and-vms)).

## Projects worth building

To cement the course:

1. **A calculator → a small language**: start with arithmetic, grow to
   Goolang (functions, control flow). Build lexer → parser →
   type-checker → bytecode VM ([Ch 18](/compiler/part-5-back-end/bytecode-and-vms)).
2. **Add optimizations**: constant folding, DCE
   ([Ch 13](/compiler/part-4-optimization/local-and-peephole)) — watch
   your IR improve.
3. **A native back end**: target LLVM
   ([Ch 19](/compiler/part-5-back-end/targeting-real-machines)), or
   hand-emit assembly for one architecture.
4. **A JIT** ([Ch 21](/compiler/part-6-runtime/jit-compilation)):
   compile hot bytecode to native at runtime — the master class.
5. **Self-host** ([Ch 22](/compiler/part-6-runtime/bootstrapping)): write
   your compiler in its own language. The black belt.

## A suggested path

1. **Read Crafting Interpreters** alongside building your own compiler
   — it's the perfect companion to this course.
2. **Build the bytecode-VM compiler** to completion (source → run).
3. **Dig into the Dragon Book / Engineering a Compiler** for the theory
   you want deeper.
4. **Target LLVM** for real native code, or **study a real codebase**
   (TCC, QBE, Cranelift).
5. **Take on an ambitious project**: a JIT, or self-hosting.

The field is deep, but you now have the map (the pipeline) and the
stages. Build something that runs — then make it fast, then make it
native, then make it compile itself.

> Back to [the course](/compiler/) · the
> [roadmap](/compiler/table-of-contents).
