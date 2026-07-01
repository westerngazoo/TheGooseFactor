---
sidebar_position: 4
sidebar_label: "Matching & Coloring"
title: "Bipartite Matching and Graph Coloring"
---

# Bipartite Matching and Graph Coloring

Two classic structural problems. **Matching** pairs things up optimally — assignments, schedules, resource allocation. **Coloring** partitions vertices to avoid conflicts — scheduling, register allocation, map coloring. Both come with elegant min-max theorems.

## Matchings

A **matching** $M \subseteq E$ is a set of edges with no shared endpoints — every vertex is in at most one edge of $M$. A vertex in some edge of $M$ is **matched**; otherwise **exposed**.

- A **maximum matching** has the most edges possible.
- A **perfect matching** covers every vertex (so $|M| = n/2$).

A graph is **bipartite** if $V$ splits into two sets $L, R$ with every edge going between them — equivalently, it has no odd cycle, equivalently it is 2-colorable.

## Augmenting Paths

An **alternating path** alternates between edges out of $M$ and edges in $M$. An **augmenting path** is an alternating path whose two endpoints are both exposed.

> :mathgoose: **Berge's theorem**: a matching $M$ is maximum **iff** it admits no augmenting path. To improve a matching, find an augmenting path and "flip" it — every non-matching edge becomes matching and vice versa, raising $|M|$ by exactly one. This single idea drives every matching algorithm.

For **bipartite** graphs, augmenting paths are found by BFS/DFS, giving the Hopcroft–Karp algorithm at $O(m\sqrt n)$. Equivalently, bipartite matching reduces to **max flow**: add a source feeding $L$, a sink drained by $R$, unit capacities; integer max flow = maximum matching (recall the integrality theorem).

## Hall's Marriage Theorem

When does a bipartite graph have a matching saturating all of $L$? Let $N(S)$ denote the set of neighbors of a subset $S \subseteq L$.

> :happygoose: **Hall's theorem**: a matching saturating $L$ exists **iff** for every subset $S \subseteq L$,
> ```math
> |N(S)| \ge |S|.
> ```
> Every group of left-vertices must collectively have at least as many neighbors as members. If some set of $k$ jobs is collectively qualified for only $k-1$ workers, you obviously can't staff them all — Hall says that's the *only* obstruction.

**Example.** Three applicants, three jobs; if two applicants are *both* only qualified for the *same single* job, then $|N(S)| = 1 < 2 = |S|$ — no full assignment, exactly as Hall predicts.

## König's Theorem

A **vertex cover** is a set of vertices touching every edge. In **bipartite** graphs:

> :surprisedgoose: **König's theorem**: in a bipartite graph, the size of a **maximum matching** equals the size of a **minimum vertex cover**.
> ```math
> \max |\text{matching}| = \min |\text{vertex cover}|.
> ```
> A "pairing up" quantity equals a "covering" quantity — another max-min duality, and in fact a special case of max-flow/min-cut. (By König's complement, max independent set $=$ $n -$ max matching in bipartite graphs.)

> :angrygoose: König's equality is **special to bipartite graphs.** In general graphs, minimum vertex cover is NP-hard, while maximum matching stays polynomial (Edmonds' blossom algorithm). Don't assume the matching = cover identity holds for graphs with odd cycles — it doesn't. The bipartite structure is doing real work.

## Graph Coloring

A **proper $k$-coloring** assigns one of $k$ colors to each vertex so that adjacent vertices differ. The **chromatic number** $\chi(G)$ is the fewest colors needed.

```math
\chi(G) = \min\{k : G \text{ has a proper } k\text{-coloring}\}.
```

### Key facts

- $\chi(G) = 1 \iff$ no edges; $\chi(G) = 2 \iff$ $G$ is bipartite (no odd cycle).
- $\chi(G) \ge \omega(G)$, the size of the largest **clique** (a clique needs all-distinct colors).
- $\chi(G) \le \Delta(G) + 1$, where $\Delta$ is the max degree (greedy coloring achieves this).
- **Four color theorem**: every planar graph satisfies $\chi(G) \le 4$.

> :nerdygoose: Greedy coloring — process vertices in some order, give each the smallest color not used by an already-colored neighbor — never needs more than $\Delta + 1$ colors. But the *order matters enormously*: a clever order can hit $\chi(G)$, a bad order can waste colors on a graph that's actually bipartite. Finding the order that achieves $\chi$ is the hard part.

> :angrygoose: Computing $\chi(G)$ exactly is **NP-hard**, and even deciding 3-colorability is NP-complete. The clean bounds above ($\omega \le \chi \le \Delta+1$) are often the best you'll get cheaply. Bipartiteness ($\chi \le 2$) is the one easy case — check it with a 2-coloring BFS.

## Applications of Coloring

- **Register allocation**: variables are vertices, "live at the same time" is an edge, colors are CPU registers.
- **Scheduling**: tasks/exams are vertices, conflicts are edges, colors are time slots.
- **Frequency assignment**: transmitters that interfere get different frequencies (colors).
- **Sudoku** is a graph coloring instance with 9 colors and a fixed constraint graph.

## Algorithmic Touchpoints

- **Assignment problems** (workers↔tasks) are maximum/minimum-weight bipartite matching (Hungarian algorithm for weights).
- **Bipartite matching via max flow** uses the integrality theorem from the previous chapter.
- **2-coloring / bipartiteness testing** is a single BFS that colors layers alternately and checks for conflicts.
- **Conflict-free scheduling and register allocation** are coloring in disguise; in practice solved with heuristics since $\chi$ is hard.

## Quick Sanity Checks

- A matching has no two edges sharing a vertex; a perfect matching needs $n$ even.
- Hall's condition is about *every* subset of $L$; one violating subset kills the full matching.
- In bipartite graphs, max matching = min vertex cover (König) — a fast cross-check on both computations.
- $\chi(G) \le 2 \iff$ no odd cycle; if a BFS 2-coloring finds a conflict, an odd cycle exists.
