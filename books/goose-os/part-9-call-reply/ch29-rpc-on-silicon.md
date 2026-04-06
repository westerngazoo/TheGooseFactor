---
sidebar_position: 2
sidebar_label: "Ch 29: RPC on Silicon"
title: "Chapter 29: RPC on Silicon — From Theory to 'Honk! RPC works!'"
---

# Chapter 29: RPC on Silicon — From Theory to "Honk! RPC works!"

Chapter 28 designed the protocol. This chapter writes the code, builds the demo programs, and runs them on real hardware. By the end, we'll have a client-server RPC system running on the VisionFive 2 — two processes communicating through the kernel using one ecall per request.

## sys_call(): The Kernel Side

The implementation is surprisingly compact. Here's what happens when a process executes `ecall` with `a7=4`:

```rust
pub fn sys_call(frame: &mut TrapFrame) {
    frame.sepc += 4; // advance past ecall (saved with context)

    let current = unsafe { CURRENT_PID };
    let target_pid = frame.a0;
    let msg_value = frame.a1;

    // Validate target
    if target_pid == 0 || target_pid >= MAX_PROCS || target_pid == current {
        frame.a0 = usize::MAX; // error
        return;
    }

    unsafe {
        let target_state = PROCS[target_pid].state;
        let target_wants = PROCS[target_pid].ipc_target;

        // Check if target is blocked on RECEIVE (from us or from any)
        if target_state == ProcessState::BlockedRecv
            && (target_wants == 0 || target_wants == current)
        {
            // Rendezvous! Deliver message to receiver's saved context.
            PROCS[target_pid].context.a0 = msg_value;
            PROCS[target_pid].context.a1 = current;
            PROCS[target_pid].state = ProcessState::Ready;
        }

        // Caller ALWAYS blocks — even after rendezvous.
        PROCS[current].ipc_target = target_pid;
        PROCS[current].ipc_value = msg_value;
        PROCS[current].state = ProcessState::BlockedCall;

        schedule(frame, current);
    }
}
```

Three things to notice:

**1. sepc advances before anything else.** The `frame.sepc += 4` at the top ensures that when this process eventually resumes (after SYS_REPLY unblocks it), it returns to the instruction *after* the ecall. Since `schedule()` saves the entire frame to the process table, the advanced sepc is preserved through the full round-trip.

**2. The caller always blocks.** Unlike `sys_send()`, which returns immediately on rendezvous, `sys_call()` falls through to the blocking path regardless. Even if the target was already waiting in RECEIVE and we delivered the message instantly, we still set our state to BlockedCall and call `schedule()`. The caller can only be freed by SYS_REPLY.

**3. The rendezvous is optional.** If the target isn't in BlockedRecv, we skip straight to blocking. The message sits in `ipc_value` until the target eventually calls SYS_RECEIVE, which will find us in the BlockedCall state and pick up the message.

## sys_reply(): Even Simpler

```rust
pub fn sys_reply(frame: &mut TrapFrame) {
    frame.sepc += 4;

    let current = unsafe { CURRENT_PID };
    let target_pid = frame.a0;
    let reply_value = frame.a1;

    // Validate target
    if target_pid == 0 || target_pid >= MAX_PROCS || target_pid == current {
        frame.a0 = usize::MAX;
        return;
    }

    unsafe {
        // Target must be BlockedCall AND must have called us
        if PROCS[target_pid].state == ProcessState::BlockedCall
            && PROCS[target_pid].ipc_target == current
        {
            // Deliver reply to caller's saved context
            PROCS[target_pid].context.a0 = reply_value;
            PROCS[target_pid].state = ProcessState::Ready;

            // Server continues — non-blocking
            frame.a0 = 0;
            return;
        }

        // No matching BlockedCall — error
        frame.a0 = usize::MAX;
    }
}
```

The key line is `PROCS[target_pid].context.a0 = reply_value`. This writes directly into the caller's saved register file. When the caller eventually gets scheduled and the trap return restores its frame, `a0` will contain the reply value. The caller never sees the intermediate states — from its perspective, it did `ecall` and woke up with the answer in `a0`.

