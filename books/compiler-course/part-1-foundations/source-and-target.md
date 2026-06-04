---
sidebar_position: 2
title: "The Source and the Target"
---

# The Source and the Target

> Concrete endpoints for the pipeline. We define **Goolang** (the
> small language we'll compile) and survey the **targets** we can
> compile to — machine code, bytecode, or another language.

A compiler needs a precise source language (what it reads) and a
target (what it emits). This chapter pins both down so the rest of the
course has something concrete to chew on.

## 1. Goolang: the source language

We'll compile **Goolang** — a small, C-like, statically-typed language
with just enough features to exercise every compiler stage without
drowning in special cases. Its features:

- **Integer and boolean types** (we'll keep it to `int` and `bool`;
  adding more types is a known extension).
- **Variables** with declarations and assignment.
- **Arithmetic and comparison** operators (`+ - * / == < > ...`).
- **Functions** with parameters, return values, and recursion.
- **Conditionals** (`if`/`else`) and **loops** (`while`).
- **Blocks** and **lexical scope**.

A sample Goolang program — recursive factorial:

```c
fn factorial(n: int) -> int {
    if n == 0 {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}

fn main() -> int {
    return factorial(5);   // 120
}
```

This is deliberately C/Rust-flavored: curly braces, typed parameters,
explicit returns. It's small enough to fully implement and rich enough
to require real lexing, parsing, type checking, control flow,
function calls, and recursion — every stage gets a workout.

> :nerdygoose: Choosing the *right* toy language is a real skill.
> Too small (just arithmetic) and you skip the interesting parts
> (functions, control flow, scope). Too big (generics, closures,
> modules) and you spend all your time on edge cases instead of
> learning the pipeline. Goolang hits the sweet spot: functions +
> recursion + control flow + types, nothing more. Every feature
> teaches a stage; nothing is there just for completeness.

## 2. What a compiler must understand about the source

To compile Goolang, the compiler must grasp, in increasing depth:

- **Lexical structure**: what are the tokens? (`fn`, `factorial`, `(`,
  `n`, `:`, `int`, ...) — [Chapter 4](/compiler/part-2-front-end/lexing).
- **Syntactic structure**: how do tokens form expressions,
  statements, functions? — [Chapter 5](/compiler/part-2-front-end/parsing-and-grammars).
- **Semantic structure**: which `n` does each use refer to? Is
  `factorial(n - 1)` well-typed? — [Chapter 7–8](/compiler/part-2-front-end/ast-and-semantic-analysis).

Each level is a stage. The source language's *definition* (its grammar
and type rules) drives what each stage must do. Defining Goolang
precisely *is* specifying the front end's job.

## 3. The targets: what we compile to

There are three broad target choices, from highest to lowest level:

**1. Another high-level language** ("transpiling"). Emit C, or
JavaScript. Easiest back end — you reuse another compiler's hard work.
(TypeScript → JS, many languages → C.) Downside: you inherit the
target language's model and limits.

**2. Bytecode for a virtual machine.** Emit instructions for a VM you
control (or an existing one: JVM, .NET CLR, WASM). Moderate effort,
portable, the VM handles the messy machine details. (Java, C#, Python,
Lua.) — [Chapter 18](/compiler/part-5-back-end/bytecode-and-vms).

**3. Native machine code.** Emit real x86/ARM assembly (or go through
LLVM IR). Maximum performance, maximum effort — you handle registers,
calling conventions, memory layout. (C, C++, Rust, Go.) —
[Chapter 19](/compiler/part-5-back-end/targeting-real-machines).

We'll do **bytecode first** (Part V, easier and fully under our
control) and then cover **native code** (the real-machine concerns).
Bytecode teaches the codegen concepts cleanly; native code adds the
hardware reality.

## 4. The target's model shapes the back end

The target dictates what the back end must produce:

- **A stack VM** (like the JVM or CPython): instructions push/pop an
  operand stack. `a + b` becomes `push a; push b; add`. Simple to
  generate code for (no register allocation) — [Chapter 18](/compiler/part-5-back-end/bytecode-and-vms).
