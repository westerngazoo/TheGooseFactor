---
sidebar_position: 1
title: "Appendix A — Cheat Sheet: The Core Forms"
---

# Appendix A — Cheat Sheet

The core Lisp forms at a glance. Scheme-flavored syntax (the course's
default); dialect differences noted where relevant.

## Evaluation rules

| Expression | Evaluates to |
|---|---|
| `42`, `"hi"`, `#t` | itself (self-evaluating) |
| `x` (symbol) | its value in the environment (lookup) |
| `(f a b)` | call: eval all, apply `f` to results |
| special form | its own rule (below) |

## Data: cons cells and lists

```lisp
(cons 1 2)        ; => (1 . 2)        — a pair
(cons 1 '(2 3))   ; => (1 2 3)        — prepend
(car '(1 2 3))    ; => 1              — first
(cdr '(1 2 3))    ; => (2 3)          — rest
(cadr '(1 2 3))   ; => 2              — second (car of cdr)
'()               ; the empty list
(null? '())       ; => #t            — empty test
(list 1 2 3)      ; => (1 2 3)        — build a list
(pair? '(1))      ; => #t            — is it a cons cell?
```

## Quoting (code as data)

```lisp
'(+ 1 2)          ; => (+ 1 2)        — quote: data, unevaluated
`(a ,x b)         ; quasiquote with unquote: a, x's value, b
`(a ,@xs b)       ; unquote-splicing: splice xs' elements
(quote x)         ; => x             — ' is shorthand for quote
```

## Defining and binding

```lisp
(define x 10)              ; bind x to 10
(define (sq x) (* x x))    ; define a function
(set! x 20)                ; assign (mutate existing binding)

(let ((a 1) (b 2)) ...)    ; parallel local bindings
(let* ((a 1) (b a)) ...)   ; sequential (b can use a)
(letrec ((f ...) (g ...))) ; recursive/mutual bindings
```

## Functions

```lisp
(lambda (x) (* x x))       ; anonymous function
((lambda (x) (* x x)) 5)   ; => 25  — call it inline
(define (f . args) args)   ; variadic: args = list of all arguments
```

## Conditionals

```lisp
(if test then else)        ; two-way (returns a value)

(cond (test1 result1)      ; multi-way
      (test2 result2)
      (else default))

(when test body...)        ; one-armed (if true)
(unless test body...)      ; one-armed (if false)

(case x ((1 2) "low") ((3 4) "high") (else "?"))  ; dispatch on value

(and a b c)                ; short-circuit AND (first false / last)
(or a b c)                 ; short-circuit OR  (first true / last)
```

Truth: only `#f` is false in Scheme (`0` and `()` are **true**!);
`nil`=`()`=false in Common Lisp; `false`+`nil` false in Clojure.

## Higher-order functions

```lisp
(map f lst)                ; transform each element
(filter pred lst)          ; keep elements passing pred
(reduce f init lst)        ; collapse to one value (fold)
(for-each f lst)           ; apply f for side effects
(sort lst <)               ; sort with a comparison function
```

## Recursion skeleton (list processing)

```lisp
(define (process lst)
  (if (null? lst)
      base-value                       ; base case: empty list
      (combine (car lst)               ; first element
               (process (cdr lst)))))  ; recurse on the rest
```

Tail-recursive (constant stack) with an accumulator:

```lisp
(define (process lst acc)
  (if (null? lst)
      acc
      (process (cdr lst) (combine acc (car lst)))))  ; tail call
```

Named `let` (iteration):

```lisp
(let loop ((i 0) (acc 0))
  (if (= i 10) acc (loop (+ i 1) (+ acc i))))
```

## Macros

```lisp
;; Common Lisp style (procedural, manual hygiene):
(defmacro unless (test body)
  `(if (not ,test) ,body))

;; Scheme style (pattern-based, hygienic):
(define-syntax unless
  (syntax-rules ()
    ((unless test body) (if (not test) body))))

(macroexpand-1 '(unless x y))   ; see the expansion
(gensym)                         ; fresh unique symbol (avoid capture)
```

## The interpreter core (metacircular)

```lisp
(define (my-eval expr env)
  (cond ((self-evaluating? expr) expr)
        ((variable? expr) (env-lookup expr env))
        ((quoted? expr) (cadr expr))
        ((if? expr) (if (my-eval (if-test expr) env)
                        (my-eval (if-then expr) env)
                        (my-eval (if-else expr) env)))
        ((lambda? expr) (make-procedure ...))
        ((definition? expr) (env-define! ...))
        ((application? expr)
         (my-apply (my-eval (operator expr) env)
                   (map (lambda (a) (my-eval a env)) (operands expr))))
        (else (error "unknown" expr))))

(define (my-apply proc args)
  (cond ((primitive? proc) (apply-primitive proc args))
        ((compound? proc)
         (my-eval (procedure-body proc)
                  (extend-env (procedure-params proc) args
                              (procedure-env proc))))
        (else (error "not a procedure" proc))))
```

## Naming conventions (Scheme)

| Suffix | Meaning | Example |
|---|---|---|
| `?` | predicate (returns boolean) | `null?`, `even?`, `pair?` |
| `!` | mutates state | `set!`, `vector-set!` |
| `->` | converts | `symbol->string`, `list->vector` |

## The REPL

```
Read  → parse text to S-expression
Eval  → evaluate to a value
Print → display the value
Loop  → repeat
```

Keep one open; define-test-redefine; `macroexpand` your macros;
explore data interactively.
