---
sidebar_position: 5
sidebar_label: "QEMU Reference"
title: "Appendix: QEMU for RISC-V Development"
---

# Appendix: QEMU for RISC-V Development

QEMU is the development backbone of GooseOS. You write code on your x86 host, compile a RISC-V ELF binary, and QEMU emulates the hardware — UART, PLIC, CLINT, MMU, the entire SV39 page walk — without touching real silicon. When it works in QEMU, moving to the VisionFive 2 is usually a matter of platform-specific initialization, not logic bugs.

> :nerdygoose: QEMU is not a simulator — it's an emulator. A simulator models cycle-by-cycle behavior (like Spike). QEMU uses dynamic binary translation: it compiles RISC-V instructions into host-native code at runtime. This makes it fast enough to be your primary development target but means cycle counts and timing are not accurate. Don't benchmark in QEMU.

## Installing QEMU

### From Package Manager

```bash
# Ubuntu/Debian
sudo apt install qemu-system-riscv64

# Fedora
sudo dnf install qemu-system-riscv

# Arch
sudo pacman -S qemu-system-riscv

# macOS (Homebrew)
brew install qemu
```

Check the version — you want 7.0+ for full RISC-V support:

```bash
qemu-system-riscv64 --version
```

### Building from Source

If your distro ships an old version or you need a specific feature (like the `virt` machine with 16550A UART fixes):

```bash
git clone https://gitlab.com/qemu-project/qemu.git
cd qemu
git checkout v9.2.0  # or latest stable
./configure --target-list=riscv64-softmmu,riscv32-softmmu
make -j$(nproc)
sudo make install
```

> :angrygoose: If `./configure` complains about missing dependencies, install `libglib2.0-dev`, `libpixman-1-dev`, `ninja-build`, and `python3-venv`. The error messages are vague — these four cover 90% of cases.

## The `virt` Machine

GooseOS targets the `qemu-system-riscv64 -machine virt` platform. This is a virtual board designed specifically for OS development — it doesn't model any real hardware, but it provides clean, well-documented peripherals.

### Memory Map

| Address Range | Device | Notes |
|---|---|---|
| `0x0000_0000` – `0x0000_0FFF` | Debug/Test device | Write to exit QEMU |
| `0x0200_0000` – `0x0200_FFFF` | CLINT | Core-local interruptor (timer + software IRQs) |
| `0x0C00_0000` – `0x0FFF_FFFF` | PLIC | Platform-level interrupt controller |
| `0x1000_0000` – `0x1000_0FFF` | UART0 (16550A) | Serial console |
| `0x1000_1000` – `0x1000_1FFF` | Virtio block | `virtio-blk-device` |
| `0x1000_2000` – `0x1000_2FFF` | Virtio net | `virtio-net-device` |
| `0x8000_0000` – ... | DRAM | Size set by `-m` flag |

> :mathgoose: The memory map is the contract between your OS and the hardware. Every device driver starts with a base address from this table. The `virt` machine's device tree (DTB) describes these at runtime, but for bare-metal development you'll hardcode them. They're stable across QEMU versions — that's the whole point of the `virt` machine.

### Device Tree

QEMU generates a device tree blob (DTB) and passes it to your kernel in register `a1` at boot. To dump it:

```bash
qemu-system-riscv64 -machine virt,dumpdtb=virt.dtb -nographic
dtc -I dtb -O dts virt.dtb > virt.dts
```

Read `virt.dts` to discover every device, its address, its interrupt number, and its `compatible` string. This is the source of truth.

## Essential Commands

### Basic Boot

The minimal command to boot a bare-metal kernel:

```bash
qemu-system-riscv64 \
  -machine virt \
  -cpu rv64 \
  -m 128M \
  -nographic \
  -bios none \
  -kernel your-kernel.elf
```

| Flag | What it does |
|---|---|
| `-machine virt` | Use the virtual RISC-V board |
| `-cpu rv64` | Generic RV64GC CPU (default for `virt`) |
| `-m 128M` | 128 MB of DRAM starting at `0x8000_0000` |
| `-nographic` | No GUI window — UART goes to terminal stdin/stdout |
| `-bios none` | Skip OpenSBI — jump straight to your kernel at `0x8000_0000` |
| `-kernel your-kernel.elf` | Load this ELF into memory at its link address |

