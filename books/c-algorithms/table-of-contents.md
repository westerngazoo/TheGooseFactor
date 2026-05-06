---
sidebar_position: 2
sidebar_label: "Table of Contents"
title: "Draft Table of Contents"
---

# Draft Table of Contents

A living roadmap. Strikethrough = drafted; bold = next on deck; plain =
queued. Knuth-style difficulty markers in parentheses for chapters that
include heavy proofs (★★★ or ★★★★).

## Part I · Foundations

1. Why C? Why now? Why academically?
2. The C abstract machine — memory, sequence points, integer
   promotions, undefined behavior, `volatile`, `restrict`.
3. Asymptotic notation — Θ, Ω, o, ω. The formal definitions, with
   proofs of the master theorem and Akra–Bazzi (★★★).
4. Loop invariants & correctness proofs — Hoare logic at the level
   you'll actually use it.
5. Amortized analysis — aggregate, accounting, potential. With
   worked dynamic-array proof.
6. Lab: building a benchmark + sanitizer harness for the rest of
   the book.

## Part II · Data Structures

7. Arrays, dynamic arrays, and the cache.
8. Linked lists — singly, doubly, circular, intrusive. When NOT to
   use them.
9. Stacks & queues — array-backed, list-backed, lock-free
   single-producer/single-consumer.
10. Hash tables — chaining vs. open addressing; double hashing,
    quadratic probing, Robin Hood hashing.
11. Binary search trees — invariants, rotation primitives.
12. Self-balancing trees — AVL and Red-Black side by side. Proof of
    O(log n) height (★★★).
13. B-trees & external memory — the model, the math, the
    implementation.
14. Heaps — binary, d-ary, pairing. Why Fibonacci heaps are
    asymptotically beautiful and practically irrelevant.
15. Tries & radix trees — including suffix tries.
16. Disjoint set forests — union by rank, path compression, the
    inverse-Ackermann bound (★★★★).
17. Skip lists — the probabilistic alternative to red-black, with a
    full expected-time analysis.

## Part III · Algorithms

18. Sorting — selection, insertion, merge, quick (with median-of-3
    and three-way partition), heap, intro, radix, counting.
19. Searching — binary, exponential, interpolation, ternary; lower
    bounds via decision trees.
20. Graph representations — adjacency list, adjacency matrix, CSR.
21. BFS, DFS, topological sort.
22. Shortest paths — Dijkstra (binary heap & d-ary heap variants),
    Bellman-Ford, Floyd-Warshall, Johnson's.
23. Minimum spanning trees — Kruskal (with DSU), Prim (with heap).
24. Network flow — Ford-Fulkerson, Edmonds-Karp, Dinic, push-relabel.
25. String algorithms — KMP, Z-function, suffix arrays,
    Aho-Corasick.
26. Dynamic programming — patterns, rolling buffers, bitmask DP,
    meet-in-the-middle.
27. Greedy algorithms — when greed is provably optimal (matroids).
28. Divide-and-conquer — beyond merge sort: closest pair, FFT
    intuition.

## Part IV · Numerical & Mathematical

29. Number theory — Euclidean algorithm, modular arithmetic, CRT,
    fast exponentiation, primality (Miller-Rabin).
30. Combinatorics for programmers — binomial coefficients, stars
    and bars, inclusion-exclusion, generating functions in
    miniature.
31. Probability for algorithm design — linearity, indicator
    variables, Markov + Chebyshev + Chernoff.
32. Hashing theory — universal hashing, k-wise independence,
    cuckoo hashing.

## Part V · Practice & Beyond

33. Cache-conscious data structures — cache-oblivious B-trees,
    flat hash maps, AoS vs. SoA.
34. Interview-grade problems — annotated solutions for ~30 of the
    most-asked Amazon/Google C-style coding problems.
35. Building a small algorithms library in C — packaging,
    testing with `cmocka` or `Unity`, fuzzing with libFuzzer.
36. Where to go next — Knuth Volume 4, Sedgewick & Wayne, CLRS
    revisited.

## Appendices

A. C standard library quick reference — the headers you'll
   actually use.
B. Compiler flags & sanitizers cheat sheet (gcc, clang).
C. Knuth Volume cross-reference — every chapter mapped to its
   TAOCP source.
D. Selected exercise solutions.
E. Further reading — papers, textbooks, talks.
