---
sidebar_position: 1
title: "Common Lisp vs Scheme vs Clojure"
---

# Common Lisp vs Scheme vs Clojure

> "Lisp" is a family. This chapter surveys the three living dialects
> that matter today, their philosophies and trade-offs, so you can
> pick one and start.

The course taught the *ideas* common to all Lisps, using
Scheme-flavored syntax. To write real code you pick a **dialect**. The
big three — Common Lisp, Scheme, Clojure — share the core (S-expressions,
macros, functions, lists) but differ in philosophy, ecosystem, and
details. This chapter helps you choose.

## 1. The shared core

First, what they *agree* on — everything this course taught:

- S-expressions and the read/eval model
  ([Part I](/lisp/part-1-core-idea/why-lisp)).
- Functions, `lambda`, recursion, closures, HOFs
  ([Part II](/lisp/part-2-functional/functions-and-lambda)).
- Special forms and macros
  ([Parts III–IV](/lisp/part-3-building-up/special-forms-vs-functions)).
- Code as data, the REPL, dynamic interactive development.

The concepts transfer completely. Learning one dialect, you can read
the others. The differences are dialect *details*, not different
languages.

## 2. Common Lisp — the industrial standard

**Common Lisp** (CL, standardized in ANSI 1994) is the big,
powerful, stable one. Designed to unify the warring Lisp dialects of
the 1980s, it's comprehensive and pragmatic.

**Strengths:**
- **Huge and complete**: a vast standard library, a powerful object
  system (CLOS), a condition/restart error system unmatched anywhere.
- **Powerful macros** (`defmacro`): unrestricted, procedural (manual
  hygiene via `gensym`, [Chapter 15](/lisp/part-4-macros/macro-hygiene)).
- **Fast**: mature compilers (SBCL) produce efficient native code.
- **Stable**: the standard hasn't changed since 1994; code from
  decades ago still runs.
- **Interactive**: the gold-standard REPL/image-based development
  (redefine functions in a running program).

**Trade-offs:**
- **Large**: lots to learn; the standard is a thick book.
- **Old conventions**: `nil` = `()` = false
  ([Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons)), separate
  function/value namespaces ("Lisp-2"), some dated naming.
- **Smaller modern ecosystem** than Clojure.

**Use it for:** serious applications wanting maximum power and
stability, AI (its historical home), and anyone who wants the full,
uncompromising Lisp. Implementation: **SBCL** (Steel Bank Common Lisp)
is the standard free choice.

> :nerdygoose: Common Lisp is a **Lisp-2**: functions and variables
> live in separate namespaces, so `(let ((list '(1 2 3))) (list 4 5))`
> works — the variable `list` and the function `list` don't collide.
> Scheme and Clojure are **Lisp-1** (one namespace; a variable named
> `list` shadows the function). This is a famous, almost theological
> divide in the Lisp world. Lisp-2 avoids some macro-hygiene issues;
> Lisp-1 is simpler. Neither is "right."

## 3. Scheme — the minimalist

**Scheme** (1975, Sussman & Steele; standardized as R5RS, R6RS, R7RS)
is the small, clean, elegant Lisp. Designed around a tiny core with
powerful general mechanisms.

