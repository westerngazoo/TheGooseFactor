---
sidebar_position: 1
sidebar_label: Introduction
title: "Embedded Systems Programming: C++ vs Rust"
slug: /
---

# Embedded Systems Programming: C++ vs Rust

> A comprehensive guide to embedded development featuring dual implementations on the same hardware platform. Learn embedded programming through direct comparison of C++ and Rust approaches.

## Overview

This book takes a unique approach to embedded systems programming by implementing the same projects in both C++ and Rust on identical hardware. Each chapter presents both implementations side-by-side, allowing you to:

- Compare performance characteristics
- Understand language-specific trade-offs
- Learn best practices for each ecosystem
- Make informed technology choices for your projects

## Target Platform: STM32F4 Discovery Board

All examples use the **STM32F4 Discovery Board** -- a popular, affordable development board with:
- ARM Cortex-M4 processor (168MHz)
- 1MB Flash, 192KB RAM
- Rich peripherals (USB, Ethernet, SPI, I2C, UART, ADC, DAC)
- On-board debugger (ST-Link)
- Extensive community support

## Working Examples (GitHub)

Live code accompanies each topic in this repo:

https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust

## Getting Started

### Prerequisites
- STM32F4 Discovery Board
- USB cable for programming/debugging
- Development computer (Linux/Mac/Windows)

### Toolchain Setup
- **For C++**: GCC ARM toolchain, OpenOCD, CMake
- **For Rust**: rustup, cargo, probe-rs or OpenOCD

### Development Workflow
1. Clone the companion repository
2. Set up your development environment
3. Build and flash example projects
4. Compare implementations and performance

## Why This Approach?

> :nerdygoose: The STM32F4 at 168MHz with 1MB Flash and 192KB RAM is a sweet spot — powerful enough for complex applications (DSP, USB host, TCP/IP stack) but constrained enough that language choices *matter*. You can't hide behind "just throw more RAM at it."
>
> :sharpgoose: Dual implementations on the same hardware eliminate the "well, your chip is faster" argument. When C++ and Rust produce different binary sizes or interrupt latencies on the same Cortex-M4, the difference is in the language and the programmer — nothing else.

### For Learners
- **Direct Comparison**: See the same problem solved two ways
- **Best Practices**: Learn idiomatic patterns in both languages
- **Decision Making**: Understand when to choose each language

### For Professionals
- **Migration Guidance**: Porting strategies between languages
- **Performance Data**: Real benchmarks on identical hardware
- **Safety Analysis**: Memory safety implications in embedded context

> :angrygoose: Don't fall for the "Rust is always safer" or "C++ is always faster" narratives. On embedded, it depends on the pattern. C++ RAII handles resource cleanup beautifully. Rust's ownership prevents DMA buffer aliasing at compile time. Each language has domains where it shines — and traps where it fails.
>
> :happygoose: By the end of this book, you'll be able to pick the right tool for each embedded problem — not based on tribal loyalty, but on measured evidence from real hardware.

## Contributing

This book is open source and community-driven. Contributions are welcome:

- Additional example implementations
- Performance benchmarks
- Comparative analysis
- Documentation improvements
- New project ideas
