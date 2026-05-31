---
sidebar_position: 2
title: "Glossary"
---

# Glossary

> The vocabulary of Rust, defined concisely. Each entry links to the
> chapter where it's developed.

**Associated function** — a function defined in an `impl` block that does
*not* take `self`; called on the type with `::` (e.g. `String::new`).
Often a constructor. ([Ch 8](/rust/part-3-types/structs-and-enums))

**Async / `.await`** — syntax for cooperative concurrency: an `async`
function returns a lazy **future**; `.await` suspends the task until the
future is ready, yielding the thread meanwhile. Needs a runtime.
([Ch 18](/rust/part-5-concurrency/async-await))

**Borrow** — to access a value through a **reference** without taking
ownership. Shared (`&T`, many, read-only) or mutable (`&mut T`, exclusive).
([Ch 5](/rust/part-2-ownership/borrowing-and-references))

**Borrow checker** — the compiler component that enforces the borrowing
rules (one `&mut` xor many `&`; no reference outlives its data).
([Ch 5](/rust/part-2-ownership/borrowing-and-references))

**Bound (trait bound)** — a constraint on a generic type (`T: Trait`)
saying it must implement a trait; unlocks that trait's methods in the
body. ([Ch 11](/rust/part-3-types/generics))

**Box (`Box<T>`)** — a smart pointer that owns a value on the heap. Used
for large values, trait objects, and recursive types.
([Ch 15](/rust/part-4-data/smart-pointers))

**Closure** — an anonymous function (`|args| body`) that can capture
variables from its environment (by reference, or by ownership with
`move`). Implements `Fn`/`FnMut`/`FnOnce`.
([Ch 14](/rust/part-4-data/iterators-and-closures))

**Copy** — a trait for types cheaply duplicable by copying bytes
(integers, `bool`, `char`, ...). `Copy` types are copied, not moved, on
assignment. ([Ch 4](/rust/part-2-ownership/ownership-and-moves))

**Crate** — the unit of compilation: a **binary** crate (`main.rs`, an
executable) or a **library** crate (`lib.rs`).
([Ch 20](/rust/part-6-ecosystem/modules-crates-cargo))

**crates.io** — the central package registry where Rust libraries are
published and fetched by Cargo.
([Ch 2](/rust/part-1-getting-started/hello-cargo))

**Dangling reference** — a reference to freed/invalid memory. Prevented at
compile time in Rust. ([Ch 5](/rust/part-2-ownership/borrowing-and-references))

**Data race** — two threads accessing the same memory, one writing,
without synchronization. Made a *compile error* by the borrow checker.
([Ch 16](/rust/part-5-concurrency/threads-send-sync))

**Deref** — the trait letting a smart pointer be used like a reference
(`*p`, auto-deref on method calls).
([Ch 15](/rust/part-4-data/smart-pointers))

**Drop** — the trait whose code runs when a value goes out of scope
(RAII); how Rust frees resources automatically and deterministically.
([Ch 4](/rust/part-2-ownership/ownership-and-moves))

**Enum** — a **sum type**: a value that is *one of* several named
variants, each optionally carrying data. `Option`/`Result` are enums.
([Ch 8](/rust/part-3-types/structs-and-enums))

**Exhaustiveness** — `match` must cover every possible case, or it won't
compile; adding an enum variant flags every `match` to update.
([Ch 9](/rust/part-3-types/pattern-matching))

**Fearless concurrency** — the property that concurrent Rust which
compiles is free of data races, because the ownership rules forbid the
unsynchronized sharing that causes them.
([Ch 16](/rust/part-5-concurrency/threads-send-sync))

**`Fn` / `FnMut` / `FnOnce`** — the three closure traits: borrow captures
/ mutate captures / consume captures. Functions specify which they accept.
([Ch 14](/rust/part-4-data/iterators-and-closures))

**Future** — a value representing a not-yet-complete async computation;
*lazy* — does nothing until polled by a runtime.
([Ch 18](/rust/part-5-concurrency/async-await))

**Generics** — code parameterized over types (`<T>`), with bounds stating
requirements; **monomorphized** to zero-cost concrete code.
([Ch 11](/rust/part-3-types/generics))

**Lifetime** — the span during which a reference is valid. Mostly
inferred; annotated (`'a`) to relate input/output reference lifetimes.
Descriptive, not prescriptive. ([Ch 6](/rust/part-2-ownership/lifetimes))

**Macro** — code that generates code at compile time. **Declarative**
(`macro_rules!`, pattern-match syntax) or **procedural** (`#[derive]`,
attributes, function-like). Hygienic. ([Ch 21](/rust/part-6-ecosystem/macros))

**Module (`mod`)** — a namespace grouping items within a crate and
defining privacy boundaries. ([Ch 20](/rust/part-6-ecosystem/modules-crates-cargo))

**Monomorphization** — the compiler generating a specialized copy of
generic code per concrete type used — the source of zero-cost generics.
([Ch 11](/rust/part-3-types/generics))

