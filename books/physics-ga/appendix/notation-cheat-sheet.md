---
sidebar_position: 1
title: "Appendix A — Notation Cheat Sheet"
---

# Appendix A — Notation Cheat Sheet

Quick reference for the GA notation used throughout this book. We
follow Doran-Lasenby (D-L) conventions; alternative conventions
from Hestenes' *Spacetime Algebra* and Lounesto's *Clifford
Algebras and Spinors* differ in some sign choices but are
otherwise compatible.

## Basis vectors

| Algebra | Basis | Squares |
|---|---|---|
| $\mathcal{Cl}(3,0)$ — 3D GA | $e_1, e_2, e_3$ | $e_i^2 = +1$ |
| $\mathcal{Cl}(1,3)$ — STA | $\gamma_0, \gamma_1, \gamma_2, \gamma_3$ | $\gamma_0^2 = +1, \gamma_i^2 = -1$ |
| Relative vectors (STA) | $\boldsymbol{\sigma}_i = \gamma_i\gamma_0$ | $\boldsymbol{\sigma}_i^2 = +1$ |

Anti-commutation: $e_i e_j = -e_j e_i$ for $i \ne j$, similarly
$\gamma_\mu\gamma_\nu = -\gamma_\nu\gamma_\mu$.

## Products

| Symbol | Name | Definition |
|---|---|---|
| $ab$ | Geometric product | The fundamental operation |
| $a \cdot b$ | Inner product | Scalar part of $ab$ (for vectors); $\langle ab\rangle_0$ |
| $a \wedge b$ | Outer / wedge product | Bivector part of $ab$; antisymmetric |
| $A \rfloor B$, $A \lfloor B$ | Contractions | Generalized inner products |
| $A \cdot B$ | Symmetric inner product | $(AB + BA)/2$ for blades |

For vectors: $ab = a\cdot b + a\wedge b$ is the cleanest formula.

## Grade projections

$\langle M \rangle_k$ extracts the grade-$k$ part of multivector
$M$. So $\langle ab\rangle_0 = a\cdot b$, $\langle ab\rangle_2 = a\wedge b$.

The full multivector decomposition:

$$M = \langle M\rangle_0 + \langle M\rangle_1 + \langle M\rangle_2 + \cdots$$

## Pseudoscalars

| Algebra | Symbol | Definition | Square |
|---|---|---|---|
| 3D | $I = e_1 e_2 e_3$ | top-grade element | $I^2 = -1$ |
| STA | $I = \gamma_0\gamma_1\gamma_2\gamma_3$ | top-grade element | $I^2 = -1$ |

In 3D, $I$ commutes with all vectors. In STA, $I$ **anti-commutes**
with vectors and commutes with bivectors. Same identification
"$I = i$" for the imaginary unit works in 3D; in STA it requires
care.

## Reverse and conjugation

The **reverse** $\tilde{M}$ flips the order of products in $M$.
For a $k$-blade: $\tilde{M} = (-1)^{k(k-1)/2} M$.

For a rotor: $R\tilde{R} = 1$ (unitarity in the GA sense).

The **grade involution** $\hat{M}$ negates odd-grade parts:
$\hat{a} = -a$ for vectors, $\hat{B} = B$ for bivectors.

The **Clifford conjugate** $\bar{M} = \hat{\tilde{M}}$ combines both.

## Rotors

| Concept | Formula |
|---|---|
| Rotor from bivector | $R = \exp(B/2)$ |
| Spatial rotation (3D) | $B^2 < 0$, $\exp(B/2) = \cos + \sin$ |
| Boost (STA) | $B^2 > 0$, $\exp(B/2) = \cosh + \sinh$ |
| Sandwich on vector | $v' = R v \tilde{R}$ |
| Sandwich on multivector | $M' = R M \tilde{R}$ (outermorphism) |
| Composition | $R = R_2 R_1$ |
| Time-derivative | $\dot{R} = \tfrac{1}{2}\Omega R$ with $\Omega = 2\dot{R}\tilde{R}$ |

## The vector derivative

| Symbol | Meaning |
|---|---|
| $\nabla = e^\mu \partial_\mu$ | Vector derivative |
| $\nabla\phi$ | Gradient (vector-valued) |
| $\nabla \cdot A$ | Divergence (scalar) |
| $\nabla \wedge A$ | Curl (bivector); = $I(\nabla\times A)$ in 3D |
| $\nabla A = \nabla\cdot A + \nabla\wedge A$ | Full geometric product |
| $\nabla^2 = \nabla\cdot\nabla$ | Scalar Laplacian / d'Alembertian |
| $a \cdot \nabla F$ | Directional derivative along $a$ |

## Important constants and conventions

- Speed of light: $c$ (often set to 1 in geometric units).
- Reduced Planck: $\hbar$ (sometimes set to 1).
- Cosmological signature: $(+,-,-,-)$ (D-L / Cambridge).
- Sign of $I^2$: $-1$ in both $\mathcal{Cl}(3,0)$ and $\mathcal{Cl}(1,3)$.
- Rotor convention: $R = \exp(B/2)$ (half-angle).

## Spinors

| Concept | Formula |
|---|---|
| Pauli spinor | $\psi \in \mathcal{Cl}^+(3,0)$ (4 real components) |
| Dirac spinor | $\psi \in \mathcal{Cl}^+(1,3)$ (8 real components) |
| Probability density | $\rho = \langle\psi\tilde{\psi}\rangle_0$ |
| Probability current (Dirac) | $J = \psi\gamma_0\tilde{\psi}$ (vector) |
| Spin operator (3D) | $\hat{S} = \tfrac{\hbar}{2}I\boldsymbol{\sigma}$ |
| Spinor rotation | $\psi \to R\psi$ (left multiplication) |
| Dirac equation (STA) | $\nabla\psi I\gamma_0 = m\psi$ |
