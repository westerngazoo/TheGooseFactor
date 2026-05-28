---
sidebar_position: 2
title: "Relativistic Quantum States"
---

# Relativistic Quantum States

> *Doran-Lasenby §8.3.* The transition from non-relativistic Pauli
> spinors to relativistic Dirac spinors. Both are even multivectors;
> only the algebra changes — $\mathcal{Cl}(3,0)$ to $\mathcal{Cl}(1,3)$.

The Pauli spinor of [Chapter 18](/physics-ga/part-5-quantum/non-relativistic-quantum-spin)
lives in $\mathcal{Cl}^+(3,0)$ — the even subalgebra of 3D
geometric algebra, with 4 real components. Its relativistic
generalization lives in $\mathcal{Cl}^+(1,3)$ — the even
subalgebra of spacetime algebra, with $2^4/2 = 8$ real components.
This 8-dimensional object packages the conventional 4-complex-component
Dirac spinor.

## 1. The even subalgebra of STA

From [Ch 8](/physics-ga/part-3-spacetime-algebra/sta-basis-and-signature),
STA's even subalgebra contains:

- 1 scalar
- 6 bivectors
- 1 pseudoscalar $I$

Total: 8 real dimensions. A Dirac spinor $\psi$ in GA is an arbitrary
element of $\mathcal{Cl}^+(1,3)$:

$$\psi = \alpha + B + \beta I$$

with $\alpha, \beta$ scalars and $B$ a (general) STA bivector.

The conventional Dirac spinor has 4 complex components — 8 real
numbers. Same dimensional content as the GA spinor, with the
identification:

- $\alpha$: "scalar" part of the complex wavefunction (essentially
  the "1" part of the matrix decomposition).
- $B$ (6 components): combinations of vectors $\boldsymbol{\sigma}_i$
  and pseudoscalar-vectors $I\boldsymbol{\sigma}_i$ that map to
  "Pauli-up", "Pauli-down" components.
- $\beta I$: the chirality-flipped "pseudoscalar" content.

## 2. The connection to relative-vector spinors

Recall from [Ch 8 §4](/physics-ga/part-3-spacetime-algebra/sta-basis-and-signature)
that relative vectors $\boldsymbol{\sigma}_i = \gamma_i\gamma_0$
satisfy the Pauli algebra. So the even subalgebra of STA contains
the Pauli-spinor algebra of $\mathcal{Cl}(3,0)$ — embedded.

But STA has **extra** structure: the pseudoscalar $I$ that anti-
commutes with vectors, and timelike-vector pieces $\gamma_0$ that
the 3D Pauli algebra doesn't see. A Dirac spinor is "twice" a
Pauli spinor in the sense that you can pair up its 8 real
components into a "Pauli-up" + "Pauli-down" pair (each 4-component).

The conventional decomposition

$$\psi_{\rm Dirac} = \begin{pmatrix} \psi_{\rm Pauli, +} \\ \psi_{\rm Pauli, -} \end{pmatrix}$$

— two Pauli spinors stacked — is the **Dirac-Pauli representation**.
In GA it's the projection of the STA-even spinor onto its
"$\gamma_0$-even" and "$\gamma_0$-odd" parts.

> :nerdygoose: The "two Pauli spinors" decomposition is the
> rest-frame picture: at rest, a Dirac spinor is just two Pauli
> spinors (one for "particle", one for "antiparticle"). The
> mixing of these two components by Lorentz boosts is what gives
> the Dirac equation its characteristic structure.

## 3. Plane-wave Dirac spinors

For free particles, plane-wave solutions of the Dirac equation
have the form

$$\psi(x) = u(p)\,\exp(-I p\cdot x/\hbar)$$

where $u(p)$ is a constant Dirac spinor (a constant STA even-grade
multivector) and $p$ is the 4-momentum, satisfying $p^2 = m^2$.

The constant spinor $u(p)$ satisfies an algebraic equation derived
from the Dirac equation (next chapter):

$$p u(p) = m\,u(p)\,\gamma_0$$

— a **vector-on-left, vector-on-right** equation in STA. Solutions
exist when $p^2 = m^2$ (the on-shell condition), and there are
**two linearly independent** $u$-spinors for each on-shell $p$ —
the spin-up and spin-down states.

The two "negative-energy" solutions (with $p^0 < 0$ in the
conventional Dirac matrix formalism) become **antiparticle**
plane-wave spinors $v(p)$ in the GA reformulation. They satisfy

$$p v(p) = -m\,v(p)\,\gamma_0$$

— sign on the right. The +/- choice classifies particle vs
antiparticle.

## 4. Lorentz transformation of Dirac spinors

A Lorentz transformation acts on Dirac spinors by left
multiplication:

$$\psi(x) \to \psi'(x) = R\,\psi(R^{-1}\,x\,R)$$

where $R \in \mathrm{Spin}(1,3)$ is the rotor that implements the
Lorentz transformation on vectors. The action on the spinor is
the same "left multiply" pattern as for Pauli spinors, but now $R$
can include boosts.

In the conventional Dirac formalism this is encoded by the 4×4
matrix representation of the spinor transformation:

$$S(\Lambda) = \exp(-i\sigma^{\mu\nu}\omega_{\mu\nu}/4)$$

with $\sigma^{\mu\nu} = \tfrac{i}{2}[\gamma^\mu, \gamma^\nu]$ the
spinor generators. In GA this is just $R = \exp(B/2)$ with $B$ a
bivector — the same formula as for vectors, with no separate
"spinor representation" to construct.

## 5. The bilinear forms

For a Dirac spinor $\psi$, we can construct **bilinear** scalars,
vectors, bivectors, and so on by combining $\psi$ with its
reverse and gamma matrices:

