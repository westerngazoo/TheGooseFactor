---
sidebar_position: 2
sidebar_label: "Ch 27: The Blueprint"
title: "Chapter 27: The Blueprint — 18 Syscalls, 9 Phases, One Goose"
---

# Chapter 27: The Blueprint — 18 Syscalls, 9 Phases, One Goose

Chapter 26 decided *what* we're building. This chapter decides *how*.

The architecture of an OS is defined by three things: what's in the kernel, what's outside the kernel, and how they talk. We already know the third one — synchronous IPC. Now we need the full blueprint: every syscall, every phase, every dependency, every file.

This is the master plan. When we're knee-deep in page table code in Phase 3 and wondering "why are we doing this," this is the chapter we come back to.

## The Final Syscall Table

18 syscalls. The complete GooseOS interface from userspace to kernel, designed for a WASM-native container platform. Each syscall was chosen because it's the minimum mechanism needed. Nothing is included because "Linux has it" or "it might be useful." Every entry earns its place.

```
┌─────┬──────────────────┬─────────────────────────────┬──────────┐
│  #  │  Name            │  Purpose                    │  Phase   │
├─────┼──────────────────┼─────────────────────────────┼──────────┤
│  0  │  SYS_PUTCHAR     │  Debug output (1 byte)      │  7  ✓    │
│  1  │  SYS_EXIT        │  Terminate process          │  7  ✓    │
│  2  │  SYS_SEND        │  Sync send (blocks)         │  7  ✓    │
│  3  │  SYS_RECEIVE     │  Sync receive (blocks)      │  7  ✓    │
│  4  │  SYS_CALL        │  RPC (Send + wait Reply)    │  9       │
│  5  │  SYS_REPLY       │  Server replies to caller   │  9       │
│  6  │  SYS_MAP         │  Map phys page to virt      │  10      │
│  7  │  SYS_UNMAP       │  Remove page mapping        │  10      │
│  8  │  SYS_ALLOC_PAGES │  Allocate N phys pages      │  10      │
│  9  │  SYS_FREE_PAGES  │  Return pages to kernel     │  10      │
│ 10  │  SYS_SPAWN       │  Create process from ELF    │  11      │
│ 11  │  SYS_WAIT        │  Block until child exits    │  11      │
│ 12  │  SYS_GETPID      │  Query own PID              │  11      │
│ 13  │  SYS_YIELD       │  Voluntary preemption       │  12      │
│ 14  │  SYS_SET_TIMER   │  Timer notification         │  12      │
│ 15  │  SYS_GRANT       │  Share pages cross-process  │  13      │
│ 16  │  SYS_IRQ_REGISTER│  Claim hardware IRQ         │  14      │
│ 17  │  SYS_IRQ_ACK     │  Acknowledge IRQ handled    │  14      │
└─────┴──────────────────┴─────────────────────────────┴──────────┘
```

Let's examine each group.

### IPC Syscalls (0–5): The Communication Layer

The first four exist. SYS_CALL and SYS_REPLY are the RPC primitives:

```
SYS_SEND + SYS_RECEIVE (two ecalls):
  Client                            Server
    ├── SYS_SEND(server, msg) ──►     │
    │   blocks...                     │
    │                           SYS_RECEIVE(0) ──┤
    │                           process msg      │
    ├── SYS_SEND(server, next) ──►    │
    ...                               ...

SYS_CALL + SYS_REPLY (one ecall for client):
  Client                            Server
    ├── SYS_CALL(server, msg) ──►     │
    │   blocks (waiting for reply)    │
    │                           SYS_RECEIVE(0)   │
    │                           process msg      │
    │                     ◄── SYS_REPLY(client, result)
    ├── got result in a0              │
```

SYS_CALL cuts the client's cost in half — one ecall instead of two. For WASI, every function call from the WASM runtime to a device server is a SYS_CALL. If the runtime prints 1,000 characters, that's 1,000 SYS_CALL ecalls instead of 2,000 separate SEND+RECEIVE ecalls. At ~80ns per ecall, that's 80μs saved per 1,000 prints. In a tight loop, it adds up.

