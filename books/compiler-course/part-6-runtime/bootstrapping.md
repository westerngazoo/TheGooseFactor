---
sidebar_position: 3
title: "Bootstrapping and Self-Hosting"
---

# Bootstrapping and Self-Hosting

> The final topic, and a rite of passage. Writing a compiler for a
> language *in that same language* — the chicken-and-egg of
> bootstrapping, and the deep satisfaction of a self-hosting compiler.

A **self-hosting** compiler is one written in the language it compiles:
a C compiler written in C, a Rust compiler written in Rust. It sounds
paradoxical — how do you compile the compiler before you have a
compiler? — and resolving that paradox (**bootstrapping**) is one of the
most satisfying ideas in compiler construction. This closes the course.

## 1. The self-hosting goal

A compiler is just a program. So a compiler *for* language L can be
*written in* language L. When it is, the language is **self-hosting** —
a sign of maturity (the language is good enough to build serious
software, including its own compiler). Most major languages are
self-hosting: GCC and Clang compile C/C++ and are written in C/C++; the
Rust compiler (`rustc`) is written in Rust; the Go compiler is written
in Go; TypeScript's compiler is written in TypeScript.

Self-hosting is a milestone: it means the language can express its own
implementation, and the compiler team uses (and stress-tests) the
language by building it.

## 2. The chicken-and-egg problem

But there's an obvious paradox: to compile the L-compiler (written in
L), you need an L-compiler. Which you're trying to build. Which needs an
L-compiler to compile. Circular!

```
To compile  rustc (written in Rust)  you need  a Rust compiler.
But rustc IS the Rust compiler you're building.  ← chicken and egg
```

This is the **bootstrapping problem**. Resolving it is the clever part:
you break the circle by starting from *outside* the language.

## 3. Breaking the circle: bootstrapping

The standard resolution, step by step:

1. **Write version 0 in another language.** Write a (possibly crude)
   compiler for L in some *existing* language M (say C, or Python). Now
   you can compile L programs — slowly, partially, but it works. Call
   this compiler `C0`, written in M.
2. **Write the real compiler in L.** Now write the proper L-compiler,
   *in L itself*. Call its source `compiler.L`.
3. **Compile it with version 0.** Use `C0` to compile `compiler.L` →
   producing `C1`, a compiler for L, now in native/executable form.
   `C1` was *written* in L but *compiled* by the M-based `C0`.
4. **Self-compile.** Now use `C1` to compile `compiler.L` again →
   producing `C2`. `C2` was both written in L *and* compiled by an
   L-compiler. The language is now self-hosting; `C0` (the M-based
   bootstrap) can be retired.

The trick: **the first compiler is written in another language**,
breaking the circularity. Once you have *any* working L-compiler (even
the crude `C0`), you can compile the real L-written compiler, and from
then on L compiles itself.

> :surprisedgoose: Resolving the chicken-and-egg is genuinely elegant:
> you don't need an egg if you start with a *different* bird. The first
> compiler comes from outside the language (written in M); after that,
> the language sustains itself. Every self-hosting language went through
> this — there was a first C compiler written in assembly (or B), a
> first Rust compiler written in OCaml (yes, really — early rustc was
> OCaml before it became self-hosting). The bootstrap ancestor is
> always in a *different* language.

## 4. The bootstrap test: compile yourself twice

A beautiful correctness check falls out of bootstrapping — the
**fixpoint test**:

- Compile `compiler.L` with `C1` → get `C2`.
- Compile `compiler.L` with `C2` → get `C3`.
- **`C2` and `C3` should be byte-for-byte identical.**

