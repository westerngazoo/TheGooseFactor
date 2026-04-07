---
sidebar_position: 3
title: "Blades & Grade Structure"
---

# Blades & Grade Structure

We've been using terms like "bivector" and "trivector" loosely. Now we need to get precise about what these objects are, which ones are "simple," and how the full algebra is organized.

## Blades: The Simple Objects

A **k-blade** is a k-vector that can be written as the wedge product of k vectors:

```math
B_k = \mathbf{v}_1 \wedge \mathbf{v}_2 \wedge \cdots \wedge \mathbf{v}_k
```

Every k-blade represents a single oriented k-dimensional subspace.

**Examples of blades:**
- Scalars are 0-blades (trivially)
- Every vector is a 1-blade
- **e**₁₂ = **e**₁ ∧ **e**₂ is a 2-blade (a simple bivector)
- **e**₁₂₃ = **e**₁ ∧ **e**₂ ∧ **e**₃ is a 3-blade

A blade has a clear geometric picture: it's a single flat subspace with an orientation and a magnitude.

## Not Every Bivector is a Blade

This is a crucial subtlety. In 3D, every bivector happens to be a blade. But starting in 4D, this is no longer true.

Consider 4D, with basis **e**₁, **e**₂, **e**₃, **e**₄. The bivector:

```math
F = \mathbf{e}_{12} + \mathbf{e}_{34}
```

Can you write this as **a** ∧ **b** for some vectors **a** and **b**? Let's check.

If $F = \mathbf{a} \wedge \mathbf{b}$, then $F \wedge F = (\mathbf{a} \wedge \mathbf{b}) \wedge (\mathbf{a} \wedge \mathbf{b})$.

By the antisymmetry of the wedge product, for any blade $B = \mathbf{a} \wedge \mathbf{b}$:

```math
B \wedge B = \mathbf{a} \wedge \mathbf{b} \wedge \mathbf{a} \wedge \mathbf{b} = 0
```

because **a** appears twice. But let's compute $F \wedge F$:

```math
F \wedge F = (\mathbf{e}_{12} + \mathbf{e}_{34}) \wedge (\mathbf{e}_{12} + \mathbf{e}_{34})
```

```math
= \mathbf{e}_{12} \wedge \mathbf{e}_{12} + \mathbf{e}_{12} \wedge \mathbf{e}_{34} + \mathbf{e}_{34} \wedge \mathbf{e}_{12} + \mathbf{e}_{34} \wedge \mathbf{e}_{34}
```

The self-wedges are zero. For the cross terms:

```math
\mathbf{e}_{12} \wedge \mathbf{e}_{34} = \mathbf{e}_{1234}
```

```math
\mathbf{e}_{34} \wedge \mathbf{e}_{12} = \mathbf{e}_{3412}
```

To sort **e**₃₄₁₂ into **e**₁₂₃₄, we need to move **e**₁ past **e**₃ and **e**₄ (two swaps), and **e**₂ past **e**₃ and **e**₄ (two swaps). Four swaps total, so the sign is $(-1)^4 = +1$:

```math
\mathbf{e}_{34} \wedge \mathbf{e}_{12} = \mathbf{e}_{1234}
```

Therefore:

```math
F \wedge F = \mathbf{e}_{1234} + \mathbf{e}_{1234} = 2\mathbf{e}_{1234} \neq 0
```

Since $F \wedge F \neq 0$, $F$ cannot be a simple blade. It represents rotation in two independent planes simultaneously — something that can't be captured by a single oriented plane.

> :surprisedgoose: This is where physics shows up. The electromagnetic field tensor in special relativity is exactly this kind of non-blade bivector — it has independent electric and magnetic components living in different planes. Maxwell's equations unify naturally in GA because the field is a single bivector in 4D spacetime, not two separate 3D vector fields duct-taped together.

> :angrygoose: This is also why "axis of rotation" breaks in 4D. In 3D, every rotation has an axis because every bivector is a blade — a single plane — and its dual is a single vector (the axis). In 4D, a general rotation involves two independent planes, so there's no single axis. People who only learned 3D rotations hit a wall here. GA handles it without blinking.

## The Blade Test

For a bivector $B$ in any dimension:

**B is a blade** if and only if $B \wedge B = 0$.

This generalizes: a k-vector $A$ is a k-blade if and only if it satisfies certain conditions involving self-products (related to the Plücker relations in projective geometry).

