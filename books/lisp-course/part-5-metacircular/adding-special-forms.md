---
sidebar_position: 3
title: "Adding Special Forms"
---

# Adding Special Forms

> Extending the interpreter with `cond`, `let`, and `and`/`or` — and
> seeing firsthand how trivially the language grows when you control
> the evaluator.

You have a working interpreter ([Chapter 18](/lisp/part-5-metacircular/writing-an-interpreter)).
Now we grow it. Adding a special form is adding a `cond` clause to
`my-eval`. This chapter does several, illustrating two routes — direct
implementation and *desugaring* — and reinforcing why
[Chapter 9](/lisp/part-3-building-up/special-forms-vs-functions)'s line
between syntax and library is so blurry.

## 1. Two routes to a new form

When adding a construct, you choose:

1. **Direct**: add a `cond` clause in `my-eval` with custom evaluation
   logic (a true new primitive special form).
2. **Desugar**: rewrite the new form into *existing* forms before
   evaluating — the form is "syntactic sugar," not a new primitive.

Desugaring is usually preferable: it keeps the evaluator's core small
and defines the new form in terms of what's already there. This is
exactly what macros do ([Part IV](/lisp/part-4-macros/your-first-macro))
— and indeed, in a real Lisp these forms *are* macros. Here we do it
inside the interpreter to see the mechanics.

## 2. Adding cond (by desugaring to if)

`cond` ([Chapter 11](/lisp/part-3-building-up/conditionals)) is
multi-way branching. Rather than evaluate it directly, we **desugar**
it to nested `if`s, then evaluate the result:

```lisp
;; (cond (t1 e1) (t2 e2) ... (else en))
;;   becomes
;; (if t1 e1 (if t2 e2 (... en)))

(define (cond->if clauses)
  (if (null? clauses)
      #f                                      ; no clause matched
      (let ((clause (car clauses)))
        (if (eq? (car clause) 'else)
            (cadr clause)                      ; else: just its body
            (list 'if (car clause)             ; (if test
                  (cadr clause)                ;     then
                  (cond->if (cdr clauses))))))) ; else: recurse on rest
```

Then one clause in `my-eval`:

```lisp
((tagged-list? expr 'cond)
 (my-eval (cond->if (cdr expr)) env))   ; desugar, then evaluate
```

`cond->if` recursively builds nested `if` code
([Chapter 6](/lisp/part-2-functional/recursion) tree-building with
`list`), and we hand it back to `my-eval`. `cond` cost us a small
recursive helper and one clause — no new evaluation logic, because it
reduces to `if` which we already have.

> :surprisedgoose: `cond->if` *generates code* — it takes the `cond`
> clauses and produces an `if`-tree, which `my-eval` then runs. That's
> a macro, written inside the interpreter. The line between "the
> interpreter handles this form" and "this form is a macro that
> rewrites to simpler forms" has vanished. This is
> [Chapter 9](/lisp/part-3-building-up/special-forms-vs-functions)'s
> point, demonstrated: `cond` is sugar over `if`, and you can see
> exactly how.

## 3. Adding let (by desugaring to lambda)

[Chapter 10](/lisp/part-3-building-up/let-and-binding) revealed `let`
is sugar for a lambda call. We implement exactly that:

```lisp
;; (let ((v1 e1) (v2 e2)) body)
;;   becomes
;; ((lambda (v1 v2) body) e1 e2)

(define (let->lambda expr)
  (let ((bindings (cadr expr))
        (body (caddr expr)))
    (cons (list 'lambda
                (map car bindings)     ; the variables → lambda params
                body)
          (map cadr bindings))))        ; the values → call arguments
```

And the `my-eval` clause:

```lisp
((tagged-list? expr 'let)
 (my-eval (let->lambda expr) env))   ; desugar to a lambda call, evaluate
```

`let->lambda` turns `(let ((x 1) (y 2)) body)` into `((lambda (x y)
body) 1 2)`. Since `my-eval` already handles `lambda` and application,
`let` needs no new evaluation logic at all — it's pure rewriting. The
[Chapter 10](/lisp/part-3-building-up/let-and-binding) secret, made
concrete: `let` literally *is* a lambda call to the evaluator.

## 4. Adding and / or (direct, for short-circuiting)

`and`/`or` ([Chapter 9](/lisp/part-3-building-up/special-forms-vs-functions))
short-circuit, so they need custom evaluation logic — they can't just
desugar to a function call (that would evaluate everything). We add
them directly:

```lisp
((tagged-list? expr 'and)
 (eval-and (cdr expr) env))
((tagged-list? expr 'or)
 (eval-or (cdr expr) env))

(define (eval-and exprs env)
  (cond ((null? exprs) #t)                      ; (and) => #t
        ((null? (cdr exprs)) (my-eval (car exprs) env))  ; last one
        ((my-eval (car exprs) env)              ; this one true?
         (eval-and (cdr exprs) env))            ; → check the rest
        (else #f)))                             ; false → stop, return #f

(define (eval-or exprs env)
  (cond ((null? exprs) #f)                      ; (or) => #f
        (else (let ((v (my-eval (car exprs) env)))
                (if v v                         ; first true → return it
                    (eval-or (cdr exprs) env)))))) ; else check the rest
```