Notice what's *not* here: no `schedule()` call. SYS_REPLY is non-blocking. The server writes the reply, marks the caller Ready, and continues to its next instruction. The caller will run when the scheduler picks it up — typically when the server blocks on the next SYS_RECEIVE.

## The Modified sys_receive()

The existing SYS_RECEIVE needed one change: scan for BlockedCall senders in addition to BlockedSend:

```rust
for i in 1..MAX_PROCS {
    let is_sender = PROCS[i].state == ProcessState::BlockedSend
        || PROCS[i].state == ProcessState::BlockedCall;

    if is_sender
        && PROCS[i].ipc_target == current
        && (from_pid == 0 || from_pid == i)
    {
        let msg = PROCS[i].ipc_value;
        let sender = i;

        // Unblock sender ONLY if it was a plain SEND.
        // BlockedCall stays blocked — it's waiting for SYS_REPLY.
        if PROCS[i].state == ProcessState::BlockedSend {
            PROCS[i].state = ProcessState::Ready;
            PROCS[i].context.a0 = 0;
        }

        frame.a0 = msg;
        frame.a1 = sender;
        return;
    }
}
```

The `is_sender` check is the only new logic. The `if` block that conditionally unblocks was already there — it just didn't need the condition before because there was only one sender type. Now it checks: "If you sent via SYS_SEND, you're done, go back to Ready. If you sent via SYS_CALL, stay right where you are."

> :happygoose: The server's receive loop is identical whether clients use SYS_SEND or SYS_CALL. It gets `a0 = message, a1 = sender_pid` either way. The only difference is behavioral: SYS_CALL clients expect a reply. SYS_SEND clients don't. The server can serve both types simultaneously without any code changes.

## Syscall Dispatch

Two new arms in `handle_ecall()`:

```rust
pub const SYS_CALL: usize = 4;
pub const SYS_REPLY: usize = 5;

// In handle_ecall:
SYS_CALL => {
    crate::process::sys_call(frame);
    return;
}
SYS_REPLY => {
    crate::process::sys_reply(frame);
    return;
}
```

Both handlers manage their own `sepc` advancement, so the dispatch just calls and returns. Same pattern as SYS_SEND and SYS_RECEIVE.

## The Demo: RPC Client and Server

The old demo had PID 1 sending characters via SYS_SEND and PID 2 receiving and printing them. The new demo upgrades PID 1 to a SYS_CALL client and PID 2 to a SYS_RECEIVE + SYS_REPLY server.

### PID 1: The RPC Client

```asm
_user_init_start:
    # RPC client: calls server (PID 2) with each character.
    # SYS_CALL: a7=4, a0=target PID, a1=message value
    # Returns: a0=reply value (0 = ACK from server)

    li      s0, 2           # target PID (s0 survives ecalls)

    li a7, 4
    mv a0, s0
    li a1, 0x48             # 'H'
    ecall
    li a7, 4
    mv a0, s0
    li a1, 0x6F             # 'o'
    ecall
    # ... each character of "Honk! RPC works!\n" ...

    li      a7, 1           # SYS_EXIT
    li      a0, 0
    ecall
```

Each `ecall` with `a7=4` is a SYS_CALL. The client blocks until the server replies, then continues to the next character. `s0` holds the target PID across ecalls because it's a callee-saved register — the trap save/restore preserves it.

The `a7` register gets reloaded before each ecall. Technically unnecessary — `a7` survives the round-trip through context save/restore — but explicit is better than clever.

### PID 2: The RPC Server

```asm
_user_srv_start:
    # RPC server: receives messages, prints them, replies with ACK.
1:
    li      a7, 3           # SYS_RECEIVE
    li      a0, 0           # from any sender
    ecall
    # a0 = character, a1 = sender PID

    mv      s0, a0          # save character
    mv      s1, a1          # save sender PID (need it for REPLY)

    li      a7, 0           # SYS_PUTCHAR
    mv      a0, s0
    ecall

    li      a7, 5           # SYS_REPLY
    mv      a0, s1          # reply to the caller
    li      a1, 0           # reply value = 0 (ACK)
    ecall

    j       1b              # loop forever
```

