---
sidebar_position: 1
title: "Why Databases? The Guarantees"
---

# Why Databases?

> Before the machinery, the promise. A database isn't just "a place to put
> data" — it's a set of **guarantees**: your data survives crashes,
> concurrent users don't corrupt each other's work, and you can ask
> complex questions declaratively. Understanding what a database *promises*
> frames everything we build.

You could store data in files. So why does a database exist? Because the
moment you have *concurrent* access, *crashes*, *large* data, and
*complex queries*, naive files fall apart. A database is the accumulated
engineering answer to those four problems at once. This chapter is the
"why"; the rest of the course is the "how."

## 1. The problem with just using files

Imagine storing your application's data in plain files. Quickly you hit:

- **Concurrency**: two users write at once and clobber each other, or one
  reads a half-written record.
- **Crashes**: the power dies mid-write and the file is corrupt — you've
  lost data, or worse, silently kept *wrong* data.
- **Querying**: "find all users in Berlin who signed up last week" means
  scanning everything, every time.
- **Scale**: the data outgrows memory; you need structures that work when
  most of the data is on disk.

A database solves all four — and the solutions are the topics of this
course. Each is a hard problem; together they're why databases are
sophisticated systems rather than glorified files.

## 2. What a database is

A **database** is an organized collection of data; a **database management
system** (DBMS) is the software that stores, retrieves, and manages it
safely. When people say "database" they usually mean the DBMS — the
engine. We'll build a DBMS.

The dominant kind is the **relational** database: data lives in **tables**
(relations) of **rows** (tuples) and **columns** (attributes), queried
with **SQL**. Other models exist (key-value, document, graph, columnar),
and we'll touch them, but the relational model
([Chapter 8](/database/part-3-query-processing/relational-model-and-sql))
is our backbone — it's the most studied and the techniques transfer.

## 3. The declarative bargain

The relational model's genius is that SQL is **declarative**: you state
*what* you want, not *how* to get it.

```sql
SELECT name FROM users WHERE city = 'Berlin' ORDER BY signup_date;
```

You don't say "scan this file, check this index, sort with this
algorithm." You describe the result, and the database's **query
optimizer** ([Chapter 10](/database/part-3-query-processing/query-optimization))
figures out an efficient *how*. This separation — declarative intent,
engine-chosen execution — is what lets the same query stay correct while
the engine, the indexes, and the data size all change underneath it.

