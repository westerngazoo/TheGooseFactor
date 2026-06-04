---
sidebar_position: 4
title: "Streaming and Materialized Views"
---

# Streaming and Materialized Views

> Don't recompute — maintain. Re-running an expensive aggregation on every
> dashboard load is wasteful; a **materialized view** stores the result and
> keeps it **fresh incrementally** as the underlying data changes. Push
> that idea to its limit and you get **stream processing** — standing
> computations over unbounded change streams — and **change data capture**,
> which (once again) taps the **write-ahead log** as the source of truth.

We close Part VII with *freshness*. Analytical results
([Chapters 24–26](/database/part-7-analytics/columnar-and-olap)) are
expensive to compute, and applications want them *current*. The naive
answer — re-run the query — is wasteful and slow. The better answer is to
treat a query as a **standing computation** that updates as data flows in.
This idea connects materialized views, stream processing, and the log
([Chapter 16](/database/part-5-durability/write-ahead-log)) into one
picture.

## 1. The problem: recomputation is wasteful

A dashboard showing "revenue by region this month" runs an aggregation over
millions of rows. If 100 users load it, that's 100 full scans. If the
underlying data changed by *one* order, recomputing the *whole* aggregate is
absurd — almost all the work repeats the previous answer.

```
order arrives → naive: re-scan all of `sales`, re-sum by region (millions of rows)
              → smart: just add the one order's revenue to its region's total
```

The waste is **redundant computation**: 99.999% of the result is unchanged,
but a full recompute redoes all of it. The fix is to compute the answer
*once* and then apply only the *changes* — which is exactly what
materialized views and stream processing do.

## 2. Materialized views

A **view** is a saved query (a virtual table — running it re-executes the
query). A **materialized view** stores the query's *results* physically, so
reads hit precomputed data instead of re-running the query:

```sql
CREATE MATERIALIZED VIEW revenue_by_region AS
  SELECT region, SUM(revenue) AS total FROM sales GROUP BY region;
-- reads of revenue_by_region are now instant — it's a stored table
```

The catch: the stored result goes **stale** as `sales` changes. So a
materialized view needs a **refresh** strategy — and the *quality* of that
strategy is the whole game. Full refresh (re-run the query periodically) is
simple but brings back the recomputation cost. The good strategy is
**incremental** (§3). Materialized views trade storage + refresh cost for
fast reads — worth it whenever a result is read far more than the data
changes.

## 3. Incremental view maintenance

**Incremental View Maintenance (IVM)** is the key technique: instead of
recomputing the view, **apply the deltas** — compute how each insert/update/
delete *changes* the view, and adjust the stored result:

```
order inserted (region=EU, revenue=100)
   → IVM: revenue_by_region[EU].total += 100      (O(1), not a full re-scan)
order deleted (region=US, revenue=50)
   → IVM: revenue_by_region[US].total -= 50
```

For a `SUM`, the delta is trivial (add/subtract). For `COUNT`, `MIN`/`MAX`,
joins, and complex queries, computing the correct incremental update is
harder (a deleted `MAX` may require finding the new max), but the principle
holds: **maintain, don't recompute**. IVM turns the view's refresh cost from
"proportional to the *data*" into "proportional to the *changes*" — usually a
massive win. It's an active research area and the engine behind incremental
systems (§6).

> :nerdygoose: The deep shift here is reframing a *query* as a *standing
> computation over a stream of changes*. A normal query is a function from
> the database's current state to a result, run on demand. A materialized
> view with IVM is the same function, but maintained continuously: as
> changes (a stream of inserts/deletes) flow in, the result is *kept up to
> date* with work proportional to the *change*, not the *data*. This is the
> same idea as a spreadsheet — change one cell and only dependent cells
> recompute, not the whole sheet — generalized to SQL. Once you see queries
> as standing computations fed by change streams, materialized views,
> stream processing, and reactive systems are all one concept.

## 4. Streams: unbounded data

Push IVM's "computation over a change stream" to its general form and you
get **stream processing**: computation over an **unbounded, continuous**
stream of events (clicks, sensor readings, transactions, log lines) rather
than a finite stored table. Where a database query runs over *bounded*
data at rest, a stream query runs *forever* over data in motion:

```
batch:  run query over a finite table → one result
stream: events arrive forever → continuously updated results
```

Stream processing handles "real-time" needs — fraud detection, live metrics,
alerting, ETL pipelines — where waiting to batch-load and query is too slow.
The conceptual shift: data is a *flow*, and computations are *long-running
operators* consuming that flow. Many of the database concepts you know
reappear (joins, aggregations, filters), but over infinite input, which
introduces new problems (§5).

## 5. Windows, time, and state

Unbounded streams force questions a bounded query never faces:

- **Windows**: you can't "sum all events" over an infinite stream, so you
  aggregate over **windows** — tumbling (fixed, non-overlapping), sliding,
  or session windows. "Sum revenue per 1-minute window."
- **Event time vs processing time**: events can arrive **late** or **out of
  order** (a mobile event uploaded hours later). Do you bucket by when it
  *happened* (event time, correct but needs waiting) or when it *arrived*
  (processing time, simple but wrong for late data)?
- **Watermarks**: a heuristic for "we've probably seen all events up to time
  T," letting a window *close* and emit despite the possibility of stragglers.
