---
sidebar_position: 4
title: "The Environment Model"
---

# The Environment Model

> Opening the black box. How variable lookup, scope, and closures
> actually work in the data structure — the last piece of the
> interpreter, and the precise meaning of "scope."

We've used `env-lookup`, `extend-env`, and `env-define!` as a black box
([Chapters 18–19](/lisp/part-5-metacircular/writing-an-interpreter)).
Now we open it. The **environment** is the data structure that maps
variable names to values, and understanding it is understanding scope,
closures, and how `define`/`let`/`lambda` really work. This completes
Part V.

## 1. What an environment is

An **environment** answers one question: *given a symbol, what value is
it bound to?* ([Chapter 4](/lisp/part-1-core-idea/evaluation), Rule 2.)

The simplest model: an environment is a **list of frames**, where each
frame is a set of bindings (a little map from symbols to values). When
you look up a symbol, you search the frames from innermost to
outermost, returning the first binding you find.

```
innermost frame:  { x: 10, y: 20 }      ← a let or function call's locals
                       ↓ (enclosing)
next frame:       { factor: 3 }          ← an enclosing scope
                       ↓
global frame:     { +: <prim>, car: <prim>, ... }   ← built-ins
```

This chain of frames *is* lexical scope. Looking up `x` checks the
innermost frame first; if not found, the next; up to the global frame.
The first match wins — which is exactly why **inner bindings shadow
outer ones** ([Chapter 10 §7](/lisp/part-3-building-up/let-and-binding)).

## 2. Representing it with cons cells

True to Lisp, we build the environment from lists
([Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons)). A frame is an
**association list** (alist) — a list of `(symbol . value)` pairs — and
an environment is a list of frames:

```lisp
;; A frame: list of (symbol . value) pairs
;;   (((x . 10) (y . 20)))   ← one frame with x=10, y=20

;; The empty environment:
(define (empty-env) '())

;; Extend: add a new frame binding vars to vals, in front of base-env
(define (extend-env vars vals base-env)
  (cons (map cons vars vals)    ; new frame: zip vars and vals into pairs
        base-env))               ; prepend it to the existing chain
```

`extend-env` builds a new frame (pairing each variable with its value
via `(map cons vars vals)`) and *conses it onto the front* of the base
environment. Prepending = entering a new, inner scope. The base env is
shared (structure sharing — [Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons)),
so this is cheap.

## 3. Lookup: searching outward

`env-lookup` searches the frame chain from innermost (front) to
outermost (back):

```lisp
(define (env-lookup var env)
  (if (null? env)
      (error "Unbound variable" var)        ; searched everything, not found
      (let ((binding (assq var (car env))))  ; look in the innermost frame
        (if binding
            (cdr binding)                     ; found: return the value
            (env-lookup var (cdr env))))))    ; not here: search enclosing frames
```

`assq` finds the `(var . value)` pair in a frame (an alist) by symbol
identity ([Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons)'s
alists). If found, return the value; if not, recurse to the next frame.
Hit the empty environment → unbound-variable error. This recursion
*is* the scope-resolution rule: search inner before outer, first match
wins.

## 4. Define and set!: adding and changing bindings

`define` adds a binding to the **current (innermost) frame**:

```lisp
(define (env-define! var val env)
  (let ((frame (car env)))
    (set-car! env (cons (cons var val) frame))  ; prepend (var . val) to frame
    var))
```

`set!` *changes an existing* binding (searching outward for it),
rather than adding a new one:

```lisp
(define (env-set! var val env)
  (if (null? env)
      (error "Unbound variable" var)
      (let ((binding (assq var (car env))))
        (if binding
            (set-cdr! binding val)            ; mutate the existing pair's value
            (env-set! var val (cdr env))))))   ; search enclosing frames
```

This is the [Chapter 10](/lisp/part-3-building-up/let-and-binding)
binding-vs-assignment distinction, in the data structure: `define`
creates a new binding in the current frame; `set!` finds and mutates an
existing one anywhere in the chain.

## 5. How closures use the environment

Now the deep payoff — **closures**
([Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope))
explained completely.

When `my-eval` evaluates a `lambda`, it builds a procedure that
captures the *current* environment
([Chapter 18 §3](/lisp/part-5-metacircular/writing-an-interpreter)):

```lisp
((lambda? expr)
 (make-procedure (lambda-params expr)
                 (lambda-body expr)
                 env))                  ; ← capture THIS environment
```

