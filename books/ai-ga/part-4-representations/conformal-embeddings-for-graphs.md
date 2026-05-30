---
sidebar_position: 4
title: "Conformal Embeddings for Graphs"
---

# Conformal Embeddings for Graphs

> Using conformal geometric algebra to embed graph structure, and the
> connection to hyperbolic graph embeddings.

Graphs without geometric coordinates — social networks, knowledge
graphs, citation networks — still benefit from geometric embedding.
The geometry you embed *into* shapes what structure you can capture.
This chapter connects conformal GA to the hyperbolic-embedding
literature.

## 1. The graph embedding problem

Given a graph (nodes + edges, no coordinates), find an embedding
$x_i \in M$ (some space $M$) such that graph structure is reflected
in geometric relationships: connected nodes are close, communities
cluster, hierarchy is preserved.

The choice of $M$ matters enormously:

- **Euclidean** $\mathbb{R}^d$: the default. Limited for hierarchical
  / tree-like graphs (trees have exponentially many nodes at distance
  $r$, but Euclidean space has only polynomially much room).
- **Hyperbolic** $\mathbb{H}^d$: exponential volume growth matches
  tree structure. Great for hierarchies (Nickel & Kiela 2017,
  "Poincaré embeddings").
- **Spherical** $S^d$: good for cyclic structure.
- **Mixed / product** spaces: combine the above.

## 2. The conformal model unifies these geometries

Here's the GA connection: **conformal geometric algebra**
([physics-ga Ch 32](/geometric-algebra)) provides a single algebraic
framework that contains Euclidean, hyperbolic, and spherical geometry
as special cases.

In the conformal model, points are null vectors in a
higher-dimensional space $\mathcal{Cl}(p+1, q+1)$, and the **inner
product of two embedded points** encodes their distance — but the
*type* of distance (Euclidean, hyperbolic, spherical) depends on the
signature and the choice of "point at infinity."

So conformal GA gives a unified language: choose the conformal setup
and you get the geometry you want, with distances, geodesics, and
isometries all as algebraic operations.

> :nerdygoose: This is why CGA is interesting for graph embedding:
> instead of committing to "Euclidean" or "hyperbolic" upfront, you
> work in the conformal algebra where the geometry is a parameter.
> The same embedding machinery handles all curvatures. Whether this
> flexibility beats committing to hyperbolic-from-the-start is an
> open empirical question, but the unification is elegant.

## 3. Distances as inner products

In the conformal model, the embedded points are null vectors $X_i$,
and (as in [physics-ga Ch 32](/geometric-algebra)):

$$X_i \cdot X_j = -\tfrac{1}{2}d(x_i, x_j)^2$$

where $d$ is the distance in the base geometry. So the **inner
product directly gives the squared distance** — a clean,
differentiable quantity for a loss function.

For graph embedding, the loss pushes connected nodes to have small
$d$ (large inner product) and disconnected nodes to have large $d$.
The conformal inner product makes this an algebraic operation,
differentiable for gradient descent.

## 4. Hyperbolic graph neural networks

The hyperbolic-embedding line (Poincaré embeddings, hyperbolic GNNs)
exploits negative curvature for hierarchical data. Hyperbolic GNNs
(Chami et al. 2019, "Hyperbolic Graph Convolutional Networks")
perform message passing in hyperbolic space.

The operations — Möbius addition, exponential/logarithmic maps
between the tangent space and the manifold — are exactly the
**conformal transformations** that CGA realizes as rotors. So a
hyperbolic GNN is, structurally, a CGA network operating in the
hyperbolic conformal model.

The GA framing clarifies the otherwise-mysterious "Möbius operations"
of hyperbolic deep learning: they're conformal rotors, and the
exp/log maps are the Lie-algebra ↔ Lie-group correspondence
([Chapter 3](/ai-ga/part-1-why/group-theory-in-30-minutes)) in the
conformal group.

## 5. Isometry-equivariance for embeddings