> :nerdygoose: SYS_CALL introduces a new process state: `BlockedCall`. It's like `BlockedSend` but the process also expects a SYS_REPLY back. The rendezvous logic is similar: if the server is already blocked on RECEIVE, deliver immediately and mark the caller BlockedCall. When the server calls SYS_REPLY, find the BlockedCall process and deliver the result. SYS_REPLY is non-blocking — the server continues running after replying.

### Memory Syscalls (6–9): The Heap Enabler

The WASM runtime (wasmi) needs a heap. Rust's `alloc` crate needs a `GlobalAlloc` implementation. For that, userspace processes need the ability to request physical pages and map them into their virtual address space.

```
Userspace heap growth:

  alloc::alloc(layout)
    │
    ▼
  User GlobalAlloc::alloc()
    │ "I need more memory"
    ▼
  SYS_ALLOC_PAGES(count=1)        ← kernel allocates page
    │ returns phys_addr
    ▼
  SYS_MAP(phys, virt, size, RW)   ← kernel maps into our page table
    │
    ▼
  Heap region is now larger
```

**SYS_ALLOC_PAGES(count):** Asks the kernel for `count` contiguous physical pages. The kernel checks the process's memory quota, deducts from it, and returns the physical base address. If the quota is exceeded or no memory is available, returns an error.

**SYS_MAP(phys, virt, size, flags):** Maps the given physical page(s) into the calling process's address space at virtual address `virt` with the specified flags (USER_RW for heap, USER_RX for code). The kernel validates that the process *owns* those physical pages (allocated via SYS_ALLOC_PAGES) and that the virtual address is in the user range.

**SYS_UNMAP(virt, size):** Removes a page mapping. The physical page is NOT freed — it stays allocated until explicitly returned with SYS_FREE_PAGES. This allows remapping pages at different virtual addresses.

**SYS_FREE_PAGES(phys, count):** Returns physical pages to the kernel. The kernel unmaps them from the process's page table (if still mapped), zeros them (security: don't leak data), and returns them to the allocator. The process's quota is credited back.

