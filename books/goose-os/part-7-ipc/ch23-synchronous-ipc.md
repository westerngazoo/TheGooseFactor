---
sidebar_position: 2
sidebar_label: "Ch 23: Synchronous IPC"
title: "Chapter 23: Synchronous IPC — The seL4 Way, or How to Pass a Note in Class Without a Mailbox"
---

# Chapter 23: Synchronous IPC — The seL4 Way, or How to Pass a Note in Class Without a Mailbox

Here's the fundamental question: when Process A wants to send a message to Process B, where does the message *go*?

In Unix, it goes into a kernel buffer. `write()` copies bytes from userspace into a pipe/socket buffer. `read()` copies bytes out. The kernel owns the buffer. The kernel manages its lifetime, its capacity, its overflow behavior. If the buffer fills up, `write()` blocks. If it's empty, `read()` blocks. The buffer is an intermediary — a mailbox sitting between two processes that might never meet face to face.

This works. It's also a source of endless complexity. Buffer management. Flow control. Memory allocation in the kernel. Denial of service (fill someone's pipe buffer, exhaust kernel memory). The Linux kernel has hundreds of thousands of lines of code dedicated to managing buffers between processes.

seL4 said: *what if we just... didn't?*

## The Rendezvous Model

In synchronous IPC, there is no buffer. No mailbox. No intermediary. The sender and receiver must *both* be ready at the same time. When they are, the message transfers directly — from the sender's registers to the receiver's registers. Zero-copy. Zero allocation. Zero buffer management.

If the sender calls SEND but the receiver isn't waiting, the sender **blocks**. It stops running. It waits. When the receiver eventually calls RECEIVE, the kernel notices the blocked sender, transfers the message, and unblocks both.

If the receiver calls RECEIVE but no sender is waiting, the receiver **blocks**. When a sender eventually calls SEND targeting that receiver, same thing — rendezvous, transfer, unblock.

```
Scenario 1: Sender first
──────────────────────────────────────────────
  PID 1                        PID 2
    │                            │
    ├── SYS_SEND(2, 'H') ──►    │
    │   PID 2 not receiving      │
    │   PID 1 BLOCKS             │
    │                            │
    │   ┌── scheduler ──►        │
    │   │                        ├── SYS_RECEIVE(0)
    │   │                        │   PID 1 blocked sending to us!
    │   │                        │   RENDEZVOUS
    │   │                        │   a0 ← 'H', a1 ← 1
    │   │                        │
    ├── unblocked ◄──────────────┤
    │   a0 ← 0 (success)        │
    ▼                            ▼

Scenario 2: Receiver first
──────────────────────────────────────────────
  PID 1                        PID 2
    │                            │
    │                            ├── SYS_RECEIVE(0)
    │                            │   No senders waiting
    │                            │   PID 2 BLOCKS
    │                            │
    │   ◄── scheduler ──┐       │
    ├── SYS_SEND(2, 'H')│       │
    │   PID 2 blocked    │       │
    │   receiving!       │       │
    │   RENDEZVOUS       │       │
    │   a0 ← 0 (success)│       │
    │                    │       │
    │                    └──►    ├── unblocked
    │                            │   a0 ← 'H', a1 ← 1
    ▼                            ▼
```

Both scenarios end the same way: the message is in the receiver's registers, and both processes are runnable. No buffer was allocated. No buffer was freed. No buffer overflowed. The kernel didn't even *touch* the heap.

> :nerdygoose: This is called "rendezvous" because, like the French word suggests, both parties must show up at the same place at the same time. Unlike actual French rendezvous, neither party gets to be fashionably late. If you're not there, you wait. Indefinitely. No timeouts in our implementation. If PID 2 never calls RECEIVE, PID 1 is dead. Hanging in the void, forever. Which, now that I think about it, might be a more accurate metaphor for French dating.

## Why Synchronous?

Three reasons, and they're all significant:

### 1. No Kernel Allocation

Asynchronous IPC requires the kernel to allocate buffers. Buffers can fill up. Allocation can fail. What happens when the kernel runs out of memory trying to queue your message? In Linux, this is a real attack vector — flood a pipe or socket with data to exhaust kernel memory.

