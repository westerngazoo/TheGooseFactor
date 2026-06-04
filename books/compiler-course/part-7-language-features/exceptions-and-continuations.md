---
sidebar_position: 3
title: "Exceptions and Continuations"
---

# Exceptions and Continuations

> Non-local control flow — jumping out of the normal call-return
> discipline. Implementing **exceptions** means unwinding the stack and
> running cleanup along the way; the modern "zero-cost" scheme makes the
> happy path free and the throw path expensive. Underneath sits a more
> general idea, the **continuation** ("the rest of the computation"),
> which also explains generators and async.

So far control flow has been structured: call and return, branch and loop
([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)). Real languages
break that discipline — `throw` jumps out of arbitrary depth, generators
suspend and resume, `async` pauses mid-function. This chapter covers how a
compiler implements **non-local control flow**, from the practical
(exceptions) to the general (continuations).

## 1. The shape of the problem

Normal control flow is a stack discipline: a call pushes a frame, a return
pops it. Non-local control flow *violates* this — it transfers control to a
point that isn't the immediate caller:

```
fn a() { b(); }
fn b() { c(); }
fn c() { throw Error; }   // control must jump from c() all the way back to
                          // a handler in a(), skipping b()'s normal return
```

The throw in `c` must abandon `c` and `b` and resume at a handler in `a` —
unwinding two frames, running any cleanup they require, carrying the
exception value. The compiler must generate machinery to find the handler,
unwind the stack correctly, and not leak resources on the way. That's the
exception problem.

## 2. The simple scheme: setjmp/longjmp

The oldest implementation is **dynamic registration** — at runtime, each
`try` pushes a handler record onto a handler stack; `throw` pops to the
nearest one and does a `longjmp` (restore the saved stack pointer and
registers):

```
try:    push handler (save SP, registers, handler address) onto handler stack
throw:  pop the top handler; restore its saved SP/registers; jump to it
```

This is simple and portable (it's how C's `setjmp`/`longjmp` works, and how
many early C++ implementations worked). Its flaw: it costs on the **happy
path** — *every* `try` does work (pushing/popping the handler record) even
when no exception is ever thrown. Since exceptions are rare, paying on the
common path is backwards. That motivated the modern scheme.

## 3. Zero-cost exceptions

The dominant modern approach — **table-based** or **zero-cost**
exceptions — flips the cost: the *normal* path pays **nothing**, and *all*
the cost moves to the (rare) throw path. The trick is to record the
handler and cleanup information in **static side tables** generated at
compile time, instead of doing runtime registration:

```
compile time: emit unwind tables — for each code range (PC range), record
              "where is the handler?" and "what cleanup runs here?"
normal path:  nothing — no try/catch instructions at all
throw path:   the unwinder walks the stack frame by frame, looks up each
              return address (PC) in the tables, runs cleanup, finds the handler
```

On a `throw`, a runtime **unwinder** walks up the call stack; for each
frame it looks up the current program counter in the static tables (the
**DWARF/EH** tables) to learn what cleanup that frame needs and whether it
has a matching handler. The happy path executes as if exceptions didn't
exist — hence "zero-cost" (in time; the tables cost space). This is how
C++, Rust panics, and others work.

