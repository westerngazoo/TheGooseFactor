---
sidebar_position: 1
title: "Continuations and call/cc"
---

# Continuations and call/cc

> "The rest of the computation" — made into a value you can hold, store,
> and invoke. Continuations are the most mind-bending feature in Lisp,
> and the one that, like macros, permanently changes how you think about
> control flow.

Welcome to Part VII. The [first six parts](/lisp/table-of-contents)
built the core language, the functional style, macros, and an evaluator.
Now we go deeper into the features that make seasoned Lispers nod
knowingly. We begin with the deepest of all: **continuations**.

You already met them implicitly. When you built the metacircular
evaluator ([Chapter 17](/lisp/part-5-metacircular/eval-and-apply)), every
call to `eval` had a "what to do with the result" hanging over it. That
"what to do next" is a continuation. Scheme lets you *grab* it.

## 1. What is a continuation?

At every point during a computation, there is a notion of **what happens
to the value next**. Consider:

```scheme
(+ 1 (* 2 3))
```

When `(* 2 3)` produces `6`, the program "knows" to add `1` to it. That
pending operation — "take this value, add 1, and that's the answer" — is
the **continuation** of `(* 2 3)`. Every subexpression has one:

- The continuation of `(* 2 3)` is "add 1, return."
- The continuation of `3` is "multiply by 2, add 1, return."

Normally the continuation is invisible — it's just the call stack doing
its job. A continuation is that pending work **reified as a value**: a
one-argument procedure that, when called with a value, resumes the
computation *as if that subexpression had returned that value*.

> :nerdygoose: A continuation is the runtime's answer to "where was I?"
> Every language has continuations implicitly — they *are* the call
> stack. Most languages never let you touch them. Scheme makes them
> **first-class**: you can capture the current continuation as an
> ordinary procedure, store it in a variable, return it, call it later,
> or call it more than once. That last one — calling a captured
> continuation *after* the computation already finished — is what makes
> them feel like time travel.

## 2. call/cc: capturing the current continuation

The tool is `call-with-current-continuation`, mercifully abbreviated
`call/cc`. You give it a function of one argument; it calls that
function, passing in the *current continuation* as a procedure:

```scheme
(call/cc
  (lambda (k)
    ;; k is the continuation: "whatever was waiting for call/cc's value"
    (+ 1 (k 42))))      ; calling k with 42 abandons the (+ 1 ...)
```

Here `k` is bound to call/cc's continuation. When we call `(k 42)`, we
say "make the whole `call/cc` expression return `42`, right now" — the
surrounding `(+ 1 ...)` is *discarded*. The result is `42`, not `43`.

If you never call `k`, `call/cc` just returns its body's value normally:

```scheme
(call/cc (lambda (k) (+ 1 2)))   ; => 3, k unused
```

So `call/cc` does two things at once: it runs your code, and it hands
your code an escape hatch to the outside.

## 3. The easy use: escape (non-local exit)

The gentlest use of `call/cc` is an **early return** — bail out of a
deep computation immediately. Here's a product that short-circuits to
`0` the moment it sees a zero (no point multiplying the rest):

```scheme
(define (list-product lst)
  (call/cc
    (lambda (return)
      (let loop ((lst lst))
        (cond ((null? lst) 1)
              ((= (car lst) 0) (return 0))   ; jump straight out with 0
              (else (* (car lst) (loop (cdr lst)))))))))

(list-product '(1 2 0 3 4 5))   ; => 0, and the 3 4 5 are never multiplied
```

`(return 0)` abandons the entire pending chain of multiplications. This
is exactly `break`, early `return`, or throwing an exception to escape —
but built from one primitive. Used this way, a continuation is a label
you can `goto`, from anywhere, carrying a value.

## 4. The hard use: resuming the past

Escape continuations only jump *outward*, once. But a captured
continuation is just a value — nothing stops you from saving it and
calling it **later**, or **more than once**. This is where minds break:

```scheme
(define saved-k #f)

(define (test)
  (+ 1 (call/cc
         (lambda (k)
           (set! saved-k k)   ; stash the continuation for later
           1))))

(test)          ; => 2   (call/cc returned 1, plus 1)
(saved-k 10)    ; => 11  !!  we re-ran "+1" with a NEW value, 10
(saved-k 100)   ; => 101 !!  and again
```

Read that again. `saved-k` captured "add 1 to me and that's the answer."
After `test` already returned, we call `saved-k` and the `(+ 1 ...)`
**runs again** with a fresh input. The continuation resurrected a
computation that had already completed. A continuation isn't consumed by
use — it's a re-entrant snapshot of "the rest of the program from here."

> :surprisedgoose: This is the feature that makes people say Scheme has
> a time machine. A first-class continuation lets you return to a point
> in the computation's past and proceed forward again — repeatedly, with
> different values each time. Nothing in mainstream languages does this.
> `return`, exceptions, and generators are all *special cases* of this
> one primitive. Once you see that, every other control structure looks
> like a continuation wearing a disguise.

## 5. Building generators from continuations

A **generator** — a function that yields a sequence of values, pausing
between each — is two continuations playing catch: one for "the
generator's place," one for "the caller's place." Each `yield` swaps
control by capturing one continuation and invoking the other.

