---
sidebar_position: 4
sidebar_label: "Stability, Error & Step Size"
title: "Numerical Stability, Error, and Choosing the Step Size"
---

# Numerical Stability, Error, and Choosing the Step Size

Two distinct things can go wrong in a time-stepped simulation: the answer can be *inaccurate* (close, but off by a controllable amount) or *unstable* (qualitatively wrong — blowing up or oscillating when it shouldn't). They have different cures. This chapter separates accuracy from stability, defines the order of a method precisely, and turns "pick a good $\Delta t$" into a principled decision.

## Two Kinds of Error

- **Local truncation error**: the error introduced in a *single* step, from truncating the Taylor series. For a method of order $p$ it is $O(\Delta t^{p+1})$.
- **Global error**: the accumulated error after stepping across a fixed interval $T$, requiring $N = T/\Delta t$ steps. Summing $N$ local errors gives global error $O(\Delta t^{p})$ — one power lower.

```math
\text{order } p:\quad \text{local error} = O(\Delta t^{p+1}), \quad \text{global error} = O(\Delta t^{p}).
```

| Method | Order $p$ | Global error |
|---|---|---|
| Euler (explicit/implicit/symplectic) | 1 | $O(\Delta t)$ |
| Midpoint / RK2 / Verlet | 2 | $O(\Delta t^2)$ |
| RK4 | 4 | $O(\Delta t^4)$ |

> :mathgoose: "Order $p$" is an exponent on $\Delta t$, and the only honest way to *measure* it is a **convergence study**: run at $\Delta t$, then $\Delta t/2$, $\Delta t/4$, and check the error ratio. For order $p$, halving the step should divide the error by $2^p$. If you claim RK4 but see the error merely quartering, you have a bug — a wrong coefficient silently demoted your method. This empirical check is the integrator's unit test.

## Round-off vs. Truncation: the U-Curve

Truncation error *decreases* as $\Delta t \to 0$, but each step also carries floating-point **round-off** of size $\sim \epsilon_{\text{machine}}$, and more steps accumulate more of it. Total error is roughly:

```math
E(\Delta t) \approx \underbrace{C\,\Delta t^{p}}_{\text{truncation}} + \underbrace{\frac{\epsilon_{\text{machine}}}{\Delta t}}_{\text{round-off}}.
```

This sum has a **minimum** at some optimal $\Delta t^\star$; below it, round-off dominates and shrinking the step makes things *worse*.

> :angrygoose: "Just make the step tiny" is wrong twice over. First, it's slow (more steps). Second, past the optimal $\Delta t^\star$ it's *less accurate*, because round-off error grows as you take more steps. With `float64` ($\epsilon \approx 2\times10^{-16}$) you rarely hit this wall, but with `float32` (common on GPUs) you hit it early — single-precision physics can refuse to get more accurate no matter how small you make $\Delta t$. Know your floating-point budget.

## Stability: a Different Failure

Accuracy is about *how close*; stability is about *whether the error stays bounded*. An unstable method produces solutions that grow without limit even when the true solution is bounded — a qualitative failure, not a quantitative one.

### The linear stability analysis

Test any method on $\dot y = \lambda y$ (the linearization of any system near a fixed point; $\lambda$ is an eigenvalue of the Jacobian). A one-step method gives $y_{n+1} = R(\lambda\Delta t)\,y_n$ for some **amplification factor** $R(z)$. Stability requires:

```math
|R(\lambda\Delta t)| \le 1.
```

For **explicit Euler**, $R(z) = 1 + z$, so for a decaying mode ($\lambda < 0$ real) stability needs $\Delta t < 2/|\lambda|$. For **backward Euler**, $R(z) = 1/(1-z)$, which has $|R|\le 1$ for *all* $\lambda\Delta t$ with $\mathrm{Re}(\lambda)\le 0$ — **A-stable** (unconditionally stable).

> :nerdygoose: The **region of absolute stability** is the set of complex $z = \lambda\Delta t$ where $|R(z)| \le 1$. Explicit methods have *bounded* stability regions (you must keep $\Delta t$ small enough to stay inside); implicit methods can have *unbounded* ones (stable for any step). Plotting these regions is how numerical analysts compare methods at a glance. The whole stiff-vs-nonstiff decision is "does my $\lambda\Delta t$ fit inside the explicit method's region without forcing an absurdly small $\Delta t$?"

## Stiffness

A system is **stiff** when it contains widely separated timescales — a fast-decaying mode alongside slow dynamics you actually care about. Explicit methods must keep $\Delta t$ small enough to stay stable for the *fastest* mode, even after that mode has died and contributes nothing to the answer. This makes them crawl. The cure is an implicit method whose stability region contains the fast mode for any $\Delta t$.

```math
\text{stiffness ratio} \sim \frac{|\lambda_{\max}|}{|\lambda_{\min}|} \gg 1.
```

> :surprisedgoose: Stiffness is counterintuitive: the troublesome mode is one that decays so fast it's *irrelevant* to the solution — yet it dictates the step size for an explicit method. You're forced to resolve a transient you don't care about. Chemical kinetics (fast and slow reactions), circuit simulation (fast and slow RC sections), and control systems are notoriously stiff. Recognizing stiffness and switching to an implicit/BDF solver can turn a multi-day run into seconds.

## Choosing the Step Size: a Procedure

1. **Resolve the fastest *relevant* timescale.** For an oscillator of period $T$, use $\Delta t \lesssim T/20$ or finer for accuracy.
2. **Check stability**, not just accuracy. For explicit methods confirm $\Delta t$ keeps $\lambda\Delta t$ inside the stability region; if that forces an absurd $\Delta t$, the system is stiff — switch to implicit.
3. **Do a convergence study** to confirm you're in the asymptotic regime (error $\propto \Delta t^p$) and that round-off hasn't taken over.
4. **Prefer adaptive stepping** when the solution has both calm and violent phases — let the error controller choose $\Delta t$.

## Computational / Algorithmic Touchpoints

- **Convergence studies** (Richardson extrapolation) both measure a method's order and squeeze extra accuracy from two coarse runs.
- **Automatic stiffness switching**: solvers like LSODA detect stiffness on the fly and switch between explicit (Adams) and implicit (BDF) methods.
- **CFL condition** in PDE solvers is the same stability idea: the step size must be small enough that information doesn't cross more than one grid cell per step, or the scheme blows up.
- **Mixed precision**: knowing the round-off floor tells you when `float32` (fast on GPUs) suffices and when you must pay for `float64`.

```python
def convergence_order(run, exact, dt):
    # empirically estimate a method's order from two step sizes
    e1 = abs(run(dt)      - exact)
    e2 = abs(run(dt / 2)  - exact)
    import math
    return math.log2(e1 / e2)   # ~p for an order-p method
```

## Quick Sanity Checks

- Order check: halving $\Delta t$ should divide global error by $2^p$. Measure it; don't trust the label.
- If shrinking $\Delta t$ stops helping (or hurts), you've hit the round-off floor — stop, or switch to higher precision.
- A blow-up that *worsens* as $\Delta t$ grows past a threshold is instability, not inaccuracy; shrink the step or go implicit.
- A blow-up that persists at *any* step size for a decaying problem means the system is stiff and your explicit method can't handle it — switch to implicit/BDF.
- Implicit methods shouldn't blow up for a dissipative problem regardless of $\Delta t$; if yours does, the inner nonlinear solve isn't converging.
