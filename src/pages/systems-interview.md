---
title: Embedded Systems Interview
slug: /systems-interview
---

# Embedded Systems Interview

This page focuses on embedded systems interviews and prepares you for roles using C, modern C++ (17/20/23), and Rust (no_std). You’ll get targeted drills, labs, and evaluation checklists with side‑by‑side guidance across C, C++, and Rust where relevant.

## Chapter 1: Interview Map & Strategy

Scope: embedded device roles (bare‑metal and RTOS) using C, modern C++ (17/20/23), and Rust (no_std).

### What companies actually test (signal vs noise)
- Systems fundamentals: CPU/memory, I/O, timing, data movement
- Concurrency judgment: when to use interrupts/threads/queues; race detection; latency bounds
- Debugging process: reproduce → isolate → measure → hypothesize → patch → validate
- Practical design: APIs, backpressure, error budgets, observability, upgrade paths (OTA)
- Communication: requirements, trade‑offs, constraints, and clear written artifacts

Noise to de‑prioritize: trick puzzles, excessive big‑O brainteasers unrelated to devices, niche language trivia.

### Four prep tracks (run them in parallel)
1) Fundamentals: memory hierarchy, MMIO, DMA, bit ops, endianness, CRCs
2) Concurrency: ISRs vs tasks, queues/ring buffers, atomics/memory ordering
3) Systems design: driver/HAL shapes, protocols, RTOS scheduling, failure modes
4) Hands‑on debugging: build harnesses, inject faults, collect evidence, write fixes

Daily cadence (60–90 min):
- 15–20 min fundamentals drills (latency math, bitwise, packet math)
- 25–40 min hands‑on (tiny lab or code kata)
- 10–15 min artifact polish (README snippet, diagram, or note)

Weekend deep‑dive (2–4 hrs): pick one lab, build a small demo with a micro benchmark and a short write‑up.

### 30/60/90‑day roadmap (choose an archetype to anchor: smart speaker, e‑reader, streaming stick, battery camera, home router, or earbuds/wearables)
Day 0 setup (2–3 hrs):
- Pick one archetype and list top 5 constraints (e.g., smart speaker: wake‑word latency, audio DMA, Wi‑Fi handoff)
- Create a repo or folder for labs; add a simple benchmark harness template
- Make a living checklist (below) and a single‑page resume draft

By Day 30 (Foundations + 1 demo):
- Fundamentals: latency ladder, MMIO vs cached memory, CRC math – can explain and apply
- Concurrency: implement an SPSC ring buffer with tests and bounds
- Demo: one end‑to‑end lab relevant to your archetype (e.g., UART RX + overflow counter)

By Day 60 (Concurrency + 2–3 demos):
- Add an ISR handoff pattern and backpressure to a driver or logger
- Design exercise: RTOS task set with deadlines and jitter bounds; justify stack sizes
- Two mock interviews (one design, one debugging) with written feedback

By Day 90 (Polish + performance):
- Performance pass: measure, find hot paths, validate speedups with before/after plots
- Portfolio: tidy READMEs, reproduce scripts, small GIF/video of demos
- Story bank: 5 concise stories (failure, recovery, trade‑off, incident response, teamwork)

### Artifact prep (interviewer‑visible)
- Resume bullets: action + problem + scale + result (with numbers). Example: “Cut ISR logging latency 3.2ms→0.6ms by SPSC ring + DMA; bounded loss under overload.”
- Portfolio structure: labs/driver‑style folders with BUILD/RUN instructions and 60‑second READMEs
- Diagrams: one page per lab (timing diagram, data flow, error paths)
- Lab notebook: short posts (like this site) linking to code and measurements

### Day‑of playbook
- Clarify constraints first (latency, throughput, memory, power, failure modes)
- Think in artifacts: quick timing diagram, interface sketch, test harness outline
- State trade‑offs (throughput vs latency, RAM vs CPU, safety vs performance)
- For debugging questions: ask for a repro, add a probe, bisect, propose minimal patch, list risks

### Readiness checklist
- [ ] I can explain cache vs MMIO effects on loads/stores and when to use volatile/barriers
- [ ] I can design/justify a ring buffer and its memory ordering requirements
- [ ] I can outline an ISR→worker handoff with bounded latency and backpressure
- [ ] I can size stacks and reason about WCET and jitter
- [ ] I can build a small benchmark, measure properly, and report deltas
- [ ] I have two short demos and a repo others can run in under 5 minutes

### Mock prompts to practice this week
- Design a resilient UART RX path with overflow counters and a background parser; justify buffer size and latency budget
- Build an exponential backoff with jitter for flaky Wi‑Fi reconnect; show retry caps and telemetry
- Sketch a packet format with versioning + CRC; describe upgrade compatibility and error handling

