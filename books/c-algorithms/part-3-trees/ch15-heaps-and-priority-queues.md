---
sidebar_position: 6
sidebar_label: "Ch 15: Heaps & Priority Queues"
title: "Chapter 15: Heaps and Priority Queues"
---

# Chapter 15: Heaps and Priority Queues

A **heap** is a binary tree where every parent dominates its children — the parent's key is less than both children's (a *min-heap*) or greater than both (a *max-heap*). It's a relaxed ordering: no left-vs-right comparison, no full BST invariant. In exchange for the relaxation, heaps support `insert` and `extract-min` in $\Theta(\log n)$, give you the minimum in $\Theta(1)$, and can be built from a flat array in $\Theta(n)$.

Heaps are the canonical implementation of a **priority queue** — a data structure where you push items with priorities and pop the highest-priority item. They power schedulers, simulators, Dijkstra's shortest paths, A* search, event-driven I/O, top-k selection, heap sort, and median maintenance.

This chapter covers binary heaps stored as arrays (no pointers, no allocation per element), the $\Theta(n)$ build-heap algorithm, d-ary heaps, and a brief tour of mergeable heaps (binomial, Fibonacci, pairing).

## The Heap Property

For a min-heap:

```math
\forall \text{node } v: v \text{ has children} \Rightarrow v.\text{key} \leq \min(\text{children}(v).\text{key})
```

This says: **the minimum is at the root**. Anywhere else is unsorted.

A max-heap is symmetric (parent $\geq$ children, max at root). The two are mirror images; we'll do min-heaps and note the differences.

## Array Representation

A *complete* binary tree (every level full except possibly the last, which fills left-to-right) maps cleanly onto an array. For a node at index $i$:

- Parent is at $\lfloor (i - 1) / 2 \rfloor$.
- Left child is at $2i + 1$.
- Right child is at $2i + 2$.

```text
Index:  0   1   2   3   4   5   6
Tree:   1
       / \
      3   2
     / \ / \
    7  6 5  4

Array: [1, 3, 2, 7, 6, 5, 4]
```

The tree is stored without pointers, just an array. Memory per element: a single key, no link overhead. Cache behavior: excellent — adjacent levels often share cache lines, and traversal is computed offsets, not pointer dereferences.

> :nerdygoose: This is one of the most elegant correspondences in algorithms. A heap is a *tree*, conceptually, but its physical representation is a *flat array*. Binary trees with arbitrary shape don't get this — only complete binary trees, which heaps maintain by always inserting at the next available position.

## The Structure

```c
// include/algo/heap.h — min-heap of ints.
#ifndef ALGO_HEAP_H
#define ALGO_HEAP_H

#include "algo/vec.h"

typedef struct heap {
    vec_int_t v;
} heap_t;

void heap_init(heap_t *h);
void heap_free(heap_t *h);

[[nodiscard]] int  heap_push(heap_t *h, int x);    // Θ(log n)
[[nodiscard]] bool heap_pop (heap_t *h, int *out);  // Θ(log n) — pops min
[[nodiscard]] bool heap_peek(const heap_t *h, int *out); // Θ(1)
size_t  heap_size (const heap_t *h);
bool    heap_empty(const heap_t *h);

[[nodiscard]] int heap_build(heap_t *h, const int *arr, size_t n);  // Θ(n)

#endif
```

We reuse `vec_int_t` from Chapter 4 — heap operations are array operations, and the vec already handles growth.

## Insert: Sift Up

Insert at the end of the array (maintaining completeness), then bubble up while the new element is smaller than its parent.

```c
static void heap_sift_up(int *a, size_t i) {
    while (i > 0) {
        size_t p = (i - 1) / 2;
        if (a[i] >= a[p]) break;
        int tmp = a[i]; a[i] = a[p]; a[p] = tmp;
        i = p;
    }
}

int heap_push(heap_t *h, int x) {
    if (vec_push(&h->v, x) != 0) return -1;
    heap_sift_up(h->v.data, h->v.len - 1);
    return 0;
}
```

Each step compares with the parent and swaps if needed. Number of steps is at most the depth of the tree: $\Theta(\log n)$.

## Extract-Min: Sift Down

The minimum is at index 0. Remove it, move the last element to position 0, then sift it down — repeatedly swap with the smaller child until the heap property holds.

```c
static void heap_sift_down(int *a, size_t n, size_t i) {
    for (;;) {
        size_t l = 2 * i + 1;
        size_t r = 2 * i + 2;
        size_t smallest = i;
        if (l < n && a[l] < a[smallest]) smallest = l;
        if (r < n && a[r] < a[smallest]) smallest = r;
        if (smallest == i) break;
        int tmp = a[i]; a[i] = a[smallest]; a[smallest] = tmp;
        i = smallest;
    }
}

bool heap_pop(heap_t *h, int *out) {
    if (h->v.len == 0) return false;
    *out = h->v.data[0];
    h->v.data[0] = h->v.data[h->v.len - 1];
    --h->v.len;
    if (h->v.len > 0) heap_sift_down(h->v.data, h->v.len, 0);
    return true;
}

bool heap_peek(const heap_t *h, int *out) {
    if (h->v.len == 0) return false;
    *out = h->v.data[0];
    return true;
}
```

