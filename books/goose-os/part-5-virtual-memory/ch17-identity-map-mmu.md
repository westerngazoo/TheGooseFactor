---
sidebar_position: 4
sidebar_label: "Ch 17: Identity Map + MMU"
title: "Chapter 17: Building the Identity Map and Enabling the MMU"
---

# Chapter 17: Building the Identity Map and Enabling the MMU

The data structures are ready. The page allocator works. Now we connect them to real hardware — build a three-level Sv39 page table, identity-map the kernel, and flip the switch.

`csrw satp` is one instruction. If the page tables are wrong, that one instruction kills the CPU — the next instruction fetch faults, the trap handler address isn't mapped, the trap handler faults, infinite loop, hard lock. No error message, no recovery, power cycle.

Get it right the first time.

## What We're Mapping

Identity map means virtual address equals physical address. The kernel's code, data, and MMIO stay at the same addresses — the MMU only adds *protection* (W^X, no U-mode access to kernel pages).

```
Region         Address Range                  Permissions   Why
─────────────────────────────────────────────────────────────────
.text          0x_0200000 - 0x_020378a        R+X           Immutable code
.rodata        0x_0204000 - 0x_0205258        R             Immutable data
.data          0x_0206000 - 0x_0206000        R+W           Mutable data
.bss           0x_0206000 - 0x_0206008        R+W           Zero-init data
Heap/free      0x_0207000 - 0x_7FF0000        R+W           Page allocator pool
Stack          0x_7FF0000 - 0x_8000000        R+W           64KB kernel stack
UART           0x10000000 - 0x10001000        R+W MMIO      Serial console
PLIC           0x0C000000 - 0x0C400000        R+W MMIO      Interrupt controller
```

*(Addresses shown without DRAM base prefix for clarity — QEMU adds `0x8000_0000`, VF2 adds `0x4000_0000`)*

### Why Identity Map?

Two options when enabling the MMU for the first time:

1. **Identity map**: virtual = physical. Code keeps running at the same addresses. Safe, simple.
2. **Higher-half kernel**: remap kernel to `0xFFFF_FFC0_0000_0000+`. The "real OS" approach. Dangerous at first enable — you must set up the new mapping AND jump to the new addresses in one atomic operation.

We identity-map because it's the safe path. The kernel runs identically before and after MMU enable — no address changes, no jumps. We can remap to higher-half later if needed, but for learning Sv39, identity map removes a huge source of bugs.

> :angrygoose: Higher-half kernels are not "better" — they're a convention that separates kernel and user virtual address spaces cleanly. Linux puts the kernel at the top of the address space so user processes get a contiguous lower region. But the MMU doesn't care — protection comes from PTE flags, not from address placement. Identity mapping with correct flags gives us the same protection with less complexity.

## The Complete Module: `kvm.rs`

The kernel virtual memory module is deliberately thin. It reads linker symbols, calls the page allocator, and writes PTEs. All the interesting logic lives in `page_alloc.rs` (tested) and `page_table.rs` (tested). `kvm.rs` is just plumbing — but it's the plumbing that makes the MMU work.

### Module Header and Imports

```rust title="src/kvm.rs"
/// Kernel Virtual Memory — builds the identity-mapped Sv39 page table.
///
/// This module is the ONLY place that writes to page table memory.
/// All page table data structures live in page_table.rs (pure, testable).
/// All page allocation lives in page_alloc.rs (pure, testable).
/// This module is the glue: it reads linker symbols, allocates pages,
/// and writes PTEs into physical memory.
///
/// Design constraints (formal verification path):
///   - The kernel page table is built ONCE at boot and NEVER modified
///   - After init() returns, no kernel PTE is ever written again
///   - This is the "identity element" — frozen, immutable, provably correct
///   - User page tables (Part 6+) are dynamic and live elsewhere

use crate::page_alloc::{BitmapAllocator, PAGE_SIZE};
use crate::page_table::*;
use crate::platform;
use core::ptr;

/// PLIC spans 0x0C00_0000 to 0x0FFF_FFFF (64MB, but we only need the active region).
/// Map 4MB to cover priority, pending, enable, and threshold/claim registers.
const PLIC_MAP_SIZE: usize = 4 * 1024 * 1024; // 4MB = 1024 pages
```

### The Init Function

This is the entry point. It reads every linker symbol, allocates the root page table, and maps every kernel region:

