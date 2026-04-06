---
sidebar_position: 3
sidebar_label: "Ch 24: Context Switching"
title: "Chapter 24: Context Switching — The Soul Transplant"
---

# Chapter 24: Context Switching — The Soul Transplant

Context switching is the most overloaded term in OS development. Ask five people what it means and you'll get six answers, two of them wrong. So let's be precise.

A context switch in GooseOS means: **stop running Process A, save its entire register state, load Process B's saved register state, switch page tables, and resume Process B as if it was never interrupted.**

The process being switched *out* has no idea it stopped. The process being switched *in* has no idea it wasn't running the whole time. From their perspectives, time is continuous. From the kernel's perspective, we just swapped one soul for another in the same body.

Welcome to the transplant ward.

## The Design Space

There are roughly three approaches to context switching in OS kernels. Understanding all three is important because each one reveals a trade-off between simplicity, performance, and correctness.

### Approach 1: Dedicated Context Switch Function (Linux, xv6)

The classical approach. You write a `switch()` function in assembly that:
1. Saves the current process's callee-saved registers (s0–s11, ra, sp) to a context struct
2. Loads the next process's callee-saved registers from its context struct
3. Returns — but the `ret` goes to the *new* process's saved `ra`

This is how Linux does it (`__switch_to`), how xv6 does it (`swtch`), and how most teaching OSes do it.

```
   Process A                    Kernel                    Process B
       │                          │                          │
       ├── ecall ──────────►     │                          │
       │                    save A's regs                    │
       │                    call switch()                    │
       │                      save s0–s11,ra,sp ──► A.ctx   │
       │                      B.ctx ──► load s0–s11,ra,sp   │
       │                    ret (to B's ra)                  │
       │                    restore B's regs                 │
       │                          │ ◄──────── sret ─────────┤
       │                          │                          │
```

**Pros:** Clean separation. The switch function is self-contained. You can call it from anywhere in the kernel.

**Cons:** You need *two* save/restore sequences per context switch — the trap handler saves all registers, then the switch function saves callee-saved registers again. Redundant work. Also, the switch function itself is a critical piece of assembly that needs to be correct, and it introduces another stack frame.

### Approach 2: TrapFrame Overwrite (GooseOS, some microkernels)

Our approach. Instead of a separate switch function, we **overwrite the TrapFrame on the kernel stack** with the next process's saved context. When the trap handler returns and `trap.S` restores registers and srets, it restores the *new* process's registers and srets to the *new* process's code.

```
   Process A                    Kernel Stack                Process B
       │                          │                          │
       ├── ecall ──────────►     │                          │
       │                    ┌─ TrapFrame (A's regs) ─┐      │
       │                    │  ra, sp, a0, a1, ...    │      │
       │                    │  sstatus, sepc          │      │
       │                    └─────────────────────────┘      │
       │                    trap_handler() runs              │
       │                    sys_send() blocks A              │
       │                    schedule():                      │
       │                      PROCS[A].context = *frame      │
       │                      *frame = PROCS[B].context      │
       │                    ┌─ TrapFrame (B's regs) ─┐      │
       │                    │  ra, sp, a0, a1, ...    │      │
       │                    │  sstatus, sepc          │      │
       │                    └─────────────────────────┘      │
       │                    csrw satp (B's page table)       │
       │                    return to trap.S                  │
       │                    trap.S restores B's regs         │
       │                          │ ────── sret ────────►    │
       │                          │                          │
```

**Pros:** No separate switch function. No extra assembly. No redundant register saves. The trap entry code (`trap.S`) already saves all 31 registers — we just reuse that frame. The context switch is a `memcpy` (struct assignment in Rust). Dirt simple.

**Cons:** The switch can only happen inside a trap handler — you can't switch "spontaneously" from kernel code. That's fine for a microkernel where all process transitions go through syscalls. It would be a problem for a monolithic kernel that wants to switch during a long-running filesystem operation.

### Approach 3: User-Level Context Switch (Exokernel, some RTOSes)

Save/restore happens entirely in hardware or in a minimal shim. The kernel barely participates. This is exotic and we won't use it, but it's worth knowing exists.

### Why We Chose Approach 2

For a microkernel, the TrapFrame overwrite is *structurally perfect*:

1. **Every process transition is a syscall.** SEND, RECEIVE, EXIT — all ecalls. Every ecall goes through `trap.S`, which saves the full TrapFrame. We always have a complete register snapshot when we need to switch.

