---
sidebar_position: 1
sidebar_label: "Ch 32: Process Lifecycle"
title: "Chapter 32: Process Lifecycle — Spawn, Wait, and Die"
---

# Chapter 32: Process Lifecycle — Spawn, Wait, and Die

Until now, every process in GooseOS has been created by the kernel during boot. We hardcode assembly programs into `global_asm!` blocks, allocate pages, copy bytes, build page tables, and launch. That's fine for testing, but it's not how real operating systems work.

Real processes are born at runtime. A running process asks the kernel to create a new process from an executable binary. The parent waits for the child to finish. The child runs, produces a result, and exits. The parent collects the result and continues. This is the **process lifecycle** — and it requires three new syscalls.

## The Three Lifecycle Syscalls

| Syscall | Number | Convention | Returns |
|---------|--------|-----------|---------|
| `SYS_GETPID` | 12 | (no args) | `a0` = caller's PID |
| `SYS_SPAWN` | 10 | `a0` = ELF ptr, `a1` = ELF len | `a0` = new PID (or `usize::MAX`) |
| `SYS_WAIT` | 11 | `a0` = child PID | `a0` = child's exit code |

These map to the fundamental lifecycle operations:

1. **Identity** — who am I? (`SYS_GETPID`)
2. **Creation** — make a new process (`SYS_SPAWN`)
3. **Synchronization** — wait for it to finish (`SYS_WAIT`)
4. **Termination** — we already have this: `SYS_EXIT`

> :nerdygoose: Linux has `fork()`+`exec()` — two syscalls where `fork` copies the parent's entire address space and `exec` replaces it with a new binary. This made sense on PDP-11 in 1970 when processes were tiny. Today, `fork` on a process with 4GB of mapped memory triggers copy-on-write for thousands of page table entries. seL4 doesn't have `fork` at all — process creation is done entirely in userspace by manipulating capabilities. GooseOS takes a middle path: `SYS_SPAWN` combines creation and loading in one syscall. No copying the parent, no capability juggling. One call, one new process.

## SYS_GETPID — The Simplest Syscall

```rust
pub fn sys_getpid(frame: &mut TrapFrame) {
    frame.sepc += 4;
    frame.a0 = unsafe { CURRENT_PID };
}
```

Three lines. Read the global, write the register, advance past `ecall`. Every other syscall in the kernel is more complex than this. It exists because processes need to know their own identity — for IPC addressing, for logging, for lifecycle management.

## SYS_SPAWN — From ELF to Running Process

This is the big one. `SYS_SPAWN` takes a pointer to an ELF binary in the caller's address space, parses it, allocates pages, copies segments, builds a page table, and registers a new process — all in one syscall.

### The Algorithm

```
sys_spawn(elf_ptr, elf_len):
    1. Validate inputs
    2. Enable SUM (S-mode User Memory access)
    3. Parse ELF headers
    4. Find a free process slot
    5. Create a new page table
    6. For each PT_LOAD segment:
       a. Calculate pages needed
       b. Allocate + zero each page
       c. Copy file data (page-boundary aware)
       d. Map page with correct permissions
    7. Allocate + map user stack
    8. Set up initial context (sepc, sp, sstatus)
    9. Register process as Ready
```

### The SUM Bit — A RISC-V Subtlety

Here's something that tripped us up. When a trap occurs from U-mode, the CPU saves the user's registers and jumps to our trap handler in S-mode. But it does NOT switch the page table. The user's `satp` is still active.

This means our kernel code can access kernel memory (identity-mapped into every page table) but what about user memory? The user's ELF data is at a virtual address in the user's page table, mapped with the U (User) bit set.

By default, S-mode **cannot** access pages with the U bit. This is a security feature — it prevents the kernel from accidentally dereferencing user pointers. But `SYS_SPAWN` needs to read the user's ELF data. Enter the SUM bit:

```rust
// Enable Supervisor User Memory access (SUM bit in sstatus).
// Without this, S-mode cannot read pages with the U bit set.
unsafe { asm!("csrs sstatus, {}", in(reg) 1usize << 18); }
```

SUM (bit 18 of `sstatus`) tells the CPU: "yes, S-mode is allowed to access U-bit pages." We set it before reading the ELF data. `trap.S` will restore the original `sstatus` before `sret`, so it only affects the current syscall handling.

