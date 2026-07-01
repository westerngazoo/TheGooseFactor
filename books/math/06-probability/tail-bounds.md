---
sidebar_position: 5
sidebar_label: "Tail Bounds & Concentration"
title: "Tail Bounds: Markov, Chebyshev, Chernoff"
---

# Tail Bounds: Markov, Chebyshev, and Chernoff

A tail bound answers "how unlikely is it that a random variable strays far from its mean?" These inequalities are the backbone of *high-probability* guarantees in randomized algorithms — they convert "expected behavior" into "almost-certain behavior."

## The Union Bound

The simplest and most-used inequality. For any events $A_1, \dots, A_n$:

```math
P\!\left(\bigcup_{i} A_i\right) \le \sum_{i} P(A_i).
```

No independence required. To show "nothing bad happens," bound each bad event's probability and sum.

> :happygoose: The union bound is the workhorse of "with high probability" proofs. If each of $n$ bad events has probability $\le 1/n^2$, then *all* are avoided with probability $\ge 1 - n\cdot 1/n^2 = 1 - 1/n$. Crude, distribution-free, and astonishingly effective. Reach for it first.

## Markov's Inequality

For a **non-negative** random variable $X$ and any $a > 0$:

```math
P(X \ge a) \le \frac{\mathbb{E}[X]}{a}.
```

It uses only the mean and non-negativity — the weakest possible assumptions, hence the weakest bound.

**Example.** If the average response time is 100 ms, at most $1/4$ of requests can exceed 400 ms ($P(X \ge 400) \le 100/400$).

> :angrygoose: Markov **requires $X \ge 0$.** Apply it to a variable that can go negative and you get nonsense. When you want a bound on a two-sided deviation, apply Markov to $|X - \mu|$ or $(X-\mu)^2$ — which is exactly how Chebyshev is born.

## Chebyshev's Inequality

Apply Markov to $(X - \mu)^2 \ge 0$ with $\mu = \mathbb{E}[X]$, $\sigma^2 = \operatorname{Var}(X)$:

```math
P(|X - \mu| \ge k\sigma) \le \frac{1}{k^2}.
```

Equivalently $P(|X - \mu| \ge a) \le \sigma^2 / a^2$. Now we use the variance, so the bound is *two-sided* and tighter when $X$ is concentrated.

**Example.** At most $1/9$ of any distribution's mass lies beyond $3$ standard deviations from the mean — for *every* distribution with finite variance.

> :mathgoose: Chebyshev is the bridge from "variance is small" to "the value is reliably near the mean." It's how the weak law of large numbers is proven: the sample mean of $n$ i.i.d. variables has variance $\sigma^2/n \to 0$, so by Chebyshev it concentrates at the true mean. Distribution-free, which is its strength and its weakness.

## Chernoff Bounds

When $X = \sum_{i=1}^n X_i$ is a sum of **independent** $\{0,1\}$ variables with $\mu = \mathbb{E}[X]$, the tails decay *exponentially*, not polynomially. One common form: for $0 < \delta \le 1$,

```math
P(X \ge (1+\delta)\mu) \le e^{-\mu \delta^2 / 3}, \qquad
P(X \le (1-\delta)\mu) \le e^{-\mu \delta^2 / 2}.
```

The technique: apply Markov to $e^{tX}$ (the **moment generating function**), use independence to factor $\mathbb{E}[e^{tX}] = \prod \mathbb{E}[e^{tX_i}]$, then optimize over $t$.

> :surprisedgoose: The jump from Chebyshev's $1/k^2$ to Chernoff's $e^{-\Theta(k^2)}$ is enormous. Chebyshev says "5 standard deviations out, probability $\le 1/25$." Chernoff (for a sum of independents) says "probability $\le e^{-\text{(something like }12.5)}$" — vanishingly small. **Independence buys exponential concentration.** That single fact powers most modern randomized-algorithm analysis.

### Comparison

| Bound | Needs | Tail decay | Two-sided? |
|---|---|---|---|
| Markov | $X \ge 0$, mean | $1/a$ (slow) | No |
| Chebyshev | mean + variance | $1/a^2$ | Yes |
| Chernoff | sum of independents | $e^{-\Theta(a^2)}$ (fast) | Yes |

Each stronger bound demands a stronger assumption. More information about $X$ ⇒ a sharper tail.

## Worked Example — load balancing

Throw $n$ balls into $n$ bins uniformly at random. Let $X$ be the load of a fixed bin; $\mathbb{E}[X] = 1$. The probability a bin gets $\ge c\log n / \log\log n$ balls is, by a Chernoff/Poisson tail, at most $1/n^2$ for an appropriate constant $c$. Union-bounding over all $n$ bins, the **maximum** load is $O(\log n / \log\log n)$ with probability $\ge 1 - 1/n$.

> :nerdygoose: This is the canonical recipe: **Chernoff for one object → union bound over all objects → high-probability statement about the worst case.** It proves the max load in hashing, the depth of randomized search trees, the runtime of randomized routing — all with the same two-step pattern. Learn it once, reuse it everywhere.

## Algorithmic Touchpoints

- **High-probability runtime/space bounds**: randomized QuickSort is $O(n\log n)$ w.h.p. via Chernoff on recursion depth.
- **Hashing**: max chain length and load-factor guarantees come from Chernoff + union bound.
- **Streaming / sketching** (Count-Min, Bloom filters, HyperLogLog) bound estimation error with Markov/Chebyshev/Chernoff.
- **Boosting confidence**: run a Monte Carlo algorithm $k$ times and take majority/min — failure probability drops geometrically (a Chernoff argument).
- **Sample complexity** in learning theory: how many samples to estimate a mean within $\varepsilon$ comes straight from these inequalities.

## Quick Sanity Checks

- Markov requires $X \ge 0$; Chebyshev needs finite variance; Chernoff needs independence — verify the hypothesis before quoting the bound.
- All three give *upper* bounds on tail probabilities; a bound exceeding $1$ is vacuous (true but useless).
- Tighter bound ⇒ stronger assumption. If you used only the mean, you can't beat Markov.
- For a sum of $n$ independent indicators, expect exponential (Chernoff) concentration around $np$, not merely polynomial.
