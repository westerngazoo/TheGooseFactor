---
title: "Computational Physics"
---

# Computational Physics

When dealing with real-world physics, analytical solutions (where you solve an equation completely with algebra and calculus) are rare. The three-body problem, fluid dynamics, and complex weather systems rely entirely on numerical methods.

We look at these systems through the lens of computation: turning differential equations into iterative loops.

## Time Stepping and Numerical Stability

In computational physics, we slice continuous time into discrete steps, $\Delta t$. We use our physics formulas as reusable building blocks to calculate the state of the system at the next step based on the current step.

However, discretization introduces error. If our time step is too large, our simulation might become unstable, blowing up to infinity or displaying wild, unphysical oscillations.

:::warning[Stability Matters]
:surprisedgoose: "HONK! I set my $\Delta t$ to 1 second for a stiff spring, and my mass vanished from the screen! The energy grew exponentially!"
:::

## Euler vs Runge-Kutta

The simplest method for time-stepping is the **Euler method**, which we've seen before. It assumes the rate of change (like velocity or acceleration) is constant over the entire $\Delta t$.

```python
# Euler Method (First-order)
y_next = y_current + rate_of_change * dt
```

The Euler method is intuitive but inaccurate, especially for oscillatory or curved motion. It tends to accumulate error rapidly.

To get better accuracy, we can use the **Runge-Kutta 4th Order (RK4)** method. Instead of just looking at the rate of change at the beginning of the time step, RK4 calculates the rate at the beginning, twice at the midpoint, and once at the end, taking a weighted average.

```python
# Simplified RK4 Concept
k1 = compute_rate(t, y)
k2 = compute_rate(t + 0.5*dt, y + 0.5*dt*k1)
k3 = compute_rate(t + 0.5*dt, y + 0.5*dt*k2)
k4 = compute_rate(t + dt, y + dt*k3)

average_rate = (k1 + 2*k2 + 2*k3 + k4) / 6
y_next = y_current + average_rate * dt
```

:::note[Goose Advice]
:nerdygoose: "RK4 requires four force evaluations per time step, making it computationally more expensive than Euler. But because it's so much more accurate, you can take much larger time steps, often making it faster overall for the same level of accuracy!"
:::

Choosing the right numerical method is the core challenge of computational physics. You must balance accuracy, stability, and computational cost.