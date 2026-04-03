---
sidebar_position: 4
sidebar_label: "Ch 13: Development Workflow"
title: "Chapter 13: A Real Development Workflow"
---

# Chapter 13: A Real Development Workflow

Booting GooseOS once on the VisionFive 2 by typing U-Boot commands is cool. Doing it for the 30th time while debugging UART is not. This chapter builds a complete development workflow — from code change to running on hardware — that's fast, repeatable, and doesn't involve typing memory addresses into a serial console by hand.

## The Pain

Here's what bare-metal development on a VisionFive 2 looks like *without* a workflow:

1. Edit code on your PC
2. Build with `make kernel-vf2`
3. Eject SD card from VF2
4. Insert SD card into PC
5. Copy `kernel.bin` to SD card
6. `sync` (don't forget or you get a corrupted binary!)
7. Eject SD card from PC
8. Insert SD card into VF2
9. Power cycle the board
10. Catch U-Boot autoboot (press a key in the 2-second window)
11. Type `fatload mmc 1:3 0x40200000 kernel.bin` (from memory, no typos!)
12. Type `go 0x40200000`
13. Read output, find the bug
14. Repeat from step 1

That's a 3-5 minute cycle. Do it 20 times a day and you've burned an hour just on mechanics. Worse, it's error-prone — one mistyped address and your kernel loads to the wrong place, crashing silently.

> :angrygoose: I am not exaggerating about the typo risk. U-Boot's `go` command jumps to an address and *starts executing whatever is there*. Type `0x40200000` as `0x42000000` and you're executing random DRAM contents as RISC-V instructions. The board hangs, you power cycle, you wonder what went wrong. It wasn't your code — it was your typing.

> :sarcasticgoose: "But I can paste from a text file!" Sure — if your terminal emulator doesn't mangle the paste. TeraTerm and PuTTY love inserting invisible characters, swallowing digits, or splitting lines on paste. We tried. U-Boot replied "Unknown command" to commands that looked correct on screen. Manually typing 50-character hex addresses through a serial console that adds phantom characters is not a workflow — it's an exercise in anger management.

## Step 1: Auto-Boot GooseOS from U-Boot

The first fix: never type U-Boot commands again. U-Boot's environment variables persist in SPI flash (or on some boards, in a FAT partition). Set them once and every boot automatically loads GooseOS:

```
StarFive # setenv bootcmd 'fatload mmc 1:3 0x40200000 kernel.bin; go 0x40200000'
StarFive # saveenv
Saving Environment to nowhere... done
```

Now every power cycle goes straight to GooseOS. No typing, no timing, no typos.

> :sharpgoose: `mmc 1:3` — device 1, partition 3. On the VisionFive 2's stock Debian SD card, partition 3 is the EFI System Partition (FAT32) where we store `kernel.bin`. Your partition layout might differ — use `mmc part` to check. If you're using a dedicated GooseOS SD card with a single FAT32 partition, it's `mmc 1:1`.

### Getting Back to Debian

"But I need Debian to update the kernel!" Yes. When you need Debian, catch U-Boot's autoboot (press a key during the 2-second countdown) and run:

```
StarFive # run bootcmd_distro
```

This runs U-Boot's default Linux boot sequence — it finds Debian's boot.scr or extlinux.conf and boots the full OS.

> :surprisedgoose: `bootcmd_distro` is a U-Boot environment variable that contains the entire distro boot sequence — scanning for boot scripts on MMC, USB, SCSI, network. It's set by U-Boot's distro boot framework and survives `saveenv`. You don't need to remember the Debian boot commands — just `run bootcmd_distro`.

### The Debian DTB Gotcha

If U-Boot complains about missing device tree files when booting Debian, check `fdtfile`:

```
StarFive # printenv fdtfile
fdtfile=starfive/jh7110-visionfive-v2.dtb
```

Some firmware versions set this wrong (e.g., `starfive_visionfive2.dtb` without the subdirectory). Fix it:

```
StarFive # setenv fdtfile starfive/jh7110-visionfive-v2.dtb
StarFive # saveenv
```

> :angrygoose: Getting this wrong means Debian boots without a device tree, which means no drivers, which means the kernel panics with a cryptic message about not finding the root filesystem. Or worse — it hangs silently. If Debian was booting fine and then stopped after you touched U-Boot environment variables, check `fdtfile` first.

## Step 2: Git-Based Deployment

SD card swapping is medieval. The VisionFive 2 runs Debian Linux with network access. We can `git push` from the development PC and `git pull` on the VF2.

### On the VF2 (one-time setup)

```bash
# Set up DNS (stock Debian image might not have it)
echo "nameserver 8.8.8.8" > /etc/resolv.conf

# Clone the repo to a persistent location
cd /root
git clone https://github.com/youruser/goose-os.git
```

> :angrygoose: Do NOT clone to `/tmp`. On the VisionFive 2's Debian image, `/tmp` is a tmpfs — it's wiped on every reboot. You'll clone, test, reboot, and find an empty directory. Clone to `/root` or `/home`.

### The Deploy Target

The Makefile's `deploy` target does everything in one command:

```makefile
# Auto-incrementing build number
BUILD_FILE := .build_number
BUILD_NUM := $(shell cat $(BUILD_FILE) 2>/dev/null || echo 0)
NEXT_BUILD := $(shell echo $$(($(BUILD_NUM) + 1)))

deploy: kernel-vf2
    git add kernel.bin src/ Makefile Cargo.toml linker.ld linker-vf2.ld \
            .build_number goose-upgrade.sh
    git commit -m "Build $(NEXT_BUILD)" --allow-empty || true
    git push
```

`make deploy` builds the VF2 binary, bumps the build number, commits everything, and pushes. One command, ~5 seconds.

## Step 3: Build Numbers

When you're iterating fast — build, deploy, test, repeat — you need to know *which build is actually running*. Is this the kernel with the MCR fix or the one before it? Did the latest push actually land?

An auto-incrementing build number solves this. The `.build_number` file holds a single integer. The Makefile increments it on every build and passes it to Rust via an environment variable:

```makefile
build-vf2:
    @echo $(NEXT_BUILD) > $(BUILD_FILE)
    GOOSE_BUILD=$(NEXT_BUILD) RUSTFLAGS="-C link-arg=-Tlinker-vf2.ld" \
      cargo build --release --features vf2 --no-default-features
```

In Rust, we read it at compile time:

```rust
println!("GooseOS v0.1.0 build {}",
    option_env!("GOOSE_BUILD").unwrap_or("dev"));
```

`option_env!` returns `Some("9")` when built with `GOOSE_BUILD=9`, or `None` when built without it (falling back to `"dev"`). Local QEMU builds show "build dev". Deployed VF2 builds show "build 9".

Now when the goose banner says "build 9", you *know* it's build 9.

> :happygoose: This sounds trivial. It isn't. When your board boots and shows "build 7" but you expected build 9, you instantly know the deploy didn't land — maybe `git pull` failed, maybe the SD card is cached, maybe you forgot to copy `kernel.bin` to `/boot`. Without build numbers, you'd be debugging phantom bugs in code that isn't actually running.

## Step 4: The `goose` Command

On the VF2, the full update cycle is:

```bash
cd /root/goose-os && git pull && cp kernel.bin /boot/ && reboot
```

That's a lot to type (or remember) every time. We wrap it in a shell function that lives in `.bashrc`:

```bash
#!/bin/bash
# goose-upgrade.sh — source from .bashrc

GOOSE_DIR="/root/goose-os"

goose() {
    case "${1:-help}" in
        upgrade|up)
            echo "=== GooseOS Upgrade ==="
            cd "$GOOSE_DIR" || { echo "ERROR: $GOOSE_DIR not found"; return 1; }
            echo "Pulling latest..."
            git pull || { echo "ERROR: git pull failed"; return 1; }
            local build=$(cat .build_number 2>/dev/null || echo "?")
            echo "Copying kernel.bin (build $build) to /boot/..."
            cp kernel.bin /boot/kernel.bin || { echo "ERROR: cp failed"; return 1; }
            echo ""
            echo "  Build $build ready in /boot/kernel.bin"
            echo "  Run 'goose reboot' to boot into it"
            echo ""
            ;;
        go)
            goose upgrade && goose reboot
            ;;
        reboot|rb)
            echo "Rebooting into GooseOS..."
            sleep 1
            reboot
            ;;
        status|st)
            cd "$GOOSE_DIR" 2>/dev/null || { echo "ERROR: $GOOSE_DIR not found"; return 1; }
            local build=$(cat .build_number 2>/dev/null || echo "?")
            echo "GooseOS build: $build"
            echo "Repo: $GOOSE_DIR"
            git log --oneline -5
            echo ""
            ls -lh /boot/kernel.bin 2>/dev/null || echo "/boot/kernel.bin not found"
            ;;
        *)
            echo "Usage: goose <command>"
            echo ""
            echo "  upgrade (up)   Pull latest kernel and copy to /boot"
            echo "  go             Upgrade + reboot in one shot"
            echo "  reboot  (rb)   Reboot into GooseOS now"
            echo "  status  (st)   Show current build info"
            ;;
    esac
}
```

### One-time setup on VF2

```bash
cd /root/goose-os && git pull
echo 'source /root/goose-os/goose-upgrade.sh' >> /root/.bashrc
source /root/.bashrc
```

Now the full deploy cycle from Debian is one command:

```bash
goose go    # pulls latest, copies to /boot, reboots
```

## Step 5: Reboot from GooseOS (SBI System Reset)

The VisionFive 2 doesn't have a reset button. Without software reboot, the cycle is:

1. Unplug USB-C power cable
2. Wait a second
3. Plug it back in
4. Wait for boot (5-8 seconds of SPL + OpenSBI + U-Boot)

This is slow and wears out the USB-C connector. The SBI (Supervisor Binary Interface) provides a System Reset extension that lets S-mode software trigger a clean reboot:

```rust
/// SBI System Reset extension (SRST)
///   EID = 0x53525354 ("SRST")
///   FID = 0
///   a0  = reset_type  (0=shutdown, 1=cold reboot, 2=warm reboot)
///   a1  = reset_reason (0=no reason, 1=system failure)
fn sbi_system_reset() -> ! {
    unsafe {
        asm!(
            "ecall",
            in("a0") 1usize,          // cold reboot
            in("a1") 0usize,          // no reason
            in("a6") 0usize,          // FID = 0
            in("a7") 0x53525354usize, // EID = SRST
            options(noreturn)
        );
    }
}
```

The `ecall` traps into OpenSBI (M-mode), which resets the entire SoC. It's equivalent to a power cycle but without touching the cable.

We wire it to **Ctrl-R** (byte `0x12`) in the idle loop:

```rust
loop {
    if let Some(c) = uart.getc() {
        match c {
            0x12 => {                              // Ctrl-R
                println!("\n  Rebooting...");
                sbi_system_reset();
            }
            b'\r' | b'\n' => { uart.putc(b'\r'); uart.putc(b'\n'); }
            0x7F | 0x08  => { uart.putc(0x08); uart.putc(b' '); uart.putc(0x08); }
            _            => uart.putc(c),
        }
    }
}
```

Now from GooseOS, press Ctrl-R → the board reboots → U-Boot auto-boots GooseOS again. Full cycle without touching the hardware.

> :nerdygoose: The SBI SRST extension was introduced in SBI v0.3. OpenSBI on the VisionFive 2 supports it because the JH7110 has the `sifive_test` reset device (or equivalent). The `ecall` convention is the same as all SBI calls: extension ID in `a7`, function ID in `a6`, arguments in `a0`-`a5`. Return values (if any) come back in `a0`/`a1`, but for reset there's no return — the CPU is gone.

> :surprisedgoose: `0x53525354` in ASCII is "SRST" — System Reset. The SBI spec encodes all extension IDs as readable ASCII strings. Timer is 0x54494D45 ("TIME"), IPI is 0x735049 ("sPI"), HSM is 0x48534D ("HSM"). Makes hex dumps much more readable.

## The Complete Cycle

Here's what development looks like now:

```
┌─── Development PC ────────────────────────────┐
│                                                │
│  1. Edit code (any editor)                     │
│  2. make deploy     (~5 seconds)               │
│     → builds VF2 binary                        │
│     → bumps build number                       │
│     → git commit + push                        │
│                                                │
└────────────────────┬───────────────────────────┘
                     │ git push
                     ▼
              ┌─── GitHub ───┐
                     │
                     │ git pull
                     ▼
┌─── VisionFive 2 ──────────────────────────────┐
│                                                │
│  If in GooseOS:                                │
│    3. Ctrl-R → reboots to U-Boot               │
│    4. Catch autoboot → run bootcmd_distro      │
│                                                │
│  In Debian:                                    │
│    5. goose go    (~3 seconds)                  │
│       → git pull                               │
│       → cp kernel.bin /boot/                   │
│       → reboot                                 │
│                                                │
│  6. GooseOS boots with new build number        │
│  7. Test, repeat from step 1                   │
│                                                │
└────────────────────────────────────────────────┘
```

Total cycle time: **under 30 seconds** from code change to seeing it run on silicon. Compare that to the 3-5 minutes of SD card swapping.

> :happygoose: Thirty seconds. That's the target for any embedded development workflow. If your iteration cycle is longer than a minute, you'll avoid testing on hardware and bugs will pile up. Make the feedback loop fast and you'll test constantly.

## Summary of Tools

| Tool | Purpose | Where |
|------|---------|-------|
| `make deploy` | Build + bump build + git push | Dev PC |
| `make run` | Build + run on QEMU | Dev PC |
| `goose go` | Pull + install + reboot | VF2 (Debian) |
| `goose status` | Show current build info | VF2 (Debian) |
| **Ctrl-R** | Software reboot via SBI | VF2 (GooseOS) |
| `run bootcmd_distro` | Boot Debian from U-Boot | VF2 (U-Boot) |

## What's in the Repo

```
goose-os/
├── .build_number         # Auto-incrementing build counter
├── goose-upgrade.sh      # VF2 upgrade script (sourced in .bashrc)
├── kernel.bin            # Pre-built VF2 binary (committed for deploy)
├── Makefile              # build, run, deploy, kernel-vf2, flash-sd
├── Cargo.toml            # Features: qemu (default), vf2
├── linker.ld             # QEMU memory layout
├── linker-vf2.ld         # VF2 memory layout
└── src/
    ├── main.rs           # Kernel entry, SBI reset, idle loop
    ├── uart.rs           # NS16550A/DW8250 driver
    ├── platform.rs       # cfg-gated constants
    ├── plic.rs           # Interrupt controller
    ├── trap.rs           # Trap vector + handlers
    ├── console.rs        # println! macro
    └── boot.S            # RISC-V boot assembly
```

> :weightliftinggoose: Commit `kernel.bin` to the repo. Yes, it's a binary. Yes, git purists will cringe. But the VF2 has ancient Debian with no Rust toolchain — it can't build the kernel locally. The binary *is* the deployable artifact. This is exactly how embedded firmware repos work in industry: the built binary ships alongside the source.

## Lessons

1. **Automate everything you do more than twice.** U-Boot commands, deploy steps, SD card copies — if you're typing it repeatedly, script it.

2. **Build numbers are free insurance.** One `option_env!` call saves hours of "is this the right binary?" debugging.

3. **SBI is your friend.** The Supervisor Binary Interface gives you power management, IPI, timer, and system reset — all through a clean `ecall` interface. Use it.

4. **The workflow IS the product.** A clean development workflow isn't a luxury — it's the difference between shipping and giving up. If iterating is painful, you'll stop iterating.

> :sarcasticgoose: "Real kernel developers use JTAG!" Sure. Go buy a $200 JTAG probe, figure out the JH7110's debug port pinout (it's not on the standard GPIO header), install OpenOCD with the right config, and spend a week getting GDB to talk to it. Or spend 20 minutes setting up `git push` + `goose go`. Your call.
