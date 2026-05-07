---
sidebar_position: 4
sidebar_label: "Ch 3.5: Asymptotics — Deep Dive"
title: "Chapter 3.5: Asymptotic Analysis — The Deep Dive"
---

# Chapter 3.5: Asymptotic Analysis — The Deep Dive

> The previous chapter gave you the working vocabulary. This one is
> for when "I sort of get it" isn't enough — when the interview is
> at a senior level, when you're reading a paper, or when a
> recurrence won't yield to the master theorem and you need
> something stronger.
>
> This chapter is denser than its predecessor. The math is real but
> the personas keep you company through it.

## 1. The five asymptotic notations, formally

Recall the casual "Big-O is no worse than" line from Ch 3. Here's
the precise version of all five members of the family.

### $O(g)$ — upper bound

$$f(n) \in O(g(n)) \iff \exists\, c > 0,\, n_0 \ge 0 :\ \forall n \ge n_0,\ 0 \le f(n) \le c \cdot g(n)$$

**Plain English:** past some threshold $n_0$, the function $f$ never
grows more than a constant multiple of $g$.

> :nerdygoose: The phrase "$f \in O(g)$" is technically correct
> because $O(g)$ is a *set* of functions. Most people write
> "$f = O(g)$" — a notational abuse that's universal and harmless
> *if you remember it's not equality*. $O(n) = O(n^2)$ does not
> imply $O(n^2) = O(n)$.

### $\Omega(g)$ — lower bound

$$f(n) \in \Omega(g(n)) \iff \exists\, c > 0,\, n_0 \ge 0 :\ \forall n \ge n_0,\ 0 \le c \cdot g(n) \le f(n)$$

Past $n_0$, $f$ never falls below $c \cdot g$. Symmetric to $O$.

### $\Theta(g)$ — tight bound

$$f(n) \in \Theta(g(n)) \iff f(n) \in O(g(n)) \land f(n) \in \Omega(g(n))$$

Both bounds hold. Equivalently:

$$\exists\, c_1, c_2 > 0,\, n_0 \ge 0 :\ \forall n \ge n_0,\ c_1 g(n) \le f(n) \le c_2 g(n)$$

### $o(g)$ — strict upper bound (little-o)

$$f(n) \in o(g(n)) \iff \forall c > 0,\, \exists\, n_0 \ge 0 :\ \forall n \ge n_0,\ 0 \le f(n) < c \cdot g(n)$$

The constant flips position. For *every* $c > 0$ — no matter how
small — eventually $f$ stays below $c \cdot g$. Equivalent
characterization (when $g(n) > 0$):

$$f \in o(g) \iff \lim_{n \to \infty} \frac{f(n)}{g(n)} = 0$$

> :mathgoose: Little-$o$ is **strict**. "$n^2 \in o(n^3)$" but
> "$n^2 \notin o(n^2)$". $O$ and $\Theta$ allow equality;
> $o$ and $\omega$ do not.

### $\omega(g)$ — strict lower bound (little-omega)

$$f \in \omega(g) \iff \lim_{n \to \infty} \frac{f(n)}{g(n)} = \infty$$

The mirror of little-$o$.

### Quick reference table

| Notation | Reads as | $\lim f/g$ |
|---|---|---|
| $O(g)$ | "no worse than $g$" | $\ne \infty$ |
| $\Omega(g)$ | "no better than $g$" | $\ne 0$ |
| $\Theta(g)$ | "exactly $g$, up to constants" | finite, positive |
| $o(g)$ | "strictly better than $g$" | $0$ |
| $\omega(g)$ | "strictly worse than $g$" | $\infty$ |

## 2. The arithmetic of asymptotic notation

A few rules you'll use constantly. All assume $f, g, h$ are
asymptotically non-negative.

### Reflexivity & transitivity

$$f \in \Theta(f), \qquad f \in O(f), \qquad f \in \Omega(f)$$

