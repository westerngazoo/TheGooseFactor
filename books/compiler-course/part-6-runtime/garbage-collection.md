---
sidebar_position: 1
title: "Memory Management and Garbage Collection"
---

# Memory Management and Garbage Collection

> What compiled code needs around it. Programs allocate memory at
> runtime; something must reclaim it. We survey manual management and
> the garbage-collection algorithms — and how the compiler cooperates
> with the collector.

Compiled code runs inside a **runtime** ([Chapter 2](/compiler/part-1-foundations/source-and-target)).
A central runtime concern is **memory management**: programs allocate
memory (objects, arrays) on the heap, and that memory must eventually
be reclaimed. This chapter covers manual management, garbage collection
algorithms, and the compiler's role.

## 1. The memory-management problem

The **heap** ([Chapter 19](/compiler/part-5-back-end/targeting-real-machines))
holds dynamically-allocated memory — objects whose lifetime isn't tied
to a function's stack frame. Allocation is easy (grab some heap);
**reclamation** is the hard part: when is an object no longer needed, so
its memory can be reused? Get it wrong and you have:

- **Memory leaks**: never reclaiming → memory grows unbounded.
- **Use-after-free**: reclaiming too early → dangling pointers,
  crashes, security holes.
- **Double-free**: reclaiming twice → corruption.

Memory management is the discipline of reclaiming exactly when safe —
and it's one of the hardest correctness problems in systems
programming.

## 2. Manual memory management

The C/C++ approach: the **programmer** explicitly allocates (`malloc`/
`new`) and frees (`free`/`delete`). Maximum control, zero runtime
overhead — but error-prone (leaks, use-after-free, double-free are
endemic). The compiler does little; the burden is on the programmer.

Refinements layer discipline on top:

- **RAII** (C++): tie resource lifetime to object scope; destructors
  free on scope exit. The compiler emits destructor calls
  automatically.
- **Smart pointers** (`unique_ptr`, `shared_ptr`): ownership encoded in
  types; freeing is automatic (unique) or reference-counted (shared).
- **Ownership and borrowing** (Rust): the *compiler* statically tracks
  ownership and lifetimes, inserting frees and *rejecting* use-after-
  free at compile time — memory safety with no GC. (This is a major
  compiler responsibility — the borrow checker.)

Rust's approach is notable: it moves memory management into the
**compiler's static analysis**, getting safety *and* zero runtime
overhead — the best of both, at the cost of a stricter language.

## 3. Automatic memory management: garbage collection

The alternative: a **garbage collector** (GC) automatically reclaims
memory the program can no longer reach. The programmer just allocates;
the GC frees. Used by Java, C#, Go, Python, JavaScript, Lisp (which
*invented* GC in 1959). The trade: convenience and safety (no
use-after-free) for runtime overhead and (sometimes) pauses.

The core question a GC answers: **which objects are still reachable?**
An object is **live** (must keep) if reachable from the **roots** — the
stack, registers, and globals — by following pointers. Unreachable
objects are **garbage** and can be reclaimed. GC algorithms differ in
*how* they find and reclaim garbage.

## 4. Reference counting

The simplest GC: each object has a **count** of references to it.
Incremented when a reference is created, decremented when one is
dropped; when the count hits zero, the object is freed (and its
references decremented, possibly cascading).

```
x = new Object()    // Object's refcount = 1
y = x               // refcount = 2
y = null            // refcount = 1
x = null            // refcount = 0 → free it
```

- **Pros**: simple, immediate reclamation (freed as soon as
  unreferenced), no pauses, predictable.
- **Cons**: **cycles** — two objects referencing each other keep each
  other's count above zero forever (a leak), even when unreachable.
  Also, refcount updates have overhead (every reference assignment).

Python and Swift use reference counting (Python adds a cycle collector;
Swift requires programmers to break cycles with `weak` references). The
cycle problem is reference counting's fundamental weakness.

## 5. Tracing garbage collection: mark-and-sweep

The dominant GC family **traces** reachability from the roots:

**Mark-and-sweep**:
1. **Mark**: starting from the roots (stack, globals, registers),
   traverse all reachable objects, marking each as live.