Each step compares with both children, swaps with the smaller one, and continues. Number of steps: at most the depth, $\Theta(\log n)$.

## Build-Heap in $\Theta(n)$

Naive: insert $n$ items one at a time. Total cost: $\sum \log i = \Theta(n \log n)$.

Smarter: heapify in place. Start from the last non-leaf node ($n/2 - 1$) and sift each one down toward the leaves.

```c
int heap_build(heap_t *h, const int *arr, size_t n) {
    if (vec_reserve(&h->v, n) != 0) return -1;
    for (size_t i = 0; i < n; ++i) h->v.data[i] = arr[i];
    h->v.len = n;
    if (n < 2) return 0;
    for (size_t i = n / 2; i > 0; --i) {
        heap_sift_down(h->v.data, n, i - 1);
    }
    return 0;
}
```

The total cost of `build_heap` is $\Theta(n)$, not $\Theta(n \log n)$ — a beautiful and counterintuitive result.

**Proof.** A node at depth $d$ from the bottom needs at most $d$ swaps to settle (sift-down is bounded by distance to leaf, not by depth from root). The number of nodes at distance $d$ from the bottom is at most $\lceil n / 2^{d+1} \rceil$. Total work:

```math
\sum_{d=0}^{\log_2 n} \frac{n}{2^{d+1}} \cdot d = n \sum_{d=0}^{\log_2 n} \frac{d}{2^{d+1}} \leq n \sum_{d=0}^{\infty} \frac{d}{2^{d+1}} = n
```

(The last sum converges to 1.) So total work is $\Theta(n)$. $\square$

> :mathgoose: This is one of the cleanest "the answer is surprisingly less" results in algorithms. The intuition is that *most nodes are near the bottom* — half the nodes are leaves and need zero work; a quarter are at distance 1 and need at most 1 swap; the geometric series in the depths sums to a constant.

The practical consequence: heap sort builds the heap in $\Theta(n)$, then extracts $n$ times for $\Theta(n \log n)$, total $\Theta(n \log n)$. The build phase doesn't dominate.

## Heap Sort

```c
void heap_sort(int *a, size_t n) {
    heap_t h;
    heap_init(&h);
    (void)heap_build(&h, a, n);
    for (size_t i = 0; i < n; ++i) {
        (void)heap_pop(&h, &a[i]);
    }
    heap_free(&h);
}
```

$\Theta(n \log n)$ worst case, in-place if you do it right (extract from a max-heap and put at the end of the array). Heap sort is rarely the fastest sort in practice — quicksort and merge sort beat it on cache and constant factors — but it has guaranteed $\Theta(n \log n)$ worst case and is in-place. It's the safety-net sort.

> :sarcasticgoose: Heap sort gets taught because it elegantly demonstrates the heap, not because it's the fastest sort. In production sort routines, heap sort shows up as the *fallback* for `introsort` — start with quicksort, switch to heap sort when recursion goes too deep (signaling adversarial input). Quicksort for speed, heap sort for safety.

## D-ary Heaps

Generalize from binary to d-ary: each node has $d$ children at indices $di + 1, di + 2, \ldots, di + d$.

Trade-offs:

- Higher $d$: shallower tree (depth $\log_d n$), so fewer levels in sift-up. Each step touches one parent — fast.
- Higher $d$: more children to compare in sift-down. Each step touches $d$ children — slower per step.

For 4-ary heaps, sift-up is twice as fast (half as deep) but sift-down is twice as slow (4 children to scan instead of 2). The net effect depends on the workload mix:

- Insert-heavy: prefer high $d$ (4 or 8). Many sift-ups.
- Extract-heavy: prefer $d = 2$. Many sift-downs.
- Mixed: $d = 4$ is often optimal in practice; libraries like Boost use it.

A d-ary heap is the same code with the sibling computation parameterized:

```c
static size_t parent(size_t i, size_t d) { return (i - 1) / d; }
static size_t kth_child(size_t i, size_t k, size_t d) { return d * i + 1 + k; }
```

## Decrease-Key

For Dijkstra's algorithm and similar applications, you sometimes want to *decrease* the priority of an element already in the heap (it just got a better path). Standard binary heaps don't naturally support this — you'd have to find the element first, which is $\Theta(n)$.

The fix: maintain a *position map* — a hash table or array from element identity to its current heap index. On decrease-key, look up the index, update the element, sift-up.

```c
typedef struct indexed_heap {
    int   *priorities;       // priorities[id] = current priority of id
    size_t *id_at;           // id_at[heap_index] = id stored there
    size_t *heap_index;      // heap_index[id] = where id sits in the heap
    size_t  size;
    size_t  cap;
} indexed_heap_t;
```

