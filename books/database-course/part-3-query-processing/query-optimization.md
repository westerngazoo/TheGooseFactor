---
sidebar_position: 3
title: "Query Optimization"
---

# Query Optimization

> The brain of the database. One logical plan has astronomically many
> equivalent physical plans, differing by orders of magnitude in speed.
> The **optimizer** estimates the **cost** of plans using **statistics**
> about the data and picks a cheap one — choosing access paths, join
> algorithms, and especially **join order**. It's why the same SQL runs
> fast without you specifying *how*.

The logical plan from [Chapter 9](/database/part-3-query-processing/parsing-and-planning)
says *what* to compute. The optimizer decides *how* — and the difference
between a good and bad choice can be milliseconds versus hours. This is the
most intellectually rich part of a database, and the reason the
declarative bargain ([Chapter 1](/database/part-1-foundations/why-databases))
pays off.

## 1. Why optimization matters: the search space

Consider joining three tables `A ⋈ B ⋈ C`. Even ignoring algorithms, the
*join order* alone has many possibilities: `(A⋈B)⋈C`, `(A⋈C)⋈B`,
`A⋈(B⋈C)`, ... and each join can use a different algorithm and access
path. The number of candidate physical plans explodes **combinatorially**
with the number of tables.

Crucially, these plans are *equivalent* (same result) but **wildly
different in cost**: joining a 10-row table to a billion-row table first
versus last can change runtime by a factor of millions. The optimizer's
job is to navigate this enormous space and find a plan that's *good* (not
necessarily optimal — that's often infeasible) quickly.

## 2. Cost-based optimization

The dominant approach is **cost-based optimization (CBO)**: assign each
candidate plan an estimated **cost** and pick the cheapest. Cost is a model
of the resources a plan will consume:

```
cost ≈ (page I/Os × io_cost) + (rows processed × cpu_cost) + ...
```

Since page I/O dominates ([Part I](/database/part-1-foundations/storage-on-disk)),
cost is largely "how many pages will this plan read/write?" The optimizer
estimates this for each operator in a plan and sums it. The plan with the
lowest estimated cost wins. Everything hinges on estimating cost
*accurately*, which requires knowing the data — statistics (§4).

## 3. Access path selection

The first choice for each table: **how to read it** (the access path):

- **Sequential scan**: read every page. Best when you need most rows, or
  there's no useful index.
- **Index scan**: use a B-tree ([Chapter 5](/database/part-2-storage-engines/b-trees))
  to find matching rows. Best when a predicate is **selective** (returns
  few rows).
- **Index-only scan**: if the index contains all needed columns, skip the
  table entirely (no heap fetch).

The decision turns on **selectivity** — what fraction of rows match. For
`WHERE id = 42` (one row), an index scan is a clear win. For `WHERE active
= true` (half the rows), the index would cause more random I/O than just
scanning — so a sequential scan wins. This is *why* an index sometimes
goes unused: the optimizer judged a scan cheaper. Counterintuitive until
you think in page I/Os.

> :surprisedgoose: "I added an index and the query didn't get faster!" is
> almost always the optimizer correctly deciding a **sequential scan** is
> cheaper. An index lookup costs a B-tree descent *plus a random heap
> fetch per matching row*; if a query matches 40% of a table, that's
> millions of random I/Os — far worse than streaming the table
> sequentially. Indexes win only when **selective** (few matches).
> The optimizer's "ignore the index" is usually right, and understanding
> *why* (random vs sequential I/O, selectivity) is the difference between
> cargo-culting indexes and using them well.

## 4. Statistics: estimating cardinality

To estimate cost, the optimizer must estimate **cardinality** — how many
rows each operator produces. It does this from **statistics** the database
collects about each table and column:

- **Row counts** per table.
- **Histograms** of column value distributions (how many rows have `city
  = 'Berlin'`?).
- **Distinct value counts** (for join-size and `GROUP BY` estimates).
- **Null fractions**, min/max, most-common-values.

```
σ_city='Berlin'(users): if 'Berlin' is 3% of rows per the histogram,
   estimated output ≈ 0.03 × row_count
```

These stats are gathered by a background process (`ANALYZE` in
PostgreSQL). **Stale or missing statistics are the #1 cause of bad plans**:
if the optimizer thinks a step returns 10 rows but it returns 10 million,
it picks a plan tuned for 10 rows and the query crawls. "Run `ANALYZE`" is
the classic fix for a query that suddenly went slow.

## 5. Join algorithms

For each join, the optimizer picks an **algorithm**, each best in
different conditions:

- **Nested-loop join**: for each row of the outer table, scan the inner
  for matches. Great when the outer is tiny or the inner has an index
  (index nested-loop); terrible for two large tables (quadratic).
- **Hash join**: build a hash table on the smaller table's join key, then
  probe it with the larger. Excellent for large, **equality** joins
  (`a.id = b.id`); needs memory for the hash table.
