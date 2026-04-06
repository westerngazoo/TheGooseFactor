---
sidebar_position: 1
sidebar_label: "Ch 22: The Process Table"
title: "Chapter 22: The Process Table — From One Process to Eight Tombstones"
---

# Chapter 22: The Process Table — From One Process to Eight Tombstones

Part 6 proved that userspace works. One process. One ecall at a time. One lonely init process printing "Honk!" character by character, then exiting into the void.

Heartwarming. Also useless.

A real operating system runs *multiple* processes. They need to take turns. They need to communicate. They need to die gracefully. And the kernel needs to track all of this without heap allocation — because we don't have one. We have a bitmap allocator that hands out 4KB pages. Try fitting a process control block in 4KB. Actually, never mind — try fitting the *bookkeeping overhead* for a linked list of processes into zero bytes of dynamic allocation.

The answer is a fixed-size array. Eight slots. Static. Boring. Bulletproof.

## The State Machine

Every process in GooseOS can be in exactly one of five states:

```
                    ┌─────────┐
                    │  Free   │ ◄──── slot unused
                    └────┬────┘
                         │ create_process()
                         ▼
                    ┌─────────┐
             ┌─────│  Ready  │◄────────────────────┐
             │     └────┬────┘                      │
             │          │ schedule() picks us        │
             │          ▼                            │
             │     ┌──────────┐                     │
             │     │ Running  │                     │
             │     └────┬─────┘                     │
             │          │                           │
             │    ┌─────┴──────────┐                │
             │    │                │                │
             │    ▼                ▼                │
             │ ┌───────────┐  ┌───────────┐        │
             │ │BlockedSend│  │BlockedRecv│        │
             │ └─────┬─────┘  └─────┬─────┘        │
             │       │              │               │
             │       │  rendezvous  │               │
             │       └──────┬───────┘               │
             │              │                       │
             │              └───────────────────────┘
             │
             │ sys_exit()
             ▼
        ┌─────────┐
        │  Free   │ ◄──── back to the grave
        └─────────┘
```

Five states, six transitions. No "Zombie" state, no "Sleeping," no "Stopped," no "Traced." Linux's `task_struct` has 13 states and a comment that says "don't add more." We have five and a comment that says "this is enough."

> :nerdygoose: Why no Zombie state? In Unix, a zombie is a process that has exited but whose parent hasn't called `wait()` yet. We don't have parents. We don't have `wait()`. When a process exits, it's *gone*. Slot freed. No funeral, no obituary, no forwarding address. In a microkernel, dead processes don't linger — they just stop existing. Less existential dread for the kernel, more existential dread for the philosopher.

## The Process Control Block

Each process needs enough state for the kernel to manage it:

```rust title="src/process.rs — Process state machine and PCB"
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum ProcessState {
    Free,           // Slot is unused
    Ready,          // Can be scheduled
    Running,        // Currently executing
    BlockedSend,    // Waiting for receiver to call RECEIVE
    BlockedRecv,    // Waiting for sender to call SEND
}

#[derive(Clone, Copy)]
pub struct Process {
    pub pid: usize,
    pub state: ProcessState,
    pub satp: u64,
    pub context: TrapFrame,     // Saved registers (for context switch)
    // IPC state
    pub ipc_target: usize,      // Who we're sending to / expecting from (0 = any)
    pub ipc_value: usize,       // Message being sent
}
```

Let's walk through each field:

**`pid`** — Process identifier. PIDs 1–7 are valid. PID 0 is reserved for the kernel (it never runs as a process, but reserving slot 0 means array indices equal PIDs, which eliminates an entire class of off-by-one bugs).

**`state`** — Where in the state machine this process currently lives. Determines what the scheduler does with it.

**`satp`** — This process's Sv39 page table root. When we switch to this process, we write this value to the `satp` CSR. Each process sees its own virtual address space.

**`context`** — A full `TrapFrame` — all 31 GPRs plus `sstatus` and `sepc`. When a process is suspended, its entire register state lives here. When it's resumed, this gets copied onto the kernel stack and `sret` restores it. This is the *soul* of the process — destroy it and the process ceases to exist in any meaningful way.

**`ipc_target`** — Who this process wants to talk to. For a blocked sender, it's the receiver's PID. For a blocked receiver, it's the expected sender PID (0 = "accept from anyone"). For running/ready processes, it's meaningless.

**`ipc_value`** — The message being sent. In our current implementation, this is a single `usize` — enough for a character, a status code, or a small integer. seL4 passes up to 64 words in message registers. We pass one. Baby steps.

