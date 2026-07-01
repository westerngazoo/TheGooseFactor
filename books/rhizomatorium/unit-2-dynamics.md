---
id: unit-2-dynamics
title: Unit II - Dynamics & Newton's Laws
sidebar_position: 3
---

# Unit II: Dynamics (Newton's Laws)

Dynamics introduces forces and masses to explain why objects move. 

## Newton's First and Second Laws
Newton's Second Law is famously $F = m a$. In GA, force $F$ and acceleration $a$ are vectors. Mass $m$ remains a scalar. 

$$ F = m \frac{dv}{dt} = \frac{dp}{dt} $$
Where $p = m v$ is the momentum vector. 

## Torque and Angular Momentum

The most profound shift in Dynamics when using Geometric Algebra comes when we discuss rotational dynamics. 

### Traditional Torque
Traditionally, torque $\vec{\tau}$ and angular momentum $\vec{L}$ are defined via the cross product:
$$ \vec{\tau} = \vec{r} \times \vec{F} $$
$$ \vec{L} = \vec{r} \times \vec{p} $$
Both $\vec{\tau}$ and $\vec{L}$ are pseudo-vectors. They point perpendicular to the plane where the actual physics is happening. 

### Torque as a Bivector
In GA, we define angular momentum and torque using the outer product. They become **bivectors**, representing oriented areas.

$$ L = r \wedge p $$
$$ \tau = r \wedge F $$

The rate of change of angular momentum relates directly to torque:
$$ \frac{dL}{dt} = \frac{d}{dt}(r \wedge p) = \left(\frac{dr}{dt} \wedge p\right) + \left(r \wedge \frac{dp}{dt}\right) $$
Since $\frac{dr}{dt} = v$ and $p = mv$, the term $v \wedge (mv) = 0$ (the outer product of parallel vectors is zero).
Thus:
$$ \frac{dL}{dt} = r \wedge F = \tau $$

**Physical Insight**: $\tau$ is a bivector that explicitly describes the plane in which the twisting force acts. There is no need for a "right-hand rule" to find a fictitious perpendicular axis. The bivector captures the rotational force *in the very plane* it is applied.

## Work and Energy
Work $W$ done by a force over a displacement $dr$ is the scalar part of the geometric product:
$$ W = F \cdot dr $$

Because the geometric product $F dr = F \cdot dr + F \wedge dr$, the outer product term $F \wedge dr$ represents the torque-like area swept during the movement. Work is simply the symmetric, scalar portion of this fundamental geometric interaction.