```rust title="src/kvm.rs (continued)"
/// Build the kernel identity-mapped page table.
///
/// Returns the physical address of the root page table (for satp).
///
/// Identity map means: virtual address == physical address.
/// The kernel runs at the same addresses before and after MMU enable.
/// The MMU only adds protection — no writing .text, no executing .data.
///
/// Memory mapped (all identity-mapped):
///   .text      → R+X (immutable code)
///   .rodata    → R   (immutable data)
///   .data+.bss → R+W (mutable data)
///   stack      → R+W
///   free pages → R+W (page allocator region)
///   UART MMIO  → R+W (temporary — moves to userspace in Part 8)
///   PLIC MMIO  → R+W (stays in kernel — interrupt dispatch)
pub fn init(alloc: &mut BitmapAllocator) -> usize {
    // Read linker-script section boundaries
    let (text_start, text_end) = linker_range("_text_start", "_text_end");
    let (rodata_start, rodata_end) = linker_range("_rodata_start", "_rodata_end");
    let (data_start, data_end) = linker_range("_data_start", "_data_end");
    let (bss_start, bss_end) = linker_range("_bss_start", "_bss_end");
    let heap_start = linker_symbol("_end");
    let heap_end = linker_symbol("_heap_end");
    let stack_top = linker_symbol("_stack_top");

    // Allocate root page table (level 2)
    let root_phys = alloc_zeroed_page(alloc);

    crate::println!("  [kvm] Building kernel page table...");
    crate::println!("    .text   {:#010x} - {:#010x} (R+X)", text_start, text_end);
    crate::println!("    .rodata {:#010x} - {:#010x} (R  )", rodata_start, rodata_end);
    crate::println!("    .data   {:#010x} - {:#010x} (R+W)", data_start, data_end);
    crate::println!("    .bss    {:#010x} - {:#010x} (R+W)", bss_start, bss_end);
    crate::println!("    heap    {:#010x} - {:#010x} (R+W)", heap_start, heap_end);
    crate::println!("    stack   {:#010x} - {:#010x} (R+W)", heap_end, stack_top);

    // Map kernel sections with proper permissions (W^X enforced)
    map_range(root_phys, text_start, text_end, KERNEL_RX, alloc);
    map_range(root_phys, rodata_start, rodata_end, KERNEL_RO, alloc);
    map_range(root_phys, data_start, data_end, KERNEL_RW, alloc);
    map_range(root_phys, bss_start, bss_end, KERNEL_RW, alloc);

    // Map free page region (heap) + stack
    map_range(root_phys, heap_start, stack_top, KERNEL_RW, alloc);

    // Map UART MMIO (one page, temporary — will move to userspace)
    let uart_base = platform::UART_BASE;
    map_range(root_phys, uart_base, uart_base + PAGE_SIZE, KERNEL_MMIO, alloc);
    crate::println!("    UART    {:#010x} - {:#010x} (R+W, MMIO)",
        uart_base, uart_base + PAGE_SIZE);

    // Map PLIC MMIO (4MB covers all PLIC registers)
    let plic_base = platform::PLIC_BASE;
    map_range(root_phys, plic_base, plic_base + PLIC_MAP_SIZE, KERNEL_MMIO, alloc);
    crate::println!("    PLIC    {:#010x} - {:#010x} (R+W, MMIO)",
        plic_base, plic_base + PLIC_MAP_SIZE);

    crate::println!("  [kvm] Kernel page table at {:#010x}", root_phys);

    root_phys
}
```

The function returns the root page table's physical address — the value we'll write to `satp`.

### Design Constraint: Write Once

After `init()` returns, the kernel page table is **never modified**. No PTE is ever written again. This is a deliberate design decision for the microkernel path:

- The kernel page table is the **identity element** — frozen, immutable, provably correct
- User page tables (Part 6+) are dynamic — created, modified, destroyed per process
- The kernel itself has no mutable page table state after boot

This separation is critical for formal verification: proving "the kernel page table never changes" is simple (no writes after init). Proving "the kernel page table is always correct" in the presence of ongoing mutations is hard.

> :weightliftinggoose: Think of it like the difference between proving a `const` is correct versus proving a mutable variable is always correct. A `const` is checked once. A mutable variable needs an invariant that holds across every possible mutation. We made our kernel page table `const` by construction.

## The Three-Level Walk

For each page we want to map, we walk (or create) the three-level table. Here are the internal helpers:

### map_range and map_page

