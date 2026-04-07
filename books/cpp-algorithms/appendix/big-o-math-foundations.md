---
sidebar_position: 1
sidebar_label: "Big-O Math Foundations"
title: "Appendix: Code Analysis & Big-O Math Foundations"
---

# Appendix: Code Analysis & Big-O Math Foundations

This appendix gives you the mathematical machinery behind complexity analysis. Chapter 6 covers the pragmatic side — what Big-O means for your code, cache effects, and when constant factors matter. This appendix covers the *proofs* — how to derive complexity from first principles, solve recurrences, and evaluate the summations that show up when you analyze loops.

> :mathgoose: You don't need all of this to write efficient code. But if you want to *prove* that your algorithm is $O(n \log n)$ rather than hand-waving "it looks like merge sort," this is the toolkit.

## Asymptotic Notation: Formal Definitions

### Big-O (Upper Bound)

$f(n) = O(g(n))$ means there exist constants $c > 0$ and $n_0 > 0$ such that:

```math
f(n) \leq c \cdot g(n) \quad \text{for all } n \geq n_0
```

This is an **upper bound**. It says: "past some point, $f$ grows no faster than $g$, up to a constant factor."

**Example**: Show that $3n^2 + 7n + 5 = O(n^2)$.

We need $c$ and $n_0$ such that $3n^2 + 7n + 5 \leq c \cdot n^2$ for all $n \geq n_0$.

For $n \geq 1$: $7n \leq 7n^2$ and $5 \leq 5n^2$. So:

```math
3n^2 + 7n + 5 \leq 3n^2 + 7n^2 + 5n^2 = 15n^2
```

Choose $c = 15$, $n_0 = 1$. Done. $\square$

> :nerdygoose: Big-O is a *set*, not a function. Formally, $O(g(n))$ is the set of all functions bounded above by $c \cdot g(n)$. Writing $f(n) = O(g(n))$ is a mild abuse of notation — it means $f(n) \in O(g(n))$. The abuse is universal and harmless, but understanding it's a set membership claim prevents nonsense like "is $O(n^2) = O(n^3)$?"

### Big-Omega (Lower Bound)

$f(n) = \Omega(g(n))$ means there exist constants $c > 0$ and $n_0 > 0$ such that:

```math
f(n) \geq c \cdot g(n) \quad \text{for all } n \geq n_0
```

This is a **lower bound**. It says: "$f$ grows at least as fast as $g$."

**Example**: $3n^2 + 7n + 5 = \Omega(n^2)$ — just take $c = 3$, $n_0 = 1$: $3n^2 + 7n + 5 \geq 3n^2$ for all $n \geq 1$. $\square$

### Big-Theta (Tight Bound)

$f(n) = \Theta(g(n))$ means $f(n) = O(g(n))$ **and** $f(n) = \Omega(g(n))$. Equivalently, there exist $c_1, c_2 > 0$ and $n_0 > 0$ such that:

```math
c_1 \cdot g(n) \leq f(n) \leq c_2 \cdot g(n) \quad \text{for all } n \geq n_0
```

This is the **tight bound** — $f$ grows at exactly the same rate as $g$.

From our examples: $3n^2 + 7n + 5 = \Theta(n^2)$ (with $c_1 = 3$, $c_2 = 15$, $n_0 = 1$).

> :angrygoose: Most people say "this algorithm is $O(n \log n)$" when they mean $\Theta(n \log n)$. Big-O is only an upper bound — saying merge sort is $O(n^3)$ is technically correct but useless. When you claim a complexity, use $\Theta$ if you know it's tight, and $O$ if you're giving an upper bound that might not be tight. In practice everyone uses $O$ for tight bounds. Just know the difference.

### Little-o and Little-omega

$f(n) = o(g(n))$ means $f$ grows **strictly slower** than $g$:

```math
\lim_{n \to \infty} \frac{f(n)}{g(n)} = 0
```

$f(n) = \omega(g(n))$ means $f$ grows **strictly faster** than $g$:

```math
\lim_{n \to \infty} \frac{f(n)}{g(n)} = \infty
```

