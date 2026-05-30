---
sidebar_position: 1
title: "Functions and Lambda"
---

# Functions and Lambda

> Functions are the verbs of Lisp, and `lambda` is how you make one.
> First-class functions — values you can pass, return, and store —
> are the idea Lisp gave the world.

Part I gave us the core: syntax, data, evaluation. Part II builds the
**functional style** on it. We start with the most fundamental verb:
making functions. In Lisp, a function is an ordinary value, built with
`lambda`, and that simple fact reshapes everything.

## 1. Lambda: an anonymous function

`lambda` builds a function. Its shape:

```lisp
(lambda (parameters...) body...)
```

For example, a function that squares its argument:

```lisp
(lambda (x) (* x x))
```

This evaluates to a **function value** — a procedure. It has no name;
it's *anonymous*. To use it, put it in the operator position of a call:

```lisp
((lambda (x) (* x x)) 5)   ; => 25
```

Read the outer call: the operator is the lambda (a function), the
operand is `5`. Applying the function binds its parameter `x` to `5`,
then evaluates the body `(* x x)` → `25`. This is Rule 3 from
[Chapter 4](/lisp/part-1-core-idea/evaluation) with a lambda as the
operator.

> :nerdygoose: The name "lambda" comes from Alonzo Church's **lambda
> calculus** (1930s), the mathematical foundation of computation that
> predates computers. Lisp was the first language to put lambda
> calculus into practice. When you write `(lambda (x) ...)`, you're
> writing Church's λx. ... — a direct line from 1930s logic to your
> REPL.

## 2. Naming functions with define

Anonymous functions are useful, but usually you want a name. `define`
binds a name to a value — including a function value:

```lisp
(define square (lambda (x) (* x x)))
(square 5)   ; => 25
```

`square` is now a symbol bound to the function. This is so common that
Lisp provides shorthand — `define` with a parameter list defines a
function directly:

```lisp
(define (square x) (* x x))   ; sugar for the above
(square 5)   ; => 25
```

The two forms are equivalent: `(define (square x) ...)` *expands* to
`(define square (lambda (x) ...))`. The function-definition syntax is
just sugar over `lambda` + `define`. Both are everywhere in Lisp code.

## 3. Functions are first-class values

This is the pivotal idea. A function in Lisp is an ordinary value,
exactly like a number or a string. That means you can:

**Store a function in a variable:**

```lisp
(define f square)
(f 6)   ; => 36
```

**Put functions in a list:**

```lisp
(define ops (list + - * /))
((car ops) 2 3)   ; => 5   — car of ops is +, apply it
```

**Pass a function as an argument** (functions that take functions are
*higher-order* — [Chapter 7](/lisp/part-2-functional/higher-order-functions)):

```lisp
(define (apply-twice f x) (f (f x)))
(apply-twice square 3)   ; => 81   — square(square(3)) = square(9) = 81
```

**Return a function from a function** ([Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope)):

```lisp
(define (adder n) (lambda (x) (+ x n)))
(define add5 (adder 5))
(add5 10)   ; => 15
```

In languages without first-class functions, these moves are awkward or
impossible. In Lisp they're routine — and they unlock the entire
functional toolkit.

> :surprisedgoose: "First-class functions" sounds like jargon, but it
> just means *functions are values like any other*. Once that's true,
> the boundary between "code" and "data" blurs again
> ([Chapter 1](/lisp/part-1-core-idea/why-lisp)): a function is a value
> you compute with. JavaScript, Python, Rust all have this now — they
> got it from Lisp.

## 4. Multiple arguments, and none

Functions take any fixed number of parameters:

```lisp
(define (add3 a b c) (+ a b c))
(add3 1 2 3)   ; => 6

(define (greet) "hello")   ; zero parameters
(greet)        ; => "hello"
```

Many Lisps also support **variadic** functions (any number of
arguments) via a "rest" parameter. In Scheme:

```lisp
(define (my-list . args) args)   ; . args collects all arguments
(my-list 1 2 3 4)   ; => (1 2 3 4)
```

The dot before `args` says "bind `args` to the list of all remaining
arguments." (Common Lisp uses `&rest`; the idea is the same.) This is
how variadic operators like `+` work
([Chapter 1](/lisp/part-1-core-idea/why-lisp)).

