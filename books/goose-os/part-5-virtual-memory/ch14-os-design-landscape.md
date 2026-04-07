---
sidebar_position: 1
sidebar_label: "Ch 14: Choosing an OS Architecture"
title: "Chapter 14: The OS Design Landscape — Choosing Our Path"
---

# Chapter 14: The OS Design Landscape — Choosing Our Path

Parts 1-4 built a working kernel: boot, console, interrupts, real hardware. Everything runs in S-mode, in a single flat address space. There's no memory protection, no isolation, no userspace.

Part 5 introduces virtual memory — and that's the **architectural fork in the road**. What the page tables protect, who runs where, and how components communicate defines what *kind* of OS you're building. Every real OS diverged at this exact point.

Before we write a single page table entry, let's understand the options.

## What We Have (Parts 1-4)

```
┌───────────────────────────────────────┐
│          S-mode (Supervisor)          │
│                                       │
│  ┌─────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │UART │ │ PLIC │ │Timer │ │Idle  │ │
│  │drv  │ │ drv  │ │(SBI) │ │loop  │ │
│  └─────┘ └──────┘ └──────┘ └──────┘ │
│                                       │
│  Physical address space — no MMU      │
│  One hart, no isolation               │
└───────────────────────────────────────┘
```

Everything — kernel logic, drivers, data — shares one address space with direct physical addresses. A bug anywhere can corrupt anything. This is where embedded firmware lives forever (FreeRTOS, Arduino, most MCU code). But for a real OS, we need boundaries.

## The Six Architectures

Operating systems broadly fall into six design families. Each makes different trade-offs about where code runs, how it communicates, and what the kernel is responsible for.

### 1. Monolithic Kernel

> **The kernel does everything.**

```
┌──────────────────────────────────────────────┐
│              User Space (U-mode)             │
│  ┌───────┐ ┌───────┐ ┌───────┐              │
│  │ shell │ │ editor│ │ server│              │
│  └───┬───┘ └───┬───┘ └───┬───┘              │
│──────┼─────────┼─────────┼───────────────────│
│      └─────────┴─────────┘                   │
│            syscall interface                  │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │        KERNEL  (S-mode)               │    │
│  │  VFS │ TCP/IP │ Drivers │ Scheduler  │    │
│  │  Memory mgmt  │ IPC     │ USB stack  │    │
│  └──────────────────────────────────────┘    │
│                Hardware                       │
└──────────────────────────────────────────────┘
```

Filesystem, networking, device drivers, scheduler — all in one kernel address space. Subsystems communicate via direct function calls. Fast, because there's no boundary crossing between kernel components.

**Examples:** Linux, FreeBSD, OpenBSD, NetBSD, Solaris (original)

**The trade-off:** Maximum performance, minimum isolation. A bug in *any* kernel component — a GPU driver, a filesystem, a network filter — can corrupt kernel memory and crash the entire system. Linux mitigates this with code review, testing, and 30 years of hardening, but the fundamental design means a single driver bug can be a kernel panic.

> :nerdygoose: Linux is about 30 million lines of code in kernel space. Most of that is drivers — there are more lines of GPU driver code than core kernel code. Linus Torvalds famously chose monolithic because "microkernel performance sucked in 1991." Thirty-five years later, that's less true, but inertia is powerful.

> :sarcasticgoose: The Linux kernel has roughly 1,700 active developers contributing code every release cycle. When someone says "just write a monolithic kernel," they're proposing you replicate the output of 1,700 engineers. Monolithic works at Linux scale because Linux *has* Linux scale. For a learning project, it's the wrong architecture — everything depends on everything else, and you can't build incrementally.

### 2. Microkernel

> **The kernel does almost nothing. Everything else is a userspace service.**

```
┌──────────────────────────────────────────────┐
│              User Space (U-mode)             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ app  │ │  FS  │ │ Net  │ │ UART │       │
│  │      │ │server│ │stack │ │driver│       │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘       │
│     └────┬───┴────┬───┴────┬───┘            │
│          │  IPC   │  IPC   │                │
│──────────┼────────┼────────┼────────────────│
│  ┌──────────────────────────────────────┐   │
│  │     KERNEL  (S-mode, minimal)         │   │
│  │  IPC  │  Scheduler  │  Memory (MMU)   │   │
│  └──────────────────────────────────────┘   │
│                Hardware                      │
└──────────────────────────────────────────────┘
```

