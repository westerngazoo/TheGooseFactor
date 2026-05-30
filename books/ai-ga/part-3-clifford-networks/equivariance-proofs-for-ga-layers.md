---
sidebar_position: 4
title: "Equivariance Proofs for GA Layers"
---

# Equivariance Proofs for GA Layers

> The rigorous arguments. Why grade-wise linear maps and
> geometric-product layers are equivariant, and the precise
> dictionary between GA grades and $SO(3)$ irreps.

The previous chapters asserted that various GA operations are
equivariant. This chapter proves it, carefully. The proofs are short
once the setup is right — that's part of the appeal of the GA
formulation.

## 1. The setup

Let $G = \mathrm{Spin}(n)$ act on the Clifford algebra $\mathcal{Cl}(n,0)$
by the sandwich (twisted conjugation):

$$\rho(R)[m] = R\,m\,\tilde{R}, \qquad R\tilde{R} = 1$$

This is a representation: $\rho(R_1)\rho(R_2)[m] = R_1 R_2 m \tilde{R_2}\tilde{R_1} = \rho(R_1 R_2)[m]$.
We want to show various network operations $f$ satisfy

$$f(\rho(R)[m]) = \rho(R)[f(m)]$$

## 2. Lemma: the sandwich preserves grades

**Claim**: $\rho(R)$ maps grade-$k$ multivectors to grade-$k$
multivectors.

**Proof**: A rotor $R = \exp(B/2)$ is even-grade. The sandwich
$R m \tilde{R}$ is a product of even × (grade-$k$) × even. The
geometric product of an even multivector with a grade-$k$ blade,
sandwiched, stays grade $k$ — because conjugation by a rotor is an
orthogonal transformation on the underlying vector space, and
orthogonal transformations preserve the exterior-algebra grading.

More concretely: for a $k$-blade $a_1 \wedge \cdots \wedge a_k$,

$$R(a_1\wedge\cdots\wedge a_k)\tilde{R} = (Ra_1\tilde{R})\wedge\cdots\wedge(Ra_k\tilde{R})$$

— the sandwich distributes over the wedge (it's an outermorphism,
[physics-ga Ch 3](/geometric-algebra)). Each $Ra_i\tilde{R}$ is a
vector (grade 1), so the wedge is still a $k$-blade. $\square$

This lemma is the foundation. Everything else follows.

## 3. Theorem: grade-wise linear maps are equivariant

**Claim**: $\phi(m) = \sum_k \lambda_k\langle m\rangle_k$ is
equivariant for any scalars $\lambda_k$.

**Proof**: Using the lemma, $\langle \rho(R)[m]\rangle_k = \rho(R)[\langle m\rangle_k]$
(the sandwich commutes with grade projection, since it preserves
grades). Then:

$$\phi(\rho(R)[m]) = \sum_k \lambda_k \langle\rho(R)[m]\rangle_k = \sum_k \lambda_k\,\rho(R)[\langle m\rangle_k] = \rho(R)\Big[\sum_k\lambda_k\langle m\rangle_k\Big] = \rho(R)[\phi(m)]$$

using linearity of $\rho(R)$. $\square$

So grade-wise scaling is equivariant. This is the GCAN linear layer
([Chapter 9](/ai-ga/part-3-clifford-networks/gcan)).

## 4. Theorem: the geometric product is equivariant

**Claim**: $f(m_1, m_2) = m_1 m_2$ satisfies
$f(\rho(R)[m_1], \rho(R)[m_2]) = \rho(R)[f(m_1, m_2)]$.

**Proof**:

$$\rho(R)[m_1]\,\rho(R)[m_2] = (R m_1 \tilde{R})(R m_2 \tilde{R}) = R m_1 (\tilde{R}R) m_2 \tilde{R} = R m_1 m_2 \tilde{R} = \rho(R)[m_1 m_2]$$

using $\tilde{R}R = 1$ in the middle. $\square$

This is the one-line proof that makes GA networks clean. The
geometric product is equivariant because the rotor sandwich
**telescopes** — the inner $\tilde{R}R$ cancels. Any operation built
from geometric products and grade-wise linear maps inherits
equivariance by composition.

## 5. Why this beats checking irreps

In the irrep formulation, proving equivariance means verifying that
each operation respects the Wigner D-matrix transformation laws —
checking Clebsch-Gordan selection rules, tracking which output types
appear, confirming the coefficients are correct. It's a bookkeeping
exercise.

In GA, equivariance is **two lemmas**: the sandwich preserves grades,
and the sandwich telescopes through products. Every layer's
equivariance reduces to these. The proofs are short because the
algebra does the work.

