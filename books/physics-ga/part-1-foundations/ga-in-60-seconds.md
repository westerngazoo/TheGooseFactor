---
sidebar_position: 1
title: "GA in 60 Seconds (For the Physics Audience)"
---

# GA in 60 Seconds (For the Physics Audience)

> *Doran-Lasenby §1.1–1.3 condensed.* The minimum vocabulary you need
> to read the rest of this book. If you already know the geometric
> product and what a bivector is, skim to the cheat sheet at the
> bottom.

A physicist's working summary of geometric algebra. Everything in this
chapter generalizes to spacetime in [Part III](/physics-ga/part-3-spacetime-algebra/sta-basis-and-signature),
but here we stay in Euclidean 3D so the picture is concrete.

## 1. The one rule

Pick an orthonormal basis $\{e_1, e_2, e_3\}$ for $\mathbb{R}^3$.
Geometric algebra adds **one** new operation — the **geometric
product** — defined by the rule

$$\boxed{\; e_i^2 = +1, \qquad e_i e_j = -e_j e_i \;\;(i \ne j) \;}$$

That's it. Same-vector squares to $+1$; different vectors anticommute.
Everything else is a consequence.

> :nerdygoose: This is the Clifford algebra $\mathcal{Cl}(3,0)$ in
> textbook notation. The signature $(p,q)$ counts how many basis
> vectors square to $+1$ vs $-1$. Spacetime algebra in [Part III](/physics-ga/part-3-spacetime-algebra/sta-basis-and-signature)
> is $\mathcal{Cl}(1,3)$ with one $+$ and three $-$.

## 2. Multiplying two vectors

For two vectors $a = a^i e_i$ and $b = b^i e_i$, expand the product
and apply the rule:

$$ab = (a^i e_i)(b^j e_j) = \underbrace{a^i b^i}_{\text{scalar}} + \underbrace{\sum_{i<j}(a^i b^j - a^j b^i)\,e_i e_j}_{\text{bivector}}$$

The product splits cleanly into two pieces:

- A **scalar part** — exactly the dot product $a \cdot b$.
- A **bivector part** — antisymmetric in $a$ and $b$, indexed by
  pairs $(i,j)$. This is the **wedge product** $a \wedge b$.

So for any two vectors:

$$\boxed{\; ab = a \cdot b + a \wedge b \;}$$

The geometric product **packs the dot product and the wedge product
into one object**. Dot is symmetric, wedge is antisymmetric; their
sum is neither, but it remembers both.

> :happygoose: This is the move. One product that carries both
> projection (dot) and span (wedge) information simultaneously.
> Every other operation in GA is downstream of this one
> decomposition.

## 3. The four grades

Multiplying vectors and taking sums generates a graded algebra of
dimension $2^3 = 8$:

| Grade | Name | Dimension | Basis |
|---|---|---|---|
| 0 | scalar | 1 | $1$ |
| 1 | vector | 3 | $e_1, e_2, e_3$ |
| 2 | bivector | 3 | $e_{12}, e_{13}, e_{23}$ |
| 3 | trivector (pseudoscalar) | 1 | $I = e_1 e_2 e_3$ |

A general element — a **multivector** — is a sum across all grades:

$$M = \alpha + a^i e_i + b^{ij} e_i e_j + \gamma I$$

The bivectors $e_{ij} := e_i e_j$ satisfy $e_{ij}^2 = -1$. They are
the algebra's "imaginary units" — and there are three of them,
one for each spatial plane.

The pseudoscalar $I = e_1 e_2 e_3$ satisfies $I^2 = -1$ in 3D, and
it commutes with every vector. It will reappear constantly: $I$ is
the volume element, the orientation of space, and the duality
operator all at once.

> :surprisedgoose: A 3D rotation has 3 degrees of freedom. There
> are 3 bivectors. Rotations live on the bivectors, not on the
> vectors. The cross product was always a fake — a 3D-only
> stand-in for "the bivector dual to this plane."

## 4. Rotors and the sandwich

Define a **rotor** by exponentiating half a bivector:

$$R = \exp(B/2)$$

where $B$ is a bivector (so $B^2$ is a negative scalar and the
exponential converges as a sine/cosine series).

The rotor acts on any vector by the **sandwich product**:

$$v \mapsto R\, v \,R^{-1} = R\, v\, \tilde{R}$$

where $\tilde{R}$ (the **reverse**) flips the order of products in
$R$ and satisfies $R\tilde{R} = 1$ for a unit rotor.

This single operation does:

- Reflect a vector through a hyperplane (when $R$ is itself a unit
  vector).
- Rotate a vector by an angle $\theta = |B|$ in the plane defined by
  the bivector $B$.
- Compose rotations by multiplying rotors: $R_2 R_1$.
- Generalize to higher dimensions and to spacetime without any code
  changes — the sandwich works identically in $\mathcal{Cl}(p,q)$.

> :mathgoose: $R = \exp(B/2)$, not $\exp(B)$. The half-angle is what
> the sandwich applies twice — once on each side — to recover the
> full rotation $\theta$. This is the same double-cover that gives
> quaternions their $\pm q$ ambiguity. In GA you see it
> algebraically: a $2\pi$ rotation sends $R \to -R$, but
> $RvR^{-1}$ comes back to $v$ at $2\pi$, so the geometry is
> single-valued.

## 5. Inner, outer, and geometric products

The geometric product factors any operation into algebraic pieces:

- **Inner product** $\langle ab \rangle_0 = a \cdot b$ — extracts
  the scalar part. Returns 0 if $a \perp b$.
