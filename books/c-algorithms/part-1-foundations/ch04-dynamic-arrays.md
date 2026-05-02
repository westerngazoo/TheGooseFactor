---
sidebar_position: 4
sidebar_label: "Ch 4: Dynamic Arrays"
title: "Chapter 4: Dynamic Arrays — and the First Amortization Proof"
---

# Chapter 4: Dynamic Arrays — and the First Amortization Proof

A dynamic array is the most-used data structure in computing. It is `std::vector` in C++, `list` in Python, `[]` in JavaScript, `ArrayList` in Java, `Vec<T>` in Rust. In C, you write it yourself — and that's good, because writing it yourself is the cleanest way to see why amortized $\Theta(1)$ push works, what "doubling" actually buys you, and where the cost goes when the proof breaks.

## The Structure

A dynamic array stores elements in a contiguous heap buffer. It tracks how many elements it currently holds (`len`) and how many it has room for (`cap`). When `len` reaches `cap`, the buffer grows.

```c
// include/algo/vec.h
#ifndef ALGO_VEC_H
#define ALGO_VEC_H

#include <stddef.h>
#include <stdbool.h>

typedef struct vec_int {
    int    *data;
    size_t  len;
    size_t  cap;
} vec_int_t;

void  vec_init(vec_int_t *v);
void  vec_free(vec_int_t *v);

[[nodiscard]] int   vec_push(vec_int_t *v, int x);
[[nodiscard]] bool  vec_pop (vec_int_t *v, int *out);

int   vec_get (const vec_int_t *v, size_t i);
void  vec_set (vec_int_t *v, size_t i, int x);

// Reserve capacity for at least n elements.
[[nodiscard]] int vec_reserve(vec_int_t *v, size_t n);

#endif
```

Three integer fields, six functions, fifty lines. That's the whole interface.

> :sharpgoose: Two design choices worth flagging. First, `int` is hardcoded — this is plain C, no templates. Generic versions come later (Chapter 11) using macros or `void *`. Second, `vec_push` returns `int` (0 on success, -1 on OOM), not `bool`, leaving room for richer error codes later. `[[nodiscard]]` warns the caller if they ignore it.

## The Implementation

```c
// src/vec.c
#include "algo/vec.h"
#include <stdlib.h>
#include <stdckdint.h>      // C23: ckd_mul for safe size arithmetic
#include <assert.h>

constexpr size_t INITIAL_CAP = 8;

void vec_init(vec_int_t *v) {
    *v = (vec_int_t){ nullptr, 0, 0 };
}

void vec_free(vec_int_t *v) {
    free(v->data);
    v->data = nullptr;
    v->len = v->cap = 0;
}

// Internal: grow capacity to at least new_cap.
static int vec_grow(vec_int_t *v, size_t new_cap) {
    size_t bytes;
    if (ckd_mul(&bytes, new_cap, sizeof *v->data)) return -1;
    int *p = realloc(v->data, bytes);
    if (!p) return -1;
    v->data = p;
    v->cap  = new_cap;
    return 0;
}

int vec_reserve(vec_int_t *v, size_t n) {
    if (n <= v->cap) return 0;
    return vec_grow(v, n);
}

// Θ(1) amortized; Θ(n) when realloc copies the buffer.
int vec_push(vec_int_t *v, int x) {
    if (v->len == v->cap) {
        size_t new_cap = v->cap ? v->cap * 2 : INITIAL_CAP;
        if (new_cap < v->cap) return -1;            // overflow
        if (vec_grow(v, new_cap) != 0) return -1;
    }
    v->data[v->len++] = x;
    return 0;
}

// Θ(1).
bool vec_pop(vec_int_t *v, int *out) {
    if (v->len == 0) return false;
    *out = v->data[--v->len];
    return true;
}

int vec_get(const vec_int_t *v, size_t i) {
    assert(i < v->len);
    return v->data[i];
}

void vec_set(vec_int_t *v, size_t i, int x) {
    assert(i < v->len);
    v->data[i] = x;
}
```