**Example**: $n = o(n^2)$ because $n/n^2 = 1/n \to 0$. But $n \neq o(n)$ because $n/n = 1 \not\to 0$.

> :mathgoose: Little-o is "strictly less than" while Big-O is "less than or equal to." The analogy: $O$ is $\leq$, $o$ is $<$, $\Omega$ is $\geq$, $\omega$ is $>$, $\Theta$ is $=$. This mapping is exact and useful.

## The Limit Rule

The fastest way to determine asymptotic relationships. Compute:

```math
L = \lim_{n \to \infty} \frac{f(n)}{g(n)}
```

| Result | Conclusion |
|---|---|
| $L = 0$ | $f(n) = o(g(n))$ and $f(n) = O(g(n))$ |
| $0 < L < \infty$ | $f(n) = \Theta(g(n))$ |
| $L = \infty$ | $f(n) = \omega(g(n))$ and $f(n) = \Omega(g(n))$ |

**Example**: Compare $n \log n$ and $n^{1.5}$.

```math
\lim_{n \to \infty} \frac{n \log n}{n^{1.5}} = \lim_{n \to \infty} \frac{\log n}{\sqrt{n}} = 0
```

(because $\log n$ grows slower than any positive power of $n$). So $n \log n = o(n^{1.5})$.

## Growth Rate Hierarchy

From slowest to fastest:

```math
1 \prec \log \log n \prec \log n \prec \sqrt{n} \prec n \prec n \log n \prec n^2 \prec n^3 \prec 2^n \prec n! \prec n^n
```

where $f \prec g$ means $f = o(g)$.

| Name | Growth | Typical source |
|---|---|---|
| Constant | $O(1)$ | Hash table lookup, array index |
| Logarithmic | $O(\log n)$ | Binary search, balanced BST lookup |
| Square root | $O(\sqrt{n})$ | Trial division, some number theory |
| Linear | $O(n)$ | Single pass over array |
| Linearithmic | $O(n \log n)$ | Merge sort, FFT |
| Quadratic | $O(n^2)$ | Nested loops, insertion sort |
| Cubic | $O(n^3)$ | Matrix multiplication (naive), Floyd-Warshall |
| Exponential | $O(2^n)$ | Subset enumeration, brute-force |
| Factorial | $O(n!)$ | Permutation enumeration |

> :sarcasticgoose: "My algorithm is $O(n^2)$ but with a small constant." Cool. At $n = 10{,}000$ your "small constant" multiplies $10^8$ operations. At $n = 100{,}000$ it multiplies $10^{10}$. Constants matter for benchmarks, but they don't save bad asymptotics. Fix the algorithm, then optimize the constant.

## Summation Formulas

Loop analysis reduces to evaluating sums. These are the ones you'll use constantly.

### Arithmetic Sums

```math
\sum_{k=1}^{n} k = 1 + 2 + 3 + \cdots + n = \frac{n(n+1)}{2} = \Theta(n^2)
```

