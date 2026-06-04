---
sidebar_position: 2
title: "Concurrency Control: Locking and 2PL"
---

# Concurrency Control

> Keeping concurrent transactions from corrupting each other. The
> pessimistic approach is **locking**: a transaction must acquire a lock
> before touching data, and **two-phase locking (2PL)** — grow your locks,
> then release them — is the protocol that guarantees **serializability**.
> The price is **deadlocks** and contention.

[Chapter 12](/database/part-4-transactions/transactions-and-acid) defined
**isolation**: concurrent transactions must behave as if run one at a
time. This chapter delivers it the classic way — **locks**. We'll see the
anomalies that arise without control, how locking prevents them, why
**2PL** specifically guarantees correctness, and the deadlocks that come
with it.

## 1. The anomalies without control

Interleave two transactions naively and things break. The classic
anomalies:

- **Lost update**: `T1` and `T2` both read `x=100`, both write based on it;
  one update overwrites the other
  ([Chapter 12](/database/part-4-transactions/transactions-and-acid)).
- **Dirty read**: `T2` reads data `T1` wrote but hasn't committed; `T1`
  then aborts — `T2` read something that never officially existed.
- **Non-repeatable read**: `T1` reads `x`, `T2` updates and commits `x`,
  `T1` reads `x` again and gets a *different* value within the same
  transaction.
- **Phantom**: `T1` runs a query returning a *set* of rows; `T2` inserts a
  new row matching the query; `T1` re-runs it and a "phantom" row appears.

Each is a violation of "as if alone." Concurrency control exists to
prevent them — and the **isolation level**
([Chapter 15](/database/part-4-transactions/isolation-levels)) decides
*which* it prevents.

## 2. Locks: shared and exclusive

The basic tool is the **lock**, acquired before accessing a data item.
Two modes:

- **Shared (S) lock** — for **reading**. Many transactions can hold an S
  lock on the same item simultaneously (concurrent reads are safe).
- **Exclusive (X) lock** — for **writing**. Only **one** transaction can
  hold it, and no S locks may coexist with it.

```
            held: S      held: X
  want S:   ✓ (compatible)   ✗ (wait)
  want X:   ✗ (wait)         ✗ (wait)
```

This is the **lock compatibility matrix**: reads don't block reads, but a
write blocks (and is blocked by) everything else on that item. It's the
"one writer xor many readers" rule again — the same principle that governs
safe concurrency everywhere. A transaction that can't get a lock **waits**
until the holder releases it.

## 3. Locking alone isn't enough: the need for a protocol

Just grabbing locks before each access and releasing them right after does
*not* guarantee serializability. Consider releasing `x`'s lock immediately
after reading it: another transaction can sneak in, modify `x`, and now
your transaction's later steps are based on stale assumptions — a
non-repeatable read slips through.

The problem is the *timing* of releases. To get correctness you need a
**protocol** governing *when* locks may be acquired and released — not just
*that* they're held. That protocol is two-phase locking.

## 4. Two-phase locking (2PL)

**Two-phase locking** splits a transaction's locking into two strict
phases:

```
  locks
  held │        ┌──────────┐
       │       /            \         Phase 1: GROWING — acquire locks,
       │      /              \        never release.
       │     /                \       Phase 2: SHRINKING — release locks,
       │____/                  \___   never acquire.
            growing   |  shrinking
                  (commit point)
```

- **Growing phase**: the transaction acquires locks as needed and **never
  releases** any.
- **Shrinking phase**: once it releases its *first* lock, it may **never
  acquire** another.

This rule — "no acquire after the first release" — is what guarantees
**serializability** ([Chapter 12](/database/part-4-transactions/transactions-and-acid)):
2PL ensures the interleaved execution is *equivalent to some serial
order*. It's a beautiful result: a simple, local discipline on each
transaction yields a global correctness guarantee.

