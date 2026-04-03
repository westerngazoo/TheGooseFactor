---
sidebar_position: 4
sidebar_label: "U-Boot Reference"
title: "Appendix: U-Boot Command Reference"
---

# Appendix: U-Boot Command Reference

U-Boot is the bootloader that sits between OpenSBI and your kernel on the VisionFive 2. It loads binaries from storage (SD card, SPI flash, network, USB) into RAM and jumps to them. Think of it as GRUB for embedded systems — except you interact with it over a serial console instead of a graphical menu.

## Getting to the U-Boot Prompt

Power on (or reboot) the VisionFive 2 and watch the serial console. You'll see OpenSBI output followed by:

```
Hit any key to stop autoboot:  2
```

Press any key within the countdown. You'll get the prompt:

```
StarFive #
```

If you miss it, U-Boot runs `bootcmd` automatically — which, if you've configured it for GooseOS, jumps straight to your kernel. To get back to the prompt, you'll need to power cycle and be faster.

> :angrygoose: The autoboot window is 2 seconds by default. On a serial console at 115200 baud, you have to be watching and ready. If you're also SSHing into the board or switching terminal windows, you WILL miss it. You can increase the timeout with `setenv bootdelay 5; saveenv` — gives you 5 seconds instead.

## Essential Commands

### Loading Files

| Command | Description |
|---------|-------------|
| `fatload mmc <dev>:<part> <addr> <file>` | Load file from FAT32 partition into RAM |
| `ext4load mmc <dev>:<part> <addr> <file>` | Load file from ext4 partition into RAM |
| `fatls mmc <dev>:<part>` | List files on a FAT32 partition |
| `ext4ls mmc <dev>:<part>` | List files on an ext4 partition |
| `mmc list` | Show available MMC devices |
| `mmc part` | Show partition table of current MMC device |
| `mmc dev <n>` | Select MMC device number |

**Examples:**

```bash
# Load kernel.bin from SD card partition 3 (FAT32) to RAM at 0x40200000
fatload mmc 1:3 0x40200000 kernel.bin

# List files on SD card partition 3
fatls mmc 1:3

# Load from partition 1 instead (your layout may differ)
fatload mmc 1:1 0x40200000 kernel.bin
```

> :sharpgoose: `mmc 1:3` means MMC device 1, partition 3. On the VisionFive 2, device 0 is typically the eMMC (if present) and device 1 is the SD card slot. Use `mmc list` if you're not sure. The partition number depends on your SD card layout — `mmc part` shows you.

### Executing Code

| Command | Description |
|---------|-------------|
| `go <addr>` | Jump to address and start executing (no return) |
| `bootm <addr>` | Boot a uImage (with header) at address |
| `booti <addr> - <fdtaddr>` | Boot a Linux Image at address with device tree |
| `boot` | Run the `bootcmd` environment variable |
| `run <var>` | Execute commands stored in an environment variable |

**Examples:**

```bash
# Jump to GooseOS at 0x40200000
go 0x40200000

# Run the default distro boot sequence (boots Debian)
run bootcmd_distro
```

> :angrygoose: `go` is a raw jump. It doesn't set up anything — no device tree pointer, no kernel arguments. Our kernel gets `a0` (hart ID) and `a1` (DTB address) because OpenSBI set them up before U-Boot ran, and `go` doesn't clear them. This works because U-Boot runs in S-mode and doesn't touch `a0`/`a1` during `go`. But don't rely on this — it's an implementation detail, not a guarantee.

### Environment Variables

| Command | Description |
|---------|-------------|
| `printenv` | Show all environment variables |
| `printenv <var>` | Show one variable |
| `setenv <var> <value>` | Set a variable (in memory) |
| `saveenv` | Save all variables to persistent storage |
| `env default -a` | Reset ALL variables to factory defaults |

**Examples:**

```bash
# Set GooseOS as the default boot command
setenv bootcmd 'fatload mmc 1:3 0x40200000 kernel.bin; go 0x40200000'
saveenv

# Set device tree file for Debian boot
setenv fdtfile starfive/jh7110-visionfive-v2.dtb
saveenv

# Increase autoboot timeout to 5 seconds
setenv bootdelay 5
saveenv
```

> :angrygoose: `env default -a` is the nuclear option. It wipes EVERYTHING — your bootcmd, fdtfile, network settings, all of it. If you run this and saveenv, you'll need to manually reconstruct every environment variable. I've done this. It took 30 minutes of trial and error to get Debian booting again. Don't run it unless you really mean it.

> :sharpgoose: `setenv` only changes the variable in RAM. It's gone on next boot unless you `saveenv`. This is actually a safety feature — if you `setenv bootcmd` to something that crashes, just power cycle and the old bootcmd is back. Only `saveenv` when you're sure the new config works.

### Memory Commands

| Command | Description |
|---------|-------------|
| `md <addr> <count>` | Memory display — show hex dump at address |
| `mm <addr>` | Memory modify — interactive hex editor |
| `mw <addr> <value> <count>` | Memory write — fill region with value |
| `cp <src> <dst> <count>` | Copy memory region |

**Examples:**

```bash
# Inspect first 16 words of loaded kernel
md 0x40200000 10

# Verify kernel was loaded (look for RISC-V instructions, not zeros)
md 0x40200000 4
```

### SPI Flash Commands

| Command | Description |
|---------|-------------|
| `sf probe` | Initialize SPI flash |
| `sf read <addr> <offset> <len>` | Read flash into RAM |
| `sf write <addr> <offset> <len>` | Write RAM to flash |
| `sf erase <offset> <len>` | Erase flash region |