```rust title="src/kvm.rs — internal helpers"
/// Identity-map a range of physical pages into the root page table.
///
/// `start` and `end` are physical addresses. Both are rounded to page boundaries.
/// Each page in the range gets a leaf PTE with the given flags.
///
/// For each page, we walk/create the 3-level table:
///   root[vpn2] → level1[vpn1] → level0[vpn0] = leaf PTE
fn map_range(
    root_phys: usize,
    start: usize,
    end: usize,
    flags: PteFlags,
    alloc: &mut BitmapAllocator,
) {
    // Round start down, end up to page boundaries
    let start_aligned = start & !(PAGE_SIZE - 1);
    let end_aligned = (end + PAGE_SIZE - 1) & !(PAGE_SIZE - 1);

    let mut addr = start_aligned;
    while addr < end_aligned {
        map_page(root_phys, addr, addr, flags, alloc);
        addr += PAGE_SIZE;
    }
}

/// Map a single virtual page to a physical page in the 3-level Sv39 table.
///
/// Walks root → level1 → level0, allocating intermediate tables as needed.
fn map_page(
    root_phys: usize,
    va: usize,
    pa: usize,
    flags: PteFlags,
    alloc: &mut BitmapAllocator,
) {
    let (vpn2, vpn1, vpn0, _) = va_parts(va);

    // Level 2 (root): get or create level-1 table
    let level1_phys = walk_or_create(root_phys, vpn2, alloc);

    // Level 1: get or create level-0 table
    let level0_phys = walk_or_create(level1_phys, vpn1, alloc);

    // Level 0 (leaf): write the final PTE
    let pte = Pte::new(pa, flags);
    write_pte(level0_phys, vpn0, pte);
}
```

Note `map_page` takes both `va` and `pa` as separate parameters. For identity mapping they're always equal (`map_range` passes `addr, addr`), but the function is general — when we build user page tables in Part 6, `va` and `pa` will differ.

### walk_or_create

This is the heart of the table walk — it handles intermediate (branch) levels:

```rust title="src/kvm.rs (continued)"
/// Read PTE at `table_phys + index * 8`. If it's a valid branch, return the
/// child table address. If invalid, allocate a new table and install a branch PTE.
fn walk_or_create(table_phys: usize, index: usize, alloc: &mut BitmapAllocator) -> usize {
    let existing = read_pte(table_phys, index);

    if existing.is_valid() {
        // Already have an intermediate table — return its address
        assert!(existing.is_branch(),
            "walk_or_create: expected branch PTE at index {}, got leaf", index);
        existing.phys_addr()
    } else {
        // Allocate a new page table page (zeroed = all entries invalid)
        let new_table = alloc_zeroed_page(alloc);
        let branch = Pte::branch(new_table);
        write_pte(table_phys, index, branch);
        new_table
    }
}
```

Zeroing is critical: a zero PTE has V=0 (invalid). Any uninitialized entry defaults to "not mapped" — accessing it triggers a page fault. This is safe by construction.

> :sharpgoose: The assert on `is_branch()` catches a subtle bug: if two mappings accidentally overlap, a leaf PTE from one mapping could be at an index where another mapping expects a branch. The assert fires immediately rather than silently corrupting page table structure. Fail fast, fail loud.

### PTE Read/Write and Page Allocation

```rust title="src/kvm.rs (continued)"
/// Read a PTE from a page table page.
fn read_pte(table_phys: usize, index: usize) -> Pte {
    assert!(index < PT_ENTRIES, "PTE index out of range: {}", index);
    let addr = table_phys + index * 8;
    let bits = unsafe { ptr::read_volatile(addr as *const u64) };
    Pte::new_from_bits(bits)
}

/// Write a PTE to a page table page.
fn write_pte(table_phys: usize, index: usize, pte: Pte) {
    assert!(index < PT_ENTRIES, "PTE index out of range: {}", index);
    let addr = table_phys + index * 8;
    unsafe { ptr::write_volatile(addr as *mut u64, pte.bits()); }
}

/// Allocate a zeroed page from the allocator.
fn alloc_zeroed_page(alloc: &mut BitmapAllocator) -> usize {
    let page = alloc.alloc().expect("kvm: out of memory for page tables");
    unsafe { BitmapAllocator::zero_page(page); }
    page
}
```

`read_volatile` and `write_volatile` prevent the compiler from reordering or optimizing away memory accesses. This matters because we're writing to physical memory that the CPU will interpret as page table structures — the compiler doesn't know these are hardware-visible.

### Linker Symbol Accessors

