---
sidebar_position: 1
sidebar_label: "Ch 18: The Syscall Interface"
title: "Chapter 18: The Syscall Interface — ecall, Traps, and the Kernel Boundary"
---

# Chapter 18: The Syscall Interface — ecall, Traps, and the Kernel Boundary

Up until now, GooseOS has been a one-man show. Everything runs in S-mode. The kernel writes to UART, the kernel handles interrupts, the kernel talks to the PLIC. There's no "user." There's no boundary. There's just... kernel.

That changes now.

Part 6 introduces the most important abstraction in all of operating systems: **the privilege boundary**. Code running in U-mode (unprivileged) can't touch hardware, can't modify page tables, can't disable interrupts. The only way it can talk to the kernel is through a controlled gate: `ecall`.

If you've ever used Linux, every `read()`, `write()`, `open()`, `fork()` you've ever called eventually becomes a `syscall` instruction. On RISC-V, that instruction is `ecall`. Same concept, different letters.

## What ecall Actually Does

When a U-mode program executes `ecall`, the CPU does the following in **one atomic operation**:

1. Copies `pc` (the ecall's address) into `sepc` — so the kernel knows where to return
2. Sets `scause = 8` — "environment call from U-mode"
3. Sets `sstatus.SPP = 0` — records that we came from U-mode
4. Clears `sstatus.SIE` — disables interrupts (kernel needs to save state first)
5. Jumps to `stvec` — our trap vector

That's it. No arguments are passed by the hardware. The CPU doesn't know what the user *wants* — it just transitions privilege. The convention for passing arguments is pure software:

```
a7 = syscall number
a0 = first argument (also used for return value)
a1 = second argument
a2 = third argument
...
```

This is the RISC-V calling convention for syscalls. Linux uses the same register mapping. So does seL4. We do too.

> :nerdygoose: Why a7? It's arbitrary — the spec doesn't mandate it. But the RISC-V ABI spec designates a7 as the syscall number register, and every OS follows it. If you used a3 instead, your OS would work fine, but every existing userspace tool would break. Standards exist so people can stop arguing about register allocation and go build things.

## Our Syscall Table

Linux has 450+ syscalls. seL4 has 3. We start with 2:

| Number | Name | Arguments | Returns | Purpose |
|--------|------|-----------|---------|---------|
| 0 | `SYS_PUTCHAR` | a0 = character | a0 = 0 (success) | Write one byte to UART |
| 1 | `SYS_EXIT` | a0 = exit code | never returns | Terminate the process |

That's embarrassingly simple. It's also *exactly right* for proving the mechanism works. SYS_PUTCHAR is the `printf` of OS development — if you can print a character from userspace, you can do anything. SYS_EXIT proves the kernel can reclaim control.

> :angrygoose: "But real operating systems have hundreds of syscalls!" Yes. And every single one of those syscalls is an attack surface. Every one is a place where the kernel trusts input from an untrusted caller. Every one must validate arguments, check permissions, handle edge cases. In a microkernel, the goal is to push that complexity into userspace servers. The kernel's syscall table stays small. Small is auditable. Small is provable. Small doesn't have CVEs because someone forgot to bounds-check argument 4 of syscall 317.

### Why Not Unix Syscalls?

Unix's syscall interface (`read`, `write`, `open`, `fork`, `exec`, `mmap`, ...) conflates mechanism with policy. The kernel knows about filesystems, about file descriptors, about process hierarchies, about signals, about pipes. That's a *lot* of opinions baked into the kernel.

A microkernel splits it differently:

```
Unix way:                         Microkernel way:
─────────                         ─────────────────
User → write(fd, buf, n)          User → send(FS_SERVER, msg)
     → kernel VFS layer                → kernel routes IPC message
     → kernel filesystem driver         → FS server (userspace) handles write
     → kernel block driver              → FS server → send(DISK_SERVER, msg)
     → kernel disk driver               → disk server (userspace) does I/O
     → hardware                         → hardware
```

More hops? Yes. More isolation? Yes. Filesystem bug crashes the filesystem server, not the kernel. Disk driver bug crashes the disk driver, not the kernel. The kernel's job is just routing messages and managing memory — things we can formally verify.

Our future syscall table will look more like:

| Number | Name | Purpose |
|--------|------|---------|
| 0 | `SYS_SEND` | Send IPC message to a process |
| 1 | `SYS_RECEIVE` | Wait for IPC message |
| 2 | `SYS_CALL` | Send + wait for reply (RPC) |
| 3 | `SYS_GRANT` | Grant memory capability to a process |
| 4 | `SYS_SPAWN` | Create a new process |
| 5 | `SYS_EXIT` | Terminate |
| 6 | `SYS_YIELD` | Give up time slice |

Seven syscalls total. That's the entire kernel API. Everything else — filesystems, networking, device drivers, display servers — happens via IPC in userspace. The current SYS_PUTCHAR is a temporary shortcut: the kernel writes to UART directly. In the real design, a UART server process holds the MMIO capability, and putchar becomes `send(UART_SERVER, char)`.

## Modifying the Trap Vector for U-Mode

In Part 3, we wrote `trap.S` to handle S-mode traps (timer, PLIC). It was simple: allocate a frame on the current stack, save registers, call Rust, restore, `sret`. The stack was always the kernel stack because we were always in S-mode.

Now traps can come from U-mode, where `sp` points to the *user's* stack. We can't save kernel state there — the user controls that memory. We need to swap to the kernel stack before saving anything.

RISC-V gives us `sscratch` — a CSR that exists specifically for this purpose. Our convention:

```
┌─────────────────────────────────────────────┐
│ When executing in S-mode:  sscratch = 0     │
│ When executing in U-mode:  sscratch = ksp   │
└─────────────────────────────────────────────┘
```

On trap entry, `csrrw sp, sscratch, sp` atomically swaps `sp` and `sscratch`. After the swap:

- **From U-mode**: `sp` = kernel stack (was in sscratch), `sscratch` = user sp. Ready to save.
- **From S-mode**: `sp` = 0 (sscratch was 0), `sscratch` = kernel sp. We detect `sp == 0` and recover.

> :sharpgoose: `csrrw` (CSR Read-Write) is atomic — it reads the old value and writes the new value in one instruction. No window where both `sp` and `sscratch` are undefined. This is critical: if an interrupt fires between reading sscratch and writing sp, you'd lose a register value. Atomicity prevents that.

### The Complete Trap Vector

Here's the full `trap.S` — now handling both S-mode and U-mode traps:

```asm title="src/trap.S"
# GooseOS Trap Vector
#
# All traps (interrupts + exceptions) land here.
# Supports traps from BOTH S-mode and U-mode:
#
#   Convention:
#     sscratch = 0         when executing in S-mode
#     sscratch = kernel sp  when executing in U-mode
#
#   On entry from U-mode:
#     csrrw swaps sp(user) with sscratch(kernel_sp)
#     → sp = kernel_sp, sscratch = user_sp
#
#   On entry from S-mode:
#     csrrw swaps sp(kernel) with sscratch(0)
#     → sp = 0, sscratch = kernel_sp
#     We detect sp=0 and recover kernel_sp from sscratch.

.section .text
.balign 4
.global _trap_vector

_trap_vector:
    # --- Swap sp and sscratch ---
    csrrw   sp, sscratch, sp

    # If sp == 0, we came from S-mode (sscratch was 0)
    bnez    sp, _trap_save

    # From S-mode: kernel sp is now in sscratch, get it back
    csrr    sp, sscratch

_trap_save:
    # --- Allocate trap frame (272 bytes) ---
    addi    sp, sp, -272

    # --- Save all general-purpose registers ---
    sd      x1,   0x00(sp)     # ra

    # Save original sp: sscratch now holds whichever sp was swapped in.
    # From U-mode: sscratch = user_sp.  From S-mode: sscratch = kernel_sp.
    # Both are the "original sp" we want to preserve.
    csrr    t0, sscratch
    sd      t0,   0x08(sp)     # original sp (user or kernel)

    sd      x3,   0x10(sp)     # gp
    sd      x4,   0x18(sp)     # tp
    sd      x5,   0x20(sp)     # t0
    sd      x6,   0x28(sp)     # t1
    sd      x7,   0x30(sp)     # t2
    sd      x8,   0x38(sp)     # s0/fp
    sd      x9,   0x40(sp)     # s1
    sd      x10,  0x48(sp)     # a0
    sd      x11,  0x50(sp)     # a1
    sd      x12,  0x58(sp)     # a2
    sd      x13,  0x60(sp)     # a3
    sd      x14,  0x68(sp)     # a4
    sd      x15,  0x70(sp)     # a5
    sd      x16,  0x78(sp)     # a6
    sd      x17,  0x80(sp)     # a7
    sd      x18,  0x88(sp)     # s2
    sd      x19,  0x90(sp)     # s3
    sd      x20,  0x98(sp)     # s4
    sd      x21,  0xA0(sp)     # s5
    sd      x22,  0xA8(sp)     # s6
    sd      x23,  0xB0(sp)     # s7
    sd      x24,  0xB8(sp)     # s8
    sd      x25,  0xC0(sp)     # s9
    sd      x26,  0xC8(sp)     # s10
    sd      x27,  0xD0(sp)     # s11
    sd      x28,  0xD8(sp)     # t3
    sd      x29,  0xE0(sp)     # t4
    sd      x30,  0xE8(sp)     # t5
    sd      x31,  0xF0(sp)     # t6

    # Save CSRs
    csrr    t0, sstatus
    sd      t0,   0xF8(sp)     # sstatus
    csrr    t0, sepc
    sd      t0,   0x100(sp)    # sepc

    # Mark that we're in S-mode now: sscratch = 0
    csrw    sscratch, zero

    # --- Call Rust trap handler ---
    mv      a0, sp
    call    trap_handler
```

After the Rust handler returns, we check `sstatus.SPP` to decide which restore path to take:

```asm title="src/trap.S (continued) — restore paths"
    # --- Restore CSRs ---
    ld      t0, 0x100(sp)
    csrw    sepc, t0
    ld      t0, 0xF8(sp)
    csrw    sstatus, t0

    # --- Check if returning to U-mode or S-mode ---
    # sstatus.SPP (bit 8): 1 = return to S-mode, 0 = return to U-mode
    andi    t0, t0, 0x100
    bnez    t0, _trap_restore_smode

_trap_restore_umode:
    # Returning to U-mode: need sp = user_sp, sscratch = kernel_sp
    # Restore all GPRs except sp (x2) and t0 (x5)
    ld      x1,   0x00(sp)     # ra
    ld      x3,   0x10(sp)     # gp
    ld      x4,   0x18(sp)     # tp
    # (x5 = t0 restored below)
    ld      x6,   0x28(sp)     # t1
    # ... all other registers ...
    ld      x31,  0xF0(sp)     # t6

    # Put user_sp into sscratch temporarily
    ld      t0,   0x08(sp)     # user sp from frame
    csrw    sscratch, t0       # sscratch = user_sp

    # Restore t0 (x5) from frame
    ld      x5,   0x20(sp)     # t0

    # Deallocate trap frame: sp = kernel stack top
    addi    sp, sp, 272

    # Swap: sp = user_sp (from sscratch), sscratch = kernel_sp
    csrrw   sp, sscratch, sp

    sret

_trap_restore_smode:
    # Returning to S-mode: sscratch is already 0 (set above)
    # Restore all GPRs and deallocate frame
    ld      x1,   0x00(sp)     # ra
    # ... all registers ...
    ld      x31,  0xF0(sp)     # t6

    addi    sp, sp, 272
    sret
```

The U-mode restore is the tricky part. We need to:
1. Put the user's sp into `sscratch` (using `t0` as temp)
2. Restore `t0` from the frame
3. Deallocate the frame (so sp = kernel stack top)
4. `csrrw sp, sscratch, sp` — atomically: sp gets user_sp, sscratch gets kernel_sp
5. `sret` — return to U-mode with user's registers intact

> :angrygoose: If you get the U-mode restore wrong, one of three things happens: (1) you return to U-mode with the kernel's stack pointer — congratulations, the user can now read/write kernel stack memory, (2) sscratch doesn't have the kernel sp, so the next trap corrupts the user stack with kernel state, or (3) t0 is clobbered and the user program silently gets the wrong value in a register. All three are security vulnerabilities. All three are silent. None produce error messages. This is why OS development has a reputation.

## The Rust Trap Handler

The assembly saves registers and calls `trap_handler()`. That's where we dispatch:

```rust title="src/trap.rs — syscall constants"
/// Syscall numbers — must match userspace programs.
pub const SYS_PUTCHAR: usize = 0;
pub const SYS_EXIT: usize = 1;
```

The main dispatcher now handles ecalls (scause code 8) alongside interrupts:

```rust title="src/trap.rs — trap_handler()"
/// Rust trap dispatcher — called from trap.S with pointer to TrapFrame.
#[no_mangle]
pub extern "C" fn trap_handler(frame: &mut TrapFrame) {
    let scause: usize;
    let stval: usize;
    unsafe {
        asm!("csrr {}, scause", out(reg) scause);
        asm!("csrr {}, stval", out(reg) stval);
    }

    let is_interrupt = scause >> 63 == 1;
    let code = scause & 0x7FFF_FFFF_FFFF_FFFF;

    if is_interrupt {
        match code {
            5 => handle_timer(),
            9 => handle_external(),
            _ => {
                println!("\n[trap] unhandled interrupt: code={}", code);
            }
        }
    } else {
        // Exception
        match code {
            8 => {
                // ecall from U-mode — handle syscall
                handle_ecall(frame);
            }
            _ => {
                // Unexpected exception — print diagnostics and panic
                let cause_name = match code {
                    0 => "instruction address misaligned",
                    1 => "instruction access fault",
                    2 => "illegal instruction",
                    3 => "breakpoint",
                    4 => "load address misaligned",
                    5 => "load access fault",
                    6 => "store address misaligned",
                    7 => "store/AMO access fault",
                    9 => "environment call from S-mode",
                    12 => "instruction page fault",
                    13 => "load page fault",
                    15 => "store/AMO page fault",
                    _ => "unknown",
                };
                println!("\n!!! EXCEPTION !!!");
                println!("  cause:  {} (code={})", cause_name, code);
                println!("  stval:  {:#018x}", stval);
                println!("  sepc:   {:#018x}", frame.sepc);
                println!("  ra:     {:#018x}", frame.ra);
                panic!("unrecoverable exception");
            }
        }
    }
}
```

The key change: exception code 8 no longer panics. It calls `handle_ecall()`, which reads the syscall number from `a7` and dispatches.

### The ecall Handler

```rust title="src/trap.rs — handle_ecall()"
/// Handle ecall from U-mode — syscall dispatch.
///
/// Convention:
///   a7 = syscall number
///   a0 = first argument (and return value)
///   sepc is advanced by 4 so sret goes to the instruction after ecall.
fn handle_ecall(frame: &mut TrapFrame) {
    let syscall_num = frame.a7;

    match syscall_num {
        SYS_PUTCHAR => {
            // Write one character to UART
            let ch = frame.a0 as u8;
            crate::uart::Uart::platform().putc(ch);
            frame.a0 = 0; // success
        }
        SYS_EXIT => {
            let exit_code = frame.a0;
            println!();
            println!("  [kernel] Process exited with code {}", exit_code);

            // Switch back to kernel page table
            let kernel_satp = crate::kvm::kernel_satp();
            unsafe {
                asm!(
                    "csrw satp, {0}",
                    "sfence.vma zero, zero",
                    in(reg) kernel_satp,
                );
            }

            // Modify the trap frame so sret returns to S-mode
            // at our post_process_exit function instead of user code.
            // Set SPP = 1 (S-mode) in sstatus
            frame.sstatus |= 1 << 8;
            // Also re-enable interrupts on sret (SPIE = 1, bit 5)
            frame.sstatus |= 1 << 5;
            // Return to the kernel's post-exit idle loop
            frame.sepc = post_process_exit as *const () as usize;

            // sepc already points to the right place; don't advance by 4
            return;
        }
        _ => {
            println!("\n  [kernel] Unknown syscall: {} (a0={:#x})",
                syscall_num, frame.a0);
            frame.a0 = usize::MAX; // error
        }
    }

    // Advance past the ecall instruction (4 bytes)
    frame.sepc += 4;
}
```

Three things to notice:

**1. `sepc += 4`** — The `ecall` instruction is 4 bytes. When the CPU traps, `sepc` points to the ecall itself. If we just `sret` without advancing, we'd re-execute the ecall forever. Adding 4 makes `sret` return to the instruction *after* ecall.

**2. SYS_EXIT rewrites the trap frame** — Instead of returning to user code, we change `sepc` to point to `post_process_exit()` (a kernel function) and set `sstatus.SPP = 1` (return to S-mode). When trap.S does `sret`, it thinks it's restoring to S-mode at the kernel function. The process is dead; the kernel lives on.

**3. SYS_EXIT switches satp** — The user page table is no longer needed. We switch back to the kernel's page table before returning. If we returned to S-mode with the user's satp, the kernel idle loop might access addresses that only exist in the kernel page table.

> :surprisedgoose: SYS_EXIT performs brain surgery on the trap frame. The ecall handler *lies* to `trap.S`: "you came from S-mode, return to this kernel function." trap.S obeys because it reads `sstatus.SPP` from the frame, and we set it to 1. This is not a hack — it's the standard technique. Linux does the same thing when `exec()` replaces a process: rewrite the saved registers in the trap frame so `sret` lands at the new code.

### Post-Exit: Back to the Idle Loop

```rust title="src/trap.rs — post_process_exit()"
/// Kernel re-entry point after a user process exits.
///
/// We land here via sret after SYS_EXIT rewrites the trap frame.
/// Runs in S-mode with kernel satp. Enters the idle loop.
#[no_mangle]
pub extern "C" fn post_process_exit() -> ! {
    println!("  [kernel] Back in S-mode. Idle loop active.");
    println!();
    if cfg!(feature = "qemu") {
        println!("  (Ctrl-A X to exit QEMU)");
    } else {
        println!("  (Ctrl-R to reboot)");
    }
    println!();

    let uart = crate::uart::Uart::platform();
    loop {
        if let Some(c) = uart.getc() {
            match c {
                0x12 => {
                    println!("\n  Rebooting...");
                    unsafe {
                        asm!(
                            "ecall",
                            in("a0") 1usize,
                            in("a1") 0usize,
                            in("a6") 0usize,
                            in("a7") 0x53525354usize,
                            options(noreturn)
                        );
                    }
                }
                b'\r' | b'\n' => { uart.putc(b'\r'); uart.putc(b'\n'); }
                0x7F | 0x08 => { uart.putc(0x08); uart.putc(b' '); uart.putc(0x08); }
                _ => uart.putc(c),
            }
        }
    }
}
```

After the user process dies, the kernel doesn't crash, doesn't halt — it drops back to the interactive idle loop, ready for the next command. On real hardware, Ctrl-R reboots via SBI.

## The Full Trap Flow

Let's trace a SYS_PUTCHAR call from U-mode, start to finish:

```
User program (U-mode)          CPU                  Kernel (S-mode)
─────────────────────          ───                  ────────────────
li a7, 0          ─────►
li a0, 'H'        ─────►
ecall              ─────►  sepc = PC of ecall
                           scause = 8
                           sstatus.SPP = 0
                           jump to stvec
                                    ─────►  _trap_vector:
                                            csrrw sp, sscratch, sp
                                            (sp = kernel stack)
                                            save all registers
                                            call trap_handler
                                            ─────►  scause == 8
                                                    handle_ecall(frame)
                                                    frame.a7 == 0: PUTCHAR
                                                    uart.putc('H')
                                                    frame.a0 = 0
                                                    frame.sepc += 4
                                            ◄─────
                                            restore registers
                                            csrrw sp, sscratch, sp
                                            (sp = user stack)
                                            sret
                           ◄────────────────
                           jump to sepc (ecall + 4)
                           sstatus.SPP = 0 (U-mode)
next instruction   ◄─────
```

33 characters of user code. 272 bytes of trap frame. One trip through the kernel. One character on screen. That's the cost of privilege separation. Worth every cycle.

## What We Changed

| File | Change |
|------|--------|
| `src/trap.S` | **Rewritten** — sscratch swap, dual restore paths (U-mode/S-mode) |
| `src/trap.rs` | Added `handle_ecall()`, `post_process_exit()`, syscall constants |
| `src/kvm.rs` | Added `KERNEL_SATP` global, `kernel_satp()` getter |