$$\text{If } f \in O(g) \text{ and } g \in O(h), \text{ then } f \in O(h)$$

(Same for $\Omega$, $\Theta$, $o$, $\omega$.)

### Sum rule

$$f + g \in \Theta(\max(f, g))$$

When you add two functions, the bigger one dominates. Useful for
loops: a loop that does $\Theta(\log n)$ work then $\Theta(n)$ work
per iteration is $\Theta(n)$ per iteration, not $\Theta(n + \log n)$.

### Constant multiples

$$c \cdot f \in \Theta(f) \quad \text{for any constant } c > 0$$

The whole reason we drop constants.

### Polynomials

$$\sum_{k=0}^{d} a_k n^k \in \Theta(n^d) \quad \text{(when } a_d > 0\text{)}$$

A polynomial is dominated by its highest-degree term.

### Exponentials beat polynomials beat logs

For any constants $a > 1$, $b > 0$, $c > 1$:

$$\log^a n \in o(n^b) \quad \text{and} \quad n^b \in o(c^n)$$

This is the entire **growth-rate hierarchy** in two lines:

$$1 \prec \log\log n \prec \log n \prec n^c\,(0<c<1) \prec n \prec n \log n \prec n^c\,(c>1) \prec c^n \prec n!$$

where $f \prec g$ means $f \in o(g)$.

> :surprisedgoose: $n!$ grows even faster than $2^n$. By **Stirling's
> approximation**, $n! \approx \sqrt{2\pi n} (n/e)^n$, so $\log(n!) =
> \Theta(n \log n)$. That's why brute-force permutation algorithms
> become unusable around $n = 12$ — $12! \approx 479\text{M}$.

### Proof sketch: $\log n \in o(n)$

By L'Hôpital's rule:

$$\lim_{n \to \infty} \frac{\log n}{n} = \lim_{n \to \infty} \frac{1/n}{1} = 0$$

so $\log n \in o(n)$ by the limit characterization. Similar
applications give $\log n \in o(n^c)$ for any $c > 0$, and
$n^k \in o(c^n)$ for any $c > 1$.

> :mathgoose: The L'Hôpital trick fails when both functions don't
> go to infinity (or both to zero). For most asymptotic comparisons
> we want — log vs polynomial, polynomial vs exponential — the
> conditions are met and you can apply it directly.

## 3. The master theorem (full statement)

For recurrences of the form

$$T(n) = a \cdot T(n/b) + f(n), \qquad a \ge 1,\ b > 1,\ f \text{ asymptotically positive}$$

let $E = \log_b a$ (the "expected" exponent — the work the
recursion would do if combine were free). Compare $f(n)$ against
$n^E$:

| Case | Condition | Result |
|---|---|---|
| **1** | $f(n) \in O(n^{E-\epsilon})$ for some $\epsilon > 0$ | $T(n) \in \Theta(n^E)$ |
| **2** | $f(n) \in \Theta(n^E \log^k n)$ for some $k \ge 0$ | $T(n) \in \Theta(n^E \log^{k+1} n)$ |
| **3** | $f(n) \in \Omega(n^{E+\epsilon})$ for some $\epsilon > 0$, *and* the regularity condition $a \cdot f(n/b) \le c \cdot f(n)$ for some $c < 1$ holds | $T(n) \in \Theta(f(n))$ |

### The intuition: recursion-tree argument

Picture the recursion as a tree. The root does $f(n)$ work. Its $a$
children each do $f(n/b)$ work, so level 1 does $a \cdot f(n/b)$
work. Level 2 does $a^2 \cdot f(n/b^2)$. The tree has depth
$\log_b n$, and the leaves do $a^{\log_b n} = n^{\log_b a} = n^E$
total work.

The total cost is the sum across levels. **Whichever level
dominates the sum determines the total**:

- **Case 1** — leaves dominate. The work done at the leaves
  ($n^E$) outpaces what's done above. Total: $\Theta(n^E)$.