```rust title="src/kvm.rs (continued)"
/// Read a linker symbol as a usize address.
///
/// Linker symbols don't have values in the traditional sense — their ADDRESS
/// is the value. We take the address of the extern static to get it.
fn linker_symbol(name: &str) -> usize {
    extern "C" {
        static _text_start: u8;
        static _text_end: u8;
        static _rodata_start: u8;
        static _rodata_end: u8;
        static _data_start: u8;
        static _data_end: u8;
        static _bss_start: u8;
        static _bss_end: u8;
        static _end: u8;
        static _heap_end: u8;
        static _stack_top: u8;
    }

    unsafe {
        match name {
            "_text_start"   => &_text_start as *const u8 as usize,
            "_text_end"     => &_text_end as *const u8 as usize,
            "_rodata_start" => &_rodata_start as *const u8 as usize,
            "_rodata_end"   => &_rodata_end as *const u8 as usize,
            "_data_start"   => &_data_start as *const u8 as usize,
            "_data_end"     => &_data_end as *const u8 as usize,
            "_bss_start"    => &_bss_start as *const u8 as usize,
            "_bss_end"      => &_bss_end as *const u8 as usize,
            "_end"          => &_end as *const u8 as usize,
            "_heap_end"     => &_heap_end as *const u8 as usize,
            "_stack_top"    => &_stack_top as *const u8 as usize,
            _ => panic!("unknown linker symbol: {}", name),
        }
    }
}

/// Get a (start, end) range from two linker symbols.
fn linker_range(start_name: &str, end_name: &str) -> (usize, usize) {
    let s = linker_symbol(start_name);
    let e = linker_symbol(end_name);
    assert!(e >= s, "linker range {}-{} is inverted: {:#x} > {:#x}",
        start_name, end_name, s, e);
    (s, e)
}
```

The `linker_symbol()` function uses string matching because Rust doesn't have a way to parametrically reference `extern` statics. Each symbol is declared as `extern "C" { static _name: u8; }` — we don't care about the `u8` type, we only care about the *address* of the symbol. The `&_name as *const u8 as usize` idiom extracts the address the linker assigned.

The `linker_range()` helper adds a safety check: if the start is after the end, the linker script has a bug. We catch it immediately rather than mapping billions of pages in the wrong direction.

## The Scariest Instruction

```rust title="src/kvm.rs (continued)"
/// Enable the MMU by writing the satp CSR.
///
/// THIS IS THE SCARIEST INSTRUCTION IN OS DEVELOPMENT.
///
/// After `csrw satp`, every instruction fetch, load, and store goes through
/// the page tables. If ANY needed address is not mapped — the next instruction
/// fetch faults, the trap handler faults, infinite loop, hard lock.
///
/// Prerequisites:
///   - All kernel code/data/stack is identity-mapped
///   - UART is mapped (so we can print after enable)
///   - PLIC is mapped (so interrupts still work)
///   - Trap vector is mapped (so exceptions are catchable)
///
/// # Safety
/// Caller must ensure the root page table at `root_phys` has valid identity
/// mappings for all memory the kernel will access after this call.
pub unsafe fn enable_mmu(root_phys: usize) {
    let satp_val = make_satp(root_phys, 0);

    crate::println!("  [kvm] Enabling Sv39 MMU (satp = {:#018x})...", satp_val);

    core::arch::asm!(
        // Write satp — MMU is now ON
        "csrw satp, {0}",
        // Fence to ensure all subsequent accesses use new page tables
        "sfence.vma zero, zero",
        in(reg) satp_val,
    );

    // If we reach here, we survived. The MMU is active.
    crate::println!("  [kvm] MMU enabled — Sv39 active!");
}
```

Two instructions:

1. **`csrw satp, reg`** — writes the satp CSR. From this point forward, every memory access goes through the page tables. The *next instruction fetch* after this one uses virtual addresses translated by our page table. If the instruction we're executing isn't mapped, we die.

2. **`sfence.vma zero, zero`** — flushes the entire TLB (Translation Lookaside Buffer). The TLB caches recent translations. Without the fence, the CPU might use a stale (pre-MMU) cached translation and bypass our page tables. `zero, zero` means "flush everything, all ASIDs."

> :surprisedgoose: Why does this work with identity mapping? Because the instruction *after* `csrw satp` is at a physical address that's identity-mapped to the same virtual address. The CPU fetches the next instruction at virtual address X, the page table maps X → X (identity), and the fetch succeeds. If we'd remapped the kernel to a different virtual address, we'd need to be executing from a trampoline page that's mapped in both the old and new address spaces — dramatically more complex.

## Wiring It Into `main.rs`

The kernel boot sequence calls `kvm::init()` and `kvm::enable_mmu()` as Phase 8:

```rust title="src/main.rs — boot sequence (relevant excerpt)"
// When running `cargo test`, use host std library.
// When building for RISC-V, use no_std/no_main.
#![cfg_attr(not(test), no_std)]
#![cfg_attr(not(test), no_main)]

#[cfg(not(test))]
mod console;
#[cfg(not(test))]
mod platform;
#[cfg(not(test))]
mod plic;
#[cfg(not(test))]
mod trap;
#[cfg(not(test))]
mod uart;

mod page_alloc;
#[allow(dead_code)]
mod page_table;
#[cfg(not(test))]
mod kvm;
```

