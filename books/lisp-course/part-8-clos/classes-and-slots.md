---
sidebar_position: 2
title: "Classes, Slots, and Inheritance"
---

# Classes, Slots, and Inheritance

> The data side of CLOS. `defclass` defines a class with named **slots**;
> `make-instance` builds objects; accessors read and write slots; and
> multiple inheritance — with a principled **class precedence list** —
> lets classes combine without the usual chaos.

[Chapter 29](/lisp/part-8-clos/generic-functions) gave you the *behavior*
side of CLOS — generic functions and multiple dispatch. This chapter
gives you the *data* side: how to define the classes those methods
specialize on. Together they're the whole object system. (Both are built
on the same foundation you'll see in
[Chapter 32](/lisp/part-8-clos/metaobject-protocol).)

## 1. defclass: defining a class

A class is a name, a list of **superclasses**, and a list of **slots**
(the fields each instance holds). The full slot syntax is verbose but
self-describing:

```lisp
(defclass point ()                  ; name 'point', no superclasses
  ((x :initarg :x :initform 0 :accessor point-x)
   (y :initarg :y :initform 0 :accessor point-y)))
```

Each slot specifies options:

- **`:initarg :x`** — the keyword you pass to `make-instance` to set this
  slot at creation.
- **`:initform 0`** — the default value if no initarg is supplied.
- **`:accessor point-x`** — auto-generates a *generic function*
  `point-x` to read the slot (and `(setf point-x)` to write it).

The empty `()` is the superclass list — `point` inherits from nothing
(well, from the universal base `standard-object`). Slots are where an
instance's state lives.

## 2. make-instance: building objects

You create an instance with `make-instance`, passing initargs:

```lisp
(defvar p (make-instance 'point :x 3 :y 4))

(point-x p)   ; => 3      (the accessor reads the slot)
(point-y p)   ; => 4
```

`make-instance` allocates the object, fills slots from the initargs you
gave, applies `:initform` defaults for the rest, and returns it. Leave
out an initarg and the default kicks in:

```lisp
(point-x (make-instance 'point :y 9))   ; => 0   (x defaulted via :initform)
```

This is the standard construction path. We'll see in §5 how to hook into
it for validation and computed slots.

## 3. Reading and writing slots

Three ways to touch a slot, from most to least abstract:

- **Accessors** (preferred): the generic functions `:accessor` created.

```lisp
(point-x p)            ; read
(setf (point-x p) 10)  ; write
```

- **`slot-value`** (low-level): name the slot directly by symbol.

```lisp
(slot-value p 'x)              ; read
(setf (slot-value p 'x) 10)    ; write
```

- **`with-slots`** (convenient for several slots): bind slot names as
  local variables for a block.

```lisp
(with-slots (x y) p
  (sqrt (+ (* x x) (* y y))))   ; x and y refer to p's slots directly
```

Accessors are preferred because they're generic functions — you can
later add methods to them (e.g., validate on write), and subclasses can
specialize them. `slot-value` bypasses that, so reach for accessors by
default.

> :nerdygoose: Accessors being *generic functions*
> ([Chapter 29](/lisp/part-8-clos/generic-functions)), not plain field
> reads, is quietly powerful. `point-x` is a real method you can
> specialize, trace, or wrap. A subclass can override how `point-x`
> behaves; you can add an `:around` method
> ([Chapter 31](/lisp/part-8-clos/method-combination)) that logs every
> read. The "field access" and "method call" distinction that other
> languages enforce simply doesn't exist — reading a slot *is* a method
> call, so it has all the extensibility of one.

## 4. Inheritance and multiple inheritance

A class lists its superclasses and inherits their slots and applicable
methods. CLOS allows **multiple** superclasses — a class can combine
several:

```lisp
(defclass shape ()
  ((name :initarg :name :accessor name)))

(defclass colored ()
  ((color :initarg :color :initform 'black :accessor color)))

(defclass colored-circle (circle colored)   ; inherits from BOTH
  ())

(defvar c (make-instance 'colored-circle :radius 5 :color 'red))
(radius c)   ; => 5    (from circle)
(color c)    ; => RED  (from colored)
```

