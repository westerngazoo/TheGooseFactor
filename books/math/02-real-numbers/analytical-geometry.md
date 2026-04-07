---
sidebar_position: 4
sidebar_label: "Analytical Geometry"
title: "Analytical Geometry"
---

# Analytical Geometry

The coordinate plane turns geometric problems into algebra. Lines, circles, and conics become equations you can manipulate — and this is exactly what calculus operates on.

## The Coordinate Plane

A point is an ordered pair $(x, y) \in \mathbb{R}^2$.

**Distance formula** (Pythagorean theorem in coordinates):

```math
d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}
```

**Midpoint:**

```math
M = \left(\frac{x_1 + x_2}{2}, \frac{y_1 + y_2}{2}\right)
```

> :nerdygoose: The distance formula is the $L^2$ norm of the difference vector. In code you'd write `Math.hypot(x2-x1, y2-y1)`. The midpoint is the componentwise average. Both generalize to $n$ dimensions trivially.

## Lines

### Slope-Intercept Form

```math
y = mx + b
```

where $m$ is the slope (rise/run) and $b$ is the $y$-intercept.

### Point-Slope Form

Given point $(x_1, y_1)$ and slope $m$:

```math
y - y_1 = m(x - x_1)
```

### General Form

```math
Ax + By + C = 0
```

### Slope from Two Points

```math
m = \frac{y_2 - y_1}{x_2 - x_1}
```

**Parallel lines**: same slope ($m_1 = m_2$).

**Perpendicular lines**: slopes are negative reciprocals ($m_1 \cdot m_2 = -1$).

**Distance from point $(x_0, y_0)$ to line $Ax + By + C = 0$:**

```math
d = \frac{|Ax_0 + By_0 + C|}{\sqrt{A^2 + B^2}}
```

<DesmosGraph
  title="Lines: slope and intercept"
  expressions={[
    "m = 1.5",
    "b = -1",
    "y = mx + b",
    "(0, b)",
  ]}
  xMin={-5} xMax={5} yMin={-5} yMax={5}
/>

> :mathgoose: The distance-to-line formula is a projection. The numerator $|Ax_0 + By_0 + C|$ measures how far the point is from satisfying the line equation. The denominator normalizes by the gradient's length. This formula appears in support vector machines, computational geometry, and collision detection.

## Circles

A circle with center $(h, k)$ and radius $r$:

```math
(x - h)^2 + (y - k)^2 = r^2
```

Expanded (general form):

```math
x^2 + y^2 + Dx + Ey + F = 0
```

To go from general to standard form, complete the square in both $x$ and $y$.

<DesmosGraph
  title="Circle: center and radius"
  expressions={[
    "h = 1",
    "k = 1",
    "r = 2",
    "(x - h)^2 + (y - k)^2 = r^2",
    "(h, k)",
  ]}
  xMin={-4} xMax={6} yMin={-4} yMax={6}
/>

## Parabolas

A parabola is the set of points equidistant from a point (focus) and a line (directrix).

**Vertical axis** (opens up/down):

```math
(x - h)^2 = 4p(y - k)
```

- Vertex at $(h, k)$, focus at $(h, k+p)$, directrix $y = k - p$
- $p > 0$: opens up. $p < 0$: opens down.

**Horizontal axis** (opens left/right):

```math
(y - k)^2 = 4p(x - h)
```

> :happygoose: Every quadratic $y = ax^2 + bx + c$ is a parabola. Completing the square converts it to vertex form $y = a(x-h)^2 + k$, which tells you the vertex directly. The vertex is the extremum — this is why completing the square is an optimization technique even before you learn derivatives.

<DesmosGraph
  title="Parabola: vertex form"
  expressions={[
    "a = 0.25",
    "h = 0",
    "k = 0",
    "y - k = a(x - h)^2",
    "(h, k)",
    {latex: "(h, k + \\frac{1}{4a})", color: "#c74440", label: "focus"},
    {latex: "y = k - \\frac{1}{4a}", color: "#c74440", lineStyle: "DASHED"},
  ]}
  xMin={-5} xMax={5} yMin={-3} yMax={7}
/>

## Ellipses

An ellipse with center $(h, k)$, semi-major axis $a$, semi-minor axis $b$:

```math
\frac{(x-h)^2}{a^2} + \frac{(y-k)^2}{b^2} = 1
```

- Foci at distance $c = \sqrt{a^2 - b^2}$ from center (along the major axis)
- Eccentricity: $e = c/a$ (0 = circle, approaching 1 = very elongated)
- Defining property: sum of distances to foci is constant ($= 2a$)

<DesmosGraph
  title="Ellipse with foci"
  expressions={[
    "a = 3",
    "b = 2",
    "\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1",
    "c = \\sqrt{a^2 - b^2}",
    {latex: "(-c, 0)", color: "#c74440", label: "F₁"},
    {latex: "(c, 0)", color: "#c74440", label: "F₂"},
  ]}
  xMin={-5} xMax={5} yMin={-4} yMax={4}
