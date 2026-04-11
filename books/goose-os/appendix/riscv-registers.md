# Appendix A: RISC-V Registers and Calling Convention

This appendix is a reference for every register GooseOS touches. If you've ever stared at `trap.S` wondering why `s0` survives an ecall but `t0` doesn't, or why we use `a7` for the syscall number, this is the page to bookmark.

## Integer Registers (RV64I)

RISC-V has 32 integer registers, each 64 bits wide on RV64. Register `x0` is hardwired to zero. The others are given **ABI names** by the calling convention.

| Register | ABI Name | Role | Saved by | GooseOS Usage |
|----------|----------|------|----------|---------------|
| `x0` | `zero` | Always 0 (hardwired) | N/A | Used for comparisons, clearing |
| `x1` | `ra` | Return address | Caller | Function call return address |
| `x2` | `sp` | Stack pointer | Callee | Kernel stack / user stack |
| `x3` | `gp` | Global pointer | N/A | Not used (reserved) |
| `x4` | `tp` | Thread pointer | N/A | Not used (single-hart) |
| `x5` | `t0` | Temporary | Caller | Temp in trap.S, delay loops |
| `x6` | `t1` | Temporary | Caller | Temp computations |
| `x7` | `t2` | Temporary | Caller | Temp computations |
| `x8` | `s0`/`fp` | Saved / frame pointer | Callee | UART server: UART base address |
| `x9` | `s1` | Saved | Callee | UART server: saved sender PID |
| `x10` | `a0` | Arg 0 / return value | Caller | Syscall arg 0 + return value |
| `x11` | `a1` | Arg 1 / return value | Caller | Syscall arg 1 |
| `x12` | `a2` | Arg 2 | Caller | Syscall arg 2 |
| `x13` | `a3` | Arg 3 | Caller | Syscall arg 3 |
| `x14` | `a4` | Arg 4 | Caller | (unused in syscalls) |
| `x15` | `a5` | Arg 5 | Caller | (unused in syscalls) |
| `x16` | `a6` | Arg 6 | Caller | SBI FID (function ID) |
| `x17` | `a7` | Arg 7 | Caller | **Syscall number** / SBI EID |
| `x18` | `s2` | Saved | Callee | UART server: saved char |
| `x19` | `s3` | Saved | Callee | Available |
| `x20` | `s4` | Saved | Callee | Available |
| `x21` | `s5` | Saved | Callee | Available |
| `x22` | `s6` | Saved | Callee | Available |
| `x23` | `s7` | Saved | Callee | Available |
| `x24` | `s8` | Saved | Callee | Available |
| `x25` | `s9` | Saved | Callee | Available |
| `x26` | `s10` | Saved | Callee | Available |
| `x27` | `s11` | Saved | Callee | Available |
| `x28` | `t3` | Temporary | Caller | Temp computations |
| `x29` | `t4` | Temporary | Caller | Temp computations |
| `x30` | `t5` | Temporary | Caller | Temp computations |
| `x31` | `t6` | Temporary | Caller | Temp computations |

### What "Saved by" Means

This is the single most important thing to understand about the calling convention:

- **Caller-saved** (temporaries: `t0-t6`, arguments: `a0-a7`, return address: `ra`): The *caller* must save these before calling a function if it needs them afterward. The callee is free to trash them. In GooseOS, an `ecall` clobbers `a0` (return value) and potentially `a1`, so userspace code that needs values across a syscall must store them in `s` registers.

- **Callee-saved** (saved: `s0-s11`, stack pointer: `sp`): The *callee* must restore these to their original values before returning. This is why the UART server uses `s0` for the UART base address, `s1` for the sender PID, and `s2` for the character — these survive across `ecall` instructions.

### Why the UART Server Uses `s` Registers

```asm
# UART server register allocation:
#   s0 = 0x5E000000  (UART base VA — never changes)
#   s1 = sender PID  (saved across ecall for SYS_REPLY)
#   s2 = character   (saved across ecall for echo)

# If we used t0 instead of s0 for the UART base:
    li      t0, 0x5E000000    # UART base in t0
    ecall                      # ... syscall clobbers t0!
    sb      s2, 0(t0)          # BUG: t0 is now garbage
```

