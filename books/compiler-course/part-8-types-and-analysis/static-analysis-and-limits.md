---
sidebar_position: 4
title: "Static Analysis and Its Limits"
---

# Static Analysis and Its Limits

> The unifying theory — and the hard wall. Every analysis you've built (the
> optimizer's data-flow, the borrow checker, the type system) is **static
> analysis**: reasoning about a program *without running it*. Its general
> framework is **abstract interpretation**; its eternal trade-off is
> **soundness vs precision**; and its hard limit is **undecidability** —
> Rice's theorem guarantees no analysis can be exact, so every one must
> *approximate*. This chapter names the theory and closes the course.

We end the expansion where the deepest ideas live. The data-flow analysis
of [Chapter 14](/compiler/part-4-optimization/data-flow-analysis), the
borrow checker of
[Chapter 29](/compiler/part-8-types-and-analysis/ownership-and-borrow-checking),
type inference, escape analysis — they're all instances of one thing,
**static analysis**, governed by one framework and bounded by one
fundamental limit. Understanding that frame and that limit is the
intellectual capstone of compiler design.

## 1. What static analysis is

**Static analysis** is reasoning about a program's behavior **without
executing it** — answering questions like "is this variable ever null
here?", "can this borrow dangle?", "is this value always positive?", "is
this code dead?" — from the program *text* alone.

