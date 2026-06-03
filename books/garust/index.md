---
sidebar_position: 1
sidebar_label: Introduction
title: "Garust"
slug: /
---

# Garust

> **Geometric Algebra from the foundations up — and how we built it in
> Rust.** This book teaches GA from scratch (the one algebra behind complex
> numbers, quaternions, rotations, the electromagnetic field, and
> spacetime) and, in the same breath, shows how those foundations become
> **`garust`**: a real, zero-dependency GA engine. It is the foundation two
> companion books stand on — *Physics through GA* and, later, *AI through
> GA*.

Geometric Algebra (GA) is the unifying language of geometry: one product,
the *geometric product*, from which complex numbers, quaternions, the cross
product, rotations in any dimension, and (in the right signature) spacetime
all fall out as special cases. This book does two things at once — it
**teaches GA from the ground up**, and it **builds GA as a working Rust
engine**, `garust`, with the math and the code reinforcing each other at
every step.

## A family of three books

This is the **foundation** book. It's deliberately scoped to *just* GA and
its implementation — because two sister books build on it:

- **Garust** *(this book)* — the **foundations of GA** and **how `garust`
  implements them**. The algebra, the engine.
- **[Physics through GA](/physics-ga/)** — using GA (and `garust`) to
  **rebuild physics from scratch** — mechanics, electromagnetism,
  relativity — and to implement real **physics-engine** solutions on top of
  `garust`.
- **[AI through GA](/ai-ga/)** *(later)* — geometric deep learning,
  equivariance, and Clifford networks, on the same foundation.

`garust` is the shared bedrock: **this** book builds it; the others *use*
it. So here we stay on the algebra and the engine — no physics derivations,
no neural networks. Just the foundation, done thoroughly, so everything
built on it is solid.

## What makes this book different

- **Foundations + implementation, interleaved.** We don't just *describe*
  GA — we **build** it. Every concept is realized as working Rust in
  `garust`: the geometric product as a function, the rotor as a type. You
  finish understanding GA *and* owning an engine that does it.
- **One algebra, every signature — one Rust type.** GA's "one construction,
  many signatures" maps exactly onto Rust generics. `garust` is a single
  generic type that becomes 2D Euclidean, 3D, projective, conformal, or
  spacetime algebra by changing three numbers.
- **Grounded in real, running code.** `garust` is an actual library
  (`~/projects/garust`) — generic over the algebra's signature *and* the
  numeric type, with the geometric product, rotors, projective geometry,
  and rigid-body motors implemented. The code in this book is the code that
  runs.

## What is garust?

**`garust`** is a from-scratch, **zero-dependency** Geometric Algebra
library in Rust. Its entire world is one type:

```rust
Multivector<T, const P: usize, const Q: usize, const R: usize, const DIM: usize>
```

generic over the **scalar type** `T` (`f64`, `f32`, or your own) and the
**Clifford signature** $Cl(P, Q, R)$, so you choose your algebra *and* your
numeric precision at the type level:

| signature   | algebra            | what it is |
|-------------|--------------------|------------|
| `Cl(2,0,0)` | 2D Euclidean       | complex numbers fall out for free |
| `Cl(3,0,0)` | 3D Euclidean       | rotations as **rotors** (quaternions, generalized) |
| `Cl(3,0,1)` | 3D Projective (PGA)| points, lines, planes, **rigid motions** |
| `Cl(4,1,0)` | 3D Conformal (CGA) | adds circles, spheres, conformal maps |
| `Cl(1,3,0)` | Spacetime (STA)    | the algebra of special relativity |

One implementation, every algebra — because they're all the same
construction with a different signature. That unity is the thesis of the
book, made concrete in one Rust type.

> :mathgoose: The deep claim of Geometric Algebra is that mathematics has
> been re-deriving pieces of *one* structure under many names. The complex
> numbers are the even subalgebra of $Cl(2,0,0)$. The quaternions are the
> even subalgebra of $Cl(3,0,0)$. The "cross product" is a disguised,
> dimension-locked shadow of the wedge. Pauli matrices, Dirac matrices,
> differential forms, the curl and divergence — all are GA in costume.
> Learn the one algebra and you stop memorizing the costumes. Build it once,
> in `garust`, and you can compute with all of them.

## The shape of the book

Four parts — **the math and the engine, interleaved**:

- **Part I — Foundations: GA & the Engine.** The multivector, the geometric
  product, the wedge/inner split, grades, reflections, rotors, and `exp` —
  built as `garust`'s algebraic core. *(Drafted.)*
- **Part II — Geometry: Spaces & Motions.** Duality and the meet, Projective
  GA (points/lines/planes), and **motors** (rigid-body motion) — `garust`'s
  geometry layer. *(Roadmapped.)*
- **Part III — The Wider Algebras.** What `garust`'s generality buys:
  Conformal GA (circles, spheres), Spacetime Algebra (the algebra itself),
  and a signature cookbook — *which $Cl(P,Q,R)$ for what*. *(Roadmapped.)*
- **Part IV — Engine Design & Extension.** The architecture: generic over
  scalar and signature, the products as bit tricks, performance, and
  extending `garust` (custom scalars, autodiff, the API). *(Drafted.)*

See the [Roadmap](/garust/table-of-contents) for the full chapter list. The
**physics** — kinematics, the rigid body, Maxwell's equations, relativistic
dynamics — lives in the companion **[Physics through GA](/physics-ga/)**,
which builds directly on the engine this book constructs.

## What this book assumes

- **Comfort with Rust** at the level of *The Rust Book* (also on this site)
  — generics, traits, and `const` generics appear immediately (they're how
  `garust` encodes the signature).
- **Undergraduate math**: vectors, linear algebra, a little calculus. You do
  *not* need prior GA — we build it from the geometric product up.
- A willingness to **unlearn**: the cross product, "rotation = matrix," and
  "complex numbers are mysterious" all get replaced by something better.

## How to read it

Front to back. Part I is the foundation everything rests on — the engine's
algebra. **Code along** in `garust`: clone it, run the examples (they're
real, tested doctests), and modify them. The fastest way to *believe* that
a rotor rotates is to apply one and print the result. Geometric Algebra is
learned the way Rust is — at the keyboard, making the abstraction concrete.

> :weightliftinggoose: This is a build-it, run-it book — and a *foundation*
> book. Don't just read the geometric product; open `garust` and watch
> `a * b` split into `a.inner(&b) + a.wedge(&b)`. Don't just read about
> rotors; `exp` a bivector and sandwich a vector with it. Get this
> foundation solid and *two* further books (physics, then AI) stand on it.
> The investment compounds: one algebra, one engine, then all the physics
> and learning you can build on them.

Ready? [Part I, Chapter 1](/garust/part-1-foundations/why-garust) makes the
case for why one algebra unifies so much — and why we're building it in
Rust.
