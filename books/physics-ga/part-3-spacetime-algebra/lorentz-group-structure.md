---
sidebar_position: 4
title: "The Lorentz Group Structure"
---

# The Lorentz Group Structure

> *Doran-Lasenby §5.4.* The four connected components of $O(1,3)$,
> the Lie-algebra structure of bivectors, and the BCH formula made
> concrete.

The Lorentz group has algebraic structure that's intricate enough
to confuse students who meet it as an abstract group, but in GA
it's all visible: rotors $\exp(B/2)$ form the connected identity
component, parity and time-reversal sit as separate disconnected
pieces, and the Lie algebra is just the space of bivectors with
the commutator bracket.

## 1. The four connected components

The full Lorentz group $O(1,3)$ has **four** connected components:

| Component | Symbol | Includes | Determinant | Sign of $\Lambda^0{}_0$ |
|---|---|---|---|---|
| Proper orthochronous | $L_+^\uparrow$ | identity, rotations, boosts | $+1$ | $+$ |
| Improper orthochronous | $L_-^\uparrow$ | spatial reflections | $-1$ | $+$ |
| Proper non-orthochronous | $L_+^\downarrow$ | time reversal × parity | $+1$ | $-$ |
| Improper non-orthochronous | $L_-^\downarrow$ | time reversal | $-1$ | $-$ |

"Proper" means orientation-preserving ($\det\Lambda = +1$);
"orthochronous" means time-direction-preserving ($\Lambda^0{}_0 > 0$).

The **identity component** $L_+^\uparrow$ — the proper orthochronous
Lorentz group — is the group of transformations continuously
connected to the identity. It's the one parameterized by rotors
$R = \exp(B/2)$.

The other three components are reached by composing with the
**discrete transformations** parity $P$ (flip spatial vectors) and
time-reversal $T$ (flip $\gamma_0$). In STA:

- Parity: $v \mapsto -\gamma_0 v \gamma_0$ (flips spatial part of
  $v$).
- Time reversal: $v \mapsto -v$ (flips everything, then add a sign
  to preserve... actually the realization is subtle; we'll do it
  in detail in §6).

> :nerdygoose: The disconnected structure of $O(1,3)$ is why
> particle physicists worry about CPT — the combined charge-parity-
> time symmetry. Each discrete factor maps between disconnected
> components of the Lorentz group; the combined CPT lives in the
> identity component (theorem of Lüders & Pauli, 1954).

## 2. The Lie algebra $\mathfrak{so}(1,3)$

The Lie algebra of the Lorentz group is the space of **bivectors**
in STA, with the bracket given by the commutator:

$$[B_1, B_2] := B_1 B_2 - B_2 B_1$$

