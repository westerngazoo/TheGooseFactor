---
sidebar_position: 4
sidebar_label: "Momentum & Basins"
title: "Momentum, Basins of Attraction, and ML Optimization"
---

# Momentum, Basins of Attraction, and ML Optimization

Gradient descent is a ball sliding through syrup — overdamped, memoryless, easily stalled. What if we give the ball *mass*? It builds speed downhill, coasts through small bumps, and powers along shallow valleys. That's the **momentum** method, and it's the closing synthesis of this book: a literal Newtonian particle rolling on the loss landscape, tying together force, inertia, friction, and the basins they navigate.

## The Heavy-Ball Method

Return to the *full* damped equation of motion on the potential (not the overdamped limit of gradient descent):

```math
m\ddot{\mathbf{x}} = -\nabla U(\mathbf{x}) - b\dot{\mathbf{x}}.
```

A ball of mass $m$ feels the downhill force $-\nabla U$ and friction $-b\dot{\mathbf x}$. Discretize it and you get **momentum (heavy-ball) gradient descent**:

```math
\mathbf{v}_{k+1} = \beta\,\mathbf{v}_k - \eta\,\nabla U(\mathbf{x}_k), \qquad \mathbf{x}_{k+1} = \mathbf{x}_k + \mathbf{v}_{k+1}.
```

The **momentum coefficient** $\beta \in [0,1)$ is the fraction of velocity retained each step — it plays the role of *(1 − friction)*. With $\beta = 0$ there's no inertia and you recover plain gradient descent; as $\beta \to 1$ the ball is nearly frictionless and coasts a long way.

> :happygoose: This is the grand unification of the book. The optimizer is *literally* a Newtonian particle (Kinematics chapter) on a potential energy surface (this chapter's opening), descending via $-\nabla U$ (Energy chapter), discretized by a time-stepping scheme (Computational Physics chapter), with friction tuned to settle rather than orbit. Momentum optimization is mechanics. The $\beta$ knob is how much the ball remembers its past motion — its inertia.

## Why Momentum Helps

Momentum fixes the two big failures of vanilla gradient descent:

- **Shallow valleys**: gradient descent inches along a low-gradient floor. Momentum *accumulates* velocity in the consistent downhill direction, accelerating along the valley like a marble gaining speed on a long gentle slope.
- **Zigzag in ill-conditioned bowls**: oscillations across a narrow valley *alternate sign* and partially cancel under the running average, while the consistent along-valley component *adds up*. Momentum damps the zigzag and amplifies real progress.
- **Small bumps and shallow saddles**: an inertial ball coasts over minor ripples and rolls off flat saddle ridges that would trap a memoryless descent.

> :nerdygoose: **Nesterov's accelerated gradient** — a slightly smarter momentum that evaluates the gradient at the *look-ahead* point $\mathbf x_k + \beta\mathbf v_k$ — provably improves the convergence rate on convex problems from $O(1/k)$ to $O(1/k^2)$. The physical intuition is a ball that "looks ahead" to where its momentum is carrying it and brakes *before* overshooting the wall, rather than after. Same heavy ball, better anticipation.

> :angrygoose: Momentum is not free of danger. Too much inertia (large $\beta$, too little friction) and the ball overshoots the minimum and oscillates — or sails right past a good basin and out the other side, exactly like an underdamped oscillator that won't settle. The friction (via $\beta$) and step size (via $\eta$) must be balanced toward the *critically damped* regime from the Harmonic Oscillator chapter: fast settling without ringing. Cranking $\beta$ to 0.99 and wondering why training oscillates is the optimization version of forgetting the damper.

## Basins of Attraction

A **basin of attraction** of a minimum is the set of starting points whose downhill trajectories all end at that minimum. The landscape partitions into basins separated by **ridges** and **saddles** (the watershed boundaries — water on either side flows to a different valley).

```math
\text{basin}(\mathbf{x}^\star) = \{\mathbf{x}_0 : \text{descent from } \mathbf{x}_0 \text{ converges to } \mathbf{x}^\star\}.
```

Consequences that explain a lot of practical ML:

- **Initialization decides the basin.** Where you start determines which minimum a deterministic descent finds — hence the importance of good weight initialization and the practice of multiple random restarts.
- **Inertia can cross ridges.** A heavy ball with enough momentum can climb out of a shallow basin over a low saddle into a better one — something overdamped descent never does.
- **Noise can cross ridges too.** Stochastic gradient noise (and explicit temperature, à la annealing) lets the iterate hop between basins, biasing it toward *wide, flat* basins that tend to generalize better.

> :surprisedgoose: This connects every chapter at once. Crossing a ridge between basins is exactly escaping a local trap — and the three tools for it are precisely the book's three dynamical ingredients: **inertia** (momentum, this chapter), **noise/temperature** (simulated annealing and Langevin diffusion, the Stat Mech chapters), and **curvature awareness** (Newton/saddle-free methods, previous chapter). Optimization, mechanics, and statistical physics are one subject viewed through different knobs: mass, temperature, and curvature.

## The Modern Optimizer Zoo, Decoded

Every popular deep-learning optimizer is this physical picture with refinements:

| Optimizer | Physical reading |
|---|---|
| **SGD** | overdamped descent + noise (Langevin) |
| **SGD + momentum** | heavy ball with friction |
| **Nesterov** | look-ahead heavy ball |
| **RMSProp / Adagrad** | per-axis step sizes (diagonal preconditioner / per-direction stiffness) |
| **Adam** | momentum + per-axis preconditioning combined |

Adam, the default for much of deep learning, is just *momentum plus a cheap diagonal approximation to inverse curvature* — a heavy ball that also rescales each axis by its local steepness.

## Computational / Algorithmic Touchpoints

- **Adam/AdamW** dominate deep learning: first moment = momentum (inertia), second moment = per-coordinate curvature estimate (a diagonal $H^{-1}$ surrogate).
- **Learning-rate + momentum schedules** (warmup, cyclical, SGDR restarts) are deliberately injecting/removing energy to explore basins early and settle late — annealing by another name.
- **Flat-minima bias**: SGD noise preferentially settles in wide basins; explicit regularizers (SAM, weight decay) reshape the landscape toward them for better generalization.
- **Random restarts / ensembles** sample multiple basins, the optimization analogue of running many independent physical descents from different initial conditions.

```python
def momentum_gd(grad_U, x, lr, beta, steps):
    v = 0.0
    traj = [x]
    for _ in range(steps):
        v = beta * v - lr * grad_U(x)   # heavy ball: retain beta of velocity, add force
        x = x + v
        traj.append(x)
    return traj
```

## Quick Sanity Checks

- Setting $\beta = 0$ must recover plain gradient descent. If it doesn't, your velocity update is mis-wired.
- Too-large $\beta$ (too little friction) makes the iterate overshoot and oscillate — the underdamped regime. If training rings, lower $\beta$ or $\eta$ toward critical damping.
- Different random initializations can land in different basins (different final losses); identical results from very different starts suggest a single dominant basin or a bug fixing the seed.
- Momentum should *accelerate* progress down a long shallow valley relative to vanilla descent; if it doesn't help there, the accumulation term isn't carrying over between steps.
- A heavy ball can transiently *increase* $U$ while coasting uphill over a saddle — unlike overdamped descent, a brief loss increase under momentum is normal, not necessarily a bug.