Note the `#[cfg(not(test))]` gates: `page_alloc` and `page_table` are available to both RISC-V and host test builds (they're pure logic). But `kvm`, `uart`, `trap`, etc. only compile for the RISC-V target — they touch hardware.

Inside `kmain`:

```rust title="src/main.rs — Phase 7 & 8"
        // === Phase 7: Initialize page allocator ===
        let mut page_alloc = page_alloc::init_from_linker();
        page_alloc::self_test(&mut page_alloc);

        // === Phase 8: Build kernel page table + enable MMU ===
        let root_pt = kvm::init(&mut page_alloc);
        unsafe { kvm::enable_mmu(root_pt); }

        println!("  [page_alloc] {} pages used for page tables, {} free",
            page_alloc.allocated_count(), page_alloc.free_count());
```

The flow is:
1. `init_from_linker()` reads `_end` and `_heap_end`, creates the bitmap allocator
2. `self_test()` verifies 7 invariants on the real hardware, panics if any fail
3. `kvm::init()` builds the full identity map, returns the root page table address
4. `enable_mmu()` writes `satp` and flushes the TLB
5. If we reach the `println!` after `enable_mmu()`, the MMU is working

## Boot Output

On the VisionFive 2 (build 11):

```
[page_alloc] self-test passed (32233 pages, 125MB)
[kvm] Building kernel page table...
  .text   0x40200000 - 0x4020378a (R+X)
  .rodata 0x40204000 - 0x40205258 (R  )
  .data   0x40206000 - 0x40206000 (R+W)
  .bss    0x40206000 - 0x40206008 (R+W)
  heap    0x40207000 - 0x47ff0000 (R+W)
  stack   0x47ff0000 - 0x48000000 (R+W)
  UART    0x10000000 - 0x10001000 (R+W, MMIO)
  PLIC    0x0c000000 - 0x0c400000 (R+W, MMIO)
[kvm] Kernel page table at 0x40207000
[kvm] Enabling Sv39 MMU (satp = 0x8000000000040207)...
[kvm] MMU enabled — Sv39 active!
[page_alloc] 69 pages used for page tables, 32164 free
```

69 pages (276KB) for the entire page table structure. The kernel image itself is ~21KB. The page tables are 13x larger than the kernel they map — that's the cost of 4KB-granularity protection over 125MB of RAM. With megapages (2MB granularity), we'd need only 3-4 pages, but we'd lose fine-grained W^X enforcement.

## MMIO Mapping Strategy

Two MMIO regions are mapped into the kernel:

| Device | Pages | Stays in Kernel? | Why |
|--------|-------|-----------------|-----|
| **UART** | 1 page (4KB) | **No** — moves to userspace in Part 8 | Will become a userspace driver service |
| **PLIC** | 1024 pages (4MB) | **Yes** — kernel-only | Interrupt routing is a kernel responsibility |

In a microkernel, device drivers run in userspace. The UART mapping in the kernel is scaffolding — temporary until we build the UART server process. The PLIC stays because the kernel must claim/complete interrupts before dispatching them to the correct driver via IPC.

When we add a new device (SPI, I2C, Ethernet), we don't modify the kernel page table. Instead, the kernel maps the device's MMIO region into the driver process's userspace page table — a capability grant. The kernel doesn't know what the device *is*; it just controls who can access which physical addresses.

> :happygoose: This is the microkernel insight: **MMIO mappings are capabilities**. The kernel grants access to physical memory regions. The driver does the actual I/O. Adding a new driver is a userspace-only change — no kernel modification, no kernel recompile, no kernel reboot.

## What We Changed

| File | Change |
|------|--------|
| `linker.ld` | Added `_text_start/end`, `_rodata_start/end`, `_data_start/end` section symbols |
| `linker-vf2.ld` | Same section symbols |
| `src/page_table.rs` | Added `Pte::new_from_bits()` for reading PTEs back from memory |
| `src/kvm.rs` | **New** — identity map builder, MMU enable, linker symbol reader |
| `src/main.rs` | Added Phase 8: `kvm::init()` + `kvm::enable_mmu()` |

## What's Next

The MMU is on. The kernel has memory protection. The foundation for isolation is in place.

Part 6 creates the first **userspace process** — code running in U-mode with its own page table, communicating with the kernel via `ecall`. That's the moment GooseOS stops being a bare-metal program and becomes an operating system.

```bash
git checkout part-5   # (when it exists)
```
