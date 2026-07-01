---
sidebar_position: 1
sidebar_label: "Definitions & Representations"
title: "Graph Definitions and Representations"
---

# Graph Definitions and Representations

A graph is the universal model for "things and the relationships between them." Networks, dependencies, maps, state machines, social ties — all are graphs. This chapter fixes vocabulary and the data structures that make graph algorithms run.

## Definition

A **graph** $G = (V, E)$ consists of a set of **vertices** (nodes) $V$ and a set of **edges** $E$. An edge joins two vertices.

- **Undirected graph**: edges are unordered pairs $\{u, v\}$.
- **Directed graph (digraph)**: edges are ordered pairs $(u, v)$ — an arrow from $u$ to $v$.
- **Weighted graph**: each edge carries a number $w(u,v)$ (distance, cost, capacity).
- **Simple graph**: no self-loops and no repeated edges. A **multigraph** allows both.

We write $n = |V|$ and $m = |E|$.

> :mathgoose: Almost every "real" problem becomes tractable once you name the vertices and edges correctly. The hard part of applying graph theory is rarely the algorithm — it's the *modeling*: deciding what a vertex is, what an edge means, and whether direction or weight matters.

## Degree and the Handshake Lemma

The **degree** $\deg(v)$ of a vertex is the number of edges incident to it. For directed graphs, split into **in-degree** and **out-degree**.

**Handshake lemma.** Summing degrees double-counts every edge:

```math
\sum_{v \in V} \deg(v) = 2|E|.
```

A corollary: the number of odd-degree vertices is always even.

> :nerdygoose: The handshake lemma is the simplest *double-counting* argument in graph theory — count edge-endpoints two ways. It instantly proves "you can't have exactly one person who shook hands an odd number of times" and underlies the parity conditions for Eulerian trails (every vertex even) to exist.

## Walks, Paths, and Cycles

- A **walk** is a sequence of edges $v_0 \to v_1 \to \cdots \to v_k$ (repeats allowed).
- A **trail** is a walk with no repeated *edge*.
- A **path** is a walk with no repeated *vertex*.
- A **cycle** is a path that returns to its start ($v_0 = v_k$), with $k \ge 3$ in simple graphs.
- A graph with no cycles is **acyclic**; a directed acyclic graph is a **DAG**.

The **distance** $d(u,v)$ is the length (edge count, or weight sum) of a shortest path between $u$ and $v$.

## Special Graph Families

| Family | Description | Edge count |
|---|---|---|
| Complete graph $K_n$ | every pair adjacent | $\binom{n}{2}$ |
| Path $P_n$ | vertices in a line | $n - 1$ |
| Cycle $C_n$ | vertices in a ring | $n$ |
| Tree | connected, acyclic | $n - 1$ |
| Bipartite | vertices 2-colorable | varies |
| Complete bipartite $K_{a,b}$ | every cross pair adjacent | $ab$ |

## Representations

How you store a graph determines which operations are fast.

### Adjacency matrix

An $n \times n$ matrix $A$ with $A_{ij} = 1$ (or the weight) if edge $(i,j)$ exists, else $0$.

```math
A_{ij} =
\begin{cases}
1 & (i,j) \in E \\
0 & \text{otherwise}
\end{cases}
```

- **Space**: $\Theta(n^2)$.
- **Edge lookup**: $O(1)$.
- **Iterate neighbors**: $O(n)$ per vertex.
- Best for **dense** graphs and algorithms that test adjacency a lot.

> :surprisedgoose: The adjacency matrix has a hidden superpower: $(A^k)_{ij}$ counts the number of *walks of length $k$* from $i$ to $j$. Matrix multiplication composes one-step reachability into multi-step reachability. This connects graphs to linear algebra — and lets you count paths or test reachability with matrix exponentiation.

### Adjacency list

For each vertex, a list of its neighbors.

- **Space**: $\Theta(n + m)$.
- **Iterate neighbors**: $O(\deg(v))$ — optimal.
- **Edge lookup**: $O(\deg(v))$.
- Best for **sparse** graphs (most real-world graphs), and the default for BFS/DFS, Dijkstra, etc.

### Edge list

Just a list of $(u, v, w)$ triples. Minimal; convenient for algorithms that scan all edges, like Kruskal's MST and Bellman–Ford.

> :angrygoose: Choosing the wrong representation can turn a fast algorithm slow. Running BFS on an adjacency *matrix* costs $\Theta(n^2)$ even on a sparse graph, versus $\Theta(n+m)$ on an adjacency *list*. For the typical sparse graph ($m \ll n^2$), default to adjacency lists; reach for the matrix only when the graph is dense or you genuinely need $O(1)$ adjacency tests.

## Algorithmic Touchpoints

- **BFS/DFS** traverse adjacency lists in $O(n + m)$ — the foundation of nearly every graph algorithm.
- **Adjacency-matrix powers** count walks and feed into reachability (transitive closure) and triangle counting.
- **Edge lists** drive MST (Kruskal) and negative-weight shortest paths (Bellman–Ford).
- **Modeling**: states→vertices, transitions→edges turns puzzles and games into shortest-path/reachability problems.

## Quick Sanity Checks

- Degrees sum to $2m$ (undirected); if your sum is odd, you miscounted an edge.
- A simple graph on $n$ vertices has at most $\binom{n}{2}$ edges.
- A tree on $n$ vertices has exactly $n - 1$ edges — fewer means disconnected, more means a cycle.
- Pick the representation to match the operation: adjacency *list* for sparse traversal, *matrix* for dense/adjacency tests.
