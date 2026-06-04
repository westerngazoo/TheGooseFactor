---
sidebar_position: 4
title: "Embedded Surfaces and Vector Manifolds"
---

# Embedded Surfaces and Vector Manifolds

> *Doran-Lasenby §6.7–6.8.* Intrinsic vs extrinsic geometry in GA.
> Surfaces, manifolds, the second fundamental form, and how GA
> realizes the standard differential-geometry machinery.

A surface in $\mathbb{R}^3$ has two kinds of geometry: **intrinsic**
(the geometry a 2D inhabitant would observe — distances along the
surface) and **extrinsic** (how the surface bends within the
ambient 3D space). In GA, both are captured by the same
multivector field with no separate intrinsic / extrinsic machinery.

## 1. Tangent and normal spaces

For a 2D surface $S$ embedded in $\mathbb{R}^3$, at each point
$p \in S$:

- The **tangent bivector** $T_p$ is the unique unit bivector
  in the tangent plane (up to sign).
- The **unit normal vector** $\hat{n}_p = T_p I$ (dual of the
  tangent bivector with the 3D pseudoscalar).

The tangent and normal carry equivalent information; they're
related by Hodge duality through the ambient pseudoscalar.

For higher-dimensional submanifolds, the tangent space is a
$k$-blade and the normal is an $(n-k)$-blade, both at each point.

## 2. Vector manifolds

A **vector manifold** is the GA-native notion of a manifold: a
subset $M \subset \mathbb{R}^n$ together with a smooth $k$-blade
field $I_M(x)$ giving the tangent $k$-blade at each point $x \in M$.

The blade $I_M$ encodes both the **dimensionality** ($k$) and the
**orientation** of $M$ at each point. It's the GA realization of
the "$k$-dimensional oriented manifold" of differential geometry.

For a 2D surface in 3D, $I_M$ is a bivector. For a curve, it's a
unit tangent vector. For 4D spacetime, the whole STA pseudoscalar
$I$ is the constant tangent 4-blade.

## 3. The first and second fundamental forms

**First fundamental form** (intrinsic geometry): for tangent
vectors $a, b$ at a point of $M$:

$$g(a, b) = a\cdot b$$

— just the inner product, restricted to tangent vectors. This is
the **induced metric** on the surface.

**Second fundamental form** (extrinsic geometry): for tangent
vectors $a, b$ at the surface:

$$\Pi(a, b) = \hat{n}\cdot(a\cdot\nabla b)$$

— the normal component of the "rate of change" of $b$ along $a$.
This is the GA realization of the second fundamental form from
differential geometry.

In conventional notation, the second fundamental form is the
$3\times 3$ symmetric matrix of normal components of second
derivatives. In GA, it's a symmetric scalar-valued bilinear
function on tangent vectors — same information, different
packaging.

## 4. Curvature

For a 2D surface, the **Gaussian curvature** at a point is

$$K = \det(\Pi) / \det(g)$$

— the ratio of fundamental forms. For a sphere of radius $R$,
$K = 1/R^2$. For a plane, $K = 0$. For a saddle, $K < 0$.

**Theorema Egregium** (Gauss, 1827): the Gaussian curvature is
**intrinsic** — it can be computed from the metric $g$ alone,
without reference to any embedding. This is non-obvious from the
definition $K = \det(\Pi)/\det(g)$, which uses the extrinsic
$\Pi$.

In GA, the intrinsic-vs-extrinsic puzzle resolves: the
**Riemann curvature** $R(B)$ from [Ch 23](/physics-ga/part-6-gauge-gravity/gauge-principles-for-gravitation)
is intrinsic, and it equals $K \cdot I_M$ (for 2D surfaces) — the
Gaussian curvature times the tangent blade. So $K$ is intrinsic
because $R$ is intrinsic, even though we computed it via the
extrinsic $\Pi$.

> :surprisedgoose: Theorema Egregium is the "remarkable theorem"
> in Latin. It says that a 2D inhabitant of a curved surface can
> determine the Gaussian curvature **without** looking up into
> the third dimension. Gauss proved this in 1827 by a 50-page
> calculation; the GA version comes from $R(B) = K I_M$ in one
> line.

## 5. The covariant derivative on a surface

For a tangent vector field $v$ on $M$, the **intrinsic covariant
derivative** is

$$D_a v := P_M(a\cdot\nabla v)$$

— the projection of the ambient derivative onto the tangent
space. The projection operator $P_M$ takes any vector and removes
its normal component.

This is the GA realization of the **Levi-Civita connection** on
a Riemannian manifold. It's automatically torsion-free and metric-
compatible.

For curves on the surface: the covariant derivative gives the
**parallel transport** of vectors along the curve. A geodesic is a
curve along which the tangent vector is parallel-transported.

## 6. Geodesics on surfaces

A **geodesic** $\gamma(\tau)$ on $M$ satisfies

$$D_{\dot\gamma}\dot\gamma = 0$$

— the tangent vector is parallel-transported along the curve.
In tensor language: $\ddot{x}^\mu + \Gamma^\mu_{\nu\rho}\dot{x}^\nu\dot{x}^\rho = 0$
(the geodesic equation with Christoffel symbols).

