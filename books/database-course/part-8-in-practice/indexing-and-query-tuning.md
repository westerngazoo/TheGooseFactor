---
sidebar_position: 1
title: "Indexing and Query Tuning"
---

# Indexing and Query Tuning

> The practitioner's craft: making real queries fast. You understand
> B-trees ([Chapter 5](/database/part-2-storage-engines/b-trees)) and the
> optimizer ([Chapter 10](/database/part-3-query-processing/query-optimization));
> this chapter is how to *apply* that — choosing indexes that help (and not
> the ones that hurt), reading **`EXPLAIN`** to see what the database
> actually did, keeping **statistics** fresh, and avoiding the anti-patterns
> that silently kill performance.

Welcome to Part VIII — databases in practice. The
[core course](/database/table-of-contents) built the engine; this part is
about *operating* it well. We start with the most common, highest-leverage
skill: query tuning. Ninety percent of real database performance problems
are a missing index, a bad query pattern, or stale statistics — and all
three are diagnosable and fixable once you know how to look.

## 1. The craft: a feedback loop

Query tuning is a loop, not a guess:

```
1. FIND the slow query   (slow-query log, monitoring, the one users complain about)
2. EXPLAIN it            (see the plan the optimizer chose)
3. DIAGNOSE              (seq scan? bad join? wrong row estimate?)
4. FIX                   (add/adjust an index, rewrite the query, update stats)
5. VERIFY                (EXPLAIN ANALYZE again — did it actually help?)
```

The cardinal sin is optimizing by intuition — adding random indexes,
rewriting queries on a hunch. **Measure, diagnose, fix, verify.** The
database tells you exactly what it's doing if you ask (`EXPLAIN`, §3); your
job is to read it and respond. This loop, applied to your actual slow
queries, fixes the vast majority of performance problems.

## 2. Index strategy: which columns

The first lever is **indexes** ([Chapter 5](/database/part-2-storage-engines/b-trees)) —
but indexing well is more than "index the columns in `WHERE`":

