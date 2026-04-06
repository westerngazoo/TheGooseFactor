---
sidebar_position: 1
sidebar_label: "Ch 30: Userspace Memory"
title: "Chapter 30: Userspace Memory — Giving Processes Their Own Pages"
---

# Chapter 30: Userspace Memory — Giving Processes Their Own Pages

Up to now, every page in GooseOS is allocated at boot. The kernel builds page tables, copies user code into pre-allocated pages, sets up stacks, and launches processes. Once processes start running, the memory layout is frozen. No process can ask for more memory. No process can grow a heap. No process can allocate a buffer for incoming data.

That's fine for "Hello World." It's fatal for a WASM runtime.

wasmi needs a heap. The WebAssembly linear memory model requires dynamically growing regions. Rust's `alloc` crate needs a `GlobalAlloc` implementation. And `GlobalAlloc` needs pages. Pages that can be requested at runtime, mapped into the process's address space, used, and eventually returned.

This chapter adds four syscalls that give processes the power to manage their own memory.

## The Problem: Frozen Memory

Here's what a process has right now:

```
Process PID 1 address space:
┌────────────────────────────────────────────────────┐
│  Kernel regions (mapped, no U bit — inaccessible)  │
├────────────────────────────────────────────────────┤
│  User code page (1 page, RX)                       │
├────────────────────────────────────────────────────┤
│  User stack page (1 page, RW)                      │
├────────────────────────────────────────────────────┤
│  Everything else: unmapped → page fault             │
└────────────────────────────────────────────────────┘
```

One page of code, one page of stack. Want to allocate a buffer? Page fault. Want to grow the stack? Page fault. Want to create a data structure larger than 4KB? Too bad.

A real process needs to say: "Give me a page. Map it here. Let me use it." And later: "I'm done with this page. Take it back."

## The Four Syscalls

```
┌─────┬──────────────────┬────────────────────────────────────┐
│  #  │  Name            │  What it does                      │
├─────┼──────────────────┼────────────────────────────────────┤
│  6  │  SYS_MAP         │  Map phys page into my VA space    │
│  7  │  SYS_UNMAP       │  Remove a VA mapping               │
│  8  │  SYS_ALLOC_PAGES │  Get a fresh physical page         │
│  9  │  SYS_FREE_PAGES  │  Return a page to the kernel       │
└─────┴──────────────────┴────────────────────────────────────┘
```

The workflow:

```
User process                      Kernel
─────────────                     ──────
SYS_ALLOC_PAGES(1)         ──►   bitmap allocator: find free page
  a0 = phys_addr           ◄──   zero it, return address

SYS_MAP(phys, virt, RW)    ──►   walk user page table
  a0 = 0 (success)         ◄──   install leaf PTE, flush TLB

... use the page ...              (user reads/writes at virt addr)

SYS_UNMAP(virt)            ──►   clear leaf PTE, flush TLB
  a0 = 0                   ◄──

SYS_FREE_PAGES(phys, 1)   ──►   zero page (security), free bit
  a0 = 0                   ◄──   page returned to allocator
```

Four syscalls, four steps. Allocate, map, use, clean up. This is the microkernel way: explicit, no magic, no hidden state.

> :nerdygoose: In Linux, `mmap()` does allocation AND mapping in a single syscall. In GooseOS, they're separate. Why? Because separation means the kernel can verify each step independently. SYS_MAP validates that you own the physical page. SYS_FREE_PAGES validates that you aren't freeing someone else's page. Each syscall has one job, one validation, one possible failure mode. More syscalls, more explicit, more verifiable.

## The Global Allocator Refactor

Before we could add memory syscalls, we had a plumbing problem. The page allocator lived on `kmain`'s stack:

```rust
// OLD: allocator dies when kmain's stack frame is abandoned
pub fn kmain() -> ! {
    let mut page_alloc = page_alloc::init_from_linker();
    // ... use it ...
    process::launch(&mut page_alloc); // sret, never returns
    // page_alloc is gone — syscall handlers can't reach it
}
```

After `launch()` does `sret` to userspace, the allocator is stranded on an abandoned stack frame. Syscall handlers run from trap context — they have no reference to kmain's locals.

The fix: move the allocator to a `static`:

```rust
static mut ALLOC: BitmapAllocator = BitmapAllocator::new(0, 0);

pub fn init() {
    // Populate from linker symbols
    unsafe {
        core::ptr::addr_of_mut!(ALLOC).write(
            BitmapAllocator::new(base, num_pages)
        );
    }
}

pub unsafe fn get() -> &'static mut BitmapAllocator {
    &mut *core::ptr::addr_of_mut!(ALLOC)
}
```

The bitmap (4KB for 32,768 pages) lives in `.bss`. Initialized once at boot. Accessible from anywhere — boot code, page table setup, and now syscall handlers.

