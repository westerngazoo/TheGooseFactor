---
sidebar_position: 4
sidebar_label: "Random Walks & Diffusion"
title: "Random Walks, Diffusion, and Search"
---

# Random Walks, Diffusion, and Search

Strip simulated annealing down to its skeleton and you find a **random walk** — the most fundamental stochastic process in physics and computing. Random walks describe how a drunk staggers home, how heat spreads, how a molecule wanders, how MCMC explores, and how diffusion-based generative models turn noise into images. This chapter studies the walk itself and the diffusion it produces, closing the loop from microscopic randomness to macroscopic search.

## The Random Walk

In one dimension, take steps of size $\pm a$ with equal probability. After $N$ steps the position is a sum of independent $\pm a$ increments. Two facts dominate everything:

```math
\langle x \rangle = 0, \qquad \langle x^2 \rangle = N a^2.
```

The mean displacement is zero (no preferred direction), but the **mean-squared** displacement grows linearly in the number of steps. The typical distance from the origin is therefore:

```math
x_{\text{rms}} = \sqrt{\langle x^2\rangle} = a\sqrt{N} \;\propto\; \sqrt{t}.
```

> :mathgoose: The signature of diffusion is **distance $\propto \sqrt{\text{time}}$**, not distance $\propto$ time. A random walker covers ground far more slowly than a directed mover: to get twice as far by diffusion alone takes *four times* as long. This $\sqrt{t}$ scaling (a direct consequence of variances adding for independent steps — the same fact from the probability book) is why stirring beats waiting for sugar to dissolve, and why pure random search is so slow in high dimensions.

