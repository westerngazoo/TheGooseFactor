---
sidebar_position: 4
title: "Evaluation: The Rules of the Game"
---

# Evaluation: The Rules of the Game

> The reader turned text into S-expressions. Now the evaluator turns
> S-expressions into values. The precise rules — and they're few
> enough to memorize — are the entire semantics of Lisp.

This chapter closes Part I. We have the structure (S-expressions made
of cons cells); now we learn the **rules of evaluation** that give
that structure meaning. Astonishingly, there are only a handful, and
once you know them you can predict the result of any Lisp expression.

## 1. The central question

Evaluation answers one question, recursively:

> Given an S-expression, what **value** does it produce?

The evaluator, `eval`, is a function from S-expressions to values. Its
behavior splits by what kind of S-expression it's looking at. There
are essentially three cases: self-evaluating atoms, symbols, and
lists.

## 2. Rule 1: self-evaluating atoms

Numbers, strings, booleans, and characters **evaluate to themselves**:

```lisp
42        ; => 42
3.14      ; => 3.14
"hello"   ; => "hello"
#t        ; => #t
```

There's nothing to look up or compute — a number *is* its own value.
These are called **self-evaluating** atoms.

## 3. Rule 2: symbols evaluate to their binding

A **symbol** evaluates to the value it's **bound** to — i.e., you look
it up in the current environment (the set of variable bindings in
scope):

```lisp
(define x 10)
x         ; => 10   (look up x, find 10)
+         ; => #<procedure +>   (look up +, find the addition function)
```

If the symbol isn't bound, you get an error ("unbound variable").
This lookup is why symbols are the language's variables. The
**environment** — the mapping from symbols to values — is so central
that [Chapter 20](/lisp/part-5-metacircular/the-environment-model)
devotes itself to it.

Note the contrast with quoting from [Chapter 2](/lisp/part-1-core-idea/s-expressions):

```lisp
x         ; => 10   (evaluate the symbol: look up its value)
'x        ; => x    (quote: the symbol itself, no lookup)
```

## 4. Rule 3: lists are function calls (by default)

A non-empty list `(f a b c ...)` is evaluated as a **function call**
(also "combination" or "application"). The procedure:

1. **Evaluate every element** of the list — the operator `f` and all
   the operands `a b c`.
2. **Apply** the value of `f` (which must be a procedure) to the
   values of the operands.

```lisp
(+ 1 2)        ; evaluate +, 1, 2 → the function, 1, 2 → apply → 3
(* (+ 1 2) 4)  ; evaluate (+ 1 2)→3 and 4→4, then * applied to 3,4 → 12
```

Walk `(* (+ 1 2) 4)` carefully:

1. It's a list, so it's a function call.
2. Evaluate the operator `*` → the multiplication function.
3. Evaluate operand `(+ 1 2)` → (it's a list, recurse) → `3`.
4. Evaluate operand `4` → `4`.
5. Apply `*` to `3` and `4` → `12`.

Evaluation is **recursive**: to evaluate a list, you first evaluate
its parts, which may themselves be lists requiring the same treatment.
This recursion bottoms out at self-evaluating atoms and symbols.

> :surprisedgoose: That's the *entire* default evaluation rule for
> lists: evaluate all the elements, apply the first to the rest. The
> uniformity from [Chapter 1](/lisp/part-1-core-idea/why-lisp) pays
> off — there's no special syntax for function calls because *every*
> list is a function call by default. `(+ 1 2)`, `(factorial 5)`,
> `(print "hi")` all follow one rule.

## 5. The exception: special forms

If every list were evaluated by "evaluate all parts, then apply," some
things would be impossible. Consider:

```lisp
(if (> x 0) (expensive-thing) (other-thing))
```

If we evaluated *all* the parts first, we'd run **both** branches
before `if` got to choose — wrong and wasteful. Or:

```lisp
(define x 10)
```

If we evaluated `x` first, we'd try to look up `x` before it's
defined — error. We *want* `define` to receive the symbol `x`
unevaluated.

So Lisp has **special forms**: a small set of operators that do *not*
follow the "evaluate all arguments" rule. They have their own
evaluation rules. The essential ones:

| Special form | What's special |
|---|---|
| `quote` | Returns its argument **unevaluated**. |
| `if` | Evaluates the test; evaluates **only one** branch. |
| `define` | Binds a symbol without evaluating the symbol. |
| `lambda` | Builds a function; the body isn't run yet. |
| `let` | Binds locals, then evaluates the body. |
| `and` / `or` | Short-circuit: stop early, don't evaluate the rest. |

When the evaluator sees a list, it checks: **is the operator a special
form?** If yes, use that form's special rule. If no, it's an ordinary
function call (Rule 3). [Chapter 9](/lisp/part-3-building-up/special-forms-vs-functions)
explores the distinction in depth; for now, just know the default
(function call) has a handful of exceptions (special forms).

> :nerdygoose: The set of special forms is small and fixed in a given
> dialect — they're the "syntax" of an otherwise syntax-free language.
> Everything else is a function. And here's the kicker: with **macros**
> ([Part IV](/lisp/part-4-macros/your-first-macro)), *you* can add new
> special-form-like constructs without modifying the evaluator. The
> built-in special forms are just the seed; macros let the language
> grow its own syntax.

## 6. Worked examples

Predict each result before reading the answer. Apply the three rules
(+ special forms).

```lisp
(+ 1 2 3)
```
List → function call. Evaluate `+`, `1`, `2`, `3`; apply `+` →
**`6`**.

```lisp
'(+ 1 2 3)
```
`quote` special form → return the argument unevaluated → the list
**`(+ 1 2 3)`** as data.

```lisp
(if (< 2 1) 'yes 'no)
```
`if` special form. Evaluate test `(< 2 1)` → `#f`. Since false,
evaluate only the else branch `'no` → **`no`**. The `'yes` branch is
never touched.

```lisp
(define double (lambda (n) (* 2 n)))
(double 21)
```
`define` binds `double` to the function built by `lambda`. Then
`(double 21)` is a function call: evaluate `double` (the function) and
`21`; apply → `(* 2 21)` → **`42`**.

```lisp
(list (+ 1 1) (+ 2 2) (+ 3 3))
```
List → function call. `list` is a function that returns its arguments
as a list. Evaluate the operands: `2`, `4`, `6`. Apply `list` →
**`(2 4 6)`**.

## 7. Eval and apply: the two halves

Underneath, evaluation is a mutual recursion between two functions:

- **`eval`** takes an expression and an environment, and returns a
  value. For a list (function call), it evaluates the operator and
  operands, then hands off to `apply`.
- **`apply`** takes a procedure and a list of (already-evaluated)
  argument values, and runs the procedure's body in an environment
  where its parameters are bound to those values — calling `eval` on
  the body.

```
eval(expression)  ──▶  evaluate operator & operands  ──▶  apply(proc, args)
apply(proc, args) ──▶  bind params to args, then  ──▶  eval(body)
```

`eval` calls `apply`; `apply` calls `eval`. This mutual recursion *is*
the Lisp evaluator. In [Part V](/lisp/part-5-metacircular/eval-and-apply)
you'll write these two functions in Lisp itself — the famous
**metacircular evaluator** — and discover that the whole language fits
in about a page. The rules in this chapter are exactly what you'll
encode.

> :happygoose: Hold onto this: everything you've learned in Part I —
> S-expressions, cons cells, the three evaluation rules, special forms,
> eval/apply — is precisely what the Part V interpreter implements. The
> course has a spine: Part I describes the rules informally; Part V
> turns them into running code. When you write `eval` yourself, these
> four chapters will click into place as a single idea.

## 8. The REPL: read-eval-print-loop

Putting it together, a Lisp system's top level is the **REPL**:

1. **Read** — parse text into an S-expression
   ([Chapter 2](/lisp/part-1-core-idea/s-expressions)).
2. **Eval** — evaluate the S-expression to a value (this chapter).
3. **Print** — display the value.
4. **Loop** — go back to step 1.

```lisp
> (+ 1 2)        ; you type this (Read)
3                ; the REPL prints the result (Eval, Print)
> (define x 10)
x                ; define returns the symbol it bound
> (* x x)
100
>                ; Loop: ready for the next expression
```

The REPL is where you'll live. It's not a debugging afterthought (as
in some languages) but the primary way you develop Lisp: define a
function, test it at the prompt, redefine, retest — instant feedback.
[Chapter 22](/lisp/part-6-practical/the-repl-workflow) makes the REPL
workflow a craft.

> :weightliftinggoose: You now know the complete rules of Lisp
> evaluation: atoms self-evaluate, symbols look up, lists are function
> calls (evaluate all, apply the first to the rest), except special
> forms which have their own rules. That's the whole semantics. Get to
> a REPL and *verify* every worked example in this chapter by typing
> it. Predict, type, check. That loop is how the rules become reflex.

## What we covered

- Evaluation answers: what value does an S-expression produce?
- **Rule 1**: self-evaluating atoms (numbers, strings, booleans) →
  themselves.
- **Rule 2**: symbols → their binding in the environment (lookup).
- **Rule 3**: lists → function calls: evaluate all elements, apply the
  first (a procedure) to the rest.
- **Special forms** (`quote`, `if`, `define`, `lambda`, `let`,
  `and`/`or`) are the exceptions with their own rules — Lisp's
  built-in "syntax."
- Underneath: `eval` and `apply` in mutual recursion — the evaluator's
  core (built for real in Part V).
- The **REPL**: read-eval-print-loop, the primary Lisp workflow.

## What's next

That closes Part I — you now know the complete core of Lisp: its
syntax (S-expressions), its data (cons cells), and its semantics (the
evaluation rules). [Part II](/lisp/part-2-functional/functions-and-lambda)
builds the functional style on this foundation: `lambda`, recursion,
higher-order functions, and closures — the ideas Lisp gave the world.
