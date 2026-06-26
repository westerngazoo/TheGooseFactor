---
sidebar_position: 12
sidebar_label: "Ch 11: Coding Questions"
title: "Chapter 11: Coding Questions (Systems-Flavored)"
---

# Chapter 11: Coding Questions (Systems-Flavored)

What to know:
- Simple, correct, boundary-aware code under constraints.
- How to structure your thinking ("ultrathink" approach) for common coding exercises.
- Designing APIs with clear error boundaries, especially in resource-constrained environments.

## Example 1 (C): Parse Length-Prefixed Frame

A very common interview question is implementing a safe parser for a simple protocol.

**Prompt:** Write a C function to parse a frame from a byte buffer. The frame format is:
`[1 byte SOF (0xAA)] [1 byte Length (L)] [L bytes payload] [1 byte Checksum]`
Return the length of the payload on success, or a negative error code on failure.

**"Ultrathink" Approach:**
1.  **Inputs:** `const uint8_t* buf` (the buffer), `size_t n` (available bytes).
2.  **Boundaries:**
    *   Is the pointer null?
    *   Is `n` large enough to even read the minimum frame size (SOF + Length + Checksum = 3 bytes)?
    *   Does the SOF match `0xAA`?
    *   Does `n` contain the full payload defined by the Length byte plus the trailing Checksum byte?
3.  **Arithmetic:** Check `2 + len + 1 <= n`. Be careful with integer types and promotion.

**Detailed Implementation:**

```c
#include <stdint.h>
#include <stddef.h>

// Error codes
#define ERR_NULL_PTR -1
#define ERR_TOO_SHORT -2
#define ERR_BAD_SOF -3
#define ERR_TRUNCATED -4
#define ERR_BAD_CHECKSUM -5

int parse_frame(const uint8_t* buf, size_t n) {
    if (!buf) return ERR_NULL_PTR;

    // Minimum frame is SOF (1) + LEN (1) + CHKSUM (1) = 3 bytes
    if (n < 3) return ERR_TOO_SHORT;

    if (buf[0] != 0xAA) return ERR_BAD_SOF;

    uint8_t len = buf[1];

    // Total required size is SOF (1) + LEN (1) + payload (len) + CHKSUM (1)
    // which simplifies to 3 + len.
    // Ensure we don't overflow size_t, though `len` is 8-bit so 3+len is safe.
    if (3 + len > n) return ERR_TRUNCATED;

    // Calculate a simple checksum (e.g., sum of payload bytes modulo 256)
    uint8_t expected_checksum = 0;
    for (int i = 0; i < len; ++i) {
        expected_checksum += buf[2 + i];
    }

    if (buf[2 + len] != expected_checksum) return ERR_BAD_CHECKSUM;

    return len; // Success
}
```

> :angrygoose: The boundary checks are the whole point. Empty buffer, one byte, exactly N bytes, off-by-one at the Checksum boundary. If you don't test all of these mentally during the interview, you haven't answered the question properly.

## Example 2 (Rust): Bounded Binary Search

**Prompt:** Find the first input `x` (from `1` to `limit`) where a monotonic predicate `f(x)` returns true. The predicate is expensive (e.g., measuring latency on a real system). Minimize calls to `f(x)`.

**"Ultrathink" Approach:**
1.  **Constraints:** We don't know how large the target is, but it's bounded by `limit`. A naive binary search from `1` to `limit` might test `f(limit/2)` first, which could be very expensive or crash the system if `limit` is huge and the system can't handle it.
2.  **Strategy:** "Exponential search" then "Binary search". Double the guess (`1, 2, 4, 8...`) until `f(guess)` is true or we hit `limit`. This bounds the binary search range to `[guess/2, guess]`.
3.  **Edge cases:** Overflow on doubling. Overflow on `(l+r)/2`.

**Detailed Implementation:**

