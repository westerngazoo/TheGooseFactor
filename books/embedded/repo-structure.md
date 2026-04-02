---
sidebar_position: 99
sidebar_label: "Repository Structure"
title: "Repository Structure"
---

# Repository Structure

Repo layout convention (you can adjust as you build it):
- Drivers live under `drivers/<peripheral>` for both languages
- Non-driver topics are top-level (e.g., `hal`, `rtos`, `wireless`, `sensors_dsp`, `power`, `projects/*`)

Examples:
- C++ drivers: `cpp/drivers/uart`, `cpp/drivers/spi_i2c`, `cpp/drivers/gpio`, `cpp/drivers/timers_pwm`, `cpp/drivers/adc`, `cpp/drivers/dac`, `cpp/drivers/dma`
- Rust drivers: `rust/drivers/uart`, `rust/drivers/spi_i2c`, `rust/drivers/gpio`, `rust/drivers/timers_pwm`, `rust/drivers/adc`, `rust/drivers/dac`, `rust/drivers/dma`

## C++ layout (`cpp/`)
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

## Rust layout (`rust/`)
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

> :sarcasticgoose: C++ gets CMake + toolchain files + linker scripts + OpenOCD config. Rust gets `Cargo.toml` + `.cargo/config.toml` + `memory.x`. Same hardware, same capability, noticeably different ceremony.
>
> :sharpgoose: The mirror structure (both languages having `hal/`, `drivers/`, `projects/`) is deliberate. When comparing implementations, you want to find the C++ UART driver and the Rust UART driver in analogous locations. Structure enables comparison; chaos prevents it.
>
> :nerdygoose: Rust's `defmt` logging is a game-changer for embedded debugging — it encodes log format strings as indices at compile time, so `defmt::info!("temperature: {}", t)` sends ~4 bytes over the wire instead of the full string. On C++ you'd need printf with a custom transport, which costs 10-50x more bandwidth.
