---
sidebar_position: 3
title: "Atoms, Lists, and Cons Cells"
---

# Atoms, Lists, and Cons Cells

> What lists are actually made of — the humble cons cell — and the
> three operations, `cons`, `car`, and `cdr`, that build and take
> apart every structure in Lisp.

Lists are the heart of Lisp (it's in the name). But a list isn't a
primitive — it's built from a tiny two-slot building block called the
**cons cell**. Understanding cons cells is understanding Lisp's data
model completely. There is almost nothing else.

## 1. Atoms: the indivisible values

An **atom** is anything that isn't a list — a value with no internal
list structure. The common atom types:

```lisp
42            ; integer
3.14          ; floating-point number
"hello"       ; string
foo           ; symbol (a name)
#\a           ; character (Scheme/CL notation)
#t  #f        ; booleans (Scheme); t / nil in Common Lisp
```

The most distinctively-Lisp atom is the **symbol** — a name like
`foo`, `+`, or `factorial`. Symbols are first-class values: you can
pass them around, store them, compare them. In code, a symbol usually
*names* something (a variable, a function); quoted, a symbol is just
itself, a piece of data.

```lisp
(define x 10)
x        ; => 10   (the symbol x, evaluated, gives its value)
'x       ; => x    (the symbol x, as data — the name itself)
```

> :nerdygoose: Symbols are interned: every occurrence of `foo` refers
> to the *same* symbol object, so symbol comparison is a fast pointer
> check (`eq?`). This is why symbols are perfect as keys, tags, and
> identifiers. A string `"foo"` is a sequence of characters; the
> symbol `foo` is a single, unique, interned name. Different things.

## 2. The cons cell: two slots

Here's the building block of everything. A **cons cell** is an object
with exactly **two slots**. Historically the slots are called:

- **car** — the first slot (originally "Contents of the Address part
  of Register").
- **cdr** — the second slot (originally "Contents of the Decrement
  part of Register"), pronounced "could-er."

The names are a 1950s IBM 704 hardware artifact, and Lispers have kept
them out of stubborn affection. You can read `car` as "first/head" and
`cdr` as "rest/tail."

You build a cons cell with `cons`:

```lisp
(cons 1 2)    ; => a cons cell with car=1, cdr=2, written (1 . 2)
```

The notation `(1 . 2)` — with a **dot** — is a "dotted pair": a cons
cell whose two slots hold `1` and `2`. You retrieve the slots with
`car` and `cdr`:

```lisp
(car (cons 1 2))   ; => 1
(cdr (cons 1 2))   ; => 2
```

That's the whole primitive layer: **`cons`** to build a pair,
**`car`** and **`cdr`** to read its two slots. Everything else is
built from these.

## 3. Lists are chains of cons cells

Here's the beautiful part. A **list** isn't a separate data type —
it's a *chain of cons cells* ending in the empty list. The list
`(1 2 3)` is:

```lisp
(cons 1 (cons 2 (cons 3 '())))
```

Read it inside-out: cons 3 onto the empty list `'()` to get `(3)`;
cons 2 onto that to get `(2 3)`; cons 1 onto that to get `(1 2 3)`.
Drawn as cons cells (each `[ car | cdr ]`):

```
[ 1 | ●—]──▶[ 2 | ●—]──▶[ 3 | ●—]──▶ ()
```

Each cell's **car** holds an element; each cell's **cdr** points to
the rest of the list. The chain ends with the **empty list** `'()`
(also written `nil` in Common Lisp). So:

```lisp
(car '(1 2 3))    ; => 1        (the first element)
(cdr '(1 2 3))    ; => (2 3)    (the rest of the list)
(car (cdr '(1 2 3)))   ; => 2   (second element)
(cdr (cdr (cdr '(1 2 3))))   ; => ()  (the empty list at the end)
```

**This is the single most important picture in Lisp.** A list is a
car (the first element) and a cdr (the rest, itself a list). That
recursive structure — element + smaller-list — is *why* recursion is
the natural way to process lists ([Chapter 6](/lisp/part-2-functional/recursion)).

> :surprisedgoose: A list is defined recursively: the empty list `()`
> is a list, and `(cons x lst)` is a list if `lst` is. So *every* list
> operation is naturally recursive: do something with the `car`, then
> recurse on the `cdr`. Once you see lists as "first + rest," recursive
> list code writes itself. This is the secret the whole language is
> built around.

## 4. The three primitives, in detail

**`cons`** — construct. `(cons x y)` makes a new cons cell with car
`x` and cdr `y`. To build a list, cdr-chain cons cells ending in `()`:

```lisp
(cons 'a '(b c))   ; => (a b c)   — prepend a to the list (b c)
(cons 1 '())       ; => (1)       — single-element list
```

`(cons x lst)` is "prepend `x` to the front of list `lst`" — and it's
cheap: one new cell, sharing the existing `lst` as its cdr. (No
copying. This structure-sharing is central to Lisp's efficiency and to
immutable functional style.)

**`car`** — first. `(car lst)` returns the first element (the car slot
of the first cons cell).

**`cdr`** — rest. `(cdr lst)` returns the rest of the list (everything
after the first element).

```lisp
(car '(a b c))   ; => a
(cdr '(a b c))   ; => (b c)
```

Composing `car` and `cdr` reaches any element. So common are these
compositions that Lisp provides shorthands: `cadr` = `(car (cdr ...))`
= second element; `caddr` = third; `cddr` = drop two; etc.

```lisp
(cadr '(a b c))    ; => b   — (car (cdr ...))
(caddr '(a b c))   ; => c   — (car (cdr (cdr ...)))
```

## 5. Dotted pairs vs proper lists

A **proper list** ends in the empty list `()`:

```lisp
(cons 1 (cons 2 '()))   ; => (1 2)   — proper list
```

A cons cell whose cdr is *not* a list is a **dotted pair** (or
"improper list"):

```lisp
(cons 1 2)              ; => (1 . 2)   — dotted pair, cdr is 2 not a list
(cons 1 (cons 2 3))     ; => (1 2 . 3) — improper list, ends in 3
```

Most of the time you work with proper lists. Dotted pairs are useful
for **key-value pairs** (association lists) and as a compact two-value
container:

```lisp
'((a . 1) (b . 2) (c . 3))   ; an "alist": list of (key . value) pairs
(car '(a . 1))    ; => a   (the key)
(cdr '(a . 1))    ; => 1   (the value)
```

The dot in `(a . 1)` is literally "this cons cell's car is `a` and its
cdr is `1`." A proper list `(a b c)` is shorthand the reader uses for
`(a . (b . (c . ())))` — it's dotted pairs all the way down, just
prettily printed.

## 6. The empty list and truth

The **empty list** `()` is special:

- In **Scheme**, `()` is its own thing, and the booleans are `#t` /
  `#f`. The empty list is *not* false (only `#f` is false).
- In **Common Lisp**, the empty list `()` *is* the same object as
  `nil`, which is *also* the boolean false. So in CL, "empty list" and
  "false" coincide — a frequent source of dialect confusion.

This course uses Scheme conventions (`#t`/`#f`, `()` distinct from
false) for clarity, noting CL differences where they matter.

To test for the empty list:

```lisp
(null? '())     ; => #t   (Scheme: is it the empty list?)
(null? '(1))    ; => #f
(empty? '())    ; some dialects;  (null '())  in Common Lisp
```

The empty list is the base case of nearly every recursive list
function: "if the list is empty, return the base value; otherwise
process the car and recurse on the cdr."

> :nerdygoose: The Common Lisp conflation of `nil` = `()` = false = the
> empty symbol is either elegant or maddening depending on who you ask.
> It makes `(if lst ...)` mean "if lst is non-empty," which is handy,
> but it means you can't have an empty list that's also "true." Scheme
> separates them. This is the single most common gotcha when moving
> between the two dialects.

## 7. Building and walking lists

With `cons`, `car`, `cdr`, and `null?`, you have everything to build
and traverse any list. A taste of what's coming in
[Part II](/lisp/part-2-functional/recursion) — computing a list's
length:

```lisp
(define (length lst)
  (if (null? lst)
      0                          ; empty list has length 0
      (+ 1 (length (cdr lst))))) ; else 1 + length of the rest

(length '(a b c d))   ; => 4
```

Read it: "if the list is empty, length is 0; otherwise it's 1 plus the
length of the rest." That's the universal shape of list recursion —
base case on `()`, recursive case on `(cdr lst)`. The cons-cell
structure *is* the recursion.

## 8. Beyond lists: trees and everything else

Because a cons cell can hold *anything* in its slots — including other
cons cells — you can build **any** data structure from cons cells:

- **Lists**: cdr-chains, as we've seen.
- **Trees**: cars and cdrs holding sub-trees. `(1 (2 3) (4 (5 6)))` is
  a tree.
- **Pairs / records**: dotted pairs, or small fixed lists.
- **Association lists** (alists): lists of `(key . value)` pairs — a
  simple map.

Lisp's data model is, at bottom, *atoms and cons cells*. From two
slots and three operations, the entire universe of Lisp data is built.
(Modern Lisps add vectors, hash tables, strings, etc. for efficiency,
but cons cells are the conceptual and historical foundation.)

> :weightliftinggoose: Internalize the cons-cell picture until it's
> reflex: a list is `[car | cdr]` chained to `()`. `cons` prepends,
> `car` takes the head, `cdr` takes the tail. Draw the boxes-and-arrows
> a few times by hand. Every recursive list function you'll ever write
> is just walking that chain — and the whole rest of this course rests
> on seeing it clearly.

## What we covered

- **Atoms** are non-list values: numbers, strings, characters,
  booleans, and **symbols** (interned names).
- A **cons cell** has two slots: **car** (first) and **cdr** (rest).
- `cons` builds a pair; `car`/`cdr` read the two slots.
- A **list is a chain of cons cells** ending in the empty list `()` —
  a recursive "first + rest" structure.
- `(cons x lst)` prepends cheaply (structure sharing).
- **Dotted pairs** `(a . b)` are cons cells whose cdr isn't a list;
  used for key-value pairs / alists.
- The empty list `()` is the recursion base case; Scheme keeps it
  distinct from false, Common Lisp conflates `()` = `nil` = false.
- Everything (lists, trees, records, maps) is built from cons cells.

## What's next

[Chapter 4](/lisp/part-1-core-idea/evaluation) — evaluation: the rules
of the game. Now that we know what S-expressions are made of, we learn
the precise rules by which the evaluator turns them into values. This
completes the core: read (done) + evaluate (next).
