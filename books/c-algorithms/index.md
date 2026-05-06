---
sidebar_position: 1
sidebar_label: Introduction
title: "C: Algorithms & Data Structures (Academic Edition)"
slug: /
---

# C: Algorithms & Data Structures

> An academic, Knuth-flavored treatment of classical algorithms and data
> structures using C — the language of the abstract machine. For students
> who want depth, for engineers preparing for serious interviews, and for
> anyone who believes the right way to learn this material is to write it
> by hand from first principles.

## Why C?

Because the *abstract machine* of C is the abstract machine of computation
that 90% of working systems are written against. The kernel is C. The
runtime under your favorite higher-level language is C. The standard
libraries you depend on were almost certainly tested by C engineers
running ASan and UBSan.

If you understand how a `qsort` is implemented in C — pointers, memory,
the comparator interface, cache-friendly partitioning — you understand
how it works in any language. You also understand *why* it works there.

> :nerdygoose: Higher-level languages give you sorting for free. C makes
> you pay for it. The price you pay is the understanding you keep.

## Why Now?

Three audiences:

1. **The student** preparing to take an algorithms class. The textbooks
   (CLRS, Sedgewick, Knuth) assume you can read pseudocode and translate
   it to a language. This book is the translation, line by line, with
   the C invariants made explicit.
2. **The interviewer-bound engineer** — Amazon, Google, embedded shops.
   Whiteboard problems and language-agnostic systems work both reward
   the C-level mental model. Knowing the difference between an
   `O(n)`-amortized vector and an `O(n)` worst-case linked list isn't a
   bonus, it's the table stakes.
3. **The autodidact** who wants to follow the path Knuth laid down.
   *The Art of Computer Programming* is the canonical reference. This
   book is its working companion: Knuth in C, exercises included, ready
   for `gcc -std=c17 -Wall -Wextra -Wpedantic`.

## What You Need

- A C compiler (clang ≥ 14 or gcc ≥ 11) and `make`.
- A debugger (`gdb` or `lldb`) — used in every chapter from Part II
  onward.
- AddressSanitizer + UndefinedBehaviorSanitizer turned on for every
  build (`-fsanitize=address,undefined`). Non-negotiable in this book.
- A copy of CLRS or Sedgewick on the desk for cross-reference. We
  cite them frequently.
- A notebook. The exercises ask for proofs.

## What This Is Not

- Not a C language tutorial. We assume you can read C. If you can't,
  read K&R first; it's a small book.
- Not a survey of every algorithm ever invented. We pick the ones that
  matter and we go deep.
- Not a guide to *modern* C++ idioms. This is C. Pointers, structs,
  manual memory, the preprocessor in moderation, and `restrict` when
  it earns its keep.

## How To Read This

Each chapter follows a deliberate four-act structure:

1. **The Problem** — what we're solving and why it's hard.
2. **The Algorithm** — pseudocode, then C, then a worked example.
3. **The Analysis** — correctness proof, asymptotic bound, and where
   the constant factor hides.
4. **The Exercises** — Knuth-numbered, by difficulty (★ easy, ★★
   moderate, ★★★ hard, ★★★★ research). Solutions in
   [Appendix D](/c-book/appendix/exercise-solutions).

Code is in `code/` directories shipped with each chapter. Build with
`make`, run with `./out/<name>`, profile with `perf`.

> :weightliftinggoose: This book trains the algorithmic muscle. Theory
> alone won't make you fast on a whiteboard. Code alone won't survive
> a senior interviewer's "prove this terminates." Both together is the
> work.

## Roadmap

The full chapter list lives in
[Table of Contents](/c-book/table-of-contents). Briefly:

- **Part I — Foundations.** The C abstract machine, asymptotic
  notation, loop invariants, amortized analysis.
- **Part II — Data Structures.** Arrays, lists, hash tables, balanced
  trees, heaps, tries, disjoint sets, skip lists.
- **Part III — Algorithms.** Sorting, searching, graphs, strings,
  dynamic programming, divide-and-conquer.
- **Part IV — Numerical & Mathematical.** Number theory,
  combinatorics, probability, hashing theory.
- **Part V — Practice.** Interview-grade problems and cache-conscious
  refinements.

## Status

Living manuscript. Chapters land as they're written. Open issues on
[GitHub](https://github.com/westerngazoo/TheGooseFactor) for typos,
factual errors, or topics you'd like to see added.

> :sharpgoose: If a chapter cites a result without a proof, the proof
> is an exercise. If an exercise looks easy, you're missing something.
> If an exercise looks impossible, it's marked ★★★★ and you're in good
> company.