> :happygoose: The geometric-product equivariance proof —
> $(Rm_1\tilde{R})(Rm_2\tilde{R}) = Rm_1m_2\tilde{R}$ — is three
> symbols of cancellation. That's the entire content. Compare to
> verifying Clebsch-Gordan selection rules for a tensor-product
> layer. The GA proof isn't just shorter; it reveals *why* the
> operation is equivariant: the group action passes through the
> product transparently.

## 6. The grade ↔ irrep dictionary

The precise correspondence between GA grades and $SO(3)$ irreps (the
"types" of [Chapter 5](/ai-ga/part-2-equivariance/se3-transformers)):

In 3D, $\mathcal{Cl}(3,0)$ decomposes under $SO(3)$ as:

| Grade | Dimension | $SO(3)$ irrep content |
|---|---|---|
| 0 (scalar) | 1 | type-0 |
| 1 (vector) | 3 | type-1 |
| 2 (bivector) | 3 | type-1 (the dual of a vector) |
| 3 (pseudoscalar) | 1 | type-0 (pseudo — flips under reflection) |

So 3D GA covers types 0 and 1, with two copies of each (scalar +
pseudoscalar for type-0; vector + bivector for type-1). It does
**not** natively contain type-2 (the 5-dimensional irrep).

To get type-2, you need **symmetric products** of vectors, which
live in a different construction (the symmetric algebra, not the
Clifford algebra). This is the precise sense in which GA and irrep
methods differ: GA is the *Clifford* (antisymmetric-flavored)
algebra; full irrep coverage needs the symmetric part too.

> :nerdygoose: This is the honest limitation, stated precisely. GA's
> grades give you types 0 and 1 efficiently and uniformly. For tasks
> that genuinely need type-2+ features (some molecular tensors,
> certain physical quantities), you either embed in higher-dimensional
> GA, combine GA with symmetric tensors, or use a full irrep method.
> The GA pitch is strongest when types 0 and 1 dominate — which is
> most of the time, but not always.

## 7. Reflections and the full $O(n)$

The proofs above used rotors (the $\mathrm{Spin}$ group, even part).
For full $O(n)$ equivariance (including reflections), use the
**Pin group** — generated by unit vectors acting by sandwich.

A reflection in a hyperplane perpendicular to unit vector $\hat{n}$
is $m \mapsto \hat{n}\,\hat{m}\,\hat{n}$ (with grade involution on
$m$, [physics-ga Ch 2](/geometric-algebra)). The grade-preservation
and telescoping properties extend to the Pin group with appropriate
sign tracking. So GA layers can be made $O(n)$-equivariant (handling
chirality) as well as $SO(n)$-equivariant.

This matters for chirality-sensitive tasks: an $O(3)$-equivariant
network distinguishes a molecule from its mirror image; an
$SO(3)$-equivariant one might not (depending on whether it uses the
pseudoscalar).

## 8. Universality

A natural question: are grade-wise linears + geometric products
**enough** to approximate any equivariant function? The Clifford
Group Equivariant Networks paper (Ruhe et al. 2023) gives a
universal-approximation-style result: networks built from these
operations are dense in the space of equivariant polynomial maps,
under reasonable conditions.

This is the theoretical backing for the architecture: it's not just
*some* equivariant operations, it's a *complete* set (for polynomial
equivariant functions). You're not leaving expressiveness on the
table by restricting to these operations.

> :weightliftinggoose: Two lemmas, two theorems, one dictionary. The
> sandwich preserves grades; the sandwich telescopes through
> products; therefore grade-wise linears and geometric products are
> equivariant; therefore networks built from them are equivariant by
> composition; and they're universal. That's the rigorous spine of
> the whole GA-ML program, and it fits in one chapter because the
> algebra carries the weight.

## What we covered

- Setup: $\mathrm{Spin}(n)$ acts by the sandwich $RmR^{-1}$.
- Lemma 1: the sandwich preserves grades (it's an outermorphism).
- Theorem 1: grade-wise linear maps are equivariant.
- Theorem 2: the geometric product is equivariant (the sandwich
  telescopes).
- Equivariance by composition; proofs are short because the algebra
  does the work.
- Grade ↔ irrep dictionary: 3D GA covers types 0, 1 (two copies
  each), not type-2 natively.
- Pin group for $O(n)$ / chirality.
- Universality: these operations are complete for equivariant
  polynomials.

## What's next

That closes Part III. [Part IV](/ai-ga/part-4-representations/molecular-property-prediction)
applies these architectures to concrete representation problems —
molecules, point clouds, graphs — where the choice of multivector
encoding shapes performance.
