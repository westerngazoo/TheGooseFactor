---
sidebar_position: 4
title: "Monogenic Functions — Complex Analysis, Unleashed"
---

# Monogenic Functions — Complex Analysis, Unleashed

Complex analysis — holomorphic functions, the Cauchy–Riemann equations,
contour integration, residues — is one of the most beautiful corners of
mathematics, and it always feels like a special gift of the 2D plane.
It isn't. It's geometric calculus in $Cl(2,0,0)$, and the moment you write
it in GA it generalizes to **any** dimension. The key object is the
**monogenic function**: a field $F$ with

$$
\nabla F = 0.
$$

That one equation *is* "holomorphic," lifted out of the plane.

## $\nabla F = 0$: the master equation

A field is **monogenic** when its vector derivative vanishes. Recall
$\nabla F = \nabla\cdot F + \nabla\wedge F$
([grad/div/curl unified](/geometric-algebra/geometric-calculus/grad-div-curl-unified)),
so $\nabla F = 0$ means **both** the divergence-like part *and* the
curl-like part vanish at once:

$$
\nabla\cdot F = 0 \quad\text{and}\quad \nabla\wedge F = 0.
$$

"Source-free and irrotational," together. Monogenic functions are the GA
heirs of holomorphic functions — and, as we'll see, of harmonic functions,
of source-free physical fields, and of the analytic functions of complex
analysis. The whole theory is "what can we say about fields with
$\nabla F = 0$?"

## In 2D: monogenic = holomorphic

Work in the plane, $Cl(2,0,0)$, where the even subalgebra (scalars +
the bivector $\mathbf{e}_{12}$, with $\mathbf{e}_{12}^2 = -1$) *is* the
complex numbers — that's the [complex-numbers connection](/geometric-algebra/video-companion/episode-04-complex-numbers)
from earlier. Write a field $F = u + v\,\mathbf{e}_{12}$ and demand
$\nabla F = 0$. Expanding $\nabla = \mathbf{e}_1\partial_x +
\mathbf{e}_2\partial_y$ and collecting grades, $\nabla F = 0$ becomes

$$
\partial_x u = \partial_y v, \qquad \partial_y u = -\,\partial_x v.
$$

Those are **exactly the Cauchy–Riemann equations**. So in 2D, *monogenic*
is *holomorphic*, full stop. The condition that defines analytic functions
of a complex variable is the GA equation $\nabla F = 0$ in disguise.

> :surprisedgoose: The Cauchy–Riemann equations — those two coupled PDEs
> you memorized as "the definition of complex-differentiable" — are just
> $\nabla F = 0$ with the grades read off. And that recasting *liberates*
> them: $\nabla F = 0$ makes sense in 3D, 4D, spacetime — anywhere there's
> a vector derivative. So the entire toolkit of complex analysis isn't a
> miracle of two dimensions; it's the 2D shadow of a theory that lives in
> all of them. Generations treated "why is complex analysis so magical and
> so stuck in 2D?" as a mystery. The answer: it was never 2D-bound. It was
> GA all along, and we'd only ever seen the flat case.

## Cauchy's theorem and integral formula, in GA

Now combine $\nabla F = 0$ with the [fundamental theorem](/geometric-algebra/geometric-calculus/the-fundamental-theorem),
$\int_M \mathrm{d}X\,\nabla F = \oint_{\partial M}\mathrm{d}x\,F$. If $F$ is
monogenic on $M$, the left side is **zero**, so

$$
\oint_{\partial M}\mathrm{d}x\,F = 0.
$$

That's **Cauchy's integral theorem** — the contour integral of an analytic
function around a closed loop is zero — now valid in any dimension, for any
monogenic field. And with a little more work (integrating against the
fundamental solution of $\nabla$, the GA analogue of $1/z$), you recover
the **Cauchy integral formula**: the value of a monogenic function *inside*
a region is determined entirely by its values on the *boundary*,

$$
F(\mathbf{a}) \;=\; \frac{1}{S_n}\oint_{\partial M}
\frac{\mathbf{x}-\mathbf{a}}{|\mathbf{x}-\mathbf{a}|^n}\,\mathrm{d}x\,F(\mathbf{x}),
$$

