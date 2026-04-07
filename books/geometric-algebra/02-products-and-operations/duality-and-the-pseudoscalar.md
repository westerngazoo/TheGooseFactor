---
sidebar_position: 4
title: "Duality & the Pseudoscalar"
---

# Duality & the Pseudoscalar

We've seen the pseudoscalar $I$ pop up in Foundations and watched the inner product strip dimensions away. Now we tie it together: **duality** — the operation that maps every k-dimensional object to its (n−k)-dimensional complement.

## The Pseudoscalar, Formally

In n-dimensional geometric algebra, the **pseudoscalar** is the highest-grade basis element:

```math
I = \mathbf{e}_1 \mathbf{e}_2 \cdots \mathbf{e}_n = \mathbf{e}_{12\cdots n}
```

It's the unique (up to sign) unit n-vector. It represents the full oriented volume of the space.

**Key property** — $I$ squared depends on the dimension:

```math
I^2 = (-1)^{n(n-1)/2}
```

Working this out:

| Dimension | Pseudoscalar | $I^2$ | |
|---|---|---|---|
| 2D | **e**₁₂ | $(-1)^1 = -1$ | |
| 3D | **e**₁₂₃ | $(-1)^3 = -1$ | |
| 4D | **e**₁₂₃₄ | $(-1)^6 = +1$ | |
| 5D | **e**₁₂₃₄₅ | $(-1)^{10} = +1$ | |

> :mathgoose: The exponent $n(n-1)/2$ counts the number of adjacent swaps needed to reverse the order of n elements. It's the same formula that determines whether a permutation is even or odd. When $I^2 = -1$, the pseudoscalar behaves like an imaginary unit. When $I^2 = +1$, it behaves like a split-complex (hyperbolic) unit.

### Proof that $I^2 = (-1)^{n(n-1)/2}$

Let's prove this for the 3D case and then see the pattern.

```math
I^2 = (\mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3)(\mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3)
```

We need to move each **e** in the second copy past the first copy. Start from the right:

**Move e₃ leftward:**

```math
\mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3 \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3
```

Move the leftmost **e**₁ from the second group past **e**₃ (1 swap, one sign flip):

```math
= -\mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_1 \mathbf{e}_3 \mathbf{e}_2 \mathbf{e}_3
```

Wait — let's be more systematic. We need to bring $\mathbf{e}_1\mathbf{e}_2\mathbf{e}_3$ from the right side past $\mathbf{e}_3$, then $\mathbf{e}_2$, then $\mathbf{e}_1$ on the left side, pairing each with its match.

Actually, the cleanest approach: move the second **e**₁ past **e**₃ and **e**₂ from the first group (2 swaps), then it hits **e**₁ and squares to 1. That eliminates two basis vectors. Repeat.

```math
\mathbf{e}_{123} \cdot \mathbf{e}_{123} = \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3 \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3
```

Move **e**₃ (rightmost of the left group) next to the **e**₃ at the right. It needs to pass **e**₁ and **e**₂ from the right group. That's 2 swaps:

```math
= (-1)^2 \, \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_1 \mathbf{e}_2 (\mathbf{e}_3 \mathbf{e}_3) = \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_1 \mathbf{e}_2
```

Now move **e**₂ past **e**₁. That's 1 swap:

```math
= (-1)^1 \, \mathbf{e}_1 \mathbf{e}_1 (\mathbf{e}_2 \mathbf{e}_2) = -1 \cdot 1 \cdot 1 = -1
```

Total sign flips: 2 + 1 = 3 = $\frac{3 \cdot 2}{2}$. So $I^2 = (-1)^3 = -1$.

> :nerdygoose: The general pattern: to compute $I^2$, the first basis vector from the right copy needs 0 swaps, the second needs 1, the third needs 2, ..., the nth needs (n−1). Total swaps: $0 + 1 + 2 + \cdots + (n-1) = n(n-1)/2$. Each swap contributes a factor of −1.

## The Dual: Definition and Computation

The **dual** of a multivector $A$ is:

```math
A^* = AI^{-1}
```

where $I^{-1}$ is the inverse of the pseudoscalar. Since $I^2 = \pm 1$:

```math
I^{-1} = \frac{I}{I^2} = \pm I
```

In 3D where $I^2 = -1$: $I^{-1} = -I$, so:

```math
A^* = A(-I) = -AI
```

Some books define the dual as $AI$ (without the sign). The convention matters — be consistent.

> :angrygoose: Convention hell. Different authors define duality with $AI$, $AI^{-1}$, $IA$, or $IA^{-1}$. They're all valid but produce different signs. When reading a paper or textbook, check which convention they use before plugging anything in. I've lost hours to sign errors from mixing conventions. Hours.

## Duality in 3D: Every Example

Let's use the convention $A^* = AI^{-1} = -AI$ in 3D and compute the dual of every basis element.

**Dual of a scalar:**

```math
1^* = -(1)(I) = -\mathbf{e}_{123}
```

A scalar (grade 0) dualizes to a trivector (grade 3). Makes sense: 0 + 3 = n = 3.

**Dual of basis vectors:**

```math
\mathbf{e}_1^* = -\mathbf{e}_1 \mathbf{e}_{123} = -\mathbf{e}_1 \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3 = -(1)\mathbf{e}_{23} = -\mathbf{e}_{23}
```

```math
\mathbf{e}_2^* = -\mathbf{e}_2 \mathbf{e}_{123} = -\mathbf{e}_2 \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3 = -(-\mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_2 \mathbf{e}_3) = \mathbf{e}_{13}
```

```math
\mathbf{e}_3^* = -\mathbf{e}_3 \mathbf{e}_{123} = -\mathbf{e}_3 \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3
```

