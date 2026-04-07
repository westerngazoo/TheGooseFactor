---
sidebar_position: 2
sidebar_label: "Ch 15: Page Allocator"
title: "Chapter 15: A Bitmap Page Allocator"
---

# Chapter 15: A Bitmap Page Allocator

Before we can create page tables, we need to answer a basic question: where do the page table pages come from? The Sv39 three-level structure requires at least 3 physical pages just for the tables themselves, plus more for every range we map. We need a **physical page allocator** — a data structure that tracks which 4KB pages of RAM are free and hands them out on request.

## Choosing the Right Allocator

There are three common approaches:

| Allocator | How It Works | Alloc/Free | Formally Verifiable? |
|---|---|---|---|
| **Bump** | Keep a pointer, advance by 4KB. Never free. | O(1) / impossible | Trivial — monotonic counter |
| **Linked list** | Free pages form a chain. Pop head to alloc, push head to free. | O(1) / O(1) | Hard — pointer chains, aliasing, cycles |
| **Bitmap** | One bit per page. Set bit = allocated. Clear bit = free. | O(n) / O(1) | **Easy — state is a bitvector** |

We chose **bitmap** — not because it's fastest (linked list has better alloc complexity), but because it's the right foundation for formal verification later.

A bitmap's state is a mathematical object: a bitvector. The core invariant is trivially expressible:

> **Bit N is set ↔ page at `base + N × 4096` is allocated.**

That's a first-order logic statement. You can prove it correct. You can check it at runtime. You can reason about it symbolically. Try doing that with a linked list's "no cycles, all pointers valid, no aliasing" invariant — it's one of the hardest problems in verification research.

> :sharpgoose: seL4 — the formally verified microkernel — uses a similar approach for its memory management. When your design goal is "provably correct," your data structures must be mathematically tractable. Bitmaps are. Pointer graphs aren't.

## The Math

For 128MB of RAM with 4KB pages:

```
128 MB ÷ 4 KB = 32,768 pages
32,768 bits ÷ 64 bits/word = 512 words
512 × 8 bytes = 4,096 bytes = exactly 1 page
```

One page of bitmap to track all pages. Clean.

## Memory Layout

The allocator manages the free region between the kernel image and the stack. The linker script defines the boundaries:

```ld title="linker.ld (QEMU)"
OUTPUT_ARCH(riscv)
ENTRY(_start)

MEMORY
{
    /*
     * OpenSBI occupies 0x80000000 - 0x801FFFFF
     * Our kernel loads at 0x80200000
     * QEMU virt machine has 128MB RAM by default
     */
    RAM (rwx) : ORIGIN = 0x80200000, LENGTH = 126M
}

SECTIONS
{
    /* Code — _start MUST be first at 0x80200000 */
    .text : {
        _text_start = .;
        KEEP(*(.text.boot))    /* boot.S entry point first */
        *(.text .text.*)
        _text_end = .;
    } > RAM

    /* Read-only data (string literals, etc.) */
    .rodata : ALIGN(4K) {
        _rodata_start = .;
        *(.rodata .rodata.*)
        _rodata_end = .;
    } > RAM

    /* Initialized mutable data */
    .data : ALIGN(4K) {
        _data_start = .;
        *(.data .data.*)
        _data_end = .;
    } > RAM

    /* Zero-initialized data — boot.S will zero this */
    .bss : ALIGN(4K) {
        _bss_start = .;
        *(.bss .bss.*)
        *(.sbss .sbss.*)
        _bss_end = .;
    } > RAM

    /* End of kernel image — free memory starts here (page-aligned) */
    . = ALIGN(4K);
    _end = .;

    /* Kernel stack: 64KB at top of RAM, grows downward.
     * Page allocator must NOT allocate above _heap_end. */
    _stack_size = 64K;
    _memory_end = ORIGIN(RAM) + LENGTH(RAM);
    _stack_top = _memory_end;
    _heap_end = _memory_end - _stack_size;
}
```

