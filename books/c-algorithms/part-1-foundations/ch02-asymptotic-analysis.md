---
sidebar_position: 2
sidebar_label: "Ch 2: Asymptotic Analysis"
title: "Chapter 2: Asymptotic Analysis"
---

# Chapter 2: Asymptotic Analysis

Big-O is a comparison. Given two functions $f$ and $g$ on the natural numbers, asymptotic notation tells you which one grows faster, ignoring constants and small inputs. This chapter defines the notation precisely, gives you the tools to compute it, and works through the recurrence-relation machinery you need for divide-and-conquer algorithms.

## The Five Notations

Five symbols, three of which you will use daily.

### Big-O — Upper Bound

$f(n) = O(g(n))$ means there exist constants $c > 0$ and $n_0 > 0$ such that:

```math
0 \leq f(n) \leq c \cdot g(n) \quad \text{for all } n \geq n_0
```

In English: past some point, $f$ is at most a constant multiple of $g$.

**Example.** $3n^2 + 7n + 5 = O(n^2)$. Choose $c = 15$, $n_0 = 1$. Then for $n \geq 1$:

```math
3n^2 + 7n + 5 \leq 3n^2 + 7n^2 + 5n^2 = 15 n^2
```

Done. $\square$

### Big-Omega — Lower Bound

$f(n) = \Omega(g(n))$ means there exist constants $c > 0$ and $n_0 > 0$ such that:

```math
0 \leq c \cdot g(n) \leq f(n) \quad \text{for all } n \geq n_0
```

$f$ is at least a constant multiple of $g$, eventually.

**Example.** $3n^2 + 7n + 5 = \Omega(n^2)$. Take $c = 3$, $n_0 = 1$: $3n^2 + 7n + 5 \geq 3n^2$.

### Big-Theta — Tight Bound

$f(n) = \Theta(g(n))$ means $f(n) = O(g(n))$ **and** $f(n) = \Omega(g(n))$. Equivalently, there exist $c_1, c_2 > 0$ and $n_0 > 0$ such that:

```math
c_1 \cdot g(n) \leq f(n) \leq c_2 \cdot g(n) \quad \text{for all } n \geq n_0
```

$f$ grows at exactly the same rate as $g$, up to constant factors.

> :angrygoose: Most people say "this algorithm is $O(n \log n)$" when they mean $\Theta(n \log n)$. Saying merge sort is $O(n^3)$ is *technically* correct — $n \log n$ is bounded above by $n^3$. It is also useless. When you know the bound is tight, write $\Theta$. When you don't, write $O$. The convention has eroded; the precision is still worth keeping.

### Little-o and Little-omega — Strict Bounds

$f(n) = o(g(n))$ means $f$ grows **strictly** slower than $g$:

```math
\lim_{n \to \infty} \frac{f(n)}{g(n)} = 0
```

$f(n) = \omega(g(n))$ means $f$ grows **strictly** faster than $g$:

```math
\lim_{n \to \infty} \frac{f(n)}{g(n)} = \infty
```

These show up rarely in everyday work but are useful for separating classes that Big-O cannot. $n = o(n^2)$ is true; $n = O(n^2)$ is also true. The lowercase form rules out the case $f = \Theta(g)$.

## The Hierarchy

Memorize the chain. Most algorithms you'll meet sit in one of these classes:

```math
1 \prec \log\log n \prec \log n \prec \sqrt{n} \prec n \prec n \log n \prec n^2 \prec n^3 \prec 2^n \prec n! \prec n^n
```

Where $f \prec g$ means $f = o(g)$. A few things worth noting:

- Logs of any base are interchangeable: $\log_a n = \Theta(\log_b n)$ because $\log_a n = \log_b n / \log_b a$ — a constant factor.
- Polynomials beat polylogarithms: $\log^k n = o(n^\epsilon)$ for any $k$ and any $\epsilon > 0$.
- Exponentials beat polynomials: $n^k = o(c^n)$ for any $k$ and any $c > 1$.
- $n! \sim \sqrt{2\pi n}\,(n/e)^n$ by Stirling — between $2^n$ and $n^n$.

> :mathgoose: The proofs all reduce to L'Hôpital. To show $n^{100} = o(2^n)$: $\lim_{n\to\infty} n^{100}/2^n$. Apply L'Hôpital 100 times — each application drops the polynomial degree by one and leaves the exponential. After 100 applications you have $\lim 100!/(\ln 2)^{100} \cdot 2^n$, which goes to zero. Exponentials always win in the long run.