> :nerdygoose: 2PL's guarantee is remarkable: each transaction follows a
> purely *local* rule (don't acquire after releasing), yet the *global*
> schedule of all interleaved transactions is provably equivalent to some
> serial order. The intuition: by the moment a transaction releases its
> first lock, it has already locked *everything* it will ever touch — so
> no other transaction could have interfered with any of its data
> mid-flight. That "lock everything before letting go of anything" creates
> a single instant where the transaction logically "happens." Local
> discipline, global serializability.

## 5. Strict 2PL and commit

Plain 2PL guarantees serializability but allows a subtle problem: if a
transaction releases locks (shrinking) and then **aborts**, others may
have already read its now-rolled-back data — a **cascading abort**. The
fix is **Strict 2PL**, used in practice:

> **Strict 2PL**: hold *all* **exclusive** locks until the transaction
> **commits or aborts**, then release them all at once.

By holding write locks to the very end, no one reads a transaction's
uncommitted writes, so aborts never cascade. **Strict 2PL** gives both
serializability *and* recoverability, which is why real lock-based systems
use it. (Plain 2PL is mostly a theoretical stepping stone.)

## 6. Deadlocks

Locking's unavoidable hazard: **deadlock**. Two transactions each hold a
lock the other needs, and both wait forever:

```
T1: lock(A) ... wants lock(B)   ─┐
T2: lock(B) ... wants lock(A)   ─┘   both wait → deadlock
```

This is the same deadlock the concurrency chapter of any systems course
warns about ([cf. the Rust course](/database/table-of-contents)). The
database must handle it two ways:

- **Deadlock detection**: maintain a **waits-for graph** (who waits on
  whom); a **cycle** = a deadlock. On detecting a cycle, **abort a
  victim** transaction to break it (the victim retries).
- **Deadlock prevention**: order resource acquisition, or use timestamp
  schemes (**wait-die**, **wound-wait**) that abort transactions before a
  cycle can form.

Most databases **detect** (run a cycle check periodically) and **kill a
victim**, returning a "deadlock detected" error — your cue to retry the
transaction. Deadlocks are a fact of lock-based concurrency, not a bug.

## 7. Lock granularity

What does a lock *protect* — a row, a page, a whole table? This is **lock
granularity**, and it's a trade-off:

- **Fine-grained** (row-level): maximum concurrency (different
  transactions lock different rows), but many locks to track (overhead) —
  the manager may **escalate** to coarser locks if there are too many.
- **Coarse-grained** (table-level): few locks, low overhead, but kills
  concurrency (one writer blocks the whole table).

Databases use **multiple granularity locking** with **intention locks**
(e.g. "intent to write some row in this table") so a transaction wanting a
table lock can quickly tell if any row is locked, without scanning every
row lock. The system picks granularity to balance concurrency against
lock-management cost — usually row-level with escalation under pressure.

## 8. The cost of pessimism

Locking is **pessimistic**: it assumes conflicts will happen and prevents
them up front by making transactions **wait**. That has real costs:

- **Contention**: hot data (a popular counter, a sequence) serializes
  transactions queueing for its lock.
- **Reduced concurrency**: writers block readers and vice versa under
  strict 2PL — a long write transaction can stall many reads.
- **Deadlocks**: detected and resolved by aborts, costing retried work.

These costs motivate the alternative: **MVCC**
([Chapter 14](/database/part-4-transactions/mvcc)), where readers and
writers *don't block each other* because readers see an older **version**
instead of waiting. Most modern databases (PostgreSQL, Oracle, MySQL/InnoDB)
are MVCC-based for exactly this reason — but they still use locks for
writes, so 2PL remains essential to understand. Locking is the foundation;
MVCC is the optimization layered on top.

> :weightliftinggoose: Concurrency control delivers **isolation**, and the
> classic way is **locking**: **shared** locks for reads, **exclusive**
> for writes (one writer xor many readers). The protocol that makes it
> *correct* is **2PL** — a **growing** phase (acquire only) then a
> **shrinking** phase (release only); **Strict 2PL** holds write locks
> until commit to avoid cascading aborts. The price is **deadlocks**
> (detected via a waits-for cycle, resolved by aborting a victim — so
> always be ready to **retry**) and **contention**. This pessimism is
> exactly what MVCC, next, sets out to relieve.

## What we covered

- Without control, concurrency causes **lost updates, dirty reads,
  non-repeatable reads, and phantoms** — violations of "as if alone."
- **Locks** come in **shared (S, read)** and **exclusive (X, write)**
  modes; reads don't block reads, writes block everything — a transaction
  **waits** for an unavailable lock.
- Locking *alone* isn't enough; you need a **protocol** governing *when*
  locks are acquired/released.
- **Two-phase locking (2PL)** — a **growing** then **shrinking** phase,
  no acquire after the first release — guarantees **serializability** from
  a purely local rule.
- **Strict 2PL** holds **exclusive** locks until **commit/abort**,
  preventing **cascading aborts** — the version used in practice.
- **Deadlocks** (mutual waiting) are handled by **detection** (waits-for
  cycle → abort a victim) or **prevention** (wait-die/wound-wait); expect
  to **retry**.
- **Lock granularity** (row vs page vs table, with intention locks) trades
  concurrency against overhead.
- Locking is **pessimistic** — waiting, contention, deadlocks — which
  motivates **MVCC** next.

## What's next

[Chapter 14](/database/part-4-transactions/mvcc) — multi-version
concurrency control. Instead of making readers wait for writers, keep
**multiple versions** of each row so readers see a consistent **snapshot**
without locking — the approach behind most modern databases, and how
"readers don't block writers" becomes real.