The VisionFive 2 linker script (`linker-vf2.ld`) is identical in structure, but with `ORIGIN = 0x40200000` (DRAM starts at `0x4000_0000` on JH7110) and `_boot_hart_id = 1` (hart 0 is the S7 monitor core with no MMU).

The resulting memory map:

```
DRAM base     ┌───────────────────┐
              │ OpenSBI (2MB)     │
0x_020_0000   ├───────────────────┤
              │ Kernel .text      │  R+X
              │ Kernel .rodata    │  R
              │ Kernel .data      │  R+W
              │ Kernel .bss       │  R+W
_end          ├───────────────────┤  <-- allocator starts here
              │                   │
              │  Free pages       │
              │  (bitmap-managed) │
              │                   │
_heap_end     ├───────────────────┤  <-- allocator stops here
              │  Kernel stack     │  64KB, grows downward
_stack_top    └───────────────────┘
```

> :angrygoose: If you forget to reserve stack space, the page allocator will happily hand out pages that the stack is using. Your kernel will corrupt its own stack frames — the most confusing class of bug in OS development. "Random crashes that change every time you add a print statement" is the symptom.

## The Complete Allocator: `page_alloc.rs`

Here is the full source. Everything is pure logic — no `unsafe`, no MMIO, no hardware. The only hardware-dependent functions (`init_from_linker`, `self_test`) are gated with `#[cfg(not(test))]` so the core can run on any host.

### Types and Constants

```rust title="src/page_alloc.rs"
/// Bitmap-based physical page allocator.
///
/// Design decisions (for formal verification path):
///   - State is a bitvector — transitions are set/clear, both monoid ops
///   - Core invariant: bit N set ↔ page at (base + N * PAGE_SIZE) is allocated
///   - Pure logic: no unsafe, no MMIO, no linker symbols in the allocator core
///   - Kernel integration is a thin wrapper that reads linker symbols
///
/// Memory layout managed by this allocator:
///   _end (kernel image end) → _heap_end (stack bottom) = free pages

pub const PAGE_SIZE: usize = 4096;

/// Maximum pages we can track.
/// 128MB / 4KB = 32,768 pages → 32,768 bits → 512 u64 words → 4KB of bitmap.
/// We size for the worst case; actual page count may be smaller.
const MAX_PAGES: usize = 32_768;
const BITMAP_WORDS: usize = MAX_PAGES / 64;

/// Errors from allocator operations — explicit, no silent failures.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AllocError {
    OutOfMemory,
    DoubleFree,
    InvalidAddress,
    NotAligned,
}
```

Every error path is explicit. No panics in the hot path, no silent corruption. `AllocError` derives `PartialEq` so tests can assert on exact error variants.

### The Core Struct

```rust title="src/page_alloc.rs (continued)"
/// Bitmap page allocator.
///
/// Formal properties:
///   - `bitmap[i] & (1 << j)` set ↔ page `i*64 + j` is allocated
///   - `alloc()` finds first zero bit, sets it, returns page address
///   - `free(addr)` clears the bit — errors on double-free
///   - `free_count() + alloc_count() == total_pages` (conservation)
pub struct BitmapAllocator {
    bitmap: [u64; BITMAP_WORDS],
    base_addr: usize,
    total_pages: usize,
}
```

The bitmap is a fixed-size array — no heap allocation, no `Vec`, no `Box`. This is a `no_std` kernel; the allocator *is* the memory management. It can't depend on something above it.

### Construction and Init

```rust title="src/page_alloc.rs (continued)"
impl BitmapAllocator {
    /// Create a new allocator managing `num_pages` starting at `base`.
    ///
    /// All pages start FREE (bit = 0). Caller must mark any reserved pages.
    ///
    /// # Panics
    /// Panics if `num_pages > MAX_PAGES` or `base` is not page-aligned.
    pub const fn new(base: usize, num_pages: usize) -> Self {
        BitmapAllocator {
            bitmap: [0u64; BITMAP_WORDS],
            base_addr: base,
            total_pages: num_pages,
        }
    }

    /// Initialize and validate parameters. Call once after construction.
    pub fn init(&self) {
        assert!(self.base_addr % PAGE_SIZE == 0, "base not page-aligned");
        assert!(self.total_pages > 0, "zero pages");
        assert!(self.total_pages <= MAX_PAGES, "too many pages");
    }
```

