---
sidebar_position: 1
sidebar_label: Introduction
title: "Geometric Algebra"
slug: /
---

# Geometric Algebra

This is a study journal. Not a textbook, not a lecture — just the trail of breadcrumbs left by a goose who got tired of the cross product only working in 3D and decided to figure out what the actual framework should be.

> :angrygoose: Let me be blunt. We've been taught a fragmented mess. Dot products over here, cross products over there, quaternions if you squint, rotation matrices if you're feeling masochistic. Geometric algebra unifies all of it under one product. One. And nobody told us in undergrad.

## Why Geometric Algebra?

Traditional linear algebra hands you a grab bag of tools:
- Dot product (scalar, measures alignment)
- Cross product (vector, perpendicular... but only in 3D?)
- Quaternions (rotation... but where did $i, j, k$ come from?)
- Rotation matrices (correct but opaque)

GA replaces all of them with the **geometric product**. Rotations, reflections, projections — they all fall out of one coherent framework without coordinate-system gymnastics.

> :surprisedgoose: The cross product $\mathbf{a} \times \mathbf{b}$ doesn't generalize beyond 3D. That's not a limitation of your textbook — it's a fundamental mathematical fact. The cross product is an accident of $\mathbb{R}^3$ having exactly one direction perpendicular to a plane. GA's wedge product works in any dimension because it gives you the plane itself, not a vector perpendicular to it.

If you've ever felt that quaternions came out of nowhere, or that the cross product being dimension-locked was suspicious, GA is the answer to those gut feelings.

## What's Covered

### Foundations
- Vectors, scalars, and the geometric product
- Axioms — just two, and everything else falls out
- Multivectors and grade structure

### Products & Operations
- Inner, outer, and geometric products — how they relate
- Blades, grades, and grade projection
- Duality and the pseudoscalar

### Geometry
- Reflections and projections with GA
- Lines, planes, and volumes as algebraic objects
- Meet and join operations

### Rotations & Rotors
- Why rotors beat matrices and quaternions
- Sandwich products and their geometry
- Rotors in 2D, 3D, and beyond

### Applications
- Physics: electromagnetism, relativity
- Computer graphics and game engines
- Robotics and spatial reasoning

> :weightliftinggoose: Think of this like progressive overload. We start with just two axioms and build up. Each section adds weight — bivectors, then rotors, then applications. Don't skip ahead. The foundation reps are what make the heavy lifts possible later.

## Study Approach

1. **Intuition first** — geometric pictures before symbol pushing.
2. **Compute it** — work concrete examples, not just proofs.
3. **Connect it** — map GA concepts back to linear algebra, complex numbers, and quaternions you already know.
4. **Code it** — implement key operations to check understanding.

## Resources I'm Working From

- *Geometric Algebra for Physicists* — Doran & Lasenby
- *Linear and Geometric Algebra* — Macdonald
- *Geometric Algebra for Computer Science* — Dorst, Fontijne, Mann
- Various lectures and visualizations found along the way

> :happygoose: The moment you see rotations as rotor sandwich products instead of matrix multiplications, the dopamine hit is unmatched. Stick with it.

---

*These notes grow as I learn. Expect rough edges, revised sections, and the occasional honk of frustration.*
