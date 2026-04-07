---
sidebar_position: 3
sidebar_label: "Ch 16: Page Table Structures"
title: "Chapter 16: Sv39 Page Table Structures"
---

# Chapter 16: Sv39 Page Table Structures

RISC-V Sv39 gives us a 39-bit virtual address space — 512 GiB — using a 3-level page table with 4KB pages. Before we build the actual page tables, we need the data structures: the **Page Table Entry (PTE)**, the **permission flags**, and the **virtual address decomposition**.

These are pure data types. No hardware interaction, no `unsafe`, no pointers to physical memory. Just Rust structs that encode the RISC-V specification — testable on any host, verifiable mathematically.

## The Complete Module: `page_table.rs`

This file is about 240 lines of Rust plus 220 lines of tests. It contains zero `unsafe` blocks and compiles identically on x86 and RISC-V. Here's the full implementation, section by section.

### Module Header and Constants

```rust title="src/page_table.rs"
/// Sv39 page table structures — pure data, no hardware interaction.
///
/// RISC-V Sv39 uses 3-level page tables with 39-bit virtual addresses:
///
///   Virtual address (39 bits):
///   ┌─────────┬─────────┬─────────┬──────────────┐
///   │ VPN[2]   │ VPN[1]   │ VPN[0]   │  Page offset  │
///   │ 9 bits   │ 9 bits   │ 9 bits   │  12 bits      │
///   └─────────┴─────────┴─────────┴──────────────┘
///     bits 38-30  bits 29-21  bits 20-12  bits 11-0
///
///   Page Table Entry (64 bits):
///   ┌──────────────────────────────────┬──────────┐
///   │         PPN (44 bits)            │  Flags   │
///   │         bits 53-10               │ bits 9-0 │
///   └──────────────────────────────────┴──────────┘
///
/// Design decisions (formal verification path):
///   - PTE is a newtype over u64 — pure value type, no references
///   - All flag operations are const fn where possible
///   - PageTable is [PTE; 512] — exactly one 4KB page
///   - No unsafe in this module — all hardware interaction lives elsewhere

use crate::page_alloc::PAGE_SIZE;

/// Number of entries per page table (2^9 = 512).
pub const PT_ENTRIES: usize = 512;
```

Each page table is 512 entries × 8 bytes = 4096 bytes = exactly one page. The recursion is elegant: page tables are pages.

## PTE Flags

The low 10 bits of each PTE are flag bits:

```
┌─────┬─────┬─────┬─────┬──────┬──────┬─────┬─────┬─────┬─────┐
│Bit 9│Bit 8│Bit 7│Bit 6│Bit 5 │Bit 4 │Bit 3│Bit 2│Bit 1│Bit 0│
│ RSW │ RSW │  D  │  A  │  G   │  U   │  X  │  W  │  R  │  V  │
└─────┴─────┴─────┴─────┴──────┴──────┴─────┴─────┴─────┴─────┘
```

| Bit | Name | Meaning |
|-----|------|---------|
| 0 | **V** (Valid) | Entry is valid. If 0, all other bits are ignored. |
| 1 | **R** (Read) | Page is readable |
| 2 | **W** (Write) | Page is writable |
| 3 | **X** (Execute) | Page is executable |
| 4 | **U** (User) | Page is accessible from U-mode |
| 5 | **G** (Global) | Mapping exists in all address spaces (not flushed on ASID switch) |
| 6 | **A** (Accessed) | Page has been read (set by hardware or managed by software) |
| 7 | **D** (Dirty) | Page has been written (set by hardware or managed by software) |
| 8-9 | **RSW** | Reserved for software use |

We model flags as a newtype over `u64` with monoid-like composition:

```rust title="src/page_table.rs (continued)"
/// PTE flag bits — each is a single bit in the low 10 bits of the PTE.
///
/// Formal property: flags are a set (bitwise OR composition is idempotent).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(transparent)]
pub struct PteFlags(u64);

impl PteFlags {
    pub const NONE:    PteFlags = PteFlags(0);
    pub const VALID:   PteFlags = PteFlags(1 << 0);  // V — entry is valid
    pub const READ:    PteFlags = PteFlags(1 << 1);  // R — readable
    pub const WRITE:   PteFlags = PteFlags(1 << 2);  // W — writable
    pub const EXECUTE: PteFlags = PteFlags(1 << 3);  // X — executable
    pub const USER:    PteFlags = PteFlags(1 << 4);  // U — accessible from U-mode
    pub const GLOBAL:  PteFlags = PteFlags(1 << 5);  // G — global mapping (not flushed on ASID switch)
    pub const ACCESS:  PteFlags = PteFlags(1 << 6);  // A — accessed (set by hardware or software)
    pub const DIRTY:   PteFlags = PteFlags(1 << 7);  // D — dirty (written to)

    /// Combine two flag sets (bitwise OR). Monoid: associative, NONE is identity.
    pub const fn union(self, other: PteFlags) -> PteFlags {
        PteFlags(self.0 | other.0)
    }

    /// Check if `other` flags are all present in `self`.
    pub const fn contains(self, other: PteFlags) -> bool {
        (self.0 & other.0) == other.0
    }

    /// Raw bit value.
    pub const fn bits(self) -> u64 {
        self.0
    }

    /// Create from raw bits (only low 10 bits used).
    pub const fn from_bits(bits: u64) -> PteFlags {
        PteFlags(bits & 0x3FF)
    }

    /// Is this a leaf PTE? (has R, W, or X set)
    /// Non-leaf PTEs point to the next level page table.
    /// Leaf PTEs map to a physical page.
    pub const fn is_leaf(self) -> bool {
        (self.0 & (Self::READ.0 | Self::WRITE.0 | Self::EXECUTE.0)) != 0
    }
}
```

> :sharpgoose: Flags form a **monoid** under bitwise OR: `union` is associative (`(a | b) | c == a | (b | c)`), and `NONE` is the identity element (`a | NONE == a`). This isn't just a nice property — it means flag composition is safe to reason about algebraically. No order dependence, no hidden state. When we get to formal verification, this algebraic structure makes proofs compositional.

### Leaf vs Branch PTEs

A PTE with R, W, or X set is a **leaf** — it maps to a physical page. A PTE with only V set (no R/W/X) is a **branch** — it points to the next level page table. This distinction is critical during the page walk: the CPU checks leaf-vs-branch at each level to know whether to follow a pointer or produce a physical address.

## Permission Sets

We pre-define the permission combinations GooseOS uses:

```rust title="src/page_table.rs (continued)"
/// Kernel text: read + execute, no write (immutable code).
pub const KERNEL_RX: PteFlags = PteFlags(
    PteFlags::VALID.0 | PteFlags::READ.0 | PteFlags::EXECUTE.0 |
    PteFlags::ACCESS.0 | PteFlags::GLOBAL.0
);

/// Kernel read-only data.
pub const KERNEL_RO: PteFlags = PteFlags(
    PteFlags::VALID.0 | PteFlags::READ.0 |
    PteFlags::ACCESS.0 | PteFlags::GLOBAL.0
);

/// Kernel read-write data (BSS, stack, heap).
pub const KERNEL_RW: PteFlags = PteFlags(
    PteFlags::VALID.0 | PteFlags::READ.0 | PteFlags::WRITE.0 |
    PteFlags::ACCESS.0 | PteFlags::DIRTY.0 | PteFlags::GLOBAL.0
);

/// MMIO device registers (UART, PLIC): read-write, no execute, no cache.
pub const KERNEL_MMIO: PteFlags = PteFlags(
    PteFlags::VALID.0 | PteFlags::READ.0 | PteFlags::WRITE.0 |
    PteFlags::ACCESS.0 | PteFlags::DIRTY.0 | PteFlags::GLOBAL.0
);

/// User code: read + execute + user-accessible.
pub const USER_RX: PteFlags = PteFlags(
    PteFlags::VALID.0 | PteFlags::READ.0 | PteFlags::EXECUTE.0 |
    PteFlags::USER.0 | PteFlags::ACCESS.0
);

/// User data: read + write + user-accessible.
pub const USER_RW: PteFlags = PteFlags(
    PteFlags::VALID.0 | PteFlags::READ.0 | PteFlags::WRITE.0 |
    PteFlags::USER.0 | PteFlags::ACCESS.0 | PteFlags::DIRTY.0
);
```

