---
sidebar_position: 4
title: "Execution: the Iterator Model and Joins"
---

# Execution

> Running the plan. The optimizer's physical plan is a **tree of
> operators**; the executor runs it by pulling rows up through the tree,
> one at a time, with the **iterator (Volcano) model**. This chapter shows
> how rows flow through scans, filters, and joins — and the three join
> algorithms in mechanical detail.

[Chapter 10](/database/part-3-query-processing/query-optimization) chose a
physical plan: which scans, which join algorithms, what order. Now the
**execution engine** *runs* it against the storage engine
([Part II](/database/part-2-storage-engines/storage-engine)). Execution is
where the abstract plan becomes actual page reads and row comparisons —
the final step from SQL to results.

## 1. The plan is a tree of operators

A physical plan is a tree where each node is a **physical operator** and
edges carry rows upward from children to parent:

```
        Project[name]            ← top: emits final rows
            │
         HashJoin[u.id = o.user_id]
          /         \
  IndexScan[users]   SeqScan[orders]   ← leaves: read from storage
```

Leaves are **access operators** (sequential scan, index scan) that read
from the storage engine; interior nodes are **transform operators**
(filter, join, sort, aggregate, project) that consume their children's
rows and produce new ones. Results flow from the leaves up to the root,
which emits the final result set. Execution is "drive the root, and rows
get pulled up through the tree."

## 2. The iterator (Volcano) model

The classic execution strategy is the **iterator model** (a.k.a.
**Volcano** model): every operator implements the same simple interface:

```
open()    -- initialize (set up state, open children)
next()    -- produce the NEXT row (or EOF); pulls from children as needed
close()   -- clean up
```

Execution runs by calling `next()` on the **root**, which calls `next()`
on its children, which call `next()` on *their* children — rows are
**pulled** down-to-up, one at a time, on demand:

```
root.next()
  → join.next()
      → scan_users.next()  → a user row
      → scan_orders.next() → an order row
  → (join matches, emits a combined row)
→ one result row
```

