---
sidebar_position: 1
sidebar_label: "Ch 34: Preemptive Scheduling"
title: "Chapter 34: Preemptive Scheduling — Taking Back Control"
---

# Chapter 34: Preemptive Scheduling — Taking Back Control

Until now, GooseOS has been *cooperative*. A process runs until it makes a syscall. If a process never calls the kernel — if it just loops forever in user mode — it owns the CPU for eternity. Every other process starves.

This is fine for well-behaved programs. It is catastrophic for everything else.

Preemptive scheduling fixes this. A hardware timer fires every 10 milliseconds. The kernel's trap handler checks: was a user process running? If yes, save its state, pick the next process, and switch. The interrupted process never knows it was stopped. It resumes later, exactly where it left off, with every register intact.

This is the mechanism that makes multitasking real.

## The Problem: Cooperative Starvation

Consider two processes:

```
PID 2 (spinner):
    loop:
        addi t0, t0, 1      # increment forever
        j loop               # no syscall, no ecall, nothing

PID 3 (goose):
    li a7, 0                 # SYS_PUTCHAR
    li a0, 'A'
    ecall                    # prints 'A'
    ...
```

Under cooperative scheduling, PID 2 runs first (it was spawned first), enters its loop, and never returns. PID 3 never gets a single instruction. The goose is silent. The spinner wins by being rude.

> :nerdygoose: This isn't a theoretical concern. Early versions of Windows (3.1, 95) and classic Mac OS used cooperative scheduling. A single buggy application could freeze the entire system. Windows NT and macOS switched to preemptive scheduling specifically because cooperative scheduling doesn't work when you can't trust every program on the machine.

## The Mechanism: Timer → Trap → Switch

RISC-V provides a supervisor timer interrupt. When the timer fires:

1. The CPU traps into S-mode, entering our `_trap_vector`
2. `trap.S` saves all registers to a `TrapFrame` on the kernel stack
3. `trap_handler()` reads `scause` — it's a timer interrupt (code 5)
4. `handle_timer()` checks `sstatus.SPP` (bit 8):
   - **1** = came from S-mode (kernel was running) — skip preemption
   - **0** = came from U-mode (user process was running) — preempt!
5. `preempt()` saves the current process's frame, loads the next process's frame
6. `trap.S` restores registers from the (now different) frame and `sret`s
7. The CPU resumes in U-mode — but in a *different process*

The user process sees nothing. From its perspective, two instructions executed back-to-back. It doesn't know that between them, the kernel saved 33 registers, scanned a process table, loaded a different page table, restored 33 different registers, and returned. The illusion is perfect.

## Timeslice: 10 Milliseconds

```rust
/// platform.rs
pub const TIMER_FREQ: u64 = 10_000_000;  // 10 MHz
pub const TIMESLICE: u64 = TIMER_FREQ / 100;  // 10 ms
```

Why 10ms? It's a balance between responsiveness and overhead:

| Timeslice | Context switches/sec | Overhead | Feel |
|-----------|---------------------|----------|------|
| 1 ms | 100/process | ~1% | Silky smooth, but wasteful |
| 10 ms | 10/process | ~0.01% | Good interleaving, negligible overhead |
| 50 ms | 2/process | ~0.002% | Chunky bursts, perceptible latency |
| 1 s | 1/process | trivial | Practically cooperative |

Linux uses 1-10ms (configurable via `CONFIG_HZ`). We use 10ms because it produces visible interleaving without flooding the system with context switches.

## Timer Arming: SBI ecall

RISC-V doesn't have a simple "set timer" instruction. The timer comparison register (`mtimecmp`) lives in M-mode, and we're in S-mode. We ask the SBI firmware to set it for us:

```rust
fn sbi_set_timer(when: u64) {
    unsafe {
        asm!(
            "li a7, 0x54494D45",  // SBI extension: TIME
            "li a6, 0",           // function: set_timer
            "mv a0, {0}",         // absolute time value
            "ecall",
            in(reg) when,
            ...
        );
    }
}
```

Each timer handler re-arms for the next tick:

```rust
fn handle_timer(frame: &mut TrapFrame) {
    let time = read_time();
    sbi_set_timer(time + platform::TIMESLICE);

    // Preempt if we came from user mode
    if frame.sstatus & (1 << 8) == 0 {
        crate::process::preempt(frame);
    }
}
```

The `sstatus.SPP` check is critical. If the kernel was running (handling a syscall, printing to UART), we don't preempt — the kernel is not preemptible in GooseOS. Only user processes get interrupted.

