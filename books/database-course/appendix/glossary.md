---
sidebar_position: 2
title: "Glossary"
---

# Glossary

> The vocabulary of database internals, defined concisely, each linked to
> the chapter that develops it.

**ACID** — the transactional guarantees: **Atomicity**, **Consistency**,
**Isolation**, **Durability**. ([Ch 12](/database/part-4-transactions/transactions-and-acid))

**ARIES** — the canonical crash-recovery algorithm: **Analysis → Redo →
Undo**, with idempotent redo and compensation logging.
([Ch 17](/database/part-5-durability/crash-recovery))

**Atomicity** — a transaction happens entirely or not at all; partial
effects are undone. ([Ch 12](/database/part-4-transactions/transactions-and-acid))

**B+ tree** — the B-tree variant databases use: keys-only internal nodes,
**(key, RID)** in **linked leaves** for cheap range scans.
([Ch 5](/database/part-2-storage-engines/b-trees))

**B-tree** — a balanced, high-fanout search tree shaped to minimize
**page reads** (3–4 levels for billions of keys); the default index.
([Ch 5](/database/part-2-storage-engines/b-trees))

**Bloom filter** — a probabilistic structure that says "key *definitely
not* here / *maybe* here," letting LSM reads skip SSTables.
([Ch 6](/database/part-2-storage-engines/lsm-trees))

**Buffer pool** — the in-memory cache of disk **pages** (frames + page
table) bridging RAM and disk. ([Ch 7](/database/part-2-storage-engines/buffer-pool))

**CAP theorem** — under a network **partition**, a system must choose
**Consistency** or **Availability**. ([Ch 20](/database/part-6-distributed/consensus-and-distributed-transactions))

**Cardinality** — the estimated number of rows an operator produces; what
the optimizer estimates from statistics.
([Ch 10](/database/part-3-query-processing/query-optimization))

**Checkpoint** — a periodic log record of transaction/dirty-page state so
recovery can start mid-log, not from the beginning (often **fuzzy**).
([Ch 17](/database/part-5-durability/crash-recovery))

**CLR (Compensation Log Record)** — a log record describing an undo action,
making recovery itself restartable. ([Ch 17](/database/part-5-durability/crash-recovery))

**Clustered index** — a table stored *inside* its primary-key B-tree (rows
in the leaves), so PK lookups land on the row.
([Ch 4](/database/part-2-storage-engines/storage-engine))

**Compaction** — the LSM background process that merge-sorts SSTables,
keeping newest values and dropping tombstones.
([Ch 6](/database/part-2-storage-engines/lsm-trees))

**Concurrency control** — the machinery (locking or MVCC) that provides
**Isolation**. ([Ch 13](/database/part-4-transactions/concurrency-control))

**Consensus** — getting nodes to agree on a value/sequence despite
failures (Paxos, **Raft**). ([Ch 20](/database/part-6-distributed/consensus-and-distributed-transactions))

**Cost-based optimization** — choosing a physical plan by estimating each
candidate's cost (mostly page I/Os) from statistics.
([Ch 10](/database/part-3-query-processing/query-optimization))

**Deadlock** — transactions mutually waiting on each other's locks;
resolved by detecting a waits-for **cycle** and aborting a victim.
([Ch 13](/database/part-4-transactions/concurrency-control))

**Durability** — committed data survives crashes; provided by the **WAL**.
([Ch 16](/database/part-5-durability/write-ahead-log))

**EXPLAIN** — shows the optimizer's chosen plan (`EXPLAIN ANALYZE` adds
actual rows/timings) — the key tuning tool.
([Ch 10](/database/part-3-query-processing/query-optimization))

**Hash join** — build a hash table on the smaller input, probe with the
larger; best for large **equality** joins.
([Ch 11](/database/part-3-query-processing/execution))

**Heap file** — a table stored as unordered pages of records.
([Ch 3](/database/part-1-foundations/storage-on-disk))

**Index** — a structure mapping a key to row location(s) (RID) for fast
by-value access; usually a **B-tree**.
([Ch 5](/database/part-2-storage-engines/b-trees))

**Isolation** — concurrent transactions behave as if run alone; tuned by
**isolation level**. ([Ch 12](/database/part-4-transactions/transactions-and-acid))

**Isolation level** — the spectrum (READ UNCOMMITTED → SERIALIZABLE)
trading anomaly-prevention for concurrency.
([Ch 15](/database/part-4-transactions/isolation-levels))

**Iterator (Volcano) model** — execution where every operator implements
`open`/`next`/`close` and rows are **pulled** up the tree.
([Ch 11](/database/part-3-query-processing/execution))

**Join** — combining rows of two relations on a condition; the central,
expensive relational operation. ([Ch 8](/database/part-3-query-processing/relational-model-and-sql))

**Leader-follower** — replication where one leader takes writes and streams
them to read-only followers. ([Ch 18](/database/part-6-distributed/replication))

**Lock** — acquired before accessing data: **shared (S)** for reads,
**exclusive (X)** for writes. ([Ch 13](/database/part-4-transactions/concurrency-control))

