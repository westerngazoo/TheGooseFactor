---
sidebar_position: 6
sidebar_label: "Ch 6: Complexity & Cache"
title: "Chapter 6: Complexity, Big-O Pragmatism, and Cache Hierarchy"
---

# Chapter 6: Complexity, Big-O Pragmatism, and Cache Hierarchy

Big-O tells you how an algorithm scales. Cache behavior tells you how fast it actually runs. This chapter bridges the theory (formal definitions are in the [Math Foundations appendix](../appendix/big-o-math-foundations)) and the practice — when Big-O lies, why constants matter, and how memory hierarchy dominates real-world performance.

> :mathgoose: Big-O is the right tool for choosing between $O(n \log n)$ and $O(n^2)$. It is the *wrong* tool for choosing between two $O(n \log n)$ algorithms. At the same asymptotic class, cache behavior, branch prediction, and constant factors decide the winner. Theory picks the algorithm. Benchmarking picks the implementation.

## Big-O: The 30-Second Version

$f(n) = O(g(n))$ means $f$ grows no faster than $g$, up to a constant, for large $n$.

**What to remember:**

| Complexity | Name | Doubling $n$ does... |
|---|---|---|
| $O(1)$ | Constant | Nothing — same time |
| $O(\log n)$ | Logarithmic | Adds one step |
| $O(n)$ | Linear | Doubles time |
| $O(n \log n)$ | Linearithmic | Slightly more than doubles |
| $O(n^2)$ | Quadratic | Quadruples time |
| $O(2^n)$ | Exponential | Squares time |

**Concrete numbers** (assume 1 ns per operation):

| $n$ | $O(n)$ | $O(n \log n)$ | $O(n^2)$ | $O(2^n)$ |
|---|---|---|---|---|
| $10$ | 10 ns | 33 ns | 100 ns | 1 μs |
| $100$ | 100 ns | 664 ns | 10 μs | $10^{21}$ years |
| $10{,}000$ | 10 μs | 133 μs | 100 ms | heat death |
| $10^6$ | 1 ms | 20 ms | 17 min | — |
| $10^9$ | 1 s | 30 s | 31 years | — |

> :surprisedgoose: $O(n^2)$ at $n = 10{,}000$ is 100 milliseconds. That's noticeable in a UI. At $n = 10^6$ it's 17 minutes. At $n = 10^9$ it's 31 years. And $O(n^2)$ is considered "polynomial" — it's in the easy class. Exponential algorithms become physically impossible around $n = 40$.

For rigorous definitions, proofs, and summation formulas, see the [Big-O Math Foundations appendix](../appendix/big-o-math-foundations).

## When Big-O Lies

### Lie #1: Constants Don't Matter

Big-O hides constant factors. An $O(n)$ algorithm with constant 1000 is slower than an $O(n \log n)$ algorithm with constant 2 for all practical $n$:

```
Algorithm A: T(n) = 1000n        (O(n))
Algorithm B: T(n) = 2n log₂(n)   (O(n log n))

At n = 1,000:     A = 1,000,000    B = 19,932     B wins
At n = 1,000,000: A = 1,000,000,000  B = 39,863,137  B still wins
Crossover at n ≈ 2^500 — not a real number
```

> :sarcasticgoose: "But asymptotically, $O(n)$ beats $O(n \log n)$!" Sure, at $n = 2^{500}$, which has more digits than atoms in the observable universe. Your dataset has $n = 10^6$. Measure, don't extrapolate.

### Lie #2: The Same Big-O Means The Same Speed

Merge sort and heapsort are both $O(n \log n)$. On random data, merge sort is typically 2–3x faster because:

- Merge sort accesses memory sequentially (cache-friendly)
- Heapsort jumps around the array (cache-hostile)
- Merge sort has better branch prediction patterns

Both are $\Theta(n \log n)$. The cache behavior creates a constant-factor gap that Big-O can't see.

### Lie #3: Worst Case Is What Matters

