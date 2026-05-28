---
sidebar_position: 2
title: "Curvilinear Coordinates Without Index Notation"
---

# Curvilinear Coordinates Without Index Notation

> *Doran-Lasenby §6.3–6.4.* The vector derivative in non-Cartesian
> coordinate systems. Spherical, cylindrical, hyperbolic — all without
> tensor-index gymnastics.

Real physics problems rarely have Cartesian symmetry. Spherical
coordinates for atomic problems, cylindrical for axially-symmetric
configurations, hyperbolic for Rindler observers. The conventional
vector-calculus treatment of $\nabla$ in these coordinate systems
involves memorizing Lamé coefficients and stretching factors. GA
does it intrinsically — pick a frame, compute the reciprocal,
apply $\nabla = e^\mu\partial_\mu$.

## 1. Frames and reciprocal frames in curvilinear coordinates

For coordinates $(u^1, u^2, u^3)$ on $\mathbb{R}^3$, the
**coordinate frame** is

$$e_i = \frac{\partial \mathbf{r}}{\partial u^i}$$

— the tangent vectors to the coordinate curves. These are
generally **not orthonormal** and **not unit length**.

The **reciprocal frame** $\{e^i\}$ satisfies $e^i \cdot e_j = \delta^i_j$.
By the formulas of [Ch 3](/physics-ga/part-1-foundations/frames-components-and-tensor-free-linear-algebra):

$$e^i = \frac{e_j \wedge e_k}{e_1 \wedge e_2 \wedge e_3}$$

(cyclic permutations of $i, j, k$).

The vector derivative is

$$\nabla = e^i \frac{\partial}{\partial u^i}$$

— using the reciprocal frame to contract correctly with the
coordinate-derivative operators.

## 2. Spherical coordinates

Coordinates $(r, \theta, \phi)$ on $\mathbb{R}^3$:

$$\mathbf{r}(r, \theta, \phi) = r\sin\theta\cos\phi\,\hat{x} + r\sin\theta\sin\phi\,\hat{y} + r\cos\theta\,\hat{z}$$

The coordinate frame:

$$e_r = \hat{r}, \quad e_\theta = r\hat{\theta}, \quad e_\phi = r\sin\theta\,\hat{\phi}$$

— where $\hat{r}, \hat{\theta}, \hat{\phi}$ are the unit vectors
in the standard physics convention.

The reciprocal frame:

$$e^r = \hat{r}, \quad e^\theta = \hat{\theta}/r, \quad e^\phi = \hat{\phi}/(r\sin\theta)$$

The vector derivative:

$$\nabla = \hat{r}\partial_r + \frac{\hat{\theta}}{r}\partial_\theta + \frac{\hat{\phi}}{r\sin\theta}\partial_\phi$$

— **exactly** the formula from a vector-calculus textbook, with
the $1/r$ and $1/(r\sin\theta)$ "scale factors" arising naturally
from the reciprocal frame.

The gradient of a scalar $\phi(r,\theta,\phi)$ is

$$\nabla\phi = \hat{r}\,\partial_r\phi + \frac{\hat{\theta}}{r}\partial_\theta\phi + \frac{\hat{\phi}}{r\sin\theta}\partial_\phi\phi$$

— textbook. The divergence and curl follow by applying $\nabla$
geometric-product-wise and projecting onto grades.

> :nerdygoose: The "Lamé coefficients" $h_r = 1, h_\theta = r, h_\phi = r\sin\theta$
> of vector calculus are just the magnitudes of the coordinate
> frame vectors $|e_r|, |e_\theta|, |e_\phi|$. The reciprocal-frame
> formulas hide them automatically. Same content, less bookkeeping.

## 3. Cylindrical coordinates

Coordinates $(\rho, \phi, z)$:

$$\mathbf{r}(\rho, \phi, z) = \rho\cos\phi\,\hat{x} + \rho\sin\phi\,\hat{y} + z\,\hat{z}$$

Frame:

$$e_\rho = \hat{\rho}, \quad e_\phi = \rho\hat{\phi}, \quad e_z = \hat{z}$$

Reciprocal:

$$e^\rho = \hat{\rho}, \quad e^\phi = \hat{\phi}/\rho, \quad e^z = \hat{z}$$

Vector derivative:

$$\nabla = \hat{\rho}\partial_\rho + \frac{\hat{\phi}}{\rho}\partial_\phi + \hat{z}\partial_z$$

Again, textbook formula, derived by computing the reciprocal frame.

## 4. The Laplacian in curvilinear coordinates

The vector Laplacian $\nabla^2 = \nabla\cdot\nabla$ acts on scalar
functions by

$$\nabla^2\phi = \frac{1}{\sqrt{|g|}}\partial_i\left(\sqrt{|g|}\,g^{ij}\partial_j\phi\right)$$

with $g^{ij}$ the (reciprocal) metric and $|g| = \det(g_{ij})$.

In **spherical**:

$$\nabla^2\phi = \frac{1}{r^2}\partial_r(r^2\partial_r\phi) + \frac{1}{r^2\sin\theta}\partial_\theta(\sin\theta\,\partial_\theta\phi) + \frac{1}{r^2\sin^2\theta}\partial_\phi^2\phi$$

— the standard Laplacian in spherical coordinates. The first
term is the **radial Laplacian**; the second two are the
**angular Laplacian** $-\hat{\mathbf{L}}^2/(\hbar^2 r^2)$ from
quantum mechanics.

