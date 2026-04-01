---
sidebar_position: 7
sidebar_label: "Ch 6: Drivers, Buses & Protocols"
title: "Chapter 6: Drivers, Buses, and Protocols"
---

# Chapter 6: Drivers, Buses, and Protocols

What to know:
- UART/SPI/I2C basics; DMA; framing and error recovery
- HAL APIs and ISR handoff patterns

Example (C: UART RX ISR into ring):
```c
volatile uint8_t UART_DR; // device register
extern void uart_isr(void){
	uint8_t b = UART_DR; // read data
	spsc_push(&uart_rx_ring, b); // from Chapter 3
}
```

Example (Rust + embedded-hal read trait):
```rust
use embedded_hal::serial::Read;
fn poll_uart<U: Read<u8>>(uart: &mut U){
	if let Ok(b) = uart.read(){ /* push to ring */ }
}
```

Lab:
- Implement a UART RX with overflow counter and simple framing (e.g., newline)
- Add backpressure: drop or overwrite policy; document decision
