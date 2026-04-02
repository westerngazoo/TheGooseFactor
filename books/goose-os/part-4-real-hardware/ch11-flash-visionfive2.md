---
sidebar_position: 2
sidebar_label: "Ch 11: Flash to VisionFive 2"
title: "Chapter 11: Booting GooseOS on Real Hardware"
---

# Chapter 11: Booting GooseOS on Real Hardware

QEMU is great for development, but there's nothing like seeing your kernel boot on actual silicon. In this chapter we flash GooseOS to a StarFive VisionFive 2 and watch it come up over a serial console.

## What You Need

| Item | Notes |
|------|-------|
| **VisionFive 2** board | 2GB/4GB/8GB, any revision |
| **USB-to-serial adapter** | 3.3V TTL (FTDI, CP2102, CH340). **Not** RS-232 (12V will damage the board!) |
| **MicroSD card** | 4GB+ is fine, FAT32 formatted |
| **5V/3A USB-C power supply** | The board is picky — use a decent one |
| **Jumper wires** | 3 female-to-female DuPont wires for TX/RX/GND |

> :angrygoose: I cannot stress this enough: **3.3V TTL, not RS-232**. The VisionFive 2's GPIO pins are 3.3V. A 12V RS-232 adapter will fry the UART pins instantly. If your adapter has a DB-9 connector, it's RS-232 — don't use it. Get a USB-to-TTL adapter with bare wire ends or DuPont headers.

## Serial Console Wiring

The VisionFive 2's 40-pin GPIO header has UART0 on:

```
VisionFive 2 GPIO Header (top view, USB ports on right)

    3V3  (1) (2)  5V
   SDA1  (3) (4)  5V
   SCL1  (5) (6)  GND  ◄── Ground (black wire)
  GPIO7  (7) (8)  TX   ◄── Board TX → Adapter RX (white/green wire)
    GND  (9) (10) RX   ◄── Board RX → Adapter TX (orange wire)
    ...
```

| Board Pin | Adapter Pin | Wire Color (convention) |
|-----------|-------------|------------------------|
| Pin 6 (GND) | GND | Black |
| Pin 8 (TX) | RX | Green/White |
| Pin 10 (RX) | TX | Orange |

> :surprisedgoose: TX→RX, RX→TX. They cross! The board's transmit connects to the adapter's receive, and vice versa. This trips up everyone at least once. If you see nothing on the serial console, swap TX and RX — that's almost always the fix.

Connect to the serial console from your PC:

```bash
# Linux (using screen)
screen /dev/ttyUSB0 115200

# Linux (using minicom)
minicom -D /dev/ttyUSB0 -b 115200

# Windows (use PuTTY or TeraTerm)
# Select the COM port, 115200 baud, 8N1

# macOS
screen /dev/tty.usbserial-* 115200
```

**Settings**: 115200 baud, 8 data bits, no parity, 1 stop bit (8N1). No hardware flow control.

## VisionFive 2 Boot Chain

Understanding the boot chain is critical for debugging:

```
┌─────────────────────────────────────────────────────┐
│ 1. BootROM (mask ROM, cannot be changed)            │
│    → Looks at boot DIP switches                     │
│    → Loads SPL from flash/SD/UART                   │
├─────────────────────────────────────────────────────┤
│ 2. SPL (Secondary Program Loader, in SPI flash)     │
│    → Initializes DDR RAM                            │
│    → Loads U-Boot + OpenSBI                         │
├─────────────────────────────────────────────────────┤
│ 3. OpenSBI (M-mode firmware)                        │
│    → Sets up M-mode trap handlers                   │
│    → Provides SBI services (timer, IPI, etc.)       │
│    → Jumps to U-Boot in S-mode                      │
├─────────────────────────────────────────────────────┤
│ 4. U-Boot (bootloader, S-mode)                      │
│    → Reads boot.scr or waits for commands           │
│    → Loads kernel from SD/network/USB               │
│    → Jumps to kernel entry point                    │
├─────────────────────────────────────────────────────┤
│ 5. GooseOS (our kernel, S-mode)                     │
│    → a0 = hart ID, a1 = DTB pointer                 │
│    → We're here!                                    │
└─────────────────────────────────────────────────────┘
```

The VisionFive 2 ships with SPL, OpenSBI, and U-Boot pre-installed in SPI flash. We don't need to touch any of that — we just put our kernel on an SD card and tell U-Boot to load it.

