---
sidebar_position: 4
title: "Closures and Lexical Scope"
---

# Closures and Lexical Scope

> How functions "remember" the variables where they were created. The
> closure is the quiet mechanism behind much of Lisp's power — and the
> idea every modern language eventually borrowed.

We've seen functions that return functions (`compose`, `adder` in
[Chapter 5](/lisp/part-2-functional/functions-and-lambda)). Those
returned functions somehow "remembered" values from where they were
created. That memory is a **closure**, and understanding it completes
the functional foundations.

## 1. Lexical scope: where a variable's value comes from

**Scope** is the region of a program where a name refers to a
particular binding. Lisp (Scheme, Clojure, modern Common Lisp) uses
**lexical scope**: a variable refers to the binding in the *textually
enclosing* code where the function was *defined* — not where it's
*called*.

```lisp
(define x 10)

(define (show-x) x)   ; x here refers to the x in scope where show-x is defined

(define (caller)
  (define x 999)      ; a different, local x
  (show-x))           ; what does this return?

(caller)   ; => 10, NOT 999
```

`show-x` returns `10`, the `x` visible *where `show-x` was written*,
even though `caller` has its own `x = 999` in scope at the call site.
That's lexical scope: look outward through the *text*, not through the
*call stack*. (The alternative, **dynamic scope**, would return 999 —
it was common in old Lisps and survives in Common Lisp's "special"
variables, but lexical is the default and the sane choice.)

> :nerdygoose: Lexical scope was a defining contribution of **Scheme**
> (1975, Sussman & Steele). Earlier Lisps were dynamically scoped,
> which made closures behave confusingly. Scheme's insistence on
> lexical scope is *why* closures work cleanly, and it's now universal
> — every language with closures (JS, Python, Rust, Swift) uses
> lexical scope. When you write a JavaScript closure, you're using a
> Scheme idea from 1975.

## 2. A closure: a function plus its captured environment

A **closure** is a function bundled together with the bindings of the
variables it references from its enclosing scope. When you create a
function with `lambda`, it "closes over" the variables in scope at
that moment — capturing them so it can use them later, even after the
enclosing function has returned.

The `adder` example from
[Chapter 5](/lisp/part-2-functional/functions-and-lambda):

```lisp
(define (adder n)
  (lambda (x) (+ x n)))   ; this lambda closes over n

(define add5 (adder 5))   ; n is 5, captured in the closure
(define add100 (adder 100)) ; a different closure, n is 100

(add5 10)    ; => 15
(add100 10)  ; => 110
(add5 1)     ; => 6   — add5 still remembers n=5
```

When `(adder 5)` runs, it creates a lambda that references `n`. Even
after `adder` returns, that lambda — now bound to `add5` — *still has
access to `n = 5`*. The binding `n = 5` was captured in the closure.
`add100` captured a *different* `n = 100`. Each call to `adder`
creates a fresh closure with its own captured `n`.

This is the essence: **a closure carries its birthplace's variables
with it**.

## 3. Why closures matter

Closures are not a curiosity; they're a foundational tool. They let
you:

**Make function factories** (like `adder`) — functions that produce
specialized functions:

```lisp
(define (multiplier factor)
  (lambda (x) (* x factor)))
(define triple (multiplier 3))
(triple 7)   ; => 21
```

