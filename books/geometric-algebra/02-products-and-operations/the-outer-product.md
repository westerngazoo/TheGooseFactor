---
sidebar_position: 1
title: "The Outer (Wedge) Product"
---

# The Outer (Wedge) Product

In Foundations, we saw the wedge product pop out of the geometric product as its antisymmetric part. Now we study it on its own — what it does, how it generalizes, and why it's the right tool for describing oriented subspaces.

## Recap: Where We Left Off

For two vectors **a** and **b**, the geometric product splits as:

```math
\mathbf{ab} = \mathbf{a} \cdot \mathbf{b} + \mathbf{a} \wedge \mathbf{b}
```

The wedge product is the antisymmetric piece:

```math
\mathbf{a} \wedge \mathbf{b} = \frac{1}{2}(\mathbf{ab} - \mathbf{ba})
```

It produces a **bivector** — an oriented plane segment. But where do we go from two vectors? What happens when we wedge three? Four? And what exactly *is* a bivector, beyond "a thing with grade 2"?

## Antisymmetry: The Defining Property

The most important property of the wedge product:

```math
\mathbf{a} \wedge \mathbf{b} = -\mathbf{b} \wedge \mathbf{a}
```

Swapping the order flips the sign. This has an immediate consequence — wedge a vector with itself:

```math
\mathbf{a} \wedge \mathbf{a} = -\mathbf{a} \wedge \mathbf{a}
```

The only thing equal to its own negative is zero:

```math
\mathbf{a} \wedge \mathbf{a} = 0
```

> :mathgoose: This is the algebraic statement of a geometric fact: a single vector doesn't span a plane. You need two linearly independent vectors to define an oriented area. If both vectors point the same direction, the "parallelogram" they span has zero area.
>
> :nerdygoose: If you've worked with determinants, this should ring a bell. A matrix with two identical rows has determinant zero. The wedge product is the determinant's geometric cousin — same antisymmetry, same linear dependence detector, but it gives you the geometric object (the plane) instead of just a number.

## What a Bivector Looks Like

Let's compute a concrete bivector. Take two vectors in 3D:

```math
\mathbf{a} = 2\mathbf{e}_1 + 3\mathbf{e}_2
```

```math
\mathbf{b} = \mathbf{e}_1 + 4\mathbf{e}_2
```

Now wedge them. The wedge product is bilinear (distributes over addition and scalar multiplication), so we expand:

```math
\mathbf{a} \wedge \mathbf{b} = (2\mathbf{e}_1 + 3\mathbf{e}_2) \wedge (\mathbf{e}_1 + 4\mathbf{e}_2)
```

Distribute:

```math
= 2\mathbf{e}_1 \wedge \mathbf{e}_1 + 8\mathbf{e}_1 \wedge \mathbf{e}_2 + 3\mathbf{e}_2 \wedge \mathbf{e}_1 + 12\mathbf{e}_2 \wedge \mathbf{e}_2
```

Apply our rules — self-wedge is zero, swapping flips the sign:

```math
= 2(0) + 8\mathbf{e}_{12} + 3(-\mathbf{e}_{12}) + 12(0)
```

```math
= (8 - 3)\mathbf{e}_{12} = 5\mathbf{e}_{12}
```

The result is a single bivector: 5 times the unit bivector **e**₁₂. The coefficient 5 is the signed area of the parallelogram spanned by **a** and **b**.

> :surprisedgoose: That coefficient — 5 — is exactly the 2×2 determinant of the components: (2)(4) − (3)(1) = 5. The wedge product *is* the determinant, geometrified. But instead of just getting the number 5, you get 5**e**₁₂, which tells you *which plane* the area lives in. In higher dimensions with multiple planes available, that distinction matters.

## Bilinearity: The Distribution Rules

The wedge product distributes over addition and pulls out scalars, just like any good product:

**Distributivity:**

```math
\mathbf{a} \wedge (\mathbf{b} + \mathbf{c}) = \mathbf{a} \wedge \mathbf{b} + \mathbf{a} \wedge \mathbf{c}
```

```math
(\mathbf{a} + \mathbf{b}) \wedge \mathbf{c} = \mathbf{a} \wedge \mathbf{c} + \mathbf{b} \wedge \mathbf{c}
```

**Scalar factoring:**

```math
(\alpha \mathbf{a}) \wedge \mathbf{b} = \mathbf{a} \wedge (\alpha \mathbf{b}) = \alpha (\mathbf{a} \wedge \mathbf{b})
```

These aren't extra axioms — they follow from the geometric product's bilinearity. But they're essential for computation.

> :sharpgoose: Bilinearity is what makes the wedge product computable. You expand into basis vectors, apply the antisymmetry rules, and collect terms. It's mechanical — like expanding a polynomial. Every wedge product computation reduces to this: distribute, kill self-wedges, sort basis vectors (picking up signs on swaps).

## Extending to Three Vectors: The Trivector

What happens when we wedge three vectors? Let's build it step by step.

```math
\mathbf{a} \wedge \mathbf{b} \wedge \mathbf{c}
```

This is defined as: take the bivector **a** ∧ **b**, then wedge it with the vector **c**. The result is a **trivector** — a grade-3 object representing an oriented volume.

Let's compute in 3D with basis vectors:

```math
\mathbf{e}_1 \wedge \mathbf{e}_2 \wedge \mathbf{e}_3
```

