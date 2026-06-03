---
sidebar_position: 4
title: "Electromagnetism and Dirac — One Field, One Equation"
---

# Electromagnetism and Dirac — One Field, One Equation

This is the crescendo the whole book has been climbing toward. In STA the
electromagnetic field — taught as *two* vector fields $\mathbf{E}$ and
$\mathbf{B}$ obeying *four* equations — becomes a **single bivector** $F$
obeying a **single equation**, $\nabla F = J$. And the Dirac equation, the
relativistic quantum electron with all its spinor mystique, becomes a
*real* equation in STA, with quantum mechanics' imaginary unit revealed as
a humble bivector. Two of physics' deepest structures, unified by the
algebra we built from a single product.

## The electromagnetic field is one bivector

Classical electromagnetism gives you an electric field $\mathbf{E}$ (a
vector) and a magnetic field $\mathbf{B}$ (an "axial vector" — really a
bivector, as the [calculus part](/geometric-algebra/geometric-calculus/grad-div-curl-unified)
warned). STA fuses them into one **bivector** field, the *Faraday
bivector*:

$$
F = \mathbf{E} + I\mathbf{B},
$$

where $I$ is the spacetime pseudoscalar. Six components — three for
$\mathbf{E}$, three for $\mathbf{B}$ — exactly the **six bivectors** of STA
([the bivector split](/geometric-algebra/spacetime-algebra/spacetime-algebra)).
$\mathbf{E}$ rides the *timelike* bivectors (the boost planes), $\mathbf{B}$
the *spacelike* ones (the rotation planes). The electric and magnetic
fields were never two separate things — they're the time-mixed and
space-only parts of one geometric object, and *which* part you call "$E$"
versus "$B$" depends on your observer's split. A boost rotates $\mathbf{E}$
into $\mathbf{B}$ and back, because they're parts of one bivector being
viewed from a moving frame.

> :surprisedgoose: "$\mathbf{E}$ and $\mathbf{B}$ are the same field seen by
> different observers" is something relativity tells you *eventually*, after
> pages of transformation rules. STA tells you *immediately*: they're the
> two halves of a single bivector $F$, and a Lorentz boost
> ([rotors in spacetime](/geometric-algebra/spacetime-algebra/boosts-and-the-lorentz-group))
> sandwiches $F$, mixing the halves. A pure electric field in one frame is
> partly magnetic in another *because boosting rotates the bivector* — the
> same way rotating a stick changes its $x$- and $y$-components without
> changing the stick. The unification of electricity and magnetism, which
> took humanity until Maxwell and then Einstein to see, is *the grade-2
> structure of $Cl(1,3)$*.

## Maxwell's four equations are one

Now the famous collapse. Apply the **spacetime vector derivative** $\nabla
= \gamma^\mu\partial_\mu$ ([the vector derivative](/geometric-algebra/geometric-calculus/the-vector-derivative),
now over spacetime) to the field bivector $F$. Maxwell's *four* equations
become the *single* equation

$$
\boxed{\;\nabla F = J\;}
$$

where $J$ is the four-current (charge and current density). That's all of
electromagnetism. The mechanism is the one from the calculus part: $\nabla
F$ splits by grade into a vector part and a trivector part —

$$
\nabla F = \nabla\cdot F + \nabla\wedge F,
$$

and $\nabla\cdot F = J$ carries **Gauss's law + Ampère's law** (the
source equations) while $\nabla\wedge F = 0$ carries **the no-monopole law
+ Faraday's law** (the structure equations). Four equations, two with
sources and two without, are the two grade parts of one bivector
derivative. Split by an observer's $\gamma_0$ and the familiar
$\nabla\cdot\mathbf{E} = \rho$, $\nabla\times\mathbf{B} - \dot{\mathbf{E}} =
\mathbf{J}$, and friends drop right out.

> :nerdygoose: $\nabla F = J$ is, to my eye, the single most persuasive
> equation in this whole book. Stare at what it does: a *first-order*
> equation, in *one* object, containing *all* of classical
> electromagnetism — and it's *invertible* in a way the four-equation form
> isn't (you can write $F = \nabla^{-1} J$ and actually mean it). The four
> Maxwell equations aren't four laws of nature that happen to come as a
> set; they're the grade-2-and-grade-0 *and* grade-4-and-grade-2 parts of
> one statement, artificially separated by a formalism (vector calculus)
> that couldn't hold a bivector. Feynman said the Maxwell equations were
> the most significant event of the 19th century. STA shows they were
> *one* event, written four times because we lacked the algebra to write it
> once.

## The Dirac equation, made real

