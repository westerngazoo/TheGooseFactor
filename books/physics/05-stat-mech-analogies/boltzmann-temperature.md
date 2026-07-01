---
sidebar_position: 2
sidebar_label: "Boltzmann & Temperature"
title: "The Boltzmann Distribution and Temperature"
---

# The Boltzmann Distribution and Temperature

When a system can exchange energy with a large reservoir at temperature $T$, it no longer visits every microstate equally — low-energy states become exponentially favored. The **Boltzmann distribution** quantifies this, and it is arguably the single most important formula connecting physics to machine learning: softmax, energy-based models, and simulated annealing are all Boltzmann distributions wearing different clothes.

## The Boltzmann Distribution

The probability that a system in contact with a heat bath at temperature $T$ occupies a microstate of energy $E_i$ is:

```math
P(E_i) = \frac{1}{Z}\,e^{-E_i / k_B T}, \qquad Z = \sum_j e^{-E_j / k_B T}.
```

The exponential $e^{-E/k_BT}$ is the **Boltzmann factor**; the normalizer $Z$ is the **partition function**. It's standard to abbreviate $\beta = 1/(k_B T)$ (the "inverse temperature"), giving $P(E_i) \propto e^{-\beta E_i}$.

> :mathgoose: The Boltzmann distribution is *derived*, not postulated. Maximize the entropy $S = -k_B\sum_i p_i \ln p_i$ subject to (a) normalization $\sum p_i = 1$ and (b) fixed average energy $\langle E\rangle = \sum p_i E_i$. The Lagrange multiplier on the energy constraint *is* $\beta = 1/k_BT$, and the maximizer is exactly $p_i \propto e^{-\beta E_i}$. Temperature emerges as the price of energy — the multiplier enforcing the energy budget. This is the maximum-entropy principle, the same tool used to derive least-biased priors in statistics.

## Temperature Controls the Spread

Temperature sets how sharply probability concentrates on low-energy states:

- **$T \to 0$** ($\beta \to \infty$): only the ground state(s) survive; the distribution collapses onto the global energy minimum. Frozen, greedy.
- **$T \to \infty$** ($\beta \to 0$): all Boltzmann factors $\to 1$; every state is equally likely (the uniform distribution of the previous chapter). Maximally exploratory.
- **Intermediate $T$**: a smooth trade-off — low-energy states preferred, but higher ones still visited with nonzero probability.

> :nerdygoose: This "temperature as an exploration knob" is the entire idea behind **simulated annealing** (next chapter) and the **temperature** parameter in large language models. High $T$ = adventurous, samples widely, escapes local traps. Low $T$ = conservative, exploits the best-known states, risks getting stuck. The softmax temperature you tweak when sampling from an LLM is *literally* $1/\beta$ in a Boltzmann distribution over token logits (energies).

## The Partition Function

$Z$ looks like a mere normalizer, but it encodes all thermodynamics. Once you have $Z(\beta)$, averages follow by differentiation:

```math
\langle E \rangle = -\frac{\partial \ln Z}{\partial \beta}, \qquad \operatorname{Var}(E) = \frac{\partial^2 \ln Z}{\partial \beta^2}.
```

The free energy $F = -k_BT\ln Z$ is the quantity that's actually minimized at fixed temperature — the thermodynamic analogue of a loss function.

> :surprisedgoose: $Z$ is exactly the **normalizing constant** (the "evidence" or "marginal likelihood") that makes Bayesian inference hard — it's a sum/integral over all states. Computing $Z$ is generally intractable (it's the source of the $\#P$-hardness in many problems), which is *why* we sample instead of enumerate. The entire field of MCMC (later in this book) exists to sidestep computing $Z$: clever sampling lets you draw from $P \propto e^{-\beta E}$ without ever evaluating the partition function.

## Connection to Softmax

Write the Boltzmann distribution over a set of "logits" $z_i = -E_i$ and set $\beta = 1$:

```math
P_i = \frac{e^{z_i}}{\sum_j e^{z_j}} = \mathrm{softmax}(z)_i.
```

**Softmax is the Boltzmann distribution.** Energy-based models, the final layer of a classifier, and policy distributions in reinforcement learning all assign probability $\propto e^{-E}$ to configurations. "Lower energy = higher probability" is the unifying statement.

> :happygoose: This is the payoff for an ML reader. Every time you call softmax, you're computing a Boltzmann distribution; the denominator is a partition function; the temperature is $1/\beta$. Training an energy-based model = shaping $E(x)$ so that real data sits in low-energy valleys. The physics vocabulary (energy, temperature, partition function, free energy) and the ML vocabulary (logits, temperature, normalizer, loss) are the *same mathematics*. Learn it once.

## Worked Example — two-level system

A system with two states, energies $0$ and $\varepsilon$. The probability of the excited state:

```math
P(\varepsilon) = \frac{e^{-\beta\varepsilon}}{1 + e^{-\beta\varepsilon}} = \frac{1}{1 + e^{\beta\varepsilon}} = \sigma(-\beta\varepsilon),
```

which is the **logistic sigmoid**. At $T\to0$ the system is in the ground state; at $T\to\infty$ both states are equally likely ($P = \tfrac12$). The sigmoid that gates a neuron is a two-level Boltzmann probability.

## Computational / Algorithmic Touchpoints

- **Softmax / temperature sampling**: dividing logits by a temperature before softmax is exactly tuning $\beta$ — the standard control for creativity-vs-determinism in generative models.
- **Energy-based models & Boltzmann machines**: define $P(x) \propto e^{-E_\theta(x)}$ and learn $\theta$; sampling and training both wrestle with the intractable $Z$.
- **Gibbs/Boltzmann sampling**: drawing configurations with probability $\propto e^{-\beta E}$ is the core primitive of MCMC and simulated annealing (next chapters).
- **Free energy as a loss**: variational inference minimizes a free-energy-like objective (the ELBO is a free energy in disguise), directly importing $F = \langle E\rangle - TS$.

```python
import numpy as np
def boltzmann(energies, beta):
    z = -beta * np.asarray(energies)
    z -= z.max()                  # subtract max for numerical stability (Z-invariant)
    w = np.exp(z)
    return w / w.sum()            # == softmax(-beta * energies)
```

## Quick Sanity Checks

- Probabilities must sum to 1 — that's the whole job of $Z$. If they don't, you forgot to normalize.
- Lower energy ⇒ higher probability. If your high-energy states are more likely, you have a sign error in the exponent (it's $e^{-\beta E}$, minus included).
- $T\to\infty$ must give the uniform distribution; $T\to0$ must concentrate on the minimum-energy state(s). Check both limits.
- Subtract the maximum logit before exponentiating; otherwise $e^{-\beta E}$ overflows/underflows. The result is unchanged because $Z$ rescales identically.
- A two-level system's excited-state probability is a sigmoid; if it exceeds $\tfrac12$ for $\varepsilon>0$ at finite $T$, recheck — the ground state must dominate.
