---
sidebar_position: 1
title: "The Storage Engine and the Page Abstraction"
---

# The Storage Engine

> The component that owns "data on disk." A **storage engine** turns the
> raw page-and-file substrate into an API the rest of the database uses:
> store a record, fetch it by ID, scan a table, maintain indexes. It's a
> swappable heart — many databases let you choose one — and it sits at the
> boundary between the query world above and the disk below.

[Part I](/database/part-1-foundations/storage-on-disk) gave us pages,
records, and heap files. The **storage engine** packages those into a
clean interface so the layers above never think about byte offsets. This
short chapter defines that interface and the engine's responsibilities,
setting up the two great index designs — B-trees and LSM-trees — that
follow.

## 1. What a storage engine does

The storage engine is responsible for everything "below the query layer":

- **Storing and retrieving records** — put a row on disk, get it back by
  its RID.
- **Indexing** — maintain structures (B-trees, etc.) that find rows by
  value, fast ([Chapter 5](/database/part-2-storage-engines/b-trees)).
- **Managing pages** — read/write pages via the buffer pool
  ([Chapter 7](/database/part-2-storage-engines/buffer-pool)).
- **Durability hooks** — cooperate with the write-ahead log so changes
  survive crashes ([Chapter 16](/database/part-5-durability/write-ahead-log)).

Everything above — the executor, the planner — talks to the storage
engine through an API and never touches a raw page. That clean boundary is
what lets engines be *swapped*.

## 2. Storage engines are swappable

A striking fact: in several databases the storage engine is a *pluggable
component*. **MySQL** famously supports multiple — **InnoDB** (the default,
B-tree, transactional) and others — behind one SQL layer. **MongoDB** uses
**WiredTiger**. Embedded engines like **RocksDB** (an LSM-tree) and
**SQLite**'s B-tree engine are storage engines you can build *on top of*.

This works precisely because of the layered architecture
([Chapter 2](/database/part-1-foundations/architecture)): the storage
engine exposes a narrow interface (store/fetch/scan/index), so you can
replace the implementation — B-tree vs LSM, on-disk vs in-memory — without
touching the parser or planner. The choice of engine is mostly a choice
about the **read/write trade-off**, which the next two chapters are all
about.

## 3. The engine's API

Conceptually, a storage engine exposes something like:

```
insert(table, record)        -> RID
fetch(table, rid)            -> record
update(table, rid, record)   -> RID        (may move the record)
delete(table, rid)
scan(table)                  -> iterator over all records

# index side
index_insert(index, key, rid)
index_lookup(index, key)     -> RID(s)
index_range(index, lo, hi)   -> iterator over RIDs in [lo, hi]
```

The **table** side stores the rows (a heap, or the rows-inside-the-index
in a clustered design, §5). The **index** side maps keys to RIDs. Notice
`scan` and `index_range` return *iterators* — the engine streams records
rather than materializing them all, which is exactly what the **iterator
execution model** ([Chapter 11](/database/part-3-query-processing/execution))
consumes above.

## 4. The two great families: B-tree vs LSM

Almost every modern storage engine's index is one of two designs, and the
difference is the central trade-off of this part:

- **B-tree** (read-optimized): an in-place, balanced tree. Reads and
  point lookups are excellent; writes update pages in place. Used by
  PostgreSQL, MySQL/InnoDB, SQLite, most traditional databases
  ([Chapter 5](/database/part-2-storage-engines/b-trees)).
- **LSM-tree** (write-optimized): buffer writes in memory, flush them to
  immutable sorted files, merge in the background. Writes are
  extremely fast; reads may check several files. Used by RocksDB,
  Cassandra, LevelDB, many "NoSQL" stores
  ([Chapter 6](/database/part-2-storage-engines/lsm-trees)).

The slogan: **B-trees optimize reads, LSM-trees optimize writes.** Pick by
workload. We'll build intuition for both and the metrics — *read
amplification*, *write amplification*, *space amplification* — that
quantify the trade.

> :nerdygoose: The B-tree vs LSM choice is the defining storage decision
> of the last two decades. B-trees mutate data **in place** (random
> writes, but reads go straight to the data); LSM-trees only ever
> **append** sorted runs and merge later (sequential writes, but reads may
> consult multiple runs). It's the recurring "turn random writes into
> sequential" theme ([Chapter 2](/database/part-1-foundations/architecture))
> taken to its logical end. Neither is universally better — they're
> different points on the read/write/space trade-off curve, which is why
> serious systems offer both.

## 5. Clustered vs non-clustered: where do the rows live?

A design choice that interacts with indexing: are the table's rows stored
in a **heap** (a separate pile, [Chapter 3](/database/part-1-foundations/storage-on-disk)),
or *inside* an index?

