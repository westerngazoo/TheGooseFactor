---
sidebar_position: 1
title: "Quote, Quasiquote, Unquote"
---

# Quote, Quasiquote, Unquote

> The toolkit for building code as data. Before you can write code
> that writes code (macros), you need to *construct* code
> conveniently. Quote, quasiquote, and unquote are how.

Macros ([Chapter 14](/lisp/part-4-macros/your-first-macro)) are
functions that take code and return new code. To return code, you must
*build* code — build lists that represent programs. The quoting
toolkit makes that ergonomic. This chapter is the prerequisite.

## 1. Recap: quote gives you data

From [Chapter 2](/lisp/part-1-core-idea/s-expressions): `quote` (`'`)
returns its argument as an unevaluated S-expression — data, not a
computation:

```lisp
'(+ 1 2)      ; => the list (+ 1 2), as data
'(a b c)      ; => the list (a b c)
'x            ; => the symbol x
```

`'(+ 1 2)` is a three-element list you can take apart with `car`/`cdr`
([Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons)). It's a *piece
of code, represented as data* — exactly what a macro produces. So
`quote` is how you write code-as-data literally.

## 2. The limitation: quote is all-or-nothing

`quote` freezes its *entire* argument. But when building code, you
usually want a *template* — mostly fixed structure, with a few *holes*
filled by computed values. Plain `quote` can't do holes:

```lisp
(define name 'fred)
'(hello name)     ; => (hello name)  — NOT what we want!
                  ; we wanted (hello fred), with name's VALUE inserted
```

`'(hello name)` quotes everything, so `name` stays the literal symbol
`name`, not its value `fred`. To build `(hello fred)` we need to quote
*most* of the list but *evaluate* `name`. That's what quasiquote
provides.

## 3. Quasiquote and unquote: templates with holes