The kernel provides only three things: **inter-process communication (IPC)**, **scheduling**, and **memory management** (page tables). Everything else — device drivers, filesystems, networking — runs as isolated userspace processes that communicate by sending messages through the kernel.

**Examples:** QNX, seL4, MINIX 3, Fuchsia (Zircon), GNU Hurd, Redox OS

**The trade-off:** Fault isolation and clean architecture, at the cost of IPC overhead. Every time an application reads a file, the request crosses two privilege boundaries:

```
App → [syscall] → Kernel → [IPC] → FS server → [syscall] → Kernel → [IPC] → App
```

That's 4 context switches for one operation. A monolithic kernel does it in 0 (the FS code is in the same address space as the syscall handler).

Modern microkernels have minimized this overhead to the point where it's rarely the bottleneck:
- **seL4**: IPC round-trip < 1 microsecond on ARM
- **QNX**: Powers real-time systems in cars at 1ms deadlines
- **L4 family**: Decades of IPC optimization — modern L4 variants are within 5-10% of monolithic performance for most workloads

> :happygoose: The microkernel's killer feature isn't performance — it's **fault isolation**. If the UART driver crashes in a monolithic kernel, the kernel panics. If the UART driver crashes in a microkernel, the UART server restarts and everything else keeps running. This is why QNX runs in medical devices and nuclear plants — a driver bug doesn't kill the patient.

> :sharpgoose: **seL4** took this further: it's *formally verified*. A mathematical proof guarantees that the kernel code implements its specification correctly. No buffer overflows, no null pointer dereferences, no undefined behavior — proven, not just tested. The kernel is about 10,000 lines of C. Try formally verifying 30 million lines of Linux.

> :weightliftinggoose: Redox OS is a microkernel written in Rust — the closest existing project to what GooseOS is becoming. It has a working GUI, filesystem, and network stack, all as userspace services. It proves the Rust + microkernel combination works at scale.

### 3. Hybrid Kernel

> **Microkernel design, but put the hot stuff back in kernel space for speed.**

```
┌──────────────────────────────────────────────┐
│              User Space (U-mode)             │
│  ┌───────┐ ┌───────┐ ┌───────┐              │
│  │ apps  │ │ apps  │ │ apps  │              │
│  └───┬───┘ └───┬───┘ └───┬───┘              │
│──────┼─────────┼─────────┼───────────────────│
│  ┌──────────────────────────────────────┐    │
│  │     KERNEL  (S-mode)                  │    │
│  │  ┌────────────────────────────────┐   │    │
│  │  │ Microkernel core               │   │    │
│  │  │ IPC │ Scheduler │ Memory       │   │    │
│  │  └────────────────────────────────┘   │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐          │    │
│  │  │  FS  │ │ Net  │ │ Drvs │ in-kernel│    │
│  │  └──────┘ └──────┘ └──────┘ servers  │    │
│  └──────────────────────────────────────┘    │
│                Hardware                       │
└──────────────────────────────────────────────┘
```

Start with a microkernel, then move performance-critical components (filesystem, networking, key drivers) back into kernel space. You get some of the architectural cleanliness of a microkernel with monolithic-like performance for hot paths.

**Examples:** Windows NT, macOS (XNU = Mach + BSD), DragonFlyBSD

**The trade-off:** Pragmatic but unprincipled. You get neither the full isolation of a microkernel nor the simplicity of a monolithic design. In practice, "hybrid" often means "monolithic kernel with a microkernel origin story."

> :sarcasticgoose: macOS is built on the Mach microkernel. In theory, it has IPC-based message passing and clean service isolation. In practice, the BSD layer that sits on top of Mach does almost everything, and Mach's IPC is primarily used for... Mach ports in the GUI framework. It's a microkernel the way a retired athlete is "still in shape."

