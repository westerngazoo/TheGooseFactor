---
sidebar_position: 3
title: "Method Combination"
---

# Method Combination

> When several methods apply, CLOS doesn't just pick one — it *combines*
> them. Primary methods do the main work; `:before` and `:after` methods
> wrap them; `:around` methods wrap everything; and `call-next-method`
> threads control through the layers. This is composable, layered
> behavior that plain inheritance can't express.

In [Chapter 29](/lisp/part-8-clos/generic-functions) you saw CLOS find
the *applicable* methods and run the *most specific*. That was a
simplification. What CLOS actually does is richer: it builds an
**effective method** by combining *all* the applicable methods according
to their roles. Understanding that combination is understanding what
makes CLOS more than "OOP with the arguments reordered."

## 1. Primary methods and the default combination

The methods you've written so far are **primary methods** — they do the
main work. Under the default *standard method combination*, if several
primary methods apply (because of inheritance), CLOS runs the **most
specific one**, and that method may explicitly call the next:

```lisp
(defclass animal () ())
(defclass dog (animal) ())

(defmethod describe-it ((a animal)) "an animal")
(defmethod describe-it ((d dog))    "a dog")

(describe-it (make-instance 'dog))   ; => "a dog"  (most specific primary)
```

Only the `dog` primary runs by default — the `animal` one is shadowed,
*unless* `dog` chooses to call it. That choice is the next idea.

## 2. call-next-method: threading through the chain

A primary method can invoke the **next most specific** primary method
with `call-next-method`. This is CLOS's `super` — but more flexible,
because it's an explicit call you can place anywhere and pass arguments
to:

```lisp
(defmethod describe-it ((a animal)) "a living thing")

(defmethod describe-it ((d dog))
  (format nil "a dog, which is ~a" (call-next-method)))  ; calls the animal method

(describe-it (make-instance 'dog))
; => "a dog, which is a living thing"
```

`call-next-method` runs the `animal` primary and returns its value, which
the `dog` method weaves into its own result. You can call it before,
after, or in the middle of your work; you can even pass it modified
arguments. `next-method-p` tells you whether a next method exists, so you
can avoid calling into nothing. This chains the whole CPL
([Chapter 30](/lisp/part-8-clos/classes-and-slots)) of primary methods,
under your control.

## 3. Auxiliary methods: before, after, around

Beyond primaries, a method can have a **qualifier** marking it as
auxiliary — code that runs *around* the primary method automatically,
without anyone calling it explicitly:

- **`:before`** methods run *before* the primary, most-specific first.
  For setup, validation, logging-in.
- **`:after`** methods run *after* the primary, most-specific **last**
  (reverse order). For teardown, logging-out, cleanup.
- **`:around`** methods *wrap the whole thing* and decide whether/when to
  proceed (via `call-next-method`).

```lisp
(defmethod withdraw :before ((acct account) amount)
  (when (> amount (balance acct))
    (error "insufficient funds")))     ; runs BEFORE the real withdraw

(defmethod withdraw ((acct account) amount)
  (decf (balance acct) amount))         ; the primary: the actual work

(defmethod withdraw :after ((acct account) amount)
  (log-transaction acct amount))        ; runs AFTER, once the work is done
```

Crucially, `:before` and `:after` methods **don't** need anyone to call
them and their return values are ignored — they're for side effects that
*wrap* the primary. You add a validation check or a log line as a
separate method, without editing the primary at all.

## 4. The standard combination order

Put it all together. When you call a generic function under standard
combination, CLOS runs the applicable methods in this exact order:

```
1. all :around methods       (most specific first; outermost wrapper)
       │  each may call-next-method to proceed inward
       ▼
2. all :before methods       (most specific first)
       ▼
3. the most specific primary (which may call-next-method up the chain)
       ▼
4. all :after methods        (most specific LAST — reverse order)
       ▲
   then control returns back out through the :around methods
```

