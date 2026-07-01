---
sidebar_position: 2
sidebar_label: "Connectivity, Trees & Paths"
title: "Connectivity, Trees, and Shortest Paths"
---

# Connectivity, Trees, and Shortest Paths

Connectivity asks "what can reach what?" Trees are the minimal connected structures, and shortest paths are the most-asked question on weighted graphs. These three ideas are the daily bread of graph algorithms.

## Connectivity

An undirected graph is **connected** if there is a path between every pair of vertices. The maximal connected pieces are its **connected components**.

For directed graphs there are two notions:
- **Strongly connected**: a directed path exists *both* ways between every pair. Maximal such pieces are **strongly connected components (SCCs)**.
- **Weakly connected**: connected when you ignore edge directions.

> :mathgoose: Connectivity is the first question to ask about any graph, and it's answered by a single traversal. One BFS/DFS from a vertex marks its whole component in $O(n+m)$; loop over unvisited vertices to count all components. SCCs need a slightly cleverer two-pass DFS (Kosaraju/Tarjan) but stay linear-time.

### Cut vertices and bridges

A **cut vertex** (articulation point) is one whose removal increases the number of components. A **bridge** is an edge whose removal does so. These are the single points of failure in a network — found in linear time with a DFS that tracks discovery times and low-links.

## Trees

A **tree** is a connected acyclic undirected graph. The following are **equivalent** characterizations of a tree on $n$ vertices:

1. Connected and acyclic.
2. Connected with exactly $n - 1$ edges.
3. Acyclic with exactly $n - 1$ edges.
4. Exactly one (simple) path between every pair of vertices.
5. Connected, but removing any edge disconnects it.
6. Acyclic, but adding any edge creates a cycle.

> :nerdygoose: "Connected + $(n-1)$ edges + acyclic" — any **two** of these three properties force the third. A tree is the *sweet spot*: the fewest edges that keep a graph connected, and the most edges that keep it acyclic. That tension is why $n-1$ shows up everywhere from spanning trees to the recursion structure of divide-and-conquer.

A **forest** is a disjoint union of trees. A **rooted tree** designates a root, giving every other node a parent and inducing the familiar ancestor/descendant/subtree vocabulary.

## Spanning Trees

A **spanning tree** of a connected graph $G$ is a subgraph that is a tree and includes every vertex. It keeps the graph connected with the minimum possible edges ($n-1$).

A **minimum spanning tree (MST)** of a weighted graph minimizes the total edge weight among all spanning trees.

```math
\text{MST} = \arg\min_{T \text{ spanning tree}} \sum_{e \in T} w(e).
```

> :happygoose: Two greedy algorithms find the MST, both justified by the **cut property**: for any partition of the vertices, the cheapest edge crossing it is in some MST.
>
> - **Kruskal**: sort edges, add the cheapest that doesn't form a cycle (Union-Find detects cycles). $O(m \log m)$.
> - **Prim**: grow a tree from a seed, repeatedly adding the cheapest edge leaving it (a priority queue). $O(m \log n)$.

> :surprisedgoose: A connected graph can have an astronomical number of spanning trees — the complete graph $K_n$ has exactly $n^{n-2}$ of them (Cayley's formula), and Kirchhoff's matrix-tree theorem counts them in general as a determinant. Yet finding the *minimum* one is easy and greedy. Counting is hard; optimizing is easy. A recurring theme.

## Shortest Paths (a glimpse)

On a weighted graph, the **shortest path** from $s$ to $t$ minimizes total edge weight. The right algorithm depends on the graph:

| Setting | Algorithm | Complexity |
|---|---|---|
| Unweighted | BFS | $O(n + m)$ |
| Non-negative weights | Dijkstra | $O(m \log n)$ |
| Negative weights (no negative cycle) | Bellman–Ford | $O(nm)$ |
| All pairs | Floyd–Warshall | $O(n^3)$ |
| DAG (any weights) | topological-order DP | $O(n + m)$ |

The optimality of these rests on the **principle of optimality**: a shortest path's sub-paths are themselves shortest. This is the relaxation step $d(v) \leftarrow \min(d(v),\, d(u) + w(u,v))$ repeated until stable.

> :angrygoose: **Dijkstra breaks on negative edge weights.** Its greedy "finalize the closest unfinished vertex" logic assumes adding edges never decreases a distance — false with negatives. If you have negative weights, use Bellman–Ford (and detect negative cycles, where "shortest path" stops being well-defined). Don't patch Dijkstra by adding a constant to every weight; that distorts which path is shortest.

## Algorithmic Touchpoints

- **Union-Find** maintains connected components incrementally and powers Kruskal's MST.
- **Flood fill / connected components** in images and grids is BFS/DFS on an implicit graph.
- **Network reliability**: bridges and cut vertices identify single points of failure.
- **Routing protocols** (OSPF uses Dijkstra; distance-vector uses Bellman–Ford) are shortest paths in production.
- **Clustering**: cutting the largest MST edges yields single-linkage clusters.

## Quick Sanity Checks

- A connected graph on $n$ vertices needs at least $n-1$ edges; a spanning tree has exactly that.
- Number of components = (vertices) − (edges) for a forest; more edges than that implies a cycle.
- Dijkstra requires non-negative weights; verify before using it.
- Shortest-path distances satisfy the triangle inequality $d(s,v) \le d(s,u) + w(u,v)$; a violation means relaxation isn't finished.
