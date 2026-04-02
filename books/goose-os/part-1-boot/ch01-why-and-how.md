---
sidebar_position: 1
sidebar_label: "Ch 1: Why Rust + RISC-V?"
title: "Chapter 1: Why Rust + RISC-V for OS Development?"
---

# Chapter 1: Why Rust + RISC-V for OS Development?

Before we write a single line of code, let's understand why this combination makes sense — and what the alternatives look like.

## The Language Question

### Why Not C?

C is the traditional OS language. Linux, FreeBSD, seL4 — all C. It works. But:

- **No memory safety** — buffer overflows, use-after-free, double-free. These aren't just bugs; in a kernel, they're security vulnerabilities and silent corruption.
- **No type-safe concurrency** — data races are entirely on you. When you add multicore support, every shared structure becomes a potential bug.
- **Manual everything** — error handling is ad-hoc (return codes, `errno`, `goto cleanup`).

### Why Not C++?

C++ is better than C for large systems code. Modern C++23 gives you `constexpr`, RAII, templates, and `std::expected`. But:

- **Exceptions don't work in kernels** — you must disable them (`-fno-exceptions`), losing a core language feature.
- **RTTI doesn't work in kernels** — another disabled feature (`-fno-rtti`).
- **Still has undefined behavior everywhere** — every pointer dereference, every cast, every array access is implicitly unsafe. The compiler won't help you.
- **Header files and include hell** — in 2026, C++ still doesn't have a widely-adopted module system for bare-metal.
- **Xtensa problem** — if you target ESP32's Xtensa cores, there's no mainline GCC. You're stuck with vendor forks and lagging C++ standard support.

### Why Rust?

- **Memory safety by default** — ownership + borrowing eliminates entire classes of bugs at compile time. No buffer overflows, no use-after-free, no double-free.
- **`unsafe` is explicit** — when you need raw pointer access (and in a kernel, you will), you mark it. Every `unsafe` block is auditable. In C/C++, *everything* is implicitly unsafe.
- **`Send` + `Sync` traits** — the compiler enforces thread safety. When we add multicore support later, this will catch data races at compile time.
- **No runtime** — `#![no_std]` gives you bare-metal Rust with zero overhead. No garbage collector, no hidden allocations.
- **Pattern matching** — `match` on enums with exhaustiveness checking. Error handling in kernel code becomes clean and compiler-verified.
- **Cargo** — dependency management, build system, and cross-compilation that just works. No CMake, no Makefiles for the build itself.

### The Trade-off

Rust is harder to write than C for some kernel patterns:

```rust
// Doubly-linked lists? The borrow checker fights you.
// Global mutable state? Wrapped in Mutex<Option<T>> or unsafe.
// Self-referential structs? Pin<> hell.
```

This is real friction. But the argument is: **it's better to fight the compiler than to fight runtime bugs at 3 AM**.

## The Architecture Question

### Why Not x86?

x86 is the most-documented target for OS dev (OSDev wiki, xv6, etc.), but:

- **Legacy baggage** — real mode, protected mode, long mode. A20 gate. Segmentation. You spend weeks on boot protocol before writing actual OS code.
- **Complex, proprietary ISA** — Intel/AMD own the specification. Decades of backwards compatibility make it messy.
- **UEFI boot** — modern x86 boot requires understanding UEFI, which is an entire OS-sized specification.

### Why Not ARM?

ARM is great for embedded (and we'll use it for our garage door product), but:

- **Proprietary ISA** — ARM Holdings licenses it. You can't freely extend it.
- **Multiple instruction sets** — ARM, Thumb, Thumb-2, AArch64. Each has different encodings and behaviors.
- **Vendor fragmentation** — every SoC vendor customizes differently.

### Why RISC-V?

- **Open ISA** — the full specification is public. No licensing fees. Anyone can make a RISC-V chip.
- **Clean design** — designed in 2010 at UC Berkeley with decades of ISA lessons learned. No legacy baggage.
- **Simple privilege levels** — Machine (M), Supervisor (S), User (U). Clean, orthogonal, well-specified.
- **Mainline toolchain support** — GCC and LLVM both have first-class RISC-V backends. `riscv64gc-unknown-none-elf` is a Tier 2 Rust target.
- **Growing hardware** — from $5 Milk-V Duo to 64-core Milk-V Pioneer. Real silicon you can buy today.
- **OpenSBI** — open-source firmware that handles M-mode initialization. We boot straight into S-mode and start writing our OS. No BIOS/UEFI nonsense.

## Our Hardware

### Development: QEMU virt machine

We'll develop entirely in QEMU first. The `virt` machine provides:

- Configurable RISC-V cores (SiFive U-series compatible)
- NS16550A UART at `0x10000000`
- VirtIO devices (block, network)
- RAM starting at `0x80000000`
- Built-in OpenSBI firmware

This means you can follow along with **zero hardware** — just QEMU on any Linux/Mac/Windows machine.

### Target: StarFive VisionFive 2

Once our OS works in QEMU, we'll deploy to real silicon:

- **JH7110 SoC** — 4x SiFive U74 cores (RV64GC, up to 1.5 GHz) + 1x S7 monitor core
- **RAM**: 2-8 GB LPDDR4
- **Peripherals**: 2x Gigabit Ethernet, USB 3.0, HDMI, GPIO, M.2
- **Best mainline Linux support** of any RISC-V SBC (kernel 6.2+)
- **Available**: ~$45-85 from vendors like YouYeeToo

The VisionFive 2 is essentially the "Raspberry Pi of RISC-V" — affordable, well-documented, and widely available.

## What We'll Build

By the end of this book, GooseOS will have:

1. **Boot** — assembly entry, stack setup, jump to Rust
2. **Console output** — UART driver, `print!` macro, panic handler
3. **Virtual memory** — page tables, kernel/user address spaces
4. **Interrupts** — trap handling, timer, external interrupts
5. **Processes** — scheduling, context switching
6. **Memory allocation** — heap allocator, physical frame allocator
7. **File system** — VirtIO block device, simple FS
8. **System calls** — user/kernel boundary
9. **Multicore** — SMP on all 4 U74 cores
10. **Real hardware** — flashing and running on VisionFive 2

Let's get started.
