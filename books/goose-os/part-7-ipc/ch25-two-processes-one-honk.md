---
sidebar_position: 4
sidebar_label: "Ch 25: Two Processes, One Honk"
title: "Chapter 25: Two Processes, One Honk — Proving the Architecture"
---

# Chapter 25: Two Processes, One Honk — Proving the Architecture

Every chapter so far has built a mechanism. Trap vectors, page tables, ecall dispatch, IPC rendezvous, context switching. Mechanisms in isolation. This chapter puts them all together and asks the real question: **does it work?**

More importantly: **does the architecture hold?**

## Boot Output

Here's what GooseOS prints when Part 7 boots on QEMU:

```
          __
       __( o)>     GooseOS v0.1.0 build 13
      \  _/        RISC-V 64-bit
       \\\         Written in Rust
        \\\        Platform: QEMU virt
         \   )_    Honk.
      ~~~^~~~~

  Booted on hart 0
  DTB address:   0x87e00000
  Kernel entry:  0x80203b04

  [trap] stvec set to 0x8020016c
  [plic] UART0 (IRQ 10) enabled, context=1, threshold=0
  [uart] RX interrupts enabled
  [trap] timer armed (1s interval, timebase=10MHz)
  [trap] interrupts enabled (SEIE + STIE)
  [page_alloc] self-test passed (32232 pages, 125MB)
  [kvm] Building kernel page table...
    .text   0x80200000 - 0x80204d4c (R+X)
    .rodata 0x80205000 - 0x80206b48 (R  )
    .data   0x80207000 - 0x80207000 (R+W)
    .bss    0x80207000 - 0x80207010 (R+W)
    heap    0x80208000 - 0x87ff0000 (R+W)
    stack   0x87ff0000 - 0x88000000 (R+W)
    UART    0x10000000 - 0x10001000 (R+W, MMIO)
    PLIC    0x0c000000 - 0x0c400000 (R+W, MMIO)
  [kvm] Kernel page table at 0x80208000
  [kvm] Enabling Sv39 MMU (satp = 0x8000000000080208)...
  [kvm] MMU enabled — Sv39 active!
  [page_alloc] 69 pages used for page tables, 32163 free

  [proc] Creating processes...
  [proc] PID 1 created (code=0x80251000, 288) bytes, sp=0x80253000, satp=0x8000010000080253)
  [proc] PID 2 created (code=0x80254000, 28) bytes, sp=0x80256000, satp=0x8000020000080256)

  [page_alloc] 210 pages used, 32022 free

  [proc] Launching PID 1 (init)...

Honk! IPC works!

  [kernel] PID 1 exited with code 0
  [kernel] All processes finished.
  [kernel] Back in S-mode. Idle loop active.

  (Ctrl-A X to exit QEMU)
```

Let's read this like a forensic report.

### Phase 1–8: The Foundation

Everything through "MMU enabled" is unchanged from Part 6. The kernel boots, sets up traps, configures the PLIC, arms the timer, enables interrupts, initializes the page allocator, builds the kernel page table, and enables the MMU. 69 pages used for kernel page tables. 32,163 free. Business as usual.

### Phase 9: Process Creation

Two processes created:

**PID 1 (init):** 288 bytes of code. That's 72 RISC-V instructions — 17 SYS_SEND ecalls (one per character in "Honk! IPC works!\n"), plus setup and SYS_EXIT. Code page at 0x80251000, stack page at 0x80252000, page table root at 0x80253000. ASID = 1.

**PID 2 (UART server):** 28 bytes of code. Seven RISC-V instructions in a loop — SYS_RECEIVE, save result, SYS_PUTCHAR, loop. Code page at 0x80254000, stack page at 0x80255000, page table root at 0x80256000. ASID = 2.

**210 pages used.** 69 for the kernel page table + ~70 for PID 1's page table + ~70 for PID 2's page table + 4 for user code/stack pages. Each process's page table maps all kernel regions (without U bit) plus its own two user pages. That's a lot of page table overhead for two processes — but that's identity mapping for you. Every mapped region needs full Sv39 three-level walks.

### The IPC Dance

Then: `Honk! IPC works!`

Seventeen characters. Seventeen message transfers between PID 1 and PID 2. Let's count the operations:

For each character:
1. PID 1 calls SYS_SEND (ecall → trap → sys_send)
2. If PID 2 is BlockedRecv → rendezvous (direct transfer, no switch)
3. If PID 2 is Ready → PID 1 blocks, context switch to PID 2
4. PID 2 calls SYS_RECEIVE (ecall → trap → sys_receive)
5. If PID 1 is BlockedSend → rendezvous (direct transfer)
6. If no sender → PID 2 blocks, context switch to PID 1
7. PID 2 calls SYS_PUTCHAR (ecall → trap → UART write)
8. PID 2 loops to SYS_RECEIVE

