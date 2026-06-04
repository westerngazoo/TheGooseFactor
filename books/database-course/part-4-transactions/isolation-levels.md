---
sidebar_position: 4
title: "Isolation Levels and Anomalies"
---

# Isolation Levels and Anomalies

> The dial between safety and speed. Full **serializability** is expensive,
> so SQL defines weaker **isolation levels** — `READ UNCOMMITTED`, `READ
> COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE` — each permitting *some*
> anomalies in exchange for more concurrency. Choosing the right level is
> the most consequential, and most misunderstood, transactional decision.

[Chapters 13–14](/database/part-4-transactions/concurrency-control) showed
the *mechanisms* (locking, MVCC) that provide isolation. This chapter is
about the *contract*: how much isolation you actually get, named by level.
Because perfect isolation costs concurrency, databases let you choose how
much to give up — and getting that choice right (or wrong) shows up
directly in correctness and performance.

## 1. Why levels exist

Serializability ([Chapter 12](/database/part-4-transactions/transactions-and-acid))
is the gold standard — concurrent transactions behave as if run one at a
time — but it's the most expensive to enforce (more locking or more
aborts). For many workloads, that full guarantee is overkill: you can
tolerate certain anomalies in return for far more concurrency.

So the SQL standard defines a **spectrum** of isolation levels, from weak
(fast, anomaly-prone) to strong (safe, costly). You pick per transaction:

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;   -- a common default
```

The level you choose determines which of the anomalies below can bite you.

## 2. The anomalies, recapped

The standard defines levels by **which anomalies they prevent**
([Chapter 13](/database/part-4-transactions/concurrency-control)):

- **Dirty read** — read another transaction's *uncommitted* changes (which
  may be rolled back).
- **Non-repeatable read** — read a row twice in one transaction and get
  different values (another transaction updated it between).
- **Phantom read** — re-run a *range query* and find new rows that another
  transaction inserted.

There are subtler ones too (**lost update**, **write skew** —
[Chapter 14](/database/part-4-transactions/mvcc)), but these three are the
ones the SQL standard's levels are officially defined around.

## 3. The four standard levels

From weakest to strongest, with the anomalies each **allows**:

| Level | Dirty read | Non-repeatable | Phantom |
|-------|:----------:|:--------------:|:-------:|
| **READ UNCOMMITTED** | possible | possible | possible |
| **READ COMMITTED**   | prevented | possible | possible |
| **REPEATABLE READ**  | prevented | prevented | possible* |
| **SERIALIZABLE**     | prevented | prevented | prevented |

Each step up prevents one more class of anomaly:

- **READ UNCOMMITTED**: almost no guarantees — you can even read dirty
  data. Rarely used.
- **READ COMMITTED**: you only see *committed* data, but each statement
  may see a *newer* snapshot — non-repeatable reads happen. A very common
  default (PostgreSQL, Oracle).
- **REPEATABLE READ**: the same rows read twice give the same values
  (a stable snapshot for the transaction); phantoms *may* still appear in
  the standard. MySQL/InnoDB's default.
- **SERIALIZABLE**: full isolation — equivalent to some serial order, no
  anomalies.

(*The asterisk: in practice, MVCC implementations of `REPEATABLE READ`
often prevent phantoms too — see §5.)

## 4. What each level costs

The levels trade safety for concurrency:

- **Lower levels** (`READ COMMITTED`) hold fewer/shorter locks (or use
  per-statement snapshots), so transactions wait less and run more
  concurrently — but you must reason about anomalies in your application.
- **Higher levels** (`SERIALIZABLE`) hold more locks longer (lock-based)
  or abort more transactions (SSI-based), reducing concurrency and forcing
  **retries** — but your application logic can assume perfect isolation.

There's no universally right level; it depends on whether your
transactions are *vulnerable* to a given anomaly. A read-only report can
tolerate `READ COMMITTED`; a balance-transfer with an invariant may need
`SERIALIZABLE`. The skill is matching the level to what each transaction
actually requires.

> :surprisedgoose: A trap that bites real systems: the **default**
> isolation level is usually **not** serializable. PostgreSQL and Oracle
> default to `READ COMMITTED`; MySQL/InnoDB to `REPEATABLE READ`. So unless
> you *explicitly* ask for `SERIALIZABLE`, your transactions can exhibit
> anomalies — and application code that *assumes* "transactions are
> isolated" may be subtly wrong under concurrency. The classic
> **lost-update** and **write-skew** bugs ship in production precisely
> because developers assume more isolation than the default provides.
> Know your database's default, and raise it where correctness demands.

## 5. The standard vs reality: MVCC muddies the names

The SQL standard's level definitions predate MVCC and are defined in terms
of *locking* anomalies — so MVCC databases don't map onto them cleanly:

- **PostgreSQL** `REPEATABLE READ` is actually **snapshot isolation**
  ([Chapter 14](/database/part-4-transactions/mvcc)) — it prevents
  phantoms (stronger than the standard requires) but allows **write skew**
  (which "true" serializability forbids).
- **PostgreSQL** `SERIALIZABLE` uses **SSI** to add full serializability
  on top, at the cost of possible serialization-failure aborts.
- **Oracle** has no true `SERIALIZABLE` in the textbook sense — its
  "serializable" is snapshot isolation.
- Different engines give the *same level name* different real behavior.

The lesson: **the level name doesn't fully tell you the guarantees** —
you must know your specific database's implementation. Two databases set to
"`REPEATABLE READ`" can behave differently. This gap between the standard's
names and engines' MVCC reality is a notorious source of confusion.

## 6. Anomalies the standard misses

The standard's three anomalies aren't the whole story. Two important ones
it omits:

- **Lost update**: two transactions read-modify-write the same row; one
  overwrites the other ([Chapter 12](/database/part-4-transactions/transactions-and-acid)).
  Prevented by `SERIALIZABLE`, by explicit `SELECT ... FOR UPDATE`
  locking, or by atomic `UPDATE ... SET x = x + 1`.
- **Write skew**: two transactions read an overlapping set, each writes a
  *different* row, together violating an invariant
  ([Chapter 14](/database/part-4-transactions/mvcc)). Allowed by snapshot
  isolation; prevented only by true serializability (SSI) or explicit
  locking.

These are why "I'm using `REPEATABLE READ`/snapshot isolation, so I'm safe"
can be false. If your invariant spans *multiple rows* and concurrent
transactions could each keep their half valid while jointly breaking it,
you need `SERIALIZABLE` or explicit locks. Reasoning about *your specific
invariants* matters more than the level's name.

## 7. Practical guidance

How to actually choose:

- **Start with the default** (`READ COMMITTED` on PostgreSQL) — fine for
  most single-row, read-mostly operations.
- **Use explicit row locks** (`SELECT ... FOR UPDATE`) to prevent lost
  updates on read-modify-write of a specific row, without raising the whole
  transaction's level.
- **Prefer atomic statements** (`UPDATE accounts SET balance = balance -
  100`) over read-then-write in app code — the database does it
  atomically.
- **Use `SERIALIZABLE`** when transactions enforce **multi-row
  invariants** that concurrent transactions could jointly violate (write
  skew territory) — and be ready to **retry** on serialization failures.
- **Always handle serialization-failure / deadlock errors** by retrying;
  at higher levels and under MVCC-SSI, aborts are normal, not exceptional.

The meta-rule: understand which anomalies your transaction is *vulnerable*
to, then choose the cheapest level (plus explicit locks) that closes them.

## 8. Isolation in the big picture

Isolation levels close out Part IV's theme — making concurrent execution
safe — by exposing the **trade-off explicitly to you**. The database can't
know whether your transaction is vulnerable to write skew; only you do. So
it offers the dial and sane defaults, and asks you to choose.

This connects back to the guarantees of
[Chapter 1](/database/part-1-foundations/why-databases): isolation is one
of the four ACID promises, and it's the one that's *negotiable*. Atomicity
and durability are usually all-or-nothing (a commit either survives or it
doesn't), but isolation comes in degrees. Mastering those degrees — what
each prevents, what it costs, what your specific database actually does —
is what separates correct concurrent applications from ones with rare,
maddening, data-corrupting bugs. Next, Part V makes commits **durable**:
the write-ahead log and crash recovery.

> :weightliftinggoose: Isolation is the **negotiable** ACID property, set
> by **isolation level**: `READ UNCOMMITTED` → `READ COMMITTED` →
> `REPEATABLE READ` → `SERIALIZABLE`, each preventing one more anomaly
> (dirty → non-repeatable → phantom) at the cost of concurrency. Three
> reflexes: (1) **know your engine's default** (usually *not*
> serializable) and that MVCC makes level *names* misleading; (2) watch
> for **lost update** and **write skew**, which weaker levels allow — close
> them with `SELECT ... FOR UPDATE`, atomic updates, or `SERIALIZABLE`;
> (3) always **retry** on serialization/deadlock errors. Match the level
> to your transaction's actual vulnerabilities.

## What we covered

- Full **serializability** is expensive, so SQL defines weaker **isolation
  levels** trading anomaly-prevention for concurrency.
- The standard's anomalies: **dirty read**, **non-repeatable read**,
  **phantom** (plus the omitted **lost update** and **write skew**).
- The four levels — **READ UNCOMMITTED / READ COMMITTED / REPEATABLE READ
  / SERIALIZABLE** — each prevent successively more anomalies, at rising
  cost (more locking or more aborts).
- **Defaults are usually not serializable** (PostgreSQL/Oracle: READ
  COMMITTED; InnoDB: REPEATABLE READ) — a common source of concurrency
  bugs.
- **MVCC blurs the standard's names**: PostgreSQL's `REPEATABLE READ` is
  snapshot isolation (allows **write skew**); its `SERIALIZABLE` adds SSI;
  same name ≠ same behavior across engines.
- Close **lost update**/**write skew** with explicit locks (`FOR UPDATE`),
  atomic statements, or `SERIALIZABLE` — based on your **invariants**, not
  the level name.
- Always **retry** serialization-failure/deadlock errors; isolation is the
  **negotiable** ACID property — match the level to actual vulnerabilities.

## What's next

That's Part IV. [Part V](/database/part-5-durability/write-ahead-log) turns
to **durability and recovery**: the **write-ahead log** that makes commits
survive crashes (and supports atomicity's undo), then **ARIES**, the
algorithm that brings a database back to a correct state after a crash.
