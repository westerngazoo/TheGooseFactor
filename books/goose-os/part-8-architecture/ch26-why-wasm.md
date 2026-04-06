---
sidebar_position: 1
sidebar_label: "Ch 26: Why WASM?"
title: "Chapter 26: Why WASM? — The Crossroads of Linux, POSIX, and WebAssembly"
---

# Chapter 26: Why WASM? — The Crossroads of Linux, POSIX, and WebAssembly

Seven parts in. The kernel boots, manages memory, runs isolated processes, and passes messages between them. At this point, every OS project hits the same fork in the road:

*What software does this thing actually run?*

The question sounds innocent. It's not. It's the single most consequential architectural decision you'll make, and it determines whether your OS becomes (a) a worse clone of Linux, (b) an island with zero software, or (c) something genuinely interesting. Most hobby OS projects choose (a) or (b) and die in the tar pit.

We're choosing (c).

## Option A: Linux Compatibility

The dream: run `ls`, `gcc`, `nginx`, Docker, and every Linux binary ever compiled. The nightmare: implementing everything those binaries depend on.

A Linux binary doesn't just call a few syscalls. It expects an *entire universe*:

```
What a Linux binary expects:
┌──────────────────────────────────────────────────────────┐
│  ELF loader           (parse headers, map segments)      │
│  ~450 syscalls        (open, read, write, mmap, fork,    │
│                        exec, ioctl, epoll, futex, ...)   │
│  /proc filesystem     (process info as virtual files)    │
│  /dev filesystem      (device nodes)                     │
│  /sys filesystem      (kernel parameter tree)            │
│  Signal delivery      (SIGSEGV, SIGKILL, SIGTERM, ...)   │
│  POSIX threads        (clone, futex, thread-local)       │
│  Socket API           (TCP, UDP, Unix domain)            │
│  Filesystem VFS       (ext4, tmpfs, overlay, ...)        │
│  Memory management    (mmap, brk, mremap, cow, huge)     │
│  ...approximately 30 million lines of kernel code        │
└──────────────────────────────────────────────────────────┘

What GooseOS has:
┌──────────────────────────────────────────────────────────┐
│  SYS_PUTCHAR          (one character to UART)            │
│  SYS_EXIT             (die)                              │
│  SYS_SEND             (talk to someone)                  │
│  SYS_RECEIVE          (listen to someone)                │
└──────────────────────────────────────────────────────────┘
```

There are exactly three projects that have successfully implemented Linux syscall compatibility from scratch: **Windows Subsystem for Linux v1** (~200 engineers at Microsoft, several years), **gVisor** (~50 engineers at Google, ongoing since 2018), and **FreeBSD's linuxulator** (~25 years of development).

We are one person with a goose emoji.

> :angrygoose: Let's be mathematically precise about this. Linux has ~450 syscalls. The average syscall implementation is ~500 lines including validation, error handling, and edge cases. That's 225,000 lines of code just for the syscall layer. Then add a VFS (~100K lines), a network stack (~200K lines), a scheduler (~50K lines), memory management (~150K lines), and driver infrastructure (~200K lines). Minimum viable "run `ls`" is about 750,000 lines. GooseOS is 2,100 lines. We'd need to multiply our codebase by 357. At our current pace, that's approximately never.

**Verdict:** Not happening. We'd lose everything that makes GooseOS interesting — the microkernel simplicity, the verifiability, the elegance — and produce a bad Linux clone that can't even run `htop` because we forgot to implement `sysinfo()`.

## Option B: Our Own ABI, No Compatibility

GooseOS defines its own syscalls, its own ABI, its own conventions. Software targets it directly. This is what seL4, Zephyr, FreeRTOS, and every other non-Linux kernel does.

**Problem:** Zero existing software runs on it. Not "almost zero." Literally zero. Every program must be hand-written for GooseOS. Want a text editor? Write it. Want a web server? Write it. Want a calculator? Write it. Want a calculator that doesn't segfault? Fix it, then write it again.

This is the path to a technically pure, architecturally pristine kernel that nobody ever uses for anything. Also known as "academic OS research."

## Option C: WASI — The Interesting Answer

Here's the insight that changes everything.

