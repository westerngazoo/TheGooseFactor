---
sidebar_position: 8
sidebar_label: "Ch 7: Networking & Distributed"
title: "Chapter 7: Networking & Distributed Systems (Embedded Context)"
---

# Chapter 7: Networking & Distributed Systems (Embedded Context)

What to know:
- MTU vs throughput vs latency; connection churn
- Retries, timeouts, jittered backoff; idempotent ops

Example (C: packet header + CRC):
```c
typedef struct { uint8_t ver; uint8_t typ; uint16_t len; uint16_t crc; } __attribute__((packed)) pkt_hdr_t;
```

Example (C++: exponential backoff with jitter):
```cpp
#include <random>
unsigned backoff_ms(unsigned attempt){
	unsigned base = 1u<< (attempt<8?attempt:8);
	static std::mt19937 rng(123);
	std::uniform_int_distribution<unsigned> d(0, base);
	return 50*base + d(rng); // jittered
}
```

Lab:
- Define a binary protocol (header, payload, CRC); write encoder/decoder and tests
- Implement backoff with jitter and a max retry budget; log outcomes
