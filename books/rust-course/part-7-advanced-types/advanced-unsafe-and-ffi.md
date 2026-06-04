---
sidebar_position: 4
title: "Advanced Unsafe and FFI"
---

# Advanced Unsafe and FFI

> `unsafe` isn't a way to turn off safety — it's a way to take on a
> **contract** the compiler can't check, and the craft is writing **sound
> safe abstractions** over a tiny unsafe core. This chapter goes past
> [Chapter 19](/rust/part-5-concurrency/unsafe-rust): the safety
> contract, raw pointers in earnest, `unsafe impl Send`/`Sync`, and the
> **foreign function interface** for talking to C.

[Chapter 19](/rust/part-5-concurrency/unsafe-rust) introduced `unsafe`'s
five powers and the "wrap it in a safe API" pattern. This chapter is the
working depth: *how* you actually write that safe wrapper soundly, how raw
pointers behave, how to mark types thread-safe by hand, and how Rust speaks
to the vast world of C. It's where Rust meets the unverifiable — done
right.

## 1. Unsafe is a contract, not an escape

The mental reframe that separates safe `unsafe` from dangerous `unsafe`:
writing `unsafe` does **not** disable the borrow checker or the type
system. It unlocks five operations
([Chapter 19](/rust/part-5-concurrency/unsafe-rust)) and, in exchange,
makes **you** responsible for invariants the compiler normally proves:

- A raw pointer you dereference is **valid, aligned, and non-null**.
- You don't create two `&mut` to the same data (the aliasing rule still
  *must* hold — the compiler just isn't checking).
- A type you `unsafe impl Send` for really *is* safe to send.

`unsafe` is you signing a contract: "I have personally verified the
invariants here; trust me." Break the contract and you get **undefined
behavior** — the same class of catastrophe as C. The keyword doesn't make
the rules go away; it makes *you* the one enforcing them.

## 2. Documenting the safety contract

Because `unsafe` shifts responsibility to humans, the discipline is to make
the contract **explicit**. Every `unsafe fn` should document its
**`# Safety`** requirements — what the caller must guarantee — and every
`unsafe` block should justify *why* it's sound:

```rust
/// Reads the value at `ptr`.
///
/// # Safety
/// `ptr` must be non-null, aligned, and point to an initialized `T`
/// that outlives this call. The caller must ensure no other thread
/// mutates `*ptr` during the read.
unsafe fn read_value<T>(ptr: *const T) -> T {
    // SAFETY: guaranteed by the caller per the contract above.
    std::ptr::read(ptr)
}
```

This isn't bureaucracy — it's the *interface* of unsafe code. The `# Safety`
section is the contract a caller must satisfy; the `// SAFETY:` comment is
the proof that *this* call satisfies it. Auditing a codebase for soundness
becomes reading these contracts. Undocumented `unsafe` is the real danger:
nobody knows what must hold, so nobody can verify it.

## 3. Raw pointers in earnest

Raw pointers (`*const T`, `*mut T`) are C-like pointers, freed from the
borrowing rules ([Chapter 5](/rust/part-2-ownership/borrowing-and-references)).
You create them freely (safe) and dereference them only in `unsafe`. Using
them soundly means respecting things the compiler usually handles for you:

- **Validity**: the pointer points to live, allocated, initialized memory.
- **Alignment**: `*const T` must be aligned to `T`'s requirement (a
  misaligned read is UB).
- **Provenance**: a pointer carries not just an address but the *right* to
  access a region; fabricating pointers or going out of bounds breaks
  provenance and is UB.
- **Aliasing**: even with raw pointers, you must not create overlapping
  `&mut` references from them.

```rust
let mut x = 5;
let p = &mut x as *mut i32;
unsafe {
    *p = 10;                    // SAFETY: p came from a valid &mut x, still live
}
```

Raw pointers are how you build data structures the borrow checker can't
model (intrusive lists, custom allocators, the internals of `Vec`) — and
every one of the above rules is a way to dangle or corrupt memory if
violated. Tools (§7) help check them.

## 4. Building sound safe abstractions

