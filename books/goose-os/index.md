---
sidebar_position: 1
sidebar_label: Introduction
title: "GooseOS: Writing an OS in Rust on RISC-V"
slug: /
---

# GooseOS: Writing an OS in Rust on RISC-V

> A hands-on tutorial building an operating system from scratch in Rust, targeting RISC-V 64-bit. From first boot to a working kernel — one chapter at a time.

## What Is This?

This is a living book documenting the development of **GooseOS** — a RISC-V operating system written in Rust. Each chapter corresponds to a real development milestone, with full source code and explanations of every decision.

This isn't a theoretical textbook. It's a build log. We start with nothing and end with a working OS.

## Target Hardware

- **Primary development**: QEMU `virt` machine (no hardware needed to start)
- **Real hardware**: StarFive VisionFive 2 (JH7110 SoC, 4x SiFive U74 RISC-V cores)

## Why Rust?

- **Memory safety without a garbage collector** — critical for kernel code
- **No undefined behavior by default** — `unsafe` blocks are explicit and auditable
- **`Send`/`Sync` traits** — the compiler catches data races at compile time (essential for multicore)
- **Zero-cost abstractions** — no runtime overhead vs C
- **Thriving RISC-V OS ecosystem** — rCore, RustSBI, Embassy

## Why RISC-V?

- **Open ISA** — no licensing fees, full specification is public
- **Mainline GCC + LLVM support** — first-class toolchain support (unlike Xtensa)
- **Clean, modern design** — no decades of x86 baggage
- **Growing hardware ecosystem** — affordable Chinese SBCs ($5-175)
- **Industry momentum** — Linux, Android, and major vendors backing RISC-V

## Roadmap

| Part | Topic | Status |
|------|-------|--------|
| **Part 1** | Boot + Hello World | Done |
| Part 2 | Panic handler + `print!` macro | Planned |
| Part 3 | Page tables + virtual memory | Planned |
| Part 4 | Trap handling + interrupts | Planned |
| Part 5 | Process scheduling | Planned |
| Part 6 | Heap allocator | Planned |
| Part 7 | File system | Planned |
| Part 8 | System calls | Planned |
| Part 9 | SMP (multicore) | Planned |
| Part 10 | Deploying to VisionFive 2 | Planned |

## Source Code

All code lives alongside this book:

- **GooseOS kernel**: `~/projects/goose-os/`
- **This book**: `~/projects/TheGooseFactor/books/goose-os/`

## Prerequisites

- Basic Rust knowledge (ownership, borrowing, lifetimes, traits)
- Comfort with the terminal / command line
- Curiosity about what happens below the OS

No prior OS development experience required — that's what we're here to learn.