That's roughly 3 ecalls per character (SEND + RECEIVE + PUTCHAR), 17 characters = **51 ecalls**. Plus approximately 17 context switches (each SEND without rendezvous triggers one, each RECEIVE without rendezvous triggers one). The exact number depends on the interleaving — some operations rendezvous immediately, some require a switch.

All 17 characters appear in order. No corruption. No missing bytes. No duplicates. The IPC system is correct.

### The Exit

PID 1 exits with code 0. The kernel marks its slot as Free. PID 2 is still alive — it's blocked on SYS_RECEIVE, waiting for more messages that will never come. But `sys_exit` looks for `Ready` processes, not `Blocked` ones. No one is Ready. The kernel prints "All processes finished," switches back to the kernel page table, rewrites the TrapFrame to return to S-mode, and srets into `post_process_exit()`.

> :angrygoose: PID 2 is technically still alive — blocked forever, waiting for messages from a dead process. This is a resource leak. In a production kernel, SYS_EXIT would scan the process table for anyone blocked on IPC with the dying process and unblock them with an error code. We don't do that. PID 2 is the walking dead. Fortunately, we're about to shut everything down anyway, so its existential crisis is short-lived.

## What We Proved

Seven properties, each building on the last:

### 1. Multi-Process Execution
Two processes, two page tables, two ASIDs. Both run to completion (PID 1) or block gracefully (PID 2). The process table works.

### 2. Context Switch Correctness
Every register save/restore is correct. PID 1 sends 17 messages without register corruption between context switches. `s0` (holding the target PID) survives every ecall. `a7` (holding the syscall number) is correctly set before every ecall. The TrapFrame overwrite mechanism works.

### 3. IPC Rendezvous
Both paths work — sender-first (PID 1 blocks, PID 2 receives later) and receiver-first (PID 2 blocks, PID 1 sends later). Messages transfer correctly. Return values are correct (sender gets 0, receiver gets message + sender PID).

### 4. Page Table Isolation
Each process runs with its own satp. Kernel pages are invisible to user code. User pages are per-process. satp switches happen correctly during context switches.

### 5. Privilege Transitions
U-mode → S-mode (ecall), S-mode → U-mode (sret), S-mode → S-mode (exit redirect). All three work. The sscratch convention (0 = S-mode, kernel_sp = U-mode) survives multiple round-trips.

### 6. Deadlock Detection
When PID 1 exits and PID 2 is blocked, `sys_exit` correctly detects "no runnable processes" and returns to the kernel instead of panicking with "deadlock." This is because exit checks for Ready processes — blocked processes aren't candidates.

### 7. Clean Kernel Recovery
After all processes finish, the kernel reclaims control. satp switches back to the kernel page table. S-mode is restored. The idle loop runs. Interrupts work (timer still ticks, UART still responds). The kernel didn't leak any state from the user processes.

## The Architecture So Far

Let's step back and look at what we've built — and more importantly, look at the shape of it. Architecture isn't about what code you wrote. It's about what constraints you chose.

```
┌──────────────────────────────────────────────────────┐
│                    GooseOS Architecture               │
│                                                      │
│   User Mode (U-mode)                                 │
│   ┌──────────┐     ┌──────────┐                     │
│   │  PID 1   │     │  PID 2   │                     │
│   │  init    │────►│ UART srv │                     │
│   │          │ IPC │          │                     │
│   └────┬─────┘     └────┬─────┘                     │
│        │                │                           │
│ ═══════╪════════════════╪════════════════════════════│
│        │ecall           │ecall                      │
│        ▼                ▼                           │
│   Supervisor Mode (S-mode)                          │
│   ┌──────────────────────────────────────────┐      │
│   │              Kernel                       │      │
│   │  ┌─────────┐  ┌───────┐  ┌────────────┐ │      │
│   │  │ Trap    │  │  IPC  │  │ Scheduler   │ │      │
│   │  │ Handler │─►│ Send  │─►│ schedule()  │ │      │
│   │  │         │  │ Recv  │  │             │ │      │
│   │  └─────────┘  └───────┘  └────────────┘ │      │
│   │  ┌─────────┐  ┌───────┐  ┌────────────┐ │      │
│   │  │ Page    │  │ UART  │  │ PLIC       │ │      │
│   │  │ Alloc   │  │ (MMIO)│  │ (IRQ)      │ │      │
│   │  └─────────┘  └───────┘  └────────────┘ │      │
│   └──────────────────────────────────────────┘      │
│                                                      │
│   Hardware                                           │
│   ┌──────────────────────────────────────────┐      │
│   │  RISC-V Hart  │  UART  │  PLIC  │  MMU  │      │
│   └──────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────┘
```

### What's in the kernel