> :angrygoose: DO NOT use these unless you know exactly what you're doing. Writing the wrong data to SPI flash can brick the boot chain. The VisionFive 2's SPI flash holds SPL, OpenSBI, and U-Boot — corrupt any of these and the board won't boot from SPI anymore. You'll need UART boot recovery (if it works) or another board to reflash.

### Information Commands

| Command | Description |
|---------|-------------|
| `bdinfo` | Board info — RAM size, relocation address, etc. |
| `version` | U-Boot version string |
| `help` | List all available commands |
| `help <cmd>` | Help for a specific command |

## VisionFive 2 Memory Map (U-Boot Perspective)

When U-Boot is running, this is how memory is laid out:

```
Address             Content
──────────────────────────────────────────
0x0000_0000         I/O peripherals (UART, SPI, etc.)
0x0C00_0000         PLIC (interrupt controller)
0x1000_0000         UART0 (serial console)
                    ...
0x4000_0000         DRAM base (2/4/8 GB depending on model)
   ├─ 0x4000_0000   OpenSBI firmware (first ~2MB, reserved)
   ├─ 0x4020_0000   Kernel load address (DRAM + 2MB)
   ├─ 0x4200_0000   Safe scratch area for U-Boot loads
   └─ ...           Available RAM
0x4000_0000 + RAM   DRAM end
```

**Important addresses for GooseOS:**

| Address | What Lives Here |
|---------|----------------|
| `0x4000_0000` | DRAM base. Do NOT load here — it's OpenSBI territory |
| `0x4020_0000` | Kernel entry. This is where `fatload` should put `kernel.bin` |
| `0x4200_0000` | Safe scratch area (used for loading DTBs, temporary data) |
| `0x4600_0000` | Device tree blob (set by U-Boot/OpenSBI, passed in `a1`) |

> :nerdygoose: The `0x4020_0000` convention comes from OpenSBI. When OpenSBI builds as a "payload" configuration, it places the payload (kernel) at DRAM base + 2MB. OpenSBI itself occupies the first 2MB at `0x4000_0000`. Your linker script's `ORIGIN` must match this address, and U-Boot's `fatload` must load to this address. If they disagree, your kernel's absolute addresses (stack, BSS, globals) point to the wrong locations.

> :angrygoose: On QEMU, DRAM base is `0x8000_0000`. On VisionFive 2, it's `0x4000_0000`. If you accidentally load a QEMU-linked kernel on the VF2 (or vice versa), every absolute address is off by `0x40000000`. The kernel might partially work (PC-relative code doesn't care about base address) but will crash as soon as it accesses a global variable. The build system prevents this — `--features vf2` selects `linker-vf2.ld` which sets the correct origin.

## Common VisionFive 2 Boot Configurations

### GooseOS Auto-Boot

```bash
setenv bootcmd 'fatload mmc 1:3 0x40200000 kernel.bin; go 0x40200000'
saveenv
```

### Debian Auto-Boot (Factory Default)

```bash
setenv bootcmd 'run bootcmd_distro'
setenv fdtfile starfive/jh7110-visionfive-v2.dtb
saveenv
```

### Dual Use (GooseOS by Default, Debian on Demand)

```bash
# GooseOS boots automatically
setenv bootcmd 'fatload mmc 1:3 0x40200000 kernel.bin; go 0x40200000'
saveenv

# To boot Debian, catch autoboot and type:
run bootcmd_distro
```

This is the recommended setup for GooseOS development. GooseOS boots instantly on power-up. When you need Debian (to `goose go`), catch autoboot and run the distro boot.

## DIP Switches

The VisionFive 2 has two boot mode DIP switches (RGPIO_0 and RGPIO_1):

| SW1 (RGPIO_0) | SW2 (RGPIO_1) | Boot Source |
|:-:|:-:|---|
| ON | OFF | **SD card** — SPL loads from SD card |
| ON | ON | SPI flash — SPL loads from QSPI NOR |
| OFF | OFF | UART — Recovery mode (SPL via serial) |
| OFF | ON | Reserved |

For GooseOS development: **SW1 ON, SW2 OFF** (SD card boot). Leave them here permanently.

> :sarcasticgoose: Changing DIP switches requires tweezers, good lighting, and the patience of a saint. The switches are tiny, recessed, and on the bottom of the board. Every time you change them, you risk fumbling and bending something. Pick one configuration (SD card boot) and never touch them again. Your blood pressure will thank you.

## Troubleshooting

### "Unknown command" on Paste

U-Boot's serial console doesn't handle paste well. If you paste a command and get "Unknown command", the paste inserted invisible characters (carriage returns, escape sequences, or extra whitespace). Solutions:

1. **Type commands manually** — tedious but reliable
2. **Set up `bootcmd` + `saveenv`** — type once, never again
3. **Use a boot script** (`boot.scr`) — U-Boot reads it from the SD card automatically

### "would overwrite reserved memory"

U-Boot refuses to load data to certain addresses (typically the DRAM base region where firmware lives). Use `0x4200_0000` or higher for scratch loads.

### "Device not found"

SD card not detected. Check:
- Card is inserted fully
- Card is FAT32 formatted (not exFAT)
- Try `mmc list` to see available devices
- Try `mmc dev 0` or `mmc dev 1` to switch devices

### "Can't read file"

The file doesn't exist on the partition. Check:
- `fatls mmc 1:3` to verify the file is there
- Filename is case-sensitive
- You're looking at the right partition (try `fatls mmc 1:1`, `fatls mmc 1:2`, etc.)