> :nerdygoose: Windows NT was designed by Dave Cutler (who also designed VMS at DEC). The original architecture was microkernel-like — a HAL (Hardware Abstraction Layer), a small executive, and subsystems (Win32, POSIX, OS/2) as user-mode servers. Over time, performance pressure moved the window manager, GDI, and most drivers into kernel space. The architecture diagram still looks clean; the reality is monolithic with extra indirection.

### 4. Exokernel

> **The kernel just multiplexes hardware. Applications bring their own OS.**

The kernel's only job is to securely divide physical resources (CPU time, memory pages, disk blocks) among applications. Each application includes a "library OS" that implements whatever abstractions it wants — its own filesystem, its own networking, its own scheduler.

**Examples:** MIT Exokernel (Aegis/ExOS), influences on Unikraft

**The trade-off:** Maximum flexibility and performance for specialized workloads. Completely impractical for general-purpose computing — every application needs to implement TCP/IP, filesystem access, etc. from scratch (or link a library OS that does it).

> :angrygoose: Exokernels are intellectually interesting and practically useless for anything except research papers and specialized cloud workloads. If you're building a general-purpose OS, skip this one. If you're building a cloud hypervisor, some of the ideas (secure hardware multiplexing, minimal kernel) are worth knowing.

### 5. Unikernel

> **One application + one kernel = one binary. No separation.**

Compile the application and the kernel together into a single binary that runs directly on hardware (or a hypervisor). No user/kernel split, no processes, no shell, no login. Just one thing, running fast.

**Examples:** MirageOS (OCaml), IncludeOS (C++), Unikraft, NanoVMs

**The trade-off:** Extreme minimalism. Boots in milliseconds, tiny attack surface, near-bare-metal performance. But you can only run one application, there's no debugging tools at runtime, and you rebuild the entire system for every code change.

> :surprisedgoose: GooseOS *right now* (Parts 1-4) is technically a unikernel — one binary, one address space, no userspace. The difference is that we're going to *add* userspace. If your use case is "run one Rust function on bare metal as fast as possible," you could stop here and ship it as a unikernel. It would work.

### 6. RTOS (Real-Time Operating System)

> **Deterministic timing guarantees. The highest-priority task always runs.**

Not really an architecture — more of a scheduling philosophy. RTOS kernels guarantee bounded interrupt latency and deterministic task scheduling. "This motor control loop will execute within 10 microseconds of its deadline, every time, guaranteed."

**Examples:** FreeRTOS, Zephyr, RTEMS, VxWorks, Embassy (Rust)

**The trade-off:** Determinism over throughput. An RTOS may sacrifice average performance to guarantee worst-case performance. Most RTOSes have no memory protection (all tasks share one address space) because MMU lookups add non-deterministic latency.

> :weightliftinggoose: Zephyr is the most interesting RTOS for GooseOS comparison. It's Linux Foundation backed, uses device tree (like Linux), supports Bluetooth and TCP/IP, and runs on everything from Cortex-M0 to RISC-V multicore. But it's C, it's growing complex, and its tasks share memory. GooseOS takes the opposite bet: isolation over determinism, Rust over C, composable services over a flat task pool.

> :nerdygoose: Embassy is a Rust async RTOS — no heap, no dynamic allocation, compile-time task scheduling. If GooseOS is "big Rust OS for application processors," Embassy is "small Rust OS for microcontrollers." Same language, completely different design space. Embassy runs on ESP32 and nRF52; GooseOS runs on VisionFive 2 and QEMU. They're complementary, not competing.

## The Decision Matrix

