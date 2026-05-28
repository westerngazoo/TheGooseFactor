---
sidebar_position: 1
title: "Non-Relativistic Quantum Spin (Pauli in STA)"
---

# Non-Relativistic Quantum Spin

> *Doran-Lasenby §8.1–8.2.* Pauli spinors as elements of the even
> subalgebra of $\mathcal{Cl}(3,0)$. Spin-1/2 mechanics with rotors
> instead of 2×2 complex matrices.

The conventional formulation of spin uses 2×2 complex matrices acting
on 2-component complex column vectors. The GA reformulation uses
the **even subalgebra** of 3D GA — scalars plus bivectors, with
$2^2 = 4$ real dimensions — exactly the same dimensional content,
but with the geometric interpretation explicit at every step.

## 1. Spinors as even multivectors

A **Pauli spinor** $\psi$ in GA is an even-grade multivector of
$\mathcal{Cl}(3,0)$:

$$\psi = \alpha + B = \alpha + b^i \boldsymbol{\sigma}_i I = \alpha + b^i I\boldsymbol{\sigma}_i$$

where $\alpha$ is a scalar, $B$ is a bivector, and the $\boldsymbol{\sigma}_i$
are spatial basis vectors. We have 4 real parameters total — same
as the 2 complex components of the conventional spinor (which is also
4 real parameters).

The bivector $B = b^i I\boldsymbol{\sigma}_i$ (where $I = \boldsymbol{\sigma}_1\boldsymbol{\sigma}_2\boldsymbol{\sigma}_3$
is the 3D pseudoscalar, $I^2 = -1$) plays the role of the "imaginary
part" — it commutes with all bivectors (since $I$ commutes with
vectors in 3D), so it acts effectively as a unit imaginary.

> :nerdygoose: The identification "$I = i$" in 3D GA is what makes
> the Pauli formalism work cleanly. The complex numbers used in
> quantum mechanics are *not* arbitrary — they're the 3D
> pseudoscalar, an algebraic object with geometric meaning.

## 2. The dictionary: column spinors ↔ even multivectors

A conventional Pauli spinor is

$$|\psi\rangle = \begin{pmatrix} a + ib \\ c + id \end{pmatrix}, \quad a,b,c,d \in \mathbb{R}$$

The GA spinor is

$$\psi = a - bI\boldsymbol{\sigma}_3 - cI\boldsymbol{\sigma}_2 + dI\boldsymbol{\sigma}_1$$

(the conventions and signs vary across textbooks; D-L §8.1 gives
a specific choice). The mapping is one-to-one and preserves all
operations — Hermitian conjugation, norms, expectation values —
in the sense that

$$\langle\psi|\hat{A}|\psi\rangle = \langle\psi\,\hat{A}\,\tilde{\psi}\rangle_0$$

with $\langle\cdot\rangle_0$ the scalar part, $\tilde{\psi}$ the
reverse, and $\hat{A}$ the GA-form operator.

## 3. The Pauli matrices as basis vectors

Conventional Pauli matrices satisfy

$$\sigma_i \sigma_j + \sigma_j\sigma_i = 2\delta_{ij}\mathbf{1}, \qquad \sigma_i \sigma_j - \sigma_j\sigma_i = 2i\epsilon_{ijk}\sigma_k$$

In GA, **the Pauli matrices are the basis vectors** of
$\mathcal{Cl}(3,0)$: $\sigma_i \leftrightarrow \boldsymbol{\sigma}_i$,
with the matrix product corresponding to the geometric product
between vectors:

$$\boldsymbol{\sigma}_i\boldsymbol{\sigma}_j = \delta_{ij} + I\epsilon_{ijk}\boldsymbol{\sigma}_k$$

The "imaginary unit" $i$ in the commutator is the 3D pseudoscalar $I$.

This is **not a coincidence** — it's why Pauli matrices "work" for
spin in the first place. The abstract algebraic structure they
satisfy *is* the Clifford algebra $\mathcal{Cl}(3,0)$.