Tip: Tie each prompt to your chosen archetype (e.g., smart speaker: audio ring + wake‑word latency; e‑reader: power‑aware state machine; battery camera: pre‑trigger frame buffer).

### Day 0 setup: your repo skeleton
Create a small, reproducible layout you’ll reuse across labs.

```
embedded-interview/
	labs/
		01-crc16/
		02-spsc-ring/
		03-uart-rx/
		04-backoff-jitter/
	scripts/
		run_bench.sh
	docs/
		README.md
		lab-notes/
```

Recommended: keep each lab self-contained with a minimal README, inputs/outputs, and a quick test/bench harness.

### Templates you’ll reuse
- Design prompt template:
	- Problem: what/why (constraints: latency/throughput/memory/power)
	- Interfaces: inputs, outputs, error types, backpressure
	- Data flow: diagram, timing notes, ISR→worker handoff if relevant
	- Risks: failure modes, mitigations, observability
	- Test plan: happy path, overload, fault injection, rollback

- Debugging report template:
	- Repro: steps, environment, frequency
	- Observations: logs, timings, counters, memory use
	- Hypotheses tried: change, expected, observed
	- Fix: minimal patch, risk, rollback plan
	- Verification: before/after metrics

- Resume bullet template:
	- “Action verb + what + scale + result.” Example: “Reduced ISR logging latency from 3.2 ms to 0.6 ms via SPSC ring + DMA; bounded loss under overload.”

### Example week 1 plan
- Day 1: CRC fundamentals + vectors; write a 60‑sec README
- Day 2: SPSC push/pop happy path + wraparound test
- Day 3: SPSC under load; measure throughput and drops
- Day 4: UART RX ISR → ring; add overflow counter
- Day 5: Backoff with jitter; cap retries; basic telemetry
- Weekend: 2‑hour deep dive to polish one lab and record results

### Mock interview rubric (quick score 1–5)
- Fundamentals (caches/MMIO/latency math)
- Concurrency (ISR handoff, memory ordering, queues)
- Design (API clarity, backpressure, failure modes)
- Debugging (reproduce, instrument, bisect, validate)
- Communication (trade‑offs, diagrams, crisp artifacts)

### Prep tracker (check off weekly)
- [ ] Finish one fundamentals drill and one lab
- [ ] Add before/after metrics to a lab and a brief note
- [ ] Do one mock (design or debugging) and capture feedback
- [ ] Improve one artifact: README, diagram, or test harness

### Signals weighting (what matters most)
- Fundamentals: 25% — memory hierarchy, MMIO, latency math, bit/CRC
- Concurrency: 25% — ISR handoff, atomics/memory ordering, queues/backpressure
- Systems design: 25% — APIs, failure modes, observability, upgrade paths
- Debugging: 15% — reproduce, instrument, bisect, validate
- Communication: 10% — clear written artifacts, diagrams, trade‑offs

Use this to prioritize practice time and tailor your portfolio demos.

### Evidence rubrics (5‑level scale)
- Memory ordering explanation
	- 1: Vague “happens‑before” hand‑waving
	- 3: Correctly uses acquire/release with an SPSC example
	- 5: Can derive why relaxed is unsafe for consumer load; maps to real bug
- ISR→worker handoff design
	- 1: “Just use a queue”
	- 3: SPSC ring with overflow counter and drop policy
	- 5: Backpressure, telemetry, bounded latency proof with measurements
- Debugging process
	- 1: Guess fixes
	- 3: Repro + logging + binary search to culprit
	- 5: Fault injection harness, fix, regression test, risk/rollback plan

### Experiment design for labs (contract)
- Problem statement: clear scope, constraints, and success criteria
- Invariants: what must always hold (e.g., no data loss below rate X)
- Metrics: latency, throughput, drops, power, memory; define units
- Instrumentation: timestamps, counters, GPIO toggle, cycle counter
- Protocol: runs, warmup, repetition count, variance reporting
- Confounders: cache warm/cold, IRQ load, DMA contention, power state
- Interpretation: hypothesis, result, alternate explanations, next step

### Benchmark harness standards (minimal but rigorous)
- Stable timing source (hrtimer, cycle counter, or monotonic clock)
- Warmup runs, then N repeated trials; report mean, p50, p95
- Fixed input sizes and randomized variants; pin thread/IRQ if applicable
- Report environment (toolchain, flags, CPU/board); check in scripts

