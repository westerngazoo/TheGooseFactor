---
sidebar_position: 2
title: "The REPL Workflow"
---

# The REPL Workflow

> Installing a Lisp and the interactive develop-at-the-prompt style
> that makes Lisp programming uniquely fluid. The REPL isn't a
> debugging afterthought — it's how you build.

We've mentioned the REPL throughout ([Chapter 4](/lisp/part-1-core-idea/evaluation)).
This chapter makes it your home. The Lisp development style — define,
test, redefine, all in a live session — is genuinely different from
edit-compile-run, and it's a big part of why Lispers love the
language. Let's get you set up and fluent.

## 1. Install a Lisp (pick one, takes minutes)

Per [Chapter 21](/lisp/part-6-practical/dialects), pick a dialect and
install:

- **Racket** (Scheme, best for beginners): download from
  racket-lang.org. Includes **DrRacket**, an excellent beginner IDE
  with a built-in REPL. The gentlest start.
- **SBCL** (Common Lisp): install via your package manager
  (`brew install sbcl`, `apt install sbcl`). Pair with Emacs + SLIME,
  or VS Code + Alive, for the full experience.
- **Clojure**: install via the official CLI tools or `brew install
  clojure`. Pair with an editor + a REPL plugin (Calva for VS Code,
  CIDER for Emacs).

For *this chapter*, any of them works. If undecided, install **Racket**
and open DrRacket — you'll have a REPL in two minutes.

## 2. What the REPL does

**REPL** = Read-Eval-Print-Loop
([Chapter 4](/lisp/part-1-core-idea/evaluation)):

1. **Read** your typed expression into an S-expression.
2. **Eval** it to a value.
3. **Print** the value.
4. **Loop** — prompt for the next.

```lisp
> (+ 1 2)
3
> (define (square x) (* x x))
> (square 7)
49
> (map square '(1 2 3 4))
(1 4 9 16)
>
```

You type an expression, immediately see its value. No compile step, no
"run the whole program" — every expression gives instant feedback.
This tight loop is the heartbeat of Lisp development.

## 3. The interactive development style

Here's what makes Lisp different. In edit-compile-run languages, you
write a whole program, compile it, run it, see output, and repeat. In
Lisp, you develop *inside a running program*:

1. Write a function in your editor.
2. Send it to the REPL (a keystroke) — it's now defined in the live
   session.
3. Test it at the prompt with various inputs.
4. It's wrong? Edit it, re-send — the new definition *replaces* the
   old one in the running session.
5. Test again. Repeat until right.
6. Build the next function on top, with all your previous definitions
   still live.

You never restart. The program *grows* in a live session. State,
definitions, and data accumulate as you work. This is **incremental,
bottom-up development**, and it's remarkably productive once it clicks.

> :surprisedgoose: The "running program you develop inside" model is
> hard to appreciate until you've felt it. You're debugging a web
> server? Don't restart it — redefine the broken handler function in
> the live REPL connected to the running server, and the fix takes
> effect *immediately*, with all the server's state intact. Common
> Lisp and Clojure do this routinely. After this, restarting a process
> to test a one-line change feels barbaric.

## 4. Editor integration: send-to-REPL

The REPL is most powerful when wired into your editor, so you can
**send expressions from your code to the REPL** with a keystroke:

- **DrRacket** (Racket): write in the top pane, hit Run, interact in
  the bottom REPL pane. Simplest.
- **Emacs + SLIME** (Common Lisp) / **CIDER** (Clojure): the classic,
  most powerful setup. `C-c C-c` to compile a function, `C-x C-e` to
  evaluate an expression, instant inline results.
- **VS Code + Calva** (Clojure) / **+ Alive** (Common Lisp): modern,
  approachable editor integration.

The key keystrokes you want: **evaluate-this-expression** and
**evaluate-this-top-level-form (function)**. With these, you write a
function and send it to the REPL without leaving your editor — the
write/test loop becomes seconds.

## 5. Inspecting and exploring