The key difference between kernel and user permissions: the **U bit**. Without it, U-mode code cannot access the page — a page fault fires. This is how the MMU enforces privilege separation.

> :angrygoose: **W^X is enforced here.** No permission set has both Write and Execute. Kernel code is R+X (can read and run it, can't modify it). Kernel data is R+W (can read and modify it, can't execute it). This prevents code injection: even if an attacker writes shellcode into a data buffer, executing it triggers a page fault. This is a compile-time guarantee — the permission constants are `const`, so they can't be modified at runtime.

The GLOBAL flag on kernel pages means they're not flushed from the TLB on address space switch. Since the kernel mapping is the same in every address space (identity-mapped, immutable), there's no reason to flush and re-walk kernel entries when switching to a userspace process.

## The Page Table Entry

The PTE combines a 44-bit physical page number with the 10-bit flags:

```
┌────────────────────────────────────────┬──────────┐
│          PPN (44 bits)                 │  Flags   │
│          bits 53-10                    │ bits 9-0 │
└────────────────────────────────────────┴──────────┘
```

```rust title="src/page_table.rs (continued)"
/// A single Sv39 page table entry.
///
/// Layout (64 bits):
///   Bits  0-7:   flags (V, R, W, X, U, G, A, D)
///   Bits  8-9:   RSW (reserved for software, we use 0)
///   Bits 10-53:  PPN (physical page number, 44 bits)
///   Bits 54-63:  reserved (must be 0)
///
/// Formal property: a PTE is a pure value. Two PTEs with the same bits are equal.
/// No hidden state, no pointers, no side effects.
#[derive(Clone, Copy, PartialEq, Eq)]
#[repr(transparent)]
pub struct Pte(u64);

impl Pte {
    /// An invalid (zero) PTE.
    pub const INVALID: Pte = Pte(0);

    /// Reconstruct a PTE from raw bits (read back from memory).
    pub const fn new_from_bits(bits: u64) -> Pte {
        Pte(bits)
    }

    /// Create a leaf PTE mapping to a physical address with given flags.
    ///
    /// `phys_addr` must be page-aligned (low 12 bits zero).
    /// The physical page number is extracted and stored in bits 10-53.
    pub const fn new(phys_addr: usize, flags: PteFlags) -> Pte {
        let ppn = (phys_addr as u64 >> 12) & 0x00FF_FFFF_FFFF_FFFF; // 44 bits
        Pte((ppn << 10) | flags.bits())
    }

    /// Create a non-leaf PTE pointing to the next level page table.
    ///
    /// `table_phys_addr` is the physical address of the child page table.
    /// Flags: Valid only (no R/W/X — this is a branch, not a leaf).
    pub const fn branch(table_phys_addr: usize) -> Pte {
        let ppn = (table_phys_addr as u64 >> 12) & 0x00FF_FFFF_FFFF_FFFF;
        Pte((ppn << 10) | PteFlags::VALID.0)
    }

    /// Is this PTE valid?
    pub const fn is_valid(self) -> bool {
        (self.0 & PteFlags::VALID.0) != 0
    }

    /// Is this a leaf PTE (maps to a physical page)?
    pub const fn is_leaf(self) -> bool {
        self.is_valid() && self.flags().is_leaf()
    }

    /// Is this a branch PTE (points to next level table)?
    pub const fn is_branch(self) -> bool {
        self.is_valid() && !self.flags().is_leaf()
    }

    /// Extract the flags (low 10 bits).
    pub const fn flags(self) -> PteFlags {
        PteFlags::from_bits(self.0)
    }

    /// Extract the physical page number (bits 10-53).
    pub const fn ppn(self) -> u64 {
        (self.0 >> 10) & 0x00FF_FFFF_FFFF_FFFF
    }

    /// Convert PPN back to a physical address.
    pub const fn phys_addr(self) -> usize {
        (self.ppn() << 12) as usize
    }

    /// Raw 64-bit value.
    pub const fn bits(self) -> u64 {
        self.0
    }
}
```

