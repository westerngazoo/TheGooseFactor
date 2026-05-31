---
sidebar_position: 4
title: "Where to Go Next"
---

# Where to Go Next

> The send-off. The canonical books, the deeper topics we skipped, and
> how to keep growing as a Lisp programmer — plus a look back at what
> this course gave you.

You've reached the end of the *core* course. You understand Lisp from the
S-expression up through the metacircular evaluator. This chapter points
you onward: what to read, what to explore, and how to keep the
enlightenment going. (And if you want to go deeper *within* this course
first, two advanced parts await —
[Part VII — Advanced Control](/lisp/part-7-advanced-control/continuations)
and [Part VIII — CLOS](/lisp/part-8-clos/generic-functions) — covering
several of the "deeper topics" below in full.)

## 1. What you now know

Look back at the arc:

- **[Part I](/lisp/part-1-core-idea/why-lisp)**: the core — code as
  data, S-expressions, cons cells, the evaluation rules. The whole
  language's foundation.
- **[Part II](/lisp/part-2-functional/functions-and-lambda)**: the
  functional style — lambda, recursion, higher-order functions,
  closures. The ideas Lisp gave the world.
- **[Part III](/lisp/part-3-building-up/special-forms-vs-functions)**:
  the building blocks — special forms, binding, conditionals,
  iteration.
- **[Part IV](/lisp/part-4-macros/quote-quasiquote-unquote)**: macros —
  code that writes code, hygiene, DSLs. Lisp's signature power.
- **[Part V](/lisp/part-5-metacircular/eval-and-apply)**: the
  metacircular evaluator — a Lisp interpreter in Lisp. Computation,
  understood from the inside.
- **[Part VI](/lisp/part-6-practical/dialects)**: practical Lisp —
  dialects, the REPL, projects.

You can read and write idiomatic Lisp, think recursively and
functionally, write macros, and — crucially — you understand *how the
language works at the bottom*, because you built the evaluator. That
last understanding is rare and valuable.

## 2. The canonical books

The texts that go deeper:

**SICP — *Structure and Interpretation of Computer Programs***
(Abelson & Sussman). The legendary MIT text, in Scheme. This course
shares its spirit (especially [Part V](/lisp/part-5-metacircular/eval-and-apply)'s
metacircular evaluator, which is SICP Chapter 4). SICP goes far deeper:
streams, lazy evaluation, the register machine, a compiler. **Free
online.** If you do one thing next, work through SICP. It's a
programming-education landmark.

**On Lisp** (Paul Graham). The deep macro book. Everything about
macros, bottom-up design, and embedded languages, in Common Lisp.
Advanced and brilliant. **Free online (the author posted it).** Read
it after you're comfortable with basic macros
([Part IV](/lisp/part-4-macros/your-first-macro)).

**Practical Common Lisp** (Peter Seibel). The best practical CL intro —
builds real projects (a spam filter, an MP3 database, an HTML
generator). **Free online.** The pragmatic complement to SICP's
theory. Start here for Common Lisp specifically.

**The Little Schemer** (Friedman & Felleisen). A unique
question-and-answer book that teaches recursion and thinking
recursively through pure dialogue. Quirky, deep, and genuinely
re-wires your brain for recursion ([Chapter 6](/lisp/part-2-functional/recursion)).

**Clojure for the Brave and True** (Daniel Higginbotham) and
**Programming Clojure** — for the Clojure path. Brave and True is free
online and famously approachable.

> :nerdygoose: Notice how many of the canonical Lisp books are *free
> online* — SICP, On Lisp, Practical Common Lisp, Brave and True. The
> Lisp community has a strong tradition of open, freely-available
> deep texts. This isn't an accident; it reflects a culture that
> values understanding and sharing over gatekeeping. You can get a
> world-class Lisp education for $0.

## 3. Deeper topics — several now covered here

The core course stopped at the metacircular evaluator. Several of the
classic "next" topics now have full chapters in
[Part VII](/lisp/part-7-advanced-control/continuations) and
[Part VIII](/lisp/part-8-clos/generic-functions) of this course:

- **Continuations** (`call/cc`): first-class control flow — capture "the
  rest of the computation" as a value (coroutines, generators,
  backtracking). →
  [Chapter 25](/lisp/part-7-advanced-control/continuations).
- **The condition/restart system**: error handling that surpasses
  exceptions. →
  [Chapter 26](/lisp/part-7-advanced-control/condition-system).
- **Dynamic variables and `unwind-protect`**: ambient context and
  guaranteed cleanup. →
  [Chapter 27](/lisp/part-7-advanced-control/dynamic-variables).
- **Streams and lazy evaluation**: infinite data structures, computed on
  demand (SICP Ch 3). →
  [Chapter 28](/lisp/part-7-advanced-control/lazy-streams).
- **CLOS** — multiple dispatch, method combination, the metaobject
  protocol; arguably the most powerful object system in any language. →
  [Part VIII](/lisp/part-8-clos/generic-functions) (Chapters 29–32).

