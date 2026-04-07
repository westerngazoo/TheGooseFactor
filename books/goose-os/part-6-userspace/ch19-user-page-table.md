---
sidebar_position: 2
sidebar_label: "Ch 19: User Page Tables"
title: "Chapter 19: Building the User Page Table — Isolation by Construction"
---

# Chapter 19: Building the User Page Table — Isolation by Construction

The kernel has a page table. The user needs a different one. Same physical hardware, different view of memory. That's the entire point of virtual memory: each process thinks it's alone in the universe, blissfully unaware that it's sharing a 128MB DRAM chip with a kernel that could kill it at any moment.

Heartwarming, really.

## Why a Separate Page Table?

The kernel page table maps everything as S-mode accessible (no U bit). If we ran user code with the kernel's satp, the MMU would fault on every instruction fetch — the user's code page doesn't have the U flag. We need a page table that:

1. **Maps kernel regions without U bit** — so the trap handler works when satp still points here
2. **Maps user code with USER_RX** — readable, executable, user-accessible
3. **Maps user stack with USER_RW** — readable, writable, user-accessible

This is the principle of **least privilege**: the user can see its own code and stack, but the kernel's pages are invisible to it. The kernel can see everything (it's the kernel), but user pages are explicitly marked as user-accessible.

```
Kernel page table:                User page table:
┌─────────────────────┐          ┌─────────────────────┐
│ .text      R+X      │          │ .text      R+X      │ ← same mapping,
│ .rodata    R        │          │ .rodata    R        │   no U bit
│ .data      R+W      │          │ .data      R+W      │
│ heap       R+W      │          │ heap       R+W      │
│ stack      R+W      │          │ stack      R+W      │
│ UART       R+W MMIO │          │ UART       R+W MMIO │
│ PLIC       R+W MMIO │          │ PLIC       R+W MMIO │
│                     │          │                     │
│                     │          │ user code  R+X+U    │ ← user only
│                     │          │ user stack R+W+U    │ ← user only
└─────────────────────┘          └─────────────────────┘
```

> :nerdygoose: "Wait, the kernel regions are in the user page table too?" Yes. When the user does an ecall, the CPU switches to S-mode but does NOT switch satp. The trap handler code must be accessible through the *current* page table — which is the user's. The kernel regions are mapped without the U bit, so user code can't access them, but S-mode can. This is the standard approach. xv6-riscv does it differently with a trampoline page, but that's more complexity for the same result.

## The Process Launcher: `process.rs`

This module does three things:
1. Embeds a user program in the kernel image
2. Copies it to a user-accessible page at boot
3. Drops into U-mode via `sret`

### Imports and Setup

```rust title="src/process.rs"
/// Process management — create and launch userspace processes.
///
/// Part 6: First userspace process.
///
/// This module handles:
///   - Building a user page table (kernel mappings + user pages)
///   - Copying a user program into user memory
///   - Switching to U-mode via sret

use core::arch::{asm, global_asm};
use crate::page_alloc::{BitmapAllocator, PAGE_SIZE};
use crate::page_table::*;
use crate::kvm;
use crate::println;
```

### The Embedded User Program

Our first user program is hand-written RISC-V assembly, embedded directly in the kernel via `global_asm!`. It prints "Honk! GooseOS userspace is alive!" one character at a time via SYS_PUTCHAR, then exits with code 42.

```rust title="src/process.rs — embedded user program"
global_asm!(r#"
.section .text
.balign 4
.global _user_init_start
.global _user_init_end

_user_init_start:
    # ─── GooseOS init process ───
    # Prints "Honk! GooseOS userspace is alive!\n" via SYS_PUTCHAR ecalls.
    # Then exits via SYS_EXIT.
    #
    # Syscall convention:
    #   a7 = syscall number (0=putchar, 1=exit)
    #   a0 = argument (character or exit code)

    li      a7, 0           # SYS_PUTCHAR

    li      a0, 0x48        # 'H'
    ecall
    li      a0, 0x6F        # 'o'
    ecall
    li      a0, 0x6E        # 'n'
    ecall
    li      a0, 0x6B        # 'k'
    ecall
    li      a0, 0x21        # '!'
    ecall
    li      a0, 0x20        # ' '
    ecall
    li      a0, 0x47        # 'G'
    ecall
    li      a0, 0x6F        # 'o'
    ecall
    li      a0, 0x6F        # 'o'
    ecall
    li      a0, 0x73        # 's'
    ecall
    li      a0, 0x65        # 'e'
    ecall
    li      a0, 0x4F        # 'O'
    ecall
    li      a0, 0x53        # 'S'
    ecall
    li      a0, 0x20        # ' '
    ecall
    li      a0, 0x75        # 'u'
    ecall
    li      a0, 0x73        # 's'
    ecall
    li      a0, 0x65        # 'e'
    ecall
    li      a0, 0x72        # 'r'
    ecall
    li      a0, 0x73        # 's'
    ecall
    li      a0, 0x70        # 'p'
    ecall
    li      a0, 0x61        # 'a'
    ecall
    li      a0, 0x63        # 'c'
    ecall
    li      a0, 0x65        # 'e'
    ecall
    li      a0, 0x20        # ' '
    ecall
    li      a0, 0x69        # 'i'
    ecall
    li      a0, 0x73        # 's'
    ecall
    li      a0, 0x20        # ' '
    ecall
    li      a0, 0x61        # 'a'
    ecall
    li      a0, 0x6C        # 'l'
    ecall
    li      a0, 0x69        # 'i'
    ecall
    li      a0, 0x76        # 'v'
    ecall
    li      a0, 0x65        # 'e'
    ecall
    li      a0, 0x21        # '!'
    ecall
    li      a0, 0x0A        # '\n'
    ecall

    # Exit with code 42 (the answer)
    li      a0, 42          # exit code
    li      a7, 1           # SYS_EXIT
    ecall

    # Should never reach here — spin just in case
1:  j       1b

_user_init_end:
"#);
```

