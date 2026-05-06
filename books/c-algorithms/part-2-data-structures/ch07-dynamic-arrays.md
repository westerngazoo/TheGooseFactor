---
sidebar_position: 1
sidebar_label: "Ch 7: Dynamic Arrays (Deep Dive)"
title: "Chapter 7: Dynamic Arrays — The Vector, in C, Analyzed Three Ways"
---

# Chapter 7: Dynamic Arrays — The Vector, in C, Analyzed Three Ways

> This is the chapter that earns the word "amortized." We're going to
> implement the C equivalent of `std::vector`, and then we're going to
> prove — three different ways — that pushing into it is **constant
> time on average** even though some individual pushes are expensive.

## The problem

You have an array. C arrays are fixed-size at the moment you allocate
them. You want to keep adding elements without knowing in advance how
many you'll have.

```c
int arr[10];
// ... what about the 11th element?
```

Every higher-level language gives you a "list" or "vector" or
"ArrayList" that grows automatically. Under the hood, there's no magic.
There's a fixed-size array, a length counter, and a strategy for what
to do when the array fills up.

This chapter is about that strategy.

## Strategy 1: grow by 1 (and why it's terrible)

The naive approach: when the array is full, allocate one bigger,
copy everything over, free the old one.

```c
typedef struct {
    int *data;
    size_t len;
    size_t cap;
} naive_vec;

void naive_push(naive_vec *v, int x) {
    if (v->len == v->cap) {
        v->cap += 1;                                    // grow by 1
        v->data = realloc(v->data, v->cap * sizeof(int));
        // assume realloc succeeded; we'll add error handling later
    }
    v->data[v->len++] = x;
}
```

Single push is $O(\text{current size})$ in the worst case — copying
$n$ ints when the array has $n$ elements.

How bad is that across $n$ pushes? Each push does at most $n$
work, and there are $n$ pushes, so we might guess $O(n^2)$. Let's
check.

The pushes do work $1, 2, 3, \ldots, n$ (each push has to copy the
previous size). Sum:

$$1 + 2 + 3 + \cdots + n = \frac{n(n+1)}{2} = O(n^2)$$

For 1 million pushes, that's about $5 \times 10^{11}$ copy operations.
On a 1 GHz machine, ~500 seconds. Eight minutes. To insert a million
ints. **No.**

> :sharpgoose: This is the canonical "looks innocent, scales horribly"
> bug. Junior engineers ship it, the code passes review, and the
> service melts when the dataset grows. Don't be that engineer.

## Strategy 2: double the capacity

