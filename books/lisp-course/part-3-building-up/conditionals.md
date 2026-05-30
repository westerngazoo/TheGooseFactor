---
sidebar_position: 3
title: "Conditionals: if, cond, when, unless"
---

# Conditionals

> The branching toolkit — `if`, `cond`, `when`, `unless` — when to use
> each, and the crucial point that they're *expressions* that return
> values, not statements that direct flow.

Branching is universal, but Lisp's take has a twist: conditionals are
**expressions**. `(if test a b)` doesn't "execute a branch" — it
*returns the value* of the chosen branch. This chapter covers the
toolkit and the expression mindset.

## 1. if: the fundamental conditional

`(if test then else)`: evaluate `test`; if true, evaluate and return
`then`; otherwise evaluate and return `else`.

```lisp
(if (> 5 3) "yes" "no")   ; => "yes"
(if (> 3 5) "yes" "no")   ; => "no"
```

The key word is **return**. `if` is an expression yielding a value, so
it composes inside other expressions:

```lisp
(+ 1 (if (> x 0) 10 20))           ; if returns 10 or 20, then + adds 1
(define label (if (even? n) "even" "odd"))   ; bind the result of if
(list (if cold? "coat" "shirt"))   ; if's value goes into the list
```

In statement-oriented languages, `if` directs control flow and you
assign inside branches. In Lisp, `if` *is* the value — you use it
wherever a value goes. This is cleaner: no temporary variable, no
duplicated assignment.

> :surprisedgoose: "Conditionals are expressions" is a bigger deal than
> it sounds. It means no `x = ...; if (...) x = ...` dance — you just
> write `(define x (if ... ... ...))`. Many modern languages adopted
> this (Rust's `if` is an expression, Kotlin's, the ternary operator
> everywhere) — and they got it from the Lisp/ML tradition. Once you
> think in expressions, statement-based branching feels clunky.

## 2. What counts as true?

`if` needs to decide if the test is "true." The rules differ by
dialect:

- **Scheme**: only `#f` is false. *Everything* else — including `0`,
  the empty list `()`, the empty string — is true.
- **Common Lisp**: only `nil` (= the empty list `()`) is false;
  everything else is true.
- **Clojure**: only `false` and `nil` are false; everything else
  (including `0`, `""`, `[]`) is true.

The common thread: there's one (or two) designated false value(s), and
*everything else is true*. Note that `0` is **true** in all of these —
a frequent surprise for C/Python programmers. Test explicitly when you
mean "is it zero": `(if (= n 0) ...)`, not `(if n ...)`.

## 3. cond: multi-way branching

Nested `if`s get ugly fast:

```lisp
(if (< x 0) "negative"
    (if (= x 0) "zero"
        (if (< x 10) "small"
            "large")))   ; deeply nested, hard to read
```

`cond` flattens this into a clean clause list. Each clause is
`(test result...)`; `cond` tries tests top to bottom and returns the
result of the first whose test is true:

```lisp
(cond ((< x 0) "negative")
      ((= x 0) "zero")
      ((< x 10) "small")
      (else "large"))     ; else = the fallback clause
```

Much clearer. `else` is the catch-all (a clause that always matches).
`cond` is the idiomatic multi-way conditional — reach for it whenever
you have more than two branches.

Each clause's result can be multiple expressions (run in sequence, last
value returned), and a clause with no result returns the test value
itself — handy occasionally.

## 4. when and unless: one-armed conditionals

Often you want "if true, do this; otherwise do nothing." `if` with no
meaningful else is awkward. `when` and `unless` fill the gap:

- **`when`**: `(when test body...)` — if `test` is true, evaluate the
  body; else return nothing/unspecified.
- **`unless`**: `(unless test body...)` — if `test` is *false*,
  evaluate the body.

```lisp
(when (> balance 0)
  (display "in credit")
  (process-payment))     ; both run only if balance > 0

(unless (null? lst)
  (display (car lst)))   ; runs only if lst is non-empty
```

