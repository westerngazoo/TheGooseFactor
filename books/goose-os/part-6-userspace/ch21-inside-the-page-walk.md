---
sidebar_position: 4
sidebar_label: "Ch 21: Inside the Page Walk"
title: "Chapter 21: Inside the Page Walk — What Actually Happens When User Code Touches Memory"
---

# Chapter 21: Inside the Page Walk — What Actually Happens When User Code Touches Memory

Chapters 18-20 showed *how* to build page tables and drop to userspace. This chapter shows *what happens next* — the moment-by-moment story of a virtual address becoming a physical one. If you're the kind of person who wants to understand what's actually going on under the hood (and if you're reading an OS book, you probably are), this is for you.

We'll trace a single memory access through all three levels of the Sv39 page table, then talk about what happens when things go wrong — which, in the OS world, is often the mechanism for making things go right.

## The Three Levels — What They Actually Are

Each level of the Sv39 page table is just an array of 512 PTEs, fitting in exactly one 4KB page:

```
512 entries × 8 bytes = 4,096 bytes = 1 page
```

Each level covers a different granularity of the virtual address space. Think of it like a phone number — the area code narrows the region, the exchange narrows further, and the subscriber number identifies the specific line:

```
Virtual Address: 0x8024E000   (our user stack page)

Binary (39 bits):
 00000000010 | 000000001 | 001001110 | 000000000000
   VPN[2]=2    VPN[1]=1    VPN[0]=78   offset=0

                ┌──────────── "area code"    — which 1 GB region?
                │      ┌───── "exchange"     — which 2 MB block within that GB?
                │      │    ┌── "subscriber" — which 4 KB page within that 2 MB?
                │      │    │
                2      1    78
```

The math behind the granularity:

| Level | Entries | Each Entry Covers | Total Coverage |
|-------|---------|-------------------|----------------|
| Level 2 (root) | 512 | 1 GB | 512 GB (full Sv39) |
| Level 1 | 512 | 2 MB | 1 GB |
| Level 0 (leaf) | 512 | 4 KB | 2 MB |

512 × 512 × 512 × 4KB = 512 GB. That's the entire Sv39 address space.

## The Walk — One Concrete Example

Let's trace exactly what happens when we call `map_page(root, 0x8024E000, 0x8024E000, USER_RW, alloc)` — mapping the user stack page. Every pointer, every index, every PTE.

### Step 1: Root Table (Level 2) — 1 GB per entry

The root table was allocated during `kvm::init()`. Each entry covers a 1 GB region:

```
root_phys = 0x80208000

root table (512 entries, one 4KB page):
┌──────────────────────────────────────────────────────────┐
│ [0]   → invalid                │  0x0_0000_0000 - 0x3_FFFF_FFFF  (1GB) │
│ [1]   → invalid                │  0x4_0000_0000 - 0x7_FFFF_FFFF  (1GB) │
│ [2]   → BRANCH → 0x80209000   │  0x8_0000_0000 - 0xB_FFFF_FFFF  (1GB) ← HIT │
│ [3]   → invalid                │                                       │
│ ...                                                                     │
│ [511] → invalid                │                                       │
└──────────────────────────────────────────────────────────┘
```

VPN[2] = 2. We read `root[2]`. It's a valid **branch** PTE pointing to the level-1 table at `0x80209000`. This table already exists because the kernel's `.text`, `.data`, and heap all live in the same 1GB region.

If it was invalid, `walk_or_create` would:
1. Call `alloc_zeroed_page()` — get a fresh page, fill with zeros
2. Create `Pte::branch(new_page)` — V=1, no R/W/X (branch, not leaf)
3. Write it at `root[2]`
4. Return the new page's address

### Step 2: Level-1 Table — 2 MB per entry

```
level1_phys = 0x80209000   (pointed to by root[2])

level-1 table:
┌──────────────────────────────────────────────────────────┐
│ [0]   → BRANCH → 0x8020A000   │  0x8000_0000 - 0x801F_FFFF  (2MB) │
│ [1]   → BRANCH → 0x8020B000   │  0x8020_0000 - 0x803F_FFFF  (2MB) ← HIT │
│ [2]   → BRANCH → 0x8020C000   │  0x8040_0000 - 0x805F_FFFF  (2MB) │
│ ...                                                                  │
│ [511] → invalid                │                                    │
└──────────────────────────────────────────────────────────┘
```

VPN[1] = 1. We read `level1[1]`. Also already exists — the kernel heap starts at `0x80208000`, which falls in this same 2MB block. Points to level-0 table at `0x8020B000`.

### Step 3: Level-0 Table (Leaf) — 4 KB per entry

```
level0_phys = 0x8020B000   (pointed to by level1[1])

level-0 table:
┌────────────────────────────────────────────────────────────┐
│ [0]   → LEAF: phys=0x80200000 KERNEL_RX   │  kernel .text │
│ [1]   → LEAF: phys=0x80201000 KERNEL_RX   │  kernel .text │
│ ...                                                        │
│ [8]   → LEAF: phys=0x80208000 KERNEL_RW   │  heap start   │
│ ...                                                        │
│ [78]  → LEAF: phys=0x8024E000 USER_RW     │  ← OUR PAGE!  │
│ ...                                                        │
│ [511] → invalid                            │               │
└────────────────────────────────────────────────────────────┘
```

VPN[0] = 78. We write a **leaf PTE** at `level0[78]`:

```rust
let pte = Pte::new(0x8024E000, USER_RW);
write_pte(level0_phys, 78, pte);
```

The PTE encodes: physical page `0x8024E000`, Valid, Read, Write, User, Accessed, Dirty. Done. The virtual address `0x8024E000` now maps to physical address `0x8024E000` (identity-mapped) with user-accessible read-write permissions.

> :nerdygoose: Notice how the three levels share intermediate tables. The kernel's `.text` at `0x80200000` and our user stack at `0x8024E000` are in the same level-0 table — they're only 78 pages apart. The root table and level-1 table are the same for both. Only the level-0 entries differ: kernel pages have KERNEL_RX/KERNEL_RW flags (no U bit), user pages have USER_RW (with U bit). Sharing intermediate levels is what makes the page table compact — you only allocate what you need.

## What the CPU Does at Runtime

Now the page table exists. The user program does `sd ra, 0(sp)` where sp = `0x8024EFF8` (near top of the stack page). Here's what the hardware does — no software involved:

```
CPU: "I need to WRITE to virtual address 0x8024EFF8"

Step 1: Read satp → mode=Sv39, root table at 0x8024F000
                    (user's root, not the kernel's!)

Step 2: VPN[2] = (0x8024EFF8 >> 30) & 0x1FF = 2
        Read root[2] → branch PTE → level-1 at 0x80250000
        (1 memory read)

Step 3: VPN[1] = (0x8024EFF8 >> 21) & 0x1FF = 1
        Read level1[1] → branch PTE → level-0 at 0x80251000
        (1 memory read)

Step 4: VPN[0] = (0x8024EFF8 >> 12) & 0x1FF = 78
        Read level0[78] → LEAF PTE!
        phys = 0x8024E000, flags = V|R|W|U|A|D
        (1 memory read)

Step 5: Permission check:
        - Is V (Valid) set? YES ✓
        - Is U (User) set? YES ✓ (we're in U-mode)
        - Is W (Write) set? YES ✓ (this is a store)
        → Access granted

Step 6: Physical address = PTE.phys + offset
        = 0x8024E000 + 0xFF8
        = 0x8024EFF8

Step 7: Write ra to physical memory at 0x8024EFF8.
```

Three memory reads to translate one address. Every. Single. Time. That's the cost of virtual memory — three extra loads before the actual load or store.

> :angrygoose: "Three extra memory accesses per instruction? That's insane!" It would be, if it actually happened every time. In practice, the **TLB** (Translation Lookaside Buffer) caches recent translations. After the first access to page `0x8024E000`, the TLB stores the mapping `VA→PA + flags`. Subsequent accesses to the same page — the next stack push, the next local variable read — hit the TLB in one cycle. A typical TLB has 32-64 entries and hits 99%+ of the time. The three-level walk only happens on a TLB miss, which is rare in practice. Without TLBs, virtual memory would be unusable. With them, it's nearly free.

## When Things Go Wrong (On Purpose)

Here's where it gets interesting. What happens when the user accesses an address that **isn't mapped**?

### Stack Overflow

Our user process has exactly ONE page of stack (4KB). A real C program might need much more:

```c
void deep_recursion(int depth) {
    char buffer[4096];  // one page per stack frame!
    if (depth > 0)
        deep_recursion(depth - 1);
}
```

Each recursive call pushes ~4KB onto the stack. After the first call, sp drops below our mapped page:

```
0x8024F000  ┌──────────────────┐  ← sp starts here (top of page)
            │   mapped page    │  USER_RW ✓
            │                  │
0x8024E000  ├──────────────────┤  ← bottom of mapped page
            │   UNMAPPED       │  ← sp goes here after first recursion
            │   (no PTE)       │
0x8024D000  └──────────────────┘
```

The CPU tries to write to `0x8024DXXX`. The page walk reaches level-0 and finds **no valid PTE** at that index. The CPU fires a **store/AMO page fault** (scause = 15):

```
!!! EXCEPTION !!!
  cause:  store/AMO page fault (code=15)
  stval:  0x000000008024dff0    ← the address that faulted
  sepc:   0x000000008024e010    ← the instruction that tried to write
```

Right now, our kernel panics. The process is dead, and honestly so is the kernel. Not ideal.

But this is actually the **mechanism** that makes demand paging work.

### Demand Paging: Turning Faults Into Features

A real OS doesn't panic on page faults. It treats them as *requests*:

```
"The user tried to access address X, and there's no mapping.
 Should I create one?"
```

For stack growth, the logic would be:

```rust
// In a future trap handler:
fn handle_page_fault(frame: &mut TrapFrame, stval: usize) {
    let fault_addr = stval;
    let fault_page = fault_addr & !(PAGE_SIZE - 1);

    // Is this address in the user's stack growth region?
    if fault_page >= user_stack_bottom && fault_page < user_stack_top {
        // Yes — grow the stack
        let new_page = alloc.alloc().expect("out of memory");
        zero_page(new_page);
        map_page(user_root, fault_page, new_page, USER_RW, alloc);
        sfence_vma();
        // Return to user — re-execute the faulting instruction
        // (sepc still points to it, don't advance)
        return;
    }

    // Not a valid region — kill the process
    println!("Segmentation fault at {:#x}", fault_addr);
    kill_process(frame);
}
```

The page table walk **fails** → the kernel **catches** the fault → the kernel **allocates** a new page → the kernel **maps** it → the kernel **returns** to the user → the faulting instruction **re-executes** → the page walk **succeeds** this time.

The user program never knows anything happened. From its perspective, the stack just... works. Under the hood, each new stack page was allocated on demand, only when touched.

> :sharpgoose: This is how Linux manages almost everything. Heap (`malloc` → `mmap` → page fault → allocate), stack growth (push past mapped region → page fault → extend), even code loading (execute → page fault → read from disk → map). The page fault handler is the most important function in a modern kernel. It's where policy meets mechanism — the page tables say "not mapped," and the kernel decides whether that's an error or an opportunity.

### Guard Pages: The Safety Net

There's a problem with unlimited stack growth: if the stack grows too far, it could collide with the heap. Two regions of memory silently overwriting each other. No crash, no error — just corruption that manifests as impossible bugs three function calls later. The kind of thing that makes you question your career choices.

The solution: **guard pages**. An intentionally unmapped page at the bottom of the stack region:

```
                  ┌──────────────────┐
                  │  stack page 3    │  USER_RW   ← grows on demand
                  ├──────────────────┤
                  │  stack page 2    │  USER_RW   ← grows on demand
                  ├──────────────────┤
                  │  stack page 1    │  USER_RW   ← initial page
                  ├──────────────────┤
                  │  GUARD PAGE      │  UNMAPPED  ← intentionally invalid
                  ├──────────────────┤
                  │  heap            │  USER_RW
                  └──────────────────┘
```

When sp drops into the guard page, the page fault handler sees "this address is in the guard region" and kills the process instead of allocating. Clean crash, clear error message, no silent corruption. That's the `SIGSEGV` (segmentation fault) you've seen a thousand times in C programs. It's not a bug in the OS — it's the OS *working correctly*.

> :angrygoose: Stack overflow without a guard page is how buffer overflows become security exploits. The stack grows into the heap, the attacker's carefully crafted heap data overwrites a return address on the stack, `ret` jumps to shellcode. Guard pages break this chain — the overwrite faults before it reaches the heap. It's a one-page investment that prevents an entire class of CVEs. The fact that some embedded RTOSes still don't have guard pages in 2026 is... a choice.

## How a Real Userland Stack Works

In Linux, when you spawn a process, the kernel doesn't pre-allocate 8MB of stack (the default limit). It maps maybe 1-4 pages and sets a stack growth limit:

```
0x7FFFFFFFFFFF ┌───────────────────┐  top of user virtual address space
               │                   │
               │  Stack grows DOWN │
               │                   │
               │  ┌─────────────┐  │  ← stack_max (8MB below top)
               │  │ guard page  │  │  UNMAPPED — hard limit
               │  ├─────────────┤  │
               │  │ (growable)  │  │  not yet mapped — faults → allocate
               │  │ (growable)  │  │
               │  ├─────────────┤  │
               │  │ mapped page │  │  USER_RW — allocated on demand
               │  │ mapped page │  │  USER_RW — allocated on demand
               │  │ mapped page │  │  USER_RW — initial pages
               │  ├─────────────┤  │  ← sp
               │  │ (unused)    │  │
               │  └─────────────┘  │
               │                   │
               │       ...         │
               │                   │
               │  ┌─────────────┐  │
               │  │ Heap ↑      │  │  grows up via brk/mmap
               │  └─────────────┘  │
               │  .bss             │
               │  .data            │
               │  .text            │
0x000000000000 └───────────────────┘
```

Each time sp crosses into an unmapped page:

1. **Page fault** → kernel checks if growth is allowed
2. **Below guard page?** → `SIGSEGV`, process killed
3. **Above guard page?** → allocate physical page, map it, return
4. User continues, oblivious

The program thinks it has 8MB of stack. In reality, it has exactly as many pages as it's touched — maybe 3 or 4 for a typical function call chain. The rest is virtual address space reserved but not backed by physical memory. This is why `top` shows your process using 8MB of virtual memory but only 16KB of resident memory.

## What GooseOS Has vs What It Needs

| Feature | GooseOS Now | Real OS | Mechanism |
|---|---|---|---|
| User stack | 1 page, pre-allocated | Grows on demand | Page fault → allocate |
| Stack overflow | Kernel panic | Guard page → clean kill | Intentionally unmapped page |
| Heap allocation | N/A | mmap/brk → page fault | Same mechanism as stack |
| Code loading | Copied to one page | Loaded from filesystem on fault | Page fault → disk read |
| Shared memory | N/A | Same physical page in two tables | Two PTEs → same PPN |
| Copy-on-write | N/A | Fork shares pages, copy on write | R/O mapping → fault → copy |
| Swap | N/A | Evict to disk, reload on fault | Page fault → disk read |

Every single feature in the right column uses the same mechanism: **page fault handling**. The three-level walk fails, the kernel catches it, the kernel decides what to do. The page table infrastructure we built in Parts 5 and 6 supports ALL of this. `map_page()` already takes separate `va` and `pa` parameters — we just happen to pass the same value for identity mapping. The moment we pass different values, we have virtual memory remapping. The moment we handle page faults instead of panicking, we have demand paging.

> :happygoose: The page table is a data structure. The page walk is a lookup algorithm. The page fault handler is the **policy engine**. Everything else — stack growth, heap management, memory-mapped files, copy-on-write fork, swap — is just different policies plugged into the same mechanism. We built the mechanism. The policies are future chapters.

## Megapages: The Optimization We Skipped

One more thing worth knowing. Our `map_range` maps every page individually — 4KB at a time. For the heap region (`0x40207000` to `0x47FF0000`), that's:

```
(0x47FF0000 - 0x40207000) / 4096 = 32,233 pages
= 32,233 leaf PTEs across ~63 level-0 tables
```

Sv39 supports **megapages** (2MB) and **gigapages** (1GB). Instead of 512 leaf PTEs in a level-0 table, you put a leaf PTE directly at level-1 — one entry maps 2MB:

| Approach | Leaf PTEs | Page Table Pages | TLB Entries Needed |
|----------|-----------|------------------|--------------------|
| 4KB pages | 32,233 | ~69 | 32,233 |
| 2MB megapages | ~63 | ~3 | 63 |

Way fewer page table pages, way better TLB coverage. Linux uses megapages for the kernel's direct mapping for exactly this reason.

We don't — because megapages require the physical region to be 2MB-aligned, and mixing megapages with 4KB pages at the same level adds complexity to `map_range`. For 128MB of RAM on an embedded board, the 4KB approach is fine. If performance becomes a bottleneck later (spoiler: it won't before we have dozens of processes and a filesystem), we add megapage support with an alignment check.

## What We Learned

This chapter didn't change any code. It changed how you think about the code. The key insights:

1. **Each page table level is just an array of 512 entries** — nothing magical, just pointers and flags
2. **The CPU walks three levels for every memory access** — but the TLB makes it nearly free in practice
3. **Page faults are features, not bugs** — demand paging, stack growth, and copy-on-write all use the same mechanism
4. **Guard pages prevent silent corruption** — one unmapped page between stack and heap saves you from an entire class of security vulnerabilities
5. **The infrastructure we built supports everything** — `map_page(va, pa)` with different values gives you virtual remapping; page fault handling gives you demand paging; same mechanism, different policies

The page table is a map. The page walk is a lookup. The page fault is a question: "this address isn't mapped — what do you want me to do about it?" How the kernel answers that question defines what kind of OS it is.
