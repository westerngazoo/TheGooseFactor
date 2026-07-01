---
id: intro
title: Introduction to Calculus Universitam
sidebar_position: 1
slug: /
---

# Calculus Universitam: A Geometric Algebra Approach

Welcome to **Calculus Universitam**, an alternate study of calculus reimagined through the lens of **Geometric Algebra (GA)**.

Traditional calculus courses treat the derivative, the gradient, the divergence, the curl, and the integral as five loosely related ideas, each with its own notation and its own bag of tricks. Vector calculus then bolts on the cross product — a construction that only works in exactly three dimensions and quietly produces "axial vectors" that transform differently from real ones.

Geometric Algebra dissolves these seams. There is **one** derivative operator, the vector derivative $\nabla$, and **one** product, the geometric product. Gradient, divergence, and curl turn out to be the scalar and bivector parts of a single object. Integration becomes the summation of *directed* quantities, and the fundamental theorem of calculus, Green's theorem, the divergence theorem, and Stokes' theorem all become special cases of one statement.

## Why This Approach

- **Unification.** Grad, div, and curl are projections of $\nabla F$. Learn one operator instead of three.
- **Dimension independence.** Nothing here secretly depends on living in 3D. The wedge product $\wedge$ replaces the cross product and works in any number of dimensions.
- **Geometric meaning first.** A derivative is a local linear map; an integral is an oriented sum. We keep the geometry in view rather than burying it under index gymnastics.

## What to Expect in This Course

We revisit the standard single- and multivariable calculus syllabus, upgrading the toolkit as we go. Instead of memorizing disconnected rules, we will build on:

- **Limits** as the controlled approach of one quantity to another, made rigorous with $\varepsilon$–$\delta$.
- **The derivative** as the best local linear approximation — a *map*, not just a slope.
- **Directed integration**, where the measure carries orientation (a vector $d\mathbf{x}$, a bivector $d\mathbf{A}$) rather than being a bare scalar.
- **The vector derivative** $\nabla$, whose geometric product with a field unifies all of vector calculus.

> :mathgoose: Keep one invariant in mind throughout: differentiation and integration are *adjoint* operations glued together by a boundary. Every "fundamental theorem" you will meet is the same sentence — $\int_R \nabla F = \oint_{\partial R} F$ — read in a different number of dimensions.

## The Units

We have mapped the traditional calculus syllabus into a GA-first framework:

1. **Unit I: Limits & Continuity** — The rigorous foundation. Approach, neighborhoods, $\varepsilon$–$\delta$, and what it means for a vector-valued map to be continuous.
2. **Unit II: The Derivative as a Linear Map** — Differentiation reframed: the derivative is the best linear approximation, and the directional/vector derivative generalizes the humble slope.
3. **Unit III: Directed Integration** — Integrals as sums of oriented quantities, the fundamental theorem, and why $d\mathbf{x}$ wants to be a vector.
4. **Unit IV: Sequences & Series** — Convergence, power series, and Taylor expansions of multivector-valued functions.
5. **Unit V: Multivariable & Geometric Calculus** — The vector derivative $\nabla$, the unification of grad/div/curl, and the one theorem that contains Green, Gauss, and Stokes.

Let's begin where every rigorous calculus course must: with the limit.