This required removing the `&mut BitmapAllocator` parameter from every function that used it: `kvm::init()`, `kvm::map_range()`, `kvm::alloc_zeroed_page()`, `process::launch()`, `process::create_process()`. All of them now call `page_alloc::get()` internally. More `unsafe` blocks, but the safety argument is unchanged: single-hart, interrupts off during trap handling, no concurrent access.

> :angrygoose: "But `static mut` is dangerous!" Yes. The Rust compiler can't prove our single-hart invariant. It warns about `&mut` references to `static mut`. We use `addr_of_mut!()` to create a raw pointer first, then dereference it — semantically identical but satisfies the lint. The real safety comes from architecture: one hart, interrupts disabled in S-mode during ecall handling. The `unsafe` blocks are promises we can keep.

## SYS_ALLOC_PAGES: Getting Physical Memory

```rust
pub fn sys_alloc_pages(frame: &mut TrapFrame) {
    frame.sepc += 4;
    let count = frame.a0;

    if count != 1 {
        frame.a0 = usize::MAX; // only single-page for now
        return;
    }

    let alloc = unsafe { crate::page_alloc::get() };
    match alloc.alloc() {
        Ok(phys) => {
            unsafe { BitmapAllocator::zero_page(phys); }
            frame.a0 = phys;
        }
        Err(_) => {
            frame.a0 = usize::MAX;
        }
    }
}
```

Simple: ask the bitmap allocator for a page, zero it, return the physical address. The process gets a raw physical address — it can't *use* it yet because the page isn't mapped into its virtual address space. That's what SYS_MAP is for.

Why zero the page? Security. The page might have been used by another process before. Without zeroing, the new owner could read stale data — passwords, keys, anything the previous process had in memory. Every page allocation goes through `zero_page()` before the physical address leaves the kernel.

## SYS_MAP: Installing the Mapping

```rust
pub fn sys_map(frame: &mut TrapFrame) {
    frame.sepc += 4;
    let phys = frame.a0;
    let virt = frame.a1;
    let flags_arg = frame.a2;

    // Validate alignment
    if phys % PAGE_SIZE != 0 || virt % PAGE_SIZE != 0 {
        frame.a0 = usize::MAX;
        return;
    }

    // Validate VA range — reject kernel addresses and MMIO
    if virt < 0x5000_0000 || virt >= 0x8000_0000 {
        frame.a0 = usize::MAX;
        return;
    }

    // Validate the process actually owns this physical page
    let alloc = unsafe { crate::page_alloc::get() };
    if !alloc.is_allocated(phys) {
        frame.a0 = usize::MAX;
        return;
    }

    // Translate user flags to PTE flags
    let pte_flags = match flags_arg {
        0 => USER_RW,
        1 => USER_RX,
        _ => { frame.a0 = usize::MAX; return; }
    };

    // Get process's page table root from satp
    let root = kvm::satp_to_root(PROCS[current].satp);

    // Install the mapping
    kvm::map_user_page(root, virt, phys, pte_flags);

    // Flush TLB for this virtual address
    asm!("sfence.vma {}, zero", in(reg) virt);

    frame.a0 = 0;
}
```

Three validation checks before the mapping is installed:

1. **Alignment**: Both addresses must be page-aligned. A misaligned address would corrupt the page table walk.

2. **VA range**: The user can only map into a safe region (0x5000_0000 to 0x7FFF_FFFF). This prevents mapping over kernel addresses, UART MMIO (0x1000_0000), or PLIC registers (0x0C00_0000). A user process that could map over the kernel's code pages could escalate to S-mode.

3. **Ownership**: The physical page must actually be allocated. Without this check, a process could map any physical address — including other processes' pages, kernel memory, or device registers.

The user doesn't get to set arbitrary PTE flags either. They pass a simple enum (0 = read-write, 1 = read-execute), and the kernel translates it to PTE flags with the USER bit always set. No way to create a non-USER mapping from userspace.

> :surprisedgoose: The `sfence.vma` after mapping is critical. Without it, the TLB might cache a "not mapped" translation from before the mapping was installed. The next access to the virtual address would page fault — even though the PTE is now valid. The fence forces the hardware to re-walk the page table on the next access. One instruction, but skipping it causes intermittent page faults that are nearly impossible to debug.

## SYS_UNMAP: Removing a Mapping

```rust
pub fn sys_unmap(frame: &mut TrapFrame) {
    frame.sepc += 4;
    let virt = frame.a0;

    // Walk the page table, clear the leaf PTE
    if kvm::unmap_page(root, virt) {
        asm!("sfence.vma {}, zero", in(reg) virt);
        frame.a0 = 0;
    } else {
        frame.a0 = usize::MAX; // wasn't mapped
    }
}
```

The `unmap_page()` function walks the 3-level page table, finds the leaf PTE, and writes `Pte::INVALID` (all zeros). Another `sfence.vma` to flush the stale TLB entry.

