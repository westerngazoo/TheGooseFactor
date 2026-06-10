---
sidebar_position: 1
sidebar_label: Introduction
title: "UFL & Unconventional Computing"
slug: /
---

# UFL & Unconventional Computing

> The boundary between hardware and software is an artifact of notation, not physics.

Welcome to the documentation for **UFL** (Unified Formal Language). This book explores unconventional computation, from Eric Hehner's predicative programming to Field-Programmable Gate Arrays (FPGAs) and reservoir computers, all unified under a single mathematical framework.

Every computation — whether it's etched in silicon, run by an OS scheduler, or inferred by a neural network — is essentially a constraint over a geometric object. UFL is a language expressive enough to state that constraint directly, so the physical substrate becomes a *compilation target* rather than a fixed design decision.

> :nerdygoose: When we talk about "hardware" versus "software", we're really just talking about binding time. Hardware is a computation bound at the foundry. Software is a computation bound at runtime. FPGAs sit in the middle. UFL removes this false dichotomy.

## The Four Pillars

1. **Logarithmic Arithmetic Core** — All arithmetic reduces to log-domain operations. Multiplication becomes addition (`×` → log-add), division becomes subtraction, and exponentiation becomes scalar multiplication.
2. **Geometric Algebra Spatial Layer** — Multivectors encode state. The geometric product is the universal composition operator that maps seamlessly to both 3D reality and logical transformations.
3. **Hehner Predicative Logic Layer** — Programs are defined purely as predicates over pre- and post-state. This means a logic gate, a C++ function, and a neural network layer are all formally equivalent.
4. **Substrate Orchestrator** — A compiler backend that picks the lowest-cost physical substrate (silicon, CPU, GPU, analog reservoir, or FPGA) that satisfies the given predicate.

> :surprisedgoose: This is why UFL is different. You don't write "Verilog" for the FPGA and "Rust" for the CPU. You write a predicate in UFL. If the orchestrator decides it's faster/cheaper to wire up an FPGA fabric to satisfy that predicate, it does so automatically.

## Why Unconventional Computing?

Classical von Neumann architectures (CPUs) are hitting physical and thermal limits. The future of computing relies on unconventional substrates:
- **FPGAs**: Reconfigurable hardware where the physical logic gates are wired to match the algorithm.
- **Reservoir Computers**: Exploiting the natural dynamics of analog physical systems (like a bucket of water, or a photonic crystal) to perform computation "for free."

By treating computation as geometric constraints via UFL, we can target these unconventional substrates without rewriting our logic.

> :weightliftinggoose: We are stepping out of the comfortable world of instruction pointers and into the raw physics of computation. Time to build.
