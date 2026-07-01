---
sidebar_position: 2
sidebar_label: "Conservation of Energy"
title: "Conservation of Energy as an Invariant"
---

# Conservation of Energy as an Invariant

The most powerful problem-solving idea in mechanics: if only conservative forces act, the total mechanical energy never changes. You can ignore the entire messy trajectory and just equate energy at the start and end. To a programmer, this *is* a loop invariant — a quantity the dynamics is required to preserve no matter how complicated the intermediate steps.

## The Conservation Law

Define total mechanical energy $E = K + U$. When all forces doing work are conservative:

```math
E = \tfrac{1}{2}mv^2 + U(x) = \text{constant}.
```

So between any two states $i$ and $f$:

```math
\tfrac{1}{2}mv_i^2 + U_i = \tfrac{1}{2}mv_f^2 + U_f.
```

This follows directly from the previous chapter: $W_{\text{net}} = \Delta K$, and for conservative forces $W = -\Delta U$, so $\Delta K + \Delta U = 0$, i.e. $\Delta E = 0$.

> :happygoose: This is the whole game. A roller coaster, a pendulum, a planet, a ball in a bowl — you don't integrate any equations of motion. You write "energy at the top = energy at the bottom" and solve a single algebraic equation. The trajectory can be arbitrarily complicated; the invariant doesn't care. This is exactly why invariants are prized in algorithm correctness proofs: they let you reason about the endpoints while ignoring the path.

### Worked example — speed at the bottom of a ramp

A block slides from rest down a frictionless ramp of height $h$. No need to resolve forces or know the ramp's shape:

```math
mgh = \tfrac{1}{2}mv^2 \;\Longrightarrow\; v = \sqrt{2gh}.
```

The mass cancels, and the *shape of the ramp is irrelevant* — only the height drop matters. A curved slide and a straight ramp of the same height give the same final speed.

## Energy Diagrams and Turning Points

Plotting $U(x)$ with a horizontal line at the total energy $E$ tells you the motion qualitatively, no equations needed:

- The particle can only be where $U(x) \le E$ (since $K = E - U \ge 0$).
- **Turning points** are where $U(x) = E$: kinetic energy is zero, the particle momentarily stops and reverses.
- **Minima** of $U$ are stable equilibria (a ball settles there); **maxima** are unstable.
- A particle is **bound** if trapped in a potential well, **unbound** if it can escape to infinity.

> :mathgoose: The energy diagram is a 1-D phase portrait you can read at a glance. Where the $E$ line sits relative to the wells and barriers of $U(x)$ tells you whether motion is oscillatory (trapped between two turning points), unbounded (escapes), or poised on a knife-edge (sits at an unstable maximum). This same picture reappears in the Optimization Landscapes chapter as "which basin does the ball fall into."

### Escape velocity

To escape a gravitational well ($U = -GMm/r$) means reaching $r \to \infty$ with $E \ge 0$. Setting $E = 0$ at the surface:

```math
\tfrac{1}{2}mv_{\text{esc}}^2 - \frac{GMm}{R} = 0 \;\Longrightarrow\; v_{\text{esc}} = \sqrt{\frac{2GM}{R}}.
```

For Earth, about $11.2\,\text{km/s}$. Notice the mass of the escaping object cancels again.

## When Energy Isn't Conserved (and What to Do)

Non-conservative forces (friction, drag) dissipate mechanical energy into heat. The bookkeeping generalizes to an accounting identity:

```math
\Delta E = \Delta K + \Delta U = W_{\text{non-cons}}.
```

For sliding friction over a distance $d$, $W_{\text{friction}} = -f d = -\mu N d$, which is always negative. The "lost" mechanical energy isn't destroyed — it became thermal energy. The grand statement, **the first law of thermodynamics**, restores conservation by counting heat $Q$:

```math
\Delta E_{\text{total}} = \Delta K + \Delta U + \Delta E_{\text{thermal}} = 0 \;(\text{isolated system}).
```

> :angrygoose: "Energy is always conserved" is true only if you count *every* form: kinetic, potential, thermal, chemical, electromagnetic, rest mass. Mechanical energy alone ($K + U$) is conserved *only* without friction/drag. Beginners apply $K_i + U_i = K_f + U_f$ to a problem with friction and get nonsense. Always ask: is there a dissipative force? If so, add the $W_{\text{non-cons}}$ term.

> :surprisedgoose: The deepest reason energy is conserved (Noether's theorem) is that the laws of physics don't change over time — time-translation symmetry *implies* energy conservation. Every conservation law is the shadow of a symmetry: time → energy, space → momentum, rotation → angular momentum. Conservation laws aren't lucky accidents; they're symmetries in disguise.

## Computational / Algorithmic Touchpoints

- **Invariant as a unit test**: in any conservative simulation, monitor $E = K + U$. Drift signals integrator error (see the Computational Physics book); a sudden jump signals a bug in the force or a too-large step.
- **Symplectic integrators** (Verlet, leapfrog) are designed so that a slightly-perturbed energy is *exactly* conserved, keeping the computed $E$ bounded forever rather than drifting.
- **Energy as a stopping/branch condition**: turning points ($K=0$) and escape conditions ($E \ge 0$) become clean `if` checks in a simulation instead of detecting them from the trajectory.
- **Optimization analogy**: minimizing a potential by gradient descent is a *dissipative* version of this dynamics — you deliberately remove energy so the system settles into a minimum rather than oscillating forever (Optimization Landscapes chapter).

```python
def total_energy(m, v, U, x):
    return 0.5 * m * v.dot(v) + U(x)

# In a sim loop, assert near-conservation as a correctness check:
# assert abs(total_energy(...) - E0) < tol, "energy drift -> integrator bug"
```

## Quick Sanity Checks

- $v = \sqrt{2gh}$ is independent of mass and ramp shape — if your answer depends on either (for a frictionless slide), recheck.
- Total energy line on a $U(x)$ diagram must lie *above* the potential wherever the particle goes; regions with $U > E$ are forbidden.
- With friction present, $K_i + U_i = K_f + U_f$ is wrong — the right side must be smaller by the heat generated.
- Escape velocity and orbital speed differ by exactly $\sqrt2$: $v_{\text{esc}} = \sqrt2\, v_{\text{circular}}$ at the same radius. A handy cross-check.
- If a simulation's total energy grows without any energy input, the bug is numerical (integrator/step size), not physical.
