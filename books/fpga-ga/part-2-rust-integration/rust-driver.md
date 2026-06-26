---
sidebar_position: 1
---

# The Rust Driver

Building a custom hardware accelerator on an FPGA is only half the battle. The other half is getting your host computer to talk to it.

In our scenario, we have a Rust program (perhaps using the `garust` library) running on a standard CPU. We want to send multivectors to the FPGA, let the FPGA compute a result (like a complex geometric product or a rotor application), and then read the result back into Rust.

## Communication Interfaces

How does the CPU talk to the FPGA?

1.  **PCIe (PCI Express):** This is the most common and highest-performance interface for discrete FPGA cards. The FPGA sits on the PCIe bus just like a graphics card.
2.  **SoC (System on Chip):** Many modern FPGAs (like Xilinx Zynq or Intel SoC FPGAs) have an ARM CPU and the FPGA fabric on the same physical chip. They communicate via high-speed internal buses like AXI.
3.  **Network / USB:** Slower, but sometimes useful for simpler development setups.

## Memory-Mapped I/O

Regardless of the physical layer, the most common abstraction is Memory-Mapped I/O (MMIO).

The FPGA exposes a set of memory addresses. When the CPU writes data to a specific memory address, the hardware on the FPGA intercepts that write.

For a GA coprocessor, the workflow looks like this:

1.  **Rust writes** the coefficients of Multivector A to base address `0x00`.
2.  **Rust writes** the coefficients of Multivector B to base address `0x20`.
3.  **Rust writes** a command code (e.g., "1" for Geometric Product) to a control register at `0x40`.
4.  The FPGA detects the command write, executes the custom hardware logic.
5.  The FPGA sets a "Done" bit in a status register at `0x44`.
6.  **Rust polls** the status register (or waits for an interrupt).
7.  Once done, **Rust reads** the result multivector from base address `0x60`.

> :nerdygoose: Writing a driver often involves using `unsafe` Rust to perform raw pointer reads and writes to physical memory addresses. We have to be very careful to map the memory correctly and ensure the compiler doesn't optimize away our MMIO accesses!
