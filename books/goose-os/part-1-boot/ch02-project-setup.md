---
sidebar_position: 2
sidebar_label: "Ch 2: Project Setup"
title: "Chapter 2: Setting Up a Bare-Metal Rust Project"
---

# Chapter 2: Setting Up a Bare-Metal Rust Project

In this chapter, we build the project skeleton — the Cargo configuration, linker script, and build tooling that lets Rust compile for bare-metal RISC-V.

## Prerequisites

Install these on your development machine (Ubuntu/WSL):

```bash
# QEMU for RISC-V emulation
sudo apt update
sudo apt install qemu-system-misc

# RISC-V binutils (optional, for objdump/objcopy)
sudo apt install binutils-riscv64-linux-gnu

# Make (build automation)
sudo apt install make
```

Rust nightly and the RISC-V target will be installed automatically by our `rust-toolchain.toml`.

## Project Structure

```
goose-os/
├── .cargo/
│   └── config.toml          # Target + linker + QEMU runner
├── src/
│   ├── main.rs              # Kernel entry point
│   ├── boot.S               # RISC-V assembly bootstrap
│   └── uart.rs              # UART driver
├── linker.ld                # Memory layout
├── Cargo.toml               # Crate manifest
├── rust-toolchain.toml      # Toolchain pinning
└── Makefile                 # Build/run helpers
```

Create it:

```bash
mkdir -p goose-os/src goose-os/.cargo
cd goose-os
```

## File 1: `rust-toolchain.toml`

This file pins the exact Rust toolchain for the project. When anyone runs `cargo build` in this directory, `rustup` automatically installs everything needed.

```toml
[toolchain]
channel = "nightly"
targets = ["riscv64gc-unknown-none-elf"]
components = ["rust-src", "rustfmt", "clippy", "llvm-tools"]
```

**Why nightly?** Bare-metal Rust requires `#![no_std]` and `#![no_main]`, which need nightly for some features. The `global_asm!` macro for including assembly also works best on nightly.

**What's `riscv64gc-unknown-none-elf`?** The target triple:

| Part | Meaning |
|------|---------|
| `riscv64gc` | 64-bit RISC-V with **G**eneral extensions (IMAFD) + **C**ompressed instructions |
| `unknown` | No specific vendor |
| `none` | **No operating system** — bare metal |
| `elf` | Output format |

**Components:**
- `rust-src` — source code for `core`, needed if we ever rebuild it
- `llvm-tools` — gives us `rust-objdump` and `rust-objcopy` for inspecting binaries

## File 2: `Cargo.toml`

```toml
[package]
name = "goose-os"
version = "0.1.0"
edition = "2021"

[profile.dev]
panic = "abort"

[profile.release]
panic = "abort"
opt-level = 2
lto = true
```

