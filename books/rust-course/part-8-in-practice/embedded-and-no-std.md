---
sidebar_position: 3
title: "Embedded and no_std Rust"
---

# Embedded and no_std Rust

> Rust runs with **no operating system and no allocator** — on
> microcontrollers, in kernels, in WebAssembly. **`#![no_std]`** drops the
> standard library down to **`core`** (and optionally **`alloc`**), and a
> rich embedded ecosystem (`embedded-hal`, RTIC, Embassy) brings Rust's
> safety, zero-cost abstractions, and no-GC profile to bare metal — where
> it's quietly a landmark.

Everything so far assumed `std` — an operating system underneath providing
heap allocation, threads, files, `println!`. Embedded systems, kernels, and
WASM have **none of that**. Rust's answer is the **`no_std`** world: strip
the standard library to its OS-independent core, and build up only what the
target actually has. This is where Rust's "C-level, but safe" promise pays
off most.

## 1. The freestanding world

A microcontroller has no OS, no filesystem, no heap allocator (unless you
provide one), maybe a few KB of RAM, and code running directly on the
metal. There's no `std` because there's nothing for `std` to call — no
operating system to ask for memory or I/O. Programs in this world are
**freestanding**: they *are* the lowest software layer.

Rust targets this directly, which is remarkable — a high-level,
memory-safe language running with *zero runtime* on a chip with kilobytes
of memory, no garbage collector to ship, no OS to assume. The mechanism is
choosing *which* standard library you get.

## 2. core, alloc, std

Rust's standard library is layered into three crates, and `no_std` picks
the lower layers:

- **`core`**: the foundation — types, traits, iterators, `Option`/`Result`,
  slices, arithmetic, `Iterator`. **No allocation, no OS** dependencies.
  *Always* available, even freestanding.
- **`alloc`**: heap-allocating types — `Box`, `Vec`, `String`, `Rc`. Needs
  an **allocator** (you provide one), but **no OS**. Opt in when your target
  has usable RAM.
- **`std`**: everything else — files, threads, networking, `println!`,
  environment — and it *assumes an operating system*. The default for
  desktops/servers.

`#![no_std]` says "don't link `std`; give me `core`." Add `alloc` (with a
global allocator) if you can afford a heap. So embedded Rust is a *subset*:
`core` always, `alloc` if you have RAM, `std` only with an OS. You write the
*same language*, with a smaller standard library.

```rust
#![no_std]                       // no std — only core (and alloc if added)
#![no_main]                      // no standard main entry point
```

## 3. What you give up (and keep)

Going `no_std` (with just `core`) means **losing** what needs an OS or a
heap:

- No `Vec`, `String`, `Box`, `HashMap` (they allocate) — *unless* you add
  `alloc`.
- No `println!`, no `std::io`, no files, no `std::thread`, no `std::net`.
- No `std::collections` beyond what `alloc` provides.

But you **keep** the language itself and a surprising amount:

- All the **syntax, ownership, borrowing, traits, generics, pattern
  matching** — the whole language is intact.
- `core` types: `Option`, `Result`, slices, **iterators**, arithmetic,
  `Iterator`/`Trait` machinery.
- **Fixed-size, stack-only** data: arrays `[T; N]`, tuples, structs, enums.
- The **borrow checker** and all of Rust's safety — *especially* valuable
  with no OS to catch your mistakes.

So `no_std` Rust feels like Rust with a leaner toolbox — you reach for
arrays and `heapless` collections instead of `Vec`, and you can't `println!`
— but ownership, iterators, traits, and safety are all still there.

## 4. The bare-metal essentials

A freestanding Rust program needs a few things `std` normally provides:

- **A `#[panic_handler]`**: with no OS, *you* decide what happens on a
  panic (halt, reset, log to a UART). `std` had one; `no_std` makes you
  write it.
- **An entry point**: no OS calls `main`, so `#[no_main]` + a defined reset
  handler (often via a crate like `cortex-m-rt`) is the real start.
- **A global allocator** *if* using `alloc` (`#[global_allocator]` — e.g. a
  simple bump or linked-list allocator sized to your RAM).
