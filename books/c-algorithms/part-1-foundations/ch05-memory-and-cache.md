---
sidebar_position: 5
sidebar_label: "Ch 5: Memory & Cache"
title: "Chapter 5: Memory, Cache, and the Cost Model Behind the Cost Model"
---

# Chapter 5: Memory, Cache, and the Cost Model Behind the Cost Model

The previous chapters counted operations: comparisons, assignments, array accesses. We treated each as $\Theta(1)$. That treatment is correct for asymptotic analysis and useful for predicting how an algorithm scales. It is also a *lie about constants*. A real CPU does not execute every "constant-time" operation in the same number of cycles. The gap between two algorithms with the same Big-O can be 100× depending on how they touch memory.

This chapter is about that gap. We look at the memory hierarchy, why a linear scan over an array often beats a "smarter" algorithm that touches scattered memory, and when this matters enough to revisit your asymptotic claim.

## The Memory Hierarchy

A modern x86-64 CPU has roughly six tiers of storage between the program and the bits:

| Tier | Size | Latency | Bandwidth (one core) |
|---|---|---|---|
| Registers | ~256 bytes | < 1 cycle | enormous |
| L1 cache | 32–128 KB | ~4 cycles (~1 ns) | ~1 TB/s |
| L2 cache | 256 KB – 2 MB | ~12 cycles (~3 ns) | ~500 GB/s |
| L3 cache | 4–128 MB (shared) | ~40 cycles (~12 ns) | ~200 GB/s |
| DRAM | 16 GB – 1 TB | ~80 ns | ~50 GB/s |
| NVMe SSD | 256 GB – 8 TB | ~50 µs | ~5 GB/s |

The numbers are approximate, vary by CPU, and the exact ratios shift every generation. The shape doesn't change. **Each tier is roughly an order of magnitude slower than the one above it.**

Going to DRAM costs *eighty nanoseconds*. In that time a modern CPU could execute roughly $200$ instructions if they hit cache. A single random read from main memory has the same cost as $200$ adds. The cost model that treats every memory access as $\Theta(1)$ is hiding a factor that, in the worst case, is *the entire performance of your program*.

> :angrygoose: This is why "Big-O is the only thing that matters" is wrong, and also why "constants are everything" is wrong. Both are true exactly when the data fits in their respective regimes. Below the cache size, constants dominate. Above it, asymptotics dominate. Most real workloads sit on the boundary, and you cannot predict which side without measuring.

## Cache Lines

The CPU does not move bytes. It moves *cache lines* — fixed-size chunks of memory, typically 64 bytes on x86-64 (sometimes 128 on Apple Silicon, 64 on ARM). When you read one byte that isn't in cache, the CPU loads the entire 64-byte line containing that byte.

This has two consequences:

**Sequential access is free.** Reading bytes 0..7 takes one cache miss (loading the line). Reading bytes 8..15 takes zero — they're already in the line you loaded. A linear scan touches each cache line exactly once.

**Random access is expensive per element.** A random read pulls in 64 bytes, uses 8 of them (one `int64_t`), and discards the rest on the next miss. Effective bandwidth is $1/8$ of the peak.

```c
// Sequential: 1 cache miss per 64 bytes = 16 ints per miss
int sum_seq(const int *a, size_t n) {
    int s = 0;
    for (size_t i = 0; i < n; ++i) s += a[i];
    return s;
}

// Random (via shuffled index array): 1 cache miss per 4 bytes = 1 int per miss
int sum_random(const int *a, const size_t *idx, size_t n) {
    int s = 0;
    for (size_t i = 0; i < n; ++i) s += a[idx[i]];
    return s;
}
```

Both are $\Theta(n)$. On an array large enough that each random access is a cache miss, `sum_random` runs roughly **16× slower** than `sum_seq`. The Big-O notation cannot tell you this. The cache line size and access pattern can.

> :nerdygoose: 64 bytes is the line size on most x86-64. You can read it from `/sys/devices/system/cpu/cpu0/cache/index0/coherency_line_size` on Linux, or via `sysctl hw.cachelinesize` on macOS. The C23 way is `alignas(64)` to align a struct to a line boundary; the older way is the GCC attribute `__attribute__((aligned(64)))`.