## 4. Rotations of spinors

For a rotation by angle $\theta$ around axis $\hat{\mathbf{n}}$, the
spinor transforms by **left multiplication**:

$$\psi \to R\psi, \qquad R = \exp(-I\hat{\mathbf{n}}\theta/2)$$

(The sign / factor convention follows the textbook.) Note the
spinor transformation is **not** the sandwich $RxR^{-1}$ that
applies to vectors. Spinors transform by direct multiplication —
which is **why** they pick up a sign change under $2\pi$ rotation:

$$\exp(-I\hat{\mathbf{n}}\cdot 2\pi/2) = \cos\pi - I\hat{\mathbf{n}}\sin\pi = -1$$

After a full $2\pi$ rotation, $\psi \to -\psi$. After $4\pi$,
$\psi \to +\psi$ — the famous "spin-1/2 needs two full turns" fact
of quantum mechanics.

In GA: the half-angle in $R = \exp(B/2)$ from [Ch 2 §3](/physics-ga/part-1-foundations/reflections-rotations-and-the-sandwich)
is what causes this. Vectors see twice the angle (because of the
double-sandwich); spinors see the half-angle directly.

> :surprisedgoose: The minus sign under $2\pi$ rotation isn't a
> quantum-mechanical mystery — it's the algebraic structure of the
> spin group $\mathrm{Spin}(3) = SU(2)$, the double cover of
> $SO(3)$. Classical rotors see the same minus sign; we just
> usually look at how they act on vectors via the sandwich, where
> the sign cancels.

## 5. The Pauli equation

The non-relativistic equation for a spin-1/2 particle in an EM
field is the **Pauli equation**:

$$i\hbar\partial_t \psi = \frac{1}{2m}(\hat{\mathbf{p}} - e\mathbf{A})^2 \psi - \mu_B \mathbf{B}\cdot\boldsymbol{\sigma}\,\psi + e\phi\,\psi$$

In GA, replace $i \to I$ and $\boldsymbol{\sigma}_i \to$ the basis
vectors:

$$\partial_t \psi\,I\hbar = \frac{1}{2m}(\nabla - eA)^2\,\psi - \mu_B \mathbf{B}\,\psi + e\phi\,\psi$$

The "$I$ on the right" of $\partial_t\psi$ is the analog of "$i$
times" in conventional QM. The magnetic-moment term $\mathbf{B}\boldsymbol{\sigma}$
becomes simply $\mathbf{B}\psi$ — left multiplication of the
spinor by the magnetic-field vector.

This last identification — that the magnetic-moment coupling is
literally **left-multiplication by $\mathbf{B}$** — is one of the
GA insights. The "Zeeman energy" is the rotation that the magnetic
field tries to induce on the spinor, opposed by the
external-energy term.

## 6. Spin angular momentum

The spin angular momentum operator in GA acts as

$$\hat{\mathbf{S}}\psi = \frac{\hbar}{2} I\boldsymbol{\sigma}\,\psi$$

— left-multiplication by $I\boldsymbol{\sigma}$ (a bivector — the
pseudoscalar times a vector). For a spinor "aligned with $\boldsymbol{\sigma}_3$"
(i.e., $\psi$ proportional to $1 + I\boldsymbol{\sigma}_3$),
the eigenvalue is $\hbar/2$. Spin-up.

The bivector $I\boldsymbol{\sigma}$ is the geometric-algebra
realization of the spin-angular-momentum operator. It's a
**bivector** (not a vector!), reflecting that angular momentum is
fundamentally an oriented-plane quantity.

> :mathgoose: $\hat{\mathbf{S}} = \hbar I\boldsymbol{\sigma}/2$.
> A bivector — same as orbital angular momentum $\mathbf{L} = r\wedge p$
> (also a bivector). Both are bivectors, both contribute to the
> total $\mathbf{J} = \mathbf{L} + \mathbf{S}$. The "spin is
> angular momentum" claim is more than just heuristic — they're
> the *same* GA grade.

