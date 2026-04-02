---
sidebar_position: 1
sidebar_label: "Ch 7: The Trap Vector"
title: "Chapter 7: The Trap Vector — Teaching the CPU Where to Go When Things Happen"
---

# Chapter 7: The Trap Vector — Teaching the CPU Where to Go When Things Happen

Up until now, our kernel has been blind. If something unexpected happens — a timer fires, a key is pressed, an illegal instruction executes — the CPU has nowhere to go. It jumps to address `0x0` and dies. That's what happened with our SpinLock in Part 2.

In this chapter, we fix that by giving the CPU an address to jump to when *anything* happens.

## What Is a Trap?

On RISC-V, a **trap** is any event that transfers control from normal execution to a handler. There are two kinds:

| Type | Cause | Examples |
|------|-------|---------|
| **Interrupt** | External async event | Timer tick, UART data arrives, button press |
| **Exception** | Something the current instruction did wrong | Illegal instruction, page fault, divide by zero |

Both go through the same mechanism: the CPU saves the current PC to `sepc`, saves the cause to `scause`, and jumps to the address in `stvec`.

```
Normal execution
    │
    ▼  (timer fires / page fault / etc.)
CPU automatically:
    1. Saves PC → sepc
    2. Saves cause → scause
    3. Saves trap value → stval
    4. Disables interrupts (clears sstatus.SIE)
    5. Jumps to stvec
    │
    ▼
Our trap handler runs
    │
    ▼
sret → resumes at sepc
```

> :nerdygoose: The `s` prefix means "Supervisor mode." We're in S-mode because OpenSBI owns M-mode (Machine mode). M-mode traps use `mtvec`, `mcause`, `mepc`. S-mode traps use `stvec`, `scause`, `sepc`. Same mechanism, different privilege level. OpenSBI set up M-mode traps during boot — that's how it provides timer and IPI services to us.

## Setting `stvec`

The `stvec` CSR (Supervisor Trap VECtor) tells the CPU where to jump. We write our trap handler's address into it:

```rust
pub fn trap_init() {
    extern "C" {
        fn _trap_vector();  // defined in trap.S
    }
    let trap_addr = _trap_vector as *const () as usize;
    unsafe {
        asm!("csrw stvec, {}", in(reg) trap_addr);
    }
}
```

> :angrygoose: Order matters. You MUST set `stvec` before enabling any interrupts. If an interrupt fires while `stvec` is still `0x0`, the CPU jumps to address zero — which is either unmapped memory (instant crash) or some I/O device register (chaos). Set the vector first, enable interrupts last.

## The Trap Frame — Saving Everything

When a trap fires, our handler needs to save *every* register before doing anything in Rust. Why? Because the trap interrupted normal code mid-execution. If we clobber register `a0` in our handler, the interrupted code will see a different value when we return. Instant corruption.

We save 31 general-purpose registers (x1-x31, x0 is hardwired zero) plus two CSRs (`sstatus` and `sepc`):

```rust
#[repr(C)]
pub struct TrapFrame {
    pub ra: usize,      // x1
    pub sp: usize,      // x2  (original, before frame allocation)
    pub gp: usize,      // x3
    pub tp: usize,      // x4
    pub t0: usize,      // x5-x7
    pub t1: usize,
    pub t2: usize,
    pub s0: usize,      // x8-x9
    pub s1: usize,
    pub a0: usize,      // x10-x17 (function args)
    pub a1: usize,
    // ... all 31 registers ...
    pub sstatus: usize,  // supervisor status
    pub sepc: usize,     // where to return to
}
```

**Total: 33 fields × 8 bytes = 264 bytes, rounded to 272 for 16-byte alignment.**

> :weightliftingoose: 272 bytes on the stack per trap. Every timer tick, every keypress, every exception allocates and deallocates 272 bytes. On our 126MB stack, that's nothing. But on a microcontroller with 8KB of RAM? You'd optimize this to save only caller-saved registers. For GooseOS, clarity beats optimization at this stage.

## `trap.S` — The Assembly Handler

This is the most critical assembly in the OS after `boot.S`. Every trap — every interrupt, every exception — enters here:

```asm
.balign 4
.global _trap_vector

_trap_vector:
    # Allocate trap frame
    addi    sp, sp, -272

    # Save all 31 GPRs
    sd      x1,   0x00(sp)     # ra
    # ... (29 more stores) ...
    sd      x31,  0xF0(sp)     # t6

    # Save original sp (before frame allocation)
    addi    t0, sp, 272
    sd      t0,   0x08(sp)

    # Save CSRs
    csrr    t0, sstatus
    sd      t0,   0xF8(sp)
    csrr    t0, sepc
    sd      t0,   0x100(sp)

    # Call Rust handler with frame pointer
    mv      a0, sp
    call    trap_handler

    # Restore CSRs
    ld      t0, 0x100(sp)
    csrw    sepc, t0
    ld      t0, 0xF8(sp)
    csrw    sstatus, t0

    # Restore all 31 GPRs
    ld      x1,   0x00(sp)
    # ... (29 more loads) ...
    ld      x31,  0xF0(sp)

    # Deallocate frame
    addi    sp, sp, 272

    # Return from trap
    sret
```

> :angrygoose: `.balign 4` is not optional. `stvec` requires the trap vector address to be **4-byte aligned** (the bottom 2 bits encode the mode: `00` = Direct). If the address isn't aligned, the CPU silently masks off the low bits and jumps to the wrong place. A single missing alignment directive and your trap handler is off by 1-3 bytes — instant garbage execution.

> :nerdygoose: Why save `sstatus`? Because the hardware modifies it on trap entry — specifically, it copies the `SIE` bit to `SPIE` and clears `SIE`. When we `sret`, the hardware restores `SIE` from `SPIE`. If we don't save/restore `sstatus`, nested traps or handler modifications could corrupt the interrupt enable state.

## The Rust Dispatcher

The assembly saves state and calls `trap_handler`. The Rust side reads `scause` to figure out what happened:

```rust
#[no_mangle]
pub extern "C" fn trap_handler(frame: &mut TrapFrame) {
    let scause: usize;
    unsafe { asm!("csrr {}, scause", out(reg) scause); }

    let is_interrupt = scause >> 63 == 1;  // bit 63 distinguishes
    let code = scause & 0x7FFF_FFFF_FFFF_FFFF;

    if is_interrupt {
        match code {
            5 => handle_timer(),
            9 => handle_external(),  // PLIC → UART, etc.
            _ => println!("unhandled interrupt: {}", code),
        }
    } else {
        // Exception — print diagnostics and panic
        println!("!!! EXCEPTION !!!");
        println!("  cause: {} sepc: {:#x}", code, frame.sepc);
        panic!("unrecoverable exception");
    }
}
```

> :surprisedgoose: Bit 63 of `scause` is the key. Same register, same CSR read — but the top bit tells you whether this is an interrupt (async, external) or an exception (sync, caused by the current instruction). The remaining 63 bits identify which specific interrupt or exception. Elegant design by the RISC-V architects.

> :happygoose: Look at how clean the dispatch is in Rust. `match` on the interrupt code, pattern-match with exhaustive handling. Compare this to a C interrupt handler with a chain of `if-else` statements and no compiler-enforced exhaustiveness. Rust's `match` ensures we handle every case — or explicitly ignore it with `_`.

## Branch

```bash
git checkout part-3   # see the code at this point
```
