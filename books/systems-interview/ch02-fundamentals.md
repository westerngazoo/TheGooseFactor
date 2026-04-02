---
sidebar_position: 3
sidebar_label: "Ch 2: Core Systems Fundamentals"
title: "Chapter 2: Core Systems Fundamentals"
---

# Chapter 2: Core Systems Fundamentals

What to know:
- CPU caches vs MMIO; cache lines, alignment, padding
- Latency ladder (ns → µs → ms) and quick math
- Two's complement, endianness, CRC basics
- GPIO, timers, interrupts, DMA: what moves data where

Example (C: CRC16-CCITT):
```c
#include <stdint.h>
uint16_t crc16_ccitt(const uint8_t* data, int len){
	uint16_t crc = 0xFFFF;
	for(int i=0;i<len;++i){
		crc ^= (uint16_t)data[i] << 8;
		for(int b=0;b<8;++b)
			crc = (crc & 0x8000) ? (crc<<1) ^ 0x1021 : (crc<<1);
	}
	return crc;
}
```

Example (C: endianness check):
```c
#include <stdint.h>
int is_little_endian(){ uint16_t x=1; return *(uint8_t*)&x==1; }
```

> :surprisedgoose: That endianness check is technically undefined behavior in C — it violates strict aliasing. In practice every compiler handles it, but the "correct" way is `memcpy` into a `uint8_t`. Welcome to embedded C, where "works everywhere" and "standard-compliant" are different things.
>
> :nerdygoose: The CRC polynomial `0x1021` (CRC-CCITT) is used in Bluetooth, XMODEM, and SD cards. Know this one cold — interviewers love asking "what polynomial does your protocol use and why?" The answer: it detects all single and double bit errors, all odd-count errors, and all burst errors ≤16 bits.

Lab:
- Write a latency ladder note with typical numbers (L1, L2, DRAM, flash, network)
- Implement crc16_ccitt and verify against known vectors
- Align a struct to 32 bytes and measure memcpy vs unaligned (desktop ok)

Evaluation rubric (quick):
- Inputs/outputs: clearly defined function signatures and units
- Correctness: passes at least 3 known CRC vectors and an endian sanity test
- Performance: memcpy test reports size, alignment, and timing with at least 5 runs
- Clarity: short README describing results and one gotcha you learned
