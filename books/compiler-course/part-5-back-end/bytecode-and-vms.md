---
sidebar_position: 3
title: "Bytecode and Virtual Machines"
---

# Bytecode and Virtual Machines

> The simpler back-end target. A stack-based VM needs no register
> allocation — values live on an operand stack — making bytecode the
> easiest path from IR to running code. We design a bytecode and the VM
> that runs it.

Targeting real hardware ([Chapter 19](/compiler/part-5-back-end/targeting-real-machines))
is the hardest back end. **Bytecode** for a **virtual machine** is the
easiest — and it's how Python, Java, C#, Lua, and many languages ship.
This chapter designs a stack-based bytecode and its VM, the gentlest way
to make compiled code run.

## 1. What bytecode is

**Bytecode** is the instruction set of a **virtual machine** — a
software-defined "CPU." Instead of emitting x86/ARM, the compiler emits
bytecode, and a VM (an interpreter you write) executes it. Bytecode
instructions are simple, compact (often one byte for the opcode — hence
"bytecode"), and *portable*: the same bytecode runs anywhere the VM
runs.

```
PUSH 5          ; push constant 5
LOAD x          ; push the value of variable x
ADD             ; pop two, push their sum
STORE y         ; pop, store into y
```

The compiler's back end becomes "emit bytecode," and a separate VM
"executes bytecode." This splits the hard problem (run on real
hardware) into two easy ones (emit simple bytecode; write a VM).

## 2. Stack machine vs register machine

VMs come in two flavors ([Chapter 2](/compiler/part-1-foundations/source-and-target)):

- **Stack machine** (JVM, CPython, WASM): instructions operate on an
  **operand stack**. `ADD` pops two values, pushes their sum. No
  registers, no register allocation — operands are implicit (top of
  stack). **Simplest to generate code for.**
- **Register machine** (Lua VM, Dalvik): instructions name **virtual
  registers**. `ADD r3, r1, r2`. Fewer instructions (no
  push/pop overhead) and often faster, but codegen needs register
  allocation ([Chapter 17](/compiler/part-5-back-end/register-allocation)).

We'll use a **stack machine** — the simplest. Its great advantage:
**code generation is trivial** because the stack handles operand
storage automatically (no allocation needed). This is why stack VMs are
the standard teaching target and a common production choice.

## 3. Generating stack bytecode is trivial

For a stack machine, codegen is a simple post-order tree walk: emit code
for operands (pushing their values), then the operator (consuming them).
The expression `(a + b) * c`:

```
LOAD a          ; stack: [a]
LOAD b          ; stack: [a, b]
ADD             ; stack: [a+b]
LOAD c          ; stack: [a+b, c]
MUL             ; stack: [(a+b)*c]
```

The post-order traversal *naturally* produces correct stack code: visit
children (push operands), then visit the node (emit the op that consumes
them). No temporaries to name, no registers to allocate — the stack
*is* the temporary storage. Compare to register-machine codegen
([Chapter 16](/compiler/part-5-back-end/instruction-selection)) which
needs register allocation; stack codegen is just a tree walk emitting
push/op. This simplicity is the stack VM's killer feature.

> :surprisedgoose: The reason a stack machine needs no register
> allocation: the operand stack *is* an infinite pool of "registers"
> that you access in last-in-first-out order, which exactly matches how
> expression evaluation works (innermost subexpression evaluated last
> before its operator). Post-order traversal + a stack = correct code,
> automatically. The hard problem of register allocation
> ([Chapter 17](/compiler/part-5-back-end/register-allocation)) simply
> *doesn't exist* for stack VMs. That's why building a stack-VM compiler
> is a great first complete compiler — you skip the hardest back-end
> stage.

## 4. The bytecode instruction set

A small stack-VM instruction set for Goolang:

```
PUSH n          push constant n
LOAD slot       push local variable at slot
STORE slot      pop, store into local variable slot
ADD SUB MUL DIV pop two operands, push the result
EQ LT GT        pop two, push boolean comparison result
JUMP addr       unconditional jump to bytecode address
JUMP_IF_FALSE addr   pop; if false, jump to addr
CALL func nargs call a function
RETURN          return from the current function
POP             discard the top of stack
```

Each is one opcode plus maybe an operand (a constant, a slot index, a
jump address). Control flow uses `JUMP`/`JUMP_IF_FALSE` to bytecode
addresses (the lowered jumps/branches from
[Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir) become these).
Function calls use `CALL`/`RETURN` with a call frame (below).

## 5. The VM: a dispatch loop

The VM that executes bytecode is a **loop** that fetches the current
instruction, dispatches on its opcode, and acts — the runtime
counterpart of the compiler:

