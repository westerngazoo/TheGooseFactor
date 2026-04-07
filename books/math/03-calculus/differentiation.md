---
sidebar_position: 3
sidebar_label: "Differentiation"
title: "Differentiation"
---

# Differentiation

The derivative measures instantaneous rate of change. It's the slope of the tangent line, the velocity from position, the sensitivity of output to input.

## Definition

The **derivative** of $f$ at $a$ is:

```math
f'(a) = \lim_{h \to 0} \frac{f(a+h) - f(a)}{h}
```

when this limit exists. Equivalently, with $x = a + h$:

```math
f'(a) = \lim_{x \to a} \frac{f(x) - f(a)}{x - a}
```

If the derivative exists at $a$, we say $f$ is **differentiable** at $a$.

<DesmosGraph
  title="Secant line approaching tangent"
  expressions={[
    "f(x) = x^2",
    "a = 1",
    "h = 0.5",
    "m = \\frac{f(a+h) - f(a)}{h}",
    "y - f(a) = m(x - a)",
    "(a, f(a))",
    "(a+h, f(a+h))",
    {latex: "y - f(a) = 2a(x - a)", color: "#388c46", lineStyle: "DASHED"},
  ]}
  xMin={-1} xMax={4} yMin={-1} yMax={8}
/>

> :mathgoose: The fraction $(f(a+h) - f(a))/h$ is the slope of the secant line through $(a, f(a))$ and $(a+h, f(a+h))$. The limit as $h \to 0$ gives the slope of the tangent line. This geometric picture is the entire intuition — everything else is computation.
>
> :angrygoose: Differentiable implies continuous, but continuous does NOT imply differentiable. The function $|x|$ is continuous everywhere but not differentiable at $x = 0$ (the left and right slopes disagree). Weierstrass constructed a function that's continuous everywhere but differentiable nowhere. Continuity is a weaker condition.

## Differentiation Rules

### Basic Rules

```math
\frac{d}{dx}[c] = 0, \qquad \frac{d}{dx}[x^n] = nx^{n-1}
```

```math
\frac{d}{dx}[cf(x)] = cf'(x), \qquad \frac{d}{dx}[f(x) + g(x)] = f'(x) + g'(x)
```

### Product Rule

```math
(fg)' = f'g + fg'
```

### Quotient Rule

```math
\left(\frac{f}{g}\right)' = \frac{f'g - fg'}{g^2}
```

### Chain Rule

```math
\frac{d}{dx}[f(g(x))] = f'(g(x)) \cdot g'(x)
```

> :happygoose: The chain rule is the most important differentiation rule. It's the reason backpropagation in neural networks works — computing gradients through layers of composed functions. Each layer contributes a local derivative, and they multiply together. That's the chain rule.

## Standard Derivatives

| $f(x)$ | $f'(x)$ |
|---|---|
| $x^n$ | $nx^{n-1}$ |
| $e^x$ | $e^x$ |
| $\ln x$ | $1/x$ |
| $\sin x$ | $\cos x$ |
| $\cos x$ | $-\sin x$ |
| $\tan x$ | $\sec^2 x$ |
| $\arcsin x$ | $1/\sqrt{1-x^2}$ |
| $\arctan x$ | $1/(1+x^2)$ |
| $a^x$ | $a^x \ln a$ |

> :nerdygoose: $e^x$ is its own derivative. That's not a coincidence — it's the *definition* of $e$. The number $e$ is chosen so that the exponential function with base $e$ has this property. This is why $e$ appears everywhere in differential equations: it's the eigenfunction of the derivative operator.

## The Mean Value Theorem

If $f$ is continuous on $[a,b]$ and differentiable on $(a,b)$, then there exists $c \in (a,b)$ with:

```math
f'(c) = \frac{f(b) - f(a)}{b - a}
```

*Interpretation*: somewhere between $a$ and $b$, the instantaneous rate of change equals the average rate of change.

### Consequences

