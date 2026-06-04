---
sidebar_position: 2
title: "Your First Macro"
---

# Your First Macro

> Code that writes code. A macro receives its arguments as
> *unevaluated code*, transforms that code, and returns *new code* to
> be evaluated in its place. This is the chapter where Lisp's
> superpower becomes concrete.

Everything has led here. You know code is data
([Chapter 1](/lisp/part-1-core-idea/why-lisp)), how evaluation works
([Chapter 4](/lisp/part-1-core-idea/evaluation)), the function/special-
form distinction ([Chapter 9](/lisp/part-3-building-up/special-forms-vs-functions)),
and how to build code with quasiquote
([Chapter 13](/lisp/part-4-macros/quote-quasiquote-unquote)). Now we
combine them: a **macro** is a user-defined operator that transforms
code at expansion time.

## 1. Macros vs functions: the key difference

Recall ([Chapter 9](/lisp/part-3-building-up/special-forms-vs-functions)):

- A **function** receives its arguments **already evaluated** (values).
- A **macro** receives its arguments **unevaluated** (as code — the
  literal S-expressions you wrote).

A macro then **transforms** that code into new code, and the new code
is what actually gets evaluated. The transformation happens at
**macro-expansion time** (before/during compilation), not at runtime.

```
(my-macro a b)
   │  macro receives the UNEVALUATED forms a and b
   ▼  macro returns new code (a list)
(... transformed code ...)
   │  THIS is what gets evaluated
   ▼
result
```

A function processes *values*; a macro processes *programs*.

## 2. Defining a macro

The syntax varies by dialect; we'll use the common `defmacro`-style
(Common Lisp) / `define-syntax` with templates (Scheme). The clearest
to start with is the procedural style: a macro is a function from code
to code.

Here's `unless` (do something if a condition is *false*) — even though
it's usually built in, building it shows the mechanism:

```lisp
(defmacro unless (condition body)
  `(if (not ,condition)
       ,body))
```

Read it: `unless` is a macro taking two *unevaluated* arguments,
`condition` and `body`. It returns the code `` `(if (not ,condition)
,body) `` — a quasiquoted template ([Chapter 13](/lisp/part-4-macros/quote-quasiquote-unquote))
with the two arguments spliced in. When you write:

```lisp
(unless (> x 10)
  (display "x is small"))
```

the macro *expands* it (before evaluation) into:

```lisp
(if (not (> x 10))
    (display "x is small"))
```

and *that* is evaluated. The macro rewrote your `unless` into an `if`.

## 3. Why this can't be a function

Crucially, `unless` *must* be a macro, not a function — for the same
reason `if` is a special form ([Chapter 9](/lisp/part-3-building-up/special-forms-vs-functions)).
If `unless` were a function, its `body` argument would be **evaluated
before** `unless` ran:

```lisp
(unless (> x 10)
  (launch-missiles))   ; if unless were a function, this runs ALWAYS
```

A function receives evaluated arguments, so `(launch-missiles)` would
fire regardless of the condition. As a macro, `unless` receives
`(launch-missiles)` as *unevaluated code* and places it inside an `if`,
so it only runs when the condition is false. **Macros control
evaluation** — that's their entire reason to exist.

> :surprisedgoose: This is the litmus test for "do I need a macro?":
> *do I need to control whether/when my arguments are evaluated, or to
> treat them as code rather than values?* If yes → macro. If you just
> need the values → function (functions are simpler; prefer them).
> Macros are for the cases functions fundamentally can't handle:
> custom control flow, binding constructs, embedded languages.

## 4. Macroexpand: seeing the transformation

Lisps provide a way to see what a macro expands to *without* running
it — usually `macroexpand` (or `macroexpand-1` for one step):

```lisp
(macroexpand-1 '(unless (> x 10) (display "small")))
; => (if (not (> x 10)) (display "small"))
```

This is your macro-debugging tool. When a macro misbehaves,
`macroexpand` shows you the generated code, so you can see exactly what
will be evaluated. *Always* `macroexpand` a macro you're developing —
it turns the invisible transformation visible.

## 5. A more useful macro: swap!

A macro that genuinely needs unevaluated arguments —
`swap!`, which exchanges the values of two variables:

```lisp
(defmacro swap! (a b)
  `(let ((tmp ,a))
     (set! ,a ,b)
     (set! ,b tmp)))
