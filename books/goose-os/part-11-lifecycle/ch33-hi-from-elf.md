---
sidebar_position: 2
sidebar_label: "Ch 33: Hi From ELF!"
title: "Chapter 33: Hi From ELF! — Spawning Our First Child Process"
---

# Chapter 33: Hi From ELF! — Spawning Our First Child Process

This chapter traces the complete execution of Phase 11's demo — from boot to "all processes finished." Three processes, two created by the kernel, one spawned at runtime from a hand-crafted ELF binary. A parent that waits for its child. A server that knows when to quit.

## The Cast

| PID | Name | Created by | Job |
|-----|------|-----------|-----|
| 1 | init | kernel (boot) | Spawns child, waits for it, reports result |
| 2 | server | kernel (boot) | RPC server: receives messages, prints them |
| 3 | child | PID 1 (SYS_SPAWN) | Prints "Hi!\n" via SYS_PUTCHAR, exits with code 42 |

## Init's Program (PID 1)

```asm
_user_init_start:
    li      s0, 2               # server PID
    li      s4, 0x5F000000      # child ELF mapped here by kernel
    li      s5, 180             # child ELF size (bytes)

    # Step 1: SYS_GETPID
    li      a7, 12              # SYS_GETPID
    ecall                       # → a0 = 1

    # Step 2: SYS_SPAWN child from ELF
    li      a7, 10              # SYS_SPAWN
    mv      a0, s4              # elf_ptr = 0x5F000000
    mv      a1, s5              # elf_len = 180
    ecall                       # → a0 = 3 (child PID)

    # Step 3: SYS_WAIT for child
    li      a7, 11              # SYS_WAIT
    mv      a0, s2              # child PID = 3
    ecall                       # → a0 = 42 (exit code)

    # Step 4: Report "Ok!\n" via RPC to server
    li a7, 4                    # SYS_CALL
    mv a0, s0                   # target = PID 2
    li a1, 'O'                  # message
    ecall
    # ... 'k', '!', '\n' ...

    # Step 5: Send quit signal (0xFF)
    li a7, 4
    mv a0, s0
    li a1, 0xFF
    ecall

    # Step 6: Exit
    li a7, 1                    # SYS_EXIT
    li a0, 0                    # code 0
    ecall
```

Six steps. Three new syscalls (GETPID, SPAWN, WAIT), four RPC calls (CALL), one exit. The entire lifecycle exercised in 30 instructions.

## The Child's Program (180 Bytes of ELF)

The child is a hand-crafted ELF binary, 180 bytes total:

```
┌──────────────────────────────────────────────────┐
│ ELF64 Header (64 bytes)                          │
│   magic: 7F 45 4C 46                             │
│   class: 64-bit, little-endian                   │
│   machine: RISC-V (0xF3)                         │
│   entry: 0x10078                                 │
│   phoff: 64, phnum: 1                            │
├──────────────────────────────────────────────────┤
│ Program Header (56 bytes)                        │
│   PT_LOAD: load entire file at VA 0x10000        │
│   flags: R+X, align: 0x1000                      │
├──────────────────────────────────────────────────┤
│ Code (60 bytes = 15 instructions)                │
│   PUTCHAR 'H'  (3 insns: li a7,0; li a0,'H'; ecall)  │
│   PUTCHAR 'i'                                    │
│   PUTCHAR '!'                                    │
│   PUTCHAR '\n'                                   │
│   EXIT 42       (3 insns: li a7,1; li a0,42; ecall)  │
└──────────────────────────────────────────────────┘
```

The entire binary — headers and code — lives in a single `const` array in the kernel. At boot, the kernel copies it into a page and maps that page into PID 1's address space at VA `0x5F000000`. When init calls `SYS_SPAWN(0x5F000000, 180)`, the kernel reads the ELF from user memory, parses it, and creates PID 3.

## The Server (PID 2) — Now With a Quit Signal

The server gains one new feature: it checks for `0xFF` as a quit signal:

```asm
1:  li      a7, 3           # SYS_RECEIVE
    li      a0, 0           # from any
    ecall

    mv      s0, a0          # message
    mv      s1, a1          # sender PID

    li      t0, 0xFF
    beq     s0, t0, .quit   # quit signal?

    li      a7, 0           # SYS_PUTCHAR
    mv      a0, s0
    ecall

    li      a7, 5           # SYS_REPLY
    mv      a0, s1
    li      a1, 0           # ACK
    ecall
    j       1b

.quit:
    li      a7, 5           # SYS_REPLY (reply before exit)
    mv      a0, s1
    li      a1, 0
    ecall
    li      a7, 1           # SYS_EXIT
    li      a0, 0
    ecall
```

Without the quit signal, the server would be stuck in `BlockedRecv` after init exits — a dead process consuming a slot. With it, all three processes exit cleanly.

## Execution Trace

Here's exactly what happens, step by step:

```
Time  Event                                State
────  ─────                                ─────
 1    Boot: create PID 1 (init)            PID 1: Ready
 2    Boot: create PID 2 (server)          PID 2: Ready
 3    Boot: map child ELF at 0x5F000000    (PID 1's page table updated)
 4    Launch PID 1                         PID 1: Running
 5    PID 1: SYS_GETPID → 1               PID 1: Running
 6    PID 1: SYS_SPAWN → PID 3 created    PID 3: Ready, PID 1: Running
 7    PID 1: SYS_WAIT(3) → block          PID 1: BlockedWait
 8    Schedule → PID 2                     PID 2: Running
 9    PID 2: SYS_RECEIVE → block          PID 2: BlockedRecv
10    Schedule → PID 3                     PID 3: Running
11    PID 3: PUTCHAR 'H'                   prints 'H'
12    PID 3: PUTCHAR 'i'                   prints 'i'
13    PID 3: PUTCHAR '!'                   prints '!'
14    PID 3: PUTCHAR '\n'                  prints newline
15    PID 3: SYS_EXIT(42)                  PID 3: Free
16      → Wake PID 1 (BlockedWait, a0=42) PID 1: Ready
17    Schedule → PID 1                     PID 1: Running
18    PID 1: SYS_CALL(2, 'O') → rendezvous PID 2: Ready, PID 1: BlockedCall
19    Schedule → PID 2                     PID 2: Running
20    PID 2: PUTCHAR 'O', REPLY            prints 'O', PID 1: Ready
21    PID 2: SYS_RECEIVE → block          PID 2: BlockedRecv
22    Schedule → PID 1                     PID 1: Running
       (repeat for 'k', '!', '\n')
23    PID 1: SYS_CALL(2, 0xFF) → quit     PID 2: Ready, PID 1: BlockedCall
24    Schedule → PID 2                     PID 2: Running
25    PID 2: REPLY, SYS_EXIT(0)           PID 2: Free, PID 1: Ready
26    Schedule → PID 1                     PID 1: Running
27    PID 1: SYS_EXIT(0)                  PID 1: Free
28    No runnable processes                → kernel idle loop
```

28 events. Three processes. Four different blocked states used (`BlockedWait`, `BlockedRecv`, `BlockedCall`, `BlockedSend`). The entire state machine exercised.

> :happygoose: Notice how the scheduler never picks a wrong process. At step 10, PID 1 is `BlockedWait` and PID 2 is `BlockedRecv`, so the only option is PID 3. At step 17, PID 3 is `Free` and PID 2 is `BlockedRecv`, so it picks PID 1. The simple linear scan `for i in 1..MAX_PROCS { if Ready... }` does exactly the right thing every time because our state machine is precise.

## QEMU Output

```
          __
       __( o)>     GooseOS v0.1.0 build 27
      \  _/        RISC-V 64-bit
       \\\         Written in Rust
        \\\        Platform: QEMU virt
         \   )_    Honk.
      ~~~^~~~~

  [proc] Creating processes...
  [proc] PID 1 created (code=0x8024f000, 124 bytes, ...)
  [proc] PID 2 created (code=0x80296000, 60 bytes, ...)
  [proc] Mapped child ELF (180 bytes) at VA 0x5f000000 for PID 1

  [page_alloc] 214 pages used, 32016 free

  [proc] Launching PID 1 (init)...

  [kernel] PID 3 spawned by PID 1 (entry=0x10078)
Hi!

  [kernel] PID 3 exited with code 42
Ok!

  [kernel] PID 2 exited with code 0

  [kernel] PID 1 exited with code 0
  [kernel] All processes finished.
  [kernel] Back in S-mode. Idle loop active.
```

"Hi!" — from the child process, spawned from a 180-byte ELF at runtime.
"Ok!" — from init, after collecting the child's exit code.

## VisionFive 2 Output

Same binary, real silicon:

```
          __
       __( o)>     GooseOS v0.1.0 build 28
      \  _/        RISC-V 64-bit
       \\\         Written in Rust
        \\\        Platform: StarFive VisionFive 2
         \   )_    Honk.
      ~~~^~~~~

  [kernel] PID 3 spawned by PID 1 (entry=0x10078)
Hi!
  [kernel] PID 3 exited with code 42
Ok!
  [kernel] PID 2 exited with code 0
  [kernel] PID 1 exited with code 0
  [kernel] All processes finished.
```

The hand-crafted ELF binary — every byte placed by us — executes correctly on real hardware. The ELF loader, the page table construction, the SUM-enabled user memory read, the parent-child lifecycle — all verified on silicon.

> :nerdygoose: 180 bytes. That's how small an ELF binary can be and still work. The Linux kernel's ELF loader (`fs/binfmt_elf.c`) handles dynamic linking, interpreter loading, ASLR, VDSO injection, audit hooks, security modules, personality flags, and core dump formatting. Ours validates five header fields and copies some bytes. The output is the same: a running process.

## What We Built

| Component | Lines | Purpose |
|-----------|-------|---------|
| `elf.rs` | ~80 | ELF64 parser (header + program headers) |
| `sys_spawn()` | ~70 | ELF loader + process creation |
| `sys_wait()` | ~25 | Block until child exits |
| `sys_getpid()` | ~3 | Return caller's PID |
| `sys_exit()` update | ~10 | Wake `BlockedWait` parents |
| `CHILD_ELF` | ~50 | Hand-crafted 180-byte ELF binary |
| Demo programs | ~80 | Init + server assembly |
| **Total** | **~320** | Complete process lifecycle |

Running total: **~2,500 lines** of kernel code + assembly, 13 syscalls, 7 process states.

## The Road Ahead

We now have everything a microkernel needs for basic operation:
- IPC (send/receive/call/reply)
- Memory management (alloc/free/map/unmap)
- Process lifecycle (spawn/wait/exit)

What's missing is **fairness**. Right now, a process runs until it voluntarily yields control via a syscall. A CPU-bound loop runs forever. Next up: preemptive scheduling with timer interrupts — the kernel takes control even from processes that don't want to give it up.