Decrease-key becomes $\Theta(\log n)$: look up via `heap_index[id]`, update the priority in place, sift-up.

> :sharpgoose: This is what `priority_queue` libraries call an *addressable heap* or *indexed priority queue*. It's the structure that makes Dijkstra's algorithm $\Theta((V + E) \log V)$ instead of $\Theta((V + E) V)$. Indispensable for graph algorithms.

## Mergeable Heaps

Standard binary heap merge of two heaps of sizes $n$ and $m$: build a new heap from the union. $\Theta(n + m)$.

For workloads where you merge heaps frequently, this is too slow. Three structures support faster merging:

| Structure | insert | extract-min | merge | decrease-key |
|---|---|---|---|---|
| Binary heap | Θ(log n) | Θ(log n) | Θ(n + m) | Θ(log n) |
| Binomial heap | Θ(log n) amortized | Θ(log n) | Θ(log n) | Θ(log n) |
| Fibonacci heap | Θ(1) amortized | Θ(log n) amortized | Θ(1) | Θ(1) amortized |
| Pairing heap | Θ(1) amortized | Θ(log n) amortized | Θ(1) | Θ(log n) amortized (conjectured Θ(log log n)) |

Fibonacci heaps achieve the asymptotic bounds that make Dijkstra $\Theta(E + V \log V)$ — the theoretically best for dense graphs. In practice, *binary heaps usually beat Fibonacci heaps* because their constants are dramatically smaller and cache behavior is far better. Production graph libraries (Boost, networkx, igraph) almost all use binary heaps.

> :angrygoose: This is one of the most consistent gaps between theory and practice. Fibonacci heaps look unbeatable on paper but lose by 5-10× in real benchmarks. The Dijkstra implementations in production code use binary heaps with a higher asymptotic complexity that runs faster on real hardware. Don't reach for Fibonacci heaps unless you've measured that simpler structures are the bottleneck.

Pairing heaps are a happier middle ground — simple, fast in practice, with most of the asymptotic benefits when they matter.

## Use Cases

The priority queue ADT shows up everywhere:

- **Dijkstra's shortest paths.** Min-priority queue of (distance, node).
- **A* search.** Min-priority queue of (f-score, node).
- **Event-driven simulators.** Min-heap of (time, event).
- **Job schedulers.** Priority queue of tasks.
- **Top-K problem.** Maintain a min-heap of size $K$; for each new item, push and pop if size exceeds $K$. Final heap holds the top $K$.
- **Median maintenance.** Two heaps: max-heap of lower half, min-heap of upper half. Median is one of the two roots. Each insertion is $\Theta(\log n)$.
- **Huffman coding.** Repeatedly merge the two lowest-frequency nodes via min-heap.
- **K-way merge.** Merge $k$ sorted streams using a min-heap of (current, stream-id).

> :weightliftinggoose: When a problem says "smallest of," "highest of," "next event," "by priority," or "top K," the answer is a heap. It's the second most common ADT after hash maps. Internalize the operations: peek $\Theta(1)$, push $\Theta(\log n)$, pop $\Theta(\log n)$, build $\Theta(n)$, merge $\Theta(n + m)$ for binary, $\Theta(\log n)$ for fancier.

## A Subtle Point: Stable Priority

Heaps are not stable — two items with the same priority may pop in any order. If your application needs FIFO order among equal priorities, augment the priority with an insertion timestamp:

```c
typedef struct prio {
    int priority;
    uint64_t insertion_seq;     // monotonically increasing per push
} prio_t;

// Compare lexicographically.
static int prio_cmp(const prio_t *a, const prio_t *b) {
    if (a->priority != b->priority) return a->priority - b->priority;
    return (a->insertion_seq < b->insertion_seq) ? -1 : 1;
}
```

This makes the heap behave as "priority queue with FIFO tiebreaker." Cheap and correct.

## Performance

Pushing and popping 1 million ints, on a typical x86-64 laptop:

| Implementation | Push (ns/op) | Pop (ns/op) | Build (1M elements) |
|---|---|---|---|
| Binary heap (array) | ~25 | ~50 | ~3 ms |
| 4-ary heap | ~22 | ~45 | ~3 ms |
| Pointer-based binary heap | ~80 | ~120 | n/a |
| C++ `std::priority_queue` | ~30 | ~55 | ~4 ms |
| Fibonacci heap (typical impl) | ~150 | ~200 | ~50 ms |

The flat array binary heap dominates. The pointer-based version (one node per element) is 3-4× slower because of cache and allocation. Fibonacci heaps are dramatically slower despite better asymptotics.

## What's Next

Chapter 16 covers **tries** — trees keyed on string prefixes. They're a different shape (one node per character, not one per key) and they support prefix queries that hash maps cannot. Used for autocomplete, IP routing tables, and dictionary lookup. After that: graphs, sorting, hashing — the rest of the book.
