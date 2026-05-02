---
sidebar_position: 3
sidebar_label: "Ch 3: Build & Bench Setup"
title: "Chapter 3: Build, Test, and Benchmark Setup"
---

# Chapter 3: Build, Test, and Benchmark Setup

The rest of the book assumes a working environment: a C23-capable compiler, a Makefile, a test harness, and a benchmark harness. This chapter sets up all four. Nothing here is novel — it's plumbing — but it has to exist before any of the chapters that follow can claim "compiles" or "measured."

## Project Layout

```text
.
├── Makefile
├── include/
│   ├── algo/
│   │   ├── vec.h
│   │   ├── sort.h
│   │   └── ...
│   ├── test.h          // tiny test harness
│   └── bench.h         // tiny benchmark harness
├── src/
│   ├── vec.c
│   ├── sort.c
│   └── ...
├── test/
│   ├── test_vec.c
│   ├── test_sort.c
│   └── ...
└── bench/
    ├── bench_vec.c
    └── bench_sort.c
```

Library code in `src/`, headers in `include/`, tests in `test/`, benchmarks in `bench/`. Each test or benchmark is a standalone `main()` that links against the library.

> :sharpgoose: One header per logical module, in `include/algo/`. The `algo/` prefix prevents collisions when the library is installed system-wide (`#include <algo/vec.h>` is unambiguous; `#include <vec.h>` is not). Cost: an extra path component. Benefit: never having to rename a header because someone else picked the same word.

## Compiler Flags

The standard compile flags for everything in this book:

```sh
-std=c23 -Wall -Wextra -Werror -pedantic
-Wshadow -Wstrict-prototypes -Wmissing-prototypes
-Wold-style-definition -Wcast-qual -Wcast-align
-Wpointer-arith -Wfloat-equal -Wsign-compare
-Wundef -Wwrite-strings -Wunreachable-code
-Iinclude
```

For optimized builds: `-O2 -DNDEBUG`. For debug: `-O0 -g3 -fsanitize=address,undefined`. For profile: `-O2 -g -fno-omit-frame-pointer`.

> :angrygoose: Skip `-Werror` and you'll let warnings accumulate until they're worthless background noise. The right approach is: every warning is a build failure on your CI, but you're allowed to disable a specific warning at a specific site with `#pragma GCC diagnostic` if it's a false positive. Treat warnings as bugs and they'll stay manageable.

## Makefile

A single Makefile builds the library, runs every test, and runs every benchmark. Annotated:

```makefile
# Project layout
SRC_DIR    := src
TEST_DIR   := test
BENCH_DIR  := bench
INC_DIR    := include
BUILD_DIR  := build

# Toolchain
CC         := gcc
CSTD       := -std=c23
WARN       := -Wall -Wextra -Werror -pedantic \
              -Wshadow -Wstrict-prototypes -Wmissing-prototypes \
              -Wold-style-definition -Wcast-qual -Wcast-align \
              -Wpointer-arith -Wfloat-equal -Wsign-compare \
              -Wundef -Wwrite-strings -Wunreachable-code
INCLUDE    := -I$(INC_DIR)

# Build modes (override on cmdline: `make MODE=debug`)
MODE       ?= release
ifeq ($(MODE),debug)
  OPT      := -O0 -g3 -fsanitize=address,undefined
  DEFS     := -DDEBUG
else ifeq ($(MODE),release)
  OPT      := -O2 -DNDEBUG
  DEFS     :=
else ifeq ($(MODE),bench)
  OPT      := -O2 -g -fno-omit-frame-pointer
  DEFS     := -DNDEBUG
else
  $(error unknown MODE=$(MODE))
endif

CFLAGS     := $(CSTD) $(WARN) $(OPT) $(DEFS) $(INCLUDE)
LDFLAGS    := $(OPT)

# Sources / objects
SRCS       := $(wildcard $(SRC_DIR)/*.c)
OBJS       := $(SRCS:$(SRC_DIR)/%.c=$(BUILD_DIR)/%.o)

LIB        := $(BUILD_DIR)/libalgo.a

TEST_SRCS  := $(wildcard $(TEST_DIR)/*.c)
TEST_BINS  := $(TEST_SRCS:$(TEST_DIR)/%.c=$(BUILD_DIR)/test_%)

BENCH_SRCS := $(wildcard $(BENCH_DIR)/*.c)
BENCH_BINS := $(BENCH_SRCS:$(BENCH_DIR)/%.c=$(BUILD_DIR)/bench_%)

# Default target
.PHONY: all
all: $(LIB)

# Library
$(LIB): $(OBJS) | $(BUILD_DIR)
	ar rcs $@ $^

$(BUILD_DIR)/%.o: $(SRC_DIR)/%.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) -MMD -c $< -o $@

# Test binaries link against the static library
$(BUILD_DIR)/test_%: $(TEST_DIR)/%.c $(LIB) | $(BUILD_DIR)
	$(CC) $(CFLAGS) $< $(LIB) $(LDFLAGS) -o $@

# Bench binaries — same, but built with bench mode flags
$(BUILD_DIR)/bench_%: $(BENCH_DIR)/%.c $(LIB) | $(BUILD_DIR)
	$(CC) $(CFLAGS) $< $(LIB) $(LDFLAGS) -o $@

$(BUILD_DIR):
	mkdir -p $@

# Run all tests, fail on first error
.PHONY: test
test: $(TEST_BINS)
	@set -e; for t in $^; do echo "== $$t =="; $$t; done

# Run all benchmarks
.PHONY: bench
bench: $(BENCH_BINS)
	@for b in $^; do echo "== $$b =="; $$b; done

.PHONY: clean
clean:
	rm -rf $(BUILD_DIR)

# Auto-include dependency files for incremental builds
-include $(OBJS:.o=.d)
```

