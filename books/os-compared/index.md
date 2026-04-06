---
sidebar_position: 1
sidebar_label: Introduction
title: "OS Compared: Linux, seL4, and GooseOS"
slug: /
---

# OS Compared: Linux, seL4, and GooseOS

> Three operating systems. Three philosophies. Same hardware. Every design decision an OS makes — from "where does the kernel live in memory?" to "how do two processes talk?" — has been answered differently by different teams with different goals. This book puts those answers side by side.

## What Is This?

This book takes every fundamental topic in operating system design and examines how three real systems handle it:

- **Linux** — the 30-million-line monolithic giant. Runs on everything, does everything, has a solution (and three deprecated alternatives) for every problem.
- **seL4** — the 10,000-line formally verified microkernel. Mathematically proven correct. The extreme minimalist.
- **GooseOS** — the 1,500-line teaching microkernel written in Rust on RISC-V. Small enough to understand completely, real enough to run on hardware.

The goal isn't to declare a winner. It's to show that OS design is a **space of trade-offs**, not a set of correct answers. Linux optimizes for compatibility and performance. seL4 optimizes for security and formal correctness. GooseOS optimizes for clarity and learning. Each makes the "right" choice for its goals — and those choices are often completely different.

## Who Is This For?

- **CS students** who learned OS theory from a textbook but want to see how real systems actually implement it
- **Embedded developers** choosing between Linux, an RTOS, and something custom
- **GooseOS readers** who want context for why we designed things the way we did
- **Curious engineers** who use Linux daily but never looked inside the kernel
- **Anyone** who's wondered "why does Linux do it *that* way?"

## How to Read This Book

Each chapter covers one OS topic — boot, memory, IPC, scheduling, etc. Within each chapter:

1. **The Problem** — what every OS must solve
2. **Linux's Answer** — the monolithic approach, with code references
3. **seL4's Answer** — the microkernel approach, with formal properties
4. **GooseOS's Answer** — the teaching approach, with full source
5. **Comparison Table** — side-by-side summary of decisions
6. **Trade-off Analysis** — why each choice makes sense in context

You can read front-to-back, or jump to any topic that interests you. Each chapter is self-contained.

## The Cast of Characters

### Linux (1991–present)

Created by Linus Torvalds as "just a hobby, won't be big and professional like GNU." Now runs on everything from watches to supercomputers. The kernel is **monolithic** — device drivers, filesystems, networking, and scheduling all run in kernel space with full hardware access. When something goes wrong in a driver, the whole kernel can crash.

**Key metric**: ~30,000,000 lines of code. ~400 syscalls. ~30 years of backwards compatibility constraints.

### seL4 (2009–present)

Created at NICTA (now Data61/CSIRO) in Australia. A **microkernel** with one extraordinary property: it has a machine-checked mathematical proof that the C code implements the abstract specification correctly. No buffer overflows. No null pointer dereferences. No undefined behavior. The proof covers the kernel — about 10,000 lines of C.

**Key metric**: ~10,000 lines of C. ~3 syscalls (Send, Receive, Yield + variants). Formally verified.

### GooseOS (2025–present)

Created as a learning project and documented in real-time. A RISC-V microkernel written in Rust, targeting WASM-native container workloads. Currently has 10 syscalls and runs on the VisionFive 2 board.

**Key metric**: ~1,500 lines of Rust. 18 planned syscalls. Runs on real hardware.

## Chapter Outline

### Part 1: Foundations

| Chapter | Topic | The Question |
|---------|-------|-------------|
| 1 | Boot | How does the first instruction execute? |
| 2 | Privilege Levels | How does the CPU protect the kernel from user code? |
| 3 | Trap Handling | What happens when something goes wrong (or right)? |
| 4 | The Syscall Interface | How does userspace ask the kernel to do things? |

### Part 2: Memory

| Chapter | Topic | The Question |
|---------|-------|-------------|
| 5 | Physical Memory | How does the OS know what RAM exists? |
| 6 | Virtual Memory | How do page tables work? |
| 7 | Page Allocation | How are physical pages tracked and distributed? |
| 8 | Userspace Memory | How do processes get more memory at runtime? |
| 9 | Memory Protection | How does the MMU enforce isolation? |

### Part 3: Processes

| Chapter | Topic | The Question |
|---------|-------|-------------|
| 10 | What Is a Process? | How is a running program represented? |
| 11 | Context Switching | How does the CPU switch between processes? |
| 12 | Scheduling | Who runs next, and for how long? |
| 13 | Process Creation | How are new processes born? |

### Part 4: Communication

| Chapter | Topic | The Question |
|---------|-------|-------------|
| 14 | IPC Models | Pipes vs messages vs shared memory vs rendezvous |
| 15 | Synchronous IPC | How does seL4-style zero-copy messaging work? |
| 16 | RPC Patterns | How does call/reply differ from send/receive? |
| 17 | The Monolithic Shortcut | Why Linux doesn't need IPC for most things |

### Part 5: Devices and I/O

| Chapter | Topic | The Question |
|---------|-------|-------------|
| 18 | Interrupt Handling | How does hardware get the CPU's attention? |
| 19 | Device Drivers | Kernel space vs userspace drivers |
| 20 | UART: A Case Study | One peripheral, three approaches |

### Part 6: Security and Isolation

| Chapter | Topic | The Question |
|---------|-------|-------------|
| 21 | Capabilities | What can a process access, and who decides? |
| 22 | The Sandbox Question | Hardware isolation vs language-level isolation |
| 23 | Attack Surface | How many lines of code must be trusted? |

### Part 7: Architecture Decisions

| Chapter | Topic | The Question |
|---------|-------|-------------|
| 24 | Monolithic vs Microkernel | The oldest debate in OS design |
| 25 | Syscall Count | 3 vs 18 vs 400 — what's the right number? |
| 26 | Language Choice | C vs Rust vs formal methods |
| 27 | The Future | WASM, unikernels, and what comes next |

## Code References

Throughout this book, we reference specific files and functions:

- **Linux**: kernel source at [kernel.org](https://www.kernel.org/), referenced by path (e.g., `kernel/sched/core.c`)
- **seL4**: source at [github.com/seL4](https://github.com/seL4/seL4), referenced by path
- **GooseOS**: source at [github.com/westerngazoo/goose-os](https://github.com/westerngazoo/goose-os), referenced by file

All code examples show the real implementation — not pseudocode, not simplified versions. If the actual code is too complex to show inline, we show the critical path and link to the full source.

## A Preview: The Syscall Interface

To give you a taste of what each chapter looks like, here's a sneak peek at the syscall comparison:

```
                Linux              seL4              GooseOS
                ─────              ────              ───────
Syscall count   ~450               ~3 (+ variants)   18 (planned)
Convention      a7=number          Uses IPC           a7=number
Dispatch        Table lookup       Switch statement   Match statement
Entry           ecall → trap       ecall → trap       ecall → trap
Exit            sret               sret               sret
```

Same hardware mechanism (ecall/sret), wildly different philosophies about what the kernel should do when it gets there.

Let's begin.
