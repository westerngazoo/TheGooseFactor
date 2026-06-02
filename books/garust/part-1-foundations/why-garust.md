---
sidebar_position: 1
title: "Why garust"
---

# Why garust

> Physics is taught as a toolbox of unrelated mathematics — vectors and
> the cross product, complex numbers, quaternions, matrices, tensors,
> Pauli and Dirac matrices. **Geometric Algebra** reveals these are all
> one structure. This book builds that structure as a real Rust engine,
> `garust`, and then rebuilds physics on top of it. This chapter is the
> case for why.

Welcome. Before any equations, the motivation — because the whole book is
an argument that physics has been carrying around *fragments* of one
beautiful algebra under a dozen different names, and that assembling the
whole thing (in code you can run) changes how you see everything from a
spinning top to the electromagnetic field.

## 1. The fragmentation problem

Open any physics curriculum and count the *separate* mathematical systems
you're asked to learn, each with its own rules:

- **Vectors and the cross product** for 3D geometry and angular quantities.
- **Complex numbers** for oscillations, AC circuits, 2D rotations.
- **Quaternions** for 3D rotations (in graphics and robotics).
- **Matrices** for linear transformations.
- **Tensors** for relativity and continuum mechanics.
- **Pauli matrices** for spin-½; **Dirac matrices** for the relativistic
  electron.
- **Differential forms** for advanced electromagnetism.

These are taught as *different subjects*. Students memorize the cross
product's right-hand rule, then separately memorize quaternion
multiplication, then separately learn that $i^2 = -1$, never told that
these are the *same operation* in different dimensions. The cross product
only works in 3D and produces a vector that behaves strangely under
reflection. Quaternions arrive as a magic trick. It's a pile of tools, and
the connections are hidden.

## 2. The Geometric Algebra promise

**Geometric Algebra** (GA) — Clifford algebra, given a geometric
interpretation — is the claim that **all of these are one algebra**, and a
single product (the *geometric product*) generates the lot:

- Complex numbers are the even-grade part of 2D GA.
- Quaternions are the even-grade part of 3D GA.
- The cross product is a dimension-locked shadow of the **wedge** $\wedge$.
- Rotations in *any* dimension are **rotors**, $R = e^{B}$ for a bivector
  $B$ — and quaternions and complex exponentials are just the 3D and 2D
  cases.
- The electromagnetic field is *one* bivector $F$, and Maxwell's four
  equations become $\nabla F = J$.
- Spacetime, spinors, and the Dirac equation live in the same framework.

Learn GA and the fragmentation collapses. You stop memorizing the costumes
and learn the one actor underneath. That unification is not just
aesthetic — it makes derivations shorter, generalizes formulas to any
dimension, and removes the special-case rules (no right-hand rule, no
gimbal lock, no coordinate-dependent tensors).