> :angrygoose: The SUM bit exists because of a nasty class of kernel vulnerabilities. If S-mode can always access user pages, then a confused kernel might accidentally dereference a user-controlled pointer, accessing (and modifying) whatever the user mapped there. With SUM off by default, the CPU raises a page fault if the kernel tries to touch user memory — an accidental dereference crashes cleanly instead of becoming an exploit. We only enable SUM when we explicitly intend to read user memory.

### Page-Boundary-Aware Segment Copying

ELF segments can span multiple pages, and a segment's virtual address might not be page-aligned. The loader must handle the overlap correctly:

```
ELF segment:  vaddr=0x10040  filesz=0x1F80  memsz=0x2000
              ├── page 0: 0x10000 ──────┤
              │   offset 0x40: copy 0xFC0 bytes from file  │
              ├── page 1: 0x11000 ──────┤
              │   copy 0xF80 bytes from file               │
              │   zero 0x80 bytes (BSS)                    │
              ├── page 2: 0x12000 ──────┤
              │   zero entire page (BSS)                   │
              └─────────────────────────┘
```

The algorithm calculates the overlap between each page's VA range and the segment's file data range:

```rust
for p in 0..num_pages {
    let va = base_va + p * PAGE_SIZE;
    let page = kvm::alloc_zeroed_page();

    let page_start = va;
    let page_end = va + PAGE_SIZE;
    let seg_file_start = seg.vaddr;
    let seg_file_end = seg.vaddr + seg.filesz;

    // Overlap between page range and file data range
    let copy_start = max(seg_file_start, page_start);
    let copy_end = min(seg_file_end, page_end);

    if copy_start < copy_end {
        let file_offset = seg.file_offset + (copy_start - seg.vaddr);
        let dst_offset = copy_start - page_start;
        let len = copy_end - copy_start;
        // Copy len bytes from ELF file to page
    }
    // BSS bytes are already zeroed by alloc_zeroed_page()

    kvm::map_user_page(user_root, va, page, flags);
}
```

Pages are zeroed on allocation, so BSS (the portion where `memsz > filesz`) is automatically zero-initialized. No explicit `memset` needed.

> :surprisedgoose: This boundary-aware copy is one of those things that's easy to get wrong. Off-by-one on the page boundary, incorrect file offset calculation, forgetting that `vaddr` might not be page-aligned — any of these produces a "works on this binary, crashes on that one" bug. We test with a 180-byte ELF that fits in a single page, but the algorithm handles multi-page segments correctly because we'll need it for larger binaries later.

### The Stack

Every new process needs a stack. `SYS_SPAWN` allocates one page and maps it at a fixed virtual address:

```rust
let user_stack = kvm::alloc_zeroed_page();
let stack_va = 0x7FFF_0000;
kvm::map_user_page(user_root, stack_va, user_stack, USER_RW);
let user_sp = stack_va + PAGE_SIZE; // SP starts at top
```

The stack grows downward in RISC-V, so `sp` starts at the top of the page (`0x7FFF_1000`). One page (4KB) is enough for our simple programs. Later, we could implement guard pages and demand-paged stack growth.

### Parent Tracking

When `SYS_SPAWN` creates a process, it records who spawned it:

```rust
PROCS[new_pid] = Process {
    pid: new_pid,
    state: ProcessState::Ready,
    satp,
    context: ctx,
    parent: current_pid,  // ← who created us
    exit_code: 0,
    // ...
};
```

The `parent` field enables `SYS_WAIT` — only the parent that spawned a process can wait for it. This prevents arbitrary processes from intercepting each other's exit codes.

## SYS_WAIT — Blocking Until a Child Exits

```rust
pub fn sys_wait(frame: &mut TrapFrame) {
    frame.sepc += 4;

    let current = unsafe { CURRENT_PID };
    let child_pid = frame.a0;

    unsafe {
        // Only the parent can wait for its child
        if PROCS[child_pid].parent != current {
            frame.a0 = usize::MAX;
            return;
        }

        // Already exited? Return immediately.
        if PROCS[child_pid].state == ProcessState::Free {
            frame.a0 = PROCS[child_pid].exit_code;
            return;
        }

        // Child still running — block
        PROCS[current].ipc_target = child_pid;
        PROCS[current].state = ProcessState::BlockedWait;
        schedule(frame, current);
    }
}
```

