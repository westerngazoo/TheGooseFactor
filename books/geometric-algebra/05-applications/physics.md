---
sidebar_position: 2
title: "Physics — Maxwell, Spinors, and a Hint of Relativity"
---

# Physics — Maxwell, Spinors, and a Hint of Relativity

Physics has more conceptual cleanup pending than computer graphics
does. The fragmentation is older — Heaviside, Gibbs, Hamilton, and
Maxwell were all working at once, picking different conventions
that got cemented into curricula. GA reunifies a lot of it.

## Maxwell's Equations in One Line

The four classical equations:

$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \rho/\epsilon_0 & \nabla \times \mathbf{E} &= -\partial_t \mathbf{B} \\
\nabla \cdot \mathbf{B} &= 0 & \nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0\epsilon_0 \partial_t \mathbf{E}
\end{aligned}
$$

Four equations, two vector fields ($\mathbf{E}, \mathbf{B}$), two
operators ($\nabla\cdot$ and $\nabla\times$), two source terms.
Standard physics, but the *fragmentation* is real.

In spacetime GA (signature $(+,-,-,-)$, basis vectors
$\gamma_0, \gamma_1, \gamma_2, \gamma_3$), define the
**electromagnetic field bivector**:

$$F = \mathbf{E} + I \mathbf{B}$$

where $I$ is the spacetime pseudoscalar, $\mathbf{E}$ has
electric-field components in spacetime, and $I\mathbf{B}$ is the
magnetic-field bivector dualized.

Then **all four Maxwell equations become**:

$$\nabla F = J / \epsilon_0$$

One line. $\nabla$ is the spacetime vector derivative; $J$ is the
4-current.

> :surprisedgoose: Heaviside split Maxwell's original quaternionic
> formulation into the four-vector mess we know. Maxwell himself
> wrote the equations in 20 components in different notation, and
> by the late 1800s the engineering community had simplified them
> to "the four equations." GA recovers the unification — one
> bivector field, one derivative, one source. Heaviside was wrong
> to split.

The Lorentz force:

$$F_\text{force} = q (E + v \times B) = q\,(F \cdot v)$$

where $F \cdot v$ is the inner product of the field bivector with
the 4-velocity vector. The cross-product structure dissolves.

## Spinors and the Pauli Matrices

In quantum mechanics, **spinors** are weird two-component complex
objects that transform "half as much" as vectors under rotation
(turning $720°$ to come back to themselves, not $360°$). They're
fundamental to electrons, neutrinos, etc.

In 3D GA, the **even subalgebra** (rotors) contains exactly the
right object. The Pauli matrices $\sigma_x, \sigma_y, \sigma_z$
correspond to $\mathbf{e}_2\mathbf{e}_3, \mathbf{e}_3\mathbf{e}_1,
\mathbf{e}_1\mathbf{e}_2$ — the bivector basis — under the
identification

$$\sigma_x \leftrightarrow I \mathbf{e}_1, \qquad \sigma_y \leftrightarrow I \mathbf{e}_2, \qquad \sigma_z \leftrightarrow I \mathbf{e}_3$$

(with $I$ the 3D pseudoscalar). The "complex 2×2 matrix" formalism
is one matrix-representation of the rotor algebra.

When physicists say "a spinor rotates by half-angle," they're
saying *exactly* what we said in §4.2 about rotors: the rotor uses
$\phi/2$, not $\phi$, because two reflections compose to a rotation
of double their relative angle.

> :angrygoose: Pauli matrices were invented as a 2×2 complex
> formalism that "happened" to encode 3D rotations. GA shows it's
> not a coincidence — they're the bivector basis in disguise. The
> "double cover of $SO(3)$" by $SU(2)$ that quantum mechanics
> students struggle with is *one and the same* as "two reflections
> make a rotation."

## Special Relativity Lives in Spacetime GA

Special relativity uses a 4D spacetime with metric signature
$(+,-,-,-)$ (or $(-,+,+,+)$, conventions vary). The corresponding
GA — spacetime algebra (STA) — has basis vectors
$\gamma_0, \gamma_1, \gamma_2, \gamma_3$ with
$\gamma_0^2 = +1$, $\gamma_i^2 = -1$ for $i=1,2,3$.

Lorentz transformations are **rotors** in STA. Boosts (relativistic
velocity changes) are *hyperbolic* rotations — rotations in a
mixed time-space plane like $\gamma_0\gamma_1$, where the bivector
squares to $+1$ instead of $-1$, giving $\cosh$ and $\sinh$ instead
of $\cos$ and $\sin$.

The full Lorentz group $SO(3,1)$ — boosts and spatial rotations —
is just the rotor group of STA. Composing a boost with a rotation
is rotor multiplication; the famous **Thomas precession** falls
out as a specific rotor product.

> :surprisedgoose: Tensor calculus for relativity has decades of
> baggage — index notation, Einstein summation, contravariant vs
> covariant, the metric tensor as a separate "raise/lower"
> operation. STA does it in scalars, vectors, bivectors with one
> product. Hestenes argued for decades that physics curricula
> should switch. They mostly didn't, because the textbooks are
> already written. The math is right; the inertia is the problem.

## General Relativity (Sketch)

GR is harder. The field equation $G_{\mu\nu} = 8\pi T_{\mu\nu}$ has
a tensor on each side, and the curvature tensor's algebraic
structure is genuinely involved.

**Gauge Theory Gravity** (GTG), developed at Cambridge by Lasenby
and others, is the GA reformulation. It treats gravity as a gauge
theory in **flat** spacetime, with two gauge fields handling
position-dependence and frame-rotation. The Einstein equations
fall out, but the framework is computationally and conceptually
different.

GTG isn't mainstream — most working relativists use tensor
calculus — but it's a serious research program. If you're curious,
*Gauge Theory Gravity* by Lasenby, Doran, and Gull (2003) is the
canonical paper.

## Quantum Mechanics

Spinors aren't the only QM connection. Hestenes argued in the 1960s
and onward that the Dirac equation — describing electrons —
**contains a real, geometric meaning** in STA that the standard
matrix-formalism obscures.

In standard QM, the wavefunction $\psi$ is a complex-valued thing,
and "complex" is metaphysics — what does the imaginary part *mean*?
In Hestenes' STA reformulation, $\psi$ is an even-grade multivector
in spacetime, and the "imaginary unit" of QM is identified with
the **spacetime pseudoscalar bivector** $I_{xy}$ — the plane in
which the electron's spin lives.

This is contested philosophy and a real research program. Whether
it's "the right interpretation" is a question for physicists. What's
algebraically true is that the standard Dirac formalism is one
representation of STA's even subalgebra. The translations are
worked out and consistent.

> :weightliftinggoose: Reformulating physics in GA isn't just
> notation. It's a research program with real consequences for how
> students learn the material — and, occasionally, for how
> calculations are done. If you're a physics student, knowing GA
> doesn't replace tensor calculus or Pauli matrices, but it gives
> you a *unified* view of where they all came from.

## Closing the Section

GA in physics is older than GA in computer graphics — Hestenes was
arguing for it in the 1960s — but adoption has been gated by
curriculum inertia and the economics of textbook publishing. The
ideas are in the literature and have been validated in research.

Two more chapters in section 5: **robotics and CGA** (where points
become first-class blades), and **further reading** (the canonical
references).
