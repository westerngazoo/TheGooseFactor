---
id: unit-4-kepler
title: Unit IV - Kepler's Laws & Free Fall
sidebar_position: 5
---

# Unit IV: Kepler's Laws & Free Fall

Johannes Kepler derived three empirical laws of planetary motion. GA provides arguably the most beautiful and intuitive mathematical proof for these laws, particularly the second law.

## Kepler's Second Law: Equal Areas in Equal Times

Kepler's Second Law states that a line segment joining a planet and the Sun sweeps out equal areas during equal intervals of time.

Let's prove this geometrically. 
The position of the planet is $r$, and its velocity is $v = \dot{r}$.

In Geometric Algebra, the area swept out by two vectors is exactly represented by their outer product. For an infinitesimal time $dt$, the displacement is $v dt$. The infinitesimal area bivector $dA$ swept out is half the parallelogram formed by $r$ and $dr$:
$$ dA = \frac{1}{2} (r \wedge dr) = \frac{1}{2} (r \wedge v) dt $$

The **areal velocity** (rate at which area is swept) is therefore:
$$ \frac{dA}{dt} = \frac{1}{2} (r \wedge v) $$

Recall from our Dynamics unit that angular momentum is the bivector $L = m (r \wedge v)$. Therefore:
$$ \frac{dA}{dt} = \frac{L}{2m} $$

### Conservation of Angular Momentum
In a central force field like gravity, the force $F$ is parallel to $r$. 
The torque bivector is $\tau = r \wedge F$. Since $r$ and $F$ are parallel, their outer product is exactly zero:
$$ \tau = 0 $$

Because $\tau = \frac{dL}{dt}$, this implies that the angular momentum bivector $L$ is constant in time. 

If $L$ is a constant bivector, then the areal velocity $\frac{dA}{dt} = \frac{L}{2m}$ is also a constant bivector.
This proves that the area swept out per unit time is constant. Moreover, because $L$ is a constant bivector, the plane of the orbit is fixed (the "direction" of the area does not change). 

GA naturally produces the area conservation without needing cross products, directly linking the geometry of the sweeping area ($r \wedge v$) to the physics of angular momentum.

## Free Fall
In simple 1D free fall near the Earth's surface, the vector acceleration is a constant $g$. 
Integrating the vector equation with respect to time yields the standard kinematic equations, but recognizing them as 1D vectors prevents sign errors often made in scalar approximations:
$$ v(t) = v_0 + g t $$
$$ r(t) = r_0 + v_0 t + \frac{1}{2} g t^2 $$
