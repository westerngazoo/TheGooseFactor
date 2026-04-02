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

> :sharpgoose: The `volatile` on `UART_DR` is non-negotiable. Without it, the compiler may read the data register once, cache it, and never re-read — your ISR processes the same byte forever while the FIFO overflows silently. In an interview, forgetting `volatile` on MMIO registers is an instant red flag.
>
> :happygoose: Rust's `embedded-hal` trait system is elegant for interviews. You write `fn poll_uart<U: Read<u8>>(uart: &mut U)` — generic over *any* UART implementation. Same code works on STM32, nRF52, or your mock test harness. Show this pattern and explain why it makes drivers testable without hardware.
>
> :angrygoose: Drop vs overwrite policy is a *design decision*, not an implementation detail. Dropping (tail drop) preserves old data but loses new. Overwriting (head drop) gives you the freshest data but loses history. For a sensor stream, overwrite is usually right. For a command queue, drop is usually right. In an interview, *justify your choice*.
