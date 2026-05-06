---
sidebar_position: 3
sidebar_label: "Writing Style"
title: "Writing Style Guide"
---

# Writing Style Guide

This book trades formal rigor for **accessibility, intuition, and
didactic momentum**. We're not writing CLRS or Knuth. We're writing the
book that gets a smart undergrad — or a working engineer two weeks
before an Amazon onsite — from "I sort of know what Big-O means" to
"I can implement, debug, and reason about this on a whiteboard."

The standard for prose is: **could a focused reader who hasn't seen
this material before follow along without stopping?** If yes, ship it.
If no, add an analogy, a picture, or a goose.

## Voice

**Friendly, direct, opinionated.** We talk to the reader, not at them.
We write like a senior engineer explaining over coffee: precise enough
to be useful, casual enough to feel like a conversation.

**Informal first, formal in side notes.** When we introduce a new
concept, we describe it in everyday language. *Then*, if the formal
definition is useful, we drop it into a callout for readers who want
the precision. The main thread keeps moving.

> **Formal definition.** $f(n) \in O(g(n))$ iff there exist constants
> $c > 0$ and $n_0$ such that $0 \le f(n) \le c \cdot g(n)$ for all
> $n \ge n_0$.

That's the formal version. Use it sparingly. The intuition is what the
reader will remember six weeks later.

## Goose personas — accessibility tools, not jokes

Each persona has a teaching role. Use them to break long stretches of
prose, surface the question the reader is *probably* about to ask, or
flag where intuition might mislead.

> :happygoose: When the algorithm just clicks. "Oh, that's why it
> works!" moments.

> :nerdygoose: When the formal definition matters. The reader who
> wants the math version gets it here.

> :mathgoose: When we *do* dip into proof or derivation. Rare. Worth
> reading when it shows up.

> :sharpgoose: When you're about to make a common mistake. Off-by-one,
> integer overflow, the classic interview-blunder.

> :surprisedgoose: When the result is genuinely counterintuitive. (Why
> is hash table insertion *amortized* O(1) but worst-case O(n)?)

> :sarcasticgoose: When the "obvious" optimization is wrong, or when
> the textbook is being clever for no reason.

> :angrygoose: When the literature is misleading or the standard
> answer is wrong.

> :weightliftinggoose: When it's time to do the work. Practice
> exercises, code drills.

Use them sparingly. **At most one per major section.** If a chapter
has 12 personas, the personas stop being signposts and start being
clutter.

## Chapter structure

A flexible four-beat rhythm:

1. **Hook.** The problem in human terms. "You're at the DMV. There are
   100 people in line. How do you find the one named Jordan?"
2. **Idea.** The algorithm or data structure, described informally.
   Pictures, metaphors, small worked examples.
3. **Code.** Real C, with comments that read like prose. Each
   non-obvious line gets a one-sentence why.
4. **Practice.** A handful of exercises: implement, predict, debug,
   compare. Knuth-style difficulty stars are gone — we use plain
   labels: **Try it**, **Stretch**, **Deep dive** (optional).

We do *not* require proofs. We do require the reader can predict the
runtime and explain why the code is correct in their own words.

## Code

- **Standard:** C17. Compile with `gcc -std=c17 -Wall -Wextra` or
  clang equivalent.
- **Sanitizers** (`-fsanitize=address,undefined`) are still strongly
  encouraged in the build instructions but not a religion. We point
  them out the first time they catch a bug.
- **Style:** clear over clever. 4-space indent, snake_case, short
  function names when scope is local. Comments that explain *why*,
  never *what*.
- **Length:** code listings should fit on one screen. If a function
  is too long, refactor it for the book.

> :sharpgoose: Code that passes the compiler but fails ASan still
> *runs*. That's the dangerous case. We'll show several examples in
> Ch 1 and Ch 2 to build the habit of trusting the sanitizer over
> the absence of a crash.

## Math

LaTeX renders inline (`$O(n \log n)$`) and display-mode (`$$T(n) =
2T(n/2) + n$$`). Use it where it adds clarity, not as decoration.

- $\Theta$, $O$, $\Omega$ — we'll use all three but mostly $O$ in
  prose.
- Recurrence relations only when they're the cleanest way to say
  what's happening (merge sort, quicksort).
- Master theorem appears as a **recipe**, not a theorem. State the
  three cases plainly. The proof is in the appendix for anyone who
  wants it.

## Citations

Light. We cite when the reader benefits from going deeper:

- Knuth 1997, *TAOCP* Vol 1, §2.2 — for readers who want the formal
  treatment.
- CLRS, §22.5 — same.
- Sedgewick & Wayne, *Algorithms 4th ed* — when their pictorial
  approach is better than ours (which happens).

No bibliography. Citations link inline to the page on Amazon, the
Stanford CS page, or wherever the canonical source lives.

## What we don't do

- **No exhaustive proofs.** We sketch them when they aid intuition.
  The reader who wants every step goes to Knuth.
- **No formal definition before informal one.** Always intuition
  first, formalism second (and only if it earns its keep).
- **No greek-letter blizzards.** If a section starts collecting
  more than four distinct symbols, rewrite it with words.
- **No condescension.** The reader is smart. They just haven't seen
  this material yet.
- **No filler.** If a paragraph doesn't teach something specific,
  cut it.

## The test

Before publishing a chapter, read it out loud. If you find yourself
slipping into "academic monotone," rewrite. If a sentence makes you
want to skip ahead, your reader will too. The goose personas exist
to interrupt monotone — use them when the prose flatlines.
