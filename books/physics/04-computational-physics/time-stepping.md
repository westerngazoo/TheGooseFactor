---
sidebar_position: 1
sidebar_label: "Time Stepping & Euler"
title: "Time Stepping and the Euler Methods"
---

# Time Stepping and the Euler Methods

Almost no interesting differential equation has a closed-form solution. The workhorse of computational physics is **time stepping**: start from the initial state, approximate the change over a small interval $\Delta t$, and repeat. Every method in this book is a different rule for that one step. We begin with the simplest — the Euler family — because understanding *exactly* how and why it fails motivates everything that follows.

## The Initial Value Problem

We want to solve, for a state vector $\mathbf{y}(t)$,

```math
\frac{d\mathbf{y}}{dt} = \mathbf{f}(\mathbf{y}, t), \qquad \mathbf{y}(t_0) = \mathbf{y}_0.
```

Mechanics fits this mold once we use the first-order state form $\mathbf y = (\mathbf x, \mathbf v)$ with $\mathbf f = (\mathbf v, \mathbf F/m)$. The function $\mathbf f$ is the "slope field"; integrating means following the slopes forward from $\mathbf y_0$.

## Explicit (Forward) Euler

Approximate the derivative by the slope at the *current* point and step:

```math
\mathbf{y}_{n+1} = \mathbf{y}_n + \Delta t\,\mathbf{f}(\mathbf{y}_n, t_n).
```

This is the first two terms of the Taylor expansion $\mathbf y(t+\Delta t) = \mathbf y_n + \Delta t\,\mathbf f + \tfrac12 \Delta t^2 \mathbf y'' + \cdots$. The discarded $O(\Delta t^2)$ term is the **local truncation error**; accumulated over $N = T/\Delta t$ steps it gives **global error** $O(\Delta t)$ — first-order accurate.

> :mathgoose: "First-order accurate" means halving $\Delta t$ halves the error. That sounds fine until you want 6 digits: you'd need $\Delta t$ around $10^{-6}$ of the timescale, hence millions of steps, and by then floating-point round-off (which *grows* as you take more steps) starts eating your accuracy from the other side. There's an optimal $\Delta t$ that balances truncation error (wants small steps) against round-off accumulation (wants few steps). Smaller is *not* always better.

> :angrygoose: Explicit Euler is the method everyone writes first and regrets. Beyond being only first-order accurate, it is **not stable** for stiff or oscillatory systems and it **systematically injects energy** into conservative systems. Use it to build intuition and as a baseline — never as the integrator in anything you care about. The next chapters exist largely to replace it.

## Implicit (Backward) Euler

Evaluate the slope at the *future* point instead:

```math
\mathbf{y}_{n+1} = \mathbf{y}_n + \Delta t\,\mathbf{f}(\mathbf{y}_{n+1}, t_{n+1}).
```

Now $\mathbf y_{n+1}$ appears on both sides — you must *solve* (algebraically, or with Newton's method for nonlinear $\mathbf f$) for it at every step. The reward is **unconditional stability**: backward Euler never blows up no matter how large $\Delta t$, and it *dissipates* energy rather than injecting it.

> :nerdygoose: Explicit vs. implicit is the central trade-off in ODE solving. **Explicit**: cheap per step (just evaluate $\mathbf f$), but small steps required for stability. **Implicit**: expensive per step (solve a system), but huge steps allowed. For **stiff** problems — where some modes evolve far faster than others (a fast chemical reaction alongside slow diffusion, a stiff spring in a slow mechanism) — implicit wins decisively, because explicit methods are forced to crawl at the fastest mode's timescale even when you only care about the slow dynamics.

### Stability illustrated: the test equation

Apply each method to the decay equation $\dot y = -\lambda y$ ($\lambda > 0$), whose true solution decays to zero. One explicit-Euler step gives $y_{n+1} = (1 - \lambda\Delta t)y_n$. This decays only if $|1 - \lambda\Delta t| < 1$, i.e.

```math
\Delta t < \frac{2}{\lambda} \quad\text{(explicit Euler stability limit)}.
```

Exceed it and the numerical solution *oscillates and explodes* even though the true one decays. Backward Euler gives $y_{n+1} = y_n/(1 + \lambda\Delta t)$, which decays for *any* $\Delta t > 0$ — unconditionally stable.

## Symplectic (Semi-Implicit) Euler

For mechanical systems there's a third option that costs the same as explicit Euler but behaves far better. Update velocity first, then use the *new* velocity to update position:

```math
\mathbf{v}_{n+1} = \mathbf{v}_n + \Delta t\,\frac{\mathbf{F}(\mathbf{x}_n)}{m}, \qquad \mathbf{x}_{n+1} = \mathbf{x}_n + \Delta t\,\mathbf{v}_{n+1}.
```

It's still first-order accurate, but it is **symplectic**: it preserves phase-space area and keeps energy *bounded* (oscillating around the true value) over arbitrarily long runs, instead of drifting. The full story of why is in the next chapter.

> :surprisedgoose: Three methods — explicit, implicit, and symplectic Euler — all first-order accurate, all one line of code, behave *completely differently* on an orbit. Explicit spirals outward (gains energy), implicit spirals inward (loses energy), symplectic circles stably (conserves energy on average). The lesson: for long-time dynamics, the *structure* an integrator preserves matters more than its formal order of accuracy. A "better" order can still be the wrong tool.

## Computational / Algorithmic Touchpoints

- **The integrator interface**: every solver consumes the same `f(y, t)` right-hand side and a step size. Writing your physics as this callback decouples the model from the numerics.
- **Stiffness detection**: a wide spread of timescales (eigenvalues of $\partial\mathbf f/\partial\mathbf y$) signals stiffness → choose implicit. Libraries like `scipy.integrate.solve_ivp` offer both (`RK45` explicit, `BDF`/`Radau` implicit).
- **Newton's method inside implicit steps**: backward Euler on a nonlinear $\mathbf f$ requires a root solve each step — implicit integrators carry a linear/nonlinear solver inside the loop.
- **Energy logging as a debug tool**: integrate an oscillator and plot total energy to *see* which failure mode (gain/loss/bounded) your integrator exhibits.

```python
def explicit_euler(f, y, t, dt, steps):
    ys = [y]
    for _ in range(steps):
        y = y + dt * f(y, t)     # slope at the current point
        t += dt
        ys.append(y)
    return ys

def symplectic_euler(force, x, v, m, dt, steps):
    out = []
    for _ in range(steps):
        v = v + dt * force(x) / m   # update velocity first
        x = x + dt * v              # then position with the NEW velocity
        out.append((x, v))
    return out
```

## Quick Sanity Checks

- Halving $\Delta t$ should roughly halve the global error of any Euler method (first order). If error falls by 4×, you're accidentally running a second-order scheme.
- On $\dot y = -\lambda y$, explicit Euler must blow up once $\Delta t > 2/\lambda$. Reproducing that threshold confirms your stability understanding.
- Run an undamped oscillator long enough: explicit Euler's energy climbs, symplectic Euler's stays bounded. This single experiment tells you which one you actually wrote.
- Backward Euler should never blow up regardless of step size — if it does, your implicit solve isn't converging.
- The right-hand side $\mathbf f$ must have units of $\mathbf y$ per time. A units mismatch in $\mathbf f$ corrupts every step.
