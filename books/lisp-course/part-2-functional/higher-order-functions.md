---
sidebar_position: 3
title: "Higher-Order Functions: map, filter, reduce"
---

# Higher-Order Functions

> `map`, `filter`, and `reduce` capture the recursion patterns of the
> last chapter as reusable functions. You stop re-writing the skeleton
> and start composing — the leap from "writing loops" to "describing
> transformations."

[Chapter 6](/lisp/part-2-functional/recursion) showed that most list
functions share one skeleton. **Higher-order functions** (HOFs)
abstract that skeleton: they take a function as an argument and apply
it across a list in a standard pattern. Three of them — `map`,
`filter`, `reduce` — cover the vast majority of list processing.

## 1. What makes a function "higher-order"

A **higher-order function** is one that takes a function as an
argument, returns a function, or both. We met examples in
[Chapter 5](/lisp/part-2-functional/functions-and-lambda):
`apply-twice`, `compose`. Because functions are first-class values,
HOFs are natural in Lisp — and they're the tool that turns recursive
patterns into one-liners.

## 2. map: transform every element

`map` applies a function to each element of a list, collecting the
results:

```lisp
(map square '(1 2 3 4))            ; => (1 4 9 16)
(map (lambda (x) (* x 10)) '(1 2 3))  ; => (10 20 30)
(map car '((1 2) (3 4) (5 6)))     ; => (1 3 5)
```

This is exactly `my-map` from
[Chapter 6 §4](/lisp/part-2-functional/recursion) — the "produce a
list by transforming each element" pattern — but built in and reusable.
Instead of writing the recursion, you say *what to do to each element*
and `map` handles the traversal.

`map` can take **multiple lists**, applying the function to
corresponding elements:

```lisp
(map + '(1 2 3) '(10 20 30))   ; => (11 22 33)
```

> :nerdygoose: `map` is the purest expression of "describe the
> transformation, not the loop." You're not saying "start at index 0,
> loop while i < length, ...". You're saying "this function, applied
> to each element." The *how* (traversal) is abstracted away; you
> supply only the *what*. This declarative shift is the heart of
> functional programming.

## 3. filter: keep elements that pass a test

`filter` takes a **predicate** (a function returning true/false) and
keeps only the elements that satisfy it:

```lisp
(filter even? '(1 2 3 4 5 6))         ; => (2 4 6)
(filter (lambda (x) (> x 3)) '(1 2 3 4 5))  ; => (4 5)
(filter (lambda (s) (> (string-length s) 3)) '("a" "abcd" "xy"))  ; => ("abcd")
```

`filter` is the "selectively keep" pattern. Written from the skeleton
([Chapter 6](/lisp/part-2-functional/recursion)):

```lisp
(define (my-filter pred lst)
  (cond ((null? lst) '())
        ((pred (car lst))                       ; head passes the test
         (cons (car lst) (my-filter pred (cdr lst))))
        (else (my-filter pred (cdr lst)))))      ; head fails: skip it
```

Again, no magic — just the list-recursion skeleton with a predicate
deciding whether to `cons` each head. The built-in `filter` does this
for you.

## 4. reduce (fold): collapse a list to one value

`reduce` (also called `fold`) combines all elements into a single
value using a two-argument function and a starting value:

```lisp
(reduce + 0 '(1 2 3 4))      ; => 10   — ((((0+1)+2)+3)+4)
(reduce * 1 '(1 2 3 4 5))    ; => 120  — product
(reduce max 0 '(3 7 2 9 4))  ; => 9    — largest
```

`reduce` generalizes `sum`, `product`, `length`, `maximum` — anything
that collapses a list to one value. The arguments: a combining
function, an initial accumulator, and the list. It's the accumulator
recursion from [Chapter 6 §6](/lisp/part-2-functional/recursion),
abstracted:

```lisp
(define (my-reduce f init lst)
  (if (null? lst)
      init
      (my-reduce f (f init (car lst)) (cdr lst))))
```

> :surprisedgoose: `reduce` is the most powerful of the three — you can
> build `map` and `filter` *out of* `reduce`. (Reduce with a combining
> function that conses transformed/selected elements onto an
> accumulator.) Fold is the universal list-collapsing operation;
> theorists call it a "catamorphism." For everyday use: reach for
> `reduce` whenever you're turning a list into a single summary value.

## 5. Composing the three

The power comes from **chaining**. Real problems are often "transform,
then select, then summarize" — exactly `map` → `filter` → `reduce`:

> "Sum the squares of the even numbers in a list."