We already know **e**₁ ∧ **e**₂ = **e**₁₂. Now:

```math
\mathbf{e}_{12} \wedge \mathbf{e}_3 = \mathbf{e}_{123}
```

This is the **pseudoscalar** — the unit oriented volume in 3D.

**Antisymmetry still holds**, now for any pair:

```math
\mathbf{a} \wedge \mathbf{b} \wedge \mathbf{c} = -\mathbf{b} \wedge \mathbf{a} \wedge \mathbf{c} = -\mathbf{a} \wedge \mathbf{c} \wedge \mathbf{b}
```

And if any two vectors are the same (or linearly dependent), the whole thing is zero:

```math
\mathbf{a} \wedge \mathbf{a} \wedge \mathbf{c} = 0
```

```math
\mathbf{a} \wedge \mathbf{b} \wedge (2\mathbf{a} + 3\mathbf{b}) = 0
```

> :mathgoose: The pattern is clean. Wedging k vectors gives a grade-k object — a k-blade. It's zero whenever the vectors are linearly dependent. The magnitude is the k-dimensional volume of the parallelepiped they span. The orientation encodes the "handedness." Scalars are 0-blades, vectors are 1-blades, bivectors are 2-blades, trivectors are 3-blades.

## A Concrete Trivector Computation

Let's verify that linear dependence kills the trivector. Take:

```math
\mathbf{a} = \mathbf{e}_1, \qquad \mathbf{b} = \mathbf{e}_2, \qquad \mathbf{c} = 3\mathbf{e}_1 + 7\mathbf{e}_2
```

Since **c** is a linear combination of **a** and **b**, these three vectors lie in a plane — they don't span a volume. Let's check:

```math
\mathbf{a} \wedge \mathbf{b} \wedge \mathbf{c} = \mathbf{e}_1 \wedge \mathbf{e}_2 \wedge (3\mathbf{e}_1 + 7\mathbf{e}_2)
```

Distribute:

```math
= 3(\mathbf{e}_1 \wedge \mathbf{e}_2 \wedge \mathbf{e}_1) + 7(\mathbf{e}_1 \wedge \mathbf{e}_2 \wedge \mathbf{e}_2)
```

In the first term, **e**₁ appears twice. In the second, **e**₂ appears twice. Both are zero:

```math
= 3(0) + 7(0) = 0
```

> :happygoose: The wedge product is a perfect linear independence detector. Wedge your vectors together — if the result is zero, they're linearly dependent. If it's nonzero, they're independent, and the result tells you exactly what subspace they span, how much "volume" they enclose, and with what orientation.

## The Embedded Systems Analogy: Bit Flags and Orthogonal Channels

Think of basis bivectors like independent bit flags in a hardware register.

On an STM32, a GPIO port's MODER register has 2-bit fields for each pin. Each pin's mode is independent — setting pin 5 to output doesn't affect pin 3. The modes live in orthogonal "channels."

Bivectors work the same way. In 3D, you have three independent bivector basis elements:

- **e**₁₂ — the xy-plane
- **e**₁₃ — the xz-plane
- **e**₂₃ — the yz-plane

A general bivector is a linear combination of these, just like a register value is a combination of independent bit fields:

```math
B = B_{12}\mathbf{e}_{12} + B_{13}\mathbf{e}_{13} + B_{23}\mathbf{e}_{23}
```

Each coefficient says "how much rotation is happening in that plane." Just like each bit field says "what mode is this pin in."

> :angrygoose: And just like writing to the wrong bit offset in a register corrupts adjacent fields, confusing which plane a rotation is in leads to the wrong axis of rotation. The cross product hides this by giving you an axis vector instead of a plane. GA makes it explicit — the rotation plane is the fundamental thing, not the axis.

## The Grade-k Wedge Product: General Pattern

For k vectors, the wedge product produces a grade-k element (a k-blade):

| Inputs | Output | Geometric meaning |
|---|---|---|
| 1 vector | Grade-1 (vector) | Directed length |
| 2 vectors | Grade-2 (bivector) | Oriented area |
| 3 vectors | Grade-3 (trivector) | Oriented volume |
| k vectors | Grade-k (k-vector) | Oriented k-volume |

In n dimensions, the maximum grade is n. Wedging more than n vectors always gives zero — you can't span more dimensions than the space has.

> :sarcasticgoose: In 3D, the trivector **e**₁₂₃ is the highest grade, so wedging four vectors in 3D is always zero. "But what if I need four independent directions?" Then you're in 4D or higher. The algebra doesn't care — it scales to any dimension. Unlike the cross product, which gave up after three.

## Key Properties Summary

1. **Antisymmetry**: swapping any two adjacent vectors flips the sign
2. **Self-wedge is zero**: **a** ∧ **a** = 0
3. **Linear dependence detector**: result is zero iff the vectors are linearly dependent
4. **Bilinearity**: distributes over addition, pulls out scalars
5. **Associativity**: (**a** ∧ **b**) ∧ **c** = **a** ∧ (**b** ∧ **c**)
6. **Grade additive**: wedging a grade-j element with a grade-k element gives grade j+k (or zero)

> :weightliftinggoose: Master the computation pattern: expand in basis vectors, kill self-wedges, sort with sign flips. Once this is muscle memory, everything else in GA is just applying this pattern at scale. It's like learning proper deadlift form — boring reps now, but every heavy lift later depends on it.
