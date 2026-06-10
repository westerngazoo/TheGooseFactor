---
sidebar_position: 2
title: "Writing a Lisp Interpreter in Lisp"
---

# Writing a Lisp Interpreter in Lisp

> The page of code that is the whole language. We assemble `eval`,
> `apply`, the predicates, the selectors, and the primitives into a
> complete, running Lisp interpreter — written in Lisp.

This is the chapter to do with your hands on the keyboard. We'll build
a working interpreter for a core Lisp. It's long only because we spell
everything out; the essential content is `eval` and `apply` from
[Chapter 17](/lisp/part-5-metacircular/eval-and-apply), fleshed out.

## 1. The expression classifiers

`eval` dispatches on what kind of expression it sees. We need
predicates to classify, and selectors (just `car`/`cdr`) to take apart.

```lisp
;; Self-evaluating: numbers and strings
(define (self-evaluating? expr)
  (or (number? expr) (string? expr)))

;; Variable: a symbol
(define (variable? expr) (symbol? expr))

;; A tagged list: (tag ...)? Helper for recognizing special forms.
(define (tagged-list? expr tag)
  (and (pair? expr) (eq? (car expr) tag)))

;; The special forms, recognized by their leading symbol:
(define (quoted? expr)     (tagged-list? expr 'quote))
(define (if? expr)         (tagged-list? expr 'if))
(define (lambda? expr)     (tagged-list? expr 'lambda))
(define (definition? expr) (tagged-list? expr 'define))

;; Anything else that's a list is a function application:
(define (application? expr) (pair? expr))
```

Each special form is "a list whose first element is the form's
keyword." `(if ...)` is recognized by `(eq? (car expr) 'if)`. This is
[Chapter 9](/lisp/part-3-building-up/special-forms-vs-functions)'s
dispatch, in code.

## 2. The selectors

Selectors pull the parts out of each expression type — pure
`car`/`cdr` ([Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons)):

```lisp
;; quote: (quote X) → X
(define (quoted-value expr) (cadr expr))

;; if: (if test then else)
(define (if-test expr)   (cadr expr))
(define (if-then expr)   (caddr expr))
(define (if-else expr)   (cadddr expr))

;; lambda: (lambda (params...) body)
(define (lambda-params expr) (cadr expr))
(define (lambda-body expr)   (caddr expr))

;; define: (define name value)
(define (define-name expr)  (cadr expr))
(define (define-value expr) (caddr expr))

;; application: (operator operand...)
(define (operator expr) (car expr))
(define (operands expr) (cdr expr))
```

Naming the selectors (instead of writing `cadr` everywhere) makes
`eval` read like the rules it implements. This is good style — and it
means if we change the representation later, only the selectors change.

## 3. eval

Now the centerpiece — `eval`, the giant `cond` from
[Chapter 17](/lisp/part-5-metacircular/eval-and-apply):

```lisp
(define (my-eval expr env)
  (cond
    ;; --- self-evaluating ---
    ((self-evaluating? expr) expr)
    ;; --- variable lookup ---
    ((variable? expr) (env-lookup expr env))
    ;; --- special forms ---
    ((quoted? expr) (quoted-value expr))
    ((if? expr)
     (if (my-eval (if-test expr) env)        ; evaluate the test
         (my-eval (if-then expr) env)        ; then OR
         (my-eval (if-else expr) env)))      ; else — only ONE runs
    ((lambda? expr)
     (make-procedure (lambda-params expr)    ; build a closure:
                     (lambda-body expr)      ; params + body +
                     env))                    ; the DEFINING env
    ((definition? expr)
     (env-define! (define-name expr)
                  (my-eval (define-value expr) env)
                  env))
    ;; --- function application (the default) ---
    ((application? expr)
     (my-apply (my-eval (operator expr) env)            ; eval the operator
               (map (lambda (a) (my-eval a env))        ; eval each operand
                    (operands expr))))
    (else (error "Unknown expression type" expr))))
```

Read each clause against [Chapter 4](/lisp/part-1-core-idea/evaluation)'s
rules. Self-evaluating returns itself. Variable looks up. `quote`
returns its datum unevaluated. `if` evaluates the test and *only one*
branch (note: we use the host `if` to choose — bootstrapping on the
outer Lisp). `lambda` builds a closure capturing `env`. `define` binds.
And the catch-all: evaluate operator and operands, call `my-apply`.

We name it `my-eval` to avoid clashing with the host Lisp's built-in
`eval`.

## 4. apply

`my-apply` runs a procedure on evaluated arguments — primitives
directly, compound procedures by evaluating their body in an extended
environment:

```lisp
(define (my-apply proc args)
  (cond
    ((primitive? proc)
     (apply-primitive proc args))            ; run the built-in
    ((compound? proc)
     (my-eval (procedure-body proc)          ; evaluate the body
              (extend-env (procedure-params proc)  ; in a new scope:
                          args                      ; params ↦ args
                          (procedure-env proc))))   ; over the closure's env
    (else (error "Not a procedure" proc))))
```

The compound case is the closure mechanism
([Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope)): we
extend `(procedure-env proc)` — the environment captured when the
lambda was *defined* — not the caller's environment. That's lexical
scope, implemented in one line.

## 5. Procedures (closures) as data

How is a compound procedure represented? As a tagged list bundling its
parameters, body, and defining environment:

```lisp
(define (make-procedure params body env)
  (list 'procedure params body env))         ; tag + the three parts

(define (compound? proc) (tagged-list? proc 'procedure))
(define (procedure-params proc) (cadr proc))
(define (procedure-body proc)   (caddr proc))
(define (procedure-env proc)    (cadddr proc))
```

