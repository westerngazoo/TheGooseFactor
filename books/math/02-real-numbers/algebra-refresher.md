---
sidebar_position: 2
sidebar_label: "Algebra Refresher"
title: "Algebra Refresher"
---

# Algebra Refresher

This covers the algebraic manipulation skills Apostol assumes you have. If you can do everything here fluently, the computational parts of calculus won't slow you down.

## Inequalities

### Rules for Manipulating Inequalities

Given $a < b$:

- **Add anything**: $a + c < b + c$ (always valid)
- **Multiply by positive**: $c > 0 \Rightarrow ac < bc$
- **Multiply by negative**: $c < 0 \Rightarrow ac > bc$ (flips!)
- **Reciprocal**: if $0 < a < b$, then $1/b < 1/a$ (flips!)

> :angrygoose: Two operations flip inequalities: multiplying by a negative and taking reciprocals of positives. Every inequality mistake in Apostol traces back to forgetting one of these. When in doubt, don't multiply — subtract and analyze the sign instead.

### The AM-GM Inequality

For $a, b \geq 0$:

```math
\frac{a + b}{2} \geq \sqrt{ab}
```

with equality iff $a = b$.

*Proof*: Start from the fact that squares are nonneg (proved in the real number section):

```math
(\sqrt{a} - \sqrt{b})^2 \geq 0
```

Expand the square:

```math
(\sqrt{a})^2 - 2\sqrt{a}\sqrt{b} + (\sqrt{b})^2 \geq 0
```

```math
a - 2\sqrt{ab} + b \geq 0
```

Add $2\sqrt{ab}$ to both sides:

```math
a + b \geq 2\sqrt{ab}
```

Divide both sides by 2 (positive, so inequality preserved):

```math
\frac{a + b}{2} \geq \sqrt{ab}
```

Equality holds iff $(\sqrt{a} - \sqrt{b})^2 = 0$, i.e., $\sqrt{a} = \sqrt{b}$, i.e., $a = b$. $\square$

**General form** for $n$ terms:

```math
\frac{a_1 + a_2 + \cdots + a_n}{n} \geq \sqrt[n]{a_1 a_2 \cdots a_n}
```

> :mathgoose: AM-GM is one of the most powerful inequalities in mathematics. It's the tool behind optimization problems like "minimize $x + 1/x$ for $x > 0$" — apply AM-GM to get $x + 1/x \geq 2\sqrt{x \cdot 1/x} = 2$, with equality at $x = 1$. Apostol uses it repeatedly.

### The Cauchy-Schwarz Inequality

For real numbers $a_1, \dots, a_n$ and $b_1, \dots, b_n$:

```math
\left(\sum_{i=1}^n a_i b_i\right)^2 \leq \left(\sum_{i=1}^n a_i^2\right)\left(\sum_{i=1}^n b_i^2\right)
```

with equality iff $a_i = \lambda b_i$ for some constant $\lambda$ (vectors are parallel).