The `empty()` constructor gives us a zeroed-out slot:

```rust title="src/process.rs — empty slot constructor"
impl Process {
    const fn empty() -> Self {
        Process {
            pid: 0,
            state: ProcessState::Free,
            satp: 0,
            context: TrapFrame::zero(),
            ipc_target: 0,
            ipc_value: 0,
        }
    }
}
```

`const fn` means this runs at compile time. The initial process table is baked into the binary — no runtime initialization needed.

## The Process Table

The kernel's global state fits in two lines:

```rust title="src/process.rs — global state"
/// Process table — fixed size, no heap allocation.
/// PID 0 is reserved (kernel). Processes use PIDs 1..MAX_PROCS-1.
static mut PROCS: [Process; MAX_PROCS] = [Process::empty(); MAX_PROCS];

/// PID of the currently running process.
static mut CURRENT_PID: usize = 0;
```

Eight slots. One `usize` to track who's running. That's it.

```
PROCS array:
┌─────────────────────────────────────────────────────────┐
│ [0]      │ [1]      │ [2]      │ [3]  │ ... │ [7]      │
│ Reserved │ init     │ UART srv │ Free │     │ Free     │
│ (kernel) │ PID 1    │ PID 2    │      │     │          │
└─────────────────────────────────────────────────────────┘
                ▲
                │
          CURRENT_PID = 1
```

> :angrygoose: "But `static mut` is unsafe!" Yes. Every access requires an `unsafe` block. The Rust community would prefer we use `Mutex<RefCell<OnceCell<Option<Arc<ProcessTable>>>>>` or whatever the abstraction du jour is. We're writing an OS kernel. There is no allocator. There is no threading runtime. There is one hart, one execution context, and interrupts are disabled during syscall handling. `static mut` is the correct tool. If you're writing a web server, use a Mutex. If you're writing a kernel, own your globals. The `unsafe` blocks aren't a warning — they're documentation that says "I know exactly what I'm doing here."

## Why Fixed-Size?

Three reasons, in order of importance:

1. **No allocator dependency.** The process table exists before the page allocator initializes. It's in `.bss`. It's zeroed by `boot.S`. It just *exists*.

2. **Bounded resource usage.** The kernel can never create more than 8 processes. This means every loop over the process table terminates in bounded time. Every scan for a ready process takes at most 8 iterations. Formal verification *loves* bounded loops.

3. **Cache-friendly.** Eight `Process` structs fit in a few cache lines. A linked list would scatter them across the heap, causing cache misses on every scheduler decision. Not that we have a cache on our VisionFive 2, but the principle stands.

The trade-off: we can't create process 9. If 8 isn't enough, change `MAX_PROCS` and recompile. This is an educational OS, not AWS Lambda.

## The Embedded User Programs

In a real OS, user programs live on a filesystem. We don't have a filesystem. We don't even have a block device driver. So our user programs live inside the kernel binary, embedded via `global_asm!`:

```rust title="src/process.rs — init process (PID 1)"
// Program 1: init (PID 1)
// Sends "Honk! IPC works!\n" to PID 2, one character per SYS_SEND.
// Then exits with code 0.
global_asm!(r#"
.section .text
.balign 4
.global _user_init_start
.global _user_init_end

_user_init_start:
    # ─── GooseOS init process (PID 1) ───
    # Sends each character to the UART server (PID 2) via SYS_SEND.
    # Syscall: a7=2 (SYS_SEND), a0=target PID, a1=message value

    li      s0, 2           # target PID (s0 survives ecalls)
    li      a7, 2           # SYS_SEND

    mv a0, s0
    li a1, 0x48             # 'H'
    ecall
    mv a0, s0
    li a1, 0x6F             # 'o'
    ecall
    mv a0, s0
    li a1, 0x6E             # 'n'
    ecall
    mv a0, s0
    li a1, 0x6B             # 'k'
    ecall
    mv a0, s0
    li a1, 0x21             # '!'
    ecall
    mv a0, s0
    li a1, 0x20             # ' '
    ecall
    mv a0, s0
    li a1, 0x49             # 'I'
    ecall
    mv a0, s0
    li a1, 0x50             # 'P'
    ecall
    mv a0, s0
    li a1, 0x43             # 'C'
    ecall
    mv a0, s0
    li a1, 0x20             # ' '
    ecall
    mv a0, s0
    li a1, 0x77             # 'w'
    ecall
    mv a0, s0
    li a1, 0x6F             # 'o'
    ecall
    mv a0, s0
    li a1, 0x72             # 'r'
    ecall
    mv a0, s0
    li a1, 0x6B             # 'k'
    ecall
    mv a0, s0
    li a1, 0x73             # 's'
    ecall
    mv a0, s0
    li a1, 0x21             # '!'
    ecall
    mv a0, s0
    li a1, 0x0A             # '\n'
    ecall

    # Exit
    li      a7, 1           # SYS_EXIT
    li      a0, 0           # exit code 0
    ecall

1:  j       1b
_user_init_end:
"#);
```