## The Limit Test

In practice, the fastest way to compare two functions is:

```math
L = \lim_{n \to \infty} \frac{f(n)}{g(n)}
```

| Limit | Conclusion |
|---|---|
| $L = 0$ | $f = o(g)$, hence $f = O(g)$ |
| $L = \infty$ | $f = \omega(g)$, hence $f = \Omega(g)$ |
| $L = c$, $0 < c < \infty$ | $f = \Theta(g)$ |
| Limit doesn't exist | Test fails — fall back to definition |

The last row matters: $f(n) = (1 + (-1)^n) n$ oscillates between $0$ and $2n$, so $f/n$ has no limit. But $f = \Theta(n)$ by the definition (with $c_1 = 0$ — wait, $c_1$ has to be positive. So actually $f = O(n)$ but not $\Theta(n)$ — at even $n$, $f$ is zero). Pathological cases exist; the limit test handles 99% of real algorithms.

**Worked example.** Is $\log(n!) = \Theta(n \log n)$?

Stirling: $\log(n!) = n \log n - n + O(\log n)$. The dominant term is $n \log n$. Limit test:

```math
\lim_{n \to \infty} \frac{\log(n!)}{n \log n} = \lim_{n \to \infty} \frac{n \log n - n + O(\log n)}{n \log n} = 1
```

So $\log(n!) = \Theta(n \log n)$. This is why comparison-based sorts have an $\Omega(n \log n)$ lower bound — they need at least $\log(n!)$ comparisons to distinguish the $n!$ permutations.

## Summation Rules

When you analyze a loop, you sum the cost of each iteration. A few rules let you do this without arithmetic acrobatics.

### Constant Multiples

```math
\sum_{i=1}^{n} c \cdot f(i) = c \sum_{i=1}^{n} f(i)
```

Constants don't change the asymptotic class. $\sum 5 = \Theta(n)$, just like $\sum 1$.

### Sum of a Polynomial

```math
\sum_{i=1}^{n} i^k = \Theta(n^{k+1}) \quad \text{for any constant } k \geq 0
```

The exact closed forms:

```math
\sum_{i=1}^{n} 1 = n, \qquad \sum_{i=1}^{n} i = \frac{n(n+1)}{2}, \qquad \sum_{i=1}^{n} i^2 = \frac{n(n+1)(2n+1)}{6}
```

For asymptotic purposes you only care that $\sum i^k = \Theta(n^{k+1})$. The constants depend on $k$ but the class is determined by $k$.

### Sum of a Logarithm

```math
\sum_{i=1}^{n} \log i = \log(n!) = \Theta(n \log n)
```

Useful for analyzing nested loops where the inner loop runs in logarithmic time.

### Geometric Series

```math
\sum_{i=0}^{n-1} r^i = \frac{r^n - 1}{r - 1} \quad (r \neq 1)
```

For $r > 1$: $\Theta(r^n)$. The last term dominates.
For $r < 1$: $\Theta(1)$. The first term dominates; the sum converges to $1/(1-r)$.

This is the rule that makes amortization arguments work. Doubling a buffer over $n$ pushes does $1 + 2 + 4 + \cdots + n/2 + n = 2n - 1$ extra copies — geometric series with $r = 2$, sum is $\Theta(n)$, average per push is $\Theta(1)$.

### Harmonic Sum

```math
H_n = \sum_{i=1}^{n} \frac{1}{i} = \Theta(\log n)
```

More precisely, $H_n = \ln n + \gamma + O(1/n)$ where $\gamma \approx 0.577$ (Euler-Mascheroni). This shows up in quicksort's average case and in randomized algorithms.

## Manipulating Asymptotic Expressions

A few rules that let you simplify without writing out the definitions:

**Sum.** $O(f) + O(g) = O(\max(f, g))$.

**Product.** $O(f) \cdot O(g) = O(f g)$.

**Composition.** If $f = O(g)$ and $g = O(h)$, then $f = O(h)$. Transitivity.

**Substitution.** $O(f(n))$ where $n \to g(n)$ becomes $O(f(g(n)))$.

These rules are why "drop lower-order terms" works:

```math
3n^2 + 100 n \log n + 50 = O(n^2 + n \log n + 1) = O(n^2)
```

The middle step uses sum-of-O. The last step uses the fact that $n^2 = \omega(n \log n) = \omega(1)$, so $n^2$ dominates.

