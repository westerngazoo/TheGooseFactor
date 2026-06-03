---
sidebar_position: 2
title: "Vectorized and Compiled Execution"
---

# Vectorized and Compiled Execution

> Columnar storage needs columnar execution. The one-row-at-a-time
> **Volcano model** of [Chapter 11](/database/part-3-query-processing/execution)
> drowns analytical queries in per-row overhead. Two techniques fix it:
> **vectorized execution** processes a *batch* of values per operator call,
> and **compiled execution** turns the query plan into machine code. Both
> can make analytical queries 10–100× faster.

[Chapter 24](/database/part-7-analytics/columnar-and-olap) stored data by
column; this chapter *processes* it efficiently. The Volcano iterator model
([Chapter 11](/database/part-3-query-processing/execution)) is elegant and
fine for OLTP, but for a billion-row aggregation its per-row overhead
dominates. Analytical engines replace it with one of two approaches — and
understanding them explains why DuckDB and ClickHouse feel so much faster
than a row-store doing the same scan.

## 1. The problem: per-row interpretation overhead

The Volcano model ([Chapter 11](/database/part-3-query-processing/execution))
calls `next()` once **per row** through a tree of operators. For one row,
the *actual work* (add two numbers) is tiny compared to the **overhead** of
getting there:

```
for each of 1,000,000,000 rows:
    root.next()  → join.next()  → filter.next()  → scan.next()
    ^ a virtual/indirect call per operator, per row
    ^ branch mispredictions, no SIMD, poor cache use, boxing of values
```

Per row, you pay several **virtual function calls** (one per operator),
**branch mispredictions**, and you process **one value at a time** — no SIMD,
poor instruction-cache locality. For an OLTP query (a few rows), this
overhead is invisible. For an OLAP scan of a billion rows, the *overhead*
is the whole runtime — the engine spends far more time on plumbing than on
arithmetic. The fix is to stop paying overhead per row.

## 2. Vectorized execution

**Vectorized execution** (a.k.a. *vectorized* or *batch-at-a-time*)
changes the iterator interface: each `next()` returns not one row but a
**batch (vector)** of values — typically ~1,000–10,000 — and operators
process the whole batch in a tight loop:

```
// Volcano: one value per call
filter.next() → one row

// Vectorized: a vector per call
filter.next() → a batch of 2048 values, filtered in one tight loop
   for i in 0..2048 { if predicate(col[i]) { ... } }   // no per-row dispatch
```

