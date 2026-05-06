---
sidebar_position: 3
sidebar_label: "Writing Style"
title: "Writing Style Guide"
---

# Writing Style Guide

The style of this book is deliberate. If you're contributing or just
curious why it reads the way it does, here's the rubric.

## Voice

**Academic but human.** We write like a careful professor lecturing
to a sharp graduate student. We don't dumb things down, but we also
don't show off. Every formal definition is followed by an example.
Every example is followed by the reason we chose it.

**Goose personas** appear in the margins to say the things a textbook
won't:

> :nerdygoose: When the math gets hairy, I'll show up to make sure
> you're not just nodding along.

> :sharpgoose: When you're about to write a bug, I'll point at it
> first.

> :weightliftinggoose: When the chapter is asking you to do real
> work, I'll be the one in the background going "one more rep."

> :angrygoose: When the literature is wrong about something, I get
> the floor.

> :happygoose: When the algorithm is just *beautiful*, that's me.

> :mathgoose: When we're proving something rigorously.

> :surprisedgoose: When a result is genuinely counterintuitive.

> :sarcasticgoose: When a "simple optimization" makes things worse.

Use them sparingly. One per section is plenty.

## Structure

Every chapter follows the same four acts:

1. **The Problem.** State it formally. Give the input/output spec.
   Show why a naive approach is unacceptable.
2. **The Algorithm.** First in pseudocode (LaTeX-rendered).
   Then in C, with every invariant labeled. Then a worked example
   small enough to trace by hand.
3. **The Analysis.** Prove correctness via loop invariants or
   induction. State the asymptotic complexity formally
   (Θ-bound when known, otherwise O upper and Ω lower). Note the
   constant factor and where it hides.
4. **The Exercises.** Knuth-style — numbered, with difficulty
   stars, sometimes with hints. Solutions in Appendix D.

## Code

- **Standard:** C17 (`-std=c17`). C23 features only when called out.
- **Sanitizers:** every example must compile and run cleanly with
  `-fsanitize=address,undefined`.
- **Style:** allman braces, 4-space indent, no tabs. Lowercase
  snake_case. Macros in `SCREAMING_SNAKE_CASE`. Short function
  names when scope is local; descriptive names for public API.
- **No `goto`** outside the `goto cleanup;` idiom for error
  unwinding. We're not religious about it but we are picky.
- **`const`**-correctness everywhere. `restrict` when it's true.
- **Headers:** every public type and function in `.h`; static
  helpers in `.c` only.

## Math

LaTeX everywhere via `remark-math` + `rehype-katex`:

- Inline: `$O(n \log n)$` renders as $O(n \log n)$.
- Display: `$$T(n) = 2T(n/2) + \Theta(n)$$` for centered
  recurrences.
- We use $\Theta$ for tight bounds, $O$ for upper, $\Omega$ for
  lower. Small-o and small-omega when they're meaningful.
- Asymptotic notation is *defined* in
  [Chapter 3](/c-book/part-1-foundations/ch03-asymptotics) before
  use.

## Citations

Format: **Author Year, Volume:Page**. Examples:

- Knuth 1997, 1:73 → *TAOCP* Vol 1, page 73.
- CLRS 2022, §22.5 → *Introduction to Algorithms*, Section 22.5.
- Sedgewick 2011, p. 285.

Full bibliography in Appendix E.

## What We Don't Do

- We don't write "obvious" or "trivial" without proof. If a step
  is obvious, we still show it.
- We don't omit error handling in the main code listing. (Fragments
  used inline for explanation may abridge — flagged with
  `// ... error checks elided`.)
- We don't depend on platform-specific behavior without flagging
  it. (POSIX-only? Linux-only? GCC-only? Say so.)
- We don't use third-party libraries in chapter code. The whole
  point is building from primitives. The library chapters
  ([Ch 35](/c-book/part-5-practice)) are the exception.
