---
sidebar_position: 4
sidebar_label: "Ch 4: Hello World in Rust"
title: "Chapter 4: Hello World — UART Driver and Kernel Entry"
---

# Chapter 4: Hello World — UART Driver and Kernel Entry

We have assembly that boots and calls `kmain`. Now we write the Rust side: a UART driver to talk to the outside world, and the kernel entry point that ties everything together.

## The UART: Our Only Window to the World

Right now, GooseOS has no display driver, no filesystem, no network stack. The **only** way to see that our kernel is running is to write bytes to the UART (serial port). QEMU routes UART output to your terminal, so anything we write appears on screen.

The QEMU virt machine provides an **NS16550A**-compatible UART at address `0x10000000`. This is one of the most common serial controllers in computing history — it was in the original IBM PC and it's still emulated everywhere.

## How MMIO Works

The UART isn't accessed through special instructions. It's **memory-mapped** — reading and writing to specific memory addresses controls the hardware:

```
Address        Register    What It Does
────────────────────────────────────────────────
0x10000000     THR         Transmit Holding Register (write a byte to send it)
0x10000001     IER         Interrupt Enable Register
0x10000002     FCR         FIFO Control Register
0x10000003     LCR         Line Control Register (data format)
0x10000005     LSR         Line Status Register (is it ready?)
```

Writing the byte `0x41` (ASCII 'A') to address `0x10000000` sends the character 'A' out the serial port. That's it. That's how all hardware I/O works at the lowest level.

## `src/uart.rs` — The UART Driver

```rust
/// NS16550A UART driver for QEMU virt machine.
///
/// Register map (offsets from base address):
///   0x00  THR  - Transmit Holding Register (write)
///   0x00  RBR  - Receive Buffer Register (read)
///   0x01  IER  - Interrupt Enable Register
///   0x02  FCR  - FIFO Control Register (write)
///   0x03  LCR  - Line Control Register
///   0x05  LSR  - Line Status Register
///
/// All registers are 8-bit (byte-wide) MMIO.

use core::ptr;

pub struct Uart {
    base: usize,
}

impl Uart {
    pub const fn new(base: usize) -> Self {
        Uart { base }
    }

    /// Initialize UART: 8-bit words, FIFOs enabled, no interrupts.
    pub fn init(&self) {
        let base = self.base as *mut u8;
        unsafe {
            // LCR: 8 data bits, 1 stop bit, no parity
            ptr::write_volatile(base.add(3), 0x03);
            // FCR: enable FIFOs
            ptr::write_volatile(base.add(2), 0x01);
            // IER: disable all interrupts (for now)
            ptr::write_volatile(base.add(1), 0x00);
        }
    }

    /// Write a single byte, waiting until the transmitter is ready.
    pub fn putc(&self, c: u8) {
        let base = self.base as *mut u8;
        unsafe {
            // Spin until LSR bit 5 (THR empty) is set
            while ptr::read_volatile(base.add(5)) & (1 << 5) == 0 {}
            // Write the character to THR
            ptr::write_volatile(base.add(0), c);
        }
    }

    /// Write a string, converting \n to \r\n for terminal compatibility.
    pub fn puts(&self, s: &str) {
        for byte in s.bytes() {
            if byte == b'\n' {
                self.putc(b'\r');
            }
            self.putc(byte);
        }
    }
}
```

Let's examine every piece.

### The Struct

```rust
pub struct Uart {
    base: usize,
}

impl Uart {
    pub const fn new(base: usize) -> Self {
        Uart { base }
    }
```

We store the MMIO base address as a `usize`. `const fn` means this can be evaluated at compile time — important later when we create a `static` UART instance.

**Why not a raw pointer?** Keeping it as `usize` and converting to `*mut u8` only when needed makes the struct `Send` and `Sync` by default (raw pointers are `!Send` and `!Sync`). This matters when we eventually share the UART across cores.

> :sharpgoose: This `usize` trick is a deliberate design choice. By storing the address as an integer, we make the type safe to share between threads — the Rust compiler auto-derives `Send + Sync`. If we stored `*mut u8`, we'd need `unsafe impl Send for Uart {}` and a comment explaining why. The `usize` approach encodes the safety argument in the type itself.
>
> :nerdygoose: `const fn new()` is key for kernel globals. We'll eventually write `static UART: Uart = Uart::new(0x1000_0000);` — and that only works if the constructor is `const`. Planning ahead here saves a refactor later.

### Initialization

```rust
pub fn init(&self) {
    let base = self.base as *mut u8;
    unsafe {
        ptr::write_volatile(base.add(3), 0x03);  // LCR
        ptr::write_volatile(base.add(2), 0x01);  // FCR
        ptr::write_volatile(base.add(1), 0x00);  // IER
    }
}
```

Three register writes configure the UART:

**LCR (offset 3) = `0x03`:**
```
Bit 1-0 = 11  →  8 data bits (we want full byte transfers)
Bit 2   = 0   →  1 stop bit
Bit 5-3 = 000 →  no parity
```

