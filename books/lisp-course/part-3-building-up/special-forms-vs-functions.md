---
sidebar_position: 1
title: "Special Forms vs Functions"
---

# Special Forms vs Functions

> The distinction that explains why `if` can't be a function, why
> `and` short-circuits, and what makes something "syntax" in a
> language with almost no syntax. The seed that macros will grow.

[Chapter 4](/lisp/part-1-core-idea/evaluation) introduced special
forms as "the exceptions to the function-call rule." Now we examine
the distinction carefully, because it's the key to understanding what
macros ([Part IV](/lisp/part-4-macros/your-first-macro)) actually do.

## 1. The default rule, restated

Recall Rule 3 ([Chapter 4](/lisp/part-1-core-idea/evaluation)): to
evaluate a list `(f a b c)`, **evaluate every element**, then **apply**
`f` to the results. This is *applicative-order* evaluation — arguments
are fully evaluated before the function runs.

```lisp
(+ (* 2 3) (- 10 4))   ; evaluate (* 2 3)→6 and (- 10 4)→6, then + → 12
```

Both operands are evaluated, then `+` is applied. This is how all
*functions* work. The question: when is "evaluate all arguments first"
the *wrong* thing?

## 2. Why if can't be a function

Suppose `if` were an ordinary function. Then `(if test then else)`
would evaluate *all three* arguments before "calling" `if`. Consider:

```lisp
(if (= x 0)
    0
    (/ 10 x))    ; division — must NOT run when x is 0
```

If `if` evaluated all arguments first, `(/ 10 x)` would run *even when
`x` is 0*, causing a divide-by-zero error — before `if` ever got to
choose the safe branch. The whole point of `if` is to evaluate
*only one* branch, *after* seeing the test. A function can't do that;
by the time a function runs, its arguments are already evaluated.

So `if` **must** be a special form: it controls *which* of its
arguments get evaluated, and *when*. It evaluates the test, then
evaluates exactly one of the branches.

> :surprisedgoose: This is the crisp criterion: **if an operator needs
> to control whether or when its arguments are evaluated, it cannot be
> a function — it must be a special form.** Functions get
> already-evaluated arguments. Special forms get the *unevaluated*
> argument expressions and decide what to do with them. That single
> distinction explains the entire list of special forms.

## 3. The essential special forms and why each is special

Each special form breaks the default rule in a specific way:

| Special form | Why it can't be a function |
|---|---|
| `quote` | Must *not* evaluate its argument at all — returns it as data. |
| `if` | Must evaluate only the chosen branch, after the test. |
| `cond` | Like `if`: evaluates clauses lazily, stops at the first match. |
| `and` | Short-circuits: stops at the first false, skips the rest. |
| `or` | Short-circuits: stops at the first true, skips the rest. |
| `define` | Must *not* evaluate the name being defined (it's a symbol to bind). |
| `lambda` | Must *not* evaluate the body now — it builds a function to run later. |
| `let` | Must establish bindings *before* evaluating the body. |
| `set!` | Must *not* evaluate the variable name (the target of assignment). |

In each case, "evaluate all arguments, then apply" would be wrong.
`quote` must not evaluate. `and`/`or` must conditionally skip. `lambda`
must *defer*. `define`/`set!` need the name as a symbol, not its value.

## 4. and / or: short-circuiting in action

`and` and `or` make the special-ness concrete:

```lisp
(and #t #t #f (error "boom"))   ; => #f, and "boom" never happens
(or #f #f #t (error "boom"))    ; => #t, and "boom" never happens
```

`and` evaluates left to right, stops at the first false (returning it),
and *never evaluates the rest*. `or` stops at the first true. The
`(error "boom")` is never reached. A function couldn't do this — its
arguments would all be evaluated (triggering the error) before `and`
ran. Short-circuiting *requires* a special form.

This is also why `and`/`or` are used for control flow and defaults:

```lisp
(or user-supplied-value default-value)   ; use default if first is #f
(and lst (car lst))                      ; safely take car only if non-empty
```

## 5. How the evaluator tells them apart

When the evaluator sees a list `(op args...)`, it checks: **is `op` a
special form?**

- **Yes** → use that form's special evaluation rule (don't
  auto-evaluate the arguments).
- **No** → it's a function call: evaluate all elements, apply
  ([Chapter 4](/lisp/part-1-core-idea/evaluation)).

