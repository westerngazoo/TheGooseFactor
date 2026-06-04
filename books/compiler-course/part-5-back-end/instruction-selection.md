---
sidebar_position: 1
title: "Instruction Selection and Code Generation"
---

# Instruction Selection and Code Generation

> Turning IR into target instructions. Code generation maps the
> abstract IR operations onto the concrete instructions the target
> provides — choosing the best instructions for each IR construct.

The optimized IR ([Part IV](/compiler/part-4-optimization/ssa-optimizations))
is target-neutral. The **back end** turns it into target code. The
first step is **instruction selection**: mapping each IR operation to
one or more target instructions. This chapter covers codegen and
instruction selection; register allocation
([Chapter 17](/compiler/part-5-back-end/register-allocation)) and VMs
([Chapter 18](/compiler/part-5-back-end/bytecode-and-vms)) follow.

## 1. The code generation problem

The IR says `t3 = t1 * t2` abstractly. The target has a specific
instruction set — maybe `imul`, maybe `mul`, maybe a multiply-add. Code
generation answers: **which target instructions implement each IR
operation?** It must produce correct code that respects the target's:

- **Instruction set**: what operations exist and their forms.
- **Addressing modes**: how operands are specified (register, memory,
  immediate).
- **Register/stack model**: where values live.
- **Calling conventions**: how functions pass arguments
  ([Chapter 19](/compiler/part-5-back-end/targeting-real-machines)).

A simple IR op might be one instruction; a complex one (a memory load
with computed address) might be several, or fold into one rich
instruction.

## 2. Naive code generation: one IR op, one (or few) instructions

The simplest approach: translate each IR instruction independently to a
fixed target sequence (a "macro expansion"):

```
IR:  t3 = t1 + t2
x86: mov rax, [t1]      ; load t1
     add rax, [t2]      ; add t2
     mov [t3], rax      ; store t3
```

This is correct and easy but produces **poor code** — lots of redundant
loads/stores, no use of the target's richer instructions. (Register
allocation, [Chapter 17](/compiler/part-5-back-end/register-allocation),
removes much of the load/store traffic by keeping values in registers.)
Naive codegen is a fine starting point; you then improve it.

## 3. Instruction selection as tree matching

Better instruction selection treats IR expressions as **trees** and
matches them against the target's instructions, each of which covers a
*tree pattern*. The target instruction `load-effective-address` might
compute `base + index*scale + offset` in one instruction — covering a
whole sub-tree of IR address arithmetic.

The classic technique: **tree pattern matching** with **dynamic
programming** (the "maximal munch" or BURS approach). Cover the IR tree
with target-instruction patterns at minimum cost (fewest/cheapest
instructions). Each pattern is a target instruction; the DP finds the
cheapest tiling of the expression tree:

```
IR tree:    *
           / \
          +   c
         / \
        a   b
```

A target with a multiply-add might cover `(a+b)*c` differently than one
without. Tree-matching instruction selection picks the best instructions
for the actual target, exploiting rich instructions (multiply-add,
load-with-offset, etc.) that naive codegen would miss.

> :nerdygoose: Instruction selection via tree tiling with dynamic
> programming (BURG/iburg tools generate these matchers from a
> cost-annotated grammar of the instruction set) was the classic
> approach. Modern compilers (LLVM) use a more elaborate **DAG-based**
> selection (since values can be shared, the IR is a DAG not a tree)
> plus increasingly **machine-learning-tuned** heuristics. But the core
> idea endures: cover the IR with target-instruction patterns at
> minimum cost. It's a tiling problem.

## 4. CISC vs RISC targets

The target's instruction-set philosophy shapes selection:

- **CISC** (x86): many complex instructions, rich addressing modes (an
  operand can be `[base + index*4 + 8]` computed in the instruction).
  Instruction selection has more patterns to exploit — one instruction
  can do a lot.