2. **No extra assembly.** The context switch is literally `*frame = PROCS[next].context` — a Rust struct copy. 264 bytes (33 fields × 8 bytes). The compiler generates a `memcpy`. No hand-written assembly, no register juggling, no stack frame manipulation.

3. **Correctness by construction.** There's only one save path (trap.S entry) and one restore path (trap.S exit). Every process goes through the same code. Every register is saved. Every register is restored. There's no "oops, I forgot to save s3 in the switch function" bug because there is no switch function.

4. **The trap handler is the scheduler.** In our design, the scheduler runs as part of the trap handler — between "save all registers" and "restore all registers." It just changes *which* registers get restored. This is elegant in the mathematical sense: the trap handler is a function from TrapFrame to TrapFrame, and the scheduler is a map that redirects which TrapFrame gets output.

> :nerdygoose: This approach has a name in the academic literature: "kernel entry continuation." The idea is that when a syscall blocks, the kernel doesn't need to create a continuation or save a separate context — the trap frame *is* the continuation. The trap handler's restore path *is* the resume mechanism. seL4 uses a similar approach for fast-path IPC, though their implementation is considerably more optimized (they avoid saving/restoring registers that the IPC doesn't touch).

## The schedule() Function

Here's the complete context switch. It's terrifyingly short:

```rust title="src/process.rs — schedule()"
/// Save current process and switch to the next ready process.
///
/// Called when a process blocks (SEND/RECEIVE with no rendezvous).
/// The frame on the kernel stack is overwritten with the next process's
/// saved context. When we return to trap.S, it restores and srets to
/// the next process. Elegant — no special context switch code needed.
unsafe fn schedule(frame: &mut TrapFrame, blocked_pid: usize) {
    // Save current process's registers
    PROCS[blocked_pid].context = *frame;

    // Find next ready process (simple linear scan)
    let mut next = 0;
    for i in 1..MAX_PROCS {
        if PROCS[i].state == ProcessState::Ready {
            next = i;
            break;
        }
    }

    if next == 0 {
        // All processes blocked — deadlock
        panic!("Deadlock: no runnable processes (PID {} blocked)", blocked_pid);
    }

    // Load next process's context onto the kernel stack
    *frame = PROCS[next].context;
    PROCS[next].state = ProcessState::Running;
    CURRENT_PID = next;

    // Switch page table
    let next_satp = PROCS[next].satp;
    asm!(
        "csrw satp, {0}",
        "sfence.vma zero, zero",
        in(reg) next_satp,
    );
}
```

Five steps. Let's trace each one:

### Step 1: Save the blocked process

```rust
PROCS[blocked_pid].context = *frame;
```

The `frame` pointer points to the TrapFrame that `trap.S` allocated on the kernel stack. It contains the blocked process's complete register state — exactly as it was when the ecall fired. We copy it into the process table. This is the "freeze" operation: the process's soul is preserved in amber.

### Step 2: Find the next process

```rust
let mut next = 0;
for i in 1..MAX_PROCS {
    if PROCS[i].state == ProcessState::Ready {
        next = i;
        break;
    }
}
```

Linear scan. Start at PID 1, find the first `Ready` process. This is not a sophisticated scheduler. There's no priority, no fairness, no time quantum. The first Ready process wins. For two processes doing ping-pong IPC, this is perfect — they alternate naturally.

A real scheduler would use a run queue, priority levels, maybe a red-black tree (Linux's CFS uses one). We use a for loop over 8 elements. When you have 8 processes, a for loop *is* your run queue.

### Step 3: Handle deadlock

```rust
if next == 0 {
    panic!("Deadlock: no runnable processes (PID {} blocked)", blocked_pid);
}
```

If every process is either Free or Blocked, we're stuck. No one will ever unblock anyone. This is a deadlock. In a production kernel, you might have a timeout or a watchdog. We have a panic. Because if your 8-process microkernel deadlocks, you have a design bug, not a runtime problem.

> :angrygoose: "But what about the idle process?" Some kernels have a special idle process (PID 0) that runs when nothing else can. It just executes `wfi` (wait for interrupt) in a loop. We don't have that. In our design, if all processes block, it's a bug — someone should be waiting for external input (like UART interrupts) that would unblock them. We'll add an idle process if we add preemptive scheduling. For now, deadlock = death. Which is also true in real life, but that's a different kind of operating system.

### Step 4: Load the next process

```rust
*frame = PROCS[next].context;
PROCS[next].state = ProcessState::Running;
CURRENT_PID = next;
```

**This is the context switch.** That first line — `*frame = PROCS[next].context` — overwrites the TrapFrame on the kernel stack with the next process's saved registers. When `schedule()` returns, and `sys_send()`/`sys_receive()` returns, and `trap_handler()` returns, control goes back to `trap.S`. The assembly code does:

```asm
ld      t0, 0x100(sp)      # sepc ← next process's saved sepc
csrw    sepc, t0
ld      t0, 0xF8(sp)       # sstatus ← next process's saved sstatus
csrw    sstatus, t0
...
ld      x10, 0x48(sp)      # a0 ← next process's saved a0
ld      x11, 0x50(sp)      # a1 ← next process's saved a1
...
sret                        # jump to sepc, which is the NEXT process
```

The restore code doesn't know and doesn't care that we swapped the frame. It just reads the TrapFrame and restores. It's like changing the script on a teleprompter while the actor isn't looking — they'll read whatever's there.

### Step 5: Switch address space

```rust
let next_satp = PROCS[next].satp;
asm!(
    "csrw satp, {0}",
    "sfence.vma zero, zero",
    in(reg) next_satp,
);
```

Write the next process's satp (page table root + ASID) to the satp CSR and flush the TLB. After this, all memory accesses go through the next process's page table. The kernel regions are still accessible (they're mapped in every process's table, without the U bit). But user-accessible pages now belong to the next process.

The `sfence.vma` is mandatory. Without it, stale TLB entries from the old process might serve translations for the new one. On a machine with ASIDs (Address Space Identifiers), we could do a targeted flush — `sfence.vma zero, {asid}` — to only flush entries for the old ASID. We flush everything because it's simpler and correctness matters more than TLB performance right now.

## Why sfence.vma Matters

Let's take a detour into why the TLB flush is non-negotiable.

The TLB (Translation Lookaside Buffer) is a hardware cache of page table translations. When the CPU translates virtual address 0x8024d000 to physical address 0x8024d000, it stores the result in the TLB. Next time it accesses 0x8024d000, it doesn't walk the page table — it uses the cached translation.

When we switch page tables (write a new satp), the page table has changed. But the TLB might still have *old* entries. If PID 1's code was at physical 0x8024d000 and PID 2's code is at physical 0x80250000, but the TLB still has the stale entry VA 0x8024d000 → PA 0x8024d000, PID 2 would execute PID 1's code. That's a security violation and a correctness bug rolled into one.

```
Without sfence.vma:
  TLB: [VA 0x8024d000 → PA 0x8024d000, ASID=1]  (stale, from PID 1)
  satp: now points to PID 2's page table
  CPU fetches VA 0x8024d000 → TLB hit → PA 0x8024d000 → PID 1's code
  ☠️  Wrong process's code executing

With sfence.vma:
  TLB: [empty]
  satp: now points to PID 2's page table
  CPU fetches VA 0x8024d000 → TLB miss → page walk → PA 0x80250000 → PID 2's code
  ✓  Correct
```

> :surprisedgoose: ASIDs were invented to avoid this full TLB flush. Each TLB entry is tagged with an ASID. When satp changes, the CPU only uses entries whose ASID matches the current satp's ASID field. Entries from other processes remain in the TLB but are invisible. This means you can switch between processes without flushing — the TLB effectively has per-process namespaces. We *set* ASIDs (PID 1 = ASID 1, PID 2 = ASID 2) but still do a full flush. Optimization for later. For now, `sfence.vma zero, zero` — nuke everything, be correct.

## SYS_EXIT: Death and Rebirth

When a process calls SYS_EXIT, we need to handle two cases:

1. Another process is Ready → switch to it
2. No processes remain → return to kernel idle loop

```rust title="src/process.rs — sys_exit()"
/// SYS_EXIT(code) — terminate the current process.
///
/// Frees the process slot and switches to the next ready process.
/// If no processes remain, returns to kernel idle loop.
pub fn sys_exit(frame: &mut TrapFrame) {
    let current = unsafe { CURRENT_PID };
    let exit_code = frame.a0;

    println!();
    println!("  [kernel] PID {} exited with code {}", current, exit_code);

    unsafe {
        PROCS[current].state = ProcessState::Free;

        // Find next ready process
        let mut next = 0;
        for i in 1..MAX_PROCS {
            if PROCS[i].state == ProcessState::Ready {
                next = i;
                break;
            }
        }

        if next == 0 {
            // No runnable processes — return to kernel
            println!("  [kernel] All processes finished.");

            let kernel_satp = crate::kvm::kernel_satp();
            asm!(
                "csrw satp, {0}",
                "sfence.vma zero, zero",
                in(reg) kernel_satp,
            );

            // Rewrite frame to return to S-mode at post_process_exit
            frame.sstatus |= 1 << 8;  // SPP = S-mode
            frame.sstatus |= 1 << 5;  // SPIE = 1
            frame.sepc = crate::trap::post_process_exit as *const () as usize;
            return;
        }

        // Switch to next process
        *frame = PROCS[next].context;
        PROCS[next].state = ProcessState::Running;
        CURRENT_PID = next;

        let next_satp = PROCS[next].satp;
        asm!(
            "csrw satp, {0}",
            "sfence.vma zero, zero",
            in(reg) next_satp,
        );
    }
}
```

### The Normal Case: Another Process Exists

Same as `schedule()`: overwrite the frame with the next process's context, switch satp. The dead process's slot is marked Free. Its page table and pages *aren't* freed — we don't have page deallocation yet. That's a memory leak. In a long-running system, this would be a problem. In an educational kernel that runs two processes and exits, it's fine.

> :angrygoose: "You have a memory leak and you're *bragging* about it?" Look, page deallocation requires a free list or reference counting. Reference counting requires handling the case where a page is shared between processes (copy-on-write, shared libraries). Shared pages require tracking which processes map which pages. That's a capability system. That's Part 9. We're on Part 7. One war at a time.

### The Terminal Case: No Processes Left

This is the interesting path. Every process is Free or Blocked. The system is "done." We need to return to the kernel idle loop (`post_process_exit()` in trap.rs).

But we're inside a trap handler. The current trap frame belongs to a user process that just died. We can't just return to the dead process's code. We need to redirect the trap handler's return path to kernel code.

**The trick: rewrite the TrapFrame to return to S-mode.**

```rust
frame.sstatus |= 1 << 8;  // SPP = S-mode
frame.sstatus |= 1 << 5;  // SPIE = 1
frame.sepc = crate::trap::post_process_exit as *const () as usize;
```

Three lines that change the universe:

- **SPP = 1**: `sret` will go to S-mode instead of U-mode. The kernel reclaims privilege.
- **SPIE = 1**: Interrupts will be enabled after sret. The idle loop needs interrupts (UART, timer).
- **sepc = post_process_exit**: `sret` will jump to the kernel's idle loop function instead of user code.

We also switch satp back to the kernel page table before returning. When `trap.S` checks SPP and takes the S-mode restore path, it restores the frame we just rewrote, executes `sret`, and lands in `post_process_exit()` — a Rust function in S-mode with the kernel page table active.

```
The Great Redirect:
  User process calls SYS_EXIT
  → trap.S saves frame {sepc=user_code, SPP=0}
  → trap_handler → sys_exit
  → No more processes
  → Rewrite frame: {sepc=post_process_exit, SPP=1}
  → Return to trap.S
  → trap.S restores frame, sret
  → CPU: SPP=1 → S-mode, jump to post_process_exit
  → Kernel idle loop running in S-mode with kernel satp
  → The circle of life
```

> :happygoose: This trick — rewriting the TrapFrame to redirect sret — is the same technique seL4 uses for exception delivery. When a process faults, seL4 doesn't deliver a signal (like Unix). It rewrites the process's reply cap so the next IPC return sends it to a fault handler instead of its original caller. Same principle: don't invent a new mechanism, just redirect the existing one. The trap handler already restores and srets. Just change where it srets *to*.

## The Complete Flow: Trap Entry Through Context Switch

Let's zoom out and see the full picture — every assembly instruction and Rust function call from the moment PID 1 does an ecall to the moment PID 2 starts running:

```
PID 1 executes:  ecall              (SYS_SEND, a7=2, a0=2, a1='H')
                 │
                 ▼
CPU hardware:    sepc ← pc          (save return address)
                 scause ← 8         (ecall from U-mode)
                 sstatus.SPP ← 0    (came from U-mode)
                 SIE ← 0            (disable interrupts)
                 pc ← stvec         (jump to trap vector)
                 │
                 ▼
trap.S:          csrrw sp, sscratch, sp    (sp=kernel_sp, sscratch=user_sp)
                 addi sp, sp, -272         (allocate TrapFrame)
                 sd x1..x31 → frame       (save ALL registers)
                 sd sstatus, sepc → frame  (save CSRs)
                 csrw sscratch, zero       (mark: we're in S-mode now)
                 mv a0, sp                 (frame pointer as argument)
                 call trap_handler
                 │
                 ▼
trap.rs:         trap_handler(frame)
                   scause = 8 (ecall from U-mode)
                   → handle_ecall(frame)
                     a7 = 2 (SYS_SEND)
                     → process::sys_send(frame)
                 │
                 ▼
process.rs:      sys_send(frame)
                   frame.sepc += 4                    (skip ecall instruction)
                   target PID 2 is Ready, not BlockedRecv
                   → block PID 1 (BlockedSend)
                   → schedule(frame, 1)
                     PROCS[1].context = *frame         (save PID 1's state)
                     next = 2 (Ready)
                     *frame = PROCS[2].context         (load PID 2's state)
                     PROCS[2].state = Running
                     CURRENT_PID = 2
                     csrw satp, PID2_satp              (switch page table)
                     sfence.vma                        (flush TLB)
                   ← schedule returns
                 ← sys_send returns
                 ← handle_ecall returns
                 ← trap_handler returns
                 │
                 ▼
trap.S:          ld sepc, sstatus from frame    (PID 2's sepc and sstatus!)
                 csrw sepc, PID2_sepc
                 csrw sstatus, PID2_sstatus
                 sstatus.SPP = 0 → U-mode restore path
                 ld x1..x31 from frame          (PID 2's registers!)
                 csrrw sp, sscratch, sp          (sp=PID2_user_sp, sscratch=kernel_sp)
                 sret
                 │
                 ▼
CPU hardware:    SIE ← SPIE                (enable interrupts)
                 privilege ← U-mode         (SPP = 0)
                 pc ← sepc                  (PID 2's entry point)
                 │
                 ▼
PID 2 runs:      first instruction of UART server
```

That's it. The entire context switch. No special switch function. No separate assembly routine. Just: save to table, overwrite frame, change satp, return through the existing restore path.

## Architectural Decision: One Kernel Stack

Notice something about the flow above: there's only **one kernel stack**. Both processes share it. When PID 1 traps in, `trap.S` allocates a TrapFrame on the kernel stack. When we switch to PID 2, we overwrite that TrapFrame. When PID 2 eventually traps in again, `trap.S` allocates a TrapFrame on the same stack.

This works because we never have two processes in the kernel *simultaneously*. Interrupts are disabled during syscall handling. There's one hart. There's one stack. There's one TrapFrame at a time.

```
Kernel stack (one, shared):
┌──────────────────────────┐  ← _stack_top
│                          │
│    (unused space)        │
│                          │
├──────────────────────────┤  ← sp after TrapFrame allocation
│    TrapFrame             │
│    (272 bytes)           │
│    whoever is trapping   │
├──────────────────────────┤
│                          │
│    kernel function       │
│    call frames           │
│    (trap_handler,        │
│     sys_send, etc.)      │
│                          │
└──────────────────────────┘  ← bottom of stack
```

Linux uses per-process kernel stacks — each process gets its own 8KB or 16KB kernel stack. This allows multiple processes to be "in the kernel" at the same time (handling page faults, waiting on I/O, etc.). We don't need that. In a microkernel, syscalls are fast — they either complete immediately (rendezvous) or block (context switch). No syscall ever "waits" inside the kernel. The kernel is a trampoline: you bounce in, something happens, you bounce out.

> :nerdygoose: Per-process kernel stacks are required for preemptive multitasking in the kernel itself — where a kernel thread can be interrupted by a timer and switched out while deep in a syscall. Microkernels avoid this entirely. The kernel is non-preemptible: once you enter a syscall, you run to completion (or explicitly yield via schedule). This makes the kernel code much simpler to reason about — no locks needed for kernel data structures, because no two execution contexts ever access them concurrently. The price is that a buggy syscall handler can hang the system. The benefit is that correct syscall handlers are *provably* correct.

## What We Changed

| File | Change |
|------|--------|
| `src/process.rs` | Added `schedule()` — TrapFrame overwrite context switch |
| `src/process.rs` | Added `sys_exit()` — process termination + redirect-to-S-mode trick |

## What's Next

We have the pieces: process table, IPC, context switch. Chapter 25 puts them all together — tracing the complete boot, the 17-character IPC dance between PID 1 and PID 2, and what it all proves about our microkernel architecture.
