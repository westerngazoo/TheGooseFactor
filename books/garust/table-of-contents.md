---
sidebar_position: 2
sidebar_label: "Table of Contents"
title: "Roadmap"
---

# Roadmap

The foundations of GA and the engine that implements them. Strikethrough =
drafted (and grounded in the current `garust` code); plain = roadmapped.

This book is deliberately scoped to **GA + its implementation**. The
**physics** built on `garust` lives in the companion
**[Physics through GA](/physics-ga/)**; geometric deep learning lives in
**[AI through GA](/ai-ga/)**.

## Part I — Foundations: GA & the Engine

1. ~~[Why garust](/garust/part-1-foundations/why-garust)~~ — one algebra,
   built in Rust
2. ~~[The multivector](/garust/part-1-foundations/the-multivector)~~ — the
   signature `Cl(P,Q,R)`, blades, and the generic core type
3. ~~[The geometric product](/garust/part-1-foundations/the-geometric-product)~~
   — the one product that generates the algebra
4. ~~[Wedge, inner, and the identity](/garust/part-1-foundations/wedge-inner-and-the-identity)~~
   — `a*b = a·b + a∧b`, grades, and norms
5. ~~[Reflections, rotors, and exp](/garust/part-1-foundations/reflections-rotors-and-exp)~~
   — rotation without matrices or quaternions

## Part II — Geometry: Spaces & Motions

6. ~~[Duality, the pseudoscalar, and the meet](/garust/part-2-geometry/duality-and-the-meet)~~
7. ~~[Projective GA: points, lines, and planes](/garust/part-2-geometry/projective-ga)~~
8. ~~[Motors: rigid-body motion](/garust/part-2-geometry/motors)~~

## Part III — The Wider Algebras

9. Conformal GA: circles and spheres
10. Spacetime Algebra: the algebra of relativity
11. The signature cookbook — which `Cl(P,Q,R)` for what

## Part IV — Engine Design & Extension

12. Generic over scalar and signature — the architecture
13. The products as bit tricks — performance and `O(DIM²)`
14. Extending garust — custom scalars, autodiff, and the API

## Appendix

A. The garust API reference
B. Further reading

## The companion books

- **[Physics through GA](/physics-ga/)** — kinematics, rotational dynamics
  (angular velocity as a *bivector*), the rigid body and the engine loop,
  the electromagnetic field as one bivector $F$, and relativity — all built
  on `garust`.
- **[AI through GA](/ai-ga/)** — equivariance, Clifford/geometric networks,
  and GA representations for learning.