`colored-circle` inherits `radius` from `circle` and `color` from
`colored`, plus any methods specialized on either. Multiple inheritance
is famously a source of ambiguity in other languages ("which parent's
method wins?"). CLOS resolves it with a precise, deterministic rule —
the next section.

## 5. Construction hooks: initialize-instance

`make-instance` calls a generic function, `initialize-instance`, to set
up the new object. You hook into it with an **`:after` method**
([Chapter 31](/lisp/part-8-clos/method-combination)) to run setup,
validate, or compute derived slots — *after* the standard slot-filling
has happened:

```lisp
(defmethod initialize-instance :after ((p point) &key)
  (when (or (not (numberp (point-x p)))
            (not (numberp (point-y p))))
    (error "point coordinates must be numbers")))
```

Because it's an `:after` method, the normal initialization runs first
(slots filled from initargs/initforms), then your code runs on the
fully-built object. This is the idiomatic CLOS constructor: there's no
special "constructor" keyword — construction is just a generic function
you can extend like any other, which is the recurring CLOS theme.

## 6. Class-allocated (shared) slots

By default each instance gets its own copy of every slot (*instance
allocation*). You can instead share one slot across *all* instances of a
class with **`:allocation :class`** — useful for counters, registries, or
shared defaults:

```lisp
(defclass widget ()
  ((count :initform 0 :allocation :class :accessor widget-count)
   (id    :initarg :id :accessor widget-id)))

(defmethod initialize-instance :after ((w widget) &key)
  (incf (widget-count w)))    ; the shared slot counts all widgets ever made
```

Every `widget` shares the single `count` slot, so it tallies all
instances. Instance-allocated `id` is per-object as usual. One class,
two kinds of state — per-instance and shared — declared right in the
slot spec.

## 7. The class precedence list

Multiple inheritance needs a rule for "if two parents both define
something, who wins?" CLOS computes a **class precedence list** (CPL): a
total, linear ordering of a class and all its ancestors, from most to
least specific. This *linearization* is what gives method specificity
([Chapter 29, §6](/lisp/part-8-clos/generic-functions)) and slot
inheritance their deterministic meaning:

```lisp
(defclass a () ())
(defclass b (a) ())
(defclass c (a) ())
(defclass d (b c) ())
;; CPL of d:  d -> b -> c -> a -> standard-object -> t
```

The CPL respects two rules: a class always precedes its own
superclasses, and the order you list superclasses (`(b c)`) is preserved
(`b` before `c`). The result is a single deterministic chain, so "which
method is more specific" and "which slot definition wins" always have one
unambiguous answer — no guessing, no "diamond problem" coin-flip.

> :surprisedgoose: Most languages either ban multiple inheritance (Java:
> "use interfaces") or handle it murkily (C++ virtual bases, the diamond
> problem). CLOS just *computes a linear order* — the CPL — and uses it
> everywhere consistently: method dispatch, slot inheritance,
> `call-next-method`. Multiple inheritance stops being scary because
> "what happens" is always a well-defined walk down one list. The
> "hard problem" was never inheritance; it was the *absence of a
> principled ordering*. CLOS supplies one.

## 8. Live redefinition

A final CLOS surprise: classes are mutable *at runtime*, and existing
instances update to match. Redefine a class — add a slot, change a
default — and CLOS calls `update-instance-for-redefined-class` to migrate
every live instance to the new shape, *without restarting your program*:

```lisp
;; You're at the REPL with live 'point' instances. Add a slot:
(defclass point ()
  ((x :initarg :x :initform 0 :accessor point-x)
   (y :initarg :y :initform 0 :accessor point-y)
   (z :initarg :z :initform 0 :accessor point-z)))   ; new slot z

(point-z p)   ; => 0   — the OLD instance p now has a z slot, defaulted
```

This is part of why Lisp development feels alive (recall the condition
system's live recovery,
[Chapter 26](/lisp/part-7-advanced-control/condition-system)): you evolve
a running system in place, classes and all, rather than stopping and
rebuilding. The object system was designed for interactive, long-lived
programs.

> :weightliftinggoose: `defclass` for data, `defmethod` for behavior —
> keep them in your head as two halves of one system. Drill the slot
> options (`:initarg`, `:initform`, `:accessor`) until they're reflex,
> prefer accessors over `slot-value`, and use an `initialize-instance
> :after` method as your "constructor." Then build a small hierarchy with
> multiple inheritance and write out its CPL by hand — once you can
> predict the precedence list, CLOS inheritance holds no surprises.

## What we covered

- **`defclass`** defines a class as a name, superclasses, and **slots**;
  each slot has `:initarg`, `:initform`, and `:accessor` options.
- **`make-instance`** builds objects, filling slots from initargs and
  `:initform` defaults.
- Read/write slots via **accessors** (preferred — they're generic
  functions), **`slot-value`**, or **`with-slots`**.
- CLOS supports **multiple inheritance**; a class inherits slots and
  methods from all superclasses.
- **`initialize-instance :after`** is the idiomatic constructor hook for
  validation and derived slots.
- **`:allocation :class`** makes a slot shared across all instances.
- The **class precedence list** linearizes the hierarchy deterministically
  — giving method specificity and slot inheritance one unambiguous order
  (no diamond problem).
- Classes can be **redefined at runtime**; live instances migrate
  automatically.

## What's next

[Chapter 31](/lisp/part-8-clos/method-combination) — method combination.
When several methods apply, CLOS doesn't just pick one — it *combines*
them: `:before`, `:after`, `:around`, and `call-next-method`. This is
where CLOS goes beyond "override the parent" into composable, layered
behavior.