- **Sort-merge join**: sort both inputs on the join key, then merge in one
  pass. Great when inputs are **already sorted** (e.g. by an index) or for
  range/inequality conditions, and for very large inputs.

```
small ⋈ large, equality → hash join
both already sorted on key → merge join
tiny outer + indexed inner → index nested-loop
```

Choosing among these — per join, given the estimated input sizes and
available indexes — is a core optimizer decision, detailed in execution
([Chapter 11](/database/part-3-query-processing/execution)).

## 6. Join order: the hardest choice

The optimizer's signature problem is **join ordering**. For *n* tables,
the number of possible orders grows factorially — exhaustive search is
infeasible beyond a handful of tables. The classic technique (from
IBM's System R) is **dynamic programming**: build up the best plan for
joining subsets of tables, reusing sub-results, considering join order and
algorithm together.

The goal is to keep **intermediate results small** — join the most
selective combinations first so each step processes few rows. For many
tables, optimizers switch to **heuristics** or **randomized/greedy** search
(e.g. PostgreSQL's genetic optimizer above a threshold) because optimal
search is too expensive. Getting join order right is where the biggest
performance wins (and losses) live — a million-fold swing is common.

## 7. Rule-based rewrites and heuristics

Alongside cost-based search, optimizers apply **transformation rules** —
algebraic rewrites ([Chapter 8](/database/part-3-query-processing/relational-model-and-sql))
that are almost always beneficial:

- **Predicate pushdown**: push `WHERE` filters as close to the scans as
  possible, so less data flows up (`σ` below `⋈`).
- **Projection pushdown**: drop unneeded columns early.
- **Join elimination**, **constant folding**, **subquery decorrelation**,
  **limit pushdown**.

These are valid by relational algebra's laws and reduce data volume
regardless of statistics. Modern optimizers (e.g. the **Cascades**
framework behind several engines) unify rule-based rewriting and cost-based
search: apply transformations to generate candidate plans, cost them, pick
the best. Rules generate the space; cost prunes it.

## 8. Reading what the optimizer chose: EXPLAIN

You don't have to guess what the optimizer did — **`EXPLAIN`** shows the
chosen physical plan, and `EXPLAIN ANALYZE` shows it *with actual* row
counts and timings:

```sql
EXPLAIN ANALYZE SELECT u.name FROM users u
  JOIN orders o ON o.user_id = u.id WHERE o.total > 100;

-- shows: which scans (index vs seq), which join algorithm, join order,
--        estimated vs actual rows  ← mismatch = stale stats / bad estimate
```

`EXPLAIN` is *the* tool for diagnosing slow queries. The tell-tale sign of
trouble: a big gap between **estimated** and **actual** rows, which points
at stale statistics or a correlation the optimizer missed. Learning to read
`EXPLAIN` — spotting an unexpected sequential scan, a nested-loop on big
tables, a bad join order — is the single most practical database
performance skill, and it's a direct window into everything this chapter
described.

> :weightliftinggoose: The optimizer turns one logical plan into the
> cheapest of *combinatorially many* physical plans by **estimating cost**
> (dominated by page I/Os) from **statistics**. Its big decisions:
> **access path** (index vs sequential, decided by **selectivity**),
> **join algorithm** (nested-loop / hash / merge), and the killer,
> **join order**. Two practical reflexes follow: keep **statistics fresh**
> (stale stats → bad plans → the usual "suddenly slow" culprit), and read
> **`EXPLAIN ANALYZE`** to see what was chosen and spot estimate-vs-actual
> gaps. Most query tuning is conversation with the optimizer.

## What we covered

- One logical plan maps to a **combinatorial** space of physical plans,
  equivalent in result but **orders of magnitude** apart in cost.
- **Cost-based optimization** estimates each plan's cost (mostly **page
  I/Os**) and picks the cheapest.
- **Access path selection** (sequential vs index vs index-only scan) turns
  on **selectivity** — why a non-selective query ignores its index.
- **Statistics** (row counts, **histograms**, distinct values) drive
  **cardinality** estimates; **stale stats are the top cause of bad
  plans**.
- **Join algorithms**: **nested-loop** (tiny/indexed inner), **hash**
  (large equality joins), **sort-merge** (sorted inputs, ranges).
- **Join order** is the hardest choice — factorial space, solved by
  **dynamic programming**/heuristics, aiming to keep intermediates small.
- **Rule-based rewrites** (predicate/projection pushdown, decorrelation)
  shrink data regardless of stats; **`EXPLAIN`/`EXPLAIN ANALYZE`** reveal
  and diagnose the chosen plan.

## What's next

[Chapter 11](/database/part-3-query-processing/execution) — execution. The
optimizer's physical plan is a tree of operators; the executor runs it. The
**iterator (Volcano) model**, how rows flow through operators, and the
**join algorithms** (nested-loop, hash, merge) in mechanical detail.
