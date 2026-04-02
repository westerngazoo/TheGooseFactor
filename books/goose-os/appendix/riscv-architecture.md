---
sidebar_position: 2
sidebar_label: "Architecture Overview"
title: "RISC-V Architecture Overview"
---

# RISC-V Architecture Overview

## The ISA is Modular

RISC-V isn't one ISA — it's a family. You pick a base and bolt on extensions:

| Base | Description |
|------|-------------|
| **RV32I** | 32-bit integer base (32 registers, 47 instructions) |
| **RV64I** | 64-bit integer base (same instructions, wider registers) |
| **RV128I** | 128-bit (draft, rarely used) |

Common extensions:

| Extension | Letter | What it adds |
|-----------|--------|-------------|
| Multiply/Divide | **M** | `mul`, `div`, `rem` |
| Atomics | **A** | `lr`/`sc`, `amo*` (load-reserved/store-conditional, atomic ops) |
| Single-float | **F** | 32 float registers, IEEE 754 single-precision |
| Double-float | **D** | Double-precision (extends F) |
| Compressed | **C** | 16-bit instruction encoding for common ops (reduces code size ~25%) |
| Vector | **V** | SIMD-style vector processing |

**RV64GC** = RV64I + M + A + F + D + C — this is what Linux targets and what GooseOS uses.

> :nerdygoose: The "G" in RV64GC stands for "General purpose" — it's shorthand for IMAFD. The "C" (compressed) is separate because 16-bit encoding is optional, but every real Linux-capable chip includes it for code density.
>
> :weightliftinggoose: Think of extensions like gym equipment. RV32I is bodyweight fundamentals — you can do everything, just slowly. M adds a squat rack (multiply/divide). A adds a spotter (atomics for safe concurrent access). F/D add precision machines (floating point). C makes everything more compact — like circuit training.

## Privilege Levels

RISC-V defines three privilege levels (modes), from most to least privileged:

```
┌────────────────────────────────────┐
│  M-mode (Machine)                  │  ← Firmware / SBI (OpenSBI)
│  - Full hardware access            │
│  - Handles traps before delegation │
├────────────────────────────────────┤
│  S-mode (Supervisor)               │  ← OS kernel (GooseOS lives here)
│  - Virtual memory control          │
│  - Interrupt/exception handling     │
│  - Delegate to U-mode              │
├────────────────────────────────────┤
│  U-mode (User)                     │  ← Applications
│  - No direct hardware access       │
│  - Traps into S-mode via ecall     │
└────────────────────────────────────┘
```

**Key insight**: GooseOS runs in S-mode. OpenSBI handles M-mode for us. This is similar to how x86 OSes run in Ring 0 while BIOS/UEFI firmware handles lower levels.

> :angrygoose: Do NOT try to access M-mode CSRs from S-mode. You'll get an illegal instruction trap and waste an hour wondering why your kernel panics at boot. Ask me how I know.
>
> :happygoose: The clean privilege separation is actually great for learning. You only need to understand S-mode to write a kernel. M-mode firmware (OpenSBI) handles the gnarly hardware init, timer delegation, and SBI calls for you.
>
> :sarcasticgoose: "But I want to control everything!" Sure, go write M-mode firmware. We'll see you in six months when you've finished parsing device trees and initializing DRAM controllers.

## Registers

RV64I provides 32 general-purpose 64-bit registers:

| Register | ABI Name | Usage | Saved by |
|----------|----------|-------|----------|
| `x0` | `zero` | Hardwired zero | — |
| `x1` | `ra` | Return address | Caller |
| `x2` | `sp` | Stack pointer | Callee |
| `x3` | `gp` | Global pointer | — |
| `x4` | `tp` | Thread pointer | — |
| `x5-x7` | `t0-t2` | Temporaries | Caller |
| `x8` | `s0`/`fp` | Saved register / frame pointer | Callee |
| `x9` | `s1` | Saved register | Callee |
| `x10-x11` | `a0-a1` | Function args / return values | Caller |
| `x12-x17` | `a2-a7` | Function arguments | Caller |
| `x18-x27` | `s2-s11` | Saved registers | Callee |
| `x28-x31` | `t3-t6` | Temporaries | Caller |

**Caller-saved** = the function you call may overwrite them, so save them before the call if you need them.
**Callee-saved** = the function you call must restore them before returning.

