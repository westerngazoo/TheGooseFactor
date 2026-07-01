---
sidebar_position: 2
sidebar_label: "Binomial Coefficients"
title: "Binomial Coefficients and Pascal's Triangle"
---

# Binomial Coefficients and Pascal's Triangle

The binomial coefficient $\binom{n}{k}$ is the most important object in combinatorics. It counts $k$-subsets, expands powers of binomials, and satisfies a web of identities that turn hard sums into one-liners.

## Definition and the Binomial Theorem

```math
\binom{n}{k} = \frac{n!}{k!\,(n-k)!}, \qquad 0 \le k \le n.
```

The **binomial theorem** explains the name:

```math
(x + y)^n = \sum_{k=0}^{n} \binom{n}{k} x^k y^{n-k}.
```

The coefficient of $x^k y^{n-k}$ counts the ways to choose $k$ of the $n$ factors to contribute an $x$ — exactly $\binom{n}{k}$.

**Example.** $(x+y)^3 = x^3 + 3x^2y + 3xy^2 + y^3$, coefficients $1,3,3,1 = \binom{3}{0},\dots,\binom{3}{3}$.

> :mathgoose: Plug in numbers and identities fall out for free. $x = y = 1$ gives $\sum_k \binom{n}{k} = 2^n$ (every subset of an $n$-set). $x=1, y=-1$ gives $\sum_k (-1)^k \binom{n}{k} = 0$ (equal numbers of even and odd subsets, for $n \ge 1$). The binomial theorem is a *generating identity*: one substitution, one combinatorial fact.

## Pascal's Triangle and the Key Recurrence

Every binomial coefficient is the sum of the two above it:

```math
\binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k}.
```

```
n=0:            1
n=1:          1   1
n=2:        1   2   1
n=3:      1   3   3   1
n=4:    1   4   6   4   1
n=5:  1   5  10  10   5   1
```

**Combinatorial proof.** To choose $k$ from $n$, fix one element $e$: either it's *in* the subset (choose the rest, $\binom{n-1}{k-1}$ ways) or it's *out* (choose all $k$ from the others, $\binom{n-1}{k}$ ways). The two cases are disjoint and exhaustive.

> :happygoose: This recurrence is also the algorithm. Building Pascal's triangle row by row computes all $\binom{n}{k}$ with only additions — no factorials, no division, no overflow until the values themselves get huge. It's the cleanest way to tabulate binomials for moderate $n$, and the basis of the classic DP for counting lattice paths.

## Core Identities

| Identity | Statement | Meaning |
|---|---|---|
| Symmetry | $\binom{n}{k} = \binom{n}{n-k}$ | Choosing what's in = choosing what's out |
| Pascal | $\binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k}$ | Element in or out |
| Absorption | $k\binom{n}{k} = n\binom{n-1}{k-1}$ | Choose a subset & a leader |
| Row sum | $\sum_{k} \binom{n}{k} = 2^n$ | All subsets |
| Alternating sum | $\sum_{k} (-1)^k \binom{n}{k} = 0$ | Even vs. odd subsets |
| Hockey stick | $\sum_{i=k}^{n} \binom{i}{k} = \binom{n+1}{k+1}$ | Partition by largest element |
| Vandermonde | $\sum_{j} \binom{m}{j}\binom{n}{k-j} = \binom{m+n}{k}$ | Split selection across two groups |

### Hockey stick, visually

Summing a diagonal of Pascal's triangle gives the entry just below the end of the diagonal:

```math
\binom{2}{2} + \binom{3}{2} + \binom{4}{2} + \binom{5}{2} = 1 + 3 + 6 + 10 = 20 = \binom{6}{3}.
```

> :nerdygoose: Vandermonde's identity is the discrete convolution of two binomial sequences — the same convolution you'd compute by multiplying $(1+x)^m (1+x)^n = (1+x)^{m+n}$ and matching the coefficient of $x^k$. Many "ugly sum" identities are secretly *coefficient extraction* from a product of generating functions. That viewpoint is the topic of the pigeonhole-and-generating-functions chapter.

## Computing Binomials in Code

**Multiplicative formula** (avoids huge factorials, exact for moderate $n$):

```math
\binom{n}{k} = \prod_{i=1}^{k} \frac{n - i + 1}{i}.
```

```python
def choose(n, k):
    if k < 0 or k > n:
        return 0
    k = min(k, n - k)          # symmetry: smaller loop
    result = 1
    for i in range(1, k + 1):
        result = result * (n - i + 1) // i
    return result
```

The intermediate `result * (n - i + 1)` is always divisible by `i` at that step, so integer division is exact.

**Modulo a prime $p$** (for large $n$): precompute factorials and inverse factorials.

```python
def binom_mod(n, k, p, fact, inv_fact):
    if k < 0 or k > n:
        return 0
    return fact[n] * inv_fact[k] % p * inv_fact[n - k] % p
```

This needs the modular inverse machinery from the modular-arithmetic book; `inv_fact[i]` is the inverse of $i! \bmod p$ via Fermat.

> :angrygoose: Don't compute $\binom{n}{k}$ as `factorial(n) // (factorial(k) * factorial(n-k))` for large $n$ — the factorials overflow fixed-width integers and are needlessly enormous even with big integers. Use the multiplicative loop (exact, small intermediates) or the modular precompute (constant time per query). And remember $\binom{n}{k} = 0$ when $k < 0$ or $k > n$.

## Lucas' Theorem (binomials mod a prime)

For prime $p$, write $n$ and $k$ in base $p$ as $n = \sum n_i p^i$, $k = \sum k_i p^i$. Then

```math
\binom{n}{k} \equiv \prod_i \binom{n_i}{k_i} \pmod p.
```

This evaluates $\binom{n}{k} \bmod p$ even when $n$ is astronomically large, by working digit-by-digit in base $p$.

## Algorithmic Touchpoints

- **Lattice-path / grid DP**: paths from corner to corner of an $a\times b$ grid number $\binom{a+b}{a}$; the recurrence is Pascal's.
- **Counting DP tables** are frequently Pascal-like recurrences computed bottom-up.
- **Catalan numbers** $C_n = \frac{1}{n+1}\binom{2n}{n}$ count balanced parentheses, BST shapes, triangulations — binomials in disguise.
- **Modular combinatorics** (factorial + inverse-factorial tables) answers $\binom{n}{k} \bmod p$ in $O(1)$ after $O(n)$ preprocessing.

## Quick Sanity Checks

- Rows of Pascal's triangle are symmetric and sum to $2^n$.
- $\binom{n}{k} = 0$ outside $0 \le k \le n$ — guard for it.
- Use symmetry $\binom{n}{k} = \binom{n}{n-k}$ to halve work and catch typos.
- For a modular result, confirm `inv_fact[i] * fact[i] % p == 1` before trusting the table.
