---
sidebar_position: 3
title: "Lorentz Transformations as Rotors"
---

# Lorentz Transformations as Rotors

> *Doran-Lasenby §5.3.* The Lorentz group as the rotor group of STA.
> Boosts and rotations are both sandwiches by even-grade multivectors;
> the same formulas that handled 3D rotation now handle relativity.

The Lorentz group is the symmetry group of Minkowski spacetime —
the transformations that preserve $x^2 = x\cdot x$. In tensor
language it's a 4×4 matrix group with painful sign-tracking. In
STA it's the rotor group of $\mathcal{Cl}(1,3)$, and every Lorentz
transformation is the sandwich $v \mapsto RvR^{-1}$ for some rotor
$R = \exp(B/2)$.

## 1. The rotor group of STA

From [Ch 1 §3](/physics-ga/part-1-foundations/ga-in-60-seconds) and
[Ch 2 §4](/physics-ga/part-1-foundations/reflections-rotations-and-the-sandwich),
the rotors of any Clifford algebra are unit even-grade elements
under the geometric product:

$$\mathrm{Spin}(p,q) = \{R \in \mathcal{Cl}^{+}(p,q) : R\tilde{R} = 1\}$$

In STA, the even subalgebra $\mathcal{Cl}^+(1,3)$ has 8 real
dimensions:

- 1 scalar
- 6 bivectors (3 spacelike + 3 timelike from [Ch 8 §3](/physics-ga/part-3-spacetime-algebra/sta-basis-and-signature))
- 1 pseudoscalar $I$

A general rotor

$$R = \alpha + B + \beta I$$

with $\alpha,\beta$ scalars and $B$ a bivector, satisfying
$R\tilde{R} = 1$. The constraint kills 1 parameter, leaving the
**6-parameter Lorentz group**: 3 boosts + 3 rotations. The same
6-parameter family as the bivector space — because every rotor is
$\exp(B/2)$ for some bivector $B$.

> :nerdygoose: The pseudoscalar coefficient $\beta$ is normally
> kept as zero — pure $\exp(B/2)$ rotors. Including $\beta \ne 0$
> gives **chirality-flipped** rotors that mix in a parity reversal.
> Most physics uses the connected component $\{R = \exp(B/2)\}$;
> the full Lorentz group $O(1,3)$ includes the disconnected pieces
> (parity, time-reversal, parity+time-reversal).

## 2. Spatial rotations

For a bivector $B = \theta\,\boldsymbol{\sigma}\,I$ where
$\boldsymbol{\sigma}$ is a relative-vector unit-bivector axis
(spatial), we have $B^2 = -\theta^2$ (negative — spacelike
bivector). The rotor is

$$R = \exp(B/2) = \cos(\theta/2) + B\sin(\theta/2)/\theta$$

— a pure 3D rotation by angle $\theta$ around axis
$\boldsymbol{\sigma}$. The sandwich $v \to RvR^{-1}$ rotates the
spatial part of $v$ and leaves $v\cdot\gamma_0$ unchanged.

These are the rotors we'd have written in 3D Euclidean GA — they
live in the rest-frame Pauli subalgebra of STA.

## 3. Boosts

For a bivector $B = \phi\,\hat{n}\gamma_0$ where $\hat{n}$ is a
spatial unit vector and $\phi$ is the rapidity, $B^2 = +\phi^2$
(positive — timelike bivector). The rotor is

$$R = \exp(B/2) = \cosh(\phi/2) + B\sinh(\phi/2)/\phi$$

— a **Lorentz boost** with rapidity $\phi$ in direction $\hat{n}$.

The rapidity is related to the velocity by

$$\tanh\phi = \beta = u/c, \qquad \cosh\phi = \gamma, \qquad \sinh\phi = \gamma\beta$$

Boosting $\gamma_0$ in the $\gamma_1$ direction:

$$R\gamma_0\tilde{R} = \cosh\phi\,\gamma_0 + \sinh\phi\,\gamma_1 = \gamma(\gamma_0 + \beta\gamma_1)$$

— the standard Lorentz-transformed 4-velocity.

> :happygoose: Rapidities **add** under composed boosts in the
> same direction: $\phi_{\rm total} = \phi_1 + \phi_2$. Velocities
> don't. This is why rapidities are the natural parameter — the
> rotor product $R_2 R_1 = \exp(\phi_2 B/2)\exp(\phi_1 B/2) = \exp((\phi_1+\phi_2) B/2)$
> respects the group law cleanly when $B$ commutes with itself
> (i.e., colinear boosts).

## 4. Velocity addition

For colinear boosts:

$$\tanh\phi_{\rm total} = \tanh(\phi_1 + \phi_2) = \frac{\tanh\phi_1 + \tanh\phi_2}{1 + \tanh\phi_1\tanh\phi_2}$$

which is **Einstein's velocity-addition formula**

$$\beta_{\rm total} = \frac{\beta_1 + \beta_2}{1 + \beta_1\beta_2}$$

For non-colinear boosts, the composition is not a pure boost — it
includes a rotation (the Wigner rotation). This **Thomas
precession** (from [Ch 9 §6](/physics-ga/part-3-spacetime-algebra/observers-trajectories-frames))
falls out as the bivector mismatch between two non-colinear boost
bivectors.

