---
sidebar_position: 2
sidebar_label: "Ch 7: Queue & Deque"
title: "Chapter 7: Queue and Deque"
---

# Chapter 7: Queue and Deque

A **queue** is FIFO — first-in-first-out. Things go in the back; they come out the front. A **deque** (double-ended queue, pronounced "deck") is FIFO and LIFO at both ends — push and pop at front *or* back. Both are constant-time on every operation if implemented well, and "implemented well" turns out to require a non-obvious trick: the ring buffer.

## The Queue ADT

```c
// include/algo/queue.h
#ifndef ALGO_QUEUE_H
#define ALGO_QUEUE_H

#include <stddef.h>
#include <stdbool.h>

typedef struct queue queue_t;

queue_t *queue_new(void);
void     queue_free(queue_t *q);

[[nodiscard]] int  queue_push(queue_t *q, int x);    // Θ(1) amortized
[[nodiscard]] bool queue_pop (queue_t *q, int *out);  // Θ(1)
[[nodiscard]] bool queue_front(const queue_t *q, int *out); // Θ(1)
size_t  queue_size (const queue_t *q);
bool    queue_empty(const queue_t *q);

#endif
```

| Operation | Complexity | What it does |
|---|---|---|
| `push` | $\Theta(1)$ amortized | Add to back |
| `pop` | $\Theta(1)$ | Remove from front |
| `front` | $\Theta(1)$ | Peek at front without removing |

Naive attempt: an array with `push` at the end and `pop` from the start. Push is fine. Pop is $\Theta(n)$ — every remaining element has to shift left one slot. That's the *wrong* complexity for a queue.

The fix is a ring buffer.

## Ring Buffer Queue

A ring buffer (or circular buffer) is a fixed-size array with two indices: `head` (where the next pop comes from) and `tail` (where the next push goes). When either index reaches the end, it wraps to zero. The array is conceptually circular.

```c
// src/queue_ring.c — ring-buffer-backed queue.
#include "algo/queue.h"
#include <stdlib.h>
#include <stdckdint.h>

constexpr size_t INITIAL_CAP = 16;

struct queue {
    int    *data;
    size_t  cap;
    size_t  head;   // index of front element
    size_t  count;  // number of elements (count <= cap)
};

queue_t *queue_new(void) {
    queue_t *q = malloc(sizeof *q);
    if (!q) return nullptr;
    q->data = malloc(INITIAL_CAP * sizeof *q->data);
    if (!q->data) { free(q); return nullptr; }
    q->cap = INITIAL_CAP;
    q->head = 0;
    q->count = 0;
    return q;
}

void queue_free(queue_t *q) {
    if (!q) return;
    free(q->data);
    free(q);
}

// Internal: grow capacity to new_cap, preserving order.
static int queue_grow(queue_t *q, size_t new_cap) {
    size_t bytes;
    if (ckd_mul(&bytes, new_cap, sizeof *q->data)) return -1;
    int *p = malloc(bytes);
    if (!p) return -1;
    // Copy elements in queue order into the start of the new buffer.
    for (size_t i = 0; i < q->count; ++i) {
        p[i] = q->data[(q->head + i) % q->cap];
    }
    free(q->data);
    q->data = p;
    q->cap  = new_cap;
    q->head = 0;
    return 0;
}

int queue_push(queue_t *q, int x) {
    if (q->count == q->cap) {
        size_t new_cap = q->cap * 2;
        if (new_cap < q->cap) return -1;
        if (queue_grow(q, new_cap) != 0) return -1;
    }
    size_t tail = (q->head + q->count) % q->cap;
    q->data[tail] = x;
    ++q->count;
    return 0;
}

bool queue_pop(queue_t *q, int *out) {
    if (q->count == 0) return false;
    *out = q->data[q->head];
    q->head = (q->head + 1) % q->cap;
    --q->count;
    return true;
}

bool queue_front(const queue_t *q, int *out) {
    if (q->count == 0) return false;
    *out = q->data[q->head];
    return true;
}

size_t queue_size (const queue_t *q) { return q->count; }
bool   queue_empty(const queue_t *q) { return q->count == 0; }
```

The invariants:

- `count <= cap` always.
- Elements occupy the slots at indices `(head + i) % cap` for `i = 0, 1, ..., count - 1`.
- When `count < cap`, there is at least one empty slot, used by the next push.
- When `count == cap`, we grow the buffer.

