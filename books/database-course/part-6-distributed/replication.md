---
sidebar_position: 1
title: "Replication"
---

# Replication

> Keeping copies. **Replication** maintains multiple copies of the data on
> different machines — for **availability** (survive a node failure),
> **read scaling** (serve reads from many replicas), and **durability**
> (the data exists in more than one place). The central tension is
> **consistency vs latency**: how do replicas stay in sync, and what do
> you see if they don't?

Welcome to Part VI. The single-node database is complete — storage,
queries, transactions, recovery. But one machine has limits: it can fail
(availability), and it can be overwhelmed (scale). **Replication** is the
first answer — copies of the data on multiple nodes — and it reintroduces
the WAL ([Chapter 16](/database/part-5-durability/write-ahead-log)) in a
new role: the change stream that keeps copies in sync.

## 1. Why replicate

Three distinct motivations, often pursued together:

- **Availability**: if one node dies, another copy can take over — no
  single point of failure. Essential for systems that must stay up.
- **Read scaling**: reads can be served by *any* replica, so N replicas
  multiply read throughput (great for read-heavy workloads).
- **Durability / disaster recovery**: the data physically exists in
  multiple places, ideally different datacenters — surviving a disk, a
  machine, or a whole region failing.
- **Latency**: put a replica near users (geographically) so reads are
  local and fast.

Replication does *not* by itself help **write** scaling (every copy must
eventually receive every write) — that's **partitioning**'s job
([Chapter 19](/database/part-6-distributed/partitioning)). The two are
combined in real systems.

## 2. Leader-follower replication

The most common scheme is **leader-follower** (a.k.a.
primary-replica, master-slave):

```
         writes
           │
        ┌──▼───┐  replicate the log   ┌────────┐
        │LEADER│ ───────────────────► │FOLLOWER│ ── serves reads
        └──┬───┘ ───────────────────► ┌────────┐
           │                          │FOLLOWER│ ── serves reads
        serves reads & writes         └────────┘
```

- **One leader** accepts all **writes**, applies them, and streams the
  changes to the followers.
- **Followers** apply the stream to stay in sync and serve **read-only**
  queries.
- If the leader fails, a follower is **promoted** (§6).

This keeps writes simple (one authority, so no write conflicts) while
scaling reads across followers. It's the default in PostgreSQL, MySQL,
MongoDB, and most relational systems.

## 3. Replication via the log

How do changes get from leader to follower? Almost universally, by
**shipping the write-ahead log** — the same WAL that powers crash recovery
([Chapter 16](/database/part-5-durability/write-ahead-log)):

```
leader: change → WAL record → (apply locally) → SEND WAL record to followers
follower: receive WAL record → apply it → now has the same change
```

The log is the perfect replication stream because it's already an
**ordered, complete record of every change**
([Chapter 16, §8](/database/part-5-durability/write-ahead-log) — "the log
is the source of truth"). Followers simply replay it, exactly like
recovery's Redo phase ([Chapter 17](/database/part-5-durability/crash-recovery)),
to reach the same state. (Some systems ship logical row-changes or even
statements instead of physical WAL, with trade-offs, but log-based
replication is the dominant idea.) Recovery and replication are the same
mechanism pointed at different targets — disk vs network.

> :nerdygoose: This is the deepest payoff of "the log is the database"
> ([Chapter 16](/database/part-5-durability/write-ahead-log)). A follower
> is just a node that **replays the leader's log** — identical to how a
> recovering node replays its *own* log. Local durability (replay after a
> crash) and replication (replay on another machine) are *one idea* — an
> ordered, append-only change stream — applied to two destinations. Once
> you see the WAL as a stream of changes rather than a recovery detail,
> replication, change-data-capture, and event-sourcing all become "tap the
> log." The same insight underlies Kafka and event-driven architectures.

## 4. Synchronous vs asynchronous

The defining choice: does the leader **wait** for followers before
acknowledging a write?

- **Synchronous**: the leader waits until (at least one) follower has
  durably received the change before confirming the commit. **Pro**: no
  data loss on leader failure (the follower has it). **Con**: write
  latency includes the network round-trip; if the follower is slow or
  down, writes **stall**.
- **Asynchronous**: the leader confirms the commit immediately and streams
  to followers in the background. **Pro**: fast, low-latency writes, robust
  to slow followers. **Con**: if the leader crashes before a change
  reaches the followers, that committed change is **lost**.

Most systems use a pragmatic middle: **semi-synchronous** — wait for *one*
follower (bounding data loss) while others catch up asynchronously. This is
the **consistency vs latency** trade in its rawest form: durability
guarantees cost round-trips.

## 5. Replication lag and its anomalies

Asynchronous replication means followers are **behind** the leader by some
**replication lag** — usually milliseconds, occasionally much more. Reading
from a lagging follower causes user-visible anomalies:

- **Read-your-own-writes violation**: you update your profile (on the
  leader), then read it back (from a lagging follower) and see the *old*
  value — "did my change not save?"
- **Monotonic reads violation**: two reads from different followers go
  *backward in time* (one is more lagged).

Mitigations form a hierarchy of **consistency guarantees** weaker than
strict consistency but useful: **read-your-writes** (route a user's reads
to the leader or a caught-up replica after they write), **monotonic
reads** (pin a user to one replica). These are the practical reality of
**eventual consistency** — replicas *converge* given no new writes, but
*temporarily* disagree.

## 6. Failover and split-brain

When the leader fails, a follower must be **promoted** — **failover**. This
is deceptively hard:

- **Detecting failure**: is the leader truly down, or just slow/network-
  partitioned? Declaring it dead too eagerly causes needless churn; too
  slowly causes downtime.
- **Choosing a new leader**: pick the most up-to-date follower (least lag)
  to minimize data loss.
- **Split-brain**: the nightmare — the old leader isn't actually dead (just
  partitioned), so now **two nodes think they're leader** and both accept
  writes, **diverging** the data. Catastrophic and hard to reconcile.

