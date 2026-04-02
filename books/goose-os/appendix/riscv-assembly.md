---
sidebar_position: 3
sidebar_label: "RISC-V Assembly Basics"
title: "RISC-V Assembly Basics"
---

# RISC-V Assembly Basics

This is a practical reference for the assembly you'll encounter in GooseOS. Not a full ISA manual — just what you need to read and write kernel boot code, trap handlers, and context switches.

## Instruction Format

Most RISC-V instructions follow a simple pattern:

```
operation  destination, source1, source2
```

Examples:
```asm
add   a0, a1, a2    # a0 = a1 + a2
addi  a0, a1, 42    # a0 = a1 + 42  (immediate)
sub   a0, a1, a2    # a0 = a1 - a2
```

**There is no `sub` with immediate** — use `addi` with a negative value: `addi a0, a1, -5`.

> :surprisedgoose: Wait, no `subi`? Nope. Two's complement makes `addi rd, rs, -5` identical to subtracting 5. One fewer opcode, one fewer thing to decode. RISC-V takes "reduced" seriously.
>
> :sarcasticgoose: Coming from x86 where there's `add`, `adc`, `inc`, `lea`, `xadd`, and five more ways to add things? Welcome to the good life. One `add`, one `addi`. That's it. Breathe.

## Arithmetic & Logic

```asm
# Arithmetic
add   rd, rs1, rs2      # rd = rs1 + rs2
addi  rd, rs1, imm      # rd = rs1 + sign_extend(imm)
sub   rd, rs1, rs2      # rd = rs1 - rs2
mul   rd, rs1, rs2      # rd = rs1 * rs2  (M extension)

# Logical
and   rd, rs1, rs2      # rd = rs1 & rs2
andi  rd, rs1, imm      # rd = rs1 & imm
or    rd, rs1, rs2      # rd = rs1 | rs2
ori   rd, rs1, imm      # rd = rs1 | imm
xor   rd, rs1, rs2      # rd = rs1 ^ rs2

# Shifts
sll   rd, rs1, rs2      # rd = rs1 << rs2  (logical left)
srl   rd, rs1, rs2      # rd = rs1 >> rs2  (logical right, zero-fill)
sra   rd, rs1, rs2      # rd = rs1 >> rs2  (arithmetic right, sign-extend)
slli  rd, rs1, imm      # rd = rs1 << imm
```

## Load & Store

RISC-V is a **load/store architecture** — you can't operate directly on memory. Load into a register, compute, store back.

```asm
# Load (memory → register)
lb    rd, offset(rs1)   # load byte (sign-extend to 64 bits)
lbu   rd, offset(rs1)   # load byte unsigned (zero-extend)
lh    rd, offset(rs1)   # load halfword (16 bits)
lw    rd, offset(rs1)   # load word (32 bits)
ld    rd, offset(rs1)   # load doubleword (64 bits) — RV64 only

# Store (register → memory)
sb    rs2, offset(rs1)  # store byte
sh    rs2, offset(rs1)  # store halfword
sw    rs2, offset(rs1)  # store word
sd    rs2, offset(rs1)  # store doubleword — RV64 only
```

Example — write a byte to the UART:
```asm
li    t0, 0x10000000    # UART base address
li    t1, 0x48          # ASCII 'H'
sb    t1, 0(t0)         # write byte to UART
```

> :nerdygoose: This is literally how GooseOS prints its first character. No drivers, no abstractions — just slam a byte into the UART's transmit register at `0x10000000`. Memory-mapped I/O means hardware registers look like memory addresses.
>
> :angrygoose: Don't try `sd` to a UART register. The UART expects byte-width writes. Using `sd` writes 8 bytes and corrupts adjacent UART control registers. Always match the store width to the device's register size.

## Branches & Jumps

