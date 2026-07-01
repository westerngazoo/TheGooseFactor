---
sidebar_position: 2
sidebar_label: "Verlet & Symplectic Integrators"
title: "Verlet, Leapfrog, and Symplectic Integration"
---

# Verlet, Leapfrog, and Symplectic Integration

When you simulate a conservative system for a long time — a planet for a million orbits, a protein for a microsecond of molecular dynamics — you care less about pinpoint accuracy at each instant than about the *qualitative* truth: the orbit stays an orbit, the energy doesn't drift to infinity. **Symplectic integrators**, of which Verlet and leapfrog are the famous examples, are built to preserve exactly that structure. They are the default in molecular dynamics, astrophysics, and game physics.

## Velocity Verlet

For a force depending only on position, $\mathbf a = \mathbf F(\mathbf x)/m$, the **velocity Verlet** scheme is:

```math
\mathbf{x}_{n+1} = \mathbf{x}_n + \mathbf{v}_n\,\Delta t + \tfrac{1}{2}\mathbf{a}_n\,\Delta t^2
```

```math
\mathbf{a}_{n+1} = \mathbf{F}(\mathbf{x}_{n+1})/m
```

```math
\mathbf{v}_{n+1} = \mathbf{v}_n + \tfrac{1}{2}(\mathbf{a}_n + \mathbf{a}_{n+1})\,\Delta t.
```

It is **second-order accurate**, **symplectic**, **time-reversible**, and needs only **one force evaluation per step** (carry $\mathbf a_{n+1}$ over as the next step's $\mathbf a_n$). That combination — cheap *and* structure-preserving — is why it dominates.

> :happygoose: Velocity Verlet is the sweet spot for conservative dynamics: second-order accuracy at the price of one force call, plus it conserves energy on average forever. RK4 is more accurate per step but is *not* symplectic — run it for millions of orbits and its energy slowly drifts, while Verlet's just wobbles in a bounded band. For long-time Hamiltonian simulation, "drifts slowly" loses to "wobbles forever." This is the headline result of the chapter.

## Leapfrog

Leapfrog stores positions and velocities at *interleaved* (half-step-offset) times — the velocities "leap over" the positions:

```math
\mathbf{v}_{n+1/2} = \mathbf{v}_{n-1/2} + \mathbf{a}_n\,\Delta t, \qquad \mathbf{x}_{n+1} = \mathbf{x}_n + \mathbf{v}_{n+1/2}\,\Delta t.
```

Leapfrog and velocity Verlet are *algebraically equivalent* — the same trajectory, just bookkept differently. Leapfrog is marginally cheaper; velocity Verlet is more convenient when you need position and velocity at the *same* time (e.g. to compute total energy).

> :angrygoose: Leapfrog's staggered storage is a footgun for energy diagnostics: kinetic energy wants $\mathbf v$ at integer steps, but leapfrog has it at half-steps. Computing $K$ from a half-step velocity and $U$ from an integer-step position gives a spurious energy error that looks like a bug in your physics. Either interpolate the velocity to the integer step or just use velocity Verlet, which keeps everything synchronized.

## What "Symplectic" Means

A Hamiltonian flow preserves **phase-space volume** (Liouville's theorem) and the **symplectic two-form** — roughly, it preserves oriented areas in $(\mathbf x, \mathbf p)$ space. A symplectic integrator is a discrete map that preserves that same structure *exactly*, even though it only approximates the trajectory.

The consequence is the **shadow (modified) Hamiltonian**: a symplectic integrator exactly conserves a Hamiltonian $\tilde H = H + O(\Delta t^2)$ that is *close* to the true $H$. Since $\tilde H$ is exactly conserved and stays near $H$, the computed energy oscillates within an $O(\Delta t^2)$ band **forever** — no secular drift.

> :nerdygoose: This is the crux. Non-symplectic methods (like explicit Euler or RK4) have a global energy *error* that accumulates step after step — a slow leak. Symplectic methods trade that leak for a small *bounded oscillation*, because they're secretly solving a nearby problem perfectly. Over $10^6$ steps the difference is night and day: a drifting orbit that escapes or crashes vs. one that stays put. The integrator's *geometry*, not just its Taylor order, governs long-time behavior.

## Energy Drift: Seeing the Difference

Run the same harmonic oscillator with each method and watch the total energy $E_n$:

| Method | Order | Symplectic? | Long-time energy |
|---|---|---|---|
| Explicit Euler | 1 | no | grows without bound |
| Implicit Euler | 1 | no | decays to zero |
| Symplectic Euler | 1 | yes | bounded oscillation |
| Velocity Verlet | 2 | yes | bounded oscillation, tighter |
| RK4 | 4 | no | very slow monotonic drift |

The non-symplectic methods either gain or lose energy monotonically; the symplectic ones keep it trapped in a band whose width shrinks like $\Delta t^2$.

## Time Reversibility

Verlet is **time-reversible**: flip the sign of velocity, step forward, and you retrace the path back to the start (up to round-off). Real conservative physics has this symmetry, so an integrator that respects it is faithful to the underlying dynamics. Dissipative schemes (implicit Euler) break it — they can't run backward because they've thrown information away.

## Computational / Algorithmic Touchpoints

- **Molecular dynamics** (GROMACS, LAMMPS, NAMD) use velocity Verlet/leapfrog precisely for energy conservation over billions of steps; a drifting integrator would "heat up" or "freeze" the simulated material artificially.
- **N-body astrophysics** uses symplectic integrators (sometimes with individual adaptive sub-steps) to evolve solar systems and galaxies over cosmological times.
- **Hamiltonian Monte Carlo** (HMC/NUTS) in Bayesian inference runs a leapfrog integrator over an artificial Hamiltonian to propose samples — its time-reversibility and volume preservation are *required* for the Metropolis acceptance to be correct (see the Stat Mech chapter).
- **Game physics**: position-based and Verlet-based engines are popular because they're stable and cheap, even if not perfectly accurate per frame.

```python
def velocity_verlet(force, x, v, m, dt, steps):
    a = force(x) / m
    traj = []
    for _ in range(steps):
        x = x + v * dt + 0.5 * a * dt * dt   # drift using current accel
        a_new = force(x) / m                 # single force eval at new position
        v = v + 0.5 * (a + a_new) * dt       # kick using averaged accel
        a = a_new                            # reuse next step -> 1 eval/step
        traj.append((x, v))
    return traj
```

## Quick Sanity Checks

- Verlet error should fall by ~4× when you halve $\Delta t$ (second order). If it only halves, you've degraded it to first order — check the $\tfrac12 a\,\Delta t^2$ term.
- Over a long run, Verlet's energy must stay in a *bounded band*, not drift. A monotonic climb/decay means you accidentally wrote a non-symplectic update (e.g. used old velocity for the position step incorrectly).
- Velocity Verlet must use exactly *one* force evaluation per step. Two means you're recomputing $\mathbf a_n$ instead of reusing it.
- Reverse the velocities and step backward: you should return to the start. Failure to retrace signals a non-reversible (buggy or dissipative) update.
- Compare against RK4 on a short run: Verlet is *less* accurate instantaneously but *more* faithful over long times. Both being true at once is the expected, not contradictory, result.