Three syscalls per iteration: RECEIVE, PUTCHAR, REPLY. The server saves the sender PID in `s1` because it needs it two ecalls later for the REPLY. Without `s1`, the sender PID (returned in `a1` from RECEIVE) would be lost after PUTCHAR overwrites the return registers.

This is the canonical microkernel server loop:

```
loop {
    msg, sender = receive(ANY);
    result = process(msg);
    reply(sender, result);
}
```

Every future GooseOS server — filesystem, network, device driver — will follow this exact pattern.

## Boot Output: QEMU

```
  [proc] Creating processes...
  [proc] PID 1 created (code=0x8024d000, 214) bytes
  [proc] PID 2 created (code=0x80294000, 32) bytes

  [page_alloc] 211 pages used, 32021 free

  [proc] Launching PID 1 (init)...

Honk! RPC works!

  [kernel] PID 1 exited with code 0
  [kernel] All processes finished.
  [kernel] Back in S-mode. Idle loop active.
```

Seventeen characters, each one a full RPC round-trip. Client calls, server receives, prints, replies, client unblocks, sends next character. The fact that it prints a coherent string proves every RPC completed in order.

## Boot Output: VisionFive 2

```
          __
       __( o)>     GooseOS v0.1.0 build 20
      \  _/        RISC-V 64-bit
       \\\         Written in Rust
        \\\        Platform: VisionFive 2 (JH7110)
         \   )_    Honk.
      ~~~^~~~~

  Booted on hart 1
  DTB address:   0xcc5ba608
  Kernel entry:  0x402014a8

  [trap] stvec set to 0x40200050
  [plic] UART0 (IRQ 32) enabled, context=3, threshold=0
  [uart] RX interrupts enabled
  [trap] timer armed (1s interval, timebase=10MHz)
  [trap] interrupts enabled (SEIE + STIE)
  [page_alloc] self-test passed (32232 pages, 125MB)
  [kvm] Building kernel page table...
    .text   0x40200000 - 0x40204b08 (R+X)
    .rodata 0x40205000 - 0x40206408 (R  )
    .data   0x40207000 - 0x40207000 (R+W)
    .bss    0x40207000 - 0x40207998 (R+W)
    heap    0x40208000 - 0x47ff0000 (R+W)
    stack   0x47ff0000 - 0x48000000 (R+W)
    UART    0x10000000 - 0x10001000 (R+W, MMIO)
    PLIC    0x0c000000 - 0x0c400000 (R+W, MMIO)
  [kvm] Kernel page table at 0x40208000
  [kvm] Enabling Sv39 MMU (satp = 0x8000000000040208)...
  [kvm] MMU enabled — Sv39 active!
  [page_alloc] 69 pages used for page tables, 32163 free

  [proc] Creating processes...
  [proc] PID 1 created (code=0x4024d000, 214) bytes
  [proc] PID 2 created (code=0x40294000, 32) bytes

  [page_alloc] 211 pages used, 32021 free

  [proc] Launching PID 1 (init)...

Honk! RPC works!

  [kernel] PID 1 exited with code 0
  [kernel] All processes finished.
  [kernel] Back in S-mode. Idle loop active.

  (Ctrl-R or R to reboot)
```

Same output, real silicon. The SiFive U74 core on the JH7110 executes the same trap-save-dispatch-schedule-restore loop as QEMU, but through actual hardware registers, a physical UART, and real Sv39 page table walks.

> :happygoose: The diff between "Honk! IPC works!" and "Honk! RPC works!" is about 80 lines of Rust — two new functions in process.rs, two new constants in trap.rs, and updated demo programs. The architectural heavy lifting was done in Part 7. Call/Reply is a natural extension of the rendezvous model, not a new mechanism.