## Prefetching

Modern CPUs prefetch sequential memory automatically. The hardware prefetcher detects patterns like "the program is reading consecutive cache lines" and starts loading the next several lines before the program asks for them. This means:

- A linear scan over a packed array runs at memory bandwidth — typically 30–50 GB/s on a desktop. 100 million `int`s scan in well under a second.
- A scan with a non-trivial stride (e.g., reading every 4th `int` of a struct array) often still benefits from prefetching, because the hardware detects the stride.
- A truly random access pattern — an indirection through a hash table, or following pointers in a linked list — defeats the prefetcher. Each access is on its own.

The prefetcher is also why some "cache-friendly" hand-tuning is irrelevant: blocked matrix multiplication, for example, mostly works because it brings the working set into cache, not because it changes the prefetch pattern.

> :weightliftinggoose: Think of prefetching as a sprint coach that watches your last few steps and bets on your next one. If you're sprinting straight ahead, the coach is sprinting alongside you. If you're zigzagging, the coach is left behind. The skill in writing fast code is: most of the time, sprint straight.

## Worked Example: Array vs Linked List

Both have a "linear scan" with $\Theta(n)$ asymptotic cost. The difference in real cost is dramatic.

```c
// Sum over an array of 1M ints (4 MB).
typedef struct {
    int values[1'000'000];
} array_t;

int sum_array(const array_t *a) {
    int s = 0;
    for (size_t i = 0; i < 1'000'000; ++i) s += a->values[i];
    return s;
}

// Sum over a linked list of 1M ints.
typedef struct node {
    int value;
    struct node *next;
} node_t;

int sum_list(const node_t *head) {
    int s = 0;
    for (const node_t *n = head; n; n = n->next) s += n->value;
    return s;
}
```

Both are $\Theta(n)$. Both touch 1 million integers. On a typical x86-64 laptop:

| Implementation | Time (1M elements) | ns per element |
|---|---|---|
| `sum_array` (cache-warm) | ~250 µs | 0.25 |
| `sum_array` (cold) | ~600 µs | 0.6 |
| `sum_list`, allocated in order | ~2 ms | 2.0 |
| `sum_list`, allocated randomly | ~30 ms | 30 |

(Numbers vary. Run them yourself; they will be in the same shape.)

The two extreme cases are 100× apart on the same algorithm with the same inputs. What makes the difference:

- **Layout.** Array elements are contiguous; cache lines hit 16 elements. List nodes are scattered; each node is on its own line.
- **Pointer chasing.** The CPU cannot prefetch a linked list because the address of the next node depends on the current node. Each iteration must wait for one cache miss before issuing the next.
- **Branch prediction.** The array loop has a known iteration count; the list loop has a `nullptr` check at every step. Modern branch predictors handle the list well, but the cost is non-zero.

> :surprisedgoose: The "list allocated randomly" case is the realistic one. If you build a list by repeated `malloc`, allocations come back from wherever the allocator has free space — usually scattered as the heap fragments. Even a list "freshly allocated" right after program start can end up with nodes spanning many cache lines.

## Why Most Modern Algorithms Use Arrays

The dominance of array-based structures in modern libraries is not stylistic. It's a direct consequence of cache.

- **Hash maps** are usually open addressing (a flat array with collision resolution) rather than chaining (an array of linked lists), because open addressing has cache-friendly probe sequences.
- **B-trees** beat binary trees in databases because each node holds many keys, fitting in a cache line and amortizing the cost of a memory access.
- **`std::vector` is preferred over `std::list`** in almost every C++ benchmark, even for operations the list "should" win at, like middle insertion — because the cost of finding the insertion point in a list dominates.
- **Sorted insertion into a small vector** beats a `std::set` for collections under a few thousand elements, because the cache benefits outweigh the $\Theta(n)$ shift cost.

The pattern is consistent: layout and access pattern usually matter more than asymptotic operation count, until $n$ gets very large.