A few things to call out:

- `vec_init` zeroes the struct. `vec_free` is the only way to release the buffer; calling it twice is safe because the second call frees a `nullptr`.
- `ckd_mul` in `vec_grow` rejects sizes that would overflow `size_t`. Without this check, `new_cap * sizeof *v->data` can wrap to a small number, `realloc` succeeds with a tiny buffer, and the next assignment writes past the end. This is a classic CVE pattern. C23 makes the safe version one line.
- The doubling logic in `vec_push` checks `new_cap < v->cap` to detect the overflow case where `cap * 2` wraps. If `cap` is already `SIZE_MAX/2 + 1` you're not going to be able to hold a buffer that big anyway, but the check is the correct hygiene.
- `vec_get` and `vec_set` use `assert` for bounds checks. With `-DNDEBUG` they compile to nothing; in debug builds they catch out-of-bounds access immediately. Production code might want `[[nodiscard]] bool vec_try_get(...)` instead — that's a Chapter 11 refactor.

> :angrygoose: One subtle point: we use `realloc`, which can either resize in place or allocate a new buffer and copy. The amortization proof is the same either way, but the constant factor is different. In-place is fast; copying touches every byte and trashes the cache. The OS allocator decides which one happens, and the decision depends on whether there's contiguous free space after the current allocation. You don't get a vote.

## The Tests

```c
// test/test_vec.c
#include "algo/vec.h"
#include "test.h"

TEST(vec_init_is_empty) {
    vec_int_t v;
    vec_init(&v);
    EXPECT_EQ(v.len, 0);
    EXPECT_EQ(v.cap, 0);
    vec_free(&v);
}

TEST(vec_push_single) {
    vec_int_t v;
    vec_init(&v);
    EXPECT(vec_push(&v, 42) == 0);
    EXPECT_EQ(v.len, 1);
    EXPECT_EQ(vec_get(&v, 0), 42);
    vec_free(&v);
}

TEST(vec_push_many_preserves_order) {
    vec_int_t v;
    vec_init(&v);
    for (int i = 0; i < 10000; ++i) {
        EXPECT(vec_push(&v, i) == 0);
    }
    EXPECT_EQ(v.len, 10000);
    for (int i = 0; i < 10000; ++i) {
        EXPECT_EQ(vec_get(&v, (size_t)i), i);
    }
    vec_free(&v);
}

TEST(vec_pop_lifo) {
    vec_int_t v;
    vec_init(&v);
    vec_push(&v, 1);
    vec_push(&v, 2);
    vec_push(&v, 3);
    int x;
    EXPECT(vec_pop(&v, &x) && x == 3);
    EXPECT(vec_pop(&v, &x) && x == 2);
    EXPECT(vec_pop(&v, &x) && x == 1);
    EXPECT(!vec_pop(&v, &x));   // empty
    vec_free(&v);
}

TEST(vec_reserve_avoids_growth) {
    vec_int_t v;
    vec_init(&v);
    EXPECT(vec_reserve(&v, 1024) == 0);
    int *original = v.data;
    for (int i = 0; i < 1024; ++i) vec_push(&v, i);
    EXPECT(v.data == original);   // didn't realloc
    vec_free(&v);
}

TEST_MAIN;
```

Run them:

```sh
$ make MODE=debug test
== build/test_test_vec ==
  [test] vec_init_is_empty                        ok
  [test] vec_push_single                          ok
  [test] vec_push_many_preserves_order            ok
  [test] vec_pop_lifo                             ok
  [test] vec_reserve_avoids_growth                ok
```

The last test deserves a note: `vec_reserve(1024)` allocates 1024 elements up front; the next 1024 pushes never trigger a `realloc`, so `v.data` keeps its address. This is a property test — it asserts an *invariant* (no growth after sufficient reservation), not just a value.

## The Amortization Proof

The claim: a sequence of $n$ pushes into an initially empty vector costs $\Theta(n)$ in total. The amortized cost per push is $\Theta(1)$.