> :mathgoose: The historical tragedy GA corrects: in the 1840s Hermann
> Grassmann (the wedge / exterior algebra) and William Hamilton
> (quaternions) each had half of it, and William Clifford (1878) *united
> them* into the geometric product — and then died at 33, before the idea
> took hold. Gibbs and Heaviside packaged the easy 3D special case (the
> "vector calculus" with the cross product) for engineers, and it won the
> textbooks. So for a century physics taught the *shadow* (3D vector
> calculus, dimension-locked, reflection-broken) instead of the *thing*
> (Clifford's geometric product, any dimension, fully geometric). GA is
> the recovery of the road not taken.

## 3. Why build it — and why in Rust

You could *read* about GA. We're going to **build** it, because
implementing an idea forces a precision that reading doesn't, and because
a working engine is something you can *use* — to do real physics, to
check your understanding, to play. The engine is **`garust`**.

Why Rust specifically:

- **Const generics encode the algebra at the type level.** A GA is fixed
  by three integers (the signature $Cl(P,Q,R)$, [Chapter 2](/garust/part-1-foundations/the-multivector));
  Rust's `const` generics let `garust` make those *type parameters*, so
  `Pga3` and `Sta` are distinct types the compiler checks — you can't
  accidentally mix algebras.
- **Generics over the scalar** let one implementation serve `f64`, `f32`,
  or your own number type (dual numbers for autodiff, fixed-point) — the
  same code, any precision.
- **Zero-cost abstractions** (the Rust promise)
  mean the high-level multivector code compiles to tight numeric loops —
  essential for an engine that will run physics in real time.
- **Memory safety with no GC** — the right profile for a simulation core.

GA's "one algebra, many signatures" maps *perfectly* onto Rust's "one
generic type, many instantiations." The math and the language fit.

## 4. What garust is

**`garust`** is a from-scratch, **zero-dependency** Geometric Algebra
library. Its entire world is one type:

```rust
Multivector<T, const P: usize, const Q: usize, const R: usize, const DIM: usize>
```

generic over the scalar `T` and the signature $Cl(P,Q,R)$. From those three
integers it builds every algebra physics needs:

| signature   | algebra            | unlocks |
|-------------|--------------------|---------|
| `Cl(2,0,0)` | 2D Euclidean       | complex numbers |
| `Cl(3,0,0)` | 3D Euclidean       | rotors (quaternions, generalized) |
| `Cl(3,0,1)` | 3D Projective      | points, lines, planes, rigid motion |
| `Cl(4,1,0)` | 3D Conformal       | circles, spheres, conformal maps |
| `Cl(1,3,0)` | Spacetime          | special relativity, the Dirac equation |

One type, one geometric product, every algebra — because they genuinely
*are* the same construction with a different metric. The README's quick
start shows the payoff already:

```rust
use garust::Vga3;

let a = Vga3::basis(1) + Vga3::basis(2);   // e1 + e2
let b = Vga3::basis(2) + Vga3::basis(3);   // e2 + e3

// The geometric product splits into symmetric + antisymmetric parts:
assert_eq!(a * b, a.inner(&b) + a.wedge(&b));   // a*b = a·b + a∧b
```

That one identity — which we'll meet properly in
[Chapter 4](/garust/part-1-foundations/wedge-inner-and-the-identity) — is
the seed of the entire subject.

## 5. The plan: the foundations, then the engine

This book is built in two interleaved movements, and it hands off to its
companions:

1. **The foundations of GA** — the multivector, the geometric product,
   wedge/inner, grades, reflections, rotors, duality, projective geometry,
   and rigid-body motors. The mathematics, built from the geometric product
   up.
2. **The engine** — each idea realized as working `garust` code, so by the
   end you have a real, zero-dependency GA library you understand line by
   line.

The math and the code are interleaved: every concept is introduced as
mathematics, *then* built in `garust`. The **physics** — using this engine
to reconstruct mechanics, electromagnetism, and relativity — is the job of
the companion **[Physics through GA](/physics-ga/)**; geometric deep
learning is **[AI through GA](/ai-ga/)**. `garust`, built here, is the
foundation they both run on.

## 6. What you'll be able to do

By the end of Part I alone, you'll be able to:

- Represent any geometric object — scalars, vectors, planes, volumes — as a
  **multivector**, and compute with them via the **geometric product**.
- **Rotate** anything in any dimension with a **rotor** — no matrices, no
  quaternion bookkeeping, no gimbal lock — and compose rotations by
  *multiplying* them.
- See *why* complex numbers and quaternions work, because you've built the
  algebra they're special cases of.

And by the end of the book you'll have a complete GA engine that's *yours* —
the foundation on which the companion books build mechanics,
electromagnetism, relativity, and machine learning. That's the offer: not a
tour of GA, but the tool itself.

> :weightliftinggoose: Here's the deal this book asks you to take:
> *invest in one algebra, collect all of physics.* It's front-loaded —
> Part I is pure foundation, and it will feel like learning a new language
> because it is one. But the geometric product is *one* rule, the rotor is
> *one* construction, and from them the cross product, complex numbers,
> quaternions, and (later) spinors and the EM field all fall out as
> *consequences* instead of separate memorization. Build the foundation in
> `garust`, run every example, and the unification stops being a slogan and
> becomes something you can compute. Start with the multivector.

## What we covered

- Physics is taught as **fragmented** mathematics (cross product, complex
  numbers, quaternions, matrices, tensors, Pauli/Dirac matrices) — all
  secretly one structure.
- **Geometric Algebra** unifies them: one **geometric product** generates
  rotations, complex numbers, quaternions, the cross product, the EM field,
  and spacetime as facets of one algebra.
- We **build** GA rather than just read it — as **`garust`**, a from-scratch
  zero-dependency Rust engine — because **Rust's const generics + scalar
  generics** map exactly onto GA's "one algebra, many signatures."
- `garust`'s core is one type, `Multivector<T, P, Q, R, DIM>`, that
  realizes every algebra physics needs from the signature $Cl(P,Q,R)$.
- The plan is **foundations + engine, interleaved**: this book builds GA
  and `garust`; the companion **Physics through GA** and **AI through GA**
  build on the engine.

## What's next

[Chapter 2](/garust/part-1-foundations/the-multivector) — the multivector.
The signature $Cl(P,Q,R)$, the $2^N$ **blades** built from $N$ generators,
the bitmask indexing convention, and the generic core type
`Multivector<T, P, Q, R, DIM>` — the single object every later idea is
built from.