**WebAssembly (WASM)** is a portable binary format. Code is compiled to WASM, and a *runtime* executes it. The runtime provides system access through a standardized interface called **WASI** (WebAssembly System Interface).

WASI has ~30 functions. Not 450 syscalls. Thirty functions.

```
WASI system interface (the ones that matter):
┌──────────────────────────────────────────────┐
│  fd_read(fd, iovs)           ← Read input    │
│  fd_write(fd, iovs)          ← Write output  │
│  clock_time_get(id)          ← Current time   │
│  proc_exit(code)             ← Exit           │
│  environ_get()               ← Env vars       │
│  args_get()                  ← CLI arguments  │
│  random_get(buf, len)        ← Entropy        │
│  fd_close(fd)                ← Close file     │
│  path_open(...)              ← Open file      │
│  sock_recv / sock_send       ← Networking     │
└──────────────────────────────────────────────┘
```

And here's the trick: the WASM runtime is just a **userspace process** on GooseOS. It translates WASI calls into GooseOS IPC messages. The kernel knows nothing about WASM. From the kernel's perspective, the WASM runtime is PID 3, and it communicates with device servers through SYS_SEND and SYS_RECEIVE.

```
Traditional Linux model:
  App → syscall → Kernel (450 syscalls, 30M lines) → Hardware

GooseOS WASM model:
  App.wasm → WASI → Runtime (userspace) → IPC → Kernel (18 syscalls, 9K lines) → Hardware
```

Any language that compiles to WASM runs on GooseOS:

| Language | WASM Target | Notes |
|----------|------------|-------|
| Rust | `wasm32-wasi` | First-class support, `cargo build --target wasm32-wasi` |
| C/C++ | `wasm32-wasi` | Via clang/LLVM or Emscripten |
| Go | `GOOS=wasip1` | Since Go 1.21 |
| Python | `wasm32-wasi` | Via CPython compiled to WASM |
| JavaScript | N/A | Runs in a JS-to-WASM engine |
| Zig | `wasm32-wasi` | First-class target |

That's not "zero existing software." That's *all existing software that compiles to WASM*. Which, in 2026, is a lot.

> :surprisedgoose: "But it's not *native* Linux binaries!" True. You can't `apt install nginx` and run it directly. But you CAN compile nginx (or any C program) to WASM+WASI with `clang --target=wasm32-wasi` and run it on GooseOS. The source code is the same. The binary is different. The result is identical. And you get double sandboxing for free — WASM's language-level sandbox PLUS GooseOS's hardware-level process isolation.

## Why This Is Actually Better Than Linux

This isn't a compromise. For our use case — a container orchestration platform with fast kernel access — WASM is *architecturally superior* to native Linux binaries.

### 1. Double Sandbox

Linux containers use namespaces and cgroups for isolation. These are 50,000 lines of kernel code with a rich history of security bugs (CVE-2022-0185, CVE-2023-0386, CVE-2024-1086...). A container escape means full kernel compromise.

GooseOS + WASM has two independent isolation layers:

```
Layer 1: WASM sandbox
  - No raw memory access (linear memory bounds-checked)
  - No raw syscalls (only WASI host functions)
  - No pointer arithmetic outside the sandbox
  - Verified at load time (WASM module validation)

Layer 2: GooseOS process isolation
  - Separate Sv39 page table per process
  - U-mode (no CSR access, no MMIO access)
  - Capability-gated resource access
  - 18 syscalls (vs Linux's 450 attack surface)
```

To escape, you'd need to break BOTH layers. Break the WASM sandbox AND escalate privilege through the microkernel. Good luck — the microkernel is 2,000 lines and the WASM spec has been formally verified by multiple independent teams.

### 2. Tiny Trusted Computing Base

The **Trusted Computing Base (TCB)** is the code that must be correct for the system to be secure. In Linux, the TCB is the entire kernel — 30 million lines. In GooseOS + wasmi:

| Component | Lines | In TCB? |
|-----------|-------|---------|
| GooseOS kernel | ~9,300 | Yes |
| wasmi WASM engine | ~30,000 | Partially (validation + execution) |
| Device servers | ~2,000 | Yes (per server) |
| Orchestrator | ~800 | No (userspace, can be restarted) |
| WASM workloads | varies | No (sandboxed) |
| **Total TCB** | **~40,000** | |

