---
sidebar_position: 4
sidebar_label: "Integration"
title: "Integration"
---

# Integration

Integration computes accumulated quantities — areas, volumes, totals. Apostol defines the integral axiomatically before introducing derivatives, emphasizing that integration is a concept in its own right, not just "reverse differentiation."

## The Idea: Area Under a Curve

For $f \geq 0$ on $[a,b]$, the integral $\int_a^b f(x)\,dx$ is the area of the region between the graph of $f$ and the $x$-axis.

For general $f$, it's the signed area: positive above the axis, negative below.

## Step Functions and the Integral

Apostol builds integration from step functions before Riemann sums.

A **step function** on $[a,b]$ is a function that is constant on each subinterval of some partition $P = \{a = x_0 < x_1 < \cdots < x_n = b\}$.

If $s(x) = c_k$ on $(x_{k-1}, x_k)$, then:

```math
\int_a^b s(x)\,dx = \sum_{k=1}^n c_k(x_k - x_{k-1})
```

> :mathgoose: Starting with step functions is Apostol's signature move. It avoids the machinery of Riemann sums and upper/lower sums, replacing them with a cleaner construction: approximate from below and above with step functions, and define the integral as the value where they agree. The idea is the same as Riemann, but the execution is more elegant.

## Definition of the Integral

For a bounded function $f$ on $[a,b]$, define:

```math
I(f) = \sup\left\{\int_a^b s\,dx : s \text{ is a step function with } s \leq f\right\}
```

```math
\overline{I}(f) = \inf\left\{\int_a^b t\,dx : t \text{ is a step function with } t \geq f\right\}
```

$f$ is **integrable** on $[a,b]$ if $I(f) = \overline{I}(f)$, and this common value is $\int_a^b f(x)\,dx$.

> :nerdygoose: This is exactly the squeeze strategy from numerical computing. Approximate from below (underestimate) and from above (overestimate). If they converge to the same number, that's the integral. It's also how interval arithmetic works — bound the answer from both sides until the bounds meet.

<DesmosGraph
  title="Area under a curve"
  expressions={[
    "f(x) = x^2",
    {latex: "0 \\le y \\le f(x) \\{0 \\le x \\le 2\\}", color: "#2d70b3"},
  ]}
  xMin={-0.5} xMax={3} yMin={-0.5} yMax={5}
/>

## Properties of the Integral

**Linearity:**

```math
\int_a^b [f(x) + g(x)]\,dx = \int_a^b f(x)\,dx + \int_a^b g(x)\,dx
```

```math
\int_a^b cf(x)\,dx = c\int_a^b f(x)\,dx
```

**Additivity over intervals:**

```math
\int_a^b f(x)\,dx + \int_b^c f(x)\,dx = \int_a^c f(x)\,dx
```

**Monotonicity:** If $f(x) \leq g(x)$ on $[a,b]$, then:

```math
\int_a^b f(x)\,dx \leq \int_a^b g(x)\,dx
```

**Triangle inequality for integrals:**

```math
\left|\int_a^b f(x)\,dx\right| \leq \int_a^b |f(x)|\,dx
```

## The Fundamental Theorem of Calculus

### First Form (Differentiation of Integrals)

If $f$ is continuous on $[a,b]$, define:

```math
F(x) = \int_a^x f(t)\,dt
```

Then $F$ is differentiable on $(a,b)$ and $F'(x) = f(x)$.

> :surprisedgoose: Differentiation and integration are inverse operations. This is not obvious — one is about slopes, the other about areas. The FTC says: if you accumulate area under $f$ as $x$ moves, the rate of accumulation at $x$ is exactly $f(x)$. The proof uses the mean value theorem for integrals and the continuity of $f$.

### Second Form (Evaluation of Integrals)