```asm
# Conditional branches (no condition flags — compare registers directly)
beq   rs1, rs2, label   # branch if rs1 == rs2
bne   rs1, rs2, label   # branch if rs1 != rs2
blt   rs1, rs2, label   # branch if rs1 < rs2  (signed)
bge   rs1, rs2, label   # branch if rs1 >= rs2 (signed)
bltu  rs1, rs2, label   # branch if rs1 < rs2  (unsigned)
bgeu  rs1, rs2, label   # branch if rs1 >= rs2 (unsigned)

# Unconditional jumps
jal   rd, label          # jump and link: rd = pc+4, jump to label
jalr  rd, rs1, offset    # jump and link register: rd = pc+4, jump to rs1+offset

# Common pseudoinstructions
j     label              # → jal zero, label  (jump, discard return addr)
jr    rs1                # → jalr zero, rs1, 0  (jump to register)
call  label              # → auipc ra, ... + jalr ra, ...  (far call)
ret                      # → jalr zero, ra, 0  (return)
```

**Key difference from x86/ARM**: No condition flags register. Branches compare two registers directly. This is simpler and avoids flag-related bugs.

> :happygoose: No condition flags means no "which instruction last set the flags?" debugging nightmares. Each branch is self-contained: `blt a0, a1, label` — you can read it and *know* what's being compared without tracing backwards.
>
> :angrygoose: Watch out for signed vs unsigned branches! `blt` does signed comparison, `bltu` does unsigned. Mixing them up when comparing addresses (which are unsigned) is a classic kernel bug. If your page fault handler fires for "valid" addresses, check your branch signedness.

## Pseudoinstructions

The assembler provides many convenience pseudoinstructions:

```asm
li    rd, immediate      # load immediate (any size, assembler picks lui+addi)
la    rd, symbol         # load address of symbol
mv    rd, rs             # → addi rd, rs, 0
nop                      # → addi zero, zero, 0
not   rd, rs             # → xori rd, rs, -1
neg   rd, rs             # → sub rd, zero, rs
j     label              # → jal zero, label
ret                      # → jalr zero, ra, 0
call  label              # far function call (auipc + jalr)
```

## CSR Instructions (for kernel code)

These read/write Control and Status Registers:

```asm
csrr   rd, csr           # read CSR into rd  (→ csrrs rd, csr, zero)
csrw   csr, rs           # write rs into CSR (→ csrrw zero, csr, rs)
csrs   csr, rs           # set bits: CSR |= rs
csrc   csr, rs           # clear bits: CSR &= ~rs
csrrw  rd, csr, rs       # atomic read/write: rd = CSR, CSR = rs
csrrs  rd, csr, rs       # atomic read/set: rd = CSR, CSR |= rs
csrrc  rd, csr, rs       # atomic read/clear: rd = CSR, CSR &= ~rs
```

Example — enable S-mode interrupts:
```asm
csrsi  sstatus, 0x2      # set SIE bit (bit 1) in sstatus
```

> :sharpgoose: Notice the naming: `csrr` = read, `csrw` = write, `csrs` = set bits, `csrc` = clear bits. The `rs`/`rc`/`rw` suffixed versions (`csrrs`, `csrrc`, `csrrw`) are the *real* instructions — the others are pseudoinstructions that discard either the old value or the write. Know which you need.
>
> :nerdygoose: CSR instructions are **atomic** read-modify-write. `csrrs rd, csr, rs` reads the old value into `rd` AND sets bits in a single operation. This matters for interrupt handling — you don't want a trap sneaking in between your read and your modify.

## Trap-Related Instructions

```asm
ecall                     # environment call — trap to higher privilege level
                          # U-mode → S-mode (syscall), S-mode → M-mode (SBI call)

ebreak                    # breakpoint — triggers debugger trap

sret                      # return from S-mode trap handler
                          # restores privilege mode from sstatus.SPP
                          # jumps to sepc

mret                      # return from M-mode trap handler (firmware only)

sfence.vma                # flush TLB (after changing page tables)
sfence.vma  rs1, rs2      # flush specific address/ASID
```

> :angrygoose: Forgot `sfence.vma` after changing page tables? Congrats, your kernel is now executing with stale TLB entries. The CPU cached the old mapping and will happily use it until you flush. This is the #1 virtual memory debugging headache.
>
> :weightliftingoose: `sfence.vma` without arguments flushes the *entire* TLB — the nuclear option. Fine for boot-time setup, but in hot paths use the targeted version with specific address/ASID to avoid flushing entries you still need. TLB misses are expensive.

