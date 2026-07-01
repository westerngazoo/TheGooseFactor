---
sidebar_position: 3
sidebar_label: "Runge-Kutta Methods"
title: "Runge-Kutta Methods and RK4"
---

# Runge-Kutta Methods and RK4

Euler takes one slope and trusts it across the whole step. Runge–Kutta methods do something smarter: they *probe* the slope at several points within the step and combine those probes into a weighted average that cancels low-order error terms. The classical fourth-order method, **RK4**, hits a famous sweet spot of accuracy, robustness, and simplicity — it's the default general-purpose ODE integrator.

## The Idea: Sample the Slope Multiple Times

For $\dot{\mathbf y} = \mathbf f(\mathbf y, t)$, a single Euler step uses only $\mathbf f(\mathbf y_n, t_n)$. The error comes from the slope *changing* across the interval. RK methods estimate that change by evaluating $\mathbf f$ at trial points and blending the results so that the leading Taylor-error terms cancel.

### Midpoint method (RK2)

The simplest improvement: take a half-step to estimate the slope at the *middle* of the interval, then use that midpoint slope for the full step.

```math
\mathbf{k}_1 = \mathbf{f}(\mathbf{y}_n, t_n), \qquad \mathbf{k}_2 = \mathbf{f}\!\left(\mathbf{y}_n + \tfrac{\Delta t}{2}\mathbf{k}_1,\ t_n + \tfrac{\Delta t}{2}\right),
```

```math
\mathbf{y}_{n+1} = \mathbf{y}_n + \Delta t\,\mathbf{k}_2.
```

Using the midpoint slope cancels the first-order error term, making this **second-order accurate** ($O(\Delta t^2)$ global error) for two function evaluations.

> :mathgoose: The pattern: each extra, cleverly-placed slope evaluation cancels one more order of Taylor error. RK2 uses 2 evals for 2nd order; RK4 uses 4 evals for 4th order. This 1-to-1 trade holds up to order 4 — then it breaks (5th order needs *six* evaluations, not five — Butcher's barrier). That diminishing return is exactly why RK4 is the popular stopping point: it's the last "free lunch" where order equals evaluation count.

## The Classical RK4

Four slope probes — start, two at the midpoint, one at the end — combined with Simpson-like weights $\tfrac16(1,2,2,1)$:

```math
\mathbf{k}_1 = \mathbf{f}(\mathbf{y}_n, t_n)
```

```math
\mathbf{k}_2 = \mathbf{f}\!\left(\mathbf{y}_n + \tfrac{\Delta t}{2}\mathbf{k}_1,\ t_n + \tfrac{\Delta t}{2}\right)
```

```math
\mathbf{k}_3 = \mathbf{f}\!\left(\mathbf{y}_n + \tfrac{\Delta t}{2}\mathbf{k}_2,\ t_n + \tfrac{\Delta t}{2}\right)
```

```math
\mathbf{k}_4 = \mathbf{f}\!\left(\mathbf{y}_n + \Delta t\,\mathbf{k}_3,\ t_n + \Delta t\right)
```

```math
\mathbf{y}_{n+1} = \mathbf{y}_n + \frac{\Delta t}{6}\bigl(\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4\bigr).
```

It is **fourth-order accurate**: halving $\Delta t$ cuts the error by $2^4 = 16$. That steep convergence is why RK4 reaches engineering accuracy with comfortably large steps.

> :happygoose: RK4 is the "just use this" integrator for general, non-stiff, non-Hamiltonian problems. Four evaluations, fourth-order accuracy, no algebraic solve (unlike implicit methods), self-starting (unlike multistep methods), and trivial to code. When you don't have a special reason to pick something else, RK4 is the right default — which is why it shows up in every numerical methods course and library.

> :angrygoose: But RK4 is **not symplectic**. For long-time conservative simulations (orbits, molecular dynamics), its small per-step energy error accumulates into a slow drift, and the orbit will eventually spiral. For those, a symplectic Verlet/leapfrog beats RK4 *despite* RK4's higher order. Match the method to the job: RK4 for accuracy over moderate times and non-conservative forces; symplectic for energy fidelity over long times. Higher order is not automatically "better."

## Adaptive Step Size: RK45

Production solvers don't use a fixed $\Delta t$. **Embedded** methods like Runge–Kutta–Fehlberg (RKF45) or Dormand–Prince (the `RK45` in SciPy/MATLAB's `ode45`) compute *two* estimates of different order from the *same* slope evaluations. Their difference estimates the local error, which is used to:

- **shrink** $\Delta t$ where the solution changes rapidly (sharp features, close encounters), and
- **grow** $\Delta t$ where it's smooth,

holding the error per step near a user-set tolerance. You get accuracy where you need it and speed where you don't, automatically.

> :nerdygoose: The embedded trick is beautiful: by choosing the Butcher tableau so that two different weightings of the *same* $\mathbf k_i$ give a 4th- and a 5th-order estimate, you get an error estimate almost for free — no extra function evaluations beyond the few the higher-order method already needs. That error estimate drives the step-size controller. This is what "adaptive" means under the hood, and it's why `solve_ivp` "just works" across wildly different problems.

## Choosing an Integrator: a Cheat Sheet

| Situation | Recommended method |
|---|---|
| General non-stiff ODE, moderate time | RK4 or adaptive RK45 |
| Long-time conservative (orbits, MD) | Velocity Verlet / leapfrog (symplectic) |
| Stiff system (wide timescale spread) | Implicit (backward Euler, BDF, Radau) |
| Need error control / unknown smoothness | Adaptive RK45 |
| Quick-and-dirty intuition | Explicit Euler (baseline only) |

## Computational / Algorithmic Touchpoints

- **`scipy.integrate.solve_ivp(method="RK45")`** and MATLAB's `ode45` are adaptive Dormand–Prince — the everyday default for scientists.
- **Function-evaluation count is the cost metric**: RK4 costs 4 evals/step; when $\mathbf f$ is expensive (e.g. an N-body force), this dominates runtime, motivating larger steps or cheaper methods.
- **Vectorization**: applying RK4 to a large state vector (a discretized PDE, a particle ensemble) is pure array arithmetic — ideal for NumPy/GPU.
- **Error tolerance as a knob**: adaptive solvers expose `rtol`/`atol`; tightening them trades runtime for accuracy, the numerical analog of a precision dial.

```python
def rk4_step(f, y, t, dt):
    k1 = f(y, t)
    k2 = f(y + 0.5 * dt * k1, t + 0.5 * dt)
    k3 = f(y + 0.5 * dt * k2, t + 0.5 * dt)
    k4 = f(y + dt * k3, t + dt)
    return y + (dt / 6.0) * (k1 + 2 * k2 + 2 * k3 + k4)
```

## Quick Sanity Checks

- Halving $\Delta t$ should reduce RK4's error by ~16×. If you see ~4× or ~2×, a coefficient is wrong (you've effectively built RK2 or Euler).
- The weights must sum to 1: $\tfrac16(1 + 2 + 2 + 1) = 1$. If they don't, even a constant solution will drift.
- On a constant-slope problem ($\mathbf f = \text{const}$), all $\mathbf k_i$ are equal and RK4 reduces to the exact straight-line update. A good smoke test.
- RK4's energy on a long orbital run drifts slowly; Verlet's stays bounded. Observing this confirms RK4 is accurate-but-not-symplectic, as expected.
- An adaptive solver should take *small* steps through sharp features and *large* steps through smooth regions. Uniform step sizes mean the error controller isn't engaged.
