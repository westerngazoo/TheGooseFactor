---
sidebar_position: 3
sidebar_label: "Ch 12: UART on Real Hardware"
title: "Chapter 12: UART — When Emulation Lies to You"
---

# Chapter 12: UART — When Emulation Lies to You

Our kernel boots on the VisionFive 2 and prints the goose banner. Victory! But try typing a character... nothing. No echo. The UART RX path that worked perfectly on QEMU is dead on real hardware.

This chapter is about the gap between emulation and reality — and why it's the most valuable debugging you'll do.

## The Symptom

GooseOS on QEMU: type a key, see it echoed. Interrupt-driven, instant, perfect.

GooseOS on VF2: type a key, nothing. The UART *transmits* fine (we see the banner), but *receiving* is broken. The interrupt handler never fires.

> :angrygoose: This is the most frustrating class of hardware bug. TX works, so you know the UART is initialized. RX doesn't, so something is wrong — but *what*? The UART? The interrupt controller? The wiring? A register you forgot? On QEMU, everything just works because the emulator doesn't model all the edge cases of real silicon.

## Investigation: MCR and the OUT2 Bit

The NS16550A has a register most people ignore: the **Modem Control Register (MCR)**, register index 4.

```
MCR — Modem Control Register (index 4)
┌─────┬─────┬─────┬─────┬──────┬──────┬─────┬─────┐
│ Bit7│ Bit6│ Bit5│ Bit4│ Bit3 │ Bit2 │ Bit1│ Bit0│
│  0  │  0  │  0  │ Loop│ OUT2 │ OUT1 │ RTS │ DTR │
└─────┴─────┴─────┴─────┴──────┴──────┴─────┴─────┘
```

On many real 16550-compatible UARTs, **OUT2 (bit 3) gates the interrupt output**. If OUT2 is low, the UART generates interrupts internally but *never sends them to the interrupt controller*. The interrupt line stays deasserted regardless of IER settings.

QEMU doesn't model this. On QEMU's NS16550A, interrupts work whether or not OUT2 is set. On the VisionFive 2's DesignWare 8250 — a real 16550 implementation — OUT2 must be high for interrupts to reach the PLIC.

Additionally, some hardware requires **DTR (bit 0) and RTS (bit 1)** to be asserted for the serial line to be active. Without DTR+RTS, the remote end (our USB-to-serial adapter) may not send data.

The fix:

```rust
pub fn init(&self) {
    unsafe {
        // IER: disable all interrupts during setup
        ptr::write_volatile(self.reg(1), 0x00);
        // LCR: 8 data bits, 1 stop bit, no parity
        ptr::write_volatile(self.reg(3), 0x03);
        // FCR: enable + clear both FIFOs, 1-byte RX trigger
        ptr::write_volatile(self.reg(2), 0x07);
        // MCR: OUT2 (bit 3) gates interrupt output to PLIC.
        // DTR (bit 0) + RTS (bit 1) needed for RX on some hardware.
        ptr::write_volatile(self.reg(4), 0x0B);  // OUT2 + RTS + DTR
    }
}
```

MCR = `0x0B` = `0000_1011` = OUT2 + RTS + DTR. This is the standard "I want interrupts and I want the serial line active" configuration.

> :nerdygoose: The OUT2 bit is a relic from the original 8250's modem control circuit. In the PC/AT architecture, OUT2 was physically wired to the interrupt controller's mask. The 16550 kept this behavior for backward compatibility. Forty years later, it still bites people. The DesignWare 8250 IP faithfully implements this behavior because that's what the spec says.

> :sharpgoose: Our init order also matters. We disable interrupts *first* (IER=0), then configure the line (LCR), then clear FIFOs (FCR), then set modem control (MCR). Only after everything is configured do we later enable interrupts (IER=0x01). If you enable interrupts before MCR is set, there's a window where the UART might try to assert an interrupt but OUT2 blocks it, and the pending bit gets stuck.

### FCR: Clear Those FIFOs

We also changed FCR from `0x01` (enable FIFOs) to `0x07` (enable + clear both FIFOs):

```
FCR = 0x07 = 0000_0111
  Bit 0: FIFO enable
  Bit 1: Clear RX FIFO
  Bit 2: Clear TX FIFO
```

Bits 1 and 2 are self-clearing — the hardware resets them automatically after the FIFOs are flushed. This ensures we start with empty FIFOs and no stale data from a previous boot or U-Boot session.

> :surprisedgoose: U-Boot was using the UART before us. Whatever was in its RX FIFO — buffered keystrokes, garbage from the handoff — is still there when we init. Clearing the FIFO on init avoids phantom characters appearing at boot. On QEMU, QEMU resets the FIFO state between boots. On real hardware, the FIFO retains whatever was in it.

## The Interrupt Problem

Even with MCR fixed, UART RX interrupts still didn't work on the VF2. Characters arrived (MCR+DTR+RTS fixed that), but only when we *polled* LSR — the interrupt handler never fired.

The likely cause: the VisionFive 2's UART interrupt routing is more complex than a simple PLIC wire. The JH7110 has interrupt muxing through its SYSCON (system controller), and the IRQ number we use (32) may require additional configuration in the system controller registers. The device tree for the JH7110 shows UART0 using IRQ 32 on the PLIC, but there may be an intermediate mux that needs enabling.