> :happygoose: `-bios none` means QEMU loads your ELF directly at `0x8000_0000` in M-mode. No OpenSBI, no bootloader, no firmware. You own the entire machine from the first instruction. This is what we use in Part 1 of the book. Later, when we need SBI calls (timers, inter-hart communication), we add OpenSBI back.

### With OpenSBI

```bash
qemu-system-riscv64 \
  -machine virt \
  -m 128M \
  -nographic \
  -bios default \
  -kernel your-kernel.elf
```

`-bios default` loads QEMU's built-in OpenSBI firmware. It initializes M-mode, sets up the SBI interface, then jumps to your kernel in S-mode at `0x8020_0000`.

**With a custom OpenSBI build:**

```bash
qemu-system-riscv64 \
  -machine virt \
  -m 128M \
  -nographic \
  -bios opensbi-riscv64-generic-fw_jump.bin \
  -kernel your-kernel.elf
```

### Multiple Harts

```bash
qemu-system-riscv64 \
  -machine virt \
  -smp 4 \
  -m 256M \
  -nographic \
  -bios none \
  -kernel your-kernel.elf
```

`-smp 4` gives you 4 harts (hardware threads). Hart 0 is the boot hart. The others spin in a wait loop until your kernel wakes them via IPI (inter-processor interrupt through the CLINT).

> :nerdygoose: RISC-V uses "hart" instead of "core" because the spec distinguishes hardware threads from physical cores. On real hardware (like the JH7110), 4 harts may map to 4 cores. In QEMU, the distinction doesn't matter — each hart is an independent execution context with its own registers, CSRs, and privilege state.

### Block Device (Disk)

```bash
# Create a 64MB disk image
qemu-img create -f raw disk.img 64M

# Boot with it
qemu-system-riscv64 \
  -machine virt \
  -m 128M \
  -nographic \
  -bios none \
  -kernel your-kernel.elf \
  -drive file=disk.img,format=raw,id=hd0 \
  -device virtio-blk-device,drive=hd0
```

The disk appears as a virtio block device at `0x1000_1000`. Your kernel needs a virtio driver to read/write it.

### Networking

```bash
qemu-system-riscv64 \
  -machine virt \
  -m 128M \
  -nographic \
  -bios none \
  -kernel your-kernel.elf \
  -device virtio-net-device,netdev=net0 \
  -netdev user,id=net0,hostfwd=tcp::2222-:22
```

This creates a virtual NIC with user-mode networking. Port 2222 on the host forwards to port 22 in the guest. Useful when your OS has a TCP stack.

## Debugging with GDB

This is the killer feature for OS development. QEMU has a built-in GDB stub.

### Start QEMU in Debug Mode

```bash
qemu-system-riscv64 \
  -machine virt \
  -m 128M \
  -nographic \
  -bios none \
  -kernel your-kernel.elf \
  -s -S
```

| Flag | What it does |
|---|---|
| `-s` | Listen for GDB on `localhost:1234` |
| `-S` | Freeze at startup — don't execute until GDB says `continue` |

### Connect GDB

In another terminal:

```bash
riscv64-unknown-elf-gdb your-kernel.elf
(gdb) target remote :1234
(gdb) break _start
(gdb) continue
```

> :angrygoose: Use `riscv64-unknown-elf-gdb`, not `gdb`. The host `gdb` doesn't understand RISC-V registers or CSRs. If you don't have the RISC-V toolchain GDB, `gdb-multiarch` works too — just set the architecture first: `set architecture riscv:rv64`.

### Essential GDB Commands for Kernel Debugging

```
# Registers
info registers             # all general-purpose registers
info registers pc sp ra    # specific registers
print/x $a0               # print a0 in hex

# CSRs (Control and Status Registers)
print/x $mstatus           # machine status
print/x $sstatus           # supervisor status
print/x $scause            # trap cause
print/x $stval             # trap value (faulting address)
print/x $sepc              # exception program counter
print/x $satp              # page table base register

# Memory
x/16xw 0x80000000         # 16 words at DRAM base
x/4i $pc                  # disassemble 4 instructions at PC
x/1gx $satp               # read satp as 64-bit value

# Breakpoints
break kmain                # break at function
break *0x80000000          # break at address
watch *0x80200000          # break on memory write to address

# Execution
stepi                      # single instruction
step                       # single source line
continue                   # run until next breakpoint
```

