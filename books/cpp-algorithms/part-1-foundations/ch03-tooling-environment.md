---
sidebar_position: 3
sidebar_label: "Ch 3: Tooling & Environment"
title: "Chapter 3: Tooling & Environment"
---

# Chapter 3: Tooling & Environment

Before writing algorithms, set up the toolchain that catches bugs before they reach production. This chapter covers compilers, build systems, sanitizers, and the benchmark harness we use throughout the book.

> :nerdygoose: A good toolchain is a force multiplier. The difference between "works on my machine" and "correct on all machines" is usually three compiler flags and a sanitizer. Set them up once, benefit forever.

## Compilers

### GCC

```bash
# Install (Ubuntu/Debian)
sudo apt install g++-14

# Compile C++23
g++-14 -std=c++23 -O2 -Wall -Wextra -Wpedantic -o program program.cpp

# Compile C11
gcc-14 -std=c11 -O2 -Wall -Wextra -Wpedantic -o program program.c
```

### Clang

```bash
# Install
sudo apt install clang-18 libc++-18-dev

# Compile C++23 (with libc++)
clang++-18 -std=c++23 -stdlib=libc++ -O2 -Wall -Wextra -o program program.cpp

# Compile C11
clang-18 -std=c11 -O2 -Wall -Wextra -o program program.c
```

### Which to Use

Use **both**. Compile your code with GCC and Clang regularly. They have different warning sets and different optimizer behaviors. Code that compiles cleanly on both is more likely to be correct and portable.

> :angrygoose: "It compiles" is not "it's correct." GCC and Clang accept slightly different subsets of C++. Code that compiles on one but not the other often has a subtle bug — relying on unspecified behavior, missing `typename`, or depending on header inclusion order. Compile with both. Always.

## Warning Flags

These should be on for every build:

```bash
-Wall -Wextra -Wpedantic -Wconversion -Wshadow -Wnon-virtual-dtor
```

| Flag | What it catches |
|---|---|
| `-Wall` | Common warnings (unused variables, missing returns, etc.) |
| `-Wextra` | Additional warnings `-Wall` misses |
| `-Wpedantic` | Strict ISO compliance |
| `-Wconversion` | Implicit narrowing conversions (`int` → `short`, signed → unsigned) |
| `-Wshadow` | Variable shadowing (inner scope hides outer) |
| `-Wnon-virtual-dtor` | Base class with virtual functions but non-virtual destructor |
| `-Werror` | Treat warnings as errors (use in CI, optional locally) |

**For C code, add:**

```bash
-Wmissing-prototypes -Wstrict-prototypes -Wold-style-definition
```

> :happygoose: `-Wconversion` is the most important flag nobody enables. It catches `size_t` to `int` truncation, signed/unsigned mismatches, and floating-point narrowing — all of which are silent bugs that `std::sort` comparators love to hide. Enable it. Fix the warnings. Your code will be better.

## Build System: CMake