Algebraically: if $B_1$ and $B_2$ are two boost bivectors in
different directions, $[B_1, B_2]$ is a **spatial-rotation
bivector**. The composed rotor $\exp(B_2/2)\exp(B_1/2)$ doesn't
simplify cleanly via BCH — the extra rotation term arises from
the non-commutativity.

## 5. The matrix of a Lorentz rotor

For comparison with tensor methods, the matrix elements of a
Lorentz transformation are

$$\Lambda^\mu{}_\nu = \gamma^\mu \cdot (R\gamma_\nu\tilde{R})$$

For a boost in the $\gamma_1$ direction:

$$\Lambda = \begin{pmatrix} \cosh\phi & \sinh\phi & 0 & 0 \\ \sinh\phi & \cosh\phi & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

— the standard textbook Lorentz boost matrix. The mapping is
$1 \to 1$: every Lorentz matrix corresponds to a unique
$\pm R$ pair in $\mathrm{Spin}(1,3)$ (the $\pm$ is the double
cover).

The point of the GA formulation isn't that it gives different
matrices — it's that you **don't compute the matrices in the
first place**. The rotor $R$ acts on objects directly via
sandwiching, and rotor products give composed transformations
without matrix multiplication.

> :mathgoose: $\mathrm{Spin}(1,3)$ is double-covered by
> $SL(2,\mathbb{C})$ — the group of complex 2×2 matrices with
> determinant 1. This is the GA-native realization: the even
> subalgebra $\mathcal{Cl}^+(1,3)$ is isomorphic to the
> $2\times 2$ complex matrices. Pauli's formulation of spinors
> via 2-component complex vectors is exactly the rotor group of
> STA acting on the relative-vector subalgebra.

## 6. The four-vector transformation law

For a 4-vector $a$, the Lorentz-transformed version is

$$a' = R a \tilde{R}$$

A scalar (grade 0) is unchanged: $a' = a$.

A bivector $F$ transforms identically:

$$F' = R F \tilde{R}$$

This is **why** the electromagnetic field bivector $F$ has the
same transformation law as anything else in STA — the sandwich
acts uniformly across grades, because $\underline{R}(M) = R M \tilde{R}$
is the outermorphism extension from [Ch 3 §3](/physics-ga/part-1-foundations/frames-components-and-tensor-free-linear-algebra).

The electric and magnetic field components transform under boosts
because they're observer-dependent splits of $F$ — different
observers' projections of the same bivector. Their mixing law is
the same as the rotor sandwich; you don't need a separate
derivation.

## 7. Boost composition and the spin-1/2 connection

For spin-1/2 systems (which we'll do in [Part V](/physics-ga/part-5-quantum/coming-soon)),
$R$ acts not by sandwiching but by **direct multiplication**:

$$\psi' = R\psi$$

where $\psi$ is a multivector-valued spinor. A 2π rotation in 3D
gives $R = -1$, so $\psi \to -\psi$ — the famous spin-1/2 sign
change.

This is the **double cover**: $R = \exp(B/2)$ has period $4\pi$ as
$|B|$ increases, while the spatial rotation it implements has
period $2\pi$. Spinors (or rotors acting by direct multiplication)
"see" the half-angle structure; vectors (acted on by the sandwich)
see only the doubled angle.

GA shows this transparently: it's not "weird quantum-mechanical
behavior" — it's the algebraic structure of the rotor group made
visible.

## 8. The Galilean limit

Take the Lorentz boost rotor for small $\phi$:

$$R = 1 + \phi \hat{n}\gamma_0/2 + O(\phi^2)$$

Apply to a 4-velocity:

$$v' = R v \tilde{R} \approx v + \phi[\hat{n}\gamma_0, v]$$

For $v$ at rest ($v = \gamma_0$), the commutator gives
$\phi \hat{n}$ — exactly the Galilean velocity shift to first
order in $\phi$ (where $\phi \approx \beta = u/c$). The Lorentz
boost reduces to the Galilean boost at low speed, as it should.

GA makes this limit visible at the algebraic level: it's just
truncating the $\exp$ series.

> :weightliftinggoose: Special relativity in GA is special
> relativity in disguise. Same formulas, same predictions, same
> physics — but expressed in objects that generalize. The Galilean
> limit, the velocity-addition formula, time dilation, length
> contraction, Thomas precession — all fall out of $R = \exp(B/2)$
> with $B$ a bivector in STA.

## What we covered

- $\mathrm{Spin}(1,3)$ is the rotor group of STA — 6-parameter
  family $R = \exp(B/2)$.
- Spatial rotations come from spacelike bivectors ($B^2 < 0$,
  trigonometric exponential).
- Boosts come from timelike bivectors ($B^2 > 0$, hyperbolic
  exponential); rapidity adds for colinear boosts.
- Velocity-addition formula falls out of $\tanh(\phi_1 + \phi_2)$.
- Non-colinear boost composition contains a rotation — Thomas
  precession from the bivector commutator.
- Lorentz transformation matrices reproduce textbook formulas
  via $\Lambda^\mu{}_\nu = \gamma^\mu\cdot(R\gamma_\nu\tilde{R})$.
- Spinors transform by direct multiplication $\psi \to R\psi$
  — the half-angle visible at the algebraic level.

## What's next

[Chapter 11](/physics-ga/part-3-spacetime-algebra/lorentz-group-structure) —
the Lorentz group's structure in detail: identity component, parity,
time-reversal, the four-fold structure of $O(1,3)$. Plus the
Lie-algebra side: bivectors as the generators, commutation relations,
and the BCH formula in concrete form.