> :surprisedgoose: "Zero-cost exceptions" are zero-cost only when you
> *don't* throw — and quite *expensive* when you do, because unwinding
> means walking the stack and doing table lookups per frame. This is a
> deliberate, and correct, bet: exceptions should be *exceptional*, so
> optimize the path where they don't happen and let the rare throw be
> slow. It's the opposite of `setjmp`/`longjmp`, which taxes every `try`.
> The lesson generalizes across compiler design: *move cost off the common
> path onto the rare one*, even if the rare one gets much worse — total
> time wins. (It's also why using exceptions for ordinary control flow is
> a performance anti-pattern: you've put the slow path in a loop.)

## 4. Two-phase unwinding and cleanup

Unwinding is subtle because of **cleanup** — destructors, `defer`, `finally`,
lock releases that must run as frames are abandoned
([RAII](/compiler/part-6-runtime/garbage-collection) and friends). The
standard mechanism is **two-phase**:

1. **Search phase**: walk up the stack *without changing it*, asking each
   frame's table "do you have a handler for this exception?" Find the
   target handler first.
2. **Cleanup phase**: walk up *again*, this time actually unwinding — at
   each frame between the throw and the handler, run its **cleanup code**
   (the "landing pads": destructors, `finally` blocks), then pop the frame.
   Stop at the handler and resume there.

Two phases (rather than one) let the language decide *whether* it will
handle the exception before it starts destroying frames — important for
features like "if nothing catches this, abort with the stack intact for
debugging." The cleanup code the compiler emits at each frame is the
**landing pad**; generating correct landing pads (run every in-scope
destructor, in reverse order) is a real compiler responsibility.

## 5. Continuations: the general idea

Exceptions are a *special case* of a more general concept: the
**continuation** — a first-class value representing **"the rest of the
computation"** from a given point. If you can capture the continuation, you
can implement *any* control flow:

- A **continuation** is, conceptually, "everything that happens after this
  expression returns" — packaged as something you can invoke.
- Capturing it lets you *not* return normally: jump elsewhere (exceptions),
  return *multiple times* (generators), or resume later (async).

Some languages expose continuations directly (Scheme's `call/cc`); most
don't, but compilers use the *concept* internally. An exception throw is
"discard continuations up to the handler"; a generator `yield` is "save my
continuation, return to the caller, resume here later." Seeing control flow
as continuation-manipulation unifies all the non-local features.

## 6. CPS: continuations as an IR

One way compilers *use* continuations is **continuation-passing style
(CPS)** — an intermediate representation
([Chapter 9](/compiler/part-3-types-and-ir/intermediate-representation))
where every function takes an extra argument, its continuation `k`, and
instead of *returning* a value, *calls* `k` with it:

```
// direct style:
fn add1(n) { return n + 1; }

// CPS: never returns; calls its continuation with the result
fn add1(n, k) { k(n + 1); }
```

In CPS, *every* control construct — calls, returns, branches, loops, even
exceptions — becomes an explicit call to a continuation. Control flow that
was implicit (the call stack) becomes explicit data (continuation
functions). This makes non-local control trivial to express and optimize,
which is why several functional-language compilers (and some research
backends) use CPS as their core IR. The cost is that it's further from the
machine, so a later phase converts back to direct calls.

## 7. Generators and async: continuations in disguise

The most common modern non-local features — **generators** (`yield`) and
**async/await** — are continuations, compiled as **state machines**:

```
// a generator that yields 1 then 2:
fn gen() { yield 1; yield 2; }

// compiled to a state machine: each yield is a state; calling next()
// resumes at the saved state, runs to the next yield, saves state, returns.
struct Gen { state: int; }
fn next(g) {
    switch g.state {
      0: g.state = 1; return 1;   // resume point after first yield
      1: g.state = 2; return 2;
      2: return DONE;
    }
}
```

The compiler performs a **CPS-like transformation** that turns a function
with suspension points into a struct (holding the saved local state) plus a
`resume`/`next` function that jumps to the saved point. Each `yield`/`await`
is a state; the local variables that must survive suspension become struct
fields (a heap-allocated "stack frame" that outlives normal returns —
echoing closures, [Chapter 23](/compiler/part-7-language-features/closures)).
`async`/`await` is the same machinery with the resume driven by an event
loop. Generators and async aren't magic — they're a compiler rewriting
your function into a resumable state machine.

## 8. Non-local control through the pipeline

These features touch the stages distinctively:

- **Front end**: parse `try`/`catch`/`throw`, `yield`, `await`; mark
  suspension points.
- **IR/lowering** ([Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir)):
  the big work — exception edges in the CFG
  ([Chapter 11](/compiler/part-3-types-and-ir/cfg-and-ssa)), the
  state-machine transform for generators/async, optionally CPS.
- **Optimization**: exception edges constrain optimizations (code that
  might throw can't always be reordered); cleanup paths are cold and
  optimized for size.
- **Back end** ([Part V](/compiler/part-5-back-end/instruction-selection)):
  emit landing pads and the static **unwind tables**; the runtime ships an
  **unwinder**.
- **Runtime** ([Part VI](/compiler/part-6-runtime/garbage-collection)): the
  unwinder, and GC tracing through suspended state-machine frames.

Non-local control flow is where the tidy call-return model meets reality —
and where one idea, the continuation, quietly underlies exceptions,
generators, and async alike.

> :weightliftinggoose: Hold three layers. **Exceptions**: the modern
> scheme is **zero-cost** (static unwind tables, free happy path, expensive
> throw via a stack-walking **unwinder** and two-phase **cleanup/landing
> pads**) — so don't use them for ordinary control flow. **Continuations**:
> "the rest of the computation" as a value — the general concept that
> *exceptions, generators, and async are all special cases of*. **State
> machines**: generators/`async` are compiled by rewriting a function with
> suspension points into a struct of saved locals + a `resume` function.
> One unifying idea (continuation), three everyday features.

## What we covered

- **Non-local control flow** violates the call-return stack discipline:
  `throw` jumps out of arbitrary depth, generators suspend, async pauses.
- **Exceptions, simple scheme**: `setjmp`/`longjmp`-style dynamic handler
  registration — taxes every `try` on the happy path.
- **Zero-cost exceptions**: static **unwind tables**; the normal path pays
  nothing, the rare **throw** pays everything (stack-walking unwinder).
- **Two-phase unwinding**: search for a handler first, then unwind running
  each frame's **cleanup/landing pad** (destructors, `finally`).
- A **continuation** = "the rest of the computation" as a value — the
  general concept; exceptions are "discard continuations to the handler."
- **CPS** is an IR where continuations are explicit (`k` argument, never
  return) — control flow as data.
- **Generators** and **async/await** are continuations compiled as
  **state machines** (saved locals in a struct + a `resume` function).

## What's next

[Chapter 26](/compiler/part-7-language-features/modules-and-linking) —
modules, separate compilation, and linking. How a program split across many
files becomes one executable: compilation units, symbols and name mangling,
the **linker** (symbol resolution and relocation), static vs dynamic
linking, and ABIs.