- **`#[no_mangle]`** ([Chapter 27](/rust/part-7-advanced-types/advanced-unsafe-and-ffi))
  for symbols the linker/hardware expects by exact name (the reset vector).

These are the pieces `std` quietly supplied; in the freestanding world you
assemble them (usually from a runtime crate for your chip). It's more
explicit, because there's no OS doing it for you.

## 5. The embedded ecosystem

Rust's embedded story is mature and growing, organized around layered
abstractions:

- **PACs (Peripheral Access Crates)**: auto-generated, type-safe register
  definitions for a specific chip — you access hardware registers through
  *typed* APIs, not raw addresses.
- **`embedded-hal`**: a set of standard *traits* for hardware (a `SpiBus`,
  a `DigitalOutputPin`, a `DelayNs`), so drivers are written against the
  traits and work across *any* chip that implements them — portability via
  traits ([Chapter 24](/rust/part-7-advanced-types/advanced-traits)).
- **`cortex-m` / `riscv`**: architecture support crates.
- **RTIC**: a concurrency framework for embedded — interrupt-driven, with
  compile-time-checked resource sharing (no data races on shared
  peripherals).
- **Embassy**: **async/await on bare metal** — the futures machinery of
  [Chapter 28](/rust/part-8-in-practice/async-internals) running with *no
  OS and no allocator*, an executor on a microcontroller. Async without a
  heap, which is a genuinely striking result.

This layering — typed registers (PAC) → portable traits (`embedded-hal`) →
frameworks (RTIC/Embassy) → your application — mirrors `std` Rust's
ecosystem, built for the metal.

## 6. Typed registers and typestate peripherals

Embedded is where the **typestate** pattern
([Chapter 26](/rust/part-7-advanced-types/typestate-and-zero-cost-design))
shines brightest. Hardware peripherals have *modes* — a GPIO pin is in
input mode or output mode; configuring it wrong is a bug that's silent and
maddening on hardware. Embedded Rust encodes the mode in the **type**:

```rust
let pin = gpio.pin0.into_output();   // pin: Pin<Output>
pin.set_high();                      // OK — set_high exists only on Output
// pin.read();                       // COMPILE ERROR — read is Input-only
```

A `Pin<Output>` is a *different type* from a `Pin<Input>`, and the methods
that make sense differ — so "read from an output pin" or "write to an input
pin" **won't compile**. Combined with PACs' typed registers, this means a
whole class of hardware-configuration bugs becomes compile errors, at **zero
runtime cost** (the type tags are erased). On a chip where a wrong register
write can brick the device or cause a silent fault, moving these errors to
compile time is enormously valuable — and it's pure
[Chapter 26](/rust/part-7-advanced-types/typestate-and-zero-cost-design)
applied to silicon.

> :nerdygoose: Embedded is where Rust's whole thesis becomes *visceral*. On
> a microcontroller there is **no OS, no GC, no runtime, no safety net** —
> a memory bug doesn't get a segfault, it silently corrupts a register and
> the device misbehaves in the field. C has owned this domain forever,
> precisely *because* it has no runtime — and paid for it in exactly the
> memory bugs that are hardest to debug on hardware. Rust offers, for the
> first time, the *same* zero-runtime, full-control, bare-metal profile as
> C — **plus** the borrow checker, ownership, typed peripherals, and
> zero-cost abstractions. Memory safety and hardware-state safety on a chip
> with 8KB of RAM, with no runtime cost. That combination didn't exist
> before, and it's why Rust is steadily taking embedded and kernel work.

## 7. WebAssembly: another freestanding target

`no_std`'s sibling is **WebAssembly (WASM)** — Rust compiles to WASM to run
in browsers, edge runtimes, and plugin sandboxes. WASM is attractive for
the *same reasons* as embedded: a small, sandboxed target with no assumed
OS, where shipping a GC runtime is costly:

- Rust ships **no GC runtime** (unlike many GC'd languages targeting WASM),
  so binaries are small and start instantly.
- **`wasm-bindgen`** / **`wasm-pack`** bridge Rust and JavaScript; **WASI**
  provides a standardized system interface for WASM outside the browser.
- Much WASM Rust uses `std` (with a WASM-flavored backend) rather than full
  `no_std`, but the *motivation* — small, fast, no-GC, sandboxed — is the
  freestanding mindset.

WASM is why Rust is a top choice for in-browser performance code, edge
compute, and portable plugins: the no-GC, zero-cost profile that suits
embedded also suits a sandbox you ship over the network.

## 8. Why Rust for bare metal

Step back to the significance. The domains in this chapter — embedded,
kernels, WASM, anything freestanding — were historically **C's exclusive
territory**, *because* C has no runtime to get in the way. The cost was C's
memory unsafety, in exactly the places it hurts most (no OS to catch it, no
debugger on a deployed device).

Rust changes the equation: it offers the *same* freestanding profile — no
runtime, no GC, full hardware control, predictable performance — **plus**
compile-time memory safety, data-race freedom
([Chapter 16](/rust/part-5-concurrency/threads-send-sync)), and zero-cost
abstractions ([Chapter 11](/rust/part-3-types/generics)). You write
high-level, safe, expressive code that compiles to bare-metal machine code
with no runtime tax. That's why parts of Linux and Windows kernels, new
embedded products, and serious WASM workloads are increasingly Rust. The
language that promised "safe *and* fast, no GC"
([Chapter 1](/rust/part-1-getting-started/why-rust)) delivers that promise
most completely *here*, where there's no GC to give up because there was
never going to be one.

> :weightliftinggoose: Rust runs on bare metal — **`#![no_std]`** trades
> `std` for **`core`** (always, no OS/heap) plus optionally **`alloc`**
> (heap types, needs an allocator, no OS). You keep the whole language —
> ownership, traits, iterators, the borrow checker — and lose only what
> needs an OS/heap (`Vec`/`String`/`println!` without `alloc`). The
> ecosystem layers up: typed registers (**PACs**) → portable traits
> (**`embedded-hal`**) → frameworks (**RTIC**, **Embassy** for async on
> metal), with **typestate** peripherals making wrong hardware config a
> *compile error*. Same target profile as C — no runtime, no GC, full
> control — **plus safety**. That combination is why Rust is winning
> embedded, kernels, and WASM.

## What we covered

- **Freestanding** targets (microcontrollers, kernels, WASM) have **no
  OS, no allocator** — so no `std`.
- **`#![no_std]`** drops to **`core`** (types, traits, iterators,
  `Option`/`Result`, slices — no alloc/OS); add **`alloc`** (`Box`/`Vec`/
  `String`, needs an allocator) if you have RAM; **`std`** needs an OS.
- You **lose** OS/heap things (`Vec`/`String`/`println!` without `alloc`,
  files, threads) but **keep** the whole language and `core` (ownership,
  iterators, traits, safety).
- Bare metal needs a **`#[panic_handler]`**, an explicit **entry point**
  (`#[no_main]`), a **`#[global_allocator]`** (with `alloc`), and
  `#[no_mangle]` symbols.
- The ecosystem: **PACs** (typed registers), **`embedded-hal`** (portable
  hardware traits), **RTIC** (checked embedded concurrency), **Embassy**
  (async on bare metal, no heap).
- **Typestate peripherals** (`Pin<Output>` vs `Pin<Input>`) make wrong
  hardware configuration a **compile error** at zero runtime cost.
- **WASM** is the freestanding sibling — no-GC, small, sandboxed; via
  `wasm-bindgen`/`wasm-pack`/WASI.
- Rust gives C's bare-metal profile (no runtime, no GC, full control)
  **plus** memory safety — why it's winning embedded, kernels, and WASM.

## What's next

[Chapter 31](/rust/part-8-in-practice/idioms-and-patterns) — idioms,
patterns, and type-driven design. The capstone: error-handling patterns
(`thiserror` vs `anyhow`), builders and newtypes, the conversion traits
(`From`/`Into`), and the design philosophy — *make illegal states
unrepresentable*, *parse don't validate*, *the type is the proof* — that
ties the whole expanded course together.