```rust
pub fn exp_then_bin<F: Fn(usize) -> bool>(limit: usize, ok: F) -> Option<usize> {
    if limit == 0 { return None; }

    let mut hi = 1;
    // Exponential phase: find the upper bound
    while hi < limit && !ok(hi) {
        // Prevent overflow if hi * 2 > usize::MAX
        if let Some(next) = hi.checked_mul(2) {
            hi = next;
        } else {
            hi = limit;
            break;
        }
    }

    // Binary search phase
    let mut l = hi / 2;
    let mut r = hi.min(limit);

    let mut found = false;
    let mut ans = r;

    while l <= r {
        // Safe midpoint calculation avoids `l+r` overflow
        let m = l + (r - l) / 2;
        if ok(m) {
            ans = m;     // Record best answer so far
            found = true;
            if m == 0 { break; } // Prevent underflow on m-1
            r = m - 1;   // Try to find a smaller valid input
        } else {
            l = m + 1;
        }
    }

    if found { Some(ans) } else { None }
}
```

> :nerdygoose: The exponential-then-binary search pattern is $O(\log n)$ with no upfront knowledge of the search space size. It's perfect for embedded scenarios: "find the minimum buffer size where latency stays under 10µs" — you don't know the answer, but you know the predicate is monotonic.
>
> :mathgoose: Watch out for `(l+r)/2` overflow. If `l` and `r` are both close to `usize::MAX`, their sum overflows. The safe version is `l + (r - l) / 2`. In an interview for systems code, mentioning this unprompted shows you think about correctness at the bit level.

## Lab 1: Circular Buffer Operations

**Problem:** Implement a lock-free, single-producer single-consumer (SPSC) circular buffer in C. Assume power-of-two capacity for fast modulo operations.

**"Ultrathink" Breakdown:**
1.  **State:** We need a buffer array, a `head` index (where producer writes), a `tail` index (where consumer reads), and the `capacity` (a mask `capacity - 1`).
2.  **Full/Empty Logic:**
    *   Empty: `head == tail`
    *   Full: `(head - tail) == capacity`. This requires using unsigned integers that naturally wrap around.
3.  **Memory Ordering (Crucial for SPSC):** The producer must write data *before* updating `head`. The consumer must read data *before* updating `tail`. We must use atomic load/store with acquire/release semantics.

**Implementation:**

```c
#include <stdint.h>
#include <stdbool.h>
#include <stdatomic.h>

// Must be power of 2
#define RING_CAPACITY 256
#define RING_MASK (RING_CAPACITY - 1)

typedef struct {
    uint8_t buffer[RING_CAPACITY];
    _Atomic uint32_t head; // Written by producer
    _Atomic uint32_t tail; // Written by consumer
} SPSC_Queue;

void queue_init(SPSC_Queue* q) {
    atomic_init(&q->head, 0);
    atomic_init(&q->tail, 0);
}

bool queue_push(SPSC_Queue* q, uint8_t val) {
    // Relaxed load is fine because only the producer modifies head
    uint32_t head = atomic_load_explicit(&q->head, memory_order_relaxed);

    // Acquire load to ensure we see the latest tail from consumer
    uint32_t tail = atomic_load_explicit(&q->tail, memory_order_acquire);

    if ((head - tail) == RING_CAPACITY) {
        return false; // Full
    }

    q->buffer[head & RING_MASK] = val;

    // Release store: publish the data write before updating head
    atomic_store_explicit(&q->head, head + 1, memory_order_release);
    return true;
}

bool queue_pop(SPSC_Queue* q, uint8_t* out_val) {
    uint32_t tail = atomic_load_explicit(&q->tail, memory_order_relaxed);

    // Acquire load: ensure we see the latest head (and data) from producer
    uint32_t head = atomic_load_explicit(&q->head, memory_order_acquire);

    if (head == tail) {
        return false; // Empty
    }

    *out_val = q->buffer[tail & RING_MASK];

    // Release store: mark slot as free AFTER reading the data
    atomic_store_explicit(&q->tail, tail + 1, memory_order_release);
    return true;
}
```

> :surprisedgoose: Notice we don't use `(head + 1) % capacity == tail` to check for full. By letting 32-bit unsigned integers wrap naturally and checking `head - tail`, we use the full capacity of the buffer without wasting a slot, and we avoid modulo division instructions!
