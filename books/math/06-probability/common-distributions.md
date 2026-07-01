---
sidebar_position: 4
sidebar_label: "Common Distributions"
title: "Common Discrete Distributions"
---

# Common Discrete Distributions

A handful of distributions describe most discrete random phenomena. Knowing their PMFs, means, and variances — and *which real situation each models* — lets you recognize and solve problems on sight.

## Bernoulli — a single trial

A **Bernoulli($p$)** variable is $1$ (success) with probability $p$ and $0$ (failure) with probability $1-p$.

```math
P(X = 1) = p, \quad P(X = 0) = 1 - p,
```
```math
\mathbb{E}[X] = p, \qquad \operatorname{Var}(X) = p(1-p).
```

It is the atom from which the others are built — a single coin flip, one indicator.

> :mathgoose: Variance $p(1-p)$ is maximized at $p = 1/2$ (a fair coin is the most uncertain) and is $0$ at $p = 0$ or $1$ (a guaranteed outcome carries no spread). That single parabola is the shape of "uncertainty" for a yes/no event.

## Binomial — counting successes in $n$ trials

Sum of $n$ independent Bernoulli($p$) trials. $X \sim \text{Binomial}(n, p)$ counts successes:

```math
P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}, \quad k = 0, 1, \dots, n,
```
```math
\mathbb{E}[X] = np, \qquad \operatorname{Var}(X) = np(1-p).
```

The mean and variance follow instantly from linearity (sum of $n$ Bernoullis), no summation needed.

**Example.** 10 fair coins, probability of exactly 6 heads: $\binom{10}{6}(0.5)^{10} = 210/1024 \approx 0.205$.

## Geometric — waiting for the first success

$X \sim \text{Geometric}(p)$ counts the number of trials up to and including the first success:

```math
P(X = k) = (1-p)^{k-1} p, \quad k = 1, 2, 3, \dots,
```
```math
\mathbb{E}[X] = \frac{1}{p}, \qquad \operatorname{Var}(X) = \frac{1-p}{p^2}.
```

> :nerdygoose: The geometric distribution is **memoryless**: $P(X > s + t \mid X > s) = P(X > t)$. Having waited 100 trials with no success doesn't change your future wait — the coin has no memory. It's the *only* discrete distribution with this property, and it's why "expected time to first success is $1/p$" needs no correction for past failures.

> :angrygoose: Watch the convention. Some texts define the geometric as the number of **failures before** the first success ($k = 0, 1, 2, \dots$), giving $\mathbb{E}[X] = (1-p)/p$. Always check whether "the trial that succeeds" is counted. Off-by-one here silently shifts every mean by $1$.

## Poisson — rare events over an interval

$X \sim \text{Poisson}(\lambda)$ models the count of events in a fixed interval when events occur independently at average rate $\lambda$:

```math
P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}, \quad k = 0, 1, 2, \dots,
```
```math
\mathbb{E}[X] = \lambda, \qquad \operatorname{Var}(X) = \lambda.
```

Mean equals variance — a signature of the Poisson.

**Poisson limit theorem.** Binomial$(n, p)$ with large $n$, small $p$, and $np \to \lambda$ converges to Poisson$(\lambda)$. So Poisson is the "law of rare events."

> :surprisedgoose: This is why Poisson shows up for things like packets arriving at a router, requests hitting a server, or hash collisions: each of an enormous number of potential events has a tiny chance, and only the product $np = \lambda$ matters. The balls-into-bins model — $n$ balls into $n$ bins — has each bin's load approximately Poisson($1$), which predicts the max load is about $\Theta(\log n / \log\log n)$.

## Summary Table

| Distribution | Models | PMF | Mean | Variance |
|---|---|---|---|---|
| Bernoulli($p$) | one trial | $p^x(1-p)^{1-x}$ | $p$ | $p(1-p)$ |
| Binomial($n,p$) | successes in $n$ trials | $\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ |
| Geometric($p$) | trials to first success | $(1-p)^{k-1}p$ | $1/p$ | $(1-p)/p^2$ |
| Poisson($\lambda$) | rare-event count | $\lambda^k e^{-\lambda}/k!$ | $\lambda$ | $\lambda$ |

## Relationships

- **Binomial = sum of Bernoullis.** $\text{Bin}(n,p) = \sum_{i=1}^n \text{Ber}(p)$.
- **Binomial → Poisson** as $n\to\infty$, $np\to\lambda$ (rare events).
- **Geometric = discrete analog of the exponential** (both memoryless).
- **Sum of independent Poissons is Poisson:** $\text{Poisson}(\lambda_1) + \text{Poisson}(\lambda_2) = \text{Poisson}(\lambda_1 + \lambda_2)$.

> :happygoose: Don't memorize formulas in isolation — memorize the *stories*. "One trial," "count of successes," "wait for first success," "rare events in an interval." When a problem matches a story, the PMF, mean, and variance come for free. Pattern-matching the scenario is 90% of applied probability.

## Algorithmic Touchpoints

- **Hashing / balls-into-bins**: bin loads are ~Poisson($1$); informs expected and max chain length.
- **Randomized algorithms**: number of retries until success is geometric; total successes is binomial.
- **Skip lists / treaps**: level of a node is geometric, which bounds expected height at $O(\log n)$.
- **Queueing & load modeling**: arrivals are Poisson, the foundation of $M/M/1$ queue analysis.
- **Bloom filters**: false-positive analysis uses the Poisson approximation to bit occupancy.

## Quick Sanity Checks

- Each PMF must sum to $1$: $\sum_k \binom{n}{k}p^k(1-p)^{n-k} = 1$, $\sum_k \frac{\lambda^k e^{-\lambda}}{k!} = 1$.
- Binomial mean $np$ should sit between $0$ and $n$; Poisson mean and variance must match.
- Geometric: confirm which convention (from-1 vs from-0) before using $1/p$ vs $(1-p)/p$.
- A binomial with tiny $p$ and large $n$ should numerically resemble Poisson($np$).