A closure is *literally* a four-element list: the tag `procedure`, the
parameter list, the body, and the captured environment. This makes the
abstract idea of "function + captured environment" concrete — it's just
a list ([Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons)). When
`apply` runs it, it pulls out the body and env and evaluates.

## 6. Primitives: bottoming out

The recursion has to stop somewhere — at **primitive procedures**, the
built-ins we borrow from the host Lisp:

```lisp
(define (make-primitive impl) (list 'primitive impl))
(define (primitive? proc) (tagged-list? proc 'primitive))
(define (apply-primitive proc args)
  (apply (cadr proc) args))                  ; use the HOST apply on the impl

;; The initial global environment binds primitive symbols:
(define (make-global-env)
  (extend-env '(+ - * / = < > car cdr cons null?)
              (list (make-primitive +)  (make-primitive -)
                    (make-primitive *)  (make-primitive /)
                    (make-primitive =)  (make-primitive <)
                    (make-primitive >)  (make-primitive car)
                    (make-primitive cdr) (make-primitive cons)
                    (make-primitive null?))
              (empty-env)))
```

The primitives are where our interpreter "cashes out" to the host
Lisp's real `+`, `car`, etc. (`apply-primitive` uses the *host's*
`apply`.) Everything else — `if`, `lambda`, recursion, user functions —
our `my-eval`/`my-apply` handle. The primitives are the foundation the
metacircular evaluator is bootstrapped on
([Chapter 17 §3](/lisp/part-5-metacircular/eval-and-apply)).

## 7. The environment (preview)

We've used `env-lookup`, `env-define!`, `extend-env`, `empty-env`
without defining them — that's [Chapter 20](/lisp/part-5-metacircular/the-environment-model)'s
job. For now, the interface: an environment maps symbols to values;
`env-lookup` finds a symbol's value (searching outward through scopes),
`extend-env` makes a new scope with added bindings, `env-define!` adds
a binding. A simple implementation is a list of frames, each frame an
alist of `(symbol . value)` pairs — built from cons cells, naturally.

## 8. Running it

With all the pieces, we can run programs through our interpreter:

```lisp
(define genv (make-global-env))

(my-eval '(+ 1 2) genv)                    ; => 3
(my-eval '((lambda (x) (* x x)) 5) genv)   ; => 25
(my-eval '(if (> 3 2) 'yes 'no) genv)      ; => yes

;; Define and call a recursive function THROUGH our interpreter.
;; Our toy `define` handles the (define name value) form, so we bind
;; `fact` to an explicit lambda (the closure captures genv, so the
;; recursive self-reference resolves):
(my-eval '(define fact
            (lambda (n) (if (= n 0) 1 (* n (fact (- n 1))))))
         genv)
(my-eval '(fact 5) genv)                   ; => 120
```

**That last one is the payoff.** A recursive factorial, defined and
executed by *your* `eval` — not the host Lisp's. Our page of code is a
working Lisp. The recursion, the closure capturing `fact`, the special
forms — all handled by the `cond` clauses you wrote.

> :surprisedgoose: Step back and look at what you've built. Sections
> 1–7 — predicates, selectors, eval, apply, procedures, primitives —
> total well under a hundred lines, and most of it is mechanical
> selectors. The *conceptual* core is `my-eval` (one `cond`) and
> `my-apply` (one `cond`). That's the whole language. You can now
> answer "how does Lisp run my code?" because you wrote the thing that
> runs it. This is the moment the course has been building toward.

## 9. What you can now do

Because you have the evaluator, you have power over the language:

- **Add special forms**: a new `cond` clause in `my-eval`
  ([Chapter 19](/lisp/part-5-metacircular/adding-special-forms)).
- **Change evaluation order**: make arguments lazy (evaluate on
  demand) by changing how `application?` handles operands → you've
  built a lazy language.
- **Change scope rules**: extend the caller's env instead of the
  closure's env → dynamic scope instead of lexical.
- **Add tracing, debugging, sandboxing**: instrument `my-eval`.

The interpreter is a lever: small changes to it change the entire
language it interprets. Understanding it is understanding — and
controlling — computation.

> :weightliftinggoose: If you do *one* exercise in this whole course,
> do this: type this interpreter in, get `(fact 5)` running through
> your own `my-eval`, then *modify* it — add a `cond` special form, or
> make it print every expression it evaluates (a tracer). Feeling the
> language bend to a few lines of your code is the deepest
> understanding programming offers. Don't skip the keyboard.

## What we covered

- **Classifiers** (`self-evaluating?`, `variable?`, `if?`, `lambda?`,
  ...) dispatch by expression type; **selectors** (`car`/`cdr` combos)
  take expressions apart.
- **`my-eval`** is a giant `cond`: each clause implements one
  evaluation rule; the catch-all is function application → `my-apply`.
- **`my-apply`** runs primitives directly and compound procedures by
  evaluating the body in the **closure's** extended environment
  (lexical scope).
- A **compound procedure is a tagged list** `(procedure params body
  env)` — closures made concrete.
- **Primitives** bottom out the recursion, borrowing the host Lisp's
  `+`, `car`, etc.
- The interpreter **runs**: it evaluates arithmetic, lambdas, `if`,
  and recursive functions like `fact` — a working Lisp in a page.
- The evaluator is a **lever**: small changes (lazy args, dynamic
  scope, tracing) reshape the whole language.

## What's next

[Chapter 19](/lisp/part-5-metacircular/adding-special-forms) — adding
special forms. We extend the interpreter with `cond`, `let`, `and`/`or`
— and see firsthand how trivially the language grows when you control
the evaluator.