| Bilinear | GA Form | Tensor name | Physical meaning |
|---|---|---|---|
| $\rho$ | $\langle\psi\tilde{\psi}\rangle_0$ | scalar | probability density |
| $J^\mu$ | $\langle\psi\gamma^\mu\tilde{\psi}\rangle_1$ | 4-vector | current |
| $S^{\mu\nu}$ | $\langle\psi I\gamma^{\mu\nu}\tilde{\psi}\rangle_2$ | bivector | spin |
| $A^\mu$ | $\langle\psi I\gamma^\mu\tilde{\psi}\rangle_1$ | axial vector | chiral current |
| $\beta$ | $\langle\psi I\tilde{\psi}\rangle_4$ | pseudoscalar | $\bar\psi\gamma^5\psi$ |

These 16 = 1 + 4 + 6 + 4 + 1 real bilinear quantities are
**Fierz identities** in conventional Dirac-matrix theory. In GA
they're just grade projections of $\psi\tilde{\psi}\,X$ for
various $X$ from the algebra.

The conserved current is $J = \psi\gamma_0\tilde{\psi}$ — a
4-vector that satisfies $\nabla\cdot J = 0$ for any $\psi$
satisfying the Dirac equation. This is the **probability current**.

## 6. Chirality and the Weyl spinors

The pseudoscalar $I$ in STA anti-commutes with vectors but commutes
with bivectors. Define the **chiral projectors**:

$$P_R = \tfrac{1}{2}(1 + I), \qquad P_L = \tfrac{1}{2}(1 - I)$$

(where the factor of 2 is conventional). These project a Dirac
spinor into its **right-chirality** and **left-chirality** parts:

$$\psi = \psi_R + \psi_L, \qquad \psi_R = P_R \psi, \quad \psi_L = P_L \psi$$

Each "Weyl spinor" $\psi_R$ or $\psi_L$ has 4 real components (half
of the Dirac 8). They satisfy independent **Weyl equations** in the
massless limit ($m = 0$):

$$\nabla\psi_R\,\gamma_0 = 0, \qquad \nabla\psi_L\,\gamma_0 = 0$$

For massive Dirac particles, the mass term couples $\psi_R$ to
$\psi_L$ — the chirality eigenstates mix in time.

This is the GA realization of the **chiral structure** that's
central to particle physics: the weak interaction couples only
to left-chirality particles (and right-chirality antiparticles).
In the Standard Model, the chirality is observed and not
explained — it's a fundamental asymmetry of nature.

> :surprisedgoose: Maximum parity violation in the weak interaction
> was the great surprise of 1956 (Wu's experiment with Co-60). In
> GA, "left-chirality" and "right-chirality" are projections by
> the pseudoscalar — they're naturally distinct objects. The weak
> interaction coupling only $\psi_L$ is built into the Standard
> Model Lagrangian.

## 7. The Klein paradox and antimatter

For relativistic spin-1/2 particles, the Dirac equation has both
positive- and negative-energy solutions. Hole theory (Dirac 1930):
fill the negative-energy sea; vacancies look like positrons. This
predicts **antimatter** — Anderson confirmed in 1932 with the
discovery of the positron.

In GA, the positive-energy and negative-energy solutions are
the two values of $\pm$ in $p u = \pm m u \gamma_0$. Both are
needed for completeness; both must be included in any quantum
field theory.

The **Klein paradox** (electrons can "tunnel" through arbitrarily
high potential barriers if the barrier height exceeds $2mc^2$) is
the relativistic-tunneling phenomenon connecting these — the
barrier creates particle-antiparticle pairs that propagate through.

## 8. Spinor norms and inner products

The Lorentz-invariant inner product of two Dirac spinors is

$$\langle\psi|\phi\rangle := \langle\psi\,\gamma_0\,\tilde{\phi}\rangle_0$$

— a scalar. It's invariant under Lorentz transformations because
$\gamma_0$ is the timelike direction's basis vector, and the
combined transformation of $\psi$, $\gamma_0$, and $\tilde{\phi}$
preserves the scalar part.

For a single spinor, the **probability density** is
$\rho = \langle\psi\gamma_0\tilde{\psi}\rangle_0$. In conventional
notation, this is $\psi^\dagger\psi$ — the same quantity as
non-relativistic QM.

The **scalar product** is what counts probabilities and overlap
amplitudes. It's positive-definite, so the spinor space is a
genuine Hilbert space.

## What we covered

- Dirac spinors are elements of $\mathcal{Cl}^+(1,3)$ — the
  even subalgebra of STA — with 8 real components.
- The Dirac-Pauli decomposition: split into "$\gamma_0$-even" + 
  "$\gamma_0$-odd" parts, each a Pauli-style spinor.
- Plane-wave spinors satisfy $p u = m u \gamma_0$ (particle)
  and $p v = -m v \gamma_0$ (antiparticle).
- Lorentz transformation: $\psi \to R\psi$ with $R = \exp(B/2)$.
- 16 bilinear forms (scalar, vector, bivector, axial vector,
  pseudoscalar) realize the conventional Fierz identities.
- Chirality from the pseudoscalar: $P_{R,L} = \tfrac{1}{2}(1\pm I)$,
  giving Weyl spinors.
- Particle-antiparticle solutions exist as separate signs in
  $pu = \pm m u\gamma_0$.
- Probability density $\rho = \psi^\dagger\psi$ in the GA form
  $\rho = \langle\psi\gamma_0\tilde{\psi}\rangle_0$.

## What's next

[Chapter 20](/physics-ga/part-5-quantum/dirac-equation-in-sta) —
the Dirac equation itself, written in STA as one vector-equation:
$\nabla\psi I\gamma_0 = m\psi$. The form that lets you derive the
Dirac equation from a variational principle without ever picking a
matrix representation.