- **Case 2** — every level does roughly the same work. With
  $\log n$ levels, total: $\Theta(n^E \log n)$ (extend to
  $\log^{k+1}$ for the polylog version).
- **Case 3** — the root dominates. The work at level 0 ($f(n)$)
  outpaces everything below. Total: $\Theta(f(n))$.

> :nerdygoose: The regularity condition in Case 3 prevents
> pathological $f$ where the work doesn't shrink fast enough as
> we recurse. For polynomial $f$, regularity is automatic.

### Worked examples

**Merge sort:** $T(n) = 2 T(n/2) + n$, $a = 2$, $b = 2$, so $E = 1$.
$f(n) = n = \Theta(n^1)$. Case 2 with $k = 0$. Total:
$\Theta(n \log n)$. ✓

**Binary search:** $T(n) = T(n/2) + 1$, $a = 1$, $b = 2$, $E = 0$.
$f(n) = 1 = \Theta(n^0)$. Case 2 with $k = 0$. Total:
$\Theta(\log n)$. ✓

**Strassen's matrix multiplication:** $T(n) = 7 T(n/2) + n^2$,
$a = 7$, $b = 2$, $E = \log_2 7 \approx 2.807$. $f(n) = n^2 \in
O(n^{E - 0.8})$. Case 1. Total: $\Theta(n^{\log_2 7})$. (Famously,
the constant in Strassen is bad enough that naive $\Theta(n^3)$
multiplication is faster for small matrices.)

**Counterexample (regularity fails):** $T(n) = T(n/2) + n / \log n$.
Here $a = 1$, $b = 2$, $E = 0$, $f(n) = n / \log n \in \Omega(n^\epsilon)$
for any $\epsilon < 1$. Looks like Case 3, but regularity fails:
$f(n/2) = (n/2)/\log(n/2)$, and $f(n/2) / f(n) \to 1/2$ as
$n \to \infty$ — fine — but the polylog factor breaks the polynomial
gap. The master theorem doesn't apply. (Akra–Bazzi handles it; see
below.)

## 4. Akra–Bazzi — when the master theorem can't help

The master theorem assumes a clean $T(n/b)$ split with constant $b$.
Real recurrences sometimes have weird splits:

$$T(n) = T(n/3) + T(2n/3) + n$$

Two recursive calls of *different* sizes. The master theorem stares
at this and shrugs.

**Akra–Bazzi** generalizes. Given:

$$T(n) = \sum_{i=1}^{k} a_i T(b_i n + h_i(n)) + g(n)$$

(with technical conditions on $g$ and $h_i$), find the unique $p$
satisfying:

$$\sum_{i=1}^{k} a_i b_i^p = 1$$

Then:

$$T(n) \in \Theta\left( n^p \left( 1 + \int_1^n \frac{g(u)}{u^{p+1}}\,du \right) \right)$$

Looks scary. In practice, the integral is usually easy.

### Worked example

$T(n) = T(n/3) + T(2n/3) + n$.

Set up: $a_1 = a_2 = 1$, $b_1 = 1/3$, $b_2 = 2/3$, $g(n) = n$.

Find $p$: solve $(1/3)^p + (2/3)^p = 1$. By inspection, $p = 1$
works: $1/3 + 2/3 = 1$. ✓

Compute: $\int_1^n u/u^2\,du = \int_1^n 1/u\,du = \ln n$.

So $T(n) \in \Theta(n \cdot (1 + \ln n)) = \Theta(n \log n)$.

> :surprisedgoose: An *uneven* split that recurses with the same
> $g(n) = n$ as merge sort gives the *same* $\Theta(n \log n)$
> bound. Quicksort with bad pivots doesn't pay extra in big-O —
> only in constants.

> :nerdygoose: For polynomial $g(n) = n^q$, Akra–Bazzi simplifies:
> if $q < p$, total is $\Theta(n^p)$; if $q = p$, $\Theta(n^p \log n)$;
> if $q > p$, $\Theta(n^q)$. Same trichotomy as the master theorem.