In **cylindrical**:

$$\nabla^2\phi = \frac{1}{\rho}\partial_\rho(\rho\partial_\rho\phi) + \frac{1}{\rho^2}\partial_\phi^2\phi + \partial_z^2\phi$$

In a **Rindler frame** (constantly accelerating observer):

$$ds^2 = \xi^2 d\tau^2 - d\xi^2 - dx^2 - dy^2$$

with $\xi$ the Rindler "radius" (distance from the Rindler horizon)
and $\tau$ the Rindler time. The Laplacian acquires the
non-trivial factor of $\xi^2$ in the time component — same machinery,
hyperbolic frame.

## 5. Separation of variables

Curvilinear coordinates exist for one reason: to **separate
variables** in PDEs. Laplace's equation $\nabla^2\phi = 0$
separates in:

- **Cartesian** (trivially).
- **Spherical**: $\phi = R(r)\Theta(\theta)\Phi(\phi)$; angular
  part gives spherical harmonics.
- **Cylindrical**: $\phi = R(\rho)\Phi(\phi)Z(z)$; radial part
  gives Bessel functions.
- **Parabolic, prolate spheroidal, oblate spheroidal**, etc. — a
  total of 11 coordinate systems in 3D admitting separable
  Laplace's equation (Eisenhart classification).

In GA, the separability has an algebraic origin: the coordinate
system's symmetry group has commuting Killing vectors / bivectors.
The number of separable systems is the number of distinct
maximally-commuting subgroups of the Euclidean group.

> :surprisedgoose: The 11 separable coordinate systems for 3D
> Laplace's equation were classified by Eisenhart in 1934. In each,
> the rotational + translational symmetry breaks down in a
> different way. GA's bivector formulation makes the symmetry
> structure visible directly — bivectors are the generators that
> get diagonalized in each coordinate choice.

## 6. The angular momentum operator in spherical coordinates

The angular momentum operator $\hat{\mathbf{L}} = -i\hbar\,\mathbf{r}\times\nabla$
in conventional notation; in GA it's the bivector
$\hat{L} = -I\hbar\,\mathbf{r}\wedge\nabla$.

In spherical coordinates:

$$\hat{L}^2 = -\hbar^2 \left[\frac{1}{\sin\theta}\partial_\theta(\sin\theta\,\partial_\theta) + \frac{1}{\sin^2\theta}\partial_\phi^2\right]$$

— the angular Laplacian. The Schrödinger equation in a central
potential separates into

$$\nabla^2\psi = \frac{1}{r^2}\partial_r(r^2\partial_r\psi) - \frac{\hat{L}^2/\hbar^2}{r^2}\psi$$

with $\hat{L}^2$ eigenvalues $\ell(\ell+1)\hbar^2$ for spherical
harmonics $Y_\ell^m$.

## 7. Spherical harmonics in GA

The spherical harmonics $Y_\ell^m(\theta, \phi)$ are eigenfunctions
of $\hat{L}^2$ and $\hat{L}_z$. In GA, they can be built from
**solid harmonics**:

$$Y_\ell^m \propto e^{im\phi} P_\ell^m(\cos\theta)$$

with $P_\ell^m$ the associated Legendre functions. In GA notation,
they're scalar functions on the unit sphere, but they arise from
projecting the components of the **highest-weight rotor**
$R = \exp(-I\hat{\mathbf{n}}\theta/2)$ onto basis directions.

The Clebsch-Gordan series for combining spherical harmonics is the
same in GA notation — what changes is the algebraic transparency
of why these series work (they're decompositions of products of
rotor representations).

## 8. The Killing vector / bivector formalism

For symmetries of curved spacetimes, **Killing vectors** $\xi$
satisfy

$$\nabla(\xi\cdot v) + \nabla\cdot(\xi\wedge v) = 0$$

for all vectors $v$. Equivalently in tensor language: $\nabla_{(\mu}\xi_{\nu)} = 0$
(symmetrized covariant derivative vanishes).

Schwarzschild has 4 Killing vectors: one timelike (time
translation) and three spacelike (spatial rotations). Kerr has 2
(time, axial rotation). FRW has 6 (translations + rotations within
the spatial slice).

In GA, Killing vectors are the **generators of the isometry group**
of the spacetime, viewed as the Lie algebra of the corresponding
gauge symmetry. Each Killing vector gives a conserved quantity
along geodesics via Noether's theorem.

**Killing bivectors** (or higher-grade Killing tensors) are
analogous objects for higher-rank tensor symmetries — like the
Carter constant of Kerr from [Ch 27](/physics-ga/part-6-gauge-gravity/cylindrical-and-axially-symmetric).

## What we covered

- Coordinate frames in non-Cartesian systems; reciprocal frames
  give Lamé coefficients automatically.
- Spherical and cylindrical vector derivatives recovered.
- Laplacian in curvilinear coordinates from $\nabla\cdot\nabla$.
- Separation of variables: 11 coordinate systems in 3D.
- Angular momentum operator $\hat{L} = -I\hbar\,\mathbf{r}\wedge\nabla$.
- Spherical harmonics from projecting rotor representations.
- Killing vectors / bivectors as isometry generators.

## What's next

[Chapter 30](/physics-ga/part-7-geometric-calculus/directed-integration-and-stokes) —
directed integration and generalized Stokes's theorem. The
fundamental theorem of calculus, Stokes, Gauss, and the
relationship between differentiation and integration in GA.
