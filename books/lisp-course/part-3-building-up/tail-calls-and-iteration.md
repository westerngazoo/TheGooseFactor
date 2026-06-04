---
sidebar_position: 4
title: "Tail Calls and Iteration"
---

# Tail Calls and Iteration

> How recursion becomes a loop with no stack growth — when the
> recursive call is in "tail position." The mechanism that lets Lisp
> iterate without mutable loop variables.

[Chapter 6](/lisp/part-2-functional/recursion) noted two recursion
shapes: build-up (combine *after* recursing) and accumulate (combine
*before*). The accumulate shape has a superpower: when the recursive
call is the *last* thing the function does, it runs in **constant
stack space** — a loop in disguise. This chapter explains tail calls
and how Lisp iterates.

## 1. The problem: recursion can blow the stack

The build-up `sum` from [Chapter 6](/lisp/part-2-functional/recursion):

```lisp
(define (sum lst)
  (if (null? lst)
      0
      (+ (car lst) (sum (cdr lst)))))
```

To compute `(+ (car lst) (sum (cdr lst)))`, the `+` must *wait* for
`(sum (cdr lst))` to finish. So each recursive call leaves a pending
`+` on the call stack. For a list of a million elements, that's a
million stacked pending additions — and a **stack overflow**. The
recursion's depth equals the list length.

## 2. Tail position: the last thing a function does

A call is in **tail position** if it's the *last* operation a function
performs — its result is returned directly, with nothing left to do
afterward. Compare:

```lisp
(+ (car lst) (sum (cdr lst)))   ; sum is NOT in tail position:
                                ; after it returns, + still must run
```

```lisp
(sum-acc (cdr lst) (+ acc (car lst)))   ; sum-acc IS in tail position:
                                        ; its result is returned directly
```

In the second, when `sum-acc` recurses, there's *nothing pending* —
the recursive call's result *is* the function's result. The current
stack frame isn't needed anymore; it can be *reused* for the recursive
call instead of stacked on top.

## 3. Tail-call optimization (TCO)

When a recursive call is in tail position, a proper Lisp implementation
performs **tail-call optimization**: it reuses the current stack frame
rather than allocating a new one. The result: a tail-recursive function
runs in **constant stack space**, no matter how deep the recursion. It's
a loop.

The accumulator `sum` ([Chapter 6](/lisp/part-2-functional/recursion)):

```lisp
(define (sum-acc lst acc)
  (if (null? lst)
      acc                                     ; return accumulated total
      (sum-acc (cdr lst) (+ acc (car lst))))) ; tail call: nothing pending
(sum-acc '(1 2 3 4) 0)   ; => 10, in constant stack space
```

`(+ acc (car lst))` is computed *before* the recursive call, and the
recursive call is the last thing — tail position. So this sums a
billion-element list without growing the stack. Same result as the
build-up version, but it's an iteration.