Three formal techniques can prove this. We work each one because they generalize to other data structures with different intuitions.

### Method 1: Aggregate Analysis

Add up the total work and divide.

A push has constant cost if the buffer has room. It costs $\Theta(c)$ — proportional to the current capacity — when it triggers a doubling, because `realloc` copies $c$ elements to a new buffer.

After $n$ pushes starting from `cap = 8`, the doublings happen at lengths $8, 16, 32, \ldots, 2^{\lceil \log_2 n \rceil}$. The copy cost at each doubling is the current length. Total copy cost:

```math
\sum_{k=3}^{\lceil \log_2 n \rceil} 2^k \leq \sum_{k=0}^{\lceil \log_2 n \rceil} 2^k = 2^{\lceil \log_2 n \rceil + 1} - 1 \leq 4n
```

Plus the $n$ "cheap" assignments. Total: $5n + O(1) = \Theta(n)$. Amortized per push: $\Theta(n) / n = \Theta(1)$. $\square$

The $5n$ bound (or whatever your specific constant is) is the key fact: even though one specific push might be expensive, the *sum* is linear because each doubling is twice the previous one — geometric series bound.

> :mathgoose: This is exactly the geometric-series rule from Chapter 2. $\sum_{i=0}^{k} r^i = \Theta(r^k)$ when $r > 1$ — the last term dominates. The total work is dominated by the most recent doubling, which is $\Theta(n)$. The earlier doublings sum to *less* than the last one.

### Method 2: Accounting (Banker's) Method

Charge each operation a fixed amortized cost. Bank the surplus to pay for expensive operations later.

We charge $3$ units of "amortized cost" per push:

- $1$ unit pays for the actual write `v->data[v->len++] = x`.
- $1$ unit goes into a savings account "associated with the element just pushed."
- $1$ unit goes into a savings account "associated with an existing element that will need to be re-copied later."

When a doubling happens at length $c$, every existing element must be copied to the new buffer. The existing elements are the ones placed in the second half of the previous buffer — i.e., the elements pushed since the last doubling. There are exactly $c/2$ of them, and each has $1$ unit of savings (from being charged $3$ when pushed). So we have $c/2$ units to spend.

But we need $c$ units (we have to copy all $c$ elements). The other $c/2$ units come from the "third unit" of the most recent $c/2$ pushes, which we earmarked for re-copying.

Total: every push contributes $3$ units. Real cost is bounded by total savings, which is $3n$. Amortized cost per push is $\Theta(1)$. $\square$

> :sarcasticgoose: "Two savings accounts? Are we doing financial engineering now?" The accounting method just makes the proof concrete. Every operation pays a fixed price upfront; expensive operations are funded from the surplus collected by cheap operations. Once you see the metaphor it's quick; describing it in prose makes it sound like derivatives trading. It's just bookkeeping.

### Method 3: Potential (Physicist's) Method

Define a potential function $\Phi$ on the data structure. Choose it so that $\Phi$ increases on cheap operations and decreases enough on expensive ones to absorb their cost.

Define $\Phi(v) = 2 \cdot \text{len}(v) - \text{cap}(v)$. For our doubling vector with `cap = 8` initial, $\Phi = -8$ when empty, increases by $2$ on each cheap push, and falls by `cap` on a doubling.

Amortized cost = real cost + $\Delta \Phi$.

**Cheap push** (no doubling): real cost $1$, $\Delta \Phi = 2$. Amortized: $3$.

**Expensive push** (triggers doubling at length $c$, capacity becomes $2c$): real cost $c + 1$ (copy plus the new write). $\Delta \Phi = (2(c+1) - 2c) - (2c - c) = 2 - c$. Amortized: $(c+1) + (2 - c) = 3$.

Both kinds of push have amortized cost $3$. Total over $n$ pushes: $3n + \Phi_{\text{final}} - \Phi_{\text{initial}}$. The boundary term is $O(n)$. So total cost is $\Theta(n)$, amortized $\Theta(1)$. $\square$