The summit. The **Dirac equation** describes the relativistic electron —
and in standard quantum mechanics it's a tangle of $4\times4$ complex gamma
*matrices*, a four-component complex "spinor," and an imaginary unit $i$
nobody can quite interpret. Hestenes showed it's a **real** equation in
STA. The Dirac spinor $\psi$ is an **even-grade multivector** (a
rotor-and-dilation-like object — an *instruction for how to rotate and
scale a frame*), and the equation is

$$
\nabla \psi\, I\sigma_3 = m\,\psi\,\gamma_0,
$$

with no matrices and no external imaginary unit anywhere. Every symbol is
a geometric object in $Cl(1,3)$.

The revelation hidden inside it: the **imaginary unit $i$ of quantum
mechanics is the bivector $I\sigma_3$**. The "$i$" that quantum theory
insists on — the one that makes amplitudes complex and probabilities
interfere — is not an abstract $\sqrt{-1}$; it's a specific *spacetime
bivector*, a little oriented plane, squaring to $-1$ because that's what
that plane does. Quantum phase is *rotation in that plane*. The spookiest
constant in physics turns out to be geometry, the same way the "imaginary
unit" of 2D rotations was the bivector $\mathbf{e}_{12}$ all the way back in
the complex-numbers section. The book closes its loop: $i$ was a bivector
in the plane, and $i$ is a bivector in spacetime.

> :surprisedgoose: The imaginary unit of quantum mechanics is **a
> bivector** — an oriented plane in spacetime, $I\sigma_3$. Sit with how
> large that is. For a century, "why is quantum mechanics complex?" has been
> a genuine foundational puzzle; textbooks shrug and say "the math just
> needs $i$." STA answers: the $i$ is a *physical plane of rotation*, the
> spinor is a *real instruction to rotate*, and quantum phase is *literal
> geometric rotation* in that plane. Whether or not that dissolves the
> interpretational mysteries (people argue), it dissolves the *notational*
> mystery completely — the same $i$-is-a-bivector insight that demystified
> complex numbers in 2D, scaled up to the electron. The geometry was under
> the formalism the entire time.

## What the whole book was for

That closes Spacetime Algebra, and the book. Look back at the single thread:
one product, the geometric product, generated **all** of it. The complex
numbers (the $\mathbf{e}_{12}$ plane). The quaternions (3D rotors).
Reflections, projections, the meet and join. Rotations as sandwiches. The
calculus — grad/div/curl, the integral theorems, complex analysis — as one
operator and one theorem. The conformal model's spheres and translations.
And here, electromagnetism as one bivector, Maxwell as one equation, the
Dirac electron with its imaginary unit unmasked as a plane. The cross
product was only the first thing we caught being a dimension-locked accident;
by now the whole fragmented curriculum — vectors, complex numbers,
quaternions, vector calculus, relativity, even a corner of quantum
mechanics — has turned out to be facets of *one algebra*. That's what the
geese were honking about from page one.

> :weightliftinggoose: The finale, and the book, in three lines.
> **Electromagnetism**: one bivector $F = \mathbf{E} + I\mathbf{B}$, one
> equation $\nabla F = J$ (the four Maxwell equations are its grade parts).
> **Dirac**: a real STA equation $\nabla\psi I\sigma_3 = m\psi\gamma_0$, the
> spinor a real even-grade object, and **quantum mechanics' imaginary unit
> is the bivector $I\sigma_3$** — a plane, squaring to $-1$, exactly like
> $\mathbf{e}_{12}$ was for complex numbers. One product built it all. If
> you take one thing from the whole journal: *the fragmentation was never
> real — it was one algebra, seen in pieces.*

## Closing the book

Physics, unified, in the algebra of one product:

- The **electromagnetic field** is a single **bivector** $F = \mathbf{E} +
  I\mathbf{B}$; $\mathbf{E}$ and $\mathbf{B}$ are its time-mixed and
  space-only parts, rotated into each other by boosts.
- **Maxwell's four equations are one**: $\nabla F = J$ — the source and
  structure equations are its grade parts.
- The **Dirac equation** is real in STA, $\nabla\psi I\sigma_3 =
  m\psi\gamma_0$; the spinor is an **even-grade** object, and **quantum
  mechanics' imaginary unit is the bivector $I\sigma_3$**.
- The whole curriculum — complex numbers, quaternions, vector calculus,
  relativity, spin — was facets of **one geometric algebra** all along.

That's the journal, as far as it goes: from "the cross product only works
in 3D" to the Dirac equation, one product the entire way. The notes will
keep growing — there's always more geometry — but the thesis is proven.
Geometric algebra is not a collection of tricks. It's the single language
the fragments were always written in. Honk.