> :nerdygoose: **Scheme guarantees** tail-call optimization — it's in
> the language standard. A Scheme implementation *must* run
> tail-recursive code in constant space. Common Lisp does *not*
> guarantee it (most implementations do it, but it's not required).
> Clojure (on the JVM, which lacks TCO) requires you to use the
> explicit `recur` form for tail recursion. Python and Java famously
> *don't* do TCO, which is why deep recursion blows their stacks. The
> guarantee is a real Scheme distinctive.

## 4. Converting build-up to tail recursion

The recipe: introduce an **accumulator** parameter that carries the
running result, do the combining *before* the recursive call, and make
the recursive call the last operation. Build-up `factorial`:

```lisp
(define (factorial n)
  (if (= n 0) 1 (* n (factorial (- n 1)))))   ; not tail-recursive
```

Tail-recursive version with an accumulator:

```lisp
(define (factorial n)
  (fact-iter n 1))                  ; start accumulator at 1
(define (fact-iter n acc)
  (if (= n 0)
      acc
      (fact-iter (- n 1) (* n acc)))) ; tail call; multiply into acc first
(factorial 5)   ; => 120, constant stack
```

The multiplication `(* n acc)` happens *before* `fact-iter` recurses;
the recursive call returns directly. This is a loop: `acc` is the
accumulating "loop variable," `n` counts down, and the stack stays
flat. A helper function (`fact-iter`) with an extra accumulator
parameter is the standard pattern — often hidden via an inner
`define` or a `named let` (next section).

## 5. named let: iteration that looks like a loop

Writing a separate helper function for every loop is tedious. Scheme's
**named `let`** packages the pattern — it's a local recursive function
you define and call in one form:

```lisp
(define (factorial n)
  (let loop ((i n)        ; loop variable i starts at n
             (acc 1))     ; accumulator starts at 1
    (if (= i 0)
        acc
        (loop (- i 1) (* i acc)))))   ; "loop" recurses — tail position
(factorial 5)   ; => 120
```

`let loop (...)` defines a local function named `loop` with the given
initial bindings and immediately calls it. Inside, `(loop new-i
new-acc)` "iterates" — it's a tail call, so it runs as a loop. This is
the idiomatic Scheme way to write iteration: it *reads* like a loop
(initial values, a body, an update) but it's just tail recursion with
nice syntax. `loop` is a closure ([Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope))
that recurses on itself.

> :surprisedgoose: A named `let` is the moment recursion and iteration
> fully merge. `(let loop ((i 0) (acc 1)) ... (loop (+ i 1) ...))`
> looks like a `for` loop — initialize, test, update — but it's a
> tail-recursive function. There's no separate "loop construct" in the
> language core; iteration *is* tail recursion, and named `let` is the
> ergonomic wrapper. One mechanism, two faces.

## 6. do and explicit iteration constructs

Lisps also provide explicit looping forms for when they read better:

- **Scheme `do`**: a loop with explicit variables, step expressions,
  and a termination test:

```lisp
(do ((i 0 (+ i 1))        ; i starts at 0, steps by +1
     (acc 1 (* acc i)))   ; acc starts at 1, steps by *i ... (roughly)
    ((= i 5) acc))        ; stop when i=5, return acc
```

- **Common Lisp `loop`**: a rich (some say baroque) iteration mini-
  language: `(loop for i from 1 to 5 collect (* i i))` → `(1 4 9 16
  25)`.
- **`for-each`** and the higher-order functions
  ([Chapter 7](/lisp/part-2-functional/higher-order-functions)) for
  iterating over collections.

These exist for readability, but under the hood iteration is tail
recursion. In idiomatic Scheme, named `let` and the HOFs cover most
cases; `do` is used occasionally.

## 7. When NOT to make it tail-recursive

Tail recursion is great for *linear* iteration, but not everything
fits — and forcing it can hurt clarity:

- **Tree recursion** (recursing on both car and cdr,
  [Chapter 6](/lisp/part-2-functional/recursion)) is *not* naturally
  tail-recursive — it has two recursive calls, and at least one isn't
  in tail position. That's fine: tree depth is usually logarithmic, so
  the stack stays shallow.
- **Build-up recursion** on *short* lists is perfectly fine and often
  *clearer* than the accumulator version. Don't add an accumulator to
  a function that processes a 10-element list — the non-tail version
  reads better.

Use tail recursion when you might process *large* linear sequences
(where stack depth matters), or when expressing genuine iteration.
Otherwise, prefer whichever version is clearest. Premature
tail-recursion is as bad as premature optimization generally.

## 8. The deep point: iteration is recursion

Step back. Lisp's core has no loop construct — no `for`, no `while` as
primitives. It doesn't need them: **tail recursion gives you iteration
for free**, with the bonus that the same mechanism (recursion)
expresses both looping and tree-walking. Where other languages have
separate "recursion" and "iteration" tools, Lisp has one — recursion —
and tail-call optimization makes the iterative case efficient.

This is, once again, the Lisp economy: a tiny core (functions +
recursion + TCO) subsumes what other languages provide as multiple
distinct features. `let loop`, `do`, even Common Lisp's elaborate
`loop` macro — all are sugar over tail recursion.

> :weightliftinggoose: The skill: recognize tail position. After your
> recursive call, is there *anything left to do* (an outer `+`, `cons`,
> etc.)? If yes, it's not tail-recursive and the stack grows. If the
> recursive call's result is returned directly, it's a tail call and
> runs as a loop. For large linear data, convert to an accumulator /
> named `let`. For trees and short lists, don't bother — clarity wins.
> Know the difference and choose deliberately.

## What we covered

- Build-up recursion leaves **pending operations** on the stack —
  depth = input size, risking **stack overflow**.
- A call is in **tail position** if it's the *last* operation — its
  result is returned directly, nothing pending.
- **Tail-call optimization (TCO)** reuses the stack frame for tail
  calls → **constant stack space** → recursion becomes a loop.
- **Scheme guarantees TCO**; Common Lisp doesn't require it; Clojure
  needs explicit `recur`; Python/Java don't do it.
- Convert build-up to tail-recursive with an **accumulator**
  (combine *before* the recursive call).
- **Named `let`** packages tail recursion to read like a loop;
  iteration *is* tail recursion.
- `do` / CL `loop` are explicit iteration sugar over the same
  mechanism.
- Don't force tail recursion on trees or short lists — clarity first.
- The deep point: Lisp's core has no loop primitive; tail recursion
  subsumes iteration.

## What's next

That closes Part III — you can now write real Lisp programs:
functions, recursion, HOFs, closures, binding, conditionals,
iteration. [Part IV](/lisp/part-4-macros/quote-quasiquote-unquote)
unlocks Lisp's signature power: **macros** — code that writes code —
starting with the quoting toolkit that makes them possible.
