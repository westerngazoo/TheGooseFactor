---
title: C++ Algorithms & Data Structures (Draft)
slug: /book
---

# C++ Algorithms & Data Structures (Working Draft)

> Living manuscript. Expect rough edges, TODOs, and iterative refinement. Feedback welcome via GitHub issues or X @techno_goose.

## Repository Separation & Source Layout

The actual C++ source code for the algorithms & data structures (modules, tests, examples) lives in a **separate repository** (planned: `https://github.com/westerngazoo/algorithms` / `goose-lib`). This page documents design, structure, and how to build/run/test it—while the site itself only hosts the manuscript.

### High‑Level Layout (external repo)
```
algorithms/
	CMakeLists.txt              # Root: project, options, add_subdirectory(goose-lib)
	goose-lib/
		CMakeLists.txt            # Library target, modules, test + example registration
		include/goose/algorithm/
			sort.cppm               # Primary module interface (exports bubble_sort, re‑exports helpers)
			factorial.cppm          # Example secondary module (exported from primary or standalone)
		tests/
			test_sort.cpp           # Basic sorting unit tests
			test_sort_generic.cpp   # Generic iterator/comparator coverage
		examples/
			sort_demo.cpp           # Demonstrates sorting APIs
			example_usage.cpp       # Misc usage showcase
		build/                    # (Out-of-source preferred; not committed)
```

### Build Toolchain
- **CMake ≥ 3.28** (for C++20 modules support improvements)
- **Ninja** (recommended) or Makefiles
- **Compilers:** Clang 17+ or GCC 13+ (module maturity); MSVC recent if needed
- **Testing:** GoogleTest (fetched via CMake `FetchContent` inside `goose-lib`)

### Configure & Build (clean out-of-source)
```bash
cd algorithms
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo
cmake --build build -j
```

### Run Tests
```bash
cd build
ctest --output-on-failure
```

### Examples
Built example binaries appear under `build/goose-lib/examples/` (or `build/goose-lib/examples/` depending on generator). Run:
```bash
./build/goose-lib/examples/sort_demo
```

### Developer Workflow
1. Edit module interface unit (e.g. `sort.cppm`).
2. Rebuild incrementally: `cmake --build build -t goose`.
3. Run focused test: `ctest -R sort_generic -V`.
4. Benchmark (future): dedicated `bench/` directory with Google Benchmark.

### Naming & Module Strategy
- One primary umbrella interface per thematic area (e.g. `sort.cppm`).
- Small focused implementation partitions (if needed) kept private unless exported.
- Public API surface kept minimal; internal helpers stay non-exported to reduce BMI churn.

### Compiler Flags (draft recommendation)
```cmake
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
add_compile_options(
	-Wall -Wextra -Wpedantic -Wconversion -Wshadow -Werror
	-ftime-trace
)
```
(Adjust `-Werror` locally; may relax in CI.)

### Sanitizers Quick Switch
```bash
cmake -S . -B build-asan -G Ninja -DCMAKE_BUILD_TYPE=Debug -DENABLE_ASAN=ON
```
(CMake option would append `-fsanitize=address,undefined` to targets.)

---

### Source repo

The source repo can be found here:

https://github.com/westerngazoo/algorithms

## Purpose

Build an opinionated, modern C++ (C++20/23 leaning) guide to core data structures and algorithms with:

- Implementation patterns (value semantics first, RAII, strong types)
- Complexity intuition & cache-aware notes
- Benchmarks + micro-optimization flags (only when it matters)
- Trade‑offs & “when NOT to use this” sections
- Testing + fuzzing angles

## Philosophy

1. Clarity over premature cleverness.
2. Measure before optimizing.
3. Prefer invariants + assertions early.
4. Favor composition & iterators over inheritance.
5. Expose minimal clean interfaces; hide mutation guts.

## Draft Table of Contents

### Part I · Origins & Core Foundations
1. From C Roots to C++: A Brief History (procedural DNA, memory model basics)
2. Modern C++ Evolution (C++11→23 feature map & why it matters)
3. Tooling & Environment (compilers, sanitizers, benchmark harness)
4. Value Types, Move Semantics, and Resource Management
5. Iterators, Ranges, and Views
6. Complexity, Big‑O Pragmatism, and Cache Hierarchy Basics
7. Sorting First: Why Order Matters (comparison vs distribution; intro sort anatomy)

### Part II · Core Data Structures (Begins With Sorting Context)
8. Arrays, Spans, and Small Buffer Optimization
9. Dynamic Arrays & Growth Strategies (vector, deque, small_vector)
10. Linked Lists (intrusive vs owning, when they’re traps)
11. Stacks & Queues (ring buffers, lock-free basics)
12. Hash Tables (open addressing, robin hood, SwissTable intuition)
13. Trees (BST, AVL, Red‑Black, B‑Tree, adaptive strategies)
14. Heaps & Priority Queues (binary, d‑ary, pairing, Fibonacci myth)
15. Disjoint Set (Union-Find with heuristics)
16. Tries & Radix Structures
17. Graph Representations (adjacency list/matrix, CSR)

### Part III · Algorithms (Beyond Sorting)
18. Searching (binary search variants, exponential, interpolation)
19. Graph Algorithms (DFS/BFS variants, Dijkstra, A*, topological sort)
20. Minimum Spanning Trees (Kruskal, Prim, Borůvka trade‑offs)
21. Shortest Paths & Flow (Bellman-Ford, SPFA cautions, Dinic, Edmonds‑Karp)
22. String Algorithms (Z, KMP, suffix arrays, suffix automaton)
23. Dynamic Programming Patterns (rolling buffers, bitsets, meet‑in‑middle)
24. Geometry Essentials (orientation tests, sweep line basics)

### Part IV · Performance & Reliability
25. Benchmarking (Google Benchmark, pitfalls, noise reduction)
26. Profiling & Micro-Architecture (perf, cachegrind, branch prediction)
27. Concurrency Primitives (atomics, memory order, lock-free hazards)
28. Parallel Algorithms (std::execution, transforms, partitioning)
29. Error Handling Strategies (status codes, exceptions, `expected<T>`) 
30. Testing & Fuzzing (GTest, property tests, sanitizers, libFuzzer)

### Part V · Patterns & Case Studies
31. Building a Generic Graph Toolkit
32. Designing a Custom Allocator (arena, pool, monotonic)
33. High-Performance LRU / LFU Cache
34. Text Indexing Mini-Engine
35. Pathfinding Engine (grid + navigation mesh hybrid)

### Appendices
A. C++ Standard Library Quick Reference
B. Compiler Flags Cheat Sheet (GCC/Clang/MSVC)
C. Toolchain Setup Scripts
D. Further Reading & Papers

---

## Progress Legend

Status markers will appear inline: `[ ] planned` · `[~] drafting` · `[✓] reviewed` · `[⚡] optimize`

## Current Focus

Working on: Ch 1–2 historical context drafts + Sorting-first narrative justification (Ch 7) + benchmark harness skeleton.

Next up: Value semantics examples (copy elision, NRVO visuals) and iterator/ranges canonical patterns.

## Contributing / Feedback

Open an issue with: chapter number, concern, suggestion. Example: `Issue: Ch 9 - collision strategy alternative (cuckoo)`. PRs welcome once skeleton stabilizes.

---

> This page will grow; sections may reshuffle. Track diffs via repo history.