Note: unmap does NOT free the physical page. The page stays allocated. This is intentional — it allows remapping the same physical page at a different virtual address. If you want to release the page back to the kernel, call SYS_FREE_PAGES separately.

## SYS_FREE_PAGES: Returning Memory

```rust
pub fn sys_free_pages(frame: &mut TrapFrame) {
    frame.sepc += 4;
    let phys = frame.a0;

    // Zero the page (security)
    unsafe { BitmapAllocator::zero_page(phys); }

    // Return to allocator
    let alloc = unsafe { crate::page_alloc::get() };
    match alloc.free(phys) {
        Ok(()) => { frame.a0 = 0; }
        Err(_) => { frame.a0 = usize::MAX; }
    }
}
```

Zero first, then free. The allocator's `free()` method checks for double-free (the bit must be set) and invalid addresses (must be in range). If the page is still mapped somewhere, accessing that virtual address after free will read zeroed memory — and eventually, when the page is reallocated to another process, you'd get a cross-process data leak. That's why the caller should SYS_UNMAP first.

## The Complete Lifecycle

Here's what happens inside the kernel for the demo program's memory test:

```
PID 1                           Kernel                          Allocator
─────                           ──────                          ─────────
ecall(a7=8, a0=1)
  ─── trap ───►          sys_alloc_pages()
                          bitmap scan → page 212            bit 212 = 1
                          zero_page(phys)
                          frame.a0 = phys
                      ◄─── sret ───
a0 = 0x4024d000

ecall(a7=6, a0=phys,
  a1=0x60000000, a2=0)
  ─── trap ───►          sys_map()
                          validate alignment ✓
                          validate VA range ✓
                          validate ownership ✓
                          walk_or_create → install PTE
                          sfence.vma
                      ◄─── sret ───
a0 = 0 (success)

sb 0x42, 0(0x60000000)  MMU walks page table
                          VPN[2]=1, VPN[1]=256, VPN[0]=0
                          leaf PTE → phys 0x4024d000
                          store 0x42 at phys+0

lbu t1, 0(0x60000000)   same walk → load 0x42 ✓

ecall(a7=7, a0=0x60000000)
  ─── trap ───►          sys_unmap()
                          walk table → clear PTE
                          sfence.vma
                      ◄─── sret ───

ecall(a7=9, a0=phys, a1=1)
  ─── trap ───►          sys_free_pages()
                          zero_page(phys)
                          bitmap clear                      bit 212 = 0
                      ◄─── sret ───
```

Eight trap entries for the memory lifecycle. Allocate, map, use, unmap, free. The page exists for a few microseconds, does its job, and returns to the pool.

## What We Have Now

```
┌─────┬──────────────────┬────────────────────────────┬──────────┐
│  #  │  Name            │  Purpose                   │  Status  │
├─────┼──────────────────┼────────────────────────────┼──────────┤
│  0  │  SYS_PUTCHAR     │  Debug output (1 byte)     │  ✓       │
│  1  │  SYS_EXIT        │  Terminate process         │  ✓       │
│  2  │  SYS_SEND        │  Sync send (blocks)        │  ✓       │
│  3  │  SYS_RECEIVE     │  Sync receive (blocks)     │  ✓       │
│  4  │  SYS_CALL        │  RPC: send + wait reply    │  ✓       │
│  5  │  SYS_REPLY       │  Deliver reply (no block)  │  ✓       │
│  6  │  SYS_MAP         │  Map phys → virt           │  ✓       │
│  7  │  SYS_UNMAP       │  Remove mapping            │  ✓       │
│  8  │  SYS_ALLOC_PAGES │  Get physical page         │  ✓       │
│  9  │  SYS_FREE_PAGES  │  Return page to kernel     │  ✓       │
│ 10  │  SYS_SPAWN       │  Create process from ELF   │          │
│ 11  │  SYS_WAIT        │  Block until child exits   │          │
│ 12  │  SYS_GETPID      │  Query own PID             │          │
│ 13  │  SYS_YIELD       │  Voluntary preemption      │          │
│ 14  │  SYS_SET_TIMER   │  Timer notification        │          │
│ 15  │  SYS_GRANT       │  Share pages cross-process │          │
│ 16  │  SYS_IRQ_REGISTER│  Claim hardware IRQ        │          │
│ 17  │  SYS_IRQ_ACK     │  Acknowledge IRQ handled   │          │
└─────┴──────────────────┴────────────────────────────┴──────────┘
```

Ten down, eight to go. The kernel can now communicate (IPC), compute (user code), and manage memory (page lifecycle). These three capabilities are the foundation for everything that follows: loading real programs from ELF binaries, building a userspace heap allocator, and eventually running the wasmi WASM interpreter with dynamically growing linear memory.

Next chapter: the implementation details, the demo program, and proof on silicon.