A PTE is a pure value type: 64 bits, no pointers, no references. Two PTEs with the same bits are equal. This makes them trivially comparable, serializable, and verifiable.

### Debug Formatting

The `Debug` impl gives us human-readable output when debugging page table walks:

```rust title="src/page_table.rs (continued)"
impl core::fmt::Debug for Pte {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        if !self.is_valid() {
            write!(f, "PTE(invalid)")
        } else {
            let fl = self.flags();
            write!(f, "PTE(phys={:#x}, ", self.phys_addr())?;
            if fl.contains(PteFlags::READ)    { write!(f, "R")?; }
            if fl.contains(PteFlags::WRITE)   { write!(f, "W")?; }
            if fl.contains(PteFlags::EXECUTE) { write!(f, "X")?; }
            if fl.contains(PteFlags::USER)    { write!(f, "U")?; }
            if fl.contains(PteFlags::GLOBAL)  { write!(f, "G")?; }
            write!(f, ")")
        }
    }
}
```

This prints something like `PTE(phys=0x40200000, RXG)` for a kernel text page — immediately tells you the physical address and permission bits.

## Virtual Address Decomposition

A 39-bit virtual address is split into four fields:

```
┌──────────┬──────────┬──────────┬──────────────┐
│  VPN[2]   │  VPN[1]   │  VPN[0]   │ Page offset   │
│  9 bits   │  9 bits   │  9 bits   │  12 bits      │
└──────────┴──────────┴──────────┴──────────────┘
  bits 38-30  bits 29-21  bits 20-12    bits 11-0
```

- **VPN[2]** indexes into the root (level-2) page table → 512 entries
- **VPN[1]** indexes into the level-1 table → 512 entries
- **VPN[0]** indexes into the level-0 (leaf) table → 512 entries
- **Page offset** is the byte within the 4KB page

```rust title="src/page_table.rs (continued)"
/// Decompose a 39-bit virtual address into its VPN components and page offset.
///
/// Pure function — no side effects, trivially verifiable.
pub const fn va_parts(va: usize) -> (usize, usize, usize, usize) {
    let vpn2 = (va >> 30) & 0x1FF;   // bits 38-30 → index into level-2 (root) table
    let vpn1 = (va >> 21) & 0x1FF;   // bits 29-21 → index into level-1 table
    let vpn0 = (va >> 12) & 0x1FF;   // bits 20-12 → index into level-0 (leaf) table
    let offset = va & 0xFFF;          // bits 11-0  → offset within the 4KB page
    (vpn2, vpn1, vpn0, offset)
}

/// Construct a virtual address from VPN indices and offset.
pub const fn va_from_parts(vpn2: usize, vpn1: usize, vpn0: usize, offset: usize) -> usize {
    (vpn2 << 30) | (vpn1 << 21) | (vpn0 << 12) | offset
}
```

> :nerdygoose: The 9-bit VPN fields give 512 entries per level. Three levels: 9 + 9 + 9 = 27 bits of page selection + 12 bits of offset = 39 bits total. Sv48 adds a fourth level (48 bits, 256 TiB). Sv57 adds a fifth (57 bits, 128 PiB). For GooseOS, Sv39's 512 GiB is more than enough.

## The satp Register

The `satp` (Supervisor Address Translation and Protection) CSR tells the CPU where the root page table is and what translation mode to use:

```
┌──────────┬──────────┬──────────────────────────┐
│  Mode    │  ASID    │  PPN                     │
│ bits 63-60│ bits 59-44│ bits 43-0                │
└──────────┴──────────┴──────────────────────────┘
```

Mode = 8 means Sv39. ASID is the Address Space Identifier (0 = no ASID). PPN is the physical page number of the root page table.

