---
sidebar_position: 2
title: "Appendix B — Glossary"
---

# Appendix B — Glossary

Quick definitions of the terms used throughout the course.

## Core concepts

**Atom** — anything that isn't a list: numbers, strings, characters,
booleans, and symbols.

**Binding** — an association between a symbol (name) and a value;
introduced by `define`, `let`, or function parameters.

**car** — the first slot of a cons cell; the first element of a list.

**cdr** — the second slot of a cons cell; the rest of a list
(pronounced "could-er").

**Closure** — a function bundled with the captured bindings of the
variables it references from its enclosing scope; "remembers" its
birthplace's variables.

**cons cell** — the two-slot building block of Lisp data (`car` and
`cdr` slots); lists are chains of cons cells.

**Environment** — the data structure mapping symbols to values;
modeled as a chain of frames searched inner-to-outer.

**Evaluation** — turning an S-expression into a value, per the rules
(self-evaluating / lookup / function call / special form).

**Homoiconicity** — "same representation": code and data share one
structure (the list), enabling macros and metaprogramming.

**Lexical scope** — a variable refers to the binding in its textually
enclosing definition (not the call site); the default in modern Lisps.

**List** — a chain of cons cells ending in the empty list `()`; the
central Lisp data structure.

**Macro** — a function (run at expansion time) that takes unevaluated
code and returns new code; extends the language's syntax.

**Predicate** — a function returning true/false; by convention named
with a `?` suffix (`null?`, `even?`).

**REPL** — Read-Eval-Print-Loop: the interactive Lisp prompt and the
primary development environment.

**S-expression** — symbolic expression: an atom or a parenthesized
list of S-expressions; Lisp's universal syntactic form.

**Special form** — an operator that doesn't follow the
"evaluate-all-arguments" rule (e.g., `if`, `quote`, `lambda`); controls
evaluation of its arguments.

**Symbol** — an interned name (like `foo`, `+`); a first-class value
used for variables, function names, and tags.

## Functions and recursion

**First-class** — describes values that can be stored, passed, and
returned; in Lisp, functions are first-class.

**Higher-order function (HOF)** — a function that takes and/or returns
functions; e.g., `map`, `filter`, `reduce`.

**lambda** — the special form that builds an anonymous function; from
Church's lambda calculus.

**Pure function** — a function with no side effects, depending only on
its arguments; predictable and composable.

**Recursion** — a function defined in terms of itself, with a base case
and a recursive case.

**Tail call / tail position** — a call that is the last operation a
function performs; tail calls can run in constant stack space (TCO).

**Tail-call optimization (TCO)** — reusing the stack frame for a tail
call, so tail recursion runs as a loop; guaranteed in Scheme.

## Quoting and macros

**Quasiquote** (`` ` ``) — a code template: literal structure with
evaluatable holes.

**Quote** (`'`) — returns its argument unevaluated, as data.

**Unquote** (`,`) — inside a quasiquote, evaluate this part and insert
the result.

**Unquote-splicing** (`,@`) — inside a quasiquote, splice a list's
elements into the surrounding list.

**Variable capture** — a macro's introduced variable accidentally
colliding with a user's same-named variable; the classic macro bug.

**Hygiene / hygienic macro** — a macro system that automatically
prevents variable capture (Scheme `syntax-rules`).

**gensym** — generates a fresh, unique symbol; used to avoid variable
capture in unhygienic macro systems.

**DSL (domain-specific language)** — a small language tailored to a
domain, built in Lisp with macros (no separate parser needed).

## The evaluator

**apply** — takes a procedure and evaluated arguments, runs the
procedure; calls `eval` on the body.

**eval** — takes an expression and environment, returns a value;
dispatches on expression type; calls `apply` for function calls.

**Metacircular evaluator** — an interpreter for Lisp written in Lisp;
the climax of a Lisp education.

**Primitive procedure** — a built-in function (`+`, `car`, ...) that
bottoms out the interpreter's recursion.

**Frame** — one set of bindings in an environment; environments are
chains of frames.

## Dialects

**Common Lisp** — the large, powerful, stable ANSI-standard Lisp;
Lisp-2; `defmacro`; CLOS. Implementation: SBCL.

**Scheme** — the minimal, clean Lisp; Lisp-1; lexical scope, guaranteed
TCO, hygienic macros. Implementations: Racket, Chez.

**Clojure** — the modern, immutable-by-default, JVM/JS-hosted Lisp;
Lisp-1; rich data literals. The most commercially used Lisp.

**Lisp-1 / Lisp-2** — a Lisp-1 has one namespace for functions and
variables (Scheme, Clojure); a Lisp-2 has separate namespaces (Common
Lisp).

**CLOS** — the Common Lisp Object System; a powerful OOP system with
multiple dispatch and a meta-object protocol.

**Condition system** — Common Lisp's error-handling system with
restarts; allows fixing and resuming from errors without unwinding.

**Continuation** — a first-class value representing "the rest of the
computation"; captured with `call/cc` in Scheme (an advanced topic).
