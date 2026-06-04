---
sidebar_position: 4
title: "Equivariant Message Passing — Implementation Patterns"
---

# Equivariant Message Passing — Implementation Patterns

> The practical nuts and bolts. Data structures, batching,
> normalization, and the pitfalls that silently break equivariance.

The theory of equivariant networks ([Chapters 4–6](/ai-ga/part-2-equivariance/egnn))
is clean. The implementation has sharp edges. This chapter is the
field guide: the patterns that work, the operations that secretly
break equivariance, and how to test that your network is actually
equivariant.

## 1. The message-passing skeleton

All the architectures share a structure:

```
for each layer:
    # 1. Compute messages on edges
    m_ij = message_fn(node_i, node_j, edge_ij)
    # 2. Aggregate messages at nodes
    agg_i = aggregate(m_ij for j in neighbors(i))
    # 3. Update node states
    node_i = update_fn(node_i, agg_i)
```

The equivariance constraint touches each step:

- `message_fn` must produce features that transform correctly.
- `aggregate` must be a **permutation-invariant** reduction (sum,
  mean, max over a symmetric set) that preserves the geometric type.
- `update_fn` must be grade/type-preserving on geometric features.

## 2. Separating invariant and equivariant channels

The cardinal rule: **track which features are invariant and which
are equivariant, and never mix them illegally.**

A clean data structure carries two kinds of node state:

- `h_i`: invariant features (scalars). Can go through any MLP,
  any nonlinearity, batch norm, etc.
- `v_i`: equivariant features (vectors/multivectors). Can only go
  through **equivariant** operations.

Operations on equivariant features are restricted:

| Operation | Equivariant-safe? |
|---|---|
| Add two equivariant features | ✅ |
| Scale by an invariant scalar | ✅ |
| Linear combination with invariant weights | ✅ |
| Geometric product of two equivariant features | ✅ (changes grade) |
| Norm $\|v\|$ → invariant scalar | ✅ |
| Arbitrary MLP on components | ❌ breaks equivariance |
| Element-wise nonlinearity (ReLU) on components | ❌ |
| Batch norm on components | ❌ |

The forbidden operations all treat the components as independent
numbers, which destroys the geometric structure.

> :surprisedgoose: The single most common bug: applying a ReLU or
> LayerNorm directly to vector/multivector components. It looks
> harmless — it's just a nonlinearity — but it breaks equivariance
> silently. The network trains, the loss goes down, and it fails on
> rotated test inputs. Always test equivariance explicitly (§6).

## 3. Equivariant nonlinearities

Since you can't apply ReLU to equivariant components, how do you get
nonlinearity into the equivariant pathway? Three standard tricks:

**1. Gated nonlinearities.** Scale the equivariant feature by a
nonlinear function of its invariant norm:

$$v_i \leftarrow v_i \cdot \sigma(\|v_i\|)$$

where $\sigma$ is any nonlinearity. The norm is invariant, so
$\sigma(\|v_i\|)$ is an invariant scalar, so the product is
equivariant.

**2. Norm-based features.** Extract invariant scalars (norms, inner
products) from equivariant features, process them with full MLPs,
and route them back as gates.

**3. Grade-mixing products.** In GA, the geometric product of two
equivariant multivectors produces another equivariant multivector
of mixed grade — a genuinely nonlinear (bilinear) operation that
preserves equivariance. This is the source of nonlinearity in
Clifford networks ([Chapter 8](/ai-ga/part-3-clifford-networks/clifford-layers)).

## 4. Aggregation