## A Complete Example: Boot Entry

This is what a minimal kernel entry looks like in RISC-V assembly:

```asm
.section .text.init
.global _start
_start:
    # Which hart (hardware thread) are we?
    csrr  t0, mhartid
    bnez  t0, park         # only hart 0 continues; others park

    # Zero the BSS section
    la    t0, _bss_start
    la    t1, _bss_end
bss_loop:
    bge   t0, t1, bss_done
    sd    zero, 0(t0)
    addi  t0, t0, 8
    j     bss_loop
bss_done:

    # Set up the stack (grows downward)
    la    sp, _stack_top

    # Jump to Rust
    call  kmain

    # If kmain returns, park this hart
park:
    wfi                    # wait for interrupt (low-power idle)
    j     park
```

> :happygoose: This is the entire boot sequence in ~15 instructions. Park non-primary harts, zero BSS, set up stack, jump to Rust. That's it. No BIOS, no UEFI, no GRUB — OpenSBI hands you a clean machine and says "go."
>
> :nerdygoose: The `wfi` (Wait For Interrupt) in the park loop is important — without it, parked harts would spin-loop at 100% CPU consuming power for nothing. `wfi` puts the hart in a low-power state until an interrupt arrives. On QEMU it doesn't matter much, but on real silicon it's the difference between 0.5W and 5W per core.
>
> :surprisedgoose: Notice `sd zero, 0(t0)` in the BSS loop — we're storing 8 bytes of zero per iteration. The `zero` register (x0) is always 0, so we get a free "write zero to memory" without loading an immediate. This is why that hardwired-zero register exists!

## Calling Convention Summary

When calling a function:
1. Put arguments in `a0`-`a7`
2. Return values come back in `a0`-`a1`
3. Caller-saved: `ra`, `t0-t6`, `a0-a7` — save these yourself if needed after the call
4. Callee-saved: `sp`, `s0-s11` — the function must restore these before returning
5. `sp` must be 16-byte aligned at function entry

## Quick Reference Card

| Need to... | Instruction |
|------------|-------------|
| Move a register | `mv rd, rs` |
| Load a constant | `li rd, value` |
| Load from memory | `ld rd, offset(base)` |
| Store to memory | `sd rs, offset(base)` |
| Call a function | `call label` |
| Return | `ret` |
| Branch if equal | `beq rs1, rs2, label` |
| Read a CSR | `csrr rd, csr` |
| Write a CSR | `csrw csr, rs` |
| System call | `ecall` |
| Return from trap | `sret` |
| Flush TLB | `sfence.vma` |
| Idle/sleep | `wfi` |

## Example Programs

### Example 1: Hello World via UART

A complete standalone program that prints "Hello" to the serial console:

```asm
# hello.S — prints "Hello\n" to UART on QEMU virt machine
.section .text
.global _start

_start:
    li    t0, 0x10000000      # UART base address (QEMU virt)

    li    t1, 'H'
    sb    t1, 0(t0)
    li    t1, 'e'
    sb    t1, 0(t0)
    li    t1, 'l'
    sb    t1, 0(t0)
    li    t1, 'l'
    sb    t1, 0(t0)
    li    t1, 'o'
    sb    t1, 0(t0)
    li    t1, '\n'
    sb    t1, 0(t0)

spin:
    wfi
    j     spin
```

> :happygoose: Your first RISC-V program! No OS, no runtime, no libc — just you and the hardware. Every byte you print is a direct store to the UART transmit register.

### Example 2: Print a String (with a loop)

```asm
# print_string.S — demonstrates loops and memory access
.section .text
.global _start

_start:
    li    t0, 0x10000000      # UART base
    la    t1, message         # pointer to string

print_loop:
    lb    t2, 0(t1)           # load next byte
    beqz  t2, done            # null terminator? stop
    sb    t2, 0(t0)           # write byte to UART
    addi  t1, t1, 1           # advance pointer
    j     print_loop

done:
    wfi
    j     done

.section .rodata
message:
    .asciz "GooseOS says honk!\n"
```

