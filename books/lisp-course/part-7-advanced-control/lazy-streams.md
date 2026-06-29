---
sidebar_position: 4
title: "Lazy Evaluation and Streams"
---

# Lazy Evaluation and Streams

> Compute only what you need, only when you need it. Laziness lets you
> build *infinite* data structures — the stream of all integers, all
> primes, all Fibonacci numbers — and take just the prefix you actually
> use. It's a different way to separate *what* a value is from *when*
> it's computed.

We close Part VII with laziness. It pairs naturally with the
control-flow themes of this part: continuations
([Chapter 25](/lisp/part-7-advanced-control/continuations)) let you
suspend and resume *control*; laziness lets you suspend and resume
*evaluation of a value*. Both are about not doing work until it's
demanded.

## 1. Strict vs lazy evaluation

By default, Lisp is **strict** (a.k.a. *eager*, *applicative-order*): a
function's arguments are fully evaluated *before* the function runs
([Chapter 4](/lisp/part-1-core-idea/evaluation)). That's usually what you
want — but it forces work you might not need:

```scheme
(define (my-if c a b) (cond (c a) (else b)))
(my-if #t 1 (/ 1 0))    ; ERROR — (/ 1 0) is evaluated before my-if runs
```

Because `my-if` is a function, *both* branches are evaluated first, so
the division by zero blows up even though we'd never use it. (This is
exactly why `if` must be a special form, and why some constructs must be
macros — [Chapter 14](/lisp/part-4-macros/your-first-macro).) **Lazy**
evaluation flips the default: an expression is *not* evaluated until its
value is actually demanded. Then `(/ 1 0)` would never run.

## 2. delay and force: laziness on demand

You don't need a whole lazy language; you can opt into laziness
value-by-value with two operators:

- **`delay`** wraps an expression in a **promise** — an unevaluated
  thunk that remembers how to compute the value later.
- **`force`** demands a promise's value, running the computation (once).

```scheme
(define p (delay (begin (display "computing!\n") (* 6 7))))
;; nothing printed yet — the expression is suspended

(force p)   ; prints "computing!", returns 42
(force p)   ; returns 42 again — but does NOT print (see §6, memoization)
```