`when`/`unless` allow a multi-expression body without wrapping in
`begin`, which makes them convenient for side-effecting "do these
steps if the condition holds." `unless test` is just `when (not
test)` — use whichever reads more naturally.

> :nerdygoose: `when`, `unless`, and even `cond` are typically
> **macros** ([Part IV](/lisp/part-4-macros/your-first-macro)) that
> expand to `if`. `(when t body...)` expands to `(if t (begin
> body...) #f)`. `cond` expands to nested `if`s. This is a perfect
> example of [Chapter 9](/lisp/part-3-building-up/special-forms-vs-functions)'s
> point: the language ships a few primitives (`if`) and builds the
> ergonomic forms (`when`, `unless`, `cond`) as macros on top. You
> could write them yourself.

## 5. and / or as conditionals

`and` and `or` ([Chapter 9](/lisp/part-3-building-up/special-forms-vs-functions))
double as control flow because they short-circuit and return useful
values:

```lisp
(or value default)            ; "value if truthy, else default"
(and obj (lookup obj key))    ; "lookup only if obj is non-false"
```

`(or a b c)` returns the first truthy value (or the last if all
false). `(and a b c)` returns the last value if all are truthy (or the
first false). This makes them handy for defaults and guarded access —
common Lisp idioms:

```lisp
(define (safe-first lst)
  (and (not (null? lst)) (car lst)))   ; #f if empty, else the first element
```

## 6. case: dispatch on a value

When branching on the *value* of one expression (not arbitrary tests),
`case` is cleaner than `cond`:

```lisp
(case day
  ((mon tue wed thu fri) "weekday")
  ((sat sun) "weekend")
  (else "unknown"))
```

`case` evaluates `day` once and compares it against each clause's list
of literals. It's the Lisp `switch`, used when you're dispatching on
discrete values. (Internally, often a macro over `cond` with
equality tests.)

## 7. The expression mindset in practice

Because conditionals return values, you write *expressions* that
*produce* the answer, rather than *statements* that *assign* it. The
factorial from [Chapter 6](/lisp/part-2-functional/recursion):

```lisp
(define (factorial n)
  (if (= n 0)
      1
      (* n (factorial (- n 1)))))
```

The function body *is* the `if`-expression. There's no `return`; the
function yields whatever the `if` yields. Compare to an imperative
style with a mutable `result` variable and `return` statements — the
expression version is tighter and has no intermediate state to
mismanage. Embracing "everything returns a value" is core to thinking
in Lisp.

## 8. Choosing the right conditional

A quick guide:

- **Two branches, both yield a value** → `if`.
- **Many branches / a chain of tests** → `cond`.
- **Dispatch on one value's discrete cases** → `case`.
- **Do something only if true, no else** → `when`.
- **Do something only if false** → `unless`.
- **Default values / guarded access** → `or` / `and`.

They all reduce to `if` underneath, so it's about readability: pick the
one that states your intent most clearly.

> :weightliftinggoose: The mindset to drill: conditionals *return*,
> they don't *direct*. Stop writing "if condition, set variable;"
> start writing "the value is (if condition this that)." Use `cond`
> the moment you have three branches — nested `if`s are a code smell.
> And remember `0` and `()` are *true* in Scheme — test for them
> explicitly. These habits make your Lisp read like a description of
> the answer, not a recipe of steps.

## What we covered

- `if` is an **expression**: it *returns* the value of the chosen
  branch, composing inside other expressions.
- Truthiness: only `#f` (Scheme) / `nil` (CL) / `false`+`nil`
  (Clojure) is false; **everything else, including `0` and `()`, is
  true**.
- `cond` — clean multi-way branching with `(test result)` clauses and
  `else`.
- `when` / `unless` — one-armed conditionals with multi-expression
  bodies.
- `and` / `or` — short-circuit control flow for defaults and guards.
- `case` — dispatch on a value's discrete cases (the Lisp `switch`).
- `when`/`unless`/`cond`/`case` are typically **macros over `if`**.
- The expression mindset: produce values, don't assign them.

## What's next

[Chapter 12](/lisp/part-3-building-up/tail-calls-and-iteration) — tail
calls and iteration. How recursion becomes a loop (with no stack
growth) when the recursive call is in "tail position," and how Lisp
does iteration without mutable loop variables.