> :nerdygoose: The what/how split is the relational model's deepest idea,
> from E.F. Codd's 1970 paper. By divorcing the *logical* question
> ("which rows?") from the *physical* execution ("which index, which join
> algorithm, in what order?"), it freed databases to optimize, add
> indexes, and reorganize storage *without changing your queries*. That
> stability is why SQL written decades ago still runs. Most of this
> course's Part III is about how the engine bridges that gap — turning a
> declarative question into a concrete plan.

## 4. ACID: the transactional guarantees

The headline promise of a relational database is **ACID** — four
properties of **transactions** (groups of operations treated as one unit,
[Chapter 12](/database/part-4-transactions/transactions-and-acid)):

- **Atomicity** — all of a transaction happens, or none of it does. A
  transfer that debits one account must credit the other; no half-states.
- **Consistency** — a transaction moves the database from one valid state
  to another (constraints hold before and after).
- **Isolation** — concurrent transactions don't interfere; each runs as
  if alone ([Chapter 15](/database/part-4-transactions/isolation-levels)).
- **Durability** — once committed, data survives crashes, power loss,
  restarts ([Chapter 16](/database/part-5-durability/write-ahead-log)).

ACID is the contract that lets you *trust* a database with money, orders,
and records. Much of the hardest engineering in this course —
concurrency control, the write-ahead log, recovery — exists to deliver
these four words.

## 5. The cost of the guarantees

Those guarantees aren't free, and understanding their cost is half of
using a database well:

- **Durability** means writes must reach stable storage (disk) before a
  commit is acknowledged — disk is slow, so this shapes the entire
  storage design (the WAL, [Chapter 16](/database/part-5-durability/write-ahead-log)).
- **Isolation** means coordination between concurrent transactions —
  locking or versioning — which adds overhead and can cause contention or
  aborts ([Part IV](/database/part-4-transactions/transactions-and-acid)).
- **Querying flexibility** means maintaining indexes (faster reads,
  slower writes) and optimizing each query (planning cost).

Every database is a set of *trade-offs* among these. "Why is this slow?"
almost always traces to one of these costs. The engine you build will
make specific choices, and seeing the choices makes the trade-offs
legible.

## 6. The landscape: not all databases are relational

Relational/ACID is our focus, but the field is broader, and the
differences are mostly about *which guarantees to relax for what*:

- **Key-value stores** (Redis, RocksDB): a giant map; blazing fast,
  minimal query power.
- **Document stores** (MongoDB): JSON-like documents; flexible schema.
- **Columnar / analytical** (ClickHouse, Parquet-based): store by column
  for fast aggregation over huge datasets (OLAP), vs row stores tuned for
  transactions (OLTP).
- **Graph** (Neo4j): nodes and edges, for relationship-heavy data.
- **NoSQL / distributed** (Cassandra, DynamoDB): trade strict consistency
  for scale and availability ([Part VI](/database/part-6-distributed/replication)).

The same core techniques — storage engines, indexes, logs, replication —
recur across all of them, recombined. Learn the relational engine deeply
and you can read any of the others.

## 7. OLTP vs OLAP

One distinction worth planting early, because it shapes design choices
throughout: databases serve two very different workloads.

- **OLTP** (Online Transaction Processing): many small, fast
  reads/writes touching *few rows* — "place an order," "fetch a user."
  Latency-sensitive, ACID-critical. Row-oriented storage, B-trees.
- **OLAP** (Online Analytical Processing): few huge queries scanning
  *millions of rows* to aggregate — "total revenue by region by month."
  Throughput-oriented. Columnar storage, different execution.

GooseDB is an OLTP engine (the more general teaching vehicle), but we'll
note where OLAP systems diverge. Knowing which workload you have is the
first question in any real database decision.

## 8. What we're going to build

The course assembles GooseDB bottom-up, and each layer answers one of the
problems from §1:

- **Storage** ([Part II](/database/part-2-storage-engines/storage-engine))
  — laying data on disk and indexing it (scale + fast queries).
- **Query processing** ([Part III](/database/part-3-query-processing/relational-model-and-sql))
  — turning SQL into efficient execution (declarative querying).
- **Transactions** ([Part IV](/database/part-4-transactions/transactions-and-acid))
  — isolation + atomicity for concurrent access (concurrency).
- **Recovery** ([Part V](/database/part-5-durability/write-ahead-log)) —
  surviving crashes (durability).
- **Distribution** ([Part VI](/database/part-6-distributed/replication)) —
  scaling beyond one machine.

By the end, "what happens when I run a query?" has a concrete,
mechanical answer at every layer. That's the payoff: a database becomes a
system you understand, not a box you hope works.

> :weightliftinggoose: Anchor the whole course on the guarantees: a
> database promises **durability** (survive crashes), **isolation**
> (concurrent safety), **declarative querying** (say what, not how), and
> it does this **at scale** (data bigger than memory). Every technique
> ahead — pages, B-trees, the buffer pool, the WAL, MVCC, recovery,
> replication — exists to deliver one of those promises. When a chapter
> feels intricate, ask "*which guarantee is this serving, and what does
> it cost?*" That question is the thread through the entire engine.

## What we covered

- Plain files fail at **concurrency, crashes, querying, and scale**; a
  database is the engineering answer to all four.
- A **DBMS** stores and manages data safely; the **relational** model
  (tables/rows/columns + SQL) is our backbone.
- SQL is **declarative** — you state *what*, the **optimizer** chooses
  *how* — decoupling logical queries from physical execution.
- **ACID** (Atomicity, Consistency, Isolation, Durability) is the
  transactional contract that makes a database trustworthy.
- The guarantees have **costs** (disk writes for durability, coordination
  for isolation, index upkeep for fast queries) — the source of most
  performance questions.
- The landscape includes key-value, document, columnar, graph, and
  distributed stores — recombinations of the same core techniques.
- **OLTP** (small fast transactions) vs **OLAP** (big analytical scans)
  shapes design; GooseDB is OLTP.

## What's next

[Chapter 2](/database/part-1-foundations/architecture) — the anatomy of a
database. The layered architecture every DBMS shares, from the SQL
interface down to the disk, so you have a map of the whole system before
we build each layer.