The central craft, expanded from
[Chapter 19](/rust/part-5-concurrency/unsafe-rust): take a **small unsafe
core**, prove its invariants, and wrap it in an API whose *safe* surface
**cannot** be misused into UB. This is exactly how `Vec`, `Rc`, `RefCell`,
and `Mutex` are built — unsafe guts, safe skins:

```rust
pub struct MyVec<T> {
    ptr: *mut T,                // raw — unsafe to use directly
    len: usize,
    cap: usize,
    _marker: PhantomData<T>,    // tells the compiler we "own" Ts (Ch 25)
}

impl<T> MyVec<T> {
    pub fn push(&mut self, value: T) {       // SAFE signature
        if self.len == self.cap { self.grow(); }
        unsafe {                              // tiny unsafe core
            // SAFETY: len < cap after grow(), so this slot is valid & uninit
            std::ptr::write(self.ptr.add(self.len), value);
        }
        self.len += 1;
    }
}
```

`push` is a *safe* method — callers never write `unsafe` — but internally it
uses a raw write, justified because the surrounding code guarantees the slot
is valid. The art is making the *safe API* uphold the invariants the
*unsafe core* relies on, for **every** possible sequence of safe calls. If a
caller can reach UB without writing `unsafe`, your abstraction is **unsound**
— a bug, no matter how the caller used it. Soundness is the wrapper's whole
job.

> :nerdygoose: The soundness boundary is the most important idea in unsafe
> Rust, and it's subtle: an abstraction is **sound** only if *no* safe code,
> doing *anything* allowed by your public API, can trigger undefined
> behavior. It's not enough that *correct* use is safe — *every* use must
> be. A `MyVec` whose `set_len` is public and safe is unsound (a caller
> could set `len > cap` with no `unsafe` and then read garbage). This is
> why `Vec::set_len` *is* `unsafe`: exposing it safely would let safe code
> cause UB. Designing the safe/unsafe boundary so the safe side is
> bulletproof against all inputs is the real skill — and why writing sound
> unsafe abstractions is hard enough that you should reach for an existing
> crate first.

## 5. unsafe impl Send and Sync