- **RISC** (ARM, RISC-V): fewer, simpler, fixed-length instructions;
  operands mostly registers; explicit loads/stores ("load-store
  architecture"). Selection is more uniform — fewer fancy patterns, more
  instructions per operation.

A multiply-and-store is one x86 instruction but two on RISC-V. The
selector must know the target's instructions and their costs. Targeting
multiple architectures means a pattern set per target — another reason
for the target-neutral IR ([Chapter 9](/compiler/part-3-types-and-ir/intermediate-representation))
feeding target-specific back ends.

## 5. Generating code for control flow

IR control flow (branches, jumps, labels from
[Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir)) maps fairly
directly to target control flow:

```
IR:   branch cond, L_then, L_else
x86:  cmp  rax, 0          ; test the condition
      je   L_else          ; jump if equal (false) to else
      ; fall through to then
L_then:
      ...
      jmp  L_end
L_else:
      ...
L_end:
```

The selector emits a compare + conditional jump for `branch`, an
unconditional `jmp` for `jump`, and labels stay labels. Targets often
have condition codes/flags set by comparisons and consumed by
conditional jumps — the selector pairs them. Minor cleanups (a jump to
the very next instruction is removed) are peephole optimizations
([Chapter 13](/compiler/part-4-optimization/local-and-peephole)) applied
to the generated code.

## 6. Generating code for function calls

Function calls require following the target's **calling convention**
([Chapter 19](/compiler/part-5-back-end/targeting-real-machines)):

```
IR:   t = call f(a, b)
x86:  mov  rdi, [a]        ; first arg in rdi (System V convention)
      mov  rsi, [b]        ; second arg in rsi
      call f               ; call (pushes return address, jumps)
      mov  [t], rax        ; result comes back in rax
```

The selector emits code to: place arguments where the convention
dictates (specific registers, then stack), execute the `call`, and
retrieve the result from the designated register. It must also handle
**caller-saved registers** (save any live values the callee might
clobber). Calls are where the back end touches the runtime/ABI most
directly.

## 7. The output: assembly or machine code

Code generation produces target code in one of two forms:

- **Assembly text**: human-readable mnemonics (`add rax, rbx`). The
  compiler emits assembly, then an **assembler** turns it into machine
  code bytes. Easier to debug (you can read the output); most compilers
  do this (`gcc -S` shows it).
- **Machine code directly**: the compiler emits the actual instruction
  bytes (needed for JIT, [Chapter 21](/compiler/part-6-runtime/jit-compilation),
  which generates code at runtime with no time to invoke an external
  assembler).

For an ahead-of-time compiler, emitting assembly and shelling out to an
assembler (and linker) is standard and simplest. For a JIT, you emit
bytes into executable memory and jump to them.

## 8. Where instruction selection sits

Instruction selection is the *first* back-end stage, transforming
target-neutral IR into target instructions that still use **virtual
registers** (unlimited temporaries). The next stage, **register
allocation** ([Chapter 17](/compiler/part-5-back-end/register-allocation)),
maps those virtual registers onto the target's limited *physical*
registers. So the pipeline is:

```
optimized IR → [instruction selection] → target instrs (virtual regs)
            → [register allocation] → target instrs (physical regs)
            → [final peephole + assembly emission] → machine code
```

Instruction selection chooses *which* instructions; register allocation
decides *where values live*. Together they bridge from IR to runnable
code. (For a stack VM, [Chapter 18](/compiler/part-5-back-end/bytecode-and-vms),
there's no register allocation — values live on the operand stack — so
codegen is simpler.)

> :weightliftinggoose: Code generation maps IR operations to target
> instructions. Start naive (one IR op → a fixed instruction sequence
> with virtual registers) — it's correct and simple. Improve with tree-
> pattern instruction selection to exploit the target's rich
> instructions (addressing modes, multiply-add). Handle control flow
> (compare + conditional jump) and calls (calling convention). The
> output uses virtual registers; register allocation (next chapter)
> assigns physical ones. This is where IR becomes real instructions.

## What we covered

- **Code generation** maps abstract IR ops to concrete target
  instructions, respecting the instruction set, addressing modes,
  register/stack model, and calling conventions.
- **Naive codegen** (one IR op → fixed sequence) is correct but
  produces poor code (redundant loads/stores).
- **Instruction selection** as **tree pattern matching** with dynamic
  programming covers the IR tree with target instructions at minimum
  cost — exploiting rich instructions. (Modern: DAG-based, in LLVM.)
- **CISC** (rich instructions/addressing) vs **RISC** (simple,
  load-store) shape selection.
- **Control flow** → compare + conditional/unconditional jumps;
  **calls** → calling-convention argument placement + result retrieval.
- Output: **assembly** (then assembler) or **machine code directly**
  (for JIT).
- Selection produces instructions with **virtual registers**; register
  allocation (next) assigns physical ones.

## What's next

[Chapter 17](/compiler/part-5-back-end/register-allocation) — register
allocation. The problem of mapping the program's unlimited values onto
the machine's limited registers, via graph coloring and spilling — one
of the back end's most important and elegant algorithms.
