---
sidebar_position: 3
sidebar_label: "Cuts & Max-Flow/Min-Cut"
title: "Cuts, Flows, and the Max-Flow Min-Cut Theorem"
---

# Cuts, Flows, and the Max-Flow Min-Cut Theorem

Network flow is one of the most versatile tools in algorithms: a single framework that solves bipartite matching, scheduling, image segmentation, and connectivity — all by pushing "stuff" through a network. Its centerpiece is a beautiful duality between flows and cuts.

## Flow Networks

A **flow network** is a directed graph $G = (V, E)$ with a **capacity** $c(u,v) \ge 0$ on each edge, a distinguished **source** $s$, and **sink** $t$.

A **flow** $f$ assigns a value $f(u,v)$ to each edge satisfying:

- **Capacity constraint**: $0 \le f(u,v) \le c(u,v)$.
- **Conservation**: for every vertex except $s$ and $t$, flow in equals flow out:

```math
\sum_{u} f(u, v) = \sum_{w} f(v, w) \quad \text{for all } v \neq s, t.
```

The **value** of the flow is the net amount leaving the source:

```math
|f| = \sum_{v} f(s, v) - \sum_{v} f(v, s).
```

The **maximum flow** problem asks for a flow of largest value.

> :mathgoose: Think water in pipes: capacities are pipe widths, conservation says no water is created or destroyed at junctions, and you want to maximize throughput from $s$ to $t$. Every flow application is a clever choice of what "water," "pipes," and "junctions" represent.

## Cuts

An **$s$–$t$ cut** $(S, T)$ partitions $V$ into two sets with $s \in S$ and $t \in T$. Its **capacity** is the total capacity of edges crossing *from $S$ to $T$*:

```math
c(S, T) = \sum_{u \in S,\, v \in T} c(u, v).
```

A cut is a "bottleneck" — sever those edges and no flow can pass from $s$ to $t$.

## The Max-Flow Min-Cut Theorem

> :surprisedgoose: The central result: **the maximum flow value equals the minimum cut capacity.**
> ```math
> \max_{f} |f| = \min_{(S,T)} c(S, T).
> ```
> The most you can push through equals the cheapest way to completely block it. A throughput question (max flow) and a bottleneck question (min cut) have the *same answer* — a perfect primal–dual duality.

**Why it holds.** Any flow's value is bounded above by every cut's capacity (weak duality — flow must cross any cut). The Ford–Fulkerson method achieves equality: when no **augmenting path** remains in the residual graph, the set $S$ of vertices reachable from $s$ forms a cut whose capacity equals the current flow.

## The Residual Graph and Augmenting Paths

Given a flow $f$, the **residual capacity** of an edge is leftover forward capacity plus the ability to *cancel* existing flow backward:

```math
c_f(u,v) = c(u,v) - f(u,v) \quad (\text{forward}), \qquad c_f(v,u) = f(u,v) \quad (\text{backward}).
```

An **augmenting path** is an $s$–$t$ path in the residual graph; pushing flow along it (by its bottleneck residual capacity) increases $|f|$.

> :nerdygoose: The backward (cancellation) edges are the subtle genius of the method. They let the algorithm "change its mind," rerouting previously committed flow. Without them, greedy path-pushing gets stuck in local optima; with them, Ford–Fulkerson is *guaranteed* to reach the true maximum.

### Algorithms

| Algorithm | Path choice | Complexity |
|---|---|---|
| Ford–Fulkerson | any augmenting path | $O(\lvert f\rvert \cdot m)$ (integer capacities) |
| Edmonds–Karp | shortest (BFS) augmenting path | $O(n m^2)$ |
| Dinic | BFS levels + blocking flow | $O(n^2 m)$, $O(m\sqrt n)$ on unit-capacity |

> :angrygoose: Plain Ford–Fulkerson with a *bad* path-selection rule can be slow — and with irrational capacities may not even terminate. Always pick paths sensibly: Edmonds–Karp (BFS shortest paths) or Dinic guarantee polynomial time. "Just pick any path" is fine for intuition, dangerous in code.

## The Integrality Theorem

> :happygoose: If all capacities are integers, there is a **maximum flow that is integer-valued** on every edge. This is what makes flow a combinatorial tool, not just a numerical one — it means a max flow can directly encode discrete decisions like "match person $i$ to job $j$" (flow 1) or "don't" (flow 0). The next chapter cashes this in for bipartite matching.

## Applications

- **Bipartite matching** (next chapter): source → left vertices → right vertices → sink, unit capacities; max flow = max matching.
- **Edge/vertex connectivity** (Menger's theorem): the max number of edge-disjoint $s$–$t$ paths equals the min number of edges whose removal disconnects them — a min cut.
- **Image segmentation**: pixels are vertices, a min cut separates foreground from background.
- **Project selection / closure**: choose a profitable subset respecting prerequisites by solving a min cut.
- **Baseball elimination**, scheduling with constraints, and many "is this feasible?" questions reduce to a flow.

## Algorithmic Touchpoints

- **Menger's theorem** ties connectivity directly to min cuts: $k$ edge-disjoint paths exist iff every cut has capacity $\ge k$.
- **LP duality**: max-flow/min-cut is the textbook combinatorial instance of linear-programming duality.
- **Reductions**: a huge class of problems is "solved" by modeling them as a flow network and calling a max-flow routine.

## Quick Sanity Checks

- A valid flow respects capacity ($0 \le f \le c$) on every edge and conserves flow at every internal vertex.
- $|f| \le c(S,T)$ for *any* cut — if a flow exceeds some cut's capacity, the flow is invalid.
- At optimality, the residual graph has **no** $s$–$t$ path; the reachable set from $s$ is a min cut.
- With integer capacities, the max flow value is an integer; non-integer "max flow" signals a modeling or rounding bug.
