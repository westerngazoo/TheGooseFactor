---
sidebar_position: 3
title: "Macro Hygiene and the Gotchas"
---

# Macro Hygiene and the Gotchas

> The `swap!` macro had a hidden bug. This chapter is about variable
> capture — the classic macro pitfall — and how "hygienic" macros make
> it go away.

Macros are powerful, but power has sharp edges. The sharpest is
**variable capture**: a macro's introduced variables accidentally
clashing with the user's variables. This chapter shows the bug,
explains it, and covers the fixes.

## 1. The bug in swap!

Recall `swap!` from [Chapter 14](/lisp/part-4-macros/your-first-macro):

```lisp
(defmacro swap! (a b)
  `(let ((tmp ,a))
     (set! ,a ,b)
     (set! ,b tmp)))
```

It works fine for `(swap! x y)`. But watch what happens if the user
happens to use a variable named `tmp`:

```lisp
(define tmp 100)
(define y 200)
(swap! tmp y)     ; trying to swap tmp and y
```

This expands to:

```lisp
(let ((tmp tmp))      ; bind a NEW tmp to the old tmp's value (100)
  (set! tmp y)        ; OOPS: which tmp? the macro's, not the user's
  (set! y tmp))       ; this tmp is the macro's binding
```

The macro's `tmp` and the user's `tmp` **collide**. The result is
wrong — the swap fails because the macro's introduced `tmp` shadows
and interferes with the user's variable of the same name. This is
**variable capture** (specifically, the macro "captured" the user's
`tmp`).

> :surprisedgoose: Variable capture is the macro bug that has haunted
> Lisp for decades. The macro author picked an innocent name (`tmp`)
> for a temporary, never imagining a user would have a variable by the
> same name. But macros expand into the user's code, so any name the
> macro introduces can collide. It's a *spooky action at a distance* —
> the macro and the use site share a namespace they didn't agree to
> share.

## 2. The fix in unhygienic systems: gensym

In macro systems without automatic protection (like Common Lisp's
`defmacro`), the fix is **`gensym`** — "generate symbol." `gensym`
creates a fresh, unique symbol guaranteed not to clash with anything:

```lisp
(defmacro swap! (a b)
  (let ((tmp (gensym)))          ; make a unique symbol, e.g. #:g1234
    `(let ((,tmp ,a))            ; use it instead of literal tmp
       (set! ,a ,b)
       (set! ,b ,tmp))))
```

Now the macro's temporary is a unique symbol like `#:g1234` that *no*
user variable could match. The expansion becomes:

```lisp
(let ((#:g1234 tmp))    ; the unique symbol — no collision possible
  (set! tmp y)
  (set! y #:g1234))
```

`gensym` is the manual hygiene tool: any time a macro introduces a
*new* variable that the user didn't supply, generate it with `gensym`
to avoid capture. This is a discipline you must remember in Common Lisp
— forget it, and you've written a capture bug.

## 3. Hygienic macros: automatic protection

Scheme took a different path: **hygienic macros**. With
`define-syntax` and `syntax-rules`, the macro system *automatically*
renames the macro's introduced variables so they can never capture
the user's variables (and vice versa). You get `gensym`-like safety
for free, without thinking about it.

The Scheme `swap!`:

```lisp
(define-syntax swap!
  (syntax-rules ()
    ((swap! a b)
     (let ((tmp a))        ; tmp here is automatically hygienic
       (set! a b)
       (set! b tmp)))))
```

Even though we wrote literal `tmp`, the hygienic system renames it
behind the scenes so it can't collide with any user `tmp`. The
collision bug from §1 simply cannot happen. Hygiene is *built into*
the macro system.

`syntax-rules` is a **pattern-based** macro language: `(swap! a b)` is
the *pattern* (what the macro looks like when used), and the body is
the *template* (what it expands to). The system matches the pattern,
binds `a` and `b`, and instantiates the template hygienically. It's a
declarative, capture-safe way to write the common cases.

> :nerdygoose: Hygiene was a major research achievement (Kohlbecker et
> al., 1986; Clinger & Rees). The insight: a macro's expansion
> involves *two* sets of names — those from the macro definition and
> those from the use site — and they should be kept in separate
> "scopes" unless explicitly shared. Hygienic systems track which
> names came from where and rename to prevent accidental clashes. It's
> one of those features that's invisible when it works (which is the
> point) and was genuinely hard to get right.

## 4. The two macro traditions

This is a real fork in the Lisp world:

| | Common Lisp `defmacro` | Scheme `syntax-rules` |
|---|---|---|
| Style | Procedural (build code with code) | Pattern/template-based |
| Hygiene | Manual (`gensym`) | Automatic |
| Power | Unlimited (arbitrary code generation) | Constrained (but covers most cases) |
| Capture risk | Yes, you must manage it | No, handled for you |
| Escape hatch | n/a | `syntax-case` for full power |

Neither is strictly better:

- **`defmacro`** is more *powerful* and *intuitive* (a macro is just a
  function from code to code, using all of Lisp), but you must manage
  hygiene manually.
- **`syntax-rules`** is *safe by default* and *declarative*, but its
  pattern language is more restrictive (though `syntax-case` recovers
  full power with hygiene).

Many modern Lispers prefer hygiene-by-default. Common Lisp programmers
are used to the `gensym` discipline. Both write correct macros; they
just protect against capture differently.

## 5. Other macro gotchas

Capture is the big one, but there are others to know:

**Multiple evaluation.** If a macro inserts an argument more than once,
that argument is *evaluated* more than once:

```lisp
(defmacro square (x) `(* ,x ,x))   ; x appears twice!
(square (begin (display "hi") 5))  ; prints "hi" TWICE, because ,x is evaluated twice
```

`(square expr)` expands to `(* expr expr)` — and if `expr` has side
effects or is expensive, doing it twice is wrong. The fix: bind the
argument once with a `gensym`med `let`:

```lisp
(defmacro square (x)
  (let ((v (gensym)))
    `(let ((,v ,x)) (* ,v ,v))))   ; evaluate x once, into v
```

**Order of evaluation.** A macro can accidentally change the order in
which arguments are evaluated relative to what the user expects.
Be deliberate about evaluation order in your template.

**Leaking the expansion.** If a macro's expansion references a function
or variable not available at the use site, it breaks. Macros should
expand to code that works in the user's context.

## 6. When to reach for a macro (revisited)

Given these gotchas, the [Chapter 14](/lisp/part-4-macros/your-first-macro)
advice stands, reinforced: **prefer functions; use macros only when
you must.** Macros are harder to write correctly (hygiene, multiple
evaluation), harder to compose (they're not first-class), and harder
to debug (expansion-time). When a function will do — when you just
need values, not control over evaluation — use a function.

Reserve macros for genuine syntactic abstraction: new control flow,
binding forms, DSLs. And when you do write one, `macroexpand` it
([Chapter 14](/lisp/part-4-macros/your-first-macro)), and check for
capture and multiple evaluation.

## 7. Checklist for writing a macro

A practical checklist:

1. **Should this be a macro at all?** Could a function do it? If yes,
   use a function.
2. **Introduce temporaries with `gensym`** (or rely on `syntax-rules`
   hygiene) — never literal names for macro-internal variables.
3. **Evaluate each user argument exactly once** — bind it to a
   gensym'd local if you use it multiple times.
4. **Respect evaluation order** — left to right, as the user expects.
5. **`macroexpand` and test** — look at the generated code, run it
   with adversarial inputs (variables named `tmp`, side-effecting
   arguments).

Follow this and your macros will be correct and capture-free.

> :weightliftinggoose: The hygiene lesson is the macro-writer's
> equivalent of "warm up before heavy lifting." It feels like overhead
> until the day you skip it and pull something — a capture bug that
> manifests only when a user picks the wrong variable name, in
> production, mysteriously. Internalize the checklist: gensym your
> temporaries, evaluate arguments once, macroexpand to verify. Safe
> macros are a discipline, and the discipline becomes automatic.

## What we covered

- **Variable capture**: a macro's introduced variable (`tmp`)
  colliding with a user's same-named variable — the classic macro bug.
- **`gensym`** creates unique symbols; use it for macro-internal
  temporaries in unhygienic systems (Common Lisp `defmacro`).
- **Hygienic macros** (Scheme `define-syntax` / `syntax-rules`)
  automatically rename to prevent capture — safe by default,
  pattern/template-based.
- The two traditions: `defmacro` (powerful, manual hygiene) vs
  `syntax-rules` (safe, declarative, `syntax-case` for full power).
- Other gotchas: **multiple evaluation** (bind args once),
  **evaluation order**, expansion leaking.
- **Prefer functions; use macros only when necessary** — they're
  harder to write, compose, and debug.
- A writing checklist: gensym temporaries, evaluate args once, respect
  order, macroexpand and test.

## What's next

[Chapter 16](/lisp/part-4-macros/building-a-dsl) — building a DSL with
macros. The payoff of all this: using macros to build a small embedded
domain-specific language, where you design new syntax to fit a
problem.