`new()` is `const fn` — it can run at compile time. The validation is split into `init()` because `assert!` isn't available in `const fn` on stable Rust. This is a common pattern in embedded Rust: construct at compile time, validate at runtime.

### Alloc: Find First Zero Bit

```rust title="src/page_alloc.rs (continued)"
    /// Allocate one physical page. Returns the physical address.
    ///
    /// Scans bitmap for first zero bit, sets it, returns `base + index * PAGE_SIZE`.
    /// Returns `Err(OutOfMemory)` if all pages are allocated.
    pub fn alloc(&mut self) -> Result<usize, AllocError> {
        for word_idx in 0..self.words_used() {
            let word = self.bitmap[word_idx];
            if word == u64::MAX {
                continue; // all 64 bits set, skip
            }
            // Find first zero bit
            let bit_idx = (!word).trailing_zeros() as usize;
            let page_idx = word_idx * 64 + bit_idx;

            if page_idx >= self.total_pages {
                return Err(AllocError::OutOfMemory);
            }

            // Set the bit (mark allocated)
            self.bitmap[word_idx] |= 1u64 << bit_idx;
            return Ok(self.base_addr + page_idx * PAGE_SIZE);
        }
        Err(AllocError::OutOfMemory)
    }
```

> :nerdygoose: `(!word).trailing_zeros()` is a single CPU instruction on most architectures (`ctz` on RISC-V, `tzcnt` on x86). We invert the word so set bits become zeros and zeros become ones, then count trailing zeros to find the first free slot. This scans 64 pages at a time — the bitmap approach's O(n) alloc is actually O(n/64) in practice.

### Free: Clear the Bit

```rust title="src/page_alloc.rs (continued)"
    /// Free a previously allocated page.
    ///
    /// Clears the bit. Errors on double-free or invalid address.
    pub fn free(&mut self, addr: usize) -> Result<(), AllocError> {
        if addr % PAGE_SIZE != 0 {
            return Err(AllocError::NotAligned);
        }
        if addr < self.base_addr {
            return Err(AllocError::InvalidAddress);
        }
        let page_idx = (addr - self.base_addr) / PAGE_SIZE;
        if page_idx >= self.total_pages {
            return Err(AllocError::InvalidAddress);
        }

        let word_idx = page_idx / 64;
        let bit_idx = page_idx % 64;
        let mask = 1u64 << bit_idx;

        if self.bitmap[word_idx] & mask == 0 {
            return Err(AllocError::DoubleFree);
        }

        // Clear the bit (mark free)
        self.bitmap[word_idx] &= !mask;
        Ok(())
    }
```

> :angrygoose: Double-free detection is not optional. In a kernel, freeing a page that's already free means two different subsystems think they own the same physical memory. One writes data, the other writes a page table entry — instant corruption. We catch it explicitly with `AllocError::DoubleFree` rather than silently allowing it.

### Query Methods

```rust title="src/page_alloc.rs (continued)"
    /// Check if a specific page address is currently allocated.
    pub fn is_allocated(&self, addr: usize) -> bool {
        if addr % PAGE_SIZE != 0 || addr < self.base_addr {
            return false;
        }
        let page_idx = (addr - self.base_addr) / PAGE_SIZE;
        if page_idx >= self.total_pages {
            return false;
        }
        let word_idx = page_idx / 64;
        let bit_idx = page_idx % 64;
        self.bitmap[word_idx] & (1u64 << bit_idx) != 0
    }

    /// Count of free (unallocated) pages.
    pub fn free_count(&self) -> usize {
        let allocated = self.allocated_count();
        self.total_pages - allocated
    }

    /// Count of allocated pages.
    pub fn allocated_count(&self) -> usize {
        let mut count = 0usize;
        for i in 0..self.words_used() {
            count += self.bitmap[i].count_ones() as usize;
        }
        count
    }

    /// Total pages managed by this allocator.
    pub fn total_pages(&self) -> usize {
        self.total_pages
    }

    /// Base physical address.
    pub fn base_addr(&self) -> usize {
        self.base_addr
    }
```