**Move** — transfer of ownership on assignment or passing (for non-`Copy`
heap types); the moved-from variable becomes invalid.
([Ch 4](/rust/part-2-ownership/ownership-and-moves))

**`move` (closure)** — keyword forcing a closure to take ownership of its
captures (needed when it outlives the current scope, e.g. for a thread).
([Ch 14](/rust/part-4-data/iterators-and-closures))

**Mutex (`Mutex<T>`)** — a lock guarding shared data; `lock()` returns a
guard that derefs to the data and releases on drop. Thread-safe interior
mutability. ([Ch 17](/rust/part-5-concurrency/message-passing-shared-state))

**Option (`Option<T>`)** — an enum (`Some`/`None`) for a value that may be
absent — Rust's replacement for null.
([Ch 12](/rust/part-4-data/error-handling))

**Orphan rule** — you may implement a trait for a type only if you own the
trait or the type; keeps trait impls coherent.
([Ch 10](/rust/part-3-types/traits))

**Ownership** — the system where each value has one owner and is dropped
when the owner goes out of scope; how Rust manages memory without a GC.
([Ch 4](/rust/part-2-ownership/ownership-and-moves))

**Panic** — an unrecoverable error: unwinds and aborts the thread. For
bugs/impossible states; use `Result` for expected failures.
([Ch 12](/rust/part-4-data/error-handling))

**Pattern** — a syntactic shape matched against a value to test it and/or
destructure it (in `match`, `if let`, `let`).
([Ch 9](/rust/part-3-types/pattern-matching))

**`?` operator** — on `Ok`/`Some` yields the inner value; on `Err`/`None`
returns it from the function (converting the error via `From`).
([Ch 12](/rust/part-4-data/error-handling))

**RAII** — Resource Acquisition Is Initialization: a resource's lifetime
is tied to a scope, freed via `Drop` at scope exit.
([Ch 4](/rust/part-2-ownership/ownership-and-moves))

**Rc (`Rc<T>`)** — reference-counted shared ownership (single-threaded);
freed when the last owner drops. `Arc<T>` is the thread-safe version.
([Ch 15](/rust/part-4-data/smart-pointers))

**Reference (`&T`, `&mut T`)** — a borrowed pointer to a value the
reference does not own. ([Ch 5](/rust/part-2-ownership/borrowing-and-references))

**RefCell (`RefCell<T>`)** — interior mutability with the borrow rules
checked at *runtime* (panics on violation) instead of compile time.
([Ch 15](/rust/part-4-data/smart-pointers))

**Result (`Result<T, E>`)** — an enum (`Ok`/`Err`) for a fallible
operation — Rust's replacement for exceptions.
([Ch 12](/rust/part-4-data/error-handling))

**Send** — marker trait: a type is `Send` if it's safe to transfer
ownership of it to another thread. An *auto trait*.
([Ch 16](/rust/part-5-concurrency/threads-send-sync))

**Slice (`&[T]`, `&str`)** — a borrowed view (pointer + length) into a
contiguous sequence; no ownership, no copy.
([Ch 7](/rust/part-2-ownership/slices-and-strings))

**Smart pointer** — a type that acts like a pointer but adds behavior
(owning, counting, locking), via `Deref` and `Drop` (`Box`, `Rc`,
`RefCell`, ...). ([Ch 15](/rust/part-4-data/smart-pointers))

**String / `&str`** — `String` is owned, growable, heap UTF-8 text;
`&str` is a borrowed string slice. (Like `Vec<T>` vs `&[T]`.)
([Ch 7](/rust/part-2-ownership/slices-and-strings))

**Struct** — a **product type**: a record grouping named (or positional)
fields that exist together. ([Ch 8](/rust/part-3-types/structs-and-enums))

**Sync** — marker trait: `T` is `Sync` if `&T` is `Send` — safe to share
references across threads. An *auto trait*.
([Ch 16](/rust/part-5-concurrency/threads-send-sync))

**Trait** — a set of methods a type can implement; Rust's interface and
the basis of generics and polymorphism. ([Ch 10](/rust/part-3-types/traits))

**Trait object (`dyn Trait`)** — a type-erased value behind a pointer
giving runtime (dynamic) dispatch via a vtable; enables heterogeneous
collections. ([Ch 10](/rust/part-3-types/traits))

**Unsafe** — a block/function unlocking five operations the compiler
can't verify (raw-pointer deref, FFI, mutable statics, `unsafe` traits,
unions); you uphold the invariants. ([Ch 19](/rust/part-5-concurrency/unsafe-rust))

**Vec (`Vec<T>`)** — a growable, heap-allocated array that owns its
elements. ([Ch 13](/rust/part-4-data/collections))

**Zero-cost abstraction** — a high-level construct that compiles to code
as efficient as the hand-written low-level version (iterators, generics).
([Ch 1](/rust/part-1-getting-started/why-rust))

See the [cheat sheet](/rust/appendix/cheat-sheet) for syntax and
[further reading](/rust/appendix/further-reading) for resources.
