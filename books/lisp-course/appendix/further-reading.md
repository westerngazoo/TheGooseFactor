---
sidebar_position: 3
title: "Appendix C — Further Reading & Install Guide"
---

# Appendix C — Further Reading & Install Guide

Resources to go deeper, and the practical setup to get a Lisp running.

## Install guide

### Racket (recommended for beginners)

The gentlest start — a batteries-included Scheme with a built-in IDE.

1. Download from **racket-lang.org** (installers for all platforms).
2. Open **DrRacket** (ships with it).
3. Put `#lang racket` at the top of the editor, write code, hit **Run**,
   interact in the REPL pane below.

That's it — you have a REPL in two minutes. This course's
Scheme-flavored examples run in Racket (mostly as-is; Racket uses
`#t`/`#f`, `define`, `lambda`, etc.).

### SBCL (Common Lisp)

The standard free Common Lisp; fast, mature.

1. Install: `brew install sbcl` (macOS), `apt install sbcl` (Debian/
   Ubuntu), or download from **sbcl.org**.
2. Run `sbcl` for a bare REPL.
3. Install **Quicklisp** (the package manager) following
   quicklisp.org's instructions.
4. For the full experience, set up **Emacs + SLIME** or
   **VS Code + Alive**.

### Clojure

Modern, JVM-hosted.

1. Install Java (JDK 11+), then the Clojure CLI:
   `brew install clojure/tools/clojure` (macOS) or per clojure.org's
   guide.
2. Run `clj` for a REPL.
3. For editor integration: **VS Code + Calva** (approachable) or
   **Emacs + CIDER** (powerful).

## The canonical books

**SICP — *Structure and Interpretation of Computer Programs***
(Abelson & Sussman, MIT Press). The definitive deep text, in Scheme.
This course's [Part V](/lisp/part-5-metacircular/eval-and-apply) is its
Chapter 4. Goes much further: streams, lazy evaluation, register
machines, a compiler. **Free online** (mitpress.mit.edu/sites/default
and many mirrors). *Do this next.*

**On Lisp** (Paul Graham). The deep macro and bottom-up-design book, in
Common Lisp. Advanced, brilliant. **Free online** (paulgraham.com/
onlisp.html).

**Practical Common Lisp** (Peter Seibel). The best practical CL intro —
real projects throughout. **Free online** (gigamonkeys.com/book).

**The Little Schemer** (Friedman & Felleisen). Teaches recursion
through Socratic Q&A. Re-wires your brain for
[recursive thinking](/lisp/part-2-functional/recursion). (Followed by
*The Seasoned Schemer* and *The Reasoned Schemer*.)

**How to Design Programs** (Felleisen et al.). A systematic
program-design curriculum in Racket. **Free online** (htdp.org). Great
if you want structured exercises.

**Clojure for the Brave and True** (Daniel Higginbotham). Approachable,
funny Clojure intro. **Free online** (braveclojure.com).

**Paradigms of AI Programming (PAIP)** (Peter Norvig). Classic AI
programs built in Common Lisp; a masterclass in Lisp technique.

## Online resources

- **SICP video lectures** (Abelson & Sussman, MIT, 1986) — the
  original course lectures, freely available. A time capsule and still
  excellent.
- **The Scheme / Racket documentation** (docs.racket-lang.org) —
  thorough and well-organized.
- **Common Lisp HyperSpec** — the ANSI standard, online and
  searchable, the definitive CL reference.
- **ClojureDocs** (clojuredocs.org) — community-documented Clojure
  with examples.
- **bivector.net**, **r/lisp**, **r/Clojure**, the **Clojurians
  Slack** — community.

## Deeper topics to explore (post-course)

Beyond this course's core
([Chapter 24](/lisp/part-6-practical/where-to-go-next)):

- **Continuations** (`call/cc`) — first-class control flow. (SICP, The
  Seasoned Schemer.)
- **Streams & laziness** — infinite data on demand. (SICP Ch 3.)
- **CLOS** — Common Lisp's object system; *The Art of the
  Metaobject Protocol* (Kiczales et al.) for the deep version.
- **Building a compiler** — turn your interpreter into a compiler.
  (SICP Ch 5; "An Incremental Approach to Compiler Construction,"
  Ghuloum.)
- **Hygienic macros in depth** — `syntax-case`. (R6RS, "Fear of
  Macros" by Greg Hendershott for Racket.)
- **miniKanren** — logic programming embedded in Lisp. (*The Reasoned
  Schemer*.)

## A suggested path

If you want a structured continuation:

1. **Work through SICP** (with Racket or another Scheme), doing the
   exercises. The single best next step. Especially Chapter 4 — extend
   the metacircular evaluator you built in
   [Part V](/lisp/part-5-metacircular/eval-and-apply).
2. **Read *On Lisp*** for macro mastery once SICP's evaluator chapter
   is comfortable.
3. **Build a real project** ([Chapter 23](/lisp/part-6-practical/building-a-real-project))
   in your chosen dialect — ship something.
4. **Pick a deep topic** (continuations or CLOS) and go down the
   rabbit hole.

That path takes you from this course's foundations to genuine Lisp
fluency. Most of the materials are free; all of them are worth your
time.

> The whole point: keep a REPL open, keep building, and follow your
> curiosity down whichever rabbit hole opens. Lisp rewards depth at
> every level. — [Back to the course](/lisp/)
