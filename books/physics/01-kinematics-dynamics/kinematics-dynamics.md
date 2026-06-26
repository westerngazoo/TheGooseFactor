---
title: "Kinematics & Dynamics"
---

# Kinematics & Dynamics

At the core of classical mechanics is Newton's second law, $F = ma$. But how do we put this formula into action using the lens of computation? Instead of just finding analytical solutions to differential equations, we can view formulas as reusable building blocks to step through time and simulate reality.

## Discretizing F=ma

To compute the motion of an object, we discretize time into small steps, $\Delta t$. From $F = ma$, we know that acceleration is $a = F/m$.

Using basic kinematics, we can update the velocity and position at each time step. A simple numerical integration method (Euler's method) looks like this in pseudocode:

```python
# Update velocity: v_new = v_old + a * dt
v = v + (F / m) * dt

# Update position: x_new = x_old + v * dt
x = x + v * dt
```

:::note[Goose Says]
:nerdygoose: "Euler's method is easy to write, but it accumulates error over time! If your $\Delta t$ is too large, your simulation will blow up!"
:surprisedgoose: "HONK! My projectile just flew off into infinity!"
:::

## Projectile Motion

Let's apply our discretized $F=ma$ to projectile motion. The only force acting on the object (ignoring air resistance) is gravity, $F_y = -mg$.

Because gravity is constant, the acceleration in the y-direction is always $-g$, and the acceleration in the x-direction is $0$.

Our reusable formulas become:

```python
# x-direction (constant velocity)
vx = vx
x = x + vx * dt

# y-direction (constant acceleration)
vy = vy - g * dt
y = y + vy * dt
```

By looping this over time, we generate a parabola. This is the essence of computational physics: taking simple rules and applying them iteratively to see emergent behavior.

## The Harmonic Oscillator

What if the force isn't constant? Consider a mass attached to a spring. Hooke's Law states that the force is proportional to the displacement: $F = -kx$.

The acceleration is now dependent on the position: $a = -kx/m$.

```python
# The force changes as the position changes
F = -k * x

# Update velocity and position
v = v + (F / m) * dt
x = x + v * dt
```

:::warning[Energy Drift]
:nerdygoose: "Watch out! The standard Euler method will add artificial energy to a harmonic oscillator, making the amplitude grow forever. You might want to use the Semi-implicit Euler method, where you use the *new* velocity to update the position: `x = x + v_new * dt`."
:::

By viewing these physical laws through the lens of computation, we transform static equations into dynamic, interactive simulations.
