---
sidebar_position: 1
sidebar_label: "Limits"
title: "Limits"
---

# Limits

The limit is the central idea of calculus. Everything — continuity, derivatives, integrals, series — is defined in terms of limits.

## The Informal Idea

$\lim_{x \to a} f(x) = L$ means: as $x$ gets close to $a$ (but $x \neq a$), $f(x)$ gets close to $L$.

"Close to" is made precise with the $\varepsilon$-$\delta$ definition.

## The Formal Definition

**Definition**: $\lim_{x \to a} f(x) = L$ means:

> For every $\varepsilon > 0$, there exists $\delta > 0$ such that if $0 < |x - a| < \delta$, then $|f(x) - L| < \varepsilon$.

In symbols:

```math
\forall\,\varepsilon > 0,\;\exists\,\delta > 0 \text{ such that } 0 < |x - a| < \delta \Rightarrow |f(x) - L| < \varepsilon
```

> :mathgoose: Read it as a game. Your opponent picks $\varepsilon$ (how close to $L$ they demand). You respond with $\delta$ (how close to $a$ you need $x$ to be). If you can always win — for any $\varepsilon$, no matter how small — the limit exists and equals $L$.
>
> :angrygoose: Notice: $0 < |x - a|$ means $x \neq a$. The value of $f(a)$ is *irrelevant* to the limit. The function doesn't even need to be defined at $a$. This is the whole point — limits describe behavior *near* a point, not *at* it.

## How to Prove a Limit with $\varepsilon$-$\delta$

**Strategy**: Given $\varepsilon > 0$, work backwards from $|f(x) - L| < \varepsilon$ to find what $\delta$ should be.

### Example: $\lim_{x \to 3} (2x + 1) = 7$

Need: $|f(x) - L| = |(2x+1) - 7| = |2x - 6| = 2|x - 3| < \varepsilon$.

So $|x - 3| < \varepsilon/2$. Choose $\delta = \varepsilon/2$.

**Proof**: Let $\varepsilon > 0$. Set $\delta = \varepsilon/2$. If $0 < |x - 3| < \delta$, then:

```math
|(2x+1) - 7| = 2|x - 3| < 2\delta = 2 \cdot \frac{\varepsilon}{2} = \varepsilon \quad\square
```

### Example: $\lim_{x \to 2} x^2 = 4$

Need: $|x^2 - 4| = |x-2||x+2| < \varepsilon$.

The trick: bound $|x+2|$ by restricting $\delta$. If $|x - 2| < 1$, then $1 < x < 3$, so $|x + 2| < 5$.

Choose $\delta = \min(1, \varepsilon/5)$. Then:

```math
|x^2 - 4| = |x-2||x+2| < \frac{\varepsilon}{5} \cdot 5 = \varepsilon \quad\square
```

<DesmosGraph
  title="Epsilon-delta for x²"
  expressions={[
    "f(x) = x^2",
    "a = 2",
    "L = a^2",
    "\\varepsilon = 0.5",
    "\\delta = \\min(1, \\frac{\\varepsilon}{5})",
    {latex: "y = L + \\varepsilon", color: "#c74440", lineStyle: "DASHED"},
    {latex: "y = L - \\varepsilon", color: "#c74440", lineStyle: "DASHED"},
    {latex: "x = a - \\delta", color: "#388c46", lineStyle: "DASHED"},
    {latex: "x = a + \\delta", color: "#388c46", lineStyle: "DASHED"},
    "(a, L)",
  ]}
  xMin={0} xMax={4} yMin={0} yMax={8}
/>

> :nerdygoose: The $\min(1, \varepsilon/5)$ pattern is the standard trick for quadratic limits. You need to bound a factor that depends on $x$, so you first restrict $\delta \leq 1$ to get a bound, then choose $\delta$ small enough to make the product less than $\varepsilon$. This pattern repeats in every nonlinear $\varepsilon$-$\delta$ proof.

## Limit Laws

If $\lim_{x \to a} f(x) = L$ and $\lim_{x \to a} g(x) = M$, then:

```math
\lim_{x \to a} [f(x) + g(x)] = L + M
```

```math
\lim_{x \to a} [f(x) \cdot g(x)] = L \cdot M
```

```math
\lim_{x \to a} \frac{f(x)}{g(x)} = \frac{L}{M} \quad (M \neq 0)
```

```math
\lim_{x \to a} [cf(x)] = cL
```