- **If $f'(x) = 0$ everywhere on $(a,b)$**, then $f$ is constant on $[a,b]$.
- **If $f'(x) > 0$ everywhere on $(a,b)$**, then $f$ is strictly increasing.
- **If $f'(x) = g'(x)$ everywhere**, then $f(x) = g(x) + C$ for some constant.

> :mathgoose: The Mean Value Theorem is the bridge between local information (the derivative at a point) and global information (the function's behavior over an interval). Almost every major theorem in differential calculus uses MVT somewhere in its proof. It's the workhorse of analysis.

## Higher Derivatives and Taylor's Theorem

The $n$-th derivative $f^{(n)}(x)$ is the derivative applied $n$ times.

**Taylor's theorem with remainder**: If $f$ has $n+1$ continuous derivatives on $[a,x]$:

```math
f(x) = f(a) + f'(a)(x-a) + \frac{f''(a)}{2!}(x-a)^2 + \cdots + \frac{f^{(n)}(a)}{n!}(x-a)^n + R_n(x)
```

where the remainder satisfies:

```math
R_n(x) = \frac{f^{(n+1)}(c)}{(n+1)!}(x-a)^{n+1}
```

for some $c$ between $a$ and $x$ (Lagrange form).

> :surprisedgoose: Taylor's theorem says any smooth function is *locally* a polynomial plus a small error. The error term $R_n$ tells you exactly how small. This is why polynomial approximations work — and the remainder gives you the error bound. $\sin x \approx x - x^3/6$ is Taylor to third order around 0, with error at most $|x|^5/120$.

## L'Hopital's Rule

If $\lim_{x\to a} f(x) = \lim_{x\to a} g(x) = 0$ (or both $\to \pm\infty$), and $g'(x) \neq 0$ near $a$, then:

```math
\lim_{x \to a} \frac{f(x)}{g(x)} = \lim_{x \to a} \frac{f'(x)}{g'(x)}
```

provided the right-hand limit exists (or is $\pm\infty$).

> :sarcasticgoose: L'Hopital is powerful but overused. Before applying it, check if algebraic simplification (factoring, rationalizing, dividing) works. L'Hopital can make things worse: $\lim_{x\to\infty} x/e^x$ is easy with L'Hopital, but $\lim_{x\to 0} \sin x / x$ is circular if you haven't already proven $(\sin x)' = \cos x$ without using that limit.

## Optimization

**First derivative test**: If $f'$ changes from positive to negative at $c$, then $f$ has a local maximum at $c$. If negative to positive, local minimum.

**Second derivative test**: If $f'(c) = 0$ and $f''(c) > 0$, then $c$ is a local minimum. If $f''(c) < 0$, local maximum. If $f''(c) = 0$, inconclusive.

**Closed interval method**: To find the absolute max/min of $f$ on $[a,b]$:
1. Find all critical points ($f'(c) = 0$ or $f'$ undefined) in $(a,b)$
2. Evaluate $f$ at critical points and at endpoints $a, b$
3. The largest value is the max, smallest is the min

## Algorithmic Touchpoints

- **Gradient descent** follows $x_{n+1} = x_n - \alpha f'(x_n)$ — the derivative tells you which way is downhill.
- **Newton's method**: $x_{n+1} = x_n - f(x_n)/f'(x_n)$ uses the derivative for faster root finding.
- **Automatic differentiation** (used in ML frameworks) mechanizes the chain rule — each operation stores its local derivative for backward composition.
- **Taylor expansion** is how CPUs compute $\sin$, $\cos$, $e^x$ — truncated polynomial approximations with known error bounds.

## Quick Sanity Checks

- Derivatives of even functions are odd, and vice versa. Check: $(\cos x)' = -\sin x$ (even $\to$ odd).
- The derivative of $x^n$ at $x = 1$ is $n$. Quick way to verify the power rule.
- If $f' > 0$ on an interval but $f$ is decreasing, you made an error.
- Taylor approximations should match the function at $x = a$: $T_n(a) = f(a)$ always.