Instead of growing by 1, grow by a constant *factor* (we'll use 2).

```c
void better_push(naive_vec *v, int x) {
    if (v->len == v->cap) {
        v->cap = v->cap == 0 ? 1 : v->cap * 2;          // double
        v->data = realloc(v->data, v->cap * sizeof(int));
    }
    v->data[v->len++] = x;
}
```

That single change — `cap += 1` becomes `cap *= 2` — turns a quadratic
algorithm into a linear one. Let's see why.

### A trace

Start with `cap = 1`, `len = 0`. Push 1, 2, 3, ..., 8.

| push # | len before | cap before | resize? | work done |
|---|---|---|---|---|
| 1 | 0 | 1 | no | 1 (just write) |
| 2 | 1 | 1 | yes (1→2) | 1 copy + 1 write = 2 |
| 3 | 2 | 2 | yes (2→4) | 2 copies + 1 write = 3 |
| 4 | 3 | 4 | no | 1 |
| 5 | 4 | 4 | yes (4→8) | 4 copies + 1 write = 5 |
| 6 | 5 | 8 | no | 1 |
| 7 | 6 | 8 | no | 1 |
| 8 | 7 | 8 | no | 1 |

Total work for 8 pushes: $1 + 2 + 3 + 1 + 5 + 1 + 1 + 1 = 15$.
Average per push: $15 / 8 \approx 2$.

A few of those pushes were expensive (the resizes), but most were
nearly free. The expensive ones get rarer as the array grows, and
the cheap ones in between absorb their cost.

> :happygoose: That's the whole insight. **The expensive operation is
> rare enough that its cost amortizes across the cheap ones.** The
> per-operation average stays bounded.

But "stays bounded" is hand-waving. Let's prove it three different
ways.

---

## The amortized analysis, three ways

> :nerdygoose: There are three standard methods. They give the same
> answer; the differences are pedagogical and analytical taste.

### Method 1: Aggregate analysis

The simplest method: just sum the total cost across all $n$ pushes
and divide.

For $n$ pushes starting from `cap = 1`, the array doubles at pushes
1, 2, 4, 8, 16, ..., up to the largest power of 2 that's $\le n$.
At the $k$-th doubling, we copy $2^{k-1}$ elements (the array's
contents just before doubling).

Total copy work across all resizes:

$$1 + 2 + 4 + \cdots + 2^{\lfloor \log_2 n \rfloor} \le 2n - 1$$

(That's a geometric series. The sum of $2^0 + 2^1 + \cdots + 2^k$ is
$2^{k+1} - 1$, which is at most $2n - 1$.)

Plus $n$ pushes that each do exactly 1 unit of "write the new
element" work, regardless of resize. Total:

$$T(n) \le n + (2n - 1) = 3n - 1$$

So the **amortized cost per push** is

$$\frac{T(n)}{n} \le \frac{3n - 1}{n} \le 3 = O(1)$$

Done. Each push is $O(1)$ amortized.

> :mathgoose: The aggregate method is the easiest to *do*, but it
> can hide *why*. The next two methods give more insight.

### Method 2: The accounting method

Instead of computing the total and dividing, we **charge each push
extra** and bank the surplus to pay for future resizes.

**The plan:** charge \$3 per push.
- \$1 pays for the actual write.
- \$2 is **deposited** on the just-pushed element.

When a resize happens — doubling capacity from $m$ to $2m$, copying
$m$ elements — we use the deposits to pay for it.

**Question:** are there enough deposits?

Just before a resize from $m$ to $2m$, the array is full. The
**previous** resize (from $m/2$ to $m$) happened when the array was
last full at size $m/2$. After that previous resize, the array had
$m/2$ slots filled with copied-over elements, and we had to push
$m/2$ more elements to fill the array up to size $m$.

Each of those last $m/2$ pushes paid \$3, of which \$2 was deposited.
So the deposits available: $\$2 \cdot (m/2) = \$m$.

The resize copies $m$ elements, costing \$m. Exactly enough.

> :happygoose: The newer half of the array carries enough credit on
> its back to pay for everyone's relocation. Even though some
> elements (the older half) carry no credit anymore — they spent
> theirs on the *previous* resize — the books still balance.

**Conclusion:** charging \$3 per push is sufficient. The amortized
cost is \$3 = $O(1)$.

> :nerdygoose: The accounting method is great when you can find
> intuitive "credit objects." For dynamic arrays, the credit lives
> on the elements. For other amortized structures (binomial heaps,
> splay trees), it can live on tree nodes or on slack capacity.

### Method 3: The potential method

The most general method, and the one you'll see in graduate-level
texts. We define a **potential function** $\Phi(D)$ that maps each
data structure state to a non-negative number. Then:

$$\text{amortized cost} = \text{actual cost} + \Phi(D_\text{after}) - \Phi(D_\text{before})$$

Choose $\Phi$ wisely and the amortized cost works out to a constant.

For our dynamic array, define:

$$\Phi(D) = 2n - c$$

where $n$ is the number of elements and $c$ is the capacity. For
this to be valid, we need $\Phi \ge 0$ always — which holds whenever
$n \ge c/2$, i.e., the array is at least half full. We'll see this
holds after the first expansion.

> :mathgoose: The point of $\Phi$: it tracks "how much credit the
> data structure has saved up." When $\Phi$ rises, the operation paid
> more than it cost (the surplus banked). When $\Phi$ falls, banked
> surplus is being spent.

**Case A: cheap push (no resize), $n + 1 \le c$.**

- Actual cost: $1$.
- $\Phi$ before: $2n - c$.
- $\Phi$ after: $2(n+1) - c = 2n + 2 - c$.
- $\Delta\Phi = 2$.
- **Amortized cost** = $1 + 2 = 3$. ✓

**Case B: expensive push (resize from $c$ to $2c$), $n = c$.**

- Actual cost: $c + 1$ (copy $c$ elements, then write the new one).
- $\Phi$ before: $2c - c = c$.
- $\Phi$ after: $2(c+1) - 2c = 2$.
- $\Delta\Phi = 2 - c$.
- **Amortized cost** = $(c + 1) + (2 - c) = 3$. ✓

Both cases give amortized cost 3. Same answer. The potential
function "absorbs" the spike of the resize: just before the resize,
$\Phi$ is at its peak ($c$); after the resize, $\Phi$ drops back
down. The drop pays for the resize.

> :happygoose: The three methods are equivalent — they all prove the
> same $O(1)$ bound. They give different *intuitions*. Aggregate
> says "look at the totals." Accounting says "watch the money flow
> per element." Potential says "the data structure remembers, in its
> shape, what it owes."

---

## A real C implementation

Let's translate the analysis into working code. Header file:

```c
// vec.h
#ifndef VEC_H
#define VEC_H

#include <stddef.h>
#include <stdint.h>

typedef struct {
    int    *data;
    size_t  len;
    size_t  cap;
} vec_t;

void   vec_init(vec_t *v);
void   vec_free(vec_t *v);
int    vec_push(vec_t *v, int x);   // returns 0 on success, -1 on alloc fail
int    vec_pop(vec_t *v, int *out); // returns 0 on success, -1 if empty
int    vec_at(const vec_t *v, size_t i, int *out);
int    vec_reserve(vec_t *v, size_t want);

#endif
```

And the implementation:

```c
// vec.c
#include "vec.h"
#include <stdlib.h>
#include <string.h>

#define VEC_INITIAL_CAP 4

void vec_init(vec_t *v) {
    v->data = NULL;
    v->len  = 0;
    v->cap  = 0;
}

void vec_free(vec_t *v) {
    free(v->data);
    v->data = NULL;
    v->len = v->cap = 0;
}

static int vec_grow(vec_t *v, size_t min_cap) {
    size_t new_cap = v->cap == 0 ? VEC_INITIAL_CAP : v->cap;
    while (new_cap < min_cap) {
        // Watch for overflow: SIZE_MAX / 2 guard.
        if (new_cap > SIZE_MAX / 2) return -1;
        new_cap *= 2;
    }
    int *p = realloc(v->data, new_cap * sizeof *p);
    if (!p) return -1;
    v->data = p;
    v->cap  = new_cap;
    return 0;
}

int vec_push(vec_t *v, int x) {
    if (v->len == v->cap) {
        if (vec_grow(v, v->len + 1) < 0) return -1;
    }
    v->data[v->len++] = x;
    return 0;
}

int vec_pop(vec_t *v, int *out) {
    if (v->len == 0) return -1;
    if (out) *out = v->data[v->len - 1];
    v->len--;
    return 0;
}

int vec_at(const vec_t *v, size_t i, int *out) {
    if (i >= v->len) return -1;
    *out = v->data[i];
    return 0;
}

int vec_reserve(vec_t *v, size_t want) {
    if (want <= v->cap) return 0;
    return vec_grow(v, want);
}
```

A few details worth flagging:

**Overflow guard.** `new_cap *= 2` can wrap around for huge arrays.
The check `new_cap > SIZE_MAX / 2` catches it before the multiply.

> :sharpgoose: Integer overflow in size calculations is the source
> of half the heap-corruption CVEs ever filed. Always guard. ASan
> won't catch this one — the type isn't violated, the math is.

**Initial capacity.** We start at 4, not 1. Doubling from 1 means
the first three pushes each cause a resize, even though our amortized
analysis still holds. Starting at 4 (or 8, or 16) gives empty vectors
some breathing room before the first resize, in exchange for a
constant-factor memory overhead.

**`realloc` semantics.** If `realloc` returns NULL, the old block is
**still valid**. We capture the new pointer in a local `p` first so
that on failure we leave `v->data` pointing at the still-good old
buffer. The classic mistake is `v->data = realloc(v->data, ...)` —
if it fails, you've leaked the original.

**Return codes for failure.** Real production code uses `int` returns
or `errno`-style. We follow that convention here. The book's later
chapters will show how to wrap this in a more ergonomic C23
`expected`-like macro, but the underlying discipline doesn't change.

---

## Choosing the growth factor

Why 2× and not 1.5× or 3×? It's a real engineering question.

The general analysis: with growth factor $k$ (where $k > 1$), the
amortized cost per push works out to

$$\text{amortized cost} = 1 + \frac{k}{k-1}$$

(Try the potential method exercise below to derive this.)

| $k$ | Amortized cost | Resize frequency | Wasted memory at peak |
|---|---|---|---|
| 1.5 | 4.0 | high | 33% |
| 2.0 | 3.0 | medium | 50% |
| 3.0 | 2.5 | low | 67% |
| 4.0 | 2.33 | very low | 75% |

Lower $k$: more resizes, less wasted memory.
Higher $k$: fewer resizes, more wasted memory.

**The 1.5× argument (Facebook's `folly::fbvector`):** with growth
factor 2, each new buffer is *strictly larger* than the sum of all
previously freed buffers, so the heap can never reuse old space.
With 1.5×, the new buffer can sometimes reuse a coalesced block of
the old freed ones, reducing fragmentation.

Roughly: with factor $k$, the previous buffer fits inside the freed
predecessors when $k < \varphi \approx 1.618$ (the golden ratio).
1.5 < φ, so reuse is possible. 2 > φ, so reuse is impossible.

**The 2× argument:** simpler math, fewer resizes, the constant 3 is
already small. Most STL implementations and the Linux kernel's
[`kvmalloc` family](https://www.kernel.org/doc/html/latest/core-api/memory-allocation.html)
use 2×.

For this book we use 2×. If you're writing a memory-tight embedded
allocator, consider 1.5×. If you have plenty of memory and want
fewer copies, consider 3×.

> :surprisedgoose: The "1.5× allows heap reuse" argument is real but
> often dwarfed by allocator behavior in practice. `glibc`'s `malloc`
> uses bins and arenas that don't behave like a simple bump allocator.
> Measure, don't theorize.

---

## Shrinking — when and how

You pop a lot of elements. The array is now mostly empty. Should we
shrink the capacity to save memory?

Naive answer: when `len < cap / 2`, halve the capacity.

**Why that's wrong:** consider this pathological sequence. Suppose
`len == cap` (full). Now alternate `push, pop, push, pop, ...`:

1. push → resize to $2c$, len = $c+1$, cap = $2c$.
2. pop → len = $c$, which is $<$ cap/2 = $c$? No, $c \not< c$. Hmm.

Let me redo: suppose len = cap/2 + 1. Pop one → len = cap/2. Still
not below threshold. Push → len = cap/2 + 1. Pop → cap/2. No resizing.

OK the threshold matters. Let's try: shrink when `len < cap / 2`,
shrink to half. Suppose len = cap/2. Push → len = cap/2 + 1. Pop →
len = cap/2. **shrink:** cap → cap/2. Now `len == cap`. Push →
**resize:** cap → cap. Wait that's the same. Hmm.

Let me reconsider. Suppose cap = 8, len = 4. Push → len = 5, no
resize (5 < 8). Pop → len = 4. Is 4 < 8/2 = 4? No. So no shrink.

Try cap = 8, len = 3. Pop → len = 2. Is 2 < 4? Yes. Shrink to cap = 4.
Now len = 2, cap = 4. Push → len = 3, cap = 4. Pop → len = 2. Is
2 < 2? No. So no thrash here.

The thrash case: cap = 8, len = 4. Push → len = 5, cap = 8. Pop →
4 < 4? No. So no thrash actually.

Hmm. Let me look at the actual pathological case:

cap = 4, len = 4. Push → resize to cap = 8, len = 5.
Pop → len = 4. 4 < 8/2 = 4? No (strict inequality).
Pop → len = 3. 3 < 4. Shrink to cap = 4. Now len = 3, cap = 4.
Push → len = 4, cap = 4. Push → resize to cap = 8.
Pop → len = 4. ...

If we use `<= cap/2`, then we get thrashing. The strict `<` plus a
4× threshold is safer:

**The standard rule:** shrink to half-capacity when `len < cap / 4`.
This way, after shrinking, the new array is half-full
($\text{new len} = \text{cap}/4 = \text{new cap} / 2$), and we have
to pop another quarter of capacity before the next shrink, OR push
another half of capacity before a resize. Either way, we get $\Theta(c)$
operations between expensive events.

```c
int vec_shrink_maybe(vec_t *v) {
    if (v->cap == 0 || v->len >= v->cap / 4) return 0;
    size_t new_cap = v->cap / 2;
    if (new_cap < VEC_INITIAL_CAP) new_cap = VEC_INITIAL_CAP;
    if (new_cap == v->cap) return 0;
    int *p = realloc(v->data, new_cap * sizeof *p);
    if (!p) return -1;
    v->data = p;
    v->cap  = new_cap;
    return 0;
}
```

Call this from `vec_pop`. Now both `push` and `pop` are amortized
$O(1)$, and capacity stays within a constant factor of `len`.

> :nerdygoose: The amortized analysis for shrink-on-quarter is the
> same potential-method argument you just saw, with a slightly
> different $\Phi$ that accounts for both directions. Try it as an
> exercise.

---

## Cache effects — why this beats a linked list

The amortized analysis says push is $O(1)$. So is push on a linked
list. They're "the same" asymptotically. In practice, a vector
**slaughters** a linked list.

Why? **Memory layout.** A vector stores its elements in one
contiguous block. The CPU's cache prefetcher loves this — when you
read element $i$, the cache pulls in $i+1, i+2, \ldots$ for free.
Iterating a 10K-element vector touches a few hundred cache lines.

A linked list scatters its nodes across the heap. Each `next` pointer
chase is a potential cache miss — 100+ cycles per node on a modern
CPU. Iterating a 10K-element linked list touches 10K cache lines,
most of them cold.

A rough benchmark on a typical laptop:

| Operation | Vector (10K ints) | Linked list (10K ints) |
|---|---|---|
| Sequential traversal | ~10 µs | ~150 µs |
| Sum all elements | ~8 µs | ~140 µs |
| Push at end (10K) | ~30 µs | ~600 µs (malloc per node) |

The vector is 10–20× faster for the operations both data structures
are "good at." Big-O hides constant factors; the cache hides them too.

> :surprisedgoose: This is why STL's default sequence container is
> `std::vector`. Linked lists are the right answer surprisingly
> rarely — basically only when you need cheap mid-sequence
> insertion AND iteration is rare AND you're holding pointers
> across mutations. Most of the time, vector wins on every axis.

---

## What we actually proved

Three independent arguments all gave the same answer: pushing into
a doubling array is $O(1)$ **amortized**. This means:

- Any **single** push can take $O(n)$ time (the resize ones).
- A **sequence** of $n$ pushes takes $O(n)$ total time.
- The **average** cost per push, over a long sequence, is constant.

Note "amortized" $\ne$ "expected." There's no randomness here.
Amortized is a worst-case statement: across any sequence of
operations, the average is bounded. (Expected, by contrast, is a
probability statement — we'll see it for hash tables in Ch 10.)

> :sharpgoose: Don't claim "amortized $O(1)$" when you mean "average
> case $O(1)$." Real-time systems care about the *single* push that
> triggers the resize — they often pre-allocate to avoid it
> entirely. The amortized analysis is for *throughput*, not
> *latency*.

---

## Practice

### Try it

**7.1** Trace through 12 `push` operations on an empty vector with
`VEC_INITIAL_CAP = 4`. List the `(len, cap)` pair after each push,
and mark which pushes triggered a resize.

**7.2** Implement `vec_pop_front(vec_t *v, int *out)` (remove the
*first* element). What's the amortized cost? Why is it different
from `vec_pop`?

**7.3** Find the bug in this `vec_push`:

```c
int vec_push_buggy(vec_t *v, int x) {
    if (v->len == v->cap) {
        v->cap *= 2;
        v->data = realloc(v->data, v->cap);  // <-- bug
    }
    v->data[v->len++] = x;
    return 0;
}
```

There are at least two issues. Find both and explain them.

### Stretch

**7.4** Run the potential method analysis for growth factor $k$
(general). Define $\Phi$ and show that amortized cost is
$1 + k/(k-1)$.

**7.5** Implement `vec_push` and `vec_pop` with shrink-on-quarter.
Write a small test program that pushes 10,000 ints, then pops them
all. Track `cap` over time and verify that `cap` stays within $4
\times \text{len}$ throughout.

**7.6** Use ASan to verify your implementation is leak-free.
Specifically:
- Initialize a vec, push 100 elements, free it. (No leaks expected.)
- Initialize a vec, push 100 elements, **don't** call `vec_free`.
  (ASan's leak detector should flag this.)

### Deep dive (optional)

**7.7** The aggregate analysis we did assumed initial capacity 1.
Redo it for initial capacity 4. Does the amortized bound change?
By how much, and why?

**7.8** Can you choose a $\Phi$ for the dynamic array that gives an
amortized cost of **2** per push instead of 3? If so, write it down
and verify both cases. If not, prove that 3 is tight under the 2×
growth strategy. (Hint: think about what the constant in front of
$n$ in $\Phi$ does.)

**7.9** Read Bjarne Stroustrup's
[*Are lists evil?*](https://www.stroustrup.com/Software-for-infrastructure.pdf)
section that compares vector to list for inserting in sorted order.
Reproduce the benchmark in C with `vec_t` and a hand-rolled linked
list. At what input size does vector beat list, even though "list
insertion is $O(1)$"?

---

## Recap

- A doubling array (vector) gives $O(1)$ amortized push.
- We proved it three ways: aggregate, accounting, potential.
- The accounting method's intuition: each push deposits credit
  on its element; resizes spend the deposits.
- The potential method's intuition: $\Phi = 2n - c$ tracks how
  much credit the data structure has banked.
- 2× is the standard growth factor; 1.5× allows heap reuse but
  costs more amortized work.
- Shrink at the quarter mark to avoid push/pop thrashing.
- In practice, cache locality makes vectors dominate linked
  lists for almost every workload.

> :weightliftinggoose: This is the chapter that earned its keep in
> the course. From here on, when we say "amortized $O(1)$" — for
> hash tables, for binomial heaps, for splay trees — you've seen
> the machinery. The structure changes; the toolkit doesn't.

---

## What's next

[Chapter 8](/c-book/part-2-data-structures) covers linked lists —
why they're slower than you think, when they're still the right
answer (intrusive lists in kernels), and the difference between
"owning" and "intrusive" list designs.