What this gets you:

- `make` — builds the static library `libalgo.a`.
- `make test` — builds and runs all tests, fails on first failure.
- `make MODE=debug test` — same but with sanitizers on.
- `make bench` — runs all benchmarks.
- `make clean` — wipes the build directory.

> :nerdygoose: The `-MMD` flag generates `.d` files alongside each `.o`, listing the headers each source depends on. The `-include` line at the bottom pulls them in, so editing a header rebuilds every source that includes it. This single line is the difference between "incremental builds work" and "I always do `make clean` first."

## A Tiny Test Harness

`include/test.h`. Single-header, depends on nothing but `<stdio.h>` and `<stdlib.h>`.

```c
// include/test.h — minimal test harness for the algorithms book.
#ifndef ALGO_TEST_H
#define ALGO_TEST_H

#include <stdio.h>
#include <stdlib.h>

typedef struct test_state {
    int passed;
    int failed;
    const char *current;
} test_state_t;

extern test_state_t g_test;

#define TEST(name) static void test_##name(void); \
    __attribute__((constructor)) static void register_##name(void) { \
        g_test.current = #name; \
        printf("  [test] %-40s ", #name); \
        fflush(stdout); \
        int before = g_test.failed; \
        test_##name(); \
        if (g_test.failed == before) { ++g_test.passed; printf("ok\n"); } \
    } \
    static void test_##name(void)

#define EXPECT(cond) do { \
    if (!(cond)) { \
        ++g_test.failed; \
        printf("FAIL\n    %s:%d: expected: %s\n", __FILE__, __LINE__, #cond); \
        return; \
    } \
} while (0)

#define EXPECT_EQ(a, b) do { \
    long long _a = (long long)(a), _b = (long long)(b); \
    if (_a != _b) { \
        ++g_test.failed; \
        printf("FAIL\n    %s:%d: expected %s == %s, got %lld vs %lld\n", \
               __FILE__, __LINE__, #a, #b, _a, _b); \
        return; \
    } \
} while (0)

// Required main: include this in exactly one test file per binary.
#define TEST_MAIN \
    test_state_t g_test; \
    int main(void) { \
        return g_test.failed == 0 ? 0 : 1; \
    }

#endif
```

Usage:

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

TEST(vec_push_increments_len) {
    vec_int_t v;
    vec_init(&v);
    EXPECT(vec_push(&v, 42) == 0);
    EXPECT_EQ(v.len, 1);
    EXPECT_EQ(vec_get(&v, 0), 42);
    vec_free(&v);
}

TEST_MAIN;
```

The trick is `__attribute__((constructor))` — every `TEST(...)` registers a function that runs before `main()`. Tests execute in declaration order, print pass/fail per test, and `main()` just returns the aggregate result. No test framework dependencies, no command-line parsing, no JUnit XML, no surprises. Three hundred lines of harness become twenty.

> :angrygoose: This harness has no test isolation. A test that corrupts global state will affect subsequent tests in the same binary. That's a deliberate trade-off — splitting each test into a subprocess is the right answer for production code but is overkill for a teaching harness. The safety belt: one test binary per source file, so a misbehaving test only contaminates its own file.

> :sarcasticgoose: "Why not use Unity / Check / cmocka / Catch2 / GoogleTest?" Because the entire point of this book is showing the cost of every line. A 4 KB harness whose source you can read in two minutes lets you stop trusting and start *seeing*. The day you outgrow it, switch to whichever production harness fits.

## A Tiny Benchmark Harness

`include/bench.h`. Uses `clock_gettime(CLOCK_MONOTONIC)` for wall-clock timing.

```c
// include/bench.h — minimal benchmark harness.
#ifndef ALGO_BENCH_H
#define ALGO_BENCH_H

#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

static inline uint64_t bench_now_ns(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (uint64_t)ts.tv_sec * 1000000000ull + (uint64_t)ts.tv_nsec;
}

