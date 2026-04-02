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

> :angrygoose: Let me be blunt: doubly-linked lists in Rust are *painful*. The borrow checker won't let two nodes point at each other because that's aliased mutable state. You'll reach for `unsafe` or `Rc<RefCell<>>` and feel like you're fighting the language.
>
> :happygoose: But here's the thing — every use-after-free bug the borrow checker prevents in the rest of your kernel is worth that friction. In C, linked list bugs are the #1 source of kernel exploits. The compiler is annoying because it's *right*.
>
> :sarcasticgoose: "Just write it in C, it's easier." Sure — easier to write, easier to ship, easier to get a CVE. Pick two.

## The Architecture Question

### Why Not x86?

x86 is the most-documented target for OS dev (OSDev wiki, xv6, etc.), but:

- **Legacy baggage** — real mode, protected mode, long mode. A20 gate. Segmentation. You spend weeks on boot protocol before writing actual OS code.
- **Complex, proprietary ISA** — Intel/AMD own the specification. Decades of backwards compatibility make it messy.
- **UEFI boot** — modern x86 boot requires understanding UEFI, which is an entire OS-sized specification.

> :surprisedgoose: The A20 gate. In 2026, x86 CPUs still start in 16-bit real mode for backwards compatibility with the 8086 from 1978. You literally have to enable the 21st address line by toggling a pin that was originally controlled by the *keyboard controller*. This is not a joke.
>
> :weightliftinggoose: Think of x86 boot as training with a 50kg weighted vest that someone welded shut. Sure, you'll get stronger — but you'll spend more time fighting the vest than actually learning to run. RISC-V lets you start sprinting from day one.

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

> :nerdygoose: The "G" in RV64GC stands for "General purpose" — it's shorthand for IMAFD (Integer + Multiply + Atomics + Float + Double). Combined with C (Compressed 16-bit instructions), this is the standard Linux-capable profile. Every extension is documented in the open spec.
>
> :sharpgoose: OpenSBI is the unsung hero of RISC-V OS development. It gives you an SBI (Supervisor Binary Interface) — a clean API for timer setup, IPI, power management, and console I/O. Instead of writing 2,000 lines of M-mode firmware, you call `sbi_set_timer()` and move on with your life.

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

> :angrygoose: Real hardware will surprise you. QEMU's UART is instant, but the VisionFive 2's physical UART runs at 115200 baud. Blast bytes too fast and you'll overflow the FIFO. Your "working" kernel will print garbled output. Always test on real hardware before declaring victory.
>
> :happygoose: The flip side: when you see "Hello from GooseOS!" on a *physical* serial terminal connected to a *real* RISC-V chip, the dopamine hit is unmatched. Emulators are for development; real silicon is for celebration.

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
