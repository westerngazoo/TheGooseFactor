---
sidebar_position: 2
sidebar_label: "Ch 37: Hello from Userspace"
title: "Chapter 37: Hello from Userspace — The UART Server in Action"
---

# Chapter 37: Hello from Userspace — The UART Server in Action

Chapter 36 designed the mechanism. This chapter builds the programs that use it: a UART device server and a client that sends the first message ever printed by a GooseOS userspace process.

## The UART Server

The UART server is PID 2. The kernel creates it at boot with UART MMIO mapped into its address space. Its job:

1. Register for the UART IRQ
2. Loop forever on SYS_RECEIVE
3. If the message came from the kernel (sender = 0): handle an interrupt — drain the RX FIFO and echo characters
4. If the message came from a user process: write the character to the UART and reply

Here is the complete assembly:

```asm
_uart_server_start:
    li      s0, 0x5E000000      # UART base (user VA)

    # Register for UART IRQ
    li      a7, 14              # SYS_IRQ_REGISTER
    li      a0, UART_IRQ_NUM    # 10 on QEMU, 32 on VF2
    ecall

    # Enable RX data-available interrupt on UART chip
    li      t0, 0x01
    sb      t0, UART_IER_OFF(s0)

.server_loop:
    li      a7, 3               # SYS_RECEIVE
    li      a0, 0               # from = any
    ecall
    # a0 = message, a1 = sender PID

    beqz    a1, .handle_irq     # sender == 0 -> kernel IRQ

    # --- TX path ---
    mv      s1, a1              # save sender
    mv      s2, a0              # save char
.tx_wait:
    lbu     t0, UART_LSR_OFF(s0)
    andi    t0, t0, 0x20        # THR empty?
    beqz    t0, .tx_wait
    sb      s2, 0(s0)           # write char

    li      a7, 5               # SYS_REPLY
    mv      a0, s1
    li      a1, 0
    ecall
    j       .server_loop

.handle_irq:
    # --- RX path ---
.rx_loop:
    lbu     t0, UART_LSR_OFF(s0)
    andi    t0, t0, 0x01        # data ready?
    beqz    t0, .rx_done
    lbu     s2, 0(s0)           # read char
.echo_wait:
    lbu     t0, UART_LSR_OFF(s0)
    andi    t0, t0, 0x20
    beqz    t0, .echo_wait
    sb      s2, 0(s0)           # echo

    li      t1, 13              # CR -> CRLF
    bne     s2, t1, .rx_loop
.lf_wait:
    lbu     t0, UART_LSR_OFF(s0)
    andi    t0, t0, 0x20
    beqz    t0, .lf_wait
    li      t1, 10
    sb      t1, 0(s0)
    j       .rx_loop

.rx_done:
    li      a7, 15              # SYS_IRQ_ACK
    ecall
    j       .server_loop
_uart_server_end:
```

### The TX Path

When a client calls `SYS_CALL(2, char)`, the UART server receives it as a normal IPC message: `a0 = char`, `a1 = sender_pid`. The server:

1. Saves the sender PID (for the reply) and the character
2. Polls the Line Status Register (LSR) bit 5 — Transmitter Holding Register empty
3. Writes the character to the Transmit Holding Register (THR)
4. Calls `SYS_REPLY(sender, 0)` to unblock the client

The client sees this as a blocking function call. Send a character, wait for confirmation, send the next one. No buffering, no asynchronous complexity. Pure synchronous IPC.

### The RX Path

When the user presses a key, the UART chip asserts its interrupt line. The PLIC routes it to the kernel. The kernel's `handle_external` sees that PID 2 owns this IRQ and delivers it as a synthetic IPC message (sender = 0, message = IRQ number).

The server wakes from `SYS_RECEIVE`, sees `a1 == 0`, and enters the RX path:

1. Poll LSR bit 0 — Data Ready
2. Read the character from the Receive Buffer Register (RBR)
3. Echo it back through the THR (poll LSR bit 5 first)
4. If it was a carriage return, also send a line feed — terminal convention
5. Loop until the FIFO is empty
6. Call `SYS_IRQ_ACK` to complete the PLIC cycle

The `SYS_IRQ_ACK` is critical. Until the server acknowledges, the PLIC will not deliver the next UART interrupt. This gives the server time to process without being interrupted by itself.

### Platform Abstraction

The UART register layout differs between QEMU and VisionFive 2:

| Register | QEMU (stride=1) | VF2 (stride=4) |
|----------|-----------------|-----------------|
| THR/RBR  | base + 0        | base + 0        |
| IER      | base + 1        | base + 4        |
| LSR      | base + 5        | base + 20       |

And the IRQ number differs: 10 on QEMU, 32 on VF2.

We handle this with conditional assembly constants:

```rust
#[cfg(feature = "qemu")]
global_asm!(".equ UART_IRQ_NUM, 10 ...");

#[cfg(feature = "vf2")]
global_asm!(".equ UART_IRQ_NUM, 32 ...");
```

The server code uses these `.equ` constants. The assembler resolves them at build time. One source, two binaries.

## The Init Client

