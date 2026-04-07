---
sidebar_position: 3
sidebar_label: "Ch 20: Dropping to Userspace"
title: "Chapter 20: Dropping to Userspace — sret, the Point of No Return"
---

# Chapter 20: Dropping to Userspace — sret, the Point of No Return

Everything is ready. The page table is built. The trap vector handles ecalls. The user program is copied to its page. Now we do the thing that transforms GooseOS from a bare-metal program into an operating system.

We execute `sret` and drop to U-mode.

If `csrw satp` was the scariest instruction in Part 5, `sret` is the most *irreversible*. After it executes, the kernel is no longer in control. A user program is running. It might behave. It might not. The MMU and trap handler are the only things standing between a misbehaving process and total system corruption.

No pressure.

## Setting Up the CSRs

Before `sret`, we need five CSRs configured precisely:

| CSR | Value | Why |
|-----|-------|-----|
| `sepc` | User entry point | sret jumps here |
| `sstatus.SPP` | 0 | sret goes to U-mode (not S-mode) |
| `sstatus.SPIE` | 1 | Enable interrupts after sret |
| `sscratch` | Kernel stack pointer | Trap entry will swap it with user sp |
| `satp` | User page table | Must be active before sret |

Getting any of these wrong produces a different flavor of disaster:

- **Wrong sepc**: CPU jumps to garbage address, instruction page fault, kernel panic
- **SPP = 1 instead of 0**: sret goes to S-mode, not U-mode. User code runs with kernel privileges. Congratulations, you've built a rootkit launcher.
- **SPIE = 0**: Interrupts stay disabled after sret. Timer stops ticking, UART stops responding. The system appears frozen. You'll spend three hours debugging before realizing it's a one-bit problem.
- **Wrong sscratch**: First trap from U-mode swaps sp with sscratch. If sscratch isn't the kernel stack, you save state to random memory. Corruption, crash, power cycle.
- **Wrong satp**: User code page isn't mapped, instruction fetch faults on the first instruction.

> :angrygoose: Five CSRs. Five ways to die. And they all produce the same symptom: "nothing happens after sret." No error message, no blinking LED, no last words. Just silence. OS debugging is the art of distinguishing between 47 different causes of "nothing happened." The only sane approach is to get each CSR right independently and test incrementally. Which is exactly what we did.

## The Launch Code

Here's the complete `sret` sequence, the last code that runs in S-mode before userspace takes over:

```rust title="src/process.rs — the sret sequence"
    println!("  [proc] Launching init process...");
    println!();

    // ── Switch to U-mode ───────────────────────────────────────
    //
    // Set up CSRs:
    //   sepc = user entry point (sret jumps here)
    //   sstatus.SPP = 0 (sret goes to U-mode, not S-mode)
    //   sstatus.SPIE = 1 (enable interrupts after sret)
    //   sscratch = kernel stack pointer (trap entry will swap it)
    //   satp = user page table
    //
    // Then sret: CPU drops to U-mode at sepc with interrupts enabled.

    unsafe {
        asm!(
            // Set sepc = user entry point
            "csrw sepc, {entry}",

            // Read sstatus, clear SPP (bit 8), set SPIE (bit 5)
            "csrr t0, sstatus",
            "li t1, -257",          // ~(1 << 8) = -257 in two's complement
            "and t0, t0, t1",       // clear SPP
            "ori t0, t0, 32",       // set SPIE (bit 5 = 32)
            "csrw sstatus, t0",

            // Save kernel sp in sscratch (trap vector will swap it)
            "csrw sscratch, sp",

            // Switch to user page table
            "csrw satp, {satp}",
            "sfence.vma zero, zero",

            // Set user stack pointer
            "mv sp, {user_sp}",

            // Jump to userspace!
            "sret",

            entry = in(reg) user_entry,
            satp = in(reg) user_satp,
            user_sp = in(reg) user_sp,
            options(noreturn),
        );
    }
```

Let's trace this instruction by instruction:

**`csrw sepc, {entry}`** — Sets the return address. When `sret` executes, the CPU jumps to whatever address is in `sepc`. For us, that's the start of the user code page.

**`csrr t0, sstatus`** — Read current sstatus into t0. We modify it in-place.

