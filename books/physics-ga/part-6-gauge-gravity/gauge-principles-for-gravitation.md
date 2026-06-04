---
sidebar_position: 1
title: "Gauge Principles for Gravitation (Overview)"
---

# Gauge Principles for Gravitation

> *Doran-Lasenby §13.* The Lasenby-Doran-Gull gauge-theory gravity
> (GTG) approach. Gravity as gauge fields on flat spacetime, not as
> curved geometry.

General relativity is usually presented as a theory of **curved
spacetime** — Einstein's geodesic equation on a Lorentzian manifold,
Riemannian connection, Ricci tensor. The geometric-algebra
alternative, developed by Lasenby, Doran, and Gull in the 1990s,
reformulates gravity as a **gauge theory** on **flat** spacetime,
with two gauge fields encoding gravitational effects.

Same physics, very different conceptual framing. This Part presents
the GA version.

## 1. Two gauge fields

GTG uses two gauge fields:

- **Position gauge field** $\bar{h}(a)$ — a linear function from
  vectors to vectors. Implements diffeomorphism (general
  coordinate) invariance.
- **Rotation gauge field** $\Omega(a)$ — a bivector-valued
  function of a vector. Implements local Lorentz invariance.

Together these encode the gravitational field. Where general
relativity uses a single metric tensor $g_{\mu\nu}$ to capture
spacetime curvature, GTG uses these two gauge fields on flat
Minkowski spacetime.

> :nerdygoose: GTG's claim is that gravity isn't really about
> curvature — it's about gauge fields. Einstein's curved spacetime
> is a derived picture from the gauge fields, not the
> fundamental description. Both formulations give the same
> experimental predictions; GTG is mathematically and conceptually
> different.

## 2. The position gauge field

For a coordinate map $f : M \to M$, the position gauge field
$\bar{h}(a)$ measures how this map changes vectors:

$$\bar{h}(a;x) = \frac{\partial f(x)}{\partial x}\cdot a$$

For an infinitesimal coordinate change $x \to x + \xi(x)$, the gauge
field shifts by $\delta\bar{h}(a) = a\cdot(\nabla\xi)$. This is
the GA-native form of **diffeomorphism invariance**.

The **metric** that an observer sees is encoded by $\bar{h}$:

$$g(a, b) = \bar{h}(a) \cdot \bar{h}(b)$$

— and from this metric, the standard Levi-Civita connection and
Ricci tensor can be reconstructed. So if you want to translate
between GTG and conventional GR, the bridge is via $\bar{h}$.

## 3. The rotation gauge field

The rotation gauge field $\Omega(a)$ encodes how vectors are
parallel-transported. For a vector field $b$ being transported
along direction $a$:

$$\delta_a b = a\cdot\nabla b - \tfrac{1}{2}[\Omega(a), b]$$

The first term is the partial derivative; the second is the
**rotational correction** from the gauge field. The bivector
$\Omega(a)$ is what makes the directional derivative covariant.

This is the **GA covariant derivative**:

$$D_a b := a\cdot\nabla b - \tfrac{1}{2}[\Omega(a), b]$$

For a multivector $M$ of mixed grade, the covariant derivative
extends the same way — bivector commutators with $\Omega(a)$ act
on each grade.

> :mathgoose: The rotation gauge field is the GA realization of
> the **Lorentz spin connection** from differential geometry. In
> tensor notation, the spin connection $\omega_\mu{}^{ab}$ has
> three indices and lives in a separate "tetrad" framework. In
> GA, $\Omega(a)$ is just a bivector-valued function of a vector
> — one object, with the algebra doing the index work.

## 4. The field strength: gravitational curvature

For an Abelian gauge field (like EM), the field strength is
$\nabla\wedge A$. For non-Abelian gauge fields (Yang-Mills),
$F = dA - A\wedge A$ — there's an extra non-linear term.

In GTG, the gravitational field strength is

$$\mathcal{R}(a\wedge b) = D_a\Omega(b) - D_b\Omega(a) - \Omega([a, b])$$

with $[a, b]$ the Lie bracket. This is a bivector-valued function
of bivectors — the **Riemann curvature tensor** in GA form.

The number of independent components: in 4D, $\mathcal{R}$ is a
linear function from 6-dimensional bivector space to itself, so
$6\times 6 = 36$ a priori. Symmetries reduce this to **20**
independent components — the standard count for Riemann curvature
in 4D.

## 5. The Ricci tensor and scalar

From the Riemann curvature, the **Ricci tensor** is

$$\mathcal{R}(a) := \mathcal{R}(\gamma^\mu\wedge a)\cdot\gamma_\mu$$

— a contraction over one slot. The Ricci tensor is a vector-valued
function of a vector, i.e., a rank-(1,1) linear map.

The **Ricci scalar** is the further trace:

$$\mathcal{R} := \gamma^\mu \cdot \mathcal{R}(\gamma_\mu)$$

This is the same Ricci scalar as Einstein's. The whole GR
machinery — Riemann, Ricci, scalar curvature — is reproduced from
GTG's gauge fields with one-to-one correspondence.

## 6. The Einstein field equations

The action for GTG is the Einstein-Hilbert action plus matter:

$$S = \frac{1}{16\pi G}\int \mathcal{R}\, |h|\,d^4 x + S_{\rm matter}$$

with $|h| = \det\bar{h}$ the determinant of the position gauge
field. Varying with respect to $\bar{h}$ and $\Omega$:

