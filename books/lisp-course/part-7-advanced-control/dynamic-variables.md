---
sidebar_position: 3
title: "Dynamic Variables and Dynamic Extent"
---

# Dynamic Variables and Dynamic Extent

> A second kind of scope. Lexical scope is about *where* in the text a
> binding is visible; dynamic scope is about *when* in the call stack it
> is active. Dynamic variables let an outer call set context that inner
> calls inherit — and they're how the condition system finds its
> handlers.

You learned lexical scope in [Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope):
a variable refers to the binding in the enclosing *text*, which is what
makes closures work. That is the default in every modern Lisp, and the
right default. But there is a second, older kind of scope —
**dynamic** — that solves a different problem, and Lisp keeps it around
deliberately for the cases where it shines.

## 1. Two kinds of scope

The question both kinds answer: when code mentions a free variable `x`,
*which binding of `x` does it mean?*

- **Lexical scope**: the nearest binding in the surrounding *source
  text*, determined by where the code is *written*. Resolved by reading.
- **Dynamic scope**: the most recent binding in the *call stack*,
  determined by who is *running* at the time. Resolved at runtime.

```scheme
;; If x were dynamically scoped:
(define (show) (display x))      ; refers to whatever x is bound NOW
(define (run) (let ((x 99)) (show)))   ; show sees 99 — caller's binding
```

Under lexical scope, `show` would error (no `x` in its text). Under
dynamic scope, `show` sees the `x=99` that `run` established, because
`run` is on the stack when `show` runs. Lexical = "who *wrote* me";
dynamic = "who *called* me."

## 2. Special variables: opting into dynamic scope

In Common Lisp, dynamic variables are called **special variables**, and
you create them with `defvar` or `defparameter`. The naming convention
is **earmuffs** — asterisks around the name — so readers know a variable
is special on sight:

```lisp
(defparameter *verbose* nil)     ; a dynamic (special) variable

(defun greet ()
  (when *verbose* (format t "[debug] greeting now~%"))
  (format t "Hello!~%"))
```

`*verbose*` is global by default, but — and this is the point — it can
be **rebound dynamically** for the duration of a call.

## 3. Dynamic binding and the binding stack

`let` on a special variable doesn't create a lexical binding; it
**pushes a new value onto the dynamic binding stack** for the dynamic
extent of the `let`, then pops it on exit:

```lisp
(defun loud-greet ()
  (let ((*verbose* t))      ; rebind the special var for this dynamic extent
    (greet)))               ; greet sees *verbose* = t, even though it
                            ; never mentions the binding lexically

(greet)        ; prints: Hello!
(loud-greet)   ; prints: [debug] greeting now / Hello!
(greet)        ; prints: Hello!   — binding was popped, back to nil
```

`greet` is unchanged and contains no reference to `loud-greet`. Yet it
"inherited" the rebound `*verbose*` because `loud-greet` was on the stack
when `greet` ran. The binding lives for the *dynamic extent* — the
runtime duration of the `let` body, including everything it calls —
and is automatically unwound afterward, even on a non-local exit.

> :nerdygoose: This is implicit, scoped context-passing. Without dynamic
> variables you'd thread `verbose` through *every* function as an extra
> argument, polluting every signature, just so one deep function can see
> it. Dynamic variables let an outer frame set context and any inner
> frame read it, with no plumbing — and the binding cleans itself up at
> scope exit. It's a parameter passed through the stack invisibly. The
> cost is exactly that invisibility, which is why you reserve it for
> genuinely contextual things.

## 4. What dynamic variables are good for

Dynamic variables are the right tool for **ambient context** — settings
that pervade a computation but shouldn't clutter every call. Common
Lisp's standard library is full of them:

- **`*standard-output*`** — where `print`/`format` write. Rebind it to
  capture output to a string, redirect to a file, or silence it — for a
  whole sub-computation, without changing any printing code.
- **`*print-base*`** — the radix for printing integers. `(let ((*print-base* 16)) ...)`
  prints everything in hex inside that block.
- **`*random-state*`**, **`*read-eval*`**, **`*package*`** — reader and
  evaluator context.

```lisp
;; Capture everything a computation prints, with zero changes to it:
(with-output-to-string (s)
  (let ((*standard-output* s))
    (run-some-noisy-code)))     ; its output goes into the string, not the screen
```

Scheme expresses the same idea with **parameters** —
`(make-parameter default)` plus `parameterize` — which is dynamic
binding with a cleaner, closure-based interface. Clojure has dynamic
vars (`^:dynamic` + `binding`). Same concept, three spellings.

## 5. unwind-protect: guaranteed cleanup

Dynamic extent comes with a guarantee: a binding is undone *however* the
extent ends — normal return, error, or a continuation jumping clean out.
You can hook into that guarantee directly with **`unwind-protect`**, the
Lisp `try`/`finally`:

