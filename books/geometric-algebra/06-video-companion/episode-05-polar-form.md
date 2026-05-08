---
sidebar_position: 7
title: "Episode 5 — The Polar Form"
---

# Episode 5 — The Polar Form

> Watch on [YouTube](https://www.youtube.com/watch?v=u_OqOPwe3q4).

<iframe width="560" height="315" src="https://www.youtube.com/embed/u_OqOPwe3q4" title="The polar form of the geometric product" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## What it covers

The geometric product of two vectors expanded in *polar* form:

$$\mathbf{ab} = |\mathbf{a}||\mathbf{b}|(\cos\theta + \sin\theta\,\hat{\mathbf{B}})$$

where $\theta$ is the angle between the vectors and
$\hat{\mathbf{B}}$ is the unit bivector of their plane. This is
the same shape as $r e^{i\theta}$ for complex numbers, only with
a real bivector instead of an imaginary unit.

The video uses this to motivate exponential rotors, which is
the bridge to section 4 of the book.

## In this book

- [Multivectors and Grades](/geometric-algebra/foundations/multivectors-and-grades)
  — covers $\hat{\mathbf{B}}^2 = -1$ for unit bivectors, which
  is what makes the exponential work.
- [The Sandwich Product](/geometric-algebra/rotations-and-rotors/the-sandwich-product)
  — uses polar form to define rotors as $e^{\theta\mathbf{B}/2}$.

## What clicks here

If the rotor formula in §4 felt like it appeared from nowhere,
this video is where to go. The chain is:

1. Polar form $\mathbf{ab} = re^{\theta\hat{\mathbf{B}}}$ (this episode).
2. Two reflections compose to a rotation (section 4.2).
3. The rotation rotor *is* an exponential of a half-bivector
   (section 4.2 again).

The video does step 1 well; the book does steps 2 and 3 well.
Read them together and the rotor formula stops feeling
mysterious.

> :happygoose: Polar form is where 2D GA finally feels *familiar*
> to anyone who took complex analysis. It's not a coincidence —
> the algebra is identical.
