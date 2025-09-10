---
title: Embedded Systems Programming - C++ vs Rust
slug: /embedded-book
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

All examples use the **STM32F4 Discovery Board** - a popular, affordable development board with:
- ARM Cortex-M4 processor (168MHz)
- 1MB Flash, 192KB RAM
- Rich peripherals (USB, Ethernet, SPI, I2C, UART, ADC, DAC)
- On-board debugger (ST-Link)
- Extensive community support

## Book Structure

### Part I: Foundations
1. **Embedded Programming Fundamentals**
   - Memory constraints and optimization
   - Real-time requirements
   - Hardware abstraction concepts
   - Development toolchain setup

2. **Development Environment**
   - Toolchain installation (GCC ARM, Rust)
   - Debuggers and programming tools
   - RTOS basics and scheduling concepts

### Part II: Core Concepts

#### Chapter 3: Hardware Abstraction Layer (HAL)
**C++ Implementation:**
- Modern C++ HAL design patterns
- RAII for peripheral management
- Template metaprogramming for type safety
- Memory-mapped I/O abstractions

**Rust Implementation:**
- Embedded-hal traits and ecosystem
- Type-safe peripheral access
- Ownership and borrowing for hardware
- Compile-time peripheral configuration

#### Chapter 4: GPIO and Digital I/O
**C++ Implementation:**
- Register-level GPIO control
- Pin abstraction with templates
- Interrupt handling patterns
- Debouncing and input processing

**Rust Implementation:**
- GPIO pin types and traits
- Type-level pin configuration
- Async interrupt handling
- Safe concurrent access patterns

#### Chapter 5: Timers and PWM
**C++ Implementation:**
- Timer peripheral abstraction
- PWM signal generation
- Precise timing and delays
- Timer-based scheduling

**Rust Implementation:**
- Timer traits and implementations
- Async delay patterns
- PWM abstractions
- Real-time scheduling foundations

### Part III: Communication Protocols

#### Chapter 6: UART Serial Communication
**C++ Implementation:**
- UART driver with buffering
- Interrupt-driven I/O
- Error handling and recovery
- Protocol implementation

**Rust Implementation:**
- Serial traits and implementations
- Async serial communication
- Error handling with Result types
- Embedded-io ecosystem

#### Chapter 7: SPI and I2C
**C++ Implementation:**
- Master/slave SPI implementation
- I2C device driver patterns
- DMA integration
- Multi-device management

**Rust Implementation:**
- SPI traits and bus sharing
- I2C device abstractions
- Safe DMA operations
- Device driver ecosystem

### Part IV: Advanced Topics

#### Chapter 8: Real-Time Operating Systems
**C++ Implementation:**
- FreeRTOS integration
- Task scheduling patterns
- Inter-task communication
- Memory management in RTOS

**Rust Implementation:**
- RTIC (Real-Time Interrupt-driven Concurrency)
- Async task management
- Message passing patterns
- Memory safety in RTOS context

#### Chapter 9: Wireless Communication
**C++ Implementation:**
- Bluetooth Low Energy (BLE) stack
- WiFi connectivity patterns
- Mesh networking concepts
- Power optimization

**Rust Implementation:**
- BLE with nrf-softdevice
- WiFi with esp-wifi
- Embedded networking stacks
- Async networking patterns

#### Chapter 10: Sensor Integration and Signal Processing
**C++ Implementation:**
- ADC/DAC abstractions
- Sensor fusion algorithms
- Digital signal processing
- Kalman filtering

**Rust Implementation:**
- Type-safe sensor interfaces
- Async sensor reading patterns
- DSP libraries and crates
- Real-time signal processing

### Part V: Performance and Optimization

#### Chapter 11: Benchmarking and Profiling
**C++ Implementation:**
- Performance measurement techniques
- Code size optimization
- Memory usage analysis
- Real-time profiling

**Rust Implementation:**
- Benchmarking with criterion
- Code size analysis
- Memory profiling tools
- Performance optimization patterns

#### Chapter 12: Power Management
**C++ Implementation:**
- Low-power mode implementations
- Clock scaling strategies
- Peripheral power control
- Energy profiling

**Rust Implementation:**
- Power management traits
- Clock control abstractions
- Sleep mode implementations
- Battery-aware programming

### Part VI: Real-World Projects

#### Chapter 13: IoT Environmental Monitor
**C++ Implementation:**
- Sensor data collection
- Wireless data transmission
- Power-efficient operation
- Data logging and storage

**Rust Implementation:**
- Async sensor reading
- Embedded networking
- Efficient data handling
- Safe concurrent operations

#### Chapter 14: Motor Control System
**C++ Implementation:**
- PWM motor control
- Encoder feedback
- PID control algorithms
- Safety interlocks

**Rust Implementation:**
- Type-safe motor control
- Async control loops
- Real-time performance guarantees
- Safe hardware access

#### Chapter 15: Custom RTOS Implementation
**C++ Implementation:**
- Cooperative scheduler
- Memory management
- Inter-task communication
- Real-time guarantees

**Rust Implementation:**
- Async runtime design
- Memory-safe task management
- Type-safe message passing
- Real-time scheduling

## Comparative Analysis Chapters

### Chapter 16: Performance Comparison
- Execution speed benchmarks
- Code size analysis
- Memory usage patterns
- Power consumption metrics

### Chapter 17: Development Experience
- Compile times and iteration speed
- Debugging capabilities
- Toolchain maturity
- Learning curve analysis

### Chapter 18: Safety and Reliability
- Memory safety guarantees
- Undefined behavior prevention
- Testing strategies
- Long-term maintenance

### Chapter 19: Ecosystem and Community
- Library availability
- Community support
- Documentation quality
- Industry adoption

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

## Repository Structure

```
embedded-cpp-rust/
├── cpp-implementations/
│   ├── hal/           # Hardware abstraction layer
│   ├── drivers/       # Peripheral drivers
│   ├── examples/      # Example projects
│   └── benchmarks/    # Performance tests
├── rust-implementations/
│   ├── src/
│   │   ├── hal.rs     # Hardware abstraction
│   │   ├── drivers/   # Peripheral drivers
│   │   └── examples/  # Example projects
│   └── benches/       # Performance benchmarks
├── shared-hardware/
│   ├── stm32f4/       # Board-specific code
│   └── common/        # Shared utilities
└── docs/
    ├── setup/         # Setup guides
    ├── comparisons/   # Comparative analysis
    └── projects/      # Project documentation
```

## Why This Approach?

### For Learners
- **Direct Comparison**: See the same problem solved two ways
- **Best Practices**: Learn idiomatic patterns in both languages
- **Decision Making**: Understand when to choose each language

### For Professionals
- **Migration Guidance**: Porting strategies between languages
- **Performance Data**: Real benchmarks on identical hardware
- **Safety Analysis**: Memory safety implications in embedded context

### For Teams
- **Technology Evaluation**: Data-driven language selection
- **Skill Development**: Cross-training opportunities
- **Architecture Decisions**: Informed choices for embedded projects

## Part VII: Cracking the Modern Systems Interview

This part moved to its own page for easier navigation and sharing.

Read it here: [Embedded Systems Interview](/systems-interview)

—

## Contributing

This book is open source and community-driven. Contributions are welcome:

- Additional example implementations
- Performance benchmarks
- Comparative analysis
- Documentation improvements
- New project ideas

## License

This work is licensed under the MIT License. The companion code repository contains the implementations and examples.

---

*Ready to start your embedded journey? Let's build something amazing with both C++ and Rust!* 🚀