In synchronous IPC, the kernel allocates *nothing*. The message lives in registers. Registers are fixed hardware resources. You can't exhaust them. You can't overflow them. The kernel's memory usage for IPC is exactly zero bytes, regardless of how many messages are in flight. (The answer is also zero — no message is ever "in flight." Messages teleport from sender to receiver.)

### 2. Implicit Flow Control

With buffers, you need flow control: what happens when the producer is faster than the consumer? The buffer fills up. You need back-pressure, watermarks, maybe drop policies. TCP has entire RFCs dedicated to this.

With synchronous IPC, flow control is free. The sender can't outrun the receiver because the sender *blocks* until the receiver picks up. One message at a time. No queuing, no batching, no overflow. The speed of communication is exactly the speed of the slower partner. This is a feature, not a limitation.

### 3. Formal Verification

seL4 is the only production OS kernel that's been formally verified — mathematically proven to be free of bugs like buffer overflows, null pointer dereferences, and use-after-free. One of the reasons this is possible is that the IPC mechanism is dead simple. No dynamic allocation means no memory safety bugs in the allocator. No buffers means no buffer overflow. No queues means no queue corruption.

Our implementation isn't verified (yet). But by following the same model, we inherit the same structural simplicity. The IPC code is ~80 lines of Rust. Try formally verifying Linux's 500,000-line networking stack.

> :happygoose: seL4's IPC was verified as part of a 200,000-line Isabelle/HOL proof. It took a team of researchers at NICTA/Data61 about 11 person-years. The IPC subsystem was one of the *easier* parts. The hard parts were the memory capability system and the scheduler. Our IPC is a subset of theirs — if we ever want to verify GooseOS, this is the right foundation. We're not just being simple for educational reasons. We're being simple because simple is verifiable, and verifiable is correct.

## SYS_SEND Implementation

When a process calls `ecall` with `a7 = 2`, the trap handler routes to `sys_send()`:

```rust title="src/process.rs — sys_send()"
/// SYS_SEND(target_pid, msg_value) — synchronous send.
///
/// Convention: a0 = target PID, a1 = message value.
/// Returns: a0 = 0 (success).
///
/// Blocks the sender until the target calls SYS_RECEIVE.
/// If the target is already blocked on RECEIVE, rendezvous immediately.
pub fn sys_send(frame: &mut TrapFrame) {
    frame.sepc += 4; // advance past ecall

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
            // Rendezvous! Transfer message directly to receiver's saved context.
            PROCS[target_pid].context.a0 = msg_value;     // message
            PROCS[target_pid].context.a1 = current;        // sender PID
            PROCS[target_pid].state = ProcessState::Ready;

            // Sender continues — send returns success
            frame.a0 = 0;
            return;
        }

        // No rendezvous — block the sender
        PROCS[current].ipc_target = target_pid;
        PROCS[current].ipc_value = msg_value;
        PROCS[current].state = ProcessState::BlockedSend;

        // Context switch to the next ready process
        schedule(frame, current);
    }
}
```

Let's trace through both paths:

### Path A: Rendezvous (receiver already waiting)

PID 2 has already called SYS_RECEIVE and blocked. Its state is `BlockedRecv`, its `ipc_target` is 0 (accept from anyone).

PID 1 calls `SYS_SEND(2, 'H')`. We check: is PID 2 in `BlockedRecv`? Yes. Is it willing to accept from PID 1 (target is 0 = any, or target == 1)? Yes.

**Rendezvous!**

We write the message directly into PID 2's *saved context*:
- `PROCS[2].context.a0 = 'H'` — the message
- `PROCS[2].context.a1 = 1` — the sender PID

When PID 2 is eventually scheduled and srets back to userspace, it'll see `a0 = 'H'` and `a1 = 1` — the return values of its SYS_RECEIVE.

PID 2 moves to `Ready`. PID 1 gets `a0 = 0` (success) and continues running. No context switch needed — the sender keeps going.

### Path B: No rendezvous (receiver not waiting)

