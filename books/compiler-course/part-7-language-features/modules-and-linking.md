---
sidebar_position: 4
title: "Modules, Separate Compilation, and Linking"
---

# Modules, Separate Compilation, and Linking

> Real programs aren't one file, and you don't recompile everything on
> every change. **Separate compilation** turns each unit into an **object
> file** with unresolved references; the **linker** stitches them into one
> executable by resolving **symbols** and patching addresses
> (**relocation**). This chapter covers the machinery between "compile a
> file" and "run a program."

The core course ([Parts I–VI](/compiler/table-of-contents)) compiled a
program as if it were one self-contained thing. Real software is dozens or
millions of files, plus libraries, built incrementally. This chapter
covers how the compiler and the **linker** cooperate to turn many
separately-compiled pieces into one runnable program — the stage after the
back end that most courses skip.

## 1. Why separate compilation

Compiling an entire large program from scratch on every edit would be
unbearable. **Separate compilation** lets each **compilation unit** (a
file, roughly) be compiled **independently** into an **object file**, and
only the changed units recompiled:

```
main.go ─┐                ┌─ main.o ─┐
util.go ─┼─ compile each ─┼─ util.o ─┼─ LINK → executable
math.go ─┘                └─ math.o ─┘
```

Edit `util.go`, recompile only `util.o`, relink. This is why builds are
incremental and why the unit boundary matters. The catch: a unit being
compiled *references things defined in other units* (a call to a function
in `math.go`) — and at compile time, their addresses aren't known yet. The
compiler leaves those references **unresolved**, as named placeholders, for
the linker to fill in.

## 2. Object files and symbols

An **object file** is the compiler's output for one unit: machine code and
data, plus a **symbol table** recording what the unit **defines** and what
it **needs**:

- **Defined symbols** (exports): names this unit provides — `math_sqrt`,
  the global `config`. Each maps to an offset in the unit's code/data.
- **Undefined symbols** (imports): names this unit *uses* but doesn't
  define — `printf`, `util_log`. These are the holes the linker must fill.
- **Relocations**: a list of "patch sites" — places in the code/data where
  an address must be filled in once it's known.

A **symbol** is just a *name with linkage* — the unit of cross-unit
reference. The compiler's job ends at "emit code with named holes and a
list of what fills them"; the linker's job is to match holes to
definitions.

## 3. Name mangling

Symbols are names, but source-level names aren't unique enough to be
symbols directly. Two functions named `area` in different
namespaces/types, or an overloaded `add(int)` vs `add(float)`, would
collide. So compilers perform **name mangling**: encode the full
identity — namespace, types, arity — into the symbol name:

```
C++  void Shape::area()        →  _ZN5Shape4areaEv
Rust core::option::Option::map  →  _ZN4core6option6Option3map17h...E
```

The mangled name is unique and carries enough info to distinguish overloads
and generic instantiations. (C, by contrast, barely mangles — which is why
C is the *lingua franca* for cross-language linking: its symbol names are
predictable, so other languages declare `extern "C"` to match.) Mangling
is the bridge between rich source-level identity and the flat, string-keyed
world of the linker.

## 4. The linker: resolution and relocation

The **linker** combines object files (and libraries) into one executable
in two core steps:

1. **Symbol resolution**: for every *undefined* symbol, find the object
   file (or library) that *defines* it, and match them. Fail if a symbol is
   undefined everywhere (*"undefined reference to `foo`"*) or defined twice
   (*"duplicate symbol"*) — the two most familiar linker errors.
2. **Relocation**: now that every symbol has a final address (the linker
   has laid out all the code and data in the executable's address space),
   **patch every relocation site** — fill each named hole with the actual
   address.

```
main.o: call <util_log>   ← undefined, relocation here
util.o: util_log defined at offset 0x40
LINK:   place util.o's code at 0x1140 → util_log lives at 0x1180
        patch main.o's call site with 0x1180
```

That's linking in essence: **match names to definitions, then fill in
addresses.** The output is an **executable** — code and data laid out, all
references resolved, ready to load and run.

> :nerdygoose: The linker is the most underappreciated tool in the
> toolchain — a whole second compiler-like program most developers never
> think about until they hit "undefined reference to `foo`." Its job is
> humble and crucial: the compiler can't know where `printf` will live
> because it compiles your file in isolation, so it emits a *named hole*
> and a promise; the linker, seeing the whole program at once, *keeps the
> promise* by finding `printf` and patching the address. Separate
> compilation is only possible because the compiler is allowed to say "I
> don't know this address yet — linker, you figure it out." Nearly every
> cryptic build error you've cursed lives in this handoff.

## 5. Static vs dynamic linking

Libraries can be linked two ways, a fundamental trade-off:

- **Static linking**: the library's code is *copied into* the executable at
  link time. The program is self-contained (no runtime dependency), but
  larger, and every program duplicates the library (more disk, more memory,
  and a library bug-fix requires relinking every program).
- **Dynamic linking**: the executable records that it *needs* a **shared
  library** (`.so`/`.dll`/`.dylib`); the actual code is loaded at **run
  time** by the **loader**, and shared across all programs using it.
  Smaller executables, one copy in memory, library updates apply
  everywhere — but a runtime dependency ("DLL hell," version skew).

Dynamic linking adds a runtime indirection layer: calls into a shared
library go through a **PLT** (procedure linkage table) and **GOT** (global
offset table), which the loader fills in — possibly **lazily**, resolving
each function's address on first call. This is also where
**position-independent code** (PIC) comes from: shared-library code must
run at any address, so it references globals indirectly through the GOT.

## 6. The loader and program startup

The **loader** (part of the OS) turns an executable file into a running
process:

1. **Map** the executable's code and data segments into memory (often via
   memory-mapping the file).
