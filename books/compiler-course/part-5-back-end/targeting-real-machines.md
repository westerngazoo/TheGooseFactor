---
sidebar_position: 4
title: "Targeting Real Machines"
---

# Targeting Real Machines

> The hardest back end, and the shortcut. Emitting actual x86/ARM
> assembly means confronting calling conventions, the machine stack,
> and memory layout — or you go through LLVM and let it handle the
> machine details.

Bytecode ([Chapter 18](/compiler/part-5-back-end/bytecode-and-vms)) was
the easy target. **Native machine code** is the hardest — and the
fastest. This chapter surveys what targeting real hardware requires
(the machine model, calling conventions, the stack) and the pragmatic
shortcut most modern compilers take: **LLVM**.

## 1. What changes when you go native

A real CPU (x86-64, ARM64) imposes constraints a VM didn't:

- **Real registers** (16-ish), so **register allocation** is mandatory
  ([Chapter 17](/compiler/part-5-back-end/register-allocation)).
- **A real instruction set** with quirks (x86's complex encoding, flags,
  two-operand forms; ARM's load-store discipline).
- **A calling convention** (the ABI) you *must* obey to interoperate
  with the OS and libraries.
- **A real stack** with a specific layout and discipline.
- **Memory layout**: how data, code, stack, and heap are arranged.
- **An assembler and linker** to turn your output into an executable.

Each is a source of detail and potential bugs. Native codegen is where
"it works on my VM" meets the unforgiving reality of hardware.

## 2. The machine model

A CPU executes instructions that operate on **registers** and
**memory**:

- **General-purpose registers** (`rax`, `rbx`, ... on x86-64): fast,
  few, the working set.
- **Special registers**: stack pointer (`rsp`), base/frame pointer
  (`rbp`), instruction pointer (`rip`), flags.
- **Memory**: a flat address space; load/store moves data between
  registers and memory.
- **Flags**: comparisons set condition flags; conditional jumps read
  them.

Your codegen ([Chapter 16](/compiler/part-5-back-end/instruction-selection))
emits instructions in this model, and register allocation
([Chapter 17](/compiler/part-5-back-end/register-allocation)) assigns
the real registers. The IR's abstract operations become concrete `mov`,
`add`, `cmp`, `jmp`, `call`.

## 3. The calling convention (ABI)

The **calling convention** is the binding contract for function calls —
how arguments pass, results return, and registers are preserved. On
x86-64 System V (Linux/macOS):

- **Arguments**: first six integer args in `rdi, rsi, rdx, rcx, r8,
  r9`; more on the stack.
- **Return value**: in `rax`.
- **Caller-saved registers** (`rax, rcx, rdx, rsi, rdi, r8–r11`): the
  caller must save them if it needs them after a call (the callee may
  clobber them).
- **Callee-saved registers** (`rbx, rbp, r12–r15`): the callee must
  preserve them (save on entry, restore on exit).
- **Stack alignment**: `rsp` must be 16-byte aligned at calls.

Your compiler *must* follow this exactly — it's how your code calls
libc, the OS calls your `main`, and separately-compiled functions
interoperate. Getting the ABI wrong produces code that crashes
mysteriously at call boundaries. It's a fixed protocol, not a choice.

> :nerdygoose: The calling convention is why you can link object files
> from different compilers and languages — they all agree on the ABI.
> Your Rust code calls a C library because both follow the platform's C
> calling convention. The ABI is the *lingua franca* of compiled code,
> standardized per platform (System V on Linux/macOS, a different one on
> Windows). It's also remarkably stable — the System V x86-64 ABI has
> been fixed for ~20 years, because changing it would break every
> compiled binary. Stability is the whole point of a *convention*.

## 4. The stack frame

Each function call gets a **stack frame** on the machine stack — a
region holding its saved registers, local variables, and spilled values
([Chapter 17](/compiler/part-5-back-end/register-allocation)). The
function's **prologue** sets it up and **epilogue** tears it down:

```asm
my_function:
    push rbp              ; prologue: save caller's frame pointer
    mov  rbp, rsp         ; establish our frame pointer
    sub  rsp, 32          ; allocate 32 bytes for locals/spills
    ...
    ... body ...
    ...
    mov  rsp, rbp         ; epilogue: deallocate locals
    pop  rbp              ; restore caller's frame pointer
    ret                   ; return (pop return address, jump)
```

The stack **grows downward** (toward lower addresses); `rsp` points at
the top. The frame pointer `rbp` gives a stable base for accessing
locals (`[rbp - 8]`, `[rbp - 16]`, ...). The `call` instruction pushed
the return address; `ret` pops it. This frame discipline implements
function calls and recursion at the hardware level — the machine
counterpart of the VM's call frames
([Chapter 18](/compiler/part-5-back-end/bytecode-and-vms)).

## 5. Memory layout

The OS lays out a running program's address space:

- **Code (text)**: the machine instructions (read-only, executable).
- **Data**: global/static variables (initialized and zero-initialized
  "bss").
- **Heap**: dynamically allocated memory, grows upward (managed by the
  allocator / GC, [Chapter 20](/compiler/part-6-runtime/garbage-collection)).
- **Stack**: function frames, grows downward.

The compiler decides where globals live, how structs are laid out
(field offsets, alignment, padding), and emits the right addresses. The
linker assigns final addresses and resolves references between compiled
units. Memory layout is where the compiler's abstract "variables and
objects" become concrete addresses.

## 6. The assembler and linker

The compiler emits **assembly** (text); the **assembler** turns it into
an **object file** (machine-code bytes + relocation info); the
**linker** combines object files (+ libraries) into an **executable**,
resolving cross-references and assigning final addresses:

```
your.c → [compiler] → your.s → [assembler] → your.o → [linker] → a.out
                                                  + libc.a, etc.
```

Most compilers don't reimplement the assembler and linker — they emit
assembly and invoke the system's `as` and `ld` (or `gcc`/`clang` as a
driver). Your compiler's job ends at emitting correct assembly; the
toolchain ([appendix](/compiler/appendix/toolchain)) does the rest.

