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

Lab:
- Write a latency ladder note with typical numbers (L1, L2, DRAM, flash, network)
- Implement crc16_ccitt and verify against known vectors
- Align a struct to 32 bytes and measure memcpy vs unaligned (desktop ok)

Evaluation rubric (quick):
- Inputs/outputs: clearly defined function signatures and units
- Correctness: passes at least 3 known CRC vectors and an endian sanity test
- Performance: memcpy test reports size, alignment, and timing with at least 5 runs
- Clarity: short README describing results and one gotcha you learned
