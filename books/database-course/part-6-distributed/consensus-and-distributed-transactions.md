---
sidebar_position: 3
title: "Consensus and Distributed Transactions"
---

# Consensus and Distributed Transactions

> Agreement across machines. When data spans nodes, they must **agree** —
> on who's the leader, on the order of operations, on whether a
> transaction commits. **Consensus** algorithms (Raft, Paxos) make a
> cluster agree despite failures; **two-phase commit** coordinates
> distributed transactions; and the **CAP theorem** bounds what's possible
> when the network splits. This is the hardest, and final, layer.

[Chapters 18–19](/database/part-6-distributed/replication) gave us copies
and shards — but both raised the same unanswered question: how do nodes
**agree**? Who's the leader after a failover (avoiding split-brain)? Did a
multi-shard transaction commit everywhere or nowhere? Answering "get
multiple machines to agree despite failures" is the deepest problem in
distributed systems, and where we close the course.

## 1. Why agreement is hard

In a single machine, "the state" is unambiguous. Across machines connected
by an **unreliable network**, it isn't:

- Messages can be **lost, delayed, reordered, or duplicated**.
- Nodes can **crash** and restart at any time.
- The network can **partition** — split into groups that can't talk.
- You **can't tell** a crashed node from a slow one or a partitioned one
  (no reliable failure detector).

So "just have the nodes vote" is naive — a node might not respond because
it's dead, or just slow, or unreachable, and you can't distinguish. Any
correct agreement protocol must work *despite* all this uncertainty. That
difficulty is why consensus algorithms are famously subtle.

## 2. The consensus problem

**Consensus**: get a set of nodes to **agree on a single value** (or a
sequence of values) such that:

- **Agreement**: all non-faulty nodes decide the *same* value.
- **Validity**: the value was actually proposed by some node.
- **Termination**: non-faulty nodes eventually decide (don't hang forever).

This abstract problem is the foundation for the concrete needs: agreeing on
the **leader**, on the **order of log entries**, on whether a transaction
**commits**. Solve consensus and you can build a reliable replicated state
machine. The classic solutions are **Paxos** (correct, famously hard to
understand) and **Raft** (designed to be understandable — our focus).

## 3. Raft: understandable consensus

**Raft** achieves consensus by electing a leader and replicating a log.
Its two core mechanisms:

**Leader election.** Nodes are *follower*, *candidate*, or *leader*. Time
is divided into **terms**. If a follower hears nothing from a leader within
a timeout, it becomes a candidate and **requests votes**. A candidate
winning a **majority** becomes leader for that term. Majorities are the
key: any two majorities overlap, so **at most one leader per term** can be
elected — this is what *structurally prevents split-brain*
([Chapter 18](/database/part-6-distributed/replication)).

**Log replication.** The leader takes all writes, appends them to its log,
and replicates entries to followers. An entry is **committed** once a
**majority** have stored it; the leader then applies it and tells
followers to apply it. Followers' logs are forced to match the leader's.

```
leader appends entry → sends to followers →
   once a MAJORITY ack → entry is committed → apply to state machine
```

The majority requirement means Raft tolerates **f failures out of 2f+1
nodes** (e.g. survive 1 failure with 3 nodes, 2 with 5) — it keeps working
as long as a majority can communicate.

> :nerdygoose: **Majority quorums** are the elegant core of consensus. Any
> two majorities of a set must share at least one member — so a value
> agreed by one majority can't be contradicted by another, and only one
> leader can win a majority of votes per term. That single overlap property
> delivers both **consistency** (decisions don't conflict) and
> **split-brain prevention** (one leader) — and it's why consensus systems
> use **odd-sized** clusters (3, 5, 7): you want a clear majority, and an
> even size just adds a node without raising fault tolerance. The whole
> edifice of reliable distributed agreement rests on "any two majorities
> intersect."

## 4. Consensus in real databases

Raft/Paxos underpins the reliable parts of modern distributed systems:

- **Coordination services** — **ZooKeeper** (Zab) and **etcd** (Raft)
  provide consensus-as-a-service; other systems use them for leader
  election, configuration, and the partition map
  ([Chapter 19](/database/part-6-distributed/partitioning)).
- **Replicated logs** — a Raft log *is* a replicated WAL
  ([Chapter 16](/database/part-5-durability/write-ahead-log)): the cluster
  agrees on the order of log entries, and each node applies them to reach
  identical state (a **replicated state machine**).
- **Distributed SQL** — CockroachDB, TiDB, YugabyteDB, and Spanner run
  consensus (Raft/Paxos) **per shard** to keep each shard's replicas
  consistent, combining it with sharding from
  [Chapter 19](/database/part-6-distributed/partitioning).

So the WAL-as-source-of-truth theme
([Chapter 16](/database/part-5-durability/write-ahead-log)) reaches its
apex: a distributed database is a set of **consensus-replicated logs**, one
per shard, with the cluster agreeing on each log's contents.

## 5. Distributed transactions and two-phase commit

A transaction spanning multiple shards/nodes must be **atomic** across all
of them — commit everywhere or nowhere
([Chapter 12](/database/part-4-transactions/transactions-and-acid)). The
classic protocol is **Two-Phase Commit (2PC)**, run by a **coordinator**:

```
Phase 1 (PREPARE): coordinator asks every participant "can you commit?"
   each participant durably prepares and replies YES or NO.
Phase 2 (COMMIT/ABORT):
   if ALL said YES → coordinator says COMMIT to all
   if ANY said NO  → coordinator says ABORT to all
```

Once a participant votes YES, it **must** be able to commit (it's
"prepared" and durable), so it can't back out. This achieves atomic
commit across nodes. But 2PC has a fatal flaw (§6).

## 6. The blocking problem with 2PC

2PC's weakness: it's a **blocking** protocol. If the **coordinator
crashes** after participants have voted YES but before sending the
decision, the prepared participants are **stuck** — they've promised to
commit, hold their locks, and **cannot unilaterally decide** (committing or
aborting alone might contradict the others). They **block**, holding
resources, until the coordinator recovers.

```
all voted YES → coordinator CRASHES before deciding →
   participants hold locks, blocked, waiting... ✗
```

This is why 2PC alone is fragile. The robust fix is to make the
**coordinator's decision itself fault-tolerant** via **consensus**: replace
the single coordinator with a **Raft/Paxos group** so the commit decision
survives any single failure. Modern distributed databases layer 2PC over
consensus (sometimes called **Paxos Commit**) — 2PC for cross-shard
atomicity, consensus so no single crash blocks it. Distributed atomicity =
2PC + consensus.

## 7. The CAP theorem

A fundamental limit frames all of this. The **CAP theorem**: when a network
**Partition** occurs, a distributed system must choose between
**Consistency** and **Availability** — you can't have both during a
partition.

```
Partition happens (nodes can't communicate). You must pick:
  CP — stay CONSISTENT: refuse requests on the minority side
       (reject/block rather than serve possibly-stale data).
  AP — stay AVAILABLE: serve every side, accepting they may DIVERGE
       (eventual consistency, conflict resolution later).
```

- **CP systems** (Raft-based stores, Spanner, traditional sharded SQL)
  sacrifice availability during a partition to never serve inconsistent
  data — the minority partition stops serving.
- **AP systems** (Dynamo-style: Cassandra, Riak) stay available everywhere,
  accepting temporary divergence and resolving conflicts later
  ([Chapter 18](/database/part-6-distributed/replication)).

(When there's *no* partition, you can have both consistency and
availability — CAP is a constraint specifically about partition behavior.
The related **PACELC** adds: *else*, even without a partition, trade
**latency** vs **consistency**.) CAP isn't a counsel of despair; it's a
clarifier — it tells you *which* guarantee you're giving up, so you choose
deliberately for your application.

## 8. The whole database, end to end

That completes the course. Stand back and see the full machine you've
built, bottom to top:

- **Storage** ([Part II](/database/part-2-storage-engines/storage-engine))
  — pages, B-trees/LSM-trees, the buffer pool: data on disk, fast.
- **Query processing** ([Part III](/database/part-3-query-processing/relational-model-and-sql))
  — parse, plan, optimize, execute: SQL → results.
- **Transactions** ([Part IV](/database/part-4-transactions/transactions-and-acid))
  — ACID's Isolation via locking/MVCC and isolation levels.
- **Durability & recovery** ([Part V](/database/part-5-durability/write-ahead-log))
  — the WAL and ARIES: Atomicity + Durability, surviving crashes.
- **Distribution** ([Part VI](/database/part-6-distributed/replication)) —
  replication, partitioning, consensus, and distributed transactions:
  scaling beyond one machine.

`SELECT * FROM users WHERE id = 42` is no longer a black box: it parses,
optimizes to an index lookup, walks a B-tree to a page, hits the buffer
pool, returns a row — and if it were a write, it would lock or version the
row, log to the WAL, and (distributed) replicate via consensus to a
majority. Every guarantee — fast, correct, durable, concurrent, scalable —
traces to a concrete mechanism you now understand. That's the whole point
of building from scratch.

> :weightliftinggoose: The distributed finale rests on **agreement**.
> **Consensus** (Raft: **majority quorums**, leader election, replicated
> log) makes a cluster agree despite crashes and partitions — and majority
> overlap is what kills split-brain and keeps decisions consistent.
> **Distributed transactions** use **2PC** for cross-node atomicity, but
> 2PC **blocks** if the coordinator dies, so robust systems back it with
> **consensus**. The **CAP theorem** says: under a partition, choose
> **consistency or availability** — pick deliberately. With this, you've
> assembled the entire database, disk to network. Go build a tiny one and
> watch it all come alive.

## What we covered

- Agreement across machines is hard: networks **lose/delay/reorder**
  messages, nodes **crash**, partitions happen, and you **can't tell** a
  dead node from a slow one.
- **Consensus** = nodes agree on a value/sequence with **agreement,
  validity, termination**; solved by **Paxos** and (understandably)
  **Raft**.
- **Raft** uses **leader election** + **log replication** with **majority
  quorums**; majority overlap gives one leader per term (no split-brain)
  and tolerates **f of 2f+1** failures.
- Real systems use consensus for **coordination** (ZooKeeper/etcd),
  **replicated logs** (a Raft log = replicated WAL), and **per-shard**
  consistency in distributed SQL.
- **Two-phase commit (2PC)** gives cross-node atomicity (PREPARE →
  COMMIT/ABORT) but **blocks** if the coordinator crashes — fixed by
  layering 2PC over **consensus**.
- The **CAP theorem**: during a **partition**, choose **Consistency**
  (CP: refuse on the minority) or **Availability** (AP: serve, risk
  divergence); **PACELC** adds the latency/consistency trade otherwise.
- The full database — storage, queries, transactions, recovery,
  distribution — is now a set of concrete mechanisms; the black box is
  open.

## What's next

That's the course! Revisit the [introduction](/database/) and the
[roadmap](/database/table-of-contents), and lean on the appendix: a
[cheat sheet](/database/appendix/cheat-sheet), a
[glossary](/database/appendix/glossary), and
[further reading](/database/appendix/further-reading) — including the great
texts and the famous papers (System R, ARIES, Dynamo, Raft, Spanner). Then
do the real thing: **build a tiny database** — a file, pages, a B-tree, a
WAL — and watch every chapter come alive.
