---
sidebar_position: 3
sidebar_label: "Stars & Bars, Inclusion–Exclusion"
title: "Stars and Bars and Inclusion–Exclusion"
---

# Stars and Bars and Inclusion–Exclusion

Two techniques that crack a huge fraction of "how many ways" problems: **stars and bars** for distributing identical items, and **inclusion–exclusion** for counting unions and "at least / exactly" constraints.

## Stars and Bars

**Problem.** How many ways to write a non-negative integer $n$ as an ordered sum of $k$ non-negative parts? Equivalently, how many ways to distribute $n$ identical balls into $k$ distinct boxes?

**Idea.** Lay out $n$ stars and $k-1$ bars in a row. The bars split the stars into $k$ groups; group $i$'s size is the number assigned to box $i$. Any arrangement of $n$ stars and $k-1$ bars gives a valid distribution and vice versa.

```
* * | * | | * * *      →   (2, 1, 0, 3)   for n=6, k=4
```

The count is the number of ways to place the $k-1$ bars among the $n + k - 1$ total symbols:

```math
\binom{n + k - 1}{k - 1} = \binom{n + k - 1}{n}.
```

> :mathgoose: Stars and bars is the "unordered selection **with** repetition" entry from the counting table. The slogan: distributing $n$ identical things into $k$ labeled bins is the same as choosing positions for $k-1$ dividers. Once you see the bijection, the formula is just $\binom{n+k-1}{k-1}$ — no memorization needed.

**Example.** Non-negative integer solutions to $x_1 + x_2 + x_3 = 6$: $\binom{6 + 3 - 1}{3 - 1} = \binom{8}{2} = 28$.

### Positive parts (each box ≥ 1)

Require $x_i \ge 1$? Pre-place one ball in each box, then distribute the remaining $n - k$ freely:

```math
\binom{n - 1}{k - 1}.
```

### Lower/upper bounds

A constraint like $x_i \ge c_i$ is handled by substitution $x_i' = x_i - c_i \ge 0$, shrinking $n$. **Upper** bounds ($x_i \le u_i$) don't substitute away cleanly — you remove the over-the-limit cases with inclusion–exclusion (next).

> :angrygoose: Stars and bars assumes the **items are identical** and the **boxes are distinct**. If the balls are distinguishable, it's $k^n$ (each ball independently picks a box), not a binomial. If the boxes are *also* indistinguishable, you're counting integer *partitions* — a genuinely harder problem with no closed form. Always pin down "identical vs. distinct" on both sides first.

## Inclusion–Exclusion

To count a union, add the sizes, subtract the pairwise overlaps, add back the triple overlaps, and so on.

**Two sets:**
```math
|A \cup B| = |A| + |B| - |A \cap B|.
```

**Three sets:**
```math
|A \cup B \cup C| = |A| + |B| + |C| - |A\cap B| - |A\cap C| - |B\cap C| + |A\cap B\cap C|.
```

**General form** for sets $A_1, \dots, A_n$:

```math
\left| \bigcup_{i=1}^{n} A_i \right| = \sum_{\emptyset \neq S \subseteq \{1,\dots,n\}} (-1)^{|S|+1} \left| \bigcap_{i \in S} A_i \right|.
```

> :mathgoose: The alternating signs are bookkeeping for over-counting. An element in exactly $t$ of the sets is counted $\binom{t}{1} - \binom{t}{2} + \binom{t}{3} - \cdots = 1$ time total — because $\sum_{j\ge 1}(-1)^{j+1}\binom{t}{j} = 1$ for $t \ge 1$. The signs are *engineered* so every element contributes exactly once.

### Worked example — divisibility

How many integers in $\{1, \dots, 100\}$ are divisible by 2, 3, or 5?

Let $A, B, C$ be the multiples of 2, 3, 5. Using $\lfloor 100/d \rfloor$:

```math
|A\cup B\cup C| = 50 + 33 + 20 - 16 - 10 - 6 + 3 = 74.
```

(Here $\lfloor 100/6\rfloor=16$, $\lfloor100/10\rfloor=10$, $\lfloor100/15\rfloor=6$, $\lfloor100/30\rfloor=3$.) So 26 of them are coprime to 30.

### Derangements

A **derangement** is a permutation with no fixed point ($\sigma(i) \neq i$ for all $i$). Inclusion–exclusion over the "bad" events $A_i = \{\sigma(i) = i\}$ gives

```math
D_n = n! \sum_{k=0}^{n} \frac{(-1)^k}{k!} \approx \frac{n!}{e}.
```

> :surprisedgoose: The fraction of permutations that are derangements tends to $1/e \approx 0.368$ as $n \to \infty$ — and it converges almost instantly. The "hat-check problem" (everyone gets back a wrong hat) has probability $\approx 37\%$ no matter how many people are in the room. That stubborn constant is inclusion–exclusion meeting the Taylor series of $e^{-1}$.

### Counting "exactly $m$" via "at least"

Inclusion–exclusion naturally counts "in **none** of the sets" or "in **at least one**." To count elements in **exactly** $m$ of the properties, use the more general form (Bonferroni / the "exactly-$m$" formula):

```math
\#\{\text{in exactly } m\} = \sum_{j \ge m} (-1)^{j-m} \binom{j}{m} \, S_j,
```

where $S_j = \sum_{|S| = j} |\bigcap_{i\in S} A_i|$ is the total over all $j$-fold intersections.

## Stars and Bars meets Inclusion–Exclusion

Counting solutions to $x_1 + \cdots + x_k = n$ with **upper bounds** $x_i \le u_i$: start from the unrestricted $\binom{n+k-1}{k-1}$, then subtract (via inclusion–exclusion) the cases where one or more $x_i$ exceed their bound. Each "$x_i \ge u_i + 1$" violation is itself a stars-and-bars count after substitution, so the answer is an alternating sum of binomials.

> :happygoose: This combo is the Swiss-army knife of bounded distribution problems — "how many ways to make change," "lattice points under constraints," "dice sums." Set up stars and bars for the free count, then peel off each over-limit violation with a signed binomial. It's mechanical once you've done it twice.

## Algorithmic Touchpoints

- **Counting DP** for bounded sums often *is* stars-and-bars-with-inclusion–exclusion, made iterative.
- **Möbius function / Euler's totient** computations are inclusion–exclusion over prime divisors: $\varphi(n) = n\prod_{p\mid n}(1 - 1/p)$.
- **Subset-sum and SOS (sum-over-subsets) DP** evaluate the inclusion–exclusion sum efficiently over $2^n$ masks.
- **Probabilistic union bounds** are the "$\le \sum |A_i|$" truncation of inclusion–exclusion (first Bonferroni inequality).

## Quick Sanity Checks

- Stars and bars: for $k$ boxes you place $k-1$ bars — off-by-one here is the classic mistake.
- Inclusion–exclusion signs alternate starting with $+$ for single sets; the last term's sign is $(-1)^{n+1}$.
- Sanity test on tiny instances: $|A\cup B|$ with two 2-element sets sharing one element should give 3.
- Derangement count: $D_1 = 0$, $D_2 = 1$, $D_3 = 2$, $D_4 = 9$.