Three cases:
1. **Not your child** → error
2. **Child already exited** → return exit code immediately
3. **Child still running** → block until it exits

### Waking the Parent

When a process calls `SYS_EXIT`, the exit handler scans for a parent blocked on `BlockedWait`:

```rust
// In sys_exit:
for i in 1..MAX_PROCS {
    if PROCS[i].state == ProcessState::BlockedWait
        && PROCS[i].ipc_target == current
    {
        PROCS[i].context.a0 = exit_code;  // deliver exit code
        PROCS[i].state = ProcessState::Ready;
        break;
    }
}
```

The exit code flows from child to parent through `context.a0` — the register that `SYS_WAIT` returns in.

> :happygoose: The `BlockedWait` state reuses the same mechanism as `BlockedSend` and `BlockedRecv`: save context, update state, call `schedule()`. The scheduler doesn't care *why* a process is blocked — it just skips non-Ready processes. One mechanism, many uses. This is the microkernel philosophy: small primitives, composed into higher-level patterns.

## The State Machine (Updated)

```
              SYS_SPAWN
                 │
                 ▼
    ┌─── Free ──────── Ready ◄──────────┐
    │                    │               │
    │            schedule │               │
    │                    ▼               │
    │    SYS_EXIT ── Running            │
    │                    │               │
    │     ┌──────────────┼──────────┐    │
    │     ▼              ▼          ▼    │
    │  BlockedSend  BlockedRecv  BlockedCall
    │     │              │          │    │
    │     └──── rendezvous ─────────┘    │
    │                                    │
    │  BlockedWait ──────────────────────┘
    │     ▲           child exits
    │     │
    └─── SYS_WAIT
```

Seven states. Each transition is triggered by exactly one syscall or one event (rendezvous, child exit, schedule). No ambiguity, no races (single-hart), no undefined states.

## The Hand-Crafted ELF

To test `SYS_SPAWN`, we need an ELF binary in user memory. But our init process is embedded assembly — it has no filesystem, no data section. So we cheat in the best way: the kernel maps a hand-crafted ELF binary into init's address space before launching it.

The child ELF is 180 bytes, crafted at the byte level:

```
Offset  Content                 Description
──────────────────────────────────────────────────────
0x00    7F 45 4C 46 02 01...   ELF64 header (64 bytes)
0x40    01 00 00 00 05 00...   Program header: 1 PT_LOAD (56 bytes)
0x78    93 08 00 00             addi a7, zero, 0  (SYS_PUTCHAR)
0x7C    13 05 80 04             addi a0, zero, 'H'
0x80    73 00 00 00             ecall
        ...                     (prints "Hi!\n")
0xA8    93 08 10 00             addi a7, zero, 1  (SYS_EXIT)
0xAC    13 05 A0 02             addi a0, zero, 42 (exit code)
0xB0    73 00 00 00             ecall
```

15 RISC-V instructions. Entry point at VA `0x10078`. The entire binary — headers, program header, code — loads as a single PT_LOAD segment at VA `0x10000`.

### Building the ELF by Hand

Each instruction is encoded according to the RISC-V I-type format:

```
  31        20  19  15  14  12  11   7  6     0
 ┌───────────┬──────┬──────┬──────┬────────┐
 │ imm[11:0] │ rs1  │funct3│  rd  │ opcode │
 └───────────┴──────┴──────┴──────┴────────┘
```

For `addi a7, zero, 0` (set syscall number to SYS_PUTCHAR):
- `imm` = 0, `rs1` = x0 (zero), `funct3` = 000, `rd` = x17 (a7), `opcode` = 0010011
- Binary: `000000000000_00000_000_10001_0010011` = `0x00000893`
- Little-endian bytes: `93 08 00 00`

For `ecall`:
- Encoding: `0x00000073`
- Little-endian bytes: `73 00 00 00`

Every byte in the 180-byte array is hand-verified. One wrong bit and the CPU either executes garbage or the ELF parser rejects the binary.

