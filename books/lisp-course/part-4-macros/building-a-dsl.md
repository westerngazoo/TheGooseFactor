---
sidebar_position: 4
title: "Building a DSL With Macros"
---

# Building a DSL With Macros

> The payoff. Macros let you design *new syntax* to fit a problem —
> an embedded domain-specific language. This is "growing the language
> to meet the problem" made real.

A **domain-specific language** (DSL) is a small language tailored to a
particular domain — HTML generation, testing, state machines, queries.
In most languages, building a DSL means writing a parser. In Lisp,
because code is data and macros transform code, you build DSLs *inside
the language* with no parser at all. This chapter shows how, closing
Part IV.

## 1. What's a DSL, and why Lisp is perfect for it

A DSL gives you notation that *fits the domain*. Instead of expressing
a domain concept in general-purpose code, you express it in syntax
designed for it:

```lisp
;; General-purpose code for an HTML fragment:
(string-append "<ul>" (string-append "<li>" item1 "</li>") ...)  ; tedious

;; A DSL for the same:
(html (ul (li "first") (li "second")))   ; reads like the structure
```

Lisp is uniquely suited to DSLs because:

- **No parser needed**: your DSL is just S-expressions
  ([Chapter 2](/lisp/part-1-core-idea/s-expressions)), which the
  reader already parses.
- **Macros translate**: a macro turns your DSL syntax into ordinary
  Lisp code at expansion time.
- **Full language available**: your DSL can drop back to full Lisp
  anywhere (it's all the same syntax).

This is the deepest expression of "code is data" and "grow the
language" ([Chapter 1](/lisp/part-1-core-idea/why-lisp)): you literally
extend the language with problem-specific constructs.

## 2. A worked DSL: a simple HTML generator

Let's build a tiny HTML DSL. The goal: write

```lisp
(html
  (body
    (h1 "Welcome")
    (p "Hello, world")))
```

and generate the string `"<html><body><h1>Welcome</h1><p>Hello,
world</p></body></html>"`.

We could do this with functions, but a macro lets the *tags* be
literal syntax (`h1`, `p`) rather than quoted symbols or strings. Here's
the idea (simplified):

```lisp
(defmacro html-tag (tag . body)
  `(string-append
     "<" ,(symbol->string tag) ">"
     ,@body
     "</" ,(symbol->string tag) ">"))
```

A macro `html-tag` takes a tag symbol and a body, and generates the
string-concatenation code wrapping the body in `<tag>...</tag>`. Build
`h1`, `p`, `body`, etc. on top, and you have a DSL where HTML structure
is written as nested S-expressions — which *look like* the HTML tree.

The point isn't the specific implementation (real HTML DSLs like
Clojure's Hiccup are more polished); it's that **the DSL is just Lisp
code, transformed by macros into the underlying operations.**

## 3. A control-flow DSL: a simple state machine

DSLs aren't only for data — they can define *behavior*. Imagine a
state-machine DSL:

```lisp
(define-machine traffic-light
  (state green   (on timer -> yellow))
  (state yellow  (on timer -> red))
  (state red     (on timer -> green)))