(The factor-of-2 convention is sometimes used: $[B_1, B_2]/2$. We
won't worry about it here.)

The closure property — the bracket of two bivectors is another
bivector — follows from $B_1 B_2 = \langle B_1 B_2 \rangle_0 + \langle B_1 B_2 \rangle_2 + \langle B_1 B_2 \rangle_4$;
subtracting $B_2 B_1$ kills the grade-0 and grade-4 parts (which
are commutative parts of the geometric product), leaving only
grade-2.

So bivectors form a closed Lie algebra under the commutator. This
is **the algebra $\mathfrak{so}(1,3)$** — and in STA it's just a
6-dimensional vector subspace of the Clifford algebra, with the
bracket given by an existing operation.

## 3. Commutation relations

Choose the basis $\{B_{\mu\nu} = \gamma_{\mu\nu}/2\}_{\mu<\nu}$
for the bivectors. Compute one example:

$$[\gamma_{01}, \gamma_{12}] = \gamma_{01}\gamma_{12} - \gamma_{12}\gamma_{01}$$

Each geometric product:

- $\gamma_{01}\gamma_{12} = \gamma_0\gamma_1\gamma_1\gamma_2 = \gamma_0(-1)\gamma_2 = -\gamma_{02}$
- $\gamma_{12}\gamma_{01} = \gamma_1\gamma_2\gamma_0\gamma_1 = -\gamma_1\gamma_0\gamma_2\gamma_1 = -(-1)\gamma_0\gamma_2\gamma_1\gamma_1 = \gamma_{02}$

Wait — let me redo that more carefully. Pulling $\gamma_2\gamma_0 = -\gamma_0\gamma_2$:

$$\gamma_{12}\gamma_{01} = \gamma_1(-\gamma_0\gamma_2)\gamma_1 = -\gamma_1\gamma_0\gamma_2\gamma_1$$

Then pull the last $\gamma_1$ past $\gamma_2$ and $\gamma_0$:

$$= -\gamma_1\gamma_0(-\gamma_1)\gamma_2 = \gamma_1\gamma_0\gamma_1\gamma_2 = -\gamma_0\gamma_1^2\gamma_2 = -\gamma_0(-1)\gamma_2 = \gamma_{02}$$

So $[\gamma_{01}, \gamma_{12}] = -\gamma_{02} - \gamma_{02} = -2\gamma_{02}$.

The structure constants of $\mathfrak{so}(1,3)$ in this basis fall
out from the same kind of calculation. The classic textbook
formulas

$$[K_i, K_j] = -i\epsilon_{ijk}J_k, \qquad [J_i, K_j] = i\epsilon_{ijk}K_k, \qquad [J_i, J_j] = i\epsilon_{ijk}J_k$$

(with $J_i$ rotation generators, $K_i$ boost generators) are
recovered with $J_i = \gamma_{jk}/2$ (cyclic) and $K_i = \gamma_{0i}/2$,
up to factors of $i$ that arise when you put the algebra into a
Hermitian basis.

## 4. The $SU(2) \times SU(2)$ structure

Define the **self-dual** and **anti-self-dual** bivector combinations:

$$B^\pm = \tfrac{1}{2}(B \pm IB)$$

These are projection bivectors satisfying $IB^\pm = \pm B^\pm$. They
split the bivector space into two 3-dimensional subspaces, and the
Lie algebra splits as

$$\mathfrak{so}(1,3) \otimes \mathbb{C} \cong \mathfrak{su}(2) \oplus \mathfrak{su}(2)$$

(after complexifying — required because $I^2 = -1$ in STA already
acts like a complex structure on bivectors). Each $\mathfrak{su}(2)$
factor is generated by either the self-dual or anti-self-dual
bivectors.

This is the **two-spinor formalism** of Penrose and Rindler — the
4D Lorentz group has the spinorial structure of two independent
$SU(2)$ rotation groups, made manifest via the $I$ duality. In
particle physics this is the basis for **left-handed and
right-handed Weyl spinors**.

> :surprisedgoose: Left and right chirality in particle physics
> are the self-dual / anti-self-dual decomposition of bivectors
> in STA, dressed up with $\gamma^5$ matrix conventions. The
> chiral projection operator $P_L = (1-\gamma^5)/2$ is the same
> operation as projecting onto anti-self-dual bivectors. STA
> shows this immediately; the Dirac-matrix formalism takes a
> chapter to derive.

## 5. The exponential map and BCH

The Lie group ↔ Lie algebra map for the Lorentz group is the
exponential:

$$\exp : \text{bivectors} \to \mathrm{Spin}(1,3), \qquad B \mapsto \exp(B/2) = R$$

For a **single** bivector $B$, the exponential converges to

$$R = \exp(B/2) = \cos(\alpha) + B\sin(\alpha)/|\alpha|$$

if $B^2 < 0$ (spacelike, $\alpha = |B|/2$), or

$$R = \cosh(\alpha) + B\sinh(\alpha)/|\alpha|$$

if $B^2 > 0$ (timelike, $\alpha = |B|/2$).

For two non-commuting bivectors, **BCH** (Baker-Campbell-Hausdorff):

$$\exp(B_1) \exp(B_2) = \exp(B_1 + B_2 + \tfrac{1}{2}[B_1, B_2] + \tfrac{1}{12}[B_1, [B_1, B_2]] + \cdots)$$

In STA, BCH terminates after finitely many terms in many cases of
interest — because the iterated commutators eventually become
proportional to the original bivectors. For example, two pure
boosts give a result that's exactly a single rotor (a boost-
plus-rotation), with the rotation being Thomas precession.

## 6. Parity and time-reversal in STA

The discrete Lorentz transformations need careful treatment in GA.

**Parity** $P$ flips spatial vectors and leaves $\gamma_0$ alone.
Algebraically:

$$P(v) = \tilde{P} v P, \qquad P = \gamma_0$$

That is, the parity operator *is* $\gamma_0$, acting via the
sandwich. Check: $P\gamma_0 \tilde{P} = \gamma_0\gamma_0\gamma_0 = \gamma_0$
(fixed), and $P\gamma_i\tilde{P} = \gamma_0\gamma_i\gamma_0 = -\gamma_i\gamma_0\gamma_0 = -\gamma_i$
(flipped). ✓

