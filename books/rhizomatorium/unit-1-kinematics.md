---
id: unit-1-kinematics
title: Unit I - Kinematics
sidebar_position: 2
---

# Unit I: Kinematics Through Geometric Algebra

Kinematics is the study of motion without considering the forces that cause it. We typically deal with position, displacement, velocity, and acceleration.

## The Standard Vector Approach vs. Geometric Algebra

In traditional physics, position is denoted by a vector $\vec{r}$. Displacement is $\Delta \vec{r}$, velocity is $\vec{v} = \frac{d\vec{r}}{dt}$, and acceleration is $\vec{a} = \frac{d\vec{v}}{dt}$.

In Geometric Algebra (GA), we still use vectors to represent directed magnitudes. However, the geometric product allows us to understand the relationship between different kinematic states much more deeply.

### The Geometric Product
For two vectors $u$ and $v$, their geometric product is defined as:
$$ uv = u \cdot v + u \wedge v $$

- The **inner product** ($u \cdot v$) gives a scalar related to the projection of one vector onto another.
- The **outer product** ($u \wedge v$) gives a **bivector**, representing the oriented area swept out by $u$ and $v$.

### Circular Motion: A GA Perspective
Consider uniform circular motion. Traditionally, we use the cross product to relate angular velocity $\vec{\omega}$ to linear velocity $\vec{v}$:
$$ \vec{v} = \vec{\omega} \times \vec{r} $$
This creates a "pseudo-vector" for $\omega$ that awkwardly points out of the plane of rotation.

In GA, rotation happens *in a plane*, not around an axis. Thus, angular velocity is naturally a **bivector**, $\Omega$. 
The velocity of a particle in circular motion is elegantly written using the inner product with the bivector:
$$ v = r \cdot \Omega $$

Here, $\Omega$ is an oriented area. It describes exactly what is physically happening: the position vector $r$ is being swept through the area $\Omega$ at a certain rate, producing the velocity vector $v$ in the plane of motion.

### Relative Motion
When dealing with relative motion, GA makes transformations explicit. Rotations to different reference frames are handled by **rotors** $R$, such that a vector $v$ in a new frame is:
$$ v' = R v R^\dagger $$
This replaces cumbersome rotation matrices and completely avoids gimbal lock.
