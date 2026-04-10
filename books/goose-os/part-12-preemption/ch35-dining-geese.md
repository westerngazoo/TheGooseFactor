---
sidebar_position: 2
sidebar_label: "Ch 35: Dining Geese"
title: "Chapter 35: Dining Geese — Proving Preemption on Real Hardware"
---

# Chapter 35: Dining Geese — Proving Preemption on Real Hardware

The scheduler is built. The timer fires. `preempt()` swaps processes. But does it actually work? How do you prove that a CPU-bound process can't starve its neighbors?

You build a demo: one adversary that hogs the CPU, three polite geese that just want to print their names. If the geese print — the scheduler works. If the output is interleaved — preemption is happening mid-execution, not just between syscalls.

## The Cast

| PID | Name | Program | Job |
|-----|------|---------|-----|
| 1 | init | Embedded asm | Spawns everyone, waits for all, exits |
| 2 | Goose A | `GOOSE_ELF` | Prints 'A' × 50, with 5M-iteration delay between each |
| 3 | Goose B | `GOOSE_ELF` | Same program, prints 'B' × 50 |
| 4 | Goose C | `GOOSE_ELF` | Same program, prints 'C' × 50 |
| 5 | Spinner | `SPINNER_ELF` | Busy-loops 1M iterations, exits with code 99. No syscalls. |

The spinner is the adversary. It runs a tight loop — `addi`, `bne`, `addi`, `bne` — for one million iterations. It never calls `ecall`. Without preemption, it owns the CPU until it finishes, and the geese starve while it runs. With preemption, the 10ms timer fires mid-loop, the kernel saves the spinner's registers, and switches to a goose.

The geese are the proof. Each one calls `SYS_GETPID` to learn its PID, derives a character ('A' + PID - 2), then enters a loop: spin 5 million iterations (busy delay), call `SYS_PUTCHAR`, repeat 50 times. The busy delay is the preemption window — 5 million iterations at 1.5 GHz takes about 10ms, roughly one timeslice. If the timer fires during the delay, the goose gets preempted mid-computation.

## The Spinner: 148 Bytes of Hostility

```
┌──────────────────────────────────────────────────┐
│ ELF64 Header (64 bytes) + Program Header (56 bytes) │
├──────────────────────────────────────────────────┤
│ Code (28 bytes = 7 instructions)                 │
│                                                  │
│   li    t0, 0                  # counter = 0     │
│   lui   t1, 0x100              # limit = 1M      │
│   addi  t0, t0, 1              # counter++        │
│   bne   t0, t1, -4             # loop until 1M   │
│   li    a7, 1                  # SYS_EXIT         │
│   li    a0, 99                 # code = 99        │
│   ecall                        # goodbye          │
└──────────────────────────────────────────────────┘
```

Seven instructions. No syscalls in the hot loop. This is the simplest possible CPU hog — the kind of program that breaks cooperative schedulers.

## The Goose: 200 Bytes of Personality

```
┌──────────────────────────────────────────────────┐
│ ELF64 Header + Program Header (120 bytes)        │
├──────────────────────────────────────────────────┤
│ Code (80 bytes = 20 instructions)                │
│                                                  │
│   li    a7, 12                 # SYS_GETPID      │
│   ecall                        # → a0 = pid      │
│   addi  s0, a0, 63             # char = 'A' + pid - 2  │
│   li    s1, 50                 # print count      │
│ .loop:                                            │
│   beqz  s1, .done              # printed all 50?  │
│   lui   t0, 0x4C5              # ┐                │
│   addi  t0, t0, -1216          # ├ t0 = 5,000,000 │
│ .delay:                        # │                │
│   addi  t0, t0, -1             # ├ decrement      │
│   bne   t0, zero, .delay       # ┘ spin until 0   │
│   li    a7, 0                  # SYS_PUTCHAR      │
│   mv    a0, s0                 # char             │
│   ecall                        # print it         │
│   addi  s1, s1, -1             # count--          │
│   j     .loop                  # next iteration   │
│ .done:                                            │
│   li    a7, 0                  # SYS_PUTCHAR      │
│   li    a0, '\n'               # newline          │
│   ecall                                           │
│   li    a7, 1                  # SYS_EXIT         │
│   li    a0, 0                  # code 0           │
│   ecall                                           │
└──────────────────────────────────────────────────┘
```

All three geese run the same binary. `SYS_GETPID` returns a different PID for each instance. PID 2 computes `2 + 63 = 65 = 'A'`, PID 3 gets `'B'`, PID 4 gets `'C'`. One binary, three identities.

## Init: The Orchestrator

Init's job is straightforward: spawn everyone, wait for everyone, exit.

