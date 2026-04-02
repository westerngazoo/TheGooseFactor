---
sidebar_position: 2
sidebar_label: "Ch 8: PLIC + UART Interrupts"
title: "Chapter 8: PLIC + Interrupt-Driven UART"
---

# Chapter 8: PLIC + Interrupt-Driven UART

We have a trap handler. Now we need something to actually *trigger* it. Enter the PLIC — the interrupt controller that routes hardware events to our CPU.

## The Interrupt Highway

On RISC-V, external interrupts (from hardware devices) don't go directly to the CPU. They pass through the **PLIC** (Platform-Level Interrupt Controller):

```
UART RX data arrives
    │
    ▼
UART asserts IRQ line 10
    │
    ▼
PLIC checks: Is IRQ 10 enabled? Is its priority > threshold?
    │  yes
    ▼
PLIC asserts Supervisor External Interrupt to hart 0
    │
    ▼
CPU sees sstatus.SIE=1 and sie.SEIE=1 → TRAP
    │
    ▼
_trap_vector → trap_handler() → scause = interrupt, code 9
    │
    ▼
handle_external() → plic::claim() → returns 10 (UART)
    │
    ▼
uart::handle_interrupt() → reads character → echoes it
    │
    ▼
plic::complete(10) → tells PLIC we're done
    │
    ▼
sret → back to wfi loop
```

> :nerdygoose: The PLIC is a *prioritizing* interrupt controller. If multiple devices interrupt simultaneously, the PLIC delivers the highest-priority one first. You claim it (atomically), handle it, then complete it. If another is pending, the CPU traps again immediately after `sret`. This claim/complete protocol prevents two harts from handling the same interrupt.

## PLIC Register Map

The PLIC is an MMIO device at `0x0C00_0000` on QEMU's virt machine. For S-mode on hart 0 (context 1):

```
Address          Register          What It Does
─────────────────────────────────────────────────────
0x0C000028       Priority[10]      UART0 priority (0=off, 1-7=on)
0x0C002080       Enable[ctx1][0]   Bit 10 = enable UART0 for us
0x0C201000       Threshold[ctx1]   Priority threshold (0 = allow all)
0x0C201004       Claim[ctx1]       Read=claim IRQ, Write=complete IRQ
```

> :surprisedgoose: Why is UART0 IRQ number 10? Because the QEMU virt machine's device tree says so. Each platform maps devices to IRQ numbers differently. On the VisionFive 2, the UART IRQ will be a completely different number. This is why we'll need to parse the device tree in Part 4 — hardcoded IRQ numbers are a portability trap.

## The PLIC Driver

```rust
// src/plic.rs

const PLIC_BASE: usize = 0x0C00_0000;
const CONTEXT: usize = 1;  // S-mode hart 0

const ENABLE_BASE: usize = PLIC_BASE + 0x2000 + CONTEXT * 0x80;
const THRESHOLD: usize   = PLIC_BASE + 0x20_0000 + CONTEXT * 0x1000;
const CLAIM_COMPLETE: usize = THRESHOLD + 4;

const UART0_IRQ: u32 = 10;

pub fn init() {
    unsafe {
        // Set UART0 priority = 1
        ptr::write_volatile((PLIC_BASE + UART0_IRQ as usize * 4) as *mut u32, 1);

        // Enable UART0 in our context
        ptr::write_volatile(ENABLE_BASE as *mut u32, 1 << UART0_IRQ);

        // Accept all priorities > 0
        ptr::write_volatile(THRESHOLD as *mut u32, 0);
    }
}
```

Three register writes. That's the entire PLIC setup for one device.

> :angrygoose: Every PLIC register is **32-bit**. Not 8-bit like the UART, not 64-bit like most RISC-V things. Use `*mut u32` and `read_volatile`/`write_volatile`. If you accidentally use `*mut u8` and write a byte, you'll corrupt adjacent fields in the register. If you use `*mut u64`, you'll write two registers at once. Ask me how I know.

### Claim and Complete

```rust
pub fn claim() -> u32 {
    unsafe { ptr::read_volatile(CLAIM_COMPLETE as *const u32) }
}

pub fn complete(irq: u32) {
    unsafe { ptr::write_volatile(CLAIM_COMPLETE as *mut u32, irq); }
}
```