```

Usage:

```lisp
(define x 1)
(define y 2)
(swap! x y)
x  ; => 2
y  ; => 1
```

`(swap! x y)` expands to:

```lisp
(let ((tmp x))
  (set! x y)
  (set! y tmp))
```

This *must* be a macro: it needs the *variable names* `x` and `y`
(unevaluated) so it can `set!` them. A function would receive the
values `1` and `2` and have no way to assign back to the variables.
Macros that take "places" (assignable locations) — like `swap!`,
`incf`, `push` — are a classic macro use case. (And `swap!` has a
subtle bug involving `tmp` that we'll fix in
[Chapter 15](/lisp/part-4-macros/macro-hygiene) — hold that thought.)

## 6. Macros run at expansion time

A vital mental shift: macro code runs at a *different time* than
regular code.

- **Expansion time** (compile time): macros run, transforming code
  into other code. The macro's *own* logic (the quasiquote
  assembly) executes here.
- **Run time**: the *expanded* code runs, producing the actual result.

So a macro is a little program that runs *during compilation* to
generate the program that runs later. This is why macros can do things
functions can't — they operate on the program before it executes. It's
also why macro bugs can be confusing: they happen in a different phase.
`macroexpand` (§4) lets you inspect that phase.

> :nerdygoose: "Macros run at compile time" has a profound consequence:
> macro-generated code has **zero runtime overhead** beyond what the
> generated code itself costs. A macro that expands to a tight `if`
> compiles to exactly that `if` — no function-call indirection, no
> dispatch. This is why Lisp macros are used for performance-critical
> abstractions (you get the abstraction at compile time and the
> efficiency at runtime), unlike higher-order functions which have a
> call cost.

## 7. What macros are *for*

Macros aren't for everything — most code should be functions. Macros
shine for:

- **New control structures**: `unless`, `while`, `for`, custom loops,
  pattern matching — anything that controls evaluation order.
- **Binding forms**: `let`-like constructs that introduce variables.
- **Deferring/conditional evaluation**: short-circuiting, lazy
  arguments, `and`/`or`-style forms.
- **Eliminating boilerplate**: generate repetitive code from a concise
  spec.
- **Embedded domain-specific languages** (DSLs): a whole sub-language
  with its own syntax ([Chapter 16](/lisp/part-4-macros/building-a-dsl)).

The rule of thumb: **use a function if you can; use a macro only if you
must.** Functions are simpler, composable, and first-class (you can
pass them around — macros you can't). Reach for a macro only when you
need to control evaluation or treat arguments as code.

## 8. The whole idea, restated

A macro is a function — running at expansion time — from code to code.
It receives the unevaluated S-expressions you wrote (because code is
data), transforms them (usually via quasiquote templates), and returns
new S-expressions that get evaluated in place. This lets you extend the
language's *syntax* — adding constructs that feel built-in — without
touching the evaluator ([Chapter 9](/lisp/part-3-building-up/special-forms-vs-functions)'s
promise, delivered).

No other mainstream language gives you this so cleanly, and it's a
direct consequence of homoiconicity
([Chapter 1](/lisp/part-1-core-idea/why-lisp)): because code is just
lists, a macro is just a list transformer.

> :weightliftinggoose: Writing your first macro is a rite of passage.
> Start with `unless` or `swap!`, `macroexpand` them to *see* the
> generated code, and run them. Then try writing `my-when`, `my-and`
> (two-argument), or an `inc!` that adds 1 to a variable. The skill is
> thinking in two phases: "what code do I want to generate?" then
> "write the quasiquote template that generates it." Macros feel like
> magic until you've written three; then they feel like the most
> natural thing in the language.

## What we covered

- A **macro** receives its arguments as **unevaluated code**,
  transforms it, and returns **new code** to be evaluated in place.
- Functions process *values*; macros process *programs*.
- Macros expand at **expansion (compile) time**, before runtime.
- `unless`/`swap!` *must* be macros because they control evaluation /
  need variable names unevaluated — functions can't.
- `macroexpand` reveals the generated code — your macro-debugging
  tool.
- Macro-generated code has **zero runtime overhead** beyond the code
  itself.
- Macros are for: new control structures, binding forms, deferred
  evaluation, boilerplate elimination, DSLs.
- **Use a function if you can; a macro only if you must.**

## What's next

[Chapter 15](/lisp/part-4-macros/macro-hygiene) — macro hygiene and the
gotchas. The `swap!` macro has a hidden bug (variable capture); this
chapter explains the classic macro pitfalls and how hygienic macros
avoid them.
