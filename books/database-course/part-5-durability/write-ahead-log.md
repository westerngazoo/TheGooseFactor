---
sidebar_position: 1
title: "The Write-Ahead Log"
---

# The Write-Ahead Log

> How a commit survives a crash. The **write-ahead log (WAL)** is an
> append-only record of every change, written to disk **before** the
> change touches the data pages. It's the foundation of both
> **durability** (replay committed changes after a crash) and
> **atomicity** (undo incomplete ones). Nearly every database has one — it
> is the single most important durability mechanism.

[Part IV](/database/part-4-transactions/isolation-levels) made concurrent
execution safe. Now: how does a `COMMIT` survive the power dying one
millisecond later? The answer is the **WAL** — and it elegantly solves a
problem created by the buffer pool
([Chapter 7](/database/part-2-storage-engines/buffer-pool)): data pages are
written to disk *lazily*, so at commit time the actual data may still be in
volatile memory.

## 1. The durability problem

Recall the buffer pool: updates modify pages **in memory**, and those
dirty pages are flushed to disk *later* (lazily), to avoid turning every
write into a slow random disk write. But durability
([Chapter 12](/database/part-4-transactions/transactions-and-acid)) demands
that once `COMMIT` returns, the change survives a crash. Contradiction:

```
COMMIT returns "success"
   ... but the modified data page is still only in RAM ...
CRASH → RAM lost → the committed change is GONE.   ✗ durability violated
```

We can't flush the data page on every commit (random writes, too slow),
and we can't *not* persist the change (durability). The WAL threads this
needle.

## 2. The write-ahead principle

The insight: instead of writing the (random, scattered) **data pages** at
commit, write a compact, **sequential log** of *what changed*, and flush
*that* instead. The rule, **write-ahead logging**:

> **Before** a change is written to its data page on disk, the **log
> record** describing that change must already be on disk. And before a
> transaction is considered **committed**, its log records must be on disk.

So the **log**, not the data page, is what must hit disk to commit.
Because the log is **appended sequentially**, flushing it is fast (disks
love sequential writes — the recurring theme from
[Chapter 2](/database/part-1-foundations/architecture)). The data pages can
be written whenever convenient afterward; if a crash loses them, the log
can **redo** the changes. Fast commits *and* durability, reconciled.

> :nerdygoose: The WAL is the purest expression of "turn random writes
> into sequential writes." Updating data pages in place means many small,
> scattered, random disk writes — slow. Appending to a log means one
> sequential stream — fast, and on spinning disks ~100× faster. So the
> database makes the *log* the durable artifact and lets the data pages
> lag behind. The commit's critical path becomes "append to the log and
> flush," not "scatter-write the data." Durability rides on a sequential
> append; everything else is reconstructable from it. This one idea makes
> databases both fast and crash-safe.

## 3. What's in a log record

Each log record describes one change, with enough information to **redo**
it (re-apply if lost) and **undo** it (roll back if the transaction
aborts):

```
LSN 105 | txn T7 | UPDATE page 17, slot 3
        | before-image (undo): balance = 100
        | after-image  (redo): balance = 150
```

- **Redo information** (the **after-image**): what the data *became* — used
  to re-apply a committed change after a crash.
- **Undo information** (the **before-image**): what the data *was* — used
  to roll back an aborted or incomplete transaction (atomicity!).
- **Transaction ID**, **page ID**, and an **LSN** (next).

There are also special records: `BEGIN`, `COMMIT`, `ABORT`, and
checkpoint records. With before- and after-images logged, the database can
move the data in either direction in time — the basis of both recovery
phases ([Chapter 17](/database/part-5-durability/crash-recovery)).

## 4. The LSN: a sequence number for everything

Every log record gets a monotonically increasing **Log Sequence Number
(LSN)**. The LSN is the heartbeat of the whole durability system:

- Log records are ordered by LSN (it *is* the position in the log).
- Each **data page** stores the **LSN of the last log record that
  modified it** (its `pageLSN`).
- Comparing a page's `pageLSN` to a log record's LSN tells you whether
  that change is **already reflected** in the page — crucial for making
  redo **idempotent** ([Chapter 17](/database/part-5-durability/crash-recovery)).

The **write-ahead rule** is enforced via LSNs: the log up to a page's
`pageLSN` must be on disk before that page is flushed. The LSN is how the
database keeps the log and the data pages coherent in time.

## 5. Commit = log flushed

The commit protocol makes durability concrete:

```
COMMIT T7:
   1. append a COMMIT record for T7 to the log (in memory)
   2. FLUSH the log up to and including that record to disk
   3. only now return "committed" to the client
```

