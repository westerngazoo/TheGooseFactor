---
sidebar_position: 2
title: "Equiformer — Equivariant Transformer for Atomistic Systems (Liao & Smidt, 2022)"
---

# Equiformer

> *Liao & Smidt, "Equiformer: Equivariant Graph Attention Transformer
> for 3D Atomistic Graphs," ICLR 2023.* The transformer architecture,
> made equivariant, applied to molecules.

The transformer conquered language and vision. Equiformer brings it
to 3D atomistic systems by making every component — attention,
feed-forward, normalization — equivariant. It's the convergence of
the transformer template with the equivariance machinery of
[Part II](/ai-ga/part-2-equivariance/se3-transformers).

## 1. The Equiformer recipe

Take a standard transformer block:

```
x = x + Attention(LayerNorm(x))
x = x + FeedForward(LayerNorm(x))
```

Make every operation equivariant:

- **Features**: irrep tensors (type-0, type-1, type-2, ...) — or
  equivalently multivectors.
- **Attention**: equivariant graph attention (invariant scores,
  equivariant values, [Chapter 6](/ai-ga/part-2-equivariance/equivariant-attention-with-rotors)).
- **LayerNorm**: equivariant normalization (normalize within each
  irrep type by its norm, not across components).
- **FeedForward**: gated equivariant nonlinearities + grade/type-wise
  linear maps.

The result is a transformer that respects $SE(3)$ symmetry exactly.

## 2. Equivariant graph attention

Equiformer's attention operates on a molecular graph (atoms = nodes,
bonds/proximity = edges). For each node, it attends to its neighbors:

- **Query/key**: built from the type-0 (invariant) parts of node
  features and the relative-distance encoding → invariant attention
  scores.
- **Value**: the full multi-type features → equivariant.
- **Edge encoding**: relative positions encoded via spherical
  harmonics (irrep version) or relative-position multivectors (GA
  version).

This is the [Chapter 6](/ai-ga/part-2-equivariance/equivariant-attention-with-rotors)
construction with the transformer's multi-head structure and the
molecular graph's connectivity.

## 3. Depth-wise tensor products

Equiformer's distinctive component is the **depth-wise tensor
product** (DTP): a Clebsch-Gordan tensor product between node
features and edge spherical harmonics, done channel-wise for
efficiency.

In GA terms, this is a **channel-wise geometric product** between the
node multivector and the relative-position multivector. It injects
directional information (the edge geometry) into the node features
while preserving equivariance — the same role the geometric value
transport played in [Chapter 6](/ai-ga/part-2-equivariance/equivariant-attention-with-rotors).

The "depth-wise" qualifier means it's done per-channel (like
depth-wise convolution), avoiding the full cost of all-pairs
Clebsch-Gordan.

## 4. Equivariant LayerNorm

Standard LayerNorm normalizes across feature dimensions — which
breaks equivariance (it mixes geometric components). Equiformer uses
**equivariant LayerNorm**: normalize each irrep type (or grade) by
its own norm:

$$\hat{x}^{(\ell)} = \frac{x^{(\ell)}}{\|x^{(\ell)}\|}\,\gamma^{(\ell)}$$

with $\gamma^{(\ell)}$ a learnable per-type scale. The norm
$\|x^{(\ell)}\|$ is invariant, so dividing by it preserves
equivariance. This is the normalization analog of the
[Chapter 7](/ai-ga/part-2-equivariance/equivariant-message-passing)
"never batch-norm a vector" rule, done right.

## 5. Why a transformer for molecules?

Message-passing GNNs (EGNN, PaiNN) have a limited **receptive field**
— information propagates one hop per layer, so capturing long-range
interactions needs many layers (and risks over-smoothing).

Attention gives **global receptive field** in one layer: every atom
can attend to every other (or to a large neighborhood). For molecules
where long-range electrostatics or conjugation matters, this is an
advantage. Equiformer combines the transformer's global view with the
equivariance that molecular ML requires.

> :nerdygoose: The receptive-field argument is the same reason
> transformers beat RNNs in NLP — global context in one step vs
> sequential propagation. For large molecules and materials with
> long-range interactions, equivariant transformers like Equiformer
> capture physics that local message-passing misses. The cost is the
> $O(N^2)$ attention, mitigated by neighborhood cutoffs.

## 6. Results and Equiformer V2

Equiformer set strong results on QM9, MD17, and OC20 (the Open
Catalyst dataset — predicting catalyst properties for renewable
energy). **Equiformer V2** (Liao et al. 2023) scaled it up with
higher-degree irreps and architectural refinements, topping the OC20
leaderboard at the time.

The trajectory shows the field maturing: equivariant transformers are
now competitive with or beating message-passing methods on the
largest molecular benchmarks, at the cost of more compute.

## 7. The GA perspective on Equiformer

Equiformer is built on irreps (via e3nn), not GA. But the GA reading
clarifies what it's doing:

| Equiformer (irreps) | GA reading |
|---|---|
| Type-$\ell$ features | Multivector grades |
| Depth-wise tensor product | Channel-wise geometric product |
| Equivariant LayerNorm | Grade-wise norm normalization |
| Spherical harmonic edge encoding | Relative-position multivector |
| Clebsch-Gordan in attention | Geometric product in attention |

A GA-native Equiformer would replace the irrep bookkeeping with
multivector arithmetic, potentially simplifying the implementation.
Whether it would match Equiformer's accuracy at the high irrep
degrees Equiformer V2 uses is an open question — recall GA's native
grades cover low types, and Equiformer V2's edge comes partly from
high-degree features.

## 8. When to use Equiformer

The decision:

- **Large molecules/materials, long-range interactions, ample
  compute**: Equiformer / Equiformer V2. Global receptive field,
  top accuracy.
- **Small molecules, limited compute, energies/forces**: PaiNN,
  NequIP, or a GA/Clifford network. Faster, often sufficient.
- **Need maximal accuracy on OC20-scale benchmarks**: Equiformer V2
  or successors.

Equiformer represents the "scale and irreps" wing of the field; the
GA approach is the "efficiency and uniformity" wing. Both are
active; the right choice is task-dependent.

> :weightliftinggoose: Equiformer is the powerlifting meet of
> molecular ML — maximal performance, maximal setup, irreps cranked
> to high degree. The GA approach is the calisthenics: leaner, more
> elegant, competitive at moderate scale. For the leaderboard,
> Equiformer; for understanding and efficiency, GA. The field needs
> both.

## What we covered

- Equiformer = transformer with every component made equivariant.
- Equivariant graph attention (invariant scores, equivariant values).
- Depth-wise tensor product = channel-wise geometric product
  injecting edge geometry.
- Equivariant LayerNorm: normalize per irrep type by its norm.
- Transformers give global receptive field — good for long-range
  molecular interactions.
- Equiformer V2 scaled to top OC20.
- GA reading: irreps ↔ grades, tensor product ↔ geometric product.
- Trade-off: Equiformer (scale + irreps) vs GA (efficiency +
  uniformity).

## What's next

[Chapter 14](/ai-ga/part-4-representations/point-cloud-architectures) —
point cloud architectures with GA. Processing raw 3D point clouds
(LIDAR, depth sensors, 3D scans) with equivariant multivector
networks.
