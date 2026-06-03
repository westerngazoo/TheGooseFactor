---
sidebar_position: 2
title: "The Spacetime Split — Where 3D Physics Comes From"
---

# The Spacetime Split — Where 3D Physics Comes From

If spacetime is four-dimensional, where did the ordinary 3D vectors of
everyday physics go? They're *in there* — and you extract them by picking an
**observer**. Choosing a time direction $\gamma_0$ and multiplying by it —
the **spacetime split** — peels the 3D world out of 4D spacetime, and the
3D geometric algebra of the earlier sections reappears as the **even
subalgebra** of STA. Same algebra, two views: the absolute 4D one and the
observer's 3D one.

## An observer is a timelike vector

In relativity there's no universal "now" or "here" — measurements depend on
who's looking. STA builds that in: an **observer** is just a unit timelike
vector, conventionally $\gamma_0$, pointing along their worldline (their
personal "time" direction). Different observers, different $\gamma_0$'s.
*How* you split spacetime into "space" and "time" depends on which
$\gamma_0$ you choose — which is the relativity of simultaneity, stated
algebraically before we've done any physics.

## The split: multiply by $\gamma_0$

Take a spacetime four-vector $a = a^0\gamma_0 + a^1\gamma_1 + a^2\gamma_2 +
a^3\gamma_3$ and multiply by the observer $\gamma_0$ (using $\gamma_0^2 = +1$
and $\gamma_i\gamma_0 = -\gamma_0\gamma_i$):

$$
a\gamma_0 = \underbrace{a\cdot\gamma_0}_{\text{scalar}}
+ \underbrace{a\wedge\gamma_0}_{\text{bivector}}
= a^0 + \mathbf{a}.
$$

The geometric product splits $a\gamma_0$ into:

- a **scalar** $a^0 = a\cdot\gamma_0$ — the **time** component the observer
  measures, and
- a **bivector** $\mathbf{a} = a\wedge\gamma_0$ — the **spatial** part, the
  observer's ordinary 3D vector.

So *one* spacetime vector, viewed through $\gamma_0$, becomes "a time
number plus a 3D vector" — exactly how an observer reports an event ("at
time $t$, at position $\mathbf{x}$"). The split is the geometric product
with the observer.

## The relative vectors generate 3D GA

Here's the gorgeous part. The "spatial" objects $\mathbf{a} = a\wedge
\gamma_0$ are **bivectors** in spacetime, built from the three timelike
bivectors

$$
\sigma_k \;=\; \gamma_k\gamma_0, \qquad k = 1, 2, 3.
$$

Compute their squares: $\sigma_k^2 = (\gamma_k\gamma_0)^2 = +1$
([from the last chapter](/geometric-algebra/spacetime-algebra/spacetime-algebra)).
**They square to $+1$** — like Euclidean vectors! And they anticommute with
each other. In other words, the $\sigma_k$ behave *exactly* like the basis
vectors of ordinary 3D geometric algebra $Cl(3,0)$. The **even subalgebra
of STA is the 3D GA of the earlier sections** — the same Pauli algebra, the
same rotors, the same wedge.

So the 3D vectors, bivectors, and rotors you spent five sections building
aren't a *different* theory from spacetime — they're **what one observer
sees** when they split 4D STA with their $\gamma_0$. Relativity doesn't
replace 3D physics; it *contains* it, once per observer.

> :surprisedgoose: The $\sigma_k = \gamma_k\gamma_0$ are *spacetime
> bivectors* that act like *3D vectors* — and these are literally the
> **Pauli matrices** of quantum mechanics, the algebra of electron spin.
> The same objects, derived three completely different ways: as 3D
> geometric-algebra basis vectors (our earlier sections), as relative
> vectors from a spacetime split (here), and as $2\times2$ complex spin
> matrices (a quantum-mechanics course). They were never three things. The
> "spin matrices" that seem to come from nowhere in QM are just the spatial
> bivectors an observer sees in spacetime — and the imaginary unit lurking
> in them is the spacetime pseudoscalar. Three subjects, one algebra,
> finally visible.

## Even and odd: the absolute and the relative

STA thus carries two pictures at once, and the grade split organizes them:

- The **full STA** ($Cl(1,3)$, all 16 grades) is the **absolute,
  observer-independent** view — four-vectors, spacetime bivectors, the
  pseudoscalar. Physics written here is manifestly the same for everyone.
- The **even subalgebra** (scalars + bivectors + pseudoscalar, 8 elements)
  is the **relative, observer-dependent** 3D view, isomorphic to $Cl(3,0)$
  — where ordinary 3D vector physics lives.

The relative pseudoscalar — the "$i$" of the 3D algebra — turns out to be
$\sigma_1\sigma_2\sigma_3 = I$, the *same* spacetime pseudoscalar from the
last chapter. So even the 3D "imaginary unit" is the 4D volume element,
seen from inside. Writing physics in the absolute view keeps it
observer-independent; *splitting* into the relative view recovers the
familiar 3D equations a particular observer measures — and STA lets you
move between them by multiplying by $\gamma_0$.

> :weightliftinggoose: The construction to internalize: an **observer is a
> timelike vector $\gamma_0$**, and the **spacetime split** is just
> $a\gamma_0 = a^0 + \mathbf{a}$ (time scalar + spatial bivector). The
> relative vectors $\sigma_k = \gamma_k\gamma_0$ **square to $+1$** and
> generate the **3D GA of the earlier sections** — which *is* the **even
> subalgebra** of STA (and the Pauli algebra of spin). So 3D physics is
> "what one observer sees"; full STA is the absolute view all observers
> share. Master moving between them — multiply by $\gamma_0$ to go relative,
> work in full STA to stay absolute — and relativity stops being a separate
> subject.

## Closing the section

3D physics is spacetime, seen by someone:

- An **observer** is a unit timelike vector $\gamma_0$; the **spacetime
  split** is multiplication by it: $a\gamma_0 = a^0 + \mathbf{a}$ (time
  scalar + spatial bivector).
- The **relative vectors** $\sigma_k = \gamma_k\gamma_0$ **square to $+1$**
  and reproduce **3D GA** $Cl(3,0)$ — the **even subalgebra** of STA (and
  the **Pauli/spin** algebra).
- **Full STA** = the absolute, observer-independent view; the **even
  subalgebra** = the relative 3D view of one observer. The 3D "imaginary
  unit" is the spacetime pseudoscalar $I$.

We have spacetime, observers, and the bridge to 3D. Now the motion that
makes it *relativity*: changing observers — boosting. Next we build the
**Lorentz transformations as rotors**, with boosts as hyperbolic rotations,
and watch length contraction and time dilation come out of $\cosh$ and
$\sinh$.
