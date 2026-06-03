---
sidebar_position: 1
title: "Transactions and ACID"
---

# Transactions and ACID

> The unit of trust. A **transaction** groups operations so they happen
> **all-or-nothing**, leave the database consistent, run **isolated** from
> other transactions, and survive crashes once committed. These four
> properties — **ACID** — are the contract that lets you trust a database
> with money and records. This chapter defines them and previews the
> machinery that delivers each.

[Part III](/database/part-3-query-processing/execution) showed how a single
query runs. But real applications run *many* operations *concurrently*,
and machines *crash*. Without protection, a half-finished transfer or two
overlapping updates corrupt your data. The **transaction** is the
abstraction that makes concurrent, crash-prone reality safe — and ACID is
what it promises.

## 1. What is a transaction?

A **transaction** is a sequence of operations treated as a single
**logical unit of work**. The canonical example is a bank transfer:

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- debit
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- credit
COMMIT;
```

These two updates must happen **together**: debit *and* credit, or
*neither*. If the system crashes between them, you must not lose \$100 into
thin air. `BEGIN` starts the transaction; `COMMIT` makes its effects
permanent; `ROLLBACK` (or `ABORT`) discards them entirely. The transaction
is the boundary within which the database guarantees consistency.

## 2. ACID: the four guarantees

A transaction provides four properties, **ACID**:

- **Atomicity** — all operations happen, or none do. No partial
  transactions; a crash or abort leaves *no trace* of an incomplete one.
- **Consistency** — a transaction takes the database from one **valid**
  state to another, preserving all rules (constraints, foreign keys).
- **Isolation** — concurrent transactions don't see each other's
  in-progress work; each runs as if it were alone.
- **Durability** — once `COMMIT` returns, the changes survive crashes,
  power loss, and restarts.

Each is delivered by different machinery, and the rest of Parts IV and V
build them. Let's take them one at a time.

## 3. Atomicity: all or nothing

**Atomicity** means a transaction is indivisible: the bank transfer's two
updates either both take effect or both vanish. If the transaction aborts
(by `ROLLBACK`, a constraint violation, or a crash), any changes it made
must be **undone**.

How? The database can **undo** partial changes using logged **before-images**
— records of what the data was *before* each change
([Chapter 16](/database/part-5-durability/write-ahead-log)). On abort, it
replays those backward, restoring the prior state. Atomicity is thus tied
to the **write-ahead log** and to recovery
([Chapter 17](/database/part-5-durability/crash-recovery)): the log is how
the database "takes back" an incomplete transaction's effects. No
half-states ever become visible.

## 4. Consistency: valid states only

**Consistency** means each transaction moves the database between **valid
states** — states satisfying all declared rules: primary-key uniqueness,
foreign-key references, `CHECK` constraints, `NOT NULL`, and
application-level invariants (a balance can't go negative).

```sql
-- if this would make balance < 0 and there's a CHECK constraint, the
-- transaction is rejected and rolled back — consistency preserved
UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
```

Consistency is partly the database's job (it enforces declared
constraints, aborting violators) and partly the *application's* (defining
the right constraints and writing correct transactions). It's the
"softest" of the four — really a *consequence* of atomicity + isolation +
well-chosen constraints — but it names the crucial idea: the database
never settles into an invalid state.

## 5. Isolation: as if alone

**Isolation** means concurrent transactions don't interfere — each
behaves as though it ran **alone**, even when actually interleaved. Without
it, classic anomalies appear:

```
T1: read balance (100) ──────────────── write balance = 100 - 100 = 0
T2:       read balance (100) ── write balance = 100 + 50 = 150
   → final 150, but BOTH ran; the -100 was lost!  (lost update)
