---
sidebar_position: 4
sidebar_label: "Discretizing F=ma"
title: "Discretizing the Equations of Motion"
---

# Discretizing the Equations of Motion

Most real force laws have no closed-form solution. The orbit of three gravitating bodies, a projectile with drag, a chain of coupled springs — for these, "solving $\mathbf{F} = m\mathbf{a}$" means *stepping it forward in time on a computer*. This chapter is the bridge from continuous dynamics to a running simulation; the Computational Physics book develops the numerics in full.

## From Derivative to Difference

Start from the first-order state form:

```math
\dot{\mathbf{x}} = \mathbf{v}, \qquad \dot{\mathbf{v}} = \mathbf{a}(\mathbf{x}, \mathbf{v}, t) = \frac{\mathbf{F}}{m}.
```

Replace the time derivative with a finite difference over a small step $\Delta t$. The simplest choice — **explicit (forward) Euler** — evaluates the right-hand side at the *current* state:

```math
\mathbf{x}_{n+1} = \mathbf{x}_n + \mathbf{v}_n\,\Delta t, \qquad \mathbf{v}_{n+1} = \mathbf{v}_n + \mathbf{a}_n\,\Delta t.
```

This is exactly the constant-acceleration kinematic update from the first chapter, applied over one short interval where $\mathbf a$ is *assumed* constant. The error per step is $O(\Delta t^2)$, accumulating to $O(\Delta t)$ over a fixed time interval — hence "first-order accurate."

> :mathgoose: A finite-difference scheme is just a truncated Taylor series with the tail thrown away. $\mathbf x(t+\Delta t) = \mathbf x(t) + \dot{\mathbf x}\Delta t + \tfrac12\ddot{\mathbf x}\Delta t^2 + \cdots$; keep the first two terms and you have Euler. The discarded $\tfrac12\ddot{\mathbf x}\Delta t^2$ *is* the local truncation error. Every integrator is a different bargain about which Taylor terms to keep and how to estimate them.

## The Order of Updates Matters: Symplectic Euler

A deceptively small change — use the *new* velocity to update position — gives **semi-implicit (symplectic) Euler**:

```math
\mathbf{v}_{n+1} = \mathbf{v}_n + \mathbf{a}_n\,\Delta t, \qquad \mathbf{x}_{n+1} = \mathbf{x}_n + \mathbf{v}_{n+1}\,\Delta t.
```

It costs the same and has the same order of accuracy, but for oscillatory/orbital systems it is dramatically better behaved: it nearly conserves energy over long runs instead of letting it blow up or decay.

> :angrygoose: Explicit Euler is a **trap** for oscillators and orbits. Run a planet around the sun with forward Euler and it spirals outward — energy is manufactured from nothing, purely as a numerical artifact. The phase-space area isn't preserved. The one-line fix (use $\mathbf v_{n+1}$ in the position update) makes it *symplectic*, and the planet stays in a stable (if slightly wobbling) orbit. Same cost, vastly better physics. If you write a game or an n-body toy with naive Euler, expect everything to gain energy and explode.

> :nerdygoose: Why does this tiny reordering help so much? Symplectic integrators exactly conserve a *nearby* "shadow" Hamiltonian. The energy you compute oscillates around the true value with bounded error forever, rather than drifting monotonically. For anything Hamiltonian (no friction), reach for symplectic Euler, Verlet, or leapfrog — never plain explicit Euler.

## Velocity Verlet: The Workhorse

For force laws that depend only on position, $\mathbf a = \mathbf a(\mathbf x)$ (gravity, springs), **velocity Verlet** is the standard. It is second-order accurate, symplectic, and time-reversible:

```math
\mathbf{x}_{n+1} = \mathbf{x}_n + \mathbf{v}_n\,\Delta t + \tfrac{1}{2}\mathbf{a}_n\,\Delta t^2
```