> :surprisedgoose: A deep and humbling result (Pólya's theorem): a random walk on a 1-D or 2-D lattice returns to its origin with probability **1** — it's *recurrent*. But in 3-D and higher, the return probability drops below 1 — the walk is *transient* and can wander off forever. "A drunk man will find his way home, but a drunk bird may not." Dimensionality fundamentally changes whether random exploration is guaranteed to revisit where it's been — with direct consequences for random search and Markov chain coverage.

## From Random Walk to Diffusion

Take the continuum limit (many tiny steps) and the probability density $\rho(x,t)$ of the walker's position obeys the **diffusion equation**:

```math
\frac{\partial \rho}{\partial t} = D\,\frac{\partial^2 \rho}{\partial x^2}, \qquad D = \frac{a^2}{2\,\Delta t},
```

where $D$ is the **diffusion coefficient**. Starting from a point, the solution is a spreading Gaussian whose width grows as $\sqrt{2Dt}$:

```math
\rho(x,t) = \frac{1}{\sqrt{4\pi D t}}\,e^{-x^2/(4Dt)}.
```

> :nerdygoose: The diffusion equation and the Gaussian are two faces of the same coin — and that Gaussian is the central limit theorem in action: a sum of many independent small steps converges to a normal distribution. The fact that heat flow, ink spreading in water, and the price of a stock (geometric Brownian motion) all obey the *same* PDE is why this one equation is worth memorizing. Its discretization (the explicit scheme $\rho_i^{n+1} = \rho_i^n + D\frac{\Delta t}{\Delta x^2}(\rho_{i+1}^n - 2\rho_i^n + \rho_{i-1}^n)$) is also the textbook example of the CFL stability limit from the Computational Physics chapter.

## Diffusion as Search

Random walking *is* a search strategy — an undirected one. Its strengths and weaknesses define the landscape of sampling algorithms:

- **Pure diffusion** explores isotropically, with no bias toward good regions. Coverage scales as $\sqrt t$ — thorough but slow.
- **Biased diffusion (drift + diffusion)** adds a deterministic pull, giving the **Langevin equation** $\dot x = -\nabla U(x) + \sqrt{2D}\,\eta(t)$: descend the landscape *while* jiggling. This is exactly noisy gradient descent.
- **Metropolis MCMC** (previous chapter) is a random walk *reweighted* to spend time in low-energy regions in proportion to $e^{-\beta E}$ — directed diffusion toward good states.

```math
\underbrace{dx = -\nabla U\,dt}_{\text{gradient descent}} \;+\; \underbrace{\sqrt{2D}\,dW}_{\text{diffusion / noise}} \;=\; \text{Langevin dynamics}.
```

> :happygoose: This single equation unifies the whole book's themes. The drift term $-\nabla U$ is gradient descent (Optimization Landscapes chapter); the noise term is diffusion; together at temperature $D \leftrightarrow T$ they sample the Boltzmann distribution $e^{-U/T}$. Turn the noise off and you get plain gradient descent (gets stuck); turn it up and you get exploration (escapes traps); cool it over time and you get annealing. Optimization, sampling, and physics are the same dynamical system viewed at different noise levels.

## MCMC and Mixing

A Markov Chain Monte Carlo sampler is a random walk engineered to have a target stationary distribution. Its practical figure of merit is the **mixing time** — how many steps until the walk "forgets" its start and produces effectively independent samples. Because a random walk explores as $\sqrt t$, mixing can be slow, especially when the landscape has narrow passages between basins (high energy barriers). Speeding up mixing — better proposals, Hamiltonian Monte Carlo (which uses the leapfrog integrator from the Computational Physics chapter to take long, directed steps), parallel tempering — is the central engineering problem of practical MCMC.

> :angrygoose: A sampler that hasn't *mixed* gives confidently wrong answers — it reports statistics of wherever it started, not the true distribution. The diffusive $\sqrt t$ exploration means a naive random-walk sampler can take astronomically long to cross a high barrier between two modes, leaving entire regions unsampled while looking perfectly converged. Always check mixing diagnostics; never trust a single short chain that "looks settled."

## Diffusion Models: Search Run Backward

Modern **diffusion generative models** (the technology behind image generators) make this concrete: a *forward* process gradually adds Gaussian noise to data until it's pure noise (a random walk destroying structure), and a learned *reverse* process denoises step by step, turning noise back into a sample. Generation is diffusion run in reverse — sculpting structure out of randomness by following a learned drift, the Langevin equation with a trained $-\nabla U$.

## Computational / Algorithmic Touchpoints

- **Langevin Monte Carlo / SGLD**: adding scaled noise to gradient-descent steps samples the Boltzmann posterior and helps escape sharp minima — stochastic gradient *Langevin* dynamics.
- **Brownian-motion simulation**: cumulative sums of Gaussian increments model stock prices (Black–Scholes), particle trajectories, and noise processes.
- **The diffusion equation's discretization** is the canonical explicit-vs-implicit stability example; the stable step obeys $D\,\Delta t/\Delta x^2 \le \tfrac12$ (a CFL condition).
- **Mixing time** bounds the cost of MCMC; reducing it (HMC, tempering) is the difference between a usable and a useless sampler.

```python
import numpy as np
def langevin_step(x, grad_U, dt, D, rng):
    # drift down the landscape + diffusive noise -> samples exp(-U/T), T ~ D
    drift = -grad_U(x) * dt
    noise = np.sqrt(2 * D * dt) * rng.standard_normal(size=np.shape(x))
    return x + drift + noise
```

## Quick Sanity Checks

- Mean displacement of an unbiased walk is zero; mean-*squared* displacement grows linearly with steps. If $\langle x\rangle$ drifts from 0, your steps aren't symmetric.
- Spread grows as $\sqrt t$, not $t$. A linear-in-time spread means you have ballistic (directed) motion, not diffusion.
- Setting the noise to zero in Langevin dynamics must reduce it to plain gradient descent; setting the gradient to zero must give pure diffusion. Check both limits.
- The diffusion equation's explicit scheme blows up if $D\,\Delta t/\Delta x^2 > \tfrac12$ — if your heat simulation oscillates and explodes, shrink $\Delta t$.
- An MCMC chain that gives the same answer regardless of how long you run it (and matches a known case) has mixed; one whose answer keeps drifting hasn't.
