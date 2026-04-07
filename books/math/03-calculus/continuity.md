---
sidebar_position: 2
sidebar_label: "Continuity"
title: "Continuity"
---

# Continuity

A function is continuous if limits behave as expected — the limit equals the function value. Discontinuities are where interesting things happen: phase transitions, jump conditions, numerical instabilities.

## Definition

**Definition**: $f$ is **continuous at $a$** if:

```math
\lim_{x \to a} f(x) = f(a)
```

This packs three requirements into one:
1. $f(a)$ is defined
2. $\lim_{x \to a} f(x)$ exists
3. They're equal

$f$ is **continuous on an interval** $[a,b]$ if it's continuous at every point in $(a,b)$, right-continuous at $a$, and left-continuous at $b$.

> :mathgoose: Continuity is the limit plus a value check. A function can have a limit at $a$ without being continuous there — just define $f(a)$ to be something different from the limit. That's a removable discontinuity. Continuity says the function has no surprises: what you expect from nearby values is what you get.

## Types of Discontinuity

**Removable**: $\lim_{x \to a} f(x) = L$ exists, but $f(a) \neq L$ (or $f(a)$ undefined). Fixable by redefining $f(a) = L$.

**Jump**: Both one-sided limits exist but differ: $\lim_{x\to a^-} f(x) \neq \lim_{x\to a^+} f(x)$.

**Essential (infinite/oscillatory)**: The limit doesn't exist at all.

> :nerdygoose: In code, a removable discontinuity is a bug you can fix with a special case. A jump discontinuity is a feature (like a step function or threshold). An essential discontinuity is chaos you need to handle with error checking.

## Properties of Continuous Functions

If $f$ and $g$ are continuous at $a$, then so are:
- $f + g$, $f - g$, $fg$, $f/g$ (when $g(a) \neq 0$)
- $|f|$
- $g \circ f$ (composition), provided domains match

**Polynomials** are continuous everywhere. **Rational functions** are continuous wherever the denominator is nonzero. $\sin$, $\cos$, $e^x$, $\ln x$ are continuous on their domains.

## The Big Theorems

### Intermediate Value Theorem (IVT)

If $f$ is continuous on $[a,b]$ and $f(a) < c < f(b)$ (or $f(a) > c > f(b)$), then there exists $x_0 \in (a,b)$ with $f(x_0) = c$.

*Informally*: a continuous function that starts below $c$ and ends above $c$ must cross $c$ somewhere.

> :surprisedgoose: IVT is the reason binary search works on continuous functions. If $f(a) < 0$ and $f(b) > 0$, there's a root in $(a,b)$. Split the interval, check the sign at the midpoint, recurse. Each step halves the interval. IVT guarantees you converge to a root — it's the existence theorem behind the algorithm.

### Extreme Value Theorem (EVT)

If $f$ is continuous on a **closed bounded** interval $[a,b]$, then $f$ attains a maximum and a minimum on $[a,b]$.

Both "closed" and "bounded" are essential:
- $f(x) = 1/x$ on $(0,1]$ — no maximum (unbounded near 0)
- $f(x) = x$ on $[0, \infty)$ — no maximum (unbounded interval)

> :angrygoose: Closed and bounded. Both. Not one without the other. Every counterexample to EVT fails one of these conditions. If you're optimizing a continuous function on a closed bounded set, a maximum and minimum are *guaranteed* to exist. On open sets or unbounded domains, you need to verify separately.

### Bolzano's Theorem

Special case of IVT: if $f$ is continuous on $[a,b]$ with $f(a)$ and $f(b)$ of opposite sign, then $f$ has a zero in $(a,b)$.

## Uniform Continuity

**Definition**: $f$ is **uniformly continuous** on $S$ if:

```math
\forall\,\varepsilon > 0,\;\exists\,\delta > 0 \text{ such that } |x - y| < \delta \Rightarrow |f(x) - f(y)| < \varepsilon \quad (\text{for all } x, y \in S)
```

The key difference from ordinary continuity: $\delta$ works for *all* points simultaneously, not just near a specific $a$.

**Theorem**: If $f$ is continuous on a closed bounded interval $[a,b]$, then $f$ is uniformly continuous on $[a,b]$.

> :mathgoose: Ordinary continuity: "at each point, you can find a $\delta$." Uniform continuity: "one $\delta$ works everywhere." The distinction matters for sequences of functions, integration theory, and numerical approximation. $f(x) = 1/x$ is continuous on $(0,1)$ but not uniformly continuous — as $x \to 0$, you need $\delta$ to shrink to zero, so no single $\delta$ works.

## The $\varepsilon$-$\delta$ Form of Continuity

$f$ is continuous at $a$ iff:

```math
\forall\,\varepsilon > 0,\;\exists\,\delta > 0 \text{ such that } |x - a| < \delta \Rightarrow |f(x) - f(a)| < \varepsilon
```

Note: unlike the limit definition, we don't need $x \neq a$ (since $|f(a) - f(a)| = 0 < \varepsilon$ is automatic).

## Algorithmic Touchpoints

- **Binary search for roots** (bisection method) uses IVT: sign change implies a root.
- **Optimization on closed intervals** uses EVT: the maximum exists, so gradient methods will find it.
- **Uniform continuity** guarantees that numerical integration (Riemann sums) converges: the error is uniformly bounded.
- **Interpolation** assumes continuity — a continuous function through sample points can be approximated between them.

## Quick Sanity Checks

- To show discontinuity at $a$: find a sequence $x_n \to a$ where $f(x_n)$ doesn't converge to $f(a)$.
- IVT requires continuity on a *closed* interval. If $f$ is only defined on $(a,b)$, check the boundary behavior.
- EVT requires *closed* and *bounded*. If either fails, look for counterexamples.
- Composition of continuous functions is continuous — this is why most "natural" functions are continuous.
