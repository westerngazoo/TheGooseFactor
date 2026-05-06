---
sidebar_position: 1
sidebar_label: Introduction
title: "C: Algorithms & Data Structures (Academic Edition)"
slug: /
---

# C: Algorithms & Data Structures

> A friendly, intuition-first guide to the classical algorithms and data
> structures, written in C. For students taking their first algorithms
> class, engineers preparing for an Amazon-style interview, and anyone
> who wants to *get* this material — not just survive a quiz on it.

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

Each chapter follows a four-beat rhythm:

1. **Hook** — the problem in human terms (DMV lines, recipe scaling,
   the kind of thing you can describe without a whiteboard).
2. **Idea** — the algorithm or data structure, described informally
   first. Pictures, metaphors, small worked examples.
3. **Code** — real C with prose-style comments. Each non-obvious
   line gets a one-sentence why.
4. **Practice** — a handful of problems split into **Try it**
   (do these), **Stretch** (most readers should), and an optional
   **Deep dive** for the curious.

Goose personas pop in to surface the question you're probably about
to ask, flag a common bug, or call out the moment when the algorithm
just clicks. They're teaching aids, used sparingly.

> :weightliftinggoose: Reading without practicing is reading. Practicing
> without reading is fumbling. Do both — that's where the muscle gets
> built.

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

> :happygoose: The goal isn't to make you fluent in formal proof
> language. The goal is to make you the engineer who walks into an
> interview, hears "design a hash table," and *sees the picture* —
> the buckets, the load factor, the resize. Then writes the code.
