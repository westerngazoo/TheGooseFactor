---
sidebar_position: 1
sidebar_label: Introduction
title: "The Lisp Course"
slug: /
---

# The Lisp Course

> The oldest idea in programming that's still ahead of its time. Lisp
> is **LIS**t **P**rocessing — a language where code *is* data, where
> the whole syntax is one rule, and where you build the language up to
> meet your problem instead of bending your problem to fit the
> language.

This is a course, not a reference. It builds Lisp from a single idea —
the **list** — and follows that idea all the way to macros, a
self-hosting interpreter, and a real project. By the end you'll
understand not just *how* to write Lisp, but *why* generations of
programmers call it the most enlightening language they ever learned.

## Why learn Lisp?

You may never ship production Common Lisp. So why spend the time?

- **It changes how you think.** Recursion, higher-order functions,
  code-as-data — Lisp teaches the ideas that later showed up
  everywhere (JavaScript closures, Python list comprehensions, Rust
  iterators, every functional feature in every modern language).
- **It's the smallest possible language.** The core is a handful of
  rules. You can hold the *entire* language in your head — and then
  watch it grow into anything.
- **Macros.** No other mainstream language lets you extend the
  *syntax* itself. Once you've written a macro, you see every other
  language's limitations differently.
- **The metacircular evaluator.** You will write a Lisp interpreter,
  in Lisp, in about a page. Understanding that page is understanding
  computation itself.

> :nerdygoose: Lisp was specified by John McCarthy in 1958 and first
> implemented by Steve Russell in 1960. It is the **second-oldest**
> high-level language still in use (after Fortran). And yet features
> the rest of the industry "discovered" decades later — garbage
> collection, first-class functions, dynamic typing, the REPL,
> conditionals as expressions — were all in Lisp from nearly the
> start. Learning Lisp is time travel in both directions.

## What this course assumes

- You can program in *some* language (variables, functions, loops).
- You're comfortable with a terminal.
- You're willing to think recursively. (We'll help.)

No prior functional-programming or Lisp experience is needed. We
start from `(+ 1 2)`.

## The shape of the course

Eight parts. The first six build the core language top to bottom; the
last two are advanced deep dives you can take once the core is solid:

- **Part I — The Core Idea.** S-expressions, atoms, lists, cons
  cells, and the evaluation rule. The entire syntax and semantics of
  Lisp, from scratch.
- **Part II — Functional Foundations.** Lambda, recursion,
  higher-order functions, closures. The functional style Lisp
  pioneered.
- **Part III — Building Up.** Special forms, binding, conditionals,
  iteration. The constructs you build programs from.
- **Part IV — Macros.** Code that writes code. Quote/quasiquote, your
  first macro, hygiene, and building a domain-specific language.
- **Part V — The Metacircular Evaluator.** `eval` and `apply`.
  Writing a Lisp interpreter in Lisp. The environment model. The
  deepest hour in the course.
- **Part VI — Practical Lisp.** Common Lisp vs Scheme vs Clojure, the
  REPL workflow, a real project, and where to go next.
- **Part VII — Advanced Control.** Continuations and `call/cc`, the
  condition system, dynamic variables, and lazy streams. The features
  that, like macros, change how you think about control flow.
- **Part VIII — CLOS.** The Common Lisp Object System: generic functions
  and multiple dispatch, classes and slots, method combination, and the
  Metaobject Protocol — arguably the most powerful object system in any
  language.

See the [Roadmap](/lisp/table-of-contents) for the full chapter list.

## A note on dialects

"Lisp" is a family, not one language. The big three today:

- **Common Lisp** — the industrial-strength standard. Big, powerful,
  stable.
- **Scheme** — the minimalist's Lisp. Clean, small, beloved in
  teaching (SICP).
- **Clojure** — the modern, JVM-hosted Lisp with a functional/immutable
  bent.

This course teaches the **ideas common to all of them**, using a
clean, Scheme-flavored syntax for examples. [Chapter 21](/lisp/part-6-practical/dialects)
covers the differences so you can pick one. The concepts transfer; the
parentheses are the same everywhere.

> :weightliftinggoose: Reading about Lisp is like reading about
> deadlifts. Install a Lisp (we recommend Racket or SBCL —
> [Chapter 22](/lisp/part-6-practical/the-repl-workflow) has setup),
> open the REPL, and type along. Every chapter has code you should
> *run*, not just read. Lisp is learned at the prompt.

## How to read it

Front to back, the first time — each part depends on the previous.
After that, jump around. Run every code example. Do the exercises
(scattered through the chapters). Build the interpreter in Part V
yourself before reading the solution.

Ready? [Part I, Chapter 1](/lisp/part-1-core-idea/why-lisp) starts
with the question: why does a 1958 language still matter?