And beyond even this course:

- **Compilers**: SICP Chapter 5 builds a compiler; turning the
  *interpreter* you wrote ([Part V](/lisp/part-5-metacircular/eval-and-apply))
  into a *compiler* is the natural next step.
- **Logic programming** embedded in Lisp (miniKanren, the Reasoned
  Schemer).
- **Hygienic macros in depth** (`syntax-case`,
  [Chapter 15](/lisp/part-4-macros/macro-hygiene)).

Each is a rich area. Continuations and CLOS especially reward study —
they're features that, like macros, change how you think.

## 4. How to keep growing

Concrete next steps:

1. **Work through SICP** — the single best follow-up. Do the
   exercises. It will deepen everything in this course.
2. **Build real projects** ([Chapter 23](/lisp/part-6-practical/building-a-real-project))
   — a CLI tool, a small web service, a parser, a game. Nothing
   cements knowledge like shipping something.
3. **Write macros for real problems** — find boilerplate in your code
   and abstract it with a macro. Develop *taste* for when macros help
   ([Chapter 16](/lisp/part-4-macros/building-a-dsl)).
4. **Extend your interpreter** ([Part V](/lisp/part-5-metacircular/adding-special-forms))
   — add lazy evaluation, continuations, a type checker, a compiler.
   Owning an evaluator is a playground.
5. **Read others' Lisp** — study well-written libraries in your
   dialect. Idioms transfer by osmosis.
6. **Join the community** — Lisp communities (r/lisp, the Clojurians
   Slack, dialect mailing lists) are small, friendly, and deep.

## 5. What Lisp gave you (even if you never write it again)

Here's the [Chapter 1](/lisp/part-1-core-idea/why-lisp) promise,
delivered. Even if you go back to Python, Rust, or JavaScript, you
carry:

- **Recursive thinking** ([Chapter 6](/lisp/part-2-functional/recursion))
  — now a default tool, not a last resort.
- **Functional fluency** — map/filter/reduce
  ([Chapter 7](/lisp/part-2-functional/higher-order-functions)),
  closures ([Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope)),
  pure functions — which you'll use in every modern language.
- **Understanding of evaluation** — you know how interpreters work,
  what scope *really* is, why closures behave as they do
  ([Part V](/lisp/part-5-metacircular/the-environment-model)). This
  demystifies every language.
- **The "code is data" lens** — you see metaprogramming, macros, and
  AST manipulation clearly, wherever they appear (Rust macros, Python
  AST, Babel plugins, template metaprogramming).
- **Appreciation for simplicity** — Lisp's tiny core doing so much
  recalibrates your sense of what a language *needs* versus what it
  *accumulates*.

This transferable enlightenment is why people learn Lisp even when
they won't deploy it. You're a sharper programmer in every language
now.

## 6. A final word

Lisp is, in a real sense, the most distilled idea in programming: a
universal data structure (the list), one syntactic rule (the
S-expression), one evaluation model (eval/apply), and the power to
grow the language to meet any problem (macros). From 1958, it got
these right and barely had to change.

You now understand that distillation — not as trivia, but mechanically,
having built the evaluator yourself. That understanding is the
enlightenment Paul Graham described
([Chapter 1](/lisp/part-1-core-idea/why-lisp)): "it will make you a
better programmer for the rest of your days, even if you never actually
use Lisp much."

Go build something. Keep a REPL open
([Chapter 22](/lisp/part-6-practical/the-repl-workflow)). And when you
meet a problem that needs new syntax, remember — in Lisp, you can just
grow the language to fit.

> :weightliftinggoose: That's the course. You came in wondering about
> a language made of parentheses; you leave understanding computation
> from the S-expression to the evaluator, with macros and the
> functional style in your bones. The single best next move: open SICP
> and a REPL, side by side, and keep going. Lisp rewards the climb the
> whole way up. Welcome to the Goose Zone of programming languages —
> small, ancient, and somehow still ahead.

## What we covered

- A recap of the course arc: core → functional → building blocks →
  macros → metacircular evaluator → practical Lisp.
- The canonical books: **SICP** (do this next), **On Lisp** (macros),
  **Practical Common Lisp**, **The Little Schemer**, Clojure texts —
  many **free online**.
- Deeper topics: continuations, streams/laziness, CLOS, the condition
  system, compilers, logic programming, advanced hygiene.
- How to grow: work SICP, build projects, write real macros, extend
  your interpreter, read others' code, join the community.
- What Lisp gives you permanently: recursive thinking, functional
  fluency, understanding of evaluation/scope, the code-as-data lens,
  appreciation for simplicity.
- The final word: Lisp is programming distilled — and you now
  understand it from the inside.

## Where to go next

[Back to the course introduction](/lisp/) · [the roadmap](/lisp/table-of-contents)
· or onward to **SICP** and a REPL. The appendix has a
[cheat sheet](/lisp/appendix/cheat-sheet), a
[glossary](/lisp/appendix/glossary), and a
[further-reading & install guide](/lisp/appendix/further-reading).