```

The strongest isolation, **serializability**, guarantees the result equals
*some* serial (one-at-a-time) order of the transactions. Achieving it while
still allowing concurrency is the hard problem of **concurrency control**
([Chapter 13](/database/part-4-transactions/concurrency-control),
[Chapter 14](/database/part-4-transactions/mvcc)). Because full isolation
is expensive, databases offer weaker **isolation levels**
([Chapter 15](/database/part-4-transactions/isolation-levels)) that trade
some safety for performance — the most nuanced knob in the whole system.

## 6. Durability: survive the crash

**Durability** means once `COMMIT` returns success, the data is safe —
even if the power dies one millisecond later. The changes are on **stable
storage** and recoverable.

The challenge ([Chapter 7](/database/part-2-storage-engines/buffer-pool)):
data pages live in the buffer pool and are written back *lazily*, so at
commit time the actual data page may still be in volatile memory. The
solution is the **write-ahead log**: before commit returns, the
transaction's changes are recorded in the **log**, which *is* flushed to
disk. If a crash loses the in-memory data page, recovery **replays the log**
to reconstruct the committed change
([Chapter 16](/database/part-5-durability/write-ahead-log)). Durability is
"the log hit the disk," not "the data page hit the disk" — the key
decoupling that makes commits fast *and* safe.

## 7. The cost and the trade-offs

ACID isn't free, and knowing the costs is using databases well:

- **Atomicity + Durability** require logging every change and flushing the
  log at commit — disk I/O on the critical path.
- **Isolation** requires coordinating concurrent transactions (locks or
  versions), causing waiting, contention, and possibly aborts/deadlocks.

So databases let you **dial isolation down**
([Chapter 15](/database/part-4-transactions/isolation-levels)) for more
concurrency, and distributed systems sometimes relax ACID toward
**BASE** (Basically Available, Soft state, Eventual consistency) for scale
and availability ([Part VI](/database/part-6-distributed/replication)).
Every "should this be a transaction?" and "what isolation level?" question
is weighing these costs against the guarantees you actually need.

> :nerdygoose: ACID is really delivered by **two subsystems working
> together**: **concurrency control** (locking or MVCC) provides
> *Isolation*, and the **write-ahead log + recovery** provides *Atomicity*
> and *Durability* (with Consistency falling out of the other three plus
> constraints). That's why Parts IV and V are a pair: the log lets you
> *undo* incomplete work (atomicity) and *redo* committed work
> (durability), while concurrency control keeps simultaneous transactions
> from seeing each other's mess (isolation). Four letters, two mechanisms,
> one trustworthy database.

## 8. The transaction lifecycle and the map ahead

A transaction moves through states:

```
BEGIN → ACTIVE → (PARTIALLY COMMITTED) → COMMITTED
                      ↓ (failure)
                   ABORTED  (changes undone)
```

The **transaction manager** ([Chapter 2](/database/part-1-foundations/architecture))
tracks each transaction's state and coordinates the subsystems. From here,
Part IV details **isolation** — how concurrent transactions are kept from
interfering:

- **Concurrency control: locking & 2PL**
  ([Chapter 13](/database/part-4-transactions/concurrency-control)) — the
  pessimistic approach.
- **MVCC** ([Chapter 14](/database/part-4-transactions/mvcc)) — the
  multi-version approach most modern databases use.
- **Isolation levels** ([Chapter 15](/database/part-4-transactions/isolation-levels))
  — the anomalies and the spectrum from weak to serializable.

Then Part V delivers **atomicity & durability** via the log and recovery.
Together they make the executor of Part III safe in the real world of
concurrency and crashes.

> :weightliftinggoose: A **transaction** is the all-or-nothing unit of
> work, and **ACID** is its contract: **Atomicity** (all or none),
> **Consistency** (valid states only), **Isolation** (as if alone),
> **Durability** (survives crashes once committed). Map each to its
> machinery: A+D come from the **write-ahead log + recovery** (Part V);
> I comes from **concurrency control** — locking or **MVCC** (next
> chapters); C falls out of the rest plus constraints. And remember the
> costs (log flushes, coordination) — they're why isolation is a tunable
> dial, not a fixed setting.

## What we covered

- A **transaction** groups operations into one **logical unit** —
  `BEGIN`...`COMMIT`/`ROLLBACK` — the boundary of database guarantees.
- **ACID**: **Atomicity** (all-or-none), **Consistency** (valid states),
  **Isolation** (as if alone), **Durability** (survives crashes after
  commit).
- **Atomicity** uses logged **before-images** to **undo** partial work on
  abort/crash.
- **Consistency** keeps the database in valid states (constraints +
  correct transactions) — largely a consequence of A, I, and constraints.
- **Isolation** prevents anomalies (lost updates, etc.); the gold standard
  is **serializability**, achieved by concurrency control, dialed via
  isolation levels.
- **Durability** means the **write-ahead log** (not the data page) is on
  disk at commit; recovery **replays** it after a crash.
- ACID has **costs** (log flushes, coordination); isolation is a tunable
  dial, and distributed systems may relax toward **BASE**.
- A+D ← **log + recovery** (Part V); I ← **concurrency control** (next
  chapters); C falls out — two mechanisms deliver four guarantees.

## What's next

[Chapter 13](/database/part-4-transactions/concurrency-control) —
concurrency control with locking. The pessimistic way to provide
isolation: **locks**, **two-phase locking (2PL)**, the anomalies they
prevent, and the **deadlocks** they can cause.