> :nerdygoose: `la` (load address) is a pseudoinstruction that expands to `auipc + addi` — it computes a PC-relative address, which is how position-independent code works. The assembler handles the relocation math for you.
>
> :sarcasticgoose: Yes, we're null-terminating strings like it's 1972. In bare-metal land, there's no `std::string` to save you. Welcome to the C ABI.

### Example 3: Sum an Array (arithmetic + memory)

```asm
# sum_array.S — sum integers, result in a0
.section .text
.global _start

_start:
    la    t0, array           # pointer to array
    li    t1, 5               # array length
    li    a0, 0               # accumulator = 0

sum_loop:
    beqz  t1, print_result    # if count == 0, done
    lw    t2, 0(t0)           # load word (32-bit int)
    add   a0, a0, t2          # accumulator += element
    addi  t0, t0, 4           # advance pointer (4 bytes per word)
    addi  t1, t1, -1          # decrement counter
    j     sum_loop

print_result:
    # Convert a0 to ASCII and print (simplified: assumes sum < 256)
    li    t0, 0x10000000      # UART base
    addi  t1, a0, '0'         # naive int→ASCII (works for single digit)
    sb    t1, 0(t0)
    li    t1, '\n'
    sb    t1, 0(t0)

done:
    wfi
    j     done

.section .rodata
array:
    .word 1, 2, 3, 4, 5      # sum = 15, but print shows '?' since 15 > 9
```

> :angrygoose: The "print" code here only works for single digits (0–9). Real number-to-string conversion requires division loops — see the exercises below. This is intentionally simplified to focus on the array traversal.
>
> :mathgoose: The loop invariant: at iteration `i`, `a0` holds the sum of elements `array[0..i)`, `t0` points to `array[i]`, and `t1 = length - i`. The loop terminates when `t1 == 0`, at which point `a0 = Σ array[0..length)`.

### Example 4: Function Calls (calling convention in action)

```asm
# factorial.S — recursive factorial using the RISC-V calling convention
.section .text
.global _start

_start:
    la    sp, stack_top       # set up stack
    li    a0, 5               # compute 5!
    call  factorial            # result in a0

    # Print result (120 = 0x78 = 'x' in ASCII — just a proof-of-life)
    li    t0, 0x10000000
    sb    a0, 0(t0)           # prints 'x' (ASCII 120)
    li    t1, '\n'
    sb    t1, 0(t0)
    j     done

# factorial(n) → n!
# a0 = n (input), a0 = result (output)
factorial:
    addi  sp, sp, -16         # allocate stack frame
    sd    ra, 8(sp)           # save return address
    sd    s0, 0(sp)           # save s0 (callee-saved)

    li    t0, 1
    ble   a0, t0, base_case   # if n <= 1, return 1

    mv    s0, a0              # save n in s0 (survives the call)
    addi  a0, a0, -1          # a0 = n-1
    call  factorial            # a0 = factorial(n-1)
    mul   a0, s0, a0          # a0 = n * factorial(n-1)
    j     epilogue

base_case:
    li    a0, 1               # return 1

epilogue:
    ld    ra, 8(sp)           # restore return address
    ld    s0, 0(sp)           # restore s0
    addi  sp, sp, 16          # deallocate stack frame
    ret

done:
    wfi
    j     done

.section .bss
.align 4
stack_bottom:
    .space 4096               # 4 KiB stack
stack_top:
```

> :nerdygoose: This is the full RISC-V calling convention in action. Notice: `ra` and `s0` are saved/restored (callee-saved), `a0` carries both the argument and return value (caller-saved), and the stack stays 16-byte aligned. This is *exactly* how Rust-compiled code works under the hood.
>
> :sharpgoose: Why `sd`/`ld` and 16-byte frames? We're on RV64 — registers are 8 bytes. Two saved registers × 8 bytes = 16 bytes. If you use `sw`/`lw` by accident, you'll truncate your 64-bit return address and crash on `ret`.
>
> :angrygoose: Stack overflow is silent in bare-metal. There's no guard page, no segfault — you just corrupt whatever memory lives below the stack. In this example, 4 KiB is fine for `factorial(5)`, but `factorial(100000)` would smash through and corrupt your code.

## How to Build and Run

