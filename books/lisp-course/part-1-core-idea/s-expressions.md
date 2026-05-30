---
sidebar_position: 2
title: "S-expressions and the Reader"
---

# S-expressions and the Reader

> The precise structure of Lisp syntax, and the "reader" — the stage
> that turns text into data, before any evaluation happens. The first
> half of how Lisp runs.

[Chapter 1](/lisp/part-1-core-idea/why-lisp) said the syntax is one
rule. This chapter makes it precise. The key insight: Lisp runs in
**two stages** — first the *reader* turns text into a data structure,
then the *evaluator* runs that data structure. Understanding the split
is understanding Lisp.

## 1. What is an S-expression?

**S-expression** (symbolic expression, or "sexp") is the name for
Lisp's universal syntactic form. The grammar:

> An **S-expression** is either:
> - an **atom** (a number, symbol, string, character, boolean), or
> - a **list**: `(` followed by zero or more S-expressions followed by
>   `)`.

That recursive definition is the *entire* surface syntax of Lisp.
Examples of S-expressions:

```lisp
42                      ; an atom (number)
foo                     ; an atom (symbol)
"hello"                 ; an atom (string)
()                      ; the empty list
(1 2 3)                 ; a list of three atoms
(+ 1 2)                 ; a list: symbol +, then 1, then 2
(a (b c) d)             ; a list containing a nested list
(define (sq x) (* x x)) ; a list of lists — a function definition
```

Every one of these is "just" an S-expression. The deeply nested
function definition and the flat list `(1 2 3)` are the same *kind* of
thing: trees built from atoms and lists.

## 2. The two stages: read, then evaluate

Here is the mental model that unlocks Lisp:

```
text  ──reader──▶  S-expression (data)  ──evaluator──▶  value
```

1. **The reader** (also called the *parser*) takes a stream of
   characters — the text you typed — and produces an S-expression: a
   tree of atoms and lists. This is pure *parsing*. No code runs.
2. **The evaluator** takes that S-expression (now a data structure)
   and *evaluates* it to produce a value. This is where computation
   happens ([Chapter 4](/lisp/part-1-core-idea/evaluation)).

The text `(+ 1 2)` is **read** into the three-element list `(+ 1 2)`
(as data), and then that list is **evaluated** to the number `3`.

Most languages fuse parsing and execution conceptually. Lisp keeps
them sharply separate, and exposes both: you can `read` text into data
without evaluating it, and you can `eval` data without re-parsing text.

> :nerdygoose: This two-stage split is exactly why "code is data"
> works. After the reader runs, your program is a list — a normal
> value. A macro ([Part IV](/lisp/part-4-macros/your-first-macro)) is a
> function that intercepts the S-expression *between* read and eval,
> transforming the data before it's evaluated. The clean read/eval
> separation is the architecture that makes macros possible.

## 3. The reader in action

Imagine a function `read` that consumes text and returns data. (Real
Lisps have exactly this function.)

```lisp
(read "(+ 1 2)")     ; => the list (+ 1 2), as data — NOT evaluated
(read "42")          ; => the number 42
(read "(a (b c))")   ; => the nested list (a (b c))
```

`read` does *not* compute anything about `+` or `1`. It just builds
the tree. The list `(+ 1 2)` it returns is inert data — you could
print it, take it apart, store it, or modify it. Only when you pass it
to `eval` does the addition happen:

```lisp
(eval (read "(+ 1 2)"))   ; => 3
```

`read` then `eval` is, in fact, the whole top-level loop of a Lisp
system (the "RE" of REPL — Read, Eval, Print, Loop).

## 4. Quoting: getting data without evaluation

Normally, when you type `(+ 1 2)` at the REPL, it's read *and*
evaluated — you get `3`, not the list. So how do you get the *list*
itself, the data, without it being evaluated?

You **quote** it:

```lisp
'(+ 1 2)      ; => the list (+ 1 2), as data
(+ 1 2)       ; => 3, the evaluated result
```

The single quote `'` says "don't evaluate this — give me the
S-expression as data." `'(+ 1 2)` is shorthand for `(quote (+ 1 2))`,
and `quote` is the special form that returns its argument unevaluated.

```lisp
'foo          ; => the symbol foo (not its value)
'(1 2 3)      ; => the list (1 2 3)
'(a b (c d))  ; => the nested list (a b (c d))
```

Quoting is your handle on the "data" side of "code is data." It lets
you write down a list literally instead of evaluating it as a function
call. We'll lean on it constantly — and [Part IV](/lisp/part-4-macros/quote-quasiquote-unquote)
generalizes it into the macro toolkit.

