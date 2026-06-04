---
sidebar_position: 2
title: "The Condition System"
---

# The Condition System

> Error handling that beats exceptions. Common Lisp separates *detecting*
> a problem, *deciding* what to do, and *performing* the recovery — and
> crucially, the handler runs **before** the stack unwinds, so the place
> that failed is still alive and can be repaired.

Every language has error handling. Most have `try`/`catch`. Common Lisp
has something more powerful and more interesting: the **condition
system**. It's the feature experienced Lispers miss most in other
languages, and it's a natural follow-on to continuations
([Chapter 25](/lisp/part-7-advanced-control/continuations)) — both are
about controlling *where computation goes* when something unusual
happens.

## 1. The problem with exceptions

In a typical `try`/`catch`, throwing an exception **unwinds the stack
immediately**: every frame between the `throw` and the `catch` is torn
down before the handler runs. By the time your handler executes, the
context that failed *is gone*. You're left with only two choices:

1. Give up (let the error propagate further), or
2. Retry the *whole* `try` block from scratch.

You cannot say "fix this one value and continue from exactly where the
error happened" — because where it happened no longer exists. That lost
context is the limitation the condition system removes.

## 2. Conditions: signaling without committing to unwind

In Common Lisp, a **condition** is an object representing "something
noteworthy happened" — an error, a warning, or just an event. You
**signal** a condition; you don't necessarily *throw* it:

```lisp
(define-condition division-by-zero-error (error)
  ((dividend :initarg :dividend :reader dividend))
  (:report (lambda (c stream)
             (format stream "Tried to divide ~a by zero." (dividend c)))))
```

This defines a new condition type (it's a CLOS class —
[Chapter 30](/lisp/part-8-clos/classes-and-slots)). To signal it:

```lisp
(error 'division-by-zero-error :dividend 10)
```

The crucial distinction from exceptions: **signaling does not unwind the
stack by itself**. It *searches* for a handler, runs the handler *while
still inside the signaling context*, and only unwinds if the handler
decides to. The signaling point stays on the stack, alive, waiting.

## 3. Handlers run before the stack unwinds

Two ways to handle conditions, and the difference is the whole point:

- **`handler-case`** is the exception-like one: it unwinds to the
  `handler-case`, then runs the handler. Familiar `try`/`catch`.
- **`handler-bind`** is the superpower: it runs the handler **on top of
  the stack, at the signaling point, before any unwinding**. The handler
  can inspect, repair, and *resume*.

```lisp
;; handler-case: unwinds first, like try/catch
(handler-case (risky-thing)
  (division-by-zero-error (c)
    (format t "Caught: ~a~%" c)
    :gave-up))

;; handler-bind: runs WITHOUT unwinding — can choose to continue
(handler-bind ((division-by-zero-error
                 (lambda (c)
                   (format t "Saw: ~a, attempting recovery~%" c)
                   (invoke-restart 'use-value 0))))   ; fix it and go on
  (risky-thing))
```

With `handler-bind`, the handler runs *while the failing computation is
paused, not destroyed*. It can then transfer control to a **restart** —
a named recovery point the low-level code published in advance.

> :surprisedgoose: This is the inversion that surprises everyone: in the
> condition system, the *high-level* code decides the **policy** (what to
> do about the error), but the *low-level* code provides the
> **mechanisms** (the ways to recover). The handler at the top picks
> which low-level recovery to invoke — and the low-level code resumes
> from where it was. Policy and mechanism, cleanly separated, across the
> stack. `try`/`catch` fuses them and throws the mechanism away.

## 4. Restarts: named recovery points

A **restart** is a recovery strategy that lower-level code makes
available *by name*, without deciding whether to use it. You establish
restarts with `restart-case`:

```lisp
(defun parse-entry (text)
  (restart-case (parse-number text)        ; might signal an error
    (use-value (v) v)                       ; restart 1: substitute a value
    (skip-entry () :skipped)                ; restart 2: ignore this one
    (retry () (parse-entry (prompt-user))))) ; restart 3: try again
```

`parse-entry` says: "if I fail, here are three named ways you could
recover — `use-value`, `skip-entry`, `retry`. I won't choose; a handler
upstairs will." The low-level code has *published its recovery options*
but deferred the decision. This is the separation of concerns that makes
the system so flexible: the code that knows *how* to recover is separate
from the code that knows *which* recovery is appropriate.

## 5. Invoking a restart from a handler

Now the two halves meet. A handler, running via `handler-bind` (so the
stack is intact), chooses a restart and invokes it. Control jumps to
that restart's code — *down* the stack, at the signaling site — and the
computation continues:

```lisp
(handler-bind ((parse-error
                 (lambda (c)
                   (declare (ignore c))
                   (invoke-restart 'skip-entry))))   ; policy: skip bad entries
  (parse-entry "not-a-number"))
; => :SKIPPED  — the low-level skip-entry restart ran, computation continued
```

