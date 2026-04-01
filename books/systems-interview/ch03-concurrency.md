---
sidebar_position: 4
sidebar_label: "Ch 3: Concurrency & Synchronization"
title: "Chapter 3: Concurrency & Synchronization"
---

# Chapter 3: Concurrency & Synchronization

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