```lisp
(defun process-file (path)
  (let ((stream (open path)))
    (unwind-protect
         (do-work stream)          ; the protected body
      (close stream))))            ; cleanup — runs NO MATTER WHAT
```

The cleanup form runs whether `do-work` returns normally, signals an
error that unwinds past it, or is escaped by a continuation
([Chapter 25](/lisp/part-7-advanced-control/continuations)). This is how
you release resources safely. Most "with-" macros
([Chapter 16](/lisp/part-4-macros/building-a-dsl)) — `with-open-file`,
`with-lock` — are `unwind-protect` plus a dynamic binding, wrapped in a
macro so the cleanup can't be forgotten.

## 6. Dynamic extent meets continuations

There's a subtlety when dynamic binding meets first-class continuations.
If a continuation jumps *out* of a dynamic extent and later jumps *back
in*, what should happen to the dynamic bindings and the `unwind-protect`
cleanups? Scheme answers with **`dynamic-wind`**:

```scheme
(dynamic-wind
  (lambda () (display "enter\n"))   ; before: run on every entry
  (lambda () (do-the-work))         ; the body
  (lambda () (display "exit\n")))   ; after: run on every exit
```

Unlike a bare `unwind-protect`, `dynamic-wind`'s "before" and "after"
thunks run *each time* control enters or leaves the body — even via a
continuation re-entering it. This keeps dynamic state consistent when
continuations make control flow non-linear. It's the careful version of
cleanup for a world where computations can be resumed.

## 7. When dynamic scope is wrong

Dynamic scope is powerful and *easy to misuse*. The reasons it's not the
default:

- **It breaks referential transparency.** A function's result can depend
  on dynamic bindings set far away, so reading the function in isolation
  no longer tells you what it does.
- **It's invisible.** No signature reveals that a function consults
  `*verbose*`. Action at a distance makes bugs hard to trace.
- **It composes poorly with concurrency.** "The most recent binding on
  the stack" gets murky across threads (each thread typically gets its
  own dynamic bindings, which is its own subtlety).

The rule of thumb: **use lexical scope by default; reach for dynamic
variables only for genuinely ambient, cross-cutting context** —
output streams, configuration, the current transaction, the current
request. If you'd be tempted to make it a global, but want it
*temporarily* and *safely* overridable for a sub-computation, that's the
dynamic-variable sweet spot.

## 8. How the condition system uses this

Now the payoff that ties Part VII together. The condition system
([Chapter 26](/lisp/part-7-advanced-control/condition-system)) is built
*on* dynamic extent. When you write `handler-bind`, you are dynamically
binding a handler for the *dynamic extent* of its body. When code deep
inside signals a condition, the system walks the **dynamic** chain of
active handlers — most recent first — exactly like looking up a dynamic
variable. Restarts work the same way: `restart-case` establishes
restarts for a dynamic extent, and `invoke-restart` finds them by
walking that chain.

So "the handler that's active right now" is just dynamic scope applied to
handlers, and "the cleanup that must run on unwind" is `unwind-protect`.
The elegant, surprising error system of the last chapter is dynamic
extent wearing a friendly vocabulary.

> :weightliftinggoose: Two scopes, two jobs: **lexical for almost
> everything** (predictable, local, closure-friendly), **dynamic for
> ambient context** (output, config, handlers — set by an outer frame,
> read by inner ones, auto-unwound). Drill the distinction by tracing a
> `(let ((*x* ...)) (f))` where `f` reads `*x*` — convince yourself `f`
> sees the binding because of *who called it*, not *where it's written*.
> Then notice every `with-` macro you use is this plus `unwind-protect`.

## What we covered

- **Lexical scope** resolves a variable by surrounding *text* (the
  default); **dynamic scope** resolves it by the *call stack* at runtime.
- **Special variables** (`defvar`/`defparameter`, earmuffs `*name*`) are
  Common Lisp's dynamic variables.
- `let` on a special variable pushes a binding for its **dynamic
  extent** — inherited by everything it calls, auto-unwound on exit.
- Good for **ambient context**: `*standard-output*`, `*print-base*`,
  config. Scheme uses `parameterize`; Clojure uses `binding`.
- **`unwind-protect`** guarantees cleanup on any exit; **`dynamic-wind`**
  handles cleanup correctly under continuation re-entry.
- Dynamic scope is *not* the default because it breaks referential
  transparency and is invisible — use it only for cross-cutting context.
- The **condition system is built on dynamic extent**: handlers and
  restarts are found by walking the dynamic chain.

## What's next

[Chapter 28](/lisp/part-7-advanced-control/lazy-streams) — lazy
evaluation and streams. Compute values only when needed, build *infinite*
data structures, and meet `delay`/`force` — the last stop in Part VII
before we turn to objects in [Part VIII](/lisp/part-8-clos/generic-functions).
