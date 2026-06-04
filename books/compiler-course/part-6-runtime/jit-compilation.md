---
sidebar_position: 2
title: "JIT Compilation"
---

# JIT Compilation

> Compiling at runtime. A JIT interprets first, then compiles hot code
> to native on the fly — blending bytecode's portability with native
> code's speed, and exploiting runtime information a static compiler
> never has.

So far we've assumed **ahead-of-time** (AOT) compilation: compile fully,
then run. **Just-in-time** (JIT) compilation does it differently —
compile *during* execution, when it pays off. JITs power the JVM,
JavaScript engines (V8), .NET, PyPy, and LuaJIT. This chapter explains
how and why.

## 1. AOT vs JIT

- **AOT** (C, Rust, Go): compile the whole program to native code
  before running. Fast execution from the start; no runtime
  compilation cost; but no runtime information to exploit.
- **JIT**: ship bytecode ([Chapter 18](/compiler/part-5-back-end/bytecode-and-vms))
  or source; **compile to native at runtime**, typically only the hot
  parts, after observing how the program actually runs.

The JIT's pitch: combine bytecode's **portability** (ship one bytecode,
JIT to whatever machine runs it) with native code's **speed** (hot code
runs as fast as AOT), *plus* the ability to optimize using **runtime
information** an AOT compiler can't have (actual types, actual branch
frequencies, actual hot paths).

## 2. The tiered execution model

A typical JIT runs code through **tiers** of increasing optimization:

1. **Interpreter / baseline**: start by interpreting bytecode (or doing
   a quick, unoptimized native compile). Fast to start, slow to run.
2. **Profiling**: while running, count how often each function/loop
   executes and record observed types/branches.
3. **Optimizing JIT**: when code is **hot** (executed enough to be
   worth it), compile it to *optimized* native code, using the profile.

```
cold code:  interpreted (cheap, no compile cost)
hot code:   compiled to optimized native (worth the cost)
```

This is **adaptive optimization**: spend compilation effort only where
it pays off (hot code), informed by profiling. Cold code never gets
compiled (compiling it would waste time); hot code gets the full
treatment. V8, HotSpot (JVM), and .NET all work this way, often with
multiple optimizing tiers.

> :surprisedgoose: The JIT insight is that *most code doesn't matter*
> for performance — programs spend ~90% of their time in ~10% of the
> code (or less). So interpret everything cheaply, find the hot 10% by
> profiling, and lavish optimization only on it. Compiling the cold 90%
> would cost more than it saves. This "be lazy, then optimize what's
> hot" strategy is why JITs can start fast *and* run fast — they don't
> pay the compile cost for code that runs once.

## 3. Speculative optimization

The JIT's superpower over AOT: it **observes runtime behavior** and
optimizes *speculatively* based on it. Examples:

- **Type specialization**: in a dynamically-typed language (JS, Python),
  a function `add(a, b)` could take any types. The AOT compiler must
  handle all cases (slow). The JIT *observes* that `add` is always
  called with integers, and compiles a fast integer-only version —
  **speculating** that the pattern continues.
- **Inlining hot calls**: inline a frequently-called function (or a
  polymorphic call site that's observed to be monomorphic — always the
  same target).
- **Branch optimization**: lay out code so the observed-common branch
  is the fall-through (fast) path.

These optimizations *assume* observed behavior continues. They're
**speculative** — and need a safety net.

## 4. Deoptimization

The safety net for speculation: **deoptimization** (deopt). The JIT's
specialized code includes **guards** checking the assumptions hold
(e.g., "are the arguments still integers?"). If a guard fails (someone
calls the integer-specialized `add` with strings), the JIT **bails out**
— discards the specialized code and falls back to the interpreter (or a
less-specialized version), then re-optimizes if a new pattern emerges.

```
optimized add(a, b):
    guard: a is int and b is int    ← if this fails, deoptimize
    (fast integer add)
    
on guard failure: 
    discard this code, resume in the interpreter with the actual values
```

