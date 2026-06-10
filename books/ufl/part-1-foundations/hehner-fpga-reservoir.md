---
sidebar_position: 1
title: "Hehner, FPGAs, and Reservoir Computers"
---

# Hehner, FPGAs, and Reservoir Computers

> What if a program wasn't a sequence of instructions, but a mathematical statement about what is true before and after it runs? This is the core of Eric Hehner's predicative programming, and it's the secret to unlocking unconventional hardware.

To compile software to a CPU, you translate it into instructions. But how do you compile software to a bucket of water (reservoir computing) or a raw fabric of logic gates (FPGA)? You can't give instructions to water. You have to give it constraints.

## 1. Eric Hehner and Predicative Logic

In Eric Hehner's *A Practical Theory of Programming*, a program is just a boolean expression (a predicate) relating the initial state of variables to their final state (often written with primes, like $x'$).

Instead of writing:
```python
x = x + 1
```

In Hehner's logic, the program is the predicate:
$$ x' = x + 1 \land y' = y \land t' = t + 1 $$

"The final value of $x$ is the initial value plus 1, $y$ is unchanged, and the time $t$ has advanced."

> :nerdygoose: Why does this matter? Because a predicate doesn't tell the machine *how* to do the work. It simply defines what a valid answer looks like. A C++ function, a Verilog logic gate, and a neural network layer can all be expressed as a Hehner predicate. They are formally equivalent.

## 2. Compiling Predicates to FPGAs

An **FPGA** (Field-Programmable Gate Array) is a chip full of raw logic blocks (LUTs) and routing wires. To program it, you don't write instructions; you configure the hardware itself to form a custom circuit.

When you use UFL (Unified Formal Language), your program is a Hehner predicate combined with Geometric Algebra. To target an FPGA:
1. The UFL Substrate Orchestrator takes the predicate (e.g., $x' = x + 1$).
2. It breaks the predicate down into spatial logic gates using geometric algebra.
3. It maps those geometric operations directly onto the physical LUTs on the FPGA.

Because the program is a predicate, we aren't "simulating" software on hardware. The hardware *becomes* the predicate.

> :weightliftinggoose: If a CPU computes by running code, an FPGA computes by *being* the code.

## 3. Reservoir Computers

A **Reservoir Computer** is a form of unconventional, analog computation. You take a highly complex, dynamic physical system — a laser, a bucket of rippling water, or an untargeted neural network — and you "ping" it with inputs. You then measure the outputs and train a simple readout layer to interpret the chaotic physical response.

How does UFL target a reservoir?
1. The physical dynamics of the reservoir (the ripples in the water, the photon scattering) are modeled as a complex Geometric Algebra transformation.
2. The orchestrator looks at your Hehner predicate.
3. It maps the predicate's input/output constraints directly to the readout layer of the reservoir.

The computation happens "for free" because the physics of the reservoir natively solve the complex geometric constraints. We just extract the answer.

> :surprisedgoose: This sounds like science fiction, but it's real. By treating programs as predicates rather than instructions, UFL allows the Substrate Orchestrator to route work to whatever physical system naturally solves that specific geometric shape.

## What we covered
- **Hehner's Predicative Programming** treats programs as boolean constraints on pre- and post-state.
- **FPGAs** can be targeted directly by translating these predicates into physical logic gates using Geometric Algebra.
- **Reservoir Computers** compute "for free" by mapping predicates to the physical dynamics of complex analog systems.

## What's next
With the foundational theory set, we'll dive into the first pillar of UFL: the **Logarithmic Arithmetic Core**, where we learn why all math is just addition in disguise.