## 5. The body and the return value

A function's **body** is one or more expressions. The function returns
the value of its **last** expression — there's no `return` keyword
(though some dialects allow early return). Everything is an
expression that produces a value:

```lisp
(define (describe n)
  (if (> n 0) "positive" "non-positive"))   ; the if-expression is the body
(describe 5)   ; => "positive"
```

If the body has multiple expressions, earlier ones run for their
side effects (printing, etc.) and the last one's value is returned:

```lisp
(define (noisy-square x)
  (display "squaring ")   ; side effect: print
  (display x)             ; side effect: print
  (newline)
  (* x x))                ; this value is returned
(noisy-square 4)   ; prints "squaring 4", then => 16
```

(In some Schemes, a multi-expression body is implicitly wrapped in a
`begin` — a sequencing form. The principle holds: last expression
wins.)

## 6. Lambda in the wild: passing inline functions

Because functions are values, you constantly write *inline* lambdas as
arguments to higher-order functions ([Chapter 7](/lisp/part-2-functional/higher-order-functions)).
A preview:

```lisp
(map (lambda (x) (* x x)) '(1 2 3 4))   ; => (1 4 9 16)
```

`map` applies a function to each list element. Here the function is an
inline lambda. You didn't need to `define` and name it — you wrote it
right where it's used. This is idiomatic Lisp: functions are so cheap
to make that you create them on the fly.

## 7. Pure functions and why they matter

A **pure** function depends only on its arguments and produces only a
return value — no side effects, no reading or writing external state.
`square` is pure: `(square 5)` is always `25`, no matter what else is
happening.

Pure functions are:

- **Predictable**: same input, same output, always.
- **Testable**: no setup, no teardown — just call and check.
- **Composable**: you can chain them without worrying about hidden
  interactions.
- **Parallelizable**: no shared state to race on.

Lisp doesn't *force* purity (you can print, mutate, do I/O), but the
functional style *encourages* it, and the higher-order tools
([Chapter 7](/lisp/part-2-functional/higher-order-functions)) reward
it. Much of the "enlightenment" of learning Lisp is internalizing the
habit of writing small, pure functions and composing them.

> :weightliftinggoose: The functional muscle to build: reach for a
> small pure function first. Need to transform a list? Write a
> one-argument function for one element, then `map` it. Need a
> condition? Write a predicate. Lisp makes functions so cheap to
> create — `(lambda (x) ...)` — that decomposing a problem into tiny
> functions becomes the natural move. That habit transfers to every
> language you'll ever use.

## 8. A worked example: composing functions

Let's build `compose`, which takes two functions and returns their
composition — a perfect demonstration of first-class functions:

```lisp
(define (compose f g)
  (lambda (x) (f (g x))))   ; return a new function

(define inc (lambda (n) (+ n 1)))
(define double (lambda (n) (* n 2)))

(define inc-then-double (compose double inc))
(inc-then-double 5)   ; => 12   — double(inc(5)) = double(6) = 12
```

`compose` takes two functions and *returns a new function*. The
returned lambda "remembers" `f` and `g` — that's a **closure**, the
subject of [Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope).
This four-line function would be clumsy or impossible in a language
without first-class functions; in Lisp it's natural.

## What we covered

- `lambda` builds an **anonymous function**: `(lambda (params) body)`.
- `define` names values; `(define (f x) ...)` is sugar for
  `(define f (lambda (x) ...))`.
- Functions are **first-class values**: store them, list them, pass
  them, return them.
- Functions take fixed or variadic (`. args`) parameters; the body's
  **last expression** is the return value.
- Inline lambdas are idiomatic as arguments to higher-order functions.
- **Pure functions** (no side effects) are predictable, testable,
  composable — the functional ideal Lisp encourages.
- `compose` demonstrates returning functions (a closure).

## What's next

[Chapter 6](/lisp/part-2-functional/recursion) — recursion and the
list as a recursive structure. The cons-cell picture from
[Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons) meets the
function tools from this chapter, and recursive list processing — the
soul of Lisp programming — falls out.