This **demand-driven, pull-based** design is elegant: operators compose
uniformly (any operator can be any operator's child), and rows stream
through **without materializing** the whole intermediate result — memory
stays bounded, and a `LIMIT` can stop early. It's how most databases have
executed queries for decades.

> :nerdygoose: The Volcano model's beauty is **uniform composability**:
> because every operator is just `open`/`next`/`close`, you can plug any
> operator into any other with no special cases — a filter feeds a join
> feeds a sort feeds a projection, all via the same interface. It's the
> same idea as a Unix pipeline or a lazy iterator chain in a programming
> language: small operators, pulled on demand, composing into arbitrary
> queries. One simple interface generates the entire executor.

## 3. Pull vs push, and vectorized execution

The classic Volcano model processes **one row per `next()` call** — simple,
but with a cost: a function call per row per operator is a lot of overhead
when scanning millions of rows. Modern engines optimize this:

- **Vectorized execution**: each `next()` returns a **batch** of rows
  (a few thousand) instead of one, amortizing call overhead and enabling
  CPU-friendly tight loops (used in analytical engines like DuckDB,
  ClickHouse).
- **Push-based / compiled execution**: instead of pulling row-by-row, the
  query is *compiled* to code that pushes rows through operators, or
  even JIT-compiled to machine code (e.g. some columnar/OLAP engines).

The iterator model remains the conceptual foundation; vectorization and
compilation are performance refinements on top. For OLTP (few rows per
query) classic Volcano is fine; for OLAP (millions of rows) vectorization
wins big. GooseDB uses the classic model for clarity.

## 4. Access and transform operators

The operator zoo, by role:

- **Sequential scan** — `next()` returns the next row from the heap
  ([Chapter 3](/database/part-1-foundations/storage-on-disk)), page by
  page.
- **Index scan** — walk a B-tree ([Chapter 5](/database/part-2-storage-engines/b-trees))
  for matching RIDs, fetch each row.
- **Filter (σ)** — pull rows from its child, emit only those matching the
  predicate.
- **Project (π)** — pull rows, emit chosen columns (and computed
  expressions).
- **Sort** — pull *all* child rows, sort them, then emit (a **blocking**
  operator — it must consume everything before emitting the first row).
- **Aggregate / group** — accumulate per-group state (`SUM`, `COUNT`),
  emit when done.
- **Join** — combine rows from two children (§5–7).

Most operators stream (emit as they pull); a few — **sort**, **hash
aggregate**, hash-join build — are **blocking** or **stateful**, needing
memory and possibly spilling to disk if the data exceeds RAM.

## 5. Nested-loop join

The simplest join: for each row of the **outer** input, scan the **inner**
input for matches.

```
for each row r in outer:
    for each row s in inner:
        if join_condition(r, s): emit (r, s)
```

- **Cost**: O(outer × inner) — quadratic; brutal for two large tables.
- **Index nested-loop**: if the inner has an **index** on the join key,
  replace the inner scan with an index lookup per outer row — O(outer ×
  log inner). Excellent when the outer is small and the inner is indexed.

Nested-loop is the right pick for a **tiny outer** table or an **indexed
inner**, and the only general option for non-equality (`<`, range) joins.
Otherwise it's a disaster, which is why the optimizer reaches for the next
two algorithms on large equality joins.

## 6. Hash join

For large **equality** joins, **hash join** is usually the winner. Two
phases:

```
build:  load the SMALLER input into a hash table keyed on the join key
probe:  for each row of the larger input, look up its key in the hash table
        and emit matches
```

- **Cost**: O(build + probe) ≈ linear in the two inputs — vastly better
  than nested-loop's product.
- **Memory**: needs the build side's hash table in RAM; if it doesn't fit,
  use **grace/hybrid hash join** (partition both inputs to disk by hash,
  then join partitions that fit).
- **Equality only**: hashing requires `=`, so hash join can't do range
  joins.

Hash join is the default for big `a.id = b.id` joins. The build side is
**blocking** (must finish before probing), and choosing the *smaller*
input to build is an optimizer call based on cardinality estimates
([Chapter 10](/database/part-3-query-processing/query-optimization)).

## 7. Sort-merge join

When both inputs are **sorted on the join key** (or can be cheaply sorted),
**sort-merge join** marches through both in one pass:

```
sort both inputs on the join key (skip if already sorted)
advance two cursors in lockstep:
    if outer.key == inner.key: emit matches (handle duplicates)
    elif outer.key < inner.key: advance outer
    else: advance inner
```

- **Cost**: O(sort) + O(merge); if inputs are *already* sorted (e.g. from
  an index scan or a prior sort), the sort is free and merge is linear.
- **Strengths**: handles **large** inputs, supports **range/inequality**
  conditions and produces **sorted output** (useful if a downstream
  `ORDER BY` or merge needs it).

Sort-merge wins when inputs arrive pre-sorted or the query needs sorted
output anyway. Hash join vs sort-merge for big equality joins is a classic
optimizer trade-off — hash if unsorted and one side is small enough; merge
if already sorted or memory is tight.

## 8. From plan to results: the full trace

Tie it together. Running `SELECT u.name FROM users u JOIN orders o ON
o.user_id = u.id WHERE o.total > 100`:

1. The executor calls `next()` on the **root** (`Project[name]`).
2. Project pulls from the **HashJoin**, which (first call) **builds** a
   hash table on the smaller side, then **probes** with the other,
   pulling rows from the **scans** below — each scan pulling **pages** via
   the **buffer pool** ([Chapter 7](/database/part-2-storage-engines/buffer-pool)),
   reading from disk on a miss.
3. A **Filter** (`o.total > 100`) drops non-matching order rows as they
   flow up.
4. Project emits `name`; the loop repeats until EOF.

That's the complete journey from [Chapter 1](/database/part-1-foundations/why-databases)'s
black box: SQL **parsed** and **planned**
([Chapter 9](/database/part-3-query-processing/parsing-and-planning)),
**optimized** into a physical plan
([Chapter 10](/database/part-3-query-processing/query-optimization)), and
**executed** by pulling rows up an operator tree that bottoms out in
**page reads** through the storage engine. The "magic" is fully mechanical.
What remains is making it *correct under concurrency and crashes* — Parts
IV and V.

> :weightliftinggoose: Execution is a **tree of operators** run by the
> **iterator (Volcano) model** — `open`/`next`/`close`, rows **pulled**
> bottom-to-top, streaming without materializing (so `LIMIT` can stop
> early). Know the three joins cold: **nested-loop** (tiny/indexed inner;
> the only option for ranges), **hash** (big equality joins, linear, needs
> memory), **sort-merge** (sorted inputs, ranges, sorted output). Note the
> **blocking** operators (sort, hash build) that buffer and may spill.
> Trace a query end-to-end — root `next()` down to buffer-pool page reads —
> and the whole query layer is demystified.

## What we covered

- A physical plan is a **tree of operators**; leaves **scan** storage,
  interior nodes **transform**; rows flow up to the root.
- The **iterator/Volcano model** gives every operator `open`/`next`/
  `close`; rows are **pulled** on demand, streaming and composable, so
  `LIMIT` stops early.
- **Vectorized** (batch) and **compiled/push** execution optimize the
  per-row overhead for analytical workloads; classic Volcano suits OLTP.
- Operators: sequential/index **scans**, **filter**, **project**, **sort**
  and **aggregate** (blocking/stateful), and **joins**.
- **Nested-loop join**: O(outer×inner); great with a **tiny outer** or
  **indexed inner**; only option for non-equality joins.
- **Hash join**: build a hash table on the smaller input, probe with the
  larger — linear, **equality-only**, memory-bound (grace hash if it
  spills).
- **Sort-merge join**: sort both, merge in one pass — great for **sorted**
  inputs, ranges, and sorted output.
- End to end: SQL → parse → plan → optimize → **execute** by pulling rows
  up the tree down to **page reads** — the black box, fully mechanical.

## What's next

That's Part III. [Part IV](/database/part-4-transactions/transactions-and-acid)
makes execution **safe under concurrency**: transactions and **ACID**,
then concurrency control (locking, 2PL), **MVCC**, and the isolation levels
that define what concurrent transactions may observe.
