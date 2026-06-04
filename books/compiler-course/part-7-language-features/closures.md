---
sidebar_position: 1
title: "Closures and First-Class Functions"
---

# Closures and First-Class Functions

> When functions become values that capture their environment, the
> compiler faces a new problem: a function can outlive the scope whose
> variables it uses. The answer is **closure conversion** — make the
> captured environment an explicit data structure carried alongside the
> code. This is the first of the "real language features" the core
> pipeline glossed over.

Welcome to Part VII. The [first six parts](/compiler/table-of-contents)
built a complete pipeline for a simple language — Goolang with functions,
loops, and recursion. But real languages have features that complicate
each stage, and this part tackles the big ones. We start with the feature
that quietly breaks the simple model of "a function is just a label you
jump to": **first-class functions** and the **closures** they require.

## 1. The problem: functions that escape

In simple Goolang, a function is a fixed chunk of code at a known address;
a call is a jump. That model collapses the moment functions become
**first-class values** — passed as arguments, returned, stored — *and*
capture variables from an enclosing scope:

```
fn make_adder(n) {
    return fn(x) { return x + n; };   // the inner fn captures `n`
}
let add5 = make_adder(5);
add5(10);   // => 15  — but make_adder has already returned! Where is `n`?
```

The inner function uses `n`, a local of `make_adder` — but `make_adder`
has *returned* by the time `add5` runs. Its stack frame is gone. A bare
code pointer can't work, because the code needs `n`, and `n` no longer
lives anywhere obvious. The function has **escaped** its birth scope and
must carry its environment with it.

## 2. Free variables and the environment

The variables a function uses but doesn't define are its **free
variables**. In `fn(x) { return x + n; }`, `x` is *bound* (a parameter)
and `n` is *free* (captured from outside). A **closure** is the pairing
that makes escape work:

```
closure  =  ⟨ code pointer , captured environment ⟩
```

- The **code pointer** is the compiled function body.
- The **environment** holds the values of the free variables, captured
  when the closure is *created*.

`add5` is a closure: the code for `fn(x) { x + n }` plus an environment
`{ n: 5 }`. Calling it runs the code with that environment in reach. The
compiler's job is to (a) find each function's free variables and (b)
generate the environment-carrying machinery — which is **closure
conversion**.

## 3. Closure conversion

**Closure conversion** is the transformation that makes the implicit
environment *explicit*. It rewrites every function to take its environment
as an extra, ordinary parameter, and rewrites free-variable accesses to
read from that parameter:

```
// before (free variable n):
fn(x) { return x + n; }

// after closure conversion: env is an explicit argument
fn(env, x) { return x + env.n; }
// and creation builds the env:
make_closure(code_ptr, { n: 5 })
```

After conversion, there are **no free variables anywhere** — every
function is "closed" (depends only on its parameters). That's the point:
downstream stages (IR, optimization, codegen) can treat these like
ordinary functions again, because the environment is just data passed in.
Closure conversion turns a hard scoping problem into a plain data-structure
problem the rest of the pipeline already handles.

> :nerdygoose: Closure conversion is a beautiful example of the compiler's
> favorite move: *make the implicit explicit, then the hard thing becomes
> an easy thing you already know how to do.* Lexical scope — "this
> function can see that variable" — is an invisible relationship the
> source language grants for free. Closure conversion materializes it into
> a struct you pass around. After it, "captures a variable" becomes "holds
> a pointer to a record," and a closure call becomes an indirect call with
> an extra argument. The magic of lexical capture is revealed to be a
> record and a function pointer — and the optimizer can now see and improve
> it like any other data.

## 4. Lambda lifting

A related transformation is **lambda lifting**: hoist nested functions to
the top level by turning their free variables into *extra parameters*. For
functions whose captures can be passed at every call site, lambda lifting
eliminates nesting entirely without building a heap environment:

```
// nested:
fn outer(a) { fn inner(b) { return a + b; } ... inner(3) ... }

// lifted: inner becomes top-level, `a` passed explicitly
fn inner(a, b) { return a + b; }
fn outer(a) { ... inner(a, 3) ... }
```

Lambda lifting works when the closure **doesn't escape** (every use is a
direct call where the captures are in scope). When a closure *does* escape
(like `add5` above), you can't pass the captures at the call site — the
call site doesn't have them — so you need a real heap-allocated environment
(full closure conversion). Compilers choose per function: lift when
possible (cheaper), allocate a closure when necessary.

## 5. Representing and calling closures

At runtime, a closure is typically a small heap object:

```
┌──────────────┬───────────────────────────┐
│ code pointer │ captured values (env)      │
└──────────────┴───────────────────────────┘
```

