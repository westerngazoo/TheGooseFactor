---
id: intro
title: Introduction to Linear Algebra Universitam
sidebar_position: 1
slug: /
---

# Linear Algebra Universitam: A Geometric Algebra Approach

Welcome to **Linear Algebra Universitam**, an alternate study of linear algebra reimagined through the lens of **Geometric Algebra (GA)**.

Standard linear algebra is taught as the theory of matrices: rows, columns, row-reduction, and a determinant that arrives as a mysterious alternating sum with a sign rule nobody can quite motivate. Geometric Algebra turns the subject inside out. The fundamental objects are not arrays of numbers but **oriented subspaces** — a vector is an oriented length, a bivector is an oriented area, a trivector an oriented volume — and the **outer product** $\wedge$ builds them. The determinant stops being a formula and becomes what it always secretly was: the factor by which a linear map scales oriented volume.

## Why This Approach

- **The outer product explains the determinant.** $\mathbf{a}\wedge\mathbf{b}\wedge\mathbf{c}$ *is* the oriented volume; the determinant is just its scalar magnitude relative to a basis. The sign rules become obvious.
- **Linear maps are geometric operations.** Rotations are rotors $R(\,\cdot\,)R^\dagger$, reflections are sandwich products, and general linear maps extend to multivectors as **outermorphisms**.
- **Basis-free thinking.** GA lets us state and prove results about subspaces, projections, and orthogonality without ever choosing coordinates — and then recover the matrix picture on demand.

## What to Expect in This Course

We follow a standard first linear-algebra syllabus — vector spaces, linear maps, determinants, eigenvalues, inner products — but each topic is reframed geometrically:

- **Vectors and bivectors** as the grade-1 and grade-2 inhabitants of the algebra.
- **The outer product** as the engine of linear independence and orientation.
- **Linear maps** as transformations that act gradewise via outermorphisms.
- **Eigenvalues** as the invariant directions/planes of those maps.

> :mathgoose: One invariant to carry through the whole course: linear independence of $\{\mathbf{a}_1,\dots,\mathbf{a}_k\}$ is *exactly* the statement $\mathbf{a}_1\wedge\cdots\wedge\mathbf{a}_k \neq 0$. Every theorem about rank, dimension, and determinants is a corollary of when this wedge vanishes.

## The Units

We have mapped the traditional linear algebra syllabus into a GA-first framework:

1. **Unit I: Vectors & Spaces** — Vector spaces, subspaces, span, linear independence via the outer product, basis and dimension.
2. **Unit II: Linear Maps & Matrices** — Linear transformations, matrix representation as a chosen-basis shadow, and composition.
3. **Unit III: Determinants & the Outer Product** — The determinant as oriented-volume scaling, derived from $\wedge$; rank and invertibility.
4. **Unit IV: Eigenvalues & Eigenstuff** — Invariant directions and planes, diagonalization, and what "complex eigenvalues" mean geometrically (rotations in a plane / bivectors).
5. **Unit V: Inner Products & Orthogonality** — The inner product, projections, orthogonal bases, and reflections/rotors as orthogonal maps.

Let's begin with the objects themselves: vectors, and the spaces they inhabit.
