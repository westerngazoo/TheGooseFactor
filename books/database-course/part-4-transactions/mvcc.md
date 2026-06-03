---
sidebar_position: 3
title: "MVCC: Multi-Version Concurrency Control"
---

# MVCC

> Readers don't block writers, and writers don't block readers. **MVCC**
> keeps **multiple versions** of each row, so a reader sees a consistent
> **snapshot** of the database as of when it started — without taking
> locks or waiting. It's how PostgreSQL, Oracle, MySQL/InnoDB, and most
> modern databases get high concurrency, and it's the dominant approach
> today.

Locking ([Chapter 13](/database/part-4-transactions/concurrency-control))
delivers isolation but makes readers and writers **block each other** — a
long write stalls reads, a long read stalls writes. **Multi-version
concurrency control** breaks that conflict with one idea: don't overwrite
data, keep old versions around, and let each transaction read the version
appropriate to its **snapshot**. This chapter is how that works.

## 1. The core idea: keep old versions

Under MVCC, a write doesn't destroy the old value — it creates a **new
version** while the old one lives on:

```
row id=1, balance:
  version A: 100   (created by T_old)
  version B: 150   (created by T5, after T5 updated it)
```

Each version is tagged with **which transaction created it** (and when it
was superseded). A reader then sees **the version that was current as of
its own start** — so it gets a stable, consistent view even as writers
create newer versions concurrently. Old versions are kept as long as some
transaction might still need them, then garbage-collected (§6).

## 2. Snapshots: a consistent point-in-time view

The reader's view is a **snapshot**: the state of the database as of a
specific moment (usually transaction start). Within a transaction, every
read sees that same snapshot — newer committed changes by *other*
transactions are simply invisible to it.

```
T1 starts (snapshot @ time 10) ──── reads balance → sees version as of t10
T2 updates balance, commits @ t12
T1 reads balance again ──────────── STILL sees t10 version (its snapshot)
```

This gives **repeatable reads for free**: `T1` reads the same value twice
and gets the same answer, with no locks, because it's pinned to its
snapshot. The magic is that `T1` never *waits* for `T2` and `T2` never
waits for `T1` — they operate on different versions. Reads and writes
proceed in parallel.

> :surprisedgoose: The headline property — **readers never block writers,
> writers never block readers** — sounds like it must violate isolation,
> but it doesn't. The trick is that a reader isn't reading "the data," it's
> reading "the data *as of its snapshot*," which is **immutable** — no one
> can change the past. Writers create *new* versions (the future) without
> touching the old ones. So both run full speed, yet each transaction sees
> a perfectly consistent world. Decoupling "the current value" from "the
> value you're entitled to see" is what dissolves the reader/writer
> conflict that locking suffers.

## 3. How a version is chosen: visibility

When a transaction reads a row, MVCC must pick *which version* is visible
to it. Each version carries metadata — conceptually the transaction IDs
that **created** (`xmin`) and **deleted/superseded** (`xmax`) it. A version
is **visible** to transaction `T` if:

- It was created by a transaction that **committed before** `T`'s snapshot
  (so the value "existed" when `T` started), **and**
- It was **not yet superseded** as of `T`'s snapshot (no committed newer
  version that `T` should see).

```
visible(version v, txn T):
   created_by(v) committed before T's snapshot
   AND (not superseded, OR superseded only after T's snapshot)
```

The database walks the row's versions and returns the one satisfying this
rule. Uncommitted versions from *other* in-flight transactions are never
visible — that's how MVCC prevents **dirty reads** automatically. The
visibility check is the heart of MVCC.

## 4. Snapshot isolation

The isolation level MVCC naturally provides is **snapshot isolation
(SI)**: every transaction reads from a consistent snapshot taken at its
start, and writes are checked for conflicts at commit. SI prevents dirty
reads, non-repeatable reads, and (in most implementations) phantoms — a
strong, very usable level
([Chapter 15](/database/part-4-transactions/isolation-levels)).

But SI is **not quite serializable**. It permits one subtle anomaly,
**write skew**:

```
Rule: at least one doctor must be on call.
T1: reads "Bob is on call too" → takes Alice off call.
T2: reads "Alice is on call too" → takes Bob off call.
Both commit on their snapshots → NOBODY on call. Rule violated.
```

Each transaction saw a valid snapshot, neither wrote the *same* row, so no
write-write conflict fired — yet together they broke an invariant. Write
skew is the classic SI gotcha, and the reason SI ≠ serializability.

## 5. Serializable Snapshot Isolation

To get true serializability while keeping MVCC's concurrency, databases
use **Serializable Snapshot Isolation (SSI)** (PostgreSQL's
`SERIALIZABLE` level). SSI runs transactions on snapshots as usual but
**monitors for dangerous read-write dependency patterns** that could
produce a non-serializable outcome (like the write-skew structure), and
**aborts** one transaction if such a pattern forms.