> :nerdygoose: Linux *is* kernel-preemptible (with `CONFIG_PREEMPT`). This means a timer can interrupt the kernel itself during non-critical sections. It requires fine-grained locking everywhere — spinlocks, RCU, per-CPU variables, preemption counters. We avoid all of this by only preempting user mode. On a single-hart system with a microkernel (where syscall handlers are short), this is a perfectly reasonable design.

## Round-Robin Scheduling

When the timer fires and a user process is running, `preempt()` picks the next process:

```rust
pub fn preempt(frame: &mut TrapFrame) {
    let current = CURRENT_PID;
    if current == 0 { return; }

    // Round-robin: scan from current+1, wrapping around
    let mut next = 0;
    for offset in 1..(MAX_PROCS - 1) {
        let i = ((current - 1 + offset) % (MAX_PROCS - 1)) + 1;
        if PROCS[i].state == ProcessState::Ready {
            next = i;
            break;
        }
    }

    if next == 0 { return; } // no one else to run

    // Save current, load next
    PROCS[current].context = *frame;
    PROCS[current].state = ProcessState::Ready;

    *frame = PROCS[next].context;
    PROCS[next].state = ProcessState::Running;
    CURRENT_PID = next;

    // Switch page table
    asm!("csrw satp, {0}", "sfence.vma zero, zero",
         in(reg) PROCS[next].satp);
}
```

The scanning formula `((current - 1 + offset) % (MAX_PROCS - 1)) + 1` wraps around PIDs 1..7, skipping PID 0 (kernel). If we're PID 3 with 5 active processes, we check: 4, 5, 6, 7, 1, 2. First `Ready` process wins.

This is pure round-robin — no priorities, no CPU accounting, no nice values. Every process gets the same timeslice. Simple, fair, and correct.

## Voluntary Yield: SYS_YIELD

Sometimes a process wants to give up its timeslice early:

```rust
pub fn sys_yield(frame: &mut TrapFrame) {
    frame.sepc += 4;
    let current = CURRENT_PID;

    // Is anyone else Ready?
    let mut found = false;
    for offset in 1..(MAX_PROCS - 1) {
        let i = ((current - 1 + offset) % (MAX_PROCS - 1)) + 1;
        if PROCS[i].state == ProcessState::Ready {
            found = true;
            break;
        }
    }
    if !found { return; } // we're alone — keep running

    PROCS[current].state = ProcessState::Ready;
    schedule(frame, current);
}
```

`SYS_YIELD` is a polite request. `preempt()` is a forcible takeover. Both use the same round-robin scan, the same TrapFrame overwrite mechanism, the same page table switch. The only difference is consent.

## The Context Switch: TrapFrame Overwrite

This is the trick that makes context switching work without any special "switch" instruction. Both `schedule()` and `preempt()` do the same thing:

```rust
// Save current process
PROCS[current].context = *frame;

// Load next process
*frame = PROCS[next].context;
```

The `frame` pointer points to the TrapFrame on the kernel stack — the same frame that `trap.S` saved at entry and will restore at exit. By overwriting it, we change *which process* `trap.S` restores. The assembly code in `trap.S` doesn't know or care. It saves registers, calls Rust, restores registers, calls `sret`. If the registers it restores belong to a different process than the ones it saved — that's a context switch.

```
Process A running
    ↓ timer interrupt
trap.S: save A's registers to frame
    ↓
trap_handler → handle_timer → preempt
    ↓
preempt: PROCS[A].context = *frame    (save A)
         *frame = PROCS[B].context    (load B)
         switch page table to B
    ↓
trap.S: restore frame (now B's registers!)
    ↓ sret
Process B running  ← magic happens here
```

## What We Built

| Component | What it does |
|-----------|-------------|
| `TIMESLICE` | 10ms timer interval (100 Hz scheduling) |
| `handle_timer()` | Re-arms timer, checks SPP, calls `preempt()` |
| `preempt()` | Round-robin context switch on timer interrupt |
| `sys_yield()` | Voluntary yield (SYS_YIELD = 13) |
| `schedule()` | Shared round-robin scanner for blocked processes |

Syscall count: **14** (added SYS_YIELD).

## The Road Ahead

The scheduler works. The timer fires. Processes get preempted. But does it *actually* produce fair CPU sharing? How do we prove it?

We need an adversary — a process that hogs the CPU on purpose — and innocent bystanders that should still get their turn. That's next: the Dining Geese demo.