Calling it is an **indirect call**: load the code pointer, pass the
environment (usually as a hidden first argument) plus the real arguments,
jump. This is slightly more expensive than a direct call (an extra
indirection, an extra argument), which is why closures aren't free — and
why optimizers work hard to *devirtualize* a closure call into a direct
call when they can prove which closure it is.

There are layout refinements: **flat** environments (copy each captured
value in) vs **linked** environments (point to the parent's environment —
cheaper to build, slower to access); capturing **by value** vs **by
reference** (does mutating the captured variable after capture affect the
closure? — a real language-design decision the representation must honor).

## 6. Escape analysis: where does the closure live?

A closure's environment must outlive the scope it captured, so by default
it goes on the **heap** (managed by GC,
[Chapter 20](/compiler/part-6-runtime/garbage-collection)). But heap
allocation is expensive, and many closures *don't actually escape* — a
closure passed to a `map` that's fully consumed before the function
returns never outlives its scope.

**Escape analysis** is the static analysis that proves a closure (or any
allocation) doesn't escape its creating scope. If it doesn't, the
environment can live on the **stack** instead — no GC pressure, faster
allocation and free. This is the same family of analysis as the data-flow
work of [Chapter 14](/compiler/part-4-optimization/data-flow-analysis):
trace where a value can flow, prove it can't outlive a region. Escape
analysis is why closures in well-optimized languages are often nearly
free — the compiler proved they didn't need the heap.

## 7. Closures and objects: the same idea

A deep equivalence worth seeing: **a closure and an object are the same
thing from two directions**.

- A **closure** is *data (the environment) bundled with one behavior (the
  code)*.
- An **object** is *data (fields) bundled with many behaviors (methods)*.

A closure is essentially an object with a single method (`call`); an object
is essentially a record of closures sharing one environment (`this`). This
is not a coincidence — it's a well-known duality ("closures are a poor
man's objects; objects are a poor man's closures"). For the compiler, it
means the machinery overlaps: an object's `this` pointer is exactly a
closure's environment pointer, and a virtual method call is exactly a
closure's indirect call. Build closures and you've built most of the
object machinery too.

## 8. Why this matters for the pipeline

First-class functions ripple through every stage you built:

- **Front end** ([Part II](/compiler/part-2-front-end/ast-and-semantic-analysis)):
  scope resolution must identify free variables (the capture set).
- **IR** ([Part III](/compiler/part-3-types-and-ir/lowering-to-ir)):
  closure conversion is an IR-level transformation, lowering captures to
  explicit environment records.
- **Optimization** ([Part IV](/compiler/part-4-optimization/optimization-pipeline)):
  escape analysis (stack vs heap), and devirtualizing closure calls to
  direct calls.
- **Back end** ([Part V](/compiler/part-5-back-end/instruction-selection)):
  closure calls are indirect calls; environments are heap or stack records.
- **Runtime** ([Part VI](/compiler/part-6-runtime/garbage-collection)): the
  GC must trace through escaping environments.

Closures are the gateway feature of modern languages — every functional
feature, every callback, every lambda depends on them — and they touch the
whole pipeline. Getting them right (and fast) is a core compiler skill.

> :weightliftinggoose: The key idea: a **closure = code pointer +
> captured environment**, and **closure conversion** makes that
> environment an explicit parameter so every function becomes "closed" and
> the rest of the pipeline treats it normally. Drill the distinction:
> **lambda-lift** non-escaping closures (captures become parameters,
> cheap), **heap-allocate** escaping ones — and use **escape analysis** to
> tell which is which (stack vs heap). Remember closures and objects are
> the same machinery (`env` == `this`, indirect call == virtual call).
> Make the implicit capture explicit, and the magic becomes a struct.

## What we covered

- **First-class functions** that capture variables and **escape** their
  birth scope break the "function = code label" model.
- A **closure** = **code pointer + captured environment**; **free
  variables** are captured at creation.
- **Closure conversion** makes the environment an explicit parameter, so
  every function becomes **closed** and downstream stages treat it
  normally.
- **Lambda lifting** hoists non-escaping closures by turning captures into
  parameters; escaping closures need a heap environment.
- A closure is a heap (or stack) record `[code ptr | captured values]`;
  calling it is an **indirect call** with the environment as a hidden
  argument.
- **Escape analysis** proves a closure doesn't escape, allowing **stack**
  allocation instead of heap — making closures nearly free.
- **Closures and objects are dual** (`env` ↔ `this`, indirect call ↔
  virtual call) — shared machinery.
- First-class functions ripple through **every** pipeline stage.

## What's next

[Chapter 24](/compiler/part-7-language-features/pattern-matching-and-adts)
— algebraic data types and pattern matching. How the compiler represents
sum types (tagged unions) and turns a `match` expression into an efficient
**decision tree**, with exhaustiveness and redundancy checking along the
way.
