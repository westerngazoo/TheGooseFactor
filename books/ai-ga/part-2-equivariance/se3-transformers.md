---
sidebar_position: 2
title: "SE(3)-Transformers (Fuchs et al., 2020)"
---

# SE(3)-Transformers

> *Fuchs, Worrall, Fischer & Welling, "SE(3)-Transformers," NeurIPS
> 2020.* Equivariant self-attention with full irrep features — the
> representation-theory-heavy end of the spectrum.

Where EGNN ([Chapter 4](/ai-ga/part-2-equivariance/egnn)) used only
scalars and vectors, the SE(3)-Transformer uses the **full ladder of
$SO(3)$ irreps** and an equivariant attention mechanism. It's more
expressive and more complex. Understanding it requires the
representation theory from [Chapter 3](/ai-ga/part-1-why/group-theory-in-30-minutes).

## 1. The architecture in one sentence

A graph attention network where the queries, keys, and values are
**equivariant features** (type-$\ell$ spherical tensors), and the
attention weights are **invariant scalars** computed from
type-0 components.

The result: self-attention that respects $SE(3)$ symmetry exactly.

## 2. Type-$\ell$ features

Each node carries features of multiple **types** $\ell = 0, 1, 2, \ldots$:

- Type-0: scalars (1-dimensional). Invariant.
- Type-1: vectors (3-dimensional). Rotate as 3-vectors.
- Type-2: rank-2 symmetric traceless tensors (5-dimensional).
- ...

A type-$\ell$ feature lives in a $(2\ell+1)$-dimensional space and
transforms by the **Wigner D-matrix** $D^\ell(g)$ under rotation $g$.

These are exactly the $SO(3)$ irreps from [Chapter 3](/ai-ga/part-1-why/group-theory-in-30-minutes).
The network maintains a "multi-type" feature at each node — a direct
sum of irreps.

## 3. Equivariant message passing with Clebsch-Gordan

To pass a message from node $j$ to node $i$, we combine:

- The sender's type-$\ell_{\rm in}$ feature.
- A **spherical harmonic** $Y^{\ell_f}(\hat{x}_{ij})$ of the relative
  direction — itself a type-$\ell_f$ object.

The product of a type-$\ell_{\rm in}$ feature and a type-$\ell_f$
harmonic decomposes via **Clebsch-Gordan** into types
$|\ell_{\rm in} - \ell_f|$ through $\ell_{\rm in} + \ell_f$. The
network selects which output type $\ell_{\rm out}$ to keep:

$$m_{ij}^{\ell_{\rm out}} = \sum_{\ell_f} W^{\ell_{\rm out}, \ell_{\rm in}, \ell_f}(\|x_{ij}\|)\; \big(Y^{\ell_f}(\hat{x}_{ij}) \otimes_{\rm cg} f_j^{\ell_{\rm in}}\big)^{\ell_{\rm out}}$$

where $\otimes_{\rm cg}$ is the Clebsch-Gordan product and the
weights $W$ are learnable **radial functions** of the distance.

This is the Tensor Field Network (Thomas et al. 2018) convolution,
which the SE(3)-Transformer extends with attention.

> :nerdygoose: The Clebsch-Gordan tensor product is the expensive
> part. For each pair of input/output types you need the CG
> coefficients, and the products scale poorly with maximum type
> $\ell_{\max}$. This is why most practical SE(3)-Transformers cap
> at $\ell_{\max} = 1$ or $2$ — the cost of higher types isn't worth
> it. We'll see in [Chapter 8](/ai-ga/part-3-clifford-networks/clifford-layers)
> that GA's geometric product does the CG decomposition implicitly,
> sidestepping the coefficient tabulation.

## 4. Equivariant attention

The attention mechanism:

$$\alpha_{ij} = \mathrm{softmax}_j\left(\frac{1}{\sqrt{d}}\, q_i^{(0)} \cdot k_{ij}^{(0)}\right)$$

The attention logits use **only the type-0 (scalar) parts** of the
query and key — so the attention weights $\alpha_{ij}$ are
**invariant**. Then the values (which carry all types) are combined:

$$f_i^{\ell} \leftarrow \sum_j \alpha_{ij}\, v_{ij}^{\ell}$$

Invariant weights times equivariant values = equivariant output.
Same trick as everywhere, applied to attention.

## 5. Why use the SE(3)-Transformer over EGNN?

The SE(3)-Transformer's advantage is **expressiveness**:

- It can represent **angular** and **orientational** dependencies
  that EGNN's radial bottleneck discards.
- Higher-type features capture finer geometric structure.
- Attention provides adaptive, input-dependent message weighting.

The cost is **complexity and compute**:

- Clebsch-Gordan products are expensive.
- The implementation is involved (irrep bookkeeping, CG
  coefficients).
- Training is slower.

The decision: use EGNN when distances suffice; use SE(3)-Transformer
(or a Clifford network) when you genuinely need angular/orientational
information.

> :surprisedgoose: There's a recurring pattern in this literature: a
> simple architecture (EGNN) captures most of the benefit, a complex
> one (SE(3)-Transformer) captures a bit more, and the complex one is
> 5–10× slower. For many tasks the simple one wins on a
> performance-per-FLOP basis. The GA-based middle ground —
> expressive like the complex one, efficient like the simple one —
> is the pitch of Part III.

## 6. Applications

The SE(3)-Transformer shines where orientation matters:

- **Protein structure**: residue orientations and backbone geometry.
- **Molecular dynamics**: directional force fields.
- **Point cloud processing**: where local frames matter.
- **3D object detection**: pose-aware features.

It was a key ingredient in several AlphaFold-era protein-ML
pipelines (though AlphaFold-2 itself uses a different, custom
equivariant mechanism — the "invariant point attention").

## 7. The connection to GA

The SE(3)-Transformer and GA networks are solving the same problem
with different bookkeeping:

| SE(3)-Transformer | GA / Clifford network |
|---|---|
| Type-$\ell$ irrep features | Multivector grades |
| Clebsch-Gordan product | Geometric product |
| Spherical harmonics $Y^\ell$ | Blades of relative position |
| Wigner D-matrices | Rotor sandwich $R(\cdot)\tilde{R}$ |
| CG coefficient tables | Built into the product |

The irrep approach is more **fine-grained** (you can select exactly
which types to keep). The GA approach is more **uniform** (one
product handles everything). [Chapter 11](/ai-ga/part-3-clifford-networks/equivariance-proofs-for-ga-layers)
works out the precise correspondence — they're two coordinate
systems for the same underlying representation theory.

> :weightliftinggoose: If EGNN is the bodyweight squat, the
> SE(3)-Transformer is the full competition back squat with chains
> and bands — maximally expressive, technically demanding, and only
> worth the setup when you need the carryover. Most training days,
> something in between is the right call.

## What we covered

- SE(3)-Transformer: equivariant attention with full irrep features.
- Type-$\ell$ features transform by Wigner D-matrices.
- Messages combine features with spherical harmonics via
  Clebsch-Gordan.
- Attention weights use invariant type-0 parts; values carry all
  types.
- More expressive than EGNN (captures angular/orientational info),
  more expensive (CG products).
- GA correspondence: grades ↔ types, geometric product ↔
  Clebsch-Gordan.

## What's next

[Chapter 6](/ai-ga/part-2-equivariance/equivariant-attention-with-rotors) —
equivariant attention with rotors. How to build the attention
mechanism using GA rotors instead of Wigner matrices, getting
equivariance without the CG-coefficient overhead.