2. For a dynamic executable, **load the shared libraries** it needs
   (recursively — they have dependencies too).
3. **Resolve and relocate** dynamic symbols (fill the GOT) — eagerly, or
   lazily on first use.
4. Run startup code (initialize the runtime, [Part VI](/compiler/part-6-runtime/garbage-collection)),
   then jump to `main`.

So "running a program" is itself a small linking step performed at load
time. The line between compile-time linking and load-time linking is
exactly the static/dynamic choice (§5). Understanding the loader explains
startup cost, why dynamic programs start a hair slower, and what a
"shared library not found" error really means.

## 7. ABIs: the contract between compiled code

For separately-compiled (and cross-language) code to interoperate, both
sides must agree on low-level conventions — the **Application Binary
Interface (ABI)**:

- **Calling convention** ([Chapter 19](/compiler/part-5-back-end/targeting-real-machines)):
  how arguments are passed (which registers, stack order), how results
  return, who saves which registers, how the stack is aligned.
- **Data layout**: struct field offsets, padding, sizes, alignment,
  enum/tag representation.
- **Name mangling** scheme (§3), symbol visibility, exception/unwind table
  format.

The ABI is the *contract* that lets code compiled by different compilers
(or different versions, or different languages) link and call each other.
It's why C is the universal interop layer (its ABI is stable and simple),
why "ABI breakage" is feared (a struct layout change silently corrupts
every caller compiled against the old layout), and why FFI
(foreign-function interface) is fundamentally an ABI-matching exercise.
The ABI is where your clean source-level types meet the brutal, fixed
reality of registers and byte offsets.

## 8. Crossing the boundary: link-time optimization

Separate compilation has a cost: the compiler optimizes each unit *in
isolation*, so it can't inline a function across the file boundary or
propagate constants between units — optimizations stop at the object-file
edge. **Link-time optimization (LTO)** recovers this: instead of emitting
final machine code per unit, the compiler emits its **IR**
([Chapter 9](/compiler/part-3-types-and-ir/intermediate-representation))
into the object files, and the **linker** (with the compiler's help) does
**whole-program optimization** — cross-unit inlining, dead-code
elimination across the program, devirtualization — *then* generates code.

LTO blurs the compile/link boundary: it gets the modularity of separate
compilation *and* (most of) the optimization of whole-program compilation,
at the cost of slower, more memory-hungry links. It's the answer to "I
split my code into files for sanity, but I don't want to pay for it in
speed" — and it's why this chapter, the "boring" linking stage, loops back
to Part IV's optimization. Modularity and optimization aren't enemies if
the linker is smart enough.

> :weightliftinggoose: The pipeline doesn't end at "emit machine code" —
> it ends at **link**. Lock in the model: each unit compiles to an
> **object file** with **defined** and **undefined** symbols (mangled
> names) plus **relocations**; the **linker** does **symbol resolution**
> (match names) and **relocation** (fill addresses). Know **static vs
> dynamic** linking (copied-in vs loaded-at-runtime via the **loader**,
> PLT/GOT) and that the **ABI** (calling convention + data layout +
> mangling) is the contract enabling separate and cross-language
> compilation. And remember **LTO** reclaims cross-unit optimization. Most
> "undefined reference" and "ABI" pain lives right here.

## What we covered

- **Separate compilation** compiles each **unit** to an **object file**
  independently, enabling incremental builds — leaving cross-unit
  references **unresolved**.
- An object file lists **defined** symbols (exports), **undefined**
  symbols (imports), and **relocations** (patch sites).
- **Name mangling** encodes namespace/types/arity into unique symbols;
  C's minimal mangling makes it the interop *lingua franca*.
- The **linker** does **symbol resolution** (match undefined to defined —
  "undefined/duplicate reference" errors) and **relocation** (fill final
  addresses).
- **Static linking** copies library code in (self-contained, larger);
  **dynamic linking** loads **shared libraries** at runtime via the
  **loader** and PLT/GOT (smaller, shared, but a runtime dependency).
- The **loader** maps segments, loads shared libs, resolves dynamic
  symbols, and starts the runtime before `main`.
- The **ABI** (calling convention, data layout, mangling) is the contract
  enabling separate and cross-language linking; ABI breakage is silent
  corruption.
- **LTO** emits IR into object files so the linker can do whole-program
  optimization — modularity *and* speed.

## What's next

That's Part VII — the features that make real languages real. [Part VIII](/compiler/part-8-types-and-analysis/type-inference)
goes deep on the **static-analysis frontier**: type inference (deduce types
with no annotations), generics and polymorphism, ownership and borrow
checking, and the theory and limits of static analysis itself.