- **Index for selectivity**: an index helps when a predicate is
  **selective** (matches few rows). Indexing a column that's `WHERE active
  = true` (half the rows) is useless — the optimizer will scan instead
  ([Chapter 10](/database/part-3-query-processing/query-optimization)).
  Index high-selectivity columns (`user_id`, `email`).
- **Index `WHERE`, `JOIN`, and `ORDER BY` columns**: indexes accelerate
  filtering, join keys, *and* sorting (a B-tree is pre-sorted, so it can
  satisfy `ORDER BY` without a sort).
- **Don't over-index**: every index is **maintained on every write**
  (insert/update/delete must update all relevant indexes) and consumes
  storage. Too many indexes slow writes and waste space. Index for your
  *actual* query patterns, not speculatively.

The discipline: indexes are a **read/write trade-off**
([Chapter 1](/database/part-1-foundations/why-databases)) — faster reads,
slower writes — so add them deliberately for the queries that need them, and
remove ones that aren't used.

## 3. Composite indexes and column order

A **composite (multi-column) index** on `(a, b, c)` sorts by `a`, then `b`,
then `c` — and **column order matters enormously** because of the
**leftmost-prefix rule**: the index can be used for queries filtering on a
*prefix* of the columns, left to right:

```
INDEX (last_name, first_name)
  WHERE last_name = 'Smith'                          → uses index ✓
  WHERE last_name = 'Smith' AND first_name = 'Ada'   → uses index ✓
  WHERE first_name = 'Ada'                           → CANNOT use index ✗
       (first_name isn't a left prefix)
```

So order composite-index columns by how they're queried: **equality
predicates first**, then the range/sort column. An index on `(status, created_at)`
serves `WHERE status = 'x' ORDER BY created_at` perfectly; reversed, it
doesn't. A **covering index** (one that *includes* all columns a query
needs) lets the database answer from the index alone — an **index-only
scan**, never touching the table heap
([Chapter 3](/database/part-1-foundations/storage-on-disk)). Composite and
covering indexes are where index design gets genuinely skillful.

## 4. Reading EXPLAIN

**`EXPLAIN`** (and **`EXPLAIN ANALYZE`**, which *runs* the query and shows
real numbers) is *the* tuning tool
([Chapter 10](/database/part-3-query-processing/query-optimization)) — it
shows the physical plan the optimizer chose. What to look for:

- **Sequential scan vs index scan**: a `Seq Scan` on a big table where you
  expected an index lookup signals a missing/unusable index — or a
  correctly-chosen scan (non-selective query). Know which.
- **Join algorithm** ([Chapter 11](/database/part-3-query-processing/execution)):
  a **nested loop** on two large tables is a red flag (should be hash or
  merge); a hash join building on the *huge* side suggests a bad size
  estimate.
- **Estimated vs actual rows**: in `EXPLAIN ANALYZE`, a big gap between
  *estimated* and *actual* row counts is the #1 tell of trouble — the
  optimizer is planning for the wrong data size (stale stats, §5).
- **Cost and time per node**: find the node consuming the most — that's your
  target.

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
-- "Seq Scan ... rows=1 (actual rows=1) ... " on a 10M-row table
-- → missing index on user_id: add it, re-check → "Index Scan"
```

Learning to read `EXPLAIN` — spotting the unexpected seq scan, the
nested-loop-on-big-tables, the estimate/actual gap — is the single most
valuable database performance skill. It turns "the query is slow" into "here
is exactly why."

## 5. Statistics and cardinality

The optimizer's plan is only as good as its **statistics**
([Chapter 10](/database/part-3-query-processing/query-optimization)) —
row counts, histograms, distinct-value counts that let it *estimate* how
many rows each step produces. **Stale or missing statistics are the most
common cause of mysteriously-bad plans**:

```
optimizer thinks `WHERE status = 'pending'` returns 10 rows (old stats)
   → picks an index-nested-loop plan tuned for 10 rows
actually returns 5,000,000 rows (data changed)
   → that plan is catastrophic; a hash join + scan would be far better
```

The fix is usually trivial: **`ANALYZE`** (Postgres) / `ANALYZE TABLE`
(MySQL) to refresh statistics — and ensure autovacuum/auto-analyze is
running. A query that "suddenly got slow" after a data load or a big
deletion is almost always stale stats: the data distribution changed, the
optimizer didn't know, and it chose a plan for the wrong shape. Fresh stats
→ correct estimates → correct plan. Always suspect statistics when the
`EXPLAIN ANALYZE` estimate/actual gap is large.

## 6. Query anti-patterns

Many slow queries are slow because they *defeat the index* or *do too much*.
The common anti-patterns:

- **Function on an indexed column**: `WHERE LOWER(email) = 'x'` can't use a
  plain index on `email` (the index stores `email`, not `LOWER(email)`) —
  it forces a scan. Fix: an **expression index** on `LOWER(email)`, or store
  it normalized.
- **Leading wildcard `LIKE`**: `WHERE name LIKE '%smith'` can't use a B-tree
  (it's sorted by *prefix*, and you gave a suffix) → scan. Trailing
  wildcards (`'smith%'`) *can* use the index. Full-text needs an inverted
  index ([Chapter 26](/database/part-7-analytics/specialized-indexes-and-engines)).
- **Implicit type casts**: comparing an indexed `bigint` column to a string
  literal may cast and bypass the index.
- **`SELECT *`**: fetches every column (more I/O, defeats covering indexes,
  breaks on schema change) — select only what you need.
- **N+1 queries**: a loop issuing one query per item (1 query for the list +
  N for details) — the classic ORM trap. Fix with a **join** or a batched
  `IN (...)` query.
- **`OR` across columns**: can prevent index use; sometimes a `UNION` of two
  indexed queries is faster.

Each is a case where a small rewrite (or an expression index) reconnects the
query to an index or cuts wasted work. Recognizing them on sight is a core
practitioner skill — they're the usual suspects behind a slow query.

> :surprisedgoose: The most counterintuitive tuning lesson: **adding the
> right index is usually 100× more effective than rewriting the query**, and
> **the database often *knows* the right plan but can't use your query as
> written.** A query that wraps an indexed column in a function, or starts a
> `LIKE` with a wildcard, *has* a perfectly good index sitting right there —
> the optimizer just can't use it, because the query asks for something the
> index isn't sorted by. So tuning is less about clever SQL and more about
> *not accidentally hiding the index from the optimizer*. Half of query
> tuning is removing the small mistakes (a `LOWER()`, a leading `%`, a stale
> statistic) that stand between a query and the index that would make it
> instant.

## 7. Advanced index features

Beyond the basic B-tree, practical databases offer indexes tuned for
specific needs:

- **Partial indexes**: index only the rows matching a condition (`CREATE
  INDEX ... WHERE status = 'active'`) — smaller, faster, for queries that
  always filter on that condition.
- **Expression / functional indexes**: index `LOWER(email)` or `(price *
  quantity)` so queries using that expression are indexable (fixing the
  function-on-column anti-pattern).
- **Covering indexes** (`INCLUDE` columns): add non-key columns to an index
  so common queries are answered index-only.
- **Different index types**: B-tree (default, ranges/equality), **hash**
  (equality only), **GIN/GiST** (full-text, arrays, geo — the specialized
  structures of [Chapter 26](/database/part-7-analytics/specialized-indexes-and-engines)),
  **BRIN** (huge, naturally-ordered tables — tiny index of block ranges).

These let you tailor indexes precisely to query patterns — a partial index
for a hot subset, an expression index to enable a transform, a covering
index to skip the heap. Knowing they exist turns "this query can't be
indexed" into "which index feature fits?"

## 8. The tuning mindset

Tie it into a practical discipline:

1. **Don't optimize blind** — find the *actual* slow queries (slow-query
   log, monitoring), don't guess.
2. **`EXPLAIN ANALYZE`** every slow query — read the plan, find the costly
   node and the estimate/actual gap.
3. **Most fixes are**: add/adjust an index (right columns, right order,
   covering), refresh **statistics** (`ANALYZE`), or rewrite to stop
   defeating the index (anti-patterns §6).
4. **Index deliberately** — for real query patterns, mindful of the write
   cost; remove unused indexes.
5. **Verify** — re-`EXPLAIN`; confirm the plan and the timing improved.

The meta-point: a database is a *collaborator* that will tell you exactly
what it's doing and why, if you use `EXPLAIN`. Performance work is a
*conversation* with the optimizer — you propose indexes and query shapes, it
shows you the plan, you adjust. Master that conversation and most database
performance problems become routine. Next: the schema those queries run
against, and how to evolve it safely.

> :weightliftinggoose: Query tuning is a **feedback loop**: find the slow
> query → **`EXPLAIN ANALYZE`** → diagnose → fix → verify. The big levers:
> **the right index** (selective columns; **composite order = equality
> first, leftmost-prefix rule**; **covering** for index-only scans), **fresh
> statistics** (`ANALYZE` — stale stats are the #1 cause of "suddenly
> slow"), and **not defeating the index** (no function-on-column, no leading
> `%`, no `SELECT *`, no N+1). The surprising truth: the right index beats
> clever SQL, and the optimizer usually *knows* the good plan — your job is
> to stop hiding the index from it. Tuning is a conversation with the
> optimizer via `EXPLAIN`.

## What we covered

- Query tuning is a **loop**: find the slow query → **`EXPLAIN`** →
  diagnose → fix → **verify**; never optimize by guessing.
- **Index strategy**: index **selective** columns used in `WHERE`/`JOIN`/
  `ORDER BY`; don't over-index (writes pay for every index).
- **Composite indexes**: column order matters (**leftmost-prefix rule** —
  equality columns first); **covering indexes** enable **index-only scans**.
- **`EXPLAIN ANALYZE`** reveals the plan: watch for unexpected **seq
  scans**, **nested loops on big tables**, and **estimated-vs-actual row**
  gaps.
- **Stale statistics** are the top cause of bad plans — **`ANALYZE`** to
  refresh; suspect them when estimate/actual diverge.
- **Anti-patterns** defeat indexes or do too much: function-on-column,
  leading-wildcard `LIKE`, implicit casts, `SELECT *`, **N+1 queries**,
  `OR` across columns.
- **Advanced indexes**: partial, expression/functional, covering, and
  type-specific (hash, GIN/GiST, BRIN).
- The mindset: a database is a **collaborator** — tune via a conversation
  with the optimizer through `EXPLAIN`.

## What's next

[Chapter 29](/database/part-8-in-practice/schema-design-and-evolution) —
schema design and evolution. The schema your queries run against:
normalization (and deliberate denormalization), constraints as correctness,
and the genuinely hard problem of **evolving** a schema — migrations and
**online schema changes** without downtime.
