---
id: unit-3-gravitation
title: Unit III - Gravitation
sidebar_position: 4
---

# Unit III: Gravitation

Gravitation describes the universal attraction between masses. 

## The Gravitational Field

Traditionally, Newton's law of universal gravitation is:
$$ \vec{F}_g = -G \frac{m_1 m_2}{r^2} \hat{r} $$

In a field perspective, a mass $M$ creates a gravitational field $g$ in the surrounding space:
$$ g(r) = -G \frac{M}{r^2} \hat{r} = -G \frac{M}{r^3} r $$

In Geometric Algebra, $g(r)$ is a vector field. But the real power of GA in field theory comes when we introduce the **vector derivative** (or Dirac operator) $\nabla$.

## Poisson's Equation in GA

Instead of separate div, grad, and curl operators, GA unifies them into the single operator $\nabla$. When applied to a vector field $g$:
$$ \nabla g = \nabla \cdot g + \nabla \wedge g $$

For a static gravitational field, the field is irrotational, so $\nabla \wedge g = 0$. 
The divergence relates to the mass density $\rho$:
$$ \nabla \cdot g = -4 \pi G \rho $$

Thus, the fundamental equation for gravity in GA becomes simply:
$$ \nabla g = -4 \pi G \rho $$

This incredibly elegant equation packages both the divergence and the zero-curl condition into one statement. The geometric product handles both the scalar and bivector components seamlessly.

## Energy Potential

The gravitational potential $\Phi$ is a scalar field such that $g = -\nabla \Phi$. 
Substituting this back into our fundamental field equation gives:
$$ \nabla (-\nabla \Phi) = -\nabla^2 \Phi = -4 \pi G \rho $$
$$ \nabla^2 \Phi = 4 \pi G \rho $$

This is the classic Poisson's equation for gravity. By utilizing GA, we see that scalar potentials, vector fields, and mass distributions are all interacting components of a unified multivector calculus.
