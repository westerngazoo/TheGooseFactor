---
sidebar_position: 4
sidebar_label: "Ch 3: Concurrency & Synchronization"
title: "Chapter 3: Concurrency & Synchronization"
---

# Chapter 3: Concurrency & Synchronization

What to know:
- ISR vs thread vs task; priority inversion; latency budgets
- Atomics and memory orders; single-producer/single-consumer rings

> :angrygoose: Memory ordering is the #1 topic where candidates either shine or crash. Saying "I use `memory_order_seq_cst` for everything" is a red flag — it means you don't understand the performance cost. But using `relaxed` incorrectly is worse — it means your code has races you can't see.
>
> :nerdygoose: The key insight: `acquire` on load means "all writes before the paired `release` store are visible to me." This is the fundamental contract of SPSC queues — the producer's `release` store on head publishes the data it just wrote, and the consumer's `acquire` load on head sees that data.

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

> :sharpgoose: Notice the Rust SPSC uses `unsafe` for the buffer write. The `SAFETY` comment is critical — it documents the invariant: only one thread calls `push`. In an interview, if you write `unsafe` Rust, always state the safety contract. It shows you understand *why* the borrow checker can't prove this safe and what you're guaranteeing instead.
>
> :mathgoose: Power-of-two sizing (`N = 1024`) lets you use `& (N-1)` instead of `% N` for wrapping. Modulo is a division, which costs 20-40 cycles on ARM Cortex-M. Bitwise AND costs 1 cycle. On a 10µs ISR budget, those 39 cycles matter.
