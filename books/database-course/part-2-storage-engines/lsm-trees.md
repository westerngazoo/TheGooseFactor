---
sidebar_position: 3
title: "LSM-Trees and SSTables: Write-Optimized"
---

# LSM-Trees and SSTables

> The write-optimized alternative to the B-tree. An **LSM-tree**
> (Log-Structured Merge-tree) never updates data in place: it buffers
> writes in memory, flushes them as **immutable sorted files** (SSTables),
> and merges those files in the background. Writes become fast sequential
> appends; reads pay by consulting several files. It powers RocksDB,
> Cassandra, LevelDB, and many "NoSQL" and write-heavy stores.

The B-tree ([Chapter 5](/database/part-2-storage-engines/b-trees)) is
superb for reads but does **random, in-place writes**. For write-heavy
workloads (logging, time-series, high-ingest systems), that's a
bottleneck. The **LSM-tree** flips the design to make writes sequential
and cheap — the other major storage-engine family, and the one behind much
of the modern data infrastructure.

## 1. The core idea: never update in place

The B-tree mutates pages where they sit, scattering small random writes
across the disk. The LSM-tree's principle is the opposite:

> Only ever **append**. Buffer writes in memory; flush them as **sorted,
> immutable** files; **merge** files in the background to reclaim space and
> bound reads.

No write ever overwrites existing on-disk data. Updates and deletes are
*new entries* that supersede old ones. This converts the B-tree's random
writes into **large sequential writes** — the recurring "turn random into
sequential" theme ([Chapter 2](/database/part-1-foundations/architecture))
pushed all the way. Sequential writes are dramatically faster on both SSD
and HDD, which is why LSM ingest rates are so high.

## 2. The memtable: writes go to memory first

Every write first lands in an in-memory sorted structure, the
**memtable** (typically a balanced tree or skip list, kept sorted by key):

```
write(key, value)  →  insert into the in-memory memtable (sorted)
                   →  also append to the WAL for durability
```

Writes are O(log n) **in memory** — no disk seek — so they're extremely
fast. For durability (the memtable is volatile), each write is *also*
appended to a **write-ahead log** ([Chapter 16](/database/part-5-durability/write-ahead-log))
so a crash doesn't lose unflushed writes. When the memtable grows past a
threshold, it's **flushed** to disk as an SSTable (§3) and a fresh memtable
takes over.

## 3. SSTables: immutable sorted files on disk

A flushed memtable becomes a **Sorted String Table (SSTable)**: a file of
**key-value pairs sorted by key**, written once and **never modified**:

```
SSTable (immutable):
  [ key1:val1 ][ key2:val2 ][ key3:val3 ] ... (sorted by key)
  + a sparse index (key → file offset) for fast in-file lookup
```

Because an SSTable is sorted, you can binary-search it (with a small
in-memory **sparse index** of some keys → offsets), and because it's
immutable, it needs no locking and can be cached, copied, and merged
freely. Over time the database accumulates **many** SSTables (one per
flush), often organized into **levels** of increasing size.

## 4. Reads: check memory, then the files

A read must find the *most recent* value for a key, which could be in the
memtable or any SSTable. So a lookup checks newest-to-oldest:

1. The **memtable** (newest writes) — found? return it.
2. Each **SSTable**, from newest to oldest, until found.

Naively this is slow (many files to check), so LSM engines use two
accelerators:

- **Bloom filters**: a tiny probabilistic structure per SSTable that says
  "key *definitely not* here" or "*maybe* here" — letting reads **skip**
  SSTables that can't contain the key, usually with no false skips.
- **Sparse indexes / leveling**: bound how many SSTables a read must
  consult.

Even so, a read may touch several files — the LSM's fundamental cost
versus the B-tree's single-structure lookup.

> :surprisedgoose: Deletes are the surprising part: you can't remove a key
> from an *immutable* SSTable, so a delete writes a **tombstone** — a
> marker meaning "this key is gone." Reads that hit a tombstone (before any
> older value) report "not found." The actual data isn't reclaimed until
> **compaction** (§5) merges the files and drops the tombstoned entries.
> So in an LSM-tree, *deleting data temporarily makes the database
> bigger*. The same goes for updates: an "update" is just a newer entry
> shadowing the old, and the old bytes linger until compaction.

## 5. Compaction: merging files in the background

Accumulating SSTables forever would make reads slower and waste space
(superseded values and tombstones piling up). **Compaction** is the
background process that fixes this: it **merge-sorts** several SSTables
into fewer, larger ones, keeping only the newest value per key and
dropping tombstoned keys.