Avoiding split-brain requires the cluster to **agree** on who the leader is
— which is exactly the **consensus** problem
([Chapter 20](/database/part-6-distributed/consensus-and-distributed-transactions)).
Robust failover is built on consensus protocols precisely to prevent two
leaders. Failover is where naive replication meets the hard distributed-
systems wall.

## 7. Multi-leader and leaderless

Single-leader limits writes to one node and one location. Two alternatives
trade that away:

- **Multi-leader**: several leaders each accept writes (e.g. one per
  datacenter), replicating to each other. Great for multi-region write
  latency and offline operation — but creates **write conflicts** (two
  leaders edit the same row), requiring **conflict resolution** (last-
  write-wins, version vectors, CRDTs, or application logic).
- **Leaderless** (Dynamo-style: Cassandra, Riak): *any* replica accepts
  writes; clients write to several and read from several, using **quorums**
  to ensure overlap. With N replicas, requiring `W + R > N` (write to W,
  read from R) guarantees a read sees the latest write. Conflicts are
  resolved with version metadata.

These maximize availability and write flexibility at the cost of
**consistency complexity** (you must handle conflicts and stale reads).
They're the heart of the "NoSQL" / AP-system world
([Chapter 20](/database/part-6-distributed/consensus-and-distributed-transactions)
covers the CAP framing).

## 8. Replication, summarized

Replication is the first tool for going distributed, and its essence is a
**trade-off triangle** among consistency, availability, and latency:

- **Single-leader** (most common): simple, strongly-consistent writes,
  read scaling — but the leader is a write bottleneck and failover needs
  consensus.
- **Multi-leader / leaderless**: more availability and write flexibility —
  but you inherit conflict resolution and weaker consistency.
- **Sync vs async**: durability guarantees vs write latency.

Crucially, replication **scales reads and adds resilience but not write
capacity** — every replica still holds *all* the data and must apply
*every* write. To scale writes and total data size beyond one machine, you
must **split** the data across nodes: **partitioning**, the next chapter.
Real systems combine partitioning *and* replication — shard the data, then
replicate each shard.

> :weightliftinggoose: Replication = **copies on multiple nodes** for
> availability, read scaling, and durability — almost always by **shipping
> the WAL** (the same replay as crash recovery, aimed at the network). The
> core dial is **synchronous** (no data loss, higher latency) vs
> **asynchronous** (fast, but lag → stale reads and possible loss on
> failover). **Single-leader** is the common, strongly-consistent default;
> **multi-leader/leaderless** buy availability at the cost of **conflict
> resolution**. Two hard parts — **failover** without **split-brain**, and
> agreement in general — push you toward **consensus** (next). And
> remember: replication scales **reads**, not **writes** — that's
> partitioning's job.

## What we covered

- **Replication** keeps copies on multiple nodes for **availability**,
  **read scaling**, **durability**, and **latency** — but **not write
  scaling** (every copy gets every write).
- **Leader-follower**: one leader takes writes and streams them; followers
  apply and serve reads; on failure a follower is promoted.
- Changes propagate by **shipping the WAL** — followers replay it like
  recovery's Redo (the log as change stream).
- **Synchronous** (wait for a follower: no loss, higher latency) vs
  **asynchronous** (fast: risk loss + lag); **semi-sync** is the common
  compromise.
- **Replication lag** causes anomalies (**read-your-writes**, **monotonic
  reads** violations) — addressed by routing/pinning under **eventual
  consistency**.
- **Failover** must detect leader death and promote a replica without
  **split-brain** (two leaders) — which requires **consensus**.
- **Multi-leader** and **leaderless (quorum, `W + R > N`)** maximize
  availability/write flexibility at the cost of **conflict resolution**.
- Replication scales reads and adds resilience; **partitioning** scales
  writes and data size — real systems combine both.

## What's next

[Chapter 19](/database/part-6-distributed/partitioning) — partitioning and
sharding. Splitting the data itself across many machines to scale writes
and storage beyond one node: range vs hash partitioning, routing requests
to the right shard, rebalancing, and the hotspot problem.