### Prerequisites

Install the RISC-V cross-compilation toolchain and QEMU:

```bash
# Ubuntu/Debian
sudo apt install gcc-riscv64-linux-gnu qemu-system-riscv64

# macOS (Homebrew)
brew install riscv64-elf-gcc qemu

# Arch Linux
sudo pacman -S riscv64-linux-gnu-gcc qemu-system-riscv
```

### Build and Run a Bare-Metal Program

```bash
# 1. Assemble
riscv64-linux-gnu-as -march=rv64gc -o hello.o hello.S

# 2. Link (bare-metal, entry at 0x80000000 where QEMU loads the kernel)
riscv64-linux-gnu-ld -T link.ld -o hello.elf hello.o

# 3. Convert to raw binary
riscv64-linux-gnu-objcopy -O binary hello.elf hello.bin

# 4. Run on QEMU
qemu-system-riscv64 \
    -machine virt \
    -nographic \
    -bios default \
    -kernel hello.elf
```

> :happygoose: `-nographic` redirects the UART to your terminal. `-bios default` loads OpenSBI firmware which sets up M-mode and jumps to your kernel at `0x80000000`. Press `Ctrl-A` then `X` to exit QEMU.

### Minimal Linker Script

Save this as `link.ld`:

```ld
/* link.ld — minimal linker script for QEMU virt machine */
OUTPUT_ARCH(riscv)
ENTRY(_start)

SECTIONS {
    . = 0x80000000;          /* RAM start on QEMU virt */

    .text : {
        *(.text.init)        /* boot entry first */
        *(.text .text.*)
    }

    .rodata : { *(.rodata .rodata.*) }
    .data   : { *(.data .data.*) }

    .bss : {
        _bss_start = .;
        *(.bss .bss.*)
        _bss_end = .;
    }

    /DISCARD/ : { *(.comment) *(.note.*) }
}
```

> :nerdygoose: The linker script tells the linker where to place each section in memory. `0x80000000` is where RAM starts on QEMU's `virt` machine — and where OpenSBI jumps after firmware init. The `.text.init` section goes first so `_start` is at the entry point.
>
> :surprisedgoose: Without a linker script, the default linker will place code at some arbitrary address (usually `0x10000` for Linux userspace). On bare metal, that address is probably unmapped memory. Your program will "run" but execute garbage. Always use a linker script for bare-metal.

### Debugging with GDB

```bash
# Terminal 1: start QEMU with GDB server
qemu-system-riscv64 \
    -machine virt \
    -nographic \
    -bios default \
    -kernel hello.elf \
    -s -S    # -s = GDB on port 1234, -S = pause at start

# Terminal 2: connect GDB
riscv64-linux-gnu-gdb hello.elf
(gdb) target remote :1234
(gdb) break _start
(gdb) continue
(gdb) info registers       # dump all registers
(gdb) si                   # single-step one instruction
(gdb) x/10i $pc            # disassemble next 10 instructions
```

> :weightliftingoose: GDB single-stepping through assembly is the best way to build intuition. Watch the registers change instruction by instruction. It's like watching your reps in the mirror — you see exactly what each instruction does.
>
> :angrygoose: If GDB says "Remote connection closed" immediately, your program probably triple-faulted before hitting the breakpoint. Check that `_start` is actually at `0x80000000` with `riscv64-linux-gnu-objdump -d hello.elf | head -20`.

## Exercises

1. **Modify the hello program** to print your name instead of "Hello"
2. **Write a loop** that prints the numbers 0–9 (hint: `'0'` is ASCII 48, so `addi t1, counter, 48` converts a digit to ASCII)
3. **Implement `strlen`** — a function that takes a string pointer in `a0` and returns the length in `a0`
4. **Write `itoa`** — convert an integer to a decimal ASCII string (requires division by 10 in a loop)
5. **Implement Fibonacci** using the calling convention — `fib(a0)` returns the nth Fibonacci number in `a0`

> :happygoose: These exercises build on each other. By the time you finish exercise 5, you'll be comfortable with RISC-V loads, stores, branches, function calls, and the stack. That's everything you need to read GooseOS kernel assembly.