Step 2 is the durability point: once the `COMMIT` record is on disk, the
transaction is durable — even if the data pages it modified are still only
in RAM. If a crash happens *after* step 2, recovery finds the `COMMIT`
record and **redoes** the changes from the log. If a crash happens
*before* step 2, the transaction is treated as never committed and its
partial effects are **undone**. The on-disk presence of the `COMMIT`
record is the precise, binary definition of "did it happen?"

## 6. Steal and force: buffer-pool policies

The WAL interacts with two buffer-pool policy choices that define how
flexible page writes can be:

- **Steal vs no-steal**: may the buffer pool flush a dirty page belonging
  to an **uncommitted** transaction ("steal" its frame)? **Steal** = yes
  (flexible, less memory pressure) — but then a crash could leave
  uncommitted changes on disk, requiring **undo** at recovery.
- **Force vs no-force**: must *all* a transaction's dirty pages be flushed
  at commit ("force")? **No-force** = no (fast commits) — but then a crash
  could lose committed changes not yet flushed, requiring **redo**.

Real databases choose **steal + no-force** — the most flexible and
performant combination — which is precisely why they need **both undo and
redo** at recovery, and why log records carry **both** before- and
after-images. The policy choice and the log design are two sides of one
coin.

## 7. Performance: group commit and sequential I/O

The WAL is on the commit critical path (every commit flushes the log), so
databases optimize it hard:

- **Sequential writes**: the log is append-only, so writes are sequential
  — the fastest disk pattern.
- **Group commit**: instead of one disk flush per commit, **batch**
  several transactions' commit records and flush them together in one I/O.
  Under load this amortizes the flush cost across many commits — a huge
  throughput win.
- **Dedicated log device**: putting the WAL on its own disk keeps its
  sequential stream from contending with random data-page I/O.

These make the "flush the log at commit" cost manageable even at high
transaction rates. The WAL turns out to be not just *safe* but *fast*,
which is why it's universal.

## 8. The log as the source of truth

Step back to the profound consequence: the WAL is, in a real sense, the
**authoritative record** of the database's state. The data pages are
almost a *cache* of the log's effects — if they're lost or stale, they can
be reconstructed by replaying the log. This reframing powers far more than
local recovery:

- **Replication** ([Chapter 18](/database/part-6-distributed/replication))
  ships the WAL to replicas, which replay it to stay in sync — the log
  *is* the change stream.
- **Point-in-time recovery** replays the log up to a chosen moment.
- **Change data capture** and event streaming tap the log.
- LSM-trees ([Chapter 6](/database/part-2-storage-engines/lsm-trees)) use a
  WAL for their memtable, and the whole **log-structured** family treats
  the log as primary.

"The log is the database; the tables are a materialized view of it" is a
deep and increasingly mainstream idea. Recovery — turning the log back
into correct data pages after a crash — is the next chapter.

> :weightliftinggoose: The WAL is the durability cornerstone, and its rule
> is one line: **log the change to disk before the data page, and before
> commit returns.** Because the log is a **sequential append**, this is
> fast — and it makes the log, not the lazily-written data pages, the
> durable truth. Each record carries **redo** (after-image) and **undo**
> (before-image) info, ordered by **LSN**; **commit = the COMMIT record is
> flushed**. The **steal + no-force** buffer policy is why you need both
> undo and redo at recovery. See the log as the database's source of
> truth — it powers recovery, replication, and event streaming alike.

## What we covered

- Durability conflicts with the buffer pool's **lazy** data-page writes: a
  committed change may still be in RAM at crash time.
- The **write-ahead rule**: the **log record** of a change reaches disk
  **before** the data page, and a transaction's log records reach disk
  **before** commit returns.
- The log is an **append-only, sequential** stream — fast to flush — so it,
  not the random data pages, is the durable artifact.
- Each **log record** carries **redo** (after-image) and **undo**
  (before-image) info, a txn ID, page ID, and an **LSN**.
- The **LSN** orders the log; each page stores its **`pageLSN`**, enabling
  idempotent redo and enforcing the write-ahead rule.
- **Commit = flush the COMMIT record to disk**; the on-disk COMMIT record
  is the binary definition of "did it happen."
- **Steal + no-force** buffer policy (used in practice) requires **both
  undo and redo** at recovery.
- **Group commit** and sequential I/O keep the WAL fast; the log is the
  **source of truth** behind recovery, **replication**, and event
  streaming.

## What's next

[Chapter 17](/database/part-5-durability/crash-recovery) — crash recovery
with ARIES. After a crash, the database must replay the log to restore a
correct state: the three phases (**analysis, redo, undo**), **checkpoints**
to bound the work, and how redo is made **idempotent** so recovery itself
can crash and be retried safely.
