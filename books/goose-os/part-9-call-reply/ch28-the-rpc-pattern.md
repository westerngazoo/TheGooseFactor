---
sidebar_position: 1
sidebar_label: "Ch 28: The RPC Pattern"
title: "Chapter 28: The RPC Pattern — One Ecall to Rule Them All"
---

# Chapter 28: The RPC Pattern — One Ecall to Rule Them All

In Part 7 we built synchronous IPC. Two processes can pass messages through the kernel using SYS_SEND and SYS_RECEIVE. It works. "Honk! IPC works!" proved it on real hardware.

But there's a problem. Look at what a typical client-server interaction requires:

```
Client (PID 1)                     Server (PID 2)
──────────────                     ──────────────
SYS_SEND(2, request)      ──►     SYS_RECEIVE(0)
  blocks...                          got request
  unblocked ◄──────────────         process it...

SYS_RECEIVE(2)             ──►     SYS_SEND(1, response)
  blocks...                          blocks...
  got response ◄───────────         unblocked
```

The client needs **two ecalls** for a single request-response: one SEND, one RECEIVE. The server also needs two. That's four ecalls total. Four user-kernel transitions. Four trap entries. Four context saves-and-restores.

For a microkernel where *everything* is IPC, this adds up fast. Every WASI call from a WASM module will be an RPC. `fd_write`? RPC to the filesystem server. `clock_time_get`? RPC to whoever tracks time. `fd_read`? RPC to the UART server. If each RPC costs four ecalls, we're burning cycles on plumbing instead of work.

seL4 solved this decades ago with `seL4_Call` and `seL4_ReplyRecv`. The idea is simple: combine the send and the wait into a single operation.

## SYS_CALL: The Client's Best Friend

```
SYS_CALL(target, message)
```

One ecall. It does three things:
1. Sends the message to the target
2. Blocks the caller
3. Waits for SYS_REPLY from the target

The caller doesn't come back from this ecall until the server has processed the request and replied. From the client's perspective, it looks like a function call — send arguments, get result. Hence the name.

```
Client (PID 1)                     Server (PID 2)
──────────────                     ──────────────
SYS_CALL(2, request)       ──►    SYS_RECEIVE(0)
  blocks...                          got request
  │                                  process it...
  │                          ◄──   SYS_REPLY(1, response)
  unblocked, a0 = response
```

One ecall from the client. One RECEIVE + one REPLY from the server. Three ecalls total instead of four. The client saves an entire trap round-trip per RPC.

> :nerdygoose: Every WASI function call from a WebAssembly module will become a SYS_CALL to a userspace server. A simple "hello world" WASM program might make dozens of `fd_write` calls. At around 80ns per ecall on the VisionFive 2's U74, saving one ecall per RPC is measurable. Multiply by thousands of WASI calls per second and it's the difference between "responsive" and "sluggish."

## SYS_REPLY: The Server's Half

```
SYS_REPLY(caller_pid, reply_value)
```

The server calls this after processing a request. It:
1. Finds the caller (must be in BlockedCall state)
2. Writes the reply value into the caller's saved registers
3. Marks the caller as Ready

Crucially, SYS_REPLY is **non-blocking** for the server. The server sends the reply and keeps running. It can immediately loop back to SYS_RECEIVE for the next request. No context switch required just to deliver a response.

## The New State Machine

Part 7 had five states: Free, Ready, Running, BlockedSend, BlockedRecv. We add one:

```
                        ┌──────────────────────────────────┐
                        ▼                                  │
  ┌──────┐    ┌───────────────┐    ┌──────────────────┐    │
  │ Free │───►│     Ready     │───►│     Running      │    │
  └──────┘    └───────────────┘    └──────────────────┘    │
                 ▲    ▲    ▲         │    │    │    │       │
                 │    │    │         │    │    │    │       │
                 │    │    │         ▼    │    │    │       │
                 │    │    │    ┌──────────┐  │    │       │
                 │    │    └────│BlockedSend│  │    │       │
                 │    │         └──────────┘  │    │       │
                 │    │                       │    │       │
                 │    │         ┌──────────┐  │    │       │
                 │    └─────────│BlockedRecv│◄─┘    │       │
                 │              └──────────┘       │       │
                 │                                 │       │
                 │              ┌──────────┐       │       │
                 └──────────────│BlockedCall│◄──────┘       │
                   SYS_REPLY    └──────────┘  SYS_CALL     │
                   unblocks          │                      │
                                     └── SYS_EXIT ─────────┘
```

**BlockedCall** is like BlockedSend, but stickier. A BlockedSend process gets unblocked the moment the target calls RECEIVE. A BlockedCall process stays blocked even after the target receives the message — it's waiting for an explicit SYS_REPLY.

This is the key insight: **the receive and the reply are decoupled on the server side.** The server can receive the message, do arbitrarily complex processing (make its own IPC calls, access hardware, compute things), and reply whenever it's ready. The client just waits.

## How SYS_RECEIVE Sees Both Sender Types

Here's a subtlety that took careful design: when a server calls SYS_RECEIVE, it might find senders that used SYS_SEND *or* SYS_CALL. The server shouldn't need to know which one the client used. It just receives a message.

The difference is what happens to the sender:

| Sender used | After RECEIVE matches it |
|-------------|--------------------------|
| SYS_SEND | Sender unblocked, marked Ready |
| SYS_CALL | Sender stays BlockedCall, waiting for REPLY |

The server's SYS_RECEIVE code scans for both:

```rust
let is_sender = PROCS[i].state == ProcessState::BlockedSend
    || PROCS[i].state == ProcessState::BlockedCall;
```

Same scan, same rendezvous, different aftermath. The server gets the message either way. If it was a SYS_CALL, the server is *expected* to SYS_REPLY later. If it was a plain SYS_SEND, there's nobody to reply to (and SYS_REPLY would correctly fail — the sender isn't in BlockedCall state).

## The Authorization Gate

SYS_REPLY has a critical safety check:

```rust
if PROCS[target_pid].state == ProcessState::BlockedCall
    && PROCS[target_pid].ipc_target == current
```

Two conditions must hold:
1. The target must actually be in BlockedCall state (not just any state)
2. The target's `ipc_target` must point to **us** — meaning the caller was waiting for a reply from *this specific server*

This prevents a rogue process from replying to someone else's call. If PID 3 tries to SYS_REPLY to PID 1, but PID 1 called PID 2, the check fails: `ipc_target(2) != current(3)`. The reply is rejected. Only the server that was actually called can deliver the response.

> :angrygoose: In a microkernel, IPC authorization is everything. Without this check, any process could impersonate any server by replying to calls it didn't receive. The two-field check (state + ipc_target) is the minimum viable authorization for call/reply. Later phases will add proper capabilities for even stronger guarantees.

## The Full RPC Round-Trip

Let's trace a complete SYS_CALL/SYS_REPLY cycle. PID 1 (client) calls PID 2 (server) with message `0x48` ('H'):

```
Step  Who    What                                 State after
─────────────────────────────────────────────────────────────────
  1   PID 1  SYS_CALL(2, 0x48)                    PID 1: BlockedCall
             PID 2 not in BlockedRecv                target=2, value=0x48
             → block, schedule to PID 2            PID 2: Running

  2   PID 2  SYS_RECEIVE(0)                        PID 1: BlockedCall (unchanged)
             Scans: PID 1 is BlockedCall,          PID 2: Running
               target=2 (us!), from=0 (any) ✓       a0=0x48, a1=1
             Rendezvous! Deliver msg.
             PID 1 stays BlockedCall.

  3   PID 2  SYS_PUTCHAR(0x48)                     prints 'H'
             Non-blocking, PID 2 continues         PID 2: Running

  4   PID 2  SYS_REPLY(1, 0)                       PID 1: Ready
             PID 1 is BlockedCall, target=2 (us) ✓    context.a0=0
             Deliver reply. PID 1 → Ready.         PID 2: Running
             Server continues (non-blocking).

  5   PID 2  SYS_RECEIVE(0)                        PID 2: BlockedRecv
             No senders waiting.
             → block, schedule to PID 1            PID 1: Running

  6   PID 1  Resumes after ecall                   a0=0 (the reply)
             Next SYS_CALL(2, 0x6F) ...            cycle repeats
```

Six steps per character. The client spends most of its time blocked. The server spends most of its time running (receive, process, reply, receive). This is exactly the pattern every WASI call will follow in the future.

## The Rendezvous Variation

What happens when the server is *already* waiting when the client calls? The timing collapses:

```
Step  Who    What                                 State after
─────────────────────────────────────────────────────────────────
  1   PID 2  SYS_RECEIVE(0)                        PID 2: BlockedRecv
             No senders. Block.                    PID 1: Running

  2   PID 1  SYS_CALL(2, 0x48)                     PID 2: Ready
             PID 2 IS BlockedRecv!                    context.a0=0x48
             Rendezvous — deliver msg.                context.a1=1
             But PID 1 STILL blocks.               PID 1: BlockedCall
             schedule → PID 2                      PID 2: Running
```

Even with immediate rendezvous, the caller stays blocked. That's the difference from SYS_SEND. SYS_SEND would unblock the sender on rendezvous. SYS_CALL never does — only SYS_REPLY can free the caller.

> :surprisedgoose: Why not unblock on rendezvous? Because the whole point of SYS_CALL is *getting a reply*. If we unblocked the client on rendezvous, it would resume without the reply value. It would have to do a separate SYS_RECEIVE to get the response — which is exactly what we're trying to avoid. The caller *must* stay blocked until the server explicitly replies.

## What We Built

Two new syscalls, one new state:

| Syscall | Number | Args | Returns | Blocks? |
|---------|--------|------|---------|---------|
| SYS_CALL | 4 | a0=target, a1=msg | a0=reply | Yes, until REPLY |
| SYS_REPLY | 5 | a0=caller, a1=reply | a0=0 or error | No |

| State | Meaning | Entered by | Exited by |
|-------|---------|------------|-----------|
| BlockedCall | Waiting for server's reply | SYS_CALL | SYS_REPLY from target |

The syscall table is now at 6:

```
┌─────┬──────────────────┬────────────────────────────┐
│  #  │  Name            │  Purpose                   │
├─────┼──────────────────┼────────────────────────────┤
│  0  │  SYS_PUTCHAR     │  Debug output (1 byte)     │
│  1  │  SYS_EXIT        │  Terminate process         │
│  2  │  SYS_SEND        │  Sync send (blocks)        │
│  3  │  SYS_RECEIVE     │  Sync receive (blocks)     │
│  4  │  SYS_CALL        │  RPC: send + wait reply    │
│  5  │  SYS_REPLY       │  Deliver reply (no block)  │
└─────┴──────────────────┴────────────────────────────┘
```

Six syscalls. The complete IPC layer for a microkernel. Everything else — memory, spawning, scheduling, devices — builds on top of this messaging foundation.

Next chapter: the implementation, the demo, and hardware proof.
