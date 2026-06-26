---
title: "Dimensional Analysis"
---

# Dimensional Analysis

In software engineering, a strong type system catches a massive class of bugs before the code ever runs. You can't accidentally add a `String` to a `DatabaseConnection`. In physics, we have a built-in type checker that is just as rigorous: **Dimensional Analysis**.

Through the lens of computation, units (meters, seconds, kilograms) act as our types.

## The Physicist's Type Checker

When you use formulas as reusable building blocks, you are constantly combining different quantities. Dimensional analysis ensures that these combinations are valid.

The fundamental rule is: **You can only add or equate quantities with the same dimensions.**

Let's say you're writing a function to calculate a distance $d$ based on initial velocity $v$, acceleration $a$, and time $t$. You write:
$d = v \cdot t + \frac{1}{2} a \cdot t$

Is this formula correct? Let's check the types (dimensions)!
*   $[d]$ = Length ($L$)
*   $[v]$ = Length / Time ($L/T$)
*   $[a]$ = Length / Time$^2$ ($L/T^2$)
*   $[t]$ = Time ($T$)

Let's plug the types into the formula:
$L = (L/T) \cdot T + (L/T^2) \cdot T$
$L = L + L/T$

:::warning[Type Mismatch!]
:surprisedgoose: "HONK! We are trying to add a Length to a Velocity (Length/Time)! This is a type error!"
:::

The dimensional analysis caught a bug. The correct formula requires an extra factor of time in the second term: $\frac{1}{2} a \cdot t^2$.

Let's check the types again:
$L = (L/T) \cdot T + (L/T^2) \cdot T^2$
$L = L + L$

The equation is dimensionally consistent!

## Catching Errors Before You Compute

When building complex simulations, checking units manually can be tedious, but it is essential for verifying your logic.

```python
# A hypothetical typed python for physics
def calculate_force(mass: Kilogram, accel: MeterPerSecondSquared) -> Newton:
    # We know this returns Newtons because kg * m/s^2 = Newton
    return mass * accel
```

:::note[Goose Wisdom]
:nerdygoose: "If you're ever lost on an exam, or stuck debugging a complex physics engine, look at the units of the answer you need, and look at the units of the variables you have. Often, there is only one way to combine them that satisfies the type checker!"
:::

Dimensional analysis is more than just checking units; it's a powerful tool for discovering relationships between physical quantities without having to solve the underlying differential equations.