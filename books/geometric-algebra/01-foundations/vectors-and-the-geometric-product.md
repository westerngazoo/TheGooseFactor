---
sidebar_position: 1
title: "Vectors & the Geometric Product"
---

# Vectors & the Geometric Product

## The Setup

Start with a real vector space $V$ over $\mathbb{R}$. We want a **single product** on vectors that captures both magnitude and direction relationships — not two separate operations duct-taped together.

> :angrygoose: In standard linear algebra you get the dot product and the cross product as completely separate tools with different output types. One gives a scalar, the other gives a vector (but only in 3D). The geometric product fixes this by being one operation that encodes both.

## The Geometric Product

For two vectors **a** and **b**, define the **geometric product** **ab** by two axioms:

### Axiom 1: Associativity

```math
(\mathbf{ab})\mathbf{c} = \mathbf{a}(\mathbf{bc})
```

### Axiom 2: The Contraction Rule

```math
\mathbf{a}^2 = \mathbf{a}\mathbf{a} = |\mathbf{a}|^2 \in \mathbb{R}
```

The square of any vector is a scalar — its squared magnitude. This single rule is where all the magic comes from.

> :surprisedgoose: Two axioms. That's it. Associativity and contraction. Everything else — the dot product, the wedge product, bivectors, rotors — falls out of just these two rules. The economy here is insane.

## What Falls Out

From just these axioms, consider two vectors and expand $(\mathbf{a} + \mathbf{b})^2$:

```math
(\mathbf{a} + \mathbf{b})^2 = \mathbf{a}^2 + \mathbf{ab} + \mathbf{ba} + \mathbf{b}^2
```

The left side is a scalar (by Axiom 2). So:

```math
|\mathbf{a} + \mathbf{b}|^2 = |\mathbf{a}|^2 + \mathbf{ab} + \mathbf{ba} + |\mathbf{b}|^2
```

This means **ab + ba** must be a scalar:

```math
\mathbf{ab} + \mathbf{ba} = 2\,\mathbf{a} \cdot \mathbf{b}
```

So the **symmetric part** of the geometric product is the dot product. What about the antisymmetric part?

> :mathgoose: This derivation is worth internalizing. We didn't define the dot product — it emerged from the axioms. The symmetric part of the geometric product *is* the dot product. The antisymmetric part is something new: the wedge product. One product, two pieces, zero extra assumptions.

## Decomposition

```math
\mathbf{ab} = \frac{1}{2}(\mathbf{ab} + \mathbf{ba}) + \frac{1}{2}(\mathbf{ab} - \mathbf{ba})
```

The symmetric half is the dot product (a scalar), and the antisymmetric half is the wedge product (a bivector):

```math
\mathbf{ab} = \mathbf{a} \cdot \mathbf{b} + \mathbf{a} \wedge \mathbf{b}
```

One product, two pieces:
- **Dot product** $\mathbf{a} \cdot \mathbf{b}$: scalar, measures alignment
- **Wedge product** $\mathbf{a} \wedge \mathbf{b}$: bivector, measures the oriented plane they span

> :happygoose: This is the fundamental equation of geometric algebra. Memorize it, tattoo it, whatever you need to do. Every single thing we build from here — reflections, rotations, projections — traces back to this decomposition.

## Key Consequences

**Parallel vectors commute:**
If **a** is parallel to **b**, then their wedge product is zero, so **ab** = **a** · **b** (a scalar).

**Perpendicular vectors anticommute:**
If **a** is perpendicular to **b**, then their dot product is zero, so **ab** = **a** ∧ **b** and **ab** = −**ba**.

**Every nonzero vector has an inverse:**

```math
\mathbf{a}^{-1} = \frac{\mathbf{a}}{|\mathbf{a}|^2}
```

> :nerdygoose: Vector inverses. In standard linear algebra, vectors don't have multiplicative inverses — division by a vector is undefined. In GA, it's trivial. This is what makes reflections and rotations expressible as algebraic equations you can manipulate like regular arithmetic.

## Basis Vectors

For an orthonormal basis **e**₁, **e**₂, **e**₃:

```math
\mathbf{e}_i^2 = 1 \qquad \mathbf{e}_i \mathbf{e}_j = -\mathbf{e}_j \mathbf{e}_i \;\;(i \neq j)
```

Orthonormal basis vectors square to 1 and anticommute with each other. These are the building blocks for everything that follows.

> :sarcasticgoose: "But this looks like the Pauli matrices!" Yes. Pauli matrices are a matrix representation of the 3D geometric algebra. Physicists discovered the algebra through matrices and called it "spinor algebra." Mathematicians called it "Clifford algebra." GA people call it by what it actually does — geometry. Same thing, three communities, zero communication for decades.

## Connecting to What You Know

| GA concept | Classical equivalent |
|---|---|
| dot product | Dot product (identical) |
| wedge product | Related to cross product, but lives in the plane, not perpendicular to it |
| geometric product | No direct classical analogue — this is the new thing |
| vector inverse | No classical equivalent for vectors |
