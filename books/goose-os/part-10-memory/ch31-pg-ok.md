---
sidebar_position: 2
sidebar_label: "Ch 31: Pg ok!"
title: "Chapter 31: Pg ok! — Proving Memory Management on Silicon"
---

# Chapter 31: Pg ok! — Proving Memory Management on Silicon

Chapter 30 designed the syscalls. This chapter writes the demo, runs it, and proves the full page lifecycle works on real hardware.

## The Test Program

The demo proves every step of the memory lifecycle in sequence:

1. **Allocate** a physical page
2. **Map** it at virtual address 0x60000000
3. **Write** a test byte (0x42, 'B') through the mapping
4. **Read** it back and verify
5. **Report** success via RPC to the UART server
6. **Unmap** the page
7. **Free** it back to the kernel

If any step fails, the process exits with code 1. If all steps succeed, it prints "Pg ok!" and exits with code 0. Simple, binary, unmistakable.

### PID 1: The Memory Test Client

```asm
_user_init_start:
    li      s0, 2               # server PID
    li      s2, 0x60000000      # target VA for mapped page

    # Step 1: Allocate a physical page
    li      a7, 8               # SYS_ALLOC_PAGES
    li      a0, 1               # count = 1
    ecall
    li      t0, -1
    beq     a0, t0, .fail       # check for error
    mv      s1, a0              # save phys addr in s1

    # Step 2: Map at VA 0x60000000 (USER_RW)
    li      a7, 6               # SYS_MAP
    mv      a0, s1              # physical address
    mv      a1, s2              # virtual address
    li      a2, 0               # flags = USER_RW
    ecall
    li      t0, -1
    beq     a0, t0, .fail

    # Step 3: Write test byte
    li      t0, 0x42            # 'B'
    sb      t0, 0(s2)           # store at mapped address

    # Step 4: Read back and verify
    lbu     t1, 0(s2)           # load unsigned byte
    bne     t0, t1, .fail       # mismatch = fail

    # Step 5: Report "Pg ok!\n" via RPC
    # ... SYS_CALL for each character ...

    # Step 6: Unmap
    li      a7, 7               # SYS_UNMAP
    mv      a0, s2
    ecall

    # Step 7: Free
    li      a7, 9               # SYS_FREE_PAGES
    mv      a0, s1
    li      a1, 1
    ecall

    # Exit success
    li      a7, 1
    li      a0, 0
    ecall

.fail:
    li      a7, 1
    li      a0, 1               # exit code 1 = failure
    ecall
```

Notice the error checking: after SYS_ALLOC_PAGES and SYS_MAP, the code checks if `a0 == -1` (usize::MAX) and branches to `.fail`. In a real system, error handling would be more sophisticated. In a proof-of-concept, "exit with code 1" tells us everything we need to know.

The register strategy:
- `s0` = server PID (survives all ecalls)
- `s1` = physical address from SYS_ALLOC_PAGES (needed for SYS_MAP and SYS_FREE_PAGES)
- `s2` = virtual address constant (needed for store, load, SYS_UNMAP)

All three are callee-saved registers, so they survive every ecall and the RPC round-trips to the server.

### PID 2: Same Server, New Client

The UART server is unchanged from Phase 9:

```asm
_user_srv_start:
1:
    li      a7, 3           # SYS_RECEIVE
    li      a0, 0           # from any
    ecall

    mv      s0, a0          # save character
    mv      s1, a1          # save sender PID

    li      a7, 0           # SYS_PUTCHAR
    mv      a0, s0
    ecall

    li      a7, 5           # SYS_REPLY
    mv      a0, s1
    li      a1, 0           # ACK
    ecall

    j       1b
```

The server doesn't know or care that the client is doing memory management between calls. It receives characters, prints them, replies. The SYS_CALL/SYS_REPLY pattern is completely orthogonal to the memory syscalls — IPC and memory are independent kernel subsystems that compose cleanly.

> :happygoose: This is the microkernel composability promise: each subsystem does one thing, and they combine without interference. The memory syscalls don't touch IPC state. The IPC syscalls don't touch page tables. A process can freely interleave memory operations with RPC calls. No ordering constraints, no hidden dependencies, no "you must allocate before sending" rules.

## What the MMU Sees

When PID 1 executes `sb t0, 0(s2)` (store byte at 0x60000000), the hardware page table walker kicks in:

```
Virtual address: 0x60000000
  VPN[2] = (0x60000000 >> 30) & 0x1FF = 1
  VPN[1] = (0x60000000 >> 21) & 0x1FF = 256
  VPN[0] = (0x60000000 >> 12) & 0x1FF = 0
  Offset  = 0x60000000 & 0xFFF        = 0

Page table walk:
  root[1]   → level-1 table (branch PTE)
  level1[256] → level-0 table (branch PTE, created by SYS_MAP)
  level0[0]  → leaf PTE: phys=0x4024d000, flags=USER_RW ✓

Physical address: 0x4024d000 + 0 = 0x4024d000
Store: *(0x4024d000) = 0x42
```

The `lbu` that follows walks the same path, reads back 0x42, and the branch to `.fail` is not taken. The mapping works.

After SYS_UNMAP clears the leaf PTE and flushes the TLB, any access to 0x60000000 would trigger a store/load page fault. The virtual address exists in the 39-bit space, but no PTE maps it anymore. The page is inaccessible — exactly what we want after cleanup.

## Boot Output: VisionFive 2

```
          __
       __( o)>     GooseOS v0.1.0 build 25
      \  _/        RISC-V 64-bit
       \\\         Written in Rust
        \\\        Platform: VisionFive 2 (JH7110)
         \   )_    Honk.
      ~~~^~~~~

  Booted on hart 1
  ...
  [proc] Creating processes...
  [proc] PID 1 created (code=0x4024d000, ...)
  [proc] PID 2 created (code=0x40294000, ...)

  [page_alloc] 211 pages used, 32021 free

  [proc] Launching PID 1 (init)...

Pg ok!

  [kernel] PID 1 exited with code 0
  [kernel] All processes finished.
  [kernel] Back in S-mode. Idle loop active.
```

"Pg ok!" and exit code 0. The full lifecycle — allocate, map, write, read, verify, unmap, free — completed on the SiFive U74 core at 1.5GHz with real Sv39 page table walks through actual silicon.

## What Changed

| Component | Changed? | What |
|-----------|----------|------|
| page_alloc.rs | Refactored | Global static allocator, `get()` accessor |
| kvm.rs | Refactored + new | Removed alloc params; added `unmap_page()`, `map_user_page()`, `satp_to_root()` |
| process.rs | New syscalls | `sys_map()`, `sys_unmap()`, `sys_alloc_pages()`, `sys_free_pages()` |
| trap.rs | Extended | 4 new syscall constants + dispatch arms |
| main.rs | Updated | Uses `page_alloc::init()` + `get()` instead of local variable |
| Demo programs | Updated | PID 1 tests memory lifecycle before RPC output |

The biggest change wasn't the syscalls — it was the allocator refactor. Moving from a stack-local `&mut BitmapAllocator` to a `static mut` global with `addr_of_mut!()` access was the prerequisite for everything else. Syscall handlers run from trap context, not from kmain's call stack. They need global state.

## Security Properties

The memory syscalls maintain three invariants:

1. **No cross-process access.** SYS_MAP validates that the physical page is allocated. A process can't map another process's pages because it doesn't know their physical addresses, and even if it guessed correctly, the page table walk is per-process (different satp).

2. **No kernel escalation.** SYS_MAP restricts virtual addresses to 0x5000_0000-0x7FFF_FFFF and always sets the USER PTE flag. A process can't map over kernel code or create non-USER mappings.

3. **No data leakage.** Every page is zeroed on allocation and on free. A freed page contains no trace of its previous contents. A newly allocated page contains no trace of any other process.

> :angrygoose: These are necessary but not sufficient for a production kernel. We don't track per-process page ownership — any process can free any allocated page, even one it didn't allocate. We don't enforce memory quotas — a process can allocate until OOM. We don't check for double-mapping — a process could map the same physical page at two different virtual addresses. All of these are future work. For now, the invariants hold because we have exactly two cooperative processes. Real security requires capabilities (Phase 13).

## Looking Forward

With memory management, processes can now:
- Allocate dynamic buffers for data processing
- Grow heaps for complex data structures
- Map shared memory regions (foundation for SYS_GRANT in Phase 13)
- Support Rust's `GlobalAlloc` trait for userspace `alloc` crate

The next phases build on this:
- **Phase 11** (SYS_SPAWN): Load ELF binaries into freshly allocated pages
- **Phase 13** (SYS_GRANT): Share physical pages between processes
- **Phase 15** (wasmi): The WASM runtime's linear memory uses SYS_ALLOC_PAGES + SYS_MAP to grow

The goose can now manage its own nest. Time to let it raise some goslings.