**Rule of thumb:** If a value must survive an ecall or function call, put it in `s0-s11`. If it's a scratch computation within a single basic block, use `t0-t6`.

## The LP64 Calling Convention

GooseOS uses the **LP64** (ILP64D on hardware with FPU) calling convention — the standard RISC-V ABI for 64-bit systems. This is *not* EABI.

:::info EABI vs LP64
**RV32E EABI** is a minimal ABI for 32-bit embedded RISC-V with only 16 registers (x0-x15). GooseOS targets **RV64GC** which has all 32 registers and uses the standard **LP64** ABI. The "E" in EABI stands for the "E" (embedded) base integer ISA extension, which halves the register file. GooseOS doesn't use it.
:::

### Function Call Convention

```
Arguments:     a0-a7 (x10-x17)     — up to 8 integer arguments
Return value:  a0, a1 (x10, x11)   — up to 2 return values
Temporaries:   t0-t6 (x5-x7, x28-x31) — clobbered by callee
Saved:         s0-s11 (x8-x9, x18-x27) — preserved by callee
Return addr:   ra (x1)              — set by jal/jalr
Stack pointer: sp (x2)              — 16-byte aligned
```

### GooseOS Syscall Convention

GooseOS follows a convention similar to Linux and SBI:

```
Syscall number:  a7
Arguments:       a0, a1, a2
Return value:    a0
```

| Syscall | `a7` | `a0` | `a1` | `a2` | Returns (`a0`) |
|---------|------|------|------|------|----------------|
| SYS_PUTCHAR | 0 | char | — | — | 0 |
| SYS_EXIT | 1 | exit code | — | — | (no return) |
| SYS_SEND | 2 | target PID | message | — | 0 or MAX |
| SYS_RECEIVE | 3 | from PID (0=any) | — | — | message; a1=sender |
| SYS_CALL | 4 | target PID | message | — | reply value |
| SYS_REPLY | 5 | target PID | reply | — | 0 or MAX |
| SYS_MAP | 6 | phys addr | virt addr | flags | 0 or MAX |
| SYS_UNMAP | 7 | virt addr | — | — | 0 or MAX |
| SYS_ALLOC_PAGES | 8 | count | — | — | phys addr or MAX |
| SYS_FREE_PAGES | 9 | phys addr | count | — | 0 or MAX |
| SYS_SPAWN | 10 | ELF ptr | ELF len | — | new PID or MAX |
| SYS_WAIT | 11 | child PID | — | — | exit code |
| SYS_GETPID | 12 | — | — | — | current PID |
| SYS_YIELD | 13 | — | — | — | 0 |
| SYS_IRQ_REGISTER | 14 | IRQ number | — | — | 0 or MAX |
| SYS_IRQ_ACK | 15 | — | — | — | 0 or MAX |

Note: `SYS_RECEIVE` is unique — it returns **two** values: `a0` = message, `a1` = sender PID. When the sender is the kernel (IRQ notification), `a1` = 0.

### SBI Calling Convention

GooseOS calls SBI (OpenSBI firmware) using the same register layout:

```
EID (extension ID):  a7     — e.g., 0x53525354 for SRST
FID (function ID):   a6     — e.g., 0 for system reset
Arguments:           a0-a5
Return:              a0 = error code, a1 = value
```

This is why `a7` is the syscall number — it mirrors the SBI/Linux convention. The same register carries the "what do you want" identifier at every privilege level: user → supervisor (ecall/syscall), supervisor → machine (ecall/SBI).

## Control and Status Registers (CSRs)

These are the S-mode CSRs that GooseOS uses. They are accessed via `csrr` (read), `csrw` (write), `csrs` (set bits), and `csrc` (clear bits).

### Trap Handling