**Logical vs physical plan** — *what* relational operations (logical) vs
*how* — algorithms, access paths, order (physical).
([Ch 9](/database/part-3-query-processing/parsing-and-planning))

**LSM-tree** — a write-optimized engine: buffer writes in a **memtable**,
flush immutable **SSTables**, **compact** in background.
([Ch 6](/database/part-2-storage-engines/lsm-trees))

**LSN (Log Sequence Number)** — the monotonically increasing ID of a log
record; pages store their last-applied LSN for idempotent redo.
([Ch 16](/database/part-5-durability/write-ahead-log))

**Memtable** — the in-memory sorted buffer for writes in an LSM-tree.
([Ch 6](/database/part-2-storage-engines/lsm-trees))

**MVCC** — multi-version concurrency control: keep row **versions** so
readers see a **snapshot** without blocking writers.
([Ch 14](/database/part-4-transactions/mvcc))

**OLTP / OLAP** — transaction processing (small fast operations) vs
analytical processing (big scans/aggregations).
([Ch 1](/database/part-1-foundations/why-databases))

**Page** — the fixed-size unit of disk I/O and caching (4–16 KB); the atom
of a database. ([Ch 3](/database/part-1-foundations/storage-on-disk))

**Partitioning (sharding)** — splitting data across nodes to scale writes
and storage; **range** or **hash**. ([Ch 19](/database/part-6-distributed/partitioning))

**Phantom** — a re-run range query gains rows another transaction
inserted. ([Ch 13](/database/part-4-transactions/concurrency-control))

**Predicate pushdown** — moving filters close to scans so less data flows
up the plan. ([Ch 10](/database/part-3-query-processing/query-optimization))

**Quorum** — a majority (or `W`/`R` set) whose overlap guarantees
consistency; the basis of consensus and leaderless replication.
([Ch 18](/database/part-6-distributed/replication), [Ch 20](/database/part-6-distributed/consensus-and-distributed-transactions))

**Raft** — an understandable consensus algorithm: leader election + log
replication via majority quorums. ([Ch 20](/database/part-6-distributed/consensus-and-distributed-transactions))

**Relational model** — data as **relations** (tables) of **tuples** with a
schema, keys, and relational algebra. ([Ch 8](/database/part-3-query-processing/relational-model-and-sql))

**RID / TID** — a row's address, `(page number, slot number)`.
([Ch 3](/database/part-1-foundations/storage-on-disk))

**Selectivity** — the fraction of rows a predicate matches; decides
index-vs-scan. ([Ch 10](/database/part-3-query-processing/query-optimization))

**Serializability** — the gold-standard isolation: equivalent to *some*
serial order. ([Ch 12](/database/part-4-transactions/transactions-and-acid))

**Slotted page** — page layout with a front slot array of offsets and
records packed from the back, giving stable RIDs.
([Ch 3](/database/part-1-foundations/storage-on-disk))

**Snapshot isolation** — MVCC's natural level: read a consistent snapshot;
allows **write skew**. ([Ch 14](/database/part-4-transactions/mvcc))

**Sort-merge join** — sort both inputs on the key, merge in one pass; great
for sorted inputs and ranges. ([Ch 11](/database/part-3-query-processing/execution))

**Split-brain** — two nodes both believing they're leader, diverging data;
prevented by consensus. ([Ch 18](/database/part-6-distributed/replication))

**SSTable** — a sorted, immutable on-disk key-value file in an LSM-tree.
([Ch 6](/database/part-2-storage-engines/lsm-trees))

**Statistics** — collected data distributions (histograms, counts) driving
cardinality estimates; **stale stats** cause bad plans.
([Ch 10](/database/part-3-query-processing/query-optimization))

**Storage engine** — the component owning data-on-disk, indexing, and page
management, behind a record API. ([Ch 4](/database/part-2-storage-engines/storage-engine))

**Tombstone** — a marker recording a deletion in an immutable SSTable;
reclaimed at compaction. ([Ch 6](/database/part-2-storage-engines/lsm-trees))

**Transaction** — a group of operations treated as one all-or-nothing
unit. ([Ch 12](/database/part-4-transactions/transactions-and-acid))

**Two-phase commit (2PC)** — PREPARE then COMMIT/ABORT for cross-node
atomicity; **blocks** if the coordinator crashes.
([Ch 20](/database/part-6-distributed/consensus-and-distributed-transactions))

**Two-phase locking (2PL)** — growing (acquire) then shrinking (release)
locking that guarantees serializability; **Strict 2PL** holds X locks to
commit. ([Ch 13](/database/part-4-transactions/concurrency-control))

**WAL (Write-Ahead Log)** — the append-only log written **before** data
pages, providing durability (redo) and atomicity (undo).
([Ch 16](/database/part-5-durability/write-ahead-log))

**Write skew** — two transactions on a shared snapshot each write different
rows, jointly breaking an invariant; allowed by snapshot isolation.
([Ch 14](/database/part-4-transactions/mvcc))

See the [cheat sheet](/database/appendix/cheat-sheet) for the layered
overview and [further reading](/database/appendix/further-reading) for
sources.
