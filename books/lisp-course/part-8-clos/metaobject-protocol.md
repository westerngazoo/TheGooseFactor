---
sidebar_position: 4
title: "The Metaobject Protocol"
---

# The Metaobject Protocol

> The deepest layer. In CLOS, classes are objects, generic functions are
> objects, methods are objects — and the rules that govern them are
> themselves generic functions you can specialize. CLOS is implemented in
> CLOS, and the **Metaobject Protocol** lets you reach in and reprogram
> the object system itself.

This is the last chapter of Part VIII and the summit of the object
system. It echoes the summit of [Part V](/lisp/part-5-metacircular/eval-and-apply):
there you saw the *evaluator* defined in terms of itself; here you'll see
the *object system* defined in terms of itself. The same reflective idea,
one level up. It's advanced — treat it as a guided tour of what's
possible, not a checklist to memorize.

## 1. Classes are objects too

The first jolt: a class is not a magic compiler construct. **A class is
an object** — an instance of some *other* class, called a **metaclass**.
The default metaclass is `standard-class`:

```lisp
(defclass point () (x y))

(class-of (make-instance 'point))   ; => #<STANDARD-CLASS POINT>  (an object!)
(class-of (find-class 'point))      ; => #<STANDARD-CLASS STANDARD-CLASS>
```

So `my-point` is an instance of `point`; and `point` is an instance of
`standard-class`. The class object holds the slots' definitions, the
superclass list, the precedence list — all as data you can inspect and,
within limits, modify. A "class" is just a particularly important kind of
object.

> :nerdygoose: This is the same tower you met with `eval`
> ([Chapter 17](/lisp/part-5-metacircular/eval-and-apply)): a system
> described in its own terms. Objects are instances of classes; classes
> are instances of metaclasses; and `standard-class` is (carefully) an
> instance of itself, so the tower bottoms out instead of going up
> forever. The payoff is uniformity: because classes are objects, the
> *entire* object machinery — dispatch, slot access, inheritance —
> becomes ordinary CLOS code operating on class objects. Nothing is
> special-cased into the compiler that you can't also reach.

## 2. Generic functions and methods are objects

The reflection goes all the way down. A generic function
([Chapter 29](/lisp/part-8-clos/generic-functions)) is an instance of
`standard-generic-function`; a method is an instance of
`standard-method`:

```lisp
(class-of #'area)                       ; => #<STANDARD-CLASS STANDARD-GENERIC-FUNCTION>
(generic-function-methods #'area)       ; => a list of method objects
```

So a generic function is an object holding a list of method objects, plus
the rules for combining them ([Chapter 31](/lisp/part-8-clos/method-combination)).
Dispatch is an operation *on* that object. Once you see that methods are
data in a list, the idea of programmatically adding, removing, or
inspecting methods stops being exotic — it's just list manipulation on a
metaobject.

## 3. The MOP: protocols for the object system

The **Metaobject Protocol** (MOP) is the specification of *how CLOS does
its job, expressed as generic functions you can specialize*. The key
realization:

> Every step the object system takes — creating a class, computing the
> precedence list, allocating slots, accessing a slot, selecting
> applicable methods, combining them — is performed by a **generic
> function**. And generic functions can be specialized.

That means you don't *configure* CLOS through a fixed set of options; you
*extend* it by writing methods on its internal generic functions. The
object system is open at the seams. A few of the hookable protocols:

- **`compute-class-precedence-list`** — change the linearization rule.
- **`compute-slots`** / **`slot-value-using-class`** — change how slots
  are laid out or accessed.
- **`compute-applicable-methods`** — change how dispatch chooses methods.
- **`make-instance`** / **`allocate-instance`** — change how objects are
  born.

## 4. Example: a metaclass that counts instances

The classic MOP demo: a custom metaclass. Define a metaclass (a subclass
of `standard-class`), then specialize `make-instance` on it. Every class
that *uses* this metaclass automatically gets instance-counting — with no
changes to the classes themselves:

```lisp
(defclass counted-class (standard-class) ())     ; a new metaclass

;; allow it to be used as a metaclass
(defmethod validate-superclass ((c counted-class) (s standard-class)) t)

(defmethod make-instance :around ((class counted-class) &key)
  (incf (instance-count class))                  ; bump the count
  (call-next-method))                            ; then build as usual

;; Now any class declaring :metaclass counted-class is auto-counted:
(defclass tracked (... :metaclass counted-class) ...)
```

The behavior "count my instances" is attached to the *metaclass*, so it
applies to every class of that metaclass — a reusable, class-level aspect.
This is the kind of thing frameworks do: define a metaclass once,
and every model class built on it gains persistence, validation, or
logging for free.

## 5. Hooking the protocol: slot access

For a flavor of how deep it goes: every slot read ultimately calls the
generic function `slot-value-using-class`. Specialize it and you control
what "reading a slot" *means* — compute it on demand, fetch it from a
database, log every access:

```lisp
(defmethod slot-value-using-class :around
    ((class my-logged-class) object slot)
  (format t "reading slot ~a~%" (slot-definition-name slot))
  (call-next-method))     ; then do the normal read
```

Suddenly every slot read on instances of `my-logged-class` is logged —
and the classes and the code reading their slots are untouched. "Field
access" is a generic function, so it's as extensible as any other. This
is the MOP's promise made concrete: the most primitive operations of the
object system are open for redefinition.