- **Trap handler** — entry/exit for all privilege transitions
- **IPC** — sys_send, sys_receive (synchronous, zero-copy)
- **Scheduler** — linear scan, non-preemptive
- **Page allocator** — bitmap, 4KB pages, no free
- **Page table management** — build at process creation, never modified
- **UART driver** — still in kernel (SYS_PUTCHAR), should move out
- **PLIC** — interrupt routing, stays in kernel

### What's *not* in the kernel (by design)

- No filesystem
- No block device driver
- No network stack
- No memory allocator (beyond page-level)
- No signal mechanism
- No pipes, no sockets, no shared memory
- No thread support (one thread per process)

This is the microkernel manifesto: the kernel does IPC, scheduling, and memory management. *Everything else* belongs in userspace servers.

## Open Architectural Decisions

This is where the fun starts. Part 7 proves the mechanism works. Parts 8 and 9 will shape the architecture. There are real design decisions ahead, and each one has trade-offs worth discussing.

### Decision 1: Preemptive vs. Cooperative Scheduling

**Current state:** Cooperative. Processes only switch when they make a syscall (SEND, RECEIVE, EXIT). A process that loops without making syscalls runs forever.

**Option A: Stay cooperative.** Simple. Predictable. No priority inversion. But a buggy process can starve the system. seL4's formal verification assumes a preemptive scheduler, but its fast-path IPC is essentially cooperative.

**Option B: Add time-slice preemption.** The timer interrupt fires every 100ms (or whatever interval). If a process has been running too long, the timer handler triggers a context switch. This requires saving the process's TrapFrame from the *timer* interrupt (not from a syscall) and calling schedule(). Our trap.S already saves full state on timer interrupts — we just need to call schedule() instead of re-arming the timer.

**Option C: Priority-based preemption.** Processes have priorities. When a high-priority process is unblocked (by an IPC rendezvous), we immediately switch to it, even if the current process hasn't exhausted its time slice. This is how seL4 and QNX work. More complex, but essential for real-time systems.

**Trade-off:** B is straightforward and gives us fairness. C gives us real-time guarantees but adds priority inversion risks (what happens when a low-priority process holds a resource a high-priority process needs?). seL4 solves this with priority inheritance. We'd need to decide if that complexity is worth it.

### Decision 2: UART Driver — Where Should It Live?

**Current state:** SYS_PUTCHAR writes directly to the UART from the kernel trap handler. The "UART server" (PID 2) receives IPC messages and calls SYS_PUTCHAR — so the kernel is still doing the actual I/O.

**Option A: Keep SYS_PUTCHAR in the kernel.** Simple. Fast (one ecall to print a character). But violates the microkernel principle — device drivers shouldn't be in the kernel.

**Option B: Give PID 2 direct MMIO access.** Map the UART's physical page (0x10000000) into PID 2's page table with `USER_RW`. PID 2 can then write directly to the UART register without a syscall. SYS_PUTCHAR is removed from the kernel. This is the "capability" model — the UART server has a memory capability to the UART device.

**Option C: MMIO via SYS_GRANT.** Add a new syscall that lets the kernel grant a physical page mapping to a process. PID 2 calls `SYS_GRANT(uart_phys, USER_RW)` and gets the UART page mapped into its address space. This is more flexible than baking it into create_process().

**Trade-off:** B is simple but inflexible — MMIO mappings are decided at process creation. C is flexible but adds a syscall and requires the kernel to validate grants (can this process really have access to this physical address?). seL4 uses capabilities — typed objects that represent the *right* to access a resource. A process can only map a page if it holds a capability for that page. We could go that direction, but it's a big design commitment.

### Decision 3: Multi-Word Messages

**Current state:** Messages are one `usize` (64 bits). One character per IPC round-trip.

**Option A: Stay with single-word messages.** Simple. Every message is one register transfer. But sending a string of N characters requires N IPC round-trips.

**Option B: Message registers (seL4 model).** Use a0–a5 as message registers — up to 6 words per message. No memory access needed for small messages. For larger messages, use a shared IPC buffer page.

**Option C: Shared memory regions.** Processes share a memory page and use IPC only for synchronization (not data transfer). The sender writes data to shared memory, then sends a notification. The receiver reads from shared memory. This is how most high-performance IPC works in practice.

**Trade-off:** B is the "right" answer for a microkernel — it gives fast small messages and supports larger ones. C is faster for bulk data but requires shared memory management (which page? who owns it? what happens when one process exits?). For our UART server, even option A works fine — UART is 115200 baud, it can't accept characters faster than one per 87 microseconds anyway.

### Decision 4: Process Creation from Userspace

**Current state:** Processes are created by the kernel at boot (embedded via `global_asm!`). There's no way to create a process from userspace.

**Option A: Static processes only.** All processes are created at boot. No runtime process creation. This is the embedded RTOS model. Simple, predictable, but inflexible.