**Time reversal** $T$ flips $\gamma_0$ and leaves spatial vectors
alone. The naive sandwich $T = \gamma_1\gamma_2\gamma_3$ would
flip spatial, not time — wrong. The correct realization includes
a reversal:

$$T(v) = -\tilde{T} v T, \quad T = \gamma_1\gamma_2\gamma_3$$

— with the *minus sign* outside. This is in the **non-orthochronous**
component of $O(1,3)$ — not connected to the identity by a continuous
path. It's discrete-only, with no Lie-algebra generator.

Combined $PT$ takes spatial $\to$ $-$spatial and time $\to$ $-$time
— i.e., **everything to its negative**. The PT operator is
$PT = \gamma_0\gamma_1\gamma_2\gamma_3 = I$, the pseudoscalar.

> :angrygoose: PT = $I$. The pseudoscalar *is* the combined
> parity-time-reversal operator. This is one of those connections
> that GA exposes immediately and that tensor formulations take
> three chapters to derive. The CPT theorem connects the
> pseudoscalar to charge conjugation in quantum field theory —
> we'll see that in [Part V](/physics-ga/part-5-quantum/coming-soon).

## 7. Casimir invariants

The Lorentz group has two **Casimir invariants** — quantities
that commute with all generators:

$$C_1 = -B_{\mu\nu}B^{\mu\nu}/2 \quad\text{(quadratic Casimir)}$$
$$C_2 = -B_{\mu\nu}\tilde{B}^{\mu\nu}/2 \quad\text{(dual-bivector Casimir)}$$

In GA notation, with $B = \tfrac{1}{2}B^{\mu\nu}\gamma_{\mu\nu}$:

$$C_1 = -\langle B^2 \rangle_0, \qquad C_2 = -\langle B \tilde{B}\rangle_0 = -\langle B(IB)\rangle_0$$

Both are scalars and rotor-invariant ($R B \tilde{R}$ leaves $B^2$
and $B\tilde{B}$ unchanged). The pair $(C_1, C_2)$ labels Lorentz
representations — relevant in particle physics where
representations are indexed by $(j_1, j_2)$ via the
$SU(2)\times SU(2)$ split of §4.

## 8. The Poincaré group

The full symmetry group of special relativity is the **Poincaré
group** — the Lorentz group extended by spacetime translations:

$$x \mapsto \Lambda x + a$$

In GA, translations are just vector additions. The Poincaré group
isn't a group of rotors alone — it's a semidirect product
$\mathbb{R}^4 \rtimes \mathrm{Spin}(1,3)$. In **conformal GA**
(briefly previewed in [Ch 32](/physics-ga/part-7-geometric-calculus/coming-soon)),
translations also become rotors, and the Poincaré group becomes a
pure rotor group in a higher-dimensional algebra.

> :mathgoose: The trick — make translations into rotors by going
> to higher-dimensional GA — is the essence of conformal geometric
> algebra (CGA). In 3D CGA, translations, rotations, and scalings
> all become rotors in $\mathcal{Cl}(4,1)$. The same trick in
> spacetime gives a unified rotor representation of the Poincaré
> group, but the dimension blow-up is significant. For special
> relativity, the semidirect-product structure is cleaner.

## What we covered

- $O(1,3)$ has 4 connected components; the identity component is
  parameterized by rotors $R = \exp(B/2)$.
- The Lie algebra $\mathfrak{so}(1,3)$ is the space of bivectors
  with the commutator bracket — built into the geometric product.
- The classic $[J_i, J_j], [J_i, K_j], [K_i, K_j]$ commutators
  reproduce from GA bivector products.
- Bivectors split into self-dual + anti-self-dual under $I$, giving
  the $\mathfrak{su}(2)\oplus\mathfrak{su}(2)$ decomposition — the
  origin of Weyl chirality.
- BCH gives the rotor-product formula; closed-form when bivectors
  commute, gives Thomas precession when they don't.
- Parity $P = \gamma_0$ acts by sandwich; time-reversal needs an
  extra sign; their product is the pseudoscalar $PT = I$.
- Two Casimir invariants $\langle B^2 \rangle_0$ and
  $\langle BIB\rangle_0$ label Lorentz representations.

## What's next

[Chapter 12](/physics-ga/part-3-spacetime-algebra/spacetime-dynamics) —
spacetime dynamics. Equations of motion, the relativistic
Lagrangian, energy-momentum conservation, and the geodesic
equation in flat spacetime (preview for the curved version in
[Part VI](/physics-ga/part-6-gauge-gravity/coming-soon)).
