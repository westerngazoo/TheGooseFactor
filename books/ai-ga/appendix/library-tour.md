---
sidebar_position: 2
title: "Appendix B — Library Tour"
---

# Appendix B — Library Tour

The software ecosystem for GA / equivariant ML, with honest notes on
maturity. The field's tooling is uneven — some mature, some
alpha-quality.

## Equivariant ML (irrep-based)

### e3nn (Python / PyTorch) — ★ the standard

The reference library for irrep-based equivariant networks. Implements
$O(3)$/$SO(3)$ irreps, the Clebsch-Gordan tensor product, spherical
harmonics, and the building blocks for Tensor Field Networks,
SE(3)-Transformers, NequIP, and Equiformer.

- **Maturity**: high. Well-tested, actively maintained, used in
  production molecular-ML pipelines.
- **Learning curve**: steep. The irrep abstractions take time.
- **Use it for**: anything irrep-based, especially molecular ML.

### PyTorch Geometric (PyG) — ★ the GNN backbone

General graph-neural-network infrastructure: message passing,
batching (disjoint union), scatter operations. Not equivariant by
itself, but the foundation most equivariant GNNs build on (EGNN,
etc.).

- **Maturity**: high.
- **Use it for**: the graph plumbing under any equivariant GNN.

## GA / Clifford (the GA-native side)

### clifford (Python) — the GA workhorse

A pure-Python geometric-algebra library. Create algebras of any
signature, compute geometric products, work with multivectors and
blades.

- **Maturity**: moderate. Solid for prototyping and research, not
  optimized for large-scale training.
- **Use it for**: understanding GA, prototyping, non-performance-
  critical computation.

### Clifford neural layers (Brandstetter group)

The CUDA kernels and PyTorch modules accompanying the Clifford-layers
papers ([Chapter 8](/ai-ga/part-3-clifford-networks/clifford-layers)).
Efficient geometric-product layers for PDE modeling.

- **Maturity**: research-grade. Tied to the papers; expect to read
  the code.
- **Use it for**: reproducing/extending the Clifford-layer results.

### Clifford Group Equivariant NNs (Ruhe et al.)

The reference implementation for GCAN
([Chapter 9](/ai-ga/part-3-clifford-networks/gcan)). Grade-wise linear
maps, geometric-product layers, the equivariant architecture.

- **Maturity**: research-grade.
- **Use it for**: the equivariant GA architecture from the paper.

## Robotics GA

### gafro (C++) — ★ the robotics library

Production-quality conformal GA for robotics
([Chapter 19](/ai-ga/part-5-robotics/the-gafro-library)). Motors,
blades, robot kinematics, IK, dynamics.

- **Maturity**: good (for robotics use). C++, Eigen-based,
  performance-oriented.
- **Learning curve**: moderate (CGA + C++).
- **Use it for**: GA-based robot kinematics, planning, and the
  geometric primitives.

## Visualization / interactive

### ganja.js (JavaScript) — the interactive playground

Browser-based GA with beautiful visualization. Algebras of any
signature, interactive multivector rendering.

- **Maturity**: good for its purpose (visualization, teaching).
- **Use it for**: building geometric intuition, demos, teaching.

### Gaalop (compiler)

Compiles GA expressions into optimized executable code (C, CUDA,
etc.). Bridges high-level GA to efficient implementations.

- **Maturity**: established but niche.
- **Use it for**: generating fast GA code from symbolic expressions.

## The honest assessment

The tooling situation by sub-area:

| Area | Tooling | Maturity |
|---|---|---|
| Irrep equivariant ML | e3nn + PyG | High — production-ready |
| GA-native ML | clifford, Clifford-layer code | Moderate — research-grade |
| Robotics GA | gafro | Good — production for robotics |
| Visualization | ganja.js | Good — for its purpose |
| GA → fast code | Gaalop | Established, niche |

The gap: there's **no mature, standard, well-documented GA-ML library**
the way e3nn serves irrep methods. Building one is an open
opportunity ([Chapter 22](/ai-ga/part-6-frontiers/open-problems-and-workshops)).

## Practical recommendations

- **Doing irrep-based molecular ML?** e3nn. It's mature and standard.
- **Exploring GA-native architectures?** clifford for prototyping, the
  Brandstetter/Ruhe code for the published methods. Expect to write
  some yourself.
- **Robotics?** gafro for the geometric machinery.
- **Learning / building intuition?** ganja.js and the `clifford`
  Python library.
- **Need it fast and custom?** Implement the handful of GA operations
  (geometric product, grade projection, exp/log) directly in your
  autodiff framework — it's not much code, and you control the
  performance.
