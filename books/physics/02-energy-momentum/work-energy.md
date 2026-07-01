---
sidebar_position: 1
sidebar_label: "Work & Energy"
title: "Work, Kinetic Energy, and Potential Energy"
---

# Work, Kinetic Energy, and Potential Energy

Energy methods are a change of strategy. Instead of tracking the full force vector at every instant and integrating $\mathbf F = m\mathbf a$, you track a single scalar — energy — that is often *conserved*. Trading a vector ODE for a scalar bookkeeping equation is the best deal in physics, and it's the same instinct as replacing step-by-step state tracking with a loop invariant in code.

## Work

The **work** done by a force $\mathbf{F}$ over a displacement is the line integral of force along the path:

```math
W = \int_C \mathbf{F} \cdot d\mathbf{r}.
```

For a constant force and straight-line displacement $\mathbf{d}$, this collapses to $W = \mathbf{F}\cdot\mathbf{d} = Fd\cos\theta$. Only the component of force *along* the motion does work; a force perpendicular to motion does none.

> :angrygoose: The dot product is doing real work here (pun intended). A force at right angles to the motion contributes **zero**: the normal force on a sliding block, the tension on a mass in circular motion, the magnetic force on a charge — all do no work. Students constantly "credit" these forces with energy they never transfer. If $\mathbf F \perp \mathbf v$, $W = 0$, full stop.

## The Work–Energy Theorem

Define **kinetic energy** as $K = \tfrac{1}{2}mv^2$. The net work done on a body equals its change in kinetic energy:

```math
W_{\text{net}} = \Delta K = \tfrac{1}{2}mv_f^2 - \tfrac{1}{2}mv_i^2.
```

This is not a new law — it's $\mathbf F = m\mathbf a$ integrated over distance instead of time. The derivation in 1-D:

```math
W = \int F\,dx = \int m\frac{dv}{dt}\,dx = \int m v\,dv = \tfrac{1}{2}mv_f^2 - \tfrac{1}{2}mv_i^2,
```

using $dx = v\,dt$ and $\frac{dv}{dt}dx = v\,dv$.

> :mathgoose: Integrate $\mathbf F = m\mathbf a$ over **time** and you get the impulse–momentum theorem (next chapters); integrate it over **distance** and you get the work–energy theorem. Same law, two projections. Choosing which to use is the whole art: time-integration for collisions and forces over intervals, distance-integration when you know start/end positions but not the messy details in between.

## Potential Energy and Conservative Forces

A force is **conservative** if the work it does depends only on the endpoints, not the path taken (equivalently, the work around any closed loop is zero). For such forces we can define a **potential energy** $U$ with:

```math
\mathbf{F} = -\nabla U \qquad\text{(1-D: } F = -\frac{dU}{dx}\text{)}.
```

The force points "downhill" on the potential, toward lower $U$. Common potentials:

| System | Potential energy $U$ | Force $F = -dU/dx$ |
|---|---|---|
| Gravity (near Earth) | $mgh$ | $-mg$ (downward) |
| Spring | $\tfrac{1}{2}kx^2$ | $-kx$ |
| Gravity (universal) | $-G\dfrac{m_1 m_2}{r}$ | $-G\dfrac{m_1 m_2}{r^2}$ |
| Coulomb | $\dfrac{kq_1 q_2}{r}$ | $\dfrac{kq_1 q_2}{r^2}$ |

> :nerdygoose: $\mathbf F = -\nabla U$ is *the* equation linking this book's Optimization Landscapes chapter to physics. A potential energy surface is a landscape; the force is the negative gradient; a ball rolling downhill is gradient descent. When an ML person says "the loss landscape" and a physicist says "the potential," they're drawing the same picture. Conservative force ⇔ the force field is a gradient ⇔ a scalar potential exists.

### Which forces are conservative?

- **Conservative**: gravity, springs, electrostatics — anything derivable from a potential. Energy stored is fully recoverable.
- **Non-conservative**: friction, drag, anything that depends on velocity or generates heat. Work done depends on path length; energy is dissipated, not stored.

A clean test (in regions without holes): $\mathbf F$ is conservative iff $\nabla \times \mathbf F = 0$.

## Power

**Power** is the rate of doing work:

```math
P = \frac{dW}{dt} = \mathbf{F}\cdot\mathbf{v}.
```

Measured in watts ($1\,\text{W} = 1\,\text{J/s}$). Power, not energy, is what's usually rated on engines and processors — it's the *flow rate* of energy.

## Computational / Algorithmic Touchpoints

- **Energy as a scalar invariant**: in a simulation, $E = K + U$ should be (nearly) constant for conservative forces. This single scalar is a cheaper and more sensitive correctness check than comparing full trajectories.
- **Potentials over forces**: many simulators store the *potential* $U(\mathbf x)$ and obtain forces by automatic or numerical differentiation, $\mathbf F = -\nabla U$. This guarantees the force field is conservative by construction — no spurious energy injection.
- **Work integrals → numerical quadrature**: computing $\int \mathbf F\cdot d\mathbf r$ along a path is a line-integral quadrature, the same machinery as evaluating a path-dependent cost.
- **Gradient = force** is the literal identity behind physics-inspired optimizers (Optimization Landscapes chapter): minimizing $U$ by following $-\nabla U$ is a ball seeking the bottom of a valley.

```python
def kinetic_energy(m, v):
    return 0.5 * m * v.dot(v)

def force_from_potential(U, x, eps=1e-6):
    # F = -grad U via central differences (one component shown per axis)
    grad = (U(x + eps) - U(x - eps)) / (2 * eps)
    return -grad
```

## Quick Sanity Checks

- Kinetic energy is never negative and scales with $v^2$: doubling speed *quadruples* $K$. (This is the same $v^2$ that made stopping distance quadratic.)
- Work has units of joules: $[\text{N}\cdot\text{m}] = [\text{kg}\cdot\text{m}^2/\text{s}^2] = [\text{J}]$. So does energy — they must match, since $W = \Delta K$.
- A force perpendicular to velocity does zero work; if your energy changes under a purely perpendicular force, find the bug.
- Going from $U$ to $F$, the *sign* trips people up: $F = -dU/dx$. At a potential minimum, $dU/dx = 0$ so $F = 0$ (equilibrium); just to the right, $U$ increases so $F$ points left (restoring).
- Only differences in potential energy matter; you can set the zero of $U$ anywhere. If your answer depends on the choice of reference height, you made an error.
