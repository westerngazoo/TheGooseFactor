---
sidebar_position: 1
title: "eval and apply"
---

# eval and apply

> The two functions at the heart of every Lisp. `eval` evaluates an
> expression; `apply` applies a procedure to arguments. They call each
> other, and together they *are* the language. This chapter sets up
> the summit of the course.

[Chapter 4](/lisp/part-1-core-idea/evaluation) described evaluation
informally and hinted that underneath, two mutually-recursive functions
do all the work: `eval` and `apply`. Part V makes them concrete — you
will *write them*. This chapter explains the two functions and the
"metacircular" idea before we build the interpreter in
[Chapter 18](/lisp/part-5-metacircular/writing-an-interpreter).

## 1. The two halves of evaluation

Recall the evaluation rules ([Chapter 4](/lisp/part-1-core-idea/evaluation)):

- Self-evaluating atoms → themselves.
- Symbols → their value (look up in the environment).
- Lists (function calls) → evaluate all parts, apply the first to the
  rest.
- Special forms → their own rules.

These split cleanly into two responsibilities:

- **`eval`** takes an *expression* and an *environment*, and returns a
  value. It handles the "what kind of expression is this?" dispatch:
  atom, symbol, special form, or function call.
- **`apply`** takes a *procedure* and a list of *evaluated arguments*,
  and runs the procedure. It handles "given a function and its
  arguments, produce the result."

When `eval` encounters a function call, it evaluates the operator and
operands (calling itself recursively), then hands off to `apply`. When
`apply` runs a user-defined procedure, it evaluates the procedure's
body (calling `eval`). They're mutually recursive.

## 2. The eval/apply cycle

The dance:

```
eval(expr, env):
  - if expr is self-evaluating  → return it
  - if expr is a symbol         → look it up in env
  - if expr is a special form   → apply that form's rule
  - otherwise (function call):
      proc = eval(operator, env)
      args = map (λ a. eval(a, env)) operands
      → return apply(proc, args)        ◀── hands off to apply

apply(proc, args):
  - if proc is a primitive (built-in) → run it on args
  - if proc is a user lambda:
      env2 = extend proc's environment, binding params to args
      → return eval(proc's body, env2)  ◀── hands back to eval
```

`eval` calls `apply` (to run a function call); `apply` calls `eval`
(to run the function's body). This loop *is* the interpreter. Every
expression's value comes from walking this cycle until it bottoms out
at self-evaluating atoms and primitive procedures.

> :nerdygoose: This eval/apply mutual recursion was first written down
> by John McCarthy in his 1960 paper "Recursive Functions of Symbolic
> Expressions and Their Computation by Machine" — the paper that
> introduced Lisp. He wrote `eval` to *define* the language
> mathematically, as a specification. Then Steve Russell realized
> `eval` could be *implemented* and ran it — turning the specification
> into the first Lisp interpreter. The definition and the
> implementation are the same thing. That's the metacircular magic.

## 3. What "metacircular" means

A **metacircular evaluator** is an interpreter for a language, written
*in that same language*. We'll write a Lisp interpreter in Lisp.

"Meta" because it's a program that runs programs (operates one level
up). "Circular" because the language being interpreted and the
language doing the interpreting are the same — `eval` is defined using
the very features it implements.

Isn't that circular reasoning? Not quite. The *outer* Lisp (the one
running our interpreter) provides the base — its own `cons`, `car`,
`if`, etc. Our interpreter *defines* the *inner* Lisp's semantics in
terms of that base. It's like defining a word using simpler words: not
circular, just *bootstrapped* on a foundation.

## 4. Why write an interpreter?