These are all provable from the $\varepsilon$-$\delta$ definition using the triangle inequality.

<DesmosGraph
  title="Squeeze theorem: x·sin(1/x)"
  expressions={[
    "y = x \\cdot \\sin(\\frac{1}{x})",
    {latex: "y = |x|", color: "#c74440", lineStyle: "DASHED"},
    {latex: "y = -|x|", color: "#c74440", lineStyle: "DASHED"},
  ]}
  xMin={-1} xMax={1} yMin={-1} yMax={1}
/>

## The Squeeze Theorem

If $g(x) \leq f(x) \leq h(x)$ near $a$, and $\lim_{x\to a} g(x) = \lim_{x\to a} h(x) = L$, then $\lim_{x\to a} f(x) = L$.

### Classic Application

```math
\lim_{x \to 0} x\sin\frac{1}{x} = 0
```

Since $-|x| \leq x\sin(1/x) \leq |x|$ and $\lim_{x\to 0} |x| = 0$, the squeeze theorem gives the result.

> :happygoose: The squeeze theorem is your escape hatch. When you can't compute a limit directly, trap the function between two simpler functions that have the same limit. The classic $\sin x / x$ limit is proven this way — squeeze between $\cos x$ and $1$.

## One-Sided Limits

```math
\lim_{x \to a^+} f(x) = L \quad\text{(right-hand limit: } x \to a \text{ from above)}
```

```math
\lim_{x \to a^-} f(x) = L \quad\text{(left-hand limit: } x \to a \text{ from below)}
```

**Key fact**: $\lim_{x\to a} f(x) = L$ if and only if both one-sided limits exist and equal $L$.

## Limits at Infinity

```math
\lim_{x \to \infty} f(x) = L
```

means: for every $\varepsilon > 0$, there exists $N$ such that $x > N \Rightarrow |f(x) - L| < \varepsilon$.

### Standard Results

```math
\lim_{x \to \infty} \frac{1}{x^p} = 0 \quad (p > 0)
```

```math
\lim_{x \to \infty} \frac{P(x)}{Q(x)} = \frac{\text{leading coefficient of } P}{\text{leading coefficient of } Q} \quad (\deg P = \deg Q)
```

For rational functions, divide numerator and denominator by the highest power of $x$.

## Infinite Limits

```math
\lim_{x \to a} f(x) = \infty
```

means: for every $M > 0$, there exists $\delta > 0$ such that $0 < |x - a| < \delta \Rightarrow f(x) > M$.

This is *not* saying "the limit exists" — it's a precise way of saying the function grows without bound.

> :sarcasticgoose: "$\infty$ is not a number." You've heard this. What it means precisely: $\lim_{x\to 0} 1/x^2 = \infty$ is not an equation with $\infty$ on the right side — it's shorthand for the $M$-$\delta$ statement above. The limit doesn't exist in $\mathbb{R}$; we're describing *how* it fails to exist.

## When Limits Don't Exist

A limit $\lim_{x \to a} f(x)$ fails to exist when:
- **One-sided limits differ**: e.g., $\lim_{x\to 0} \text{sgn}(x)$ has left limit $-1$ and right limit $+1$
- **Oscillation**: e.g., $\lim_{x\to 0} \sin(1/x)$ oscillates between $-1$ and $1$
- **Unbounded behavior**: $\lim_{x\to 0} 1/x$ (goes to $+\infty$ from the right, $-\infty$ from the left)

## Algorithmic Touchpoints

- **Convergence of iterative algorithms** (Newton's method, gradient descent) is a limit statement: the sequence of iterates approaches a fixed point.
- **Big-O notation** is a limit concept: $f(n) = O(g(n))$ means $|f(n)/g(n)|$ is eventually bounded.
- **Numerical stability** asks whether $\lim_{h\to 0} \frac{f(x+h) - f(x)}{h}$ can be computed without catastrophic cancellation.
- **Floating-point epsilon** is the practical $\delta$ — how close you can get before rounding errors dominate.

## Quick Sanity Checks

- If your $\delta$ depends on $x$, something is wrong — $\delta$ can only depend on $\varepsilon$ (and $a$).
- Check: does your $\delta$ shrink as $\varepsilon$ shrinks? It should.
- Plug in easy values. If $\lim_{x\to 2} f(x) = 7$, then $f(1.99)$ and $f(2.01)$ should be near 7.
- For limits at infinity, test with large numbers to build intuition before proving.
