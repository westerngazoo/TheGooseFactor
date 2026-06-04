---
sidebar_position: 1
title: "Generic Functions and Multiple Dispatch"
---

# Generic Functions and Multiple Dispatch

> Object orientation, the Lisp way — and it's not what you think.
> Behavior doesn't live *inside* classes; it lives in **generic
> functions** that dispatch on the types of *all* their arguments at
> once. This one change dissolves problems that other OOP languages
> wrestle with for decades.

Welcome to Part VIII. We've built the core language, the functional
style, macros, an evaluator, and the advanced control of
[Part VII](/lisp/part-7-advanced-control/continuations). Now: objects.
Common Lisp's object system, **CLOS**, is widely regarded as the most
powerful in any language — and it gets there by rethinking what "method"
means. This chapter is the pivot; the rest of Part VIII builds on it.

## 1. How most languages do OOP

In Java, Python, Ruby, C++, the method lives *in* the class, and you call
it *on* an object:

```python
circle.area()        # method 'area' belongs to circle's class
dog.speak()          # method 'speak' belongs to dog's class
```

This is **single dispatch**: which method runs depends on *one* object —
the receiver, the thing before the dot. The receiver is privileged; it
"owns" the method. This works, but it has a famous weak spot, which we'll
hit in §5.

## 2. Generic functions: behavior lives in functions

CLOS inverts the picture. A **generic function** is an ordinary function
*from the caller's side* — you just call it — but its behavior is
provided by a set of **methods**, each specialized for particular
argument types. The function is not "owned" by any class:

```lisp
(defgeneric area (shape))         ; declare: there is a function 'area'

(defmethod area ((s circle))      ; a method, specialized for circles
  (* pi (radius s) (radius s)))

(defmethod area ((s rectangle))   ; another, specialized for rectangles
  (* (width s) (height s)))
```

You call it like any function — `(area my-shape)` — and CLOS picks the
method whose specializer matches the argument's type. Note the shape:
`area` is *not* a method on `circle`; it's a free-standing function with
methods that *mention* `circle`. Behavior is associated with the
function, organized by type — not buried inside a class.

> :nerdygoose: This sounds like a small bookkeeping difference, but it
> flips ownership. In `circle.area()`, the verb belongs to the noun —
> `area` is the circle's property. In `(area circle)`, the verb is its
> own thing and the noun is just an argument. That means you can add new
> *verbs* for existing *nouns* without touching the nouns' source — add
> an `(area triangle)` method from a different file, even a different
> library. The "method belongs to the class" model can't do that
> cleanly. We'll see why this matters enormously in §5.

## 3. defgeneric and defmethod

The two pieces:

- **`defgeneric`** declares the generic function (optional but good
  documentation; it states the argument list all methods share).
- **`defmethod`** adds one method, with **specializers** on the
  parameters — `(s circle)` means "this method applies when the first
  argument is (a subtype of) `circle`."

```lisp
(defgeneric describe-animal (a)
  (:documentation "Return a description string for an animal."))

(defmethod describe-animal ((a dog))
  (format nil "~a is a dog that says woof" (name a)))

(defmethod describe-animal ((a cat))
  (format nil "~a is a cat that says meow" (name a)))
```

Each `defmethod` *adds* to the generic function — they're collected, not
overwritten. Call `(describe-animal some-cat)` and the cat method runs.
Add a `bird` method later, anywhere, and the generic function grows.
There's no central class definition listing all methods; methods are
free to live wherever it's convenient.

## 4. Single dispatch, generic-function style

So far this looks like ordinary OOP with the arguments reordered —
`(area circle)` instead of `circle.area()`. For single-argument methods,
it *is* essentially equivalent. The deep difference appears the moment a
method needs to specialize on **more than one** argument.

## 5. Multiple dispatch: the killer feature

A method can specialize on **several** parameters at once, and CLOS
chooses the method by considering **all** of their types together. This
is **multiple dispatch**, and it's the feature single-dispatch languages
lack:

```lisp
(defgeneric collide (a b))

(defmethod collide ((a asteroid) (b asteroid))
  (format t "Two asteroids shatter~%"))

(defmethod collide ((a asteroid) (b ship))
  (format t "Asteroid destroys ship~%"))

(defmethod collide ((a ship) (b ship))
  (format t "Ships dock~%"))

(collide an-asteroid a-ship)   ; picks the (asteroid ship) method
```

Which `collide` runs depends on the types of *both* arguments together.
In a single-dispatch language, `a.collide(b)` dispatches only on `a`;
handling all the `b` cases forces an ugly workaround. The textbook name
for that workaround is the **visitor pattern** or **double dispatch** — a
whole design pattern that exists *only* to fake the multiple dispatch
CLOS gives you for free.