```rust title="src/page_table.rs (continued)"
/// Sv39 mode value for the satp CSR.
const SATP_SV39: u64 = 8; // mode field = 8 means Sv39

/// Build a satp register value for Sv39.
///
/// `root_table_phys` is the physical address of the root page table.
/// `asid` is the address space identifier (0 = no ASID).
pub const fn make_satp(root_table_phys: usize, asid: u16) -> u64 {
    let ppn = (root_table_phys as u64 >> 12) & 0x00FF_FFFF_FFFF_FFFF;
    (SATP_SV39 << 60) | ((asid as u64) << 44) | ppn
}
```

> :nerdygoose: ASID lets the hardware distinguish between different address spaces without flushing the TLB on every context switch. With ASID = 0 for now (single address space), we'll add per-process ASIDs in Part 6 when we create userspace processes. Each process gets a unique ASID, and the TLB can cache entries from multiple address spaces simultaneously.

## Testing: 22 Host-Side Tests

Every property of the data structures is verified on x86 before we ever boot on RISC-V. Here is the complete test module:

```rust title="src/page_table.rs — tests"
#[cfg(test)]
mod tests {
    use super::*;

    // ── PteFlags tests ──

    #[test]
    fn test_flags_none_is_identity() {
        let f = PteFlags::READ.union(PteFlags::NONE);
        assert_eq!(f, PteFlags::READ);
    }

    #[test]
    fn test_flags_union_associative() {
        let a = PteFlags::READ.union(PteFlags::WRITE).union(PteFlags::EXECUTE);
        let b = PteFlags::READ.union(PteFlags::WRITE.union(PteFlags::EXECUTE));
        assert_eq!(a, b);
    }

    #[test]
    fn test_flags_union_idempotent() {
        let f = PteFlags::READ.union(PteFlags::READ);
        assert_eq!(f, PteFlags::READ);
    }

    #[test]
    fn test_flags_contains() {
        let rw = PteFlags::READ.union(PteFlags::WRITE);
        assert!(rw.contains(PteFlags::READ));
        assert!(rw.contains(PteFlags::WRITE));
        assert!(!rw.contains(PteFlags::EXECUTE));
        assert!(rw.contains(PteFlags::NONE)); // NONE is always contained
    }

    #[test]
    fn test_flags_is_leaf() {
        assert!(PteFlags::READ.is_leaf());
        assert!(PteFlags::WRITE.is_leaf());
        assert!(PteFlags::EXECUTE.is_leaf());
        assert!(PteFlags::READ.union(PteFlags::WRITE).is_leaf());
        assert!(!PteFlags::VALID.is_leaf());   // V alone = branch
        assert!(!PteFlags::NONE.is_leaf());
        assert!(!PteFlags::USER.is_leaf());    // U without R/W/X is not leaf
    }

    #[test]
    fn test_kernel_permission_sets() {
        // Kernel text: readable, executable, not writable
        assert!(KERNEL_RX.contains(PteFlags::VALID));
        assert!(KERNEL_RX.contains(PteFlags::READ));
        assert!(KERNEL_RX.contains(PteFlags::EXECUTE));
        assert!(!KERNEL_RX.contains(PteFlags::WRITE));
        assert!(!KERNEL_RX.contains(PteFlags::USER));
        assert!(KERNEL_RX.is_leaf());

        // Kernel data: readable, writable, not executable
        assert!(KERNEL_RW.contains(PteFlags::READ));
        assert!(KERNEL_RW.contains(PteFlags::WRITE));
        assert!(!KERNEL_RW.contains(PteFlags::EXECUTE));
        assert!(!KERNEL_RW.contains(PteFlags::USER));

        // User code: readable, executable, user-accessible
        assert!(USER_RX.contains(PteFlags::USER));
        assert!(USER_RX.contains(PteFlags::READ));
        assert!(USER_RX.contains(PteFlags::EXECUTE));
        assert!(!USER_RX.contains(PteFlags::WRITE));
    }

    // ── PTE tests ──

    #[test]
    fn test_pte_invalid() {
        let p = Pte::INVALID;
        assert!(!p.is_valid());
        assert!(!p.is_leaf());
        assert!(!p.is_branch());
        assert_eq!(p.bits(), 0);
    }

    #[test]
    fn test_pte_leaf() {
        let phys = 0x8020_0000usize;
        let p = Pte::new(phys, KERNEL_RX);
        assert!(p.is_valid());
        assert!(p.is_leaf());
        assert!(!p.is_branch());
        assert_eq!(p.phys_addr(), phys);
        assert!(p.flags().contains(PteFlags::READ));
        assert!(p.flags().contains(PteFlags::EXECUTE));
    }

    #[test]
    fn test_pte_branch() {
        let table_addr = 0x8030_0000usize;
        let p = Pte::branch(table_addr);
        assert!(p.is_valid());
        assert!(p.is_branch());
        assert!(!p.is_leaf());
        assert_eq!(p.phys_addr(), table_addr);
    }

    #[test]
    fn test_pte_phys_addr_roundtrip() {
        // Test various physical addresses
        let addrs = [0x0, 0x1000, 0x8020_0000, 0x1_0000_0000, 0xF_FFFF_F000];
        for &addr in &addrs {
            let aligned = addr & !0xFFF; // ensure page-aligned
            let p = Pte::new(aligned, KERNEL_RW);
            assert_eq!(p.phys_addr(), aligned,
                "roundtrip failed for {:#x}", aligned);
        }
    }

    #[test]
    fn test_pte_preserves_all_flags() {
        let all = PteFlags::VALID.union(PteFlags::READ).union(PteFlags::WRITE)
            .union(PteFlags::EXECUTE).union(PteFlags::USER).union(PteFlags::GLOBAL)
            .union(PteFlags::ACCESS).union(PteFlags::DIRTY);
        let p = Pte::new(0x1000, all);
        assert_eq!(p.flags().bits() & 0xFF, all.bits() & 0xFF);
    }

    #[test]
    fn test_pte_unaligned_addr_truncates() {
        // Physical address 0x1234 is not page-aligned.
        // PTE stores PPN only (bits 12+), so low 12 bits are lost.
        let p = Pte::new(0x1234, KERNEL_RW);
        assert_eq!(p.phys_addr(), 0x1000); // truncated to page boundary
    }

    // ── Virtual address decomposition tests ──

    #[test]
    fn test_va_parts_zero() {
        let (vpn2, vpn1, vpn0, offset) = va_parts(0);
        assert_eq!((vpn2, vpn1, vpn0, offset), (0, 0, 0, 0));
    }

    #[test]
    fn test_va_parts_page_offset() {
        let (_, _, _, offset) = va_parts(0xABC);
        assert_eq!(offset, 0xABC);
    }

    #[test]
    fn test_va_parts_kernel_addr() {
        // 0x8020_0000:
        //   >> 30 = 2                  → vpn2 = 2
        //   >> 21 & 0x1FF = 0x401 & 0x1FF = 1  → vpn1 = 1
        //   >> 12 & 0x1FF = 0x80200 & 0x1FF = 0 → vpn0 = 0
        let va = 0x8020_0000usize;
        let (vpn2, vpn1, vpn0, offset) = va_parts(va);
        assert_eq!(vpn2, 2,   "vpn2 for {:#x}", va);
        assert_eq!(vpn1, 1,   "vpn1 for {:#x}", va);
        assert_eq!(vpn0, 0,   "vpn0 for {:#x}", va);
        assert_eq!(offset, 0, "offset for {:#x}", va);
    }

    #[test]
    fn test_va_parts_roundtrip() {
        let original = 0x8020_1ABC;
        let (vpn2, vpn1, vpn0, offset) = va_parts(original);
        let reconstructed = va_from_parts(vpn2, vpn1, vpn0, offset);
        assert_eq!(reconstructed, original);
    }

    #[test]
    fn test_va_parts_all_ones() {
        // Maximum 39-bit address: 0x7F_FFFF_FFFF
        let va = 0x7F_FFFF_FFFF;
        let (vpn2, vpn1, vpn0, offset) = va_parts(va);
        assert_eq!(vpn2, 0x1FF); // 9 bits all set
        assert_eq!(vpn1, 0x1FF);
        assert_eq!(vpn0, 0x1FF);
        assert_eq!(offset, 0xFFF); // 12 bits all set
    }

    #[test]
    fn test_va_roundtrip_various() {
        let addrs = [0x0, 0x1000, 0x8020_0000, 0x4020_0000, 0x1000_0000, 0x0C00_0000];
        for &va in &addrs {
            let parts = va_parts(va);
            let rt = va_from_parts(parts.0, parts.1, parts.2, parts.3);
            assert_eq!(rt, va, "roundtrip failed for {:#x}", va);
        }
    }

    // ── SATP tests ──

    #[test]
    fn test_satp_sv39_mode() {
        let satp = make_satp(0x8030_0000, 0);
        let mode = satp >> 60;
        assert_eq!(mode, 8, "satp mode should be Sv39 (8)");
    }

    #[test]
    fn test_satp_ppn() {
        let root_phys = 0x8030_0000usize;
        let satp = make_satp(root_phys, 0);
        let ppn = satp & 0x00FF_FFFF_FFFF_FFFF;
        assert_eq!(ppn, (root_phys >> 12) as u64);
    }

    #[test]
    fn test_satp_asid() {
        let satp = make_satp(0x8030_0000, 42);
        let asid = (satp >> 44) & 0xFFFF;
        assert_eq!(asid, 42);
    }

    #[test]
    fn test_satp_zero_asid() {
        let satp = make_satp(0x8030_0000, 0);
        let asid = (satp >> 44) & 0xFFFF;
        assert_eq!(asid, 0);
    }
}
```