- **A register machine** (like real CPUs, or register-based VMs like
  Lua): instructions operate on named registers. `a + b` becomes
  `add r3, r1, r2`. Requires **register allocation**
  ([Chapter 17](/compiler/part-5-back-end/register-allocation)) — mapping
  the program's unlimited values onto the machine's limited registers.
- **Real hardware** (x86, ARM): a register machine with a specific
  instruction set, calling conventions, and memory model. The most
  constraints.

The compiler's IR ([Chapter 9](/compiler/part-3-types-and-ir/intermediate-representation))
is usually designed to be *target-neutral* — it assumes unlimited
"virtual registers" — and the back end maps it onto whatever the
target offers. This keeps optimization target-independent.

## 5. The runtime: what the target needs around it

Compiled code rarely runs in a vacuum. It needs a **runtime** — support
code present when the program executes:

- **Memory management**: allocating and freeing memory, possibly
  **garbage collection** ([Chapter 20](/compiler/part-6-runtime/garbage-collection)).
- **The call stack**: managing function calls, locals, returns
  (calling conventions).
- **Standard library**: I/O, basic operations the language provides.
- **Startup code**: setting up before `main` runs.

For Goolang we'll keep the runtime minimal (integers, a stack, simple
I/O), but understanding that compiled code depends on a runtime is
essential — the compiler and runtime are co-designed. A garbage
collector, for instance, constrains how the compiler lays out objects
and tracks pointers.

## 6. Calling conventions: a preview

One target detail worth flagging early: the **calling convention** —
the contract for how functions pass arguments, return values, and
preserve registers. On x86-64, the System V convention puts the first
arguments in specific registers (`rdi`, `rsi`, ...), returns in `rax`,
and designates caller/callee-saved registers.

The compiler *must* follow the target's calling convention so its code
interoperates with the OS and other compiled code. It's a fixed
contract the back end obeys. We'll meet it in detail when targeting
real machines ([Chapter 19](/compiler/part-5-back-end/targeting-real-machines));
for now, know that "how function calls work at the machine level" is a
specified protocol, not a free choice.

## 7. Defining the language precisely

Before building a front end, you write down the language's definition:

- **The grammar** (syntax): a set of rules — usually in BNF/EBNF —
  saying how tokens combine into valid programs
  ([Chapter 5](/compiler/part-2-front-end/parsing-and-grammars)).
- **The type rules** (static semantics): which programs are
  well-typed ([Chapter 8](/compiler/part-3-types-and-ir/type-checking)).
- **The semantics** (dynamic): what programs *do* when run.

For Goolang, the grammar is a page of EBNF, the type rules a handful
of inference rules, the semantics "the obvious C-like behavior." A
precise definition is the spec your compiler implements — and the
oracle for testing it. We'll write Goolang's grammar in
[Chapter 5](/compiler/part-2-front-end/parsing-and-grammars).

> :weightliftinggoose: Pin down your source and target before writing
> a line of compiler. Know your language's grammar and type rules
> (the front end's spec) and your target's model — stack VM vs register
> machine vs native (the back end's spec). The endpoints define the
> job. Goolang → bytecode is our concrete task; everything in the
> course serves that translation, then generalizes.

## What we covered

- **Goolang**: our source language — C-like, statically typed,
  with int/bool, variables, arithmetic, functions+recursion,
  if/while, scope. Small but exercises every stage.
- The compiler must understand the source at three levels: lexical,
  syntactic, semantic — each a front-end stage.
- **Targets**: another high-level language (transpile), bytecode for a
  VM, or native machine code — increasing effort and performance.
- The target's **model** (stack VM vs register machine vs hardware)
  shapes the back end; register machines need register allocation.
- Compiled code needs a **runtime**: memory management/GC, the call
  stack, stdlib, startup.
- **Calling conventions** are the fixed contract for machine-level
  function calls; the back end must obey the target's.
- Define the language precisely (grammar + type rules + semantics)
  before building — it's the spec and the test oracle.

## What's next

[Chapter 3](/compiler/part-1-foundations/phases-end-to-end) — the
phases, end to end. We trace one tiny Goolang expression through every
stage of the pipeline, so you see the whole machine work before we
build each part in detail.
