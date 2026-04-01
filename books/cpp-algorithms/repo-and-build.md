---
sidebar_position: 2
sidebar_label: "Repository & Build"
title: "Repository Separation & Source Layout"
---

# Repository Separation & Source Layout

The actual C++ source code for the algorithms & data structures (modules, tests, examples) lives in a **separate repository** (planned: `https://github.com/westerngazoo/algorithms` / `goose-lib`). This page documents design, structure, and how to build/run/test it—while the site itself only hosts the manuscript.

## High-Level Layout (external repo)

External repository (source code): **Algorithms Library** → [https://github.com/westerngazoo/algorithms](https://github.com/westerngazoo/algorithms)
```
algorithms/
	CMakeLists.txt              # Root: project, options, add_subdirectory(goose-lib)
	goose-lib/
		CMakeLists.txt            # Library target, modules, test + example registration
		include/goose/algorithm/
			sort.cppm               # Primary module interface (exports bubble_sort, re-exports helpers)
			factorial.cppm          # Example secondary module (exported from primary or standalone)
		tests/
			test_sort.cpp           # Basic sorting unit tests
			test_sort_generic.cpp   # Generic iterator/comparator coverage
		examples/
			sort_demo.cpp           # Demonstrates sorting APIs
			example_usage.cpp       # Misc usage showcase
		benchmarks/              # Micro-benchmarks (Google Benchmark)
			CMakeLists.txt          # Adds benchmark targets (enabled via option)
			bench_sort.cpp             # Sample benchmark (sorting)
		build/                    # (Out-of-source preferred; not committed)
```

## Build Toolchain
- **CMake ≥ 3.28** (for C++20 modules support improvements)
- **Ninja** (recommended) or Makefiles
- **Compilers:** Clang 17+ or GCC 13+ (module maturity); MSVC recent if needed
- **Testing:** GoogleTest (fetched via CMake `FetchContent` inside `goose-lib`)

## Configure & Build (clean out-of-source)
```bash
cd algorithms
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo
cmake --build build -j
```

## Run Tests
```bash
cd build
ctest --output-on-failure
```

## Examples
Built example binaries appear under `build/goose-lib/examples/` (or `build/goose-lib/examples/` depending on generator). Run:
```bash
./build/goose-lib/examples/sort_demo
```

## Developer Workflow
1. Edit module interface unit (e.g. `sort.cppm`).
2. Rebuild incrementally: `cmake --build build -t goose`.
3. Run focused test: `ctest -R sort_generic -V`.
4. Benchmark (future): dedicated `bench/` directory with Google Benchmark.

## Naming & Module Strategy
- One primary umbrella interface per thematic area (e.g. `sort.cppm`).
- Small focused implementation partitions (if needed) kept private unless exported.
- Public API surface kept minimal; internal helpers stay non-exported to reduce BMI churn.

## Compiler Flags (draft recommendation)
```cmake
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
add_compile_options(
	-Wall -Wextra -Wpedantic -Wconversion -Wshadow -Werror
	-ftime-trace
)
```
(Adjust `-Werror` locally; may relax in CI.)

## Sanitizers Quick Switch
```bash
cmake -S . -B build-asan -G Ninja -DCMAKE_BUILD_TYPE=Debug -DENABLE_ASAN=ON
```
(CMake option would append `-fsanitize=address,undefined` to targets.)

## Benchmarks
Benchmarks are opt-in so regular library builds stay lean. Enable with a CMake cache option:

```bash
# From repository root containing goose-lib/
cd goose-lib
cmake -S . -B build -G Ninja -DGOOSE_BUILD_BENCHMARKS=ON -DCMAKE_BUILD_TYPE=Release
cmake --build build --target run_benchmarks -j
./build/benchmarks/run_benchmarks
```

Notes:
- Uses Google Benchmark (fetched similarly to tests) – stable micro-bench environment.
- Always build benchmarks with `Release` (or `RelWithDebInfo`) + disable sanitizers for fair timings.
- For noisy environments, run multiple repetitions: `--benchmark_repetitions=10 --benchmark_report_aggregates_only=true`.
- Future: add JSON output (`--benchmark_format=json`) + script to compare CI runs.

---

## Source Repository

Explore the full source code, modules, and examples in the dedicated repository:

[github.com/westerngazoo/algorithms](https://github.com/westerngazoo/algorithms)
