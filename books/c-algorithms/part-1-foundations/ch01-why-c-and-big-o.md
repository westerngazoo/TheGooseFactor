---
sidebar_position: 1
sidebar_label: "Ch 1: Why C, Why Big-O"
title: "Chapter 1: Why C, Why Big-O"
---

# Chapter 1: Why C, Why Big-O

Two questions before we write a single line. Why C? And why measure algorithms with a notation that throws away constant factors? The answers are connected, and they set the contract for the rest of the book.

## What Is an Algorithm

An algorithm is a finite procedure that, given an input, produces an output, and terminates. That's the definition. Three properties matter:

- **Determinism** — the same input produces the same output.
- **Finiteness** — it stops.
- **Effectiveness** — every step is mechanically executable.

Sorting eight integers is an algorithm. So is "compute the sum of the first $n$ natural numbers." So is the procedure your CPU follows when it does an integer divide. We study them because most programs are made of them, and the difference between a fast program and a slow one is usually the difference between a good algorithm and a lazy one.

> :mathgoose: Computability theory studies which problems *have* algorithms. We don't go there. We assume the problem is computable and ask the next question: how expensive is the computation as the input grows?

## Why Big-O Throws Away Constants

The first thing complexity analysis does is throw away information. Constant factors gone. Lower-order terms gone. The function $3n^2 + 7n + 5$ becomes $\Theta(n^2)$. New readers find this offensive. They ask, reasonably: if the constants matter for actual runtime, why discard them?

Three reasons.

**Constants are not portable.** A factor of $3$ on one CPU is a factor of $1.4$ on another with a deeper pipeline, or $7$ on an embedded part with no out-of-order execution. The asymptotic class is a property of the *algorithm*. The constant is a property of the *machine plus the compiler plus the cache state on Tuesday*.

**Asymptotic class predicts the cliff.** A $\Theta(n^2)$ algorithm and a $\Theta(n \log n)$ algorithm cross at some $n$. Past the crossover, no amount of constant-factor cleverness will close the gap. The crossover for many real workloads is small. Knowing the class tells you whether your code will scale; knowing the constant tells you only whether it's fast *today*.

**Constants are negotiable later.** You can write a clean $\Theta(n \log n)$ sort and then spend a week tuning its constants. You cannot write a clean $\Theta(n^2)$ sort and then tune your way out of being quadratic. The class is the strategic decision; the constants are the tactical one.

> :angrygoose: All of which is true and all of which has limits. For $n = 10$, a quadratic algorithm with a small constant beats a logarithmic one with a large constant every time. Insertion sort beats merge sort up to about $n = 50$ on most machines. Throwing away constants is a *tool*, not a religion. We measure when it matters.

## Why C, Specifically

Because C lets you see the cost.

Take a dynamic array push. In C++, `vec.push_back(x)` is one expression, but it can: copy `x`, move `x`, allocate a new buffer, copy the old buffer, run destructors, throw an exception. You learn the asymptotics in school as "amortized $\Theta(1)$ amortized," and that's correct, but the actual code is hidden behind operator overloads, move semantics, allocator awareness, and exception safety. You take the asymptotic on faith.

In C, the same operation looks like this:

```c
// Θ(1) amortized, Θ(n) worst case (when realloc moves the buffer).
static int vec_push(struct vec *v, int x) {
    if (v->len == v->cap) {
        size_t new_cap = v->cap ? v->cap * 2 : 8;
        int *new_data = realloc(v->data, new_cap * sizeof *new_data);
        if (!new_data) return -1;
        v->data = new_data;
        v->cap = new_cap;
    }
    v->data[v->len++] = x;
    return 0;
}
```

Every cost is on the page. The doubling. The `realloc` that may copy. The branch you take when the buffer is full. The error path. The amortization argument is no longer a black box — you can read the code and *see* that the expensive branch fires once for every doubling, which is why the average is $\Theta(1)$.

> :sarcasticgoose: "But this is more code than C++!" Yes. That's the point. Each extra line is something C++ does too — it just hides it. You are not writing more code; you are *seeing* the code that was always there.

## The C Cost Model

Throughout this book we treat the following operations as $\Theta(1)$:

- Arithmetic on machine-size integers (`int`, `size_t`, etc.).
- Pointer arithmetic and dereference of an address that's already in cache.
- Reading or writing a single machine word at an aligned address.
- Comparing two machine words.
- A function call (the call/return overhead is constant).

We treat the following as **not** $\Theta(1)$:

- `malloc` and `free`, which allocate and traverse heap metadata. Treated as $\Theta(1)$ amortized in the absence of fragmentation, but real workloads can pay $\Theta(n)$ when the allocator coalesces.
- `memcpy`, `memmove`, `memset` — $\Theta(n)$ in the size of the region.
- `strlen`, `strcmp`, and any string operation — $\Theta(n)$ in the string length.
- A cache miss. Officially constant; practically a 100x penalty. We track misses separately when they dominate runtime.