## 5. Recurrences neither tool handles

Some recurrences need ad-hoc reasoning.

### Substitution trick: $T(n) = 2T(\sqrt{n}) + \log n$

Let $m = \log n$, so $\sqrt{n}$ becomes $\log \sqrt{n} = m/2$. The
recurrence transforms to $S(m) = 2 S(m/2) + m$ where $S(m) = T(2^m)$.

Now apply master theorem: $a = 2$, $b = 2$, $E = 1$, $f(m) = m$.
Case 2. $S(m) \in \Theta(m \log m)$.

Substituting back: $T(n) = S(\log n) \in \Theta(\log n \cdot \log \log n)$.

> :mathgoose: When the recurrence has $\sqrt{n}$ or $\log n$ in
> the recursive argument, take logs and look for a familiar shape
> in the new variable.

### Linear recurrences: $T(n) = T(n - 1) + n$

Just unroll:

$$T(n) = T(n-1) + n = T(n-2) + (n-1) + n = \cdots = T(0) + \sum_{k=1}^n k = \Theta(n^2)$$

This shape (insertion sort, naive bubble sort) is the canonical
"linear recurrence with linear non-homogeneous term."

### $T(n) = T(n/2) + T(n/3) + T(n/6) + n$

Akra–Bazzi: $(1/2)^p + (1/3)^p + (1/6)^p = 1$, solved by $p = 1$.
Total: $\Theta(n \log n)$.

## 6. Lower bounds — when "fast enough" hits a wall

So far we've upper-bounded algorithms. Sometimes you want to prove
that no algorithm can do better than $\Omega(\text{something})$.

### Comparison sorting needs $\Omega(n \log n)$ comparisons

The argument is information-theoretic.

**Setup:** any comparison-based sorting algorithm, given $n$
distinct elements, must distinguish among $n!$ possible
permutations. Each comparison yields one bit of information (less
than vs. greater). To distinguish among $n!$ outcomes, you need at
least $\log_2(n!)$ bits.

By Stirling: $\log_2(n!) = \Theta(n \log n)$.

Therefore: any comparison-based sorting algorithm requires
$\Omega(n \log n)$ comparisons in the worst case. Merge sort,
heapsort, and quicksort (in expectation) are **asymptotically
optimal** for comparison sorting.

### When you can break the bound

The $\Omega(n \log n)$ floor is for **comparison-based** sorting.
If you exploit structure — keys are bounded integers (counting
sort), keys fit in $w$ bits (radix sort) — you can do
$\Theta(n + k)$ or $\Theta(nw)$ and beat the comparison floor.

> :surprisedgoose: Radix sort is "asymptotically faster than
> mergesort" in the sense that $\Theta(nw)$ can be smaller than
> $\Theta(n \log n)$ when $w \ll \log n$. In practice, the
> constants and cache behavior make `qsort` win for general data.
> Lower bounds tell you what's *possible*, not what's *fast on a
> CPU*.

## 7. Common pitfalls (annotated)

A grab bag of mistakes that will cost you on a whiteboard.

### "$O$ versus $o$"

$$O(n) \supsetneq o(n)$$

Anything that's $o(n)$ is also $O(n)$, but the reverse is false.
$n \in O(n)$, but $n \notin o(n)$.

> :sharpgoose: If an interviewer says "this had better be little-$o$
> of linear," they want **strictly sublinear**. $O(n)$ doesn't
> satisfy that. $O(n / \log n)$ does.

### "$O(\log_2 n)$ vs $O(\log_{10} n)$"

There's no difference. Change of base: $\log_2 n = \log_{10} n /
\log_{10} 2$, and the constant $1/\log_{10} 2$ vanishes inside
big-O. Just write $O(\log n)$.

### "$O(n \log n) = O(n \cdot \log n^2)$"

