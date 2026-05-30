---
sidebar_position: 1
title: "Appendix A — Toolchain and Tools"
---

# Appendix A — Toolchain and Tools

The tools that surround compiler construction — for building compilers
and for understanding the toolchain your output flows into.

## Languages for writing a compiler

Any language works, but some shine:

- **Rust**: excellent for compilers — algebraic data types (perfect for
  ASTs), pattern matching, performance, memory safety. `rustc` itself is
  Rust. Steeper learning curve.
- **OCaml / Haskell**: the academic favorites — sum types, pattern
  matching, and immutability fit compiler data structures beautifully.
  Many research compilers and early `rustc` used OCaml.
- **Python**: great for *learning* — fast to write, easy to experiment.
  Slow, but fine for a teaching compiler. Pairs well with this course.
- **C / C++**: what GCC/Clang are written in; maximum control, used for
  production compilers needing speed.

For a first compiler, **Python** (fastest to prototype) or **Rust**
(if you want the ADT/pattern-matching fit and performance) are both
great.

## Parser tools (if not hand-writing)

- **Lex/Flex** (lexer generators): regex token specs → a DFA lexer
  ([Chapter 4](/compiler/part-2-front-end/lexing)).
- **Yacc/Bison** (parser generators): a grammar → an LR parser
  ([Chapter 5](/compiler/part-2-front-end/parsing-and-grammars)).
- **ANTLR**: a popular modern parser generator (LL(*)), good tooling and
  multiple target languages.
- **Hand-written recursive descent + Pratt**
  ([Chapter 6](/compiler/part-2-front-end/recursive-descent-and-pratt)):
  what most production compilers actually use, for control and error
  quality.

For learning, hand-write the lexer and parser — you understand far more.
For big grammars, generators save effort.

## Back-end frameworks

- **LLVM** ([Chapter 19](/compiler/part-5-back-end/targeting-real-machines)):
  the dominant reusable back end. Emit LLVM IR; inherit optimization and
  codegen for every target. Used by Clang, Rust, Swift, Julia. The
  `llvm-sys`/`inkwell` (Rust) and `llvmlite` (Python) bindings let you
  target it.
- **Cranelift**: a simpler, faster (less optimizing) back end in Rust,
  used by Wasmtime and as a Rust debug-build back end. A lighter LLVM
  alternative.
- **WASM** as a target: WebAssembly is a clean, portable bytecode target
  ([Chapter 18](/compiler/part-5-back-end/bytecode-and-vms)) you can emit
  and run anywhere (browsers, Wasmtime).
- **QBE**: a tiny, simple compiler back end — a great LLVM alternative
  for learning (small enough to understand).

For a learning compiler, build your own stack-VM back end first
([Chapter 18](/compiler/part-5-back-end/bytecode-and-vms)); for real
native output, target LLVM, Cranelift, or QBE.

## Inspecting the toolchain

To understand what your compiler's output flows into, inspect real
tools:

- **`gcc -S file.c`** / **`clang -S file.c`**: emit assembly — see what
  a real compiler generates ([Chapter 16](/compiler/part-5-back-end/instruction-selection)).
- **`clang -emit-llvm -S file.c`**: see the LLVM IR
  ([Chapter 9](/compiler/part-3-types-and-ir/intermediate-representation)).
- **`gcc -O2 -S` vs `-O0 -S`**: compare optimized vs unoptimized output
  ([Part IV](/compiler/part-4-optimization/optimization-pipeline)).
- **`objdump -d a.out`**: disassemble a binary — machine code back to
  assembly.
- **godbolt.org (Compiler Explorer)**: *the* tool — paste code, see the
  assembly from any compiler/flags interactively, color-coded to source.
  Indispensable for understanding codegen and optimization.

**Compiler Explorer (godbolt.org)** deserves special mention — it's the
single best tool for *seeing* what compilers do. Use it constantly.

## Debugging and profiling

- **GDB / LLDB**: debuggers — step through compiled code, inspect
  registers and the stack ([Chapter 19](/compiler/part-5-back-end/targeting-real-machines)).
- **Valgrind**: memory-error detection (useful when building a runtime/
  GC, [Chapter 20](/compiler/part-6-runtime/garbage-collection)).
- **perf** (Linux): profile where compiled code spends time.

## Testing a compiler

- **Snapshot/golden tests**: compile inputs, compare output (tokens,
  AST, IR, assembly) against saved expected output.
- **Differential testing**: compare your compiler's output behavior
  against a reference compiler (gcc/clang) on the same programs.
- **Fuzzing**: feed random/mutated programs to find crashes (compilers
  are great fuzz targets; Csmith fuzzes C compilers).
- **The bootstrap fixpoint test** ([Chapter 22](/compiler/part-6-runtime/bootstrapping)):
  if self-hosting, compile yourself twice and compare.

Test each stage in isolation (lexer tokens, parser AST, type-checker
errors) plus end-to-end (does the compiled program produce the right
output?).

## A starter project plan

To build a compiler alongside this course:

1. Pick a language (Python or Rust) and a small source language
   (Goolang-like, [Chapter 2](/compiler/part-1-foundations/source-and-target)).
2. **Lexer** ([Ch 4](/compiler/part-2-front-end/lexing)) — test the
   token stream.
3. **Parser** ([Ch 5–6](/compiler/part-2-front-end/parsing-and-grammars))
   — test the AST.
4. **Type checker** ([Ch 8](/compiler/part-3-types-and-ir/type-checking))
   — test error detection.
5. **IR + a stack-VM back end** ([Ch 9–10](/compiler/part-3-types-and-ir/intermediate-representation),
   [Ch 18](/compiler/part-5-back-end/bytecode-and-vms)) — *run* programs!
6. Add **optimizations** ([Part IV](/compiler/part-4-optimization/optimization-pipeline))
   and, if ambitious, a **native back end** via LLVM
   ([Ch 19](/compiler/part-5-back-end/targeting-real-machines)).

Reaching step 5 — a compiler that runs real programs — is the big
milestone. Everything after is enhancement.
