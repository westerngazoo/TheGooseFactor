---
sidebar_position: 1
title: "Columnar Storage and OLAP"
---

# Columnar Storage and OLAP

> The analytical half of the database world. When you need to scan
> *millions* of rows to compute "total revenue by region by month," the
> row-oriented storage of [Parts I–VI](/database/table-of-contents) is the
> wrong shape. **Column stores** flip the layout — store each column
> contiguously — unlocking huge **compression**, scan-only-what-you-need
> I/O, and the vectorized execution of the next chapter. This is OLAP, and
> it's a different database.

Welcome to Part VII. The [core course](/database/table-of-contents) built
an OLTP database — row storage, B-trees, point lookups, transactions. But
[Chapter 1](/database/part-1-foundations/why-databases) flagged a second
world: **OLAP**, analytical processing, with utterly different needs. This
part is that world — columnar storage, vectorized/compiled execution,
specialized indexes, and streaming — the systems behind analytics, search,
and data warehouses.

## 1. OLTP vs OLAP, sharpened

Recall the two workloads ([Chapter 1](/database/part-1-foundations/why-databases)):

- **OLTP** (transactional): many small operations touching **few rows** —
  "fetch user 42," "place an order." Latency-critical, write-heavy, ACID.
  Row storage, B-trees ([Chapter 5](/database/part-2-storage-engines/b-trees)).
- **OLAP** (analytical): few huge queries scanning **millions of rows**,
  reading **few columns**, to **aggregate** — "sum(revenue) GROUP BY region,
  month." Throughput-critical, read-mostly, scan-heavy.

```sql
-- OLTP: touches one row, all its columns
SELECT * FROM users WHERE id = 42;
-- OLAP: touches millions of rows, two columns
SELECT region, SUM(revenue) FROM sales GROUP BY region;
```

These are so different that they want **different storage**. The OLAP query
reads 2 of maybe 50 columns, but *all* the rows — exactly the opposite
access pattern from OLTP. Row storage serves the first; column storage
serves the second.

## 2. The problem with row storage for analytics

A row store ([Chapter 3](/database/part-1-foundations/storage-on-disk))
packs each row's columns together on a page. For the OLAP query above —
`SUM(revenue)` over millions of rows — that's catastrophic:

```
row storage (one row per box, all columns together):
[id|name|region|...|revenue|...]  [id|name|region|...|revenue|...]  ...
   to read `revenue` and `region`, you must read EVERY column of EVERY row
```

To sum `revenue`, the engine reads **every page** — dragging in `name`,
`email`, and 46 other columns it doesn't need — because they're physically
interleaved with `revenue`. You pay I/O for ~50 columns to use 2. For a
billion-row scan, that's ~25× wasted I/O ([Chapter 3](/database/part-1-foundations/storage-on-disk)
counts I/O as the cost). Row storage is optimized for "give me this whole
row," which is the OLTP need, not the OLAP one.

## 3. Column storage: the flip

A **column store** stores each column **contiguously** — all the
`revenue` values together, all the `region` values together, separate from
each other:

```
column storage (one column per run):
revenue:  [120, 95, 200, 75, 300, ...]        ← all revenue, contiguous
region:   ['EU', 'US', 'EU', 'AS', 'US', ...] ← all region, contiguous
name:     ['Ada', 'Lin', ...]                  ← not read for this query
```

Now `SUM(revenue) GROUP BY region` reads **only** the `revenue` and
`region` columns — the other 48 are never touched. For a wide table and a
narrow query, that alone is a massive I/O reduction. The trade is exact:
column storage makes "scan a few columns over many rows" cheap (OLAP) and
"read one whole row" expensive (OLTP) — the mirror image of row storage.

> :nerdygoose: This is the single most important idea in analytical
> databases, and it's almost embarrassingly simple: *store the table by
> column instead of by row.* Everything else — the compression, the
> vectorized execution, the speed — flows from that one layout change.
> Because an analytical query reads few columns but most rows, putting each
> column together means you read **only the data the query needs**, and
> (next section) **values of the same type and meaning sit adjacent**,
> which compresses spectacularly. The row-vs-column decision is the
> fork that splits the database world into OLTP and OLAP, and it's just
> "which dimension is contiguous."

## 4. Compression: the killer benefit

Storing a column together means storing **many similar values adjacent** —
and similar values compress *dramatically*. This is column storage's
second, often bigger, win:

- **Run-length encoding (RLE)**: a sorted or low-cardinality column
  (`region`: EU, EU, EU, US, US...) becomes `(EU, 3), (US, 2), ...` —
  often 10–100×.
- **Dictionary encoding**: map distinct values to small integer codes
  (`'EU'→0, 'US'→1`), store the codes; great for strings with few distinct
  values.
- **Bit-packing**: if a column's values fit in 10 bits, don't use 32 —
  pack them tight.
- **Delta / frame-of-reference**: store differences from a base (sorted
  timestamps, IDs) — small deltas pack tiny.

```
region column: EU,EU,EU,US,US,US,US,EU  →  RLE: (EU,3)(US,4)(EU,1)
```

Row storage can't do this nearly as well — adjacent values are *different
columns* (an int next to a string next to a bool), so there's no
similarity to exploit. Column compression routinely shrinks analytical data
3–10× **and** reads less from disk **and** keeps more in cache. Less I/O,
less memory, faster scans — compounding wins, all from the layout.

## 5. Late materialization

Column stores reorganize *when* they reconstruct rows. **Late
materialization** keeps data in columnar, compressed form as deep into
query execution as possible, operating on compressed columns directly and
only assembling rows (tuples) at the very end:

```
filter region='EU' on the compressed region column → a bitmap of matching rows
   apply that bitmap to the revenue column → sum only matching revenues
   (never reconstruct full rows; never touch the other 48 columns)
```

By staying columnar, the engine can operate on **encoded** data (e.g. sum
RLE runs without decoding, filter on dictionary codes), use SIMD over
tight value arrays ([Chapter 25](/database/part-7-analytics/vectorized-and-compiled-execution)),
and skip reconstruction entirely for columns the query never outputs. Late
materialization is why columnar execution is fast, not just columnar
storage — the whole pipeline stays in the efficient representation.

## 6. The downsides: why not always columnar?

Column storage is terrible at exactly what OLTP needs:

- **Point lookups / full-row reads**: fetching one whole row means
  gathering one value from *each* column's separate location — scattered
  reads, the opposite of a row store's single-page fetch.
- **Inserts**: adding one row means appending to *every* column's storage —
  and updating compressed/sorted columns is expensive (you can't cheaply
  insert into an RLE run).
- **Updates/deletes**: in-place mutation fights compression; column stores
  often use append + tombstones + background compaction
  ([Chapter 6](/database/part-2-storage-engines/lsm-trees)-style), batching
  changes rather than mutating in place.
- **Transactions**: row-level ACID is harder; many column stores are
  append-mostly / bulk-load oriented.

So columnar is for **read-mostly, bulk-loaded, scan-heavy** analytical data,
not transactional workloads. The classic pattern: OLTP runs on a row store;
data is periodically **loaded** into a columnar warehouse for analytics —
two systems, each in its lane.

## 7. The columnar ecosystem

Column storage powers the analytical database landscape:

- **Data warehouses**: Snowflake, Amazon Redshift, Google BigQuery, Vertica
  — columnar, massively-parallel, built for analytics at scale.
- **Embedded/OLAP engines**: **DuckDB** (the "SQLite of analytics"),
  ClickHouse (blazing columnar OLAP) — columnar execution you can run
  locally.
- **Columnar file formats**: **Apache Parquet**, ORC — columnar storage as
  *files* on object storage, the foundation of data lakes
  ([Chapter 31](/database/part-8-in-practice/modern-architectures)).
- **The lineage**: the research line from MonetDB and C-Store (Stonebraker
  et al.) established columnar + compression + vectorization as the
  analytical architecture.

When you query a data warehouse, hit a `.parquet` file, or run DuckDB,
you're using column storage — and the speed you feel on a billion-row
aggregation is the layout of this chapter plus the execution of the next.

## 8. Toward hybrid: HTAP

The two-systems reality (OLTP row store + OLAP column store, with ETL
between) has real costs: data duplication, sync lag, operational
complexity. The frontier is **HTAP** (Hybrid Transactional/Analytical
Processing) — *one* system serving both, often by keeping a row store for
writes and a column store for reads, kept in sync internally:

- Some systems maintain **both** layouts (a row store for OLTP + an
  in-memory or secondary column store for analytics, updated from the same
  writes).
- Others use a **hybrid storage** format (PAX-style: row groups stored
  columnar within a page).

HTAP ([Chapter 31](/database/part-8-in-practice/modern-architectures))
chases the dream of "transact and analyze on the same fresh data, no ETL" —
and it's a recurring theme in modern architectures. For now, the key
takeaway: **layout follows workload** — row for transactions, column for
analytics — and the most powerful analytical systems are columnar to the
core.

> :weightliftinggoose: The OLAP world starts with one flip: **store by
> column, not by row.** Because analytical queries read **few columns over
> many rows**, columnar storage reads only what's needed *and* compresses
> hugely (**RLE**, **dictionary**, **bit-packing**, **delta**) because
> like-values sit adjacent — compounding I/O, memory, and cache wins.
> **Late materialization** keeps data compressed through execution. The
> catch: columnar is read-mostly/bulk-load — bad at point lookups, inserts,
> and updates — so OLTP stays row-based and data is loaded into columnar
> warehouses (Snowflake, BigQuery, DuckDB, Parquet). Layout follows
> workload; **HTAP** chases doing both at once.

## What we covered

- **OLTP** (few rows, all columns, write-heavy) vs **OLAP** (many rows,
  few columns, aggregate, read-heavy) want **different storage**.
- **Row storage** forces analytical scans to read **every column of every
  row** — massive wasted I/O for narrow-column aggregations.
- **Column storage** stores each column **contiguously**, so a query reads
  **only the columns it needs**.
- **Compression** is the killer benefit: adjacent like-values enable
  **RLE, dictionary, bit-packing, delta** encoding (3–10×+), cutting I/O,
  memory, and cache pressure.
- **Late materialization** stays columnar/compressed through execution
  (operate on encoded data, reconstruct rows last) — the basis of fast
  columnar execution.
- Columnar is **bad for OLTP** (point lookups, inserts, updates,
  transactions) — it's for read-mostly, bulk-loaded analytics.
- The ecosystem: warehouses (Snowflake/Redshift/BigQuery), engines
  (DuckDB/ClickHouse), formats (**Parquet**), the MonetDB/C-Store lineage.
- **HTAP** chases one system for both OLTP and OLAP — layout follows
  workload.

## What's next

[Chapter 25](/database/part-7-analytics/vectorized-and-compiled-execution)
— vectorized and compiled execution. Columnar *storage* needs columnar
*execution*: the Volcano model of
[Chapter 11](/database/part-3-query-processing/execution) is too slow for
analytics, so engines process data in **batches (vectors)** or **compile
the query to machine code** — squeezing out the per-row interpretation
overhead.