Deoptimization is what makes speculation *safe*: the JIT can bet
aggressively on observed behavior because if the bet is wrong, it
correctly falls back. This is intricate (you must reconstruct the
interpreter's state at the deopt point) but it's the key to JITs being
both fast and correct on dynamic languages.

## 5. The mechanics: emitting code at runtime

A JIT must **generate machine code into memory and execute it** while
the program runs:

1. Generate native instruction bytes (the codegen of
   [Chapters 16–17](/compiler/part-5-back-end/instruction-selection), but
   producing bytes, not assembly text — there's no time to invoke an
   external assembler).
2. Write them into a region of memory marked **executable**
   (`mmap`/`VirtualAlloc` with execute permission).
3. **Jump** to that memory to run the compiled code (often via a
   function pointer).

This requires OS support for executable memory (and care: W^X policies,
which forbid memory that's both writable and executable, mean you write
then flip to executable). Generating code at runtime is the defining
capability of a JIT — and why JIT codegen emits bytes directly
([Chapter 16 §7](/compiler/part-5-back-end/instruction-selection)).

## 6. Profile-guided optimization (the AOT cousin)

You can get *some* JIT benefits in AOT via **profile-guided
optimization** (PGO): compile once with instrumentation, run on
representative workloads to collect a profile, then recompile using the
profile to optimize hot paths and likely branches. It captures the
"optimize based on observed behavior" idea without runtime compilation —
but with a stale, offline profile rather than the JIT's live one. PGO is
how AOT compilers (GCC, Clang) borrow the JIT's profiling insight.

## 7. JIT trade-offs

JITs aren't free:

- **Warm-up**: the program starts slow (interpreting) and speeds up as
  hot code gets compiled. Bad for short-lived programs (a CLI that runs
  for 50ms never warms up) — a known JVM/JS complaint.
- **Memory**: the JIT, the profiler, and the compiled code all consume
  memory at runtime.
- **Complexity**: tiered compilation + speculation + deoptimization is
  *hard* to implement correctly. JIT bugs are notoriously subtle.
- **Unpredictability**: compilation pauses and deopts make timing less
  predictable (bad for real-time/latency-sensitive code).

For long-running programs (servers, browsers) the JIT's steady-state
speed wins. For short-lived or latency-critical programs, AOT is often
better (hence Java's GraalVM native-image, which AOT-compiles to avoid
warm-up). It's a workload-dependent trade.

## 8. When to JIT

The landscape:

- **AOT** (C, Rust, Go): predictable, fast-start, no runtime
  compilation. Best for systems software, CLIs, latency-critical code.
- **JIT** (JVM, V8/JS, .NET, PyPy, LuaJIT): fast steady-state, exploits
  runtime info (essential for *dynamic* languages where types aren't
  known until runtime), portable. Best for long-running programs and
  dynamic languages.
- **Both**: many ecosystems offer both (GraalVM AOT vs JIT for the JVM;
  .NET ReadyToRun).

For *your* compiler, a JIT is an advanced project — build the AOT
bytecode VM ([Chapter 18](/compiler/part-5-back-end/bytecode-and-vms))
first, then a JIT is "compile hot bytecode to native at runtime" on top
of it. Understanding the JIT model (interpret → profile → compile hot →
guard → deopt) is valuable even if you don't build one.

> :weightliftinggoose: A JIT compiles at runtime: interpret cheaply,
> profile to find hot code, compile the hot 10% to optimized native
> using runtime information (types, branches), guard the speculative
> assumptions, and **deoptimize** when they fail. It blends bytecode
> portability with native speed and beats AOT on dynamic languages by
> exploiting runtime info AOT can't see. The cost is warm-up, memory,
> and serious complexity. Build AOT first; the JIT is the master class.

## What we covered

- **AOT** (compile then run) vs **JIT** (compile *during* execution,
  hot code only).
- The JIT blends bytecode **portability** with native **speed**, plus
  **runtime information** (types, branch frequencies) AOT lacks.
- **Tiered execution**: interpret cold code, profile, compile hot code
  to optimized native — adaptive optimization spending effort where it
  pays.
- **Speculative optimization** (type specialization, inlining) based on
  observed behavior; essential for dynamic languages.
- **Deoptimization**: guards check assumptions; on failure, bail back
  to the interpreter — making speculation safe.
- Mechanics: generate machine-code **bytes into executable memory** and
  jump to it.
- **PGO** is AOT's offline-profile cousin.
- Trade-offs: warm-up, memory, complexity, unpredictability — JIT wins
  for long-running/dynamic, AOT for short-lived/latency-critical.

## What's next

[Chapter 22](/compiler/part-6-runtime/bootstrapping) — bootstrapping and
self-hosting. The final topic: writing a compiler for a language *in
that language*, the bootstrapping chicken-and-egg problem, and the
deep satisfaction of a self-hosting compiler.
