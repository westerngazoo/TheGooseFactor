---
slug: wasm-native-os
title: "WASM-Native OS: Why I'm Building a Kernel Where Every Process is a WebAssembly Sandbox"
authors: [geese]
tags: [goose-os, wasm, cloud-native, microkernel, risc-v]
---

What if the operating system understood containers natively — not as a bolted-on afterthought, but as the fundamental unit of execution?

That question led me to GooseOS, a RISC-V microkernel where every userspace process will be a WebAssembly sandbox. No Linux. No Docker. No container runtime. Just a kernel that speaks IPC and processes that speak WASM.

<!-- truncate -->

## The Problem with the Current Stack

Today's cloud-native stack looks like this:

```
+-----------------------------+
|  Your Application (.wasm)   |
+---------+-------------------+
|  WASM Runtime (wasmtime)    |
+---------+-------------------+
|  Container Runtime (runc)   |
+---------+-------------------+
|  Container Orchestrator     |
+---------+-------------------+
|  Linux Kernel               |
|  (30M lines, 400+ syscalls) |
+---------+-------------------+
|  Hardware                   |
+-----------------------------+
```

Six layers. Each one exists because the layer below it was not designed for the job. Linux has 400+ syscalls because it was designed for humans running shells, not for orchestrators running sandboxed workloads. Docker exists because Linux processes are not isolated by default. WASM runtimes exist because Linux executables are not portable.

Every layer is a patch for the limitations of the layer below.

## The Thesis: Collapse the Stack

What if we designed the kernel *knowing* that every process would be a WASM module?

```
+-----------------------------+
|  Your Application (.wasm)   |
+---------+-------------------+
|  WASM Interpreter (PID N)   |
+---------+-------------------+
|  GooseOS Kernel             |
|  (16 syscalls, ~3000 lines) |
+---------+-------------------+
|  Hardware (RISC-V)          |
+-----------------------------+
```

Three layers. The kernel provides memory isolation (Sv39 page tables), IPC (synchronous send/receive), and interrupt routing. The WASM interpreter runs as an ordinary userspace process. Your application is a .wasm binary that the interpreter loads and executes.

Sandboxing comes from *two* independent mechanisms:

1. **Hardware isolation** — Sv39 page tables prevent one process from touching another's memory. The kernel enforces this.
2. **WASM isolation** — The interpreter validates every memory access against the module's linear memory bounds. Even if the hardware had no MMU, WASM would still be sandboxed.

Double containment. An escape would need to break both the WASM sandbox *and* the page table isolation. Getting both wrong at the same time is vanishingly unlikely.

## Why Not a Unikernel?

Unikernels (Unikraft, MirageOS) collapse the stack differently — they compile the application and the kernel into a single binary. This is fast but gives up process isolation. Every module runs in the same address space. A bug in the UART driver can corrupt the application's memory.

GooseOS keeps isolation. The UART driver runs as PID 2 — an ordinary userspace process. If it crashes, the kernel is fine. We just demonstrated this in Phase 13: the UART server handles keyboard echo via IRQ interrupts, and clients send characters via IPC. It is isolated, restartable, and separated from both the kernel and the application.

## Why Not Firecracker / microVMs?

Firecracker gives you a minimal Linux VM per workload. It is excellent for strong isolation, but each VM boots a full Linux kernel. Cold start is ~125ms. Memory overhead is significant.

A GooseOS WASM process starts in microseconds. There is no VM to boot — the process is just an address space with a WASM interpreter already running. The memory overhead is the interpreter itself plus the WASM module's linear memory. For a "hello world," that is under 1MB total.

## Why Not JVM Microservices?

This is the comparison that matters most, because JVM microservices are how the majority of cloud workloads actually run today. Spring Boot, Quarkus, Micronaut, Vert.x — the Java ecosystem dominates backend infrastructure. If you are running microservices in production, odds are they look like this:

```
+-----------------------------+
|  Your Service (Java/.jar)   |
+---------+-------------------+
|  Framework (Spring Boot)    |
+---------+-------------------+
|  JVM (HotSpot / GraalVM)   |
|  (~200MB base footprint)    |
+---------+-------------------+
|  Container (Docker + runc)  |
+---------+-------------------+
|  Linux Kernel               |
+---------+-------------------+
|  Hardware / VM              |
+-----------------------------+
```

That is a lot of machinery to print "Hello, World."

### The Cold Start Problem

A Spring Boot microservice takes 2-8 seconds to start. The JVM loads, class paths resolve, dependency injection wires up, connection pools initialize. Kubernetes can't scale from zero to handling a request in under 10 seconds. This is why teams over-provision — they keep idle replicas running because cold start is too painful.

GraalVM native-image cuts this to ~50ms by ahead-of-time compiling to a native binary. But you lose runtime reflection, dynamic class loading, and a chunk of the library ecosystem. You are fighting the platform instead of working with it.

