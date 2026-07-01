---
sidebar_position: 2
sidebar_label: "Newton's Laws & F=ma"
title: "Newton's Laws and the Equation of Motion"
---

# Newton's Laws and the Equation of Motion

Kinematics describes motion; **dynamics** explains it. Newton's three laws connect forces to acceleration, and the second law $\mathbf{F} = m\mathbf{a}$ is the single most important differential equation in classical physics. Read computationally, it's a recipe: *given the forces, compute the acceleration, and step the state forward.*

## The Three Laws

1. **Inertia.** A body moves at constant velocity unless acted on by a net force. (There exist *inertial frames* in which this holds.)
2. **$\mathbf{F} = m\mathbf{a}$.** The net force equals mass times acceleration; more precisely, force is the rate of change of momentum, $\mathbf{F} = d\mathbf{p}/dt$ with $\mathbf{p} = m\mathbf{v}$.
3. **Action–reaction.** If body $A$ pushes on $B$ with force $\mathbf{F}_{AB}$, then $B$ pushes on $A$ with $\mathbf{F}_{BA} = -\mathbf{F}_{AB}$.

```math
\mathbf{F}_{\text{net}} = m\,\mathbf{a} = m\,\frac{d^2\mathbf{x}}{dt^2}.
```

> :mathgoose: The second law is a **second-order ODE** for position. Give me the force law $\mathbf{F}(\mathbf{x}, \mathbf{v}, t)$ and two initial conditions ($\mathbf{x}_0$, $\mathbf{v}_0$), and the future is determined. This is Laplacian determinism in one line. Everything in classical mechanics is the project of writing down the right $\mathbf{F}$ and solving — analytically when you're lucky, numerically when you're honest.

> :angrygoose: $\mathbf{F} = m\mathbf{a}$ is a statement about the **net** force, and forces are **vectors**. The single most common beginner bug is adding force *magnitudes* without resolving them into components, or forgetting a force entirely. Draw the free-body diagram, sum the vectors, *then* divide by $m$. Skipping the diagram is how you get gravity pointing sideways.

## First-Order Form: The State Vector

A second-order ODE is awkward for computers. Split it into two first-order equations by treating velocity as an independent state variable:

```math
\frac{d}{dt}\begin{pmatrix} \mathbf{x} \\ \mathbf{v} \end{pmatrix} = \begin{pmatrix} \mathbf{v} \\ \mathbf{F}(\mathbf{x}, \mathbf{v}, t)/m \end{pmatrix}.
```

This is the canonical $\dot{\mathbf{s}} = \mathbf{f}(\mathbf{s}, t)$ form that every numerical integrator consumes. The state $\mathbf{s} = (\mathbf{x}, \mathbf{v})$ is the complete instantaneous description of the system — its phase-space point.

> :nerdygoose: This "promote the derivative to a state variable" trick generalizes: an $n$-th order ODE becomes $n$ coupled first-order ODEs. That's why ODE solver APIs only ever ask for a first-order right-hand side. Knowing this conversion is the bridge between a physics textbook and `scipy.integrate.solve_ivp`.

## Common Force Laws

| Force | Expression | Notes |
|---|---|---|
| Gravity (near Earth) | $\mathbf{F} = m\mathbf{g}$ | constant, downward |
| Gravity (universal) | $F = G\dfrac{m_1 m_2}{r^2}$ | attractive, along the line of centers |
| Spring (Hooke) | $\mathbf{F} = -k\mathbf{x}$ | linear restoring force |
| Linear drag | $\mathbf{F} = -b\mathbf{v}$ | slow speeds, viscous |
| Quadratic drag | $\mathbf{F} = -c\,\lvert\mathbf{v}\rvert\,\mathbf{v}$ | fast speeds, turbulent |
| Friction (kinetic) | $F = \mu_k N$ | opposes sliding motion |
| Normal force | $\mathbf{N}$ | perpendicular to surface, a constraint |

### Worked example — terminal velocity

A falling object with linear drag obeys $m\dot v = mg - bv$ (taking down as positive). Terminal velocity is reached when acceleration vanishes, $\dot v = 0$:

```math
v_{\text{term}} = \frac{mg}{b}.
```

The full solution approaches it exponentially: $v(t) = v_{\text{term}}\left(1 - e^{-bt/m}\right)$, with time constant $\tau = m/b$. Heavier things fall faster *only because* drag is fixed by shape, not mass — the $m$ in the numerator wins.

> :surprisedgoose: The differential equation $m\dot v = mg - bv$ is the *same equation* as an RC circuit charging, a thermometer equilibrating, and a population approaching carrying capacity. "Exponential approach to a steady state" is a universal pattern; the physics just relabels the constants. Spot the structure $\dot y = A - By$ and you already know the answer is $y_\infty(1 - e^{-t/\tau})$.

## Constraints and Free-Body Diagrams

Many forces are **constraints**: the normal force, tension, and contact forces don't have a formula — they take whatever value is needed to enforce a geometric condition (the block stays on the table, the rope is inextensible). The procedure:

1. Isolate one body.
2. Draw every force acting *on* it as a vector.
3. Pick axes (align one with the likely acceleration).
4. Write $\sum F_x = m a_x$ and $\sum F_y = m a_y$.
5. Add constraint equations (e.g., $a$ is the same for connected bodies).

### Inclined plane

A block of mass $m$ on a frictionless incline of angle $\theta$: gravity resolves into $mg\sin\theta$ down the slope and $mg\cos\theta$ into it. The normal force cancels the perpendicular part, leaving:

```math
a = g\sin\theta.
```

At $\theta = 0$ no acceleration; at $\theta = 90^\circ$ free fall. The incline "dilutes" gravity by $\sin\theta$.

## Computational / Algorithmic Touchpoints

- **`force(state, t)` is the core callback** of any physics engine or ODE solver; it returns $\mathbf F/m$, the right-hand side of $\dot{\mathbf v}$.
- **Constraints → constraint solvers**: rigid-body engines (e.g., for games) solve for the constraint forces each frame using iterative methods (Gauss–Seidel / projected Gauss–Seidel), because there's no closed formula for tension/normal forces.
- **Action–reaction → pairwise loops**: in an $N$-body simulation you compute each pair force once and apply $\pm\mathbf F$ to both bodies, halving the work and guaranteeing momentum conservation by construction.
- **Stiff forces** (large $k$ or $b$) force small time steps; recognizing stiffness from the force law tells you to reach for an implicit integrator.

```python
def acceleration(x, v, t, m, g, b):
    # net force / m for gravity + linear drag, then a = F/m
    F = m * g - b * v
    return F / m
```

## Quick Sanity Checks

- $\mathbf{F} = m\mathbf{a}$ is dimensionally $[\text{kg}\cdot\text{m/s}^2] = [\text{N}]$. If your "force" isn't in newtons, find the missing factor.
- Action–reaction forces act on *different* bodies, so they never cancel in a single body's free-body diagram. Confusing this is a classic error.
- A constraint force (normal, tension) can never be negative in the "pushing/pulling" sense it models — if you solve and get a negative normal force, the object has left the surface.
- Set drag to zero and your equations must reduce to the constant-acceleration kinematics of the previous chapter.