The set of special forms is **fixed and known to the evaluator** — it's
a small built-in list. In the Part V interpreter
([Chapter 19](/lisp/part-5-metacircular/adding-special-forms)), this is
literally a sequence of checks: "is it `quote`? is it `if`? is it
`lambda`? ... otherwise, treat it as a function call." You'll write
those checks yourself.

> :nerdygoose: The special forms are the *irreducible syntax* of Lisp
> — the handful of constructs the evaluator hard-codes. Everything
> else is a function. A minimal Lisp needs only a few: `quote`, `if`,
> `lambda`, `define` (and arguably `set!`). From those, plus functions,
> you can build the rest — `cond`, `let`, `and`, `or` can all be
> *macros* rather than primitives. Which brings us to the punchline.

## 6. The punchline: macros add special forms

Here's why this chapter matters for the whole course. The built-in
special forms are *fixed* — but with **macros**
([Part IV](/lisp/part-4-macros/your-first-macro)), *you* can define new
operators that behave like special forms: operators that receive their
arguments *unevaluated* and decide what to do with them.

A macro is a function that runs at "read time," takes the unevaluated
argument expressions (as lists — code is data!), and returns *new
code* to be evaluated in their place. This lets you add constructs
like `unless`, `while`, pattern-matchers, or entire embedded languages
— without modifying the evaluator.

So the landscape is:

- **Functions**: get evaluated arguments. The vast majority of
  operators.
- **Built-in special forms**: a fixed handful the evaluator hard-codes
  (`quote`, `if`, `lambda`, ...).
- **Macros**: user-defined special-form-like operators. The
  language's growth mechanism.

`cond`, `let`, `and`, `or` sit in an interesting place: conceptually
special forms, but in many Lisps actually *implemented as macros* over
the primitive `if`/`lambda`. The line between "built-in syntax" and
"library macro" is blurry — and that blurriness is exactly Lisp's
power. You can't tell, from using it, whether `when` is built into the
language or defined in three lines of macro. That's the point.

> :happygoose: This is the whole arc of the course in one idea. Part I:
> the evaluator has a default rule (function call) with a few
> exceptions (special forms). Part III: those exceptions are about
> controlling evaluation. Part IV: *you* get to add exceptions
> (macros), making the language extensible at the syntax level. Part V:
> you build the evaluator that makes all of this run. Special forms
> are the hinge between "using Lisp" and "extending Lisp."

## 7. A test: function or special form?

For each operator, decide: could it be a function, or must it be a
special form? (Criterion: does it need to control evaluation of its
arguments?)

1. `square` — **function**. Just needs its argument's value.
2. `if` — **special form**. Evaluates only one branch.
3. `+` — **function**. Needs all argument values.
4. `quote` — **special form**. Must *not* evaluate.
5. `list` — **function**. Just collects evaluated arguments.
6. `define` — **special form**. Needs the name unevaluated.
7. `and` — **special form**. Short-circuits.
8. `cons` — **function**. Needs both values.

The pattern: anything that "just needs the values" is a function;
anything that "controls whether/when/how arguments are evaluated" is a
special form (or a macro).

> :weightliftinggoose: Carry this criterion forward: **functions
> receive values; special forms (and macros) receive unevaluated
> code.** When you reach Part IV and start writing macros, this is the
> mental switch — you're no longer writing a function that processes
> values, you're writing a transformer that processes *code*. The
> distinction you learned here is the door into metaprogramming.

## What we covered

- The default rule: evaluate all arguments, then apply (functions,
  applicative order).
- **`if` can't be a function**: it must evaluate only one branch, so
  it must be a special form.
- The criterion: **if an operator must control whether/when its
  arguments are evaluated, it's a special form, not a function.**
- Essential special forms (`quote`, `if`, `cond`, `and`, `or`,
  `define`, `lambda`, `let`, `set!`) and why each breaks the default
  rule.
- `and`/`or` **short-circuit** — impossible for a function.
- The evaluator checks "is `op` a special form?" — a fixed built-in
  list — else treats it as a function call.
- **Macros** ([Part IV](/lisp/part-4-macros/your-first-macro)) let you
  add new special-form-like operators; `cond`/`let`/`and`/`or` are
  often macros over primitive `if`/`lambda`.

## What's next

[Chapter 10](/lisp/part-3-building-up/let-and-binding) — `let`,
`let*`, and binding. How to introduce local variables, the special
forms that do it, and how they relate to `lambda` (spoiler: `let` is
sugar for a lambda call).