**FCR (offset 2) = `0x01`:**
```
Bit 0 = 1  →  enable TX/RX FIFOs (16-byte hardware buffers)
```

**IER (offset 1) = `0x00`:**
```
All bits 0  →  no interrupts (we'll poll for now)
```

**On baud rate:** Real UART hardware needs a baud rate divisor set via the DLAB (Divisor Latch Access Bit). QEMU's emulated UART ignores the baud rate — it transfers instantly. We skip it for simplicity.

### The Critical Keyword: `volatile`

```rust
ptr::write_volatile(base.add(0), c);
```

**This is the most important concept in the file.** Without `volatile`, the Rust/LLVM optimizer sees:

> "You're writing to a pointer you never read back. This write has no observable effect. I'll optimize it away."

And your UART output **disappears**. The compiler is technically correct — from its view of memory, the write is dead code. But we know the write has a **side effect**: it sends a byte through the hardware.

`write_volatile` tells the compiler: "This write has externally-visible effects you can't reason about. Do not reorder, combine, or eliminate it."

Similarly, `read_volatile` for the status register prevents the compiler from caching the value in a register and never re-reading it (which would make our busy-wait loop spin forever or not at all).

> :angrygoose: This is not a hypothetical bug. I've seen UART drivers that "work" in debug mode and produce zero output in release mode. The optimizer is *aggressive* — it will remove MMIO writes, hoist reads out of loops, and reorder stores. `volatile` is your firewall.
>
> :sarcasticgoose: "But my code works without `volatile`!" It works *today*, with *this* optimizer version, at *this* optimization level. Change any one of those and your serial output vanishes. Using `volatile` correctly is not optional — it's a correctness requirement.

### Transmitting a Byte

```rust
pub fn putc(&self, c: u8) {
    let base = self.base as *mut u8;
    unsafe {
        while ptr::read_volatile(base.add(5)) & (1 << 5) == 0 {}
        ptr::write_volatile(base.add(0), c);
    }
}
```

**Step 1: Wait for ready.** Read the LSR (Line Status Register, offset 5). Bit 5 is "THR Empty" — it's 1 when the transmit holding register can accept a new byte. We spin-wait until it's set.

**Step 2: Send.** Write the byte to THR (offset 0). The UART hardware takes it from here — shifting it out bit by bit at the configured baud rate.

On QEMU, the THR is always ready (bit 5 is always 1), so the loop never actually spins. On real hardware (VisionFive 2), this matters — if you blast bytes faster than the baud rate, you'll overflow the FIFO and lose data.

### String Output

```rust
pub fn puts(&self, s: &str) {
    for byte in s.bytes() {
        if byte == b'\n' {
            self.putc(b'\r');
        }
        self.putc(byte);
    }
}
```

Iterates over the UTF-8 bytes of a Rust `&str` and sends them one by one. The `\n` → `\r\n` conversion is for terminal compatibility: most terminals expect a carriage return before a newline to move the cursor to column 0.

### Why `unsafe`?

Every MMIO access is in an `unsafe` block because:
1. We're dereferencing a raw pointer (`base as *mut u8`)
2. The compiler can't verify that `0x10000000` is valid memory
3. We're responsible for ensuring correctness

This is **correct and necessary** `unsafe`. A UART driver must touch hardware registers. The point of Rust's model isn't to avoid `unsafe` — it's to **isolate** it. All the danger is here, in 30 lines of code, clearly marked. Everything that uses `uart.puts("hello")` is safe Rust.

> :happygoose: This is Rust's superpower for OS code. 30 lines of `unsafe` UART driver, and the *entire rest of the kernel* gets safe `uart.puts()`. In C, every single function is implicitly `unsafe`. In Rust, you build safe abstractions on top of unsafe foundations — and the compiler enforces the boundary.

## `src/main.rs` — Kernel Entry

```rust
//! GooseOS — A RISC-V operating system written in Rust
//!
//! Part 1: Bare-metal boot + Hello World on QEMU virt machine.

#![no_std]
#![no_main]

mod uart;

use core::arch::{asm, global_asm};

// Include the RISC-V assembly boot code.
global_asm!(include_str!("boot.S"));

/// QEMU virt machine UART0 base address.
const UART0_BASE: usize = 0x1000_0000;

/// Kernel main — called from boot.S after stack setup.
#[no_mangle]
pub extern "C" fn kmain(hart_id: usize, _dtb_addr: usize) -> ! {
    let uart = uart::Uart::new(UART0_BASE);
    uart.init();

    uart.puts("\n");
    uart.puts("========================================\n");
    uart.puts("  GooseOS v0.1.0\n");
    uart.puts("  RISC-V 64-bit — Written in Rust\n");
    uart.puts("========================================\n");
    uart.puts("\n");

    uart.puts("Booted on hart ");
    uart.putc(b'0' + hart_id as u8);
    uart.puts("\n");
    uart.puts("Hello from GooseOS!\n");
    uart.puts("\n");

    // Halt — nothing else to do yet.
    loop {
        unsafe { asm!("wfi") };
    }
}

/// Panic handler — required by #![no_std].
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {
        unsafe { asm!("wfi") };
    }
}
```