A GooseOS WASM process starts in microseconds. There is no VM, no class loading, no framework initialization. The WASM module's `_start` function executes immediately. Scale-to-zero becomes practical — spin up on request, tear down on idle, pay for nothing in between.

### The Memory Problem

A minimal Spring Boot service consumes 150-300MB of RAM. The JVM heap, metaspace, thread stacks, JIT compiler buffers — they add up. Run 50 microservices on a node and you need 8-16GB just for JVM overhead before your application allocates a single byte.

A WASM module's memory is its linear memory — typically 1-4MB for a simple service. The interpreter adds some overhead, but the total for a "hello world" is under 1MB. You could run hundreds of WASM workloads in the memory that a single Spring Boot service consumes.

| | JVM (Spring Boot) | GraalVM Native | GooseOS WASM |
|---|---|---|---|
| Cold start | 2-8 seconds | ~50ms | microseconds |
| Memory floor | 150-300MB | 30-50MB | < 1MB |
| Isolation | Container (Linux cgroups) | Container (Linux cgroups) | WASM sandbox + Sv39 page tables |
| Portability | "Write once, run on JVM" | Platform-specific binary | .wasm runs anywhere |
| GC pauses | Yes (unpredictable latency) | Yes (reduced) | No GC (linear memory) |
| Attack surface | JVM + framework + Linux | Native binary + Linux | 16 syscalls |

### The Security Model

The JVM's `SecurityManager` was deprecated in Java 17 and removed in Java 24. For two decades it was the official sandbox, and the ecosystem collectively decided it was too complex to use correctly. Today, JVM security is "trust the code, isolate with containers." The isolation comes from Linux namespaces and cgroups — the same 30-million-line kernel attack surface.

WASM was designed as a sandbox from day one. A module cannot access memory outside its linear memory bounds. It cannot make syscalls. It cannot read files, open sockets, or touch hardware unless the host explicitly provides those capabilities through WASI. The sandbox is not an afterthought — it is the execution model.

### Language Lock-In

JVM microservices require JVM languages: Java, Kotlin, Scala, Clojure. Your Go service, your Rust service, your Python service — they need their own runtimes, their own container images, their own deployment pipelines.

WASM is a compilation target for almost everything. Rust, C, C++, Go, AssemblyScript, Python (via wasm32-wasi), even Java (via TeaVM or JWebAssembly). One execution model, one deployment format, any source language. A team can write services in Rust for performance-critical paths and Python for data processing, and both compile to the same .wasm format running on the same kernel.

### What About Quarkus and Micronaut?

These frameworks solve some JVM problems — faster startup, lower memory via build-time DI. Quarkus with native-image gets close to 50ms start and 30MB RSS. But they are still optimizing within the JVM paradigm: a large runtime on a large kernel inside a container. Each layer carries its own CVE surface, its own update cycle, its own operational complexity.

GooseOS asks: what if we removed all those layers instead of optimizing them?

## Why RISC-V?

Three reasons:

1. **Simplicity.** The RISC-V privileged spec is ~100 pages. ARM's is over 10,000. When you're building an OS from scratch, every page of spec is a week of debugging.

2. **Real hardware.** The VisionFive 2 board runs the JH7110 SoC with four U74 cores at 1.5GHz. GooseOS runs on it today — this is not a QEMU-only project.

3. **The future.** RISC-V is open, growing, and increasingly adopted in cloud infrastructure. Building for RISC-V is building for the future.

## Where We Are: 13 Phases In