## What Changed, What Didn't

| Component | Changed? | What |
|-----------|----------|------|
| process.rs: ProcessState | Yes | Added `BlockedCall` variant |
| process.rs: sys_call() | New | Send + block for reply |
| process.rs: sys_reply() | New | Deliver reply, non-blocking |
| process.rs: sys_receive() | Modified | Scan for BlockedCall too |
| trap.rs: constants | Yes | Added SYS_CALL=4, SYS_REPLY=5 |
| trap.rs: handle_ecall() | Yes | Two new dispatch arms |
| trap.rs: TrapFrame | No | Same 33-field layout |
| trap.S | No | Same save/restore sequence |
| schedule() | No | Same linear scan |
| Page tables | No | Same Sv39 mappings |

The trap vector, the context switch mechanism, the page table code, the scheduler — none of it changed. Two new syscall handlers plugged into the existing dispatch table. That's the payoff of building the right abstractions early: new features slot in cleanly.

## The Execution Timeline

Here's what actually happens inside the kernel for one character ('H') across both processes:

```
Time ──────────────────────────────────────────────────────────►

PID 1 (client)          Kernel                PID 2 (server)
──────────────          ──────                ──────────────
ecall (a7=4)
  ─── trap ───►     save frame
                     sys_call():
                       sepc += 4
                       PID 2 not BlockedRecv
                       PID 1 → BlockedCall
                       schedule():
                         save → PROCS[1]
                         load ← PROCS[2]
                         switch satp
                     restore frame
                  ◄─── sret ───
                                              resumes
                                              ecall (a7=3)
                    ─── trap ───►
                     save frame
                     sys_receive():
                       sepc += 4
                       scan: PID 1 BlockedCall ✓
                       deliver msg to frame
                       PID 1 stays blocked
                     restore frame
                  ◄─── sret ───
                                              a0='H', a1=1
                                              ecall (a7=0)
                    ─── trap ───►
                     putchar('H')           → UART TX
                  ◄─── sret ───
                                              ecall (a7=5)
                    ─── trap ───►
                     sys_reply():
                       PROCS[1].a0 = 0
                       PID 1 → Ready
                     restore frame
                  ◄─── sret ───
                                              ecall (a7=3)
                    ─── trap ───►
                     sys_receive():
                       no senders
                       PID 2 → BlockedRecv
                       schedule():
                         save → PROCS[2]
                         load ← PROCS[1]
                         switch satp
                     restore frame
                  ◄─── sret ───
a0=0 (reply)
next ecall...
```

Six trap entries for one character. Six saves, six restores, two satp switches, one UART write. Multiply by 17 characters. The fact that it completes in a fraction of a second on hardware tells you these operations are fast — each trap round-trip is measured in hundreds of nanoseconds on the U74.

## Looking Forward

The IPC layer is complete. Six syscalls cover every communication pattern a microkernel needs:

- **Fire and forget:** SYS_SEND (client doesn't need a response)
- **Request-response:** SYS_CALL + SYS_REPLY (the RPC pattern)
- **Receive-process-reply:** The server loop (SYS_RECEIVE + SYS_REPLY)

The next 12 syscalls in the roadmap build on this foundation:
- **Phase 10:** Memory management (SYS_MAP, SYS_UNMAP, SYS_ALLOC_PAGES, SYS_FREE_PAGES)
- **Phase 11:** Process lifecycle (SYS_SPAWN, SYS_WAIT, SYS_GETPID)
- **Phase 12:** Preemptive scheduling (SYS_YIELD, SYS_SET_TIMER)
- **Phase 13:** Cross-process memory (SYS_GRANT)
- **Phase 14:** Device access (SYS_IRQ_REGISTER, SYS_IRQ_ACK)

Every single one of these phases will use SYS_CALL/SYS_REPLY as the primary communication mechanism between userspace servers. The IPC layer isn't just a feature — it's the substrate everything else grows on.

The goose has learned to make phone calls. Time to give it something worth calling about.