> :angrygoose: "You're printing one character per ecall? That's 33 traps for one sentence!" Yes. Each ecall is a full privilege transition: save 31 registers, dispatch syscall, write to UART, restore 31 registers, sret. Approximately 500 cycles per character. A `write(fd, buf, len)` syscall that copies a buffer would be ~100x more efficient. But we don't have buffer copying yet (that needs `copy_from_user` with page table validation), and this version is **dead simple to debug**. If the first character prints, all 33 will. If it doesn't, we know the trap path is broken — not some buffer-length off-by-one.

Why `li a0, 0x48` instead of `li a0, 'H'`? Because the assembler inside `global_asm!` doesn't always handle character literals consistently across toolchains. Hex values are unambiguous. It's ugly, but it works on QEMU and real hardware. Pick your battles.

Why exit code 42? Because it's the answer to life, the universe, and everything. And because it's not 0 (success) or 1 (failure), so if we see 42 in the output, we know the actual exit path ran — not some default value.

## Building the User Page Table

The `launch_init()` function builds everything from scratch:

```rust title="src/process.rs — launch_init()"
/// Create a user page table and launch the first userspace process.
///
/// Steps:
///   1. Allocate user code page + user stack page
///   2. Copy embedded user program to user code page
///   3. Build user page table (kernel mappings + user pages)
///   4. Set up CPU state for U-mode entry
///   5. sret into userspace
pub fn launch_init(alloc: &mut BitmapAllocator) -> ! {
    extern "C" {
        static _user_init_start: u8;
        static _user_init_end: u8;
    }

    let prog_start = unsafe { &_user_init_start as *const u8 as usize };
    let prog_end = unsafe { &_user_init_end as *const u8 as usize };
    let prog_size = prog_end - prog_start;

    println!("  [proc] User program: {:#x} - {:#x} ({} bytes)",
        prog_start, prog_end, prog_size);

    // Allocate user code page
    let user_code_page = kvm::alloc_zeroed_page(alloc);
    println!("  [proc] User code page: {:#010x}", user_code_page);

    // Copy user program to user code page
    unsafe {
        let src = prog_start as *const u8;
        let dst = user_code_page as *mut u8;
        for i in 0..prog_size {
            core::ptr::write_volatile(
                dst.add(i),
                core::ptr::read_volatile(src.add(i)),
            );
        }
    }
```

The user program is compiled into the kernel's `.text` section (KERNEL_RX — no U bit). User code can't execute it from there. So we copy it to a freshly allocated page that will be mapped as USER_RX. Same bytes, different permissions. The original stays in kernel text; the copy lives in user memory.

```rust title="src/process.rs — page table construction"
    // Allocate user stack (one page, 4KB)
    let user_stack_page = kvm::alloc_zeroed_page(alloc);
    let user_sp = user_stack_page + PAGE_SIZE; // stack grows down — start at top
    println!("  [proc] User stack page: {:#010x} (sp = {:#010x})",
        user_stack_page, user_sp);

    // Build user page table
    let user_root = kvm::alloc_zeroed_page(alloc);
    println!("  [proc] User page table root: {:#010x}", user_root);

    // Map kernel regions (without U bit — S-mode accessible only)
    kvm::map_kernel_regions(user_root, alloc);

    // Map user code page as USER_RX (readable + executable + user-accessible)
    kvm::map_range(user_root, user_code_page,
        user_code_page + PAGE_SIZE, USER_RX, alloc);

    // Map user stack page as USER_RW (readable + writable + user-accessible)
    kvm::map_range(user_root, user_stack_page,
        user_stack_page + PAGE_SIZE, USER_RW, alloc);

    let user_satp = make_satp(user_root, 1); // ASID = 1 for first process
    let user_entry = user_code_page;
```

