---
sidebar_position: 3
sidebar_label: "Trigonometry"
title: "Trigonometry Refresher"
---

# Trigonometry Refresher

Apostol uses trigonometric functions heavily — in integration techniques, series expansions, and as examples throughout. You need the unit circle, the identities, and the key limits cold.

We use $\tau = 2\pi \approx 6.2832$ as the circle constant throughout — one full turn. See the [blog post on why](/blog/2026/04/05/tau-manifesto).

## The Unit Circle

The functions $\sin\theta$ and $\cos\theta$ are defined as the $y$- and $x$-coordinates of the point on the unit circle at angle $\theta$ (measured counterclockwise from the positive $x$-axis).

```math
\cos^2\theta + \sin^2\theta = 1
```

This is the Pythagorean identity — it's the equation of the unit circle $x^2 + y^2 = 1$.

<DesmosGraph
  title="Unit circle: sin and cos"
  expressions={[
    "x^2 + y^2 = 1",
    "a = 0.8",
    "(\\cos(a), \\sin(a))",
    {latex: "\\cos(a)", color: "#2d70b3"},
    {latex: "\\sin(a)", color: "#c74440"},
    {latex: "(0,0), (\\cos(a), 0)", color: "#2d70b3", lineWidth: 2},
    {latex: "(\\cos(a), 0), (\\cos(a), \\sin(a))", color: "#c74440", lineWidth: 2},
  ]}
  xMin={-1.5} xMax={1.5} yMin={-1.5} yMax={1.5}
/>

### Key Values

| $\theta$ | $0$ | $\tau/12$ | $\tau/8$ | $\tau/6$ | $\tau/4$ | $\tau/2$ |
|---|---|---|---|---|---|---|
| $\sin\theta$ | $0$ | $1/2$ | $\sqrt{2}/2$ | $\sqrt{3}/2$ | $1$ | $0$ |
| $\cos\theta$ | $1$ | $\sqrt{3}/2$ | $\sqrt{2}/2$ | $1/2$ | $0$ | $-1$ |

> :mathgoose: With $\tau$, the denominator is the fraction of a turn. $\tau/4$ is a quarter turn, $\tau/12$ is a twelfth turn. The pattern for $\sin$: $0, \tau/12, \tau/8, \tau/6, \tau/4$ gives $\sqrt{0}/2, \sqrt{1}/2, \sqrt{2}/2, \sqrt{3}/2, \sqrt{4}/2$. Cosine is the same sequence reversed.
>
> :nerdygoose: Radians, not degrees. Always radians in calculus. The derivative $\frac{d}{dx}\sin x = \cos x$ is only true in radians. In degrees you'd get $\frac{\tau}{360}\cos x$ — ugly constants everywhere. Radians are the natural unit because arc length on the unit circle equals the angle.

## The Other Four Functions

```math
\tan\theta = \frac{\sin\theta}{\cos\theta}, \qquad \cot\theta = \frac{\cos\theta}{\sin\theta}
```

```math
\sec\theta = \frac{1}{\cos\theta}, \qquad \csc\theta = \frac{1}{\sin\theta}
```

**Pythagorean variants** (divide $\cos^2 + \sin^2 = 1$ by $\cos^2$ or $\sin^2$):

```math
1 + \tan^2\theta = \sec^2\theta
```

```math
1 + \cot^2\theta = \csc^2\theta
```

## Fundamental Identities

### Addition Formulas

```math
\sin(\alpha + \beta) = \sin\alpha\cos\beta + \cos\alpha\sin\beta
```

```math
\cos(\alpha + \beta) = \cos\alpha\cos\beta - \sin\alpha\sin\beta
```

These two generate almost every other trig identity.

<DesmosGraph
  title="Addition formula: sin(a+b)"
  expressions={[
    "a = 1",
    "b = 0.7",
    "y = \\sin(x)",
    "y = \\sin(x + b)",
    {latex: "y = \\sin(a)\\cos(b) + \\cos(a)\\sin(b)", color: "#388c46", lineWidth: 1, lineStyle: "DASHED"},
  ]}
  xMin={-7} xMax={7} yMin={-2} yMax={2}