Yes, because $\log n^2 = 2 \log n$, constant absorbed. But
$O(n \log^2 n) \ne O(n \log n)$ — that's $\log$ squared.
**Spelling matters.** $\log n^2$ is not $\log^2 n$.

### "Loops nested $k$ deep"

$k$ nested loops, each $n$, gives $O(n^k)$ only when **each loop
runs $\Theta(n)$ times independently of the outer indices**.
Triangle loops:

```c
for (int i = 0; i < n; i++)
    for (int j = i; j < n; j++)
        ...
```

run $\Theta(n^2)$ total iterations because $\sum_{i=0}^{n-1}(n - i) = n(n+1)/2 = \Theta(n^2)$.
Same big-O as a square loop, but **half the iterations** —
sometimes that constant matters.

### "Recursive vs. iterative analysis"

```c
int sum(int *a, int n) { return n == 0 ? 0 : a[n-1] + sum(a, n-1); }
```

Recursive but linear: each call does $O(1)$ work, and there are
$n$ calls. $T(n) = T(n-1) + O(1) = \Theta(n)$.

```c
int sum_iter(int *a, int n) { int s = 0; for (int i = 0; i < n; i++) s += a[i]; return s; }
```

Same big-O, almost certainly faster constant due to no call
overhead.

> :sharpgoose: "Recursion is slow" is a constant-factor claim, not
> a complexity claim. The two implementations above are both
> $\Theta(n)$. Don't confuse asymptotic equivalence with practical
> equivalence.

## Practice

### Try it

**3.5.1** Prove that $n^2 + 100n \in \Theta(n^2)$ directly from the
formal definition. (Find $c_1, c_2, n_0$.)

**3.5.2** Apply the master theorem:
- $T(n) = 16 T(n/4) + n^2$
- $T(n) = T(n/2) + n^2$
- $T(n) = 3 T(n/4) + n \log n$ (the boundary case — be careful)

**3.5.3** Show that $\log_3 n \in \Theta(\log_2 n)$. Use the
change-of-base identity.

### Stretch

**3.5.4** Solve $T(n) = T(n/2) + T(n/4) + n$ using Akra–Bazzi.

**3.5.5** Solve $T(n) = 2T(\sqrt{n}) + 1$ using the substitution
trick. (Hint: $\sqrt{n}$ → take logs.)

**3.5.6** Find a recurrence whose Akra–Bazzi solution is
$\Theta(n^{\log_2 3})$.

### Deep dive (optional)

**3.5.7** Read the original Akra–Bazzi paper:
[Akra & Bazzi, 1998](https://link.springer.com/article/10.1023/A:1018983732047).
Reproduce the proof sketch in your own words. (Approximation by
integration.)

**3.5.8** Prove the comparison-sort lower bound formally. State
the *decision-tree model*, derive $\log_2(n!)$, then apply
Stirling.

**3.5.9** Find an algorithm for the **selection problem** (find
the $k$-th smallest element) that runs in **worst-case linear
time**. (Hint: median of medians, Blum et al. 1973.) Why does the
master theorem give a $\Theta(n)$ bound for this even though it
recurses?

## Closing

If you got this far, you can:

- State all five asymptotic notations precisely.
- Apply the master theorem in any of its three cases.
- Recognize when Akra–Bazzi is the right tool.
- Reduce non-standard recurrences via substitution.
- Argue lower bounds via the decision-tree model.

That's the depth most senior interviewers probe. Nothing in the
rest of the book requires more.

> :weightliftinggoose: From here, every chapter cites these tools
> by name. We won't re-derive — we'll just say "by the master
> theorem case 2" or "by Akra–Bazzi with $p = 1$" and move on. If
> you're shaky on any of it, the practice problems above are the
> calibration.

---

## What's next

[Chapter 4](/c-book/part-1-foundations/ch04-loop-invariants) covers
loop invariants — the everyday correctness tool. After that, Ch 5
formalizes the amortized analysis we already used informally in
Ch 7's dynamic-array proof.
