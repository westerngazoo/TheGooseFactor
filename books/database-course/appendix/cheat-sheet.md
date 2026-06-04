---
sidebar_position: 1
title: "Cheat Sheet"
---

# Database Cheat Sheet

> The whole engine on one page — the layers, the key structures, and the
> guarantees, with the chapter to revisit for each.

## The layered architecture

```
parser → planner/optimizer → executor      (Part III: query processing)
  ↓
access methods (heap, B-tree) → buffer pool → storage manager   (Part II)
  ↓
disk (pages in files)                       (Part I)

cross-cutting: transaction mgr + lock mgr/MVCC + log mgr (WAL)  (Parts IV–V)
```
([Ch 2](/database/part-1-foundations/architecture))

## Storage foundation

- **Page** = fixed-size I/O unit (4–16 KB); cost is counted in **page
  I/Os**, not bytes.
- **Slotted page**: front slot array (offsets) + records packed from the
  back → stable **RID `(page, slot)`**.
- **Heap file** = pages of records; fast insert/scan/by-RID, slow
  by-value (→ need indexes).
  ([Ch 3](/database/part-1-foundations/storage-on-disk))

## Storage engines: B-tree vs LSM

| | **B-tree** | **LSM-tree** |
|---|---|---|
| Optimized for | **reads** | **writes** |
| Writes | in place (random) | append memtable → SSTables |
| Reads | ~3–4 page I/Os | check memtable + SSTables (Bloom filters) |
| Cleanup | splits/merges | **compaction** |
| Used by | PostgreSQL, InnoDB, SQLite | RocksDB, Cassandra, LevelDB |

- **B+ tree**: high fanout → shallow; keys in internal nodes, **(key,RID)**
  in **linked leaves** (cheap range scans). ([Ch 5](/database/part-2-storage-engines/b-trees))
- **LSM**: memtable (+ WAL) → immutable **SSTables** → **compaction**;
  **tombstones** for deletes. ([Ch 6](/database/part-2-storage-engines/lsm-trees))

## Buffer pool

- In-memory cache of pages; **frames** + page table; **pin** in-use pages,
  evict cold (**LRU/clock**), write **dirty** pages back **lazily**.
- **Hit rate** dominates performance; **WAL-before-data** rule constrains
  flushes. ([Ch 7](/database/part-2-storage-engines/buffer-pool))

## Query lifecycle

```
SQL → parse (AST) → bind (catalog: names+types) → logical plan (algebra)
    → optimize (cost-based) → physical plan → execute → rows
```
([Ch 9](/database/part-3-query-processing/parsing-and-planning))

- **Relational algebra**: σ select, π project, ⋈ join, set ops, aggregate.
  ([Ch 8](/database/part-3-query-processing/relational-model-and-sql))
- **Optimizer**: cost ≈ page I/Os, from **statistics**; chooses **access
  path** (index vs scan, by **selectivity**), **join algorithm**, **join
  order**. Use **`EXPLAIN ANALYZE`**. ([Ch 10](/database/part-3-query-processing/query-optimization))

## Join algorithms

- **Nested-loop**: tiny outer or indexed inner; only option for non-equality.
- **Hash**: large **equality** joins; build small side, probe with large.
- **Sort-merge**: sorted inputs, ranges, sorted output.
  ([Ch 11](/database/part-3-query-processing/execution))

- **Iterator (Volcano) model**: `open`/`next`/`close`; rows **pulled**
  bottom→top; **sort**/hash-build are **blocking**.

## ACID

- **Atomicity** (all-or-none) ← WAL **undo** (before-images).
- **Consistency** (valid states) ← constraints + A·I.
- **Isolation** (as if alone) ← locking / MVCC.
- **Durability** (survives crash) ← WAL **redo**, **commit = log flushed**.
  ([Ch 12](/database/part-4-transactions/transactions-and-acid))

## Concurrency control

- **Locks**: **S** (shared/read, many) vs **X** (exclusive/write, one).
- **2PL**: growing (acquire) then shrinking (release) → **serializable**;
  **Strict 2PL** holds X locks to commit (no cascading aborts).
- **Deadlock**: waits-for cycle → abort a victim → **retry**.
  ([Ch 13](/database/part-4-transactions/concurrency-control))
- **MVCC**: keep **versions**; read a **snapshot**; **readers don't block
  writers**. SI allows **write skew**; **SSI** = serializable.
  ([Ch 14](/database/part-4-transactions/mvcc))

## Isolation levels (anomalies allowed)

| Level | Dirty | Non-repeatable | Phantom |
|---|:--:|:--:|:--:|
| READ UNCOMMITTED | ✓ | ✓ | ✓ |
| READ COMMITTED | – | ✓ | ✓ |
| REPEATABLE READ | – | – | ✓* |
| SERIALIZABLE | – | – | – |

Defaults are usually **not** serializable. Watch **lost update** &
**write skew** → use `FOR UPDATE`, atomic updates, or SERIALIZABLE.
([Ch 15](/database/part-4-transactions/isolation-levels))

## Durability & recovery

- **WAL rule**: log record on disk **before** data page; **commit = COMMIT
  record flushed**. Records carry **redo** (after) + **undo** (before),
  ordered by **LSN**. ([Ch 16](/database/part-5-durability/write-ahead-log))
- **ARIES**: **Analysis** (from checkpoint: find losers + dirty pages) →
  **Redo** (repeat history, idempotent via `pageLSN`) → **Undo** (roll back
  losers, log **CLRs**). **Checkpoints** bound replay.
  ([Ch 17](/database/part-5-durability/crash-recovery))

## Distributed

- **Replication**: copies for availability/read scaling/durability via
  **WAL shipping**; **sync** (no loss, slow) vs **async** (fast, lag);
  failover must avoid **split-brain**. ([Ch 18](/database/part-6-distributed/replication))
- **Partitioning**: split data for **write/storage** scale; **range**
  (ranges, hotspot-prone) vs **hash** (even, scatters ranges); rebalance
  with consistent hashing. ([Ch 19](/database/part-6-distributed/partitioning))
- **Consensus** (Raft): **majority quorums**, leader election, replicated
  log; tolerates **f of 2f+1**. **2PC** for cross-node atomicity (blocks →
  back with consensus). **CAP**: under partition, pick **C or A**.
  ([Ch 20](/database/part-6-distributed/consensus-and-distributed-transactions))

> :weightliftinggoose: Two mental anchors carry the whole field:
> **everything is page I/Os** (the storage half) and **ACID = isolation
> from concurrency control + atomicity/durability from the WAL** (the
> transactional half). Keep this page handy and read **`EXPLAIN`** output
> against it.

See the [glossary](/database/appendix/glossary) for terms and
[further reading](/database/appendix/further-reading) for the canonical
books and papers.
