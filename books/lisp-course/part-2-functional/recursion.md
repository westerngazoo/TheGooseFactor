---
sidebar_position: 2
title: "Recursion and the List as a Recursive Structure"
---

# Recursion and the List as a Recursive Structure

> The cons-cell picture meets the function tools, and recursive list
> processing — the soul of Lisp programming — falls out. If you learn
> one chapter deeply, make it this one.

A list is "first + rest" ([Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons)).
A list is *defined recursively*. So the natural way to process a list
is *recursively*: do something with the first element, then recurse on
the rest. This chapter makes that the reflex it should be.

## 1. Recursion: a function that calls itself

A **recursive** function solves a problem by solving a smaller version
of the same problem. Two ingredients, always:

1. A **base case**: the smallest problem, solved directly (no
   recursion).
2. A **recursive case**: reduce the problem to a smaller one, call
   yourself, combine.

The classic non-list example, factorial:

```lisp
(define (factorial n)
  (if (= n 0)
      1                              ; base case: 0! = 1
      (* n (factorial (- n 1)))))    ; recursive case: n! = n * (n-1)!
(factorial 5)   ; => 120
```

`(factorial 5)` calls `(factorial 4)` calls `(factorial 3)` ... down to
`(factorial 0)` which returns `1` without recursing. Then the
multiplications unwind: `1 * 1 * 2 * 3 * 4 * 5 = 120`. The base case
stops the descent; without it, infinite recursion.

> :nerdygoose: Every recursion needs a base case that's *actually
> reached*. `(factorial (- n 1))` works because subtracting 1
> eventually hits 0. If you recursed on `(factorial n)` or
> `(factorial (+ n 1))`, you'd never reach the base case — infinite
> recursion, stack overflow. The recursive call must move *toward* the
> base case. This is the #1 recursion bug.

## 2. Lists are recursive, so list functions are recursive

Here's the key connection. Recall: a list is either empty `()`, or a
cons of a first element onto a smaller list. That's a *recursive
definition*. So list functions follow the structure exactly:

> - **Base case**: the list is empty (`null?`). Return the base value.
> - **Recursive case**: process the `car`, recurse on the `cdr`,
>   combine.

This template — call it the **list recursion skeleton** — generates
almost every basic list function. Memorize its shape:

```lisp
(define (process lst)
  (if (null? lst)
      base-value                          ; empty list
      (combine (car lst)                  ; first element
               (process (cdr lst)))))     ; recurse on the rest
```

Fill in `base-value` and `combine`, and you have a list function. Let's
fill it in three times.

## 3. Three functions from one skeleton

**Sum of a list.** Base value `0`, combine with `+`:

```lisp
(define (sum lst)
  (if (null? lst)
      0
      (+ (car lst) (sum (cdr lst)))))
(sum '(1 2 3 4))   ; => 10
```

`(sum '(1 2 3 4))` = `1 + (sum '(2 3 4))` = `1 + 2 + (sum '(3 4))` =
... = `1 + 2 + 3 + 4 + 0` = `10`.

