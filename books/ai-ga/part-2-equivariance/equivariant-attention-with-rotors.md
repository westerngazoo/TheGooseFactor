---
sidebar_position: 3
title: "Equivariant Attention With Rotors"
---

# Equivariant Attention With Rotors

> Building the attention mechanism on GA rotors instead of Wigner
> D-matrices. Equivariance without Clebsch-Gordan coefficient tables.

The SE(3)-Transformer ([Chapter 5](/ai-ga/part-2-equivariance/se3-transformers))
achieves equivariant attention through irreps and Clebsch-Gordan
products. This chapter shows the GA alternative: represent features
as multivectors, transform them with rotors, and let the geometric
product do the representation-theory bookkeeping.

## 1. The core idea

In standard attention, a query $q$, key $k$, and value $v$ are
vectors, and attention is $\mathrm{softmax}(q\cdot k)\,v$. To make
this equivariant, we need:

1. The query-key score $q\cdot k$ to be **invariant**.
2. The value aggregation to be **equivariant**.

GA gives both naturally. If $q$ and $k$ are multivectors that
transform by the rotor sandwich, then the **scalar part** of
$q\tilde{k}$ is invariant:

$$\langle q\,\tilde{k}\rangle_0 \quad\text{is invariant under}\quad q \to RqR^{-1}, \; k \to RkR^{-1}$$

because $\langle (RqR^{-1})(RkR^{-1})^\sim\rangle_0 = \langle Rq\tilde{k}R^{-1}\rangle_0 = \langle q\tilde{k}\rangle_0$
(the sandwich preserves the scalar part). So GA scores are
automatically invariant.

## 2. Multivector queries, keys, values

Represent each node's feature as a multivector $\psi_i \in \mathcal{Cl}(3,0)$
(8 real components: 1 scalar + 3 vector + 3 bivector + 1
pseudoscalar). Project to queries, keys, values by **grade-preserving
linear maps** (maps that act independently on each grade, so they
commute with the rotor action):

$$q_i = W_q\,\psi_i, \quad k_i = W_k\,\psi_i, \quad v_i = W_v\,\psi_i$$

where $W_q, W_k, W_v$ are block-diagonal across grades (a separate
learnable scalar per grade, or more general grade-mixing that
preserves equivariance — see [Chapter 8](/ai-ga/part-3-clifford-networks/clifford-layers)).

## 3. The attention score

The invariant attention logit:

$$s_{ij} = \langle q_i\,\tilde{k}_j\rangle_0 + \beta\,g(\|x_i - x_j\|)$$

The first term is the multivector inner product (invariant); the
second is an optional learnable radial bias on the distance (also
invariant). Softmax over $j$:

$$\alpha_{ij} = \frac{\exp(s_{ij}/\sqrt{d})}{\sum_{j'}\exp(s_{ij'}/\sqrt{d})}$$

The weights $\alpha_{ij}$ are invariant scalars.

## 4. Equivariant value aggregation

Aggregate the multivector values weighted by the invariant
attention:

$$\psi_i \leftarrow \sum_j \alpha_{ij}\, v_j$$

An invariant scalar times an equivariant multivector is equivariant.
The whole aggregation transforms correctly under rotation. Done — no
Wigner matrices, no CG coefficients.

> :happygoose: The entire equivariant-attention mechanism reduces to:
> "scores from the scalar part of $q\tilde{k}$ (invariant), values
> aggregated with invariant weights (equivariant)." The rotor
> sandwich guarantees both. This is the same content as the
> SE(3)-Transformer, but the geometric product replaces the explicit
> irrep machinery.

## 5. Geometric value transport

A subtlety: in the SE(3)-Transformer, messages incorporate the
**relative direction** $\hat{x}_{ij}$ via spherical harmonics. The
GA analog uses the **relative-position multivector** directly.

The cleanest GA construction transports the value through the
relative geometry:

$$v_{ij} = T_{ij}\, v_j\, \tilde{T}_{ij}$$