**Option B: SYS_SPAWN.** Add a syscall that creates a new process from a memory buffer. The parent provides the code, the kernel allocates a slot and page table. This is closer to Unix's fork+exec but without the fork.

**Option C: Capability-based process creation.** Processes hold capabilities (unforgeable tokens) that grant the right to create new processes. The kernel mediates creation but the *decision* is made by userspace. This is the seL4 model and it's elegant but complex.

**Trade-off:** For an educational OS, option A is honest — we control both the kernel and all user programs, so dynamic process creation is a luxury. Option B is the pragmatic middle ground. Option C is the "correct" microkernel answer but requires the full capability system.

### Decision 5: What Happens When PID 2 Sends to a Dead Process?

**Current state:** Nothing good. If PID 1 exits and PID 2 later tries to SEND to PID 1, it blocks forever. The slot is Free, but sys_send doesn't check for that.

This is a genuine bug, and fixing it reveals a design question: **how does a process learn that its communication partner is dead?**

**Option A: Error return.** SYS_SEND to a Free PID returns an error code (e.g., `a0 = usize::MAX`). The sender handles the error. Simple, but requires every sender to check for death after every message.

**Option B: Death notifications.** When a process exits, the kernel sends a notification to all processes that were blocked on IPC with it. This is the seL4 approach (via "notification objects"). More complex, but the receiver doesn't need to poll.

**Option C: Let it deadlock.** If you send to a dead process, that's your problem. The kernel doesn't babysit. This is the "you broke it, you own it" philosophy, which has a certain brutal honesty.

**Trade-off:** A is the minimum viable fix. B is the correct answer. C is the current state and it's not *wrong* so much as *incomplete*. For Part 8, option A would be the pragmatic choice.

## The Syscall Table — Seven Lines to a Microkernel

Here's what the complete GooseOS syscall interface looks like after Parts 6 and 7:

| # | Name | Args | Returns | Notes |
|---|------|------|---------|-------|
| 0 | SYS_PUTCHAR | a0=char | a0=0 | Temporary — moves to userspace |
| 1 | SYS_EXIT | a0=code | never | Frees slot |
| 2 | SYS_SEND | a0=target, a1=msg | a0=0 | Blocks until received |
| 3 | SYS_RECEIVE | a0=from (0=any) | a0=msg, a1=sender | Blocks until sent |
| 4 | SYS_YIELD | *(planned)* | | Voluntary preemption |
| 5 | SYS_GRANT | *(planned)* | | MMIO capability |
| 6 | SYS_CALL | *(planned)* | | Send + Receive (RPC) |

Seven syscalls. Compare:
- **seL4:** ~10 syscalls (Send, Recv, Call, Reply, Yield, plus capability operations)
- **QNX:** ~20 kernel calls (message passing + resource management)
- **Linux:** 450+ syscalls and counting

> :happygoose: There's a beautiful correlation in kernel design: the fewer syscalls, the smaller the trusted computing base, the more verifiable the kernel. seL4 was formally verified. QNX was certified for avionics (DO-178C). Linux has CVEs measured in hundreds per year. This isn't to say Linux is bad — it's incredibly capable. But capability comes at the cost of complexity, and complexity is the enemy of correctness. GooseOS is firmly in the "small and correct" camp. By choice, not by necessity. (Okay, also by necessity. We have 498 lines of Rust.)

## The Full Journey

```
Part 1:  Boot            → RISC-V boots, prints "Hello"
Part 2:  Console         → UART driver, println!() macro
Part 3:  Interrupts      → Trap vector, PLIC, timer ticks
Part 4:  Real Hardware   → VisionFive 2, deploy pipeline, SBI reset
Part 5:  Virtual Memory  → Page allocator, Sv39, identity map, MMU enable
Part 6:  Userspace       → U-mode process, ecall syscalls, isolation
Part 7:  IPC             → Two processes, synchronous messaging, context switch  ← YOU ARE HERE
```

Seven parts. Approximately 1,500 lines of Rust and 200 lines of assembly. Two platforms (QEMU and VisionFive 2). 39 host-side unit tests. A microkernel that boots, enables virtual memory, runs two isolated processes, passes messages between them, and recovers gracefully when they exit.

Not bad for a goose.

## What's Next

Part 8 will add preemptive scheduling — time slices, SYS_YIELD, and the timer-based context switch. Part 9 will add memory capabilities — the mechanism that lets userspace processes safely access MMIO devices.

But before we write a single line of code for Part 8, we need to decide: which scheduling model? What time quantum? Do we add priorities? Do we handle priority inversion? These are design decisions that shape the kernel's personality. We'll discuss them, argue about them, and then build exactly what we decide.

That's how you build an OS: one decision at a time, each one backed by understanding, not habit.

```bash
git checkout part-7   # (when it exists)
```