> :angrygoose: Memory management is where microkernel designs get *real*. In a monolithic kernel, `malloc` is handled entirely in userspace (glibc's allocator) using `brk`/`mmap` — the kernel just maps pages. In a microkernel, we do the same thing, but the "kernel just maps pages" part is explicit: two syscalls instead of one `mmap` that does five things. More syscalls, more explicit, more verifiable, more annoying. Trade-offs are the only constant in OS design.

### Process Lifecycle (10–12): Spawning Real Programs

Currently, processes are embedded in the kernel via `global_asm!`. That's a party trick, not an architecture. Real programs need to be loaded from ELF binaries.

**SYS_SPAWN(code_ptr, code_len, stack_pages):** Creates a new process from an ELF image that's already in the caller's memory. The kernel parses the ELF headers, allocates pages for code/data/stack, copies the segments, builds a page table, and returns the new PID. The caller is typically the orchestrator, which loaded the ELF from the init filesystem or block device.

**SYS_WAIT(pid):** Blocks the caller until the specified PID exits. Returns the exit code. This is how the orchestrator detects when a WASM workload finishes.

**SYS_GETPID():** Returns the caller's PID. Simple, but needed for IPC — a process needs to know its own PID to tell others who to reply to.

### Scheduling (13–14): Time Sharing

**SYS_YIELD():** Surrender the rest of the current time slice. The scheduler picks the next Ready process. Useful for cooperative tasks that know they're waiting for something.

**SYS_SET_TIMER(deadline_ticks):** Ask the kernel to send an IPC notification when the tick counter reaches `deadline_ticks`. The process continues running (non-blocking). When the deadline fires, the kernel synthesizes a message. This allows userspace processes to implement timeouts without busy-waiting.

### Capabilities (15–17): Gated Access

**SYS_GRANT(target_pid, phys, pages, flags):** Transfer or share physical pages with another process. The granting process's mapping can be downgraded to read-only or removed entirely. The target gets the pages mapped at a kernel-chosen virtual address. This is how the WASM runtime passes module bytes to a new instance, and how device servers receive I/O buffers.

**SYS_IRQ_REGISTER(irq_num):** Register to receive notifications when hardware IRQ `irq_num` fires. Only one process can own each IRQ. When the PLIC delivers the interrupt, the kernel sends an IPC message to the registered process instead of handling it in-kernel. The UART server would register for IRQ 10 (UART0).

**SYS_IRQ_ACK(irq_num):** Tell the kernel the IRQ has been handled. The kernel calls PLIC complete() and re-enables the interrupt. Without this, the IRQ stays masked.

## The Architecture Stack

```
┌──────────────────────────────────────────────────────────────────┐
│  WASM Workloads (any language → .wasm)                           │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │ App 1  │  │ App 2  │  │ App 3  │  │  ...   │                │
│  │ (Rust) │  │ (Go)   │  │ (C)    │  │        │                │
│  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘                │
│      │  WASI     │  WASI     │  WASI     │                      │
│  ┌───┴───────────┴───────────┴───────────┴───┐                  │
│  │         WASM Runtime (wasmi)               │  ← PID 3        │
│  │  Interprets bytecode, links WASI funcs     │                  │
│  └──────────────────┬────────────────────────┘                  │
│                     │ SYS_CALL / SYS_REPLY (IPC)                │
│  ┌──────────────────┼──────────────────────────────────────┐    │
│  │ Orchestrator     │  UART Server  │  FS Server  │ Net    │    │
│  │ PID 1            │  PID 2        │  PID 4      │ PID 5  │    │
│  │ (lifecycle,      │  (IRQ 10,     │  (blk IPC,  │(virtio │    │
│  │  health,         │   MMIO cap)   │   flat FS)  │ net)   │    │
│  │  resource lim)   │               │             │        │    │
│  └──────────────────┼──────────────────────────────────────┘    │
│                     │                                            │
│ ════════════════════╪══════════════════════════════════════════  │
│                     │ ecall (18 syscalls)                        │
│  ┌──────────────────┴──────────────────────────────────────┐    │
│  │                GooseOS Microkernel                       │    │
│  │                                                          │    │
│  │  ┌───────┐ ┌───────────┐ ┌────────┐ ┌──────┐ ┌──────┐ │    │
│  │  │  IPC  │ │ Scheduler │ │ Memory │ │ Caps │ │ IRQ  │ │    │
│  │  │ Send  │ │ preemptive│ │ alloc  │ │ 16/  │ │route │ │    │
│  │  │ Recv  │ │ round-    │ │ map    │ │ proc │ │ to   │ │    │
│  │  │ Call  │ │ robin     │ │ grant  │ │      │ │ IPC  │ │    │
│  │  │ Reply │ │ 10ms tick │ │ quota  │ │      │ │      │ │    │
│  │  └───────┘ └───────────┘ └────────┘ └──────┘ └──────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  RISC-V Hardware                                        │    │
│  │  U74 @ 1.5GHz │ 8GB DDR │ UART │ PLIC │ Sv39 MMU      │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

Five userspace servers, one WASM runtime, N workloads. The kernel doesn't know what WASM is. It sees processes doing IPC. The WASM runtime doesn't know what hardware exists. It sees IPC endpoints. The device servers don't know what WASM is. They see IPC requests. Everyone talks through the kernel's message passing, and nobody trusts anyone.

> :happygoose: This is the microkernel philosophy realized. The kernel is the *only* component that must be trusted. Device drivers are isolated — a buggy UART server crashes itself, not the kernel. The WASM runtime is isolated — a bug in wasmi takes down the runtime, not the system. A malicious WASM module is double-sandboxed — WASM prevents it from touching memory, and even if it escaped the WASM sandbox, GooseOS page tables prevent it from touching other processes.

## The WASM Runtime: wasmi

We chose **wasmi** — a pure Rust WebAssembly interpreter.

| Property | wasmi |
|----------|-------|
| Language | Rust |
| no_std | Yes (`features = ["core"]`) |
| WASI support | Via host function linking |
| Execution | Interpreter (no JIT) |
| Size | ~30K lines (as crate dep) |
| Heap required | Yes (`alloc` crate) |
| Compilation | Standard `cargo build` |

wasmi is not the fastest WASM engine. Wasmtime has a JIT that runs WASM at near-native speed. But Wasmtime is 500K lines, requires `std`, and has a massive dependency tree. wasmi is 30K lines, `no_std`, and compiles with the same toolchain we already use.

For a 1.5GHz RISC-V core, wasmi's interpreted execution is ~10-50x slower than native. That sounds bad until you remember that "native" on this core is ~500 MIPS. So wasmi gives us ~10-50 MIPS. That's enough for server-style workloads: parsing JSON, handling HTTP requests, orchestrating services. It's not enough for video encoding or ML inference. Those workloads belong on GPUs or specialized accelerators anyway.

The WASI translation layer maps WASI functions to GooseOS IPC:

```
WASI → GooseOS Translation:

  fd_write(fd=1, iovs)     →  SYS_CALL to console_server, send buffer contents
  fd_read(fd=0, iovs)      →  SYS_CALL to console_server, blocks for input
  fd_write(fd>2, iovs)     →  SYS_CALL to fs_server (file I/O)
  fd_read(fd>2, iovs)      →  SYS_CALL to fs_server
  clock_time_get            →  Read vDSO page (NO syscall — just a memory read)
  proc_exit(code)           →  SYS_EXIT
  environ_get               →  Local (stored in runtime's memory)
  args_get                  →  Local (passed at workload spawn)
  random_get                →  SBI DRNG or kernel entropy pool
```

The beauty: the WASM module calls `fd_write`. wasmi's host function implementation packages the buffer, calls SYS_CALL to the console server, waits for SYS_REPLY, and returns the result to WASM. The module doesn't know it's on GooseOS. It doesn't know there's a microkernel underneath. It thinks it's talking to "the system." The system happens to be five isolated processes cooperating through message passing.

## The Phased Build

Nine phases, each building on the last. Each phase produces a working, testable, deployable system. No phase requires "trust me, it'll work when we add the next phase."

### Phase Map

```
Phase 9:  Call/Reply IPC          ← RPC primitive for WASI
Phase 10: Memory Management       ← Heap for wasmi
Phase 11: ELF Loader              ← Real binaries, not global_asm!
Phase 12: Preemptive Scheduling   ← Fair CPU sharing
Phase 13: Capabilities + vDSO     ← Security + fast reads
Phase 14: VirtIO + Device Servers ← Drivers in userspace
Phase 15: wasmi WASM Runtime      ← THE feature
Phase 16: Orchestrator            ← Container management
Phase 17: Storage + Networking    ← Persistence + connectivity
```

### Dependency Graph

```
Part 7: IPC (DONE)
  │
  ▼
Phase 9: Call/Reply IPC ─────────────────────────────┐
  │                                                    │
  ├──► Phase 10: Memory Management                     │
  │       │                                            │
  │       ├──► Phase 11: ELF Loader + Spawn            │
  │       │       │                                    │
  │       │       ├──► Phase 14: VirtIO + Drivers ◄────┤
  │       │       │       │                            │
  │       │       │       ├──► Phase 15: wasmi         │
  │       │       │       │       │                    │
  │       │       │       │       ├──► Phase 16: Orch  │
  │       │       │       │       │       │            │
  │       │       │       │       │       ├──► Ph 17   │
  │       │       │       │       │                    │
  │       │       │       ◄───────┤                    │
  │       │                       │                    │
  ├──► Phase 12: Preemptive Scheduling                 │
  │                                                    │
  ├──► Phase 13: Caps + vDSO ──────────────────────────┘
```

Phases 12 and 13 can develop in parallel with Phases 11/14. The critical path is: 9 → 10 → 11 → 14 → 15 → 16 → 17.

### Size Growth

```
                     Lines of code (kernel + userspace)
Phase 9:   ████████████████████████████████  3,000
Phase 10:  ██████████████████████████████████████  3,500
Phase 11:  ███████████████████████████████████████████████  4,150
Phase 12:  █████████████████████████████████████████████████████  4,550
Phase 13:  ████████████████████████████████████████████████████████████  5,000
Phase 14:  ███████████████████████████████████████████████████████████████████████  5,900
Phase 15:  █████████████████████████████████████████████████████████████████████████████████████  7,200
Phase 16:  ████████████████████████████████████████████████████████████████████████████████████████████████  8,100
Phase 17:  ██████████████████████████████████████████████████████████████████████████████████████████████████████████  9,300
```

From 2,700 lines today to 9,300 lines at completion. The kernel itself stays under 5,000 lines — the rest is userspace servers and the orchestrator. This is the microkernel promise: the *kernel* is tiny. The *system* can be as large as needed, with complexity pushed to isolated, restartable userspace components.

> :nerdygoose: For comparison: Linux kernel 6.x is ~30,000,000 lines. Minix 3 (the microkernel that inspired Linux) is ~30,000 lines for the kernel + ~70,000 for servers. seL4's verified kernel is ~10,000 lines of C. Our kernel at 5,000 lines of Rust sits comfortably in the "small enough to reason about, large enough to be useful" range. If we ever pursue formal verification, this is a tractable size.

## Container Semantics: Not Docker, Not Kubernetes

GooseOS containers are not OCI containers. They don't use Docker images, Linux namespaces, cgroups, or overlay filesystems. They don't need to — WASM provides the abstraction layer that containers exist to provide.

| Feature | Docker/K8s | GooseOS |
|---------|-----------|---------|
| Isolation | Linux namespaces + cgroups | WASM sandbox + Sv39 page tables |
| Image format | OCI (layered filesystem) | Raw .wasm file |
| Resource limits | cgroups (memory, CPU, I/O) | Page quota + tick budget |
| Lifecycle | Docker daemon / kubelet | GooseOS orchestrator (PID 1) |
| Networking | CNI plugins | IPC to net server |
| Storage | Volumes, bind mounts | IPC to fs server |
| TCB size | ~30M lines (kernel + runtime) | ~40K lines (kernel + wasmi) |
| Startup time | 100ms - 5s (pull + extract + init) | Under 1ms (load WASM bytes + instantiate) |

The startup time difference deserves emphasis. A Docker container pulls a layered filesystem image, unpacks it, sets up namespaces, configures cgroups, resolves network, and finally starts the process. A GooseOS WASM workload: the orchestrator sends WASM bytes to the runtime via shared memory, wasmi parses and instantiates (~1ms for a small module), and the workload starts executing. Cold start in milliseconds, not seconds.

This is why Cloudflare Workers and Fastly Compute use WASM: sub-millisecond cold start means you can spin up a handler for every request. Docker can't do that. Kubernetes can't do that. WASM can.

> :surprisedgoose: "But we lose access to the Docker ecosystem!" True — we can't `docker pull nginx`. But we can compile nginx to WASM (it's been done) and run it. Or more practically, we compile purpose-built microservices in Rust/Go/C to WASM. The Docker ecosystem matters for DevOps teams running 15-year-old Java monoliths. The WASM ecosystem matters for people building new, small, fast services. If your workload is a 200MB Docker image containing Ubuntu + Python + Flask + 47 pip packages... GooseOS is not for you. If your workload is a 2MB WASM module compiled from 500 lines of Rust... welcome home.

## The Journey So Far — And Where We're Going

```
Part 1:  Boot             ✓  RISC-V boots, prints "Hello"
Part 2:  Console          ✓  UART driver, println!() macro
Part 3:  Interrupts       ✓  Trap vector, PLIC, timer ticks
Part 4:  Real Hardware    ✓  VisionFive 2, deploy pipeline
Part 5:  Virtual Memory   ✓  Page allocator, Sv39, identity map
Part 6:  Userspace        ✓  U-mode process, ecall syscalls
Part 7:  IPC              ✓  Two processes, synchronous messages
Part 8:  Architecture     ← YOU ARE HERE (design pivot)

Phase 9:  Call/Reply IPC
Phase 10: Memory Management
Phase 11: ELF Loader
Phase 12: Preemptive Scheduling
Phase 13: Capabilities
Phase 14: Device Servers
Phase 15: WASM Runtime          ← The big one
Phase 16: Orchestrator          ← Container management
Phase 17: Storage + Networking  ← The finish line
```

We're 7 parts and ~2,700 lines in. The target is ~9,300 lines and a working WASM container platform. The foundation is solid. The IPC model is proven. The syscall table is designed. The dependency graph is clear.

Time to build.