> :angrygoose: Hand-crafting ELF binaries is how operating systems were bootstrapped before cross-compilation toolchains existed. The first compiler for a new architecture was written by someone encoding instructions by hand, byte by byte, into a binary format. We're doing the same thing here — and it makes for a great exercise in understanding both the ELF format and the RISC-V ISA at the bit level. But we'll automate this as soon as we set up a proper user-space build system.

## The Primitive "InitFS"

The kernel maps the child ELF binary into PID 1's address space at boot:

```rust
// In launch():
let elf_page = kvm::alloc_zeroed_page();
unsafe {
    let src = CHILD_ELF.as_ptr();
    let dst = elf_page as *mut u8;
    for i in 0..CHILD_ELF.len() {
        core::ptr::write_volatile(dst.add(i), *src.add(i));
    }
}
let root1 = kvm::satp_to_root(unsafe { PROCS[1].satp });
kvm::map_user_page(root1, 0x5F00_0000, elf_page, USER_RW);
```

Init sees the ELF at VA `0x5F000000` and passes it to `SYS_SPAWN`. This is a one-page "initfs" — the simplest possible mechanism. Later, we'll build a real in-memory filesystem for loading multiple binaries.

## What Linux and seL4 Do

### Linux: fork() + exec()

Linux's process creation is the `fork()`+`exec()` two-step:

```c
pid_t pid = fork();      // Clone the current process
if (pid == 0) {
    exec("/bin/hello");   // Replace with new binary
} else {
    waitpid(pid, &status, 0);
}
```

`fork()` creates a copy of the parent (using copy-on-write page table magic). `exec()` throws away the copy and loads a new binary. This seems wasteful — why copy everything just to throw it away? — but the `fork`/`exec` split enables powerful patterns like I/O redirection between the `fork` and `exec`.

Modern Linux also has `posix_spawn()` and `clone3()` which combine creation and loading. The old model persists because of 50 years of backwards compatibility.

### seL4: Userspace Construction

seL4 doesn't have spawn or fork. Process creation is done entirely in userspace by the root task, using capabilities:

1. Allocate memory capabilities for the new process
2. Create a TCB (Thread Control Block) capability
3. Create a VSpace (page table) capability
4. Map pages into the new VSpace
5. Copy the ELF segments into the pages
6. Configure the TCB with entry point and stack
7. Resume the TCB

This gives the root task complete control over resource allocation — no kernel policy, pure mechanism. It's powerful but verbose.

### GooseOS: One Syscall

```
SYS_SPAWN(elf_ptr, elf_len) → new_pid
```

The kernel handles ELF parsing, page allocation, page table construction, and context setup. Simpler than both Linux and seL4. Less flexible too — but flexibility isn't our priority. Clarity is.

## Syscall Count: 13 and Counting

After Phase 11, GooseOS has 13 syscalls:

| # | Name | Phase | Category |
|---|------|-------|----------|
| 0 | SYS_PUTCHAR | 7 | I/O |
| 1 | SYS_EXIT | 7 | Lifecycle |
| 2 | SYS_SEND | 7 | IPC |
| 3 | SYS_RECEIVE | 7 | IPC |
| 4 | SYS_CALL | 9 | IPC |
| 5 | SYS_REPLY | 9 | IPC |
| 6 | SYS_MAP | 10 | Memory |
| 7 | SYS_UNMAP | 10 | Memory |
| 8 | SYS_ALLOC_PAGES | 10 | Memory |
| 9 | SYS_FREE_PAGES | 10 | Memory |
| 10 | SYS_SPAWN | 11 | Lifecycle |
| 11 | SYS_WAIT | 11 | Lifecycle |
| 12 | SYS_GETPID | 11 | Lifecycle |

Five more to go. Next: scheduling (SYS_YIELD, SYS_SET_TIMER), shared memory (SYS_GRANT), and device management (SYS_IRQ_REGISTER, SYS_IRQ_ACK).

## What's Next

We now have all the pieces for a complete process model:
- Processes can be created from ELF binaries at runtime
- Parents can wait for children and collect exit codes
- Processes communicate via synchronous IPC
- Processes manage their own memory

What we don't have yet: **preemption**. Every process runs until it blocks or exits voluntarily. A process that loops forever will starve everyone else. Part 12 adds a timer-driven scheduler that forces context switches — fair CPU sharing for all.
