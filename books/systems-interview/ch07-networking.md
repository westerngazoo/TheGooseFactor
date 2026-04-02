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

> :mathgoose: The jittered backoff formula: `delay = base × 2^attempt + uniform(0, base × 2^attempt)`. Without jitter, 1000 devices that fail simultaneously will all retry at the same time, fail again, and create a retry thundering herd. Jitter decorrelates retries — it's the difference between "one retry spike" and "load smoothed over the window."
>
> :sarcasticgoose: `__attribute__((packed))` on that struct looks innocent until you try to access the `uint16_t` fields on an ARM Cortex-M0 that doesn't support unaligned access. Hard fault. Fun debugging session. Either align your fields or use byte-level reads and shift them together.
>
> :angrygoose: Max retry budget isn't just a nice-to-have — without it, a device with a dead Wi-Fi AP will retry exponentially forever, draining its battery in hours. Cap retries, enter a sleep-and-retry-later state, and log the failure. The interviewer wants to hear you think about power and failure *together*.
