---
sidebar_position: 1
sidebar_label: "Ch 10: Platform Abstraction"
title: "Chapter 10: One Kernel, Two Platforms"
---

# Chapter 10: One Kernel, Two Platforms

Up to now, every constant in GooseOS was hardcoded for QEMU's `virt` machine: the UART address, register stride, IRQ number, boot hart, PLIC context, memory base. Before we can flash real hardware, we need to rip all that out and replace it with a platform abstraction.

The goal: **the same source tree builds for QEMU *and* VisionFive 2**, selected at compile time with a Cargo feature flag.

## The Differences

Let's compare what's actually different between the two targets:

| | QEMU virt | VisionFive 2 (JH7110) |
|---|---|---|
| **UART base** | `0x1000_0000` | `0x1000_0000` (same!) |
| **UART register stride** | 1 byte (NS16550A) | 4 bytes (DesignWare 8250) |
| **RAM base** | `0x8000_0000` | `0x4000_0000` |
| **Kernel entry** | `0x8020_0000` | `0x4020_0000` |
| **Boot hart** | Hart 0 | Hart 1 |
| **UART IRQ** | 10 | 32 |
| **PLIC S-mode context** | 1 | 3 |
| **Timer frequency** | 10 MHz | 10 MHz (same!) |

The UART base address is the same — lucky coincidence. The timer frequency is also 10 MHz on both. Everything else differs.

> :surprisedgoose: "Why is hart 0 not the boot hart on VisionFive 2?" The JH7110 has 5 RISC-V cores: hart 0 is a SiFive **S7** monitor core with *no MMU* — it can't run an OS. Harts 1-4 are SiFive U74 application cores with full Sv39 virtual memory. Hart 1 is the first real application core, so it's the boot hart.

> :angrygoose: This hart numbering thing WILL bite you. If you boot on hart 0 on the VF2, your kernel runs on a core that can't do virtual memory. Everything works fine until Part 5 (page tables) — then mysterious crashes with no obvious cause. Always check which hart you're on.

## Cargo Features

Rust's conditional compilation via `cfg` attributes is perfect for this. In `Cargo.toml`:

```toml
[features]
default = ["qemu"]
qemu = []
vf2 = []
```

`cargo build --release` uses QEMU (default). For VisionFive 2:

```bash
cargo build --release --features vf2 --no-default-features
```

## The Platform Module

All platform-specific constants live in one file — `src/platform.rs`:

```rust
/// Platform-specific constants.
///
/// Select at build time:
///   cargo build --release                     # QEMU (default)
///   cargo build --release --features vf2 --no-default-features  # VF2

// UART register stride
#[cfg(feature = "qemu")]
pub const UART_REG_STRIDE: usize = 1;   // NS16550A: 1-byte spacing

#[cfg(feature = "vf2")]
pub const UART_REG_STRIDE: usize = 4;   // DW8250: 4-byte spacing

// UART IRQ at the PLIC
#[cfg(feature = "qemu")]
pub const UART0_IRQ: u32 = 10;

#[cfg(feature = "vf2")]
pub const UART0_IRQ: u32 = 32;

// Boot hart
#[cfg(feature = "qemu")]
pub const BOOT_HART: usize = 0;

#[cfg(feature = "vf2")]
pub const BOOT_HART: usize = 1;

// PLIC S-mode context for boot hart
#[cfg(feature = "qemu")]
pub const PLIC_S_CONTEXT: usize = 1;

#[cfg(feature = "vf2")]
pub const PLIC_S_CONTEXT: usize = 3;

// Timer
pub const TIMER_FREQ: u64 = 10_000_000;     // 10 MHz on both
pub const TIMER_INTERVAL: u64 = TIMER_FREQ;  // 1 second tick

// Platform name (for boot banner)
#[cfg(feature = "qemu")]
pub const PLATFORM_NAME: &str = "QEMU virt";

#[cfg(feature = "vf2")]
pub const PLATFORM_NAME: &str = "VisionFive 2 (JH7110)";
```

> :nerdygoose: The `#[cfg(feature = "...")]` attribute is a **zero-cost** conditional. Unlike C's `#ifdef`, it operates at the Rust compiler level — the unused variant doesn't generate code, doesn't get type-checked, doesn't affect binary size. The compiler literally doesn't see the other platform's constants.

