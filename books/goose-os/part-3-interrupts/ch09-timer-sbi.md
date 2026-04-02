---
sidebar_position: 3
sidebar_label: "Ch 9: Timer + SBI Calls"
title: "Chapter 9: Timer Interrupts and Talking to OpenSBI"
---

# Chapter 9: Timer Interrupts and Talking to OpenSBI

Our kernel can handle traps and route UART interrupts. Now we add the heartbeat — a timer that ticks at regular intervals. This is the foundation for everything time-related: scheduling, timeouts, sleep, profiling.

## The SBI Interface

Remember the boot sequence? OpenSBI runs in M-mode and our kernel runs in S-mode. The timer hardware is controlled by M-mode registers (`mtime`, `mtimecmp`) that we can't access from S-mode. So how do we set a timer?

We ask OpenSBI. The **SBI** (Supervisor Binary Interface) is like a BIOS API — we make an `ecall` from S-mode, OpenSBI handles it in M-mode, and returns the result.

```
GooseOS (S-mode)                    OpenSBI (M-mode)
    │                                     │
    ├── ecall (set_timer)  ──────────►    │
    │                                     ├── writes mtimecmp
    │   ◄──────────────────────────────   ├── returns to S-mode
    │                                     │
    ... time passes ...                   │
    │                                     ├── timer fires in M-mode
    │   ◄── delegates to S-mode ────────  │
    │                                     │
    ├── trap: scause = timer interrupt    │
    ├── handle_timer()                    │
    ├── ecall (set_timer) again ────────► │
    └── sret                              │
```

> :nerdygoose: The SBI is specified at [github.com/riscv-non-isa/riscv-sbi-doc](https://github.com/riscv-non-isa/riscv-sbi-doc). It defines extension IDs (EID) and function IDs (FID). The Timer extension is EID `0x54494D45` (ASCII for "TIME"), FID 0. Arguments go in `a0-a5`, EID in `a7`, FID in `a6`. Return value in `a0` (error code) and `a1` (value).

## Setting the Timer

```rust
fn sbi_set_timer(stime: u64) {
    unsafe {
        asm!(
            "ecall",
            in("a0") stime,           // deadline value
            in("a6") 0usize,          // FID = 0 (set_timer)
            in("a7") 0x54494D45usize, // EID = Timer extension
            lateout("a0") _,          // return error code (ignored)
            lateout("a1") _,          // return value (ignored)
        );
    }
}
```

We pass an absolute `time` value — not a relative delay. The timer fires when the CPU's `time` CSR reaches this value.

> :sharpgoose: `0x54494D45` looks like magic. It's literally the ASCII bytes for "TIME" packed into an integer: `T=0x54, I=0x49, M=0x4D, E=0x45`. The RISC-V SBI spec uses human-readable hex constants for extension IDs. Clever, but write a named constant — future you will not remember what `0x54494D45` means.

## Reading the Clock

```rust
fn read_time() -> u64 {
    let time: u64;
    unsafe {
        asm!("csrr {}, time", out(reg) time);
    }
    time
}
```

The `time` CSR is a read-only shadow of the M-mode `mtime` register. On QEMU's virt machine, it ticks at **10 MHz** (10,000,000 counts per second).

## Arming and Re-arming

```rust
const TIMER_INTERVAL: u64 = 10_000_000; // 1 second at 10MHz

pub fn timer_init() {
    let time = read_time();
    sbi_set_timer(time + TIMER_INTERVAL);
}

fn handle_timer() {
    unsafe { TICKS += 1; }
    let ticks = unsafe { TICKS };
    if ticks % 10 == 0 {
        println!("[timer] {} seconds", ticks);
    }
    // Re-arm for next tick
    let time = read_time();
    sbi_set_timer(time + TIMER_INTERVAL);
}
```

> :angrygoose: You MUST re-arm the timer inside the handler. RISC-V timer interrupts are **one-shot** — they fire once when `time >= timecmp`, then stop. If you forget `sbi_set_timer()` at the end of `handle_timer()`, you get exactly one tick and then silence. Every. Single. Time. I've lost hours to this.

> :surprisedgoose: "Why does the timer pending bit (`STIP`) clear automatically?" Because `sbi_set_timer` sets `mtimecmp` to a future value. Once `mtimecmp > mtime`, the timer condition is no longer true, so the pending bit clears. You don't need to explicitly clear it — the SBI call does it implicitly. This is a common source of confusion for people coming from ARM where you manually clear interrupt flags.

## Enabling Everything

Two CSR writes turn on the interrupt machinery:

```rust
pub fn interrupts_enable() {
    unsafe {
        // sie: enable external (bit 9) + timer (bit 5)
        let sie_bits: usize = (1 << 9) | (1 << 5);
        asm!("csrs sie, {}", in(reg) sie_bits);

        // sstatus.SIE (bit 1): global interrupt enable
        asm!("csrs sstatus, {}", in(reg) 1usize << 1);
    }
}
```

`csrs` is "CSR Set" — it ORs the value into the register, only setting the bits we specify without disturbing others.

| CSR | Bit | Name | What It Does |
|-----|-----|------|-------------|
| `sie` | 5 | `STIE` | Supervisor Timer Interrupt Enable |
| `sie` | 9 | `SEIE` | Supervisor External Interrupt Enable |
| `sstatus` | 1 | `SIE` | Global Supervisor Interrupt Enable |

All three must be set. `STIE` enables timer interrupts. `SEIE` enables external (PLIC) interrupts. `SIE` is the master switch — if it's clear, nothing gets through.

> :nerdygoose: The hardware clears `sstatus.SIE` on trap entry and restores it on `sret`. This means interrupts are automatically disabled inside our trap handler — no nested interrupts. That's good, because our simple stack-based trap frame doesn't support re-entrancy. If we wanted nested interrupts, we'd need to re-enable `SIE` inside the handler and be very careful about stack depth.

## Panic Handler Upgrade

One subtle but important change to the panic handler:

```rust
#[panic_handler]
fn panic(info: &core::panic::PanicInfo) -> ! {
    // Disable interrupts so panic output isn't interleaved
    unsafe { asm!("csrc sstatus, {}", in(reg) 1usize << 1); }

    println!("!!! KERNEL PANIC !!!");
    // ...
}
```

Without this, a timer interrupt could fire in the *middle* of printing the panic message, interleaving `[timer] 20 seconds` with `!!! KERNEL PANIC !!!`. Disabling interrupts first guarantees the panic output is clean.

> :happygoose: This is defensive kernel programming. You can't trust the system state during a panic — something already went wrong. Disable interrupts, print your message, halt. Minimize the code between "something broke" and "the developer sees what broke."

## Testing It

Boot with `make run`. You should see:

```
  [trap] timer armed (1s interval, timebase=10MHz)
  [trap] interrupts enabled (SEIE + STIE)

  Interrupts active! Type something...

[timer] 10 seconds
[timer] 20 seconds
```

Type characters → they echo back immediately via UART interrupt. The timer ticks in the background. Two independent interrupt sources, both working.

> :weightliftinggoose: Think about what's happening: the CPU is asleep in `wfi`. A keypress arrives → UART asserts IRQ 10 → PLIC wakes the CPU → trap vector saves state → Rust handler reads the character → echoes it → restores state → `sret` → back to `wfi`. The entire round-trip is microseconds. That's what interrupt-driven I/O gives you — zero CPU usage when idle, instant response when needed.

## Branch

```bash
git checkout part-3   # see the code at this point
```