```asm
_user_init_start:
    # Spawn 3 geese first (PIDs 2, 3, 4)
    li      s0, 0x5F001000      # goose ELF address
    li      s1, 200             # goose ELF size

    li      a7, 10              # SYS_SPAWN
    mv      a0, s0
    mv      a1, s1
    ecall                       # → PID 2 (Goose A)
    mv      s4, a0

    # ... spawn B (PID 3) and C (PID 4) the same way ...

    # Spawn spinner last (PID 5)
    li      s2, 0x5F000000      # spinner ELF address
    li      s3, 148             # spinner size
    li      a7, 10              # SYS_SPAWN
    mv      a0, s2
    mv      a1, s3
    ecall                       # → PID 5

    # Wait for all 4 children
    li      a7, 11              # SYS_WAIT
    mv      a0, s4              # goose A
    ecall
    # ... wait for B, C, spinner ...

    # Exit
    li      a7, 1               # SYS_EXIT
    li      a0, 0
    ecall
```

The geese are spawned first so they get PIDs 2, 3, 4. The spinner is spawned last (PID 5). This avoids a subtle race: on fast hardware, the spinner can finish its 1M iterations before the last goose is spawned, freeing its PID slot. If the spinner had PID 2, that slot could be reused by the next spawn, confusing the PID-to-character mapping.

## The Five-Build Bug Hunt

The road from "compiles" to "beautiful interleaving on hardware" required five builds and three distinct bugs. Each one taught a lesson that matters beyond this demo.

### Bug 1: The Branch Offset (Builds 31-33)

The goose's delay loop needs two instructions:

```asm
.delay:
    addi  t0, t0, -1       # +28: decrement counter
    bne   t0, zero, .delay  # +32: loop back to .delay
```

In RISC-V's B-type encoding, the branch target is relative to the branch instruction itself. To jump to the instruction directly above (offset -4 bytes), we encode -4 in the immediate field.

Our first version encoded -8 — jumping back *two* instructions to the `lui` that sets the delay count:

```asm
    lui   t0, 0x4C5         # +24: t0 = 5,013,504
    addi  t0, t0, -1216     # +28: t0 = 4,999,936 → wait, no...
    bne   t0, zero, -8      # +32: jumps to +24, not +28!
```

The result: each iteration decrements t0 by 1, then the branch jumps back to `lui` which reloads it with 5 million. The counter never reaches zero. Infinite loop.

The fix was one bit in the B-type immediate: changing the encoded offset from -8 to -4. In the hex dump, byte index 9 of the `bne` instruction: `0x9C` → `0x9E`.

> :nerdygoose: This is why assemblers exist. Hand-encoding RISC-V instructions means hand-computing B-type immediates, which split the 13-bit offset across bits [31], [30:25], [11:8], and [7] of the instruction word. Getting one bit wrong doesn't cause a crash — it causes a silent infinite loop. The instruction is valid; the target is wrong.

### Bug 2: Delay Tuning (Builds 33-37)

Once the branch was fixed, we needed to tune the delay so that timer preemption would fire *during* the delay loop:

| Delay | Time per char (VF2) | Chars per 10ms slice | Result |
|-------|--------------------|--------------------|--------|
| 50K | ~0.05 ms | ~200 | All 50 chars in one slice. Sequential `AAAA...BBBB...` |
| 1M | ~1 ms | ~10 | Chunky bursts. `AAAAAAAAAAA` then `BBBBBBBBBBB` |
| 5M | ~10 ms | ~1-2 | Timer fires mid-delay. True interleaving. |

The delay has to be *close to the timeslice* to get fine-grained interleaving. Too short and a goose finishes its entire 50-char run before the first timer fires. Too long and QEMU's emulated CPU takes forever.

### Bug 3: The t0 Clobber (Build 37)

This was the nasty one. With the 5M delay on VF2 hardware, the geese printed 2-4 characters and then froze. The timer kept ticking (10 seconds, 20 seconds...) but no more output.

The problem was in `trap.S`. Here's the original register-save sequence:

```asm
_trap_save:
    addi    sp, sp, -272        # allocate TrapFrame
    sd      x1,   0x00(sp)      # save ra
    csrr    t0, sscratch         # ← t0 = user_sp (CLOBBERS t0!)
    sd      t0,   0x08(sp)      # save user_sp as frame.sp
    sd      x3,   0x10(sp)      # save gp
    sd      x4,   0x18(sp)      # save tp
    sd      x5,   0x20(sp)      # save t0 ← WRONG! This is user_sp, not t0!
```

The `csrr t0, sscratch` instruction uses t0 as a temporary to read the original stack pointer from `sscratch`. But t0 (register x5) already held the user process's value — in the goose's case, the delay loop counter, something like 3,247,881.

After the clobber, `sd x5, 0x20(sp)` saves `user_sp` (0x7FFF1000 ≈ 2.1 billion) as if it were the user's t0. When the goose resumes after preemption, it loads this corrupted t0 and starts counting down from 2 billion instead of 3 million.

