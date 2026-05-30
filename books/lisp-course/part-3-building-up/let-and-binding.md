---
sidebar_position: 2
title: "let, let*, and Binding"
---

# let, let*, and Binding

> Local variables — how to name intermediate values inside an
> expression. And the lovely secret: `let` is just sugar for a lambda
> call, so you already understand it.

You often need to name an intermediate value: compute something once,
use it several times. `let` introduces **local bindings** for exactly
this. This chapter covers `let`, its siblings `let*` and `letrec`, and
reveals that `let` is `lambda` in disguise.

## 1. The problem: naming intermediate values

Without local bindings, you either recompute or nest awkwardly:

```lisp
;; Recomputing (wasteful, and ugly):
(+ (* (+ a b) (+ a b)) (* (+ a b) 2))   ; (a+b) computed three times
```

You want to name `(+ a b)` once and reuse it. That's what `let` is for.

## 2. let: parallel local bindings

`let` introduces local variables, binds them to values, and evaluates
a body with those bindings in scope:

```lisp
(let ((var1 val1)
      (var2 val2)
      ...)
  body...)
```

Rewriting the example:

```lisp
(let ((s (+ a b)))      ; bind s to (a+b), once
  (+ (* s s) (* s 2)))  ; use s three times
```

`let` binds `s` to the value of `(+ a b)`, then evaluates the body
`(+ (* s s) (* s 2))` with `s` in scope. The bindings exist *only*
inside the `let` body — they're local. Multiple bindings:

```lisp
(let ((x 10)
      (y 20))
  (+ x y))   ; => 30
```

> :nerdygoose: `let` bindings are **parallel**: all the right-hand
> sides (`val1`, `val2`, ...) are evaluated in the *outer* scope,
> before *any* of the new variables are bound. So in
> `(let ((x 1) (y x)) ...)`, the `x` in `y`'s binding refers to an
> *outer* `x`, not the `x = 1` just introduced — that one isn't
> visible yet. This trips people up; the fix is `let*` (next section).

## 3. let*: sequential bindings

`let*` is like `let`, but bindings happen **sequentially** — each can
refer to the previous ones:

```lisp
(let* ((x 10)
       (y (* x 2))    ; can use x: y = 20
       (z (+ x y)))   ; can use x and y: z = 30
  z)   ; => 30
```

With plain `let`, `(let ((x 10) (y (* x 2))) ...)` would fail or use an
outer `x`, because `x` isn't visible to `y`'s binding yet. `let*` makes
each binding visible to the next — it's the "sequential" version. Use
`let*` when later bindings depend on earlier ones; use `let` when
they're independent (it signals independence to the reader).

## 4. letrec: recursive bindings

`letrec` allows bindings that refer to *themselves* or *each other* —
needed for local recursive functions:

```lisp
(letrec ((even? (lambda (n) (if (= n 0) #t  (odd?  (- n 1)))))
         (odd?  (lambda (n) (if (= n 0) #f  (even? (- n 1))))))
  (even? 10))   ; => #t
```

