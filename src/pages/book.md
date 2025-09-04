---
title: C++ Algorithms & Data Structures (Draft)
slug: /book
---

# C++ Algorithms & Data Structures (Working Draft)

> Living manuscript. Expect rough edges, TODOs, and iterative refinement. Feedback welcome via GitHub issues or X @techno_goose.

## Repository Separation & Source Layout

The actual C++ source code for the algorithms & data structures (modules, tests, examples) lives in a **separate repository** (planned: `https://github.com/westerngazoo/algorithms` / `goose-lib`). This page documents design, structure, and how to build/run/test it—while the site itself only hosts the manuscript.

### High‑Level Layout (external repo)

External repository (source code): **Algorithms Library** → [https://github.com/westerngazoo/algorithms](https://github.com/westerngazoo/algorithms)
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
		benchmarks/              # Micro-benchmarks (Google Benchmark)
			CMakeLists.txt          # Adds benchmark targets (enabled via option)
			bench_sort.cpp             # Sample benchmark (sorting)
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

### Running benchmarks


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

### Benchmarks
Benchmarks are opt‑in so regular library builds stay lean. Enable with a CMake cache option:

```bash
# From repository root containing goose-lib/
cd goose-lib
cmake -S . -B build -G Ninja -DGOOSE_BUILD_BENCHMARKS=ON -DCMAKE_BUILD_TYPE=Release
cmake --build build --target run_benchmarks -j
./build/benchmarks/run_benchmarks
```

Notes:
- Uses Google Benchmark (fetched similarly to tests) – stable micro‑bench environment.
- Always build benchmarks with `Release` (or `RelWithDebInfo`) + disable sanitizers for fair timings.
- For noisy environments, run multiple repetitions: `--benchmark_repetitions=10 --benchmark_report_aggregates_only=true`.
- Future: add JSON output (`--benchmark_format=json`) + script to compare CI runs.

---
### Source Repository

Explore the full source code, modules, and examples in the dedicated repository:

[github.com/westerngazoo/algorithms](https://github.com/westerngazoo/algorithms)

## How This Book Will Be Written (Style & Persona System)

To keep dense technical material engaging, multiple **goose personas** will appear as concise margin-style callouts after code blocks or concept explanations. Each persona has a distinct voice and intent:

| Persona | Image | Role / Tone |
|---------|-------|-------------|
| Angry Goose | <img src="/img/angrygoose.png" alt="Angry Goose" style={{width: '100px', height: 'auto'}} /> | Pitfalls, UB, perf traps |
| Nerdy Goose | <img src="/img/nerdygoose.png" alt="Nerdy Goose" style={{width: '100px', height: 'auto'}} /> | Complexity, memory layout, standard refs |
| Sarcastic Goose | <img src="/img/sarcasticgoose.png" alt="Sarcastic Goose" style={{width: '100px', height: 'auto'}} /> | Light snark vs anti‑patterns |
| Happy Goose | <img src="/img/happygoose.png" alt="Happy Goose" style={{width: '100px', height: 'auto'}} /> | Reinforces clarity & clean patterns |
| Math Goose | <img src="/img/mathgoose.png" alt="Math Goose" style={{width: '100px', height: 'auto'}} /> | Formalism, invariants, proofs |
| Sharp Goose | <img src="/img/sharpgoose.png" alt="Sharp Goose" style={{width: '100px', height: 'auto'}} /> | API surface critique, naming |
| Surprised Goose | <img src="/img/surprisedgoose.png" alt="Surprised Goose" style={{width: '100px', height: 'auto'}} /> | Edge cases, unintuitive outcomes |
| Weightlifting Goose | <img src="/img/weightliftingoose.png" alt="Weightlifting Goose" style={{width: '100px', height: 'auto'}} /> | Training analogies ↔ optimization |

### Callout Markup Pattern
Each callout is a blockquote beginning with the tag:

```cpp
auto v = bubble_sort(vec);
```

> :angrygoose: Copy here is O(n). Consider in‑place + return view if large.
>
> :nerdygoose: Stable? Current implementation preserves order; benchmark vs std::stable_sort.

### Code Snippet Conventions
- C++23 unless earlier standard comparison.
- `auto` only when it enhances, not obscures, meaning.
- `constexpr` + `[[nodiscard]]` on pure utilities.
- Complexity comments above functions: `// O(n log n) avg, O(n^2) worst (degenerate pivot)`.
- Ellipses only with explicit `// ... omitted ...` markers.

### Testing Snippets
```cpp
TEST(Sort, BasicAscending) {
	std::vector<int> v{5,4,3,2,1};
	bubble_sort(v);
	EXPECT_TRUE(std::is_sorted(v.begin(), v.end()));
}
```
> :nerdygoose: Property version randomizes size & contents; see property testing chapter.

### Benchmark Snippets (Preview)
```cpp
static void BM_Bubble_Random100(benchmark::State& st) {
	for (auto _ : st) {
		auto v = make_random(100);
		bubble_sort(v);
		benchmark::DoNotOptimize(v);
	}
}
BENCHMARK(BM_Bubble_Random100);
```

### Chapter Completion Checklist
1. Invariants stated
2. Edge cases enumerated
3. Complexity & memory behavior noted
4. ≥1 persona caution or design insight
5. Test snippet includes boundary or randomized strategy

Chapters failing the list remain `[~] drafting`.

---

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

# Part I: Origins & Core Foundations

## Chapter 1: From C Roots to C++: A Brief History

> :nerdygoose: "To understand where we're going, we must first understand where we came from. C++ didn't emerge from a vacuum—it evolved from C's procedural paradigm while solving its fundamental limitations."

### The Procedural Foundation: C's Lasting Legacy

C, born in the early 1970s at Bell Labs, revolutionized programming by introducing structured programming concepts that replaced the chaotic goto-based code of the era. Its core philosophy was simple yet powerful:

**C's Fundamental Principles:**
- **Procedural decomposition**: Break problems into functions that operate on data
- **Manual memory management**: Direct control over allocation and deallocation
- **Pointer arithmetic**: Memory as a linear address space you navigate explicitly
- **Zero-cost abstractions**: What you write is (mostly) what you get

```cpp
// Classic C-style procedural code
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int* data;
    size_t size;
} IntArray;

IntArray* create_array(size_t size) {
    IntArray* arr = malloc(sizeof(IntArray));
    arr->data = malloc(size * sizeof(int));
    arr->size = size;
    return arr;
}

void destroy_array(IntArray* arr) {
    free(arr->data);
    free(arr);
}
```

> :angrygoose: Manual memory management was C's greatest strength and biggest weakness. You got complete control, but with great power came great responsibility (and frequent crashes).

### C's Memory Model: The Foundation

C's memory model is beautifully simple yet deceptively complex:

1. **Stack**: Automatic storage for local variables and function parameters
2. **Heap**: Dynamic allocation via `malloc()`/`free()`
3. **Static/Global**: Program lifetime storage
4. **Pointers**: Your direct line to memory manipulation

```cpp
int stack_var = 42;           // Stack
int* heap_ptr = malloc(100);  // Heap
static int global_var = 0;    // Static

// Pointer arithmetic - C's secret weapon
int arr[10];
int* ptr = arr;
ptr += 5;  // Now points to arr[5]
```

> :mathgoose: C's memory model can be formally described as: Memory = Stack ∪ Heap ∪ Static, with pointers providing a total mapping from the address space to values.

### The Problems C Couldn't Solve

Despite its elegance, C had fundamental limitations that became apparent as software grew in complexity:

**The Data Encapsulation Problem:**
```cpp
// In C, data and operations are separate
typedef struct {
    double x, y;
} Point;

void move_point(Point* p, double dx, double dy) {
    p->x += dx;
    p->y += dy;
}

// Anyone can modify Point directly - no encapsulation!
Point pt = {1.0, 2.0};
pt.x = 999;  // No protection!
```

**The Type Safety Problem:**
```cpp
void* generic_ptr = &some_int;
// Compiler can't prevent this mistake:
double* wrong_type = (double*)generic_ptr;  // Undefined behavior waiting to happen
```

**The Resource Management Problem:**
```cpp
FILE* file = fopen("data.txt", "r");
// What if we return early? What if an exception occurs?
// Manual cleanup required - easy to forget!
fclose(file);
```

> :sharpgoose: C's lack of constructors/destructors meant resource management was manual and error-prone. Every allocation needed a corresponding deallocation, and forgetting either led to leaks or crashes.

### Enter C++: The Evolution Begins

Bjarne Stroustrup, working at Bell Labs in the early 1980s, sought to extend C with object-oriented capabilities while maintaining its performance and low-level access. The key insight: **"C with Classes"** could provide better organization without sacrificing efficiency.

**C++'s Initial Goals:**
- Add object-oriented programming to C
- Maintain backward compatibility with C
- Provide zero-overhead abstractions
- Support generic programming through templates

```cpp
// Early C++: Classes provide encapsulation
class Point {
private:
    double x, y;
public:
    Point(double x, double y) : x(x), y(y) {}
    
    void move(double dx, double dy) {
        x += dx;
        y += dy;
    }
    
    double getX() const { return x; }
    double getY() const { return y; }
};
```

> :happygoose: C++ classes solved the encapsulation problem! Now data and operations could be bundled together, with access controls preventing unauthorized modifications.

### The Memory Model Evolution

C++ inherited C's memory model but added crucial enhancements:

**RAII (Resource Acquisition Is Initialization):**
```cpp
class FileHandle {
private:
    FILE* file;
public:
    FileHandle(const char* filename) {
        file = fopen(filename, "r");
    }
    
    ~FileHandle() {  // Destructor - automatic cleanup!
        if (file) fclose(file);
    }
    
    // No manual cleanup needed!
};

void process_file() {
    FileHandle fh("data.txt");  // Opens file
    // ... use fh ...
} // fh automatically closes file here!
```

> :nerdygoose: RAII transformed resource management from manual to automatic. The destructor guarantee meant resources were cleaned up even if exceptions occurred, eliminating a major source of bugs.

### Templates: Generic Programming Revolution

One of C++'s most powerful additions was templates, enabling compile-time polymorphism:

```cpp
template<typename T>
T max(T a, T b) {
    return (a > b) ? a : b;
}

// Compiler generates specialized versions:
int max_int = max(5, 10);        // max<int>
double max_double = max(3.14, 2.71);  // max<double>
```

> :mathgoose: Templates provide Turing-complete compile-time programming, allowing algorithms to be written once and specialized for any type that supports the required operations.

### The C++ Philosophy Emerges

C++ wasn't just "C with objects"—it developed a unique philosophy:

1. **Zero-overhead principle**: Don't pay for what you don't use
2. **You don't need to use all features**: C++ supports multiple paradigms
3. **Backward compatibility**: Valid C is (mostly) valid C++
4. **Efficiency matters**: Performance is a feature, not a bug

> :sarcasticgoose: "C++ is a multi-paradigm language that doesn't enforce any particular paradigm." This flexibility is both its greatest strength and its most frequent criticism.

### Looking Forward

Understanding C++'s C roots helps explain many of its design decisions:

- **Manual memory management** → RAII for automatic cleanup
- **Pointer arithmetic** → Smart pointers for safety
- **Procedural decomposition** → Object-oriented and generic programming
- **Performance focus** → Zero-overhead abstractions

As we progress through this book, we'll see how these foundational concepts manifest in modern C++ features like move semantics, ranges, and modules.

> :surprisedgoose: Fun fact: C++ was originally called "C with Classes" and was designed to be a superset of C. The name "C++" (increment operator) was suggested by Rick Mascitti in 1983.

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

Status markers will appear inline: `[ ] planned` · `[~] drafting` · `[✓] reviewed` · `[⚡] optimize`

## Current Focus

Working on: Ch 1–2 historical context drafts + Sorting-first narrative justification (Ch 7) + benchmark harness skeleton.

Next up: Value semantics examples (copy elision, NRVO visuals) and iterator/ranges canonical patterns.


## Contributing / Feedback

Open an issue with: chapter number, concern, suggestion. Example: `Issue: Ch 9 - collision strategy alternative (cuckoo)`. PRs welcome once skeleton stabilizes.

---

> This page will grow; sections may reshuffle. Track diffs via repo history.