### Schedules by time budget (per week)
- 10 hours: 3 drills, 1 lab, 1 mock, 1 artifact polish
- 20 hours: 6 drills, 2 labs, 1 design mock, 1 debugging mock
- 40 hours: 10 drills, 3 labs (one end‑to‑end), 3 mocks, full portfolio pass

### Failure‑mode taxonomy (embedded focus)
- Timing: jitter, missed deadlines, priority inversion, ISR starvation
- Concurrency: ABA, torn reads, insufficient barriers, reentrancy bugs
- I/O: framing errors, overflow/underflow, DMA descriptor misconfig
- Memory: aliasing UB, stack overflows, fragmentation, stale cache
- Power: brownouts, sleep state surprises, wake race, clock instability
- Updates: partial OTA, version skew, rollback gaps, schema drift

For each lab/design, list which failure modes you handle and how you observe them.

## Chapter 2: Core Systems Fundamentals
What to know:
- CPU caches vs MMIO; cache lines, alignment, padding
- Latency ladder (ns → µs → ms) and quick math
- Two’s complement, endianness, CRC basics
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

## Chapter 3: Concurrency & Synchronization
What to know:
- ISR vs thread vs task; priority inversion; latency budgets
- Atomics and memory orders; single-producer/single-consumer rings

Example (C11: SPSC ring buffer):
```c
#include <stdatomic.h>
#include <stdint.h>
#define N 1024
typedef struct{ uint8_t buf[N]; atomic_uint head, tail; } spsc_t;
void spsc_init(spsc_t* q){ atomic_init(&q->head,0); atomic_init(&q->tail,0); }
int spsc_push(spsc_t* q, uint8_t v){
	unsigned h = atomic_load_explicit(&q->head, memory_order_relaxed);
	unsigned t = atomic_load_explicit(&q->tail, memory_order_acquire);
	if(((h+1)&(N-1))==t) return 0; // full
	q->buf[h]=v;
	atomic_store_explicit(&q->head,(h+1)&(N-1), memory_order_release);
	return 1;
}
int spsc_pop(spsc_t* q, uint8_t* out){
	unsigned t = atomic_load_explicit(&q->tail, memory_order_relaxed);
	unsigned h = atomic_load_explicit(&q->head, memory_order_acquire);
	if(t==h) return 0; // empty
	*out = q->buf[t];
	atomic_store_explicit(&q->tail,(t+1)&(N-1), memory_order_release);
	return 1;
}
```

Example (Rust: SPSC indices):
```rust
use core::sync::atomic::{AtomicUsize, Ordering};
pub struct Spsc<const N: usize> {
	buf: [u8; N], head: AtomicUsize, tail: AtomicUsize,
}
impl<const N: usize> Spsc<N> {
	pub const fn new(init: u8) -> Self { Self{ buf: [init; N], head: AtomicUsize::new(0), tail: AtomicUsize::new(0) } }
	pub fn push(&self, v:u8)->bool{
		let h = self.head.load(Ordering::Relaxed);
		let t = self.tail.load(Ordering::Acquire);
		if ((h+1)&(N-1))==t { return false }
		// SAFETY: single producer only
		unsafe { *self.buf.as_ptr().cast::<u8>().add(h) = v; }
		self.head.store((h+1)&(N-1), Ordering::Release);
		true
	}
}
```

Lab:
- Implement an 8-bit SPSC ring (power-of-two size) and measure throughput
- Add watermarks and overflow counters; report bounded latency under load

## Chapter 4: Memory, Pointers, and Ownership
What to know:
- C++ RAII and move semantics for resources (GPIO, DMA, files)
- Rust ownership/borrowing and Send/Sync across ISRs
- C aliasing rules; restrict; padding/UB pitfalls

Example (C++ RAII GPIO):
```cpp
struct GpioPin { int id; bool owned; GpioPin(int id):id(id),owned(true){/*cfg*/} ~GpioPin(){ if(owned){/*deinit*/} }
	GpioPin(const GpioPin&)=delete; GpioPin& operator=(const GpioPin&)=delete;
	GpioPin(GpioPin&& o) noexcept : id(o.id), owned(o.owned){ o.owned=false; }
};
```

Example (C: aliasing with restrict):
```c
void axpy(int n, float a, float* restrict y, const float* restrict x){
	for(int i=0;i<n;++i) y[i]+=a*x[i];
}
```

Example (Rust: ownership wrapper):
```rust
pub struct Buffer<'a> { data: &'a mut [u8] }
impl<'a> Buffer<'a>{ pub fn clear(&mut self){ for b in &mut self.data { *b = 0; } } }
```

Lab:
- Build a fixed-capacity arena in C and in Rust; prove no dynamic allocation
- Show a GPIO RAII handle in C++ that cannot be copied, only moved

