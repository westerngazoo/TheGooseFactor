---
sidebar_position: 2
title: "Geometric Clifford Algebra Networks (Ruhe et al., 2023)"
---

# Geometric Clifford Algebra Networks (GCAN)

> *Ruhe, Brandstetter & Forré, "Clifford Group Equivariant Neural
> Networks," NeurIPS 2023* (and the related "Geometric Clifford
> Algebra Networks," ICML 2023). The rigorous equivariant formulation.

Where [Chapter 8](/ai-ga/part-3-clifford-networks/clifford-layers)
introduced Clifford layers heuristically, GCAN puts them on a
rigorous group-theoretic footing. The key object is the **Clifford
group**, and the key result is a clean characterization of which
operations are equivariant.

## 1. The Clifford group

The **Clifford group** $\Gamma$ consists of the invertible elements
of the Clifford algebra that preserve the grade structure under the
twisted conjugation (sandwich) action:

$$\rho(w)[x] = w\,x\,w^{-1} \quad\text{(or with a grade-involution twist)}$$

The rotors $R = \exp(B/2)$ are the unit elements of (the even part
of) the Clifford group. The Clifford group is the GA-native
realization of the orthogonal group's double cover — $\mathrm{Pin}$
and $\mathrm{Spin}$.

The central theorem (Ruhe et al.): the Clifford group acts on the
whole algebra via the sandwich, and this action **preserves grades**.
So any function built from grade-preserving operations is
Clifford-group equivariant.

> :nerdygoose: The Clifford group unifies $O(n)$, $SO(n)$,
> $\mathrm{Pin}(n)$, $\mathrm{Spin}(n)$ into one algebraic object.
> Equivariance to "rotations" or "rotations + reflections" becomes
> equivariance to the Clifford group acting by sandwich. The
> grade-preservation of the sandwich is the theorem that makes the
> whole framework work.

## 2. Equivariant linear layers

The central result of GCAN: a linear map on multivectors is
Clifford-group equivariant **if and only if** it acts as a separate
scalar on each grade:

$$\phi(m) = \sum_{k} \lambda_k\,\langle m\rangle_k$$

where $\langle m\rangle_k$ is the grade-$k$ part and $\lambda_k$ is a
learnable scalar per grade. (For multiple channels, $\lambda_k$
becomes a per-grade channel-mixing matrix.)

This is a complete characterization: **grade-wise scaling is the most
general equivariant linear map.** Anything more (mixing grades
linearly) breaks equivariance; anything less leaves expressiveness on
the table.

So the equivariant Clifford linear layer is:

$$\text{out}_c = \sum_{c'} \sum_k \lambda_{k, cc'}\,\langle m_{c'}\rangle_k$$

— for each output channel, a per-grade weighted sum of input
channels' grades.

## 3. Equivariant nonlinearity from the geometric product

Linear layers alone are limited. GCAN's nonlinearity comes from the
**geometric product of features**:

$$\text{out} = \langle m_1\,m_2\rangle \quad\text{(or selected grades thereof)}$$

The geometric product of two equivariant multivectors is equivariant
(the sandwich distributes over the product), and it's **bilinear** —
genuinely nonlinear in the joint input. This gives the network
expressive power beyond linear maps while preserving equivariance.

The combination — grade-wise linear maps + geometric-product
nonlinearities — is provably equivariant and provably expressive
(a universal-approximation-style result for equivariant functions).

> :happygoose: This is the cleanest statement in the GA-ML
> literature: **equivariant networks = grade-wise linear maps +
> geometric-product nonlinearities.** Two ingredients, both natural
> in GA, together giving a complete and expressive equivariant
> architecture. No spherical harmonics, no CG tables — just the
> algebra.

## 4. The geometric product layer

GCAN's signature layer takes pairs of multivector features and forms
their geometric product, optionally projecting to selected grades:

$$y = \sum_{ij} W_{ij}\,(x_i\,x_j)$$

with $x_i, x_j$ input multivectors and $W_{ij}$ grade-preserving
mixing weights. This **fully connected geometric product** layer is
the workhorse of GCAN.

It's analogous to a quadratic/bilinear layer in standard networks,
but the bilinear form is the geometric product, so it respects the
algebra. The grade structure is maintained throughout.

## 5. Steerability and the relation to e3nn

GCAN's grade-wise approach is closely related to the
**steerable** networks of e3nn (irrep-based). The correspondence:

| GCAN | e3nn / irreps |
|---|---|
| Grade-wise scalar $\lambda_k$ | Per-irrep scalar (self-interaction) |
| Geometric product | Clebsch-Gordan tensor product |
| Multivector | Direct sum of irreps |
| Clifford group | $\mathrm{Spin}/\mathrm{Pin}$ group |

The difference is bookkeeping: GCAN works in the algebra (grades),
e3nn works in the irrep basis (types). They're related by a change
of basis. GCAN's advantage is uniformity (one product); e3nn's is
fine-grained type control. [Chapter 11](/ai-ga/part-3-clifford-networks/equivariance-proofs-for-ga-layers)
works out the precise dictionary.

## 6. Empirical results

GCAN and the Clifford Group Equivariant networks report strong
results on:

- **N-body dynamics**: predicting trajectories with full
  equivariance. Competitive with or beating EGNN and SE(3)-Transformer.
- **PDE modeling**: the original Clifford-layer application, now with
  guaranteed equivariance.
- **Convex hull / geometric tasks**: synthetic benchmarks where the
  geometric structure is essential.

The headline: **comparable accuracy to irrep-based methods, simpler
implementation, often faster.** The GA pitch — efficient *and*
expressive — is borne out on these benchmarks.

## 7. The dimension-agnostic property

A notable GCAN feature: the same architecture works in **any
dimension**. The Clifford algebra $\mathcal{Cl}(n,0)$ exists for any
$n$, the geometric product is defined uniformly, and grade-wise
linear maps make sense regardless of dimension.

So a GCAN written for 3D works in 2D, 4D, or higher with no
architectural change — just a different algebra. Irrep-based methods
need dimension-specific Clebsch-Gordan coefficients; GCAN doesn't.
This matters for physics applications in arbitrary dimensions (lattice
field theory, high-dimensional dynamics).

> :surprisedgoose: Dimension-agnosticism is an underrated GA
> superpower. The same network learns 2D fluid dynamics and 3D fluid
> dynamics with no code change — just swap the algebra. Try doing
> that with a method that hardcodes 3D spherical harmonics.

## 8. Limitations and open questions

GCAN is powerful but not a finished story:

- **Scaling**: behavior at large scale (many layers, many channels,
  big datasets) is still being characterized — see [Chapter 20](/ai-ga/part-6-frontiers/scaling-ga-networks).
- **Type-2+ features**: native grades cover low types; high-type
  features need extensions or higher-dimensional embeddings.
- **Library maturity**: implementations exist but aren't as
  battle-tested as e3nn or PyG.

GCAN is the current state of the art for the GA-native approach, but
the field is young and moving fast.

> :weightliftinggoose: GCAN is the "perfect form" lift — grade-wise
> linears plus geometric-product nonlinearities, provably equivariant
> and expressive. It's the cleanest realization of the whole book's
> thesis. Whether it beats irrep methods on your specific task is
> empirical, but conceptually it's the destination Part I was
> pointing at.

## What we covered

- The Clifford group: invertible grade-preserving elements; rotors
  are its unit even part.
- The central theorem: equivariant linear maps are exactly
  **grade-wise scalings**.
- Equivariant nonlinearity from the geometric product (bilinear,
  grade-mixing, equivariant).
- Equivariant networks = grade-wise linears + geometric-product
  nonlinearities.
- Correspondence to e3nn/irreps (change of basis).
- Strong empirical results; dimension-agnostic.
- Open: scaling, high-type features, library maturity.

## What's next

[Chapter 10](/ai-ga/part-3-clifford-networks/learning-rotors-directly) —
learning rotors directly. Parameterization choices for predicting
rotations: bivectors and the exponential map vs quaternions vs
matrices, and why the GA parameterization avoids the pitfalls.