*Proof (Gauss's trick)*: Write the sum forwards and backwards:

```math
S = 1 + 2 + 3 + \cdots + n
```

```math
S = n + (n-1) + (n-2) + \cdots + 1
```

Add term by term: each pair sums to $(n+1)$, and there are $n$ pairs:

```math
2S = n(n+1)
```

```math
S = \frac{n(n+1)}{2} \quad \square
```

**General power sums:**

```math
\sum_{k=1}^{n} k^2 = \frac{n(n+1)(2n+1)}{6} = \Theta(n^3)
```

```math
\sum_{k=1}^{n} k^3 = \left(\frac{n(n+1)}{2}\right)^2 = \Theta(n^4)
```

In general, $\sum_{k=1}^n k^p = \Theta(n^{p+1})$.

> :happygoose: The nested loop `for (i = 0; i < n; i++) for (j = 0; j < i; j++)` does $0 + 1 + 2 + \cdots + (n-1) = n(n-1)/2$ iterations. That's $\Theta(n^2)$. This is the single most common summation in algorithm analysis — it shows up in insertion sort, selection sort, bubble sort, and any algorithm with a triangular iteration pattern.

### Geometric Sums

```math
\sum_{k=0}^{n} r^k = \frac{r^{n+1} - 1}{r - 1} \quad (r \neq 1)
```

The asymptotic behavior depends on $r$:

| Case | Behavior | Complexity |
|---|---|---|
| $\|r\| < 1$ | Converges to $\frac{1}{1-r}$ | $\Theta(1)$ |
| $r = 1$ | Sum is $n + 1$ | $\Theta(n)$ |
| $r > 1$ | Dominated by largest term | $\Theta(r^n)$ |

**Key insight for $r > 1$:** the sum is dominated by the last term. Specifically:

```math
\sum_{k=0}^{n} r^k = \frac{r^{n+1} - 1}{r - 1} \leq \frac{r}{r-1} \cdot r^n = \Theta(r^n)
```

> :nerdygoose: This is why "doubling" strategies are efficient. If you double an array's capacity each time it fills up, the total cost of all copies is $1 + 2 + 4 + \cdots + n = 2n - 1 = \Theta(n)$. The geometric sum is dominated by the last term, so all previous copies combined cost less than the final one. This is the amortized $O(1)$ argument for `std::vector::push_back`.

### Harmonic Sum

```math
H_n = \sum_{k=1}^{n} \frac{1}{k} = 1 + \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{n} = \Theta(\log n)
```

More precisely: $H_n = \ln n + \gamma + O(1/n)$ where $\gamma \approx 0.5772$ is the Euler-Mascheroni constant.

*Proof that $H_n = \Theta(\log n)$*:

**Upper bound**: Compare with an integral. Since $1/x$ is decreasing:

```math
\frac{1}{k} \leq \int_{k-1}^{k} \frac{1}{x}\,dx \quad \text{for } k \geq 2
```

Summing from $k = 2$ to $n$:

```math
H_n - 1 = \sum_{k=2}^{n} \frac{1}{k} \leq \int_1^n \frac{1}{x}\,dx = \ln n
```

So $H_n \leq 1 + \ln n = O(\log n)$.

**Lower bound**: Similarly, $\frac{1}{k} \geq \int_k^{k+1} \frac{1}{x}\,dx$, so:

```math
H_n = \sum_{k=1}^{n} \frac{1}{k} \geq \int_1^{n+1} \frac{1}{x}\,dx = \ln(n+1) = \Omega(\log n)
```

Combining: $H_n = \Theta(\log n)$. $\square$

> :mathgoose: The harmonic sum appears in quicksort (expected comparisons), hash table analysis (expected chain length with random hashing), and the coupon collector problem (expected draws to collect all $n$ types is $n \cdot H_n = \Theta(n \log n)$). Recognizing it saves you from re-deriving $\Theta(\log n)$ each time.

### Logarithmic Sums

```math
\sum_{k=1}^{n} \log k = \log(n!) = \Theta(n \log n)
```

This follows from Stirling's approximation: $n! \approx \sqrt{\tau n}\left(\frac{n}{e}\right)^n$, so:

```math
\log(n!) = n \log n - n \log e + O(\log n) = \Theta(n \log n)
```

> :surprisedgoose: This is why comparison-based sorting is $\Omega(n \log n)$. There are $n!$ permutations, so any comparison tree needs at least $\log_2(n!) = \Theta(n \log n)$ comparisons in the worst case. The lower bound comes from a counting argument, not from any specific algorithm.

### Double Sums

Many nested-loop analyses require evaluating double sums. The key technique is **changing the order of summation**.

**Example**: Evaluate $\sum_{i=1}^{n} \sum_{j=i}^{n} 1$.

This counts pairs $(i, j)$ with $1 \leq i \leq j \leq n$.

Method 1 (inner sum first): For each $i$, $j$ runs from $i$ to $n$, giving $n - i + 1$ terms:

```math
\sum_{i=1}^{n} (n - i + 1) = n + (n-1) + \cdots + 1 = \frac{n(n+1)}{2}
```

Method 2 (swap order): For each $j$, $i$ runs from $1$ to $j$:

```math
\sum_{j=1}^{n} \sum_{i=1}^{j} 1 = \sum_{j=1}^{n} j = \frac{n(n+1)}{2}
```

Same answer. Swapping the summation order is the analogue of changing integration order in double integrals.

## Recurrences

Recursive algorithms produce recurrence relations. Solving them gives the complexity.

### The Master Theorem

For recurrences of the form:

```math
T(n) = a \cdot T(n/b) + f(n)
```

where $a \geq 1$, $b > 1$, and $f(n)$ is asymptotically positive. Let $c_{\text{crit}} = \log_b a$.

**Case 1**: If $f(n) = O(n^{c_{\text{crit}} - \varepsilon})$ for some $\varepsilon > 0$ (work is dominated by leaves):

```math
T(n) = \Theta(n^{c_{\text{crit}}})
```

**Case 2**: If $f(n) = \Theta(n^{c_{\text{crit}}} \log^k n)$ for some $k \geq 0$ (work is evenly distributed):

```math
T(n) = \Theta(n^{c_{\text{crit}}} \log^{k+1} n)
```

**Case 3**: If $f(n) = \Omega(n^{c_{\text{crit}} + \varepsilon})$ for some $\varepsilon > 0$ and $a \cdot f(n/b) \leq c \cdot f(n)$ for some $c < 1$ (work is dominated by root):

```math
T(n) = \Theta(f(n))
```

> :angrygoose: The Master Theorem covers most divide-and-conquer recurrences but NOT all. It doesn't apply when: (1) $a$ or $b$ aren't constants, (2) $f(n)$ falls between the cases (e.g., $n^{c_{\text{crit}}} / \log n$), or (3) the subproblems aren't equal size. For those, use the recursion tree or Akra-Bazzi.

### Master Theorem Examples

**Merge sort**: $T(n) = 2T(n/2) + \Theta(n)$.

$a = 2$, $b = 2$, $c_{\text{crit}} = \log_2 2 = 1$. $f(n) = \Theta(n) = \Theta(n^1 \log^0 n)$. Case 2 with $k = 0$:

```math
T(n) = \Theta(n \log n)
```

**Binary search**: $T(n) = T(n/2) + \Theta(1)$.

$a = 1$, $b = 2$, $c_{\text{crit}} = \log_2 1 = 0$. $f(n) = \Theta(1) = \Theta(n^0 \log^0 n)$. Case 2 with $k = 0$:

```math
T(n) = \Theta(\log n)
```

**Strassen's matrix multiplication**: $T(n) = 7T(n/2) + \Theta(n^2)$.

$a = 7$, $b = 2$, $c_{\text{crit}} = \log_2 7 \approx 2.807$. $f(n) = \Theta(n^2) = O(n^{2.807 - 0.807})$. Case 1:

```math
T(n) = \Theta(n^{\log_2 7}) \approx \Theta(n^{2.807})
```

**Karatsuba multiplication**: $T(n) = 3T(n/2) + \Theta(n)$.

$a = 3$, $b = 2$, $c_{\text{crit}} = \log_2 3 \approx 1.585$. $f(n) = \Theta(n) = O(n^{1.585 - 0.585})$. Case 1:

```math
T(n) = \Theta(n^{\log_2 3}) \approx \Theta(n^{1.585})
```

### Recursion Tree Method

When the Master Theorem doesn't apply, draw the recursion tree.

**Example**: $T(n) = T(n/3) + T(2n/3) + \Theta(n)$ (unequal split).

Level 0: $n$ work.
Level 1: $n/3 + 2n/3 = n$ work.
Level 2: Each subproblem splits again. Total work per level is still $\leq n$.

How deep is the tree? The longest path follows the $2n/3$ branch:

```math
n \to \frac{2n}{3} \to \left(\frac{2}{3}\right)^2 n \to \cdots \to 1
```

Depth: $\left(\frac{2}{3}\right)^d n = 1 \Rightarrow d = \log_{3/2} n = \Theta(\log n)$.

Total work: at most $n$ per level, $\Theta(\log n)$ levels:

```math
T(n) = O(n \log n)
```

For the lower bound, the shortest path follows $n/3$, with depth $\log_3 n$. Each level does at least $cn$ work (until the short branch terminates). So $T(n) = \Omega(n \log n)$, giving $T(n) = \Theta(n \log n)$.

> :happygoose: The recursion tree is the most intuitive method. Draw the tree, compute work per level, count levels, multiply. It works for unequal splits, non-constant branching, and anything the Master Theorem can't handle. When in doubt, draw the tree.

### Substitution Method (Induction)

Guess the answer, then prove it by induction.

**Example**: Prove $T(n) = 2T(n/2) + n$ gives $T(n) = O(n \log n)$.

**Guess**: $T(n) \leq cn \log n$ for some $c > 0$.

**Inductive step**: Assume $T(k) \leq ck \log k$ for all $k < n$.

```math
T(n) = 2T(n/2) + n \leq 2c(n/2)\log(n/2) + n
```

```math
= cn\log(n/2) + n = cn(\log n - 1) + n
```

```math
= cn\log n - cn + n = cn\log n - (c-1)n
```

For $c \geq 1$: $(c-1)n \geq 0$, so:

```math
T(n) \leq cn\log n - (c-1)n \leq cn\log n
```

The guess holds. Choose $c$ large enough to satisfy the base case. $\square$

> :sarcasticgoose: "Just guess the answer" sounds like terrible advice, but it works surprisingly often. You either know the answer from the Master Theorem and want to prove it formally, or you plot $T(n)$ for small values and recognize the pattern. The substitution method is verification, not discovery.

## Amortized Analysis

Some operations are expensive occasionally but cheap on average. Amortized analysis accounts for this.

### Aggregate Method

Count the total cost of $n$ operations, then divide by $n$.

**Example**: `std::vector` dynamic array. Each `push_back` is $O(1)$ unless the array is full, in which case it copies $n$ elements (cost $n$). With doubling strategy:

Copies happen at sizes $1, 2, 4, 8, \ldots, n$. Total copy cost:

```math
1 + 2 + 4 + 8 + \cdots + n = 2n - 1
```

Total cost for $n$ pushes: $n$ (for the insertions) + $2n - 1$ (for copies) = $3n - 1$.

Amortized cost per `push_back`: $(3n - 1)/n = 3 - 1/n = \Theta(1)$.

### Accounting Method

Assign each operation an "amortized cost" (which may differ from actual cost). If the total amortized cost $\geq$ total actual cost, the amortized cost is valid.

**Example**: Charge each `push_back` 3 credits:
- 1 credit for the insertion itself.
- 2 credits saved for future copying. When the array doubles from size $k$ to $2k$, the $k$ new elements (inserted since the last doubling) each donated 2 credits — that's $2k$ credits, enough to copy $k$ old elements ($k$ credits) and $k$ new elements ($k$ credits).

Every doubling is fully funded. Amortized cost: $O(1)$ per `push_back`.

> :nerdygoose: The accounting method is how the C++ standard justifies `std::vector::push_back` being "amortized constant time." The actual standard requirement is that the growth factor must be $> 1$ (GCC uses 2, MSVC uses 1.5). The amortized analysis works for any constant factor $> 1$ — only the constant in $O(1)$ changes.

### Potential Method

Define a potential function $\Phi$ mapping the data structure state to a non-negative number. The amortized cost of operation $i$ is:

```math
\hat{c}_i = c_i + \Phi(D_i) - \Phi(D_{i-1})
```

where $c_i$ is the actual cost and $D_i$ is the state after operation $i$.

If $\Phi(D_n) \geq \Phi(D_0)$, then the total amortized cost $\geq$ total actual cost.

**Example**: For dynamic array, let $\Phi = 2 \cdot \text{size} - \text{capacity}$.

- Regular `push_back` (no resize): actual cost $= 1$, $\Delta\Phi = 2$ (size increases by 1). Amortized = $1 + 2 = 3$.
- Resize `push_back` (capacity doubles from $k$ to $2k$): actual cost $= k + 1$. $\Delta\Phi = 2(k+1) - 2k - (2k - k) = 2k + 2 - 2k - k = 2 - k$. Amortized $= (k+1) + (2-k) = 3$.

Amortized cost is always 3. $\square$

## Analyzing Common Patterns

### Single Loop

```cpp
for (int i = 0; i < n; i++) {
    // O(1) work
}
```

Total: $\sum_{i=0}^{n-1} O(1) = O(n)$.

### Nested Loop (Triangular)

```cpp
for (int i = 0; i < n; i++) {
    for (int j = 0; j < i; j++) {
        // O(1) work
    }
}
```

Total: $\sum_{i=0}^{n-1} i = \frac{n(n-1)}{2} = O(n^2)$.

### Nested Loop (Multiplicative)

```cpp
for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= n / i; j++) {
        // O(1) work
    }
}
```

Total: $\sum_{i=1}^{n} \lfloor n/i \rfloor \approx n \sum_{i=1}^{n} 1/i = n \cdot H_n = \Theta(n \log n)$.

> :surprisedgoose: This pattern shows up in the sieve of Eratosthenes. The outer loop goes over each number, the inner loop marks its multiples. The total work is $n/2 + n/3 + n/5 + n/7 + \cdots$ (only primes), which by Mertens' theorem is $\Theta(n \log \log n)$. Even more efficient than the general harmonic pattern.

### Logarithmic Loop

```cpp
for (int i = 1; i < n; i *= 2) {
    // O(1) work
}
```

Total: $\lfloor \log_2 n \rfloor + 1 = O(\log n)$. The loop variable doubles each step, so it reaches $n$ after $\log_2 n$ iterations.

### Logarithmic Inner Loop

```cpp
for (int i = 0; i < n; i++) {
    for (int j = 1; j < n; j *= 2) {
        // O(1) work
    }
}
```

Total: $n \cdot O(\log n) = O(n \log n)$.

### Log-Star and Inverse Ackermann

Some data structures (disjoint set with path compression and union by rank) have amortized $O(\alpha(n))$ per operation, where $\alpha$ is the inverse Ackermann function.

$\alpha(n)$ grows so slowly it's effectively constant for any physically realizable input:

| $n$ | $\alpha(n)$ |
|---|---|
| $1$ | $0$ |
| $2$ | $1$ |
| $4$ | $2$ |
| $16$ | $3$ |
| $65536$ | $4$ |
| $2^{65536}$ | $5$ |

> :mathgoose: For any $n$ that fits in the observable universe, $\alpha(n) \leq 4$. It's "essentially $O(1)$" but provably not $O(1)$ — Tarjan proved the lower bound. Union-Find is one of the rare data structures where the theory gives you something strictly between $O(1)$ and $O(\log n)$.

## Probability and Expected Complexity

### Expected Value

For a discrete random variable $X$:

```math
E[X] = \sum_x x \cdot P(X = x)
```

**Linearity of expectation** (always holds, even without independence):

```math
E[X + Y] = E[X] + E[Y]
```

### Randomized Quicksort

Let $X_{ij}$ be the indicator variable that elements $i$ and $j$ are compared. By linearity of expectation, the expected total comparisons:

```math
E[\text{comparisons}] = \sum_{i=1}^{n-1} \sum_{j=i+1}^{n} P(i \text{ and } j \text{ are compared})
```

Elements $i$ and $j$ (in sorted order) are compared iff one of them is chosen as a pivot before any element between them. The probability is $2/(j - i + 1)$.

```math
E[\text{comparisons}] = \sum_{i=1}^{n-1} \sum_{j=i+1}^{n} \frac{2}{j - i + 1}
```

Let $k = j - i$:

```math
= \sum_{i=1}^{n-1} \sum_{k=1}^{n-i} \frac{2}{k+1} \leq \sum_{i=1}^{n-1} 2H_n = 2(n-1)H_n = \Theta(n \log n)
```

> :happygoose: The expected analysis of quicksort uses only two tools: indicator random variables and the harmonic sum. No integration, no probability distributions. Linearity of expectation is the workhorse — it lets you decompose a complex random variable into simple binary indicators and add up the expectations. This technique works for hash tables, skip lists, randomized BSTs, and any algorithm where you can define "did this pair interact?"

## Useful Proof Techniques

### Induction for Summations

To prove $\sum_{k=1}^n k = n(n+1)/2$:

**Base case** ($n = 1$): $\sum_{k=1}^1 k = 1 = 1 \cdot 2/2$. $\checkmark$

**Inductive step**: Assume $\sum_{k=1}^n k = n(n+1)/2$. Then:

```math
\sum_{k=1}^{n+1} k = \sum_{k=1}^{n} k + (n+1) = \frac{n(n+1)}{2} + (n+1)
```

```math
= (n+1)\left(\frac{n}{2} + 1\right) = (n+1) \cdot \frac{n+2}{2} = \frac{(n+1)(n+2)}{2}
```

This matches the formula with $n$ replaced by $n + 1$. $\square$

### Integral Bounds for Sums

For a monotonically decreasing function $f$:

```math
\int_1^{n+1} f(x)\,dx \leq \sum_{k=1}^n f(k) \leq f(1) + \int_1^n f(x)\,dx
```

For a monotonically increasing function $f$:

```math
f(1) + \int_1^n f(x)\,dx \leq \sum_{k=1}^n f(k) \leq \int_1^{n+1} f(x)\,dx
```

This is how we bounded the harmonic sum, and it works for any sum you can integrate.

### Stirling's Approximation

```math
n! = \sqrt{\tau n} \left(\frac{n}{e}\right)^n \left(1 + \Theta\left(\frac{1}{n}\right)\right)
```

Therefore:

```math
\log(n!) = n \log n - n + \frac{1}{2}\log(\tau n) + O(1/n) = \Theta(n \log n)
```

This gives the information-theoretic lower bound for comparison sorting: $\lceil \log_2(n!) \rceil = \Theta(n \log n)$ comparisons.

## Quick Reference: Common Recurrences

| Recurrence | Solution | Algorithm |
|---|---|---|
| $T(n) = T(n-1) + O(1)$ | $O(n)$ | Linear scan |
| $T(n) = T(n-1) + O(n)$ | $O(n^2)$ | Selection sort |
| $T(n) = T(n/2) + O(1)$ | $O(\log n)$ | Binary search |
| $T(n) = T(n/2) + O(n)$ | $O(n)$ | Median of medians |
| $T(n) = 2T(n/2) + O(1)$ | $O(n)$ | Tree traversal |
| $T(n) = 2T(n/2) + O(n)$ | $O(n \log n)$ | Merge sort |
| $T(n) = 2T(n/2) + O(n \log n)$ | $O(n \log^2 n)$ | Closest pair (naive merge) |
| $T(n) = 3T(n/2) + O(n)$ | $O(n^{\log_2 3})$ | Karatsuba |
| $T(n) = 7T(n/2) + O(n^2)$ | $O(n^{\log_2 7})$ | Strassen |
| $T(n) = 2T(n-1) + O(1)$ | $O(2^n)$ | Fibonacci (naive) |

> :angrygoose: If your recurrence looks like $T(n) = 2T(n-1) + \text{anything}$, you have exponential blowup. The branching factor is $2$ at every level for $n$ levels = $2^n$ leaves. This is the "recursive Fibonacci" trap. Memoize or reformulate as bottom-up DP to drop to $O(n)$.

## Sanity Checks

- $O(1) \subset O(\log n) \subset O(n) \subset O(n \log n) \subset O(n^2)$. If your analysis puts binary search at $O(n)$, something is wrong.
- A single loop over $n$ elements is at least $\Omega(n)$ if it touches every element.
- Comparison-based sorting is $\Omega(n \log n)$. If your sort beats this, it's either not comparison-based (counting/radix) or wrong.
- Any algorithm that looks at all pairs is $\Omega(n^2)$. If you need all-pairs and want better, you need algebraic tricks (matrix multiplication) or approximations.
- Amortized $O(1)$ does NOT mean every operation is $O(1)$. It means the *average* over a sequence is $O(1)$. Individual operations can be $O(n)$.
- $O(\log n)$ base doesn't matter: $\log_2 n = \log_{10} n / \log_{10} 2$. Different bases differ by a constant factor, which Big-O absorbs.