The REPL is also for *exploration*. You poke at data and functions
interactively:

```lisp
> (define data '((alice 30) (bob 25) (carol 35)))
> (map car data)
(alice bob carol)
> (map cadr data)
(30 25 35)
> (filter (lambda (p) (> (cadr p) 28)) data)
((alice 30) (carol 35))
```

You build up a transformation step by step, checking each piece at the
prompt before composing them. This "conversation with the data"
approach — try a transform, see the result, refine — is far faster
than writing a whole program blind and running it. The REPL turns
programming into an interactive dialogue.

## 6. Useful REPL tools

Most REPLs offer:

- **`macroexpand`** ([Chapter 14](/lisp/part-4-macros/your-first-macro)):
  see what a macro expands to.
- **History**: up-arrow to recall and edit previous expressions.
- **`doc` / documentation lookup**: see a function's documentation
  inline.
- **Inspectors**: drill into a complex data structure interactively.
- **The debugger**: when an error occurs, drop into a debugger that
  shows the stack and (in CL) lets you *fix and resume* via restarts.

Learn your REPL's help/doc commands early — they make exploration
self-service. In SBCL, `(describe 'function-name)`; in Racket, the
documentation browser; in Clojure, `(doc function-name)`.

## 7. The Common Lisp condition system (a glimpse)

Common Lisp's REPL has a feature worth highlighting: the
**condition/restart system**. When an error occurs, instead of
crashing, CL drops you into the debugger *at the point of the error*,
with the stack intact and a menu of **restarts** — ways to recover and
continue:

```
Unbound variable: X
Restarts:
  0: Specify a value to use for X.
  1: Retry the evaluation.
  2: Return to top level.
```

You can supply a value, fix the definition, and *resume the
computation from where it failed* — no restart, no lost state. This
is more powerful than the exception systems of most languages (which
unwind the stack and lose context). It's a CL distinctive that makes
interactive debugging extraordinarily fluid.

## 8. Building the habit

To internalize the REPL workflow:

- **Keep a REPL open whenever you write Lisp.** Always.
- **Test every function the moment you write it** — send it, call it
  with a few inputs.
- **Explore data at the prompt** before writing code that processes
  it.
- **Redefine, don't restart.** When something's wrong, fix the
  definition and re-send.
- **Use `macroexpand`** on every macro you write.

The goal is for the write-a-bit / test-a-bit loop to become so fast
it's subconscious. When you're fluent, you'll think *through* the REPL
— it becomes an extension of your reasoning, not a separate tool.

> :weightliftinggoose: The REPL is the single biggest workflow
> difference between Lisp and most languages, and the biggest
> productivity unlock. Don't write Lisp in a file and run it like C —
> that throws away the best part. Wire the REPL into your editor, learn
> the send-expression keystroke, and live at the prompt. Define, test,
> redefine, explore — in a live session. Once this is muscle memory,
> going back to edit-compile-run feels like programming with mittens
> on.

## What we covered

- Install a Lisp: **Racket** (easiest, DrRacket IDE), SBCL (+ SLIME),
  or Clojure (+ Calva/CIDER).
- The **REPL** (read-eval-print-loop) gives instant per-expression
  feedback — no compile-run cycle.
- **Interactive development**: grow your program inside a *running*
  session — define, test, redefine, never restart.
- **Editor integration**: send-expression / send-function keystrokes
  make the write/test loop seconds long.
- The REPL is for **exploration** — a conversation with your data,
  building transforms step by step.
- Tools: `macroexpand`, history, doc lookup, inspectors, the debugger.
- Common Lisp's **condition/restart system**: fix-and-resume from
  errors without losing state.
- Build the habit: always keep a REPL open; test immediately;
  redefine, don't restart.

## What's next

[Chapter 23](/lisp/part-6-practical/building-a-real-project) — building
a real project. We move from REPL snippets to a structured program:
files, modules, dependencies, and tests — turning Lisp knowledge into
a shippable thing.