| Property | Monolithic | Micro | Hybrid | Exo | Uni | RTOS |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Fault isolation** | No | **Yes** | Partial | App-level | No | No |
| **Performance** | **Best** | Good | Good | **Best** | **Best** | Deterministic |
| **Kernel size** | Huge | **Tiny** | Medium | **Tiny** | Fused | Small |
| **Security surface** | Large | **Small** | Medium | Small | **Small** | Large |
| **Multi-process** | Yes | Yes | Yes | Yes | No | Tasks |
| **MMU required** | Yes | Yes | Yes | Yes | No | Optional |
| **Composable** | No | **Yes** | Partial | Yes | No | No |
| **Formally verifiable** | Impractical | **seL4 proved it** | Impractical | Hard | Possible | Possible |
| **Build incrementally** | Hard | **Yes** | Hard | Hard | Easy | Easy |
| **Restart crashed drivers** | No | **Yes** | Some | N/A | N/A | No |
| **Good for learning** | Complex | **Excellent** | Complex | Niche | Limited | OK |

## Our Choice: Microkernel

GooseOS is taking the microkernel path. Here's why — not as dogma, but as a deliberate engineering decision based on our goals.

### 1. Educational Clarity

Each concept maps to a clean chapter:
- Part 5: Page tables → isolated address spaces
- Part 6: Userspace → syscall interface
- Part 7: IPC → message passing
- Part 8: UART server → first service

In a monolithic kernel, these concepts bleed together. The filesystem calls the block driver calls the scheduler calls the memory allocator — everything depends on everything. In a microkernel, each component has a well-defined interface (IPC messages) and can be built and understood independently.

### 2. Rust Alignment

Rust's ownership model maps naturally to capability-based microkernel designs:

```rust
// A capability is an owned handle to a resource
let uart_cap: Capability<Uart> = kernel.create_capability(uart_resource);

// Transfer capability to the UART server (moves ownership)
ipc::send(uart_server, uart_cap);
// uart_cap is now GONE — compiler enforces this

// Borrow a capability (read-only access, temporary)
let stats = uart_cap.borrow();
```

Ownership, move semantics, and borrowing are *exactly* how capabilities work at the hardware level. The compiler enforces at compile time what the kernel enforces at runtime. No other language gives you this for free.

> :sharpgoose: This isn't coincidence. Rust and microkernels share a philosophical foundation: **make invalid states unrepresentable**. Rust does it with types. Microkernels do it with address spaces. Combining them means bugs are caught at *two* levels — the type system and the MMU.

### 3. Composability

GooseOS on a VisionFive 2 with just UART? Load the UART service. Want networking? Add the network service. Want a filesystem? Add it. The kernel binary doesn't change — only the set of userspace services differs.

This is the same model as containers, but at the OS level. You compose your system from services like building blocks.

### 4. Fault Isolation

When (not if) we write a buggy driver, it crashes the driver's userspace process — not the kernel. The kernel detects the crash, restarts the service, and the system keeps running. Try that with a monolithic kernel.

### 5. Real-World Relevance

Microkernels are winning in safety-critical and security-critical domains:
- **QNX**: 200+ million cars, medical devices, industrial control
- **seL4**: Military, aerospace, DARPA-funded systems
- **Fuchsia/Zircon**: Google's next-gen OS
- **Redox OS**: Proving Rust + microkernel works

Understanding microkernel design is increasingly valuable as industry moves toward isolation and formal verification.

### What We Give Up

Honesty about the trade-offs:

1. **IPC overhead** — Every cross-service call costs 2 context switches. We accept this, and we'll optimize IPC aggressively in Part 7 (fast-path for small messages, register-based transfer).

2. **Complexity** — Building IPC, capability transfer, and service management is harder than "put everything in one address space." But the complexity buys us cleanliness.

3. **No existing ecosystem** — Linux has millions of drivers. GooseOS has what we write. This is a learning project, not a production OS — we build what we need, when we need it.

> :happygoose: The microkernel bet is that **a small, correct kernel + composable services** beats a large, complex monolith — especially when you're one person. You can understand the entire kernel. You can prove things about it. You can test services independently. The monolithic approach works at Linux scale; the microkernel approach works at GooseOS scale.

## What Each Part Builds (Updated Roadmap)

With our architecture chosen, here's what each remaining part does in the context of a microkernel design:

| Part | What | Microkernel Role | Concept |
|------|------|-----------------|---------|
| **5** | Sv39 page tables | Create isolated address spaces per process | Virtual memory |
| **6** | First userspace process | U-mode execution, ecall → syscall | Privilege separation |
| **7** | IPC message passing | How services communicate — the microkernel's heart | Message passing |
| **8** | UART server in userspace | First real service, proves the architecture | Userspace drivers |
| **9** | Heap allocator + capabilities | Memory as a managed, transferable resource | Resource management |
| **10** | Block device + FS service | Composable storage, another userspace service | Filesystem |
| **11** | Network stack service | TCP/IP as a pluggable service | Networking |
| **12** | SMP (multicore) | All 4 U74 cores running services in parallel | Parallelism |

Each part is independently testable. Each part adds one capability. The kernel grows slowly; the services grow fast.

## References and Further Reading

### Books

| Book | Author(s) | Why Read It |
|------|-----------|-------------|
| **Operating Systems: Three Easy Pieces** | Remzi & Andrea Arpaci-Dusseau | Free online. The best OS textbook — covers virtual memory, concurrency, persistence with humor and clarity. Start here. |
| **Operating System Concepts** (Silberschatz) | Silberschatz, Galvin, Gagne | The "dinosaur book." Comprehensive, covers every OS concept. More reference than tutorial. |
| **Modern Operating Systems** | Andrew Tanenbaum | Written by the creator of MINIX. Excellent microkernel coverage. The Tanenbaum-Torvalds debate chapter alone is worth reading. |
| **The Design and Implementation of the FreeBSD Operating System** | McKusick, Neville-Neil, Watson | Deep dive into a real production monolithic kernel. Great for understanding the trade-offs GooseOS avoids. |
| **Operating Systems: Design and Implementation** | Tanenbaum, Woodhull | MINIX 3 — a microkernel in C with full source code. The direct ancestor of our approach, minus Rust. |
| **The Little Book of Semaphores** | Allen Downey | Free online. Concurrency primitives explained with puzzles. Essential for IPC design. |
| **Programming with POSIX Threads** | David Butenhof | The definitive threading/synchronization reference. Relevant when we hit SMP in Part 12. |
| **Computer Organization and Design: RISC-V Edition** | Patterson & Hennessy | The hardware foundation. How the CPU executes our code, from gates to pipelines. RISC-V specific. |

### Specifications and Manuals

