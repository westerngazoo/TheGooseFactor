---
sidebar_position: 2
title: "Partitioning and Sharding"
---

# Partitioning and Sharding

> Splitting the data itself. Replication copies *all* the data to every
> node; **partitioning** (sharding) *divides* the data across nodes, so
> each holds only a slice. This is how you scale **writes** and **total
> data size** beyond one machine's capacity — at the cost of routing,
> rebalancing, and cross-partition operations getting harder.

[Chapter 18](/database/part-6-distributed/replication) scaled reads and
added resilience, but every replica still held the whole dataset and
handled every write. When the data won't fit on one machine, or the write
rate exceeds one node, you must **partition** — split the data so each node
owns a disjoint piece. Partitioning + replication together are how
internet-scale databases are built.

## 1. Why partition

Replication's limits motivate partitioning:

- **Storage**: a dataset bigger than one machine's disk must be split.
- **Write throughput**: one leader caps write rate; partitioning gives
  *each shard its own leader*, so writes scale with the number of shards.
- **Working-set memory**: each node caches only its slice, so the
  aggregate buffer pool ([Chapter 7](/database/part-2-storage-engines/buffer-pool))
  scales too.

Partitioning is about **dividing**; replication is about **copying**. They
compose: you **shard** the data into pieces, then **replicate each shard**
for availability ([§7](#7-partitioning-meets-replication)). Sharding scales
*capacity and writes*; replication scales *reads and resilience*.

## 2. The goal: balanced partitions

A **partition** (shard) holds a subset of rows; each row belongs to exactly
one partition, chosen by a **partition key**. The aim is balance:

- **Even data distribution** — no partition holds vastly more than others
  (no storage skew).
- **Even load** — requests spread across partitions, not piled on one (no
  **hotspot**).

The whole game is choosing a partitioning **strategy** that keeps both
data and load balanced for *your* access pattern. Get it wrong and one
shard becomes a bottleneck while others idle — defeating the point.

## 3. Range partitioning

**Range partitioning** assigns contiguous key ranges to partitions:

```
partition 1: keys  A–H
partition 2: keys  I–P
partition 3: keys  Q–Z
```

- **Pro**: **range queries are efficient** — `keys BETWEEN 'J' AND 'N'`
  hits one partition; data stays sorted, great for scans and ordered
  access.
- **Con**: prone to **hotspots** if access is skewed. A timestamp key
  means *all recent writes* hit the *last* partition (a "hot" shard) while
  older ones idle — the classic time-series anti-pattern.

Range partitioning suits workloads needing range scans, *if* the key
distributes load evenly. It's used by HBase, Bigtable, and range-sharded
systems.

## 4. Hash partitioning

**Hash partitioning** assigns keys to partitions by a hash of the key:

```
partition = hash(key) mod N        (or via consistent hashing, §6)
```

- **Pro**: **even distribution** — a good hash scatters keys uniformly, so
  data and write load spread evenly, killing hotspots from sequential
  keys.
- **Con**: **range queries are destroyed** — adjacent keys land on
  different partitions, so `BETWEEN` must query *all* of them (a "scatter-
  gather").

Hash partitioning is the default for even load (DynamoDB, Cassandra,
sharded SQL). The trade is exactly the inverse of range: great balance,
poor ranges. Some systems offer **composite** schemes (hash the high-order
key, range the low-order) to get both.

> :surprisedgoose: Choosing the **partition key** is one of the highest-
> stakes, hardest-to-undo decisions in a distributed database — and it's
> entirely workload-dependent. The same key that gives perfect balance can
> destroy your most important query. Shard by `user_id` (hash) and
> per-user lookups are one-shard-fast — but "all orders last Tuesday"
> scatters to every shard. Shard by `timestamp` (range) and time-range
> scans fly — but all writes stampede the newest shard. There's no
> universally right key; there's only the right key *for your access
> pattern*, and changing it later means **re-sharding the entire dataset**.
> Distributed-database design lives and dies on this choice.

## 5. The routing problem

Once data is split, a request for `key = 42` must reach the *right*
partition. Something must know the **key → partition → node** mapping.
Three approaches:

- **Routing tier / proxy**: a routing layer knows the mapping and forwards
  each request (e.g. a query router in front of shards).
- **Client-aware**: the client library knows the mapping and connects
  directly to the right node (fewer hops).
- **Any-node forwarding**: contact any node; it forwards to the owner
  (gossip-style, Cassandra).

All need the mapping kept **current** as partitions move (§6) — typically
stored in a coordination service (ZooKeeper, etcd) built on **consensus**
([Chapter 20](/database/part-6-distributed/consensus-and-distributed-transactions)).
Routing is the indirection that lets clients address logical keys while
the physical placement changes underneath.

## 6. Rebalancing

Partitions aren't static: you **add nodes** (growth), **remove nodes**
(failure/scale-down), or a partition gets too big. **Rebalancing** moves
partitions across nodes to restore balance — and the goal is to **move as
little data as possible**.

The naive `hash(key) mod N` is terrible here: changing N (adding a node)
**remaps almost every key**, forcing a near-total reshuffle. The fixes:

- **Consistent hashing**: map keys and nodes onto a hash ring; adding a
  node only moves the keys between it and its neighbor — minimal movement.
- **Fixed number of partitions**: create many more partitions than nodes
  up front (e.g. 1000 partitions on 10 nodes); rebalancing just **reassigns
  whole partitions** to nodes without re-hashing keys (DynamoDB,
  Elasticsearch-style).

Rebalancing must also happen *without downtime* and *without overloading
the network* — done gradually, often in the background. It's a major
source of operational complexity in sharded systems.

## 7. Partitioning meets replication

In practice you **combine** both: partition the data into shards, then
**replicate each shard** for availability
([Chapter 18](/database/part-6-distributed/replication)):

```
shard A: leader on node1, followers on node2, node3
shard B: leader on node2, followers on node3, node1
shard C: leader on node3, followers on node1, node2
```

Now each node is a **leader for some shards and a follower for others** —
spreading both data and write-leadership across the cluster. A node failure
loses one leader per affected shard, and a follower is promoted (per-shard
failover). This shard-and-replicate design (used by MongoDB, Cassandra,
sharded MySQL/Vitess, CockroachDB) gives **all three**: write scaling
(sharding), read scaling + availability (replication). It's the standard
architecture for large distributed databases.

## 8. The hard part: cross-partition operations

Partitioning's painful cost is anything spanning **multiple** partitions:

- **Cross-partition joins**: data to be joined may live on different nodes;
  the join needs network shuffling (expensive) or denormalization to
  co-locate related data on the same shard.
- **Secondary indexes**: an index on a non-partition-key column is either
  **local** (each shard indexes its own data → reads scatter to all
  shards) or **global** (a separate partitioned index → writes touch two
  shards). Both are costly.
- **Distributed transactions**: a transaction touching multiple shards
  needs cross-node atomicity — **two-phase commit** or consensus
  ([Chapter 20](/database/part-6-distributed/consensus-and-distributed-transactions)),
  which is slow and complex.

This is why partition keys are chosen to **keep related data together**
(co-locate a user's data on one shard) — so common operations stay
**single-partition**. The art of sharding is making the frequent queries
hit one shard and accepting that the rare cross-shard ones are expensive.
Single-node databases (Parts I–V) never face this; it's the genuine new
difficulty of going distributed, and it sets up the final chapter on
distributed atomicity and consensus.

> :weightliftinggoose: Partitioning **splits** data across nodes to scale
> **writes and storage** (replication only scaled reads). The key choice is
> the **partition strategy**: **range** (efficient range scans, but
> hotspot-prone) vs **hash** (even load, but range scans scatter) — driven
> entirely by your access pattern, and brutal to change later. You need
> **routing** (key → node) and **rebalancing** (move minimal data —
> consistent hashing or fixed partitions). Combine **sharding +
> replication** for write scaling *and* availability. The lasting pain is
> **cross-partition** joins, indexes, and transactions — so shard to keep
> related data **co-located** and most queries **single-shard**.

## What we covered

- **Partitioning (sharding)** divides data across nodes (each holds a
  slice) to scale **writes** and **storage** — unlike replication, which
  copies all data.
- Each row maps to one partition via a **partition key**; the goal is even
  **data distribution** and even **load** (no hotspots).
- **Range partitioning**: efficient range queries, but **hotspot**-prone
  (e.g. timestamp keys). **Hash partitioning**: even load, but range
  queries **scatter**.
- The **partition key** choice is workload-dependent, high-stakes, and
  hard to change (re-sharding).
- **Routing** maps key → node (proxy, client-aware, or forwarding), kept
  current via a consensus-backed coordinator.
- **Rebalancing** moves partitions when nodes change; minimize movement
  with **consistent hashing** or a **fixed partition count** (not
  `hash mod N`).
- Real systems **combine sharding + replication** (each shard
  leader+followers) for write scaling, read scaling, and availability.
- The hard cost is **cross-partition** joins, **secondary indexes** (local
  vs global), and **distributed transactions** — so co-locate related data
  to keep operations single-shard.

## What's next

[Chapter 20](/database/part-6-distributed/consensus-and-distributed-transactions)
— consensus and distributed transactions. How distributed nodes **agree**
(leader election, replicated logs) via **Raft**, why **two-phase commit**
is both necessary and flawed, the **CAP theorem**, and how systems achieve
distributed atomicity — closing the course.