In GA: $P_M(\ddot\gamma) = 0$ — the tangential part of the
acceleration is zero. Any normal component is allowed; it
represents the **constraint force** keeping the curve on $M$.

For a sphere, geodesics are **great circles**. For a flat plane,
they're straight lines. For a cylinder, they're helices (locally
straight lines in the unrolled picture).

## 7. The Gauss-Bonnet theorem

For a closed 2D surface $S$:

$$\boxed{\; \int_S K\,dA = 2\pi\chi(S) \;}$$

where $\chi(S)$ is the **Euler characteristic** of the surface —
a topological invariant.

- **Sphere**: $\chi = 2$, $K = 1/R^2$, $A = 4\pi R^2$. Check:
  $\int K\,dA = 4\pi = 2\pi \cdot 2$. ✓
- **Torus**: $\chi = 0$, $\int K\,dA = 0$. The torus has both
  positive (outer) and negative (inner) curvature regions that
  cancel.
- **Genus-$g$ surface**: $\chi = 2 - 2g$, $\int K\,dA = 4\pi(1-g)$.

This is the simplest **index theorem** — integrating local
geometry over a closed manifold gives a topological invariant.
GA's directed-integration framework gives the proof cleanly.

> :nerdygoose: Gauss-Bonnet is the "baby" Atiyah-Singer: a local
> geometric quantity ($K$) integrates over a closed manifold to a
> topological invariant ($\chi$). It's the prototype for all
> later index theorems. GA's directed-integration framework
> handles this cleanly via the fundamental theorem of geometric
> calculus.

## 8. Embedded curves and the Frenet frame

For a curve $\gamma(s)$ in 3D parameterized by arc length:

- $\mathbf{t}(s) = \dot\gamma$ — the **unit tangent**.
- $\dot{\mathbf{t}}(s) = \kappa(s)\,\mathbf{n}(s)$ — the **curvature**
  $\kappa$ and **principal normal** $\mathbf{n}$.
- $\mathbf{b}(s) = \mathbf{t}\wedge\mathbf{n}$ — the **binormal**
  (bivector or vector via duality).

The **Frenet-Serret equations** describe how the Frenet frame
$(\mathbf{t}, \mathbf{n}, \mathbf{b})$ evolves along the curve:

$$\dot{\mathbf{t}} = \kappa\mathbf{n}, \quad \dot{\mathbf{n}} = -\kappa\mathbf{t} + \tau\mathbf{b}, \quad \dot{\mathbf{b}} = -\tau\mathbf{n}$$

with $\tau$ the **torsion** of the curve. In matrix form:

$$\frac{d}{ds}\begin{pmatrix}\mathbf{t}\\\mathbf{n}\\\mathbf{b}\end{pmatrix} = \begin{pmatrix}0 & \kappa & 0\\ -\kappa & 0 & \tau\\ 0 & -\tau & 0\end{pmatrix}\begin{pmatrix}\mathbf{t}\\\mathbf{n}\\\mathbf{b}\end{pmatrix}$$

In GA, the Frenet frame is a **rotor**-valued function $R(s)$,
and its derivative is

$$\dot{R} = \tfrac{1}{2}\Omega(s) R$$

with $\Omega(s) = -\kappa\,\mathbf{t}\wedge\mathbf{n} - \tau\,\mathbf{n}\wedge\mathbf{b}$
— a bivector encoding both curvature and torsion. Same machinery
as rigid-body kinematics ([Ch 7](/physics-ga/part-2-classical-mechanics/rigid-body-dynamics-with-rotors)).

The fundamental theorem of curve theory: $\kappa(s)$ and $\tau(s)$
together determine the curve up to rigid motion. In GA, this says
the rotor $R(s)$ is determined by the bivector $\Omega(s)$ — a
straightforward consequence of the rotor evolution equation.

## What we covered

- Tangent and normal blades; vector manifolds carry a smooth
  $k$-blade field $I_M$.
- First fundamental form $g(a,b) = a\cdot b$ (intrinsic metric).
- Second fundamental form $\Pi(a,b) = \hat{n}\cdot(a\cdot\nabla b)$
  (extrinsic curvature).
- Gaussian curvature $K = \det\Pi/\det g$; Theorema Egregium.
- Covariant derivative $D_a v = P_M(a\cdot\nabla v)$.
- Geodesics satisfy $P_M(\ddot\gamma) = 0$.
- Gauss-Bonnet: $\int K\,dA = 2\pi\chi$.
- Frenet frame as a rotor; $\dot{R} = \tfrac{1}{2}\Omega R$ with
  $\Omega = -\kappa\,\mathbf{t}\wedge\mathbf{n} - \tau\,\mathbf{n}\wedge\mathbf{b}$.

## What's next

[Chapter 32](/physics-ga/part-7-geometric-calculus/conformal-geometry-preview) —
conformal geometric algebra. A higher-dimensional embedding that
makes translations and dilations into rotors, just like rotations.
The starting point for conformal-CGA applications in robotics and
computer graphics.