```

A macro `define-machine` could expand this declarative description
into the functions and data structures that implement the state
machine — a dispatch table, a current-state variable, a transition
function. The *user* writes the clean declarative form; the *macro*
generates the mechanical implementation.

This is the essence of a DSL for control: you design syntax that
expresses the domain (states and transitions) directly, and the macro
bridges from that syntax to executable code. Without macros, you'd
write all that boilerplate by hand every time.

> :surprisedgoose: This is why Lisp programmers say "every Lisp program
> is a DSL." You don't write a program *in* Lisp so much as you grow
> Lisp *into* a language for your problem, then write the solution in
> that language. The macros are the bridge between your problem-shaped
> notation and the machine. Paul Graham built a startup (Viaweb) this
> way and wrote a book ("On Lisp") about the technique.

## 4. Macros + the rest of the toolkit

A real DSL combines everything from the course:

- **S-expressions** ([Ch 2](/lisp/part-1-core-idea/s-expressions)) are
  the DSL's surface syntax — free parsing.
- **Quasiquote** ([Ch 13](/lisp/part-4-macros/quote-quasiquote-unquote))
  builds the generated code.
- **Macros** ([Ch 14](/lisp/part-4-macros/your-first-macro)) do the
  translation, with **hygiene** ([Ch 15](/lisp/part-4-macros/macro-hygiene))
  keeping it safe.
- **Recursion** ([Ch 6](/lisp/part-2-functional/recursion)) processes
  nested DSL forms (a DSL form is a tree — walk it recursively).
- **Closures and HOFs** ([Ch 7](/lisp/part-2-functional/higher-order-functions),
  [Ch 8](/lisp/part-2-functional/closures-and-lexical-scope)) often
  appear in the generated code.

A DSL macro typically *recursively walks* the DSL form (it's a nested
S-expression — a tree) and *generates code* for each part with
quasiquote. The macro is a tree-to-tree transformation: DSL tree in,
Lisp code tree out.

## 5. Real-world Lisp DSLs

This isn't academic — major Lisp tools *are* DSLs built with macros:

- **`loop`** (Common Lisp): an entire iteration mini-language
  (`(loop for i from 1 to 10 collect (* i i))`) — implemented as one
  giant macro.
- **Hiccup** (Clojure): HTML as Clojure data structures
  (`[:ul [:li "a"] [:li "b"]]`).
- **`cl-who`, `cl-ppcre` macros** (Common Lisp): HTML generation,
  regex.
- **`core.async`** (Clojure): Go-style concurrency via macros that
  transform code into state machines.
- **Test frameworks** (`deftest`, `is`, `are`): testing DSLs.
- **`defclass` / CLOS** (Common Lisp): the entire object system is a
  layer of macros.

When you use these, you're using a DSL someone grew into Lisp with
macros. And you can build your own the same way.

## 6. The danger: DSL overuse

A caution to balance the enthusiasm. DSLs are powerful but have costs:

- **Learning curve**: every DSL is a new mini-language others must
  learn. A codebase full of bespoke DSLs can be impenetrable to
  newcomers.
- **Debugging**: errors happen in *generated* code, which can be
  confusing to trace back to the DSL form (`macroexpand` helps).
- **Tooling**: editors, debuggers, and linters understand plain Lisp
  better than your custom DSL.

The mature judgment: build a DSL when the domain *genuinely* benefits
from custom notation and the DSL will be used enough to repay its
learning cost (HTML generation, used everywhere, repays it; a one-off
abstraction probably doesn't). Don't macro-ize what a function or a
bit of data would handle. The same restraint from
[Chapter 15](/lisp/part-4-macros/macro-hygiene) applies: power
demands judgment.

## 7. The arc of Part IV

Step back at the macro story:

- **[Ch 13](/lisp/part-4-macros/quote-quasiquote-unquote)**:
  quasiquote lets you *build code* as data, ergonomically.
- **[Ch 14](/lisp/part-4-macros/your-first-macro)**: a macro *receives
  code, transforms it, returns code* — controlling evaluation,
  extending syntax.
- **[Ch 15](/lisp/part-4-macros/macro-hygiene)**: hygiene keeps macros
  *safe* from variable capture.
- **[Ch 16](/lisp/part-4-macros/building-a-dsl)** (here): macros
  compose into *whole languages* — DSLs — tailored to a problem.

Together, this is Lisp's signature capability: a language that lets you
extend its own syntax, growing to fit any problem. It's the cash value
of "code is data" and the thing that, once understood, changes how you
see every other language ([Chapter 1](/lisp/part-1-core-idea/why-lisp)'s
promise).

> :weightliftinggoose: A DSL is the heaviest lift in the macro gym —
> and the most impressive when done well. Start small: a macro or two
> that make one repetitive task cleaner. Grow it only as the domain
> demands. The skill is *taste* as much as technique — knowing when
> custom notation earns its keep. Build one small DSL (an HTML
> fragment generator, a tiny test framework) and you'll understand why
> Lispers say the language disappears into the problem.

## What we covered

- A **DSL** is a small language tailored to a domain; Lisp builds them
  *with no parser* because code is data and macros transform it.
- DSLs can express **data** (HTML generators) or **behavior** (state
  machines) — the macro translates clean domain syntax into
  executable code.
- A DSL macro recursively walks the nested DSL form (a tree) and
  generates code via quasiquote.
- A DSL combines the whole toolkit: S-expressions (syntax),
  quasiquote (building), macros+hygiene (translating), recursion
  (walking), closures/HOFs (in the output).
- Real Lisp DSLs: CL `loop`, Clojure Hiccup and `core.async`, CLOS,
  test frameworks.
- **Danger**: DSL overuse adds learning/debugging/tooling cost — build
  them only when the domain repays it.
- The arc of Part IV: quasiquote → macros → hygiene → DSLs = Lisp's
  signature "grow the language" power.

## What's next

That closes Part IV. [Part V](/lisp/part-5-metacircular/eval-and-apply)
is the summit: the **metacircular evaluator**. You'll write a Lisp
interpreter *in Lisp* — `eval` and `apply` — and discover the whole
language fits in about a page. Everything from Part I becomes running
code.