PID 2 is in `Running` or `Ready` — it hasn't called SYS_RECEIVE yet.

PID 1 calls `SYS_SEND(2, 'H')`. We check: is PID 2 in `BlockedRecv`? No.

**Block the sender.**

We save PID 1's IPC state:
- `ipc_target = 2` — who we're trying to send to
- `ipc_value = 'H'` — the message we want to deliver

PID 1's state becomes `BlockedSend`. Then we call `schedule()` to find another process to run. The scheduler saves PID 1's TrapFrame, loads PID 2's TrapFrame, switches satp, and returns. When trap.S restores and srets, we're in PID 2's code.

Later, when PID 2 calls SYS_RECEIVE, it'll scan the process table, find PID 1 in `BlockedSend` targeting PID 2, and do the rendezvous there.

### Validation

The first thing we do is validate the target:

```rust
if target_pid == 0 || target_pid >= MAX_PROCS || target_pid == current {
    frame.a0 = usize::MAX; // error
    return;
}
```

You can't send to PID 0 (the kernel). You can't send to a PID beyond the table. You can't send to yourself (that would deadlock — you'd block waiting for yourself to receive, which is the IPC equivalent of trying to lick your own elbow).

> :angrygoose: In a production kernel, sending to a Free or already-exited PID should also return an error. Our implementation doesn't check for that — if PID 3 is Free and PID 1 sends to it, PID 1 blocks forever. This is technically a bug, but also technically a feature: you shouldn't send to processes that don't exist. If you do, you deserve what you get. "Doctor, it hurts when I send IPC to dead processes." "Then don't do that."

## SYS_RECEIVE Implementation

The mirror image of SEND:

```rust title="src/process.rs — sys_receive()"
/// SYS_RECEIVE(from_pid) — synchronous receive.
///
/// Convention: a0 = expected sender PID (0 = accept from anyone).
/// Returns: a0 = message value, a1 = sender PID.
///
/// Blocks the receiver until someone calls SYS_SEND targeting us.
/// If a sender is already blocked, rendezvous immediately.
pub fn sys_receive(frame: &mut TrapFrame) {
    frame.sepc += 4;

    let current = unsafe { CURRENT_PID };
    let from_pid = frame.a0; // 0 = any

    unsafe {
        // Check if any sender is blocked waiting to send to us
        for i in 1..MAX_PROCS {
            if PROCS[i].state == ProcessState::BlockedSend
                && PROCS[i].ipc_target == current
                && (from_pid == 0 || from_pid == i)
            {
                // Rendezvous! Transfer message.
                let msg = PROCS[i].ipc_value;
                let sender = i;

                // Unblock sender — its SEND returns success
                PROCS[i].state = ProcessState::Ready;
                PROCS[i].context.a0 = 0; // send returns 0

                // Receiver gets the message
                frame.a0 = msg;
                frame.a1 = sender;
                return;
            }
        }

        // No sender found — block the receiver
        PROCS[current].ipc_target = from_pid;
        PROCS[current].state = ProcessState::BlockedRecv;

        // Context switch to the next ready process
        schedule(frame, current);
    }
}
```

### The Scan

When SYS_RECEIVE is called, we scan the entire process table looking for a blocked sender:

```rust
for i in 1..MAX_PROCS {
    if PROCS[i].state == ProcessState::BlockedSend
        && PROCS[i].ipc_target == current
        && (from_pid == 0 || from_pid == i)
    {
```