If $f$ is continuous on $[a,b]$ and $F$ is any antiderivative of $f$ (i.e., $F' = f$), then:

```math
\int_a^b f(x)\,dx = F(b) - F(a)
```

This is the computational powerhouse — it reduces integration to finding antiderivatives.

> :happygoose: The second form is what you use 95% of the time. Find an antiderivative $F$, evaluate at the endpoints, subtract. Example: $\int_0^1 x^2\,dx = [x^3/3]_0^1 = 1/3 - 0 = 1/3$. The hard part is finding $F$ — that's where integration techniques come in.

## Integration Techniques

### Substitution (Change of Variables)

If $u = g(x)$, then:

```math
\int f(g(x)) \cdot g'(x)\,dx = \int f(u)\,du
```

For definite integrals, change the limits too: $x = a \to u = g(a)$, $x = b \to u = g(b)$.

### Integration by Parts

```math
\int u\,dv = uv - \int v\,du
```

Choose $u$ and $dv$ using **LIATE** priority: Logarithmic, Inverse trig, Algebraic, Trig, Exponential — pick $u$ from the left, $dv$ from the right.

> :sarcasticgoose: "Integration is the art of finding antiderivatives." Unlike differentiation, which is mechanical (apply rules, done), integration requires recognizing patterns. There's no general algorithm — some functions have no elementary antiderivative at all ($e^{-x^2}$, for instance). Welcome to the hard direction.

### Partial Fractions

For rational functions $P(x)/Q(x)$ where $\deg P < \deg Q$, decompose into simpler fractions:

```math
\frac{2x + 1}{(x-1)(x+2)} = \frac{A}{x-1} + \frac{B}{x+2}
```

Solve for $A, B$ by clearing denominators, then integrate each term.

### Trigonometric Substitution

For integrands containing:
- $\sqrt{a^2 - x^2}$: substitute $x = a\sin\theta$
- $\sqrt{a^2 + x^2}$: substitute $x = a\tan\theta$
- $\sqrt{x^2 - a^2}$: substitute $x = a\sec\theta$

## Improper Integrals

When the interval is infinite or $f$ is unbounded:

```math
\int_1^{\infty} \frac{1}{x^p}\,dx = \begin{cases} \frac{1}{p-1} & \text{if } p > 1 \\ \text{diverges} & \text{if } p \leq 1 \end{cases}
```

This is the **$p$-test**. It's the integral analogue of the $p$-series.

> :mathgoose: The $p$-test is the first thing to check for improper integrals. $1/x$ diverges (harmonic), $1/x^2$ converges. The boundary is $p = 1$. For the comparison test, if your integrand is smaller than a convergent $p$-integral, it converges; if larger than a divergent one, it diverges.

## Applications

**Area between curves:** If $f(x) \geq g(x)$ on $[a,b]$:

```math
A = \int_a^b [f(x) - g(x)]\,dx
```

**Volume of revolution** (disk method):

```math
V = \frac{\tau}{2} \int_a^b [f(x)]^2\,dx
```

**Arc length:**

```math
L = \int_a^b \sqrt{1 + [f'(x)]^2}\,dx
```

## Algorithmic Touchpoints

- **Numerical integration** (trapezoidal rule, Simpson's rule, Gaussian quadrature) approximates integrals when antiderivatives don't exist.
- **Prefix sums** are the discrete analogue of $F(x) = \int_a^x f$: precompute cumulative sums for $O(1)$ range queries.
- **Probability**: $P(a \leq X \leq b) = \int_a^b f_X(x)\,dx$ where $f_X$ is the probability density function.
- **Signal processing**: convolution $\int f(t)g(x-t)\,dt$ is the continuous version of polynomial multiplication.

## Quick Sanity Checks

- $\int_a^a f(x)\,dx = 0$ always.
- $\int_a^b f(x)\,dx = -\int_b^a f(x)\,dx$.
- For positive $f$, the integral should be positive. If you get a negative number, check signs.
- After substitution, no variable $x$ should remain — everything converts to $u$.
- Dimensional analysis: if $f$ has units of meters/second and $x$ has units of seconds, the integral has units of meters.