Init (PID 1) sends "Hello from userspace UART!" to the UART server, one character at a time:

```asm
_user_init_start:
1:  auipc   s0, %pcrel_hi(.hello_str)
    addi    s0, s0, %pcrel_lo(1b)

.send_loop:
    lbu     t0, 0(s0)
    beqz    t0, .done

    li      a7, 4               # SYS_CALL
    li      a0, 2               # target = UART server
    mv      a1, t0              # message = char
    ecall

    addi    s0, s0, 1
    j       .send_loop

.done:
    li      a7, 1               # SYS_EXIT
    li      a0, 0
    ecall
```

### The Compressed Instruction Trap

The original code used a hardcoded offset to find the string:

```asm
auipc   s0, 0
addi    s0, s0, 56          # 14 instructions x 4 bytes = 56
```

This produced the output: **"pace UART!"** — the last 10 characters of the message.

The problem: RISC-V's C (compressed) extension. The target triple `riscv64gc` includes compressed instructions. The assembler silently converted instructions like `li a7, 4` from 4 bytes to 2 bytes (`c.li a7, 4`). The actual code was 40 bytes, not 56. The string pointer was 16 bytes past the start of the string.

The fix: use assembler relocations instead of manual counting:

```asm
1:  auipc   s0, %pcrel_hi(.hello_str)
    addi    s0, s0, %pcrel_lo(1b)
```

`%pcrel_hi` and `%pcrel_lo` tell the assembler to compute the offset from the `auipc` instruction to `.hello_str`. It works correctly regardless of instruction compression because the assembler knows the exact byte positions after instruction selection.

This is a universal RISC-V lesson: **never hardcode offsets when the C extension is enabled.** Use relocations or `.option norvc` to disable compression.

## The Demo

Build 47, QEMU output:

```
  [proc] Creating init (PID 1)...
  [proc] PID 1 created (code=0x8024f000, 69 bytes, ...)
  [proc] Creating UART server (PID 2)...
  [proc] PID 2 created (code=0x80296000, 126 bytes, ...)
  [proc] Mapped UART MMIO PA 0x10000000 at user VA 0x5e000000 into PID 2

  [proc] Launching PID 1 (init)...

  [kernel] PID 2 registered for IRQ 10
Hello from userspace UART!

  [kernel] PID 1 exited with code 0
  [kernel] Idle (waiting for events)...
```

The kernel prints everything up to "Launching PID 1." Then init starts and sends the greeting via IPC. The UART server writes each character to the hardware UART. After init exits, the kernel enters idle mode. The UART server stays alive in BlockedRecv, waiting for keyboard interrupts.

The "Hello from userspace UART!" line looks identical to kernel output. But it took a completely different path: userspace -> SYS_CALL -> kernel IPC -> context switch -> UART server -> MMIO write -> UART chip -> terminal. Seven hops instead of one.

That is the microkernel tax. And it is the microkernel payoff — the driver is now an isolated, restartable, ordinary process.

## The Message Flow

```
  PID 1 (init)                    PID 2 (UART server)
    |                               |
    +-- SYS_CALL(2, 'H') ------+   |  (PID 2 is Ready, not RecvBlocked)
    |  blocks as BlockedCall    |   |
    |                           |   +-- SYS_IRQ_REGISTER(10)
    |                           |   +-- enable IER
    |                           |   +-- SYS_RECEIVE(0)
    |                           |   |    finds PID 1 waiting -> rendezvous!
    |                           |   |    a0='H', a1=1
    |                           |   +-- poll LSR, write 'H' to THR
    |                           |   +-- SYS_REPLY(1, 0) -> PID 1 unblocked
    |                           |   +-- SYS_RECEIVE(0) -> no senders -> block
    |  <-- reply received ------+   |
    +-- SYS_CALL(2, 'e') ------+   |  PID 2 is BlockedRecv -> rendezvous!
    |  blocks                   |   |    a0='e', a1=1
    |                           |   +-- write 'e', reply, receive...
    |  <-- reply ---------------+   |
    +-- SYS_CALL(2, 'l') ------+   ...
    ...                             ... (28 characters total)
    +-- SYS_EXIT(0) ---------> |   |
    |                           |   +-- SYS_RECEIVE(0) -> blocked
    |  (gone)                   |   |  (alive, waiting for IRQs)
    v                           v   v
  Kernel: "Idle (waiting for events)..."
```

28 characters. 28 RPC round-trips. 28 context switches in each direction. The timer ticks in the background, but there is no preemption needed — the two processes take turns voluntarily via IPC. This is cooperative multitasking through protocol design.

## What's Next

The UART server is GooseOS's first userspace device driver. It proves the microkernel model works: IRQs delivered as IPC, hardware accessed from userspace, the kernel reduced to a message router.

The next frontier is WASM. The syscall table is nearly complete. The IPC layer works. Device I/O is in userspace. What's missing is the ability to run programs written in C, Rust, or any language — by compiling them to WebAssembly and interpreting the bytecode inside GooseOS processes.

That is the endgame: an OS where every process is a WASM sandbox.