- **State and checkpointing**: stream operators hold **state** (running
  aggregates, window contents) that must survive failures — periodic
  **checkpoints** (echoing [Chapter 17](/database/part-5-durability/crash-recovery))
  enable exactly-once processing.

These — windowing, event-time, watermarks, stateful operators with
checkpointing — are the substance of stream processing, and they're why it's
harder than it sounds: time and failure, over infinite data.

## 6. Change Data Capture: the log strikes again

How does a stream system *get* the changes from a database? The elegant
answer reuses the deepest idea of the course: **Change Data Capture (CDC)**
taps the **write-ahead log** ([Chapter 16](/database/part-5-durability/write-ahead-log))
as a stream of every change:

```
database WAL  →  CDC reads the log  →  stream of inserts/updates/deletes
   (the same log used for recovery and replication — Ch 16, Ch 18)
```

The WAL is *already* an ordered, complete record of every change
([Chapter 16, §8](/database/part-5-durability/write-ahead-log): "the log is
the source of truth"). CDC simply *reads* it and publishes the changes as a
stream — so downstream systems (a search index, a cache, a data warehouse, a
materialized view) stay in sync without polling. Tools like **Debezium**
read database logs and feed Kafka; this is how a Postgres write propagates
to Elasticsearch and a warehouse in near-real-time. The log that powered
**recovery** ([Chapter 17](/database/part-5-durability/crash-recovery)) and
**replication** ([Chapter 18](/database/part-6-distributed/replication)) now
powers **streaming** too — three uses of one append-only change stream.

## 7. The streaming ecosystem

The systems that implement these ideas:

- **Stream platforms / engines**: Apache **Kafka** (the durable log/stream
  backbone), **Flink** and Kafka Streams / ksqlDB (stateful stream
  processing with windows and exactly-once).
- **Incremental/streaming databases**: **Materialize** (built on
  *differential dataflow* — maintains complex SQL materialized views
  incrementally in real time), RisingWave, ksqlDB — "SQL over streams with
  always-fresh results."
- **CDC**: **Debezium**, native logical replication / CDC in Postgres,
  MySQL, MongoDB.
- **The "Kappa"/streaming-first architecture**: treat the **log as the
  primary store** and derive everything (tables, indexes, caches) as
  materialized views of it — the logical end of "the log is the database."

These let you build pipelines where a change in the source database flows,
within seconds, into updated dashboards, search indexes, caches, and
warehouses — all maintained incrementally, all driven by the change stream.

## 8. Batch and stream, unified

Step back to the unifying picture that closes Part VII. There's a deep
duality:

- A **table** is the *current state* — a snapshot.
- A **stream** is the *sequence of changes* that produced that state — the
  log.

They're two views of the same information: integrate (apply) a stream of
changes and you get a table; diff two table states and you get a stream of
changes. This **table-stream duality** is the conceptual heart of modern
data systems — it's why the WAL can serve recovery, replication, *and*
streaming ([Chapter 16](/database/part-5-durability/write-ahead-log)), why
materialized views are "tables maintained from change streams," and why
"the log is the database" ([Chapter 16, §8](/database/part-5-durability/write-ahead-log))
keeps recurring. A query is a standing computation; a table is a
materialized stream; a stream is a table's change history. Analytics, kept
fresh, is just this duality applied. With it, Part VII's analytical world —
columnar storage, vectorized execution, specialized indexes, and
incremental freshness — is complete.

> :weightliftinggoose: The principle is **maintain, don't recompute**. A
> **materialized view** stores a query's result; **incremental view
> maintenance** keeps it fresh by applying **deltas** (work ∝ changes, not
> data). Push it to **stream processing**: standing computations over
> **unbounded** event streams, with **windows**, **event-time/watermarks**,
> and **checkpointed state**. The changes come from **CDC** — tapping the
> **WAL** ([Chapter 16](/database/part-5-durability/write-ahead-log)) as a
> stream (the log's *third* job after recovery and replication). The unifying
> idea: **table–stream duality** — a table is the state, a stream is its
> changes; integrate a stream to get a table, diff tables to get a stream.

## What we covered

- Re-running expensive analytical queries is **wasteful**; the fix is
  **maintain, don't recompute**.
- A **materialized view** stores a query's results for fast reads, but goes
  **stale** and needs a **refresh** strategy.
- **Incremental View Maintenance (IVM)** applies **deltas** (work
  proportional to *changes*, not *data*) — reframing a query as a standing
  computation over a change stream.
- **Stream processing** computes over **unbounded** event streams (vs
  bounded tables) — real-time fraud, metrics, ETL.
- Streams need **windows**, **event-time vs processing-time** with
  **watermarks** for late/out-of-order data, and **checkpointed state** for
  exactly-once.
- **Change Data Capture (CDC)** taps the **WAL** as a change stream (the
  log's third use after recovery and replication) — Debezium, logical
  replication.
- Ecosystem: Kafka/Flink, **Materialize** (differential dataflow), ksqlDB,
  CDC tools; the "log as primary store" architecture.
- **Table–stream duality**: a table is state, a stream is its changes —
  the conceptual heart of modern data systems.

## What's next

That's Part VII. [Part VIII](/database/part-8-in-practice/indexing-and-query-tuning)
turns from theory to the **practitioner's craft**: making real queries fast
(index strategy, reading `EXPLAIN`, statistics), schema design and
evolution, scaling and caching patterns, and the modern cloud-native
architectures that are reshaping what a database is.