> :sarcasticgoose: "But linked lists have $\Theta(1)$ insert at any point!" Yes, *if you already have a pointer to the insertion location*. Finding that pointer is $\Theta(n)$. The "$\Theta(1)$ insert" claim is technically true and practically useless for anything but specific scenarios (intrusive lists in OS kernels, free lists in allocators).

## Branch Prediction

Modern CPUs predict the outcome of conditional branches, speculate down the predicted path, and roll back if wrong. A correctly predicted branch is roughly free; a misprediction costs ~15 cycles.

```c
// Predictable branch: pattern is always the same.
int count_below_threshold(const int *a, size_t n, int t) {
    int count = 0;
    for (size_t i = 0; i < n; ++i) {
        if (a[i] < t) ++count;
    }
    return count;
}
```

If the array is sorted, the branch's outcome is `true` for the first chunk and `false` for the rest. The predictor latches onto the pattern after a few iterations and runs at full speed. If the array is random, the branch is unpredictable — the predictor is wrong half the time, and each misprediction stalls the pipeline.

A famous benchmark: counting elements below a threshold in a sorted vs unsorted array runs **3× faster on the sorted version**, even though the algorithm is identical and the data is identical content-wise. Sorting first costs $\Theta(n \log n)$ — but if you do many threshold queries, the per-query cost goes from "branch-mispredicting" to "branch-friendly" and you come out ahead.

> :angrygoose: This is the kind of performance behavior that makes naive Big-O analysis lie. The sorted-then-count approach is asymptotically *worse* ($n \log n + Qn$ vs $Qn$ where $Q$ is the number of queries), and yet for moderate data sizes, with $Q > 1$, it's faster. Constants matter. Predictability matters.

A common fix when the branch can't be made predictable: rewrite as branchless code.

```c
// Branchless: no conditional, just arithmetic.
int count_below_threshold_branchless(const int *a, size_t n, int t) {
    int count = 0;
    for (size_t i = 0; i < n; ++i) {
        count += (a[i] < t);   // <-- evaluates to 0 or 1; no branch
    }
    return count;
}
```

The branchless version is slightly slower on the *predictable* case (it always does the add) and significantly faster on the *unpredictable* case (no mispredictions). For data of unknown shape, branchless is the safer default.

## When Cache Effects Change the Asymptotic Choice

Sometimes the cache effect is large enough that you should pick a different algorithm — one with worse Big-O but better constants — for realistic input sizes. Three examples:

### Insertion Sort vs Merge Sort

Insertion sort is $\Theta(n^2)$. Merge sort is $\Theta(n \log n)$. Asymptotically, merge sort wins. But:

- For $n < ~50$, insertion sort is faster — fewer operations per element, no allocation, fits in cache.
- Most production sort routines (`std::sort`, `qsort`, glibc `qsort_r`) switch to insertion sort for small subarrays inside their merge or quick framework. The crossover is usually around $n = 16$ or $32$.

Insertion sort isn't a "wrong" choice for small $n$ — it's the *right* choice. The asymptotic tail of merge sort never gets a chance to dominate.

### Linear Search vs Binary Search

Binary search is $\Theta(\log n)$. Linear is $\Theta(n)$. But:

- For small arrays (say, $n < 64$), linear search fits in one cache line and runs at memory bandwidth. Binary search bounces around the array, defeating prefetching, and *also* has unpredictable branches.
- Glibc's binary search of small arrays often calls into a manually unrolled linear scan first.

### Hash Map vs Sorted Array

For lookup-heavy workloads with small $n$:

- A sorted array with binary search: $\Theta(\log n)$ comparisons, branch-mispredicting.
- A hash map: $\Theta(1)$ expected, but with hash computation, indirection, and possible collision handling.
- A linear scan over a sorted array: $\Theta(n)$ but cache-friendly and branch-predictable.

For $n \leq 16$ keys, linear scan often wins. For $n$ in the hundreds, binary search wins. For $n$ in the thousands or millions, hash map wins. The crossovers depend on key size, hash quality, and memory layout.

