---
sidebar_position: 5
title: "Multiparticle STA and Entanglement"
---

# Multiparticle STA and Entanglement

> *Doran-Lasenby §9.* Tensor products of GA spinors and the
> multiparticle picture of quantum mechanics. Bell states, GHZ
> states, and the structural origin of entanglement.

A single-particle Dirac spinor lives in $\mathcal{Cl}^+(1,3)$, with
8 real dimensions. Two-particle quantum states live in a **tensor
product** of two copies of this — 64 real dimensions. The GA
machinery for tensor-product spinors is straightforward to write
down but reveals genuinely new structure: **entanglement** is the
inability to factorize a state as a tensor product.

## 1. Two-particle states

For two distinguishable particles A and B, the state is

$$\Psi \in \mathcal{Cl}^+(1,3)_A \otimes \mathcal{Cl}^+(1,3)_B$$

A **product state** factors as

$$\Psi = \psi_A \otimes \psi_B$$

— each particle has its own well-defined state. An **entangled
state** does not.

For two spin-1/2 particles in their rest frames, the relevant
algebra is two copies of $\mathcal{Cl}(3,0)$, with the Pauli
spinors of [Ch 18](/physics-ga/part-5-quantum/non-relativistic-quantum-spin)
serving as the individual particle states.

## 2. The Bell states

The maximally entangled two-spin states are the **Bell states**:

$$|\Phi^\pm\rangle = (|00\rangle \pm |11\rangle)/\sqrt{2}, \qquad |\Psi^\pm\rangle = (|01\rangle \pm |10\rangle)/\sqrt{2}$$

In GA notation (using $\boldsymbol{\sigma}_3$-eigenstates for "up"
$|0\rangle$ and "down" $|1\rangle$):

$$\Psi^+ = \frac{1}{\sqrt{2}}(\xi_+^{(A)}\,\xi_-^{(B)} + \xi_-^{(A)}\,\xi_+^{(B)})$$

where the superscript labels the particle. The Bell state $\Psi^+$
has **total spin zero** (the spins are anti-aligned in a coherent
superposition).

The other three Bell states have total spin 1, but in three
different "directions" — they're the triplet states.

These four Bell states form a **complete orthogonal basis** for the
two-spin-1/2 Hilbert space. Any two-spin state can be written as a
linear combination of them.

> :surprisedgoose: The singlet $|\Psi^-\rangle$ — anti-aligned
> spins — is the state where Einstein, Podolsky, and Rosen
> claimed quantum mechanics was incomplete. Bell showed it can't
> be reproduced by any local hidden-variable theory. Aspect's
> 1982 experiment confirmed quantum predictions. The Nobel
> Prize for entanglement was awarded in 2022 (Aspect, Clauser,
> Zeilinger).

## 3. The CHSH-Bell inequality

For a hidden-variable theory with local realism, correlations
between two measurement settings on two particles satisfy

$$|S| = |E(A_1, B_1) + E(A_1, B_2) + E(A_2, B_1) - E(A_2, B_2)| \le 2$$

— the **CHSH inequality**. For the singlet state in quantum
mechanics, choosing measurement angles appropriately:

$$|S_{\rm QM}| = 2\sqrt{2} \approx 2.83$$

— the **Tsirelson bound**. Experiments confirm $S \approx 2.7$, 
violating the classical bound and confirming entanglement.

In GA, the correlations are computed as expectation values of
products of $\boldsymbol{\sigma}$ operators in the Bell state.
The calculation is straightforward:

$$E(\hat{\mathbf{a}}, \hat{\mathbf{b}}) = \langle\Psi^-|\hat{\mathbf{a}}\cdot\boldsymbol{\sigma}^{(A)}\,\hat{\mathbf{b}}\cdot\boldsymbol{\sigma}^{(B)}|\Psi^-\rangle = -\hat{\mathbf{a}}\cdot\hat{\mathbf{b}}$$

— the dot product of measurement directions. The CHSH violation
is then a geometric fact about how unit vectors on a sphere can be
arranged.

## 4. GHZ and tripartite entanglement

For three particles, the **GHZ state** is

$$|\rm GHZ\rangle = (|000\rangle + |111\rangle)/\sqrt{2}$$

This is even "more entangled" than Bell states in a precise
sense: it produces deterministic violations of local realism (not
just statistical violations like Bell).

Mermin's 1990 argument: measuring $\sigma_x$ on particle 1, $\sigma_x$
on 2, $\sigma_y$ on 3 (and permutations) gives **deterministic** $+1$
outcomes for product cases, but $-1$ for the all-$x$ measurement.
No local hidden-variable theory can reproduce this — it's a
contradiction, not a statistical excess.

GHZ states in GA are tensor products of three Pauli spinors with
specific coherent-superposition structure. The mathematics is
straightforward in the GA tensor-product language.

## 5. The reduced density matrix

For a two-particle state $\Psi_{AB}$, the **reduced density matrix**
on particle A is obtained by "tracing out" particle B:

$$\rho_A = \mathrm{Tr}_B|\Psi_{AB}\rangle\langle\Psi_{AB}|$$

For a product state $|\psi_A\rangle\otimes|\psi_B\rangle$, $\rho_A$
is pure ($\rho_A^2 = \rho_A$). For an entangled state, $\rho_A$ is
**mixed** — it represents an ensemble with classical uncertainty.

The **entanglement entropy** is

$$S_E = -\mathrm{Tr}(\rho_A \log\rho_A)$$

For a maximally entangled two-spin state, $S_E = \log 2$ — one
bit of entanglement.

GA's contribution: the density matrix becomes a multivector of
the algebra (not a separate "matrix" structure). The trace operation
is grade-0 projection of the geometric product.

## 6. The no-cloning theorem

A famous result of quantum information: there is no linear,
unitary operator that maps an arbitrary $|\psi\rangle\otimes|0\rangle$
to $|\psi\rangle\otimes|\psi\rangle$ for all $\psi$. **No-cloning**.

Proof sketch: if such a $U$ exists, linearity requires
$U(|\alpha\rangle + |\beta\rangle)\otimes|0\rangle = (|\alpha\rangle + |\beta\rangle)\otimes(|\alpha\rangle + |\beta\rangle)$,
but also $= |\alpha\rangle\otimes|\alpha\rangle + |\beta\rangle\otimes|\beta\rangle$.
These differ unless $|\alpha\rangle = |\beta\rangle$. Contradiction.

In GA: the cloning operation would need to respect the rotor-action
structure of spinors, and the multilinear structure makes the
contradiction even more visible.

## 7. Quantum teleportation

A famous protocol: using a Bell-state shared by Alice and Bob,
Alice can "teleport" a state $|\psi_A\rangle$ to Bob using 2 classical
bits. The protocol:

1. Alice has the state $|\psi\rangle$ and one half of a Bell pair.
2. She performs a Bell-state measurement on her two qubits, getting
   2 classical bits.
3. She sends the bits to Bob.
4. Bob applies one of 4 unitary operations (determined by the bits)
   to his half of the Bell pair.
5. The state on Bob's side is now $|\psi\rangle$.

The state is "teleported" without any physical particle traveling
from Alice to Bob. The information goes via classical bits; the
"quantum" content is reconstituted via the prior shared
entanglement.

In GA, the protocol is straightforward to describe — both the
Bell-state measurement and Bob's unitary are rotor operations on
the spinor algebra.

## 8. Multi-electron atoms (preview)

For an atom with $N$ electrons, the wavefunction is an
**antisymmetric** product of single-electron Dirac spinors —
Slater determinants in the conventional formulation. Pauli
exclusion forbids two electrons from occupying the same state.

In GA, the antisymmetric tensor product is the wedge product
extended to spinors. The wedge of two identical states vanishes
automatically — Pauli exclusion is "$\psi \wedge \psi = 0$".

This is a Gentleman's Promise of the GA framework: the
**antisymmetric** structure of fermion states is built into the
wedge product. Particle physics' "fermions" in the GA picture
are objects that wedge.

> :weightliftinggoose: Pauli exclusion is just $\psi \wedge \psi = 0$
> in the multivector formulation. Bosons (symmetric statistics)
> use a different product (symmetric tensor product). The
> bosonic/fermionic distinction is a structural fact about how
> identical particles are combined — built into the algebra at
> the operation level.

## 9. The QFT bridge (no-bridge)

This single-particle / multi-particle framework runs into trouble
at high energies, where particle number isn't conserved. **Quantum
field theory** treats particle creation and annihilation as
fundamental — replacing the "fixed number of particles" assumption
with a Fock space of variable particle number.

GA has been used to formulate QFT in various forms — Hestenes' GA
formulation of the Standard Model, Doran's spacetime-algebra-based
gauge theory. These remain research topics rather than canonical
textbook material, but the underlying structure is: bivectors as
gauge connections, multivectors as fields with grade-specific
transformation laws.

We won't pursue this further here; the rest of the book stays at
the classical / first-quantized level.

## What we covered

- Two-particle states live in a tensor product of single-particle
  algebras.
- Bell states are maximally entangled; CHSH violation reaches the
  Tsirelson bound $2\sqrt{2}$.
- GHZ states give deterministic (not statistical) Bell-type
  violations.
- Reduced density matrix and entanglement entropy classify
  entanglement.
- No-cloning theorem and quantum teleportation.
- Antisymmetric multi-particle states via the wedge product;
  Pauli exclusion as $\psi\wedge\psi = 0$.

## What's next

That closes Part V. [Part VI](/physics-ga/part-6-gauge-gravity/gauge-principles-for-gravitation)
turns to **gauge theory gravity** — the GA-native approach to
general relativity, where curved spacetime is replaced by gauge
fields on flat spacetime, and gravitational dynamics becomes
manifestly Lorentz-covariant.