### The Top-Level Attributes

```rust
#![no_std]
#![no_main]
```

These two lines fundamentally change what Rust is:

**`#![no_std]`** — removes the standard library. No `println!`, no `String`, no `Vec`, no file I/O, no networking. We only have `core` — Rust's zero-dependency foundation (basic types, iterators, `Option`, `Result`, `ptr`, `slice`, math).

**`#![no_main]`** — removes Rust's `main()` entry point. Normally, Rust's runtime calls `main()` after setting up the stack, allocator, and panic infrastructure. We have no runtime. Our entry point is `_start` in assembly, which calls `kmain`.

### Including the Assembly

```rust
global_asm!(include_str!("boot.S"));
```

`include_str!` reads `boot.S` as a string at compile time. `global_asm!` feeds it to LLVM's assembler. The result: `_start` and `_park` become symbols in our binary. No external assembler, no build script, no `cc` crate.

### The Kernel Entry

```rust
#[no_mangle]
pub extern "C" fn kmain(hart_id: usize, _dtb_addr: usize) -> ! {
```

Four things happening:

- **`#[no_mangle]`** — Rust normally name-mangles symbols (e.g., `kmain` becomes `_ZN8goose_os5kmain17h...`). This keeps the symbol as literally `kmain` so `boot.S` can `call kmain`.
- **`extern "C"`** — uses the C calling convention. Arguments come in `a0`, `a1`, etc. Return value goes in `a0`. This matches what the assembly expects.
- **`hart_id: usize`** — received from `a0` (set by OpenSBI). On QEMU with default settings, this is 0.
- **`-> !`** — the "never" type. This function never returns. The Rust compiler enforces this: you must end with an infinite loop, a call to another `-> !` function, or `panic!`.

### The Panic Handler

```rust
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {
        unsafe { asm!("wfi") };
    }
}
```

Required by `#![no_std]`. When Rust panics — array out of bounds, `unwrap()` on `None`, explicit `panic!()` — it calls this function. For now, we just halt. In Part 2, we'll print the panic info to UART so we can actually see what went wrong.

> :angrygoose: A silent panic handler is *dangerous*. If your kernel panics right now, it silently halts with no indication of what went wrong. You'll stare at a frozen QEMU wondering if the boot failed, the UART broke, or your code hit a panic. Part 2 can't come soon enough.
>
> :happygoose: But even this silent handler is better than C's behavior. In C, array out-of-bounds doesn't panic — it silently reads garbage, corrupts the stack, and keeps running. At least Rust *stops* before things get worse.

## Building and Running

```bash
# Install QEMU if you haven't
sudo apt install qemu-system-misc

# Build and run
make run
```

Expected output:

```
OpenSBI v1.x
  ...
  (OpenSBI boot messages)
  ...

========================================
  GooseOS v0.1.0
  RISC-V 64-bit — Written in Rust
========================================

Booted on hart 0
Hello from GooseOS!
```

Exit QEMU: press `Ctrl-A`, then `X`.

## What Just Happened

Let's trace the full path from power-on to "Hello":

```
1. QEMU starts
2. OpenSBI firmware initializes (you see its boot messages)
3. OpenSBI jumps to 0x80200000 in S-mode
4. _start (boot.S):
   ├── a0 = 0 (hart 0), so we don't park
   ├── zeros BSS memory
   ├── sp = _stack_top
   └── call kmain
5. kmain (main.rs):
   ├── Uart::new(0x10000000)
   ├── uart.init() — configures 8-N-1, FIFOs on
   ├── uart.puts("GooseOS...") — writes bytes to 0x10000000
   │   └── each byte: wait for THR empty, write to THR
   └── loop { wfi } — sleep forever
6. QEMU routes UART0 to terminal → you see text
7. Ctrl-A X → QEMU exits
```

Congratulations. You just booted an operating system you wrote from scratch.

> :happygoose: Take a moment. You wrote assembly that boots a CPU, zeroes memory, sets up a stack, and hands off to Rust. You wrote a UART driver that talks directly to hardware. You printed "Hello World" with no OS, no runtime, no libraries. Everything from the first instruction to the last byte on screen is *yours*.
>
> :weightliftinggoose: This is the foundation. Every chapter from here builds on this boot sequence. Virtual memory, interrupts, processes — they're all just "more code that runs after `kmain`". The hardest part (getting to Rust from bare metal) is behind you.

## What's Next

Part 1 is complete. Our OS boots and prints to the screen. But it's fragile:

- **Panic shows nothing** — if something crashes, we just halt silently
- **No `println!` macro** — we're calling `uart.puts()` manually everywhere
- **No formatted output** — can't print numbers, addresses, or debug info

Part 2 solves all three: we'll implement `core::fmt::Write` for our UART, build a `print!` / `println!` macro, and make the panic handler actually useful.