## 7. Spinor density and probability

The probability density at a point is

$$\rho(\mathbf{x}) = \psi\tilde{\psi}$$

— the scalar product of $\psi$ with its reverse. This is always
non-negative (for an even multivector, $\psi\tilde{\psi}$ is a
positive scalar), so the probability interpretation works.

The total probability is

$$\int \psi\tilde{\psi}\,d^3x = 1$$

— normalization. For a stationary state, this is conserved by the
Pauli equation (the continuity equation $\partial\rho/\partial t + \nabla\cdot\mathbf{j} = 0$
falls out of the Pauli equation just as it does in conventional QM).

## 8. The Stern-Gerlach experiment

A magnetic-field gradient $\nabla\mathbf{B}$ exerts a force on the
spinor's magnetic moment:

$$\mathbf{F} = \mu_B \nabla(\mathbf{B}\cdot\langle I\boldsymbol{\sigma}\rangle_\psi)$$

For a spinor in an eigenstate of $\boldsymbol{\sigma}_z$, the force
is $\mu_B \partial_z B_z$ — pushing the particle either up or down
depending on the spin direction. Stern-Gerlach 1922 (now famous):
silver atoms passing through an inhomogeneous magnetic field split
into two beams, confirming the quantization of spin.

In GA, this is straightforward — the spinor's "alignment" with
$\boldsymbol{\sigma}_z$ is an algebraic fact that determines the
sign of the force, with no quantum-mystery interpretation needed.

## 9. The two-state system and quantum coin flips

A spinor $\psi$ with general bivector content can be projected onto
"up" and "down" eigenstates of any $\boldsymbol{\sigma}_i$:

$$\psi = \psi_\uparrow + \psi_\downarrow$$

with $|\psi_\uparrow|^2 = $ probability of measuring up,
$|\psi_\downarrow|^2 = $ probability of down. The state $\psi$ is
the **complete description**; measurements project onto the
eigenstates probabilistically.

This is the GA realization of the "Bloch sphere" picture: any pure
spin-1/2 state corresponds to a point on the unit sphere in 3D,
and the rotor group $\mathrm{Spin}(3)$ acts on these states by
left-multiplication.

> :angrygoose: Pauli matrices "feel weird" because they're
> introduced as abstract algebraic generators with no geometric
> interpretation. GA shows they're just the basis vectors of 3D
> space, with the matrix-product being the geometric product. Once
> you see that, "spin-1/2" loses most of its mystery — it's
> rotors acting on themselves, with the half-angle exposing the
> double-cover structure.

## What we covered

- Pauli spinors are even-grade multivectors of $\mathcal{Cl}(3,0)$:
  $\psi = \alpha + B$ with 4 real parameters.
- The "imaginary $i$" of quantum mechanics is the pseudoscalar $I$
  (with $I^2 = -1$).
- Pauli matrices = basis vectors $\boldsymbol{\sigma}_i$; matrix
  product = geometric product.
- Spinors rotate by left multiplication, $\psi \to R\psi$, picking
  up the $-1$ under $2\pi$ rotation.
- Pauli equation in GA form: $\partial_t\psi I\hbar = \frac{1}{2m}(\nabla - eA)^2\psi - \mu_B\mathbf{B}\psi + e\phi\psi$.
- Spin operator $\hat{\mathbf{S}} = \hbar I\boldsymbol{\sigma}/2$ —
  a bivector.
- Probability density $\rho = \psi\tilde{\psi}$; Stern-Gerlach as
  a bivector-projection experiment.

## What's next

[Chapter 19](/physics-ga/part-5-quantum/relativistic-quantum-states) —
relativistic quantum states. The transition to Dirac spinors in STA:
even multivectors of $\mathcal{Cl}(1,3)$, with 8 real parameters
encoding the 4-component complex Dirac spinor.
