---
sidebar_position: 1
title: "Clifford Layers — The Universal Building Block (Brandstetter et al., 2022)"
---

# Clifford Layers

> *Brandstetter, van den Berg, Welling & Gupta, "Clifford Neural
> Layers for PDE Modeling," NeurIPS 2022.* The first major
> GA-native architecture. Multivectors as features, the geometric
> product as the core operation.

This is the chapter the whole book has been building toward. Clifford
layers make **multivectors the fundamental feature type** and the
**geometric product the fundamental operation**. Everything from
Part I — grades, the geometric product, the Clebsch-Gordan
connection — becomes a concrete neural-network layer.

## 1. Multivector features

A Clifford layer's features are multivectors of a Clifford algebra
$\mathcal{Cl}(p,q)$. For 2D ($\mathcal{Cl}(2,0)$), a multivector has
4 components:

$$m = \underbrace{m_0}_{\text{scalar}} + \underbrace{m_1 e_1 + m_2 e_2}_{\text{vector}} + \underbrace{m_{12} e_1 e_2}_{\text{bivector}}$$

For 3D ($\mathcal{Cl}(3,0)$), 8 components (1 + 3 + 3 + 1). The
network's hidden state at each spatial location is a collection of
$C$ such multivectors (the "channels").

Crucially, the multivector packs **different geometric types
together**: scalars (invariant quantities like pressure), vectors
(velocity, force), and bivectors (vorticity, angular quantities).
For a PDE like Navier-Stokes, this is natural — the physical state
*is* a mix of scalar and vector fields.

## 2. The Clifford linear layer

A standard linear layer multiplies feature vectors by a weight
matrix. A Clifford linear layer multiplies **multivector features by
multivector weights** using the geometric product:

$$\text{out}_c = \sum_{c'} w_{c c'} \cdot m_{c'}$$

where the product $w_{cc'} \cdot m_{c'}$ is the **geometric product**
of two multivectors, and the sum is over input channels $c'$.

Because the geometric product mixes grades (scalar × vector = vector,
vector × vector = scalar + bivector, etc.), a Clifford linear layer
**routes information between grades** in a geometrically-structured
way. A plain linear layer can't do this — it treats components as
independent.

> :happygoose: This is the payoff of [Chapter 3](/ai-ga/part-1-why/group-theory-in-30-minutes):
> the geometric product is a Clebsch-Gordan operation. A Clifford
> linear layer does CG decomposition between every pair of channels,
> for free, as a matrix multiply in the algebra. The
> SE(3)-Transformer tabulates CG coefficients; the Clifford layer
> bakes them into the geometric product.

## 3. Restricting to equivariant weights

A general Clifford linear layer (arbitrary multivector weights) is
**not** equivariant — it can mix grades in rotation-dependent ways.
To get equivariance, restrict the weights.

The **Clifford group equivariant** version ([Chapter 9](/ai-ga/part-3-clifford-networks/gcan))
uses weights that act **grade-wise**: a separate learnable scalar per
grade, optionally with grade-preserving mixing. This guarantees that
rotating the input rotates the output:

$$\text{If } m \to RmR^{-1}, \text{ then } \text{out} \to R\,\text{out}\,R^{-1}$$

The trade-off: full multivector weights are more expressive but not
equivariant; grade-wise weights are equivariant but less expressive.
The architecture choice depends on whether you need equivariance.

## 4. Clifford convolutions

For grid-structured data (images, PDE solutions on a mesh), Clifford
layers generalize **convolution**: the kernel weights are
multivectors, and the convolution sum uses the geometric product.

$$(\text{m} \star \text{w})_x = \sum_{\delta} w_\delta \cdot m_{x + \delta}$$

with $w_\delta$ a multivector kernel weight at offset $\delta$. This
is a **Clifford convolution** — it processes the multivector field
while respecting the algebra's grade structure.

For PDE modeling, this is the natural operation: the solution is a
multivector field (scalars + vectors), and the convolution evolves
it while keeping the geometric types consistent.

## 5. Why this helps PDEs

Brandstetter et al.'s motivating application is **PDE surrogate
modeling** — training a network to predict the time evolution of a
physical field (fluid flow, electromagnetism, weather).

The key insight: physical fields have **geometric structure**.
Velocity is a vector, pressure is a scalar, vorticity is a bivector.
A plain CNN treats all these as independent channels and has to
**learn** the geometric relationships from data. A Clifford network
has them **built in** — the geometric product knows that the curl of
a vector field is a bivector, that the divergence is a scalar.

The empirical result: Clifford networks need fewer parameters and
less data to model PDEs accurately, and they generalize better to
unseen conditions. The geometric structure is a strong, correct
inductive bias.

> :surprisedgoose: The Maxwell equation $\nabla F = J/\epsilon_0$
> from [physics-ga Ch 13](/geometric-algebra) is **literally a
> Clifford convolution** — the vector derivative $\nabla$ acting on
> the field multivector $F$. A Clifford network modeling
> electromagnetism is learning a parameterized version of the actual
> physics, expressed in the actual algebra of the problem. That's
> why it works so well.

## 6. The nonlinearity problem and its solution

As discussed in [Chapter 7](/ai-ga/part-2-equivariance/equivariant-message-passing),
you can't apply a plain nonlinearity to multivector components
without breaking equivariance. Clifford networks use:

- **Grade-wise gating**: scale each grade by a nonlinearity of its
  norm.
- **Multivector products**: the geometric product of two
  multivectors is bilinear (nonlinear in the combined input) and
  grade-mixing — a source of expressive nonlinearity.

Brandstetter et al. introduce specific "Clifford nonlinearities"
that act on the grade structure consistently.

## 7. Computational cost

The geometric product of two $\mathcal{Cl}(n,0)$ multivectors is a
bilinear map with $2^n \times 2^n \times 2^n$ structure (most entries
zero or ±1). For 3D, that's $8\times8\times8$ — a small, fixed,
sparse tensor contraction.

Compared to dense linear layers, Clifford layers have a fixed
geometric overhead but route information more efficiently (fewer
parameters needed for the same geometric expressiveness). The
Brandstetter group provides CUDA kernels that make this competitive
with standard convolutions.

## 8. What Clifford layers are and aren't

**Are:**

- A geometrically-structured generalization of linear/conv layers.
- A natural fit for physical fields with mixed scalar/vector/tensor
  structure.
- A way to get Clebsch-Gordan decomposition without coefficient
  tables.

**Aren't:**

- Automatically equivariant (need weight restrictions).
- A universal replacement for all layers (they help when the data
  has geometric structure).
- Free (the geometric product has overhead, mitigated by good
  kernels).

> :weightliftinggoose: Clifford layers are the compound lift of
> GA-ML: one operation (the geometric product) that does many things
> at once — grade routing, Clebsch-Gordan, geometric inductive bias.
> Like a deadlift, it's not the answer to everything, but when the
> task matches (geometric/physical data), nothing else is as
> efficient.

## What we covered

- Clifford layers use multivector features and geometric-product
  operations.
- Multivectors pack scalars, vectors, bivectors together — natural
  for physical fields.
- Clifford linear/conv layers route information between grades via
  the geometric product (= Clebsch-Gordan for free).
- Full weights are expressive but not equivariant; grade-wise
  weights are equivariant.
- PDE modeling is the killer app: geometric structure as inductive
  bias.
- Nonlinearity via grade-wise gating and multivector products.
- Fixed geometric overhead, mitigated by CUDA kernels.

## What's next

[Chapter 9](/ai-ga/part-3-clifford-networks/gcan) — Geometric
Clifford Algebra Networks (GCAN), which formalize the equivariant
restriction and introduce the Clifford group as the symmetry
structure.