For **e**₃: swap past **e**₁ (−1), swap past **e**₂ (−1), then **e**₃**e**₃ = 1:

```math
= -((-1)^2 \mathbf{e}_1 \mathbf{e}_2 (1)) = -\mathbf{e}_{12}
```

Summary of vector duals:

| Vector | Dual bivector |
|---|---|
| **e**₁ | −**e**₂₃ |
| **e**₂ | +**e**₁₃ |
| **e**₃ | −**e**₁₂ |

A vector (grade 1) dualizes to a bivector (grade 2): the plane perpendicular to the vector.

**Dual of basis bivectors:**

```math
\mathbf{e}_{12}^* = -\mathbf{e}_{12} \mathbf{e}_{123} = -\mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3
```

Simplify: **e**₂**e**₁ = −**e**₁**e**₂, so **e**₁**e**₂**e**₁ = −**e**₁**e**₁**e**₂ = −**e**₂. Then:

```math
= -(-\mathbf{e}_2)(\mathbf{e}_2 \mathbf{e}_3) = \mathbf{e}_2 \mathbf{e}_2 \mathbf{e}_3 = \mathbf{e}_3
```

Similarly:

| Bivector | Dual vector |
|---|---|
| **e**₁₂ | **e**₃ |
| **e**₁₃ | −**e**₂ |
| **e**₂₃ | **e**₁ |

A bivector (grade 2) dualizes to a vector (grade 1): the normal to the plane.

> :happygoose: Now the cross product is fully demystified. The cross product of **a** and **b** is: wedge them (get the plane they span as a bivector), then dualize (get the perpendicular vector). That's it. The cross product is just the dual of the wedge product. In GA notation: **a** × **b** = −(**a** ∧ **b**)I.

**Dual of the pseudoscalar:**

```math
I^* = -I \cdot I = -(-1) = 1
```

The pseudoscalar (grade 3) dualizes to a scalar (grade 0). Full circle.

## The Duality Pattern

In n dimensions, duality maps grade k to grade (n − k):

```
grade 0 ↔ grade n
grade 1 ↔ grade (n-1)
grade 2 ↔ grade (n-2)
...
```

This is a perfect pairing. Every object has a dual of complementary dimension. The dual of a dual returns the original (up to sign).

> :mathgoose: This is Hodge duality in differential geometry, but GA makes it concrete and computable. In differential forms, the Hodge star operator does the same thing but requires a metric and orientation. In GA, it's just multiplication by the pseudoscalar inverse. One operation, not a separate operator defined by a table.

## The Embedded Analogy: Complementary Interrupts

On a microcontroller, think of duality like the relationship between an interrupt mask register and its complement.

An STM32's NVIC has an Interrupt Set-Enable Register (ISER) and an Interrupt Clear-Enable Register (ICER). If ISER has bits 3, 5, 7 set (interrupts enabled), then the "dual" — the disabled interrupts — are all the *other* bits.

Setting bits in ISER is like specifying a k-blade — "these k directions are active." The dual is the complement — "these (n−k) directions are inactive." Together, the active and inactive sets span the full space, just like a blade and its dual span the full algebra.

```
ISER: 0b10101000  →  active channels: {3, 5, 7}
dual: 0b01010111  →  complement:      {0, 1, 2, 4, 6}
```

The blade tells you what's "in." The dual tells you what's "out." Together, everything is accounted for.

> :sarcasticgoose: "Why not just use the complement directly?" Because the dual carries geometric information — it knows the orientation and magnitude, not just which bits are set. A bitmask complement loses orientation. GA duality preserves it.

## Duality and the Cross Product: Final Word

We can now state the full relationship precisely. In 3D:

```math
\mathbf{a} \times \mathbf{b} = -I(\mathbf{a} \wedge \mathbf{b})
```

Or equivalently, using left multiplication by $-I$:

```math
\mathbf{a} \times \mathbf{b} = (\mathbf{a} \wedge \mathbf{b})^*
```

(up to sign convention).

The cross product is the wedge product followed by duality. It takes the plane spanned by **a** and **b** and returns the perpendicular vector. This is why:

1. The cross product only works in 3D — duality maps bivectors to vectors only when $n - 2 = 1$, i.e., $n = 3$.
2. The cross product isn't associative — the wedge is, but duality isn't linear in the way needed.
3. The "right-hand rule" is an orientation convention — it's choosing the sign in the duality map.

> :weightliftinggoose: You now have the complete picture of the three products and duality. The geometric product combines the inner and outer products. The inner product contracts (lowers grade). The outer product extends (raises grade). Duality swaps perspectives (maps grade k to grade n−k). These four operations — geometric product, inner product, outer product, duality — are the full toolkit. Every GA computation is built from them.

## Quick Reference: The Product Zoo

| Operation | Notation | Input grades | Output grade | What it does |
|---|---|---|---|---|
| Geometric product | $AB$ | any | mixed | The fundamental product. Everything else derives from it |
| Inner (dot) product | $A \cdot B$ | r, s | abs(s−r) | Contracts: measures overlap, lowers grade |
| Outer (wedge) product | $A \wedge B$ | r, s | r+s (or 0) | Extends: spans subspaces, raises grade |
| Dual | $A^*$ or $AI^{-1}$ | k | n−k | Complement: maps to perpendicular subspace |
| Grade projection | $\langle A \rangle_k$ | any | k | Extracts: picks out the grade-k component |

> :happygoose: Five operations, and three of them (inner, outer, grade projection) are defined in terms of the first one (geometric product). The whole framework is self-consistent — no ad-hoc definitions, no special cases. This is what algebra is supposed to feel like.