> :surprisedgoose: The "expression problem" — the long-standing tension
> between adding new *types* and adding new *operations* without editing
> existing code — is genuinely hard in single-dispatch OOP. CLOS makes it
> nearly vanish. Add a new operation? Write a new generic function with
> methods; touch nothing. Add a new type? Write methods for it on the
> existing generics; touch nothing. Multiple dispatch + free-standing
> generic functions sidestep the trap that spawned the visitor pattern,
> double dispatch, and shelves of "design patterns" books. Many such
> patterns are just workarounds for features CLOS has built in.

## 6. Method selection: applicable and most-specific

When you call a generic function, CLOS does this:

1. Find every method whose specializers are **satisfied** by the actual
   arguments (the *applicable* methods).
2. **Sort** them from most specific to least specific, by walking the
   class hierarchy (a subtype is more specific than its supertype).
3. Run the **most specific** one (the full ordering matters for method
   combination — [Chapter 31](/lisp/part-8-clos/method-combination)).

```lisp
(defmethod greet ((x animal)) "Hello, creature")
(defmethod greet ((x dog))    "Hello, dog")     ; dog is a subtype of animal

(greet some-dog)   ; => "Hello, dog"   — dog is more specific than animal
(greet some-fish)  ; => "Hello, creature" — only the animal method applies
```

Specificity follows the class precedence list
([Chapter 30](/lisp/part-8-clos/classes-and-slots)): the more derived the
class a method specializes on, the higher its priority. This is dynamic
dispatch generalized to all arguments and the whole hierarchy at once.

## 7. Dispatch on more than class: eql specializers

Specializers usually name classes, but CLOS also allows **`eql`
specializers** — dispatch on a *specific value*, not just a type:

```lisp
(defgeneric factorial (n))

(defmethod factorial ((n (eql 0))) 1)              ; the value 0 specifically
(defmethod factorial ((n integer))                  ; any other integer
  (* n (factorial (- n 1))))

(factorial 5)   ; => 120
```

The base case `(n (eql 0))` is a method that fires only for the value
`0`. This blurs the line between dispatch and pattern matching: you can
define behavior per-value, per-type, and per-argument-combination, all in
the same uniform mechanism. (You can also specialize on built-in types
like `integer`, `string`, `list` — CLOS dispatch covers the whole type
system, not just classes you define.)

## 8. Why generic functions beat message passing

Step back and compare the two object models:

- **Message passing** (`obj.method(args)`): one privileged receiver owns
  the method; dispatch on one type; adding operations to existing classes
  means editing them (or monkey-patching); multi-type behavior needs the
  visitor pattern.
- **Generic functions** (`(method obj args)`): no privileged argument;
  dispatch on all types; operations and types extend independently
  without editing existing code; multi-type behavior is native.

The cost is conceptual: generic functions feel unfamiliar at first
because the method isn't "inside" anything — it floats free, organized by
the generic function it belongs to. But once it clicks, the message-
passing model looks like the special case it is: single dispatch is just
multiple dispatch restricted to one argument. CLOS gives you the general
tool, and your data and behavior stay decoupled and independently
extensible.

> :weightliftinggoose: The reframing to internalize: **`(verb noun ...)`
> not `noun.verb(...)`.** The verb (generic function) is the unit;
> methods are specializations attached to it by argument type;
> dispatch considers *all* arguments. Drill it by writing `collide` (§5)
> with three argument-type combinations and watching CLOS pick the right
> one — then try to write the same in a single-dispatch language and feel
> the visitor-pattern pain you just escaped. That contrast is the whole
> argument for generic functions.

## What we covered

- Mainstream OOP uses **single dispatch**: the method lives in the class
  and dispatches on one privileged receiver (`obj.method()`).
- CLOS uses **generic functions**: behavior lives in free-standing
  functions (`(method obj ...)`), provided by **methods** specialized by
  argument type.
- **`defgeneric`** declares the function; **`defmethod`** adds a method
  with **specializers**; methods accumulate, they don't overwrite.
- **Multiple dispatch** selects a method by the types of *all* arguments
  at once — natively solving what others fake with the **visitor
  pattern** / double dispatch.
- CLOS finds the **applicable** methods and runs the **most specific**,
  ordered by the class hierarchy.
- **`eql` specializers** dispatch on specific *values*, blurring dispatch
  and pattern matching.
- Generic functions decouple data from behavior and let types and
  operations extend independently — sidestepping the *expression
  problem*.

## What's next

[Chapter 30](/lisp/part-8-clos/classes-and-slots) — classes, slots, and
inheritance. Now that you know how methods are selected, we define the
*data* side: `defclass`, slots and accessors, `make-instance`, multiple
inheritance, and the class precedence list that gives §6's specificity
ordering its meaning.