Here `even?` and `odd?` are mutually recursive — each refers to the
other. `letrec` makes all the names visible to all the binding
expressions, enabling the mutual reference. (Plain `let`/`let*`
wouldn't let `even?` see `odd?`.) Most of the time `let`/`let*`
suffice; reach for `letrec` for local recursion.

## 5. The secret: let is sugar for a lambda call

Here's the beautiful part. `let` isn't really a primitive — it's
**sugar for immediately calling a lambda**. These two are equivalent:

```lisp
(let ((x 10)
      (y 20))
  (+ x y))

;; is exactly:

((lambda (x y)   ; a lambda with parameters x, y
   (+ x y))      ; whose body is the let body
 10 20)          ; called with the binding values as arguments
```

Read the second form: build a function of `x` and `y` whose body is
`(+ x y)`, then *immediately call it* with `10` and `20`. Binding `x`
to `10` and `y` to `20` is exactly what `let` does! The local
variables of `let` are just the *parameters* of an immediately-invoked
lambda.

This explains the parallel-binding behavior (§2): function arguments
are all evaluated before the function is called, in the outer scope —
so `let`'s right-hand sides are evaluated before the parameters bind.
It's not an arbitrary rule; it falls out of `let` being a lambda call.

> :surprisedgoose: `let` is `lambda`. Once you see this, `let` stops
> being a separate thing to learn — it's the function-call mechanism
> you already know ([Chapter 5](/lisp/part-2-functional/functions-and-lambda)),
> dressed up for convenience. In fact, in the Part V interpreter
> ([Chapter 19](/lisp/part-5-metacircular/adding-special-forms)), you
> can implement `let` as a macro that rewrites to a lambda call — no
> new evaluator support needed. This is Lisp's economy: powerful
> features as thin sugar over a tiny core.

## 6. Binding vs assignment: let vs set!

Important distinction:

- **Binding** (`let`, `lambda` parameters, `define`): introduces a
  *new* variable with an initial value.
- **Assignment** (`set!`): changes the value of an *existing* variable.

```lisp
(define x 10)     ; bind x to 10
(set! x 20)       ; assign: now x is 20
```

The functional style ([Chapter 5](/lisp/part-2-functional/functions-and-lambda))
prefers binding over assignment — introduce new names rather than
mutate old ones. `set!` exists (and is sometimes the cleanest tool,
e.g. the counter in [Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope)),
but heavy `set!` use is a sign you're writing imperative code in Lisp's
clothing. Prefer `let` to name intermediate values; reserve `set!` for
genuine state.

The `!` in `set!` is a Scheme convention: names ending in `!` mutate
state (`set!`, `vector-set!`). Names ending in `?` are predicates
(`null?`, `even?`). These conventions make code self-documenting.

## 7. Nested and shadowing

`let` bindings nest, and inner bindings **shadow** outer ones of the
same name:

```lisp
(let ((x 1))
  (let ((x 2))    ; inner x shadows outer x
    (display x))  ; prints 2
  (display x))    ; prints 1 — outer x, unaffected
```

The inner `x = 2` is visible only in the inner `let` body; outside it,
`x` is again `1`. This is lexical scope
([Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope)) at
work — the textually-innermost binding wins. Shadowing is normal and
safe; each `let` carves out its own scope.

## 8. Practical use: structure with let

`let` is how you structure a computation readably — name the parts,
then combine them:

```lisp
(define (quadratic-roots a b c)
  (let* ((disc (- (* b b) (* 4 a c)))   ; discriminant
         (sqrt-disc (sqrt disc))
         (denom (* 2 a)))
    (list (/ (+ (- b) sqrt-disc) denom)    ; root 1
          (/ (- (- b) sqrt-disc) denom))))  ; root 2
(quadratic-roots 1 -3 2)   ; => (2 1)
```

`let*` names the discriminant, its square root, and the denominator —
each used twice — making the formula readable and avoiding
recomputation. This is the everyday use of `let`: give names to the
pieces of a computation. Compare to cramming it all into one
unreadable nested expression.

> :weightliftinggoose: Reach for `let`/`let*` to name intermediate
> values — it's the difference between readable and write-only code.
> Rule of thumb: if a sub-expression appears twice, or if a name would
> clarify what a value *means*, bind it with `let`. And remember the
> secret — `let` is a lambda call — so it costs you nothing
> conceptually beyond what you already know. Prefer binding (`let`)
> over mutation (`set!`).

## What we covered

- `let` introduces **local bindings**: `(let ((var val) ...) body)` —
  scoped to the body.
- `let` bindings are **parallel** (RHS evaluated in the outer scope);
  `let*` is **sequential** (each binding sees the previous); `letrec`
  allows **recursive/mutual** references.
- **The secret**: `let` is sugar for immediately calling a `lambda`
  with the values as arguments — it's the function-call mechanism you
  already know.
- **Binding** (`let`, `define`, params) introduces new variables;
  **assignment** (`set!`) mutates existing ones. Prefer binding.
- Scheme conventions: `!` = mutates, `?` = predicate.
- Inner bindings **shadow** outer ones (lexical scope).
- Everyday use: name the pieces of a computation with `let*` for
  readability and to avoid recomputation.

## What's next

[Chapter 11](/lisp/part-3-building-up/conditionals) — conditionals:
`if`, `cond`, `when`, `unless`. The full toolkit for branching, when
to use each, and why they're expressions that return values, not
statements.