## Chapter 5: RTOS & Scheduling Drills
What to know:
- Cooperative vs preemptive; period/deadline/jitter; queue vs mailbox

Example (FreeRTOS periodic task skeleton):
```c
void vSampler(void* arg){ TickType_t last = xTaskGetTickCount();
	for(;;){ sample_once(); vTaskDelayUntil(&last, pdMS_TO_TICKS(10)); }
}
```

Example (RTIC skeleton, Rust):
```rust
#[rtic::app(device = crate::pac)]
mod app{
	#[task(schedule = [tick])]
	fn tick(cx: tick::Context){ /* do work */ cx.schedule.tick(cx.scheduled + 10.millis()).ok(); }
}
```

Lab:
- Design a 3-task pipeline with deadlines; justify periods and stack sizes
- Add a watchdog and demonstrate recovery from a stuck task

## Chapter 6: Drivers, Buses, and Protocols
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

## Chapter 7: Networking & Distributed Systems (Embedded Context)
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

## Chapter 8: Performance Engineering & Profiling
What to know:
- “Measure first” discipline; cycle counters or timers
- Reducing variance; reporting deltas, not absolutes

Example (C++: micro-benchmark harness):
```cpp
#include <chrono>
template<typename F> long bench(F f,int it){
	using C=std::chrono::high_resolution_clock; auto s=C::now();
	for(int i=0;i<it;++i) f();
	auto e=C::now(); return std::chrono::duration_cast<std::chrono::nanoseconds>(e-s).count();
}
```

Lab:
- Benchmark two implementations (branchy vs LUT); report mean and p95 over 30 runs
- Show before/after for an inlined hot path with cache-friendly layout

## Chapter 9: Debugging & Failure Analysis
What to know:
- Reproduce; minimize; instrument; bisect; validate

Example (C: simple tracing macro):
```c
#include <stdio.h>
#define TRACE(tag, x) do{ printf("%s: %ld\n", tag, (long)(x)); }while(0)
```

Lab:
- Build a repro harness for an intermittent bug; add counters and timing traces
- Use binary search to localize; produce a minimal patch and a risk list

## Chapter 10: Hands‑on Whiteboard‑Free Labs
What to know:
- Read unfamiliar code; make safe local fixes; justify trade-offs

Example (C: bounded logger outline):
```c
int log_push(const char* msg); // returns 0 if dropped due to backpressure
```

Lab:
- Fix a timing bug in a periodic task; document cause and validation
- Design a sensor driver API; define error handling and init contract

## Chapter 11: Coding Questions (Systems‑Flavored)
What to know:
- Simple, correct, boundary-aware code under constraints

Example (C: parse length-prefixed frame):
```c
int parse_frame(const uint8_t* buf, int n){ if(n<3) return -1; int len=buf[1]; if(2+len+1>n) return -2; /* verify CRC here */ return len; }
```

Example (Rust: bounded binary search):
```rust
pub fn exp_then_bin<F: Fn(usize)->bool>(limit:usize, ok:F)->Option<usize>{
	let mut hi=1; while hi<limit && !ok(hi){ hi*=2; }
	let (mut l, mut r)=(hi/2, hi.min(limit)); while l<r { let m=(l+r)/2; if ok(m){ r=m } else { l=m+1 } }
	if ok(l){ Some(l) } else { None }
}
```

Lab:
- Implement circular buffer ops: push, pop, peek, count; test wrap-around
- Implement time-bounded search for first true in monotonic predicate

## Chapter 12: Portfolio & Behavioral for Systems Roles
What to know:
- Choose artifacts that demonstrate depth and reliability thinking

Examples of portfolio pieces:
- Driver with DMA + ISR handoff + backpressure + tests
- RTOS task set with deadlines and watchdog recovery demo
- Protocol parser with fuzzer and CRC/versioning tests

Lab:
- Create a one-page README per project with scope, how to run, and a 60-second video/GIF
- Write 5 story-bank bullets (context → action → result) with metrics

## Quick Readiness Checklist
- [ ] I can explain memory ordering in terms of real bugs
- [ ] I can size stacks and bound worst‑case latency for a task set
- [ ] I can design a DMA‑backed driver with safe ISR handoff
- [ ] I can build and defend a packet protocol (framing, CRC, versioning)
- [ ] I can profile, identify true hotspots, and validate speedups

## Practice Prompts (Sample)
- Implement an SPSC ring buffer with wrap‑around and no allocation
- Design an ISR‑safe logging pipeline with bounded loss under overload
- Compare C++ RAII vs Rust ownership for a GPIO pin abstraction