**Length of a list.** Base value `0`, combine by adding 1 (ignore the
element's value):

```lisp
(define (length lst)
  (if (null? lst)
      0
      (+ 1 (length (cdr lst)))))
(length '(a b c d))   ; => 4
```

**Append one element-test... actually, membership.** Does a list
contain an item?

```lisp
(define (member? x lst)
  (if (null? lst)
      #f                          ; empty: not found
      (if (equal? x (car lst))
          #t                      ; found at the head
          (member? x (cdr lst))))) ; else search the rest
(member? 3 '(1 2 3 4))   ; => #t
(member? 9 '(1 2 3 4))   ; => #f
```

Same skeleton every time: check for empty, otherwise combine the head
with the recursion on the tail. Once you see it, you stop *inventing*
list functions and start *instantiating the template*.

> :surprisedgoose: The list-recursion skeleton is so reliable that
> experienced Lispers write these functions almost without thinking.
> "Process a list" → "if null, base case; else do the car, recurse on
> the cdr." It's not cleverness; it's pattern. The cons-cell structure
> from [Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons) *is* the
> recursion pattern — the data shape and the code shape are the same.

## 4. Building lists recursively: map by hand

The functions above *consume* lists (returning a number or boolean).
To *produce* a list, the combine step uses `cons`. Here's `map` — apply
a function to every element — written from the skeleton:

```lisp
(define (my-map f lst)
  (if (null? lst)
      '()                              ; empty in, empty out
      (cons (f (car lst))              ; transform the head
            (my-map f (cdr lst)))))    ; recurse on the tail
(my-map square '(1 2 3 4))   ; => (1 4 9 16)
```

The combine step `cons`es the transformed head onto the recursively-
mapped tail, rebuilding the list one element at a time. This is the
canonical "produce a list" recursion: base value `'()`, combine with
`cons`. (`map` is built in — [Chapter 7](/lisp/part-2-functional/higher-order-functions)
— but writing it yourself shows there's no magic.)

## 5. Recursion on trees (nested lists)

Lists can nest ([Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons)),
forming trees. Tree recursion recurses on *both* the car and the cdr.
Counting all atoms in a nested structure:

```lisp
(define (count-atoms tree)
  (cond ((null? tree) 0)                       ; empty
        ((not (pair? tree)) 1)                 ; an atom: count 1
        (else (+ (count-atoms (car tree))      ; recurse into the car
                 (count-atoms (cdr tree))))))  ; and the cdr
(count-atoms '(1 (2 3) (4 (5 6))))   ; => 6
```

This recurses in *two* directions (car and cdr), mirroring the
two-way branching of the tree. `pair?` tests whether something is a
cons cell (a non-empty list); `cond` is a multi-branch conditional
([Chapter 11](/lisp/part-3-building-up/conditionals)). Tree recursion
is the natural tool whenever data nests — and since code is nested
lists, it's exactly how the Part V interpreter walks programs.

## 6. The two recursion patterns: build-up vs accumulate

The `sum` above builds up a pending computation: `1 + (2 + (3 + ...))`.
All the `+`s wait until the base case, then unwind. The call stack
grows with the list length.

An alternative carries a running result in an **accumulator**:

```lisp
(define (sum-acc lst acc)
  (if (null? lst)
      acc                                   ; return the accumulated total
      (sum-acc (cdr lst) (+ acc (car lst))))) ; add head into acc, recurse
(sum-acc '(1 2 3 4) 0)   ; => 10
```

Here the addition happens *before* the recursive call, and the
recursive call is the *last* thing the function does. This is **tail
recursion**, and it can run in constant stack space — the subject of
[Chapter 12](/lisp/part-3-building-up/tail-calls-and-iteration). For
now, notice there are two shapes: build-up (combine after recursing)
and accumulate (combine before recursing). Both are common; the
accumulator version is friendlier to long lists.

## 7. Thinking recursively: trust the recursion

The mental trick that makes recursion click: **assume the recursive
call already works**, then just handle one step plus the base case.

When writing `(sum lst)`, don't trace the whole stack in your head.
Instead reason: "Assume `(sum (cdr lst))` correctly sums the rest.
Then `(sum lst)` is just `(car lst)` plus that." Handle the base case
(empty → 0), trust the recursion for the rest, and you're done. This
"recursive leap of faith" is the skill. Trace a small example once to
build confidence, then trust it.

> :happygoose: The leap of faith feels like cheating but it's the
> whole technique. You don't simulate the recursion; you *assume it
> works on the smaller input* and combine one step. Get the base case
> right, get the one-step combination right, and the recursion takes
> care of the rest by induction. This is the same reasoning as
> mathematical induction — base case plus inductive step — which is no
> coincidence.

## 8. Exercises

Write these from the list-recursion skeleton (solutions use only
`cons`, `car`, `cdr`, `null?`, `if`/`cond`, and arithmetic):

1. `(last-elem lst)` — return the last element of a non-empty list.
2. `(my-reverse lst)` — reverse a list. (Hint: an accumulator helps.)
3. `(my-append a b)` — concatenate two lists. (Hint: recurse on `a`,
   cons its elements onto `b`.)
4. `(deep-reverse tree)` — reverse a list *and* all nested sublists.

Try them at the REPL before peeking at any reference. The skeleton
plus the leap of faith carries all four.

> :weightliftinggoose: Recursion is *the* fundamental Lisp skill —
> more than syntax, more than macros. Drill it: take any list problem
> and force yourself to write it recursively (base case + car/cdr
> step) before reaching for anything else. Do the four exercises. The
> goal is for the list-recursion skeleton to become as automatic as a
> `for` loop is in other languages. Once it is, you think in Lisp.

## What we covered

- **Recursion** = base case (solved directly) + recursive case
  (reduce to a smaller problem, call yourself, combine).
- The recursive call must move *toward* the base case.
- A **list is recursively defined** (first + rest), so list functions
  follow the **list-recursion skeleton**: `null?` → base; else combine
  `(car lst)` with `(process (cdr lst))`.
- One skeleton generates `sum`, `length`, `member?`, `map`, and more.
- **Producing** a list uses `cons` to combine; **consuming** returns a
  scalar.
- **Tree recursion** recurses on both car and cdr (for nested data).
- Two shapes: build-up (combine after recursing) vs accumulate
  (combine before — tail recursion, [Ch 12](/lisp/part-3-building-up/tail-calls-and-iteration)).
- The **recursive leap of faith**: assume the recursive call works,
  handle one step + base case.

## What's next

[Chapter 7](/lisp/part-2-functional/higher-order-functions) —
higher-order functions. `map`, `filter`, and `reduce` capture the
list-recursion patterns of this chapter as reusable functions, so you
stop re-writing the skeleton and start composing.