```
running 22 tests
test page_table::tests::test_flags_none_is_identity ... ok
test page_table::tests::test_flags_union_associative ... ok
test page_table::tests::test_flags_union_idempotent ... ok
test page_table::tests::test_flags_contains ... ok
test page_table::tests::test_flags_is_leaf ... ok
test page_table::tests::test_kernel_permission_sets ... ok
test page_table::tests::test_pte_invalid ... ok
test page_table::tests::test_pte_leaf ... ok
test page_table::tests::test_pte_branch ... ok
test page_table::tests::test_pte_phys_addr_roundtrip ... ok
test page_table::tests::test_pte_preserves_all_flags ... ok
test page_table::tests::test_pte_unaligned_addr_truncates ... ok
test page_table::tests::test_va_parts_zero ... ok
test page_table::tests::test_va_parts_page_offset ... ok
test page_table::tests::test_va_parts_kernel_addr ... ok
test page_table::tests::test_va_parts_roundtrip ... ok
test page_table::tests::test_va_parts_all_ones ... ok
test page_table::tests::test_va_roundtrip_various ... ok
test page_table::tests::test_satp_sv39_mode ... ok
test page_table::tests::test_satp_ppn ... ok
test page_table::tests::test_satp_asid ... ok
test page_table::tests::test_satp_zero_asid ... ok
test result: ok. 22 passed; 0 failed
```

Key properties tested:
- **Flag union is associative** (monoid law)
- **NONE is the identity element** (monoid law)
- **Union is idempotent** (set property: `R | R == R`)
- **PTE physical address roundtrips** (encode → decode = original)
- **VA decomposition roundtrips** (split → recombine = original)
- **Kernel permissions enforce W^X** (no set has both W and X)
- **satp mode is Sv39** (mode field = 8)

> :happygoose: All 22 tests run on x86 in milliseconds. The data structures are architecture-independent — they encode the RISC-V spec as Rust types, but the types themselves work on any platform. This means we can test Sv39 logic without booting a RISC-V emulator.

## What We Changed

| File | Change |
|------|--------|
| `src/page_table.rs` | **New** — PTE, PteFlags, va_parts, make_satp, permission constants, 22 tests |
| `src/main.rs` | Added `mod page_table` |