`count_ones()` compiles to a hardware `popcnt` instruction — another case where the bitmap representation maps directly to fast CPU operations.

### Reserve and Zero

```rust title="src/page_alloc.rs (continued)"
    /// Allocate a specific page by address (for reserving known regions).
    /// Returns `Err` if already allocated or invalid.
    pub fn mark_allocated(&mut self, addr: usize) -> Result<(), AllocError> {
        if addr % PAGE_SIZE != 0 {
            return Err(AllocError::NotAligned);
        }
        if addr < self.base_addr {
            return Err(AllocError::InvalidAddress);
        }
        let page_idx = (addr - self.base_addr) / PAGE_SIZE;
        if page_idx >= self.total_pages {
            return Err(AllocError::InvalidAddress);
        }

        let word_idx = page_idx / 64;
        let bit_idx = page_idx % 64;
        let mask = 1u64 << bit_idx;

        if self.bitmap[word_idx] & mask != 0 {
            return Err(AllocError::DoubleFree); // already allocated
        }

        self.bitmap[word_idx] |= mask;
        Ok(())
    }

    /// Zero a page (fill with 0x00). Requires the address to be valid.
    ///
    /// # Safety
    /// Caller must ensure `addr` is a valid, mapped, writable physical address.
    pub unsafe fn zero_page(addr: usize) {
        let ptr = addr as *mut u8;
        for i in 0..PAGE_SIZE {
            core::ptr::write_volatile(ptr.add(i), 0);
        }
    }

    /// How many u64 words are actually used for our page count.
    fn words_used(&self) -> usize {
        (self.total_pages + 63) / 64
    }
}
```

`zero_page()` uses `write_volatile` to prevent the compiler from optimizing away the zeroing. This matters for page table pages — a zero PTE has V=0 (invalid), which is safe by construction. If the compiler decided our zero-fill was "dead code," uninitialized memory could contain a valid-looking PTE pointing to an arbitrary physical address. That's a security hole.

### Conservation Invariant

At all times: `allocated_count() + free_count() == total_pages()`. This is the allocator's conservation law — pages are never created or destroyed, only moved between free and allocated states.

## Kernel Integration

The allocator's pure core knows nothing about hardware. Two thin functions connect it to the real world:

```rust title="src/page_alloc.rs — kernel integration"
/// Initialize the page allocator from linker-script symbols.
///
/// This is the ONLY function that touches linker symbols.
/// Everything else is pure logic operating on the BitmapAllocator struct.
#[cfg(not(test))]
pub fn init_from_linker() -> BitmapAllocator {
    extern "C" {
        static _end: u8;
        static _heap_end: u8;
    }

    let free_start = unsafe { &_end as *const u8 as usize };
    let free_end = unsafe { &_heap_end as *const u8 as usize };

    // Align start up to page boundary (should already be from linker)
    let base = (free_start + PAGE_SIZE - 1) & !(PAGE_SIZE - 1);
    let num_pages = (free_end - base) / PAGE_SIZE;

    let mut alloc = BitmapAllocator::new(base, num_pages);
    alloc.init();
    alloc
}
```

Linker symbols are strange — they don't have values, they *are* addresses. `extern "C" { static _end: u8; }` declares a symbol; taking its address (`&_end as *const u8 as usize`) gives us the linker-assigned value. This is the standard Rust pattern for reading linker script symbols.

### Boot Self-Test

