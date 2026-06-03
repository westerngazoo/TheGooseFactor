---
sidebar_position: 1
title: "The Relational Model and SQL"
---

# The Relational Model and SQL

> The logical foundation. The **relational model** represents all data as
> **relations** (tables) of **tuples** (rows), and **SQL** is the
> declarative language for querying them. Underneath SQL sits **relational
> algebra** — a small set of operations the engine actually executes. This
> chapter connects the query you write to the operators the engine runs.

[Part II](/database/part-2-storage-engines/buffer-pool) built the storage
engine — how rows live on disk. Now we go up to the **query layer**: how a
declarative request becomes execution. We start with the model and language
themselves, because the engine's job is precisely to bridge SQL's *what*
to the storage engine's *how*.

## 1. The relational model

E.F. Codd's 1970 model is beautifully simple. All data is **relations**:

- A **relation** (table) is a set of tuples sharing a structure.
- A **tuple** (row) is an ordered set of **attribute** (column) values.
- A **schema** defines a relation's attributes and their types.
- A **key** uniquely identifies tuples (a **primary key**); a **foreign
  key** references another relation's key, modeling relationships.

```
users (relation):
  id │ name │ city          ← schema: id INT PK, name TEXT, city TEXT
  ───┼──────┼───────
  42 │ Ada  │ Berlin        ← a tuple
   7 │ Lin  │ Oslo
```

That's the whole data model: everything is tables of rows. Its power is
that this uniform structure has a precise mathematical foundation —
relational algebra (§3) — which is what makes declarative querying and
optimization possible.

## 2. SQL: the declarative language

**SQL** (Structured Query Language) is how you talk to a relational
database. It's **declarative** ([Chapter 1](/database/part-1-foundations/why-databases)):
you describe the result; the engine figures out how to produce it. The
core is the `SELECT`:

```sql
SELECT name, city          -- projection: which columns
FROM users                 -- the source relation(s)
WHERE city = 'Berlin'      -- selection: which rows
ORDER BY name              -- sort the result
LIMIT 10;                  -- cap the rows
```

Plus `INSERT`, `UPDATE`, `DELETE` (data manipulation, DML), and `CREATE
TABLE`, `CREATE INDEX`, etc. (data definition, DDL). SQL also has
**aggregation** (`GROUP BY`, `COUNT`, `SUM`), **joins** (combining
relations), and **subqueries**. It's a large language, but it reduces to a
small algebra.

## 3. Relational algebra: what the engine executes

Under the SQL surface, the engine works in **relational algebra** — a
handful of operators that each take relation(s) and produce a relation.
The core operators:

- **Selection (σ)** — keep rows matching a predicate (SQL `WHERE`).
- **Projection (π)** — keep certain columns (SQL `SELECT` list).
- **Join (⋈)** — combine rows from two relations on a condition (SQL
  `JOIN`).
- **Cross product (×)**, **union (∪)**, **difference (−)** — set
  operations.
- **Aggregation / grouping** — `GROUP BY` with `SUM`/`COUNT`/etc.
- **Sort**, **rename**, **distinct**.

```
SELECT name FROM users WHERE city = 'Berlin'
   ≈   π_name( σ_city='Berlin' (users) )
```

Your SQL query is *translated* into a tree of these operators. Because the
algebra has well-defined semantics and **algebraic laws** (e.g. you can
push a selection below a join), the optimizer can transform one operator
tree into an equivalent, cheaper one
([Chapter 10](/database/part-3-query-processing/query-optimization)).
Relational algebra is the bridge between "what you asked" and "what the
engine does."

> :nerdygoose: This is why the relational model *won*. Because queries map
> to an **algebra with equivalence laws**, the engine can freely *rewrite*
> a query into a faster-but-equivalent form, and *prove* the rewrite
> preserves results. `σ(a ⋈ b) = σ(a) ⋈ b` when the predicate only touches
> `a` — so the engine pushes filters down to read less data, automatically.
> No imperative language gives you that: you can't safely auto-rewrite a
> hand-coded loop. The math under the model is exactly what enables
> decades of optimization on unchanged SQL.

## 4. Set semantics, NULL, and three-valued logic

Two semantic wrinkles that trip up everyone and matter for the engine:

- **Bags, not pure sets**: SQL relations are technically *multisets*
  (duplicates allowed) unless you say `DISTINCT`. This affects how
  operators and the optimizer reason about row counts.
- **NULL and three-valued logic**: SQL has `NULL` for "unknown/absent,"
  and comparisons with `NULL` yield **UNKNOWN**, not true/false. So `WHERE
  x = NULL` matches nothing (use `IS NULL`), and `NOT (x = 5)` doesn't
  include `NULL` rows. Logic is **three-valued** (true/false/unknown).