/>

> :surprisedgoose: Planetary orbits are ellipses with the Sun at one focus (Kepler's first law). The eccentricity determines the orbit shape — Earth's is 0.017 (nearly circular), while comets can have eccentricity close to 1 (highly elongated). The same equation describes satellite orbits, whispering galleries, and lithotripsy machines.

## Hyperbolas

A hyperbola with center $(h, k)$:

```math
\frac{(x-h)^2}{a^2} - \frac{(y-k)^2}{b^2} = 1
```

- Opens left/right. Swap the sign to open up/down.
- Asymptotes: $y - k = \pm\frac{b}{a}(x - h)$
- Foci at distance $c = \sqrt{a^2 + b^2}$ from center
- Defining property: *difference* of distances to foci is constant ($= 2a$)

<DesmosGraph
  title="Hyperbola with asymptotes"
  expressions={[
    "a = 2",
    "b = 1.5",
    "\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1",
    {latex: "y = \\frac{b}{a}x", color: "#888", lineStyle: "DASHED"},
    {latex: "y = -\\frac{b}{a}x", color: "#888", lineStyle: "DASHED"},
  ]}
  xMin={-6} xMax={6} yMin={-5} yMax={5}
/>

> :nerdygoose: GPS works by hyperbolas. Each pair of satellites gives you a time difference, which translates to a distance difference — that's the defining property of a hyperbola. Your position is the intersection of multiple hyperbolas. The math behind your phone's location is conic sections.

## Conic Sections Summary

All conics satisfy $Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$. The discriminant $B^2 - 4AC$ determines the type:

| Discriminant | Conic |
|---|---|
| $B^2 - 4AC < 0$ | Ellipse (or circle if $A = C$ and $B = 0$) |
| $B^2 - 4AC = 0$ | Parabola |
| $B^2 - 4AC > 0$ | Hyperbola |

> :mathgoose: All four conics come from slicing a double cone with a plane at different angles. The discriminant tells you the angle. This unification is beautiful — circle, ellipse, parabola, and hyperbola are not four separate objects, they're one family parameterized by eccentricity: $e = 0$ (circle), $0 < e < 1$ (ellipse), $e = 1$ (parabola), $e > 1$ (hyperbola).

## Parametric Equations

Instead of $y = f(x)$, describe curves as $(x(t), y(t))$ for parameter $t$:

**Circle**: $x = r\cos t$, $y = r\sin t$, $t \in [0, \tau)$

**Ellipse**: $x = a\cos t$, $y = b\sin t$

**Line through $(x_1,y_1)$ and $(x_2,y_2)$**: $x = x_1 + t(x_2-x_1)$, $y = y_1 + t(y_2-y_1)$

Parametric form is essential for:
- Curves that fail the vertical line test (circles, figure-eights)
- Animation and physics simulation ($t$ = time)
- Arc length and surface area computations in calculus

## Polar Coordinates

A point is described by $(r, \theta)$: distance from origin and angle from positive $x$-axis.

**Conversion:**

```math
x = r\cos\theta, \quad y = r\sin\theta, \quad r = \sqrt{x^2 + y^2}, \quad \theta = \arctan\frac{y}{x}
```

**Common polar curves:**
- Circle: $r = a$
- Line through origin: $\theta = \alpha$
- Cardioid: $r = 1 + \cos\theta$
- Rose: $r = \cos(n\theta)$ ($n$ petals if odd, $2n$ if even)

<DesmosGraph
  title="Polar curves: cardioid and rose"
  expressions={[
    "r = 1 + \\cos(\\theta)",
    {latex: "r = \\cos(3\\theta)", color: "#c74440"},
  ]}
  xMin={-3} xMax={3} yMin={-2} yMax={2}
/>

## Algorithmic Touchpoints

- **Line intersection** is solving a 2x2 linear system — used in computational geometry, ray casting, and graphics.
- **Circle-line intersection** reduces to a quadratic — the discriminant tells you 0, 1, or 2 intersections.
- **Conic fitting** (least squares on $Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0$) is used in computer vision for ellipse detection.
- **Parametric curves** are how game engines and CAD tools represent paths — Bezier curves are parametric polynomials.
- **Polar coordinates** simplify problems with circular symmetry: convolution on circles, radar sweeps, angular histograms.

## Quick Sanity Checks

- A circle equation should have equal coefficients on $x^2$ and $y^2$ with no $xy$ term.
- The radius squared must be positive after completing the square — if it's negative, no real circle exists.
- Perpendicular slopes multiply to $-1$. If one slope is 0 (horizontal), the other is undefined (vertical).
- For conics, check that your curve passes through any given points by substituting.