> :sharpgoose: Notice that `UART_BASE`, `PLIC_BASE`, `TIMER_FREQ`, and `TIMER_INTERVAL` are **not** cfg-gated — they're the same on both platforms. Only gate what's actually different. Less `cfg` = less room for copy-paste errors.

## UART: Stride-Based Register Access

The biggest driver change: NS16550A and DesignWare 8250 have the same *logical* registers, but different *physical* spacing.

```
NS16550A (QEMU):    THR=0x00  IER=0x01  FCR=0x02  LCR=0x03  LSR=0x05
DW8250 (VF2):       THR=0x00  IER=0x04  FCR=0x08  LCR=0x0C  LSR=0x14
```

The pattern: VF2 addresses = QEMU addresses × 4. We model this as a "stride":

```rust
pub struct Uart {
    base: usize,
    stride: usize,
}

impl Uart {
    /// Create UART with platform defaults.
    pub const fn platform() -> Self {
        Uart {
            base: platform::UART_BASE,
            stride: platform::UART_REG_STRIDE,
        }
    }

    /// Get the address of logical register `index`.
    #[inline(always)]
    fn reg(&self, index: usize) -> *mut u8 {
        (self.base + index * self.stride) as *mut u8
    }

    pub fn putc(&self, c: u8) {
        unsafe {
            while ptr::read_volatile(self.reg(5)) & (1 << 5) == 0 {}
            ptr::write_volatile(self.reg(0), c);
        }
    }
}
```

Register 5 (LSR) is at `base + 5*1 = base+5` on QEMU and `base + 5*4 = base+20` on VF2. One formula, two correct addresses.

> :weightliftinggoose: This is the same technique real OS drivers use. Linux's `serial8250` driver has a `reg_shift` field — our `stride` is `1 << reg_shift`. The principle: parameterize what varies, hardcode what doesn't.

## PLIC: IRQs Beyond 31

QEMU's UART is IRQ 10. VisionFive 2's UART is IRQ 32. This matters because the PLIC enable register is a **bitmask** — each 32-bit word covers 32 IRQs:

```
Enable word 0 (offset 0x00): IRQs 0-31
Enable word 1 (offset 0x04): IRQs 32-63
Enable word 2 (offset 0x08): IRQs 64-95
...
```

IRQ 10 → word 0, bit 10. IRQ 32 → word 1, bit 0. Our old code `1 << UART0_IRQ` worked for IRQ 10 but would overflow at IRQ 32. The fix:

```rust
let word_index = (UART0_IRQ / 32) as usize;
let bit_index = UART0_IRQ % 32;
let enable_addr = (ENABLE_BASE + word_index * 4) as *mut u32;
ptr::write_volatile(enable_addr, 1 << bit_index);
```

> :angrygoose: If you hardcode `ptr::write_volatile(enable, 1 << 10)` and then switch to VF2 with IRQ 32, you get `1 << 32` which is *undefined behavior* on a 32-bit shift — on some platforms it wraps to 1, on others it's 0. Either way, your interrupt never enables and you get zero output after boot with no error message. Ask me how I know.

## Boot Assembly: Hart Parking

`boot.S` needs to park non-boot harts. On QEMU (1 hart), hart 0 boots. On VF2 (5 harts), only hart 1 should boot — harts 0, 2, 3, 4 park in `wfi`.

We define `_boot_hart_id` in the linker script (0 for QEMU, 1 for VF2), then load and compare it:

```asm
_start:
    # Load boot hart ID from embedded data
    la      t0, _boot_hart_data
    ld      t0, 0(t0)
    bne     a0, t0, _park       # park if a0 != expected boot hart

    # ... zero BSS, set stack, jump to Rust ...

_park:
    wfi
    j       _park

# Boot config data — absolute relocation, no range limit
.align 3
_boot_hart_data:
    .dword _boot_hart_id
```

> :nerdygoose: Why not just `la t0, _boot_hart_id` directly? Because `la` uses PC-relative addressing (`auipc + addi`), and `_boot_hart_id = 0` is an *absolute* symbol at address 0x0 — the offset from PC (0x80200000) to address 0 overflows the 20-bit immediate. We store the value in a nearby `.dword` using an absolute 64-bit relocation (R_RISCV_64), then load from there with `ld`. The indirection costs one extra instruction but avoids the linker error.

