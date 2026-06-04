---
sidebar_position: 3
title: "Group Theory in 30 Minutes (Just Enough)"
---

# Group Theory in 30 Minutes

> The minimum group theory to read the geometric-ML literature.
> Groups, Lie groups, Lie algebras, representations, and the
> exponential map — fast, with the GA connection at every step.

You don't need a semester of abstract algebra to do geometric deep
learning. You need a working grasp of a handful of objects. This
chapter is the crash course; [Chapter 11](/ai-ga/part-3-clifford-networks/equivariance-proofs-for-ga-layers)
uses it for the equivariance proofs.

## 1. Groups

A **group** $G$ is a set with a composition operation $\cdot$
satisfying:

1. **Closure**: $a, b \in G \Rightarrow a\cdot b \in G$.
2. **Associativity**: $(a\cdot b)\cdot c = a\cdot(b\cdot c)$.
3. **Identity**: there's an $e$ with $e\cdot a = a\cdot e = a$.
4. **Inverses**: every $a$ has an $a^{-1}$ with $a\cdot a^{-1} = e$.

That's it. The transformations that preserve some structure always
form a group — rotations preserve lengths and angles, permutations
preserve set membership, translations preserve differences.

**Examples relevant to ML**:

| Group | Elements | Preserves |
|---|---|---|
| $S_n$ | permutations of $n$ items | set membership (graphs) |
| $\mathbb{R}^n$ | translations | differences (point clouds) |
| $SO(3)$ | 3D rotations | lengths, angles, orientation |
| $O(3)$ | rotations + reflections | lengths, angles |
| $SE(3)$ | rigid motions (rot + trans) | distances (robotics) |
| $E(3)$ | $SE(3)$ + reflections | distances |

## 2. Lie groups