`eval-and` evaluates expressions left to right, stopping (without
evaluating the rest) as soon as one is false. This is genuine
short-circuiting — only possible because we control evaluation
expression-by-expression in the interpreter. It *can't* be desugared to
`if` as cleanly while preserving the "return the actual value" and
variadic behavior, so direct implementation is natural here.

## 5. Adding begin (sequencing)

`begin` evaluates several expressions in order, returning the last —
useful for side-effecting sequences:

```lisp
((tagged-list? expr 'begin)
 (eval-sequence (cdr expr) env))

(define (eval-sequence exprs env)
  (cond ((null? exprs) 'done)
        ((null? (cdr exprs)) (my-eval (car exprs) env))  ; last: return it
        (else (my-eval (car exprs) env)                  ; run for effect
              (eval-sequence (cdr exprs) env))))          ; recurse
```

`eval-sequence` evaluates all but the last for side effects, returning
the last expression's value. With `begin` in hand, lambda bodies can
have multiple expressions (wrap the body in an implicit `begin`) — a
small extension that makes the language more usable.

## 6. How easy that was

Look at what we just did: added `cond`, `let`, `and`, `or`, `begin` —
five constructs — and *none* required deep changes. Two were pure
desugaring (a rewrite helper + one clause). Three were small direct
evaluators. The core `my-eval`/`my-apply` from
[Chapter 18](/lisp/part-5-metacircular/writing-an-interpreter) didn't
change at all; we only *added clauses*.

This is the power of controlling the evaluator. In a language where you
*can't* touch the evaluator, adding a new control construct is
impossible — you wait for the language designers. In Lisp, with the
metacircular evaluator (or, in real life, with macros), *you* are the
language designer. Want a `while` loop? A pattern-matcher? A new
binding form? Add a clause or write a macro.

> :nerdygoose: This is why the same five forms (`cond`, `let`, `and`,
> `or`, `begin`) are, in real Lisps, sometimes primitives and
> sometimes macros — and you literally cannot tell which from using
> them. We implemented them as interpreter clauses; a real Lisp might
> implement them as macros over `if`/`lambda`. Either way, the *core*
> is tiny (`if`, `lambda`, `quote`, `define`, application) and
> everything else is built on top. The minimal core + extensions is
> Lisp's architectural signature.

## 7. The lazy-evaluation experiment

To feel the evaluator's power, consider one radical change. Right now,
function application evaluates all operands before calling
([Chapter 18 §3](/lisp/part-5-metacircular/writing-an-interpreter)) —
*applicative order*. Change that single clause to *delay* operand
evaluation (wrap each in a "thunk" evaluated on demand), and you've
built a **lazy** language — like Haskell — where arguments are only
evaluated if actually used.

That's a deep semantic change (eager → lazy) achieved by editing *one
part of one function*. You don't get this leverage anywhere but at the
evaluator. The metacircular evaluator isn't just pedagogy — it's the
seat of control over what the language *is*.

## 8. Exercises

Extend your interpreter:

1. **`when` and `unless`** — desugar to `if` (like `cond`). One helper
   each, one clause each.
2. **`let*`** — desugar to nested `let`s
   ([Chapter 10](/lisp/part-3-building-up/let-and-binding)).
3. **A `while` loop** — `(while test body)` that evaluates `body`
   repeatedly while `test` is true. (Direct, using recursion in the
   evaluator.)
4. **A tracer** — make `my-eval` print each expression before
   evaluating it, with indentation by recursion depth. Watch your
   programs run.

Each is a small, satisfying extension. The tracer especially is
illuminating — you *see* the eval/apply cycle
([Chapter 17](/lisp/part-5-metacircular/eval-and-apply)) walk your
program.

> :weightliftinggoose: Adding special forms is where you go from
> *understanding* the evaluator to *owning* it. Do the exercises —
> especially `while` (a construct that doesn't exist in the core, that
> you bring into being) and the tracer (which makes evaluation
> visible). When you've added a loop to a language that didn't have
> one, by writing five lines, you understand viscerally why Lispers
> say the language is clay, not stone.

## What we covered

- Two routes to a new form: **direct** (custom `cond` clause) or
  **desugar** (rewrite to existing forms) — desugaring keeps the core
  small.
- **`cond`** desugars to nested `if`s (a code-generating helper +
  one clause) — a macro written inside the interpreter.
- **`let`** desugars to a `lambda` call — the
  [Chapter 10](/lisp/part-3-building-up/let-and-binding) secret made
  concrete; no new eval logic.
- **`and`/`or`** need direct implementation for short-circuiting
  (evaluate expression-by-expression, stop early).
- **`begin`** sequences expressions, returning the last.
- Adding five forms required *only added clauses* — the core
  `eval`/`apply` was untouched. You are the language designer.
- A one-clause change (delay operands) turns the language **lazy** —
  the evaluator is the seat of semantic control.

## What's next

[Chapter 20](/lisp/part-5-metacircular/the-environment-model) — the
environment model. We've used `env-lookup`, `extend-env`, etc. as a
black box; now we open it. How variable lookup, scope, and closures
actually work in the data structure — completing the interpreter.