## Linker Scripts

Each platform gets its own linker script. The key difference is the RAM base:

**`linker.ld`** (QEMU):
```ld
MEMORY {
    RAM (rwx) : ORIGIN = 0x80200000, LENGTH = 126M
}
/* ... sections ... */
_boot_hart_id = 0;
```

**`linker-vf2.ld`** (VisionFive 2):
```ld
MEMORY {
    RAM (rwx) : ORIGIN = 0x40200000, LENGTH = 126M
}
/* ... sections ... */
_boot_hart_id = 1;
```

Both use `ORIGIN + 0x200000` — the OpenSBI convention puts the kernel at DRAM base + 2MB. OpenSBI occupies the first 2MB.

## Build Targets

The Makefile handles both platforms:

```makefile
# QEMU (default)
build:
    cargo build --release

run: build
    qemu-system-riscv64 -machine virt -nographic -bios default \
        -kernel target/riscv64gc-unknown-none-elf/release/goose-os

# VisionFive 2
build-vf2:
    RUSTFLAGS="-C link-arg=-Tlinker-vf2.ld" \
      cargo build --release --features vf2 --no-default-features

kernel-vf2: build-vf2
    llvm-objcopy -O binary $(KERNEL_ELF) kernel.bin
```

The QEMU build uses `linker.ld` (from `.cargo/config.toml`). The VF2 build overrides it with `RUSTFLAGS` and switches the Cargo feature.

`kernel.bin` is a raw binary — no ELF headers. U-Boot's `go` command expects a raw binary at a known address, not an ELF file.

> :sharpgoose: `RUSTFLAGS` completely *replaces* the rustflags from `.cargo/config.toml` — it doesn't append. That's exactly what we want: the VF2 build gets `-Tlinker-vf2.ld` instead of `-Tlinker.ld`, not both.

## Testing

Build and run on QEMU — everything should still work:

```bash
$ make test
          __
       __( o)>     GooseOS v0.1.0
      \  _/        RISC-V 64-bit
       \\\         Written in Rust
        \\\        Platform: QEMU virt
         \   )_    Honk.
      ~~~^~~~~

  Booted on hart 0
  DTB address:   0x87e00000
  Kernel entry:  0x80200482

  [trap] stvec set to 0x80200050
  [plic] UART0 (IRQ 10) enabled, context=1, threshold=0
  [uart] RX interrupts enabled
  [trap] timer armed (1s interval, timebase=10MHz)
  [trap] interrupts enabled (SEIE + STIE)

  Interrupts active! Type something...
  (timer ticks every 10s, Ctrl-A X to exit QEMU)
```

The banner now shows "Platform: QEMU virt". Build for VF2 and verify it compiles:

```bash
$ make build-vf2
   Compiling goose-os v0.1.0
    Finished `release` profile [optimized] target(s)
```

## What We Changed

| File | Change |
|------|--------|
| `Cargo.toml` | Added `[features]` with `qemu` (default) and `vf2` |
| `src/platform.rs` | **New** — all cfg-gated constants |
| `src/uart.rs` | Added `stride` field, `platform()` constructor |
| `src/console.rs` | Uses `Uart::platform()` |
| `src/plic.rs` | Uses `platform::` constants, proper word/bit calc |
| `src/trap.rs` | Uses `platform::UART0_IRQ` and `TIMER_INTERVAL` |
| `src/main.rs` | Uses `Uart::platform()`, shows platform name |
| `src/boot.S` | Loads boot hart ID from data word |
| `linker.ld` | Added `_boot_hart_id = 0` |
| `linker-vf2.ld` | **New** — VF2 memory layout, `_boot_hart_id = 1` |
| `Makefile` | Added `build-vf2`, `kernel-vf2`, `flash-sd` targets |

> :happygoose: One codebase, two platforms, zero `#ifdef` spaghetti. The entire platform diff is captured in `platform.rs` constants + linker scripts. Adding a third platform (say, the Milk-V Mars) means adding one more set of `#[cfg]` constants and a linker script. No driver changes needed.

## Branch

```bash
git checkout part-4   # see the code at this point
```