| Document | What It Covers | Link |
|----------|---------------|------|
| **RISC-V Privileged Specification** | Sv39 page tables, CSRs, trap handling, privilege modes | [github.com/riscv/riscv-isa-manual](https://github.com/riscv/riscv-isa-manual) |
| **RISC-V SBI Specification** | Timer, IPI, reset, HSM — the firmware API | [github.com/riscv-software-src/opensbi](https://github.com/riscv-software-src/opensbi) |
| **SiFive U74 Core Manual** | The VF2's CPU core — MMU details, cache, debug | [sifive.com/documentation](https://www.sifive.com/documentation) |
| **JH7110 Technical Reference Manual** | SoC peripherals, memory map, clocks, interrupts | [doc-en.rvspace.org/JH7110/TRM](https://doc-en.rvspace.org/JH7110/TRM/) |
| **RISC-V PLIC Specification** | Interrupt controller — priorities, contexts, claim/complete | [github.com/riscv/riscv-plic-spec](https://github.com/riscv/riscv-plic-spec) |
| **seL4 Reference Manual** | Formally verified microkernel design — capabilities, IPC, scheduling | [sel4.systems/Info/Docs](https://sel4.systems/Info/Docs/) |

### OS Projects to Study

| Project | Language | Architecture | Why Study It |
|---------|----------|-------------|-------------|
| **xv6-riscv** | C | Monolithic (teaching OS) | MIT's teaching OS. Simple, well-commented, RISC-V. Read this to understand what a monolithic kernel looks like. |
| **Redox OS** | Rust | Microkernel | The closest existing project to GooseOS. Rust microkernel with userspace drivers, GUI, networking. Proof that this approach works. |
| **seL4** | C (verified) | Microkernel | The gold standard. Formally verified kernel. Read the design papers even if you don't read the code. |
| **rCore** | Rust | Monolithic (teaching OS) | Chinese university teaching OS in Rust on RISC-V. Excellent Sv39 implementation to reference. |
| **Fuchsia/Zircon** | C++ | Microkernel | Google's microkernel. Capability-based, modern IPC design. The "industry" microkernel. |
| **Embassy** | Rust | RTOS (async) | Rust embedded RTOS. Different design space (MCUs, no MMU) but same language. Shows what Rust async can do for concurrency. |
| **Linux** | C | Monolithic | The reference for "how real drivers work." Read individual subsystems (serial8250, mm/), not the whole thing. |

### Papers and Articles

| Paper | Why It Matters |
|-------|---------------|
| **"On Micro-Kernel Construction"** (Liedtke, 1995) | The paper that proved microkernels could be fast. L4's design principles influence every modern microkernel including seL4 and Fuchsia. |
| **"seL4: Formal Verification of an OS Kernel"** (Klein et al., 2009) | How they proved a kernel has no bugs. The most important OS paper of the 21st century. |
| **"The Tanenbaum-Torvalds Debate"** (1992, comp.os.minix) | Tanenbaum: "microkernels are the future." Torvalds: "Linux is monolithic because it works." Read both sides — they were both right about different things. |
| **"The Performance of Micro-Kernel-Based Systems"** (Härtig et al., 1997) | L4 microkernel within 5% of monolithic Linux. Killed the "microkernels are slow" argument. |
| **"Capability Hardware Enhanced RISC Instructions"** (CHERI) | Hardware-enforced capabilities in the ISA itself. Where RISC-V + microkernel + Rust might go next. |

### Online Resources

| Resource | URL | What It Is |
|----------|-----|-----------|
| **OSTEP** | [pages.cs.wisc.edu/~remzi/OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/) | Free OS textbook — virtualization, concurrency, persistence |
| **The Embedded Rust Book** | [docs.rust-embedded.org/book](https://docs.rust-embedded.org/book/) | Bare-metal Rust fundamentals — #![no_std], linker scripts, volatile |
| **OSDev Wiki** | [wiki.osdev.org](https://wiki.osdev.org/) | Community wiki for OS developers. x86-centric but concepts transfer. |
| **Writing an OS in Rust** | [os.phil-opp.com](https://os.phil-opp.com/) | Philipp Oppermann's famous tutorial. x86-64 focused, but excellent for Rust OS patterns. |
| **rCore Tutorial** | [rcore-os.cn/rCore-Tutorial-Book-v3](https://rcore-os.cn/rCore-Tutorial-Book-v3/) | RISC-V Rust OS tutorial from Tsinghua University. Closest pedagogical reference to GooseOS. |

> :happygoose: You don't need to read all of these before Part 5. Start with **OSTEP** (free, covers virtual memory beautifully), skim the **RISC-V Privileged Spec** chapter on Sv39, and glance at **xv6-riscv**'s page table code for a simple implementation reference. Everything else is for when you want to go deeper on a specific topic.

> :angrygoose: Do NOT start by reading the Linux source code. It's 30 million lines of production code optimized for performance, not readability. Start with xv6 (simple), then rCore (Rust + RISC-V), then Redox (Rust + microkernel). Graduate to Linux subsystems only when you need to understand how a specific driver works.

## What's Next

With the architecture chosen (microkernel) and the landscape understood, we're ready to implement the first piece: **Sv39 page tables**. Virtual memory is the foundation for everything ahead — without isolated address spaces, there's no userspace, no process isolation, no microkernel.

Part 5 builds:
1. Page table data structures (PTE, page table, satp)
2. Identity mapping (kernel continues to run after MMU enable)
3. Enabling the MMU (write satp, the scariest single instruction in OS development)
4. Kernel virtual address space layout

> :nerdygoose: Enabling the MMU for the first time is the single most dangerous operation in OS development. One instruction — `csrw satp, <value>` — and every memory access goes through the page tables. If the page tables are wrong, the next instruction fetch fails, and the CPU takes a page fault *in the page fault handler*, and you get an infinite trap loop. There is no recovery. Get it right on the first try, or get very good at power cycling.

```bash
git checkout part-5   # (when it exists)
```