*Proof*: For any real $t$, consider the sum (which is nonnegative since it's a sum of squares):

```math
\sum_{i=1}^n (a_i - t b_i)^2 \geq 0
```

Expand each term:

```math
\sum_{i=1}^n (a_i^2 - 2t\,a_i b_i + t^2 b_i^2) \geq 0
```

Separate the sums (let $A = \sum a_i^2$, $B = \sum b_i^2$, $C = \sum a_i b_i$):

```math
A - 2tC + t^2 B \geq 0
```

This is a quadratic in $t$ that is always $\geq 0$. A quadratic $Bt^2 - 2Ct + A \geq 0$ for all $t$ iff its discriminant is $\leq 0$:

```math
(2C)^2 - 4BA \leq 0
```

```math
4C^2 \leq 4AB
```

```math
C^2 \leq AB
```

Substituting back: $\left(\sum a_i b_i\right)^2 \leq \left(\sum a_i^2\right)\left(\sum b_i^2\right)$. $\square$

> :nerdygoose: Cauchy-Schwarz is the dot product inequality $|\mathbf{a} \cdot \mathbf{b}| \leq \|\mathbf{a}\| \|\mathbf{b}\|$ in coordinates. It's the reason cosine similarity is bounded by $[-1, 1]$. In competitive programming, it shows up when bounding sums of products.

## Polynomials

### Factoring Essentials

Difference of squares:

```math
a^2 - b^2 = (a - b)(a + b)
```

Sum/difference of cubes:

```math
a^3 - b^3 = (a - b)(a^2 + ab + b^2)
```

```math
a^3 + b^3 = (a + b)(a^2 - ab + b^2)
```

Geometric sum (critical for series):

```math
a^n - b^n = (a - b)(a^{n-1} + a^{n-2}b + \cdots + ab^{n-2} + b^{n-1})
```

*Derivation of the geometric sum formula*: Let $S = 1 + r + r^2 + \cdots + r^{n-1}$. Multiply both sides by $r$:

```math
rS = r + r^2 + r^3 + \cdots + r^n
```

Subtract the second equation from the first:

```math
S - rS = (1 + r + r^2 + \cdots + r^{n-1}) - (r + r^2 + \cdots + r^n)
```

Nearly all terms cancel (this is a telescoping subtraction):

```math
S(1 - r) = 1 - r^n
```

Divide both sides by $(1 - r)$ (valid since $r \neq 1$):

```math
S = \sum_{k=0}^{n-1} r^k = \frac{1 - r^n}{1 - r} \quad (r \neq 1)
```

> :happygoose: The geometric sum formula is everywhere. It's the closed form of the geometric series. It's how you sum powers in number theory, analyze amortized costs, compute compound interest, and evaluate generating functions. Memorize it, and also memorize what happens as $n \to \infty$ when $|r| < 1$: the sum converges to $1/(1-r)$.

### The Binomial Theorem

```math
(a + b)^n = \sum_{k=0}^n \binom{n}{k} a^{n-k} b^k
```

where $\binom{n}{k} = \frac{n!}{k!(n-k)!}$.

Key special cases:

```math
(1 + x)^n = 1 + nx + \binom{n}{2}x^2 + \cdots + x^n
```

For small $x$ and large $n$, the first few terms often suffice (binomial approximation).

### Completing the Square

Start with $ax^2 + bx + c$ where $a \neq 0$. Factor out $a$ from the first two terms:

```math
ax^2 + bx + c = a\left(x^2 + \frac{b}{a}x\right) + c
```

Inside the parentheses, we want a perfect square. A perfect square looks like $(x + d)^2 = x^2 + 2dx + d^2$. Matching $2d = b/a$, we get $d = b/(2a)$.

Add and subtract $d^2 = b^2/(4a^2)$ inside the parentheses:

```math
= a\left(x^2 + \frac{b}{a}x + \frac{b^2}{4a^2} - \frac{b^2}{4a^2}\right) + c
```

The first three terms form a perfect square:

```math
= a\left(\left(x + \frac{b}{2a}\right)^2 - \frac{b^2}{4a^2}\right) + c
```

Distribute $a$:

```math
= a\left(x + \frac{b}{2a}\right)^2 - \frac{b^2}{4a} + c
```

**Deriving the quadratic formula** from this: set $ax^2 + bx + c = 0$ and use the completed form:

```math
a\left(x + \frac{b}{2a}\right)^2 - \frac{b^2}{4a} + c = 0
```

Move the constants to the right:

```math
a\left(x + \frac{b}{2a}\right)^2 = \frac{b^2}{4a} - c = \frac{b^2 - 4ac}{4a}
```

Divide both sides by $a$:

```math
\left(x + \frac{b}{2a}\right)^2 = \frac{b^2 - 4ac}{4a^2}
```

Take square roots of both sides (introducing $\pm$):

```math
x + \frac{b}{2a} = \pm\frac{\sqrt{b^2 - 4ac}}{2a}
```

Subtract $b/(2a)$:

```math
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
```

> :sarcasticgoose: "Just use the quadratic formula." Sure, but completing the square is the *technique* — the formula is the *result*. In Apostol you'll complete the square inside integrals, inside $\varepsilon$-$\delta$ arguments, inside optimization problems. The formula solves $ax^2 + bx + c = 0$; the technique transforms any quadratic expression into a useful form.

## Exponents and Logarithms

### Exponent Laws

For $a > 0$:

```math
a^m \cdot a^n = a^{m+n}, \qquad \frac{a^m}{a^n} = a^{m-n}, \qquad (a^m)^n = a^{mn}
```

```math
a^0 = 1, \qquad a^{-n} = \frac{1}{a^n}, \qquad a^{1/n} = \sqrt[n]{a}
```

### Logarithm Laws

For $a > 0, a \neq 1$:

```math
\log_a(xy) = \log_a x + \log_a y
```

```math
\log_a(x/y) = \log_a x - \log_a y
```

```math
\log_a(x^r) = r \log_a x
```

**Change of base:**

```math
\log_a x = \frac{\ln x}{\ln a}
```

The natural logarithm $\ln x = \log_e x$ is the one that matters in calculus (its derivative is $1/x$).

> :nerdygoose: In algorithm analysis, $\log$ without a base usually means $\log_2$ (because binary). In calculus and pure math, $\log$ usually means $\ln$. In engineering, it might mean $\log_{10}$. Always check context. The change of base formula means they differ only by a constant factor, which is why big-O doesn't care about the base.

## Intervals and Notation

| Notation | Meaning |
|---|---|
| $(a, b)$ | Open: $a < x < b$ |
| $[a, b]$ | Closed: $a \leq x \leq b$ |
| $[a, b)$ | Half-open: $a \leq x < b$ |
| $(a, \infty)$ | All $x > a$ |
| $(-\infty, b]$ | All $x \leq b$ |
| $(-\infty, \infty)$ | All of $\mathbb{R}$ |

**Neighborhood**: An open interval $(a - \delta, a + \delta)$ centered at $a$ with radius $\delta > 0$. Written $B_\delta(a)$ or $N(a, \delta)$. This is the language of limits.

## Useful Inequalities for Calculus

**Bernoulli's inequality**: For $x \geq -1$ and $n \in \mathbb{N}$:

```math
(1 + x)^n \geq 1 + nx
```

**Triangle inequality (rewritten for differences)**:

```math
|a - b| \leq |a - c| + |c - b|
```

This is how you chain estimates: to show $a$ is close to $b$, find an intermediate $c$ close to both.

**Squeeze principle (informal)**: If $a_n \leq b_n \leq c_n$ and both $a_n, c_n \to L$, then $b_n \to L$. This is the computational workhorse for evaluating limits of complicated expressions.

## Algorithmic Touchpoints

- **Geometric series** gives the closed form for costs like $1 + 2 + 4 + \cdots + 2^k = 2^{k+1} - 1$.
- **Completing the square** is used in quadratic probing, optimization, and Gaussian distributions.
- **Bernoulli's inequality** bounds compound growth: $(1 + r)^n \geq 1 + rn$.
- **AM-GM** gives tight bounds for optimization without calculus.

## Quick Sanity Checks

- When you flip an inequality, write down *why* (negative multiplier or reciprocal).
- After factoring, multiply back out to verify.
- For the binomial theorem, check $a = b = 1$: both sides should give $2^n$.
- $\log$ of a product is a sum; $\log$ of a power brings the exponent down. Never write $\log(a + b) = \log a + \log b$ — that's wrong.