**Quasiquote** (backtick `` ` ``) is like quote, but it allows
**unquote** (comma `,`) to punch holes that *are* evaluated:

```lisp
(define name 'fred)
`(hello ,name)    ; => (hello fred)  — name is unquoted, so its value fills in
```

The backtick `` ` `` quotes the structure; the comma `,` says
"evaluate this part and insert the result." So `` `(hello ,name) `` is
"the list `(hello X)` where `X` is the value of `name`." Everything not
preceded by a comma is literal; everything after a comma is computed.

```lisp
(define x 10)
`(the answer is ,x)              ; => (the answer is 10)
`(sum is ,(+ 1 2 3))             ; => (sum is 6)
`(a b ,(* 2 5) c)                ; => (a b 10 c)
`(,x squared is ,(* x x))        ; => (10 squared is 100)
```

This is the template mechanism: `` `(...) `` is the template, `,expr`
are the holes. It's exactly what you need to build code with computed
pieces.

> :surprisedgoose: Quasiquote/unquote is string interpolation for
> *code*. Where a templated string is `"hello ${name}"`, a quasiquoted
> list is `` `(hello ,name) ``. But instead of producing a string, it
> produces a *structured list* — a piece of code you can evaluate or
> hand to a macro. This is the homoiconicity payoff: "interpolating
> code" is as easy as interpolating a string, because code *is* a data
> structure.

## 4. Unquote-splicing: insert a list's elements

Sometimes the hole should contribute *multiple* elements, not one.
`,x` inserts the value of `x` as a single element. **Unquote-splicing**
(`,@`) splices a *list's elements* into the surrounding list:

```lisp
(define items '(2 3 4))
`(1 ,items 5)      ; => (1 (2 3 4) 5)   — items inserted as ONE element
`(1 ,@items 5)     ; => (1 2 3 4 5)     — items' ELEMENTS spliced in
```

`,@items` removes the parentheses, splicing `2 3 4` directly into the
list. This is essential for macros that build code from a variable
number of pieces — e.g., a macro wrapping a body of several
expressions:

```lisp
(define body '((display "hi") (newline) (+ 1 2)))
`(begin ,@body)    ; => (begin (display "hi") (newline) (+ 1 2))
```

`,@body` splices the three body expressions into the `begin`. Without
splicing, you'd get `(begin ((display "hi") ...))` — an extra layer of
parentheses, wrong. Splicing is how macros assemble bodies.

## 5. The three tools together

A summary, with one example using all three:

| Tool | Symbol | Effect |
|---|---|---|
| quasiquote | `` ` `` | quote the structure (template) |
| unquote | `,` | evaluate this, insert as one element |
| unquote-splicing | `,@` | evaluate this (a list), splice its elements |

```lisp
(define op '*)
(define args '(2 3 4))
`(,op ,@args)      ; => (* 2 3 4)   — build a function call as data!
```

That last line *constructs the code* `(* 2 3 4)` — a multiplication of
three numbers — from a variable operator and a variable argument list.
Evaluate it and you'd get `24`. This is precisely what macros do:
assemble code (as lists) from parts, to be evaluated later.

## 6. Nesting and the literal comma

Quasiquotes can nest (rare, mostly in macro-writing macros), and there
are edge cases (a literal comma, deeply nested unquotes) that we'll
skip — they're advanced and seldom needed. For the vast majority of
macro writing, the three tools above, used one level deep, are all you
need:

- `` ` `` to start a code template,
- `,` to drop in a computed value,
- `,@` to splice in a computed list.

## 7. Building code without quasiquote

You *can* build code with plain `list` and `cons`, without quasiquote
— it's just verbose:

```lisp
;; To build (hello fred):
(list 'hello name)              ; => (hello fred)   — with list
`(hello ,name)                  ; => (hello fred)   — with quasiquote
```

For small structures they're comparable, but for realistic code
templates, quasiquote is dramatically clearer:

```lisp
;; Building (if test then else) — with list/cons:
(list 'if test then else)
;; with quasiquote:
`(if ,test ,then ,else)
```

The quasiquote version *looks like the code it produces*, with commas
marking the variable parts. That visual correspondence is why
quasiquote is the standard tool for macros. Reserve raw `list`/`cons`
for when you're building structure programmatically (e.g., in a loop).

> :nerdygoose: There's a deep elegance here. `` `(if ,test ,then ,else)``
> reads almost identically to the `(if test then else)` it generates —
> you can *see* the output in the template. This is unique to
> homoiconic languages. In a non-Lisp language, generating code means
> assembling strings (`"if (" + test + ") {"`), which is fragile and
> unreadable. In Lisp, the code template *is* the code, with holes.
> Quasiquote makes metaprogramming feel like ordinary programming.

## 8. Practice

Predict each result:

```lisp
(define n 5)
(define lst '(a b c))

`(n is ,n)                ; => ?
`(list has ,(length lst) items)  ; => ?
`(first ,(car lst) rest ,@(cdr lst))  ; => ?
`(define (f x) (* x ,n)) ; => ?
```

Answers: `(n is 5)`; `(list has 3 items)`; `(first a rest b c)`;
`(define (f x) (* x 5))`. That last one is a *piece of code* — a
function definition with `5` baked in — exactly the kind of thing a
macro generates. Type them at the REPL to confirm.

> :weightliftinggoose: Master the comma. The mental model:
> backtick-everything-is-literal, comma-this-part-is-live,
> comma-at-splice-this-list-in. Practice building code templates with
> quasiquote until it's automatic — `` `(when ,cond ,@body) `` should
> roll off your fingers. This is the keyboard skill that makes the
> next three chapters (writing actual macros) flow. Code templates are
> the macro-writer's bread and butter.

## What we covered

- `quote` (`'`) freezes an entire expression as data — all-or-nothing.
- **Quasiquote** (`` ` ``) is a code *template*: literal structure with
  evaluatable holes.
- **Unquote** (`,`) evaluates a part and inserts it as one element.
- **Unquote-splicing** (`,@`) splices a list's *elements* into the
  surrounding list (essential for bodies/variadic parts).
- Together they *construct code as data* — e.g.,
  `` `(,op ,@args) `` builds a function call.
- Quasiquote beats raw `list`/`cons` for code templates because the
  template *looks like* the output.
- It's "string interpolation for code," enabled by homoiconicity.

## What's next

[Chapter 14](/lisp/part-4-macros/your-first-macro) — your first macro.
Now that you can build code, you'll write a function that *receives*
code (unevaluated), *transforms* it, and *returns* new code — the thing
that makes Lisp uniquely extensible.