/>

### Double Angle

Set $\alpha = \beta = \theta$ in the addition formulas.

**For sine**: $\sin(\theta + \theta) = \sin\theta\cos\theta + \cos\theta\sin\theta$:

```math
\sin 2\theta = 2\sin\theta\cos\theta
```

**For cosine**: $\cos(\theta + \theta) = \cos\theta\cos\theta - \sin\theta\sin\theta$:

```math
\cos 2\theta = \cos^2\theta - \sin^2\theta
```

Now use $\sin^2\theta + \cos^2\theta = 1$ to get two alternate forms.

Substitute $\sin^2\theta = 1 - \cos^2\theta$:

```math
\cos 2\theta = \cos^2\theta - (1 - \cos^2\theta) = 2\cos^2\theta - 1
```

Substitute $\cos^2\theta = 1 - \sin^2\theta$:

```math
\cos 2\theta = (1 - \sin^2\theta) - \sin^2\theta = 1 - 2\sin^2\theta
```

> :happygoose: The three forms of $\cos 2\theta$ are all useful in different contexts. The $2\cos^2\theta - 1$ form solves for $\cos^2\theta$ (needed in integration). The $1 - 2\sin^2\theta$ form solves for $\sin^2\theta$. Pick the form that eliminates what you don't want.

### Half Angle (from double angle)

Start from $\cos 2\theta = 2\cos^2\theta - 1$. Solve for $\cos^2\theta$:

```math
\cos 2\theta + 1 = 2\cos^2\theta
```

```math
\cos^2\theta = \frac{1 + \cos 2\theta}{2}
```

Similarly, from $\cos 2\theta = 1 - 2\sin^2\theta$, solve for $\sin^2\theta$:

```math
2\sin^2\theta = 1 - \cos 2\theta
```

```math
\sin^2\theta = \frac{1 - \cos 2\theta}{2}
```

These are essential for integrating $\sin^2 x$ and $\cos^2 x$ — they convert squares into expressions with no squares, which integrate directly.

### Product-to-Sum

*Derivation*: Write out the addition formulas for $\sin(\alpha + \beta)$ and $\sin(\alpha - \beta)$:

```math
\sin(\alpha + \beta) = \sin\alpha\cos\beta + \cos\alpha\sin\beta
```

```math
\sin(\alpha - \beta) = \sin\alpha\cos\beta - \cos\alpha\sin\beta
```

Add these two equations — the $\cos\alpha\sin\beta$ terms cancel:

```math
\sin(\alpha+\beta) + \sin(\alpha-\beta) = 2\sin\alpha\cos\beta
```

Divide by 2:

```math
\sin\alpha\cos\beta = \frac{1}{2}[\sin(\alpha+\beta) + \sin(\alpha-\beta)]
```

The other two follow the same way. For $\cos\alpha\cos\beta$, write out:

```math
\cos(\alpha + \beta) = \cos\alpha\cos\beta - \sin\alpha\sin\beta
```

```math
\cos(\alpha - \beta) = \cos\alpha\cos\beta + \sin\alpha\sin\beta
```

Add them (the $\sin\alpha\sin\beta$ terms cancel):

```math
\cos\alpha\cos\beta = \frac{1}{2}[\cos(\alpha-\beta) + \cos(\alpha+\beta)]
```

Subtract the first from the second instead (the $\cos\alpha\cos\beta$ terms cancel):

```math
\sin\alpha\sin\beta = \frac{1}{2}[\cos(\alpha-\beta) - \cos(\alpha+\beta)]
```

> :sarcasticgoose: "Do I really need product-to-sum?" Yes. When you integrate $\sin(3x)\cos(5x)$, you can't do it directly. Convert to a sum of sines, and each term integrates trivially. These formulas turn hard integrals into easy ones.

### Sum-to-Product

```math
\sin A + \sin B = 2\sin\frac{A+B}{2}\cos\frac{A-B}{2}
```

```math
\cos A + \cos B = 2\cos\frac{A+B}{2}\cos\frac{A-B}{2}
```