## 7. The LLVM shortcut

Here's the pragmatic truth: **most modern compilers don't emit machine
code directly — they emit LLVM IR and let LLVM do the back end.**

LLVM is a mature, reusable compiler back end. You generate **LLVM IR**
(a target-neutral SSA IR, [Chapter 9](/compiler/part-3-types-and-ir/intermediate-representation)),
and LLVM handles: optimization (its huge pass suite,
[Part IV](/compiler/part-4-optimization/optimization-pipeline)),
instruction selection, register allocation, calling conventions, and
emitting machine code for *dozens* of targets (x86, ARM, RISC-V, WASM,
...). You write a front end + LLVM-IR generator; LLVM is the back end.

This is how Rust, Swift, Clang, Julia, and many others work. The
trade-off: you depend on LLVM (a large dependency) and must learn its
IR, but you get world-class optimization and every target "for free."
For a *learning* compiler, hand-writing the back end teaches the most;
for a *real* compiler, LLVM is almost always the right call.

> :surprisedgoose: The reason so many languages launched quickly in the
> 2010s (Rust, Swift, Julia, Crystal, Zig) is *LLVM*. Before LLVM,
> writing a production-quality optimizing back end with multiple targets
> took years. LLVM made it: write a front end, emit LLVM IR, and inherit
> a battle-tested optimizer and code generators for every architecture.
> It democratized language creation. The "narrow waist" IR architecture
> ([Chapter 1](/compiler/part-1-foundations/what-is-a-compiler)) became
> an *industry-shared* waist.

## 8. Native vs bytecode: choosing

Pulling Part V together, the back-end choice:

- **Stack-VM bytecode** ([Chapter 18](/compiler/part-5-back-end/bytecode-and-vms)):
  easiest, portable, no register allocation; interpreted (slower).
  Great first compiler; how Python/Java/Lua ship (+ JIT).
- **Native via LLVM**: emit LLVM IR, inherit optimization + all targets.
  Fast, real, moderate effort. How Rust/Swift/Clang ship.
- **Native by hand**: emit assembly yourself — most educational, most
  work; you confront ABI, stack frames, register allocation directly.

For learning: build the bytecode VM first (complete, satisfying), then
optionally hand-write a native back end for one architecture to truly
understand the machine, *then* appreciate why production uses LLVM. The
path bytecode → hand-native → LLVM is a great learning arc.

> :weightliftinggoose: Targeting real machines means obeying the
> machine model (registers, memory, flags), the **calling convention**
> (the ABI — non-negotiable), **stack frames** (prologue/epilogue,
> grows down), and **memory layout**, then emitting assembly for an
> assembler+linker to finish. It's the hardest back end — which is why
> most real compilers emit **LLVM IR** and let LLVM handle it. Build
> bytecode first to *run* programs; go native (by hand or via LLVM) to
> go *fast*. Either way, you've now seen IR become real instructions.

## What we covered

- Native codegen adds: real registers (mandatory register allocation),
  a real ISA, a **calling convention**, a real stack, memory layout, an
  assembler + linker.
- The **machine model**: general/special registers, flat memory,
  flags; load/store.
- The **calling convention (ABI)**: argument/return registers,
  caller/callee-saved, stack alignment — a fixed contract enabling
  cross-language linking.
- **Stack frames**: prologue (save `rbp`, allocate locals) / epilogue
  (restore, `ret`); stack grows down; `rbp`-relative local access.
- **Memory layout**: text/data/heap/stack; the linker assigns final
  addresses.
- The **assembler** (→ object file) and **linker** (→ executable);
  compilers emit assembly and invoke the toolchain.
- The **LLVM shortcut**: emit LLVM IR, inherit optimization + all
  targets — how Rust/Swift/Clang/Julia work; democratized language
  creation.
- Choosing: bytecode (easiest, run programs), native-via-LLVM (fast,
  real), native-by-hand (most educational).

## What's next

That closes Part V — IR becomes machine code. [Part VI](/compiler/part-6-runtime/garbage-collection)
covers what compiled code needs *around* it: the runtime — garbage
collection, JIT compilation, and bootstrapping a self-hosting compiler.