### Page Table Debugging

When you're debugging the MMU (Part 5 of the book), these are critical:

```
# Read satp to find page table root
print/x $satp
# satp format (SV39): mode[63:60] | ASID[59:44] | PPN[43:0]
# PPN * 4096 = physical address of root page table

# Dump root page table (512 entries, 8 bytes each)
x/512gx ($satp & 0xFFFFFFFFFFF) * 4096

# Check a specific PTE
# PTE format: PPN[53:10] | RSW[9:8] | D | A | G | U | X | W | R | V
```

> :mathgoose: A PTE (page table entry) has the physical page number in bits 53:10 and permission flags in bits 7:0. V=valid, R=read, W=write, X=execute, U=user-mode accessible. If V=1 and R=W=X=0, the PTE points to the next level page table. This is how the three-level SV39 walk works. You'll be reading raw PTEs in GDB a lot during Part 5.

## QEMU Monitor

Press `Ctrl-A C` to toggle between the serial console and the QEMU monitor. The monitor lets you inspect the machine state from outside the guest.

### Useful Monitor Commands

```
# Machine info
info version               # QEMU version
info cpus                  # hart status
info mtree                 # full memory map (the real one)
info registers             # all registers (including CSRs)
info mem                   # virtual memory mappings

# Memory
xp /16xg 0x80000000       # physical memory dump (bypasses MMU)
x /16xg 0x80000000        # virtual memory dump (goes through MMU)

# Execution
stop                       # pause all harts
cont                       # resume
system_reset               # reboot

# Snapshots
savevm checkpoint1         # save machine state
loadvm checkpoint1         # restore machine state

# Dump
dump-guest-memory dump.elf # dump all guest RAM to a file
```

> :happygoose: `info mtree` is gold. It shows you every device mapped into memory with its exact address range. If your UART driver isn't working, `info mtree` will tell you whether the device exists and where it actually is.

### Exiting QEMU

`Ctrl-A X` — kills QEMU immediately from the serial console.

`Ctrl-A C` then `quit` — exits through the monitor.

From code, write `0x5555` to the test device at `0x10_0000` to trigger a clean exit:

```rust
// Exit QEMU from your kernel
unsafe {
    core::ptr::write_volatile(0x10_0000 as *mut u32, 0x5555);
}
```

## Architecture-Specific Notes

### Privilege Levels

| Level | Abbreviation | Used by |
|---|---|---|
| Machine | M-mode | Firmware (OpenSBI) |
| Supervisor | S-mode | OS kernel |
| User | U-mode | Applications |

With `-bios none`, your kernel starts in **M-mode** — you have full access to all CSRs and no protection. With `-bios default` (OpenSBI), you start in **S-mode** — M-mode CSRs are trapped by the firmware.

> :sarcasticgoose: "But I want M-mode access for debugging." Sure, use `-bios none` during early boot development. But your kernel should run in S-mode — that's what real hardware gives you. If your code only works in M-mode, it's not an OS, it's firmware. GooseOS transitions to S-mode in Chapter 3.

### Key CSRs for QEMU Development

**M-mode CSRs** (accessible with `-bios none`):

| CSR | Address | Purpose |
|---|---|---|
| `mstatus` | `0x300` | Global interrupt enable, privilege bits |
| `mie` | `0x304` | Machine interrupt enable bits |
| `mtvec` | `0x305` | Machine trap handler address |
| `mepc` | `0x341` | Machine exception program counter |
| `mcause` | `0x342` | Machine trap cause |
| `mtval` | `0x343` | Machine trap value |
| `mhartid` | `0xF14` | Hardware thread ID (read-only) |

