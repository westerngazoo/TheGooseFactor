---
sidebar_position: 1
sidebar_label: "Sample Spaces & Events"
title: "Sample Spaces, Events, and Axioms"
---

# Sample Spaces, Events, and Axioms

Probability is measure theory wearing a friendly costume: you assign weights to outcomes so they total $1$, and "the chance of something" is the total weight of the outcomes where it happens. Get the sample space right and most "paradoxes" dissolve.

## The Three Ingredients

A **probability space** is $(\Omega, \mathcal{F}, P)$:

- **Sample space** $\Omega$: the set of all possible outcomes.
- **Events** $\mathcal{F}$: subsets of $\Omega$ we can assign probabilities to (a $\sigma$-algebra).
- **Probability measure** $P$: a function from events to $[0,1]$.

An **event** is a set of outcomes; $P(A)$ is "the chance that the outcome lands in $A$."

> :mathgoose: The most common mistake in probability is not algebra — it's an ill-defined sample space. Write down $\Omega$ explicitly before computing anything. Half of all "paradoxes" (Monty Hall, the boy-or-girl problem) are just arguments about what $\Omega$ and $P$ actually are.

## Kolmogorov's Axioms

$P$ must satisfy:

```math
P(A) \ge 0, \qquad P(\Omega) = 1,
```

and **countable additivity**: for pairwise disjoint events $A_1, A_2, \dots$,

```math
P\!\left(\bigcup_i A_i\right) = \sum_i P(A_i).
```

Everything else is a consequence.

### Immediate consequences

```math
P(A^c) = 1 - P(A), \qquad P(\emptyset) = 0,
```
```math
A \subseteq B \implies P(A) \le P(B),
```
```math
P(A \cup B) = P(A) + P(B) - P(A \cap B) \quad \text{(inclusion–exclusion)}.
```

> :nerdygoose: The union bound — $P(\bigcup_i A_i) \le \sum_i P(A_i)$ — is just additivity with the overlaps dropped. It looks too crude to be useful, yet it's one of the most-used inequalities in algorithm analysis: bound the probability that *any* of many bad events happens by summing their individual probabilities. Crude, but it scales.

## Equally Likely Outcomes

When $\Omega$ is finite and every outcome is equally likely (the *classical* model):

```math
P(A) = \frac{|A|}{|\Omega|}.
```

Probability becomes **counting** — which is exactly why combinatorics is the prerequisite.

**Example.** Two fair dice. $|\Omega| = 36$. Probability the sum is 7: the outcomes $(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)$ give $|A| = 6$, so $P = 6/36 = 1/6$.

> :angrygoose: "Equally likely" is an *assumption*, not a default. The sum of two dice is **not** uniform over $\{2,\dots,12\}$ — there are six ways to roll a 7 but only one to roll a 12. Choose your sample space so that the equally-likely model actually holds (here: ordered pairs), then count.

## Independence

Events $A$ and $B$ are **independent** if

```math
P(A \cap B) = P(A)\,P(B).
```

Intuitively, knowing $B$ happened tells you nothing about $A$. Independence is a property of the *measure*, not of disjointness.

> :angrygoose: **Disjoint is the opposite of independent**, not a form of it. If $A$ and $B$ are disjoint and both have positive probability, then $A$ happening *guarantees* $B$ didn't — that's maximal dependence. Confusing "mutually exclusive" with "independent" is a top-five probability error.

A collection of events is **mutually independent** if *every* sub-collection multiplies — pairwise independence is strictly weaker and not enough.

## Worked Example — the birthday problem

With $k$ people and $365$ equally likely birthdays, the probability that all are distinct is

```math
P(\text{all distinct}) = \prod_{i=0}^{k-1} \frac{365 - i}{365}.
```

This drops below $\tfrac12$ at $k = 23$. So among 23 people, a shared birthday is more likely than not.

> :surprisedgoose: The reason 23 feels too small: there are $\binom{23}{2} = 253$ *pairs* of people, and collisions are about pairs, not individuals. This is the same "pairs grow quadratically" effect behind hash-table collisions — the birthday bound says a hash with $N$ buckets starts colliding after about $\sqrt{N}$ insertions.

## Algorithmic Touchpoints

- **Randomized algorithms** define a sample space over the algorithm's coin flips; correctness/runtime become events.
- **Union bound** caps the failure probability of a randomized algorithm across many bad events — the staple of "with high probability" proofs.
- **Hashing**: collision analysis is the birthday problem; load factor is $P$(bucket occupied).
- **Monte Carlo estimation** approximates $P(A)$ by the empirical fraction $|A \text{ hits}|/|\text{trials}|$ — the classical model run in reverse.

## Quick Sanity Checks

- Probabilities live in $[0,1]$; if you compute $1.3$ or $-0.2$, the sample space or counting is wrong.
- $P(A) + P(A^c)$ must equal $1$.
- Disjoint events add; independent events multiply — never mix the two rules up.
- For equally-likely models, double-check that your $\Omega$ truly makes outcomes equally likely.