The trick is the modulo. Every push and pop adjusts an index by 1 and wraps. The data never moves except on a full-buffer grow.

> :nerdygoose: The modulo `% cap` compiles to an actual division on most CPUs unless `cap` is a power of two — in which case the compiler turns it into a single AND instruction (`x & (cap - 1)`). Production ring buffers force the capacity to a power of two specifically to get this. We do it for the bench harness in this book; for clarity, the listing here uses general modulo.

**Amortized analysis.** Same as the dynamic array — capacity doubles, total copy work over $n$ operations is $\Theta(n)$, amortized push is $\Theta(1)$. Pop is always $\Theta(1)$ exact.

> :angrygoose: Do not implement the naive "shift left on pop" queue. It looks reasonable, it works for tiny inputs, and it falls apart at scale. A million elements through a shift-on-pop queue is $\Theta(n^2)$, which on modern hardware is the difference between "instant" and "your program never finishes." Use a ring buffer or a linked list. Always.

## Linked Queue

Like the linked stack, but with both head and tail pointers, and operations on opposite ends.

```c
// src/queue_linked.c
#include "algo/queue.h"
#include <stdlib.h>

typedef struct node {
    int value;
    struct node *next;
} node_t;

struct queue {
    node_t *head;   // pop from here
    node_t *tail;   // push to here
    size_t  count;
};

queue_t *queue_new(void) {
    queue_t *q = calloc(1, sizeof *q);
    return q;
}

void queue_free(queue_t *q) {
    if (!q) return;
    node_t *n = q->head;
    while (n) {
        node_t *next = n->next;
        free(n);
        n = next;
    }
    free(q);
}

int queue_push(queue_t *q, int x) {
    node_t *n = malloc(sizeof *n);
    if (!n) return -1;
    n->value = x;
    n->next  = nullptr;
    if (q->tail) q->tail->next = n;
    else         q->head = n;
    q->tail = n;
    ++q->count;
    return 0;
}

bool queue_pop(queue_t *q, int *out) {
    if (!q->head) return false;
    node_t *n = q->head;
    *out = n->value;
    q->head = n->next;
    if (!q->head) q->tail = nullptr;
    free(n);
    --q->count;
    return true;
}

// queue_front, queue_size, queue_empty — straightforward.
```

Same trade-offs as the linked stack: more memory per element, worse cache, no growth spikes. Use it when you need pointer stability or worst-case latency guarantees.

## When to Use a Queue

Queues represent waiting lines and pipelines.

- **Breadth-first search.** BFS visits nodes in level order; the frontier is a queue.
- **Scheduling.** OS run queues, request queues in servers, work queues for thread pools — all FIFO.
- **Buffering.** Producer-consumer pipelines (the consumer drains a queue the producer fills) are queues.
- **Event loops.** Most event-driven systems pull events off a queue.
- **Print spooling.** The original use case. Documents queue up; the printer pulls from the front.

If a problem says "fairness," "level-order," "in arrival order," or "process in batches," it's a queue.

## The Deque ADT

A double-ended queue. Both ends accept push and pop. It generalizes both stack and queue.

```c
// include/algo/deque.h
typedef struct deque deque_t;

deque_t *deque_new(void);
void     deque_free(deque_t *d);

[[nodiscard]] int  deque_push_back (deque_t *d, int x);   // Θ(1) amortized
[[nodiscard]] int  deque_push_front(deque_t *d, int x);   // Θ(1) amortized
[[nodiscard]] bool deque_pop_back  (deque_t *d, int *out); // Θ(1)
[[nodiscard]] bool deque_pop_front (deque_t *d, int *out); // Θ(1)
[[nodiscard]] bool deque_back (const deque_t *d, int *out);
[[nodiscard]] bool deque_front(const deque_t *d, int *out);
```

The same ring buffer that backs the queue handles the deque, with one twist: `push_front` decrements `head` (mod `cap`) and writes there, instead of incrementing `tail`.

```c
// In a ring-buffer deque:
int deque_push_front(deque_t *d, int x) {
    if (d->count == d->cap) {
        if (deque_grow(d, d->cap * 2) != 0) return -1;
    }
    d->head = (d->head + d->cap - 1) % d->cap;   // step back, wrapping
    d->data[d->head] = x;
    ++d->count;
    return 0;
}

bool deque_pop_back(deque_t *d, int *out) {
    if (d->count == 0) return false;
    size_t back = (d->head + d->count - 1) % d->cap;
    *out = d->data[back];
    --d->count;
    return true;
}
```