**Strengths:**
- **Minimal and clean**: a small standard, orthogonal design, beloved
  in teaching (it's the language of SICP).
- **Lexical scope done right** ([Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope))
  — Scheme pioneered it.
- **Guaranteed tail-call optimization** ([Chapter 12](/lisp/part-3-building-up/tail-calls-and-iteration)).
- **Hygienic macros** (`syntax-rules`, [Chapter 15](/lisp/part-4-macros/macro-hygiene))
  — safe by default.
- **`#t`/`#f` distinct from `()`** ([Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons))
  — cleaner truth model.

**Trade-offs:**
- **Small standard**: less batteries-included; you rely on the
  implementation's extras (which vary).
- **Fragmented**: many implementations (Racket, Guile, Chez, ...) with
  different libraries.

**Use it for:** learning (this course's flavor), language research,
embedding, and anyone who values minimalism and elegance.
Implementation: **Racket** (a batteries-included Scheme descendant
with superb tooling, great for beginners) or **Chez Scheme** (fast,
production).

## 4. Clojure — the modern functional Lisp

**Clojure** (2007, Rich Hickey) is the newest of the three: a Lisp
hosted on the JVM (and JavaScript, via ClojureScript), with a strong
**functional and immutable** philosophy.

**Strengths:**
- **Immutable data structures** by default — a deliberate stance for
  safer concurrent programming.
- **Host interop**: full access to the JVM ecosystem (Java libraries)
  or JS (ClojureScript for the browser).
- **Modern, practical**: rich built-in data structures (vectors `[]`,
  maps `{}`, sets `#{}`), good concurrency primitives (atoms, agents,
  STM), the threading macros (`->`, `->>`).
- **Active ecosystem**: popular for backend web services and data
  engineering.

**Trade-offs:**
- **JVM startup/weight** (mitigated by GraalVM native images).
- **Departs from tradition**: more brackets (`[]`, `{}`), no full TCO
  (use `recur`, [Chapter 12](/lisp/part-3-building-up/tail-calls-and-iteration)),
  different from "classic" Lisp in feel.
- **Hosted**: tied to the JVM/JS platform (a strength and a
  constraint).

**Use it for:** production backend systems, data processing, anyone
who wants a Lisp with a modern ecosystem and immutability built in.
It's the most *commercially* used Lisp today.

> :surprisedgoose: Clojure made Lisp *commercially mainstream* again.
> It's used at scale (Walmart, Netflix, banks) for real production
> systems. Its bet — immutability + host interop + functional purity —
> turned out to resonate with the post-2010 industry's concurrency and
> data-engineering needs. If you want to be *paid* to write a Lisp,
> Clojure is the most likely path. It proved Lisp ideas weren't just
> academic.

## 5. A side-by-side taste

The same idea — square the even numbers in a list — across the three:

```lisp
;; Common Lisp
(remove-if-not #'evenp (mapcar (lambda (x) (* x x)) '(1 2 3 4 5 6)))
;; or with loop:
(loop for x in '(1 2 3 4 5 6) when (evenp x) collect (* x x))

;; Scheme
(map (lambda (x) (* x x)) (filter even? '(1 2 3 4 5 6)))

;; Clojure (threading macro reads left-to-right)
(->> [1 2 3 4 5 6] (filter even?) (map #(* % %)))
```

All recognizably Lisp; all use the same map/filter ideas
([Chapter 7](/lisp/part-2-functional/higher-order-functions)). Note
Clojure's `[]` vectors, `#(...)` anonymous-function shorthand, and `->>`
threading. The dialects differ in surface and library, not in soul.

## 6. The key differences table

| | Common Lisp | Scheme | Clojure |
|---|---|---|---|
| Year | 1984/1994 | 1975 | 2007 |
| Size | Large | Minimal | Medium |
| Namespaces | Lisp-2 | Lisp-1 | Lisp-1 |
| Truth | `nil`=`()`=false | `#f` only | `false`+`nil` |
| TCO | Usually | **Guaranteed** | `recur` only |
| Macros | `defmacro` (manual) | `syntax-rules` (hygienic) | `defmacro` (mostly) |
| Mutability | Mutable default | Mutable default | **Immutable default** |
| Host | Native | Native | JVM / JS |
| Object system | CLOS (powerful) | Varies | Protocols/records |
| Best for | Power, stability, AI | Learning, research | Production, data |
| Top impl | SBCL | Racket, Chez | Clojure (JVM) |

## 7. Which should *you* pick?

Honest recommendations by goal:

- **To deepen your understanding / continue this course's style**:
  **Racket** (a Scheme). Best beginner tooling, the SICP tradition,
  matches what you learned here. Start here if unsure.
- **For maximum Lisp power and the classic experience**: **SBCL**
  (Common Lisp). The full, uncompromising Lisp; CLOS and the condition
  system are revelations.
- **To get a job / build production systems**: **Clojure**. The modern
  ecosystem, immutability, JVM interop, actual industry demand.

You can't go wrong — the concepts transfer. Many Lispers know all
three. Pick one, build something
([Chapter 23](/lisp/part-6-practical/building-a-real-project)), and the
others become easy.

> :weightliftinggoose: Don't agonize over the dialect choice — that's
> procrastination dressed as diligence. The 90% that matters (the
> ideas in this course) is identical across all three. Pick Racket if
> you're learning, Clojure if you want a job, SBCL if you want the
> classic power trip. Install it *today*
> ([Chapter 22](/lisp/part-6-practical/the-repl-workflow)), open the
> REPL, and write code. The dialect is the gym; the lifting is the
> same.

## What we covered

- "Lisp" is a family sharing a core (S-expressions, macros, functions,
  REPL); dialects differ in details, not soul.
- **Common Lisp**: large, powerful, stable, Lisp-2, `defmacro`, CLOS;
  for power and stability (SBCL).
- **Scheme**: minimal, clean, lexical scope + guaranteed TCO +
  hygienic macros, `#t`/`#f`; for learning and elegance (Racket,
  Chez).
- **Clojure**: modern, immutable-by-default, JVM/JS-hosted, rich data
  literals; for production and data (the JVM Clojure).
- Lisp-1 (Scheme, Clojure) vs Lisp-2 (CL) namespaces; truth-value and
  TCO differences.
- Recommendation: **Racket** to learn, **SBCL** for classic power,
  **Clojure** for jobs — but the ideas transfer, so just pick and
  build.

## What's next

[Chapter 22](/lisp/part-6-practical/the-repl-workflow) — the REPL
workflow. Installing a Lisp, and the interactive develop-at-the-prompt
style that makes Lisp programming uniquely fluid. Time to get hands on
a real prompt.