- **Outer product** $a \wedge b$ — extracts the bivector part.
  Returns 0 if $a \parallel b$.
- **Geometric product** $ab$ — the sum.

For higher-grade multivectors the inner and outer products
generalize, but their defining property stays the same: $a \cdot M_k$
lowers the grade by 1, $a \wedge M_k$ raises it by 1.

For a vector $a$ and a $k$-blade $A_k$:

$$a A_k = a \cdot A_k + a \wedge A_k, \qquad \langle a A_k \rangle_{k-1} = a \cdot A_k$$

This grade-lowering / grade-raising structure is the engine behind
the "$\nabla \cdot F$ + $\nabla \wedge F$" decomposition of
[Maxwell's equations](/physics-ga/part-4-electromagnetism/maxwell-equations).

## 6. Duality via the pseudoscalar

Multiplying by $I$ takes any blade to its complement:

$$\star A_k = A_k I$$

In 3D this maps:

- $e_1 \;\to\; e_1 I = e_2 e_3$ (vector $\to$ bivector dual)
- $e_{12} \;\to\; e_{12} I = -e_3$ (bivector $\to$ vector dual)

This recovers the cross product as a derived notion:

$$a \times b := -I (a \wedge b) = \star(a \wedge b)$$

The cross product is the 3D-only **dual of the wedge**. It vanishes
in higher dimensions because the wedge product of two vectors is
still a bivector, but a bivector in 4D is no longer dual to a
vector — it's dual to a bivector.

> :angrygoose: The cross product was always GA's wedge in disguise,
> wearing the pseudoscalar as a mask. Generations of physicists
> learned "torque is $\mathbf{r} \times \mathbf{F}$" without being
> told that $\mathbf{r} \wedge \mathbf{F}$ is the actual bivector
> object — and that the bivector formulation generalizes to
> relativistic mechanics, while the cross product does not.

## 7. The full algebraic content of 3D GA

Pulling it together, $\mathcal{Cl}(3,0)$ has 8 real dimensions
broken across 4 grades. Every multivector $M$ can be written

$$M = \alpha + \mathbf{a} + B + \beta I$$

where $\alpha, \beta$ are real, $\mathbf{a}$ is a vector, and $B$
is a bivector. The geometric product of two such multivectors
produces another multivector, and the grade structure is preserved
under sums and is graded under products.

Two facts to memorize:

1. **The even subalgebra** $\{\alpha + B\}$ — scalars plus bivectors
   — is **isomorphic to the quaternions** $\mathbb{H}$. The
   bivectors $e_{23}, e_{31}, e_{12}$ play the role of $i, j, k$.
2. The odd part $\{\mathbf{a} + \beta I\}$ — vectors plus
   trivectors — is *not* closed under the geometric product (two
   odd elements multiply to an even one).

Rotors live in the even subalgebra. That's why "rotors are
quaternions" in 3D: they're the same object, written in two
different notations.

> :nerdygoose: In 4D, the even subalgebra is the **biquaternions**
> $\mathbb{H}\otimes\mathbb{C}$, which equals $\mathcal{Cl}(0,2)$.
> In spacetime $\mathcal{Cl}(1,3)$, the even subalgebra is also
> the biquaternions and is isomorphic to the **complex Pauli
> algebra** $\mathcal{Cl}(3,0)\otimes\mathbb{C}$. The same Lie
> group $\mathrm{Spin}(1,3) \cong SL(2,\mathbb{C})$ acts on it.
> Patterns repeat.

## 8. Cheat sheet

For the rest of this book you only need to keep these in your head:

| Symbol | Meaning |
|---|---|
| $a, b$ | vectors |
| $ab$ | geometric product |
| $a \cdot b$ | scalar part of $ab$ |
| $a \wedge b$ | bivector part of $ab$ |
| $B$ | a bivector |
| $I$ | the pseudoscalar; $I^2 = -1$ in 3D, $I^2 = -1$ in $\mathcal{Cl}(1,3)$ too |
| $R = \exp(B/2)$ | a rotor |
| $\tilde{R}$ | reverse of $R$; $R\tilde{R} = 1$ for unit rotors |
| $RvR^{-1}$ | the sandwich — rotates $v$ in the plane $B$ |
| $\langle M \rangle_k$ | grade-$k$ part of $M$ |
| $\nabla = e^i\partial_i$ | the vector derivative (Ch 28) |

Everything else in physics-ga is built on this.

> :weightliftinggoose: Memorize the box equations: $ab = a\cdot b + a\wedge b$,
> $R = \exp(B/2)$, $v \mapsto RvR^{-1}$, $\star A = AI$. Once these
> are reflex, the rest of Doran-Lasenby reads in third gear.

## What we covered

- The single defining rule: $e_i^2 = +1$, $e_i e_j = -e_j e_i$.
- The geometric product splits any vector product into a scalar
  (dot) and a bivector (wedge) part.
- 3D GA has 8 dimensions across grades 0, 1, 2, 3.
- Rotations are rotors acting via the sandwich product.
- The cross product is the dual of the wedge — a 3D-only convenience.
- The even subalgebra is the quaternions.

## What's next

[Chapter 2](/physics-ga/part-1-foundations/reflections-rotations-and-the-sandwich)
shows how reflections compose into rotations and why the sandwich
form is forced on us by the geometry. Then [Chapter 3](/physics-ga/part-1-foundations/frames-components-and-tensor-free-linear-algebra)
re-does linear algebra without index notation — the bridge to
Doran-Lasenby's coordinate-free style used throughout Parts II-VII.