> :nerdygoose: This is the **uniform-cost RAM model** with a footnote for cache. It is a useful fiction. Real CPUs have multi-level caches, branch predictors, and out-of-order execution that make individual operations vary by orders of magnitude. We use the uniform model for asymptotic analysis and break out actual measurements when the model lies.

## A First Algorithm: Linear Search

The simplest possible algorithm. Go through the array, return the index of the first match.

```c
#include <stdbool.h>
#include <stddef.h>

// Θ(n) comparisons worst case.
// On hit: Θ(k) where k is the index of the first match.
// On miss: Θ(n).
[[nodiscard]] static bool linear_search(
    const int *a, size_t n, int key, size_t *out_index)
{
    for (size_t i = 0; i < n; ++i) {
        if (a[i] == key) {
            *out_index = i;
            return true;
        }
    }
    return false;
}
```

Three things to notice.

**The complexity comment is on the function.** $\Theta(n)$ on miss, $\Theta(k)$ on hit. We are honest about what we measured: comparisons. We are not claiming anything about cache behavior or branch prediction yet.

**`bool found` plus `size_t *out_index`.** Not "return $-1$ on miss." A separate boolean is more honest — it does not collide with valid indices, and the type signature documents that the caller must handle absence.

**`[[nodiscard]]` is a C23 attribute.** It tells the compiler to warn if the caller throws away the return value. Before C23, this was a vendor extension (`__attribute__((warn_unused_result))` on GCC). The standard syntax is portable.

### Edge Cases

- $n = 0$: the loop body never executes; we return `false`. Correct.
- All elements equal `key`: returns `true` with index $0$. Correct.
- `a == NULL` and $n = 0$: loop body never executes; we never dereference. Correct, even though the pointer is null. (If $n > 0$ and `a == NULL`, the dereference is undefined behavior. The function does not check; the caller must not lie.)

> :angrygoose: That last point is a recurring theme. C library functions assume their preconditions. They do not check. If you pass `NULL` to `memcpy` with a nonzero size, the standard says the behavior is undefined — even if `memcpy` "would have worked" with a length of zero on some implementations. C23 changes this for `memcpy` (per N2528 it is now defined for size zero with null pointers), but the rule for the rest of `<string.h>` still bites. Read the contract.

### What's the Average?

If the key is uniformly distributed among the $n$ positions of the array (and is present), the expected number of comparisons is:

```math
\frac{1}{n}\sum_{k=1}^{n} k = \frac{n+1}{2}
```

So the average case is $\Theta(n)$ — same class as the worst case. Linear search has no clever average. The reason we use it anyway is that for small $n$, or for unsorted data we will scan only once, the constant is tiny. A linear scan over $1{,}000$ integers fits in L1 cache and runs in microseconds.

> :weightliftinggoose: Don't sneer at $\Theta(n)$. Your CPU prefetches sequential memory aggressively. A linear scan over a packed array often beats a "smarter" algorithm that touches scattered memory, because a single cache miss can cost more than $50$ comparisons. Sometimes the lazy algorithm wins. We will measure this in Chapter 6.

## What This Book Will Not Do

A few negative commitments, so the contract is clear.

**No "sufficiently smart compiler" hand-waving.** When we claim a complexity, we either prove it or measure it. We do not say "the optimizer makes this fast" without showing what the optimizer actually emits.

**No undefined behavior shortcuts.** We will not write `int x; if (x == 5) ...` and call it a "bug." It is undefined behavior — the compiler is licensed to delete the surrounding code or assume `x` has any value it likes. We name UB when it appears and we route around it.

**No premature optimization.** We will not unroll loops, hand-write SIMD, or align structs to cache lines until we have measured that doing so changes a real number. Most chapters never need to go there. The ones that do, do.

**No C++.** This is plain C. We do not use `std::` anything. We do not use templates. We do not use exceptions. When we want generics, we use macros, `void *`, or code generation — and we are explicit about the trade-offs.

> :sharpgoose: A clean C interface is a small one. Function pointer for the comparator, `void *` for the element type, `size_t` for everything that counts. The `qsort` signature is ugly, but it is a *small* ugly. The C++ equivalent is six template parameters, two concepts, and a `requires` clause. Pick the kind of complexity you can audit.

## What's Next

Chapter 2 makes Big-O formal: the $\epsilon$/$N$ definitions of $O$, $\Theta$, $\Omega$, and the rules for combining them. Chapter 3 sets up the build environment, the test harness, and the benchmark harness. Chapter 4 returns to dynamic arrays and proves the amortization claim properly. By Chapter 7 we are sorting; by Chapter 12, we are doing graph algorithms.

If you want the C23 reference now — it's in the appendix. Read it once, refer back when an unfamiliar feature appears in a chapter.

> :happygoose: One last thing. This book is about algorithms, but it's also about a language. C in 2024 is not the C of K&R 1978. The new standard removes most of the historical traps, and we use those removals — `nullptr`, `[[attributes]]`, `static_assert`, real `bool`. If you have not written modern C before, the appendix is the fastest path in.
