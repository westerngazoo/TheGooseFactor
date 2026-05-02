---
sidebar_position: 1
sidebar_label: Introduction
title: "Algorithms & Big-O Analysis in Modern C (C23)"
slug: /
---

# Algorithms & Big-O Analysis in Modern C (C23)

> A working draft. Plain old C — but the *new* standard. Algorithms, data structures, and complexity analysis with nothing between you and the machine except an honest type system, an explicit allocator, and the latest language we've got.

## Why This Book Exists

Every algorithms textbook eventually picks a language, and most of them quietly pick a language that hides the cost. Python lists conceal reallocation. Java garbage collection conceals lifetimes. C++ `std::vector` conceals copies. You can learn the asymptotic story in any of them, but you cannot *see* the constants.

C is the opposite. There is no implicit anything. If you wrote a copy, the copy is in the source. If you wrote a `malloc`, you also wrote a `free`. The cost model that complexity theory describes — operations, comparisons, memory traffic — maps cleanly onto what the C compiler emits. Big-O is not a story you have to take on faith; it is a property of code you can read.

This book uses **C23** (ISO/IEC 9899:2024), the latest standard. We use it for a reason: C23 fixes a number of long-standing papercuts that made teaching modern C awkward. `bool` is finally a real keyword. `nullptr` exists. `static_assert` is built in. `[[nodiscard]]` and `[[fallthrough]]` are in the language, not vendor extensions. Empty parens `f()` finally mean "no arguments" instead of K&R "unspecified." None of this changes the fundamental cost model — but it removes the friction between writing readable algorithms and writing correct C.

## What's Inside

- **Part I — Foundations.** What an algorithm is, what Big-O actually means, the cost model of C, why a `malloc` is not a free lunch.
- **Part II — Sequences.** Arrays, dynamic arrays, linked lists, ring buffers — and an honest accounting of when each is the wrong answer.
- **Part III — Sorting.** Insertion, merge, quick, heap, radix — with measurements, not assertions.
- **Part IV — Searching & Hashing.** Linear, binary, hash tables (open addressing vs chaining), Bloom filters.
- **Part V — Trees & Graphs.** BSTs, AVL/red-black sketches, heaps, BFS/DFS, Dijkstra, union-find.
- **Part VI — Strings.** KMP, Boyer-Moore, suffix arrays, tries.
- **Part VII — Engineering.** Profiling, cache effects, branch prediction, when constants beat asymptotics.
- **Appendix — C23 Reference.** Every feature of the new standard you will actually use, with runnable examples.

Sections will appear as they are written. Status markers: `[ ] planned` · `[~] drafting` · `[✓] reviewed`.

## Ground Rules

1. **Every algorithm has a complexity claim.** Stated as $\Theta$ when tight, $O$ when not. Hand-waving is a bug.
2. **Every `malloc` has a `free` in the same chapter.** No leaks, even in pedagogical code.
3. **Every example compiles** under `gcc -std=c23 -Wall -Wextra -Werror -O2` (GCC 14+, Clang 18+).
4. **Measurement beats assertion.** When constant factors matter, we benchmark. When they don't, we say so explicitly.
5. **Undefined behavior is not a stylistic choice.** Signed overflow, strict aliasing, unsequenced modifications — we name them when we see them.

> :sarcasticgoose: "But C is unsafe!" Sure. So is a knife. The point of this book is to teach you to hold the knife correctly. If you wanted oven mitts, the C++ algorithms book is one shelf over.

## Prerequisites

You should be comfortable with:

- Basic C — declarations, pointers, arrays, structs, functions.
- A terminal with a recent `gcc` or `clang`.
- Reading mathematical notation at the level of $f(n) \leq c \cdot g(n)$.

You do **not** need:

- Prior algorithms coursework. We start from $\Theta$, $O$, and $\Omega$ definitions.
- C++ knowledge. This book is plain C — we do not use it as "C++ without the classes."
- A formal CS background. The proofs we use are direct, not heroic.

## How to Read

If you already know algorithms and just want the C23 angle — skim Part I, then dive into the appendix. If you've never seen Big-O — start at Chapter 1 and read in order; chapters are short and each builds on the last.

The book has a companion repository (TBD) with all source, a benchmark harness, and a CI matrix that compiles every example under both `gcc-14` and `clang-18`.

> :nerdygoose: A note on standards. The C23 final draft is N3096 (April 2023); ISO published it as IEC 9899:2024. GCC calls it `-std=c23` (or `-std=c2x` on older versions); Clang the same. We avoid features still marked "to be implemented" in either compiler — when a C23 feature is not yet portable, we say so and show the workaround.

> :weightliftinggoose: Treat each chapter like a training session. Read it, implement the algorithm from scratch (don't copy), measure it on your machine, then compare your numbers to the chapter's. The chapters that don't include measurements you do yourself are chapters you didn't actually finish.
