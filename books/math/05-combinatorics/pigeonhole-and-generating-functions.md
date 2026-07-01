---
sidebar_position: 4
sidebar_label: "Pigeonhole & Generating Functions"
title: "Pigeonhole Principle and Generating Functions"
---

# Pigeonhole Principle and Generating Functions

Two ideas that punch far above their weight: the **pigeonhole principle**, a one-line argument that forces collisions to exist, and **generating functions**, a way to turn counting into algebra.

## The Pigeonhole Principle

**Statement.** If $n$ items are placed into $k$ boxes and $n > k$, then some box contains at least two items.

**Generalized form.** If $n$ items go into $k$ boxes, some box contains at least

```math
\left\lceil \frac{n}{k} \right\rceil
```

items. (And some box contains at most $\lfloor n/k \rfloor$.)

> :mathgoose: Pigeonhole is a pure *existence* argument — it tells you a collision **must** happen without telling you where. That's exactly why it's powerful in proofs: you don't need to construct the colliding pair, only to count boxes and items. The entire trick is choosing what the "items" and "boxes" are.

### Classic applications

- **Two people in a room of 13 share a birth month** (13 people, 12 months).
- **Among any 5 points in a unit square, two are within $\frac{\sqrt2}{2}$** (cut the square into four sub-squares of side $\frac12$; two points share one).
- **Some nonempty consecutive run of a sequence of $n$ integers has a sum divisible by $n$.** Consider the $n$ prefix sums mod $n$ plus the empty prefix ($n+1$ values, $n$ residues); two share a residue, and their difference is a run divisible by $n$.

> :surprisedgoose: That last one is the basis of a real algorithm: to find a contiguous subarray with sum divisible by $n$, hash prefix sums mod $n$. Pigeonhole *guarantees* a repeat exists among $n+1$ prefixes, so the algorithm always succeeds — the math proves correctness, not just plausibility.

### A subtler example — Erdős–Szekeres

Any sequence of $n^2 + 1$ distinct reals contains a monotonic subsequence of length $n+1$. Label each element with (longest increasing run ending here, longest decreasing run ending here); if no run reaches $n+1$, there are at most $n^2$ distinct labels for $n^2+1$ elements — pigeonhole forces two equal labels, a contradiction.

> :angrygoose: Pigeonhole proves *existence*, never *uniqueness* or *location*. "Some box has ≥2" does not say which box, how many such boxes, or which items. Beginners over-claim. State exactly what the principle gives: an existence guarantee and a count bound, nothing more.

## Generating Functions

A **(ordinary) generating function** encodes a sequence $a_0, a_1, a_2, \dots$ as the coefficients of a formal power series:

```math
A(x) = \sum_{n \ge 0} a_n x^n.
```

We don't (usually) care about convergence — $x$ is a bookkeeping variable. Operations on sequences become operations on series, and "count the configurations of size $n$" becomes "extract the coefficient of $x^n$."

> :mathgoose: The motto: **generating functions turn counting into algebra.** A recurrence on $a_n$ becomes an equation in $A(x)$; a "choose a part of each type" problem becomes a *product* of series; merging two independent structures becomes multiplication. You solve in the algebra, then read the coefficient back out.

### The fundamental dictionary

| Sequence operation | Generating function operation |
|---|---|
| Shift $a_{n-1}$ | multiply by $x$ |
| Combine independent choices | multiply series |
| Choose any number of a unit of size $s$ | factor $\dfrac{1}{1 - x^{s}}$ |
| Choose 0 or 1 of a unit | factor $(1 + x^{s})$ |

Two cornerstone closed forms:

```math
\frac{1}{1-x} = \sum_{n\ge 0} x^n, \qquad
\frac{1}{(1-x)^{k}} = \sum_{n \ge 0} \binom{n+k-1}{k-1} x^n.
```

The second is **stars and bars in series form**: the coefficient of $x^n$ counts distributions of $n$ into $k$ parts.

### Example — making change

In how many ways can you form $n$ cents using pennies, nickels, and dimes (unlimited supply)? Each coin type contributes a geometric factor:

```math
G(x) = \frac{1}{1-x}\cdot\frac{1}{1-x^5}\cdot\frac{1}{1-x^{10}}.
```

The number of ways is $[x^n]\,G(x)$ — the coefficient of $x^n$. This product encodes the entire convolution of choices in one expression.

> :happygoose: This is why generating functions feel magical: "use **any** number of pennies **and** any number of nickels **and** any number of dimes" turns into a literal product of three factors. The "and" between independent choices is multiplication of series. Expand or do partial fractions to get a formula; or just convolve numerically for a fast coin-change DP.

### Example — solving a recurrence

Fibonacci: $F_0 = 0, F_1 = 1, F_n = F_{n-1} + F_{n-2}$. Let $F(x) = \sum F_n x^n$. The recurrence yields

```math
F(x) = \frac{x}{1 - x - x^2}.
```

Partial fractions on the roots of $1 - x - x^2$ recover **Binet's formula** $F_n = \frac{\varphi^n - \psi^n}{\sqrt 5}$ with $\varphi = \frac{1+\sqrt5}{2}$. The generating function converts a recurrence into a rational function and then a closed form.

### Exponential generating functions (a glimpse)

For *labeled* structures, the **exponential generating function** $\sum a_n \frac{x^n}{n!}$ is the right tool; products correspond to interleaving labeled pieces. Derangements, set partitions (Bell numbers), and the symbolic method all live here — a doorway to *analytic combinatorics*.

## Algorithmic Touchpoints

- **Coin-change / subset-sum DP** is literally multiplying generating-function factors — convolution of coefficient arrays.
- **Polynomial multiplication via FFT** computes these convolutions in $O(N \log N)$, so generating functions are *executable*.
- **Hashing & birthday bound**: pigeonhole guarantees collisions once items exceed buckets; the birthday paradox quantifies *when*.
- **Cycle detection** (Floyd's tortoise-and-hare) relies on pigeonhole: a function on a finite set must eventually repeat a value, forcing a cycle.

## Quick Sanity Checks

- Pigeonhole: state your "items" and "boxes" explicitly; the bound is $\lceil n/k \rceil$, not $n/k$.
- A generating function's $[x^0]$ coefficient should match $a_0$; check the constant term first.
- For making change, $[x^0]\,G(x) = 1$ (one way to make 0 cents — use nothing).
- Verify a recurrence's generating function by re-expanding the first few coefficients and matching $a_0, a_1, a_2$.