**S-mode CSRs** (your kernel's primary interface):

| CSR | Address | Purpose |
|---|---|---|
| `sstatus` | `0x100` | Supervisor status (SPP, SIE, SPIE) |
| `sie` | `0x104` | Supervisor interrupt enable |
| `stvec` | `0x105` | Supervisor trap handler address |
| `sepc` | `0x141` | Supervisor exception PC |
| `scause` | `0x142` | Supervisor trap cause |
| `stval` | `0x143` | Supervisor trap value |
| `satp` | `0x180` | Supervisor address translation and protection (page table root) |

### `scause` Values

When a trap fires, `scause` tells you why:

**Exceptions** (bit 63 = 0):

| Value | Name | Common cause |
|---|---|---|
| 0 | Instruction address misaligned | Jump to odd address |
| 1 | Instruction access fault | Execute from unmapped page |
| 2 | Illegal instruction | Bad opcode, wrong privilege level |
| 5 | Load access fault | Read from unmapped/protected page |
| 7 | Store access fault | Write to unmapped/read-only page |
| 8 | Environment call from U-mode | `ecall` in user code (syscall) |
| 9 | Environment call from S-mode | `ecall` in kernel (SBI call) |
| 12 | Instruction page fault | MMU: no execute permission |
| 13 | Load page fault | MMU: no read permission |
| 15 | Store page fault | MMU: no write permission |

**Interrupts** (bit 63 = 1):

| Value | Name | Source |
|---|---|---|
| 1 | Supervisor software interrupt | IPI via CLINT |
| 5 | Supervisor timer interrupt | Timer via SBI/CLINT |
| 9 | Supervisor external interrupt | Device IRQ via PLIC |

> :angrygoose: When debugging traps, always read **both** `scause` and `stval`. `scause` tells you the type of trap, `stval` tells you the faulting address or instruction. A page fault with `stval = 0x0` means you dereferenced a null pointer. A page fault with `stval` in kernel space means your page table mapping is wrong. Together they pinpoint the bug.

### CLINT (Core Local Interruptor)

Base address: `0x0200_0000`

| Offset | Register | Purpose |
|---|---|---|
| `0x0000 + 4*hartid` | `msip` | Machine software interrupt pending (write 1 to trigger IPI) |
| `0x4000 + 8*hartid` | `mtimecmp` | Timer compare register (interrupt when `mtime >= mtimecmp`) |
| `0xBFF8` | `mtime` | Machine time counter (64-bit, always incrementing) |

Set a timer interrupt:

```rust
// Trigger timer interrupt in 10,000,000 ticks
let mtime = 0x0200_BFF8 as *const u64;
let mtimecmp = (0x0200_4000 + 8 * hart_id) as *mut u64;
unsafe {
    mtimecmp.write_volatile(mtime.read_volatile() + 10_000_000);
}
```

### PLIC (Platform-Level Interrupt Controller)

Base address: `0x0C00_0000`

| Offset | Register | Purpose |
|---|---|---|
| `0x000000 + 4*irq` | Priority | Set priority for IRQ source (0 = disabled) |
| `0x002000 + 0x80*context` | Enable | Bit mask of enabled IRQs per context |
| `0x200000 + 0x1000*context` | Threshold | Minimum priority to trigger interrupt |
| `0x200004 + 0x1000*context` | Claim/Complete | Read to claim IRQ, write to complete |

UART0 is IRQ 10 on the `virt` machine. To handle UART interrupts:

```rust
// Enable UART IRQ (source 10) for S-mode context 1
let enable = (0x0C00_2080) as *mut u32;  // context 1 enable
unsafe {
    let val = enable.read_volatile();
    enable.write_volatile(val | (1 << 10));
}

// Set priority > 0
let priority = (0x0C00_0000 + 4 * 10) as *mut u32;
unsafe { priority.write_volatile(1); }

// Set threshold to 0 (accept all priorities)
let threshold = (0x0C20_1000) as *mut u32;
unsafe { threshold.write_volatile(0); }
```

## Common QEMU Recipes

### Run and Exit on Test Pass/Fail

```bash
# Run kernel, capture serial output, timeout after 10 seconds
timeout 10 qemu-system-riscv64 \
  -machine virt -m 128M -nographic -bios none \
  -kernel your-kernel.elf 2>&1 | tee output.log

# Check if kernel exited cleanly (wrote to test device)
# Exit code 0 = success, 124 = timeout
```

### CI/Testing Script

```bash
#!/bin/bash
set -e

cargo build --release --target riscv64gc-unknown-none-elf

timeout 10 qemu-system-riscv64 \
  -machine virt \
  -m 128M \
  -nographic \
  -bios none \
  -kernel target/riscv64gc-unknown-none-elf/release/goose-os \
  > output.log 2>&1 || true

if grep -q "ALL TESTS PASSED" output.log; then
  echo "PASS"
  exit 0
else
  echo "FAIL"
  cat output.log
  exit 1
fi
```

> :happygoose: This pattern — build, boot in QEMU, grep the serial output — is how GooseOS runs tests in CI. No real hardware needed. The kernel prints test results to UART, writes `0x5555` to the test device to exit, and the CI script checks the output. Simple, fast, deterministic.

### QEMU + tmux Workflow

```bash
# Terminal 1: QEMU with GDB stub
qemu-system-riscv64 -machine virt -m 128M -nographic \
  -bios none -kernel your-kernel.elf -s -S

# Terminal 2: GDB
riscv64-unknown-elf-gdb your-kernel.elf \
  -ex "target remote :1234" \
  -ex "break kmain" \
  -ex "continue"

# Terminal 3: Build loop
cargo watch -x 'build --release --target riscv64gc-unknown-none-elf'
```

## Differences Between QEMU `virt` and Real Hardware (VisionFive 2)

| Aspect | QEMU `virt` | VisionFive 2 (JH7110) |
|---|---|---|
| UART | 16550A at `0x1000_0000` | 8250/16550 at `0x1000_0000` (DW APB UART) |
| DRAM base | `0x8000_0000` | `0x4000_0000` |
| Boot | `-kernel` loads ELF directly | U-Boot loads from SD/flash |
| Timer frequency | ~10 MHz (varies) | 4 MHz (fixed) |
| Harts | Configurable (`-smp N`) | 4 (1 monitor + 4 application on U74) |
| MMU | SV39/SV48 | SV39 only |
| Interrupts | Clean PLIC | PLIC + GPIO + device-specific |
| GPIO/I2C/SPI | Not available | Full peripheral set |

> :sarcasticgoose: "It works in QEMU" is necessary but not sufficient. The two most common breakages when moving to real hardware: (1) different DRAM base address — your linker script hardcodes `0x8000_0000` but the board puts RAM at `0x4000_0000`, and (2) UART initialization — QEMU's 16550A works with zero init, but real UARTs need baud rate configuration. Chapter 10 of the book handles both.

## Quick Reference: Common Flags

| Flag | Short form | Purpose |
|---|---|---|
| `-machine virt` | `-M virt` | Select machine type |
| `-cpu rv64` | | CPU model |
| `-m 128M` | | RAM size |
| `-smp 4` | | Number of harts |
| `-nographic` | | No GUI, UART to terminal |
| `-bios none` | | No firmware, start in M-mode |
| `-bios default` | | Built-in OpenSBI |
| `-kernel file.elf` | | Load kernel ELF |
| `-s` | | GDB on port 1234 |
| `-S` | | Freeze at startup |
| `-d int` | | Log interrupts to stderr |
| `-d in_asm` | | Log executed instructions |
| `-D logfile` | | Redirect `-d` output to file |
| `-drive file=x,format=raw,id=hd0` | | Attach disk image |
| `-device virtio-blk-device,drive=hd0` | | Virtio block device |

### Trace/Debug Logging

```bash
# Log all interrupts and exceptions
qemu-system-riscv64 ... -d int -D qemu.log

# Log executed assembly
qemu-system-riscv64 ... -d in_asm -D asm.log

# Log everything (warning: massive output)
qemu-system-riscv64 ... -d all -D full.log

# Log memory-mapped I/O
qemu-system-riscv64 ... -d guest_errors,unimp -D errors.log
```

> :nerdygoose: `-d int` is your best friend when trap handlers aren't firing. It logs every interrupt and exception QEMU processes, including the cause, the faulting PC, and whether it was delegated from M-mode to S-mode. If your `stvec` handler never runs, this log will show you why — often it's because the interrupt wasn't delegated via `mideleg`/`medeleg`.