That captured `env` is the closure's "memory." When the procedure is
later applied ([Chapter 18 §4](/lisp/part-5-metacircular/writing-an-interpreter)),
`my-apply` extends *the captured environment* (not the caller's):

```lisp
(my-eval (procedure-body proc)
         (extend-env (procedure-params proc)
                     args
                     (procedure-env proc)))   ; ← extend the CAPTURED env
```

So when the body looks up a free variable (one not in its parameters),
the lookup proceeds through the *captured* frame chain — finding the
variables that were in scope *where the lambda was defined*. **That is
lexical scope and closures, mechanically.** The `adder` example
([Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope))
works because the inner lambda captured the frame containing `n`, and
that frame survives in the closure's environment.

> :surprisedgoose: This is the whole mystery of closures, dissolved. A
> closure "remembers" its variables because it literally *holds a
> pointer to the environment frame chain* that existed when it was
> created. There's no magic — the captured environment is just a list
> of frames, kept alive by the closure referencing it. When other
> Lisp data stops referencing those frames, only the closure keeps
> them, and the garbage collector ([Chapter 1](/lisp/part-1-core-idea/why-lisp))
> preserves exactly what's reachable. Closures are environments that
> outlive their creating call.

## 6. Lexical vs dynamic scope, in the model

The model makes the lexical/dynamic distinction
([Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope))
crisp:

- **Lexical scope** (what we built): `my-apply` extends the procedure's
  **captured** environment (`procedure-env`). Free variables resolve
  to where the function was *defined*.
- **Dynamic scope**: change `my-apply` to extend the **caller's**
  environment instead. Free variables would resolve to where the
  function was *called*.

It's a one-word change in the interpreter (`procedure-env` →
caller's env) — and it changes the entire scoping discipline of the
language. This is [Chapter 19](/lisp/part-5-metacircular/adding-special-forms)'s
"the evaluator is a lever" again: scope itself is a choice you make in
`my-apply`. Modern Lisps choose lexical (captured env); the choice
lives right here.

## 7. Performance and real implementations

Our alist-of-frames environment is *correct* but *slow* — lookup is
linear in the number of bindings and frames. Real Lisp implementations
optimize:

- **Hash tables** for the global frame (many bindings).
- **Lexical addressing**: at compile time, resolve each variable to a
  `(frame-index, binding-index)` pair, so runtime lookup is array
  indexing, not search. (SICP §5 covers this.)
- **Vectors** for frames with a known, fixed set of variables.

These are optimizations of the *same model* — the conceptual structure
(a chain of frames searched inner-to-outer) is unchanged; only the
representation gets faster. Understand the alist model first; the
optimizations are bookkeeping on top.

## 8. The interpreter is complete

With the environment model, the metacircular evaluator is *whole*:

- **`my-eval`** ([Ch 18](/lisp/part-5-metacircular/writing-an-interpreter)):
  dispatches on expression type.
- **`my-apply`** ([Ch 18](/lisp/part-5-metacircular/writing-an-interpreter)):
  runs procedures.
- **Special forms** ([Ch 19](/lisp/part-5-metacircular/adding-special-forms)):
  extend the language.
- **The environment** (this chapter): resolves variables, implements
  scope and closures.

Every rule from [Chapter 4](/lisp/part-1-core-idea/evaluation) is now
running code. Every concept from Parts I–IV — cons cells, recursion,
closures, special forms — appears in the interpreter. You have built a
Lisp, in Lisp, and understand it completely. This is the summit.

> :weightliftinggoose: The environment is the least glamorous part of
> the interpreter and the most enlightening. "Scope" stops being a
> vague rule and becomes a concrete data structure: a chain of frames,
> searched outward. "Closure" stops being magic and becomes "a
> procedure holding a pointer to its defining frame chain." If you
> implemented the environment and watched `adder` work through it,
> you understand scope more deeply than most working programmers ever
> will. That understanding pays off in every language with variables —
> which is all of them.

## What we covered

- An **environment** maps symbols to values; modeled as a **list of
  frames**, each frame an alist of `(symbol . value)` pairs.
- **`extend-env`** conses a new frame on front (enter a scope);
  built from cons cells with structure sharing.
- **`env-lookup`** searches frames inner-to-outer, first match wins —
  *this is lexical scope*, and why inner bindings shadow outer.
- **`define`** adds a binding to the current frame; **`set!`** finds
  and mutates an existing one (binding vs assignment).
- **Closures** capture the defining environment; `my-apply` extends
  the *captured* env, so free variables resolve to the definition site
  — closures are environments that outlive their creating call.
- **Lexical vs dynamic scope** is a one-word change in `my-apply`
  (captured env vs caller's env).
- Real implementations optimize (hash tables, lexical addressing) but
  keep the same conceptual model.
- The interpreter is now **complete** — every Part I rule is running
  code.

## What's next

That closes Part V — and the conceptual core of the course. You
understand Lisp from the inside out. [Part VI](/lisp/part-6-practical/dialects)
turns practical: choosing a dialect (Common Lisp vs Scheme vs
Clojure), the REPL workflow, building a real project, and where to go
next.