2. **Sweep**: scan the whole heap; reclaim every *unmarked* object
   (it's garbage).

```
mark phase:   roots → follow all pointers → mark everything reachable
sweep phase:  for each heap object: if not marked, free it; else unmark
```

Tracing handles cycles correctly (a cycle unreachable from roots is
never marked, so it's swept). The cost: the collection **pauses** the
program (the "stop-the-world" pause) while marking/sweeping, and it must
scan the heap. Mark-and-sweep is the classic tracing GC.

> :nerdygoose: The deep difference: reference counting asks "is this
> object referenced?" (local, immediate, misses cycles); tracing asks
> "is this object *reachable from the roots*?" (global, periodic,
> handles cycles). Reachability is the *correct* notion of "still
> needed" — an object referenced only by other garbage is itself
> garbage, which only tracing catches. This is why production GCs
> (Java, Go, .NET) are tracing collectors; reference counting alone
> can't handle cycles.

## 6. Copying and generational collection

Refinements make tracing GC fast:

**Copying collection**: divide the heap in two halves. Allocate in one;
when full, **copy** all live objects to the other half (compacting them
together), then swap. Reclaims all garbage at once (the abandoned half),
compacts memory (no fragmentation), and allocation becomes a trivial
pointer bump. Cost: uses half the heap, copies live objects.

**Generational collection**: based on the **generational hypothesis** —
*most objects die young*. Divide objects into generations (young, old);
collect the young generation frequently (it's small and mostly garbage,
so fast) and the old generation rarely. Most collections are quick young
-generation passes; full collections are infrequent. This is the basis
of modern high-performance GCs (Java's G1/ZGC, Go's, .NET's).

> :surprisedgoose: The generational hypothesis — "most objects die
> young" — is empirically true across almost all programs: temporary
> objects (loop variables, intermediate results) vastly outnumber
> long-lived ones. Generational GC exploits this to make the common
> case (collecting short-lived garbage) cheap, only occasionally paying
> for a full collection. It's a beautiful case of an algorithm shaped
> by an empirical regularity about how programs actually behave.

## 7. The compiler's role in GC

GC isn't just a runtime concern — the **compiler must cooperate**:

- **Identify roots**: the GC needs to know which stack slots and
  registers hold pointers (the roots). The compiler emits **stack
  maps** describing, at each potential GC point, where the live
  pointers are.
- **Object layout**: the compiler lays out objects so the GC can find
  the pointers *within* them (e.g., a header describing the object's
  type and pointer fields).
- **GC safepoints**: the compiler inserts points where the program can
  safely be paused for GC (it can't pause mid-instruction with
  registers in an inconsistent state).
- **Write barriers**: for generational GC, the compiler emits **write
  barriers** — small code on pointer writes that records old→young
  references, so the young-gen collection knows about them.

So the compiler and GC are **co-designed**: the back end emits the
metadata (stack maps, object headers) and code (safepoints, write
barriers) the collector relies on. You can't bolt a precise GC onto a
compiler that doesn't cooperate.

## 8. Choosing a memory strategy

The memory-management landscape for a language:

- **Manual** (C): max control/performance, max danger. Compiler does
  little.
- **Ownership/borrowing** (Rust): compile-time safety, zero runtime
  overhead, stricter language. Heavy compiler analysis.
- **Reference counting** (Python, Swift): simple, immediate, predictable
  — but cycles leak. Modest compiler support.
- **Tracing GC** (Java, Go, C#, Lisp): convenient, safe, handles cycles
  — runtime overhead and pauses. Significant compiler cooperation
  (stack maps, safepoints, barriers).

For Goolang, the simplest choice is a basic mark-and-sweep GC (or, since
Goolang is small with only integers, you might not need heap allocation
at all). The point is understanding that memory management is a
**compiler + runtime co-design**, not a runtime afterthought.

> :weightliftinggoose: Memory management is where the compiler meets
> the runtime. Manual (C) puts it on the programmer; ownership (Rust)
> puts it in the compiler's static analysis; GC (Java/Go/Lisp) puts it
> in a runtime collector. Tracing GC (mark-sweep, copying, generational)
> handles cycles by computing reachability from roots — but needs the
> *compiler's* cooperation (stack maps, safepoints, write barriers,
> object layout). The compiler doesn't just generate code; it generates
> the metadata that lets the runtime manage memory.

## What we covered

- The heap holds dynamic allocations; **reclamation** is the hard part
  (leaks, use-after-free, double-free).
- **Manual** management (C `malloc`/`free`); refined by RAII, smart
  pointers, and Rust's **compile-time ownership/borrowing** (safety,
  zero overhead).
- **Garbage collection** reclaims unreachable memory automatically; the
  key question is **reachability from roots**.
- **Reference counting**: simple, immediate, but **cycles leak**.
- **Tracing** (mark-and-sweep): mark reachable from roots, sweep the
  rest — handles cycles, but pauses.
- **Copying** (compact, fast allocation) and **generational**
  (exploit "most objects die young") collection power modern GCs.
- The **compiler cooperates**: stack maps (find roots), object layout,
  safepoints, write barriers — GC is compiler + runtime co-design.

## What's next

[Chapter 21](/compiler/part-6-runtime/jit-compilation) — JIT
compilation. Compiling at *runtime*: interpreting first, then compiling
hot code to native on the fly, blending the portability of bytecode
with the speed of native code.
