---
sidebar_position: 2
title: "Multivectors & Grades"
---

# Multivectors & Grades

## The Algebra We've Built

Starting from the geometric product in 3D geometric algebra (with basis **e**₁, **e**₂, **e**₃), we can form products of basis vectors. Every possible product gives us a new basis element:

| Grade | Name | Basis elements | Count |
|---|---|---|---|
| 0 | Scalar | 1 | 1 |
| 1 | Vector | **e**₁, **e**₂, **e**₃ | 3 |
| 2 | Bivector | **e**₁₂, **e**₁₃, **e**₂₃ | 3 |
| 3 | Trivector | **e**₁₂₃ | 1 |

where **e**₁₂ = **e**₁**e**₂, and so on.

**Total dimension:** 1 + 3 + 3 + 1 = 8 = 2³

In general, the geometric algebra of *n* dimensions has dimension 2ⁿ. The pattern follows Pascal's triangle — C(n, k) elements at grade k.

> :mathgoose: The 2ⁿ dimension count is the same as the power set. Each basis element corresponds to a subset of basis vectors — grade-0 is the empty set, grade-1 is singletons, grade-2 is pairs, and so on. This isn't a coincidence. The algebraic structure mirrors the combinatorial structure of subsets.
>
> :nerdygoose: If you've worked with bitmasks, this should feel familiar. An n-bit mask picks out a subset of n things — exactly 2ⁿ possibilities. Each multivector component is indexed by a bitmask of which basis vectors participate in the product.

## Multivectors

A **multivector** is a general element of the algebra — a sum of components at different grades:

```math
M = \alpha + (v_1\mathbf{e}_1 + v_2\mathbf{e}_2 + v_3\mathbf{e}_3) + (B_{12}\mathbf{e}_{12} + B_{13}\mathbf{e}_{13} + B_{23}\mathbf{e}_{23}) + \beta\,\mathbf{e}_{123}
```

The first term is grade-0 (scalar), the second group is grade-1 (vector), the third is grade-2 (bivector), and the last is grade-3 (trivector).

Think of it like a polynomial where each "degree" is a different geometric object.

## Grade Projection

The **grade-k part** of a multivector M is written ⟨M⟩ₖ:

```math
\langle M \rangle_0 = \alpha, \qquad \langle M \rangle_1 = v_1\mathbf{e}_1 + v_2\mathbf{e}_2 + v_3\mathbf{e}_3
```

and so on for higher grades. This is the GA equivalent of "extract the real part" or "extract the imaginary part" from complex numbers.

> :happygoose: Grade projection is your debugging tool. When a computation gives you a weird multivector, project out each grade and see what you got. Scalar part? Vector part? Bivector part? Each one tells you something geometrically.

## What Bivectors *Are*

A bivector represents an **oriented plane segment**. Just as a vector has magnitude and direction (a line), a bivector has magnitude and orientation (a plane).

```math
\mathbf{a} \wedge \mathbf{b}
```

- **Magnitude:** area of the parallelogram spanned by **a** and **b**
- **Orientation:** the plane containing **a** and **b**, with a handedness

This is what the cross product was *trying* to be. The cross product **a** × **b** gives you a vector perpendicular to the plane — but that only works in 3D. The wedge product gives you the plane itself, which works in any dimension.

> :angrygoose: The cross product is a hack. It takes two vectors in a plane and returns a vector perpendicular to that plane. Why? Because in 3D there's exactly one perpendicular direction. In 4D there are two perpendicular directions, so the cross product breaks. The wedge product doesn't have this problem because it represents the plane directly. We've been teaching students the wrong abstraction for over a century.

## The Pseudoscalar

The highest-grade element **e**₁₂₃ = **e**₁**e**₂**e**₃ is the **pseudoscalar**, often written *I*.

Key properties in 3D:

```math
I^2 = \mathbf{e}_{123}\mathbf{e}_{123} = -1
```

```math
I\,\mathbf{e}_1 = \mathbf{e}_{23}, \qquad I\,\mathbf{e}_2 = -\mathbf{e}_{13}, \qquad I\,\mathbf{e}_3 = \mathbf{e}_{12}
```

Multiplying by *I* maps vectors to bivectors and back — this is **duality**. It's the algebraic version of "perpendicular complement."

> :surprisedgoose: I² = −1. The pseudoscalar squares to minus one, just like the imaginary unit. This is not a coincidence — complex numbers are literally the geometric algebra of the plane. The "imaginary" unit *i* is just the unit bivector **e**₁₂, which represents the oriented plane. There's nothing imaginary about it.

## The Cross Product Connection

In 3D:

```math
\mathbf{a} \times \mathbf{b} = -I\,(\mathbf{a} \wedge \mathbf{b})
```

The cross product is the **dual** of the wedge product. The wedge gives you the plane; multiplying by −*I* maps it to the normal vector. Now you see why the cross product only works in 3D — it depends on having exactly one perpendicular direction to a plane.

> :sarcasticgoose: So the cross product is just a wedge product with a duality map bolted on, restricted to three dimensions, losing the plane information in the process. And we teach it first. Great pedagogy.
>
> :mathgoose: To be fair, Gibbs popularized the cross product in the 1880s for practical physics. Grassmann had the wedge product decades earlier, and Clifford unified everything. But Gibbs's notation won because it was simpler for engineering calculations. We're still paying for that shortcut.