> :nerdygoose: This is why `std::unordered_map` is often slower than a flat sorted vector with binary search for small sets in C++. The hash map's constant factors (allocation, pointer indirection, hash computation) only pay off above some break-even $n$ that's surprisingly large. Knowing where the break-even is *for your hash quality on your data* is a measurement, not a theorem.

## How to Diagnose a Cache-Bound Algorithm

You wrote an algorithm with the right Big-O. It's slow. Three diagnostics, in order of decreasing usefulness:

**1. Working set vs cache size.** Does your data fit in L1? L2? L3? RAM? A 4 MB array fits in most desktop L3 caches; a 200 MB array does not. If your working set exceeds L3, expect ~80 ns per random access — and structure your algorithm to scan, not jump.

**2. Access pattern.** Is the algorithm scanning, striding, or random-accessing? Use a tool like `perf stat -e cache-misses,cache-references` (Linux) or Instruments (macOS) to count misses. If misses are > 10% of references, the algorithm is cache-bound; reorganize the data layout.

**3. Branch behavior.** `perf stat -e branch-misses,branches`. Above a few percent miss rate, branchless rewrites or sorting the data help.

> :sharpgoose: The sequence "I think this is slow because of X" / "let me measure X" is the entire optimization workflow. Without measurement, "fixing" performance is guesswork. With measurement, every optimization is a hypothesis you can verify or reject in minutes.

## A Caveat: This Is x86-64

Everything above describes a contemporary out-of-order superscalar CPU with a deep cache hierarchy and an aggressive prefetcher — Intel/AMD desktops, Apple Silicon, modern ARM server chips. On a microcontroller, none of this applies:

- A Cortex-M0 has no cache at all. Every memory access is the same speed.
- A small RISC-V embedded core may have a tiny L1 and no prefetcher. Locality still matters; prefetching doesn't.
- A GPU has thousands of threads sharing a tiny cache; the cost model is "are you using the right thread index pattern."

The general lesson — "memory is hierarchical, locality dominates constants" — applies almost universally. The specific numbers and tactics do not. When you target a different architecture, re-derive the cost model.

> :surprisedgoose: For embedded code on a microcontroller without cache, an algorithm that's "obviously slow on a desktop" — like a linked list — can be perfectly fine. The chip has 4 KB of SRAM and no prefetcher; locality has nothing to optimize. Embedded systems books often look weird to desktop developers because their cost model is from the 1990s, when desktop and embedded were the same thing. Both books are correct for their domains.

## Summary

The asymptotic class tells you how an algorithm scales. The constants tell you whether it's fast today on your hardware. Both matter. The order of investigation:

1. Pick the right asymptotic class first. A $\Theta(n^2)$ algorithm is rarely fixable with constants.
2. Once the class is right, look at memory layout. Arrays beat lists. Contiguous beats scattered. Small structs in cache lines beat big ones.
3. Once the layout is right, look at branches. Predictable beats unpredictable. Branchless beats both when the branch is unpredictable.
4. Only then look at micro-optimizations: SIMD, alignment, manual prefetching. Most algorithms never need these.

Skip step 1 and you can't catch up. Skip step 2 and you'll wonder why your "fast" algorithm is slow. Skip step 3 and your fast paths will surprise you. Skip step 4 and you'll mostly be fine — micro-optimization is the smallest leverage of the four.

> :happygoose: This is the final piece of the foundations. From Chapter 6 onward we are doing concrete algorithms — sorts, searches, trees, graphs. We will count operations *and* keep an eye on cache behavior. Every claim of "this is fast" will be a measurement, not a hope. The toolkit is now complete: definition (Ch 1), notation (Ch 2), build (Ch 3), data structure (Ch 4), and cost model (Ch 5). Forward.

## What's Next

Part II opens with a hard look at sequences — arrays, dynamic arrays, linked lists, ring buffers, deques — and lays out where each one is the right answer and where it's the wrong one. After that: sorting (Part III), searching and hashing (Part IV), trees and graphs (Part V), strings (Part VI), and a closing engineering chapter on profiling and PGO (Part VII).