> :nerdygoose: The boot DIP switches on the board select where the BootROM looks for SPL: SPI flash (default), SD card, or UART. For normal use, leave them at the factory default (SPI flash boot). SPL then loads U-Boot from SPI flash, and U-Boot loads our kernel from SD.

> :sharpgoose: You might see references to "QSPI flash" and "NOR flash" — on the VisionFive 2, they're the same thing. The SPI NOR flash chip stores SPL + OpenSBI + U-Boot. If you need to update U-Boot, you reflash this chip. But for kernel development, leave it alone.

## Prepare the SD Card

The SD card needs a single FAT32 partition. The kernel binary goes on it.

### Linux

```bash
# Find your SD card (usually /dev/sdX or /dev/mmcblkX)
lsblk

# Create a single FAT32 partition (CAREFUL: this erases the card!)
sudo fdisk /dev/sdX
# Press: g (GPT), n (new partition), Enter (defaults), t (type), 1 (EFI System), w (write)

# Format as FAT32
sudo mkfs.vfat -F 32 /dev/sdX1

# Mount and copy
sudo mount /dev/sdX1 /mnt
sudo cp kernel.bin /mnt/
sudo umount /mnt
```

### Quick Method (if already FAT32)

Most SD cards come pre-formatted as FAT32. Just mount and copy:

```bash
# Build the binary
make kernel-vf2

# Copy to SD card
make flash-sd SD=/media/youruser/boot
# Or manually:
cp kernel.bin /media/youruser/boot/
sync
```

> :happygoose: The `sync` is important — it flushes the write buffer to the card. Without it, ejecting the card might leave a partially-written file. I've had "corrupted kernel" bugs that were just missing `sync`.

## Boot from U-Boot (Manual)

1. Insert the SD card into the VisionFive 2
2. Connect your serial adapter
3. Power on the board
4. Press any key when U-Boot says "Hit any key to stop autoboot"

You'll get the U-Boot prompt:

```
StarFive #
```

Load and run GooseOS:

```
StarFive # fatload mmc 1:1 0x40200000 kernel.bin
9984 bytes read in 12 ms (812.5 KiB/s)

StarFive # go 0x40200000
## Starting application at 0x40200000 ...

          __
       __( o)>     GooseOS v0.1.0
      \  _/        RISC-V 64-bit
       \\\         Written in Rust
        \\\        Platform: VisionFive 2 (JH7110)
         \   )_    Honk.
      ~~~^~~~~

  Booted on hart 1
  DTB address:   0x46000000
  ...
```

> :weightliftinggoose: That moment when "Booted on hart 1" and "Platform: VisionFive 2" appear on your serial console — that's YOUR code running on real RISC-V silicon. No Linux, no runtime, no OS underneath. Just your Rust, bare metal. Savor it.

### U-Boot Command Breakdown

| Command | What It Does |
|---------|-------------|
| `fatload mmc 1:1 0x40200000 kernel.bin` | Load `kernel.bin` from SD card (MMC device 1, partition 1) into RAM at `0x40200000` |
| `go 0x40200000` | Jump to the address and start executing |

> :sharpgoose: `mmc 1:1` — the first `1` is the MMC device number (SD card slot), the second `1` is the partition number. On some VF2 firmware versions, the SD card is `mmc 0` instead. If `fatload mmc 1:1` fails with "device not found", try `mmc 0:1`. You can check with `mmc list`.

> :angrygoose: The load address `0x40200000` MUST match your linker script's `ORIGIN`. If you load to `0x40200000` but linked at `0x80200000` (the QEMU address), every absolute address in the binary is wrong. The kernel will crash immediately — or worse, silently corrupt memory. Always double-check: linker script origin = U-Boot load address.

## Auto-Boot with boot.scr

Typing U-Boot commands every reboot gets old fast. Create a boot script:

### Create the Script

```bash
# Create a plain text boot script
cat > boot.cmd << 'EOF'
echo "Loading GooseOS..."
fatload mmc 1:1 0x40200000 kernel.bin
echo "Starting GooseOS at 0x40200000"
go 0x40200000
EOF

# Compile it into U-Boot's script format
mkimage -A riscv -T script -C none -d boot.cmd boot.scr
```

### Install mkimage

