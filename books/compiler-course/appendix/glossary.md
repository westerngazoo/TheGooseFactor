---
sidebar_position: 2
title: "Appendix B — Glossary"
---

# Appendix B — Glossary

Quick definitions of the terms used throughout the course.

## Pipeline & front end

**Abstract syntax tree (AST)** — a tree representing a program's
structure, with surface-syntax noise (parens, etc.) removed; the
front end's central data structure.

**Back end** — the compiler stages that produce target code: IR
generation, optimization, code generation.

**Compiler** — a program that translates a program from a source
language to a target language (usually machine code or bytecode).

**Front end** — the stages that understand the source language: lexing,
parsing, semantic analysis.

**Lexer (scanner, tokenizer)** — converts source text into a stream of
tokens.

**Maximal munch** — the lexer rule of consuming the longest valid token.

**Parser** — arranges tokens into an AST according to the grammar.

**Parse tree (concrete syntax tree)** — a tree with every grammar rule
represented; the AST is its distilled form.

**Recursive descent** — a top-down parsing technique where each grammar
nonterminal becomes a parse function.

**Pratt parsing** — operator-precedence parsing using binding-power
numbers; handles expression precedence with one function.

**Semantic analysis** — checking context-sensitive correctness (name
resolution, types) that the grammar can't express.

**Symbol table** — a stack of scopes mapping names to declarations; used
for name resolution.

**Token** — a lexical unit (keyword, identifier, literal, operator) with
a kind, value, and source location.

## Grammars & parsing theory

**Context-free grammar (CFG)** — production rules defining valid
programs; expresses nesting; recognized by pushdown automata.

**EBNF** — Extended Backus-Naur Form; grammar notation with `* + ? | ()`.

**LL / LR** — top-down (LL) vs bottom-up (LR) parser classes,
parameterized by lookahead.

**Regular language** — the class lexing handles; recognized by finite
automata.

## Types & IR

**Three-address code (TAC)** — IR where each instruction has a result
and ≤2 source operands; uses virtual-register temporaries.

**Intermediate representation (IR)** — the compiler's internal program
form, between source and target; designed for analysis.

**SSA (Static Single Assignment)** — IR form where every variable is
assigned exactly once; uses φ-functions at control-flow merges.

**φ-function (phi)** — an SSA pseudo-instruction at a merge point that
selects a value based on the incoming control-flow path.

**Lowering** — translating from a higher-level representation to a
lower-level one (AST → IR, or HIR → MIR → LIR).

**Desugaring** — translating convenient surface constructs into simpler
core ones (`for` → `while`).

**Type checking** — verifying operations get compatible-type operands;
annotates the AST with types.

**Type inference** — deducing types without annotations (e.g.,
Hindley-Milner via constraint solving / unification).

## Control flow & optimization

**Basic block** — a maximal straight-line instruction sequence (single
entry, single exit).

**Control-flow graph (CFG)** — basic blocks as nodes, control transfers
as edges.

**Dominance** — block A dominates B if every path to B passes through A.

**Data-flow analysis** — computing facts across the CFG (liveness,
reaching definitions, available expressions) via fixpoint iteration.

**Liveness** — whether a value's current value will be used later;
drives register allocation and DCE.

**Pass** — one optimization (analysis or transformation) over the IR;
the optimizer is a pipeline of passes.

**Phase-ordering problem** — the intractable question of the best order
(and repetition) of optimization passes.

**Constant folding** — evaluating constant expressions at compile time.

**Dead-code elimination (DCE)** — removing instructions whose results
are unused.

**Common-subexpression elimination (CSE)** — computing a repeated
expression once.

**Strength reduction** — replacing expensive ops with cheaper ones
(`*2` → `<<1`).

**Loop-invariant code motion (LICM)** — hoisting loop-invariant
computations out of loops.

**SCCP** — sparse conditional constant propagation; constants +
reachability fused.

**Global value numbering (GVN)** — SSA-based CSE via value numbers.

**Inlining** — replacing a function call with the function's body.

## Back end & runtime

**Instruction selection** — mapping IR operations to target
instructions (often by tree pattern matching).

**Register allocation** — mapping virtual registers to physical ones;
solved as graph coloring; spills to memory when out of registers.

**Interference graph** — values as nodes, edges between simultaneously-
live values; coloring it allocates registers.

**Spilling** — keeping a value in memory rather than a register
(load/store around uses) when registers run out.

**Calling convention (ABI)** — the contract for function calls
(argument/return registers, caller/callee-saved, stack layout).

**Stack frame** — a function's region on the machine stack (saved
registers, locals, spills); set up by prologue, torn down by epilogue.

**Bytecode** — a virtual machine's instruction set; emitted by the
compiler, executed by the VM.

**Virtual machine (VM)** — a software "CPU" that executes bytecode;
stack-based (operand stack) or register-based.

**Garbage collection (GC)** — automatic reclamation of unreachable
memory; reference counting (misses cycles) or tracing (mark-sweep,
copying, generational).

**JIT (just-in-time) compilation** — compiling at runtime, typically hot
code, using profiling and speculation (with deoptimization as a
fallback).

**Deoptimization** — bailing from speculatively-optimized JIT code back
to the interpreter when an assumption (guard) fails.

**AOT (ahead-of-time)** — compiling fully before running (vs JIT).

**Bootstrapping** — building a self-hosting compiler by first writing
version 0 in another language.

**Self-hosting** — a compiler written in the language it compiles.

**Cross-compilation** — compiling on one machine to produce code for
another.