GooseOS is being built one phase at a time, documented as a book on [TheGooseFactor](https://thegoosefactor.com):

| Phase | Milestone | Status |
|-------|-----------|--------|
| 1-4 | Boot, UART, interrupts, real hardware | Done |
| 5 | Sv39 virtual memory, page allocator | Done |
| 6 | Userspace processes, syscalls | Done |
| 7 | Synchronous IPC (send/receive) | Done |
| 8 | Architecture design (WASM blueprint) | Done |
| 9 | RPC pattern (call/reply) | Done |
| 10 | Userspace memory management | Done |
| 11 | Process lifecycle (spawn/wait/ELF) | Done |
| 12 | Preemptive scheduling (timer-driven) | Done |
| **13** | **Userspace device servers (UART in userspace)** | **Done** |
| 14 | WASM binary parser | Next |
| 15 | WASM interpreter (basic opcodes) | Planned |
| 16 | WASM-to-GooseOS syscall bridge | Planned |

16 syscalls implemented. ~3,000 lines of Rust. Runs on both QEMU and VisionFive 2 hardware.

## How Close Is WASM?

Closer than it looks. Here is what is already in place:

- **Process isolation:** Each process has its own Sv39 page table.
- **IPC:** Synchronous send/receive/call/reply. This becomes the WASI bridge — WASM modules call `fd_write`, the interpreter translates to `SYS_CALL(uart_server, char)`.
- **Device I/O in userspace:** The UART server handles TX via IPC and RX via IRQ forwarding. Any new device follows the same pattern.
- **Memory management:** Userspace can allocate pages, map them, and free them. The WASM interpreter uses this to back the module's linear memory.
- **Preemption:** Timer-driven context switching prevents any process (including the WASM interpreter) from starving others.

What is missing is the interpreter itself. The plan:

1. **Phase 14: WASM parser.** Parse the .wasm binary format — module header, type section, function section, code section, memory section. This is well-specified and finite.

2. **Phase 15: Interpreter core.** A stack-based bytecode interpreter for WASM's core opcodes: i32/i64 arithmetic, control flow (block/loop/br/if), function calls, linear memory load/store. Start with a subset, grow as needed.

3. **Phase 16: Syscall bridge.** Map WASI functions to GooseOS IPC. `fd_write(1, buf, len)` becomes a loop of `SYS_CALL(uart_server, char)`. Start with stdout, add stdin and files later.

**Do we need a filesystem?** Not for the first demo. WASM binaries can be embedded in the kernel image, just like we embed the UART server assembly today. A filesystem comes later, when we want to load modules from SD card or network. It is a convenience, not a prerequisite.

## Three-Layer Permissions: The Microkernel Security Model

On Linux, security is a filter bolted onto a 400-syscall surface. Seccomp profiles, AppArmor, SELinux — each one tries to restrict what a process *could* do, out of the hundreds of things the kernel *lets* it do. One missed syscall in your seccomp profile and you have an escape.

GooseOS inverts this. A WASM module cannot do *anything* by default. Every external action — writing to the console, opening a file, connecting to a socket — must travel through IPC to a userspace server. There is no bypass path. This creates three natural enforcement points:

```
┌──────────────────────────────┐
│       WASM Module            │
│    (no raw syscalls,         │
│     no hardware access)      │
└──────────────┬───────────────┘
               │ WASI call
     ┌─────────▼──────────┐
 ①   │  WASM Interpreter  │  "Is this WASI function enabled?"
     │  Capability Flags   │   sock_connect? DENIED.
     └─────────┬──────────┘
               │ IPC
     ┌─────────▼──────────┐
 ②   │  Kernel IPC Layer  │  "Can this PID talk to that PID?"
     │  Capability Table   │   PID 7 → net server? NO CAP.
     └─────────┬──────────┘
               │ message
     ┌─────────▼──────────┐
 ③   │  Server (net/fs)   │  "Is this specific request allowed?"
     │  Per-PID Policy     │   Port 443? Not in ACL.
     └────────────────────┘
```

### Layer 1: WASI Capability Flags

The interpreter holds a permission bitfield per module. When a WASM module calls `sock_connect`, the interpreter checks the flag *before* sending any IPC. Denied calls never leave the process. Zero overhead.

### Layer 2: Kernel IPC Capabilities

The kernel maintains a per-process capability table — which PIDs this process can send IPC to. The orchestrator grants these at spawn time. A workload with console and filesystem access gets `ipc_caps: [uart_server, fs_server]`. It physically cannot send messages to the network server, even if the interpreter has a bug.

### Layer 3: Server-Side Policy

Each server enforces granular rules. The network server checks port ACLs per PID. The filesystem server enforces path sandboxing — each workload sees only its own root directory. The server can also enforce quotas: storage limits, connection counts, bandwidth.

### Why This Matters

On Linux, a container escape gives you raw syscalls — game over. On GooseOS, escaping the WASM sandbox puts you inside the interpreter process. You can make syscalls, but the kernel blocks IPC to any server you have no capability for. Even if you somehow reach a server, the server checks its per-PID policy. You would need to break all three layers simultaneously.

A workload manifest declares what each module can access:

```
workload "edge-proxy":
  console: yes
  network: connect [api.example.com:443], listen [0.0.0.0:8080]
  filesystem: none
  memory: 16MB
```

The orchestrator reads this, sets the WASI flags, grants IPC capabilities, and informs each server of the policy. Simple, auditable, and enforced at every layer.

Compare this to Docker, where you need Dockerfile + seccomp profile + AppArmor policy + cgroup limits + network policy — five configuration surfaces that must all agree. GooseOS has one manifest and three enforcement points that fall naturally out of the microkernel architecture.

## The Endgame

Imagine a cloud node running GooseOS. Each tenant's workload is a .wasm module, loaded into its own process. The kernel provides hardware isolation. WASM provides language-level sandboxing. IPC provides communication. The three-layer permission model controls exactly what each workload can reach. No Linux, no Docker, no CVEs in the container runtime because there is no container runtime.

Cold start: microseconds. Memory per workload: kilobytes. Attack surface: 16 syscalls. Permissions: three independent layers, each simple enough to audit by hand.

That is the bet. GooseOS is the experiment to find out if it works.

---

*GooseOS is open source and documented chapter-by-chapter at [TheGooseFactor](https://thegoosefactor.com). The kernel runs on RISC-V hardware today. Build 47 just shipped userspace device servers — the last piece before WASM.*

*Honk.*