- **Heap + secondary indexes** (PostgreSQL): rows live in a heap file;
  every index (even the primary key's) maps keys → RIDs that point into
  the heap. Simple, uniform.
- **Clustered index** (MySQL/InnoDB, SQLite): the table *is* a B-tree
  keyed on the primary key, with the **full rows stored in the leaves**.
  A primary-key lookup lands directly on the row (no second hop). Secondary
  indexes then map to the *primary key*, not a physical RID.

Clustering makes primary-key access and key-ordered scans faster (rows are
physically sorted by PK) but makes secondary-index lookups a two-step
(secondary key → PK → row). It's another read-path trade-off, decided per
engine.

## 6. The engine sits between two worlds

Place the storage engine in the stack: above it, the **execution engine**
asks for records and ranges in logical terms ("give me rows where
`id` in `[10, 20]`"); below it, the **buffer pool and storage manager**
deal in pages and disk. The storage engine is the *translator* — it turns
"find key 42" into "walk this B-tree, which means read these pages from
the buffer pool."

This is why the engine is where so much database cleverness lives: it's
the layer that must be simultaneously *correct* (right records,
transactionally), *fast* (few page I/Os), and *durable* (survive crashes).
The next three chapters dive into exactly how it pulls that off — first
the read-optimized B-tree, then the write-optimized LSM-tree, then the
buffer pool both rely on.

## 7. A note on in-memory engines

Not every database lives on disk. **In-memory** engines (Redis, parts of
SAP HANA, VoltDB) keep the working set in RAM, trading durability
strategies (periodic snapshots, an append-only log) for raw speed. They
still use many of the same ideas — indexes, logs for durability,
concurrency control — but free of the page/buffer-pool dance, since "the
data is already in memory."

We focus on disk-based engines because they face the full set of problems
(the memory/disk gap, the buffer pool, recovery) and the techniques
generalize down to in-memory designs. But it's worth knowing the
in-memory branch exists: when your data fits in RAM and you can tolerate a
small durability window, a lot of complexity evaporates.

## 8. What we're building toward

For GooseDB, our storage engine will be a classic **heap + B-tree** design
(the most broadly instructive), and we'll study the **LSM** alternative so
you understand the write-optimized world too. Over the next chapters:

- **B-trees** ([Chapter 5](/database/part-2-storage-engines/b-trees)) —
  the index structure: nodes, splits, lookups, range scans.
- **LSM-trees** ([Chapter 6](/database/part-2-storage-engines/lsm-trees))
  — memtables, SSTables, compaction, and the write/read trade-off.
- **Buffer pool** ([Chapter 7](/database/part-2-storage-engines/buffer-pool))
  — caching pages, eviction policies, dirty-page management — the engine's
  memory.

Together these are the engine: the thing that makes "store and find a row
on disk, fast and safely" real.

> :weightliftinggoose: The storage engine is the database's lower half,
> exposed as a tidy API — **insert / fetch / scan / index lookup / range**
> — so the query layer never sees a byte offset. The one decision that
> defines an engine is **B-tree (read-optimized, in-place) vs LSM
> (write-optimized, append-and-merge)**; keep that fork in mind as you
> learn both. Also note **where the rows live** (heap vs clustered index),
> since it shapes the read path. The engine translates *logical record
> requests* into *page I/Os* — which is why it's where storage cleverness
> concentrates.

## What we covered

- A **storage engine** owns data-on-disk: storing/retrieving records,
  **indexing**, page management, and durability hooks — behind a clean API
  the query layer uses.
- Engines are often **swappable** (MySQL/InnoDB, MongoDB/WiredTiger,
  embeddable RocksDB/SQLite) thanks to the narrow interface.
- The API is roughly **insert/fetch/update/delete/scan** plus
  **index_insert/lookup/range**, returning **iterators** for scans.
- The two families: **B-trees** (read-optimized, in-place) vs
  **LSM-trees** (write-optimized, append-and-merge) — the central
  read/write/space trade-off.
- **Clustered** (rows inside the PK index, e.g. InnoDB/SQLite) vs **heap +
  secondary indexes** (e.g. PostgreSQL) decides where rows live and the
  read-path cost.
- The engine **translates** logical record requests into page I/Os,
  sitting between the executor and the buffer pool — where storage
  cleverness lives.
- **In-memory** engines drop the page/buffer-pool layer but keep indexes,
  logging, and concurrency control.

## What's next

[Chapter 5](/database/part-2-storage-engines/b-trees) — B-trees, the
read-optimized index that powers most traditional databases. How the tree
is shaped to minimize page reads, and how lookups, range scans, inserts,
and node splits actually work.