```rust title="src/page_alloc.rs — boot self-test"
/// Boot self-test — run at startup to verify allocator correctness.
///
/// This is a runtime proof that the core invariants hold on this hardware.
/// If any assertion fails, the kernel panics before enabling the MMU.
#[cfg(not(test))]
pub fn self_test(alloc: &mut BitmapAllocator) {
    use crate::println;

    // Invariant 1: all pages start free
    assert_eq!(alloc.allocated_count(), 0, "pages should start free");
    assert_eq!(alloc.free_count(), alloc.total_pages(), "free count mismatch");

    // Invariant 2: alloc returns a valid, page-aligned address
    let p1 = alloc.alloc().expect("alloc p1 failed");
    assert!(p1 % PAGE_SIZE == 0, "p1 not aligned");
    assert!(p1 >= alloc.base_addr(), "p1 below base");
    assert!(alloc.is_allocated(p1), "p1 not marked allocated");

    // Invariant 3: conservation — allocated + free = total
    assert_eq!(alloc.allocated_count() + alloc.free_count(), alloc.total_pages());

    // Invariant 4: free works, double-free is caught
    alloc.free(p1).expect("free p1 failed");
    assert!(!alloc.is_allocated(p1), "p1 still marked after free");
    assert_eq!(alloc.free(p1), Err(AllocError::DoubleFree), "double free not caught");

    // Invariant 5: freed page is reusable
    let p2 = alloc.alloc().expect("alloc p2 failed");
    assert_eq!(p1, p2, "freed page should be reallocated first");
    alloc.free(p2).expect("free p2 failed");

    // Invariant 6: sequential allocations don't overlap
    let a = alloc.alloc().expect("alloc a");
    let b = alloc.alloc().expect("alloc b");
    assert_ne!(a, b, "two allocations returned same page");
    assert_eq!(b, a + PAGE_SIZE, "sequential allocs should be contiguous");
    alloc.free(a).expect("free a");
    alloc.free(b).expect("free b");

    // Invariant 7: bad addresses are rejected
    assert_eq!(alloc.free(0xDEAD), Err(AllocError::NotAligned));
    assert_eq!(alloc.free(0), Err(AllocError::InvalidAddress));

    // Clean — all pages free again
    assert_eq!(alloc.allocated_count(), 0);

    println!("  [page_alloc] self-test passed ({} pages, {}MB)",
        alloc.total_pages(),
        alloc.total_pages() * PAGE_SIZE / (1024 * 1024));
}
```

Output on real hardware:

```
[page_alloc] self-test passed (32233 pages, 125MB)
```

## Host-Side Unit Tests

This is where the architecture pays off. Because `BitmapAllocator` is pure logic, we can test it on x86 at millisecond speed. The trick is conditional compilation in `main.rs`:

```rust title="src/main.rs — top of file"
// When running `cargo test`, use host std library.
// When building for RISC-V, use no_std/no_main.
#![cfg_attr(not(test), no_std)]
#![cfg_attr(not(test), no_main)]
```

Then in `page_alloc.rs`, the test module uses `std`-available features like `Vec`:

```rust title="src/page_alloc.rs — unit tests"
#[cfg(test)]
mod tests {
    use super::*;

    const TEST_BASE: usize = 0x8000_0000;
    const TEST_PAGES: usize = 256; // 1MB

    fn make_alloc() -> BitmapAllocator {
        let mut a = BitmapAllocator::new(TEST_BASE, TEST_PAGES);
        a.init();
        a
    }

    #[test]
    fn test_new_allocator_all_free() {
        let a = make_alloc();
        assert_eq!(a.free_count(), TEST_PAGES);
        assert_eq!(a.allocated_count(), 0);
        assert_eq!(a.total_pages(), TEST_PAGES);
    }

    #[test]
    fn test_alloc_returns_base() {
        let mut a = make_alloc();
        let p = a.alloc().unwrap();
        assert_eq!(p, TEST_BASE);
    }

    #[test]
    fn test_alloc_sequential() {
        let mut a = make_alloc();
        let p1 = a.alloc().unwrap();
        let p2 = a.alloc().unwrap();
        let p3 = a.alloc().unwrap();
        assert_eq!(p1, TEST_BASE);
        assert_eq!(p2, TEST_BASE + PAGE_SIZE);
        assert_eq!(p3, TEST_BASE + 2 * PAGE_SIZE);
    }

    #[test]
    fn test_alloc_marks_allocated() {
        let mut a = make_alloc();
        let p = a.alloc().unwrap();
        assert!(a.is_allocated(p));
        assert!(!a.is_allocated(p + PAGE_SIZE)); // next page still free
    }

    #[test]
    fn test_conservation() {
        let mut a = make_alloc();
        for _ in 0..10 {
            a.alloc().unwrap();
        }
        assert_eq!(a.allocated_count() + a.free_count(), TEST_PAGES);
    }

    #[test]
    fn test_free_and_realloc() {
        let mut a = make_alloc();
        let p1 = a.alloc().unwrap();
        a.free(p1).unwrap();
        let p2 = a.alloc().unwrap();
        assert_eq!(p1, p2, "freed page should be reallocated");
    }

    #[test]
    fn test_double_free() {
        let mut a = make_alloc();
        let p = a.alloc().unwrap();
        a.free(p).unwrap();
        assert_eq!(a.free(p), Err(AllocError::DoubleFree));
    }

    #[test]
    fn test_free_invalid_address() {
        let mut a = make_alloc();
        assert_eq!(a.free(0), Err(AllocError::InvalidAddress));
        assert_eq!(a.free(TEST_BASE - PAGE_SIZE), Err(AllocError::InvalidAddress));
    }

    #[test]
    fn test_free_unaligned() {
        let mut a = make_alloc();
        assert_eq!(a.free(TEST_BASE + 1), Err(AllocError::NotAligned));
        assert_eq!(a.free(TEST_BASE + 13), Err(AllocError::NotAligned));
    }

    #[test]
    fn test_free_beyond_range() {
        let mut a = make_alloc();
        let beyond = TEST_BASE + TEST_PAGES * PAGE_SIZE;
        assert_eq!(a.free(beyond), Err(AllocError::InvalidAddress));
    }

    #[test]
    fn test_exhaust_all_pages() {
        let mut a = BitmapAllocator::new(TEST_BASE, 4);
        a.init();
        a.alloc().unwrap();
        a.alloc().unwrap();
        a.alloc().unwrap();
        a.alloc().unwrap();
        assert_eq!(a.alloc(), Err(AllocError::OutOfMemory));
        assert_eq!(a.free_count(), 0);
    }

    #[test]
    fn test_free_then_alloc_after_exhaust() {
        let mut a = BitmapAllocator::new(TEST_BASE, 2);
        a.init();
        let p1 = a.alloc().unwrap();
        let _p2 = a.alloc().unwrap();
        assert_eq!(a.alloc(), Err(AllocError::OutOfMemory));
        a.free(p1).unwrap();
        let p3 = a.alloc().unwrap();
        assert_eq!(p3, p1); // got the freed page back
    }

    #[test]
    fn test_mark_allocated() {
        let mut a = make_alloc();
        let addr = TEST_BASE + 10 * PAGE_SIZE;
        a.mark_allocated(addr).unwrap();
        assert!(a.is_allocated(addr));
        assert_eq!(a.allocated_count(), 1);

        // Trying to mark again should fail
        assert_eq!(a.mark_allocated(addr), Err(AllocError::DoubleFree));
    }

    #[test]
    fn test_alloc_skips_marked() {
        let mut a = BitmapAllocator::new(TEST_BASE, 4);
        a.init();
        // Mark page 0 as reserved
        a.mark_allocated(TEST_BASE).unwrap();
        // First alloc should skip page 0 and return page 1
        let p = a.alloc().unwrap();
        assert_eq!(p, TEST_BASE + PAGE_SIZE);
    }

    #[test]
    fn test_is_allocated_boundary() {
        let a = make_alloc();
        // Below base
        assert!(!a.is_allocated(TEST_BASE - PAGE_SIZE));
        // Above range
        assert!(!a.is_allocated(TEST_BASE + TEST_PAGES * PAGE_SIZE));
        // Unaligned
        assert!(!a.is_allocated(TEST_BASE + 1));
    }

    #[test]
    fn test_word_boundary_alloc() {
        // Allocate across a u64 word boundary (pages 63 and 64)
        let mut a = BitmapAllocator::new(TEST_BASE, 128);
        a.init();
        for i in 0..64 {
            let p = a.alloc().unwrap();
            assert_eq!(p, TEST_BASE + i * PAGE_SIZE);
        }
        // Page 64 is in word[1], bit 0
        let p64 = a.alloc().unwrap();
        assert_eq!(p64, TEST_BASE + 64 * PAGE_SIZE);
        assert!(a.is_allocated(p64));
    }

    #[test]
    fn test_alloc_free_all() {
        let num = 128;
        let mut a = BitmapAllocator::new(TEST_BASE, num);
        a.init();
        let mut pages = Vec::new();

        // Allocate all
        for _ in 0..num {
            pages.push(a.alloc().unwrap());
        }
        assert_eq!(a.alloc(), Err(AllocError::OutOfMemory));
        assert_eq!(a.allocated_count(), num);

        // Free all
        for p in pages {
            a.free(p).unwrap();
        }
        assert_eq!(a.free_count(), num);
        assert_eq!(a.allocated_count(), 0);
    }
}
```