The `:around` methods form the outermost layer (they can short-circuit
the whole call); inside them, `:before`s fire, then the primary chain,
then `:after`s in reverse, then control unwinds back out through the
`:around`s. The value the caller sees is whatever the outermost
`:around` returns (or the primary's value, if there are no `:around`s).

> :nerdygoose: This "most-specific `:before` first, most-specific
> `:after` *last*" symmetry is the same shape as constructors and
> destructors in nested scopes: you set up outermost-in, tear down
> innermost-out. CLOS makes that wrapping *declarative* — you don't write
> the nesting by hand; you just tag methods with roles and CLOS assembles
> the onion. It's the structure of `unwind-protect`
> ([Chapter 27](/lisp/part-7-advanced-control/dynamic-variables)),
> generalized across an inheritance hierarchy and handed to you for free.

## 5. A worked example: around for cross-cutting concerns

`:around` methods are perfect for **cross-cutting concerns** — timing,
caching, logging, transactions — because they wrap the entire call and
control whether it proceeds:

```lisp
(defmethod compute :around ((p problem))
  (let ((start (get-internal-real-time)))
    (let ((result (call-next-method)))         ; run the real computation
      (format t "compute took ~a ticks~%"
              (- (get-internal-real-time) start))
      result)))                                 ; return the real result
```

The `:around` method times the call, prints, and passes the real result
through. The primary `compute` method knows nothing about timing. Want
caching instead? An `:around` that checks a table and only
`call-next-method`s on a miss. This is aspect-oriented programming,
built into the object system — concerns layered on without touching the
code they wrap.

## 6. Other built-in combinations

Standard combination ("run the most specific primary, with `:before`/
`:after`/`:around`") is the default, but CLOS ships **operator method
combinations** that *combine the primary methods' results* with an
operator. Declare one in `defgeneric`:

```lisp
(defgeneric total-weight (thing)
  (:method-combination +))     ; SUM the results of all applicable primaries

(defmethod total-weight + ((c chassis)) 1000)
(defmethod total-weight + ((c car))      200)   ; car inherits from chassis

(total-weight a-car)   ; => 1200   — CLOS adds both applicable methods
```

Under `+` combination, *all* applicable primary methods run and their
results are summed. CLOS provides `+`, `and`, `or`, `progn`, `list`,
`append`, `max`, `min`, `nconc` — each combines results with that
operator. So `and` combination short-circuits across the hierarchy;
`list` collects every method's contribution. This is dispatch as
*aggregation*, not just selection.

## 7. Defining your own combination

If the built-ins don't fit, **`define-method-combination`** lets you
specify exactly how applicable methods are assembled into the effective
method. You write a little template describing the order and the wrapping
form. It's an advanced tool — most code never needs it — but its
existence makes the point: even *how methods combine* is open and
programmable, not fixed by the language.

This is the same philosophy as macros
([Chapter 14](/lisp/part-4-macros/your-first-macro)) and the upcoming
metaobject protocol ([Chapter 32](/lisp/part-8-clos/metaobject-protocol)):
the mechanism is exposed for you to extend, not sealed inside the
implementation.

## 8. Why this beats super calls and decorators

Compare with mainstream tools for the same jobs:

- **`super` calls**: single chain, must be invoked manually and
  correctly in every override; forget one and the chain breaks. CLOS's
  `:before`/`:after` run *automatically* and can't be forgotten.
- **Decorators / wrappers**: you manually nest wrapper functions. CLOS's
  `:around` declares the wrapping by role; the combination assembles it,
  respecting the type hierarchy.
- **Manual layering**: in most languages, "log + validate + time + do the
  work" tangles four concerns into one method. CLOS keeps them as four
  separate methods that CLOS composes — each concern isolated, added or
  removed independently.

The result is **layered behavior as data**: each method declares its role
and specificity; CLOS computes the combined effective method. You add a
log line, a validation, a timer, a cache — each as its own small method —
without ever editing the code it augments. That's a level of composability
single-dispatch `super` can't reach.

> :weightliftinggoose: Memorize the order — **around → before → primary
> (with `call-next-method`) → after → back out through around** — and
> the specificity twist (`:before` most-specific first, `:after`
> most-specific last). Then practice the three big uses: `:before` for
> validation, `:after` for logging/cleanup, `:around` for
> timing/caching/transactions. The instinct to build is "this is a
> separate concern → it's a separate method," not "cram it into the
> primary." Once that's reflex, you're writing CLOS the way it's meant to
> be written.

## What we covered

- CLOS builds an **effective method** by *combining* all applicable
  methods, not just picking one.
- **Primary methods** do the main work; **`call-next-method`** invokes
  the next-most-specific primary (a flexible `super`); `next-method-p`
  checks if one exists.
- **Auxiliary methods** run automatically: **`:before`** (setup,
  most-specific first), **`:after`** (cleanup, most-specific last),
  **`:around`** (wraps everything, controls whether to proceed).
- Standard order: **around → before → primary → after → back out through
  around**.
- **`:around`** is ideal for cross-cutting concerns (timing, caching,
  logging) — the primary stays oblivious.
- **Operator combinations** (`+`, `and`, `or`, `list`, `append`, ...)
  run *all* primaries and combine their results;
  **`define-method-combination`** lets you invent your own.
- This gives **layered, composable behavior** that `super` calls and
  manual decorators can't match — each concern an isolated method.

## What's next

[Chapter 32](/lisp/part-8-clos/metaobject-protocol) — the Metaobject
Protocol. The final layer: classes, generic functions, and methods are
*themselves objects*, instances of metaclasses, and the rules of CLOS
are themselves generic functions you can specialize. CLOS, it turns out,
is implemented in CLOS — and you can reach in and bend it.
