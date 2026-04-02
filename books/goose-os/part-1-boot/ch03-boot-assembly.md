---
sidebar_position: 3
sidebar_label: "Ch 3: Boot Assembly"
title: "Chapter 3: The RISC-V Boot Sequence"
---

# Chapter 3: The RISC-V Boot Sequence

This is where it gets real. We write the first instructions that execute on our machine — in RISC-V assembly — and hand off control to Rust.

## What Happens Before Us

When QEMU starts with `-bios default -kernel goose-os`, here's the sequence:

1. **QEMU** loads OpenSBI firmware into RAM at `0x80000000`
2. **QEMU** loads our kernel ELF at the addresses specified in its program headers (our `.text` starts at `0x80200000`)
3. **OpenSBI** boots in **Machine mode** (M-mode) — the highest privilege level on RISC-V
4. OpenSBI initializes: sets up M-mode trap handlers, timer, inter-processor interrupts
5. OpenSBI switches to **Supervisor mode** (S-mode) and jumps to `0x80200000`
6. **We take over.**

### RISC-V Privilege Levels

```
┌─────────────────────────────────┐
│  M-mode (Machine)               │  ← OpenSBI lives here
│  Full hardware access           │  ← Handles timer, IPI, platform
├─────────────────────────────────┤
│  S-mode (Supervisor)            │  ← OUR KERNEL runs here
│  Virtual memory, trap handling  │  ← Where we'll spend our time
├─────────────────────────────────┤
│  U-mode (User)                  │  ← User programs (later)
│  Restricted, syscalls to kernel │
└─────────────────────────────────┘
```

Our kernel runs in S-mode. We can manage page tables, handle interrupts, and control user processes — but we can't directly touch hardware timers or power management. For that, we make **SBI calls** to OpenSBI (think of it like a BIOS API).

> :nerdygoose: SBI (Supervisor Binary Interface) is RISC-V's answer to "how does the OS talk to firmware?" It's a clean, versioned ABI with function IDs. Call it via `ecall` from S-mode — OpenSBI handles it in M-mode and returns. Think of it as a very minimal hypervisor.
>
> :sharpgoose: This privilege model is cleaner than x86. On x86, the boundary between firmware (SMM) and the OS (Ring 0) is murky — firmware can interrupt the OS invisibly via System Management Interrupts. On RISC-V, M-mode and S-mode interactions are explicit and well-specified.

## The Boot Assembly: `src/boot.S`

```asm
# GooseOS RISC-V Boot Code
#
# OpenSBI jumps here in S-mode with:
#   a0 = hart ID
#   a1 = device tree blob (DTB) pointer
#
# We park all harts except 0, zero BSS, set up the stack,
# then jump into Rust.

.section .text.boot
.global _start

_start:
    # --- Park non-boot harts ---
    bnez    a0, _park

    # --- Zero the .bss section ---
    la      t0, _bss_start
    la      t1, _bss_end
_zero_bss:
    beq     t0, t1, _bss_done
    sd      zero, 0(t0)
    addi    t0, t0, 8
    j       _zero_bss
_bss_done:

    # --- Set up stack ---
    la      sp, _stack_top

    # --- Jump to Rust ---
    call    kmain

    # kmain should never return, but if it does:
    j       _park

# --- Secondary hart parking loop ---
_park:
    wfi
    j       _park
```

Let's break this down instruction by instruction.

## Section Placement

```asm
.section .text.boot
.global _start
```

- `.section .text.boot` — puts this code in a section named `.text.boot`. Our linker script has `KEEP(*(.text.boot))` at the very start of `.text`, guaranteeing `_start` is at `0x80200000`.
- `.global _start` — exports the `_start` symbol so the linker can find it. The `ENTRY(_start)` in our linker script references this.

## Hart Parking

```asm
_start:
    bnez    a0, _park     # if a0 (hart_id) != 0, go to _park
```

**What's a hart?** "Hardware thread" — RISC-V's term for a CPU core. The VisionFive 2 has 4 U74 harts plus 1 S7 monitor hart.

**The problem:** OpenSBI boots ALL harts. They all jump to `0x80200000` simultaneously. If all 4 cores start initializing the kernel, they'll corrupt each other's state — writing to the same BSS memory, using the same stack.

**The solution:** Check the hart ID (passed in register `a0` by OpenSBI). Only hart 0 continues. All others jump to `_park` — a `wfi` (wait for interrupt) loop where they sleep until we explicitly wake them (in Part 9: SMP).

`bnez` = "branch if not equal to zero". A single instruction gates the entire boot sequence.

> :angrygoose: If you forget to park the other harts, all 4 cores will race through BSS zeroing and stack setup simultaneously. They'll corrupt each other's state and you'll get non-deterministic crashes that only happen sometimes. Debugging race conditions at boot time, before you have *any* debug infrastructure, is a special kind of misery.
>
> :surprisedgoose: OpenSBI actually boots hart 0 first by convention, but the spec doesn't *guarantee* which hart arrives first. On some hardware, hart 1 might win the race. Our `bnez a0` check handles this correctly — only hart 0 proceeds, regardless of arrival order.

## Zeroing BSS

```asm
    la      t0, _bss_start      # t0 = address of BSS start
    la      t1, _bss_end        # t1 = address of BSS end
_zero_bss:
    beq     t0, t1, _bss_done   # if t0 == t1, BSS is empty, skip
    sd      zero, 0(t0)         # store 8 zero bytes at address t0
    addi    t0, t0, 8           # advance pointer by 8 bytes
    j       _zero_bss            # loop
_bss_done:
```

