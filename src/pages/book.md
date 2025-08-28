---
title: C++ Algorithms & Data Structures (Draft)
slug: /book
---

# C++ Algorithms & Data Structures (Working Draft)

> Living manuscript. Expect rough edges, TODOs, and iterative refinement. Feedback welcome via GitHub issues or X @techno_goose.

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