> :nerdygoose: The potential method generalizes to splay trees, Fibonacci heaps, and union-find with path compression — data structures where the aggregate and accounting methods get unwieldy. The trick is finding the right $\Phi$. For doubling arrays, $\Phi = 2\text{len} - \text{cap}$ is the standard choice; "discover" it by working backwards from "I need amortized 3 per push, real cost is up to $c$ on a doubling, so $\Phi$ must drop by about $c$."

All three methods give the same result because they prove the same theorem. Different intuitions for different data structures.

## Why Doubling? Three Growth Strategies

When the buffer fills, what should the new size be? Three reasonable choices:

1. **Add a constant**: `new_cap = cap + k`.
2. **Multiply by a constant**: `new_cap = cap * α` for some $\alpha > 1$.
3. **Some specific factor**: e.g., $\alpha = 2$ (doubling), $\alpha = 1.5$ (Java `ArrayList` historically), $\alpha = \varphi \approx 1.618$ (golden ratio).

### Strategy 1: `cap + k` — Wrong

If we add a constant $k$ each time, the doublings happen at lengths $k, 2k, 3k, \ldots$. Copy cost at each:

```math
\sum_{i=1}^{n/k} (i \cdot k) = k \cdot \frac{(n/k)(n/k + 1)}{2} = \Theta(n^2)
```

Total work: $\Theta(n^2)$. Amortized cost per push: $\Theta(n)$.

A linear-cost-per-push dynamic array is not a dynamic array. It's a quadratic-time slow-motion disaster. This is the rule that kills "naive" dynamic-array implementations.

> :angrygoose: Every "I just realloc by 1 each push" implementation has $\Theta(n^2)$ amortized cost. Every. Single. One. People write this and then wonder why their program slows down at scale. If you ever see growth-by-constant in production code, it is a bug.

### Strategy 2: Multiply by α > 1 — Right

Any constant multiplier $> 1$ gives amortized $\Theta(1)$. The aggregate proof works the same way: doublings happen $\log_\alpha n$ times, copy costs sum to a geometric series with ratio $\alpha$, total is $\Theta(n / (\alpha - 1))$. Bigger $\alpha$ = fewer reallocs but more wasted memory at peak.

### Strategy 3: Choosing α

The trade-off:

| α | Wasted memory | Reallocs per million pushes |
|---|---|---|
| 1.25 | Up to 25% | ~62 |
| 1.5 | Up to 50% | ~34 |
| 2.0 | Up to 100% | ~20 |
| 4.0 | Up to 300% | ~10 |

`std::vector` libcxx uses 2.0; libstdc++ also uses 2.0; Microsoft STL uses 1.5; Facebook Folly's `fbvector` uses 1.5. The argument for $\alpha < 2$ is that doublings sometimes prevent the allocator from reusing the previous buffer slot — if you keep doubling, the new buffer is always strictly larger than the sum of all previous buffers, so it can never fit in their freed space. With $\alpha = 1.5$, after a few growths the new buffer can fit in the freed space of the past buffers combined, and the allocator may avoid syscalls.

> :nerdygoose: There is also the "golden-ratio" argument: $\alpha = \varphi \approx 1.618$ has the property that two consecutive freed buffers sum to exactly the next buffer size. So the freed space is always available for the next allocation. In practice, allocators are not that helpful, and 1.5 is close enough to $\varphi$ that the difference doesn't matter.

For this book we use $\alpha = 2$ — simpler arithmetic, classic textbook, and on modern allocators with `mremap`, it doesn't actually waste memory because the kernel can extend mappings in place.

## Measuring It

Bench with the harness from Chapter 3:

```c
// bench/bench_vec.c
#include "algo/vec.h"
#include "bench.h"
#include <stdlib.h>

BENCH(vec_push_int) {
    vec_int_t v;
    vec_init(&v);
    BENCH_LOOP {
        (void)vec_push(&v, 42);
    }
    BENCH_DO_NOT_OPTIMIZE(v.data);
    vec_free(&v);
}

BENCH(vec_push_int_reserved) {
    vec_int_t v;
    vec_init(&v);
    (void)vec_reserve(&v, 1ull << 24);
    BENCH_LOOP {
        (void)vec_push(&v, 42);
    }
    BENCH_DO_NOT_OPTIMIZE(v.data);
    vec_free(&v);
}
```

