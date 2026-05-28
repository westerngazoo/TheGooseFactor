---
sidebar_position: 1
title: "The STA Basis and Signature (+,−,−,−)"
---

# The STA Basis and Signature $(+,-,-,-)$

> *Doran-Lasenby §5.1.* The transition from Euclidean GA to spacetime
> algebra. One sign change in the defining rule produces all of
> special relativity.

Everything in Parts I and II used the Euclidean rule $e_i^2 = +1$.
Spacetime algebra (STA) starts from one change: pick a *timelike*
basis vector and let it square to $+1$, while the spatial vectors
square to $-1$. The rest of the formalism survives unchanged. The
result is that rotors become Lorentz transformations and bivectors
become the electromagnetic field — all of relativistic physics
falls out of an algebra you already know.

## 1. The defining rule for $\mathcal{Cl}(1,3)$

Choose four basis vectors $\{\gamma_0, \gamma_1, \gamma_2, \gamma_3\}$
satisfying

$$\boxed{\; \gamma_0^2 = +1, \qquad \gamma_i^2 = -1\;\;(i=1,2,3), \qquad \gamma_\mu\gamma_\nu = -\gamma_\nu\gamma_\mu \;\;(\mu \ne \nu) \;}$$

The Cambridge / Doran-Lasenby signature is $(+,-,-,-)$. The other
common choice — Misner-Thorne-Wheeler — uses $(-,+,+,+)$, with the
opposite sign convention; both yield the same physics, but the
algebra carries extra signs depending on which choice you make.
This book uses the D-L convention throughout.

The notation $\gamma_\mu$ is deliberately chosen to remind you of
the **Dirac gamma matrices** from relativistic quantum mechanics —
the basis of STA *is* the abstract structure that Dirac matrices
realize concretely. In [Part V](/physics-ga/part-5-quantum/coming-soon)
we'll see that Dirac's formulation falls out of STA naturally.

> :nerdygoose: The $\gamma$ notation is also Hestenes' original
> choice from the 1960s. He saw the connection to Dirac
> immediately and used it to argue that GA is the natural language
> for relativistic physics. The argument took 60 years to gain
> traction — but the notation never changed.

## 2. The 16 basis blades

STA has $2^4 = 16$ basis blades, organized by grade:

| Grade | Name | Dimension | Basis |
|---|---|---|---|
| 0 | scalar | 1 | $1$ |
| 1 | vector | 4 | $\gamma_0, \gamma_1, \gamma_2, \gamma_3$ |
| 2 | bivector | 6 | $\gamma_{01}, \gamma_{02}, \gamma_{03}, \gamma_{12}, \gamma_{13}, \gamma_{23}$ |
| 3 | trivector | 4 | $\gamma_{012}, \gamma_{013}, \gamma_{023}, \gamma_{123}$ |
| 4 | pseudoscalar | 1 | $I = \gamma_0\gamma_1\gamma_2\gamma_3$ |

The notation $\gamma_{\mu\nu} := \gamma_\mu \gamma_\nu$ (for
$\mu < \nu$) is the standard shorthand.

The **pseudoscalar** $I$ satisfies

$$I^2 = (\gamma_0\gamma_1\gamma_2\gamma_3)^2 = -1$$

(work it out: anti-commuting through, $\gamma_0^2 \gamma_1^2 \gamma_2^2 \gamma_3^2$
times sign factors gives $(+1)(-1)(-1)(-1)\cdot(\text{sign}) = -1$).
So $I$ in STA also squares to $-1$, just like the 3D pseudoscalar
from [Ch 1](/physics-ga/part-1-foundations/ga-in-60-seconds).
This is **not** a coincidence — both are top-grade elements of
their algebras, and the sign of their square is determined by the
signature.

A subtlety: in STA, $I$ does **not** commute with vectors. We have

$$\gamma_\mu I = (-1)^{n-1} I \gamma_\mu \quad\text{for } n=4 \text{ basis vectors}$$

so $\gamma_\mu I = -I \gamma_\mu$ — they **anti-commute**. (In 3D
GA, $I$ commutes with vectors. The parity of $n-1$ flips between
even and odd algebras.) This anti-commutation is responsible for
the chirality structure of STA and will be central in Dirac theory.

## 3. The two bivector classes

The 6 STA bivectors split into two distinct classes based on the
sign of their square:

**Spacelike bivectors** $\gamma_{ij}$ for $i,j \in \{1,2,3\}$:

$$\gamma_{12}^2 = \gamma_1\gamma_2\gamma_1\gamma_2 = -\gamma_1^2\gamma_2^2 = -(-1)(-1) = -1$$

These are the "spatial rotation" bivectors — they square to $-1$,
just like the 3D rotation bivectors. There are $\binom{3}{2} = 3$
of them.

**Timelike bivectors** $\gamma_{0i}$ for $i \in \{1,2,3\}$:

$$\gamma_{01}^2 = \gamma_0\gamma_1\gamma_0\gamma_1 = -\gamma_0^2\gamma_1^2 = -(+1)(-1) = +1$$

These square to $+1$. There are 3 of them, one per spatial direction.

The 6 STA bivectors thus generate a **6-parameter** family of
transformations:

- 3 **rotations** (spacelike bivectors, $B^2 = -1$ giving
  $\exp(B\theta) = \cos\theta + B\sin\theta$).
- 3 **boosts** (timelike bivectors, $B^2 = +1$ giving
  $\exp(B\phi) = \cosh\phi + B\sinh\phi$).

Together: the **Lorentz group** $SO(1,3)$, with the rotors forming
its double cover $\mathrm{Spin}(1,3) = SL(2,\mathbb{C})$.

> :surprisedgoose: A Lorentz boost is the same algebraic object as
> a spatial rotation. Both are rotors of the form $\exp(B/2)$. The
> only difference is the sign of $B^2$, which controls whether the
> exponential gives trig or hyperbolic functions. Special
> relativity is one sign change away from classical mechanics.

## 4. Relative vectors and the 3D substructure

Pick an observer with 4-velocity $\gamma_0$ — meaning we choose a
particular timelike direction as "the time axis." Define **relative
vectors** for this observer:

$$\boxed{\; \boldsymbol{\sigma}_i := \gamma_i \gamma_0 \;}$$

These are STA bivectors, but they have spatial-rotation character:

$$\boldsymbol{\sigma}_i^2 = \gamma_i\gamma_0\gamma_i\gamma_0 = -\gamma_i^2\gamma_0^2 = -(-1)(+1) = +1$$

Wait — they square to $+1$, not $-1$. The $\boldsymbol{\sigma}_i$
are the **boost-bivectors $\gamma_{0i}$ with a sign**:

$$\boldsymbol{\sigma}_i = -\gamma_{0i} = \gamma_i\gamma_0$$

And the relative vectors *anti-commute* among themselves:

$$\boldsymbol{\sigma}_i\boldsymbol{\sigma}_j = -\boldsymbol{\sigma}_j\boldsymbol{\sigma}_i \quad (i \ne j), \qquad \boldsymbol{\sigma}_1\boldsymbol{\sigma}_2\boldsymbol{\sigma}_3 = I$$

— exactly the **Pauli matrix** algebra. The relative-vector
substructure of STA is isomorphic to $\mathcal{Cl}(3,0)$ — the 3D
geometric algebra of Parts I-II. This is the bridge: classical
3D physics lives inside STA as the algebra of an observer's
"spatial" relative-vector basis.

> :happygoose: The Pauli algebra is *not* a separate thing in
> physics — it's the rest-frame relative-vector algebra of STA,
> identified by the choice of $\gamma_0$. Different observers,
> different $\gamma_0$, different "Pauli" substructures, but the
> underlying STA is observer-independent. The split into "space
> and time" is something *we* impose; STA doesn't care.

## 5. The metric as a tensor-free object

The Minkowski metric in tensor language:

$$\eta_{\mu\nu} = \mathrm{diag}(+1, -1, -1, -1)$$

In GA, this is just the inner product:

$$\eta_{\mu\nu} = \gamma_\mu \cdot \gamma_\nu$$

— the table of scalar parts of $\gamma_\mu \gamma_\nu$. No
"raising" or "lowering" indices as a separate operation; the
metric **is** the inner product, which is **the grade-0 part of
the geometric product**.

For a 4-vector $x = x^\mu \gamma_\mu$ (with the Einstein convention
on the implicit sum), the invariant interval is

$$x^2 = x\cdot x = (x^0)^2 - (x^1)^2 - (x^2)^2 - (x^3)^2$$

— Minkowski's spacetime interval. Timelike ($x^2 > 0$), null
($x^2 = 0$), and spacelike ($x^2 < 0$) classifications fall out
directly.

## 6. The reciprocal frame

The reciprocal basis $\gamma^\mu$ is defined by $\gamma^\mu \cdot \gamma_\nu = \delta^\mu_\nu$.
With our metric:

$$\gamma^0 = \gamma_0, \qquad \gamma^i = -\gamma_i \quad (i = 1,2,3)$$

Or equivalently, $\gamma^\mu = \eta^{\mu\nu}\gamma_\nu$ — the
metric-raised version of the basis. Tensor-language
"contravariant/covariant" is GA's "frame/reciprocal-frame"
split, exactly as in [Ch 3](/physics-ga/part-1-foundations/frames-components-and-tensor-free-linear-algebra).

A 4-vector has components in both bases:

$$x = x^\mu \gamma_\mu = x_\mu \gamma^\mu, \qquad x_\mu = \eta_{\mu\nu} x^\nu$$

Standard physics-grad notation reproduced exactly; we just labeled
things consistently.

## 7. Worked example: Minkowski rotations

Take two vectors $a, b$ in STA and compute their geometric product.
Set $a = a^0\gamma_0 + a^i\gamma_i$ and similarly for $b$. The
inner product (scalar part) is

$$a\cdot b = a^0 b^0 - a^i b^i$$

The wedge (bivector part) is

$$a\wedge b = (a^0 b^i - a^i b^0)\gamma_0\gamma_i + (a^i b^j - a^j b^i)\gamma_i\gamma_j/2$$

This splits the wedge into a **timelike bivector part** (involving
$\gamma_0\gamma_i$) and a **spacelike bivector part** (involving
$\gamma_i\gamma_j$). In terms of an observer with 4-velocity
$\gamma_0$, the timelike part is the "electric" piece of $a\wedge b$
and the spacelike part is the "magnetic" piece — exactly the
$\mathbf{E}$ and $\mathbf{B}$ decomposition of the
electromagnetic field bivector in [Ch 13](/physics-ga/part-4-electromagnetism/maxwell-equations).

The lesson: **any** bivector in STA splits into electric (timelike)
and magnetic (spacelike) parts relative to an observer. The split
depends on the observer; the bivector doesn't.

> :angrygoose: "Magnetic field" and "electric field" are
> observer-dependent labels for the timelike and spacelike parts
> of an observer-independent bivector. Generations of physicists
> learned them as separate fields because the 4-vector picture of
> relativity arrived in 1905 but the bivector picture didn't get
> textbook-level treatment until the 1990s. STA gives the right
> picture from day one.

## 8. The dual operation in STA

Multiplying any blade by $I$ produces its **dual**. In STA:

- $\gamma_0 I = \gamma_0\gamma_0\gamma_1\gamma_2\gamma_3 = \gamma_1\gamma_2\gamma_3$ — a trivector
- $\gamma_1 I = \gamma_1\gamma_0\gamma_1\gamma_2\gamma_3 = -\gamma_0\gamma_2\gamma_3$ — also a trivector
- $\gamma_{12} I = \gamma_{12}\gamma_{0123} = \gamma_{03}$ (after sign-tracking) — a bivector

The pattern: $I$ maps grade $k$ to grade $4-k$. The grade-1 dual
(vectors $\leftrightarrow$ trivectors) and the grade-2 dual
(bivectors $\leftrightarrow$ bivectors) are central in [Ch 11](/physics-ga/part-3-spacetime-algebra/lorentz-group-structure)
when we look at the structure of the Lorentz group.

In particular, $I$ acts as the **Hodge star** in 4D, and it
implements the swap between $\mathbf{E}$ and $\mathbf{B}$ in
electromagnetism (the **dual electromagnetic field**
$\tilde{F} = FI$ swaps $\mathbf{E}\leftrightarrow \mathbf{B}$
modulo signs).

## What we covered

- The STA defining rule: $\gamma_0^2 = +1$, $\gamma_i^2 = -1$,
  $\gamma_\mu\gamma_\nu = -\gamma_\nu\gamma_\mu$.
- 16 basis blades across 5 grades; pseudoscalar $I^2 = -1$.
- Bivectors split into 3 spacelike (rotation) + 3 timelike (boost).
- Relative vectors $\boldsymbol{\sigma}_i = \gamma_i\gamma_0$
  generate a Pauli-algebra rest-frame substructure.
- Metric, reciprocal frame, and index conventions reproduce
  standard relativistic tensor notation but as GA-native objects.

## What's next

[Chapter 9](/physics-ga/part-3-spacetime-algebra/observers-trajectories-frames) —
observers, trajectories, and the 4-velocity / proper-time
framework. We pick a worldline through STA and learn to project
spacetime objects onto an observer's rest frame.
