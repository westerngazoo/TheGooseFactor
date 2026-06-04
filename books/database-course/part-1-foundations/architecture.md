---
sidebar_position: 2
title: "The Anatomy of a Database"
---

# The Anatomy of a Database

> A map before the journey. Every serious database is built in **layers** —
> from the SQL you type down to the bytes on disk — and a request flows
> down through them and back up. Knowing the layers, and which problem
> each solves, turns the rest of the course into "filling in a map you
> already have."

[Chapter 1](/database/part-1-foundations/why-databases) covered the
guarantees; now the structure that delivers them. Databases are big, but
they're not monolithic — they're a stack of well-separated components,
each with a clear job and a clear interface to its neighbors. This chapter
is the architectural overview that the rest of the course details.

## 1. The layered architecture

A query flows **down** the stack and results flow back **up**:

```
        SQL query text
              │
   ┌──────────▼───────────┐
   │  1. Query parser      │  text → syntax tree
   ├──────────────────────┤
   │  2. Planner/optimizer │  tree → efficient query plan
   ├──────────────────────┤
   │  3. Execution engine  │  run the plan (scans, joins, ...)
   ├──────────────────────┤
   │  4. Access methods    │  indexes (B-trees), table heaps
   ├──────────────────────┤
   │  5. Buffer pool       │  cache pages in memory
   ├──────────────────────┤
   │  6. Storage manager   │  read/write pages to disk
   └──────────▼───────────┘
              │
          disk (files)

   Cross-cutting: Transaction manager + Lock manager + Log manager (WAL)
```

Each layer depends only on the one below it and exposes a clean interface
above. This separation is what makes a database *buildable* and
*understandable* — and it mirrors the course's parts almost exactly.

## 2. The query layer: parser, planner, executor

The top three layers turn SQL into action
([Part III](/database/part-3-query-processing/relational-model-and-sql)):

- **Parser** — turns SQL *text* into a structured **abstract syntax
  tree**, checking syntax and resolving names against the schema
  ([Chapter 9](/database/part-3-query-processing/parsing-and-planning)).
- **Planner / optimizer** — converts the tree into a **query plan**: a
  tree of physical operators (scan this index, join these tables this
  way), choosing the cheapest among many equivalent plans
  ([Chapter 10](/database/part-3-query-processing/query-optimization)).
- **Execution engine** — runs the plan, pulling rows through operators
  (scan → filter → join → sort → output),
  ([Chapter 11](/database/part-3-query-processing/execution)).

This is the "declarative bargain" of
[Chapter 1](/database/part-1-foundations/why-databases) made concrete:
parser understands *what*, planner decides *how*, executor *does* it.

## 3. The storage layer: access methods, buffer pool, disk

The bottom three layers manage data on disk
([Part II](/database/part-2-storage-engines/storage-engine)):

- **Access methods** — the structures that find and store rows: the
  **table heap** (where rows live) and **indexes** like **B-trees**
  ([Chapter 5](/database/part-2-storage-engines/b-trees)) that locate
  them fast.
- **Buffer pool** — an in-memory cache of disk **pages**
  ([Chapter 7](/database/part-2-storage-engines/buffer-pool)); since disk
  is slow, the database keeps hot pages in RAM and manages eviction.
- **Storage manager** — the lowest layer: reads and writes fixed-size
  **pages** to and from disk files
  ([Chapter 3](/database/part-1-foundations/storage-on-disk)).

Everything above ultimately becomes "read page X, write page Y." The
*page* is the universal currency between memory and disk — remember that
unit; it recurs constantly.

## 4. The cross-cutting layer: transactions, locks, logging

Three components don't fit neatly in the stack because they touch *every*
layer — they're the machinery behind ACID
([Part IV](/database/part-4-transactions/transactions-and-acid),
[Part V](/database/part-5-durability/write-ahead-log)):

- **Transaction manager** — tracks each transaction's begin/commit/abort
  and coordinates atomicity and isolation.
- **Lock manager** (or MVCC machinery) — controls concurrent access so
  transactions don't corrupt each other
  ([Chapter 13](/database/part-4-transactions/concurrency-control)).
- **Log manager** — the **write-ahead log**, recording every change so
  the database can recover after a crash and roll back aborts
  ([Chapter 16](/database/part-5-durability/write-ahead-log)).

These weave through the whole system: a write goes through the executor,
acquires a lock, logs its change, and modifies a buffer-pool page — four
components for one update. ACID is a *system* property, not a single
module.

## 5. Following a SELECT down and back up

Trace `SELECT name FROM users WHERE id = 42`:

1. **Parser** builds a syntax tree and checks `users` and `name` exist.
2. **Optimizer** sees `id = 42` and a primary-key index on `id`; it picks
   an *index lookup* plan over a full table scan.
3. **Executor** runs the plan: ask the **B-tree index** for the row with
   `id = 42`.
