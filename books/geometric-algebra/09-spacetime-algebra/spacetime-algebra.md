---
sidebar_position: 1
title: "Spacetime Algebra — One Minus Sign for Time"
---

# Spacetime Algebra — One Minus Sign for Time

Every algebra in this book has been Euclidean: all basis vectors square to
$+1$. Flip *one* of them to $-1$ — give time the opposite sign from space —
and you get **Spacetime Algebra** (STA), the geometric algebra of special
relativity. The signature $Cl(1,3)$ is the whole of Minkowski spacetime,
and out of it, with no new machinery, fall the Lorentz transformations,
the electromagnetic field as a single object, and even the Dirac equation.

> :angrygoose: Relativity gets taught as a wall of index gymnastics —
> four-vectors with raised and lowered $\mu$'s, the metric tensor
> $\eta_{\mu\nu}$ sprinkled everywhere to flip signs by hand, Lorentz
> transformations as $4\times4$ matrices you multiply and pray. It works,
> and it's miserable, and it hides the geometry. STA says: it's the *same*
> geometric algebra you already know, with one basis vector squaring to
> $-1$. The metric isn't a tensor you carry around — it's the signature.
> The Lorentz transformations aren't matrices — they're *rotors*. Same
> framework, the relativity falls out.

## The signature: $Cl(1,3)$

Spacetime has four dimensions — one time, three space — and the defining
feature is that time and space enter the *metric* with opposite signs.
STA captures this with four basis vectors $\gamma_0, \gamma_1, \gamma_2,
\gamma_3$ (the **gamma**s, by tradition) and the signature $Cl(1,3)$:

$$
\gamma_0^2 = +1, \qquad \gamma_1^2 = \gamma_2^2 = \gamma_3^2 = -1.
$$