Our [algorithms repository](https://github.com/westerngazoo/algorithms) uses CMake. Here's the minimal structure:

```cmake
# CMakeLists.txt (root)
cmake_minimum_required(VERSION 3.28)
project(algorithms LANGUAGES CXX C)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_C_STANDARD 17)
set(CMAKE_C_STANDARD_REQUIRED ON)

add_compile_options(
    -Wall -Wextra -Wpedantic -Wconversion -Wshadow -Werror
)

add_subdirectory(goose-lib)
```

### Build Commands

```bash
# Configure (one-time)
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo

# Build
cmake --build build -j$(nproc)

# Build a specific target
cmake --build build --target goose -j

# Clean rebuild
cmake --build build --target clean && cmake --build build -j
```

### Build Types

| Type | Flags | Use case |
|---|---|---|
| `Debug` | `-O0 -g` | Debugging, sanitizers |
| `Release` | `-O3 -DNDEBUG` | Benchmarks, production |
| `RelWithDebInfo` | `-O2 -g` | Daily development |
| `MinSizeRel` | `-Os -DNDEBUG` | Embedded targets |

> :nerdygoose: Always benchmark with `Release` or `RelWithDebInfo`. Debug builds disable inlining and optimizations, which completely changes performance characteristics. A `std::vector::push_back` that's one instruction in Release can be a function call in Debug. Your benchmarks are meaningless without optimization.

## Sanitizers

Sanitizers are runtime instrumentation that catches bugs your compiler can't warn about. They are non-negotiable for algorithm development.

### AddressSanitizer (ASan)

Catches: buffer overflows, use-after-free, double-free, stack overflow.

```bash
# Compile with ASan
g++ -std=c++23 -fsanitize=address -fno-omit-frame-pointer -g -o program program.cpp

# CMake
cmake -S . -B build-asan -DCMAKE_BUILD_TYPE=Debug \
    -DCMAKE_CXX_FLAGS="-fsanitize=address -fno-omit-frame-pointer"
```

**Example — ASan catches a heap buffer overflow:**

```cpp
int main() {
    int* p = new int[10];
    p[10] = 42;  // One past the end
    delete[] p;
}
```

```
ERROR: AddressSanitizer: heap-buffer-overflow on address 0x...
WRITE of size 4 at 0x... thread T0
    #0 main program.cpp:3
```

> :angrygoose: "But my tests pass without ASan." Of course they do. Undefined behavior means anything can happen, including "appears to work." ASan turns silent corruption into immediate crashes with stack traces. Run your tests under ASan in CI. Always. A clean ASan run is worth more than 100 manual code reviews.

### UndefinedBehaviorSanitizer (UBSan)

Catches: signed integer overflow, null pointer dereference, misaligned access, shift out of bounds.

```bash
g++ -std=c++23 -fsanitize=undefined -g -o program program.cpp
```

**Example — UBSan catches signed overflow:**

```cpp
int main() {
    int x = INT_MAX;
    x += 1;  // Signed overflow: undefined behavior
}
```

```
runtime error: signed integer overflow: 2147483647 + 1
```

### MemorySanitizer (MSan) — Clang only

Catches: use of uninitialized memory.

```bash
clang++ -std=c++23 -fsanitize=memory -fno-omit-frame-pointer -g -o program program.cpp
```

### ThreadSanitizer (TSan)

Catches: data races in multithreaded code.

```bash
g++ -std=c++23 -fsanitize=thread -g -o program program.cpp
```

### Combined Usage

ASan and UBSan can run together. TSan and MSan must run separately (they conflict with ASan).

```bash
# Best default for testing
g++ -std=c++23 -fsanitize=address,undefined -fno-omit-frame-pointer -g program.cpp
```

**For C code, same flags work:**

```bash
gcc -std=c17 -fsanitize=address,undefined -fno-omit-frame-pointer -g program.c
```

## Testing: GoogleTest

Our test setup uses GoogleTest, fetched via CMake:

```cmake
# goose-lib/tests/CMakeLists.txt
include(FetchContent)
FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG v1.15.2
)
FetchContent_MakeAvailable(googletest)

add_executable(run_tests
    test_sort.cpp
    test_sort_generic.cpp
)
target_link_libraries(run_tests PRIVATE GTest::gtest_main goose)
```

### Writing Tests

```cpp
#include <gtest/gtest.h>
#include <vector>
#include <algorithm>

// Test a specific case
TEST(BubbleSort, AlreadySorted) {
    std::vector<int> v = {1, 2, 3, 4, 5};
    bubble_sort(v.begin(), v.end());
    EXPECT_TRUE(std::is_sorted(v.begin(), v.end()));
}

// Test edge cases
TEST(BubbleSort, Empty) {
    std::vector<int> v;
    bubble_sort(v.begin(), v.end());  // Should not crash
    EXPECT_TRUE(v.empty());
}

TEST(BubbleSort, SingleElement) {
    std::vector<int> v = {42};
    bubble_sort(v.begin(), v.end());
    EXPECT_EQ(v[0], 42);
}

// Test with C array equivalent
TEST(BubbleSortC, BasicArray) {
    int arr[] = {5, 3, 1, 4, 2};
    bubble_sort_c(arr, 5, sizeof(int), int_compare);
    for (int i = 0; i < 4; i++) {
        EXPECT_LE(arr[i], arr[i + 1]);
    }
}
```

### Running Tests

```bash
# All tests
cd build && ctest --output-on-failure

# Specific test
ctest -R BubbleSort -V

# With sanitizers (if built with them)
cd build-asan && ctest --output-on-failure
```

> :sarcasticgoose: "I'll add tests later." No you won't. Write the test before the implementation or immediately after. Every algorithm in this book ships with: (1) sorted input, (2) reverse-sorted input, (3) empty input, (4) single element, (5) all-equal elements, (6) random input. That's the minimum. Anything less is not tested.

## Benchmarking: Google Benchmark

### Setup

```cmake
# goose-lib/benchmarks/CMakeLists.txt
FetchContent_Declare(
    benchmark
    GIT_REPOSITORY https://github.com/google/benchmark.git
    GIT_TAG v1.9.1
)
set(BENCHMARK_ENABLE_TESTING OFF)
FetchContent_MakeAvailable(benchmark)

add_executable(run_benchmarks bench_sort.cpp)
target_link_libraries(run_benchmarks PRIVATE benchmark::benchmark goose)
```

### Writing Benchmarks

```cpp
#include <benchmark/benchmark.h>
#include <vector>
#include <algorithm>
#include <random>

static void BM_BubbleSort_Random(benchmark::State& state) {
    const auto n = state.range(0);
    std::mt19937 rng(42);  // Fixed seed for reproducibility

    for (auto _ : state) {
        state.PauseTiming();
        std::vector<int> v(n);
        std::generate(v.begin(), v.end(), [&]{ return rng() % 10000; });
        state.ResumeTiming();

        bubble_sort(v.begin(), v.end());
        benchmark::DoNotOptimize(v.data());
    }
    state.SetItemsProcessed(state.iterations() * n);
    state.SetComplexityN(n);
}
BENCHMARK(BM_BubbleSort_Random)
    ->RangeMultiplier(2)
    ->Range(64, 8192)
    ->Complexity(benchmark::oNSquared);

static void BM_StdSort_Random(benchmark::State& state) {
    const auto n = state.range(0);
    std::mt19937 rng(42);

    for (auto _ : state) {
        state.PauseTiming();
        std::vector<int> v(n);
        std::generate(v.begin(), v.end(), [&]{ return rng() % 10000; });
        state.ResumeTiming();

        std::sort(v.begin(), v.end());
        benchmark::DoNotOptimize(v.data());
    }
    state.SetItemsProcessed(state.iterations() * n);
    state.SetComplexityN(n);
}
BENCHMARK(BM_StdSort_Random)
    ->RangeMultiplier(2)
    ->Range(64, 8192)
    ->Complexity(benchmark::oNLogN);

BENCHMARK_MAIN();
```

### Running Benchmarks

```bash
# Basic run
./build/benchmarks/run_benchmarks

# With repetitions for statistical significance
./build/benchmarks/run_benchmarks --benchmark_repetitions=5

# Filter specific benchmarks
./build/benchmarks/run_benchmarks --benchmark_filter=BubbleSort

# JSON output for comparison scripts
./build/benchmarks/run_benchmarks --benchmark_format=json > results.json

# Compare two runs
pip install google-benchmark
compare.py benchmarks results_old.json results_new.json
```

> :weightliftinggoose: Benchmarking is like testing a training program: one set doesn't tell you anything. Run multiple repetitions, control the variables (fixed seed, same machine, no background load), and compare against a baseline. A 5% improvement that doesn't reproduce is noise. A 2x improvement that holds across repetitions is real.

### Benchmarking Pitfalls

1. **`DoNotOptimize`**: The compiler will delete your entire benchmark if it detects the result is unused. Always pass your result through `benchmark::DoNotOptimize`.

2. **`PauseTiming`/`ResumeTiming`**: Setup (generating random data) shouldn't be measured. Pause the timer, do setup, resume.

3. **Cache effects**: If you benchmark the same array repeatedly, it'll be hot in cache. Real workloads may have cold caches. Consider flushing between iterations for realistic results.

4. **Branch prediction warm-up**: Modern CPUs learn branch patterns. Your second sort of the same data is faster than the first because the branch predictor has been trained. Use different random data each iteration.

> :nerdygoose: Google Benchmark automatically handles iteration count — it runs your code enough times to get stable measurements. Don't set iteration counts manually unless you have a specific reason. The library knows what it's doing.

## Profiling

### `perf` (Linux)

```bash
# Record performance counters
perf stat ./build/benchmarks/run_benchmarks --benchmark_filter=BubbleSort

# Sample-based profiling
perf record -g ./build/benchmarks/run_benchmarks --benchmark_filter=BubbleSort
perf report

# Cache miss analysis
perf stat -e cache-references,cache-misses,instructions,cycles \
    ./build/benchmarks/run_benchmarks --benchmark_filter=BubbleSort
```

### Valgrind / Cachegrind

```bash
# Memory error check
valgrind --tool=memcheck ./build/run_tests

# Cache simulation
valgrind --tool=cachegrind ./build/benchmarks/run_benchmarks --benchmark_filter=BubbleSort
cg_annotate cachegrind.out.* > cache_report.txt
```

### Compiler Explorer (Godbolt)

[godbolt.org](https://godbolt.org) shows you the assembly your compiler generates. Use it to verify:
- Lambdas inline (no `call` instruction)
- Moves compile to register operations (no `memcpy`)
- `constexpr` evaluates at compile time (constant appears in assembly)
- Bounds checks are elided when the compiler can prove safety

> :happygoose: Godbolt is the X-ray machine for C++. If you're arguing about whether a feature is "zero cost," paste both versions into Godbolt and compare the assembly. The answer is always in the machine code, never in the standard document.

## Our Development Workflow

```
┌─────────────────────────────────────────────────┐
│  1. Write/edit algorithm (C++ and C versions)    │
│                                                  │
│  2. Build with warnings                          │
│     cmake --build build -j                       │
│                                                  │
│  3. Run tests                                    │
│     ctest --output-on-failure                    │
│                                                  │
│  4. Run under sanitizers                         │
│     cd build-asan && ctest --output-on-failure   │
│                                                  │
│  5. Benchmark (if performance-relevant change)   │
│     ./build/benchmarks/run_benchmarks            │
│                                                  │
│  6. Check assembly (Godbolt) if uncertain        │
└─────────────────────────────────────────────────┘
```

Steps 1–4 run on every change. Step 5 when you're optimizing. Step 6 when you want to understand what the compiler actually does.

## Quick Reference: Essential Commands

| Task | Command |
|---|---|
| Configure | `cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo` |
| Build | `cmake --build build -j` |
| Test | `cd build && ctest --output-on-failure` |
| ASan build | `cmake -S . -B build-asan -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined -fno-omit-frame-pointer"` |
| Benchmark | `./build/benchmarks/run_benchmarks` |
| Profile | `perf stat ./build/benchmarks/run_benchmarks` |
| Assembly | [godbolt.org](https://godbolt.org) |