```math
\mathbf{v}_{n+1} = \mathbf{v}_n + \tfrac{1}{2}\bigl(\mathbf{a}_n + \mathbf{a}_{n+1}\bigr)\,\Delta t.
```

You compute the new acceleration $\mathbf a_{n+1}$ from the new position $\mathbf x_{n+1}$, then average old and new accelerations for the velocity. One force evaluation per step (reuse $\mathbf a_{n+1}$ as next step's $\mathbf a_n$).

This is why molecular dynamics, orbital mechanics, and most game physics engines use Verlet/leapfrog: cheap, stable, and energy-respecting.

## Choosing the Step Size

The step $\Delta t$ trades accuracy and cost against stability:

- **Too large** → inaccuracy, and for explicit schemes, *instability* (the solution oscillates and diverges).
- **Too small** → correct but slow, and round-off error eventually dominates.
- **Rule of thumb**: resolve the fastest timescale in the system. For an oscillator of period $T$, you need many steps per period, e.g. $\Delta t \lesssim T/20$. For stiff systems (very fast modes alongside slow ones), explicit methods demand punishingly small $\Delta t$ — a cue to switch to implicit integrators.

```python
def velocity_verlet(x, v, accel, dt, steps):
    a = accel(x)
    traj = []
    for _ in range(steps):
        x = x + v * dt + 0.5 * a * dt * dt   # position uses current a
        a_new = accel(x)                     # force at the new position
        v = v + 0.5 * (a + a_new) * dt       # velocity uses averaged a
        a = a_new
        traj.append((x, v))
    return traj
```

## Energy as a Diagnostic

Because exact dynamics conserves energy (absent friction/driving), tracking total energy $E_n = \tfrac12 m v_n^2 + U(x_n)$ during a simulation is the cheapest, most honest correctness check you have:

- Monotonic drift in $E$ → your integrator is leaking or injecting energy (often explicit Euler).
- Bounded oscillation in $E$ → healthy symplectic behavior.
- Sudden blow-up → step size too large; you've crossed a stability threshold.

> :surprisedgoose: This flips the usual relationship between physics and code. We normally *derive* conservation laws from the dynamics. In simulation, we *use* the conservation law as a unit test for the dynamics. If a quantity that mathematically can't change is changing in your output, the bug is in the integrator or the time step — not in physics.

## Computational / Algorithmic Touchpoints

- **The simulation loop** — compute forces, update state, repeat — is the heart of physics engines, molecular dynamics (LAMMPS, GROMACS), and orbital propagators.
- **Integrator choice is a design decision**: explicit Euler (simplest, leaks energy), symplectic Euler (cheap, stable for Hamiltonian systems), velocity Verlet (the default for conservative forces), RK4 (high accuracy, not symplectic — good for non-conservative or non-Hamiltonian systems).
- **Adaptive time stepping** shrinks $\Delta t$ when forces are large (close encounters) and grows it when motion is gentle — the basis of production ODE solvers like `solve_ivp`'s RK45.
- **Determinism & reproducibility**: fixed $\Delta t$ and fixed evaluation order make a simulation bit-for-bit reproducible, which matters for debugging and for lockstep multiplayer game physics.

## Quick Sanity Checks

- One Euler step over the whole interval with constant $\mathbf a$ must reproduce $x = x_0 + v_0\,\Delta t + \tfrac12 a\,\Delta t^2$ (for Verlet) — your discretization should agree with the analytic kinematics in the constant-acceleration case.
- Halving $\Delta t$ should cut the error roughly in half for a first-order method (Euler) and to a *quarter* for a second-order method (Verlet, RK2). If it doesn't, your "order" claim is wrong.
- Simulate an undamped oscillator: with symplectic Euler or Verlet the energy stays bounded; with explicit Euler it climbs. Watching this once is worth a thousand words.
- Reverse the velocity at the end of a Verlet run and step backward — you should retrace your path (time reversibility). Explicit Euler won't.