```
function run(bytecode):
    stack = []
    ip = 0                          # instruction pointer
    while true:
        instr = bytecode[ip]; ip += 1
        switch instr.opcode:
            PUSH:  stack.push(instr.operand)
            LOAD:  stack.push(locals[instr.operand])
            STORE: locals[instr.operand] = stack.pop()
            ADD:   b = stack.pop(); a = stack.pop(); stack.push(a + b)
            JUMP:  ip = instr.operand
            JUMP_IF_FALSE: if not stack.pop(): ip = instr.operand
            CALL:  ... set up a call frame ...
            RETURN: ... pop the call frame, push result ...
            ...
```

This **fetch-decode-execute** loop is the VM's heart — exactly how a
real CPU works, in software. The operand stack holds intermediate
values; `locals` holds variables; `ip` tracks position. Add a **call
stack** of frames (each with its own locals and return address) for
function calls, and you have a complete VM.

## 6. Call frames

Function calls need a **call stack** of **frames**. Each frame holds the
called function's locals, its return address (where to resume in the
caller), and a base pointer into the operand stack:

```
CALL: 
    push a new frame (save return ip, allocate locals for the callee)
    ip = function's bytecode start
RETURN:
    result = stack.pop()
    pop the frame (restore the caller's ip)
    stack.push(result)
```

This mirrors how real hardware manages function calls (the machine
stack, [Chapter 19](/compiler/part-5-back-end/targeting-real-machines)),
but you control it entirely in software — simpler and safer. Recursion
works naturally: each recursive call pushes a new frame. The call-stack
depth limit (stack overflow) is just how many frames you allow.

## 7. Why bytecode VMs are everywhere

The stack-VM/bytecode approach powers a huge fraction of real languages:

- **Portability**: bytecode runs anywhere the VM is ported — "write
  once, run anywhere" (Java's pitch).
- **Simplicity**: no register allocation, no per-architecture codegen —
  one back end (emit bytecode), one VM per platform.
- **Safety/sandboxing**: the VM mediates execution, enabling sandboxes
  (WASM, the JVM security model).
- **Tooling**: bytecode is easy to inspect, instrument, and
  hot-reload.

The cost: a layer of interpretation overhead (the dispatch loop) makes
pure bytecode slower than native code — mitigated by **JIT compilation**
([Chapter 21](/compiler/part-6-runtime/jit-compilation)), which compiles
hot bytecode to native code at runtime. Python, Java, C#, Lua, Ruby,
WASM — all bytecode VMs, most with JITs.

## 8. Bytecode as a great first complete compiler

For *your* compiler, targeting a stack-VM bytecode is the recommended
first complete back end:

- Codegen is a trivial tree walk (§3) — no register allocation.
- The VM is a straightforward dispatch loop (§5) — a few hundred lines.
- You get a *fully working* compiler (source → bytecode → execution)
  without the hardest parts (register allocation, native codegen,
  calling conventions, the assembler/linker).

Build the stack-VM version first; it's the shortest path to "my
compiler runs real programs." Then, if you want native speed, add a
register-machine or native back end
([Chapter 19](/compiler/part-5-back-end/targeting-real-machines)) — but
the bytecode VM is a complete, satisfying compiler on its own.

> :weightliftinggoose: A stack-based bytecode VM is the easiest
> complete back end and the right first target. Codegen is a post-order
> tree walk emitting PUSH/op (the stack handles operands — no register
> allocation!), and the VM is a fetch-decode-execute dispatch loop with
> an operand stack and a call stack of frames. Build this and your
> compiler *runs programs*, end to end. It's how Python, Java, and Lua
> work, and it's the most rewarding milestone in the course.

## What we covered

- **Bytecode** is a virtual machine's instruction set; the compiler
  emits it, a **VM** (interpreter) runs it — portable, compact.
- **Stack machine** (operand stack, no registers) vs **register
  machine** (virtual registers, needs allocation); we use a stack
  machine for simplicity.
- **Stack codegen is trivial**: post-order tree walk emitting
  push/op — the stack is the temporary storage, *no register
  allocation*.
- A small **instruction set**: PUSH/LOAD/STORE, arithmetic/comparison,
  JUMP/JUMP_IF_FALSE, CALL/RETURN, POP.
- The **VM** is a **fetch-decode-execute** dispatch loop with an operand
  stack and `locals`.
- **Call frames** (a call stack) handle function calls and recursion in
  software.
- Bytecode VMs are everywhere (Java, Python, C#, Lua, WASM) — portable,
  simple, sandboxable; overhead mitigated by **JIT**.
- A stack-VM bytecode target is the best **first complete compiler**.

## What's next

[Chapter 19](/compiler/part-5-back-end/targeting-real-machines) —
targeting real machines. The hardest back end: emitting actual x86/ARM
assembly, dealing with calling conventions, the machine stack, memory
layout, and going through LLVM as a shortcut.