> :surprisedgoose: `'(+ 1 2)` and `(+ 1 2)` differ by one character and
> mean completely different things: the data structure vs the number 3.
> This is the cleanest possible illustration of code-as-data. The
> *same* list is either inert data (quoted) or a program to run
> (unquoted), depending only on whether you evaluate it. Same bytes,
> two meanings.

## 5. Comments and whitespace

A few practical reader details:

- **Whitespace** (spaces, tabs, newlines) separates atoms but is
  otherwise insignificant. `(+ 1 2)` and `(+   1    2)` and a
  multi-line version all read to the same list. Indentation is for
  humans, not the reader.
- **Comments** start with `;` and run to the end of the line:

```lisp
(+ 1 2)   ; this is a comment; the reader ignores it
; a whole-line comment
```

- Some Lisps add block comments (`#| ... |#` in Common Lisp/Scheme)
  and datum comments (`#;` skips the next S-expression in Scheme).

The reader skips comments and whitespace, so they never appear in the
resulting data structure.

## 6. The structure is a tree

An S-expression with nesting is a **tree**. The expression

```lisp
(* (+ 1 2) (- 5 3))
```

reads to this tree:

```
        (*)
       /   \
     (+)    (-)
    / \    / \
   1   2  5   3
```

The outer list `(* ... ...)` has three elements: the symbol `*`, the
sub-list `(+ 1 2)`, and the sub-list `(- 5 3)`. Each sub-list is
itself a tree. This is the **abstract syntax tree** (AST) of the
program — except in Lisp, the AST *is* the source code, with no
separate parsing into a different representation. The parentheses you
type are the tree.

In other languages, the compiler parses your text into an AST that you
never see. In Lisp, you write the AST directly. That's the deep
meaning of "the structure you see is the structure that runs"
([Chapter 1](/lisp/part-1-core-idea/why-lisp)).

## 7. Why "S-expression"? (and a historical aside)

McCarthy originally planned *two* notations: **S-expressions**
(symbolic, the parenthesized data form) and **M-expressions**
(meta, a more conventional `f[x; y]` syntax for writing functions).
The M-expressions were meant to be the language programmers wrote; the
S-expressions were the internal data representation.

But programmers started writing S-expressions directly — and
discovered that *because code was written in the data notation*, they
could manipulate code as data. The "temporary" notation became the
language. M-expressions were never really implemented. Homoiconicity
was, in a sense, a happy accident that the community refused to give
up.

> :nerdygoose: If M-expressions had won, Lisp would have looked more
> like Algol and we'd have lost homoiconicity — code and data would
> have had different syntaxes, and macros as we know them couldn't
> exist. The "ugly" parenthesized notation is precisely what makes
> Lisp Lisp. Sometimes the accident is the feature.

## 8. Reading exercise

Before moving on, read these S-expressions in your head — identify
each as an atom or a list, and for lists, count the elements and find
the nesting:

```lisp
(define pi 3.14159)
(list 1 2 (list 3 4) 5)
(if (> x 0) (print "positive") (print "non-positive"))
'((a . 1) (b . 2) (c . 3))
```

Answers: a 3-element list; a 4-element list (one element is itself a
3-element list); a 4-element list with two nested 2-element lists; a
quoted 3-element list of pairs (we'll meet the `.` dotted-pair
notation in [Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons)).

> :weightliftinggoose: The skill to build now is *seeing the tree* in
> the parentheses. Fluent Lispers don't count parens one at a time —
> they see the nested structure at a glance, the way you see words not
> letters. A paren-matching editor helps enormously. Read lots of
> S-expressions; the tree-vision comes fast.

## What we covered

- An **S-expression** is an atom or a parenthesized list of
  S-expressions — the entire surface syntax.
- Lisp runs in **two stages**: the *reader* turns text into data
  (S-expressions), then the *evaluator* runs that data.
- `read` parses text to data without evaluating; `eval` runs the data.
- **Quoting** (`'x` = `(quote x)`) gives you the S-expression as data,
  unevaluated — the handle on "code as data."
- Whitespace separates atoms; `;` starts a comment.
- An S-expression is a tree (an AST) — and in Lisp, the AST *is* the
  source.
- Historical aside: S-expressions were meant to be internal;
  programmers adopted them and got homoiconicity.

## What's next

[Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons) — atoms, lists,
and cons cells. What lists are actually *made of* (the humble cons
cell), and the three operations — `cons`, `car`, `cdr` — that build
and take apart every data structure in Lisp.