**`panic = "abort"`** is critical. By default, Rust panics trigger *stack unwinding* — walking up the call stack, running destructors, printing a backtrace. This requires runtime support from `std` (which we don't have). `abort` tells Rust: "on panic, just stop. Don't try to unwind."

**`lto = true`** enables Link-Time Optimization. The linker can see all code at once and optimize across module boundaries. On bare-metal, this produces significantly smaller binaries.

**Why edition 2021?** Edition 2024 changes `#[no_mangle]` to `#[unsafe(no_mangle)]`. Either works; 2021 is slightly simpler for now.

## File 3: `.cargo/config.toml`

```toml
[build]
target = "riscv64gc-unknown-none-elf"

[target.riscv64gc-unknown-none-elf]
rustflags = ["-C", "link-arg=-Tlinker.ld"]
runner = "qemu-system-riscv64 -machine virt -nographic -bios default -kernel"
```

Three things happening here:

### Default target
```toml
target = "riscv64gc-unknown-none-elf"
```
Now `cargo build` automatically cross-compiles for RISC-V. Without this, you'd type `cargo build --target riscv64gc-unknown-none-elf` every time.

### Linker script
```toml
rustflags = ["-C", "link-arg=-Tlinker.ld"]
```
Passes our `linker.ld` file to `rust-lld` (the LLVM linker bundled with Rust nightly). The `-T` flag is the standard way to specify a linker script. This tells the linker *where in memory* to place our code and data.

### QEMU runner
```toml
runner = "qemu-system-riscv64 -machine virt -nographic -bios default -kernel"
```
Makes `cargo run` boot our kernel in QEMU. The flags:
- `-machine virt` — QEMU's generic RISC-V virtual platform
- `-nographic` — redirect UART to your terminal (no GUI window)
- `-bios default` — use QEMU's built-in OpenSBI firmware
- `-kernel` — Cargo appends the compiled ELF binary path

## File 4: `linker.ld`

This is the blueprint for how our kernel is laid out in memory. It's the most important file to understand.

```ld
OUTPUT_ARCH(riscv)
ENTRY(_start)

MEMORY
{
    RAM (rwx) : ORIGIN = 0x80200000, LENGTH = 126M
}

SECTIONS
{
    .text : {
        KEEP(*(.text.boot))
        *(.text .text.*)
    } > RAM

    .rodata : ALIGN(4K) {
        *(.rodata .rodata.*)
    } > RAM

    .data : ALIGN(4K) {
        *(.data .data.*)
    } > RAM

    .bss : ALIGN(4K) {
        _bss_start = .;
        *(.bss .bss.*)
        *(.sbss .sbss.*)
        _bss_end = .;
    } > RAM

    _stack_top = ORIGIN(RAM) + LENGTH(RAM);

    /DISCARD/ : {
        *(.eh_frame)
        *(.comment)
    }
}
```

### The memory map

QEMU's virt machine has RAM starting at `0x80000000`. But we don't load there — OpenSBI lives there:

```
Address          What lives here
─────────────────────────────────────────
0x00000000       (I/O devices, including UART at 0x10000000)
   ...
0x80000000       OpenSBI firmware (loaded by QEMU)
0x80200000  ───► OUR KERNEL STARTS HERE
   ...           .text   (code)
                 .rodata (read-only data, strings)
                 .data   (initialized globals)
                 .bss    (zero-initialized globals)
                    ...
                 ↓ stack grows downward ↓
0x87E00000       _stack_top (ORIGIN + 126M)
```

**Why `0x80200000`?** This is the convention. OpenSBI occupies `0x80000000` through `0x801FFFFF` (2MB). It then jumps to `0x80200000` in Supervisor mode. This is where our kernel must begin.

### Section ordering

```ld
.text : {
    KEEP(*(.text.boot))    /* _start MUST be first */
    *(.text .text.*)       /* then all other code */
} > RAM
```

`KEEP(*(.text.boot))` is the most critical line. Our assembly entry point `_start` is in section `.text.boot`. This directive forces it to be placed **first** at exactly `0x80200000`. Without it, the linker might reorder our code and OpenSBI would jump into the middle of a random function.

### BSS symbols

```ld
.bss : ALIGN(4K) {
    _bss_start = .;
    *(.bss .bss.*)
    _bss_end = .;
} > RAM
```

The `.bss` section contains zero-initialized static variables. On a normal OS, the program loader zeros this memory. We have no loader — we ARE the loader. So we export `_bss_start` and `_bss_end` as symbols that our assembly boot code uses to zero-fill this region.

### Stack placement

```ld
_stack_top = ORIGIN(RAM) + LENGTH(RAM);
```

The stack pointer starts at the very top of RAM and grows **downward**. This is the simplest approach — no need to calculate sizes. Later, when we add a heap allocator, we'll partition memory more carefully.

## File 5: `Makefile`

```makefile
KERNEL_ELF := target/riscv64gc-unknown-none-elf/release/goose-os
QEMU := qemu-system-riscv64
QEMU_ARGS := -machine virt -nographic -bios default

.PHONY: build run debug objdump clean

build:
	cargo build --release

run: build
	$(QEMU) $(QEMU_ARGS) -kernel $(KERNEL_ELF)

debug: build
	@echo "Connect GDB: riscv64-linux-gnu-gdb -ex 'target remote :1234' $(KERNEL_ELF)"
	$(QEMU) $(QEMU_ARGS) -kernel $(KERNEL_ELF) -s -S

objdump: build
	rust-objdump -d $(KERNEL_ELF) | head -80

clean:
	cargo clean
```

**`make run`** builds and boots QEMU. Exit with `Ctrl-A` then `X`.

**`make debug`** starts QEMU paused with a GDB server on port 1234. You can attach GDB and step through instructions — invaluable when something doesn't boot.

**`make objdump`** disassembles the kernel ELF. Use this to verify `_start` is actually at `0x80200000`.

## Checkpoint

At this point you have a complete project skeleton. Nothing compiles yet — we need the actual source files. That's next.

```
goose-os/
├── .cargo/config.toml     ✅
├── Cargo.toml             ✅
├── rust-toolchain.toml    ✅
├── linker.ld              ✅
├── Makefile               ✅
└── src/
    ├── main.rs            (next chapter)
    ├── boot.S             (next chapter)
    └── uart.rs            (next chapter)
```