$$\boxed{\; \mathcal{G}(a) = \frac{8\pi G}{c^4}\,\mathcal{T}(a) \;}$$

— **Einstein's field equations** in GA form, where $\mathcal{G}$
is the **Einstein tensor** (Ricci minus half the scalar) and
$\mathcal{T}$ is the matter stress-energy. Same content as
Einstein's $G_{\mu\nu} = 8\pi G T_{\mu\nu}/c^4$, but the GA form
has $\mathcal{G}$ as a vector-valued function of a vector — clean,
basis-free.

## 7. The geodesic equation in GTG

A free-falling particle's worldline satisfies

$$D_v v = 0 \quad\Leftrightarrow\quad v\cdot\nabla v - \tfrac{1}{2}[\Omega(v), v] = 0$$

The first term is the flat-spacetime motion; the second is the
gravitational coupling. In tensor language, the same equation
becomes

$$\dot{v}^\mu + \Gamma^\mu_{\nu\rho} v^\nu v^\rho = 0$$

with $\Gamma^\mu_{\nu\rho}$ the Christoffel symbols. GA's
$\Omega(v)$ packages the Christoffel data as a single bivector
function.

> :surprisedgoose: The Christoffel symbol $\Gamma^\mu_{\nu\rho}$
> has 3 lower indices and is symmetric in 2 of them — total of
> $4 \cdot 10 = 40$ components in 4D. The GA bivector field
> $\Omega(a)$ also has 6 bivector × 4 vector components = 24,
> with 4 redundancies from antisymmetry — same effective 20
> components. The data is equivalent; the GA representation
> exposes the rotational nature of parallel transport more
> directly.

## 8. The equivalence principle

Einstein's **equivalence principle**: locally, gravity is
indistinguishable from acceleration. The strong form: every
local experiment in a freely-falling frame gives the same result
as in flat spacetime.

In GTG, the equivalence principle is **built into the gauge
structure** — local Lorentz invariance (the $\Omega(a)$ gauge
freedom) ensures that locally, the gauge can be set to zero and
the local physics is flat-spacetime physics.

More mathematically: for any spacetime point $x_0$, there's a
choice of $\bar{h}$ and $\Omega$ such that locally $\bar{h}$ is
the identity and $\Omega = 0$ near $x_0$. This is the GA version
of "**locally inertial frames** exist."

The equivalence principle isn't a separate postulate in GTG — it's
a consequence of the gauge structure. Conceptually cleaner than
the conventional formulation.

## 9. Comparison with curved-spacetime GR

The bridge between GTG and conventional GR:

| GR concept | GTG equivalent |
|---|---|
| Metric $g_{\mu\nu}$ | $\bar{h}(a)\cdot\bar{h}(b)$ |
| Connection $\Gamma$ | $\Omega(a)$ bivector field |
| Covariant derivative $\nabla_\mu$ | $D_a = a\cdot\nabla - \tfrac{1}{2}[\Omega(a),\cdot]$ |
| Riemann $R^\mu{}_{\nu\rho\sigma}$ | $\mathcal{R}(a\wedge b)$ bivector function |
| Ricci $R_{\mu\nu}$ | $\mathcal{R}(a)$ vector-valued |
| Ricci scalar $R$ | $\mathcal{R}$ scalar |
| Einstein $G_{\mu\nu}$ | $\mathcal{G}(a)$ vector-valued |
| Stress-energy $T_{\mu\nu}$ | $\mathcal{T}(a)$ vector-valued |
| Field equations | $\mathcal{G}(a) = 8\pi G \mathcal{T}(a)/c^4$ |

GTG is **mathematically equivalent** to GR (same solutions, same
predictions). The differences are conceptual:

- GTG works on flat spacetime; curvature is encoded in gauge
  fields.
- GTG has manifestly Lorentz-covariant equations from the start.
- GTG handles spinors and gauge theory more naturally — important
  for unified Standard Model + gravity work.

> :angrygoose: GTG is **not** in any standard GR textbook, despite
> being equivalent to GR and (arguably) conceptually cleaner. The
> Lasenby-Doran-Gull approach is well-known in GA circles but
> hasn't broken into mainstream GR pedagogy. Either it will
> eventually, or there's some flaw I'm missing, but in the
> meantime: D-L Ch 13-14 is the canonical reference.

## What we covered

- GTG uses two gauge fields on flat spacetime: position $\bar{h}$
  and rotation $\Omega$.
- $\bar{h}$ encodes diffeomorphism invariance; the metric is
  $g(a,b) = \bar{h}(a)\cdot\bar{h}(b)$.
- $\Omega$ encodes local Lorentz invariance; covariant derivative
  $D_a = a\cdot\nabla - \tfrac{1}{2}[\Omega(a),\cdot]$.
- Riemann curvature $\mathcal{R}(B) = D\Omega - \Omega\wedge\Omega$
  is a bivector-valued function of bivectors.
- Ricci tensor and scalar follow by contractions.
- Einstein's equation: $\mathcal{G}(a) = 8\pi G\mathcal{T}(a)/c^4$.
- Equivalence principle is built into the gauge structure.

## What's next

[Chapter 24](/physics-ga/part-6-gauge-gravity/gravitational-field-equations) —
the gravitational field equations spelled out, with derivations of
the vacuum and matter cases. Then on to specific solutions:
Schwarzschild, cosmology, and axially-symmetric systems.