```bash
# Ubuntu/Debian
sudo apt install u-boot-tools

# Arch
sudo pacman -S uboot-tools

# macOS
brew install u-boot-tools
```

### Deploy

Copy both files to the SD card:

```bash
cp kernel.bin boot.scr /media/youruser/boot/
sync
```

Now when the VisionFive 2 boots, U-Boot automatically finds `boot.scr` on the FAT32 partition and executes it. No manual intervention needed.

> :happygoose: Pro tip for rapid development: keep the serial console open, swap the SD card to your PC, run `make flash-sd SD=/media/boot`, swap back, and reset the board. Total cycle time: ~15 seconds. Almost as fast as QEMU.

## Troubleshooting

### "No output on serial console"

- **Check wiring**: TX↔RX crossed? Ground connected?
- **Check baud rate**: Must be 115200
- **Check adapter voltage**: Must be 3.3V TTL, not RS-232
- **Check power supply**: Underpowered supply can cause silent boot failures

### "U-Boot starts but fatload fails"

- **Check MMC device number**: Try `mmc list` to see available devices
- **Check partition**: `fatls mmc 1:1` should show `kernel.bin`
- **Check SD card format**: Must be FAT32 (not exFAT, not ext4)

### "Kernel loads but no GooseOS output"

- **Check linker script**: `linker-vf2.ld` must be used, not `linker.ld`
- **Check load address**: Must match `ORIGIN` in `linker-vf2.ld` (`0x40200000`)
- **Check build features**: Must be `--features vf2 --no-default-features`
- **Verify binary**: `hexdump -C kernel.bin | head` — first bytes should be RISC-V instructions, not ELF header (`7f 45 4c 46`)

### "Kernel crashes immediately (garbage on serial)"

- **UART stride**: VF2 uses stride=4. If you accidentally build with QEMU defaults (stride=1), every register write goes to the wrong address
- **Boot hart**: VF2 boots on hart 1. If your code expects hart 0, the boot hart gets parked and a non-boot hart tries to run the kernel

> :sarcasticgoose: "It works on QEMU" is the embedded developer's "it works on my machine." The jump from emulator to real hardware always surfaces assumptions you didn't know you made. That's the point — it makes you a better systems programmer.

## The Full Development Workflow

```
┌─────────────────────────────────────────────┐
│  1. Write code                              │
│  2. make test          (QEMU, 5s smoke test)│
│  3. make kernel-vf2    (build VF2 binary)   │
│  4. make flash-sd SD=/media/boot            │
│  5. Reset VisionFive 2, watch serial output │
│  6. Repeat                                  │
└─────────────────────────────────────────────┘
```

Develop on QEMU for fast iteration. Test on VF2 when you add platform-specific code or before each "part" milestone.

## What We Achieved

- GooseOS runs on **real RISC-V hardware** — not just an emulator
- Same source tree, two platforms, compile-time selection
- Full boot chain: BootROM → SPL → OpenSBI → U-Boot → GooseOS
- < 10KB kernel binary, boots in milliseconds

> :happygoose: We started with an empty directory and "hello world" on an emulator. Now we have interrupt-driven I/O, timer ticks, and a kernel running on actual silicon. And the architecture is clean enough that adding a third platform would take an afternoon. This is what good systems engineering looks like.

## What's Next: The Microkernel Path

With real hardware working, we're ready for the big architectural leap: **virtual memory**. Page tables are the foundation for everything ahead — process isolation, userspace drivers, and the microkernel architecture we're building toward:

| Part | Topic | What It Enables |
|------|-------|-----------------|
| **Part 5** | Sv39 page tables + virtual memory | U-mode / S-mode separation |
| Part 6 | First userspace process | Process abstraction + context switching |
| Part 7 | IPC message passing | The heart of the microkernel |
| Part 8 | UART server in userspace | First real microkernel service |
| Part 9+ | Block device, filesystem, network | Composable services — load only what you need |

> :nerdygoose: A microkernel keeps the kernel tiny — just IPC, memory management, and scheduling. Everything else (drivers, filesystem, network stack) runs as userspace services that communicate via message passing. A driver crash doesn't take down the kernel. You compose your OS from services like building blocks — only include what you actually need. Perfect for embedded and security-critical systems.

## Branch

```bash
git checkout part-4   # see the code at this point
```