## Symmetry and Periodicity

- **Even/odd**: $\cos(-\theta) = \cos\theta$ (even), $\sin(-\theta) = -\sin\theta$ (odd)
- **Period**: $\sin(\theta + \tau) = \sin\theta$, $\cos(\theta + \tau) = \cos\theta$, $\tan(\theta + \tau/2) = \tan\theta$
- **Shifts**: $\sin(\tau/4 - \theta) = \cos\theta$, $\cos(\tau/4 - \theta) = \sin\theta$

## Inverse Trigonometric Functions

| Function | Domain | Range |
|---|---|---|
| $\arcsin x$ | $[-1, 1]$ | $[-\tau/4, \tau/4]$ |
| $\arccos x$ | $[-1, 1]$ | $[0, \tau/2]$ |
| $\arctan x$ | $\mathbb{R}$ | $(-\tau/4, \tau/4)$ |

**Key relation:**

```math
\arcsin x + \arccos x = \frac{\tau}{4}
```

**Derivatives** (you'll need these for integration):

```math
\frac{d}{dx}\arcsin x = \frac{1}{\sqrt{1-x^2}}, \qquad \frac{d}{dx}\arctan x = \frac{1}{1+x^2}
```

> :angrygoose: The restricted ranges are not arbitrary — they're chosen so the inverse is a *function* (passes the vertical line test). $\sin x$ is not one-to-one on all of $\mathbb{R}$, so we restrict to $[-\tau/4, \tau/4]$ where it is. Forgetting the range restriction leads to sign errors in integration.

## Key Limits

These are foundational for derivatives of trig functions:

```math
\lim_{x \to 0} \frac{\sin x}{x} = 1
```

```math
\lim_{x \to 0} \frac{1 - \cos x}{x} = 0
```

```math
\lim_{x \to 0} \frac{1 - \cos x}{x^2} = \frac{1}{2}
```

```math
\lim_{x \to 0} \frac{\tan x}{x} = 1
```

The first limit is proved geometrically (squeeze theorem using areas on the unit circle). All others follow from it.

<DesmosGraph
  title="sin(x)/x approaching 1"
  expressions={[
    "y = \\frac{\\sin(x)}{x}",
    "y = 1",
    "(0, 1)",
  ]}
  xMin={-15} xMax={15} yMin={-0.5} yMax={1.5}
/>

> :mathgoose: The limit $\sin x / x \to 1$ is why radians work. It says that for small angles, $\sin x \approx x$. This is the "small angle approximation" that physicists use everywhere. It's also the reason the derivative of $\sin x$ is $\cos x$ — the proof of the derivative formula starts with this limit.

## Useful Bounds

For $0 < x < \tau/4$:

```math
\sin x < x < \tan x
```

```math
\cos x < \frac{\sin x}{x} < 1
```

These are proven by comparing areas of triangles and circular sectors on the unit circle. They're the inequalities used in the squeeze theorem proof of $\lim_{x \to 0} \sin x / x = 1$.

## Algorithmic Touchpoints

- **Trig substitution** in integrals uses $x = a\sin\theta$, $x = a\tan\theta$, or $x = a\sec\theta$ to eliminate square roots.
- **Fourier analysis** decomposes signals into sines and cosines — the addition formulas are the algebraic engine.
- **Rotation matrices** are built from $\sin$ and $\cos$: the addition formulas prove that composing rotations = adding angles.
- **atan2(y, x)** in code is $\arctan(y/x)$ with quadrant awareness — the standard library function that fixes $\arctan$'s limited range.

## Quick Sanity Checks

- Plug in $\theta = 0$ and $\theta = \tau/4$ into any identity to verify it.
- $\sin^2 + \cos^2 = 1$ should hold for any value you compute.
- Inverse trig outputs must be in the correct range — if $\arcsin$ gives you $3\tau/4$, something is wrong.
- For small $x$: $\sin x \approx x$, $\cos x \approx 1 - x^2/2$, $\tan x \approx x$. Use these to sanity-check limits.