where $T_{ij}$ is a rotor built from the relative position $x_i - x_j$
(e.g., the rotor that aligns a reference axis with $\hat{x}_{ij}$).
This injects directional information into the message while
preserving equivariance — the sandwich keeps everything covariant.

This recovers the angular sensitivity that EGNN lacks
([Chapter 4 §6](/ai-ga/part-2-equivariance/egnn)) without the
CG-coefficient cost of the SE(3)-Transformer.

## 6. Multi-head GA attention

Multi-head attention generalizes naturally. Each head has its own
grade-preserving projections $W_q^{(h)}, W_k^{(h)}, W_v^{(h)}$, and
the head outputs (all equivariant multivectors) are combined by a
final grade-preserving linear map:

$$\psi_i \leftarrow W_o\,\mathrm{concat}_h\Big(\sum_j \alpha_{ij}^{(h)} v_j^{(h)}\Big)$$

The concatenation is over heads (a direct sum), and $W_o$ must be
grade-preserving to maintain equivariance. Standard transformer
plumbing, with the equivariance constraint on the linear maps.

## 7. Cost comparison

The GA attention's appeal is **efficiency**:

| Operation | SE(3)-Transformer | GA attention |
|---|---|---|
| Feature size | $\sum_\ell (2\ell+1)$ channels | $2^n$ multivector components |
| Message product | Clebsch-Gordan ($O(\ell_{\max}^6)$ coeffs) | Geometric product ($O(2^n)$ per pair, fixed) |
| Coefficient storage | CG tables | none (product is hardcoded) |
| Implementation | irrep bookkeeping | multivector arithmetic |

For 3D ($n = 3$), the multivector has 8 components and the geometric
product is a fixed $8\times8\times8$ bilinear operation. No
type-dependent coefficient tables; the cost is constant per pair.

> :nerdygoose: The catch: GA's 8-component multivector in 3D
> corresponds to types 0, 1 (vector), 1 (bivector dual), and 0
> (pseudoscalar, a pseudo-scalar). It doesn't natively include type-2
> (the 5-dim irrep). For tasks needing type-2+ features, you either
> go to higher-dimensional GA or combine GA with explicit irreps.
> GA is most efficient when types 0 and 1 suffice — which covers a
> large fraction of practical problems.

## 8. Practical status

Rotor-based equivariant attention is an active research area rather
than a settled, off-the-shelf architecture:

- **Clifford Group Equivariant Neural Networks** (Ruhe et al. 2023,
  [Chapter 9](/ai-ga/part-3-clifford-networks/gcan)) formalize the
  grade-preserving-linear-map structure.
- Several 2023–2024 papers explore GA attention for molecules and
  point clouds.
- Libraries are alpha-quality; expect to implement the geometric
  product and grade projections yourself.

This is the frontier where the GA pitch (efficient + expressive) is
being tested. The early results are promising but the field hasn't
converged on a canonical design.

> :weightliftinggoose: This is the "fix your technique and the weight
> moves itself" chapter. The rotor sandwich does the equivariance
> bookkeeping that the irrep approach does by hand. Whether it wins
> in practice depends on your task's irrep requirements — but when it
> fits, it's both cleaner and faster.

## What we covered

- Equivariant attention from GA: invariant scores from $\langle q\tilde{k}\rangle_0$,
  equivariant aggregation with invariant weights.
- Multivector queries/keys/values via grade-preserving linear maps.
- Geometric value transport $v_{ij} = T_{ij}v_j\tilde{T}_{ij}$ for
  angular sensitivity.
- Multi-head generalization with grade-preserving output projection.
- Efficiency: the geometric product replaces CG coefficient tables.
- Caveat: native GA grades cover types 0 and 1; type-2+ needs
  extensions.

## What's next

[Chapter 7](/ai-ga/part-2-equivariance/equivariant-message-passing) —
equivariant message passing implementation patterns. The practical
nuts and bolts of building these networks: data structures,
batching, normalization, and the common pitfalls.