**Why do we have to do this?** In Rust (and C), zero-initialized static variables go in the `.bss` section. The compiler assumes they're zero. But on bare metal, RAM contains whatever garbage was there before boot. If we don't zero `.bss`, our Rust code's `static` variables start with random values — instant undefined behavior.

**Instruction breakdown:**
- `la` (load address) — loads a linker symbol address into a register
- `beq` (branch if equal) — conditional branch
- `sd` (store doubleword) — stores 8 bytes. `zero` is a hardwired register that always reads as 0
- `addi` — add immediate. Advances the pointer by 8 bytes (one doubleword)

### RISC-V Register Conventions

| Register | ABI Name | Purpose |
|----------|----------|---------|
| `x0` | `zero` | Hardwired to 0 |
| `x1` | `ra` | Return address |
| `x2` | `sp` | Stack pointer |
| `x5-x7` | `t0-t2` | Temporary (caller-saved) |
| `x10-x11` | `a0-a1` | Function arguments / return values |
| `x28-x31` | `t3-t6` | More temporaries |

We use `t0` and `t1` for the BSS loop because they're temporary registers — no one expects them to be preserved across function calls.

> :angrygoose: The BSS *must* be zeroed before *any* Rust code runs. Rust's safety guarantees assume zero-initialized statics are actually zero. If they contain random garbage from previous boot cycles, you'll get "impossible" behavior — `false` booleans that evaluate to `true`, enums with invalid discriminants, null pointers that aren't null.
>
> :mathgoose: We step by 8 bytes (`addi t0, t0, 8`) because `sd` stores a doubleword (64 bits). This works because `.bss` is `ALIGN(4K)` — guaranteed to start on a 4096-byte boundary, which is divisible by 8. If BSS weren't aligned, we'd need a byte-by-byte loop at the edges.

## Stack Setup

```asm
    la      sp, _stack_top
```

One instruction. Loads the `_stack_top` symbol (defined in `linker.ld` as the top of RAM) into the stack pointer register `sp`.

**Why does the stack grow down?** Convention. On almost every architecture (RISC-V, ARM, x86), the stack starts at a high address and grows toward lower addresses. When you `push` to the stack, `sp` decreases. When you `pop`, `sp` increases.

```
_stack_top (0x87E00000) ─► sp starts here
                            │
                            ▼ grows downward
                            │
                         (free space)
                            │
_bss_end ───────────────────┘ (our data ends here)
```

## The Handoff to Rust

```asm
    call    kmain
```

This is the moment assembly hands control to Rust. `call` does two things:
1. Saves the return address in register `ra`
2. Jumps to the `kmain` symbol

**The calling convention magic:** OpenSBI put the hart ID in `a0` and the device tree pointer in `a1`. We haven't touched those registers. RISC-V's calling convention passes function arguments in `a0`, `a1`, `a2`, etc. So when Rust sees:

```rust
pub extern "C" fn kmain(hart_id: usize, _dtb_addr: usize) -> !
```

It automatically receives `a0` as `hart_id` and `a1` as `_dtb_addr`. The arguments flow through without any extra code.

> :happygoose: This is beautiful. Zero glue code. OpenSBI puts hart ID in `a0`, the calling convention says first argument goes in `a0`, and Rust's `extern "C"` uses that convention. Three independent systems align perfectly because they all follow the same standard.
>
> :nerdygoose: The DTB (Device Tree Blob) pointer in `a1` describes all the hardware on the board — memory size, CPU count, peripheral addresses. We ignore it now (`_dtb_addr`), but in Part 10 (real hardware) we'll parse it to discover the VisionFive 2's actual memory layout instead of hardcoding addresses.

## The Safety Net

```asm
    j       _park

_park:
    wfi
    j       _park
```

If `kmain` ever returns (it shouldn't — it's declared `-> !`), we fall into the parking loop. `wfi` (wait for interrupt) puts the core into a low-power sleep state. Without this, the core would execute whatever garbage follows in memory.

> :sarcasticgoose: "My kernel will never return, I don't need a safety net." Famous last words. One accidental `return` from a `-> !` function (which Rust makes impossible, but if you use `unsafe` to construct one...) and your CPU is executing `.rodata` strings as instructions. I've seen it. It's not fun.
>
> :angrygoose: Without `wfi`, parked harts spin in a tight loop burning 100% CPU. On QEMU it wastes host CPU time. On the VisionFive 2, it wastes real power and generates real heat. Always `wfi` in spin loops.

## How It Gets Compiled

We don't use an external assembler. In `main.rs`, one line pulls the assembly into the Rust compilation:

```rust
core::arch::global_asm!(include_str!("boot.S"));
```

`include_str!` reads the file at compile time. `global_asm!` passes it to LLVM's integrated assembler. The result: `_start` appears in our final ELF binary with no external tools needed.

## Verifying the Boot Code

After building (`make build`), you can verify `_start` is at the right address:

```bash
make objdump
```

You should see something like:

```
goose-os: file format elf64-littleriscv

Disassembly of section .text:

0000000080200000 <_start>:
80200000: e119          bnez a0, 80200006 <_park>
80200002: ...
```

If `_start` isn't at `0x80200000`, something is wrong with the linker script.

## Checkpoint

We now have the assembly bridge from hardware to Rust:

```
OpenSBI (M-mode)
    │
    ▼ jumps to 0x80200000
_start (boot.S, S-mode)
    ├── parks non-boot harts
    ├── zeros .bss
    ├── sets up stack
    └── calls kmain()
         │
         ▼
    Rust takes over (next chapter)
```

Next: the Rust side — `main.rs`, the UART driver, and "Hello World".