Seventeen characters. Seventeen SYS_SEND ecalls. One SYS_EXIT. An infinite loop after the exit that will never execute (but the assembler doesn't know that, and neither does your optimism).

Note the use of `s0` to hold the target PID. In the RISC-V calling convention, `s0`–`s11` are callee-saved registers. Our ecall handler preserves all registers in the TrapFrame, so `s0` survives every ecall. The `a0` and `a1` registers are arguments — they get clobbered by return values.

The second program is the UART server:

```rust title="src/process.rs — UART server (PID 2)"
// Program 2: UART server (PID 2)
// Infinite loop: receive a message (character), print it via SYS_PUTCHAR.
global_asm!(r#"
.section .text
.balign 4
.global _user_srv_start
.global _user_srv_end

_user_srv_start:
    # ─── GooseOS UART server (PID 2) ───
    # Receives messages from any process, prints each character.
    # Syscall: a7=3 (SYS_RECEIVE), a0=from_pid (0=any)
    # Returns: a0=message value, a1=sender PID
1:
    li      a7, 3           # SYS_RECEIVE
    li      a0, 0           # from any sender
    ecall
    # a0 now = character, a1 = sender PID

    mv      s0, a0          # save character (s0 survives ecalls)

    li      a7, 0           # SYS_PUTCHAR
    mv      a0, s0          # the character
    ecall

    j       1b              # loop forever

_user_srv_end:
"#);
```

Four instructions in the loop: load syscall number, load source filter, ecall, save result. Then three more to print: load syscall number, load argument, ecall. Then jump back. Seven instructions per character received and printed.

This is a *server* in the microkernel sense. It doesn't run all the time — it blocks on SYS_RECEIVE until someone sends it a message. When a message arrives, it wakes up, prints the character, and blocks again. No busy-waiting. No polling. Pure event-driven, in 28 bytes of machine code.

> :surprisedgoose: "Wait, the UART *driver* is a userspace process?" Yes — and that's the whole point of a microkernel. In Linux, the UART driver runs in the kernel (with full access to everything). In GooseOS, the UART server is PID 2, running in U-mode, isolated by page tables. It can only print characters because the kernel's SYS_PUTCHAR syscall still lives in the kernel trap handler. In a fully-realized microkernel, even SYS_PUTCHAR would be replaced by IPC to a UART driver that holds an MMIO capability. We're halfway there.

## Creating a Process

The `create_process()` function takes a PID, a pointer to the embedded code, its size, and the page allocator. It builds an entire process from scratch:

```rust title="src/process.rs — create_process()"
/// Create a new process from an embedded program.
///
/// Allocates:
///   - 1 page for user code (copied from kernel .text)
///   - 1 page for user stack
///   - N pages for user page table (kernel regions + user pages)
///
/// Sets up initial context so first context-switch srets to user entry.
fn create_process(
    pid: usize,
    code_start: usize,
    code_size: usize,
    alloc: &mut BitmapAllocator,
) {
    assert!(pid > 0 && pid < MAX_PROCS, "invalid PID");

    // Allocate user code page and copy program
    let user_code = kvm::alloc_zeroed_page(alloc);
    unsafe {
        let src = code_start as *const u8;
        let dst = user_code as *mut u8;
        for i in 0..code_size {
            core::ptr::write_volatile(dst.add(i), core::ptr::read_volatile(src.add(i)));
        }
    }

    // Allocate user stack (one page, sp starts at top)
    let user_stack = kvm::alloc_zeroed_page(alloc);
    let user_sp = user_stack + PAGE_SIZE;

    // Build user page table
    let user_root = kvm::alloc_zeroed_page(alloc);
    kvm::map_kernel_regions(user_root, alloc);
    kvm::map_range(user_root, user_code, user_code + PAGE_SIZE, USER_RX, alloc);
    kvm::map_range(user_root, user_stack, user_stack + PAGE_SIZE, USER_RW, alloc);

    let satp = make_satp(user_root, pid as u16);

    // Initial context: U-mode, interrupts enabled, entry at code page
    let mut ctx = TrapFrame::zero();
    ctx.sepc = user_code;       // entry point
    ctx.sp = user_sp;           // user stack top
    ctx.sstatus = 1 << 5;       // SPIE=1 (enable interrupts on sret), SPP=0 (U-mode)

    unsafe {
        PROCS[pid] = Process {
            pid,
            state: ProcessState::Ready,
            satp,
            context: ctx,
            ipc_target: 0,
            ipc_value: 0,
        };
    }

    println!("  [proc] PID {} created (code={:#x}, {}) bytes, sp={:#x}, satp={:#018x})",
        pid, user_code, code_size, user_sp, satp);
}
```

Step by step:

1. **Allocate and copy code.** The user program lives in the kernel's `.text` section (via `global_asm!`). We can't run it there — those pages don't have the U bit. So we allocate a fresh page, copy the bytes, and map it as `USER_RX` (readable, executable, user-accessible). The `write_volatile`/`read_volatile` ensures the compiler doesn't optimize away the copy.

2. **Allocate stack.** One page, zeroed. Stack pointer starts at the *top* of the page (stacks grow downward on RISC-V). 4KB of stack is absurdly small by desktop standards, but our user programs are 30 instructions long. They'll be fine.

3. **Build page table.** `kvm::map_kernel_regions()` copies all kernel mappings (without U bit) so trap handlers work. Then we add the two user pages. Each process gets its own Sv39 root table, its own ASID, its own view of the world.

4. **Set up initial context.** The `TrapFrame` starts zeroed. We set `sepc` to the code page (where `sret` will jump), `sp` to the stack top, and `sstatus` with SPIE=1 (enable interrupts after sret) and SPP=0 (return to U-mode). When the scheduler first picks this process, it'll copy this TrapFrame onto the kernel stack and `sret` into userspace.

```
Process creation allocates:
┌──────────────┐
│ User code    │ ← 1 page, copied from kernel .text, mapped USER_RX
├──────────────┤
│ User stack   │ ← 1 page, zeroed, mapped USER_RW (sp starts at top)
├──────────────┤
│ Page table   │ ← N pages (root + intermediate tables)
│  root        │   Maps: kernel regions (no U) + user code + user stack
│  level 1     │
│  level 0...  │
└──────────────┘
```

## The Launch Sequence

`launch()` is called from `kmain()` as Phase 9. It creates both processes and drops into PID 1:

```rust title="src/process.rs — launch()"
/// Create all initial processes and launch the first one.
///
/// This is called from kmain as Phase 9. It never returns —
/// after all processes exit, control goes to post_process_exit().
pub fn launch(alloc: &mut BitmapAllocator) -> ! {
    extern "C" {
        static _user_init_start: u8;
        static _user_init_end: u8;
        static _user_srv_start: u8;
        static _user_srv_end: u8;
    }

    let init_start = unsafe { &_user_init_start as *const u8 as usize };
    let init_size = unsafe { &_user_init_end as *const u8 as usize } - init_start;

    let srv_start = unsafe { &_user_srv_start as *const u8 as usize };
    let srv_size = unsafe { &_user_srv_end as *const u8 as usize } - srv_start;

    println!("  [proc] Creating processes...");

    create_process(1, init_start, init_size, alloc);
    create_process(2, srv_start, srv_size, alloc);

    println!();
    println!("  [page_alloc] {} pages used, {} free",
        alloc.allocated_count(), alloc.free_count());
    println!();

    // Launch PID 1 as the first running process
    let proc1 = unsafe { &PROCS[1] };
    unsafe {
        CURRENT_PID = 1;
        PROCS[1].state = ProcessState::Running;
    }

    let entry = proc1.context.sepc;
    let user_sp = proc1.context.sp;
    let satp = proc1.satp;

    println!("  [proc] Launching PID 1 (init)...");
    println!();

    unsafe {
        asm!(
            "csrw sepc, {entry}",
            "csrr t0, sstatus",
            "li t1, -257",              // clear SPP (bit 8)
            "and t0, t0, t1",
            "ori t0, t0, 32",           // set SPIE (bit 5)
            "csrw sstatus, t0",
            "csrw sscratch, sp",        // save kernel sp
            "csrw satp, {satp}",
            "sfence.vma zero, zero",
            "mv sp, {user_sp}",
            "sret",
            entry = in(reg) entry,
            satp = in(reg) satp,
            user_sp = in(reg) user_sp,
            options(noreturn),
        );
    }
}
```

This is the same `sret` sequence from Part 6 (Chapter 20), but now there's context behind it. Two processes are in the table. PID 1 is set to Running. PID 2 is Ready, waiting for the scheduler to pick it.

The `sret` drops us into PID 1's code page. PID 1 immediately calls `SYS_SEND` to PID 2. PID 2 isn't receiving yet — it hasn't run at all. So PID 1 blocks. The scheduler finds PID 2 (Ready), loads its context, and srets into PID 2. PID 2 calls `SYS_RECEIVE`. PID 1 is blocked on SEND to PID 2 — rendezvous! The message transfers. Both processes unblock.

But we're getting ahead of ourselves. That's the next two chapters.

## Syscall Table Update

Part 6 had two syscalls. Part 7 adds two more:

```rust title="src/trap.rs — syscall constants"
pub const SYS_PUTCHAR: usize = 0;
pub const SYS_EXIT: usize = 1;
pub const SYS_SEND: usize = 2;
pub const SYS_RECEIVE: usize = 3;
```

| Number | Name | Arguments | Returns | Purpose |
|--------|------|-----------|---------|---------|
| 0 | `SYS_PUTCHAR` | a0 = character | a0 = 0 | Write one byte to UART |
| 1 | `SYS_EXIT` | a0 = exit code | never returns | Terminate the process |
| 2 | `SYS_SEND` | a0 = target PID, a1 = message | a0 = 0 (success) | Send message (blocks until received) |
| 3 | `SYS_RECEIVE` | a0 = from PID (0 = any) | a0 = message, a1 = sender PID | Receive message (blocks until sent) |

Four syscalls. The complete IPC-capable microkernel interface. seL4 has three (Send, Receive, Call — which is Send+Receive). We have four because SYS_PUTCHAR is still a training wheel. When the UART server handles all output via IPC, SYS_PUTCHAR becomes dead code.

The trap dispatcher in `trap.rs` routes the new syscalls:

```rust title="src/trap.rs — ecall handler (updated)"
fn handle_ecall(frame: &mut TrapFrame) {
    let syscall_num = frame.a7;

    match syscall_num {
        SYS_PUTCHAR => {
            let ch = frame.a0 as u8;
            crate::uart::Uart::platform().putc(ch);
            frame.a0 = 0;
            frame.sepc += 4;
        }
        SYS_EXIT => {
            crate::process::sys_exit(frame);
            // sys_exit handles sepc — don't advance
            return;
        }
        SYS_SEND => {
            crate::process::sys_send(frame);
            // sys_send handles sepc — don't advance
            return;
        }
        SYS_RECEIVE => {
            crate::process::sys_receive(frame);
            // sys_receive handles sepc — don't advance
            return;
        }
        _ => {
            println!("\n  [kernel] Unknown syscall: {} (a0={:#x})", syscall_num, frame.a0);
            frame.a0 = usize::MAX;
            frame.sepc += 4;
        }
    }
}
```

Notice the pattern: SYS_PUTCHAR advances `sepc` by 4 (to skip the ecall instruction) and returns. The IPC syscalls (`SYS_SEND`, `SYS_RECEIVE`, `SYS_EXIT`) call into `process.rs` and return early — those functions handle `sepc` themselves, because they might context-switch to a different process. When you switch processes, you don't advance the *current* process's sepc — you load an entirely different sepc from the next process's saved context.

> :angrygoose: The `return` after each IPC syscall is critical. Without it, execution falls through to the implicit `frame.sepc += 4` that some developers love to put at the end of their handler. If you advance sepc twice — once in the syscall handler, once in the dispatcher — the user program skips an instruction. Your IPC works perfectly for 16 messages, then silently corrupts the 17th. Ask me how I know. Actually, don't.

## What We Changed

| File | Change |
|------|--------|
| `src/process.rs` | **Rewritten** — process table, embedded programs, create_process, launch |
| `src/trap.rs` | Added SYS_SEND, SYS_RECEIVE dispatch; TrapFrame::zero(); Clone/Copy |
| `src/main.rs` | Updated to call `process::launch()` instead of `launch_init()` |

## What's Next

The process table exists. Two processes are created. PID 1 launches. But the moment PID 1 calls `SYS_SEND`, it needs to *block* — and the kernel needs to switch to PID 2. That's synchronous IPC: the message doesn't go into a buffer. It transfers *directly* from sender to receiver, and both must be ready at the same time.

Chapter 23 explains why this is the right model and how it works.
