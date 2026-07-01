---
sidebar_position: 3
sidebar_label: "Random Variables & Expectation"
title: "Random Variables, Expectation, and Variance"
---

# Random Variables, Expectation, and Variance

A random variable turns outcomes into numbers so we can average them. **Expectation** is the long-run average; **linearity of expectation** is the most powerful — and most underrated — tool in all of discrete probability.

## Random Variables

A **random variable** $X$ is a function $X : \Omega \to \mathbb{R}$ assigning a number to each outcome. It is **discrete** if it takes countably many values, with **probability mass function** $p_X(x) = P(X = x)$, and **continuous** if described by a **density** $f_X$ with $P(a \le X \le b) = \int_a^b f_X(x)\,dx$.

> :mathgoose: A random variable is not "random" and not a "variable" — it's a *function* from outcomes to numbers. Once you see $X$ as a labeling of the sample space, everything (expectation, variance, distributions) is just summing or integrating that labeling against the probabilities.

## Expectation

The **expected value** (mean) of a discrete random variable:

```math
\mathbb{E}[X] = \sum_x x \, P(X = x),
```

and for a continuous one, $\mathbb{E}[X] = \int_{-\infty}^{\infty} x\, f_X(x)\,dx$. It is the probability-weighted average of the values.

**Law of the unconscious statistician (LOTUS).** For any function $g$:

```math
\mathbb{E}[g(X)] = \sum_x g(x)\,P(X = x).
```

You don't need the distribution of $g(X)$ — just push $g$ through the sum.

**Example.** Fair die: $\mathbb{E}[X] = \frac{1}{6}(1+2+\cdots+6) = 3.5$. Note the mean need not be an attainable value.

## Linearity of Expectation

For **any** random variables $X, Y$ and constants $a, b$:

```math
\mathbb{E}[aX + bY] = a\,\mathbb{E}[X] + b\,\mathbb{E}[Y].
```

This holds **whether or not $X$ and $Y$ are independent.** No independence assumption needed — ever.

> :happygoose: This is the crown jewel. To find the expected value of a complicated count, **break it into a sum of simple pieces and add their expectations** — even when the pieces are wildly dependent. You sidestep the joint distribution entirely. Nine out of ten slick expectation arguments are linearity plus indicators (next section).

## Indicator Random Variables

An **indicator** $\mathbb{1}_A$ (or $X_A$) is $1$ if event $A$ occurs and $0$ otherwise. Its expectation is just the probability:

```math
\mathbb{E}[\mathbb{1}_A] = 1 \cdot P(A) + 0 \cdot P(A^c) = P(A).
```

**Technique.** To find $\mathbb{E}[X]$ where $X$ counts how many of some events occur, write $X = \sum_i \mathbb{1}_{A_i}$ and use linearity:

```math
\mathbb{E}[X] = \sum_i P(A_i).
```

### Worked example — expected number of fixed points

A random permutation of $n$ items: how many elements stay in place on average? Let $X_i = \mathbb{1}\{\sigma(i) = i\}$. Then $P(X_i = 1) = 1/n$, so

```math
\mathbb{E}[X] = \sum_{i=1}^n \mathbb{E}[X_i] = n \cdot \frac{1}{n} = 1.
```

Exactly **one** fixed point on average, regardless of $n$ — even though the $X_i$ are dependent.

> :surprisedgoose: We computed this with zero knowledge of the joint distribution of the $X_i$, which is genuinely messy. Linearity + indicators makes the dependence *irrelevant*. The same two lines give the expected number of records in a sequence, comparisons in QuickSort, or empty bins in a hashing experiment.

## Variance and Standard Deviation

Expectation gives the center; **variance** measures spread:

```math
\operatorname{Var}(X) = \mathbb{E}\!\left[(X - \mathbb{E}[X])^2\right] = \mathbb{E}[X^2] - (\mathbb{E}[X])^2.
```

The **standard deviation** is $\sigma_X = \sqrt{\operatorname{Var}(X)}$, in the same units as $X$.

### Scaling and sums

```math
\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X).
```

Variance does **not** add in general. For **independent** (or merely uncorrelated) variables it does:

```math
\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) \quad (\text{if independent}).
```

In general, $\operatorname{Var}(X+Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X,Y)$, where the **covariance** is $\operatorname{Cov}(X,Y) = \mathbb{E}[XY] - \mathbb{E}[X]\mathbb{E}[Y]$.

> :angrygoose: **Expectation always adds; variance only adds for independent variables.** This is the trap. Linearity of expectation needs nothing, but the moment you add variances you've quietly assumed independence (or zero covariance). If the variables are correlated, you owe a covariance term — forgetting it gives wrong confidence intervals.

## Worked Example — coupon collector

There are $n$ distinct coupons; each draw is uniform. Expected draws to collect all $n$? Let $T_i$ be the draws to get a *new* coupon after holding $i-1$. The chance of a new one is $(n-i+1)/n$, so $T_i$ is geometric with $\mathbb{E}[T_i] = n/(n-i+1)$. By linearity,

```math
\mathbb{E}[T] = \sum_{i=1}^{n} \frac{n}{n-i+1} = n \sum_{j=1}^{n} \frac{1}{j} = n H_n \approx n \ln n.
```

> :nerdygoose: Coupon collector is *everywhere* in CS: expected time for randomized load balancing to touch every bucket, for a random walk to cover a clique, for randomized rounding to hit all constraints. The $n \ln n$ growth — and the fact that the last few coupons dominate the wait — is a pattern worth memorizing.

## Algorithmic Touchpoints

- **Expected runtime** of randomized QuickSort: $\mathbb{E}[\text{comparisons}] = \sum_{i<j} P(i,j \text{ compared})$ — indicators + linearity, giving $\approx 2n\ln n$.
- **Hashing**: expected number of collisions, expected load of a bucket, expected longest chain.
- **Reservoir sampling / randomized rounding** correctness rests on expectation arguments.
- **Variance** drives concentration: small variance ⇒ the random variable is reliably near its mean (next chapter on tail bounds).

## Quick Sanity Checks

- $\mathbb{E}[\text{constant}] = $ that constant; $\operatorname{Var}(\text{constant}) = 0$.
- Variance is never negative; if you compute a negative variance, you flipped a sign in $\mathbb{E}[X^2] - (\mathbb{E}[X])^2$.
- Indicator check: $\mathbb{E}[\mathbb{1}_A] = P(A)$ must be in $[0,1]$.
- Linearity needs no independence; adding variances does — verify before you add them.