## 6. The reflective tower, and Part V revisited

Stand back and notice the symmetry with the metacircular evaluator
([Part V](/lisp/part-5-metacircular/the-environment-model)):

- The **evaluator** is a Lisp program that *runs* Lisp programs. Make it
  first-class and you can extend evaluation itself.
- **CLOS** is a CLOS program that *defines* CLOS objects. Make it
  first-class (the MOP) and you can extend the object system itself.

Both are instances of the same deep move: a system implemented in its own
terms, with the implementation *exposed* so you can reprogram it. This is
Lisp's signature trick at the highest level — the language (and its
object system) is not a fixed artifact handed down from the compiler, but
a living thing you can reach into and reshape, the way macros let you
reshape syntax ([Chapter 14](/lisp/part-4-macros/your-first-macro)).

> :surprisedgoose: Most languages have a hard floor: below a certain
> level, "that's just how objects work," implemented in C, off-limits. CLOS
> has no such floor that you can't lift. Want different inheritance
> semantics? Specialize `compute-class-precedence-list`. Different
> dispatch? Specialize `compute-applicable-methods`. Persistent objects?
> Hook `slot-value-using-class`. The object system is turtles all the way
> down — but they're *your* turtles, every one of them open to
> redefinition. Few language designs trust the programmer this much.

## 7. Practical uses — and cautions

The MOP isn't only beautiful; it's the foundation of real frameworks:

- **Object-relational mappers / persistence**: a metaclass whose
  instances are backed by database rows; `slot-value-using-class` reads
  and writes columns.
- **Validation and constraints**: a metaclass that enforces slot
  invariants on every write.
- **Aspect-oriented programming**: weave logging, security, or timing
  into slot access and method dispatch system-wide.
- **Alternative object models**: prototype-based objects, immutable
  objects, observable objects — all buildable atop the MOP.

The caution: the MOP is **powerful and easy to overuse**. Metaclass
trickery is invisible to readers and can make a program hard to follow —
the same "action at a distance" risk as dynamic variables
([Chapter 27](/lisp/part-7-advanced-control/dynamic-variables)) and
unhygienic macros ([Chapter 15](/lisp/part-4-macros/macro-hygiene)). Most
programs never need it. Reach for the MOP when you're building
*infrastructure* that many classes will rest on — a framework, a
persistence layer — not for everyday code.

## 8. The big picture: CLOS in CLOS

Here's the whole of Part VIII in one sentence: **CLOS is an object system
defined using its own objects, generic functions, and methods — and the
MOP makes that self-definition available to you.** Classes are instances
of metaclasses; generic functions and methods are objects; the operations
that create classes, lay out slots, and dispatch methods are themselves
generic functions you can specialize.

That self-application — a thing built out of itself, with the seams left
open — is exactly what you saw in the evaluator
([Part V](/lisp/part-5-metacircular/eval-and-apply)) and in macros
([Part IV](/lisp/part-4-macros/your-first-macro)). It is the recurring
shape of Lisp's power: don't hand the programmer a sealed black box; hand
them the box *and the tools that built it*. You've now seen that shape at
three levels — syntax (macros), evaluation (the metacircular evaluator),
and objects (the MOP). That is the enlightenment the
[introduction](/lisp/) promised, complete.

> :weightliftinggoose: Don't try to *master* the MOP on first contact —
> internalize the *idea*: classes are objects, the object system's rules
> are generic functions, and therefore the object system is extensible
> from inside itself. Read Kiczales's *The Art of the Metaobject
> Protocol* (AMOP) when you're ready to go deep
> ([further reading](/lisp/appendix/further-reading)). For now, let it
> land that you've reached the bottom turtle — and it, too, is made of
> Lisp.

## What we covered

- **Classes are objects**, instances of a **metaclass** (default
  `standard-class`); the tower bottoms out in self-instantiation.
- **Generic functions** and **methods** are objects too
  (`standard-generic-function`, `standard-method`) — methods are data in
  a list.
- The **Metaobject Protocol** exposes CLOS's own operations
  (`compute-class-precedence-list`, `compute-slots`,
  `slot-value-using-class`, `compute-applicable-methods`,
  `make-instance`) as **generic functions you can specialize**.
- A **custom metaclass** adds class-level behavior (e.g., instance
  counting, persistence) to every class that uses it — without changing
  those classes.
- Specializing **`slot-value-using-class`** redefines what slot access
  *means* (compute, persist, log).
- The MOP mirrors the **metacircular evaluator**: a system implemented in
  its own terms with the implementation exposed for extension.
- Practical uses (ORMs, validation, AOP) are real — but the MOP is
  framework-level power; use it sparingly.

## What's next

That completes **Part VIII** and this expanded course. You've gone from
`(+ 1 2)` all the way to reprogramming the object system from within.
From here:

- Revisit the [introduction](/lisp/) — the promise of enlightenment,
  now delivered at three levels (macros, the evaluator, the MOP).
- Browse the [roadmap](/lisp/table-of-contents) for anything you skipped.
- Use the appendix: the [cheat sheet](/lisp/appendix/cheat-sheet), the
  [glossary](/lisp/appendix/glossary), and the
  [further-reading & install guide](/lisp/appendix/further-reading) —
  including SICP, On Lisp, and AMOP for the MOP.

And then do what the whole course has been building toward: keep a REPL
open, and grow the language to fit your problem.
