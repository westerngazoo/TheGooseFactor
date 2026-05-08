---
sidebar_position: 1
sidebar_label: Introduction
title: "AI through Geometric Algebra"
slug: /
---

# AI through Geometric Algebra

> An R&D notebook tracking how geometric algebra is reshaping
> deep learning — equivariant networks, Clifford / multivector
> architectures, geometric representations for molecules and
> robots, and the open research questions on the frontier.

This book is more **literature review** than textbook. The field
is young: most of the foundational papers were published between
2021 and 2025. This is the working synthesis of where things
stand and where they're heading.

## Why GA for AI?

Three converging pressures.

**1. Equivariance is the new symmetry constraint.** Networks
that respect rotational, translational, or Lorentz symmetry
generalize better, train faster, and need less data. Group
theory gives you these guarantees in principle; **geometric
algebra gives you the operations natively** — rotors *are* the
group action.

**2. Multivectors unify representations.** A scalar, a vector, a
3D rotation, a 6D rigid motion, a stress tensor — all live as
different grades of one multivector type. Architectures that
thread multivectors end-to-end avoid the type-conversion
gymnastics that fragment standard pipelines.

**3. Robotics & physics-informed ML need rigid-motion
algebras.** SE(3) for rigid bodies, SO(4) for higher-dimensional
parameter spaces, conformal GA for points + spheres. Each of
these has a rotor representation that composes cleanly. Networks
operating on these algebras inherit the algebraic structure for
free.

> :nerdygoose: "Equivariance" sounds abstract until you've
> watched a non-equivariant network fail to predict the rotation
> of a molecule because it was trained on one orientation. GA
> makes the symmetry the architecture's spine, not its
> afterthought.

## What we cover

| Part | Topic | Key references |
|---|---|---|
| **I** — Why GA for ML? | Motivation, where current architectures fall short | Bronstein et al., Geometric DL book |
| **II** — Equivariant networks | E(n), SE(3) transformers, equivariant attention | Satorras 2021, Fuchs 2020 |
| **III** — Clifford / GA neural networks | Multivector layers, learned rotors | Brandstetter 2022, Ruhe 2023 |
| **IV** — Multivector representations | Molecules, point clouds, conformal embeddings | Equiformer (Liao 2022) |
| **V** — Robotics & control | GA-based policies, screw motors, manipulation | Lasenby (UCL), open-source libs |
| **VI** — Frontiers | Open problems, scaling, interpretability | Recent papers + workshops |

## Prerequisites

- The basic GA framework — read at least sections 1–2 of the
  [GA study journal](/geometric-algebra) or Mathoma's playlist.
- Comfort with deep learning fundamentals: backprop, attention,
  graph networks.
- Optional but useful: group theory at the level of "what is
  $SO(n)$ and why do we care?".

You do **not** need:
- Lie group representation theory (we'll explain what we use).
- Mainstream physics background. The AI applications use GA
  directly without going through Doran-Lasenby first.

## Status

Active R&D notebook. Chapters land as the literature is read and
synthesized. Expect updates as the field moves — this isn't a
settled subject yet, and the goose personas will tell you when
something is contested or speculative.

> :weightliftinggoose: GA-in-AI is a live research field, not a
> textbook one. Expect to read papers alongside this book. We'll
> point at the canonical ones and try to sequence them so you
> build the picture without reading 200 papers first.