Building the metacircular evaluator is the traditional climax of a
Lisp education (it's the centerpiece of SICP, Chapter 4). Why?

- **It demystifies evaluation.** "How does the computer run my code?"
  stops being magic when you've written the thing that runs it.
- **It makes the Part I rules concrete.** Every rule from
  [Chapter 4](/lisp/part-1-core-idea/evaluation) becomes a branch in
  your `eval`. The informal becomes formal.
- **It's astonishingly small.** A working Lisp interpreter is about a
  page of code. The whole language fits in your head.
- **It reveals design choices.** Want lazy evaluation? Dynamic scope?
  New special forms? You change a few lines of `eval` and the language
  changes. Understanding the evaluator is power over the language.

> :surprisedgoose: The famous reaction to writing your first
> metacircular evaluator: "*That's it? That's the whole language?*"
> Yes. The thing that felt like a mysterious black box — the
> interpreter — is a page of code you now understand completely. This
> is the enlightenment [Chapter 1](/lisp/part-1-core-idea/why-lisp)
> promised. Few moments in programming education match it.

## 5. The pieces we'll need

To write `eval` and `apply` ([Chapter 18](/lisp/part-5-metacircular/writing-an-interpreter)),
we need a handful of supporting pieces:

- **Predicates to classify expressions**: is it a number? a symbol? a
  particular special form? (e.g., `(self-evaluating? expr)`,
  `(variable? expr)`, `(if? expr)`).
- **Selectors to take expressions apart**: get the operator, the
  operands, the `if`-test, the lambda-body. (Just `car`/`cdr`
  combinations — [Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons).)
- **An environment representation**: a structure mapping symbols to
  values, with lookup and extension
  ([Chapter 20](/lisp/part-5-metacircular/the-environment-model)).
- **Primitive procedures**: the built-ins (`+`, `car`, `cons`, ...)
  that bottom out the recursion.

These are all things you can build with the tools from Parts I–III:
lists, recursion, predicates. The interpreter is "just" a recursive
function over S-expressions ([Chapter 6](/lisp/part-2-functional/recursion)'s
tree recursion) — fitting, since code *is* a tree of S-expressions.

## 6. eval is a giant cond

Concretely, `eval` will be a big `cond`
([Chapter 11](/lisp/part-3-building-up/conditionals)) dispatching on
the expression type:

```lisp
(define (eval expr env)
  (cond ((self-evaluating? expr) expr)
        ((variable? expr) (lookup expr env))
        ((quoted? expr) (quoted-value expr))
        ((if? expr) (eval-if expr env))
        ((lambda? expr) (make-procedure expr env))
        ((definition? expr) (eval-define expr env))
        ;; ... more special forms ...
        ((application? expr)               ; a function call
         (apply (eval (operator expr) env)
                (map (lambda (a) (eval a env)) (operands expr))))
        (else (error "unknown expression" expr))))
```

Each `cond` clause is one evaluation rule. Self-evaluating atoms,
variables, `quote`, `if`, `lambda`, `define`, and finally the default —
function application, which calls `apply`. That's the *whole shape* of
`eval`. The next chapter fills in each clause.

Notice: the special forms are exactly the `cond` clauses *before* the
`application?` catch-all. This is [Chapter 9](/lisp/part-3-building-up/special-forms-vs-functions)
made literal — special forms are the checks the evaluator does before
falling through to "it's a function call."

## 7. apply is small

`apply` is simpler — it handles two cases: primitive procedures (run
them directly) and user-defined procedures (bind parameters, evaluate
the body):

```lisp
(define (apply proc args)
  (cond ((primitive? proc)
         (apply-primitive proc args))      ; run the built-in
        ((compound? proc)                  ; user-defined lambda
         (eval (procedure-body proc)
               (extend-environment           ; new scope:
                 (procedure-params proc)     ; bind params
                 args                        ; to arguments
                 (procedure-env proc))))     ; over the closure's env
        (else (error "not a procedure" proc))))
```

The compound case is where **closures** ([Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope))
live: the procedure carries its definition environment
(`procedure-env`), and we extend *that* (not the caller's environment)
with the parameter bindings — implementing lexical scope. This is how
your interpreter gets closures right.

## 8. The plan for Part V

The remaining chapters build it out:

- **[Ch 18](/lisp/part-5-metacircular/writing-an-interpreter)**: write
  the full `eval`/`apply` with all the predicates and selectors — a
  complete, running interpreter.
- **[Ch 19](/lisp/part-5-metacircular/adding-special-forms)**: add more
  special forms (`cond`, `let`, `and`/`or`) and see how easy it is to
  extend the language.
- **[Ch 20](/lisp/part-5-metacircular/the-environment-model)**: the
  environment model in depth — how variable lookup, scope, and
  closures actually work in the data structure.

By the end you'll have a working Lisp, written in Lisp, that you
understand line by line. Get a REPL ready — you'll build this for real.

> :weightliftinggoose: This is the heaviest, most rewarding lift in the
> course. Don't just read [Chapter 18](/lisp/part-5-metacircular/writing-an-interpreter)
> — *type the interpreter in*, run it, evaluate `(+ 1 2)` and
> `((lambda (x) (* x x)) 5)` *with your own eval*. The moment your
> hand-written `eval` correctly runs a recursive factorial is the
> moment Lisp clicks all the way down. Everything in Parts I–IV
> converges here into running code.

## What we covered

- Evaluation splits into **`eval`** (expression + environment → value;
  dispatches on expression type) and **`apply`** (procedure + args →
  result; runs the procedure).
- `eval` calls `apply` (for function calls); `apply` calls `eval` (for
  the procedure body) — **mutual recursion** that *is* the interpreter.
- A **metacircular evaluator** is an interpreter for Lisp, written in
  Lisp — bootstrapped on the host Lisp's primitives, not circular.
- McCarthy's 1960 `eval` defined *and* (once run) implemented Lisp.
- `eval` is a **giant `cond`** dispatching on expression type — each
  clause is one evaluation rule; special forms are the clauses before
  the function-application catch-all.
- `apply` handles primitives (run directly) and compound procedures
  (extend the **closure's** environment with parameter bindings —
  lexical scope).

## What's next

[Chapter 18](/lisp/part-5-metacircular/writing-an-interpreter) —
writing a Lisp interpreter in Lisp. The complete `eval`/`apply`, every
predicate and selector, a working evaluator you can run. The page of
code that is the whole language.