A good graph embedding should be **equivariant to the isometries** of
the embedding space: if you rotate/translate/Möbius-transform the
whole embedding, the graph structure (which is what matters) is
unchanged. The embedding is only defined up to these isometries.

In CGA, the isometry group is the **conformal group**, realized as
rotors. So an embedding network that processes conformal points with
rotor-equivariant operations respects exactly the right symmetry —
the embedding's gauge freedom is the conformal group, and the network
shouldn't depend on the gauge.

This is the [Part III](/ai-ga/part-3-clifford-networks/gcan)
equivariance principle, applied to abstract (non-spatial) embeddings:
equivariance to the embedding space's isometry group.

## 6. Knowledge graph embeddings

Knowledge graphs (entities + typed relations, like "Paris —
capital-of — France") are embedded so that relations correspond to
geometric transformations. Classic methods:

- **TransE**: relations as translations ($h + r \approx t$).
- **RotatE**: relations as rotations in complex space.
- **Conformal / GA approaches**: relations as **rotors** (rotations,
  translations, and dilations unified).

The GA view: a relation is a **motor** (conformal rotor), and the
embedding satisfies $X_t \approx M_r\,X_h\,\tilde{M}_r$ — the tail
entity is the head transformed by the relation's motor. This
generalizes TransE (translation motors) and RotatE (rotation motors)
into one framework.

> :surprisedgoose: TransE and RotatE — two of the most cited
> knowledge-graph embedding methods — are special cases of "relations
> as conformal rotors." TransE uses translation rotors, RotatE uses
> rotation rotors. CGA's full motor group includes both plus
> dilations and inversions. The GA framing reveals them as points on
> a spectrum, not separate inventions.

## 7. The practical caveats

Conformal/hyperbolic embedding is powerful but finicky:

- **Numerical stability**: hyperbolic space has coordinates that blow
  up near the boundary; careful clamping and stable exp/log
  implementations are needed.
- **Optimization**: Riemannian gradient descent (respecting the
  manifold) often beats naive Euclidean gradient descent on the
  coordinates.
- **When it helps**: strongly hierarchical / tree-like graphs.
  For homophilous, non-hierarchical graphs, Euclidean embeddings are
  often just as good and simpler.

The conformal-GA framing is conceptually unifying but doesn't
automatically improve results — it's a lens, and the practical
gains come from matching the geometry to the data's structure.

## 8. Where this is going

Conformal/GA graph embedding is a smaller, more speculative corner of
the field than molecular ML or point clouds. The activity:

- Hyperbolic deep learning is established (NeurIPS/ICML papers
  yearly).
- Explicit CGA framings are emerging but not mainstream.
- The unification (Euclidean/hyperbolic/spherical/knowledge-graph as
  conformal special cases) is appealing but the practical payoff over
  committing to one geometry is still being established.

> :weightliftinggoose: This chapter is the most speculative of Part
> IV — conformal GA as a unifying lens for graph embeddings is
> elegant but not yet a dominant practical approach. File it under
> "promising direction": the hyperbolic-embedding results are real,
> the GA reframing clarifies them, and whether explicit CGA networks
> beat purpose-built hyperbolic GNNs is an open question worth
> watching.

## What we covered

- Graph embedding: place nodes in a space so structure = geometry.
- Geometry choice matters: Euclidean (default), hyperbolic
  (hierarchies), spherical (cycles).
- Conformal GA unifies these — geometry as a parameter (signature +
  point at infinity).
- Distances as conformal inner products $X_i\cdot X_j = -\tfrac12 d^2$.
- Hyperbolic GNNs = CGA networks in the hyperbolic model; Möbius ops
  = conformal rotors.
- Isometry-equivariance = conformal-group equivariance.
- Knowledge-graph relations as motors (unifying TransE, RotatE).
- Speculative but elegant; practical payoff still being established.

## What's next

That closes Part IV. [Part V](/ai-ga/part-5-robotics/why-ga-for-robotics)
turns to robotics and control — the application domain where GA's
screw-motor representation of rigid motion is most directly useful.
