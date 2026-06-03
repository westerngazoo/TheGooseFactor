---
sidebar_position: 4
title: "Modern Architectures"
---

# Modern Architectures

> The frontier — and the capstone. Cloud computing is reshaping what a
> database *is*: **separating compute from storage** so they scale
> independently, **serverless** databases that scale to zero, **NewSQL**
> that finally delivers ACID *and* horizontal scale, **HTAP** that unifies
> transactions and analytics, and the **lakehouse** that brings ACID to data
> lakes. This chapter surveys where databases are going — and ties the whole
> expanded course together.

We close with the modern frontier. The classic database
([Parts I–VI](/database/table-of-contents)) bundled storage, compute, and a
log on one machine (or a tightly-coupled cluster). The cloud is *unbundling*
that — and recombining the pieces in ways that resolve old trade-offs. Every
idea here builds on the mechanisms you've learned; the frontier isn't new
physics, it's new *arrangements* of storage engines, logs, consensus, and
replication.

## 1. The cloud changes the constraints

Classic database design assumed **local disks** and **fixed machines**. The
cloud changes the ground rules:

- **Object storage** (S3, GCS) is cheap, infinite, durable (11 nines), and
  shared — but slower and higher-latency than local disk.
- **Compute is elastic and ephemeral** — spin up 100 machines for a query,
  kill them after; pay per second.
- **The network is fast** — fast enough that "storage on a remote service"
  is viable where it wasn't.

These shifts invalidate the old assumption that storage and compute live
*together* on a machine. If storage is a cheap, durable, shared service and
compute is elastic, why couple them? That question drives the defining
modern architecture (§2). The cloud didn't change *what* a database must do
(store, query, transact, recover); it changed the *substrate*, and the
architectures followed.

## 2. Separation of compute and storage

The signature modern architecture: **disaggregate** storage and compute into
independent, separately-scalable layers:

```
classic:  [ compute + storage + log ]  all on one node (coupled)
modern:   [ elastic compute nodes ]  ←→  [ shared durable storage (S3/etc.) ]
              scale independently
```

- **Storage layer**: durable, shared (often object storage), holds the data
  and often the **log** ([Chapter 16](/database/part-5-durability/write-ahead-log)).
- **Compute layer**: stateless (or cache-only) nodes that read from shared
  storage, scale **independently** of data size, spin up/down on demand.

The payoffs are large: **scale compute and storage separately** (a huge
dataset queried rarely needs lots of storage, little compute; a small
dataset queried heavily needs the reverse); **elastic compute** (add query
power instantly, pay only while using it); **cheap, infinite storage**;
**fast clones** (copy-on-write the storage layer). **Snowflake** pioneered
this for warehouses; **Amazon Aurora** applies it to OLTP (notably by
pushing the **redo log** down into the storage layer — "the log is the
database" ([Chapter 16](/database/part-5-durability/write-ahead-log)) made
architectural); **BigQuery** separates storage and compute for analytics.
This decoupling is the single biggest shift in modern database
architecture.

> :nerdygoose: Separation of compute and storage is the cloud's answer to a
> tension as old as [Chapter 2](/database/part-1-foundations/architecture):
> the database bundled storage and compute because disks were local and
> machines were fixed. Once storage became a cheap, durable, *shared
> service* and compute became *elastic*, that bundle stopped making sense —
> and unbundling it dissolved trade-offs that seemed fundamental. You no
> longer choose between "enough storage" and "enough compute"; you scale
> each to its own need. Aurora's move — sending only the **WAL** to a smart
> storage layer that materializes pages from the log — is the deepest
> expression yet of "the log is the source of truth"
> ([Chapter 16](/database/part-5-durability/write-ahead-log)): the database
> *is* its log, and the storage layer is a service that replays it. The
> oldest idea in the course becomes the newest architecture.

## 3. Serverless databases

Push elastic compute to its conclusion and you get **serverless** databases:
no provisioned servers to manage, compute that **scales to zero** when idle
and up on demand, billed **per use**:

- **Aurora Serverless**, **Neon** (serverless Postgres), **PlanetScale**
  (serverless MySQL), **CockroachDB Serverless**, DynamoDB on-demand.
- Built on compute/storage separation (§2): because storage is independent
  and durable, compute can **suspend entirely** when there's no traffic and
  resume on the next query — paying nothing while idle.

This suits spiky, unpredictable, or low-traffic workloads (dev/test
databases, per-tenant databases, bursty apps) where paying for an
always-on provisioned server is wasteful. Serverless is compute/storage
separation turned into an *operational* model: you stop thinking about
"how big a database server" and just use one that materializes when needed.
It's the database following the same serverless trend as compute (Lambda)
and storage (S3).

