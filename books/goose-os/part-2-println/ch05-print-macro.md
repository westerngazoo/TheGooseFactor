---
sidebar_position: 1
sidebar_label: "Ch 5: Building println!"
title: "Chapter 5: Building println! — From Raw Bytes to Formatted Output"
---

# Chapter 5: Building `println!` — From Raw Bytes to Formatted Output

In Part 1, we printed text by calling `uart.puts("hello")` directly. That works, but it's painful — you can't print numbers, hex addresses, or anything formatted. Try printing a hart ID:

```rust
// Part 1: ugh
uart.puts("Booted on hart ");
uart.putc(b'0' + hart_id as u8);  // only works for single digits!
uart.puts("\n");
```

We want this instead:

```rust
// Part 2: yes please
println!("Booted on hart {}", hart_id);
println!("DTB at {:#010x}", dtb_addr);
```

To get there, we need three things: `core::fmt::Write`, a global print function, and macros.

## Step 1: Implement `core::fmt::Write` for UART

Rust's formatting system (`{}`, `{:#x}`, `{:?}`) lives in `core::fmt` — no `std` required. It works through one trait:

```rust
pub trait Write {
    fn write_str(&mut self, s: &str) -> fmt::Result;
}
```

That's it. Implement `write_str` and you get `write!`, `writeln!`, and the entire format machinery for free. Here's our implementation:

```rust
impl fmt::Write for Uart {
    fn write_str(&mut self, s: &str) -> fmt::Result {
        self.puts(s);
        Ok(())
    }
}
```

> :happygoose: Four lines. We implement one method and Rust gives us hex formatting, padding, alignment, debug printing, and everything else `core::fmt` provides. This is what "zero-cost abstractions" means — the formatting code is generated at compile time with no runtime overhead beyond the actual character output.

> :nerdygoose: Notice we return `Ok(())` unconditionally. A UART write can't really "fail" in our polling model — we spin until it's ready. If we were buffering with a fixed-size ring buffer, we'd return `Err(fmt::Error)` when the buffer is full. For now, this is correct.

## Step 2: The Console Module

Now the hard part: `println!` needs to work *everywhere* — from `kmain`, from the panic handler, from any module. That means we need a global way to access the UART. Here's where we hit our first real Rust-in-kernel design decision.

```rust
// src/console.rs

use core::fmt;
use core::fmt::Write;
use crate::uart::Uart;

const UART0_BASE: usize = 0x1000_0000;

pub fn _print(args: fmt::Arguments) {
    let mut uart = Uart::new(UART0_BASE);
    uart.write_fmt(args).unwrap();
}
```

> :surprisedgoose: Wait — we're creating a *new* `Uart` struct on every print call? Isn't that wasteful? Nope. `Uart::new()` just stores a `usize`. It compiles down to loading `0x10000000` into a register. There's no allocation, no initialization, no state. The struct is just a typed wrapper around an address.

### The SpinLock That Wasn't

Our first attempt used an `AtomicBool` spin lock to protect the UART:

```rust
// First attempt — this CRASHED
struct SpinLock {
    locked: core::sync::atomic::AtomicBool,
}

static CONSOLE_LOCK: SpinLock = SpinLock::new();

pub fn _print(args: fmt::Arguments) {
    CONSOLE_LOCK.lock();   // 💥 TRAP HERE
    let mut uart = Uart::new(UART0_BASE);
    uart.write_fmt(args).unwrap();
    CONSOLE_LOCK.unlock();
}
```

This compiled fine. It *crashed silently at boot*. No output. No error. Just... nothing.

> :angrygoose: This was a nasty bug. The kernel reached `kmain`, called `println!`, which called `CONSOLE_LOCK.lock()`, which executed an `amoswap` (atomic memory operation) instruction... and trapped. Why? Because we hadn't set up a **trap handler** yet. Any exception — including an unexpected instruction behavior — causes the CPU to jump to `stvec`, which was `0x0`. The CPU jumped to address zero and died.

> :nerdygoose: The specific issue: on some RISC-V configurations, atomic operations on non-cacheable memory regions or without the 'A' extension properly initialized can cause exceptions. QEMU's `virt` machine supports atomics, but the interaction between our flat memory map and the atomic store was generating a trap before we had infrastructure to handle one.

**The fix:** Remove the SpinLock entirely. We only have one hart running (all others are parked in `boot.S`). No concurrency means no lock needed. We'll add a proper spin lock in Part 9 when we bring up SMP.

```rust
// Fixed version — simple, correct for single-hart
pub fn _print(args: fmt::Arguments) {
    let mut uart = Uart::new(UART0_BASE);
    uart.write_fmt(args).unwrap();
}
```

> :sarcasticgoose: "But what about thread safety!" We have one thread. On one core. With all other cores asleep. The spin lock was solving a problem that doesn't exist yet. YAGNI applies even in kernel development — *especially* in kernel development, where premature complexity creates bugs you can't debug.

## Step 3: The Macros

```rust
#[macro_export]
macro_rules! print {
    ($($arg:tt)*) => ($crate::console::_print(format_args!($($arg)*)));
}

#[macro_export]
macro_rules! println {
    () => ($crate::print!("\n"));
    ($($arg:tt)*) => ($crate::print!("{}\n", format_args!($($arg)*)));
}
```

These are nearly identical to the standard library's versions. The key pieces:

- **`#[macro_export]`** — makes the macro available throughout the crate without `use` statements
- **`$crate::console::_print`** — `$crate` resolves to the current crate regardless of where the macro is invoked. This is how macros avoid import issues.
- **`format_args!`** — a compiler built-in that creates a `fmt::Arguments` struct without allocating. The formatted string is built lazily — characters flow directly to our `write_str` implementation.

> :nerdygoose: `format_args!` is special. It doesn't return a `String` (we don't have a heap). It returns `fmt::Arguments` — an opaque struct that captures the format string and arguments by reference. When `write_fmt` is called, it walks the format string and calls `write_str` for each piece. Zero allocations, zero copies beyond the final UART writes.

## The Result

```rust
println!("  Booted on hart {}", hart_id);
println!("  DTB address:   {:#010x}", dtb_addr);
println!("  Kernel entry:  {:#010x}", kmain as *const () as usize);
```

Output:
```
  Booted on hart 0
  DTB address:   0x87e00000
  Kernel entry:  0x80200324
```

> :happygoose: From raw UART byte-banging to formatted kernel output in ~40 lines of code. Every future chapter will use `println!` for debugging, status messages, and diagnostics. This is the most important quality-of-life upgrade in the entire OS.

## Branch

```bash
git checkout part-2   # see the code at this point
```
