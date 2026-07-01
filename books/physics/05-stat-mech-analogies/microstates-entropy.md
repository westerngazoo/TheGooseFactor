---
sidebar_position: 1
sidebar_label: "Microstates & Entropy"
title: "Microstates, Macrostates, and Entropy"
---

# Microstates, Macrostates, and Entropy

Statistical mechanics is the bridge from the microscopic (positions and velocities of $10^{23}$ particles) to the macroscopic (temperature, pressure, entropy). Its central move — *count the configurations consistent with what you can measure* — is exactly the counting that powers probabilistic algorithms, information theory, and sampling. This chapter builds the vocabulary; the rest of the book turns it into algorithms.

## Microstates and Macrostates

A **microstate** is a complete specification of the system: every particle's exact position and momentum (or every spin's exact orientation). A **macrostate** is the coarse description you can actually observe: total energy, temperature, pressure, net magnetization.

The key fact: **many microstates map to the same macrostate.** Let $\Omega(E)$ be the number of microstates consistent with macrostate energy $E$ (the *multiplicity*).

> :nerdygoose: This is the same many-to-one structure as a hash function: many inputs (microstates) collide to the same bucket (macrostate). The multiplicity $\Omega$ is the bucket's size. Statistical mechanics is the study of which buckets are huge and which are tiny — and the punchline is that one bucket is so astronomically larger than all others that the system is overwhelmingly likely to be found in it. That dominant bucket *is* equilibrium.

## The Fundamental Postulate

For an isolated system in equilibrium: **every accessible microstate is equally probable.** The probability of a macrostate is then proportional to how many microstates realize it:

```math
P(\text{macrostate}) = \frac{\Omega(\text{macrostate})}{\Omega_{\text{total}}}.
```

Macrostates aren't favored because nature "prefers" them — they're favored because they're *more numerous*. Equilibrium is just the most probable macrostate, i.e. the one with the most microstates.

### Worked example — coin flips / spins

Flip $N$ coins. The macrostate "number of heads $= k$" has multiplicity $\binom{N}{k}$. For large $N$ this is sharply peaked at $k = N/2$: the "half heads" macrostate has vastly more microstates than "all heads."

```math
\frac{\Omega(N/2)}{\Omega(0)} = \binom{N}{N/2} \sim \frac{2^N}{\sqrt{N}}.
```

For $N = 100$, "50 heads" is about $10^{29}$ times more likely than "all heads." This is why you never see all $10^{23}$ gas molecules rush to one side of a room — that microstate exists, it's just unfathomably outnumbered.

> :surprisedgoose: The arrow of time is a counting argument. There's nothing in Newton's laws that forbids a shattered cup reassembling — the reverse trajectory is perfectly valid mechanics. It just maps to a microscopically tiny set of microstates compared to the "shattered" macrostate. Irreversibility isn't a law of dynamics; it's overwhelming odds. Things evolve toward more-probable (higher-multiplicity) macrostates simply because there are so many more of them.

## Entropy

**Entropy** is the logarithm of the multiplicity — Boltzmann's tombstone equation:

```math
S = k_B \ln \Omega,
```

where $k_B \approx 1.38\times10^{-23}\,\text{J/K}$ is Boltzmann's constant. The log turns astronomically large multiplicities into manageable additive quantities.

Why the logarithm? Because multiplicities *multiply* for independent systems ($\Omega_{12} = \Omega_1 \Omega_2$) while we want entropy to *add* ($S_{12} = S_1 + S_2$). The logarithm is the unique function converting products to sums.

> :mathgoose: $S = k_B \ln\Omega$ is the *same* quantity as **Shannon entropy** $H = -\sum_i p_i \log p_i$ from information theory, up to the constant $k_B$ and the choice of log base. When all $\Omega$ microstates are equally likely ($p_i = 1/\Omega$), Shannon's formula collapses to $\log\Omega$. Thermodynamic entropy *is* missing information — the number of bits you'd need to pin down the exact microstate given only the macrostate. Physics and information theory are speaking about the same thing.

## The Second Law

The **second law of thermodynamics**: the entropy of an isolated system never decreases.

```math
\Delta S_{\text{isolated}} \ge 0.
```

In the counting picture this is almost a tautology: systems evolve toward macrostates of higher multiplicity because those are overwhelmingly more probable. Equilibrium is the entropy-maximizing macrostate subject to the constraints (fixed energy, volume, particle number).

> :angrygoose: The second law is *statistical*, not absolute. Entropy *can* decrease — it's just exponentially unlikely for large $N$. For a handful of particles, fluctuations that lower entropy happen all the time (that's Brownian motion). The "law" only becomes ironclad in the thermodynamic limit $N \to \infty$. Don't apply it dogmatically to tiny systems, and don't claim it's ever *violated* by ordinary fluctuations — those are expected.

## Computational / Algorithmic Touchpoints

- **State-space size = multiplicity**: the number of configurations of a combinatorial problem is its $\Omega$; $\ln\Omega$ (entropy) measures the search difficulty. Counting microstates is counting feasible solutions.
- **Entropy = bits**: $\log_2\Omega$ is the number of bits to encode a microstate — the link between thermodynamics and data compression (a maximally compressed file is high-entropy/random-looking).
- **Boltzmann's insight underlies sampling**: because equilibrium = most-probable macrostate, *sampling* configurations in proportion to their probability (next chapters: Boltzmann distribution, MCMC) lets us estimate macroscopic quantities without enumerating $10^{23}$ states.
- **Maximum-entropy inference**: choosing the least-biased probability distribution consistent with known constraints (MaxEnt) is a direct algorithmic descendant of "equilibrium maximizes $S$."

```python
import math
def entropy_bits(multiplicity):
    return math.log2(multiplicity)          # bits to name one microstate

def shannon_entropy(probs):                  # general (non-equal) case
    return -sum(p * math.log2(p) for p in probs if p > 0)
```

## Quick Sanity Checks

- Entropy is maximized when all microstates are equally likely; it's zero when the system is pinned to a single microstate ($\Omega = 1 \Rightarrow S = 0$).
- Multiplicities multiply, entropies add. If you find yourself adding multiplicities or multiplying entropies, you dropped the logarithm.
- For $N$ two-state objects the total microstate count is $2^N$; the most probable macrostate (half-and-half) dominates more sharply as $N$ grows.
- The second law applies to *isolated* systems. A subsystem's entropy can fall if it dumps entropy into its surroundings (that's what refrigerators and living organisms do) — check the total.
- $\log\Omega$ should be extensive (proportional to system size). If your entropy doesn't scale with $N$, recheck whether you treated the parts as independent.
