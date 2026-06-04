---
sidebar_position: 2
title: "Schema Design and Evolution"
---

# Schema Design and Evolution

> The schema is the foundation everything else rests on — get it right and
> queries are natural and data stays consistent; get it wrong and you fight
> it forever. This chapter is **normalization** (and when to deliberately
> break it), **constraints as correctness**, and the genuinely hard part:
> **evolving** a live schema with **migrations** and **online schema
> changes** — without downtime or data loss.

[Chapter 8](/database/part-3-query-processing/relational-model-and-sql)
introduced the relational model and normalization. This chapter is the
*practitioner's* view: how to design a schema that serves your queries and
keeps data correct, and — the part nobody warns you about — how to *change*
that schema after it's in production with millions of rows and live
traffic. Schema evolution is where many teams get badly stuck.

## 1. Normalization, in practice

**Normalization** ([Chapter 8](/database/part-3-query-processing/relational-model-and-sql))
organizes data so each fact lives in exactly **one place**, eliminating
redundancy. The normal forms formalize it via **functional dependencies**
(which columns determine which):

- **1NF**: atomic values, no repeating groups (no comma-separated lists in a
  column).
- **2NF**: no partial dependency on part of a composite key.
- **3NF / BCNF**: no transitive dependencies — non-key columns depend on
  *the key, the whole key, and nothing but the key*.

```
unnormalized:  orders(id, customer_name, customer_email, customer_address, ...)
   → customer_email duplicated across every order; change one, miss the others
normalized:    customers(id, name, email, address)
               orders(id, customer_id, ...)   → join to recombine
```