Quicksort is $O(n^2)$ worst case and $O(n \log n)$ expected. Merge sort is $O(n \log n)$ worst case. Yet quicksort is faster in practice because:

- Its inner loop is tighter (fewer comparisons per element)
- It's in-place (no $O(n)$ auxiliary memory)
- Cache performance is better (sequential access patterns)
- The $O(n^2)$ worst case almost never happens with random pivots

`std::sort` in every major standard library uses introsort — quicksort that falls back to heapsort if recursion depth exceeds $2 \log n$. Worst case $O(n \log n)$, practical performance of quicksort.

## The Memory Hierarchy

This is where theory meets hardware.

```
┌─────────────────────────────────────────┐
│          CPU Registers  (~0.3 ns)       │   ~1 KB
├─────────────────────────────────────────┤
│          L1 Cache       (~1 ns)         │   32–64 KB
├─────────────────────────────────────────┤
│          L2 Cache       (~4 ns)         │   256 KB – 1 MB
├─────────────────────────────────────────┤
│          L3 Cache       (~10 ns)        │   8–64 MB
├─────────────────────────────────────────┤
│          DRAM           (~100 ns)       │   8–128 GB
├─────────────────────────────────────────┤
│          SSD            (~100 μs)       │   256 GB – 4 TB
├─────────────────────────────────────────┤
│          HDD            (~10 ms)        │   1–20 TB
└─────────────────────────────────────────┘
```

**Key numbers:**
- L1 hit: ~1 ns (4 cycles)
- L2 hit: ~4 ns (12 cycles)
- L3 hit: ~10 ns (30 cycles)
- DRAM: ~100 ns (300 cycles)

An L1 miss that hits DRAM costs **100x more** than an L1 hit. That's not a rounding error. A cache-friendly $O(n \log n)$ algorithm can beat a cache-hostile $O(n)$ algorithm.

> :angrygoose: 100 nanoseconds doesn't sound like much. But at 3 GHz, that's 300 clock cycles. The CPU sits idle for 300 cycles waiting for one memory load. In those 300 cycles, it could have executed 300+ arithmetic operations. Cache misses are the silent killer of algorithm performance. Big-O can't see them.

### Cache Lines

Memory is fetched in **cache lines** — typically 64 bytes. When you read one byte, the CPU fetches 64 bytes around it.

```
Cache line (64 bytes):
┌────────────────────────────────────────────────────────────────┐
│ int[0] │ int[1] │ int[2] │ int[3] │ ... │ int[14] │ int[15] │
└────────────────────────────────────────────────────────────────┘
  4 bytes   4 bytes   ...                              4 bytes
  16 ints fit in one cache line
```

**Sequential access** (array scan): fetch one cache line, use all 16 ints, fetch next. 1 miss per 16 elements.

**Random access** (linked list, hash table with chaining): each element may be in a different cache line. 1 miss per element.

That's a **16x** difference in cache misses for the same number of elements.

### Why Arrays Beat Linked Lists

```
Array:   [1][2][3][4][5][6][7][8] ...
Memory:  ████████████████████████████
          ↑ one cache line covers many elements

Linked list:  [1]→  [2]→  [3]→  [4]→ ...
Memory:       █  ·····█  ·····█  ·····█
              ↑ each node may be in a different cache line
```