## 4. NewSQL: ACID at scale

For decades there was a painful choice ([Chapter 18](/database/part-6-distributed/replication)):
**traditional SQL** (ACID, consistency, but hard to scale writes
horizontally) *or* **NoSQL** (horizontal scale, but giving up ACID/joins/
strong consistency). **NewSQL** refuses the choice — distributed databases
that provide **ACID transactions and SQL at horizontal scale**:

- **Google Spanner** — globally-distributed, strongly-consistent SQL, using
  **TrueTime** (GPS/atomic-clock-synchronized time) to order transactions
  globally.
- **CockroachDB, TiDB, YugabyteDB** — open-source distributed SQL, ACID
  across shards.

How they do it combines everything in [Part VI](/database/part-6-distributed/replication):
**shard** the data ([Chapter 19](/database/part-6-distributed/partitioning)),
**replicate each shard via consensus** (Raft/Paxos,
[Chapter 20](/database/part-6-distributed/consensus-and-distributed-transactions))
for consistency and availability, and use **distributed transactions** (2PC
over consensus, [Chapter 20](/database/part-6-distributed/consensus-and-distributed-transactions))
for cross-shard atomicity, with synchronized clocks (TrueTime / hybrid
logical clocks) to order transactions. NewSQL is the *synthesis* of the
distributed mechanisms you learned — sharding + per-shard consensus +
distributed transactions — delivering the old SQL/ACID guarantees on a
horizontally-scalable substrate. It's [Part VI](/database/part-6-distributed/replication),
productized.

## 5. HTAP: transactions and analytics together

Recall the OLTP/OLAP split that forced **two systems** plus ETL between them
([Chapter 24](/database/part-7-analytics/columnar-and-olap)): a row store for
transactions, a column store for analytics, with data copied between. **HTAP**
(Hybrid Transactional/Analytical Processing) chases **one** system serving
both on **fresh** data:

- Keep a **row store** for OLTP writes and a **column store**
  ([Chapter 24](/database/part-7-analytics/columnar-and-olap)) for OLAP
  reads, kept in sync *internally* from the same writes (no external ETL).
- Run analytics on **near-real-time** transactional data — no waiting for a
  nightly load.
- Systems: TiDB (with TiFlash columnar replicas), SingleStore,
  SAP HANA, Snowflake Unistore.

HTAP's appeal is eliminating the **two-systems tax** — the duplication, the
sync lag, the operational burden of separate OLTP and OLAP stores. It often
uses the compute/storage separation (§2) and per-shard replicas (some row,
some columnar) to serve both workloads. It's the convergence of
[Parts I–VI](/database/table-of-contents) (OLTP) and
[Part VII](/database/part-7-analytics/columnar-and-olap) (OLAP) into one
system — the analytical and transactional halves of this course, reunited.

## 6. The lakehouse

The analytics world had its own split: rigid **data warehouses** (fast,
structured, expensive) vs cheap, flexible **data lakes** (raw files on object
storage — but no ACID, no schema, no fast queries). The **lakehouse** merges
them — warehouse capabilities *on* lake storage:

- **Open table formats** — **Apache Iceberg**, **Delta Lake**, **Apache
  Hudi** — add a metadata/transaction layer over columnar files (Parquet,
  [Chapter 24](/database/part-7-analytics/columnar-and-olap)) on object
  storage, bringing **ACID transactions**, **schema evolution**
  ([Chapter 29](/database/part-8-in-practice/schema-design-and-evolution)),
  **time travel** (query past snapshots), and updates/deletes to data lakes.
- Multiple engines (Spark, Trino, DuckDB, Snowflake) query the *same* open
  data — no lock-in, no copying into a proprietary warehouse.

The lakehouse is ACID-on-object-storage — the durability, transactions, and
schema discipline of [Parts I–V](/database/table-of-contents), applied to
cheap shared files via a clever metadata layer. It shows the course's
concepts (ACID, MVCC snapshots for time travel, schema evolution) escaping
the traditional database and reappearing on the data lake.

## 7. The recurring threads

Notice that *every* modern architecture recombines mechanisms you already
know — the frontier is new *arrangements*, not new fundamentals:

- **The log is the source of truth** ([Chapter 16](/database/part-5-durability/write-ahead-log))
  → Aurora's log-as-storage, CDC streams
  ([Chapter 27](/database/part-7-analytics/streaming-and-materialized-views)),
  Kappa architectures, lakehouse transaction logs.
- **Consensus** ([Chapter 20](/database/part-6-distributed/consensus-and-distributed-transactions))
  → NewSQL per-shard replication, coordination services.
