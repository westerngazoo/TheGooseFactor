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

## Working Examples (GitHub)

Live code accompanies each topic in this repo:

→ https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust

Repo layout convention (you can adjust as you build it):
- Drivers live under `drivers/<peripheral>` for both languages
- Non-driver topics are top-level (e.g., `hal`, `rtos`, `wireless`, `sensors_dsp`, `power`, `projects/*`)

Examples:
- C++ drivers: `cpp/drivers/uart`, `cpp/drivers/spi_i2c`, `cpp/drivers/gpio`, `cpp/drivers/timers_pwm`, `cpp/drivers/adc`, `cpp/drivers/dac`, `cpp/drivers/dma`
- Rust drivers: `rust/drivers/uart`, `rust/drivers/spi_i2c`, `rust/drivers/gpio`, `rust/drivers/timers_pwm`, `rust/drivers/adc`, `rust/drivers/dac`, `rust/drivers/dma`

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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/hal
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/hal
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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/drivers/gpio
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/drivers/gpio
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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/drivers/timers_pwm
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/drivers/timers_pwm
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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/drivers/uart
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/drivers/uart
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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/drivers/spi_i2c
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/drivers/spi_i2c
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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/rtos
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/rtos
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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/wireless
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/wireless
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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/sensors_dsp
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/sensors_dsp
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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/benchmarking
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/benchmarking
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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/power
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/power
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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/projects/iot_monitor
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/projects/iot_monitor
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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/projects/motor_control
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/projects/motor_control
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
Working examples:
- C++: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/cpp/projects/custom_rtos
- Rust: https://github.com/westerngazoo/Embedded-Systems-Programming-Cpp-vs-Rust/tree/main/rust/projects/custom_rtos
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

## Repository Structure (language-separated)

Top-level organization in your examples repo:

```
Embedded-Systems-Programming-Cpp-vs-Rust/
├── cpp/
└── rust/
```

### C++ layout (`cpp/`)
```
cpp/
├── hal/                # Hardware abstraction layer (C++17/20)
├── drivers/            # UART, SPI, I2C, ADC/DAC, etc.
├── rtos/               # FreeRTOS integrations and patterns
├── sensors_dsp/
├── wireless/
├── power/
├── projects/
│   ├── iot_monitor/
│   ├── motor_control/
│   └── custom_rtos/
├── common/             # Board-agnostic utilities (logging, ring buffers)
├── boards/
│   └── stm32f4/        # Startup, linker script, board cfg
├── benchmarks/         # Micro/functional benchmarks
├── tests/              # Desktop-hosted tests where feasible
├── cmake/              # CMake modules/toolchain files
├── toolchain/          # GCC/Clang flags, OpenOCD cfg
├── scripts/            # flash, openocd, bench scripts
└── README.md
```

Build tool: CMake + arm-none-eabi-gcc (or clang). Provide a top-level CMakeLists.txt per subproject and a toolchain file. Favor separate libraries (hal, drivers) and small example executables in each topic folder.

### Rust layout (`rust/`)
```
rust/
├── Cargo.toml          # Workspace
├── .cargo/
│   └── config.toml     # Target, runner (probe-rs), rustflags
├── hal/                # crate: hal
│   ├── Cargo.toml
│   └── src/lib.rs
├── drivers/            # crate: drivers
│   ├── Cargo.toml
│   └── src/lib.rs
├── rtos/               # crate: rtos (e.g., RTIC examples)
├── sensors_dsp/        # crate: sensors_dsp
├── wireless/           # crate: wireless
├── power/              # crate: power
├── projects/
│   ├── iot_monitor/    # bin crate
│   │   ├── Cargo.toml
│   │   └── src/main.rs
│   ├── motor_control/
│   └── custom_rtos/
├── benches/            # criterion or custom benches (desktop/hosted)
├── examples/           # small example bins per crate
├── boards/
│   └── stm32f4/        # memory.x, feature flags, BSP helpers
├── xtask/              # optional automation crate
└── README.md
```

Workspace members example (in `rust/Cargo.toml`): hal, drivers, rtos, sensors_dsp, wireless, power, projects/*.

Build tool: cargo + probe-rs/OpenOCD. Use features for board selection and enable `no_std` + `defmt` logging where helpful.

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