| CSR | Name | Purpose | GooseOS Usage |
|-----|------|---------|---------------|
| `sstatus` | Supervisor Status | Global interrupt enable, privilege mode | SPP bit: which mode trapped. SPIE/SIE: interrupt enable. SUM: supervisor user memory access |
| `sepc` | Supervisor Exception PC | Address of the instruction that trapped | Saved in TrapFrame. Advanced by 4 after ecall. sret jumps here |
| `scause` | Supervisor Cause | Why we trapped (interrupt vs exception, code) | Bit 63: interrupt flag. Bits 0-62: exception/interrupt code |
| `stval` | Supervisor Trap Value | Additional trap info (faulting address, instruction) | Used for page fault diagnostics |
| `stvec` | Supervisor Trap Vector | Address of trap handler | Points to `_trap_vector` in trap.S |
| `sscratch` | Supervisor Scratch | General-purpose scratch register | **Key convention:** 0 in S-mode, kernel_sp in U-mode |
| `sie` | Supervisor Interrupt Enable | Per-source interrupt enable bits | SEIE (external/PLIC), STIE (timer), SSIE (software) |
| `sip` | Supervisor Interrupt Pending | Which interrupts are pending | Read to check, write to clear software interrupts |

### Memory Management

| CSR | Name | Purpose | GooseOS Usage |
|-----|------|---------|---------------|
| `satp` | Supervisor Address Translation | Page table root + mode | Mode=8 (Sv39), PPN=root page table physical page number |

### Timer

| CSR | Name | Purpose | GooseOS Usage |
|-----|------|---------|---------------|
| `time` | Timer | Current time counter | Read to get current time |
| `stimecmp` | Timer Compare | Fire timer interrupt when `time >= stimecmp` | Set to `time + TIMESLICE` for preemptive scheduling |

## The TrapFrame

The TrapFrame is a 272-byte structure on the kernel stack that holds all process state during a trap. It must match the layout in `trap.S` exactly.

```
Offset  Register   Field
------  --------   -----
0x00    x1         ra
0x08    x2         sp       ← original sp (user or kernel, from sscratch)
0x10    x3         gp
0x18    x4         tp
0x20    x5         t0       ← saved FIRST (before csrr clobbers it)
0x28    x6         t1
0x30    x7         t2
0x38    x8         s0/fp
0x40    x9         s1
0x48    x10        a0       ← syscall arg 0 / return value
0x50    x11        a1       ← syscall arg 1 / IPC sender PID
0x58    x12        a2       ← syscall arg 2
0x60    x13        a3
0x68    x14        a4
0x70    x15        a5
0x78    x16        a6
0x80    x17        a7       ← syscall number
0x88    x18        s2
0x90    x19        s3
0x98    x20        s4
0xA0    x21        s5
0xA8    x22        s6
0xB0    x23        s7
0xB8    x24        s8
0xC0    x25        s9
0xC8    x26        s10
0xD0    x27        s11
0xD8    x28        t3
0xE0    x29        t4
0xE8    x30        t5
0xF0    x31        t6
0xF8    —          sstatus  ← privilege level, interrupt state
0x100   —          sepc     ← return address (where to sret)
```

Total: 33 fields x 8 bytes = 264 bytes, rounded to 272 (0x110) for 16-byte stack alignment.

### Why t0 is Saved First

Look at this sequence in `trap.S`:

```asm
sd      x5,   0x20(sp)     # t0 — saved FIRST
csrr    t0, sscratch        # t0 = original sp (clobbers t0!)
sd      t0,   0x08(sp)     # frame.sp = original sp
```

If we saved `t0` *after* the `csrr`, we'd store the sscratch value instead of the process's actual `t0`. A process preempted in a delay loop (spinning on `t0`) would resume with a corrupted counter. This was an actual bug we fixed in Phase 12.

## The sscratch Convention

This is the mechanism that makes U-mode/S-mode trap handling work with a single entry point:

```
Mode        sscratch value     sp value
----        ---------------    --------
U-mode      kernel_sp          user_sp
S-mode      0                  kernel_sp
```

On trap entry, `csrrw sp, sscratch, sp` atomically swaps `sp` and `sscratch`:

```
From U-mode:
  BEFORE: sp=user_sp,   sscratch=kernel_sp
  AFTER:  sp=kernel_sp, sscratch=user_sp
  → We have a kernel stack. User sp is safe in sscratch.

From S-mode:
  BEFORE: sp=kernel_sp, sscratch=0
  AFTER:  sp=0,         sscratch=kernel_sp
  → sp=0 is our signal: recover kernel_sp from sscratch.
```

After saving registers, we set `sscratch = 0` to mark that we're in S-mode. This prevents nested traps from corrupting the stack.

