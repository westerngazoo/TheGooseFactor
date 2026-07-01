---
sidebar_position: 1
sidebar_label: "Counting Principles"
title: "Counting Principles: Permutations and Combinations"
---

# Counting Principles: Permutations and Combinations

Combinatorics is the art of counting without listing. Almost every problem reduces to a few primitives — the sum rule, the product rule, and the distinction between *order matters* (permutations) and *order doesn't* (combinations).

## The Two Fundamental Rules

**Sum rule (disjoint choices).** If a task can be done in one of two *disjoint* ways — $A$ ways or $B$ ways — the total is $A + B$. This is counting a union of disjoint sets: $|A \cup B| = |A| + |B|$.

**Product rule (sequential choices).** If a task is a sequence of independent steps with $A$ then $B$ options, the total is $A \cdot B$. This counts a Cartesian product: $|A \times B| = |A| \cdot |B|$.

> :mathgoose: Every counting problem starts with one question: *am I making a sequence of choices (multiply) or splitting into cases (add)?* Get that decomposition right and the arithmetic is trivial. Get it wrong and no formula saves you. "And" usually means multiply; "or" usually means add.

**Example.** A password is one letter (26) followed by two digits (10 each). By the product rule: $26 \cdot 10 \cdot 10 = 2600$.

## Permutations: Order Matters

A **permutation** is an ordered arrangement. The number of orderings of $n$ distinct objects is

```math
n! = n \cdot (n-1) \cdots 2 \cdot 1, \qquad 0! = 1.
```

The number of ordered arrangements of $k$ objects chosen from $n$ distinct objects ($k$-permutations):

```math
P(n, k) = \frac{n!}{(n-k)!} = n (n-1) \cdots (n-k+1).
```

**Example.** Ways to award gold/silver/bronze among 8 runners: $P(8,3) = 8\cdot 7\cdot 6 = 336$.

> :nerdygoose: $0! = 1$ is not a special case to memorize — it's forced. There is exactly **one** way to arrange zero objects (the empty arrangement), and the formula $P(n,n) = n!/0!$ only equals $n!$ if $0! = 1$. The same value makes the binomial theorem and power series work without exceptions.

### Permutations with repetition

Arranging $n$ objects where there are $n_1$ identical of type 1, $n_2$ of type 2, …, $n_r$ of type $r$ (a **multiset permutation**):

```math
\frac{n!}{n_1!\, n_2! \cdots n_r!}.
```

**Example.** Distinct arrangements of the letters in `MISSISSIPPI` (1 M, 4 I, 4 S, 2 P): $\dfrac{11!}{1!\,4!\,4!\,2!} = 34650$.

## Combinations: Order Doesn't Matter

A **combination** is an unordered selection. The number of $k$-element subsets of an $n$-element set is the **binomial coefficient**:

```math
\binom{n}{k} = \frac{n!}{k!\,(n-k)!} = \frac{P(n,k)}{k!}.
```

We divide $P(n,k)$ by $k!$ because each unordered subset was counted once for each of its $k!$ orderings.

**Example.** Ways to choose a 3-person committee from 8 people: $\binom{8}{3} = \dfrac{8\cdot 7\cdot 6}{3!} = 56$.

> :happygoose: The whole relationship in one sentence: **permutations are combinations times the orderings.** $P(n,k) = \binom{n}{k}\cdot k!$. Choose the set (unordered), then order it. Whenever you're unsure which to use, ask "if I shuffle the chosen items, is it the same outcome?" Same → combination. Different → permutation.

## A Decision Table

| Order matters? | Repetition allowed? | Count |
|---|---|---|
| Yes | No | $P(n,k) = \dfrac{n!}{(n-k)!}$ |
| Yes | Yes | $n^k$ |
| No | No | $\dbinom{n}{k}$ |
| No | Yes | $\dbinom{n+k-1}{k}$ (stars & bars) |

> :angrygoose: The single most common counting bug is **double counting** — treating two identical outcomes as different (forgetting to divide by $k!$ or by symmetry), or its mirror, **undercounting** by ignoring an ordering that does matter. When in doubt, enumerate a tiny case by hand ($n=3, k=2$) and compare to your formula.

The "no order, with repetition" row is **stars and bars**, covered in its own chapter. The "order, with repetition" case is just the product rule applied $k$ times: $n^k$.

## Worked Multi-step Example

How many 5-card poker hands contain exactly one pair?

1. Choose the rank of the pair: $\binom{13}{1} = 13$.
2. Choose 2 of the 4 suits for that rank: $\binom{4}{2} = 6$.
3. Choose 3 distinct other ranks: $\binom{12}{3} = 220$.
4. Choose a suit for each: $4^3 = 64$.

Product rule: $13 \cdot 6 \cdot 220 \cdot 64 = 1\,098\,240$ hands.

> :surprisedgoose: Notice the mix: combinations where order is irrelevant (which ranks, which suits) and a product over independent steps. Real counting problems are *compositions* of the primitives. The skill is the decomposition, not any single formula.

## Algorithmic Touchpoints

- **Backtracking / enumeration** generates permutations and combinations explicitly; the counts above tell you the search-space size and whether brute force is feasible.
- **Next-permutation** algorithms iterate the $n!$ orderings in lexicographic order in-place.
- **Counting DP** often multiplies independent sub-counts (product rule) and sums over disjoint cases (sum rule) — the same two primitives.
- **Hashing / sampling**: choosing $k$ of $n$ uniformly (reservoir sampling, Fisher–Yates shuffle) is combinatorics made executable.

## Quick Sanity Checks

- $\binom{n}{0} = \binom{n}{n} = 1$; $\binom{n}{1} = n$. If your formula breaks these, recheck.
- $P(n,k) \ge \binom{n}{k}$ always, with equality only when $k \le 1$.
- For small cases, list outcomes by hand and match the count.
- Units check: if order matters you should *not* be dividing by $k!$, and vice versa.