These aren't pedantry — they change query *results* and force the engine's
predicate evaluation and the optimizer's rewrites to handle the unknown
case carefully. Many real-world query bugs are NULL-logic surprises.

## 5. Joins: the defining operation

The **join** is what makes relational databases relational — combining
data spread across normalized tables:

```sql
SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id     -- match each user to their orders
WHERE o.total > 100;
```

Conceptually a join pairs rows from two relations where a condition holds.
Logically it's a cross product followed by a selection — but executing it
that way would be catastrophic (every pair!), so the engine uses smart
**join algorithms** (nested-loop, hash, merge —
[Chapter 11](/database/part-3-query-processing/execution)). Joins are
usually the most expensive part of a query and the optimizer's main
battleground (which order to join three tables? which algorithm?).

## 6. Schema design and normalization

How you structure tables — the **schema** — shapes everything. The
classical discipline is **normalization**: organize data to eliminate
redundancy, so each fact lives in exactly one place:

- Avoid storing a customer's address in every order row (update one, miss
  the others → inconsistency).
- Instead, factor into `customers` and `orders` linked by a foreign key;
  **join** to recombine.

Normal forms (1NF, 2NF, 3NF, ...) formalize this. The trade-off:
normalization keeps data consistent and writes cheap but requires **joins**
to reassemble — and joins cost. **Denormalization** (deliberately
duplicating data) trades consistency risk for read speed, common in
analytics and at scale. Schema design is choosing where on that spectrum
to sit.

## 7. Beyond SELECT: the query lifecycle preview

Everything in this part traces a query from text to result
([Chapter 2](/database/part-1-foundations/architecture)):

1. **Parse** the SQL into a tree, resolve names against the schema
   ([Chapter 9](/database/part-3-query-processing/parsing-and-planning)).
2. **Translate** to relational algebra (a **logical plan**).
3. **Optimize** — rewrite and choose physical operators by cost
   ([Chapter 10](/database/part-3-query-processing/query-optimization)).
4. **Execute** the physical plan against the storage engine
   ([Chapter 11](/database/part-3-query-processing/execution)).

The relational model and algebra are the *language* of steps 2–3: the
optimizer reasons in algebra, the executor runs physical implementations
of algebraic operators. This chapter gave you that vocabulary; the next
three put it in motion.

## 8. Why this model endures

Fifty years on, the relational model dominates because:

- **Declarative** — you say *what*, freeing the engine to optimize *how*,
  and keeping queries stable as data and indexes change.
- **Mathematically grounded** — relational algebra gives provable
  query equivalence, the basis of optimization.
- **General** — tables + joins model an enormous range of domains.
- **Mature** — decades of engineering (indexing, optimization,
  transactions) compound on the same foundation.

NoSQL systems often relax parts of it (joins, schemas, strict
consistency) for scale or flexibility — but even they borrow its concepts,
and many have circled back to add SQL interfaces. Understanding the
relational model and SQL is understanding the lingua franca of data.

> :weightliftinggoose: SQL is **declarative** — you describe the result;
> the engine, reasoning in **relational algebra** (select σ, project π,
> join ⋈, aggregate), decides how. Internalize that SQL → algebra
> translation, because it's what the optimizer rewrites and the executor
> runs. Watch the gotchas — **multiset** semantics and **NULL's
> three-valued logic** change results — and respect that **joins** are
> the expensive, central operation, shaped by your **schema/normalization**
> choices. This vocabulary (relations, algebra, joins) is the backbone of
> the next three chapters.

## What we covered

- The **relational model**: data as **relations** (tables) of **tuples**
  (rows) with a **schema**, **primary/foreign keys** modeling
  relationships.
- **SQL** is the **declarative** language: `SELECT`/`WHERE`/`ORDER BY`,
  DML (`INSERT`/`UPDATE`/`DELETE`), DDL (`CREATE`), aggregation, joins,
  subqueries.
- Under SQL sits **relational algebra** (σ select, π project, ⋈ join, set
  ops, aggregation) — operators with **equivalence laws** that enable
  optimization.
- Semantics to respect: SQL uses **multisets** (not pure sets) and
  **NULL** with **three-valued logic**.
- **Joins** combine normalized tables and are the central, expensive
  operation; logically a cross product + selection, run via smart
  algorithms.
- **Normalization** removes redundancy (consistency, cheap writes) at the
  cost of joins; **denormalization** trades back for read speed.
- The query lifecycle — **parse → algebra/logical plan → optimize →
  execute** — frames Part III; the relational model is its vocabulary.

## What's next

[Chapter 9](/database/part-3-query-processing/parsing-and-planning) —
parsing and planning. How SQL text becomes a syntax tree, gets validated
against the schema, and is translated into a **logical query plan** in
relational algebra — the input the optimizer then reshapes.