```
SSTable A: [a:1][c:3][e:5]      ┐ merge-sort, keep newest per key,
SSTable B: [a:9][b:2][c:tomb]   ┘ drop tombstones
           →  [a:9][b:2][e:5]   (c deleted, a updated to 9)
```

Because the inputs are already sorted, this is a streaming **k-way merge** —
sequential reads and a sequential write. Compaction strategies (**leveled**
vs **size-tiered**) trade off read, write, and space amplification
differently, and tuning them is a big part of operating an LSM store.
Compaction is the price of the append-only design: cheap writes now, paid
back as background merging later.

## 6. The amplification trade-offs

LSM vs B-tree is best understood through three "amplifications":

- **Write amplification** — bytes written to disk per byte of logical
  data. LSM re-writes data during compaction (a key may be rewritten
  several times across levels). B-trees rewrite pages on update.
- **Read amplification** — work per read. LSM may check the memtable +
  several SSTables (mitigated by Bloom filters); B-tree is ~height page
  reads.
- **Space amplification** — extra disk used. LSM holds superseded values
  and tombstones until compaction; B-trees leave pages partially full.

The headline: **LSM-trees lower write cost at the expense of read and
space cost; B-trees do the reverse.** There's no free lunch — only the
right point on the curve for your workload.

## 7. When to use which

A practical guide:

- **B-tree** when reads dominate, you need low-latency point *and* range
  lookups, and updates are moderate — the classic OLTP relational case
  (PostgreSQL, InnoDB).
- **LSM-tree** when writes are heavy or bursty — ingest pipelines,
  time-series, metrics, event logs, write-mostly key-value workloads
  (RocksDB, Cassandra, LevelDB; also used inside some SQL engines like
  MyRocks).

Both support point and range queries (SSTables are sorted, so ranges work
via a merge across files), and both need a WAL for durability. The choice
is the **write/read/space balance**. Many systems even let you pick per
table, and some hybrid designs blur the line.

## 8. The log-structured lineage

The LSM-tree is part of a broader **log-structured** idea: treat storage
as an append-only log and let background processes reorganize it. The same
principle appears in:

- **Log-structured filesystems** (the original LFS research).
- The **WAL** itself ([Chapter 16](/database/part-5-durability/write-ahead-log))
  — append changes sequentially, apply lazily.
- **Append-only / event-sourced** data systems (Kafka logs, etc.).

It's a unifying lens: *appending is fast and crash-friendly; cleanup
happens out of band.* The LSM-tree applies it to indexing; once you see
the pattern, you'll recognize it across storage and distributed systems.
Between the B-tree and the LSM-tree you now hold the two great storage
designs — and the buffer pool that both rely on comes next.

> :weightliftinggoose: The LSM-tree is the B-tree's mirror image: **never
> update in place** — buffer writes in a **memtable** (+ WAL), flush
> **immutable sorted SSTables**, and **compact** them in the background,
> using **Bloom filters** to skip files on reads and **tombstones** for
> deletes. The result trades **read & space amplification** for cheap,
> sequential **writes**. Choose **B-tree for read-heavy**, **LSM for
> write-heavy**. And recognize the bigger pattern — *append now,
> reorganize later* — because you'll meet it again in the WAL and in
> distributed logs.

## What we covered

- An **LSM-tree** never updates in place: it **appends** and **merges**,
  turning random writes into fast **sequential** ones.
- Writes hit an in-memory **memtable** (sorted) plus the **WAL** for
  durability; a full memtable **flushes** to an immutable **SSTable**.
- **SSTables** are sorted, immutable key-value files with a sparse index;
  the database accumulates many, often in size **levels**.
- **Reads** check memtable then SSTables newest→oldest, accelerated by
  **Bloom filters** (skip files) and indexes; **deletes** write
  **tombstones**.
- **Compaction** merge-sorts SSTables in the background, keeping newest
  values and dropping tombstones — the cost of append-only design.
- The **amplification** trade-offs: LSM lowers **write** cost, raises
  **read** and **space** cost; B-trees do the reverse.
- Use **B-tree for read-heavy/OLTP**, **LSM for write-heavy/ingest**; both
  are part of the broader **log-structured** family (LFS, WAL, event logs).

## What's next

[Chapter 7](/database/part-2-storage-engines/buffer-pool) — the buffer
pool. Both B-trees and LSM-trees read and write **pages**; the buffer pool
is the in-memory cache that decides which pages stay in RAM, when to evict
them, and how dirty pages get back to disk — the bridge between memory and
storage.
