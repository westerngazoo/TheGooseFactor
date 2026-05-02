---
sidebar_position: 2
sidebar_label: "Writing Style & Personas"
title: "How This Book Is Written (Style & Persona System)"
---

# How This Book Is Written

Dense material, short chapters, persona callouts in the margins. The body text stays technical; the geese carry the snark, the warnings, and the asides.

## Personas

| Persona | Role / Tone |
|---------|-------------|
| Angry Goose | Pitfalls, undefined behavior, performance traps |
| Nerdy Goose | Standard references, complexity proofs, memory layout |
| Sarcastic Goose | Anti-patterns and "everyone says X but" critiques |
| Happy Goose | Reinforces clean idioms |
| Math Goose | Formalism, invariants, derivations |
| Sharp Goose | API design, naming, header hygiene |
| Surprised Goose | Edge cases, unintuitive results |
| Weightlifting Goose | Optimization analogies, training mindset |

## Callout Markup

Each callout is a blockquote whose first token is the persona tag:

```c
size_t i = linear_search(arr, n, key);
```

> :angrygoose: `linear_search` returns `(size_t)-1` on miss. If `n` is `SIZE_MAX`, the sentinel collides with a valid index. Use a separate `bool found` out-parameter when `n` can be enormous.
>
> :nerdygoose: $\Theta(n)$ comparisons in the worst case, $\Theta(n)$ on miss, $\Theta(n/2)$ on average for uniformly distributed targets.

## C Code Conventions

- **C23** unless an earlier standard is being compared.
- Compile flags assumed: `-std=c23 -Wall -Wextra -Werror -O2`.
- `static` on every non-exported function. `extern` on exported declarations.
- Empty parameter lists are written `f(void)` for compatibility with older readers, even though C23 makes `f()` equivalent.
- `[[nodiscard]]` on functions whose return value carries an error or an allocation.
- `[[maybe_unused]]` rather than `(void)x` casts.
- Complexity comment immediately above each function:
  ```c
  // Θ(n log n) avg, Θ(n²) worst (degenerate pivot).
  static void quicksort(int *a, size_t n);
  ```
- Allocations: every `malloc` paired with a labelled `free` in the same listing.
- Error handling: return an `int` error code or `bool` success flag; output values via pointer parameters. We do not use `errno` for library-style code.

## Test Snippets

Tests are minimal C using a tiny assertion harness (introduced in Chapter 3). Until then, examples use plain `assert.h`:

```c
#include <assert.h>

static void test_linear_search_basic(void) {
    int a[] = {3, 1, 4, 1, 5, 9, 2, 6};
    size_t i;
    assert(linear_search(a, 8, 5, &i) && i == 4);
    assert(!linear_search(a, 8, 7, &i));
}
```

> :nerdygoose: Property tests (random inputs, invariant checks) appear from Chapter 7 onward.

## Benchmark Snippets

Benchmarks use a header-only harness that wraps `clock_gettime(CLOCK_MONOTONIC)`:

```c
BENCH(linear_search_n_1000) {
    int *a = make_random(1000);
    size_t i;
    BENCH_LOOP { (void)linear_search(a, 1000, 42, &i); }
    free(a);
}
```

## Chapter Completion Checklist

A chapter is `[~] drafting` until:

1. Invariants stated explicitly.
2. Complexity claim with $\Theta$ or $O$ justified, not asserted.
3. Edge cases enumerated (empty input, single element, all-equal, max-size).
4. At least one persona callout calling out a real pitfall.
5. A working code listing that compiles under the standard flags.
6. A test snippet with at least one boundary case.

A chapter without measurements where measurements are warranted is `[~] drafting`.
