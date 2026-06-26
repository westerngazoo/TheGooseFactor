---
title: "Energy & Momentum"
---

# Energy & Momentum

When simulating complex systems, calculating the forces and integrating over time can be difficult, especially if the forces are non-linear or poorly understood. This is where energy and momentum shine. Through the lens of computation, conservation laws are not just physical truths; they are invariant assertions that we can use to structure and debug our simulations.

## Conservation as Invariants

In programming, an invariant is a condition that must remain true during the execution of a program. In physics, energy and momentum are often conserved quantities—they act as the ultimate invariants.

Total Energy $E = K + U$ (Kinetic + Potential). In a closed system with conservative forces, $E_{initial} = E_{final}$.

If you're writing a physics engine and your system's total energy increases without any external input, you have a bug!

:::note[Debugging with Physics]
:nerdygoose: "I always add an `assert(abs(total_energy() - initial_energy) < epsilon)` to my simulation loops. If the assertion fails, my integration step is likely too large or my force calculations are wrong."
:::

## Problem Framing with Energy Methods

Sometimes, framing a problem with energy is far more efficient computationally than tracking individual forces ($F=ma$). We can use formulas as reusable building blocks that describe states rather than immediate changes.

Consider a roller coaster rolling down a hill.
Tracking the normal force and gravity vector at every angle of the complex track geometry is tedious. But energy doesn't care about the path!

$U_{initial} + K_{initial} = U_{final} + K_{final}$
$mgh_1 + \frac{1}{2}mv_1^2 = mgh_2 + \frac{1}{2}mv_2^2$

If we just need to know the speed of the coaster at the bottom ($h_2 = 0$), and it starts from rest ($v_1 = 0$), the formula simplifies elegantly:

$mgh_1 = \frac{1}{2}mv_2^2$
$v_2 = \sqrt{2gh_1}$

```python
def final_velocity(initial_height):
    # Formulas as reusable building blocks
    # We bypass all intermediate complex forces!
    return math.sqrt(2 * g * initial_height)
```

:::info[Momentum and Collisions]
:weightliftinggoose: "HONK! When things smash together, use momentum! $\Sigma p_{initial} = \Sigma p_{final}$. Energy might be lost to heat or sound (inelastic collisions), but momentum is always conserved!"
:::

By viewing energy and momentum as computational invariants, we gain powerful tools for both problem-solving and software verification.