- **Columnar + vectorized** ([Chapters 24–25](/database/part-7-analytics/columnar-and-olap))
  → warehouses, HTAP's analytical side, the lakehouse.
- **MVCC snapshots** ([Chapter 14](/database/part-4-transactions/mvcc))
  → lakehouse "time travel," serverless isolation.
- **Separation of concerns / layering** ([Chapter 2](/database/part-1-foundations/architecture))
  → compute/storage disaggregation itself.

The frontier isn't a different field — it's *your* field, rearranged for the
cloud. Which is exactly why building the database from scratch was worth it:
you can read any new system as a recombination of storage engines, logs,
consensus, MVCC, and columnar execution, and *understand* it.

## 8. The expanded course, complete

That closes Part VIII and the whole expanded course. Look at the full arc:

- **[Parts I–VI](/database/table-of-contents)**: the complete OLTP database
  — storage, queries, transactions, recovery, distribution.
- **[Part VII](/database/part-7-analytics/columnar-and-olap)**: the
  analytical world — columnar storage, vectorized/compiled execution,
  specialized indexes, streaming and materialized views.
- **[Part VIII](/database/part-8-in-practice/indexing-and-query-tuning)**:
  databases in practice — query tuning, schema design and evolution, scaling
  and caching, and these modern architectures.

You set out ([Chapter 1](/database/part-1-foundations/why-databases)) to open
the black box behind `SELECT * FROM users WHERE id = 42`. You can now trace
that query through every layer — *and* explain a columnar warehouse, a
vector search, a streaming pipeline, a query-tuning session, a zero-downtime
migration, and a cloud-native NewSQL database — all as recombinations of the
same concrete mechanisms. The black box isn't just open; you can read any
database, classic or frontier, as a particular arrangement of ideas you
understand from the ground up. That's the whole point of building from
scratch. Now go build a database — or, just as valuable, *use* one with the
insight of someone who could.

> :weightliftinggoose: The frontier is **old mechanisms, rearranged for the
> cloud**. The defining shift: **separate compute from storage** (scale each
> independently; Snowflake, Aurora pushing the **WAL** into storage) →
> **serverless** (scale to zero, pay per use). **NewSQL** (Spanner,
> CockroachDB) delivers **ACID + SQL at horizontal scale** by combining
> [Part VI](/database/part-6-distributed/replication): sharding + per-shard
> consensus + distributed transactions. **HTAP** unifies OLTP + OLAP on
> fresh data; the **lakehouse** (Iceberg/Delta) brings **ACID to data
> lakes**. Every one recombines what you built — the log, consensus,
> columnar, MVCC, layering. Building from scratch is what lets you *read*
> any of them. The black box is open, classic to frontier.

## What we covered

- The **cloud** changed the substrate: cheap/durable/shared **object
  storage**, **elastic ephemeral compute**, fast networks — invalidating
  the old "storage + compute on one machine" assumption.
- **Separation of compute and storage**: independent scaling, elastic
  compute, cheap storage, fast clones — Snowflake (warehouse), **Aurora**
  (OLTP, **log pushed into storage**), BigQuery. The defining modern shift.
- **Serverless databases** (Aurora Serverless, Neon, PlanetScale) **scale to
  zero**, bill per use — built on compute/storage separation.
- **NewSQL** (Spanner, CockroachDB, TiDB) delivers **ACID + SQL at
  horizontal scale** = sharding + **per-shard consensus** + distributed
  transactions ([Part VI](/database/part-6-distributed/replication)) +
  synchronized clocks.
- **HTAP** runs OLTP + OLAP on one fresh dataset (row + columnar internally)
  — eliminating the two-systems ETL tax.
- The **lakehouse** (Iceberg, Delta, Hudi) brings **ACID, schema evolution,
  and time travel** to columnar files on **object storage**.
- Every modern architecture **recombines** the course's mechanisms (the
  log, consensus, columnar, MVCC, layering) — the frontier is new
  arrangements, not new fundamentals.
- The course is complete: you can read any database — classic or frontier —
  as an arrangement of ideas you understand from the ground up.

## What's next

That's the full, expanded course — from a single page on a disk to the
cloud-native frontier. Revisit the [introduction](/database/) and the
[roadmap](/database/table-of-contents), and lean on the appendix: a
[cheat sheet](/database/appendix/cheat-sheet), a
[glossary](/database/appendix/glossary), and
[further reading](/database/appendix/further-reading) — the canonical books
and the classic papers (System R, ARIES, Dynamo, Raft, Spanner, C-Store).
Then do the real thing: **build a tiny database**, and read the next new
system you meet as a recombination of everything here.