```lisp
(define (sum-of-even-squares lst)
  (reduce +
          0
          (map square
               (filter even? lst))))
(sum-of-even-squares '(1 2 3 4 5 6))   ; => 4 + 16 + 36 = 56
```

Read inside-out: `filter even?` keeps `(2 4 6)`; `map square` gives
`(4 16 36)`; `reduce +` sums to `56`. Three standard operations,
composed, express the whole computation declaratively. No explicit
loop, no index, no mutable accumulator variable — just a pipeline of
transformations.

In dialects with threading macros (Clojure's `->>`,
[Chapter 16](/lisp/part-4-macros/building-a-dsl)) you can write this
left-to-right as a pipeline, which reads even more naturally. But the
composition is the same idea.

## 6. Other useful higher-order functions

Beyond the big three, common HOFs include:

- **`for-each`** — like `map`, but for side effects (printing), discards
  results.
- **`find`** — return the first element satisfying a predicate.
- **`every?` / `any?`** (or `for-all` / `exists`) — does the predicate
  hold for all / some elements?
- **`sort`** — sort a list, given a comparison function:

```lisp
(sort '(3 1 4 1 5 9 2 6) <)        ; => (1 1 2 3 4 5 6 9)
(sort '("banana" "apple" "cherry") string<?)  ; => ("apple" "banana" "cherry")
```

`sort` taking a comparison *function* is another first-class-function
payoff: one `sort` handles any ordering you can express as a function.

## 7. Why this beats explicit loops

Compare the functional version to an imaginary imperative one:

```
// imperative pseudo-code
total = 0
for x in lst:
    if x is even:
        total = total + x*x
return total
```

vs.

```lisp
(reduce + 0 (map square (filter even? lst)))
```

The functional version:

- **Says what, not how**: no loop counter, no mutable `total`, no
  index arithmetic to get wrong.
- **Composes**: each piece (`filter even?`, `map square`, `reduce +`)
  is independently understandable and reusable.
- **Is harder to get wrong**: no off-by-one errors, no forgetting to
  initialize the accumulator, no mutation bugs.

This is the practical payoff of the functional style: programs become
pipelines of small, named transformations rather than tangles of
mutable state and control flow.

> :happygoose: The shift from "write a loop" to "compose map/filter/
> reduce" is the single most transferable thing in this course. You'll
> use it in Python (`map`, comprehensions), JavaScript (`.map`,
> `.filter`, `.reduce`), Rust (iterators), SQL (it's basically
> filter/map/reduce), and Spark (literally map and reduce). Lisp is
> where these were forged. Learn them here and you've learned them
> everywhere.

## 8. Exercises

Using only `map`, `filter`, `reduce` (and small lambdas), write:

1. `(count-if pred lst)` — how many elements satisfy `pred`? (Hint:
   filter then length, or reduce.)
2. `(maximum lst)` — the largest element. (reduce with `max`.)
3. `(flatten-one lst)` — given a list of lists, concatenate them into
   one list. (reduce with `append`.)
4. `(average lst)` — the mean of a list of numbers. (sum / count.)

Then re-solve exercise 1 from [Chapter 6](/lisp/part-2-functional/recursion)
(`member?`) using `any?` — and notice how much shorter it is when the
pattern is already abstracted.

> :weightliftinggoose: The discipline to build: before writing a
> recursive list function by hand, ask "is this a map, a filter, a
> reduce, or a composition of them?" Nine times out of ten it is, and
> the HOF version is shorter and clearer. Save hand-written recursion
> ([Chapter 6](/lisp/part-2-functional/recursion)) for the cases that
> genuinely don't fit the patterns (trees, irregular traversals). For
> everything else: map, filter, reduce.

## What we covered

- A **higher-order function** takes and/or returns functions.
- **`map`** — transform every element (produce a list).
- **`filter`** — keep elements passing a predicate.
- **`reduce`/`fold`** — collapse a list to one value with a combining
  function + initial accumulator; the most general of the three.
- Each is the corresponding list-recursion skeleton, abstracted and
  reusable.
- **Composing** map/filter/reduce expresses complex transformations
  declaratively (e.g., sum-of-even-squares).
- Other HOFs: `for-each`, `find`, `every?`/`any?`, `sort` (with a
  comparison function).
- The functional pipeline beats explicit loops: what-not-how,
  composable, fewer bugs — and transfers to every modern language.

## What's next

[Chapter 8](/lisp/part-2-functional/closures-and-lexical-scope) —
closures and lexical scope. How functions "remember" the variables
where they were created (we saw a hint in `compose` and `adder`), and
why closures are the mechanism behind so much of Lisp's power.