**Encapsulate private state** — a closure can hold mutable state that
only it can access (poor-man's objects):

```lisp
(define (make-counter)
  (define count 0)
  (lambda ()
    (set! count (+ count 1))   ; mutate the captured count
    count))

(define c (make-counter))
(c)   ; => 1
(c)   ; => 2
(c)   ; => 3   — count persists between calls, private to this closure
```

`count` is invisible outside the closure — fully encapsulated. Each
`make-counter` call creates an independent counter. This is, in
miniature, object-oriented programming: state + behavior bundled
together. (`set!` is mutation; the functional purists avoid it, but it
illustrates that closures *can* hold state.)

**Implement callbacks and deferred computation** — capture context now,
run later:

```lisp
(define (on-click button-name)
  (lambda () (display (string-append "clicked " button-name))))
(define handler (on-click "submit"))
(handler)   ; later: prints "clicked submit"
```

> :surprisedgoose: "Objects are a poor man's closures; closures are a
> poor man's objects." The `make-counter` example shows why — a
> closure with private state *is* an object (encapsulated state +
> methods). Closures and objects are two views of the same idea:
> bundling data with the code that operates on it. Lisp had closures
> decades before mainstream OOP, and you can build an object system
> entirely out of them.

## 4. Closures capture variables, not values

A subtlety worth understanding: a closure captures the *variable*
(the binding), not a snapshot of its value at capture time. If the
variable is later mutated, the closure sees the new value:

```lisp
(define (make-pair)
  (define shared 0)
  (define (getter) shared)
  (define (setter v) (set! shared v))
  (list getter setter))

(define p (make-pair))
(define get (car p))
(define set (cadr p))
(get)       ; => 0
(set 42)
(get)       ; => 42   — both closures share the same `shared` binding
```

`getter` and `setter` close over the *same* `shared` variable, so they
communicate through it. Two closures sharing a captured binding is a
powerful (and occasionally surprising) pattern — it's how you build
objects with multiple methods over shared private state.

## 5. The classic gotcha: closures in a loop

A famous trap (in *every* closure language) — creating closures inside
a loop that all capture the *same* loop variable:

```lisp
;; Intent: a list of functions that return 0, 1, 2
;; Naive (buggy in languages that mutate the loop var):
;; all closures might capture the SAME i, ending at its final value.
```

In Scheme, because each iteration of a proper recursive loop binds a
*fresh* variable, this usually works correctly. But in languages with
a single mutated loop variable (older JavaScript `var`, some loop
constructs), all the closures capture the same variable and see its
final value — a notorious bug. The fix: bind a fresh variable per
iteration (JS `let`, or an explicit inner binding).

The lesson: know *what* your closures capture. If they share a mutated
variable, they see its latest value, which may not be what you
intended.

> :nerdygoose: This exact bug — "why do all my callbacks print the
> last value?" — has tripped up generations of JavaScript programmers.
> The root cause is closure semantics + a shared mutable loop
> variable. Understanding closures here (capture the binding, not the
> value) explains the bug and the fix in *any* language. Lisp teaches
> you the model; the model debugs your JavaScript.

## 6. Closures and higher-order functions together

Closures and HOFs ([Chapter 7](/lisp/part-2-functional/higher-order-functions))
combine constantly. You pass a closure to `map`/`filter` to inject
context:

```lisp
(define (scale-all factor lst)
  (map (lambda (x) (* x factor)) lst))   ; the lambda closes over factor
(scale-all 10 '(1 2 3))   ; => (10 20 30)
```

The inline lambda closes over `factor`, so `map` can apply a
factor-specific transformation. This pairing — a HOF driving the
traversal, a closure carrying the context — is the workhorse of
idiomatic functional Lisp. You'll write it dozens of times.

## 7. Closures are how Lisp stays small

Step back: closures let you build features that other languages need
*special syntax* for — objects, modules, private state, callbacks,
iterators, partial application — all from `lambda` + lexical scope. No
new language constructs required. This is the recurring Lisp theme: a
tiny core (functions + scope) that expresses what bigger languages
bake in as features.

Combined with macros ([Part IV](/lisp/part-4-macros/your-first-macro)),
closures are why Lisp can "grow to meet the problem"
([Chapter 1](/lisp/part-1-core-idea/why-lisp)) without growing its
core. The language stays small; the expressiveness comes from
composition.

> :weightliftinggoose: Closures are the capstone of the functional
> foundations. You now have the full toolkit: `lambda` makes functions
> ([Ch 5](/lisp/part-2-functional/functions-and-lambda)), recursion
> processes data ([Ch 6](/lisp/part-2-functional/recursion)), HOFs
> abstract the patterns ([Ch 7](/lisp/part-2-functional/higher-order-functions)),
> and closures carry context ([this chapter]). Practice combining
> them: a function factory that returns a closure you pass to `map`.
> When that composition feels natural, you've got the functional core.

## What we covered

- **Lexical scope**: a variable refers to its binding in the
  *textually enclosing* definition, not the call site (Scheme's
  contribution; now universal).
- A **closure** is a function plus the captured bindings of variables
  it references from its enclosing scope.
- Closures "remember" their birthplace's variables even after the
  enclosing function returns (`adder`, `multiplier`).
- Uses: function factories, **private encapsulated state**
  (`make-counter` — objects in miniature), callbacks/deferred
  computation.
- Closures capture the **variable (binding)**, not a value snapshot —
  shared mutable bindings let closures communicate.
- The loop-variable gotcha (capture-the-binding) explains a classic
  bug in every closure language.
- Closures + HOFs combine constantly: a closure carries context into
  a `map`/`filter`.
- Closures let Lisp express objects, modules, state, callbacks from a
  tiny core — no new syntax.

## What's next

That closes Part II. [Part III](/lisp/part-3-building-up/special-forms-vs-functions)
turns to the constructs you build real programs from: special forms vs
functions, `let` binding, conditionals, and iteration — the practical
plumbing on top of the functional foundations.