The compiler is a giant static analyzer. Every optimization needs a
*proof* that a transformation is safe (you can only delete dead code if you
*know* it's dead); every type check is a *proof* that no type error can
occur at runtime. Static analysis is how the compiler *knows* things about
all possible executions, having run none of them. The catch — the whole
drama of this chapter — is that knowing things about *all possible
executions* of an arbitrary program is, in general, **impossible** (§5).

## 2. Abstract interpretation: the general framework

The unifying theory behind essentially all static analyses is **abstract
interpretation** (Cousot & Cousot): run the program in your head, but over
**abstract values** instead of concrete ones — tracking *properties*
rather than exact values.

Instead of "x is 7," track an **abstraction** like "x is positive" or "x is
non-null" or "x's sign is `{+}`". You define:

- An **abstract domain** (a **lattice** of properties — e.g. `{positive,
  negative, zero, unknown}`, ordered by precision).
- **Transfer functions**: how each operation transforms abstract values
  (`positive * positive = positive`; `positive + negative = unknown`).
- A **join** for merging paths (at a CFG merge, combine the abstract values
  conservatively — `positive` joined with `negative` = `unknown`).
- **Fixpoint iteration**: propagate abstract values over the CFG until they
  stop changing — exactly the fixpoint of
  [Chapter 14](/compiler/part-4-optimization/data-flow-analysis).

```
analyze "sign of x":  x = 5 → {+};  if (...) x = -1 → {−};
   at the merge:  {+} ⊔ {−} = {unknown}   (join loses precision, safely)
```

Data-flow analysis, the borrow checker, type inference, range analysis —
all are abstract interpretation over different domains. *This* is the
general structure you kept rediscovering: pick a property lattice, define
transfer functions, iterate to a fixpoint.

> :nerdygoose: Recognizing that data-flow analysis (Part IV), the type
> checker (Part III), and the borrow checker (Chapter 29) are *the same
> activity* — abstract interpretation over different lattices — is the
> moment compiler internals click into a single picture. Liveness tracks
> "is this value used later" over the lattice `{live, dead}`. Type checking
> tracks "what type" over the lattice of types. The borrow checker tracks
> "which loans are active" over sets of loans. Range analysis tracks
> "what interval" over intervals. **Different domain, same machine**: a
> lattice, transfer functions, a join, a fixpoint. Once you see it, you can
> *invent* a new analysis by just choosing a new lattice — which is exactly
> what compiler researchers do.

## 3. Soundness vs precision

Every static analysis lives on a trade-off between two virtues it can't
both maximize:

- **Soundness**: the analysis never *misses* a real case — if it says
  "safe," it really is safe. (No false negatives.) An *optimizer* analysis
  *must* be sound: deleting "dead" code that's actually live is a
  miscompile.
- **Precision** (completeness): the analysis never raises a *false alarm* —
  it doesn't flag safe programs as unsafe. (No false positives.)

You generally **cannot have both** (§5 says why), so analyses choose. A
**sound** analysis is **conservative**: when unsure, it assumes the worse
case ("might be null," "might alias," "loan might be live") — so it's
always correct but sometimes overly cautious, rejecting safe programs (the
borrow checker's false rejections,
[Chapter 29](/compiler/part-8-types-and-analysis/ownership-and-borrow-checking))
or missing optimizations. The art is being *as precise as possible while
staying sound* — losing the least precision at joins, using flow- and
context-sensitivity where it pays.

## 4. The approximation is everywhere

Once you see soundness-as-conservatism, you see it throughout the compiler:

- **Optimizer**: "I can't *prove* this load is redundant, so I keep it" —
  a missed optimization, but never a wrong one. Optimizers are sound and
  *under*-approximate what they can improve.
- **Borrow checker / type checker**: "I can't *prove* this is safe, so I
  reject it" — a false positive, an annoyed programmer, but never an unsafe
  program accepted. Safety checkers are sound and *over*-approximate the
  danger.
- **Bug finders / linters**: often deliberately **unsound** — they tolerate
  false negatives (missed bugs) to avoid drowning you in false positives,
  trading a guarantee for usability.

Which way an analysis leans (reject-when-unsure vs allow-when-unsure)
depends on what a mistake *costs*: a miscompile is catastrophic (optimizers
stay sound), a rejected-but-safe program is merely annoying (checkers stay
sound), a missed lint is tolerable (linters go unsound). Reading any
analysis, ask: *which errors does it refuse to make, and which does it
accept?*

## 5. The hard wall: undecidability

Why can't an analysis just be exact? Because of a theorem. **Rice's
theorem** (a consequence of the halting problem) states, roughly:

> Any **non-trivial** question about the *behavior* of an arbitrary program
> is **undecidable** — no algorithm can answer it correctly for all
> programs.

"Will this variable ever be null at this line?" "Is this code reachable?"
"Do these two pointers ever alias?" — all undecidable in general, because
answering them exactly would let you solve the halting problem. There is no
perfect null-checker, no perfect dead-code detector, no perfect alias
analysis, *ever* — not from lack of cleverness, but as a mathematical
impossibility.

This is *why* §3's trade-off is forced: since exact answers are
impossible, every analysis must **approximate**, and approximation means
choosing which side to err on (sound-but-imprecise, or
precise-but-unsound). Undecidability isn't a footnote — it's the bedrock
fact that *shapes the entire design* of static analysis. The compiler
isn't conservative because its authors were lazy; it's conservative
because the universe forbids the alternative.

> :surprisedgoose: The deepest, most humbling truth in compilers: your
> compiler is **provably, permanently imperfect**, and *cannot* be
> otherwise. It will always reject some safe programs (or miss some
> optimizations, or fail to catch some bugs) — not because of bugs in the
> compiler, but because Rice's theorem *guarantees* no compiler can be
> exact. Every "why won't the borrow checker accept this obviously-fine
> code?" and every "why didn't the optimizer catch this?" traces back to
> the same source: a wall of undecidability that no amount of engineering
> can breach. The work of compiler design isn't *reaching* perfection;
> it's choosing the *most useful approximation* on the right side of an
> impossible problem.

## 6. Buying precision: flow, path, and context sensitivity

Within the soundness constraint, analyses *buy* precision by being more
discriminating — at a cost in time and space:

- **Flow-insensitive**: ignore statement order (cheap, imprecise).
- **Flow-sensitive**: track facts per program point (the borrow checker's
  NLL, [Chapter 29](/compiler/part-8-types-and-analysis/ownership-and-borrow-checking))
  — more precise, more expensive.
- **Path-sensitive**: distinguish different control-flow paths (very
  precise, very expensive — exponential paths).
- **Context-sensitive** (interprocedural): analyze a function differently
  per call site — precise across calls, costly.

More sensitivity = more precision = more cost, with diminishing returns and
eventually intractability. Choosing *how much* sensitivity is the
engineering core of building a real analysis: enough to be useful, not so
much it doesn't terminate in your lifetime. This is why production analyses
are a careful balance, not a quest for maximal precision.

## 7. Where static analysis lives beyond the compiler

The framework you now have powers a whole industry beyond `cc`:

- **Linters and bug-finders** (Clang Static Analyzer, Coverity,
  Infer): hunt nulls, leaks, races — usually trading soundness for
  usability.
- **Type checkers as tools** (mypy, TypeScript): gradual, optional static
  analysis bolted onto dynamic languages.
- **Security analysis** (taint tracking: does untrusted input reach a
  dangerous sink?) — abstract interpretation over a "tainted/clean"
  lattice.
- **Formal verification & certified compilers**: at the precise/sound
  extreme, tools like **CompCert** (a *proven-correct* C compiler) and
  proof assistants verify programs against specs — paying enormous effort
  to push past the usual approximations for the cases where correctness is
  worth any price.

Static analysis is one of the most transferable skills in all of computing:
the lattice-and-fixpoint framework you built for an optimizer is the same
tool used to find security holes, verify aircraft software, and type-check
JavaScript. Learn it once in a compiler; use it everywhere.

## 8. The expanded course, complete

That closes the expansion — and the whole course. Look at the full arc:

- **[Parts I–VI](/compiler/table-of-contents)**: the complete pipeline,
  source to optimized machine code, with a runtime.
- **[Part VII](/compiler/part-7-language-features/closures)**: the *features*
  that make real languages real — closures, ADTs/pattern matching,
  exceptions/continuations, modules/linking.
- **[Part VIII](/compiler/part-8-types-and-analysis/type-inference)**: the
  *frontier* — type inference, generics, ownership/borrow checking, and the
  theory and limits of static analysis itself.

And it ends on the deepest idea of all: the compiler is a vast machine for
proving things about programs it never runs — bounded forever by
undecidability, doing the most useful approximation it can on the right
side of an impossible problem. That tension — between what we want to know
and what we provably *can* know — is the soul of compiler design. You've
now seen the whole of it, from a character of source text to the
mathematical wall at the edge of analysis.

> :weightliftinggoose: The capstone idea: **all** of it — the optimizer's
> dataflow, the type checker, the borrow checker, every linter — is
> **static analysis**, unified by **abstract interpretation** (a property
> **lattice**, transfer functions, a **join**, a **fixpoint**). Every
> analysis trades **soundness** (never wrong) against **precision** (never
> a false alarm), and **can't have both** because **Rice's theorem** makes
> exact answers **undecidable** — so all analysis is *approximation*, and
> the only choice is which way to err. Buy precision with flow/path/context
> sensitivity, at a cost. This framework reaches far past compilers —
> linters, security, verification. You've reached the wall at the edge of
> what compilers can know. Course complete.

## What we covered

- **Static analysis** reasons about all executions of a program **without
  running it**; the compiler is a giant static analyzer (every
  optimization and type check is a *proof*).
- **Abstract interpretation** is the unifying framework: a **lattice** of
  abstract properties, **transfer functions**, a **join** at merges, and
  **fixpoint** iteration — the structure shared by dataflow, type checking,
  and borrow checking.
- Every analysis trades **soundness** (no false negatives — required for
  optimizers and safety checkers) against **precision** (no false
  positives); sound analyses are **conservative** (assume the worst when
  unsure).
- **Rice's theorem** makes any non-trivial question about program behavior
  **undecidable**, so exact analysis is **impossible** — every analysis
  *must* approximate, and that forces the soundness/precision trade.
- Precision is bought with **flow-, path-, and context-sensitivity**, at
  rising cost and risk of intractability.
- The framework powers **linters, type-checkers-as-tools, security
  (taint) analysis, and certified compilers (CompCert)** — one of
  computing's most transferable skills.
- The course is complete: from source text to machine code to the
  undecidability wall at the edge of what a compiler can know.

## What's next

That's the full, expanded course. The [Appendix](/compiler/appendix/toolchain)
has a toolchain guide, a [glossary](/compiler/appendix/glossary), and
[further reading](/compiler/appendix/further-reading) — the canonical books
(the Dragon Book, *Engineering a Compiler*, SICP, *Types and Programming
Languages* for Part VIII), real compiler codebases (LLVM, rustc), and the
projects worth building next. Go build a compiler — front end to back end,
and now the hard features and the deep analysis too.
