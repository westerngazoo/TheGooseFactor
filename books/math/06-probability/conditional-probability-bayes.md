---
sidebar_position: 2
sidebar_label: "Conditional Probability & Bayes"
title: "Conditional Probability and Bayes' Theorem"
---

# Conditional Probability and Bayes' Theorem

Conditioning is how probability incorporates information. "Given that $B$ happened, how likely is $A$?" It is the single most useful computational tool in the subject, and Bayes' theorem is the rule for flipping the direction of conditioning.

## Definition

For an event $B$ with $P(B) > 0$, the **conditional probability** of $A$ given $B$ is

```math
P(A \mid B) = \frac{P(A \cap B)}{P(B)}.
```

Conditioning on $B$ restricts the sample space to $B$ and renormalizes so the new total is $1$.

> :mathgoose: Read the formula as "the fraction of $B$'s probability that also lands in $A$." You've zoomed into the world where $B$ is certain, and you're re-measuring $A$ inside that smaller world. Independence is exactly the case where this zoom changes nothing: $P(A\mid B) = P(A)$.

## The Multiplication (Chain) Rule

Rearranging the definition:

```math
P(A \cap B) = P(A \mid B)\,P(B) = P(B \mid A)\,P(A).
```

For a sequence of events, the **chain rule** decomposes a joint probability into a product of conditionals:

```math
P(A_1 \cap \cdots \cap A_n) = P(A_1)\,P(A_2 \mid A_1)\,P(A_3 \mid A_1 \cap A_2)\cdots
```

This is how you compute "draw without replacement" probabilities step by step.

## Law of Total Probability

If $B_1, \dots, B_n$ **partition** $\Omega$ (disjoint and covering), then for any event $A$:

```math
P(A) = \sum_{i=1}^{n} P(A \mid B_i)\,P(B_i).
```

You compute $P(A)$ by splitting into exhaustive cases and taking a weighted average over them.

> :happygoose: This "condition on the first step / condition on the cases" move is the engine behind almost every probability calculation and every expected-runtime analysis. When stuck, ask: *what is the natural first thing to condition on?* The recurrence for QuickSort's runtime is just total probability over the choice of pivot.

## Bayes' Theorem

Combining the definition with total probability flips the conditioning:

```math
P(B \mid A) = \frac{P(A \mid B)\,P(B)}{P(A)} = \frac{P(A \mid B)\,P(B)}{\sum_i P(A \mid B_i)\,P(B_i)}.
```

- $P(B)$ is the **prior** (belief before seeing evidence $A$),
- $P(A \mid B)$ is the **likelihood**,
- $P(B \mid A)$ is the **posterior** (updated belief).

### Worked example — the false positive trap

A disease affects $1\%$ of a population. A test is $99\%$ accurate both ways (sensitivity and specificity $= 0.99$). You test positive. What is the chance you actually have the disease?

Let $D$ = has disease, $+$ = tests positive.

```math
P(D \mid +) = \frac{P(+\mid D)P(D)}{P(+\mid D)P(D) + P(+\mid D^c)P(D^c)}
= \frac{0.99 \cdot 0.01}{0.99\cdot 0.01 + 0.01\cdot 0.99} = \frac{0.0099}{0.0198} = 0.5.
```

Only **50%** — despite a "99% accurate" test.

> :surprisedgoose: This is the **base-rate fallacy**. Because the disease is rare (1%), the pool of false positives (1% of the healthy 99%) is just as large as the pool of true positives (99% of the sick 1%). The prior dominates. Ignoring base rates is how people — and naive classifiers — get fooled by confident-looking evidence.

> :angrygoose: $P(A \mid B)$ and $P(B \mid A)$ are **not** the same number, and confusing them is the "prosecutor's fallacy." $P(\text{evidence} \mid \text{innocent})$ being tiny does *not* mean $P(\text{innocent} \mid \text{evidence})$ is tiny — you must weight by the prior. Bayes' theorem exists precisely to keep these straight.

## Conditional Independence

$A$ and $B$ are **conditionally independent given $C$** if

```math
P(A \cap B \mid C) = P(A \mid C)\,P(B \mid C).
```

This can hold even when $A, B$ are dependent unconditionally (and vice versa). It is the structural assumption behind the **naive Bayes classifier**: features are assumed independent *given the class label*.

> :nerdygoose: Conditional independence is the backbone of probabilistic graphical models (Bayesian networks, Markov chains). A Bayesian network is just a factorization of a giant joint distribution into a product of small conditionals, each node independent of its non-descendants given its parents. Conditioning structure = the edges of the graph.

## Algorithmic Touchpoints

- **Naive Bayes** spam/text classifiers apply Bayes with a conditional-independence assumption over features.
- **Expected-runtime analysis** (QuickSort, hashing, skip lists) conditions on random choices via total probability.
- **Bayesian inference / filtering** (Kalman filters, particle filters) is repeated prior → likelihood → posterior updating.
- **A/B testing and online learning** update beliefs about conversion rates as data arrives — Bayes in production.

## Quick Sanity Checks

- $P(A \mid B)$ requires $P(B) > 0$; conditioning on a zero-probability event is undefined (in the elementary setting).
- $\sum_i P(B_i \mid A) = 1$ when the $B_i$ partition $\Omega$ — a quick check on a Bayes computation.
- If $A, B$ are independent, $P(A\mid B) = P(A)$; if your conditioning changes nothing, suspect independence.
- Remember the base rate: a posterior should move *from* the prior *toward* the likelihood, weighted by how strong the evidence is.
