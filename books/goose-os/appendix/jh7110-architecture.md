---
sidebar_position: 5
sidebar_label: "JH7110 / VisionFive 2"
title: "Appendix: StarFive JH7110 SoC Architecture"
---

# Appendix: StarFive JH7110 SoC Architecture

The VisionFive 2 is built around StarFive's **JH7110** System-on-Chip — a quad-core RISC-V application processor. Understanding its architecture helps explain why GooseOS needs different constants for VF2 vs QEMU, and where the hardware quirks come from.

## The SoC at a Glance

| Feature | Specification |
|---------|--------------|
| **CPU** | 4× SiFive U74 (RV64GC) + 1× SiFive S7 (RV64IMAC) |
| **Clock** | Up to 1.5 GHz (U74 cores) |
| **Cache** | 32KB I$ + 32KB D$ per core, 2MB shared L2 |
| **RAM** | LPDDR4/LPDDR4x, 2/4/8 GB |
| **GPU** | Imagination BXE-4-32 (not relevant for OS dev) |
| **Storage** | eMMC 5.1, SDIO 3.0, QSPI NOR flash |
| **Networking** | 2× Gigabit Ethernet (Cadence MACB) |
| **USB** | USB 3.0 host, USB 2.0 OTG |
| **Video** | HDMI 2.0, MIPI DSI/CSI |
| **Boot ROM** | Mask ROM with boot source selection via DIP switches |

## The Five Harts

The JH7110 has **five** RISC-V hardware threads (harts), but they are not all equal:

```
┌───────────────────────────────────────────────────────┐
│                   JH7110 SoC                          │
│                                                       │
│  ┌─────────────┐  ┌──────────┬──────────┬──────────┐ │
│  │  Hart 0     │  │ Hart 1   │ Hart 2   │ Hart 3   │ │
│  │  SiFive S7  │  │ SiFive   │ SiFive   │ SiFive   │ │
│  │  RV64IMAC   │  │ U74      │ U74      │ U74      │ │
│  │  NO MMU     │  │ RV64GC   │ RV64GC   │ RV64GC   │ │
│  │  Monitor    │  │ +Sv39    │ +Sv39    │ +Sv39    │ │
│  │  core       │  │ App core │ App core │ App core │ │
│  └─────────────┘  └──────────┴──────────┴──────────┘ │
│                                                       │
│  ┌──────────┐                                        │
│  │ Hart 4   │  (Hart 4 = second group, same as 1-3)  │
│  │ SiFive   │                                        │
│  │ U74      │                                        │
│  │ RV64GC   │                                        │
│  │ +Sv39    │                                        │
│  └──────────┘                                        │
└───────────────────────────────────────────────────────┘
```

### Hart 0: The Monitor Core (S7)

Hart 0 is a **SiFive S7** — a simpler core designed for system monitoring:

- **RV64IMAC** — integer, multiply, atomics, compressed. **No floating point** (no F/D extensions).
- **No MMU** — cannot run virtual memory (no Sv39). This means it cannot run an OS with page tables.
- Intended for real-time tasks, power management, and watchdog functions.
- **This is NOT the boot hart for OS code.** OpenSBI starts the kernel on hart 1.

### Harts 1-4: Application Cores (U74)

Harts 1 through 4 are **SiFive U74** application processors:

- **RV64GC** — full general-purpose ISA (integer + multiply + atomics + single-float + double-float + compressed).
- **Sv39 MMU** — 3-level page tables, 39-bit virtual address space (512 GiB).
- **S-mode support** — can run supervisor-level code (OS kernels).
- Each has 32KB instruction cache + 32KB data cache.
- Share a 2MB L2 cache.

> :angrygoose: Hart 0 will happily run your kernel — right up until you enable virtual memory. The S7 core has no `satp` CSR, no TLB, no page table walker. Enabling Sv39 on hart 0 causes an illegal instruction trap. If your kernel "works on hart 0 but crashes when you add page tables," you're running on the wrong hart. GooseOS boots on hart 1 — the first U74 core.