// Defeat the optimizer's right to delete loop bodies.
#define BENCH_DO_NOT_OPTIMIZE(x) __asm__ volatile("" : : "g"(x) : "memory")

typedef struct bench_state {
    const char *name;
    uint64_t start_ns;
    int iters;
    int target_iters;
} bench_state_t;

#define BENCH(name) \
    static void bench_##name(bench_state_t *_b); \
    int main(void) { \
        bench_state_t b = { .name = #name, .target_iters = 1 }; \
        /* Auto-tune iterations to reach ~100ms. */ \
        for (;;) { \
            b.iters = 0; \
            b.start_ns = bench_now_ns(); \
            bench_##name(&b); \
            uint64_t elapsed = bench_now_ns() - b.start_ns; \
            if (elapsed >= 100000000ull || b.target_iters >= 1000000000) { \
                double ns_per_op = (double)elapsed / (double)b.iters; \
                printf("%-40s %10d iters %12.2f ns/op\n", \
                       b.name, b.iters, ns_per_op); \
                return 0; \
            } \
            b.target_iters *= 10; \
        } \
    } \
    static void bench_##name(bench_state_t *_b)

#define BENCH_LOOP \
    for (_b->iters = 0; _b->iters < _b->target_iters; ++_b->iters)

#endif
```

Usage:

```c
// bench/bench_vec.c
#include "algo/vec.h"
#include "bench.h"

BENCH(vec_push_int) {
    vec_int_t v;
    vec_init(&v);
    BENCH_LOOP {
        vec_push(&v, 42);
    }
    BENCH_DO_NOT_OPTIMIZE(v.data);
    vec_free(&v);
}
```

Output:

```text
== build/bench_bench_vec ==
vec_push_int                              16777216 iters         5.97 ns/op
```

What it does:

1. The harness runs the bench function with $1$ iteration, then $10$, then $100$, doubling target until the elapsed time exceeds $100$ ms.
2. It then prints iterations and ns-per-op.
3. `BENCH_DO_NOT_OPTIMIZE` is the inline-assembly trick that prevents the optimizer from deleting the loop body or the data structure. Without it, an empty loop body compiles to nothing, and you measure `0 ns/op`.

> :nerdygoose: Real benchmark suites do more: they warm up the cache, run multiple trials, report median + standard deviation, detect outliers, and account for CPU frequency scaling. Google Benchmark and Criterion are excellent. For pedagogy, this harness is enough — it tells you correct order-of-magnitude numbers and reveals the shape of complexity curves.

> :angrygoose: A few rules to make the numbers meaningful: pin to a single CPU (`taskset -c 0 ./bench_xxx`), disable turbo boost (`echo 0 > /sys/devices/system/cpu/intel_pstate/no_turbo` if it's an Intel chip), and run on AC power. A laptop on battery throttles unpredictably. A laptop with a thermal throttle event mid-run produces nonsense.

## Continuous Integration

A minimal GitHub Actions workflow that runs every push:

```yaml
# .github/workflows/ci.yml
name: ci
on: [push, pull_request]
jobs:
  build:
    strategy:
      matrix:
        cc: [gcc-14, clang-18]
        mode: [debug, release]
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get update && sudo apt-get install -y ${{ matrix.cc }}
      - run: make CC=${{ matrix.cc }} MODE=${{ matrix.mode }} test
```

The matrix runs four jobs: `gcc-14 + debug`, `gcc-14 + release`, `clang-18 + debug`, `clang-18 + release`. Debug mode catches sanitizer-detectable bugs; release mode catches anything that depends on optimization. Two compilers catch anything that's compiler-specific — particularly C23 features where GCC and Clang disagree.

> :happygoose: Once this workflow is green, you can refactor without fear. The test harness verifies behavior; the matrix verifies portability; the sanitizers catch lifetime bugs. The cost is twenty seconds per push; the benefit is being able to ship.

## A Smoke Test

End-to-end check that the environment works. Save as `test/test_smoke.c`:

```c
#include "test.h"

TEST(smoke_arithmetic) {
    EXPECT_EQ(2 + 2, 4);
}

TEST(smoke_pointer) {
    int x = 7;
    int *p = &x;
    EXPECT_EQ(*p, 7);
    *p = 8;
    EXPECT_EQ(x, 8);
}

TEST_MAIN;
```

```sh
$ make test
== build/test_test_smoke ==
  [test] smoke_arithmetic                         ok
  [test] smoke_pointer                            ok
```

If both tests pass, you're set up. Move on.

## What's Next

Chapter 4 builds the first real data structure — a dynamic array — and uses the harness from this chapter to prove the amortized $\Theta(1)$ push claim by measurement. We will write the structure, the operations, the tests, and the benchmarks, and we will compare three growth strategies (`+k`, `*2`, `*φ`) head-to-head.