All four operations are $\Theta(1)$ amortized. The structure is a queue with extra symmetry.

> :sharpgoose: The `(d->head + d->cap - 1) % d->cap` instead of `(d->head - 1) % d->cap` is the unsigned wraparound trick: `head` is `size_t`, so subtracting from zero would wrap to `SIZE_MAX`, then modulo `cap` would give the wrong answer. Adding `cap` first keeps it positive. C23's `_BitInt` could help here too — `_BitInt(64)` arithmetic has the same wrap-on-unsigned semantics, but with a defined width that's portable across architectures.

## When to Use a Deque

Most "queue or stack" problems can use a deque, but there are specific shapes where the deque is the right answer:

- **Sliding window maximum.** The classic deque problem. Maintain a deque of indices in decreasing order of their values; `pop_front` when an index falls out of the window; `pop_back` while the back's value is less than the new one. $\Theta(n)$ overall for the whole window scan.
- **Work-stealing.** Threadpool work queues are often deques: the owner pushes/pops the back (LIFO for cache locality), other threads steal from the front (FIFO so the owner gets fresh work).
- **Undo/redo.** A stack of past states for undo, a stack of undone states for redo — implemented together as a single deque is sometimes cleaner.
- **Buffer with both producer and consumer.** When the consumer might also produce (e.g., recursive task generation), a deque lets both ends push.

> :weightliftinggoose: Many "deque" problems in interviews are sliding-window variants. Practice the pattern: as elements arrive, pop from the back while the back is "dominated" by the new arrival. Pop from the front when the front falls out of the window. Two passes, both monotonic, all $\Theta(1)$ amortized — total work $\Theta(n)$.

## Performance Comparison

Representative numbers for one million pushes followed by one million pops, on a typical x86-64 laptop:

| Implementation | Push (ns/op) | Pop (ns/op) | Notes |
|---|---|---|---|
| Ring buffer queue | ~3 | ~2 | One write, one mod, one increment |
| Linked queue | ~30 | ~25 | Allocation per push, free per pop |
| Naive shift queue | infeasible | $\Theta(n)$ | Test it; it doesn't finish |
| `std::deque` (C++) | ~5 | ~5 | For comparison |

The ring buffer dominates by an order of magnitude. The cost of `malloc` per push is the killer for the linked version on the throughput axis. (For latency-bounded use, the linked version is steadier.)

## Bounded vs Unbounded

A **bounded** queue has a fixed capacity set at creation; pushes fail when full. An **unbounded** queue grows.

Bounded is preferable in:

- **Real-time systems** where unbounded growth is unacceptable.
- **Producer-consumer with backpressure.** Push failure tells the producer to slow down.
- **Fixed-size buffers** in embedded systems where heap fragmentation is unacceptable.

Unbounded is preferable in:

- **General-purpose code** where the buffer may grow unpredictably.
- **Traversal frontiers** (BFS) where the upper bound is hard to predict.

The ring buffer can do both: pass the capacity as a hint, refuse to grow on full. We've shown the unbounded version; the bounded version replaces the grow path with a "return -1" on full.

> :angrygoose: A common bug: bounded queues that signal "full" by returning a special index value (often `-1`). If the queue's element type is `int` and the data could legitimately be `-1`, the API is broken. Either return a separate boolean (the convention in this book) or use a sentinel that's outside the valid type range.

## Lock-Free Queues — A Note

For concurrent producer-consumer scenarios, you don't want to wrap a queue in a mutex if you can avoid it. Lock-free queues exist (Michael-Scott queue, Vyukov MPMC, Disruptor) and use atomic operations to coordinate without locks. They are subtle, often wrong on the first implementation, and their correctness depends on a precise memory-ordering analysis. C23 has `<stdatomic.h>` with `memory_order_acquire`, `memory_order_release`, etc. — necessary tools, but not a license to roll your own without studying.

We touch lock-free structures briefly in Chapter 22 (concurrency, end of book). For now: single-threaded, ring buffer, done.

## What's Next

Chapter 8 is linked lists — the structure we've been quietly using as the alternative implementation throughout. Singly linked, doubly linked, intrusive lists, and the question every chapter is going to keep asking: *when is a linked list the right answer?* The honest answer is "rarely," but the cases where it is are worth knowing.