> :surprisedgoose: `x0` is hardwired to zero — writing to it is silently discarded. This sounds useless until you realize it eliminates a whole class of instructions: `nop` is just `addi x0, x0, 0`, `mv` is `addi rd, rs, 0`, `j` is `jal x0, offset`. One register saves dozens of opcodes.
>
> :sharpgoose: Notice `tp` (thread pointer) is reserved and never saved. In GooseOS, we'll use it to point to the current hart's per-CPU data structure. Touch it carelessly and you'll corrupt every hart's state.

### Key CSRs (Control and Status Registers)

These are special registers for S-mode kernel work:

| CSR | Purpose |
|-----|---------|
| `sstatus` | Supervisor status (interrupt enable, previous privilege mode) |
| `sie` | Supervisor interrupt enable (which interrupts are allowed) |
| `sip` | Supervisor interrupt pending (which interrupts are waiting) |
| `stvec` | Supervisor trap vector (where to jump on trap) |
| `sepc` | Supervisor exception PC (where the trap happened) |
| `scause` | Supervisor cause (why the trap happened) |
| `stval` | Supervisor trap value (extra info, e.g., faulting address) |
| `satp` | Supervisor address translation and protection (page table base + mode) |
| `sscratch` | Scratch register for trap handlers (kernel stores tp/sp swap here) |

> :nerdygoose: `sscratch` is the unsung hero of trap handling. When a user-mode trap fires, you have *no* free registers — `sscratch` gives you exactly one safe place to stash a pointer so you can save everything else. We'll use it to swap in the kernel stack pointer.
>
> :angrygoose: If you forget to set `stvec` before enabling interrupts, the CPU will jump to address 0x0 on the first trap. That's usually unmapped memory. Instant double fault. Set your trap vector *first*, always.

## Memory Layout (typical for GooseOS on QEMU `virt`)

```
0x0000_0000           ┌──────────────────────┐
                      │  (reserved)          │
0x0200_0000           ├──────────────────────┤
                      │  CLINT (timer/IPI)   │
0x0C00_0000           ├──────────────────────┤
                      │  PLIC (interrupts)   │
0x1000_0000           ├──────────────────────┤
                      │  UART (serial I/O)   │
0x8000_0000           ├──────────────────────┤
                      │  RAM start           │
                      │  ┌──────────────────┐│
                      │  │ Kernel text/data ││
                      │  ├──────────────────┤│
                      │  │ Kernel heap      ││
                      │  ├──────────────────┤│
                      │  │ Page allocator   ││
                      │  ├──────────────────┤│
                      │  │ User pages       ││
                      │  └──────────────────┘│
0x8800_0000           │  RAM end (128MB)     │
                      └──────────────────────┘
```

**Important addresses for GooseOS**:
- `0x8000_0000` — kernel entry point (where OpenSBI jumps to)
- `0x1000_0000` — UART base (where we write bytes for serial output)
- `0x0C00_0000` — PLIC base (Platform-Level Interrupt Controller)

## Virtual Memory (Sv39)

GooseOS uses **Sv39** — 39-bit virtual addresses with 3-level page tables:

```
Virtual address (39 bits):
┌────────┬────────┬────────┬──────────────┐
│ VPN[2]  │ VPN[1]  │ VPN[0]  │  Page offset  │
│ 9 bits  │ 9 bits  │ 9 bits  │  12 bits      │
└────────┴────────┴────────┴──────────────┘
  bits 38-30  bits 29-21  bits 20-12  bits 11-0
```

- Each page is **4 KiB** (2^12 bytes)
- Each page table has **512 entries** (2^9)
- Three levels: root → middle → leaf
- Enabled by writing the root page table address + mode to `satp` CSR

This gives a 512 GiB virtual address space — plenty for an OS kernel and user processes.

> :mathgoose: The math: 2^39 = 512 GiB total address space. Each page table level fans out 512 ways (2^9), and 3 levels × 9 bits + 12-bit offset = 39 bits. To map the entire space you'd need 512 × 512 + 512 + 1 = 262,657 page tables — but sparse mapping means you'll use a tiny fraction.
>
> :happygoose: Sv39 is the sweet spot for learning. Sv48 (4-level) and Sv57 (5-level) exist for larger address spaces, but Sv39's 512 GiB is more than enough for GooseOS and keeps the page walk code simple.