The flow: low-level code signals → the handler (at the top, stack
intact) decides "skip it" → it invokes the `skip-entry` restart → control
returns to the restart's code deep down → that returns `:skipped` and the
surrounding loop keeps going. No information was lost, and the decision
was made at the level that has the context to make it.

## 6. The canonical example: a robust file parser

Here's the example that sells the whole system. Parse a file of numbers,
one per line, where some lines are garbage. We want to log the bad lines
and keep going — without `parse-number` knowing anything about our
logging policy:

```lisp
(defun parse-log-file (lines)
  (let ((results '()))
    (handler-bind ((parse-error
                     (lambda (c)
                       (declare (ignore c))
                       (invoke-restart 'skip-entry))))   ; policy here
      (dolist (line lines)
        (let ((v (restart-case (parse-number line)
                   (skip-entry () nil))))                 ; mechanism here
          (when v (push v results)))))
    (nreverse results)))

(parse-log-file '("10" "oops" "20" "???" "30"))
; => (10 20 30)   — bad lines skipped, good ones kept
```

Note what's *not* coupled: `parse-number` and the `restart-case` know
nothing about logging or skipping policy; the `handler-bind` knows
nothing about parsing internals. Swap the handler to `use-value 0`
instead and bad lines become zeros — *without touching the parser*. Same
mechanisms, different policy. That decoupling is the prize.

## 7. The condition hierarchy

Conditions form a class hierarchy (it's CLOS underneath), so handlers
can catch broad or narrow categories:

- **`condition`** — the root; any signaled object.
- **`serious-condition`** — conditions that demand handling.
- **`error`** — a `serious-condition`; the default debugger fires if
  unhandled.
- **`warning`** — noted, but execution continues if unhandled.

Three signaling functions match these intents:

- **`error`** — signal an `error`; if unhandled, drop into the debugger.
- **`warn`** — signal a `warning`; if unhandled, print and continue.
- **`signal`** — signal *anything*; if unhandled, just return `nil` and
  continue (the basis for general "events," not just errors).

Because conditions are a class hierarchy, a `handler-bind` for `error`
catches all its subtypes — exactly like exception class hierarchies, but
unified with everything else in the system.

## 8. Why this is more powerful

The condition system's superpower is that **the debugger is just a
default handler**. When an `error` is unhandled, the system doesn't
crash — it enters the debugger *with the stack still intact*, and lists
the available restarts for you to pick interactively. You, the
programmer, become the handler: inspect the live state, fix a value,
invoke a restart, and the program continues from the error point.

This is why Lisp development feels alive: an error mid-computation
doesn't lose your work. You repair it at the REPL
([Chapter 22](/lisp/part-6-practical/the-repl-workflow)) and resume. It's
the same machinery — handlers, restarts, no premature unwinding —
exposed interactively.

> :nerdygoose: The condition system is, in spirit, a *disciplined
> continuation* ([Chapter 25](/lisp/part-7-advanced-control/continuations))
> system for errors. A restart is a continuation the low-level code
> published by name; invoking it transfers control to that point, stack
> intact. You could build the whole thing on `call/cc`. CL chose to
> expose it as conditions + restarts because that vocabulary —
> "signal," "handle," "restart" — maps onto how programmers actually
> think about recovery. It's continuations with good ergonomics for the
> error-handling case.

> :weightliftinggoose: The mental model to drill: **detect, handle,
> recover are three separate jobs at three levels.** Low-level code
> detects and *publishes restarts* (mechanisms) without deciding.
> High-level code *binds handlers* that pick a restart (policy). The
> condition travels up to find a handler; the chosen restart sends
> control back down. Practice by rewriting a `try`/`catch` retry loop as
> `handler-bind` + a `retry` restart — feel how the failing context
> survives instead of being thrown away.

## What we covered

- **Exceptions unwind the stack before the handler runs**, destroying the
  failing context; the condition system does not.
- A **condition** is a signaled object (a CLOS class); **signaling**
  searches for a handler *without* committing to unwind.
- **`handler-case`** is `try`/`catch` (unwinds first); **`handler-bind`**
  runs the handler at the signaling point, stack intact, able to resume.
- **Restarts** (`restart-case`) are named recovery *mechanisms* published
  by low-level code; **`invoke-restart`** lets a handler choose one.
- This separates **policy** (high-level handler) from **mechanism**
  (low-level restart) — swap the handler, change behavior, untouched
  parser.
- The condition **hierarchy** (`condition`/`serious-condition`/`error`/
  `warning`) and signaling functions (`error`/`warn`/`signal`).
- The **debugger is a default handler** — unhandled errors keep the
  stack alive for interactive recovery.

## What's next

[Chapter 27](/lisp/part-7-advanced-control/dynamic-variables) — dynamic
variables and dynamic extent. How `handler-bind` "finds" its handler is
*dynamic scope*; we'll meet special variables, the binding stack, and
`unwind-protect` (guaranteed cleanup), and see how dynamic extent
underpins the condition system itself.