A **Lie group** is a group that's also a smooth manifold — the
group elements form a continuous space, and composition/inversion
are smooth. $SO(3)$ is a Lie group (a 3-dimensional manifold);
$S_n$ is not (it's discrete).

The continuity matters: it means we can take **derivatives** of
paths through the group, and "infinitesimal" group elements make
sense. This is where the Lie algebra comes in.

> :nerdygoose: "Lie" is pronounced "Lee" (after Sophus Lie, the
> Norwegian mathematician). Not "lie" as in untruth. Getting this
> wrong in a talk is the geometric-ML equivalent of saying
> "nucular."

## 3. Lie algebras

The **Lie algebra** $\mathfrak{g}$ of a Lie group $G$ is the tangent
space at the identity — the space of "infinitesimal" group elements.
For matrix groups, it's the set of matrices $X$ such that $e^{tX} \in G$
for all $t$.

| Group | Lie algebra | What it is |
|---|---|---|
| $SO(3)$ | $\mathfrak{so}(3)$ | antisymmetric 3×3 matrices |
| $SE(3)$ | $\mathfrak{se}(3)$ | "twists" (rotation + translation generators) |
| $SO(1,3)$ | $\mathfrak{so}(1,3)$ | Lorentz generators |

The Lie algebra is a **vector space** (you can add infinitesimal
generators and scale them) equipped with a **bracket** $[X, Y] = XY - YX$
that measures non-commutativity.

**The GA punchline**: in geometric algebra, the Lie algebra of the
rotation group is the space of **bivectors**, and the bracket is the
commutator under the geometric product. (This was [physics-ga Ch 3](/geometric-algebra)
in detail.) So $\mathfrak{so}(3) = $ 3D bivectors, $\mathfrak{so}(1,3) = $
STA bivectors. The abstract Lie algebra becomes a concrete subspace
of the Clifford algebra.

## 4. The exponential map

The **exponential map** connects the Lie algebra to the Lie group:

$$\exp : \mathfrak{g} \to G, \qquad X \mapsto e^X = \sum_{k=0}^\infty \frac{X^k}{k!}$$

For a rotation: $\exp$ of an antisymmetric matrix (or a bivector, in
GA) gives a rotation matrix (or a rotor). Every group element near
the identity is $\exp(X)$ for some algebra element $X$.

In GA, this is the **rotor formula** you've seen throughout:

$$R = \exp(B/2)$$

with $B$ a bivector. The factor of $1/2$ is the half-angle / spin
double-cover, discussed at length in [physics-ga Ch 2](/geometric-algebra).

> :surprisedgoose: The exponential map is *the* bridge of geometric
> deep learning. A network predicts a Lie-algebra element (a bivector,
> a few real numbers, no constraints), and $\exp$ turns it into a
> group element (a rotor, exactly orthonormal, on the manifold). No
> projecting back onto $SO(3)$, no Gram-Schmidt, no double-cover
> ambiguity. Predict in the algebra, exponentiate to the group.

## 5. Representations

A **representation** of $G$ is a way of realizing the group as linear
transformations on a vector space $V$:

$$\rho : G \to GL(V), \qquad \rho(g_1 g_2) = \rho(g_1)\rho(g_2)$$

The representation tells you how a particular type of object
transforms. For $SO(3)$:

- The **trivial representation** on $\mathbb{R}$: $\rho(g) = 1$. Scalars.
- The **standard / vector representation** on $\mathbb{R}^3$:
  $\rho(g) = $ the rotation matrix. Vectors.
- **Higher representations** on $\mathbb{R}^{2\ell+1}$: the "type-$\ell$"
  spherical tensors.

A representation is **irreducible** (an "irrep") if it has no
nontrivial invariant subspace — it can't be block-diagonalized into
smaller representations. The irreps are the "atoms" of
representation theory; every representation decomposes into irreps.

## 6. The Clebsch-Gordan decomposition

When you **combine** two representations (tensor product), the result
decomposes into irreps via **Clebsch-Gordan**:

$$\ell_1 \otimes \ell_2 = |\ell_1 - \ell_2| \oplus \cdots \oplus (\ell_1 + \ell_2)$$

For $SO(3)$: type-1 ⊗ type-1 = type-0 ⊕ type-1 ⊕ type-2. In words:
the tensor product of two vectors gives a scalar (dot product), a
vector (cross product), and a symmetric traceless tensor.

This is **exactly** the GA geometric product decomposition:

$$ab = \underbrace{a\cdot b}_{\text{scalar, type-0}} + \underbrace{a\wedge b}_{\text{bivector} = \text{type-1 dual}}$$

The geometric product **is** a Clebsch-Gordan operation — it combines
two vectors and sorts the result by grade (= by irrep). Spherical-
harmonic networks compute Clebsch-Gordan coefficients explicitly; GA
networks get the same decomposition for free from the product.

> :happygoose: This is the deepest connection in the book. The
> Clebsch-Gordan coefficients that SE(3)-Transformers and Tensor
> Field Networks laboriously tabulate are **built into the geometric
> product**. When a Clifford layer multiplies two multivectors, it's
> doing Clebsch-Gordan decomposition as a single algebraic operation.
> [Chapter 8](/ai-ga/part-3-clifford-networks/clifford-layers) makes
> this precise.

## 7. The groups that matter for ML, in detail

### $SO(3)$ and $SE(3)$

3D rotations and rigid motions. The workhorses of molecular ML and
robotics. $\dim SO(3) = 3$, $\dim SE(3) = 6$ (3 rotation + 3
translation).

In GA: $SO(3)$ is the rotor group of $\mathcal{Cl}(3,0)$; $SE(3)$ is
realized in **conformal GA** (CGA, $\mathcal{Cl}(4,1)$) where
translations become rotors too — see [Chapter 16](/ai-ga/part-5-robotics/why-ga-for-robotics).

### $E(n)$

The Euclidean group: rotations, reflections, and translations in
$\mathbb{R}^n$. EGNN ([Chapter 4](/ai-ga/part-2-equivariance/egnn))
targets this. $\dim E(n) = n + \binom{n}{2}$.

### $S_n$

Permutations. The symmetry of sets and graphs (node ordering
shouldn't matter). Graph neural networks are $S_n$-equivariant.
Discrete, so no Lie algebra — handled differently from the
continuous groups.

### The Lorentz group $SO(1,3)$

Relevant for relativistic / high-energy-physics ML. The rotor group
of spacetime algebra ([physics-ga Part III](/geometric-algebra)). A
niche but growing area.

## 8. Why GA unifies the picture

The recurring theme: for each group, GA provides

1. **The Lie algebra as bivectors** — a concrete vector subspace.
2. **The group as rotors** — $\exp(B/2)$ of bivectors.
3. **Representations as grades** — scalars, vectors, bivectors, etc.
4. **Clebsch-Gordan as the geometric product** — combine and sort by
   grade.

A neural network built on GA inherits all four for free. You don't
implement Clebsch-Gordan coefficients, manage irrep bookkeeping, or
project onto the group manifold — the algebra does it. This is the
case [Chapter 1](/ai-ga/part-1-why/the-case-for-ga) opened with,
now grounded in the group theory.

> :weightliftinggoose: That's the whole math prerequisite. Groups are
> symmetries; Lie algebras are infinitesimal symmetries (= bivectors);
> the exponential map connects them (= the rotor formula);
> representations are transformation types (= grades); Clebsch-Gordan
> combines them (= the geometric product). Five concepts, each with a
> GA realization. Everything in Parts II–VI is an application of these.

## What we covered

- Groups: closure, associativity, identity, inverses.
- Lie groups: continuous (smooth-manifold) groups; $SO(3)$, $SE(3)$.
- Lie algebras: infinitesimal generators = **bivectors** in GA.
- The exponential map: $\mathfrak{g} \to G$, realized as $R = \exp(B/2)$.
- Representations: transformation types; irreps are the atoms.
- Clebsch-Gordan = the GA geometric product (combine + sort by grade).
- The groups that matter: $SO(3)$, $SE(3)$, $E(n)$, $S_n$, $SO(1,3)$.

## What's next

That closes Part I. [Part II](/ai-ga/part-2-equivariance/egnn) gets
concrete with equivariant neural networks — starting with EGNN, the
simplest architecture that works, then SE(3)-Transformers and
rotor-based equivariant attention.
