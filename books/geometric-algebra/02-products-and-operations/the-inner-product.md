---
sidebar_position: 2
title: "The Inner Product (Generalized)"
---

# The Inner Product (Generalized)

The dot product between two vectors is familiar. But in GA, we need an inner product that works between objects of *any* grade — a vector dotted into a bivector, a bivector dotted into a trivector, and so on. This is where GA starts doing things no other framework can match.

## Vector-Vector Inner Product: The Familiar Case

Between two vectors, the inner product is just the dot product:

```math
\mathbf{a} \cdot \mathbf{b} = \frac{1}{2}(\mathbf{ab} + \mathbf{ba})
```

This is a scalar (grade 0). Nothing new here — it's the symmetric part of the geometric product we derived in Foundations.

For basis vectors:

```math
\mathbf{e}_i \cdot \mathbf{e}_j = \begin{cases} 1 & \text{if } i = j \\ 0 & \text{if } i \neq j \end{cases}
```

This is just the Kronecker delta: orthonormal basis vectors are perpendicular and unit-length.

## The General Rule: Grade Lowering

Here's where it gets interesting. What does it mean to "dot" a vector into a bivector?

**Definition**: The inner product (also called the *left contraction* in some books) of a grade-r element $A_r$ with a grade-s element $B_s$ (where $r \leq s$) is:

```math
A_r \cdot B_s = \langle A_r B_s \rangle_{s-r}
```

That is: take the geometric product, then extract the grade $|s - r|$ part.

The inner product **lowers the grade**. It takes a high-grade object and contracts it down.

> :mathgoose: This is the key insight: the inner product measures "how much of one object is contained in another." Dotting a vector into a bivector asks: "how much does this vector participate in this plane?" The answer is a vector — the component of the bivector that's aligned with the input vector, projected out.

## Vector into Bivector: Step by Step

Let's compute the inner product of a vector with a bivector concretely.

Take the vector **e**₁ and the bivector **e**₁₂ = **e**₁**e**₂.

The geometric product is:

```math
\mathbf{e}_1 \mathbf{e}_{12} = \mathbf{e}_1 (\mathbf{e}_1 \mathbf{e}_2) = (\mathbf{e}_1 \mathbf{e}_1) \mathbf{e}_2 = (1) \mathbf{e}_2 = \mathbf{e}_2
```

This is a grade-1 object (a vector). Since we started with grade 1 and grade 2, the inner product grade is 2 − 1 = 1. The entire result is already grade 1, so:

```math
\mathbf{e}_1 \cdot \mathbf{e}_{12} = \mathbf{e}_2
```

**Geometric meaning**: the vector **e**₁ "participates" in the plane **e**₁₂. When we contract it out, what's left is **e**₂ — the other direction in the plane.

Now try a vector that's *not* in the plane:

```math
\mathbf{e}_3 \cdot \mathbf{e}_{12} = \langle \mathbf{e}_3 \mathbf{e}_{12} \rangle_1
```

Compute the geometric product:

```math
\mathbf{e}_3 \mathbf{e}_{12} = \mathbf{e}_3 \mathbf{e}_1 \mathbf{e}_2 = \mathbf{e}_{312}
```

Wait — is that right? Let's sort the indices. **e**₃ anticommutes with **e**₁:

```math
\mathbf{e}_3 \mathbf{e}_1 = -\mathbf{e}_1 \mathbf{e}_3
```

So:

```math
\mathbf{e}_3 \mathbf{e}_1 \mathbf{e}_2 = -\mathbf{e}_1 \mathbf{e}_3 \mathbf{e}_2 = -(-\mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3) = \mathbf{e}_{123}
```

That's a trivector (grade 3). The grade-1 part is zero:

```math
\mathbf{e}_3 \cdot \mathbf{e}_{12} = \langle \mathbf{e}_{123} \rangle_1 = 0
```

> :happygoose: This is exactly right. **e**₃ is perpendicular to the plane **e**₁₂. It has zero participation in that plane, so the inner product is zero. The algebra automatically detects geometric relationships. A vector "in" the plane gives a nonzero contraction. A vector perpendicular to the plane gives zero. No coordinate checks needed.

## The Embedded Analogy: DMA Channel Masking

Think of the inner product as a **mask-and-extract** operation, like reading specific fields from a DMA descriptor.

On an STM32, a DMA stream configuration register (DMA_SxCR) packs multiple fields: channel selection (bits 27:25), memory burst (bits 24:23), peripheral burst (bits 22:21), and so on. When you want to read just the channel field, you mask the register and shift:

```
channel = (DMA_SxCR >> 25) & 0x7;
```

The inner product does the geometric version of this. You have a composite object (a bivector, representing a plane), and you "mask" it with a vector to extract the component along that vector's direction. What's left is the perpendicular complement within the plane.

```math
\mathbf{v} \cdot B = \text{"extract the part of } B \text{ aligned with } \mathbf{v}\text{"}
```

If **v** has no bits in common with B (perpendicular), the extraction is zero — like masking a register field that doesn't overlap with your mask.

> :nerdygoose: This analogy goes deeper. In embedded systems, bit masking is AND followed by shift. In GA, the inner product is geometric product followed by grade extraction. Same pattern: filter, then project. The "shift" corresponds to grade lowering — you started with a grade-2 plane and ended with a grade-1 vector.

## More Examples: Building the Full Picture

### Vector dot bivector (general case)

Take an arbitrary vector **v** = $v_1\mathbf{e}_1 + v_2\mathbf{e}_2 + v_3\mathbf{e}_3$ and a basis bivector **e**₂₃:

```math
\mathbf{v} \cdot \mathbf{e}_{23} = \langle \mathbf{v} \, \mathbf{e}_{23} \rangle_1
```

Expand:

```math
\mathbf{v} \, \mathbf{e}_{23} = v_1 \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3 + v_2 \mathbf{e}_2 \mathbf{e}_2 \mathbf{e}_3 + v_3 \mathbf{e}_3 \mathbf{e}_2 \mathbf{e}_3
```

Simplify each term:

**First term**: $v_1 \mathbf{e}_{123}$ — grade 3, not grade 1, so it drops out.

**Second term**: $v_2 \mathbf{e}_2 \mathbf{e}_2 \mathbf{e}_3 = v_2 (1) \mathbf{e}_3 = v_2 \mathbf{e}_3$ — grade 1, this contributes.

**Third term**: $v_3 \mathbf{e}_3 \mathbf{e}_2 \mathbf{e}_3 = v_3 (-\mathbf{e}_2 \mathbf{e}_3) \mathbf{e}_3 = v_3 (-\mathbf{e}_2)(1) = -v_2 \mathbf{e}_2$

Wait, let me redo that more carefully:

```math
\mathbf{e}_3 \mathbf{e}_2 \mathbf{e}_3 = -\mathbf{e}_2 \mathbf{e}_3 \mathbf{e}_3 = -\mathbf{e}_2 (1) = -\mathbf{e}_2
```

So the third term is $-v_3 \mathbf{e}_2$.

Collecting grade-1 terms:

```math
\mathbf{v} \cdot \mathbf{e}_{23} = v_2 \mathbf{e}_3 - v_3 \mathbf{e}_2
```

> :sharpgoose: Notice what happened. The components $v_2$ and $v_3$ — the ones aligned with **e**₂ and **e**₃ (the vectors *in* the plane **e**₂₃) — contributed to the result. The component $v_1$ (perpendicular to the plane) dropped out as a trivector. The inner product filtered for the in-plane part and returned the perpendicular complement within the plane.

### Bivector dot bivector

What about contracting a bivector with a bivector? Grade 2 dotted with grade 2 gives grade |2 − 2| = 0, a scalar:

```math
\mathbf{e}_{12} \cdot \mathbf{e}_{12} = \langle \mathbf{e}_{12} \mathbf{e}_{12} \rangle_0
```

Compute:

```math
\mathbf{e}_{12} \mathbf{e}_{12} = \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_1 \mathbf{e}_2
```

Move **e**₂ past **e**₁ (picking up a minus sign):

```math
= \mathbf{e}_1 (-\mathbf{e}_1 \mathbf{e}_2) \mathbf{e}_2 = -\mathbf{e}_1 \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_2 = -(1)(1) = -1
```

So:

```math
\mathbf{e}_{12} \cdot \mathbf{e}_{12} = -1
```

> :surprisedgoose: A bivector squares to −1. This is why bivectors act like imaginary units. The unit bivector **e**₁₂ in 2D *is* the imaginary unit i, and the geometric algebra of the plane *is* the complex numbers. Every time a physicist writes $e^{i\theta}$ for a rotation, they're secretly using a bivector exponential.

And for orthogonal bivectors:

```math
\mathbf{e}_{12} \cdot \mathbf{e}_{23} = \langle \mathbf{e}_{12} \mathbf{e}_{23} \rangle_0
```

```math
\mathbf{e}_{12} \mathbf{e}_{23} = \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_2 \mathbf{e}_3 = \mathbf{e}_1 (1) \mathbf{e}_3 = \mathbf{e}_{13}
```

That's grade 2, not grade 0. So:

```math
\mathbf{e}_{12} \cdot \mathbf{e}_{23} = 0
```

Bivectors that share no common vectors are orthogonal. Bivectors that share exactly one vector are related. Same logic as register fields that share bits versus fields that don't.

## Vector dot Trivector

In 3D, dotting a vector into the pseudoscalar:

```math
\mathbf{e}_1 \cdot \mathbf{e}_{123} = \langle \mathbf{e}_1 \mathbf{e}_{123} \rangle_2
```

```math
\mathbf{e}_1 \mathbf{e}_{123} = \mathbf{e}_1 \mathbf{e}_1 \mathbf{e}_2 \mathbf{e}_3 = (1) \mathbf{e}_2 \mathbf{e}_3 = \mathbf{e}_{23}
```

That's grade 2, which matches 3 − 1 = 2. So:

```math
\mathbf{e}_1 \cdot \mathbf{e}_{123} = \mathbf{e}_{23}
```

**Geometric meaning**: contracting **e**₁ out of the full volume gives the plane perpendicular to **e**₁. This is **duality** — we'll see it systematically in the next section.

> :angrygoose: This is exactly what the cross product was trying to do, but couldn't express cleanly. Given a vector and a volume, the inner product extracts the plane perpendicular to that vector. In 3D, people use the cross product for this, but it only works because 3D has a unique perpendicular plane to every vector. The inner product works in any dimension because it's not relying on dimensional accidents.

## Grade Rules Summary

| Left grade | Right grade | Inner product grade | Result type |
|---|---|---|---|
| 1 (vector) | 1 (vector) | 0 | scalar |
| 1 (vector) | 2 (bivector) | 1 | vector |
| 2 (bivector) | 2 (bivector) | 0 | scalar |
| 1 (vector) | 3 (trivector) | 2 | bivector |
| 2 (bivector) | 3 (trivector) | 1 | vector |

The pattern: the inner product always **lowers** the grade of the higher-grade object by the grade of the lower-grade object.

> :weightliftinggoose: Think of the inner product as peeling off layers. A trivector is a volume. Dot it with a vector, and you peel off one layer of dimension — you're left with a bivector (a plane). Dot that bivector with another vector, peel again — you get a vector. Dot that with another vector, and you're down to a scalar. Each contraction strips one dimension, like unloading plates from the bar one at a time.