4. **Access method** walks the B-tree, arriving at "the row is in page
   17."
5. **Buffer pool**: is page 17 in memory? If yes, return it; if not, ask
   the storage manager to read it from disk into a free frame.
6. **Executor** extracts `name` from the row and returns it.

Six layers for one tiny query — and that's the *fast* path (an index hit,
a cached page). Now you can see *where* "why is this slow?" lives: a
missing index (step 2 picks a scan), a cold cache (step 5 hits disk), a
bad plan (step 2 chooses poorly).

## 6. Following an UPDATE: the write path

A write is more involved, because durability and atomicity kick in. For
`UPDATE accounts SET balance = balance - 100 WHERE id = 7`:

1. Parse, plan, locate the row (as above).
2. **Lock** the row (or create a new version under MVCC) so no one else
   corrupts it.
3. **Log** the change to the **WAL** *first* — before touching the data —
   so the change survives a crash (write-ahead!).
4. Modify the row in the **buffer-pool** page in memory (now "dirty").
5. On **commit**, ensure the WAL record is flushed to disk; the dirty
   data page can be written back later.

Notice the order: **log before data**, and the *log* (not the data page)
is what must hit disk to commit. That single discipline — write-ahead
logging — is how a database is both *fast* (data pages written lazily)
and *durable* (the log guarantees recovery). Part V is devoted to it.

> :nerdygoose: A theme you'll see everywhere: the database avoids slow
> random disk writes on the critical path by writing to a **sequential
> log** instead, and deferring the random data-page writes. Disk (even
> SSD) loves sequential I/O and hates random I/O, so "append to the log
> now, update the data later" is both faster *and* the foundation of
> crash recovery. Many database design decisions are, at heart, "turn
> random writes into sequential ones." Keep that lens handy.

## 7. Memory vs disk: the central tension

The reason for half the complexity in a database is one hardware fact:
**disk is vastly slower than memory** (and historically, random disk I/O
is dramatically slower than sequential). The whole storage stack exists to
manage this gap:

- Data lives on **disk** (durable, large, slow), organized into **pages**.
- The **buffer pool** caches hot pages in **memory** (fast, small,
  volatile).
- Algorithms are chosen to **minimize disk I/O** — that's *why* B-trees
  (shallow, few page reads) and the page-based design exist
  ([Chapter 3](/database/part-1-foundations/storage-on-disk)).

In-memory data structures optimize for CPU cycles; database structures
optimize for *page accesses*. This shift — counting disk I/Os, not
instructions — is the mental adjustment for thinking about database
internals, and we'll make it explicit in the next chapter.

## 8. The map for the rest of the course

The layers line up with the parts almost one-to-one:

- **Storage manager + access methods + buffer pool** →
  [Part II](/database/part-2-storage-engines/storage-engine).
- **Parser + optimizer + executor** →
  [Part III](/database/part-3-query-processing/relational-model-and-sql).
- **Transaction + lock managers** →
  [Part IV](/database/part-4-transactions/transactions-and-acid).
- **Log manager + recovery** →
  [Part V](/database/part-5-durability/write-ahead-log).
- **Beyond one machine** →
  [Part VI](/database/part-6-distributed/replication).

Keep this map in mind. When we go deep on, say, B-tree node splits, you'll
know it lives in the access-methods layer, sits on the buffer pool, and
serves the executor above. The detail will never be unmoored from the
whole.

> :weightliftinggoose: Memorize the stack — **parser → planner → executor
> → access methods → buffer pool → storage**, with **transactions, locks,
> and the log** cutting across — and the whole course becomes filling in a
> map you already hold. Practice by tracing a `SELECT` (read path) and an
> `UPDATE` (write path, log-before-data) through the layers until it's
> automatic. The single most important habit: think in **pages and disk
> I/Os**, not bytes and instructions. Everything downstairs is built to
> touch the disk as little as possible.

## What we covered

- A database is built in **layers**; a query flows **down** and results
  flow **up**.
- **Query layer**: parser (text → tree), planner/optimizer (tree → plan),
  executor (runs the plan) — Part III.
- **Storage layer**: access methods (heaps, B-tree indexes), buffer pool
  (page cache), storage manager (page I/O) — Part II.
- **Cross-cutting**: transaction manager, lock manager (/MVCC), and the
  **write-ahead log** deliver ACID — Parts IV–V.
- A **SELECT** traces six layers (index → B-tree → page → buffer pool);
  an **UPDATE** adds locking and **log-before-data** for durability.
- The recurring trick: turn **random writes into sequential** (the log)
  and defer data-page writes.
- The central tension is **memory vs disk**; database algorithms minimize
  **disk I/Os**, the unit being the **page**.

## What's next

[Chapter 3](/database/part-1-foundations/storage-on-disk) — storage on
disk. We descend to the bottom layer: how bytes become **pages**, how
**records** are packed into pages, and the memory-hierarchy facts that
make the page the fundamental unit of a database.
