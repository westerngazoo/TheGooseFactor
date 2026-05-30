---
sidebar_position: 1
title: "Appendix A — Reading List"
---

# Appendix A — Reading List

The papers to know, organized by the book's structure. Starred (★)
entries are the essential reads.

## Foundations: geometric deep learning

- ★ **Bronstein, Bruna, Cohen, Veličković, "Geometric Deep Learning:
  Grids, Groups, Graphs, Geodesics, and Gauges" (2021)** — the
  unifying manifesto. Free PDF. Read first.
- **Cohen & Welling, "Group Equivariant Convolutional Networks"
  (2016)** — the paper that started modern equivariant deep learning.
- **Weiler, Cesa, et al., "General E(2)-Equivariant Steerable CNNs"
  (2019)** — the steerable-CNN framework.

## Part II: equivariant networks

- ★ **Satorras, Hoogeboom, Welling, "E(n) Equivariant Graph Neural
  Networks" (2021)** — EGNN. The simplest thing that works. 4 pages.
- ★ **Thomas et al., "Tensor Field Networks" (2018)** — the
  irrep-convolution foundation.
- **Fuchs, Worrall, Fischer, Welling, "SE(3)-Transformers" (2020)** —
  equivariant attention.
- **Batzner et al., "NequIP: E(3)-Equivariant Graph Neural Networks
  for Interatomic Potentials" (2022)** — state-of-the-art ML force
  fields.
- **Musaelian et al., "Allegro" (2023)** — local, scalable
  equivariant force fields.

## Part III: Clifford / GA networks

- ★ **Brandstetter, van den Berg, Welling, Gupta, "Clifford Neural
  Layers for PDE Modeling" (2022)** — the first major GA-native
  architecture.
- ★ **Ruhe, Brandstetter, Forré, "Clifford Group Equivariant Neural
  Networks" (2023)** — the rigorous equivariant formulation (GCAN).
- **Ruhe et al., "Geometric Clifford Algebra Networks" (2023)** — the
  companion architecture paper.
- **Zhou et al., "On the Continuity of Rotation Representations in
  Neural Networks" (2019)** — the 6D rotation representation;
  essential for the rotation-parameterization discussion.

## Part IV: representations / molecules

- **Liao & Smidt, "Equiformer" (2023)** and **Liao et al., "Equiformer
  V2" (2023)** — equivariant transformers for atomistic systems.
- **Schütt et al., "SchNet" (2017)** — the invariant-network baseline.
- **Gasteiger et al., "DimeNet" (2020)** — directional message
  passing.
- **Batatia et al., "MACE" (2022)** — higher body-order equivariant
  messages.
- **Deng et al., "Vector Neurons" (2021)** — rotation-equivariant
  point clouds.

## Part IV: graphs / hyperbolic

- **Nickel & Kiela, "Poincaré Embeddings for Learning Hierarchical
  Representations" (2017)** — hyperbolic embeddings.
- **Chami et al., "Hyperbolic Graph Convolutional Neural Networks"
  (2019)** — hyperbolic GNNs.
- **Sun et al., "RotatE" (2019)** — knowledge-graph embeddings as
  rotations.

## Part V: robotics

- ★ **Löw et al., "gafro: Geometric Algebra for Robotics"** — the
  library and its theory.
- **Dorst, Fontijne, Mann, "Geometric Algebra for Computer Science"
  (2007)** — the CGA-for-applications book (robotics, graphics).
- **Simeonov et al., "Neural Descriptor Fields: SE(3)-Equivariant
  Object Representations for Manipulation" (2022)** — equivariant
  manipulation.
- **Wang et al., "Equivariant $Q$-Learning in Spatial Action Spaces"
  and related** — equivariant manipulation RL.

## Part VI: frontiers / scale

- **Abramson et al., "AlphaFold 3" (2024)** — the relaxed-equivariance
  data point for the scaling debate.
- **Su et al., "RoFormer: Enhanced Transformer with Rotary Position
  Embedding" (2021)** — RoPE, the rotor-based positional encoding.

## Background: geometric algebra itself

- ★ **Doran & Lasenby, "Geometric Algebra for Physicists" (2003)** —
  the GA reference (see also the companion [physics-ga](/physics-ga)
  book on this site).
- **Hestenes, "New Foundations for Classical Mechanics" (1986)** — GA
  in classical mechanics.
- **Dorst, Fontijne, Mann (2007)** — the CS/CGA reference (listed
  above).
- The [Geometric Algebra study journal](/geometric-algebra) on this
  site — a from-scratch introduction.

## How to read this list

- **Just starting?** Bronstein et al. (manifesto) → Satorras et al.
  (EGNN) → Brandstetter et al. (Clifford layers). Three papers, the
  spine of the field.
- **Going into molecules?** Add NequIP, MACE, Equiformer.
- **Going into robotics?** Add gafro, Dorst-Fontijne-Mann, Neural
  Descriptor Fields.
- **Want the theory?** Ruhe et al. (Clifford Group Equivariant
  Networks) plus the GA references.