Three conditions, all must be true:
1. The process is blocked on SEND (it called SYS_SEND and couldn't deliver)
2. It's trying to send to *us* (its target matches our PID)
3. We're willing to accept from it (we said "from anyone" with 0, or specifically named this PID)

If we find a match: rendezvous. Transfer the message from the sender's saved IPC state to the receiver's live frame. Unblock the sender by setting it to `Ready` and writing `a0 = 0` (success) into its saved context. When the sender eventually runs again, it'll see its SEND returned 0.

If no match: block. Set our state to `BlockedRecv`, save who we're waiting for, and call `schedule()`.

> :surprisedgoose: The linear scan (O(n) where n = MAX_PROCS) is a deliberate choice. With 8 process slots, this is 8 iterations — microseconds, not milliseconds. seL4 uses endpoint objects with wait queues for O(1) wake-up, but that adds data structure complexity. For 8 processes, a linear scan is *faster* than maintaining a linked list (no pointer chasing, no cache misses). When GooseOS grows to 64 processes, we'll add wait queues. For now, simplicity wins.

## The Message Format

Right now, a message is one `usize` — 64 bits on RV64. One register. That's enough for:
- A character (our current use case)
- An error code
- A pointer (if both processes share a mapping — not currently)
- A capability token (future: memory grants)

seL4 passes messages through "message registers" — up to 64 words, partly in hardware registers (a0–a5) and partly in a thread-local IPC buffer in memory. This gives fast short-message performance (register-only, no memory access) with the ability to send larger payloads when needed.

We could expand to multi-word messages later, but single-word IPC is the foundation. If you can transfer one word correctly, you can transfer N words correctly — it's just more register saves.

## The Dance: A Complete Message Transfer

Let's trace "Honk!" — the first five characters — through the IPC system:

```
Step 1: PID 1 starts running, calls SYS_SEND(2, 'H')
        PID 2 is Ready, not BlockedRecv
        → PID 1 blocks (BlockedSend, target=2, value='H')
        → schedule() picks PID 2

Step 2: PID 2 starts running, calls SYS_RECEIVE(0)
        PID 1 is BlockedSend, targeting PID 2
        → Rendezvous! PID 2 gets a0='H', a1=1
        → PID 1 unblocked (Ready, context.a0=0)
        PID 2 calls SYS_PUTCHAR('H') — 'H' appears on screen
        PID 2 loops, calls SYS_RECEIVE(0) again
        No blocked senders
        → PID 2 blocks (BlockedRecv, target=0)
        → schedule() picks PID 1

Step 3: PID 1 resumes, calls SYS_SEND(2, 'o')
        PID 2 is BlockedRecv(from any)
        → Rendezvous! PID 2 gets a0='o', a1=1
        → PID 2 unblocked (Ready)
        PID 1 continues, calls SYS_SEND(2, 'n')
        PID 2 is Ready, not BlockedRecv
        → PID 1 blocks (BlockedSend, target=2, value='n')
        → schedule() picks PID 2

Step 4: PID 2 resumes, calls SYS_PUTCHAR('o') — 'o' appears
        PID 2 calls SYS_RECEIVE(0)
        PID 1 is BlockedSend, targeting PID 2
        → Rendezvous! PID 2 gets a0='n', a1=1
        → PID 1 unblocked (Ready)
        ...and so on...
```

The two processes interleave like a zipper. Send, receive, print. Send, receive, print. Seventeen characters, seventeen rendezvous, seventeen context switches (approximately — some rendezvous happen without switching when the receiver is already waiting).

The beauty: neither process *knows* it's being interrupted. PID 1 calls SEND and gets 0 back. It doesn't know whether the message was delivered instantly (rendezvous) or after a scheduling round-trip. PID 2 calls RECEIVE and gets a character. It doesn't know whether the sender was already waiting or arrived later. The IPC mechanism is transparent.

> :happygoose: This is the core of the microkernel design: processes communicate through messages, not shared memory. They don't need to know each other's internal state. They don't need to share locks. They don't even need to be on the same machine — replace the kernel's IPC mechanism with a network transport and you have a distributed system. Mach (the ancestor of macOS) and QNX (the OS in your car's dashboard) both discovered this. seL4 perfected it.

## What We Changed

| File | Change |
|------|--------|
| `src/process.rs` | Added `sys_send()`, `sys_receive()` — rendezvous IPC |
| `src/trap.rs` | Added SYS_SEND, SYS_RECEIVE constants and dispatch arms |

## What's Next

The IPC handlers call `schedule()` when a process blocks. That function is the context switch — the mechanism that saves one process's state and loads another's. Chapter 24 shows how a single TrapFrame overwrite on the kernel stack makes the entire context switch happen *for free*.