`Send`/`Sync` ([Chapter 16](/rust/part-5-concurrency/threads-send-sync)) are
auto-traits, derived from a type's fields. But a type holding a **raw
pointer** is automatically *not* `Send`/`Sync` (raw pointers aren't), even
when the type is *actually* thread-safe. To assert thread-safety the
compiler can't see, you `unsafe impl`:

```rust
unsafe impl<T: Send> Send for MyVec<T> {}    // SAFETY: MyVec owns its Ts exclusively
unsafe impl<T: Sync> Sync for MyVec<T> {}
```

This is a *promise*: "I guarantee this type really is safe to send/share,
despite the raw pointer." It's `unsafe` because getting it wrong
reintroduces data races into "safe" concurrent code — the exact thing
Rust's `Send`/`Sync` exist to prevent. The bound (`T: Send`) matters: a
`MyVec<Rc<U>>` should *not* be `Send` (it holds non-`Send` data), and the
conditional impl captures that. `unsafe impl Send`/`Sync` is how
hand-written collections rejoin the safe concurrency world — soundly, if
you've earned it.

## 6. FFI: calling C

The **foreign function interface** lets Rust call C and be called by C —
the bridge to the enormous existing ecosystem of C libraries and OS APIs.
Declaring and calling a C function:

```rust
#[link(name = "m")]              // link the C math library
extern "C" {                     // C calling convention
    fn sqrt(x: f64) -> f64;      // declare the C signature
}

fn main() {
    let r = unsafe { sqrt(2.0) };   // calling C is unsafe — Rust can't verify it
    println!("{r}");
}
```

The pieces: **`extern "C"`** sets the C **calling convention/ABI**
([cf. the compiler course's ABI discussion]); the call is **`unsafe`**
because the compiler can't check C's behavior (you're trusting the
declaration matches reality). Passing data across requires matching layouts
— **`#[repr(C)]`** on structs (C field layout, not Rust's), `*const`/`*mut`
for pointers, `std::ffi::CString`/`CStr` for C strings,
`std::os::raw::c_void` and friends for C types. Crossing into C means
manually upholding everything Rust normally guarantees.

## 7. Being called by C, and the tooling

The reverse direction — exposing Rust *to* C — uses `#[no_mangle]` (keep the
symbol name unmangled, [cf. the compiler course's name-mangling]) and
`extern "C"`:

```rust
#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 { a + b }   // callable from C
```

And the tooling that makes unsafe/FFI survivable:

- **`bindgen`** generates Rust FFI declarations from C headers
  automatically; **`cbindgen`** generates C headers from Rust.
- **Miri** is an interpreter that *detects undefined behavior* in unsafe
  Rust at runtime — invaluable for testing unsafe code.
- **Sanitizers** (ASan, TSan) catch memory and threading bugs.
- **`cargo test`** + property tests exercise the safe API to find unsound
  corners.

The discipline, restated for the advanced level: **minimize** unsafe,
**wrap** it in a sound safe API, **document** the contract (`# Safety`),
**test** it hard (Miri especially), and **reach for an existing crate**
before hand-rolling — because someone has probably already written and
audited the sound abstraction you need.

## 8. When to go here

Perspective: most Rust — even most *library* Rust — needs **no** `unsafe`.
This chapter is for the specific situations that do:

- **FFI** — calling C/C++ or system APIs, or exposing Rust to them.
- **Foundational data structures** the borrow checker can't express
  (lock-free structures, arenas, intrusive collections) — and check for an
  existing crate first.
- **Verified performance** wins, *after* profiling proves the safe version
  is the bottleneck ([Chapter 29](/rust/part-8-in-practice/performance-and-optimization)).
- **Embedded** register access and hardware interaction
  ([Chapter 30](/rust/part-8-in-practice/embedded-and-no-std)).

When you do go here, you're operating at the boundary between Rust's
guarantees and the unverifiable world — and the whole craft is keeping that
boundary *sound*: a tiny, audited, documented unsafe core under a safe
surface that no caller can break. Do that, and you extend Rust's safety to
places the compiler alone can't reach.

> :weightliftinggoose: Advanced `unsafe` is about **soundness**, not
> danger. Internalize: `unsafe` is a **contract** (you uphold invariants
> the compiler can't), so **document `# Safety`** and justify every
> `// SAFETY:` block. Build a **tiny unsafe core wrapped in a safe API that
> no caller can misuse into UB** (the soundness boundary — like `Vec`).
> Respect raw-pointer rules (validity, alignment, provenance, aliasing);
> use `unsafe impl Send/Sync` only when truly thread-safe; and for **FFI**
> use `extern "C"` + `#[repr(C)]` + `#[no_mangle]`, with **bindgen** and
> **Miri** as your tools. Minimize it, wrap it, document it, test it — and
> prefer an audited crate.

## What we covered

- `unsafe` is a **contract**, not an escape: it unlocks five operations and
  makes *you* responsible for invariants the compiler can't check; breaking
  them is **undefined behavior**.
- Document the **`# Safety`** contract on `unsafe fn` and justify each
  `// SAFETY:` block — the interface of unsafe code.
- **Raw pointers** must respect **validity, alignment, provenance, and
  aliasing**; they build structures the borrow checker can't model.
- The craft is a **sound safe abstraction**: a tiny unsafe core wrapped so
  **no safe caller** can reach UB (why `Vec::set_len` is `unsafe`).
- **`unsafe impl Send`/`Sync`** asserts thread-safety the compiler can't
  see (e.g. raw-pointer-backed types) — sound only if true, often
  conditional on `T`.
- **FFI**: `extern "C"` (ABI) + `#[repr(C)]` (layout) + C string/void types
  to call C (an `unsafe` call); `#[no_mangle] extern "C"` to expose Rust to
  C.
- Tooling: **bindgen**/cbindgen (FFI glue), **Miri** (detects UB),
  sanitizers. Discipline: minimize, wrap, document, test, prefer a crate.
- Most Rust needs **no** `unsafe`; reserve it for FFI, foundational
  structures, verified perf, and embedded.

## What's next

That's Part VII. [Part VIII](/rust/part-8-in-practice/async-internals) turns
to **Rust in practice**: how async *actually* works under `.await` (futures,
`Pin`, executors), performance and optimization, embedded and `no_std`
Rust, and the idioms and patterns that tie the whole language into a design
philosophy.