> :angrygoose: One subtle trap. $f(n) = O(g(n))$ does **not** mean you can plug it back in like a variable. Writing "$O(n) - O(n) = 0$" is wrong. The two $O(n)$'s might be different functions, with different constants. The correct statement is: if $f, g \in O(n)$, then $f - g \in O(n)$ — not zero. Asymptotic notation is a *set membership* claim, not an equation.

## Recurrence Relations

Divide-and-conquer algorithms divide a problem of size $n$ into subproblems, solve them recursively, and combine the results. The total cost is captured by a *recurrence relation*:

```math
T(n) = a \cdot T(n/b) + f(n)
```

- $a$ — number of subproblems.
- $n/b$ — size of each subproblem.
- $f(n)$ — cost of the divide and combine steps.

Examples:
- **Binary search**: $T(n) = T(n/2) + \Theta(1)$. One subproblem, half the size, constant work.
- **Merge sort**: $T(n) = 2 T(n/2) + \Theta(n)$. Two halves, linear merge.
- **Strassen's matrix multiplication**: $T(n) = 7 T(n/2) + \Theta(n^2)$. Seven half-sized multiplications, quadratic combine.

To solve these, three methods.

### 1. Substitution (Guess and Verify)

Guess the answer, prove it by induction.

**Example.** $T(n) = 2 T(n/2) + n$. Guess $T(n) = O(n \log n)$.

Prove $T(n) \leq c n \log n$ for some $c > 0$ and large enough $n$. Induction:

```math
T(n) = 2 T(n/2) + n \leq 2 \cdot c (n/2) \log(n/2) + n = c n (\log n - 1) + n
```

```math
= c n \log n - c n + n = c n \log n + n (1 - c)
```

Choose $c \geq 1$. Then $T(n) \leq c n \log n$. Verified. $\square$

### 2. Recursion Tree

Draw the recursion tree. Sum the work at each level. Sum the levels.

For $T(n) = 2 T(n/2) + n$:

| Level | Subproblems | Size each | Work each | Work this level |
|---|---|---|---|---|
| 0 | 1 | $n$ | $n$ | $n$ |
| 1 | 2 | $n/2$ | $n/2$ | $n$ |
| 2 | 4 | $n/4$ | $n/4$ | $n$ |
| ... | ... | ... | ... | ... |
| $\log n$ | $n$ | $1$ | $1$ | $n$ |

Each level does $\Theta(n)$ work. There are $\log n + 1$ levels. Total: $\Theta(n \log n)$.

### 3. The Master Theorem

The hammer for any recurrence of the form $T(n) = a T(n/b) + f(n)$ where $a \geq 1$, $b > 1$.

Compare $f(n)$ to $n^{\log_b a}$. Three cases:

**Case 1.** If $f(n) = O(n^{\log_b a - \epsilon})$ for some $\epsilon > 0$:

```math
T(n) = \Theta(n^{\log_b a})
```

The leaves of the recursion tree dominate.

**Case 2.** If $f(n) = \Theta(n^{\log_b a} \log^k n)$ for $k \geq 0$:

```math
T(n) = \Theta(n^{\log_b a} \log^{k+1} n)
```

Each level contributes equally; multiply by the number of levels.

**Case 3.** If $f(n) = \Omega(n^{\log_b a + \epsilon})$ for some $\epsilon > 0$, **and** $a f(n/b) \leq c f(n)$ for some $c < 1$ and large $n$ (the "regularity condition"):

```math
T(n) = \Theta(f(n))
```

The root of the recursion tree dominates.

**Worked examples.**

- **Binary search**: $T(n) = T(n/2) + \Theta(1)$. Here $a = 1$, $b = 2$, so $n^{\log_b a} = n^0 = 1$. $f(n) = \Theta(1) = \Theta(n^0 \log^0 n)$. Case 2 with $k = 0$. $T(n) = \Theta(\log n)$.

- **Merge sort**: $T(n) = 2 T(n/2) + \Theta(n)$. $a = 2$, $b = 2$, $n^{\log_b a} = n$. $f(n) = \Theta(n) = \Theta(n^1 \log^0 n)$. Case 2 with $k = 0$. $T(n) = \Theta(n \log n)$.

- **Strassen**: $T(n) = 7 T(n/2) + \Theta(n^2)$. $a = 7$, $b = 2$, $\log_2 7 \approx 2.807$. $n^{\log_b a} = n^{2.807}$. $f(n) = n^2$, which is $O(n^{2.807 - \epsilon})$ for $\epsilon = 0.807$. Case 1. $T(n) = \Theta(n^{\log_2 7}) \approx \Theta(n^{2.807})$.