`delay` is trivially a macro over a lambda (it must be a macro, so its
argument isn't evaluated immediately):

```scheme
(define-syntax delay
  (syntax-rules ()
    ((_ expr) (make-promise (lambda () expr)))))

(define (force promise) (promise))   ; call the thunk; memoized in §6
```

With these two primitives, you control *exactly* when each value is
computed. Now we build something with them.

## 3. Streams: lazy lists

A **stream** is a list whose *tail is delayed*. The head is a real
value, available now; the rest is a promise, computed only if you ask.
Define a lazy cons:

```scheme
;; cons-stream must be a macro: the tail must NOT be evaluated yet
(define-syntax cons-stream
  (syntax-rules ()
    ((_ a b) (cons a (delay b)))))

(define (stream-car s) (car s))
(define (stream-cdr s) (force (cdr s)))   ; forcing computes the next bit
(define the-empty-stream '())
(define (stream-null? s) (null? s))
```

A stream looks like a list but only ever materializes the parts you
walk. The tail of `(stream-cdr s)` itself may be another delayed
stream — so traversal computes one element at a time, on demand.

## 4. Infinite streams

Because the tail is only computed when demanded, a stream can be
**infinite** — its definition can refer to itself, and it never runs
away:

```scheme
;; All integers from n upward — an infinite stream:
(define (integers-from n)
  (cons-stream n (integers-from (+ n 1))))

(define integers (integers-from 1))   ; 1, 2, 3, 4, ... forever

(stream-ref integers 0)   ; => 1
(stream-ref integers 99)  ; => 100  — exactly 100 elements computed, no more
```

The definition is recursive with *no base case*, yet it doesn't loop
forever, because `cons-stream` delays the recursive call. You only ever
compute as far as you look. Even slicker, define a stream **in terms of
itself**:

```scheme
;; Add two streams element-by-element (a stream of pairwise sums):
(define (add-streams s1 s2)
  (cons-stream (+ (stream-car s1) (stream-car s2))
               (add-streams (stream-cdr s1) (stream-cdr s2))))

;; Fibonacci, as a self-referential stream:
(define fibs
  (cons-stream 0
    (cons-stream 1
      (add-streams (stream-cdr fibs) fibs))))

(stream-take fibs 8)   ; => (0 1 1 2 3 5 8 13)
```

`fibs` is defined using `fibs` — each new element is the sum of the two
before it, pulled lazily from the stream itself. This is impossible with
strict lists and feels like magic until you internalize that nothing is
computed until `stream-take` demands it.

> :surprisedgoose: An *infinite* data structure that fits in finite
> memory — because it's never fully built. The stream of all primes
> "exists" as a value you can pass around, yet only the prefix you
> inspect is ever realized. This dissolves the usual split between "a
> sequence" and "a process that generates a sequence": a lazy stream is
> both at once. You write the *what* (the whole infinite sequence) and
> laziness handles the *when* (compute the next one only if asked).

## 5. Stream operations

The usual higher-order functions
([Chapter 7](/lisp/part-2-functional/higher-order-functions)) have lazy
twins. They look identical to the list versions but produce streams that
compute lazily:

```scheme
(define (stream-map f s)
  (if (stream-null? s)
      the-empty-stream
      (cons-stream (f (stream-car s))
                   (stream-map f (stream-cdr s)))))

(define (stream-filter pred s)
  (cond ((stream-null? s) the-empty-stream)
        ((pred (stream-car s))
         (cons-stream (stream-car s) (stream-filter pred (stream-cdr s))))
        (else (stream-filter pred (stream-cdr s)))))

(define (stream-take s n)
  (if (= n 0) '()
      (cons (stream-car s) (stream-take (stream-cdr s) (- n 1)))))
```

Now compose them over infinite streams — the **Sieve of Eratosthenes**
as an endless stream of primes:

```scheme
(define (sieve s)
  (cons-stream
    (stream-car s)
    (sieve (stream-filter
             (lambda (x) (not (= 0 (modulo x (stream-car s)))))
             (stream-cdr s)))))

(define primes (sieve (integers-from 2)))
(stream-take primes 10)   ; => (2 3 5 7 11 13 17 19 23 29)
```

We "filter all integers down to the primes" — over an *infinite* input —
and ask for the first ten. Laziness makes describing the whole infinite
sieve and consuming a finite slice the same, natural code.

## 6. Memoization: forcing computes once

A subtlety that makes streams efficient: a well-behaved `force`
**memoizes** — it computes the value the first time and caches it, so
later `force`s are instant (that's why §2's promise printed only once).
Without memoization, re-walking a stream would recompute everything, and
the Fibonacci stream's self-reference would explode into exponential
recomputation. With it, each element is computed exactly once and reused.

```scheme
(define (make-promise thunk)
  (let ((forced? #f) (value #f))
    (lambda ()
      (unless forced?
        (set! value (thunk))     ; compute once
        (set! forced? #t))
      value)))                   ; cached forever after
```

Memoized laziness = "compute on demand, then remember." It's the same
caching idea you'd use to speed up any expensive pure function — here
baked into the evaluation strategy.

## 7. Laziness, generators, and other languages

Streams and generators ([Chapter 25, §5](/lisp/part-7-advanced-control/continuations))
are two routes to the same destination: producing a sequence
incrementally, computing each element only when consumed.

- A **generator** suspends a *process* (via continuations) and resumes
  it to get the next value — control-flow-centric.
- A **stream** suspends a *value* (via `delay`) and forces it to get the
  next cell — data-centric.

Other languages picked sides. **Haskell** is lazy *by default* —
everything is a promise, infinite structures are routine, no `delay`
needed. **Clojure** has lazy sequences (`lazy-seq`, `range`, `iterate`)
pervasively. **Python/JavaScript** offer generators and iterators for
the same effect. They all descend from the idea you just built from two
macros: separate *what a value is* from *when it's computed*.

## 8. Laziness as a design tool

Beyond infinite data, laziness buys you real architectural leverage:

- **Decouple producer from consumer.** Generate a (possibly unbounded)
  stream of results; let the consumer decide how many to take. The
  producer needn't know the limit; the consumer needn't know the
  generation logic.
- **Avoid wasted work.** Build a big pipeline of `stream-map`/
  `stream-filter`; only the elements actually consumed get processed.
- **Express "process" as "data."** An event stream, a sequence of game
  states, successive approximations of a numerical method — all become
  ordinary values you can `map` and `filter`.

The cost is the flip side of dynamic variables' cost
([Chapter 27](/lisp/part-7-advanced-control/dynamic-variables)):
laziness makes *when* things happen less obvious, which can complicate
side effects and reasoning about performance and space. So use laziness
where the *what/when* separation pays — sequences and pipelines — and
keep effects strict and explicit.

> :nerdygoose: Streams are SICP's Chapter 3 crescendo, and they reframe a
> deep question: is a sequence a *thing* or a *process*? Strict lists say
> "thing" (fully built). Generators say "process" (run to produce). Lazy
> streams say "both" — a value that *is* its own generating process,
> realized lazily. That unification — and the fact you can build it from
> `delay`/`force`, which are themselves a macro over a lambda — is Lisp's
> small-core philosophy at work yet again: a profound capability assembled
> from two tiny pieces.

> :weightliftinggoose: Build the stream toolkit yourself — `cons-stream`,
> `stream-car`/`-cdr`, `stream-map`, `stream-filter`, `stream-take` —
> then make `integers`, `fibs`, and `primes`. The "aha" lands when you
> ask for `(stream-take primes 20)` and watch an *infinite* sieve hand
> you exactly twenty numbers and stop. Once that clicks, lazy sequences
> in Clojure, Python generators, and Haskell's whole evaluation model
> are just this idea, scaled up.

## What we covered

- Default Lisp is **strict** (arguments evaluated before the call);
  **lazy** evaluation defers a computation until its value is demanded.
- **`delay`** makes a **promise** (suspended thunk); **`force`** runs it
  — both built from a macro over a lambda.
- A **stream** is a list with a delayed tail (`cons-stream`); traversal
  computes one element at a time.
- **Infinite streams** (`integers`, self-referential `fibs`, the prime
  `sieve`) fit in finite memory because only the consumed prefix is
  realized.
- Lazy **`stream-map`/`stream-filter`/`stream-take`** compose over
  infinite inputs; **memoized `force`** computes each element once.
- Streams (data-centric) and **generators** (control-centric) solve the
  same problem; Haskell, Clojure, Python all build on laziness.
- Laziness **decouples producer from consumer** and avoids wasted work —
  at the cost of making *when* things happen less obvious.

## What's next

That's Part VII. [Part VIII](/lisp/part-8-clos/generic-functions) turns
to **objects, the Lisp way**: CLOS, the Common Lisp Object System. We
start with [Chapter 29](/lisp/part-8-clos/generic-functions) — generic
functions and **multiple dispatch**, an object model that puts behavior
in functions, not classes, and dispatches on *all* the arguments at once.
