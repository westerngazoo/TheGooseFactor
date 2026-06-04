---
sidebar_position: 3
title: "Boosts and the Lorentz Group — Rotors in Spacetime"
---

# Boosts and the Lorentz Group — Rotors in Spacetime

A Lorentz transformation — the change between two observers in relative
motion — is taught as a $4\times4$ matrix bristling with $\gamma$-factors.
In STA it's a **rotor**: $L = \exp(B/2)$ for a spacetime bivector $B$,
applied by the same sandwich $L a \tilde L$ you've used since the rotors
section. Spatial rotations and velocity boosts are *both* rotors —
differing only in whether their bivector squares to $-1$ (circular) or
$+1$ (hyperbolic). Length contraction and time dilation fall out of
$\cosh$ and $\sinh$.

## A boost is a hyperbolic rotation

Take a **timelike** bivector — say $\hat{B} = \sigma_1 = \gamma_1\gamma_0$,
the plane of time and the $x$-direction. It squares to $+1$
([the bivector split](/geometric-algebra/spacetime-algebra/spacetime-algebra)),
so its exponential is **hyperbolic** (the $\cosh/\sinh$ branch of $\exp$):

$$
L = \exp\!\Big(\tfrac{\alpha}{2}\,\sigma_1\Big)
= \cosh\tfrac{\alpha}{2} + \sigma_1\sinh\tfrac{\alpha}{2}.
$$

The parameter $\alpha$ is the **rapidity**. Sandwich a spacetime vector
with $L$ and you boost it — mixing time and the $x$-direction by hyperbolic
functions, exactly the Lorentz boost. Compare with a spatial rotor $R =
\exp(-\tfrac\theta2\,\gamma_1\gamma_2) = \cos\tfrac\theta2 - \gamma_1\gamma_2
\sin\tfrac\theta2$ (spacelike bivector, squares $-1$, *circular*). Same
construction, $\exp$ of a bivector, applied by sandwich — the **only**
difference is the sign of the bivector's square, hence circular vs
hyperbolic. A boost *is* a rotation; it just rotates in a plane that
includes time.

## The $\gamma$-factor is just $\cosh$

The relation to the textbook quantities is clean. With rapidity $\alpha$:

$$
\tanh\alpha = \frac{v}{c} = \beta, \qquad
\cosh\alpha = \frac{1}{\sqrt{1-\beta^2}} = \gamma, \qquad
\sinh\alpha = \beta\gamma.
$$

The dreaded Lorentz factor $\gamma = 1/\sqrt{1-\beta^2}$ is simply
$\cosh\alpha$. Time dilation and length contraction are the $\cosh$ and
$\sinh$ of a hyperbolic rotation by the rapidity — the relativistic
$\gamma$ is a hyperbolic cosine, no more mysterious than $\cos$ being the
projection factor of an ordinary rotation. The "weird" relativistic
algebra was hyperbolic trigonometry the whole time.

> :surprisedgoose: **Velocities don't add — rapidities do.** The infamous
> relativistic velocity-addition formula, $w = (u+v)/(1+uv/c^2)$, is just
> the statement that *composing two boosts adds their rapidities*:
> $L_1 L_2 = \exp(\tfrac{\alpha_1}{2}\sigma)\exp(\tfrac{\alpha_2}{2}\sigma)
> = \exp(\tfrac{\alpha_1+\alpha_2}{2}\sigma)$, so $\alpha = \alpha_1 +
> \alpha_2$ — and that ugly fraction is precisely $\tanh(\alpha_1 +
> \alpha_2)$ expanded via the hyperbolic angle-addition identity. Rapidities
> compose by *addition* (like ordinary rotation angles), which is why
> they're the natural parameter; velocities compose by that nonlinear mess
> only because $v = \tanh\alpha$ is nonlinear. Boosts add like angles
> because boosts *are* rotations. The formula you memorized is $\tanh$ of a
> sum.

## The Lorentz group is rotors

Collect *all* the bivector exponentials and you get the whole **Lorentz
group**: every Lorentz transformation (rotation, boost, or combination) is
a rotor $L = \exp(B/2)$ for some spacetime bivector $B$, applied by the
sandwich $a \mapsto L a \tilde L$. Specifically:

- **Spatial rotations** — $B$ a spacelike bivector ($\gamma_i\gamma_j$),
  circular.
- **Boosts** — $B$ a timelike bivector ($\gamma_i\gamma_0$), hyperbolic.
- **General Lorentz transformations** — $B$ any bivector (a mix), giving
  combined boost-rotations.

The transformations **compose by multiplying rotors** ($L_2 L_1$) and
**invert by reversing** ($\tilde L$), associatively — exactly the rotor
group structure from the earlier sections, now over spacetime. This rotor
group is the **spin group** $\mathrm{Spin}(1,3)$, the double cover of the
Lorentz group (the same "$\theta/2$" double cover that gave spin-½ its
$720°$ — here it's why a Lorentz rotor uses *half* the rapidity). One
construction — $\exp$ a bivector, sandwich — and the entire relativity of
motion is in hand, matrices and metric tensors not required.

## Covariance, for free

Because Lorentz transformations are sandwiches by versors, **everything
transforms consistently** — the covariance that makes the framework usable.
A four-momentum, the electromagnetic field bivector (next chapter), a
spinor: each transforms by the *same* sandwich $L(\cdot)\tilde L$. Build a
physical quantity from spacetime objects, and it transforms correctly under
a change of observer automatically, because the rotor passes through
products and wedges (the same covariance we saw in CGA,
[conformal versors](/geometric-algebra/conformal-model/conformal-transformations-as-versors)).
"Write your physics in STA and it's manifestly Lorentz-covariant" isn't a
slogan — it's the statement that everything is a versor sandwich, so
everything co-transforms. That's the deepest practical reason to do
relativity in GA.

> :weightliftinggoose: Lorentz transformations are **rotors**: $L =
> \exp(B/2)$, sandwich to apply, multiply to compose — the rotor group of
> spacetime, $\mathrm{Spin}(1,3)$. The fork: **spacelike** bivector →
> **rotation** (circular, $\cos/\sin$); **timelike** bivector → **boost**
> (hyperbolic, $\cosh/\sinh$). The Lorentz factor $\gamma = \cosh\alpha$,
> and **rapidities add** ($\tanh$ of a sum *is* the velocity-addition
> formula). Best of all, **everything co-transforms** by the same sandwich,
> so STA physics is automatically covariant. Relativity of motion = rotor
> algebra in a $(+,-,-,-)$ signature. That's the whole of it.

## Closing the section

The change between observers is a rotor:

- A **Lorentz transformation** is a rotor $L = \exp(B/2)$, applied by the
  sandwich $L a \tilde L$ — **spatial rotations** (spacelike $B$, circular)
  and **boosts** (timelike $B$, hyperbolic) unified.
- A boost is a **hyperbolic rotation** by the **rapidity** $\alpha$; the
  Lorentz factor $\gamma = \cosh\alpha$, and **rapidities add** (the
  velocity-addition formula is $\tanh$ of a sum).
- The **Lorentz group** is the rotor group $\mathrm{Spin}(1,3)$ — compose
  by multiplication, invert by reversal — with the same half-angle double
  cover as spin.
- Everything **co-transforms** by the same sandwich, so STA is manifestly
  covariant.

We have spacetime, observers, and Lorentz rotors. The finale puts physics
on it: the **electromagnetic field** as a single bivector, **Maxwell's four
equations as one**, and the **Dirac equation** — the relativistic electron
— as a real equation in STA, with the quantum imaginary unit unmasked. That
crescendo closes the book.