**Claim** (read): atomically returns the highest-priority pending IRQ and marks it as "being handled." Returns 0 if nothing is pending.

**Complete** (write): tells the PLIC we're done. It can now deliver the next interrupt for this source.

> :angrygoose: If you claim but forget to complete, the PLIC thinks you're still handling that IRQ. It will **never deliver another interrupt from that source**. Your UART will receive exactly one character and then go silent forever. Always complete. No exceptions. (Well, one exception — if claim returns 0, don't complete 0.)

## Upgrading the UART

In Part 1, we disabled all UART interrupts (`IER = 0x00`). Now we enable receive interrupts:

```rust
impl Uart {
    pub fn enable_rx_interrupt(&self) {
        let base = self.base as *mut u8;
        unsafe {
            // IER bit 0: receive data available interrupt
            ptr::write_volatile(base.add(1), 0x01);
        }
    }

    pub fn getc(&self) -> Option<u8> {
        let base = self.base as *mut u8;
        unsafe {
            if ptr::read_volatile(base.add(5)) & 1 != 0 {
                Some(ptr::read_volatile(base.add(0)))
            } else {
                None
            }
        }
    }
}
```

> :sharpgoose: Notice we only enable bit 0 (ERBFI — receive data available). We do NOT enable bit 1 (ETBEI — transmit buffer empty). TX stays polling. Why? Because a TX interrupt fires every time the transmit buffer empties — which is *constantly* when we're not sending. We'd drown in spurious TX interrupts. Polling for TX is fine — the busy-wait is microseconds.

### The Interrupt Handler

```rust
pub fn handle_interrupt() {
    let uart = Uart::new(0x1000_0000);
    while let Some(c) = uart.getc() {
        match c {
            b'\r' | b'\n' => {
                uart.putc(b'\r');
                uart.putc(b'\n');
            }
            0x7F | 0x08 => {
                uart.putc(0x08);  // backspace
                uart.putc(b' ');  // overwrite
                uart.putc(0x08);  // back again
            }
            _ => uart.putc(c),   // echo
        }
    }
}
```

The `while let Some(c)` loop drains the entire FIFO. The NS16550A has a 16-byte receive FIFO — if multiple characters arrived before we handled the interrupt, they're all waiting. We read until `getc()` returns `None`.

> :nerdygoose: The `while` loop is critical. If you only read one character per interrupt, and the FIFO had 3 characters, you'd leave 2 behind. The PLIC won't re-assert the interrupt for data already in the FIFO — it only fires for *new* data. Drain completely or lose characters.

## The Initialization Dance

Order matters. Here's the sequence in `kmain`:

```rust
// 1. UART init (polling mode)
uart.init();
// 2. Print banner (uses polling)
println!("GooseOS v0.1.0 ...");
// 3. Set trap vector (but DON'T enable IRQs yet)
trap::trap_init();
// 4. Configure PLIC
plic::init();
// 5. Enable UART RX interrupts
uart.enable_rx_interrupt();
// 6. Arm timer
trap::timer_init();
// 7. NOW enable interrupts globally
trap::interrupts_enable();

println!("Interrupts active! Type something...");
```

> :angrygoose: If you swap steps 3 and 7 — enabling interrupts before setting the trap vector — the timer or UART might fire immediately and jump to `stvec = 0x0`. If you swap 4 and 5 — enabling UART interrupts before the PLIC is configured — the interrupt reaches the CPU but `plic::claim()` returns 0 (spurious). If you do 7 before 4 — well, you get the idea. The order is a dependency chain. Get it wrong and you get silent crashes with no error messages.

## The Result

After boot, GooseOS prints:

```
  [trap] stvec set to 0x80200038
  [plic] UART0 (IRQ 10) enabled, threshold=0
  [uart] RX interrupts enabled
  [trap] timer armed (1s interval, timebase=10MHz)
  [trap] interrupts enabled (SEIE + STIE)

  Interrupts active! Type something...
```

Type characters in QEMU → they echo back via interrupt. Every 10 seconds, the timer prints a tick. The OS is *alive* — responding to the outside world.

> :happygoose: This is the moment GooseOS stops being a "print hello and halt" demo and becomes an actual operating system. It responds to external events. It keeps time. It handles hardware. The `wfi` loop at the end isn't idling — it's *waiting for work*. That's what a kernel does.

## Branch

```bash
git checkout part-3   # see the code at this point
```
