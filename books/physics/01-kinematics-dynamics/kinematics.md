---
sidebar_position: 1
sidebar_label: "Kinematics"
title: "Kinematics: Describing Motion"
---

# Kinematics: Describing Motion

Kinematics is the bookkeeping of motion — position, velocity, and acceleration — *before* we ask what causes it. It's pure geometry in time. The payoff for a programmer: every kinematic quantity is a derivative or integral of another, so the entire subject is calculus with units attached.

## Position, Velocity, Acceleration

Let $x(t)$ be position as a function of time. Velocity is the rate of change of position, and acceleration is the rate of change of velocity:

```math
v(t) = \frac{dx}{dt}, \qquad a(t) = \frac{dv}{dt} = \frac{d^2 x}{dt^2}.
```

Going the other way, you integrate:

```math
v(t) = v_0 + \int_0^t a(\tau)\,d\tau, \qquad x(t) = x_0 + \int_0^t v(\tau)\,d\tau.
```

In multiple dimensions these become vectors $\mathbf{x}(t)$, $\mathbf{v}(t)$, $\mathbf{a}(t)$, and the derivatives act componentwise.

> :mathgoose: The whole "ladder" — position, velocity, acceleration, jerk — is just repeated differentiation. Differentiate to go *down* the ladder (smoother → rougher information), integrate to go *up* (you must supply a constant of integration each step, which is exactly the initial condition $x_0$ or $v_0$). Initial conditions are not optional bookkeeping; they're the integration constants the math demands.

## The Constant-Acceleration Equations

When $a$ is constant, the integrals are trivial and you get the four kinematic equations every physics student memorizes:

```math
v = v_0 + a t
```

```math
x = x_0 + v_0 t + \tfrac{1}{2} a t^2
```

```math
v^2 = v_0^2 + 2 a (x - x_0)
```

```math
x = x_0 + \tfrac{1}{2}(v_0 + v)\, t
```

Each is derivable from $a = \text{const}$ by integration; the third eliminates $t$, and the fourth uses the average velocity $\bar v = (v_0 + v)/2$.

> :nerdygoose: Notice $x = x_0 + v_0 t + \tfrac12 a t^2$ is exactly a **second-order Taylor expansion** of position in time — and because $a$ is constant, there are no higher terms, so it's *exact*, not an approximation. When $a$ varies, this same expression becomes the local truncated Taylor series, which is precisely what a numerical integrator uses for one time step. Constant-acceleration physics is the base case of every ODE solver.

### Worked example — stopping distance

A car at $v_0 = 30\,\text{m/s}$ brakes at $a = -8\,\text{m/s}^2$. How far before it stops? Use $v^2 = v_0^2 + 2a\,\Delta x$ with $v = 0$:

```math
\Delta x = \frac{-v_0^2}{2a} = \frac{-900}{2(-8)} \approx 56\ \text{m}.
```

Stopping distance scales with $v_0^2$ — double the speed, quadruple the distance. That quadratic is the entire argument for speed limits.

## Projectile Motion

Near Earth's surface, gravity gives a constant downward acceleration $g \approx 9.81\,\text{m/s}^2$. With no air resistance the horizontal and vertical motions **decouple**: constant velocity horizontally, constant acceleration vertically.

```math
x(t) = x_0 + v_{0x} t, \qquad y(t) = y_0 + v_{0y} t - \tfrac{1}{2} g t^2.
```

For a launch speed $v_0$ at angle $\theta$, we have $v_{0x} = v_0\cos\theta$ and $v_{0y} = v_0\sin\theta$. Standard results (launch and land at the same height):

```math
T = \frac{2 v_0 \sin\theta}{g}, \qquad R = \frac{v_0^2 \sin 2\theta}{g}, \qquad H = \frac{v_0^2 \sin^2\theta}{2g}.
```

The range $R$ is maximized at $\theta = 45^\circ$ because $\sin 2\theta$ peaks there.

> :happygoose: The single most important idea in projectile motion: **the two axes are independent**. The horizontal motion has no idea gravity exists; the vertical motion has no idea the projectile is moving sideways. This is why a bullet fired horizontally and a bullet dropped from the same height hit the ground at the same instant. In code, this is just two independent 1-D integrators sharing a clock.

> :angrygoose: This decoupling is exactly what air resistance destroys. Drag depends on *speed* $|\mathbf v|$, which mixes the components: $\mathbf F_{\text{drag}} = -b|\mathbf v|\mathbf v$ couples $x$ and $y$ nonlinearly. The clean closed-form parabola is gone, and you must integrate numerically. Don't trust the $45^\circ$ optimal angle once drag is in play — the real optimum drops below $45^\circ$.

### The trajectory shape

Eliminate $t$ from the projectile equations to get $y$ as a function of $x$:

```math
y = x\tan\theta - \frac{g}{2 v_0^2 \cos^2\theta}\,x^2.
```

A downward parabola — the signature of constant acceleration.

## Relative Motion and Frames

Velocities add as vectors between reference frames. If frame $B$ moves at velocity $\mathbf{v}_{BA}$ relative to frame $A$, then an object's velocity transforms as:

```math
\mathbf{v}_{\text{obj},A} = \mathbf{v}_{\text{obj},B} + \mathbf{v}_{BA}.
```

This Galilean addition is the everyday-speed limit of special relativity. Choosing a clever frame (e.g., the center-of-mass frame) often turns an ugly problem into a symmetric one — a trick we exploit heavily in collisions.

## Computational / Algorithmic Touchpoints

- **State vectors**: a moving particle is the state $(\mathbf{x}, \mathbf{v})$; simulating it means integrating $\dot{\mathbf x} = \mathbf v$, $\dot{\mathbf v} = \mathbf a$. This first-order form is what every ODE library expects.
- **Closed form vs. stepping**: constant-acceleration formulas are the analytic solution; for varying $a$ you step. The kinematic equation $x = x_0 + v_0 t + \tfrac12 a t^2$ *is* a single Euler/Taylor step.
- **Game physics**: 2-D projectile decoupling lets engines update `x` and `y` separately each frame; gravity is one line, `vy -= g*dt`.
- **Range optimization** ($45^\circ$) is the simplest nontrivial example of optimizing a closed-form objective by setting a derivative to zero.

```python
def step_projectile(x, y, vx, vy, g, dt):
    # one explicit Euler step of 2-D projectile motion
    x += vx * dt
    y += vy * dt
    vy -= g * dt          # only the vertical velocity feels gravity
    return x, y, vx, vy
```

## Quick Sanity Checks

- Units must match: $v_0 t$ has units of (m/s)(s) = m, and $\tfrac12 a t^2$ has (m/s²)(s²) = m. If a term in a kinematic equation has the wrong units, it's a typo.
- At the top of a projectile's arc, $v_y = 0$ but $v_x$ is unchanged — the speed is minimum, not zero.
- Time of flight should double if you double $v_{0y}$; range should quadruple if you double $v_0$ (at fixed angle).
- If you integrate $a = \text{const}$ and don't get a $t^2$ term in position, you dropped a factor — check the $\tfrac12$.