($S_n$ a dimension-dependent constant). The boundary determines the
interior — the defining magic of analytic functions — for monogenic fields
in $n$ dimensions. Residues, the maximum principle, and the rest of the
Cauchy toolkit follow the same way.

## This is "Clifford analysis"

What we've sketched is the opening of **Clifford analysis** — the
$n$-dimensional generalization of complex analysis that GA makes
inevitable. The dictionary:

| complex analysis (2D) | Clifford analysis ($n$D) |
|---|---|
| holomorphic $f$ | monogenic $F$ ($\nabla F = 0$) |
| Cauchy–Riemann | $\nabla F = 0$ (grade parts) |
| $1/z$ (the kernel) | $\dfrac{\mathbf{x}}{\lvert\mathbf{x}\rvert^n}$ |
| Cauchy's theorem | FTGC with $\nabla F = 0$ |
| Cauchy integral formula | the $n$D boundary formula above |

A whole field of mathematics, normally taught as an exotic generalization,
is just "do complex analysis, but with the vector derivative instead of
$\mathrm{d}/\mathrm{d}z$, in any dimension." The 2D case was special only
in being the one we noticed first.

## Why monogenic fields are everywhere in physics

The reason $\nabla F = 0$ matters beyond aesthetics: **source-free physical
fields are monogenic.** In the [physics notes](/geometric-algebra/applications/physics),
the electromagnetic field $F$ in empty space satisfies $\nabla F = 0$ —
the source-free Maxwell equation — so the *electromagnetic field in vacuum
is a monogenic function*, and the Cauchy-style "boundary determines
interior" results apply to it directly. Harmonic functions ($\nabla^2\phi
= 0$) are close relatives — a monogenic field has monogenic, hence
harmonic, components, since $\nabla^2 = \nabla\nabla$. So the machinery of
this chapter isn't a curiosity; it's the mathematics of potentials, fields,
and conservation laws, in the language that makes them one.

> :weightliftinggoose: One equation closes out the calculus: **$\nabla F =
> 0$** — *monogenic*. Drill the three faces: in **2D** it's the
> **Cauchy–Riemann equations** (monogenic = holomorphic); combined with the
> **fundamental theorem** it gives **Cauchy's theorem and integral
> formula** (boundary determines interior) in **any dimension**; and in
> **physics** it's the **source-free field** (vacuum electromagnetism is
> monogenic). Complex analysis was never a 2D miracle — it was geometric
> calculus seen flat. That's the headline to carry out of this whole part.

## Closing the section — and the calculus

Geometric *calculus* now stands on the same footing as geometric algebra:

- A **monogenic** field satisfies $\nabla F = 0$ — both divergence-like and
  curl-like parts vanish — the GA heir of *holomorphic*.
- In **2D** this *is* the **Cauchy–Riemann equations**; monogenic =
  holomorphic.
- With the **fundamental theorem**, monogenicity yields **Cauchy's theorem
  and integral formula** in any dimension — the boundary determines the
  interior.
- This is **Clifford analysis**: complex analysis, freed from the plane.
- **Source-free physical fields are monogenic** — vacuum electromagnetism
  among them.

And that closes the calculus arc. We crossed from the static algebra of
blades and rotors into a full differential and integral calculus, and found
the same unification waiting: grad/div/curl as one operator
([§2](/geometric-algebra/geometric-calculus/grad-div-curl-unified)),
the integral theorems as one theorem
([§3](/geometric-algebra/geometric-calculus/the-fundamental-theorem)),
and complex analysis as the 2D case of a calculus that lives in every
dimension. The cross product wasn't the only thing dimension-locked by
accident — so were grad/div/curl, the integral theorems, and complex
analysis. Geometric calculus unlocks them all.

> :happygoose: This is the chapter where it all came home for me. Complex
> analysis — the prettiest math I knew — turned out to be *our* algebra, in
> 2D, and the same beauty was sitting in every dimension the whole time,
> waiting for one equation: $\nabla F = 0$. The cross product got me into
> GA out of irritation; geometric calculus is what made me stay.