Step by step:

1. **Allocate code page** — zeroed, from the bitmap allocator
2. **Copy user program** — byte-by-byte from kernel `.text` to the new page
3. **Allocate stack page** — one page (4KB), sp starts at the top (stacks grow down)
4. **Allocate root page table** — zeroed (all PTEs invalid = unmapped by default)
5. **Map kernel regions** — `kvm::map_kernel_regions()` reuses the same mapping logic from Part 5, but into the user's root table. No U bit on any kernel page.
6. **Map user code** — USER_RX: readable, executable, **user-accessible**
7. **Map user stack** — USER_RW: readable, writable, **user-accessible**
8. **Build satp value** — Sv39 mode, ASID = 1 (kernel uses ASID 0)

> :sharpgoose: **ASID = 1** for the first process. ASID (Address Space Identifier) lets the TLB cache entries from different page tables simultaneously. When we switch from ASID 0 (kernel) to ASID 1 (process), kernel entries with GLOBAL flag survive in the TLB. Without ASIDs, every satp switch would require a full TLB flush — destroying all cached translations and forcing expensive page walks on every memory access.

### The kvm Helper: `map_kernel_regions`

This function was added to `kvm.rs` to share the kernel mapping logic:

```rust title="src/kvm.rs — map_kernel_regions()"
/// Map all kernel regions into an arbitrary root page table.
///
/// Used by process.rs to build user page tables that include kernel mappings.
/// The kernel regions are mapped WITHOUT the U bit, so user code can't access
/// them — but the kernel trap handler CAN, even when satp points to this table.
pub fn map_kernel_regions(root_phys: usize, alloc: &mut BitmapAllocator) {
    let (text_start, text_end) = linker_range("_text_start", "_text_end");
    let (rodata_start, rodata_end) = linker_range("_rodata_start", "_rodata_end");
    let (data_start, data_end) = linker_range("_data_start", "_data_end");
    let (bss_start, bss_end) = linker_range("_bss_start", "_bss_end");
    let heap_start = linker_symbol("_end");
    let stack_top = linker_symbol("_stack_top");

    map_range(root_phys, text_start, text_end, KERNEL_RX, alloc);
    map_range(root_phys, rodata_start, rodata_end, KERNEL_RO, alloc);
    map_range(root_phys, data_start, data_end, KERNEL_RW, alloc);
    map_range(root_phys, bss_start, bss_end, KERNEL_RW, alloc);
    map_range(root_phys, heap_start, stack_top, KERNEL_RW, alloc);

    // MMIO
    let uart_base = platform::UART_BASE;
    map_range(root_phys, uart_base, uart_base + PAGE_SIZE, KERNEL_MMIO, alloc);
    let plic_base = platform::PLIC_BASE;
    map_range(root_phys, plic_base, plic_base + PLIC_MAP_SIZE, KERNEL_MMIO, alloc);
}
```

Same sections, same flags, different root table. The `map_range` and `walk_or_create` functions from Part 5 are now `pub(crate)` so `process.rs` can use them. The intermediate page table pages (level-1, level-0) are allocated fresh — they're NOT shared with the kernel page table.

> :angrygoose: Why not share intermediate tables? Because if two page tables share a level-1 table, modifying one (adding a user mapping) would affect the other (the kernel's mappings). They'd be aliased — one write, two views. That's a security disaster waiting to happen. Each page table gets its own tree. They happen to map the same physical addresses with the same flags for kernel regions, but the tree structure is independent.

## The Page Budget

On the VisionFive 2 (build 12), the user page table costs:

```
Kernel page table:  69 pages (276 KB)
User page table:    ~71 pages (284 KB)   ← kernel regions + 2 user pages
────────────────────────────────────────
Total:              ~140 pages (560 KB)
Free:               32,092 pages (125 MB)
```

Each process costs ~71 pages of overhead for its page table structure. That's the price of isolation. With 32,000 free pages, we could run ~450 processes before running out of page table memory alone. In practice, each process also needs code and stack pages, so the real limit is lower — but for a 128MB embedded system, that's plenty.

## What We Changed

| File | Change |
|------|--------|
| `src/process.rs` | **New** — user program, page table builder, launch function |
| `src/kvm.rs` | Added `map_kernel_regions()`, made map helpers `pub(crate)` |
| `src/main.rs` | Added `mod process`, wired Phase 9 into boot sequence |