```
running 17 tests
test page_alloc::tests::test_alloc_returns_base ... ok
test page_alloc::tests::test_alloc_sequential ... ok
test page_alloc::tests::test_alloc_marks_allocated ... ok
test page_alloc::tests::test_conservation ... ok
test page_alloc::tests::test_free_and_realloc ... ok
test page_alloc::tests::test_double_free ... ok
test page_alloc::tests::test_free_invalid_address ... ok
test page_alloc::tests::test_free_unaligned ... ok
test page_alloc::tests::test_free_beyond_range ... ok
test page_alloc::tests::test_exhaust_all_pages ... ok
test page_alloc::tests::test_free_then_alloc_after_exhaust ... ok
test page_alloc::tests::test_mark_allocated ... ok
test page_alloc::tests::test_alloc_skips_marked ... ok
test page_alloc::tests::test_is_allocated_boundary ... ok
test page_alloc::tests::test_word_boundary_alloc ... ok
test page_alloc::tests::test_alloc_free_all ... ok
test page_alloc::tests::test_new_allocator_all_free ... ok
test result: ok. 17 passed; 0 failed
```

> :happygoose: The same invariants tested on x86 in milliseconds AND verified on RISC-V silicon at boot. If the host tests pass but the boot test fails, you've found a platform-specific bug. If both pass, you have confidence across architectures. This dual-testing strategy is the foundation for formal verification — the properties we test today are the properties we'll prove tomorrow.

## Separation of Concerns

The allocator's design deliberately separates pure logic from hardware interaction:

| Layer | File | Depends On | Testable? |
|---|---|---|---|
| **Bitmap math** | `page_alloc.rs` | Nothing (pure) | Host + boot |
| **Linker symbols** | `page_alloc.rs` (`init_from_linker`) | Linker script | Boot only |
| **Page table creation** | `kvm.rs` | Allocator + page_table | Boot only |

The bitmap math is architecture-independent. It works on x86, RISC-V, ARM — anywhere Rust compiles. The linker symbol reading is a thin wrapper that converts hardware addresses into allocator parameters. The page table code uses the allocator but doesn't know how it works internally.

> :weightliftinggoose: This layering isn't just clean code — it's a formal verification requirement. To prove the allocator correct, you need to reason about it in isolation, without entangling hardware state. If the allocator directly read linker symbols or wrote to MMIO addresses, you'd need to model the entire memory system to verify it. By keeping it pure, the proof obligation is just: "does this bitvector manipulation satisfy the invariant?" That's tractable.

## What We Changed

| File | Change |
|------|--------|
| `linker.ld` | Added `_end`, `_heap_end`, `_stack_size` symbols, section boundary symbols |
| `linker-vf2.ld` | Same symbols for VF2 |
| `src/page_alloc.rs` | **New** — bitmap allocator with 17 unit tests + boot self-test |
| `src/main.rs` | Added `#![cfg_attr(not(test), no_std)]` for dual-target testing |
| `src/main.rs` | Added Phase 7: allocator init + self-test |
