---
sidebar_position: 1
---

# Hardware Geometric Product

Now we reach the core of the project: implementing the math in hardware.

The fundamental operation in Geometric Algebra is the geometric product. For a 3D Euclidean space (Cl(3,0,0)), a general multivector has 8 components (1 scalar, 3 vector, 3 bivector, 1 trivector).

When you multiply two 8-component multivectors $A$ and $B$, the result $C = AB$ is a new 8-component multivector.

## Unrolling the Math

In software, `garust` might compute this using loops, bitwise operations to determine signs, and arrays.

In hardware, we want to achieve maximum throughput. We can mathematically unroll the entire multiplication. Every component of $C$ is a sum of products of the components of $A$ and $B$, with specific signs determined by the algebra's signature and basis blade multiplication rules.

For example, the scalar component of the result, $C_0$, is computed as:
$$C_0 = A_0B_0 + A_1B_1 + A_2B_2 + A_3B_3 - A_{12}B_{12} - A_{23}B_{23} - A_{31}B_{31} - A_{123}B_{123}$$

(Assuming Euclidean signature where orthogonal vectors square to +1 and bivectors square to -1).

## Pipelining the Multipliers

A naive hardware implementation would instantiate 64 multipliers (since 8x8 = 64 terms) and huge adder trees to compute the result in a single clock cycle. This might result in a very long critical path, forcing the clock frequency to be very slow.

Instead, we use **pipelining**.

1.  **Stage 1:** We instantiate the multipliers. The FPGA registers the inputs, performs the 64 parallel multiplications, and registers the intermediate products.
2.  **Stage 2:** The first layer of adders sums pairs of products.
3.  **Stage 3:** The second layer of adders sums the results of Stage 2.
4.  **...**

By breaking the computation into smaller stages separated by registers (flip-flops), the FPGA can run at a much higher clock speed. A new pair of multivectors can enter the pipeline on *every single clock cycle*. The latency might be 4-5 clock cycles to get the result, but the throughput is one result per cycle!

> :weightliftinggoose: This is where FPGAs destroy general-purpose CPUs. Once the pipeline is full, our custom GA coprocessor can churn out a full 8-dimensional geometric product on every clock tick.