## Context Switch: How It Works

A context switch in GooseOS is a *frame swap*. The process's registers aren't "switched" — the TrapFrame on the stack is overwritten with a different process's saved state:

```
1. Process A traps → trap.S saves A's registers to TrapFrame
2. Rust handler calls schedule() → picks Process B
3. schedule() copies A's TrapFrame into PROCS[A].context
4. schedule() copies PROCS[B].context over the stack TrapFrame
5. schedule() switches page table (satp = B's page table)
6. Rust returns to trap.S
7. trap.S restores registers from TrapFrame → B's registers
8. sret → jumps to B's sepc in U-mode
```

The key insight: `trap.S` doesn't know a context switch happened. It saves registers, calls Rust, restores registers. The Rust code just swapped *which* registers are on the stack.

## The scause Register

When a trap occurs, `scause` tells you why:

### Interrupts (bit 63 = 1)

| Code | Name | GooseOS Handler |
|------|------|-----------------|
| 1 | Supervisor software interrupt | (unused) |
| 5 | Supervisor timer interrupt | `handle_timer()` — preemptive scheduling |
| 9 | Supervisor external interrupt | `handle_external()` — PLIC dispatch |

### Exceptions (bit 63 = 0)

| Code | Name | GooseOS Handler |
|------|------|-----------------|
| 2 | Illegal instruction | Panic |
| 5 | Load access fault | Panic |
| 7 | Store access fault | Panic |
| 8 | Environment call from U-mode | `handle_ecall()` — syscall dispatch |
| 12 | Instruction page fault | Panic |
| 13 | Load page fault | Panic |
| 15 | Store page fault | Panic |

## Sv39 Virtual Memory

GooseOS uses **Sv39** — 39-bit virtual addresses with 3 levels of page tables.

### Virtual Address Layout (39 bits)

```
 38        30 29        21 20        12 11         0
┌──────────┬──────────────┬─────────────┬────────────┐
│  VPN[2]  │    VPN[1]    │    VPN[0]   │   Offset   │
│  9 bits  │    9 bits    │    9 bits   │   12 bits  │
└──────────┴──────────────┴─────────────┴────────────┘
```

- VPN[2] indexes the root page table (512 entries)
- VPN[1] indexes the level-1 page table
- VPN[0] indexes the level-2 page table
- Offset selects the byte within the 4KB page

### Page Table Entry (PTE) Flags

```
Bit   Name    Meaning
---   ----    -------
 0    V       Valid — entry is active
 1    R       Readable
 2    W       Writable
 3    X       Executable
 4    U       User-mode accessible
 5    G       Global (not flushed on ASID change)
 6    A       Accessed (hardware sets on access)
 7    D       Dirty (hardware sets on write)
```

### GooseOS Permission Sets

| Name | Flags | Used For |
|------|-------|----------|
| `KERNEL_RX` | V+R+X+A | Kernel .text section |
| `KERNEL_RO` | V+R+A | Kernel .rodata section |
| `KERNEL_RW` | V+R+W+A+D | Kernel .data/.bss/heap/stack |
| `KERNEL_MMIO` | V+R+W+A+D | Kernel UART/PLIC access (no U bit) |
| `USER_RX` | V+R+X+U+A | User code pages |
| `USER_RW` | V+R+W+U+A+D | User stack and data pages |
| `USER_MMIO` | V+R+W+U+A+D | User device access (UART server) |

The U bit is the boundary between kernel and user memory. S-mode can only access U-bit pages when the SUM (Supervisor User Memory) bit is set in `sstatus`.

## Quick Reference Card

```
Syscall:   a7=number  a0,a1,a2=args  → ecall  → a0=result
IPC:       SYS_CALL(a0=target, a1=msg) → a0=reply
           SYS_RECEIVE(a0=from) → a0=msg, a1=sender
IRQ:       SYS_IRQ_REGISTER(a0=irq) → kernel delivers via SYS_RECEIVE(a1=0)
Timer:     stimecmp = time + timeslice → interrupt → preempt
Trap:      csrrw sp,sscratch,sp → save → handle → restore → sret
MMU:       satp = (8 << 60) | (asid << 44) | (ppn)
```