Representative output on a typical x86-64 laptop (your numbers will vary):

```text
vec_push_int                              16777216 iters         5.97 ns/op
vec_push_int_reserved                     16777216 iters         1.81 ns/op
```

Two things to read off this:

- **The amortized cost is real.** Even with the overhead of growth, `vec_push` averages about $6$ ns per push — single-digit nanoseconds, dominated by the cache-friendly contiguous write.
- **Reservation is a 3× speedup.** When you know the size up front, calling `vec_reserve(n)` skips every doubling. The fastest path through the function becomes: bounds check, store, increment.

> :weightliftinggoose: Always measure before optimizing — but also: always measure with and without `reserve` if you know the final size. A surprising amount of "performance work" on dynamic arrays is just learning to call `reserve` upfront.

## Edge Cases

A short tour of the failure modes you should think about:

**Push to NULL data with cap == 0.** Handled by the `cap ? cap * 2 : INITIAL_CAP` branch. First push allocates `INITIAL_CAP` slots.

**Push when `cap * 2` overflows `size_t`.** The `new_cap < v->cap` check catches this. We return `-1`.

**Push when `realloc` returns `NULL` (out of memory).** `vec_grow` returns `-1` and we return `-1`. The original buffer is preserved (`realloc` is required by the standard not to free the old buffer on failure).

**Pop from empty.** `vec_pop` returns `false` and does not write to `*out`. The caller must check.

**Get / set out of bounds.** `assert` fires in debug. In release with `-DNDEBUG`, behavior is undefined — the C model treats `data[i]` for `i >= len` as past-the-end if `i < cap`, undefined if `i >= cap`. We accept this trade-off because the alternative (every access checking bounds) costs 30%+ on tight loops. Production code uses `vec_try_get`.

**Concurrent access.** The structure is not thread-safe. Two threads pushing simultaneously can corrupt `len`. Synchronization is the caller's job.

> :surprisedgoose: One nasty interaction: if you take a pointer into the buffer (`int *p = &v.data[5]`) and then push, the push may `realloc` and invalidate `p`. This is iterator invalidation, the same bug C++ has. Rule: never hold a pointer into a vector across a push. If you need stable pointers, use a different structure (linked list, or `void *` pointers to heap-allocated elements).

## Shrinking?

When you pop a lot of elements, should the vector shrink the buffer? `std::vector` doesn't (you have to call `shrink_to_fit`). Most implementations don't. Why?

The naive answer is "shrink when len $<$ cap/2." But this leads to oscillation: push to length 8, allocate cap 16; pop one to 7, you're at len = cap/2, shrink to 8; push one back to 8, double to 16. Two `realloc`s for two operations. Quadratic again.

The fix is hysteresis: only shrink when `len < cap/4`, and shrink to half the capacity. Now you have to alternate at least cap/4 operations between pushes and pops to oscillate, which means the per-operation amortized cost stays $\Theta(1)$.

Most production vectors don't shrink at all. The reasoning: workloads that grow rarely shrink permanently. If you do shrink, a single later push will reallocate. Better to leave the memory in place; the allocator will reclaim it when the vector is freed.

> :sharpgoose: When you do want to shrink (rare: long-lived programs that hit a peak and then settle to a much smaller size), expose it as an explicit `vec_shrink_to_fit` method, never automatic. The caller knows their workload; the data structure does not.

## What's Next

Chapter 5 zooms out from "operations" to "memory" — the cost model behind the cost model. We've been counting operations as if they all cost the same. They don't. A cache miss is 100× a register access. A linked-list traversal can be 50× slower than an array scan over identical data. The asymptotic story is the same; the constants are not.