The aggregation over neighbors must be **permutation-invariant**
(node ordering shouldn't matter) AND preserve the geometric type:

- **Sum / mean**: equivariant-safe. The sum of equivariant vectors
  is an equivariant vector.
- **Max**: ❌ for equivariant features (component-wise max isn't
  equivariant). Fine for invariant features.
- **Attention-weighted sum**: equivariant-safe if weights are
  invariant ([Chapter 6](/ai-ga/part-2-equivariance/equivariant-attention-with-rotors)).

Mean is usually preferred over sum for stability on
variable-degree graphs.

## 5. Batching and data structures

Graphs have variable size, so batching uses the standard GNN trick:

- **Disjoint union**: concatenate all graphs in a batch into one big
  graph with block-diagonal connectivity. PyTorch Geometric's
  `Batch` does this.
- **Edge index**: store edges as a $2 \times |E|$ index tensor;
  messages are computed by gathering source/target node features.
- **Scatter-reduce**: aggregate messages with `scatter_add` /
  `scatter_mean` indexed by target node.

Equivariant features add one dimension: a vector feature is
`[num_nodes, channels, 3]` instead of `[num_nodes, channels]`. The
geometric dimension (3 for vectors, 8 for 3D multivectors) is kept
separate from the channel dimension so equivariant operations act on
it correctly.

## 6. Testing equivariance

**Always** test equivariance numerically. The test:

```python
def test_equivariance(model, x, R):
    # R is a random rotation matrix
    y1 = model(x)              # forward, then rotate output
    y1_rot = apply_rotation(y1, R)
    y2 = model(apply_rotation(x, R))   # rotate input, then forward
    assert allclose(y1_rot, y2, atol=1e-5)
```

For an equivariant model, rotating the input then running the model
equals running the model then rotating the output. If this fails,
some operation in the network broke equivariance — usually a
nonlinearity or normalization on geometric features.

Run this test on a random rotation (and reflection, for $O(3)$
equivariance) before trusting any equivariant architecture.

> :nerdygoose: The equivariance test is your unit test, your
> integration test, and your sanity check rolled into one. Make it
> the first thing you write. A model that passes the equivariance
> test but trains poorly has a learning problem; a model that fails
> it has a correctness bug. Distinguishing the two without the test
> is misery.

## 7. Numerical stability

Equivariant networks have stability quirks:

- **Coordinate scale**: large coordinate magnitudes make position
  updates unstable. Center and normalize (centering is
  translation-equivariant; uniform scaling needs care).
- **Norm blow-up**: repeated geometric products can grow feature
  norms. Use equivariant normalization (divide by the invariant
  norm) between layers.
- **Degenerate geometry**: when two points coincide, $\hat{x}_{ij}$
  is undefined. Add a small epsilon or mask self-edges.

## 8. The PyTorch ecosystem

Practical tooling:

- **e3nn** (Geiger et al.): the reference library for irrep-based
  equivariant networks (TFN, SE(3)-Transformer). Mature, well-tested,
  steep learning curve.
- **PyTorch Geometric**: general GNN infrastructure (batching,
  message passing) that equivariant networks build on.
- **Clifford libraries**: `clifford` (Python), the Brandstetter
  group's CUDA kernels for Clifford layers. Newer, less mature.

For irrep-heavy work, use e3nn. For GA/Clifford work, expect to
write more yourself.

> :weightliftinggoose: Implementation is where equivariant ML
> separates the people who understand it from the people who read
> about it. The theory fits on a page; the working code has a dozen
> places to break equivariance silently. Write the equivariance test
> first, separate invariant from equivariant channels religiously,
> and never ReLU a vector.

## What we covered

- The message-passing skeleton: message → aggregate → update, with
  equivariance constraints on each.
- Separate invariant (scalar) from equivariant (vector/multivector)
  channels; never mix illegally.
- Forbidden ops on equivariant features: component-wise
  nonlinearities, batch norm, max.
- Equivariant nonlinearities: gated (scale by norm function),
  grade-mixing products.
- Permutation-invariant, type-preserving aggregation (sum/mean, not
  max).
- Batching via disjoint union + scatter-reduce.
- **Always test equivariance numerically.**
- Stability: centering, norm normalization, degenerate-geometry
  masking.

## What's next

That closes Part II. [Part III](/ai-ga/part-3-clifford-networks/clifford-layers)
goes deeper into the GA-native architectures — Clifford layers and
Geometric Clifford Algebra Networks — where multivectors are the
fundamental feature type and the geometric product is the core
operation.