In practice:
- In 2D: all bivectors are blades (there's only one basis bivector, **e**₁₂)
- In 3D: all bivectors are blades (you can always find two vectors spanning any bivector)
- In 4D+: non-blade bivectors exist and are geometrically important

## Grade Structure of the Full Algebra

Now let's see how the algebra is organized. In $n$ dimensions, the geometric algebra has $2^n$ basis elements, partitioned by grade:

**In 2D** ($n = 2$, dimension $2^2 = 4$):

| Grade | Count | Basis elements | Name |
|---|---|---|---|
| 0 | 1 | 1 | scalar |
| 1 | 2 | **e**₁, **e**₂ | vectors |
| 2 | 1 | **e**₁₂ | pseudoscalar |

**In 3D** ($n = 3$, dimension $2^3 = 8$):

| Grade | Count | Basis elements | Name |
|---|---|---|---|
| 0 | 1 | 1 | scalar |
| 1 | 3 | **e**₁, **e**₂, **e**₃ | vectors |
| 2 | 3 | **e**₁₂, **e**₁₃, **e**₂₃ | bivectors |
| 3 | 1 | **e**₁₂₃ | pseudoscalar |

**In 4D** ($n = 4$, dimension $2^4 = 16$):

| Grade | Count | Basis elements | Name |
|---|---|---|---|
| 0 | 1 | 1 | scalar |
| 1 | 4 | **e**₁, **e**₂, **e**₃, **e**₄ | vectors |
| 2 | 6 | **e**₁₂, **e**₁₃, **e**₁₄, **e**₂₃, **e**₂₄, **e**₃₄ | bivectors |
| 3 | 4 | **e**₁₂₃, **e**₁₂₄, **e**₁₃₄, **e**₂₃₄ | trivectors |
| 4 | 1 | **e**₁₂₃₄ | pseudoscalar |

> :mathgoose: The counts are Pascal's triangle: 1, 4, 6, 4, 1. In general, grade k in n dimensions has $\binom{n}{k}$ basis elements. The symmetry — grade k has the same count as grade (n−k) — is duality. Every k-blade has a dual (n−k)-blade, and they carry the same information.

## The Embedded Analogy: Memory-Mapped Register Banks

Think of the grade structure like a microcontroller's memory map. An STM32F4's peripherals are organized in groups:

- **APB1** peripherals (base 0x4000 0000): timers, UART, I2C, SPI
- **APB2** peripherals (base 0x4001 0000): GPIO, ADC, EXTI
- **AHB1** peripherals (base 0x4002 0000): DMA, RCC, flash

Each peripheral group lives in its own address range. You don't mix GPIO registers with timer registers — they're in different "grades" of the memory map.

The geometric algebra is organized the same way:

- **Grade 0** (scalars): the "constants" — magnitudes, scaling factors
- **Grade 1** (vectors): directed quantities — forces, velocities, positions
- **Grade 2** (bivectors): planes and rotations — angular velocities, electromagnetic fields
- **Grade 3** (trivectors): volumes — flux, determinants

Just as each peripheral group has its own register layout, each grade has its own basis elements and operations. The geometric product can mix grades (like DMA bridging between peripherals), but grade projection lets you extract exactly the grade you need (like reading a specific register).

> :nerdygoose: This analogy extends to the computational implementation. If you're coding GA on an embedded system, you'd likely represent a 3D multivector as a struct with 8 floats — one per basis element. You could pack them by grade: `float s; float v[3]; float b[3]; float t;` — that's scalar, vector, bivector, trivector. Same layout as a register bank with grouped fields.

## Even and Odd Subalgebras

The grades split into **even** (0, 2, 4, ...) and **odd** (1, 3, 5, ...).

The even-grade elements form a **closed subalgebra** — the geometric product of two even-grade elements is always even-grade. This is the **even subalgebra**, and it's where rotors live.

In 3D, the even subalgebra has grades 0 and 2:

```math
R = \alpha + B_{12}\mathbf{e}_{12} + B_{13}\mathbf{e}_{13} + B_{23}\mathbf{e}_{23}
```

That's a scalar plus a bivector — 4 components. This is isomorphic to the quaternions.

> :happygoose: There it is. Quaternions are the even subalgebra of the 3D geometric algebra. The quaternion units $i, j, k$ are the bivectors $-\mathbf{e}_{23}, -\mathbf{e}_{13}, -\mathbf{e}_{12}$ (signs depend on convention). Hamilton spent years trying to understand what $i, j, k$ were geometrically. In GA, it's obvious: they're unit oriented planes.
>
> :sarcasticgoose: Hamilton carved $i^2 = j^2 = k^2 = ijk = -1$ into a bridge in 1843 because he thought it was so profound. In GA, it's one line: bivectors square to −1. If only he'd read Grassmann.

## Homogeneous vs Mixed Multivectors

A **homogeneous** multivector has only one grade — it's a pure scalar, pure vector, pure bivector, etc. These are the "clean" objects with direct geometric interpretations.

A **mixed** multivector has components at multiple grades. These arise naturally from the geometric product:

```math
\mathbf{ab} = \underbrace{\mathbf{a} \cdot \mathbf{b}}_{\text{grade 0}} + \underbrace{\mathbf{a} \wedge \mathbf{b}}_{\text{grade 2}}
```

The result has both grade 0 and grade 2 components — it's mixed. This is fine algebraically, but geometrically it means "a scalar and a bivector packaged together."

Mixed multivectors are like packed structs in C — multiple fields of different types sharing one variable. You use grade projection to extract the field you want:

```math
\langle \mathbf{ab} \rangle_0 = \mathbf{a} \cdot \mathbf{b}, \qquad \langle \mathbf{ab} \rangle_2 = \mathbf{a} \wedge \mathbf{b}
```

> :sharpgoose: In practice, most meaningful GA objects are either homogeneous (blades, pseudoscalars) or specific combinations (rotors = scalar + bivector, motors = even-grade elements). Random mixed multivectors rarely have geometric meaning. If your computation produces a multivector with unexpected grades, something went wrong — just like getting unexpected data types from a function usually signals a bug.