**`li t1, -257`** / **`and t0, t0, t1`** — Clear bit 8 (SPP). -257 in two's complement is `0xFFFF...FEFF` — all bits set except bit 8. AND-ing with this clears SPP while preserving everything else. Why not `andi`? Because RISC-V `andi` only takes a 12-bit immediate, and `~(1<<8)` doesn't fit.

**`ori t0, t0, 32`** — Set bit 5 (SPIE). When `sret` executes, SPIE's value gets copied to SIE (the interrupt enable bit). Setting SPIE = 1 means interrupts will be enabled after the transition. If we left it at 0, the user program would run with interrupts disabled — timer ticks stop, UART interrupts stop, the system goes deaf.

**`csrw sstatus, t0`** — Write the modified sstatus back.

**`csrw sscratch, sp`** — Save the current (kernel) stack pointer. When a trap happens from U-mode, `trap.S` will do `csrrw sp, sscratch, sp` to get this kernel sp back. Without this, the trap handler would try to save state on the user's stack — and the user controls that memory.

**`csrw satp, {satp}`** / **`sfence.vma`** — Switch to the user's page table. The TLB flush ensures all subsequent memory accesses use the new translations. From this point on, user pages (USER_RX, USER_RW) are accessible from U-mode.

**`mv sp, {user_sp}`** — Set the stack pointer to the top of the user stack page. The user program can now push and pop. (Our current program doesn't use the stack, but it will once we have function calls.)

**`sret`** — The moment of truth. The CPU:
1. Copies SPIE → SIE (enables interrupts)
2. Sets privilege to SPP (0 = U-mode)
3. Clears SPP
4. Jumps to sepc

After this instruction, we're in **userspace**. The kernel is gone. The user program is running. The only way back is `ecall` or a trap.

> :surprisedgoose: `options(noreturn)` tells the Rust compiler that this inline assembly never returns. The function's return type is `-> !` (the "never" type). Without `noreturn`, the compiler would generate epilogue code after the `sret` — code that would never execute but would confuse the linker about stack frame layout. The `noreturn` option says "trust me, execution stops here." And it does — by jumping to a completely different privilege level.

## Wiring Into the Boot Sequence

In `main.rs`, Phase 9 calls `launch_init()` instead of entering the idle loop:

```rust title="src/main.rs — Phase 9"
        // === Phase 9: Launch first userspace process ===
        // This never returns — after the process exits, control goes
        // to post_process_exit() via the ecall handler.
        process::launch_init(&mut page_alloc);
```

The boot sequence is now:

```
Phase 1: UART init (polling)
Phase 2: Trap vector setup
Phase 3: PLIC configuration
Phase 4: UART RX interrupts
Phase 5: Timer arm
Phase 6: Interrupts enable
Phase 7: Page allocator init + self-test
Phase 8: Kernel page table + MMU enable
Phase 9: Build user page table + launch init process  ← NEW
         └──► User process runs
         └──► ecall(SYS_EXIT) → post_process_exit() → idle loop
```

## Boot Output

QEMU (build 12):

```
          __
       __( o)>     GooseOS v0.1.0 build 12
      \  _/        RISC-V 64-bit
       \\\         Written in Rust
        \\\        Platform: QEMU virt
         \   )_    Honk.
      ~~~^~~~~

  Booted on hart 0
  DTB address:   0x87e00000
  Kernel entry:  0x80202ebc

  [trap] stvec set to 0x8020016c
  [plic] UART0 (IRQ 10) enabled, context=1, threshold=0
  [uart] RX interrupts enabled
  [trap] timer armed (1s interval, timebase=10MHz)
  [trap] interrupts enabled (SEIE + STIE)
  [page_alloc] self-test passed (32232 pages, 125MB)
  [kvm] Building kernel page table...
    .text   0x80200000 - 0x8020429c (R+X)
    .rodata 0x80205000 - 0x80206448 (R  )
    .data   0x80207000 - 0x80207000 (R+W)
    .bss    0x80207000 - 0x80207010 (R+W)
    heap    0x80208000 - 0x87ff0000 (R+W)
    stack   0x87ff0000 - 0x88000000 (R+W)
    UART    0x10000000 - 0x10001000 (R+W, MMIO)
    PLIC    0x0c000000 - 0x0c400000 (R+W, MMIO)
  [kvm] Kernel page table at 0x80208000
  [kvm] Enabling Sv39 MMU (satp = 0x8000000000080208)...
  [kvm] MMU enabled — Sv39 active!
  [page_alloc] 69 pages used for page tables, 32163 free

  [proc] User program: 0x80200050 - 0x8020016c (284 bytes)
  [proc] User code page: 0x8024d000
  [proc] User stack page: 0x8024e000 (sp = 0x8024f000)
  [proc] User page table root: 0x8024f000
  [proc] User satp: 0x800010000008024f
  [proc] User entry: 0x8024d000
  [proc] Launching init process...

  [page_alloc] 140 pages used, 32092 free

Honk! GooseOS userspace is alive!

  [kernel] Process exited with code 42
  [kernel] Back in S-mode. Idle loop active.

  (Ctrl-A X to exit QEMU)
```

Read that output carefully. Every line tells a story:

- **284 bytes** — the entire user program is 71 instructions (67 ecalls + 4 setup/exit)
- **User code page at 0x8024d000** — deep in the heap region, freshly allocated
- **User satp: 0x800010000008024f** — mode 8 (Sv39), ASID 1, root at 0x8024f000
- **140 pages used** — 69 for kernel page table + ~71 for user page table
- **"Honk! GooseOS userspace is alive!"** — printed from U-mode, one ecall per character
- **Exited with code 42** — the user program chose to exit. The kernel didn't kill it.
- **Back in S-mode** — the kernel survived. Clean transition, clean recovery.

> :happygoose: That's it. GooseOS has userspace. Code running in U-mode, isolated by page tables, communicating with the kernel through a controlled syscall interface. Every `ecall` crosses the privilege boundary. Every `sret` drops back. The microkernel's beating heart: controlled transitions between privilege levels.

## What We Proved

This chapter demonstrates six properties:

1. **U-mode execution works** — the CPU actually runs in unprivileged mode
2. **Page table isolation works** — user code runs with the user satp, kernel pages invisible
3. **ecall trap path works** — U-mode → S-mode transition, register save/restore
4. **Syscall dispatch works** — kernel reads a7, does work, returns result in a0
5. **SYS_EXIT recovery works** — process dies, kernel reclaims control cleanly
6. **sscratch convention works** — S-mode traps (timer) still fire during U-mode execution

That last one is subtle. While the user program is running (U-mode, user satp), the timer still ticks. Timer interrupts trap into S-mode through the same `_trap_vector`. The sscratch swap gives us the kernel stack. The timer handler runs. The restore path returns to U-mode. All transparent to the user program. Preemption works — we just don't use it for scheduling yet.

## What We Changed

| File | Change |
|------|--------|
| `src/process.rs` | **New** — user program, page table builder, sret launch sequence |
| `src/trap.S` | **Rewritten** — sscratch swap, U-mode/S-mode dual restore paths |
| `src/trap.rs` | Added ecall handler, SYS_PUTCHAR, SYS_EXIT, post_process_exit |
| `src/kvm.rs` | Added kernel_satp() global, map_kernel_regions(), pub(crate) helpers |
| `src/main.rs` | Added `mod process`, Phase 9: launch_init() replaces idle loop |

## The Full Journey So Far

```
Part 1:  Boot          → RISC-V boots, prints "Hello"
Part 2:  Console       → UART driver, println!() macro
Part 3:  Interrupts    → Trap vector, PLIC, timer ticks
Part 4:  Real Hardware → VisionFive 2, deploy pipeline, SBI reset
Part 5:  Virtual Memory → Page allocator, Sv39, identity map, MMU enable
Part 6:  Userspace     → U-mode process, ecall syscalls, isolation  ← YOU ARE HERE
```

## What's Next

The init process runs, prints, and exits. That's a proof of concept. The next steps make it a real system:

- **Part 7: IPC** — `SYS_SEND` / `SYS_RECEIVE` / `SYS_CALL`. Processes talk to each other. The UART driver moves to userspace.
- **Part 8: Scheduling** — Multiple processes, time slicing, context switch. The `SYS_YIELD` and preemptive scheduling.
- **Part 9: Memory capabilities** — `SYS_GRANT` for MMIO access. Userspace device drivers get hardware access without kernel involvement.

The microkernel isn't an architecture yet. It's a syscall interface with two entries. But every microkernel started exactly here: one process, one trap, one message at a time.

```bash
git checkout part-6   # (when it exists)
```