Traversing an array of $n$ ints causes $\sim n/16$ cache misses.
Traversing a linked list of $n$ nodes causes $\sim n$ cache misses (if nodes aren't contiguous).

Both are $O(n)$. The array version is 10–50x faster in practice.

> :nerdygoose: This is why `std::vector` is almost always the right default container, even for insertions in the middle. Shifting $n/2$ elements sounds expensive ($O(n)$), but it's a single `memmove` over contiguous memory — the CPU prefetcher handles it beautifully. A `std::list` insertion is $O(1)$ but the pointer chase to *find* the insertion point causes cache misses at every step.

## Cache-Aware Analysis

### Example: Matrix Multiplication

**Naive** (row-major × row-major):

```cpp
// O(n³) — but cache behavior depends on access order
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        for (int k = 0; k < n; k++)
            C[i][j] += A[i][k] * B[k][j];  // B[k][j] strides columns!
```

`A[i][k]` is sequential (good). `B[k][j]` jumps by `n` elements per iteration (bad — each access is a different cache line for large `n`).

**Cache-friendly** (transpose B first, or use `ikj` loop order):

```cpp
// Same O(n³) — but B access is now sequential
for (int i = 0; i < n; i++)
    for (int k = 0; k < n; k++)
        for (int j = 0; j < n; j++)
            C[i][j] += A[i][k] * B[k][j];  // Now inner loop is over j
```

With `ikj` order, both `C[i][j]` and `B[k][j]` stride sequentially in the inner loop. Same $O(n^3)$, 3–10x faster in practice.

**C version** — identical issue, identical fix:

```c
/* Naive — cache-hostile on B */
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        for (int k = 0; k < n; k++)
            C[i*n+j] += A[i*n+k] * B[k*n+j];

/* ikj order — cache-friendly */
for (int i = 0; i < n; i++)
    for (int k = 0; k < n; k++)
        for (int j = 0; j < n; j++)
            C[i*n+j] += A[i*n+k] * B[k*n+j];
```

> :weightliftinggoose: Same exercise, different technique, dramatically different results. Like changing your grip on a barbell — the muscles doing the work are the same, but the loading pattern makes the movement efficient or wasteful. Cache-aware programming is the exercise form of algorithms.

### Measuring Cache Behavior

```bash
# Cache miss rate with perf
perf stat -e cache-references,cache-misses ./your_program

# Detailed cache simulation with cachegrind
valgrind --tool=cachegrind ./your_program
cg_annotate cachegrind.out.* | head -50
```

## Branch Prediction

Modern CPUs predict which way a branch (`if`/`else`) will go and speculatively execute that path. If the prediction is wrong, the CPU flushes the pipeline — ~15-20 cycles wasted.

**Predictable branches** (nearly always taken or never taken): fast.

```cpp
// Almost always taken — predictor learns quickly
for (int i = 0; i < n; i++) {
    if (i < n - 1) {  // True 99.99% of the time
        // Fast path
    }
}
```

**Unpredictable branches** (50/50): slow.

```cpp
// Random data — branch is unpredictable
for (int i = 0; i < n; i++) {
    if (data[i] > threshold) {  // 50/50 for random data
        sum += data[i];
    }
}
```

**Branchless alternative:**

```cpp
// No branch — always executes both paths, masks the result
for (int i = 0; i < n; i++) {
    sum += data[i] * (data[i] > threshold);
}
```

> :nerdygoose: The branchless version does more arithmetic but avoids mispredictions. On sorted data, the branching version is faster (predictor is ~100% accurate). On random data, the branchless version is faster (no mispredictions). Profile both. The answer depends on your data distribution.

## Practical Complexity Guidelines

### What You Should Care About

1. **Is the algorithm in the right complexity class?** $O(n \log n)$ vs $O(n^2)$ matters. Always.
2. **Is the data access pattern cache-friendly?** Sequential > random. Contiguous > pointer-chasing.
3. **Are the inner loop operations cheap?** Virtual function calls, cache misses, and branch mispredictions in hot loops dominate runtime.

### What You Shouldn't Over-Optimize

1. **Code that runs once** at startup — $O(n^2)$ initialization on 100 elements is irrelevant.
2. **Constant factors** below $n = 1000$ — the difference between 10 μs and 30 μs doesn't matter.
3. **Asymptotic improvements** that add complexity for inputs you'll never see — Strassen's $O(n^{2.807})$ matrix multiplication loses to naive $O(n^3)$ for $n < 100$ due to overhead.

> :happygoose: The performance priority list: (1) Right algorithm. (2) Right data structure. (3) Cache-friendly layout. (4) Minimize allocations. (5) Branchless hot loops. Most performance wins come from steps 1–3. Steps 4–5 are for when you've already profiled and found a specific bottleneck.

## Small-N Effects

For small inputs, Big-O is irrelevant. What matters:

- **Function call overhead**: Recursive algorithms add stack frame overhead per call.
- **Branch overhead**: Complex control flow in the inner loop.
- **Constant factors**: Setup cost, bookkeeping variables.

This is why `std::sort` switches to insertion sort for small partitions (~16 elements). Insertion sort is $O(n^2)$ but has:
- No recursion
- Tiny inner loop (one comparison + one swap)
- Perfect cache behavior (sequential access)
- Excellent branch prediction (inner loop terminates quickly for nearly-sorted data)

```
┌─────────────────────────────────────────────────┐
│  n < ~16:  Insertion sort wins (low overhead)    │
│                                                  │
│  16 < n < ~1000: Quicksort's constant factor     │
│  advantage over merge sort matters               │
│                                                  │
│  n > ~1000: Asymptotic complexity dominates       │
│  O(n log n) always beats O(n²)                   │
│                                                  │
│  n > ~10⁶: Cache behavior differentiates          │
│  algorithms in the same complexity class          │
└─────────────────────────────────────────────────┘
```

## Data Structure Selection by Access Pattern

| Access pattern | Best structure | Why |
|---|---|---|
| Sequential scan | Array / `std::vector` | Contiguous, prefetcher-friendly |
| Random access by index | Array / `std::vector` | $O(1)$ indexed access |
| Key-value lookup | Hash table (`std::unordered_map`) | $O(1)$ amortized |
| Ordered iteration | Sorted array or BST (`std::map`) | In-order traversal |
| Insert/delete at ends | Deque / circular buffer | $O(1)$ amortized |
| Insert/delete in middle | Depends on $n$ | Vector for $n < 10{,}000$, list only if you already have the position |
| Priority queue | Binary heap (`std::priority_queue`) | $O(\log n)$ push/pop, cache-friendly array layout |

> :sarcasticgoose: "When should I use `std::list`?" Almost never. The textbook answer is "when you need $O(1)$ insertion/deletion." The real answer is "when you need $O(1)$ insertion/deletion AND you already have a pointer to the insertion point AND $n$ is large enough that the cache advantage of arrays doesn't dominate." In practice, that's rare.

## Benchmarking Complexity Experimentally

You can verify your Big-O analysis by measuring:

```cpp
// Vary n, measure time, check growth rate
for (auto n : {100, 200, 400, 800, 1600, 3200, 6400}) {
    auto start = std::chrono::high_resolution_clock::now();
    my_algorithm(data_of_size(n));
    auto end = std::chrono::high_resolution_clock::now();
    auto ms = std::chrono::duration<double, std::milli>(end - start).count();
    std::print("n={:6d}  time={:.3f}ms  ratio={:.2f}\n",
        n, ms, ms / prev_ms);
    prev_ms = ms;
}
```

**What to look for in the ratio when $n$ doubles:**

| Ratio | Complexity |
|---|---|
| ~1.0 | $O(1)$ or $O(\log n)$ |
| ~2.0 | $O(n)$ |
| ~2.0–2.5 | $O(n \log n)$ |
| ~4.0 | $O(n^2)$ |
| ~8.0 | $O(n^3)$ |

> :mathgoose: Google Benchmark has built-in complexity estimation: pass `->Complexity(benchmark::oNLogN)` and it reports whether your measured data fits the expected curve. This is the empirical verification of your theoretical analysis.

## Quick Sanity Checks

- If doubling $n$ quadruples your runtime, you have $O(n^2)$ — check for nested loops.
- If your "fast" algorithm is slower than the naive one on small $n$, that's normal. Check where the crossover is.
- A hash table with $O(1)$ lookup can be slower than a sorted array with $O(\log n)$ binary search if $n < 100$ (cache behavior wins).
- If `perf stat` shows >5% cache miss rate, your data layout is the bottleneck, not your algorithm.
- `std::sort` on 10 elements takes ~50 ns. If your sort takes 10x that, you have overhead (allocation, virtual dispatch, etc.), not an algorithmic problem.
