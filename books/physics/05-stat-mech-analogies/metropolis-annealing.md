---
sidebar_position: 3
sidebar_label: "Metropolis & Annealing"
title: "The Metropolis Criterion and Simulated Annealing"
---

# The Metropolis Criterion and Simulated Annealing

How do you sample from the Boltzmann distribution $P(x) \propto e^{-\beta E(x)}$ when you can't compute the partition function $Z$ and can't enumerate the states? The **Metropolis algorithm** answers this with a remarkably simple rule, and **simulated annealing** repurposes it into one of the most general-purpose optimization methods ever devised. This is where stat-mech becomes an algorithm you can run.

## The Sampling Problem

We want configurations drawn with probability $\propto e^{-\beta E(x)}$. Directly, that requires $Z = \sum_x e^{-\beta E(x)}$ — an intractable sum over all states. The escape: build a **Markov chain** that *wanders* through state space such that its long-run visitation frequency equals the Boltzmann distribution, without ever computing $Z$.

## Detailed Balance and the Metropolis Criterion

A sufficient condition for a Markov chain to have $P(x)$ as its stationary distribution is **detailed balance**:

```math
P(x)\,T(x \to x') = P(x')\,T(x' \to x),
```

where $T$ is the transition probability. The **Metropolis** recipe satisfies this by accepting a proposed move from $x$ to $x'$ with probability:

```math
A(x \to x') = \min\!\left(1,\ e^{-\beta\,\Delta E}\right), \qquad \Delta E = E(x') - E(x).
```

The genius is that only the energy *difference* $\Delta E$ appears — the intractable $Z$ cancels in the ratio $P(x')/P(x) = e^{-\beta\Delta E}$.

The algorithm:

1. Propose a small random change to the current state.
2. Compute $\Delta E$.
3. If $\Delta E \le 0$ (downhill), **always accept**.
4. If $\Delta E > 0$ (uphill), accept with probability $e^{-\beta\Delta E}$; otherwise stay put.
5. Repeat.

> :happygoose: Step 4 is the whole trick. A pure greedy/downhill method gets trapped in the first local minimum it finds. Metropolis *sometimes climbs uphill* — with a probability that shrinks exponentially in how bad the uphill move is and how cold it is. This controlled willingness to go backward is exactly what lets the chain escape local traps and explore. The downhill-always / uphill-sometimes asymmetry is what makes the stationary distribution come out Boltzmann.

> :mathgoose: Why $\min(1, e^{-\beta\Delta E})$ and not just $e^{-\beta\Delta E}$? Detailed balance only constrains the *ratio* of forward and backward acceptances. Capping at 1 makes downhill moves always-accepted (you can't have probability > 1) while keeping the uphill/downhill ratio correct. This is the maximal acceptance rate consistent with detailed balance — it wastes the fewest proposals while still sampling the right distribution.

## Simulated Annealing

Metropolis at fixed $T$ *samples* the Boltzmann distribution. **Simulated annealing** turns it into an *optimizer* by slowly lowering the temperature during the run:

```math
T_k \;\longrightarrow\; 0 \quad\text{(slowly)},\qquad \text{e.g.}\quad T_k = \frac{T_0}{\ln(1+k)}\ \text{or}\ T_k = T_0\,\alpha^k.
```

- **High $T$ early**: the chain roams freely, accepting many uphill moves, surveying the whole landscape (exploration).
- **Low $T$ late**: uphill moves become rare, the chain settles into a deep basin (exploitation).
- As $T\to0$, the Boltzmann distribution concentrates on the global minimum — *if* you cooled slowly enough.

The name and method come straight from metallurgy: heat a metal and cool it slowly so atoms find a low-energy (defect-free) crystal, rather than quenching it into a brittle, defect-ridden glass.

> :nerdygoose: The cooling schedule is everything. Cool too fast ("quenching") and you freeze into a poor local minimum — the algorithmic equivalent of brittle glass. The theoretical guarantee of reaching the global optimum requires logarithmic cooling $T_k \propto 1/\ln k$, which is impractically slow, so in practice people use geometric cooling $T_k = T_0\alpha^k$ (with $\alpha \approx 0.95$) and accept a "good enough" answer. Annealing trades the *guarantee* for *speed*, and tuning that trade-off is the practitioner's job.

> :surprisedgoose: Simulated annealing is astonishingly general. It needs only (1) a way to propose a neighboring state and (2) an energy/cost function — *no gradients, no convexity, no continuity*. That's why it tackles the traveling salesman problem, VLSI chip layout, protein folding, and scheduling, where the landscape is discrete and gradient methods don't even apply. When you have a cost function and nothing else, annealing is a reasonable first attack.

## Worked Framing — TSP

For the traveling salesman problem: a *state* is a tour, the *energy* is the tour length, a *proposed move* is reversing a random segment (2-opt), and $\Delta E$ is the cheap-to-compute change in length. Run Metropolis while cooling, and the tour shortens, occasionally accepting a longer tour early on to escape a locally-optimal-but-globally-bad route.

## Computational / Algorithmic Touchpoints

- **MCMC for Bayesian inference**: Metropolis–Hastings (the asymmetric-proposal generalization) samples posterior distributions in statistics without computing the normalizing evidence — the same $Z$-cancellation trick.
- **Simulated annealing as a black-box optimizer**: ships in `scipy.optimize.dual_annealing`; the go-to when the objective is non-differentiable, non-convex, or combinatorial.
- **Only $\Delta E$ matters**: efficient implementations compute the energy *change* of a proposed move incrementally (e.g. the edges swapped in TSP), never the full energy — huge speedups.
- **Acceptance-rate tuning**: aim for a proposal acceptance rate around 20–50%; too high means steps are too timid, too low means too bold. This diagnostic guides proposal-size tuning.

```python
import math, random
def simulated_annealing(energy, neighbor, state, T0, alpha, steps):
    E = energy(state); best, bestE = state, E
    T = T0
    for k in range(steps):
        cand = neighbor(state)
        dE = energy(cand) - E
        if dE <= 0 or random.random() < math.exp(-dE / T):   # Metropolis criterion
            state, E = cand, E + dE
            if E < bestE:
                best, bestE = state, E
        T *= alpha                                            # geometric cooling
    return best, bestE
```

## Quick Sanity Checks

- Downhill moves ($\Delta E \le 0$) must *always* be accepted; if your code ever rejects one, the $\min(1,\cdot)$ is wrong.
- At very high $T$, acceptance probability $\to 1$ for all moves (random walk); at $T\to0$, only downhill moves are accepted (greedy descent). Verify both limits.
- Only $\Delta E$ should enter the acceptance test — if your formula needs the absolute energy or $Z$, you've missed the point of the method.
- Track the acceptance rate: near 0% means $T$ is too low or steps too large; near 100% means $T$ is too high or steps too small.
- Cooling too fast should visibly worsen the final answer (frozen in a local minimum). If cooling rate makes no difference, the schedule isn't actually engaging.
