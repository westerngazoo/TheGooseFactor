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

### Why the VisionFive 2?

We chose the [StarFive VisionFive 2](https://www.starfivetech.com/en/site/boards) as our target board for several reasons:

| | VisionFive 2 | Raspberry Pi 4/5 |
|--|--------------|-------------------|
| **ISA** | RISC-V (RV64GC) — open | ARM (AArch64) — proprietary |
| **SoC** | JH7110 — fully documented | BCM2711/2712 — partially documented |
| **Cores** | 4× SiFive U74 (S7 class) | 4× Cortex-A72/A76 |
| **RAM** | 2/4/8 GB | 1/2/4/8 GB |
| **Price** | ~$55–80 | ~$35–80 |
| **GPU blob** | No proprietary GPU firmware needed for boot | VideoCore GPU involved in boot process |
| **Boot flow** | U-Boot → OpenSBI → kernel (transparent) | Proprietary bootrom → start.elf → kernel (opaque) |

The VisionFive 2 gives us a **fully open boot chain**. On a Raspberry Pi, the GPU loads proprietary firmware (`bootcode.bin`, `start.elf`) before your kernel ever runs — and that firmware is a binary blob you can't inspect. On the VisionFive 2, every stage from ROM to kernel is open-source and documented.

> :happygoose: An open boot chain means you can read every line of code that executes before your kernel. No black boxes, no "trust us" binary blobs. For learning OS development, this transparency is invaluable.
>
> :nerdygoose: The JH7110's SiFive U74 cores implement RV64GC with Sv39 virtual memory — exactly what GooseOS targets. The core design is documented in SiFive's U74 manual, so when you hit a hardware quirk, you can actually look up why.
>
> :sarcasticgoose: "But the Pi has a bigger ecosystem!" Sure — and most of that ecosystem is userspace Linux packages. For bare-metal OS development, ecosystem size means nothing. What matters is: can you read the hardware docs? With the Pi's VideoCore, the answer is "partially, if you squint."

**Bonus**: The VisionFive 2 also makes an excellent embedded development board. Everything in the [Embedded C++/Rust book](/embedded-book) applies directly — same RISC-V toolchain, same JTAG debugging, same UART serial console. One board, two books.

> :weightliftingoose: Think of it like cross-training. The muscle memory you build writing kernel code (register access, interrupt handlers, memory-mapped I/O) transfers directly to embedded firmware — and vice versa. The VisionFive 2 is your training ground for both.

## Why Rust?

- **Memory safety without a garbage collector** — critical for kernel code
- **No undefined behavior by default** — `unsafe` blocks are explicit and auditable
- **`Send`/`Sync` traits** — the compiler catches data races at compile time (essential for multicore)
- **Zero-cost abstractions** — no runtime overhead vs C
- **Thriving RISC-V OS ecosystem** — rCore, RustSBI, Embassy

> :angrygoose: "But `unsafe` is everywhere in kernel code!" True — you can't avoid it when talking to hardware. But Rust's `unsafe` blocks are *explicit*. You know exactly where the dragons are. In C, the entire program is one giant implicit `unsafe` block — every function, every pointer, every cast.
>
> :sharpgoose: The `Send`/`Sync` trait system is the real killer feature for OS code. When you write a spinlock or share data between interrupt handlers and normal code, the compiler *refuses to compile* if your types aren't thread-safe. In C, you discover that bug at 3 AM in production.

## Why RISC-V?

- **Open ISA** — no licensing fees, full specification is public
- **Mainline GCC + LLVM support** — first-class toolchain support (unlike Xtensa)
- **Clean, modern design** — no decades of x86 baggage
- **Growing hardware ecosystem** — affordable Chinese SBCs ($5-175)
- **Industry momentum** — Linux, Android, and major vendors backing RISC-V

> :surprisedgoose: The entire RISC-V privileged spec (everything an OS developer needs) is about 100 pages. The equivalent Intel manual set exceeds 5,000 pages. You can genuinely *understand* your entire target architecture.
>
> :happygoose: QEMU's `virt` machine means you can start writing an OS *right now* — no hardware purchase, no shipping wait. When you're ready for real silicon, the VisionFive 2 runs the exact same code. Zero porting effort.

## Roadmap

| Part | Topic | Branch | Status |
|------|-------|--------|--------|
| **Part 1** | Boot + Hello World | `part-1` | Done |
| **Part 2** | `println!` macro + panic handler | `part-2` | Done |
| **Part 3** | Trap handling + PLIC + interrupt-driven UART | `part-3` | Done |
| Part 4 | Deploy to VisionFive 2 (real hardware!) | | Next |
| Part 5 | Page tables + virtual memory | | Planned |
| Part 6 | Process scheduling | | Planned |
| Part 7 | Heap allocator | | Planned |
| Part 8 | File system | | Planned |
| Part 9 | System calls | | Planned |
| Part 10 | SMP (multicore) | | Planned |

Each part has a corresponding git branch. To see the code at any stage:

```bash
git checkout part-3   # see Part 3's code
git checkout main     # latest development
```

## Source Code

- **GooseOS kernel**: [github.com/westerngazoo/goose-os](https://github.com/westerngazoo/goose-os)
- **This book**: [github.com/westerngazoo/TheGooseFactor](https://github.com/westerngazoo/TheGooseFactor/tree/main/books/goose-os)

## Prerequisites

- Basic Rust knowledge (ownership, borrowing, lifetimes, traits)
- Comfort with the terminal / command line
- Curiosity about what happens below the OS

No prior OS development experience required — that's what we're here to learn.