SSI is **optimistic**: it lets transactions run freely and only intervenes
if a serializability violation is about to commit, rather than locking
preemptively. The cost is occasional aborts (and the retries they
require), but it preserves MVCC's "readers don't block writers" while
delivering full serializability — the best of both worlds for many
workloads.

## 6. The cost: version storage and garbage collection

MVCC's price is that old versions **accumulate** and must be cleaned up:

- Every update creates a new version; the old one lingers until **no
  transaction can still see it**.
- A background process reclaims dead versions — PostgreSQL's **`VACUUM`**,
  InnoDB's **purge** of the undo log.
- A **long-running transaction** is MVCC's nemesis: it keeps an old
  snapshot alive, so versions that *would* be dead can't be reclaimed —
  causing **bloat** (PostgreSQL tables ballooning) and slower scans
  through dead rows.

This is why "kill the idle-in-transaction connection" and "tune
autovacuum" are real PostgreSQL operational concerns. MVCC trades locking's
*waiting* for versioning's *space and cleanup* — a different cost, often a
worthwhile one, but not free.

## 7. Where versions live

Two implementation styles for storing versions, worth knowing because they
explain different databases' behaviors:

- **Append-in-place / heap versions** (PostgreSQL): new versions are
  written as new row tuples in the heap; old ones stay until `VACUUM`
  removes them. Updates are essentially insert+mark-old-dead, which is
  cheap to write but produces bloat and dead-tuple cleanup.
- **Undo-log / rollback-segment** (Oracle, MySQL/InnoDB): the row is
  updated **in place**, and the **previous version is reconstructed on
  demand** from a separate **undo log**. Reads of old snapshots "rewind"
  the row using undo records; the undo log is purged when no longer
  needed.

Both achieve MVCC; they differ in where the version history sits (in the
table vs in an undo log) and thus in their bloat, vacuum, and read-cost
characteristics. It's a useful lens when comparing engines.

## 8. MVCC vs locking, and the modern default

Step back and compare the two concurrency-control philosophies:

- **Locking (pessimistic)**: prevent conflicts by making transactions
  **wait**; readers and writers block each other; deadlocks possible.
- **MVCC (optimistic for reads)**: avoid read/write conflicts by keeping
  **versions**; readers and writers run in parallel; cost is version
  storage + GC, and (for serializable) occasional aborts.

Most modern databases use **MVCC for reads** (snapshots, no read locks)
while still using **locks for writes** (two writers to the same row must
serialize — strict 2PL on writes,
[Chapter 13](/database/part-4-transactions/concurrency-control)). So it's
not either/or: MVCC handles the read path, locking handles write-write
conflicts. That hybrid — snapshot reads + write locks — is the dominant
design in PostgreSQL, Oracle, and InnoDB, and it's why "readers don't block
writers" is the expected behavior today.

> :weightliftinggoose: MVCC's one big idea: **keep multiple versions**, so
> each transaction reads a consistent **snapshot** (its point-in-time view)
> while writers create new versions — hence **readers don't block writers
> and vice versa**. A **visibility** check picks the right version per
> transaction. The natural level is **snapshot isolation** (strong, but
> allows **write skew**); **SSI** adds full serializability by aborting
> dangerous patterns. The costs are **version bloat + garbage collection**
> (`VACUUM`/undo purge) and the menace of **long-running transactions**.
> Modern engines = **MVCC reads + write locks**; know both halves.

## What we covered

- **MVCC** keeps **multiple versions** of each row instead of overwriting;
  each version is tagged with its creating/superseding transaction.
- A transaction reads from a **snapshot** (state as of its start), giving
  **repeatable reads for free** and making **readers and writers
  non-blocking**.
- A **visibility** rule (created-before-snapshot, not-yet-superseded)
  selects the version a transaction sees and hides uncommitted data
  (no dirty reads).
- **Snapshot isolation** is MVCC's natural level — strong but allows
  **write skew**, so it's *not* serializable.
- **Serializable Snapshot Isolation (SSI)** adds true serializability by
  detecting dangerous read-write patterns and **aborting** a victim
  (optimistic).
- Costs: **old versions accumulate** and need **garbage collection**
  (`VACUUM` / undo purge); **long-running transactions** cause **bloat**.
- Versions live either as **heap tuples** (PostgreSQL) or are
  reconstructed from an **undo log** (Oracle/InnoDB).
- Modern default = **MVCC for reads + locks for writes**; not either/or.

## What's next

[Chapter 15](/database/part-4-transactions/isolation-levels) — isolation
levels and anomalies. The SQL standard's spectrum from `READ UNCOMMITTED`
to `SERIALIZABLE`, exactly which anomalies each permits, and how to choose
the right trade-off between safety and performance.