Why? Both `C2` and `C3` are produced by compiling the *same source*
(`compiler.L`); `C2` was compiled by `C1`, `C3` by `C2`. If `C1` and
`C2` are correct compilers, they produce the same output from the same
input — so `C2` and `C3` are identical. If they *differ*, there's a bug
(the compiler isn't deterministic, or `C1` and `C2` disagree). This
"compile yourself twice and compare" is a powerful, automatic compiler
test, used by GCC and others as a build-time sanity check.

## 5. The Ken Thompson hack (a famous aside)

Bootstrapping has a dark, brilliant corner: Ken Thompson's Turing-Award
lecture "Reflections on Trusting Trust" (1984). He observed that a
*malicious* self-hosting compiler could be made to:

1. Recognize when it's compiling a specific program (say, `login`) and
   insert a backdoor.
2. Recognize when it's compiling *itself* and insert the *backdoor-
   insertion code* into the new compiler.

Then you could remove the malicious code from the compiler's *source* —
but the compiled compiler would still propagate the backdoor, invisibly,
forever, because each generation re-inserts it when compiling the next.
The source looks clean; the binary is compromised. The unsettling
conclusion: you can't fully trust software you didn't build from a
trusted compiler — all the way down. It's a profound meditation on trust
and bootstrapping (and a reason "reproducible builds" and "diverse
double-compiling" matter).

> :nerdygoose: The Thompson hack is the deepest implication of
> self-hosting: trust in a compiler can't be established by reading its
> source alone, because the *compiler that compiled it* could have
> inserted invisible behavior that perpetuates itself. The defense
> ("diverse double-compiling," David A. Wheeler) uses a *second*,
> independent compiler to detect the discrepancy. It's a rare case
> where a compiler-construction detail becomes a foundational security
> and philosophy-of-trust problem. Read the four-page lecture; it'll
> change how you think about trusting software.

## 6. Why self-host?

Beyond the milestone, self-hosting has practical value:

- **Dogfooding**: the compiler team uses the language to build the
  language — they feel its pain points and fix them.
- **Stress test**: the compiler is a large, demanding program; if the
  language can build it, the language is robust.
- **No external dependency**: the language's implementation doesn't
  depend on another language's toolchain (once bootstrapped).
- **Proof of maturity**: self-hosting signals "this language is real."

The downside: you still need to *maintain* a bootstrap path (a way to
build the compiler from a known-good earlier version or another
language), which is real engineering work — you can't just lose all
existing binaries and all other compilers.

## 7. Cross-compilation and bootstrapping new targets

Related: **cross-compilation** — a compiler running on machine A that
produces code for machine B. This is how you bootstrap a compiler for a
*new* platform: cross-compile the compiler on an existing platform to
target the new one, then (once the new platform can run it) it becomes
self-hosting there. Cross-compilation breaks a platform chicken-and-egg
("how do I get the first compiler running on a brand-new CPU?") the same
way bootstrapping breaks the language one. New CPU architectures get
their compilers via cross-compilation from established ones.

## 8. The course, complete

Bootstrapping is a fitting end, because it makes the course
self-referential: you've learned to build the very kind of program
(a compiler) that could compile the language you'd build it in. Look
back at the arc:

- **[Part I](/compiler/part-1-foundations/what-is-a-compiler)**: the
  pipeline.
- **[Part II](/compiler/part-2-front-end/lexing)**: the front end (text
  → checked tree).
- **[Part III](/compiler/part-3-types-and-ir/type-checking)**: types and
  IR (tree → clean middle form).
- **[Part IV](/compiler/part-4-optimization/optimization-pipeline)**:
  optimization (making it fast).
- **[Part V](/compiler/part-5-back-end/instruction-selection)**: the
  back end (IR → machine code).
- **[Part VI](/compiler/part-6-runtime/garbage-collection)**: the
  runtime (GC, JIT) and self-hosting.

You can now take source code and turn it into running, optimized
machine code — and you understand every stage. The "complexity of
compiler design" dragon
([Chapter 1](/compiler/part-1-foundations/what-is-a-compiler)) is slain,
one comprehensible stage at a time. Go build a compiler — and maybe,
eventually, one that compiles itself.

That's the core pipeline. If you want to go deeper, two advanced parts
await: [Part VII — Compiling Real Language Features](/compiler/part-7-language-features/closures)
(closures, ADTs/pattern matching, exceptions, modules/linking) and
[Part VIII — Advanced Type Systems & Analysis](/compiler/part-8-types-and-analysis/type-inference)
(type inference, generics, borrow checking, and the limits of static
analysis) — the features and frontier beyond the basic pipeline.

> :weightliftinggoose: Self-hosting is the compiler-builder's
> black belt: a compiler for a language, written in that language. The
> chicken-and-egg is broken by **bootstrapping** — write version 0 in
> another language, use it to compile the real (self-written) compiler,
> then self-compile from there. The "compile yourself twice and
> compare" fixpoint test verifies correctness. And the Thompson hack
> warns that trust must go all the way down. You've built the whole
> pipeline; bootstrapping is the idea that makes a language stand on its
> own. Course complete.

## What we covered

- **Self-hosting**: a compiler written in the language it compiles
  (GCC, rustc, Go, TypeScript) — a maturity milestone.
- The **chicken-and-egg**: you need an L-compiler to compile the
  L-written L-compiler.
- **Bootstrapping** breaks it: write v0 in another language M; use it to
  compile the real (L-written) compiler; then self-compile. The
  ancestor is always in a *different* language.
- The **fixpoint test**: compiling the compiler with two successive
  generations should yield byte-identical binaries — an automatic
  correctness check.
- The **Ken Thompson hack** ("Trusting Trust"): a self-hosting compiler
  can propagate an invisible backdoor not present in its source — trust
  must go all the way down.
- Why self-host: dogfooding, stress test, no external dependency, proof
  of maturity.
- **Cross-compilation** bootstraps compilers for new platforms.
- The course is complete: you can turn source into optimized machine
  code and understand every stage.

## What's next

That's the core pipeline. From here, go deeper with the advanced parts —
[Part VII — Compiling Real Language Features](/compiler/part-7-language-features/closures)
(closures, ADTs/pattern matching, exceptions and continuations,
modules/linking) and
[Part VIII — Advanced Type Systems & Analysis](/compiler/part-8-types-and-analysis/type-inference)
(type inference, generics, ownership/borrow checking, static analysis and
its limits). Or jump to the [Appendix](/compiler/appendix/toolchain) for a
toolchain guide, a glossary, and further reading — real compiler
codebases, the canonical books, and the projects worth building next.
