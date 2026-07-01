---
sidebar_position: 4
sidebar_label: "Collisions & Problem Framing"
title: "Collisions and Framing Problems with Conservation Laws"
---

# Collisions and Framing Problems with Conservation Laws

A collision is a brief, intense interaction where the internal forces dwarf the external ones. During the contact, momentum is conserved (external forces are negligible over the short time); whether *energy* is conserved depends on the collision type. Knowing which invariants apply — and choosing the right combination — is the entire skill. This chapter is a decision procedure as much as a physics lesson.

## The Conservation Toolkit

For any collision of two bodies, momentum is conserved:

```math
m_1 \mathbf{v}_{1i} + m_2 \mathbf{v}_{2i} = m_1 \mathbf{v}_{1f} + m_2 \mathbf{v}_{2f}.
```

Kinetic energy may or may not be conserved, which classifies the collision:

| Type | Momentum | Kinetic energy | Example |
|---|---|---|---|
| **Elastic** | conserved | conserved | billiard balls, ideal gas molecules |
| **Inelastic** | conserved | partially lost | most real collisions |
| **Perfectly inelastic** | conserved | maximally lost | objects stick together |

> :angrygoose: The trap is assuming kinetic energy is conserved because it usually is in textbook problems. It is **only** conserved in *elastic* collisions. If two objects stick, crumple, or make a sound, kinetic energy was lost to heat/deformation — momentum still holds, energy does not. Always ask "is this collision elastic?" before writing an energy equation. Using energy conservation on an inelastic collision is the single most common collision-problem error.

## Perfectly Inelastic Collisions

The objects stick and move together with a common final velocity. One equation (momentum) suffices:

```math
\mathbf{v}_f = \frac{m_1 \mathbf{v}_{1i} + m_2 \mathbf{v}_{2i}}{m_1 + m_2}.
```

The lost kinetic energy went into deformation and heat. The fraction lost is largest when the masses are comparable and the relative speed is high — this is why crash safety cares about it.

### Worked example — the ballistic pendulum

A bullet (mass $m$, speed $v$) embeds in a block (mass $M$) hanging from a string. This is a *two-phase* problem, and mixing the phases is the classic mistake:

1. **Collision (momentum, energy NOT conserved):** $mv = (m+M)V \Rightarrow V = \dfrac{mv}{m+M}$.
2. **Swing-up (energy, momentum NOT relevant):** $\tfrac12(m+M)V^2 = (m+M)gh \Rightarrow h = \dfrac{V^2}{2g}$.

> :nerdygoose: The ballistic pendulum is the canonical "use the right invariant in the right phase" problem. Momentum for the bang (fast, inelastic, energy lost); energy for the smooth swing (no dissipation). Apply energy conservation to the collision phase and you'll *over*-estimate the bullet speed badly, because you'd be pretending the lost heat is still kinetic energy. Match the conservation law to the physics of each phase.

## Elastic Collisions in 1-D

Both momentum and kinetic energy are conserved — two equations, two unknowns. Solving the system yields the clean result:

```math
v_{1f} = \frac{m_1 - m_2}{m_1 + m_2}v_{1i} + \frac{2 m_2}{m_1 + m_2}v_{2i},
```

```math
v_{2f} = \frac{2 m_1}{m_1 + m_2}v_{1i} + \frac{m_2 - m_1}{m_1 + m_2}v_{2i}.
```

An elegant equivalent fact: in an elastic collision the **relative velocity reverses**,

```math
v_{1i} - v_{2i} = -(v_{1f} - v_{2f}).
```

### Limiting cases worth memorizing

- **Equal masses** ($m_1 = m_2$), target at rest: they *swap* velocities. (Newton's cradle.)
- **Heavy hits light** ($m_1 \gg m_2$): the heavy one barely slows; the light one flies off at ~$2v_{1i}$.
- **Light hits heavy** ($m_1 \ll m_2$): the light one bounces back at nearly $-v_{1i}$; the heavy one barely moves.

> :surprisedgoose: The "light bounces back, heavy barely moves" limit is exactly a ball bouncing off a wall, and "heavy gives light $2v$" is how a slow-moving heavy object can fling a light one fast — the gravitational slingshot that NASA uses to accelerate spacecraft past planets. Same two formulas, planetary scale.

## The Coefficient of Restitution

Real collisions live between elastic and perfectly inelastic. The **coefficient of restitution** $e \in [0,1]$ parameterizes the spectrum via the ratio of separation to approach speed:

```math
e = \frac{|v_{2f} - v_{1f}|}{|v_{1i} - v_{2i}|}.
```

$e = 1$ is elastic, $e = 0$ is perfectly inelastic. This single number is what game engines and ball-sport models tune to get "bounciness" right.

## A Framing Procedure

When you face a mechanics problem, choose your invariants deliberately:

1. **Is the system isolated (no/negligible external impulse over the interval)?** → momentum is conserved. Collisions almost always qualify.
2. **Are all forces conservative (no friction, no sticking, no sound)?** → mechanical energy is conserved.
3. **Count equations vs. unknowns.** Elastic gives you both laws (enough for two unknowns); inelastic gives only momentum (you need extra info like "they stick" or a given $e$).
4. **Split into phases** with different applicable laws (the ballistic pendulum). Never carry an invariant across a phase where it doesn't hold.

## Computational / Algorithmic Touchpoints

- **Collision resolution in physics engines**: detect overlap, then apply an impulse along the contact normal sized by the relative velocity and the restitution $e$ — a direct implementation of the impulse/restitution equations, no force integration needed.
- **Event-driven simulation**: for hard spheres, predict the next collision time analytically and jump straight to it, rather than time-stepping through empty space — far faster for sparse collisions.
- **Conserved-quantity checks**: after resolving a batch of collisions, assert total momentum is unchanged (always) and total kinetic energy is unchanged *only if* $e=1$.
- **Restitution as a tunable parameter** maps the elastic↔inelastic spectrum to a single slider in game/simulation code.

```python
def elastic_1d(m1, v1, m2, v2):
    # exchange formulas for a 1-D elastic collision
    s = m1 + m2
    v1f = ((m1 - m2) * v1 + 2 * m2 * v2) / s
    v2f = ((m2 - m1) * v2 + 2 * m1 * v1) / s
    return v1f, v2f

def resolve_normal_impulse(m1, m2, v1, v2, e):
    # 1-D impulse with restitution e in [0, 1]
    v_rel = v1 - v2
    J = -(1 + e) * v_rel / (1 / m1 + 1 / m2)
    return v1 + J / m1, v2 - J / m2
```

## Quick Sanity Checks

- Momentum is conserved in *every* collision; kinetic energy only when $e = 1$. If your inelastic answer shows energy increasing, you blundered.
- Kinetic energy can never *increase* in a collision (no internal energy source). $K_f \le K_i$ always; equality iff elastic.
- Equal-mass elastic collision with one at rest must give a clean velocity swap. Quick test of your formula.
- After a perfectly inelastic collision the two objects share one velocity; if your "stuck-together" answer has them moving differently, recheck.
- $e$ must come out in $[0,1]$. A value above 1 means energy was created (impossible); below 0 means they passed through each other (also impossible).
