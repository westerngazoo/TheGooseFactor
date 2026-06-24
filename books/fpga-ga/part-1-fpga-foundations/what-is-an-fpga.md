---
sidebar_position: 1
---

# What is an FPGA?

If you are a software engineer, you are used to writing instructions that a central processing unit (CPU) executes one by one. An FPGA (Field-Programmable Gate Array) is completely different.

When you "program" an FPGA, you are not writing software; you are designing hardware. You are specifying how logic gates (AND, OR, NOT) and memory elements (flip-flops, BRAM) should be wired together to create a custom digital circuit.

## Programmable Logic

An FPGA consists of a massive grid of programmable logic blocks. Think of them as blank slates. By writing code in a Hardware Description Language (HDL) like Verilog, VHDL, or modern alternatives like Amaranth or SpinalHDL, you tell the synthesis tools how to configure these blocks to behave like the circuit you designed.

This means if you need a specialized mathematical unit—say, a circuit specifically designed to compute the geometric product of two 3D multivectors—you can build exactly that.

## Parallelism by Default

In software, concurrency is something you have to actively manage (threads, async/await). In hardware, parallelism is the default. If you lay down ten multiplier circuits on the FPGA, they will all compute simultaneously on every clock cycle.

This is why FPGAs are so powerful for accelerating tasks like Geometric Algebra. We can unroll complex algebraic expansions and compute all the terms in parallel.

> :surprisedgoose: Wait, so I'm literally designing a custom chip?
>
> Exactly! While it's reconfigurable (unlike an ASIC), the design you load onto the FPGA physically determines the electrical pathways between the logic gates.