> :nerdygoose: The SiFive U74 is documented in the [SiFive U74 Core Complex Manual](https://www.sifive.com/documentation). It's the same core used in the Milk-V Mars, Pine64 Star64, and several other RISC-V SBCs. Code that runs on one U74 board will run on all of them with minimal porting (different peripheral addresses, same core).

## Memory Map

The JH7110's physical address space is organized as follows:

```
0x0000_0000 ┌─────────────────────────────────┐
            │ Debug / CLINT / PLIC / SYSCON   │
            │ (system control registers)      │
0x0200_0000 ├─────────────────────────────────┤
            │ CLINT (Core-Local Interruptor)  │
            │ Timer, IPI                      │
0x0C00_0000 ├─────────────────────────────────┤
            │ PLIC (Platform-Level Interrupt  │
            │ Controller)                     │
            │ 0x0C00_0000: priority registers │
            │ 0x0C00_2000: pending bits       │
            │ 0x0C00_2080: enable bits        │
            │ 0x0C20_0000: threshold/claim    │
0x1000_0000 ├─────────────────────────────────┤
            │ UART0 (DesignWare 8250)         │
            │ 115200 baud, 4-byte stride      │
0x1001_0000 ├─────────────────────────────────┤
            │ UART1-5, SPI, I2C, GPIO         │
            │ (other peripherals)             │
0x1200_0000 ├─────────────────────────────────┤
            │ QSPI controller (SPI flash)     │
0x1300_0000 ├─────────────────────────────────┤
            │ SDIO / eMMC controller          │
            │ Ethernet, USB, etc.             │
            │                                 │
0x2000_0000 ├─────────────────────────────────┤
            │ SPI flash memory-mapped window  │
            │ (XIP — execute in place)        │
            │                                 │
0x4000_0000 ├═════════════════════════════════┤
            │ DRAM BASE                       │
            │                                 │
            │ 0x4000_0000: OpenSBI (2MB)      │
            │ 0x4020_0000: Kernel entry       │
            │ 0x4600_0000: DTB (device tree)  │
            │                                 │
            │ ... up to 8GB ...               │
            │                                 │
0x4000_0000 │                                 │
  + RAM_SIZE└─────────────────────────────────┘
```

### Key Differences from QEMU

| | QEMU `virt` | JH7110 (VisionFive 2) |
|---|---|---|
| **DRAM base** | `0x8000_0000` | `0x4000_0000` |
| **Kernel entry** | `0x8020_0000` | `0x4020_0000` |
| **UART base** | `0x1000_0000` | `0x1000_0000` (same!) |
| **UART type** | NS16550A (1-byte stride) | DW8250 (4-byte stride) |
| **UART IRQ** | 10 | 32 |
| **PLIC base** | `0x0C00_0000` | `0x0C00_0000` (same!) |
| **PLIC S-mode context** | 1 (hart 0, S-mode) | 3 (hart 1, S-mode) |
| **Timer freq** | 10 MHz | 10 MHz (same!) |

> :happygoose: The UART and PLIC base addresses being identical is a happy coincidence — both QEMU's `virt` machine and the JH7110 follow common RISC-V platform conventions. The timer frequency is also 10 MHz on both. This means three of our platform constants don't need cfg-gating at all.

## PLIC Context Numbering

The PLIC maps each hart's privilege modes to "contexts." On the JH7110:

```
Context 0: Hart 0 M-mode (S7 monitor core)
Context 1: Hart 1 M-mode
Context 2: Hart 1 S-mode  ◄── You might think this is it, but...
Context 3: Hart 1 S-mode  ◄── This is the one that works
Context 4: Hart 2 M-mode
Context 5: Hart 2 S-mode
Context 6: Hart 3 M-mode
Context 7: Hart 3 S-mode
Context 8: Hart 4 M-mode
Context 9: Hart 4 S-mode
```

GooseOS uses context 3 for the boot hart (hart 1, S-mode). The context numbering depends on how OpenSBI configures the PLIC delegation — contexts that OpenSBI reserves for M-mode are not accessible from S-mode.

> :sharpgoose: The PLIC context affects two things: the enable register set (which IRQs are enabled for this context) and the threshold/claim registers (priority filtering and interrupt acknowledgment). Using the wrong context means your enables go to the wrong hart/mode, and your claims read the wrong pending interrupts. If interrupts "don't work" on VF2, wrong PLIC context is a prime suspect.

## The UART: DesignWare 8250

The JH7110 uses a **Synopsys DesignWare 8250** UART, which is register-compatible with the original NS16550A but with 4-byte register spacing instead of 1-byte:

```
NS16550A (QEMU):
  THR = base + 0    IER = base + 1    FCR = base + 2
  LCR = base + 3    MCR = base + 4    LSR = base + 5

DesignWare 8250 (JH7110):
  THR = base + 0    IER = base + 4    FCR = base + 8
  LCR = base + 12   MCR = base + 16   LSR = base + 20
```

Same logical registers, same bit definitions, different physical offsets. This is why GooseOS uses a `stride` parameter — multiply the register index by stride to get the physical offset:

```rust
fn reg(&self, index: usize) -> *mut u8 {
    (self.base + index * self.stride) as *mut u8
}
```

The DesignWare 8250 also faithfully implements the **MCR OUT2 interrupt gating** behavior — if MCR bit 3 is not set, interrupt output is suppressed. QEMU's NS16550A emulation does not model this (see Chapter 12).

> :nerdygoose: The 4-byte stride exists because the DW8250 is designed for 32-bit bus architectures. Each register occupies a full 32-bit word even though only 8 bits are used. This makes bus access simpler (all accesses are word-aligned) at the cost of address space. Linux's `serial8250` driver calls this `reg_shift = 2` (shift left by 2 = multiply by 4).

## Boot Flow

The JH7110's boot sequence, in detail:

```
                      Power On
                         │
                    ┌────▼────┐
                    │ BootROM │  Reads DIP switches
                    │ (mask)  │  Selects boot source
                    └────┬────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         ┌────────┐ ┌────────┐ ┌────────┐
         │  SPI   │ │  SD    │ │  UART  │
         │ Flash  │ │  Card  │ │ (xmodem│
         └───┬────┘ └───┬────┘ └───┬────┘
             └──────────┼──────────┘
                        │
                   ┌────▼────┐
                   │  SPL    │  Secondary Program Loader
                   │         │  - Initializes DDR RAM
                   │         │  - Loads U-Boot + OpenSBI
                   └────┬────┘
                        │
                   ┌────▼────┐
                   │ OpenSBI │  M-mode firmware
                   │         │  - SBI timer, IPI, reset
                   │         │  - Delegates traps to S-mode
                   │         │  - Jumps to U-Boot
                   └────┬────┘
                        │
                   ┌────▼────┐
                   │ U-Boot  │  Bootloader (S-mode)
                   │         │  - Reads bootcmd
                   │         │  - fatload kernel.bin
                   │         │  - go 0x40200000
                   └────┬────┘
                        │
                   ┌────▼────┐
                   │ GooseOS │  Our kernel (S-mode)
                   │         │  - a0 = hart ID (1)
                   │         │  - a1 = DTB addr
                   └─────────┘
```

### SPL: The Hidden First Stage

SPL (Secondary Program Loader) is the most critical piece. It runs from SRAM (before DDR is initialized) and has one job: **bring up DDR RAM**. DDR initialization involves training the memory controller to the specific DRAM chips on the board — timing parameters, voltage levels, signal integrity calibration.

SPL is board-specific. A VisionFive 2 v1.2A and v1.3B may need different DDR training parameters. Using the wrong SPL can result in boot failure (the dreaded `CCCCCC...` loop on the serial console — the BootROM retrying SPL load indefinitely).

> :angrygoose: If your VisionFive 2 shows `CCCCCCCC...` on the serial console and never gets to U-Boot, the problem is SPL. Either the SPL binary doesn't match your board revision's DDR chips, or the SPI flash containing SPL is corrupted. This is NOT a GooseOS problem — it's a firmware problem. Use SD card boot (DIP: SW1 ON, SW2 OFF) to bypass SPI flash entirely, or reflash SPL using the UART recovery procedure from StarFive's documentation.

### OpenSBI: The Invisible Layer

OpenSBI runs in M-mode (the highest privilege level) and provides the SBI (Supervisor Binary Interface) to the kernel:

| SBI Extension | EID | What It Does |
|---------------|-----|-------------|
| Timer | `0x54494D45` | Set timer interrupt |
| IPI | `0x735049` | Inter-processor interrupt |
| RFENCE | `0x52464E43` | Remote fence (TLB flush) |
| HSM | `0x48534D` | Hart State Management (start/stop cores) |
| **SRST** | `0x53525354` | **System Reset** (reboot/shutdown) |
| PMU | `0x504D55` | Performance monitoring |

GooseOS uses Timer (for periodic interrupts) and SRST (for Ctrl-R reboot). HSM will become important when we enable SMP (multicore) in Part 12.

> :nerdygoose: All SBI calls use the same `ecall` convention: extension ID in `a7`, function ID in `a6`, arguments in `a0`-`a5`. OpenSBI traps the `ecall` in M-mode, services the request, and returns to S-mode. The kernel never touches M-mode registers directly — it asks OpenSBI via `ecall`, like a syscall but one level deeper.

## The SPI Flash Layout

The JH7110's QSPI NOR flash (typically 16MB) stores the boot firmware:

```
Offset      Size     Content
──────────────────────────────────
0x000000    256KB    SPL (u-boot-spl.bin.normal.out)
0x040000    768KB    (reserved / U-Boot env)
0x100000    3MB      OpenSBI + U-Boot (fw_payload.img)
0x400000    12MB     (available / factory data)
```

> :angrygoose: This flash is NOT where GooseOS lives. GooseOS goes on the SD card. The SPI flash holds the *bootloader chain* — SPL, OpenSBI, and U-Boot. Don't write to it unless you're updating firmware, and always keep a known-good SD card boot image as backup. A bricked SPI flash means the board can only boot from SD card (DIP switch to SD mode) — which is actually fine for development, but annoying.

## VisionFive 2 Board Pinout (Key Pins)

```
VisionFive 2 GPIO Header (40-pin, RPi-compatible layout)

        3V3  (1)  (2)  5V
       SDA1  (3)  (4)  5V
       SCL1  (5)  (6)  GND      ◄── Serial GND
      GPIO7  (7)  (8)  UART TX  ◄── Serial TX (to adapter RX)
        GND  (9)  (10) UART RX  ◄── Serial RX (to adapter TX)
     GPIO17 (11)  (12) GPIO18
     GPIO27 (13)  (14) GND
     GPIO22 (15)  (16) GPIO23
        3V3 (17)  (18) GPIO24
   SPI_MOSI (19)  (20) GND
   SPI_MISO (21)  (22) GPIO25
   SPI_SCLK (23)  (24) SPI_CE0
        GND (25)  (26) SPI_CE1
      SDA0  (27)  (28) SCL0
      GPIO5 (29)  (30) GND
      GPIO6 (31)  (32) GPIO12
     GPIO13 (33)  (34) GND
     GPIO19 (35)  (36) GPIO16
     GPIO26 (37)  (38) GPIO20
        GND (39)  (40) GPIO21
```

For GooseOS development, only three pins matter: **pin 6 (GND)**, **pin 8 (TX)**, and **pin 10 (RX)**. Connect these to your USB-to-serial adapter (3.3V TTL, NOT RS-232) at 115200 baud, 8N1.

## Resources

- [StarFive JH7110 Technical Reference Manual](https://doc-en.rvspace.org/JH7110/TRM/) — Full SoC documentation
- [SiFive U74 Core Manual](https://www.sifive.com/documentation) — CPU core details, CSRs, MMU
- [VisionFive 2 Schematics](https://github.com/starfive-tech/VisionFive2/tree/main/Hardware) — Board-level design
- [OpenSBI Documentation](https://github.com/riscv-software-src/opensbi/tree/master/docs) — SBI specification and implementation
- [RISC-V PLIC Specification](https://github.com/riscv/riscv-plic-spec) — Interrupt controller details
- [DesignWare 8250 in Linux](https://github.com/torvalds/linux/blob/master/drivers/tty/serial/8250/8250_dw.c) — Linux's DW8250 driver (reference implementation)