$\gamma_0$ is the **time** direction (squares $+1$); the $\gamma_i$ are
**space** (square $-1$). That single sign difference *is* the geometry of
relativity — the reason there's a light cone, a finite speed limit, and a
distinction between "timelike" and "spacelike." We don't bolt on a metric
tensor; the metric is the squares of the basis vectors, exactly as in every
earlier section. (The opposite convention, $Cl(3,1)$ with space $+1$, works
too — it's a taste, like which way you orient an axis.)

## The 16 elements

Four generators give $2^4 = 16$ basis blades, and their grade structure is
the cast of characters for all of relativistic physics:

| grade | count | the elements | what they are |
|-------|-------|--------------|---------------|
| 0 | 1 | $1$ | scalars |
| 1 | 4 | $\gamma_\mu$ | **four-vectors** (events, momenta) |
| 2 | 6 | $\gamma_\mu\gamma_\nu$ | **bivectors** (boosts + rotations, the EM field) |
| 3 | 4 | $\gamma_\mu\gamma_\nu\gamma_\rho$ | trivectors (dual vectors) |
| 4 | 1 | $I = \gamma_0\gamma_1\gamma_2\gamma_3$ | the **pseudoscalar** |

The grade-1 vectors are spacetime four-vectors — an event, a four-velocity,
a four-momentum. The **bivectors** are the stars (next section). And the
pseudoscalar $I = \gamma_0\gamma_1\gamma_2\gamma_3$ satisfies $I^2 = -1$ and
*anticommutes* with vectors — it'll play the role of the imaginary unit
when we get to the Dirac equation.

## The six bivectors split into two kinds

The grade-2 bivectors are where relativity lives, and they come in **two
flavors** distinguished by how they square — which is the algebra telling
you the difference between *space* and *spacetime*:

- **Timelike bivectors** $\gamma_i\gamma_0$ (mixing time and a space
  direction) square to **$+1$**:
  $(\gamma_1\gamma_0)^2 = -\gamma_1^2\gamma_0^2 = -(-1)(+1) = +1.$
  These generate **boosts** (changes of velocity).
- **Spacelike bivectors** $\gamma_i\gamma_j$ (two space directions) square
  to **$-1$**:
  $(\gamma_1\gamma_2)^2 = -\gamma_1^2\gamma_2^2 = -(-1)(-1) = -1.$
  These generate ordinary **rotations**.

Three of each — three boost planes, three rotation planes — six bivectors
total, the six "components" of the electromagnetic field and the six
parameters of the Lorentz group. And the sign of the square decides the
geometry: a $-1$ bivector exponentiates to a *circular* rotation
($\cos/\sin$), a $+1$ bivector to a *hyperbolic* boost ($\cosh/\sinh$) —
the same $\exp$ behavior the calculus part flagged
([grad/div/curl](/geometric-algebra/geometric-calculus/grad-div-curl-unified)),
now telling space apart from time.

> :surprisedgoose: A **boost is a rotation** — a rotation in a plane that
> contains the time direction. That's the single most clarifying idea in
> special relativity, and STA states it as a triviality: spatial rotations
> live in spacelike bivectors (square $-1$, so they're *circular*), boosts
> live in timelike bivectors (square $+1$, so they're *hyperbolic*). The
> "weirdness" of relativity — that boosting doesn't just add velocities,
> that there's a $\gamma$-factor, that simultaneity is relative — is
> exactly the difference between a hyperbolic rotation and a circular one.
> Minkowski said spacetime was a kind of rotation geometry a century ago;
> STA is the algebra where that's not a slogan but the literal structure.

## Why this matters

Before we build anything, the promise of the part. From this one
signature, by reusing machinery you already have:

- **Lorentz transformations are rotors** — $L = \exp(B/2)$ for a bivector
  $B$ — applied by the sandwich, composed by multiplication. Boosts and
  rotations, unified, no matrices
  ([boosts & the Lorentz group](/geometric-algebra/spacetime-algebra/boosts-and-the-lorentz-group)).
- **3D physics emerges by a "spacetime split"** — pick an observer
  $\gamma_0$ and ordinary 3D vector algebra falls out as the even
  subalgebra ([the spacetime split](/geometric-algebra/spacetime-algebra/the-spacetime-split)).
- **Electromagnetism is one bivector and one equation** — $\nabla F = J$
  ([spacetime EM & Dirac](/geometric-algebra/spacetime-algebra/spacetime-em-and-dirac)).
- **The Dirac equation** — the relativistic electron, spinors and all — is
  a real equation in STA, with the mysterious imaginary unit of quantum
  mechanics revealed as a *bivector*.

All of it from "let one basis vector square to $-1$." That's the reach of a
single sign.

> :weightliftinggoose: The whole part rests on one move: **Spacetime
> Algebra is $Cl(1,3)$** — four gammas, $\gamma_0^2 = +1$ (time),
> $\gamma_i^2 = -1$ (space). The **metric is the signature**, not a tensor
> you sprinkle. The **six bivectors** are the engine room: three
> **timelike** ($\gamma_i\gamma_0$, square $+1$) generating **boosts**
> (hyperbolic), three **spacelike** ($\gamma_i\gamma_j$, square $-1$)
> generating **rotations** (circular). Carry the one-sentence summary —
> *a boost is a hyperbolic rotation in a time-containing plane* — and the
> rest of relativity is just working that out in an algebra you already
> know.

## Closing the section

Relativity is GA with one sign flipped:

- **STA** is $Cl(1,3)$: $\gamma_0^2 = +1$ (time), $\gamma_i^2 = -1$ (space)
  — the **metric is the signature**.
- 16 blades: scalars, **four-vectors** (grade 1), **six bivectors** (grade
  2), trivectors, and the **pseudoscalar** $I$ ($I^2 = -1$).
- The bivectors split: **timelike** ($\gamma_i\gamma_0$, square $+1$,
  **boosts**) vs **spacelike** ($\gamma_i\gamma_j$, square $-1$,
  **rotations**) — *a boost is a hyperbolic rotation*.
- From this one signature: Lorentz rotors, the spacetime split, EM as
  $\nabla F = J$, and the Dirac equation.

But how does ordinary 3D physics — the vectors and rotations of the earlier
sections — live inside this four-dimensional spacetime algebra? Through a
beautiful construction called the **spacetime split**: pick an observer,
and 3D GA appears as the even subalgebra. That's next.