We'll revisit this when we parse the device tree in a later chapter. For now, we have a pragmatic solution.

## Polling: The Pragmatic Fix

If interrupts won't cooperate, poll. Our UART already has a `getc()` function that checks LSR bit 0:

```rust
pub fn getc(&self) -> Option<u8> {
    unsafe {
        if ptr::read_volatile(self.reg(5)) & 1 != 0 {
            Some(ptr::read_volatile(self.reg(0)))
        } else {
            None
        }
    }
}
```

The idle loop becomes a busy-poll:

```rust
loop {
    if let Some(c) = uart.getc() {
        match c {
            0x12 => {
                println!("\n  Rebooting...");
                sbi_system_reset();
            }
            b'\r' | b'\n' => { uart.putc(b'\r'); uart.putc(b'\n'); }
            0x7F | 0x08 => { uart.putc(0x08); uart.putc(b' '); uart.putc(0x08); }
            _ => uart.putc(c),
        }
    }
}
```

This works. Characters echo instantly. But there's a catch.

## The WFI Trap

Our original idle loop used `wfi` (Wait For Interrupt):

```rust
loop {
    unsafe { asm!("wfi"); }
}
```

WFI puts the CPU to sleep until an interrupt arrives. With interrupt-driven UART, this was perfect — the CPU sleeps, a keystroke triggers a UART interrupt, the CPU wakes, handles it, goes back to sleep. Minimal power consumption.

But we're *polling* now. With WFI in the loop, the CPU goes to sleep and *only wakes on timer interrupts* — every 10 seconds. So characters echo at one character per 10-second tick. Unusable.

```rust
// DON'T DO THIS with polling:
loop {
    if let Some(c) = uart.getc() { /* ... */ }
    unsafe { asm!("wfi"); }  // Sleeps for 10 seconds!
}
```

The fix is simple: remove WFI. The CPU busy-polls, burning 100% of one core, but echo is instant.

> :sarcasticgoose: "But that wastes power!" Yes. The VisionFive 2 draws about 5W regardless. We're not shipping this to production — we're debugging a kernel. When we fix interrupt routing (or parse the device tree to discover the correct IRQ), we'll restore WFI and interrupt-driven I/O. Don't optimize for power before you have correct behavior.

> :weightliftinggoose: This is a deliberate engineering trade-off, not laziness. Polling gives us a working, debuggable kernel *now*. We can iterate on everything else — page tables, userspace, IPC — without being blocked on one interrupt routing issue. Ship what works, fix what's broken later. That's what `// TODO` is for.

## The TODO: Let the Core Sleep

The long-term fix is one of:

1. **Parse the device tree** to discover the real IRQ number and any mux configuration needed. The DTB is passed to us in `a1` — we're just not reading it yet.

2. **Use the JH7110 SYSCON** to ensure UART0's interrupt is properly routed through whatever mux sits between the UART and the PLIC.

3. **Try different PLIC contexts** — the VF2 has multiple S-mode contexts for its 4 U74 cores. We use context 3, but the mapping depends on which hart is running.

Once interrupts work, the idle loop becomes:

```rust
loop {
    unsafe { asm!("wfi"); }
    // CPU sleeps here — wakes on UART RX interrupt or timer
    // Interrupt handler runs, CPU returns here, sleeps again
}
```

One instruction. Near-zero power. The CPU wakes only when there's work to do.

> :happygoose: This is the beauty of the interrupt-driven model. The entire kernel idle path is a single instruction. All intelligence lives in the interrupt handlers. But you have to *earn* that beauty by getting every piece of the interrupt chain — UART → MCR → PLIC → stvec → handler — working correctly. On QEMU it just works. On real hardware, you learn what "just works" actually requires.

## What We Changed

| File | Change | Why |
|------|--------|-----|
| `src/uart.rs` | MCR = `0x0B` (OUT2 + RTS + DTR) | Gate interrupt output, enable serial line |
| `src/uart.rs` | FCR = `0x07` (enable + clear FIFOs) | Flush stale data from U-Boot |
| `src/uart.rs` | Init order: IER → LCR → FCR → MCR | Disable IRQs before configuring |
| `src/main.rs` | Busy-poll loop (no WFI) | Polling workaround for broken IRQ routing |
| `src/main.rs` | Added `getc()` match with Ctrl-R, backspace | Interactive serial console |

## Lessons

1. **QEMU lies by omission.** It doesn't model MCR OUT2 gating, FIFO persistence, or interrupt mux complexity. Your code works on QEMU because QEMU is *simpler* than real hardware, not because your code is correct.

2. **Always test on real hardware.** Emulators are for fast iteration. Hardware is for truth. Budget time for the gap.

3. **Polling is a valid strategy.** Not forever — but for unblocking development while you debug a peripheral issue. Don't let one broken subsystem block progress on everything else.

4. **Read the register docs.** The MCR OUT2 bit is documented in every NS16550A datasheet. We missed it because QEMU doesn't need it. Real hardware follows the spec faithfully.

> :angrygoose: Every hour spent debugging MCR OUT2 on real hardware taught more about UART internals than a week of QEMU development. That's the point. The frustration is the curriculum.