The overhead (the virtual call, the operator dispatch) is now paid **once
per 2048 values** instead of once per value — amortized ~2000×. And the
inner loop over a contiguous array of same-typed values is exactly what
modern CPUs love: it **auto-vectorizes to SIMD**
([cf. the Rust course's SIMD], processing 4–16 values per instruction),
predicts branches well, and streams through cache. Vectorized execution
pairs perfectly with columnar storage
([Chapter 24](/database/part-7-analytics/columnar-and-olap)): a column *is*
a vector of same-typed values, ready to batch-process.

> :nerdygoose: The vectorized insight (from the MonetDB/X100 research) is
> that the bottleneck in analytical execution isn't the *computation*, it's
> the *interpretation overhead* — and you defeat interpretation overhead the
> same way an interpreter does versus a compiler: **do more work per
> dispatch.** Processing 2048 values per operator call amortizes the
> dispatch ~2000-fold, and as a bonus the tight typed loop unlocks SIMD,
> branch prediction, and cache streaming that per-row code can't touch. It's
> the same lesson as columnar storage: analytical speed comes from
> *batching* — operate on many like things at once, not one heterogeneous
> thing at a time.

## 3. Compiled (JIT) execution

The other approach goes further: **compile the query plan into machine
code** (or efficient bytecode) at query time, eliminating interpretation
*entirely*. Instead of an interpreter walking an operator tree, the engine
**generates code** specialized to *this* query and runs it:

```
SELECT SUM(revenue) FROM sales WHERE region = 'EU'
   → generate (and JIT-compile) roughly:
       sum = 0
       for each row: if row.region == EU_code: sum += row.revenue
   → run that native loop directly — no operators, no dispatch
```

This is **data-centric code generation** (the HyPer approach, also in Spark
SQL's whole-stage codegen, and PostgreSQL's JIT): fuse the operators of a
plan into one tight compiled loop with no per-row virtual calls at all.
It's the natural extension of the compiler course's theme — the query plan
([Chapter 9](/database/part-3-query-processing/parsing-and-planning)) is an
intermediate representation, and compiling an IR to machine code is exactly
what a compiler back-end does. The query engine *becomes* a compiler.

## 4. Push vs pull

Compilation often flips the control-flow model from Volcano's **pull** to a
**push** model:

- **Pull** (Volcano): operators *pull* rows from children on demand
  (`next()` cascades downward). Natural for interpretation.
- **Push**: each operator, as it produces a value, *pushes* it to the next
  operator. Natural for compilation — generated code for a scan loop calls
  straight into the filter's code, which calls into the aggregate's, all
  fused into one function with no indirection.

```
push (compiled): for each row { filter_code(row) { aggregate_code(row) } }
   → one fused loop, no operator boundaries at runtime
```

The push model lets the compiler **fuse** a whole pipeline of operators
into a single loop over the data — the data flows through in one pass,
staying in registers/cache, with operator boundaries existing only at
compile time. This is why compiled execution can approach hand-written-C
speed for a query: the abstraction (operators) evaporates in codegen, just
like zero-cost abstractions in a systems language.

## 5. Vectorized vs compiled: the trade-off

Both beat Volcano; they trade off against each other:

- **Vectorized**: simpler to build and debug (operators still exist, just
  batch-at-a-time); great cache/SIMD behavior; no compile latency. But
  materializes intermediate vectors between operators (memory traffic), and
  has *some* per-batch dispatch. (DuckDB, ClickHouse, Velox.)
- **Compiled**: can fuse the whole pipeline into one loop (minimal
  intermediate materialization, values stay in registers); fastest in the
  limit. But pays **compilation latency** per query (bad for short queries,
  amortized only on long ones), and is far harder to build and debug.
  (HyPer, Spark codegen, Postgres JIT for expensive queries.)

In practice the lines blur — some engines **compile vectorized primitives**
or switch strategies by query cost (interpret/vectorize cheap queries, JIT
expensive ones). The takeaway: both replace Volcano's per-row interpretation
with bulk processing, and which wins depends on query size and engineering
budget.

## 6. Why this needs columnar (and vice versa)

Vectorized/compiled execution and columnar storage
([Chapter 24](/database/part-7-analytics/columnar-and-olap)) are a matched
pair — each amplifies the other:

- A **column** is already a contiguous vector of same-typed values — the
  ideal input for a vectorized loop or a tight compiled loop. Row storage
  would have to gather a column's values from scattered row locations first.
- **Compression** ([Chapter 24](/database/part-7-analytics/columnar-and-olap))
  composes with vectorized execution: operate on RLE runs or dictionary
  codes in bulk without decoding.
- **Late materialization** keeps vectors columnar and compressed through the
  pipeline.

So the analytical architecture is a *stack*: columnar storage + compression
+ vectorized/compiled execution, each layer assuming the others. That's why
"OLAP database" implies all of it together — they're co-designed, not
independent choices.

## 7. SIMD and parallelism

On top of the model, analytical engines exploit hardware parallelism at two
levels:

- **SIMD** (data parallelism within a core): a vectorized loop over a typed
  array auto-vectorizes (or uses explicit intrinsics), processing 4–16
  values per instruction — summing, filtering, comparing whole vectors at
  once. Columnar + vectorized makes this natural; row-at-a-time can't.
- **Multi-core and distributed** (task parallelism): partition the data and
  run the scan/aggregate across all cores
  ([morsel-driven parallelism]) and across machines
  ([Chapter 19](/database/part-6-distributed/partitioning)), merging partial
  results. Analytical queries are embarrassingly parallel (independent row
  ranges), so they scale near-linearly with cores and nodes.

The combination — SIMD within a core, all cores within a node, all nodes in
a cluster — is how a warehouse aggregates trillions of rows in seconds. Each
level multiplies, and columnar+vectorized execution is what makes the bottom
levels (SIMD, tight loops) possible.

## 8. The analytical execution stack

Put Parts 24–25 together — the full analytical engine:

- **Storage**: columnar, compressed
  ([Chapter 24](/database/part-7-analytics/columnar-and-olap)).
- **Execution**: vectorized (batch-at-a-time) or compiled (JIT to machine
  code), push-based, operating on compressed columns with late
  materialization.
- **Parallelism**: SIMD within a core, all cores, all nodes.

This stack is a different machine from the OLTP database of
[Parts I–VI](/database/table-of-contents) — same SQL on top
([Chapter 8](/database/part-3-query-processing/relational-model-and-sql)),
radically different storage and execution underneath, because the workload
is radically different. Understanding *both* machines — and *why* each is
shaped by its workload (point lookups vs big scans) — is understanding the
real breadth of "database." Next we go further afield, to indexes and
engines built for queries neither model serves well.

> :weightliftinggoose: Analytical execution beats the **per-row
> interpretation overhead** of Volcano two ways: **vectorized** (process a
> **batch** of ~2000 values per operator call — amortize dispatch, unlock
> SIMD and cache; DuckDB/ClickHouse) and **compiled** (JIT the plan to a
> **fused machine-code loop** — no dispatch at all; HyPer/Spark), often
> with a **push** model fusing the pipeline. Both pair with **columnar
> storage** (a column *is* a vector) and exploit **SIMD + multi-core +
> distributed** parallelism. The OLAP engine is a co-designed stack —
> columnar + compressed + vectorized/compiled — a different machine from
> the OLTP database, shaped by the big-scan workload.

## What we covered

- The **Volcano** model's **per-row interpretation overhead** (virtual
  calls, no SIMD, poor cache) dominates analytical (billion-row) queries.
- **Vectorized execution** returns a **batch (vector)** of values per
  `next()`, amortizing dispatch ~2000× and unlocking **SIMD**, branch
  prediction, and cache streaming (MonetDB/X100, DuckDB, ClickHouse).
- **Compiled (JIT) execution** generates **machine code** for the query,
  eliminating interpretation — **data-centric code generation** (HyPer,
  Spark codegen, Postgres JIT); the query engine becomes a compiler.
- The **push** model (vs Volcano's pull) lets compilation **fuse** a whole
  pipeline into one loop, values staying in registers.
- **Vectorized vs compiled**: simpler + no compile latency vs fastest +
  full fusion but compile cost; engines mix or switch by query size.
- Execution and **columnar storage** are a matched pair (a column is a
  vector; operate on compressed data in bulk).
- **SIMD** (within a core) + **multi-core** + **distributed** parallelism
  multiply for near-linear analytical scaling.

## What's next

[Chapter 26](/database/part-7-analytics/specialized-indexes-and-engines) —
specialized indexes and engines. Beyond B-trees and LSM-trees lie indexes
built for *other* query shapes: **inverted indexes** for full-text search,
**spatial indexes** for geo queries, **time-series** engines, and **vector
(ANN) indexes** for similarity search over ML embeddings.