> :nerdygoose: The master theorem has gaps. It does not handle $T(n) = T(n-1) + n$ (subtraction, not division — that's $\Theta(n^2)$, derived by direct substitution). It does not handle non-polynomial $f$. There is an extended Akra-Bazzi method that fills the gaps; you almost never need it.

> :sarcasticgoose: "Why memorize three cases?" Because the alternative is drawing recursion trees forever. Pattern-match the recurrence, pick the case, write the answer. The proof of the theorem is a recursion-tree argument; the theorem just spares you from re-doing it every time.

## Best, Worst, and Average Case

A complexity claim is a function from input size to operation count. But for most algorithms, *different inputs of the same size* take different times. Three flavors of analysis:

- **Worst case.** The maximum over all inputs of size $n$. The honest upper bound for hard real-time systems.
- **Best case.** The minimum. Almost always uninteresting on its own — but useful when paired with the worst case to show the spread.
- **Average case.** The expected value over some input distribution. The relevant measure for typical workloads.

Examples:

| Algorithm | Worst | Average | Best |
|---|---|---|---|
| Linear search | $\Theta(n)$ | $\Theta(n)$ | $\Theta(1)$ |
| Binary search | $\Theta(\log n)$ | $\Theta(\log n)$ | $\Theta(1)$ |
| Insertion sort | $\Theta(n^2)$ | $\Theta(n^2)$ | $\Theta(n)$ |
| Quicksort | $\Theta(n^2)$ | $\Theta(n \log n)$ | $\Theta(n \log n)$ |
| Merge sort | $\Theta(n \log n)$ | $\Theta(n \log n)$ | $\Theta(n \log n)$ |

The interesting row is quicksort. Worst case $\Theta(n^2)$ — degenerate pivots on a sorted input. Average $\Theta(n \log n)$ over a uniform random input distribution. In practice, quicksort beats merge sort on most workloads because its constants are smaller and it's cache-friendly. The asymptotic worst case rarely matters when you randomize the pivot.

> :angrygoose: "Average case" requires a distribution. If you don't say what distribution, the claim is meaningless. Quicksort is $\Theta(n \log n)$ on average *over uniformly distributed inputs*. On adversarial inputs the average case becomes the worst case. Real-world workloads sit somewhere between these extremes; that's why you measure.

## Amortized Analysis (Preview)

Some algorithms are not described well by worst-case-per-operation. Pushing onto a dynamic array can occasionally trigger a $\Theta(n)$ reallocation, but the *average over a sequence of pushes* is $\Theta(1)$.

Three techniques formalize this — aggregate, accounting (banker's), and potential (physicist's) methods. Chapter 4 walks through all three on the dynamic-array example. The geometric-series rule from earlier in this chapter is the underlying machinery: the total cost over $n$ pushes is bounded by $\sum 2^i$ for $i$ up to $\log n$, which is $\Theta(n)$.

## Cheat Sheet

```text
Definitions
  f = O(g)      f ≤ c·g eventually
  f = Ω(g)      f ≥ c·g eventually
  f = Θ(g)      O and Ω both
  f = o(g)      lim f/g = 0
  f = ω(g)      lim f/g = ∞

Limit test
  lim f/g = 0    →  f = o(g)
  lim f/g = c    →  f = Θ(g)
  lim f/g = ∞    →  f = ω(g)

Hierarchy
  1 < log log n < log n < √n < n < n log n < n² < n³ < 2ⁿ < n! < nⁿ

Sums
  Σ i^k        = Θ(n^(k+1))
  Σ log i      = Θ(n log n)
  Σ rⁱ (r>1)  = Θ(rⁿ)
  Σ 1/i        = Θ(log n)

Master theorem T(n) = a T(n/b) + f(n)
  Case 1: f = O(n^(log_b a − ε))    → T = Θ(n^(log_b a))
  Case 2: f = Θ(n^(log_b a) log^k n) → T = Θ(n^(log_b a) log^(k+1) n)
  Case 3: f = Ω(n^(log_b a + ε))    → T = Θ(f)        (with regularity)
```

> :happygoose: You will not re-derive these every time. After a hundred algorithms you'll glance at a recurrence and write the answer. The point of this chapter is not memorization — it's that you understand *why* the answers are what they are, so when you meet a recurrence the master theorem can't handle, you can fall back to recursion trees or substitution and not be stuck.

## What's Next

Chapter 3 stops the math and gets the build environment running. We set up the Makefile, the test harness, and the benchmark harness — all the infrastructure the rest of the book assumes.