The payoff: **no update anomalies** (change a customer's email in one place),
**no inconsistency** (one source of truth per fact), smaller storage. The
cost: **joins** ([Chapter 11](/database/part-3-query-processing/execution))
to reassemble data. For OLTP, normalize by default — consistency and cheap
writes are usually worth the join cost.

## 2. Denormalization: deliberately breaking the rules

Sometimes you **denormalize** on purpose — duplicate data to avoid joins —
trading consistency risk for read speed:

```
denormalized:  orders(id, customer_id, customer_name, ...)   ← name copied in
   → reading an order needs no join, but a name change must update every order
```

When it's worth it:

- **Read-heavy hot paths** where the join is the bottleneck and the
  duplicated data rarely changes.
- **Analytics / warehouses** ([Chapter 24](/database/part-7-analytics/columnar-and-olap)),
  where denormalized "wide" or star-schema tables avoid expensive joins over
  huge data.
- **Precomputed aggregates** (a cached `order_count` on `customers`),
  maintained via triggers or application logic
  ([materialized views, Chapter 27](/database/part-7-analytics/streaming-and-materialized-views)).

The danger is **the duplicated data drifting out of sync** — you now must
keep copies consistent (triggers, application discipline, or a materialized
view that maintains it for you). The rule: **normalize until it hurts, then
denormalize until it works** — start normalized for correctness, denormalize
*specific* hot paths only when measurement proves the join is the problem,
and own the consistency cost consciously.

## 3. Constraints as correctness

The schema isn't just storage layout — it's a place to **enforce
correctness**, and the database is far better at it than scattered
application checks. Use constraints liberally:

- **`NOT NULL`**: a column that must have a value — catches a whole class of
  bugs at write time.
- **`UNIQUE`**: no duplicate emails, no two orders with the same number.
- **`FOREIGN KEY`**: referential integrity — an order's `customer_id` *must*
  reference a real customer; the database prevents orphans and dangling
  references.
- **`CHECK`**: domain rules — `price >= 0`, `status IN ('open','closed')`,
  `start_date < end_date`.
- **Primary key**: every row uniquely identifiable.

```sql
CREATE TABLE orders (
  id          bigint PRIMARY KEY,
  customer_id bigint NOT NULL REFERENCES customers(id),
  total       numeric CHECK (total >= 0),
  status      text    NOT NULL CHECK (status IN ('open','paid','shipped'))
);
```

Constraints make invalid data **impossible to insert** — a database-enforced
version of [the Rust course's] "make illegal states unrepresentable," at the
data layer. They're checked for *every* write by *every* code path
(application, migration, manual fix, other service), so they hold even when
application code forgets. Push correctness *into the schema*; don't rely on
every writer to remember the rules.

> :nerdygoose: The deepest schema-design principle is that **the schema is
> the last line of defense for data integrity, and the only one every writer
> shares.** Application code that validates "an order must reference a real
> customer" protects only the paths that remember to call it — and there are
> always more paths than you think (a second service, a migration script, a
> manual `UPDATE` at 2am, a bulk import). A `FOREIGN KEY` constraint
> protects *all* of them, forever, enforced by the database itself. Every
> invariant you can express as a constraint (`NOT NULL`, `UNIQUE`, `CHECK`,
> `FK`) is an invariant that *cannot* be violated, by anyone, ever. Bad data
> is far more expensive to fix than to prevent — so encode the rules where
> nothing can bypass them.

## 4. The hard part: schema evolution

Designing a schema is the easy half. The hard half is **changing it** after
it's live — because the data is huge, the traffic is constant, and you can't
just stop the world. Common changes and their hazards:

- **Add a column**: usually easy *if* nullable / with a cheap default; a
  `NOT NULL` column with a computed default may need to rewrite every row.
- **Add an index**: building an index can **lock** the table against writes
  for the whole build — minutes to hours on a big table (§6).
- **Change a column type / rename**: can require rewriting the whole table,
  and breaks application code expecting the old shape.
- **Drop a column / table**: safe to *stop using*, dangerous to actually
  remove while old code might reference it.

The naive approach — run `ALTER TABLE` and wait — can lock a production table
for an unacceptable duration, taking the application down. Schema evolution
is a *distributed-systems* and *deployment* problem as much as a SQL one:
the schema and the application code change at different times, and both must
keep working throughout.

## 5. Migrations

A **migration** is a versioned, repeatable script that transforms the schema
(and sometimes the data) from one version to the next. Migrations are how
schema changes are managed in practice:

- **Version-controlled**: each migration is a numbered, committed file;
  the schema's history is in source control alongside the code.
- **Forward (and ideally reversible)**: an `up` to apply, a `down` to roll
  back.
- **Run in order, tracked**: a migration tool (Flyway, Liquibase, Rails
  migrations, Django migrations, sqlx, Alembic) records which migrations
  have run, so each applies exactly once across all environments.

```
migrations/
  001_create_users.sql
  002_add_email_index.sql
  003_add_orders_table.sql
```

Migrations make schema changes **reproducible** (the same change applies to
dev, staging, prod identically) and **auditable** (the schema's evolution is
a git history). They're essential infrastructure — but they don't, by
themselves, solve the *locking/downtime* problem (§6). They're the *how to
manage* changes; the next section is *how to make changes safely on live
data*.

## 6. Online schema change

The crux: applying a schema change to a **large, live** table **without
locking it** (no downtime). Big databases offer, or require tooling for,
**online schema changes**:

- **Concurrent index builds**: `CREATE INDEX CONCURRENTLY` (Postgres) builds
  an index without blocking writes (slower, but no lock).
- **Online `ALTER`**: some changes are non-blocking natively (adding a
  nullable column is often instant — just metadata); others need tooling.
- **Copy-and-swap tools** (`pt-online-schema-change`, `gh-ost` for MySQL):
  create a *new* table with the desired schema, copy rows in batches while
  triggers/replication keep it in sync with ongoing writes, then atomically
  **swap** it for the old table. The application sees no downtime; the change
  happens behind a shadow table.

```
gh-ost: make shadow table (new schema) → copy + sync live changes → atomic swap
```

These turn a multi-hour table lock into a background copy with a momentary
swap. Knowing your database's online-DDL capabilities (and limits) is
essential operational knowledge — the difference between a routine deploy and
an outage.

## 7. Zero-downtime: the expand-contract pattern

Because the **schema** and the **application code** deploy at different
moments, a safe schema change uses the **expand-contract** (a.k.a.
parallel-change) pattern — make changes **backward-compatible** at every
step so old and new code both work during the rollout:

```
Rename column `name` → `full_name`, zero downtime:
  1. EXPAND:   add `full_name`; write to BOTH columns; backfill old rows.
  2. MIGRATE:  deploy code that reads `full_name`, still writing both.
  3. CONTRACT: once all code uses `full_name`, stop writing `name`, drop it.
```

The principle: **never make a change that breaks the currently-running code**.
You *add* the new shape, migrate readers, migrate writers, then *remove* the
old shape — each step compatible with the deploy before and after it. This
multi-step dance (expand, migrate, contract) is how teams change schemas on
systems that can never go down. It's slower than a single `ALTER`, but it's
the price of zero downtime — and it's the same backward/forward-compatibility
discipline as evolving any API or data format.

## 8. Schema design as a long game

Step back: a schema is a **long-lived asset** that outlasts features,
rewrites, and teams — so design it for *change*, not just for today:

- **Normalize for correctness** by default; denormalize *specific* hot paths
  with eyes open ([§2](#2-denormalization-deliberately-breaking-the-rules)).
- **Encode invariants as constraints** so bad data can't enter
  ([§3](#3-constraints-as-correctness)).
- **Plan for evolution**: prefer additive changes; use migrations from day
  one; know your online-DDL tools; practice expand-contract for anything
  risky.
- **Avoid premature denormalization** *and* premature over-flexibility (a
  schemaless "everything in a JSON blob" trades query power and integrity
  for a flexibility you may not need).

Good schema design is the highest-leverage, longest-lived decision in a
database application — queries, performance, and integrity all flow from it,
and a bad schema is the most expensive thing to fix later (you must migrate
all the data *and* all the code). Design it carefully, constrain it tightly,
and evolve it methodically. Next: when one well-designed database isn't
enough — scaling and caching.

> :weightliftinggoose: The schema is the foundation and the long game.
> **Normalize for correctness** (one fact, one place — no update anomalies);
> **denormalize** specific hot paths only when measured, owning the
> sync cost. **Encode invariants as constraints** (`NOT NULL`, `UNIQUE`,
> `FK`, `CHECK`) — the database is the only integrity check *every* writer
> shares. And master **evolution**: **migrations** (versioned, in source
> control) for management, **online schema change** (`CONCURRENTLY`, gh-ost)
> to avoid table locks, and the **expand-contract** pattern (add new, migrate
> readers then writers, drop old) for zero-downtime changes that never break
> running code. Design for change; a bad schema is the costliest thing to
> fix.

## What we covered

- **Normalization** (1NF→BCNF, via functional dependencies) puts each fact
  in **one place** — no update anomalies, consistency, at the cost of
  **joins**; normalize OLTP by default.
- **Denormalization** duplicates data to avoid joins (read speed) — for hot
  paths and analytics — at the cost of keeping copies in sync.
- **Constraints** (`NOT NULL`, `UNIQUE`, `FOREIGN KEY`, `CHECK`, PK) enforce
  correctness for **every** writer — push invariants into the schema, the
  shared last line of defense.
- **Schema evolution** is hard on large, live tables: `ALTER` can **lock**
  for a long time and break running code.
- **Migrations** (versioned, tracked, reversible — Flyway/Alembic/etc.) make
  changes reproducible and auditable.
- **Online schema change** avoids locks: `CREATE INDEX CONCURRENTLY`,
  non-blocking `ALTER`s, and copy-and-swap tools (**gh-ost**,
  pt-online-schema-change).
- **Expand-contract** enables zero-downtime changes: add the new shape,
  migrate readers then writers, drop the old — never break running code.
- A schema is a **long-lived asset** — design for correctness *and* change;
  it's the costliest thing to fix later.

## What's next

[Chapter 30](/database/part-8-in-practice/scaling-and-caching) — scaling and
caching. When one database isn't enough: the scaling ladder (vertical → read
replicas → caching → sharding), caching patterns and the hard problem of
**cache invalidation**, connection pooling, and *the order* to apply them
(tune first, shard last).