40,000 lines vs 30,000,000 lines. Three orders of magnitude less code that must be bug-free. This isn't just a nice number — it's the difference between "can be audited by a small team" and "requires divine intervention to be correct."

### 3. Fast Kernel Access (For Real)

The user asked for "quick kernel access." Let's quantify:

**Linux syscall overhead:** ~100-200ns per syscall (user→kernel transition, security checks, virtual dispatch, capability checks, return). A simple `write(fd, buf, 1)` to write one byte takes ~150ns on modern x86. On RISC-V it's worse because RISC-V's ecall is not as optimized as x86's SYSCALL instruction.

**GooseOS IPC cost:** ecall → save 33 registers → check process table (8 entries, linear scan) → load 33 registers → sret. That's approximately 50-80 instructions. On a 1.5GHz U74 core: **~35-55ns per one-way IPC**. A full SYS_CALL (send + wait for reply) would be ~80ns — one ecall, one context switch.

**vDSO for free reads:** Clock, tick counter, boot time — mapped read-only into every process. No syscall at all. ~1ns.

```
Quick kernel access mechanisms (GooseOS):

┌────────────────────────────────────────────────┐
│ vDSO page read         │  ~1ns    │  0 ecalls  │
│ SYS_CALL (RPC)         │  ~80ns   │  1 ecall   │
│ Shared memory + notify │  ~80ns   │  1 ecall   │
│ SYS_SEND + SYS_RECEIVE │  ~160ns  │  2 ecalls  │
└────────────────────────────────────────────────┘

Linux comparison:
┌────────────────────────────────────────────────┐
│ vDSO (clock_gettime)   │  ~20ns   │  0 syscalls│
│ Simple syscall (getpid)│  ~150ns  │  1 syscall │
│ Complex syscall (read) │  ~300ns  │  1 syscall │
│ Socket send + recv     │  ~2μs    │  2 syscalls│
└────────────────────────────────────────────────┘
```

For IPC-heavy workloads (which microservices are), GooseOS is *faster* than Linux because our kernel does less work per transition. There's no virtual dispatch table, no credential checks, no namespace resolution, no audit logging. Just: save registers, check process table, load registers, switch page table, return.

> :happygoose: This is the counterintuitive truth about microkernels: they're slower for monolithic operations (a single fat syscall that does everything) but faster for fine-grained communication. If your workload is "one process doing everything" (monolith), Linux wins. If your workload is "many small services talking to each other" (microservices), the microkernel wins. And guess what architecture WASM + containers naturally push you toward? Microservices. The OS architecture and the application architecture are aligned. That's not an accident — that's design.

## The Decision

We're going with WASI. Here's what that means concretely:

1. **GooseOS does NOT implement Linux syscalls.** Not now, not ever. We implement 18 GooseOS-native syscalls.

2. **The WASM runtime (wasmi) is a userspace server.** It receives WASM module bytes, instantiates them, links WASI host functions, and executes. From the kernel's perspective, it's just another process doing IPC.

3. **WASI functions map to GooseOS IPC.** `fd_write` → SYS_CALL to console server. `clock_time_get` → read vDSO page. `proc_exit` → SYS_EXIT. The WASM runtime translates between worlds.

4. **Any language that compiles to `wasm32-wasi` runs on GooseOS.** Rust, Go, C, Zig, Python, JavaScript — all of them. "Linux software compatibility" is achieved not by cloning Linux, but by targeting the same compilation target.

5. **The orchestrator manages WASM workloads with container semantics.** Start, stop, health check, resource limits. Closer to Cloudflare Workers than Docker. No cgroups, no namespaces — WASM provides the abstraction layer.

This is the pivot. GooseOS stops being "a teaching microkernel" and starts being "a WASM-native container platform on RISC-V." Nobody else is doing this with a custom kernel. Everyone else (Fermyon Spin, Fastly Compute, Wasmer Edge) runs on Linux. We run on 9,300 lines of verified-ready Rust.

The goose is no longer just honking. It's *hunting*.