2 billion iterations at 1.5 GHz takes about 1.3 seconds per character. For 50 characters, that's over a minute per goose. It didn't freeze — it was just *very, very slow*.

The fix: save t0 *before* using it as a temporary:

```asm
_trap_save:
    addi    sp, sp, -272
    sd      x1,   0x00(sp)      # save ra
    sd      x5,   0x20(sp)      # save t0 FIRST — before we clobber it!
    csrr    t0, sscratch         # now safe to use t0 as temp
    sd      t0,   0x08(sp)      # save user_sp
    sd      x3,   0x10(sp)      # save gp
    sd      x4,   0x18(sp)      # save tp
    # x5 already saved above
```

One line moved. Six builds to find it.

> :nerdygoose: This bug is invisible under cooperative scheduling. When a process voluntarily traps via `ecall`, the RISC-V calling convention says `t0`-`t6` are caller-saved — the process doesn't expect them to survive the call. Preemption is different. The timer fires at an *arbitrary* instruction. The process expects *every* register to be intact on resume. A register clobber that's harmless during `ecall` becomes catastrophic during timer preemption. This is why preemptive scheduling is harder than cooperative — you must save *everything*, and "everything" includes registers you're tempted to use as scratch space.

## The Money Shot

Build 39, VisionFive 2 hardware:

```
  [kernel] PID 2 spawned by PID 1 (entry=0x10078)
AA  [kernel] PID 3 spawned by PID 1 (entry=0x10078)
  [kernel] PID 4 spawned by PID 1 (entry=0x10078)
  [kernel] PID 5 spawned by PID 1 (entry=0x10078)
BBCC
  [kernel] PID 5 exited with code 99
AABBCCAAABBBCCCAABBCCAAABBBCCCAABBCCAAABBBCCCAABBCCAAABBBCCC
AABBCCAAABBBCCCAABBCCAAABBBCCCAABBCCAAABBBCCCAABBCCAAABBBCCC
AABBCCA
  [kernel] PID 2 exited with code 0
B
  [kernel] PID 3 exited with code 0
C
  [kernel] PID 4 exited with code 0

  [kernel] PID 1 exited with code 0
  [kernel] All processes finished.
```

Read the interleaving: `AABBCCAAABBBCCC`. The 10ms timer fires, preempts one goose, schedules the next. Each goose gets 1-3 characters per timeslice. The spinner (PID 5) takes its fair share of slices — burning CPU on nothing — but it can't starve the geese. When the spinner finishes its 1M iterations, it exits with code 99, and the geese split the CPU three ways.

For comparison, QEMU's output (build 38):

```
CABCABCBAACCBBABCACBABCBABABCACACABBBCACABCBACACAB
CBCABCABCBCBABCCABABCABCABBACCABCCABCBACABBBCACBBA
CABCABCBCABCACBCABCACABCBAABBCABACBCACBA
```

Beautifully random interleaving. On QEMU the emulated CPU speed differs from real hardware, so the ratio of "delay loop iterations per timeslice" is different — each goose gets roughly 1 character per slice, producing finer mixing.

Both prove the same thing: **the timer fires, the scheduler runs, processes share the CPU regardless of their behavior.**

## What It Takes

| Component | Lines changed | Purpose |
|-----------|-------------|---------|
| `platform.rs` | +3 | `TIMESLICE` constant (10ms) |
| `trap.rs` | +15 | Timer re-arms with `TIMESLICE`, calls `preempt()` on U-mode |
| `trap.S` | +2 | Save t0 before clobbering (the critical fix) |
| `process.rs` | +60 | `preempt()`, `sys_yield()`, `SPINNER_ELF`, `GOOSE_ELF`, updated init |
| **Total** | **~80** | Preemptive round-robin scheduling |

Running total: **~2,600 lines** of kernel code + assembly, 14 syscalls, 7 process states.

## The State of GooseOS

After Phase 12, GooseOS has:

- **Boot** — M-mode → S-mode handoff, UART, PLIC, DTB
- **Virtual memory** — Sv39 page tables, kernel + user mappings
- **Trap handling** — interrupts, exceptions, ecall dispatch
- **Userspace** — U-mode processes with isolated address spaces
- **IPC** — synchronous send/receive/call/reply (seL4 model)
- **Memory management** — alloc/free/map/unmap syscalls
- **Process lifecycle** — spawn from ELF, wait, exit, getpid
- **Preemptive scheduling** — timer-driven round-robin, 10ms timeslice

It's a microkernel. A small one — 2,600 lines — but it has every mechanism a real microkernel needs. What it doesn't have yet is *policy*. The scheduler is pure round-robin. The memory allocator is first-fit. There's no filesystem, no device drivers beyond UART, no network stack.

Those are all userspace concerns in a microkernel. The kernel's job is to provide the mechanisms — IPC, memory, scheduling — and get out of the way. By that measure, GooseOS is done with the hard part. Everything from here is servers.