```scheme
;; Sketch: a generator yields values, suspending between them.
(define (make-counter)
  (let ((return-k #f) (resume-k #f) (n 0))
    (lambda ()
      (call/cc
        (lambda (caller)
          (set! return-k caller)
          (if resume-k
              (resume-k 'go)                 ; jump back into the generator
              (let loop ()
                (set! n (+ n 1))
                (call/cc (lambda (k)          ; remember where we paused
                           (set! resume-k k)
                           (return-k n)))     ; hand n back to the caller
                (loop))))))))

(define next (make-counter))
(next)   ; => 1
(next)   ; => 2
(next)   ; => 3
```

The generator runs, hits a `yield` point, captures *its own*
continuation (so it can be resumed), then jumps back to the caller's
continuation with a value. Next call, it jumps back in where it paused.
Python's `yield`, JavaScript's generators, C#'s `yield return` — all of
this is continuations, packaged behind syntax. In Scheme you can build
it yourself from `call/cc`.

## 6. Backtracking and amb

Continuations also give you **backtracking** — explore a choice, and if
it fails, rewind and try another. The classic demo is McCarthy's `amb`
("ambiguous") operator, which "chooses" a value and can be told to
choose again:

```scheme
(define fails '())   ; stack of alternative continuations

(define (amb . choices)
  (call/cc
    (lambda (k)
      (for-each
        (lambda (choice)
          (set! fails (cons (lambda () (k choice)) fails)))
        choices)
      ((car fails)))))    ; try the first choice now

(define (fail)
  (let ((next (car fails)))
    (set! fails (cdr fails))
    (next)))              ; rewind to the most recent choice point

;; Find a Pythagorean triple by "guessing" and backtracking:
(define a (amb 1 2 3 4 5))
(define b (amb 1 2 3 4 5))
(define c (amb 1 2 3 4 5))
(if (= (+ (* a a) (* b b)) (* c c))
    (list a b c)
    (fail))           ; => (4 3 5)  (first triple found, searching last choice first)
```

Each `amb` saves continuations for its un-tried alternatives. `fail`
invokes the most recent one, rewinding the computation to that choice
point and proceeding with the next option. This is a *search engine*
built from continuations — the seed of logic programming (Prolog,
miniKanren) embedded in Lisp.

## 7. Continuation-passing style (CPS)

There's a way to make continuations explicit *without* `call/cc`: write
every function to take an extra argument, `k`, the continuation, and
instead of *returning* a value, *call* `k` with it. This is
**continuation-passing style**:

```scheme
;; Direct style:
(define (add1 n) (+ n 1))

;; CPS: never returns — calls its continuation with the result
(define (add1& n k) (k (+ n 1)))

(add1& 5 (lambda (result) (display result)))   ; prints 6
```

In CPS, the "rest of the computation" is a literal argument, threaded by
hand. It looks tedious — and it is, to write by hand — but it's
illuminating: it shows that the call stack *is* a chain of
continuations. Compilers use CPS as an intermediate representation
precisely because it makes control flow explicit and uniform. And it
connects straight back to your evaluator
([Part V](/lisp/part-5-metacircular/eval-and-apply)): a CPS evaluator
threads a continuation through every `eval`, and *that* is what
`call/cc` reaches in to grab.

> :nerdygoose: There's a deep equivalence here: a program written in CPS
> has its continuations available as ordinary lambda arguments, so it
> doesn't *need* `call/cc` — it already has them. `call/cc` is the trick
> that gives direct-style code access to the continuation that CPS makes
> explicit. Convert your interpreter to CPS and you can implement
> `call/cc` in a single line. The two ideas are the same idea, seen from
> two sides.

## 8. Continuations vs exceptions

You may be thinking "this is just exceptions." Escape continuations
*are* essentially exceptions (jump outward with a value). But
continuations are strictly more powerful:

- **Exceptions only go outward, once.** You throw, the stack unwinds,
  the handler runs, and the thrown-from point is *gone*. You can't
  resume it.
- **Continuations can be re-entered.** They can jump *back in*, multiple
  times. Generators and backtracking need this; exceptions can't do it.

The condition system ([Chapter 26](/lisp/part-7-advanced-control/condition-system))
recovers some of this power for error handling specifically — its
handlers run *before* the stack unwinds, so the signaling point is still
alive. But the fully general tool is the continuation. Exceptions,
generators, coroutines, early return, and backtracking are all
continuations in costume.

> :weightliftinggoose: Continuations are the heaviest lift in the
> course — heavier than macros. Don't expect them to click on the first
> read. Start with the escape use (§3); it's just early return and it
> *will* make sense. Then study the re-entrant example (§4) until the
> "it runs again" stops feeling impossible. Build the generator (§5)
> yourself. The payoff: you'll understand every control construct in
> every language as a special case of one primitive, and you'll never be
> mystified by `yield`, `async`, or backtracking again.

## What we covered

- A **continuation** is "the rest of the computation" from a given
  point, reified as a one-argument procedure.
- **`call/cc`** captures the current continuation and passes it to your
  function as a callable value.
- **Escape** continuations give early return / non-local exit (call `k`
  to jump out with a value).
- **Re-entrant** continuations can be saved and invoked later, even
  multiple times — resuming a finished computation.
- **Generators** and **coroutines** are two continuations swapping
  control; **`amb`/backtracking** saves continuations for un-tried
  choices.
- **CPS** makes continuations explicit as a threaded `k` argument;
  `call/cc` reaches into the continuation that CPS makes visible.
- Continuations subsume exceptions (which only go outward, once) and are
  strictly more general.

## What's next

[Chapter 26](/lisp/part-7-advanced-control/condition-system) — the
condition system. Common Lisp's error handling, which runs handlers
*before* unwinding the stack and offers named **restarts** — recovery
that surpasses exceptions, and a close cousin of the continuations you
just met.
